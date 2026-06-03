---
name: service-mesh-architect
title: 服务网格架构（Istio/Linkerd）
description: 当在 Kubernetes 上设计/落地服务网格（拓扑、零信任 mTLS、跨集群联邦、渐进式交付）时使用；产出网格选型、流量与安全策略、可观测性接入及运维手册；不适用于单纯写某条 Istio YAML（用 istio-traffic-management）或非网格的应用层业务问题；触发词：service mesh、istio、linkerd、mTLS、零信任、多集群
domain: 研发/devops
triggers: [设计服务网格架构, 选型 Istio 还是 Linkerd, 配置零信任 mTLS 网络, 搭建跨集群网格联邦, 金丝雀/蓝绿渐进式交付, 排查服务网格连通性, 服务网格可观测性接入]
tags: [服务网格, service-mesh, istio, linkerd, 云原生, 零信任, mtls, kubernetes, 可观测性]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Bash, Write]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
# 服务网格架构（Istio/Linkerd）

## 何时使用

当需要在 Kubernetes 上**端到端规划与落地服务网格**时使用——重点是架构层面的决策与编排，而不是写某一条配置。典型场景：

- 微服务间通信的整体方案设计：网格选型（Istio vs Linkerd）、Sidecar/Ambient 模式、注入范围。
- 零信任网络：以 mTLS 为基础的服务身份与授权（PeerAuthentication / AuthorizationPolicy）。
- 多集群 / 多云网格联邦与跨集群服务发现。
- 渐进式交付（金丝雀、蓝绿、流量切分）的网格侧编排。
- 接入可观测性（指标、分布式追踪、日志）并沉淀运维手册（runbook）。
- 排查网格连通性、mTLS 握手、Sidecar 注入等问题。

**不该用的边界：**

- 任务与服务网格无关，或属于其他领域/工具范畴。
- 只是要写**某一条** Istio 资源（VirtualService / DestinationRule / Gateway）——改用更聚焦的 `istio-traffic-management`。
- 问题在应用层业务逻辑、而非网络/网格层。
- 缺少必需输入（集群访问、网格版本、流量/合规需求、成功标准）时，先停下来澄清，不要臆造。

## 步骤

1. **评估现状与需求**：盘点集群拓扑、服务清单、现有 Ingress/网络、合规与延迟预算；明确目标（零信任？多集群？灰度？）。
2. **设计网格拓扑与流量策略**：定网格产品与部署模式、命名空间隔离边界、入口/出口网关、DestinationRule 负载均衡策略。
3. **落地安全策略**：先 `PERMISSIVE` 模式灰度，再逐步收紧到 `STRICT` mTLS；按命名空间编写 AuthorizationPolicy 做最小授权。
4. **接入可观测性**：指标（Prometheus）、分布式追踪、访问日志三者齐备，建立网格开销（延迟、资源）基线。
5. **配置流量管理**：路由、超时、重试、熔断（在需要前就配好），按需做流量切分支撑金丝雀。
6. **测试故障转移与韧性**：注入故障、断网演练，验证熔断/重试/降级行为。
7. **沉淀运维手册**：把回滚、扩缩、证书轮换、常见故障排查写成 runbook。

## 指令

- 先澄清目标、约束与必需输入，再动手；产出给出可执行步骤与验证命令。
- **渐进收紧安全**：mTLS 从 permissive 起步，确认全链路再切 strict，避免一刀切打断存量流量。
- **以命名空间做策略隔离**单元，授权遵循最小权限。
- **熔断器要前置**：在故障发生前就配置好，而非事后补救。
- **持续监控网格开销**：Sidecar 的延迟与资源占用要纳入基线，Sidecar 资源请求/限制要按实际调优。
- **用 DestinationRule 统一负载均衡策略**，保证一致性。
- 多集群联邦先打通信任域与根 CA，再做跨集群服务发现。
- 输出的 YAML 必须可被 `istioctl analyze` / `linkerd check` 验证通过。

## 示例

**严格 mTLS（命名空间级，先 permissive 后 strict）：**

```yaml
apiVersion: security.istio.io/v1
kind: PeerAuthentication
metadata:
  name: default
  namespace: payments
spec:
  mtls:
    mode: STRICT   # 灰度期先用 PERMISSIVE
```

**最小授权（只允许 frontend 调用 payments）：**

```yaml
apiVersion: security.istio.io/v1
kind: AuthorizationPolicy
metadata:
  name: payments-allow-frontend
  namespace: payments
spec:
  selector:
    matchLabels: { app: payments }
  action: ALLOW
  rules:
    - from:
        - source:
            principals: ["cluster.local/ns/web/sa/frontend"]
```

**验证命令：**

```bash
istioctl analyze -n payments          # Istio：静态校验配置
istioctl proxy-config secret <pod>    # 确认 mTLS 证书已下发
linkerd check                          # Linkerd：健康与配置自检
linkerd viz stat deploy -n payments    # 网格侧实时指标
```

> 提示：流量切分做金丝雀时，先用 DestinationRule 定义 subset，再由 VirtualService 按权重切流；具体 YAML 编写下钻到 `istio-traffic-management`。

## 注意事项

- 仅在任务明确落入上述范围时使用本技能；产出不能替代环境相关的验证、测试或专家评审。
- 若缺少必需输入、权限、安全边界或成功标准，停下来询问澄清。
- Sidecar 注入会引入额外延迟与资源开销，性能敏感链路需评估 Ambient 模式或排除注入。
- mTLS 切 `STRICT` 前务必确认网格外调用方（如旧服务、探针、外部 LB）已纳管或显式放行，否则会断流。
- 多集群联邦的信任域、证书与网络连通是前置硬条件，配置复杂、回滚成本高，务必先在非生产环境演练。

## 互见

- related：`istio-traffic-management` —— 网格内具体流量/安全 YAML 的聚焦写法（本技能管架构，它管单条配置）。
- related：`kubernetes-architect` —— 网格所在的 K8s 平台与集群架构。
- related：`microservices-patterns` —— 网格承载的微服务通信与拆分模式。
- related：`distributed-tracing` —— 网格可观测性中的链路追踪落地。
- related：`k8s-security-policies` —— 与网格授权互补的集群安全策略。
- combines_with：`gitops-argocd-flux` —— 用 GitOps 编排渐进式交付与网格配置发布。
- combines_with：`observability-strategy-designer` —— 设计网格的指标/日志/追踪整体策略。
- combines_with：`helm-chart-scaffolding` —— 以 Helm 打包网格组件与策略清单。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
