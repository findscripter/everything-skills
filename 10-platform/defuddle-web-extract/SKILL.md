---
name: defuddle-web-extract
title: Defuddle 网页正文提取为 Markdown
description: 当用户给出网页 URL 需要阅读/总结/分析时使用；用 Defuddle CLI 提取去导航去广告的正文并产出干净 Markdown（含元数据）以节省 token；不适用于需登录/付费墙/重 JS 渲染的页面、需精确抓取或交互的场景。触发词：网页正文、Defuddle、URL 转 Markdown
domain: 平台/browser
triggers: [读取网页URL, 提取网页正文, 网页转Markdown, 总结这个链接, Defuddle, 节省token抓正文]
tags: [网页提取, markdown, cli, 内容清洗, token优化, defuddle]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Bash, defuddle]
requires: []
related: [firecrawl-web-scraper, exa-semantic-search, browser-automation-builder, youtube-transcript-ingest]
combines_with: [exa-semantic-search, rag-implementation-workflow]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 用户给出一个常规网页 URL，需要阅读、总结、分析其正文内容时优先使用。
- 处理文档、文章、博客等公开标准网页，且在意 token 用量（去掉导航/广告/页脚等噪音）时使用，效果优于直接 WebFetch 抓全页。

不该用的边界：
- 需要登录、付费墙、强 JavaScript 动态渲染或反爬的页面，Defuddle 可能取不到正文。
- 需要精确抓取页面特定结构、表单交互、点击翻页或截图时，改用浏览器类工具。
- 缺少必要输入（URL、权限、成功标准）时先停下来澄清，不要凭空抓取。

## 步骤

1. 确认已安装；未安装则全局安装：`npm install -g defuddle`。
2. 用 `defuddle parse <url> --md` 提取正文，始终带 `--md` 输出 Markdown。
3. 内容较长时用 `-o` 落盘为文件，再分段读取处理。
4. 只需标题/描述/域名等元数据时用 `-p <name>` 单独取，避免拉全文。

## 指令

```bash
# 安装（仅首次）
npm install -g defuddle

# 提取正文为 Markdown（默认且推荐）
defuddle parse <url> --md

# 保存到文件
defuddle parse <url> --md -o content.md

# 仅取指定元数据
defuddle parse <url> -p title
defuddle parse <url> -p description
defuddle parse <url> -p domain
```

输出格式对照：

| 参数 | 输出 |
|------|------|
| `--md` | Markdown（首选） |
| `--json` | JSON，含 HTML 与 Markdown 两份 |
| （不带） | 原始 HTML |
| `-p <name>` | 指定的单个元数据属性 |

## 示例

总结一篇博客：

```bash
defuddle parse https://example.com/blog/post --md -o post.md
```

随后读取 `post.md` 并基于干净正文进行总结，而不是把整页 HTML 喂给模型。

## 注意事项

- 始终优先 `--md`；只有在需要结构化处理时才用 `--json`，需要原始结构时才用 HTML。
- 输出不能替代环境相关的验证、测试或专家复核，重要结论需人工确认。
- 仅在任务明确落在上述范围内时使用；命中登录墙或动态页失败时，回退到 WebFetch 或浏览器工具。

## 互见

- WebFetch：Defuddle 取不到正文（登录/动态渲染）时的回退方案。
- 浏览器自动化（chrome-devtools 系列）：需要交互、点击、截图或抓取特定 DOM 时使用。

---

采编自 sickn33/antigravity-awesome-skills（MIT），原技能 source: https://github.com/kepano/obsidian-skills。
