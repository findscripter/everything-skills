---
name: sveltekit-fullstack
title: SvelteKit 全栈开发
description: 当用 SvelteKit 搭全栈 Web 应用、需要文件路由/SSR/SSG/API 端点/表单动作时使用；做出可运行的路由、load 数据加载、+server 接口、form actions 与渲染模式配置；不适用于纯 Svelte 组件库、React/Next 项目或非 Web 后端服务；触发词：SvelteKit、+page.svelte、load 函数、form actions、SSR、+server.ts。
domain: 研发/frontend
triggers: [SvelteKit, +page.svelte, load 函数, form actions, SSR, +server.ts, 全栈 Svelte]
tags: [svelte, sveltekit, fullstack, ssr, ssg, typescript, 前端]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [node, npm, sveltekit, typescript]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
# SvelteKit 全栈开发

## 何时使用

- 用 SvelteKit 从零搭建或扩展全栈 Web 应用：需要文件路由、SSR/SSG、collocated 的 API 端点、渐进式表单动作。
- 需要按路由细粒度控制渲染模式（预渲染 / SSR / 关闭 CSR）。
- 把 SPA 迁移到带服务端能力的框架。
- 用户提到 `+page.svelte`、`+layout.svelte`、`load` 函数、`form actions`、`+server.ts` 时。
- 触发词：SvelteKit、+page.svelte、load 函数、form actions、SSR、+server.ts。

不该用的边界：
- 只写纯 Svelte 组件 / 组件库、无路由与服务端 → 用 Svelte，不需要本技能。
- 项目是 React/Next 或 Vue/Nuxt → 框架不匹配，另寻对应技能。
- 纯后端服务（独立 API 网关、微服务、定时任务），不渲染页面 → 用专门后端框架。
- 仅做 CSS/样式 → 交给样式类技能（如 Tailwind）。

## 步骤 / 指令

```
1. 初始化项目
   npm create svelte@latest my-app
   cd my-app && npm install && npm run dev
   提示时选 Skeleton project + TypeScript + ESLint/Prettier。

2. 规划文件路由（src/routes/ 下 +page.svelte 直接映射 URL）
   src/routes/+page.svelte              → /
   src/routes/about/+page.svelte        → /about
   src/routes/blog/[slug]/+page.svelte  → /blog/:slug
   src/routes/shop/[...path]/+page.svelte → /shop/*（catch-all）
   路由组 (group)/ 不产生 URL 段；私有路由用 _ 前缀或 (group)。

3. 加载数据：在页面旁放 load 文件
   - +page.ts        通用（服务端首屏 + 客户端导航都跑）
   - +page.server.ts 仅服务端（可访问 DB / 密钥 / locals）
   用生成的 $types 给 load 返回值与 data prop 标类型。

4. API 端点：+server.ts 导出 GET/POST/... RequestHandler，返回 json()。

5. 数据变更优先用 form actions（+page.server.ts 的 actions），
   表单加 use:enhance 保留渐进增强；校验失败 fail(400,...)，
   成功后 redirect(303,'/path')（POST 重定向必须 303）。

6. 布局与上下文：+layout.svelte 用 <slot/> 渲染子页；
   +layout.server.ts 的 load 注入跨页数据（如 user）。

7. 渲染模式（按路由设页面选项）：
   export const prerender = true;  // 构建期生成静态页（SSG）
   export const ssr = true;        // 默认：每请求服务端渲染
   export const csr = false;       // 关闭客户端 hydration

8. 会话/鉴权用 src/hooks.server.ts 的 handle：
   在 resolve(event) 前把 event.locals.user 填好，load 才读得到。
```

规则：
- 服务端逻辑（DB、鉴权、密钥）只放 `+page.server.ts` / `+server.ts` / `$lib/server/`，绝不在 `.svelte` 里 import。
- 跨路由复用的服务端模块放 `$lib/server/`。
- 错误/跳转用 `@sveltejs/kit` 的 `error()` / `redirect()`，不要返回裸错误对象。

## 示例

load + 页面（服务端取数据，404 用 error）：
```typescript
// src/routes/blog/[slug]/+page.server.ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
  const post = await fetch(`/api/posts/${params.slug}`).then(r => r.json());
  if (!post) error(404, 'Post not found');
  return { post };
};
```
```svelte
<!-- src/routes/blog/[slug]/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  export let data: PageData;
</script>
<h1>{data.post.title}</h1>
<article>{@html data.post.content}</article>
```

API 端点：
```typescript
// src/routes/api/posts/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  const limit = Number(url.searchParams.get('limit') ?? 10);
  return json(await db.post.findMany({ take: limit }));
};
export const POST: RequestHandler = async ({ request }) => {
  const post = await db.post.create({ data: await request.json() });
  return json(post, { status: 201 });
};
```

表单动作（无需客户端 fetch，no-JS 也能用）：
```typescript
// src/routes/contact/+page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const email = data.get('email');
    if (!email) return fail(400, { email, missing: true });
    await sendEmail(String(email));
    redirect(303, '/thank-you');
  }
};
```
```svelte
<!-- src/routes/contact/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';
  export let form: ActionData;
</script>
<form method="POST" use:enhance>
  <input name="email" type="email" />
  {#if form?.missing}<p class="error">Email is required</p>{/if}
  <button type="submit">Subscribe</button>
</form>
```

受保护路由 + hooks 会话中间件：
```typescript
// src/routes/dashboard/+layout.server.ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
export const load: LayoutServerLoad = async ({ locals }) => {
  if (!locals.user) redirect(303, '/login');
  return { user: locals.user };
};
```
```typescript
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { verifyToken } from '$lib/server/auth';
export const handle: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get('session');
  if (token) event.locals.user = await verifyToken(token);
  return resolve(event);
};
```

手动失效重取数据：
```svelte
<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  // invalidateAll() 会重跑当前页所有 load 函数
</script>
<button on:click={() => invalidateAll()}>Refresh</button>
```

## 注意事项

- 安全边界清晰：`+page.server.ts` / `+server.ts` / `$lib/server/` 只在服务端运行，可放 DB 查询、密钥、会话校验；写库前务必校验与清洗表单数据。
- 鉴权 cookie 设 `httpOnly: true` 与 `secure: true`；form actions 内置 CSRF 防护，生产环境不要关 `checkOrigin`。
- 别把敏感状态塞进 store；服务端上下文用 `event.locals` 传递。
- 表单不要漏 `use:enhance`，否则失去渐进增强。
- 常见坑：
  - `Cannot use import statement in a module`：服务端文件须是 `.ts`/`.js`，不是 `.svelte`。
  - 首屏 SSR 时 store 为 `undefined`：用 `load` 返回值（`data` prop）填充，别靠客户端 `onMount`。
  - 表单提交后不跳转：用 `redirect(303, '/path')`，不是普通 `return`（POST 重定向必须 303）。
  - `locals.user` 在 load 里是 `undefined`：在 `hooks.server.ts` 的 `resolve()` 之前设置 `event.locals.user`。
- 本技能不替代环境内的实测、构建与专家评审；输入/权限/成功标准不明时先停下来澄清。

## 互见

- requires：无。
- related：React 阵营的 SSR/SSG（偏好 React 时改用 Next.js App Router 类技能）；样式可搭 Tailwind 类技能。
- combines_with：端到端类型安全的 API 层（如 tRPC）、鉴权模式（可接入 SvelteKit hooks）。

---
采编自 sickn33/antigravity-awesome-skills（MIT），适配重写为中文，非逐字翻译。
