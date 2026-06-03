---
name: database-migration-strategies
title: 跨 ORM 数据库迁移与回滚策略
description: 当需要在 Sequelize/TypeORM/Prisma 等 ORM 上做 schema 变更、跨库迁移或线上零停机发布时使用；产出可双向执行（up/down）的迁移脚本、回滚预案与零停机分阶段方案；不适用于纯查询调优、备份恢复运维或无 ORM 的手工 SQL 改库；触发词：数据库迁移、回滚、零停机
domain: 研发/backend
triggers: [数据库迁移, schema 变更, 回滚策略, 零停机部署, 跨库迁移, ORM 迁移, migration, rollback, Sequelize, TypeORM, Prisma, 加字段, 改字段类型, 重命名列, 数据迁移, 蓝绿部署]
tags: [数据库, 迁移, orm, 回滚, 零停机, sequelize, typeorm, prisma, schema, 研发]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Sequelize CLI, TypeORM CLI, Prisma CLI, PostgreSQL, MySQL, SQL]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用场景：
- 在不同 ORM（Sequelize / TypeORM / Prisma）间编写或转换迁移脚本。
- 执行 schema 变换：加列、改类型、重命名列、拆分/合并字段。
- 在数据库之间迁移数据，或处理 PostgreSQL ↔ MySQL 方言差异（如 JSONB vs JSON）。
- 设计回滚预案、事务化迁移、检查点备份。
- 线上零停机发布（蓝绿 / 多阶段灰度）与数据库版本升级。

不该用的边界：
- 任务与「改库结构 / 迁移数据」无关（如纯查询性能调优、索引选型咨询、备份恢复运维）。
- 没有 ORM、需要纯手工 SQL 直接改生产库——本技能聚焦 ORM 迁移工作流。
- 缺少必要输入（目标 schema、数据量级、停机窗口、权限、成功判据）时，先停下来澄清，不要凭空生成。

## 步骤

1. 明确目标与约束：变更内容、表数据量、是否允许停机、回滚判据、目标方言。
2. 选定 ORM 的迁移机制，生成成对的 `up()` / `down()`。
3. 大表或破坏性变更拆成「加 → 回填 → 切流量 → 删旧」多个小步迁移。
4. 先在 staging 跑通正向 + 回滚，再上生产；尽量用事务保证原子性。
5. 上线前备份；上线中监控错误与锁/索引性能。

## 指令

- 每个 `up()` 必须配套可逆的 `down()`。
- 迁移应幂等、可重跑；优先小步、增量。
- 能用事务就用事务，失败即 `rollback()` 并抛错。
- 注意 NULL 值、外键约束、索引性能；不要一次迁移过量数据。
- 跨方言时用 `getDialect()` 分支处理类型差异。

各 ORM 执行/回滚命令：
- Sequelize：`npx sequelize-cli db:migrate` / 回滚 `npx sequelize-cli db:migrate:undo`
- TypeORM：`npm run typeorm migration:run` / 回滚 `npm run typeorm migration:revert`
- Prisma：开发 `npx prisma migrate dev --name xxx`；生产 `npx prisma migrate deploy`

## 示例

Sequelize 建表（成对 up/down）：
```javascript
// migrations/20231201-create-users.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      email: { type: Sequelize.STRING, unique: true, allowNull: false },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
  },
  down: async (queryInterface) => { await queryInterface.dropTable('users'); }
};
```

TypeORM 等价写法（`up` 建表 / `down` 删表）：
```typescript
export class CreateUsers1701234567 implements MigrationInterface {
  public async up(qr: QueryRunner): Promise<void> {
    await qr.createTable(new Table({
      name: 'users',
      columns: [
        { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
        { name: 'email', type: 'varchar', isUnique: true },
        { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' }
      ]
    }));
  }
  public async down(qr: QueryRunner): Promise<void> { await qr.dropTable('users'); }
}
```

Prisma schema：
```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  createdAt DateTime @default(now())
}
```

改列类型（大表多步：加新列 → 转数据 → 删旧 → 改名）：
```javascript
up: async (queryInterface, Sequelize) => {
  await queryInterface.addColumn('users', 'age_new', { type: Sequelize.INTEGER });
  await queryInterface.sequelize.query(
    `UPDATE users SET age_new = CAST(age AS INTEGER) WHERE age IS NOT NULL`);
  await queryInterface.removeColumn('users', 'age');
  await queryInterface.renameColumn('users', 'age_new', 'age');
}
```

事务化迁移（失败即整体回滚）：
```javascript
up: async (queryInterface, Sequelize) => {
  const t = await queryInterface.sequelize.transaction();
  try {
    await queryInterface.addColumn('users', 'verified',
      { type: Sequelize.BOOLEAN, defaultValue: false }, { transaction: t });
    await queryInterface.sequelize.query(
      'UPDATE users SET verified = true WHERE email_verified_at IS NOT NULL',
      { transaction: t });
    await t.commit();
  } catch (e) { await t.rollback(); throw e; }
}
```

零停机重命名列（蓝绿，分 5 阶段）：
1. 加新列 `email_new`（新旧代码都能跑）；
2. 部署「双写」代码，同时写新旧列；
3. 回填：`UPDATE users SET email_new = email WHERE email_new IS NULL`；
4. 部署「读新列」代码；
5. 删旧列 `removeColumn('users', 'email')`。

跨方言（PostgreSQL JSONB vs MySQL JSON）：
```javascript
const dialect = queryInterface.sequelize.getDialect();
const dataType = dialect === 'postgres' ? Sequelize.JSONB : Sequelize.JSON;
await queryInterface.createTable('users', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  data: { type: dataType }
});
```

## 注意事项

最佳实践：
- 每次迁移都要有回滚；先 staging 后生产；迁移前必备份。
- 尽量原子（事务）、小步增量、可重跑（幂等）；上线全程监控。
- 写清楚「为什么这么改、怎么改」的文档。

常见坑：
- 不测回滚流程；无停机策略就做破坏性变更。
- 忘记处理 NULL；忽略索引性能与外键约束。
- 一次迁移数据量过大导致长锁/超时。

底线：本技能输出不能替代环境特定的验证、测试与专家评审；缺少输入、权限、安全边界或成功判据时先澄清再动手。

## 互见

- 检查点回滚（建 `users_backup` 表，失败时从备份恢复）。
- 复杂数据迁移（逐行解析 `address_string` 拆为 street/city/state）。
- 配套资源（源仓库）：`references/orm-switching.md`、`references/schema-migration.md`、`references/data-transformation.md`、`references/rollback-strategies.md`、`assets/schema-migration-template.sql`、`assets/data-migration-script.py`、`scripts/test-migration.sh`。

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
