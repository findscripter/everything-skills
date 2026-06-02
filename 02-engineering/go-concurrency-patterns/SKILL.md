---
name: go-concurrency-patterns
title: Go 并发模式
description: 当编写 Go 并发代码、需实现 worker pool/流水线、管理 goroutine 生命周期或排查数据竞争时使用；产出基于 goroutine、channel、sync 原语与 context 的可落地并发模式与代码（worker pool、fan-out/fan-in、信号量限流、优雅关停、errgroup、sync.Map）及竞态检测命令；不适用于非 Go 语言或纯串行逻辑；触发词：goroutine、channel、worker pool、context、data race、errgroup。
domain: 研发/backend
triggers: [Go 并发, goroutine, channel, worker pool, fan-out fan-in, context 取消, 数据竞争, race condition, errgroup, sync.WaitGroup, 优雅关停, 信号量限流]
tags: [go, concurrency, goroutine, channel, context, worker-pool, race-detection, backend]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [go test -race, go build -race, go run -race, golang.org/x/sync/errgroup, golang.org/x/sync/semaphore]
requires: []
related: [golang-pro, grpc-golang-services, rust-pro, async-python-patterns]
combines_with: [golang-pro, grpc-golang-services, performance-profiler]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用于：
- 编写并发 Go 应用，需要让多个任务并行跑。
- 实现 worker pool（工作池）或多阶段 pipeline（流水线）。
- 管理 goroutine 生命周期，确保有退出路径、不泄漏。
- 用 channel 在 goroutine 间通信，或用 context 做取消/超时控制。
- 排查 data race（数据竞争）、实现优雅关停（graceful shutdown）。

不该用：
- 任务与 Go 并发无关，或属于其他语言/领域。
- 纯串行逻辑，引入并发只会增加复杂度而无收益。
- 把本技能输出当成免测交付——并发代码必须经 `-race` 检测和针对性测试验证。

核心心法（Go 并发圣经）：
> Don't communicate by sharing memory; share memory by communicating.
> 不要通过共享内存来通信，而要通过通信来共享内存。

常用原语速查：`goroutine`（轻量并发执行）、`channel`（goroutine 间通信）、`select`（多路复用 channel）、`sync.Mutex`（互斥）、`sync.WaitGroup`（等待完成）、`context.Context`（取消与截止时间）。

## 步骤

1. 明确目标与约束：并发度上限、是否需要超时/取消、错误如何聚合、关停语义。
2. 选模式：
   - 多任务同构处理 → Worker Pool。
   - 多阶段数据处理 → Fan-Out/Fan-In Pipeline。
   - 需限制并发数 → Semaphore（信号量）。
   - 需要"任一失败即全体取消"+错误返回 → errgroup。
   - 高频读、低频写的共享状态 → sync.Map；写密集 → 分片 map（ShardedMap）。
3. 贯穿 context：所有阻塞点都 `select { case <-ctx.Done(): return; ... }`，避免 goroutine 泄漏。
4. channel 关闭只由发送方做；用 WaitGroup 等所有发送方结束后再 `close`。
5. 处理信号实现优雅关停：`signal.Notify` 监听 SIGINT/SIGTERM，`cancel()` 触发，带超时等待 WaitGroup。
6. 验证：`go test -race ./...` 跑竞态检测，补并发场景测试。

## 指令

```bash
# 测试时开启竞态检测器（最常用）
go test -race ./...

# 构建时开启竞态检测
go build -race .

# 运行时开启竞态检测
go run -race main.go
```

约束 Do / Don't：
- 用 context 管理取消与截止时间；channel 只从发送方关闭；并发+错误用 errgroup；已知数量就用带缓冲 channel；能用 channel 就别用 mutex。
- 别泄漏 goroutine（必须有退出路径）；别从接收方关 channel（会 panic）；非必要别共享内存；别忽略 `ctx.Done()`；别用 `time.Sleep` 做同步（用真正的同步原语）。

## 示例

Worker Pool（工作池，N 个 worker 消费同一 jobs channel）：

```go
func WorkerPool(ctx context.Context, numWorkers int, jobs <-chan Job) <-chan Result {
    results := make(chan Result, len(jobs))
    var wg sync.WaitGroup
    for i := 0; i < numWorkers; i++ {
        wg.Add(1)
        go func(workerID int) {
            defer wg.Done()
            for job := range jobs {
                select {
                case <-ctx.Done():
                    return
                default:
                    results <- processJob(job)
                }
            }
        }(i)
    }
    go func() { wg.Wait(); close(results) }() // 全部完成后关闭
    return results
}
```

Fan-Out/Fan-In（多个 squarer 并行消费，merge 合流）：

```go
func merge(ctx context.Context, cs ...<-chan int) <-chan int {
    var wg sync.WaitGroup
    out := make(chan int)
    output := func(c <-chan int) {
        defer wg.Done()
        for n := range c {
            select {
            case <-ctx.Done():
                return
            case out <- n:
            }
        }
    }
    wg.Add(len(cs))
    for _, c := range cs {
        go output(c)
    }
    go func() { wg.Wait(); close(out) }()
    return out
}
// in := generate(ctx, ...); c1,c2,c3 := square(ctx,in)×3; for v := range merge(ctx,c1,c2,c3) {...}
```

信号量限流（channel 版，简单可靠）：

```go
type Semaphore chan struct{}
func NewSemaphore(n int) Semaphore { return make(chan struct{}, n) }
func (s Semaphore) Acquire()       { s <- struct{}{} }
func (s Semaphore) Release()       { <-s }
// 也可用 golang.org/x/sync/semaphore 的 Weighted，支持 ctx 取消：sem.Acquire(ctx, 1)
```

errgroup（任一失败即取消其余，并可限并发）：

```go
g, ctx := errgroup.WithContext(ctx)
g.SetLimit(limit) // 最大并发 goroutine 数
for i, url := range urls {
    i, url := i, url
    g.Go(func() error {
        result, err := fetchURL(ctx, url)
        if err != nil { return err } // 首个错误会取消其余
        mu.Lock(); results[i] = result; mu.Unlock()
        return nil
    })
}
if err := g.Wait(); err != nil { return nil, err }
```

优雅关停（信号驱动 + 带超时等待）：

```go
sigCh := make(chan os.Signal, 1)
signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)
server.Start(ctx)
<-sigCh
cancel() // 取消 context，通知 worker 退出
// Shutdown 内：done := make(chan struct{}); go func(){ wg.Wait(); close(done) }()
//   select { case <-done: 干净退出; case <-time.After(timeout): 超时强退 }
```

## 注意事项

- goroutine 泄漏是头号坑：每个 goroutine 都要有明确退出路径，阻塞操作一律配 `ctx.Done()` 分支。
- `close` 只能由发送方且仅一次执行；从接收方关或重复关都会 panic。
- 共享变量（如示例中的 `results[i]`、`errors`）写入要用 `mu.Lock()` 保护，否则 `-race` 会报。
- `sync.Map` 仅适合读多写少；写密集请用分片 map（按 key 哈希分到不同 `RWMutex` 分片）降低锁竞争。
- select 优先级：先用带 `default` 的 select 探测高优先级 channel，未命中再进入普通 select。
- 别把 `-race` 当摆设：它能查出绝大多数数据竞争，CI 中应常态化跑 `go test -race ./...`。

## 互见

- 官方：Go Concurrency Patterns（https://go.dev/blog/pipelines）、Effective Go - Concurrency（https://go.dev/doc/effective_go#concurrency）、Go by Example - Goroutines（https://gobyexample.com/goroutines）。
- 库：`golang.org/x/sync/errgroup`、`golang.org/x/sync/semaphore`。

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
