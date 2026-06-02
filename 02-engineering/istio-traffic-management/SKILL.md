---
name: istio-traffic-management
title: Istio 流量治理
description: 当在 Istio 服务网格中配置服务间路由、灰度/蓝绿、熔断重试、流量镜像或故障注入时使用；产出 VirtualService/DestinationRule/Gateway 等 YAML 与 istioctl 验证命令；不适用于非 Istio 网格（如 Linkerd/纯 Ingress-Nginx）或应用层业务逻辑问题；触发词：istio、virtualservice、destinationrule、canary、熔断、流量镜像
domain: 研发/devops
triggers: [istio, virtualservice, destinationrule, 灰度发布, 金丝雀, canary, 蓝绿, 熔断, circuit breaker, 重试 retry, 流量镜像 mirror, 故障注入, ingress gateway, 服务网格路由, istioctl]
tags: [istio, service-mesh, kubernetes, traffic-management, canary, circuit-breaker, devops]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [kubectl, istioctl, Kiali, Jaeger]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用于在 Istio 服务网格中做流量治理：
- 配置服务间路由（按 Header、URI、权重分流）。
- 灰度（金丝雀）/蓝绿发布，按百分比逐步放量。
- 熔断、连接池限流、异常点驱逐（outlierDetection）。
- 超时与重试策略。
- 流量镜像（影子流量）用于线上验证。
- 故障注入（延迟/中止）做混沌工程。
- 配置 Ingress/Egress Gateway 暴露入口。

不该用：
- 任务与 Istio 流量治理无关。
- 网格非 Istio（如 Linkerd、Consul、纯 Ingress-Nginx）——资源 API 不通用。
- 属于应用自身业务逻辑、镜像构建、CI/CD 流水线等网格外问题。
- 缺少集群访问权限、目标 host/subset 标签、成功标准等必要输入时，先停下来澄清。

## 步骤

1. 明确目标、约束与输入：要分流的 host、版本标签（如 `version: v1/v2`）、放量比例、超时/重试预期。
2. 用 `DestinationRule` 的 `subsets` 把服务按 label 划分版本（路由的前提）。
3. 用 `VirtualService` 定义路由规则（match + route + weight）。
4. 按需在 `DestinationRule.trafficPolicy` 叠加连接池、熔断、负载均衡策略。
5. 应用前先 `istioctl analyze` 静态校验，再 `kubectl apply`。
6. 用 `istioctl proxy-config routes/endpoints` 确认 Envoy 实际生效；用 Kiali/Jaeger 观测拓扑与调用链。
7. 灰度从小流量起步，逐步放量；异常即回滚（调权重或撤下 VirtualService）。

流量路径：`Client → Gateway → VirtualService(路由) → DestinationRule(策略) → Service(pods)`。

核心资源：VirtualService（基于 host 路由）、DestinationRule（路由后策略）、Gateway（集群边缘出入口）、ServiceEntry（接入网格外部服务）。

## 指令

```bash
# 应用前静态校验（强烈建议）
istioctl analyze

# 查看 Envoy 实际生效的路由
istioctl proxy-config routes deploy/my-app -o json

# 检查端点发现
istioctl proxy-config endpoints deploy/my-app

# 打开 debug 日志排查流量
istioctl proxy-config log deploy/my-app --level debug
```

## 示例

基础路由（按 end-user Header 把 jason 导向 v2，其余 v1）：

```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: reviews-route
  namespace: bookinfo
spec:
  hosts:
    - reviews
  http:
    - match:
        - headers:
            end-user:
              exact: jason
      route:
        - destination: { host: reviews, subset: v2 }
    - route:
        - destination: { host: reviews, subset: v1 }
---
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: reviews-destination
  namespace: bookinfo
spec:
  host: reviews
  subsets:
    - { name: v1, labels: { version: v1 } }
    - { name: v2, labels: { version: v2 } }
```

金丝雀发布（stable 90% / canary 10%）：

```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata: { name: my-service-canary }
spec:
  hosts: [ my-service ]
  http:
    - route:
        - destination: { host: my-service, subset: stable }
          weight: 90
        - destination: { host: my-service, subset: canary }
          weight: 10
```

熔断 + 异常点驱逐（DestinationRule.trafficPolicy）：

```yaml
trafficPolicy:
  connectionPool:
    tcp: { maxConnections: 100 }
    http:
      http1MaxPendingRequests: 100
      http2MaxRequests: 1000
      maxRequestsPerConnection: 10
      maxRetries: 3
  outlierDetection:
    consecutive5xxErrors: 5
    interval: 30s
    baseEjectionTime: 30s
    maxEjectionPercent: 50
    minHealthPercent: 30
```

重试与超时（VirtualService.http）：

```yaml
http:
  - route:
      - destination: { host: ratings }
    timeout: 10s
    retries:
      attempts: 3
      perTryTimeout: 3s
      retryOn: connect-failure,refused-stream,unavailable,cancelled,retriable-4xx,503
      retryRemoteLocalities: true
```

流量镜像（把 v1 的请求 100% 影子复制到 v2，不影响主响应）：

```yaml
http:
  - route:
      - destination: { host: my-service, subset: v1 }
    mirror: { host: my-service, subset: v2 }
    mirrorPercentage: { value: 100.0 }
```

故障注入（10% 延迟 5s，5% 返回 503）：

```yaml
http:
  - fault:
      delay: { percentage: { value: 10 }, fixedDelay: 5s }
      abort: { percentage: { value: 5 }, httpStatus: 503 }
    route:
      - destination: { host: ratings }
```

Ingress Gateway + HTTPS（按 URI 前缀路由到后端）：

```yaml
apiVersion: networking.istio.io/v1beta1
kind: Gateway
metadata: { name: my-gateway }
spec:
  selector: { istio: ingressgateway }
  servers:
    - port: { number: 443, name: https, protocol: HTTPS }
      tls: { mode: SIMPLE, credentialName: my-tls-secret }
      hosts: [ "*.example.com" ]
---
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata: { name: my-vs }
spec:
  hosts: [ "api.example.com" ]
  gateways: [ my-gateway ]
  http:
    - match: [ { uri: { prefix: /api/v1 } } ]
      route:
        - destination: { host: api-service, port: { number: 8080 } }
```

负载均衡策略（`loadBalancer.simple` 可选 ROUND_ROBIN/LEAST_CONN/RANDOM/PASSTHROUGH；会话保持用 `consistentHash`）：

```yaml
trafficPolicy:
  loadBalancer:
    consistentHash:
      httpHeaderName: x-user-id   # 也可 httpCookie / useSourceIp / httpQueryParameterName
```

## 注意事项

- 从简到繁，逐步叠加复杂度；务必用 subset 明确划分版本。
- 始终设置合理 timeout；启用重试但要有退避与上限——过度重试会引发级联故障。
- 别忽略 outlierDetection，熔断要打开。
- 镜像只镜像到测试环境，不要镜像到生产（镜像目标承接的是真实流量副本）。
- 上线先小比例金丝雀验证，再逐步放量。
- DestinationRule 的 subset 必须先于 VirtualService 引用存在，否则路由失败。
- 输出不能替代针对具体环境的验证、测试与专家评审；应用前先 `istioctl analyze`。

## 互见

- Istio 官方流量治理：https://istio.io/latest/docs/concepts/traffic-management/
- VirtualService 参考：https://istio.io/latest/docs/reference/config/networking/virtual-service/
- DestinationRule 参考：https://istio.io/latest/docs/reference/config/networking/destination-rule/
- 可观测性配套：Kiali（网格拓扑）、Jaeger（分布式追踪）。

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
