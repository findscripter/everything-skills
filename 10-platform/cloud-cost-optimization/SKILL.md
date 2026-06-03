---
name: cloud-cost-optimization
title: 云成本优化
description: 当需要降低 AWS/Azure/GCP/OCI 云账单、对资源做 rightsizing、治理浪费或落地预算管控时使用；产出成本可视化标签体系、预留/Spot 定价策略、生命周期与自动伸缩配置及预算告警；不适用于纯应用性能调优或本地数据中心成本。触发词：云成本、rightsizing、预留实例、Spot、FinOps、成本告警
domain: 平台/cloud
triggers: [云成本优化, 降低云账单, rightsizing, 资源右调, 预留实例, Savings Plans, Spot 实例, 抢占式实例, 成本可视化, 成本分摊标签, 预算告警, 成本异常检测, FinOps, 多云成本, S3 生命周期, Committed Use Discount]
tags: [云成本, finops, aws, azure, gcp, oci, rightsizing, 预留实例, spot, 标签治理, 预算告警, terraform, 多云]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Cost Explorer, AWS Compute Optimizer, Cost Anomaly Detection, Azure Advisor, GCP Recommender, OCI Cost Analysis, Kubecost, CloudHealth, Cloudability, Terraform]
requires: []
related: [aws-cost-optimizer, multi-cloud-architecture, terraform-specialist, cfo-financial-advisor]
combines_with: [multi-cloud-architecture, terraform-specialist, aws-cost-optimizer]
license: MIT
source: wshobson/agents
source_license: MIT
---
## 何时使用

适用场景：
- 要降低 AWS / Azure / GCP / OCI 云账单，且需保持性能与可靠性。
- 对过度配置（over-provisioned）的实例、数据库、存储做 rightsizing（右调）。
- 落地成本治理：成本分摊标签、预算告警、成本异常检测。
- 优化多云/混合云的整体支出，满足预算约束。

不该用（负边界）：
- 纯应用层性能/算法调优——本技能聚焦基础设施账单，不解决代码性能。
- 本地/自建数据中心 TCO 核算——这里只覆盖公有云计费模型。
- 一次性临时降本而不愿建立持续监控机制——降本需要可视化+定期复盘闭环，否则会反弹。

## 步骤

按「可视化 → 右调 → 定价 → 架构」四层推进，先看清再动手：

1. 可视化（先决条件）：打全成本分摊标签、开启云原生成本工具、配置预算告警与成本看板。无标签则后续归因无从谈起。
2. 右调（rightsizing）：依据真实利用率分析，缩容过配资源，清理闲置资源（孤立 EBS 卷、未挂载 EIP、过期快照），引入自动伸缩。
3. 定价模型：稳态负载用预留容量 / Savings Plans / 承诺使用折扣（CUD）；可中断负载用 Spot / 抢占式实例。
4. 架构优化：优先托管服务（Serverless），加缓存层，优化跨区/跨可用区数据传输，存储用生命周期分层。

## 指令

各云核心降本手段与量级（来自源约束）：

AWS
- 预留实例（RI）：相对按需省 30-72%；1 或 3 年期；全/部分/无预付；Standard 或 Convertible。
- Savings Plans：Compute 省约 66%，EC2 Instance 省约 72%；覆盖 EC2/Fargate/Lambda；跨实例族、区域、OS 灵活。
- Spot 实例：最高省 90%；适合批处理、CI/CD、无状态负载；中断仅 2 分钟通知；与按需混用提高韧性。

Azure
- 预留 VM 实例：1/3 年期，最高省 72%，灵活规格、可兑换。
- Azure Hybrid Benefit：复用现有 Windows Server 许可，叠加 RI 最高省 80%（Windows / SQL Server）。
- Azure Advisor：右调 VM、删除未用资源、用预留容量、优化存储。

GCP
- 承诺使用折扣（CUD）：1/3 年承诺，最高省 57%，按资源或按支出。
- 持续使用折扣（SUD）：自动生效，运行实例最高省 30%，无需承诺（Compute Engine / GKE）。
- 抢占式 VM：最高省 80%，最长运行 24 小时，适合批处理。

OCI
- 弹性形状（Flexible Shapes）：OCPU 与内存独立伸缩，按需匹配，减少固定形状浪费。
- 承诺与预算：年度承诺锁定可预测支出；隔间级预算+告警；用 Cost Analysis 跟踪月度预测。
- 抢占式容量：批处理/临时负载用抢占式，保留可容忍中断的伸缩组，与标准容量混用保关键服务。

## 示例

S3 存储分层（生命周期，hcl）：
```hcl
resource "aws_s3_bucket_lifecycle_configuration" "example" {
  bucket = aws_s3_bucket.example.id
  rule {
    id     = "transition-to-ia"
    status = "Enabled"
    transition { days = 30  storage_class = "STANDARD_IA" }
    transition { days = 90  storage_class = "GLACIER" }
    expiration { days = 365 }
  }
}
```
分层原则：热数据 S3 Standard → 温数据 Standard-IA(30d) → 冷数据 Glacier(90d) → 归档 Deep Archive(365d)。

成本分摊标签（统一 common_tags 后 merge）：
```hcl
locals {
  common_tags = {
    Environment = "production"
    Project     = "my-project"
    CostCenter  = "engineering"
    Owner       = "team@example.com"
    ManagedBy   = "terraform"
  }
}

resource "aws_instance" "example" {
  ami           = "ami-12345678"
  instance_type = "t3.medium"
  tags = merge(local.common_tags, { Name = "web-server" })
}
```

预算告警（达阈值邮件通知）：
```hcl
resource "aws_budgets_budget" "monthly" {
  name              = "monthly-budget"
  budget_type       = "COST"
  limit_amount      = "1000"
  limit_unit        = "USD"
  time_period_start = "2024-01-01_00:00"
  time_unit         = "MONTHLY"
  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 80
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_email_addresses = ["team@example.com"]
  }
}
```

数据库按环境右调示例：开发 t3.small RDS / 预发 t3.large RDS / 生产 r6g.2xlarge RDS + 只读副本。

## 注意事项

落地检查清单（关键项）：
- 打全成本分摊标签（无标签=无归因）。
- 删除未用资源：孤立 EBS 卷、未挂载 EIP、过期快照。
- 按利用率右调实例，稳态负载上预留容量。
- 启用自动伸缩与成本异常检测，设置预算告警。
- 存储用生命周期分层；优化跨区数据传输与缓存层；优先托管服务。
- 至少每周复盘成本，持续监控持续优化——降本是闭环不是一次动作。

Spot/抢占式风险：仅用于可中断、无状态或批处理负载，并与按需/标准容量混用保障关键服务；预留与承诺折扣会锁定 1-3 年支出，承诺前务必确认负载是真稳态。

工具速查：AWS（Cost Explorer / Cost Anomaly Detection / Compute Optimizer）、Azure（Cost Management / Advisor）、GCP（Cost Management / Recommender）、OCI（Cost Analysis / Budgets / Cloud Advisor）、多云（CloudHealth / Cloudability / Kubecost）。

## 互见

- `terraform-module-library`：资源供给与 IaC 模块复用。
- `multi-cloud-architecture`：云选型与多云架构决策。

---
采编自 wshobson/agents（MIT 许可）。
