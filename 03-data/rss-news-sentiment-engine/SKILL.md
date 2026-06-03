---
name: rss-news-sentiment-engine
title: RSS 新闻情感引擎：多源聚合与结构化简报
description: 当需要把多个 RSS/检索源的科技新闻跑成一条「采集→去重→排序→情感标注」的数据管道、输出可机读的结构化简报（JSON/简报卡）时使用；做多源拉取、跨源同源稿去重、影响力 1-5 排序、情感与行业标签标注、成稿成卡；不适用于单源快讯、网页单篇总结、实时行情/盘口、把评分当权威投资或政策研判；触发词：RSS 聚合、新闻情感、舆情管道、结构化简报、影响力评分、去重
domain: 数据/pipeline
triggers: [RSS 聚合, 新闻情感, 舆情管道, 结构化简报, 影响力评分, 去重, news sentiment, rss feed, briefing card]
tags: [news, rss, sentiment-analysis, briefing, dedup, pipeline]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [websearch, rss, ANTHROPIC_API_KEY]
requires: []
related: [news-sentiment-briefing, daily-news-report, data-scraper-agent-builder, apify-multi-platform-scraper]
combines_with: [data-pipeline-engineer, query-decomposition-search]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

当需要把分散的科技/AI 新闻**当作数据来处理**——多源拉取、去重、打分、标注后产出可机读结构化简报（JSON 字段或简报卡）时使用：

- 从 4+ RSS 源（TechCrunch、The Verge、Ars Technica、Hacker News）定期聚合，去掉跨源转载的同源稿。
- 给每条文章批量产出统一字段：摘要、情感、影响力 1-5、行业标签、一句话点评，便于下游再消费/存档。
- 监测产品发布、政策/监管、基础设施迁移等行业动向，按重要性排 Top N 成稿。

不该用（边界）：

- 只要一条链接的单篇摘要、或单一来源快讯 —— 不必建多源管道。
- 实时行情、盘口、毫秒级更新 —— RSS 有延迟，走专用数据接口。
- 把情感/影响力评分当作权威市场、投资或政策研判 —— 它只是简报辅助，发布或决策前必须回溯原文。
- 偏「研究/舆情阅读」语境的简报 —— 见互见 `news-sentiment-briefing`（通用/research 角度，本条侧重数据管道与机读产物）。

## 步骤

把流程当成一条管道，每步产物可独立校验：

1. **采集 collect**：拉取 4+ RSS 源；无 RSS 或需补时用 websearch 按「主题 + 时间窗」检索。每条至少保留：标题、来源、发布时间、链接、正文/摘要。
2. **去重 dedup**：跨源识别同一事件的转载/同源通稿，合并为一条，记录全部出处。**关键：「多个链接」≠「多个独立信源」**，同一通稿被多家转载仍是单一信源。
3. **排序 rank**：按对科技行业的重要性取 Top 5；权重维度＝行业影响、技术趋势、政策/监管变化、基础设施迁移。
4. **标注 analyze**：逐条产出 — 摘要 2-3 句；情感 positive/negative/neutral；影响力 1-5；行业标签 [AI, 半导体, 云, LLM, 监管…]；一句话行业点评。
5. **成稿 brief**：按下方简报卡格式或 JSON schema 输出，标日期、逐条编号。
6. **核对 verify**：发布或用于决策前回溯原文逐条核对，避免转述失真。

## 指令

核心提示词（可直接喂模型，无需任何上游工程即可跑通）：

```
从 RSS 源采集最新 AI/科技新闻。
按对科技行业的重要性排出 Top 5。
每条给出：摘要（2-3 句）、情感（positive/negative/neutral）、
影响力评分（1-5）、行业标签、一句话行业点评。
以结构化简报卡输出（或 JSON：title/source/published/summary/sentiment/impact/tags/comment）。
```

可选的上游工程（**非必需**，多数情况下上面的提示词 + websearch 已足够）：源标注 `risk: critical`，会克隆并运行第三方 Node 工程，先审阅并锁定仓库版本，切勿把 API key 暴露给未审阅的检出：

```bash
git clone https://github.com/tellmefrankie/news-engine
cd news-engine
pnpm install
cp .env.example .env
# 需要：ANTHROPIC_API_KEY
pnpm dev -- --collect-only
```

免费档仅做采集与基础分析，除 Anthropic API key 外无需付费 API。

每条统一字段（机读 schema）：标题 + 来源 + 发布时间 / 摘要 2-3 句 / 行业标签数组 / 情感 / 影响力 1-5 / 一句话行业点评。

## 示例

简报卡输出片段：

```
AI/科技新闻简报 — 2026-05-13

1. OpenAI 发布 GPT-5，上下文窗口达 200 万 token
   来源：TechCrunch | 影响力：5/5
   标签：#AI #LLM #OpenAI
   情感：Positive

   摘要：OpenAI 发布 GPT-5，支持 200 万 token 上下文并增强推理。
   企业定价从 $0.03/1k token 起。
   点评：对 Anthropic Claude 形成直接竞争压力，H2 2026 企业合同或生变。

2. 欧盟《AI 法案》对高风险系统启动执法
   来源：The Verge | 影响力：4/5
   标签：#监管 #欧盟 #合规
   情感：Neutral
```

## 注意事项

- **RSS 源会延迟、下线、限流或转载重复**：去重要稳，时效需在卡片标注。
- 情感与影响力评分是简报辅助，不是权威市场/政策结论；交叉核对原始来源后再发布或用于投资。
- 上游 Node 工程为可选第三方代码：审阅仓库与环境变量、锁定版本后再运行，勿向未审阅检出暴露 `ANTHROPIC_API_KEY`。
- 同源通稿去重不到位会虚高「影响力」（一条事件被当成多条）——dedup 是评分可信度的前提。

## 互见

- related：`news-sentiment-briefing` —— 同源同题的「通用/research」版，偏研究与舆情阅读；本条偏数据管道与机读产物，按使用语境二选一。
- related：`daily-news-report` —— 按预设来源列表 + 子 Agent 并行抓取生成每日 Markdown 日报。
- related：`competitive-intel-tracker` —— 把新闻信号沉淀为竞品情报跟踪。
- combines_with：`fact-checking` —— 高影响条目发布前的断言与来源核查。
- combines_with：`jq-json-processing` —— 对结构化 JSON 简报做下游过滤、抽取与转换。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
