---
name: fastapi-async-api
title: FastAPI 高性能异步 API
description: 当用 FastAPI 构建高并发异步 API/微服务、需要 async SQLAlchemy 2.0 + Pydantic V2 + JWT 鉴权、连接池与缓存等生产实践时使用；做异步端点、数据模型、依赖注入、测试与可观测性的设计与落地产物；不适用于同步 WSGI 框架（Flask/Django 同步视图）、纯前端或非 Python 服务。触发词：FastAPI、异步 API、Pydantic、SQLAlchemy async
domain: 研发/backend
triggers: [FastAPI, 异步 API, async API, Pydantic V2, SQLAlchemy async, asyncpg, WebSocket, JWT 鉴权, 微服务, Uvicorn, 依赖注入, API 限流]
tags: [FastAPI, 异步, Python, 微服务, Pydantic, SQLAlchemy, API, 后端]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Bash, Read, Edit, Write]
requires: []
related: [async-python-patterns, rest-api-endpoint-builder, django-async-pro, graphql-architect]
combines_with: [python-testing-pytest, prisma-orm-expert, distributed-tracing]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 用 FastAPI（0.100+，建议 Annotated 依赖注入）搭建高并发异步 REST/WebSocket API 或微服务。
- 需要 async SQLAlchemy 2.0（asyncpg/aiomysql）、Pydantic V2 校验与序列化、Alembic 迁移。
- 落地 OAuth2 + JWT 鉴权、RBAC、限流、连接池、Redis 缓存、健康检查与可观测性。
- 排查异步端点性能问题（N+1、阻塞调用、连接耗尽）。

不该用：
- 同步框架场景（Flask/Django 同步视图、WSGI），异步收益不成立。
- 纯前端、静态站点或非 Python 服务。
- 仅需简单脚本而非长期维护的服务 API。

边界：本技能给出工程范式与可运行骨架，不替代针对你环境的压测、安全审计与代码评审。缺少关键输入（数据库类型、鉴权要求、部署目标）时先澄清再动手。

## 步骤

1. 厘清需求：识别可异步化的 IO 点（DB、外部 HTTP、消息队列），确定鉴权与并发目标。
2. 先定契约：用 Pydantic V2 模型设计 request/response schema，再写端点。
3. 实现端点：async def + 依赖注入（DB session、当前用户），统一异常处理。
4. 接数据层：async SQLAlchemy 2.0 引擎 + 连接池，避免在 async 路径调用同步阻塞库。
5. 加鉴权与防护：OAuth2 + JWT，CORS、限流、输入校验。
6. 写异步测试：pytest + pytest-asyncio + httpx.AsyncClient / TestClient 覆盖边界。
7. 优化：缓存（Redis）、eager loading 防 N+1、分页（推荐游标分页）、响应压缩。
8. 可观测与部署：结构化日志、健康检查、Uvicorn/Gunicorn 生产配置、Docker 多阶段构建。

## 指令

- async 优先：IO 端点用 `async def`；CPU 密集或仅同步库的逻辑放线程池（`run_in_threadpool` / `asyncio.to_thread`），绝不在事件循环里直接阻塞。
- 类型安全：全程类型注解，依赖用 `Annotated[T, Depends(...)]`。
- 启停资源用 lifespan：在 `lifespan` 中建/销引擎、连接池、缓存客户端，避免每请求重建。
- 错误处理：自定义 exception handler，返回结构化错误体，不向客户端泄漏内部异常。
- 配置用 Pydantic Settings + 环境变量，遵循 12-factor。
- 需要详细范式时再展开数据层、鉴权、部署各环节，按需取用。

## 示例

最小异步骨架（FastAPI + async SQLAlchemy 2.0 + Pydantic V2 + lifespan）：

```python
from contextlib import asynccontextmanager
from typing import Annotated
from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import (
    create_async_engine, async_sessionmaker, AsyncSession,
)
from sqlalchemy import select
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

engine = create_async_engine(
    "postgresql+asyncpg://user:pwd@localhost/app",
    pool_size=20, max_overflow=10, pool_pre_ping=True,
)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False)

class Base(DeclarativeBase): ...

class Item(Base):
    __tablename__ = "items"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]

class ItemOut(BaseModel):
    id: int
    name: str
    model_config = {"from_attributes": True}  # Pydantic V2

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await engine.dispose()

app = FastAPI(lifespan=lifespan)

async def get_db():
    async with SessionLocal() as session:
        yield session

@app.get("/items/{item_id}", response_model=ItemOut)
async def read_item(item_id: int, db: Annotated[AsyncSession, Depends(get_db)]):
    item = await db.get(Item, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return item
```

异步测试（httpx + pytest-asyncio）：

```python
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_read_item():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        resp = await ac.get("/items/1")
    assert resp.status_code in (200, 404)
```

生产启动（多 worker）：

```bash
gunicorn app.main:app -k uvicorn.workers.UvicornWorker -w 4 --bind 0.0.0.0:8000
# 开发热重载
uvicorn app.main:app --reload
```

## 注意事项

- N+1 查询：用 `selectinload` / `joinedload` 显式 eager loading；别在循环里逐条 await 查询。
- 连接耗尽：合理设置 `pool_size`/`max_overflow`，session 用完即关（依赖 `yield` 自动回收）。
- 别混用同步阻塞库（如同步 `requests`、同步 ORM 调用）到 async 路径，会拖垮整个事件循环；HTTP 调用用 `httpx.AsyncClient`。
- Pydantic V2 与 V1 API 不兼容：用 `model_config`、`from_attributes`、`model_dump()`，勿照搬 V1 的 `Config`/`orm_mode`。
- JWT：校验签名、过期与受众；刷新令牌与访问令牌分离，密钥从环境注入。
- 分页大数据集优先游标分页，避免深 offset 全表扫描。

## 互见

- 数据库迁移：Alembic（async 模板）配套使用。
- 鉴权深化：OAuth2 / JWT / RBAC 专项实践。
- 部署：Docker 多阶段构建、Kubernetes/Helm 与 CI/CD。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
