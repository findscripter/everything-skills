---
name: stitch-design-system-taste
title: Stitch 设计品味：排版色彩布局动效系统生成
description: 当需要为 Google Stitch 屏幕生成器产出语义化 DESIGN.md 设计系统、用自然语言描述加精确数值约束驱动 AI 生成高端非通用界面时使用；产出含氛围/色板/字体/组件/布局/动效/反模式七段的 DESIGN.md，覆盖反 AI-slop 规则（禁 Inter、禁纯黑、禁霓虹紫蓝、禁 3 等宽卡片）；不适用于已有成熟品牌设计系统、直接写最终前端代码、或保证 Stitch 像素级还原每条约束的场景。触发词：Stitch、DESIGN.md、设计系统、反 AI 通用 UI、设计品味
domain: 创意/design
triggers: [Stitch, DESIGN.md, 设计系统, 语义设计系统, 反 AI 通用 UI, anti-slop, 设计品味, Google Stitch, 氛围色板字体, premium UI 规范]
tags: [创意, design, 前端, 设计系统, stitch, 排版, 配色, 动效, 反模式]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Google Stitch, DESIGN.md, Stitch MCP Server, claude, cursor, antigravity]
requires: []
related: [google-stitch-ui-prompting, stitch-iterative-build-loop, ui-design-system-builder, high-end-visual-design]
combines_with: [stitch-iterative-build-loop, theme-factory]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
# Stitch 设计品味：排版色彩布局动效系统生成

## 何时使用

- 用户想要一份兼容 Google Stitch 的 `DESIGN.md` 或语义化设计系统，用来驱动 AI 生成屏幕。
- 需要把「高端前端品味规则」翻译成 Stitch 能理解的视觉描述：色彩角色、字体规格、组件行为，自然语言描述配精确数值。
- 设计系统必须在生成屏幕**之前**就堵死通用 AI UI 套路（AI-slop）。

**不该用的边界**：
- 本技能产出的是面向 Stitch 的语义设计指南，**不保证** Stitch 会逐条像素级还原每个约束。
- 生成的 `DESIGN.md` 仍需对照真实产品简报、品牌约束、无障碍需求与屏幕内容复核，不能直接当成品。
- 动效小节是写给后续编码 Agent 的「实现意图」——Stitch 本身可能只产出静态屏幕，别期待它跑动画。
- 不负责直接写最终前端代码；要落地代码请转交对应前端/设计系统技能。

## 步骤

1. **定氛围（Atmosphere）**：用品味坐标三维度打分，缺省基线 = Variance 8 / Motion 6 / Density 4，按用户 vibe 动态调整：
   - 密度 Density：画廊通透(1–3) → 日常均衡(4–7) → 座舱密集(8–10)
   - 变化 Variance：可预测对称(1–3) → 偏移非对称(4–7) → 艺术混沌(8–10)
   - 动效 Motion：克制静态(1–3) → 流体 CSS(4–7) → 电影编排(8–10)
2. **映射色板**：每色给「描述名 + Hex + 功能角色」三件套（见指令）。
3. **立字体规则**：标题/正文/等宽分别选字，套用禁用清单。
4. **设计 Hero**：行内图像排版为签名技法；Variance>4 时禁居中。
5. **描述组件**：按钮/卡片/输入/加载/空态/错误态逐一定形状、色、阴影、交互。
6. **定布局与响应式**：Grid 优先、`min-h-[100dvh]`、<768px 强制单列。
7. **编码动效意图**：弹簧物理参数、永续微交互、错峰入场、只动 transform/opacity。
8. **显式列反模式**：把所有「NEVER DO」写进 `DESIGN.md`。

## 指令

**色彩硬约束**：
- 最多 1 个强调色，饱和度 < 80%。
- **严禁「AI 紫/蓝霓虹」**：无紫色按钮辉光、无霓虹渐变。
- 用绝对中性基底（Zinc/Slate）配单一高对比强调色；全局一套灰，不冷暖灰乱跳。
- **绝不用纯黑 `#000000`**，改用 Off-Black / Zinc-950 / Charcoal。

**字体规则**：
- 标题：紧字距、克制字号，靠**字重和颜色**建层级，而非单纯堆大字号。
- 正文：宽松行高，每行 ≤ 65 字符。
- **`Inter` 在高端/创意语境被禁**，强制用有性格的字：`Geist`、`Outfit`、`Cabinet Grotesk`、`Satoshi`。
- **通用衬线被禁**（`Times New Roman`/`Georgia`/`Garamond`/`Palatino`）；editorial 需要衬线时只用 `Fraunces`/`Gambarino`/`Editorial New`/`Instrument Serif`；**仪表盘/软件 UI 一律禁衬线**。
- 仪表盘只用无衬线配对（`Geist`+`Geist Mono` 或 `Satoshi`+`JetBrains Mono`）。
- 高密度覆盖：Density > 7 时，所有数字必须用等宽。

**Hero 区**（第一印象，禁通用）：
- **行内图像排版**（签名技法）：把小幅语境图嵌进标题文字/字母之间，图与字同高、圆角，当视觉标点。
- 文字绝不与图像/其他文字重叠，每个元素独占干净空间分区。
- 禁填充文案：「Scroll to explore」「Swipe down」、滚动箭头、弹跳 chevron 一律删。
- Variance > 4 时**禁居中 Hero**，改 Split Screen / 左对齐 / 非对称留白。
- 最多 1 个主 CTA，不要「Learn more」次级链接。

**组件规范**：
- 按钮：active 时给触觉下压反馈（如 -1px 位移）；无外发光；无自定义鼠标光标。
- 卡片：仅当用「抬升」表达层级时才用；阴影染背景色调；高密度布局改用 `border-top` 分隔线或负空间替代卡片。
- 输入/表单：label 在上、helper 可选、error 在下，标准间距。
- 加载态：与布局尺寸匹配的骨架屏，**不用通用圆形 spinner**。
- 空态：有构图的引导式占位，不是干巴巴「No data」。
- 错误态：清晰的行内报错。

**布局原则**：
- 无重叠，每元素独占空间；不要 absolute 堆叠。
- `calc()` 百分比 hack 禁用，CSS Grid 优先于 Flexbox 数学。
- 用 `max-width` 收口（如 1400px 居中）。
- 全高区块必须 `min-h-[100dvh]`，**绝不用 `h-screen`**（iOS Safari 灾难性跳动）。
- 通用「3 等宽横排卡片」禁用，改 2 列 Zig-Zag / 非对称网格 / 横向滚动。

**响应式**：
- <768px 所有多列塌成单列，无例外；移动端横向溢出 = 严重缺陷。
- 标题用 `clamp()` 缩放；正文最小 `1rem`/`14px`；触控目标 ≥ `44px`。
- 行内排版图在移动端堆到标题下方；区块纵向间距按比例缩 `clamp(3rem, 8vw, 6rem)`。

**动效哲学**：
- 弹簧物理缺省 `stiffness: 100, damping: 20`（高级、有重量感），不用线性缓动。
- 永续微交互：每个活跃组件都有无限循环态（Pulse/Typewriter/Float/Shimmer）。
- 错峰编排：列表绝不瞬时挂载，用级联延迟做瀑布揭示。
- 性能：**只动 `transform` 和 `opacity`**，绝不动 `top/left/width/height`；颗粒/噪点滤镜只放固定伪元素。

**反模式（写进 DESIGN.md 的 NEVER DO）**：无 emoji、无 `Inter`、无通用衬线、无纯黑、无霓虹外发光、无过饱和强调色、无大标题渐变文字、无自定义鼠标光标、无重叠、无 3 等宽卡片、无「John Doe/Acme/Nexus」假名、无 `99.99%`/`50%` 假整数、无 AI 文案套话（Elevate/Seamless/Unleash/Next-Gen）、无填充 UI 文案、无失效 Unsplash 链接（改 `picsum.photos` 或 SVG 头像）、高 Variance 项目无居中 Hero。

## 示例

`DESIGN.md` 输出骨架（七段，落地时填实数值）：

```markdown
# Design System: [项目名]

## 1. Visual Theme & Atmosphere
（描述 mood / density / variance / motion 强度。
例：克制的画廊通透界面，自信的非对称布局 + 流体弹簧动效；
气质清冷而温暖，像一间光线充足的建筑工作室。）

## 2. Color Palette & Roles
- **Canvas White** (#F9FAFB) — 主背景
- **Pure Surface** (#FFFFFF) — 卡片/容器填充
- **Charcoal Ink** (#18181B) — 主文字，Zinc-950 深度
- **Muted Steel** (#71717A) — 次要文字/元信息
- **Whisper Border** (rgba(226,232,240,0.5)) — 1px 结构线
- **[Accent]** (#XXXXXX) — 唯一强调色，CTA/激活/焦点环
（最多 1 强调色，饱和 < 80%，禁紫/霓虹。）

## 3. Typography Rules
- **Display:** [字体] — 紧字距、克制字号、字重驱动层级
- **Body:** [字体] — 宽松行高、65ch 最大宽、中性次色
- **Mono:** [字体] — 代码/元信息/时间戳/高密度数字
- **Banned:** Inter、高端语境的通用系统字、仪表盘衬线

## 4. Component Stylings
* **Buttons:** 扁平无外发光，active -1px 位移；主按钮强调填充，次级 ghost/outline。
* **Cards:** 大圆角(2.5rem)，弥散 whisper 阴影，仅服务层级时用；高密度改 border-top 分隔。
* **Inputs:** label 在上、error 在下，焦点环用强调色；无浮动 label。
* **Loaders:** 匹配布局尺寸的骨架 shimmer，无圆形 spinner。
* **Empty States:** 有构图的引导式占位，非「No data」。

## 5. Layout Principles
（Grid 优先响应式；Hero 非对称分栏；<768px 强制单列；
max-width 收口；不用 flexbox 百分比数学；内边距充裕。）

## 6. Motion & Interaction
（全交互弹簧物理；级联错峰揭示；活跃仪表盘组件永续微循环；
仅硬件加速 transform；CPU 重动画隔离进 Client Component。）

## 7. Anti-Patterns (Banned)
（显式禁列：无 emoji、无 Inter、无纯黑、无霓虹辉光、
无 3 等宽网格、无 AI 文案套话、无假占位名、无失效图链。）
```

前置：访问 `labs.google.com/stitch`；可选用 Stitch MCP Server 接 Cursor/Antigravity/Gemini CLI 做编程式集成。

## 注意事项

- **描述要具体**：写「Deep Charcoal Ink (#18181B)」，别只写「深色文字」；每个 token 都给 Hex/rem/px 精确值，并说明功能角色。
- **术语翻译**：用「generously rounded corners」这类语义描述，别甩 `rounded-xl` 之类工具类 jargon 给 Stitch。
- **全局一致**：同一术语贯穿全文，命名按用途（功能）而非外观。
- **要有立场**：这不是中性模板，它强制一套特定高端审美——反模式清单和正向规则同等重要，删掉它就退回「安全的通用设计」。
- DESIGN.md 是 prompt Stitch 的**唯一真相源**，但生成后仍须对照真实简报、品牌、无障碍复核。

## 互见

- related：`high-end-visual-design`、`minimalist-editorial-ui`、`industrial-brutalist-ui`、`glassmorphism-ui-design`（同源品味体系的不同风格分支，选型时对照取舍）。
- combines_with：`ui-design-system-builder`（把 DESIGN.md 沉淀为可复用设计系统）、`theme-factory`（生成主题 token）、`design-spells-microinteractions`（落地动效意图）。

---

采编自 sickn33/antigravity-awesome-skills（原作者 Leonxlnx，taste-skill），MIT 许可。
