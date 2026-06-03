---
name: deployment-engineer
title: CI/CD GitOps 部署工程
description: 当设计/改进 CI/CD 流水线、落地 GitOps 与渐进式交付、做零停机发布时使用；产出含质量门禁/审批、回滚与可观测性的发布方案与流水线配置；不适用于纯本地开发自动化或不涉及部署管线的功能开发；触发词：CI/CD、GitOps、渐进式交付、蓝绿、金丝雀、零停机、ArgoCD
domain: 研发/devops
triggers: [设计 CI/CD 流水线, 落地 GitOps 工作流, 渐进式交付/金丝雀/蓝绿发布, 零停机部署与自动回滚, 在流水线中集成安全合规扫描, 多环境晋级与审批门禁, ArgoCD/Flux 持续部署, 容器镜像构建与签名]
tags: [ci/cd, gitops, 部署工程, 渐进式交付, kubernetes, devops, 供应链安全, 可观测性]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [GitHub Actions, GitLab CI, ArgoCD, Flux, Helm, Kustomize, Argo Rollouts, Docker/BuildKit, Terraform, OPA/Gatekeeper]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 设计或改进 CI/CD 流水线与发布工作流
- 落地 GitOps 或渐进式交付（金丝雀、蓝绿、A/B）模式
- 实现有零停机要求的部署自动化
- 在部署流程中集成安全与合规检查

不该用（负边界）：
- 仅需本地开发自动化（构建/测试脚本，不涉及发布）
- 纯应用功能开发，不改动部署链路
- 项目中根本不存在部署或发布管线

## 步骤

1. 收集发布需求：风险容忍度、目标环境（dev/staging/prod）、SLA 与合规要求。
2. 设计流水线阶段：构建 → 测试（单测/集成/E2E）→ 安全扫描 → 质量门禁 → 审批 → 部署，明确各阶段的卡点。
3. 选定部署策略：滚动更新 / 蓝绿 / 金丝雀，配置回滚触发条件与可观测性（健康检查、就绪探针、指标）。
4. 先在 staging 验证，编写 runbook（操作手册与故障排查），再晋级到 production。

## 指令

- 落地「一次构建，处处部署」：镜像只构建一次，环境差异通过配置注入（Helm values / Kustomize overlays / 外部 Secret），不为每个环境重新打包。
- 遵循不可变基础设施：版本化部署，禁止登录生产手改；所有变更走 Git，由 GitOps 控制器（ArgoCD / Flux v2）同步。
- 全程左移安全：流水线内做 SAST/DAST、依赖与镜像漏洞扫描、生成 SBOM、镜像签名（Sigstore），用 OPA/Gatekeeper 做准入策略。
- 质量门禁硬卡：代码覆盖率阈值、安全扫描结果、性能基线，任一不达标即阻断晋级。
- 自动化回滚：基于健康检查 / 金丝雀分析（Argo Rollouts、Flagger）自动触发，同时保留人工回滚通道。
- 跟踪 DORA 四指标：部署频率、变更前置时间、变更失败率、恢复时间（MTTR）。

## 安全约束（务必遵守）

- 生产发布必须有审批与回滚预案，禁止无审批直接放量。
- 运行流水线前校验密钥、权限与目标环境，避免误投错环境。
- 秘密管理用 External Secrets Operator / Sealed Secrets / Vault，禁止明文落库。

## 示例

- 「为微服务应用设计完整 CI/CD 流水线，含安全扫描与 GitOps」
- 「用金丝雀发布 + 自动回滚实现渐进式交付」
- 「构建安全的容器镜像流水线：漏洞扫描 + 镜像签名」
- 「搭建多环境部署流水线，含晋级与审批工作流」
- 「为依赖数据库的应用设计零停机部署策略（含向后兼容的库迁移）」
- 「用 ArgoCD 为 K8s 应用落地 GitOps 工作流」

## 注意事项

- 数据库迁移要保证向后兼容（扩展-收缩两段式），避免新旧版本并存时崩溃。
- 仓库模式按规模选型：App-of-apps、mono-repo vs multi-repo、环境晋级路径需提前约定。
- 不要把本技能产物当作环境特定验证、测试或专家评审的替代；缺少必要输入、权限、安全边界或验收标准时，应停下来澄清。
- 平台工程优先：沉淀可复用流水线模板与自助发布能力，配合护栏（guardrails），提升开发者体验。

## 互见

- 基础设施即代码（Terraform / Pulumi）与环境供给
- Kubernetes 运维与服务网格（Istio / Linkerd）流量治理
- 可观测性与告警（APM、集中式日志、SLO/SLA 监控）
- 供应链安全（SLSA、Sigstore、SBOM）

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可证）。
