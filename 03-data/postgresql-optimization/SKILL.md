---
name: postgresql-optimization
title: PostgreSQL 性能优化
description: 当 PostgreSQL 查询慢、需做索引设计、配置调优、VACUUM/膨胀治理或性能监控时使用；按「评估→EXPLAIN 分析→索引→改写→配置→维护→监控」七步产出优化方案与可执行 SQL；不适用于库选型、应用层逻辑或非 PG 数据库（MySQL/Oracle 等）；触发词：PostgreSQL 慢查询、EXPLAIN ANALYZE、加索引、pg 调优、shared_buffers、autovacuum、表膨胀。
domain: 数据/sql
triggers: [PostgreSQL 慢查询, pg 性能优化, EXPLAIN ANALYZE, 加索引, pg 调优, shared_buffers, work_mem, autovacuum, 表膨胀, pg_stat_statements]
tags: [postgresql, database, performance, indexing, vacuum, sql-tuning]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [postgresql, psql]
requires: []
related: [erd-schema-designer, sql-query-builder, nosql-distributed-db, neon-serverless-postgres]
combines_with: [sql-query-builder, erd-schema-designer, database-migration-strategies]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- PostgreSQL 查询变慢、CPU/IO 飙高、连接堆积，需定位瓶颈并出优化方案。
- 设计索引策略（B-tree / 复合 / 部分 / 覆盖 / GIN-GiST）、改写低效 SQL。
- 调优实例参数（shared_buffers、work_mem、effective_cache_size、checkpoint、autovacuum）。
- 治理 VACUUM/膨胀、过期统计信息，或搭建 PG 性能监控。

不该用的边界：
- 仅写一条普通查询、不涉及性能 → 用 `sql-query-builder`。
- 数据库选型、分库分表架构、应用层缓存/连接池设计 → 超出本技能。
- 非 PostgreSQL（MySQL/Oracle/SQL Server 等）→ 执行计划、参数、系统视图均不同，勿照搬。
- 无法连库、拿不到 EXPLAIN/系统视图权限 → 先取访问权限，不要凭空猜瓶颈。

## 步骤 / 指令

按序推进，**每步先观测再动手**，单次只改一处并复测，避免叠加变更无法归因。

```
1. 评估现状（只读）
   - 版本与配置：SELECT version();  SHOW shared_buffers; SHOW work_mem;
   - 找慢查询：启用并查 pg_stat_statements，按 total_exec_time / mean_exec_time 排序
   - 资源面：连接数、cache 命中率、锁等待、autovacuum 是否在跑
2. 分析单条慢查询
   - EXPLAIN (ANALYZE, BUFFERS) <sql>; 看实际耗时与扫描行数
   - 警惕：Seq Scan 大表、估算行数与实际严重偏差（统计信息过期）、Nested Loop 放大、外部 Sort（work_mem 不足落盘）
3. 索引策略
   - 高频过滤/连接列建 B-tree；多列等值+范围用复合索引（等值列在前）
   - 只查部分行用部分索引 WHERE；只取索引内列用覆盖索引 INCLUDE
   - 全文/JSONB/数组用 GIN，地理/范围用 GiST
   - 建完查 pg_stat_user_indexes 确认被用；删掉从不命中的冗余索引
4. 改写查询
   - 消除函数包裹索引列（DATE(col) 致失效）、SELECT * → 只取所需列
   - 低效 IN 子查询 → EXISTS；嵌套逻辑 → CTE 拆分；大 OFFSET 分页 → keyset（WHERE id > :last）
5. 配置调优（改后需 reload 或 restart，逐项验证）
   - shared_buffers ≈ 内存 25%；effective_cache_size ≈ 内存 50%~75%
   - work_mem 按「单会话排序/哈希内存 × 并发」估算，勿设过大致 OOM
   - 调 checkpoint_timeout / max_wal_size 平滑写入；按写入量调 autovacuum 触发阈值
6. 维护
   - 定期 ANALYZE 刷新统计信息；VACUUM 回收死元组
   - 查表膨胀，必要时 VACUUM (FULL) 或 pg_repack（FULL 持锁，避开高峰）
7. 监控
   - 持续采集 pg_stat_statements、命中率、膨胀、复制延迟，配告警看趋势
```

## 示例

定位最耗时的查询：
```sql
-- 需预先 CREATE EXTENSION pg_stat_statements; 并在 shared_preload_libraries 加载
SELECT query, calls, round(mean_exec_time::numeric, 2) AS avg_ms,
       round(total_exec_time::numeric, 2) AS total_ms, rows
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;
```

看真实执行计划（带缓冲与实际行数）：
```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT o.id, o.amount
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE c.region = 'CN' AND o.created_at >= DATE '2025-01-01';
-- 关注：是否 Seq Scan 大表 / estimated 与 actual rows 偏差 / Sort 是否 disk
```

针对性建索引（复合 + 部分）并核对命中：
```sql
CREATE INDEX CONCURRENTLY idx_orders_cust_created
  ON orders (customer_id, created_at)
  WHERE created_at >= DATE '2025-01-01';   -- 部分索引，缩小体积
-- CONCURRENTLY 不锁写，建库高峰也可执行

SELECT relname, idx_scan FROM pg_stat_user_indexes
WHERE relname = 'orders';
```

查表膨胀与维护：
```sql
SELECT relname, n_live_tup, n_dead_tup,
       round(100 * n_dead_tup / nullif(n_live_tup + n_dead_tup, 0), 1) AS dead_pct
FROM pg_stat_user_tables ORDER BY dead_pct DESC NULLS LAST LIMIT 10;

ANALYZE orders;        -- 刷新统计信息（计划变差时优先）
VACUUM (VERBOSE) orders;
```

给 Agent 的提示词模板：
```
PG 版本=16。表 orders(id,customer_id,amount,created_at,status)。
现象：<慢查询/高 IO>。已附 EXPLAIN (ANALYZE, BUFFERS) 输出：<粘贴>。
要求：定位瓶颈→给索引/改写/配置方案，每项注明权衡与验证方式；DDL 用 CONCURRENTLY；改配置只给一处并说明 reload/restart。
```

## 注意事项

- 用 `EXPLAIN (ANALYZE)` 看真实耗时而非裸 `EXPLAIN` 的估算；ANALYZE 会真实执行，**写操作慎用**（必要时包事务回滚）。
- 生产建/删索引用 `CREATE INDEX CONCURRENTLY` / `DROP INDEX CONCURRENTLY` 避免锁写；它不能在事务块内执行，失败会留下 INVALID 索引需清理。
- 配置改动逐项试，记录基线指标；shared_buffers/部分参数需 restart，work_mem 等可 `pg_reload_conf()`。`work_mem` 是每排序/哈希节点的上限，会被并发与多节点放大，设过高易 OOM。
- 统计信息过期是计划变差的头号原因——计划异常先 `ANALYZE`，再谈索引。
- `VACUUM FULL` 持 ACCESS EXCLUSIVE 锁并重写整表，避开业务高峰；常规膨胀靠 autovacuum + 定期 `VACUUM`，大表用 `pg_repack` 在线整理。
- 索引并非越多越好：拖慢写入、占空间，删除前用 `pg_stat_user_indexes.idx_scan` 确认确实无人使用。
- 任何 DDL、配置、VACUUM FULL 等非只读操作执行前须用户确认并具备回滚预案；本技能产出方案，不擅自在生产执行。

## 互见

- requires：无。
- related：`sql-query-builder`（先写对查询，再来本技能调性能）。
- combines_with：`csv-data-cleaner`（导出 PG 数据做离线清洗时衔接）。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。已适配重写：将原「调用 @other-skill」的编排式流程改写为自包含、可执行的 PostgreSQL 调优 playbook，保留其七阶段骨架与 EXPLAIN ANALYZE、索引类型、shared_buffers/work_mem/effective_cache_size/checkpoint/autovacuum、VACUUM/膨胀、监控等关键约束。
