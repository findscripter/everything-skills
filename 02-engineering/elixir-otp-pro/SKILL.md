---
name: elixir-otp-pro
title: Elixir/OTP 并发编程
description: 当用 Elixir/OTP 构建高并发容错或分布式系统、设计监督树或开发 Phoenix LiveView 实时应用时使用；产出 OTP 应用（GenServer/Supervisor）、Phoenix 上下文与 ExUnit 测试；不适用于其他语言运行时、仅需基础语法或无法改动 mix 工程；触发词：GenServer、监督树、Phoenix LiveView、let it crash、BEAM
domain: 研发/backend
triggers: [Elixir 并发, OTP 模式, GenServer, Supervisor 监督树, Phoenix LiveView, Ecto changeset, let it crash, BEAM 性能, 分布式节点 clustering, 模式匹配, ExUnit 测试, Telemetry 观测]
tags: [elixir, otp, 并发, 容错, phoenix, 分布式, beam, 研发]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [mix, ExUnit, Dialyzer, Benchee, ":observer", ":recon", Phoenix, Ecto, Telemetry, StreamData]
requires: []
related: [rust-pro, scala-pro, go-concurrency-patterns, ruby-pro]
combines_with: [microservices-patterns, distributed-tracing, performance-profiler]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 用 Elixir/OTP 构建高并发、容错、分布式服务，或对既有工程做架构/生产就绪评审。
- 设计 OTP 监督树与进程模型（GenServer、Supervisor、Application、Task），用进程做隔离与并发。
- 开发 Phoenix 框架与 LiveView 实时功能，用 Ecto 做数据库交互与 changeset。
- 在 BEAM 上做性能优化，排查进程瓶颈、内存与消息堆积。

不该用（负边界）：
- 需要其他语言或运行时（非 BEAM）。
- 只需基础 Elixir 语法解释。
- 无法改动 mix 工程、依赖或运行时配置（监督树与剖析无从落地）。

## 步骤

1. 对齐前提：确认 Elixir/OTP 版本、运行时与部署约束（release、容器、集群拓扑）。
2. 进程设计：按隔离边界划分进程，画出监督树；选 GenServer 还是 Task/Agent，定 restart 策略（`:one_for_one`/`:rest_for_one`/`:one_for_all`）。
3. 实现：用模式匹配 + 卫语句替代条件分支；状态走不可变数据；副作用进程化。
4. 测试：ExUnit 配 doctest，能 `async: true` 就并发跑；用 StreamData 做属性测试。
5. 优化：先测后调——用 `:observer`/`:recon` 定位瓶颈，再调进程数、邮箱与 ETS。

## 指令

- 拥抱「let it crash」：不要防御式 catch 所有异常，让进程崩溃由 Supervisor 重启恢复，靠监督树而非 try/rescue 保证容错。
- 模式匹配优先于条件逻辑；函数头多子句 + 卫语句，少用 `if/cond`。
- 进程做隔离与并发；不可变数据保证状态可预测。
- 类型安全用 Dialyzer 规格（`@spec`），提交前跑 `mix dialyzer`。
- Phoenix 工程用 context 划清边界，保持 web 层薄。
- 关键命令：
  - 测试：`mix test`（doctest + `async: true`）
  - 类型检查：`mix dialyzer`
  - 静态/格式：`mix credo` / `mix format`
  - 基准：用 `Benchee` 写 bench，量化对比
  - 在线诊断：`:observer.start()`，进程级排查用 `:recon`
- 可观测性：接 `Telemetry` 埋点；惯例遵循社区 style guide。

## 示例

最小 GenServer 骨架（状态 + 调用，配 doctest 与 spec）：

```elixir
defmodule Counter do
  use GenServer

  # Client API
  @spec start_link(integer()) :: GenServer.on_start()
  def start_link(initial), do: GenServer.start_link(__MODULE__, initial, name: __MODULE__)

  @spec bump() :: integer()
  def bump, do: GenServer.call(__MODULE__, :bump)

  # Server callbacks
  @impl true
  def init(initial), do: {:ok, initial}

  @impl true
  def handle_call(:bump, _from, count), do: {:reply, count + 1, count + 1}
end
```

监督树（`:one_for_one`，子进程崩溃只重启自己）：

```elixir
children = [{Counter, 0}]
Supervisor.start_link(children, strategy: :one_for_one)
```

典型请求：
- "为这个有状态服务设计 GenServer + 监督树"
- "用 LiveView 做实时仪表盘，含 PubSub 推送"
- "排查进程邮箱堆积导致的内存增长"
- "把这段命令式逻辑改写成模式匹配 + 卫语句"
- "为这个 OTP 应用补 Dialyzer 规格与属性测试"

## 注意事项

- 输出不能替代环境内的实测、测试与专家评审；落地前务必跑通 `mix test` 与 `mix dialyzer`。
- 「let it crash」不等于忽略错误——崩溃要被监督树捕获重启，restart 策略与重启上限（`max_restarts`）需按业务调，避免重启风暴。
- 输入、权限、安全边界或验收标准缺失时，先停下来澄清再动手。
- 仅在任务确实落在上述范围（BEAM/Elixir/OTP）内时使用本技能。

## 互见

- related：`rust-pro` / `scala-pro` / `go-concurrency-patterns` —— 其他高并发/容错运行时的对照思路。
- combines_with：`microservices-patterns` / `distributed-tracing` —— 把 OTP 应用接入微服务架构与跨服务可观测性。
- combines_with：`performance-profiler` —— 通用瓶颈剖析方法论，配合 `:observer`/`:recon`。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
