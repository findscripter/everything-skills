---
name: odoo-shopify-integration
title: Odoo 与 Shopify 集成
description: 当需要把 Shopify 店铺与 Odoo ERP 双向同步（商品、库存、订单、客户）时使用；做数据流设计与字段映射，并产出 Shopify Webhook 接收端 + Odoo XMLRPC 写入代码；不适用于纯 Shopify 内部配置、与 Odoo 无关的电商任务或非 Odoo/Shopify 平台对接；触发词：Odoo、Shopify、订单同步、库存同步、XMLRPC、Webhook
domain: 领域/erp
triggers: [Odoo Shopify 集成, Shopify 订单同步到 Odoo, Odoo 库存同步 Shopify, Shopify Webhook 创建 Odoo 销售订单, Odoo XMLRPC 对接 Shopify, 商品变体映射 Odoo 模板, 电商 ERP 打通]
tags: [odoo, shopify, erp, 电商集成, webhook, xmlrpc, 库存同步, 订单同步, 数据集成]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Python, xmlrpc.client, requests, Flask, Shopify REST/Webhook API, Odoo External API (XMLRPC)]
requires: []
related: [odoo-ecommerce-configurator, odoo-rpc-api, odoo-edi-connector, shopify-app-development]
combines_with: [odoo-inventory-optimizer, odoo-sales-crm-expert, shopify-app-development]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

在 Shopify 前台卖货、用 Odoo 管后端（库存/财务/履约）并需要两者打通时使用，典型场景：

- Shopify 下单后自动在 Odoo 生成销售订单（`sale.order`）。
- 把 Odoo 库存（`stock.quant`）实时回写为 Shopify 商品可售数量。
- 将 Shopify 商品变体映射到 Odoo 产品模板/变体。
- 按客户邮箱在 Odoo 查找或新建 `res.partner`。

可选两条路线：Odoo 企业版官方 Shopify 连接器（开箱即用、定制弱），或自建 Shopify REST + Webhook 配合 Odoo XMLRPC（灵活、需自己维护）。本条目聚焦自建方案。

**不该用的边界**
- 纯 Shopify 内部配置、主题/营销等与 Odoo 无关的电商任务。
- 对接非 Odoo / 非 Shopify 的平台（如 WooCommerce、SAP）。
- 缺少必要凭据、权限或「主数据源」决策时，先停下来澄清，不要硬上。
- 输出代码是脚手架，不能替代针对你具体环境的测试与专家评审。

## 步骤

1. **定数据流方向**：先明确每类数据谁是「单一可信源（master）」。推荐：商品/库存以 Odoo 为准向 Shopify 同步；订单/客户由 Shopify 推向 Odoo。
   ```
   SHOPIFY                          ODOO
   商品目录   <──────同步──────  产品模板 + 变体
   库存水位   <──────同步──────  stock.quant（实时）
   新订单     ───────推送─────> sale.order（自动确认）
   客户       ───────推送─────> res.partner（不存在则创建）
   履约/发货  <──────推送──────  出库单已校验
   ```
2. **定唯一键**：用 SKU / Odoo 内部参考（`default_code`）作为两端商品匹配键，不要用 Shopify product_id。
3. **接 Webhook**：在 Shopify 后台为 `orders/create` 等事件注册 Webhook，指向你的接收端。
4. **写 Odoo**：通过 XMLRPC `execute_kw` 查找/创建客户与订单。
5. **校验与幂等**：处理任何 payload 前先验 HMAC 签名；用订单号去重，避免重复建单。

## 指令

- Odoo XMLRPC 端点：`{odoo_url}/xmlrpc/2/object`，调用 `models.execute_kw(db, uid, pwd, model, method, args, kwargs)`。
- 查客户：`res.partner` + `search_read`，按 `email` 过滤。
- 建订单：`sale.order` + `create`，订单行用 `(0, 0, {...})` 三元组写入 `order_line`。
- 查商品 id：`product.product` + `search_read`，按 `default_code`（SKU）过滤。
- 库存读取：`stock.quant`；销售订单引用号建议写 `client_order_ref = "Shopify #<order_number>"`。

## 示例

**示例 1：根据 Shopify 订单在 Odoo 建销售订单（Python / XMLRPC）**

```python
import xmlrpc.client, requests

odoo_url = "https://myodoo.example.com"
db, uid, pwd = "my_db", 2, "api_key"
models = xmlrpc.client.ServerProxy(f"{odoo_url}/xmlrpc/2/object")

def create_odoo_order_from_shopify(shopify_order):
    # 按邮箱查找或新建客户
    partner = models.execute_kw(db, uid, pwd, 'res.partner', 'search_read',
        [[['email', '=', shopify_order['customer']['email']]]],
        {'fields': ['id'], 'limit': 1})
    partner_id = partner[0]['id'] if partner else models.execute_kw(
        db, uid, pwd, 'res.partner', 'create', [{
            'name': shopify_order['customer']['first_name'] + ' ' + shopify_order['customer']['last_name'],
            'email': shopify_order['customer']['email'],
        }])

    # 创建销售订单
    order_id = models.execute_kw(db, uid, pwd, 'sale.order', 'create', [{
        'partner_id': partner_id,
        'client_order_ref': f"Shopify #{shopify_order['order_number']}",
        'order_line': [(0, 0, {
            'product_id': get_odoo_product_id(line['sku']),
            'product_uom_qty': line['quantity'],
            'price_unit': float(line['price']),
        }) for line in shopify_order['line_items']],
    }])
    return order_id

def get_odoo_product_id(sku):
    result = models.execute_kw(db, uid, pwd, 'product.product', 'search_read',
        [[['default_code', '=', sku]]], {'fields': ['id'], 'limit': 1})
    return result[0]['id'] if result else False
```

**示例 2：Shopify Webhook 实时接单（Flask）**

```python
from flask import Flask, request
app = Flask(__name__)

@app.route('/webhook/shopify/orders', methods=['POST'])
def shopify_order_webhook():
    shopify_order = request.json
    # 生产环境：先校验 X-Shopify-Hmac-Sha256 签名再处理
    order_id = create_odoo_order_from_shopify(shopify_order)
    return {"odoo_order_id": order_id}, 200
```

## 注意事项

- **用 Webhook 而非轮询**：实时订单走 Shopify Webhook，少用定时拉取。
- **必验 HMAC**：处理任何 payload 前校验 Webhook 签名，拒绝伪造请求。
- **SKU 作唯一键**：跨平台稳定，别用 Shopify product_id。
- **单一可信源**：库存只让一侧当 master，切勿两端同时回写同一字段，否则会互相覆盖。
- **凭据安全**：Odoo `api_key`、Shopify 密钥用环境变量/密钥管理，勿硬编码。
- **幂等去重**：以订单号判重，防止 Webhook 重投导致重复建单。

## 互见

- 同卷领域/ERP 下的 Odoo 相关条目（产品、库存、销售模块）。
- 通用「Webhook 接收与签名校验」「数据集成主数据源设计」实践条目。

---
*采编自 sickn33/antigravity-awesome-skills（MIT 许可证），已按中文「技能大典」适配重写。*
