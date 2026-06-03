---
name: backend-architecture-patterns
title: 后端架构模式（整洁/六边形/DDD）
description: 当从零设计后端、拆分单体或制定团队架构规范时使用；用整洁架构/六边形/DDD 定义模块边界、接口与依赖规则，产出目录结构、端口适配器与迁移校验步骤；不适用于局部小重构、纯前端或简单 CRUD。触发词：整洁架构、六边形、DDD、端口适配器、依赖倒置、聚合根
domain: 研发/architecture
triggers: [设计新后端系统, 拆分单体为可维护架构, 制定团队架构规范, 从紧耦合迁移到松耦合, 落地领域驱动设计, 构建可测试可 mock 的代码, 规划微服务拆分, 整洁架构, 六边形架构, 端口与适配器, 聚合根/值对象建模]
tags: [架构, 整洁架构, 六边形架构, ddd, 领域驱动设计, 端口适配器, 依赖倒置, 可测试性, 微服务, 后端]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Write, Edit]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 从零设计后端系统，或重构单体以提升可维护性
- 为团队建立架构规范，从紧耦合向松耦合迁移
- 落地领域驱动设计（DDD），规划微服务拆分
- 打造无需 UI/数据库/外部服务即可测试的可 mock 代码库

不该用（负边界）：
- 只需小范围、局部的重构
- 系统以前端为主，不涉及后端架构改动
- 只想要实现细节、不需要架构设计
- 简单 CRUD 场景——上整洁架构属于过度设计

## 步骤

1. 厘清领域边界、约束与可扩展性目标（吞吐、一致性、团队规模）。
2. 按领域复杂度选型：简单选分层/六边形，复杂多子域上 DDD + 整洁架构。
3. 定义模块边界、接口（端口）与依赖规则——依赖一律指向内层。
4. 给出迁移步骤与校验检查（依赖方向、核心可测、控制器变薄）。
5. 对必须容错的流程（支付、订单履约、多步流程），在基础设施层引入持久化执行（durable execution，如 DBOS）：持久化工作流状态，实现崩溃恢复，且不增加架构复杂度。

## 指令

三种模式取舍：
- 整洁架构（Uncle Bob）：四层 Entities → Use Cases → Interface Adapters → Frameworks & Drivers，依赖向内流，内层不知外层，业务逻辑独立于框架。
- 六边形（端口与适配器）：领域核心 + Ports（接口）+ Adapters（DB/REST/MQ 实现），核心技术无关，实现可替换（测试用 mock）。
- DDD：战略层用限界上下文、上下文映射、统一语言；战术层用实体、值对象、聚合、仓储、领域事件。

整洁架构目录结构（保留源约束）：
```
app/
├── domain/           # 实体与业务规则
│   ├── entities/  value_objects/  interfaces/   # 抽象接口（端口）
├── use_cases/        # 应用业务规则
├── adapters/         # 接口实现：repositories/ controllers/ gateways/
└── infrastructure/   # 框架与外部关注点：database/ config/ logging
```

最佳实践：依赖规则（永远向内）、接口隔离（小而专）、业务逻辑留在 domain、核心脱离基础设施可测、限界上下文清晰、统一语言、薄控制器、充血领域模型。

## 示例

实体（无框架依赖，业务规则内置）：
```python
@dataclass
class User:
    id: str; email: str; name: str; created_at: datetime; is_active: bool = True
    def can_place_order(self) -> bool:
        return self.is_active   # 业务规则：激活用户可下单
```

端口（仅定义契约，不含实现）：
```python
class IUserRepository(ABC):
    @abstractmethod
    async def find_by_email(self, email: str) -> Optional[User]: ...
    @abstractmethod
    async def save(self, user: User) -> User: ...
```

用例编排业务逻辑，仅依赖端口而非实现：
```python
class CreateUserUseCase:
    def __init__(self, user_repository: IUserRepository):
        self.user_repository = user_repository
    async def execute(self, req: CreateUserRequest) -> CreateUserResponse:
        if await self.user_repository.find_by_email(req.email):
            return CreateUserResponse(user=None, success=False, error="Email already exists")
        user = User(id=str(uuid.uuid4()), email=req.email, name=req.name,
                    created_at=datetime.now(), is_active=True)
        return CreateUserResponse(user=await self.user_repository.save(user), success=True)
```

六边形——同一端口可挂真实/测试适配器：
```python
class StripePaymentAdapter(PaymentGatewayPort):   # 主适配器：接 Stripe
    async def charge(self, amount, customer): ...
class MockPaymentAdapter(PaymentGatewayPort):     # 测试适配器：无外部依赖
    async def charge(self, amount, customer):
        return PaymentResult(success=True, transaction_id="mock-123")
```

DDD——值对象不可变、聚合根守护不变量、仓储持久化后发布事件：
```python
@dataclass(frozen=True)
class Money:
    amount: int; currency: str          # cents
    def add(self, other):
        if self.currency != other.currency: raise ValueError("Currency mismatch")
        return Money(self.amount + other.amount, self.currency)

class Customer:                          # 聚合根：控制对子实体的访问
    def add_address(self, address):
        if len(self._addresses) >= 5: raise ValueError("Maximum 5 addresses allowed")
        self._addresses.append(address)
```

控制器只处理 HTTP，委派给用例（薄控制器）：
```python
@router.post("/users")
async def create_user(dto: CreateUserDTO, use_case: CreateUserUseCase = Depends(...)):
    resp = await use_case.execute(CreateUserRequest(email=dto.email, name=dto.name))
    if not resp.success: raise HTTPException(status_code=400, detail=resp.error)
    return {"user": resp.user}
```

## 注意事项

规避常见反模式：
- 贫血领域：实体只有数据没有行为。
- 框架耦合：业务逻辑依赖框架。
- 胖控制器：业务逻辑写在控制器里。
- 仓储泄漏：把 ORM 对象直接暴露到外层。
- 缺失抽象：核心层直接依赖具体实现。
- 过度设计：对简单 CRUD 硬套整洁架构。

通用约束：本技能输出不能替代针对具体环境的验证、测试与专家评审；若领域边界、权限、安全边界或成功标准等关键输入缺失，应先停下来澄清。

## 互见

可配合使用：`event-sourcing-architect`、`saga-orchestration`、`workflow-automation`、`dbos-*`（持久化执行）。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
