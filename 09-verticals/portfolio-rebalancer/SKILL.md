---
name: portfolio-rebalancer
title: 投资组合再平衡
description: 当需要检查投资组合偏离目标配置并生成调仓建议时使用；做漂移分析与税务感知的买卖交易清单（含再平衡前后对比、税负摘要）；不适用于单只标的选股、择时或宏观研判；触发词：再平衡、rebalance、组合漂移、portfolio drift、配置检查、allocation check、调仓建议、rebalancing trades、组合失衡
domain: 领域/fintech
triggers: [再平衡, rebalance, 组合漂移, portfolio drift, 配置检查, allocation check, 调仓建议, rebalancing trades, 组合失衡]
tags: [fintech, portfolio, rebalancing, wealth-management, tax-aware, asset-allocation]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [excel, spreadsheet]
requires: []
related: [portfolio-risk-metrics, tax-loss-harvesting, backtesting-frameworks]
combines_with: [portfolio-risk-metrics, tax-loss-harvesting]
license: Apache-2.0
source: anthropics/financial-services
source_license: Apache-2.0
---
## 何时使用

当用户持有跨多个账户的投资组合，需要把实际配置拉回到 IPS（投资政策声明）目标，并希望得到一份可执行、考虑税务的调仓清单时使用。典型触发：「再平衡 / rebalance」「组合漂移 / portfolio drift」「配置检查 / allocation check」「调仓建议 / rebalancing trades」「我的组合失衡了」。

不该用的边界：
- 纯选股、择时、宏观判断——本技能只做配置对齐，不预测涨跌。
- 漂移仍在再平衡区间内（通常 ±3%~5%）时，不要为了再平衡而再平衡。
- 应税账户里税务成本可能超过再平衡收益，先算盈亏平衡点再决定是否动手。

## 步骤

1. 盘点当前状态：逐账户记录账户类型（应税 / IRA / Roth / 401k）、各持仓市值、成本基础（应税账户）、每个仓位的浮盈浮亏。
2. 漂移分析：将当前配置对比 IPS 目标，按资产类别填表，标出超过再平衡区间的仓位。
3. 生成调仓建议：按税务感知规则把配置拉回目标。
4. 资产位置（Asset Location）复核：优化「什么资产放在什么账户」。
5. 实施测算：汇总各账户交易笔数、预估交易成本、预估税务影响（已实现盈亏）、对漂移的净效果。
6. 输出：漂移分析表、调仓清单（Excel）、税负摘要、再平衡前后配置对比。

## 指令

资产类别漂移表（按此结构填写，标红超区间项）：

| 资产类别 | 目标% | 当前% | 漂移 | 超配/缺配金额 |
|---|---|---|---|---|
| 美国大盘股 / US Large Cap | | | | |
| 美国中小盘 / Small-Mid Cap | | | | |
| 国际成熟市场 | | | | |
| 新兴市场 | | | | |
| 投资级债券 | | | | |
| 高收益 / 信用债 | | | | |
| TIPS / 抗通胀 | | | | |
| 另类资产 | | | | |
| 现金 | | | | |

税务感知再平衡规则：
- 优先在税收优惠账户（IRA、Roth）内再平衡——无税务后果。
- 应税账户中避免卖出有大额短期收益的仓位。
- 再平衡的同时尽量收割亏损（TLH）。
- 警惕洗售规则（wash sale，30 天窗口），需跨所有账户协调。
- 优先把新增缴款导向低配资产类别，而非主动交易。

调仓清单：

| 账户 | 操作 | 标的 | 股数/金额 | 理由 | 税务影响 |
|---|---|---|---|---|---|
| | 买入/卖出 | | | 再平衡 / TLH | 短期收益 / 长期收益 / 亏损 |

资产位置优化原则：
- 税延账户（IRA/401k）：债券、REITs、高换手基金（税务拖累最大）。
- Roth：预期增长最高的资产（免税增长）。
- 应税账户：税务高效的权益（指数基金、ETF、市政债），及税损收割候选。

## 示例

输入：客户在应税账户 + IRA 共持有股债组合，股票目标 60%、实际 67%，债券目标 40%、实际 33%。

处理：股票超配 +7% 已突破 ±5% 区间。优先在 IRA 内卖出 7% 股票、买入债券（无税务后果）；若 IRA 额度不足，再到应税账户卖出长期收益仓位，并优先收割其中浮亏标的；同时将本月新增缴款全部投向债券以缩小缺口。

输出：漂移表（标红股票/债券）、IRA 与应税账户分账户调仓清单、预估交易成本与已实现盈亏摘要、再平衡前后 60/40 配置对比。

## 注意事项

- 不要为了再平衡而再平衡——区间内的小幅漂移可接受。
- 应税账户里税务成本可能超过再平衡收益——先算盈亏平衡点。
- 交易前考虑待发生的现金流（缴款、提取、RMD 最低分配）。
- 检查客户特定限制（ESG、集中持股、锁定期）。
- 为每笔交易记录决策理由，以备合规留档。
- 洗售规则跨账户生效——需在整个家庭账户层面协调交易。

## 互见

本条采编自 anthropics/financial-services（Apache-2.0）。
