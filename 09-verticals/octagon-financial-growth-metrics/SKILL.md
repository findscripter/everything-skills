---
name: octagon-financial-growth-metrics
title: 财务同比增长指标
description: 当需要分析上市公司收入/利润/EPS/自由现金流的同比（YoY）增长趋势、横跨利润表与现金流量表诊断经营表现时使用；通过 Octagon MCP 的 octagon-agent 工具按 ticker 拉取多年 YoY 增长率表并输出增长洞察（峰值年、盈利与现金流背离、利润率扩张、回购信号）；不适用于绝对值财报建模、估值/DCF、单季实时行情或非美股无覆盖标的；触发词：同比增长、YoY growth、Octagon、财务指标趋势
domain: 领域/fintech
triggers: [同比增长, YoY growth, Octagon MCP, octagon-agent, 营收/净利润增长率, EPS 增长, 自由现金流增长, 财务指标趋势分析]
tags: [fintech, 财务分析, 同比增长, octagon, mcp, 基本面, 利润表, 现金流]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Octagon MCP, octagon-agent, npx]
requires: []
related: [octagon-income-statement-data, octagon-cash-flow-statement-data, octagon-balance-sheet-data, octagon-financial-health-scores]
combines_with: [octagon-equity-research-analyst, octagon-ratings-snapshot]
license: MIT
source: OctagonAI/skills
source_license: MIT
---
＃ 财务同比增长指标

通过 Octagon MCP 拉取上市公司关键财务指标的**同比（Year-over-Year）增长**，跨利润表与现金流量表诊断经营趋势：Revenue、Gross Profit、Operating Income、Net Income、EPS、Free Cash Flow。

## 何时使用

当用户想快速看清一家上市公司**多年来增长在加速还是失速、盈利质量好不好**时使用——一次拿到 6 大指标的 YoY 增长率表，再据此生成洞察（峰值年、盈利与现金流背离、利润率扩张、回购信号、收缩期）。

**不该用的边界：**
- 要绝对值财报（具体营收/利润数字）或三表建模 → 用 `three-statement-model`。
- 要估值、内在价值、贴现 → 用 `dcf-valuation-model`。
- 要实时股价/单季 tick/技术指标 → 用 `alpha-vantage-market-data`。
- 标的非 Octagon 覆盖范围（多为美股上市公司）或为私有公司 → 无数据，先确认 ticker 有效。
- 输出是 Agent 生成的分析参考，不能替代独立尽调与专业复核。

## 步骤

1. **配置 Octagon MCP**：确保 AI 客户端（Claude Desktop / Cursor / Windsurf）已注册 `octagon-mcp`，`octagon-agent` 工具可见。需要 `OCTAGON_API_KEY`（在 app.octagonai.co 申请）。
2. **构造查询**：按模板填 ticker、记录数 N、周期（FY 年度 / Q 季度）。
3. **调用 octagon-agent**：传入自然语言 prompt。
4. **读表**：得到逐年 YoY 增长率（正=增长，负=下滑）。
5. **生成洞察**：套用下方 5 类诊断模式。
6. **追问下钻**：按结果给出深挖问题。

## 指令

**MCP 配置（Claude Desktop 的 `claude_desktop_config.json`）：**

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

**查询模板：**

```
Retrieve year-over-year growth in key financial metrics for <TICKER>, limited to <N> records and filtered by period <FY|Q>.
```

**MCP 调用：**

```json
{
  "server": "octagon-mcp",
  "toolName": "octagon-agent",
  "arguments": {
    "prompt": "Retrieve year-over-year growth in key financial metrics for AAPL, limited to 5 records and filtered by period FY"
  }
}
```

**指标定义速查：**

| 指标 | 含义（YoY 变化）|
|------|------|
| Revenue Growth | 总营收同比变化 |
| Gross Profit Growth | 毛利（营收−COGS）同比变化 |
| Operating Income Growth | 经营利润同比变化 |
| Net Income Growth | 净利润同比变化 |
| EPS Growth | 每股收益同比变化 |
| Free Cash Flow Growth | 自由现金流（经营现金流−资本开支）同比变化 |

**5 类诊断模式：**

| 模式 | 判据 | 解读 |
|------|------|------|
| 全面优异 | 6 项均双位数正增长 | 各业务发力；查驱动因素（新品/市场/定价）与可持续性 |
| 盈利加速 | 净利增速 > 经营利润 > 毛利 > 营收 | 经营杠杆显著、成本优化 |
| 现金流背离 | 净利润增速 ≫ FCF 增速 | 警惕：营运资本占用、激进收入确认、一次性项目；查现金转化 |
| 回购信号 | EPS 增速 > 净利润增速 | 股份回购拉高每股口径；核对在外股本趋势 |
| 收缩期 | 多项指标转负 | 定位根因（需求/竞争/成本），判断是行业性还是公司特异，找复苏信号 |

## 示例

输出形如：

| Fiscal Year | Revenue | Gross Profit | Operating Income | Net Income | EPS | FCF |
|---|---|---|---|---|---|---|
| 2025 | 6.43% | 8.04% | 7.98% | 19.50% | 22.59% | -5.73% |
| 2024 | 2.02% | 6.82% | 7.80% | -3.36% | -0.81% | 6.98% |
| 2021 | 33.26% | 45.62% | 64.36% | 64.92% | 71.30% | 26.70% |

**读法**：2021 为峰值年（全面双位数+经营利润 64% > 营收 33%，强经营杠杆）；2025 净利 +19.5% 但 FCF −5.7%，属现金流背离，需查营运资本与资本开支；2025 EPS 22.6% > 净利 19.5%，回购在拉高每股。数据来源标注 `octagon-financials-agent`。

**追问下钻：**
- "What drove the significant <YEAR> growth spike?"
- "What explains <YEAR> net income growth despite lower free cash flow?"
- "Compare <COMPANY>'s growth metrics to <PEER1> and <PEER2>"

## 注意事项

- **覆盖范围**：主要为美股上市公司；非美股/私有公司多无数据，ticker 必须有效。
- **正负号**：正值=同比增长，负值=同比下滑。
- **周期一致**：FY（年度）与 Q（季度）口径不可混用对比；季度还需注意季节性。
- **API Key 安全**：`OCTAGON_API_KEY` 经环境变量/配置注入，勿硬编码或外泄；超频时降低请求频率。
- **EPS 陷阱**：EPS 增长可能全靠回购而非主业，务必结合净利润与在外股本一起看。
- 结论仅供分析参考，交易决策前需独立校验与风控复核。

## 互见

- related：`alpha-vantage-market-data` —— 要实时行情/绝对值财报字段时用它的 REST API。
- related：`three-statement-model` —— 需要三表绝对值与勾稽建模时。
- combines_with：`dcf-valuation-model` —— 增长趋势作为估值假设输入，串成「增长诊断 → 估值」链路。

---
采编自 OctagonAI/skills（MIT 许可），已做中文适配重写。
