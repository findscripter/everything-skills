---
name: gcp-cloud-architect
title: GCP 云架构设计
description: 当需要为创业公司或企业设计 Google Cloud 架构、上线 Cloud Run/GKE、搭建 BigQuery 数据管道或优化 GCP 成本时使用；按需求选型架构模式并产出 Terraform/gcloud/Cloud Build 的 IaC 与成本优化清单；不适用于 AWS/Azure 或非云端本地部署。触发词：GCP、Cloud Run、GKE、BigQuery、成本优化
domain: 平台/cloud
triggers: [设计 GCP 架构, 部署到 Cloud Run 或 GKE, 搭建 BigQuery 数据管道, 优化 GCP 成本, 迁移到 Google Cloud, Google Cloud 基础设施选型, GCP Terraform/IaC 模板]
tags: [gcp, google cloud, 云架构, cloud run, gke, bigquery, 成本优化, terraform, iac, cloud build, 平台]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [gcloud, terraform, Cloud Build, BigQuery, scripts/architecture_designer.py, scripts/cost_optimizer.py, scripts/deployment_manager.py]
requires: []
related: [aws-serverless-architect, azure-cloud-architect, gcp-cloud-run, multi-cloud-architecture]
combines_with: [terraform-specialist, cloud-cost-optimization, github-actions-author]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

需要为创业公司或企业设计可扩展、成本可控的 Google Cloud 架构，并产出基础设施即代码（IaC）时使用。典型场景：

- 设计 Google Cloud 基础设施并选型服务栈
- 部署到 Cloud Run / GKE，或配置 Cloud Functions、Cloud SQL、BigQuery
- 搭建实时数据管道（Pub/Sub + Dataflow + BigQuery）或 ML 平台（Vertex AI）
- 优化现有 GCP 账单、迁移上云

**不该用边界：**
- 目标云是 AWS 或 Azure（改用对应的 aws-solution-architect / azure-cloud-architect）
- 纯本地/裸金属部署，不涉及 GCP 托管服务
- 仅需广义 DevOps 流水线/监控/容器化（用 senior-devops）

## 步骤

1. **收集需求**：应用类型（Web 应用/移动后端/数据管道/SaaS）、预期用户数与 RPS、月度预算、团队规模与 GCP 经验、合规要求（GDPR/HIPAA/SOC 2）、可用性 SLA 与 RPO/RTO。
2. **设计架构**：跑设计器获取模式推荐，再对照运维成熟度与合规要求确认后进入下一步。
3. **估算成本**：分析当前账单的右调（right-sizing）、承诺使用折扣、存储分层等节省机会。
4. **生成 IaC**：为所选模式产出 Terraform HCL 与 gcloud CLI 脚本。
5. **配置 CI/CD**：用 Cloud Build 或 GitHub Actions 实现自动构建与部署。
6. **安全评审**：核对 IAM 最小权限、Workload Identity、Secret Manager、审计日志等清单；部署失败时按排错流程定位。

**四种核心架构模式：**
- **Serverless Web**：Cloud Storage + Cloud CDN + Cloud Run + Firestore（约 $15–40/月）
- **GKE 微服务**：GKE Autopilot + Cloud SQL + Memorystore + Pub/Sub（约 $500–2000/月）
- **Serverless 数据管道**：Pub/Sub + Dataflow + BigQuery + Looker
- **ML 平台**：Vertex AI + Cloud Storage + BigQuery + Cloud Functions

## 指令

**步骤 2 架构设计：**
```bash
python scripts/architecture_designer.py --input requirements.json --output design.json
```
输出含 `recommended_pattern`、`service_stack`、`estimated_monthly_cost_usd`、`pros/cons`。

**步骤 3 成本优化：**
```bash
python scripts/cost_optimizer.py --resources current_setup.json --monthly-spend 2000
```
输出含按服务的成本拆分、右调建议、承诺使用折扣（CUD）、持续使用折扣（SUD）分析、潜在月度节省。详细估算用 [GCP 定价计算器](https://cloud.google.com/products/calculator)。

**步骤 4 生成 IaC：**
```bash
python scripts/deployment_manager.py --app-name my-app --pattern serverless_web --region us-central1
```

**步骤 6 安全核查：**
```bash
gcloud projects get-iam-policy $PROJECT_ID --format=json
gcloud iam service-accounts list --project=$PROJECT_ID
gcloud access-context-manager perimeters list --policy=$POLICY_ID
```

安全清单：IAM 遵循最小权限（优先预定义角色而非基础角色）；GKE 用 Workload Identity；敏感 API 配 VPC Service Controls；客户管理密钥用 Cloud KMS；为所有管理活动开启 Cloud Audit Logs；用组织策略限制公开访问；所有凭据走 Secret Manager。

**部署失败排错：**
```bash
gcloud run services describe my-app-api --region us-central1
gcloud logging read "resource.type=cloud_run_revision" --limit=20
gcloud run deploy my-app-api --image gcr.io/$PROJECT_ID/my-app:latest --region us-central1
```
常见原因：IAM 权限错误（核对服务账号角色与 `--allow-unauthenticated`）；配额超限（IAM & Admin > Quotas 申请提升）；容器启动失败（查容器日志与健康检查）；区域/API 未启用（`gcloud services enable`）。

## 示例

**Cloud Run + Firestore 的 Terraform（节选）：**
```hcl
resource "google_cloud_run_v2_service" "api" {
  name     = "${var.environment}-${var.app_name}-api"
  location = var.region
  template {
    containers {
      image = "gcr.io/${var.project_id}/${var.app_name}:latest"
      resources { limits = { cpu = "1000m", memory = "512Mi" } }
      env { name = "FIRESTORE_PROJECT", value = var.project_id }
    }
    scaling { min_instance_count = 0, max_instance_count = 10 }
  }
}

resource "google_firestore_database" "default" {
  project     = var.project_id
  name        = "(default)"
  location_id = var.region
  type        = "FIRESTORE_NATIVE"
}
```

**gcloud CLI 部署：**
```bash
gcloud run deploy my-app-api \
  --image gcr.io/$PROJECT_ID/my-app:latest \
  --region us-central1 --platform managed --allow-unauthenticated \
  --memory 512Mi --cpu 1 --min-instances 0 --max-instances 10

gcloud firestore databases create --location=us-central1
```

**Cloud Build CI/CD（cloudbuild.yaml 节选）：** 用 `gcr.io/cloud-builders/docker` 构建并推送 `gcr.io/$PROJECT_ID/my-app:$COMMIT_SHA`，再用 cloud-sdk 执行 `gcloud run deploy`。创建触发器：
```bash
gcloud builds triggers create github \
  --repo-name=my-app --repo-owner=my-org \
  --branch-pattern="^main$" --build-config=cloudbuild.yaml
```

## 注意事项

避免以下反模式：

| 反模式 | 为何失败 | 更优做法 |
|---|---|---|
| 生产用默认 VPC | 无隔离、共享防火墙规则 | 自建带私有子网的 VPC |
| 过度预置 GKE 节点池 | 闲置容量浪费成本 | 用 GKE Autopilot 或集群自动扩缩 |
| 密钥存环境变量 | Console/日志可见 | Secret Manager + Workload Identity |
| 忽略持续使用折扣 | 漏掉 20–30% 自动节省 | 按稳定基线右调 VM |
| SaaS 单区域部署 | 单区故障即全停 | 多区域 + Cloud Load Balancing |
| 重负载用 BigQuery 按需计费 | 规模化成本不可控 | 用 BigQuery slots（统一费率） |
| 用 Cloud Functions 跑长任务 | 9 分钟超时、冷启动 | >60s 任务改用 Cloud Run |

完整模式与最佳实践见 `references/architecture_patterns.md`、`references/service_selection.md`、`references/best_practices.md`。

## 互见

- **aws-solution-architect**：AWS 对应版，同样的 6 步流程、不同服务。
- **azure-cloud-architect**：Azure 对应版，凑齐三大云。
- **senior-devops**：更广的 DevOps 范畴（流水线、监控、容器化）。
- **terraform-patterns**：面向 GCP 的 Terraform 模块实现。
- **ci-cd-pipeline-builder**：自动化 Cloud Build 与部署流水线。

---

采编自 alirezarezvani/claude-skills（MIT 许可）。
