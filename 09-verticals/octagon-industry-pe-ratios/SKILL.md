---
name: octagon-industry-pe-ratios
title: 行业市盈率对标分析
description: 当需要按细分行业+交易所获取行业 P/E、把个股估值对标同业、或横向比较多个细分行业估值时使用；通过 Octagon MCP（octagon-agent）按日期/交易所/行业检索行业市盈率并计算溢价折价；不适用于私有公司、单只个股 P/E 检索、宽口径板块均值或离线无 MCP 环境。触发词：行业市盈率、行业 P/E、同业对标、估值溢价、Semiconductors P/E、octagon-agent
domain: 领域/fintech
triggers: [行业市盈率, 行业 P/E, 同业对标, 估值溢价折价, 细分行业估值比较, Semiconductors P/E, octagon-agent, peer P/E]
tags: [fintech, 市盈率, 行业对标, 估值, 同业分析, mcp, octagon]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Octagon MCP, octagon-agent, npx, Node.js]
requires: []
related: [octagon-sector-pe-ratios, octagon-industry-performance-snapshot, octagon-batch-market-cap, octagon-historical-financial-ratings]
combines_with: [octagon-equity-research-analyst, octagon-company-market-cap, sector-landscape-report]
license: MIT
source: OctagonAI/skills
source_license: MIT
---
## 何时使用

当需要把个股估值放进**细分行业**（而非宽口径板块）的同业语境时使用，典型场景：

- 按「日期 + 交易所 + 行业」获取某细分行业的 **P/E 倍数**（如 NYSE 半导体行业 P/E）。
- 判断某只个股相对其行业是溢价还是折价（个股 P/E vs 行业 P/E）。
- 横向比较多个细分行业（半导体 / 软件 / 互联网）的估值高低，做行业轮动或择股。
- 并购、同业基准、行业筛选等需要「行业基线 P/E」作为锚点的分析。

**不该用的边界：**

- 需要**单只个股自身的 P/E** 检索 —— 本条给的是行业基线，个股 P/E 用 `octagon-stock-quote` 取价 + 利润表取 EPS 自行计算。
- 私有 / 未上市公司、无公开财报的主体 —— Octagon 覆盖公开市场数据。
- 只想要**宽口径板块（Sector）均值** —— 本条是更细的 Industry 层；板块层语境另用板块 P/E 类技能。
- **离线 / 未配置 Octagon MCP** 的环境 —— 依赖 `octagon-agent` 工具，无 MCP 无法取数。
- 结果供分析参考，不能替代尽调、风控与人工复核。

## 步骤

1. **确认 MCP 就绪**：AI 客户端（Cursor / Claude Desktop / Windsurf）已接入 `octagon-mcp`，`octagon-agent` 工具可见，且已配置 Octagon API Key（Windows 需先装 Node.js / npx，配置见「指令」）。
2. **确定三要素查询参数**：
   - **Date**：数据日期（如 `2025-02-03`）。
   - **Exchange**：交易所（`NYSE`、`NASDAQ` 等）。
   - **Industry**：细分行业（`Semiconductors`、`Software`、`Biotechnology` 等）。
3. **发起查询**：调用 `octagon-agent`，用自然语言传入上述参数。
4. **读取行业 P/E**：返回行业、交易所、P/E、日期及示例公司。
5. **对标计算**：用溢价/折价公式比较个股 P/E 与行业 P/E（见「指令」）。
6. （可选）追加多行业横比或历史趋势查询。

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

API Key 在 https://app.octagonai.co 注册后于 API Keys 菜单生成。**Windows** 需先装 Node.js（含 npx）；Cursor 命令行可用 `cmd /c "set OCTAGON_API_KEY=<key> && npx -y octagon-mcp"`。

**MCP 调用：**

```json
{
  "server": "octagon-mcp",
  "toolName": "octagon-agent",
  "arguments": {
    "prompt": "Retrieve the latest industry P/E ratios for 2025-02-03, filtered by exchange NYSE and industry Semiconductors."
  }
}
```

**查询模板：** `Retrieve the latest industry P/E ratios for <DATE>, filtered by exchange <EXCHANGE> and industry <INDUSTRY>.`

数据源 agent：`octagon-companies-agent`、`octagon-financials-agent`、`octagon-sec-agent`、`octagon-web-search-agent`。

**溢价/折价公式（个股相对行业的估值定位）：**

```
溢价/折价 = (个股 P/E - 行业 P/E) / 行业 P/E × 100%
```

| 比较 | 解读 |
|---|---|
| 个股 P/E < 行业 P/E | 潜在低估，或有隐忧（增长慢、风险高） |
| 个股 P/E ≈ 行业 P/E | 相对同业合理估值 |
| 个股 P/E > 行业 P/E | 为质量/增长付溢价 |

**层级（粗→细，越细对标越准）：** `Sector（板块）→ Industry（行业）→ Sub-Industry（细分）`。例：Technology → Semiconductors → Memory Chips。优先用 Industry 而非 Sector 做同业对标。

## 示例

查询 NYSE 半导体行业的典型返回：

| 字段 | 示例值 |
|---|---|
| 行业 | Semiconductors |
| 交易所 | NYSE |
| P/E | 12.47 |
| 日期 | 2025-02-03 |
| 示例公司 | ON Semiconductor (ON) |

溢价算例：某公司 P/E = 18，行业 P/E = 12.47 → (18 − 12.47) / 12.47 ≈ **+44.3%**，相对同业溢价交易。

**更多查询写法：**

```
# 指定交易所行业
Get P/E ratios for the Software industry on NASDAQ.

# 多行业横比
Compare P/E ratios for Semiconductors, Software, and Internet industries.

# 历史趋势
What is the historical P/E trend for the Biotechnology industry?

# 同业个股对标
Is AMD's P/E reasonable compared to the Semiconductor industry?
How does NVDA's valuation compare to semiconductor peers?
```

**常见行业典型 P/E 区间（仅作量级参考，非实时）：** 半导体 15–35、软件 25–50、互联网 30–60、生物科技 20–40（或 N/A）、制药 15–25、银行 10–15、零售 15–25、汽车 8–15。软件/生物科技/电商等因经常性收入、管线期权、增长预期而 P/E 偏高；银行/保险/公用事业/大宗商品因周期性、监管、低增长而 P/E 偏低。

## 注意事项

- **用行业而非板块**：Industry 层比 Sector 层对标更精确，必要时下钻到 Sub-Industry。
- **增长率匹配**：高增长支撑高 P/E，比较时把增速一并对齐，别只看倍数。
- **盈利结构**：亏损公司会扭曲行业均值（负 EPS 使 P/E 失真或被剔除），核对样本的盈利占比。
- **同口径对比**：业务模式相近才可比；大市值常带规模溢价，对比时考虑体量。
- **交易所差异**：同一行业在 NYSE 与 NASDAQ 的成分公司不同，P/E 均值会有差（NASDAQ 偏科技/成长，NYSE 偏多元/传统）。
- **API Key 安全**：Key 经 `OCTAGON_API_KEY` 环境变量注入，勿硬编码；遇限流降低查询频率。
- **结果定位**：行业 P/E 供估值参考，不能替代完整尽调、回测与专家复核。

## 互见

- requires：（无）
- related：`octagon-stock-quote`（取个股价与市值，配合 EPS 算个股 P/E）、`octagon-equity-research-analyst`（同源股票研究编排）、`octagon-financial-growth-metrics`（用增速解释行业 P/E 高低）、`octagon-price-target-consensus`（卖方目标价/隐含 P/E 交叉验证）。
- combines_with：`octagon-income-statement-data`（取 EPS，与行业 P/E 一起定位个股溢价折价）、`dcf-valuation-model`（行业 P/E 做相对估值，DCF 做绝对估值，相互印证）、`three-statement-model`（把行业基线接入完整建模）。

---

本条采编自 OctagonAI/skills（MIT 许可），已做中文适配重写。
