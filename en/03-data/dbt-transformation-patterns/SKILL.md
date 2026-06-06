---
name: dbt-transformation-patterns
title: dbt Transformation Patterns
description: Production-ready patterns for dbt (data build tool) including model organization, testing strategies, documentation, and incremental processing.
domain: 数据/pipeline
triggers: [dbt, staging, marts, incremental, dbt test, dim_/fct_, dbt_project.yml]
tags: [dbt, elt, sql, misc]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [dbt-transformation-modeler, snowflake-development, data-pipeline-engineer, sql-query-builder]
combines_with: [data-quality-validator, airflow-dag-patterns, snowflake-development]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
# dbt Transformation Patterns

Production-ready patterns for dbt (data build tool) including model organization, testing strategies, documentation, and incremental processing.

## Use this skill when

- Building data transformation pipelines with dbt
- Organizing models into staging, intermediate, and marts layers
- Implementing data quality tests and documentation
- Creating incremental models for large datasets
- Setting up dbt project structure and conventions

## Do not use this skill when

- The project is not using dbt or a warehouse-backed workflow
- You only need ad-hoc SQL queries
- There is no access to source data or schemas

## Instructions

- Define model layers, naming, and ownership.
- Implement tests, documentation, and freshness checks.
- Choose materializations and incremental strategies.
- Optimize runs with selectors and CI workflows.
- If detailed patterns are required, open `resources/implementation-playbook.md`.

## Resources

- `resources/implementation-playbook.md` for detailed dbt patterns and examples.

## Limitations
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
