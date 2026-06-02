---
name: ui-design-system-builder
title: UI 设计系统与设计令牌
description: 当需要从品牌色生成完整设计令牌、构建组件体系或做研发交接时使用；产出 design token（CSS/SCSS/JSON）、色阶/字阶/8pt 栅格与交接清单；不适用于单页视觉稿、品牌 logo 设计或前端业务逻辑实现；触发词：设计令牌、设计系统、design token
domain: 创意/design
triggers: [生成设计令牌, design token, 设计系统, 色板/色阶生成, 字号阶梯/字阶, 8pt 栅格/间距系统, 导出 CSS 变量, 导出 SCSS 令牌, 组件体系/原子设计, 响应式断点, 流体字号 clamp, WCAG 对比度, 研发交接 handoff, Tailwind/styled-components 接入]
tags: [创意, design, 设计系统, design-token, 组件库, 响应式, 无障碍, WCAG, 研发交接]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [scripts/design_token_generator.py, Bash, Read, Write]
requires: []
related: [theme-factory, brand-guidelines, apple-hig-advisor, web-component-design]
combines_with: [theme-factory, tailwind-css-patterns, frontend-design]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

适用：

- 有了品牌主色，需要一键派生**完整设计令牌系统**（色板、字阶、间距、圆角、阴影、动效、断点、z-index）。
- 需要把令牌**导出**为 CSS 自定义属性 / SCSS 变量 / JSON，供 Figma（Tokens Studio）或前端框架消费。
- 需要基于令牌搭建**组件体系**（原子设计分层、尺寸/颜色/状态变体）。
- 需要计算**响应式断点、流体字号（clamp）、响应式间距**。
- 需要做**研发交接**：导出令牌 + 框架接入示例 + 交接清单 + 无障碍校验。

不该用（负边界）：

- 单页视觉稿、海报、品牌 logo / VI 设计——这是具体视觉创作，不是令牌系统。
- 前端业务逻辑、状态管理、接口联调——本技能只产出设计令牌与样式契约，不写应用代码。
- 仅需取一个颜色的对比度，无需整套系统时，杀鸡用牛刀。

## 步骤

### 1. 生成设计令牌

确定品牌主色（hex）与风格：`modern` | `classic` | `playful`，然后运行脚本：

```bash
python scripts/design_token_generator.py "#0066CC" modern json
```

产出分类：colors（primary/secondary/neutral/semantic/surface）、typography、spacing（8pt 栅格 0-64）、borders、shadows（none~2xl）、animation、breakpoints、z-index。

按目标格式导出：

```bash
# CSS 自定义属性
python scripts/design_token_generator.py "#0066CC" modern css  > design-tokens.css
# SCSS 变量
python scripts/design_token_generator.py "#0066CC" modern scss > _design-tokens.scss
# JSON（供 Figma / 工具链）
python scripts/design_token_generator.py "#0066CC" modern json > design-tokens.json
```

参数：`brand_color`（默认 #0066CC）、`style`（modern/classic/playful，默认 modern）、`format`（json/css/scss/summary，默认 json）。

完成后校验：语义色须带 contrast 对比色；颜色须满足 WCAG AA（正文 4.5:1，大字 3:1）。

### 2. 构建组件体系

按原子设计分层：Atoms（Button/Input/Icon/Label/Badge）→ Molecules（FormField/SearchBar/Card/ListItem）→ Organisms（Header/Footer/DataTable/Modal）→ Templates（DashboardLayout/AuthLayout）。

将令牌映射到组件，并定义变体：

```text
# 尺寸变体
sm: 高 32px, paddingX 12px, fontSize 14px
md: 高 40px, paddingX 16px, fontSize 16px
lg: 高 48px, paddingX 20px, fontSize 18px

# 颜色变体
primary:   背景 primary-500,  文字 white
secondary: 背景 neutral-100,  文字 neutral-900
ghost:     背景 transparent,  文字 neutral-700
```

每个组件须文档化：Props 类型、变体选项、状态（hover/active/focus/disabled）、无障碍要求。组件**只引用令牌，禁止硬编码值**。

### 3. 响应式

断点：xs=0 / sm=480 / md=640 / lg=768 / xl=1024 / 2xl=1280（px）。

流体字号公式 `clamp(min, preferred, max)`，预置：

```css
--fluid-h1:   clamp(2rem,    1rem + 3.6vw, 4rem);
--fluid-h2:   clamp(1.75rem, 1rem + 2.3vw, 3rem);
--fluid-h3:   clamp(1.5rem,  1rem + 1.4vw, 2.25rem);
--fluid-body: clamp(1rem, 0.95rem + 0.2vw, 1.125rem);
```

响应式间距随移动/平板/桌面递增，例如 `--space-section`：48px → 80px → 120px。

### 4. 研发交接

导出对应格式后，提供框架接入示例：

```javascript
// Tailwind：复用令牌
const tokens = require('./design-tokens.json');
module.exports = { theme: { colors: tokens.colors, fontFamily: tokens.typography.fontFamily } };
```

```typescript
// styled-components
import tokens from './design-tokens.json';
const Button = styled.button`
  background: ${tokens.colors.primary['500']};
  padding: ${tokens.spacing['2']} ${tokens.spacing['4']};
`;
```

Figma 同步：安装 Tokens Studio 插件，导入 `design-tokens.json` 自动同步样式。

交接清单：令牌文件入库 / 构建管线配置 / CSS 变量已引入 / 组件库对齐 / 文档已生成。

## 指令

- 始终用 hex 提供品牌色；风格三选一，决定字体、默认圆角与阴影层次（modern: Inter+8px；classic: Helvetica+4px；playful: Poppins+16px）。
- 色阶规则：50-400 固定明度 95% 仅调饱和度，500 为基色，600-900 逐级降明度（×0.8/0.6/0.4/0.2）升饱和度——用于背景、边框、悬停、文字、标题。
- 字阶按 1.25 倍率：xs10 / sm13 / base16 / lg20 / xl25 / 2xl31 / 3xl39 / 4xl49 / 5xl61（px）。
- 触控目标 ≥ 44×44px；焦点指示必须可见；优先语义化 HTML。
- 大字定义：≥18pt 常规或 ≥14pt 加粗（对应 AA 3:1 / AAA 4.5:1）。

## 示例

输入「我有品牌色 #8B4513，要 classic 风格的 CSS 令牌」：

```bash
python scripts/design_token_generator.py "#8B4513" classic css > design-tokens.css
```

随后输出色阶/字阶概览，提示语义色已附 contrast 值，并给出 React 引入：`import './design-tokens.css';` 配合 `<button class="btn btn-primary">`，最后附交接清单与 WCAG 校验结果。

快速预览可用 summary 格式：`python scripts/design_token_generator.py "#FF6B6B" playful summary`。

## 注意事项

- 脚本依赖 `scripts/design_token_generator.py` 与 `references/` 下的参考文档（token-generation / component-architecture / responsive-calculations / developer-handoff），适配落地时需一并迁移。
- 令牌是单一事实源：组件与代码只能引用令牌，避免散落的魔法数值导致漂移。
- 导出后务必跑无障碍校验，语义色缺 contrast、对比度不达 AA 都应阻断交付。
- JSON 格式同时服务工具链与代码，CSS/SCSS 面向直接消费——按下游决定导出哪一种或全部导出。

## 互见

- 参考文档（源仓库 `references/`）：色彩算法/HSV/对比度（token-generation）、原子设计与命名（component-architecture）、断点与流体排版（responsive-calculations）、导出与 Figma 同步（developer-handoff）。
- 与「创意/design」域内的视觉稿、组件实现类技能配合：本技能负责令牌与样式契约，下游负责具体视觉与前端落地。

---

采编自 alirezarezvani/claude-skills（MIT 许可证）。
