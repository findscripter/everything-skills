---
name: grafana-dashboards
title: Grafana 可观测看板
description: 当需要为 Prometheus 指标搭建生产级监控看板（API/基础设施/数据库/SLO/业务 KPI）时使用；做按 RED/USE 方法设计面板并产出可版本化的 Dashboard JSON、模板变量、告警与 Provisioning/IaC 配置；不适用于指标采集本身或非 Grafana 可视化场景；触发词：Grafana、看板、可观测、Prometheus、SLO
domain: 研发/observability
triggers: [Grafana 看板, 可观测大盘, Prometheus 可视化, SLO 仪表盘, 监控面板设计, dashboard JSON, RED 方法, USE 方法, 面板告警, dashboard as code]
tags: [grafana, prometheus, observability, dashboard, monitoring, slo, iac, 研发]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Write, Edit, Bash]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

当你要为系统、服务或业务搭建生产可用的 Grafana 监控看板时使用，典型场景：

- 把 Prometheus 指标可视化为大盘（请求量、错误率、延迟等）。
- 设计 API / 基础设施 / 数据库 / 应用 / 业务 KPI 看板。
- 落地 SLO 看板与面板内告警。
- 用模板变量做多环境/多服务复用，或用 Terraform/Ansible 做「看板即代码」。

**不该用的边界：**

- 任务与 Grafana 看板无关。
- 需求其实是「指标采集/抓取配置」（属 Prometheus 配置范畴）或非 Grafana 的可视化工具。
- 需要的是脱离具体环境的最终结论——本技能产出仍需在真实环境验证。

## 步骤

1. 明确目标：监控对象是服务还是资源、关键问题是什么、谁来看（值班/管理层）。
2. 选方法论：服务用 **RED**（Rate 请求率 / Errors 错误率 / Duration 延迟），资源用 **USE**（Utilization 利用率 / Saturation 饱和度 / Errors 错误数）。
3. 排信息层级：顶部放关键大数字（Stat），中部放趋势（Time Series），底部放明细（Table/Heatmap）。
4. 写 PromQL 与面板：逐个确定 `expr`、`legendFormat`、单位、阈值与配色。
5. 加模板变量（namespace/service 等）实现复用，并在查询中引用 `$var`。
6. 配告警与 Provisioning，必要时落到 Terraform/Ansible 实现看板即代码。
7. 用不同时间范围验证，补面板描述与一致命名。

## 指令

- 信息层级（从上到下）：关键大数字 → 关键趋势 → 详细指标。
- 服务三件套 RED；资源三件套 USE。
- 最佳实践：优先复用社区模板；命名一致；相关指标分组成 row；默认时间范围合理（如 Last 6 hours）；正确配置单位；阈值/配色有意义且跨看板一致；为面板加描述；多时间范围测试。

## 示例

**API 看板核心三面板（RED 的 PromQL）：**

请求率：
```
sum(rate(http_requests_total[5m])) by (service)
```

错误率（%）：
```
(sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))) * 100
```

P95 延迟：
```
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, service))
```

资源类 PromQL 示例——CPU 使用率：
```
100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
```

**面板片段（Time Series，含 12x8 网格位）：**
```json
{
  "title": "Request Rate",
  "type": "graph",
  "targets": [
    { "expr": "sum(rate(http_requests_total[5m])) by (service)", "legendFormat": "{{service}}" }
  ],
  "gridPos": {"x": 0, "y": 0, "w": 12, "h": 8}
}
```

**模板变量（级联）：**
```json
{
  "templating": { "list": [
    { "name": "namespace", "type": "query", "datasource": "Prometheus",
      "query": "label_values(kube_pod_info, namespace)", "refresh": 1, "multi": false },
    { "name": "service", "type": "query", "datasource": "Prometheus",
      "query": "label_values(kube_service_info{namespace=\"$namespace\"}, service)", "refresh": 1, "multi": true }
  ] }
}
```
在查询中引用：`sum(rate(http_requests_total{namespace="$namespace", service=~"$service"}[5m]))`

**面板告警（错误率 > 5%）：**
```json
{
  "alert": {
    "name": "High Error Rate", "for": "5m", "frequency": "1m",
    "conditions": [{
      "evaluator": {"params": [5], "type": "gt"},
      "operator": {"type": "and"},
      "query": {"params": ["A", "5m", "now"]},
      "reducer": {"type": "avg"}, "type": "query"
    }],
    "executionErrorState": "alerting", "noDataState": "no_data",
    "message": "Error rate is above 5%",
    "notifications": [{"uid": "slack-channel"}]
  }
}
```

**Provisioning（dashboards.yml）：**
```yaml
apiVersion: 1
providers:
  - name: 'default'
    orgId: 1
    folder: 'General'
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /etc/grafana/dashboards
```

**看板即代码（Terraform）：**
```hcl
resource "grafana_folder" "monitoring" {
  title = "Production Monitoring"
}
resource "grafana_dashboard" "api_monitoring" {
  config_json = file("${path.module}/dashboards/api-monitoring.json")
  folder      = grafana_folder.monitoring.id
}
```

**常见看板的关键面板清单：**

- 基础设施：各节点 CPU/内存、磁盘 I/O、网络流量、各命名空间 Pod 数、节点状态。
- 数据库：QPS、连接池占用、查询延迟（P50/P95/P99）、活跃连接、库大小、复制延迟、慢查询。
- 应用：请求率、错误率、响应时间分位、活跃用户/会话、缓存命中率、队列长度。

## 注意事项

- 面板类型按用途选：单值用 `stat`（配 thresholds 三档配色），趋势用 time series 并设好 `format`/`max`/`min`，明细用 `table`（instant + organize transformation 重命名列），延迟分布用 `heatmap`（`dataFormat: tsbuckets`）。
- 告警配置要点：`for` 控制持续时间、`noDataState`/`executionErrorState` 决定无数据与执行异常时的行为，避免抖动误报。
- 看板 JSON 应纳入版本管理；改动通过 Provisioning 或 IaC 下发而非仅手工编辑 UI。
- 产出不能替代针对具体环境的验证、测试与专家评审；若缺少必要输入、权限或成功标准，先停下来澄清。

## 互见

- Prometheus 配置（指标采集）——本技能聚焦可视化，采集与抓取规则在此之外。
- SLO 实施——SLO 看板的目标定义与错误预算计算。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
