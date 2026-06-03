---
name: tailwind-css-patterns
title: Tailwind CSS v4 模式与设计令牌
description: 当用 Tailwind v4 搭建样式体系、定义设计令牌或写响应式/容器查询组件时使用；做 CSS-first 配置、令牌分层、深色模式与现代布局并产出可复用样式；不适用于 v3 JS 配置迁移细节、纯原生 CSS 或其他 UI 框架；触发词：tailwind、@theme、容器查询
domain: 研发/frontend
triggers: [Tailwind v4, @theme 设计令牌, 容器查询 @container, 深色模式, OKLCH 颜色, utility-first CSS, CSS-first 配置]
tags: [前端, tailwind, css, 设计令牌, 响应式, 深色模式]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Edit, Write, Read]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 在 Tailwind v4 项目里搭建主题、定义设计令牌（颜色/间距/字体）。
- 需要 CSS-first 配置：把配置从 `tailwind.config.js` 迁到 CSS 的 `@theme` 指令。
- 实现容器查询（`@container`）、深色模式、现代栅格/Flex 布局或 OKLCH 颜色体系。

不该用：
- 不要用于深挖 v3 JS 配置或 v3→v4 完整迁移工程（本条只给原则，不给逐项迁移脚本）。
- 不要用于纯手写原生 CSS 或非 Tailwind 的 UI 框架（如 Bootstrap、MUI）。
- 输出不能替代真实环境的构建验证与设计评审；缺少设计规范或令牌口径时先问清再做。

## 步骤

1. 建立 CSS-first 配置：用 `@theme` 声明令牌，所有令牌自动暴露为 `--*` CSS 变量。v4 配置文件已是可选项。
2. 令牌分三层：Primitive（原始值，如 `--blue-500`）→ Semantic（语义，如 `--color-primary`）→ Component（组件级，如 `--button-bg`）。颜色优先用 OKLCH（感知均匀）。
3. 选响应式策略：页面级布局用视口断点（`md:` 等），组件级响应式用容器查询（与上下文解耦，组件可复用）。遵循移动优先：无前缀写移动端，再用前缀叠加大屏。
4. 配置深色模式：手动切换用 `class`（`.dark` 切换），跟随系统用 `media`，复杂主题用 v4 的 `selector`。
5. 抽组件：同一串 class 出现 3 次以上、或有复杂状态变体时抽离；动态用 React/Vue 组件，静态可用 `@apply`（但克制使用）。

## 指令

- 启用引擎：v4 默认 Oxide（Rust，约 10x 提速）、JIT 常开、原生 CSS 嵌套，无需 PostCSS 插件。
- 扩展 vs 覆盖：新增值用「扩展」，整套替换默认刻度用「覆盖」，项目专有命名用「语义令牌」。
- 性能：避免动态拼接 class（如模板字符串），否则无法被静态提取；未用样式 v4 自动 purge；CI/CD 开启构建缓存。

## 示例

`@theme` 定义令牌（结尾自动生成 `--color-primary` 等变量）：

```css
@theme {
  /* 颜色 - 用语义命名 */
  --color-primary: oklch(0.7 0.15 250);
  --color-surface: oklch(0.98 0 0);
  --color-surface-dark: oklch(0.15 0 0);

  /* 间距刻度 */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 2rem;

  /* 字体 */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

常用模式：

- 容器查询：父级 `@container`，子级 `@sm:`/`@md:`/`@lg:`；需指定时用命名容器 `@container/card`。
- 移动优先列宽：`w-full md:w-1/2 lg:w-1/3`。
- 自适应栅格：`grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))]`；侧栏布局 `grid grid-cols-[auto_1fr]`。
- 深色配色：`bg-white dark:bg-zinc-900`、`text-zinc-900 dark:text-zinc-100`、`border-zinc-200 dark:border-zinc-700`。
- 居中：`flex items-center justify-center`；悬停：`hover:scale-105 transition-transform`。

断点：`sm:`640 / `md:`768 / `lg:`1024 / `xl:`1280 / `2xl:`1536。

## 注意事项

反模式（避免）：
- 到处用任意值 → 应走设计系统刻度。
- 用 `!important` → 应正确处理优先级。
- 用内联 `style=` → 应用工具类。
- 重复长 class 串 → 抽组件。
- v3 配置与 v4 混用 → 应完整迁到 CSS-first。
- 重度依赖 `@apply` → 优先组件化。
- 布局倾向：相比对称三列栅格，更推荐非对称 / Bento 布局。

## 互见

- 研发/前端域内的「响应式布局」「设计系统与令牌」相关条目。

---

采编自 sickn33/antigravity-awesome-skills（MIT）。
