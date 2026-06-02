---
name: unreal-engine-cpp
title: Unreal Engine 5 C++ 开发
description: 当为 Unreal Engine 5.x 编写 C++（Actor、Component、UObject 派生类）、做性能优化、排查 GC/内存泄漏或暴露蓝图接口时使用；产出符合 Epic 规范、GC 安全且高性能的 UE5 C++ 代码与重构方案；不适用于纯蓝图项目、UE5 之前版本或非 Unreal 引擎。触发词：Unreal C++、UE5、UPROPERTY、UCLASS、垃圾回收、TSoftObjectPtr、Tick 优化
domain: 创意/av
triggers: [Unreal C++, UE5 C++, 虚幻引擎 C++, UPROPERTY, UCLASS, UFUNCTION, 垃圾回收, GC 内存泄漏, TSoftObjectPtr, TSoftClassPtr, Tick 优化, 蓝图暴露, Epic 编码规范, FindComponentByClass, UE_LOG]
tags: [游戏开发, Unreal Engine, UE5, C++, 性能优化, 垃圾回收, 蓝图, 创意]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Unreal Engine 5, C++, Visual Studio, Rider]
requires: []
related: [unity-game-developer, glsl-shader-programming, cpp-modern-pro, bevy-ecs-rust]
combines_with: [glsl-shader-programming]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
为 Unreal Engine 5.x 编写健壮、高性能且符合 Epic Games 规范的 C++ 代码，覆盖 UObject 与垃圾回收（GC）卫生、反射系统、性能模式与命名约定。

## 何时使用

适用于以下场景：

- 为 UE5.x 项目编写 C++，尤其是 Actor、Component、UObject 派生类。
- 优化性能敏感代码（Tick、热循环 Cast、数据密集结构体）。
- 排查内存泄漏或垃圾回收相关问题。
- 实现蓝图可调用/可见的功能，使用反射系统（UCLASS、USTRUCT、UFUNCTION）。
- 管理资产加载与软引用（异步加载、避免强制加载链）。
- 遵循 Epic 编码标准（命名前缀、PR 前自检）。

不该用边界（负边界）：

- 纯蓝图项目（无 C++ 代码）。
- UE5 之前的引擎版本（约定与 API 有差异）。
- 非 Unreal 的其它游戏引擎。
- 与 Unreal 无关的任务。

## 步骤

落地任何 UE5 C++ 改动时，按下述决策流程：

1. **GC 卫生优先**：凡作为成员变量的 `UObject*` 必须用 `UPROPERTY()` 标注，确保被 GC 追踪、避免悬空指针；若需在 UObject 图之外持有根引用，用 `TStrongObjectPtr<>`（一般优先 `AddToRoot()`）。判空一律用 `IsValid()` 而非裸 `nullptr` 比较——`IsValid()` 能安全处理 pending kill 状态。
2. **暴露给反射要克制**：用 `UCLASS()`/`USTRUCT()`/`UENUM()`/`UFUNCTION()` 把类型暴露给反射与蓝图；尽量少用 `BlueprintReadWrite`，对不应被 UI/关卡蓝图随意改写的状态优先 `BlueprintReadOnly`。
3. **性能为先**：① Tick 默认关闭（`bCanEverTick = false`），非必要不开，优先用定时器 `GetWorldTimerManager()` 或事件驱动逻辑；② 避免在热循环里 `Cast<T>()`，在 `BeginPlay` 缓存引用；③ 数据密集、非 UObject 的类型用 `F` 结构体减少开销。
4. **组件查找放对地方**：不要在 `Tick` 里 `GetComponentByClass`，放到 `PostInitializeComponents` 或 `BeginPlay` 做一次并缓存。
5. **接口解耦**：用接口（如交互系统）解耦系统，调用前先 `Implements<>` 判定。
6. **大资产用软引用**：对体量大的资产避免硬引用（`TSubclassOf` 等会强制加载顺序），改用 `TSoftClassPtr`/`TSoftObjectPtr`，按需同步或异步加载。
7. **提交前过自检清单**（见下）。

## 指令

严格遵循 Epic Games 命名约定（前缀强约束）：

- 模板：`T`（`TArray`、`TMap`）。
- UObject：`U`（`UCharacterMovementComponent`）。
- AActor：`A`（`AMyGameMode`）。
- Slate 控件：`S`（SWidget）。
- 结构体：`F`（`FVector`）。
- 枚举：`E`（`EWeaponState`）。
- 接口：`I`（`IInteractable`）。
- 布尔：`b`（`bIsDead`）。

## 示例

**健壮的组件查找**（在初始化期做一次，开发期缺失则硬失败）：

```cpp
void AMyCharacter::PostInitializeComponents() {
    Super::PostInitializeComponents();
    HealthComp = FindComponentByClass<UHealthComponent>();
    check(HealthComp); // 开发期缺失直接 fail hard
}
```

**接口调用**（先判定再 Execute_）：

```cpp
if (TargetActor->Implements<UInteractable>()) {
    IInteractable::Execute_OnInteract(TargetActor, this);
}
```

**软引用按需加载**（避免硬引用造成的加载链）：

```cpp
UPROPERTY(EditAnywhere, BlueprintReadWrite)
TSoftClassPtr<AWeapon> WeaponClassToLoad;

void AMyCharacter::Equip() {
    if (WeaponClassToLoad.IsPending()) {
        WeaponClassToLoad.LoadSynchronous(); // 或用 StreamableManager 做异步加载
    }
}
```

**调试三件套**：

```cpp
// 自定义日志类别
DEFINE_LOG_CATEGORY_STATIC(LogMyGame, Log, All);
UE_LOG(LogMyGame, Warning, TEXT("Health is low: %f"), CurrentHealth);

// 屏幕调试信息
if (GEngine) GEngine->AddOnScreenDebugMessage(-1, 5.f, FColor::Red, TEXT("Died!"));
```

Visual Logger 对调试 AI 极有用——实现 `IVisualLoggerDebugSnapshotInterface` 即可记录可视化快照。

## 注意事项

- **PR 前自检清单**：① 这个 Actor 真的需要 Tick 吗？能否改成 Timer？② 所有 `UObject*` 成员是否都包了 `UPROPERTY`？③ 硬引用（`TSubclassOf`）是否造成加载链？能否换软指针？④ 在 `EndPlay` 里清理了绑定的委托（delegate）了吗？
- 本技能只覆盖与上述范围明确匹配的任务，不要为简单需求过度套用。
- 输出代码不能替代具体环境的验证、测试与专家评审，务必在目标 UE 版本与平台实测。
- 缺少必要输入、权限、安全边界或成功标准时，先停下来询问澄清，再继续。
- 注意区分 UE5 与旧版本的 API 差异；本技能面向 5.x。

## 互见

- related：创意/视听域内其它游戏开发、引擎工作流、性能剖析相关技能可横向参考。
- combines_with：可与代码审查、性能剖析、单元测试类技能组合，覆盖从编码到验收的完整链路。
- 纯蓝图或非 Unreal 任务请转用对应技能；本技能聚焦 UE5 C++ 与反射/GC/性能。

---
采编自 [sickn33/antigravity-awesome-skills](https://github.com/sickn33/antigravity-awesome-skills)（MIT License）。
