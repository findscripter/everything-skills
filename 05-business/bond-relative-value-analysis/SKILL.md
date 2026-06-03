---
name: bond-relative-value-analysis
title: 债券相对价值分析
description: 当判断债券贵/便宜、做利差分解（无风险+信用+残差）、对比同类券或跑利率冲击情景时使用；做基于 MCP 行情/曲线工具链的相对价值评估并产出利差分解表、情景损益表与贵/便宜建议；不适用于权益估值、纯发行定价、组合层级配置或无可比券与曲线数据的场景；触发词：相对价值、贵便宜、利差分解、Z-spread、G-spread、债券情景分析
domain: 商业/finance
triggers: [相对价值, 贵便宜, rich cheap, 利差分解, Z-spread, G-spread, 信用利差, 残差利差, 情景分析, 利率冲击, 债券相对价值, spread decomposition]
tags: [finance, fixed-income, bond, relative-value, spread, scenario-analysis, mcp, 卖方研究]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [MCP, bond_price, interest_rate_curve, credit_curve, yieldbook_scenario]
requires: []
related: [swap-curve-strategy, fixed-income-portfolio-review, macro-rates-dashboard, bond-futures-basis-analysis]
combines_with: [research-catalyst-calendar, portfolio-risk-metrics]
license: Apache-2.0
source: anthropics/financial-services
source_license: Apache-2.0
---
分析师角色：专精固定收益相对价值。把行情、利率曲线、信用曲线、情景分析等 MCP 工具的输出，路由进**利差分解**与**情景表**——计算交给工具，你负责综合判断与建议。

核心理念：相对价值看的是「这只债的利差，相对可比券是否充分补偿了它的风险」。务必把总利差拆成 **无风险 + 信用 + 残差** 三段；残差（扣掉利率与信用后剩下的）才暴露真正的贵/便宜。再用情景压力测试确认观点在不同利率环境下是否成立。

## 何时使用

判断单券或一组可比券是 **rich（贵，回避/低配）/ cheap（便宜，买入/超配）/ fair（公允，中性）**，并需量化利差分解与利率情景损益时使用。

**不该用的边界：**

- 权益/股票估值、首次发行（一级）定价 → 用别的技能。
- 组合层级的久期/配置决策、风险预算 → 本技能聚焦单券相对价值。
- **缺少可比券或对应曲线数据**（无 ISIN/RIC/CUSIP、无该币种利率曲线、无该发行人信用曲线）→ 无法做分解，先补数据。
- 没有可用 MCP 工具（bond_price 等）的环境 → 本技能依赖工具计算，不靠记忆估值。

## 可用 MCP 工具

- **`bond_price`** —— 债券定价。返回净价/全价、收益率、久期、凸性、DV01、Z-spread。接受 ISIN / RIC / CUSIP。
- **`interest_rate_curve`** —— 政府债与互换利率曲线。两阶段：先 list 再 calculate。用于算 G-spread。
- **`credit_curve`** —— 按发行人类型的信用利差曲线。两阶段：先按 country/issuerType 搜索，再 calculate。用于隔离信用分量。
- **`yieldbook_scenario`** —— 平行利率移动的情景分析。返回各情景下的价格变动与损益。
- **`tscc_historical_pricing_summaries`** —— 历史定价数据。用于历史利差分位与 Z-score。
- **`fixed_income_risk_analytics`** —— OAS、有效久期、关键利率久期。用于含权（可赎回）债与更深的风险拆解。

## 步骤

工具链工作流：

1. **给债券定价**：对目标券及任何可比券调 `bond_price`，取出收益率、Z-spread、久期、凸性、DV01。
2. **取无风险曲线**：按债券币种调 `interest_rate_curve`（list 后 calculate），在债券到期点**插值**，算出 G-spread。
3. **取信用曲线**：按发行人国别与类型调 `credit_curve`，取到期点的信用利差。**残差利差 = G-spread − 信用曲线利差**。
4. **跑情景**：调 `yieldbook_scenario`，做平行移动 **−100bp / −50bp / 0 / +50bp / +100bp**，取各情景价格变动与损益。
5. **历史背景（可选）**：调 `tscc_historical_pricing_summaries`，评估当前利差相对历史的位置（分位、对均值）。
6. **综合**：把利差分解、情景结果、历史背景合成 rich/cheap 判断。

含权（可赎回）债另调 `fixed_income_risk_analytics` 取 OAS 与关键利率久期，做更深拆解。

## 指令

固定输出三块表/段：

**① 利差分解表**

| 分量 | 利差 (bp) | 占总比 |
|---|---|---|
| G-spread（相对政府债总利差） | … | 100% |
| 信用曲线利差 | … | …% |
| 残差（流动性 + 技术面） | … | …% |

**② 情景损益表**

| 情景 | 价格变动 | 损益（每 100 面值） |
|---|---|---|
| −100bp | … | … |
| −50bp | … | … |
| 基准 | … | … |
| +50bp | … | … |
| +100bp | … | … |

**③ 贵/便宜结论**：写明主利差指标、其历史背景（分位、对均值的比较）、残差利差信号，并给清晰建议——rich（回避/低配）、cheap（买入/超配）或 fair（中性）。**量化需多少 bp 的利差移动才会改变结论。**

## 示例

> **利差分解**
> G-spread 120bp（100%）；信用曲线利差 85bp（71%）；残差 35bp（29%）。
>
> **情景损益（每 100 面值，久期≈6.5）**
> −100bp：+6.8｜−50bp：+3.3｜基准：0｜+50bp：−3.2｜+100bp：−6.3。
>
> **结论**：残差 35bp 高于同业典型 15-20bp，且当前 G-spread 处近 1 年 80 分位 → 偏 **cheap，建议超配**；若利差收窄 ~18bp（残差回到 ~17bp）则降级为 fair。

## 注意事项

- **让工具算，你来综合**：估值/久期/情景由 MCP 工具计算，不要凭记忆或手算近似替代。
- **曲线要在到期点插值**：G-spread 与信用利差都须取债券**到期对应期限**的曲线值，否则分解失真。
- **残差是核心信号**：残差 ≈0 说明利差已被利率+信用解释完，无超额；残差为正才是「便宜」的来源，但要排查是否由真实流动性/技术面、而非数据口径错误造成。
- **币种与发行人类型要对齐**：利率曲线按债券币种、信用曲线按发行人国别/类型，错配会让分解无意义。
- **情景须确认观点稳健**：若某只券仅在单一利率路径下显便宜，结论可信度低；用 −100~+100bp 全区间验证。
- **历史背景需快照口径一致**：分位/Z-score 要用同一历史序列，避免拿不同样本期比较。
- 含权债用净利差会高估补偿，应改用 **OAS**（`fixed_income_risk_analytics`）。

## 互见

- related：`equity-earnings-update-report` —— 同属卖方研究输出，可复用「数字打头、结论可量化」的写法。
- related：`startup-financial-modeler` / `cfo-financial-advisor` —— 利率情景与损益可喂入更大财务模型。
- combines_with：`data-storyteller` —— 把利差分解与情景表讲成有说服力的图文叙事。
- combines_with：`board-deck-builder` —— 把 rich/cheap 结论压成投委会决策页。

---
采编自 anthropics/financial-services（Apache-2.0）。
