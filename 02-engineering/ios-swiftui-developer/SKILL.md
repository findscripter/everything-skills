---
name: ios-swiftui-developer
title: iOS SwiftUI 原生开发
description: 当用 Swift 6 / SwiftUI 开发 iOS 18 原生应用（UI、状态管理、数据持久化、网络、上架）时使用；产出 SwiftUI 优先、含错误处理与无障碍的生产级 Swift 代码及工程方案；不适用于跨平台框架（Flutter/RN）、纯 Web 或后端任务。触发词：SwiftUI、Swift、iOS、Xcode、App Store
domain: 研发/mobile
triggers: [SwiftUI, Swift 6, iOS 18, Xcode, UIKit 桥接, Core Data, SwiftData, App Store 上架, Live Activities, Widget 小组件]
tags: [iOS, SwiftUI, Swift, 移动开发, Apple, Xcode, 研发]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Xcode 16, Swift Package Manager, Instruments, XCTest/XCUITest, Fastlane, Xcode Cloud, TestFlight]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 用 Swift 6 / SwiftUI 构建或重构 iOS 18 原生应用：界面、状态管理、导航、数据持久化、网络请求、性能优化、上架发布。
- 需要 SwiftUI 与 UIKit 互操作（桥接旧组件或包装系统控件）。
- 接入 Apple 生态能力：Core Data/SwiftData、CloudKit、Keychain、生物识别、Widget、Live Activities、ARKit/Core ML 等。

不该用的边界：
- 跨平台方案（Flutter、React Native、Kotlin Multiplatform）或纯 Web/H5。
- 纯后端 / 服务端 API 实现（仅做客户端对接时才适用）。
- Android 专属或与 Apple 平台无关的任务。

## 步骤

1. 明确目标与约束：最低支持版本（iOS 17/18）、设备形态（iPhone/iPad/Mac Catalyst）、是否需离线、隐私合规要求。
2. SwiftUI 优先选型：默认用声明式 SwiftUI；仅在缺失能力时用 `UIViewControllerRepresentable` / `UIViewRepresentable` 桥接 UIKit。
3. 定架构：中小型用 MVVM + 可观测状态；多模块用 Clean Architecture + Coordinator 导航 + Repository 数据抽象，依赖用 SPM 管理。
4. 设计数据层：iOS 17+ 优先 SwiftData，复杂迁移/既有项目用 Core Data + `@FetchRequest`；敏感数据进 Keychain，配置走 UserDefaults。
5. 实现网络：`URLSession` + `async/await` + `Codable`，按需加可达性监控、证书固定、后台传输。
6. 加无障碍：从设计阶段就补 VoiceOver 标签、Dynamic Type、对比度/减弱动态效果，用 Accessibility Inspector 审计。
7. 测试与发布：XCTest 单测 + XCUITest UI 测试；Instruments 做内存/渲染剖析；Fastlane / Xcode Cloud 自动化构建，经 TestFlight 灰度后上架。

## 指令

- 错误处理：所有可失败路径显式 `throw` / `Result`，给用户可恢复的反馈，禁止吞异常。
- 并发安全：启用 Swift 6 严格并发，标注 `@MainActor`，跨 actor 数据用 `Sendable`，避免数据竞争。
- 状态管理：iOS 17+ 用 `@Observable` 宏 + `@State`/`@Bindable`；旧版用 `@StateObject`/`@ObservedObject`，`@StateObject` 仅在视图创建处声明，子视图用 `@ObservedObject` 接收。
- 合规先行：主动对照 Apple Human Interface Guidelines 与 App Store 审核指南，配置 ATS、隐私营养标签、App Tracking Transparency。
- 性能：列表用懒加载 + 分页，图片做缓存（Kingfisher/SDWebImage 或自实现），遵循 ARC 避免循环引用（`weak`/`unowned`）。

## 示例

- 「构建带 Core Data 与 CloudKit 同步的 SwiftUI 应用。」
- 「把现有 UIKit 自定义控件包装进 SwiftUI 视图。」
- 「实现 Face ID 生物识别并处理降级回退。」
- 「为锁屏做 Live Activities 实时更新，配合 Dynamic Island。」
- 「用 Instruments 内存剖析定位并优化卡顿。」
- 「搭建 Xcode Cloud + TestFlight 的 CI/CD 分发流水线。」

最小可用 SwiftUI + Observable 片段（iOS 17+）：

```swift
@Observable
final class CounterModel {
    var count = 0
    func increment() { count += 1 }
}

struct CounterView: View {
    @State private var model = CounterModel()
    var body: some View {
        VStack {
            Text("计数：\(model.count)")
            Button("加一", action: model.increment)
        }
        .accessibilityElement(children: .combine)
    }
}
```

## 注意事项

- 不要把本技能输出当作替代真机/模拟器验证、测试与专家评审的依据；关键路径务必实测。
- 缺少必要输入（最低版本、设备矩阵、权限、成功标准）时先停下来澄清，不要臆测。
- 紧跟 WWDC 与 iOS SDK 更新；API 可用性受最低部署版本约束，用 `if #available` 做能力降级。
- 规划多尺寸/多方向适配与内存管理，UI 决策要权衡性能开销。

## 互见

- UIKit 深度定制、Auto Layout、转场动画等遗留栈话题（可单列 UIKit 技能）。
- CI/CD 与发布自动化（Fastlane / Xcode Cloud / 证书与签名管理）。
- 设备端机器学习与 AR（Core ML / Create ML / ARKit）专项。

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
