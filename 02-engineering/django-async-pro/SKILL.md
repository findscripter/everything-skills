---
name: django-async-pro
title: Django 5 异步 DRF Celery 开发
description: 当用 Django 5.x 构建可扩展 Web 应用、API 或实时服务时使用；做异步视图、DRF 接口、Celery 异步任务、Channels WebSocket 与 ORM 调优并产出生产级代码与测试；不适用于纯前端、非 Django 框架或简单脚本。触发词：Django、DRF、Celery、async 视图、Channels、ORM 优化
domain: 研发/backend
triggers: [Django 5, DRF, Django REST Framework, Celery, Django Channels, 异步视图, async 视图, ASGI, ORM 优化, N+1 查询, select_related, JWT 认证, WebSocket, Django 部署]
tags: [django, drf, celery, async, channels, orm, web, python, 研发]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Bash, Read, Edit, Write, Grep, Glob]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：

- 用 Django 5.x 构建可扩展 Web 应用、企业级项目结构（模块化 app、service 层、按环境拆分 settings）。
- 设计模型与关系、ORM 查询调优（消除 N+1、select_related / prefetch_related / annotate、自定义 Manager 与 QuerySet）。
- 用 DRF 开发 API（序列化器、视图集、权限、JWT 认证）或用 Strawberry/Graphene 做 GraphQL。
- 编写异步视图与中间件、ASGI 部署、Django Channels 实现 WebSocket 实时功能。
- 用 Celery + Redis/RabbitMQ 做后台任务，用缓存框架做多级缓存。
- 用 pytest-django + factory_boy 写测试，用 django-silk / Debug Toolbar 做性能分析。

不该用（负边界）：

- 任务与 Django 无关，或目标框架是 Flask/FastAPI/Node 等。
- 纯前端、纯静态页面或一次性脚本，不涉及 Django 后端逻辑。
- 仅需通用 Python/SQL 知识、与 Django ORM 或生态无关的问题。

## 步骤

1. 厘清目标：明确功能、约束、性能要求与必需输入；缺关键输入（权限、成功标准）时先发问。
2. 优先用 Django 内置能力，再考虑第三方包（"batteries included"）。
3. 选型与设计：判断同步还是异步、CBV 还是 FBV、是否引入 service 层 / repository 模式。
4. 给出生产级代码：含错误处理、日志、类型注解，遵循 PEP 8 与 Django 风格。
5. 评估数据库影响：每个 ORM 操作都考虑查询数、索引、事务（atomic）与迁移策略。
6. 补测试：为关键路径写 pytest-django 测试，用 DRF test client 测接口。
7. 给出部署与安全建议：ASGI/WSGI 配置、缓存、CORS/CSRF/XSS 防护。

## 指令

- 异步视图：I/O 密集场景用 `async def` 视图 + `await`，配合 ASGI（Uvicorn / Daphne / Hypercorn）部署；ORM 在异步中用 `sync_to_async` 或异步查询接口，勿在 async 视图里直接调用同步 ORM。
- ORM 调优：先用 `select_related`（外键/一对一）与 `prefetch_related`（多对多/反向）消除 N+1；用 `annotate` / `aggregate` 下推计算到数据库；用 Debug Toolbar 或 django-silk 核对 SQL 数量。
- DRF + JWT：用 `djangorestframework-simplejwt` 实现 access/refresh 双 token；权限用 PermissionClass，对象级权限可用 django-guardian。
- Celery：任务定义为幂等、可重试；broker 用 Redis/RabbitMQ，长任务拆分并设超时；勿在 Web 请求里同步跑重任务。
- Channels：WebSocket 实时通知用 Consumer + channel layer（Redis backend）。
- 测试：`pytest` 跑全量；factory_boy 造数据；事务相关用 `TransactionTestCase`。
- 安全：依赖 Django 安全中间件，参数化查询防注入，敏感配置走 django-environ 环境变量。

## 示例

- "优化这个引起 N+1 查询的 Django queryset" → 定位反向/外键访问，加 `select_related` / `prefetch_related`，核对 SQL。
- "为长耗时 API 请求实现异步视图" → `async def` 视图 + ASGI 部署，I/O 用 `await`。
- "在 DRF 中实现带 refresh token 的 JWT 认证" → 配置 simplejwt，暴露 token / refresh 端点。
- "用 Channels 搭建实时通知" → Consumer + Redis channel layer，前端 WebSocket 订阅。
- "用 Celery 搭建可靠的后台任务系统" → 幂等任务 + Redis broker + 重试/超时策略。
- "为多租户 SaaS 设计可扩展的 Django 架构" → 模块化 app + service 层 + 数据库路由。

## 注意事项

- 异步视图中不要直接调用同步 ORM，否则会阻塞事件循环；用 `sync_to_async` 包装或改异步接口。
- 引入第三方包前先确认 Django 内置是否已能满足。
- 任何 ORM 改动都要评估迁移与数据库性能影响，用 Django 迁移系统管理变更。
- 输出代码不能替代环境内验证、测试与专家评审；上线前务必跑测试并核对查询。
- 仅在任务确实落在 Django 生态范围内时使用本技能，否则切换到合适的域。

## 互见

- 异步任务编排可结合消息队列 / Redis 相关技能。
- API 设计、JWT/OAuth 认证可参考通用 Web 安全与鉴权技能。
- 容器化与 CI/CD 部署可参考 Docker / DevOps 相关技能。

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
