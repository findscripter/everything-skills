---
name: parallel-agent-dispatch
title: 并行独立任务分派
description: 当面对 2 个以上彼此独立、无共享状态也无先后依赖的任务（如多个互不相关的测试失败、多个子系统各自损坏）时使用；为每个独立问题域派发一个子 Agent 并发处理，再回收摘要、查冲突、跑全量验证整合产物；不适用于失败相关联、需通览全局状态、还在探索性排障或会争抢同一文件/资源的场景。触发词：并行、子 Agent、独立任务
domain: 通用/thinking
triggers: [并行分派任务, 多个独立的测试失败, 把任务拆给子 Agent 并发处理, fan-out 子任务, 多个子系统各自报错, 一个 Agent 处理一个问题域]
tags: [并行, 子agent, 任务分派, 测试修复, 编排, 通用]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Task]
requires: []
related: [multi-agent-orchestrator, parallel-agent-hub, dmux-multi-agent-workflows, task-decomposition-planner]
combines_with: [multi-agent-workflow-designer, agent-workflow-pattern-designer, premortem-plan-challenger]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

当你手上有多个**彼此无关**的问题（不同测试文件、不同子系统、不同 Bug），逐个串行排查纯属浪费时间。核心原则：**一个独立问题域派一个子 Agent，让它们并发干活。**

判定路径（源自原 SKILL 的决策图）：
1. 有多处失败吗？→ 没有则单 Agent 处理。
2. 它们彼此独立吗？→ 相关联（修一个可能连带修好其他）则让单 Agent 一起查。
3. 能并行吗？→ 有共享状态（会改同一文件、抢同一资源）则改为串行 Agent；否则并行分派。

**该用：**
- 3+ 个测试文件因不同根因失败
- 多个子系统各自独立损坏
- 每个问题不依赖其他上下文即可理解
- 各排查之间无共享状态

**不该用（负边界）：**
- 失败相互关联——先合并排查，修一个可能修好一片
- 需要通览整个系统状态才能理解
- 探索性排障——你还不知道哪里坏了
- 共享状态——Agent 之间会互相干扰（编辑同一文件、争用同一资源）

## 步骤 / 指令

**1. 划分独立问题域**
按"坏了什么"对失败分组，例如：文件 A=工具审批流程、文件 B=批量完成行为、文件 C=中止功能。确认彼此独立——修工具审批不会影响中止测试。

**2. 编写聚焦的 Agent 任务**
每个子 Agent 必须拿到四件套：
- **明确范围**：单个测试文件或子系统
- **清晰目标**：让这些测试通过
- **约束**：不要改动其他代码
- **预期产出**：定位与修复的摘要

**3. 并行分派**（Claude Code / AI 环境）
```typescript
Task("Fix agent-tool-abort.test.ts failures")
Task("Fix batch-completion-behavior.test.ts failures")
Task("Fix tool-approval-race-conditions.test.ts failures")
// 三者并发执行
```

**4. 回收并整合**
- 逐份阅读摘要
- 核验各修复是否冲突（是否动了同一段代码）
- 跑全量测试套件
- 抽查——子 Agent 可能犯系统性错误，确认无误后整合

## 示例

好的子 Agent prompt 应满足：**聚焦**（单一问题域）、**自包含**（含理解问题所需的全部上下文）、**产出明确**（说清要返回什么）。

```markdown
修复 src/agents/agent-tool-abort.test.ts 中 3 个失败的测试：

1. "should abort tool with partial output capture" - 期望消息含 'interrupted at'
2. "should handle mixed completed and aborted tools" - 快速工具被中止而非完成
3. "should properly track pendingToolCount" - 期望 3 个结果但得到 0

这些是计时/竞态问题。你的任务：
1. 读测试文件，理解每个测试在验证什么
2. 定位根因——计时问题还是真实 Bug？
3. 修复方式：
   - 用基于事件的等待替换任意 timeout
   - 若发现中止实现有 Bug 则修掉
   - 若被测行为已变更则调整测试期望

不要只是加大 timeout——找到真正的问题。

返回：你定位到什么、修了什么的摘要。
```

实战参考（6 个失败 / 3 个文件，重构后）：Agent1 用事件等待替换 timeout；Agent2 修了事件结构 Bug（threadId 放错位置）；Agent3 增加了对异步工具执行完成的等待。三处修复独立、零冲突、全量套件转绿。

## 注意事项

常见错误对照：
- 太宽泛：「修好所有测试」→ Agent 会迷失。**应**：「修 agent-tool-abort.test.ts」聚焦范围。
- 无上下文：「修那个竞态」→ Agent 不知道在哪。**应**：贴出报错信息与测试名。
- 无约束：Agent 可能大改重构。**应**：「不要改生产代码」或「只改测试」。
- 产出模糊：「修一下」→ 你不知道改了啥。**应**：「返回根因与改动摘要」。

收益：并行（多路排查同时进行）、聚焦（每个 Agent 范围窄、上下文少）、独立（互不干扰）、提速（3 个问题用 1 个的时间解决）。

风险与边界（保留源约束）：仅在任务明确落在上述范围内时使用；其产出不能替代环境特定的验证、测试或专家评审；若缺少必需输入、权限、安全边界或成功标准，停下并请求澄清。

## 互见

- 串行 Agent 编排（存在共享状态时的替代方案）
- 子 Agent prompt 写法 / 任务下发规范

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
