---
name: scala-pro
title: Scala 企业级开发
description: 当用 Scala 做企业级函数式编程、分布式系统或大数据处理时使用；做架构选型、效果系统/Actor/流式建模、性能调优并产出可运行 Scala 代码与方案；不适用于纯 Java/Kotlin、与 Scala 无关的通用问题或仅环境配置；触发词：Scala、ZIO、Cats Effect、Pekko、Akka、Spark、Http4s、SBT。
domain: 研发/backend
triggers: [Scala, ZIO, Cats Effect, Pekko, Akka, Spark, Http4s, Tapir, Doobie, SBT, 函数式编程, Actor 模型, 事件溯源, 响应式流]
tags: [scala, functional-programming, distributed-systems, big-data, engineering]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [scala, sbt, zio, cats-effect, pekko, spark]
requires: []
related: [java-modern-pro, kotlin-coroutines-flow, golang-pro, rust-pro]
combines_with: [spark-job-optimization, graphql-architect, data-pipeline-engineer]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 用 **Scala（尤其 Scala 3）** 做企业级函数式编程、分布式系统、大数据/流式处理时使用。
- 典型场景：用 **Cats Effect / ZIO** 做纯函数式副作用建模；用 **Apache Pekko / Akka** 搭 Actor、集群分片、事件溯源；用 **Pekko Streams / FS2** 做带背压的响应式流；用 **Spark** 做大规模批/流计算；用 **Http4s / Tapir** 建类型安全 API；用 **Doobie / Slick / Quill** 做函数式数据访问。
- 触发词：Scala、ZIO、Cats Effect、Pekko、Akka、Spark、Http4s、Tapir、Doobie、SBT、函数式编程、Actor 模型、事件溯源、响应式流。

不该用的边界：
- 纯 **Java / Kotlin / 其他 JVM 语言**项目，与 Scala 语义无关 → 不用本技能。
- 与 Scala 无关的通用编程/算法/ML 问题。
- 仅装环境（装 JDK、配 SBT 镜像）这类纯运维配置，无设计/编码诉求。
- 通用代码审查找 bug → 用 `code-reviewer`；依赖/CVE 体检 → 用 `dependency-auditor`。

## 步骤 / 指令

```
1. 厘清目标与约束
   - 确认 Scala 版本（优先 Scala 3）、目标平台（JVM / GraalVM Native / Scala.js）、
     现有技术栈（是否已绑定 Akka/Pekko、Cats Effect/ZIO），以及 SLA（吞吐、延迟、一致性）。

2. 选效果系统（二选一，不混用）
   - Cats Effect 3 + fs2 + http4s + doobie：生态正交、类型类驱动，偏「库组合」。
   - ZIO 2 + zio-streams + zio-http：内建错误通道(R,E,A)、依赖注入(ZLayer)，偏「一体化」。
   - 选定后全栈统一；副作用一律入 IO/ZIO，禁裸 Future 混搭破坏引用透明。

3. 领域建模（编译期优先）
   - 用 sealed trait + case class 建 ADT，穷尽 match；非法状态用智能构造器(smart constructor)挡在类型外。
   - 错误显式建模：Either / Validated / Ior（Cats）或 ZIO 的 E 通道；不用异常做控制流。
   - 复杂状态更新用 Monocle 透镜，保持不可变。

4. 分布式 / 并发
   - 有状态实体 + 横向扩展 → Pekko 集群分片 + 事件溯源(Persistence) + CQRS。
   - 数据管道 → Pekko Streams / fs2，显式背压与流控，避免无界缓冲。
   - 大数据 → Spark：优先 DataFrame/Dataset（走 Catalyst 优化器），慎用低阶 RDD。

5. 韧性
   - 断路器 / 舱壁 / 指数退避重试（Pekko、resilience4j、ZIO Schedule）。
   - 服务边界清晰，REST/HTTP(OpenAPI via Tapir) 或高性能 gRPC；优雅降级。

6. 性能与验证
   - 尾递归(@tailrec)、惰性求值、memoization；GC 调优(G1/ZGC)，必要时 off-heap。
   - 云原生冷启动慢 → GraalVM Native Image。
   - 用 JMH 微基准 + Async-profiler 火焰图定位热点，先测后调。

7. 测试与构建
   - ScalaTest/Specs2 + ScalaCheck 做基于属性的测试覆盖不变量。
   - SBT/Mill 多模块；PureConfig/Ciris 类型安全配置；SLF4J/Logback 结构化日志。
   - 交付前在目标环境实测，不把建议当作免验证的成品。
```

规则：
- 效果系统、流库、HTTP 库在同一服务内保持一致，避免 Cats/ZIO 双栈拉锯。
- 优先编译期正确性：能用类型表达的约束就不要留到运行时。
- 缺关键输入（版本、平台、一致性要求、成功标准）时先发问再动手。

## 示例

ZIO 2 错误通道 + 服务分层最小骨架：
```scala
import zio._

final case class User(id: Long, name: String)
sealed trait UserError
case object NotFound extends UserError

trait UserRepo:
  def find(id: Long): IO[UserError, User]

object UserRepo:
  val live: ULayer[UserRepo] = ZLayer.succeed:
    new UserRepo:
      def find(id: Long): IO[UserError, User] =
        if id == 1 then ZIO.succeed(User(1, "Ann"))
        else ZIO.fail(NotFound)

val program: ZIO[UserRepo, UserError, String] =
  ZIO.serviceWithZIO[UserRepo](_.find(1)).map(_.name)
```

Cats Effect + fs2 背压流处理：
```scala
import cats.effect._
import fs2.Stream

def pipeline[F[_]: Async]: Stream[F, Int] =
  Stream.range(1, 1_000_000)
    .chunkN(1000)              // 分块控制内存
    .flatMap(Stream.chunk)
    .evalMap(n => Async[F].pure(n * 2))   // 有界并发，天然背压
```

ADT + 智能构造器把非法状态挡在类型外：
```scala
opaque type Email = String
object Email:
  def from(s: String): Either[String, Email] =
    if s.matches(".+@.+\\..+") then Right(s) else Left(s"invalid: $s")
```

SBT 多模块片段：
```scala
lazy val core = project.settings(scalaVersion := "3.3.4")
lazy val api  = project.dependsOn(core)
  .settings(libraryDependencies += "org.http4s" %% "http4s-ember-server" % "0.23.x")
```

## 注意事项

- **Akka 许可变更**：新项目用开源继任者 **Apache Pekko**；维护遗留 Akka 时注意 BSL 商业许可边界，迁移按 Akka→Pekko 路径走。
- 不混用效果系统：Cats Effect 与 ZIO 各成生态，单服务内择一到底。
- Scala 3 与 2 不完全二进制兼容；引第三方库先确认已发布 Scala 3 构件。
- Spark 优先 DataFrame/Dataset 让 Catalyst 优化；UDF 与过早 collect 会破坏优化与内存。
- 性能先量化（JMH/profiler）再改，勿凭直觉调 GC/并发参数。
- 安全：留意 OWASP Top 10，输入校验、反序列化、密钥管理不可省。
- 本技能产出方案/代码，不替代在目标环境的测试、验证与专家评审。

## 互见

- requires：无。
- related：`code-reviewer`（产出 Scala 代码后做正确性审查）、`dependency-auditor`（SBT 依赖/CVE 体检）。
- combines_with：无。

---
采编自 sickn33/antigravity-awesome-skills（MIT），适配重写为中文。
