---
name: react-state-management
title: React 状态管理
description: 当在 React 应用里搭建全局状态、同步服务端数据、或在 Redux Toolkit/Zustand/Jotai/React Query 间选型时使用；做：按本地/全局/服务端/URL/表单分类对症选库，给出 TS 范式、乐观更新与旧 Redux 迁移方案；不适用于纯后端逻辑、非 React 框架或单组件 useState 即可的简单 UI 状态；触发词：状态管理、全局状态、Redux、Zustand、Jotai、React Query、服务端状态、乐观更新、状态选型
domain: 研发/frontend
triggers: [状态管理, 全局状态, Redux, Redux Toolkit, Zustand, Jotai, React Query, TanStack Query, 服务端状态, 乐观更新, 状态选型, RTK 迁移]
tags: [react, state-management, redux-toolkit, zustand, jotai, react-query, typescript, frontend]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [React, TypeScript, Redux Toolkit, Zustand, Jotai, TanStack Query]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 在 React 应用里搭建**全局状态**、需要跨多个组件共享数据。
- 管理**服务端状态**（远程数据的请求、缓存、失效、乐观更新）。
- 需要在 **Redux Toolkit / Zustand / Jotai / React Query / SWR** 间做选型决策。
- 排查状态相关问题，或把**旧版 Redux 迁移**到 Redux Toolkit。
- 触发词：状态管理、全局状态、Redux、Zustand、Jotai、React Query、服务端状态、乐观更新、状态选型。

不该用的边界：

- 任务与 React 状态无关，或是非 React 框架（Vue/Svelte/Angular）→ 不属于本技能。
- 单组件本地 UI 状态用 `useState` / `useReducer` 即可解决，不要为它引入全局 store。
- 纯后端逻辑、数据建模、无界面的脚本 → 不属于本技能。
- 要做有强视觉诉求的界面实现 → 配合 `frontend-design`。

## 步骤 / 指令

第 1 步：先给状态分类，**不要把所有东西都塞进全局 store**。

| 类型 | 说明 | 选型 |
|------|------|------|
| 本地状态 | 组件私有、纯 UI | `useState`、`useReducer` |
| 全局状态 | 跨组件共享 | Redux Toolkit、Zustand、Jotai |
| 服务端状态 | 远程数据、缓存 | React Query、SWR、RTK Query |
| URL 状态 | 路由参数、查询串 | React Router、nuqs |
| 表单状态 | 输入值、校验 | React Hook Form、Formik |

第 2 步：按规模与场景选库（决策流程）。

```
小型应用、状态简单        → Zustand 或 Jotai
大型应用、状态复杂        → Redux Toolkit
重度服务端交互           → React Query + 轻量客户端状态
需要原子化/细粒度更新     → Jotai
```

第 3 步：客户端状态与服务端状态**分治**——客户端 UI 状态用 Zustand/Jotai，远程数据交给 React Query 托管，不要把服务端数据复制进客户端 store。

第 4 步：用 selector 做**选择性订阅**，避免无关组件重渲染；派生数据用计算而非另存一份。

第 5 步：服务端写操作配**乐观更新**：`onMutate` 先取消在途请求并快照旧值、立即写入新值；`onError` 回滚；`onSettled` 失效重拉。

## 示例

Zustand（最简，带 devtools + 持久化）：

```typescript
// store/useStore.ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface AppState {
  user: User | null
  theme: 'light' | 'dark'
  setUser: (user: User | null) => void
  toggleTheme: () => void
}

export const useStore = create<AppState>()(
  devtools(persist(
    (set) => ({
      user: null,
      theme: 'light',
      setUser: (user) => set({ user }),
      toggleTheme: () => set((state) => ({
        theme: state.theme === 'light' ? 'dark' : 'light'
      })),
    }),
    { name: 'app-storage' }
  ))
)
```

Redux Toolkit（typed hooks + createAsyncThunk）：

```typescript
// store/index.ts
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

// slices/userSlice.ts
export const fetchUser = createAsyncThunk(
  'user/fetchUser',
  async (userId: string, { rejectWithValue }) => {
    const res = await fetch(`/api/users/${userId}`)
    if (!res.ok) return rejectWithValue('Failed to fetch user')
    return res.json()
  }
)
// extraReducers 里挂 pending/fulfilled/rejected 三态
```

Jotai 原子状态（基础/派生/持久化/只写 action）：

```typescript
import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export const userAtom = atom<User | null>(null)
export const isAuthenticatedAtom = atom((get) => get(userAtom) !== null) // 派生
export const themeAtom = atomWithStorage<'light' | 'dark'>('theme', 'light')
export const logoutAtom = atom(null, (get, set) => { // 只写 action
  set(userAtom, null)
  localStorage.removeItem('token')
})
```

React Query 服务端状态（query keys 工厂 + 乐观更新）：

```typescript
export const userKeys = {
  all: ['users'] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: updateUser,
    onMutate: async (newUser) => {
      await qc.cancelQueries({ queryKey: userKeys.detail(newUser.id) })
      const previous = qc.getQueryData(userKeys.detail(newUser.id))
      qc.setQueryData(userKeys.detail(newUser.id), newUser) // 乐观写入
      return { previous }
    },
    onError: (_e, newUser, ctx) =>
      qc.setQueryData(userKeys.detail(newUser.id), ctx?.previous), // 回滚
    onSettled: (_d, _e, v) =>
      qc.invalidateQueries({ queryKey: userKeys.detail(v.id) }), // 失效重拉
  })
}
```

旧版 Redux → RTK 迁移（手写 action/switch reducer 换成 createSlice，Immer 允许「直接改」）：

```typescript
const todosSlice = createSlice({
  name: 'todos',
  initialState: [] as Todo[],
  reducers: {
    addTodo: (state, action: PayloadAction<string>) => {
      state.push({ text: action.payload, completed: false }) // Immer 代理
    },
  },
})
```

## 注意事项

- **不要过度全局化**：不是所有状态都该进全局 store，能就近放就别上浮。
- **不要复制服务端状态**：远程数据交给 React Query 托管，别在客户端 store 里再存一份导致两边不同步。
- **不要直接 mutate**：除 RTK/Immer 代理外，一律走不可变更新。
- **不要存派生数据**：派生值用计算（selector / 派生 atom），存下来必然会过期。
- **不要混范式**：每类状态选一个主方案，别在同一类里混用多套。
- 用 selector / 选择性订阅控制重渲染；全量类型化（TypeScript）以杜绝运行时错误。
- React Query 注意 `staleTime` 与 `gcTime`（旧名 `cacheTime`）的区别；`enabled: !!id` 避免无效请求。
- 本技能给的是范式与选型判断，落地仍需结合你的项目做环境验证与测试，不替代专家评审。

## 互见

- requires：无。
- related：`frontend-design`（状态搭好后做有设计感的界面实现）、`webapp-testing`（在浏览器里验证状态驱动的交互行为）。
- combines_with：`frontend-design`（状态层 + 视觉层组合成完整前端）、`webapp-testing`（「实现—验证」闭环）。

---

采编自 sickn33/antigravity-awesome-skills（MIT）。
