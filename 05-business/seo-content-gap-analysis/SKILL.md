---
name: seo-content-gap-analysis
title: SEO 内容缺口与选题日历分析
description: 当需要对比自有站点与竞品、找出缺失关键词/话题/内容格式并排定选题日历时使用；做内容缺口审计并按高优先/快赢/长期分级，产出排序缺口清单、选题日历与成功指标；不适用于关键词难度抓取、外链建设或单篇内容写作；触发词：内容缺口、选题规划、竞品话题、缺什么内容、还应该写什么
domain: 商业/seo
triggers: [内容缺口分析, 选题规划, 内容机会, 竞品话题, 缺什么内容, 竞品写了什么, 还应该写什么, content gaps, editorial calendar, topic analysis, content opportunities, 选题日历]
tags: [商业, seo, geo, content-gaps, topic-analysis, content-strategy, editorial-calendar, competitive-gap]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [semrush, ahrefs, gsc, ga4]
requires: []
related: [seo-keyword-research, content-engine-strategist, seo-content-refresher, serp-feature-analysis]
combines_with: [seo-content-writer, seo-keyword-research, content-strategy-planner]
license: Apache-2.0
source: aaron-he-zhu/seo-geo-claude-skills
source_license: Apache-2.0
---
## 何时使用

- 想对比自有站点与一到多个竞品，找出**缺失的关键词、话题与内容格式**，并据此排定下一阶段选题日历时。
- 用户提到内容缺口、选题规划、内容机会、竞品写了什么、缺什么内容、还应该写什么。
- 需要把零散的"我应该写点什么"诉求收敛成有优先级、带执行计划的缺口清单时。

**不该用的边界：**
- 不抓取关键词搜索量/难度真值，也不做外链建设（off-page）——本技能给的是缺口框架，量级数据需工具或用户补充。
- 单篇文章撰写/优化 → 交 `seo-content-writer`；让内容被 AI 引用 → 交 `ai-search-seo`；技术/页面审计 → 交 `seo-audit`。
- 缺少自有站 URL、内容清单、竞品 URL 或业务目标时，先停下问清楚，别凭空分析。

## 步骤 / 指令

输入：`your_domain`、`competitor_domains[]`、可选 `topic_focus`、`content_types`、`audience`、`business_goals`。

```
1. 界定范围
   - 确认自有站、竞品名单、话题聚焦、内容类型、受众、业务目标。

2. 审计自有内容
   - 盘点已收录页面、内容类型、话题集群、优胜页与薄弱页。

3. 分析竞品内容
   - 对比内容数量、流量、类型配比、话题覆盖、独有资产。

4. 识别关键词缺口（分三档）
   - 高优先：高量 × 高相关 × 可达难度。
   - 快赢（Quick Win）：低难度、可短期见效。
   - 长期：高价值但需积累权重/篇幅。

5. 映射话题缺口
   - 对比话题集群覆盖；对缺失主题建议「支柱页 + 集群页」结构。

6. 识别内容格式缺口
   - 比对指南/教程/对比/案例/工具/模板/视频/原创研究，找出竞品有而你没有的格式。

7. 分析 GEO / AI 缺口
   - 找出竞品被 AI 引用、而你缺失的问答型、定义型、对比型内容。

8. 映射受众旅程
   - 对比认知/考虑/决策/留存四阶段覆盖，补齐断层。

9. 排序并产出行动计划
   - 交付：执行摘要 + 排序缺口清单（快赢 / 战略建设 / 长期）+ 选题日历 + 成功指标。
```

排序经验法则：优先「快赢」（低难度、贴近交易意图、可复用既有权重）建立动能，再投「战略建设」（支柱话题），「长期」项排进日历但不阻塞当期。

## 示例

最小可用提示词：

```
角色：SEO 内容策略师。
任务：对比我的站点 {your_domain} 与竞品 {competitor_domains}，做内容缺口分析。
聚焦话题：{topic_focus}；受众：{audience}；业务目标：{business_goals}。
请输出：
1. 执行摘要（3-5 条最关键缺口）。
2. 排序缺口清单，分三组：快赢 / 战略建设 / 长期；每条注明话题、目标关键词、缺口类型（关键词/话题/格式/GEO/旅程阶段）、理由。
3. 未来 8 周选题日历（每周 1-2 篇，标内容格式与目标意图）。
4. 成功指标（如收录数、目标查询排名、AI 引用率、阶段覆盖度）。
对无法验证的搜索量/难度数据，标 [需工具核查]。
```

进阶查询：
```
对比 [话题] 我方与 top 5 竞品的话题集群覆盖。           # 集群对比
竞品近 6 个月发了哪些我们还没覆盖的内容？               # 时间维度缺口
找出我们 [交易型/信息型] 意图内容的缺口。               # 意图维度缺口
```

## 注意事项

- 聚焦**可执行**缺口：尊重团队产能与发布节奏，缺口再多也要落到能排进日历的清单。
- 务必含 GEO/AI 缺口，而非只看传统搜索——竞品被 AI 引用而你缺失，是高价值机会。
- 无工具时，搜索量、难度、流量等量级数据需向用户索取或标 [需工具核查]，不要臆造数字当结论。
- 缺口清单要带优先级与理由，否则等于一张待办堆，无法驱动决策。
- 交付后可建议把结论沉淀到 `memory/research/` 与团队内容规划，并把批准的缺口移交 `seo-content-writer` 落地成稿。

## 互见

- related：`seo-audit` —— 技术与页面 SEO 审计，定位缺口外的健康问题。
- related：`ai-search-seo` —— 把识别出的 GEO/AI 缺口转成可被引用的内容结构。
- related：`competitive-analysis` —— 更宽口径的竞品分析，补足内容缺口之外的竞争视角。
- combines_with：`seo-content-writer` —— 缺口清单批准后，逐条产出可交付的 on-page 内容。
- combines_with：`content-strategy-planner` —— 将缺口与选题日历并入整体内容战略规划。
- combines_with：`content-engine-strategist` —— 把单次缺口分析升级为可持续的内容生产引擎。

---
采编自 aaron-he-zhu/seo-geo-claude-skills（Apache-2.0）。
