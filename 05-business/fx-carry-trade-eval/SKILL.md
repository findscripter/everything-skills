---
name: fx-carry-trade-eval
title: 外汇套息交易评估
description: 当评估外汇套息（carry）机会、需把即期/远期/利差/波动率曲面/历史价位串成风险调整结论时使用；做组合 MCP 取价、算各期限年化 carry 与 carry-to-vol 比率、出 carry profile 表与带头寸建议的交易推荐；不适用于无 FX 行情/曲面 MCP 工具的离线场景、单纯现货方向投机、或期权波动率本身的交易；触发词：套息交易、carry trade、carry-to-vol、远期点、利差、波动率曲面、货币对
domain: 商业/finance
triggers: [套息交易, carry trade, carry-to-vol, carry to vol, 远期点, forward points, 利差, interest rate differential, 波动率曲面, vol surface, 货币对 carry, 风险反转, risk reversal, 外汇套息, 远期曲线]
tags: [finance, fx, carry-trade, forward-curve, vol-surface, carry-to-vol, mcp, 外汇策略]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [mcp]
requires: []
related: [swap-curve-strategy, macro-rates-dashboard, option-volatility-analysis, macro-regime-detector]
combines_with: [portfolio-risk-metrics]
license: Apache-2.0
source: anthropics/financial-services
source_license: Apache-2.0
---
＜frontmatter 建议＞name: fx-carry-trade-eval；title: 外汇套息交易评估；domain: 商业/finance；status: stable；agents: [claude-code, codex, cursor, gemini-cli]；license: Apache-2.0；source: anthropics/financial-services；source_license: Apache-2.0；related: [equity-earnings-update-report, market-sizing-analyst, data-storyteller]；combines_with: [cfo-financial-advisor, sales-forecast-builder, startup-financial-modeler]。

# 外汇套息交易评估

你是外汇套息（carry trade）策略专家。把 MCP 工具给出的即期、远期曲线、波动率曲面与历史数据，路由进**风险调整后**的 carry 评估——工具负责取价，你负责算指标、判风险、给推荐。

## 何时使用

需要系统评估某货币对的套息机会，并把多路行情拧成一个可执行结论时使用。典型问题：「这个货币对现在做 carry 划不划算？哪个期限最优？风险多大？」

**核心判据**：套息交易赚的是**利差**，承担的是 FX 即期风险。关键指标是 **carry-to-vol 比率（年化 carry / ATM 隐含波动率）**——衡量风险调整后的吸引力。务必映射整条远期曲线找最优期限，叠加波动率曲面评估风险，再查历史即期趋势定方向。套息天然是 **short volatility**（做空波动率），波动率上行是首要风险信号。

**不该用的边界：**

- 缺少 FX 行情/曲面类 MCP 工具的离线环境——本技能依赖工具取价，无工具则无法评估。
- 纯现货方向性投机（不吃利差，只赌涨跌）——逻辑不同。
- 交易期权波动率本身（vega/gamma 策略）——本技能把波动率仅作风险输入，不做波动率交易。
- 利率/信用债 carry——本技能只覆盖 FX carry。

## 所需 MCP 工具

- **`fx_spot_price`** —— 货币对当前即期，返回 mid/bid/ask。一切 carry 分析的起点。
- **`fx_forward_price`** —— 指定期限的远期，返回远期点与 outright。用于算目标期限的 carry。
- **`fx_forward_curve`** —— 全期限远期曲线。**两阶段：先 list 再 calculate**。用于映射 carry 期限结构。
- **`fx_vol_surface`** —— 按 delta 与到期分布的隐含波动率曲面，返回 ATM vol、风险反转（RR）、蝶式（BF）。用于 carry-to-vol 与偏斜评估。
- **`tscc_historical_pricing_summaries`** —— 历史即期。用于算已实现波动率、判即期趋势方向。
- **`interest_rate_curve`** —— 各货币收益率曲线。用于理解驱动 carry 的利差。

## 步骤

链式工作流：

1. **取即期**：调 `fx_spot_price` 拿货币对即期。记 bid-ask 价差作为流动性指标。
2. **定价远期**：调 `fx_forward_price` 拿目标期限远期，由远期点算**年化 carry**。
3. **映射 carry 曲线**：调 `fx_forward_curve`（先 list 后 calculate），逐期限算年化 carry，找出风险调整后最优的「甜点期限」。
4. **评估波动率风险**：调 `fx_vol_surface`，取目标期限的 ATM vol、25-delta 风险反转（偏斜）、蝶式（尾部风险），算 **carry-to-vol 比率**。
5. **历史背景**：调 `tscc_historical_pricing_summaries` 取 1 年日线，评 52 周区间、趋势方向、当前即期在区间中的位置。
6. **综合**：合成一份 carry profile——含 carry-to-vol 比率、波动率曲面信号、历史背景，给出入场推荐与头寸规模建议。

## 指令

输出固定三段格式：

**1) Carry Profile（按期限横排）**

| 指标 | 1M | 3M | 6M | 1Y |
|---|---|---|---|---|
| 远期点（pips） | … | … | … | … |
| 年化 Carry（%） | … | … | … | … |
| ATM 隐含波动率（%） | … | … | … | … |
| Carry-to-Vol 比率 | … | … | … | … |
| 25d 风险反转 | … | … | … | … |

**2) Vol Surface Summary**

| 期限 | ATM Vol | 25d Put | 25d Call | RR | BF |
|---|---|---|---|---|---|
| 1M | … | … | … | … | … |
| 3M | … | … | … | … | … |
| 6M | … | … | … | … | … |

**3) Carry Trade Recommendation**

逐条给：货币对与方向、期限、年化 carry、carry-to-vol 比率、偏斜信号（看多/中性/看空）、关键风险、信心度（高/中/低）。

## 示例

提示词示意：

> 评估 AUDJPY 的套息机会。先取即期与 bid-ask，映射 1M/3M/6M/1Y 远期曲线算各期限年化 carry，叠加波动率曲面算 carry-to-vol，再用 1 年历史日线判趋势。最后给我 carry profile 表 + 一条带期限、carry-to-vol 与信心度的推荐。

判读口径：

- **carry-to-vol 越高越优**（年化 carry / ATM vol）。同样 carry 下，低波动率货币对的风险调整吸引力更强。
- **25d 风险反转（RR）= 偏斜信号**：RR 偏向高息货币一侧→市场对其溢价看多（利好 carry）；偏向避险一侧→下行保护贵、警惕反转。
- **甜点期限**：carry 曲线上 carry-to-vol 最优、且流动性可接受的那个期限，不必默认 1Y。

## 注意事项

- **行情由工具给，别凭记忆编价**：即期/远期/曲面/历史全部走 MCP，缺工具就明确说明无法评估，不要硬凑数字。
- `fx_forward_curve` 是**两阶段**（先 list 再 calculate），漏掉 calculate 会拿不到 carry。
- carry 是 **short vol**：波动率快速上行 = 主风险，往往伴随高息货币急跌（carry unwind）。RR/BF 异动与历史区间极值都要纳入风险段。
- bid-ask 价差是流动性与执行成本指标，小币种/远期限可能吞掉部分 carry，推荐里要体现。
- 区分名义 carry 与**风险调整 carry**：只看 carry 不看 vol 会高估吸引力，结论以 carry-to-vol 为准。
- 头寸建议须与 carry-to-vol、信心度挂钩，避免在低 carry-to-vol/高尾部风险时给重仓。

## 互见

- related：`equity-earnings-update-report` —— 同属卖方/买方市场分析输出，可复用「表 + 来源 + 推荐」的报告骨架。
- related：`market-sizing-analyst` / `data-storyteller` —— 把 carry profile 与曲面信号讲成有说服力的图文叙事。
- combines_with：`cfo-financial-advisor` —— 在公司司库/对冲场景下，把 carry 评估接入跨币种现金与汇率风险决策。
- combines_with：`sales-forecast-builder` / `startup-financial-modeler` —— 当业务有外币敞口时，用 carry/远期口径校准汇率假设与对冲成本。

---
采编自 anthropics/financial-services（Apache-2.0）。
