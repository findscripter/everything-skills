---
name: apify-multi-platform-scraper
title: Apify 多平台 AI 数据抓取
description: 当需要从社媒/地图/搜索等平台抓公开数据但还没选定具体 Apify Actor 时使用；做 AI 选 Actor→取 schema→运行→导出 CSV/JSON 的统一抓取流水线，覆盖 55+ Actor；不适用于登录/付费墙数据、无 APIFY_TOKEN、纯本地解析或写自定义爬虫。触发词：Apify、抓 Instagram/TikTok/YouTube/Facebook、Google Maps 商家、爬社媒、线索采集
domain: 数据/pipeline
triggers: [Apify, Apify Actor, 抓 Instagram, 抓 TikTok, 抓 YouTube, 抓 Facebook, Google Maps 商家抓取, 爬社媒数据, 线索采集, 评论抓取, influencer 发现, 竞品分析抓取, Booking/TripAdvisor 评论, mcpc]
tags: [apify, scraping, social-media, lead-generation, actor, mcpc, instagram, tiktok, youtube, facebook, google-maps, 数据/misc]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [node, mcpc, jq, bash, apify]
requires: []
related: [apify-actor-development, apify-ecommerce-scraper, data-scraper-agent-builder, firecrawl-web-scraper]
combines_with: [csv-data-cleaner, dataset-profiler]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用场景：

- 用户想抓某平台公开数据，但还没指定具体 Apify Actor，需要先把模糊目标映射到最合适的 Actor。
- 任务横跨多个平台（Instagram / Facebook / TikTok / YouTube / Google Maps / 搜索 / 评论站），希望用一套「选 Actor → 取 schema → 运行 → 汇总」的统一流程。
- 需要一个通用 Apify 入口，覆盖 55+ 官方/社区 Actor。

不该用的边界：

- 需要登录态、绕付费墙或违反目标站 robots/ToS 的私有数据。
- 已经明确知道要调哪个 Actor 且自己直接调用 Apify API，无需选型时（直接用对应 Actor 文档即可）。
- 纯本地 JSON/CSV 解析、或要写自定义爬虫（用通用爬虫/数据清洗技能）。
- 缺 `APIFY_TOKEN`、缺必要输入、权限或成功标准不清时，先停下来澄清，别盲跑。

## 前置条件（无需上来就检查）

- `.env` 文件含 `APIFY_TOKEN`。
- Node.js 20.6+（原生支持 `--env-file`）。
- `mcpc` CLI：`npm install -g @apify/mcpc`。

## 步骤

复制下面清单跟踪进度：

```
- [ ] 步骤1：理解目标并选定 Actor
- [ ] 步骤2：用 mcpc 拉取 Actor 输入 schema
- [ ] 步骤3：确认输出格式与结果数量
- [ ] 步骤4：运行抓取脚本
- [ ] 步骤5：汇总结果并推荐后续动作
```

### 步骤1：理解目标并选 Actor

先弄清用户要什么，再按下表选最合适的 Actor（常用 Actor ID 见「指令」节）。若都不匹配，直接搜 Apify Store：

```bash
export $(grep APIFY_TOKEN .env | xargs) && mcpc --json mcp.apify.com --header "Authorization: Bearer $APIFY_TOKEN" tools-call search-actors keywords:="SEARCH_KEYWORDS" limit:=10 offset:=0 category:="" | jq -r '.content[0].text'
```

`SEARCH_KEYWORDS` 用 1–3 个简单词（如 "LinkedIn profiles"、"Amazon products"、"Twitter"）。

### 步骤2：拉取 Actor schema

动态获取所选 Actor 的输入 schema 与详情（含描述、README、必填/选填参数、输出字段）：

```bash
export $(grep APIFY_TOKEN .env | xargs) && mcpc --json mcp.apify.com --header "Authorization: Bearer $APIFY_TOKEN" tools-call fetch-actor-details actor:="ACTOR_ID" | jq -r ".content"
```

把 `ACTOR_ID` 换成所选 Actor（如 `compass/crawler-google-places`）。

### 步骤3：确认输出偏好

运行前先问：① 输出格式 —— 速答（仅在对话里展示前几条，不落盘）/ CSV（全字段导出）/ JSON（全量导出）；② 结果数量（按用例性质给合理默认值）。

### 步骤4：运行脚本

速答（展示在对话，不落盘）：

```bash
node --env-file=.env ${CLAUDE_PLUGIN_ROOT}/reference/scripts/run_actor.js \
  --actor "ACTOR_ID" \
  --input 'JSON_INPUT'
```

CSV / JSON（落盘）只需追加 `--output YYYY-MM-DD_FILE.csv --format csv`（或 `.json` + `--format json`）。

### 步骤5：汇总与推荐

完成后报告：结果条数、文件路径与名称、可用关键字段，并按结果类型推荐下一步（见「注意事项」的后续推荐表）。

## 指令

按平台/用例选 Actor（节选高频项，完整 55+ 见源仓库）：

| 平台 | 代表 Actor ID | 适用 |
|---|---|---|
| Instagram | `apify/instagram-profile-scraper` / `-post-scraper` / `-comment-scraper` / `-hashtag-scraper` / `-scraper` | 主页、贴文、评论、话题、综合 |
| Facebook | `apify/facebook-pages-scraper` / `-posts-scraper` / `-reviews-scraper` / `-ads-scraper` / `-page-contact-information` | 主页、贴文、评论、广告、联系方式 |
| TikTok | `clockworks/tiktok-scraper` / `-profile-scraper` / `-comments-scraper` / `-hashtag-scraper` / `-trends-scraper` | 综合、主页、评论、话题、趋势 |
| YouTube | `streamers/youtube-scraper` / `-channel-scraper` / `-comments-scraper` / `-shorts-scraper` | 视频、频道、评论、Shorts |
| Google Maps | `compass/crawler-google-places` / `compass/google-maps-extractor` / `compass/Google-Maps-Reviews-Scraper` / `poidata/google-maps-email-extractor` | 商家、详情、评论、邮箱挖掘 |
| 其他 | `apify/google-search-scraper` / `apify/google-trends-scraper` / `voyager/booking-scraper` / `voyager/booking-reviews-scraper` / `maxcopell/tripadvisor-reviews` / `vdrmota/contact-info-scraper` | 搜索、趋势、Booking/TripAdvisor、联系方式富化 |

按用例选型：

- 线索生成：`compass/crawler-google-places` + `poidata/google-maps-email-extractor` + `vdrmota/contact-info-scraper`
- influencer 发现：`apify/instagram-profile-scraper` + `clockworks/tiktok-profile-scraper` + `streamers/youtube-channel-scraper`
- 品牌监测：`apify/instagram-tagged-scraper` + `apify/instagram-hashtag-scraper` + `compass/Google-Maps-Reviews-Scraper`
- 竞品分析：`apify/facebook-pages-scraper` + `apify/facebook-ads-scraper` + `apify/instagram-profile-scraper`
- 评论分析：`compass/Google-Maps-Reviews-Scraper` + `voyager/booking-reviews-scraper` + `maxcopell/tripadvisor-reviews`

多 Actor 串联（复杂任务）：

- 线索富化：`compass/crawler-google-places` → `vdrmota/contact-info-scraper`
- influencer 尽调：`apify/instagram-profile-scraper` → `apify/instagram-comment-scraper`
- 竞品深挖：`apify/facebook-pages-scraper` → `apify/facebook-posts-scraper`
- 本地商家分析：`compass/crawler-google-places` → `compass/Google-Maps-Reviews-Scraper`

## 示例

抓某 Google Maps 商家并导出 CSV：

```bash
# 1. 取 schema 确认输入字段
export $(grep APIFY_TOKEN .env | xargs) && mcpc --json mcp.apify.com \
  --header "Authorization: Bearer $APIFY_TOKEN" \
  tools-call fetch-actor-details actor:="compass/crawler-google-places" | jq -r ".content"

# 2. 运行并导出 CSV
node --env-file=.env ${CLAUDE_PLUGIN_ROOT}/reference/scripts/run_actor.js \
  --actor "compass/crawler-google-places" \
  --input '{"searchStringsArray":["coffee shop"],"locationQuery":"Berlin","maxCrawledPlaces":50}' \
  --output 2026-06-03_berlin-coffee.csv \
  --format csv
```

## 注意事项

后续动作推荐（步骤5用）：

| 拿到 | 建议下一步 |
|---|---|
| 商家列表 | 用 `vdrmota/contact-info-scraper` 富化联系方式，或拉评论 |
| influencer 主页 | 用评论 Actor 分析互动 |
| 竞品主页 | 用贴文/广告 Actor 深挖 |
| 趋势数据 | 用平台话题 Actor 验证 |

常见报错处理：

- `APIFY_TOKEN not found` —— 让用户在 `.env` 写 `APIFY_TOKEN=your_token`。
- `mcpc not found` —— `npm install -g @apify/mcpc`。
- `Actor not found` —— 检查 Actor ID 拼写。
- `Run FAILED` —— 让用户查错误输出里的 Apify console 链接。
- `Timeout` —— 减小输入规模或调大 `--timeout`。

限制与合规：

- 仅在任务确实落在上述范围内才用本技能；输出不能替代环境相关的校验、测试或专家复核。
- 抓取消耗 Apify 算力（按 Actor 计费），大批量前先小规模试跑确认 schema 与字段。
- 仅抓公开数据，遵守目标平台 ToS 与当地数据法规；勿用于绕过登录/付费墙或抓取个人隐私数据。

## 互见

- related：`data-scraper-agent-builder` —— 想把抓取做成定时自动化 Agent 而非一次性调用时。
- combines_with：`jq-json-processing` —— 用 jq 解析/重塑 Actor 返回的 JSON。
- combines_with：`csv-data-cleaner` —— 对导出的 CSV 做清洗与去重。

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
