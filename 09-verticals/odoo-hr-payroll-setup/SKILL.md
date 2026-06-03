---
name: odoo-hr-payroll-setup
title: Odoo 人力与薪酬配置
description: 当在 Odoo（企业版）配置 HR 与薪酬、调试薪资单或排查工资条金额时使用；做薪资结构/规则、休假政策、员工合同与薪酬过账到会计的端到端配置与问题定位；不适用于社区版（无 hr_payroll）、跨国混合薪酬、税务申报生成（W2/941）。触发词：薪资结构、salary rule、Odoo Payroll
domain: 领域/erp
triggers: [Odoo 薪酬, 薪资结构, salary structure, salary rule, payslip 工资条, 休假政策 Time Off, 员工合同 contract.wage, 薪酬过账 journal, l10n payroll 本地化]
tags: [Odoo, ERP, HR, 薪酬, Payroll, 薪资规则, 休假管理, 会计过账]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Odoo Enterprise (hr_payroll), 薪酬本地化模块 l10n_*_hr_payroll]
requires: []
related: [odoo-accounting-setup, odoo-sales-crm-expert, odoo-module-developer, odoo-localization-compliance]
combines_with: [odoo-accounting-setup, odoo-localization-compliance]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用于在 Odoo 企业版中配置或排障人力与薪酬：

- 搭建包含毛工资、扣减项、净工资的薪资结构（salary structure）。
- 配置年假、病假、公共假日等休假政策与配额分配。
- 排查工资条金额错误、规则贡献缺失（如某条 salary rule 未生效）。
- 设置薪酬日记账，使其正确过账到会计。

不该用的边界：

- 社区版（Community）不含 `hr_payroll` 模块，本技能不适用。
- 跨国混合薪酬（员工分布在不同国家）需各自独立结构与本地化，不在此覆盖。
- 不负责生成税务申报（W2、941、州 SUI/SDI 等），Odoo 本身也不直接出申报表。
- 通过工资条做的费用报销（里程、居家办公）需自定义 salary input，标准文档未覆盖。

## 步骤

1. 先装本地化：在建任何自定义规则前，安装对应国家的薪酬本地化模块（如 `l10n_us_hr_payroll`、`l10n_mx_hr_payroll`），它已内置税务结构。
2. 建合同：为每位员工建立 active 的 Employee Contract，填对起止日期与工资，否则无法生成工资条。
3. 建薪资结构与规则：`Payroll → Configuration → Salary Structures → New`，自上而下排列规则（顺序决定计算依赖）。
4. 配休假类型与配额：`Time Off → Configuration → Time Off Types` 建类型，再 `Time Off → Managers → Allocations` 分配初始额度。
5. 跑批与过账：验证薪酬批次后由 Odoo 自动生成会计分录，过账到薪酬日记账。
6. 调试：若金额异常，逐条核对规则公式、类别（Category）与 input 取值，必要时取消重生成批次。

## 指令

薪资规则常用写法（公式按规则代码引用上游结果）：

```text
Code  | Name                   | Formula                         | Category
BASIC | Basic Wage             | contract.wage                   | Basic
GROSS | Gross                  | BASIC                           | Gross
SS    | Social Security (6.2%) | -GROSS * 0.062                  | Deduction
MED   | Medicare (1.45%)       | -GROSS * 0.0145                | Deduction
FIT   | Federal Income Tax     | -GROSS * inputs.FIT_RATE.amount | Deduction
NET   | Net Salary             | GROSS + SS + MED + FIT          | Net
```

- 用 salary input 传变量：`inputs.ALLOWANCE.amount`、`inputs.FIT_RATE.amount`，把奖金、津贴、预扣税率等按员工动态传入，而非硬编码进公式。
- 联邦个税率：标准美国本地化不暴露单一 `l10n_us_w4_rate` 字段，应用 salary input 按员工传率，或安装 OCA 社区模块 `l10n_us_hr_payroll`（正确处理 W4 报税身份）。

## 示例

休假类型配置（`Time Off → Configuration → Time Off Types → New`）：

```text
Name: Annual Leave / PTO
Approval: Time Off Officer
Leave Validation: Time Off Officer（单审批）；或 "Both" 走 HR + Manager 双审批
Allocation: ☑ 员工可自行分配，Requires approval: No
Negative Balance: Not allowed（不允许负余额）

初始配额：Time Off → Managers → Allocations → New
  Employee / Time Off Type: Annual Leave / PTO / Allocation: 15 days
  Validity: Jan 1 – Dec 31（当年）
```

薪酬过账结果（验证批次后自动生成）：

```text
Debit   Salary Expense Account     $5,000.00
  Credit  Social Security Payable     $310.00
  Credit  Medicare Payable             $72.50
  Credit  Federal Tax Payable         (varies)
  Credit  Salary Payable           $4,617.50+

支付净工资时：
Debit   Salary Payable            $4,617.50
  Credit  Bank Account              $4,617.50

雇主税（FUTA、SUTA 等）单独过账为独立分录。
```

## 注意事项

- 不要手改已过账工资条：需更正时取消并重新生成整个批次。
- 在扣减规则里用 `contract.wage` 前，先确认结构是月薪还是年薪，核对合同的工资周期，避免按错口径计算。
- 归档而非删除旧薪资结构：在用的工资条引用其结构，删除会导致引用断裂。
- Odoo Payroll 仅企业版可用，社区版无 `hr_payroll`。
- 美国合规（W2、941、州 SUI/SDI）需基础本地化之外的额外模块。

## 互见

- 领域/ERP 其他 Odoo 配置技能（会计、合同管理）。
- 各国薪酬本地化模块文档：`l10n_*_hr_payroll`、OCA 社区仓库。

---

采编自 sickn33/antigravity-awesome-skills（MIT）。
