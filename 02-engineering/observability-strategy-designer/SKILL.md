---
name: observability-strategy-designer
title: 可观测性策略设计（指标日志追踪）
description: 当为新服务接入可观测性、治理过于嘈杂的告警，或上量前建立 SLO 体系时使用；做指标/日志/追踪三支柱设计，产出 SLI/SLO、错误预算、多窗口燃尽率告警、Grafana 仪表盘与运行手册；不适用于纯业务数据分析或一次性故障排查。触发词：SLO、告警降噪、可观测性
domain: 研发/observability
triggers: [可观测性, observability, SLI, SLO, 错误预算, 燃尽率, burn rate, 黄金信号, golden signals, 告警降噪, 告警优化, Grafana 仪表盘, 分布式追踪, RED 方法, USE 方法, 监控接入, 运行手册, runbook]
tags: [研发, observability, SLO, 监控告警, 指标, 日志, 追踪, SRE, Prometheus, Grafana]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [slo_designer.py, alert_optimizer.py, dashboard_generator.py, Prometheus, Grafana]
requires: []
related: []
combines_with: []
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

适用场景：
- 为新服务接入可观测性，需要从零规划指标、日志、追踪三支柱。
- 上生产量级前建立 SLI/SLO 体系，并配套错误预算与燃尽率告警。
- 现有告警过于嘈杂（误报多、疲劳严重），需要降噪与覆盖度治理。
- 设计角色化（SRE / 开发 / 高管 / 运维）的 Grafana 仪表盘与运行手册。

不该用的边界：
- 纯业务数据分析、BI 报表（与系统可靠性无关）。
- 一次性线上故障的临场排查（本技能产出的是体系与配置，不替代实时 oncall 操作）。
- 仅需引入某个监控工具的安装部署，不涉及策略设计。

## 步骤

1. 明确服务画像：类型（api / web / database / queue / batch / ml）、关键级别（critical / high / medium / low）、是否面向用户、依赖与合规要求，整理成服务定义 JSON。
2. 设计 SLI/SLO：按服务类型选 SLI，按关键级别定目标，计算错误预算，生成多窗口燃尽率告警与 SLA 建议。
3. 治理告警：分析现有告警的噪声、重复、覆盖缺口与阈值合理性，输出优化后的配置。每条告警必须可执行、对症（alert on symptoms, not causes）。
4. 生成仪表盘：按目标角色生成覆盖黄金信号 / RED / USE 的 Grafana 面板，含模板变量与下钻路径。
5. 落地与迭代：以 IaC/GitOps 管理配置，按 MTTD/MTTR、告警精度、SLO 达成率持续调优。

## 指令

环境：Python 3.7+，仅用标准库，无外部依赖。脚本位于源技能 `scripts/` 目录。

```bash
# 1. 生成 SLI/SLO 框架（从服务定义文件）
python3 scripts/slo_designer.py --input assets/sample_service_api.json --output slo_framework.json
# 或用命令行参数 + 仅看摘要
python3 scripts/slo_designer.py --service-type api --criticality critical --user-facing true --service-name payment-service --summary-only

# 2. 告警优化（先只分析，再生成优化配置 / HTML 报告）
python3 scripts/alert_optimizer.py --input assets/sample_alerts.json --analyze-only
python3 scripts/alert_optimizer.py --input assets/sample_alerts.json --output optimized_alerts.json
python3 scripts/alert_optimizer.py --input assets/sample_alerts.json --report alert_analysis.html --format html

# 3. 生成仪表盘（按角色 + Grafana 兼容 JSON + 文档）
python3 scripts/dashboard_generator.py --service-type web --name "Customer Portal" --role sre --output portal_dashboard.json --doc-output portal_docs.md
python3 scripts/dashboard_generator.py --input assets/sample_service_api.json --output dashboard.json --format grafana
```

关键约束（来自源脚本，勿擅改）：

按关键级别的 SLO 目标：
- critical：可用性 99.99%，P95 < 100ms，P99 < 500ms，错误率 < 0.1%
- high：99.9%，P95 < 200ms，P99 < 1000ms，错误率 < 0.5%
- medium：99.5%，P95 < 500ms，P99 < 2000ms，错误率 < 1%
- low：99%，P95 < 1000ms，P99 < 5000ms，错误率 < 2%

多窗口燃尽率告警（短窗 / 长窗 / 燃尽率 / 预算消耗）：
- 5m / 1h / 14.4 / 2%（页级紧急）
- 30m / 6h / 6 / 5%
- 2h / 1d / 3 / 10%
- 6h / 3d / 1 / 10%（票级提醒）

各服务类型推荐 SLI：
- api：availability、latency、error_rate、throughput
- web：availability、latency、error_rate、page_load_time
- database：availability、query_latency、connection_success_rate、replication_lag
- queue：availability、message_processing_time、queue_depth、message_loss_rate
- batch：job_success_rate、job_duration、data_freshness、resource_utilization
- ml：model_accuracy、prediction_latency、training_success_rate、feature_freshness

仪表盘角色侧重：sre（可用性/延迟/错误/资源）、developer（延迟/错误/吞吐/业务）、executive（可用性/业务/用户体验）、ops（资源/容量/告警/部署）。仪表盘认知负荷上限 7±2 个面板/屏；红=严重、琥珀=警告、绿=健康；并在面板上叠加 SLO 目标参考线。

## 示例

服务定义 JSON（slo_designer 输入，必填 `name`/`type`/`criticality`）：

```json
{
  "name": "payment-service",
  "type": "api",
  "criticality": "critical",
  "user_facing": true,
  "dependencies": [
    { "name": "user-service", "type": "api", "criticality": "high" }
  ],
  "custom_slos": {
    "availability_target": 0.9995,
    "latency_p95_target_ms": 150,
    "error_rate_target": 0.002
  }
}
```

告警配置 JSON（alert_optimizer 输入，`historical_data` 可选但能提升分析质量）：

```json
{
  "alerts": [{
    "alert": "HighLatency",
    "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 0.5",
    "for": "5m",
    "labels": { "severity": "warning", "service": "payment-service" },
    "annotations": { "runbook_url": "https://runbooks.company.com/high-latency" },
    "historical_data": { "fires_per_day": 2.5, "false_positive_rate": 0.15 }
  }],
  "services": [{ "name": "payment-service", "criticality": "critical" }]
}
```

生成的 Prometheus 告警规则模板：

```yaml
- alert: {{ service_name }}_HighLatency
  expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{service="{{ service_name }}"}[5m])) > {{ latency_threshold }}
  for: 5m
  labels:
    severity: warning
    service: "{{ service_name }}"
```

## 注意事项

- 每个服务先从 1-2 个 SLO 起步并迭代；SLI 要直接反映用户体验，目标按用户需求而非技术上限设定。
- 告警务必可执行、对症告警而非告警根因；用滞回（firing/resolving 不同阈值）、依赖抑制、分组合并来防疲劳；追求高精度（少误报）优先于高召回。
- 高基数指标是成本与性能杀手，需检测与治理；指标/日志/追踪分别用分层保留与采样（含尾部采样）控成本。
- 配置一律纳入版本控制（IaC/GitOps），并对告警规则用历史数据回归校验。
- 用 MTTD、MTTR、告警精度、SLO 达成率衡量体系有效性并持续调优。

## 互见

- 研发/observability 同域可参考：分布式追踪、Prometheus 配置、Grafana 仪表盘、SLO 实施等相邻技能。
- 上游产物（服务定义 JSON）可来自架构设计类技能；下游可对接事件管理（PagerDuty/告警路由）与 CI/CD 流水线监控。

---
采编自 alirezarezvani/claude-skills（MIT 许可）。
