---
name: octagon-ratings-snapshot
title: 公司评级与关键指标快照
description: 当需要对一只或多只上市公司股票做快速基本面初筛、横向质量对比或在尽调前打分排序时使用；通过 Octagon MCP 的 octagon-agent 工具按 Ticker 拉取综合评级（A–F）与 DCF、ROE、ROA、负债权益比、P/E、P/B 六项 1–5 分指标并据分区表解读；不适用于需自建模型逐项重算、做单标的深度估值或离线无 MCP 取数的场景。触发词：评级快照、ratings snapshot、股票打分、综合评级、基本面初筛、DCF/ROE/ROA 评分、同业对比、octagon-agent
domain: 领域/fintech
triggers: [评级快照, ratings snapshot, 股票打分, 综合评级, 基本面初筛, 同业对比, DCF评分, ROE评分, octagon-agent, 选股筛选]
tags: [fintech, 股票评级, 基本面分析, 选股筛选, 同业对比, mcp, octagon]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Octagon MCP, octagon-agent, npx, Node.js]
requires: []
related: [octagon-financial-health-scores, octagon-price-target-consensus, octagon-equity-research-analyst, octagon-esg-ratings]
combines_with: [octagon-equity-research-analyst, octagon-balance-sheet-data]
license: MIT
source: OctagonAI/skills
source_license: MIT
---
## 何时使用

当需要对**一只或多只上市公司股票**做**快速基本面体检与排序**时使用：一次调用即返回一个综合评级（A–F）加六项标准化指标评分（DCF、ROE、ROA、负债权益比、P/E、P/B，多为 1–5 分），适合：

- **选股初筛**：在一批 Ticker 里快速过滤，留下 A/B 级、多项高分的标的。
- **横向质量对比**：同业之间比评级，找行业内最佳标的（best-in-class）。
- **尽调前打分排序**：把候选池按评级排序，再决定对谁做深挖。

**不该用的边界：**

- 需要逐项**自建模型、复算每个指标或做敏感性分析**——那是建模任务，应转 `dcf-valuation-model` / `three-statement-model`。
- 想对**单一标的做深度内在价值估值**——评级只是快照信号，估值用 `dcf-valuation-model`。
- 需要破产风险 / 财务强度评分（Z-Score、Piotroski）——那是另一条，用 `octagon-financial-health-scores`。
- **离线 / 未配置 Octagon MCP** 的环境——本条依赖 `octagon-agent` 工具，无 MCP 无法取数。
- 评级是辅助筛选信号，不替代完整尽调与人工复核；务必做同业归一化，跨行业直接比分会误判。

## 步骤

1. **确认 MCP 就绪**：环境已配置 Octagon MCP，`octagon-agent` 工具可见（Windows 需先装 Node.js / npx；配置见下「指令」）。
2. **确定标的 Ticker**（单个或一组，如 `AAPL, MSFT, GOOGL`），并设定返回记录上限 `N`。
3. **发起查询**：调用 `octagon-agent`，prompt 明确点名要 ratings snapshot 及六项指标。
4. **读取综合评级 + 各组件分**（DCF、ROE、ROA、D/E、P/E、P/B）。
5. **按分区表解读**：综合评级看 A–F，组件分看 1–5，并做**优劣画像**（如高 ROE+高 ROA=高效经营；低 P/E+低 P/B=价值候选）。
6. **同业归一化**：在同一行业内做相对排名，识别 best-in-class；警惕「价值陷阱」（低质量+低估值）。
7. （可选）追加深挖查询：评级方法论、历史趋势、两标的明细对比。

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

API Key 在 https://app.octagonai.co （或 https://octagonagents.com）注册后于 API Keys 菜单生成。Windows 命令行临时启动可用 `cmd /c "set OCTAGON_API_KEY=<key> && npx -y octagon-mcp"`。

**MCP 调用：**

```json
{
  "server": "octagon-mcp",
  "toolName": "octagon-agent",
  "arguments": {
    "prompt": "Retrieve a ratings snapshot with overall rating and key metric scores (DCF, ROE, ROA, Debt-to-Equity, P/E, P/B) for AAPL, MSFT, GOOGL, limited to 10 records"
  }
}
```

**查询模板：** `Retrieve a ratings snapshot with overall rating and key metric scores (DCF, ROE, ROA, Debt-to-Equity, P/E, P/B) for <TICKER(S)>, limited to <N> records.`

数据源：`octagon-financials-agent`、`octagon-stock-data-agent`。

**综合评级（Overall Rating）分区：**

| 评级 | 解读 |
|---|---|
| A | 卓越 —— 顶级质量 |
| B | 良好 —— 高于平均 |
| C | 一般 —— 中等质量 |
| D | 偏弱 —— 存在隐忧 |
| F | 差 —— 重大问题 |

**组件分（通常 1–5，越高越好）分区：**

| 分数 | 解读 |
|---|---|
| 5 | 优秀 —— 顶部五分位 |
| 4 | 良好 —— 高于平均 |
| 3 | 一般 —— 居中 |
| 2 | 偏弱 —— 后半段 |
| 1 | 差 —— 底部五分位 |

**六项指标含义（高分 = 更优方向）：**

| 指标 | 衡量什么 | 高分意味着 |
|---|---|---|
| DCF | 内在价值 vs 市价 | 更被低估 |
| ROE | 净利润 / 股东权益 | 盈利能力更强 |
| ROA | 净利润 / 总资产 | 资产效率更高 |
| 负债权益比 D/E | 总负债 / 股东权益（杠杆） | 杠杆更低（更稳健） |
| P/E | 股价 / 每股收益 | 估值更具吸引力 |
| P/B | 市值 / 账面价值 | 估值更具吸引力 |

**画像解读（组合判断）：**

- 高 ROE + 高 ROA → 高效经营者。
- 低 D/E → 财务保守。
- 低 P/E + 低 P/B → 价值候选（但需排除「价值陷阱」）。
- 高 DCF → 可能被低估。
- 高盈利 + 高估值 = 质量溢价；低盈利 + 低估值 = 价值陷阱风险；高盈利 + 低估值 = 潜在机会。

## 示例

查询单标的的典型返回（表格形式）：

| 指标 | 评分 |
|---|---|
| 综合评级 | B |
| DCF（折现现金流） | 3 |
| ROE（净资产收益率） | 5 |
| ROA（总资产收益率） | 5 |
| 负债权益比 D/E | 1 |
| P/E（市盈率） | 2 |
| P/B（市净率） | 1 |

解读：综合 B（高于平均）；ROE/ROA 均 5 分 → 高效盈利的优质经营者；但 D/E、P/B 仅 1 分、P/E 2 分 → 杠杆偏高且估值偏贵，属「质量溢价」而非价值型，适合质量导向而非便宜捡漏。

**追问深挖（按需）：**

- "What specific ratings criteria are used to calculate these scores?"
- "What is the methodology for calculating the overall rating from component scores?"
- "Are there historical trends in these metrics for <COMPANY>?"
- "Compare detailed financial metrics for <TICKER1> vs <TICKER2>"

## 注意事项

- **同业归一化必做**：评级只在同行业内可比，跨行业（如银行 vs 软件）直接比分会严重误判；P/B 对轻资产公司、ROA 对重资产行业天然失真。
- **快照非趋势**：单期评级是时点画像，下结论前应结合历史趋势与同业相对排名。
- **方向需对齐**：D/E 等指标「高分 = 低杠杆 = 更好」，别把原始数值当评分；评分已统一为越高越优。
- **批量查询用 `limited to <N>`** 控制返回条数，避免一次拉过多标的导致结果冗长或超时。
- **API Key 安全**：Key 经 `OCTAGON_API_KEY` 环境变量注入，勿硬编码；遇限流降低查询频率。
- **结果定位**：评级是初筛/排序信号，不替代完整尽调、建模与专家复核；低分应触发进一步调查而非直接淘汰。

## 互见

- requires：（无）
- related：`octagon-financial-health-scores`（破产风险 / 财务强度评分，与本条评级互补）、`alpha-vantage-market-data`（拉取行情与基本面原始数据）、`three-statement-model`（三表建模为评分提供底层财务）、`portfolio-risk-metrics`（组合层风险度量）。
- combines_with：`dcf-valuation-model`（评级初筛后，对优质标的做内在价值估值深挖）、`portfolio-rebalancer`（按评级排序结果调整持仓权重）、`alpha-vantage-market-data`（补充市值 / 财报输入做交叉验证）。

---

本条采编自 OctagonAI/skills（MIT 许可），已做中文适配重写。
