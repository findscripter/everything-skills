---
name: pair-trade-screener
title: 配对交易统计套利筛选
description: 当需要在板块内筛选配对交易/统计套利机会、构建市场中性策略或分析价差均值回归时使用；做出协整检验(ADF)、相关性与对冲比、价差z-score及进出场/仓位建议并产出可执行筛选脚本与报告；不适用于实盘下单执行、单边择时选股、期权/衍生品定价与行情数据采集清洗；触发词：配对交易、pair trading、统计套利、协整、cointegration、市场中性、均值回归、z-score、价差
domain: 领域/fintech
triggers: [配对交易, pair trading, 统计套利, 协整, cointegration, 市场中性, 均值回归, z-score, 价差, ADF检验]
tags: [fintech, pair-trading, statistical-arbitrage, cointegration, market-neutral, mean-reversion, quant, python, statsmodels]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, pandas, numpy, scipy, statsmodels]
requires: []
related: [strategy-backtest-expert, trading-strategy-backtester, backtesting-frameworks, portfolio-risk-metrics]
combines_with: [trade-position-sizer, trading-strategy-backtester]
license: MIT
source: tradermonty/claude-trading-skills
source_license: MIT
---
## 何时使用

适用：
- 在某板块（科技/金融/医疗等）或自定义标的列表内，筛选高相关且协整的配对，构建市场中性（无方向 beta）策略。
- 分析单个配对的价差行为：算相关性、对冲比 beta、协整 p 值、半衰期、当前 z-score，给进出场与仓位建议。
- 寻找均值回归交易机会、相对价值套利、对冲板块敞口。

不该用（负边界）：
- 实盘下单、订单路由、券商/交易所 API 对接（本技能只出信号与筛选，不做执行）。
- 单边择时/选股、趋势跟踪等带方向性的策略（配对交易刻意剥离市场方向）。
- 期权希腊值、利率/信用久期等衍生品定价（本技能面向两只股票价差的统计关系）。
- 行情/基本面数据的抓取与清洗（先用数据层技能拿到复权后的干净日收盘价再进入本技能）。

## 步骤

1. 定义配对全集：按板块筛选（推荐）、自定义 ticker 列表，或细分行业（如「Software」「Regional Banks」）。过滤条件：市值 ≥ $2B、日均量 ≥ 100 万股、活跃未退市、尽量同交易所。
2. 取历史价格：2 年（≥ 252 交易日）日收盘价，复权（拆股/分红），剔除缺失 >10% 的标的，小缺口前向填充，对齐各标的日期范围。
3. 算相关性与 beta：对每对算 Pearson 相关系数 ρ，保留 ρ ≥ 0.70；用 90 日滚动相关检查稳定性；对冲比 `beta = Cov(A,B) / Var(B)`。剔除近 6 个月相关性较历史下滑 >0.15 的对。
4. 协整检验：构造价差 `Spread = Price_A − beta × Price_B`，对价差跑 ADF 检验；p < 0.05 即协整（拒绝单位根原假设），p < 0.01 为强协整。算半衰期 `Half-Life = −log(2) / log(mean_reversion_coef)`，<30 天快回归、30–60 中等、>60 慢。
5. 价差与 z-score：`Z = (当前价差 − 均值) / 标准差`（均值/标准差用 90 日滚动窗）。价差也可用价比 `Price_A / Price_B`（价位差异大时更直观）。
6. 进出场信号：保守阈值 |Z| ≥ 2.0、激进 |Z| ≥ 1.5。Z < −2.0 → 多 A 空 B（按对冲比 beta）；Z > +2.0 → 空 A 多 B。出场：Z 回到 0 平双腿（或 Z=±1.0 减半、Z=0 清剩余）。止损：|Z| > 3.0（疑似结构性破裂）或持有 90 天未回归则时间止损。
7. 仓位与风控（市场中性）：等额美元敞口，`多 $X 的 A，空 $X × beta 的 B`（beta=1.2 → 多 $5000 A、空 $6000 B，组合 beta≈0）。单对占组合 10–20%，同时活跃 5–8 对且彼此低相关；单对最大亏损 2–3%，组合层风险 ≤ 10%。
8. 出报告：执行摘要（分析对数/协整对数/Top5）+ 协整对表（相关、p 值、z-score、信号、半衰期）+ Top10 明细 + 文本价差图 + 风险预警。文件名 `pair_trade_analysis_[板块]_[YYYY-MM-DD].md`。

## 指令

合格配对的最低门槛（全部满足才有效）：
- ✓ 2 年期相关性 ρ ≥ 0.70
- ✓ ADF 协整 p < 0.05，价差平稳性确认
- ✓ 半衰期 < 90 天
- ✓ 近 6 个月无结构性破裂

红旗（直接剔除）：近 6 个月相关性下滑 >0.20、p > 0.05、半衰期随时间变长（回归力减弱）、重大公司事件（并购/分拆/破产风险）、流动性不足（日均量 < 50 万股）。

交易成本约束：单腿往返按 0.1% 估，单对总成本 ≈ 0.4%（双腿进出），z-score 入场阈值产生的预期收益须覆盖成本。做空前确认可借券（非难借券）、计入借券费、防轧空。双腿务必同步进出（避免单腿暴露），用限价单控滑点。

## 示例

ADF 协整检验核心（保留源实现）：

```python
from statsmodels.tsa.stattools import adfuller

# 构造价差（beta 为对冲比）
spread = price_a - (beta * price_b)

# ADF 检验
result = adfuller(spread)
adf_stat = result[0]
p_value  = result[1]

is_cointegrated = p_value < 0.05
```

筛选脚本（板块或自定义列表，需 FMP API key 或 FMP_API_KEY 环境变量）：

```bash
# 板块筛选
python scripts/find_pairs.py --sector Technology --min-correlation 0.70

# 自定义列表 + 更严相关门槛
python scripts/find_pairs.py --symbols AAPL,MSFT,GOOGL,META --min-correlation 0.75

# 全参数
python scripts/find_pairs.py \
  --sector Financials \
  --min-correlation 0.70 \
  --min-market-cap 2000000000 \
  --lookback-days 730 \
  --output pairs_analysis.json
```

单对价差分析与信号：

```bash
python scripts/analyze_spread.py --stock-a JPM --stock-b BAC \
  --lookback-days 365 --entry-zscore 2.0 --exit-zscore 0.5
```

筛选输出（JSON，每对一项）：

```json
{
  "pair": "AAPL/MSFT", "stock_a": "AAPL", "stock_b": "MSFT",
  "correlation": 0.87, "beta": 1.15,
  "cointegration_pvalue": 0.012, "adf_statistic": -3.45,
  "half_life_days": 42, "current_zscore": -2.3,
  "signal": "LONG", "strength": "Strong"
}
```

委托提示词（给 Agent 调用时）：
> 在科技板块筛选市值 >$10B 的配对：算两两相关，保留 ρ≥0.75，跑 ADF 协整（p<0.05），找 |z|>2.0 的极值对，按协整强度排序输出 Top10，并对每对给对冲比、进出场阈值与等额市场中性仓位。

## 注意事项

- 协整 ≠ 相关：相关只测短期同涨跌，协整证明长期均衡关系；只有协整对才可预期均值回归，非协整对可能永久背离。
- 避免极端波动期：VIX > 30 时相关性常崩塌，配对交易更适合震荡/区间市；危机期相关性失稳。
- 数据质量决定一切：必须复权、对齐、点对点真实可得；垃圾进垃圾出。
- 多指标交叉确认：相关、协整 p 值、半衰期、z-score 须同时满足门槛，单一指标不足为据。
- 排障：找不到协整对 → 降市值门槛 / 放宽 p 至 0.10 / 换板块（公用事业常协整好）/ 回看期延至 3 年；z-score 普遍接近 0 → 市场处均衡，降阈值至 ±1.5 或换池子；相关性突然破裂 → 查公司事件/并购，确认结构破裂则移出观察名单，观察 30 天再议。
- 依赖 FMP API key（免费档约 250 请求/日，每标的 2 年史约 2 请求）；Python 依赖 pandas、numpy、scipy、statsmodels。
- 注意常见偏差：幸存者偏差、前视偏差、过拟合（参考协整理论 Engle & Granger 1987）。

## 互见

- related：`alpha-vantage-market-data` —— 上游取价格序列作为筛选输入。
- related：`portfolio-risk-metrics` —— 对配对组合做 VaR/回撤/夏普等风险度量。
- combines_with：`trading-strategy-backtester` —— 把筛出的配对与 z-score 进出场规则交回测引擎验证、做步进式参数优化。
- combines_with：`backtesting-frameworks` —— 验证价差进出场阈值的历史稳健性。
- related：`portfolio-rebalancer` —— 管理多个配对持仓与对冲比的周期再平衡。

---
本条采编自 tradermonty/claude-trading-skills（MIT 许可证）。
