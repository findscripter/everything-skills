---
name: latency-critical-systems
title: 低延迟关键系统设计
description: 当设计/优化实时仪表盘、行情数据、流式 Agent、执行网关、队列、缓存等对新鲜度与 p95 延迟敏感的系统时使用；做出热路径拆解、分位延迟指标拆分、按优先级的优化清单与上线护栏方案；不适用于授权实盘下单/金融建议、纯吞吐批处理、无延迟要求的 CRUD；触发词：低延迟、热路径、p95、p99、实时、新鲜度、流式、行情、执行网关、背压
domain: 研发/architecture
triggers: [低延迟, 热路径, p95, p99, 实时, 新鲜度, 流式, 行情数据, 执行网关, 背压, queue depth, cache hit rate]
tags: [latency, performance, realtime, streaming, architecture, caching, backpressure]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Write, Edit, Bash, Grep, Glob]
requires: []
related: [performance-profiler, websocket-realtime-engineer, content-hash-cache-pattern, microservices-patterns]
combines_with: [observability-strategy-designer, slo-sli-implementation, data-throughput-accelerator]
license: MIT
source: affaan-m/everything-claude-code
source_license: MIT
---
## 何时使用

当用户关注实时行为、热路径、流式新鲜度或执行速度时使用。典型场景：实时仪表盘、行情/市场数据、流式 Agent、执行网关、消息队列、缓存层、类 HFT 基础设施——凡是「新鲜度」与「p95 延迟」要紧的地方。

本技能聚焦工程实现，**不该用**于：
- **授权实盘交易或给出金融建议**——只做工程优化，不做交易决策。
- **纯吞吐离线批处理 / 无延迟要求的常规 CRUD**——这类用普通后端方案即可，无需热路径治理。
- **未经批准就跑实盘下单、破坏性迁移或影响客户的部署**——这些要走显式审批闸门（见护栏）。

## 步骤 / 指令

```
1. 拆分指标（别把一切塞进"快"一个词）
   - 延迟分位：p50 / p95 / p99（不要只看均值，长尾才是问题）。
   - 吞吐量 throughput；新鲜度滞后 freshness age；队列深度 queue depth。
   - 缓存命中率 cache hit rate；上游 provider/API 响应时间。
   - 浏览器渲染时间；高负载下的正确性；失败与重试行为。

2. 画出热路径（从事件到用户可见状态，逐段独立测量）
   source event -> provider API -> ingest worker -> queue -> cache
   -> edge route -> client stream -> browser render -> user-visible state

3. 按固定优先级优化（从消除往返开始，流式放最后）
   ① 去掉不必要的网络往返（round trip）。
   ② 缓存稳定读，并带新鲜度元数据（freshness metadata）。
   ③ 合批小调用与小写入（batch）。
   ④ 把计算移到离数据或离用户更近处。
   ⑤ 拆分热路径与冷路径。
   ⑥ 在队列无界增长前施加背压（backpressure）。
   ⑦ 仅当流式确实改善新鲜度/体验时才用流式。
   ⑧ 加金丝雀探针：检测过期数据、降级的 provider、坏缓存状态。

4. 用实测回读验证（有已部署面就别靠估算）
   - HTTP 时延与响应头；provider 新鲜度时间戳。
   - 队列/作业状态；边缘/缓存状态。
   - 浏览器侧验证真实 UI 新鲜度；重试与降级模式的日志。
   - 行情/执行相邻路径：另需核验 orderbook age、VWAP 假设、
     provider 状态、kill-switch 行为，之后才能宣称"路径就绪"。
```

## 示例

热路径分段计时（用响应头回读真实时延，而非客户端标签）：
```bash
# 逐跳测 HTTP 时延，关注 TTFB 与服务端处理时间
curl -s -o /dev/null -w \
  'dns:%{time_namelookup} conn:%{time_connect} ttfb:%{time_starttfb} total:%{time_total}\n' \
  https://edge.example.com/stream/quotes

# 回读上游新鲜度与缓存状态头
curl -sI https://edge.example.com/stream/quotes | \
  grep -iE 'x-cache|age|x-data-ts|x-provider-status'
```

新鲜度与队列金丝雀（暴露指标供告警，而非埋在快缓存命中后面）：
```text
freshness_age = now - x-data-ts        # 超阈值 => 数据过期告警
queue_depth   监控并在到达水位前触发背压（拒绝/降采样/降级）
cache_hit 命中但 freshness_age 超标 => 必须暴露"陈旧"状态，不可伪装新鲜
```

## 注意事项

- 不要靠**砍掉必要校验**来换延迟。
- 不要把**陈旧数据藏在快缓存命中**背后伪装成新鲜。
- 没有实测，不要凭客户端标签就宣称"毫秒级"。
- 未经显式审批闸门，不跑实盘下单、破坏性迁移或影响客户的部署。
- 日志与基准产物里**不得**出现密钥和私有载荷。
- 优化顺序是有意为之：先消除往返再谈缓存，流式排最后——流式常增复杂度却未必提新鲜度。

## 互见

- requires：无。
- related：`performance-profiler`（先定位热点再按本清单优化）；`k6-load-testing`（高负载下回归 p95/p99 与背压行为）；`observability-strategy-designer`（把分位延迟、新鲜度、队列深度落成可告警指标）；`bullmq-job-queue`（队列深度与背压的具体实现参考）。
- combines_with：无。

---

本条采编自 affaan-m/everything-claude-code（MIT）。
