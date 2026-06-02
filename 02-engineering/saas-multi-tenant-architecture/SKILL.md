---
name: saas-multi-tenant-architecture
title: SaaS 多租户架构
description: 当为多客户共享数据库的 SaaS 设计租户隔离时使用；产出 tenant_id 列设计、PostgreSQL RLS 策略、租户感知中间件与 ORM 自动作用域、跨租户 admin 与租户开通方案；不适用于单用户应用或纯鉴权无租户作用域。触发词：多租户、租户隔离、RLS、tenant_id、行级安全、数据泄漏
domain: 研发/architecture
triggers: [多租户, 租户隔离, tenant_id, 行级安全 RLS, shared-schema 共享库, 跨租户 admin, 租户开通 provisioning, Prisma/Drizzle 租户作用域]
tags: [multi-tenancy, saas, row-level-security, postgresql, tenant-isolation]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [PostgreSQL, TypeScript, Prisma, Express, PgBouncer]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 构建多客户共享同一数据库的 SaaS，需要租户隔离 / 防数据泄漏。
- 要让每条查询自动按租户作用域，而非手写 WHERE。
- 在 shared-schema、schema-per-tenant、database-per-tenant 之间权衡。
- 给既有单租户应用补 `tenant_id`，或写 PostgreSQL RLS 策略。
- 实现 Express / Fastify / Next.js 的租户感知中间件，或必须跨租户访问的 admin 接口。

不该用（负边界）：
- 单用户、无共享基础设施的应用。
- 只做鉴权、不涉及租户作用域（改用鉴权类技能）。
- 一般数据库 schema 设计，无多租户需求。

## 步骤 / 指令

1. **选租户模型**。问清规模与隔离要求。<1000 租户的多数 SaaS，默认 shared-schema（每表一列 `tenant_id`）。schema-per-tenant 迁移要跑 N 次，运维成本高；database-per-tenant 仅在有数据驻留合规要求时才用。

2. **每张租户表加 `tenant_id`**。列须 `NOT NULL`，类型 `UUID` 或 `TEXT`，并进入每个复合索引。缺这一列就是等着发生的数据泄漏。

3. **配置 PostgreSQL RLS**。每张租户表建策略，按 `current_setting('app.current_tenant_id')` 过滤行。作为数据库层兜底：即便应用漏写 WHERE，RLS 也挡住跨租户读。

4. **租户感知中间件**。请求开始时从已认证 session / JWT claim 取 `tenant_id`，在事务内用 `set_config('app.current_tenant_id', $1, true)` 设到连接上，后续查询自动继承租户作用域。

5. **ORM 查询自动作用域**。Prisma 用全局 middleware 给 `findMany/findFirst/update/delete` 注入 `where: { tenantId }`；Drizzle 封装含租户过滤的基础查询构造器。绝不依赖开发者手动记得加过滤。

6. **租户感知迁移**。每个新建表迁移必须含 `tenant_id`；写 lint 规则 / CI 检查，拒绝任何无 `tenant_id` 的建表迁移，除非该表显式标记为全局表（如 `plans`、`feature_flags`）。

7. **跨租户 admin 路由单独建**。聚合跨租户数据的接口须显式绕过 RLS（`SET LOCAL role = 'admin_bypass'` 或专用数据库角色），且用独立的 admin 鉴权流保护，绝不复用租户用户 session。

8. **租户开通 provisioning**。新客户注册时创建租户记录、初始化默认数据（角色、设置、引导状态）、指派创始用户，整体包在事务里，避免部分开通留下孤儿记录。

## 示例

### 示例 1：租户隔离的 PostgreSQL RLS 策略

```sql
-- 开启 RLS（FORCE 让表属主也受策略约束）
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects FORCE ROW LEVEL SECURITY;

-- 读：只能看到 tenant_id 匹配会话变量的行
CREATE POLICY tenant_isolation ON projects
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- 写：新行必须匹配当前租户
CREATE POLICY tenant_insert ON projects
  FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

### 示例 2：Express 中间件，按请求设置租户上下文

```typescript
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function tenantMiddleware(req, res, next) {
  const tenantId = req.auth?.tenantId; // 鉴权阶段从 JWT 提取
  if (!tenantId) return res.status(403).json({ error: "No tenant context" });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // 用 set_config —— SET LOCAL 不接受绑定占位符（$1）
    await client.query("SELECT set_config('app.current_tenant_id', $1, true)", [tenantId]);
    req.db = client;
    req.tenantId = tenantId;

    // 在响应 finish 时清理，即使 handler 跳过 next() 也保证释放连接
    res.on("finish", async () => {
      try { await client.query("COMMIT"); } catch { await client.query("ROLLBACK"); }
      client.release();
    });

    next();
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    client.release();
    next(err);
  }
}
```

### 示例 3：Prisma 中间件，自动注入租户作用域

```typescript
import { PrismaClient } from "@prisma/client";

// 无 tenant_id 的全局表
const GLOBAL_TABLES = new Set(["Plan", "FeatureFlag", "SystemConfig"]);

function createTenantPrisma(tenantId: string): PrismaClient {
  const prisma = new PrismaClient();

  prisma.$use(async (params, next) => {
    if (GLOBAL_TABLES.has(params.model ?? "")) return next(params);

    // findMany() 等调用 args 可能是 undefined，先初始化
    params.args = params.args ?? {};
    params.args.where = params.args.where ?? {};

    // 读注入租户过滤（跳过 findUnique，它只接受唯一字段选择器）
    if (["findMany", "findFirst", "count", "aggregate"].includes(params.action)) {
      params.args.where = { ...params.args.where, tenantId };
    }

    // create 注入 tenant_id
    if (["create", "createMany"].includes(params.action)) {
      params.args.data = params.args.data ?? {};
      if (params.action === "createMany") {
        params.args.data = params.args.data.map((d: any) => ({ ...d, tenantId }));
      } else {
        params.args.data = { ...params.args.data, tenantId };
      }
    }

    // update / delete 限定作用域
    if (["update", "updateMany", "delete", "deleteMany"].includes(params.action)) {
      params.args.where = { ...params.args.where, tenantId };
    }

    return next(params);
  });

  return prisma;
}
```

## 注意事项

绝不做（高危红线）：
1. **绝不在无 `tenant_id` 过滤下查租户表**。原生 SQL 绕过 ORM 中间件，每条原生查询必须带 `WHERE tenant_id = $1` 或靠 RLS。一条 `SELECT * FROM invoices` 就泄漏所有客户账单。
2. **绝不只在应用 session 存 `tenant_id` 而不在数据库层强制**。应用层过滤是「建议」，RLS 才是「强制」。中间件出 bug 漏过滤时，只有 RLS 能挡住泄漏 —— 两层都要上。
3. **绝不用自增整数 ID 做租户资源主键**。顺序 ID（`invoice #1042`）可被攻击者递增枚举他人资源。租户资源主键一律用 UUID，整数 ID 留给内部表。
4. **绝不让租户用户访问 admin 聚合接口**。`GET /admin/metrics` 绝不能用普通租户 JWT 触达，跨租户路由用独立鉴权机制（API key、不同 issuer 的 admin role claim）。
5. **绝不在启用 RLS 的连接上跑迁移**。迁移用户要建表、加列、改策略；RLS 生效时 `ALTER TABLE` 可能静默失败或只作用于「当前租户视图」。迁移用专用 superuser 或 `bypassrls` 角色。
6. **用 `SET LOCAL` 时绝不跨租户共享连接池**。`SET LOCAL` 作用域限于事务；若上一请求事务未正确提交/回滚，连接带着陈旧租户上下文回池。清理路径里务必 `RESET app.current_tenant_id`。

边界情况：
- **租户删除与数据保留**：不能直接 `DELETE FROM tenants WHERE id = $1`，大数据集上外键级联会超时。改为软删（置 `deleted_at`）、吊销所有 session，再用后台任务分批删数据。
- **GDPR/合规数据导出**：维护「所有租户表」清单（解析迁移文件或维护 manifest），导出任务才不会漏掉后加的表。
- **租户间共享资源**：如市场场景中 A 的商品对 B 可见 —— 读公开（无租户过滤）、写仍限属主，建模为 `owner_tenant_id` 而非 `tenant_id`。
- **租户感知后台任务**：cron/队列 worker 没有 HTTP 请求可取 `tenant_id`，job payload 须带它，worker 处理前先设会话变量。绝不在无租户上下文下跑后台任务。
- **schema-per-tenant 连接池耗尽**：每 schema 一个池，500 租户即 500 池，迅速耗尽 `max_connections`。用 PgBouncer 事务模式，或撞墙前切回 shared-schema。

最佳实践：
- 建 `tenants` 表作单一事实源，含 `name`、`slug`（子域路由）、`plan_id`、`created_at`、`deleted_at`，所有 `tenant_id` 外键指向 `tenants.id`。
- `tenant_id` 放复合索引首列：`(tenant_id, created_at)` 同时服务「某租户全部」与「某租户按日期排序」；反序则无效。
- 用子域或路径前缀做租户路由（`acme.yourapp.com` 或 `/org/acme`），在边缘映射到 `tenant_id`，并缓存（Redis 或内存 60s TTL）。
- 显式区分租户表与全局表，同一清单复用于 ORM 中间件、迁移 linter、导出任务；不在任一清单的表，CI 应失败。
- 种子数据至少 3 个租户：1 个掩盖所有多租户 bug，2 个掩盖单向泄漏，3 个才能暴露排序/过滤 bug。
- 按租户而非全局限流：用 `ratelimit:{tenant_id}:{endpoint}` 滑动窗口，避免一个吵闹租户耗尽全员配额。

## 互见

- 鉴权 / JWT 类技能（提取 `tenant_id` 的上游）。
- PostgreSQL schema 设计与索引类技能。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
