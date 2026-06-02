---
name: grpc-golang-services
title: Go gRPC 服务构建
description: 当用 Go 设计/实现生产级 gRPC 微服务（Protobuf 契约、流式、mTLS、可观测）时使用；产出基于 Buf 的契约定义、版本化 proto、mTLS 与拦截器接入方案及生成代码；不适用于纯 REST/HTTP 公网 API、gRPC-Web/浏览器集成、服务网格（Istio/Linkerd）流量路由与 L7 负载均衡配置。触发词：gRPC、Protobuf、Buf、mTLS、Go 微服务、proto 契约
domain: 研发/backend
triggers: [gRPC, Protobuf, Buf, mTLS, proto 契约, Go 微服务, buf lint, gRPC 流式, OpenTelemetry 拦截器, grpc.NewClient]
tags: [golang, grpc, protobuf, buf, mtls, microservices, observability, streaming, api-design]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [buf, protoc, go, grpc-go, opentelemetry]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 用 gRPC 设计 Go 微服务间通信，构建基于 Protobuf 的高性能内部 API。
- 实现流式负载（单向 server/client streaming 或双向 bidi streaming）。
- 用 Protobuf + Buf 标准化 API 契约与 lint/兼容性校验。
- 为服务间认证配置 mTLS。

不该用（负边界）：
- 构建纯 REST/HTTP 公网 API，无 gRPC 需求时。
- 改动遗留 `.proto` 却无法引入新 API 版本（如 `api.v2`）或保证向后兼容时——应先做版本化设计。
- 服务网格（Istio/Linkerd）流量路由、L7 gRPC 感知负载均衡（Envoy/NGINX）、gRPC-Web/浏览器集成、Protobuf schema registry 等应用代码之外的治理——本技能不覆盖。

环境假设：Go 1.21+、gRPC-Go v1.60+（旧版本 API 有差异，如 `grpc.Dial` 与 `grpc.NewClient`）。

## 步骤

1. 确认技术上下文：Go 版本、gRPC-Go 版本，项目用 Buf 还是裸 protoc。
2. 确认需求：mTLS 需求、负载形态（unary/streaming）、SLO、消息体大小上限。
3. 规划 schema：包版本（如 `api.v1`）、资源类型、错误码映射。
4. 安全设计：为服务间认证落地 mTLS，双方都把 CA 证书加入 `x509.CertPool`。
5. 可观测性：通过拦截器（interceptor）接入 tracing、metrics 与结构化日志（OpenTelemetry）。
6. 验证：定稿生成代码前，必须运行 `buf lint` 与破坏性变更检查。

## 指令

```bash
# 用 Buf 标准化工具链：定义 buf.yaml / buf.gen.yaml
buf lint                 # 契约风格与规则检查
buf breaking --against '.git#branch=main'   # 破坏性变更检查
buf generate             # 生成 Go 代码（核对 go_package 选项）
```

## 示例

定义服务与消息（v1 API），注意包版本与 `go_package`：

```proto
syntax = "proto3";
package api.v1;
option go_package = "github.com/org/repo/gen/api/v1;apiv1";

service UserService {
  rpc GetUser(GetUserRequest) returns (GetUserResponse);
}

message User {
  string id = 1;
  string name = 2;
}

message GetUserRequest {
  string id = 1;
}

message GetUserResponse {
  User user = 1;
}
```

## 注意事项

最佳实践（Do）：
- 用 Buf（`buf.yaml` + `buf.gen.yaml`）统一工具链与 lint。
- 包路径始终语义化版本（如 `package api.v1`）。
- 所有内部服务间通信强制 mTLS。
- 所有流式 handler 都处理 `ctx.Done()`，防止资源泄漏。
- 把领域错误映射为标准 gRPC 状态码（如 `codes.NotFound`）。

反模式（Don't）：
- 不要把原始内部错误字符串或堆栈直接返回给 gRPC 客户端。
- 不要每个请求新建 `grpc.ClientConn`，连接必须复用。

排错：
- 生成代码不一致：重跑 `buf generate`，核对 `go_package`。
- Context Deadline：检查客户端超时，确认 server 在流式 handler 中没有无限阻塞。
- mTLS 握手失败：确认 CA 证书已正确加入客户端与服务端两侧的 `x509.CertPool`。

## 互见

- `golang-pro`：gRPC 层之外的通用 Go 模式与性能优化。
- `go-concurrency-patterns`：流式 handler 的 goroutine 生命周期管理。
- `api-design-principles`：写 `.proto` 前的资源命名与版本化策略。
- `docker-expert`：容器化 gRPC 服务，经 Docker secrets 注入 TLS 证书。
- 参考：Google API Design Guide、Buf Docs、gRPC-Go Docs、OpenTelemetry Go Instrumentation。

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
