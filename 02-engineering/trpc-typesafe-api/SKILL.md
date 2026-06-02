---
name: trpc-typesafe-api
title: tRPC 端到端类型安全 API
description: 当用 TypeScript 单仓前后端（Next.js/Remix/Express+React）需要免 Schema、免代码生成的端到端类型安全 API，或为已有 tRPC 加鉴权中间件、订阅、SSR 调用时使用；做 router/procedure 设计、Zod 输入校验、双 context 工厂、protectedProcedure、客户端 React Query 接线并产出可落地代码；不适用于跨语言/异构客户端、纯 REST/GraphQL 契约、裸 SQL 或 ORM 调优。触发词：tRPC、router、procedure、Zod、createTRPCContext、protectedProcedure、useQuery
domain: 研发/backend
triggers: [tRPC, router, procedure, query, mutation, subscription, Zod 输入校验, createTRPCContext, createServerContext, protectedProcedure, middleware, fetchRequestHandler, createTRPCReact, useQuery, useMutation, createCallerFactory, AppRouter, httpBatchLink, wsLink, 类型安全 API]
tags: [trpc, typescript, api, type-safety, nextjs, react, zod, react-query, fullstack, 后端, 研发]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Grep, Glob, Bash, Edit, Write]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：

- 用 TypeScript 搭建前后端同仓的全栈应用（Next.js、Remix、Express + React），希望服务端类型直接流到客户端，调用即自动补全、编译期校验、重构安全。
- 想要端到端类型安全、又不愿背 REST/GraphQL 的 Schema 或代码生成负担。
- 为已有 tRPC 项目新增实时订阅（subscription / WebSocket）。
- 设计多级中间件（鉴权、限流、租户隔离）挂到 procedure 上。
- 把现有 REST/GraphQL 接口增量迁移到 tRPC。

不该用：

- 客户端与服务端不共享 TypeScript 类型（移动原生、第三方异构调用方、跨语言）—— tRPC 的类型流失效，应给出 OpenAPI/GraphQL 等显式契约。
- 需求是裸 SQL 调优或 ORM（Prisma 等）建模，转交对应专项。
- 仅需对外暴露公开稳定的 HTTP 契约（公共 API、Webhook 回调）。

## 核心概念

- **Router / Procedure**：router 把相关 procedure 分组（≈端点）。procedure 是类型化函数：`query` 读、`mutation` 写、`subscription` 实时流。
- **Zod 输入校验**：所有 procedure 输入用 Zod 校验，handler 里拿到的是已校验、已推导类型的 `input`，无需手动解析。
- **Context**：每请求构建一次的共享状态（auth session、db 客户端、headers）。**关键：Next.js App Router 与 Pages Router 必须用不同的 context 工厂**——App Router handler 收到的是 fetch `Request`，不是 Node 的 `NextApiRequest`。
- **Middleware**：在 procedure 前链式执行，用于鉴权、日志、上下文增强，可为下游 procedure 收窄/扩展 context 类型。

## 步骤 / 指令

1. 安装并初始化 tRPC 实例与可复用构建器（`router` / `publicProcedure` / `middleware`），在 `errorFormatter` 里透出 Zod 扁平化错误。
2. 定义**两个 context 工厂**：`createTRPCContext`（HTTP handler 用，接 `FetchCreateContextFnOptions`）与 `createServerContext`（Server Component / RSC / cron 等服务端直调用，无 HTTP 请求）。`Context` 类型从 `createTRPCContext` 返回值推导。
3. 写鉴权 middleware（`enforceAuth`）：session 缺失抛 `TRPCError({ code: 'UNAUTHORIZED' })`，并在 `next({ ctx })` 里收窄 `session` 为非空，导出 `protectedProcedure = t.procedure.use(enforceAuth)`。
4. 按领域拆 router（post、user、billing…），public 用 `publicProcedure`、需登录用 `protectedProcedure`，每个 procedure 用 `.input(z....)` 校验。
5. 在 `root.ts` 合并为 `appRouter`，并 **只导出类型** `export type AppRouter = typeof appRouter`（客户端永不 import `appRouter` 实例）。
6. 挂载 API handler（App Router）：用 `fetchRequestHandler` + fetch 版 context 工厂，导出为 `GET` / `POST`。
7. 客户端接线：`createTRPCReact<AppRouter>()` 建 `trpc`，用 `httpBatchLink` 配 `QueryClientProvider` 包裹应用。订阅需 `splitLink` 把 subscription 路由到 `wsLink`、query/mutation 到 `httpBatchLink`。

## 示例

安装：

```bash
npm install @trpc/server @trpc/client @trpc/react-query @tanstack/react-query zod
```

实例与 Zod 错误透出（`src/server/trpc.ts`）：

```typescript
import { initTRPC, TRPCError } from '@trpc/server';
import { type Context } from './context';
import { ZodError } from 'zod';

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;
```

双 context 工厂（`src/server/context.ts`）：

```typescript
import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { auth } from '@/server/auth';
import { db } from './db';

// App Router Route Handler 用：opts.req 是 fetch Request
export async function createTRPCContext(opts: FetchCreateContextFnOptions) {
  const session = await auth();
  return { session, db, headers: opts.req.headers };
}

// Server Component / RSC / cron 直调用：无 HTTP 请求，直接 auth()
export async function createServerContext() {
  const session = await auth();
  return { session, db };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
```

鉴权中间件与受保护 procedure：

```typescript
const enforceAuth = middleware(({ ctx, next }) => {
  if (!ctx.session?.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
  return next({ ctx: { session: { ...ctx.session, user: ctx.session.user } } });
});

export const protectedProcedure = t.procedure.use(enforceAuth);
```

带分页游标的 router（`src/server/routers/post.ts` 节选）：

```typescript
export const postRouter = router({
  list: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      cursor: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const posts = await ctx.db.post.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: 'desc' },
      });
      const nextCursor = posts.length > input.limit ? posts.pop()!.id : undefined;
      return { posts, nextCursor };
    }),

  create: protectedProcedure
    .input(z.object({ title: z.string().min(1).max(200), body: z.string().min(1) }))
    .mutation(async ({ ctx, input }) =>
      ctx.db.post.create({ data: { ...input, authorId: ctx.session.user.id } })
    ),
});
```

合并根 router 并只导出类型（`src/server/root.ts`）：

```typescript
export const appRouter = router({ post: postRouter, user: userRouter });
export type AppRouter = typeof appRouter; // 客户端只 import 这个 type
```

App Router handler（`src/app/api/trpc/[trpc]/route.ts`）：

```typescript
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/root';
import { createTRPCContext } from '@/server/context';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: (opts: FetchCreateContextFnOptions) => createTRPCContext(opts),
  });

export { handler as GET, handler as POST };
```

客户端组件查询 + mutation 后失效缓存：

```typescript
'use client';
import { trpc } from '@/utils/trpc';

// 查询
const { data, isLoading, error } = trpc.post.list.useQuery({ limit: 10 });

// mutation：onSuccess 里 invalidate 触发 React Query 重取
const utils = trpc.useUtils();
const createPost = trpc.post.create.useMutation({
  onSuccess: () => utils.post.list.invalidate(),
});
```

服务端调用方（Server Component / SSR）—— 用 `createServerContext`，避免造空请求对象：

```typescript
import { createCallerFactory } from '@trpc/server';
import { appRouter } from '@/server/root';
import { createServerContext } from '@/server/context';

const createCaller = createCallerFactory(appRouter);
const caller = createCaller(await createServerContext());
const { posts } = await caller.post.list({ limit: 20 });
```

实时订阅（节选）：服务端用 `observable` 包裹 `EventEmitter`，客户端 `trpc.notification.onNew.useSubscription(undefined, { onData })`，客户端配置需 `wsLink`。

## 注意事项

最佳实践：

- 只从服务端导出 `AppRouter` **类型**，客户端用 `import type { AppRouter }`，绝不 import `appRouter` 实例。
- HTTP handler 用 `createTRPCContext`、Server Component / caller 用 `createServerContext`，两个工厂分开。
- 所有输入用 Zod 校验（含分页游标、ID），不信任裸 `input`。
- 按领域拆 router，在 `root.ts` 合并；中间件里扩展 context，避免一请求多次查库。
- mutation 后用 `utils.<router>.<procedure>.invalidate()` 保持缓存新鲜。
- 客户端实例按 provider 创建，勿全局共享（避免陈旧闭包）。

安全：

- 鉴权一律在 `protectedProcedure` / middleware 强制执行，绝不只靠客户端校验。
- 用 `TRPCError` 返回公开安全的 `message`，内部错误细节与堆栈只留服务端。
- 公开 procedure 用 middleware 限流防滥用。

常见坑：

- protectedProcedure 里 session 恒为 `null`：检查 `createTRPCContext` 是否调用了正确的服务端 `auth()`，且 App Router handler 没有用 `as any` 塞 Pages Router 的 `req/res`。**禁止用 `as any` 强转 context**——类型不匹配会在 auth/session 取值返回 undefined 时变成运行时崩溃。
- Server Component caller 鉴权查询失败：用 `createServerContext()`，别给 `createContext` 传空对象或 `{} as any`。
- `Type error: AppRouter is not assignable to AnyRouter`：客户端用 `import type` 导入 `AppRouter`，不要导入整个模块。
- mutation 后 UI 不更新：在 `onSuccess` 调 `invalidate()`。
- `Cannot find module '@trpc/server/adapters/next'`：App Router 用 `@trpc/server/adapters/fetch` + `fetchRequestHandler`，`nextjs` adapter 仅限 Pages Router。
- 订阅连不上：需 `splitLink` 把 subscription 走 `wsLink`、query/mutation 走 `httpBatchLink`。
- 别把业务逻辑写进 route handler，留在 procedure 或 service 层。

## 互见

- related：`nestjs-expert` —— 另一条 Node 后端路线，需要面向公开/异构客户端的契约时可对比选型
- related：`react-state-management` —— tRPC 客户端基于 React Query，服务端状态缓存与失效策略相通
- combines_with：`prisma-orm-expert` —— procedure handler 里常用 Prisma 作为 `ctx.db`，配合做类型安全的数据访问层

---

采编自 sickn33/antigravity-awesome-skills（MIT）。
