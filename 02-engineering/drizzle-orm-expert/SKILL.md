---
name: drizzle-orm-expert
title: Drizzle ORM 模式设计
description: 当用 TypeScript 搭建类型安全数据库层时使用；做 Drizzle 表结构/关系定义、关系查询、Drizzle Kit 迁移与 Serverless 客户端接入并产出可运行代码；不适用于 Prisma/TypeORM 等非 Drizzle 栈或纯运维调优；触发词：drizzle、schema、pgTable、drizzle-kit、relations、Neon/Turso
domain: 研发/backend
triggers: [drizzle, drizzle-orm, drizzle-kit, pgTable, schema 设计, relations 关系, db.query, InferSelectModel, 迁移 migrate, Neon, Turso, PlanetScale, Serverless 数据库, 从 Prisma 迁移]
tags: [Drizzle, ORM, TypeScript, 数据库, Schema, 迁移, Serverless, PostgreSQL]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Write, Edit, Bash]
requires: []
related: [prisma-orm-expert, database-migration-strategies, zod-schema-validation, neon-serverless-postgres]
combines_with: [trpc-typesafe-api, typescript-advanced-types, rest-api-endpoint-builder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 在新项目或现有项目中引入并配置 Drizzle ORM。
- 用 TypeScript 优先的方式设计数据库 schema（表、枚举、外键、索引）。
- 编写复杂关系查询（join、子查询、聚合）或使用 `db.query.*` 嵌套查询。
- 配置或排查 Drizzle Kit 迁移。
- 接入 Next.js App Router、tRPC、Hono，或 Neon/Turso/PlanetScale/Supabase 等 Serverless 数据库。
- 优化性能：预编译语句、批量、连接池。
- 从 Prisma / TypeORM / Knex 迁移到 Drizzle。

不该用（负边界）：
- 任务栈是 Prisma、TypeORM、Knex、Sequelize 等非 Drizzle ORM，或纯手写 SQL/原生驱动。
- 纯数据库运维/容量/索引调优而不涉及 Drizzle 代码层。
- 缺少 dialect、连接串、目标运行时等关键输入时，先停下来问清。

为什么用 Drizzle：TypeScript 优先、零运行时开销，直接编译成原生 SQL（不像 Prisma 依赖查询引擎二进制），适合边缘运行时与 Serverless；SQL 风格 API、全链路类型推断、类 Prisma 的关系查询 API 可避免 N+1。

## 步骤

1. 安装并选定 dialect（postgresql / mysql / sqlite），明确目标运行时与数据库。
2. 定义 schema（表、枚举、外键、索引），用 `relations()` 声明表间关系。
3. 用 `InferSelectModel` / `InferInsertModel` 从 schema 推断类型，避免手写 interface。
4. 创建数据库客户端，务必把 `{ schema }` 传入 `drizzle()` 以启用 `db.query.*`。
5. 写 `drizzle.config.ts`，开发期用 `push` 快速试错，生产用 `generate` + `migrate`。
6. 查询：简单/聚合用 SQL 风格 `db.select()`，嵌套数据用关系 API `db.query.*` 配 `with`。
7. 优化：高频查询用 `prepare()`，多条独立查询用 `db.batch()`，schema 内声明 `index()`。

## 指令

```bash
# 由 schema 变更生成迁移 SQL
npx drizzle-kit generate
# 直接推送 schema 到库（仅开发，跳过迁移文件，可能丢数据）
npx drizzle-kit push
# 执行待运行迁移（生产）
npx drizzle-kit migrate
# 打开 Drizzle Studio（GUI 浏览数据库）
npx drizzle-kit studio
```

## 示例

表与外键（pg-core）：

```typescript
import { pgTable, text, timestamp, boolean, uuid, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const roleEnum = pgEnum("role", ["admin", "user", "moderator"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const posts = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  published: boolean("published").default(false).notNull(),
  authorId: uuid("author_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
});
```

关系 + 类型推断：

```typescript
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

export const usersRelations = relations(users, ({ many }) => ({ posts: many(posts) }));
export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, { fields: [posts.authorId], references: [users.id] }),
}));

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
```

查询（SQL 风格 + 关系 API）：

```typescript
import { eq, desc, count } from "drizzle-orm";

// join + 过滤 + 排序
const postsWithAuthors = await db
  .select({ title: posts.title, authorName: users.name })
  .from(posts)
  .innerJoin(users, eq(posts.authorId, users.id))
  .where(eq(posts.published, true))
  .orderBy(desc(posts.createdAt));

// 关系 API：单次查询解析嵌套数据，避免 N+1
const usersWithPosts = await db.query.users.findMany({
  with: { posts: { where: eq(posts.published, true), limit: 5 } },
});
```

写入与事务：

```typescript
const [newUser] = await db.insert(users).values({ email, name }).returning();

const result = await db.transaction(async (tx) => {
  const [user] = await tx.insert(users).values({ email, name }).returning();
  await tx.insert(posts).values({ title: "Welcome", authorId: user.id });
  return user;
});
```

客户端接入（务必传 `{ schema }`）：

```typescript
// Neon Serverless (PostgreSQL)
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";
export const db = drizzle(neon(process.env.DATABASE_URL!), { schema });
```

Turso/LibSQL 用 `drizzle-orm/libsql` + `createClient`；PlanetScale 用 `drizzle-orm/planetscale-serverless` + `Client`。

性能：

```typescript
// 预编译语句：编译一次，多次执行
const getUserById = db.query.users
  .findFirst({ where: eq(users.id, sql.placeholder("id")) })
  .prepare("get_user_by_id");
const user = await getUserById.execute({ id: "abc-123" });

// 批量：多条独立查询一次往返
const [allUsers, recentPosts] = await db.batch([
  db.select().from(users),
  db.select().from(posts).orderBy(desc(posts.createdAt)).limit(10),
]);
```

## 注意事项

约定（Do）：
- schema 集中放 `db/schema.ts`，或按域拆分 `db/schema/users.ts` 等。
- 用 `InferSelectModel` / `InferInsertModel` 而非手写类型。
- 嵌套数据用 `db.query.*` 关系 API 避免 N+1；高频查询用预编译语句。
- 生产用 `generate` + `migrate`；`drizzle()` 必须传 `{ schema }`。

禁忌（Don't）：
- 生产环境别用 `drizzle-kit push`，可能造成数据丢失。
- 别在 Drizzle 查询构建器已支持的场景手写原生 SQL。
- 想用 `with` 就别忘了定义 `relations()`。
- Serverless 中别每请求新建连接，要用连接池。

排错：
- `db.query.tableName` 为 undefined：把所有 schema（含 relations）传入 `drizzle(client, { schema })`。
- schema 改动后迁移冲突：先 `drizzle-kit generate` 再 `drizzle-kit migrate`。
- MySQL 上 `.returning()` 报类型错：MySQL 不支持 `RETURNING`，改用 `.execute()` 并从结果读 `insertId`。

边界提醒：输出不替代针对具体环境的校验、测试与专家评审；缺少必要输入、权限、安全边界或验收标准时应停下来确认。

## 互见

- 关联：TypeScript 类型推断、Next.js App Router 数据层、Serverless / 边缘运行时数据库接入。
- 迁移来源对照：Prisma / TypeORM / Knex 迁移到 Drizzle。

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
