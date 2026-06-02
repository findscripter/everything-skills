---
name: octagon-price-target-consensus
title: 分析师目标价共识
description: 当需要按 Ticker 评估某只股票的分析师目标价共识、判断上行/下行空间与分析师分歧度时使用；通过 Octagon MCP 的 octagon-agent 工具拉取共识/中位/最高/最低目标价，并结合现价算上涨空间、价差与偏度做解读；不适用于自建估值模型逐项重算内在价值、需历史目标价时序、或离线无 MCP 取数的场景。触发词：目标价、price target、共识目标价、分析师评级、上涨空间、octagon-agent
domain: 领域/fintech
triggers: [目标价, price target, 共识目标价, 分析师目标价, 上涨空间, 上行下行空间, octagon-agent, target high low]
tags: [fintech, 目标价, 分析师共识, 估值, 卖方研究, MCP, octagon]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Octagon MCP, octagon-agent, npx, Node.js]
requires: []
related: [octagon-ratings-snapshot, octagon-equity-research-analyst, octagon-stock-quote, octagon-financial-health-scores]
combines_with: [octagon-equity-research-analyst, octagon-stock-quote, octagon-ratings-snapshot]
license: MIT
source: OctagonAI/skills
source_license: MIT
---
## 何时使用

当需要快速了解某只股票的**卖方分析师目标价共识**，回答「分析师觉得它该值多少、相对现价有多少空间、分歧大不大」时使用。一次查询拿到四个标准化指标：

- **共识目标价（Consensus / Average）**：所有分析师目标价的均值，代表市场整体预期；缺点是被极值拉偏。
- **中位目标价（Median）**：50 分位，抗离群值，分布偏斜时比均值更可靠。
- **最高目标价（Target High）**：最乐观分析师 → 牛市情景 / 最大上行。
- **最低目标价（Target Low）**：最悲观分析师 → 熊市情景 / 下行风险。

**不该用的边界：**

- 需要**自建估值模型**、逐项重算内在价值或做敏感性分析——那是建模任务，转 `dcf-valuation-model` / `three-statement-model`，目标价只是分析师观点不是估值依据。
- 需要**历史目标价时序 / 趋势**（共识随时间如何变动）——本条只取当前快照，时序需另查 price-target-summary 类数据。
- **离线 / 未配置 Octagon MCP** 的环境——依赖 `octagon-agent` 工具，无 MCP 无法取数。
- 目标价是分析师**意见**，会滞后、会从众，不能替代基本面验证与人工判断。

## 步骤

1. **确认 MCP 就绪**：环境已配置 Octagon MCP，`octagon-agent` 工具可见（Windows 需先装 Node.js / npx；配置见「指令」）。
2. **确定标的 Ticker**（如 `AAPL`、`TSLA`、`NVDA`）。
3. **发起查询**：调用 `octagon-agent`，prompt 点名要 consensus price targets。
4. **读取四个指标**：共识、中位、最高、最低目标价（数据源 `octagon-stock-data-agent`）。
5. **结合现价算空间**（上涨空间 / 最大上行 / 下行风险，见公式表）。需要现价时用 `alpha-vantage-market-data` 等补齐。
6. **分歧度分析**：算价差百分比（Spread），按分区表判断分析师一致还是分裂。
7. **偏度判断**：比较共识与中位，识别牛/熊离群值导致的偏斜。
8. （可选）追加深挖：多标的横向对比、上行空间筛选、牛熊情景拉开度。

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

API Key 在 https://app.octagonai.co 注册后于 API Keys 菜单生成。

**MCP 调用：**

```json
{
  "server": "octagon-mcp",
  "toolName": "octagon-agent",
  "arguments": {
    "prompt": "Retrieve consensus price targets for the stock symbol AAPL."
  }
}
```

**查询模板：** `Retrieve consensus price targets for the stock symbol <TICKER>.`

**上行/下行空间公式（需现价）：**

```
共识上涨空间 = (共识目标价 - 现价) / 现价 × 100%
最大上行     = (最高目标价 - 现价) / 现价 × 100%
下行风险     = (最低目标价 - 现价) / 现价 × 100%
```

**分歧度（Spread）公式与分区：**

```
价差 Range = 最高目标价 - 最低目标价
Spread %   = Range / 共识目标价 × 100%
```

| Spread % | 解读 |
|---|---|
| < 20% | 共识强 —— 分析师高度一致 |
| 20–40% | 正常区间 |
| 40–60% | 中度分歧 —— 牛熊看法分裂 |
| > 60% | 高度不确定 |

**共识 vs 中位（偏度判断）：**

| 条件 | 含义 |
|---|---|
| 共识 > 中位 | 右偏（少数牛派离群值拉高均值） |
| 共识 < 中位 | 左偏（少数熊派离群值拉低均值） |
| 共识 ≈ 中位 | 分布大致对称，均值可靠 |

**何时用哪个：** 分布正常 / 看整体预期用**共识**；存在离群值 / 目标价偏斜时用**中位**。

**投资定位参考：**

| 现价位置 | 含义 |
|---|---|
| 现价 < 最低目标价 | 潜在深度价值，或市场已计入隐忧 |
| 现价 ≈ 共识目标价 | 大致合理估值 |
| 现价 > 最高目标价 | 可能高估 |

## 示例

查询 `AAPL` 的典型返回：

| 指标 | 值 |
|---|---|
| 共识目标价 | $303.11 |
| 中位目标价 | $315.00 |
| 最高目标价 | $350.00 |
| 最低目标价 | $220.00 |

数据源：`octagon-stock-data-agent`。

**解读（设现价 $270.01）：**

- 共识 $303.11 → +12.3% 上涨空间；中位 $315.00 → +16.7%；最高 $350.00 → +29.6% 最大上行；最低 $220.00 → −18.5% 下行风险。
- 价差 $130，Spread = 130 / 303.11 ≈ **42.9%** → 落在「中度分歧」区，牛熊差距显著。
- 共识 $303.11 < 中位 $315.00 → **左偏**，有熊派离群值把均值拉低，此时中位更具代表性。

**追问深挖（按需）：**

- `What is the consensus price target for TSLA and how does it compare to current price?`
- `What are the highest and lowest analyst price targets for NVDA?`
- `Compare consensus price targets for AAPL, MSFT, and GOOGL.`
- `What upside does the consensus target imply for AMZN?`

## 注意事项

- **离群值偏差**：共识（均值）易被极端目标价拉偏，偏斜时优先用中位做中心趋势判断。
- **目标价 ≠ 估值**：这是分析师意见的汇总，会滞后、会从众，务必与基本面（财报、现金流、护城河）交叉验证，勿单凭目标价决策。
- **时间维度**：分析师目标价通常是**12 个月前瞻**，且单期快照不代表趋势；判断情绪变化需看共识随时间的升降。
- **价差即不确定性**：价差宽 = 分歧大 / 不确定高，价差窄 = 共识强；仓位与价差成反比参考。
- **API Key 安全**：Key 通过 `OCTAGON_API_KEY` 环境变量注入，勿硬编码；遇限流降低查询频率。
- **结果定位**：用于快速估值体检与筛选信号，不能替代完整尽调与专家复核。

## 互见

- requires：（无）
- related：`octagon-financial-health-scores`（同源 Octagon 财务体检，判破产风险/财务强度）、`alpha-vantage-market-data`（拉取现价/基本面，算上行下行空间的现价输入）、`three-statement-model`（三表建模，理解目标价背后的盈利预期）。
- combines_with：`dcf-valuation-model`（共识目标价做初筛后，对标的做自下而上内在价值估值，互为校验）、`alpha-vantage-market-data`（补现价以完成上涨空间计算）、`portfolio-risk-metrics`（把目标价上行/下行纳入组合层风险收益评估）。

---

本条采编自 OctagonAI/skills（MIT 许可），已做中文适配重写。
