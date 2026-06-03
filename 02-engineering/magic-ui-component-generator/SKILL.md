---
name: magic-ui-component-generator
title: AI UI 组件多方案生成
description: 当需要生成或增强前端 UI 组件（定价表、表单、Hero、Logo/图标）时使用；借助 21st.dev Magic 生成多套差异化设计方案供选型并落地生产级 TypeScript 代码；不适用于纯逻辑/后端开发或需精确还原既有设计稿的场景；触发词：UI 组件、设计方案、Magic 21st.dev
domain: 研发/frontend
triggers: [生成 UI 组件, 做一个定价表/表单/Hero, 给我几个设计方案, 美化现有组件, 需要 logo 或图标, Magic by 21st.dev]
tags: [frontend, ui-generation, design-variations, react, typescript, tailwind, 21st-dev]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Magic MCP (21st.dev), browser_subagent, SVGL]
requires: []
related: [shadcn-ui-components, web-component-design, frontend-design, web-artifacts-builder]
combines_with: [tailwind-css-patterns, react-state-management]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

当任务是**前端视觉层组件的创作或增强**，且追求超越通用模板的现代设计时，使用本技能。典型场景：

- 新建 UI 组件：定价表、联系表单、Hero 区块、卡片、导航等。
- 增强既有组件：加动画、改样式、补高级交互（粘性头、悬停动效等）。
- 为某功能头脑风暴多个设计方向、横向对比选型。
- 需要专业 logo 或图标（走内置 SVGL 集成）。

**不该用的边界：**

- 纯业务逻辑、状态管理、后端/接口开发——本技能只产出视觉组件。
- 需要像素级还原既有设计稿（Figma 切图）——本技能强调多方案发散，不是精确复刻。
- 缺少目标技术栈、可访问性/响应式要求等关键输入时，先停下来问清楚，不要硬生成。
- 生成结果不能替代环境内的真实测试、可访问性校验与专家评审。

## 步骤

1. **分析需求**：明确组件描述，确认产物匹配项目技术栈（如 Next.js / TypeScript / Tailwind CSS），并定义可访问性与响应式的明确约束。
2. **生成多方案**：通过 Magic MCP server 或 `browser_subagent` 访问 21st.dev/magic，针对同一组件生成**多套差异化、非常规风格**的方案，灵感取自 Shadcn UI、Magic UI、Aceternity 等真实组件库。
3. **并列呈现选项**：简要描述各方案，并列对比风格差异、布局思路与高级特性（粘性头、悬停动画等），交由使用者挑选。
4. **集成所选方案**：选定后，落地完整可用的生产级 TypeScript 代码；确认依赖已安装（如 `lucide-react`、`framer-motion`）；正确处理 props、类型与响应式行为。

## 指令

- **强制：必须出方案后再落地**。在把最终代码写入项目前，**始终先提供多套高质量设计变体**供选择（Choice First）。
- **拒绝平庸**：不要生成通用、保守、千篇一律的样式，主动突破边界做出有创意、视觉惊艳的 UI/UX。
- **整洁代码**：所有产物为干净的 TypeScript，满足可访问（accessible）与响应式（responsive）。
- **完全接管**：将生成的组件视为项目自有代码，负责其类型、props 与后续维护。

## 示例

提示词要主动推向现代美学，越具体越好：

- `avant-garde SaaS pricing table with glassmorphism and animated borders`（前卫 SaaS 定价表，玻璃拟态 + 动画边框）
- `highly immersive contact form with dynamic floating labels`（沉浸式联系表单，动态浮动标签）

典型对话流：使用者说"做一个 Hero 区块" → 生成 3 套风格（极简渐变 / 玻璃拟态 / 暗色霓虹）→ 并列描述差异 → 使用者选"玻璃拟态" → 落地 TS 代码并补 `framer-motion` 依赖。

## 注意事项

- 仅在任务明确落在上述范围内时使用，避免越界处理逻辑/后端类需求。
- 多方案是核心价值：即便使用者只要一个，也应先给出对比选项再收敛。
- 集成阶段务必核对依赖安装与类型正确，避免交付即报错。
- 产物需经环境内验证与评审后方可视为完成。

## 互见

- 前端组件库 / 设计系统相关技能（Shadcn UI、Tailwind 规范）
- Figma 设计稿读取与还原类技能（精确复刻场景的替代选择）

---

采编自 [sickn33/antigravity-awesome-skills](https://21st.dev/magic)（MIT 许可）。
