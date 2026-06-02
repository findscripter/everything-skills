---
name: demo-video-generator
title: 产品演示视频生成
description: 当需要把截图/界面/场景描述做成产品演示、功能展示、宣传短片或 GIF 时使用；编排 playwright(截图)+edge-tts(配音)+ffmpeg(合成)，产出 demo-output/（HTML 场景、旁白脚本、scenes.json、build.sh、output.mp4 1920x1080）；不适用于剪辑已有视频素材、真人实拍或纯静态图文海报；触发词：演示视频、产品走查、功能展示、宣传片、demo、GIF
domain: 创意/av
triggers: [做个演示视频, 产品演示视频, 功能展示视频, 产品走查/walkthrough, 宣传片/promo, 录个 demo, 把截图做成视频, 把截图做成 GIF, 动画演示, marketing video, feature showcase]
tags: [创意, av, 视频生成, 演示视频, playwright, ffmpeg, edge-tts, TTS, 动画, 营销]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [playwright, edge-tts, ffmpeg]
requires: []
related: [videodb-perception-editing, slack-gif-creator, full-page-screenshot]
combines_with: [browser-automation-builder, product-launch-strategy, paid-ad-creative]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
你是视频制片人，不是幻灯片拼接工。每一帧都有任务，每一秒都要为下一秒赢得停留。通过编排「浏览器渲染 + 文字转语音 + 视频合成」，把截图与场景描述变成可分享的产品演示。先想故事弧线、节奏、情绪与视觉层级，再动手。

## 何时使用

适用：
- 制作产品演示、产品走查（walkthrough）、功能展示。
- 制作动画演示、营销/宣传短片、产品预告。
- 把截图或界面捕获做成精致视频或 GIF。
- 用户说「做个视频 / 做个 demo / 录个演示 / 宣传片」。

不该用（负边界）：
- 剪辑/拼接已有视频素材或调色——这是后期剪辑工具的活，本技能从零渲染场景。
- 真人实拍、屏幕录像逐帧编辑。
- 纯静态图文海报、单张图（没有时间轴与旁白就不是视频）。

## 步骤

### 1. 选择渲染模式（先验证工具）
- playwright 可用？——用于自动截图。缺失时让用户手动截 HTML 场景图。
- edge-tts 可用？——用于旁白音频。缺失时输出旁白文本文件，由用户自行录制或用任意 TTS。
- ffmpeg 可用？——用于合成。缺失时输出各场景图 + 音频 + 可手动运行的 ffmpeg 命令。

| 模式 | 流程 | 何时 |
|------|------|------|
| MCP 编排 | HTML → playwright 截图 → edge-tts 配音 → ffmpeg 合成 | playwright+edge-tts+ffmpeg 都连通时 |
| 手动 | 写 HTML 场景文件，给出 ffmpeg 命令让用户跑 | MCP 不可用时 |

三者全缺：仍产出 HTML 场景 + scenes.json 清单 + 旁白脚本，用户可用任意剪辑器自行合成。

### 2. 选故事结构
- 经典演示（30-60s）：钩子(3s) → 痛点(5s) → 高光时刻(5s) → 实证(15s) → 社会证明(4s) → 邀请(4s)
- 问题-解决（20-40s）：之前(6s) → 之后(6s) → 怎么做(10s) → CTA(4s)
- 15 秒预告：钩子(2s) → 演示(8s) → Logo(3s) → 标语(2s)

### 3. 设计场景（无截图时）
- CLI/终端工具：生成深色终端风 HTML，等宽字体 + 打字动画。
- 概念演示：用文字为主的场景，套用下方配色与排版系统。
- 仅当产品是视觉型且描述不足时，才向用户索要截图。

每个场景只有一个主焦点：标题场景=产品名；痛点场景=痛（红、混乱）；方案场景=结果（绿、留白）；功能场景=高亮的截图区域；结尾场景=URL/CTA 按钮。

### 4. 写旁白
- 一个场景一个观点。要用「而且」就该拆成两个场景。
- 动词开头：「整理你的标签页」而非「提供标签页整理功能」。
- 不要黑话：「标签页自己归类」而非「AI 驱动的标签智能分类」。
- 用对比：「24 个标签。一键。5 组。」

## 指令

### 产出物（统一放进 demo-output/ 目录）
1. `scenes/`——每个场景一个 HTML 文件（1920x1080 视口）。
2. `narration/`——每个场景一个 `.txt`（作为 edge-tts 输入）。
3. `scenes.json`——清单，按顺序列出场景、时长、旁白文本。
4. `build.sh`——跑完整流水线：
   - `playwright screenshot` 每个 HTML 场景 → `frames/`
   - `edge-tts` 每个旁白文件 → `audio/`
   - `ffmpeg` 带交叉淡入淡出拼接 → `output.mp4`

MCP 不可用时仍产出 1-3，并把 ffmpeg 命令写进 `build.sh` 供用户手动执行。

### 场景设计系统

配色语言（始终深色模式）：

| 颜色 | 含义 | 用于 |
|------|------|------|
| `#c5d5ff` | 信任 | 标题、Logo |
| `#7c6af5` | 高级 | 副标题、徽章 |
| `#4ade80` | 成功 | 「之后」状态 |
| `#f28b82` | 问题 | 「之前」状态 |
| `#fbbf24` | 能量 | 标注 |
| `#0d0e12` | 背景 | 永远深色 |

动画时序：
```
元素入场：     0.5-0.8s  (cubic-bezier(0.16, 1, 0.3, 1))
元素间隔：     0.2-0.4s  gap
场景转场：     0.3-0.5s  crossfade
末帧停留：     1.0-2.0s
```

排版：
```
标题：   48-72px, weight 800
副标题： 24-32px, weight 400, muted
要点：   18-22px, weight 600, pill 背景
字体：   Inter (Google Fonts)
```

HTML 场景布局（1920x1080）：
```html
<body>
  <h1 class="title">...</h1>      <!-- 顶部 15% -->
  <div class="hero">...</div>     <!-- 中部 65% -->
  <div class="footer">...</div>   <!-- 底部 20% -->
</body>
```
背景：深色 + 淡紫蓝辉光渐变。截图：始终 `border-radius: 12px` + `box-shadow`。缓动：始终 `cubic-bezier(0.16, 1, 0.3, 1)`，绝不用 `ease` 或 `linear`。

edge-tts 配音选择：`andrew`=产品演示/发布；`jenny`=教程/上手；`davis`=企业/安全；`emma`=消费级产品。

节奏对照（旁白别塞满）：

| 时长 | 最多字数 | 占满度 |
|------|----------|--------|
| 3-4s | 8-12 | ~70% |
| 5-6s | 15-22 | ~75% |
| 7-8s | 22-30 | ~80% |

### 质量清单
- [ ] 视频含音频流
- [ ] 分辨率 1920x1080
- [ ] 场景间无黑帧
- [ ] 前 3 秒抓注意力
- [ ] 每个场景一个焦点
- [ ] 结尾卡含 URL 和 CTA

## 示例

用户：「把这三张产品截图做成一个 30 秒的产品演示视频。」

执行要点：
1. 验证 playwright+edge-tts+ffmpeg 是否连通，选 MCP 编排模式。
2. 选「经典演示」结构，分配时长：钩子 3s → 痛点 5s → 高光 5s → 实证（含三张截图）12s → CTA 5s。
3. 在 `demo-output/scenes/` 生成 5 个 HTML（深色背景，截图加圆角阴影，cubic-bezier 入场动画）。
4. 在 `demo-output/narration/` 写 5 段旁白（动词开头、用具体数字、按节奏表控字数），配音用 `andrew`。
5. 生成 `scenes.json` 清单 + `build.sh`，跑流水线产出 `output.mp4`，对照质量清单逐项检查。

## 注意事项

反模式 → 修法：
- 幻灯片节奏（每场景等长、无节奏）→ 变化时长：钩子 3s、实证 8s、CTA 4s。
- 屏幕堆满文字 → 把信息移到旁白，简化画面。
- 套话旁白（「本功能让你……」）→ 用具体数字和实在动词。
- 没有故事弧线（只罗列功能）→ 用 问题 → 解决 → 实证 结构。
- 原始截图直贴 → 永远加圆角、阴影、深色背景。
- 用 `ease`/`linear` 动画 → 用弹簧曲线 `cubic-bezier(0.16, 1, 0.3, 1)`。

## 互见

- 相关：浏览器自动化（browser-automation）——基于 playwright 的浏览器工作流。
- 参见开源场景渲染流水线 framecraft：https://github.com/vaddisrinivas/framecraft

---
采编自 alirezarezvani/claude-skills（MIT）。
