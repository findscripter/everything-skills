---
name: erd-schema-designer
title: ERD 与数据库范式设计
description: 当从需求出发设计关系型数据库 schema、画 ERD、做范式化与表关系/约束/索引规划，或为多租户加隔离与软删除/审计字段时使用；产出实体关系模型（Mermaid ERD）、规范化表结构、关系与约束、索引与 RLS 策略草案；不适用于编写业务查询 SQL、本地 CSV 清洗、ORM/迁移工具具体语法调试；触发词：ERD、实体关系图、数据库设计、表结构设计、范式、normalization、schema design、多租户、软删除、索引策略、RLS
domain: 数据/sql
triggers: [ERD, 实体关系图, 数据库设计, 表结构设计, 范式, normalization, schema design, 数据库 schema, 表关系设计, 多租户, 软删除, soft delete, 索引策略, RLS, 审计日志, Mermaid ERD]
tags: [database, schema-design, erd, normalization, data-modeling, rls, index, multi-tenancy]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [sql, mermaid, prisma, drizzle, alembic]
requires: []
related: [sql-query-builder, nosql-distributed-db, database-design-advisor, postgresql-optimization]
combines_with: [sql-query-builder, postgresql-optimization, database-migration-strategies]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
# ERD 与数据库范式设计

## 何时使用

- 从业务需求出发设计一套新的关系型数据库 schema：识别实体、关系、约束、键。
- 画 ERD（Mermaid `erDiagram`）表达表与表之间的一对多 / 多对多关系。
- 对已有 schema 做范式化（1NF→3NF）与反范式权衡审查，排查重复存储、更新异常、性能问题。
- 为多租户 SaaS 加租户隔离、软删除、审计字段、乐观锁等横切关注点，并规划索引与 RLS 策略。

不该用的边界：

- 只是要写业务查询 SQL（联表 / 聚合 / 窗口）→ 用 `sql-query-builder`，本条只设计结构不写读查询。
- 数据已在本地 CSV、需清洗去重而非建模 → 用 `csv-data-cleaner`。
- 只想调试某个 ORM / 迁移工具的具体语法报错（Prisma/Drizzle/Alembic API 细节）→ 查对应官方文档，本条给的是结构与模式，迁移代码仅作示例骨架。
- 时序 / 文档 / 图数据库等非关系型选型评估 → 不在本条范围。

## 步骤

```
1. 需求 → 实体
   从一句话需求里抽名词：每个独立"东西"是一个实体（表）。
   例:"用户建项目，项目下有任务，任务可打标签、可指派给用户，要全量审计"
   → User, Project, Task, Label, TaskLabel(联结表), TaskAssignment, AuditLog

2. 识别关系与基数
   1──*（一对多）：在"多"方加 FK
   *──*（多对多）：拆成联结表（junction），只放两个 FK + 关系属性
   例: Task *──* Label  via TaskLabel ；Task *──* User via TaskAssignment

3. 范式化到 3NF（再按需反范式）
   1NF: 每列原子，不存数组/逗号串；重复组拆子表
   2NF: 非键列完全依赖整个主键（复合键场景下消除部分依赖）
   3NF: 消除传递依赖（非键列不依赖另一非键列）
   反范式只在有明确读热点 + 实测瓶颈时做，并记录冗余同步责任方

4. 定主键与约束
   PK 用不可变代理键：UUID / CUID，绝不用 email / slug 等可变自然键做 PK
   唯一约束放在自然键上（如 email UNIQUE、(org_id,user_id) UNIQUE）
   FK 全部显式声明，并明确 onDelete（Cascade / Restrict / SetNull）

5. 加横切关注点（按需勾选）
   多租户   : 所有租户级表加 organization_id
   软删除   : 加 deleted_at TIMESTAMPTZ，不做物理 DELETE
   审计     : 加 created_by/updated_by/created_at/updated_at
   乐观锁   : 加 version INTEGER，并发更新校验
   审计日志 : 单独 AuditLog 表，记 before/after JSON（合规域必备）

6. 规划索引
   每个 FK 列建索引
   高频过滤组合建复合索引（注意列顺序：等值在前、范围在后）
   "仅活跃行"查询用部分索引 WHERE deleted_at IS NULL

7. 多租户加 RLS（见示例），并用非超级用户角色实测策略

8. 产出 ERD（Mermaid）+ 表清单 + 索引清单 + RLS 草案，再交付迁移骨架
```

## 指令

范式化与建模决策口诀：

- 名词→表，动词/关联→关系；多对多一律拆联结表。
- 同一事实只存一处（3NF）；要冗余必须写清谁负责同步。
- PK 不可变、不外泄顺序（避免自增整数被遍历推断业务量）。
- 每条 FK 都建索引；`WHERE org_id=? AND status=?` 这类组合要复合索引。
- 可审计数据用软删除而非物理删除；活跃查询配部分索引。

RLS（Postgres，多租户隔离 + 软删除过滤 + 删除权限）：

```sql
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE ROLE app_user;

-- 仅能看到本组织项目下的任务
CREATE POLICY tasks_org_isolation ON tasks
  FOR ALL TO app_user
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN organization_members om ON om.organization_id = p.organization_id
      WHERE om.user_id = current_setting('app.current_user_id')::text
    )
  );

-- 软删除：永不返回已删除行
CREATE POLICY tasks_no_deleted ON tasks
  FOR SELECT TO app_user
  USING (deleted_at IS NULL);

-- 每个请求开始时注入用户上下文
SELECT set_config('app.current_user_id', $1, true);
```

ERD 生成命令（从 Prisma）：

```bash
npx prisma-erd-generator
# 或: npx @dbml/cli prisma2dbml -i schema.prisma | npx dbml-to-mermaid
```

## 示例

任务管理 SaaS 的 ERD（Mermaid `erDiagram`）：

```
erDiagram
    Organization ||--o{ OrganizationMember : has
    Organization ||--o{ Project : owns
    User ||--o{ OrganizationMember : joins
    User ||--o{ Task : "created by"
    Project ||--o{ Task : contains
    Task ||--o{ TaskAssignment : has
    Task ||--o{ TaskLabel : has
    Label ||--o{ TaskLabel : "applied to"
    User ||--o{ TaskAssignment : assigned

    Task {
        string id PK
        string project_id FK
        string title
        string status
        string priority
        timestamp due_date
        timestamp deleted_at
        int version
    }
```

带横切字段 + 索引的表结构（Prisma 片段，含部分索引与乐观锁）：

```prisma
model Task {
  id          String     @id @default(cuid())
  projectId   String     @map("project_id")
  title       String
  status      TaskStatus @default(TODO)
  version     Int        @default(1)              // 乐观锁
  createdById String     @map("created_by_id")
  createdAt   DateTime   @default(now()) @map("created_at")
  updatedAt   DateTime   @updatedAt @map("updated_at")
  deletedAt   DateTime?  @map("deleted_at")        // 软删除

  project     Project    @relation(fields: [projectId], references: [id])

  @@index([projectId])
  @@index([projectId, status])                     // 复合索引
  @@index([dueDate], where: { deletedAt: null })   // 部分索引：仅活跃行
  @@map("tasks")
}
```

迁移骨架可用 Drizzle / Prisma / TypeORM / Alembic 产出，结构定稿后再生成，避免反复重写。

## 注意事项

- 软删除不建部分索引 → `WHERE deleted_at IS NULL` 全表扫描，务必配 `WHERE deleted_at IS NULL` 的部分索引。
- 缺复合索引 → 多条件过滤走不到索引；按等值列在前、范围列在后排列。
- 用可变自然键（email/slug）做 PK → 改值即灾难，统一用 UUID/CUID 代理键。
- 给存量表加 NOT NULL 列不给默认值 → 迁移失败；先加默认值或分步回填。
- 无乐观锁 → 并发更新互相覆盖；加 `version` 列并在 UPDATE 时校验。
- RLS 未用非超级用户角色实测 → 超级用户绕过所有策略，必有遗漏。
- 反范式要克制：只在实测读热点出现后做，并明确冗余同步责任，否则引入更新异常。

## 互见

- requires：无。
- related：`sql-query-builder` —— schema 定稿后写查询；`csv-data-cleaner` —— 建表前清洗导入数据；`dbt-transformation-modeler` —— 分析层建模。
- combines_with：`sql-query-builder` —— 先建结构再写查询，构成"设计→取数"闭环。

---

本条采编自 alirezarezvani/claude-skills（MIT 许可）。
