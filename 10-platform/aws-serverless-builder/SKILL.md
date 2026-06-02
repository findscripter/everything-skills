---
name: aws-serverless-builder
title: AWS 无服务器应用构建
description: 当在 AWS 上构建生产级无服务器应用（Lambda、API Gateway、DynamoDB、SQS/SNS 事件驱动）时使用；产出 Handler 结构、SAM/CDK 模板、事件触发与冷启动优化的可执行方案；不适用于 GCP/Azure 无服务器、容器化部署或纯本地后端。触发词：Lambda、SAM、冷启动
domain: 平台/cloud
triggers: [AWS Lambda, SAM 部署, API Gateway, DynamoDB Streams, SQS 事件驱动, 冷启动优化, SnapStart, CDK 无服务器, serverless]
tags: [aws, serverless, lambda, sam, cdk, api-gateway, dynamodb, sqs, 平台/cloud]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [SAM CLI, AWS CDK, AWS SDK v3, boto3, CloudWatch]
requires: []
related: [aws-serverless-architect, gcp-cloud-run, aws-cdk-patterns, cloudflare-workers-edge]
combines_with: [aws-serverless-architect, terraform-specialist, rest-api-endpoint-builder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：在 AWS 上构建生产级无服务器应用，包括 Lambda 函数实现、API Gateway（HTTP/REST）后端、DynamoDB 数据访问、SQS/SNS/DynamoDB Streams 等事件驱动处理，以及 SAM/CDK 部署与冷启动优化。

不该用（负边界）：
- GCP（改用 Cloud Run / Cloud Functions）、Azure（改用 Azure Functions / Logic Apps）。
- 容器化或长驻后端、非事件触发的常规服务。
- 复杂编排（Step Functions / EventBridge）、认证（Cognito 授权器）、RDS 表结构设计——这些应委派给对应专项技能。
- 不替代针对具体环境的验证、测试与专家评审；缺少输入、权限或成功标准时先停下来澄清。

核心原则：先测量再优化内存与超时；对延迟敏感负载压低冷启动；Java/.NET 用 SnapStart；简单场景优先 HTTP API 而非 REST API；用 DLQ + 重试为失败设计；部署包尽量小；配置走环境变量；结构化日志带 correlation/request ID。

## 步骤

1. 选 IaC：简单/标准用 SAM（YAML），复杂可复用构造或偏好编程语言用 CDK（TypeScript）。
2. 写 Handler：客户端在 handler 外初始化（跨热调用复用）；统一 try/catch；返回 API Gateway 兼容响应；Node.js 设 `context.callbackWaitsForEmptyEventLoop = false`。
3. 选 API 类型：多数 REST 场景用 HTTP API（更低延迟约 10ms、便宜 50-70%）；需要缓存、请求校验、WAF、Usage Plan/API Key 时才用 REST API。
4. 事件驱动：异步解耦用 SQS 触发，配 DLQ + `ReportBatchItemFailures` 局部失败重试；对数据变更实时反应用 DynamoDB Streams。
5. 优化冷启动（按收益排序）：缩包 → SnapStart（Java/.NET）→ 加内存提速初始化 → 延迟重依赖加载 → 预置并发（最后手段）。
6. 本地开发：`sam build` → `sam local start-api` / `sam local invoke` 调试，再 `sam deploy --guided`。
7. 上线前过校验清单（见注意事项）。

## 指令

```bash
# 安装与初始化
pip install aws-sam-cli
sam init --runtime nodejs20.x --name my-api
# 构建 / 本地运行 / 单函数调用
sam build
sam local start-api
sam local invoke GetItemFunction --event events/get.json
sam local invoke --debug-port 5858 GetItemFunction   # Node.js 调试
sam deploy --guided

# CDK
npm install -g aws-cdk
cdk init app --language typescript
cdk synth   # 生成 CloudFormation
cdk diff    # 查看变更
cdk deploy  # 部署
```

## 示例

Node.js Handler（客户端外置 + 统一错误处理）：

```javascript
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');
const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const result = await docClient.send(new GetCommand({
      TableName: process.env.TABLE_NAME, Key: { id: body.id }
    }));
    return { statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(result.Item) };
  } catch (error) {
    console.error(JSON.stringify({ error: error.message, requestId: context.awsRequestId }));
    return { statusCode: error.statusCode || 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message || 'Internal server error' }) };
  }
};
```

SAM 模板（HTTP API + Lambda + DynamoDB，最小权限策略）：

```yaml
Transform: AWS::Serverless-2016-10-31
Globals:
  Function:
    Runtime: nodejs20.x
    Timeout: 30
    MemorySize: 256
    Environment: { Variables: { TABLE_NAME: !Ref ItemsTable } }
Resources:
  HttpApi:
    Type: AWS::Serverless::HttpApi
    Properties: { StageName: prod }
  GetItemFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: src/handlers/get.handler
      Events:
        GetItem: { Type: HttpApi, Properties: { ApiId: !Ref HttpApi, Path: /items/{id}, Method: GET } }
      Policies: [ DynamoDBReadPolicy: { TableName: !Ref ItemsTable } ]
  ItemsTable:
    Type: AWS::DynamoDB::Table
    Properties:
      AttributeDefinitions: [ { AttributeName: id, AttributeType: S } ]
      KeySchema: [ { AttributeName: id, KeyType: HASH } ]
      BillingMode: PAY_PER_REQUEST
```

SQS 触发 + 局部批失败：`VisibilityTimeout` 设为 Lambda 超时的 6 倍，配 `RedrivePolicy`（`maxReceiveCount: 3`）指向 DLQ，函数事件加 `FunctionResponseTypes: [ReportBatchItemFailures]`，handler 返回 `{ batchItemFailures: [{ itemIdentifier: record.messageId }] }`。

DynamoDB Streams：`StreamViewType: NEW_AND_OLD_IMAGES`，按 `eventName`（INSERT/MODIFY/REMOVE）分发，用 `@aws-sdk/util-dynamodb` 的 `unmarshall` 解析。

## 注意事项

锋利边缘（高危）：
- INIT 阶段已计费（2025-08 起）：冷启动初始化按时长计费，账单可能涨 10-50%。查 CloudWatch 的 `INIT_REPORT Init Duration`，靠缩包、懒加载重依赖、SDK v3 模块化导入、SnapStart 降低。
- 超时配置：默认仅 3 秒、上限 15 分钟（900s）。设为预期时长 + 缓冲；用 `context.getRemainingTimeInMillis()` 感知剩余时间优雅退出；给所有下游 HTTP 调用设 `timeout`。
- OOM 崩溃：超内存被强杀且不抛可捕获异常。大文件改用流式处理（`for await (const chunk of stream)`），按需加 `MemorySize`（128-10240，更多内存=更多 CPU），用 Lambda Power Tuning 找最优值。
- 递归/无限触发：S3 写回同桶、DynamoDB 触发更新同表会导致费用失控。用不同桶/前缀（如 `processed/`）+ 幂等检查，设 `ReservedConcurrentExecutions` 作熔断，配 CloudWatch 调用次数告警。

中危：
- VPC 冷启动延迟：仅在需访问 VPC 内 RDS/ElastiCache/私有资源时才挂 VPC；多 AZ 子网，AWS 服务走 VPC Gateway Endpoint（DynamoDB/S3）避开 NAT。
- Node.js 事件循环未清空导致跑满超时：设 `callbackWaitsForEmptyEventLoop = false`，并显式关闭数据库连接（`finally { await connection.end() }`）。
- API Gateway 负载上限：REST/HTTP API 请求响应均 10MB，Lambda 同步响应 6MB、异步 256KB。大文件用 S3 预签名 URL（`getSignedUrl`）上传/下载，而非穿透网关。

校验清单（部署前自检）：
- ERROR：禁止硬编码 AWS Access Key / Secret Key，用 IAM 角色或 Secrets Manager。
- WARNING：避免通配符 IAM 权限（最小权限）；handler 必须有 try/catch；异步函数配 DLQ；用 SDK v3 模块化导入而非整包 v2；表名走环境变量。
- INFO：Node.js 设 `callbackWaitsForEmptyEventLoop=false`；默认 128MB 内存常偏低；1-3 秒超时对外部调用偏短。

## 互见

- GCP 无服务器 → gcp-cloud-run（容器用 Cloud Run，事件用 Cloud Functions）
- Azure 无服务器 → azure-functions（Azure Functions、Logic Apps）
- 数据库设计 → postgres-wizard（RDS 设计）
- 认证授权 → auth-specialist（Cognito、API Gateway 授权器）
- 复杂工作流 → workflow-automation（Step Functions、EventBridge）
- AI 集成 → llm-architect（Lambda 调用 Bedrock 或外部 LLM）

---
采编自 sickn33/antigravity-awesome-skills（MIT）。原 skill 标注上游来源为 vibeship-spawner-skills（Apache 2.0）。
