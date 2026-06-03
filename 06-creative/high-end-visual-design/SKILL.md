---
name: high-end-visual-design
title: 高端视觉界面设计
description: 当需要产出 Awwwards/代理商级、Apple/Linear 风的高端落地页·作品集·SaaS·产品页界面（高级字体、空间留白、柔光纵深、流体微交互）时使用；做法是先掷"变体引擎"选定氛围+布局原型，再用 React/Tailwind 以双层包边、岛屿按钮、自定义缓动与滚动入场动效产出像素级前端代码；不适用于受限仪表盘·受监管产品·低端弱网环境，也不替代品牌策略·转化研究·无障碍与上线 QA。触发词：高端视觉、Awwwards、Apple 风、奢华界面、premium UI
domain: 创意/design
triggers: [高端视觉设计, Awwwards, 代理商级界面, Apple 风, Linear 风, 奢华界面, premium UI, 高级字体排印, 双层包边 Doppelrand, 流体微交互, 磁吸按钮, 滚动入场动效, 玻璃拟态导航, 变体引擎, high-end visual design]
tags: [创意/design, 前端, 视觉设计, 动效, UI/UX, Tailwind, React, 微交互]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [React/HTML, Tailwind CSS, Framer Motion / IntersectionObserver, CSS cubic-bezier 缓动, Phosphor Light / Remix Line 图标, premium 字体（Geist / Clash Display / PP Editorial New / Plus Jakarta Sans）]
requires: []
related: [minimalist-editorial-ui, glassmorphism-ui-design, ui-design-system-builder, design-spells-microinteractions]
combines_with: [tailwind-css-patterns, web-artifacts-builder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
# 高端视觉界面设计

## 何时使用

- 用户想要高端代理商、Awwwards 级、Apple/Linear 风、奢华或极致打磨的视觉设计。
- 构建落地页、作品集、SaaS 界面、消费级产品页或 App 表层，需要 premium 纵深感与流体动效。
- 设计必须避开通用字体、生硬阴影、静态布局、默认顶栏与平庸的 Bootstrap 三栏网格。

不该用的边界：

- 本技能只聚焦视觉设计，不替代品牌策略、转化研究、无障碍验证或上线 QA。
- premium 字体、图标集、图片、动效库必须在目标项目中已存在或刻意引入后，生成代码才可用。
- 受限仪表盘、受监管产品、低性能/弱网环境，别强加奢华动效与重视觉处理。
- 任务范围不清或缺成功标准时先停下确认，不要凭空发挥。

## 步骤

按以下固定顺序生成 UI 代码：

1. 【静默决策】掷"变体引擎"：依 prompt 上下文各选 1 个氛围原型 + 1 个布局原型（见指令），保证产出独特又始终高端。**绝不连续两次输出同一布局/美学。**
2. 【搭骨架】先定背景质感、宏观留白尺度、巨型字号。
3. 【架构】所有主卡片/输入框/特性网格一律用"双层包边（Doppelrand）"：外壳 + 内核，用夸张 squircle 圆角（`rounded-[2rem]`）。
4. 【编舞】注入自定义 `cubic-bezier` 过渡、错峰导航揭示、按钮中按钮 hover 物理。
5. 【输出】交付像素级 React/Tailwind/HTML，不夹带平庸 fallback。
6. 【出库前自检】逐项核对清单（见注意事项）后再交付。

## 指令

### 绝对禁区（ABSOLUTE ZERO 反模式）——命中任意一条即判失败

- **禁用字体**：Inter、Roboto、Arial、Open Sans、Helvetica。改用 premium 字体如 `Geist`、`Clash Display`、`PP Editorial New`、`Plus Jakarta Sans`。
- **禁用图标**：标准粗描边 Lucide、FontAwesome、Material Icons。只用极细精准线条（Phosphor Light、Remix Line）。
- **禁用描边/阴影**：通用 1px 灰实线边框；生硬深色投影（`shadow-md`、`rgba(0,0,0,0.3)`）。
- **禁用布局**：贴顶 sticky 满宽导航；对称无聊的 Bootstrap 三栏网格、留白不足。
- **禁用动效**：标准 `linear` / `ease-in-out`；无插值的瞬时状态切换。

### 变体引擎 A · 氛围与质感原型（选 1）

1. **空灵玻璃（SaaS/AI/科技）**：最深 OLED 黑 `#050505`，背景径向网格渐变（微弱发光的紫/翠光球），Vantablack 卡片配重 `backdrop-blur-2xl` 与 `white/10` 发丝线；宽体几何 Grotesk 字体。
2. **编辑式奢华（生活方式/地产/代理商）**：暖米白 `#FDFBF7`、柔哑鼠尾草绿或深浓缩咖啡色；巨型高对比可变衬线标题；微弱 CSS 噪点/胶片颗粒叠层（`opacity-[0.03]`）营造纸质实感。
3. **柔性结构主义（消费/健康/作品集）**：银灰或纯白背景；超大粗体 Grotesk 字体；通透漂浮组件 + 极柔、高度扩散的环境投影。

### 变体引擎 B · 布局原型（选 1）

1. **非对称 Bento**：砌体式 CSS Grid，卡片尺寸不一（如 `col-span-8 row-span-2` 旁接堆叠的 `col-span-4`）。**移动塌缩**：回退单列 `grid-cols-1`，大纵向间距 `gap-6`，所有 `col-span` 重置为 `col-span-1`。
2. **Z 轴层叠**：元素如实体卡片堆叠、轻微重叠、景深不一，部分加 `-2deg`/`3deg` 旋转打破数字网格。**移动塌缩**：`768px` 以下移除所有旋转与负 margin 重叠，标准间距纵向堆叠（重叠会造成触控冲突）。
3. **编辑式分屏**：左半 `w-1/2` 巨型字排，右侧可横滚的交互图片胶囊/错峰卡片。**移动塌缩**：转全宽纵向堆叠 `w-full`，字排在上、交互内容在下，必要时保留横滚。

**通用移动覆写**：`md:` 以上的任何非对称布局，`768px` 以下必须激进回退到 `w-full`、`px-4`、`py-8`。全高区块绝不用 `h-screen`，一律 `min-h-[100dvh]` 防 iOS Safari 视口跳动。

### 触觉级微美学

- **双层包边（Doppelrand）**：卡片/图片/容器绝不平铺在背景上，要像机加工硬件。外壳 = 包裹 `div`，微背景（`bg-black/5` 或 `bg-white/5`）+ 发丝外边框（`ring-1 ring-black/5` 或 `border border-white/10`）+ 内边距（`p-1.5`/`p-2`）+ 大外圆角（`rounded-[2rem]`）。内核 = 真正内容容器，自有背景色、内高光 `shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]`，并用数学换算的更小圆角 `rounded-[calc(2rem-0.375rem)]` 做同心曲线。
- **岛屿按钮 / 按钮中按钮**：主按钮为全圆胶囊 `rounded-full` + 大内边距 `px-6 py-3`。尾随箭头（`↗`）绝不裸贴文字旁，须嵌进独立圆形包裹 `w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center`，紧贴按钮右内边距。
- **空间节奏**：宏观留白翻倍，区块用 `py-24`~`py-40`；大标题前置微型 eyebrow 标签 `rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium`。

### 动效编舞（流体动力学）

- 全程自定义缓动模拟真实质量与弹簧物理：`transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]`。
- **流体岛导航 + 汉堡变形**：闭合态为脱离顶部的浮动玻璃胶囊（`mt-6 mx-auto w-max rounded-full`）；点击时汉堡两/三线流畅旋转平移成完美 'X'（`rotate-45` + `-rotate-45` 绝对定位），不是凭空消失；菜单展开为满屏重玻璃覆盖层（`backdrop-blur-3xl bg-black/80`）；内部链接错峰遮罩揭示（`translate-y-12 opacity-0` → `translate-y-0 opacity-100`，逐项 `delay-100/150/200`）。
- **磁吸按钮 hover**：用 `group`；按下 `active:scale-[0.98]` 模拟物理按压；内层图标圆斜向位移 `group-hover:translate-x-1 group-hover:-translate-y-[1px]` 并 `scale-105`，制造内部动能张力。
- **滚动插值入场**：元素绝不静态出现，进入视口时执行柔和沉重的上浮（`translate-y-16 blur-md opacity-0` → `translate-y-0 blur-0 opacity-100`，800ms+）。JS 滚动揭示用 `IntersectionObserver` 或 Framer Motion `whileInView`，**绝不**用 `window.addEventListener('scroll')`（持续 reflow，拖垮移动性能）。

### 性能护栏

- **GPU 安全动画**：绝不动画 `top/left/width/height`，只动 `transform` 与 `opacity`；`will-change: transform` 仅用于正在动画的元素，慎用。
- **模糊约束**：`backdrop-blur` 只加在 fixed/sticky 元素（导航、覆盖层），绝不加在滚动容器或大内容区（持续 GPU 重绘）。
- **颗粒/噪点叠层**：只挂在 fixed 且 `pointer-events-none` 的伪元素（`position: fixed; inset: 0; z-index: 50`），绝不挂滚动容器。
- **Z-Index 纪律**：不用随意的 `z-50`/`z-[9999]`，仅为系统层（sticky 导航、模态、覆盖层、tooltip）保留。

## 示例

双层包边卡片（外壳 + 内核同心圆角）：

```html
<div class="bg-white/5 ring-1 ring-black/5 p-1.5 rounded-[2rem]">
  <div class="bg-[#0a0a0a] rounded-[calc(2rem-0.375rem)]
              shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] p-8">
    <!-- 内容 -->
  </div>
</div>
```

岛屿按钮 + 按钮中按钮尾随图标：

```html
<button class="group inline-flex items-center gap-3 rounded-full px-6 py-3
               transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]
               active:scale-[0.98]">
  <span>开始使用</span>
  <span class="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center
               transition-transform duration-500
               group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105">↗</span>
</button>
```

滚动入场（Framer Motion `whileInView`，只动 transform/opacity）：

```jsx
<motion.div
  initial={{ y: 64, filter: "blur(8px)", opacity: 0 }}
  whileInView={{ y: 0, filter: "blur(0px)", opacity: 1 }}
  viewport={{ once: true, margin: "-10%" }}
  transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
/>
```

## 注意事项

出库前清单（最后一道过滤，逐项核对）：

- [ ] 无禁区字体/图标/边框/阴影/布局/动效（见指令禁区）。
- [ ] 自觉选用并应用了一个氛围原型 + 一个布局原型。
- [ ] 主卡片/容器均用双层包边（外壳 + 内核）。
- [ ] 适用处 CTA 用按钮中按钮尾随图标。
- [ ] 区块内边距至少 `py-24`，布局充分呼吸。
- [ ] 全部过渡用自定义 cubic-bezier，无 `linear`/`ease-in-out`。
- [ ] 存在滚动入场动画，无元素静态出现。
- [ ] `768px` 以下优雅塌缩为单列 `w-full` + `px-4`。
- [ ] 所有动画只用 `transform`/`opacity`，无触发布局的属性。
- [ ] `backdrop-blur` 仅加在 fixed/sticky，不加滚动内容。
- [ ] 对 `prefers-reduced-motion: reduce` 用户提供降级（关停动效）。
- [ ] 整体观感是"$150k 代理商级构建"，而非"换了好字体的模板"。

补充：别把产出当作目标环境验证、无障碍/性能实测或专家评审的替代——交付前在真机/弱网实测。

## 互见

- related：`glassmorphism-ui-design` —— 玻璃拟态/空间纵深质感，与本技能氛围原型互补。
- related：`design-spells-microinteractions` —— 收尾打磨的微交互模式库。
- related：`apple-hig-advisor` —— Apple 风设计语言的人机界面规范依据。
- related：`ux-ui-principles-audit` —— 用通用 UX/UI 原则审计高端视觉成稿。
- combines_with：`ui-design-system-builder` —— 把变体原型沉淀为可复用设计系统。
- combines_with：`theme-factory` —— 批量生成氛围主题/配色 token。
- combines_with：`animejs-web-animation` —— 补充复杂时间线动效编排。

---

采编自 sickn33/antigravity-awesome-skills（MIT）。
