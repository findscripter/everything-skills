---
name: tanstack-query
title: TanStack Query 异步状态管理
description: 当在 React/Next.js 中用 TanStack Query（React Query）做数据拉取、缓存失效、变更与乐观更新、SSR 水合时使用；做查询键设计、自定义 hook 封装、staleTime/gcTime 调优与 App Router 预取产物；不适用于非异步的纯客户端本地状态（用 useState/Zustand）、后端接口实现或其他数据库 ORM；触发词：TanStack Query、React Query、useQuery、useMutation、乐观更新、缓存失效、SSR 水合。
domain: 研发/frontend
triggers: [TanStack Query, React Query, useQuery, useMutation, queryKey, 乐观更新, 缓存失效, invalidateQueries, staleTime, SSR 水合, HydrationBoundary, App Router 数据]
tags: [react, nextjs, tanstack-query, react-query, frontend, data-fetching, state-management]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [@tanstack/react-query, react, nextjs, typescript]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

当技术栈已有 TanStack Query（旧名 React Query），需要在 React/Next.js 中处理异步服务端状态时使用：

- 搭建或重构数据拉取逻辑，替换 `useEffect` + `useState` 手写拉取。
- 设计查询键（数组式、强类型、可工厂化）。
- 配置全局或单查询的 `staleTime`/`gcTime`/`retry`/`enabled`。
- 写 `useMutation` 处理 POST/PUT/DELETE，并在成功后 `invalidateQueries` 失效缓存。
- 实现乐观更新（Optimistic Update）即时反馈 + 失败回滚。
- 集成 Next.js App Router：Server Component 预取 + Client 边界水合（hydration）。

铁律：栈里有 TanStack Query，就别再用 `useEffect` 手动拉数据。

不该用的边界：
- 纯客户端本地 UI 状态（表单输入、开关、弹窗）→ 用 `useState`/`useReducer`/Zustand，不是异步状态。
- 后端接口实现、数据库 ORM、GraphQL schema 设计 → 不在本技能范围。
- 全局同步状态（无网络往返）→ 别硬塞进 query 缓存。

## 步骤 / 指令

```
1. 封装 custom hook：把每个 useQuery/useMutation 包成 useUser()/useCreatePost()，
   集中管理 fetcher、TS 类型、queryKey。视图层只写 const { data } = useUser(id)。
2. 设计 queryKey：必须是数组，顺序敏感；筛选/排序参数作为对象进键
   （['issues', { status, sort }]）。大型应用用 key 工厂避免拼写漂移。
3. 配 staleTime：默认 0（每次挂载都后台 refetch）。数据非秒级变化就设全局
   staleTime（如 60s）。注意 gcTime 必须 ≥ staleTime。
4. 变更 + 失效：useMutation 的 mutationFn 发写请求，onSuccess 里
   queryClient.invalidateQueries({ queryKey: [...] }) 触发后台重拉。
5. 乐观更新（需即时反馈时）：onMutate 取消在途请求→快照旧值→setQueryData 抢先改；
   onError 用 context 回滚；onSettled 再 invalidateQueries 与服务端对齐。
6. Next.js App Router：providers.tsx 用 useState 惰性建 QueryClient；
   Server Component 里 prefetchQuery 后 dehydrate 包进 HydrationBoundary，
   Client Component 用相同 queryKey 的 useQuery 直接读水合缓存，挂载不再发请求。
```

规则：
- 所有 `useQuery`/`useMutation` 一律抽进 custom hook，视图只消费 hook。
- 用 key 工厂统一管理键，杜绝 `['users']` vs `['user']` 拼错。
- 优先 `invalidateQueries` 让其自然重拉，少用 `setQueryData` 手动改缓存（乐观更新除外）。
- 不要把 query 数据同步进本地 React state（`useEffect(() => setLocal(data), [data])`）；需要派生态就在 render 时直接派生。

## 示例

custom hook + 强类型 + 依赖查询：
```typescript
import { useQuery } from '@tanstack/react-query';

type User = { id: string; name: string; status: 'active' | 'inactive' };

const fetchUser = async (userId: string): Promise<User> => {
  const res = await fetch(`/api/users/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json();
};

export const useUser = (userId: string) =>
  useQuery({
    queryKey: ['users', userId],     // 数组式查询键
    queryFn: () => fetchUser(userId),
    staleTime: 1000 * 60 * 5,        // 5 分钟内视为新鲜，不后台重拉
    enabled: !!userId,               // 依赖查询：userId 存在才执行
  });
```

查询键工厂（大型应用推荐）：
```typescript
export const issueKeys = {
  all: ['issues'] as const,
  lists: () => [...issueKeys.all, 'list'] as const,
  list: (filters: string) => [...issueKeys.lists(), { filters }] as const,
  details: () => [...issueKeys.all, 'detail'] as const,
  detail: (id: number) => [...issueKeys.details(), id] as const,
};
```

变更 + 缓存失效：
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newPost: { title: string }) => {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] }); // 触发后台重拉
    },
  });
};
```

乐观更新（onMutate 抢先改 → onError 回滚 → onSettled 对齐）：
```typescript
export const useUpdateTodo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTodoFn,
    onMutate: async (newTodo) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] }); // 取消在途请求
      const previousTodos = queryClient.getQueryData(['todos']); // 快照旧值
      queryClient.setQueryData(['todos'], (old: any) =>
        old.map((t: any) => (t.id === newTodo.id ? { ...t, ...newTodo } : t))
      );
      return { previousTodos };                                 // 作为 context 返回
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['todos'], context?.previousTodos); // 回滚
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });   // 成败都对齐服务端
    },
  });
};
```

Next.js App Router 预取 + 水合：
```typescript
// app/providers.tsx
'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: { staleTime: 60 * 1000, refetchOnWindowFocus: false },
      },
    })
  )
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
```
```typescript
// app/posts/page.tsx (Server Component)
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import PostsList from './PostsList';

export default async function PostsPage() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({ queryKey: ['posts'], queryFn: fetchPostsServerSide });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PostsList />  {/* Client 组件用相同 queryKey 读缓存，挂载不再发请求 */}
    </HydrationBoundary>
  );
}
```

## 注意事项

- 无限拉取循环：多因 `queryFn` 在返回前抛未捕获异常（默认 retry 3 次），或被包进不稳定的 `useEffect`。调试时设 `retry: false` 定位。
- `staleTime` vs `gcTime`（旧名 `cacheTime`）：`staleTime` 决定何时后台重拉；`gcTime` 决定组件卸载后非活动数据在内存留存多久。`gcTime < staleTime` 会让数据在变陈旧前就被回收，务必 `gcTime ≥ staleTime`。
- 默认 `staleTime: 0` 意味着每次组件重挂载都触发后台 refetch；数据非秒级变化时设全局 `staleTime` 省请求。
- App Router 中 Server 与 Client 必须用同一 `queryKey`，否则水合失配仍会发网络请求。
- `refetchOnWindowFocus: false` 可避免切 Tab 时的激进重拉，按业务取舍。
- 本技能只覆盖前端异步状态层；接口契约、鉴权、错误码语义需结合具体后端验证，勿当作环境无关结论。输入/权限/成功判据缺失时应停下追问。

## 互见

- requires：无。
- related：`code-reviewer`（审查 React 数据层改动的正确性与坏味道）。
- combines_with：无。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
