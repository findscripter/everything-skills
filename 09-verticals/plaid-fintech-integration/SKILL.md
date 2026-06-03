---
name: plaid-fintech-integration
title: Plaid 金融数据 API 集成
description: 当为应用接入 Plaid 实现银行账户连接、交易同步、身份核验或 ACH 转账时使用；产出 Link token 交换、transactions/sync、Auth/Identity、实时余额、Webhook 验签与错误恢复的可落地 Node/TS 模式；不适用于支付收单（用 Stripe）、欧洲 PSD2 之外的开放银行细则或对账分析建模；触发词：plaid、银行账户连接、ACH、open banking
domain: 领域/fintech
triggers: [plaid, 银行账户连接, bank account linking, ACH 转账, account aggregation 账户聚合, open banking 开放银行, fintech 金融科技, transactions sync 交易同步, Link token, 身份核验 identity verification]
tags: [领域/金融科技, plaid, 银行数据聚合, ach, webhook, node.js, typescript, 合规安全]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [plaid (Node SDK), react-plaid-link, jsonwebtoken, jwks-rsa, 数据库 ORM（示例用 Prisma）]
requires: []
related: [stripe-integration, paypal-payment-integration, pakistan-payments-stack, blockchain-web3-developer]
combines_with: [billing-automation-systems, transactional-email-template-builder, zod-schema-validation]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

为产品接入 Plaid，把第三方银行账户接进你的系统时使用，覆盖：

- 首次连接银行账户、用户引导（Link token 流程）
- 拉取并增量同步交易流水（`/transactions/sync`）
- ACH 转账需要的账号/路由号（Auth）+ 转账前身份核验（Identity）
- 支付/扣款前的实时余额校验
- Webhook 验签、幂等与 Item 错误态（掉线、需重新授权）恢复

**不该用的边界：**

- 实际收单/扣款用 Stripe 等支付处理商，Plaid 只负责账户连接与取号
- 交易分类、预算、投资组合分析等数据建模不在本条范围
- 不替代环境特定的测试、合规审计（SOC2/PCI）与专家评审；Sandbox 不能反映生产复杂度
- 已废弃的 Public Key 集成（2025-01 起停用）一律不用，统一用 Link token

## 步骤

1. **初始化客户端**：用环境变量配置 `PLAID_CLIENT_ID` / `PLAID_SECRET` / `PLAID_ENV`，secret 仅存服务端。
2. **创建 link_token**：服务端 `linkTokenCreate`，传 `client_user_id`、`products`、`country_codes`、`webhook`；要复发交易则 `transactions.days_requested: 180`。
3. **前端拉起 Link**：`usePlaidLink`，`onSuccess` 拿到 `public_token` 回传服务端。
4. **换永久 access_token**：`itemPublicTokenExchange`，**加密后落库**（access_token 不过期、极敏感），随后触发首次同步。
5. **增量同步交易**：用游标 `cursor` 循环调用 `transactionsSync` 处理 added/modified/removed，持久化 `next_cursor`。
6. **Webhook 驱动**：收到 `SYNC_UPDATES_AVAILABLE` 等再触发同步，避免轮询。
7. **错误恢复**：监听 `ITEM` 类 webhook，遇 `ITEM_LOGIN_REQUIRED` / `PENDING_DISCONNECT` 走 Link 更新模式（传 `access_token` 而非 `products`）。

## 指令

- 创建 link_token 必带 `webhook` 与内部 `client_user_id`，便于回调归属。
- 同步分页时若报 `TRANSACTIONS_SYNC_MUTATION_DURING_PAGINATION`：把 `cursor` 置 `null` 从头重跑。
- 余额：展示用 `accountsGet`（缓存、免费）；**支付/扣款决策必须用 `accountsBalanceGet`（实时、付费）**。
- ACH 取号用 `authGet` 拿 `numbers.ach` 的 `routing`/`account`；转账前用 `identityMatch`，`legal_name.score < 70` 拒绝。
- Webhook 必须验签：取 `plaid-verification` JWT → 按 `kid` 拉 JWKS → `ES256` 验签 → 校验 `request_body_sha256` 与 body 哈希一致 → 校验 `iat` 在 5 分钟内。
- Webhook 处理幂等：用 `type:code:item:body` 哈希查重，先记 `webhookLog` 再异步处理，立即 `200`。

## 示例

创建并交换 Link token（服务端核心）：

```ts
import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';

const plaidClient = new PlaidApi(new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: { headers: {
    'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
    'PLAID-SECRET': process.env.PLAID_SECRET,
  }},
}));

// 1) 创建 link_token
const { data } = await plaidClient.linkTokenCreate({
  user: { client_user_id: userId },
  client_name: 'My Finance App',
  products: [Products.Transactions],
  country_codes: [CountryCode.Us],
  language: 'en',
  webhook: 'https://yourapp.com/api/plaid/webhooks',
  transactions: { days_requested: 180 }, // 复发交易需 180 天历史
});

// 2) 用 public_token 换永久 access_token，并加密落库
const ex = await plaidClient.itemPublicTokenExchange({ public_token: publicToken });
await db.plaidItem.create({ data: {
  userId, itemId: ex.data.item_id,
  accessToken: await encrypt(ex.data.access_token), // 加密存储，永不过期
  status: 'ACTIVE', products: ['transactions'],
}});
```

游标增量同步交易（核心循环）：

```ts
let cursor = item?.transactionsCursor || null;
let hasMore = true;
while (hasMore) {
  const { data } = await plaidClient.transactionsSync({
    access_token, cursor: cursor || undefined, count: 500, // 单次最大
  });
  // 处理 data.added / data.modified / data.removed ...
  cursor = data.next_cursor;
  hasMore = data.has_more;
}
await db.plaidItem.update({ where: { itemId }, data: { transactionsCursor: cursor } });
```

前端拉起：`usePlaidLink({ token, onSuccess: (publicToken) => /* 回传换 token */ })`。

## 注意事项

- **access_token 永不过期但极敏感（CRITICAL）**：必须加密存储，绝不下发到客户端；secret 同理仅存服务端、走环境变量，禁止硬编码。
- **缓存余额不能用于支付决策（ERROR）**：`accountsGet` 是缓存数据，扣款判断改用 `accountsBalanceGet`。
- **Webhook 可能乱序/重复（HIGH）**：必须验签 + 幂等设计；缺签名校验视为错误。
- **Item 会进入错误态（HIGH）**：`ITEM_LOGIN_REQUIRED` 需走 Link 更新模式；`PENDING_DISCONNECT` 提前提醒用户重连；`USER_PERMISSION_REVOKED` 要清理本地数据。
- **Link token 短时单次有效（4 小时）**：每次会话新建，禁止缓存复用。
- **Sandbox 不等于生产**：Sandbox 数据简化，上线前需真实环境验证。
- 交易同步务必持久化 cursor，否则无法增量；优先 webhook 而非轮询。

## 互见

- 实际支付收单 → Stripe 集成（Plaid 负责连接账户，Stripe 负责扣款）
- 交易分类与预算分析 → 数据分析/分析专家
- 投资组合追踪与报表 → 数据工程
- 合规与审计（SOC2/PCI）→ 安全专家
- 移动端 → React Native Plaid SDK

---

采编自 sickn33/antigravity-awesome-skills（MIT），原 skill 上游标注源 vibeship-spawner-skills（Apache 2.0）。本条为适配重写，非逐字翻译。
