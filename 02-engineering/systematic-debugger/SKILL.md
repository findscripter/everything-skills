---
name: systematic-debugger
title: 系统化调试与根因分析
description: 当排查 bug、性能问题、崩溃或线上异常时使用；用科学方法分阶段定位并产出最小复现、根因结论与可验证修复；不适用于已知根因的直接改码或新功能开发；触发词：调试、debug、根因分析、root cause、复现、性能排查、内存泄漏、二分定位、git bisect
domain: 研发/review
triggers: [调试, debug, 根因分析, root cause, 复现, 性能排查, 内存泄漏, 二分定位, git bisect]
tags: [debugging, root-cause-analysis, profiling, troubleshooting, git-bisect]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [pdb, ipdb, cProfile, Chrome DevTools, VS Code Debugger, Delve, pprof, git bisect, Sentry]
requires: []
related: [first-principles-thinking, fact-checking, code-reviewer]
combines_with: []
license: MIT
source: wshobson/agents
source_license: MIT
---
## 何时使用

适用：
- 排查难以捉摸的 bug、间歇性/偶发故障、竞态条件
- 调查性能问题、内存泄漏、崩溃转储与堆栈跟踪
- 排查线上/生产环境问题，理解陌生代码库
- 调试分布式系统

不该用（负边界）：
- 根因已明确，直接改码即可，无需走完整排查流程
- 纯新功能开发、需求设计（与调试无关）
- 仅需代码质量评审时，用 code-reviewer

## 步骤

采用科学方法循环：观察 → 假设 → 实验 → 分析 → 重复，直到锁定根因。

1. 复现（Reproduce）：先确认能否稳定复现（总是/偶尔/随机？需要什么前置条件？他人能否复现？）。收敛为最小复现，剥离无关代码，记录精确步骤与环境。
2. 收集信息（Gather）：完整堆栈、错误码、日志；OS/运行时/依赖版本、环境变量；近期变更（git 历史、发布时间线、配置改动）；影响范围（全量还是特定用户/浏览器/环境）。
3. 形成假设（Hypothesize）：问“改了什么 / 哪里不同（可用差分表对比 working vs broken）/ 哪一层可能失败（输入校验、业务逻辑、数据层、外部服务）”。
4. 测试验证（Test & Verify）：二分法（注释一半代码逐步收窄）、加日志（追踪变量与执行流）、隔离组件（mock 依赖单测）、对比 working/broken 的配置与数据。
5. 修根因而非症状：定位后修复根本原因，并验证修复确实有效；移除临时调试日志。

## 指令

核心原则与硬约束（务必遵守）：
- 一次只改一项，避免同时改多处导致无法归因。
- 不要假设：“不可能是 X”“我没动 Y”“在我机器上是好的”——都要实际验证。
- 完整阅读错误信息和堆栈，多数已给出线索；不要预设“问题很复杂”，往往很简单。
- 生产环境安全调查：不直接改生产，用 feature flag、加监控/日志、在 staging 验证修复；用脱敏的生产数据本地复现。

二分定位回归（git bisect）：
```bash
git bisect start
git bisect bad                # 当前提交有问题
git bisect good v1.0.0        # v1.0.0 是好的
# 测试 checkout 出的中间提交后：
git bisect good   # 正常
git bisect bad    # 仍有问题
git bisect reset  # 结束
```

卡住时的快速排查清单：
- [ ] 拼写错误 / 变量名 typo；大小写敏感（fileName vs filename）
- [ ] null/undefined 值；数组下标差一
- [ ] 异步时序（竞态）；作用域（闭包、提升）
- [ ] 类型不匹配；缺失依赖；环境变量
- [ ] 文件路径（绝对 vs 相对）；缓存/陈旧数据

## 示例

按语言的断点与性能分析：

Python（pdb / breakpoint / cProfile）：
```python
def calculate_total(items):
    breakpoint()  # Python 3.7+，等价 pdb.set_trace()
    return sum(i.price * i.quantity for i in items)

# 异常事后调试
try:
    risky_operation()
except Exception:
    import pdb; pdb.post_mortem()

# 性能剖析，找最慢的 10 个
import cProfile, pstats
cProfile.run('slow_function()', 'profile_stats')
pstats.Stats('profile_stats').sort_stats('cumulative').print_stats(10)
```

JS/TS（DevTools 与 console）：
```typescript
debugger;                 // 条件断点：if (cond) debugger;
console.table(rows);      // 表格化
console.time('op'); /* ... */ console.timeEnd('op');
console.trace();          // 堆栈
```

Go（delve / pprof / panic 恢复）：
```go
// dlv debug main.go
defer func() {
    if r := recover(); r != nil { fmt.Println("Panic:", r); debug.PrintStack() }
}()
import _ "net/http/pprof" // 访问 /debug/pprof/
```

差分调试对比表（定位“哪里不同”）：

| 维度 | Working | Broken |
| --- | --- | --- |
| 环境 | Development | Production |
| 版本 | 18.16.0 | 18.15.0 |
| 数据量 | 空库 | 100 万条 |
| 时间 | 白天 | 凌晨后 |

假设：可能与时区处理有关，重点查时间逻辑。

## 注意事项

- 间歇性 bug：加密集日志（时序/状态迁移/外部交互）、查竞态（共享状态并发、async 乱序、缺同步）、压测多次跑暴露问题。
- 性能问题：先剖析再优化（不要盲优化，前后都测量）；常见元凶 N+1 查询、不必要的重渲染、大数据处理、同步 I/O；工具有 DevTools Performance、Lighthouse、cProfile/line_profiler、clinic.js/0x。
- 内存泄漏：DevTools 堆快照前后对比；Node 用 `process.memoryUsage()` 监控并 `require('v8').writeHeapSnapshot()` 导出。
- 常见误区：一次改多处、不读错误信息、把调试日志带上生产、该用调试器时只靠 console.log、过早放弃、不验证修复。
- 善用 rubber duck：把代码与问题大声讲一遍，常自己就发现了；卡住时休息一下换个视角。

## 互见

- first-principles-thinking：从第一性原理拆解问题、形成假设
- fact-checking：核验“近期改了什么 / 哪里不同”等关键事实
- code-reviewer：修复后做代码评审，避免引入新问题

---
本条采编自 wshobson/agents（MIT）。
