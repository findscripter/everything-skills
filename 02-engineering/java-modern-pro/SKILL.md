---
name: java-modern-pro
title: Java 21+ 现代开发
description: 当用 Java 21+ LTS 构建高并发企业应用或 Spring Boot 3.x 服务时使用；做虚拟线程、模式匹配、record/sealed、GraalVM 原生镜像与可观测性的现代化改造与落地产物；不适用于 Java 8/11 遗留维护、非 JVM 语言或纯前端任务；触发词：虚拟线程、Spring Boot 3、GraalVM
domain: 研发/backend
triggers: [虚拟线程, Virtual Threads, Project Loom, 模式匹配, Spring Boot 3, GraalVM 原生镜像, Java 21, 结构化并发, ZGC 调优, Testcontainers]
tags: [java, jvm, spring boot, 虚拟线程, graalvm, 并发, 云原生, 微服务]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Edit, Write, Bash, Grep, Glob]
requires: []
related: [kotlin-coroutines-flow, scala-pro, golang-pro, dotnet-backend-patterns]
combines_with: [nestjs-expert, graphql-architect, grpc-golang-services]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 用 Java 21+（LTS）开发或重构企业级、高并发服务，需要虚拟线程、模式匹配、record、sealed 类、文本块等现代语言特性。
- 基于 Spring Boot 3.x / Spring Framework 6+ 构建 WebMVC/WebFlux、Spring Data JPA（Hibernate 6+）、Spring Security 6（OAuth2/JWT）、Spring Cloud 微服务。
- 需要 GraalVM Native Image 加速冷启动、降低内存，或做 JVM/GC 调优、JMH 基准、APM 与分布式追踪。
- 需要把基于平台线程的阻塞 I/O 服务迁移到虚拟线程以提升吞吐。

不该用：
- 维护 Java 8/11 老项目且不打算升级语言特性；非 JVM 语言（Go/Node/Python）；纯前端或与 Java 无关的任务。
- 替代真实环境的验证、测试与专家评审——产出仍需在目标环境实测。

## 步骤

1. 明确目标、约束与输入：JDK 版本、Spring 版本、并发模型（阻塞 vs 响应式）、部署形态（JVM/容器/Native）、SLA（吞吐还是延迟）。
2. 选型现代特性：I/O 密集优先虚拟线程而非响应式；不可变数据用 record；受控继承用 sealed；分支逻辑用 switch 模式匹配，减少样板。
3. 实现并对照企业规范：Spring 约定、Bean Validation 校验、预编译语句防注入、分层/六边形/DDD 架构。
4. 并发与性能：结构化并发管理任务生命周期，用 ScopedValue 替代 ThreadLocal；按工作负载选 GC（低延迟 ZGC、通用 G1）。
5. 测试闭环：JUnit 5 + Mockito + `@SpringBootTest` 测试切片 + Testcontainers 起真实依赖；关键路径用 JMH 基准。
6. 云原生与可观测：Actuator 健康检查、Micrometer + OpenTelemetry 追踪、结构化日志带 correlation-id；必要时出 GraalVM Native 构建。
7. 验证交付：给出可运行命令与验证方式，说明安全与合规考量。

## 指令

- 优先用现代特性写干净、类型安全的代码，靠编译期检查规避运行时错误。
- 虚拟线程不是银弹：仅对阻塞 I/O 受益；CPU 密集仍用有界平台线程池。注意 pinning（`synchronized` 块内阻塞会钉住载体线程，改用 `ReentrantLock`）。
- 迁移到虚拟线程：Spring Boot 3.2+ 一行配置 `spring.threads.virtual.enabled=true`；手动场景用 `Executors.newVirtualThreadPerTaskExecutor()`。
- 防 N+1 查询，连接池用 HikariCP 调优；DB 变更用 Flyway/Liquibase 管理。
- 记录架构决策与设计模式，紧跟 Java 生态演进。

## 示例

虚拟线程 + 结构化并发并行拉取并在任一失败时整体取消：

```java
try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
    Subtask<User>  user  = scope.fork(() -> findUser(id));
    Subtask<Order> order = scope.fork(() -> fetchOrder(id));
    scope.join().throwIfFailed();          // 等待全部，失败即抛
    return new Response(user.get(), order.get());
}
```

每任务一虚拟线程的 Executor：

```java
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    IntStream.range(0, 10_000)
             .forEach(i -> executor.submit(() -> handle(i)));
}
```

switch 模式匹配 + record 解构：

```java
sealed interface Shape permits Circle, Rect {}
record Circle(double r) implements Shape {}
record Rect(double w, double h) implements Shape {}

double area = switch (shape) {
    case Circle(double r)        -> Math.PI * r * r;
    case Rect(double w, double h) -> w * h;
};
```

GraalVM 原生镜像构建（Spring Boot）：`./mvnw -Pnative native:compile`，产出秒级启动、低内存的可执行文件。

典型请求：「把这个 Spring Boot 应用迁移到虚拟线程」「用 Spring Cloud + Resilience4j 设计带熔断的微服务」「为高吞吐交易做 JVM/GC 调优」「用 Spring Security 6 实现 OAuth2」「出 GraalVM Native 构建加速容器启动」「用 Testcontainers 搭建集成测试」。

## 注意事项

- 虚拟线程下避免线程池复用思维：直接每请求一线程；不要把虚拟线程放进固定大小池。
- `synchronized` + 阻塞调用会导致 pinning，迁移前排查并替换为 `ReentrantLock`，用 `-Djdk.tracePinnedThreads=full` 诊断。
- Native Image 对反射、动态代理、资源加载敏感，需提供 reachability metadata 或用 Spring AOT；CI 中单独跑 native 测试。
- GC 选择按 SLA：延迟敏感选 ZGC（`-XX:+UseZGC`），通用吞吐选 G1，别盲目调参，先用 async-profiler/JFR 定位瓶颈。
- 安全遵循 OWASP：Bean Validation 校验入参、预编译语句防 SQL 注入、防 XSS/CSRF、密钥用外部化配置而非硬编码。
- 缺少必要输入、权限、安全边界或成功标准时，先停下来澄清。

## 互见

- 容器化与 Kubernetes 部署、CI/CD 流水线（GitHub Actions/Jenkins）相关技能。
- 可观测性与 APM、分布式追踪（OpenTelemetry）相关技能。
- 数据库迁移与持久化优化（Flyway、HikariCP、Testcontainers）相关技能。

---
采编自 sickn33/antigravity-awesome-skills（MIT License）。
