---
name: multi-agent-workflow-designer
title: Multi-Agent Workflow Designer
description: Design production-grade multi-agent workflows — pick an orchestration pattern (sequential/parallel/router/orchestrator/evaluator), scaffold a JSON skeleton, and define handoff contracts with retry/timeout/budget guardrails. Use when architecting a multi-step agent pipeline, decid
domain: 智能/agents
triggers: [design a multi-agent workflow, choose an agent orchestration pattern, single-agent vs multi-agent, refactor an LLM pipeline with context bloat, define handoff contracts, sequential parallel router orchestrator evaluator patterns, scaffold a workflow skeleton config, add retry timeout and budget to each step]
tags: [agents, multi-agent, workflow-orchestration, ai-orchestration, pipeline-design, handoff-contract, cost-control]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [agent-workflow-pattern-designer, multi-agent-system-designer, crewai-multi-agent, langgraph-agent-framework]
combines_with: [agent-tool-design, context-compression, llm-agent-benchmarking]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## When to use

Use this skill when a task is too complex for a single prompt and must be split across multiple specialist agents with clear boundaries. Typical signals:

- A single prompt is insufficient for task complexity, and you need specialist agents with explicit boundaries.
- You want a deterministic workflow structure decided before implementation.
- You need validation loops for quality or safety gates.
- You are refactoring an LLM workflow that suffers from context bloat or unreliable handoffs.
- You are making the architectural call between single-agent and multi-agent approaches.

**Boundary — when NOT to use:** if one well-structured prompt can solve the task, do not wrap it in multi-agent orchestration. Over-orchestration only adds cost, latency, and failure surface. Start with the smallest pattern that satisfies the requirement.

## Steps

1. **Select a pattern** based on dependency shape and risk profile (see the Pattern Map below).
2. **Scaffold the config** with `scripts/workflow_scaffolder.py` to generate a JSON skeleton.
3. **Define handoff contract fields** for every edge.
4. **Add guardrails** — retry/timeouts plus output-validation gates on each step.
5. **Dry-run with small context budgets** before scaling up.

**Pattern Map** (dependency shape → pattern):

- `sequential`: strict step-by-step dependency chain — each step depends on the prior output.
- `parallel`: fan-out/fan-in for independent subtasks; use for throughput and latency reduction.
- `router`: dispatch by intent/type to specialized handlers, with a `fallback`.
- `orchestrator`: a planner coordinates specialists with dependencies (DAG), planning dynamically.
- `evaluator`: generator + quality-gate loop; use when correctness/quality must be enforced.

**Scaffolder usage** — `pattern` is one of `sequential | parallel | router | orchestrator | evaluator`; optional `--name` (default `new-workflow`) and `--output` (write to a path; otherwise print to stdout):

```bash
# Generate a sequential workflow skeleton
python3 scripts/workflow_scaffolder.py sequential --name content-pipeline

# Generate an orchestrator workflow and save it
python3 scripts/workflow_scaffolder.py orchestrator --name incident-triage --output workflows/incident-triage.json
```

**Handoff minimum contract** (every edge must carry these fields):

- `workflow_id`
- `step_id`
- `task`
- `constraints`
- `upstream_artifacts` (pass only targeted artifacts, never the full upstream context)
- `budget_tokens`
- `timeout_seconds`

## Example

Sequential skeleton (with built-in retry):

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

Evaluator skeleton (quality loop):

```json
{
  "pattern": "evaluator",
  "generator": {"agent": "generator"},
  "evaluator": {"agent": "evaluator", "criteria": ["accuracy", "format", "safety"]},
  "loop": {"max_iterations": 3, "pass_threshold": 0.8, "on_fail": "revise_and_retry"}
}
```

Orchestrator skeleton (DAG dependencies + bounded parallelism):

```json
{
  "pattern": "orchestrator",
  "orchestrator": {"agent": "orchestrator", "planning": "dynamic"},
  "specialists": ["researcher", "coder", "analyst", "writer"],
  "execution": {"dependency_mode": "dag", "max_parallel": 3, "completion_policy": "all_required"}
}
```

## Notes

Common pitfalls:

- Over-orchestrating tasks that a single well-structured prompt could solve.
- Missing timeout/retry policies for external-model calls.
- Passing full upstream context instead of targeted artifacts.
- Ignoring per-step cost accumulation.

Best practices:

1. Start with the smallest pattern that can satisfy requirements.
2. Keep handoff payloads explicit and bounded.
3. Validate intermediate outputs before fan-in synthesis.
4. Enforce budget and timeout limits in every step.

## See also

- Detailed pattern templates: source skill `references/workflow-patterns.md` (JSON templates and selection heuristics for sequential/parallel/router/orchestrator/evaluator).
- Scaffolder script: `scripts/workflow_scaffolder.py`.
- Other agent-orchestration and prompt-engineering skills in the AI/agents domain.

---

Adapted from alirezarezvani/claude-skills (MIT); English body reused from the original `agent-workflow-designer` skill, reorganized into this section structure without paraphrasing the commands, contracts, or code.
