---
name: octagon-equity-research-analyst
title: 股票研究分析编排
description: 当需要对一家上市公司做完整股票研究、撰写首次覆盖（Initiation of Coverage）报告、做尽职调查或形成带量化支撑的投资评级时使用；做法是编排 Octagon MCP 全套财务分析子技能（财报/增长/分部/估值/ESG/同业），按六阶段取数并合成机构级研究报告；不适用于实盘下单、单一财报数据抓取或不含投资观点的纯数据整理。触发词：股票研究、equity research、首次覆盖、initiation of coverage、投资评级、目标价、买入卖出、尽职调查、同业比较、ESG、Octagon
domain: 领域/fintech
triggers: [股票研究, equity research, 首次覆盖, initiation of coverage, 投资评级, 目标价, 买入卖出评级, 尽职调查, 同业比较, ESG 评级, Octagon MCP]
tags: [fintech, equity-research, 投研报告, 投资评级, 估值, ESG, Octagon, MCP, 编排]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli, windsurf]
tools: [Octagon MCP]
requires: []
related: [dcf-valuation-model, three-statement-model, alpha-vantage-market-data, portfolio-risk-metrics, financial-analysis-toolkit]
combines_with: [dcf-valuation-model, three-statement-model, alpha-vantage-market-data, board-minutes-drafter]
license: CC-BY-4.0
source: OctagonAI/skills
source_license: MIT
---
## 何时使用

- 需要对一家上市公司做**端到端股票研究**并产出机构级研究报告（尤其是首次覆盖 / Initiation of Coverage）时。
- 需要在投资决策前做**尽职调查**，给出带量化支撑的投资评级、目标价与隐含上涨/下跌空间时。
- 需要把财报、增长、分部、估值、ESG、同业多维数据**串成一份连贯、可决策的报告**时。

**不该用的边界：**

- 实盘下单、券商撮合、交易执行——本条只做研究与建议。
- 只想抓取一张财报或单项指标（那是某个子技能/取数环节，不必启动整套编排）。
- 不含投资观点的纯数据整理或可视化。

**前置**：助手需已配置 **Octagon MCP**（Cursor / Claude Desktop / Windsurf 等），否则下列取数步骤无法执行。

**角色设定**：资深卖方股票分析师，撰写「首次覆盖」报告。读者是时间紧张的对冲基金组合经理（PM），要的是**可直接决策、量化驱动、聚焦超额收益（alpha）**的报告。文风对标高盛研报但更精炼：平实英语/中文、主动语态、短句。

## 步骤

整套分析编排为**六个阶段**，逐阶段调用 Octagon MCP 子技能取数，最后合成报告。把 `<TICKER>` 替换为目标股票代码。

**阶段 1 · 数据采集**——拉取目标公司核心财务数据：

```
1. 取 <TICKER> 利润表（Income Statement）数据
2. 取 <TICKER> 资产负债表（Balance Sheet）数据
3. 取 <TICKER> 现金流量表（Cash Flow Statement）数据
4. 取 <TICKER> 分析师一致预期（Analyst Estimates）
5. 取 <TICKER> 财务健康分（Altman Z-Score、Piotroski）
```

**阶段 2 · 增长与趋势分析**——看历史表现与趋势：

```
1. 取 <TICKER> 利润表关键项 YoY 增长，limit=5
2. 取 <TICKER> 资产负债表增长指标
3. 取 <TICKER> 现金流增长指标（OCF、FCF）
4. 取 <TICKER> 历史财务评级（ROA/ROE/DCF 分），limit=2000
```

**阶段 3 · 分部与定位**——理解业务结构与地域敞口：

```
1. 取 <TICKER> 收入按产品分部拆分
2. 取 <TICKER> 收入按地域分部拆分
```

**阶段 4 · ESG 与可持续性**——评估 ESG 定位与风险：

```
1. 取 <TICKER> ESG 评级与分数（含风险评级、行业排名）
2. 取 <SECTOR> 行业 FY<YEAR> 的 ESG 基准对比
```

**阶段 5 · 同业比较**：对 2–3 家直接竞争对手**重复阶段 1–4**，并搭出关键指标对比表（增长、利润率、倍数）。

**阶段 6 · 报告合成**：把上述发现整合为研究报告，按下方「报告结构」逐节撰写，每节标注所用子技能。

## 指令

**报告结构**（每节附调用的 Octagon 子技能）：

1. **执行摘要与快照**：现价、目标价、隐含上涨空间(%)、投资评级；因子画像（Growth/Returns/Multiple/Integrated 百分位）；12 个月价格图占位。｜子技能：analyst-estimates、financial-health-scores、ratings-snapshot
2. **投资逻辑（Thesis）**：3 条「为何是现在（Why now）」要点 + 一句定位语。｜financial-growth、revenue-product-segmentation
3. **投资正面（Positives）**：按贡献排序的上行驱动 + 量化支撑 + 对估值重估的贡献。｜income-statement-growth、financial-metrics-analysis、cash-flow-growth
4. **同业/竞品分析**：与同业在关键 KPI 上的对比表（增长、利润率、倍数）。｜全部增长类子技能、esg-benchmark-comparison
5. **预期与运营假设**：3 年前瞻模型（收入、利润率、FCF）+ Base/Bear/Bull 敏感性。｜analyst-estimates、income-statement、balance-sheet
6. **估值**：主法用倍数（EV/EBITDA、P/E），交叉验证用同业中位倍数，列重估催化剂。｜financial-health-scores、historical-financial-ratings
7. **关键风险**：按「概率 × 影响」排序，每条给财务敏感性。｜balance-sheet、cash-flow-statement、esg-ratings
8. **ESG 评估**：当前评级与走势、行业重大 ESG 因子、与行业基准对比。｜esg-ratings、esg-benchmark-comparison
9. **附录**：详细财务模型、扩展历史数据、方法论说明。｜全部财报与增长类子技能

**产出规格：**

- **篇幅**：全文 6,000–10,000 字；每个主节 500–1,000 字。
- **格式**：能用要点就用要点（每条 ≤2 行）；**加粗所有关键指标**（目标价、上涨空间%、评级）；同业对比、模型、估值交叉验证用表格；图表留占位；**每个数字都脚注标注来源与日期**。
- **来源优先级**：① 公司公告（10-K、20-F、电话会纪要、IR 路演稿）> ② 新闻稿/行业报告/新闻 > ③ 可获取的第三方数据库。**数据缺失时写 `DATA NEEDED` 并建议来源，切勿编造。**
- **合规**：报告结尾附标准卖方免责声明（disclosure boilerplate）。

## 示例

NVDA 完整分析的查询序列（按阶段排布，每行对应一次 Octagon MCP 调用）：

```
# 阶段1 · 财报
取 NVDA 实时利润表数据
取 NVDA 详细资产负债表数据
取 NVDA 现金流量表数据

# 阶段2 · 增长
取 NVDA 利润表关键项 YoY 增长，limit=5，按 period=FY 过滤
取 NVDA 总资产/负债/权益的 YoY 增长
取 NVDA 经营性现金流与自由现金流的 YoY 增长

# 阶段3 · 评级与健康
取 NVDA 分析师 Revenue 与 EPS 预期
取 NVDA 的 Altman Z-Score 与 Piotroski Score
取 NVDA 历史财务评级与关键指标分，limit=2000

# 阶段4 · 分部
取 NVDA 收入按产品分部拆分
取 NVDA 收入按地域分部拆分

# 阶段5 · ESG
取 NVDA ESG 评级与分数（含风险评级、行业排名）
取 Technology 行业 FY2024 的 ESG 基准对比

# 阶段6 · 同业
取 AMD 利润表关键项 YoY 增长，limit=5
取 INTC 利润表关键项 YoY 增长，limit=5
```

## 注意事项

- **先立论，再深挖**：动手前先形成初步观点（preliminary thesis），后续分析用来验证或修正，而不是无观点地堆数据。
- **一切量化**：每条投资正面/负面都要有数字支撑，没数字的论点不写进报告。
- **用区间思考**：关键假设给 Bear/Base/Bull 三情景，而非单点估计。
- **聚焦重要性（materiality）**：优先打磨驱动 ~80% 估值的少数指标，别在边角料上耗时。
- **追踪变化**：明确标注相比上一季度/年度发生了什么变化。
- **交叉验证**：用多个子技能互相印证同一发现，避免单源偏差。
- **取数纪律**：Octagon MCP 返回为准；缺失项写 `DATA NEEDED` 而非估算；每个数字带来源与日期脚注。

## 互见

- requires：无硬前置；但运行依赖已配置好的 **Octagon MCP**。
- related：`dcf-valuation-model`、`three-statement-model`、`portfolio-risk-metrics`——可深挖估值/建模/组合风险维度。
- combines_with：`dcf-valuation-model`（用绝对估值补充本条的倍数法）、`three-statement-model`（搭出阶段 5 的前瞻三表模型）、`alpha-vantage-market-data`（当 Octagon 缺项时补行情/基本面）、`board-minutes-drafter`（把研究结论转为投委会决策纪要）。

---

本条采编自 OctagonAI/skills（MIT）。
