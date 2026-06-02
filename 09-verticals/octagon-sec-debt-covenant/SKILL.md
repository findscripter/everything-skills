---
name: octagon-sec-debt-covenant
title: 债务契约与信贷条款分析
description: 当需要从上市公司 SEC 申报（10-K/10-Q/8-K）中分析债务契约、授信协议条款、杠杆率/利息保障倍数要求、授信额度、债务到期表与契约合规情况时使用；通过 Octagon MCP 的 octagon-agent 工具按 ticker/申报类型/关注点发起自然语言查询，产出含债务概览、契约要求、契约余量（cushion）与再融资风险的结构化分析；不适用于实时报价、下单交易、财务建模估值或未配置 Octagon MCP 的环境；触发词：债务契约、covenant、杠杆率、利息保障倍数、授信额度、债务到期、契约合规
domain: 领域/fintech
triggers: [债务契约, covenant, 信贷条款/授信协议, 杠杆率 Leverage Ratio, 利息保障倍数 Interest Coverage, 授信额度/循环授信, 债务到期表, 契约合规/契约余量, Octagon MCP, octagon-agent]
tags: [fintech, sec, debt-covenant, 信贷分析, 杠杆, 授信协议, 10-k, credit-analysis, Octagon, MCP]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Octagon MCP, octagon-agent]
requires: []
related: [octagon-sec-10k-analysis, octagon-sec-filing-analyst, octagon-sec-risk-factors, octagon-financial-health-scores]
combines_with: [octagon-balance-sheet-data, octagon-equity-research-analyst, octagon-cash-flow-statement-data]
license: MIT
source: OctagonAI/skills
source_license: MIT
---
# 债务契约与信贷条款分析

> 角色定位：信贷/困境投资分析师，从 SEC 披露文件中拆解一家上市公司的债务结构、契约条款与合规余量，输出可用于授信判断、困境识别与再融资评估的结构化分析。

## 何时使用

当需要基于 SEC 申报（10-K/10-Q/8-K）分析上市公司的**债务契约与授信条款**时使用，典型场景：
- 研究财务契约、杠杆率、利息保障倍数等维持性要求；
- 抽取循环授信/定期贷款额度、定价、到期与可用额度；
- 梳理债务到期表与近期到期压力，评估再融资风险；
- 判断契约合规状态与契约余量（cushion）、识别违约/触发风险。

**不该用的边界：**
- 未配置 Octagon MCP 的环境——本条依赖 `octagon-agent` 工具，前置缺失则不适用。
- 实时股价/报价、下单或券商撮合——本条只读历史披露，不做交易。
- 估值与财务建模（DCF、三表、可比公司）——那是建模，移交 `dcf-valuation-model`、`three-statement-model`、`financial-analysis-toolkit`；本条只负责「读懂债务与契约」。
- 全套尽调编排——若要把契约分析放进对整家公司的六阶段尽调中，用 `octagon-sec-filing-analyst`，本条是其阶段4的债务子环节。

## 步骤

前置：确保 AI 助手（Cursor / Claude Desktop / Windsurf 等）已配置 Octagon MCP，`octagon-agent` 工具可见。配置见源仓库 `references/mcp-setup.md`，核心是 `OCTAGON_API_KEY=<key> npx -y octagon-mcp`（Windows 用 `cmd /c "set OCTAGON_API_KEY=<key> && npx -y octagon-mcp"`）。

1. **确定分析参数**：
   - Ticker（必需）：股票代码，如 F、T、BA、GE、CCL、NCLH。
   - 申报类型（可选）：10-K / 10-Q / 8-K。
   - 关注点（可选）：契约 / 授信额度 / 到期表。
2. **发起查询**：用 `octagon-agent` 工具，以自然语言 prompt 表达上述参数（模板见「指令」）。
3. **解读返回**：agent 返回结构化债务分析，至少含：
   - 债务概览（如总债务、短期债务）；
   - 契约信息（具体授信协议名、财务指标维持要求）；
   - 数据源标注：octagon-financials-agent、octagon-sec-agent、octagon-web-search-agent。
4. **计算契约余量**（cushion）：对每个财务契约，用「当前值 vs 契约阈值」算余量百分比，按余量分级评估（见「示例」），**不要只信管理层口径**。
5. **识别红旗**：余量 <10%、契约假期/暂停、反复修订、激进 EBITDA 加回、循环授信使用率 >80%、近期大额到期、评级下调风险等。

## 指令

**查询模板**（把 `<TICKER>` 替换为目标代码）：
```
Analyze debt covenants and credit agreement terms disclosed in <TICKER>'s latest SEC filings.
```

**MCP 调用格式**：
```json
{
  "server": "octagon-mcp",
  "toolName": "octagon-agent",
  "arguments": {
    "prompt": "Analyze debt covenants and credit agreement terms disclosed in F's latest SEC filings."
  }
}
```

**披露位置速查**（去哪找契约）：

| 申报 | 位置 |
|------|------|
| 10-K/10-Q | 债务附注（Debt footnote） |
| 10-K/10-Q | MD&A 的流动性讨论 |
| 8-K | 授信协议公告 |
| Exhibits | 完整授信协议、契约合规证书（Compliance Certificate） |
| S-1/424B | 债务描述（Debt description） |

**常见财务契约与口径**：

| 契约 | 典型要求 | 计算 |
|------|----------|------|
| 杠杆率 Leverage | Debt/EBITDA ≤ X.Xx | 总杠杆=Total Debt/EBITDA；净杠杆=(Total Debt−Cash)/EBITDA |
| 利息保障 Interest Coverage | EBITDA/Interest ≥ X.Xx | EBITDA / Interest Expense |
| 固定费用 Fixed Charge | (EBITDA−CapEx)/Fixed Charges ≥ X.Xx | (EBITDA−CapEx)/(Interest+Principal) |
| 最低 EBITDA / 最高 CapEx / 最低流动性 | ≥/≤ $X | 现金 + 循环授信可用额度 |

**契约分类**：财务契约（维持性，定期测试）/ 发生契约（限制新增负债、留置、受限支付、资产出售、关联交易）/ 维持性契约（含治愈权 Cure Rights、仅动用时测试的弹簧式 Springing）。

## 示例

**全量债务契约分析：**
```
Analyze debt covenants and credit agreement terms disclosed in F's latest SEC filings.
```
返回形如——债务概览：剔除子公司的总债务 $20.9B、短期债务 $0.8B；契约信息：FCE Credit Agreement 契约、财务指标维持要求；数据源：octagon-financials-agent、octagon-sec-agent、octagon-web-search-agent。

**其他高频查询：**
```
Is T in compliance with all debt covenants based on latest 10-Q disclosures?
Extract revolving credit facility terms and availability from BA's latest 10-K.
Analyze the debt maturity schedule and near-term obligations for GE.
What are the maximum leverage ratio covenants in CCL's credit agreements?
Extract interest coverage ratio requirements from NCLH's debt covenants.
```

**契约余量分级**（自行计算，对照评估）：

| 余量 Cushion | 评估 |
|--------------|------|
| >30% | 宽裕 Comfortable |
| 15–30% | 适中 Adequate |
| 5–15% | 偏紧 Tight |
| <5% | 风险 At risk |

**再融资风险信号**：1 年内到期 >25%、市场准入受限、评级下调风险、契约余量偏紧均为高风险侧。

## 注意事项

- **前置依赖**：未配置 Octagon MCP 或缺 `OCTAGON_API_KEY` 时 `octagon-agent` 不可用；缺 ticker 等必要输入先停下确认。
- **读附注 + 查 MD&A**：详细契约条款在债务附注里，管理层在 MD&A 流动性讨论合规情况——两者需交叉验证，背离即关注点。
- **看 Exhibits 原文**：完整授信协议作为附件归档，契约合规证书含具体计算口径。
- **追踪修订**：反复修订/契约假期通常意味着持续承压或正在再融资，是信号。
- **自算余量**：不要只依赖管理层声明的合规结论，独立按上表口径复核；同时关注评级机构报告对契约的讨论。
- **违约后果**：契约违约可触发加速到期（acceleration）、交叉违约（cross-default），常需豁免（waiver）或修订；治愈机制含权益注资（equity cure）、资产出售、修订契约阈值。
- 输出为分析参考，非可直接交易/授信的权威依据，重大结论须自行复核。

## 互见

- requires：`无`（仅需前置配置 Octagon MCP 环境）。
- related：`octagon-sec-filing-analyst`（全套 SEC 尽调编排，本条是其阶段4债务子环节）、`octagon-sec-mda-analysis`（MD&A 流动性讨论侧分析）、`octagon-balance-sheet-data`（资产负债表数据，提供 Debt/EBITDA 的债务与现金口径）。
- combines_with：`octagon-balance-sheet-data`、`octagon-cash-flow-statement-data` —— 用资产负债表/现金流数据驱动杠杆率与契约余量的量化计算；`dcf-valuation-model` —— 把债务结构与再融资风险接入估值。

---

采编自 OctagonAI/skills（MIT 许可），已做中文适配重写。
