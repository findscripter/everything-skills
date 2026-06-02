---
name: clickhouse-analytics-io
title: ClickHouse 查询优化与分析
description: 当用 ClickHouse 做 OLAP 分析、设计 MergeTree 表、优化分析查询、建物化视图或批量灌数时使用；按「选引擎→定分区/排序键→写高效查询→批量插入→物化视图→监控」产出建表 DDL、优化后 SQL 与灌数代码；不适用于 OLTP/高频点写、事务强一致或非 ClickHouse 库（PostgreSQL/MySQL 等）；触发词：ClickHouse、MergeTree、物化视图、列存分析、分区键、批量插入、慢查询日志。
domain: 数据/sql
triggers: [ClickHouse, MergeTree, 物化视图, 列存 OLAP, 分区键 ORDER BY, AggregatingMergeTree, ReplacingMergeTree, 批量插入, system.query_log, LowCardinality]
tags: [clickhouse, olap, analytics, columnar, query-optimization, materialized-view, data-engineering]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [clickhouse, sql]
requires: []
related: [postgresql-optimization, sql-query-builder, nosql-distributed-db, erd-schema-designer]
combines_with: [dbt-transformation-modeler, data-pipeline-engineer, html-dashboard-builder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
# ClickHouse 查询优化与分析

## 何时使用

- 在 ClickHouse 上做高吞吐 OLAP 分析：时序、漏斗、留存、cohort、Top-N、分位数等大规模聚合。
- 设计列存表：选 MergeTree 家族引擎、定分区键 / 排序键（ORDER BY）/ 主键，做容量与压缩取舍。
- 优化慢分析查询、用 ClickHouse 专有聚合函数与窗口函数改写。
- 用物化视图做实时预聚合；用 `AggregatingMergeTree` + `*State`/`*Merge` 维护增量指标。
- 批量 / 流式灌数，以及用 `system.*` 表做查询性能与表体积监控。

不该用的边界：
- OLTP 场景、高频单行点写 / 点改 / 删除、需要事务强一致或行级锁 → ClickHouse 不擅长，改用 PostgreSQL/MySQL（见 `postgresql-optimization`）。
- 仅写一条普通 SQL、不涉及列存特性或性能 → 用 `sql-query-builder`。
- 非 ClickHouse 数据库 → 引擎、分区语义、系统表、函数名均不同，勿照搬本技能 DDL。
- 频繁小批量 insert / 大量 `JOIN` / 依赖 `FINAL` 实时去重的负载 → 先重设数据模型，否则性能反受其害。

## 步骤 / 指令

```
1. 选引擎（按数据语义）
   - 普通明细/事实表 → MergeTree
   - 同主键需去重（多源、重放）→ ReplacingMergeTree（后台异步去重，查询非实时唯一）
   - 维护预聚合指标 → AggregatingMergeTree（配 *State 写入、*Merge 读出）
2. 定分区键与排序键（最影响性能）
   - PARTITION BY 用时间（toYYYYMM(date) 月级常用），避免分区过多拖垮 merge
   - ORDER BY 把最常过滤的列放最前；兼顾基数与压缩，等值列在前、范围列在后
   - index_granularity 默认 8192，无特殊需求勿动
3. 写高效查询
   - 过滤优先命中 ORDER BY 前缀列（date/market_id…），别先过滤非索引列
   - 用 ClickHouse 聚合函数：uniq() 近似去重、quantile(p)() 取分位数（比 percentile 高效）
   - 累计/排名用窗口函数 sum(...) OVER (PARTITION BY ... ORDER BY ...)
   - 只 SELECT 需要的列，禁 SELECT *
4. 批量插入（关键）
   - 单条大 INSERT 携多行，按千~万行成批；切忌循环里逐行 insert
   - 持续摄入用流式/批缓冲，攒够一批再落盘
5. 物化视图做实时聚合
   - CREATE MATERIALIZED VIEW ... TO <聚合表> AS SELECT ... sumState()/countState()/uniqState()
   - 读取时对聚合表用 sumMerge()/countMerge()/uniqMerge() 合并
6. 监控
   - 慢查询：system.query_log（type='QueryFinish'，按 query_duration_ms 排序）
   - 表体积：system.parts（active），formatReadableSize(sum(bytes))
```

## 示例

建明细表（MergeTree，月分区）：
```sql
CREATE TABLE markets_analytics (
    date Date, market_id String, market_name String,
    volume UInt64, trades UInt32, unique_traders UInt32,
    avg_trade_size Float64, created_at DateTime
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (date, market_id)
SETTINGS index_granularity = 8192;
```

预聚合表 + 物化视图（写入端 *State，读取端 *Merge）：
```sql
CREATE TABLE market_stats_hourly (
    hour DateTime, market_id String,
    total_volume AggregateFunction(sum, UInt64),
    total_trades AggregateFunction(count, UInt32),
    unique_users AggregateFunction(uniq, String)
) ENGINE = AggregatingMergeTree()
PARTITION BY toYYYYMM(hour) ORDER BY (hour, market_id);

CREATE MATERIALIZED VIEW market_stats_hourly_mv TO market_stats_hourly AS
SELECT toStartOfHour(timestamp) AS hour, market_id,
       sumState(amount) AS total_volume,
       countState() AS total_trades,
       uniqState(user_id) AS unique_users
FROM trades GROUP BY hour, market_id;

-- 读取必须用 *Merge 合并状态
SELECT hour, market_id,
       sumMerge(total_volume) AS volume,
       countMerge(total_trades) AS trades,
       uniqMerge(unique_users) AS users
FROM market_stats_hourly
WHERE hour >= now() - INTERVAL 24 HOUR
GROUP BY hour, market_id ORDER BY hour DESC;
```

高效过滤与分位数：
```sql
-- GOOD：先命中排序键列
SELECT * FROM markets_analytics
WHERE date >= '2025-01-01' AND market_id = 'market-123' AND volume > 1000
ORDER BY date DESC LIMIT 100;

-- 分位数用 quantile，远比 percentile 高效
SELECT quantile(0.5)(trade_size) AS p50,
       quantile(0.95)(trade_size) AS p95,
       quantile(0.99)(trade_size) AS p99
FROM trades WHERE created_at >= now() - INTERVAL 1 HOUR;
```

留存分析（嵌套子查询算 days_since_signup）：
```sql
SELECT signup_date,
       countIf(days_since_signup = 0)  AS day_0,
       countIf(days_since_signup = 1)  AS day_1,
       countIf(days_since_signup = 7)  AS day_7,
       countIf(days_since_signup = 30) AS day_30
FROM (
    SELECT user_id,
           min(toDate(timestamp)) AS signup_date,
           toDate(timestamp) AS activity_date,
           dateDiff('day', signup_date, activity_date) AS days_since_signup
    FROM events GROUP BY user_id, activity_date
)
GROUP BY signup_date ORDER BY signup_date DESC;
```

批量插入（TypeScript，攒批一次写）：
```typescript
// 单条 INSERT 携多行 = 高效；切勿循环逐行 insert
async function bulkInsertTrades(trades: Trade[]) {
  const values = trades.map(t =>
    `('${t.id}','${t.market_id}','${t.user_id}',${t.amount},'${t.timestamp.toISOString()}')`
  ).join(',')
  await clickhouse.query(
    `INSERT INTO trades (id, market_id, user_id, amount, timestamp) VALUES ${values}`
  ).toPromise()
}
```

监控慢查询与表体积：
```sql
SELECT query_id, query, query_duration_ms, read_rows, read_bytes, memory_usage
FROM system.query_log
WHERE type = 'QueryFinish' AND query_duration_ms > 1000
  AND event_time >= now() - INTERVAL 1 HOUR
ORDER BY query_duration_ms DESC LIMIT 10;

SELECT database, table, formatReadableSize(sum(bytes)) AS size, sum(rows) AS rows
FROM system.parts WHERE active GROUP BY database, table
ORDER BY sum(bytes) DESC;
```

## 注意事项

- **分区别太碎**：分区数过多严重拖累后台 merge 与查询规划；时间维度按月（必要时按天）即可，别用高基数列做分区。
- **排序键决定一切**：最常过滤的列放 ORDER BY 最前，过滤未命中前缀列时退化为全表/全分区扫描；排序还直接影响压缩率。
- **聚合状态读写要配对**：`AggregatingMergeTree` / 物化视图写入用 `*State`，读取必须用 `*Merge`，否则拿到的是二进制中间态而非结果。
- **批量灌数**：ClickHouse 为大批写优化，频繁小 insert 会生成大量 part 触发持续 merge；务必攒批。
- **少用 `FINAL`**：`ReplacingMergeTree` 去重是后台异步的，查询期 `FINAL` 强制合并代价高；优先在数据模型层规避重复，或接受最终一致。
- **数据类型省着用**：选最小够用类型（UInt32 优于 UInt64）；重复字符串用 `LowCardinality`，类别字段用 `Enum`，显著省空间提速。
- **JOIN 是弱项**：分析负载尽量反范式化、宽表化，避免多表 `JOIN`；必要时小表放右侧。
- 任何建表/改引擎/删分区等 DDL 在生产执行前须确认并具备回滚预案；本技能产出方案，不擅自在生产执行。

## 互见

- requires：无。
- related：`sql-query-builder`（先写对查询，再来本技能用列存特性调优）、`postgresql-optimization`（OLTP/事务侧用 PG，OLAP 侧用 ClickHouse，常配 CDC 同步）、`nosql-distributed-db`、`snowflake-development`（另一类云数仓选型对照）。
- combines_with：`data-pipeline-engineer`、`dbt-transformation-modeler`（建模/转换层把数据物化进 ClickHouse）、`spark-job-optimization`、`polars-dataframe`（上游大规模 ETL/清洗后批量灌入）。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。已适配重写：将原按主题罗列的 patterns 文档改写为「选引擎→分区/排序键→查询→灌数→物化视图→监控」可执行 playbook，补全负边界（OLTP/小批写/FINAL/JOIN），保留 MergeTree/ReplacingMergeTree/AggregatingMergeTree DDL、*State/*Merge 物化视图、quantile/uniq/窗口函数、批量插入、system.query_log/system.parts 监控及 LowCardinality/Enum/反范式化等关键约束与代码。
