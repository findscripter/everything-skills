---
name: cloud-network-engineer
title: 云网络工程
description: 当在 AWS/Azure/GCP 或多云上设计、落地与排障云网络（VPC/子网/路由、负载均衡、DNS、SSL/TLS、零信任、服务网格、CDN 与性能优化）时使用；产出网络架构、连通性与安全策略、可观测接入及排障路径；不适用于纯应用业务逻辑、传统机房物理布线或非网络域问题；触发词：云网络、VPC、负载均衡、DNS、mTLS、零信任、CDN。
domain: 研发/devops
triggers: [设计多云/混合云网络架构, 规划 VPC 子网与路由/对等/Transit Gateway, 配置云负载均衡与全局流量分发, DNS 解析/故障转移/geo-routing 方案, SSL/TLS 终止与证书自动化(mTLS), 落地零信任网络分段, 排查云网络连通性/延迟/丢包, CDN 与 HTTP/2/HTTP/3 性能优化]
tags: [云网络, VPC, 负载均衡, DNS, SSL/TLS, 零信任, mTLS, CDN, 服务网格, 多云, 可观测性]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Bash, Write, dig/nslookup, openssl, tcpdump/mtr/iperf3, Terraform]
requires: []
related: [hybrid-cloud-networking, service-mesh-architect, istio-traffic-management, mtls-zero-trust-config]
combines_with: [kubernetes-architect, cloud-misconfig-auditor, terraform-specialist]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
# 云网络工程

## 何时使用

当需要在云上**端到端规划、落地与排障网络**时使用——覆盖 AWS/Azure/GCP 单云与多云/混合云，重点是网络架构决策、连通性、安全与性能，而非某条业务代码。典型场景：

- 网络架构设计：VPC/虚拟网络、子网、路由表、NAT/Internet 网关、VPC 对等、Transit Gateway；跨云互联与混合架构。
- 负载均衡与流量管理：云 LB（ALB/NLB、Application Gateway、Cloud LB）、软件 LB（Nginx/HAProxy/Envoy/Traefik）、L4/L7、全局流量分发与故障转移、API 网关。
- DNS 与服务发现：Route 53/Azure DNS/Cloud DNS、health check、geo-routing、DNSSEC/DoH/DoT、split-horizon、anycast。
- SSL/TLS 与 PKI：证书自动化（Let's Encrypt/内部 CA）、协议与加密套件优化、证书生命周期与到期告警、mTLS、证书链与信任库。
- 网络安全：零信任分段、安全组/NACL/WAF、VPN（站点到站点/客户端/WireGuard/IPSec/SD-WAN）、DDoS 防护与限流。
- 服务网格与容器网络：Istio/Linkerd、CNI（Calico/Cilium/Flannel）、Ingress、东西向流量、网络可观测。
- 性能优化：CDN（CloudFront/Cloudflare/Azure CDN）、压缩与缓存头、HTTP/2、HTTP/3(QUIC)、容量规划。
- 网络排障：分层逐跳定位连通性/延迟/丢包，结合流日志与抓包。

**不该用的边界：**

- 任务与网络无关，或属其他领域/工具范畴。
- 纯应用业务逻辑、前端样式或数据建模问题。
- 传统数据中心物理布线/硬件交换机现场运维。
- 只是要写**某条** Istio 流量 YAML（用 `istio-traffic-management`）、或整套服务网格架构（用 `service-mesh-architect`）、或纯 IaC 模块（用 `terraform-specialist`）。
- 缺少必需输入（云账号/区域、网段规划、合规与延迟预算、成功标准）时，先停下澄清，不要臆造。

## 步骤

1. **分析需求**：明确可扩展性、安全与性能目标；盘点现有拓扑、网段、合规（GDPR/HIPAA/PCI-DSS）与延迟预算。
2. **设计架构**：定 VPC/子网划分、路由与互联（对等/Transit Gateway/Interconnect）、入口/出口路径，按可用区做冗余与故障转移。
3. **落地连通性**：配置网关、LB、DNS 与证书，逐项配置后立即验证。
4. **配置安全控制**：纵深防御——安全组/NACL/WAF 分层，零信任最小授权与网络分段，mTLS 起步用 permissive 再收紧。
5. **接入监控告警**：VPC 流日志、LB/DNS 健康、RUM/合成监控与链路追踪，建立基线。
6. **优化性能**：CDN 缓存策略、HTTP/2/HTTP/3、压缩与缓存头、带宽与容量规划。
7. **规划灾备**：多路径冗余、备份连接/VPN、跨区域与故障转移演练。
8. **多视角测试**：从客户端到权威服务器、从多个区域/网络位置验证 DNS、TLS、连通与性能。

## 指令

- 先澄清目标、约束与必需输入，再动手；产出给出可执行步骤与验证命令。
- **系统性分层测试**连通性：物理/数据链路/网络/传输/应用逐层验证。
- **完整核验 DNS 解析链**：从客户端递归到权威服务器，确认传播与一致性。
- **校验 SSL/TLS 证书与信任链**：链完整、有效期、SAN、协议与套件。
- **安全优先**：零信任、最小授权、分段；安全组/NACL/WAF 分层；mTLS 渐进收紧避免断流。
- **冗余前置**：关键路径在故障前就设计好故障转移，不要事后补。
- **重视自动化与 IaC**：网络配置用 Terraform/CloudFormation/Ansible 管理，policy-as-code 做合规与漂移检测。
- **可观测先行**：流日志、指标、追踪齐备，主动发现而非被动救火。
- 用合适的工具分析流量瓶颈，记录拓扑与技术规格（含可视化图）。

## 示例

**TLS 证书与链校验（应用层验证）：**

```bash
openssl s_client -connect api.example.com:443 -servername api.example.com </dev/null 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates   # 主体/签发者/有效期
```

**DNS 解析链与传播核验：**

```bash
dig +trace api.example.com           # 从根逐级追到权威服务器
dig @8.8.8.8 api.example.com A        # 跨解析器比对，确认传播一致
```

**连通性、路径与吞吐排障：**

```bash
mtr -rwzbc 100 api.example.com        # 逐跳丢包与延迟
tcpdump -ni eth0 'tcp port 443'       # 抓包定位握手/重传
iperf3 -c <host> -p 5201              # 端到端吞吐基线
```

**典型交互：**
- 设计带零信任互联的安全多云网络架构。
- 排查 Kubernetes 服务网格中的间歇性连通问题。
- 优化全球应用的 CDN 配置以降低延迟。
- 配置 SSL/TLS 终止与证书自动化续期。
- 实现带灾备故障转移的全局负载均衡。

## 注意事项

- 仅在任务明确落入上述范围时使用；产出不能替代环境相关的验证、测试或专家评审。
- 先取证后假设：未掌握流日志/指标/抓包前不下结论，避免误导性变更。
- mTLS/STRICT 或安全组收紧前，务必确认探针、旧服务、外部 LB 等调用方已纳管或显式放行，否则会断流。
- DNS 变更受 TTL 与缓存影响，传播有延迟；切换权威/记录前评估回滚窗口。
- 跨区域/跨云互联、信任域与根 CA 是高成本前置条件，回滚代价高，先在非生产演练。
- 合规（GDPR/HIPAA/PCI-DSS）对网络隔离与加密有硬性要求，设计阶段就要纳入。
- 缺少必需输入、权限、安全边界或成功判据时，停下询问澄清。

## 互见

- related：`service-mesh-architect` —— 服务网格层的整体架构（本技能管云网络全局，它聚焦网格）。
- related：`istio-traffic-management` —— 网格内单条流量/安全 YAML 的聚焦写法。
- related：`kubernetes-architect` —— 容器网络所在的 K8s 平台与集群架构。
- related：`distributed-tracing` —— 网络可观测中的链路追踪落地。
- related：`k8s-security-policies` —— 与零信任互补的集群网络策略。
- related：`devops-troubleshooter` —— 网络故障并入更广的线上事故排障流程。
- related：`multi-cloud-architecture` —— 跨云网络承载的多云整体架构。
- combines_with：`terraform-specialist` —— 用 IaC 把 VPC/LB/DNS/证书配置代码化与版本化。
- combines_with：`prometheus-configuration` —— 配置网络指标采集与告警。
- combines_with：`observability-strategy-designer` —— 设计网络的指标/日志/追踪整体策略。
- combines_with：`gitops-argocd-flux` —— 以 GitOps 编排网络/网格配置发布与回滚。

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
