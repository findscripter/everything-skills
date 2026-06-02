---
name: terraform-module-builder
title: Terraform可复用模块构建
description: 当需要为 AWS/Azure/GCP/OCI 编写可复用、可测试的 Terraform 模块或统一团队 IaC 规范时使用；产出标准目录结构（main/variables/outputs/versions.tf + examples + tests）、带 validation 的输入校验、可组合的 outputs 与 Terratest 用例；不适用于一次性手写 HCL、纯命令式部署脚本或非 Terraform 的 IaC（如 CloudFormation/Pulumi）。触发词：terraform 模块、terraform module、可复用模块、IaC、infrastructure as code、模块化、terratest、provider 版本锁定、模块组合
domain: 平台/cloud
triggers: [terraform 模块, terraform module, 可复用模块, IaC, infrastructure as code, 模块化, terratest, provider 版本锁定, 模块组合]
tags: [terraform, iac, cloud, aws, azure, gcp, oci, module, terratest, hcl]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [terraform, terratest, go]
requires: []
related: [terraform-specialist, aws-cdk-patterns, cloudformation-best-practices, helm-chart-scaffolding]
combines_with: [terraform-specialist, github-actions-author, multi-cloud-architecture]
license: MIT
source: wshobson/agents
source_license: MIT
---
## 何时使用

- 需要把云资源（VPC、子网、数据库、存储、K8s 集群等）封装成可复用、可版本化的 Terraform 模块。
- 统一团队/组织的 IaC 规范，标准化资源命名、打标签、输入校验。
- 构建跨云（AWS/Azure/GCP/OCI）兼容的模块库供多项目消费。

不该用：

- 一次性、随手写的 HCL 配置，没有复用诉求时直接写根模块即可，无需抽象。
- 命令式部署脚本，或需要 CloudFormation/Pulumi/ARM 等非 Terraform IaC 工具的场景。

## 步骤

1. 规划模块库目录：按 `云厂商/资源类型` 分层，如 `aws/vpc`、`azure/aks`、`gcp/gke`、`oci/oke`。
2. 每个模块遵循标准布局（见示例），至少包含 main/variables/outputs/versions.tf、README、examples/ 与 tests/。
3. 在 `variables.tf` 为每个输入写 description、type，并对关键输入加 `validation` 块。
4. 在 `outputs.tf` 暴露下游模块需要的属性（如 `vpc_id`、`private_subnet_ids`），支撑模块组合。
5. 在 `versions.tf` 锁定 provider 版本；用 `locals` 收敛计算值，用 `count`/`for_each` 实现条件资源。
6. 在 `examples/complete/` 提供完整用例，并用 Terratest 编写 `tests/*_test.go` 做 apply/destroy 验证。

## 指令

- 命名一致：所有资源统一 `name` 前缀 + `merge(local_tags, var.tags)` 打标签。
- 条件资源：`count = var.create_internet_gateway ? 1 : 0`；多实例用 `for_each`。
- 输入校验示例（CIDR）：`condition = can(regex("^([0-9]{1,3}\\.){3}[0-9]{1,3}/[0-9]{1,2}$", var.cidr_block))`。
- 模块语义化版本（SemVer）发布，调用方通过 `source` + 版本号固定依赖。
- 运行测试：`terraform.InitAndApply` 后断言 output，`defer terraform.Destroy` 清理。

## 示例

标准模块布局：

```
module-name/
├── main.tf          # 主资源
├── variables.tf     # 输入变量（带 validation）
├── outputs.tf       # 输出值（供组合）
├── versions.tf      # provider 版本锁定
├── README.md        # 文档
├── examples/complete/   # 完整用例
└── tests/module_test.go # Terratest
```

带校验的输入变量（variables.tf）：

```hcl
variable "cidr_block" {
  description = "CIDR block for VPC"
  type        = string
  validation {
    condition     = can(regex("^([0-9]{1,3}\\.){3}[0-9]{1,3}/[0-9]{1,2}$", var.cidr_block))
    error_message = "CIDR block must be valid IPv4 CIDR notation."
  }
}
```

主资源与统一打标签（main.tf）：

```hcl
resource "aws_vpc" "main" {
  cidr_block           = var.cidr_block
  enable_dns_hostnames = var.enable_dns_hostnames
  tags = merge({ Name = var.name }, var.tags)
}

resource "aws_internet_gateway" "main" {
  count  = var.create_internet_gateway ? 1 : 0
  vpc_id = aws_vpc.main.id
}
```

模块组合（根模块串接 VPC 与 RDS）：

```hcl
module "vpc" {
  source             = "../../modules/aws/vpc"
  name               = "production"
  cidr_block         = "10.0.0.0/16"
  availability_zones = ["us-west-2a", "us-west-2b", "us-west-2c"]
}

module "rds" {
  source     = "../../modules/aws/rds"
  identifier = "production-db"
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnet_ids
}
```

Terratest 验证（tests/vpc_test.go）：

```go
func TestVPCModule(t *testing.T) {
    opts := &terraform.Options{ TerraformDir: "../examples/complete" }
    defer terraform.Destroy(t, opts)
    terraform.InitAndApply(t, opts)
    assert.NotEmpty(t, terraform.Output(t, opts, "vpc_id"))
}
```

## 注意事项

- 模块用语义化版本发布，避免调用方因上游变更被破坏。
- 所有变量必须有 description；所有重要属性必须 output，否则无法组合。
- 在 versions.tf 中固定 provider 版本，防止 plan 漂移。
- 用 validation 在 plan 阶段就拦截非法输入，而非等到 apply 失败。
- 所有资源一致打标签（Environment、ManagedBy 等），便于成本归集与治理。
- 模块至少跑通一个 examples/complete + Terratest，再对外发布。

## 互见

- 跨云架构选型与成本权衡，结合各厂商资源能力综合决策。
- 模块发布前可配合代码评审与依赖审计，检查 HCL 质量与 provider/版本风险。

本条采编自 wshobson/agents（MIT）。
