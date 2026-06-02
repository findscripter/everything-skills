---
name: videodb-perception-editing
title: VideoDB 视频感知索引与编辑
description: 当需要对视频/音频/直播/桌面会话做感知、索引、按时间戳检索证据、剪辑时间轴、加字幕叠层、转码改比例或生成媒体时使用；用 VideoDB Python SDK 摄入文件/URL/RTSP，建口语与视觉索引，search 返回带时间戳的可播片段，Timeline 编排导出 HLS 流；不适用于无 API key、转场/变速/裁切调色等需本地工具的操作；触发词：视频检索、加字幕、剪辑、转码、改竖屏、RTSP 直播告警、桌面录制
domain: 创意/av
triggers: [视频检索/按时间戳找镜头, 给视频加字幕/烧录字幕, 剪辑时间轴/拼接片段, 转码改分辨率/改比例, 改竖屏/9:16/抖音, RTSP 直播监控告警, 桌面录屏并总结, 建视觉/口语索引, 视频转文字/转录, 生成图像/配音/配乐, VideoDB, video search]
tags: [创意, 视听, VideoDB, 视频索引, 视频检索, 字幕, 转码, Timeline, RTSP, 直播, 桌面录制, 媒体生成, python]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, videodb, python-dotenv]
requires: []
related: [demo-video-generator, youtube-transcript-ingest, slack-gif-creator]
combines_with: [demo-video-generator, audio-to-markdown-transcriber]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
把视频/音频/直播/桌面会话当作「可感知 + 可记忆 + 可动作」的对象：摄入 → 建索引理解 → 按时间戳检索证据 → 时间轴编辑/生成媒体。一切重活在 VideoDB 服务端完成，不在本地编码。

## 何时使用

适用：
- 需要对文件、URL、RTSP 直播或桌面会话做视频/音频感知、索引、检索或时间轴剪辑。
- 任务涉及时间戳、可播放证据、字幕、片段、文字/图像叠层，或实时监控告警。
- 想用一条流水线串起摄入、理解、检索与媒体动作。

不该用（负边界）：
- 没有 `VIDEO_DB_API_KEY`：`videodb.connect()` 直接抛 `AuthenticationError`。让用户自行设置 key，切勿由你读写 key。
- 转场、变速、裁切/缩放、调色、音量混音——VideoDB 不支持，需回退本地工具（ffmpeg/moviepy），这些才是例外。
- 桌面录制仅 macOS 支持；`generate_video()`/`create_collection()` 为套餐限制功能，受限时如实告知用户。
- 纯本地一次性转码/拼接且无需检索/索引——直接用 ffmpeg 更轻。

凡 VideoDB 支持的（裁剪、拼接、叠加音频/音乐、字幕、文字/图像叠层、转码、改分辨率、改比例、转录、媒体生成），一律走 VideoDB，不要用 ffmpeg/moviepy 本地编码。

## 步骤

1. 安装与连接：`pip install "videodb[capture]" python-dotenv`（Linux 上 capture 失败则装 `videodb python-dotenv`）。key 经环境变量或项目 `.env` 注入。
2. 连接并取 collection：先 `load_dotenv(".env")` 再 `videodb.connect()`，`conn.get_collection()`。
3. 摄入：`coll.upload(url=...)`（支持 YouTube）或 `coll.upload(file_path=...)`，得到可播 stream link。
4. 建索引：口语用 `video.index_spoken_words(force=True)`；视觉用 `video.index_scenes(...)`。
5. 检索：`video.search(...)` 拿 `get_shots()` 与 `compile()`，得带时间戳的证据流。
6. 编辑/生成：`Timeline` 拼接+叠层导出，或 `add_subtitle()`/`reframe()`/`transcode()`/`generate_image()` 等。

## 指令

运行约定：
- 短任务用内联 `python -c "..."`（分号分隔、可读），别为三行以内写脚本文件。
- 超过 ~3 句用 heredoc：

```bash
python << 'EOF'
from dotenv import load_dotenv
load_dotenv(".env")
import videodb
conn = videodb.connect()
coll = conn.get_collection()
print(f"Videos: {len(coll.get_videos())}")
EOF
```

口语检索（search 无结果会抛 `InvalidRequestError`，按空处理）：

```python
from videodb.exceptions import InvalidRequestError
video.index_spoken_words(force=True)
try:
    results = video.search("product demo")
    shots = results.get_shots()
    stream_url = results.compile()
except InvalidRequestError as e:
    if "No results found" in str(e):
        shots = []
    else:
        raise
```

场景检索（`index_scenes` 无 force，已存在会报错，从报错抠出已有 id）：

```python
import re
from videodb import SearchType, IndexType, SceneExtractionType
try:
    scene_index_id = video.index_scenes(
        extraction_type=SceneExtractionType.shot_based,
        prompt="Describe the visual content in this scene.",
    )
except Exception as e:
    match = re.search(r"id\s+([a-f0-9]+)", str(e))
    if not match:
        raise
    scene_index_id = match.group(1)

results = video.search(
    query="person writing on a whiteboard",
    search_type=SearchType.semantic,
    index_type=IndexType.scene,
    scene_index_id=scene_index_id,
    score_threshold=0.3,   # 0.3+ 过滤低相关噪声
)
```

时间轴编辑（构建前务必校验时间戳：`start >= 0`、`start < end`、`end <= video.length`，负值会静默产出坏流）：

```python
from videodb.timeline import Timeline
from videodb.asset import VideoAsset, TextAsset, TextStyle
timeline = Timeline(conn)
timeline.add_inline(VideoAsset(asset_id=video.id, start=10, end=30))
timeline.add_overlay(0, TextAsset(text="The End", duration=3, style=TextStyle(fontsize=36)))
stream_url = timeline.generate_stream()
```

改比例（社媒）：`video.reframe(start=0, end=60, target="vertical", mode=ReframeMode.smart)`。预设 `vertical`(9:16)/`square`(1:1)/`landscape`(16:9)，或传 `{"width":1280,"height":720}`。`reframe()` 服务端慢，长视频务必限定 `start/end` 或传 `callback_url` 异步，必要时先在 Timeline 裁短再 reframe。

转码改分辨率/质量：`conn.transcode(source=..., mode=TranscodeMode.economy, video_config=VideoConfig(resolution=720, quality=23, aspect_ratio="16:9"), audio_config=AudioConfig(mute=False))`。

字幕：`video.add_subtitle()` 或时间轴 `CaptionAsset`；配音/音乐/音效：`coll.generate_voice()`/`generate_music()`/`generate_sound_effect()`；图像：`coll.generate_image(prompt=..., aspect_ratio="16:9")`。

桌面录制（仅 macOS）：`python scripts/ws_listener.py &` 启监听 → `cat /tmp/videodb_ws_id` 取 WS id → 跑录制 → 事件落 `/tmp/videodb_events.jsonl`，按 `channel`（transcript/visual_index）与 `unix_ts` 过滤查询。

## 示例

- 「摄入这个文件并返回可播放的流链接」→ `coll.upload(url=...)` 后取 stream link。
- 「索引这个视频，找出所有有人的场景并返回时间戳」→ `index_scenes` + 语义场景检索 + `get_shots()`。
- 「生成字幕、烧录进画面，再加轻量背景音乐」→ `add_subtitle()` + Timeline 叠加 `AudioAsset`。
- 「连接这个 RTSP，有人进入区域时告警」→ RTStream 实时视觉/口语理解，发事件/告警。
- 「录制我的桌面会话，结束时产出可执行的总结」→ 桌面 capture + 事件流总结。

## 注意事项

常见坑 → 解法：
- 重复索引已建索引视频（`...index already exists`）→ 口语用 `index_spoken_words(force=True)`；场景从报错 `re.search(r"id\s+([a-f0-9]+)", ...)` 抠出已有 id 复用。
- 检索无匹配（`InvalidRequestError: No results found`）→ 捕获并当空结果 `shots = []`。
- reframe 长视频卡死 → 限定 `start/end` 或 `callback_url` 异步。
- Timeline 负时间戳 → 静默产出坏流，建 `VideoAsset` 前校验 `start >= 0` 等三条。
- `generate_video()`/`create_collection()` 报 `Operation not allowed`/`maximum limit` → 套餐限制功能，告知用户。
- 别自己读写 API key；免费 key 见 https://console.videodb.io 。

## 互见

- related：`demo-video-generator` —— 从零渲染演示视频；本技能侧重已有视频/直播的感知检索与服务端编辑，二者互补。
- 参考文档（源仓库 `reference/` 目录）：api-reference、search、editor、streaming、generative、rtstream、capture、use-cases。源仓库 https://github.com/video-db/skills 。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
