---
name: octagon-prediction-markets-research
title: 预测市场事件研究
description: 当需要对 Kalshi 预测市场某个事件做深度研究、对比市场价隐含概率与模型概率、定位错误定价或盘前研判催化剂时使用；做法是调用 Octagon MCP 的 octagon-prediction-markets-agent 生成结构化研报（市场概览/价格驱动/催化剂日历/历史结算/合约盘口/交易建议），并用 prediction_markets_history 取历史数据；不适用于实盘下单撮合、Polymarket（暂未支持）或离线无 MCP。触发词：预测市场、prediction market、Kalshi、错误定价、mispricing、事件概率、催化剂、Octagon
domain: 领域/fintech
triggers: [预测市场, prediction market, Kalshi, 错误定价, mispricing, 事件概率, 市场隐含概率, 催化剂日历, octagon-prediction-markets-agent, prediction_markets_history]
tags: [fintech, 预测市场, kalshi, 事件研究, 错误定价, 概率建模, mcp, octagon]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Octagon MCP, octagon-prediction-markets-agent, prediction_markets_history, npx, Node.js]
requires: []
related: [octagon-equity-research-analyst, octagon-sec-risk-factors, news-sentiment-briefing, macro-regime-detector]
combines_with: [news-sentiment-briefing, octagon-equity-research-analyst]
license: MIT
source: OctagonAI/skills
source_license: MIT
---
## 何时使用

当需要对一个**预测市场事件**（目前仅 Kalshi）做带数据支撑的研究时使用：

- 想知道**市场报价是否定价错误**——把众人共识价（市场隐含概率）和模型独立测算的概率作对比，找交易机会。
- **盘前研究**：下注前先搞清驱动该合约价格的关键因素与基准率（历史结算结果）。
- **催化剂监控**：盯住未来可能让合约价格翻转的事件（数据发布、会议、裁决等）。
- 想要一份**结构化、可溯源**的事件研报（覆盖政治、经济、加密、体育、娱乐、科技、气候 120+ 活跃市场）。

**不该用的边界：**

- **实盘下单 / 券商撮合 / 交易执行**——本条只做研究与建议，不下单。
- **Polymarket**——暂未支持（Coming soon），目前只覆盖 **Kalshi**。
- **离线 / 未配置 Octagon MCP** 的环境——本条依赖 MCP 工具，无 MCP 无法取数。
- 结论是辅助决策信号，不替代独立判断、风控与仓位管理。

**前置约束：** 报告**生成**需要 Octagon Plus / Pro / Enterprise 订阅（**每份 3 credits**）；**缓存报告对所有用户免费**。

## 步骤

1. **确认 MCP 就绪**：环境已配置 Octagon MCP，`octagon-prediction-markets-agent` 工具可见（Windows 需先装 Node.js / npx；配置见下「指令」）。
2. **拿到目标市场的 Kalshi URL**（如 `https://kalshi.com/markets/kxfeddecision/...`）或 Ticker。
3. **选择变体**（按时效需求，见下表）：默认 / `:cache` / `:refresh`。
4. **发起查询**：把 URL 直接给 agent，让其生成研报。
5. **读研报六节**：市场概览 → 价格驱动 → 关键催化剂 → 历史结算 → 合约盘口 → 交易建议。
6. **重点看模型 vs 市场价差**：价差越大，潜在错误定价信号越强。
7. （可选）用 `prediction_markets_history` 取该 Ticker 的历史数据，看概率走势与基准率。
8. **下注前**用 `:refresh` 拉一份最新报告，并核对成交量/未平仓量（OI）判断流动性再定仓位。

**模型变体（控制缓存行为）：**

| 变体 | 行为 | 适用 |
|---|---|---|
| `octagon-prediction-markets-agent` | 默认：有缓存返缓存，否则现生成 | 通用 |
| `octagon-prediction-markets-agent:cache` | 始终取缓存报告 | 最快，可能非最新 |
| `octagon-prediction-markets-agent:refresh` | 始终现生成新报告 | 最新，耗时数分钟 |

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

API Key 在 https://app.octagonai.co 注册后于 API Keys 菜单生成。也支持远程 MCP：`https://mcp.octagonagents.com/mcp`（OAuth，推荐）。

**生成研报：** 直接把 Kalshi URL 交给 agent 即可，例如：

```
Analyze this Fed decision prediction market: https://kalshi.com/markets/kxfeddecision/fed-meeting/kxfeddecision-26jun
```

强制重生成（绕过缓存）：

```
Generate a fresh report (bypass cache) for: https://kalshi.com/markets/kxbtcminy/.../kxbtcminy-27jan01
```

**取历史数据（`prediction_markets_history` 工具）：**

```
Fetch historical data for prediction market ticker KXFEDDECISION-26JUN from January to June 2026
```

参数：`ticker`（市场代码）、`captured_from`（起始日期）、`captured_to`（结束日期）、`limit`（记录数）、`cursor`（分页游标）。

**研报结构（agent 产出的固定六节）：**

1. **市场概览（Market Overview）**：事件、结算日、当前市场价、模型概率、错误定价信号。
2. **价格驱动（Price Drivers）**：影响当前定价的关键因素（经济数据、政策表态、基本面等）。
3. **关键催化剂（Key Catalysts）**：日期 × 事件 × 潜在影响（哪些事件可能让概率移动 5–10%）。
4. **历史结算（Historical Resolution Context）**：同系列过往结算结果与模型准确率，提供基准率参照。
5. **合约盘口（Contract Details）**：各结果的 Bid / Ask / Last / Volume / Open Interest。
6. **交易建议（Recommendation）**：模型相对市场的高估/低估幅度与方向建议。

## 示例

**研报片段（Fed 6 月决议）：**

```markdown
## Market Overview
- Event: Fed Decision June 2026
- Resolution Date: June 18, 2026
- Current Market Price: 72% (Hold rates)
- Model Probability: 68%
- Mispricing Signal: Market slightly overpriced

## Contract Details
| Outcome | Bid | Ask | Last | Volume | OI |
|---------|-----|-----|------|--------|-----|
| Hold    | 0.71| 0.73| 0.72 | 15,234 | 89,000 |
| Cut 25bp| 0.18| 0.20| 0.19 | 8,456  | 45,000 |

## Recommendation
Slight Sell on Hold contract. 模型见 4% 高估，建议等 CPI 数据再建仓。
```

**各类查询模板（把 URL 换成目标市场）：**

```
# 加密价格区间
Research this Bitcoin price prediction market: https://kalshi.com/markets/kxbtcminy/.../kxbtcminy-27jan01
# 体育对阵
Analyze this NHL playoff prediction market: https://kalshi.com/markets/kxnhleast/.../kxnhleast-26
# IPO 时点
Analyze when SpaceX will IPO: https://kalshi.com/markets/kxipospacex/when-will-spacex-ipo/kxipospacex
```

## 注意事项

- **先看模型 vs 市场价差**：价差大才是潜在错误定价；价差小不值得动手。
- **盯催化剂日历**：知道哪些「翻转性事件」何时发生，临近时再决策。
- **看结算历史**：同系列过往准确率是当前概率的参照系，别只看单点报价。
- **核流动性**：建仓前查成交量与未平仓量（OI），流动性差则收紧仓位。
- **用好缓存**：`:cache` 适合快速查看，`:refresh` 用在真正下单前（耗时数分钟、消耗 credits）。
- **订阅与计费**：报告生成需 Plus/Pro/Enterprise，每份 3 credits；缓存免费。遇限流降低查询频率。
- **API Key 安全**：通过 `OCTAGON_API_KEY` 环境变量注入，勿硬编码。
- **平台范围**：当前只支持 Kalshi，Polymarket 尚未上线，勿对其它平台 URL 期待结果。
- **结果定位**：研报是带来源的研判信号，不是投资建议，最终决策与风控自负。

## 互见

- requires：无硬前置；但运行依赖已配置好的 **Octagon MCP**。
- related：`octagon-financial-health-scores`、`octagon-equity-research-analyst`、`portfolio-risk-metrics`——可在事件研究外补财务/估值/组合风险维度。
- combines_with：`octagon-equity-research-analyst`（把个股财报研判与相关事件市场概率交叉验证）、`octagon-financial-health-scores`（评估事件标的公司基本面强弱）、`portfolio-risk-metrics`（把事件下注的胜率/赔率纳入组合层风险度量）。

---

本条采编自 OctagonAI/skills（MIT 许可），已做中文适配重写。
