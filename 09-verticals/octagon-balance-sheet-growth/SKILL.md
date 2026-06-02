---
name: octagon-balance-sheet-growth
title: 资产负债表同比增长分析
description: 当需要分析上市公司资产负债表各科目（总资产、总负债、股东权益、现金及等价物、存货）的同比（YoY）增长以诊断财务状况趋势、资本结构变化与流动性管理时使用；通过 Octagon MCP 的 octagon-agent 工具按 ticker / 期数 / 条数拉取多期 YoY 增长率表并输出去杠杆、轻资产、现金囤积、存货管理等结构化观察；不适用于绝对值财报建模、估值/DCF、实时报价下单或未配置 Octagon MCP 的环境；触发词：资产负债表增长、同比增长、去杠杆、Octagon
domain: 领域/fintech
triggers: [资产负债表同比增长, balance sheet growth, 总资产/总负债增长率, 股东权益增长, 去杠杆/资本结构变化, 现金及等价物趋势, 存货增长, Octagon MCP, octagon-agent]
tags: [fintech, 财务报表, 资产负债表, 同比增长, 资本结构, 去杠杆, Octagon, MCP]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Octagon MCP, octagon-agent, npx]
requires: []
related: [octagon-balance-sheet-data, octagon-cash-flow-growth, octagon-financial-growth-metrics, octagon-income-statement-growth]
combines_with: [octagon-financial-health-scores, octagon-equity-research-analyst]
license: MIT
source: OctagonAI/skills
source_license: MIT
---
＃ 资产负债表同比增长分析

通过 Octagon MCP 拉取上市公司资产负债表关键科目的**同比（Year-over-Year）增长率**，诊断财务状况趋势、资本结构变化与流动性管理：Total Assets、Total Liabilities、Shareholders' Equity、Cash & Cash Equivalents、Inventories。数据来源：octagon-companies-agent、octagon-financials-agent。

## 何时使用

当用户想看清一家上市公司**资产/负债/权益/现金/存货逐年扩张还是收缩、资本结构在变重还是变轻**时使用——一次拿到 5 大科目的 YoY 增长率表，再据此生成观察（去杠杆、轻资产、现金囤积、存货管理、加杠杆预警）。

**不该用的边界：**
- 要绝对值资产负债表科目（具体总资产/总负债数字）→ 用 `octagon-balance-sheet-data`，本技能只给增长率。
- 要利润表/现金流的增长率或盈利诊断 → 用 `octagon-financial-growth-metrics`。
- 要估值、内在价值、DCF 或三表建模 → 用对应估值/建模技能。
- 要实时股价、单季 tick、下单交易 → 本技能只读历史财报增长，不做交易。
- 运行环境未配置 Octagon MCP（需装好 `octagon-mcp` 并设置 `OCTAGON_API_KEY`），否则 `octagon-agent` 工具不可用。
- 标的非 Octagon 覆盖范围（多为美股上市公司）或为私有公司 → 无数据，先确认 ticker 有效。
- 输出为 Agent 生成的分析参考，不能替代独立尽调与专业复核。

## 步骤

1. **确认前置**：AI 客户端（Claude Desktop / Cursor / Windsurf 等）已注册 Octagon MCP，`octagon-agent` 工具可见。需要 `OCTAGON_API_KEY`（在 app.octagonai.co 申请）。配置细节见源仓库 `references/mcp-setup.md`。
2. **构造自然语言 prompt**：指定 ticker、条数 N、期数 FY（年度）/ Q（季度）。
3. **调用 `octagon-agent` 工具**：传入 prompt，由 octagon-financials-agent 返回 YoY 增长率表。
4. **读表**：逐年 YoY 增长率（正=增长，负=下滑）。
5. **生成观察**：按下方 5 类诊断模式总结资本结构与流动性信号。
6. **按需追问**：基于结果给出下钻问题。

## 指令

查询格式（自然语言模板）：

```
Retrieve year-over-year growth in key balance-sheet items for <TICKER>, limited to <N> records and filtered by period <FY|Q>.
```

MCP 调用：

```json
{
  "server": "octagon-mcp",
  "toolName": "octagon-agent",
  "arguments": {
    "prompt": "Retrieve year-over-year growth in key balance-sheet items for AAPL, limited to 5 records and filtered by period FY"
  }
}
```

**字段释义（均为 YoY 同比变化）：**

| 指标 | 含义 |
|------|------|
| Total Assets Growth 总资产增长 | 全部资产同比变化 |
| Total Liabilities Growth 总负债增长 | 全部债务与义务同比变化 |
| Shareholders' Equity Growth 股东权益增长 | 净资产（资产−负债）同比变化 |
| Cash & Cash Equivalents Growth 现金增长 | 流动性最强资产同比变化 |
| Inventories Growth 存货增长 | 未售商品与原材料同比变化 |

**5 类诊断模式：**

| 模式 | 判据 | 解读 |
|------|------|------|
| 去杠杆信号 | 负债下降而权益增长 | 偿债中、资产负债表走强（如负债 −7.31%、权益 +29.47%）|
| 轻资产趋势 | 资产下降但权益增长 | 资本高效部署，或有剥离/减记，关注 ROA |
| 现金囤积 | 现金增速 > 资产增速 | 为并购/回购储备弹药、保守持仓，也可能反映再投资机会有限 |
| 存货优化 | 存货下降而营收增长 | 供应链效率提升、JIT 管理、需求预测改善 |
| 加杠杆预警 | 负债增速 > 资产增速 | 杠杆抬升，若持续需关注偿付能力，复核债务契约与到期结构 |

## 示例

输出形如（YoY %）：

| Fiscal Year | Total Assets | Total Liabilities | Shareholders' Equity | Cash & Equiv. | Inventories |
|------|------|------|------|------|------|
| 2025 | -1.57 | -7.31 | 29.47 | 12.01 | -21.52 |
| 2024 | 3.51 | 6.05 | -8.36 | -0.07 | 15.08 |
| 2023 | -0.00 | -3.85 | 22.64 | 26.72 | 28.00 |
| 2022 | 0.49 | 4.92 | -19.68 | -32.32 | -24.83 |

**读法**：2025 年负债 −7.31% 而权益 +29.47%，是典型去杠杆 + 资产负债表走强；现金 +12% 快于资产 −1.6%，倾向现金囤积；存货 −21.5% 配合营收增长则属存货优化。数据来源标注 `octagon-companies-agent`、`octagon-financials-agent`。

**追问下钻（基于结果）：**
- "What drove the significant shareholders' equity growth in <YEAR>?"
- "Analyze <COMPANY>'s debt maturity schedule and refinancing risk"
- "Compare <COMPANY>'s leverage ratios to industry peers"
- "Extract cash flow statement data for <TICKER> to understand cash sources"

## 注意事项

- **前置依赖**：未配置 Octagon MCP 或缺少 `OCTAGON_API_KEY` 时 `octagon-agent` 不可用；Windows 配置命令用 `cmd /c "set OCTAGON_API_KEY=<key> && npx -y octagon-mcp"`。
- **正负号**：正值=同比增长，负值=同比下滑。
- **周期一致**：FY（年度）与 Q（季度）口径不可混用对比；季度还需注意季节性。
- **科目联读**：单看某一科目增长易误判，负债↘+权益↗才是去杠杆，现金↗需结合资产与经营现金流；存货↘要对照营收方向。
- **覆盖范围与时效**：主要为美股上市公司，私有/非覆盖标的无数据；财报为定期披露的历史数据，非实时。
- **API Key 安全 / 速率限制**：`OCTAGON_API_KEY` 经环境变量注入，勿硬编码外泄；超频时降低请求频率。
- 输出仅供分析参考，交易决策前需独立校验与风控复核；缺少 ticker / 期数等必要输入时先停下确认。

## 互见

- related：`octagon-balance-sheet-data` —— 同源对应技能，看资产负债表**绝对值**而非增长率。
- related：`octagon-financial-growth-metrics` —— 利润表/现金流的 YoY 增长，与本技能（资产负债表 YoY）互补成完整增长画像。
- related：`octagon-income-statement-data`、`octagon-cash-flow-statement-data` —— 三大报表互补的绝对值数据。
- related：`octagon-financial-health-scores` —— 把增长趋势收敛为财务健康评分。
- combines_with：`octagon-equity-research-analyst` —— 增长诊断作为权益研究输入，串成「资产负债表增长 → 投研结论」链路。
- combines_with：`octagon-ratings-snapshot` —— 与评级快照搭配交叉验证财务走向。

---
采编自 OctagonAI/skills（MIT 许可），已做中文适配重写。
