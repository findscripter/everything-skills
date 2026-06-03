---
name: octagon-company-market-cap
title: 单公司市值查询
description: 当需要查询单只上市股票的当前总市值、估值规模或大/中/小盘分类时使用；通过 Octagon MCP 的 octagon-agent 工具按 ticker 拉取市值数据并生成带日期与来源的结构化结果及规模解读；不适用于实时报价/下单、多公司批量对比、历史市值序列，或未配置 Octagon MCP 的环境；触发词：市值、market cap、估值规模、大盘股、万亿市值
domain: 领域/fintech
triggers: [市值, market cap, 市值查询, 估值规模/scale, 大盘股/mega-cap, 万亿市值/trillion, Octagon MCP, octagon-agent]
tags: [fintech, 市值, 估值, 规模分类, 股票, octagon, mcp]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Octagon MCP, octagon-agent]
requires: []
related: [octagon-batch-market-cap, octagon-historical-market-cap, octagon-stock-quote, octagon-ratings-snapshot]
combines_with: [octagon-batch-market-cap, octagon-historical-market-cap]
license: MIT
source: OctagonAI/skills
source_license: MIT
---
## 何时使用

当用户需要查询**单只上市股票的当前市值（Market Capitalization）**，用于了解公司估值规模、做大/中/小盘分类、或为新闻/财报/估值判断提供规模背景时使用。返回包含：精确市值（USD 全额数字）、四舍五入口径（如 \$3.97 万亿）、as-of 数据日期、数据来源。

**不该用的边界：**
- 需要实时股价 / 报价、下单或券商撮合 —— 本技能只读市值快照，不做交易；要逐笔报价细节用 `octagon-stock-quote`。
- 一次对比**多家公司**市值 / 同业排序 —— 改用源仓库 `batch-market-cap`（本仓尚未适配），本技能单次只查一家。
- 需要**历史市值序列 / 走势** —— 改用源仓库 `historical-market-cap`，本技能只返回当前 as-of 值。
- 运行环境未配置 Octagon MCP（需装好 `octagon-mcp` 并设置 `OCTAGON_API_KEY`），否则 `octagon-agent` 工具不可用。
- 返回为分析参考，非可直接交易的权威数据，结论需自行复核。

## 步骤

1. **确认前置**：环境已配置 Octagon MCP（Cursor / Claude Desktop / Windsurf 等均可），`octagon-agent` 工具可见。配置核心：`OCTAGON_API_KEY=<key> npx -y octagon-mcp`（Windows 见注意事项）。
2. **确定 ticker**：把公司名解析为股票代码（如 Apple→AAPL、Tesla→TSLA、NVIDIA→NVDA）。
3. **构造自然语言 prompt** 并调用 `octagon-agent` 工具，由 octagon-stock-data-agent 返回市值数据。
4. **解读规模**：用精确值做计算、用四舍五入值做表述；按下方「规模分类」给出大/中/小盘归属。
5. **按需追问**：基于结果下钻（同业对比、相对营收是否合理、近期变化等）。

## 指令

查询格式（自然语言模板）：

```
Get market capitalization data for the symbol <TICKER>.
```

MCP 调用：

```json
{
  "server": "octagon-mcp",
  "toolName": "octagon-agent",
  "arguments": {
    "prompt": "Get market capitalization data for the symbol AAPL."
  }
}
```

**市值定义：** `Market Cap = 当前股价 × 流通在外股数（Shares Outstanding）`。它代表市场对全部股份的估值、公司规模指标、指数权重与理论收购成本；**不**等于内在价值、账面价值、企业价值（EV），也不等于实际并购价（常含溢价）。

**规模分类（USD）：**

| 类别 | 区间 | 特征 |
|------|------|------|
| Mega-cap 超大盘 | >\$200B | 全球龙头、家喻户晓 |
| Large-cap 大盘 | \$10B–\$200B | 成熟稳健 |
| Mid-cap 中盘 | \$2B–\$10B | 有成长性、风险中等 |
| Small-cap 小盘 | \$300M–\$2B | 高成长、高波动 |
| Micro-cap 微盘 | \$50M–\$300M | 投机性、覆盖有限 |
| Nano-cap 纳盘 | <\$50M | 风险最高、流动性低 |

万亿俱乐部：>\$1T = 精英规模；>\$2T = 全球经济影响力；>\$3T = 全球最具价值之列。

## 示例

输出形如：

| Date | Market Capitalization (USD) |
|------|----------------------------|
| 2026-02-02 | \$3,968,586,877,215.00 |

附带：四舍五入值（约 \$3.97 万亿）、as-of 日期、数据来源。数据来源：octagon-stock-data-agent。

**变体提问：**
```
What is the current market cap for Tesla?
What is NVDA's market cap and how does it compare to other chipmakers?
Is TSLA's market cap justified relative to its revenue?
What size category is AMD based on its market cap?
```

可在拿到市值后自行派生估值比率（需配合利润表/营收/账面价值数据）：

```
P/E = Market Cap / Net Income
P/S = Market Cap / Revenue
P/B = Market Cap / Book Value
企业价值 EV = Market Cap + Debt - Cash
```

## 注意事项

- **前置依赖**：未配置 Octagon MCP 或缺少 `OCTAGON_API_KEY` 时 `octagon-agent` 不可用；Windows 配置命令用 `cmd /c "set OCTAGON_API_KEY=<key> && npx -y octagon-mcp"`。
- **数据时效**：市值随股价实时变动，务必记录 as-of 日期；不同日期的值不可直接相比。
- **精确 vs 表述**：计算用全额数字，沟通用四舍五入值。
- **流通量口径**：部分股份可能不可自由交易（float ≠ 全部 shares outstanding），跨公司比较时注意。
- **对比要可比**：仅在同行业、相似商业模式间比较才有意义；理解驱动来自股价变动还是股数变化（回购缩股 / 增发稀释 / 拆股不改市值 / 分拆分离价值）。
- **速率限制**：遇限流应降低查询频率。
- 输出仅供分析参考，缺少 ticker 等必要输入时先停下确认。

## 互见

- related：`octagon-stock-quote` —— 市值 + 当前报价/成交细节，互为补充。
- related：`octagon-income-statement-data` —— 市值 ÷ 净利润/营收得 P/E、P/S 等估值比率。
- related：`octagon-financial-health-scores`、`octagon-financial-growth-metrics` —— 把规模放进财务质量与增长背景里看。
- combines_with：`octagon-equity-research-analyst`、`octagon-price-target-consensus` —— 市值是估值合理性与目标价分析的输入。
- 源仓库另有 `batch-market-cap`（同业批量对比）与 `historical-market-cap`（市值走势），本仓尚未适配，需要时可参照源仓库。

---
采编自 OctagonAI/skills（MIT 许可），已做中文适配重写。
