---
name: performance-profiler
title: 应用性能剖析（Node/Python/Go）
description: 当排查慢接口、追查内存泄漏、做发布前性能预算或负载测试时使用；先建基线（P50/P95/P99、RPS、错误率、内存），用 flamegraph/py-spy/pprof 定位 CPU/内存/IO/数据库瓶颈并产出前后对比报告；不适用于功能正确性缺陷或纯前端渲染调试；触发词：性能剖析、慢接口、内存泄漏、flamegraph、负载测试、N+1
domain: 研发/observability
triggers: [性能剖析, 慢接口排查, 内存泄漏, flamegraph 火焰图, 负载测试 k6, N+1 查询, bundle 体积分析, P99 延迟超标, CPU 瓶颈, py-spy / pprof]
tags: [性能, 可观测性, profiling, Node.js, Python, Go, 数据库优化, 负载测试, 内存泄漏, 研发]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [py-spy, clinic.js, go tool pprof, k6, EXPLAIN ANALYZE, Chrome DevTools, webpack/next bundle-analyzer, performance_profiler.py]
requires: []
related: []
combines_with: []
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

适用：

- 应用变慢但不知瓶颈在哪（CPU / 内存 / IO / DB 任一）。
- 发布前 P99 延迟超过 SLA，需要做性能预算。
- 内存随运行时间持续增长，疑似泄漏。
- 加依赖后 bundle 体积变大，需定位。
- 准备应对流量高峰，上线前做负载测试。
- 数据库查询耗时 >100ms，或怀疑 N+1。

不该用（负边界）：

- 功能正确性缺陷——先修对，再谈快（先正确后性能）。
- 纯前端渲染/布局调试——这里聚焦后端与构建产物。
- 仅凭主观「我觉得这里慢」就动手——本技能要求先测后改。

## 步骤

铁律：先测量，再优化。任何改动前先建立基线，记录 P50/P95/P99 延迟、RPS、错误率、内存占用，并保存 flamegraph 截图作为证据。流程固定为：剖析 → 确认瓶颈 → 修复 → 再测量 → 验证改善。一次只改一个变量以确认因果。用接近生产的数据量剖析（dev 里 10 行、prod 里百万行，瓶颈完全不同）。

1. 快速体检（仓库级风险指标，仅依赖标准库）：

```bash
python3 scripts/performance_profiler.py /path/to/project
python3 scripts/performance_profiler.py /path/to/project --json          # CI 集成
python3 scripts/performance_profiler.py /path/to/project --large-file-threshold-kb 256
```

输出大文件、依赖数量（Node/Python/Go）、bundle 体积指标，用于快速锁定可疑区域。

2. 选对工具做 CPU / 内存剖析（见下「指令」）。
3. 数据库层先查慢查询与 N+1。
4. 用 k6 设性能预算并跑负载，验证修复。
5. 用「前后对比模板」记录到 PR。

## 指令

### Node.js

```bash
npm install -g clinic
clinic flame -- node dist/server.js          # CPU 火焰图
clinic heapprofiler -- node dist/server.js    # 堆剖析
clinic bubbles -- node dist/server.js         # 事件循环阻塞
autocannon -c 50 -d 30 http://localhost:3000/api/tasks &   # 边压边采
# 内置：node --prof dist/server.js → node --prof-process isolate-*.log | head -100
# 检测器：blocked-at（阻塞>100ms 告警）、v8.writeHeapSnapshot 导出堆快照在 Chrome DevTools 对比
```

内存泄漏判定：在负载下间隔取多次堆快照对比；若 `--expose-gc` 触发 GC 后 heapUsed 仍比基线增长 >10%，视为疑似泄漏。

### Python

```bash
pip install py-spy
py-spy top --pid $(pgrep -f "uvicorn")                              # 实时，无需改代码
py-spy record -o flamegraph.svg --pid $(pgrep -f "uvicorn") --duration 30
# 函数级：cProfile + pstats.sort_stats('cumulative').print_stats(20)
# 逐行内存：python -m memory_profiler script.py（@profile 装饰目标函数）
```

### Go

```go
import _ "net/http/pprof"   // 暴露 /debug/pprof/，go func 起 :6060
```

```bash
go tool pprof -http=:8080 http://localhost:6060/debug/pprof/profile?seconds=30   # CPU
go tool pprof -http=:8080 http://localhost:6060/debug/pprof/heap                 # 内存
curl http://localhost:6060/debug/pprof/goroutine?debug=1                          # goroutine 泄漏
```

### 数据库

```sql
-- PostgreSQL：开启 pg_stat_statements，按 mean_exec_time 取 Top20 慢查询
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
-- 真实计时务必带 BUFFERS
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) SELECT ...;
-- 关注：大表 Seq Scan→缺索引；高行数 Nested Loop→N+1 改 JOIN；Sort 能否用索引消除
```

N+1 检测：Drizzle `logger:true` 或查询计数中间件，在测试里断言 `queryCount === 1`；Django 用 `nplusone` 中间件 `NPLUSONE_RAISE=True`。修复方向：循环内逐条查 → 改单条 JOIN。

### Bundle

```bash
ANALYZE=true pnpm build                         # @next/bundle-analyzer treemap
pnpm dedupe --check                             # 重复包
npx source-map-explorer .next/static/chunks/*.js
```

替换重磅依赖：`moment(67kB)→dayjs(7kB)`；`import _ from 'lodash'(71kB)→import debounce from 'lodash/debounce'(2kB)`；重组件改 `dynamic(() => import(...))` 动态加载。

### 负载测试（k6）

```javascript
export const options = {
  stages: [ /* 30s→10VU, 1m→50, 2m@50, 30s→100 尖峰, 1m→50, 30s→0 */ ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    errors: ['rate<0.01'],
  },
}
```

```bash
k6 run tests/load/api-load-test.js --env BASE_URL=https://staging.myapp.com
k6 run --out influxdb=http://localhost:8086/k6 tests/load/api-load-test.js
```

## 示例

优化快速清单（先查这些）：

- 数据库：WHERE/ORDER BY 列缺索引；N+1；`SELECT *` 取多余列；无 LIMIT 的无界查询；每请求新建连接（缺连接池）。
- Node.js：热路径里同步 IO（`readFileSync`）；热循环里大对象 `JSON.parse/stringify`；缺缓存；响应未压缩；依赖在请求处理器里 require（应提到模块级）。
- API：列表接口无分页；无 `Cache-Control`；可并行的串行 await（应 `Promise.all`）；循环里取关联数据而非 JOIN。

前后对比模板（写进 PR）：

```markdown
## 性能优化：[修了什么]   日期 / 工程师 / 工单
### 问题 / 根因（剖析器揭示了什么）
### 基线（Before）  P50/P95/P99 | RPS@50VU | 错误率 | DB 查询数/请求 + 火焰图链接
### 修复  [代码 diff 或描述]
### After  表格列出 Before|After|Delta，例：P95 1240ms→120ms(-90%)，DB 23→1(-96%)
### 验证  k6 负载测试输出链接
```

## 注意事项

- 不测就优化 = 优化错地方。
- 别在 dev 测：用接近生产数据量的 staging。
- 别只看 P50：P50 漂亮而 P99 灾难是常态，务必盯 P99。
- 不要过早优化：先保证正确性。
- 改完必复测：确认修复真的有效。
- 不要直接压生产；缓存要「激进缓存、精确失效」；关键路径接入 Datadog/Prometheus 持续监控；在 CI 里用 k6 阈值（如 `p(95)<200ms`）固化性能预算。

## 互见

- 源参考配方文件：`references/profiling-recipes.md`（含各语言完整命令与代码）。
- 体检脚本：`scripts/performance_profiler.py`。
- 可与数据库优化、可观测性/监控、负载测试相关技能联动。

---

采编自 alirezarezvani/claude-skills（MIT 许可证）。
