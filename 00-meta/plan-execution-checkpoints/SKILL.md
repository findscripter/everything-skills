---
name: plan-execution-checkpoints
title: 分批执行计划与检查点
description: 当已有一份写好的实施计划、需要在独立会话中按批执行并在批次间留出审阅检查点时使用；做法是先批判性通读计划、用 TodoWrite 建任务、默认每批做前 3 个任务并逐项校验后停下汇报「Ready for feedback.」等反馈，产出可审阅的分批执行进度与验证输出；不适用于尚无计划文本、需要先写计划、或一口气跑完无需人工把关的小任务。触发词：执行计划、分批执行、检查点、计划落地、execute plan、batch execution、checkpoint review
domain: 通用/thinking
triggers: [执行计划, 分批执行, 检查点, 计划落地, 按批实施, execute plan, batch execution, checkpoint, review checkpoint, implementation plan, TodoWrite]
tags: [plan-execution, checkpoints, batch-execution, todowrite, human-in-the-loop, workflow, 通用]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [TodoWrite]
requires: []
related: [closed-loop-delivery, premortem-plan-challenger, parallel-agent-dispatch, task-decomposition-planner]
combines_with: [spec-driven-workflow, task-decomposition-planner]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

当你手里已经有一份**写好的、可读的实施计划**（步骤被拆成小颗粒），且希望在一个独立会话里把它落地、并在批次之间停下来让人（架构师/搭档）审阅时使用。核心原则：**分批执行 + 检查点审阅**。

开工先声明：「我正在用『分批执行计划与检查点』技能来落地这份计划。」

不该用的边界：

- 还没有具体计划文本，只有模糊想法 → 先去写/补全计划，再回来执行。
- 任务很小、能一口气跑完且无需人工把关 → 直接做，分批只会增加来回开销。
- 需要的是重新设计方案或推翻整体思路，而非按既定计划执行 → 回到计划/评审阶段。

## 步骤

1. **加载并批判性评审计划**：读计划文件；带着质疑通读，找出疑问或顾虑。有顾虑 → 先和搭档对齐再动手；无顾虑 → 用 `TodoWrite` 建任务清单后开工。
2. **执行一批**：默认**前 3 个任务**。逐个任务：标记 `in_progress` → 严格按计划的小步骤做（计划已切成小颗粒，照做即可）→ 按计划跑验证 → 标记 `completed`。
3. **汇报**：一批做完后，展示「实现了什么 + 验证输出」，然后说一句「Ready for feedback.」并停下等待。
4. **继续**：依据反馈——需要就改、执行下一批、循环直到全部完成。
5. **收尾**：所有任务完成并验证通过后，转入收尾流程（声明并按团队的「完成开发分支」流程：验证测试、给出选项、执行所选项）。

## 指令

**何时必须停下来求助**（命中任一立即停止执行，不要猜）：

- 批次中途撞墙：缺依赖、测试失败、指令含糊。
- 计划存在关键缺口，导致无法开始。
- 看不懂某条指令。
- 验证反复失败。

**何时回到评审（第 1 步）**：搭档据你的反馈更新了计划；或底层方法需要重新思考。**别硬闯阻塞点——停下来问。**

要点速记：先批判性评审计划；严格照计划步骤做；不跳过验证；计划引用到别的技能时就去用；批次之间只汇报、不擅自往下推进；卡住就停、不要靠猜糊弄。

## 示例

一份计划含 8 个任务。执行节奏：

```
评审计划 → 无顾虑 → TodoWrite 建 8 条任务
批次 1：任务 1/2/3（每个 in_progress → 按步骤做 → 跑验证 → completed）
  汇报：「实现了 X/Y/Z；验证输出如下 …… Ready for feedback.」  ← 停下等反馈
（搭档：任务 2 的边界要改）→ 应用修改 → 批次 2：任务 4/5/6 → 汇报 → 停
批次 3：任务 7/8 → 汇报 → 全部完成并验证 → 转入收尾流程
```

撞墙示例：批次 2 中任务 5 的验证连续 3 次失败 → **立即停止**，向搭档说明「任务 5 在 …… 处验证反复失败，疑似 ……，需要你确认 ……」，而不是继续往任务 6 推进。

## 注意事项

- 默认每批 3 个任务是为了控制审阅粒度；可按搭档偏好调整，但「批次间汇报并等待」这一约束不要省。
- 「批判性评审」发生在动手前，不是走形式：把疑问/顾虑在建 TodoWrite 之前提出来。
- 不要跳过计划里写明的验证步骤；验证输出是检查点能审阅的依据。
- 停下时给出可操作信息（哪里卡、疑似原因、需要什么决策），而非只说「卡住了」。
- 本技能只负责「按计划分批执行 + 检查点」；写计划、拆任务依赖、收尾合并分支等是相邻职责，按需组合。

## 互见

- related：`task-decomposition-planner` —— 上游负责把复杂任务拆成可执行计划/子任务，本技能负责把计划落地执行。
- related：`premortem-plan-challenger` —— 执行前若想先给计划「找茬」、暴露脆弱假设，可先用它。
- combines_with：与「收尾/完成开发分支」类流程组合，完成执行后做测试验证与合并收口。

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
