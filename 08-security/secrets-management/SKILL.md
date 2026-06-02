---
name: secrets-management
title: 密钥与凭据管理
description: 当在 CI/CD 流水线或运行时需要安全存取 API 密钥、数据库口令、TLS 证书等敏感信息时使用；做法是选定密钥后端（Vault / AWS Secrets Manager / Azure Key Vault / GCP / GitHub-GitLab 内置变量）并以最小权限拉取、轮转与审计，产出可落地的存取与轮转配置；不适用于把明文密钥硬编码进源码或仅需本地不外发的开发值。触发词：密钥管理、凭据管理、secrets management、Vault、AWS Secrets Manager、密钥轮转、secret rotation、密钥扫描
domain: 安全/ops
triggers: [密钥管理, 凭据管理, secrets management, Vault, AWS Secrets Manager, 密钥轮转, secret rotation, 密钥扫描]
tags: [security, secrets, ci-cd, devops, vault, aws-secrets-manager, rotation, least-privilege]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [HashiCorp Vault, AWS Secrets Manager, Azure Key Vault, Google Secret Manager, GitHub Actions, GitLab CI, Terraform, External Secrets Operator, TruffleHog, GitGuardian]
requires: []
related: [secrets-manager, env-secrets-hygiene, auth-implementation-patterns, insecure-defaults-detector]
combines_with: [env-secrets-hygiene, ci-cd-pipeline-builder, terraform-specialist]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用于：在 CI/CD 流水线或运行时安全存取 API 密钥、数据库口令、TLS 证书；需要自动轮转密钥；实现最小权限访问与审计日志。

不该用（负边界）：
- 打算把密钥明文硬编码进源码或提交到版本库。
- 无法保证密钥后端的访问安全（无法控制谁能读后端）。
- 只需本地开发用、不外发也不共享的临时值——直接用本地 `.env`（加入 `.gitignore`）即可，无需引入后端。

## 步骤

1. 梳理密钥类型、归属人（owner）和轮转要求。
2. 选定密钥后端与访问模型（见下方选型）。
3. 在 CI/CD 或运行时以最小权限拉取密钥，避免落盘、避免进日志。
4. 验证轮转流程与审计日志确实生效。

后端选型速查：
- HashiCorp Vault：集中管理、动态密钥、轮转、审计、细粒度访问控制（跨云通用）。
- AWS Secrets Manager：AWS 原生、自动轮转、与 RDS 集成。
- Azure Key Vault：Azure 原生、HSM 支持、证书管理、RBAC。
- Google Secret Manager：GCP 原生、版本化、IAM 集成。

## 指令

### Vault：初始化与写入

```bash
vault server -dev
export VAULT_ADDR='http://127.0.0.1:8200'
export VAULT_TOKEN='root'
vault secrets enable -path=secret kv-v2
vault kv put secret/database/config username=admin password=secret
```

### AWS Secrets Manager：写入

```bash
aws secretsmanager create-secret \
  --name production/database/password \
  --secret-string "super-secret-password"
```

### 密钥扫描（pre-commit 钩子，TruffleHog）

```bash
#!/bin/bash
# .git/hooks/pre-commit
docker run --rm -v "$(pwd):/repo" \
  trufflesecurity/trufflehog:latest \
  filesystem --directory=/repo
if [ $? -ne 0 ]; then
  echo "Secret detected! Commit blocked."
  exit 1
fi
```

### 自动轮转（AWS Lambda 骨架）

```python
import boto3, json

def lambda_handler(event, context):
    client = boto3.client('secretsmanager')
    cur = json.loads(client.get_secret_value(SecretId='my-secret')['SecretString'])
    new_password = generate_strong_password()
    update_database_password(new_password)
    client.put_secret_value(
        SecretId='my-secret',
        SecretString=json.dumps({'username': cur['username'], 'password': new_password})
    )
    return {'statusCode': 200}
```

手动轮转流程：生成新密钥 → 写入密钥库 → 应用切换到新密钥 → 验证功能 → 吊销旧密钥。

## 示例

### GitHub Actions + Vault

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

### GitHub Actions + AWS Secrets Manager（拉取并脱敏）

```yaml
- name: Get secret from AWS
  run: |
    SECRET=$(aws secretsmanager get-secret-value \
      --secret-id production/database/password \
      --query SecretString --output text)
    echo "::add-mask::$SECRET"
    echo "DB_PASSWORD=$SECRET" >> $GITHUB_ENV
```

### GitLab CI + Vault

```yaml
deploy:
  image: vault:latest
  before_script:
    - export VAULT_ADDR=https://vault.example.com:8200
    - export VAULT_TOKEN=$VAULT_TOKEN
    - apk add curl jq
  script:
    - |
      DB_PASSWORD=$(vault kv get -field=password secret/database/config)
      API_KEY=$(vault kv get -field=key secret/api/credentials)
```

### Terraform 引用 AWS Secrets Manager

```hcl
data "aws_secretsmanager_secret_version" "db_password" {
  secret_id = "production/database/password"
}

resource "aws_db_instance" "main" {
  username = "admin"
  password = jsondecode(data.aws_secretsmanager_secret_version.db_password.secret_string)["password"]
}
```

### Kubernetes External Secrets Operator（从 Vault 同步到 K8s Secret）

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

## 注意事项

- 绝不把密钥提交到 Git，绝不在日志里 echo 明文（CI 中用 `::add-mask::` 或 GitLab 的 Masked 变量）。
- 各环境使用不同密钥；定期轮转；遵循最小权限。
- 开启审计日志；尽量使用短期令牌（short-lived token）。
- 静态加密（at rest）；在流水线接入密钥扫描（GitGuardian / TruffleHog）。
- GitLab 变量善用 Protected（仅受保护分支可用）、Masked（日志中隐藏）、File 三种类型。
- 本技能产出仅为模板，须结合具体环境做验证与专家评审；若密钥归属、权限边界或成功标准不明确，先停下确认。

## 互见

（无可关联的同库技能）

—— 本条采编自 sickn33/antigravity-awesome-skills（MIT）。
