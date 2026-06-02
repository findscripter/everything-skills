---
name: data-quality-frameworks
title: 数据质量验证框架
description: 当为数据管道建立质量校验、用 Great Expectations / dbt 测试 / 数据契约约束数据时使用；做按六维度（完整/唯一/有效/准确/一致/时效）定义期望与契约并接入 CI/CD 的可执行方案；不适用于数据源未定义、无权改校验规则或与数据质量无关的任务；触发词：数据质量、data quality、Great Expectations、期望套件、dbt 测试、dbt test、数据契约、data contract、Soda、数据校验、新鲜度。
domain: 数据/pipeline
triggers: [数据质量, data quality, Great Expectations, 期望套件, dbt 测试, dbt test, 数据契约, data contract, Soda, 数据校验, 新鲜度]
tags: [data-quality, great-expectations, dbt, data-contract, pipeline, ci-cd, validation, soda]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Great Expectations, dbt, dbt_utils, Soda / SodaCL, Snowflake, Python, YAML, SQL]
requires: []
related: [data-quality-validator, dataset-quality-auditor, dbt-transformation-modeler, data-pipeline-engineer]
combines_with: [dbt-transformation-modeler, airflow-dag-builder, data-pipeline-engineer]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：

- 在数据管道中加入质量校验、阻断脏数据进入下游。
- 用 Great Expectations 搭建期望套件（Expectation Suite）与 Checkpoint。
- 用 dbt 测试（通用测试、自定义测试、单值测试）覆盖模型。
- 在团队/系统间建立数据契约（Data Contract）约束 schema、SLA 与质量。
- 监控数据质量指标，并在 CI/CD 中自动校验、告警。

不该用（负边界）：

- 数据源尚未定义或无法访问。
- 你无权修改校验规则或 schema。
- 任务与数据质量、数据契约无关。

## 步骤 / 指令

1. **锁定关键数据集与质量维度**：按六维度选检查项——完整性 `expect_column_values_to_not_be_null`、唯一性 `expect_column_values_to_be_unique`、有效性 `expect_column_values_to_be_in_set`、准确性（交叉引用）、一致性 `expect_column_pair_values_A_to_be_greater_than_B`、时效性 `expect_column_max_to_be_between`。
2. **定义期望/测试与契约规则**：遵循「数据测试金字塔」——底层 Schema 测试（结构）、中层单列单元测试、顶层跨表集成测试。
3. **接入 CI/CD 并定时调度**：用 Checkpoint 或 dbt run/test 在流水线中跑校验，失败即阻断。
4. **设置告警、归属与修复**：配置 Slack 等通知、明确 owner 与 remediation 步骤。
5. 需要更细模板时参考源仓库的 `resources/implementation-playbook.md`。

原则：尽早测、增量加测、为每条期望写清描述、对失败告警、为契约做版本管理；不要全量测（聚焦关键列）、不要忽略告警、不要漏掉新鲜度、不要硬编码阈值、不要孤立测试（要测关系）。

## 示例

Great Expectations 初始化与最小套件：

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
results = context.run_checkpoint(checkpoint_name="orders_checkpoint")
if not results.success:
    raise ValueError("数据质量校验失败")
```

dbt 测试（schema.yml 片段）：

```yaml
models:
  - name: fct_orders
    columns:
      - name: order_id
        tests: [unique, not_null]
      - name: customer_id
        tests:
          - not_null
          - relationships:
              to: ref('dim_customers')
              field: customer_id
      - name: order_status
        tests:
          - accepted_values:
              values: ['pending','processing','shipped','delivered','cancelled']
```

数据契约（含 SodaCL 质量校验 + SLA）：

```yaml
apiVersion: datacontract.com/v1.0.0
kind: DataContract
metadata: { name: orders, version: 1.0.0, owner: data-platform-team }
quality:
  type: SodaCL
  specification:
    checks for orders:
      - row_count > 0
      - missing_count(order_id) = 0
      - duplicate_count(order_id) = 0
      - freshness(created_at) < 24h
sla: { availability: 99.9%, freshness: 1 hour, latency: 5 minutes }
```

## 注意事项

- 不要在没有降级/回退方案时直接阻断关键管道。
- 校验输出中的敏感数据（PII）需安全处理，下游 mart 不得暴露 PII；契约中用 `pii`/`piiClassification` 标注。
- 阈值优先用动态基线，避免硬编码；告警关注 warning，它常先于 failure 出现。
- 本技能不替代针对具体环境的验证、测试与专家评审；缺少必要输入、权限、安全边界或成功标准时先停下来澄清。

## 互见

- csv-data-cleaner：数据清洗与去重，校验前的预处理。
- sql-query-builder：编写跨表关系/单值断言所需的 SQL。
- rag-pipeline-builder：为 RAG 数据管道接入质量校验。
- code-reviewer：评审校验规则与管道代码。

---

本条采编自 sickn33/antigravity-awesome-skills（MIT）。
