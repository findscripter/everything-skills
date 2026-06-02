---
name: unit-economics-analyzer
title: 单位经济模型分析
description: 当评估 SaaS/订阅/经常性收入企业（尤其 PE 标的）的收入质量与客户经济性时使用；做 ARR 桥、队列留存、LTV/CAC、净留存与毛利瀑布的拆解并产出可对标的收入质量评分与红旗清单；不适用于一次性买断硬件、纯交易撮合无客户复购或个人理财规划。触发词：单位经济、收入质量、队列分析、cohort analysis、ARR 分析、LTV CAC、净留存、NDR、客户经济性、unit economics。
domain: 领域/fintech
triggers: [单位经济, 收入质量, 队列分析, cohort analysis, ARR 分析, LTV CAC, 净留存, NDR, 客户经济性, unit economics]
tags: [fintech, saas, unit-economics, cohort-analysis, ltv-cac, net-retention, arr, revenue-quality, private-equity, due-diligence]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Excel, spreadsheet]
requires: []
related: [pe-returns-sensitivity, three-statement-model, financial-analysis-toolkit, lbo-model-builder]
combines_with: [pe-returns-sensitivity, cfo-financial-advisor]
license: Apache-2.0
source: anthropics/financial-services
source_license: Apache-2.0
---
## 何时使用

适用：评估 SaaS / 订阅 / 经常性收入 / 用量计费类企业的收入质量与客户经济性，常见于 PE 尽调、投后复盘、收入健康度诊断。典型请求：「分析这家公司的单位经济」「搭一个队列留存矩阵」「算 LTV/CAC 和回收期」「这家 SaaS 的净留存健康吗」。

不该用：纯一次性买断（硬件、永久授权）且无续费复购的业务；纯交易撮合、客户无留存概念的业务（应改看 take rate 与交易量趋势，而非传统 ARR/留存）；个人理财、家庭预算等非企业收入分析。专业服务（PS）收入须单独评估，不计入经常性口径。

## 步骤

### 第 1 步：判定商业模式

先定口径再算指标：
- SaaS / 订阅：ARR、净留存、队列
- 经常性服务：合同额、续约率、增购
- 交易 / 用量计费：单笔收入、交易量趋势、take rate
- 混合：按收入流分别拆解

### 第 2 步：核心指标

ARR / 收入质量：
- ARR 桥：期初 ARR → 新增 → 扩张 → 收缩 → 流失 → 期末 ARR
- 队列 ARR（vintage）：每个年份队列如何留存与增长
- 收入集中度：Top 10/20/50 客户占总收入比
- 收入构成：经常性 vs 非经常性 vs 专业服务
- 合同结构：ACV 分布、多年合同占比、自动续约占比

客户经济性（关键公式）：
- CAC ＝ 销售与营销总支出 / 新增客户数
- LTV ＝（ARPU × 毛利率）/ 流失率
- LTV:CAC ＝ 健康业务目标 >3x
- CAC 回收期 ＝ 收回获客成本所需月数
- 分层口径：企业级 / 中端 / SMB 分别测算，勿只看混合值

留存与扩张：
- 总留存（GRR）：保留的期初 ARR 占比（不含扩张）
- 净留存（NDR）：含扩张后保留的期初 ARR 占比
- Logo 流失：流失客户数占比
- 金额流失：流失收入占比（常与 logo 流失不同）
- 扩张率：增购 + 交叉销售占期初 ARR 比

队列矩阵（同时给绝对额与指数化两视图，指数以 Year 0 = 100%）：

| Cohort | Year 0 | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|--------|
| 2020 | $1.0M | $1.1M | $1.2M | $1.1M |
| 2021 | $1.5M | $1.7M | $1.8M | |
| 2022 | $2.0M | $2.3M | | |
| 2023 | $3.0M | | | |

毛利瀑布：收入 → 毛利 → 贡献毛利 → EBITDA；做满载单位经济（获取+服务+留存一个客户的全成本）；按收入流（订阅/服务/其他）分别看毛利率。

### 第 3 步：对标基准

- Rule of 40：增长率 + EBITDA 利润率 > 40%
- Magic Number：净新增 ARR / 上期 S&M 支出 > 0.75x
- NDR：优秀 >120%，良好 >110%，警示 <100%
- LTV:CAC：优秀 >5x，良好 >3x，警示 <2x
- 总留存 GRR：优秀 >95%，良好 >90%，警示 <85%
- CAC 回收期：优秀 <12 月，良好 <18 月，警示 >24 月

### 第 4 步：收入质量评分

将各维度汇总为评分表（每项 1-5 分）：经常性占比、净留存、客户集中度、队列稳定性、增长可持续性、毛利结构 → 综合分。

### 第 5 步：产出

- Excel 工作簿：ARR 桥 + 队列矩阵 + 单位经济仪表盘
- 摘要页：关键指标与对标结论
- 红旗清单与需进一步尽调的事项

## 指令

1. 优先索取客户级原始数据——聚合指标会掩盖问题。
2. 先判模式（第 1 步），再套对应公式，避免用 SaaS 口径硬套用量业务。
3. NDR 与 GRR 必须同时呈现，单看 NDR>100% 会掩盖高总流失。
4. 队列分析是收入质量第一视图，数据缺失要主动追要。
5. 区分签约 ARR 与实际确认收入，勿混用。

## 示例

输入：某 SaaS 标的 2023 年报，期初 ARR $20M、新增 $6M、扩张 $3M、收缩 $1M、流失 $2M。
- 期末 ARR ＝ 20 + 6 + 3 − 1 − 2 ＝ $26M
- GRR ＝ (20 − 1 − 2) / 20 ＝ 85%（警示线）
- NDR ＝ (20 − 1 − 2 + 3) / 20 ＝ 100%（扩张恰好抵消流失，红旗：高总流失被扩张掩盖）
- 若 ARPU $50K、毛利率 80%、年流失 15%，则 LTV ＝ (50K × 0.8) / 0.15 ≈ $267K；CAC $80K 时 LTV:CAC ≈ 3.3x（良好），回收期 ≈ 80K / (50K×0.8/12) ≈ 24 月（警示）。
结论：留存承压，需下钻队列与客户集中度。

## 注意事项

- 聚合指标会掩盖问题，坚持要客户级数据。
- NDR>100% 可能掩盖高总流失——务必同列 GRR。
- 队列分析最能反映收入质量，是必争数据。
- 区分签约 ARR 与实际确认收入。
- 用量计费模型聚焦消耗趋势与扩张，而非传统 ARR 指标。
- 专业服务收入单独评估：非经常性、毛利通常更低。

## 互见

无紧密关联的已有技能。

---
本条采编自 anthropics/financial-services（Apache-2.0）。
