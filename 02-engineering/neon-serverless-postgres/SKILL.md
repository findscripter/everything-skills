---
name: neon-serverless-postgres
title: Neon Serverless Postgres
description: 当在 Serverless/Edge 环境接入 Neon Postgres，或需要数据库分支、连接池、Prisma/Drizzle 集成时使用；做 Neon 连接串配置、PgBouncer 连接池、分支化预览环境与冷启动应对的可执行方案；不适用于自建/非 Neon 的 Postgres 运维、SQL 调优本身、其他云数据库。触发词：Neon、serverless postgres、数据库分支、连接池、PgBouncer、预览环境
domain: 研发/backend
triggers: [Neon, Neon Postgres, serverless postgres, 无服务器 Postgres, 数据库分支, branching, 连接池, PgBouncer, Prisma Neon, Drizzle Neon, 预览环境, preview database, DIRECT_URL, pooler, 冷启动, scale-to-zero]
tags: [数据库, postgres, neon, serverless, prisma, drizzle, 连接池, 数据库分支, vercel, edge]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Prisma, Drizzle, Neon CLI, @neondatabase/serverless, Vercel, GitHub Actions]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 在 Serverless Functions / Edge / Next.js on Vercel 等环境接入 Neon Postgres，需要正确处理连接池与连接数上限时。
- 用 Prisma 或 Drizzle 对接 Neon，需要区分「池化连接」与「直连」（迁移/DDL）时。
- 想用数据库分支（copy-on-write）为每个 PR/预览部署/调试场景创建隔离副本时。
- 需要应对 scale-to-zero 冷启动延迟、配置自动伸缩与计算规格时。

不该用的边界：
- 自建或非 Neon 的 Postgres 运维、备份恢复、参数调优——本技能特定于 Neon 的连接串/分支/PgBouncer 行为。
- 纯 SQL 语句优化、索引设计、查询性能问题本身。
- 其他云数据库（RDS、Supabase、PlanetScale 等）的集成。

## 步骤

1. 准备两个连接串：池化（主机名含 `-pooler`）用于应用查询；直连（无 `-pooler`）用于迁移/DDL。两者都需 `sslmode=require`。
2. 选 ORM 与驱动：Prisma 用 `url`(池化)+`directUrl`(直连)；Drizzle 在 Edge/一次性查询用 `neon-http`，需要事务用 `neon-serverless`(WebSocket Pool)。
3. 单例化客户端：复用全局 Prisma 实例或共享 Pool，避免每请求新建连接。Serverless 本地池保持 `max: 5-10`，靠 PgBouncer 承接高并发。
4. 迁移始终走直连：`prisma migrate deploy` / `drizzle-kit migrate`。
5. 分支化预览：在 CI（GitHub Actions / Vercel 集成）中「每个 PR 建分支 → 跑迁移 → 部署 → PR 关闭即删分支」。
6. 生产环境：关闭 scale-to-zero、设置最小计算规格，应用层加冷启动重试。

## 指令

```bash
# 创建分支（从 main）
neon branches create --name feature/new-feature --parent main
# 按时间点创建分支（PITR 调试）
neon branches create --name debug/yesterday --parent main --timestamp "2024-01-15T10:00:00Z"
neon branches list
neon connection-string feature/new-feature   # 获取分支连接串
neon branches delete feature/new-feature      # 用完即删

# Prisma 迁移（自动走 directUrl）
npx prisma migrate dev
npx prisma migrate deploy

# Drizzle
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit
npx drizzle-kit generate
npx drizzle-kit migrate
```

连接串格式（关键区别在 `-pooler`）：
```
# 池化（应用查询）
postgres://user:pass@ep-cool-name-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
# 直连（迁移/DDL）
postgres://user:pass@ep-cool-name.us-east-2.aws.neon.tech/neondb?sslmode=require
# PG17+ 降低冷启动握手延迟
...neon.tech/db?sslmode=require&sslnegotiation=direct
```

## 示例

Prisma 接入（`.env` + schema + 单例）：
```dotenv
DATABASE_URL="postgres://user:password@ep-xxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgres://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")   // 池化
  directUrl = env("DIRECT_URL")     // 直连，迁移必需
}
```
```ts
// lib/prisma.ts —— 全局单例，避免每请求新建
import { PrismaClient } from '@prisma/client';
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

Drizzle —— Edge 用 HTTP 驱动，事务用 WebSocket：
```ts
// HTTP：最快的一次性查询（不支持事务）
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });

// WebSocket：需要事务时
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 10, idleTimeoutMillis: 30000, connectionTimeoutMillis: 10000 });
export const db = drizzle(pool, { schema });
await db.transaction(async (tx) => {
  await tx.insert(users).values({ email: 'test@example.com' });
});
```

Vercel 每 PR 一个数据库分支（GitHub Actions 摘要）：
```yaml
- uses: neondatabase/create-branch-action@v5
  id: create-branch
  with:
    project_id: ${{ secrets.NEON_PROJECT_ID }}
    branch_name: preview/pr-${{ github.event.pull_request.number }}
    api_key: ${{ secrets.NEON_API_KEY }}
- name: Run migrations
  env:
    DATABASE_URL: ${{ steps.create-branch.outputs.db_url_with_pooler }}
  run: npx prisma migrate deploy
# PR 关闭时用 neondatabase/delete-branch-action@v3 删除分支
```
Vercel 集成注入变量：`DATABASE_URL`(池化)、`DATABASE_URL_UNPOOLED`(直连，对应 Prisma 的 `directUrl`)。把 `prisma migrate deploy` 加进 `vercel-build`。

冷启动重试（应对 scale-to-zero 唤醒）：
```ts
const MAX_RETRIES = 3, RETRY_DELAY = 1000;
export async function queryWithRetry<T>(query: () => Promise<T>): Promise<T> {
  let lastError: Error | undefined;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try { return await query(); }
    catch (error: any) {
      lastError = error;
      if (error.code === 'P1001' || error.code === 'P1002') { // 连接错误=可能在冷启动
        await new Promise(r => setTimeout(r, RETRY_DELAY * attempt));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}
```

## 注意事项

反模式（高危优先）：
- 用池化连接跑迁移：DDL 经 PgBouncer 会失败 → Prisma 设 `directUrl` 指向非池化端点；`directUrl` 也不能指向 pooler。
- Serverless 里用原生 `pg`/TCP 驱动：部分 Edge 环境不支持 → 改用 `@neondatabase/serverless`。
- 用 HTTP 驱动 (`neon()`) 跑事务：不支持 → 事务用 WebSocket 的 `Pool`。
- 每请求新建连接或新建客户端：迅速耗尽连接数 → 复用单例/连接池。
- Serverless 本地池 `max` 设太高：函数实例多 × 每实例一池 = 连接爆表 → 本地池保持 5-10，靠 PgBouncer。
- 生产开启 scale-to-zero：首请求增加 500ms+ 冷启动延迟 → 生产分支关闭 scale-to-zero、设最小计算规格；首连接加指数退避重试。
- 分支不清理：存储与混乱累积 → PR 关闭自动删分支。删除父分支会影响子分支，注意层级。
- 多预览共用一个库：相互干扰 → 集成里开「每预览一分支」，并在 build 步骤跑迁移防 schema 漂移。

约束与配额：
- pooler 最多约 10000 并发连接，但仍消耗底层 Postgres 连接；Neon 超级用户保留约 7 个连接。
- 计算规格对应直连上限参考：0.25 CU≈112、0.5 CU≈225、1 CU≈450、2 CU≈901、4 CU≈1802、8 CU≈3604。
- 规格建议：开发 0.25 CU + scale-to-zero；预发 0.5 CU；生产 1+ CU 且关闭 scale-to-zero；高流量 2-4 CU 起 + 自动伸缩。

校验红线（提交前自查）：
- 客户端代码出现直连 URL（应只暴露池化 URL，且仅服务端用）→ 错误。
- 硬编码连接串（应走环境变量）→ 错误。
- 连接串缺 `sslmode=require` → 警告，Neon 强制 SSL。
- Prisma 缺 `directUrl` 或 `directUrl` 指向 pooler → 迁移会失败，错误。

## 互见

- 需要鉴权（User 表带 clerkId）→ clerk-auth
- 需要缓存/会话存储 → redis-specialist
- 需要超出 Postgres 能力的全文搜索 → algolia-search
- 需要部署与环境变量/预览库联动 → vercel-deployment

---
采编自 sickn33/antigravity-awesome-skills（MIT，原条目源自 vibeship-spawner-skills）。
