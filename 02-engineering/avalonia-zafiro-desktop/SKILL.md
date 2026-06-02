---
name: avalonia-zafiro-desktop
title: Avalonia 跨平台桌面应用（Zafiro/MVVM）
description: 当用 Avalonia UI + Zafiro 工具包写跨平台桌面应用、做纯 MVVM/函数式响应式架构或评审此类 C# 代码时使用；产出 ViewModel 不依赖 Avalonia、用 DynamicData 管线、Result/Maybe 做流程控制、复用 Zafiro 抽象的可维护代码与规约；不适用于非 Avalonia 技术栈、后端服务或纯运维。触发词：Avalonia、Zafiro、MVVM、DynamicData、ReactiveUI、Result、Maybe、RefreshableCollection
domain: 研发/frontend
triggers: [Avalonia, Zafiro, MVVM, DynamicData, ReactiveUI, Result, Maybe, RefreshableCollection, ValidationRule, 跨平台桌面, 函数式响应式, System.Reactive]
tags: [avalonia, zafiro, dotnet, csharp, mvvm, 响应式, dynamicdata, reactiveui, 桌面应用, 跨平台, 函数式]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Avalonia UI, Zafiro, DynamicData, System.Reactive, ReactiveUI, CSharpFunctionalExtensions]
requires: []
related: [dotnet-backend-patterns, electron-desktop-development, clean-code-principles, error-handling-patterns]
combines_with: [error-handling-patterns, clean-code-principles]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用场景：

- 用 Avalonia UI + Zafiro 工具包开发跨平台桌面应用（Windows/macOS/Linux）
- 落地纯 MVVM、函数式响应式（DynamicData + ReactiveUI）架构
- 管理可刷新集合、动态集合校验、响应式错误处理等场景
- 评审 Avalonia/Zafiro 代码是否符合约定（ViewModel 纯净、管线可读、Result 流程控制）

不该用的边界：

- 非 Avalonia 技术栈的桌面应用（WPF/WinForms/Electron/Tauri 等，Electron 见互见）
- 后端服务、Web API、纯运维部署（C#/.NET 后端见 `dotnet-backend-patterns`）
- 不替代环境内的实际编译、测试与专家评审；缺输入/边界时先停下来澄清

## 步骤

写代码前的强制流程（Procedure Before Writing Code）：

1. **先搜索（Search First）**：在代码库里找相似实现或现成的 Zafiro 助手，别重复造轮子。
2. **可复用扩展（Reusable Extensions）**：缺助手时，提出一个可复用的扩展方法，而不是把复杂逻辑内联进去。
3. **响应式管线（Reactive Pipelines）**：处理集合时优先用 DynamicData 操作符，而非裸 Rx。

落地顺序：

4. ViewModel 严格不引用任何 Avalonia 类型；逻辑由绑定驱动，少写 code-behind。
5. 集合用 DynamicData 单条可读管线（`Connect` → `Filter`/`Transform`/`Sort` → `Bind`），用 `DisposeWith` 管理生命周期。
6. 流程控制用 CSharpFunctionalExtensions 的 `Result`/`Maybe`，异常只留给真正不可恢复的情况，且不得跨架构边界泄漏。
7. 校验用 Zafiro 的 `ValidationRule` 与校验扩展；错误用 `HandleErrorsWith` 直接管到通知服务。

## 指令

四大核心支柱（Core Pillars），所有取舍以此为准：

1. **函数式响应式 MVVM**：纯 MVVM，逻辑用 DynamicData + ReactiveUI。
2. **安全与可预测**：用 `Result` 类型显式处理错误，不用异常做流程控制。
3. **跨平台优先**：ViewModel 严格独立于 Avalonia；组合优于继承。
4. **Zafiro 优先**：先用现成的 Zafiro 抽象/助手，避免冗余。

架构原则：纯 MVVM 强制；组合优于继承；依赖向内（抽象不依赖实现）；尽量不可变；公共 API 稳定。

命名与编码规约（务必遵守）：

- 名字要显式、清晰胜过取巧。
- 异步方法**不要**加 `Async` 后缀，哪怕返回 `Task`。
- 私有字段**不要**加 `_` 前缀。
- 避免静态状态，除非有明确理由并写注释。
- 方法保持小、表达力强、低圈复杂度。

Avalonia UI 规则：

- 绝不用 `System.Drawing`，一律用 Avalonia 类型。
- ViewModel **绝不**引用 Avalonia 类型。
- 逻辑由绑定驱动；优先显式 `DataTemplate` 与强类型 `DataContext`。
- 非必要不用 `VisualStates`。

DynamicData / 响应式规则：

- 处理集合优先 DynamicData 操作符（`Connect`/`Filter`/`Transform`/`Sort`/`Bind`/`DisposeMany`），别用对应已存在的 `System.Reactive` 操作符。
- 管线建成单条可读链；用 `DisposeWith` 管生命周期。
- 订阅（`Subscribe`）要少、要集中、只做副作用。

禁止的反模式（Forbidden Anti-Patterns）：

- 不要为局部问题随手 new `SourceList`/`SourceCache`。
- 不要把业务逻辑塞进 `Subscribe`。
- 有 DynamicData 等价物时，不要用 `System.Reactive` 操作符。

## 示例

可刷新集合 `RefreshableCollection`（内部维护 `SourceCache`/`SourceList`，用 `EditDiff` 增量更新，对外暴露 `ReadOnlyObservableCollection` 供绑定）：

```csharp
var refresher = RefreshableCollection.Create(
        () => GetDataTask(),
        model => model.Id)
    .DisposeWith(disposable);

LoadData = refresher.Refresh;
Items = refresher.Items;
```

动态集合校验（强制用 Zafiro 校验扩展，而非临时 Rx 逻辑）：

```csharp
this.ValidationRule(
        StagesSource
            .Connect()
            .FilterOnObservable(stage => stage.IsValid)
            .IsEmpty(),
        b => !b,
        _ => "Stages are not valid")
    .DisposeWith(Disposables);
```

错误处理管线（别手写 `Subscribe`，用 `HandleErrorsWith` 直接把错误推给用户）：

```csharp
LoadProjects.HandleErrorsWith(uiServices.NotificationService, "Could not load projects");
```

过滤 null：响应式管线里用 `WhereNotNull()`：

```csharp
this.WhenAnyValue(x => x.DurationPreset).WhereNotNull()
```

Zafiro 响应式速记（写自定义 Rx 前，先查 `Zafiro.Reactive.ObservableMixin` 与 `Zafiro.CSharpFunctionalExtensions.ObservableExtensions`）：

| 标准写法 | Zafiro 速记 |
| :--- | :--- |
| `Replay(1).RefCount()` | `ReplayLastActive()` |
| `Select(_ => Unit.Default)` | `ToSignal()` |
| `Select(b => !b)` | `Not()` |
| `Where(b => b).ToSignal()` | `Trues()` |
| `Where(b => !b).ToSignal()` | `Falses()` |
| `Select(x => x is not null)` | `NotNull()` |
| `Select(string.IsNullOrWhiteSpace)` | `NullOrWhitespace()` |
| `Where(r => r.IsSuccess).Select(r => r.Value)` | `Successes()` |
| `Where(r => r.IsFailure).Select(r => r.Error)` | `Failures()` |
| `Where(m => m.HasValue).Select(m => m.Value)` | `Values()` |
| 释放上一项再发新项 | `DisposePrevious()` |
| 给 `ReactiveCommand` 加元数据/文案 | `Enhance(text, name)` |

## 注意事项

- ViewModel 纯净是底线：一旦引用 Avalonia 类型，跨平台与可测试性即破。
- 集合别裸 Rx：能用 DynamicData 等价操作符就必须用；裸 `SourceList`/`SourceCache` 满天飞是典型坏味道。
- `Result`/`Maybe` 是流程控制主路径，异常只留给不可恢复情况，且严禁跨架构边界泄漏。
- `Subscribe` 里不放业务逻辑，只做副作用；订阅要少且集中，并用 `DisposeWith` 收尾防泄漏。
- 命名两条最易踩：异步方法**不加** `Async` 后缀、私有字段**不加** `_` 前缀。
- 本技能给的是约定与模式，不替代实际编译、跨平台测试与专家评审。

## 互见

- related：`dotnet-backend-patterns` —— 同为 C#/.NET，覆盖后端侧的异步、DI、Result 模式
- related：`electron-desktop-development` —— 另一条跨平台桌面路线（Web 技术栈），可横向对比选型
- related：`clean-code-principles` —— 命名、低圈复杂度、组合优于继承的通用准则
- combines_with：`error-handling-patterns` —— 把 `Result`/`Maybe` 的错误处理思路系统化

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可证）。
