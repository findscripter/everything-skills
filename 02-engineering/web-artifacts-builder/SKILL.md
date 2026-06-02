---
name: web-artifacts-builder
title: Web 制品构建器（React/Tailwind/shadcn 单文件产物）
description: 当需要为 claude.ai 构建含状态管理/路由/shadcn 组件的复杂多组件 HTML 制品（artifact）时使用；用脚手架初始化 React+TS+Vite 工程并打包为单文件 bundle.html 产物；不适用于简单的单文件 HTML/JSX 制品；触发词：web artifact、artifacts、复杂制品、shadcn、单文件HTML、bundle.html、React制品
domain: 研发/frontend
triggers: [web artifact, artifacts, 复杂制品, shadcn, 单文件HTML, bundle.html, React制品]
tags: [frontend, react, typescript, vite, tailwind, shadcn-ui, parcel, artifact, bundle]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [bash, pnpm, vite, parcel, tailwindcss, shadcn/ui, html-inline, react, typescript]
requires: []
related: [frontend-design, canvas-design, webapp-testing]
combines_with: [frontend-design, webapp-testing]
license: Apache-2.0
source: anthropics/skills
source_license: Apache-2.0
---
## 何时使用

用于为 claude.ai 构建**复杂、多组件**的 HTML 制品（artifact），尤其当制品需要：状态管理、客户端路由，或大量 shadcn/ui 组件时。技术栈固定为 React 18 + TypeScript + Vite + Tailwind CSS 3.4.1 + shadcn/ui，最终用 Parcel 打包并内联成单个自包含的 `bundle.html`，可直接作为 artifact 分享给用户。

**不该用的边界：**
- 简单的单文件 HTML/JSX 制品——直接手写即可，引入这套工程链反而增加成本。
- 非 claude.ai artifact 场景的常规 Web 工程（不需要内联成单文件）。
- 仅做静态视觉/设计稿，无组件交互逻辑——优先看「互见」中的设计类技能。

环境要求：Node.js ≥ 18（脚本会自动检测；Node 18 会把 Vite 固定到 5.4.11，Node 20+ 用 latest）；需要 `bash` 执行脚本，未装 `pnpm` 时脚本会自动 `npm install -g pnpm`。脚本目录需包含 `shadcn-components.tar.gz`（预置 40+ 组件）。

## 步骤

1. **初始化工程**——运行脚手架，生成已配好的 React 工程。
2. **开发制品**——编辑生成的源码（`src/`），用 `@/` 路径别名导入 shadcn 组件。
3. **打包为单文件**——运行打包脚本，产出 `bundle.html`。
4. **分享产物**——把 `bundle.html` 作为 artifact 发给用户查看。
5. **（可选）测试/可视化**——仅在必要或用户要求时进行。

> 重要：通常**不要**前置测试，这会拖慢「请求 → 看到成品」的链路。先呈现制品，待用户要求或出现问题时再测。

指令：

```bash
# 步骤 1：初始化（在 skill 的 scripts/ 上下文中执行）
bash scripts/init-artifact.sh <project-name>
cd <project-name>

# 该脚本完成：React+TS（Vite）、Tailwind 3.4.1 + shadcn 主题、
#   @/ 路径别名、预置 40+ shadcn 组件、Radix UI 全量依赖、
#   .parcelrc 打包配置、Node 18+ 兼容（自动锁定 Vite 版本）

# 步骤 2：本地开发预览
pnpm dev

# 步骤 3：打包为单文件 artifact（在项目根目录执行）
bash scripts/bundle-artifact.sh
# 产出 bundle.html —— 所有 JS/CSS/依赖均已内联
```

`bundle-artifact.sh` 内部：安装 `parcel @parcel/config-default parcel-resolver-tspaths html-inline` → 生成带路径别名解析的 `.parcelrc` → `parcel build index.html --no-source-maps` → 用 `html-inline` 把 `dist/index.html` 内联为 `bundle.html`。前提：项目根目录必须有 `index.html` 入口。

## 设计与风格指令（务必遵守）

为避免所谓「AI slop」（廉价 AI 既视感），**避免**：过度居中布局、紫色渐变、千篇一律的统一圆角、Inter 字体。追求有层次、有差异化的版式。

## 示例

```tsx
// 用 @/ 别名导入预置 shadcn 组件
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'

export default function App() {
  return (
    <Card>
      <CardHeader><CardTitle>仪表盘</CardTitle></CardHeader>
      <CardContent>
        <Dialog>
          <DialogTrigger asChild><Button>打开</Button></DialogTrigger>
          <DialogContent>内容</DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
```

预置组件（40+）涵盖：accordion、alert、avatar、badge、button、calendar、card、carousel、checkbox、command、context-menu、dialog、drawer、dropdown-menu、form、hover-card、input、label、menubar、navigation-menu、popover、progress、radio-group、resizable、scroll-area、select、separator、sheet、skeleton、slider、sonner、switch、table、tabs、textarea、toast、toggle、toggle-group、tooltip 等。

## 注意事项

- **入口约束**：打包脚本要求项目根目录存在 `index.html`，否则报错退出。
- **Node 版本**：< 18 直接报错退出；18 ≤ 版本 < 20 时 Vite 锁定 5.4.11，20+ 用 latest。
- **包管理器**：统一用 `pnpm`；缺失时脚本自动全局安装。
- **路径别名**：`@/*` → `./src/*`，已在 `tsconfig.json`、`tsconfig.app.json`、`vite.config.ts` 三处配好；打包阶段由 `parcel-resolver-tspaths` 负责解析，勿擅自改动。
- **主题系统**：基于 CSS 变量 + `darkMode: ["class"]`，含完整 light/dark 配色与 `--radius` 等令牌，新增样式应复用这些变量而非硬编码颜色。
- **不要前置测试**：优先交付，按需再测，降低交付延迟。
- 组件文档参考：https://ui.shadcn.com/docs/components
- 许可：源技能为 Apache-2.0，本条目为忠实转写的中文适配版。

## 互见

- frontend-design：先确定视觉/交互设计方向，再用本技能落地为可交互制品。
- canvas-design：偏静态/平面设计稿场景的替代选择。
- webapp-testing：步骤 5 可选测试阶段，用其在浏览器中验证 `bundle.html` 行为。
