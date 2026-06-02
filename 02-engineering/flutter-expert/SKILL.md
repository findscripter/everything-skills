---
name: flutter-expert
title: Flutter 跨平台开发
description: 当用 Flutter 3.x / Dart 3 开发移动/Web/桌面/嵌入式单一代码库应用时使用；做架构选型、状态管理、Widget 与性能优化、平台通道集成、测试与多端打包发布；不适用于纯原生（Swift/Kotlin/SwiftUI/Compose）项目、React Native/其他跨端框架或与 Flutter 无关的任务；触发词：Flutter、Dart、Riverpod
domain: 研发/mobile
triggers: [Flutter, Dart 3, Riverpod, Bloc, Cubit, Widget, Impeller, platform channel 平台通道, Flutter 性能优化, Flutter 多端打包, golden 测试, flutter build, Cupertino, Material Design 3, FFI]
tags: [flutter, dart, 跨平台, 移动开发, 状态管理, 性能优化, ui, 测试]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [flutter CLI, dart CLI, Flutter DevTools, Riverpod/Bloc, Dio, Drift/Hive, Patrol, Codemagic/GitHub Actions]
requires: []
related: [react-native-architecture, ios-swiftui-developer, jetpack-compose-expert, swiftui-best-practices]
combines_with: [android-ui-verification, firebase-backend, app-store-optimization]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：

- 用 Flutter 3.x + Dart 3 构建移动（iOS/Android）、Web、桌面（Windows/macOS/Linux）或嵌入式的**单一代码库**应用。
- 需要架构选型（Clean Architecture / 特性分层 / MVVM）、状态管理选型（Riverpod、Bloc/Cubit、Provider 等）。
- Widget 组合与自定义、动画、自定义绘制、响应式/自适应布局。
- 性能优化（减少重建、Impeller、Slivers 列表虚拟化、Isolate）、内存与帧率分析。
- 平台通道（MethodChannel/EventChannel）集成原生能力、插件开发、FFI 调 C/C++。
- 单元/Widget/golden/集成测试，以及多端 CI/CD 打包与上架。

不该用（负边界）：

- 纯原生项目（Swift/SwiftUI、Kotlin/Jetpack Compose）且不引入 Flutter。
- React Native、Kotlin Multiplatform、Compose Multiplatform 等其他跨端框架。
- 与 Flutter/Dart 完全无关的任务（先澄清是否真的需要 Flutter）。

## 步骤

1. **澄清需求**：目标平台、最低 SDK、是否离线优先、团队规模与现有架构约束。
2. **定架构**：默认 Clean Architecture 分层（presentation / domain / data）+ Repository 抽象数据源；按特性（feature）模块化组织目录。
3. **选状态管理**：简单共享用 Provider；中大型且要编译期安全用 **Riverpod 2.x**；强事件驱动/可测试业务逻辑用 **Bloc/Cubit**。依赖注入用 GetIt/Injectable 或 Riverpod。
4. **实现 UI**：组合优先于继承，const 构造、合理使用 Key；Material 3 与 Cupertino 按平台适配；用 LayoutBuilder/MediaQuery 做响应式。
5. **集成平台能力**：用平台通道与原生双向通信，或 FFI 调原生库；Web 配置 PWA。
6. **测试**：unit（mockito）+ widget（testWidgets/golden）+ 集成（Patrol），纳入 CI。
7. **优化与发布**：DevTools 真机 profiling，按平台 flavors 配置环境，签名、混淆并自动化上架。

## 指令

- 全程使用 Dart 3 空安全；善用 patterns、records、sealed classes。
- 始终处理三态：加载（loading）、错误（error）、数据（data）；UI 加无障碍语义（Semantics）。
- 性能：尽量 const 构造、拆小 Widget 缩小重建范围、长列表用 Sliver/`ListView.builder`，CPU 密集任务移入 Isolate。
- 渲染默认走 Impeller；图片做缓存与懒加载。
- 真机跨平台 profiling，目标 60/120fps；包体优化用拆包/资源裁剪。
- 安全：敏感数据用 Secure Storage / Keychain，网络做证书锁定，生物识别用 `local_auth`，发布开启代码混淆。

常用命令：

```bash
flutter create my_app
flutter pub get
flutter run -d chrome                 # 或 -d windows / macos / 设备id
flutter test --update-goldens         # 生成/更新 golden 基线
flutter build apk --release --obfuscate --split-debug-info=build/symbols
flutter build ipa --release
flutter build web --release --pwa-strategy=offline-first
```

## 示例

可处理的请求：

- 「用 Clean Architecture + Riverpod 搭建一个 Flutter 应用骨架」
- 「用 AnimationController/自定义 Painter 实现复杂动画与图表」
- 「做一套自适应移动/平板/桌面的响应式布局」
- 「优化 Flutter Web 的生产构建性能」
- 「用平台通道接入原生 iOS/Android 能力」
- 「建立含 golden 文件的完整测试方案」
- 「实现离线优先的数据同步与冲突解决」

最小 Riverpod + 三态示例：

```dart
final userProvider = FutureProvider<User>((ref) =>
    ref.read(repoProvider).fetchUser());

class UserView extends ConsumerWidget {
  const UserView({super.key});
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ref.watch(userProvider).when(
      data: (u) => Semantics(label: '用户 ${u.name}', child: Text(u.name)),
      loading: () => const CircularProgressIndicator(),
      error: (e, _) => Text('加载失败：$e'),
    );
  }
}
```

## 注意事项

- 输出不能替代真机/特定环境的验证、测试与专家评审。
- 缺少必要输入（目标平台、权限、成功标准、安全边界）时先停下来确认，不要臆测。
- 状态管理不要混用过多方案；同一项目保持一致，避免重复造轮子。
- golden 测试对字体/渲染敏感，固定 CI 环境再提交基线。
- 平台通道是同步/异步边界，注意主线程阻塞与序列化开销。

## 互见

- 研发/misc 域内的原生 iOS（Swift）、原生 Android（Kotlin）专家条目（平台通道对接时参考）。
- 通用「移动应用测试 / CI/CD」「API 集成（REST/GraphQL）」相关条目。

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
