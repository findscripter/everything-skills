---
name: expo-router-native-ui
title: Expo Router 原生 UI 构建
description: 当用 Expo Router 构建有原生质感的 React Native 应用（导航、原生组件、动画、原生 Tabs、Header/搜索、表单 Sheet、视觉特效）时使用；产出遵循 Apple HIG、优先 Expo Go、用内联样式+文件路由的可运行 UI 结构与代码；不适用于纯原生 Swift/Kotlin、纯 Web/H5 或与 Expo 无关的后端任务。触发词：Expo、Expo Router、React Native、NativeTabs、expo-router
domain: 研发/mobile
triggers: [Expo, Expo Router, Expo Go, React Native, NativeTabs, expo-router, _layout.tsx, Stack.Screen, formSheet, headerLargeTitle, Link.Preview, expo-image SF Symbols, expo run:ios, EAS build, liquid glass expo-glass-effect]
tags: [expo, expo router, react native, 原生 ui, 导航, 移动开发, ios, 研发]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Expo, Expo Router, Expo Go, expo-image, expo-glass-effect, react-native-reanimated, react-native-safe-area-context, Xcode/Android Studio (仅自定义构建时)]
requires: []
related: [react-native-architecture, flutter-expert, ios-swiftui-developer, react-state-management]
combines_with: [apple-hig-advisor, frontend-design, android-ui-verification]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 用 **Expo Router** 构建有「原生质感」的 React Native 应用，需要导航（Stack/原生 Tabs）、原生控件、动画、Header/搜索栏、表单 Sheet、模糊/液态玻璃等特效的现行写法。
- 需要判断「Expo Go 够不够，还是必须自定义原生构建」。
- 触发词：Expo、Expo Router、React Native、NativeTabs、expo-router、_layout.tsx、formSheet。

不该用的边界：
- 纯原生 iOS（Swift/SwiftUI）→ 用 `ios-swiftui-developer` / `swiftui-best-practices`；纯原生 Android（Kotlin/Compose）。
- 与 Expo 无关的 React Native 工程架构/状态管理整体决策 → 用 `react-native-architecture`。
- 纯 Web/H5、纯后端、与 UI 无关的任务。
- 本技能给结构与代码模式，**不替代**真机/模拟器运行、测试与专家评审；缺少必要输入时先停下澄清。

## 步骤

1. **先跑 Expo Go，别急着自定义构建（关键约束）**：`npx expo start` 扫码进 Expo Go 充分测试。绝大多数 `expo-*` 包、Expo Router、reanimated、推送、深链都开箱即用。
2. **仅在这些情况才需要自定义构建**（`npx expo run:ios/android` 或 `eas build`）：本地 Expo 模块（`modules/` 自定义原生代码）、Apple targets（小组件/扩展，`@bacons/apple-targets`）、Expo Go 不含的第三方原生模块、`app.json` 表达不了的原生配置。自定义构建更慢、要 Xcode/Android Studio，不确定就先 Expo Go。
3. **搭路由**：路由放 `app/` 目录，用 `_layout.tsx` 定义 Stack/Tabs；保证存在匹配 `/` 的路由（可在 group 内）。**绝不**在 `app/` 里同放组件/类型/工具（反模式）；移动路由时删旧文件。
4. **写 UI**：根组件套 ScrollView 保证响应式；遵循 Apple HIG；用内联样式（不支持 CSS/Tailwind）。
5. **加原生细节**：导航标题用 Stack 而非页面里的自定义文本；多用 `Link.Preview` 与上下文菜单；iOS 上条件性用 `expo-haptics`。

## 指令

**库选型（用新弃旧）：**
- `expo-audio` / `expo-video`（**不用** `expo-av`）；`expo-image` 的 `source="sf:name"` 渲染 SF Symbols（不用 `expo-symbols`/`@expo/vector-icons`）。
- `react-native-safe-area-context`（不用 RN 的 `SafeAreaView`）；`expo-glass-effect` 做液态玻璃。
- `process.env.EXPO_OS`（不用 `Platform.OS`）；`React.use`（不用 `React.useContext`）。
- 绝不用已从 RN 移除的 `Picker`/`WebView`/`SafeAreaView`/`AsyncStorage` 与 legacy `expo-permissions`。
- 绝不用 `img`/`div` 等内在元素（除非在 WebView 或 Expo DOM 组件里）；图片用 `expo-image` 的 `Image`。

**响应式与安全区：**
- 用 `<ScrollView contentInsetAdjustmentBehavior="automatic" />` 替代 `SafeAreaView`，FlatList/SectionList 同样加该属性；同时兼顾上下安全区。
- 布局用 flexbox，不用 Dimensions API；量屏幕用 `useWindowDimensions()`（不用 `Dimensions.get()`）。
- Stack 下的路由，第一个子元素几乎总应是带 `contentInsetAdjustmentBehavior="automatic"` 的 ScrollView，且 ScrollView 几乎总是路由组件内第一个组件。

**样式规则：**
- 优先 flex `gap` 而非 margin/padding；能 padding 就别 margin；圆角用 `{ borderCurve: 'continuous' }`（胶囊形除外）。
- 内联样式优先于 `StyleSheet.create`（除非复用更省）；状态变化加 entering/exiting 动画。
- 给 ScrollView 加内边距用 `contentContainerStyle` 的 padding/gap（减少裁剪），别加在 ScrollView 本身。
- 阴影用 CSS `boxShadow` 属性，**绝不**用 legacy RN shadow/elevation；支持 `inset`。
- 重要数据/错误文本加 `selectable`；计数器用 `{ fontVariant: 'tabular-nums' }`；大数字格式化为 1.4M、38k。

**代码风格：** 文件名 kebab-case（如 `comment-card.tsx`）、无特殊字符；import 置顶；注意转义嵌套反引号与引号；`tsconfig.json` 配路径别名并优先用别名。

**导航：** 路由间用 `expo-router` 的 `<Link href="/path" />`，包裹自定义组件用 `asChild`；Stack 用 `expo-router/stack`，**总是**用 `_layout.tsx` 定义；标题用 `<Stack.Screen options={{ title: "Home" }} />`；搜索栏优先 `Stack.Screen` 的 `headerSearchBarOptions`。

## 示例

**带原生 Tabs + 共享 group 的标准布局：**
```tsx
// app/_layout.tsx
import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";
import { Theme } from "../components/theme";

export default function Layout() {
  return (
    <Theme>
      <NativeTabs>
        <NativeTabs.Trigger name="(index)">
          <Icon sf="list.dash" />
          <Label>Items</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="(search)" role="search" />
      </NativeTabs>
    </Theme>
  );
}
```
```tsx
// app/(index,search)/_layout.tsx —— 两个 tab 共享、可各自 push 公共屏
import { Stack } from "expo-router/stack";
import { PlatformColor } from "react-native";

export default function Layout({ segment }) {
  const screen = segment.match(/\((.*)\)/)?.[1]!;
  const titles: Record<string, string> = { index: "Items", search: "Search" };
  return (
    <Stack screenOptions={{
      headerTransparent: true, headerShadowVisible: false,
      headerLargeStyle: { backgroundColor: "transparent" },
      headerTitleStyle: { color: PlatformColor("label") },
      headerLargeTitle: true, headerBlurEffect: "none",
      headerBackButtonDisplayMode: "minimal",
    }}>
      <Stack.Screen name={screen} options={{ title: titles[screen] }} />
      <Stack.Screen name="i/[id]" options={{ headerLargeTitle: false }} />
    </Stack>
  );
}
```

**模态 / 表单 Sheet：**
```tsx
<Stack.Screen name="modal" options={{ presentation: "modal" }} />

<Stack.Screen name="sheet" options={{
  presentation: "formSheet",
  sheetGrabberVisible: true,
  sheetAllowedDetents: [0.5, 1.0],
  contentStyle: { backgroundColor: "transparent" }, // iOS 26+ 背景变液态玻璃
}} />
```
优先用上述原生 modal/sheet，而非手写自定义弹窗组件。

**Link 上下文菜单 + 预览：**
```tsx
<Link href="/settings" asChild>
  <Link.Trigger><Pressable><Card /></Pressable></Link.Trigger>
  <Link.Menu>
    <Link.MenuAction title="Share" icon="square.and.arrow.up" onPress={onShare} />
    <Link.MenuAction title="Block" icon="nosign" destructive onPress={onBlock} />
  </Link.Menu>
  <Link.Preview />
</Link>
```

**阴影（CSS boxShadow，非 legacy）：**
```tsx
<View style={{ boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)" }} />
```

源仓库还附 `references/` 专题（按需查阅）：animations / controls / form-sheet / gradients / icons / media / route-structure / search / storage / tabs / toolbar-and-headers / visual-effects / webgpu-three / zoom-transitions。

## 注意事项

- **构建复杂度**：自定义构建（run:ios/android、eas build）显著增加复杂度、拖慢迭代、需配 Xcode/Android Studio；不确定一律先 Expo Go。
- **不支持 CSS/Tailwind**，统一内联样式；阴影只用 `boxShadow`，安全区只走 `contentInsetAdjustmentBehavior`/Header/Tabs，别用 `SafeAreaView`。
- **iOS 优先**：原生 Tabs、`headerSearchBarOptions`、`Link.Preview`、液态玻璃、`PlatformColor("label")` 等多为 iOS 体验，Android 需验证降级。
- 弃用 API 漂移快：动手前先核对现行包名与写法（用新弃旧表）。
- 本技能给结构与模式，仅当任务清晰匹配范围时使用；不替代环境内的运行验证、测试与专家评审，缺输入/权限/成功标准时先停下澄清。

## 互见

- requires：无。
- related：`react-native-architecture`（不绑 Expo 的 RN 工程架构与状态管理整体决策，本技能是其 Expo Router UI 子领域）；`ios-swiftui-developer`、`swiftui-best-practices`（纯原生 iOS 替代路线，跨平台 Expo 之外的另一选择）。
- combines_with：`react-state-management`（Expo Router 页面内的 React 状态/数据流方案，与本技能的路由/UI 结构叠加）；`react-native-architecture`（先用本技能搭 Expo Router 的导航与原生 UI，再用它定大盘架构与分层）。

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可）。

> 适配提示：原任务给的 `domain=研发/misc` 中的 `misc` 不在 `taxonomy.json` 中 02-engineering（研发）的受控类目（frontend/backend/mobile/review/testing/devops/observability/architecture），且仓库已归一为「0 misc」。落盘 frontmatter 时建议 `domain: 研发/mobile`（与同源 ios-swiftui-developer / flutter-expert 一致），否则 `scripts/build-index.mjs` 的 class 级校验会报 error。
