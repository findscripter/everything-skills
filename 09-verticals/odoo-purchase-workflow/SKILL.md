---
name: odoo-purchase-workflow
title: Odoo 采购工作流
description: 当在 Odoo 中搭建或排查采购流程（询价单→采购订单→收货→供应商账单）时使用；产出含确切菜单路径、字段配置与三单匹配诊断的可执行指引，覆盖采购审批、供应商价目表、自动补货。不适用于分包采购（需制造模块）、EDI 自动单据交换或多层级审批矩阵。触发词：RFQ、采购订单、三单匹配、供应商账单、采购审批
domain: 领域/erp
triggers: [Odoo 采购, RFQ 询价单, 采购订单 PO, 三单匹配, 供应商账单, 采购审批, 供应商价目表, 收货验证, Bill Control]
tags: [ERP, Odoo, 采购, 供应链, 三单匹配, 工作流]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Odoo Purchase 模块, Odoo Inventory 模块, Odoo Accounting 模块]
requires: []
related: [odoo-inventory-optimizer, odoo-manufacturing-advisor, odoo-accounting-setup, odoo-sales-crm-expert]
combines_with: [odoo-inventory-optimizer, odoo-accounting-setup, odoo-edi-connector]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 为新 Odoo 实例搭建采购流程（RFQ → PO → 收货 → 供应商账单）。
- 配置采购订单审批工作流（两级审批/金额阈值）。
- 配置供应商价目表与阶梯数量折扣。
- 排查三单匹配（PO 数量 / 收货数量 / 账单数量）不一致导致的账务差异。

不该用（负边界）：
- 分包/委外采购流程——需制造模块与分包 BoM 类型，不在本技能范围。
- EDI 自动单据交换（PO 自动导入/导出）——需定制集成。
- 多维审批矩阵（按部门、多层级）——两级审批仅是二元金额阈值，复杂场景需定制开发或 Approvals 应用。
- 价目表跨币种换算依赖 Odoo 内的实时汇率，本技能不负责维护汇率准确性。

## 步骤

1. 描述采购场景，明确处于流程哪一环（询价 / 下单 / 收货 / 对账）。
2. 按标准链路推进单据：RFQ → 确认为 PO → 收货验证 → 创建并核对账单 → 登记付款。
3. 对账失败时，先核对「PO 数量 = 收货数量 = 账单数量」三者是否一致，再定位差异根因。

## 指令

标准链路（RFQ → PO → 收货 → 账单 / 三单匹配）：

```text
1. 创建 RFQ
   菜单：Purchase → Orders → Requests for Quotation → New
   供应商：选择供应商；添加产品行，填数量与单价
2. 发送 RFQ
   点击 "Send by Email" → 供应商收到含 RFQ 明细的 PDF
3. 确认为采购订单
   点击 "Confirm Order" → 状态变为 "Purchase Order"
4. 收货
   点击 "Receive Products" → 验证收货数量
   （支持部分收货；剩余数量保持 PO 开放）
5. 三单匹配
   点击 "Create Bill" → 账单按 PO 数量预填
   核对：PO 数量 = 收货数量 = 账单数量
   过账 → 登记付款
```

启用两级采购审批：

```text
菜单：Purchase → Configuration → Settings
  ☑ Purchase Order Approval
  Minimum Order Amount: $5,000
结果：
  金额 ≤ $5,000 → 直接确认为 PO
  金额 > $5,000 → 状态 "Waiting for Approval"，需采购经理点击 "Approve"
```

供应商价目表（按产品配置阶梯折扣）：

```text
注意：价目表配置在产品上，没有全局菜单入口。
菜单：Inventory → Products → [选择产品] → Purchase Tab
  → Vendor Pricelist 区 → Add a line
  Vendor / Currency / Price / Min. Qty
阶梯示例：Min.Qty 1 → $12.00；Min.Qty 100 → $10.50；Min.Qty 500 → $9.00
结果：Odoo 按该供应商的下单数量自动选取对应价格。
```

## 示例

场景：某供应商账单总额始终与采购金额对不上。
- 检查 Bill Control 策略是否设为 "Based on received quantities"（按收货数量），而非按订购数量；后者在部分收货时会让账单数量与收货数量错位。
- 核对该 PO 是否存在多次部分收货，确认账单是否覆盖全部已收数量。
- 若账单未关联收货单，三单匹配被绕过，会产生账务差异——补建关联或重开账单。

## 注意事项

- 应当：对超过公司审批阈值的订单启用 Purchase Order Approval。
- 应当：对有年度框架合同的常驻供应商使用 Purchase Agreements（Blanket Orders / 框架订单）。
- 应当：在产品 Purchase 标签设置供应商交货周期（vendor lead time），便于 Odoo 准确排程到货日期。
- 应当：将 Bill Control 设为「按收货数量」，保证三单匹配准确。
- 不要：价格未谈妥就确认 PO——先用 Draft/RFQ 状态议价。
- 不要：在未关联收货的情况下过账供应商账单，绕过三单匹配会造成账务差异。
- 不要：删除已有收货数量的 PO——改为归档（archive），以保留库存与账务轨迹。

## 互见

- 制造 / 分包采购流程（需制造模块与分包 BoM）。
- EDI 单据自动交换的集成方案。
- Approvals 应用用于多层级审批矩阵。

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可证）。
