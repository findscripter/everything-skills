---
name: multi-agent-workflow-designer
title: 多智能体工作流设计
description: 当设计多步骤 Agent 流水线、在单 Agent 与多 Agent 之间抉择、或重构受上下文膨胀/交接不可靠困扰的 LLM 工作流时使用；做选定编排模式（顺序/并行/路由/编排器/评估器）、用脚手架脚本生成 JSON 骨架配置、定义交接契约与重试/超时/预算护栏，产出可落地的工作流蓝图；不适用于单条良构提示词即可解决的简单任务。触发词：多智能体工作流、Agent 编排、交接契约
domain: 智能/agents
triggers: [设计多智能体工作流, Agent 编排模式选型, 单 Agent 还是多 Agent, 重构上下文膨胀的 LLM 流水线, 交接契约/handoff 契约, 顺序 并行 路由 编排器 评估器 模式, 生成工作流骨架配置, 为每步加重试超时和预算]
tags: [智能体, agents, 工作流编排, 多智能体, AI编排, 流水线设计, 交接契约, 成本控制]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python3, workflow_scaffolder.py]
requires: []
related: [agent-workflow-pattern-designer, multi-agent-system-designer, crewai-multi-agent, langgraph-agent-framework]
combines_with: [agent-tool-design, context-compression, llm-agent-benchmarking]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

当一个任务复杂到单条提示词无法稳定胜任，需要把它拆成多个有明确边界的专职 Agent 协作时使用本技能。典型场景：

- 一条提示词不足以承载任务复杂度，需要带显式边界的专家 Agent。
- 希望在动手实现前先定下确定性的工作流结构。
- 需要质量/安全关卡的校验回路。
- 正在重构一个受上下文膨胀或交接不可靠困扰的 LLM 工作流。
- 在「单 Agent vs 多 Agent」之间做架构抉择。

**不该用的边界**：若任务用一条良构的提示词即可解决，不要为它套多 Agent 编排——过度编排会徒增成本、延迟与故障面。先用能满足需求的最小模式。

## 步骤

1. **选模式**：依据「依赖形态 + 风险画像」从五种模式中选型（见下方模式表）。
2. **生成骨架**：用 `scripts/workflow_scaffolder.py` 生成 JSON 骨架配置。
3. **定义交接契约**：为每一条边（edge）补齐交接契约字段。
4. **加护栏**：为每一步加上重试/超时与输出校验关卡。
5. **小预算试跑**：在放大规模前，用较小的上下文预算做 dry-run 验证。

## 指令

模式选型表（依赖形态 → 模式）：

- `sequential`：严格逐步依赖链——每一步都依赖上一步输出。
- `parallel`：独立子任务先扇出（fan-out）后扇入（fan-in），用于提吞吐、降延迟。
- `router`：按意图/类型分派到专职处理器，并配 `fallback` 兜底。
- `orchestrator`：规划者（planner）协调多专家，按依赖（DAG）动态规划。
- `evaluator`：生成器 + 质量关卡回路，正确性/质量必须把关时用。

生成骨架命令：

```bash
# 生成顺序工作流骨架
python3 scripts/workflow_scaffolder.py sequential --name content-pipeline

# 生成编排器工作流并落盘保存
python3 scripts/workflow_scaffolder.py orchestrator --name incident-triage --output workflows/incident-triage.json
```

脚本支持的 `pattern` 取值：`sequential | parallel | router | orchestrator | evaluator`；可选参数 `--name`（默认 `new-workflow`）、`--output`（落盘路径，缺省则打印到 stdout）。

**交接最小契约**（每条边都必须携带这些字段）：

- `workflow_id`
- `step_id`
- `task`
- `constraints`
- `upstream_artifacts`（只传定向产物，不要整段上游上下文）
- `budget_tokens`
- `timeout_seconds`

## 示例

顺序模式骨架（含内建重试）：

```json
{
  "name": "content-pipeline",
  "pattern": "sequential",
  "steps": [
    {"id": "research", "agent": "researcher", "next": "draft"},
    {"id": "draft", "agent": "writer", "next": "review"},
    {"id": "review", "agent": "reviewer", "next": null}
  ],
  "retry": {"max_attempts": 2, "backoff_seconds": 2}
}
```

评估器模式骨架（质量回路）：

```json
{
  "pattern": "evaluator",
  "generator": {"agent": "generator"},
  "evaluator": {"agent": "evaluator", "criteria": ["accuracy", "format", "safety"]},
  "loop": {"max_iterations": 3, "pass_threshold": 0.8, "on_fail": "revise_and_retry"}
}
```

编排器模式骨架（DAG 依赖 + 受控并行）：

```json
{
  "pattern": "orchestrator",
  "orchestrator": {"agent": "orchestrator", "planning": "dynamic"},
  "specialists": ["researcher", "coder", "analyst", "writer"],
  "execution": {"dependency_mode": "dag", "max_parallel": 3, "completion_policy": "all_required"}
}
```

## 注意事项

常见陷阱：

- 对一条良构提示词就能解决的任务过度编排。
- 给外部模型调用漏配超时/重试策略。
- 把整段上游上下文一股脑往下传，而非只传定向产物（artifacts）。
- 忽视逐步累积的单步成本。

最佳实践：

1. 从能满足需求的最小模式起步。
2. 交接载荷保持显式且有界。
3. 扇入（fan-in）综合前，先校验各路中间产物。
4. 每一步都强制预算与超时上限。

## 互见

- 模式模板详表：源技能 `references/workflow-patterns.md`（顺序/并行/路由/编排器/评估器各模式的 JSON 模板与选型启发式）。
- 脚手架脚本：`scripts/workflow_scaffolder.py`。
- 智能/agents 域内其他 Agent 编排、提示词工程类技能。

---

采编自 alirezarezvani/claude-skills（MIT），适配重写为中文版，非逐字翻译。
