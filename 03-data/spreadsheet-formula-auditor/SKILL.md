---
name: spreadsheet-formula-auditor
title: 电子表格公式与模型审计
description: 当需要审计 Excel/电子表格公式正确性或核查财务模型（DCF/LBO/三表）勾稽完整性时使用；按选区/单张表/整本模型逐层排查公式错误、硬编码、勾稽断点并产出分级问题清单；不适用于纯数据清洗、图表制作或无公式的静态表。触发词：审计表格、检查公式、模型核对、对不上、勾稽、audit spreadsheet、check formulas、model won't balance
domain: 数据/analysis
triggers: [审计表格, 检查公式, 模型核对, 对不上, 勾稽, audit spreadsheet, check formulas, model won't balance]
tags: [spreadsheet, excel, formula-audit, financial-model, analysis, data, qa, dcf, lbo]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Excel, spreadsheet, openpyxl]
requires: []
related: [financial-analysis-toolkit, gl-subledger-reconciler, three-statement-model, dcf-valuation-model]
combines_with: [financial-analysis-toolkit, gl-subledger-reconciler, variance-flux-commentary]
license: Apache-2.0
source: anthropics/financial-services
source_license: Apache-2.0
---
## 何时使用

- 用户要求审计、QA、查错电子表格公式（"检查我的公式"、"这张表对不对"、"找公式错误"）。
- 财务模型（DCF / LBO / 三表 / 并购 / 可比公司）在交付客户或上投委会前的完整性核查（资产负债表是否平、现金是否勾稽、逻辑是否合理）。
- 用户反馈"模型对不上 / 不平 / 哪里不对劲"，需要定位断点。

不该用：纯数据清洗去重（用 csv-data-cleaner）、做图表/透视、无公式的静态数据表、单纯数值统计。

## 步骤

### 第 1 步：确定审计范围

若用户未指定，先问。范围决定深度：
- **选区（selection）**——仅当前选中区域，快速查公式。
- **单表（sheet）**——当前活动工作表。
- **整模型（model）**——整本工作簿，含财务模型勾稽核查（BS 平衡、现金勾稽、滚存、逻辑合理性）。这是最深一级，DCF/LBO/三表/并购/可比 等集成模型交付前必须用此范围。

### 第 2 步：公式级检查（所有范围都跑）

| 检查项 | 关注点 |
|---|---|
| 公式报错 | `#REF!`、`#VALUE!`、`#N/A`、`#DIV/0!`、`#NAME?` |
| 公式内硬编码 | `=A1*1.05` 中的 `1.05` 应改为单元格引用 |
| 公式不一致 | 某格打破同行/同列邻格的公式规律 |
| 区间错位（off-by-one） | `SUM`/`AVERAGE` 漏掉首行或末行 |
| 被粘贴覆盖的公式 | 看似公式实为硬编码值 |
| 循环引用 | 区分有意 vs 意外 |
| 跨表链接断裂 | 引用了已移动/删除的单元格 |
| 单位/量级不一致 | 千与百万混用、百分比按整数存 |
| 隐藏行/标签页 | 可能藏有覆盖值或过期计算 |

### 第 3 步：模型完整性检查（仅 model 范围）

先识别模型类型（DCF / LBO / 三表 / 并购 / 可比 / 自定义），再跑对应核查。

- **结构审查**：输入与计算是否分离；颜色约定（蓝=输入、黑=公式、绿=链接）是否一致；标签页顺序（假设→IS→BS→CF→估值）；日期表头跨表一致；单位一致。
- **资产负债表（BS）**：每期 总资产 = 总负债 + 所有者权益；留存收益滚存：期初RE + 净利润 − 分红 = 期末RE；商誉/无形从收购假设流转（并购时）。**BS 不平时，先逐期量化缺口并追踪断点，平之前其它都免谈。**
- **现金流量表（CF）**：CF 期末现金 = BS 现金（每期）；CFO+CFI+CFF = Δ现金；CF 的 D&A = IS 的 D&A；CF 的 CapEx 匹配 BS 的 PP&E 滚存；营运资本变动符号与 BS 变动一致（ΔAR、ΔAP、ΔInventory）。
- **利润表（IS）**：收入构建勾稽分部/产品明细；税费 = 税前利润 × 税率（容许递延税调整）；股数勾稽稀释表（期权、可转债、回购）。
- **循环引用**：利息→债务余额→现金→利息 是 LBO/三表常见的有意循环。有意则确认迭代开关存在且生效；无意则追踪环路并给出打破方式。
- **逻辑合理性**：收入增速 >100% 无解释、毛利超行业区间、终值 > DCF 企业价值约 75%（黄旗）、远期曲棍球棒式拉升、EBITDA 复利至第 10 年到荒谬金额、0%/负增长/负 EBITDA/杠杆转负等边界崩溃。
- **模型特有 bug**：
  - DCF：贴现期错配（年中 vs 年末）、终值未折回、WACC 用账面值而非市值、FCF 含利息（应为无杠杆）、税盾重复计。
  - LBO：偿债与现金清扫机制不符、PIK 利息未滚入本金、管理层 rollover 未计入回报、退出倍数乘错 EBITDA（LTM vs NTM）、费用未从 Day 1 股权扣除。
  - 并购：增厚/摊薄用错股数（交易前 vs 后）、协同未分期、购买价分摊不平、现金机会利息未计、交易费未进 Sources & Uses。
  - 三表：营运资本变动符号错、折旧与 PP&E 表不符、债务到期表与本金偿还不符、分红超净利润无解释。

### 第 4 步：输出报告

产出问题清单表：

| # | 工作表 | 单元格/区域 | 严重度 | 类别 | 问题 | 建议修复 |
|---|---|---|---|---|---|---|

严重度分级：
- **Critical（严重）**——输出错误（BS 不平、公式断裂、现金不勾稽）。
- **Warning（警告）**——有风险（硬编码、公式不一致、边界失败）。
- **Info（提示）**——风格/最佳实践（颜色编码、布局、命名）。

model 范围在表前加一行摘要：
> 模型类型：[DCF/LBO/三表/...] — 总体：[干净 / 轻微问题 / 重大问题] — [N] 严重，[N] 警告，[N] 提示

## 指令

- **未经询问不要改任何东西**——先报告，按需再修。
- BS 不平时优先解决：逐期量化缺口、追踪断点，平之前不下结论。
- 若模型含 VBA 宏，注明无法仅从公式审计的宏驱动计算。

## 示例

输入："帮我 QA 一下这个 LBO 模型，感觉退出回报有点高。"

流程：
1. 范围 = model（LBO 集成模型）。
2. 全范围跑公式级检查（报错、硬编码、隐藏页）。
3. 跑 LBO 完整性：BS 是否每期平、CF 期末现金 = BS 现金、利息↔债务的迭代开关是否开。
4. 跑 LBO 特有 bug：退出倍数是否乘对 EBITDA（LTM vs NTM）、Day 1 股权是否扣费、PIK 是否滚本金。
5. 输出摘要 + 分级清单，例如：
   > 模型类型：LBO — 总体：重大问题 — 2 严重，3 警告，1 提示

   | # | 工作表 | 单元格 | 严重度 | 类别 | 问题 | 建议修复 |
   |---|---|---|---|---|---|---|
   | 1 | Returns | F42 | Critical | 退出 | 退出倍数乘了 LTM EBITDA，应为 NTM | 改引用 NTM EBITDA 单元格 |

## 注意事项

- **先看 BS 是否平**——不平则下游全部存疑。
- **硬编码覆盖是静默 bug 的头号来源**——激进搜索公式内的写死数字。
- **符号约定错误**（现金流出的正负号）极其常见，重点核查营运资本与现金流方向。
- 隐藏行/标签页常藏覆盖值与过期计算，逐一展开核对。

## 互见

- csv-data-cleaner（数据清洗/规整，审计前的预处理）
- sql-query-builder（数据取自数据库时的取数核对）
- code-reviewer（VBA 宏等代码逻辑审查）

---

本条采编自 anthropics/financial-services（Apache-2.0）。
