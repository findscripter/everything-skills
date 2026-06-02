---
name: terraform-specialist
title: Terraform 基础设施即代码
description: 当用 Terraform/OpenTofu 设计模块、管理远程 state、搭建多环境/多云 IaC 与策略即代码流水线时使用；做模块化架构、远程后端加锁加密、plan/apply 评审与漂移成本治理并产出可复现的 IaC 工程；不适用于一次性手动改基础设施、被锁定到其他 IaC 工具、或无法远程安全存储 state 的场景；触发词：terraform、opentofu、iac、基础设施即代码、tfstate、远程后端、状态锁、漂移、tfsec、checkov、多云
domain: 平台/cloud
triggers: [terraform, opentofu, iac, 基础设施即代码, tfstate, 远程后端, 状态锁, 漂移, tfsec, checkov, 多云]
tags: [terraform, opentofu, iac, cloud, state-management, gitops, policy-as-code, ci-cd]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [terraform, opentofu, terratest, tfsec, checkov, terrascan, opa, sentinel, pre-commit, github-actions]
requires: []
related: [terraform-module-builder, aws-cdk-patterns, cloudformation-best-practices, gitops-argocd-flux]
combines_with: [github-actions-author, multi-cloud-architecture, cloud-cost-optimization]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：

- 设计 Terraform/OpenTofu 模块或多环境工程（root/child 模块、复用与版本化）。
- 管理 state 后端、workspace、状态锁与加密；做多云/混合栈。
- 落地策略即代码（OPA/Sentinel）与 IaC 的 CI/CD 自动化、安全扫描。

不该用（负边界）：

- 只是一次性的手动基础设施改动，写 IaC 反而过重。
- 团队已被锁定到其他 IaC 工具或平台（如 Pulumi、CDK、Bicep），不打算迁移。
- 无法远程存储并保护 state（必须有可加密、可加锁的远程后端）。

## 步骤

1. 厘清环境、provider 与安全约束：列出目标环境（dev/staging/prod）、云 provider 及版本约束、敏感数据与合规要求。
2. 设计模块并选定远程 state 后端：用根模块编排子模块，遵循 DRY 与组合（composition）；后端在 S3 / Azure Storage / GCS / Terraform Cloud 中择一，配套锁机制（DynamoDB / GCS / Azure）与静态加密。
3. 实现 plan/apply 工作流：接入 CI（GitHub Actions、GitLab CI 等），先 plan 再人工评审审批，最后 apply；嵌入策略校验与安全扫描作为质量门禁。
4. 校验漂移、成本与回滚：周期性 drift 检测、成本估算与标签治理，明确 state 损坏恢复与失败 apply 的回滚策略。

## 指令

- 初始化与校验：

```bash
terraform init        # 或 tofu init
terraform fmt -recursive
terraform validate
```

- 计划与应用（务必先 plan 再 apply）：

```bash
terraform plan -out=tfplan
terraform apply tfplan        # 应用已评审的固定计划，避免 apply 时再次漂移
```

- 远程后端 + 加锁（S3 + DynamoDB 示例）：

```hcl
terraform {
  backend "s3" {
    bucket         = "my-tf-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "tf-locks"   # 状态锁
    encrypt        = true          # 静态加密
  }
}
```

- 版本约束（保证可复现）：

```hcl
terraform {
  required_version = ">= 1.6"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
}
```

- 安全扫描与策略门禁：`tfsec .`、`checkov -d .`、`terrascan scan`；用 OPA/Sentinel 做 policy-as-code，配 pre-commit 钩子持续校验。
- state 运维：`terraform state mv/rm/import`、`terraform plan -refresh-only` 做漂移检测；变更前备份 state。

## 示例

- 「为三层 Web 应用设计可复用的 Terraform 模块，并配 Terratest 测试。」
- 「为多团队搭建带加密与加锁的安全远程 state。」
- 「搭建含安全扫描与审批流的 IaC CI/CD 流水线。」
- 「将现有 Terraform 代码库平滑迁移到 OpenTofu。」
- 「用策略即代码做合规与成本管控；排查 state 损坏并恢复。」

## 注意事项

- apply 前必须评审 plan；优先 `plan -out` 固定计划再 apply。
- state 文件视为关键基础设施：远程存储、加锁、加密、定期备份，绝不提交进仓库或泄露密钥。
- 敏感变量用 `sensitive = true` 与外部密钥管理，不要硬编码到代码或 state 暴露。
- 全程加 provider/module 版本约束以保证可复现；优先用 data source 而非硬编码值。
- 变量加 `validation` 及 precondition/postcondition；多环境保持一致性与隔离。
- 缺少必要输入、权限、安全边界或成功标准时，先停下来确认，再动手。

## 互见

- code-reviewer：对 IaC 变更与 plan 做评审。
- dependency-auditor：审查 provider/module 版本与依赖安全。

---

本条采编自 sickn33/antigravity-awesome-skills（MIT）。
