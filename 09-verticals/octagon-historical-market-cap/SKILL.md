---
name: octagon-historical-market-cap
title: 历史市值变动追踪
description: 当需要某只股票一段日期区间内的历史市值序列、找估值峰谷、算市值涨跌幅/CAGR、判市值波动或市值规模分类变迁时使用；通过 Octagon MCP 的 octagon-agent 按 Ticker+起止日期拉每日市值并解读趋势、回撤与里程碑；不适用于查当前实时市值、实盘交易或离线无 MCP。触发词：历史市值、市值变化、估值峰谷、市值回撤、CAGR、万亿里程碑、octagon-agent
domain: 领域/fintech
triggers: [历史市值, 市值变化, 市值趋势, 估值峰谷, 市值回撤, 市值CAGR, 万亿市值里程碑, octagon-agent]
tags: [fintech, 市值, 估值, 历史数据, 趋势分析, 回撤, mcp, octagon]
level: 进阶
status: stable
agents: [claude-code, cursor, gemini-cli, windsurf]
tools: [Octagon MCP, octagon-agent, npx, Node.js]
requires: []
related: [octagon-stock-quote, alpha-vantage-market-data, octagon-financial-growth-metrics, dcf-valuation-model]
combines_with: [octagon-stock-quote, dcf-valuation-model, octagon-income-statement-data, octagon-financial-growth-metrics]
license: CC-BY-4.0
source: OctagonAI/skills
source_license: MIT
---
## 何时使用

当需要某只上市股票在**指定日期区间内的每日历史市值序列**，并据此做估值演变分析时使用，典型目标：

- 追踪市值随时间的变化、识别区间内的**峰值与谷值**。
- 计算市值的绝对/百分比涨跌、CAGR，评估波动与最大回撤。
- 追踪**市值规模分类**（大盘/巨型盘…）的变迁，或定位跨越 1/2/3 万亿等里程碑的时点。
- 跨期（YoY/QoQ/MoM）或多公司对比市值增长。

**不该用的边界：**

- 只要**当前实时市值**或综合报价快照——转 `octagon-stock-quote`（一次返回现价、市值、均线等）。
- 需要程序化批量拉取长周期 OHLCV 自建回测——转 `alpha-vantage-market-data`。
- 实盘下单、持仓撮合、风控执行——本条只读历史数据，不做交易。
- **离线 / 未配置 Octagon MCP** 的环境——依赖 `octagon-agent` 工具，无 MCP 无法取数。
- 结果供分析参考，不替代完整尽调、风控与人工复核。

## 步骤

1. **确认 MCP 就绪**：环境已配置 Octagon MCP，`octagon-agent` 工具可见（Windows 需先装 Node.js / npx，配置见「指令」）。
2. **确定查询参数**：
   - **Ticker**：股票代码（如 `AAPL`、`MSFT`）。
   - **Start Date / End Date**：日期区间起止。
   - **Limit**（可选）：最多返回的记录条数（如 1000）。
3. **发起查询**：调用 `octagon-agent`，用自然语言点名要历史市值数据 + 区间 + limit。
4. **读取序列**：每日市值（按交易日）、区间最高/最低/最近值与汇总统计。
5. **解读趋势**：用下方公式与表格算涨跌、CAGR、波动率、峰谷回撤、规模分类。
6. （可选）追加跨期或多标的对比查询。

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

API Key 在 https://app.octagonai.co 注册后于 API Keys 菜单生成；**Windows** 需先装 Node.js（含 npx）。

**MCP 调用：**

```json
{
  "server": "octagon-mcp",
  "toolName": "octagon-agent",
  "arguments": {
    "prompt": "Retrieve historical market capitalization data for AAPL from 2025-01-01 to 2025-04-30, limited to 1000 records."
  }
}
```

**查询模板：** `Retrieve historical market capitalization data for <TICKER> from <START_DATE> to <END_DATE>, limited to <LIMIT> records.`（数据源：`octagon-stock-data-agent`）

**核心公式：**

```
绝对变化   = 期末市值 - 期初市值
百分比变化 = (期末 - 期初) / 期初 × 100%
CAGR       = (期末 / 期初)^(1/年数) - 1
波动率(区间%) = (最高 - 最低) / 平均 × 100%
峰谷回撤   = (谷值 - 峰值) / 峰值 × 100%
```

**波动率分级（区间%）：** <20% 低 ｜ 20–40% 中 ｜ 40–60% 高 ｜ >60% 极高。

**市值规模分类：** >$200B 巨型盘 ｜ $10B–$200B 大盘 ｜ $2B–$10B 中盘 ｜ $300M–$2B 小盘。追踪分类在区间内的跨档变化即为规模变迁。

## 示例

查询 `AAPL` 2025-01-01 至 2025-04-30 的典型返回：

| 日期 | 市值（USD） |
|---|---|
| 2025-04-30 | $3.17 万亿（最近） |
| 2025-02-25 | $3.70 万亿（区间高点） |
| 2025-04-08 | $2.57 万亿（区间低点） |

**汇总统计：** 最高 $3.70T（02-25）｜ 最低 $2.57T（04-08）｜ 最近 $3.17T（04-30）。

**算例：** 区间 = 3.70 − 2.57 = $1.13T；峰谷回撤 = (2.57 − 3.70) / 3.70 ≈ **−30.5%**；波动率 ≈ 1.13 / 平均 ≈ **35%**，属**中–高波动**。

**更多查询写法：**

```
# 全年
Get historical market cap for MSFT for the entire year 2024.

# 单季度
Show TSLA's market cap history for Q1 2025.

# 多年趋势
Retrieve market cap history for NVDA from 2020 to 2025.

# 峰值定位
When did AAPL reach its highest market cap in 2024?

# 最大回撤
What was NVDA's biggest decline from peak in 2024?

# 里程碑
When did MSFT first cross $3 trillion market cap?

# 多公司对比
Compare the market cap growth of AAPL and MSFT over 5 years.
```

## 注意事项

- **复权一致性**：市值 = 价格 × 流通股本，确保数据为拆股调整后（split-adjusted），否则跨拆股日序列断裂。
- **仅交易日**：日期序列只含交易日，非自然日，算「年数」时按实际跨度而非简单除天数。
- **单点 vs 趋势**：峰谷为快照，趋势须结合整段序列；圆顶/V 型反转等形态需多点确认。
- **匹配周期**：把分析粒度（日/周/月/年）对齐投资视野——日看催化事件，年看长期轨迹与 CAGR。
- **关注里程碑**：1/2/3 万亿等整数关口具心理意义，常伴随显著行情，宜结合新闻定位催化。
- **API Key 安全**：Key 通过 `OCTAGON_API_KEY` 环境变量注入，勿硬编码；遇限流降低查询频率或缩小区间/limit。
- **结果定位**：历史市值供估值演变与下行风险分析，不替代尽调、回测与专家复核。

## 互见

- requires：（无）
- related：`octagon-stock-quote`（同源查当前市值/报价，与历史对照）、`alpha-vantage-market-data`（程序化拉历史 OHLCV/基本面自建序列）、`octagon-financial-growth-metrics`（同源财务增长指标，解释市值增长的盈利支撑）、`dcf-valuation-model`（把历史市值放进内在价值上下文）。
- combines_with：`octagon-stock-quote`（现值 vs 历史峰谷对比是否高/低估）、`dcf-valuation-model`（市值演变 + 估值模型评判贵贱）、`octagon-income-statement-data`（用利润表佐证市值变动的基本面驱动）、`octagon-financial-growth-metrics`（市值增速 vs 营收/利润增速一致性）。

---

本条采编自 OctagonAI/skills（MIT 许可），已做中文适配重写。
