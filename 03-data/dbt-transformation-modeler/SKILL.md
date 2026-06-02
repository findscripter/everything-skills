---
name: dbt-transformation-modeler
title: dbt数据转换建模
description: 当用 dbt 搭建分析工程数据转换管道、按 staging/intermediate/marts 分层建模、加数据质量测试或做增量处理时使用；产出分层模型结构、SQL 模型、sources/schema YAML、测试与增量策略配置；不适用于实时流处理、非 dbt 的 ETL 编排或纯 SQL 即席查询；触发词：dbt、data build tool、分析工程、analytics engineering、数据建模、staging/marts 分层、medallion、增量模型、incremental、dbt 测试、source freshness、维度事实表 dim/fct。
domain: 数据/pipeline
triggers: [dbt, data build tool, 分析工程, analytics engineering, 数据建模, staging marts 分层, medallion 架构, 增量模型, incremental, dbt 测试, source freshness, 维度事实表, dim fct, 数据转换管道]
tags: [dbt, data-modeling, analytics-engineering, sql, incremental, data-quality, pipeline, elt]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [dbt, dbt-core, dbt-utils, Jinja, SQL, YAML]
requires: []
related: [dbt-transformation-patterns, snowflake-development, data-pipeline-engineer, sql-query-builder]
combines_with: [data-quality-frameworks, airflow-dag-builder, snowflake-development]
license: MIT
source: wshobson/agents
source_license: MIT
---
## 何时使用

- 用 dbt 搭建数据转换/ELT 管道，需要把模型组织为 staging → intermediate → marts 分层（Medallion 架构）。
- 给数据模型加质量测试（not_null、unique、relationships、accepted_values、freshness）。
- 为大表（> 100 万行）构建增量模型，并选择合适的增量策略。
- 为模型与列编写文档/血缘，初始化标准 dbt 工程结构。

**不该用边界**：实时/流式处理（dbt 是批处理 ELT）；非 dbt 的 ETL 编排（如 Airflow DAG 本身、Spark 作业）；仓库里不落 SQL 的即席查询；数据加载/抽取（dbt 只做 T，E/L 交给 Fivetran/Airbyte 等）。

## 步骤

1. **建工程骨架**：`dbt_project.yml` 配置各层默认物化方式——staging 用 `view`、intermediate 用 `ephemeral`、marts 用 `table`；用 `vars` 收口可变参数（如 `start_date`）。
2. **定义 source**：在 `_<src>__sources.yml` 里声明原始表，配 `freshness`（warn/error after）与列级测试。
3. **写 staging 模型**：与源 1:1，只做轻清洗——改名、统一大小写、单位换算、抽 `_loaded_at`。命名 `stg_<source>__<entity>`。
4. **写 intermediate 模型**：承载业务逻辑、join、聚合，全程用 `{{ ref(...) }}` 引用上游。命名 `int_<topic>_<verb>`。
5. **写 marts 模型**：产出维度 `dim_` 与事实 `fct_`，用 `dbt_utils.generate_surrogate_key` 生成代理键。
6. **加测试与文档**：在 `_<mart>__models.yml` 写列描述与测试。
7. **跑 build**：`dbt build` 按 DAG 顺序执行 run + test。

## 指令

```bash
# 开发
dbt run                          # 跑全部模型
dbt run --select staging         # 只跑 staging 层
dbt run --select +fct_orders     # fct_orders 及其上游
dbt run --select fct_orders+     # fct_orders 及其下游
dbt run --full-refresh           # 重建增量模型

# 测试
dbt test                         # 跑全部测试
dbt test --select stg_stripe     # 测指定模型
dbt build                        # run + test 按 DAG 顺序

# 文档与调试
dbt docs generate && dbt docs serve   # 生成并本地预览文档
dbt compile                      # 只编译 SQL 不执行
dbt debug                        # 测连接
dbt ls --select tag:critical     # 按 tag 列模型
```

命名约定：staging 用 `stg_`，intermediate 用 `int_`，marts 用 `dim_`/`fct_`（如 `stg_stripe__payments`、`dim_customers`、`fct_orders`）。

## 示例

`dbt_project.yml` 按层设默认物化：

```yaml
models:
  analytics:
    staging:    { +materialized: view, +schema: staging }
    intermediate: { +materialized: ephemeral }
    marts:      { +materialized: table, +schema: analytics }
```

staging 增量模型（仅取新数据）：

```sql
{{ config(materialized='incremental', unique_key='payment_id',
          on_schema_change='append_new_columns') }}
with source as (
    select * from {{ source('stripe', 'payments') }}
    {% if is_incremental() %}
    where _fivetran_synced > (select max(_loaded_at) from {{ this }})
    {% endif %}
)
select id as payment_id, amount / 100.0 as amount,
       status as payment_status, _fivetran_synced as _loaded_at
from source
```

marts 事实表用 merge 增量策略：

```sql
{{ config(materialized='incremental', unique_key='order_id',
          incremental_strategy='merge') }}
```

模型测试（YAML）：

```yaml
columns:
  - name: customer_key
    tests: [unique, not_null]
  - name: customer_tier
    tests:
      - accepted_values: { values: ["high", "medium", "low"] }
  - name: customer_key
    tests:
      - relationships: { to: ref('dim_customers'), field: customer_key }
```

可复用 macro（DRY）：

```sql
{% macro cents_to_dollars(column_name, precision=2) %}
    round({{ column_name }} / 100.0, {{ precision }})
{% endmacro %}
```

## 注意事项

- **别跳过 staging**：直接 raw → mart 是技术债；clean once, use everywhere。
- **别硬编码日期**：用 `{{ var('start_date') }}`，开发环境用 `limit_data_in_dev` macro 限流。
- **别重复逻辑**：抽成 macro。
- **激进测试**：not_null / unique / relationships 三件套；marts 列尽量都有描述。
- **超 100 万行用增量**：策略选型——`delete+insert`（多数仓库默认）、`merge`（适合晚到数据，可配 `merge_update_columns`）、`insert_overwrite`（按 `partition_by` 分区）。
- **盯 source freshness**：配 `warn_after`/`error_after` 监控上游新鲜度。
- **别在 prod 测**：用 dev target；dbt 工程进 Git 版本管理。

## 互见

- sql-query-builder：编写与优化 dbt 模型里的 SQL。
- csv-data-cleaner：dbt 之前/之外的轻量数据清洗。

---
本条采编自 wshobson/agents（MIT）。
