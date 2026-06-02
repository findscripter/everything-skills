---
name: graphql-architect
title: GraphQL 架构与联邦
description: 当设计或重构企业级 GraphQL 服务、需要联邦/网关聚合、解决 N+1 与缓存、加固鉴权或上线订阅时使用；做出可演进的 Schema、联邦子图与网关配置、DataLoader 批处理与字段级缓存、字段级鉴权与查询成本限流方案及落地代码；不适用于纯 REST/gRPC 接口、与 GraphQL 无关的通用后端或前端查询调试。触发词：GraphQL、Schema 设计、Apollo Federation、联邦/子图、N+1/DataLoader、订阅 subscription、查询复杂度限流
domain: 研发/backend
triggers: [GraphQL, Schema 设计, Apollo Federation, 联邦子图, GraphQL 网关, N+1 问题, DataLoader, 字段级缓存, 持久化查询 APQ, GraphQL 订阅, subscription 实时, 查询复杂度限流, 字段级鉴权, REST 迁移 GraphQL, Schema 演进]
tags: [graphql, api-design, federation, schema, performance, caching, authorization, subscription, 微服务, 研发]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Apollo Federation v2, Apollo Server, GraphQL Yoga, Pothos, Nexus, DataLoader, Redis, GraphQL Code Generator, Hasura, Prisma]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 为多团队/企业系统设计或重构 GraphQL Schema，需要长期可演进。
- 用联邦（Apollo Federation v2、子图）或网关聚合多个微服务/REST 接口。
- 排查并消除 N+1，引入 DataLoader、字段级与查询级缓存（Redis/CDN/APQ）。
- 加固生产安全：字段级鉴权、RBAC、JWT、查询复杂度/深度限制、关闭内省、限流。
- 上线实时能力：WebSocket/SSE 订阅、订阅过滤与鉴权、可扩展订阅基建。
- 从 REST 平滑迁移到 GraphQL，需向后兼容与多客户端版本共存。

不该用（负边界）：
- 纯 REST/gRPC/RPC 接口设计，与 GraphQL 无关。
- 与 GraphQL 无关的通用后端业务逻辑或前端查询调试。
- 缺少业务需求、数据关系、权限边界或成功标准时——先停下来澄清，不要硬上。

## 步骤

1. 厘清目标、约束与输入：业务需求、实体数据关系、团队边界、性能与安全目标。
2. 设计可演进 Schema：Schema-first（SDL）+ 代码生成；用 interface/union 建模多态；遵循 Relay 连接（Connection）分页规范；自定义标量做输入校验；用 `@deprecated` 而非破坏式删除来演进。
3. 实现高效 resolver：每请求实例化 DataLoader 批处理 + 去重，消除 N+1；下推字段选择，避免过度取数。
4. 配置缓存与安全（上生产前必做）：字段/查询级响应缓存 + Redis/CDN；启用 APQ；做查询复杂度分析、深度限制与成本限流；字段级鉴权 + RBAC + JWT 校验；生产环境关闭 introspection、做输入消毒与 CORS/安全头。
5. 接入监控与分析：resolver 链路追踪、执行计划分析、字段使用统计与慢查询定位。
6. 设计联邦策略：拆分子图、定义实体 key 与 `@key`/`@requires`/`@external`，配置网关组合 Schema，建立 Schema 注册中心与治理/破坏性变更检测。
7. 落实测试：resolver 单测、测试客户端集成测试、Schema 破坏性变更检测、负载/安全测试、服务间契约测试。
8. 规划演进：版本兼容、弃用流程、持久化查询白名单。

## 指令

- 先澄清目标、约束与必需输入，再动手。
- 应用对应最佳实践并验证结果，给出可执行步骤与验证方法。
- 把缓存影响纳入 Schema 设计决策；从一开始就考虑性能与可扩展性。
- 实现健壮的错误处理与有意义的错误信息，遵循 GraphQL 规范。
- 需要详尽实现样例时，打开 `resources/implementation-playbook.md`。

## 示例

- 为多团队电商平台设计联邦式 GraphQL 架构（拆子图、定网关）。
- 重构 Schema 消除 N+1、引入 DataLoader 提升吞吐。
- 为协作应用实现带鉴权的实时订阅。
- 制定 REST 到 GraphQL 的迁移方案，保证向后兼容。
- 构建聚合多个微服务数据的 GraphQL 网关。
- 为高流量 API 设计字段级缓存策略。
- 为生产安全实现查询复杂度分析与限流。
- 设计支持多客户端版本共存的 Schema 演进策略。

## 注意事项

- 联邦实体的 `@key` 必须能稳定唯一定位实体，跨子图引用用 `@external`/`@requires` 标注，避免组合失败。
- DataLoader 必须按请求（per-request）创建，跨请求复用会造成脏缓存与越权读取。
- 生产环境务必关闭 introspection，并配合查询深度/复杂度限制，防止恶意深查与拒绝服务。
- 缓存键要包含鉴权上下文，避免字段级缓存把高权限数据返回给低权限用户。
- 演进优先用 `@deprecated` 标记 + 字段使用分析，确认无客户端使用后再删除，避免破坏式变更。
- 本技能不替代环境内的实测、压测与专家评审；输入/权限/安全边界/成功标准缺失时先澄清再继续。

## 互见

- 微服务编排与 API 网关相关技能。
- 缓存（Redis/CDN）与限流相关技能。
- 鉴权（JWT/RBAC）与生产安全加固相关技能。

---

采编自 sickn33/antigravity-awesome-skills（MIT）。
