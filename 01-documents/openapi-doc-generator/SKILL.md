---
name: openapi-doc-generator
title: OpenAPI 3.1 API 文档生成
description: 当需要为 REST/事件驱动 API 编写或重写规范、搭建交互式开发者文档与门户时使用；做 OpenAPI 3.1/AsyncAPI 规范编写、示例与鉴权流程补全、交互文档与多语言 SDK 生成及示例可测试化的产物；不适用于无 API 面、纯后端实现或只需内部速记的场景；触发词：OpenAPI、API 文档、SDK 生成、Swagger/Redoc、开发者门户
domain: 文书/writing
triggers: [编写 OpenAPI 规范, API 文档, OpenAPI 3.1, AsyncAPI, Swagger UI, Redoc, 生成 SDK, 开发者门户, 接口文档, 鉴权流程文档, Webhook 文档, API 迁移指南]
tags: [writing, 文书, openapi, api文档, sdk, 开发者体验, 技术写作]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Write, Edit, Bash]
requires: []
related: [technical-reference-builder, api-design-principles, docs-architect, rest-api-endpoint-builder]
combines_with: [api-design-principles, code-tutorial-engineer]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 编写或更新 OpenAPI 3.1 / AsyncAPI 规范（REST、事件驱动、实时 API）。
- 搭建开发者门户、SDK 文档或新手上手流程。
- 提升既有 API 文档的质量、准确性与可发现性。
- 从 API 规范生成多语言代码示例或 SDK。

不该用（负边界）：
- 只需一段内部速记或非正式摘要。
- 任务是纯后端实现，不涉及对外文档。
- 没有任何 API 面或规范可供描述。

## 步骤

1. 明确目标读者、API 范围与文档目标（先确认开发者画像与「首次成功时间」诉求）。
2. 编写或校验规范：补全请求/响应示例、错误码、鉴权流程，并按 schema 做校验。
3. 构建交互式文档（Swagger UI / Redoc / Stoplight），并用契约测试保证示例可运行、与实现一致。
4. 规划维护：版本策略、破坏性变更迁移指南、弃用时间线与 changelog 自动化。

## 指令

- 规范优先采用 OpenAPI 3.1（完整 JSON Schema 支持）；事件驱动 API 用 AsyncAPI，GraphQL 用 SDL。
- 每个端点必须含可工作的示例（含 curl）、典型错误响应与鉴权方式；安全方案（OAuth 2.0 / OpenID Connect / API Key / JWT）给出可运行示例与刷新机制。
- 遵循 docs-as-code：文档纳入 Git，接入 CI/CD 自动校验、自动部署。
- 示例与代码片段须自动化测试（response 对照 schema 校验、curl 可执行），避免文档与实现漂移。
- Webhook 文档须含 payload 示例与签名验证/安全说明。
- 重实用、可运行示例，轻理论描述；渐进式披露，兼顾完整性与简洁。

## 示例

- 「为这个 REST API 编写完整的 OpenAPI 3.1 规范，含鉴权示例。」
- 「从这份 OpenAPI 规范生成 Python、JavaScript、Go 三种 SDK。」
- 「为 v1 升级到 v2 的开发者设计迁移指南。」
- 「编写带安全最佳实践与 payload 示例的 Webhook 文档。」
- 「为所有 API 文档中的代码示例搭建自动化测试。」

## 注意事项

- 不要把产出当作环境特定校验、测试或专家评审的替代品；规范落地前需在真实环境验证。
- 缺少必要输入（如目标读者、API 范围、鉴权方式、成功标准）或权限边界不明时，先停下来澄清。
- 仅在任务明确落入上述范围时使用本技能。
- 把文档当作产品：建立反馈闭环、持续迭代，关注可发现性（SEO/搜索）与可访问性。

## 互见

- 技术写作 / 文档风格规范类技能（文书 domain）。
- API 设计与契约驱动开发相关技能。
- CI/CD 与 docs-as-code 自动化部署相关技能。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
