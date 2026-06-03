---
name: swiftui-liquid-glass
title: SwiftUI Liquid Glass：液态玻璃 API 与回退实现
description: 当在 SwiftUI 中采用、审查或重构 iOS 26+ Liquid Glass（液态玻璃）效果，需要正确的 API 用法、修饰符顺序、容器分组与版本回退时使用；产出原生 glassEffect/GlassEffectContainer/玻璃按钮样式的实现片段、审查清单与 #available 降级方案；不适用于自定义模糊堆砌、跨平台框架或纯后端。触发词：Liquid Glass、glassEffect、GlassEffectContainer、玻璃按钮、液态玻璃、glassEffectID
domain: 研发/mobile
triggers: [Liquid Glass, 液态玻璃, glassEffect, GlassEffectContainer, glassEffectID, glassEffectUnion, buttonStyle(.glass), glassProminent, interactive 玻璃, iOS 26 玻璃, 玻璃按钮, 玻璃变形 morph, ultraThinMaterial 回退]
tags: [swiftui, liquid glass, 液态玻璃, ios 26, ui 材质, 玻璃效果, apple, 研发]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [SwiftUI, Xcode 16+, iOS 26 SDK]
requires: []
related: [swiftui-best-practices, ios-swiftui-developer, swift-concurrency]
combines_with: [apple-hig-advisor, glassmorphism-ui-design]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 要在 SwiftUI 里**采用**或**审查** iOS 26+ Liquid Glass：玻璃表面、芯片、按钮、卡片的玻璃材质化。
- 需要**正确的 API 用法**：修饰符顺序、形状一致性、多元素容器分组、变形转场、版本门控与回退。
- 触发词：Liquid Glass、液态玻璃、glassEffect、GlassEffectContainer、玻璃按钮、glassEffectID。

不该用的边界：
- 用 `.ultraThinMaterial` 等手搓模糊去**模拟**玻璃 → 优先原生 API，不要堆自定义模糊。
- 跨平台（Flutter / React Native）、纯 Web/H5、纯后端任务。
- 完整 iOS 工程搭建 / 数据持久化 / 上架 → 用 `ios-swiftui-developer`；SwiftUI 全维度（状态/性能/无障碍）最佳实践 → 用 `swiftui-best-practices`。
- **不默认引入**玻璃，仅在用户明确要求采用 Apple 新设计时使用。

## 步骤 / 指令

按任务三选一，核对维度共用：

1. **审查现有功能**：确认该用/不该用玻璃的位置 → 校验修饰符顺序、形状、容器放置 → 检查 `#available(iOS 26, *)` 与合理回退。
2. **改进现有功能**：圈定目标组件（表面/芯片/按钮/卡片）→ 多个玻璃元素重构进 `GlassEffectContainer` → 仅对可点/可聚焦元素加 `.interactive()`。
3. **实现新功能**：先设计玻璃表面与交互（形状、显著度、分组）→ 在布局/外观修饰符**之后**加玻璃修饰符 → 视图层级带动画变化时再加变形转场。

**核心约束（必须遵守）：**
- 优先原生 API，胜过自定义模糊。
- 多个玻璃元素共存时，用 `GlassEffectContainer`（更好性能 + 启用融合/变形）。
- `.glassEffect(...)` 在布局与视觉修饰符**之后**应用。
- `.interactive()` 仅用于响应触摸/指针的元素。
- 相关元素保持形状一致，视觉协调。
- 用 `#available(iOS 26, *)` 门控，并提供非玻璃回退。

**审查清单：**
- 可用性：`#available(iOS 26, *)` 在场且有回退 UI。
- 组合：多个玻璃视图包进 `GlassEffectContainer`。
- 顺序：`glassEffect` 在布局/外观修饰符之后。
- 交互性：`interactive()` 只出现在确有交互处。
- 转场：`glassEffectID` 配 `@Namespace` 实现变形。
- 一致性：形状、着色、间距跨功能对齐。

**API 速查：**
- 形状：`.capsule`（默认）/ `.rect(cornerRadius:)` / `.circle`。
- 变体：`.regular`；`.tint(Color)` 着色提示显著度；`.interactive(Bool)` 或 `.interactive()` 响应交互。
- 融合：`glassEffectUnion(id:namespace:)` 把多个视图合成单一玻璃（适合动态生成或不在同一 HStack/VStack 的视图）。
- 容器 `spacing`：小 → 元素更近才融合；大 → 更远即融合。
- 按钮：`.buttonStyle(.glass)` / `.buttonStyle(.glassProminent)`。
- 高级：侧栏/检查器背景延伸；横向滚动 `.scrollExtensionMode(.underSidebar)`。

## 示例

带回退（务必先门控）：
```swift
if #available(iOS 26, *) {
    Text("Hello")
        .padding()
        .glassEffect(.regular.interactive(), in: .rect(cornerRadius: 16))
} else {
    Text("Hello")
        .padding()
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 16))
}
```

多元素容器（分组 + 融合）：
```swift
GlassEffectContainer(spacing: 24) {
    HStack(spacing: 24) {
        Image(systemName: "scribble.variable")
            .frame(width: 72, height: 72)
            .font(.system(size: 32))
            .glassEffect()
        Image(systemName: "eraser.fill")
            .frame(width: 72, height: 72)
            .font(.system(size: 32))
            .glassEffect()
    }
}
```

变形转场（`@Namespace` + `glassEffectID`，层级变化加动画）：
```swift
@State private var isExpanded = false
@Namespace private var namespace

GlassEffectContainer(spacing: 40) {
    HStack(spacing: 40) {
        Image(systemName: "scribble.variable")
            .frame(width: 80, height: 80).font(.system(size: 36))
            .glassEffect().glassEffectID("pencil", in: namespace)
        if isExpanded {
            Image(systemName: "eraser.fill")
                .frame(width: 80, height: 80).font(.system(size: 36))
                .glassEffect().glassEffectID("eraser", in: namespace)
        }
    }
}
Button("Toggle") { withAnimation { isExpanded.toggle() } }
    .buttonStyle(.glass)
```

玻璃按钮：
```swift
Button("Confirm") { }
    .buttonStyle(.glassProminent)
```

审查提示词（最小可用）：
```
按 可用性门控 / 容器组合 / 修饰符顺序 / 交互性 / 变形转场 / 一致性 六维审查以下 SwiftUI Liquid Glass 代码。
每条：[严重度] 文件:行号 — 问题；原因；可执行修改（给替换代码）。无问题请明说，勿编造。
<贴入代码>
```

## 注意事项

- **修饰符顺序是头号坑**：`.glassEffect()` 必须在影响外观的修饰符之后，否则材质捕获到错误的内容。
- 玻璃会折射周围内容与光线、实时响应触摸/指针 —— `.interactive()` 只给确实可交互的元素，静态装饰别加。
- 多元素务必用 `GlassEffectContainer`：不仅是性能，更是融合/变形生效的前提；变形仅在视图层级随动画增删时发生，记得 `withAnimation`。
- `spacing` 同时影响 `HStack` 与容器，二者需协调以控制融合距离。
- API 仍在演进，以 Apple 官方文档为准（`glassEffect(_:in:isEnabled:)`、`GlassEffectContainer`、`GlassEffectTransition`、`GlassButtonStyle`）；本技能不替代真机/模拟器验证、测试与专家评审。缺少必要输入、权限或成功标准时先停下澄清。

## 互见

- requires：无。
- related：`swiftui-best-practices`（SwiftUI 状态/组合/性能/无障碍全维度审查，含 Liquid Glass 一致性；本技能是其玻璃专项的深化实现层）；`ios-swiftui-developer`（完整 iOS App 工程、持久化、网络与上架）。
- combines_with：`code-reviewer`（通用代码审查；先用本技能扫玻璃专项坏味道，再用它兜通用正确性 bug）。

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
