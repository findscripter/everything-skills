---
name: swift-concurrency
title: Swift 并发与 Actor 隔离
description: 当审查/修复 Swift 6.2+ 并发问题（actor 隔离、Sendable 违规、@MainActor、async 迁移）或读编译器数据竞争诊断时使用；做最小行为变更的安全修复并给出改后代码与验证清单；不适用于纯功能开发、非并发崩溃排查、Objective-C 旧式 GCD 调优；触发词：Swift 并发、actor 隔离、Sendable、@MainActor、@concurrent、data race。
domain: 研发/mobile
triggers: [Swift 并发, actor 隔离, Sendable, @MainActor, @concurrent, data race, nonisolated, Swift 6.2]
tags: [swift, concurrency, actor, ios, mobile]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [swift, xcode, swiftpm]
requires: []
related: [swiftui-best-practices, ios-swiftui-developer, kotlin-coroutines-flow, go-concurrency-patterns]
combines_with: [ios-swiftui-developer, swiftui-best-practices, systematic-debugger]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 用户给出 Swift 6.2+ 代码或编译器并发诊断（actor-isolated、Sendable、`sending` 风险、isolated conformance 等），要求审查或修复数据竞争。
- 需要就 actor 隔离、`Sendable`、`@MainActor`、`nonisolated`、`@concurrent`、async 迁移做决策。
- 触发词：Swift 并发、actor 隔离、Sendable、@MainActor、@concurrent、data race、nonisolated、Swift 6.2。

不该用的边界：
- 纯功能/业务开发、UI 布局，与并发安全无关 → 直接写代码。
- 非并发的崩溃/逻辑 bug、性能火焰图分析 → 走通用调试，不属本技能。
- Swift 6 以前的旧式 GCD / `DispatchQueue` 手工调度或 Objective-C 线程模型重构 → 本技能聚焦 Swift 6.2 数据竞争安全模型。
- 不替代真实构建、跑测试与人工评审；缺少诊断原文、隔离上下文或项目设置时先问清，别臆测。

## 步骤 / 指令

```
1. 分诊（Triage）
   - 抄下完整编译器诊断与出错符号；定位涉及的类型/成员。
   - 查项目并发设置：Swift 语言版本（须 6.2+）、严格并发级别
     （Complete/Targeted/Minimal）、是否开启 approachable concurrency
     （default actor isolation / main-actor-by-default）。
     Xcode 在「Swift Compiler - Concurrency」；SwiftPM 在 Package.swift 的 swiftSettings。
   - 判断当前隔离上下文（@MainActor / actor / nonisolated）。
   - 确认代码是 UI 绑定，还是本就应跑在主 actor 之外。

2. 打最小且安全的补丁（保行为前提下满足数据竞争安全）
   - UI 绑定类型：给类型或成员加 @MainActor（整型注解可让全部存储状态与方法自动隔离到主 actor）。
   - 主 actor 类型的协议遵从：用隔离遵从，写成 extension Foo: @MainActor SomeProtocol。
   - 全局/静态可变状态：用 @MainActor 保护，或移入 actor。
   - 后台重活：把昂贵计算放到 nonisolated 类型上的 @concurrent async 函数，
     或用 actor 守护可变状态；调用方加 await。
   - Sendable 报错：优先不可变/值类型；仅在确实正确时加 Sendable；
     除非能证明线程安全，否则不要用 @unchecked Sendable。

3. 验证
   - 重新构建，确认并发诊断全消、未引入新告警。
   - 跑测试套件查回归：并发改动即使构建通过也可能引入隐蔽运行期问题。
   - 若冒出新告警，回到步骤 1 逐条迭代，直到构建干净、测试通过。
```

判据要点（来自 Swift 6.2 模型）：
- approachable concurrency 下 async 函数默认留在调用方所在 actor，不再隐式跳到全局并发执行器；主 actor 默认即可消除大量 UI/全局态的数据竞争。
- 隔离遵从（isolated conformance）只在对应 actor 上可用，比强行 `nonisolated` 绕过更安全。
- `@concurrent` 保证函数始终在并发线程池运行，腾出 actor 处理其他任务。

## 示例

UI 绑定类型加 @MainActor：
```swift
// Before: 数据竞争告警，ViewModel 无 actor 隔离却被主线程访问
class ViewModel: ObservableObject {
    @Published var title: String = ""
    func load() { title = "Loaded" }
}
// After: 整型注解，全部状态与方法自动隔离到主 actor
@MainActor
class ViewModel: ObservableObject {
    @Published var title: String = ""
    func load() { title = "Loaded" }
}
```

主 actor 类型的隔离遵从：
```swift
// After: 把遵从限定到 @MainActor，在正确隔离上下文内满足协议要求
@MainActor
extension Foo: SomeProtocol {
    func protocolMethod() { /* 安全访问主 actor 状态 */ }
}
```

把重活挪到后台（@concurrent，Swift 6.2+）：
```swift
// Before: 昂贵计算阻塞主 actor
@MainActor
func processData(_ input: [Int]) -> [Int] {
    input.map { heavyTransform($0) }      // 跑在主线程
}
// After A：@concurrent，始终在并发池运行
@concurrent
func processData(_ input: [Int]) async -> [Int] {
    input.map { heavyTransform($0) }
}
// After B：nonisolated + Task.detached 显式脱离隔离
nonisolated func processData(_ input: [Int]) async -> [Int] {
    await Task.detached(priority: .userInitiated) {
        input.map { heavyTransform($0) }
    }.value
}
```

把同步函数挪到后台的四步配方：① 让结构/类 `nonisolated`；② 给目标函数加 `@concurrent`；③ 非异步则补 `async`；④ 所有调用方补 `await`。

## 注意事项

- `Task.detached` 不继承所在 actor 上下文；除非确需打破隔离，避免使用。
- main-actor-by-default 会掩盖性能问题：CPU 密集活若仍留主 actor，要主动移入 `@concurrent` async 函数。
- 值跨 actor / 跨任务时始终尊重 Sendable 边界；慎用 `@unchecked Sendable`。
- 并发改动构建通过 ≠ 运行正确，务必跑测试。
- 不替代针对具体环境的验证、测试与专家评审；输入不全先停下来问。

## 互见

- requires：无。
- related：`code-reviewer`（通用代码审查找正确性/可读性问题；本技能专攻 Swift 数据竞争安全维度）。
- combines_with：无。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
