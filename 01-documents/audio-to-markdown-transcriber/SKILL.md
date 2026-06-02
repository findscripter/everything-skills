---
name: audio-to-markdown-transcriber
title: 音频转写为结构化 Markdown 文档
description: 当需要把音频/视频录音转成文字并产出结构化 Markdown（含元数据、逐字稿、会议纪要、摘要）时使用；用 Whisper/Faster-Whisper 转写并经 LLM 整理出参与者、议题、决策、待办；不适用于实时流式转写、说话人精确声纹识别或纯听写无结构需求；触发词：转写音频、会议纪要、语音转文字
domain: 文书/writing
triggers: [转写这段音频, 把录音转成文字, 音频转 Markdown, 生成会议纪要, 语音转文字, transcribe audio, 提取会议待办与决策, 给长音频做摘要]
tags: [音频转写, whisper, 会议纪要, 语音转文字, 文书, Markdown, LLM摘要]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Bash, Read, Write, faster-whisper, whisper, ffmpeg, ffprobe]
requires: []
related: [meeting-transcript-analyzer, markdown-to-docx]
combines_with: [doc-coauthoring, professional-proofreader]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：

- 把本地或 URL 的音频/视频转成文字逐字稿（MP3、WAV、M4A、OGG、FLAC、WEBM、MP4）。
- 从录音自动生成会议纪要（参与者、议题、决策、待办）和高管摘要。
- 需要带技术元数据（时长、语言、文件大小、说话人数、转写引擎）的规范化 Markdown 报告。
- 批量转写一个目录下的多个录音。

不该用（负边界）：

- 实时/流式转写或会中实时字幕（本技能针对已落盘文件离线处理）。
- 高精度声纹说话人识别（diarization）——这里只做粗粒度区分，不保证身份准确。
- 仅需纯文本听写、不要任何结构化整理的场景（直接调用 whisper 即可，无需本技能）。
- 飞书妙记等平台已托管的音视频——优先用对应平台技能，不要本地 ffmpeg/whisper。

## 步骤

### 1. 探测转写引擎（零配置）

优先 Faster-Whisper（快 4-5 倍），否则回退原版 Whisper：

```bash
if python3 -c "import faster_whisper" 2>/dev/null; then
    TRANSCRIBER="faster-whisper"
elif python3 -c "import whisper" 2>/dev/null; then
    TRANSCRIBER="whisper"
else
    TRANSCRIBER="none"
fi
command -v ffmpeg >/dev/null && echo "ffmpeg 可用（支持格式转换）"
```

均缺失时给出安装指令（不静默自动装，先征求用户）：`pip install faster-whisper`（推荐）或 `pip install openai-whisper`；格式转换需 `brew install ffmpeg`（macOS）/ `apt install ffmpeg`（Linux）。

### 2. 校验音频并提取元数据

```bash
[[ -f "$AUDIO_FILE" ]] || { echo "文件不存在: $AUDIO_FILE"; exit 1; }

FILE_SIZE=$(du -h "$AUDIO_FILE" | cut -f1)
DURATION=$(ffprobe -v error -show_entries format=duration \
    -of default=noprint_wrappers=1:nokey=1 "$AUDIO_FILE" 2>/dev/null)
FORMAT=$(ffprobe -v error -select_streams a:0 -show_entries \
    stream=codec_name -of default=noprint_wrappers=1:nokey=1 "$AUDIO_FILE" 2>/dev/null)

SIZE_MB=$(du -m "$AUDIO_FILE" | cut -f1)
[[ $SIZE_MB -gt 25 ]] && echo "大文件（$FILE_SIZE）——处理可能需要数分钟，确认继续？"
```

格式不在支持列表时，用 ffmpeg 转 16kHz WAV：

```bash
EXTENSION="${AUDIO_FILE##*.}"
SUPPORTED=("mp3" "wav" "m4a" "ogg" "flac" "webm" "mp4")
if [[ ! " ${SUPPORTED[@]} " =~ " ${EXTENSION,,} " ]]; then
    ffmpeg -i "$AUDIO_FILE" -ar 16000 "${AUDIO_FILE%.*}.wav" -y
    AUDIO_FILE="${AUDIO_FILE%.*}.wav"
fi
```

### 3. 转写并生成结构化 Markdown

用选定引擎转写得到分段（segments），再借 LLM 整理纪要：识别议题（按时间戳聚类）、决策（关键词「决定/同意/批准/decided/agreed」）、待办（关键词「需要/将/应/action/will」），并生成不超过 5 段的执行摘要（Chain of Density 思路）。

### 4. 输出文件（带时间戳避免覆盖）

```bash
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
echo "$TRANSCRIPT_CONTENT" > "transcript-${TIMESTAMP}.md"
[[ -n "$ATA_CONTENT" ]] && echo "$ATA_CONTENT" > "ata-${TIMESTAMP}.md"
```

逐字稿（transcript）与 LLM 处理后的纪要（ata）分开两个文件；清理 metadata.json、transcription.json 等临时件。LLM 处理可选，用户拒绝则只产出逐字稿。

## 指令

- 引擎优先级固定为 Faster-Whisper > Whisper，不要随意切换。
- 缺依赖时先问、不擅自联网安装；大文件（>25MB）先确认再处理。
- 调用本地 LLM CLI 整理纪要时设超时（如 300 秒），失败要回退保留逐字稿：

```python
result = subprocess.run(['claude', '-'], input=full_prompt,
    capture_output=True, text=True, timeout=300)
return result.stdout.strip() if result.returncode == 0 else None
```

- 输出 Markdown 报告固定包含：元数据表（文件名/大小/时长/语言/处理日期/说话人数/引擎）、会议纪要（参与者、议题及时间戳、决策、待办复选框）、执行摘要。

## 示例

输入：`转写为 Markdown：meeting-2026-02-02.mp3`

输出要点：

```
文件: meeting-2026-02-02.mp3 | 大小: 12.3 MB | 时长: 00:45:32
语言: 中文 | 说话人: 4 | 字数: 6842 | 用时: 127s
生成: transcript-*.md（逐字稿）、ata-*.md（纪要）
```

批量：`转写 recordings/*.mp3` → 逐个处理并各产出一份报告，末尾汇总总耗时。

待办条目格式：`- [ ] **任务** - 负责人: {说话人} - 截止: {若提及}`

## 注意事项

- 仅在任务明确落入上述范围时使用；输出不替代针对具体环境的校验、测试或专家复核。
- 若缺少必要输入、权限、安全边界或成功判据，停下并向用户澄清。
- 说话人识别为粗粒度，身份/分段不保证准确，重要场合需人工核对。
- 大文件或长音频转写耗时可能 10-15 分钟，先告知用户预期。
- 跨平台：依赖本地 Python/ffmpeg，不绑定特定项目配置或云 API，遵循零配置理念。

## 互见

- lark-minutes（飞书妙记）：平台托管音视频转纪要/逐字稿，优先于本地 whisper。
- lark-markdown / lark-doc：把产出的 Markdown 报告上传或转为在线文档。
- lark-workflow-meeting-summary：多会议纪要汇总成结构化周报。

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可证）。
