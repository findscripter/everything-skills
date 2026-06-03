---
name: azure-realtime-voice-ai
title: Azure 实时语音 AI 应用构建
description: 当需用 Azure AI VoiceLive SDK（Python）通过 WebSocket 构建低延迟双向语音对话、实时语音助手或电话语音机器人时使用；做的事：建立异步连接、配置 session/语音/VAD、流式收发 PCM16 音频、处理事件与函数调用，产出可运行的实时语音应用骨架；不适用于：非 Azure 语音栈、批量离线语音转写、纯文本 LLM 对话。触发词：Azure 实时语音、VoiceLive、gpt-4o-realtime、语音助手 WebSocket
domain: 智能/model-ops
triggers: [Azure 实时语音, VoiceLive, azure-ai-voicelive, gpt-4o-realtime-preview, 实时语音助手, 双向语音 WebSocket, 语音对话机器人, server_vad / azure_semantic_vad, PCM16 音频流, DefaultAzureCredential 语音]
tags: [智能, misc, azure, 语音ai, 实时音频, websocket, python, gpt-4o-realtime, vad, function-calling]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Python, azure-ai-voicelive, azure-identity, aiohttp, asyncio]
requires: []
related: [claude-api, local-llm-inference, vercel-ai-sdk]
combines_with: [websocket-realtime-engineer, twilio-communications, production-llm-app-builder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用场景：

- 用 Python `azure-ai-voicelive` SDK 通过 WebSocket 搭建**低延迟双向语音对话**（语音助手、客服机器人、电话语音网关）。
- 需要**流式收发音频**（边说边听）、服务端/语义 VAD 自动断句、实时转写、语音内函数调用（function calling）。
- 接入 `gpt-4o-realtime-preview` 等实时模型，且后端为 Azure 认知服务端点。

不该用（负边界）：

- 非 Azure 语音栈（如 OpenAI Realtime 直连、其他云厂商语音 SDK）。
- 离线/批量语音转写、TTS 文件合成等非实时场景——应改用对应批处理服务。
- 纯文本 LLM 对话——无需音频通道时本技能过重。

## 步骤

1. **安装依赖**：`pip install azure-ai-voicelive aiohttp azure-identity`
2. **配置环境变量**：设置端点 `AZURE_COGNITIVE_SERVICES_ENDPOINT`（形如 `https://<region>.api.cognitive.microsoft.com`）；生产环境用托管身份认证，避免裸 API Key。
3. **建立异步连接**：用 `connect()` 异步上下文管理器，优先传 `DefaultAzureCredential()` 并指定 `credential_scopes=["https://cognitiveservices.azure.com/.default"]`，传入 `model`。
4. **更新 session**：调 `conn.session.update(session=...)` 设置 `instructions`、`modalities`、`voice`、音频格式、`turn_detection`、`tools`。
5. **音频收发**：上行用 `conn.input_audio_buffer.append(audio=b64)`（Base64 PCM16）；下行监听 `response.audio.delta` 事件并 `base64.b64decode` 播放。
6. **事件循环**：`async for event in conn` 按 `event.type` 分发——会话/语音起止/转写/响应/函数调用/错误。
7. **函数调用回填**：收到 `response.function_call_arguments.done` 后，`conversation.item.create` 写回 `function_call_output`，再 `conn.response.create()` 触发后续响应。
8. **错误处理**：捕获 `ConnectionClosed` / `ConnectionError`，并对 `event.type == "error"` 单独处理。

## 指令

- 认证（生产首选托管身份）：

```python
from azure.ai.voicelive.aio import connect
from azure.identity.aio import DefaultAzureCredential

async with connect(
    endpoint=os.environ["AZURE_COGNITIVE_SERVICES_ENDPOINT"],
    credential=DefaultAzureCredential(),
    model="gpt-4o-realtime-preview",
    credential_scopes=["https://cognitiveservices.azure.com/.default"],
) as conn:
    ...
```

API Key 方式（不推荐生产）：用 `AzureKeyCredential(os.environ["AZURE_COGNITIVE_SERVICES_KEY"])` 替换 credential，可省 scopes。

- 连接资源（`VoiceLiveConnection`）：

| 资源 | 作用 | 关键方法 |
|------|------|---------|
| `conn.session` | 会话配置 | `update(session=...)` |
| `conn.response` | 模型响应 | `create()`、`cancel()` |
| `conn.input_audio_buffer` | 音频输入 | `append()`、`commit()`、`clear()` |
| `conn.output_audio_buffer` | 音频输出 | `clear()` |
| `conn.conversation` | 会话状态 | `item.create()`、`item.delete()`、`item.truncate()` |
| `conn.transcription_session` | 转写配置 | `update(session=...)` |

- 音频格式：`pcm16`(24kHz 默认) / `pcm16-16000hz`(语音助手) / `pcm16-8000hz`、`g711_ulaw`(美)、`g711_alaw`(欧)(电话)。
- 语音：`alloy/echo/shimmer/sage/coral/ash/ballad/verse`；Azure 专属用 `AzureStandardVoice` / `AzureCustomVoice` / `AzurePersonalVoice`。
- 断句（turn_detection）：`{"type":"server_vad","threshold":0.5,"silence_duration_ms":500}`；更智能用 `azure_semantic_vad` / `azure_semantic_vad_en` / `azure_semantic_vad_multilingual`。

## 示例

最小可运行骨架（监听转写与响应完成）：

```python
import asyncio, os
from azure.ai.voicelive.aio import connect
from azure.identity.aio import DefaultAzureCredential

async def main():
    async with connect(
        endpoint=os.environ["AZURE_COGNITIVE_SERVICES_ENDPOINT"],
        credential=DefaultAzureCredential(),
        model="gpt-4o-realtime-preview",
        credential_scopes=["https://cognitiveservices.azure.com/.default"],
    ) as conn:
        await conn.session.update(session={
            "instructions": "你是一个乐于助人的语音助手。",
            "modalities": ["text", "audio"],
            "voice": "alloy",
        })
        async for event in conn:
            if event.type == "response.audio_transcript.done":
                print(f"转写: {event.transcript}")
            elif event.type == "response.done":
                break

asyncio.run(main())
```

事件分发 + 函数调用回填（核心片段）：

```python
async for event in conn:
    match event.type:
        case "input_audio_buffer.speech_started":   # 用户开始说话（可用于打断）
            await conn.response.cancel()
            await conn.output_audio_buffer.clear()
        case "conversation.item.input_audio_transcription.completed":
            print(f"用户: {event.transcript}")
        case "response.audio.delta":
            await play_audio(base64.b64decode(event.delta))
        case "response.function_call_arguments.done":
            result = handle_function(event.name, event.arguments)
            await conn.conversation.item.create(item={
                "type": "function_call_output",
                "call_id": event.call_id,
                "output": json.dumps(result),
            })
            await conn.response.create()
        case "error":
            print(f"错误: {event.error.code} - {event.error.message}")
```

手动断句（关闭 VAD）：`session.update(session={"turn_detection": None})`，随后 `append()` → `commit()`(结束用户轮次) → `response.create()`(触发响应)。

## 注意事项

- **生产用托管身份**（DefaultAzureCredential），API Key 仅限本地调试，勿入库。
- 上行音频须为 **16-bit PCM、单声道**，按所选格式匹配采样率（默认 24kHz），再 Base64 编码。
- **打断处理**：收到 `speech_started` 时同时 `response.cancel()` 与 `output_audio_buffer.clear()`，否则旧音频会继续播。
- 电话场景选 `g711_ulaw/alaw` 或 8kHz PCM 以匹配链路带宽。
- 事件类型字符串需精确匹配（如 `response.audio.delta` vs `response.audio_transcript.delta`），易混淆。
- 始终捕获 `ConnectionClosed` / `ConnectionError`，并区分网络断连与业务 `error` 事件。
- 本技能产出为骨架，需结合实际麦克风/扬声器 IO 与环境凭据自行联调验证。

## 互见

- 源技能内置参考：`references/api-reference.md`（详细 API）、`references/examples.md`（完整示例）、`references/models.md`（模型与类型）。
- 同域「智能/misc」下其他 LLM/语音相关技能。
- 如需纯文本 Claude/Anthropic 应用，转 `claude-api`。

---

采编自 sickn33/antigravity-awesome-skills（MIT License）。
