---
name: breakout-trade-planner
title: 突破交易计划生成
description: 当手上有 VCP 筛选器 JSON 输出、想把候选标的转成可执行的突破建仓计划时使用；做出按 Minervini 方法学计算的入场/止损/目标价、以最坏成交价定仓位与组合热度上限、并产出 Alpaca 兼容的下单模板（预挂 stop-limit / 确认后 limit 括号单）的 JSON+Markdown 计划；不适用于实盘自动下单执行、行情数据采集或 VCP 形态筛选本身；触发词：突破交易、breakout、VCP、Minervini、建仓计划、仓位管理、止损目标、Alpaca
domain: 领域/fintech
triggers: [突破交易, breakout, VCP, Minervini, 建仓计划, 仓位管理, 止损目标, Alpaca, 组合热度, 枢轴突破]
tags: [fintech, trading, breakout, vcp, minervini, position-sizing, risk-management, alpaca, python]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python]
requires: []
related: [vcp-screener, trade-position-sizer, earnings-trade-analyzer, pead-earnings-drift-screener]
combines_with: [vcp-screener, trade-position-sizer, portfolio-risk-metrics]
license: MIT
source: tradermonty/claude-trading-skills
source_license: MIT
---
## 何时使用

适用：
- 已有 VCP 筛选器的 JSON 输出（`schema_version: "1.0"`），想把候选转成可执行的突破建仓计划。
- 需要按枢轴（pivot）算出入场触发价、止损、R 倍数目标价。
- 需要以「最坏成交价」做仓位测算，并强制组合层风控（单仓上限、行业敞口、组合总热度）。
- 想得到 Alpaca API 兼容的下单模板（预挂括号单 / 确认后括号单）。

不该用（负边界）：
- 实盘自动下单、订单路由、券商成交回报处理（这是执行系统，本技能只产计划与模板）。
- 行情/基本面数据采集与清洗（先备好数据再进上游筛选器）。
- VCP 形态识别与打分本身（那是筛选器的职责，本技能消费其输出）。

## 步骤

1. 生成计划：用 VCP 筛选器输出跑 planner 脚本（命令见「示例」），指定账户规模与单笔风险百分比。
2. 阅读产物：读生成的 JSON 与 Markdown，按四类呈现给用户——
   - Actionable Orders：突破前候选，附下单模板。
   - Revalidation：已处于突破状态、需盘中实时确认的候选。
   - Watchlist：仍在发育中的 VCP 候选，仅观察。
   - Rejected/Deferred/Constrained：被 Gate 或组合上限过滤掉的候选。
3. 解读每笔可执行单：入场价（signal vs worst-case）、止损位、R 倍数目标与盈亏比、两种执行模式、该笔风险贡献与累计组合热度。

## 指令

价格推导（参考线，pivot=枢轴，单位为百分比）：

```
signal_entry = pivot * (1 + pivot_buffer_pct / 100)        # 买入止损触发（buy-stop）
worst_entry  = pivot * (1 + max_chase_pct / 100)           # 买入限价上限（buy-limit）
stop_loss    = last_contraction_low * (1 - stop_buffer_pct / 100)
```

- Gate 与仓位测算一律用 `worst_entry`（最坏成交价）；signal 与 worst 两套 R 倍数都展示；止盈基准始终用 `worst_entry`。
- Minervini Gate（必须全部通过）：`valid_vcp=True`；`rating_band ∈ {good, strong, textbook}`；`risk_pct_worst ≤ 8.0%`。突破态额外要求：`breakout_volume=True`、`distance_from_pivot ≤ max_chase_pct`、`current_price ≤ worst_entry`。
- 评级决定仓位倍数：textbook(90+)=1.75x、strong(80-89)=1.0x、good(70-79)=0.75x、developing(60-69)=0.0x（仅观察）。
- 风控硬约束：单笔最坏入场→止损风险 ≤ 8%；默认单笔账户风险 0.5%；组合总开放风险（热度）上限 6%；追高绝不超过 pivot 上方 2%。
- 两种执行模式：
  - pre_place（stop-limit 括号单）：开盘即挂，价达 pivot 自动触发，`buy_stop=signal_entry`、`buy_limit=worst_entry`，括号含止损与止盈。
  - post_confirm（limit 括号单）：等 5 分钟 K 线确认后再以 `worst_entry` 限价买入；确认条件 close>pivot、收盘位于 bar 上 60%、RVOL≥1.5、追高≤2%。
- 止损放置：默认放在最后一个收缩低点下方 1%；Alpaca 要求止损至少低于入场价 $0.01。

## 示例

生成计划（无需 API key，纯本地 JSON）：

```bash
python3 skills/breakout-trade-planner/scripts/plan_breakout_trades.py \
  --input reports/vcp_screener_YYYY-MM-DD.json \
  --account-size 100000 \
  --risk-pct 0.5 \
  --output-dir reports/
```

常用 CLI 参数（默认值）：

```
--account-size            (必填)   账户权益（美元）
--risk-pct                0.5      单笔基准风险百分比
--max-position-pct        10.0     单仓上限百分比
--max-sector-pct          30.0     单行业敞口上限百分比
--max-portfolio-heat-pct  6.0      组合总开放风险上限百分比
--target-r-multiple       2.0      止盈 R 倍数
--stop-buffer-pct         1.0      收缩低点下方止损缓冲
--max-chase-pct           2.0      pivot 上方最大追高
--pivot-buffer-pct        0.1      buy-stop 触发缓冲
--current-exposure-json   None     既有组合敞口（用于热度累计）
```

产物：
- `breakout_trade_plan_YYYY-MM-DD_HHMMSS.json` —— 结构化计划 + 下单模板。
- `breakout_trade_plan_YYYY-MM-DD_HHMMSS.md` —— 人类可读报告。

## 注意事项

- worst-case 优先：仓位与 Gate 必须用 `worst_entry`，否则会低估风险、超额建仓。
- 热度是组合层约束：逐笔通过不代表能全建——累计开放风险超 6% 的候选应被 Defer/Constrain，传 `--current-exposure-json` 以纳入已有持仓。
- developing 评级仓位倍数为 0，只进 Watchlist，不下单。
- 突破态候选需盘中实时确认（5 分钟 K 线四条件），不要凭筛选快照直接挂确认后括号单。
- Alpaca 约束：止损价至少低于入场价 $0.01；下单模板仅为计划，落地执行需人工或外部执行系统复核。
- 方法学来源：Minervini《Trade Like a Stock Market Wizard》(2013)、《Think & Trade Like a Champion》(2017)。

## 互见

- related：`trading-strategy-backtester` —— 上线突破策略前先回测验证其历史表现与稳健性。
- related：`portfolio-risk-metrics` —— 计划落地后跟踪组合层风险指标与热度。
- combines_with：`portfolio-rebalancer` —— 新建仓后与既有持仓一并做再平衡与敞口控制。
- combines_with：`alpha-vantage-market-data` —— 为上游 VCP 筛选与突破确认提供行情数据。

---
本条采编自 tradermonty/claude-trading-skills（MIT 许可）。
