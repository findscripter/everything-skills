---
name: octagon-stock-price-change
title: 多周期股价涨跌幅统计
description: 当需要某只股票从 1 日到 10 年乃至历史最高的多周期涨跌幅、判断动量与趋势一致性、做长短期对比时使用；通过 Octagon MCP 的 octagon-agent 按 Ticker 拉全周期收益统计并解读分类/年化/相对基准 alpha；不适用于实盘下单、逐笔 tick 高频或离线无 MCP。触发词：股价涨跌幅、多周期收益、年化收益、动量分析、近一年回报、octagon-agent
domain: 领域/fintech
triggers: [股价涨跌幅, 多周期收益, 年化收益, 动量分析, 近一年回报 10年累计回报, 趋势一致性, octagon-agent, AAPL 收益]
tags: [fintech, 股票收益, 涨跌幅, 动量, 年化收益, 相对强弱, MCP, octagon]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Octagon MCP, octagon-agent, npx, Node.js]
requires: []
related: [octagon-stock-quote, octagon-historical-market-cap, octagon-stock-grades, octagon-price-target-consensus]
combines_with: [octagon-equity-research-analyst, octagon-industry-performance-snapshot]
license: MIT
source: OctagonAI/skills
source_license: MIT
---
## 何时使用

当需要某只上市股票**跨多个时间周期的涨跌幅快照**时使用，一次返回 1 日 / 5 日 / 1 月 / 3 月 / 6 月 / 年初至今(YTD) / 1 年 / 3 年 / 5 年 / 10 年乃至历史最高(ATH) 的累计百分比收益。适合判断短期 vs 长期表现、识别动量与趋势一致性、做年化与相对基准的快速对比。

**不该用的边界：**

- 需要实盘下单、券商撮合、持仓调整——本条只读收益统计，不做交易。
- 逐笔 tick / 撮合级高频策略——返回的是周期累计收益，非分钟/秒级序列。
- 需要可回测的历史 OHLCV 时间序列——那是历史数据任务，转 `alpha-vantage-market-data`。
- 只想看当前价/市值/均线快照——用 `octagon-stock-quote`，本条聚焦的是多周期**收益率**。
- **离线 / 未配置 Octagon MCP** 的环境——依赖 `octagon-agent` 工具，无 MCP 无法取数。
- 结果供分析参考，不能替代完整尽调、风控与人工复核。

## 步骤

1. **确认 MCP 就绪**：环境已配置 Octagon MCP，`octagon-agent` 工具可见（Windows 需先装 Node.js / npx；配置见「指令」）。
2. **确定标的 Ticker**（如 `AAPL`、`MSFT`、`GOOGL`）。
3. **发起查询**：调用 `octagon-agent`，用自然语言点名要多周期涨跌幅统计。
4. **读取各周期收益**：短期(1日–3月)、中期(6月–1年)、长期(3年–10年/ATH)。
5. **解读**：按收益分类表评级 → 看趋势一致性与动量信号 → 必要时年化、算相对基准 alpha、算距 ATH 回撤。
6. （可选）追加多标的对比或指定周期的查询。

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

API Key 在 https://app.octagonai.co 注册后于 API Keys 菜单生成。**Windows** 需先装 Node.js（含 npx）。

**MCP 调用：**

```json
{
  "server": "octagon-mcp",
  "toolName": "octagon-agent",
  "arguments": {
    "prompt": "Get stock price change statistics for the symbol AAPL."
  }
}
```

**查询模板：** `Get stock price change statistics for the symbol <TICKER>.`（数据源：`octagon-stock-data-agent`）

**周期分组与用途：**

| 分组 | 周期 | 看什么 |
|---|---|---|
| 短期 | 1日 / 5日 / 1月 / 3月 | 日内动量、周/月/季趋势 |
| 中期 | 6月 / YTD / 1年 | 半年动量、年内表现、年度回报 |
| 长期 | 3年 / 5年 / 10年 / ATH | 商业周期、市场周期、长期趋势、自上市总回报 |

**收益分类（评级）：**

| 1 年收益 | 评级 | | 10 年收益 | 评级 |
|---|---|---|---|---|
| >50% | 卓越 | | >500% | 卓越 |
| 25–50% | 很强 | | 200–500% | 很强 |
| 10–25% | 强 | | 100–200% | 强 |
| 0–10% | 中性 | | 50–100% | 中性 |
| -10–0% | 偏弱 | | 0–50% | 低于平均 |
| <-10% | 差 | | <0% | 差 |

**趋势一致性 / 动量信号：**

| 形态 | 解读 |
|---|---|
| 各周期全为正 | 持续上升趋势 |
| 短期负、长期正 | 上升趋势中的回调 |
| 短期正、长期负 | 下降趋势中的反弹 |
| 各周期全为负 | 持续下降趋势 |
| 收益逐周期放大 / 收窄 | 动量加速 / 减速 |
| 周期间正负反转 | 趋势反转信号 |

**年化收益（长期收益做公平对比）：**

```
年化收益 = (1 + 总收益)^(1/年数) - 1
```
例：10 年累计 1043.14% → (1 + 10.4314)^(1/10) - 1 ≈ **27.3% / 年**。年化 >25% 卓越、15–25% 很强、10–15% 强、7–10% 接近市场、<7% 低于市场。

**相对基准 alpha：**

```
Alpha = 个股收益 - 基准收益
```
例：AAPL 1 年 +18.42%，S&P 500 +10% → alpha **+8.42%** 跑赢。基准可取 S&P 500（大盘）、行业 ETF（行业）、同业（竞争位置）。

**距历史最高(ATH)回撤：**

```
回撤 = (ATH价 - 现价) / ATH价 × 100%
```
0–10% 接近高点、10–20% 调整、20–40% 熊市区、>40% 深度下跌。

## 示例

查询 `AAPL` 的典型返回：

| 周期 | 涨跌幅 |
|---|---|
| 1 日 | 4.06% |
| 5 日 | 4.80% |
| 1 月 | -0.37% |
| 3 月 | -0.13% |
| 6 月 | 33.42% |
| YTD | -0.37% |
| 1 年 | 18.42% |
| 3 年 | 79.03% |
| 5 年 | 100.02% |
| 10 年 | 1,043.14% |
| 历史最高(ATH) | 210,270.08% |

**解读**：长期复利极强（10 年 +1043%，年化约 27%，评级卓越），但近月小幅回调 → 典型「上升趋势中的盘整/回调」，属健康形态（长 > 短）。

**更多查询写法：**

```
# 多标的对比
Compare price change statistics for AAPL, MSFT, and GOOGL.

# 指定周期
What is the 1-year and 5-year return for TSLA?

# 年内表现
What is the year-to-date performance of NVDA?

# 长期成长
What is the 10-year cumulative return for AMZN?

# 趋势判断
Is MSFT in an uptrend or downtrend based on recent returns?

# 动量检查
Is NVDA showing positive momentum in the short-term?
```

## 注意事项

- **勿据单一周期下结论**：始终多周期交叉看，警惕长短期信号背离（如长正短负=趋势走弱，长 << 短=均值回归风险，全负=基本面问题）。
- **价格收益 vs 总收益**：返回多为价格涨跌幅，未计股息再投资；高股息股的总回报会更高。
- **长期收益要年化**才能跨标的/跨周期公平比较。
- **收益须放进基准与一致性的语境**：平滑 vs 剧烈波动的同样收益含义不同；脱离基准的绝对收益意义有限。
- **API Key 安全**：Key 通过 `OCTAGON_API_KEY` 环境变量注入，勿硬编码；遇限流降低查询频率。
- **结果定位**：供分析参考，不能替代尽调、回测与专家复核。

## 互见

- requires：（无）
- related：`octagon-stock-quote`（同源实时报价/均线快照，看价不看多周期收益）、`alpha-vantage-market-data`（程序化拉历史 OHLCV 做回测）、`market-breadth-analyzer`（从个股收益扩到市场广度/动量）、`octagon-equity-research-analyst`（同源股票研究编排）。
- combines_with：`octagon-stock-quote`（收益看趋势 + 报价看当前位置/均线）、`octagon-financial-growth-metrics`（价格收益对照营收/利润成长，看涨幅是否有基本面支撑）、`portfolio-risk-metrics`（多标的多周期收益汇入组合层风险/回报度量）。

---

本条采编自 OctagonAI/skills（MIT 许可），已做中文适配重写。
