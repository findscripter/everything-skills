---
name: agent-workflow-pattern-designer
title: 智能体工作流模式设计
description: 当需要为多步骤 LLM 任务选型多智能体编排模式、定义交接契约或重构存在上下文膨胀/交接不可靠的工作流时使用；做模式选型（顺序/并行/路由/编排/评估）+ 用脚手架生成 JSON 骨架 + 补齐交接契约、重试超时与质量门，产出可落地的工作流配置；不适用于单条结构化提示即可解决的简单任务；触发词：多智能体、工作流编排、交接契约
domain: 智能/agents
triggers: [多智能体工作流, 工作流编排模式, 智能体交接契约, 单智能体还是多智能体, 上下文膨胀重构, 顺序/并行/路由/编排/评估, agent workflow, orchestrator]
tags: [智能体, agents, 工作流编排, 多智能体, 模式选型, 交接契约, 成本控制]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Bash, Write, Read]
requires: []
related: [multi-agent-workflow-designer, multi-agent-system-designer, langgraph-agent-framework, crewai-multi-agent]
combines_with: [agent-tool-design, llm-agent-benchmarking, context-compression]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
采编自 alirezarezvani/claude-skills（MIT），适配重写为中文版本。

## 何时使用

在「实现之前」先确定多智能体工作流的结构时使用本技能：

- 单条提示无法承载任务复杂度，需要拆成多个有明确边界的专职智能体。
- 要在编码前确定确定性的工作流骨架（节点、依赖、交接字段）。
- 需要为质量或安全设置校验回路（生成 + 评审门）。
- 重构一个已存在但「上下文膨胀」或「交接不可靠」的 LLM 流水线。
- 纠结「单智能体 vs 多智能体」该选哪个。

不该用（负边界）：

- 一条结构良好的提示即可解决的任务——不要过度编排（见注意事项第 1 条）。
- 纯粹的提示词调优、模型选型、或与「工作流结构」无关的单步推理问题。

## 步骤 / 指令

1. 按「依赖形态 + 风险画像」选模式（见下方模式速查）。
2. 用脚手架脚本生成 JSON 骨架配置。
3. 为「每一条边」定义交接契约字段（见交接最小契约）。
4. 补齐重试、超时与输出校验门。
5. 用小上下文预算先 dry-run，验证通过再扩容。

脚手架命令（脚本 `scripts/workflow_scaffolder.py`，参数 `pattern` 取值 `sequential|parallel|router|orchestrator|evaluator`）：

```bash
# 生成顺序工作流骨架并打印到 stdout
python3 scripts/workflow_scaffolder.py sequential --name content-pipeline

# 生成编排器工作流并落盘保存
python3 scripts/workflow_scaffolder.py orchestrator --name incident-triage --output workflows/incident-triage.json
```

模式速查（按依赖形态选）：

- `sequential` 顺序：严格的步步依赖链。例 research → draft → review。
- `parallel` 并行：独立子任务 fan-out 后 fan-in 汇总，提升吞吐、降低延迟。
- `router` 路由：按意图/类型分派到专职处理器，必须带 fallback 兜底。
- `orchestrator` 编排：planner 动态规划、按 DAG 依赖协调多个 specialist。
- `evaluator` 评估：generator + quality gate 回路，强制质量门后才定稿。

详细模板见 `references/workflow-patterns.md`。

## 示例

评估器（生成 + 质量门回路）骨架，脚本输出形如：

```json
{
  "name": "incident-triage",
  "pattern": "evaluator",
  "generator": {"agent": "generator"},
  "evaluator": {"agent": "evaluator", "criteria": ["accuracy", "format", "safety"]},
  "loop": {"max_iterations": 3, "pass_threshold": 0.8, "on_fail": "revise_and_retry"}
}
```

顺序模式自带重试策略：`"retry": {"max_attempts": 2, "backoff_seconds": 2}`；并行模式自带超时：`"timeouts": {"per_task_seconds": 180, "fan_in_seconds": 120}`；编排模式执行约束：`"execution": {"dependency_mode": "dag", "max_parallel": 3, "completion_policy": "all_required"}`。

交接最小契约（每条边都应携带这些字段）：

- `workflow_id` 工作流标识
- `step_id` 步骤标识
- `task` 任务描述
- `constraints` 约束
- `upstream_artifacts` 上游产物（只传定向产物，不传完整上下文）
- `budget_tokens` token 预算
- `timeout_seconds` 超时秒数

## 注意事项

常见坑：

1. 过度编排——能用一条结构化提示解决的任务别拆成多智能体。
2. 对外部模型调用缺少 timeout/retry 策略。
3. 把完整上游上下文整包透传，而不是只传定向产物（导致上下文膨胀、成本飙升）。
4. 忽视逐步累积的成本。

最佳实践：

1. 从能满足需求的「最小模式」起步。
2. 交接 payload 保持显式且有界。
3. fan-in 汇总前先校验中间输出。
4. 每一步都强制预算与超时上限。

## 互见

- `references/workflow-patterns.md`：五种模式的完整 JSON 模板与选型启发式。
- 智能/agents 域下的智能体设计、提示工程、上下文管理相关条目。
