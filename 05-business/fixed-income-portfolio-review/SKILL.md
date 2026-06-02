---
name: fixed-income-portfolio-review
title: 固定收益组合审视
description: 当审视固定收益（债券）组合、需要批量定价后汇总成组合级久期/DV01/凸性、做现金流瀑布与利率情景压测时使用；调用 bond_price 等 MCP 工具算单券指标、自行按市值加权汇总并对标基准，产出含组合摘要表、行业/评级/期限构成、季度现金流瀑布、情景损益的组合审视报告；不适用于单只债券定价、权益/衍生品组合或无 MCP 工具接入的离线估算；触发词：债券组合、组合久期、DV01、现金流瀑布、利率情景压测
domain: 商业/finance
triggers: [债券组合, 固定收益组合, 组合久期, DV01, 凸性, 现金流瀑布, 利率情景, 压力测试, stress test, 组合审视, OAS, key rate duration, 利差, rate shock, 组合构成分析]
tags: [finance, fixed-income, 债券, 组合分析, 久期, DV01, 现金流, 情景分析, 风险管理, MCP]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [bond_price, yieldbook_bond_reference, yieldbook_cashflow, yieldbook_scenario, interest_rate_curve, fixed_income_risk_analytics]
requires: []
related: [bond-relative-value-analysis, bond-futures-basis-analysis, portfolio-risk-metrics, macro-rates-dashboard]
combines_with: [macro-rates-dashboard, portfolio-risk-metrics]
license: Apache-2.0
source: anthropics/financial-services
source_license: Apache-2.0
---
## 何时使用

审视**固定收益（债券）组合**：把单券定价、参考数据、现金流、情景压测的 MCP 工具输出，汇总成组合级指标与风险暴露。核心定位是**聚合 + 呈现**——单券解析量交给工具算，你负责按市值加权汇总、做构成拆解、并尽量对标基准。

典型场景：

- 计算组合久期、DV01、凸性、到期收益（YTW）。
- 拆解行业 / 评级 / 期限 / 币种构成，标注相对基准的超低配。
- 把各券现金流汇成季度瀑布，识别集中兑付期与再投资风险。
- 跑标准利率冲击做压测，找出损益贡献最大/最小的券。

**不该用的边界：**

- 单只债券定价或单券解析 → 直接用 `bond_price`，不必走整套组合流程。
- 权益 / 衍生品 / 多资产组合 → 本技能只覆盖固定收益。
- 没有 MCP 工具接入、想凭记忆离线估算 → 数据不可靠，不要硬凑。

## 步骤

工具链工作流（先全量定价，再逐层富化）：

1. **全量定价**：对所有持仓调 `bond_price`（支持逗号分隔的标识符批量定价），逐券提取收益、久期、DV01、凸性、利差。
2. **汇总组合指标**：以**市值加权**算组合级收益、久期、DV01、凸性（加权平均是硬约束，勿用简单平均）。
3. **富化参考数据**：对每只债券调 `yieldbook_bond_reference`，拿发行人/票息/到期/评级/行业/币种/赎回条款，搭出行业、评级、期限、币种构成表。
4. **投影现金流**：调 `yieldbook_cashflow` 取未来票息与本金兑付计划，汇成**季度现金流瀑布**，标注集中兑付期。
5. **跑情景**：调 `yieldbook_scenario`，用标准平移冲击 `-200bp, -100bp, -50bp, 0, +50bp, +100bp, +200bp`，识别损益贡献头部/尾部券。
6. **曲线背景**：对组合主币种调 `interest_rate_curve` 取政府收益率曲线，逐券算 spread-to-curve，评估当前曲线环境。
7. **综合成稿**：组合成含摘要指标、构成分析、现金流投影、情景损益的组合审视报告；有基准时一律对标基准呈现。

> 含内嵌期权的债券（可赎回/可回售等）→ 改用 `fixed_income_risk_analytics` 取 OAS、有效久期、关键利率久期（key rate duration）、凸性，避免用名义久期误判利率敏感度。

## 指令

**MCP 工具速查：**

- `bond_price` — 债券定价，返回净价/全价、收益、久期、凸性、DV01、利差；支持逗号分隔批量。
- `yieldbook_bond_reference` — 参考数据：发行人、票息、到期、评级、行业、币种、赎回条款。
- `yieldbook_cashflow` — 现金流投影：未来票息与本金兑付计划。
- `yieldbook_scenario` — 情景分析：平移与曲线情景下的价格/收益。
- `interest_rate_curve` — 政府收益率曲线，用于 spread-to-curve 与曲线环境判断。
- `fixed_income_risk_analytics` — OAS、有效久期、关键利率久期、凸性（含权债专用）。

**汇总硬约束：** 组合收益/久期/凸性一律按**市值权重**加权平均；DV01 直接逐券相加。有基准时，每个指标都给「组合 / 基准 / 主动（Active，差值）」三列。

## 示例

**组合摘要表：**

| 指标 | 组合 | 基准 | 主动 |
|------|------|------|------|
| 市值 | … | -- | -- |
| 收益（YTW） | … | … | +/-… bp |
| 修正久期 | … | … | +/-… |
| DV01（$） | … | … | +/-… |
| 平均评级 | … | … | -- |

**构成拆解：** 行业、评级、期限桶各出一张百分比表，标注相对基准的超配/低配。

**现金流瀑布：**

| 期间 | 票息收入 | 本金 | 合计现金 |
|------|----------|------|----------|
| Q1 | … | … | … |
| Q2 | … | … | … |

**情景损益：**

| 情景 | 组合损益（$） | 组合损益（%） | 头部贡献 | 尾部贡献 |
|------|---------------|---------------|----------|----------|
| -100bp | … | … | … | … |
| 基准 | -- | -- | -- | -- |
| +100bp | … | … | … | … |
| +200bp | … | … | … | … |

## 注意事项

- **顺序不能乱**：必须先 `bond_price` 全量定价，再用参考数据做构成、用现金流看再投资风险、用情景做压测；缺定价基底则后续汇总失真。
- **久期口径**：含权债用 `fixed_income_risk_analytics` 的有效久期/OAS，别拿名义久期当利率敏感度。
- **加权而非简单平均**：组合收益/久期/凸性必须市值加权；DV01 可相加。
- **始终对标基准**：有基准就给主动差值；构成拆解要标超低配，否则只是一堆数字。
- 工具负责单券解析量，你负责聚合与呈现——不要在 Agent 侧重算工具已给的指标。

## 互见

- related：`startup-financial-modeler` —— 同为财务建模，可复用场景化（base/上行/下行）的投影思路。
- related：`cfo-financial-advisor` —— 现金/跑道与情景规划的财务决策视角可借鉴。
- combines_with：`data-storyteller` —— 把组合构成与情景损益讲成有说服力的图文叙事。
- combines_with：`board-deck-builder` —— 把组合审视结论压缩成投委会/董事会决策页。

---
采编自 anthropics/financial-services（Apache-2.0）。
