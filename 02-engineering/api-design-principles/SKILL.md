---
name: api-design-principles
title: REST与GraphQL API设计
description: 当设计/评审 REST 或 GraphQL API、定接口规范、在范式间迁移时使用；做出资源命名、HTTP 语义、分页、版本化、错误格式、Schema 与 N+1 优化的可落地规范与方案；不适用于具体业务代码实现、框架运维部署、接口安全渗透测试；触发词：API 设计、REST、GraphQL、接口规范、endpoint、分页、版本化、HATEOAS、DataLoader、schema design
domain: 研发/architecture
triggers: [API 设计, REST, GraphQL, 接口规范, endpoint, 分页, 版本化, HATEOAS, DataLoader, schema design]
tags: [api, rest, graphql, backend, architecture, schema-design]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [openapi, fastapi, graphql, ariadne, dataloader]
requires: []
related: [code-reviewer, mcp-builder]
combines_with: []
license: MIT
source: wshobson/agents
source_license: MIT
---
## 何时使用

- 从零设计 REST 或 GraphQL API、为既有 API 做易用性重构、制定团队接口规范时使用。
- 在实现前评审 API 规格（OpenAPI/GraphQL SDL），或在范式间迁移（REST↔GraphQL）时使用。
- 针对特定场景（移动端、第三方集成）优化接口形态时使用。

不该用的边界：
- 写具体业务逻辑/数据库实现代码 → 这是落地编码，本技能只产出接口契约与规范。
- 框架运维、网关部署、容量压测 → 属运维范畴，不在此。
- 接口鉴权漏洞渗透/安全审计 → 交安全类技能；本技能只给出鉴权/限流的设计约定。

## 步骤 / 指令

```
1. 选范式
   - 资源 CRUD、强缓存、第三方易消费、需 HTTP 语义 → REST。
   - 客户端字段差异大、聚合多源、需精确取数避免 over/under-fetch → GraphQL。

2. 建资源/类型模型（先名词，后动作）
   - REST：资源用复数名词（/users 不是 /user 或 /getUser），动作交给 HTTP 方法。
   - GraphQL：先写 Schema（types/Query/Mutation/Subscription），再写 resolver。

3. 定核心契约
   - HTTP 方法语义：GET(安全幂等)/POST(建)/PUT(整体替换,幂等)/PATCH(部分更新)/DELETE(删,幂等)。
   - 状态码：2xx 成功 / 4xx 客户端错 / 5xx 服务端错（见示例对照表）。
   - 统一错误体：{code,message,details[],timestamp,path}，全站一致。

4. 定分页/过滤/版本
   - 分页：小数据集偏移分页(page/page_size)；大数据集/无限滚动用游标(cursor / Relay Connection)。
   - 过滤排序：?status=&sort=-created_at&fields=id,name；搜索 ?search=。
   - 版本化：优先 URL 版本（/api/v1/...）；或 Accept 头；或 ?version=。第一天就规划破坏性变更。

5. 加保护与可观测
   - 限流：返回 X-RateLimit-* 头，超限 429 + Retry-After。
   - 文档：REST 用 OpenAPI/Swagger；GraphQL 自带 introspection。
   - 健康检查 /health 与 /health/detailed（依赖项探活）。

6. GraphQL 专项
   - 输入用 input 类型，变更返回 payload（含 errors 数组）。
   - 关系字段一律用 DataLoader 批量加载，防 N+1。
   - 加查询深度/复杂度上限防昂贵查询；字段弃用用 @deprecated 不删字段。
```

规则：
- API 结构不要照搬数据库表结构（避免紧耦合）。
- 别用 POST 做幂等操作，破坏 HTTP 语义预期。
- 错误格式、分页约定、命名风格全站统一，不一处一个样。

## 示例

REST 资源端点（名词 + 方法，避免动作式 URL）：
```
GET    /api/users           # 列表(分页)        → 200
POST   /api/users           # 创建              → 201 + Location 头
GET    /api/users/{id}      # 取单个            → 200 / 404
PUT    /api/users/{id}      # 整体替换(含全字段) → 200 / 404
PATCH  /api/users/{id}      # 部分更新          → 200 / 404
DELETE /api/users/{id}      # 删除              → 204 / 404 / 409
GET    /api/users/{id}/orders   # 浅层嵌套(避免深嵌套)
# 反例(勿用)：POST /api/createUser、POST /api/getUserById
```

状态码对照：200 GET/PATCH/PUT · 201 POST · 204 DELETE · 400 格式错 · 401 未认证 · 403 无权限 · 404 不存在 · 409 冲突(如邮箱重复) · 422 校验失败 · 429 限流 · 500 服务端错。

统一错误体：
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [{"field":"email","message":"Invalid email format","value":"not-an-email"}],
    "timestamp": "2025-10-16T12:00:00Z",
    "path": "/api/users"
  }
}
```

GraphQL Schema（Relay 游标分页 + input/payload + 枚举）：
```graphql
type User {
  id: ID!
  email: String!
  orders(first: Int = 20, after: String, status: OrderStatus): OrderConnection!
}
type OrderConnection { edges: [OrderEdge!]!  pageInfo: PageInfo!  totalCount: Int! }
type PageInfo { hasNextPage: Boolean!  hasPreviousPage: Boolean!  startCursor: String  endCursor: String }
enum OrderStatus { PENDING CONFIRMED SHIPPED DELIVERED CANCELLED }

type Mutation { createUser(input: CreateUserInput!): CreateUserPayload! }
input CreateUserInput { email: String!  name: String!  password: String! }
type CreateUserPayload { user: User  errors: [Error!] }
type Error { field: String  message: String! }
```

DataLoader 防 N+1（按 user 批量取 orders）：
```python
from aiodataloader import DataLoader

class OrdersByUserLoader(DataLoader):
    async def batch_load_fn(self, user_ids):
        orders = await fetch_orders_by_user_ids(user_ids)
        grouped = {}
        for o in orders:
            grouped.setdefault(o["user_id"], []).append(o)
        return [grouped.get(uid, []) for uid in user_ids]   # 必须按输入顺序返回

# resolver 内：loader = info.context["loaders"]["orders_by_user"]; await loader.load(user["id"])
```

## 注意事项

- 集合命名用复数且全站一致；嵌套保持浅层，深层关系改用独立资源（/order-items/{id}/reviews）。
- PUT 必须带全字段（整体替换）；PATCH 只带变更字段；二者语义别混。
- 大集合一律分页；无分页 + 无限流的接口易被滥用拖垮。
- GraphQL 可空性从「可空」起步，确有保证再升为非空；字段弃用走 @deprecated 渐进迁移，不直接删。
- GraphQL 命名：字段 camelCase、类型 PascalCase；自定义标量(Email/DateTime/Money)表达领域类型。
- 幂等写操作（创建订单）支持 Idempotency-Key，重复请求返回缓存结果。
- 缓存用 Cache-Control + ETag/If-None-Match（命中返 304）。

## 互见

- requires：无。
- related：`code-reviewer`（接口规格实现后的代码层正确性审查）；`mcp-builder`（同属协议/接口契约设计，可借鉴 Schema 与工具定义思路）。
- combines_with：无。

---

本条采编自 wshobson/agents（MIT）。
