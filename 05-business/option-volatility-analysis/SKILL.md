---
name: option-volatility-analysis
title: 期权波动率分析
description: 当对股票/指数/外汇期权做波动率评估——拉取波动率曲面、定价并算希腊字母、用历史价算已实现波动率、判断隐含 vs 已实现的贵贱（vol premium）时使用；产出曲面 ATM 项结构/风险逆转/蝶式摘要、希腊字母表、IV-RV 对比表与策略建议；不适用于无 MCP 行情工具的离线估算、给散户下单建议或自建定价引擎。触发词：期权波动率、vol surface、波动率曲面、希腊字母、implied vol、隐含 vs 已实现
domain: 商业/finance
triggers: [期权波动率, vol surface, 波动率曲面, 希腊字母 Greeks, implied vol 隐含波动率, realized vol 已实现波动率, vol premium, 风险逆转 risk reversal, 波动率微笑 skew, ATM 项结构 term structure, option pricing 期权定价, delta gamma vega theta, 波动率交易]
tags: [finance, derivatives, options, volatility, greeks, vol-surface, implied-realized, MCP, LSEG]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [MCP: equity_vol_surface, MCP: fx_vol_surface, MCP: option_value, MCP: option_template_list, MCP: tscc_historical_pricing_summaries, MCP: qa_historical_equity_price]
requires: []
related: [options-strategy-advisor, portfolio-risk-metrics, fx-carry-trade-eval, swap-curve-strategy]
combines_with: [trade-position-sizer, portfolio-rebalancer]
license: Apache-2.0
source: anthropics/financial-services
source_license: Apache-2.0
---
## 何时使用

为股票/指数/外汇期权做**波动率体检**：评估隐含波动率（IV）相对已实现波动率（RV）是贵还是便宜、解读曲面形状、给出带希腊字母与理由的策略建议。典型问句："SPX 的 vol 现在贵不贵""帮我看下 EURUSD 的波动率曲面和 skew""给这批期权定价并算希腊字母"。

**核心心法**：永远**先看曲面**——它编码了市场对各执行价/到期日未来不确定性的看法，单只期权价格都是从曲面派生的。顺序固定：先拉曲面看全局 → 再对具体合约定价取精确希腊字母 → 再用历史价算 RV 与同期限 IV 对比。**vol premium = IV − RV** 是判断期权贵贱的关键指标。

**不该用边界**：
- 无 MCP 行情工具的纯离线/手算估算——本技能依赖工具算、你只负责解读与建议。
- 给个人投资者的下单/投资建议（合规边界，仅做分析）。
- 自建 Black-Scholes/定价引擎或做曲面拟合——定价交给 `option_value`，你不重造轮子。

## 步骤

1. **曲面快照**：按资产类型调用 `equity_vol_surface`（股票/指数，输入 RIC 如 `.SPX@RIC` 或 RICROOT 如 `ES@RICROOT`）或 `fx_vol_surface`（外汇对，输入如 `EURUSD`，FX 曲面以 delta 空间报价）。提取 **ATM vol 项结构**、**25-delta 风险逆转（skew）**、**蝶式（smile 曲率）**。
2. **模板发现**：调用 `option_template_list`，找出标的可用的期权类型、到期日与执行价；在定价前确认有效合约。
3. **逐合约定价**：对关注的合约调用 `option_value`，取 premium、delta、gamma、vega、theta、rho 及 implied vol。
4. **取历史数据**：调用 `tscc_historical_pricing_summaries` 或 `qa_historical_equity_price` 拉 1 年日频 OHLC。
5. **算已实现波动率**：用收盘对收盘（close-to-close）算 **20 日 / 60 日 / 90 日** 窗口的 RV，分别对应 1M / 3M / 6M 的 ATM IV 期限。
6. **综合判断**：把曲面形状 + 希腊字母 + IV-RV 对比合成一份 vol 评估，标明 vol 体制（低/正常/偏高/危机）、IV 相对 RV 的贵贱、skew 方向与项结构形状，给出带关键希腊字母与理由的策略建议。

## 指令

工具选择与输入约定：

```text
股票/指数 → equity_vol_surface   输入 RIC（.SPX@RIC）或 RICROOT（ES@RICROOT）
外汇对    → fx_vol_surface       输入货币对（EURUSD），曲面以 delta 报价
合约发现  → option_template_list  先拿有效到期/执行价，再定价
单只定价  → option_value         取 premium + 全套希腊字母 + IV
历史价    → tscc_historical_pricing_summaries 或 qa_historical_equity_price（1Y 日频）
```

已实现波动率（年化，按 252 交易日）：
```text
RV = stdev( ln(C_t / C_{t-1}) ) × sqrt(252)
窗口 20/60/90 日 ↔ 对应 1M/3M/6M ATM IV
vol premium = IV(同期限) − RV(对应窗口) ；为正=IV 偏贵（卖方有利），为负=偏便宜（买方有利）
```

固定输出三张表 + 评估：

```markdown
### 波动率曲面摘要
| 期限 | ATM Vol | 25d RR | 25d BF |
|------|---------|--------|--------|
| 1M | … | … | … |
| 3M / 6M / 1Y | … | … | … |

### 希腊字母表
| 指标 | Call | Put |
|------|------|-----|
| Premium / Delta / Gamma / Vega / Theta / Implied Vol | … | … |

### 隐含 vs 已实现对比
| 窗口 | RV | IV(同期限) | premium(IV−RV) | 信号 |
|------|----|-----------|----------------|------|
| 20d | … | 1M ATM | … | 贵/便宜 |
| 60d | … | 3M ATM | … | 贵/便宜 |
| 90d | … | 6M ATM | … | 贵/便宜 |

### 评估
vol 体制 + IV 贵贱 + 曲面信号（skew 方向、项结构形状）+ 推荐策略与关键希腊字母及理由。
```

## 示例

> 用户："SPX 一个月期权现在 vol 贵吗？"

1. `equity_vol_surface(".SPX@RIC")` → 1M ATM ≈ 14%，25d RR 偏负（看跌偏斜，典型股指 skew）。
2. `option_template_list(".SPX@RIC")` → 找到最近月 ATM 行权价。
3. `option_value(...)` → ATM call/put 的 premium、delta≈0.5、vega、theta、IV≈14%。
4. `tscc_historical_pricing_summaries(".SPX@RIC")` → 1Y 日频。
5. 算 20 日 RV ≈ 10% → premium = 14% − 10% = **+4%**，IV 偏贵。
6. 评估："vol 体制正常偏低；1M IV 较 20 日 RV 贵约 4 vol 点；skew 向下（下行保护需求高）。若中性看法可考虑卖 vega（如卖跨/宽跨并对冲 delta），注意 gamma/theta 权衡与尾部风险。"

## 注意事项

- **让工具算、你来解读**：定价与希腊字母全部来自 `option_value`，不要手推 Black-Scholes 数字；你的价值在比较与建议。
- **期限要对齐**：RV 窗口必须匹配 IV 期限（20↔1M、60↔3M、90↔6M），错配会得出假信号。
- **FX 在 delta 空间**：`fx_vol_surface` 按 delta 而非行权价报价，读 RR/BF 时按 delta 解读，勿与股票曲面混淆。
- **输入格式严格**：股票/指数用 RIC（`.SPX@RIC`）或 RICROOT（`ES@RICROOT`），外汇用货币对（`EURUSD`），格式错会取不到曲面。
- **合规**：仅做波动率分析与策略说明，不构成对个人的投资/下单建议；高杠杆策略需标注尾部与流动性风险。

## 互见

- related：`equity-earnings-update-report` —— 同为卖方/资本市场分析，财报事件常驱动 vol 跳变。
- related：`financial-analysis-toolkit` —— 基本面估值与本技能的衍生品视角互补。
- combines_with：`data-storyteller` —— 把曲面、希腊字母与 IV-RV 对比讲成可决策的叙事。
- combines_with：`board-deck-builder` —— 将 vol 评估纳入投委会/风险材料。

---
采编自 anthropics/financial-services（Apache-2.0）。
