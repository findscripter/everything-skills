---
name: azure-cloud-architect
title: Azure 云架构设计
description: 当为初创/企业设计 Azure 基础设施、写 Bicep/ARM、做成本优化、配 Azure DevOps/GitHub Actions 流水线或迁移上云时使用；产出架构模式选型、Bicep IaC 模板、成本与安全评审清单；不适用于 AWS/GCP 选型、应用代码开发或具体业务建模；触发词：Azure、Bicep、AKS、App Service、Functions、Cosmos DB、成本优化
domain: 平台/cloud
triggers: [设计 Azure 架构, Azure 基础设施, Bicep 模板, ARM 模板, AKS 集群, App Service, Azure Functions, Cosmos DB, Azure 成本优化, 迁移到 Azure, Azure DevOps 流水线, Front Door, Key Vault, Managed Identity]
tags: [azure, cloud, 平台, iac, bicep, 架构设计, 成本优化, devops, 微服务, serverless]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, az, bicep, scripts/architecture_designer.py, scripts/bicep_generator.py, scripts/cost_optimizer.py]
requires: []
related: [aws-serverless-architect, gcp-cloud-architect, multi-cloud-architecture, ms365-tenant-admin]
combines_with: [terraform-specialist, cloud-cost-optimization, github-actions-author]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

- 为初创或企业从零设计可扩展、低成本的 Azure 架构，需要模式选型建议。
- 需要生成 Bicep（首选）或 ARM/Terraform 的基础设施即代码（IaC）模板。
- 评估并优化 Azure 月度成本（右调规格、预留实例、存储分层）。
- 配置 Azure DevOps Pipelines 或 GitHub Actions 部署 IaC。
- 规划上云迁移或上线前做安全姿态评审。

不该用的边界：
- 跨云 AWS/GCP 选型与对比，请改用对应的 aws/gcp 架构技能（见互见）。
- 应用业务代码编写、数据库 schema 业务建模、前端开发等非基础设施工作。
- 已有详尽 IaC 且只需小改 1-2 个参数时，直接改文件即可，无需整套流程。

## 步骤

1. 采集需求：应用类型（Web/移动后端/数据管道/SaaS/微服务）、预期用户与 RPS、月度预算、团队规模与 Azure 经验、合规要求（GDPR/HIPAA/SOC 2/ISO 27001）、可用性（SLA、RPO/RTO）、区域偏好（数据驻留、时延）。
2. 设计架构：用脚本得到模式推荐，对照团队运维成熟度与合规要求确认后再继续。
3. 生成 IaC：按选定模式生成 Bicep 模板（含托管标识、Key Vault、诊断设置、NSG、成本分摊标签）。优先 Bicep 而非 ARM JSON——Bicep 编译为 ARM、语法更干净、支持模块、微软一方支持。
4. 评审成本：分析当前资源清单，输出按服务的成本拆分、右调建议、预留实例/节省计划机会、可节省金额。
5. 配置 CI/CD：用 OIDC（id-token: write）无密钥登录，部署 Bicep。
6. 安全评审：上线前逐项核对身份、密钥、网络、加密、监控、合规。

## 指令

```bash
# Step 2 架构选型（--json 输出结构化结果）
python scripts/architecture_designer.py \
  --app-type web_app \
  --users 10000 \
  --requirements '{"budget_monthly_usd": 500, "compliance": ["SOC2"]}'

# Step 3 生成 Bicep（web-app / microservices 等）
python scripts/bicep_generator.py --arch-type web-app --output main.bicep

# Step 4 成本优化
python scripts/cost_optimizer.py --config current_resources.json --json
```

四类可选模式：
- App Service Web：Front Door + App Service + Azure SQL + Redis Cache。
- 微服务 on AKS：AKS + Service Bus + Cosmos DB + API Management。
- 无服务器事件驱动：Functions + Event Grid + Service Bus + Cosmos DB。
- 数据管道：Data Factory + Synapse + Data Lake Storage + Event Hubs。

部署失败排查：
```bash
# 查看部署错误
az deployment group show -g rg-myapp-dev --name main --query 'properties.error'
# 部署前先校验 Bicep
az bicep build --file main.bicep
az deployment group validate -g rg-myapp-dev --template-file main.bicep
```
常见原因：RBAC 权限不足（部署主体需对资源组有 Contributor）；资源提供程序未注册（`az provider register --namespace Microsoft.Web`）；命名冲突（存储账户/Web 应用名需全局唯一）；配额超限（门户 Subscriptions > Usage + quotas 申请提额）。

## 示例

Bicep 核心片段（Linux App Service + Serverless SQL，强制 HTTPS、TLS 1.2、系统分配托管标识、自动暂停）：

```bicep
param environment string = 'dev'
param location string = resourceGroup().location
param appName string = 'myapp'

resource appServicePlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: '${environment}-${appName}-plan'
  location: location
  sku: { name: 'P1v3', tier: 'PremiumV3', capacity: 1 }
  properties: { reserved: true } // Linux
}

resource appService 'Microsoft.Web/sites@2023-01-01' = {
  name: '${environment}-${appName}-web'
  location: location
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|20-lts'
      minTlsVersion: '1.2'
      ftpsState: 'Disabled'
      alwaysOn: true
    }
  }
  identity: { type: 'SystemAssigned' }
}

resource sqlDatabase 'Microsoft.Sql/servers/databases@2023-05-01-preview' = {
  parent: sqlServer
  name: '${appName}-db'
  location: location
  sku: { name: 'GP_S_Gen5_2', tier: 'GeneralPurpose' }
  properties: { autoPauseDelay: 60, minCapacity: json('0.5') }
}
```

GitHub Actions（OIDC 无密钥部署）：
```yaml
permissions:
  id-token: write
  contents: read
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: azure/login@v2
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
      - uses: azure/arm-deploy@v2
        with:
          resourceGroupName: rg-myapp-dev
          template: ./infra/main.bicep
          parameters: environment=dev
```

Azure DevOps（内联 AzureCLI 任务）：`az deployment group create -g rg-myapp-dev --template-file infra/main.bicep --parameters environment=dev`。

快速选型参考：
- 初创 Web 应用（< $100/月）：App Service B1 + Azure SQL Serverless + Blob + Front Door 免费层 + Key Vault，约 $40-80/月。
- SaaS 微服务（$500-2000/月）：AKS 三节点池（system/app/jobs）+ API Management + Cosmos DB + Service Bus + Monitor/App Insights，多区域部署。
- 订单事件驱动（< $200/月）：Functions 消费计划 + Event Grid + Service Bus + Cosmos DB + App Insights，约 $30-150/月。
- 数据管道（$300-1500/月）：Event Hubs + Stream Analytics/Functions + Data Lake Gen2 + Synapse + Power BI。

## 注意事项

安全评审清单（上线前逐项核对）：
- 身份：Entra ID（Azure AD）+ RBAC，服务间用托管标识，绝不在代码中存凭据。
- 密钥：所有密钥、证书、连接串走 Key Vault；App Settings 用 Key Vault 引用而非明文。
- 网络：每个子网配 NSG，PaaS 服务用 Private Endpoint，Application Gateway 启用 WAF。
- 加密：传输 TLS 1.2+，静态用 Azure 托管或客户托管密钥。
- 监控：启用 Microsoft Defender for Cloud，用 Azure Policy 做护栏。
- 合规：为 SOC 2 / HIPAA / ISO 27001 计划分配 Azure Policy。

反模式速查：
- 新项目用 ARM JSON——冗长无模块，改用 Bicep。
- 密钥存 App Settings 明文——改用 Key Vault 引用。
- 单个大 AKS 节点池——拆 system/app/jobs 多池。
- PaaS 暴露公网端点——用 Private Endpoint + VNet 集成。
- 「以防万一」过量预配——从小起步、用自动扩缩、每月右调。
- 所有东西塞共享资源组——每环境每工作负载一个资源组。
- 无标签策略——按 environment/owner/cost-center/app-name 打标。
- 用经典（classic）资源——已弃用，统一用 ARM/Bicep 资源。

## 互见

- aws-solution-architect：AWS 等价，同一套 6 步流程、不同服务。
- gcp-cloud-architect：GCP 等价，补齐三大云。
- senior-devops：更广的 DevOps 范畴——流水线、监控、容器化。
- terraform-patterns：用 azurerm provider 编写面向 Azure 的 Terraform 模块（多云兼容）。
- ci-cd-pipeline-builder：流水线构建——自动化 Azure DevOps 与 GitHub Actions。

参考文档：`references/architecture_patterns.md`（5 套模式）、`references/service_selection.md`（计算/数据库/存储/消息/网络决策矩阵）、`references/best_practices.md`（命名、标签、RBAC、网络安全、监控、容灾）。

---

采编自 alirezarezvani/claude-skills（MIT 许可证）。
