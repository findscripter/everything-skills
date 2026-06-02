---
name: octagon-income-statement-data
title: 利润表数据检索
description: 当需要分析上市公司营收、净利润、稀释每股收益等利润表绝对值，或对比不同财年规模时使用；通过 Octagon MCP（octagon-agent）按 ticker / 记录数 / FY|Q 周期检索实时利润表并生成同比、净利率等观察；不适用于私有公司、估值倍数或资产负债表/现金流量表（用对应技能）。触发词：利润表、营收、净利润、EPS、income statement、Octagon。
domain: 领域/fintech
triggers: [利润表, 营收, 净利润, 稀释每股收益, EPS, income statement, Octagon, 财报数据, 净利率, 同比增长]
tags: [fintech, 财务数据, 利润表, Octagon-MCP, 上市公司, 基本面分析]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Octagon MCP (octagon-agent)]
requires: []
related: [octagon-cash-flow-statement-data, octagon-balance-sheet-data, octagon-financial-growth-metrics, octagon-equity-research-analyst]
combines_with: [octagon-cash-flow-statement-data, octagon-balance-sheet-data, three-statement-model]
license: MIT
source: OctagonAI/skills
source_license: MIT
---
## 何时使用

- 需要某上市公司的**利润表绝对值**：营收（Revenue）、净利润（Net Income）、稀释每股收益（EPS Diluted）。
- 分析历史盈利、跨财年/季度的规模变化，或与同行做体量对比。
- 想要同比增减、净利率（Net Income / Revenue）等可直接从数据算出的派生指标。

**不该用的边界：**

- 私有/未上市公司、无公开财报的主体 —— Octagon 覆盖的是公开市场数据。
- 估值倍数（P/E、P/S、EV）本身的检索：本技能只给出 EPS 等输入项，倍数需另行计算或检索。
- 资产负债表、现金流量表、利润率拆解（毛利率/营业利润率趋势）等：改用对应的财报技能或在跟进查询中追加。

## 步骤

1. **确认 MCP 已配置**：在 AI 客户端（Cursor / Claude Desktop / Windsurf）中接入 `octagon-mcp`，并确保 `octagon-agent` 工具可用。需 Octagon API Key（在 app.octagonai.co 的 API Keys 页生成）。
2. **构造查询**：按「ticker + 记录数 + 周期」三要素组织 prompt（见下方指令）。周期 `FY` 看年度战略视角，`Q` 看季节性与近期趋势。
3. **发起 MCP 调用**：调用 `octagon-agent`，prompt 用自然语言描述需求。
4. **解读输出**：返回一张含财年、营收、净利润、稀释 EPS 的表格（绝对值，单位 USD 或本币）。
5. **生成观察**：按下方「注意事项」中的观察模式补充同比、净利率、EPS 走势等结论。

## 指令

查询模板（英文 prompt 直接传给 agent，识别率最佳）：

```
Retrieve real-time income statement data for <TICKER>, limited to <N> records and filtered by period <FY|Q>.
```

MCP 调用示例：

```json
{
  "server": "octagon-mcp",
  "toolName": "octagon-agent",
  "arguments": {
    "prompt": "Retrieve real-time income statement data for AAPL, limited to 5 records and filtered by period FY"
  }
}
```

数据来源 agent：`octagon-financials-agent`。

**配置要点（保留源约束）：**

- Cursor 命令行：`env OCTAGON_API_KEY=<your-api-key> npx -y octagon-mcp`
- Windows 用：`cmd /c "set OCTAGON_API_KEY=<your-api-key> && npx -y octagon-mcp"`
- Claude Desktop / Windsurf 用 JSON 配置：`command: npx`，`args: ["-y", "octagon-mcp@latest"]`，并在 `env.OCTAGON_API_KEY` 填入密钥。
- 前置依赖：本机需安装 Node.js（自带 npm / npx）。

## 示例

典型返回（绝对值，单位 USD）：

| 财年 | 营收 (USD) | 净利润 (USD) | 稀释 EPS |
|------|-----------|-------------|---------|
| 2025 | $416,161,000,000 | $112,010,000,000 | 7.46 |
| 2024 | $391,035,000,000 | $93,736,000,000 | 6.08 |
| 2023 | $383,285,000,000 | $96,995,000,000 | 6.13 |

派生计算：

```
营收同比 = (本年 - 上年) / 上年 × 100
净利率   = 净利润 / 营收 × 100
盈利收益率 = EPS / 股价 × 100   # P/E 的倒数
```

示例：净利率 = $112B / $416B ≈ 26.9%；2025 营收同比 ≈ ($416B - $391B) / $391B ≈ 6.4%。

## 注意事项

- **观察模式**：拿到数据后建议固定输出五项 —— ①营收轨迹（算美元额与百分比同比）；②净利润趋势（绝对值口径）；③EPS 走势（扩张或收缩）；④净利率（净利润/营收）；⑤规模背景（与同行对比）。
- **数据质量**：净利润可能含一次性损益，对比 Operating Income 排除非经营项；EPS 可能因回购而增速快于净利润，需结合在外股本数解读。
- **周期一致性**：跨期对比要用同口径（Q1 比 Q1）以剔除季节性；`FY` 适合战略视角，`Q` 适合近期/季节趋势。
- **规模效应**：体量越大，维持同等百分比增长所需的绝对增量越大（大数定律）。
- **跟进查询**（可追加给 agent）：
  - "What factors contributed to the revenue growth in [YEAR]?"
  - "How does [COMPANY]'s [YEAR] net margin compare to industry peers?"
  - "Retrieve quarterly income statement data for [TICKER] to see seasonal patterns"
  - "Compare AAPL's revenue and net income to MSFT and GOOGL for FY 2025"

## 互见

- Octagon MCP 配置详情：源仓库 `references/mcp-setup.md`（含各客户端配置与 `octagon-scraper-agent` 等工具说明）。
- 结果解读与估值输入（P/E = Price / EPS、P/S = 市值 / 营收、DCF 基线）：源仓库 `references/interpreting-results.md`。
- 同领域（领域/fintech）可扩展：资产负债表、现金流量表、利润率趋势等姊妹技能。

---

采编自 OctagonAI/skills（MIT 许可）。
