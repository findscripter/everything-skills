---
name: odoo-performance-tuner
title: Odoo 性能诊断与调优
description: 当 Odoo 生产环境变慢、超时、报 MemoryError/Worker timeout，或需为指定服务器规格调优 odoo.conf 时使用；做 worker/内存/超时参数计算、用 pg_stat_statements 定位慢 SQL 与缺失索引、用内置 Profiler 抓 Python+SQL 链路并输出可落地配置改动；不适用于 Odoo 业务建模/二次开发、深度 PostgreSQL 参数（shared_buffers 等用 PGTune）、前端 JS 渲染性能、Odoo.sh 受限托管的底层调参；触发词：odoo 慢、worker timeout、MemoryError、odoo.conf 调优、慢查询、pg_stat_statements、缺失索引、odoo profiler、N+1
domain: 领域/erp
triggers: [odoo 慢, worker timeout, MemoryError, odoo.conf 调优, limit_memory, 慢查询, pg_stat_statements, 缺失索引, odoo profiler, N+1 查询, ormcache, workers 配置]
tags: [odoo, erp, performance, postgresql, profiling, worker-tuning, slow-query, memory]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Odoo, odoo.conf, PostgreSQL, pg_stat_statements, Odoo Profiler, ormcache]
requires: []
related: [odoo-docker-deployment, odoo-orm-expert, postgresql-optimization, odoo-backup-strategy]
combines_with: [odoo-docker-deployment, postgresql-optimization]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
建议放置路径：`e:/Everthing-Skills/09-verticals/odoo-performance-tuner/SKILL.md`

供写入 SKILL.md 的完整 frontmatter（与同源 `odoo-localization-compliance` 对齐；domain 按指令固定为 `领域/ERP`，但见下方「⚠️ 校验冲突」）：

```yaml
---
name: odoo-performance-tuner
title: Odoo 性能诊断与调优
description: 当 Odoo 生产环境变慢、超时、报 MemoryError/Worker timeout，或需为指定服务器规格调优 odoo.conf 时使用；做 worker/内存/超时参数计算、用 pg_stat_statements 定位慢 SQL 与缺失索引、用内置 Profiler 抓 Python+SQL 链路并输出可落地配置改动；不适用于 Odoo 业务建模/二次开发、深度 PostgreSQL 参数（shared_buffers 等用 PGTune）、前端 JS 渲染性能、Odoo.sh 受限托管的底层调参；触发词：odoo 慢、worker timeout、MemoryError、odoo.conf 调优、慢查询、pg_stat_statements、缺失索引、odoo profiler、N+1
domain: 领域/ERP
triggers: [odoo 慢, worker timeout, MemoryError, odoo.conf 调优, limit_memory, 慢查询, pg_stat_statements, 缺失索引, odoo profiler, N+1 查询, ormcache, workers 配置]
tags: [odoo, erp, performance, postgresql, profiling, worker-tuning, slow-query, memory]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Odoo, odoo.conf, PostgreSQL, pg_stat_statements, Odoo Profiler, ormcache]
requires: []
related: [odoo-localization-compliance]
combines_with: [odoo-localization-compliance]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
```

---

# Odoo 性能诊断与调优

## 何时使用

用于诊断与修复 Odoo 的性能问题——从页面加载慢、数据库瓶颈，到 worker 配置不当、内存膨胀：

- 生产环境 Odoo 变慢：页面加载慢、请求超时。
- 日志中出现 `MemoryError` 或 `Worker timeout`。
- 需要定位某个慢数据库查询（配合 Odoo 内置 Profiler）。
- 需要按某台服务器规格（核数/内存）调优 `odoo.conf`。

**不该用边界**：

- Odoo 业务建模 / 模块二次开发本身（属功能开发，不属调优）。
- 深度 PostgreSQL 参数（`shared_buffers`、`work_mem`、`effective_cache_size`）高度依赖具体服务器，本技能不深入，用 [PGTune](https://pgtune.leopard.in.ua/) 取基线。
- 前端 JavaScript 渲染性能——内置 Profiler 只抓 Python + SQL，JS 需浏览器 DevTools。
- **Odoo.sh** 托管环境限制直连 PostgreSQL 与 `odoo.conf`，部分调参不可用。
- 不覆盖 Redis 会话存储、Celery 任务队列等超高流量实例的高级模式。

## 步骤

1. **采集症状**：抓日志关键行（`MemoryError` / `Worker timeout` / 慢请求）、当前 `odoo.conf`、服务器规格（CPU 核数 / 内存）。
2. **分层定位**：先判断瓶颈在哪一层——
   - worker / 内存 / 超时 → 改 `odoo.conf`（见「指令」公式表）。
   - 单条 SQL 慢 / 缺索引 → 用 `pg_stat_statements`（示例 2）。
   - 单页 SQL 暴多 / 重复查询 / compute 慢 → 用内置 Profiler（示例 3）。
3. **给出精确改动**：每项配置写清数值 + 理由，而非泛泛建议。
4. **验证**：改 `odoo.conf` 需重启 Odoo；改 `postgresql.conf` 需 reload；复测同一慢操作确认改善。

## 指令

`odoo.conf` 关键参数与计算公式（务必结合服务器规格）：

| 参数 | 公式 / 取值 | 作用 |
|---|---|---|
| `workers` | `(CPU核数 × 2) + 1` | HTTP worker 数；**生产环境绝不设为 0** |
| `max_cron_threads` | `≤ 2` | 后台 cron 线程，留出面向用户的容量 |
| `limit_memory_soft` | 字节，如 `1610612736`（1.5G） | 超过后 worker 在请求间被优雅回收 |
| `limit_memory_hard` | 字节，如 `2147483648`（2.0G） | 超过后立即杀掉 worker，防 OOM |
| `limit_time_cpu` | 秒，如 `600` | 单请求最大 CPU 秒 |
| `limit_time_real` | 秒，如 `1200` | 单请求最大墙钟秒 |
| `limit_request` | 如 `8192` | worker 回收前最大请求数，防内存泄漏 |

代码层优化要点（不触发额外 SQL / 减少查询）：

- 在内存中的 recordset 上用 `mapped()` / `filtered()` / `sorted()`——不触发额外 SQL。
- 对 domain 过滤常用列（`partner_id`、`state`、`date_order`）加 PostgreSQL **B-tree 索引**。
- 对「相同参数被反复调用」的方法加 `@tools.ormcache` 装饰器。
- 静态资源开启 Odoo HTTP 缓存，前面挂 CDN（Cloudflare / CloudFront）。
- 依赖 Odoo 默认开启的**自动批量预取**，**不要**手动操作 recordset 的 `prefetch_ids`。

## 示例

**示例 1：4 核 / 8G 服务器的推荐 worker 配置（odoo.conf）**

```ini
# odoo.conf — tuned for a 4-core, 8GB RAM server

workers = 9                     # (CPU_cores × 2) + 1 — 生产环境绝不设 0
max_cron_threads = 2            # 后台 cron；≤ 2 以保留用户侧容量
limit_memory_soft = 1610612736  # 1.5 GB — 超过后优雅回收 worker
limit_memory_hard = 2147483648  # 2.0 GB — 超过后立即杀掉 worker，防 OOM
limit_time_cpu = 600           # 单请求最大 CPU 秒
limit_time_real = 1200         # 单请求最大墙钟秒
limit_request = 8192           # worker 回收前最大请求数（防内存泄漏）
```

**示例 2：用 PostgreSQL 找出慢查询**

```sql
-- 第 1 步：启用 pg_stat_statements 扩展（以 postgres 超级用户执行一次）
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- 第 2 步：写入 postgresql.conf 并 reload：
-- shared_preload_libraries = 'pg_stat_statements'
-- log_min_duration_statement = 1000   -- 记录耗时 > 1 秒的查询

-- 第 3 步：找平均最慢的 10 条查询
SELECT
    LEFT(query, 100) AS query_snippet,
    round(mean_exec_time::numeric, 2) AS avg_ms,
    calls,
    round(total_exec_time::numeric, 2) AS total_ms
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- 第 4 步：排查导致全表扫描的缺失索引
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE tablename = 'sale_order_line'
  AND correlation < 0.5   -- 相关性低 = 索引效率差
ORDER BY n_distinct DESC;
```

**示例 3：用 Odoo 内置 Profiler**

```text
前置：URL 加 ?debug=1 开启调试模式。
菜单：Settings → Technical → Profiling

步骤：
  1. 点 "Enable Profiling" — 设时长（如 60 秒）
  2. 复现那个慢操作
  3. 回到 Settings → Technical → Profiling → View Results

看什么：
  - 单页 SQL 查询数 > 100        → N+1 查询问题
  - 单条查询 > 100ms            → 缺失数据库索引
  - 同一查询重复多次            → 缺缓存，用 @ormcache
  - Python 耗时高而 SQL 低      → compute 字段效率问题
```

## 注意事项

- **`workers = 0` 是生产大忌**：单线程串行化所有请求，任一慢操作会阻塞全部用户。
- **不要忽略 `limit_memory_soft`**：缺它则 worker 内存无界增长直至崩溃；设了它 worker 会在请求间被回收。
- 加索引优先针对 domain 过滤中高频使用的列；`correlation < 0.5` 提示该列索引效率差。
- `odoo.conf` 改动需重启 Odoo 才生效；`postgresql.conf` 改动需 reload。
- Profiler 只抓 Python + SQL，**前端渲染慢得用浏览器 DevTools** 另查。
- 内存阈值为字节；示例值（1.5G/2.0G）需按实际单 worker 内存占用与总内存重算，避免 `workers × hard 上限` 超过物理内存。

## 互见

- related：`odoo-localization-compliance` —— 同为 Odoo 落地配置类技能，财税合规与性能调优常在同一上线项目中并行。
- combines_with：`odoo-localization-compliance` —— 上线一套 Odoo 时，本地化/合规与性能调优搭配可一次性交付「能用且跑得快」。

---
本条采编自 sickn33/antigravity-awesome-skills（MIT）。

---

## ⚠️ 校验冲突（需父级 agent 处置）

指令要求 `domain=领域/ERP（已定勿改）`，已照写。但本仓库 `taxonomy.json` 中 `09-verticals`（领域）卷的受控类集为 `[science, legal, medical, edu, fintech, hardware]`，**不含 ERP/erp**。`scripts/build-index.mjs`（第 108 行）对类段做**强校验并报 error**，故当前 `领域/ERP` 会导致 `node scripts/build-index.mjs` 失败。同源姊妹技能 `odoo-localization-compliance` 用的是 `领域/fintech`。二选一处置：① 在 `taxonomy.json` 的 `09-verticals.classes` 增加 `erp`（推荐，slug 用小写 `领域/erp`，并可在 aliases 加「ERP→erp」）；② 改用现有 `领域/fintech`。请父级 agent 定夺后再写盘。
