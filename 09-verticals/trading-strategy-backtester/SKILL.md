---
name: trading-strategy-backtester
title: 交易策略回测框架
description: 当为交易/量化策略搭建回测系统、验证策略表现、评估策略稳健性时使用；做出规避前视/幸存者/过拟合偏差、计入交易成本、含步进式walk-forward与蒙特卡洛的可执行回测代码与绩效指标（夏普/索提诺/卡玛/最大回撤）；不适用于实盘下单执行、行情数据采集或券商API对接；触发词：回测、backtest、回测框架、交易策略、quant、walk-forward、步进优化、前视偏差、look-ahead、夏普比率、最大回撤、蒙特卡洛
domain: 领域/fintech
triggers: [回测, backtest, 回测框架, 交易策略, quant, walk-forward, 步进优化, 前视偏差, look-ahead, 夏普比率, 最大回撤, 蒙特卡洛]
tags: [fintech, backtesting, trading-strategy, quant, walk-forward, monte-carlo, python, pandas]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, pandas, numpy]
requires: []
related: [backtesting-frameworks, portfolio-risk-metrics, alpha-vantage-market-data, portfolio-rebalancer]
combines_with: [alpha-vantage-market-data, portfolio-risk-metrics, backtesting-frameworks]
license: MIT
source: wshobson/agents
source_license: MIT
---
## 何时使用

适用：
- 为交易/量化策略开发回测，验证历史表现并估计夏普、回撤等指标。
- 搭建可复用的回测基础设施（事件驱动或向量化）。
- 用步进式（walk-forward）分析做参数优化、避免过拟合。
- 用蒙特卡洛/自助重采样评估策略稳健性与最坏回撤分布。
- 横向比较多个策略备选方案。

不该用（负边界）：
- 实盘下单、订单路由、券商/交易所 API 对接（这是执行系统，不是回测）。
- 行情/基本面数据的采集与清洗（先用数据管道准备 point-in-time 数据，再进本技能）。
- 仅需单点指标计算而无需回放历史的场景。

## 步骤

1. 准备 point-in-time 数据：OHLCV，带 DatetimeIndex；务必使用「时点真实可得」的数据，纳入已退市标的以规避幸存者偏差。
2. 划分数据集：训练集（开发与优化）→ 验证集（选参，不许偷看）→ 测试集（最终评估，全程封存）。
3. 选回测引擎：简单信号用向量化引擎（快）；含订单类型、滑点、持仓与撮合逻辑用事件驱动引擎（真实）。
4. 信号必须前移一格（`signals.shift(1)`）以杜绝前视偏差；订单在「下一根 bar」成交。
5. 计入交易成本：手续费 + 滑点（按 bps 或比例），在每次仓位变动时扣减。
6. 用 `WalkForwardOptimizer` 做步进优化（rolling 或 anchored 窗口），每个测试段用训练段选出的最优参数。
7. 用 `MonteCarloAnalyzer` 自助重采样收益，估计最大回撤分布、持有期亏损概率与收益置信区间。
8. 用 `calculate_metrics` 输出夏普/索提诺/卡玛/最大回撤/胜率/盈亏比，仅在封存的测试集上读最终结果。

## 指令

- 始终用时点数据，绝不在含未来信息的字段上生成信号。
- 信号一律 `shift(1)`；equity 用收盘价、成交用下一根 open（事件驱动）。
- 成本模型务必现实：示例默认 commission=0.1%、slippage=0.05%（向量化），或 slippage_bps=10、commission_per_share=0.01（事件驱动）。
- 步进优化优于单次 train/test；参数网格要小，限制自由度防过拟合。
- 年化因子按日频 252；夏普扣无风险利率（默认 rf=0.02）。
- 慎用复权数据，理解其调整含义；不要忽视容量与市场冲击。

## 示例

向量化回测（信号已前移，含成本）：

```python
class VectorizedBacktester:
    def __init__(self, initial_capital=100000, commission=0.001, slippage=0.0005):
        self.initial_capital, self.commission, self.slippage = initial_capital, commission, slippage

    def run(self, prices, signal_func):
        signals = signal_func(prices).shift(1).fillna(0)        # 前移避免前视
        returns = prices["close"].pct_change()
        trading_costs = signals.diff().abs() * (self.commission + self.slippage)
        strategy_returns = signals * returns - trading_costs
        equity = (1 + strategy_returns).cumprod() * self.initial_capital
        return {"equity": equity, "returns": strategy_returns,
                "metrics": self._calculate_metrics(strategy_returns, equity)}

def momentum_signal(prices, lookback=20):                       # 价 > SMA 做多，否则空仓
    sma = prices["close"].rolling(lookback).mean()
    return (prices["close"] > sma).astype(int)
```

步进窗口生成（rolling / anchored）：

```python
while start + self.train_period + self.test_period <= n:
    train_start = 0 if self.anchored else start
    train_end = start + self.train_period
    test_end = min(train_end + self.test_period, n)
    splits.append((data.iloc[train_start:train_end], data.iloc[train_end:test_end]))
    start += step
```

蒙特卡洛自助重采样估最坏回撤：

```python
sims = np.random.choice(returns.values, size=(n_simulations, n_periods), replace=True)
equity = (1 + sims).cumprod(axis=1)
dd = (equity - np.maximum.accumulate(equity, axis=1)) / np.maximum.accumulate(equity, axis=1)
max_dd = dd.min(axis=1)  # 取分位数即得最坏 5% 回撤等
```

关键绩效指标：

```python
sharpe  = (annual_return - rf_rate) / annual_vol          # 风险调整后收益
sortino = (annual_return - rf_rate) / downside_vol        # 仅下行波动
calmar  = annual_return / abs(max_drawdown)               # 收益/最大回撤
```

事件驱动引擎要点：`Order/Fill/Position/Portfolio` 数据类 + `Strategy.on_bar()` 生成订单、`ExecutionModel.execute()` 撮合并施加滑点与手续费，主循环按 bar 先撮合上一根挂单、再算 equity、再生成下一根订单。

## 注意事项

- 回测偏差与对策：前视→用时点数据；幸存者→纳入退市标的；过拟合→样本外测试 + 限参；选择性→预先登记策略；交易成本→现实成本模型。
- Do：用时点数据、计入成本、留样本外、做 walk-forward、做蒙特卡洛理解不确定性。
- Don't：在全历史上优化、忽视幸存者偏差、滥用复权数据、忽视容量与市场冲击、过度堆参数。
- 钱与价用 `Decimal` 防浮点误差（事件驱动引擎）；equity 计算只对有持仓且有报价的标的累加。

## 互见

- rag-pipeline-builder：构建上游 point-in-time 数据管道时参考。
- first-principles-thinking：评估策略逻辑是否站得住、识别过拟合假象。
- code-reviewer：回测代码上线前审查前视偏差与成本计入等隐患。

---
本条采编自 wshobson/agents（MIT 许可）。
