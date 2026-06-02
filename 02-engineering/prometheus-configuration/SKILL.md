---
name: prometheus-configuration
title: Prometheus 监控配置
description: 当需要部署 Prometheus、配置抓取(scrape)/服务发现、编写 recording 与告警规则并用 promtool 校验时使用；产出 prometheus.yml、规则文件与验证命令；不适用于 Grafana 看板、告警通知路由(Alertmanager)、追踪/日志或 PromQL 排障；触发词：Prometheus、prometheus.yml、scrape、recording rule、告警规则、promtool、kube-prometheus、node-exporter。
domain: 研发/observability
triggers: [Prometheus, prometheus.yml, scrape, recording rule, 告警规则, alert rule, promtool, kube-prometheus, node-exporter, service discovery, 服务发现, relabel]
tags: [prometheus, monitoring, observability, devops, sre]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [prometheus, promtool, helm, docker-compose]
requires: []
related: [grafana-dashboards, slo-sli-implementation, observability-strategy-designer, distributed-tracing]
combines_with: [kubernetes-architect, devops-troubleshooter, sre-incident-responder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
采编自 sickn33/antigravity-awesome-skills（MIT）。

## 何时使用

- 需要从零搭建 Prometheus（Helm/Docker Compose）并编写 `prometheus.yml`。
- 需要配置抓取目标：静态 targets、文件服务发现、Kubernetes 服务发现，并用 relabel 清洗标签。
- 需要写 recording 规则（预聚合高频/昂贵查询）或告警规则（up、错误率、P95、CPU/内存/磁盘）。
- 需要用 `promtool` 校验配置与规则、自检抓取目标是否健康。

不该用的边界：
- 只做可视化看板 → 用 Grafana 相关技能，本技能不画图。
- 告警的通知渠道/分组/静默/路由 → 属 Alertmanager 配置，本技能只声明 `alerting` 指向它并写规则。
- 写复杂 PromQL 做即席排障、做 SLO/错误预算建模、分布式追踪/日志 → 超出范围。
- 长期存储/联邦的深度运维（Thanos/Cortex 搭建细节）→ 仅在最佳实践中点到，不展开。

## 步骤 / 指令

```
1. 部署 Prometheus（按环境二选一）
   - K8s：helm 装 kube-prometheus-stack，设 retention 与存储卷大小。
   - 单机/本地：Docker Compose 起 prom/prometheus，挂载 prometheus.yml 与数据卷。

2. 写 prometheus.yml 主配置
   - global：scrape_interval / evaluation_interval（典型 15~60s）、external_labels（cluster/region）。
   - alerting：alertmanagers.static_configs 指向 alertmanager:9093。
   - rule_files：通配载入 /etc/prometheus/rules/*.yml。
   - scrape_configs：先加 prometheus 自监控，再加各 job。

3. 配抓取目标（按来源选一种或多种）
   - 静态：static_configs.targets + 可选 labels。
   - 文件 SD：file_sd_configs.files 指向 *.json/*.yml，配 refresh_interval。
   - K8s SD：kubernetes_sd_configs.role=pod|service，用 relabel_configs 按
     prometheus.io/scrape、/path、/port 注解 keep+改写 __address__/__metrics_path__。
   - 用 relabel 把 __meta_* 元标签落成 namespace/pod 等业务标签。

4. 写 recording 规则（rules/recording_rules.yml）
   - 命名遵循 level:metric:operation（如 job:http_requests:rate5m）。
   - 预聚合：请求率、错误率%、histogram_quantile 算 P95、节点 CPU/内存/磁盘利用率。

5. 写告警规则（rules/alert_rules.yml）
   - 每条含 expr / for / labels.severity / annotations.summary+description。
   - 复用 recording 结果当 expr（如 job:http_requests_error_rate:percentage > 5）。

6. 校验后再上线
   - promtool check config / check rules，必要时 query instant 自测。
   - reload 后查 /api/v1/targets 确认目标 UP。
```

规则与约定：
- 指标命名一致：`前缀_名称_单位`；recording 规则名用 `level:metric:operation` 冒号风格。
- 抓取间隔按需 15~60s；昂贵查询一律转 recording 规则，告警 expr 引用预聚合结果以降负载。
- relabel 用于标签清洗与 SD 过滤（`action: keep/replace`），别在告警里堆裸 PromQL。
- 改完配置/规则必须先 `promtool` 校验再 reload，避免坏配置中断抓取。

## 示例

部署（K8s / 本地二选一）：
```bash
# Kubernetes + Helm
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring --create-namespace \
  --set prometheus.prometheusSpec.retention=30d \
  --set prometheus.prometheusSpec.storageVolumeSize=50Gi
```
```yaml
# docker-compose.yml（本地）
services:
  prometheus:
    image: prom/prometheus:latest
    ports: ["9090:9090"]
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'
volumes:
  prometheus-data:
```

主配置 prometheus.yml（含 K8s pod 服务发现）：
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels: { cluster: 'production', region: 'us-west-2' }
alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']
rule_files:
  - /etc/prometheus/rules/*.yml
scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node1:9100', 'node2:9100']
  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)
      - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
        action: replace
        regex: ([^:]+)(?::\d+)?;(\d+)
        replacement: $1:$2
        target_label: __address__
      - source_labels: [__meta_kubernetes_namespace]
        action: replace
        target_label: namespace
```

文件服务发现：
```yaml
- job_name: 'file-sd'
  file_sd_configs:
    - files: ['/etc/prometheus/targets/*.json']
      refresh_interval: 5m
```
```json
[{ "targets": ["app1:9090", "app2:9090"], "labels": { "env": "production", "service": "api" } }]
```

recording 规则（预聚合）：
```yaml
groups:
  - name: api_metrics
    interval: 15s
    rules:
      - record: job:http_requests:rate5m
        expr: sum by (job) (rate(http_requests_total[5m]))
      - record: job:http_requests_errors:rate5m
        expr: sum by (job) (rate(http_requests_total{status=~"5.."}[5m]))
      - record: job:http_requests_error_rate:percentage
        expr: (job:http_requests_errors:rate5m / job:http_requests:rate5m) * 100
      - record: job:http_request_duration:p95
        expr: histogram_quantile(0.95, sum by (job, le) (rate(http_request_duration_seconds_bucket[5m])))
  - name: resource_metrics
    interval: 30s
    rules:
      - record: instance:node_cpu:utilization
        expr: 100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
      - record: instance:node_memory:utilization
        expr: 100 - ((node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100)
```

告警规则：
```yaml
groups:
  - name: availability
    rules:
      - alert: ServiceDown
        expr: up{job="my-app"} == 0
        for: 1m
        labels: { severity: critical }
        annotations:
          summary: "Service {{ $labels.instance }} is down"
          description: "{{ $labels.job }} has been down for more than 1 minute"
      - alert: HighErrorRate
        expr: job:http_requests_error_rate:percentage > 5
        for: 5m
        labels: { severity: warning }
        annotations:
          summary: "High error rate for {{ $labels.job }}"
          description: "Error rate is {{ $value }}% (threshold: 5%)"
  - name: resources
    rules:
      - alert: HighCPUUsage
        expr: instance:node_cpu:utilization > 80
        for: 5m
        labels: { severity: warning }
        annotations: { summary: "High CPU on {{ $labels.instance }}", description: "CPU {{ $value }}%" }
      - alert: DiskSpaceLow
        expr: instance:node_disk:utilization > 90
        for: 5m
        labels: { severity: critical }
        annotations: { summary: "Low disk on {{ $labels.instance }}", description: "Disk {{ $value }}%" }
```

校验与自检：
```bash
promtool check config prometheus.yml
promtool check rules /etc/prometheus/rules/*.yml
promtool query instant http://localhost:9090 'up'
curl http://localhost:9090/api/v1/targets          # 抓取目标健康
curl http://localhost:9090/api/v1/status/config    # 当前生效配置
```

## 注意事项

- 上线前必校验：任何 `prometheus.yml`/规则改动先 `promtool check`，坏配置 reload 会中断抓取。
- recording 规则名用 `level:metric:operation` 冒号风格；指标命名统一为 `前缀_名称_单位`，避免后续聚合混乱。
- 告警 expr 尽量引用 recording 结果，别在告警里直接跑昂贵聚合，否则评估周期被拖垮。
- K8s SD 强依赖 relabel：`action: keep` 决定哪些 pod/service 被抓，漏配会抓全量或抓不到。注解端口改写要保留 `__address__:port` 形态。
- `for` 不可省：避免抖动误告警；severity 至少区分 critical/warning，供 Alertmanager 路由。
- 抓取间隔与 retention 配比要按存储容量定；大规模再上联邦/Thanos/Cortex 做长期存储，并务必监控 Prometheus 自身。
- HTTPS 抓取目标配 `tls_config`（ca/cert/key），`scheme: https`，否则抓取失败。
- 不要凭记忆填 CVE/版本/exporter 端口，以实际环境与 `/api/v1/targets` 输出为准。

## 互见

- related：`code-reviewer`、`dependency-auditor` —— 同属研发域工程治理；本技能聚焦监控配置产物。
- combines_with：Grafana 看板（可视化 recording/告警指标）、Alertmanager（承接本技能写的告警规则做通知路由），二者与本技能上下游协同构成完整可观测链路。
