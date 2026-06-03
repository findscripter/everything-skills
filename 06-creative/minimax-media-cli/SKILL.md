---
name: minimax-media-cli
title: MiniMax 多模态生成 CLI
description: 当需要在终端用 MiniMax 平台批量生成文本/图像/视频/语音/音乐、做联网搜索或图像理解时使用；用 mmx CLI 配 agent 旗标（--non-interactive/--quiet/--output json/--async）产出媒体文件或 JSON；不适用于未装 mmx 或未鉴权、需精细本地剪辑调色（回退 ffmpeg）、或想走 fal.ai/ElevenLabs 等其他供应商的场景；触发词：mmx、MiniMax、文生视频、文生图、文字转语音、生成音乐、海螺、Hailuo
domain: 创意/av
triggers: [mmx, MiniMax CLI, 海螺/Hailuo 生成视频, 文生图/文生视频, 文字转语音/TTS, 生成音乐/BGM, MiniMax 联网搜索, 图像理解/vision describe, mmx auth login, 终端批量生成媒体]
tags: [创意, 视听, 媒体生成, minimax, mmx, cli, 文生图, 文生视频, tts, 音乐生成, hailuo, 联网搜索, vlm]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [mmx-cli, MiniMax, node, npm]
requires: []
related: [fal-ai-media-generation, demo-video-generator, magic-motion-animator, videodb-perception-editing]
combines_with: [ai-native-cli-design, algorithmic-art]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
通过 `mmx` 终端 CLI 调用 MiniMax AI 平台：一条命令完成文本对话、图像/视频/语音/音乐生成、联网搜索与图像理解（VLM）。所有生成在 MiniMax 服务端完成，本地只下发参数、取回文件或 JSON。专为非交互（agent/CI）场景设计：固定旗标即可拿到纯数据 stdout 与可判定的退出码。

## 何时使用

适用：
- 在终端批量/可编排地生成媒体：文生图、文/图生视频（海螺 Hailuo）、文字转语音、生成音乐/BGM、联网搜索、对图提问（vision）。
- 用户说「用 mmx…」「MiniMax 生成一段视频」「海螺文生视频」「文字转语音」「生成一段背景音乐」「MiniMax 联网搜一下」。
- 想把媒体生成串进脚本/流水线，要求机读 JSON 输出与明确退出码。

不该用（负边界）：
- 未安装 `mmx` 或未鉴权（无 API key / OAuth）：任何 API 命令都会失败（退出码 3），先安装并登录，key 由用户提供，你不要读写。
- 需要精细本地剪辑（转场、变速、裁切调色、多轨混音、时间轴拼接）：mmx 只「生成」，这类编辑回退 ffmpeg 或 `videodb-perception-editing`。
- 想走 fal.ai / ElevenLabs / Veo 等其他供应商：用 `fal-ai-media-generation` 或对应直连 API，本技能仅覆盖 MiniMax。

## 步骤

1. 安装并鉴权：`npm i -g mmx-cli` → `mmx auth login --api-key sk-xxxxx`（OAuth 落 `~/.mmx/credentials.json`，API key 落 `~/.mmx/config.json`）。用 `mmx auth status` 确认生效。
2. 选子命令：text chat / image generate / video generate / speech synthesize / music generate / search query / vision describe。
3. agent 场景一律加 agent 旗标（见「指令」），拿纯数据与可判定退出码。
4. 视频等异步任务：`--async` 立即拿 taskId，再轮询 `video task get`、最后 `video download`；或直接 `--download` 阻塞等完。
5. 取回文件/URL/JSON，按退出码判定成败（见下表），失败别死等。

## 指令

agent/CI 旗标（非交互场景必带）：

| 旗标 | 作用 |
|---|---|
| `--non-interactive` | 缺参直接失败，不弹交互提示 |
| `--quiet` | 关进度条，stdout 为纯数据 |
| `--output json` | 机读 JSON 输出 |
| `--async` | 立即返回 taskId（视频生成） |
| `--dry-run` | 只预览 API 请求不执行 |
| `--yes` | 跳过确认提示 |

区域自动探测，可用 `--region global` / `--region cn` 覆盖。

退出码：`0` 成功 / `1` 一般错误 / `2` 用法错误 / `3` 鉴权失败 / `4` 配额超限 / `5` 超时 / `10` 触发内容过滤。

子命令与默认模型：
- `text chat --message <text>`（默认 `MiniMax-M2.7`，多轮加 `--system`，可 `--messages-file -` 从文件/管道读）
- `image generate --prompt <text>`（`image-01`，`--n` 多图，`--out-dir` 落盘目录）
- `video generate --prompt <text>`（默认 `MiniMax-Hailuo-2.3`，异步，默认轮询到完成）
- `speech synthesize --text <text>`（默认 `speech-2.8-hd`，上限 1 万字，`--out` 落盘，`--text-file -` 读管道）
- `music generate --prompt <text>`（`music-2.6-free`，`--instrumental` 纯器乐，`--lyrics <text>` 指定歌词，`--lyrics-optimizer` 自动写词）
- `search query --q <text>`（MiniMax 联网搜索）
- `vision describe --image <file> --prompt <text>`（VLM 图像理解）

## 示例

文本对话（机读）：
```bash
mmx text chat --message "user:What is MiniMax?" --output json --quiet
```

文生图（多图落盘）：
```bash
mmx image generate --prompt "A cat in a spacesuit" --n 3 --out-dir ./gen/ --quiet
```

文生视频——非阻塞拿 taskId / 阻塞下载：
```bash
mmx video generate --prompt "A robot." --async --quiet
mmx video generate --prompt "Ocean waves." --download ocean.mp4 --quiet
```

文字转语音 / 生成音乐：
```bash
mmx speech synthesize --text "Hello world" --out hello.mp3 --quiet
mmx music generate --prompt "Cinematic orchestral, building tension" --instrumental --out bgm.mp3 --quiet
```

管道编排——生成图再描述 / 异步视频全流程：
```bash
URL=$(mmx image generate --prompt "A sunset" --quiet)
mmx vision describe --image "$URL" --quiet

TASK=$(mmx video generate --prompt "A robot" --async --quiet | jq -r '.taskId')
mmx video task get --task-id "$TASK" --output json
mmx video download --task-id "$TASK" --out robot.mp4
```

## 注意事项

- 未鉴权一切免谈：先 `mmx auth login` 并 `auth status` 确认；key 由用户提供，你不要读写凭证文件。
- agent 场景固定带 `--non-interactive --quiet --output json`，否则会被交互提示卡住或拿到带进度条的脏输出。
- 媒体任务可能异步、配额受限或区域受限：视频用 `--async` + 轮询，按退出码（3 鉴权 / 4 配额 / 5 超时 / 10 内容过滤）显式处理，别死等。
- 语音上限 1 万字；超长先切分。
- 本技能只讲 CLI 用法，不替代供应商政策审查、内容安全检查与产物文件校验。

## 互见

- related：`fal-ai-media-generation` —— 另一套多模态生成（fal.ai，含 Veo/Kling/Seedance 等），换供应商时对照选型。
- related：`videodb-perception-editing` —— 承接 mmx 生成后的视频感知索引与服务端时间轴剪辑。
- related：`demo-video-generator` —— 从零渲染演示视频，与纯 AI 生成互补。
- combines_with：`videodb-perception-editing` —— mmx 出素材 + VideoDB 编排时间轴，串成完整媒体流水线。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
