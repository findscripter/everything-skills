---
name: earnings-preview-model
title: 财报前瞻与预估建模
description: 当上市公司即将发布季度财报、需在披露前搭建预估模型与"看什么"框架时使用；做拉取一致预期、按行业列关键观察指标、构建多/中/空三情景表与催化剂清单，产出一页式财报前瞻；不适用于财报已发布后的实际值复盘、长期 DCF 估值或自动抓取实时行情；触发词：财报前瞻、earnings preview、盈利前瞻、季报预估、一致预期、what to watch、pre-earnings
domain: 商业/finance
triggers: [财报前瞻, earnings preview, 盈利前瞻, 季报预估, 一致预期, what to watch, pre-earnings, 财报预估建模]
tags: [finance, earnings, equity-research, estimates, scenario-analysis, business]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [web-search]
requires: []
related: [octagon-earnings-financial-guidance, octagon-analyst-estimates, equity-earnings-update-report, octagon-price-target-consensus]
combines_with: [octagon-earnings-call-analysis, research-catalyst-calendar]
license: Apache-2.0
source: anthropics/financial-services
source_license: Apache-2.0
---
## 何时使用

- 某上市公司即将发布季度财报，需要在披露**之前**做准备：建立预估模型、设置多空情景、明确什么会驱动股价。
- 输入是公司名称 + 报告季度；要产出一页式"财报前瞻"，含一致预期表、关键观察指标、情景表、催化剂清单。
- 触发词：财报前瞻、earnings preview、盈利前瞻、季报预估、一致预期、what to watch、pre-earnings。

不该用的边界：

- **财报已发布后**的实际值 vs 预期复盘、电话会纪要解读 → 那是事后分析，本技能只做"披露前准备"。
- 长期 DCF 估值、完整三表建模、多年盈利预测 → 超出范围，本技能聚焦单季度临场设置。
- 不自动抓取实时行情/期权链/实时一致预期——这些数字须人工核实并标注来源与日期。
- 取不到一致预期或关键运营数据来源时，不要臆造数字，标"待核实"。

## 步骤 / 指令

```
1. 搜集背景（Gather Context）
   - 确定公司与报告季度。
   - 用 web search 拉一致预期：营收、EPS、关键分部指标。
   - 查财报日期与时段（盘前 pre-market / 盘后 after-hours）。
   - 回看上季度电话会，找指引(guidance)与管理层口径。

2. 关键指标框架（What to Watch）—— 按公司定制
   财务指标：
   - 营收 vs 一致预期（总额 + 分部）
   - EPS vs 一致预期
   - 毛利/经营/净利率 —— 扩张还是收缩？
   - 自由现金流(FCF)
   - 前瞻指引 vs 一致预期
   运营指标（按行业选）：
   - 科技/SaaS：ARR、净留存(NRR)、RPO、客户数
   - 零售：同店销售、客流、客单价(basket)
   - 工业：在手订单(backlog)、book-to-bill、价 vs 量
   - 金融：净息差(NIM)、资产质量、贷款增长、中收
   - 医疗：处方量(scripts)、患者量、管线进展

3. 情景分析（3 情景 + 股价含义）
   | 情景 | 营收 | EPS | 关键驱动 | 股价反应 |
   |------|------|-----|---------|---------|
   | 多(Bull)  | | | | |
   | 中(Base)  | | | | |
   | 空(Bear)  | | | | |
   每个情景说明：运营上要发生什么 / 管理层什么口径会指向它 /
   历史上类似业绩股价怎么走（搜 "[公司] earnings reaction history"）。

4. 催化剂清单（决定股价反应的 3-5 件事）
   1) [指标] vs [一致预期/whisper 数] —— 为何重要
   2) [指引项] —— 买方期待听到什么
   3) [叙事转向] —— 战略变化、并购、重组等

5. 产出：一页式前瞻
   - 公司、季度、财报日期
   - 一致预期表
   - 关键观察指标（按重要性排序）
   - 多/中/空情景表
   - 催化剂清单
   - 交易设置：近期股价表现、期权隐含波动幅度(implied move)
```

## 示例

委托提示词（给 Agent 调用时）：
> 为 [公司] [季度] 做财报前瞻。先 web search 拉一致预期（营收/EPS/关键分部指标）并标来源与日期；确认财报日期与盘前/盘后；按公司所在行业列出"看什么"指标并排序；构建多/中/空三情景表（含营收、EPS、关键驱动、预期股价反应）；给出 3-5 条催化剂清单；附近期股价表现与期权隐含波动幅度。最后输出一页式前瞻。

一页式前瞻骨架（节选）：

```
公司：ACME   季度：FY25 Q3   财报：11/05 盘后
一致预期：营收 $1.20B（来源 X，截至 10/28） | EPS $0.85
关键观察指标（排序）：
  1. 净留存(NRR) vs 上季 —— SaaS 估值核心
  2. 营收指引 vs 一致预期 —— 买方最关注上修/下修
  3. 经营利润率 —— 扩张趋势能否延续
```

情景表：

| 情景 | 营收 | EPS | 关键驱动 | 股价反应 |
|------|------|-----|---------|---------|
| 多 | $1.25B | $0.92 | 大客户扩张 + 指引上修 | +8~12% |
| 中 | $1.20B | $0.85 | 符合预期、指引重申 | ±3% |
| 空 | $1.14B | $0.78 | NRR 走弱 + 指引下修 | -10~15% |

## 注意事项

- 一致预期会变 —— **务必标注来源与日期**，否则前瞻失去参照。
- "Whisper number"（买方调研口风价）常比公开一致预期更相关，能查到就一并列出。
- 历史财报反应能校准预期（搜 "[公司] earnings reaction history"）—— 同样的超预期幅度，不同公司股价反应差异巨大。
- 期权隐含波动幅度反映市场预期的波动空间 —— 拿它和你的多空情景对比，判断市场定价是否偏激进/保守。
- 关键运营指标因行业而异，先确认公司所属行业再选指标，别套错框架。
- 所有数字（一致预期、隐含波动、历史反应）须人工核实；本技能只做准备框架，不构成投资建议。

## 互见

- related：`cfo-financial-advisor`（公司侧财务视角，与外部投资人前瞻互为镜像）；`startup-financial-modeler`（同为预估建模，前者面向未上市公司多年模型）；`market-sizing-analyst`（情景驱动假设常需市场规模佐证）；`data-storyteller`（把情景表与催化剂清单讲成一页式叙事）。
- combines_with：`board-deck-builder`（把财报前瞻并入投委会/投资人材料）；`data-storyteller`（一页式前瞻的可视化与叙事打磨）。

---
本条采编自 anthropics/financial-services（Apache-2.0）。
