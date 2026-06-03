---
name: odoo-edi-connector
title: Odoo EDI 电子数据交换
description: 当需要在 Odoo 中对接 EDI（X12/EDIFACT）实现 B2B 单据自动化时使用；做 EDI 报文与 Odoo 业务对象的字段映射、贸易伙伴配置及入站/出站单据解析入库（产出映射表+Python 解析代码）；不适用于纯人工录单、非 EDI 的 API/CSV 对接或一次性数据导入；触发词：EDI、X12、850/856/810、EDIFACT、贸易伙伴对接
domain: 领域/erp
triggers: [EDI, X12, EDIFACT, 850 采购订单, 856 ASN, 810 发票, 997 功能确认, 贸易伙伴对接, B2B 单据自动化, odoo edi]
tags: [odoo, erp, edi, x12, edifact, b2b集成, 订单自动化, xmlrpc]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [pyx12, xmlrpc.client, Odoo external API]
requires: []
related: [odoo-rpc-api, odoo-module-developer, odoo-purchase-workflow, odoo-shopify-integration]
combines_with: [odoo-module-developer, odoo-inventory-optimizer, odoo-purchase-workflow]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用于把 EDI（电子数据交换）单据自动接入 Odoo 的场景：

- 零售/大客户要求用 EDI 850（采购订单）下单，需自动生成 `sale.order`。
- 发货时需回传 EDI 856（ASN，预先发货通知）。
- 从 Odoo 已确认的交货单自动生成 EDI 810（发票）。
- 为新贸易伙伴建立 EDI 字段到 Odoo 字段的映射。

不该用：纯人工录单、用普通 REST/CSV/Excel 对接（不走 EDI 标准报文）、一次性历史数据迁移，或贸易伙伴尚未约定 ISA/GS 标识与传输通道时——这些情况下先澄清需求再说。

## 步骤

1. **确认范围**：明确 EDI 交易集（如 850/856/810）、标准（X12 或 EDIFACT）与具体贸易伙伴。
2. **建立映射**：按下表把 EDI 段落映射到 Odoo 业务对象，逐字段对齐。
3. **落地自动化**：用 Python 解析入站 EDI 文件，幂等地创建 Odoo 记录；出站则按模板拼装报文。

### EDI ↔ Odoo 对象映射

| EDI 交易集 | Odoo 对象 |
|---|---|
| 850 采购订单 | `sale.order`（入站客户 PO） |
| 855 PO 确认 | 确认邮件 / SO 确认 |
| 856 ASN 预先发货通知 | `stock.picking`（交货单） |
| 810 发票 | `account.move`（客户发票） |
| 846 库存查询 | `product.product` 库存水平 |
| 997 功能确认 | 自动回执确认 |

## 指令

- 解析依赖 `pip install pyx12`；通过 `xmlrpc.client` 调 Odoo external API。
- 凭据走环境变量：`ODOO_URL` / `ODOO_DB` / `ODOO_API_KEY` / `ODOO_UID`。
- 关键段落：850 头部 `BEG`（PO 号、日期）、`N1`（买方）、`PO1`（行项目，SKU/数量/单价）。
- 写入前必做幂等校验：用 PO 号查 `sale.order.client_order_ref`，已存在则跳过。

## 示例

### 示例 1：解析 EDI 850 并创建 Odoo 销售订单

```python
from pyx12 import x12file  # pip install pyx12
import xmlrpc.client, os

odoo_url = os.getenv("ODOO_URL")
db  = os.getenv("ODOO_DB")
pwd = os.getenv("ODOO_API_KEY")
uid = int(os.getenv("ODOO_UID", "2"))
models = xmlrpc.client.ServerProxy(f"{odoo_url}/xmlrpc/2/object")

def process_850(edi_file_path):
    """解析 X12 850 采购订单并创建 Odoo 销售订单"""
    with x12file.X12File(edi_file_path) as f:
        for transaction in f.get_transaction_sets():
            # 头部信息（BEG 段）
            po_number = transaction['BEG'][3]   # 采购订单号
            po_date   = transaction['BEG'][5]   # 采购订单日期

            # 幂等校验：PO 在 Odoo 中是否已存在
            existing = models.execute_kw(db, uid, pwd, 'sale.order', 'search',
                [[['client_order_ref', '=', po_number]]])
            if existing:
                print(f"跳过：PO {po_number} 已存在。")
                continue

            # 买方（N1 段）
            partner_name = transaction.get_segment('N1')[2] if transaction.get_segment('N1') else "Unknown"
            partner = models.execute_kw(db, uid, pwd, 'res.partner', 'search',
                [[['name', 'ilike', partner_name]]])
            if not partner:
                print(f"错误：未找到客户 '{partner_name}'，跳过该交易。")
                continue
            partner_id = partner[0]

            # 行项目（PO1 段）
            order_lines = []
            for po1 in transaction.get_segments('PO1'):
                sku   = po1[7]          # 产品编码
                qty   = float(po1[2])
                price = float(po1[4])
                product = models.execute_kw(db, uid, pwd, 'product.product', 'search',
                    [[['default_code', '=', sku]]])
                if product:
                    order_lines.append((0, 0, {
                        'product_id': product[0],
                        'product_uom_qty': qty,
                        'price_unit': price,
                    }))

            # 创建销售订单
            if partner_id and order_lines:
                models.execute_kw(db, uid, pwd, 'sale.order', 'create', [{
                    'partner_id': partner_id,
                    'client_order_ref': po_number,
                    'order_line': order_lines,
                }])
```

### 示例 2：生成 EDI 997 功能确认

```python
from datetime import datetime

def generate_997(isa_control, gs_control, transaction_control):
    """为收到的 EDI 生成功能确认（997）"""
    today = datetime.now().strftime('%y%m%d')
    return f"""ISA*00*          *00*          *ZZ*YOURISAID      *ZZ*PARTNERISAID   *{today}*1200*^*00501*{isa_control}*0*P*>~
GS*FA*YOURGID*PARTNERGID*{today}*1200*{gs_control}*X*005010X231A1~
ST*997*0001~
AK1*PO*{gs_control}~
AK9*A*1*1*1~
SE*4*0001~
GE*1*{gs_control}~
IEA*1*{isa_control}~"""
```

## 注意事项

- 处理前先把每一条原始 EDI 报文存入审计日志表，便于追溯。
- 收到交易后 24 小时内务必回发 997 功能确认。
- 上线前与贸易伙伴约定测试周期，测试环境用 ISA 限定符 `T`（生产为 `P`）。
- 不要在 Web 请求中同步处理 EDI 文件——交给异步队列。
- 不要硬编码贸易伙伴的 ISA/GS 等限定符——按伙伴存进配置表。
- 输出不能替代针对具体环境的校验、测试与专家复核；缺少必要输入、权限、安全边界或验收标准时，停下来澄清。

## 互见

- Odoo external API（XML-RPC）调用规范与鉴权
- X12 / EDIFACT 报文结构与段落字典

---

采编自 sickn33/antigravity-awesome-skills（MIT）。
