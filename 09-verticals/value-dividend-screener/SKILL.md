---
name: value-dividend-screener
title: 价值红利股筛选
description: 当用户要筛选高质量分红股、构建收息组合、寻找估值合理又持续增长的红利标的时使用；做两段式量化筛选（FINVIZ Elite 预筛 + FMP 基本面细分析），按价值/成长/质量复合评分排名并产出 JSON 结果与 Markdown 报告；不适用于实盘下单、行情tick采集或非美股市场；触发词：红利股筛选、股息率、分红增长、价值股、收息组合、dividend screener
domain: 领域/fintech
triggers: [红利股筛选, 股息率 3%, 分红增长 CAGR, 价值股 低PE PB, 收息组合 income portfolio, dividend screener, FINVIZ FMP, 派息可持续性 payout ratio]
tags: [fintech, 选股, 分红, 价值投资, 股息率, 基本面筛选, fmp, finviz, python]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, requests, FMP API, FINVIZ Elite API]
requires: []
related: [canslim-growth-screener, finviz-screener-builder, vcp-screener, dcf-valuation-model]
combines_with: [portfolio-rebalancer, portfolio-risk-metrics]
license: MIT
source: tradermonty/claude-trading-skills
source_license: MIT
---
# 价值红利股筛选

## 何时使用

当用户要在**美股**中寻找「价值 + 高股息 + 持续增长」三位一体的高质量分红股时使用，典型诉求：

- 「找高质量分红股 / 可持续高股息标的」
- 「筛选估值合理的价值红利机会」
- 「给我分红增长强劲的收息组合候选」
- 任何同时涉及股息率、估值倍数与基本面质量的选股请求。

核心做法：**两段式筛选**——先用 FINVIZ Elite 做廉价快速预筛，再用 FMP 对入围标的做基本面细分析，按复合评分排名。

**不该用的边界：**
- 实盘下单、券商撮合、持仓/订单管理 —— 本技能只做选股分析，不做交易执行。
- 行情 tick / 日内实时数据采集与清洗 —— 先用数据管道准备，再进本技能。
- 非美股市场（A 股、港股等）—— 筛选条件与数据源按美股设计。
- REITs 与金融股派息特征不同（高 payout、口径不同），默认应排除或单独处理。
- 高成长科技股**按设计不会入选**（受 P/E≤20、P/B≤2 过滤）。
- 输出仅供分析参考，不构成投资建议；阈值与口径需自行复核，必要时回查 SEC 文件。

## 步骤

1. **校验 API Key**。两段式需 `FMP_API_KEY` + `FINVIZ_API_KEY`；仅 FMP 模式只需前者。缺失则提示用户配置环境变量。
2. **执行筛选脚本**（见「指令」）。推荐两段式：FINVIZ 预筛把候选从数百压到 ~30，再交 FMP 细算，FMP 调用量可降 60–94%。
3. **解析结果 JSON**：读 `metadata` 与 `stocks`，关注估值、3Y 成长 CAGR、派息可持续性、财务健康、质量分与复合评分。
4. **生成 Markdown 报告**：含筛选条件、Top N 排名表、逐只详析、组合构建与监控建议。
5. **解释方法论**：说明阈值由来、复合评分如何平衡价值/成长/质量、如何区分「真红利」与「红利陷阱/价值陷阱」。
6. **答疑**：某股为何落选（卡在哪条）、如何调阈值/按行业筛、多久重跑、买几只。

## 指令

**校验 Key（Python）：**

```python
import os
fmp_api_key = os.environ.get('FMP_API_KEY')
finviz_api_key = os.environ.get('FINVIZ_API_KEY')  # 两段式必需
```

```bash
export FMP_API_KEY=your_fmp_key_here
export FINVIZ_API_KEY=your_finviz_key_here
```

> FINVIZ Elite 需订阅（约 $39.5/月或 $299.5/年），提供 CSV 导出预筛结果。FMP 免费档 250 次/天，配合两段式足够。

**两段式筛选（推荐）：**

```bash
# 默认取 Top 20
python3 scripts/screen_dividend_stocks.py --use-finviz

# 显式传 Key / 自定义数量 / 自定义输出
python3 scripts/screen_dividend_stocks.py --use-finviz \
  --fmp-api-key $FMP_API_KEY --finviz-api-key $FINVIZ_API_KEY
python3 scripts/screen_dividend_stocks.py --use-finviz --top 50
python3 scripts/screen_dividend_stocks.py --use-finviz --output /path/to/results.json
```

FINVIZ 预筛条件：中盘及以上、股息率 3%+、3Y 分红增长 5%+、3Y EPS 增长为正、P/B<2、P/E<20、3Y 营收增长为正、美国。运行约 2–3 分钟（30–50 候选）。

**仅 FMP 模式（API 用量更高，5–15 分钟）：**

```bash
python3 scripts/screen_dividend_stocks.py
python3 scripts/screen_dividend_stocks.py --fmp-api-key $FMP_API_KEY
```

**筛选阈值（三阶段，核心约束）：**

| 阶段 | 指标 | 阈值 |
|---|---|---|
| 一·价值与收益 | 股息率 | ≥ 3.5%（>8% 常不可持续） |
| | P/E (TTM) | ≤ 20 |
| | P/B | ≤ 2.0 |
| 二·成长质量 | 分红 3Y CAGR | ≥ 5%，期内无削减（允许一年持平） |
| | 营收 3Y 趋势 | 为正（允许一年回落） |
| | EPS 3Y 趋势 | 为正（允许一年回落） |
| 三·可持续与健康 | 派息率 | < 80% 健康（30–70% 最佳） |
| | FCF 派息率 | < 100%（真现金覆盖） |
| | 负债权益比 D/E | < 2.0 |
| | 流动比率 | > 1.0（>1.5 更佳） |

可持续标记 ✅ = 派息率<80% 且 FCF 派息率<100%；健康标记 ✅ = D/E<2 且 流动比率>1。

**复合评分（满分 100，越高越优）：** 分红增长 20（10%+ CAGR=20，线性）+ 营收增长 15（10%+=15）+ EPS 增长 15（15%+=15）+ 派息可持续 10（通过即满分）+ 财务健康 10 + 质量分×0.3（满 30）。质量分 = ROE（满 20% 得 50）+ 净利率（满 15% 得 50）。评分 80–100 卓越 / 60–79 强 / 40–59 良。

## 示例

**解析结果并取关键字段：**

```python
import json

with open('dividend_screener_results.json') as f:
    data = json.load(f)
stocks = data['stocks']  # 每只含 dividend_yield, pe_ratio, pb_ratio,
                         # dividend_cagr_3y, payout_ratio, fcf_payout_ratio,
                         # debt_to_equity, roe, profit_margin, composite_score 等
```

**按行业定制（在初筛后追加）：**

```python
# 只看防御性行业
target = ['Consumer Defensive', 'Utilities', 'Healthcare']
candidates = [s for s in candidates if s.get('sector') in target]

# 排除 REITs 与金融（派息口径不同）
exclude = ['Real Estate', 'Financial Services']
candidates = [s for s in candidates if s.get('sector') not in exclude]
```

**报告骨架（给用户）：** 顶部列筛选条件与命中数 → Top N 排名表（Rank/代码/公司/股息率/PE/分红增长/评分）→ 逐只详析（估值、3Y 成长、派息可持续性、财务健康、质量分、投资要点与风险）→ 组合构建（行业分散、集中度警示、季度监控指标、调仓触发）。

## 注意事项

- **股息率口径差异**：FINVIZ 预筛用 3%+ 入口，最终方法论与报告阈值为 **3.5%**；务必以 3.5% 为准、保持口径一致。
- **速率限制**：FMP 免费档 250 次/天，脚本内置每次调用约 0.3s 延时；超限自动 60s 后重试。两段式约 180–300 次 FMP 调用，仅 FMP 模式可达 500–5000 次。
- **依赖**：`pip install requests`；缺 Key 报「FMP/FINVIZ API key required」，按提示配置环境变量或 `--fmp-api-key/--finviz-api-key` 传参。
- **无结果时放宽条件**：调高 P/E、调低股息率或分红增长门槛；熊市本就命中更少。FINVIZ 失败可回退仅 FMP 模式。
- **重跑频率**：建议季度（对齐财报周期），长期持有者半年亦可。
- **结构性偏差**：结果偏大/中盘、偏公用事业与必需消费，且按设计排除高成长股；过往增长不保证未来。
- **卖出红线**：分红削减、营收/EPS 连续多季下滑、派息率>100%、杠杆无故飙升、估值极端（如 P/E>30）。
- **不要硬编码 Key**，始终走环境变量。

## 互见

- related：`alpha-vantage-market-data` —— 取行情/基本面原始数据作上游。
- related：`dcf-valuation-model`、`three-statement-model` —— 对入围标的做内在价值与建模深挖。
- related：`portfolio-risk-metrics`、`portfolio-rebalancer` —— 把筛选结果落到组合的风险度量与再平衡。
- combines_with：`trading-strategy-backtester` —— 将红利策略历史化回测验证。

---
采编自 tradermonty/claude-trading-skills（MIT 许可），已做中文适配重写。
