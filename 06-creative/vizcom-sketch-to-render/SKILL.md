---
name: vizcom-sketch-to-render
title: Vizcom 草图转渲染：产品设计稿转全保真 3D
description: 当需把粗略草图/线稿/文字概念变成产品级照片真实渲染或探索造型材质变体时使用；用 Vizcom 写精准带权重提示词产出高保真 3D 风格效果图；不适用于平面 UI、Logo、插画或需工程验证的成品决策；触发词：产品渲染、草图转渲染、Vizcom、概念效果图、材质质感
domain: 创意/image
triggers: [把草图变成效果图, 产品概念渲染, Vizcom 渲染, 硬件外观可视化, 草图转 3D 渲染, 工业设计效果图, concept render]
tags: [创意, 产品设计, AI渲染, 工业设计, Vizcom, 效果图]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Vizcom]
requires: []
related: [fal-ai-media-generation, minimax-media-cli, high-end-visual-design, canvas-design]
combines_with: [seo-image-generator, demo-video-generator]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 设计实体产品（家具、电子产品、交通工具、消费品）并需要专业、有冲击力的效果图。
- 用户给出草图、线稿、3D 模型截图或文字描述，要转成照片级真实渲染。
- 为硬件或实体形态项目生成「氛围图 / 概念图」，探索造型、配色、材质变体。

不该用（负边界）：
- 平面 UI / 网页 / Logo / 矢量插画——这类无关 3D 形态与材质的任务。
- 把渲染图当作可直接落地的工程结论：它不替代结构验证、测试或专家评审。
- 缺少关键输入（参考图、产品类别、风格意图、成功标准）时——先停下来追问，不要硬猜。

## 步骤

1. 分析输入：判断用户给的是草图、3D 模型截图，还是纯文字描述，据此决定起手方式。
2. 定义风格：选定具体的 **Render Style**（渲染风格）。出最终视觉用 `Photorealistic`；想在已有结果上迭代提质用 `Refine`。
3. 起草高级提示词：用描述性形容词 + 提示词权重，强调高端材质与质感。例如：`Sleek, avant-garde coffee machine, brushed titanium, matte black accents, dramatic studio lighting`。
4. 迭代探索：借助 Vizcom 的多种渲染模式与无限画布（infinite canvas），反复微调纹理、配色、形态，直到效果出彩。
5. 定稿：交付高保真渲染结果。

## 指令

- 拒绝平庸：主动追求现代、有创意、视觉惊艳的设计；不要套用大众化、保守、无聊的产品造型。
- 材质要精确：务必指定具体材质纹理（如 `anodized aluminum` 阳极氧化铝、`frosted glass` 磨砂玻璃、`carbon fiber` 碳纤维），避免 AI 常见的「塑料感」廉价观感。
- 灯光是关键：提示词里必须包含打光方向/风格（如 `cinematic lighting` 电影感布光、`high contrast shadows` 高对比阴影），以提升画面张力。

## 示例

文字概念 → 高保真渲染提示词：

```
Sleek, avant-garde coffee machine,
brushed titanium body, matte black accents,
dramatic studio lighting, high contrast shadows,
photorealistic
```

迭代提质（在草稿基础上）：选 `Refine` 风格，叠加更精确的材质词（如 `frosted glass top, anodized aluminum frame`）与打光词，在无限画布上做配色/形态变体对比。

## 注意事项

- 仅在任务确实落在上述范围内时使用本技能。
- 渲染输出仅为视觉概念，不可替代针对具体环境的验证、测试与专家评审。
- 若必要输入、权限、安全边界或成功标准缺失，应停下并请求澄清。

## 互见

- 创意/misc 域下其他「概念图 / 视觉生成」类技能。

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
