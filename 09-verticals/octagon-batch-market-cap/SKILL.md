---
name: octagon-batch-market-cap
title: 多公司市值批量对比
description: 当需要在一次查询里批量获取并对比多家上市公司市值（同业估值排名、按市值筛选、组合按规模分布）时使用；通过 Octagon MCP 的 octagon-agent 工具传入一组 ticker，返回市值结构化表格并按规模分类与相对估值给出对比观察；不适用于单家公司深挖、实时报价/下单、或未配置 Octagon MCP 的环境；触发词：市值对比、批量市值、market cap、按市值筛选、规模分类
domain: 领域/fintech
triggers: [市值对比, 批量市值, market cap, 多公司估值排名, 按市值筛选, 规模分类 mega/large/mid-cap, Octagon MCP, octagon-agent]
tags: [fintech, 市值, 估值对比, 同业对比, 组合分析, 筛选, Octagon, MCP]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Octagon MCP, octagon-agent]
requires: []
related: [octagon-company-market-cap, octagon-historical-market-cap, octagon-industry-pe-ratios, octagon-sector-pe-ratios]
combines_with: [octagon-equity-research-analyst, octagon-financial-health-scores, company-tear-sheet]
license: MIT
source: OctagonAI/skills
source_license: MIT
---
# 多公司市值批量对比

## 何时使用

当用户要**一次性获取多家公司的市值并做横向对比**时使用：同业估值排名、按市值（mega/large/mid-cap 等）筛选标的、分析组合按公司规模的分布与集中度。通过 Octagon MCP 的 `octagon-agent` 工具传入一组 ticker，返回市值结构化表格。

**不该用的边界：**
- 只关心**单家公司**的市值或财务细节 —— 改用 `octagon-ratings-snapshot` / `octagon-stock-quote` 等单标的技能，本技能价值在「批量 + 对比」。
- 需要**实时报价、下单、券商撮合** —— 本技能返回的是分析参考值，非可直接交易的实时数据。
- 运行环境**未配置 Octagon MCP**（需装好 `octagon-mcp` 并设置 `OCTAGON_API_KEY`），否则 `octagon-agent` 工具不可见。
- 需要利润表/资产负债表/增长率等报表明细时 —— 改用同源对应技能（见互见）。

## 步骤

1. **确认前置**：环境已配置 Octagon MCP（Cursor / Claude Desktop / Windsurf 等均可），`octagon-agent` 工具可见。配置核心：`OCTAGON_API_KEY=<key> npx -y octagon-mcp`（Windows 用 `cmd /c "set OCTAGON_API_KEY=<key> && npx -y octagon-mcp"`）。
2. **整理 ticker 清单**：把要对比的公司代码列齐（如 AAPL、MSFT、GOOGL）。可按板块、组合持仓或行业自然分组。
3. **构造自然语言 prompt**：用一句话把整组 ticker 喂给 `octagon-agent`。
4. **调用 `octagon-agent` 工具**，由 octagon-companies-agent / octagon-financials-agent / octagon-web-search-agent 返回市值表格。
5. **生成对比观察**：按绝对规模排名 → 规模分类归档 → 相对大小（与榜首/中位/板块合计之比）→ 估值含义（市值 vs 营收/盈利）四步总结。
6. **按需下钻**：基于结果追问规模变化、集中度或与同业的差距。

## 指令

查询格式（自然语言模板）：

```
Retrieve market capitalization data for the following companies: <TICKER1>, <TICKER2>, <TICKER3>.
```

MCP 调用：

```json
{
  "server": "octagon-mcp",
  "toolName": "octagon-agent",
  "arguments": {
    "prompt": "Retrieve market capitalization data for the following companies: AAPL, MSFT, GOOG."
  }
}
```

**市值规模分类（用于把结果归档）：**

| 类别 | 市值区间 | 典型特征 |
|------|----------|----------|
| Mega-cap 巨型 | >$200B | 市场领导者、全球化、稳定 |
| Large-cap 大型 | $10B–$200B | 成熟、多元化、增长温和 |
| Mid-cap 中型 | $2B–$10B | 有增长潜力、覆盖较少 |
| Small-cap 小型 | $300M–$2B | 高增长、高波动 |
| Micro-cap 微型 | $50M–$300M | 投机性、流动性有限 |
| Nano-cap 纳型 | <$50M | —— |

市值口径：`Market Cap = 股价 × 流通股数`。注意区分基本股数与全面摊薄（含期权/认股权证/可转换证券）。

## 示例

输出形如：

| Company | Ticker | Market Cap (USD) | Source |
|---------|--------|------------------|--------|
| Apple | AAPL | $2.99986 trillion | Octagon Companies Agent |
| Microsoft | MSFT | $3.143 trillion | Companies Market Cap |
| Alphabet | GOOGL | $2.00018 trillion | Octagon Companies Agent |

数据来源：octagon-companies-agent、octagon-financials-agent、octagon-web-search-agent。

**多场景 prompt 示例：**

```
# 板块对比（科技巨头）
Get market caps for tech giants: AAPL, MSFT, GOOGL, AMZN, META, NVDA.

# 组合/同业分析（车企）
What are the market capitalizations of TSLA, F, GM, and RIVN?

# 行业对比（大型银行）
Compare market caps of major banks: JPM, BAC, WFC, C, GS.

# 指数成分
Get market caps for the top 10 S&P 500 companies by weight.

# 跨市场对比（注意非美股用本地后缀，如 .IL）
Compare market caps of AAPL, SMSN.IL (Samsung), TSM, and ASML.
```

**对比框架（拿到表格后怎么读）：**
- 绝对规模：直接按市值排名。
- 相对规模：与榜首/行业中位/板块合计求比值（板块合计比可近似市场份额）。
- 估值含义：市值高而营收低=溢价；市值低而营收高=折价；市值相近而盈利不同=P/E 差异，结合基本面（P/E、P/S）才有意义。

## 注意事项

- **前置依赖**：未配置 Octagon MCP 或缺少 `OCTAGON_API_KEY` 时 `octagon-agent` 不可用。
- **数据一致性**：跨公司对比务必用**同一来源、同一日期**；不同源/不同日的市值不可直接比，需标注差异。
- **币种与口径**：跨市场公司先统一换算为单一币种（默认 USD）；确认股数口径（基本 vs 摊薄）一致。
- **缺失与异常**：缺数据要显式标注「不可用」；遇异常规模（过大/过小）先排查再下结论。
- **时效**：市值随股价实时变动，本技能返回值为参考快照，非实时报价；结论需自行复核，不能替代交易决策。
- 缺少 ticker 等必要输入时先停下确认，不要臆造代码。

## 互见

- related：`octagon-stock-quote` —— 市值 + 当前价，组合看单标的快照。
- related：`octagon-ratings-snapshot` —— 单家公司评级与关键指标快照（与本技能的多家批量互补）。
- related：`octagon-income-statement-data` —— 市值对照营收/盈利，判断溢价或折价。
- combines_with：`octagon-financial-growth-metrics` —— 市值变化 + 增长指标，做规模与成长的联合分析。
- combines_with：`octagon-price-target-consensus` —— 市值 vs 分析师目标价，评估上行/下行空间。
- combines_with：`octagon-equity-research-analyst` —— 批量市值作为同业筛选的入口，再交编排技能深挖。

---
采编自 OctagonAI/skills（MIT 许可），已做中文适配重写。
