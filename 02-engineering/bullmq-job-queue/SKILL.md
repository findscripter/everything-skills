---
name: bullmq-job-queue
title: BullMQ Redis 任务队列后台处理
description: 当在 Node.js/TypeScript 中需要用 Redis 做后台任务、异步处理、延迟/定时/重复任务、限流或多步任务流时使用；产出生产级的 Queue/Worker 配置、重试退避、优雅关闭与 Bull Board 监控代码；不适用于 Serverless 无 Redis 队列、复杂 Saga 工作流编排或纯事件溯源（应转 QStash/Temporal/事件架构）。触发词：BullMQ、任务队列、后台任务
domain: 研发/backend
triggers: [BullMQ, bull queue, redis queue, redis 队列, 后台任务, background job, job queue, 任务队列, delayed job, 延迟任务, repeatable job, 重复任务, worker process, 工作进程, job scheduling, 任务调度, async processing, 异步处理, FlowProducer, 任务流]
tags: [BullMQ, Redis, 任务队列, 后台处理, Node.js, TypeScript, 异步, Worker, 限流, 重试退避, 定时任务, 研发]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [bullmq, ioredis, @bull-board/api, @bull-board/express]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

在 Node.js/TypeScript 应用里需要把耗时或可异步的工作交给 Redis 支撑的队列后台执行时使用，典型场景：

- 发邮件、推送、生成报表等后台任务，请求侧「即发即忘」。
- 延迟任务（N 小时后提醒）、定时/重复任务（每天 9 点跑摘要）。
- 任务优先级、限流（保护下游服务）、失败重试。
- 多步任务流（父任务等待多个子任务完成，如下单 -> 校验库存/扣款/通知）。

**不该用（应转交）：**

- 需要 Serverless / 边缘队列、不想自己管 Redis -> Upstash QStash。
- 复杂工作流、Saga、补偿事务、长流程编排 -> Temporal 类工作流引擎。
- 事件溯源 / CQRS / 事件流 -> 事件驱动架构。
- Redis 集群、内存调优等基础设施 -> Redis 专项；部署、K8s、扩缩容 -> DevOps。

**核心原则：** 生产者侧即发即忘；务必显式设置 job options（默认值很少合适）；幂等是你的责任（任务可能执行多次）；重试用指数退避防雪崩；失败任务要有归宿（死信/保留策略）；并发从保守起步；job data 只传 ID 不传大对象；处理 SIGTERM 优雅关闭防止孤儿任务。

## 步骤

1. **建共享连接**：用 ioredis 建连接，必须设 `maxRetriesPerRequest: null`，否则 Redis 抖动时 Worker 会停摆。
2. **建 Queue 并配默认项**：`attempts` + 指数 `backoff` + `removeOnComplete/removeOnFail` 保留策略。
3. **建 Worker**：设置 `concurrency`（从小开始）和 `limiter` 限流；至少挂 `failed` 和 `stalled` 事件处理。
4. **入队任务**：请求处理器里尽量不 `await queue.add`（即发即忘，更快响应）；按需设 `delay` / `repeat` / `priority`。
5. **多步依赖**：用 `FlowProducer` 编排父子任务。
6. **优雅关闭**：监听 `SIGTERM`/`SIGINT`，先 `pause` 再 `close`。
7. **接监控**：用 Bull Board 可视化队列与任务状态。

## 指令

```bash
npm i bullmq ioredis
npm i @bull-board/api @bull-board/express   # 可选：可视化监控
```

环境变量：`REDIS_URL`（如 `redis://localhost:6379`，托管可选 Upstash / Redis Cloud / ElastiCache / Railway）。

## 示例

**基础队列 + Worker（任何新队列从这里开始）：**

```ts
import { Queue, Worker, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';

// 所有队列共享同一连接
const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,  // BullMQ 必需
  enableReadyCheck: false,
});

const emailQueue = new Queue('emails', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
  },
});

const worker = new Worker('emails', async (job) => {
  await sendEmail(job.data);
}, {
  connection,
  concurrency: 5,
  limiter: { max: 100, duration: 60000 }, // 每分钟 100 个
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});
```

**延迟与定时（重复）任务：**

```ts
// 延迟任务：延迟后执行一次
await queue.add('reminder', { userId: 123 }, {
  delay: 24 * 60 * 60 * 1000, // 24 小时
});

// 重复任务：按 cron 执行，务必带时区
await queue.add('daily-digest', { type: 'summary' }, {
  repeat: { pattern: '0 9 * * *', tz: 'America/New_York' },
});

// 移除重复任务（pattern + tz 要一致）
await queue.removeRepeatable('daily-digest', {
  pattern: '0 9 * * *', tz: 'America/New_York',
});
```

**任务流与依赖（父任务等所有子任务完成）：**

```ts
import { FlowProducer } from 'bullmq';
const flowProducer = new FlowProducer({ connection });

await flowProducer.add({
  name: 'process-order', queueName: 'orders', data: { orderId: 123 },
  children: [
    { name: 'validate-inventory', queueName: 'inventory', data: { orderId: 123 } },
    { name: 'charge-payment',      queueName: 'payments',  data: { orderId: 123 } },
    { name: 'notify-warehouse',    queueName: 'notifications', data: { orderId: 123 } },
  ],
});
```

**优雅关闭（部署/重启时不丢任务）：**

```ts
const shutdown = async () => {
  await worker.pause();   // 停止接新任务
  await worker.close();   // 等当前任务跑完
  await queue.close();    // 关闭队列连接
  process.exit(0);
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
```

**Bull Board 监控面板：**

```ts
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');
createBullBoard({
  queues: [new BullMQAdapter(emailQueue), new BullMQAdapter(orderQueue)],
  serverAdapter,
});
app.use('/admin/queues', serverAdapter.getRouter());
```

## 注意事项

逐条对应源技能的校验规则，按严重度排列：

- **[ERROR] Redis 连接缺 `maxRetriesPerRequest: null`**：Queue/Worker 连接必须设它，否则 Redis 连接出问题时 Worker 会停摆、无法重连。
- **[WARN] Worker 未挂 `stalled` 事件**：stalled 任务意味着 Worker 崩溃，必须监控。
- **[WARN] Worker 未挂 `failed` 事件**：失败任务要记录并告警。
- **[WARN] 无优雅关闭**：缺 SIGTERM/SIGINT 处理，部署时任务可能成孤儿。
- **[WARN] payload 过大**：job data 要小，传 ID 不传完整对象，降低 Redis 内存占用。
- **[WARN] 有重试但无退避策略**：retry 必须配指数退避，避免惊群（thundering herd）。
- **[WARN] 重复任务未显式指定时区**：否则用服务器本地时间，会随夏令时漂移。
- **[INFO] 请求处理器中 `await queue.add`**：建议即发即忘以加快响应。
- **[INFO] 任务无超时配置**：建议设超时，防止任务卡死。
- **[INFO] Worker 并发过高**：确认下游能扛住（数据库连接数、API 限流）。

## 互见

- Redis 基础设施 / 集群 / 内存调优 -> redis 专项技能
- Serverless / 无 Redis 队列 -> Upstash QStash
- 复杂工作流 / Saga / 长流程编排 -> Temporal 类
- 事件溯源 / CQRS / 事件流 -> 事件架构
- 部署 / K8s / 扩缩容 -> DevOps；监控 / 指标 / 告警 -> 性能与可观测性
- 常见组合：邮件队列栈（bullmq + 邮件系统 + redis）、后台处理栈（bullmq + backend + devops）、AI 处理流水线（bullmq + ai-workflow + 性能监控）、定时任务栈（bullmq + backend + redis）

---

采编自 sickn33/antigravity-awesome-skills（MIT）。
