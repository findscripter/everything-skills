---
name: jetpack-compose-expert
title: Android Jetpack Compose 开发专家
description: 当用 Jetpack Compose 新建/重构 Android UI、做状态管理与导航、调优重组性能时使用；产出 ViewModel+StateFlow 单向数据流的 Compose 屏幕、类型安全导航与 Material 3 结构；不适用于 XML View/Flutter/RN 或后端逻辑；触发词：Compose、Composable、重组、StateFlow、NavHost、Material3
domain: 研发/mobile
triggers: [Jetpack Compose, Composable, @Composable, 重组, recomposition, StateFlow, ViewModel, collectAsStateWithLifecycle, NavHost, 类型安全导航, Material 3, XML 迁移 Compose, remember, derivedStateOf, LaunchedEffect]
tags: [android, jetpack-compose, kotlin, mobile, ui, 状态管理, navigation, material3, 性能优化, mvvm, mvi]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Write, Edit, Bash, Grep, Glob]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用于：
- 新建基于 Jetpack Compose 的 Android 项目，搭建 UI 与依赖。
- 将旧的 XML 布局迁移到 Compose。
- 实现复杂 UI 状态管理与副作用（side effect）。
- 优化 Compose 性能（重组次数、稳定性 stability）。
- 配置类型安全（type-safe）的 Navigation Compose。

不该用：
- 纯 Android View/XML、Flutter、React Native 等非 Compose UI 栈。
- 与 UI 无关的后端逻辑、数据层 SDK、构建系统底层问题。
- 缺少明确需求、权限或验收标准时——应先停下来澄清，再动手。

## 步骤

### 1. 依赖配置
在 `libs.versions.toml` 中引入 Compose BOM 与所需库，用 BOM 统一管理版本：

```kotlin
[versions]
composeBom = "2024.02.01"
activityCompose = "1.8.2"

[libraries]
androidx-compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }
androidx-ui = { group = "androidx.compose.ui", name = "ui" }
androidx-material3 = { group = "androidx.compose.material3", name = "material3" }
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }
```

### 2. 状态管理（MVVM/MVI）
用 `ViewModel` + `StateFlow` 暴露 UI 状态；对外只暴露只读 `StateFlow`，绝不暴露 `MutableStateFlow`。

```kotlin
data class UserUiState(
    val isLoading: Boolean = false,
    val user: User? = null,
    val error: String? = null
)

class UserViewModel @Inject constructor(
    private val userRepository: UserRepository
) : ViewModel() {
    private val _uiState = MutableStateFlow(UserUiState())
    val uiState: StateFlow<UserUiState> = _uiState.asStateFlow()

    fun loadUser() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            try {
                val user = userRepository.getUser()
                _uiState.update { it.copy(user = user, isLoading = false) }
            } catch (e: Exception) {
                _uiState.update { it.copy(error = e.message, isLoading = false) }
            }
        }
    }
}
```

### 3. 拆分有状态/无状态 Composable
「Screen」级组件负责消费状态，把纯数据与回调下传给「Content」级无状态组件。用 `collectAsStateWithLifecycle()` 按生命周期安全收集。

```kotlin
@Composable
fun UserScreen(viewModel: UserViewModel = hiltViewModel()) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    UserContent(uiState = uiState, onRetry = viewModel::loadUser)
}

@Composable
fun UserContent(uiState: UserUiState, onRetry: () -> Unit) {
    Scaffold { padding ->
        Box(modifier = Modifier.padding(padding)) {
            when {
                uiState.isLoading -> CircularProgressIndicator()
                uiState.error != null -> ErrorView(uiState.error, onRetry)
                uiState.user != null -> UserProfile(uiState.user)
            }
        }
    }
}
```

## 指令

- 状态单向流动：事件向上（lambda 回调），数据向下（state 参数）。
- 子组件只接收数据 + 回调，不接收 `ViewModel` 实例。
- 一次性副作用（如弹 Snackbar）放进 `LaunchedEffect`，由 state 变化触发。
- 重组中要做的派生计算用 `remember` / `derivedStateOf` 缓存，避免每帧重算。
- 排查重组问题用 Layout Inspector 查看重组计数。

## 示例

类型安全导航（Navigation Compose Type Safety，新版本可用）：用 `@Serializable` 定义目的地，`composable<T>` 注册路由，`backStackEntry.toRoute()` 取参。

```kotlin
@Serializable object Home
@Serializable data class Profile(val userId: String)

@Composable
fun AppNavHost(navController: NavHostController) {
    NavHost(navController, startDestination = Home) {
        composable<Home> {
            HomeScreen(onNavigateToProfile = { id ->
                navController.navigate(Profile(userId = id))
            })
        }
        composable<Profile> { backStackEntry ->
            val profile: Profile = backStackEntry.toRoute()
            ProfileScreen(userId = profile.userId)
        }
    }
}
```

## 注意事项

- 含 `List` 等不稳定类型的 UI 状态数据类，加 `@Immutable` 或 `@Stable` 注解，启用智能跳过重组（smart recomposition skipping）。
- 不要在 Composable 函数体内直接做昂贵操作（如对列表排序）而不包 `remember`。
- 不要把 `ViewModel` 下传给子组件，只传 state 与回调。
- 无限重组排查：检查是否在组合阶段创建了新对象实例（如 `List`、`Modifier`）却未 `remember`，或是否在组合阶段（而非副作用/回调中）更新了状态。
- 本技能输出不能替代真机/环境特定的验证、测试与专家评审。

## 互见

- 与「Kotlin 协程」「依赖注入（Hilt）」「Android 架构组件」等技能配合使用。
- 性能深入排查可结合 Android Studio Layout Inspector 与 Compose Compiler Metrics。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
