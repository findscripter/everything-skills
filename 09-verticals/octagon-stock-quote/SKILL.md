---
name: octagon-stock-quote
title: 实时股票报价
description: 当需要查上市公司当前股价、涨跌、成交量、当日/52周区间、市值、50/200日均线时使用；通过 Octagon MCP 的 octagon-agent 按 Ticker 拉实时报价并解读区间位置与均线信号；不适用于实盘下单、毫秒级 tick 高频或离线无 MCP。触发词：实时股价、报价、52周区间、市值、移动均线、octagon-agent
domain: 领域/fintech
triggers: [实时股价, 股票报价, 52周区间, 市值查询, 50日均线 200日均线, 成交量, octagon-agent, AAPL 股价]
tags: [fintech, 股票报价, 行情, 技术指标, 移动均线, mcp, octagon]
level: 入门
status: stable
agents: [claude-code, cursor, gemini-cli, windsurf]
tools: [Octagon MCP, octagon-agent, npx, Node.js]
requires: []
related: [alpha-vantage-market-data, octagon-financial-health-scores, octagon-equity-research-analyst, dcf-valuation-model]
combines_with: [octagon-financial-health-scores, dcf-valuation-model, portfolio-risk-metrics]
license: CC-BY-4.0
source: OctagonAI/skills
source_license: MIT
---
## 何时使用

当需要某只上市股票的**实时综合报价快照**时使用，一次返回：当前价、涨跌额/涨跌幅、成交量、当日区间、52 周区间、市值、交易所、前收盘、50 日与 200 日移动均线。适合快速看盘、组合监控、估值/趋势的盘前盘中速查。

**不该用的边界：**

- 需要实盘下单、券商撮合、持仓管理——本条只读行情，不做交易。
- 毫秒级 tick / 撮合级数据的高频策略——报价为实时或约 15 分钟延迟，非逐笔。
- 需要历史时间序列（OHLCV 回测、长周期走势）——那是历史数据任务，转 `alpha-vantage-market-data` 或 Octagon 历史行情技能。
- **离线 / 未配置 Octagon MCP** 的环境——依赖 `octagon-agent` 工具，无 MCP 无法取数。
- 结果用于辅助分析，不能替代完整尽调、风控与人工复核。

## 步骤

1. **确认 MCP 就绪**：环境已配置 Octagon MCP，`octagon-agent` 工具可见（Windows 需先装 Node.js / npx；配置见「指令」）。
2. **确定标的 Ticker**（如 `AAPL`、`MSFT`、`GOOGL`）。
3. **发起查询**：调用 `octagon-agent`，用自然语言点名要实时报价。
4. **读取报价字段**：当前价、涨跌、成交量、当日/52 周区间、市值、均线。
5. **解读区间位置与均线信号**（见下表与公式）。
6. （可选）追加多标的或指定指标的查询。

## 指令

**Octagon MCP 配置（Claude Desktop / Windsurf，`claude_desktop_config.json`）：**

```json
{
  "mcpServers": {
    "octagon-mcp-server": {
      "command": "npx",
      "args": ["-y", "octagon-mcp@latest"],
      "env": { "OCTAGON_API_KEY": "YOUR_API_KEY_HERE" }
    }
  }
}
```

API Key 在 https://app.octagonai.co 注册后于 API Keys 菜单生成。**Windows** 需先装 Node.js（含 npx）。可用工具：`octagon-agent`（综合市场情报，本条用它）、`octagon-scraper-agent`、`octagon-deep-research-agent`。

**MCP 调用：**

```json
{
  "server": "octagon-mcp",
  "toolName": "octagon-agent",
  "arguments": {
    "prompt": "Get real-time stock quote for the symbol AAPL."
  }
}
```

**查询模板：** `Get real-time stock quote for the symbol <TICKER>.`（数据源：`octagon-stock-data-agent`）

**区间位置公式（判断强弱）：**

```
当日区间位置  = (当前价 - 当日最低) / (当日最高 - 当日最低) × 100%
52周区间位置 = (当前价 - 52周最低) / (52周最高 - 52周最低) × 100%
```

| 52 周区间位置 | 解读 |
|---|---|
| > 90% | 接近 52 周高点，强势，注意阻力 |
| 50% – 90% | 区间上半部 |
| 10% – 50% | 区间下半部 |
| < 10% | 接近 52 周低点，弱势，注意支撑 |

**移动均线信号：**

| 条件 | 解读 |
|---|---|
| 价 > 50 日 > 200 日 | 强势上升趋势 |
| 价 < 50 日 < 200 日 | 强势下降趋势 |
| 50 日上穿 200 日（金叉） | 偏多 |
| 50 日下穿 200 日（死叉） | 偏空 |

**成交量解读：** 量在价上（放量上涨）= 买盘有力；量在价下（放量下跌）= 卖压重；缩量上涨多为弱反弹，难持续。

## 示例

查询 `AAPL` 的典型返回：

| 指标 | 示例值 |
|---|---|
| 当前价 | $270.01 |
| 涨跌 | +$10.53（+4.06%） |
| 成交量 | 72,890,096 股 |
| 当日区间 | $259.21 – $270.48 |
| 52 周区间 | $169.21 – $288.62 |
| 市值 | $3.97 万亿 |
| 交易所 | NASDAQ |
| 前收盘 | $259.48 |
| 50 日均线 | $268.30 |
| 200 日均线 | $236.65 |

区间位置算例：(270.01 − 169.21) / (288.62 − 169.21) = **84.4%**，处于 52 周区间上部，偏强。价格高于 50 日与 200 日均线，趋势偏多。

**更多查询写法：**

```
# 多标的
Get stock quotes for AAPL, MSFT, and GOOGL.

# 指定指标
What is the current price and market cap for TSLA?

# 区间分析
Where is NVDA trading relative to its 52-week range?

# 均线
What are the 50-day and 200-day moving averages for AMZN?

# 组合监控
Get quotes for my holdings: AAPL, MSFT, GOOGL, AMZN, META.
```

## 注意事项

- **数据新鲜度**：盘中为实时或约 15 分钟延迟；盘前/盘后为延展时段成交、流动性低、价差大；收盘后反映前收盘价。
- **单点 vs 趋势**：报价是快照，趋势判断须结合均线与历史，勿据一价定论。
- **量价配合**：高成交量确认价格动作；放量异动（如 5 倍于均量）多有催化事件，需查新闻。
- **异常警示**：无消息却 >10% 大幅波动、交易暂停、宽价差，均为风险信号。
- **API Key 安全**：Key 通过 `OCTAGON_API_KEY` 环境变量注入，勿硬编码；遇限流降低查询频率。
- **结果定位**：报价供分析参考，不能替代尽调、回测与专家复核。

## 互见

- requires：（无）
- related：`alpha-vantage-market-data`（程序化拉取行情/历史 OHLCV/基本面）、`octagon-financial-health-scores`（同源破产风险与财务强度评分）、`octagon-equity-research-analyst`（同源股票研究编排）、`dcf-valuation-model`（把报价市值放进估值上下文）。
- combines_with：`octagon-financial-health-scores`（报价看趋势 + 评分看健康度）、`dcf-valuation-model`（当前价 vs 内在价值对比是否高/低估）、`portfolio-risk-metrics`（多标的报价汇入组合层风险度量）。

---

本条采编自 OctagonAI/skills（MIT 许可），已做中文适配重写。
