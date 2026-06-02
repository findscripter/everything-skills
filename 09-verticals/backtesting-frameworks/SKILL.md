---
name: backtesting-frameworks
title: 量化策略回测系统构建
description: 当开发交易策略回测、搭建回测框架、验证策略稳健性时使用；做事件驱动/向量化回测、走向前优化与蒙特卡洛分析，产出含成本模型的权益曲线与绩效指标；不适用于实盘下单执行、投资建议或仅需一句话绩效摘要；触发词：回测、策略验证、走向前优化、夏普比率、过拟合、滑点成本。
domain: 领域/fintech
triggers: [回测, backtest, 策略验证, 走向前优化, walk-forward, 蒙特卡洛, 夏普比率, 最大回撤, 过拟合, 前视偏差, 滑点, 交易成本, 样本外, 事件驱动回测, 向量化回测]
tags: [quant, backtesting, trading-strategy, risk, python]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, pandas, numpy]
requires: []
related: [trading-strategy-backtester, portfolio-risk-metrics, portfolio-rebalancer]
combines_with: [alpha-vantage-market-data, portfolio-risk-metrics, trading-strategy-backtester]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 开发交易策略回测，需要可信、可复现的绩效估计而非"看着不错"的曲线。
- 搭建回测基础设施：撮合/执行模型、持仓与组合记账、权益曲线、绩效指标。
- 验证策略稳健性：走向前分析（walk-forward）、样本外测试、蒙特卡洛模拟。
- 主动规避回测偏差：前视、幸存者、过拟合、选择性、交易成本。

不该用的边界：

- 需要实盘下单/执行或投资建议 → 本技能只做历史模拟，不出具买卖建议，不承诺未来收益。
- 历史数据质量未知或不完整（无 point-in-time、缺退市标的）→ 先治理数据，否则结论失真。
- 只要一句话绩效摘要 → 直接算指标即可，无需上整套框架。

## 步骤 / 指令

```
1. 定义假设与评估口径
   - 明确：策略假设、标的池(universe)、时间粒度、评估指标(如 Sharpe/Calmar/最大回撤)
   - 先定后测，避免事后挑指标(选择性偏差)
2. 建数据管道与成本模型
   - 用 point-in-time 数据(含退市标的)防前视/幸存者偏差
   - 成本模型要含手续费 + 滑点(slippage)，别用零成本
3. 选回测引擎
   - 简单信号、求快 → 向量化回测(信号必须 .shift(1) 防前视)
   - 含撮合/限价/止损/逐笔记账 → 事件驱动回测
4. 切分数据并做走向前
   - Train(开发优化) / Validation(选参，不偷看) / Test(最终评估)
   - 走向前：滚动或锚定窗口，训练窗选参 → 紧邻测试窗验证 → 滑动
5. 评估稳健性
   - 蒙特卡洛 bootstrap 重采样收益：估最大回撤分布、各持有期亏损概率、收益置信区间
6. 出报告
   - 给区间与不确定性，不把回测当未来收益保证
```

核心偏差与对策（务必逐条排查）：

| 偏差 | 含义 | 对策 |
|------|------|------|
| 前视 Look-ahead | 用到了未来信息 | point-in-time 数据；信号 shift(1) |
| 幸存者 Survivorship | 只测活下来的标的 | 纳入退市/摘牌标的 |
| 过拟合 Overfitting | 对历史曲线拟合 | 样本外测试，限制参数量 |
| 选择性 Selection | 挑好看的策略 | 预先登记假设 |
| 交易成本 | 忽略手续费滑点 | 真实成本模型 |

## 示例

向量化回测（动量策略，信号 shift 防前视，含成本与指标）：

```python
import pandas as pd, numpy as np
from typing import Callable, Dict, Any

class VectorizedBacktester:
    def __init__(self, initial_capital=100000, commission=0.001, slippage=0.0005):
        self.initial_capital, self.commission, self.slippage = initial_capital, commission, slippage

    def run(self, prices: pd.DataFrame, signal_func: Callable[[pd.DataFrame], pd.Series]) -> Dict[str, Any]:
        signals = signal_func(prices).shift(1).fillna(0)          # 关键：shift(1) 防前视
        returns = prices["close"].pct_change()
        costs = signals.diff().abs() * (self.commission + self.slippage)
        strat_ret = signals * returns - costs
        equity = (1 + strat_ret).cumprod() * self.initial_capital
        return {"equity": equity, "returns": strat_ret,
                "metrics": self._metrics(strat_ret, equity)}

    def _metrics(self, r: pd.Series, eq: pd.Series) -> Dict[str, float]:
        total = eq.iloc[-1] / self.initial_capital - 1
        ann = (1 + total) ** (252 / len(r)) - 1
        vol = r.std() * np.sqrt(252)
        dd = ((eq - eq.cummax()) / eq.cummax()).min()
        return {"total_return": total, "annual_return": ann,
                "sharpe_ratio": ann / vol if vol > 0 else 0, "max_drawdown": dd}

def momentum_signal(prices: pd.DataFrame, lookback: int = 20) -> pd.Series:
    return (prices["close"] > prices["close"].rolling(lookback).mean()).astype(int)

# results = VectorizedBacktester().run(price_data, lambda p: momentum_signal(p, 50))
```

走向前优化（训练窗选参，测试窗验证，滚动/锚定）：

```python
class WalkForwardOptimizer:
    def __init__(self, train_period, test_period, anchored=False):
        self.train_period, self.test_period, self.anchored = train_period, test_period, anchored

    def generate_splits(self, data):
        splits, n, start = [], len(data), 0
        while start + self.train_period + self.test_period <= n:
            ts = 0 if self.anchored else start
            te = start + self.train_period
            splits.append((data.iloc[ts:te], data.iloc[te:te + self.test_period]))
            start += self.test_period
        return splits
    # 对每个 split：在 train 上 grid search 选最优参 → 用最优参在 test 上评估 → 拼接 test 权益曲线
```

蒙特卡洛稳健性（bootstrap 重采样，估最大回撤分布与亏损概率）：

```python
def bootstrap_max_dd(returns: pd.Series, n_sim=1000):
    dds = []
    for _ in range(n_sim):
        sim = np.random.choice(returns.values, size=len(returns), replace=True)
        eq = (1 + sim).cumprod()
        dds.append(((eq - np.maximum.accumulate(eq)) / np.maximum.accumulate(eq)).min())
    dds = np.array(dds)
    return {"expected_max_dd": dds.mean(), "worst_5pct": np.percentile(dds, 5)}
```

绩效指标（Sharpe/Sortino/Calmar/胜率/盈亏比）：

```python
def calculate_metrics(returns: pd.Series, rf_rate=0.02) -> dict:
    af = 252
    total = (1 + returns).prod() - 1
    ann = (1 + total) ** (af / len(returns)) - 1
    vol = returns.std() * np.sqrt(af)
    sharpe = (ann - rf_rate) / vol if vol > 0 else 0
    dvol = returns[returns < 0].std() * np.sqrt(af)
    sortino = (ann - rf_rate) / dvol if dvol > 0 else 0
    eq = (1 + returns).cumprod()
    max_dd = ((eq - eq.cummax()) / eq.cummax()).min()
    calmar = ann / abs(max_dd) if max_dd != 0 else 0
    wins, losses = returns[returns > 0], returns[returns < 0]
    pf = wins.sum() / abs(losses.sum()) if losses.sum() != 0 else np.inf
    return {"annual_return": ann, "sharpe_ratio": sharpe, "sortino_ratio": sortino,
            "calmar_ratio": calmar, "max_drawdown": max_dd, "profit_factor": pf}
```

## 注意事项

- 永远不要把回测当作未来收益的保证；不提供金融/投资建议。
- 防前视是第一要务：向量化回测信号必须 `shift(1)`；事件驱动须在"下一根 K 线"成交，而非当根收盘价。
- 成本要真实：手续费 + 滑点都得建模；忽略成本的高频策略最易自欺。
- 别在全样本上优化：始终保留样本外测试集；优先走向前而非单次 train/test。
- 限制参数数量防过拟合；纳入退市标的防幸存者偏差；理解复权数据的口径再用。
- 关注容量与市场冲击：大资金下策略可能失效，回测忽略冲击成本会高估收益。
- 金额计算避免用 FLOAT（示例中用 Decimal 做撮合记账以保精度）。

## 互见

- requires：无。
- related：sql-query-builder（取数/落库回测结果时衔接）、csv-data-cleaner（原始行情清洗去重）。
- combines_with：无。

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可）：backtesting-frameworks。本条为适配重写，保留其核心偏差表、事件驱动/向量化/走向前/蒙特卡洛四类模式与绩效指标公式；参考资料：López de Prado《Advances in Financial Machine Learning》、Ernest Chan《Quantitative Trading》、Backtrader 文档。
