---
name: seo-keyword-research
title: SEO 关键词研究与选题聚类
description: 当为新页面/主题/营销活动启动关键词研究、需要搜索量与难度评估、长尾挖词或内容选题时使用；做八阶段挖词打分（机会值=量×意图值÷难度）、意图分类、GEO 可引用性标记与「支柱页+簇」聚类，产出含速赢/增长/GEO 机会的优先级清单与内容日历；不适用于纯外链/技术审计或不涉及搜索的内容创意；触发词：关键词研究、挖词、长尾、内容选题、搜索量、关键词难度、写什么内容好、Ahrefs 替代
domain: 商业/seo
triggers: [关键词研究, 关键词分析, 挖词, 长尾关键词, 内容选题, 搜什么词, 写什么内容好, 搜索量分析, 关键词难度, 内容机会, 选题规划, topic cluster, keyword research, Ahrefs 替代, Semrush keyword magic]
tags: [商业, seo, keyword-research, search-volume, keyword-difficulty, topic-clusters, search-intent, long-tail, geo, marketing]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [semrush, ahrefs, gsc, google-keyword-planner, ubersuggest]
requires: []
related: [seo-content-gap-analysis, serp-feature-analysis, seo-content-writer, ai-search-seo]
combines_with: [content-strategy-planner, seo-content-writer]
license: Apache-2.0
source: aaron-he-zhu/seo-geo-claude-skills
source_license: Apache-2.0
---
## 何时使用

- 为新页面、主题或营销活动**启动关键词研究**：要搜索量、关键词难度、长尾词、选题规划。
- 用户问「写什么内容好 / 搜什么词 / 帮我挖词 / 这个词竞争多大」，或寻找 Ahrefs / Semrush / Google Keyword Planner / Ubersuggest 的替代做法。
- 想把零散关键词组织成「支柱页 + 内容簇」并排出内容日历。

**不该用的边界：**
- 纯外链/技术或页面级 SEO 审计 → 用 `seo-audit`。
- 只要让内容被 AI 搜索引用（AEO/GEO 重写、Schema、爬虫放行） → 用 `ai-search-seo` / `ai-answer-engine-seo`。
- 关键词已定、只差落地写稿 → 用 `seo-content-writer`；要规模化批量建页 → 用 `programmatic-seo-builder`。
- 缺少种子词、目标受众、业务目标或可用数据时，先停下问清楚，别凭空挖词。

无 SEO 工具数据时，向用户索取：种子词、受众、业务目标、地域/语言，以及任何已知量级指标。

## 步骤

按八阶段执行，每阶段以 `[Phase X/8: 名称]` 公告进度：

1. **Scope 界定** —— 厘清产品、受众、业务目标、域名权重(DR)、地域、语言。
2. **Discover 发现** —— 从核心词、痛点词、解决方案词、受众词、行业词五类种子展开。
3. **Variations 扩展** —— 用修饰词 + 长尾模式扩词（best/how to/vs/价格/替代/for〈场景〉等）。
4. **Classify 分类** —— 按搜索意图打标：信息(informational)、导航(navigational)、商业(commercial)、交易(transactional)。
5. **Score 打分** —— 给难度(1–100)，按公式算机会值（见下「指令」）。
6. **GEO-Check 检查** —— 标记 AI 答案友好的查询：问句、定义、对比、清单、how-to。
7. **Cluster 聚类** —— 归入「支柱页 + 簇」主题中心(topic hub)。
8. **Deliver 交付** —— 输出执行摘要、速赢/增长/GEO 机会、主题簇、内容日历、下一步。

**质量底线**：每条建议至少含一个具体数字。把「多写优质内容」这类空话改写成「具体关键词 + 月搜索量 + 难度 + 理由」。

## 指令

**机会值公式（核心打分）：**

```
机会值 Opportunity = (搜索量 Volume × 意图值 Intent Value) / 难度 Difficulty
```

- 难度 Difficulty：1–100。
- 意图值 Intent Value 按意图类型取：
  - 信息 informational = 1
  - 导航 navigational = 1
  - 商业 commercial = 2
  - 交易 transactional = 3

机会值越高优先级越高 —— 量大、商业/交易意图、难度低者优先。

**意图分类速判：**
- 信息：what is / how / 为什么 / 教程 → 适配指南、博文。
- 导航：含品牌名 / 登录 / 官网 → 适配品牌页。
- 商业：best / top / vs / review / 替代 / 对比 → 适配对比页、榜单。
- 交易：buy / price / 价格 / 下单 / 优惠 → 适配产品/定价/落地页。

**GEO 可引用性标记**：问句、定义类、对比类、清单类、how-to 类查询更易被 AI 答案引用，单独标出以便优先做可抽取内容（详见 `ai-search-seo`）。

**聚类模板**：每个支柱页(pillar)对应一个宽主题，下挂 5–15 个簇页(cluster)指向更细长尾词，内部互链形成 topic hub。

## 示例

**快速启动：**
```
为「<主题/产品/服务>」做关键词研究
```
```
<竞品 URL> 在排哪些词、我该抢哪些？
```

**机会值排序示例**（节选）：

| 关键词 | 月搜索量 | 意图 | 意图值 | 难度 | 机会值 | 动作 |
|---|---|---|---|---|---|---|
| best crm for startups | 2400 | 商业 | 2 | 35 | 137 | 速赢·建对比页 |
| what is a crm | 8100 | 信息 | 1 | 60 | 135 | 增长·写定义指南 |
| hubspot pricing | 1300 | 交易 | 3 | 45 | 87 | 速赢·定价对比页 |

**交付样例规模**：一次研究分析 150+ 关键词，筛出 23 个高优先级机会，覆盖 3 个焦点方向、约 45K/月潜在流量，分「速赢 / 增长 / GEO」三档落到内容日历。

## 注意事项

- 从种子词起步、尊重搜索意图、聚类要紧凑、优先做速赢、每季度复盘一次。
- **意图错配是最大浪费**：交易意图的词配信息型内容（或反之）不会转化，分类务必先于打分。
- 每条建议挂具体数字，避免泛泛而谈；难度/搜索量若来自工具要标注口径，无工具时标「估算」。
- GEO 机会与传统排名机会**分别**列出，二者优化手法不同，别混为一谈。
- 通用约束：仅在任务明确匹配本技能范围时使用；输出不替代针对具体环境的工具数据核验与专家评审；缺必要输入/权限/成功标准时先停下询问。

## 互见

- related：`seo-audit` —— 关键词就绪后的技术与页面审计。
- related：`ai-search-seo`、`ai-answer-engine-seo` —— 把 GEO 机会词做成可被 AI 引用的内容。
- combines_with：`content-strategy-planner`、`content-engine-strategist` —— 把关键词清单转成选题规划与内容引擎。
- combines_with：`seo-content-writer` —— 拿定稿关键词直接写 SEO 稿。
- combines_with：`competitive-analysis` —— 关键词集就绪后做市场/竞品对照，找缺口。
- related：`programmatic-seo-builder` —— 长尾词规模化批量建页。

---
采编自 aaron-he-zhu/seo-geo-claude-skills（Apache-2.0）。
