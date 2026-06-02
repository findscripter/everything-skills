---
name: env-secrets-hygiene
title: 环境变量与密钥卫生审计
description: 当审计 .env/源码是否误提交密钥、规划凭据轮换或排查生产缺变量故障时使用；做密钥泄露扫描、环境变量校验、轮换与应急遏制，产出按严重级排序的发现清单与预提交/CI 门禁；不适用于生产 Vault 基建/HA/灾备搭建（见 secrets-vault-manager）；触发词：密钥泄露、.env 审计、凭据轮换
domain: 安全/ops
triggers: [密钥泄露, secret 泄露, .env 审计, 凭据轮换, credential rotation, 缺少环境变量, missing env var, 硬编码密钥, gitleaks, pre-commit 密钥扫描, AWS access key 泄露, git 历史清密钥]
tags: [安全, ops, 密钥管理, secrets, 环境变量, 凭据轮换, CI/CD, 预提交检查, Vault]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Bash, Grep, Glob, Read]
requires: []
related: [secrets-management, secrets-manager, insecure-defaults-detector, dependency-auditor]
combines_with: [secrets-management, secrets-manager, ci-cd-pipeline-builder]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

适用场景：

- 提交前自检改动过 `.env`/配置文件，确认没有把真实凭据写进版本库。
- 安全审计、事故分诊：怀疑密钥泄露，需要确认泄露范围并遏制。
- 排查"生产缺少环境变量"类故障，需要启动期/CI 期的必填变量校验。
- 新项目接入或新成员 onboarding，需要建立安全的 env 约定与扫描门禁。
- 规划凭据轮换（API key、数据库口令、证书），或泄露后的应急轮换。

不该用（负边界）：

- 不负责生产级 Vault 基础设施搭建、HA 部署、灾备流程——见互见的 `secrets-vault-manager`。
- 不替代专业 SIEM/事件响应平台；本技能只到"发现 + 遏制 + 轮换"。
- 模式匹配是启发式的，**会漏报也会误报**，不能作为唯一合规依据。

## 步骤

1. 在仓库根目录跑泄露扫描，优先处理 `critical`/`high` 级发现。
2. 对确认的真实凭据：先轮换、再从代码/历史中清除暴露值。
3. 同步更新 `.env.example`（仅占位符）与 `.gitignore`（忽略本地 env）。
4. 增加或收紧 pre-commit / CI 密钥扫描门禁，让检测在合并前生效。
5. 生产侧改用密钥管理器（Vault / 云原生 Secret Manager）作为唯一真源，应用启动时拉取而非读 `.env`。

## 指令

仓库扫描（脚本随源技能提供，模式见下）：

```bash
# 扫描仓库的疑似密钥泄露
python3 scripts/env_auditor.py /path/to/repo

# 给 CI 用的 JSON 输出
python3 scripts/env_auditor.py /path/to/repo --json
# 可选：--max-file-size-kb 512 跳过超大文件
```

核心检测模式（按严重级，源技能内置）：

- critical：`sk-…`（OpenAI）、`ghp_…`（GitHub PAT）、`AKIA[0-9A-Z]{16}`（AWS Access Key）
- high：`xox[baprs]-…`（Slack）、`-----BEGIN … PRIVATE KEY-----`、`(secret|token|password|api_key) = '…'` 通用赋值
- medium：`eyJ….….…`（JWT 样式）

启动期/CI 必填变量校验（Bash 节选，完整脚本在 `references/validation-detection-rotation.md`）：

```bash
set -euo pipefail
ALWAYS_REQUIRED=(APP_SECRET APP_URL DATABASE_URL AUTH_JWT_SECRET AUTH_REFRESH_SECRET)
for var in "${ALWAYS_REQUIRED[@]}"; do
  [ -z "${!var:-}" ] && MISSING+=("$var")
done
# 长度/格式约束示例：AUTH_JWT_SECRET 必须 ≥32 字符
[ -n "${AUTH_JWT_SECRET:-}" ] && [ ${#AUTH_JWT_SECRET} -lt 32 ] && \
  WARNINGS+=("AUTH_JWT_SECRET 短于 32 字符——不安全")
[ ${#MISSING[@]} -gt 0 ] && exit 1   # 缺必填变量直接失败
```

预提交门禁（团队推荐 gitleaks）：

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.0
    hooks:
      - id: gitleaks
```

```bash
gitleaks git --pre-commit --staged          # 提交前钩子
gitleaks detect --source . --report-path gitleaks-report.json   # 基线扫描
# 误报维护：.gitleaksignore（每行一个 fingerprint）；detect-secrets 用 .secrets.baseline
```

## 示例

应急轮换（确认泄露后）：

1. 立即在服务商侧吊销被泄露凭据（AWS IAM 删 key / Stripe Roll key / GitHub PAT Revoke / `ALTER USER app_user PASSWORD '…'`）。
2. 生成并向所有消费方（应用、服务、流水线）并行部署新凭据，逐个验证可认证，**全部健康后再吊销旧凭据**。
3. 审计暴露窗口内的访问日志，排查异常使用。
4. 扫 git 历史 / CI 日志 / 制品仓库是否仍含泄露值。
5. 从历史清除（**会重写历史，先与团队协调**）：

```bash
git filter-repo --replace-text <(echo "LEAKED_VALUE==>REDACTED")
git push origin --force --all                 # 需团队协调 + 强推权限
git log --all -p | grep "LEAKED_VALUE" | wc -l  # 应为 0
```

6. 归档事故报告（范围、时间线、修复步骤），并收紧检测控制防复发。

生产密钥源选型：单云用云原生 Secret Manager（AWS Secrets Manager / Azure Key Vault / GCP Secret Manager，IAM 集成、可自动轮换）；多云/混合用 HashiCorp Vault（统一 API + 动态短期凭据）；K8s 重度用 External Secrets Operator 或 CSI Driver 注入。

## 注意事项

- **永不在日志/流水线输出里 echo 或打印密钥值**，调试与事故响应时也不行；CI 的掩码不是万无一失。
- `.env.example` 只放占位符，**绝不放真实值**；本地 `.env` 必须 gitignore。
- 轮换"只换一处会漏掉下游消费方"——务必枚举全部消费方再吊销旧值。
- 优先用短期令牌（OIDC、STS AssumeRole）替代长期静态凭据；CI 密钥与应用密钥同周期轮换。
- 不要把疑似泄露当低优先级；先按"已泄露"处理再验证。
- 误报清单（`.gitleaksignore` / `.secrets.baseline`）入库共享，但定期复审，避免规则把真实泄露一起掩盖；宁可收紧正则也别整文件忽略。
- 关键操作（`GetSecretValue`、轮换）应有审计日志（CloudTrail / Key Vault 诊断日志 / Cloud Audit Logs / Vault Audit Backend），并对未知 IP、批量读取、部署窗口外访问告警。

## 互见

- `secrets-vault-manager`：生产 Vault 基建、HA 部署、灾备（DR）。
- `senior-secops`：安全运营视角与事件响应。
- `ci-cd-pipeline-builder`：流水线架构与密钥注入模式。
- `infrastructure-as-code`：Terraform/Pulumi 的密钥后端配置。
- `container-orchestration`：K8s 密钥挂载、sealed secrets。

---

采编自 alirezarezvani/claude-skills（MIT 许可）。
