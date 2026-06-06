---
name: agent-tool-design-patterns
title: Agent Tool Design Patterns: Tools Agents Can Call Effectively
description: Use when designing/refactoring tool sets for agent systems, debugging tool misuse, or optimizing existing tools; produces unambiguous descriptions, consolidated tools, and recoverable errors; triggers: tool design, MCP, tool consolidation, error messages.
domain: 智能/agents
triggers: [creating new tools for an agent system, debugging tool-call failures or misuse, optimizing an existing tool set for better agent performance, designing tool APIs from scratch, evaluating whether a third-party tool is usable by an agent, standardizing tool naming/return conventions across a codebase, vague tool descriptions cause the agent to call the wrong tool, MCP tool not found]
tags: [tool-design, agent, mcp, api, context-engineering, error-handling, naming-conventions]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [agent-tool-design, agent-tool-builder, agent-readiness-aeo-check, mcp-builder]
combines_with: [langgraph-agent-framework, multi-agent-system-designer]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## When to use

Tools are the primary mechanism through which agents interact with the world. They define the contract between deterministic systems and non-deterministic agents. Unlike traditional software APIs designed for developers, tool APIs must be designed for language models that reason about intent, infer parameter values, and generate calls from natural language. Poor tool design creates failure modes that no amount of prompt engineering can fix.

**Use when:**
- Creating new tools for agent systems, or designing tool APIs from scratch
- Debugging tool-related failures or misuse
- Optimizing existing tool sets for better agent performance
- Evaluating third-party tools for agent integration
- Standardizing tool naming / return-field conventions across a codebase

**Do not use (negative boundary):**
- Plain SDK / REST docs written for human developers — humans read the contract and self-correct, so the constraints are looser
- Pure backend interface design unrelated to agent invocation
- When the underlying data is messy or undocumented, do not rush into "architectural reduction" (see Notes)

## Steps

1. **Map the workflows.** List the distinct workflows agents must accomplish, not the existing functions.
2. **Consolidate tools.** Group related actions of one workflow into a single comprehensive tool (see consolidation principle).
3. **Write good descriptions.** Each tool answers four questions — what it does / when to use it / what inputs it accepts / what it returns.
4. **Set defaults and response formats.** Defaults reflect common use cases; offer `concise` / `detailed` output to control token usage.
5. **Design recoverable errors.** Error messages must tell the agent what went wrong and how to fix it.
6. **Standardize conventions.** Verb-noun tool names; reuse the same parameter and return-field names across tools.
7. **Control scale.** 10-20 tools for most applications; beyond that, group with namespacing.
8. **Test with real agent requests** and iterate on observed failure modes.

## Detailed guidance

**Consolidation principle (core).** If a human engineer cannot definitively say which tool should be used in a given situation, an agent cannot be expected to do better. Prefer a single comprehensive tool that handles the full workflow internally over chaining multiple narrow tools.
- Anti-example: `list_users` + `list_events` + `create_event`
- Good example: `schedule_event` (finds availability and schedules internally)
- **But do not force it.** Tools with fundamentally different behaviors, used in different contexts, or that might be called independently should stay separate.

**Why consolidation works.** Agents have limited context and attention. Each tool competes for attention during selection, adds description tokens to the context budget, and overlapping functionality creates ambiguity. Consolidation cuts redundant descriptions, removes ambiguity, and shrinks the effective tool set.

**Architectural reduction (consolidation taken to its extreme).** Remove most specialized tools in favor of primitive, general-purpose capabilities. The canonical case is the **file-system agent pattern**: instead of custom tools for data exploration, schema lookup, and query validation, provide direct file-system access through a single command-execution tool, and let the agent use standard Unix utilities (`grep`, `cat`, `find`, `ls`) to explore and operate.

This works because: file systems are a proven abstraction models understand deeply; standard tools have predictable, documented behavior; the agent can chain primitives flexibly rather than being constrained to predefined workflows; and good documentation in files replaces summarization tools.
- **Reduction works when:** the data layer is well-documented and consistently structured; the model has enough reasoning capability; your specialized tools were constraining rather than enabling; you spend more time maintaining scaffolding than improving outcomes.
- **Reduction fails when:** underlying data is messy/inconsistent/poorly documented; the domain needs specialized knowledge the model lacks; safety constraints require limiting what the agent can do; operations are genuinely complex and benefit from structured workflows.
- **Anti-pattern:** building tools to "protect" the model — pre-filtering context, constraining options, wrapping interactions in validation logic. These guardrails become liabilities as models improve. For every tool, ask: is it **enabling new capabilities**, or **constraining reasoning** the model could handle on its own? Build minimal architectures that benefit from future model improvements.

**MCP naming requirement.** Always use fully qualified tool names `ServerName:tool_name`, or multi-server setups fail with "tool not found".
```python
# Correct: fully qualified names
"Use the BigQuery:bigquery_schema tool to retrieve table schemas."
"Use the GitHub:create_issue tool to create issues."
# Incorrect: unqualified — may fail with multiple servers
"Use the bigquery_schema tool..."
```

**Use agents to optimize tools.** Feed the tool spec plus observed failures to the model and let it diagnose and improve the description — a feedback loop. Production testing shows ~40% reduction in task completion time.
```python
def optimize_tool_description(tool_spec, failure_examples):
    """
    Use an agent to analyze tool failures and improve descriptions.
    Process:
    1. Agent attempts to use the tool across diverse tasks
    2. Collect failure modes and friction points
    3. Agent analyzes failures and proposes improvements
    4. Test improved descriptions against the same tasks
    """
    prompt = f"""
    Analyze this tool specification and the observed failures.

    Tool: {tool_spec}

    Failures observed:
    {failure_examples}

    Identify:
    1. Why agents are failing with this tool
    2. What information is missing from the description
    3. What ambiguities cause incorrect usage

    Propose an improved tool description that addresses these issues.
    """
    return get_agent_response(prompt)
```

## Example

**Well-designed tool** — name, parameter format, returns, and errors all present:
```python
def get_customer(customer_id: str, format: str = "concise"):
    """
    Retrieve customer information by ID.

    Use when:
    - User asks about specific customer details
    - Need customer context for decision-making
    - Verifying customer identity

    Args:
        customer_id: Format "CUST-######" (e.g., "CUST-000001")
        format: "concise" for key fields, "detailed" for complete record

    Returns:
        Customer object with requested fields

    Errors:
        NOT_FOUND: Customer ID not found
        INVALID_FORMAT: ID must match CUST-###### pattern
    """
```

**Poor tool** — a collection of anti-patterns:
```python
def search(query):
    """Search the database."""
    pass
```
Problems: vague name (search what?); missing parameters (which database? what query format?); no return description; no usage context; no error handling. Failure modes: agents call it when they should use a more specific tool, cannot determine the correct query format, cannot interpret results, and cannot recover from failures.

## Notes

- **Anti-patterns to avoid:** vague descriptions ("helps with…"), cryptic parameter names (`x` / `val` / `param1`), missing error handling, inconsistent naming (`id` here, `identifier` there, `customer_id` elsewhere).
- **Description as prompt:** tool descriptions are loaded into agent context and collectively steer behavior. They are not documentation — they are prompt engineering.
- **Defaults** should reflect common usage to reduce agent burden and prevent errors from omitted parameters.
- **Response format** significantly impacts context usage: `concise` returns essential fields only (for confirmation), `detailed` returns complete objects (for decisions); state in the description when to use which.
- **Error messages serve two audiences:** developers debugging and agents recovering. Give retry guidance for retryable errors, corrected format for input errors, and required content for missing data.
- **Tool count:** research shows description overlap confuses models — more tools is not better. Most applications use 10-20; beyond that, namespace, or use umbrella tools that route to sub-tools.
- **Evaluation criteria:** unambiguity, completeness, recoverability, efficiency, consistency — test by presenting representative requests and evaluating the resulting tool calls.

## See also

- context-fundamentals — how tools interact with context
- multi-agent-patterns — specialized tools per agent
- evaluation — methods for testing tool effectiveness
- External: MCP (Model Context Protocol) documentation, framework tool conventions, API design best practices for agents

---

Adapted from sickn33/antigravity-awesome-skills (MIT license), original by Agent Skills for Context Engineering Contributors.
