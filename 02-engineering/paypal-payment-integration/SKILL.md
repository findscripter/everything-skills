---
name: paypal-payment-integration
title: PayPal 支付集成
description: 当在后端接入 PayPal 收款、订阅或退款时使用；做 Orders v2 创建/捕获订单、IPN/Webhook 验签去重、Billing 订阅与退款的服务端落地；不适用于 Stripe/支付宝等其他支付渠道或纯前端按钮渲染；触发词：PayPal、Express Checkout、IPN、订阅扣费、退款
domain: 研发/backend
triggers: [接入 PayPal 收款, 实现 Express Checkout 快捷结账, PayPal 订阅/周期扣费, 处理 PayPal 退款或争议, 处理 PayPal IPN/Webhook 回调, 支持国际多币种支付, PayPal Smart Buttons]
tags: [paypal, 支付集成, 后端, webhook, ipn, 订阅计费, 退款, rest-api]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [PayPal REST API (Orders v2 / Billing v1 / Payments v2), paypalrestsdk, PayPal JS SDK (Smart Buttons), requests, Flask]
requires: []
related: [stripe-integration, plaid-fintech-integration, agent-payment-x402, billing-automation-systems]
combines_with: [rest-api-endpoint-builder, transactional-email-template-builder, error-handling-patterns]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：在服务端接入 PayPal 作为支付方式，包括一次性收款（Express Checkout / Smart Buttons）、订阅与周期扣费、退款与争议处理、IPN/Webhook 异步通知验签、国际多币种支付。

不该用（负边界）：
- 任务与 PayPal 无关，或目标是 Stripe、支付宝、微信支付等其他渠道。
- 只需前端渲染按钮、无服务端验证（前端回调不可信，必须服务端二次确认）。
- 缺少 client_id / client_secret、环境（sandbox/live）、币种或回调 URL 等必要输入时，先停下来澄清，不要硬编码假值。

## 步骤

1. 明确目标与约束：收款场景（单次/订阅/退款）、环境（sandbox 还是 live）、币种、回调与 IPN/Webhook 地址。
2. 用 client_credentials 换取 OAuth access_token（`/v1/oauth2/token`）。
3. 服务端创建订单 `POST /v2/checkout/orders`（intent=CAPTURE），前端用 Smart Buttons 拉起审批。
4. 用户审批后，**由服务端**捕获 `POST /v2/checkout/orders/{id}/capture`，切勿仅信任前端 `onApprove`。
5. 配置异步通知（IPN 或 Webhook）：收到后回传 PayPal 验签，再按 `payment_status` 落库、去重、发货。
6. 按需创建订阅计划/订阅、处理退款，并对所有 API 调用包裹统一错误处理。
7. 全程先在 sandbox 用测试买卖家账号验证，再切 live。

## 指令

- 环境隔离：sandbox 用 `https://api-m.sandbox.paypal.com`，生产用 `https://api-m.paypal.com`；IPN 验签 sandbox 用 `https://ipnpb.sandbox.paypal.com/cgi-bin/webscr`。切勿混用凭据与 URL。
- IPN 验签：原样复制收到的表单字段，追加 `cmd=_notify-validate` 回传 PayPal，仅当响应文本为 `VERIFIED` 才处理。
- 幂等去重：按 `txn_id` 判断是否已处理，防止重复通知重复发货。
- 凭据与环境（mode/币种/回调 URL）全部走配置，不硬编码。

## 示例

前端 Smart Buttons（仅拉起 + 回传服务端，不在前端确认收款）：
```html
<div id="paypal-button-container"></div>
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID&currency=USD"></script>
<script>
paypal.Buttons({
  createOrder: (data, actions) => actions.order.create({
    purchase_units: [{ amount: { value: '25.00' } }]
  }),
  onApprove: (data, actions) =>
    fetch('/api/paypal/capture', {              // 交给服务端捕获/校验
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ orderID: data.orderID })
    })
}).render('#paypal-button-container');
</script>
```

服务端客户端（取 token / 建单 / 捕获）：
```python
import requests

class PayPalClient:
    def __init__(self, client_id, client_secret, mode='sandbox'):
        self.client_id, self.client_secret = client_id, client_secret
        self.base_url = ('https://api-m.sandbox.paypal.com' if mode == 'sandbox'
                         else 'https://api-m.paypal.com')
        self.access_token = self.get_access_token()

    def get_access_token(self):
        r = requests.post(f"{self.base_url}/v1/oauth2/token",
                          headers={"Accept": "application/json", "Accept-Language": "en_US"},
                          data={"grant_type": "client_credentials"},
                          auth=(self.client_id, self.client_secret))
        return r.json()['access_token']

    def create_order(self, amount, currency='USD'):
        return requests.post(f"{self.base_url}/v2/checkout/orders",
            headers={"Content-Type": "application/json",
                     "Authorization": f"Bearer {self.access_token}"},
            json={"intent": "CAPTURE",
                  "purchase_units": [{"amount": {"currency_code": currency, "value": str(amount)}}]}
        ).json()

    def capture_order(self, order_id):
        return requests.post(f"{self.base_url}/v2/checkout/orders/{order_id}/capture",
            headers={"Content-Type": "application/json",
                     "Authorization": f"Bearer {self.access_token}"}).json()
```

IPN 验签与分发（核心约束）：
```python
@app.route('/ipn', methods=['POST'])
def handle_ipn():
    ipn = request.form.to_dict()
    if not verify_ipn(ipn):
        return 'IPN verification failed', 400
    status = ipn.get('payment_status')
    if status == 'Completed':  handle_payment_completed(ipn)  # 内部按 txn_id 去重
    elif status == 'Refunded': handle_refund(ipn)
    elif status == 'Reversed': handle_chargeback(ipn)
    return 'IPN processed', 200

def verify_ipn(ipn):
    data = ipn.copy(); data['cmd'] = '_notify-validate'
    url = 'https://ipnpb.sandbox.paypal.com/cgi-bin/webscr'  # 生产换正式域名
    return requests.post(url, data=data).text == 'VERIFIED'
```

退款（部分退款传 amount，否则全额）：
```python
# POST /v2/payments/captures/{capture_id}/refund
payload = {}
if amount: payload["amount"] = {"value": str(amount), "currency_code": "USD"}
if note:   payload["note_to_payer"] = note
```

订阅：先 `POST /v1/billing/plans` 建计划（需先有 product_id），再 `POST /v1/billing/subscriptions` 建订阅，从返回 `links` 中取 `rel == 'approve'` 的审批 URL 引导用户。

## 注意事项

- 永远验签 IPN/Webhook，绝不直接信任未验证的通知。
- 幂等处理：按 `txn_id` 去重，应对重复通知。
- 环境隔离：不要混用 sandbox 与 live 的 URL/凭据。
- 覆盖全部支付状态（Completed/Refunded/Reversed 等），不要漏处理回调。
- 别仅依赖前端回调；以服务端捕获 + 异步通知为准（双保险）。
- 显式指定币种；记录所有交易与错误日志；先在 sandbox 充分测试。
- 本技能不替代针对你环境的验证、测试与专家评审。

## 互见

- 源附带的参考资料（可在 vendor 目录查阅）：`references/express-checkout.md`、`references/ipn-handling.md`、`references/refund-workflows.md`、`references/billing-agreements.md`，以及 `assets/paypal-client.py`、`assets/ipn-processor.py`、`assets/recurring-billing.py`。
- 同域可比对其他支付渠道集成技能（如 Stripe）。

---
采编自 sickn33/antigravity-awesome-skills（MIT License），适配重写而非逐字翻译。
