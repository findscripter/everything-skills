---
name: industrial-brutalist-ui
title: 工业野兽派遥测 UI
description: 当需要构建野兽派/工业风/瑞士印刷/CRT 终端/战术遥测类高密度数据界面（仪表盘、指挥中心、作品集、编辑型页面）时使用；用刚性 CSS Grid、极端字号反差、纯功能配色与模拟模拟信号劣化（半调、扫描线、抖动）产出原始机械质感的前端代码与视觉规范；不适用于消费级温暖品牌、无障碍敏感流程，也不可在同一界面混用明色印刷与暗色遥测两套基底。触发词：野兽派、brutalist、遥测 UI、CRT 终端、瑞士印刷
domain: 创意/design
triggers: [野兽派, brutalist, 工业风 UI, 瑞士印刷, CRT 终端, 扫描线, 战术遥测, telemetry HUD, 等宽字体仪表盘, 半调抖动, 1-bit dithering, 高密度数据界面, ASCII 框线, 指挥中心 UI]
tags: [创意/design, 前端, ui设计, 野兽派, 瑞士印刷, crt, 遥测, css grid]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [HTML/CSS, CSS Grid, SVG 滤镜, clamp() 流式字体, 等宽/重无衬线字体]
requires: []
related: [high-end-visual-design, minimalist-editorial-ui, glassmorphism-ui-design, ui-design-system-builder]
combines_with: [tailwind-css-patterns, frontend-design, d3js-data-viz]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 用户想要野兽派、工业风、瑞士印刷、CRT 终端、战术遥测或 HUD 风格的界面。
- 构建数据密集的仪表盘、指挥中心、作品集、编辑型页面，要求原始、机械、硬核的气质。
- 设计需要明确拒绝柔和渐变、圆角消费 UI、玻璃拟态与千篇一律的 SaaS 卡片。

不该用的边界：
- 风格刻意严苛，不适合消费产品、无障碍敏感流程，或需要温暖柔和调性的品牌。
- CRT、半调、抖动、劣化等效果必须先过可读性、对比度与晕动症（motion sensitivity）测试。
- **禁止在同一界面混用「明色瑞士印刷」与「暗色战术遥测」两套基底**，除非用户明确要求受控混合。
- 任务范围/成功标准/权限不清时，先停下确认，不要凭空发挥。

## 步骤

1. **二选一定原型并锁死**（全程不切换、不混用）：
   - 瑞士工业印刷（明）：新闻纸底、巨型重无衬线、可见分隔线网格、超大出血字符、主红预警。
   - 战术遥测/CRT（暗）：暗底、高密度表格、等宽字体主导、ASCII 框线/十字线、磷光辉光+扫描线+低位深。
2. 据所选原型定**配色基底**（见指令，单一基底贯穿全局）。
3. 搭**蓝图网格**：严格 CSS Grid，元素锚定到轨道与交点，不浮动；用可见实线边框划分信息区。
4. 排**字体架构**：宏观重无衬线（结构标题）+ 微观等宽（数据/元信息），全大写。
5. 加**工业符号与劣化效果**：ASCII 框线、十字线、条码、警示条纹、半调/扫描线/噪点。
6. 自检可读性、对比度与 reduced-motion 降级后交付，附组件用法说明。

## 指令

**字体架构**（排版是主结构，图像次要）：
- 宏观（结构标题）：Neo-Grotesque/重无衬线（Inter Black、Archivo Black、Monument Extended）。流式巨号 `clamp(4rem, 10vw, 15rem)`；字距极紧常为负 `-0.03em ~ -0.06em`；行高压缩 `0.85 ~ 0.95`；全大写。
- 微观（数据/遥测）：等宽（JetBrains Mono、IBM Plex Mono、Space Mono、VT323）。固定小号 `10px ~ 14px`；字距宽松 `0.05em ~ 0.1em` 模拟打字机矩阵；行高 `1.2 ~ 1.4`；全大写。
- 衬线（纹理反差）：Playfair Display 等，极少量使用，且必须经半调/1-bit 抖动重处理，破坏矢量完美感。

**配色系统**（禁止渐变、柔和投影、半透明）：
- 瑞士印刷（明）：背景 `#F4F4F0` / `#EAE8E3`；前景 `#050505 ~ #111111`；唯一强调色 航空危险红 `#E61919` / `#FF2A2A`。
- 战术遥测（暗）：背景 `#0A0A0A` / `#121212`（**避免纯 `#000000`**）；前景 白磷光 `#EAEAEA`；同款红 `#E61919` / `#FF2A2A`；终端绿 `#4AF626` 可选，**仅用于单个特定元素**（一个状态指示/读数），绝不做通用文字色，无明确用途则删掉。

**布局工程**：
- 网格确定性：`display: grid; gap: 1px;` + 父子背景色反差，免边框声明即生成数学级细分隔线。
- 可见隔间：`1px`/`2px solid` 实线划分区块；`<hr>` 横贯整宽分隔操作单元。
- 双模密度：极端数据密集（等宽元信息簇）与大片留白（框住宏观巨字）交替。
- 几何刚性：**绝对禁止 `border-radius`**，所有角必须 90 度。

**符号与劣化**：
- ASCII 框线 `[ DELIVERY SYSTEMS ]`、`< RE-IND >`；方向符 `>>>` `///` `\\\`；十字线 `+` 置于网格交点；条码竖线、警示横条；`®`/`©`/`™` 作几何结构件而非法律文本；随机串 `REV 2.6`、`UNIT / D-01` 模拟机械活动。

**工程指令**：
- 语义刚性：用 `<data>` `<samp>` `<kbd>` `<output>` `<dl>` 精确表达遥测的技术属性。
- 仅对宏观字体用 `clamp()` 保证跨视口激进缩放且结构稳定。

## 示例

CRT 扫描线背景（暗色遥测）：

```css
body {
  background:
    repeating-linear-gradient(0deg,
      transparent, transparent 2px,
      rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px);
}
```

蓝图网格细分隔线（gap 描边法）：

```css
.grid {
  display: grid;
  gap: 1px;
  background: #050505;       /* 父背景=线色 */
}
.grid > * {
  background: #F4F4F0;       /* 子背景=底色，1px 缝即细线 */
}
```

宏观巨字（结构标题）：

```css
.headline {
  font: 900 clamp(4rem, 10vw, 15rem)/0.9 "Archivo Black", sans-serif;
  letter-spacing: -0.05em;
  text-transform: uppercase;
}
```

## 注意事项

- 半调/抖动/扫描线/噪点务必实测可读性、对比度与晕动症，给运动敏感用户提供 `prefers-reduced-motion` 降级。
- 一套基底（明/暗）贯穿到底，切勿中途混用——这是本风格最易翻车点。
- 终端绿是「一处」而非「一类」：除单一指示元素外不得外溢成正文色。
- 全局噪点用低不透明 SVG 滤镜统一物理颗粒感，但别压垮文字对比。
- 别把产出当作环境内验证或专家评审的替代；交付前在目标环境实测渲染与性能。

## 互见

- related：`glassmorphism-ui-design`（同源对立风格，风格选型时可对照取舍）、`frontend-design`、`design-spells-microinteractions`。
- combines_with：`tailwind-css-patterns`（工具类落地网格与配色）、`theme-factory`、`ui-design-system-builder`（沉淀成可复用设计系统）。

---

采编自 sickn33/antigravity-awesome-skills（MIT）。
