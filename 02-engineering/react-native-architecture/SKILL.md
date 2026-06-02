---
name: react-native-architecture
title: React Native 架构模式
description: 当用 Expo / React Native 起新项目或落地导航、状态管理、原生模块、离线优先架构与移动端性能/发布时使用；做项目结构、Expo Router、AuthProvider、React Query 离线缓存、原生能力封装、FlashList 优化与 EAS 构建发布的工程化方案产出；不适用于纯 Web 前端、Flutter/原生 iOS/Android 单端开发或与移动架构无关任务；触发词：React Native、Expo、Expo Router、EAS、离线优先、FlashList
domain: 研发/mobile
triggers: [React Native, Expo, Expo Router, EAS Build, 离线优先, FlashList, React Query 离线缓存, 原生模块, 推送通知, 生物识别, 移动端性能优化, OTA 更新]
tags: [React Native, Expo, 移动开发, Expo Router, 状态管理, 离线优先, EAS, 性能优化, TypeScript]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Edit, Write, Bash]
requires: []
related: [flutter-expert, jetpack-compose-expert, ios-swiftui-developer, react-state-management]
combines_with: [tanstack-query, app-store-optimization, rest-api-endpoint-builder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 新建 React Native / Expo 项目，需要一套可投产的目录结构与技术选型。
- 落地复杂导航（标签页 + 分组路由 + 动态路由 + 鉴权重定向）。
- 集成原生模块与平台能力（触感反馈、生物识别、推送通知）。
- 构建离线优先（offline-first）移动应用，需要本地缓存与乐观更新。
- 优化长列表渲染、动画帧率等移动端性能。
- 配置移动端 CI/CD 与商店发布（EAS Build / Submit / OTA）。

不该用的边界：
- 纯 Web 前端、非移动场景，或 Flutter / 原生 Swift-Kotlin 单端开发，本技能的 Expo 生态 API 不适用。
- 与移动架构无关的通用业务逻辑、后端 API 设计、UI 视觉设计。
- 输出代码不能替代针对具体 Expo SDK / RN 版本的真机测试与编译验证（依赖跨版本变动频繁）。
- 缺少目标平台（iOS/Android/Web）、Expo SDK 版本或成功标准时，先澄清再动手。

## 步骤

### 0. 选型：Expo 还是 Bare RN
优先 Expo（开发更快、内置 OTA、托管原生代码、EAS 构建）。仅当需大量自定义原生代码且 config plugin 无法覆盖时，才考虑 Bare RN。

| 维度 | Expo | Bare RN |
|---|---|---|
| 上手 | 低 | 高 |
| 原生模块 | EAS Build | 手动 linking |
| OTA 更新 | 内置 | 手动搭建 |
| 自定义原生代码 | Config plugins | 直接访问 |

### 1. 初始化与目录结构
```bash
npx create-expo-app@latest my-app -t expo-template-blank-typescript
npx expo install expo-router expo-status-bar react-native-safe-area-context
npx expo install @react-native-async-storage/async-storage
npx expo install expo-secure-store expo-haptics
```
推荐结构（`app/` 为 Expo Router 文件路由）：
```
src/
├── app/            # Expo Router 屏幕（(auth)/ (tabs)/ _layout.tsx）
├── components/     # ui/ 通用组件 · features/ 业务组件
├── hooks/          # 自定义 hook
├── services/       # API 与原生服务封装
├── stores/         # 状态管理
├── utils/  └── types/
```

### 2. 根布局：注入全局 Provider
在 `app/_layout.tsx` 用 Stack 定义路由栈，并自外向内包裹 QueryProvider / ThemeProvider：
```tsx
export default function RootLayout() {
  return (
    <QueryProvider>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
      </ThemeProvider>
    </QueryProvider>
  )
}
```

### 3. 导航：Expo Router
- 标签页用 `app/(tabs)/_layout.tsx` 的 `<Tabs>`，逐屏配 `tabBarIcon`。
- 动态路由用文件名 `[id].tsx`，屏幕内 `useLocalSearchParams<{ id: string }>()` 取参。
- 任意处编程式跳转：`router.push('/profile/123')` / `router.replace('/login')` / `router.back()`；带参用 `{ pathname, params }`。

### 4. 鉴权流：AuthProvider 守卫路由
用 Context 暴露 `user/signIn/signOut`，token 存 `expo-secure-store`，在 `useSegments()` 变化时重定向（见示例 1）。

### 5. 离线优先：React Query + 持久化
用 `PersistQueryClientProvider` 把缓存写进 AsyncStorage，并用 `NetInfo` 同步在线状态（见示例 2）。

### 6. 性能与发布
- 长列表用 `@shopify/flash-list` 的 `FlashList` 替代 `FlatList`，配 `estimatedItemSize`，列表项 `memo`、回调 `useCallback`。
- 发布用 EAS：`eas build` / `eas submit` / `eas update`（OTA）。

## 指令

- 选型先问：是否需要 Expo 无法托管的自定义原生代码？没有就用 Expo。
- Provider 包裹顺序自外向内：网络/数据层（QueryProvider）→ 主题 → 路由栈。
- 路由分组 `(auth)` / `(tabs)` 用括号目录隔离鉴权区与主区，鉴权重定向只在 `isLoading` 结束后执行。
- 密钥/token 一律进 `expo-secure-store` 或环境变量，绝不硬编码进代码。
- 调原生 API 前先判平台：`Platform.OS !== 'web'`，并对硬件能力做 `hasHardwareAsync` / `isEnrolledAsync` 探测。
- 列表默认 FlashList；样式用 `StyleSheet.create`，禁止内联样式；动画走 Reanimated（原生线程 60fps）。
- 平台差异用 `Button.ios.tsx` / `.android.tsx` / `.web.tsx` 分文件，或 `Platform.select({ ios, android })`。

## 示例

### 示例 1：AuthProvider 守卫路由
```tsx
export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => { checkAuth() }, [])

  useEffect(() => {
    if (isLoading) return
    const inAuthGroup = segments[0] === '(auth)'
    if (!user && !inAuthGroup) router.replace('/login')
    else if (user && inAuthGroup) router.replace('/(tabs)')
  }, [user, segments, isLoading])

  async function signIn(c: Credentials) {
    const { token, user } = await api.login(c)
    await SecureStore.setItemAsync('authToken', token)
    setUser(user)
  }
  // signOut: deleteItemAsync('authToken') + setUser(null)
  if (isLoading) return <SplashScreen />
  // ...AuthContext.Provider
}
```

### 示例 2：离线优先 React Query + 乐观更新
```tsx
// 同步在线状态
onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((s) => setOnline(!!s.isConnected))
)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24,   // 缓存保留 24h
      staleTime: 1000 * 60 * 5,      // 5min 内视为新鲜
      retry: 2,
      networkMode: 'offlineFirst',
    },
    mutations: { networkMode: 'offlineFirst' },
  },
})
// <PersistQueryClientProvider client={queryClient}
//   persistOptions={{ persister: createAsyncStoragePersister({ storage: AsyncStorage }) }}>

// 乐观更新：onMutate 先改本地缓存并备份，onError 回滚，onSettled 重新校验
export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createProduct,
    onMutate: async (newProduct) => {
      await qc.cancelQueries({ queryKey: ['products'] })
      const previous = qc.getQueryData(['products'])
      qc.setQueryData(['products'], (old: Product[]) => [...old, { ...newProduct, id: 'temp-' + Date.now() }])
      return { previous }
    },
    onError: (_e, _v, ctx) => qc.setQueryData(['products'], ctx?.previous),
    onSettled: () => qc.invalidateQueries({ queryKey: ['products'] }),
  })
}
```

### 示例 3：原生能力封装与 EAS
```ts
// 生物识别：先探测硬件与录入，再认证
export async function authWithBiometrics() {
  if (!(await LocalAuthentication.hasHardwareAsync())) return false
  if (!(await LocalAuthentication.isEnrolledAsync())) return false
  const r = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Authenticate to continue', fallbackLabel: 'Use passcode',
  })
  return r.success
}
```
```bash
# 构建 / 提交 / OTA
eas build --platform all --profile production
eas submit --platform ios
eas update --branch production --message "Bug fixes"
```

## 注意事项

- 真机优先：模拟器漏掉触感、推送、生物识别等真实问题，发版前务必真机验证。
- 版本兼容：Expo SDK / RN / 各 expo-* 库 API 跨版本变动大（如通知 handler、push token 取法），落地以目标版本文档为准并构建验证。
- 鉴权重定向竞态：必须等 `isLoading` 结束再判断 `segments`，否则会在初始化时误跳转。
- 推送通知：Android 需先 `setNotificationChannelAsync`；先查 `getPermissionsAsync` 再 `requestPermissionsAsync`，被拒直接返回 null；`getExpoPushTokenAsync` 要传 `projectId`。
- 性能五条：用 Expo、FlashList 替代 FlatList、组件 memo、Reanimated 走原生线程、真机测试。
- 反模式五条：勿内联样式、勿在 render 里 fetch、勿忽略平台差异、勿把密钥写进代码、勿省略 error boundary（移动端崩溃代价高）。

## 互见

- 研发/misc 下其他移动端 / 跨端开发与前端状态管理类技能。
- 涉及离线优先数据同步、乐观更新、长列表虚拟化的通用前端优化方法。
- 移动端 CI/CD 与应用商店发布流水线相关技能（EAS / fastlane 类）。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
