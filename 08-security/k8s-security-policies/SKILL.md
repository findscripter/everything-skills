---
name: k8s-security-policies
title: Kubernetes 安全策略
description: 当为 Kubernetes 集群做纵深防御加固时使用；用 Pod 安全标准、NetworkPolicy、RBAC、准入控制（OPA Gatekeeper/Istio mTLS）落地最小权限与网络分段配置并验证；不适用于应用部署、性能调优或非安全类清单生成。触发词：NetworkPolicy、RBAC、Pod 安全标准、准入控制、多租户隔离
domain: 安全/ops
triggers: [NetworkPolicy, RBAC, Pod 安全标准, PodSecurity, OPA Gatekeeper, 准入控制, 网络分段, 最小权限, 多租户隔离, securityContext, mTLS, CIS Benchmark]
tags: [kubernetes, 安全, 网络策略, RBAC, 准入控制, 合规, 纵深防御]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [kubectl]
requires: []
related: [container-security-hardening, cloud-misconfig-auditor, kubernetes-architect, service-mesh-architect]
combines_with: [container-security-hardening, cloud-misconfig-auditor, istio-traffic-management]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用于为 Kubernetes 集群构建纵深防御（defense-in-depth）安全策略的场景：

- 实施网络分段、默认拒绝流量
- 在命名空间级别配置 Pod 安全标准
- 配置最小权限（least-privilege）的 RBAC
- 为合规要求（CIS、NIST）创建安全策略
- 引入准入控制（OPA Gatekeeper / Kyverno）
- 加固多租户集群隔离

不该用的边界：

- 任务与 K8s 安全策略无关（如纯应用部署、性能调优、日志聚合）
- 需要其他领域或本范围外的工具
- 不能替代针对具体环境的验证、测试与专家评审；缺少必要输入、权限、安全边界或成功标准时应先澄清

## 步骤

1. 明确目标、约束与所需输入（集群版本、CNI 是否支持 NetworkPolicy、租户模型）。
2. 命名空间打标，启用 Pod 安全标准（建议生产用 `restricted`）。
3. 下发默认拒绝（default-deny）NetworkPolicy，再按需放行最小连通（含 DNS）。
4. 按最小权限设计 RBAC：优先命名空间级 Role，谨慎使用 ClusterRole。
5. 为工作负载配置 securityContext（非 root、只读根文件系统、丢弃所有 capabilities）。
6. 部署准入控制策略（OPA Gatekeeper ConstraintTemplate + Constraint）强制约束。
7. 验证结果：`kubectl auth can-i`、`kubectl describe networkpolicy`。

## 指令

- 澄清目标、约束与必需输入。
- 套用对应最佳实践并验证结果。
- 给出可执行步骤与验证方法。
- 需要更详细示例时，查阅源仓库的 `resources/implementation-playbook.md`、`references/rbac-patterns.md`、`assets/*.yaml`。

## 示例

### Pod 安全标准（命名空间级，三档）

`privileged`（不受限）/ `baseline`（最小限制）/ `restricted`（最严格），通过标签启用 enforce/audit/warn：

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: restricted-ns
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

### NetworkPolicy

默认拒绝全部（Ingress + Egress）：

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: production
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
```

放行 frontend 访问 backend 的 8080：

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-frontend-to-backend
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    ports:
    - protocol: TCP
      port: 8080
```

放行 DNS（egress 到 kube-system 的 UDP 53），避免默认拒绝后解析失败：

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-dns
  namespace: production
spec:
  podSelector: {}
  policyTypes:
  - Egress
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          name: kube-system
    ports:
    - protocol: UDP
      port: 53
```

### RBAC（Role / ClusterRole / RoleBinding）

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-reader
  namespace: production
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "watch", "list"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods
  namespace: production
subjects:
- kind: User
  name: jane
  apiGroup: rbac.authorization.k8s.io
- kind: ServiceAccount
  name: default
  namespace: production
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
```

集群级读 secret 用 `ClusterRole`（apiGroups `[""]`、resources `["secrets"]`、verbs `get/watch/list`），需谨慎授予。

### 受限 Pod 的 securityContext

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secure-pod
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    fsGroup: 1000
    seccompProfile:
      type: RuntimeDefault
  containers:
  - name: app
    image: myapp:1.0
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop:
        - ALL
```

### 准入控制（OPA Gatekeeper）

ConstraintTemplate 用 Rego 实现"必填标签"校验：

```yaml
apiVersion: templates.gatekeeper.sh/v1
kind: ConstraintTemplate
metadata:
  name: k8srequiredlabels
spec:
  crd:
    spec:
      names:
        kind: K8sRequiredLabels
      validation:
        openAPIV3Schema:
          type: object
          properties:
            labels:
              type: array
              items:
                type: string
  targets:
    - target: admission.k8s.gatekeeper.sh
      rego: |
        package k8srequiredlabels
        violation[{"msg": msg, "details": {"missing_labels": missing}}] {
          provided := {label | input.review.object.metadata.labels[label]}
          required := {label | label := input.parameters.labels[_]}
          missing := required - provided
          count(missing) > 0
          msg := sprintf("missing required labels: %v", [missing])
        }
```

对应 Constraint：对 `apps/Deployment` 强制要求 `["app", "environment"]` 标签（`kind: K8sRequiredLabels`，spec.match.kinds + spec.parameters.labels）。

### 服务网格（Istio）

- `PeerAuthentication` 开启全局 mTLS：`spec.mtls.mode: STRICT`。
- `AuthorizationPolicy` 按 principal 授权：`action: ALLOW`，`rules.from.source.principals: ["cluster.local/ns/production/sa/frontend"]`。

## 注意事项

最佳实践（按优先级）：

1. 命名空间级启用 Pod 安全标准
2. 用 NetworkPolicy 做网络分段
3. 所有 ServiceAccount 套用最小权限 RBAC
4. 启用准入控制（OPA Gatekeeper / Kyverno）
5. 容器以非 root 运行
6. 使用只读根文件系统
7. 默认丢弃全部 capabilities，按需添加
8. 配置 ResourceQuota 与 LimitRange
9. 为安全事件启用审计日志
10. 定期扫描镜像

合规对齐：

- CIS Kubernetes Benchmark：启用 RBAC、审计日志、Pod 安全标准、网络策略、静态 secret 加密、节点认证。
- NIST CSF：纵深防御、网络分段、安全监控、访问控制、日志与监控。

排障：

- NetworkPolicy 不生效：先确认 CNI 支持（`kubectl get nodes -o wide`），再 `kubectl describe networkpolicy <name>`。
- RBAC 拒绝访问：`kubectl auth can-i list pods --as system:serviceaccount:default:my-sa`；排查越权用 `kubectl auth can-i '*' '*' --as system:serviceaccount:default:my-sa`。

关键约束：本技能产出不能替代针对具体环境的验证、测试或专家评审；不同 CNI、K8s 版本对策略支持存在差异。

## 互见

- `k8s-manifest-generator`：生成安全的清单
- `gitops-workflow`：自动化策略部署

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
