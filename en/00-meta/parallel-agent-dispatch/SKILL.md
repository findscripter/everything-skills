---
name: parallel-agent-dispatch
title: Dispatching Parallel Agents
description: Use when facing 2+ independent tasks with no shared state or sequential dependencies (e.g. unrelated test failures, separately broken subsystems): dispatch one sub-agent per independent problem domain to work concurrently, then collect summaries, check for conflicts, and run full
domain: 通用/thinking
triggers: [dispatch tasks in parallel, multiple independent test failures, fan out subtasks to sub-agents, one agent per problem domain, several subsystems broken independently, parallel agent dispatch]
tags: [parallel, sub-agent, task-dispatch, test-fixing, orchestration, general]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [multi-agent-orchestrator, parallel-agent-hub, dmux-multi-agent-workflows, task-decomposition-planner]
combines_with: [multi-agent-workflow-designer, agent-workflow-pattern-designer, premortem-plan-challenger]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## When to use

When you have multiple **unrelated** failures (different test files, different subsystems, different bugs), investigating them sequentially wastes time. Each investigation is independent and can happen in parallel.

**Core principle:** Dispatch one agent per independent problem domain. Let them work concurrently.

Decision path (from the original decision graph):
1. Multiple failures? → If no, a single agent handles it.
2. Are they independent? → If related (fixing one might fix others), have a single agent investigate them together.
3. Can they work in parallel? → If there is shared state (editing the same file, contending for the same resource), use sequential agents instead; otherwise dispatch in parallel.

**Use when:**
- 3+ test files failing with different root causes
- Multiple subsystems broken independently
- Each problem can be understood without context from others
- No shared state between investigations

**Don't use when (negative boundary):**
- Failures are related (fix one might fix others) — investigate together first
- You need to understand full system state to make sense of the problem
- Exploratory debugging — you don't know what's broken yet
- Shared state — agents would interfere with each other (editing same files, using same resources)

## Steps

**1. Identify independent domains**

Group failures by what's broken, e.g.:
- File A tests: Tool approval flow
- File B tests: Batch completion behavior
- File C tests: Abort functionality

Each domain is independent — fixing tool approval doesn't affect abort tests.

**2. Create focused agent tasks**

Each agent gets:
- **Specific scope:** One test file or subsystem
- **Clear goal:** Make these tests pass
- **Constraints:** Don't change other code
- **Expected output:** Summary of what you found and fixed

**3. Dispatch in parallel** (Claude Code / AI environment)

```typescript
Task("Fix agent-tool-abort.test.ts failures")
Task("Fix batch-completion-behavior.test.ts failures")
Task("Fix tool-approval-race-conditions.test.ts failures")
// All three run concurrently
```

**4. Review and integrate**

When agents return:
- Read each summary
- Verify fixes don't conflict (did agents edit the same code?)
- Run the full test suite
- Spot check — agents can make systematic errors — then integrate all changes

## Example

Good agent prompts are: **focused** (one clear problem domain), **self-contained** (all context needed to understand the problem), and **specific about output** (what should the agent return?).

```markdown
Fix the 3 failing tests in src/agents/agent-tool-abort.test.ts:

1. "should abort tool with partial output capture" - expects 'interrupted at' in message
2. "should handle mixed completed and aborted tools" - fast tool aborted instead of completed
3. "should properly track pendingToolCount" - expects 3 results but gets 0

These are timing/race condition issues. Your task:

1. Read the test file and understand what each test verifies
2. Identify root cause - timing issues or actual bugs?
3. Fix by:
   - Replacing arbitrary timeouts with event-based waiting
   - Fixing bugs in abort implementation if found
   - Adjusting test expectations if testing changed behavior

Do NOT just increase timeouts - find the real issue.

Return: Summary of what you found and what you fixed.
```

**Real example from a session** (6 failures across 3 files after a major refactor):
- agent-tool-abort.test.ts: 3 failures (timing issues)
- batch-completion-behavior.test.ts: 2 failures (tools not executing)
- tool-approval-race-conditions.test.ts: 1 failure (execution count = 0)

Decision: independent domains — abort logic, batch completion, and race conditions are separate. Dispatch:
```
Agent 1 → Fix agent-tool-abort.test.ts
Agent 2 → Fix batch-completion-behavior.test.ts
Agent 3 → Fix tool-approval-race-conditions.test.ts
```
Results: Agent 1 replaced timeouts with event-based waiting; Agent 2 fixed an event-structure bug (threadId in the wrong place); Agent 3 added a wait for async tool execution to complete. All fixes independent, zero conflicts, full suite green — 3 problems solved in the time of 1.

## Notes

Common mistakes:
- **Too broad:** "Fix all the tests" → agent gets lost. **Do:** "Fix agent-tool-abort.test.ts" — focused scope.
- **No context:** "Fix the race condition" → agent doesn't know where. **Do:** Paste the error messages and test names.
- **No constraints:** Agent might refactor everything. **Do:** "Do NOT change production code" or "Fix tests only".
- **Vague output:** "Fix it" → you don't know what changed. **Do:** "Return summary of root cause and changes".

Key benefits: parallelization (multiple investigations at once), focus (each agent has narrow scope and less context to track), independence (agents don't interfere), and speed (3 problems solved in the time of 1).

Limitations and boundaries (preserved from source):
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.

## See also

- Sequential agent orchestration (alternative when shared state exists)
- Sub-agent prompt writing / task dispatch conventions
- multi-agent-orchestrator, parallel-agent-hub, dmux-multi-agent-workflows, task-decomposition-planner

---
Adapted from sickn33/antigravity-awesome-skills (MIT).
