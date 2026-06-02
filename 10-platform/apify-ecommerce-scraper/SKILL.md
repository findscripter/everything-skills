---
name: apify-ecommerce-scraper
title: Apify 电商数据抓取
description: 当需要从亚马逊、沃尔玛等电商平台批量抓取商品、价格、库存、评论或卖家数据（用于比价、MAP 监控、竞品分析、评论情感/质量分析、卖家发现）时使用；调用 Apify「e-commerce-scraping-tool」Actor，按三类工作流配置输入并导出 CSV/JSON 结果与洞察；不适用于无 APIFY_TOKEN、需自建爬虫绕过反爬、或抓取非电商页面。触发词：电商抓取、商品比价、价格监控、评论分析、卖家发现、apify、ecommerce scraping、product price、review scraping
domain: 平台/integration
triggers: [电商抓取, 商品比价, 价格监控, 评论分析, 卖家发现, apify, ecommerce scraping, product price, review scraping, MAP监控]
tags: [apify, ecommerce, web-scraping, price-monitoring, review-analysis, integration, actor]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Apify Actor: apify/e-commerce-scraping-tool, Node.js 20.6+, run_actor.js]
requires: []
related: [firecrawl-web-scraper, browser-automation-builder, defuddle-web-extract, exa-semantic-search]
combines_with: [browser-automation-builder, competitive-analysis, csv-data-cleaner]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 需要从电商站点批量获取商品、价格、库存、评论或卖家数据。
- 任务涉及比价/价格监控、竞品对比、MAP（最低广告价）合规、评论情感与质量分析、跨店卖家发现。
- 需要一条可引导的工作流：选数据源 → 配 Actor 输入 → 导出 → 汇总洞察。

不该用的边界：
- 没有有效 `APIFY_TOKEN`（无可用配额/凭据）。
- 想绕过站点反爬、登录墙或自建分布式爬虫——本技能仅调用托管 Actor。
- 目标是非电商页面，或需要权威环境内的人工核验（输出不可替代专家审查与本地验证）。
- 必填输入、权限或成功标准不明确时，先停下来向用户澄清。

## 步骤

1. 选工作流并确定数据源（商品/价格、评论、卖家）。
2. 按工作流配置 Actor 输入（见下方 JSON）。
3. 询问用户偏好：输出格式（聊天展示 / CSV / JSON）与文件名。
4. 运行抽取脚本。
5. 汇总结果（条数、文件位置、关键洞察）。

工作流选型：

| 需求 | 工作流 | 适用 |
|------|--------|------|
| 跟踪价格、对比商品 | 工作流 1：商品与价格 | 价格监控、MAP 合规、竞品分析；可加 AI 摘要 |
| 分析评论（情感/质量） | 工作流 2：评论 | 品牌口碑、客户情感、质量与缺陷模式 |
| 跨店找卖家 | 工作流 3：卖家 | 未授权经销商排查、供应商发现（走 Google Shopping）|

## 指令

前置条件：`~/.claude/.env` 内含 `APIFY_TOKEN`；Node.js 20.6+（原生支持 `--env-file`）。

设定路径并运行（`JSON_INPUT` 替换为对应工作流的输入）：

```bash
SKILL_PATH=~/.claude/skills/apify-ecommerce

# 直接在聊天展示
node --env-file=~/.claude/.env $SKILL_PATH/reference/scripts/run_actor.js \
  --actor "apify/e-commerce-scraping-tool" \
  --input 'JSON_INPUT'

# 导出 CSV（或把 csv/.csv 换成 json/.json）
node --env-file=~/.claude/.env $SKILL_PATH/reference/scripts/run_actor.js \
  --actor "apify/e-commerce-scraping-tool" \
  --input 'JSON_INPUT' \
  --output YYYY-MM-DD_filename.csv \
  --format csv
```

Actor ID 固定为 `apify/e-commerce-scraping-tool`。

## 示例

工作流 1（关键词搜索 + AI 摘要）：

```json
{
  "keyword": "robot vacuum",
  "marketplaces": ["www.amazon.com"],
  "maxProductResults": 50,
  "additionalProperties": true,
  "fieldsToAnalyze": ["name", "offers", "brand"],
  "customPrompt": "Summarize price range and identify top brands"
}
```

也可用 `detailsUrls`（商品页对象数组）或 `listingUrls`（类目/搜索页）作为输入。输出字段含 `name`、`url`、`offers.price`、`offers.priceCurrency`、`brand.slogan`（品牌名嵌套于此）、`image` 等。

工作流 2（评论）：

```json
{
  "reviewListingUrls": [{"url": "https://www.amazon.com/dp/B09V3KXJPB"}],
  "sortReview": "Most recent",
  "additionalReviewProperties": true,
  "maxReviewResults": 500
}
```

排序可选 `Most recent`（推荐）/`Most relevant`/`Most helpful`/`Highest rated`/`Lowest rated`。也支持 `keywordReviews` + `marketplacesReviews` 按关键词搜评论。

工作流 3（卖家，走 Google Shopping）：

```json
{
  "googleShoppingSearchKeyword": "Nike Air Max 90",
  "scrapeSellersFromGoogleShopping": true,
  "countryCode": "us",
  "maxGoogleShoppingSellersPerProduct": 20,
  "maxGoogleShoppingResults": 100
}
```

## 注意事项

- 即使美国关键词搜索，结果币种也可能因卖家所在区域而不同（看 `offers.priceCurrency`）。
- `sortReview: "Lowest rated"` 在部分平台不稳定；做质量分析时取大样本（高 `maxReviewResults`），再在后处理按评分过滤；关注 "broke"/"defect"/"quality"/"returned" 等复现关键词。
- 卖家工作流依赖 Google Shopping，直接卖家主页 URL 不被可靠支持。
- 支持平台：Amazon 20+ 区域站、Walmart/Costco/Home Depot、Allegro/Alza/Kaufland/Cdiscount 等欧洲零售商、IKEA 40+ 站点、Google Shopping。`marketplaces` 取值须与官方列表完全一致。
- 常见报错处理：`APIFY_TOKEN not found` → 检查 `~/.claude/.env`；`Actor not found` → 核对 Actor ID；`Run FAILED` → 看错误里的 Apify 控制台链接；`Timeout` → 减小 `maxProductResults` 或增大 `--timeout`；`No results` → 核验 URL 可访问；`Invalid marketplace` → 比对支持列表。
- 汇总时按工作流给洞察：商品（价格区间、异常值、MAP 违规）/评论（均分、情感趋势、质量问题）/卖家（卖家数、发现的未授权卖家）。

## 互见

无（暂无强相关的「技能大典」条目）。

---

本条采编自 sickn33/antigravity-awesome-skills（MIT）。
