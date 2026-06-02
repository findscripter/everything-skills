---
name: golang-pro
title: Go 现代工程实践
description: 当用 Go 1.21+ 构建服务/CLI/微服务、设计并发模型或排查竞态与性能时使用；产出符合 Go 惯例的并发架构、可测代码与性能/可观测性方案（pprof、slog、表驱动测试）；不适用于其他语言运行时、仅需基础语法解释、或无法改动工具链与构建配置的场景；触发词：goroutine、worker pool、pprof、gRPC、race condition
domain: 研发/backend
triggers: [Go 微服务, 并发模式, goroutine 泄漏, worker pool, pprof 性能分析, 竞态条件, gRPC 服务, graceful shutdown, channel 流水线, slog 结构化日志, Go 1.21 泛型, context 取消]
tags: [golang, 并发, 性能优化, 微服务, 可观测性, 测试, 研发]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [pprof, go tool trace, golangci-lint, staticcheck, go test, testify, mockery, OpenTelemetry, Prometheus, slog, wire, air]
requires: []
related: [go-concurrency-patterns, grpc-golang-services, rust-pro, java-modern-pro]
combines_with: [grpc-golang-services, performance-profiler, microservices-patterns]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 用 Go 1.21+ 构建服务、CLI、微服务，或对既有 Go 工程做架构/生产就绪评审。
- 设计并发模型（worker pool、fan-in/fan-out、流水线）、做延迟/内存/吞吐优化。
- 排查竞态、goroutine 泄漏、GC 抖动等并发与性能问题。

不该用（负边界）：
- 需要其他语言或运行时。
- 只需基础 Go 语法解释。
- 无法改动 Go 工具链或构建配置（优化与代码生成无从落地）。

## 步骤

1. 对齐前提：确认 Go 版本、工具链、运行时与部署约束（容器、K8s、内存上限）。
2. 选型：依据负载（CPU-bound vs I/O-bound）选并发模式与架构（清晰/六边形架构、组合优先于继承）。
3. 实现：接口做抽象，显式错误处理与 `%w` 包装，配套表驱动测试与 benchmark。
4. 优化：先测量后优化——用 pprof / trace 定位热点，再调 GC、连接池、内存池。

## 指令

- 先量化再优化：任何性能改动都应有 benchmark 或 pprof 数据支撑，禁止凭直觉调优。
- 错误处理显式化：用 `fmt.Errorf("...: %w", err)` 包装，业务路径不用 `panic/recover`。
- 并发安全优先：每个 goroutine 都要有明确的退出路径（`context.Context` 取消），避免泄漏；用 `-race` 验证。
- 抽象用接口、复用用组合；接口要小（接口隔离）。
- 关键命令：
  - 竞态检测：`go test -race ./...`
  - CPU 剖析：`go test -cpuprofile cpu.out -bench .` → `go tool pprof cpu.out`
  - 内存剖析：`go test -memprofile mem.out -bench .`
  - 执行追踪：`go tool trace trace.out`
  - 静态检查：`golangci-lint run` / `staticcheck ./...`
  - 代码生成：`go generate ./...`（stringer、mockery）
- 生产化：结构化日志用 `log/slog`（1.21+）；可观测性接 OpenTelemetry + Prometheus；容器用多阶段构建。

## 示例

带优雅关闭的 worker pool 骨架（context 取消 + WaitGroup）：

```go
func runPool(ctx context.Context, jobs <-chan Job, n int) {
    var wg sync.WaitGroup
    for i := 0; i < n; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            for {
                select {
                case <-ctx.Done():           // 取消信号，退出避免泄漏
                    return
                case job, ok := <-jobs:
                    if !ok {
                        return               // 通道关闭，正常收尾
                    }
                    if err := job.Do(ctx); err != nil {
                        slog.Error("job failed", "id", job.ID, "err", err)
                    }
                }
            }
        }()
    }
    wg.Wait()
}
```

典型请求：
- "设计带优雅关闭的高性能 worker pool"
- "为这段并发代码定位并修复竞态"
- "用 pprof 优化内存占用与吞吐"
- "实现带中间件和错误处理的 gRPC 服务"
- "搭建带可观测性与健康检查的微服务"

## 注意事项

- 输出不能替代环境内的实测、测试与专家评审；落地前务必跑通 `go test -race` 与基准。
- 输入、权限、安全边界或验收标准缺失时，先停下来澄清再动手。
- 仅在任务确实落在上述范围内时使用本技能。

## 互见

- 微服务可观测性、容器化部署相关技能（OpenTelemetry / Prometheus / K8s）。
- 通用并发与性能剖析方法论。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
