---
name: octagon-sec-risk-factors
title: SEC 风险因素提取
description: 当需要从美股 SEC 文件（10-K/10-Q）Item 1A 风险披露中提取归类并对比风险因素时使用；经 Octagon MCP 的 octagon-agent 抽取风险点，产出按宏观/运营/财务/法律/战略分类、带来源页码的清单；不适用于无 Octagon MCP、非美股 SEC 体系、或需法律与投资建议的场景；触发词：SEC 风险因素、Item 1A、10-K 风险披露
domain: 领域/fintech
triggers: [SEC 风险因素, Item 1A, 10-K 风险披露, 10-Q 风险更新, octagon-agent, 风险因素归类, 同业风险对比, 年度风险变化]
tags: [fintech, SEC, 风险因素, 10-K, 10-Q, Octagon MCP, 尽职调查, 财报分析]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Octagon MCP, octagon-agent]
requires: []
related: [three-statement-model, lbo-model-builder, dcf-valuation-model, alpha-vantage-market-data]
combines_with: [diligence-issue-extractor, dcf-valuation-model, portfolio-risk-metrics]
license: MIT
source: OctagonAI/skills
source_license: MIT
---

# SEC 风险因素提取

## 何时使用

需要从美股上市公司的 **SEC 申报文件（10-K 年报 / 10-Q 季报）Item 1A「风险因素」**章节提取、归类、按时间或同业对比风险披露时使用。典型场景：投资尽调、组合风险监控、竞品风险画像、行业风险扫描、披露充分性合规复核。

**不该用的边界：**
- **未配置 Octagon MCP** 的环境 —— 本技能依赖 `octagon-agent` 工具与 `octagon-sec-agent` 数据源，无 MCP 无法工作。
- **非美股 SEC 体系**（如 A 股、港股、欧股）—— 文件结构与 Item 1A 概念不通用。
- 需要**法律意见、投资买卖建议或对未披露风险的判断** —— 本技能只抽取并归纳已公开披露内容，不替代律师/分析师判断。
- 需要逐字全文 —— 输出是**归纳摘要 + 分类**，不是原文照录。

## 步骤 / 指令

1. **确认前置**：Octagon MCP 已在 Agent（Cursor / Claude Desktop / Windsurf 等）中配置完成。
2. **确定参数**：
   - **Ticker**（必填）：股票代码，如 `AAPL`、`MSFT`、`GOOGL`。
   - **Filing Type**（可选）：`10-K`（年度全量）或 `10-Q`（季度更新）。
   - **Focus Areas**（可选）：限定风险类别，如「网络安全」「监管合规」。
3. **下发自然语言指令**，调用 `octagon-agent` 工具。
4. **接收结构化输出**：按风险类别归类、附来源页码的表格（数据源 `octagon-sec-agent`）。
5. **解读**：按下方「分析要点」评估材料性、追踪 YoY 变化、对比同业。

**MCP 调用格式：**

```json
{
  "server": "octagon-mcp",
  "toolName": "octagon-agent",
  "arguments": {
    "prompt": "Extract and summarize the risk factors section from AAPL's latest annual report."
  }
}
```

**预期输出（示意）：**

| 风险类别 | 描述 | 来源页码 |
|---|---|---|
| 宏观与行业风险 | 经济下行、通胀、汇率 | 10-K, p.8 |
| 法律与监管合规 | 诉讼、监管挑战 | 10-K, p.15-16 |
| 财务风险 | 价格压力、竞争、汇率波动 | 10-K, p.18-31 |
| 业务风险 | 产品换代、竞争力 | 10-K, p.11 |
| 运营风险 | 制造、物流、外包 | 10-K, p.11 |
| 数据安全与隐私 | 网络安全、数据保护 | 10-K, p.18 |
| 供应链风险 | 地缘紧张、自然灾害 | 10-K, p.9 |

**五大风险分类速查（用于核对覆盖面）：**

| 类别 | 子类示例 |
|---|---|
| 宏观 | 经济周期、通胀、利率、汇率、地缘政治 |
| 运营 | 供应链、制造、技术系统、关键人才、业务连续性 |
| 财务 | 流动性、信用、市场、税务、养老金 |
| 法律监管 | 合规、诉讼、反垄断、数据隐私（GDPR/CCPA）、环境 ESG |
| 战略 | 竞争、技术颠覆、并购整合、创新管线、声誉 |

## 示例

```text
# 标准风险因素提取
Extract and summarize the risk factors section from AAPL's latest annual report.

# 季度风险更新（10-Q 新增/变更）
Extract any new or updated risk factors from TSLA's latest 10-Q filing.

# 限定类别
Extract cybersecurity and data privacy risk factors from META's latest 10-K.

# 跨年度对比
Compare the risk factors between GOOGL's 2024 and 2023 10-K filings.

# 同业对比
Extract and compare supply chain risk factors from AAPL and MSFT's latest 10-K filings.

# 监管聚焦
Extract all regulatory and legal compliance risk factors from JPM's latest annual report.
```

## 注意事项

**分析要点：**
- **顺序即材料性**：风险通常按管理层感知的重要性排序，靠前者往往最关键。
- **篇幅即关注度**：描述越详尽，通常代表管理层越担忧。
- **具体优于套话**：含具体事例的风险是真实关切，泛泛措辞多为模板。
- **交叉对照 MD&A**：管理层讨论分析常为风险因素提供上下文。
- **追踪 YoY 变化**：新增/删除/改写的风险揭示演变中的关切。
- **对比同业**：独有风险 vs 行业通用披露，区分公司特异性问题。

**风险变化的解读：**
- **新增风险**（高优先级）：相对上期新加，常反映近期事件或战略转向。
- **删除风险**（需监控）：可能已化解，或被并入其他风险 —— 到 MD&A 核实。
- **措辞改写**（重要）：扩写=关切上升；缩写=关切下降；更具体=风险正在显化。

**合规与限制：**
- 输出依赖 `octagon-sec-agent` 数据源，覆盖范围与时效以 Octagon 数据为准；关键结论应回溯原始申报文件核验。
- 结果仅供分析参考，**不构成投资建议或法律意见**，不能替代专业尽调与风控复核。
- 缺少 Ticker 或目标文件类型时先停下确认，不要臆测代码。

## 互见

- related：`three-statement-model` / `dcf-valuation-model` / `lbo-model-builder` —— 风险画像为估值与建模提供折现率与情景假设依据。
- related：`alpha-vantage-market-data` —— 拉取行情与基本面数据，与定性风险互补。
- combines_with：`diligence-issue-extractor` —— 风险因素抽取 + 尽调问题清单，组成完整投资前风险评估。
- combines_with：`portfolio-risk-metrics` —— 定性披露风险 + 定量组合风险指标，形成持仓风险全景。

---
采编自 OctagonAI/skills（MIT 许可），已做中文适配重写。
