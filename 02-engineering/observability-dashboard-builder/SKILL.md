---
name: observability-dashboard-builder
title: 可运维监控仪表盘构建（Grafana/SigNoz）
description: 当要把一堆指标变成运维人员真能照着排障的监控仪表盘（Grafana/SigNoz 等）时使用；做从「运维四问」出发的面板分组设计，产出含标题/单位/阈值/模板变量的可用 dashboard JSON 与质量清单；不适用于 SLO/告警体系设计或一次性临场排障。触发词：Grafana 仪表盘、SigNoz、监控面板
domain: 研发/observability
triggers: [Grafana 仪表盘, SigNoz, 监控面板, 监控仪表盘, dashboard, 运维仪表盘, Kafka 监控, Elasticsearch 监控, API 网关监控, 可观测面板, 指标可视化, operational dashboard, 面板分组, vanity panel, 虚荣面板]
tags: [研发, observability, grafana, signoz, 监控仪表盘, 运维, 可视化, promql]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Grafana, SigNoz, PromQL]
requires: []
related: [grafana-dashboards, observability-strategy-designer, prometheus-configuration, distributed-tracing]
combines_with: [slo-sli-implementation, prometheus-configuration, observability-strategy-designer]
license: MIT
source: affaan-m/everything-claude-code
source_license: MIT
---
## 何时使用

任务是构建一块**运维人员能照着排障**的监控仪表盘时使用。目标不是「把所有指标都显示出来」，而是回答四个运维问题：

- 它健康吗？（is it healthy）
- 瓶颈在哪？（where is the bottleneck）
- 什么发生了变化？（what changed）
- 谁该采取什么行动？（what action should someone take）

不该用的边界：

- 只是要设计 SLI/SLO、错误预算、多窗口燃尽率告警等**可观测性体系** → 用 `observability-strategy-designer`。
- 一次性线上故障的临场排查（本技能产出的是可复用看板，不替代实时 oncall 操作）。
- 仅需安装/部署某个监控工具，不涉及面板设计。

## 步骤

### 1. 先定运维问题，再谈布局

围绕这几类组织面板，**禁止从视觉布局起步**：

- 健康 / 可用性（health / availability）
- 延迟 / 性能（latency / performance）
- 吞吐 / 流量（throughput / volume）
- 饱和 / 资源（saturation / resources）
- 服务特有风险（service-specific risk）

### 2. 研究目标平台的 schema

先**检视已有 dashboard**，再动手，重点看：JSON 结构、查询语言（Grafana=PromQL/LogQL，SigNoz=ClickHouse/PromQL）、模板变量（variables）、阈值着色样式、分区布局。

### 3. 构建「最小有用看板」

推荐分区结构：

1. 概览（overview）
2. 性能（performance）
3. 资源（resources）
4. 服务特有分区（service-specific）

### 4. 砍掉虚荣面板（vanity panels）

每个面板都要能回答一个真实问题；答不上来就删掉。

## 指令

护栏（Guardrails，硬约束）：

- 不要从视觉布局开始，要从运维问题开始。
- 不要因为某个指标「存在」就把所有可用指标都塞进去。
- 不要把健康、吞吐、资源面板**无结构地混在一起**。
- 不要交付没有标题、单位、合理阈值的面板。

质量清单（交付前逐项核对）：

- [ ] dashboard JSON 合法（可被 Grafana/SigNoz 导入）
- [ ] 分区分组清晰
- [ ] 每个面板都有标题与单位
- [ ] 阈值 / 状态色有意义（红=严重、琥珀=警告、绿=健康）
- [ ] 为常用筛选维度配置了模板变量（如 service、instance、env）
- [ ] 默认时间范围与刷新频率合理
- [ ] 没有「无运维价值」的虚荣面板

## 示例

### Elasticsearch

- 集群健康（cluster health）
- 分片分配（shard allocation）
- 搜索延迟（search latency）
- 索引速率（indexing rate）
- JVM 堆内存 / GC

### Kafka

- broker 数量
- under-replicated 分区数
- 进出消息速率（messages in / out）
- 消费者滞后（consumer lag）
- 磁盘与网络压力

### API 网关 / Ingress

- 请求速率（request rate）
- p50 / p95 / p99 延迟
- 错误率（error rate）
- 上游健康（upstream health）
- 活跃连接数（active connections）

## 注意事项

- 「显示全部指标」是反模式：信息越多，运维时认知负荷越高、越难定位问题；宁缺毋滥。
- 同一屏内不要混排不同语义（健康 vs 资源），用分区把同类问题聚到一起。
- 阈值要可解释——颜色映射到「该不该有人动作」，而不是好看。
- 模板变量决定了一块看板能否复用到多服务 / 多环境，优先在采集标签里规划好维度。
- 先确认目标平台的查询语言与 JSON schema 再写面板，避免生成不可导入的配置。

## 互见

- requires：无强前置；建议先有指标采集（Prometheus 等）就位。
- related：`grafana-dashboards`、`prometheus-configuration`、`distributed-tracing` —— 同域的采集与可视化邻居。
- combines_with：`observability-strategy-designer` —— 先用它定 SLI/SLO 与告警体系，本技能把这些指标落成可运维看板；`incident-commander-framework` —— 故障时看板是 IC 的态势来源。

---
采编自 affaan-m/everything-claude-code（MIT 许可）。
