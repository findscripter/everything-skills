---
name: hono-edge-api
title: Hono 边缘 Web 框架
description: 当用 TypeScript 构建可部署到 Cloudflare Workers / Deno / Bun / Node 等运行时的边缘 REST 或 RPC API、BFF 时使用；产出基于 Web 标准的 Hono 路由、中间件、zValidator 校验与 hc RPC 客户端代码骨架；不适用于强依赖 Node 专有 API（fs/path）或需重型框架的场景。触发词：Hono、边缘 API、Cloudflare Workers
domain: 研发/backend
triggers: [Hono, 边缘 API, Cloudflare Workers, Bun/Deno 服务端, hc RPC 客户端, zValidator, c.req / c.json, BFF 层, 从 Express 迁移到边缘, WinterCG 运行时]
tags: [hono, edge, cloudflare-workers, bun, deno, typescript, api, rpc, middleware, zod]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [claude, cursor, gemini]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 构建面向边缘部署（Cloudflare Workers、Deno Deploy）的 REST / RPC API。
- 在 Bun 或 Node.js 上需要轻量但类型安全的服务端框架。
- 搭建低延迟的 BFF（Backend for Frontend）层。
- 从 Express 迁移，但想要更好的 TypeScript 支持与边缘兼容性。
- 用户询问 Hono 路由、中间件、`c.req`、`c.json` 或 `hc()` RPC 客户端。

不该用（负边界）：
- 强依赖 Node 专有 API（`fs`、`path`、`process`）且不打算保持边缘可移植性时。
- 需要重型全功能框架或大量重依赖时——Hono 的价值在于边缘运行时上的极小体积。
- 任务边界、权限、成功标准不明确时：先停下来澄清，不要把产物当作环境验证、测试或专家评审的替代品。

## 步骤

1. 项目初始化。边缘首选 Cloudflare Workers：`npm create hono@latest my-api` 选 `cloudflare-workers`，`npm run dev`（Wrangler 本地）/`npm run deploy`（部署）。Bun/Node：`bun init && bun add hono`。
2. 路由。用 `app.get/post/put/delete` 注册，`c.req.param('id')` 取路径参数、`c.req.query('format')` 取查询串，`'/static/*'` 通配，支持链式 `app.get(...).post(...)`。
3. 中间件。`app.use(path, mw)` 注册，内置含 `logger`、`cors`、`csrf`、`etag`、`cache`、`basicAuth`、`bearerAuth`、`jwt`、`compress`、`bodyLimit`、`timeout`、`prettyJSON`、`secureHeaders`。自定义中间件须 `await next()`，其后的代码在响应回程时执行。
4. 请求/响应。`await c.req.json<T>()`、`c.req.formData()`、`c.req.text()` 解析体；`c.req.header()`、`getCookie(c, ...)` 读头与 Cookie；响应优先用 `c.json()/c.text()/c.html()/c.redirect()`。
5. 校验。用 `@hono/zod-validator` 的 `zValidator('json', schema)`，处理器内 `c.req.valid('json')` 拿到完全类型化的数据。
6. 应用组合。子应用拆到独立文件，`app.route('/posts', posts)` 挂载，根应用可 `.basePath('/api')`。
7. RPC 客户端。服务端 `export type PostsType = typeof posts`，客户端 `hc<PostsType>(...)` 获得端到端类型安全（类 tRPC，但走 fetch 约定）。

## 指令

```bash
# 边缘首选：Cloudflare Workers
npm create hono@latest my-api    # 选 cloudflare-workers
cd my-api && npm install
npm run dev      # Wrangler 本地开发
npm run deploy   # 部署到 Cloudflare

# Bun / Node.js
mkdir my-api && cd my-api
bun init
bun add hono
```

Cloudflare 密钥：非密配置写 `wrangler.toml` 的 `[vars]`，机密用 `wrangler secret put`，切勿硬编码进源码。

## 示例

最小 Bun 应用与路由：
```typescript
import { Hono } from 'hono';
const app = new Hono();
app.get('/', c => c.text('Hello Hono!'));
app.get('/posts/:id', c => {
  const id = c.req.param('id');
  const format = c.req.query('format') ?? 'json';
  return c.json({ id, format });
});
export default { port: 3000, fetch: app.fetch };
```

Zod 校验 + RPC 端到端类型：
```typescript
// server: routes/posts.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const posts = new Hono()
  .get('/', c => c.json({ posts: [{ id: '1', title: 'Hello' }] }))
  .post('/', zValidator('json', z.object({ title: z.string() })), async c => {
    const { title } = c.req.valid('json'); // 完全类型化
    return c.json({ id: '2', title }, 201);
  });
export default posts;
export type PostsType = typeof posts;

// client.ts
import { hc } from 'hono/client';
import type { PostsType } from '../server/routes/posts';
const client = hc<PostsType>('/api/posts');
const { posts } = await client.$get().json();
const newPost = await client.$post({ json: { title: 'New Post' } }).json();
```

Cloudflare Workers 绑定 D1（用 `Bindings` 泛型让 `c.env` 类型安全）：
```typescript
type Bindings = { DB: D1Database; API_TOKEN: string };
const app = new Hono<{ Bindings: Bindings }>();
app.get('/users', async c => {
  const { results } = await c.env.DB.prepare('SELECT * FROM users LIMIT 50').all();
  return c.json(results);
});
```

JWT 鉴权与流式响应：
```typescript
import { jwt, sign } from 'hono/jwt';
app.use('/api/*', jwt({ secret: SECRET }));
app.get('/api/me', c => c.json(c.get('jwtPayload')));

import { streamText } from 'hono/streaming';
app.get('/stream', c => streamText(c, async s => {
  for (const chunk of ['Hello', ' ', 'World']) { await s.write(chunk); await s.sleep(100); }
}));
```

## 注意事项

最佳实践：
- 用路由分组（子应用）把处理器拆进独立文件：`app.route('/users', usersRouter)`；子路由内部不要重复前缀。
- 所有请求体、查询、路径参数都用 `zValidator` 校验。
- Workers 绑定用 `Bindings` 泛型标注；中间件用 `Variables`/`Bindings` 泛型保持 `c.get()` 类型安全。
- 前后端同仓时优先用 `hc` RPC 客户端；响应优先 `c.json()/c.text()` 而非裸 `new Response()`。

安全：
- 使用请求数据前先 `zValidator` 校验；服务 HTML/表单的变更端点启用内置 `csrf`。
- `bearerAuth`/`jwt` 须服务端验证 token，绝不信任客户端传来的用户 ID；对鉴权、改密等敏感端点做限流。

常见坑：
- 处理器返回 `undefined` 导致空响应——务必 `return c.json(...)`，不要只调用不 return。
- 中间件后置逻辑没生效——把后置代码放在 `await next()` 之后。
- Node 上 `c.env` 为 undefined——`env` 绑定仅存在于 Workers，Node 用 `process.env`。
- 路由 404——确认 `app.route('/prefix', sub)` 前缀与客户端调用一致，子路由不要重复前缀。

局限：仅在任务明确落在上述范围内时使用；产物不能替代针对具体环境的验证、测试与专家评审。

## 互见

- `cloudflare-workers-expert`——Cloudflare Workers 平台细节深挖。
- `trpc-fullstack`——TypeScript 全栈的另一种 RPC 方案。
- `zod-validation-expert`——配合 `@hono/zod-validator` 的 Zod schema 模式。
- `nodejs-backend-patterns`——需要 Node 专有（非边缘）后端时。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
