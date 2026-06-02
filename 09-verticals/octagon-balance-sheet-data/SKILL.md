---
name: octagon-balance-sheet-data
title: 资产负债表数据检索
description: 当需要查询上市公司资产负债表（总资产、流动/非流动资产、总负债、股东权益、净负债）以分析财务状况、资本结构或杠杆水平时使用；通过 Octagon MCP 的 octagon-agent 工具按 ticker / 期数 / 条数拉取历史数据并生成结构化表格与趋势观察；不适用于实时报价、下单交易或未配置 Octagon MCP 的环境；触发词：资产负债表、总资产、净负债、资本结构
domain: 领域/fintech
triggers: [资产负债表, balance sheet, 总资产/总负债, 股东权益, 净负债 Net Debt, 资本结构/杠杆, Octagon MCP, octagon-agent]
tags: [fintech, 财务报表, 资产负债表, 财务分析, 杠杆, Octagon, MCP]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Octagon MCP, octagon-agent]
requires: []
related: [octagon-income-statement-data, octagon-cash-flow-statement-data, octagon-financial-growth-metrics, octagon-financial-health-scores]
combines_with: [octagon-equity-research-analyst, octagon-financial-health-scores]
license: MIT
source: OctagonAI/skills
source_license: MIT
---
## 何时使用

当用户需要检索**上市公司的资产负债表数据**并据此分析财务状况、资本结构或杠杆水平时使用。返回字段包括：总资产、流动资产、非流动资产、总负债、股东权益、净负债（Net Debt），支持按财年（FY）或季度（Q）拉取多期历史数据。

**不该用的边界：**
- 需要实时股价 / 报价、下单或券商撮合 —— 本技能只读历史财报，不做交易。
- 运行环境未配置 Octagon MCP（需先装好 `octagon-mcp` 并设置 `OCTAGON_API_KEY`），否则 `octagon-agent` 工具不可用。
- 需要利润表、现金流量表、增长率分解或同业对比时 —— 改用同源对应技能（见互见），本技能只覆盖资产负债表本表。
- 返回为分析参考，非可直接交易的权威数据，结论需自行复核。

## 步骤

1. **确认前置**：环境已配置 Octagon MCP（Cursor / Claude Desktop / Windsurf 等均可），`octagon-agent` 工具可见。配置方式见源仓库 `references/mcp-setup.md`：核心是 `OCTAGON_API_KEY=<key> npx -y octagon-mcp`。
2. **构造自然语言 prompt**：指定 ticker、条数 N、期数 FY/Q。
3. **调用 `octagon-agent` 工具**，由 octagon-financials-agent 返回表格。
4. **生成观察**：按资产规模变化、资产构成（流动 vs 非流动）、权益趋势、杠杆/净负债方向、资本结构比率五个角度总结。
5. **按需追问**：基于结果提出下钻问题。

## 指令

查询格式（自然语言模板）：

```
Retrieve detailed balance sheet statement data for <TICKER>, limited to <N> records and filtered by period <FY|Q>.
```

MCP 调用：

```json
{
  "server": "octagon-mcp",
  "toolName": "octagon-agent",
  "arguments": {
    "prompt": "Retrieve detailed balance sheet statement data for AAPL, limited to 5 records and filtered by period FY"
  }
}
```

**字段释义：**

| 指标 | 含义 |
|------|------|
| Total Assets 总资产 | 公司拥有的全部资源 |
| Total Current Assets 流动资产 | 一年内可变现的资产 |
| Total Non-Current Assets 非流动资产 | 长期资产（不动产/厂房/设备、无形资产、长期投资） |
| Total Liabilities 总负债 | 全部债务与义务 |
| Total Equity 股东权益 | 净资产 = 资产 − 负债 |
| Net Debt 净负债 | 总债务 − 现金及等价物 |

## 示例

输出形如（绝对值，单位百万美元）：

| Fiscal Year | Total Assets | Total Current Assets | Total Non-Current Assets | Total Liabilities | Total Equity | Net Debt |
|------|------|------|------|------|------|------|
| 2025 | 359,241 | 147,957 | 211,284 | 285,508 | 73,733 | 89,749 |
| 2024 | 364,980 | 152,987 | 211,993 | 308,030 | 56,950 | 89,116 |
| 2023 | 352,583 | 143,566 | 209,017 | 290,437 | 62,146 | 93,965 |

数据来源：octagon-financials-agent。

可从原始数据自行派生关键比率：

```
负债权益比 Debt-to-Equity = Total Liabilities / Total Equity
权益比率 Equity Ratio     = Total Equity / Total Assets
营运资本 Working Capital  = Current Assets - Current Liabilities
```

解读要点：净负债下降=去杠杆；净负债为负=净现金头寸（可对比 EBITDA 看杠杆背景）；资产向流动端倾斜=流动性增强，向非流动端倾斜=加大长期投入。

**追问示例（基于结果下钻）：**
- "[YEAR] 相比 [PRIOR YEAR] 总资产下降由哪些因素驱动？"
- "[COMPANY] 在 [YEAR1]–[YEAR2] 间资本配置策略如何演变？"
- "非流动资产的哪些具体科目在 [YEAR1]–[YEAR2] 间增长？"
- "把 [COMPANY] 的杠杆比率与 [PEER1]、[PEER2] 对比。"

## 注意事项

- **前置依赖**：未配置 Octagon MCP 或缺少 `OCTAGON_API_KEY` 时 `octagon-agent` 不可用；Windows 配置命令用 `cmd /c "set OCTAGON_API_KEY=<key> && npx -y octagon-mcp"`。
- **速率限制**：遇限流应降低查询频率。
- **单位与口径**：默认百万美元，跨期/跨公司对比前确认币种与单位一致。
- **数据时效**：财报为定期披露的历史数据，非实时；季度（Q）与财年（FY）口径勿混用。
- 输出仅供分析参考，不能替代环境特定的验证、回测或专家复核；缺少 ticker / 期数等必要输入时先停下确认。

## 互见

- related：`income-statement`、`cash-flow-statement` —— 三大报表互补，组成完整财务画像。
- related：`balance-sheet-growth`、`financial-growth` —— 在本表基础上看增长率与趋势分解。
- combines_with：`dcf-valuation-model`、`three-statement-model` —— 资产负债表数据是估值与三表建模的输入。
- related：`alpha-vantage-market-data` —— 另一条 fintech 财务数据获取通道（REST API）。

---
采编自 OctagonAI/skills（MIT 许可），已做中文适配重写。
