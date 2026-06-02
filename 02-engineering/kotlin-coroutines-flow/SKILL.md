---
name: kotlin-coroutines-flow
title: Kotlin 协程与 Flow
description: 当用 Kotlin 写异步、并发或响应式数据流时使用；用结构化并发、Flow 转换、异常处理与协程测试写出无泄漏可取消的代码；不适用于非 Kotlin 异步、Rx/Reactor 框架或纯阻塞同步逻辑。触发词：协程、Flow、结构化并发
domain: 研发/backend
triggers: [Kotlin 协程, coroutine, Flow, 结构化并发, StateFlow, SharedFlow, suspend, CoroutineScope, runTest, 协程异常处理, 协程测试, 并发请求]
tags: [kotlin, coroutines, flow, 并发, 异步, 结构化并发, 响应式, android, 测试]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Edit, Bash]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 在 Kotlin 中实现异步操作、并发请求聚合（如同时拉取多个接口）。
- 用 `Flow` 设计响应式数据流（搜索去抖、状态管理、事件分发）。
- 排查协程取消、泄漏或异常传播问题。
- 为 `suspend` 函数或 `Flow` 编写单元测试。

不该用（负边界）：
- 非 Kotlin 语言的异步（用各自语言方案）。
- 已采用 RxJava/Reactor 等其它响应式框架且无意迁移时。
- 纯同步、无并发的阻塞逻辑——引入协程只增加复杂度。

## 步骤 / 指令

1. 结构化并发：永远在明确的 `CoroutineScope` 内启动协程。用 `coroutineScope`（任一子任务失败则全部取消）或 `supervisorScope`（子任务相互隔离）分组并发任务，靠 `async`/`await` 聚合结果。
2. 异常处理：顶层作用域用 `CoroutineExceptionHandler` 兜底；在 `suspend` 函数内部用 `try-catch` 做细粒度控制。关键约束——除非随即重新抛出，否则**不要捕获 `CancellationException`**，否则会破坏取消机制。
3. 响应式流：需要保留的状态用 `StateFlow`，一次性事件用 `SharedFlow`。冷流（如搜索）用 `debounce` + `flatMapLatest` 组合，并用 `flowOn(Dispatchers.IO)` 切换上游调度器。
4. 调度器：阻塞 I/O 一律放到 `Dispatchers.IO`。
5. 生命周期：作用域不再需要时主动取消（如 `ViewModel.onCleared`）；杜绝 `GlobalScope`。
6. 测试：用 `TestScope` + `runTest`，并把 `TestDispatcher` 注入被测类以控制虚拟时间。

## 示例

并发聚合（任一失败则整体取消）：

```kotlin
suspend fun loadDashboardData(): DashboardData = coroutineScope {
    val userDeferred = async { userRepo.getUser() }
    val settingsDeferred = async { settingsRepo.getSettings() }
    DashboardData(
        user = userDeferred.await(),
        settings = settingsDeferred.await()
    )
}
```

顶层兜底 + 局部捕获：

```kotlin
val handler = CoroutineExceptionHandler { _, exception ->
    println("Caught $exception")
}
viewModelScope.launch(handler) {
    try {
        riskyOperation()
    } catch (e: IOException) {
        // 专门处理网络错误
    }
}
```

Flow：冷流去抖搜索 + 热流状态：

```kotlin
// 冷流（惰性）
val searchResults: Flow<List<Item>> = searchQuery
    .debounce(300)
    .flatMapLatest { query -> searchRepo.search(query) }
    .flowOn(Dispatchers.IO)

// 热流（状态）
val uiState: StateFlow<UiState> = _uiState.asStateFlow()
```

并行执行 + 错误隔离（`supervisorScope` 下 task2 失败不取消 task1）：

```kotlin
suspend fun fetchDataWithErrorHandling() = supervisorScope {
    val task1 = async {
        try { api.fetchA() } catch (e: Exception) { null }
    }
    val task2 = async { api.fetchB() }
    val result1 = task1.await()
    val result2 = task2.await() // 可能抛异常
}
```

## 注意事项

- 该做：阻塞 I/O 用 `Dispatchers.IO`；及时取消无用作用域；测试用 `runTest` + `TestScope`。
- 别做：使用 `GlobalScope`（破坏结构化并发、易泄漏）；裸捕获 `CancellationException` 而不重抛。
- 排错：协程测试卡死或结果不稳定，通常是没用 `runTest` 或没注入 `TestDispatcher` 导致无法控制虚拟时间。
- 边界：本技能不替代针对具体环境的验证、测试与专家评审；若缺少必要输入、权限、安全边界或验收标准，先停下来澄清。

## 互见

- 研发/misc 下其它 Kotlin/JVM 异步与测试相关技能。
- 涉及 Android `ViewModel` 生命周期与 `viewModelScope` 的技能。

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可证）。
