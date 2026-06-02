---
name: data-pipeline-engineer
title: 数据管道与流式架构工程
description: 当需要设计批处理/流式数据管道、数据仓库或湖仓架构、CDC 实时同步、数据质量与血缘治理时使用；做架构选型与可落地的摄取-转换-校验-监控管道实现及交付物；不适用于纯探索性数据分析、不含管道的 ML 建模、无法访问数据源或存储系统的场景。触发词：数据管道、Spark/dbt/Airflow、Kafka 流处理、湖仓 lakehouse、CDC、数据质量
domain: 数据/pipeline
triggers: [数据管道, ETL, ELT, 数据仓库, 湖仓, lakehouse, Spark, dbt, Airflow, Kafka, Flink, 流式处理, CDC, 变更数据捕获, 数据质量, 数据血缘, Snowflake, BigQuery, 数据建模, 维度建模, Delta Lake, Iceberg, 编排]
tags: [数据工程, 数据管道, 流式处理, 数据仓库, 湖仓架构, ETL, ELT, 编排, 数据质量, 数据治理, CDC, 云数据平台, misc]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Spark, dbt, Airflow, Kafka, Flink, Great Expectations, Snowflake, BigQuery, Delta Lake, Iceberg, Terraform, Prefect, Dagster]
requires: []
related: [airflow-dag-builder, dbt-transformation-modeler, snowflake-development, spark-job-optimization]
combines_with: [airflow-dag-builder, data-quality-frameworks, dbt-transformation-modeler]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用场景：

- 设计批处理或流式数据管道（含晚到/乱序数据处理）。
- 构建数据仓库、湖仓（lakehouse）或数据网格（data mesh）架构。
- 落地数据质量、血缘（lineage）与治理体系。
- 搭建 CDC 实时同步，或为 ML 应用做实时特征工程。

不该用的边界（命中任一应转其他技能或先补齐前置条件）：

- 仅做一次性探索性数据分析（EDA），不涉及可复用管道。
- 只做 ML 模型开发，不涉及数据管道工程。
- 无法访问数据源或存储系统（缺权限、缺连接），应先停下来索要凭据与访问范围。

## 步骤

1. 定义来源、SLA 与数据契约（data contract）：先明确规模、延迟、一致性需求与 schema 约定。
2. 选型架构、存储与编排工具：在批/流、仓/湖仓、自建/云原生之间按成本与性能权衡。
3. 实现摄取、转换与校验：每个写入环节都嵌入数据质量检查。
4. 监控质量、成本与运行可靠性：从第一天起就接入监控、告警与失败恢复，并产出运维手册（runbook）。

## 指令

- 架构分层选型：
  - 湖仓表格式：Delta Lake / Apache Iceberg / Apache Hudi。
  - 云数仓：Snowflake / BigQuery / Redshift / Databricks SQL。
  - 实时分析 OLAP：ClickHouse / Apache Pinot / Apache Druid；查询引擎 Trino/Presto、Spark SQL。
- 批处理与 ELT：Apache Spark（Catalyst + 列式处理）做大规模计算；dbt Core/Cloud 做带版本控制与测试的转换；轻量场景用 Python 的 pandas/Polars/Ray。
- 流式与事件处理：Kafka/Pulsar 做事件流；Flink/Kafka Streams 做含窗口、聚合、join 的复杂事件处理；CDC 驱动实时同步；schema 演进保持向后兼容。
- 编排：Airflow（自定义 operator + 动态 DAG）、Prefect、Dagster（资产化编排）；容器原生用 K8s CronJob / Argo Workflows。
- 数据建模：维度建模（星型/雪花）、Data Vault、One Big Table；用 SCD 策略处理缓变维；按分区与聚簇（partition/cluster）优化性能，增量加载配合 CDC。
- 数据质量与治理：用 Great Expectations 或自定义校验器做质量框架；用 DataHub / Apache Atlas / Collibra 做血缘与目录；管理 schema 演进与兼容性。
- 安全合规：写入生产 sink 前先校验数据；对 PII 做脱敏/匿名化，落实最小权限（least-privilege）与行级安全；传输与静态加密；满足 GDPR/CCPA/HIPAA。
- 基础设施：用 Terraform/CloudFormation/Bicep 做 IaC 实现可复现部署；用 Prometheus/Grafana/ELK 做监控日志。

## 示例

- 设计每秒处理 100 万事件、从 Kafka 落到 BigQuery 的实时流式管道。
- 用 dbt + Snowflake + Fivetran 搭建做维度建模的现代数据栈。
- 在 AWS 上用 Delta Lake 落地成本优化的数据湖仓架构。
- 构建跨数据库实时同步的 CDC 管道。
- 实现能监控并对数据异常告警的数据质量框架。
- 实现可处理晚到与乱序数据的可扩展 ETL 管道。

## 注意事项

- 可靠性与一致性优先于临时性的 quick fix；监控告警从设计阶段就纳入，而非事后补。
- 数据治理与合规要在设计期规划，不要后置。
- 写入生产前必须校验数据；保护 PII，强制最小权限访问。
- 用 IaC 保证部署可复现，并为管道与转换编写充分测试。
- 清晰记录数据 schema、血缘与业务逻辑，给运维交付 runbook。
- 成本与性能要权衡：避免为追求极致性能牺牲运维简洁性。
- 本技能输出不能替代针对具体环境的验证、测试与专家评审；若缺少必要输入、权限、安全边界或成功标准，应停下来澄清。

## 互见

- 纯探索性数据分析或不含管道的 ML 建模：转相应的数据分析/ML 技能。
- 云基础设施编排与 IaC：可结合 DevOps/基础设施类技能。
- 数据 API 与对外集成：结合 API 开发类技能。

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可证）。
