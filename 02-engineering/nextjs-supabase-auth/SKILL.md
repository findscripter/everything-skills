---
name: nextjs-supabase-auth
title: Next.js 与 Supabase 鉴权集成
description: 当在 Next.js App Router 项目中接入 Supabase Auth（登录/登出/OAuth/路由保护）时使用；产出浏览器与服务端 Supabase 客户端、middleware 会话刷新与守卫、OAuth 回调路由及 Server Action 鉴权代码；不适用于 Pages Router、非 Supabase 鉴权方案或纯数据库/RLS 设计。触发词：supabase auth、auth middleware、protected route、OAuth callback、会话管理
domain: 研发/backend
triggers: [supabase 鉴权, next.js 登录, auth middleware, 受保护路由, OAuth 回调, 会话刷新, getUser 校验, Server Action 登录, createServerClient, @supabase/ssr]
tags: [nextjs, supabase, auth, app-router, middleware, oauth, ssr, server-action, 后端, 研发]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [@supabase/ssr, Next.js App Router, TypeScript]
requires: []
related: [auth-implementation-patterns, neon-serverless-postgres, nestjs-expert, firebase-backend]
combines_with: [trpc-typesafe-api, zod-schema-validation, tanstack-query]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 在 **Next.js App Router** 项目里接入 Supabase Auth：邮箱密码登录、OAuth（Google/GitHub 等）、登出、受保护路由、会话刷新。
- 需要在 Server Component / Server Action 中读取已登录用户并据此渲染或重定向。

不该用：
- 仍在用 **Pages Router**（本技能的 cookies/middleware 写法基于 App Router，不通用）。
- 鉴权方案不是 Supabase（如 NextAuth、Clerk、自建 JWT）。
- 纯数据库、RLS 策略或表结构设计 —— 交给 supabase-backend 一类后端技能；本技能只覆盖应用层鉴权。

前置：已有 Next.js App Router 工程与 Supabase 项目，安装 `@supabase/ssr`，并配置 `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`。

## 步骤 / 指令

1. **建两套客户端**：浏览器用 `createBrowserClient`，服务端用 `createServerClient` + `cookies()`。永远按上下文选择，不要混用。
2. **加 middleware**：在 `middleware.ts` 里调用 `supabase.auth.getUser()` 刷新会话，并对受保护路径做重定向守卫。
3. **OAuth 回调路由**：用 OAuth 时必须建 `app/auth/callback/route.ts`，用 `exchangeCodeForSession(code)` 换取会话。
4. **Server Action 登录/登出**：在 `'use server'` 动作里调用 `signInWithPassword` / `signOut`，完成后 `revalidatePath('/', 'layout')` 再 `redirect`。
5. **校验用 getUser()**：所有鉴权判断用 `getUser()`（会验证 JWT），不要用 `getSession()`。

## 示例

**两套客户端**

```ts
// lib/supabase/client.ts —— 浏览器
'use client'
import { createBrowserClient } from '@supabase/ssr'
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// lib/supabase/server.ts —— 服务端
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options))
        },
      },
    }
  )
}
```

**middleware：刷新会话 + 路由守卫**

```ts
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser() // 顺带刷新会话
  if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

**OAuth 回调路由**

```ts
// app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${next}`)
  }
  return NextResponse.redirect(`${origin}/auth/error`)
}
```

**Server Action 登录/登出**

```ts
// app/actions/auth.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function signIn(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
```

**Server Component 取用户**

```ts
// app/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return <div><h1>Welcome, {user.email}</h1></div>
}
```

## 注意事项

按源技能的校验规则，逐条对照：

- **错误（ERROR）级**
  - 用 `getSession()` 做鉴权判断 —— 它不验证 JWT，安全检查一律改用 `getUser()`。
  - 用了 OAuth 却没有 `app/auth/callback/route.ts` —— 回调无处落地，必须补建。
  - 在服务端上下文里误用浏览器客户端 —— 改用 `createServerClient`。
- **警告（WARNING）级**
  - 没有 `middleware.ts` —— 缺少集中式路由保护与会话刷新，建议补上。
  - 硬编码 `localhost` 重定向 —— 改用 `origin` 或 `process.env.NEXT_PUBLIC_SITE_URL`，便于多环境。
  - 鉴权调用不处理错误 —— 一律解构 `{ data, error }` 并处理 `error` 分支。
  - 鉴权动作后不 `revalidatePath('/', 'layout')` —— 缓存可能展示过期登录态。
  - 仅靠客户端做路由保护 —— 会出现内容闪现（flash），应下沉到 middleware。

## 互见

- **supabase-backend**：涉及数据库、RLS、表与查询时委派。
- **nextjs-app-router**：涉及 route/page/component/layout 等 Next.js 结构模式时委派。
- **vercel-deployment**：涉及部署、生产、Vercel 配置时委派。
- **frontend**：涉及登录表单、按钮等 UI 组件时委派。
- 典型组合：数据库（supabase-backend）→ 鉴权（本技能）→ 路由保护（nextjs-app-router）→ 部署（vercel-deployment）；做带订阅的 SaaS 时再叠加 stripe-integration。

---

采编自 sickn33/antigravity-awesome-skills（MIT）。
