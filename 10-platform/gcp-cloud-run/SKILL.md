---
name: gcp-cloud-run
title: GCP Cloud Run 无服务器
description: 当在 GCP 上构建无服务器容器服务或事件驱动函数时使用；产出 Cloud Run 部署配置、并发/冷启动调优与 Pub/Sub、Cloud SQL、Secret Manager 集成方案；不适用于 AWS Lambda、Azure Functions 或本地 K8s。触发词：Cloud Run、gcloud run deploy、Cloud Run Functions、冷启动、Pub/Sub、并发 concurrency
domain: 平台/cloud
triggers: [Cloud Run, gcloud run deploy, Cloud Run Functions, Cloud Functions gen2, 冷启动优化, cpu-boost, min-instances, 并发 concurrency, Pub/Sub 推送订阅, Cloud SQL 连接, Secret Manager, /tmp 内存, 容器启动超时, GCP 无服务器]
tags: [GCP, Cloud Run, Serverless, 容器, Pub/Sub, Cloud SQL, Secret Manager, 冷启动, 并发, DevOps]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [gcloud, docker, Cloud Build, Pub/Sub, Cloud SQL, Secret Manager, Cloud Tasks]
requires: []
related: [gcp-cloud-architect, aws-serverless-builder, cloudflare-workers-edge, kubernetes-architect]
combines_with: [docker-container-optimizer, terraform-specialist, rest-api-endpoint-builder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用于在 GCP 上构建生产级无服务器应用，并需要在以下两类计算之间做选型与调优时：

- **Cloud Run 服务（容器化）**：Web 应用与 API、需要任意运行时/库、多端点复杂服务、无状态容器化负载。
- **Cloud Run Functions（事件驱动，原 Cloud Functions）**：简单事件处理、Pub/Sub 消息处理、Cloud Storage 触发器、HTTP webhook。

同时覆盖冷启动优化、并发配置、Pub/Sub 事件架构、Cloud SQL 连接、Secret Manager 密钥管理。

**不该用边界**：
- AWS 无服务器（Lambda/API Gateway/SAM）→ 用 aws-serverless。
- Azure 容器/函数（Container Apps/Functions）→ 用 azure-functions。
- 关系库建模（Cloud SQL/AlloyDB 设计）→ 用 postgres-wizard；认证（Firebase/Identity Platform）→ auth-specialist；编排（Cloud Workflows/Eventarc）→ workflow-automation。
- 不替代环境内的实际验证、测试与专家评审；缺少所需输入、权限、安全边界或成功标准时先停下澄清。

核心原则：容器跑 Cloud Run、简单事件处理用 Functions；容器要启动快且无状态；用 `cpu-boost` + `min-instances` 优化冷启动；并发按负载设定；`/tmp` 占用内存须计入；优雅处理 SIGTERM；仅在必要时用 VPC Connector（会增加延迟）。

## 步骤 / 指令

1. **选型**：判定走 Cloud Run 服务还是 Functions（见上）。
2. **写容器**：多阶段构建缩小镜像，监听 `PORT`（默认 8080），以非 root 用户运行，监听 `SIGTERM` 优雅关停。
3. **部署服务**：用 `gcloud run deploy ... --source .` 直接部署，或经 `cloudbuild.yaml` 构建-推送-部署三步流水线。
4. **调并发与冷启动**：默认 concurrency=80（I/O 密集型）；CPU 密集型调小；开启 `--cpu-boost`、设 `--min-instances`、用 distroless 镜像、对重依赖懒加载。
5. **接事件/数据**：按需配置 Pub/Sub 推送订阅、Cloud SQL（Unix socket + 连接池）、Secret Manager（环境变量或文件挂载）。
6. **避坑校验**：内存计入 /tmp、避免无谓 concurrency=1、后台任务防 CPU 限流、VPC 连接保活、控制启动时长 < 4 分钟。

关键参数与命令：

```bash
# 直接部署服务
gcloud run deploy my-service \
  --source . --region us-central1 --allow-unauthenticated \
  --memory 512Mi --cpu 1 \
  --min-instances 1 --max-instances 100 \
  --concurrency 80 --cpu-boost

# Functions（gen2）三种触发器
gcloud functions deploy hello-http --gen2 --runtime nodejs20 \
  --trigger-http --allow-unauthenticated --region us-central1
gcloud functions deploy process-messages --gen2 --runtime nodejs20 \
  --trigger-topic my-topic --region us-central1
gcloud functions deploy process-uploads --gen2 --runtime nodejs20 \
  --trigger-event-filters="type=google.cloud.storage.object.v1.finalized" \
  --trigger-event-filters="bucket=my-bucket" --region us-central1
```

并发取值参考：=1 仅用于 CPU 密集或线程不安全代码；8~20 内存密集型；80 默认、I/O 密集型友好；250 上限、用于极轻量处理器。粗算：`并发 ≈ 内存上限 / 单请求内存`（如 512MB、单请求 20MB → 安全并发约 25）。

## 示例

容器（多阶段、非 root、监听 PORT、优雅关停）：

```dockerfile
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-slim
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY src ./src
COPY package.json ./
ENV PORT=8080
EXPOSE 8080
USER node
CMD ["node", "src/index.js"]
```

```javascript
const express = require('express');
const app = express();
app.use(express.json());
app.get('/health', (req, res) => res.status(200).send('OK'));

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => process.exit(0));
});
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => console.log(`listening on ${PORT}`));
```

Pub/Sub 推送订阅 → Cloud Run（200 确认，500 触发重试，并配死信队列）：

```bash
gcloud pubsub topics create orders
gcloud pubsub subscriptions create orders-push \
  --topic orders --push-endpoint https://my-service-xxx.run.app/pubsub --ack-deadline 600
# 死信队列
gcloud pubsub topics create orders-dlq
gcloud pubsub subscriptions update orders-push \
  --dead-letter-topic orders-dlq --max-delivery-attempts 5
```

```javascript
app.post('/pubsub', async (req, res) => {
  if (!req.body.message) return res.status(400).send('Invalid Pub/Sub message');
  try {
    const m = req.body.message;
    const data = m.data ? JSON.parse(Buffer.from(m.data, 'base64').toString()) : {};
    await processOrder(data);
    res.status(200).send('OK');      // 确认
  } catch (e) {
    res.status(500).send('failed');  // 触发重试
  }
});
```

Cloud SQL（Unix socket + 连接池，池大小 5~10）：

```javascript
const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.DB_USER, password: process.env.DB_PASS, database: process.env.DB_NAME,
  host: `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`,
  max: 5, idleTimeoutMillis: 30000, connectionTimeoutMillis: 10000,
});
// 部署时附加：--add-cloudsql-instances PROJECT:REGION:INSTANCE
```

Secret Manager（环境变量或文件挂载）：

```bash
echo -n "my-secret-value" | gcloud secrets create my-secret --data-file=-
gcloud run deploy my-service --update-secrets=API_KEY=my-secret:latest          # 环境变量
gcloud run deploy my-service --update-secrets=/secrets/api-key=my-secret:latest  # 文件挂载
```

## 注意事项

- **/tmp 计入内存（HIGH）**：Cloud Run 的 /tmp 是内存文件系统，写文件即吃容器内存，易 OOM。改用流式处理、直读写 Cloud Storage，部署时把 /tmp 开销算进 `--memory`。
- **慎用 concurrency=1（HIGH）**：每实例只处理一请求，流量高峰时实例数暴涨、冷启动和成本激增。仅用于真正单线程、单请求重内存或线程不安全库；其余用异步 I/O + 高并发。
- **非请求期 CPU 被限流（HIGH）**：默认仅请求期分配 CPU，后台线程/连接池维护/指标上报会极慢。需后台工作时设 `--cpu-throttling=false --min-instances=1`，或把重活移交 Cloud Tasks / Pub/Sub worker。
- **容器启动超时 4 分钟（HIGH）**：容器须在 240s 内监听 PORT，否则被杀。用 `--cpu-boost`、懒加载重模型、先起服务后台异步初始化、迁移用 Cloud Run Jobs 单独跑。
- **VPC Connector 10 分钟空闲超时（MEDIUM）**：空闲连接被静默关闭。连接池设 `pool_recycle≈300`、`pool_pre_ping`、TCP keep-alive，或用 Cloud SQL Connector 自动重连。
- **请求超时需对齐（MEDIUM）**：HTTP 默认 300s、最大 3600s。长任务用 `--timeout` 调高，或改为 webhook 回调 / Cloud Tasks / 流式响应。
- **gen1 vs gen2（MEDIUM）**：gen2（gVisor）网络栈不同、不自动 HTTP→HTTPS 跳转、支持 GPU。用 `--execution-environment=gen2` 显式指定，并自行处理 HTTPS 跳转。
- **安全红线（ERROR）**：禁止硬编码 GCP 凭据/API Key、禁止把 service account JSON 提交进仓库（加 .gitignore + Secret Manager / Workload Identity）。容器勿以 root 运行（加 `USER`），端口走 `PORT` 环境变量，勿硬编码。

## 互见

- aws-serverless（AWS Lambda/API Gateway/SAM）
- azure-functions（Azure Container Apps/Functions）
- postgres-wizard（Cloud SQL/AlloyDB 设计）
- auth-specialist（Firebase Auth/Identity Platform）
- llm-architect（Vertex AI、Cloud Run + LLM）
- workflow-automation（Cloud Workflows/Eventarc）

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
