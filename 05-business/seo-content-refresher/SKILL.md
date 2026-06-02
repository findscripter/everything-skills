---
name: seo-content-refresher
title: 过时内容刷新与流量衰减修复
description: 当老文章排名/流量衰减、内容过时（数据陈旧、缺新章节、新鲜度信号弱）需要刷新而非新建时使用；做衰减诊断与新鲜度评分→刷新候选优先级→可执行刷新计划（含新章节、最新数据、GEO 引用优化与再发布日期策略）并产出刷新报告；不适用于全新内容创作（用 seo-content-writer）、突发流量骤降取证（用 seo-traffic-drop-forensics）、纯技术审计（用 seo-audit）。触发词：内容更新、内容刷新、排名恢复、流量掉了、文章过时了
domain: 商业/seo
triggers: [内容更新, 内容刷新, 排名恢复, 内容衰减, 流量掉了, 文章过时了, 老文章怎么办, 刷新老文章, 为某年更新文章, content refresh, content decay, ranking recovery]
tags: [seo, geo, content-refresh, content-decay, ranking-recovery, content-lifecycle, evergreen, republishing]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Google Search Console, GA4 / 分析工具, SEO 工具 (Ahrefs/Semrush), Rich Results Test]
requires: []
related: [seo-content-writer, seo-content-gap-analysis, seo-traffic-drop-forensics, seo-keyword-research]
combines_with: [seo-performance-reporter, seo-keyword-research]
license: Apache-2.0
source: aaron-he-zhu/seo-geo-claude-skills
source_license: Apache-2.0
---
# 过时内容刷新与流量衰减修复

## 何时使用

适用：已有内容随时间衰减——排名/自然流量下滑、数据与年份过时、断链、SERP 意图漂移、竞品已更新、缺新主题。目标是**刷新现有页面**（保留 URL 与历史权重），而非从零创作。也可用于"为某年更新这篇文章""更新这篇以反超某竞品 URL""为某主题制定刷新策略""我哪些博文流量掉得最多"。

不该用（负边界）：
- 全新内容创作、针对新关键词从零撰写 → `seo-content-writer`。
- 流量**突然骤降**、疑似核心更新/人工处罚/技术回归的事件取证 → `seo-traffic-drop-forensics`。
- 纯技术/页面 SEO 健康体检（可抓取/可索引/CWV）→ `seo-audit`。

判据：渐进式衰减 + 页面本身有可保留的资产 → 刷新；若内容已无可救药或主题彻底失效 → 走"重写/淘汰"而非刷新。

## 步骤

1. **CORE-EEAT 快评**：对内容质量 8 维度快速估分，标红/黄高危项；需要完整评分时移交质量审计环节。
2. **筛选刷新候选**：依据发布年龄、过时声明/数据、流量下滑、排名丢失、断链、SERP 变化、缺失主题。
3. **页面级衰减分析**：对比 6 个月前 vs 当前表现、关键词排名差值、SERP 意图、竞品更新，写出"为何要刷新"的理由。
4. **定义需更新项**：列出过时元素、竞品/PAA（People Also Ask）覆盖缺口、SEO 更新、GEO 更新、内外链、图片、来源引用、日期。
5. **制定刷新计划**：明确标题、结构、新增章节、刷新后的统计数据、内外链、图片、验证要求。
6. **撰写刷新内容**：改写引言、替换章节、更新事实、补 FAQ 答案，并记录"Changes Made（变更清单）"。
7. **GEO 引用优化**：补 40–60 词定义、可被引用的断言、Q&A、带日期的引用、可独立成立的事实陈述（便于 AI 答案引擎抓取）。
8. **再发布日期策略**：新内容占比 ≥50% → 更新**发布日期**；20–50% → 更新**最后修改日期**；<20% → 保留原始日期。同步更新 schema、sitemap `lastmod`、清缓存、向 Search Console 提交，并设 4–6 周监控。
9. **产出刷新报告**：汇总已完成变更、预期结果、责任人、下次复查日期、遗留待办（open loops）。

## 指令

筛选与优先级（决策口径）：
- **按 ROI / 搜索需求排序**，优先刷新"高需求 + 跌幅大 + 易修复"的页面，而非平均用力。
- 做**实质性改进**，不要只改日期糊弄"新鲜度"——纯改日期会被算法识破且无长期收益。
- 证据强度要**超过竞品**（更新的数据、一手经验、权威引用）。

再发布日期口径（务必照此执行，勿随意改日期刷新鲜度）：

| 新内容占比 | 日期处理 |
|---|---|
| ≥ 50% | 更新发布日期（published date） |
| 20–50% | 更新最后修改日期（last-updated） |
| < 20% | 保留原始日期 |

再发布后同步项：schema 日期字段、sitemap `lastmod`、缓存失效、GSC 重新提交、4–6 周排名/流量监控。

数据源：接入分析、Search Console、SEO 工具时直接用；否则向用户索取流量数据、排名历史、发布日期、候选 URL、竞品示例。

## 示例

**用户**："帮我刷新这篇关于'最佳云主机服务商'的博文。"

**输出**：CORE-EEAT 快评标记 Referenceability（可引用性）、Experience（一手经验）、Trust（可信）三项偏弱；建议——刷新各家定价、修复断链、补作者资质与署名、加联盟披露声明，并产出一段可随再发布使用的"Changes Made 变更清单"。再发布判定：因替换了定价表与新增对比章节，新内容约占 35% → 更新最后修改日期。

## 注意事项

- 把每次刷新当作一次 **GEO 引用机会**：写出可被 AI 答案引擎独立引用的事实句与定义块。
- 再发布前建议过一遍**内容质量审计门禁**，再打"热缓存"标记；veto 级风险（如虚假数据、合规问题）必须先解决。
- 刷新后持续追踪排名/流量变化（4–6 周窗口），用数据验证而非凭感觉收尾。
- 区分"刷新 vs 重写 vs 淘汰"：衰减是渐进的就刷新；主题失效或质量无救则重写或下线。
- 可把结果保存为带日期的摘要（如 `memory/audits/content-refresher/YYYY-MM-DD-<topic>.md`）便于复盘。

## 互见

- related：`seo-audit` —— 刷新前后做技术/页面体检定位结构性问题。
- related：`seo-traffic-drop-forensics` —— 若是突发骤降而非渐进衰减，先走取证排查。
- combines_with：`seo-content-writer` —— 当判定需大幅重写或新增章节时承接创作。
- combines_with：`schema-markup-builder` —— 再发布时更新结构化数据日期与类型。
- combines_with：`ai-search-seo` —— 配合 GEO 优化提升 AI 答案引擎可引用性。

---
*采编自 aaron-he-zhu/seo-geo-claude-skills（Apache-2.0）。*
