---
name: aws-cdk-patterns
title: AWS CDK 构造与基础设施模式
description: 当用 TypeScript/Python/Java 编写 AWS CDK 基础设施、设计可复用 L2/L3 构造或多 Stack 应用、评审 CDK 最佳实践时使用；做出有状态/无状态分离、最小权限 IAM、默认监控的生产级 CDK 栈与构造产物；不适用于纯 CloudFormation 模板、Terraform 或一次性 CLI 建资源。触发词：CDK、construct、Stack、Lambda+DynamoDB API
domain: 研发/devops
triggers: [AWS CDK, CDK 构造, L2 L3 construct, 可复用 CDK 模式, 多 Stack 应用, serverless API Lambda DynamoDB, ECS 服务栈, CDK 评审最佳实践, RemovalPolicy 标签, cdk diff 部署]
tags: [aws-cdk, iac, infrastructure, aws, typescript, serverless, construct, 研发]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [aws-cdk, cdk-cli, TypeScript, Python, Java]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 编写可复用的 CDK 构造或模式（L2/L3 construct）。
- 设计多 Stack 的 CDK 应用并管理跨栈引用。
- 落地常见基础设施模式：API + Lambda + DynamoDB、ECS 服务、静态站点、数据管道。
- 按最佳实践与反模式评审已有 CDK 代码。

不该用（负边界）：
- 用户要的是纯 CloudFormation 模板，不经过 CDK。
- 任务是 Terraform 专属的。
- 一次性、简单的 CLI 建资源就够了，无需写代码。

## 步骤 / 指令

1. 先识别目标基础设施模式（如无服务器 API、容器服务、数据管道），再选构造。
2. 优先用 L2 构造，避免 L1（`Cfn*`）——L2 自带更安全的默认值；仅当 L2 无对应能力时才下沉到 L1。
3. 所有 IAM 角色与策略遵循最小权限原则，优先用 `grantXxx()`（如 `table.grantReadWriteData(handler)`）而非手写宽泛策略。
4. 为生产就绪合理设置 `RemovalPolicy`（有状态资源用 `RETAIN`）和统一标签 `cdk.Tags.of(this).add(...)`。
5. 按可复用性拆分 Stack：有状态资源（数据库、桶）与无状态资源（计算、API）分栈，便于独立生命周期管理。
6. 默认开启监控：CloudWatch 告警、X-Ray 追踪（`tracing: lambda.Tracing.ACTIVE`）。
7. 每次部署前先 `cdk diff` 核对变更。
8. 不要硬编码账号/区域，用 `cdk.Aws.ACCOUNT_ID`、`cdk.Aws.REGION` 等占位符。

## 示例

无服务器 API 模式（API Gateway + Lambda + DynamoDB），封装为可复用 L3 构造：

```typescript
import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export class ServerlessApiPattern extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const table = new dynamodb.Table(this, "Table", {
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN, // 有状态资源保留，防误删
    });

    const handler = new lambda.Function(this, "Handler", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("lambda"),
      environment: { TABLE_NAME: table.tableName },
      tracing: lambda.Tracing.ACTIVE, // 默认开启 X-Ray
    });

    table.grantReadWriteData(handler); // 最小权限授予

    new apigateway.LambdaRestApi(this, "Api", { handler });
  }
}
```

## 注意事项

- 该做：用 `cdk.Tags.of(this).add()` 做一致标签；有状态与无状态资源分栈；每次部署前 `cdk diff`。
- 别做：在有 L2 替代时仍用 L1（`Cfn*`）构造；硬编码账号 ID 或区域（改用 `cdk.Aws.ACCOUNT_ID`）。
- 排障——栈间循环依赖：把共享资源抽到独立的基础（base）栈，通过构造函数 props 传递引用，打破环。
- 边界：本技能产出不能替代环境特定的验证、测试与专家评审；缺少必要输入、权限、安全边界或验收标准时，先停下来澄清。

## 互见

- 纯 CloudFormation / Terraform 等其他 IaC 工具：另寻对应技能。
- IAM 最小权限、CloudWatch 监控告警等专项可与本技能配合使用。

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
