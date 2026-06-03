---
name: octagon-cash-flow-statement-data
title: 现金流量表数据检索
description: 当需要按 Ticker 拉取上市公司实时或历史现金流量表（净利润、经营/投资/筹资现金流、自由现金流、期末现金）并据此判断现金生成、资本配置与流动性趋势时使用；通过 Octagon MCP 的 octagon-agent 工具取数并输出多期对照表与关键观察；不适用于实盘下单、自建三表建模逐项重算或离线无 MCP 的场景。触发词：现金流量表、cash flow statement、经营现金流、自由现金流、FCF、资本开支、现金生成、octagon-agent
domain: 领域/fintech
triggers: [现金流量表, cash flow statement, 经营现金流, 自由现金流, FCF, 资本开支, 现金生成, octagon-agent]
tags: [fintech, 财务分析, 现金流, 自由现金流, 资本配置, mcp, octagon]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Octagon MCP, octagon-agent, npx, Node.js]
requires: []
related: [octagon-income-statement-data, octagon-balance-sheet-data, octagon-financial-health-scores, octagon-financial-growth-metrics]
combines_with: [octagon-income-statement-data, octagon-balance-sheet-data, dcf-valuation-model]
license: MIT
source: OctagonAI/skills
source_license: MIT
---
## 何时使用

当需要快速取得一家上市公司的**现金流量表数据**（多期），用于评估现金生成质量、资本配置（回购/分红/资本开支）与流动性趋势时使用。返回字段：净利润、经营现金流（OCF）、投资现金流、筹资现金流、自由现金流（FCF）、现金净变动、期末现金余额。

**不该用的边界：**

- **离线 / 未配置 Octagon MCP** 的环境——本条依赖 `octagon-agent` 工具取数，无 MCP 无法运行。
- 需要从原始三表逐项自建、复算或做敏感性分析——那是建模任务，应转 `three-statement-model` / `dcf-valuation-model`。
- 实盘下单或投资决策执行——本条只取数 + 解读，不下单。
- 取回为辅助分析信号，不能替代完整尽调与人工复核。

## 步骤

1. **确认 MCP 就绪**：环境已配置 Octagon MCP，`octagon-agent` 工具可见（Windows 需先装 Node.js / npx；配置见下「指令」）。
2. **确定标的 Ticker**（如 `AAPL`）、**记录数 N** 与**周期 FY/Q**（年报/季报）。
3. **发起查询**：调用 `octagon-agent`，prompt 套用下方模板。
4. **读取多期对照表**（净利润 / OCF / 投资 / 筹资 / FCF / 现金净变动 / 期末现金）。
5. **生成关键观察**：见下「关键观察清单」五条。
6. （可选）派生**资本开支** = OCF − FCF；算**现金转化率** = OCF / 净利润。
7. （可选）追加深挖查询（拆解筹资构成、资本开支趋势、同业 FCF 收益率对比）。

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

**查询模板：**

```
Retrieve real-time or historical cash flow statement data for <TICKER>, limited to <N> records and filtered by period <FY|Q>.
```

**MCP 调用：**

```json
{
  "server": "octagon-mcp",
  "toolName": "octagon-agent",
  "arguments": {
    "prompt": "Retrieve real-time or historical cash flow statement data for AAPL, limited to 5 records and filtered by period FY"
  }
}
```

数据源：`octagon-financials-agent`。

**关键观察清单（取数后逐条生成）：**

1. **经营现金流稳定性** —— OCF 相对净利润的走势。
2. **筹资流出** —— 回购与分红的规模与方向。
3. **自由现金流能力** —— 现金生成强度评估。
4. **资本开支趋势** —— 由 OCF − FCF 推导。
5. **现金头寸轨迹** —— 监控期末现金余额变化。

**派生计算与判读：**

```
现金转化率 = 经营现金流 / 净利润      # >1.0 盈利质量高；长期 <1.0 需警惕
资本开支   = 经营现金流 − 自由现金流  # 例：$111.48B − $98.77B = $12.71B
```

**可持续性信号：**

- 健康：OCF 持续 > 净利润；FCF 覆盖分红与回购；期末现金趋升。
- 警示：净利润增长但 OCF 下滑；FCF 为负仍持续回购；现金头寸侵蚀。

**三表勾稽：** 净利润来自利润表；期末现金接资产负债表；现金流变动解释资产负债表科目变化。

## 示例

查询 `AAPL`、5 期、FY 的典型返回（绝对值，USD）：

| 财年 | 净利润 | OCF | 投资CF | 筹资CF | FCF | 现金净变动 | 期末现金 |
|---|---|---|---|---|---|---|---|
| 2025 | $112.01B | $111.48B | $15.19B | -$120.69B | $98.77B | $5.99B | $35.93B |
| 2024 | $93.74B | $118.25B | $2.94B | -$121.98B | $108.81B | -$794.00M | $29.94B |
| 2023 | $96.99B | $110.54B | $3.71B | -$108.49B | $99.58B | $5.76B | $30.74B |

观察示例：OCF 持续 ≥ 净利润，盈利质量高；筹资端常年大额净流出（回购+分红），是典型成熟期资本返还。

**追问深挖（按需）：**

- "Break down AAPL's financing cash flow between buybacks, dividends, and debt activity"
- "What is AAPL's capital expenditure trend and guidance for next year?"
- "Compare AAPL's free cash flow yield to <PEER1> and <PEER2>"
- "Analyze AAPL's working capital changes driving operating cash flow"

## 注意事项

- **绝对值非比率**：返回为绝对金额，跨公司比较前需自行归一（按营收/市值/总资产）。
- **单点 vs 趋势**：单期现金流是快照，资本配置与可持续性判断应结合多期与同业，避免据一期定论。
- **派生口径**：资本开支由 OCF − FCF 推导而非直接科目，季节性/一次性项目可能扰动，必要时回看原始申报。
- **API Key 安全**：Key 经 `OCTAGON_API_KEY` 环境变量注入，勿硬编码；遇限流降低查询频率。
- **结果定位**：取数与观察是分析输入，不替代完整尽调、建模与专家复核。

## 互见

- requires：（无）
- related：`octagon-financial-health-scores`（现金流质量与破产/财务强度评分互补）、`alpha-vantage-market-data`（拉取行情/基本面原始数据）、`portfolio-risk-metrics`（组合层风险度量）。
- combines_with：`three-statement-model`（把现金流数据接入三表建模）、`dcf-valuation-model`（FCF 作为 DCF 估值核心输入）、`octagon-equity-research-analyst`（作为投研编排中的现金流取数子环节）。

---

本条采编自 OctagonAI/skills（MIT 许可），已做中文适配重写。
