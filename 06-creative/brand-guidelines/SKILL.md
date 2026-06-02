---
name: brand-guidelines
title: 品牌视觉规范（Anthropic）
description: 当需要把 Anthropic 官方品牌配色与字体应用到 PPT/文档/网页等产物（后处理统一观感）时使用；做品牌色与排版的批量套用并产出符合规范的成品；不适用于自定义品牌识别系统设计或 logo 制作；触发词：品牌色、Anthropic 风格、配色规范、字体规范、visual identity、brand colors、typography
domain: 创意/brand
triggers: [品牌色, Anthropic 风格, 配色规范, 字体规范, visual identity, brand colors, typography]
tags: [brand, design, color, typography, pptx]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python-pptx]
requires: []
related: [theme-factory, ui-design-system-builder, canvas-design]
combines_with: [theme-factory, python-pptx-deck-generator, web-artifacts-builder]
license: Apache-2.0
source: anthropics/skills
source_license: Apache-2.0
---
## 何时使用

- 需要给幻灯片、文档、网页或图形产物套上 Anthropic 官方观感（配色 + 字体）做后处理统一时。
- 已有内容只缺「品牌化」一步：把标题改成品牌字体、正文改成阅读字体、图形换成品牌强调色、文字颜色按背景自动取深/浅。
- 触发词：品牌色、Anthropic 风格、配色规范、字体规范、visual identity、brand colors、typography。

不该用的边界：

- 不做品牌识别系统设计、logo 设计、品牌叙事策略——本技能只「套用」既定规范，不「创造」规范。
- 不替代版式/构图设计；幻灯片或画布的布局交给 `canvas-design`，前端样式系统交给 `frontend-design`。
- 仅承载 Anthropic 这一套色板与字体；其它公司的品牌规范不适用（换品牌时需替换下方常量）。

## 步骤 / 指令

固定调色板（RGB 十六进制，务必精确匹配）：

```
主色  Dark       #141413   主文字 / 深色背景
      Light      #faf9f5   浅色背景 / 深底上的文字
      Mid Gray   #b0aea5   次级元素
      Light Gray #e8e6dc   轻背景
强调  Orange     #d97757   主强调色
      Blue       #6a9bcc   次强调色
      Green      #788c5d   第三强调色
```

字体规范：

- 标题（≥24pt）：Poppins，回退 Arial。
- 正文：Lora，回退 Georgia。
- 字体最好预装在环境中；缺失时按上述回退，保证跨系统可读。

套用流程：

```
1. 定背景基调：深底用 Dark，浅底用 Light/Light Gray。
2. 文字配色（对比自适应）：深背景上文字用 Light，浅背景上文字用 Dark。
3. 字体：标题(≥24pt)→Poppins，正文→Lora；检测系统字体，缺失则落到 Arial/Georgia。
4. 图形/非文字形状：按 Orange→Blue→Green 顺序循环取强调色，保持画面活力又不离规范。
5. 保留原有层级与排版（标题层级、列表、加粗等），只换色与字体，不重排内容。
```

PPTX 场景用 python-pptx 写色与字体（核心约束：用 `RGBColor` 保证色彩保真）：

```python
from pptx.dml.color import RGBColor
from pptx.util import Pt

BRAND = {
    "dark":  RGBColor(0x14, 0x14, 0x13),
    "light": RGBColor(0xfa, 0xf9, 0xf5),
    "accents": [RGBColor(0xd9, 0x77, 0x57),   # orange
                RGBColor(0x6a, 0x9b, 0xcc),   # blue
                RGBColor(0x78, 0x8c, 0x5d)],  # green
}

def style_run(run, is_heading, on_dark):
    run.font.name = "Poppins" if is_heading else "Lora"   # 回退 Arial/Georgia
    run.font.color.rgb = BRAND["light"] if on_dark else BRAND["dark"]

# 形状循环取强调色
shape.fill.solid()
shape.fill.fore_color.rgb = BRAND["accents"][i % 3]
```

## 示例

把一份已有 PPT 品牌化：

```
输入：deck.pptx（默认蓝白配色、Calibri 字体）
处理：
- 封面深底 → Dark；标题字 → Poppins、白色(Light)；副标题 → Lora。
- 正文页浅底 → Light Gray；正文 → Lora、Dark。
- 三个流程框 → 依次 Orange / Blue / Green。
输出：deck_branded.pptx（观感统一，层级与文字内容不变）
```

喂给生成模型的最小指令：

```
按 Anthropic 品牌规范后处理本产物：
- 标题用 Poppins(回退 Arial)，正文用 Lora(回退 Georgia)。
- 文字按背景取色：深底用 #faf9f5，浅底用 #141413。
- 非文字图形按 #d97757→#6a9bcc→#788c5d 循环。
- 只换色与字体，保留原层级与内容。
```

## 注意事项

- 色值必须逐位精确（如 `#d97757`），用 RGB 写入避免色差；不要凭印象近似。
- 标题/正文的分界是字号 ≥24pt 判为标题，决定用 Poppins 还是 Lora。
- 字体缺失要静默回退到 Arial/Georgia，不报错、不留空——可读性优先。
- 强调色只用于非文字形状，且按 橙→蓝→绿 循环；正文文字不要用强调色。
- 单一职责：本技能只做「套规范」，不重排版式、不设计新视觉系统。
- 这是 Anthropic 专属色板；换公司品牌时替换上方常量，不要混用。

## 互见

- related：`canvas-design`（版式与构图）、`frontend-design`（网页样式落地）、`internal-comms`（对内沟通材料常需统一品牌观感）。
- combines_with：`markdown-to-docx`——先转出 Word 文档，再按本规范套色与字体。
