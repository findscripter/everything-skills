---
name: youtube-transcript-ingest
title: YouTube 字幕抓取入库
description: 当用户给出单条 YouTube 视频 URL、想把演讲/播客/Keynote 的字幕抓成可检索 Markdown 时使用；用 yt-dlp 发现并下载字幕、清洗 VTT、写带 frontmatter 的库文件并生成 capture 种子；不适用于下载视频、频道/播放列表批量、直播或非 YouTube 源。触发词：YouTube 字幕、转录入库、yt-dlp、/ingest-youtube
domain: 平台/cli
triggers: [把这个 YouTube 视频转成文字稿, 抓取 YouTube 字幕入库, /ingest-youtube <url>, 总结这个 YouTube 演讲, yt-dlp 下载字幕清洗成 markdown, 把播客/keynote 同步进知识库]
tags: [YouTube, 字幕转录, yt-dlp, VTT, 知识库入库, frontmatter, 平台/misc]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [yt-dlp, python3, whisper-cpp]
requires: []
related: [defuddle-web-extract, audio-to-markdown-transcriber, firecrawl-web-scraper]
combines_with: [rag-implementation-workflow, notebooklm-source-grounded-qa]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用场景：
- 用户贴出一条 YouTube 视频 URL，要字幕、文字稿或摘要。
- 用户执行 `/ingest-youtube <url>`，针对单条视频。
- 用户想把某个演讲 / 播客 / Keynote 抓取、同步、转录、入库到 Markdown 知识库，产物供下游技能（知识图谱抽取、语言风格指纹、内容二次创作、行动项抽取）使用。

不该用（负边界）：
- 下载视频文件本身 —— 直接用 `yt-dlp -f best`。
- 频道、播放列表或 `--days` 时间窗批量入库 —— 本脚本每次只处理一条视频 URL。
- 直播流 —— 字幕不稳定。
- 非 YouTube 源（Vimeo、Twitch、Twitter Spaces 各有自己的连接器）。
- 只想一次性读字幕、不需要落库文件 —— 直接 `yt-dlp --write-auto-sub` 并输出到 stdout。

## 步骤

1. 把输入解析为单条 YouTube 视频 URL。
2. 校验 `yt-dlp` 已安装；未安装则退出并提示安装方式：`brew install yt-dlp`（macOS）或 `pip3 install --user yt-dlp`。
3. 确认 URL 是合法 http(s) YouTube 视频，调用 `yt-dlp --ignore-config --list-subs -- <url>` 枚举可用字幕。
4. 字幕优先级：**人工字幕 > 自动生成字幕**。人工字幕保留作者的标点与说话人标签；自动字幕是全大写、无标点。
5. 用 `yt-dlp --write-sub --sub-lang <lang> --skip-download` 下载最高优先级字幕为 VTT。默认语言偏好 `en,es`（英文优先、西语次之）。
6. 去掉 VTT 时间轴标记，合并为干净的段落散文。**去重**重复行（自动 VTT 常有行重复）。源中有说话人标签则保留。
7. 用 `yt-dlp --print-json --skip-download` 取视频元数据（标题、频道、上传日期、时长、video_id、URL）。
8. 对频道名和视频标题做 slugify，写入 `External Inputs/YouTube/<channel-slug>/<YYYY-MM-DD>-<video-slug>.md`。
9. 扫描文字稿中的触发关键词（decision、framework、model、principle、"the lesson is"、playbook、anti-pattern、case study）。每命中一处，在 `Meta/Captures/<YYYY-MM-DD>-youtube-<channel-slug>-<video-id>.md` 生成写作种子 stub，落入 captures 聚合器。
10. 打印汇总：文件路径、文字稿词数、语言、检测到的种子数。

## 指令

```bash
python3 ingest.py <youtube-url> [--vault <path>] [--lang <code>]
```

默认值：
- `--vault`：`$VAULT_ROOT` 环境变量，或当前目录。
- `--lang`：`en,es`（英文优先、西语次之，匹配常见双语默认）。
- `--whisper`：预留的未来回退标志；当前版本在没有字幕时只写 stub，尚未实现本地转录。

**输出契约** —— 库文件 frontmatter：

```yaml
---
type: external-input
source: youtube
video_id: <11-char ID>
url: https://www.youtube.com/watch?v=<id>
channel: <channel-name>
channel_url: https://www.youtube.com/<handle>
title: <video title>
upload_date: <YYYY-MM-DD>
duration_seconds: <int>
language: <ISO code>
subtitle_source: manual | auto | whisper
word_count: <int>
ingested_at: <ISO 8601 timestamp>
---
```

正文是清洗后的段落散文；源中有说话人标签时，每轮发言按 `**<说话人>:** <文本>` 格式排版。

## 示例

对「史上第一条 YouTube 视频」做验收测试：

```bash
python3 ingest.py "https://www.youtube.com/watch?v=jNQXAC9IVRw" --vault /tmp/test
```

预期输出：

```
Wrote 39 words to /tmp/test/External Inputs/YouTube/jawed/2005-04-24-me-at-the-zoo.md. Language: en. Subtitle source: manual.
```

输出文件应包含合法 frontmatter 与干净的段落正文。

## 注意事项

- **幂等**：重抓同一 URL 覆盖同一库文件；种子 stub 文件名对 video_id 做哈希，同一视频多次运行得到相同 stub 文件名 —— 只刷新、不重复。
- **缺字幕**：`--list-subs` 没有人工或自动字幕时，脚本写一条只含元数据和源 URL 的 stub 库笔记，而非静默失败。`--whisper` 当前会报告回退未实现。手动回退做法：用 `yt-dlp` 下载音频，用本地 Whisper 工作流转录，补上字幕/文字稿后再重跑入库。
- **依赖**：`yt-dlp`（必需，`brew install yt-dlp` 或 `pip3 install --user yt-dlp`）；`whisper-cpp`（可选，仅用于脚本外的手动回退）。
- **范围限制**：每次仅一条视频 URL；不下载视频文件；不内建 Whisper 转录。是否成功取决于网络、YouTube 字幕可访问性和本地 `yt-dlp` 行为。

## 互见

- 与 ingest-slack / ingest-whatsapp / ingest-notion / ingest-linear / ingest-github / ingest-gmail 同一架构 —— 新增 YouTube 只是加一个 normalizer，不是新架构。
- 下游可衔接：知识图谱抽取、语言风格指纹训练、内容二次创作、行动项抽取。

---
采编自 [sickn33/antigravity-awesome-skills](https://github.com/sickn33/antigravity-awesome-skills)（原始 skill 捆绑于 adelaidasofia/ai-brain-starter），许可证 MIT。
