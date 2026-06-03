---
name: octagon-income-statement-growth
title: 利润表项目同比增长
description: 当需要诊断上市公司利润表 5 项核心指标（营收/毛利/经营利润/净利润/摊薄 EPS）的同比（YoY）增长趋势、定位盈利拐点时使用；通过 Octagon MCP 的 octagon-agent 按 ticker 拉取多年 YoY 增长率表并产出盈利洞察（加速年、利润率背离、EPS 与净利差异、收缩期）；不适用于绝对值财报建模、估值/DCF、实时行情、现金流/资产负债表项或非美股无覆盖标的；触发词：利润表增长、income statement growth、Octagon
domain: 领域/fintech
triggers: [利润表同比增长, income statement growth, Octagon MCP, octagon-agent, 营收/净利润增长率, EPS Diluted 增长, 盈利拐点分析, FY/Q 增长率表]
tags: [fintech, 财务分析, 同比增长, 利润表, octagon, mcp, 基本面, 盈利能力]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Octagon MCP, octagon-agent, npx]
requires: []
related: [octagon-income-statement-data, octagon-financial-metrics-analysis, octagon-balance-sheet-growth, octagon-cash-flow-growth]
combines_with: [octagon-financial-health-scores, octagon-equity-research-analyst]
license: MIT
source: OctagonAI/skills
source_license: MIT
---
＃ 利润表项目同比增长

通过 Octagon MCP 拉取上市公司**利润表 5 项核心指标的同比（Year-over-Year）增长率**，专注盈利链路从上到下逐层诊断：Revenue → Gross Profit → Operating Income → Net Income → EPS Diluted。

## 何时使用

当用户想快速看清一家上市公司**利润表自上而下哪一层在加速/失速、盈利质量与利润率如何演变**时使用——一次拿到 5 项 YoY 增长率表，据此判断增长加速、利润率扩张/收缩、回购对 EPS 的拉动，以及盈利拐点。

**不该用的边界：**
- 要把现金流（自由现金流增长等）一起纳入、做跨三表增长诊断 → 用 `octagon-financial-growth-metrics`（更宽口径）。
- 要绝对值财报字段（具体营收/利润数字）→ 用 `octagon-income-statement-data`。
- 要估值、内在价值、贴现 → 用 DCF/估值类技能。
- 要实时股价/单季 tick/技术指标 → 用行情类技能。
- 标的非 Octagon 覆盖范围（多为美股上市公司）或为私有公司 → 无数据，先确认 ticker 有效。
- 输出是 Agent 生成的分析参考，不能替代独立尽调与专业复核。

## 步骤

1. **配置 Octagon MCP**：确保 AI 客户端（Claude Desktop / Cursor / Windsurf）已注册 `octagon-mcp`，`octagon-agent` 工具可见。需 `OCTAGON_API_KEY`（在 app.octagonai.co 申请，环境变量/配置注入）。
2. **构造查询**：按模板填 ticker、记录数 N、周期（FY 年度 / Q 季度）。
3. **调用 octagon-agent**：传入自然语言 prompt。
4. **读表**：得到逐年 5 项 YoY 增长率（正=增长，负=下滑）。
5. **生成洞察**：套用下方 4 类诊断模式。
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

Windows 命令行式注册可用：`cmd /c "set OCTAGON_API_KEY=<your-api-key> && npx -y octagon-mcp"`。

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
| Revenue Growth | 总营收（销售额）同比变化 |
| Gross Profit Growth | 毛利（营收 − 销货成本 COGS）同比变化 |
| Operating Income Growth | 核心经营利润同比变化 |
| Net Income Growth | 扣除全部费用后的净利润（底线）同比变化 |
| EPS Diluted Growth | 摊薄每股收益（完全稀释）同比变化 |

**4 类诊断模式：**

| 模式 | 判据 | 解读 |
|------|------|------|
| 增长加速 | 各项普遍走强、连续多年正增长 | 各业务发力；查驱动（新品/市场/定价）与可持续性 |
| 利润率扩张 | 毛利增速 > 营收增速；或经营利润增速 > 毛利增速 | 前者=定价权/成本效率；后者=固定成本管理带来的经营杠杆 |
| EPS 与净利背离 | EPS 增速 > 净利润增速 | 股份回购缩减在外股本拉高每股口径；核对股本趋势 |
| 收缩期 | 净利或多项指标转负 | 净利波动常源于一次性项目、税费、利息；定位根因并找复苏信号 |

## 示例

输出形如（数据来源标注 `octagon-financials-agent`）：

| Fiscal Year | Revenue (%) | Gross Profit (%) | Operating Income (%) | Net Income (%) | EPS Diluted (%) |
|---|---|---|---|---|---|
| 2025 | 6.43 | 8.04 | 7.98 | 19.50 | 22.70 |
| 2024 | 2.02 | 6.82 | 7.80 | -3.36 | -0.82 |
| 2023 | -2.80 | -0.96 | -4.30 | -2.81 | 0.33 |
| 2022 | 7.79 | 11.74 | 9.63 | 5.41 | 8.91 |

**读法**：2025 营收仅 +6.4% 但净利 +19.5%、EPS +22.7%——净利远超营收属利润率扩张+经营杠杆，EPS 又高于净利说明回购在加力；2023 全线转负为收缩期，需查需求/成本根因；逐年看毛利增速多高于营收，反映定价权或成本效率。

**追问下钻：**
- "What factors contributed to the significant net income growth in <YEAR> despite moderate revenue growth?"
- "Why did net income decline in <YEAR> despite positive operating income growth?"
- "How did <COMPANY>'s cost management strategies impact gross profit trends?"

## 注意事项

- **覆盖范围**：主要为美股上市公司；非美股/私有公司多无数据，ticker 必须有效。
- **正负号**：正值=同比增长，负值=同比下滑。
- **周期一致**：FY（年度）与 Q（季度）口径不可混用对比；季度还需注意季节性。
- **API Key 安全**：`OCTAGON_API_KEY` 经环境变量/配置注入，勿硬编码或外泄；遇限流（rate limit）降低请求频率，并检查 key 无多余空格。
- **EPS 陷阱**：EPS 增长可能全靠回购而非主业，务必结合净利润与在外股本一起看。
- 结论仅供分析参考，交易决策前需独立校验与风控复核。

## 互见

- related：`octagon-financial-growth-metrics` —— 需把自由现金流并入、做跨三表增长诊断时改用它（更宽口径）。
- related：`octagon-income-statement-data` —— 要利润表绝对值字段而非增长率时。
- combines_with：`octagon-equity-research-analyst` / `octagon-ratings-snapshot` —— 把利润表增长作为基本面输入，串成「增长诊断 → 评级/研究」链路。

---
采编自 OctagonAI/skills（MIT 许可），已做中文适配重写。
