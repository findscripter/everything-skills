---
name: ai-answer-engine-seo
title: AI 答案引擎优化
description: 当你希望内容被 ChatGPT / Perplexity / Google AI Overviews / Claude / Gemini / Copilot 等 AI 搜索"引用"而非只在蓝链里"排名"时使用；做 AI 可见性审计、按"结构·权威·可发现"三支柱改写内容并产出 robots.txt 修复、可提取内容块、Schema 与引用监控方案；不适用于传统排名 SEO 审计（用 seo-audit）或从零写内容（用 seo-content-writer）。触发词：AI SEO、GEO、AEO、生成式搜索、被ChatGPT引用、AI Overviews、Perplexity引用、LLM 可见性、答案引擎优化
domain: 商业/seo
triggers: [AI SEO, GEO, AEO, 生成式搜索优化, 被ChatGPT引用, AI Overviews, Perplexity引用, LLM 可见性, 答案引擎优化, generative engine optimization, AI搜索优化]
tags: [seo, geo, aeo, ai-search, llm-visibility, schema-markup, robots-txt, content-optimization, marketing]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [robots.txt, schema.org (JSON-LD), Perplexity, ChatGPT, Google Search Console (AI Overviews 过滤器), Microsoft Copilot, Rich Results Test]
requires: []
related: [ai-search-seo, schema-markup-builder, seo-content-writer, seo-audit]
combines_with: [seo-content-writer, schema-markup-builder, content-strategy-planner]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
采编自 alirezarezvani/claude-skills（MIT）。

# AI 答案引擎优化

让内容被 AI 搜索平台"提取、引用、署名"，而不只是在蓝链里排名。传统 SEO 让你被"排名（ranked）"，AI SEO/GEO 让你被"引用（cited）"——这是两套不同规则的游戏。

## 何时使用

- 你希望目标问题的 AI 回答里出现并引用你的内容（ChatGPT 网搜、Perplexity、Google AI Overviews、Claude、Gemini、Copilot）。
- 已有页面排名尚可但 AI 答案从不引用你，需要诊断"为什么没被引用"并改写。
- 上线/迁移后想确认 AI 爬虫能否抓取、内容是否"可提取"。

不该用的边界：
- 传统排名/技术 SEO 审计（收录、Core Web Vitals、meta、排名下滑）→ 用 `seo-audit`，本条只管"被 AI 引用"。
- 从零创作正文内容 → 先用 `seo-content-writer` / `content-strategy-planner`，有内容再来优化可引用性。
- AI 写出来的内容反而更不易被 AI 引用——需要先"去 AI 味"再优化时，那是另一回事。

## 步骤

三种模式，可从任一处切入，后者建立在前者之上：

1. **模式一·AI 可见性审计** —— 摸清你当前在各平台的引用现状（被引/被忽略/原因）。
   - ① Bot 访问检查：确认 AI 爬虫未被 robots.txt 屏蔽（见下方清单），任一被屏蔽即"该平台零可见性"，最高优先级修复。
   - ② 引用现状审计：在 Perplexity / ChatGPT(开网搜) / Google AI Overviews / Copilot 手动测目标问题，逐条记录"是否被引、竞品谁被引、被引的是什么内容类型（定义/列表/统计）、答案如何组织"。
   - ③ 内容结构审计：用"可提取性清单"给关键页打分。
2. **模式二·内容优化** —— 按"被引用的内容范式"重构，每个关键页加 2-3 种可提取块，落实 Schema。
3. **模式三·监控** —— AI 搜索易变，建立每周/每月引用追踪，掌握上榜、掉榜、被竞品挤掉的时点。

### 三支柱（每个决策都从这里推导）

- **结构（可提取 Extractable）**：AI 按"块"抽取，不读全文再转述。答案必须自包含——"什么是 X"配定义块、"如何做 X"配编号步骤、"X vs Y"配对比表、问答配 FAQ 块、数据配带署名的统计。埋在 4000 字长文第 3 屏的答案=不可提取。
- **权威（可引用 Citable）**：AI 抽"最可信"的而非仅"最相关"的。信号：高 DA 域名、具名+有资质的作者、引用可信来源形成"引用链"、时效性、独家原创数据/调研。
- **可发现（Discoverable）**：技术层。AI 爬虫能抓（robots.txt 放行）、可爬（快、干净 HTML、非纯 JS 渲染）、有 Schema、canonical 清晰、HTTPS 无安全告警。

## 指令

### robots.txt —— 放行 AI 爬虫（最高优先级，5 分钟修复）

检查 `yourdomain.com/robots.txt`，确认以下 bot 未被屏蔽：

```
GPTBot            # OpenAI / ChatGPT
PerplexityBot     # Perplexity
ClaudeBot         # Anthropic / Claude
Google-Extended   # Google AI Overviews
anthropic-ai      # Anthropic（备用标识）
Applebot-Extended # Apple Intelligence
cohere-ai         # Cohere
```

放行全部 AI bot 的写法：

```
User-agent: GPTBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /
```

注意：屏蔽"训练"≠屏蔽"引用"，两者常是同一次抓取——用 `Disallow:` 选择性屏蔽前先想清楚。

### 可提取性清单（逐项打勾）

- [ ] 前 200 词内有清晰、可作答的核心概念定义？
- [ ] 流程型问题有编号步骤/分步小节？
- [ ] 有直接 Q&A 配对的 FAQ 区？
- [ ] 统计数据都带"来源名 + 年份"署名？
- [ ] 对比用表格而非叙述？
- [ ] H1 是对某问题的回答式表述？
- [ ] 有 Schema 标记（FAQPage / HowTo / Article）？

打分：0-3 项=需大改；4-5=合格基线；6-7=强。

### 6 种被引用的内容范式（每个关键页加 2-3 种）

1. **定义块**：`**[术语]** 是 [1-2 句精炼定义]。[一句话讲它为何重要]。`——放前 300 词内，不绕、不铺垫。
2. **编号步骤（How-To）**：编号、每步动词开头且可独立成立、5-10 步以内（过长会被截断）。
3. **对比表**：干净的两列 markdown 表，"X vs Y"几乎必出表格引用。
4. **FAQ 块**：显式问答对 + FAQPage schema，问题措辞贴近真实搜索/语音提问。
5. **带署名统计**：`据 [来源名]（[年份]），X% 的 [群体][发现]`——裸统计无来源会被降权。
6. **专家引语块**：`据 [姓名]（[组织职务]）："[引语]"`，每篇埋几条。

### 改写为"可提取"

- 答案前置（首段就给目标问题的核心答案，别留到结论）。
- 每个 H2 小节都能作为独立摘录被理解。
- 具体胜过含糊（"响应时间提升 40%" 优于 "显著提升"）。
- 复杂解释后补 1-2 句"大白话小结"——AI 常抽这句。
- 具名来源替代"专家称""研究表明"。

### Schema 优先级（JSON-LD 放 `<head>`，schema.org/validator 校验）

| Schema | 何时用 | 影响 |
|---|---|---|
| `FAQPage` | 有 FAQ 区 | 高——AI 直接抽 Q&A |
| `HowTo` | 分步指南 | 高——流程型问题用其步骤结构 |
| `Article` | 任何编辑内容 | 确立内容权威性 |
| `Product` | 产品页 | 中——进入产品对比类问题 |
| `Organization`/`Person` | 公司/作者页 | 中——实体/作者可信度信号 |

### 监控（模式三）

| 信号 | 工具 | 频率 |
|---|---|---|
| Perplexity / ChatGPT 引用 | 手动测目标问题 | 每周 |
| Google AI Overviews | GSC（"AI Overviews"搜索类型过滤器，看曝光/CTR/被引页） | 每周 |
| Copilot / 竞品引用 | 手动测 | 每月 |
| AI bot 抓取活动 | 服务器日志 / Cloudflare | 每月 |

每周测 Top 10 目标问题（约 20 分钟），记录：是否被引、引用排序、被引用的原文。引用掉了先查四点：①竞品发了更可提取的内容 ②robots.txt 被改（屏蔽 AI bot=瞬间消失）③页面结构大改打断了引用模式 ④域名权威/外链下滑。

## 示例

**场景：SaaS 想让"什么是客户健康分"被 AI 引用**

1. 审计：测 Perplexity/ChatGPT——发现竞品被引，自己未被引；查 robots.txt 发现 `GPTBot Disallow: /` → 立刻放行（最高优先级）。
2. 结构：在文章前 300 词加定义块 ——"客户健康分是用一组使用、互动与商务信号量化客户流失风险的综合指标……"；加"如何计算"5 步编号、加"健康分 vs NPS"对比表、加 FAQ 区。
3. 权威：把"研究表明"改成"据 Gainsight 2025 调研"，补一条具名专家引语。
4. 可发现：上 FAQPage + Article 的 JSON-LD，Rich Results Test 校验。
5. 监控：每周复测该问题，记录是否进入引用源。

**反例（要避免）：** 答案埋在长文深处、裸统计无署名、纯 JS 渲染导致爬虫看不到正文、为讨好 AI 写得满是 AI 腔反被降权。

## 注意事项

- **robots.txt 屏蔽=零可见性**，胜过一切其他优化，发现即先修。
- 目标信息页若前 300 词无自包含定义，赢不了定义类 AI Overviews——动手前先标出来。
- 裸统计（无来源/年份）比配了署名的竞品页更不易被引——全部标出。
- 纯 JS 渲染的关键内容 AI 爬虫可能完全看不到，务必排查。
- AI SEO 仍是年轻领域，诚实标注置信度：🟢 已被引用测试验证 / 🟡 基于模式 / 🔴 推测；平台演进会改变"什么被引用"。
- AI SEO 与传统 SEO 互补而非互斥——权威/外链等信号仍然有效，两边一起做。

## 互见

- related：`seo-audit` —— 传统排名与技术 SEO 诊断，与本条互补（先确保可收录可排名，再追 AI 引用）。
- related：`seo-content-writer` —— 优化前先有高质量内容；改写发现的薄内容也回到它。
- related：`content-strategy-planner` —— 先定哪些问题/主题值得抢 AI 可见性，再优化。
- related：`conversion-rate-optimizer` —— 被引带来流量后的页面转化优化。
