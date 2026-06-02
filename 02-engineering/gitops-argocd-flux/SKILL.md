---
name: gitops-argocd-flux
title: GitOps 自动化部署
description: 当用 ArgoCD 或 Flux 把 Git 仓库作为 Kubernetes 集群唯一可信源、需要声明式持续交付时使用；产出仓库布局、Application/Kustomization 清单、同步策略与渐进发布配置；不适用于一次性手动部署、非 K8s 目标或无集群/仓库权限的场景。触发词：GitOps、ArgoCD、Flux
domain: 研发/devops
triggers: [GitOps, ArgoCD, Flux, Argo Rollouts, 持续交付到 Kubernetes, App of Apps, 声明式部署, 集群自动同步, 金丝雀/蓝绿发布, Sealed Secrets/External Secrets]
tags: [GitOps, Kubernetes, ArgoCD, FluxCD, CD, 渐进发布, 密钥管理, 研发]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [kubectl, argocd, flux, kubeseal]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：

- 为 Kubernetes 集群搭建 GitOps，把 Git 作为期望状态的唯一可信源。
- 从 Git 自动化部署应用、配置自动同步（auto-sync）与环境晋升流程。
- 实施渐进发布（金丝雀 / 蓝绿），管理多集群部署。
- 在 GitOps 下做密钥管理（Sealed Secrets / External Secrets）。

不该用（负边界）：

- 只需一次性手动部署，不打算长期维护期望状态。
- 部署目标不是 Kubernetes。
- 无法获得集群访问或仓库写权限。

遵循 OpenGitOps 四原则：声明式（Declarative）、版本化且不可变（Versioned & Immutable，状态存于 Git）、自动拉取（Pulled Automatically，由 Agent 拉取期望状态）、持续协调（Continuously Reconciled，对齐实际与期望状态）。

## 步骤

1. 定义仓库布局与期望状态约定（按环境分目录或分仓库/分支）。
2. 安装 ArgoCD 或 Flux 并接入集群。
3. 配置同步策略、环境与晋升流程（生产加审批门禁）。
4. 验证回滚与密钥处理，确认告警与健康检查到位。

推荐仓库布局：

```
gitops-repo/
├── apps/
│   ├── production/{app1,app2}/   # kustomization.yaml + deployment.yaml
│   └── staging/
├── infrastructure/{ingress-nginx,cert-manager,monitoring}/
└── argocd/{applications,projects}/
```

## 指令

ArgoCD 安装与取初始密码：

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

Flux 安装与 bootstrap：

```bash
brew install fluxcd/tap/flux
# 或下载官方安装脚本，先审阅再执行（不要直接管道到 bash）
tmpdir="$(mktemp -d)"; trap 'rm -rf "$tmpdir"' EXIT
curl -fsSLo "$tmpdir/flux-install.sh" https://fluxcd.io/install.sh
sed -n '1,160p' "$tmpdir/flux-install.sh"
sudo bash "$tmpdir/flux-install.sh"

flux bootstrap github \
  --owner=org --repository=gitops-repo \
  --branch=main --path=clusters/production --personal
```

排障：

```bash
argocd app get my-app          # 查看应用状态
argocd app diff my-app         # 查看与 Git 的差异（OutOfSync）
argocd app sync my-app --prune # 同步并清理 Git 中已删除的资源
argocd app sync my-app --force # 强制同步
```

## 示例

ArgoCD Application（含自动同步策略）：

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-app
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/org/gitops-repo
    targetRevision: main
    path: apps/production/my-app
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true      # 删除 Git 中已移除的资源
      selfHeal: true   # 自动纠正手工漂移
      allowEmpty: false
    syncOptions:
    - CreateNamespace=true
    retry:
      limit: 5
      backoff: {duration: 5s, factor: 2, maxDuration: 3m}
```

App of Apps 模式：用一个父 Application 指向 `argocd/applications` 目录，统一纳管所有子应用，`syncPolicy.automated: {}` 即可。

Flux GitRepository + Kustomization：

```yaml
apiVersion: source.toolkit.fluxcd.io/v1
kind: GitRepository
metadata: {name: my-app, namespace: flux-system}
spec:
  interval: 1m
  url: https://github.com/org/my-app
  ref: {branch: main}
---
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata: {name: my-app, namespace: flux-system}
spec:
  interval: 5m
  path: ./deploy
  prune: true
  wait: true
  timeout: 5m
  sourceRef: {kind: GitRepository, name: my-app}
```

渐进发布（Argo Rollouts，金丝雀）：

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata: {name: my-app}
spec:
  replicas: 5
  strategy:
    canary:
      steps:
      - setWeight: 20
      - pause: {duration: 1m}
      - setWeight: 50
      - pause: {duration: 2m}
      - setWeight: 100
```

蓝绿则用 `strategy.blueGreen`，设 `autoPromotionEnabled: false` 由人工晋升。

密钥管理（二选一）：

```yaml
# External Secrets Operator：从外部密钥库拉取，不入库
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata: {name: db-credentials}
spec:
  refreshInterval: 1h
  secretStoreRef: {name: aws-secrets-manager, kind: SecretStore}
  target: {name: db-credentials}
  data:
  - secretKey: password
    remoteRef: {key: prod/db/password}
```

```bash
# Sealed Secrets：加密后再提交，可安全入库
kubeseal --format yaml < secret.yaml > sealed-secret.yaml
```

## 注意事项

- 风险等级高：生产环境严禁未经审批的 auto-sync，务必设审批门禁，并先在 staging 验证。
- 密钥绝不明文入库，统一用 Sealed Secrets 或 External Secrets。
- 按环境分仓库或分支隔离；对 Git 仓库实施 RBAC。
- 为自定义资源配置健康检查；为同步失败启用通知/告警；按 Tag 发布以便快速回滚。
- 本技能不替代环境特定的验证、测试与专家评审；若所需输入、权限、安全边界或成功标准缺失，应先暂停并澄清。

## 互见

- k8s-manifest-generator：生成 Kubernetes 清单。
- helm-chart-scaffolding：打包应用为 Helm Chart。

---

采编自 sickn33/antigravity-awesome-skills（MIT），适配重写。
