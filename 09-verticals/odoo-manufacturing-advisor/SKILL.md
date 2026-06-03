---
name: odoo-manufacturing-advisor
title: Odoo 制造 MRP 规划
description: 当在 Odoo 配置物料清单/工作中心、跑 MRP 排程或排查生产订单缺料时使用；做 BoM/工序/补货规则配置与 MRP 运行结果解读，产出可落地的菜单路径与参数；不适用于 Maintenance/PLM/Quality 模块及外部预测对接；触发词：物料清单、MRP、生产订单
domain: 领域/erp
triggers: [Odoo 制造, 物料清单 BoM, 工作中心 Work Center, MRP 排程, 补货规则, 生产订单缺料, 套件 Kit, 委外加工]
tags: [ERP, Odoo, 制造, MRP, 供应链]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [odoo-inventory-optimizer, odoo-purchase-workflow, odoo-sales-crm-expert, odoo-module-developer]
combines_with: [odoo-orm-expert, inventory-demand-planning]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用场景：
- 为成品创建或拆解物料清单（BoM），含组件、工序、变体。
- 配置工作中心的产能、时间效率、OEE 目标与单位工时成本。
- 运行 MRP 排程，根据需求自动生成采购单（PO）与生产订单（MO）。
- 排查生产订单差异或组件缺料，解读补货异常消息。

不该用（负边界）：
- Maintenance（维护）、PLM（产品生命周期）、Quality（质量）属独立企业版模块，本条目不覆盖。
- 委外加工（Subcontracting）的收货与计价细节、生产环节的批次/序列号追溯，仅提示风险，未展开。
- 需求来源为外部系统预测（非销售订单 / 再订货规则）时，需自定义集成，超出范围。

## 步骤

1. 确认需求场景：成品结构、产能配置、还是补货/缺料排查。
2. 在 Manufacturing 设置中启用 Work Orders，方可使用工序路由与按工序计时。
3. 按下文「指令」逐项配置 BoM、工作中心，再运行 MRP 排程。
4. 运行后到 Replenishment 复核异常消息，理解 Replenish / Reschedule / Cancel 三类含义后再决定是否人工干预。

## 指令

创建物料清单（BoM）：
```text
菜单：Manufacturing → Products → Bills of Materials → New
Product   ：成品名（如 Finished Widget v2）
BoM Type  ：Manufacture This Product
Quantity  ：1（每份 BoM 产出 1 件）

Components 页签：
  Raw Plastic Sheet | Qty 0.5 | 单位 kg
  Steel Bolt M6     | Qty 4   | 单位 Units
  Rubber Gasket     | Qty 1   | 单位 Units

Operations 页签（需先启用 Work Orders）：
  Injection Molding | 工作中心 Press A | 时长 30 min
  Assembly          | 工作中心 Line 1  | 时长 15 min
```

BoM 类型区分（关键约束，勿混淆）：
- Manufacture This Product：标准生产 BoM，会创建生产订单（MO）。
- Kit（套件）：作为组合销售，组件分别发货，不创建 MO。
- Subcontracting（委外）：组件发给委外方，由其返回成品。

配置工作中心：
```text
菜单：Manufacturing → Configuration → Work Centers → New
Work Center     ：CNC Machine 1
Working Hours   ：Standard 40h/week
Time Efficiency ：85%（计入停机；85% = 每周 34 有效小时）
Capacity        ：2（可同时运行 2 道生产工序）
OEE Target      ：90%（设备综合效率 KPI 目标）
Costs per Hour  ：$75.00（用于制造成本核算）
```

运行 MRP 排程：
```text
默认每日 cron 自动运行；手动触发：
菜单：Inventory → Operations → Replenishment → Run Scheduler
     （部分版本为 Manufacturing → Planning → Replenishment）

运行后复核异常：Inventory → Operations → Replenishment
消息类型：
  Replenish  — 库存低于最小值，需开 PO 或 MO
  Reschedule — 订单计划日期与需求冲突
  Cancel     — 需求已消失，可取消该订单
```

## 示例

为多配置成品（颜色 / 尺寸 / 电压）排产：用产品属性建立带变体的 BoM，避免为每个变体重复维护 BoM；在组件上设置 Lead Times（供应商交期 + 安全交期），让 MRP 提前排出采购单，运行排程后在 Replenishment 按消息类型核对，仅在有充分理由时覆盖 MRP 建议。

## 注意事项

- 启用 Work Orders 才能按工序做路由与计时。
- MRP 托管的物料不要手动开采购单，除非有正当理由覆盖建议。
- 生产中报废缺陷件用 Scrap Orders，切勿手动调整库存。
- 切勿把 Kit 当成 Manufacture This Product —— Kit 永不生成 MO。
- 批次 / 序列号追溯会显著增加复杂度，先用小批量试跑再全量铺开。

## 互见

- 采购与库存补货规则、销售订单驱动需求的相关条目（领域/ERP）。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
