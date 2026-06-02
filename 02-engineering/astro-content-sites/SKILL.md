---
name: astro-content-sites
title: Astro 内容型网站构建
description: 当构建博客/文档/营销页/作品集等内容密集站点且追求 Core Web Vitals 时使用；用 Astro 岛屿架构产出默认零 JS 的 SSG/SSR 站点（含内容集合、按需水合、多框架组件）；不适用于重交互的 SPA 或全栈应用主体；触发词：astro、.astro 文件、client: 指令、content collections、Astro.props、岛屿架构。
domain: 研发/frontend
triggers: [搭建 Astro 博客/文档/营销站, 需要默认零 JS、优化 Core Web Vitals, 处理 Markdown/MDX 内容集合, 出现 .astro / Astro.props / client: 指令 / getStaticPaths, 需要 SSG 静态输出并按页开启 SSR]
tags: [astro, ssg, ssr, islands, content-collections, markdown, mdx, frontend, performance]
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

- 构建博客、文档站、营销页、作品集等内容密集型站点。
- 性能与 Core Web Vitals 是首要目标，希望默认不向浏览器发送 JS。
- 内容主要由 Markdown / MDX 承载，需要类型安全的内容管理。
- 需要 SSG 静态输出，并能对个别动态路由按需启用 SSR。
- 任务涉及 `.astro` 文件、`Astro.props`、内容集合（content collections）、`client:` 水合指令。

不该用的边界：
- 整站是重交互的单页应用（SPA），交互逻辑远多于内容展示——Astro 的零 JS 优势会被抵消，应选 SvelteKit / Next.js。
- 需要 React/Vue 优先的全栈应用主体（复杂状态、实时数据流）。
- 仅做环境特定的部署/测试，本技能不替代环境验证、测试与专家评审；缺少输入、权限、安全边界或验收标准时先停下来澄清。

## 步骤

1. 初始化项目：`npm create astro@latest my-site` → `cd my-site` → `npm install` → `npm run dev`。
2. 按需加集成：`npx astro add tailwind | react | mdx | sitemap | vercel`（分别对应 Tailwind、React 组件、MDX、自动 sitemap.xml、Vercel SSR 适配器）。
3. 遵循目录约定：`src/pages/`（基于文件的路由）、`src/layouts/`（页面壳）、`src/components/`、`src/content/`（类型安全内容集合）、`src/styles/`、`public/`（原样拷贝的静态资源）、`astro.config.mjs`。
4. 写 `.astro` 组件：顶部 `---` 代码栅栏只在服务端运行，下方是模板；`<style>` 默认作用域隔离。
5. 配路由：`index.astro`→`/`，`[slug].astro`→动态，`[...path].astro`→兜底；静态模式下动态路由必须导出 `getStaticPaths`。
6. 用内容集合管理 Markdown/MDX：在 `src/content/config.ts` 用 `defineCollection` + `zod` schema 定义，页面里 `getCollection` 读取。
7. 岛屿水合：UI 框架组件默认渲染为静态 HTML，加 `client:` 指令才发送 JS 并变交互。
8. 需要动态时在 `astro.config.mjs` 设 `output: 'static' | 'server' | 'hybrid'` 并配适配器；个别页面用 `export const prerender = false` 选入 SSR。

## 指令

```bash
# 创建并启动
npm create astro@latest my-site
cd my-site && npm install && npm run dev

# 按需添加集成
npx astro add tailwind        # Tailwind CSS
npx astro add react           # React 组件支持
npx astro add mdx             # MDX 支持
npx astro add sitemap         # 自动 sitemap.xml
npx astro add vercel          # Vercel SSR 适配器
```

`client:` 水合指令（核心约束，按需取用）：
- `client:load` —— 页面加载即水合（首屏交互）。
- `client:visible` —— 滚动进入视口才水合（首屏以下优先用它省 JS）。
- `client:idle` —— 浏览器空闲时水合。
- `client:media="(max-width: 768px)"` —— 满足媒体查询才水合。

## 示例

`.astro` 组件 + 类型化 props（栅栏只在服务端运行）：

```astro
---
// src/components/Card.astro
interface Props { title: string; href: string; description: string; }
const { title, href, description } = Astro.props;
---
<article class="card">
  <h2><a href={href}>{title}</a></h2>
  <p>{description}</p>
</article>
<style>
  /* 自动作用域隔离到本组件 */
  .card { border: 1px solid #eee; padding: 1rem; }
</style>
```

内容集合定义与动态路由渲染：

```typescript
// src/content/config.ts
import { z, defineCollection } from 'astro:content';
const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});
export const collections = { blog };
```

```astro
---
// src/pages/blog/[slug].astro
export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map(post => ({ params: { slug: post.slug }, props: { post } }));
}
const { post } = Astro.props;
const { Content } = await post.render();
---
<h1>{post.data.title}</h1>
<Content />
```

岛屿水合（同一组件，水合与否行为不同）：

```astro
---
import Counter from '../components/Counter.tsx';
import VideoPlayer from '../components/VideoPlayer.svelte';
---
<Counter initialCount={0} />                 <!-- 纯静态 HTML，零 JS -->
<Counter initialCount={0} client:load />     <!-- 加载即水合 -->
<VideoPlayer src="/demo.mp4" client:visible /><!-- 进入视口才水合 -->
```

SSR 配置与 RSS 端点：

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';
export default defineConfig({ output: 'hybrid', adapter: vercel() });
```

```typescript
// src/pages/rss.xml.ts —— 用内容集合生成 RSS
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
export async function GET(context) {
  const posts = await getCollection('blog');
  return rss({
    title: 'My Blog', description: 'Latest posts', site: context.site,
    items: posts.map(p => ({ title: p.data.title, pubDate: p.data.date, link: `/blog/${p.slug}/` })),
  });
}
```

## 注意事项

- 默认保持组件为静态 `.astro`，只对必须交互的部分水合；不要给每个组件加 `client:load`，那会抵消 Astro 的性能优势。
- 首屏以下组件优先 `client:visible` 而非 `client:load`，减少初始 JS。
- 所有 Markdown/MDX 走内容集合，获得类型安全与自动校验。
- 环境变量用 `import.meta.env`，公开变量需加 `PUBLIC_` 前缀；私有变量（无前缀）绝不会发往客户端。不要把密钥放进会用于客户端模板的 `.astro` frontmatter。
- 安全：`.astro` frontmatter 代码只在服务端执行，不暴露给浏览器；SSR 模式下对 `Astro.request` 的所有输入先校验再查库/调 API；用 `set:html` 渲染用户内容前必须做净化（它会绕过自动转义）。
- 平滑导航可加 `astro:transitions` 的 `<ViewTransitions />`，无需做成完整 SPA。
- 常见坑：React/Vue 组件 JS 不执行 → 漏加 `client:` 指令；动态路由静态模式构建失败 → 漏写 `getStaticPaths`；`Astro.props` 类型为 `any` → 在 frontmatter 定义 `Props` 接口即可自动推断；`.astro` 样式默认作用域隔离，仅在有意命中子元素时用 `:global()`；改了 `content/config.ts` 不生效时重启 dev server。

## 互见

- SvelteKit —— 需要响应式 UI 的全栈框架（相对 Astro 的内容侧重）。
- Next.js（App Router）—— 需要 React 优先的全栈框架。
- Tailwind 模式 —— 用 Tailwind CSS 给 Astro 站点做样式。
- 渐进式 Web 应用（PWA）—— 为 Astro 站点添加 PWA 能力。

---
采编自 sickn33/antigravity-awesome-skills（MIT），原作者 suhaibjanjua。
