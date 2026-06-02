---
name: market-breadth-analyzer
title: 市场宽度健康度评分
description: 当需要量化市场宽度健康度、判断涨势是否广泛、给出基于宽度的仓位建议时使用；用 TraderMonty 公开 CSV（免 API Key）跑 Python 脚本，按 6 维加权算 0-100 综合分并产出含健康区间、最强/最弱分项、关注价位、趋势的 JSON+Markdown 报告；不适用于个股选股/择时信号、回测撮合、自定义数据源接入与图形宽度图解读；触发词：市场宽度、涨跌广度、参与率、breadth、宽度健康度、advance-decline、涨势是否广泛、仓位建议
domain: 领域/fintech
triggers: [市场宽度, 涨跌广度, 参与率, breadth, 宽度健康度, advance-decline, 涨势是否广泛, 仓位建议]
tags: [fintech, market-breadth, quant, equity, scoring, python]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, requests]
requires: []
related: [macro-regime-detector, market-top-detector, breakout-trade-planner, trade-position-sizer]
combines_with: [trade-position-sizer, macro-regime-detector]
license: MIT
source: tradermonty/claude-trading-skills
source_license: MIT
---
## 何时使用

- 用户问「这波上涨是不是普涨/广泛参与」「市场宽度健康吗」「参与率怎么样」，需要一个可复现的量化结论而非主观看图。
- 想基于涨跌广度（多少成分股在 200 日均线上方）评估当前股票仓位暴露水平、判断市场是否在「变窄」（领涨股越来越少）。
- 需要持续跟踪宽度综合分的趋势（改善/恶化/平稳），如做日度/定时风控看板。
- 触发词：市场宽度、涨跌广度、参与率、breadth、宽度健康度、advance-decline、涨势是否广泛、仓位建议。

不该用（负边界）：

- 个股选股、买卖/择时信号生成、回测撮合 → 本技能只产出市场层面的健康度评分与仓位提示，不给具体交易决策。
- 接入自定义/私有数据源做宽度计算 → 本技能固定消费 TraderMonty 公开 CSV（覆盖范围见「注意事项」），换源需另行实现。
- 看宽度图表做定性形态解读 → 那是另一类「图形宽度图解读」技能；本技能是 CSV 驱动的全自动量化打分。
- 国际市场、小盘股、其他资产类别 → 数据仅覆盖标普 500。

## 步骤 / 指令

数据方向约定：**分数越高越健康**，100 = 广泛参与（满健康），0 = 临界衰弱。免 API Key，仅需 Python 3.8+、`requests` 和外网访问 GitHub Pages。

1. 准备输出目录：用嵌套或带日期戳的 `--output-dir`（如定时任务）时**必须先建目录**，历史写入器要求目录已存在。
2. 运行主脚本（默认 URL 已内置，可省略 `--detail-url/--summary-url`）：

```bash
mkdir -p reports/<routine-or-date>
python3 skills/market-breadth-analyzer/scripts/market_breadth_analyzer.py \
  --detail-url "https://tradermonty.github.io/market-breadth-analysis/market_breadth_data.csv" \
  --summary-url "https://tradermonty.github.io/market-breadth-analysis/market_breadth_summary.csv" \
  --output-dir reports/<routine-or-date>
```

   临时跑一次可省略 `--output-dir`（默认当前目录）。

3. 脚本会自动：拉取明细 CSV（约 2500 行，2016 至今）+ 汇总 CSV（8 项指标）→ 校验数据新鲜度（>5 天会告警）→ 算 6 个分项分 → 按权重合成综合分并归入健康区间 → 写入历史并算趋势 → 输出 JSON + Markdown。
4. 向用户呈现生成的 Markdown，重点突出：综合分与健康区间、最强/最弱分项、建议股票仓位、需关注的关键宽度价位、任何数据新鲜度告警。

### 6 维评分（权重 + 信号）

| # | 分项 | 权重 | 关键信号 |
|---|---|---|---|
| 1 | 宽度水平与趋势 | 25% | 当前 8MA 水平 + 200MA 趋势方向 + 8MA 方向修正 |
| 2 | 8MA 对 200MA 交叉 | 20% | 快慢均线缺口与方向反映的动能 |
| 3 | 峰/谷周期位置 | 20% | 处于宽度周期的早/中/晚段 |
| 4 | 看跌信号状态 | 15% | 回测得到的看跌信号标志（结合趋势/Pink Zone） |
| 5 | 历史分位 | 10% | 当前值在全历史分布中的位置 |
| 6 | 标普 500 与宽度背离 | 10% | 20 日 + 60 日双窗口价格 vs 宽度背离 |

- **均线为 EMA**（`ewm(span=N, adjust=False)`），非 SMA。8MA=快信号，200MA=趋势滤波。
- **权重再分配**：某分项缺数据（如未检测到峰/谷）则剔除，其权重按比例分摊给其余分项；报告同时给出原始权重与有效权重。全部缺失时综合分兜底为 50/中性，并标注仅供参考。
- **Pink Zone（结构性看跌）**：`200MA 趋势 == -1 且 8MA < 200MA`，是可持续数周/月的结构性弱势，与看跌信号标志相互独立。

### 健康区间映射（100 = 健康）

| 综合分 | 区间 | 股票仓位 | 行动 |
|---|---|---|---|
| 80-100 | 强 (Strong) | 90-100% | 满仓，偏成长/动量 |
| 60-79 | 健康 (Healthy) | 75-90% | 常规操作 |
| 40-59 | 中性 (Neutral) | 60-75% | 选择性建仓，收紧止损 |
| 20-39 | 走弱 (Weakening) | 40-60% | 获利了结，提高现金 |
| 0-19 | 临界 (Critical) | 25-40% | 资本保全，等待筑底 |

## 示例

委托提示词（给 Agent 调用时）：
> 评估当前美股市场宽度健康度。先 `mkdir -p reports/today`，再运行 `market_breadth_analyzer.py --output-dir reports/today`，然后读生成的 Markdown，向我汇报：综合分与健康区间、最强/最弱分项、建议仓位、需关注的关键宽度价位（200MA、0.40、0.60、历史平均峰/谷），以及综合分趋势（改善/恶化/平稳）。如有数据新鲜度告警务必指出。

输出文件：

```text
JSON:    market_breadth_YYYY-MM-DD_HHMMSS.json
Markdown: market_breadth_YYYY-MM-DD_HHMMSS.md
历史:    market_breadth_history.json（跨次持久化，最多 20 条，按数据日期去重）
```

历史趋势判定（最近 N=5 条，首尾分差 delta）：`delta>2 → 改善`，`delta<-2 → 恶化`，`-2≤delta≤2 → 平稳`，键为**数据日期**而非运行日期。

## 注意事项

- **滞后指标**：宽度反映已发生的事，不预测未来，需配合前瞻指标使用。
- **数据新鲜度**：脚本对 >5 天的数据告警；CSV 由上游每日更新两次，分析前确认未过期。
- **覆盖范围有限**：仅标普 500，无行业粒度、无成交量维度、不含国际市场/小盘股/其他资产。少数大权重板块可能主导读数。
- **首次使用先读方法论**：`references/breadth_analysis_methodology.md` 含各分项打分细则、阈值与区间定义；常规执行无需加载，脚本已内置打分。
- **8MA 方向修正告警**：当 C1 或 C2 的 8MA 方向修正为负时，报告会在总体评估上自动追加 Caution，并附「在 8MA 企稳前缩减新仓」「收紧现有持仓止损」等保护性动作——区间建议可能因短期动能恶化而过于乐观。
- **背离早警**：20 日窗口转看跌（≤25）但 60 日仍健康（≥50）时触发 Early Warning，提示结构窗口尚未显现的短期宽度恶化。
- 仓位百分比为框架性参考，非投资建议；落地需结合自身风控与其他确认信号。

## 互见

- related：`portfolio-risk-metrics` —— 拿到宽度区间建议的仓位后，用其量化组合风险（VaR/回撤/夏普）做仓位校准。
- related：`alpha-vantage-market-data` —— 当需要价格/行情数据做交叉验证或补充时。
- combines_with：`trading-strategy-backtester` —— 将宽度健康区间作为择时/仓位过滤条件纳入策略回测。

本条采编自 tradermonty/claude-trading-skills（MIT 许可证）。
