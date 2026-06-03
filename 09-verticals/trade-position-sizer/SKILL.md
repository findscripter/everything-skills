---
name: trade-position-sizer
title: 风险化仓位计算
description: 当要为某笔多头股票交易确定买入股数、控制单笔风险或核查组合集中度时使用；用固定分数 / ATR / 凯利三法算出风险化仓位（股数、市值、止损、约束）并产出 JSON+MD 报告；不适用于做空、期权、加密及无止损的盲目买入；触发词：仓位计算、买多少股、单笔风险、凯利公式、ATR 止损
domain: 领域/fintech
triggers: [仓位计算, 买多少股, position sizing, 单笔风险, 风险百分比, 凯利公式, Kelly criterion, ATR 止损, 止损距离, 组合集中度, 板块敞口, 组合热度, how many shares]
tags: [fintech, 交易, 风险管理, 仓位管理, 凯利公式, atr, 止损, python]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [position_sizer.py, Bash, Python 3.9+]
requires: []
related: [breakout-trade-planner, portfolio-risk-metrics, options-strategy-advisor, trade-signal-postmortem]
combines_with: [breakout-trade-planner, vcp-screener, backtesting-frameworks]
license: MIT
source: tradermonty/claude-trading-skills
source_license: MIT
---
## 何时使用

适用：用户问"这笔交易该买多少股"，要为某个**多头股票**交易点位（入场价/止损价/ATR）算出风险化股数、核查仓位是否超出组合集中度上限，或想用历史胜率反推凯利风险预算。三种方法：

- **固定分数（Fixed Fractional）**：每笔交易固定承担账户权益的某个百分比（默认 1%），最常用。
- **ATR 法**：用平均真实波幅设波动调整后的止损距离，自动让高波动标的拿小仓、低波动标的拿大仓。
- **凯利公式（Kelly）**：由历史胜率与盈亏比算出数学最优风险比例，主要用作"上限校验"或资金分配。

不该用：做空、期权、期货、加密货币（脚本仅针对多头股票，止损须低于入场价）；无止损/无 ATR 的盲目买入；凯利没有 100+ 笔可靠历史记录时（结果不可信）；需要实时行情时本脚本不取价，须先用其他工具查价。

## 步骤

1. **收集参数**：账户规模（必填）。固定分数→入场价、止损价、风险%（默认 1）；ATR 法→入场价、ATR、倍数（默认 2.0）、风险%；凯利→胜率、平均盈、平均亏（可选入场/止损以折算股数）。可选组合约束：单仓上限%、板块上限%、当前板块敞口%。只给了代码没给点位时，先用查价/技术分析工具补出入场与止损。
2. **跑脚本**（见下方指令）。
3. **读方法学**：需要为所选方法补充背景、风险档位或约束最佳实践时，参阅源仓库 `references/sizing_methodologies.md`。
4. **多情景对比**：用户未指定单一方法时，跑多组（固定分数 0.5/1.0/1.5%；ATR 1.5/2.0/3.0x），列表对比股数、市值、美元风险。
5. **套用约束定最终股数**：有组合上下文时加 `--max-position-pct / --max-sector-pct / --current-sector-exposure`，**最严约束（股数最小者）获胜**，并说明哪条约束起了约束作用、为什么。
6. **出报告**：方法与理由、精确股数与市值、美元风险与占账户%、止损价、起作用的约束、风险提醒（组合热度、止损纪律）。

## 指令

脚本路径 `scripts/position_sizer.py`，纯标准库，Python 3.9+，无需任何 API key。报告写入 `--output-dir`，文件名 `position_sizer_YYYY-MM-DD_HHMMSS.json` 与 `.md`。

```bash
# 固定分数（最常用）
python3 scripts/position_sizer.py \
  --account-size 100000 --entry 155 --stop 148.50 --risk-pct 1.0 --output-dir reports/

# ATR 法
python3 scripts/position_sizer.py \
  --account-size 100000 --entry 155 --atr 3.20 --atr-multiplier 2.0 --risk-pct 1.0 --output-dir reports/

# 凯利（预算模式：无入场价，输出建议风险预算）
python3 scripts/position_sizer.py \
  --account-size 100000 --win-rate 0.55 --avg-win 2.5 --avg-loss 1.0 --output-dir reports/

# 凯利（股数模式：带入场/止损，折算为股数）
python3 scripts/position_sizer.py \
  --account-size 100000 --entry 155 --stop 148.50 --win-rate 0.55 --avg-win 2.5 --avg-loss 1.0 --output-dir reports/

# 套用组合约束
python3 scripts/position_sizer.py \
  --account-size 100000 --entry 155 --stop 148.50 --risk-pct 1.0 \
  --max-position-pct 10 --max-sector-pct 30 --current-sector-exposure 22 --output-dir reports/
```

核心公式：
```
固定分数：risk_per_share = entry - stop; dollar_risk = account * risk_pct/100; shares = int(dollar_risk / risk_per_share)
ATR：    stop_distance = atr * multiplier; stop = entry - stop_distance; 余同上（risk_per_share=stop_distance）
凯利：    R = avg_win/avg_loss; kelly% = W - (1-W)/R; 取负则归 0（"勿交易"）；实战用 half_kelly = kelly%/2
单仓约束：max_shares = int(account * max_position_pct/100 / entry)
板块约束：max_shares = int((max_sector_pct - current_exposure)/100 * account / entry)
```
互斥校验：`--risk-pct` 与 `--win-rate` 不能同时给；凯利模式须同时有 win-rate/avg-win/avg-loss；风险模式须有 `--entry` 且 `--stop` 或 `--atr` 二选一。

## 示例

账户 10 万，入场 155、止损 148.50、风险 1%：
- 每股风险 = 155 − 148.50 = 6.50；美元风险 = 1000；股数 = int(1000/6.50) = **153 股**
- 仓位市值 ≈ $23,715（占账户 23.7%），实际风险约 $994.50（0.99%）

凯利：胜率 55%、平均盈 2.5、平均亏 1.0 → R=2.5；kelly = 0.55 − 0.45/2.5 = **37%**；half-Kelly = **18.5%**；10 万账户 → 风险预算 $18,500。
负期望示例：胜率 30%、盈 1.0、亏 1.5 → kelly = −0.75 → 归 0 → "勿交易该系统"。

约束示例（上方第 5 条命令）：风险法给 153 股，但板块仅剩 30%−22%=8% 敞口 → int(8%×10万/155)=51 股，板块约束**起约束作用**，最终取 51 股。

## 注意事项

- **生存优先**：仓位管理是为了熬过连亏，而非放大盈利。
- **1% 法则**：默认每笔 1%，无极特殊理由勿超 2%（10 次连亏 @1% 回撤 9.6% 可恢复，@5% 则 40%）。
- **向下取整**：股数永远向下取整，绝不进位。
- **最严约束获胜**：多条约束并存时取股数最小者。
- **半凯利**：实战绝不用全凯利；半凯利可拿到约 75% 增长率而回撤大幅降低。
- **组合热度**：所有持仓的总敞口风险不超过账户 6–8%，超 8% 在已有仓位移至保本/平仓前不再开新仓。
- **亏损的不对称**：亏 50% 需涨 100% 才回本，据此定仓位。
- 本工具仅多头股票、纯计算、不构成投资建议；输入校验：账户>0、入场>0、止损<入场、风险%>0、ATR>0、胜率∈(0,1]。

## 互见

- 源仓库方法学详解：`references/sizing_methodologies.md`（三法对比表、风险档位、组合约束指引、亏损不对称表）。
- 同领域（领域/fintech）其他交易/风险技能可配合使用：先用本技能定单笔仓位，再在组合层面汇总组合热度。

---
采编自 tradermonty/claude-trading-skills（MIT 许可），适配重写为中文「技能大典」条目。
