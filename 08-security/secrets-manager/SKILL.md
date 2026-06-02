---
name: secrets-manager
title: 密钥与凭据安全管理
description: 当在 CI/CD 流水线或云原生环境中需要管理 API 密钥、数据库口令、TLS 证书等敏感凭据时使用；产出基于 Vault / AWS Secrets Manager / 平台原生方案的注入、轮换、扫描与最小权限实践；不适用于应用层加密算法选型或普通环境变量配置。触发词：密钥管理、凭据管理、secrets management、Vault、AWS Secrets Manager、密钥轮换、secret rotation、密钥扫描、TruffleHog
domain: 安全/ops
triggers: [密钥管理, 凭据管理, secrets management, Vault, AWS Secrets Manager, 密钥轮换, secret rotation, 密钥扫描, TruffleHog]
tags: [security, secrets, ci-cd, vault, aws-secrets-manager, rotation, secret-scanning, ops]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [HashiCorp Vault, AWS Secrets Manager, Azure Key Vault, Google Secret Manager, GitHub Actions, GitLab CI, Terraform, External Secrets Operator, TruffleHog, boto3]
requires: []
related: [secrets-management, env-secrets-hygiene, insecure-defaults-detector, container-security-hardening]
combines_with: [env-secrets-hygiene, k8s-security-policies, ci-cd-pipeline-builder]
license: MIT
source: wshobson/agents
source_license: MIT
---
## 何时使用

适用于在 CI/CD 流水线和云/Kubernetes 环境中安全地存取、注入、轮换敏感凭据，避免硬编码：

- 存储与下发 API 密钥、数据库口令、TLS 证书。
- 自动轮换密钥、实施最小权限与审计日志。
- 在提交与流水线阶段扫描泄露的密钥。

不该用的边界：
- 不负责应用内的加解密算法/库选型（如 AES、RSA 实现）。
- 不是普通非敏感环境变量的配置说明。
- 不替代身份认证（OIDC/SSO）的整体方案设计，仅覆盖凭据存取层。

## 步骤

1. 选型：集中式选 HashiCorp Vault（动态密钥、轮换、审计、细粒度访问）；云原生按平台选 AWS Secrets Manager / Azure Key Vault（HSM、证书）/ Google Secret Manager（版本化、IAM）。
2. 写入密钥到密钥库，按 `环境/服务/用途` 分层命名（如 `production/database/password`）。
3. 在流水线中通过官方 Action/CLI 拉取，注入为环境变量，并对日志做掩码。
4. 配置自动轮换（Lambda / 原生 rotation）或遵循手动轮换流程。
5. 在 K8s 用 External Secrets Operator 把外部密钥同步为原生 Secret。
6. 在 pre-commit 与流水线两道关卡接入密钥扫描，阻断泄露提交。

## 指令

Vault 起步与写入密钥：

```bash
vault server -dev
export VAULT_ADDR='http://127.0.0.1:8200'
export VAULT_TOKEN='root'
vault secrets enable -path=secret kv-v2
vault kv put secret/database/config username=admin password=secret
```

AWS Secrets Manager 写入：

```bash
aws secretsmanager create-secret \
  --name production/database/password \
  --secret-string "super-secret-password"
```

关键约束（Best Practices，务必遵守）：
1. 绝不把密钥提交进 Git；2. 各环境使用不同密钥；3. 定期轮换；4. 最小权限；5. 开启审计日志；6. 使用密钥扫描（GitGuardian、TruffleHog）；7. 日志中掩码密钥；8. 静态加密；9. 尽量用短时令牌；10. 文档化密钥需求。

## 示例

GitHub Actions 从 Vault 注入：

```yaml
- name: Import Secrets from Vault
  uses: hashicorp/vault-action@v2
  with:
    url: https://vault.example.com:8200
    token: ${{ secrets.VAULT_TOKEN }}
    secrets: |
      secret/data/database username | DB_USERNAME ;
      secret/data/database password | DB_PASSWORD ;
      secret/data/api key | API_KEY
```

GitHub Actions 拉取 AWS 密钥并掩码注入：

```yaml
- name: Get secret from AWS
  run: |
    SECRET=$(aws secretsmanager get-secret-value \
      --secret-id production/database/password \
      --query SecretString --output text)
    echo "::add-mask::$SECRET"
    echo "DB_PASSWORD=$SECRET" >> $GITHUB_ENV
```

Terraform 引用 AWS 密钥（避免明文落地）：

```hcl
data "aws_secretsmanager_secret_version" "db_password" {
  secret_id = "production/database/password"
}

resource "aws_db_instance" "main" {
  engine   = "postgres"
  username = "admin"
  password = jsondecode(data.aws_secretsmanager_secret_version.db_password.secret_string)["password"]
}
```

AWS 自动轮换（Lambda 骨架）：

```python
import boto3, json

def lambda_handler(event, context):
    client = boto3.client('secretsmanager')
    response = client.get_secret_value(SecretId='my-secret')
    current = json.loads(response['SecretString'])
    new_password = generate_strong_password()
    update_database_password(new_password)
    client.put_secret_value(
        SecretId='my-secret',
        SecretString=json.dumps({'username': current['username'], 'password': new_password})
    )
    return {'statusCode': 200}
```

Kubernetes External Secrets Operator（Vault 后端同步为原生 Secret）：

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: database-credentials
  namespace: production
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: vault-backend
    kind: SecretStore
  target:
    name: database-credentials
    creationPolicy: Owner
  data:
    - secretKey: password
      remoteRef:
        key: database/config
        property: password
```

密钥扫描（pre-commit 钩子，检出即阻断）：

```bash
#!/bin/bash
docker run --rm -v "$(pwd):/repo" \
  trufflesecurity/trufflehog:3.88 \
  filesystem --directory=/repo
if [ $? -ne 0 ]; then
  echo "Secret detected! Commit blocked."
  exit 1
fi
```

## 注意事项

- 注入后绝不在日志/标准输出打印密钥；GitHub 用 `::add-mask::`，GitLab 用 Masked 变量。
- GitLab CI/CD 变量善用三类属性：Protected（仅受保护分支可用）、Masked（日志隐藏）、File（以文件形式落地）。
- 手动轮换务必按序：生成新密钥 -> 写入密钥库 -> 应用切换 -> 验证可用 -> 吊销旧密钥，避免中断。
- 优先短时/动态令牌；将访问权限按环境与服务隔离，遵循最小权限。
- 静态加密 + 审计日志是基线，不可省略。

## 互见

- `dependency-auditor`：与依赖供应链安全审计配合，构成 CI 安全门禁的两侧。
- `code-reviewer`：在代码评审环节核查是否存在硬编码凭据与不当日志输出。

---
本条采编自 wshobson/agents（MIT 许可）。
