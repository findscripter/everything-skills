---
name: x-post-to-json-fetcher
title: X 帖子转 JSON：推文抓取为 LLM 友好结构
description: 当用户分享 X/Twitter 链接、需读取或分析推文时使用；用 ADHX 免认证 API 把 x.com/twitter.com/adhx.com 链接抓成含正文、作者、互动数据的结构化 JSON 供 LLM 消费；不适用于需登录态、私密/受限帖子或直接爬取 x.com。触发词：X 帖子、推文转 JSON、ADHX、抓取推文、X Article、推文摘要
domain: 平台/browser
triggers: [用户分享了 x.com/twitter.com 链接, 把推文抓成结构化 JSON, 总结/分析某条 X 帖子, 提取 X Article 长文正文, 查推文点赞/转发/浏览量]
tags: [X, Twitter, 推文抓取, JSON, ADHX, LLM, 社交平台]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [curl]
requires: []
related: [x-twitter-scraper-toolkit, x-twitter-automation, firecrawl-web-scraper, defuddle-web-extract]
combines_with: [news-sentiment-briefing, browser-automation-builder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 用户分享了 X/Twitter 链接，想读取、总结或分析该帖。
- 需要从推文中拿到结构化字段（作者、互动数据、正文）。
- 处理 X Article 长文，需要完整正文（非仅推文短文本）。

不该用（负边界）：
- 需要登录态、私密账号、受限/已删除的帖子（API 无认证，取不到）。
- 想直接爬取 x.com 页面——本技能用 ADHX API 替代爬取，不要再开浏览器抓 DOM。
- 非帖子级资源（用户主页、列表、搜索结果页等）。

## 步骤

1. 解析链接，从路径段中提取 `username` 与 `statusId`。支持的格式：

| 格式 | 示例 |
|------|------|
| `x.com/{user}/status/{id}` | `https://x.com/dgt10011/status/2020167690560647464` |
| `twitter.com/{user}/status/{id}` | `https://twitter.com/dgt10011/status/2020167690560647464` |
| `adhx.com/{user}/status/{id}` | `https://adhx.com/dgt10011/status/2020167690560647464` |

2. 调用 API（无需认证）：

```bash
curl -s "https://adhx.com/api/share/tweet/{username}/{statusId}"
```

端点固定为 `https://adhx.com/api/share/tweet/{username}/{statusId}`。

3. 用返回的结构化 JSON 回答用户（摘要、提取要点、读互动数据等）。需要长文时读 `article.content`；查互动时读 `engagement`。

### 响应结构

```json
{
  "id": "statusId",
  "url": "原始 x.com URL",
  "text": "短推文文本（文章帖时为空）",
  "author": {
    "name": "显示名",
    "username": "handle",
    "avatarUrl": "头像 URL"
  },
  "createdAt": "时间戳",
  "engagement": {
    "replies": 0,
    "retweets": 0,
    "likes": 0,
    "views": 0
  },
  "article": {
    "title": "文章标题（长文帖）",
    "previewText": "前约 200 字",
    "coverImageUrl": "封面图 URL",
    "content": "含图片的完整 Markdown 正文"
  }
}
```

## 示例

示例 1：总结一条推文
用户：「总结这条 https://x.com/dgt10011/status/2020167690560647464」

```bash
curl -s "https://adhx.com/api/share/tweet/dgt10011/2020167690560647464"
```

再用返回 JSON 给出摘要。

示例 2：分析互动数据
用户：「这条推文多少赞？ https://x.com/handle/status/123」
1. 解析：username=`handle`，statusId=`123`
2. 抓取：`curl -s "https://adhx.com/api/share/tweet/handle/123"`
3. 返回响应中的 `engagement.likes`

## 注意事项

- 调 API 前务必完整解析 URL，拿全 `username` 与 `statusId`。
- 用户要完整长文时检查 `article` 字段（短推文该字段可能为空）；问点赞/转发/浏览量时用 `engagement`。
- 无需鉴权，短推文和 X Article 长文都支持。
- 不要直接爬 x.com，统一走本 API。
- 若 API 返回错误或空响应，告知用户该帖可能不可用（私密、已删、或 ID 错误）。

## 互见

- ADHX 仓库：https://github.com/itsmemeworks/adhx ；官网：https://adhx.com
- 平台/misc 域下其他链接解析、内容抓取类技能。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
