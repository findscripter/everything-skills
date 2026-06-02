---
name: institutional-flow-tracker
title: 13F 机构持仓流向追踪
description: 当需要用 SEC 13F 季报追踪机构（对冲基金/共同基金）持仓增减、识别「聪明钱」吸筹或派发的个股时使用；用 FMP API 跑筛选脚本与单股深挖，产出含持仓占比/季度变动/持有机构数/集中度/可靠性评级的中文研报；不适用于日内实时信号、微盘股(<1亿美元)及 3 个月内短线择时；触发词：13F、机构持仓、机构流向、聪明钱、对冲基金持仓、institutional ownership、smart money、持仓变动
domain: 领域/fintech
triggers: [13F, 机构持仓, 机构流向, 聪明钱, 对冲基金持仓, institutional ownership, smart money, 持仓变动]
tags: [fintech, 13f, institutional, equity, screening, python, fmp]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, requests, fmp-api]
requires: []
related: [octagon-equity-research-analyst, octagon-sec-filing-analyst, canslim-growth-screener, market-breadth-analyzer]
combines_with: [octagon-equity-research-analyst, portfolio-rebalancer]
license: MIT
source: tradermonty/claude-trading-skills
source_license: MIT
---
## 何时使用

- 想用 13F 季报追踪机构投资者（对冲基金、共同基金、养老金）的持仓增减，发现「聪明钱」在大涨前吸筹、或在派发时提前预警的个股。
- 验证投资逻辑（看机构是否认同你的判断）、发现新机会（机构正在加仓）、风险排查（机构正在撤离）、持仓监控（跟踪自己持仓的机构支撑度）、板块轮动（资金从哪流向哪）。
- 定位时长 3–12 个月的中长线，作为**确认指标**而非领先信号。
- 触发词：13F、机构持仓、机构流向、聪明钱、对冲基金持仓、institutional ownership、smart money。

不该用（负边界）：

- 求日内/实时信号 —— 13F 有 45 天披露滞后，数据是季末快照，无法做实时择时。
- 微盘股（市值 < 1 亿美元）—— 机构覆盖稀薄，样本不足，评级会被判 C 而剔除。
- 3 个月内短线交易信号 —— 本技能面向中长线，短线请配技术面/动量技能。
- 重构某一家机构的完整组合 —— FMP 按「个股」而非「机构」组织数据，`track_institution_portfolio.py` 未实现；机构级组合请改用 WhaleWisdom / SEC EDGAR / DataRoma。

## 前置准备

- **FMP API Key**：设环境变量 `FMP_API_KEY`，或脚本里传 `--api-key`。免费档 250 次/天（够季度分析 20–30 只股）。
- **Python 3.8+** 与依赖：`pip install requests`。
- **13F 披露节奏**（季末后 45 天内）：Q1→5 月中、Q2→8 月中、Q3→11 月中、Q4→次年 2 月中。把这些日期设成日历提醒，季报落地后再跑分析。

## 步骤 / 指令

1. **筛选有显著机构变动的个股**（主筛选脚本 `track_institutional_flow.py`）：

   ```bash
   # 快扫：按机构变动取前 50，变动幅度 ≥ 10%
   python3 scripts/track_institutional_flow.py --top 50 --min-change-percent 10

   # 板块聚焦：科技板块，持有机构数 ≥ 20
   python3 scripts/track_institutional_flow.py --sector Technology --min-institutions 20

   # 自定义：市值 ≥ 20 亿、变动 ≥ 15%、前 100，落地 JSON
   python3 scripts/track_institutional_flow.py \
     --min-market-cap 2000000000 --min-change-percent 15 \
     --top 100 --output institutional_flow_results.json
   ```
   输出含：股票代码与名称、当前机构持股占流通股比、环比持股数变动、持有机构数、机构数净增减（新买家 vs 卖家）、头部机构。

2. **单股深挖**（`analyze_single_stock.py`）：

   ```bash
   python3 scripts/analyze_single_stock.py AAPL          # 默认回看 8 季
   python3 scripts/analyze_single_stock.py AAPL --quarters 8
   ```
   产出：8 季机构持股趋势、前 20 大持有人及其仓位变化、集中度分析（前 10 占机构总持仓比）、头部持有人中的新建/增持/减持、以及基于覆盖度的可靠性评级。关键指标判读：持股占比（>70% 稳定但上行空间有限）、持股趋势（上升偏多/下降偏空）、集中度（前 10 > 50% 则抛售风险高）、持有人质量（伯克希尔/富达等长线 vs 动量基金）。

3. **判读信号强度**（5 档框架）：
   - **强烈看多**（考虑买入）：机构持仓环比 +>15%、机构数 +>10%、优质长线加仓、当前占比低（<40%）留有空间、多季连续吸筹。
   - **温和看多**：环比 +5–15%、买卖混合但净正、占比 40–70%。
   - **中性**：变动 <5%、买卖家数相当、机构基盘稳定。
   - **温和看空**：环比 −5–15%、卖多于买、占比 >80% 压制新买家。
   - **强烈看空**（考虑卖出/回避）：环比 −>15%、机构数 −>10%、优质机构离场、多季连续派发、头部机构大额抛售带来的集中度风险。

4. **落地到组合**：
   - **新仓**：先跑机构分析找确认（机构也在吸筹）→ 强看空则缩仓或放弃 → 强看多则增强信心。
   - **持仓**：13F 截止后季度复盘 → 监控派发（早期预警）→ 机构撤离则重审逻辑、必要时减仓。
   - **筛选编排**：用价值/红利等筛选器找候选 → 对头部候选跑本技能 → 优先机构吸筹、回避机构派发的标的。

## 示例

筛选 + 深挖一条龙：

```bash
export FMP_API_KEY=your_key_here
# 1) 科技板块筛出机构异动候选
python3 scripts/track_institutional_flow.py --sector Technology \
  --min-change-percent 15 --top 30 --output tech_flow.json
# 2) 对榜首个股做 8 季深挖，看伯克希尔/ARK 是否在前 20 大持有人中
python3 scripts/analyze_single_stock.py NVDA --quarters 8
```

报告默认存到 `reports/`，命名 `institutional_flow_analysis_<TICKER/THEME>_<DATE>.md`，含：执行摘要 / 持仓趋势 / 头部持有人与变化 / 新买家 vs 卖家 / 集中度 / 判读建议 / 数据来源与时间戳。

委托提示词（给 Agent 调用时）：
> 用 13F 数据评估 {TICKER}：跑单股 8 季深挖，输出机构持股趋势、前 20 大持有人仓位变化、集中度（前 10 占比）、新建/增持/减持，并给出 5 档信号判读与可靠性评级；明确标注 13F 截止季、45 天滞后与样本机构数。

## 注意事项

- **可靠性评级（基于覆盖度，A/B/C）**：A=有可比上季且持有机构 ≥ 50（密集，可排序）；B=有可比上季且 ≥ 10（偏薄，仅参考）；C=无可比上季或 < 10（变动不可测，筛选时**剔除**）。筛选脚本自动剔除 C；单股脚本展示评级并附警告。
- **为何用覆盖度而非逐户对账**：指标取自 FMP 聚合 13F 汇总接口 `institutional-ownership/symbol-positions-summary`，在**源端**已跨所有申报机构对账季度差值，替代了已下线、各季持有人列表不对称（如某季 5415 户、下季 201 户）会虚高百分比的旧 `/api/v3/institutional-holder` 源。
- **数据滞后**：45 天延迟 + 季末快照，披露后仓位可能已变；当确认指标用，别当领先信号。
- **覆盖局限**：仅管理 >1 亿美元的机构须申报；不含个人投资者、小基金、多数国际机构。
- **申报规则**：仅报多头股票（无空头/期权/债券）；部分仓位可保密延迟披露。
- **相关 ≠ 因果**：机构买入个股仍可能下跌；务必结合基本面、宏观环境与技术面，绝不单用机构流向。
- **看多季趋势而非单次**：优先 3 季以上的持续趋势；「伯克希尔加仓」一条 > 「100 只小基金加仓」。
- **下跌股里机构上升**要警惕：可能是价值投资者在接飞刀，需强基本面信心支撑。

## 互见

- related：`octagon-equity-research-analyst` —— 机构流向之外补全公司基本面与股权研究。
- related：`octagon-sec-risk-factors` —— 同走 SEC 申报，从 10-K 风险因子侧佐证机构进出动机。
- related：`octagon-stock-quote`、`alpha-vantage-market-data` —— 取实时/历史行情，与机构季报趋势对照。
- combines_with：`portfolio-risk-metrics` —— 候选选定后量化组合风险（VaR/回撤/集中度）。
- combines_with：`dcf-valuation-model`、`three-statement-model` —— 机构吸筹信号叠加估值/财务建模，提高建仓胜率。

本条采编自 tradermonty/claude-trading-skills（MIT 许可证）。
