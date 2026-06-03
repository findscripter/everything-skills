---
name: octagon-financial-metrics-analysis
title: 利润表项目同比增长分析
description: 当需要诊断上市公司利润表各项（营收、营业成本、毛利、经营利润、净利润）的同比（YoY）增长、跨财年/季度比较经营表现时使用；通过 Octagon MCP 的 octagon-agent 按 Ticker 拉取多年逐项 YoY 增长率表并据「经营杠杆/利润率压缩/盈利加速」等模式输出趋势洞察与风险信号；不适用于绝对值财报、三表/估值建模、实时行情或非 Octagon 覆盖标的。触发词：利润表同比、YoY 增长、营收/净利润增速、Octagon、income statement growth
domain: 领域/fintech
triggers: [利润表同比增长, YoY income statement growth, 营收增速, 净利润增长率, 毛利/经营利润增长, Octagon MCP, octagon-agent, 经营杠杆分析]
tags: [fintech, 财务分析, 同比增长, 利润表, 基本面, 经营杠杆, octagon, mcp]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Octagon MCP, octagon-agent, npx, Node.js]
requires: []
related: [octagon-income-statement-growth, octagon-financial-growth-metrics, octagon-income-statement-data, octagon-cash-flow-growth]
combines_with: [octagon-income-statement-data, octagon-revenue-geographic-segmentation, octagon-equity-research-analyst]
license: MIT
source: OctagonAI/skills
source_license: MIT
---
＃ 利润表项目同比增长分析

通过 Octagon MCP 的 `octagon-agent` 工具，按 Ticker 拉取上市公司**利润表关键项的同比（Year-over-Year）增长**，逐年/逐季诊断经营趋势：Revenue、Cost of Revenue（COGS）、Gross Profit、Operating Income、Net Income。

## 何时使用

当用户想沿利润表从上到下看清一家上市公司**营收增速是否被成本侵蚀、毛利/经营利润/净利润谁快谁慢、经营杠杆是放大还是失效**时使用——一次拿到 5 个利润表项目的逐期 YoY 增长率表，再套用诊断模式输出洞察与红旗。

**不该用的边界：**
- 要绝对值财报数字（具体营收/成本/利润金额）或三表勾稽 → 用 `three-statement-model`。
- 要估值、内在价值、贴现现金流 → 用 `dcf-valuation-model`。
- 要 EPS / 自由现金流等跨现金流量表的增长口径 → 用 `octagon-financial-growth-metrics`（覆盖更广的 6 指标版）。
- 要实时股价 / 单季 tick / 技术指标 → 用 `alpha-vantage-market-data`。
- 标的非 Octagon 覆盖范围（多为美股上市公司）或为私有公司 → 无数据，先确认 ticker 有效。
- 输出是 Agent 生成的分析参考，不替代独立尽调与专业复核。

## 步骤

1. **确认 MCP 就绪**：AI 客户端（Claude Desktop / Cursor / Windsurf）已注册 `octagon-mcp`，`octagon-agent` 工具可见。需 `OCTAGON_API_KEY`（在 app.octagonai.co 申请；Windows 先装 Node.js / npx）。
2. **定参数**：Ticker（如 AAPL）、记录数 N（如 5 年）、周期（FY 年度 / Q 季度）。
3. **调用 octagon-agent**：按模板传入自然语言 prompt。
4. **读表**：得到逐期 5 项 YoY 增长率（正=增长，负=下滑）。
5. **套诊断模式**（见下表）生成洞察、排查红旗。
6. **按需追问下钻**。

## 指令

**MCP 配置（Claude Desktop 的 `claude_desktop_config.json`，Windsurf 用 `model_config.json` 同结构）：**

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

可用工具：`octagon-agent`（综合市场情报，本条用它）、`octagon-scraper-agent`、`octagon-deep-research-agent`。

**查询模板：**

```
Retrieve year-over-year growth in key income-statement items for <TICKER>, limited to <N> records and filtered by period <FY|Q>.
```

**MCP 调用：**

```json
{
  "server": "octagon-mcp",
  "toolName": "octagon-agent",
  "arguments": {
    "prompt": "Retrieve year-over-year growth in key income-statement items for AAPL, limited to 5 records and filtered by period FY"
  }
}
```

**指标定义速查：**

| 指标 | 含义（YoY 变化）|
|------|------|
| Revenue Growth | 总营收/销售额同比变化 |
| Cost of Revenue Growth | 直接成本（COGS）同比变化 |
| Gross Profit Growth | 毛利（营收−COGS）同比变化 |
| Operating Income Growth | 经营利润同比变化 |
| Net Income Growth | 净利润（最终利润）同比变化 |

**诊断模式（项目间相对增速比较）：**

| 模式 | 判据 | 解读 |
|------|------|------|
| 经营杠杆（正向）| 经营利润增速 > 营收增速 | 固定成本被更大营收摊薄，模式可扩展 |
| 利润率扩张（正向）| 毛利增速 > 营收增速 | 定价权或成本效率，竞争地位强 |
| 利润率压缩（警示）| 营业成本增速 > 营收增速 | 投入成本上升未传导给客户，定价承压 |
| 盈利加速（强信号）| 净利增速 > 经营利润 > 营收 | 各级利润同步改善，执行力强 |
| 营收减速（关注）| 营收增速逐年走低 | 可能市场饱和，需对比行业增速 |

## 示例

按 `FY` 拉取 5 期，输出形如：

| Year | Revenue | Cost of Revenue | Gross Profit | Operating Income | Net Income |
|------|---------|-----------------|--------------|------------------|------------|
| 2024 | 2.0% | 1.5% | 3.1% | 5.2% | 4.8% |
| 2023 | -2.8% | -1.2% | -4.5% | -8.1% | -10.2% |

**读法**：2024 毛利 3.1% > 营收 2.0%（利润率扩张），经营利润 5.2% > 营收（经营杠杆显效），净利 4.8% 同步向好；2023 全线转负且净利 −10.2% 跌幅大于营收 −2.8%（去杠杆/利润率压缩）。数据源标注 `octagon-companies-agent`、`octagon-financials-agent`。

**红旗排查：**
- 营收下滑、净利却上升 → 多半靠不可持续的削减成本。
- 全部指标连负 2 年以上 → 可能是结构性问题。
- 各期剧烈摇摆 → 执行不稳或会计存疑。
- 毛利增速持续慢于营业成本增速 → 定价权侵蚀。

**追问下钻：**
- "What drove the significant <YEAR> growth spike?"
- "Why did Net Income decline while Revenue grew in <YEAR>?"
- "Compare <COMPANY>'s income-statement growth to <PEER1> and <PEER2>"

## 注意事项

- **覆盖范围**：主要为美股上市公司；非美股/私有公司多无数据，ticker 必须有效。
- **正负号**：正值=同比增长，负值=同比下滑。
- **周期一致**：FY（年度）与 Q（季度）口径不可混用对比；季度还需注意季节性。
- **看相对而非绝对**：本条价值在「项目间增速谁快谁慢」，不要把 YoY 百分比当成绝对财报金额。
- **背离即信号**：营收与净利、毛利与成本的增速背离，往往是利润率/经营杠杆变化的早期线索，值得追问下钻或调阅财报。
- **API Key 安全**：`OCTAGON_API_KEY` 经环境变量/配置注入，勿硬编码或外泄；遇限流降低请求频率。
- 结论仅供分析参考，交易/信用决策前需独立校验与风控复核。

## 互见

- related：`octagon-financial-growth-metrics` —— 需要 EPS / 自由现金流等跨现金流量表的 6 指标增长版时用它。
- related：`alpha-vantage-market-data` —— 要实时行情/绝对值财报字段时用它的 REST API。
- related：`three-statement-model` —— 需要利润表绝对值与三表勾稽建模时。
- combines_with：`dcf-valuation-model` —— 把利润表增长趋势作为估值假设输入，串成「增长诊断 → 估值」链路。
- combines_with：`octagon-equity-research-analyst` —— 增长诊断并入股票研究报告。

---
本条采编自 OctagonAI/skills（MIT 许可），已做中文适配重写。
