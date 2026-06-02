---
name: octagon-forex-list
title: 全球外汇货币对清单查询
description: 当需要梳理全球外汇活跃交易货币对、区分主要/交叉/异国货币对并了解其流动性、点差、波动与驱动因素时使用；通过 Octagon MCP 的 octagon-agent 用自然语言拉取分类货币对清单并解读类别特征；不适用于实时报价、实盘下单或离线无 MCP。触发词：外汇货币对、major minor exotic、交叉盘、点差流动性、交易时段、octagon-agent
domain: 领域/fintech
triggers: [外汇货币对清单, major minor exotic, 交叉盘 cross pair, 异国货币对, 点差与流动性, 外汇交易时段, 货币对驱动因素, octagon-agent]
tags: [fintech, 外汇, forex, 货币对, 流动性, MCP, octagon]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Octagon MCP, octagon-agent, npx, Node.js]
requires: []
related: [octagon-commodities-quote, octagon-stock-quote, fx-carry-trade-eval, octagon-stock-price-change]
combines_with: [octagon-commodities-quote, fx-carry-trade-eval]
license: MIT
source: OctagonAI/skills
source_license: MIT
---
## 何时使用

当需要一份**全球外汇市场活跃交易货币对的分类清单**及配套背景时使用，覆盖：主要货币对（Majors，含 USD）、交叉货币对（Crosses，不含 USD）、异国货币对（Exotics，新兴市场），以及各类别的流动性、点差、波动性、交易时段与核心驱动因素。适合外汇市场入门梳理、选品（挑流动性/点差合适的货币对）、按时段排程、按驱动因素（如油价、避险情绪）筛选标的。

**不该用的边界：**

- 需要某货币对的**实时汇率/报价**（bid/ask、实时点位）——本条只给清单与结构，转 `octagon-stock-quote` 同类报价技能或 `alpha-vantage-market-data` 的外汇接口。
- 需要实盘下单、券商撮合、持仓与保证金管理——本条只读资料，不做交易。
- 需要历史 K 线/OHLCV 回测——属历史时间序列任务，转 `alpha-vantage-market-data`。
- **离线 / 未配置 Octagon MCP** 的环境——依赖 `octagon-agent` 工具，无 MCP 无法取数（可仅用下方静态分类表作离线参考）。
- 结果供研究参考，不构成投资建议，不能替代风控与人工复核。

## 步骤

1. **确认 MCP 就绪**：环境已配置 Octagon MCP，`octagon-agent` 工具可见（Windows 需先装 Node.js / npx；配置见「指令」）。
2. **界定范围**：先想清要看哪类——Majors（USD 主流盘）/ Crosses（非 USD 交叉盘）/ Exotics（新兴市场），还是按驱动因素（油价、避险）或交易时段筛。
3. **发起查询**：调用 `octagon-agent`，用自然语言点名要货币对清单（模板见「指令」）。
4. **读取分类结果**：返回为「货币对 + 活跃原因」表，按类别归并。
5. **解读类别特征**：对照下方流动性/点差/波动表，理解每类货币对的交易属性。
6. （可选）追加按时段或驱动因素的细分查询。

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
    "prompt": "Retrieve a full listing of actively traded currency pairs in the global forex market."
  }
}
```

数据源：`octagon-crypto-agent`、`octagon-web-search-agent`。

**常用查询模板（英文 prompt 命中率更高）：**

```
# 全量清单
Retrieve a full listing of actively traded currency pairs in the global forex market.

# 主要货币对
List the major currency pairs with USD.

# 交叉盘
What are the most liquid cross currency pairs?

# 异国货币对
List emerging market currency pairs.

# 按驱动因素筛选
Which currency pairs are most sensitive to oil prices?

# 按时段筛选
What pairs are most active during the Asian session?
```

**货币对分类（离线静态参考）：**

| 类别 | 代表货币对 | 别名/区域 |
|---|---|---|
| 主要（含 USD） | EUR/USD、GBP/USD、USD/JPY、USD/CHF、AUD/USD、USD/CAD、NZD/USD | Fiber / Cable / Gopher / Swissie / Aussie / Loonie / Kiwi |
| 交叉（非 USD） | EUR/GBP、EUR/JPY、EUR/CHF、GBP/JPY、AUD/JPY、AUD/NZD | 欧元交叉 / 日元交叉 / 商品交叉 |
| 异国（新兴市场） | USD/MXN、USD/ZAR、USD/TRY、USD/SGD、EUR/PLN、USD/HKD | 美洲 / 非洲 / 欧亚 / 亚洲 |

**基础概念：** 货币对写作 `基础货币/计价货币`，如 `EUR/USD = 1.10` 表示 1 EUR = 1.10 USD；汇率上涨=基础货币走强。点差 = Ask − Bid，即交易成本。

## 示例

查询「全量活跃货币对」的典型返回（节选）：

| 货币对 | 活跃原因 |
|---|---|
| EUR/USD | 流动性最强，欧元区与美国经济高度互联 |
| GBP/USD | 高流动性，对英美宏观数据敏感 |
| USD/JPY | 日元避险属性，受美国利率影响 |
| AUD/USD | 商品价格趋势，澳美经济周期 |
| USD/CHF | 瑞郎避险，美国货币政策 |
| AUD/NZD | 跨太平洋贸易，商品联动波动 |

**流动性 / 点差 / 波动速查：**

| 类别 | 流动性 | 典型点差 | 波动/可预测性 | 日均波幅参考 |
|---|---|---|---|---|
| 主要 | 很高（EUR/USD 最高） | 0.5–2 pips | 中等 / 较高 | EUR/USD 50–100 pips |
| 交叉 | 中等 | 2–5 pips | 不一 / 中等 | GBP/JPY 100–200 pips |
| 异国 | 较低 | 5–50+ pips | 高 / 较低 | 100–500+ pips |

**交易时段（UTC）与重叠期：** Sydney 21:00–06:00（AUD/NZD）、Tokyo 00:00–09:00（日元盘）、London 07:00–16:00（EUR/GBP）、New York 12:00–21:00（USD 盘）。**伦敦/纽约重叠**（EUR/USD、GBP/USD 波动最大），东京/伦敦重叠（EUR/JPY、GBP/JPY）。

## 注意事项

- **从主要货币对入手**：流动性最好、点差最窄，最适合新手与基准对比。
- **关注相关性**：EUR/USD 与 USD/CHF 常呈负相关，组合交易别重复押同一风险。
- **时段匹配货币对**：在货币对的活跃时段交易，流动性与点差更优。
- **算清成本**：异国货币对点差可达数十 pips，交易成本显著高于主流盘。
- **盯紧驱动因素**：央行政策（ECB/Fed/BoJ）、经济数据、地缘与避险情绪是主线；商品货币（AUD 看铁矿/黄金、CAD 看油价、NZD 看乳制品）受大宗联动。
- **API Key 安全**：Key 通过 `OCTAGON_API_KEY` 环境变量注入，勿硬编码；遇限流降低查询频率。
- **结果定位**：清单为研究参考，非实时报价、非投资建议，决策前须自行核验并做风控。

## 互见

- requires：（无）
- related：`octagon-stock-quote`（同源 octagon-agent 实时报价，含风险/避险情绪上下文）、`alpha-vantage-market-data`（程序化拉取外汇实时/历史汇率与 OHLCV）。
- combines_with：`alpha-vantage-market-data`（先用本条选定货币对，再用它拉实时/历史汇率做回测）、`octagon-stock-quote`（货币对清单 + 股指报价拼出全球宏观风险全景）。

---

本条采编自 OctagonAI/skills（MIT 许可），已做中文适配重写。
