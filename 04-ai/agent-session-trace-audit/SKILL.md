---
name: agent-session-trace-audit
title: AI Coding Agent Session Audit (Cost / Failures / Latency)
description: Audit local AI coding-agent sessions (Claude Code, Cursor, Gemini, Codex CLI) with agenttrace for cost, tool failures, latency, anomalies, health scores, diffs, and CI gates; use when a run was slow/expensive/shallow/unreliable or you need a lightweight CI health gate. Triggers: 
domain: 智能/eval
triggers: [why was an AI coding run slow/expensive/shallow/unreliable, review local agent logs before retrying, build a CI session health gate, compare two attempts for semantic drift, investigate token/cost spikes, analyze tool failures and retry loops]
tags: [ai-coding, observability, cost-tracking, session-analysis, ci-gate, agenttrace]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [coding-agent-headtohead-eval, llm-agent-benchmarking, langfuse-llm-observability, ai-engineering-toolkit]
combines_with: [cost-aware-llm-pipeline, autonomous-coding-agent-patterns]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## When to use

Use this skill to inspect **local** AI coding-agent sessions with [agenttrace](https://github.com/luoyuctl/agenttrace). It focuses on the *process* behind a run: token and cost spikes, tool failures, retry loops, latency gaps, anomalies, health scores, and session-to-session diffs.

Use it when:
- A user asks why an AI coding run was slow, expensive, shallow, or unreliable, and you need to locate process problems (token/cost spikes, tool failures, retry loops, latency gaps, anomalies, low health scores).
- Reviewing local agent logs before retrying a failed or suspicious task.
- Building a lightweight CI health gate for AI-assisted coding sessions.
- Comparing two attempts to find changed tool paths, retries, or cost patterns (semantic drift).

Do **not** use it (negative boundaries):
- Do not audit traces of remote/hosted or production LLM applications (route those to langfuse / general observability).
- Do not upload private session logs to external services.
- Healthy trace metrics do not prove the final code is correct — still run tests and review diffs.

agenttrace is local-first and reads session logs from tools such as Claude Code, Codex CLI, Gemini CLI, Aider, Cursor exports, OpenCode, Qwen Code, Kimi, and generic JSON or JSONL traces.

## Steps

### Step 1: Discover available sessions
Prefer an installed `agenttrace` binary when it is available on `PATH`. If the current repository is `luoyuctl/agenttrace`, use `go run ./cmd/agenttrace` instead.

```bash
agenttrace --doctor
agenttrace --overview
```

If no sessions are detected, report the directories checked by `--doctor` and ask the user for the exported session file or log directory.

### Step 2: Produce a human-readable audit
Use Markdown when the user wants a concise report they can inspect or share.

```bash
agenttrace --overview -f markdown -o agenttrace-overview.md
```

In the report, lead with the highest-risk sessions and explain why they matter: critical anomalies, repeated tool failures, token or cost waste, long latency gaps, low health scores, and suspiciously shallow sessions.

### Step 3: Inspect one session or directory
Use the latest session for a quick check, or pass an explicit export path when the user provides one.

```bash
agenttrace --latest
agenttrace --latest -f json
agenttrace path/to/session-or-export.json
agenttrace --overview -d path/to/session-dir
```

### Step 4: Compare attempts when semantics matter
Token and latency metrics can look healthy even when an agent confidently takes the wrong implementation path. When the risk is semantic drift, pair the trace audit with a diff against a previous or known-good attempt.

Look for:
- changed files or commands that diverge from the intended task
- missing tests or verification steps compared with the reference attempt
- repeated edits around the same files without a clear reason
- lower cost that came from skipping necessary exploration

### Step 5: Add automation gates
For CI or repeatable team workflows, use JSON output or health thresholds.

```bash
agenttrace --overview -f json -o agenttrace-overview.json
agenttrace --overview --fail-under-health 80 --fail-on-critical --max-tool-fail-rate 15
```

Tune thresholds to the project. A strict gate is useful for critical workflows; a reporting-only command is better while the team is still learning its baseline.

## Example

### Quick local review
```bash
agenttrace --overview
agenttrace --latest
```

Use this after a long coding-agent run to decide whether the next prompt should split the task, avoid a failing tool path, add missing tests, or reset context.

### CI health check
```bash
agenttrace --overview --fail-under-health 80 --fail-on-critical
```

Use this when agent session logs are available in CI and the team wants a simple guard against critical anomalies or unhealthy runs.

## Notes

Best practices:
- Start with `--doctor` when session discovery is uncertain.
- Report missing fields plainly; do not invent cost, model, latency, or health data.
- Treat prompts, code, and session contents as private local data.
- Prefer JSON output for automation and Markdown output for human review.
- Use trace metrics for process failures and diff/reference review for semantic drift.

Limitations:
- agenttrace can only analyze logs that are present locally or provided as exports.
- Some agents do not expose enough fields to infer cost, model, cache use, or latency.
- Healthy trace metrics do not prove the final code is correct; still run tests and review diffs.
- CI gates should start as advisory until the team understands normal baseline behavior.

Security & safety:
- Do not upload private session logs to external services unless the user explicitly approves it.
- Do not overwrite user reports unless they requested that exact output path.
- Avoid printing secrets found in prompts, tool output, environment variables, or logs.

Common pitfalls:
- **No sessions are found** → Run `agenttrace --doctor`, then point agenttrace at the exported file or log directory.
- **A run looks cheap and fast but produced the wrong refactor** → Compare the session against a prior attempt or known-good diff; cost metrics alone will miss semantic drift.
- **CI fails too often after adding a health gate** → Start with JSON or Markdown reporting, inspect normal baselines, then tighten thresholds gradually.

## See also
- `langfuse` — production LLM application tracing and evaluation.
- `observability-engineer` — broader service monitoring, SLOs, and incident workflows.

---
Adapted from sickn33/antigravity-awesome-skills (upstream tool luoyuctl/agenttrace, MIT license).
