---
name: systematic-debugging-strategies
title: 系统化调试策略方法论
description: 当排查 elusive bug、性能劣化、生产事故、崩溃栈/dump、分布式系统异常时使用；做法是按「复现-取证-假设-实验-定位-验证」科学闭环，配合二分(git bisect)、定向日志/断点、差分对比与 profiling，产出可复现步骤、根因结论与已验证修复。不适用于无可复现症状、纯功能开发或拿不到日志/trace/运行信号的场景。触发词：调试、复现、栈追踪、性能、生产事故、内存泄漏
domain: 研发/review
triggers: [调试, 复现, 栈追踪, stack trace, 性能问题, 生产事故, 内存泄漏, race condition, git bisect, 崩溃 dump, flaky 偶现 bug, profiling]
tags: [调试, 故障排查, 性能分析, 根因分析, 生产运维, 方法论]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [pdb / ipdb / breakpoint(), Chrome DevTools / debugger, VS Code Debugger (launch.json), Delve (dlv), git bisect, cProfile / pprof / Lighthouse, Sentry / Bugsnag, v8.writeHeapSnapshot]
requires: []
related: [systematic-debugger, bug-hunter, error-log-detective, gdb-debugging-cli]
combines_with: [performance-profiler, distributed-tracing, git-advanced-workflows]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 追查难缠的隐蔽 bug、偶现/flaky 问题。
- 排查性能劣化（慢查询、卡顿、内存增长）。
- 处理生产事故、分析崩溃 dump 或栈追踪。
- 调试分布式系统中的异常行为。

不该用（负边界）：
- 没有可复现问题，也没有可观测症状时——先收集症状再来。
- 任务是纯粹的新功能开发。
- 拿不到日志、trace 或任何运行期信号时（先打通可观测性）。

核心心态：不要假设「不可能是 X」「我没改过 Y」「在我机器上是好的」——逐一核实。一次只改一处，保留笔记，必要时用「橡皮鸭法」把问题讲出来。

## 步骤

遵循科学方法闭环：观察 → 假设 → 实验 → 分析 → 重复，直到定位根因。

1. 复现（Reproduce）：确认能否稳定复现（总是/有时/随机）、需要哪些前置条件、他人能否复现。构造最小可复现样例，删掉无关代码，记录精确步骤与环境。
2. 取证（Gather）：收集完整栈追踪、错误码、日志；记录 OS / 运行时 / 依赖版本与环境变量；查 git 历史、部署时间线、配置变更；确认影响范围（全量 vs 特定用户/浏览器/环境）。
3. 假设（Hypothesize）：问「什么变了」「好坏两边有何不同」「可能在哪一层失败（输入校验/业务逻辑/数据层/外部服务）」。
4. 实验定位（Test）：二分缩小范围；加定向日志/断点追踪状态；隔离组件、mock 依赖；用差分表对比 working vs broken。
5. 修复与验证（Verify）：定位根因而非症状；改完后用第 1 步的复现路径验证确实修复；记录结论。

## 指令

- 回归定位用 git bisect 二分提交：

```bash
git bisect start
git bisect bad                 # 当前是坏的
git bisect good v1.0.0         # v1.0.0 是好的
# 在自动切到的中间提交上测试，然后：
git bisect good   # 正常
git bisect bad    # 仍坏
# 重复直到锁定，结束后：
git bisect reset
```

- Python 打断点与 post-mortem：

```python
breakpoint()                   # Python 3.7+，优于 pdb.set_trace()
try:
    risky_operation()
except Exception:
    import pdb; pdb.post_mortem()   # 在异常现场调试
```

- Python 性能 profiling：

```python
import cProfile, pstats
cProfile.run('slow_function()', 'profile_stats')
stats = pstats.Stats('profile_stats')
stats.sort_stats('cumulative')
stats.print_stats(10)          # 最慢的前 10
```

- JS/TS 控制台技巧与计时：`console.table(arr)`、`console.trace()`、`console.assert(v>0,'must be positive')`、`console.time('op')…console.timeEnd('op')`；条件断点用 `if (cond) debugger;`。
- Node 内存排查：当 `process.memoryUsage().heapUsed` 超阈值时 `require('v8').writeHeapSnapshot()`，对比前后两份 heap 快照定位泄漏。
- Go：`dlv debug main.go` 调试；`debug.PrintStack()` 打栈；引入 `net/http/pprof` 访问 `/debug/pprof/` 做内存/CPU profiling。

## 示例

差分调试——把可工作与故障两侧逐项列表对比，从差异推假设：

| 维度 | Working | Broken |
|------|---------|--------|
| 环境 | Development | Production |
| Node 版本 | 18.16.0 | 18.15.0 |
| 数据量 | 空库 | 100 万条 |
| 用户 | Admin | 普通用户 |
| 浏览器 | Chrome | Safari |
| 时间 | 白天 | 午夜后 |

假设：与时间相关？优先检查时区处理。

偶现 bug：加密集日志（计时、状态迁移、外部交互），重点查竞态（共享状态并发访问、异步乱序、缺同步）与定时依赖（setTimeout、Promise 顺序），并做压力/变速复跑。

## 注意事项

- 卡住时优先核对清单：拼写/变量名笔误、大小写敏感、null/undefined、数组越界 off-by-one、异步竞态、作用域(闭包/提升)、类型不匹配、缺依赖、环境变量、路径(绝对 vs 相对)、缓存与陈旧数据。
- 性能问题先 profile 再优化，别盲改；常见元凶：N+1 查询、无谓重渲染、大数据处理、同步 I/O。
- 生产环境只取证不乱改：靠 Sentry/Bugsnag、日志、监控收集证据；用脱敏生产数据本地复现；通过 feature flag 与 staging 验证修复。
- 常见错误：一次改多处、不读完整栈、默认问题很复杂、把调试日志带上线、该用调试器却只 console.log、过早放弃、不验证修复。

## 互见

- 源仓库 `resources/implementation-playbook.md`（详细模式、检查单与各语言代码示例）。
- 可配合本大典中的性能分析、生产运维/可观测性相关条目联用。

---

采编自 sickn33/antigravity-awesome-skills（MIT License）。
