---
name: dotnet-backend-patterns
title: dotnet 后端开发模式
description: 当用 C#/.NET 开发 Web API、MCP 服务或企业级后端、评审 C# 代码或设计服务架构时使用；产出符合现代最佳实践的异步、依赖注入、EF Core/Dapper 数据访问、Redis 缓存与 xUnit 测试代码及架构方案；不适用于前端、非 .NET 技术栈或纯运维部署。触发词：C#、.NET、async/await、依赖注入、EF Core、Dapper、IOptions、Redis 缓存、xUnit
domain: 研发/backend
triggers: [C#, .NET, async/await, 依赖注入, EF Core, Dapper, IOptions, Redis 缓存, xUnit, Web API, MCP 服务, Result 模式]
tags: [dotnet, csharp, 后端, web-api, 依赖注入, ef-core, dapper, 缓存, redis, xunit, 异步编程, clean-architecture]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [EF Core, Dapper, Redis, xUnit, Moq, WebApplicationFactory, IMemoryCache, IDistributedCache]
requires: []
related: []
combines_with: []
license: MIT
source: wshobson/agents
source_license: MIT
---
## 何时使用

适用场景：

- 开发新的 .NET Web API 或 MCP 服务器
- 评审 C# 代码的质量与性能
- 用依赖注入设计服务架构
- 用 Redis 实现缓存策略、用 EF Core/Dapper 优化数据访问
- 用 IOptions 模式配置应用
- 编写单元测试与集成测试，处理错误与韧性

不该用的边界：

- 前端 / UI 开发，或非 .NET 技术栈（Java、Node、Go 等）
- 纯运维、部署、CI/CD 流水线（本技能聚焦应用层编码模式）
- 简单脚本或一次性小程序，无需引入分层与 DI 的场景

## 步骤

1. 按 Clean Architecture 分层落地项目结构，依赖单向指向 Domain。
2. 在 `ServiceCollectionExtensions` 集中注册服务，按生命周期选 Scoped/Singleton/Transient，配置走 Options 模式。
3. 业务方法全链路 `async/await` 并贯穿 `CancellationToken`；用 Result 模式替代异常做流程控制。
4. 数据访问：写复杂领域模型用 EF Core，读多/性能敏感用 Dapper；只读查询加 `AsNoTracking()`。
5. 缓存按 L1（内存）→ L2（Redis）→ L3（数据库）多级穿透，并实现失效与 stale-while-revalidate。
6. 用 xUnit + Moq 写业务单测，用 `WebApplicationFactory` 写 API 集成测试（替换为内存数据库/内存缓存）。

## 指令

项目结构（Clean Architecture，依赖单向）：

```
src/
├── Domain/          # 核心业务，无外部依赖（Entities/Interfaces/Exceptions/ValueObjects）
├── Application/     # 用例、DTO、校验（Services/DTOs/Validators/Interfaces）
├── Infrastructure/  # 外部实现（Data/Caching/External/DependencyInjection）
└── Api/             # 入口（Controllers 或 MinimalAPI、Middleware、Filters、Program.cs）
```

依赖注入（按生命周期 + Options + Keyed 服务，.NET 8+）：

```csharp
services.AddScoped<IProductService, ProductService>();          // 每请求一个实例
services.AddSingleton<ICacheService, RedisCacheService>();      // 应用生命周期单例
services.AddTransient<IValidator<CreateOrderRequest>, CreateOrderValidator>(); // 每次新建
services.Configure<CatalogOptions>(configuration.GetSection("Catalog"));        // 配置绑定

// Keyed 服务（.NET 8+），构造函数用 [FromKeyedServices("stripe")] 注入
services.AddKeyedScoped<IPaymentProcessor, StripeProcessor>("stripe");
services.AddKeyedScoped<IPaymentProcessor, PayPalProcessor>("paypal");
```

异步 —— 正确与错误对照：

```csharp
// 正确：全链路异步，库代码用 ConfigureAwait(false)，热路径 + 缓存用 ValueTask
public async Task<(Stock, Price)> GetStockAndPriceAsync(string id, CancellationToken ct = default)
{
    var stockTask = _stockService.GetAsync(id, ct);
    var priceTask = _priceService.GetAsync(id, ct);
    await Task.WhenAll(stockTask, priceTask);     // 并行用 WhenAll
    return (await stockTask, await priceTask);
}

// 错误：阻塞 async（死锁风险）；async void（异常丢失）；对已 async 代码套 Task.Run（浪费线程）
var r = GetProductAsync(id).Result;               // 绝不要
public async void ProcessOrder() { }              // 仅事件处理器例外
```

配置三种读取方式：`IOptions<T>`（单例，启动读一次）、`IOptionsSnapshot<T>`（Scoped，每请求重读）、`IOptionsMonitor<T>`（单例，变更通知，可 `OnChange`）。

Result 模式（替代异常做业务流程控制）：

```csharp
public class Result<T>
{
    public bool IsSuccess { get; }
    public T? Value { get; }
    public string? Error { get; }
    public string? ErrorCode { get; }
    public static Result<T> Success(T v) => new(true, v, null, null);
    public static Result<T> Failure(string e, string? code = null) => new(false, default, e, code);
    // 含 Map / MapAsync 链式转换
}
// 端点侧：result.IsSuccess ? Results.Created(...) : Results.BadRequest(new { error, code })
```

## 示例

EF Core 仓储（只读加 `AsNoTracking()`，实体配置走 `IEntityTypeConfiguration<T>`，分页 Skip/Take）：

```csharp
public async Task<Product?> GetByIdAsync(string id, CancellationToken ct = default)
    => await _context.Products.AsNoTracking()
        .FirstOrDefaultAsync(p => p.Id == id, ct);
// OnModelCreating 中：ApplyConfigurationsFromAssembly + 全局查询过滤 HasQueryFilter(p => !p.IsDeleted)
```

Dapper（读多/性能敏感，参数化 + `DynamicParameters` 动态拼接，多映射 `splitOn`）：

```csharp
const string sql = """
    SELECT Id, Name, Sku, Price, CategoryId, Stock, CreatedAt
    FROM Products WHERE Id = @Id AND IsDeleted = 0
    """;
return await _connection.QueryFirstOrDefaultAsync<Product>(
    new CommandDefinition(sql, new { Id = id }, cancellationToken: ct));
// 分页：ORDER BY Name OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY
```

多级缓存（L1 内存 → L2 Redis → L3 库，回填 + 失效）：

```csharp
if (_memoryCache.TryGetValue(cacheKey, out Product? cached)) return cached;     // L1
var distributed = await _distributedCache.GetStringAsync(cacheKey, ct);          // L2
// 命中则反序列化并回填 L1；都未命中查库后回填 L1+L2
// 失效：_memoryCache.Remove(key); await _distributedCache.RemoveAsync(key, ct);
```

测试（xUnit + Moq 业务单测；`[Theory]/[InlineData]` 参数化；集成测试用 `WebApplicationFactory` 替换内存库/内存缓存）：

```csharp
[Fact]
public async Task CreateOrderAsync_WithInsufficientStock_ReturnsFailure()
{
    _mockStockService.Setup(s => s.CheckAsync(...))
        .ReturnsAsync(new StockResult { IsAvailable = false, Available = 5 });
    var result = await _sut.CreateOrderAsync(request);
    Assert.False(result.IsSuccess);
    Assert.Equal("INSUFFICIENT_STOCK", result.ErrorCode);
    _mockRepository.Verify(r => r.CreateAsync(It.IsAny<Order>(), It.IsAny<CancellationToken>()), Times.Never);
}
```

## 注意事项

应当（DO）：

- 全链路 `async/await`，所有异步方法带 `CancellationToken`
- 构造函数注入依赖；用 `IOptions<T>` 做强类型配置
- 业务逻辑返回 Result 而非抛异常；DTO 用 record 类型
- 读多场景优先 Dapper，复杂领域模型用 EF Core；激进缓存 + 合理失效

不应当（DON'T）：

- 不要用 `.Result` / `.Wait()` 阻塞异步；不要用 `async void`（事件处理器除外）
- 不要直接暴露 EF 实体（用 DTO）；只读查询别忘 `AsNoTracking()`
- 不要硬编码配置；不要手动 `new HttpClient()`（用 `IHttpClientFactory`）
- 不要在 API 边界跳过校验；不要吞掉泛型 `Exception`（重抛或记录）

常见陷阱：

- N+1 查询 → 用 `.Include()` 或显式 join
- 死锁 → 别混用同步/异步，库代码用 `ConfigureAwait(false)`
- 过度取数 → 投影只选需要的列
- 缺索引 → 看执行计划，为常用过滤加索引
- 缓存击穿（Cache Stampede）→ 缓存填充用分布式锁
- 内存泄漏 → `using` 释放 `IDisposable`；HTTP 客户端配置合理超时

## 互见

- 数据库索引设计与查询计划优化
- Redis 分布式缓存与分布式锁
- xUnit / 集成测试与测试替身（Mock/Stub）
- MCP 服务器开发模式

---

采编自 wshobson/agents（MIT 许可证）。
