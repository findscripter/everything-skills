---
name: data-quality-validator
title: 数据质量校验框架
description: 当为数据管道/数仓建立数据质量校验、用 Great Expectations 或 dbt test 写校验规则、定义数据契约（data contract）、在 CI/CD 中自动拦截脏数据时使用；做出可执行的质量套件、检查点与契约并产出可报警的校验报告；不适用于单机离线表清洗（用 csv-data-cleaner）或纯查询建模（用 sql-query-builder）；触发词：数据质量、data quality、Great Expectations、GE、dbt test、数据契约、data contract、校验规则、完整性、唯一性、新鲜度。
domain: 数据/analysis
triggers: [数据质量, data quality, Great Expectations, GE, dbt test, 数据契约, data contract, 校验规则, 完整性, 唯一性, 新鲜度]
tags: [data, quality, validation, great-expectations, dbt, data-contract]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, great-expectations, dbt, dbt-utils, soda, sql]
requires: []
related: [data-quality-frameworks, dataset-quality-auditor, dbt-transformation-patterns, csv-data-cleaner]
combines_with: [dbt-transformation-patterns, airflow-dag-patterns, data-pipeline-engineer]
license: MIT
source: wshobson/agents
source_license: MIT
---
## 何时使用

- 为数据管道/数仓建立**可重复、可报警**的质量校验：用 Great Expectations 写期望套件、用 dbt test 写表/列级测试、用数据契约约束上下游 schema 与 SLA。
- 把校验接入 CI/CD 或调度（Airflow/dbt Cloud），让脏数据在进入下游前被拦截，失败时报警（Slack 等）。
- 监控质量指标：完整性、唯一性、有效性、准确性、一致性、新鲜度。
- 触发词：数据质量、data quality、Great Expectations/GE、dbt test、数据契约/data contract、校验规则、完整性、唯一性、新鲜度。

**不该用**：

- 单机离线 CSV/Excel 表的清洗（去重、缺失填充、类型规整）→ 用 `csv-data-cleaner`。
- 纯查询/联表/聚合建模本身 → 用 `sql-query-builder`（本技能只校验其产物质量）。
- 表外数据（API/文件原貌）的 schema 推断与解析。

## 步骤 / 指令

1. **定维度**：先按六维（完整性/唯一性/有效性/准确性/一致性/新鲜度）圈定要测的**关键列**，不要全表全列乱测。
2. **分层测**（数据测试金字塔，自下而上）：
   - schema 测试（结构）：列集合、列类型、行数区间。
   - 单列单元测试：非空、唯一、取值集合、数值/日期区间。
   - 跨表集成测试：外键关系、跨列约束、A>B 之类一致性。
3. **选工具**：仓内 dbt 优先用 `dbt test`（声明在 `_models.yml`，配合 `dbt_utils`）；需要丰富断言/统计期望/数据文档用 Great Expectations；跨团队边界用**数据契约**（datacontract.com + SodaCL）固化 schema 与 SLA。
4. **落新鲜度**：必测 `created_at` 之类的时间列在近 N 天/小时内，陈旧数据等于坏数据。
5. **编排+报警**：用 GE checkpoint 或 dbt 在 CI/调度中批量跑，**任一关键表失败即让管道失败**并发通知。
6. **演进**：契约/schema 版本化，发现新问题就增量补测，阈值用动态基线而非硬编码。

## 示例

GE 安装与最小套件（核心命令保留自源）：
```bash
pip install great_expectations
great_expectations init
great_expectations datasource new
```
```python
import great_expectations as gx
context = gx.get_context()
suite = context.add_expectation_suite("orders_suite")
suite.add_expectation(gx.expectations.ExpectColumnValuesToNotBeNull(column="order_id"))
suite.add_expectation(gx.expectations.ExpectColumnValuesToBeUnique(column="order_id"))
# 取值集合 / 区间 / 新鲜度 / 行数 等同理：
# ExpectColumnValuesToBeInSet(column="status", value_set=[...])
# ExpectColumnValuesToBeBetween(column="amount", min_value=0, strict_min=True)
# ExpectColumnMaxToBeBetween(column="created_at", min_value="now-1d", max_value="now")
result = context.run_checkpoint(checkpoint_name="orders_checkpoint")
if not result.success:
    raise ValueError("Data quality checks failed!")
```

dbt 声明式测试（`models/marts/.../_models.yml`）：
```yaml
models:
  - name: fct_orders
    tests:
      - dbt_utils.recency: {datepart: day, field: created_at, interval: 1}  # 新鲜度
    columns:
      - name: order_id
        tests: [unique, not_null]
      - name: customer_id
        tests:
          - not_null
          - relationships: {to: ref('dim_customers'), field: customer_id}   # 外键
      - name: order_status
        tests:
          - accepted_values: {values: [pending, processing, shipped, delivered, cancelled]}
      - name: total_amount
        tests:
          - dbt_utils.expression_is_true: {expression: ">= 0"}
```

自定义通用 dbt 测试（行数区间）：
```sql
{% test row_count_in_range(model, min_count, max_count) %}
with row_count as (select count(*) as cnt from {{ model }})
select cnt from row_count where cnt < {{ min_count }} or cnt > {{ max_count }}
{% endtest %}
```

数据契约骨架（datacontract.com + SodaCL 质量块）：
```yaml
apiVersion: datacontract.com/v1.0.0
kind: DataContract
metadata: {name: orders, version: 1.0.0, owner: data-platform-team}
schema:
  properties:
    order_id:  {type: string, format: uuid, required: true, unique: true}
    customer_id: {type: string, required: true, pii: true}
    status:    {type: string, enum: [pending, processing, shipped, delivered, cancelled]}
quality:
  type: SodaCL
  specification:
    checks for orders:
      - missing_count(order_id) = 0
      - duplicate_count(order_id) = 0
      - freshness(created_at) < 24h
sla: {availability: 99.9%, freshness: 1 hour}
```

## 注意事项

- **聚焦关键列**，别测一切；过度测试拖慢管道又难维护。
- **早测、增量测**：变换前先校验源数据；遇到问题再补测，并为每个测试写清晰描述。
- **别忽略 warning**，它常是 failure 前兆；**别跳过新鲜度**校验。
- **阈值用动态基线**，勿硬编码；行数/均值类统计期望要随业务波动调整。
- **测关系而非孤立列**：外键、跨表一致性比单列断言更能抓真实坏账。
- 失败必报警（接监控/Slack），并让 CI/调度真正**失败**而非仅记录。
- 契约/schema **版本化**，schema 变更可追踪；PII 列在契约中标注且不得下泄到下游 mart。

## 互见

- requires：无。
- related：`csv-data-cleaner`（单机离线表的清洗，与入库后的质量校验互补）；`sql-query-builder`（被校验对象多由 SQL 建模产出）。
- combines_with：无。

---
本条采编自 wshobson/agents（MIT）。
