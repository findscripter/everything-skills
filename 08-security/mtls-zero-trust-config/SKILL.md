---
name: mtls-zero-trust-config
title: mTLS 零信任配置
description: 当为服务网格落地零信任、双向认证的服务间通信，或排查 TLS 握手与证书轮换问题时使用；做 Istio/Linkerd mTLS 策略、cert-manager/SPIFFE 证书签发与轮换、PeerAuthentication/DestinationRule 配置并验证产出；不适用于面向公网用户的单向 TLS、应用层鉴权或与 mTLS 无关的网络任务。触发词：mTLS、零信任、PeerAuthentication、证书轮换、SPIFFE、Istio、Linkerd
domain: 安全/ops
triggers: [mTLS, 双向 TLS, 零信任, zero-trust, PeerAuthentication, DestinationRule, 证书轮换, cert-manager, SPIFFE, SPIRE, Istio, Linkerd, TLS 握手, 服务网格 mTLS, STRICT 模式]
tags: [mtls, 零信任, 服务网格, istio, linkerd, 证书管理, spiffe, 安全, ops]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [istioctl, kubectl, linkerd, openssl, cert-manager]
requires: []
related: [service-mesh-architect, istio-traffic-management, k8s-security-policies, secrets-management]
combines_with: [kubernetes-architect, container-security-hardening]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

为服务网格实施零信任、服务间双向认证（mTLS）的场景：

- 落地零信任网络，强制服务间通信全程加密 + 双向身份校验
- 保护内部服务到服务（east-west）通信
- 设计证书签发、轮换与 CA 层级管理
- 排查 TLS 握手失败、证书过期、mTLS 未生效
- 满足合规要求（PCI-DSS、HIPAA、NIST 零信任架构）
- 多集群 / 跨集群安全通信

不该用的边界：

- 面向公网终端用户的单向 TLS（普通 HTTPS 入口、证书仅服务端）——那是 ingress/网关职责，不需要客户端证书
- 应用层鉴权 / 授权（JWT、OAuth、RBAC 业务逻辑）——mTLS 只解决传输层身份，不替代应用授权
- 与 mTLS / 服务网格无关的网络任务
- 不能替代针对具体环境的验证、测试与专家评审；缺少集群版本、网格类型、信任域、租户模型等必要输入时应先澄清

## 步骤

1. **明确目标与约束**：网格类型（Istio / Linkerd / 自管 SPIFFE）、集群版本、是否多集群、信任域（trust domain）、合规要求。
2. **理清 mTLS 流与证书层级**：双向握手中两端代理（sidecar）互验证书；CA 层级为 Root CA（自签、长寿命）→ 中间 CA（集群级 / 多集群级）→ 工作负载证书（短寿命）。
3. **渐进式开启**：先 `PERMISSIVE`（同时接受明文与 mTLS）让存量服务迁移，再整体切 `STRICT`。先 mesh 级默认，再按命名空间 / 工作负载 / 端口覆盖。
4. **配证书签发与轮换**：Istio 自带 SDS 自动轮换；接 cert-manager 时用 `ClusterIssuer` + `Certificate`（短 `duration`，`renewBefore` 提前续期）；强隔离需求用 SPIFFE/SPIRE 签发 X.509 SVID。
5. **处理外部 / 例外流量**：用 `DestinationRule` 对外部服务设 `SIMPLE`/`MUTUAL`；指标端口等设 `DISABLE`/`portLevelMtls`；Linkerd 用注解跳过特定端口。
6. **验证**：检查 mTLS 是否生效、证书有效期、握手日志，确认全链路验证通过。

## 指令

- 澄清目标、约束与必需输入（网格类型、信任域、租户模型、合规口径）。
- 套用对应模板并按命名空间/工作负载/端口分层下发策略。
- 给出可执行步骤与验证方法；产出后逐项核对证书有效期与 mTLS 状态。
- 需要更详细示例时，查阅源仓库的 `resources/implementation-playbook.md`。

## 示例

### Istio：STRICT 模式（mesh 级 + 命名空间覆盖 + 工作负载/端口级）

```yaml
# mesh 全局强制 mTLS
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: istio-system
spec:
  mtls:
    mode: STRICT
---
# 存量命名空间迁移期降级为 PERMISSIVE
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: legacy-namespace
spec:
  mtls:
    mode: PERMISSIVE
---
# 工作负载 + 端口级：业务端口 STRICT，指标端口关闭
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: payment-service
  namespace: production
spec:
  selector:
    matchLabels:
      app: payment-service
  mtls:
    mode: STRICT
  portLevelMtls:
    8080:
      mode: STRICT
    9090:
      mode: DISABLE  # Metrics port, no mTLS
```

### Istio DestinationRule：网格内自动 mTLS + 对外部双向 TLS

```yaml
# 网格内全部走 Istio 托管 mTLS
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: default
  namespace: istio-system
spec:
  host: "*.local"
  trafficPolicy:
    tls:
      mode: ISTIO_MUTUAL
---
# 对合作方 API 用双向 TLS（自带客户端证书）
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: partner-api
spec:
  host: api.partner.com
  trafficPolicy:
    tls:
      mode: MUTUAL
      clientCertificate: /etc/certs/client.pem
      privateKey: /etc/certs/client-key.pem
      caCertificates: /etc/certs/partner-ca.pem
```

对外部 API 仅验证服务端用 `mode: SIMPLE` + `caCertificates`。

### cert-manager 签发工作负载短寿命证书

```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: istio-ca
spec:
  ca:
    secretName: istio-ca-secret
---
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: my-service-cert
  namespace: my-namespace
spec:
  secretName: my-service-tls
  duration: 24h        # 短寿命
  renewBefore: 8h      # 提前 8h 续期
  issuerRef:
    name: istio-ca
    kind: ClusterIssuer
  commonName: my-service.my-namespace.svc.cluster.local
  dnsNames:
    - my-service
    - my-service.my-namespace
    - my-service.my-namespace.svc
    - my-service.my-namespace.svc.cluster.local
  usages:
    - server auth
    - client auth   # 双向需同时具备 server/client auth
```

`istio-ca-secret` 为 `type: kubernetes.io/tls`，`data` 含 base64 的 `tls.crt` / `tls.key`。

### SPIFFE/SPIRE（强隔离 / 跨集群信任域）

SPIRE Server 关键配置：`trust_domain`、`ca_ttl = "168h"`、`default_x509_svid_ttl = "1h"`，NodeAttestor 用 `k8s_psat` 绑定集群与 ServiceAccount 白名单；SPIRE Agent 以 DaemonSet 下发，通过 hostPath `/run/spire/sockets` 暴露工作负载 API socket。

### Linkerd：默认自动 mTLS

Linkerd 网格内默认开启 mTLS，无需声明。例外处理：

```yaml
# 跳过特定出站端口（如 MySQL 3306）
apiVersion: v1
kind: Service
metadata:
  name: my-service
  annotations:
    config.linkerd.io/skip-outbound-ports: "3306"
```

### 证书轮换与排障命令

```bash
# Istio：查看证书有效期
istioctl proxy-config secret deploy/my-app -o json | \
  jq '.dynamicActiveSecrets[0].secret.tlsCertificate.certificateChain.inlineBytes' | \
  tr -d '"' | base64 -d | openssl x509 -text -noout

# 强制轮换证书
kubectl rollout restart deployment/my-app

# Istio：检查 mTLS 是否生效
istioctl authn tls-check my-service.my-namespace.svc.cluster.local
kubectl get peerauthentication --all-namespaces
kubectl get destinationrule --all-namespaces

# 调试 TLS 握手
istioctl proxy-config log deploy/my-app --level debug
kubectl logs deploy/my-app -c istio-proxy | grep -i tls

# Linkerd：检查 mTLS 与身份
linkerd viz edges deployment -n my-namespace
linkerd identity -n my-namespace
linkerd viz tap deploy/my-app --to deploy/my-backend
```

## 注意事项

应做（Do）：

- **从 PERMISSIVE 起步**，逐步迁移到 STRICT，避免一刀切打断存量流量
- **监控证书有效期**，配置过期告警
- **用短寿命证书**（工作负载 24h 或更短）
- **周期性轮换 CA**，提前规划 CA 轮换演练
- **记录 TLS 错误日志**，供排障与审计

不应做（Don't）：

- 不要为图省事在生产**关闭 mTLS**
- 不要忽视证书过期——必须自动化轮换
- 不要直接用自签证书裸跑——建立规范的 CA 层级
- 不要跳过校验——验证完整证书链

关键约束：本技能产出不能替代针对具体环境的验证、测试或专家评审；不同网格、Kubernetes 版本与 CNI 对策略支持存在差异。证书 SAN/dnsNames 必须覆盖服务的全部 FQDN，否则握手校验失败。缺少信任域、CA 物料或网格选型等必要输入时，应停下来澄清再动手。

## 互见

- requires：`service-mesh-architect` —— 需先具备服务网格选型与 sidecar 注入的整体设计
- related：`istio-traffic-management`、`auth-implementation-patterns`、`cloud-misconfig-auditor`
- combines_with：`k8s-security-policies` —— mTLS（传输层身份）+ NetworkPolicy/RBAC/准入控制构成 K8s 纵深防御
- combines_with：`secrets-management` —— 管理 CA 私钥与证书 Secret 的安全存储
- combines_with：`container-security-hardening` —— 容器加固与零信任通信合并收口工作负载攻击面

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
