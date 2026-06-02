---
name: portfolio-risk-metrics
title: 投资组合风险指标计算
description: 当需要度量组合风险、设置风险限额或搭建风险监控/报表时使用；用 Python(numpy/pandas/scipy) 从收益率序列计算 VaR、CVaR、夏普、索提诺、卡玛、最大回撤、Beta、风险平价等并产出风险摘要；不适用于价格抓取、回测撮合、择时/选股信号生成与因子归因建模；触发词：风险指标、VaR、CVaR、夏普比率、Sortino、最大回撤、risk metrics、drawdown、风险平价
domain: 领域/fintech
triggers: [风险指标, VaR, CVaR, 夏普比率, Sortino, 最大回撤, risk metrics, drawdown, 风险平价]
tags: [fintech, risk, var, portfolio, quant, python]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, numpy, pandas, scipy]
requires: []
related: [portfolio-rebalancer, backtesting-frameworks, trading-strategy-backtester, alpha-vantage-market-data]
combines_with: [alpha-vantage-market-data, backtesting-frameworks, portfolio-rebalancer]
license: MIT
source: wshobson/agents
source_license: MIT
---
## 何时使用

- 已有一段周期收益率序列（单资产或多资产组合），需要量化其风险：波动率、VaR/CVaR、回撤、风险调整收益（夏普/索提诺/卡玛/Omega）。
- 设风险限额、做仓位上限、搭建风险看板/日度风控报表、做压力测试与监管报送。
- 评估组合层面的风险分解（边际/成分风险贡献、风险平价权重、分散化比率、压力期相关性）。
- 触发词：风险指标、VaR、CVaR、夏普、索提诺、最大回撤、risk metrics、drawdown、风险平价。

不该用（负边界）：

- 抓取/清洗行情或价格数据 → 先用数据层技能拿到干净的收益率序列再进入本技能。
- 回测引擎、订单撮合、交易信号/择时选股 → 本技能只算风险，不产生买卖决策。
- 收益归因到因子、因子暴露建模、组合优化求最优前沿（本技能只含风险平价这一类风险预算求解）。
- 期权希腊值、信用/利率久期等衍生品专属风险（本技能面向收益率序列的统计风险）。

## 步骤 / 指令

输入约定：`returns` 为周期收益率（如日收益）的 `pd.Series`（单资产）或 `pd.DataFrame`（列=资产）；年化因子默认 `ann_factor=252`，按数据频率调整（周用 52、月用 12）。

1. 准备：对齐时间索引、剔除/标记缺失，确认收益率是简单收益还是对数收益（混用会失真）。
2. 选指标维度（四类）：波动类（Std、Beta）、尾部类（VaR、CVaR）、回撤类（Max DD、Calmar）、风险调整类（Sharpe、Sortino）。单一指标不足以刻画风险，至少跨两类。
3. 单资产指标：实例化 `RiskMetrics(returns, rf_rate)`，调用 `summary()` 一次性产出年化收益/波动、VaR95/99、CVaR95、最大回撤及持续期、夏普/索提诺/卡玛/Omega、偏度/峰度。
4. VaR 选法：历史法（`var_historical`，无分布假设）、参数法（`var_parametric`，假设正态、易低估尾部）、Cornish-Fisher（`var_cornish_fisher`，用偏度/峰度修正非正态）。优先历史法或 CF，并补 CVaR。
5. 组合层面：`PortfolioRisk(returns_df, weights)` 算组合波动、边际/成分风险贡献、风险平价权重、分散化比率、压力期条件相关性。
6. 时变分析：`RollingRiskMetrics(returns, window)` 算滚动波动/夏普/VaR/回撤/Beta 与波动率分位区间，捕捉风险随时间漂移与制度切换。
7. 压力测试：`StressTester` 跑历史危机情景（2008/2020/2022 等）、假设性冲击、蒙特卡洛（抬高波动）三类，输出预期损失、VaR、最坏情形、超阈值概率。
8. 落地为限额/报表：把关键指标对接阈值告警（如 VaR 超限、回撤触线），记录所用分布假设、回看窗口、年化因子等参数以便复现。

## 示例

核心指标（采编自源，保留关键实现）：

```python
import numpy as np, pandas as pd
from scipy import stats

class RiskMetrics:
    def __init__(self, returns: pd.Series, rf_rate: float = 0.02):
        self.returns = returns
        self.rf_rate = rf_rate
        self.ann_factor = 252  # 每年交易日；按频率调整

    def volatility(self, annualized=True):
        v = self.returns.std()
        return v * np.sqrt(self.ann_factor) if annualized else v

    def var_historical(self, confidence=0.95):       # 历史法 VaR
        return -np.percentile(self.returns, (1 - confidence) * 100)

    def var_cornish_fisher(self, confidence=0.95):   # 非正态修正 VaR
        z = stats.norm.ppf(confidence)
        s, k = stats.skew(self.returns), stats.kurtosis(self.returns)
        z_cf = (z + (z**2 - 1)*s/6 + (z**3 - 3*z)*k/24 - (2*z**3 - 5*z)*s**2/36)
        return -(self.returns.mean() + z_cf * self.returns.std())

    def cvar(self, confidence=0.95):                 # CVaR / 预期损失
        var = self.var_historical(confidence)
        return -self.returns[self.returns <= -var].mean()

    def drawdowns(self):
        cum = (1 + self.returns).cumprod()
        return (cum - cum.cummax()) / cum.cummax()

    def max_drawdown(self):
        return self.drawdowns().min()

    def sharpe_ratio(self):
        excess = self.returns.mean() * self.ann_factor - self.rf_rate
        vol = self.volatility(True)
        return excess / vol if vol > 0 else 0

    def sortino_ratio(self):                         # 用下行波动
        excess = self.returns.mean() * self.ann_factor - self.rf_rate
        downside = self.returns[self.returns < 0].std() * np.sqrt(self.ann_factor)
        return excess / downside if downside > 0 else 0

# 日常用法
m = RiskMetrics(returns)
print(f"Sharpe: {m.sharpe_ratio():.2f}")
print(f"Max DD: {m.max_drawdown():.2%}")
print(f"VaR 95%: {m.var_historical(0.95):.2%}  CVaR 95%: {m.cvar(0.95):.2%}")
```

风险平价权重（组合层面，SLSQP 求等风险贡献）：

```python
from scipy.optimize import minimize
def risk_parity_weights(returns_df, ann=252):
    n = returns_df.shape[1]; cov = returns_df.cov() * ann
    def obj(w):
        pv = np.sqrt(w @ cov @ w)
        rc = w * ((cov @ w) / pv)          # 各资产风险贡献
        return np.sum((rc - pv / n) ** 2)  # 趋向等风险贡献
    res = minimize(obj, np.repeat(1/n, n), method="SLSQP",
                   bounds=[(0.01, 1.0)] * n,
                   constraints=[{"type": "eq", "fun": lambda w: w.sum() - 1}])
    return pd.Series(res.x, index=returns_df.columns)
```

委托提示词（给 Agent 调用时）：
> 给定日收益率序列，计算并输出风险摘要：年化波动、历史/CF 法 VaR95 与 VaR99、CVaR95、最大回撤及持续期、夏普/索提诺/卡玛/Omega、偏度峰度；VaR 不要只给参数法，需附 CVaR；再给出 63 日滚动夏普与滚动 VaR。明确标注所用年化因子、回看窗口与分布假设。

## 注意事项

- 用多指标交叉验证：没有单一指标能覆盖全部风险，至少跨波动/尾部/回撤/风险调整两类以上。
- 别只用 VaR：VaR 低估尾部损失，务必同时给 CVaR（预期损失）。
- 别假设正态：收益普遍肥尾，参数法 VaR 易失真，优先历史法或 Cornish-Fisher 修正。
- 别忽视相关性：压力期相关性会上升，用条件相关性（压力分位下）评估，而非平稳期相关。
- 别用过短回看窗口：会错过制度切换；同时滚动分析以捕捉风险随时间变化。
- 年化因子要匹配频率（日 252 / 周 52 / 月 12），错配会使夏普、年化波动整体偏差。
- 索提诺/卡玛对样本敏感：下行样本或回撤为 0 时需返回 0/inf 的兜底，避免除零。
- 记录假设：分布、回看窗口、置信水平、无风险利率、是否扣交易成本，便于复现与审计。

## 互见

- related：`csv-data-cleaner`（清洗价格/收益率原始表，去重补缺与类型规整后再进入本技能）。
- related：`sql-query-builder`（从数据库拉取价格/收益率序列作为输入）。

本条采编自 wshobson/agents（MIT 许可证）。
