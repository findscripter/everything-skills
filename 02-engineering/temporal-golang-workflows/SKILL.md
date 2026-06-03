---
name: temporal-golang-workflows
title: Temporal Go 工作流：确定性编排与 mTLS
description: 当用 Temporal Go SDK 构建持久化分布式编排（长流程、Saga、信号/定时器、子工作流）时使用；做确定性工作流、mTLS Worker、版本化与重放测试的生产级 Go 实现；不适用于 Python/Java/TS SDK、无持久化需求的简单请求响应或普通 cron。触发词：Temporal、Go SDK、workflow 确定性、mTLS Worker、GetVersion、ContinueAsNew、Selector 信号、Saga 编排
domain: 研发/backend
triggers: [Temporal, Temporal Go SDK, 工作流确定性, mTLS Worker, GetVersion 版本化, ContinueAsNew, Selector 信号, Saga 编排, 持久化执行, 重放测试]
tags: [temporal, golang, workflow, orchestration, mtls, distributed-systems, saga, durable-execution]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [go, go.temporal.io/sdk]
requires: []
related: [temporal-workflow-python, golang-pro, saga-orchestration, go-concurrency-patterns]
combines_with: [mtls-zero-trust-config, grpc-golang-services, event-sourcing-cqrs]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
# Temporal Go 工作流：确定性编排与 mTLS

用 Temporal Go SDK 把模糊的编排需求落成生产级实现，聚焦持久化执行、严格确定性与企业级 Worker 配置。

## 何时使用

- 用 Go 构建需要持久状态与可靠编排的微服务/分布式系统。
- 实现跨天/跨月的长流程、Saga 补偿、信号驱动审批、子工作流编排。
- Worker 需要细粒度并发、mTLS 安全、拦截器等生产级配置。
- 运行中工作流要做版本化演进或零停机 Worker 升级。

**不该用的边界：**
- 其他语言 SDK（Python/Java/TypeScript）——另找对应技能。
- 无持久化/无协调需求的简单请求-响应。
- 不需要持久化的普通 cron。
- 只做高层设计而不落地实现（用 `workflow-orchestration-patterns`）。
- 不覆盖 Temporal Cloud UI、证书签发、Nexus、多集群复制、多区域容灾、实验性 worker-versioning。假设 Temporal Server v1.20+ 与 Go SDK v1.25+。

## 步骤 / 指令

1. **收集上下文**：先问清目标集群（Cloud / 自托管）与 Namespace、Task Queue 名与吞吐量、安全要求（mTLS 证书路径、认证）、失败模式与期望的 retry/timeout 策略。
2. **校验确定性**：工作流代码必须过这 5 条铁律——
   - 不用原生 Go 并发（goroutine）→ 改用 `workflow.Go` / `workflow.Channel` / `workflow.Selector`。
   - 不用原生时间（`time.Now` / `time.Sleep`）→ 改用 `workflow.Now` / `workflow.Sleep`。
   - 不做非确定性 map 遍历 → 遍历前对 key 排序。
   - 不在工作流内做外部 I/O 或网络调用 → 一律放进 Activity。
   - 不用非确定性随机数 → 用 `workflow.SideEffect` 或 Activity 生成。
3. **增量实现**：先定共享 Protobuf/数据结构 → 再 Activity → 再 Workflow → 最后 Worker。
4. **关键能力按需取用**：
   - Worker 调优：`worker.Options` 的 `MaxConcurrentActivityTaskPollers`、`WorkerStopTimeout`、`StickyScheduleToStartTimeout`。
   - 拦截器：Client/Worker/Workflow 拦截器做日志、链路、鉴权等横切关注。
   - 版本化：`workflow.GetVersion` + `workflow.GetReplaySafeLogger` 安全演进逻辑。
   - 历史大小：用 `ContinueAsNew` 规避默认 50MB / 5万事件上限。
   - 长 Activity（>1 分钟）：调用 `activity.RecordHeartbeat`。
   - 重放测试：`replayer.ReplayWorkflowHistoryFromJSON` 验证改动对旧历史兼容。

## 示例

### 示例 1：版本化工作流（确定性）

```go
// imports 省略，需要 go.temporal.io/sdk/{workflow,temporal} 与 time
func SubscriptionWorkflow(ctx workflow.Context, userID string) error {
    // 1. 版本化以安全演进逻辑（v1 = DefaultVersion）
    v := workflow.GetVersion(ctx, "billing_logic", workflow.DefaultVersion, 2)

    for i := 0; i < 12; i++ {
        ao := workflow.ActivityOptions{
            StartToCloseTimeout: 5 * time.Minute,
            RetryPolicy:         &temporal.RetryPolicy{MaximumAttempts: 3},
        }
        ctx = workflow.WithActivityOptions(ctx, ao)

        // 2. 执行 Activity（务必处理 error）
        err := workflow.ExecuteActivity(ctx, ChargePaymentActivity, userID).Get(ctx, nil)
        if err != nil {
            workflow.GetLogger(ctx).Error("Payment failed", "Error", err)
            return err
        }

        // 3. 持久 Sleep（时间跳跃安全），按版本切换周期
        sleepDuration := 30 * 24 * time.Hour
        if v >= 2 {
            sleepDuration = 28 * 24 * time.Hour
        }
        if err := workflow.Sleep(ctx, sleepDuration); err != nil {
            return err
        }
    }
    return nil
}
```

### 示例 2：完整 mTLS Worker

```go
func RunSecureWorker() error {
    // 1. 加载客户端证书与私钥
    cert, err := tls.LoadX509KeyPair("client.pem", "client.key")
    if err != nil {
        return fmt.Errorf("failed to load client keys: %w", err)
    }

    // 2. 加载 CA 证书校验服务端（完整 mTLS）
    caPem, err := os.ReadFile("ca.pem")
    if err != nil {
        return fmt.Errorf("failed to read CA cert: %w", err)
    }
    certPool := x509.NewCertPool()
    if !certPool.AppendCertsFromPEM(caPem) {
        return fmt.Errorf("failed to parse CA cert")
    }

    // 3. 带完整 TLS 配置拨号集群
    c, err := client.Dial(client.Options{
        HostPort:  "temporal.example.com:7233",
        Namespace: "production",
        ConnectionOptions: client.ConnectionOptions{
            TLS: &tls.Config{
                Certificates: []tls.Certificate{cert},
                RootCAs:      certPool,
            },
        },
    })
    if err != nil {
        return fmt.Errorf("failed to dial temporal: %w", err)
    }
    defer c.Close()

    w := worker.New(c, "payment-queue", worker.Options{})
    w.RegisterWorkflow(SubscriptionWorkflow)

    if err := w.Run(worker.InterruptCh()); err != nil {
        return fmt.Errorf("worker run failed: %w", err)
    }
    return nil
}
```

### 示例 3：Selector + 信号 + 超时

```go
func ApprovalWorkflow(ctx workflow.Context) (string, error) {
    var approved bool
    signalCh := workflow.GetSignalChannel(ctx, "approval-signal")

    // 用 Selector 同时等待多个异步事件
    s := workflow.NewSelector(ctx)
    s.AddReceive(signalCh, func(c workflow.ReceiveChannel, _ bool) {
        c.Receive(ctx, &approved)
    })
    // 加 72 小时超时定时器
    s.AddReceive(workflow.NewTimer(ctx, 72*time.Hour).GetChannel(), func(c workflow.ReceiveChannel, _ bool) {
        approved = false
    })
    s.Select(ctx)

    if !approved {
        return "rejected", nil
    }
    return "approved", nil
}
```

## 注意事项

**应当做：**
- 始终处理 `ExecuteActivity` 与 `client.Dial` 的 error。
- 并发用 `workflow.Go` / `workflow.Channel`，绝不用原生 goroutine。
- map 遍历前先排序 key 以保确定性。
- Activity 超过 1 分钟用 `activity.RecordHeartbeat`，并处理 context 取消。
- 改逻辑前用 `replayer.ReplayWorkflowHistoryFromJSON` 校验兼容性。

**不要做：**
- 用 `_` 吞错或在生产 Worker 里 `log.Fatal`。
- 在工作流函数内做网络/磁盘 I/O。
- 依赖原生 `time.Now()` / `rand.Int()`。
- 把它套到不需要持久化的简单 cron 上。

**常见故障排查：**
- **Panic: Determinism Mismatch**：通常是未用 `workflow.GetVersion` 就改逻辑，或引入了非确定性代码（如原生 map 遍历）。
- **Error: History Size Exceeded**：触达默认 5 万事件上限，需实现 `ContinueAsNew`。
- **Worker Hang**：检查 `WorkerStopTimeout`，确保所有 Activity 都处理 context 取消。

## 互见

- related：`grpc-golang` —— 内部传输协议与 Protobuf 设计
- related：`golang-pro` —— Go 通用性能调优与高级语法
- related：`workflow-orchestration-patterns` —— 语言无关的编排策略

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
