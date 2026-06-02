---
name: devops-troubleshooter
title: DevOps 事故响应与可观测排障
description: 当线上服务故障、性能劣化或告警触发需快速定位根因时使用；按「先取证再假设」流程，用日志/指标/链路追踪与 kubectl、dig、tcpdump 等定位问题、止血恢复并产出复盘与监控加固；不适用于纯代码业务逻辑 bug、单机本地开发调试或非运维域问题；触发词：事故响应、OOMKilled、504 超时、根因分析、可观测、链路追踪。
domain: 研发/observability
triggers: [线上事故响应/止血, Pod 频繁重启或 OOMKilled, 504/502 网关超时排查, 微服务链路性能瓶颈定位, DNS/服务发现解析异常, CI/CD 流水线失败或回滚, 数据库死锁/连接池耗尽, 做事故复盘与监控告警加固]
tags: [DevOps, SRE, 事故响应, 可观测性, Kubernetes, 排障, 根因分析, 链路追踪]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [kubectl, Prometheus/Grafana, OpenTelemetry/Jaeger, ELK/Loki, dig/nslookup, tcpdump, 云厂商日志(CloudWatch/Cloud Logging)]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：线上服务宕机/抖动、性能劣化、告警触发，需要在分布式系统中快速止血、定位根因并防复发。典型场景——Pod 频繁重启或 OOMKilled、间歇性 504/502 网关超时、微服务链路性能瓶颈、DNS/服务发现失败、数据库死锁或连接池耗尽、CI/CD 流水线失败与 GitOps 回滚、证书/认证授权故障。

不该用（负边界）：
- 纯业务代码逻辑 bug、单元测试或本地单机开发调试——属应用开发域，不在此。
- 非运维域问题（如纯前端样式、数据建模需求）。
- 缺少日志/指标/链路访问权限或环境信息时——先停下索要输入，不要凭空臆测。

## 步骤

遵循「先全面取证，再形成并验证假设」的纪律，优先快速恢复同时兼顾系统完整与安全：

1. 评估影响：按影响面与范围确定紧急程度（用户面/数据面/范围）。
2. 收集数据：汇总日志、指标、链路追踪与系统状态（current state），做多服务日志关联。
3. 形成并逐一验证假设：以最小系统扰动逐条排除，考虑级联/雪崩失败场景。
4. 立即止血：先恢复服务（扩容、回滚、重启、摘流），同时规划永久修复。
5. 充分记录：为事后复盘留存证据与时间线。
6. 加监控告警：补齐缺失的监控/告警，使同类问题可主动发现。
7. 规划长期改进：架构层防复发。
8. 沉淀知识：runbook、文档、团队培训。
9. 无指责复盘（blameless postmortem）：识别系统性改进项。

## 指令

- 先澄清目标、约束与必需输入，再动手。
- 先取证（日志/指标/链路）再形成假设，禁止跳步。
- 修复以最小扰动落地，兼顾长期稳定性。
- 修复后补充主动监控与告警以防复发。
- 输出不能替代环境内的验证、测试与专家评审；缺权限/安全边界/成功判据时停下询问。

常用排障命令与切入点：
- Kubernetes：`kubectl get/describe pod`、`kubectl logs --previous`、`kubectl top pod`、事件与就绪/存活探针；排查 Init/Sidecar 容器、资源限制、CNI 网络、PV 存储。
- 网络/DNS：`dig`、`nslookup` 查解析与传播；`tcpdump`、Wireshark、eBPF 工具做抓包与延迟分析；核对网络策略与安全组、负载均衡（ALB/NLB）。
- 可观测：Prometheus/Grafana 看指标，ELK/Loki 查日志，Jaeger/Zipkin/OpenTelemetry 看分布式链路并做跨服务关联。
- 性能/资源：CPU/内存/磁盘 I/O/网络利用率分析；定位内存泄漏、CPU 热点、GC、OOMKilled、CPU 限流。
- 数据库：查询执行计划与索引、连接池耗尽、主从复制延迟、死锁。
- CI/CD：构建失败/依赖/测试，ArgoCD/Flux GitOps 问题与回滚流程。
- 云平台：AWS CloudWatch、Azure Monitor、GCP Cloud Logging 各自的日志与 CLI。

## 示例

- 排查 K8s Pod 高内存导致频繁 OOMKilled 与重启的根因。
- 分析分布式链路追踪数据，定位微服务架构中的性能瓶颈。
- 排查生产负载均衡间歇性 504 网关超时。
- 调查 CI/CD 流水线失败并实现自动化排障/回滚。
- 数据库死锁导致应用超时的根因分析。
- K8s 集群中影响服务发现的 DNS 解析问题排查。

## 注意事项

- 先取证后假设：未掌握日志/指标/链路前不下结论，避免误导性操作。
- 最小扰动验证假设，警惕级联失败——一个修复动作可能引发新的雪崩。
- 止血与根因分开推进：先恢复服务，再做永久修复，二者都要记录。
- 复盘对事不对人（blameless），目标是系统性改进而非追责。
- 任何修复都需在目标环境内实测验证，本技能产出不替代环境特定的测试。

## 互见

- 性能剖析与压测类技能（应用 profiling、容量规划）。
- Kubernetes 部署与 GitOps 运维类技能。
- 监控告警体系搭建（Prometheus/OpenTelemetry）类技能。

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
