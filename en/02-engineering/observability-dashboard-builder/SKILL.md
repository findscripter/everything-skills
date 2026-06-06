---
name: observability-dashboard-builder
title: ダッシュボード ビルダー
description: Grafana、SigNoz、および同様のプラットフォーム用の実際のオペレータ質問に答える監視ダッシュボードを構築します。メトリクスを虚栄ボードではなく機能するダッシュボードに変える場合に使用します。
domain: 研发/observability
triggers: [SigNoz, dashboard, operational dashboard, vanity panel]
tags: [observability, grafana, signoz, promql]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [grafana-dashboards, observability-strategy-designer, prometheus-configuration, distributed-tracing]
combines_with: [slo-sli-implementation, prometheus-configuration, observability-strategy-designer]
license: MIT
source: affaan-m/everything-claude-code
source_license: MIT
---
# Dashboard Builder

Use this when the task is to build a dashboard that people can operate from.

The goal is not "show every metric." The goal is to answer these questions:

- Is it healthy?
- Where is the bottleneck?
- What changed?
- What action should someone take?

## When to Use

- "Build a Kafka monitoring dashboard"
- "Create a Grafana dashboard for Elasticsearch"
- "Create a SigNoz dashboard for this service"
- "Turn this list of metrics into a real operational dashboard"

## Guardrails

- Don't start from the visual layout; start from the operator's questions
- Don't include every metric that happens to be available
- Don't mix health, throughput, and resource panels together with no structure
- Don't ship a panel without a title, units, and sensible thresholds

## Workflow

### 1. Define the Operational Questions

Organize around:

- Health/availability
- Latency/performance
- Throughput/volume
- Saturation/resources
- Service-specific risks

### 2. Study the Target Platform Schema

Inspect existing dashboards first:

- JSON structure
- Query language

### 3. Select the Metrics

Include only the metrics operators actually watch, alert on, and need in order to respond.

### 4. Build the Layout

Group panels by question.
