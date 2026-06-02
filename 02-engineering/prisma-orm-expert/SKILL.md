---
name: prisma-orm-expert
title: Prisma ORM 专家
description: 当用 Prisma ORM 做 schema 设计、迁移、查询优化、关系建模或排查连接/事务问题（覆盖 PostgreSQL/MySQL/SQLite）时使用；产出可落地的 schema/查询/迁移修复与最佳实践方案；不适用于裸 SQL 调优、数据库服务器/连接池等基础设施配置（转交对应专项）；触发词：Prisma、schema.prisma、prisma migrate、N+1、$transaction、连接池
domain: 研发/backend
triggers: [Prisma, schema.prisma, prisma migrate, prisma generate, Prisma Client, N+1 查询, $transaction, 连接池耗尽, 迁移失败, relations 关系建模]
tags: [prisma, orm, database, migration, query-optimization, engineering]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [bash]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 设计或修复 `schema.prisma`：模型/关系定义、索引、枚举、字段类型、`@@map` 命名。
- 处理 Prisma Migrate：开发迁移、生产部署、迁移冲突/失败恢复、影子库问题。
- 查询优化：消除 N+1、用 `select`/`include` 控制取数、复杂聚合改裸查询、加日志定位慢查询。
- 连接管理与事务：连接池耗尽、Serverless 单例、`$transaction` 原子性、乐观并发、隔离级别。
- 覆盖 PostgreSQL / MySQL / SQLite。

不该用的边界（命中即停，建议转交）：
- **纯裸 SQL 调优 / 执行计划**：转 `postgres-expert` 或 `mongodb-expert`，本技能只在 Prisma 层面用 `$queryRaw` 衔接。
- **数据库服务器配置**（参数、存储、复制）：转 `database-expert`。
- **基础设施级连接池**（PgBouncer 部署、网络）：转 `devops-expert`，本技能只配 `DATABASE_URL` 与客户端生命周期。

## 步骤 / 指令

```
1. 先做环境探测（确认版本、provider、迁移与生成状态）
   npx prisma --version
   grep "provider" prisma/schema.prisma | head -1     # 数据库类型
   ls -la prisma/migrations/ | head -5                # 已有迁移
   ls -la node_modules/.prisma/client/ | head -3      # Client 是否已生成

2. 归类问题：schema 设计 / 迁移 / 查询优化 / 连接 / 事务（命中边界则停下转交）。

3. 排查反模式（见“注意事项”），用 CLI 复核：
   npx prisma validate        # 校验 schema
   npx prisma format          # 格式化
   npx prisma migrate status  # 迁移状态
   # 检测 schema 漂移：
   npx prisma migrate diff \
     --from-schema-datamodel prisma/schema.prisma \
     --to-schema-datasource  prisma/schema.prisma

4. 按“最小 → 更优 → 完整”三档给修复，默认给最小可行项，按需升级：
   - schema：补 @relation/@@index → 调字段类型 → 重构范式化、复合键
   - 迁移：开发库 reset → 手改 SQL + migrate resolve → 压缩迁移、建基线
   - 查询：include 避免 N+1 → select 只取所需 → $queryRaw + 缓存
   - 连接：DATABASE_URL 限连接数 → 生命周期管理 → 接 PgBouncer

5. 用 CLI/测试验证，绝不把产出当作免测的最终答案。
```

迁移工作流（区分开发 / 生产，**生产严禁 `migrate dev`**）：

```bash
# 开发：生成并应用迁移
npx prisma migrate dev --name descriptive_name

# 生产：只部署已有迁移
npx prisma migrate deploy

# 生产迁移失败后手动标记
npx prisma migrate resolve --applied "migration_name"
npx prisma migrate resolve --rolled-back "migration_name"
```

## 示例

schema 关系与索引（显式关系 + 级联 + 表名映射）：

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  posts     Post[]   @relation("UserPosts")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@index([email])
  @@map("users")
}

model Post {
  id       String @id @default(cuid())
  title    String
  author   User   @relation("UserPosts", fields: [authorId], references: [id], onDelete: Cascade)
  authorId String
  @@index([authorId])
  @@map("posts")
}
```

查询优化三档（消除 N+1 → select 收窄 → 裸查询聚合）：

```typescript
// BAD：N+1，循环里逐条查
const users = await prisma.user.findMany();
for (const u of users) {
  await prisma.post.findMany({ where: { authorId: u.id } });
}

// GOOD：include 一次取关联
const users = await prisma.user.findMany({ include: { posts: true } });

// BETTER：select 只取需要的字段
const users = await prisma.user.findMany({
  select: { id: true, email: true, posts: { select: { id: true, title: true } } },
});

// BEST（复杂聚合）：$queryRaw
const rows = await prisma.$queryRaw`
  SELECT u.id, u.email, COUNT(p.id) AS post_count
  FROM users u LEFT JOIN posts p ON p.author_id = u.id
  GROUP BY u.id`;
```

事务与乐观并发：

```typescript
// 交互式事务：手动控制 + 业务校验
const res = await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: userData });
  if (user.email.endsWith("@blocked.com")) throw new Error("blocked");
  const profile = await tx.profile.create({ data: { ...profileData, userId: user.id } });
  return { user, profile };
}, { maxWait: 5000, timeout: 10000, isolationLevel: "Serializable" });

// 乐观并发：version 匹配才更新
await prisma.post.update({
  where: { id: postId, version: currentVersion },
  data: { content: newContent, version: { increment: 1 } },
});
// 冲突错误码 P2034 需捕获重试
```

Serverless 单例 + 连接配置（防连接泄漏 / 池耗尽）：

```typescript
const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query"] : [],
});
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
process.on("beforeExit", async () => { await prisma.$disconnect(); });
```

```env
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=5&pool_timeout=10"
```

慢查询定位：客户端开 `log: ['query','info','warn','error']`，或监听 `query` 事件打印 `e.query` / `e.duration`。

## 注意事项

避免的反模式：
- **隐式多对多滥用**：复杂关系用显式连接表，别全靠隐式 `[]` 关系。
- **过度 include**：不需要的关联别带，徒增取数与内存。
- **忽视连接上限**：按环境（尤其 Serverless）显式配 `connection_limit`。
- **裸查询滥用**：能用 Prisma 查询就用，`$queryRaw` 只留给复杂聚合。
- **生产用 `migrate dev`**：生产只能 `migrate deploy`。

审查清单要点：
- 每个模型有 `@id`；关系写全 `@relation(fields, references)` 与 `onDelete/onUpdate`。
- 高频查询字段加索引，多列查询用复合索引；固定取值集用枚举。
- 列表查询有分页；`select` 收窄字段；外连接 NULL 与 `NOT IN` 含 NULL 陷阱要留意。
- 迁移上线前测过、向后兼容（无数据丢失）、有回滚预案。

通用约束：仅当任务明确落在上述范围内才用；产出不能替代环境特定的验证、测试与专家复核；缺关键输入/权限/安全边界/成功标准时，停下追问。

## 互见

- requires：无。
- related：`code-reviewer`（审查 Prisma 相关代码改动的正确性与质量）；`sql-query-builder`（当需求下沉到 `$queryRaw` 的裸 SQL 联表/聚合/窗口时衔接）。
- 边界转交（非本库技能则提示用户）：裸 SQL/执行计划 → postgres-expert/mongodb-expert；DB 服务器配置 → database-expert；基础设施连接池 → devops-expert。

---
采编自 sickn33/antigravity-awesome-skills（`prisma-expert`，MIT 许可证），已按本库 SCHEMA 适配重写为中文。
