---
name: octagon-commodities-quote
title: 大宗商品实时报价查询
description: 当需要查贵金属/能源/有色/农产品等大宗商品当前价、涨跌、当日与52周区间、50/200日均线、成交量时使用；通过 Octagon MCP 的 octagon-agent 按商品代码拉实时报价并解读区间位置、均线趋势与量价信号；不适用于实盘下单、毫秒级逐笔高频或离线无 MCP。触发词：大宗商品报价、黄金价格、原油行情、商品代码、移动均线、octagon-agent
domain: 领域/fintech
triggers: [大宗商品报价, 黄金价格 白银价格, 原油 天然气行情, GCUSD CLUSD 商品代码, 50日均线 200日均线, 52周区间 当日区间, octagon-agent, 贵金属比价]
tags: [fintech, 大宗商品, 行情报价, 贵金属, 能源, 技术指标, 移动均线, MCP, octagon]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Octagon MCP, octagon-agent, npx, Node.js]
requires: []
related: [octagon-stock-quote, octagon-forex-list, octagon-industry-performance-snapshot, octagon-stock-price-change]
combines_with: [octagon-stock-quote, octagon-forex-list, macro-rates-dashboard]
license: MIT
source: OctagonAI/skills
source_license: MIT
---
## 何时使用

当需要某种**大宗商品的实时综合报价快照**时使用，覆盖贵金属、能源、有色/基本金属、农产品。一次返回：当前价、涨跌额/涨跌幅、当日区间（最高/最低）、52 周区间、50 日与 200 日移动均线、成交量、前收盘。适合盘前盘中速查商品价格、贵金属/油气比价、趋势与区间位置判断。

**不该用的边界：**

- 需要实盘期货下单、撮合或持仓管理——本条只读行情，不做交易。
- 毫秒级逐笔 / 撮合级数据的高频策略——报价为实时或约 15 分钟延迟，非 tick 级。
- 需要历史时间序列（OHLCV 回测、长周期走势、季节性）——那是历史数据任务，转 `alpha-vantage-market-data` 或 Octagon 历史行情技能。
- **离线 / 未配置 Octagon MCP** 的环境——依赖 `octagon-agent` 工具，无 MCP 无法取数。
- 结果供辅助分析，不能替代完整尽调、风控与人工复核。

## 步骤

1. **确认 MCP 就绪**：环境已配置 Octagon MCP，`octagon-agent` 工具可见（Windows 需先装 Node.js / npx；配置见「指令」）。
2. **确定商品代码**（如黄金 `GCUSD`、原油 `CLUSD`、天然气 `NGUSD`，对照下方代码表）。
3. **发起查询**：调用 `octagon-agent`，用自然语言点名要实时报价。
4. **读取报价字段**：当前价、涨跌、当日/52 周区间、50/200 日均线、成交量、前收盘。
5. **解读区间位置、均线趋势与量价信号**（见下表与公式）。
6. （可选）追加多商品比价或针对单一指标的追问。

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
    "prompt": "Retrieve the real-time price quote for GCUSD."
  }
}
```

**查询模板：** `Retrieve the real-time price quote for <SYMBOL>.`（数据源：`octagon-stock-data-agent`）

**常用商品代码：**

| 类别 | 代码 → 商品 |
|---|---|
| 贵金属 | GCUSD 黄金 · SIUSD 白银 · PLUSD 铂金 · PAUSD 钯金 |
| 能源 | CLUSD WTI 原油 · BZUSD 布伦特原油 · NGUSD 天然气 · HOUSD 取暖油 · RBUSD 汽油(RBOB) |
| 基本金属 | HGUSD 铜 · ALUSD 铝 · ZNUSD 锌 · NIUSD 镍 |
| 农产品 | ZCUSD 玉米 · ZSUSD 大豆 · ZWUSD 小麦 · KCUSD 咖啡 · SBUSD 糖 · CTUSD 棉花 |

**区间位置公式（判断强弱）：**

```
当日区间位置  = (当前价 - 当日最低) / (当日最高 - 当日最低) × 100%
52周区间位置 = (当前价 - 52周最低) / (52周最高 - 52周最低) × 100%
```

**移动均线信号：**

| 条件 | 解读 |
|---|---|
| 价 > 50 日 > 200 日 | 强势上升趋势 |
| 价 > 200 日 > 50 日 | 修复反弹中 |
| 价 < 200 日 < 50 日 | 下降趋势初期 |
| 价 < 50 日 < 200 日 | 强势下降趋势 |
| 50 日上穿 200 日（金叉） | 偏多 |
| 50 日下穿 200 日（死叉） | 偏空 |

**量价配合：** 放量上涨 = 买盘有力；放量下跌 = 卖压重；缩量上涨多为弱反弹，缩量下跌为弱势回落；成交量异常放大（spike）多伴随催化事件。

**各品种关键驱动（基本面背景）：** 黄金——美元强弱（反向）、利率（升息利空）、通胀对冲、避险；原油——OPEC 减/增产、经济增长（需求）、每周库存数据、地缘供应风险；天然气——天气（取暖/制冷）、库存水平、页岩产量、LNG 出口。

## 示例

查询黄金 `GCUSD` 的典型返回：

| 指标 | 示例值 |
|---|---|
| 当前价 | $4,864.20 |
| 涨跌 | +$211.60（+4.55%） |
| 当日区间 | $4,690.20 – $4,871.00 |
| 52 周区间 | $2,837.40 – $5,626.80 |
| 50 日均线 | $4,559.45 |
| 200 日均线 | $3,888.90 |
| 成交量 | 18,846 |
| 前收盘 | $4,652.60 |

区间位置算例：当日 (4,864.20 − 4,690.20) / (4,871.00 − 4,690.20) = **96.2%**，逼近当日高点，偏强；52 周 (4,864.20 − 2,837.40) / (5,626.80 − 2,837.40) = **72.6%**，处区间上部。价 > 50 日 > 200 日，强势上升趋势确认。

**更多查询写法：**

```
# 单品种
Get the current price for silver (SIUSD).
What is the current price of crude oil (CLUSD)?

# 多品种比价
Compare current prices for gold, silver, and platinum.

# 趋势/区间追问
Is crude oil above or below its 200-day average?
Where is silver relative to its 52-week range?

# 动能速查
Is natural gas showing strength today?
```

## 注意事项

- **数据新鲜度**：盘中为实时或约 15 分钟延迟；商品期货分主力合约/连续合约，留意报价对应的合约口径。
- **单点 vs 趋势**：报价是快照，趋势判断须结合均线与历史，勿据一价定论。
- **量价配合**：高成交量确认价格动作；缩量上涨多为弱反弹，难持续。
- **异常警示**：无消息却大幅波动（如 >10%）、宽价差、流动性骤降，均为风险信号，需查催化事件。
- **品种共性比价**：金/银、WTI/布伦特等同族品种对照看，能识别背离与套利线索。
- **API Key 安全**：Key 通过 `OCTAGON_API_KEY` 环境变量注入，勿硬编码；遇限流降低查询频率。
- **结果定位**：报价供分析参考，不能替代尽调、回测与专家复核。

## 互见

- requires：（无）
- related：`octagon-stock-quote`（同源、同接口的股票实时报价）、`alpha-vantage-market-data`（程序化拉取行情/历史 OHLCV）、`octagon-equity-research-analyst`（同源研究编排，含能源板块上下文）。
- combines_with：`octagon-stock-quote`（商品 + 个股报价并看，做跨资产联动）、`alpha-vantage-market-data`（实时快照 + 历史序列做回测/季节性）、`portfolio-risk-metrics`（多商品报价汇入组合层风险度量）。

---

本条采编自 OctagonAI/skills（MIT 许可），已做中文适配重写。
