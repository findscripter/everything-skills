---
name: kubernetes-deployment-workflow
title: Kubernetes 部署工作流
description: 当需要把应用端到端部署到 Kubernetes 生产环境、串联容器化→清单→Helm→服务网格→安全→可观测→GitOps 交付时使用；产出分阶段的部署编排方案与质量门禁清单；不适用于单条 K8s 清单微调、纯本地容器调试或非 K8s 部署；触发词：Kubernetes 部署、K8s 上线、Helm 发布、服务网格、GitOps、生产就绪
domain: 研发/devops
triggers: [把应用部署到 Kubernetes, K8s 生产上线编排, Helm Chart 发布流程, 服务网格 mTLS 与流量治理, K8s 安全加固（RBAC/NetworkPolicy）, GitOps 持续部署, 生产就绪 K8s 配置, 容器化到上线的完整链路]
tags: [kubernetes, 部署工作流, helm, 服务网格, gitops, 可观测性, devops, 生产就绪]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [kubectl, Helm, Docker/BuildKit, Istio, Linkerd, ArgoCD, Flux, Prometheus, Grafana]
requires: []
related: [kubernetes-architect, helm-chart-scaffolding, deployment-engineer, gitops-argocd-flux]
combines_with: [ci-cd-pipeline-builder, k8s-security-policies, service-mesh-architect]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
# Kubernetes 部署工作流

## 何时使用

适用：
- 把应用从容器化到上线**端到端**部署到 Kubernetes，需要编排多个环节而非单点操作
- 搭建生产就绪的 K8s 配置：Helm Chart、服务网格、安全策略、监控告警、GitOps
- 跨阶段串联 Docker、清单、Helm、Istio/Linkerd、RBAC、Prometheus 等专项能力

不该用（负边界）：
- 仅微调一条 Deployment/Service 清单或排查单个 Pod —— 直接用对应专项技能
- 纯本地容器构建与调试，不涉及集群部署
- 目标不是 Kubernetes（如裸机、Serverless、纯 PaaS）

## 步骤

本工作流是**编排层**：按阶段调度专项技能，每阶段产出可被下一阶段消费的工件，并卡质量门禁。

1. **容器准备**：写 Dockerfile → 构建镜像 → 优化体积 → 推送镜像仓库 → 验证可启动。专项：`docker-expert`。
2. **K8s 清单**：Deployment → Service → ConfigMap → Secret → Ingress。专项：`kubernetes-architect`。
3. **Helm Chart**：建 chart 结构 → 定义 `values.yaml` → 写模板 → 配依赖 → `helm lint`/`--dry-run` 测试。专项：`helm-chart-scaffolding`。
4. **服务网格**（按需）：选型（Istio/Linkerd）→ 安装 → 流量治理 → 开启 mTLS → 接入观测。专项：`istio-traffic-management`、`service-mesh-architect`。
5. **安全加固**：配 RBAC → NetworkPolicy → Pod Security → Secret 管理 → mTLS。专项：参考下方安全约束。
6. **可观测性**：装监控栈 → 配 Prometheus → 建 Grafana 仪表盘 → 设告警 → 接分布式追踪。专项：`prometheus-configuration`、`grafana-dashboards`。
7. **交付上线**：配 CI/CD → 落 GitOps → 部署到集群 → 验证 → 观察滚动发布。专项：`gitops-argocd-flux`、`deployment-engineer`。

## 指令

- **一次构建，处处部署**：镜像只构建一次，环境差异用 Helm values / Kustomize overlays / 外部 Secret 注入，不为每环境重打包。
- **不可变 + 声明式**：禁止登录生产手改；所有变更走 Git，由 GitOps 控制器（ArgoCD / Flux v2）同步集群状态。
- **逐阶段卡门禁**：上一阶段未通过验证不进入下一阶段（见质量门禁清单）。
- **服务网格是可选项**：体量小或无多服务流量治理需求时跳过第 4 阶段，避免过度复杂化。
- **跟踪 DORA 指标**：部署频率、变更前置时间、变更失败率、MTTR。

## 安全约束（务必遵守）

- RBAC 最小权限；用 NetworkPolicy 做默认拒绝的网络隔离；启用 Pod Security（restricted）。
- 秘密不明文落库：用 External Secrets Operator / Sealed Secrets / Vault；服务间通信启用 mTLS。
- 生产发布必须有审批与回滚预案；上线前校验目标环境与权限，避免误投。

## 示例

```text
# 调度专项技能的提示词（逐阶段）
用 @docker-expert 把应用容器化以适配 K8s
用 @kubernetes-architect 生成 Deployment/Service/Ingress 清单
用 @helm-chart-scaffolding 把上述清单封装为 Helm Chart
用 @istio-traffic-management 配置 Istio 流量治理与 mTLS
用 @prometheus-configuration + @grafana-dashboards 搭建监控
用 @gitops-argocd-flux 落地 GitOps 持续部署
```

```bash
# 上线前的最小验证闭环
helm lint ./chart
helm install myapp ./chart --dry-run --debug
kubectl apply --dry-run=server -f manifests/
kubectl rollout status deployment/myapp   # 部署后观察滚动发布
```

## 注意事项

- **质量门禁清单**（逐项过关才算完成）：容器可正常启动 / 清单校验通过 / Helm Chart 可安装 / 安全策略已配 / 监控告警生效 / 部署成功且滚动发布健康。
- 本工作流不替代环境特定的验证、测试与专家评审；缺少必要输入、权限、安全边界或验收标准时，停下来澄清。
- 数据库迁移走扩展-收缩两段式，保证新旧版本并存期向后兼容，避免零停机发布时崩溃。
- 各阶段产物需版本化并纳入 Git，由 GitOps 统一对账，不要旁路手动 `kubectl apply` 到生产。

## 互见

- requires：`docker-expert` —— 第 1 阶段容器化的前置能力
- related：`kubernetes-architect`、`helm-chart-scaffolding`、`istio-traffic-management`、`service-mesh-architect`、`prometheus-configuration`、`grafana-dashboards`
- combines_with：`deployment-engineer`、`gitops-argocd-flux` —— 把本编排接入 CI/CD 与 GitOps，形成可重复的持续交付管线

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可证）。
