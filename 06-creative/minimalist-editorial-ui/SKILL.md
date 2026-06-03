---
name: minimalist-editorial-ui
title: 极简编辑风界面设计
description: 当需要做 Notion/Linear/Vercel 那类极简、编辑风、文档感的高端前端界面时使用；产出暖色单色系、1px 细边框、bento 网格、克制动效的 HTML/React/Tailwind 设计规范与代码；不适用于已有强品牌色系统、需要鲜艳渐变/重阴影/营销大色块的场景。触发词：极简界面、editorial 风、暖色单色、bento 网格、Notion 风。
domain: 创意/design
triggers: [极简界面, editorial 风, 暖色单色, bento 网格, Notion 风, Linear 风, 文档感 UI, minimalist ui]
tags: [创意, design, 前端, 极简主义, ui, 排版]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [claude, cursor, codex, antigravity]
requires: []
related: [high-end-visual-design, glassmorphism-ui-design, industrial-brutalist-ui, ui-design-system-builder]
combines_with: [tailwind-css-patterns, theme-factory, web-artifacts-builder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 用户想做一套精致的极简界面，参考对象是 Notion、Linear、Vercel 这类工作区/编辑风产品。
- 需要暖色单色系（warm monochrome）、细边框、大留白、低饱和柔和点缀色、安静动效的「文档感」界面。
- 明确要避开通用 SaaS 视觉：渐变、重阴影、高饱和色块、满屏胶囊组件、玻璃拟态。

**不该用的边界**：
- 内容密集时极简会压扁信息层级——必须用真实内容验证可扫读性、对比度与导航清晰度，而非靠占位文字蒙混。
- 产品已有成熟品牌色/字体系统时，不要无故推翻；本风格假设产品能承载克制的排版主导布局。
- 细微动效与扁平表面仍需在目标项目里做响应式、键盘、读屏的可访问性验证。

## 步骤

1. **先定宏观留白**：区块之间用大纵向间距（Tailwind `py-24` / `py-32`）。
2. **约束正文宽度**：主排版内容限制在 `max-w-4xl` 或 `max-w-5xl`。
3. **立即落地排版层级与单色变量**：字体族、字色、边框色先成体系。
4. **统一边框规则**：每个卡片、分隔线、边框严格遵守 `1px solid #EAEAEA`。
5. **加滚动入场动画**：所有主要内容块用 `IntersectionObserver` 渐显。
6. **给区块视觉纵深**：靠低透明度图片、环境渐变或细纹理避免空洞扁平背景，但不破坏干净感。
7. 产出的代码应原生体现这种高端、克制、编辑风审美，无需手动再调。

## 指令

**绝对禁用（Banned）**：
- 不用 `Inter` / `Roboto` / `Open Sans` 字体。
- 不用 `Lucide` / `Feather` / 标准 `Heroicons` 这类通用细线图标库。
- 不用 Tailwind 默认重阴影（`shadow-md/lg/xl`）；阴影几乎不可见或自定义为超弥散、低透明（< 0.05）。
- 大元素/区块不用主色背景（不要亮蓝/绿/红的 hero 块）。
- 不用渐变、霓虹色、3D 玻璃拟态（导航栏轻模糊除外）。
- 大容器/卡片/主按钮不用 `rounded-full` 胶囊形。
- 代码、标记、文本、标题、alt 里任何位置都不用 emoji，改用图标或干净 SVG。
- 不用 "John Doe" / "Acme Corp" / "Lorem Ipsum" 占位名，用真实贴合语境的内容。
- 不用 AI 文案套话："Elevate / Seamless / Unleash / Next-Gen / Game-changer / Delve"，写朴素具体的语言。

**排版架构**：
- 正文/UI/按钮（无衬线）：`font-family: 'SF Pro Display', 'Geist Sans', 'Helvetica Neue', 'Switzer', sans-serif`。
- 标题/引言（编辑风衬线）：`font-family: 'Lyon Text', 'Newsreader', 'Playfair Display', 'Instrument Serif', serif`，紧字距（`letter-spacing: -0.02em ~ -0.04em`）、紧行高（`1.1`）。
- 代码/快捷键/元数据（等宽）：`font-family: 'Geist Mono', 'SF Mono', 'JetBrains Mono', monospace`。
- 字色：正文绝不用纯黑 `#000000`，用近黑/炭灰 `#111111` 或 `#2F3437`，行高 `1.6`；次要文字用 `#787774`。

**色板（暖色单色 + 点缀柔色）**：
- 画布/背景：纯白 `#FFFFFF` 或暖骨白 `#F7F6F3` / `#FBFBFA`。
- 卡片表面：`#FFFFFF` 或 `#F9F9F8`。
- 边框/分隔线：`#EAEAEA` 或 `rgba(0,0,0,0.06)`。
- 点缀色（仅用于标签、行内代码底、图标底，高度去饱和）：
  - 浅红 `#FDEBEC`（字 `#9F2F2D`）
  - 浅蓝 `#E1F3FE`（字 `#1F6C9F`）
  - 浅绿 `#EDF3EC`（字 `#346538`）
  - 浅黄 `#FBF3DB`（字 `#956400`）

**组件规范**：
- Bento 网格：非对称 CSS Grid；卡片精确 `border: 1px solid #EAEAEA`；圆角 ≤ `8px`/`12px`；内边距充裕 `24px ~ 40px`。
- 主 CTA 按钮：实底 `#111111` + 白字；圆角 `4px ~ 6px`；无阴影；hover 微调到 `#333333` 或 `transform: scale(0.98)`。
- 标签/状态徽章：胶囊 `border-radius: 9999px`，极小字号 `text-xs`，大写 + 宽字距 `0.05em`，底色用上面的柔色。
- 手风琴/FAQ：去掉容器盒，仅用 `border-bottom: 1px solid #EAEAEA` 分隔；切换用清晰的 `+` / `-` 图标。
- 快捷键微 UI：用 `<kbd>` 渲染实体键——`border: 1px solid #EAEAEA; border-radius: 4px; background: #F7F6F3;` 等宽字体。
- 仿 OS 窗口：mock 软件时套极简容器，白色顶栏放三个浅灰小圆点（仿 macOS 窗控）。

**图标与图像**：
- 系统图标用 Phosphor（Bold/Fill）或 Radix UI Icons，略粗描边的技术感，全局统一描边宽度。
- 插画：白底单色粗连续线手绘，仅一个偏移几何形填柔色。
- 照片：去饱和暖调，叠 `opacity: 0.04` 暖噪点融入单色系；缺素材用 `https://picsum.photos/seed/{context}/1200/800`。
- Hero/区块背景：低透明全宽图、暖调柔和径向光斑（`radial-gradient` 暖色 `opacity: 0.03`）或极简线纹，增加纵深而不破坏干净感。

## 示例

滚动入场（核心动效模式）：
```js
// 元素从 translateY(12px)+opacity:0 在 600ms 内渐显
// 必须用 IntersectionObserver，禁止 window.addEventListener('scroll')
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
      io.unobserve(e.target);
    }
  });
});
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
```
```css
.reveal {
  opacity: 0;
  transform: translateY(12px);
  transition: opacity .6s cubic-bezier(0.16, 1, 0.3, 1),
              transform .6s cubic-bezier(0.16, 1, 0.3, 1);
}
/* 列表/网格交错入场 */
.reveal-item { animation-delay: calc(var(--index) * 80ms); }
```

卡片 hover（超弱阴影位移）：
```css
.card {
  border: 1px solid #EAEAEA;
  border-radius: 12px;
  box-shadow: 0 0 0 rgba(0,0,0,0);
  transition: box-shadow .2s ease;
}
.card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
```

实体键徽章：
```html
<kbd style="border:1px solid #EAEAEA;border-radius:4px;background:#F7F6F3;
            font-family:'Geist Mono',monospace;padding:2px 6px;">⌘K</kbd>
```

## 注意事项

- 动效只动 `transform` 和 `opacity`，绝不动会触发布局的属性（`top/left/width/height`）；`will-change: transform` 仅在正在动的元素上节制使用。
- 环境动效可选：单个极慢径向渐变光斑（`animation-duration: 20s+`，`opacity: 0.02~0.04`），放在 `position: fixed; pointer-events: none` 层，绝不放在滚动容器上。
- 动效目标是「安静的高级感」而非表演，存在但不抢戏；列表不要一次性全部挂载，用交错延迟。
- 极简最大的坑是层级被抹平：上线前用真实内容核对可扫读性与对比度。

## 互见

- 同域创意/design 下的排版、配色、组件库类技能可配合使用。
- 需要可访问性核验时，结合响应式/键盘/读屏验证类技能。

---
采编自 sickn33/antigravity-awesome-skills（原作者 Leonxlnx，taste-skill），MIT 许可。
