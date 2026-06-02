---
name: azure-functions-serverless
title: Azure Functions 无服务器开发
description: 当在 Azure 上构建生产级 Functions 无服务器应用（隔离工作进程 .NET / Node.js v4 / Python v2、HTTP/队列/定时/Blob 触发、Durable Functions 编排、冷启动优化）时使用；产出函数模板、host.json/部署配置与锋利边缘规避方案；不适用于 AWS Lambda、GCP 无服务器或容器化长驻服务。触发词：Azure Functions、Durable Functions、function app
domain: 平台/cloud
triggers: [Azure Functions, Durable Functions, azure serverless, function app, 隔离工作进程, isolated worker, 冷启动优化, 队列触发, HTTP 230 秒超时]
tags: [azure, serverless, azure-functions, durable-functions, isolated-worker, cold-start, dotnet, nodejs, python, 平台/cloud]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Azure Functions Core Tools (func), Azure CLI (az), .NET 8/9, @azure/functions v4, azure-functions Python, Application Insights]
requires: []
related: [azure-cloud-architect, aws-serverless-architect, azure-container-apps-deploy, gcp-cloud-run]
combines_with: [terraform-specialist, ci-cd-pipeline-builder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：在 Azure 上构建生产级 Functions 无服务器应用，包括 .NET 隔离工作进程模型、Node.js v4 与 Python v2 编程模型、HTTP/队列/定时/Blob 触发器、Durable Functions 编排（函数链 / 扇出扇入 / 长任务异步模式），以及冷启动优化、host.json/扩展包配置与上线前的锋利边缘规避。

不该用（负边界）：
- AWS（改用 aws-serverless-builder：Lambda/SAM/CDK）、GCP（改用 gcp-cloud-run：Cloud Run / Cloud Functions）。
- 容器化或长驻后端、非事件触发的常规服务。
- 数据建模（Azure SQL / Cosmos DB）、认证（Azure AD / Easy Auth / 托管标识）、复杂业务编排（Logic Apps / Power Automate）——委派给对应专项技能。
- 不替代针对具体环境的验证、测试与专家评审；缺输入/权限/成功标准时先停下澄清。

核心原则：.NET 新项目一律用隔离工作进程（in-process 2026-11-10 停止支持）；客户端用 DI/静态单例复用、绝不在请求内 new HttpClient；全程 async/await，禁止 `.Result`/`.Wait()`/`Thread.Sleep`；连接串/密钥走 App Settings 或 Key Vault；长任务用 Durable Functions 或队列异步而非死等 HTTP。

## 步骤

1. 选编程模型：.NET 用隔离工作进程（`Program.cs` + `HostBuilder` + `[Function]`）；Node.js 用 v4（`app.http(...)` 代码注册、无 function.json）；Python 用 v2（`@app.route` 装饰器、强制 Linux 托管、始终隔离进程）。
2. 写触发器函数：构造注入 `ILogger<T>` 与服务；统一 try/catch；HTTP 用 `HttpRequestData`/`HttpResponseData`。
3. 装扩展：优先 host.json 扩展包（extensionBundle `[4.*, 5.0.0)`）；隔离工作进程需显式 NuGet `Microsoft.Azure.Functions.Worker.Extensions.*`，否则触发器静默不工作。
4. 长任务用 Durable Functions：函数链（顺序+自动重试+状态持久化）、扇出扇入（`Task.WhenAll`）；HTTP 起任务后 `CreateCheckStatusResponse` 立即返回状态轮询 URL。
5. 队列处理：`[QueueTrigger]` 失败抛异常触发重试（默认 maxDequeueCount=5）后进毒消息队列 `<queue>-poison`；可加 poison 队列函数告警。
6. 优化冷启动：缩包 → 升 Premium 预热实例 + WarmupTrigger 预初始化重资源 → DI 静态单例 → 从包部署（zip）。
7. 本地开发：`func host start --verbose` 确认「Found the following functions」；过校验清单（见注意事项）再部署。

## 指令

```bash
# 创建隔离工作进程 .NET 项目
func init MyFunctionApp --worker-runtime dotnet-isolated
dotnet new func --name MyFunctionApp --framework net8.0

# 本地运行（--verbose 看是否识别到函数）
func host start --verbose

# 从包部署（可降冷启动）
az functionapp deployment source config-zip \
  --resource-group myRg --name myFunctionApp \
  --src myapp.zip --build-remote true

# Premium 预热/常驻实例（消除扩容冷启动）
az functionapp config set --name <app> --resource-group <rg> \
  --prewarmed-instance-count 3
az functionapp config set --name <app> --resource-group <rg> \
  --minimum-elastic-instance-count 2
```

## 示例

.NET 隔离工作进程 HTTP 触发（DI + 统一错误处理）：

```csharp
// Program.cs
var host = new HostBuilder()
    .ConfigureFunctionsWorkerDefaults()
    .ConfigureServices(services =>
    {
        services.AddApplicationInsightsTelemetryWorkerService();
        services.ConfigureFunctionsApplicationInsights();
        services.AddHttpClient();                    // 防 socket 耗尽
        services.AddSingleton<IMyService, MyService>();
    })
    .Build();
host.Run();

// HttpTriggerFunction.cs
public class HttpTriggerFunction(ILogger<HttpTriggerFunction> logger, IMyService service)
{
    [Function("HttpTrigger")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Function, "get", "post")] HttpRequestData req)
    {
        try {
            var result = await service.ProcessAsync(req);
            var resp = req.CreateResponse(HttpStatusCode.OK);
            await resp.WriteAsJsonAsync(result);
            return resp;
        } catch (Exception ex) {
            logger.LogError(ex, "Error processing request");
            var resp = req.CreateResponse(HttpStatusCode.InternalServerError);
            await resp.WriteAsJsonAsync(new { error = "Internal server error" });
            return resp;
        }
    }
}
```

Node.js v4（代码注册触发器，无 function.json）：

```typescript
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
export async function httpTrigger(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const name = request.query.get("name") || (await request.text()) || "world";
  return { status: 200, jsonBody: { message: `Hello, ${name}!` } };
}
app.http("httpTrigger", { methods: ["GET", "POST"], authLevel: "function", handler: httpTrigger });
app.timer("timerTrigger", { schedule: "0 */5 * * * *", handler: async (_t, c) => c.log("tick") });
```

Python v2（装饰器，强制 Linux 托管）：

```python
import azure.functions as func
app = func.FunctionApp(http_auth_level=func.AuthLevel.FUNCTION)

@app.route(route="hello", methods=["GET", "POST"])
async def http_trigger(req: func.HttpRequest) -> func.HttpResponse:
    name = req.params.get("name") or "World"
    return func.HttpResponse(json.dumps({"message": f"Hello, {name}!"}), mimetype="application/json")

@app.queue_trigger(arg_name="msg", queue_name="myqueue", connection="AzureWebJobsStorage")
def queue_trigger(msg: func.QueueMessage) -> None:
    logging.info(msg.get_body().decode("utf-8"))
```

Durable Functions——函数链 + 长任务异步：编排函数 `[OrchestrationTrigger] TaskOrchestrationContext` 内顺序 `await context.CallActivityAsync(...)`，状态自动持久化、瞬时失败自动重试、可跨进程重启存活；HTTP 起始函数注入 `[DurableClient] DurableTaskClient`，`ScheduleNewOrchestrationInstanceAsync` 后 `return client.CreateCheckStatusResponse(req, instanceId)` 立即返回，客户端轮询 `statusQueryGetUri`。扇出扇入：`var tasks = items.Select(i => context.CallActivityAsync<R>("Act", i)); var results = await Task.WhenAll(tasks);`。

队列触发毒消息（host.json 队列配置）：

```json
{ "version": "2.0", "extensions": { "queues": {
  "visibilityTimeout": "00:00:30", "batchSize": 16, "maxDequeueCount": 5 } } }
```

## 注意事项

锋利边缘（高危）：
- HTTP 硬性 230 秒超时（与计划无关）：Azure 负载均衡器固定 230s 空闲超时，host.json 的 functionTimeout 对 HTTP 无效，超时报 504 但函数仍在跑。长任务改用 Durable Functions 异步模式 / 队列异步 / Webhook 回调。
- HttpClient 实例化致 socket 耗尽：每请求 new HttpClient 会留 TIME_WAIT（约 240s）耗尽端口，本地正常生产崩。用 `IHttpClientFactory`（`services.AddHttpClient<T>`）或静态客户端；CosmosClient/BlobServiceClient/ServiceBusClient 同理用 DI/静态。
- 阻塞 async 致线程饥饿：`.Result`/`.Wait()`/`Thread.Sleep` 占住线程，高并发死锁。全程 `await` + `await Task.Delay(...)`；只在入口 `MainAsync().GetAwaiter().GetResult()`。
- in-process 模型 2026-11-10 停止支持：新项目用隔离工作进程；迁移要点：`FunctionName→Function`、`HttpRequest→HttpRequestData`、`IActionResult→HttpResponseData`、`ILogger` 改构造注入、补 `Program.cs`。

中危：
- 消费计划硬上限 10 分钟（默认 5）：超时悄无声息截断。host.json 配 `functionTimeout: 00:10:00`（消费计划上限），更长用 Premium（默认 30 分钟，可去除即无界）、Durable Functions 或队列分块。
- 隔离工作进程注入的 `ILogger<T>` 不输出日志：本地/App Insights 可能丢日志。`Program.cs` 配 `AddApplicationInsightsTelemetryWorkerService()` + `ConfigureFunctionsApplicationInsights()`；可靠起见用 `context.GetLogger<T>()`；本地查 local.settings.json 的 `APPLICATIONINSIGHTS_CONNECTION_STRING`。
- 缺扩展包致静默失败：「No job functions found」、绑定不生效。检查 host.json extensionBundle 或隔离工作进程的显式 NuGet `...Worker.Extensions.*`，`func host start --verbose` 确认识别。
- Premium 计划仍有冷启动：预热实例默认仅 1 个、快速扩容仍冷、且预热的是运行时不是你的代码。加 WarmupTrigger 预初始化、提高 `--prewarmed-instance-count`、用 `Lazy<T>`/连接池、必要时 `--minimum-elastic-instance-count`（常驻、最贵）。

校验清单（部署前自检）：
- ERROR：禁止硬编码连接串 / API Key（用 Key Vault 或 App Settings）；禁止 `.Result`/`.Wait()`/`Thread.Sleep`（用 await / Task.Delay）。
- WARNING：避免每请求 new HttpClient 或 `using` 包裹 HttpClient（用 IHttpClientFactory/静态）；隔离工作进程的 HttpTrigger 必须带 `[Function]` 属性；生产 Anonymous 授权级别需 APIM/其他鉴权兜底。
- INFO：仍用 in-process `FunctionName` 属性应考虑迁移隔离工作进程。

## 互见

- AWS 无服务器 → aws-serverless-builder（Lambda、API Gateway、SAM/CDK）
- GCP 无服务器 → gcp-cloud-run（容器用 Cloud Run、事件用 Cloud Functions）
- Azure 架构 → azure-cloud-architect（订阅/资源组/网络与整体云架构）
- 基础设施即代码 → terraform-specialist（用 Terraform 管理 Function App 资源）

---
采编自 sickn33/antigravity-awesome-skills（MIT）。原 skill 标注上游来源为 vibeship-spawner-skills（Apache 2.0）。
