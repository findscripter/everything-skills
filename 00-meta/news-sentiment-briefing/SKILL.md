---
name: news-sentiment-briefing
title: 多源新闻情感简报引擎
description: 当需要从多个 RSS 源聚合 AI/科技新闻、按影响力排序并产出带情感与影响力评分的结构化简报卡片时使用；做多源采集→去重→排序→情感标注→简报卡；不适用于投资/政策权威研判、单源快讯或需实时行情的场景；触发词：新闻简报、情感分析、RSS 聚合、舆情、每日科技快报、影响力评分。
domain: 通用/research
triggers: [新闻简报, 情感分析, RSS 聚合, 舆情, 每日科技快报, 影响力评分, news briefing, sentiment]
tags: [news, rss, sentiment-analysis, briefing, research]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [websearch]
requires: []
related: [daily-news-report, competitive-intel-tracker, fact-checking, entity-research-dossier]
combines_with: [fact-checking, competitive-intel-tracker]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 需要从多个新闻源（RSS / 网络检索）汇总一份精炼的 AI 或科技新闻简报时。
- 需要对文章批量产出带「情感、标签、影响力评分」的排序摘要时。
- 监测行业动向（产品发布、政策变化、基础设施迁移）并定期成稿（日报 / 周报）时。
- 多源报道相互转载、需去重后再成稿时。

不该用（边界）：
- 把情感/影响力评分当作权威的市场、投资或政策研判 —— 它只是简报辅助，不可证伪部分须另行核查。
- 只看单一来源的快讯，或只要一条链接的摘要 —— 无需建多源管道。
- 需要实时行情、盘口、毫秒级更新 —— RSS 有延迟，走专用数据接口。
- 直接用于发布或投资决策而未回溯原文 —— 必须先交叉核对原始来源。

## 步骤 / 指令

```
1. 采集（collect）
   - 从 4+ 新闻源拉取：TechCrunch、The Verge、Ars Technica、Hacker News（可按主题增减）。
   - 无 RSS 时用 websearch 按主题+时间窗检索补足。
   - 每条保留：标题、来源、发布时间、链接、正文/摘要。

2. 去重（dedup）
   - 跨源识别同一事件的转载/同源稿，合并为一条，记录所有出处。

3. 排序（rank）
   - 按对科技行业的重要性排序，取 Top 5。
   - 权重维度：行业影响、技术趋势、政策/监管变化、基础设施迁移。

4. 逐条分析（analyze）
   - 摘要：2-3 句。
   - 情感：positive / negative / neutral（正/负/中性）。
   - 影响力评分：1-5。
   - 行业标签：[AI, 半导体, 云, LLM, 监管…]。
   - 行业视角点评：1 句。

5. 成稿（brief）
   - 按下方「简报卡」格式输出，标日期，逐条编号。

6. 核对（verify）
   - 发布或用于决策前，回溯原文逐条核对，避免转述失真。
```

核心提示词（可直接喂给模型）：

```
从 RSS 源采集最新 AI/科技新闻。
按对科技行业的重要性排出 Top 5。
每条给出：摘要（2-3 句）、情感（positive/negative/neutral）、
影响力评分（1-5）、行业标签、一句话行业点评。
以结构化简报卡输出。
```

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

每条统一字段：标题 + 来源 + 发布时间 / 2-3 句摘要 / 行业标签 / 情感 / 影响力 1-5 / 1 句行业点评。

## 注意事项

- 本技能源标注 `risk: critical`：可选的「上游项目」安装会克隆并运行第三方 Node 工程，先审阅并锁定该仓库版本，切勿把 API key 暴露给未经审阅的检出。可选安装命令：

  ```bash
  git clone https://github.com/tellmefrankie/news-engine
  cd news-engine
  pnpm install
  cp .env.example .env
  # 需要：ANTHROPIC_API_KEY
  pnpm dev -- --collect-only
  ```

  免费档仅做采集与基础分析，除 Anthropic API key 外无需付费 API。多数情况下无需安装该工程，直接用上文提示词 + websearch 即可。
- RSS 源会延迟、下线、限流或转载重复 —— 去重要稳，时效要标注。
- 情感与影响力评分是简报辅助，不是权威的市场或政策结论；交叉核对原始来源后再发布或用于投资。
- 跨源「多个链接」不等于多个独立来源：同一通稿被多家转载仍是单一信源，需配合事实核查。

## 互见

- related：`fact-checking` —— 情感/影响力评分及高影响条目发布前的断言与来源核查。
- related：`first-principles-thinking` —— 判断哪条新闻的「行业影响」论断站得住、最该优先核实。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
