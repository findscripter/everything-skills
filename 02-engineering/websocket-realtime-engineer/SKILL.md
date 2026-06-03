---
name: websocket-realtime-engineer
title: WebSocket 实时通信工程
description: 当构建 WebSocket/Socket.IO 实时双向通信系统时使用；产出带鉴权、房间、重连、Redis 横向扩展的服务端与客户端实现及扩缩容方案；不适用于单向服务器推送（用 SSE）、低频轮询或纯请求-响应场景。触发词：WebSocket、Socket.IO、实时通信、双向消息、pub/sub、在线状态、房间管理。
domain: 研发/backend
triggers: [WebSocket, Socket.IO, 实时通信, 双向消息, pub/sub, 在线状态/presence, 房间/namespace 管理, 服务器推送, 聊天系统, 断线重连]
tags: [backend, 实时通信, websocket, socket.io, redis, 横向扩展, 鉴权]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Node.js, Socket.IO, ws, Redis, @socket.io/redis-adapter, JWT/jsonwebtoken, wscat, nginx]
requires: []
related: [convex-reactive-backend, discord-bot-architect, hono-edge-api, rest-api-endpoint-builder]
combines_with: [bullmq-job-queue, react-state-management, distributed-tracing]
license: MIT
source: jeffallan/claude-skills
source_license: MIT
---
## 何时使用

需要服务端与客户端之间**持续、低延迟、双向**通信时使用。典型场景：聊天/IM、协同编辑、实时通知、在线状态（presence）、多人房间广播、实时仪表盘。

**不该用的边界（先选更简单的方案）：**
- 仅服务器单向推送、客户端不需要回传 → 用 SSE（Server-Sent Events），实现与运维更简单。
- 更新频率低（秒级以上）或客户端不在线时段长 → 用普通轮询/长轮询。
- 纯请求-响应、无持久连接需求 → 用 HTTP/REST。
- 跨严格代理/防火墙、连接稳定性要求极高但消息量小 → 评估 SSE/长轮询的回退兼容性。

判断要点：是否真正需要「客户端也要主动发」+「低延迟」+「长连接」。三者缺一，多半不必上 WebSocket。

## 步骤

1. **分析需求** — 估算并发连接数、消息吞吐量、延迟要求，定下单实例连接上限。
2. **设计架构** — 规划集群、pub/sub、状态存储（presence/房间放外部存储）、故障转移。
3. **实现** — 搭建带鉴权（握手中间件）、房间、事件处理的服务端 + 带重连和消息缓冲的客户端。
4. **本地验证** — 用 `npx wscat -c ws://localhost:3000` 测试；确认缺失/非法 token 被拒、房间 join/leave 事件、消息送达。
5. **扩展** — 先验证 Redis 连接与 pub/sub 往返再启用 adapter；配置粘性会话（sticky sessions）并跨多实例验证；接入负载均衡。
6. **监控** — 跟踪连接数、延迟、吞吐、错误率；对连接数突增和错误率阈值加告警。

## 指令

**MUST DO**
- 负载均衡必须开启**粘性会话**：WebSocket 是有状态长连接，请求必须路由到同一实例。
- 实现心跳 ping/pong 检测死连接（仅靠 TCP keepalive 不够）。
- 用 rooms/namespaces 做消息分发，而非在应用逻辑里过滤。
- 断线窗口期**缓冲消息**，避免静默丢数据。
- 横向扩展前先确定单实例连接上限。

**MUST NOT**
- 不要把大状态只存内存而无集群策略 → 用 Redis 或外部存储。
- 不要在同一端口混跑 WebSocket 与 HTTP 而不显式处理 upgrade。
- 不要遗漏连接清理：presence 记录、房间成员、在途定时器。
- 不要跳过上线前压测——连接数突增的行为与 HTTP 流量突增不同。

## 示例

### 服务端（Socket.IO + 鉴权 + 房间 + Redis 横向扩展）

```js
import { createServer } from "http";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import jwt from "jsonwebtoken";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: process.env.ALLOWED_ORIGIN, credentials: true },
  pingTimeout: 20000,
  pingInterval: 25000,
});

// 鉴权中间件：在连接建立前运行
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Authentication required"));
  try {
    socket.data.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    next(new Error("Invalid token"));
  }
});

// Redis adapter 实现横向扩展
const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();
await Promise.all([pubClient.connect(), subClient.connect()]);
io.adapter(createAdapter(pubClient, subClient));

io.on("connection", (socket) => {
  const { userId } = socket.data.user;
  pubClient.hSet("presence", userId, socket.id); // presence：标记在线

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-joined", { userId });
  });

  socket.on("message", ({ roomId, text }) => {
    io.to(roomId).emit("message", { userId, text, ts: Date.now() });
  });

  socket.on("disconnect", () => {
    pubClient.hDel("presence", userId); // 清理 presence
  });
});

httpServer.listen(3000);
```

### 客户端（指数退避重连 + 断线消息缓冲）

```js
import { io } from "socket.io-client";

const socket = io("wss://api.example.com", {
  auth: { token: getAuthToken() },
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,       // 初始延迟 ms
  reconnectionDelayMax: 30000,   // 上限 30 s
  randomizationFactor: 0.5,      // 抖动，避免惊群
});

let messageQueue = []; // 断线时缓冲

socket.on("connect", () => {
  messageQueue.forEach((msg) => socket.emit("message", msg)); // 重连后冲刷
  messageQueue = [];
});

socket.on("disconnect", (reason) => {
  if (reason === "io server disconnect") socket.connect(); // 服务端主动断开需手动重连
});

socket.on("connect_error", (err) => console.error(err.message));

function sendMessage(roomId, text) {
  const msg = { roomId, text };
  if (socket.connected) socket.emit("message", msg);
  else messageQueue.push(msg); // 缓冲直到重连
}
```

### 交付清单（实现 WebSocket 功能时一并给出）
1. 服务端配置（Socket.IO/ws）；
2. 事件处理（connection、message、disconnect）；
3. 客户端库（连接、事件、重连）；
4. 扩展策略简述。

## 注意事项

- **粘性会话与 Redis adapter 是横向扩展的两件套**：adapter 负责跨实例广播，粘性会话保证单连接落在同一实例。少任一个都会出现消息丢失或重连失败。
- nginx 等反向代理需显式配置 WebSocket upgrade（`Upgrade`/`Connection` 头）。
- 关注**背压（backpressure）**：消费慢的客户端会让发送缓冲堆积，必要时丢弃或断开。
- presence 与房间成员属于易泄漏状态，disconnect 时务必清理（包括异常断开）。
- 关键知识点参考：Socket.IO、ws、uWebSockets.js、Redis adapter、JWT over WebSocket、acknowledgments、二进制数据、压缩、心跳、HPA 自动扩缩容。

## 互见

- FastAPI / NestJS 服务端集成
- DevOps / 监控工程（连接数告警、HPA）
- 安全审查（WebSocket 鉴权、限流、CORS）
- 备选方案对比：SSE、长轮询（何时不该用 WebSocket）

---
*采编自 jeffallan/claude-skills（MIT）。*
