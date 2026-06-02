---
name: swiftui-best-practices
title: SwiftUI 状态管理与最佳实践
description: 当编写、审查或重构 SwiftUI 代码，需要状态管理、视图组合、性能、无障碍及 iOS 26+ Liquid Glass 的现行最佳实践时使用；产出基于事实、不绑定特定架构的整改建议与对照清单；不适用于完整 App 工程搭建/上架、跨平台（Flutter/RN）或纯后端。触发词：SwiftUI、状态管理、@State、property wrapper、视图重构、SwiftUI 性能、Liquid Glass
domain: 研发/mobile
triggers: [SwiftUI, 状态管理, @State, @Binding, @Observable, property wrapper, 视图组合, SwiftUI 性能, ForEach 性能, 动画 animation, 无障碍 accessibility, Liquid Glass, glassEffect, SwiftUI code review, SwiftUI 重构]
tags: [SwiftUI, 状态管理, 性能, 无障碍, Liquid Glass, 代码审查, iOS, 研发]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [SwiftUI, Xcode, Instruments]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 编写、审查或重构 SwiftUI 代码，需要现行（非弃用）最佳实践：状态管理、视图组合、性能、动画、无障碍、iOS 26+ Liquid Glass。
- 想要一层**基于事实、不强加架构**（不规定 MVVM/VIPER）的 SwiftUI 指导与对照清单。
- 触发词：SwiftUI、状态管理、property wrapper、视图重构、SwiftUI 性能、Liquid Glass。

不该用的边界：
- 完整 iOS App 从 0 搭工程 / 数据持久化 / 网络 / 上架发布 → 用 `ios-swiftui-developer`。
- 跨平台框架（Flutter、React Native、KMP）、纯 Web/H5、纯后端任务。
- 需要真机/模拟器运行、性能压测、自动化测试等执行类验证（本技能只做静态建议）。
- 默认不主动引入 Liquid Glass，**仅当用户明确要求**才采用。

## 步骤

按任务类型选流程（三类共用同一套核对维度）：

1. **审查现有代码**：先排查弃用 API（按部署目标替换为现代等价物）→ 核对 property wrapper 选型 → 视图抽取 → 性能模式 → ForEach 稳定标识 → 动画正确性 → 无障碍 → Liquid Glass 一致性 → `#available` 降级。
2. **改进现有代码**：替换弃用 API → 审计状态选型 → 抽取复杂视图为子视图 → 重构热路径减少冗余状态更新 → ForEach 用稳定身份 → 用 `.animation(_:value:)` → 用 `Button` 替代点击手势、加 `@ScaledMetric`。
3. **实现新功能**：先设计数据流（区分**自有**状态 vs **注入**状态）→ 早抽子视图利于 diff → 业务逻辑放 service/model 便于测试 → 选对动画（隐式/显式/转场）→ 可点元素用 `Button` 并加无障碍分组 → iOS 26+ 特性用 `#available` 门控并给回退。

## 指令

**状态管理（property wrapper 选型表）：**

| Wrapper | 何时用 |
|---|---|
| `@State` | 视图内部状态（**必须 `private`**） |
| `@Binding` | 子视图需**修改**父状态 |
| `@StateObject` | 视图**创建**该 `ObservableObject` |
| `@ObservedObject` | 视图**接收**注入的 `ObservableObject` |
| `@Bindable` | iOS 17+：注入的 `@Observable` 需要绑定 |
| `let` | 父传入的只读值 |
| `var` | 只读值，用 `.onChange()` 响应 |

- 绝不把外部值传入 `@State` / `@StateObject`（它们只接受初始值）。
- 嵌套 `ObservableObject` 不传播变更 → 把嵌套对象直接传给子视图；`@Observable` 天然支持嵌套。

**视图组合：** 抽取复杂视图为子视图；状态变化优先用修饰符而非条件视图（保持视图标识）；`body` 保持纯净无副作用；容器优先 `@ViewBuilder let content: Content`；动作处理器引用方法而非内联逻辑；视图须上下文无关（不假设屏幕尺寸）。

**性能：** 只传所需值（别传大 config/context 对象）；删冗余依赖降扇出；热路径赋值前先判值变化；大列表用 `LazyVStack/LazyHStack`；`ForEach` 用稳定身份（动态内容**禁用 `.indices`**）、每元素视图数恒定、避免内联过滤（预过滤缓存）、行内禁用 `AnyView`；`body` 内禁建对象/重计算；用 `Self._printChanges()` 调试意外刷新。

**动画：** 用 `.animation(_:value:)` 带 value 参数（无 value 的版本太广已弃用）；事件驱动用 `withAnimation`；优先 transform（`offset`/`scale`/`rotation`）而非布局变更（`frame`）；转场的 `.transition` 须配在条件结构**外层**的动画；自定义 `Animatable` 须显式 `animatableData`；iOS 17+ 多步序列用 `.phaseAnimator`、精确时序用 `.keyframeAnimator`；隐式动画会覆盖显式（视图树靠后者胜）。

**无障碍：** 可点元素用 `Button` 而非 `onTapGesture`（白送 VoiceOver）；自定义数值用 `@ScaledMetric` 适配 Dynamic Type；用 `accessibilityElement(children: .combine)` 合并相关元素；默认标签不清时补 `accessibilityLabel`；自定义控件用 `accessibilityRepresentation`。

**Liquid Glass（iOS 26+，仅按需）：** 用原生 `glassEffect` / `GlassEffectContainer` / glass 按钮样式；多个玻璃元素包进 `GlassEffectContainer`；`.glassEffect()` 在布局与外观修饰符**之后**；`.interactive()` 仅用于可交互元素；变形转场用 `glassEffectID` + `@Namespace`。

## 示例

最小审查提示词：
```
按 现行API / 状态管理 / 视图组合 / 性能 / 动画 / 无障碍 / Liquid Glass 七维审查以下 SwiftUI 代码。
每条：[严重度] 文件:行号 — 问题；原因；可执行修改（给替换代码）。无问题请明说，勿编造。
<贴入代码>
```

Liquid Glass 带回退（iOS 26+）：
```swift
if #available(iOS 26, *) {
    content
        .padding()
        .glassEffect(.regular.interactive(), in: .rect(cornerRadius: 16))
} else {
    content
        .padding()
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 16))
}

// 分组玻璃元素
GlassEffectContainer(spacing: 24) {
    HStack(spacing: 24) { GlassButton1(); GlassButton2() }
}

// 玻璃按钮
Button("Confirm") { }.buttonStyle(.glassProminent)
```

## 注意事项

- 紧跟弃用：任何工作流开始前先核对现行 API，按项目**最低部署目标**选择 API，弃用项替换为现代等价物。
- `@State` 必须 `private`；区分 `@StateObject`（自有）与 `@ObservedObject`（注入），别把传入值声明成状态。
- 不强加架构，但鼓励把业务逻辑外移到 service/model 以便测试；遵循 Apple HIG 与 API 设计惯例。
- 本技能只给基于事实的最佳实践，**不替代**环境内的真机验证、测试与专家评审；缺少必要输入或成功标准时先停下澄清。

## 互见

- requires：无。
- related：`ios-swiftui-developer`（完整 iOS App 工程搭建、数据持久化、网络与上架；本技能是其上的**最佳实践/审查指导层**，聚焦状态、组合、性能、无障碍与 Liquid Glass 的正确性）。
- combines_with：`code-reviewer`（通用代码审查；与本技能的 SwiftUI 专项维度叠加，先用本技能扫 SwiftUI 特有坏味道，再用它兜正确性 bug）。

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
