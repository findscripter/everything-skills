---
name: three-statement-model
title: 三表联动财务模型
description: 当需要在已有 Excel/openpyxl 模板中填充并联动利润表、资产负债表、现金流量表时使用；做法是用公式（而非硬编码值）填充历史数与假设驱动、建立三表勾稽并逐表校验产出可审计的三表模型；不适用于从零设计模型版式、估值/DCF/LBO 建模或纯数据录入。触发词：三表模型、3-statement model、财务建模、利润表/资产负债表/现金流量表联动、IS BS CF、资产负债表平衡、现金勾稽、cash tie-out、情景分析
domain: 领域/fintech
triggers: [三表模型, 3-statement model, 财务建模, 利润表资产负债表现金流量表联动, IS BS CF, 资产负债表平衡, 现金勾稽, cash tie-out, 情景分析]
tags: [fintech, financial-modeling, excel, openpyxl, office-js, three-statement]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Excel, Office JS, Python, openpyxl, recalc.py]
requires: []
related: [dcf-valuation-model, lbo-model-builder, merger-accretion-dilution-model, financial-analysis-toolkit]
combines_with: [dcf-valuation-model, financial-analysis-toolkit, spreadsheet-formula-auditor]
license: Apache-2.0
source: anthropics/financial-services
source_license: Apache-2.0
---
## 何时使用

- 当任务是**填充/补全/联动**一个已有的三表财务模型模板（利润表 IS、资产负债表 BS、现金流量表 CF），并在三表之间建立正确勾稽关系时使用。
- 触发场景：填模板、补全半成品 IS/BS/CF 框架、按数据填充财务模型、跨标签页链接三表。

**不该用（负边界）：**
- 不用于从零设计模型版式（无现成模板时另议结构）。
- 不用于估值（DCF / LBO / 可比公司）建模——本条只管三表本身的填充与联动。
- 不用于把计算好的数值当作纯数据录入——本条核心恰是「用公式而非硬编码」。

## 步骤

1. **映射模板结构**：先通读所有标签页，识别 IS/BS/CF/WC（营运资本）/DA（折旧摊销）/Debt（债务）/NOL（税务亏损结转）/Assumptions（假设）/Checks（校验）。区分输入单元格 vs 公式单元格（按字体色：蓝=输入，黑=公式，绿=跨表链接），核对单位行（$百万 / % / x）与期间标签（FY2024A 历史 / FY2025E 预测，通常向后预测 5 年）。**展示识别结果，经用户确认后再动任何单元格。**
2. **填历史实际数**：仅写入指定输入单元格，确认数值与期间匹配源数据后，向用户展示历史区块确认。
3. **建 IS 预测**：预测项按「占净收入百分比」法用公式驱动，跑小计校验（毛利、EBIT、EBT、净利润），展示后再进入 BS。
4. **建 BS**：逐期跑平衡校验（资产 = 负债 + 权益），展示后再进入 CF。
5. **建 CF**：核对现金勾稽（CF 期末现金 = BS 现金），展示后再定稿。
6. **跨表完整性校验 + 终审**：见下方校验表；切换所有情景确认各档校验通过，清理所有 #REF! / #DIV/0! / #VALUE! / #NAME? 错误。

> **关键纪律：不要一口气端到端填完再整体呈现。** 在每张表处断点、展示工作、尽早抓错。

## 指令

**环境二选一（Office JS vs Python）：**
- **在 Excel 内运行（Office 加载项 / Office JS）**：直接写公式，`range.formulas = [["=D14*(1+Assumptions!$B$5)"]]`——派生单元格**绝不用** `range.values`。Excel 原生重算，无需单独 recalc。用 `context.workbook.worksheets.getItem(...)` 切标签页。
- **生成独立 .xlsx**：用 Python/openpyxl 写公式字符串 `ws["D15"] = "=D14*(1+Assumptions!$B$5)"`，交付前运行 `recalc.py`。
- **Office JS 合并单元格坑**：不要先 `.merge()` 再对合并区域设 `.values`（会抛 `InvalidArgument`，因区域仍按合并前尺寸上报）。正确做法：先给左上角单元格写值，再合并+格式化整区：`ws.getRange("A1").values=[["INCOME STATEMENT"]]; const h=ws.getRange("A1:G1"); h.merge(); h.format.fill.color="#1F4E79";`

**公式高于硬编码（不可妥协）：** 每个预测、滚动结转、链接、小计都必须是公式，绝不是预先算好的值。openpyxl 写 `ws["D15"]="=D14*(1+Assumptions!$B$5)"` 而非 `ws["D15"]=12500`。唯一可硬编码的：(1) 历史实际数；(2) Assumptions 标签的假设驱动。若发现自己在 Python 里算出值再写入单元格——停下，改写公式。原因：模型须随情景切换/假设变化而联动，硬编码会静默破坏每个下游校验。

**关键勾稽公式（净收入口径；毛利须用净收入而非毛收入）：**
```
毛利 = 净收入 − 营业成本
EBITDA = EBIT + D&A
预测成本/费用 = 净收入 × 对应百分比假设（COGS/S&M/G&A/R&D/SBC）
留存收益 = 期初RE + 净利润 + SBC − 股利 = 期末RE
利息费用 = 平均债务余额 × 利率（用期初余额避免循环，或开迭代计算）
```

**核心校验（必须恒成立）：**
| 校验 | 公式 | 期望 |
|---|---|---|
| 资产负债表平衡 | 资产 − 负债 − 权益 | = 0 |
| 现金勾稽 | CF 期末现金 − BS 现金 | = 0 |
| 净利润链接 | IS 净利润 − CF 起点净利润 | = 0 |
| 留存收益 | 期初RE + NI + SBC − 股利 − BS期末RE | = 0 |
| 权益融资 | ΔCommon Stock/APIC(BS) − Equity Issuance(CFF) | = 0 |

**符号约定：** CFO 中 D&A/SBC 为正（加回）、ΔAR 增加为负（占用现金）、ΔAP 增加为正（现金来源）；CFI 中 CapEx 为负；CFF 中举债为正、还债/分红为负。

**循环引用处理：** 利息 → 净利润 → 现金 → 债务余额 → 利息 形成循环。Excel 启用迭代计算（File → Options → Formulas），最大迭代 100、最大变化 0.001，并在 Assumptions 加断路器开关。

## 示例

填充某 .xlsx 三表模板（openpyxl 路径）：
1. 通读标签页 → 识别出 `IS / BS / CF / Assumptions / Checks`，向用户确认。
2. 历史 FY2024A：把营收、各费用历史实际数硬编码进蓝字输入格。
3. 预测 FY2025E 营业成本写公式 `ws["E5"] = "=E4*Assumptions!$B$6"`（E4=净收入，B6=成本占比假设），不写 `=12500`。
4. BS 现金格链接 CF：`ws["C8"] = "=CF!C40"`；BS 平衡校验格 `="=Assets - Liabilities - Equity"` 应显示 0。
5. 运行 `recalc.py` 后检查 Checks 标签 Master Status 为「✓ ALL CHECKS PASS」。

## 注意事项

- **配色克制**：默认蓝/灰调——深蓝 `#1F4E79`（节标题，白粗体）、浅蓝 `#D9E1F2`（列头）、中蓝 `#BDD7EE`（校验/合计）、浅灰 `#F2F2F2`（输入）。字体色表「是什么」（蓝=输入/黑=公式/绿=跨表链接），填充色表「在哪里」。不引入绿/黄/橙等多余强调色。若模板自带配色，跟随模板。
- **不破坏既有公式**：只改输入格；拷贝数据用「选择性粘贴-数值」(Ctrl+Shift+V) 避免覆盖公式；核对单位（千/百万/原值）与符号约定；删行列前先查全表依赖。
- **NOL 与税务**：新业务期初 NOL = 0，仅 EBT<0 时按 ABS(EBT) 累积；利用额 ≤ EBT×80%（2017 后联邦上限）；应税所得 ≤ 0 时税额 = 0；DTA = 期末NOL × 税率，须勾稽到 BS。
- **可选模块**：利润率分析、信用/杠杆指标、情景分析（Base/Upside/Downside，用 CHOOSE 或 INDEX/MATCH 配下拉切换）仅在用户要求或模板明确需要时才做；情景层级须满足 Upside > Base > Downside（NI/EBITDA/FCF/各利润率），杠杆指标方向相反。

## 互见

- 数据来自 SEC 10-K/10-Q 等监管文件时，参考源技能 `references/sec-filings.md` 的抽取指引。

---
本条采编自 anthropics/financial-services（Apache-2.0）。
