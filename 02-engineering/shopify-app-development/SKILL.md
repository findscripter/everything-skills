---
name: shopify-app-development
title: Shopify 应用与主题开发
description: 当用 Shopify CLI 开发应用/扩展/主题，调用 GraphQL Admin API，配置 OAuth、Webhook、计费、访问域、metafield 或 Shopify Functions 时使用；做脚手架搭建、GraphQL 查询/变更、Liquid 模板与扩展编码并落地可部署产物；不适用于通用电商建站、非 Shopify 平台或纯运营配置（无代码改动）；触发词：Shopify、shopify app、GraphQL Admin、Liquid、checkout extension、metafield、webhook、Polaris。
domain: 研发/backend
triggers: [Shopify, shopify app, shopify cli, GraphQL Admin API, Liquid, checkout extension, Shopify Functions, metafield, webhook, Polaris, shopify.app.toml]
tags: [shopify, graphql, liquid, ecommerce, app-development, backend]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [@shopify/cli, graphql, node, python]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 用 Shopify CLI 创建/运行/部署应用、扩展或主题。
- 调用 GraphQL Admin API 读写商品、订单、客户、库存、metafield。
- 配置 OAuth 鉴权、访问域（access scopes）、Webhook（含 GDPR 强制项）、计费 API。
- 开发 Checkout/Admin/POS UI 扩展或 Shopify Functions（折扣/支付/配送逻辑）。
- 用 Liquid 编写主题的 section/snippet，定制店面。

先做路由判断（选错产物会全程返工）：
- 要集成外部服务 / 商家工具 / 收费功能 → 建 App。
- 要定制结账、加 Admin UI、POS 动作、折扣规则 → 建 Extension。
- 要改店面设计、商品/集合页 → 建 Theme。
- 既要后端逻辑又要店面 UI → App + Theme Extension 组合。

不该用的边界：
- 非 Shopify 平台（WooCommerce、Magento、自研商城）→ 不适用。
- 通用建站、纯主题后台点选配置、无代码改动的运营操作 → 不属于本技能。
- 安全审计/依赖体检 → 转 `code-reviewer` / `dependency-auditor`。

## 步骤 / 指令

```
1. 路由：按上面四类判断要建 App / Extension / Theme / 组合。
2. 装 CLI 并初始化项目（见示例）。
3. 在 shopify.app.toml 配 access_scopes，遵循最小权限。
4. 写 GraphQL 查询/变更：只取所需字段，游标分页，>250 条用 bulk operations。
5. 扩展/主题编码：扩展用 @shopify/ui-extensions-react；主题用 Liquid section/snippet。
6. 配 Webhook（含 GDPR 三件套）并校验 HMAC 签名。
7. shopify app dev 本地联调（带隧道）；shopify app deploy 发布扩展。
8. 提交前确认 API 版本（季度发布，12 个月弃用窗口），用 GraphiQL 验证 schema。
```

规则：
- 新开发一律优先 GraphQL，不用 REST。
- 凭据进环境变量，禁止硬编码；嵌入式应用用 session token。
- Webhook 处理前必先验 HMAC；OAuth 校验 state 防 CSRF。
- 限流用指数退避，监控 `X-Shopify-Shop-Api-Call-Limit` 头与 GraphQL 查询成本。

## 示例

安装与脚手架（CLI）：

```bash
npm install -g @shopify/cli@latest
shopify app init          # 新建 app
shopify app dev           # 启动带隧道的开发服务器
shopify app deploy        # 构建并上传扩展到 Shopify

# 生成扩展
shopify app generate extension --type checkout_ui_extension
shopify app generate extension --type admin_action
shopify app generate extension --type function

# 主题
shopify theme init
shopify theme dev         # 本地预览 localhost:9292
shopify theme push --development
```

访问域（`shopify.app.toml`）：

```toml
[access_scopes]
scopes = "read_products,write_products,read_orders,write_orders,read_customers"
```

GraphQL 查询商品（含游标分页）：

```graphql
query GetProducts($first: Int!, $query: String) {
  products(first: $first, query: $query) {
    edges {
      node { id title handle status
        variants(first: 5) { edges { node { id price inventoryQuantity } } }
      }
    }
    pageInfo { hasNextPage endCursor }
  }
}
```

写 metafield（变更 + 变量）：

```graphql
mutation SetMetafields($metafields: [MetafieldsSetInput!]!) {
  metafieldsSet(metafields: $metafields) {
    metafields { id namespace key value }
    userErrors { field message }
  }
}
```

```json
{ "metafields": [ {
  "ownerId": "gid://shopify/Product/123",
  "namespace": "custom", "key": "care_instructions",
  "value": "Handle with care", "type": "single_line_text_field"
} ] }
```

Checkout 扩展（React，礼品留言）：

```tsx
import { reactExtension, BlockStack, TextField, Checkbox,
  useApplyAttributeChange } from "@shopify/ui-extensions-react/checkout";

export default reactExtension("purchase.checkout.block.render", () => <GiftMessage />);

function GiftMessage() {
  const [isGift, setIsGift] = useState(false);
  const [message, setMessage] = useState("");
  const applyAttributeChange = useApplyAttributeChange();
  useEffect(() => {
    if (isGift && message)
      applyAttributeChange({ type: "updateAttribute", key: "gift_message", value: message });
  }, [isGift, message]);
  return (
    <BlockStack spacing="loose">
      <Checkbox checked={isGift} onChange={setIsGift}>This is a gift</Checkbox>
      {isGift && <TextField label="Gift Message" value={message} onChange={setMessage} multiline={3} />}
    </BlockStack>
  );
}
```

Liquid 商品卡 snippet：

```liquid
<div class="product-card">
  <a href="{{ product.url }}">
    {% if product.featured_image %}
      <img src="{{ product.featured_image | img_url: 'medium' }}"
           alt="{{ product.title | escape }}" loading="lazy">
    {% endif %}
    <h3>{{ product.title }}</h3>
    <p class="price">{{ product.price | money }}</p>
    {% if product.compare_at_price > product.price %}<p class="sale-badge">Sale</p>{% endif %}
  </a>
</div>
```

Webhook（`shopify.app.toml`，含 GDPR 强制项，过审必备）：

```toml
[webhooks]
api_version = "2026-01"

[[webhooks.subscriptions]]
topics = ["orders/create", "orders/updated"]
uri = "/webhooks/orders"

[webhooks.privacy_compliance]
customer_data_request_url = "/webhooks/gdpr/data-request"
customer_deletion_url = "/webhooks/gdpr/customer-deletion"
shop_deletion_url = "/webhooks/gdpr/shop-deletion"
```

## 注意事项

- API 版本 2026-01，季度发布、12 个月弃用窗口；报错提到 deprecated 字段时按错误信息迁移。
- 上架审核要求 GDPR 三个强制 Webhook（数据请求/客户删除/店铺删除）齐全，否则不予通过。
- 性能：扩展用懒加载，主题图片用 `img_url` 过滤器，数据不常变时缓存响应。
- 常见排障：限流 → 退避 + bulk operations + 看调用限额头；鉴权失败 → 查 token 有效性与已授权 scope；扩展不显示 → 确认 target 正确且已 deploy、应用已装到测试店；Webhook 收不到 → URL 须公网可达 + HMAC 校验逻辑 + 看 Partner Dashboard 日志；GraphQL 报错 → 用 GraphiQL 对 schema 验证。
- 官方文档：https://shopify.dev/docs ；GraphQL Admin：https://shopify.dev/docs/api/admin-graphql ；Polaris：https://polaris.shopify.com
- 本技能只做开发与可部署产物，不替代环境内的实测、上线验证与安全/合规专家评审；输入或权限边界不清时先停下来澄清。

## 互见

- requires：无。
- related：`code-reviewer`（对生成的 App/扩展代码做正确性与质量审查）。
- combines_with：`dependency-auditor`（上架前对 npm 依赖做许可证/CVE 体检）。

---
采编自 sickn33/antigravity-awesome-skills（MIT），适配重写为中文「技能大典」条目。
