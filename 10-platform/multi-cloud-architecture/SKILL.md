---
name: multi-cloud-architecture
title: 多云架构决策框架
description: 当需要跨 AWS/Azure/GCP 设计多云架构、做服务选型、规划跨云迁移或落地云无关抽象时使用；产出三云服务对照、四类多云模式选型、成本优化策略与四阶段迁移路线；不适用于单云内部调优、应用业务代码或纯本地数据中心。触发词：多云、云无关、AWS Azure GCP 选型、跨云迁移、容灾 DR、云中立
domain: 平台/cloud
triggers: [多云架构, 云无关, cloud-agnostic, AWS Azure GCP 对比, 跨云迁移, 云服务选型, 多云容灾 DR, Best-of-Breed, 数据主权合规, 云中立抽象层, Kubernetes 多云, 多云成本优化]
tags: [多云, 云架构, aws, azure, gcp, 云无关, 迁移, 容灾, terraform, kubernetes, 成本优化, 平台]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Terraform, OpenTofu, Kubernetes, PostgreSQL, Kafka, Redis, Prometheus, Istio, MinIO]
requires: []
related: [aws-serverless-architect, azure-cloud-architect, gcp-cloud-architect, cloud-cost-optimization]
combines_with: [terraform-specialist, cloud-cost-optimization, kubernetes-architect]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 需要跨 AWS / Azure / GCP 设计应用架构，做服务选型或权衡。
- 规划从一家云迁移到另一家，或同时使用多家云。
- 要为特定工作负载（计算/存储/数据库/消息）选最合适的云服务。
- 想落地云无关（cloud-agnostic）抽象，降低厂商锁定。
- 跨云做成本对比与优化。

不该用的边界：

- 任务与多云无关，只在单一云内部做调优 → 用对应单云架构技能。
- 写应用业务代码、做具体业务建模 → 超出本技能范围。
- 纯本地数据中心、与云无关的成本核算。
- 输出不能替代针对你环境的实测、验证与专家评审；缺关键输入/权限/成功判据时先停下来澄清。

## 步骤 / 指令

1. **澄清目标与约束**：明确驱动因素（成本、合规/数据主权、避免锁定、就近服务、灾备 RTO/RPO），列出必备输入。
2. **选服务**：按工作负载用三云对照表（见示例）做横向选型，记录每项选择的理由。
3. **选多云模式**（四选一或组合）：
   - 模式1 单云 + 跨云容灾：主负载在一家云，DR 在另一家，数据库跨云复制，自动故障切换。
   - 模式2 各取所长（Best-of-Breed）：AI/ML 上 GCP，企业应用上 Azure，通用计算上 AWS。
   - 模式3 地理分布：按用户就近选区域，满足数据主权，全局负载均衡 + 区域故障切换。
   - 模式4 云无关抽象：计算用 Kubernetes、数据库用 PostgreSQL、对象存储用 S3 兼容 API、工具走开源。
4. **设计抽象分层**（追求云中立时）：应用层 → 基础设施抽象（Terraform）→ 云厂商 API → AWS/Azure/GCP。
5. **成本优化**：用预留/承诺容量（省 30–70%）、Spot/抢占式实例、右调规格（rightsizing）、变动负载用 serverless、优化跨云数据传输、配生命周期策略、打成本分摊标签、用云成本工具监控。
6. **迁移分四阶段**：① 评估（盘点现有设施、识别依赖、评估云兼容性、估算成本）→ ② 试点（选一个负载在目标云实现、充分测试、沉淀经验）→ ③ 迁移（增量迁移、保留双跑期、监控性能、验证功能）→ ④ 优化（右调规格、用云原生服务、降本、强化安全）。
7. **核对最佳实践**（见注意事项），输出可执行步骤与验证方法。

## 示例

**计算服务三云对照：**

| AWS | Azure | GCP | 用途 |
|-----|-------|-----|------|
| EC2 | Virtual Machines | Compute Engine | IaaS 虚机 |
| ECS | Container Instances | Cloud Run | 容器 |
| EKS | AKS | GKE | Kubernetes |
| Lambda | Functions | Cloud Functions | Serverless |
| Fargate | Container Apps | Cloud Run | 托管容器 |

**存储 / 数据库（节选）：**

| AWS | Azure | GCP | 用途 |
|-----|-------|-----|------|
| S3 | Blob Storage | Cloud Storage | 对象存储 |
| EBS | Managed Disks | Persistent Disk | 块存储 |
| RDS | SQL Database | Cloud SQL | 托管 SQL |
| DynamoDB | Cosmos DB | Firestore | NoSQL |
| Aurora | PostgreSQL/MySQL | Cloud Spanner | 分布式 SQL |
| ElastiCache | Cache for Redis | Memorystore | 缓存 |

**云无关替代选型：** 计算 Kubernetes（EKS/AKS/GKE）、数据库 PostgreSQL/MySQL、消息队列 Kafka（MSK/Event Hubs/Confluent）、缓存 Redis、对象存储 S3 兼容 API、监控 Prometheus/Grafana、服务网格 Istio/Linkerd。

**各云计算计价模型：** AWS（On-demand / Reserved / Spot / Savings Plans）；Azure（Pay-as-you-go / Reserved / Spot）；GCP（On-demand / Committed use / Preemptible）。

## 注意事项

最佳实践清单：

1. 用基础设施即代码（Terraform / OpenTofu）。
2. 部署走 CI/CD 流水线。
3. 按「跨云会失败」做容错设计。
4. 能用托管服务就用托管服务。
5. 建立全面监控。
6. 成本优化自动化。
7. 遵循安全最佳实践。
8. 记录每家云的差异化配置。
9. 定期演练灾备流程。
10. 多云能力做团队培训。

权衡提醒：多云会放大运维复杂度、跨云数据传输成本和团队技能要求；不要为「多云」而多云，先用约束驱动模式选择。云无关抽象会牺牲部分云原生托管能力，需在锁定风险与开发效率间取舍。

## 互见

- related：`aws-serverless-architect`、`azure-cloud-architect`、`gcp-cloud-architect` —— 单云深度架构设计，落地某一云时下钻。
- combines_with：`terraform-module-builder` —— 用 IaC 实现跨云资源；`cloud-cost-optimization` —— 落地跨云降本与 FinOps。

---

采编自 sickn33/antigravity-awesome-skills（MIT）。
