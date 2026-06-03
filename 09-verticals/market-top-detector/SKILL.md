---
name: market-top-detector
title: 市场顶部概率检测
description: 当判断美股是否临近顶部、是否该减仓时使用；做 6 维量化打分（0-100）输出顶部概率与风险区间及行动建议；不适用于长周期泡沫评估或个股选股；触发词：市场顶部、是否减仓、派发日、防御板块轮动、领涨股走弱、调整概率
domain: 领域/fintech
triggers: [市场顶部, 天井, 是否减仓, 派发日, distribution day, 防御板块轮动, 领涨股走弱, 调整概率, 市场风险, 利确时机]
tags: [量化, 择时, 风险管理, 美股, 市场广度, 情绪指标, o'neil, minervini]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, fmp-api, websearch]
requires: []
related: [market-breadth-analyzer, macro-regime-detector, portfolio-rebalancer, institutional-flow-tracker]
combines_with: [market-breadth-analyzer, portfolio-rebalancer, tax-loss-harvesting]
license: MIT
source: tradermonty/claude-trading-skills
source_license: MIT
---
# 市场顶部概率检测

融合 O'Neil 派发日、Minervini 领涨股恶化、Monty 防御板块轮动三套方法，用 6 维量化打分系统输出 0-100 的顶部概率综合分与风险区间，聚焦未来 2-8 周、对应 10-20% 回调的战术择时信号。

## 何时使用

适用：
- 用户问「市场是否见顶 / 天井是否将近 / 现在该不该利确」。
- 观察到派发日（distribution day）持续累积。
- 防御板块跑赢成长，或领涨股走弱而指数仍坚挺。
- 想评估未来 2-8 周的回调概率、判断减仓时机。

不该用（负边界）：
- 长周期（月到年）泡沫评估、30%+ 崩盘风险 → 用 `us-market-bubble-detector`（Minsky/Kindleberger 框架，估值+情绪+社交）。
- 个股选股 / 入场点判断 → 用筛选类技能（如 `vcp-screener`、`canslim-screener`）。
- 与本技能定位区别见下表：

| 维度 | 市场顶部检测 | 泡沫检测 |
|---|---|---|
| 时间窗 | 2-8 周 | 月到年 |
| 目标 | 10-20% 回调 | 泡沫破裂(30%+) |
| 方法 | O'Neil/Minervini/Monty | Minsky/Kindleberger |
| 数据 | 价/量+广度 | 估值+情绪+社交 |
| 分值 | 0-100 综合 | 0-15 分 |

## 前置条件

- **FMP API Key**（必需）：设环境变量 `$FMP_API_KEY` 或传 `--api-key`；免费档够用，单次约 33 次调用。
- **WebSearch**（必需）：采集 S&P 500 的 50DMA 广度与 CBOE 股票 Put/Call 比。
- 可选增强：融资余额 YoY（情绪打分用，通常滞后 1-2 月）、VIX 期限结构（FMP 有 VIX3M 报价时自动识别，可用 `--vix-term` 覆盖）。
- **数据新鲜度**：所有手工采集数据须为最近 3 个交易日内，过期数据降低分析质量。

## 步骤 / 指令

### 阶段 1 · WebSearch 采集数据

```
1. 200DMA 广度  → 脚本自动从 TraderMonty GitHub Pages CSV 拉取，无需搜索。
   覆盖：--breadth-200dma [值]；关闭自动拉取：--no-auto-breadth
2. [必需] 50DMA 广度（有效区间 20-100）
   主搜 "S&P 500 percent stocks above 50 day moving average"
   兜底 "market breadth 50dma site:barchart.com"
   片段差时直取 https://www.barchart.com/stocks/quotes/$S5FI/overview 读 lastPrice/tradeTime
   记录数据日期
3. [必需] CBOE 股票 Put/Call 比（有效区间 0.30-1.50）
   主搜 "CBOE equity put call ratio today"
   兜底 "put call ratio site:cboe.com"
   CSV 端点过期时取 https://ycharts.com/indicators/cboe_equity_put_call_ratio 的 Last Value，标注为次级来源
   记录数据日期
4. [可选] VIX 期限结构：steep_contango/contango/flat/backwardation
   主搜 "VIX VIX3M ratio term structure today"
5. [可选] 融资余额 YoY %：主搜 "FINRA margin debt latest year over year percent"，记录报告月份
```

### 阶段 2 · 执行 Python 脚本

```bash
python3 skills/market-top-detector/scripts/market_top_detector.py \
  --api-key $FMP_API_KEY \
  --breadth-50dma [值] --breadth-50dma-date [YYYY-MM-DD] \
  --put-call [值] --put-call-date [YYYY-MM-DD] \
  --vix-term [steep_contango|contango|flat|backwardation] \
  --margin-debt-yoy [值] --margin-debt-date [YYYY-MM-DD] \
  --output-dir reports/ \
  --context "Consumer Confidence=[值]" "Gold Price=[值]"
# 200DMA 广度自动拉取；需要时 --breadth-200dma 覆盖，--no-auto-breadth 关闭
```

脚本会：拉取 S&P500/QQQ/VIX 报价与历史 → 拉取领涨 ETF（ARKK, WCLD, IGV, XBI, SOXX, SMH, KWEB, TAN）与板块 ETF（XLU, XLP, XLV, VNQ, XLK, XLC, XLY）→ 计算 6 个分项 → 生成综合分与报告（JSON + Markdown）。

### 阶段 3 · 呈现结果

向用户突出：综合分与风险区间、数据新鲜度告警（>3 天）、最强预警信号（最高分项）、历史顶部对照、What-if 敏感性、按风险区间的行动建议、Follow-Through Day 状态、与上次运行的 Delta。

## 示例

### 6 维打分权重

| # | 分项 | 权重 | 数据源 | 关键信号 |
|---|---|---|---|---|
| 1 | 派发日计数 | **25%** | FMP | 近 25 个交易日的机构抛售 |
| 2 | 领涨股健康度 | **20%** | FMP | 成长 ETF 篮子恶化 |
| 3 | 防御板块轮动 | **15%** | FMP | 防御 vs 成长相对强弱 |
| 4 | 市场广度背离 | **15%** | CSV自动 + 搜索 | 200/50DMA 广度 vs 指数位 |
| 5 | 指数技术形态 | **15%** | FMP | 均线结构、反弹失败、更低高点 |
| 6 | 情绪与投机 | **10%** | FMP + 搜索 | VIX、Put/Call、期限结构 |

### 风险区间映射

| 分值 | 区间 | 风险预算 | 行动 |
|---|---|---|---|
| 0-20 | 绿(正常) | 100% | 正常操作 |
| 21-40 | 黄(早期预警) | 80-90% | 收紧止损、减少新仓 |
| 41-60 | 橙(风险升高) | 60-75% | 弱势仓位获利了结 |
| 61-80 | 红(高概率见顶) | 40-55% | 积极获利了结 |
| 81-100 | 危(顶部形成) | 20-35% | 最大防御、对冲 |

## 注意事项

- 输出文件：`market_top_YYYY-MM-DD_HHMMSS.json` 与 `.md`。
- 这是战术择时信号、概率而非确定性；任一手工数据超过 3 天会显著降低可信度，须在报告中明确告警。
- 参考文档按需加载：首次用读 `references/market_top_methodology.md`（完整框架）；派发日问题读 `references/distribution_day_guide.md`（含 Stalling Day、FTD 机制）；历史对照读 `references/historical_tops.md`（2000/2007/2018/2022 顶部）。常规执行无需加载，脚本已内置打分。

## 互见

- related：`us-market-bubble-detector` —— 长周期泡沫评估，与本技能短周期择时互补
- related：`ibd-distribution-day-monitor` —— 单独追踪派发日（本技能分项 1 的细化）
- related：`ftd-detector` —— Follow-Through Day 跟进确认，判断顶部后的反转
- combines_with：`market-breadth-analyzer` —— 提供更细的广度背离数据，强化分项 4
- combines_with：`exposure-coach` —— 把风险区间映射成具体仓位/敞口调整动作

---

采编自 tradermonty/claude-trading-skills（MIT）。
