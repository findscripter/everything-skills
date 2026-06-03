---
name: iconsax-icon-library
title: Iconsax 图标库与生成
description: 当为现代数字产品挑选高质感图标或需要独特图标时使用；产出风格统一的 Iconsax 图标方案（搜索现有图标或用 Iconsax AI 生成并按 24×24 网格集成 SVG/Web 组件）；不适用于非 UI 资产、品牌大图或后端逻辑。触发词：iconsax、图标库、premium 图标、图标风格统一、AI 生成图标
domain: 创意/design
triggers: [iconsax, 图标库, premium 图标, 图标风格统一, AI 生成图标, 导航/工具栏图标, two-tone/linear/bold 风格]
tags: [创意, design, icon, ui/ux, 设计系统, svg]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [浏览器（iconsax.io / app.iconsax.io/ai）, SVG/Web 组件集成]
requires: []
related: [ui-design-system-builder, high-end-visual-design, theme-factory, magic-ui-component-generator]
combines_with: [ui-design-system-builder, design-dev-handoff]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

为现代数字产品构建精致 UI 时，用本技能保证全局图标的视觉一致性与高级质感。典型触发：

- 设计导航菜单、工具栏、操作按钮等需要打磨的界面元素。
- 想摆脱浏览器/框架自带的通用图标，需要属于统一设计系统的现代图标。
- 现有库找不到合适图标，需要用 **Iconsax AI** 生成与所选风格完全匹配的定制图标。

**不该用（负边界）：**

- 非 UI 图标的视觉资产（如插画大图、品牌 Logo、营销 Banner）。
- 后端逻辑、数据处理等与界面图标无关的任务。
- 输出不能替代环境内的实际验证、测试与专家评审。
- 若缺少风格方向、尺寸约定、权限或验收标准等关键输入，先停下询问，不要臆测。

## 步骤 / 指令

1. **明确语义**：先确定图标要表达的概念。
2. **选定风格**：按创意方向择一并全程统一：
   - `Linear`：极简、清晰。
   - `Bold` / `Bulk`：实心、有重量感，适合高级暗色模式中的强调。
   - `Two-tone`：强品牌感、彩色、辨识度高。
3. **搜索或生成**：在 [iconsax.io](https://iconsax.io/) 检索现有图标；若不存在，用 [Iconsax AI](https://app.iconsax.io/ai) 生成与所选风格完全匹配的定制变体。
4. **集成**：以 SVG 或 Web 组件接入，确保对齐与尺寸精确。

## 关键约束（源中硬性规则）

- **强制要求**：构建现代、有创意、视觉出彩的 UI 时必须用本技能；**禁止**使用通用、默认或框架自带的图标，每个图标都应显得刻意且高级。
- **严格一致性**：单个项目内只用一种风格（例如全程只用 `Two-tone`），以保持高端统一。
- **尺寸与对齐**：遵循标准网格尺寸 **24×24**，保证在高 DPI 屏上绝对清晰。

## 示例

需求：为一个暗色后台做底部导航（首页 / 搜索 / 消息 / 我的）。

1. 语义确定：home、search、message、profile 四个概念。
2. 风格选定：暗色高级感 → 全程 `Bold`，不与其他风格混用。
3. 检索：在 iconsax.io 找到 `home`、`search`、`message`，缺 `profile` 的理想变体。
4. 生成：用 Iconsax AI 生成 `profile`（Bold 风格），与前三个保持一致。
5. 集成：四个图标统一导出为 24×24 SVG，inline 接入并对齐到像素网格。

## 注意事项

- 一个项目只锁定一种风格，混用会立刻破坏高端观感。
- 始终用 24×24 网格导出，避免非整数缩放导致边缘发虚。
- AI 生成的图标也要回到所选风格做一致性核对，再入库。
- 上线前在真实环境核对配色、对比度与可访问性，不要只信预览。

## 互见

- 同属「创意/design」域的设计系统、配色、组件库类技能。

---

采编自 sickn33/antigravity-awesome-skills（MIT）。
