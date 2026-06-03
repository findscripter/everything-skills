---
name: podcast-audio-generation
title: 文本生成播客音频
description: 当需要把文本/文稿转成自然口播的播客音频时使用；经 Azure OpenAI Realtime API（gpt-realtime-mini）走 WebSocket 流式收 PCM 音频+逐字稿，转 WAV 并 base64 回传前端播放；不适用于无 Azure 凭据、要求精确逐字音色克隆或长篇离线批量 TTS 的场景，后者回退专用 TTS；触发词：文本转语音播客、文稿配音、Realtime 语音合成、PCM 转 WAV
domain: 创意/av
triggers: [文本生成播客, 文稿配音/口播, 文本转语音/TTS, Azure Realtime 语音合成, gpt-realtime-mini, PCM 转 WAV, 流式音频合成, base64 音频回传播放]
tags: [创意, 音视频, TTS, 播客, Azure OpenAI, Realtime API, WebSocket, PCM, WAV, 音频流]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, openai, Azure OpenAI Realtime API, WebSocket]
requires: []
related: [azure-realtime-voice-ai, pipecat-voice-assistant, minimax-media-cli, fal-ai-media-generation]
combines_with: [audio-to-markdown-transcriber, demo-video-generator]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
经 Azure OpenAI Realtime API（`gpt-realtime-mini`）把文本叙事实时合成为播客级人声：WebSocket 连接 → 下发文稿 → 流式收 PCM 音频块与逐字稿 → 拼接转 WAV → base64 回传前端播放。合成全在 Azure 端完成，本地只发提示、收音频流。

## 何时使用

适用：
- 把一段文稿/脚本/文章转成自然朗读的播客或口播音频。
- 需要边生成边拿逐字稿（音画对齐、字幕）。
- 用户说「文本生成播客」「给这段文稿配音」「文字转语音」「Realtime 语音合成」等。

不该用（负边界）：
- 无 Azure 凭据（缺 `AZURE_OPENAI_AUDIO_API_KEY`/`ENDPOINT`/`DEPLOYMENT`）：所有调用不可用，先让用户自行配置，切勿由你读写 key。
- 要求精确逐字音色克隆 / 指定真人声纹 → 用 ElevenLabs 等专用克隆服务，不走本流程。
- 长篇离线批量 TTS（无需流式、追求最低单价）→ 回退批式 TTS API；Realtime 偏交互与低延迟，长音频成本与稳定性不占优。

## 步骤

1. 配好环境变量（见下）。注意 `ENDPOINT` 只填基础域名，**不要**带 `/openai/v1/`。
2. 把 HTTPS 端点转成 WebSocket：`https://` → `wss://`，并在末尾补 `/openai/v1`。
3. `client.realtime.connect(model="gpt-realtime-mini")` 建连。
4. `session.update` 设 `output_modalities=["audio"]` 与 `instructions`（旁白人设/语气）；如需指定音色，在 session 里设 `voice`。
5. `conversation.item.create` 塞入待朗读文本（`input_text`），再 `response.create()` 触发生成。
6. 流式消费事件：`response.output_audio.delta`（base64 PCM 块，解码累积）、`response.output_audio_transcript.delta`（逐字稿）、`response.done`（结束跳出）、`error`（读 `event.error.message`）。
7. 拼接 PCM → 转 WAV（24kHz / 16-bit / mono）→ base64 回前端，前端转 Blob 播放。

## 指令

环境配置（`.env`）：

```env
AZURE_OPENAI_AUDIO_API_KEY=your_realtime_api_key
AZURE_OPENAI_AUDIO_ENDPOINT=https://your-resource.cognitiveservices.azure.com
AZURE_OPENAI_AUDIO_DEPLOYMENT=gpt-realtime-mini
```

音色可选（session 的 `voice`）：`alloy`(中性) / `echo`(温暖) / `fable`(富表现) / `onyx`(低沉) / `nova`(亲和) / `shimmer`(清亮)。

关键事件：`response.output_audio.delta`（音频块）、`response.output_audio_transcript.delta`（文本）、`response.done`（完成）、`error`（错误）。

音频格式：输入=文本；输出=PCM（24kHz、16-bit、单声道）；存储=base64 WAV。

## 示例

后端生成（Python，关键约束已内联）：

```python
from openai import AsyncOpenAI
import base64

# HTTPS 端点转 WebSocket URL（务必补 /openai/v1）
ws_url = endpoint.replace("https://", "wss://") + "/openai/v1"
client = AsyncOpenAI(websocket_base_url=ws_url, api_key=api_key)

audio_chunks, transcript_parts = [], []
async with client.realtime.connect(model="gpt-realtime-mini") as conn:
    await conn.session.update(session={
        "output_modalities": ["audio"],
        "instructions": "You are a narrator. Speak naturally.",
    })
    await conn.conversation.item.create(item={
        "type": "message", "role": "user",
        "content": [{"type": "input_text", "text": prompt}],
    })
    await conn.response.create()
    async for event in conn:
        if event.type == "response.output_audio.delta":
            audio_chunks.append(base64.b64decode(event.delta))
        elif event.type == "response.output_audio_transcript.delta":
            transcript_parts.append(event.delta)
        elif event.type == "response.done":
            break

# PCM 拼接 → WAV（24kHz 采样率）
pcm_audio = b"".join(audio_chunks)
wav_audio = pcm_to_wav(pcm_audio, sample_rate=24000)
```

前端播放（base64 WAV → Blob）：

```javascript
const base64ToBlob = (base64, mimeType) => {
  const bytes = atob(base64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type: mimeType });
};
const url = URL.createObjectURL(base64ToBlob(response.audio_data, "audio/wav"));
new Audio(url).play();
```

## 注意事项

- 端点别带 `/openai/v1/`，WebSocket URL 才在末尾补 `/openai/v1`；两处弄反是最常见接不上的原因。
- 凭据由用户配置，你不要读写 key。
- 流式事件要逐类处理，`response.done` 才算完整，`error` 必读 `event.error.message`。
- PCM 转 WAV 务必对齐 24kHz / 16-bit / mono，参数错会变速变调或噪声。
- Realtime 面向低延迟交互，长音频成本/稳定性不占优；纯批量长文 TTS 另选方案。
- 精细剪辑、混音、配乐不是本流程的活，交后续音频编辑环节。

## 互见

- related：`fal-ai-media-generation` —— 同为 AI 媒体生成，覆盖图像/视频/音频多模态，可作通用 TTS 回退或图视配套。
- related：`minimax-media-cli` —— 另一条媒体生成命令行通道，音视频生成互为备选。
- combines_with：`demo-video-generator` —— 本技能产出口播音轨 + 演示视频渲染，组合成带旁白的成片。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
