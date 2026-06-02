---
name: api-design-reviewer
title: REST API 设计评审
description: 当评审新增/改动 API 端点的 PR、为 v2 迁移审计现有 API 或为团队制定 API 规范时使用；做 REST 约定 lint、破坏性变更检测与设计评分，产出问题清单与改进建议；不适用于 GraphQL/gRPC 接口设计、纯实现编码或后端性能压测；触发词：API 设计评审、api review、REST 规范、breaking change、破坏性变更、OpenAPI lint、接口评审、versioning
domain: 研发/review
triggers: [API 设计评审, api review, REST 规范, breaking change, 破坏性变更, OpenAPI lint, 接口评审, versioning]
tags: [api, rest, review, openapi, breaking-change, versioning, linting]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [OpenAPI/Swagger, python, api_linter.py, breaking_change_detector.py, api_scorecard.py]
requires: []
related: [code-reviewer, dependency-auditor]
combines_with: []
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

- 评审新增或修改 API 端点的 PR，需快速判断是否符合 REST 约定。
- 为 v2 迁移审计现有 API，识别破坏性变更并产出迁移指引。
- 为团队制定/落地 API 设计规范，并接入 CI 做门禁。

不该用：
- GraphQL / gRPC / WebSocket 等非 REST 接口的设计评审。
- 接口的具体业务实现编码、单元测试编写。
- 后端吞吐/延迟的性能压测（本条只评审设计层缓存/分页等模式，不做基准测试）。

## 步骤

1. 收集输入：目标 API 的 OpenAPI/Swagger 规范（`openapi.json`），如做破坏性变更检测，再取旧版本规范。
2. 跑 lint：检查命名、HTTP 方法、URL 结构、状态码、错误格式、文档覆盖率。
3. 做破坏性变更检测：对比新旧规范，标注端点删除、响应结构/字段/类型变更、新增必填字段。
4. 出评分卡：按一致性(30%)、文档(20%)、安全(20%)、易用性(15%)、性能(15%)给分并给 A-F 等级。
5. 汇总问题清单 + 改进建议，区分「可直接发布」「需修订」「需升版本」。

## 指令

核心评审维度与硬约束（评审时逐条核对）：

资源命名（kebab-case 资源、camelCase 字段）：
```
✅ /api/v1/user-profiles   /api/v1/orders/123/line-items
❌ /api/v1/getUsers   /api/v1/user_profiles   /api/v1/orders/123/lineItems
```

HTTP 方法语义：GET 安全幂等 / POST 创建非幂等 / PUT 整体替换幂等 / PATCH 局部更新 / DELETE 删除幂等。

URL 结构：集合 `/users`、单体 `/users/123`、嵌套 `/users/123/orders`、动作 `/users/123/activate`(POST)、过滤 `/users?status=active`。避免动词 URL 与过深嵌套。

版本策略：优先 URL 版本（`/api/v1` `/api/v2`，清晰易路由）；备选 Header / Media Type / Query 版本。

破坏性变更判定（命中即需升版本）：删除响应字段、可选字段改必填、字段类型变更、删除端点、变更 URL 结构、改动错误响应格式。安全变更：新增可选字段、新增响应字段、新增端点、必填改可选、新增枚举值（需优雅处理）。

状态码：400 参数错误 / 401 未认证 / 403 无权限 / 404 不存在 / 409 冲突 / 422 语义错误 / 429 限流 / 500 服务端错误。

CI / 预提交接入：
```yaml
- name: api-linting
  run: python scripts/api_linter.py openapi.json
- name: breaking-change-detection
  run: python scripts/breaking_change_detector.py openapi-v1.json openapi-v2.json
- name: api-scorecard
  run: python scripts/api_scorecard.py openapi.json
```

## 示例

标准错误响应（评审错误格式时作为基准）：
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid parameters",
    "details": [
      { "field": "email", "code": "INVALID_FORMAT", "message": "Email address is not valid" }
    ],
    "requestId": "req-123456",
    "timestamp": "2024-02-16T13:00:00Z"
  }
}
```

游标分页（列表端点必须分页）：
```json
{ "data": [], "pagination": { "nextCursor": "eyJpZCI6MTIzfQ==", "hasMore": true } }
```

幂等键（创建类写操作建议支持）：
```
POST /api/v1/payments
Idempotency-Key: 123e4567-e89b-12d3-a456-426614174000
```

限流响应头：`X-RateLimit-Limit / X-RateLimit-Remaining / X-RateLimit-Reset`；缓存：`Cache-Control: public, max-age=3600` + `ETag`。

## 注意事项

- 列表端点必须分页，写操作建议支持幂等键，公开端点必须限流。
- 鉴权统一走 HTTPS；Bearer Token / API Key / OAuth2 三选其一并保持全站一致。
- 字段裁剪用 `?fields=id,name,email`，配合 gzip 与 ETag 条件请求降本。
- 破坏性变更不要悄悄合入：必须升版本并提供迁移指引。
- 设计面向外部消费者，勿暴露内部存储结构；避免 N+1，重操作走异步/批量。
- 常见反模式：动词 URL、响应格式不一致、过深嵌套、忽略状态码、错误信息含糊、无版本策略。

## 互见

- code-reviewer：通用代码评审，本条聚焦 API 设计层。
- dependency-auditor：依赖与供应链审计，可与 API 安全评审配合。

---
本条采编自 alirezarezvani/claude-skills（MIT）。
