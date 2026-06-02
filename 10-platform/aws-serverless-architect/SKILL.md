---
name: aws-serverless-architect
title: AWS无服务器架构设计
description: 当为初创团队设计 AWS 架构、生成 IaC 模板、优化云成本或上 AWS 时使用；做需求收集→选型→生成 CloudFormation/CDK/Terraform 模板→成本核算→部署校验，产出可落地架构方案与基础设施代码；不适用于非 AWS 云、纯应用代码或细粒度 IAM 安全审计。触发词：无服务器架构、CloudFormation、AWS成本优化
domain: 平台/cloud
triggers: [设计无服务器架构, 生成CloudFormation模板, AWS成本优化, 搭建AWS CI/CD, 迁移到AWS, Lambda API Gateway DynamoDB选型, 三层架构 ECS Fargate Aurora, CDK Terraform IaC生成]
tags: [AWS, serverless, 云架构, IaC, CloudFormation, 成本优化, Lambda, DynamoDB]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [CloudFormation/SAM, AWS CDK, Terraform, AWS CLI, CloudWatch]
requires: []
related: [aws-serverless-builder, gcp-cloud-architect, azure-cloud-architect, aws-cdk-patterns]
combines_with: [terraform-specialist, aws-cost-optimizer, github-actions-author]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

适用场景：

- 为初创/中小团队设计可扩展、低成本的 AWS 架构，优先无服务器模式。
- 生成 IaC 模板（CloudFormation/SAM、CDK TypeScript、Terraform HCL）。
- 核算并优化 AWS 月度成本，搭建 CI/CD，或将既有系统迁移到 AWS。
- 覆盖 Lambda、API Gateway、DynamoDB、ECS、Aurora 等服务选型。

不该用的边界：

- 非 AWS 云（GCP/Azure/阿里云）的架构设计。
- 仅写应用业务代码、不涉及基础设施。
- 深度安全合规审计或细粒度 IAM 策略评审（本技能仅给最小权限基线）。

## 步骤

1. 收集需求：应用类型（Web/移动后端/数据管道/SaaS）、用户量与 RPS、月度预算、团队规模与 AWS 经验、合规要求（GDPR/HIPAA/SOC 2）、可用性目标（SLA、RPO/RTO）。整理为 requirements.json。
2. 设计架构并选型，从下列模式中匹配：
   - 无服务器 Web：S3 + CloudFront + API Gateway + Lambda + DynamoDB + Cognito（约 $35/月）。
   - 事件驱动微服务：EventBridge + Lambda + SQS + Step Functions。
   - 三层架构：ALB + ECS Fargate + Aurora + ElastiCache。
   - GraphQL 后端：AppSync + Lambda + DynamoDB + Cognito。
   校验点：确认所选模式与团队运维成熟度、合规要求匹配后再继续。
3. 生成 IaC 模板（无服务器优先用 SAM/CloudFormation，三层用 CDK，需多云用 Terraform）。
4. 核算成本：输出按服务的月度明细、右调（right-sizing）建议、Savings Plans 机会、潜在节省额，并标注优先级（高/中/低）。
5. 部署。
6. 校验与失败处理：检查栈状态、配置 CloudWatch 告警；失败时定位原因→改模板→删除失败栈→重建。

## 指令

部署前先校验模板，避免无效语法导致建栈失败：

```bash
aws cloudformation validate-template --template-body file://template.yaml
```

部署三种方式：

```bash
# CloudFormation（注意 --capabilities，否则 IAM 资源会被拒）
aws cloudformation create-stack \
  --stack-name my-app-stack \
  --template-body file://template.yaml \
  --capabilities CAPABILITY_IAM

# CDK
cdk deploy

# Terraform
terraform init && terraform apply
```

校验与监控：

```bash
aws cloudformation describe-stacks --stack-name my-app-stack
aws cloudwatch put-metric-alarm --alarm-name high-errors ...
```

建栈失败时排障：

```bash
# 查 CREATE_FAILED 的事件
aws cloudformation describe-stack-events \
  --stack-name my-app-stack \
  --query 'StackEvents[?ResourceStatus==`CREATE_FAILED`]'
# 删除失败栈后再重建
aws cloudformation delete-stack --stack-name my-app-stack
aws cloudformation wait stack-delete-complete --stack-name my-app-stack
```

## 示例

需求 JSON 输入：

```json
{
  "application_type": "saas_platform",
  "expected_users": 10000,
  "requests_per_second": 100,
  "budget_monthly_usd": 500,
  "team_size": 3,
  "aws_experience": "intermediate",
  "compliance": ["SOC2"],
  "availability_sla": "99.9%"
}
```

无服务器核心资源（SAM/CloudFormation YAML，DynamoDB 用按量计费、Lambda 走最小权限）：

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Resources:
  ApiFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: index.handler
      Runtime: nodejs20.x
      MemorySize: 512
      Timeout: 30
      Environment:
        Variables:
          TABLE_NAME: !Ref DataTable
      Policies:
        - DynamoDBCrudPolicy:
            TableName: !Ref DataTable
      Events:
        ApiEvent:
          Type: Api
          Properties:
            Path: /{proxy+}
            Method: ANY
  DataTable:
    Type: AWS::DynamoDB::Table
    Properties:
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - { AttributeName: pk, AttributeType: S }
        - { AttributeName: sk, AttributeType: S }
      KeySchema:
        - { AttributeName: pk, KeyType: HASH }
        - { AttributeName: sk, KeyType: RANGE }
```

三层架构 CDK 片段（Aurora Serverless 自动伸缩 0.5~4 ACU）：

```typescript
const vpc = new ec2.Vpc(this, 'AppVpc', { maxAzs: 2 });
const cluster = new ecs.Cluster(this, 'AppCluster', { vpc });
const db = new rds.ServerlessCluster(this, 'AppDb', {
  engine: rds.DatabaseClusterEngine.auroraPostgres({
    version: rds.AuroraPostgresEngineVersion.VER_15_2,
  }),
  vpc,
  scaling: { minCapacity: 0.5, maxCapacity: 4 },
});
```

成本优化输出示例（$2000/月 → 可省 $815）：右调 RDS（db.r5.2xlarge→db.r5.large 省 $420）、购买 1 年 Compute Savings Plan（省 $310）、S3 超 90 天对象转 Glacier Instant Retrieval（省 $85）。

## 注意事项

- 无服务器的取舍：优点是低运维、按量付费、自动扩缩；缺点是冷启动、Lambda 单次最长 15 分钟、DynamoDB 最终一致性。
- IAM 报错：核对 `--capabilities CAPABILITY_IAM` 与角色信任策略。
- 资源配额超限：通过 Service Quotas 控制台申请提额。
- 部署前务必跑 `validate-template`；失败栈处于 ROLLBACK_COMPLETE 时无法更新，需先删除再建。
- DynamoDB 设计为单表 pk/sk，避免多表 join；高基数查询用 GSI。
- 成本建议按优先级（高/中/低）落地，先做高优先级右调与 Savings Plans。

## 互见

- 架构模式详解（6 种：无服务器、微服务、三层、数据处理、GraphQL、多区域）。
- 服务选型决策矩阵（计算/数据库/存储/消息）。
- 最佳实践（无服务器设计、成本优化、安全加固、可扩展性）。

---

采编自 alirezarezvani/claude-skills（MIT）。
