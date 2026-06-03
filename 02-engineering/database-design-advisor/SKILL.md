---
name: database-design-advisor
title: 数据库选型与迁移设计
description: 当需要做数据库选型（SQL/NoSQL）、设计 Schema、规划零停机迁移、优化索引与慢查询、设计分库分表与复制时使用；产出建模方案、迁移脚本（up/down）、索引与查询优化建议、选型决策矩阵；不适用于具体业务 SQL 调试代写、ORM 框架细节、运维集群部署。触发词：数据库设计、Schema、选型、迁移、索引、分库分表、慢查询
domain: 研发/architecture
triggers: [数据库设计, Schema 设计, 数据库选型, SQL 还是 NoSQL, 数据迁移, 零停机迁移, expand-contract, 索引优化, 慢查询, EXPLAIN, N+1, 分库分表, sharding, 读写分离, 读副本, 连接池, 数据建模, 范式, 数据库复制]
tags: [数据库, 架构, schema设计, 数据迁移, 索引优化, 查询优化, 选型, 分库分表, 复制, postgresql, mysql, nosql]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Grep, Glob, Bash, Write, Edit]
requires: []
related: []
combines_with: []
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

在以下数据架构决策场景使用本技能：

- 新项目或重构需要做**数据库选型**（SQL vs NoSQL、PostgreSQL/MySQL/SQLite/SQL Server 之间）。
- 设计或评审 **Schema**：范式（1NF~BCNF）、反范式取舍、数据类型、约束（外键/唯一/非空）、命名规范、ERD 建模。
- 规划**数据迁移**，尤其是要求**零停机**的演进式变更。
- 优化**索引与慢查询**：索引缺口、复合索引列序、冗余索引、EXPLAIN 解读、N+1 问题。
- 设计**分库分表（sharding）、复制、读写分离、连接池**等扩展性方案。

**不该用的边界（负边界）：**

- 只是要代写/调试某条具体业务 SQL —— 用日常 SQL 助手类技能。
- 纯 ORM 框架用法、应用层代码细节 —— 属于后端开发范畴。
- 数据库集群的基础设施供给、部署运维 —— 属于 DevOps 范畴。
- 不替代生产变更的实际评审与备份流程，仅提供方法与脚本草案。

## 步骤

1. **澄清需求与约束**：数据规模、读写比、一致性要求、延迟目标、团队既有技术栈、合规/地域要求。
2. **选型**：先默认 SQL（首选 PostgreSQL），仅当访问模式明确受益时才上 NoSQL。对照「选型决策矩阵」给出推荐与理由。
3. **Schema 设计**：确定范式层级与必要的反范式，定义合适的数据类型与约束，统一命名，必要时用 Mermaid 生成 ERD。
4. **索引规划**：按常见查询模式覆盖，避免过度索引；为外键补索引，确定复合索引列序，剔除冗余。
5. **迁移设计**：每个迁移配套可逆的 up/down 脚本；需要零停机时采用 expand-contract 模式，数据分批回填。
6. **性能优化**：用 `EXPLAIN (ANALYZE, BUFFERS)` 验证计划，排查 Seq Scan / N+1 / 内存不足等信号。
7. **扩展性方案**（按需）：分区/分片策略、复制模式、读写分离、连接池规格。
8. **交付**：建模方案 + 迁移脚本 + 索引/查询优化建议 + 选型与扩展性决策说明，并标注回滚与备份要求。

## 指令

**Schema 设计最佳实践：** 有意义且一致的命名；按存储效率选「恰好够用」的类型；定义外键/检查/唯一约束；预留增长空间；文档化关系与业务规则。

**安全约束：** 最小权限授予；敏感数据静态与传输加密；审计访问；校验输入防 SQL 注入；及时打安全补丁。

**索引类型速查（PostgreSQL）：**

| 类型 | 适用 | 示例 |
|------|------|------|
| B-tree（默认） | 等值、范围、ORDER BY | `CREATE INDEX idx_users_email ON users(email);` |
| GIN | 全文检索、JSONB、数组 | `CREATE INDEX idx_docs_body ON docs USING gin(to_tsvector('english', body));` |
| GiST | 几何、范围类型、最近邻 | `CREATE INDEX idx_locations ON places USING gist(coords);` |
| Partial（部分） | 行子集，减小体积 | `CREATE INDEX idx_active ON users(email) WHERE active = true;` |
| Covering（覆盖） | 仅索引扫描 | `CREATE INDEX idx_cov ON orders(customer_id) INCLUDE (total, created_at);` |

**EXPLAIN 关键信号：** 大表 `Seq Scan` → 缺索引；高行估算的 `Nested Loop` → 改 hash/merge join 或加索引；`Buffers shared read` 远高于 `hit` → 工作集超内存。

**连接池经验值：** 池大小约 `(2 * CPU 核数) + 磁盘主轴数`；云 SSD 从 `2 * vCPU` 起步再调优。PgBouncer（PG，事务/语句级池化）、ProxySQL（MySQL，读写分离/路由）、应用内池（HikariCP / SQLAlchemy）。

**选型决策矩阵（要点）：** PostgreSQL —— 新项目默认，复杂查询/JSONB/扩展性最佳；MySQL —— 既有生态、读多的简单 Web 应用；SQLite —— 移动端/CLI/单测/边缘（约 1 TB 单写上限）；SQL Server —— 企业 .NET/Azure 栈。NoSQL：MongoDB（文档，Schema 灵活）、Redis（KV/缓存，会话/限流/排行榜/pub-sub）、DynamoDB（宽列，Serverless AWS、任意规模个位毫秒延迟）。原则：默认 SQL，访问模式明确受益时才用 NoSQL。

**分片策略：** Hash（`shard = hash(key) % N`，分布均匀但重分片昂贵）；Range（按日期/ID，简单且适合时序，但最新分片有热点）；Geographic（按地域，数据本地化/合规，但跨域查询难）。

**复制模式：** 同步（强一致，写延迟高，用于金融交易）；异步（最终一致，写延迟低，用于读多 Web）；半同步（至少一副本确认，安全与速度折中）。读写分离：`SELECT` 走副本、写走主库；注意复制延迟，关键读前用 `pg_last_wal_replay_lsn()` 检测滞后。

## 示例

**零停机迁移（expand-contract 四步）：**

1. **Expand** —— 新增列/表（可空、带默认值）。
2. **Migrate** —— 分批回填，应用层双写。
3. **Transition** —— 应用改读新列，停止写旧列。
4. **Contract** —— 后续迁移中删除旧列。

**迁移文件命名（时间戳前缀，up/down 成对）：**

```
migrations/
├── 20260101_000001_create_users.up.sql
├── 20260101_000001_create_users.down.sql
├── 20260115_000002_add_users_email_index.up.sql
└── 20260115_000002_add_users_email_index.down.sql
```

**分批回填，避免长锁：**

```sql
UPDATE users SET email_normalized = LOWER(email)
WHERE id IN (SELECT id FROM users WHERE email_normalized IS NULL LIMIT 5000);
-- 循环执行直到影响行数为 0
```

**查询模式样例：**

```sql
-- 递归 CTE：组织架构层级
WITH RECURSIVE org AS (
  SELECT id, name, manager_id, 1 AS depth
  FROM employees WHERE manager_id IS NULL
  UNION ALL
  SELECT e.id, e.name, e.manager_id, o.depth + 1
  FROM employees e INNER JOIN org o ON o.id = e.manager_id
)
SELECT * FROM org ORDER BY depth, name;

-- 窗口函数：分页/去重与相邻行对比
SELECT *, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC) AS rn
FROM orders;
SELECT date, revenue,
  revenue - LAG(revenue) OVER (ORDER BY date) AS daily_change
FROM daily_sales;

-- 条件聚合（PostgreSQL FILTER）
SELECT
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE status = 'active') AS active
FROM accounts;
```

## 注意事项

- **迁移必可逆**：上线 `up.sql` 前先在预发环境验证 `down.sql`。
- **回滚窗口要短**：一旦执行了 contract（删列），回滚需要新的「前向」迁移，而非简单回退。
- **不可逆变更先备份**：删除含数据的列等操作前，先做逻辑备份。
- **N+1 排查**：症状是每行触发一次查询；修复用 JOIN/子查询一次取回、ORM 预加载（`select_related`/`includes`/`with`）、GraphQL 用 DataLoader。
- **不要过度索引**：索引加速读但拖慢写并占空间，仅覆盖真实高频查询模式。
- **分区/分片是最后手段**：单节点装不下或扛不住吞吐时才上；优先垂直拆分（拆列、隔离大字段）再考虑水平分片。
- **复制延迟**：异步复制通常 <1s，关键一致性读需显式检测滞后或走主库。

## 互见

- **sql-database-assistant** —— 日常 SQL 编写、优化与调试。
- **database-schema-designer** —— ERD 建模、范式分析与 Schema 生成。
- **migration-architect** —— 跨数据库引擎或大规模 Schema 重构的迁移规划。
- **senior-backend** —— 应用层模式（连接池、ORM 最佳实践）。
- **senior-devops** —— 数据库集群与副本的基础设施供给。

---

采编自 alirezarezvani/claude-skills（MIT 许可证），已按中文「技能大典」规范适配重写。
