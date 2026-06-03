---
name: pead-earnings-drift-screener
title: 财报后漂移 PEAD 选股
description: 当需要从财报跳空高开股中筛选「财报后漂移(PEAD)」周线红K回踩-突破形态、给出分级与交易计划时使用；做出 PEAD 选股脚本运行、四阶段(监测/待信号/突破/过期)分类与入场/止损/目标(2R)报告(JSON+Markdown)；不适用于实盘下单撮合、行情数据采集或日内高频；触发词：PEAD、财报后漂移、跳空高开、红K突破、周线动量
domain: 领域/fintech
triggers: [PEAD, 财报后漂移, post-earnings drift, 财报跳空高开, 红K回踩突破, 周线动量, earnings gap, screen_pead]
tags: [fintech, pead, 选股, 财报, 周线k线, 动量, fmp, python]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, FMP API]
requires: []
related: [earnings-trade-analyzer, breakout-trade-planner, vcp-screener, canslim-growth-screener]
combines_with: [trade-position-sizer, breakout-trade-planner, trade-signal-postmortem]
license: MIT
source: tradermonty/claude-trading-skills
source_license: MIT
---
# 财报后漂移 PEAD 选股

## 何时使用
- 用户要从「财报跳空高开」股中筛选 PEAD（Post-Earnings Announcement Drift）候选，识别周线红K回踩后的突破信号。
- 用户已有 earnings-trade-analyzer 的 JSON 产物（schema_version 「1.0」），想进一步做 PEAD 周线筛选与分级。
- 用户要每周复盘 PEAD 观察池，按阶段（监测/待信号/突破/过期）更新动作。

**不该用的边界**：
- 不做实盘下单/券商撮合，只产出候选与交易计划。
- 不做行情/财报数据采集本身（数据来自 FMP API 或上游 JSON）。
- 不做日内/高频；本技能基于**周线**节奏，过滤日内噪声。
- 仅识别「有红K回踩」的形态；纯跳空不回踩（gap-and-go）无法定义风险，不是本技能候选。

## 步骤 / 指令

**前置**：设置 FMP API key（免费档 250 次/日足够默认筛选）。

```bash
export FMP_API_KEY=your_api_key_here
```

**1. 运行筛选（二选一模式）**

模式 A —— 从 FMP 财报日历直接筛（默认回看 14 天、5 周监测窗）：

```bash
python3 skills/pead-screener/scripts/screen_pead.py --output-dir reports/

# 自定义参数
python3 skills/pead-screener/scripts/screen_pead.py \
  --lookback-days 21 \
  --watch-weeks 6 \
  --min-gap 5.0 \
  --min-market-cap 1000000000 \
  --output-dir reports/
```

模式 B —— 从 earnings-trade-analyzer 的 JSON 喂入，按评级过滤：

```bash
python3 skills/pead-screener/scripts/screen_pead.py \
  --candidates-json reports/earnings_trade_analyzer_YYYY-MM-DD_HHMMSS.json \
  --min-grade B \
  --output-dir reports/
```

关键参数：`--watch-weeks`（监测窗周数，默认 5）、`--min-gap`（最小跳空 %，默认 3.0，仅模式 A）、`--min-market-cap`（最小市值，默认 5 亿，仅模式 A）、`--min-grade`（A/B/C/D，默认 B，仅模式 B）、`--max-api-calls`（API 预算，默认 200）、`--top`（入报告条数，默认 20）。

**2. 读取产物并加载规则**
1. 读生成的 JSON 与 Markdown 报告。
2. 复习 PEAD 形态/阶段定义与入场出场规则（见下「核心约束」）。

**3. 按阶段呈现每只候选**
- 阶段分类：MONITORING / SIGNAL_READY / BREAKOUT / EXPIRED。
- 周线形态细节：红K位置、是否已突破红K高点。
- 综合评分与评级。
- 交易计划：入场、止损、目标、风险回报比。
- 流动性指标：ADV20、平均成交量。

**4. 给出可执行建议（按阶段+评分）**
- BREAKOUT + 强势(85+)：高确信 PEAD 交易，满仓位。
- BREAKOUT + 良好(70-84)：标准仓位。
- SIGNAL_READY：红K已成形，在红K高点挂提醒/挂单等突破。
- MONITORING：财报后尚无红K，加入观察池每周看。
- EXPIRED：超出监测窗，移出观察池。

## 形态与阶段（核心约束）

红K回踩形态四步：
1. **财报跳空高开**：财报日跳空 ≥3%（周线绿K）。
2. **漂移延续**：可能继续上行 1-2 周（绿K）。
3. **红K回踩**：有序回调形成周线红K（收 < 开），不能是十字星或内包K。
4. **突破信号**：下一根绿K收盘价 ≥ 红K高点 → 回调结束、漂移恢复。

四阶段：
- **MONITORING**：已跳空、尚未出红K → 加观察池。
- **SIGNAL_READY**：已出红K、尚未突破 → 在红K高点设提醒/备单。
- **BREAKOUT**：当前周线为绿K且价在红K高点之上 → 可执行信号，止损设在红K低点下方。
- **EXPIRED**：距财报 >5 周（可配置），PEAD 效应显著衰减 → 移出。

入场/出场规则要点：
- **入场触发**：周线绿K收盘 ≥ 红K高点；入场价在红K高点或略上；突破周成交量宜高于 4 周均量；周五收盘确认后入。
- **入场清单**：跳空 ≥3%；有清晰红K；当前绿K收于红K高点上；ADV20 ≥ $25M；股价 > $10；在 5 周监测窗内。
- **止损**：硬止损设在红K低点下方（跌破即形态失效、机构支撑破位）。
- **目标**：主目标 2R，`目标 = 入场 + (入场 − 止损) × 2.0`。
- **仓位**：单笔风险 ≤ 组合 1-2%；`仓位 = 组合×风险% / (入场−止损)`；单笔不超过 ADV20 的 1%；同时持仓 3-5 只、跨行业分散。
- **多根红K**：用最近一根定入场/止损，可能示意动量转弱，减仓。

## 示例

最小可用：默认参数跑模式 A，再人读报告。

```bash
export FMP_API_KEY=xxxx
python3 skills/pead-screener/scripts/screen_pead.py --output-dir reports/
# 产物：
#   reports/pead_screener_YYYY-MM-DD_HHMMSS.json   按阶段分类的结构化结果
#   reports/pead_screener_YYYY-MM-DD_HHMMSS.md     按阶段分组的可读报告
```

呈现单只候选（示意）：

```
AAPL  阶段=BREAKOUT  评分=88(强)
  周线：红K高 $232.5 / 低 $225.0；当前绿K收 $235.1 突破成立
  入场 $232.5  止损 $225.0  目标 $247.5  R:R=2.0
  流动性：ADV20 $4.1B  20日均量 5,800万股
  建议：高确信，满仓位（受 ADV20 1% 上限约束）
```

## 注意事项
- **模式 B 严格校验 schema**：输入 JSON 的 `schema_version` 必须等于 `"1.0"`，否则脚本报 ValueError 终止；记录缺少 `symbol/earnings_date/earnings_timing/gap_pct/grade` 字段会被跳过并告警。
- **API 预算**：免费档 250 次/日，默认 `--max-api-calls 200`，扩大 `--lookback-days` 会快速吃掉预算。
- **跳空算法依赖财报时点**：BMO（盘前）用 `开盘[财报日]/收盘[前日]−1`；AMC/未知用 `开盘[次日]/收盘[财报日]−1`。时点标注错会算错跳空。
- **退出时间约束**：入场后 4 周未达目标考虑了结；PEAD 漂移在财报后 6-8 周显著减弱，别死扛。
- 本技能只产出分析与计划，**不构成投资建议**；执行需结合自身风控。

## 互见
- requires：`alpha-vantage-market-data` —— 若无 FMP，可先用它取行情/财报作为数据底座
- related：`trading-strategy-backtester`、`portfolio-risk-metrics`、`backtesting-frameworks`
- combines_with：`trading-strategy-backtester` —— 把 PEAD 入场/止损/2R 规则做成可回测策略验证稳健性

---
采编自 tradermonty/claude-trading-skills（MIT）。
