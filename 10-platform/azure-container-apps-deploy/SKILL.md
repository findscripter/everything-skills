---
name: azure-container-apps-deploy
title: Azure Container Apps 容器化部署（azd）
description: 当用 Azure Developer CLI（azd）把前后端容器应用部署到 Azure Container Apps 时使用；产出 azure.yaml 服务定义、Bicep 基础设施、远程构建/托管身份/RBAC 配置与幂等 azd up 部署流程；不适用于 AWS/GCP 无服务器、AKS 原生 K8s 编排或纯应用代码开发。触发词：azd、azd up、Azure Container Apps、azure.yaml、remoteBuild、Bicep、Managed Identity、containerapp
domain: 平台/cloud
triggers: [azd up, azd init, azd env set, Azure Container Apps, azure.yaml, remoteBuild, containerapp host, Bicep main.parameters.json, Managed Identity principalId, postprovision RBAC hook, Container Apps 服务发现, azd deploy --service, az containerapp logs, 幂等部署, azd auth login]
tags: [azure, container apps, azd, bicep, iac, 远程构建, managed identity, rbac, devops, 容器部署]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [azd, az, Bicep, docker, Azure Container Registry]
requires: []
related: [azure-cloud-architect, azure-functions-serverless, aws-serverless-builder, docker-container-optimizer]
combines_with: [terraform-specialist, ci-cd-pipeline-builder, gcp-cloud-run]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用于用 **Azure Developer CLI（azd）** 把容器化的「前端 + 后端」应用部署到 **Azure Container Apps（ACA）**，并满足以下任一诉求时：

- 一条 `azd up` 完成「基础设施供给 + 镜像构建 + 部署」，且可反复执行（幂等）。
- 用 Bicep 声明式管理 ACA 环境、容器应用、ACR，并把 Bicep 输出回灌环境变量。
- 在 ACR 远程构建镜像（`remoteBuild: true`），避免本地架构差异。
- 启用系统分配托管身份（Managed Identity），并在 provision 后自动配 RBAC（如访问 Azure OpenAI / AI Search）。
- 配置同环境内 Container Apps 之间的内部服务发现（internal DNS）。

**不该用边界**：
- AWS 无服务器（Lambda/API Gateway/SAM）→ 用 `aws-serverless-builder`；GCP 无服务器 → 用 `gcp-cloud-run`。
- 需要 Kubernetes 原生编排（AKS、Helm、节点池）而非托管 ACA → 不在范围。
- 仅做 Azure 整体架构选型 / 成本与安全评审（不落到 azd 部署）→ 用 `azure-cloud-architect`。
- 纯应用代码开发、纯 Dockerfile 优化（不涉及 azd/ACA 部署链路）→ 用 `docker-container-optimizer`。
- 不替代环境内的实际验证、测试与专家评审；缺少所需输入、权限、安全边界或成功标准时先停下澄清。

核心原则：镜像走 ACR 远程构建；基础设施用 Bicep 保持声明式与幂等；密钥用 `azd env set` 注入而非写进 `main.parameters.json` 默认值；Bicep 输出自动回灌 `.azure/<env>/.env`，勿手改。

## 步骤 / 指令

1. **登录与初始化**：`azd auth login` → `azd init`（生成 `azure.yaml` 与 `.azure/`）→ `azd env new <env>`（dev/staging/prod）。
2. **定义服务**：在 `azure.yaml` 为每个服务声明 `host: containerapp` 与 `docker.remoteBuild: true`，指定 `project`/`language`/`docker.path`/`context`。
3. **写基础设施**：`infra/main.bicep`（根模块）+ `infra/modules/`（ACA 环境、容器应用），`infra/main.parameters.json` 把环境变量映射到 Bicep 参数。
4. **注入配置/密钥**：`azd env set KEY value` 设当前环境变量；Bicep `output` 自动回灌 `.azure/<env>/.env`（如服务 URI、principalId）。
5. **托管身份与 RBAC**：容器应用启用 `SystemAssigned` 身份并 `output principalId`；在 `postprovision` 钩子里用 `az role assignment create`（末尾 `|| true` 防「已存在」报错）授角色。
6. **部署**：`azd up` 一次完成 provision + build + deploy；增量时 `azd deploy --service <name>` 只部署单服务。
7. **校验与排障**：`azd show` 看状态，`az containerapp logs show -n <app> -g <rg> --follow` 流式查日志。

文件结构骨架：

```
project/
├── azure.yaml                 # azd 服务定义 + hooks
├── infra/
│   ├── main.bicep             # 根基础设施模块
│   ├── main.parameters.json   # 环境变量 → Bicep 参数注入
│   └── modules/
│       ├── container-apps-environment.bicep
│       └── container-app.bicep
├── .azure/
│   ├── config.json            # 默认环境指针
│   └── <env-name>/.env        # azd 托管，自动回灌（勿手改）
└── src/{frontend,backend}/Dockerfile
```

常用命令：

```bash
# 环境管理
azd env list                 # 列出环境
azd env select <name>        # 切换环境
azd env get-values           # 查看全部环境变量
azd env set KEY value        # 设置变量（推荐用于密钥）

# 部署
azd up                       # 全量 provision + build + deploy
azd provision                # 仅基础设施
azd deploy                   # 仅代码部署
azd deploy --service backend # 仅部署单个服务

# 排障
azd show
az containerapp logs show -n <app> -g <rg> --follow
```

## 示例

`azure.yaml`（前后端 + 钩子，均启用远程构建）：

```yaml
name: azure-container-apps-deploy
infra:
  provider: bicep
  path: ./infra
azure:
  location: eastus2
services:
  frontend:
    project: ./src/frontend
    language: ts
    host: containerapp
    docker: { path: ./Dockerfile, context: ., remoteBuild: true }
  backend:
    project: ./src/backend
    language: python
    host: containerapp
    docker: { path: ./Dockerfile, context: ., remoteBuild: true }
hooks:
  postdeploy:
    shell: sh
    run: |
      echo "Frontend: ${SERVICE_FRONTEND_URI}"
      echo "Backend:  ${SERVICE_BACKEND_URI}"
```

参数注入与 Bicep 输出回灌：

```json
// infra/main.parameters.json  — 语法 ${VAR} 或 ${VAR=default}
{ "parameters": {
  "environmentName": { "value": "${AZURE_ENV_NAME}" },
  "location":        { "value": "${AZURE_LOCATION=eastus2}" },
  "azureOpenAiEndpoint": { "value": "${AZURE_OPENAI_ENDPOINT}" }
}}
```

```bicep
// main.bicep —— output 自动回灌 .azure/<env>/.env
output SERVICE_FRONTEND_URI string = frontend.outputs.uri
output SERVICE_BACKEND_URI  string = backend.outputs.uri
output BACKEND_PRINCIPAL_ID string = backend.outputs.principalId
```

托管身份 + postprovision RBAC（`|| true` 防重复授权失败）：

```bicep
resource containerApp 'Microsoft.App/containerApps@2024-03-01' = {
  identity: { type: 'SystemAssigned' }
}
output principalId string = containerApp.identity.principalId
```

```yaml
hooks:
  postprovision:
    shell: sh
    run: |
      PRINCIPAL_ID="${BACKEND_PRINCIPAL_ID}"
      az role assignment create \
        --assignee-object-id "$PRINCIPAL_ID" \
        --assignee-principal-type ServicePrincipal \
        --role "Cognitive Services OpenAI User" \
        --scope "$OPENAI_RESOURCE_ID" 2>/dev/null || true
```

服务发现（同环境内部 DNS 路由）+ 复用既有 ACR：

```bicep
// 前端环境变量引用后端内部地址
env: [ { name: 'BACKEND_URL', value: 'http://ca-backend-${resourceToken}' } ]

// 引用已存在的 ACR，不重建
resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-07-01' existing = {
  name: containerRegistryName
}
// 保留 Portal 手动添加的自定义域名：为空则置 null
customDomains: empty(customDomainsParam) ? null : customDomainsParam
```

## 注意事项

- **始终用 `remoteBuild: true`（HIGH）**：本地在 M1/ARM Mac 上构建会因目标 AMD64 架构而失败；在 ACR 远程构建可避免架构错配，并按层复用、只上传变更层。
- **Bicep 输出自动回灌 `.azure/<env>/.env`，勿手改**：手动编辑会被下次 `azd up` 覆盖；要改值用 `azd env set`。
- **密钥用 `azd env set` 而非参数默认值**：不要把 secret 写进 `main.parameters.json` 默认值或提交进仓库。
- **服务标签 `azd-service-name` 必需**：缺失则 azd 找不到对应的 Container App，部署/更新会失配。
- **钩子里 RBAC 加 `|| true`**：角色「已存在」会让 `az role assignment create` 非零退出，进而中断部署；幂等容错很关键。
- **保护 Portal 手动改动**：经 Portal 添加的自定义域名可能在重部署时丢失。用 `preprovision` 钩子先 `az containerapp show ... --query customDomains` 导出备份，`postprovision` 校验/恢复；Bicep 里把 `customDomains` 在无入参时置 `null` 以保留既有域名。
- **幂等来自三处**：Bicep 声明式（资源收敛到目标态）+ 远程构建唯一标签（含部署时间戳）+ ACR 层复用。

## 互见

- related：`azure-cloud-architect` —— 先做 Azure 架构选型/Bicep 设计/成本安全评审，再落到 azd 部署
- related：`gcp-cloud-run` —— GCP 侧等价的容器化无服务器部署
- related：`aws-serverless-builder` —— AWS 侧无服务器部署对照
- combines_with：`docker-container-optimizer` —— 优化 Dockerfile 与镜像层，配合远程构建
- combines_with：`terraform-specialist` —— 用 Terraform 替代/补充 Bicep 管理周边基础设施
- combines_with：`github-actions-author` —— 在 CI/CD 流水线中编排 `azd provision` / `azd deploy`

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
