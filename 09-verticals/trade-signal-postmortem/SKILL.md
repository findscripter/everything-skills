---
name: trade-signal-postmortem
title: 交易信号复盘归因
description: 当交易/量化信号已平仓或到达持有期（5/20日）、需复盘其实际表现并归因到产出该信号的策略/筛选器时使用；做对比预测方向与已实现收益、分类四类结局（真阳/假阳/错失/制度错配）、产出复盘记录(JSON)+权重调整与改进待办反馈+按策略月度的质量统计；不适用于实盘下单、行情抓取与信号生成本身；触发词：信号复盘、postmortem、交易复盘、归因、假阳性、false positive、命中率、权重校准、决策质量审计
domain: 领域/fintech
triggers: [信号复盘, postmortem, 交易复盘, 归因, 假阳性, false positive, 命中率, 权重校准, 决策质量审计, regime mismatch]
tags: [fintech, trading, postmortem, attribution, signal-quality, feedback-loop, python, quant]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, requests]
requires: []
related: [earnings-trade-analyzer, pead-earnings-drift-screener, strategy-backtest-expert, trade-position-sizer]
combines_with: [earnings-trade-analyzer, trading-strategy-backtester]
license: MIT
source: tradermonty/claude-trading-skills
source_license: MIT
---
## 何时使用

适用：
- 一笔交易已平仓，需把结局落档归因到产出该信号的策略/筛选器。
- 一批信号已到持有期（5 或 20 个交易日），批量复盘其已实现收益。
- 排查某个策略系统性的假阳性（false positive）模式。
- 为信号聚合器（edge-signal-aggregator 之类）生成权重校准反馈。
- 从决策质量指标里产出「技能改进待办」（backlog）。
- 周度/月度的信号质量审计。

不该用（负边界）：
- 生成交易信号、择时选股本身 → 那是上游策略/筛选器的事，本技能只做事后复盘。
- 实盘下单、订单撮合、券商 API 对接。
- 行情/价格数据的抓取与清洗 → 先用数据层准备好 point-in-time 价格，再进本技能。
- 组合层面的风险度量（VaR/回撤等）→ 用 `portfolio-risk-metrics`。

## 步骤 / 指令

前置：Python 3.9+；标准库 + `requests`；输入为 JSON 信号记录（来自聚合器或筛选器）。可选 FMP API key 用于自动拉价算收益，否则手填 `--exit-price` / `--exit-date`。

1. 准备信号记录。每条至少含：`signal_id`、`ticker`、`signal_date`、`predicted_direction`（LONG/SHORT）、`source_skill`，可选 `entry_price`。
2. （可选）配置取价 key：`export FMP_API_KEY=...` 或命令行 `--api-key`。无 key 则走手动录入。
3. 批量录结局：跑 recorder 拉已实现收益并自动分类（见下表）。也可单条手动 `--signal-id --exit-price --exit-date --outcome-notes`。
4. 四类结局自动判定：

   | 类别 | 判据 |
   |---|---|
   | TRUE_POSITIVE | 预测方向与已实现收益符号一致 |
   | FALSE_POSITIVE | 预测方向与已实现收益相反 |
   | MISSED_OPPORTUNITY | 未入场但本可盈利 |
   | REGIME_MISMATCH | 因市场制度切换而失效 |

   分类细则与边界见源 `references/outcome-classification.md`。
5. 生成下游反馈：`--generate-weight-feedback`（给聚合器的权重调整建议）、`--generate-improvement-backlog`（改进待办 YAML）。
6. 出统计：`--summary --group-by skill,month` 按策略/标的/时段聚合命中率与假阳率。

关键约束（务必遵守）：
- **诚实归因**：每条结局都标到 `source_skill`，便于追责与定位是哪个策略在拖后腿。
- **制度感知**：同时记录 `regime_at_signal` 与 `regime_at_exit`，用以区分「策略失灵」与「市场制度切换」。
- **最小样本量**：权重调整需 ≥20 条信号才统计有效，样本不足只标 LOW 置信，不动权重。
- **闭环**：结果必须回流，既校准信号聚合权重，也喂改进待办。

## 示例

列出已到期（5 日以上）待复盘信号：

```bash
python3 skills/signal-postmortem/scripts/postmortem_recorder.py \
  --list-ready --signals-dir state/signals/ --min-days 5
```

批量录结局（自动取价 + 分类，双持有期）：

```bash
python3 skills/signal-postmortem/scripts/postmortem_recorder.py \
  --signals-file state/signals/aggregated_signals_2026-03-10.json \
  --holding-periods 5,20 --output-dir reports/
```

生成权重反馈与改进待办：

```bash
python3 skills/signal-postmortem/scripts/postmortem_analyzer.py \
  --postmortems-dir reports/postmortems/ --generate-weight-feedback --output-dir reports/
python3 skills/signal-postmortem/scripts/postmortem_analyzer.py \
  --postmortems-dir reports/postmortems/ --generate-improvement-backlog --output-dir reports/
```

复盘记录（JSON，关键字段）：

```json
{
  "postmortem_id": "pm_sig_aapl_20260310_abc",
  "signal_id": "sig_aapl_20260310_abc",
  "ticker": "AAPL", "source_skill": "edge-signal-aggregator",
  "predicted_direction": "LONG", "entry_price": 172.50,
  "realized_returns": {"5d": 0.032, "20d": 0.058},
  "exit_price": 178.50, "holding_days": 5,
  "outcome_category": "TRUE_POSITIVE",
  "regime_at_signal": "RISK_ON", "regime_at_exit": "RISK_ON"
}
```

权重反馈（JSON，含样本量与置信度，样本<阈值不调权重）：

```json
{
  "skill_adjustments": [{
    "skill": "vcp-screener", "current_weight": 1.0, "suggested_weight": 0.85,
    "reason": "15% false positive rate in RISK_OFF regime", "sample_size": 42
  }],
  "confidence": "MEDIUM", "min_sample_threshold": 20
}
```

改进待办（YAML 条目）：

```yaml
- skill: vcp-screener
  issue_type: false_positive_cluster
  severity: medium
  evidence: {false_positive_rate: 0.15, sample_size: 42, regime_correlation: RISK_OFF}
  suggested_action: "Add regime filter or reduce signal confidence in RISK_OFF"
  generated_by: signal-postmortem
```

## 注意事项

- 假阳率高未必是策略坏：先看 `regime_at_signal/exit` 是否切换，制度错配（REGIME_MISMATCH）应单列，别误判为策略失效而盲目降权。
- 调权重前查样本量：<20 条只记录、不动权重，避免被小样本噪声带偏。
- 已实现收益须用「时点真实可得」的价格按持有期算（5d/20d），方向比对用收益符号，注意 SHORT 的符号取反。
- 取价依赖 FMP key（可选）；无 key 时全程手动录入 exit 价与日期，确保 exit_date 与 holding_days 自洽。
- 反馈是「建议」不是「自动执行」：权重调整与待办需人工/上游确认后再落地，保留 reason 与证据以便审计复现。
- 摘要报告默认落 `reports/postmortem_summary_YYYY-MM-DD.md`。

## 互见

- combines_with：`trading-strategy-backtester` —— 回测得出的样本外表现可作为复盘的预期基线，复盘的假阳模式反哺回测假设。
- combines_with：`backtesting-frameworks` —— 把复盘暴露的偏差（前视/过拟合）回灌到回测设计。
- related：`portfolio-risk-metrics` —— 复盘关注单信号决策质量，组合层面的 VaR/回撤风险度量用它。
- related：`alpha-vantage-market-data` —— 取已实现收益所需的历史价格数据源。
- related：`portfolio-rebalancer` —— 信号质量校准后的权重可用于再平衡决策。

---
本条采编自 tradermonty/claude-trading-skills（MIT 许可证）。
