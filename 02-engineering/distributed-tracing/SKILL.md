---
name: distributed-tracing
title: Jaeger/Tempo 分布式链路追踪
description: 当需要排查微服务链路延迟/依赖/错误传播时使用；用 OpenTelemetry 埋点并部署 Jaeger/Tempo 输出可查询的链路与服务依赖图；不适用于单体无跨服务调用或仅需指标/日志的场景；触发词：分布式追踪、链路、Jaeger、Tempo、OpenTelemetry、span、trace
domain: 研发/observability
triggers: [分布式追踪, 链路追踪, Jaeger, Tempo, OpenTelemetry, trace, span, context propagation, 服务依赖图, 链路延迟排查, trace_id 关联日志, 采样策略]
tags: [可观测性, 分布式追踪, Jaeger, Tempo, OpenTelemetry, 微服务, Kubernetes, 研发]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [OpenTelemetry, Jaeger, Grafana Tempo, kubectl, Docker Compose]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用于跨多个微服务的请求需要端到端观测时：排查链路延迟、梳理服务依赖、定位性能瓶颈、追踪错误在调用链上的传播、还原完整请求路径。

不该用：
- 单体应用或无跨服务调用，没有可串联的 trace；
- 只需聚合指标（用 Prometheus）或集中日志（用日志系统），不关心单请求逐跳路径；
- 任务与分布式追踪无关，或需要本 scope 之外的工具/领域。

核心概念：Trace（一次请求的端到端旅程）由若干 Span（链路中的单个操作）组成；Span 之间通过 Context（跨服务传播的元数据）串联；Tags（键值对，用于过滤）、Logs（Span 内带时间戳的事件）补充细节。典型结构 frontend → api-gateway →（auth-service / user-service → database），各跳带耗时。

## 步骤

1. 选型与部署后端：开发用 Jaeger all-in-one；生产用 Jaeger production 策略（Elasticsearch 存储）或 Grafana Tempo（对象存储 + Grafana 查询）。
2. 应用埋点：统一用 OpenTelemetry，配置 TracerProvider、资源（service.name）和 BatchSpanProcessor + Exporter。
3. 跨服务传播 context：在所有出站请求注入 traceparent/tracestate 头，下游自动续接。
4. 配置采样：生产建议 1%–10%，结合概率/限速/自适应（ParentBased）。
5. 关联日志：把 trace_id 写入日志，打通链路与日志。
6. 在 Jaeger/Tempo UI 查询慢请求、错误、服务依赖图并验证。

## 指令

- 先澄清目标、约束和必需输入；缺少必要权限/输入/成功标准时停下来询问。
- 应用埋点最佳实践并验证产物，给出可执行步骤与验证方法。
- 输出不能替代针对具体环境的验证、测试与专家评审。

## 示例

Jaeger 部署（Kubernetes Operator + production 实例）：

```bash
kubectl create namespace observability
kubectl create -f https://github.com/jaegertracing/jaeger-operator/releases/download/v1.51.0/jaeger-operator.yaml -n observability

kubectl apply -f - <<EOF
apiVersion: jaegertracing.io/v1
kind: Jaeger
metadata:
  name: jaeger
  namespace: observability
spec:
  strategy: production
  storage:
    type: elasticsearch
    options:
      es:
        server-urls: http://elasticsearch:9200
  ingress:
    enabled: true
EOF
```

Docker Compose 快速起步（关键端口：16686 UI、14268 Collector、14250 gRPC、9411 Zipkin）：

```yaml
services:
  jaeger:
    image: jaegertracing/all-in-one:latest
    ports:
      - "6831:6831/udp"
      - "16686:16686"  # UI
      - "14268:14268"  # Collector
      - "14250:14250"  # gRPC
      - "9411:9411"    # Zipkin
    environment:
      - COLLECTOR_ZIPKIN_HOST_PORT=:9411
```

Python（Flask）OpenTelemetry 埋点：

```python
from opentelemetry import trace
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.sdk.resources import SERVICE_NAME, Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.instrumentation.flask import FlaskInstrumentor
from flask import Flask

resource = Resource(attributes={SERVICE_NAME: "my-service"})
provider = TracerProvider(resource=resource)
provider.add_span_processor(BatchSpanProcessor(
    JaegerExporter(agent_host_name="jaeger", agent_port=6831)))
trace.set_tracer_provider(provider)

app = Flask(__name__)
FlaskInstrumentor().instrument_app(app)

@app.route('/api/users')
def get_users():
    tracer = trace.get_tracer(__name__)
    with tracer.start_as_current_span("get_users") as span:
        span.set_attribute("user.count", 100)
        return {"users": fetch_users_from_db()}
```

Node.js（Express）要点：用 NodeTracerProvider + JaegerExporter（endpoint http://jaeger:14268/api/traces），registerInstrumentations 注册 Http/Express，手动 span 用 try/finally 保证 span.end()。Go 要点：jaeger.WithCollectorEndpoint 构造 exporter，sdktrace.NewTracerProvider 设置 service.name，tracer.Start 配 defer span.End()，错误用 span.RecordError(err) 记录。

跨服务传播 context：

```python
from opentelemetry.propagate import inject
headers = {}
inject(headers)  # 注入 traceparent/tracestate
requests.get('http://downstream-service/api', headers=headers)
```

```javascript
const { propagation } = require('@opentelemetry/api');
const headers = {};
propagation.inject(context.active(), headers);
axios.get('http://downstream-service/api', { headers });
```

W3C 头格式：`traceparent: 00-<trace-id>-<span-id>-01`，`tracestate: congo=t61rcWkgMzE`。

采样配置：

```yaml
# 概率采样：1%
sampler: { type: probabilistic, param: 0.01 }
# 限速采样：每秒最多 100 条
sampler: { type: ratelimiting, param: 100 }
```

```python
# 自适应/确定性采样（按 trace ID）
from opentelemetry.sdk.trace.sampling import ParentBased, TraceIdRatioBased
sampler = ParentBased(root=TraceIdRatioBased(0.01))
```

Grafana Tempo（K8s ConfigMap 关键片段）：distributor 接收 jaeger（thrift_http/grpc）与 otlp（http/grpc），storage.trace.backend 用 s3（bucket: tempo-traces），server.http_listen_port 3200；Deployment 用镜像 grafana/tempo:latest，args `-config.file=/etc/tempo/tempo.yaml`。

链路分析查询（Jaeger）：找慢请求 `service=my-service` + `duration > 1s`；找错误 `service=my-service` + `error=true` + `tags.http.status_code >= 500`。Jaeger 自动生成服务依赖图（服务关系、请求率、错误率、平均延迟）。

链路与日志关联：

```python
import logging
from opentelemetry import trace
logger = logging.getLogger(__name__)

def process_request():
    span = trace.get_current_span()
    trace_id = span.get_span_context().trace_id
    logger.info("Processing request",
                extra={"trace_id": format(trace_id, '032x')})
```

## 注意事项

最佳实践：
1. 合理采样（生产 1%–10%）；
2. 加有意义的 tag（user_id、request_id）；
3. 在所有服务边界传播 context；
4. 在 Span 中记录异常；
5. 操作命名保持一致；
6. 监控追踪开销（CPU 影响 <1%）；
7. 为链路错误设告警；
8. 用 baggage 实现分布式上下文；
9. 关键里程碑用 span event 标记；
10. 文档化埋点规范。

排障：
- 无 trace：检查 collector endpoint、网络连通性、采样配置，并查应用日志；
- 延迟开销高：降低采样率、使用 batch span processor、检查 exporter 配置。

风险提示：源标记 risk=critical（生产可观测性链路改动需谨慎，避免高采样拖垮服务、避免泄露敏感 tag）。

## 互见

- prometheus-configuration（指标采集）
- grafana-dashboards（可视化）
- slo-implementation（延迟 SLO）

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可证）。
