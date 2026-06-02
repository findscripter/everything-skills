---
name: hexagonal-architecture
title: 六边形架构（端口与适配器模式）
description: 当为新特性划清业务边界、解耦框架/传输/持久化，或重构紧耦合服务以提升可测试性时使用；用入站/出站端口与适配器隔离领域核心，产出特性优先目录、用例编排、组合根装配与按边界分层的测试方案；不适用于简单 CRUD、纯前端或局部小重构。触发词：端口与适配器、六边形、领域核心、出站端口、组合根、绞杀者迁移
domain: 研发/architecture
triggers: [划清用例边界, 解耦框架与持久化, 重构紧耦合服务, 同一用例支持多入口, 替换基础设施不改业务规则, 端口与适配器, 六边形架构, 出站端口, 入站适配器, 组合根装配, 绞杀者式迁移, 按边界分层测试]
tags: [六边形架构, 端口与适配器, hexagonal, ports-and-adapters, 领域核心, 用例, 出站端口, 组合根, 依赖倒置, 可测试性, 绞杀者迁移]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Write, Edit]
requires: []
related: [backend-architecture-patterns, clean-code-principles, ddd-strategic-design, ddd-context-mapping, event-sourcing-cqrs, api-design-principles]
combines_with: [zero-downtime-migration-architect, database-migration-strategies, api-test-suite-builder]
license: CC-BY-4.0
source: affaan-m/everything-claude-code
source_license: MIT
---
# 六边形架构（端口与适配器模式）

六边形架构（Ports and Adapters）让业务逻辑独立于框架、传输与持久化细节。核心应用只依赖抽象「端口」，「适配器」在边缘实现这些端口。依赖方向永远向内：适配器 → 应用/领域；应用 → 端口契约（入站/出站）；领域 → 仅领域内抽象，绝不依赖框架或基础设施。

## 何时使用

适用：
- 为新特性建立边界，长期可维护性与可测试性是首要诉求
- 重构分层式或框架重的代码，领域逻辑与 I/O 混在一起需要剥离
- 同一用例要支持多种入口（HTTP、CLI、队列消费者、定时任务）
- 替换基础设施（数据库、外部 API、消息总线）而不重写业务规则

不该用（负边界）：
- 简单 CRUD —— 套端口适配器属于过度设计
- 纯前端，不涉及后端领域核心
- 只是局部小范围重构

## 步骤

1. **建模一个用例边界**：定义单个用例及清晰的输入/输出 DTO；把传输细节（Express `req`、GraphQL `context`、任务负载包装）挡在边界之外。
2. **先定义出站端口**：把每个副作用建模成端口——持久化（`UserRepositoryPort`）、外部调用（`BillingGatewayPort`）、横切（`LoggerPort`、`ClockPort`）。端口建模「能力」，不绑定「技术」。
3. **用纯编排实现用例**：用例类/函数经构造器或参数注入端口；它校验应用级不变量、协调领域规则、返回普通数据结构。
4. **在边缘构建适配器**：入站适配器把协议输入转成用例输入；出站适配器把应用契约映射到具体 API/ORM/查询构造器；**映射只留在适配器里，不进用例**。
5. **在组合根装配一切**：实例化适配器，再注入用例。装配集中在一处，避免隐式的服务定位器（service locator）行为。
6. **按边界测试**：用例用假端口做单元测试；适配器对真实基础设施做集成测试；面向用户的流程经入站适配器做端到端测试。

## 指令

核心概念：
- **领域模型**：业务规则与实体/值对象，不导入任何框架。
- **用例（应用层）**：编排领域行为与工作流步骤。
- **入站端口**：描述应用「能做什么」的契约（命令/查询/用例接口）。
- **出站端口**：描述应用「需要什么」的契约（仓储、网关、事件发布、时钟、UUID 等）。出站端口接口通常住在应用层（仅当抽象确属领域级时才放领域层）。
- **适配器**：端口的基础设施与交付实现（HTTP 控制器、DB 仓储、队列消费者、SDK 包装）。
- **组合根**：把具体适配器绑定到用例的唯一装配位置。

推荐目录（特性优先 + 显式边界）：
```text
src/features/orders/
  domain/                 Order.ts  OrderPolicy.ts
  application/
    ports/inbound/        CreateOrder.ts
    ports/outbound/       OrderRepositoryPort.ts  PaymentGatewayPort.ts
    use-cases/            CreateOrderUseCase.ts
  adapters/inbound/http/  createOrderRoute.ts
  adapters/outbound/postgres/  PostgresOrderRepository.ts
  adapters/outbound/stripe/    StripePaymentGateway.ts
  composition/            ordersContainer.ts
```

跨语言映射（边界规则不变，仅语法与装配方式变）：
- **TS/JS**：端口为 `application/ports/*` 接口；用例为构造器注入的类/函数；组合用显式工厂/容器模块（无隐藏全局）。
- **Java**：包 `domain` / `application.port.in` / `application.port.out` / `application.usecase` / `adapter.in` / `adapter.out`；用例为普通类（Spring `@Service` 可选非必须）；装配放 Spring 配置或手写装配类，不进领域/用例。
- **Kotlin**：包结构对齐 Java；端口为 interface；用例构造器注入（Koin/Dagger/Spring/手动）；用模块定义或专用组合函数，避免服务定位器。
- **Go**：包 `internal/<feature>/domain` / `application` / `ports` / `adapters/{inbound,outbound}`；端口为消费方拥有的小接口；用例为带接口字段的 struct + 显式 `New...` 构造器；装配在 `cmd/<app>/main.go`。

## 示例

出站端口（仅契约，无实现）：
```typescript
export interface OrderRepositoryPort {
  save(order: Order): Promise<void>;
  findById(orderId: string): Promise<Order | null>;
}
export interface PaymentGatewayPort {
  authorize(input: { orderId: string; amountCents: number }): Promise<{ authorizationId: string }>;
}
```

用例（经构造器注入端口；纯编排，返回普通数据）：
```typescript
export class CreateOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepositoryPort,
    private readonly paymentGateway: PaymentGatewayPort
  ) {}

  async execute(input: { orderId: string; amountCents: number }) {
    const order = Order.create({ id: input.orderId, amountCents: input.amountCents });
    const auth = await this.paymentGateway.authorize({
      orderId: order.id, amountCents: order.amountCents,
    });
    // markAuthorized 返回新的 Order 实例，不就地修改
    const authorizedOrder = order.markAuthorized(auth.authorizationId);
    await this.orderRepository.save(authorizedOrder);
    return { orderId: order.id, authorizationId: auth.authorizationId };
  }
}
```

出站适配器（实现端口，映射只在此处）：
```typescript
export class PostgresOrderRepository implements OrderRepositoryPort {
  constructor(private readonly db: SqlClient) {}
  async save(order: Order): Promise<void> {
    await this.db.query(
      "insert into orders (id, amount_cents, status, authorization_id) values ($1, $2, $3, $4)",
      [order.id, order.amountCents, order.status, order.authorizationId]
    );
  }
  async findById(orderId: string): Promise<Order | null> {
    const row = await this.db.oneOrNone("select * from orders where id = $1", [orderId]);
    return row ? Order.rehydrate(row) : null;
  }
}
```

组合根（装配集中一处）：
```typescript
export const buildCreateOrderUseCase = (deps: { db: SqlClient; stripe: StripeClient }) =>
  new CreateOrderUseCase(
    new PostgresOrderRepository(deps.db),
    new StripePaymentGateway(deps.stripe)
  );
```

迁移到六边形（绞杀者式，按切片推进，**不大爆炸重写**）：
1. 选一条高频变更痛点的纵切（单个端点/任务）。
2. 抽出带显式输入/输出类型的用例边界。
3. 在既有基础设施调用周围引入出站端口（外观先行：先用端口包住遗留服务，再换内部实现）。
4. 把编排逻辑从控制器/服务搬进用例。
5. 保留旧适配器，但让其委派到新用例。
6. 围绕新边界加测试（单元 + 适配器集成）。
7. 逐切片重复；每个切片保留可逆开关/路由切换，验证生产行为前可回滚。

## 注意事项

规避反模式：
- 领域实体导入 ORM 模型、Web 框架类型或 SDK 客户端。
- 用例直接读 `req` / `res` 或队列元数据。
- 用例不经领域/应用映射，直接返回数据库行。
- 适配器之间直接互调，而非经用例端口流转。
- 装配散落多文件 + 隐藏全局单例。

测试遵循同一套边界：领域测试当作纯业务规则（无 mock、无框架）；用例单元测试用假端口断言业务结果与端口交互；出站适配器写共享契约测试套件，跑在每个实现上；入站适配器测协议映射；适配器集成测试跑真实基础设施（序列化、schema/查询、重试、超时）。重构前先加特征化测试（characterization test），保留到新边界行为稳定等价。

通用约束：本技能输出不替代针对具体环境的验证、测试与专家评审；若领域边界、安全边界或成功标准等关键输入缺失，应先停下澄清。

## 互见

- related：`backend-architecture-patterns`（整洁/六边形/DDD 全景）、`clean-code-principles`、`ddd-strategic-design`、`ddd-context-mapping`、`event-sourcing-cqrs`、`api-design-principles`
- combines_with：`zero-downtime-migration-architect` / `database-migration-strategies`（绞杀者迁移时的零停机与数据迁移）、`api-test-suite-builder`（按边界落地契约与集成测试）

---
采编自 affaan-m/everything-claude-code（MIT）。
