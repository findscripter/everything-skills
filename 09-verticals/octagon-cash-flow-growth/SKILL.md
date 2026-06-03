---
name: octagon-cash-flow-growth
title: 现金流指标同比增长分析
description: 当需要分析上市公司经营现金流/自由现金流/净现金流的同比（YoY）增长趋势、判断现金生成质量与资本配置效率时使用；通过 Octagon MCP 的 octagon-agent 工具按 ticker 拉取多年 YoY 增长率表并输出现金流洞察（现金生成走势、FCF 与 OCF 背离、净现金流波动、盈利质量核对）；不适用于绝对值现金流量表取数、估值/DCF、实盘下单或离线无 MCP 场景；触发词：现金流增长、cash flow growth、经营现金流增长、自由现金流增长、Octagon
domain: 领域/fintech
triggers: [现金流增长, cash flow growth, 经营现金流增长, OCF growth, 自由现金流增长, FCF growth, 净现金流增长, Octagon MCP]
tags: [fintech, 财务分析, 现金流, 同比增长, 自由现金流, octagon, mcp, 盈利质量]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Octagon MCP, octagon-agent, npx, Node.js]
requires: []
related: [octagon-cash-flow-statement-data, octagon-financial-growth-metrics, octagon-balance-sheet-growth, octagon-income-statement-growth]
combines_with: [octagon-financial-health-scores, octagon-equity-research-analyst]
license: MIT
source: OctagonAI/skills
source_license: MIT
---
＃ 现金流指标同比增长分析

通过 Octagon MCP 拉取上市公司三大现金流指标的**同比（Year-over-Year）增长率**：经营现金流（OCF）、自由现金流（FCF）、净现金流（Net Cash Flow），据此判断现金生成趋势、资本配置效率与流动性轨迹。

## 何时使用

当用户想快速看清一家上市公司**现金生成能力是在增强还是减弱、盈利是否有真现金支撑**时使用——一次拿到三大现金流指标的 YoY 增长率表，再据此生成洞察（核心现金生成走势、可用于分红/回购/并购的 FCF 健康度、整体流动性方向、波动性、盈利质量）。

**不该用的边界：**
- 要**绝对值**现金流量表（具体 OCF/FCF/期末现金数字）→ 用 `octagon-cash-flow-statement-data`。
- 要营收/利润/EPS 等跨表 YoY 增长 → 用 `octagon-financial-growth-metrics`。
- 要估值、内在价值、贴现 → 用 `dcf-valuation-model`。
- 要实时股价/单季 tick/技术指标 → 用 `alpha-vantage-market-data`。
- **离线/未配置 Octagon MCP**：本条依赖 `octagon-agent` 取数，无 MCP 无法运行。
- 标的非 Octagon 覆盖范围（多为美股上市公司）或为私有公司 → 无数据，先确认 ticker 有效。
- 输出是 Agent 生成的分析参考，不替代独立尽调与专业复核，不下单。

## 步骤

1. **配置 Octagon MCP**：确保 AI 客户端（Claude Desktop / Cursor / Windsurf）已注册 `octagon-mcp`，`octagon-agent` 工具可见。需要 `OCTAGON_API_KEY`（在 app.octagonai.co 申请；Windows 需先装 Node.js / npx）。
2. **构造查询**：按模板填 ticker、记录数 N、周期（FY 年度 / Q 季度）。
3. **调用 octagon-agent**：传入自然语言 prompt。
4. **读表**：得到逐年 YoY 增长率（正=增长，负=下滑），三列分别对应 OCF / FCF / 净现金流。
5. **生成洞察**：套用下方 5 类关键观察模式。
6. **追问下钻**：按结果给出深挖问题。

## 指令

**Octagon MCP 配置（Claude Desktop 的 `claude_desktop_config.json`）：**

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
Retrieve cash-flow growth metrics for <TICKER>, limited to <N> records and filtered by period <FY|Q>.
```

**MCP 调用：**

```json
{
  "server": "octagon-mcp",
  "toolName": "octagon-agent",
  "arguments": {
    "prompt": "Retrieve cash-flow growth metrics for AAPL, limited to 5 records and filtered by period FY"
  }
}
```

数据源：`octagon-financials-agent`。

**指标定义速查：**

| 指标 | 含义（YoY 变化）|
|------|------|
| Operating Cash Flow Growth | 核心经营产生现金（OCF）的同比变化 |
| Free Cash Flow Growth | 自由现金流（OCF − 资本开支）的同比变化 |
| Net Cash Flow Growth | 总现金头寸（经营+投资+筹资）的同比变化 |

**5 类关键观察模式（取数后逐条生成）：**

| 模式 | 判据 | 解读 |
|------|------|------|
| 现金生成强劲 | OCF 增速 > 营收增速 | 营运资本管理高效、收付款优化、盈利有现金支撑（盈利质量高）|
| FCF 与 OCF 背离 | FCF 增速明显偏离 OCF 增速 | 资本开支变化驱动：扩张投资（拉低 FCF）或收割期（抬高 FCF）；查 capex 占营收比趋势 |
| 净现金流波动 | 净现金流增速大幅起伏 | 多由大额债务发行/偿还、回购计划、分红政策变化、并购活动引起 |
| 营运资本扰动 | OCF 大幅摆动 | 存货增减、应收账款回款时点、应付账款管理、递延收入变化 |
| 盈利质量核对 | 对比利润表净利润 | OCF 应长期追平或超过净利润；持续 OCF < 净利润，警惕盈利质量 |

## 示例

查询 `AAPL`、5 期、FY 的典型返回（YoY %）：

| Fiscal Year | Operating Cash Flow Growth (%) | Free Cash Flow Growth (%) | Net Cash Flow Growth (%) |
|---|---|---|---|
| 2025 | -5.73 | -9.23 | 8.55 |
| 2024 | 6.98 | 9.26 | -1.14 |
| 2023 | -9.50 | -10.64 | 1.53 |
| 2022 | 17.41 | 19.89 | -1.84 |
| 2021 | 28.96 | 26.70 | 0.63 |

**读法**：2021 现金生成峰值（OCF +28.96%、FCF +26.70%）；2025 OCF/FCF 同步转负（−5.7% / −9.2%），FCF 跌幅大于 OCF，提示资本开支在加重，需查 capex 趋势；净现金流逐年正负切换（2025 +8.55%、2024 −1.14%），属典型受筹资活动（回购/分红/债务）主导的高波动项。

**追问下钻：**
- "What drove the operating cash flow decline in <YEAR>?"
- "Break down <COMPANY>'s working capital changes for the last 3 years"
- "Compare <COMPANY>'s free cash flow yield to industry peers"
- "Analyze <COMPANY>'s capital expenditure trends and guidance"

## 注意事项

- **覆盖范围**：主要为美股上市公司；非美股/私有公司多无数据，ticker 必须有效。
- **正负号**：正值=同比增长，负值=同比下滑。
- **周期一致**：FY（年度）与 Q（季度）口径不可混用对比；季度还需注意季节性。
- **净现金流天然波动**：受大额债务、回购、分红、并购影响，单年大起大落属常态，须结合多期看方向而非据一年定论。
- **FCF 派生口径**：FCF = OCF − 资本开支，capex 变化会让 FCF 增速与 OCF 增速背离，背离时务必回看 capex 占营收比。
- **盈利质量**：持续 OCF < 净利润是盈利质量信号，需结合利润表交叉核对。
- **API Key 安全**：`OCTAGON_API_KEY` 经环境变量/配置注入，勿硬编码或外泄；超频时降低请求频率。
- 结论仅供分析参考，交易决策前需独立校验与风控复核。

## 互见

- related：`octagon-cash-flow-statement-data` —— 要绝对值现金流量表（OCF/FCF/期末现金等字段）时用它。
- related：`octagon-financial-growth-metrics` —— 要营收/利润/EPS 等跨表 YoY 增长一起看时。
- related：`octagon-income-statement-data` —— 用净利润绝对值做盈利质量交叉核对。
- combines_with：`octagon-financial-health-scores` —— 现金流增长趋势 + 财务强度/破产评分，互补判断现金质量。
- combines_with：`octagon-equity-research-analyst` —— 作为投研编排中的现金流增长取数子环节。
- combines_with：`dcf-valuation-model` —— FCF 增长趋势作为 DCF 估值假设输入，串成「增长诊断 → 估值」链路。

---

本条采编自 OctagonAI/skills（MIT 许可），已做中文适配重写。
