---
name: strategy-backtest-expert
title: 交易策略系统化回测指导
description: 当要系统化压力测试/验证交易策略稳健性、判断一个回测能否上实盘、排查"看着太好"的可疑结果时使用；做"往死里测"方法论编排（假设零裁量化、参数平台而非尖峰、滑点摩擦加码、样本外步进、红旗清单）并用评分脚本产出 Deploy/Refine/Abandon 裁决；不适用于搭建回测引擎代码、采集行情数据、实盘下单或主观裁量交易；触发词：回测验证、压力测试、稳健性、过拟合、曲线拟合、前视偏差、幸存者偏差、滑点、样本外、走向前、参数敏感、回测评分。
domain: 领域/fintech
triggers: [回测验证, 压力测试, 稳健性, robustness, 过拟合, 曲线拟合, curve-fitting, 前视偏差, look-ahead, 幸存者偏差, survivorship, 滑点, slippage, 样本外, out-of-sample, 走向前, walk-forward, 参数敏感, 回测评分, Deploy/Refine/Abandon, 太好了不真实]
tags: [fintech, backtesting, robustness, validation, quant, methodology, risk]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python]
requires: []
related: [trading-strategy-backtester, backtesting-frameworks, portfolio-risk-metrics]
combines_with: [trading-strategy-backtester, backtesting-frameworks, alpha-vantage-market-data]
license: MIT
source: tradermonty/claude-trading-skills
source_license: MIT
---

# 交易策略系统化回测指导

把回测当作"证伪"而非"证明"的纪律编排。核心目标：找**最难被打破**的策略，而不是纸面上**收益最高**的策略。原则：到处加摩擦、压测假设，看谁还活着——在悲观条件下站得住的策略，更可能在实盘有效。

## 何时使用

适用：
- 已有一个交易策略想法或一份回测结果，要系统化压测其稳健性、决定能否上实盘。
- 排查"为什么这份回测可能在骗我"（参数敏感、前视/幸存者偏差、样本太小、滑点不够）。
- 要一个量化、可复现的验收裁决（Deploy / Refine / Abandon），而非凭感觉拍板。
- 学习并执行专业级回测方法论与红旗清单。

不该用（负边界）：
- **搭建回测引擎/编写回测代码**（向量化/事件驱动引擎、walk-forward 实现、撮合记账）→ 用 `backtesting-frameworks` / `trading-strategy-backtester`，本技能只做**方法论与验收评分**，指标由用户提供。
- 采集/清洗行情数据、实盘下单、券商 API 对接。
- **主观裁量型**交易（依赖"盘感"、新闻、宏观语境）：本技能假设规则全部预先编码、零裁量，裁量策略可能不适用。

## 步骤 / 指令

时间分配铁律：**20% 生成想法，80% 试图打破它**。

```
1. 陈述假设(Hypothesis)
   - 一句话讲清 edge。讲不清就别往下测。
   - 例:"财报后跳空 >3% 且首小时回踩前日收盘的股票存在均值回归机会"。
2. 零裁量编码规则
   - 入场(精确条件/时点/价格类型)、出场(止损/止盈/时间止损)、
     仓位(固定额/组合%/波动率调整)、过滤(市值/成交量/板块/波动)、标的池(universe)。
   - 每个决策都必须规则化、无歧义,不许主观判断。
3. 跑初版回测
   - 至少 5 年(最好 10+)、跨多种市场环境(牛/熊/高低波动)、含真实成本(手续费+保守滑点)。
   - 若根本性崩坏,回到第 1 步改假设。
4. 压力测试(80% 时间花在这里) —— 见下方四类压测
5. 样本外验证 —— walk-forward,见下方
6. 评估并下裁决 —— 跑评分脚本,得 Deploy/Refine/Abandon
```

第 4 步 · 四类压力测试：

- **参数敏感**：止损取基线的 50/75/100/125/150%，止盈取 80/90/100/110/120%，入出场时点 ±15-30 分钟。**找稳定的"平台"，不要窄"尖峰"**——例：止损在 1.5%–3.0% 之间都盈利=真 edge；只在 2.13% 才盈利=曲线拟合。
- **执行摩擦**：滑点放大到典型值的 1.5–2 倍；按最坏成交建模（买在 ask+1 tick、卖在 bid-1 tick）；加入订单拒绝/部分成交；用悲观手续费结构。
- **时间稳健**：逐年分析，要求多数年份正期望；不能依赖 1–2 个例外区间；分市场环境单独测。
- **样本量**：绝对下限 30 笔；推荐 100+；高置信 200+。

第 5 步 · Walk-forward 样本外：训练段优化（如第 1–3 年）→ 验证段测试（第 4 年）→ 滚动重复 → 比对样本内 vs 样本外。**警告信号**：样本外 < 样本内 50%、需频繁重优化参数、各段参数剧烈漂移。

第 6 步 · 评估问句 + 裁决标准：edge 在悲观假设下是否存活？参数变动下是否稳定？跨多环境是否有效？样本量是否够？结果是否"好到不真实"？
- ✅ Deploy：通过全部压测且表现可接受。
- 🔄 Refine：核心逻辑成立但需调参。
- ❌ Abandon：未过压测或依赖脆弱假设。

## 示例

运行评分脚本做结构化、量化验收（脚本对 5 维各 20 分共 100 分打分：样本量 / 期望值 / 风险管理 / 稳健性 / 执行真实性；检测红旗；输出裁决）：

```bash
python3 skills/backtest-expert/scripts/evaluate_backtest.py \
  --total-trades 150 \
  --win-rate 62 \
  --avg-win-pct 1.8 \
  --avg-loss-pct 1.2 \
  --max-drawdown-pct 15 \
  --years-tested 8 \
  --num-parameters 3 \
  --slippage-tested \
  --output-dir reports/
```

裁决阈值与产物：
- 评分 ≥70 → Deploy；40–69 → Refine；<40 → Abandon。
- `reports/backtest_eval_<timestamp>.json`：含各维度分、红旗、裁决、profit factor、expectancy。
- `reports/backtest_eval_<timestamp>.md`：人读报告（维度表 + 关键指标 + 红旗明细）。

关键计算口径（与脚本一致）：

```
expectancy   = 胜率 * 平均盈利% - 败率 * 平均亏损%   # ≤0 直接判负期望
profit_factor = (胜率 * 平均盈利%) / (败率 * 平均亏损%)
```

红旗清单（命中 >2–3 条则不可上实盘，需补测）：
- 数据质量：是否处理幸存者偏差？是否纳入退市标的？数据对齐有无前视？分红/拆股是否正确处理？
- 样本量：≥100 笔（最好 200+）？≥5 年（最好 10+）？含完整市场周期？
- 参数稳健：邻近参数值仍有效？存在稳定平台？参数 <5 个且有逻辑依据（非纯优化）？
- 执行真实：含真实手续费？滑点按 1.5–2x 保守建模？考虑最坏成交与订单拒绝/部分成交？
- 表现特征：多数年份正期望？各主要环境可接受？无 >50% 灾难性回撤？edge 大到能扛摩擦？
- 偏差防控：策略先定义后测试？假设有经济逻辑？结果非"好到不真实"？做了样本外？无挑样本？

## 注意事项

- **罚策略（Punish）**：到处加摩擦——手续费高于现实、滑点 1.5–2x、最坏成交、订单拒绝、部分成交。能在悲观假设下存活的策略往往实盘更稳。
- **求平台不求尖峰**：稳定参数区间=真 edge；窄优化点=曲线拟合。
- **测全集不测精选**：测每一个符合条件的标的（含失败的），别只研究事后挑出的"赢家"，否则=幸存者偏差，高估策略质量。
- **想法生成与验证分离**：直觉用于生假设；验证必须纯数据驱动。绝不让对想法的偏爱影响对结果的解读。
- **统计显著性**：小 edge 需大样本才能证明——每笔 5% 的 edge 需 100+ 笔才能与运气区分。
- **太好要警惕**：胜率 >90%、回撤极小、时点完美 → 审查前视偏差或数据问题。脚本对 `win_rate>90 且回撤<5%` 会直接报 `too_good` 红旗。
- **工具怪癖**：了解你的回测平台的插值方式、低流动性处理、数据对齐问题。
- **无语境要求**：若策略要"完美语境"才有效，就不够稳健，不适合系统化交易。
- 本技能不出具投资建议，不承诺未来收益；指标由用户提供，脚本不接外部数据/API。

## 互见

- related：`trading-strategy-backtester`、`backtesting-frameworks` —— 它们负责**实现**回测引擎与 walk-forward/蒙特卡洛代码；本技能负责对其产出做**方法论压测与验收**。
- related：`portfolio-risk-metrics` —— 计算夏普/索提诺/最大回撤等指标，喂入本技能的评分维度。
- combines_with：`trading-strategy-backtester` / `backtesting-frameworks` —— 先用它们跑出指标，再用本技能下 Deploy/Refine/Abandon 裁决。
- combines_with：`alpha-vantage-market-data` —— 提供 point-in-time 行情作为回测输入。

---

采编自 tradermonty/claude-trading-skills（MIT 许可）：backtest-expert。本条为适配重写，保留其"往死里测"方法论、四类压力测试、参数平台/红旗清单、walk-forward 流程，以及 5 维评分脚本（样本量/期望值/风险管理/稳健性/执行真实性 → Deploy/Refine/Abandon）的命令与阈值。
