---
name: seo-performance-reporter
title: SEO/GEO 绩效报告与 KPI 仪表盘
description: 当需要汇总 SEO/GEO 数据、出月报/周报、给老板或客户做绩效汇报与 KPI 仪表盘时使用；做多源数据聚合→对比基准/竞品→算 ROI→把指标变动转成分优先级建议的可交付报告（含执行摘要、指标速览表与行动清单）；不适用于技术健康体检（用 seo-audit）、流量骤降取证（用 seo-traffic-drop-forensics）或 AI 引用内容改写（用 ai-search-seo）；触发词：SEO报告、绩效仪表盘、流量报告、月报、汇报给老板
domain: 商业/seo
triggers: [SEO报告, 出SEO报告, 绩效仪表盘, 数据看板, 流量报告, 月报, 周报, 汇报给老板, 看看SEO数据, GEO可见性报告, executive summary, KPI dashboard, stakeholder report]
tags: [seo, geo, seo-reporting, performance-report, kpi-dashboard, traffic-report, monthly-report, stakeholder-report, roi, ai-citation]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Google Analytics / GA4, Google Search Console, Ahrefs / Semrush, AI 引用监控工具, Markdown / 表格]
requires: []
related: [seo-rank-tracker, seo-audit, marketing-performance-report, seo-content-gap-analysis]
combines_with: [seo-rank-tracker, html-dashboard-builder, seo-content-refresher]
license: Apache-2.0
source: aaron-he-zhu/seo-geo-claude-skills
source_license: Apache-2.0
---
# SEO/GEO 绩效报告与 KPI 仪表盘

聚合 SEO/GEO 数据，搭建面向干系人的报告，对标目标与竞品，计算 ROI，并把指标变动（delta）转成分优先级的建议。

## 何时使用

- 要出**周期性绩效报告**：月报/周报、季度复盘、执行摘要、流量/排名报告、GEO 可见性报告、KPI 仪表盘。
- 要**汇报给老板或客户**，把一段时间的 SEO/GEO 成果讲清楚并给出下一步动作。

不该用的边界：
- 只想做**技术/页面健康体检**、找问题清单 → 用 `seo-audit`。
- 流量/排名**突然骤降要取证归因** → 用 `seo-traffic-drop-forensics`。
- 想让内容被 AI 搜索**引用**、改写内容 → 用 `ai-search-seo` / `ai-answer-engine-seo`。

## 步骤

按以下 11 步组织报告（统一形态：**指标表 → 变了什么 → 为何重要 → 下一步动作**）：

1. **定义报告参数** —— 域名、周期、对比周期、报告类型、受众、关注领域、数据新鲜度。
2. **执行摘要** —— 总体评级（优秀/良好/需关注/严重）、亮点、需盯领域、必做动作、指标速览（流量/排名/转化/权威/AI 引用）、SEO ROI。
3. **自然流量** —— 会话/用户/浏览量、互动或跳出率、趋势、来源/设备拆分、Top 页面；务必**区分品牌词与非品牌词**。
4. **关键词排名** —— 位次分桶、分布变化、提升/下滑 Top、SERP 特性、对流量的影响。
5. **GEO/AI 表现** —— AI 引用率概览、按主题的引用、GEO 亮点、优化机会。
6. **域权威（CITE）** —— 有数据则给 CITE 各维度分与 veto 状态；无则标「尚未评估」。
7. **内容质量（CORE-EEAT）** —— 有数据则给平均分与趋势；无则标「尚未评估」。
8. **外链** —— 链接画像、获取趋势、重点链接、竞争位置；关注 toxic 占比。
9. **内容表现** —— 发布概况、Top 内容、需关注内容、内容 ROI。
10. **生成建议** —— 即时/短期/长期动作，每条带优先级、负责人、预期影响、下期目标。
11. **汇编完整报告** —— 目录、附录、数据来源、方法论、术语表。

缺数据一律标 `尚未评估` 并指向 next-best skill，不要留空或臆造。

## 指令

- 每个指标必须标注**来源、日期范围、对比周期**，以及属于品牌/非品牌/混合。
- 对比周期选择：WoW 看突变（噪声大）、MoM 看经营趋势（有季节偏差）、YoY 控季节性（可能掩盖近期走势）、滚动 30 天平滑噪声（滞后）。
- 位次（average position）只作方向参考，须与 CTR、SERP 特性合看；AI Overview / PAA 会抢点击。
- ROI 按 **12 个月以上**衡量，因为 SEO 是复利积累。
- 数据源全部可选：接了工具就从 analytics 拉流量、Search Console 拉搜索、SEO 工具拉排名/外链、AI 监控拉可见性；没接就向用户索要导出数据与 KPI。

## 示例

执行摘要表（最小可用骨架）：

```markdown
# SEO & GEO 绩效报告
**域名**: [domain] | **周期**: [date range] | **生成日期**: [date]
**总体表现**: [优秀/良好/需关注/严重]

| 指标 | 当前 | 上期 | 变化 | 目标 | 状态 |
|------|------|------|------|------|------|
| 自然流量 | [X] | [Y] | [+/-Z%] | [T] | [状态] |
| Top10 关键词 | [X] | [Y] | [+/-Z] | [T] | [状态] |
| 自然转化 | [X] | [Y] | [+/-Z%] | [T] | [状态] |
| 域权威 / CITE | [X] | [Y] | [+/-Z] | [T] | [状态] |
| AI 引用 | [X] | [Y] | [+/-Z%] | [T] | [状态] |

亮点: […] | 需盯: […] | 必做动作: […]
```

状态取值统一：`On track` / `Watch` / `Off track` / `N/A`；delta 同时给绝对值与百分比。

关键 KPI 阈值参考：自然会话 MoM 3-10% 健康，跌 >10% 无季节因素需排查；自然 CTR >3% 健康、<1.5% 告警；平均位次 <20 健康、>30 告警；非品牌词占比 >50% 健康、<30% 表明过度依赖品牌；AI 引用率 >20% 健康、<5% 告警；toxic 外链 >10% 危急；SEO ROI 年化 >200% 健康、12 个月后仍 <100% 告警。

## 注意事项

- **先洞察后数字**：每段先给结论再给数据，按受众调深浅（高管=趋势+动作；技术=原因+负责人）。
- 每条行动都要带**负责人 + 截止时间 + 预期影响**。
- 每个基准都要在报告里**记来源与日期**，避免口径漂移。
- 报告写完问用户「Save these results?」；同意则写入 `memory/monitoring/YYYY-MM-DD-<topic>.md`，含头条发现、可执行项与遗留问题（open loops）。
- 把重大变化、确认的异常、后续动作、待决策推进到 `memory/open-loops.md`。

## 互见

- related：`seo-audit` —— 报告暴露的技术问题转去做体检
- related：`seo-traffic-drop-forensics` —— 报告里发现骤降时转去取证归因
- related：`ai-search-seo`、`ai-answer-engine-seo` —— GEO/AI 引用维度的优化执行
- related：`social-media-performance-analyzer` —— 跨渠道绩效对照
- combines_with：`marketing-analytics-tracker` —— 先把埋点/转化追踪建好，报告口径才准
- combines_with：`data-storyteller` —— 把指标变动讲成给高管/客户的叙事与图表

---
采编自 aaron-he-zhu/seo-geo-claude-skills（Apache-2.0）。
