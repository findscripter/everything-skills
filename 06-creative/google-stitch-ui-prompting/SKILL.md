---
name: google-stitch-ui-prompting
title: Google Stitch UI 设计：AI 界面提示词工程
description: 当用 Google Stitch（Gemini 驱动的 Labs UI 生成器）由文字/草图生成 Web 或移动端界面时使用；做提示词工程，产出具体、含视觉风格与功能要求的可执行提示词及迭代/导出方案；不适用于手写生产代码、做交互动效实现或替代真人评审。触发词：Stitch、UI 提示词、文字转界面、界面生成、导出 Figma/HTML。
domain: 创意/design
triggers: [用 Google Stitch 生成 UI, 写界面/UI 提示词, 文字或草图转界面设计, 把 Stitch 设计导出到 Figma 或 HTML, 多屏 App 流程原型, AI 界面提示词工程]
tags: [google-stitch, ui设计, 提示词工程, ai生成界面, 原型设计, figma, 前端, 创意]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Google Stitch, Figma, HTML/CSS]
requires: []
related: [stitch-design-system-taste, stitch-iterative-build-loop, magic-ui-component-generator, high-end-visual-design]
combines_with: [design-dev-handoff, web-artifacts-builder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 用 **Google Stitch**（Google Labs 出品、Gemini 2.5 Flash 驱动的实验性 UI 生成器）把文字描述或草图/截图转成 Web、移动端界面时。
- 需要规划多屏 App 流程、响应式布局，并导出到 HTML/CSS、Figma 或代码片段时。
- 现有界面要做定向迭代（注释微调、生成变体、渐进细化）时。

**不该用的边界：**
- 不要把 Stitch 产出当成可直接上线的成品——它是起点，需人工重构、补无障碍属性、优化资源后才能生产。
- 不负责手写/实现交互动效与框架代码，也不替代环境内的测试与专家评审。
- 输入、权限、安全边界或验收标准缺失时，先停下来问清，不要硬编。

## 步骤

1. **定位与上下文**：一句话写清「为谁、做什么屏/组件」，如「SaaS 分析平台的仪表盘」。
2. **列关键功能**：用要点列出组件与具体细节（指标卡、折线图、活动流、快捷按钮）。
3. **定视觉风格**：色板（主色+点缀色）、设计调性（极简/现代/玻璃拟态/活泼）、排版、留白密度。
4. **指定平台与响应式**：移动/平板/桌面/响应式，必要时给断点（如 320px→1440px）。
5. **补功能要求**：按钮动作、表单校验、导航模式、加载态、空态、错误处理。
6. **生成并确认**：多屏时 Stitch 会在生成前请你确认，核对后再产出。
7. **迭代**：注释微调 →（按需）生成变体 → 渐进细化。
8. **导出与收尾**：核对断点、对比度、交互态、命名后导出，再做生产级重构。

## 指令

**提示词模板：**
```
[屏/组件类型] for [用户/场景]

Key Features:
- [功能1，含具体细节]
- [功能2，含具体细节]
- [功能3，含具体细节]

Visual Style:
- [色彩方案]
- [设计调性]
- [布局方式]

Platform: [Mobile/Web/Responsive]
```

**核心原则（务必遵守）：**
- 越具体越好：泛泛的提示得到泛泛的结果。
- 永远带视觉方向：色板 + 调性 + 布局，避免「AI 味」通用输出。
- 多屏用要点逐屏列清。
- 善用设计术语：hero section、card layout、glassmorphic、bento grid、kanban，帮 Stitch 准确理解意图。
- 描述交互态（hover、点击、过渡）让设计更完整。
- 拆成可复用组件思考（header、card、form）。

## 示例

**有效 vs 无效（对照）：**
```
✗ Create a dashboard
✓ Member dashboard with course modules grid, progress tracking bar,
  and community feed sidebar using purple theme and card-based layout
```

**完整模板示例：**
```
Dashboard for SaaS analytics platform

Key Features:
- Top metrics cards showing MRR, active users, churn rate
- Line chart for revenue trends (last 30 days)
- Recent activity feed with user actions
- Quick action buttons for reports and exports

Visual Style:
- Dark mode with blue/purple gradient accents
- Modern glassmorphic cards with subtle shadows
- Clean data visualization with accessible colors

Platform: Responsive web (desktop-first)
```

**多屏流程：**
```
Fitness tracking app with:
- Onboarding screen with goal selection
- Home dashboard with daily stats and activity rings
- Workout library with category filters
- Profile screen with achievements and settings
```

**迭代三招：**
- 注释微调（annotate to edit）：「Make this button larger and use primary color」「Add more spacing between these cards」——只改注释区域，无需重写整条提示。
- 生成变体：「Generate 3 variants of this hero section: 1. Image-focused 2. Text-heavy 3. Video background」。
- 渐进细化：先 `E-commerce homepage`，再 `Add featured products section with 4-column grid and hover effects`，再调色板与 banner。

**反模式 → 改法：**
```
✗ Make a nice website
✓ Portfolio website for photographer with full-screen image gallery,
  project case studies, and contact form. Minimalist black and white
  aesthetic with serif typography.
```

## 注意事项

- **导出前**：核对响应式断点、色彩对比度（无障碍）、交互态是否定义、组件命名与结构。
- **导出后**：按生产标准重构代码、补语义化 HTML 与 ARIA/alt、优化图片资源、补动效与微交互。
- 导出格式：HTML/CSS（语义化标记）、Figma（Paste to Figma 接入设计系统）、组件级代码片段。
- 典型工作流：Stitch → Figma → 代码（设计系统交付）；Stitch → HTML → React/Vue/Svelte 组件。
- 多断点（移动/平板/桌面）都要验证；在提示里就提及对比度、字号、触控目标尺寸等无障碍要求。
- 记住：Stitch 加速探索与确定视觉方向，最终仍需人的判断与生产标准把关。

## 互见

- 创意/misc 域内的视觉与原型类技能。
- Figma、前端框架（React/Vue/Svelte）相关组件落地技能。

---
采编自 sickn33/antigravity-awesome-skills（MIT License）。
