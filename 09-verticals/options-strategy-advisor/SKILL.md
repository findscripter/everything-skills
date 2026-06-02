---
name: options-strategy-advisor
title: 期权策略分析与模拟
description: 当用户要分析/对比期权策略、模拟盈亏、算希腊值或做财报期策略时使用；用 Black-Scholes 给期权理论定价、算 Delta/Gamma/Theta/Vega、模拟到期损益与盈亏图、给仓位与离场规则；不适用于实时报价/真实下单执行、个性化投资建议或美式期权精确定价；触发词：期权策略、备兑开仓、保护性认沽、价差、铁鹰、跨式、希腊值、IV crush。
domain: 领域/fintech
triggers: [期权策略, 备兑开仓, covered call, 保护性认沽, protective put, 价差, spread, 铁鹰, iron condor, 跨式, straddle, 勒式, strangle, 希腊值, Greeks, Black-Scholes, 隐含波动率, IV crush, 财报期策略, 仓位管理]
tags: [fintech, options, derivatives, black-scholes, greeks, risk, python]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, numpy, scipy]
requires: []
related: [portfolio-risk-metrics, trade-position-sizer, earnings-trade-analyzer, backtesting-frameworks]
combines_with: [portfolio-risk-metrics, octagon-stock-quote, trade-position-sizer]
license: MIT
source: tradermonty/claude-trading-skills
source_license: MIT
---
## 何时使用

- 解释/对比期权策略（备兑、保护性认沽、各类价差、铁鹰、跨式/勒式、日历价差等）的原理与风险收益。
- 模拟某笔具体策略的到期损益：最大盈利、最大亏损、盈亏平衡点、盈亏图（ASCII）。
- 用 Black-Scholes 给各腿理论定价并汇总持仓希腊值（Delta/Gamma/Theta/Vega/Rho），评估方向/时间/波动暴露。
- 财报期策略评估：估算隐含波动（IV）与隐含波幅、警示 IV crush，权衡买跨式 vs 卖铁鹰。
- 仓位规模与离场规则建议（按账户风险预算与策略类型）。

不该用的边界：

- 需要实时报价、真实期权链或代客下单执行 → 本技能只做理论定价与教学模拟，不接券商、不下单。
- 期待个性化投资/择时建议或收益承诺 → 仅提供框架性分析，理论价 ≈ 中间价，实盘有买卖价差与滑点。
- 需要美式期权精确定价（提前行权、ITM 认沽的早行权）→ B-S 为欧式定价，会低估美式价值，仅作近似并提示。
- 仅要一句话报价或纯行情数据 → 无需上整套策略框架。

## 步骤 / 指令

```
1. 收集输入
   必填：标的、策略类型、各腿行权价、到期天数(DTE)、合约数
   可选：IV(无则用历史波动率 HV)、无风险利率(默认约 3 月期 T-bill，~5.3%/2025)、股息率 q
2. 波动率
   有 IV 用 IV；无则取 90 日历史价算 HV = log收益.std() * sqrt(252)，并提示"建议改用市场 IV"
3. 各腿定价(Black-Scholes，欧式)
   d1 = [ln(S/K) + (r - q + σ²/2)·T] / (σ·√T)；d2 = d1 - σ·√T
   Call = S·e^(-qT)·N(d1) - K·e^(-rT)·N(d2)
   Put  = K·e^(-rT)·N(-d2) - S·e^(-qT)·N(-d1)
   提示：理论价≈中间价，实盘含买卖价差；美式期权可能被低估
4. 希腊值
   逐腿算 Δ/Γ/Θ/Vega/Rho，再按 (+1 多 / -1 空) × 合约数 求和得持仓希腊值
5. 模拟损益
   生成到期价区间(如当前价 ±30%，100 点)，每点按内在价值算各腿 P/L 求和
   提取：最大盈利 / 最大亏损 / 盈亏平衡点 / 大致盈利概率
6. 出盈亏图 + 策略专属解读(用途/分配风险/离场)
7. 财报期(若涉及)：估隐含波幅 √(DTE/365)·IV·S，对比盈亏平衡所需波幅，警示 IV crush
8. 仓位与离场：按账户风险预算定合约数，给止盈/止损/调整规则
```

希腊值速查：Delta=方向暴露（每涨 1 美元的损益）；Gamma=Delta 的加速度；Theta=每日时间损耗；Vega=IV 每变 1% 的损益；Rho=利率每变 1% 的损益。

策略 → 何时用（精简）：备兑开仓=有股、中性偏多、收权利金封顶上行；保护性认沽=有股、怕短期下跌、买保险保留上行；牛市看涨价差=温和看多、定风险；铁鹰=预期区间震荡、高 IV 卖贵期权；买跨式/勒式=预期大幅波动但方向不明（财报前小心 IV crush）。

## 示例

定价与希腊值（保留源核心实现）：

```python
import numpy as np
from scipy.stats import norm

def _d(S, K, T, r, sigma, q=0):
    d1 = (np.log(S/K) + (r - q + 0.5*sigma**2)*T) / (sigma*np.sqrt(T))
    return d1, d1 - sigma*np.sqrt(T)

def bs_price(S, K, T, r, sigma, q=0, kind="call"):
    d1, d2 = _d(S, K, T, r, sigma, q)
    if kind == "call":
        return S*np.exp(-q*T)*norm.cdf(d1) - K*np.exp(-r*T)*norm.cdf(d2)
    return K*np.exp(-r*T)*norm.cdf(-d2) - S*np.exp(-q*T)*norm.cdf(-d1)

def greeks(S, K, T, r, sigma, q=0, kind="call"):
    d1, d2 = _d(S, K, T, r, sigma, q)
    sign = 1 if kind == "call" else -1
    delta = np.exp(-q*T) * (norm.cdf(d1) if kind=="call" else norm.cdf(d1)-1)
    gamma = np.exp(-q*T) * norm.pdf(d1) / (S*sigma*np.sqrt(T))
    theta = (-S*norm.pdf(d1)*sigma*np.exp(-q*T)/(2*np.sqrt(T))
             - sign*r*K*np.exp(-r*T)*norm.cdf(sign*d2)
             + sign*q*S*norm.cdf(sign*d1)*np.exp(-q*T)) / 365   # 每日
    vega = S*np.exp(-q*T)*norm.pdf(d1)*np.sqrt(T) / 100          # 每 1% IV
    rho  = sign*K*T*np.exp(-r*T)*norm.cdf(sign*d2) / 100         # 每 1% 利率
    return dict(delta=delta, gamma=gamma, theta=theta, vega=vega, rho=rho)
```

到期损益模拟（多腿求和，每张 ×100）：

```python
def pnl_at(legs, S_T, num_contracts=1):
    pnl = 0.0
    for leg in legs:            # leg: dict(kind, strike, premium, position)
        if leg["kind"] == "call":
            iv = max(0, S_T - leg["strike"])
        else:
            iv = max(0, leg["strike"] - S_T)
        if leg["position"] == "long":
            pnl += (iv - leg["premium"]) * 100
        else:                   # short
            pnl += (leg["premium"] - iv) * 100
    return pnl * num_contracts

S = 180
prices = np.linspace(S*0.7, S*1.3, 100)
# 牛市看涨价差 180/185：买 180call、卖 185call
legs = [dict(kind="call", strike=180, premium=5.0, position="long"),
        dict(kind="call", strike=185, premium=2.5, position="short")]
pnls = [pnl_at(legs, p) for p in prices]
# 最大盈利=max(pnls)，最大亏损=min(pnls)，盈亏平衡=pnl 变号处的价位
```

输出示例（牛市看涨价差 180/185，AAPL，30 DTE，10 张）：净付出 $2.50/价差（$2,500）；最大盈利 +$2,500（≥185）；最大亏损 -$2,500（≤180）；盈亏平衡 $182.50；风险报酬 1:1。

财报期 IV crush 警示（买跨式）：财报前 IV 40% → 财报后回落到 25%，即便股价不动，-15 个点的 IV 也可能造成约 -$750 亏损。决策：隐含波幅 √(DTE/365)·IV·S，仅当你预期波动「大于隐含波幅」才买长权利金，否则更宜卖方策略吃 IV crush。

仓位规模（账户 $50,000、单笔风险 2% = $1,000）：铁鹰单组最大亏损 $300 → 最多 3 组；牛市看涨价差付出 $250 → 最多 4 组。

离场规则（按策略）：价差类止盈 50% 最大盈利、止损 2× 付出、21 DTE 前平/滚动避 Gamma 风险；铁鹰止盈 50% 权利金、单边被击穿亏 2× 权利金即调整（把被测一边向后滚）；备兑止盈 50–75%，临近到期 7–10 DTE 滚动避被指派；跨式财报后次日了结。

## 注意事项

- 这是基于 Black-Scholes 的理论分析，不是投资建议；不承诺收益，实盘以券商真实报价为准。
- B-S 假设：欧式、恒定波动率、无交易成本、连续交易；现实中 IV 会变、有买卖价差、美式可提前行权（尤其 ITM 认沽）。
- IV vs HV：IV>HV → 期权偏贵（考虑卖方）；IV<HV → 偏便宜（考虑买方）；可用 IV 在 1 年 HV 序列中的分位指导（>75 卖权利金，<25 买期权）。
- 数值健壮：检查行权价与股价输入，深度实值期权易有数值问题；希腊值异常先核对 T、σ、r 的年化/日化口径是否一致。
- 财报前最大风险是 IV crush，长权利金策略尤甚；卖方策略反受益但要防跳空到区间外。
- 卖方/裸卖策略（如卖跨式）下行/上行风险可能不封顶，务必标注并配止损（如 2× 权利金）。
- 金额、内在价值计算建议用 Decimal 以保精度，避免浮点误差累积。

## 互见

- related：`portfolio-risk-metrics`（把组合层面的 VaR/回撤/希腊暴露并入统一风控看板）。
- related：`backtesting-frameworks`、`trading-strategy-backtester`（对含期权的策略做历史回测验证）。
- combines_with：`alpha-vantage-market-data`（取标的现价、历史价算 HV、股息与财报日作为本技能输入）。

---

采编自 tradermonty/claude-trading-skills（MIT 许可）：options-strategy-advisor。本条为适配重写而非逐字翻译，保留其 Black-Scholes 定价/希腊值公式与实现、到期损益模拟逻辑、盈亏图思路、IV crush 警示、隐含波幅与仓位规模算法、各策略离场规则等关键约束。
