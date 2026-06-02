---
name: snowflake-development
title: Snowflake 数据开发
description: 当在 Snowflake 上写 SQL、搭数据管道、用 Cortex AI 或 Snowpark Python 时使用；产出符合最佳实践的 SQL/DDL、Dynamic Tables/Streams/Tasks 管道、Cortex 函数与 Agent、dbt 物化、性能与安全配置；不适用于其他数据库（MySQL/PostgreSQL/BigQuery）或纯通用 SQL 拼装；触发词：snowflake、雪花、dynamic table、动态表、streams、tasks、snowpipe、cortex、snowpark、dbt on snowflake、merge upsert、变体 variant
domain: 数据/pipeline
triggers: [snowflake, 雪花, dynamic table, 动态表, streams, tasks, snowpipe, cortex, snowpark, dbt on snowflake, merge upsert, variant, 变体]
tags: [snowflake, data-engineering, sql, pipeline, cortex, snowpark, dbt]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Snowflake SQL, Dynamic Tables, Streams & Tasks, Snowpipe, Cortex AI, Snowpark Python, dbt]
requires: []
related: [dbt-transformation-modeler, data-pipeline-engineer, sql-query-builder, dbt-transformation-patterns]
combines_with: [dbt-transformation-modeler, airflow-dag-builder, data-quality-frameworks]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 在 Snowflake 上编写 SQL、设计数据管道（Dynamic Tables / Streams + Tasks / Snowpipe）、调用 Cortex AI 函数或 Agent、用 Snowpark Python 处理数据、做 dbt 物化、性能调优或安全加固时使用。
- 不该用：目标不是 Snowflake（如 MySQL、PostgreSQL、BigQuery、Spark）；只是写与厂商无关的通用 SQL；或缺少必要的库/Schema/权限/成功标准——此时应先停下来澄清。
- 输出不能替代针对具体环境的验证、测试与专家评审。

## 步骤

1. 判定任务类别：SQL、管道、Cortex、Snowpark、dbt、性能或安全，选择对应小节规则。
2. 写 SQL 时统一用 `snake_case`、CTE（`WITH`）替代嵌套子查询、`CREATE OR REPLACE` 做幂等 DDL、生产环境禁止 `SELECT *`（列存只扫描引用列）。避免双引号标识符（会产生大小写敏感名）。
3. 搭管道时按下表选型，默认优先 Dynamic Tables。
4. 用 Cortex 时只用新版 `AI_*` 函数，避开已废弃函数。
5. Snowpark/​dbt/性能/安全按各自约束落地，最后自查「常见错误」表。

## 指令

### SQL 关键约束

- 存储过程（`BEGIN...END`）内，SQL 语句中引用变量/参数**必须**加冒号 `:` 前缀，否则报 "invalid identifier"。
  - 错误：`SELECT name INTO result FROM users WHERE id = p_id;`
  - 正确：`SELECT name INTO :result FROM users WHERE id = :p_id;`
- 半结构化（VARIANT/OBJECT/ARRAY）：访问嵌套字段并**始终强制转型**，如 `src:customer.name::STRING`、`src:price::NUMBER(10,2)`。JSON `null` 会存为字符串 `"null"`，加载时用 `STRIP_NULL_VALUE = TRUE`。展开数组用 `LATERAL FLATTEN(input => src:items)`。
- Upsert 用 `MERGE INTO ... WHEN MATCHED THEN UPDATE ... WHEN NOT MATCHED THEN INSERT ...`。

### 管道选型

| 方案 | 适用 |
|------|------|
| Dynamic Tables | 声明式转换，**默认选择**：写好查询，刷新交给 Snowflake |
| Streams + Tasks | 命令式 CDC：需过程逻辑、调用存储过程 |
| Snowpipe | 从 S3/GCS/Azure 持续加载文件 |

Dynamic Tables 规则：`TARGET_LAG` 上紧下松逐级设置；增量 DT **不能**依赖全量刷新 DT；用显式列名（`SELECT *` 遇 schema 变更会断）；基表须保持 change tracking 开启；两个 DT 之间不能夹视图。

Streams + Tasks：Task 创建后是 **SUSPENDED**，必须 `ALTER TASK ... RESUME;`；常配 `WHEN SYSTEM$STREAM_HAS_DATA('stream_name')` 仅在有数据时触发。

### Cortex AI

- 用新版函数：`AI_COMPLETE`/`AI_CLASSIFY`/`AI_FILTER`/`AI_EXTRACT`/`AI_SENTIMENT`/`AI_PARSE_DOCUMENT`/`AI_REDACT`。
- **已废弃，禁用**：`COMPLETE`、`CLASSIFY_TEXT`、`EXTRACT_ANSWER`、`PARSE_DOCUMENT`、`SUMMARIZE`、`TRANSLATE`、`SENTIMENT`、`EMBED_TEXT_768`。
- 分类用 `AI_CLASSIFY` 而非 `AI_COMPLETE`。
- `TO_FILE` 的 stage 路径与文件名是**两个独立参数**：`TO_FILE('@db.schema.mystage', 'invoice.pdf')`，不要写成 `TO_FILE('@stage/file.pdf')`。
- Cortex Agent：用 `$spec$` 分隔符（不是 `$$`）；`models` 必须是对象不是数组；`tool_resources` 是独立顶层对象不嵌在 tools 里；编辑规格里不要放空/null（会清空原值）；工具描述是质量第一要素；生产 Agent 先克隆再改，禁止直改。

### Snowpark Python

- 禁止硬编码凭据，从环境变量读取（`os.environ[...]`）。
- DataFrame 惰性执行，触发于 `collect()`/`show()`；大 DataFrame 不要 `collect()`，尽量服务端处理。
- 批量/ML 用**向量化 UDF**（比标量 UDF 快 10-100 倍）。

### dbt on Snowflake

- 近实时/流式集市用动态表物化：`{{ config(materialized='dynamic_table', snowflake_warehouse='transforming', target_lag='1 hour') }}`。
- 大事实表用增量：`{{ config(materialized='incremental', unique_key='event_id') }}`。
- Snowflake 专有配置可叠加：`{{ config(transient=true, copy_grants=true, query_tag='team_daily') }}`。
- 用 `{{ this }}` 必须包在 `{% if is_incremental() %}` 守卫内。

### 性能 / 安全

- Cluster key 仅用于多 TB 表，建在 WHERE/JOIN/GROUP BY 列上；点查用 Search Optimization：`ALTER TABLE t ADD SEARCH OPTIMIZATION ON EQUALITY(col);`。
- 仓库从 X-Small 起步逐步放大，设 `AUTO_SUSPEND = 60`、`AUTO_RESUME = TRUE`，按工作负载分仓。
- 调用前先估 AI 成本：`SELECT SUM(AI_COUNT_TOKENS('claude-4-sonnet', text)) FROM table;`。
- 最小权限 RBAC，对象级授权用 database role；定期审计 `SHOW GRANTS OF ROLE ACCOUNTADMIN;`；用网络策略做 IP 白名单，PII 列用 masking policy、多租户隔离用 row access policy。

## 示例

声明式管道：用 Dynamic Table 做近实时清洗。

```sql
CREATE OR REPLACE DYNAMIC TABLE cleaned_events
    TARGET_LAG = '5 minutes'
    WAREHOUSE = transform_wh
    AS
    SELECT event_id, event_type, user_id, event_timestamp
    FROM raw_events
    WHERE event_type IS NOT NULL;
```

命令式管道：Stream + Task（注意建后须 RESUME）。

```sql
CREATE OR REPLACE STREAM raw_stream ON TABLE raw_events;

CREATE OR REPLACE TASK process_events
    WAREHOUSE = transform_wh
    SCHEDULE = 'USING CRON 0 */1 * * * America/Los_Angeles'
    WHEN SYSTEM$STREAM_HAS_DATA('raw_stream')
    AS INSERT INTO cleaned_events SELECT ... FROM raw_stream;

ALTER TASK process_events RESUME;  -- Task 默认 SUSPENDED，必须显式恢复
```

文本分类：用 `AI_CLASSIFY` 取标签。

```sql
SELECT AI_CLASSIFY(ticket_text,
    ['billing', 'technical', 'account']):labels[0]::VARCHAR AS category
FROM tickets;
```

## 注意事项

常见错误排查：

| 报错 | 原因 | 修复 |
|------|------|------|
| Object does not exist | 上下文错或缺授权 | 用全限定名、检查 grants |
| 存储过程 Invalid identifier | 缺冒号前缀 | 用 `:variable_name` |
| Numeric value not recognized | VARIANT 未转型 | `src:field::NUMBER(10,2)` |
| Task 不运行 | 忘了 RESUME | `ALTER TASK ... RESUME` |
| DT 刷新失败 | schema 变更或 tracking 关闭 | 用显式列、检查 change tracking |

仅在任务明确落在上述范围内时使用本技能；缺输入/权限/安全边界/成功标准时先澄清。

## 互见

- sql-query-builder：通用 SQL 查询构造，与本条的 Snowflake 专有语法互补。
- rag-pipeline-builder：构建 RAG 管道时可结合 Cortex AI 函数与向量能力。
- csv-data-cleaner：入库前的本地 CSV 数据清洗。

---

本条采编自 sickn33/antigravity-awesome-skills（MIT）。
