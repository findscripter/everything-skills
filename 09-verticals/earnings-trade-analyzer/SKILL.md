---
name: earnings-trade-analyzer
title: 财报后交易五因子评分
description: 当筛选近日财报后股票、量化排序财报跳空动量(PEAD)候选时使用；用 FMP 数据按五因子(跳空幅度/财报前趋势/量能/MA200/MA50)加权打 0-100 分并评 A/B/C/D 级，产出 JSON+Markdown 报告与可执行建议；不适用于盈利预测、基本面估值、实盘下单或非美股标的；触发词：财报后交易、跳空评分、PEAD、动量筛选
domain: 领域/fintech
triggers: [财报后交易分析, 财报跳空评分, post-earnings momentum 筛选, PEAD 候选股, earnings gap scoring, 找最强财报反应, 盈余动量打分]
tags: [fintech, 美股, 量化筛选, 动量交易, 财报, PEAD, 技术分析, FMP, 评分系统]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Bash, Read, FMP API, Python]
requires: []
related: [pead-earnings-drift-screener, octagon-earnings-call-analysis, breakout-trade-planner, trade-signal-postmortem]
combines_with: [trade-position-sizer, trade-signal-postmortem]
license: MIT
source: tradermonty/claude-trading-skills
source_license: MIT
---
## 何时使用

- 需要对**近日发布财报**的美股做盘后动量筛选，按统一标准排序出最强财报反应。
- 寻找财报后漂移（PEAD）候选：跳空大、量能放大、趋势结构良好的标的。
- 要把主观「这只反应不错」转成可比的 0-100 分与 A/B/C/D 评级。

**不该用边界：**
- 不做盈利预测、DCF/估值或基本面深挖——本技能只看价格/量能/均线的事后反应。
- 不产生买卖指令、仓位或止损管理，输出是观察清单而非交易信号。
- 数据源为 FMP，默认覆盖美股；非美股、加密、外汇不在范围内。
- 评级 A 不等于「必涨」，仅代表历史上 PEAD 延续概率较高的结构。

## 步骤

1. **准备凭证**：设置 `FMP_API_KEY` 环境变量或运行时传 `--api-key`。免费档（250 次/日）足够默认筛选（回看 2 天、Top 20）；更大回看窗口或全量筛选建议付费档。
2. **运行分析脚本**（见下方指令），生成 JSON + Markdown 报告到 `reports/`。
3. **复核结果**：读取报告，重点看 A、B 级；结合每只标的的最强/最弱因子判断结构短板。
4. **呈现与建议**：对每个头部候选给出综合分、等级、跳空幅度与方向、财报前 20 日趋势、量比、相对 MA200/MA50 位置，并按等级给可执行指引。

## 指令

```bash
# 默认：回看最近 2 天财报，输出 Top 20
python3 skills/earnings-trade-analyzer/scripts/analyze_earnings_trades.py --output-dir reports/

# 自定义回看天数 + 最小市值过滤 + Top N
python3 skills/earnings-trade-analyzer/scripts/analyze_earnings_trades.py \
  --lookback-days 5 \
  --min-market-cap 1000000000 \
  --top 30 \
  --output-dir reports/

# 启用入场质量过滤（剔除现价 < $10 的低价股）
python3 skills/earnings-trade-analyzer/scripts/analyze_earnings_trades.py \
  --apply-entry-filter \
  --output-dir reports/
```

**五因子与权重（合计 100%）：**

```
composite = gap*0.25 + trend*0.30 + volume*0.20 + ma200*0.15 + ma50*0.10
```

| 因子 | 权重 | 含义 / 关键阈值（满分→低分） |
|---|---|---|
| 财报前趋势 | 30% | 财报前 20 日收益：≥15%→100，≥10%→85，≥5%→70，≥0%→50，≥-5%→30，否则 15 |
| 跳空幅度 | 25% | 取绝对值：≥10%→100，≥7%→85，≥5%→70，≥3%→55，≥1%→35，否则 15 |
| 量能趋势 | 20% | 20 日/60 日均量比：≥2.0x→100，≥1.5x→80，≥1.2x→60，≥1.0x→40，否则 20 |
| MA200 位置 | 15% | 距 200 日 SMA：≥20%→100，≥10%→85，≥5%→70，≥0%→55，≥-5%→35，否则 15 |
| MA50 位置 | 10% | 距 50 日 SMA：≥10%→100，≥5%→80，≥0%→60，≥-5%→35，否则 15 |

**跳空计时口径：** BMO（盘前发布）gap = 财报日 open / 前一日 close - 1；AMC（盘后发布）gap = 次日 open / 财报日 close - 1；未知按 AMC 处理。

**等级阈值与指引：**

| 等级 | 区间 | 含义与操作建议 |
|---|---|---|
| A | 85-100 | 强反应 + 机构吸筹，高信念结构：可关注回踩跳空支撑或突破续涨入场 |
| B | 70-84 | 良好反应，值得跟踪：等回踩关键支撑或量能确认再动手 |
| C | 55-69 | 信号混杂，谨慎：需补充分析，等更清晰价格行为或催化 |
| D | 0-54 | 结构弱，回避：风险收益比差 |

## 示例

输入：「帮我看看过去 3 天财报后最强的几只，最小市值 10 亿，剔除低价股。」

```bash
python3 skills/earnings-trade-analyzer/scripts/analyze_earnings_trades.py \
  --lookback-days 3 --min-market-cap 1000000000 --apply-entry-filter \
  --top 20 --output-dir reports/
```

呈现要点（每只候选）：

- **综合分 88 / A级** — 强反应 + 机构吸筹
- 跳空 +9.2%（AMC）｜财报前 20 日 +13%（最强因子：趋势 85）
- 量比 1.7x（评 80）｜价格高于 MA200 +14%、高于 MA50 +6%
- 最弱因子：MA50 位置（60）→ 中期动能略缓，等回踩确认更稳

## 注意事项

- **免费档配额有限**（250 次/日）：扩大 `--lookback-days` 或 `--top` 前先估算调用量，否则易触限。
- 评分是**事后结构刻画**，不含未来收益保证；A 级仅代表历史 PEAD 延续概率更高。
- `--apply-entry-filter` 仅剔除现价 < $10 的低价股（机构关注度低、流动性差），不改变评分逻辑。
- 跳空方向不影响跳空因子得分（取绝对值），方向信息在报告字段中单独呈现，解读时需结合趋势因子判断是利好还是利空跳空。
- 输出文件：`earnings_trade_analyzer_YYYY-MM-DD_HHMMSS.json`（schema_version "1.0"）与同名 `.md`。

## 互见

- 评分细则原始出处：源仓库 `references/scoring_methodology.md`（权重、阈值、入场过滤、复合公式）。
- 同领域可配合：财报日历筛选、基本面估值类技能（本技能不覆盖估值与下单）。

---
采编自 tradermonty/claude-trading-skills（MIT 许可）。
