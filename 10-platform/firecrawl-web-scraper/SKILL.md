---
name: firecrawl-web-scraper
title: Firecrawl 网页抓取
description: 当需要深度抓取网页正文、截图、解析 PDF 或整站爬取时使用；调用 Firecrawl API 完成单页抓取/批量抓取/整站爬取并产出干净 Markdown、结构化数据或截图；不适用于无 API Key、简单静态页用普通 HTTP 即可、或需绕过登录/反爬合规边界的场景；触发词：Firecrawl、网页抓取、整站爬取、网页截图、PDF 解析、scrape
domain: 平台/browser
triggers: [Firecrawl, 网页抓取, 整站爬取, 网页截图, PDF 解析, 提取网页内容, 批量抓取 URL, crawl 网站, scrape 网页, 页面交互抓取]
tags: [平台/misc, web-scraping, firecrawl, crawl, screenshot, pdf-parsing, 数据采集]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Firecrawl API, FIRECRAWL_API_KEY, scrape, crawl, batch_scrape, map]
requires: []
related: [browser-automation-builder, apify-ecommerce-scraper, defuddle-web-extract, exa-semantic-search]
combines_with: [rag-implementation-workflow, csv-data-cleaner]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 需要从网页深度提取正文，且要干净的 Markdown / 结构化 JSON（去广告、去导航）。
- 目标是动态页面，需要页面交互（点击、滚动、等待渲染）才能拿到内容。
- 需要网页截图（整页或视口）或解析远端 PDF。
- 需要批量抓取多个 URL，或对整站做爬取（crawl）后汇总。

不该用（负边界）：
- 没有配置 `FIRECRAWL_API_KEY`：先配置或改用其他方案，不要硬调。
- 目标是简单静态页且只取原始 HTML：用普通 HTTP 请求即可，更轻更省额度。
- 涉及绕过登录墙、验证码、明确禁止爬取的站点：停下并确认合规边界，不要强行抓取。
- 任务范围与上述不符时不要套用本技能。

## 步骤

1. 配置密钥：通过环境变量提供 `FIRECRAWL_API_KEY`（不要硬编码进代码或提交到仓库）。
2. 选模式：
   - 单页抓取 → `scrape`
   - 多 URL → `batch_scrape`
   - 整站发现链接 → `map`（仅列 URL，省额度）
   - 整站抓内容 → `crawl`
3. 设参数：输出格式（`markdown` / `html` / `screenshot` / `json`）、是否 `onlyMainContent`、交互 `actions`、爬取 `limit` 与 `includePaths`/`excludePaths`。
4. 执行并校验：检查返回内容是否完整、截图是否到位；crawl 为异步，需轮询任务状态。
5. 失败处理：超时或反爬时调小并发、加 `waitFor`、缩小路径范围后重试。

## 指令

约定（以 Firecrawl 官方 API 为准，端点 `https://api.firecrawl.dev`）：

- 鉴权头：`Authorization: Bearer $FIRECRAWL_API_KEY`
- 单页抓取（取主正文 Markdown）：
```bash
curl -X POST https://api.firecrawl.dev/v1/scrape \
  -H "Authorization: Bearer $FIRECRAWL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","formats":["markdown"],"onlyMainContent":true}'
```
- 截图：把 `formats` 设为 `["screenshot"]`（整页用 `screenshot@fullPage`）。
- 解析 PDF：直接把 PDF 链接作为 `url` 传给 `/v1/scrape`，formats 取 `["markdown"]`。
- 页面交互（点击/滚动/等待）：加 `actions` 数组，如 `[{"type":"wait","milliseconds":2000},{"type":"click","selector":"..."},{"type":"scroll"}]`。
- 整站爬取（异步）：
```bash
curl -X POST https://api.firecrawl.dev/v1/crawl \
  -H "Authorization: Bearer $FIRECRAWL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","limit":50,"scrapeOptions":{"formats":["markdown"]}}'
```
  返回 `id` 后轮询 `GET /v1/crawl/{id}` 取结果。
- 安装方式（社区分发）：`npx skills add -g BenedictKing/firecrawl-scraper`

## 示例

抓取一篇文章并只保留正文 Markdown：对 `/v1/scrape` 传 `{"url":"...","formats":["markdown"],"onlyMainContent":true}`，得到去导航、去广告的纯净正文。

抓取需要登录后滚动加载的列表：用 `actions` 先 `wait` 再多次 `scroll`，最后取 `markdown`，确保懒加载内容已渲染。

整站知识库归档：先 `map` 列出全部 URL，挑出 `/docs/` 路径，再 `crawl` 设 `includePaths:["/docs"]`、`limit`，避免抓到无关页面。

## 注意事项

- 密钥只走环境变量，禁止入库、禁止日志打印。
- crawl/batch 消耗额度大：先用 `map` 预估范围，用 `limit`、`includePaths`/`excludePaths` 收窄。
- 动态页拿不全内容时优先加 `waitFor` 或交互 `actions`，而不是盲目重试。
- crawl 是异步任务，必须轮询状态，不要假设同步返回。
- 输出不能替代针对环境的验证与人工复核；缺少必要输入、权限或成功标准时，先停下来确认。
- 遵守目标站点 robots 与服务条款，控制抓取频率。

## 互见

- context7-auto-research（库/文档检索）
- tavily-web、exa-search（搜索类抓取）
- codex-review（代码审阅）

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可证），上游分发自 BenedictKing/firecrawl-scraper。已做适配重写，命令与端点按 Firecrawl 官方 API 约定补全，使用前请以官方文档为准。
