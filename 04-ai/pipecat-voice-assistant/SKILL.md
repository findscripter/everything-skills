---
name: pipecat-voice-assistant
title: Pipecat 低延迟语音助手
description: 当需要用 Pipecat 搭建实时对话式语音 Agent、把多家服务商（OpenAI STT/TTS、Google Gemini LLM）串成一条低延迟语音流水线时使用；做基于 Mic→VAD→STT→LLM→TTS→Speaker 的本地语音助手并产出可运行 Python 脚本与配置；不适用于端到端 speech-to-speech 一体模型、电话/WebRTC 远程接入或非 Pipecat 框架。触发词：Pipecat、语音助手、低延迟语音流水线
domain: 智能/agents
triggers: [Pipecat, 语音助手, 低延迟语音, voice agent, STT TTS LLM 流水线, 实时对话语音, Gemini 语音, 本地麦克风助手]
tags: [pipecat, voice, 语音助手, gemini, openai, python, 智能体]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [pipecat, python, pip]
requires: []
related: [azure-realtime-voice-ai, agentphone-voice-sms-agents, local-llm-inference, claude-api]
combines_with: [twilio-communications, cost-aware-llm-pipeline, langgraph-agent-framework]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 需要搭建**实时、对话式**的本地语音 Agent（麦克风进、扬声器出）。
- 使用 **Pipecat** 框架做「流水线式」AI 编排，需要对每一级（STT/LLM/TTS）单独可控。
- 需要把**多家服务商**拼到同一条语音回路里（如 STT/TTS 用 OpenAI、LLM 用 Google Gemini）。
- 想做战术风/角色化（如 Iron Man 式）的语音助手。

**不该用的边界：**

- 追求极致整体延迟、不需要分级控制时，优先考虑**端到端 speech-to-speech 一体模型**，而非本流水线。
- 需要**电话、WebRTC、浏览器远程**等非本地音频接入时，本骨架默认走本地硬件 Transport，需另换 transport。
- 非 Pipecat 框架、或只想做纯文本对话时不适用。
- 任务范围与上文不符、缺少 API Key / 硬件权限 / 成功标准时，停下来先确认。

## 步骤

### 1. 安装依赖

```bash
pip install pipecat-ai[openai,google,silero] python-dotenv
```

`silero` 提供本地 VAD（语音活动检测），`openai`/`google` 为对应服务商扩展。

### 2. 配置环境变量

新建 `.env`：

```env
OPENAI_API_KEY=your_openai_key
GOOGLE_API_KEY=your_google_key
```

### 3. 运行 Agent

```bash
python scripts/friday_agent.py
```

## 指令

组装一条线性流水线：`Mic -> VAD -> STT -> LLM -> TTS -> Speaker`。各级推荐配置：

- **STT**：OpenAI Whisper（`whisper-1`）或 `gpt-4o-transcribe`。
- **LLM**：Google Gemini 2.5 Flash（经兼容垫片接入）。
- **TTS**：OpenAI TTS（`nova` 音色），**输出 24kHz**。
- **VAD**：Silero（本地硬件鲁棒，抑制背景噪声误触发 LLM）。
- **Transport**：本地音频（硬件麦克风/扬声器）。

**Gemini 兼容垫片（关键约束）：** Gemini 的消息格式与 Pipecat 聚合器默认期望的 OpenAI 标准不同，脚本须提供 `GoogleSafeContext` 与 `GoogleSafeMessage` 两个类，把 OpenAI 风格的 dict 翻译成 Gemini 的 schema，否则会报「Validation error」。

## 示例

战术风系统提示与开场白（数据密集、零寒暄，便于压低延迟）：

- 开场：`Systems nominal. Ready for commands.`
- 反例（避免）：`Hello, how can I help you today?`

要点：响应要短、信息密度高，省去礼貌性填充语，直接压缩端到端延迟。

## 注意事项

- **采样率必须对齐**：OpenAI TTS 输出 24kHz，务必让 `audio_out_sample_rate` 与之匹配，否则音频会变尖（过快）或拖慢。
- **优先用 Silero VAD**：避免背景噪声触发 LLM，节省 token 与延迟。
- **音频卡顿/延迟**：检查 `OUTPUT_DEVICE` 索引；用类似 `test_audio_output.py` 的脚本枚举出本机正确的硬件设备索引。
- **消息格式校验报错**：确认 `GoogleSafeContext` 垫片正确地把 OpenAI 风格 dict 转成 Gemini schema。
- 产出不能替代针对具体环境的验证、测试与专家评审。

## 互见

- `voice-agents` — 语音 AI 的通用原则。
- `agent-tool-builder` — 给语音助手挂工具（搜索、控灯等）。
- `llm-architect` — LLM 层优化。

---

采编自 sickn33/antigravity-awesome-skills（MIT）。
