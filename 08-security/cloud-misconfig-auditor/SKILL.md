---
name: cloud-misconfig-auditor
title: 云基础设施安全审计
description: 当需要在部署前/部署后系统性排查云配置错误（IAM 提权链、S3 公开暴露、安全组开放高危端口、IaC 安全缺口）时使用；做云安全态势评估（CSPM），产出按严重级别分类、附带 MITRE ATT&CK 映射与最小权限整改建议的发现清单；不适用于已发生的云入侵应急响应（见 incident-response）或应用层漏洞渗透（见 security-pen-testing）。触发词：云安全审计、IAM 提权、S3 公开桶、安全组、CSPM、配置错误
domain: 安全/ops
triggers: [云安全审计, 云配置错误, CSPM 云态势, IAM 提权链, iam:PassRole 提权, S3 公开暴露, S3 公开桶检查, 安全组开放端口, 0.0.0.0/0 入站, SSH/RDP 暴露, IaC 安全扫描, Terraform 安全检查, CloudFormation 安全, 最小权限审计, 云态势评估, AWS/Azure/GCP 安全基线]
tags: [安全, ops, 云安全, CSPM, IAM, S3, 安全组, IaC, Terraform, AWS, Azure, GCP, MITRE-ATTACK, 合规]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [cloud_posture_check.py, aws-cli, jq, terraform]
requires: []
related: [aws-penetration-testing, cloud-penetration-testing, k8s-security-policies, container-security-hardening]
combines_with: [aws-penetration-testing, k8s-security-policies, terraform-specialist]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
名称：cloud-misconfig-auditor
领域：安全 / ops

云安全态势管理（CSPM）技能：系统性检查云配置错误，覆盖 IAM 提权路径、存储公开暴露、网络过度放行和基础设施即代码（IaC）安全。核心工具为 `cloud_posture_check.py`，支持 `iam` / `s3` / `sg` 三类检查，并对每个发现给出严重级别、MITRE ATT&CK 映射与最小权限整改建议。

## 何时使用

适用：
- 新建资源或上线前的预部署安全评审。
- 对生产环境 IAM 策略、S3 桶、安全组做周期性态势体检。
- 在 CI/CD 中作为部署门禁，拦截配置错误进入生产。
- 多云（AWS 全量；Azure / GCP 部分）配置基线核查。

不该用（负边界）：
- 云环境已被确认入侵、需要止血与取证 —— 用 incident-response。
- 在日志中狩猎攻击者行为 / 行为异常检测 —— 用 threat-detection。
- 主动利用已发现弱点做渗透 —— 用 security-pen-testing / red-team。

前提：能以 JSON 读取 IAM 策略文档、S3 桶配置、安全组规则；持续监控需对接 AWS Config / Azure Policy / GCP Security Command Center。

## 步骤

1. 采集配置：用云 CLI 导出待审资源（IAM 策略文档、S3 ACL+公开访问阻断、安全组规则）为 JSON。
2. 跑检查：用 `cloud_posture_check.py` 对每份配置执行对应 `--check`，输出 `--json`。
3. 按退出码决策：0=无高危，1=高危（24 小时内整改），2=严重（立即整改，若已被利用升级到应急响应）。
4. 套用严重级别修饰：互联网直连资源加 `--severity-modifier internet-facing`；承载 PCI/HIPAA/GDPR 等受监管数据加 `--severity-modifier regulated-data`（均将发现升一级）。
5. 整改：对每条高危/严重发现，按工具给出的 `least_privilege_suggestion` 收敛权限；先记录业务理由再删权限，避免被悄悄加回。
6. 上线门禁：把检查接入 CI/CD，退出码 2 即阻断部署。

## 指令

工具三类检查可自动识别配置结构，也可显式 `--check`：

```bash
# IAM 策略提权路径分析
python3 scripts/cloud_posture_check.py policy.json --check iam --json

# S3 桶公开访问评估
python3 scripts/cloud_posture_check.py bucket_config.json --check s3 --json

# 安全组开放高危端口检查
python3 scripts/cloud_posture_check.py sg.json --check sg --json

# 全量检查 + 互联网直连升级
python3 scripts/cloud_posture_check.py config.json --check all \
  --provider aws --severity-modifier internet-facing --json

# 受监管数据上下文（所有发现升一级）
python3 scripts/cloud_posture_check.py config.json --check all \
  --severity-modifier regulated-data --json

# 从 AWS CLI 管道传入 IAM 策略
aws iam get-policy-version --policy-arn arn:aws:iam::123456789012:policy/MyPolicy \
  --version-id v1 | jq '.PolicyVersion.Document' | \
  python3 scripts/cloud_posture_check.py - --check iam --json
```

退出码语义：0=无高危/严重，无需动作；1=高危，24 小时内整改；2=严重，立即整改并视情升级应急响应。

关键 IAM 提权组合（单个动作不危险，组合即提权，必须分析整条 Statement 而非单动作）：

| 提权模式 | 严重级 | 关键动作组合 | MITRE |
|---|---|---|---|
| Lambda PassRole 提权 | 严重 | iam:PassRole + lambda:CreateFunction | T1078.004 |
| EC2 实例 Profile 滥用 | 严重 | iam:PassRole + ec2:RunInstances | T1078.004 |
| CloudFormation PassRole | 严重 | iam:PassRole + cloudformation:CreateStack | T1078.004 |
| 自附加策略提权 | 严重 | iam:AttachUserPolicy + sts:GetCallerIdentity | T1484.001 |
| 内联策略自提权 | 严重 | iam:PutUserPolicy + sts:GetCallerIdentity | T1484.001 |
| 策略版本后门 | 严重 | iam:CreatePolicyVersion + iam:ListPolicies | T1484.001 |
| 凭证窃取 | 高 | iam:CreateAccessKey + iam:ListUsers | T1098.001 |
| 服务级通配符 | 高 | iam:* / s3:* / ec2:* | T1078.004 |

IAM 严重级要点：`Action=* 且 Resource=*` 全管理员通配 = 严重；`Principal:'*'` 公开主体 = 严重；提权双动作组合 = 严重；数据外泄类（`s3:GetObject`、`secretsmanager:GetSecretValue` 作用于 `*`）= 高。

S3 检查矩阵：`public-read-write` ACL 或桶策略 `"Principal":"*"`+Allow = 严重；`public-read`/`authenticated-read`、四项公开访问阻断任一缺失/为 false、无默认加密 = 高；非标准 SSE 算法 = 中。

安全组：入站对互联网 CIDR（`0.0.0.0/0`、`::/0`）开放 —— 22(SSH)/3389(RDP)/全端口 = 严重；1433/3306/5432/27017/6379/9200 等数据库端口 = 高，应仅允许应用层 SG 并下沉私有子网。

## 示例

S3 推荐基线配置（账户级与桶级公开访问阻断四项必须同时启用，否则桶级可覆盖账户级）：

```json
{
  "PublicAccessBlockConfiguration": {
    "BlockPublicAcls": true,
    "BlockPublicPolicy": true,
    "IgnorePublicAcls": true,
    "RestrictPublicBuckets": true
  },
  "ServerSideEncryptionConfiguration": {
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "aws:kms",
        "KMSMasterKeyID": "arn:aws:kms:region:account:key/key-id"
      },
      "BucketKeyEnabled": true
    }]
  },
  "ACL": "private"
}
```

Terraform IAM 策略 —— 触发严重发现 vs 合规：

```hcl
# BAD：会触发严重发现
resource "aws_iam_policy" "bad_policy" {
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{ Effect = "Allow", Action = "*", Resource = "*" }]
  })
}

# GOOD：最小权限
resource "aws_iam_policy" "good_policy" {
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["s3:GetObject", "s3:PutObject"]
      Resource = "arn:aws:s3:::my-specific-bucket/*"
    }]
  })
}
```

CI/CD 部署门禁（terraform apply 前校验，严重发现阻断）：

```bash
terraform show -json plan.json | \
  jq '[.resource_changes[].change.after | select(. != null)]' > resources.json
python3 scripts/cloud_posture_check.py resources.json --check all --json
if [ $? -eq 2 ]; then
  echo "发现严重云安全问题 —— 阻断部署"
  exit 1
fi
```

## 注意事项

- 必须分析完整 Statement，不要只看单个动作：`iam:PassRole` 单独不算严重，配上 `lambda:CreateFunction` 即确证提权路径。
- 公开访问阻断要账户级 + 桶级双管齐下：桶级设置可覆盖账户级，仅启账户级不够。
- 公开/互联网直连资源（DMZ、负载均衡、API 网关）务必加 `--severity-modifier internet-facing`，其高危等同严重，不可省略。
- 不要只查管理员策略：提权链常源自看似无害的非管理员策略组合，生产身份上挂的所有策略都要查。
- 整改先做根因分析：不理解为何授权就删，会被重新加回；先记录业务理由再删。
- 服务账号易在开发期过度授权且上线未收敛，需用 AWS Access Analyzer 等核对实际使用权限并裁剪。
- 受监管数据工作负载（PHI、持卡人数据）务必加 `--severity-modifier regulated-data`。
- 完整 CSPM 检查清单见 `references/cspm-checks.md`；检测脚本见 `scripts/cloud_posture_check.py`。

## 互见

- incident-response：严重发现（公开 S3、确认正在被利用的提权）可触发安全事件分级。
- threat-detection：态势发现可作为狩猎目标，过度授权角色常是横向移动落点。
- red-team：红队针对性验证态势评估中云配置错误的可利用性。
- security-pen-testing：态势发现汇入渗透评估的基础设施安全章节。

---
采编自 alirezarezvani/claude-skills（MIT 许可），原技能名 cloud-security。已适配重写为中文技能大典条目。
