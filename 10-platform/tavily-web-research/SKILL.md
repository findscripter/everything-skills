---
name: tavily-web-research
title: Tavily 网络检索：搜索、抓取与内容提取
description: 当需要用 Tavily API 检索实时网络信息、从 URL 提取正文、爬取整站或做带引用的网页调研时使用；做 Tavily search/extract/crawl 调用并产出带来源的结果与正文摘要；不适用于站内全文检索、纯本地/私有数据查询或将结果当权威事实直接采纳；触发词：Tavily、网页搜索、内容提取、网站爬取、实时信息调研
domain: 平台/browser
triggers: [Tavily, 网页搜索, 内容提取, 网站爬取, 实时信息, Web 调研, URL 抓取]
tags: [平台, misc, 搜索, 抓取, 调研, Tavily, 网页检索]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Tavily API, 环境变量, curl]
requires: []
related: [exa-semantic-search, firecrawl-web-scraper, defuddle-web-extract, browser-automation-builder]
combines_with: [query-decomposition-search, multi-source-knowledge-synthesis, fact-checking]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 需要检索**实时/最新**的公网信息（新闻、文档、价格、近期事件），而非依赖模型内置知识。
- 已知一批 URL，想批量**提取正文**（extract），省去逐页手写解析。
- 想从一个入口页**爬取整站/子目录**（crawl），收集多页内容。
- 做带**来源引用**的网页调研，结果直接带回摘要与链接。

不该用（负边界）：
- 站内全文检索、精确关键词/布尔匹配 —— 用站点自带搜索或传统关键词引擎。
- 纯本地、私有数据库或内网内容查询 —— Tavily 只检索公网。
- 把检索结果当权威事实直接采纳 —— 仍需回到原始来源做环境相关核验与人工审阅。
- 缺少 API Key、检索范围或成功标准不明确时，先停下来澄清，不要盲跑。

## 步骤

1. 安装技能（全局）：
   ```bash
   npx skills add -g BenedictKing/tavily-web
   ```
2. 配置 Tavily API Key（务必通过环境变量，不要硬编码或提交进仓库）：
   ```bash
   export TAVILY_API_KEY="tvly-your-api-key"
   ```
3. 在 Claude Code 对话中用自然语言发起请求；按需选能力：search（搜索）、extract（按 URL 取正文）、crawl（按入口爬整站）。
4. 拿到结果后，对关键结论回到原始来源做二次核验，注意 API 配额与调用频率。

## 指令

按任务选择 Tavily 的能力（无封装时可直接打 REST 兜底）：

- 搜索（search）：描述问题意图，按需限定时间/域名，结果可带正文摘要。
  ```bash
  curl -s https://api.tavily.com/search \
    -H "Authorization: Bearer $TAVILY_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"query":"latest on X","max_results":5,"search_depth":"advanced","include_answer":true}'
  ```
- 提取（extract）：给定 URL 列表，取干净正文。
  ```bash
  curl -s https://api.tavily.com/extract \
    -H "Authorization: Bearer $TAVILY_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"urls":["https://example.com/article"]}'
  ```
- 爬取（crawl）：给入口 URL，按深度收集多页。
  ```bash
  curl -s https://api.tavily.com/crawl \
    -H "Authorization: Bearer $TAVILY_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"url":"https://example.com/docs","max_depth":2}'
  ```

选择口诀：要「找信息」用 search；已知页面要「取正文」用 extract；要「扫一片站点」用 crawl。

## 示例

- 实时搜索：「查一下 X 项目最近一周的进展和发布说明，给我带链接的要点。」
- 内容提取：「把这 3 个 URL 的正文抓下来，去掉导航和广告，整理成对比表。」
- 整站爬取：「从这个文档站入口爬两层，汇总所有页面的核心命令。」
- 带引用调研：「关于 Y 主题，搜几篇权威来源并给出带出处的综述。」

更多用法与排障见上游仓库：https://github.com/BenedictKing/tavily-web

## 注意事项

- API Key 一律走环境变量（TAVILY_API_KEY），不写入代码、日志或提交记录。
- 检索/爬取结果具有时效与概率性，重要结论需回到原始来源核验，不能替代环境相关验证、测试或专家评审。
- crawl 可能产生大量请求与 token 消耗，先用小 `max_depth`/限定子目录，注意目标站点的 robots 与速率限制，避免滥爬。
- 仅在任务确实落在实时搜索/正文提取/整站爬取范围内时使用；否则改用站内搜索或对应专用工具。

## 互见

- requires：无
- related：`exa-semantic-search`（语义/相似检索）、`firecrawl-web-scraper`（抓取与结构化提取）、`defuddle-web-extract`（单页正文清洗提取）、`youtube-transcript-ingest`（视频转录摄取）
- combines_with：`rag-implementation-workflow`（把检索到的网页喂入 RAG）、`hybrid-search-retrieval`（与向量检索做混合召回）

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
