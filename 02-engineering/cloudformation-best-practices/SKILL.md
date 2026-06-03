---
name: cloudformation-best-practices
title: CloudFormation 模板与嵌套栈实践
description: 当编写/审查 AWS CloudFormation 模板、设计嵌套或跨栈架构、排查栈创建更新失败与漂移时使用；产出可维护、可多环境复用的生产级模板与部署/校验命令；不适用于用户选用 CDK/Terraform 或纯应用代码的场景。触发词：CloudFormation、嵌套栈、漂移检测
domain: 研发/devops
triggers: [CloudFormation, CFN 模板, 嵌套栈, 跨栈引用, 漂移检测, cfn-lint, DeletionPolicy, UPDATE_ROLLBACK_FAILED, 多环境模板]
tags: [aws, cloudformation, iac, 基础设施即代码, 嵌套栈, devops, 研发]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [aws-cli, cfn-lint, cfn-nag]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 编写或审查 CloudFormation 模板（YAML/JSON）。
- 优化既有模板的可维护性与成本。
- 设计嵌套栈或跨栈（cross-stack）架构。
- 排查栈创建/更新失败与配置漂移（drift）。

不该用：

- 团队已选用 CDK 或 Terraform，不写原生 CloudFormation。
- 任务是应用代码而非基础设施。
- 缺少必需输入、权限、安全边界或成功标准时，先停下来澄清，不要硬写。

## 步骤

1. 优先用 YAML 而非 JSON，可读性更好。
2. 把环境相关值参数化（`Parameters`）；静态查表用 `Mappings`。
3. 有状态资源（RDS、S3、DynamoDB）加 `DeletionPolicy: Retain`，并配套 `UpdateReplacePolicy`。
4. 用 `Conditions` 支撑多环境模板（dev/staging/prod）。
5. 部署前用 `aws cloudformation validate-template` 校验。
6. 字符串拼接优先 `!Sub` 而非 `!Join`。
7. 跨栈引用用 `Outputs` + `Export`，被引用方再用 `Fn::ImportValue`。
8. 模板拆分：避免单一巨型模板，按职责拆成嵌套栈或独立栈。

## 指令

```bash
# 部署前校验模板语法
aws cloudformation validate-template --template-body file://template.yaml

# CI 中静态检查与安全扫描
cfn-lint template.yaml
cfn-nag_scan --input-path template.yaml

# 检测已部署栈的配置漂移
aws cloudformation detect-stack-drift --stack-name my-stack
```

## 示例

参数化 VPC 模板（多环境 + 跨栈导出）：

```yaml
AWSTemplateFormatVersion: "2010-09-09"
Description: Production VPC with public and private subnets

Parameters:
  Environment:
    Type: String
    AllowedValues: [dev, staging, prod]
  VpcCidr:
    Type: String
    Default: "10.0.0.0/16"

Conditions:
  IsProd: !Equals [!Ref Environment, prod]

Resources:
  VPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: !Ref VpcCidr
      EnableDnsSupport: true
      EnableDnsHostnames: true
      Tags:
        - Key: Name
          Value: !Sub "${Environment}-vpc"

Outputs:
  VpcId:
    Value: !Ref VPC
    Export:
      Name: !Sub "${Environment}-VpcId"
```

## 注意事项

- 不要硬编码 ARN、账号 ID 或区域；用 `!Sub` 配合伪参数（`${AWS::AccountId}`、`${AWS::Region}`）。
- 有状态资源务必同时设置 `DeletionPolicy` 与 `UpdateReplacePolicy`，避免误删/替换导致数据丢失。
- 在 CI 流水线中固化 `cfn-lint` 与 `cfn-nag`，把规范与安全检查左移。
- 栈卡在 `UPDATE_ROLLBACK_FAILED` 时：对失败资源用 `continue-update-rollback --resources-to-skip` 跳过，回滚成功后再修根因，不要直接重试。
- 输出不能替代环境内的校验、测试与专家评审，生产变更前务必在目标环境实测。

## 互见

- 跨栈/嵌套架构涉及的 IAM、网络分层等可与对应基础设施技能配合使用。
- 偏好声明式高阶抽象时，可对比 CDK / Terraform 相关技能再选型。

---

采编自 sickn33/antigravity-awesome-skills（MIT）。
