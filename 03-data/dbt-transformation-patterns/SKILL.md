---
name: dbt-transformation-patterns
title: dbt 数据转换建模与测试模式
description: 当用 dbt 在数据仓库上搭建分层转换管道（staging/intermediate/marts）、加测试与文档、做增量模型时使用；产出分层命名规范、source/staging/mart 模型与 schema.yml 测试、增量物化策略及常用 dbt 命令清单；不适用于无 dbt/仓库的纯即席 SQL 查询或无源数据访问权限的场景。触发词：dbt、数据建模、增量模型
domain: 数据/pipeline
triggers: [dbt, 数据建模, 数据转换, staging, marts, 增量模型, incremental, dbt test, 维度事实表, dim_/fct_, medallion 分层, schema.yml 测试, 数据仓库 ELT, dbt_project.yml]
tags: [dbt, 数据工程, 数据建模, ELT, 数据仓库, 数据质量, 增量处理, SQL, misc]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [dbt, SQL, Jinja, YAML, 数据仓库（Snowflake/BigQuery/Redshift 等）]
requires: []
related: [dbt-transformation-modeler, snowflake-development, data-pipeline-engineer, sql-query-builder]
combines_with: [data-quality-validator, airflow-dag-patterns, snowflake-development]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 用 dbt 在数据仓库上搭建数据转换管道（ELT）。
- 把模型按 staging / intermediate / marts 分层组织（Medallion 风格）。
- 为模型加数据质量测试、列/模型文档、source 新鲜度检查。
- 为大表（经验阈值 > 100 万行）构建增量模型。
- 初始化或规范 dbt 项目结构与命名约定。

不该用（负边界）：
- 项目未使用 dbt，也没有仓库支撑的工作流。
- 只需写一次性的即席 SQL 查询，不需要建模与版本化。
- 没有源数据或 schema 的访问权限。

## 步骤

1. 定模型分层、命名与归属：`sources/ → staging/ → intermediate/ → marts/`。
2. 在 `dbt_project.yml` 中按层配置物化方式（staging=view、intermediate=ephemeral、marts=table）。
3. 写 source 定义（含 `freshness`）与 staging 模型（1:1 对应源、轻清洗、重命名）。
4. 在 intermediate 写业务逻辑（join/聚合），在 marts 产出 `dim_`/`fct_`。
5. 用 `schema.yml` 加测试（`unique`/`not_null`/`relationships`/`accepted_values`）与列文档。
6. 大表选增量物化与增量策略；用 selector 与 `dbt build` 跑 CI。

## 指令

- 先建 staging 层一次性清洗，全局复用；禁止 raw 直连 mart（技术债）。
- 测试要狠：主键 unique+not_null、外键 relationships、枚举 accepted_values。
- 一切皆文档：列描述、模型描述齐全。
- 增量优先用于大表；late-arriving 数据用 `merge` 策略。
- 不硬编码日期，改用 `{{ var('start_date') }}`；重复逻辑抽成 macro。
- 监控 source 新鲜度，不在生产 target 上测试。
- 命名前缀：Staging=`stg_`（如 `stg_stripe__payments`），Intermediate=`int_`，Marts=`dim_`/`fct_`。
- 需要更完整的代码样例时，参见源仓库 `resources/implementation-playbook.md`。

## 示例

项目配置（`dbt_project.yml`）按层设置默认物化：

```yaml
models:
  analytics:
    staging:
      +materialized: view
      +schema: staging
    intermediate:
      +materialized: ephemeral
    marts:
      +materialized: table
      +schema: analytics
```

Source 定义 + 新鲜度 + 测试（`_stripe__sources.yml`）：

```yaml
version: 2
sources:
  - name: stripe
    database: raw
    schema: stripe
    loaded_at_field: _fivetran_synced
    freshness:
      warn_after: {count: 12, period: hour}
      error_after: {count: 24, period: hour}
    tables:
      - name: payments
        columns:
          - name: id
            tests: [unique, not_null]
          - name: customer_id
            tests:
              - not_null
              - relationships:
                  to: source('stripe', 'customers')
                  field: id
```

增量 staging 模型（`stg_stripe__payments.sql`）：

```sql
{{ config(materialized='incremental', unique_key='payment_id',
         on_schema_change='append_new_columns') }}

with source as (
    select * from {{ source('stripe', 'payments') }}
    {% if is_incremental() %}
    where _fivetran_synced > (select max(_loaded_at) from {{ this }})
    {% endif %}
)
select
    id as payment_id,
    customer_id,
    amount / 100.0 as amount,          -- 分转元
    status as payment_status,
    created as created_at,
    _fivetran_synced as _loaded_at
from source
```

Mart 维度表，含代理键与计算字段（`dim_customers.sql` 节选）：

```sql
{{ config(materialized='table', unique_key='customer_id') }}
select
    {{ dbt_utils.generate_surrogate_key(['customer_id']) }} as customer_key,
    customer_id,
    case
        when lifetime_value >= 1000 then 'high'
        when lifetime_value >= 100  then 'medium'
        else 'low'
    end as customer_tier
from {{ ref('int_payments_pivoted_to_customer') }}
```

模型测试 + 文档（`_core__models.yml` 节选）：

```yaml
version: 2
models:
  - name: dim_customers
    columns:
      - name: customer_key
        tests: [unique, not_null]
      - name: customer_tier
        tests:
          - accepted_values:
              values: ['high', 'medium', 'low']
```

复用 macro（DRY）：

```sql
{% macro cents_to_dollars(column_name, precision=2) %}
    round({{ column_name }} / 100.0, {{ precision }})
{% endmacro %}

{% macro limit_data_in_dev(column_name, days=3) %}
    {% if target.name == 'dev' %}
        where {{ column_name }} >= dateadd(day, -{{ days }}, current_date)
    {% endif %}
{% endmacro %}
```

增量策略选型：

```sql
-- merge：适合 late-arriving 数据
{{ config(materialized='incremental', unique_key='id',
         incremental_strategy='merge',
         merge_update_columns=['status','amount','updated_at']) }}

-- insert_overwrite：按分区覆盖
{{ config(materialized='incremental',
         incremental_strategy='insert_overwrite',
         partition_by={"field":"created_date","data_type":"date","granularity":"day"}) }}
```

常用 dbt 命令：

```bash
dbt run --select staging          # 只跑 staging 层
dbt run --select +fct_orders      # fct_orders 及其上游
dbt run --select fct_orders+      # fct_orders 及其下游
dbt run --full-refresh            # 重建增量模型
dbt test --select stg_stripe      # 测指定模型
dbt build                         # 按 DAG 顺序 run + test
dbt docs generate && dbt docs serve
dbt compile                       # 只编译不执行
dbt ls --select tag:critical      # 按 tag 列出模型
```

## 注意事项

- 增量模型的 `is_incremental()` 过滤条件必须基于可靠的水位字段（如 `_loaded_at`/`updated_at`），否则会漏数或重复。
- `merge` 策略要求设置 `unique_key`；不同仓库默认增量策略不同（多数为 `delete+insert`）。
- `on_schema_change` 决定增量时如何处理列变更，源 schema 变动时需复核。
- 产出不能替代环境内的真实校验、测试与专家评审；缺少输入、权限、安全边界或验收标准时先停下来澄清。
- 仅在任务明确落在上述范围内时使用本技能。

## 互见

- 源 Playbook：`resources/implementation-playbook.md`（更完整的模式与样例）。
- 官方文档：dbt Docs（docs.getdbt.com）、dbt Best Practices、dbt-utils 包。

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
