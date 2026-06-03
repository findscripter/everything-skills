---
name: fal-ai-media-generation
title: fal.ai 多模态媒体生成（图像/视频/音频）
description: 当需要用 AI 生成图像、视频或语音/音乐/音效时使用；经 fal.ai MCP 的 search/find/generate/result/upload 等工具运行 Nano Banana、Seedance、Kling、Veo 3、CSM-1B、ThinkSound 等模型，产出图片/视频/音频文件或 URL；不适用于未配置 fal.ai MCP（FAL_KEY）或需精细本地剪辑调色的场景，后者回退 ffmpeg/VideoDB；触发词：生成图片、文生图、做缩略图、文生视频、图生视频、文字转语音、视频配音
domain: 创意/image
triggers: [生成图片/文生图, 图像编辑/重绘风格, 做缩略图/海报, 文生视频, 图生视频, 文字转语音/TTS, 视频配音/视频转音频, 生成音乐/音效, 估算生成成本, 查找媒体生成模型, fal.ai, generate image]
tags: [创意, 媒体生成, fal.ai, mcp, 文生图, 文生视频, 图生视频, tts, 音效, nano banana, seedance, veo 3, kling]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [fal-ai-mcp-server, fal.ai, MCP]
requires: []
related: [slack-gif-creator, algorithmic-art, demo-video-generator, videodb-perception-editing]
combines_with: [ad-creative-generator, mcp-builder, demo-video-generator]
license: MIT
source: affaan-m/everything-claude-code
source_license: MIT
---
# fal.ai 多模态媒体生成（图像/视频/音频）

经 fal.ai MCP 服务器统一调度图像、视频、音频模型：文生图（Nano Banana）、文/图生视频（Seedance、Kling、Veo 3）、文字转语音（CSM-1B）、视频转音频（ThinkSound）。一切生成在 fal.ai 服务端完成，本地只下发参数、取回结果 URL。

## 何时使用

适用：
- 从文本提示生成图像；做缩略图、海报、产品图；对已有图做重绘/风格迁移/局部编辑。
- 从文本或图像生成视频；为视频生成配音/音效；文字转语音、生成音乐/音效。
- 用户说「生成图片」「做个缩略图」「文生视频」「图生视频」「文字转语音」「给这段视频配音」等。

不该用（负边界）：
- 未配置 fal.ai MCP（无 `FAL_KEY`）：所有 `generate` 调用都不可用，先让用户自行配置 key，切勿由你读写 key。
- 需要精细本地剪辑（转场、变速、裁切调色、多轨混音、时间轴拼接）：fal.ai 只做「生成」，这类编辑回退 ffmpeg / `videodb-perception-editing`。
- 专业级人声克隆/配音：用 ElevenLabs 直连 API（见示例），不走 MCP。

## 步骤

1. 确认 MCP 已配置：`~/.claude.json` 加入 fal-ai server（见下）。无 key 则停下来请用户提供。
2. 选模型：迭代用低价快模型（Nano Banana 2 / Seedance），定稿换高保真（Nano Banana Pro）。不确定就先 `search`/`find`/`models` 发现。
3. 贵活先估价：视频等高成本任务先 `estimate_cost`。
4. 需以图/视频为输入时先 `upload` 拿 URL，再把 URL 填进 `image_url`/`video_url`。
5. 运行 `generate`；异步任务用 `status`/`result` 轮询，必要时 `cancel`。
6. 取回结果 URL / 文件，交付或转入后续编辑流程。

## 指令

MCP 配置（`~/.claude.json`，key 申请见 https://fal.ai ）：

```json
"fal-ai": {
  "command": "npx",
  "args": ["-y", "fal-ai-mcp-server"],
  "env": { "FAL_KEY": "YOUR_FAL_KEY_HERE" }
}
```

MCP 工具：`search`（按关键词找模型）/ `find`（看模型参数）/ `generate`（运行）/ `result`、`status`（查异步状态）/ `cancel`（取消）/ `estimate_cost`（估价）/ `models`（热门模型）/ `upload`（上传输入文件）。

图像通用参数：`prompt`(必填) / `image_size`(`square`,`portrait_4_3`,`landscape_16_9`,`portrait_16_9`,`landscape_4_3`) / `num_images`(1-4) / `seed`(整数，复现用) / `guidance_scale`(1-20，越高越贴提示)。

视频通用参数：`prompt`(必填) / `duration`(`"5s"`,`"10s"`) / `aspect_ratio`(`"16:9"`,`"9:16"`,`"1:1"`) / `seed` / `image_url`(图生视频源图)。

选型速查：
- 图像快出/编辑 → `fal-ai/nano-banana-2`；高保真/排版/写实/产品图 → `fal-ai/nano-banana-pro`。
- 视频高动态质量 → `fal-ai/seedance-1-0-pro`；带原生音频 → `fal-ai/kling-video/v3/pro`；带生成音效+高画质 → `fal-ai/veo-3`。
- 语音 → `fal-ai/csm-1b`；视频配音 → `fal-ai/thinksound`。

## 示例

文生图（快速迭代）：

```
generate(model_name: "fal-ai/nano-banana-2", input: {
  "prompt": "a futuristic cityscape at sunset, cyberpunk style",
  "image_size": "landscape_16_9", "num_images": 1, "seed": 42
})
```

高保真产品图：

```
generate(model_name: "fal-ai/nano-banana-pro", input: {
  "prompt": "professional product photo of wireless headphones on marble surface, studio lighting",
  "image_size": "square", "num_images": 1, "guidance_scale": 7.5
})
```

图像编辑（先 upload 再带 `image_url`）：

```
upload(file_path: "/path/to/image.png")
generate(model_name: "fal-ai/nano-banana-2", input: {
  "prompt": "same scene but in watercolor style",
  "image_url": "<uploaded_url>", "image_size": "landscape_16_9"
})
```

文生视频 / 图生视频：

```
generate(model_name: "fal-ai/seedance-1-0-pro", input: {
  "prompt": "a drone flyover of a mountain lake at golden hour, cinematic",
  "duration": "5s", "aspect_ratio": "16:9", "seed": 42
})
# 图生视频：再补 "image_url": "<uploaded_image_url>"
```

文字转语音 / 视频转音频：

```
generate(model_name: "fal-ai/csm-1b", input: {
  "text": "Hello, welcome to the demo.", "speaker_id": 0
})
generate(model_name: "fal-ai/thinksound", input: {
  "video_url": "<video_url>", "prompt": "ambient forest sounds with birds chirping"
})
```

专业人声（ElevenLabs 直连，不走 MCP）：

```python
import os, requests
resp = requests.post(
    "https://api.elevenlabs.io/v1/text-to-speech/<voice_id>",
    headers={"xi-api-key": os.environ["ELEVENLABS_API_KEY"], "Content-Type": "application/json"},
    json={"text": "Your text here", "model_id": "eleven_turbo_v2_5",
          "voice_settings": {"stability": 0.5, "similarity_boost": 0.75}})
open("output.mp3", "wb").write(resp.content)
```

发现模型：`search(query: "text to video")` / `find(model_name: "fal-ai/seedance-1-0-pro")` / `models()`。

## 注意事项

- 无 `FAL_KEY` 一切免谈：先确认 MCP 配好，key 由用户提供，你不要读写它。
- 迭代提示词用 `seed` 复现；先低价模型调通提示，再换 Pro 出最终图。
- 视频提示词描述要聚焦「运动 + 场景」，简洁优先；图生视频比纯文生视频更可控。
- 跑昂贵视频前务必 `estimate_cost`。
- 异步任务别死等，用 `status`/`result` 轮询，跑偏就 `cancel`。
- 精细剪辑/调色/混音不是 fal.ai 的活，回退本地 ffmpeg 或 VideoDB。

## 互见

- related：`videodb-perception-editing` —— 视频感知索引与服务端时间轴编辑，承接 fal.ai 生成后的剪辑/字幕/检索。
- related：`demo-video-generator` —— 从零渲染演示视频，与本技能的纯 AI 生成互补。
- combines_with：`videodb-perception-editing` —— fal.ai 出素材 + VideoDB 编排时间轴，串成完整媒体流水线。

---
采编自 affaan-m/everything-claude-code（MIT）。
