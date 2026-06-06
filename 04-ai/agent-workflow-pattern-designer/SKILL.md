---
name: agent-workflow-pattern-designer
title: Agent Workflow Pattern Designer
description: Design production-grade multi-agent workflows: choose the pattern (sequential, parallel, router, orchestrator, evaluator), scaffold JSON skeleton configs, define handoff contracts, and add retry/timeout/quality gates with cost and context discipline. Use when architecting a multi
domain: 智能/agents
triggers: [agent workflow, workflow orchestration pattern, agent handoff contract, single-agent vs multi-agent, context bloat refactor, sequential parallel router orchestrator evaluator, orchestrator]
tags: [agents, workflow-orchestration, multi-agent, pattern-selection, handoff-contract, cost-control]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [multi-agent-workflow-designer, multi-agent-system-designer, langgraph-agent-framework, crewai-multi-agent]
combines_with: [agent-tool-design, llm-agent-benchmarking, context-compression]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
Adapted from alirezarezvani/claude-skills (MIT). English source text reused.

Design production-grade multi-agent workflows with clear pattern choice (sequential, parallel, router, orchestrator, evaluator), handoff contracts, failure handling, and cost/context controls.

Core capabilities:

- Workflow pattern selection for multi-step agent systems
- Skeleton config generation for fast workflow bootstrapping
- Context and cost discipline across long-running flows
- Error recovery and retry strategy scaffolding
- Documentation pointers for operational pattern tradeoffs

## When to use

Use this skill *before* implementation to lock in the structure of a multi-agent workflow:

- A single prompt is insufficient for the task complexity, so you need specialist agents with explicit boundaries.
- You want a deterministic workflow structure (nodes, dependencies, handoff fields) before writing code.
- You need validation loops for quality or safety gates (generate + review gate).
- You are refactoring an existing LLM pipeline that suffers from context bloat or unreliable handoffs.
- You are deciding between a single-agent vs multi-agent approach.

Do not use (negative boundaries):

- Tasks solvable by one well-structured prompt — do not over-orchestrate (see Notes, pitfall 1).
- Pure prompt tuning, model selection, or single-step reasoning problems unrelated to workflow structure.

## Steps

1. Select the pattern based on dependency shape and risk profile (see Pattern Map below).
2. Scaffold the config via `scripts/workflow_scaffolder.py` to produce a JSON skeleton.
3. Define handoff contract fields for every edge (see Handoff Minimum Contract).
4. Add retry/timeouts and output validation gates.
5. Dry-run with small context budgets before scaling.

Scaffolder command (script `scripts/workflow_scaffolder.py`; `pattern` is one of `sequential|parallel|router|orchestrator|evaluator`):

```bash
# Generate a sequential workflow skeleton and print to stdout
python3 scripts/workflow_scaffolder.py sequential --name content-pipeline

# Generate an orchestrator workflow and save it to disk
python3 scripts/workflow_scaffolder.py orchestrator --name incident-triage --output workflows/incident-triage.json
```

Pattern Map (choose by dependency shape):

- `sequential`: strict step-by-step dependency chain. Example: research → draft → review.
- `parallel`: fan-out/fan-in for independent subtasks — improves throughput and reduces latency.
- `router`: dispatch by intent/type to specialized handlers; must include a `fallback`.
- `orchestrator`: a planner dynamically plans and coordinates specialists with DAG dependencies.
- `evaluator`: generator + quality-gate loop; output must pass the gate before finalization.

Detailed templates: `references/workflow-patterns.md`.

## Example

Evaluator (generator + quality-gate loop) skeleton — the scaffolder emits JSON shaped like:

```json
{
  "name": "incident-triage",
  "pattern": "evaluator",
  "generator": {"agent": "generator"},
  "evaluator": {"agent": "evaluator", "criteria": ["accuracy", "format", "safety"]},
  "loop": {"max_iterations": 3, "pass_threshold": 0.8, "on_fail": "revise_and_retry"}
}
```

Each pattern ships with its own operational guardrails: the `sequential` template includes a retry policy `"retry": {"max_attempts": 2, "backoff_seconds": 2}`; `parallel` includes timeouts `"timeouts": {"per_task_seconds": 180, "fan_in_seconds": 120}`; `orchestrator` includes execution constraints `"execution": {"dependency_mode": "dag", "max_parallel": 3, "completion_policy": "all_required"}`.

Handoff Minimum Contract (every edge should carry these fields):

- `workflow_id`
- `step_id`
- `task`
- `constraints`
- `upstream_artifacts` (pass only targeted artifacts, never the full context)
- `budget_tokens`
- `timeout_seconds`

## Notes

Common pitfalls:

1. Over-orchestrating tasks solvable by one well-structured prompt.
2. Missing timeout/retry policies for external-model calls.
3. Passing full upstream context instead of targeted artifacts (causes context bloat and runaway cost).
4. Ignoring per-step cost accumulation.

Best practices:

1. Start with the smallest pattern that can satisfy requirements.
2. Keep handoff payloads explicit and bounded.
3. Validate intermediate outputs before fan-in synthesis.
4. Enforce budget and timeout limits in every step.

## See also

- `references/workflow-patterns.md`: full JSON templates for all five patterns plus pattern selection heuristics.
- Related agent-design, prompt-engineering, and context-management entries in the AI / agents domain.
