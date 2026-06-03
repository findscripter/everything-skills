---
name: odoo-inventory-optimizer
title: Odoo 库存优化
description: 当配置/优化 Odoo 库存（计价、补货、上架、多步仓库流）时使用；做出带精确菜单路径的可执行配置方案；不适用于到岸成本、跨仓调拨复杂路由及无会计模块的社区版自动计价。触发词：Odoo 库存、补货规则、库存计价（FIFO/AVCO）、上架规则、多步仓库流
domain: 领域/erp
triggers: [配置 Odoo 库存, 选择 FIFO 还是 AVCO 计价, 设置最小/最大补货规则, 设计两步收货/三步发货流程, 配置上架规则把货分到指定库位, 排查负库存或计价错误]
tags: [Odoo, ERP, 库存管理, WMS, 供应链]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Odoo Inventory, Odoo Accounting]
requires: []
related: [odoo-purchase-workflow, odoo-manufacturing-advisor, odoo-sales-crm-expert, odoo-accounting-setup]
combines_with: [odoo-purchase-workflow, odoo-manufacturing-advisor]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用场景：

- 选择并配置 FIFO 与 AVCO 库存计价方法。
- 设置最小库存补货规则（Min/Max），避免缺货。
- 设计多步仓库流程（两步收货、三步发货：拣货→包装→发运）。
- 配置上架规则（Putaway），把产品自动导向指定存储库位。
- 排查负库存、计价错误或缺失库存移动。

不该用的边界（改用其他方案）：

- 到岸成本（进口关税、运费分摊到产品成本）：需安装 `stock_landed_costs` 模块，本技能不覆盖。
- 跨仓库调拨的复杂路由（中转库位、公司间开票）不在此范围。
- 自动库存计价依赖 Accounting（会计）模块；无会计模块的社区版无法过库存日记账，只能用手工计价。

## 步骤

1. 描述仓库场景（计价口径、SKU 数量、库位结构、收发货步数）。
2. 按下方「指令」给出对应配置，照搬精确菜单路径逐项设置。
3. 对快速周转品启用自动补货规则，并按需开启上架规则提升库存准确性。

## 指令

启用基础能力：`Inventory → Configuration → Settings`，开启 `Storage Locations`（存储库位）与 `Multi-Step Routes`（多步路线）。计价方法（Costing Method）按「产品类别」设置，不要全局统一设。

FIFO 计价（按类别）：`Inventory → Configuration → Product Categories → Edit`，设 `Costing Method: First In First Out (FIFO)`、`Inventory Valuation: Automated`，并配齐三个会计科目：`Stock Valuation`（资产负债表存货科目）、`Stock Input`（已收未结）、`Stock Output`（已发未开票）。

补货规则：`Inventory → Operations → Replenishment → New`，设 `Min Qty`（低于则触发补货）、`Max Qty`（补到该量）、`Multiple Qty`（按倍数下单）、`Route: Buy`（自动生成采购单）或 `Manufacture`（生成生产单）。

上架规则：`Inventory → Configuration → Putaway Rules → New`，按产品类别或单品指定目标库位；`Product` 留空则规则作用于整个类别。收货校验时 Odoo 会自动建议目标库位。

三步发货：`Inventory → Configuration → Warehouses → [仓库]`，`Outgoing Shipments` 选 `Pick + Pack + Ship`，自动生成 PICK（货架→打包区）、PACK（打包+打印面单）、OUT（交承运/发运）三个作业。

## 示例

最小/最大补货规则（A4 办公纸）：

```text
Menu: Inventory → Operations → Replenishment → New
Product: Office Paper A4
Location: WH/Stock
Min Qty: 100      # 低于 100 触发补货
Max Qty: 500      # 补货补到 500
Multiple Qty: 50  # 始终按 50 的倍数下单
Route: Buy        # 自动触发采购单（或 Manufacture 触发生产单）
```

上架规则（冷藏品/电子产品）：

```text
Menu: Inventory → Configuration → Putaway Rules → New
产品类别 Refrigerated Goods  → WH/Stock/Cold Storage
产品     Laptop Model X      → WH/Stock/Electronics/Shelf A
# Product 留空 = 规则作用于整个类别
```

## 注意事项

- 高价值或受监管物料（医疗器械、电子产品）启用 Lots/Serial Numbers（批次/序列号）。
- 至少每季度做一次实物盘点调整（`Inventory → Operations → Physical Inventory`）以纠正偏差。
- 多存储分区的仓库务必启用上架规则，消除人工选库位的错误。
- 不要在已记录交易后切换计价方法（FIFO ↔ AVCO），会产生错误的历史成本数据。
- 不要用「Update Quantity」修库存错误，一律走 Inventory Adjustments（库存调整）以保留审计轨迹。
- 不要在同一库位混放不同计价方法的产品类别，除非清楚其对计价的影响。
- 单件级序列号跟踪（每行一个 SN）会显著增加 UI 开销，大批量启用前先压测性能。

## 互见

- 库存计价落账依赖会计模块，涉及科目配置时配合 Odoo Accounting 相关技能。
- 到岸成本场景见 `stock_landed_costs` 模块文档。

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
