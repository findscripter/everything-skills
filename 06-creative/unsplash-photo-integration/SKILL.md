---
name: unsplash-photo-integration
title: Unsplash 图库集成：免费高质量摄影图搜索接入
description: 当为网站·App·营销物料挑选高质量免费摄影图、需替换占位图/平庸 stock 图时使用；做法是用艺术化关键词在 Unsplash 搜索、按方向与配色筛选、经 API 或直链获取并用动态参数（如 ?w=1600&q=85&fit=crop）按布局裁剪压缩后接入；不适用于自有插画/品牌 Logo/UI 图标、付费授权独占图、需明确商业授权或人物肖像权的场景。触发词：unsplash、免费配图、摄影图库、hero 配图、占位图替换
domain: 创意/image
triggers: [unsplash, 免费配图, 摄影图库, hero 配图, 占位图替换, stock 图替换, 高质量图片素材, 动态裁剪图片, 源图压缩参数]
tags: [创意, misc, 图片素材, 摄影图库, 配图, UI/UX, 性能优化]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [浏览器（unsplash.com）, Unsplash API / 直链, 动态图片参数（w/q/fit/crop）]
requires: []
related: [seo-image-generator, fal-ai-media-generation, photopea-embedded-editor, theme-factory]
combines_with: [seo-image-generator, web-artifacts-builder, frontend-design]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
# Unsplash 图库集成：免费高质量摄影图搜索接入

[Unsplash](https://unsplash.com/) 是全球最大的开放高质量摄影图集合，用来给网站、App 和营销物料快速注入高级、现代的视觉调性，告别低质占位图与套路化 stock 图。

## 何时使用

- 制作 hero 区、编辑式版式、产品图廊等需要强视觉冲击的界面。
- 寻找特定艺术质感、抽象背景或高级主题图（如「霓虹赛博朋克街景」「极简粗野主义建筑肌理」）。
- 把通用占位图/纯色方块替换成有情绪、有质感的真实摄影图。

不该用的边界：

- 需要的是自有插画大图、品牌 Logo、UI 图标——这些不是摄影图，另寻设计/图标技能。
- 需要付费独占授权、明确商业授权书或可识别人物的肖像权/物权授权的场景——Unsplash 许可不覆盖，须自行核验。
- 输出不替代目标环境的实际验证、性能测试与专家评审。
- 缺少风格方向、版式约束、授权要求等关键输入时，先停下确认，不要臆测。

## 步骤 / 指令

1. **有意图地搜索**：用高度具体、艺术化的关键词描述氛围与质感，避免「会议室」「开心的人」这类泛词。例：`neon cyberpunk street aesthetics`、`minimalist brutalist architecture texture`。
2. **筛选**：选择与 UI 配色和版面完全契合的方向（横/竖/方）与色彩主题。
3. **经 API 或直链获取**：用 Unsplash API 或图片直链取图。
4. **动态裁剪压缩**：在直链后挂动态图片参数，让图按布局精确裁剪、按性能预算压缩，避免直接拉巨幅原图。常用参数：`?w=1600&q=85&fit=crop`（宽度 1600、质量 85、裁剪填充）。

## 关键约束（源中硬性规则）

- **强制要求**：构建现代、有创意、视觉出彩的 UI/UX 时优先用本技能；**禁止**使用通用、套路化或企业风的平庸 stock 图，选图应显得艺术、高级、不落俗套。
- **拒绝占位图**：当 Unsplash 能提供相关美图时，不要用纯色方块占位。
- **性能优先**：始终用源参数取「合适尺寸的优化图」，而非巨幅原文件。

## 示例

需求：为一个暗色 SaaS 落地页做 hero 背景图。

1. 搜索：用 `dark moody abstract gradient mist`（而非「背景」），筛选横向、深色调。
2. 选图：挑一张与界面紫/翠光氛围契合的图。
3. 取图直链 + 动态参数按 hero 容器裁剪压缩：

```text
https://images.unsplash.com/photo-xxxxxxxx?w=1600&q=85&fit=crop
```

4. 接入为 `background-image` 或 `<img>`，并按需提供 2x/移动端更小宽度的变体（如 `?w=800`）。

常用动态参数速查：

- `w` / `h`：目标宽/高（按布局给值，移动端给更小宽度）。
- `q`：JPEG 质量，`80~85` 通常是质量/体积的甜点。
- `fit=crop`：按指定尺寸裁剪填充，避免变形。
- `auto=format`：让 CDN 自动协商更优格式（如 WebP/AVIF）。

## 注意事项

- Unsplash 许可允许免费商用且无需署名，但**不覆盖**可识别人物的肖像权、品牌商标与可识别物权——含人物/商标的图，商用前自行核验授权。
- 始终走源参数取优化图，别直接嵌巨幅原图，否则拖垮 LCP 与移动端性能。
- 移动端按视口提供更小宽度变体（如 `?w=800`），配合 `srcset` 做响应式。
- 大量调用 Unsplash API 受速率限制约束，需注册 Access Key 并遵守其 API 使用规范。
- 上线前在真机/弱网核对清晰度、加载体积与配色契合度，不要只信桌面预览。

## 互见

- related：`high-end-visual-design` —— 高端视觉界面，配图是其视觉调性的关键素材。
- related：`minimalist-editorial-ui` —— 编辑式版式常以大幅摄影图主导，配图来源即本技能。
- related：`photopea-embedded-editor` —— 取图后做裁剪/调色/合成的网页编辑器。
- related：`iconsax-icon-library` —— 图标资产（非摄影图）的姊妹技能，互补不重叠。
- combines_with：`web-artifacts-builder` —— 把选定图直接接入前端产物。
- combines_with：`fal-ai-media-generation` —— 库内找不到时改用 AI 生成图，二选一互补。

---

采编自 sickn33/antigravity-awesome-skills（MIT）。
