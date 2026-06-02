---
name: convex-reactive-backend
title: Convex 响应式后端与实时订阅
description: 当用 Convex 搭建/接入响应式后端，需设计 Schema、编写 TS 函数（query/mutation/action）、做实时订阅、鉴权、文件存储或定时任务时使用；产出可运行的 convex/ 函数、Schema、索引与客户端订阅代码；不适用于传统 SQL/ORM 或非 Convex 的 BaaS。触发词：Convex、响应式后端、实时订阅、useQuery
domain: 研发/backend
triggers: [Convex, convex dev, 响应式后端, 实时订阅, useQuery, useMutation, Convex Schema, Convex 鉴权, convex action, 定时函数 cron]
tags: [convex, 响应式后端, BaaS, TypeScript, 实时订阅, Schema设计, 鉴权, 文件存储, 定时任务, Next.js]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Convex CLI (npx convex), TypeScript, React/Next.js, convex/react, @convex-dev/auth]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 用 Convex 作为后端新建项目，或把 Convex 接入既有 React / Next.js / Angular / Vue / Svelte / React Native 应用。
- 设计 Convex「文档-关系型」数据库 Schema，编写或调试 query / mutation / action。
- 实现实时/响应式数据：query 在底层数据变化时自动重跑并推送到所有连接的客户端。
- 配置鉴权（Convex Auth 原生库，或 Clerk / Auth0 / Better Auth 等第三方），使用文件存储、定时函数（scheduler）与 cron。

不该用边界：
- 需要原生 SQL、复杂 JOIN 或自托管传统数据库 → 用 ORM/SQL 方案，本技能不覆盖。
- 只想对比选型而非落地 Convex（如纯 Firebase / Supabase / Prisma 场景）→ 见互见，不在此重写。
- 单文档超过 1MB 的大二进制 → 必须走文件存储，不要塞进文档。

## 步骤

1. 初始化：`npm install convex` 后运行 `npx convex dev`。它会引导 GitHub 登录、创建项目与部署、生成 `convex/` 目录、实时同步函数，并写入 `.env.local`（`CONVEX_DEPLOYMENT`、`NEXT_PUBLIC_CONVEX_URL`）。`convex/_generated/` 为自动生成，禁止手改。
2. 定 Schema：在 `convex/schema.ts` 用 `defineSchema` / `defineTable` 和验证器 `v` 描述表、字段与索引（普通索引 `.index`、全文 `.searchIndex`、向量 `.vectorIndex`）。
3. 写函数：query 读、mutation 写（ACID 事务、可串行化隔离）、action 调外部 API。给每个函数加 `args` 验证器。
4. 接客户端：用 `ConvexProvider` 包裹应用，组件内用 `useQuery` / `useMutation` / `usePaginatedQuery` 订阅与写入。
5. 进阶：按需加鉴权、文件存储、`ctx.scheduler` 定时任务与 `crons.ts`。
6. 部署：`npx convex deploy`；用 `npx convex env set` 配置环境变量。

## 指令

```bash
npx convex dev          # 开发：监听改动并同步到 dev 部署
npx convex deploy       # 部署到生产
npx convex run tasks:list           # CLI 直接调函数
npx convex import --table tasks data.jsonl
npx convex export --path ./backup
npx convex logs / dashboard
npx convex env set OPENAI_API_KEY sk-...   # 仅 action 内可读 process.env
npx convex env list / unset OPENAI_API_KEY
```

函数能力对照（关键约束）：

| 类型 | 用途 | 读库 | 写库 | 调外部 API | 缓存/响应式 |
| :-- | :-- | :-: | :-: | :-: | :-: |
| Query | 读数据 | ✅ | ❌ | ❌ | ✅ |
| Mutation | 写数据（ACID） | ✅ | ✅ | ❌ | ❌ |
| Action | 副作用 | 经 `runQuery` | 经 `runMutation` | ✅ | ❌ |
| HTTP Action | Webhook/端点 | 经 `runQuery` | 经 `runMutation` | ✅ | ❌ |

## 示例

Schema 与索引（`convex/schema.ts`）：

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  messages: defineTable({
    authorId: v.id("users"),
    channelId: v.id("channels"),
    body: v.string(),
    attachmentId: v.optional(v.id("_storage")),
  })
    .index("by_channel", ["channelId"])
    .searchIndex("search_body", { searchField: "body", filterFields: ["channelId"] }),
});
// 复合索引：等值字段在前、范围字段在后
// 向量索引：.vectorIndex("by_embedding", { vectorField: "embedding", dimensions: 1536 })
```

响应式 query + 用索引（`convex/messages.ts`）：

```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getByChannel = query({
  args: { channelId: v.id("channels") },
  handler: async (ctx, args) =>
    ctx.db.query("messages")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .order("desc").take(50),   // 用 take/paginate，勿对大表裸 collect
});
```

Mutation（多文档自动原子）：

```typescript
export const transferCredits = mutation({
  args: { fromUserId: v.id("users"), toUserId: v.id("users"), amount: v.number() },
  handler: async (ctx, args) => {
    const from = await ctx.db.get(args.fromUserId);
    const to = await ctx.db.get(args.toUserId);
    if (!from || !to) throw new Error("User not found");
    if (from.credits < args.amount) throw new Error("Insufficient credits");
    await ctx.db.patch(args.fromUserId, { credits: from.credits - args.amount });
    await ctx.db.patch(args.toUserId,   { credits: to.credits   + args.amount });
  },
});
```

Action 调外部 API，再经 mutation 回写（action 内不能直接 `ctx.db`）：

```typescript
export const sendEmail = action({
  args: { to: v.string(), subject: v.string(), body: v.string() },
  handler: async (ctx, args) => {
    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ /* ... */ }),
    });
    if (!res.ok) throw new Error("Failed to send email");
    await ctx.runMutation(api.emails.recordSent, { to: args.to, sentAt: Date.now() });
  },
});
```

客户端订阅（React/Next.js，`useQuery` 自动随数据更新）：

```tsx
"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function TaskList() {
  const tasks = useQuery(api.tasks.list);            // undefined = 加载中（非空数据）
  const addTask = useMutation(api.tasks.create);
  if (tasks === undefined) return <p>Loading...</p>;
  return <button onClick={() => addTask({ text: "New task", isCompleted: false })}>Add</button>;
}
```

分页用 `usePaginatedQuery(api.x, {}, { initialNumItems: 20 })`，配合 `.paginate(paginationOpts)`。

鉴权（原生 `@convex-dev/auth`，含 Magic Link/密码/80+ OAuth）：用 `ConvexAuthProvider` 包裹，客户端 `const { signIn } = useAuthActions()` → `signIn("github")`；query 内 `await ctx.auth.getUserIdentity()` 判断身份，未登录返回 `null`。第三方可用 `ConvexProviderWithClerk`。

定时与文件存储：

```typescript
// 一次性：ctx.scheduler.runAfter(delayMs, api.notifications.send, {...})
// convex/crons.ts
import { cronJobs } from "convex/server";
const crons = cronJobs();
crons.interval("clear old logs", { hours: 24 }, api.logs.clearOld);
crons.cron("weekly digest", "0 9 * * 1", api.emails.sendWeeklyDigest);
export default crons;

// 文件：mutation 里 ctx.storage.generateUploadUrl() 取上传 URL，
// 存 storageId（v.id("_storage")），query 里 ctx.storage.getUrl(storageId) 读取。
```

## 注意事项

- 务必定义 Schema 和索引：Schema 提供端到端类型安全，是 Convex 的核心价值；查询优先 `.withIndex()` 而非 `.filter()`（后者全表扫描）。
- 外部 API 只能在 action 调；query/mutation 跑在确定性事务引擎里。action 内禁止直接 `ctx.db`，须经 `ctx.runQuery` / `ctx.runMutation`。
- `process.env` 仅在 action 可读，query/mutation 中为 undefined。
- `Date.now()`、`Math.random()` 在 query/mutation 中安全：Convex 在每次函数执行开始冻结时间。
- 大表勿裸 `.collect()`，用 `.take(N)` 或 `.paginate()`；大二进制走文件存储，单文档上限 1MB。
- 文档引用用 `v.id("tableName")` 而非裸字符串；找不到文档时倾向返回 `null` 而非抛错。
- 防无限循环：避免 action→mutation→调度 action 的环形 `runQuery`/`runMutation` 链。
- 常见排错：query 首渲染返回 `undefined` 属正常（加载态）；mutation 报 Document not found 多因乐观并发下文档被删，应在 mutation 内重读；Schema 推送因存量数据失败时，先迁移数据或对新字段用 `v.optional()`。
- 局限：无原生 SQL、无 SSR（需用 preloading 等模式）、有函数执行时长上限。

## 互见

- 同域可对比的后端/数据方案：Firebase（Firestore）、Supabase（PostgreSQL）、Prisma（ORM）——Convex 是 TypeScript 优先、文档-关系型且内建响应式。
- 前端配套：Next.js App Router、React hooks 模式。
- 鉴权与支付：OAuth/Clerk/Auth0/Convex Auth；Stripe 经 action 与 HTTP webhook 集成。
- 官方资源：docs.convex.dev、stack.convex.dev、github.com/get-convex/convex-backend。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
