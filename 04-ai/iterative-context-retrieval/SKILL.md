---
name: iterative-context-retrieval
title: 反復検索パターン
description: サブエージェントのコンテキスト問題を解決するために、コンテキスト取得を段階的に洗練するパターン
domain: 智能/rag
triggers: []
tags: [rag]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [hybrid-search-retrieval, rag-implementation-workflow, query-decomposition-search, context-compression]
combines_with: [multi-agent-workflow-designer, context-window-management]
license: MIT
source: affaan-m/everything-claude-code
source_license: MIT
---
# Iterative Retrieval Pattern

Solves the "context problem" in multi-agent workflows: a subagent doesn't know which context it needs until it starts working.

## The Problem

Subagents are launched with limited context. They don't know:
- Which files contain the relevant code
- What patterns exist in the codebase
- What terminology the project uses

Standard approaches fail:
- **Send everything**: Exceeds the context limit
- **Send nothing**: The agent lacks critical information
- **Guess what's needed**: Often wrong

## The Solution: Iterative Retrieval

A four-phase loop that progressively refines the context:

```
┌─────────────────────────────────────────────┐
│                                             │
│   ┌──────────┐      ┌──────────┐            │
│   │ DISPATCH │─────│ EVALUATE │            │
│   └──────────┘      └──────────┘            │
│        ▲                  │                 │
│        │                  ▼                 │
│   ┌──────────┐      ┌──────────┐            │
│   │   LOOP   │─────│  REFINE  │            │
│   └──────────┘      └──────────┘            │
│                                             │
│        Up to 3 cycles, then continue         │
└─────────────────────────────────────────────┘
```

### Phase 1: DISPATCH

An initial broad query that gathers candidate files:

```javascript
// Start from the high-level intent
const initialQuery = {
  patterns: ['src/**/*.ts', 'lib/**/*.ts'],
  keywords: ['authentication', 'user', 'session'],
  excludes: ['*.test.ts', '*.spec.ts']
};

// Dispatch to the retrieval agent
const candidates = await retrieveFiles(initialQuery);
```

### Phase 2: EVALUATE

Assess the relevance of the retrieved content:

```javascript
function evaluateRelevance(files, task) {
  return files.map(file => ({
    path: file.path,
    relevance: scoreRelevance(file.content, task),
    reason: explainRelevance(file.content, task),
    missingContext: identifyGaps(file.content, task)
  }));
}
```

Scoring criteria:
- **High (0.8-1.0)**: Directly implements the target functionality
- **Medium (0.5-0.7)**: Contains related patterns or types
- **Low (0.2-0.4)**: Indirectly related
- **None (0-0.2)**: Not related, exclude

### Phase 3: REFINE

Update the search criteria based on the evaluation:

```javascript
function refineQuery(evaluation, previousQuery) {
  return {
    // Add new patterns discovered in high-relevance files
    patterns: [...previousQuery.patterns, ...extractPatterns(evaluation)],

    // Add terminology found in the codebase
    keywords: [...previousQuery.keywords, ...extractKeywords(evaluation)],

    // Exclude paths confirmed to be irrelevant
    excludes: [...previousQuery.excludes, ...evaluation
      .filter(e => e.relevance < 0.2)
      .map(e => e.path)
    ],

    // Target specific gaps
    focusAreas: evaluation
      .flatMap(e => e.missingContext)
      .filter(unique)
  };
}
```

### Phase 4: LOOP

Repeat with the refined criteria (up to 3 cycles):

```javascript
async function iterativeRetrieve(task, maxCycles = 3) {
  let query = createInitialQuery(task);
  let bestContext = [];

  for (let cycle = 0; cycle < maxCycles; cycle++) {
    const candidates = await retrieveFiles(query);
    const evaluation = evaluateRelevance(candidates, task);

    // Check whether we have enough context
    const highRelevance = evaluation.filter(e => e.relevance >= 0.7);
    if (highRelevance.length >= 3 && !hasCriticalGaps(evaluation)) {
      return highRelevance;
    }

    // Refine and continue
    query = refineQuery(evaluation, query);
    bestContext = mergeContext(bestContext, highRelevance);
  }

  return bestContext;
}
```

## Worked Examples

### Example 1: Bug-fix context

```
Task: "Fix the auth token expiration bug"

Cycle 1:
  DISPATCH: Search src/** for "token", "auth", "expiry"
  EVALUATE: Found auth.ts (0.9), tokens.ts (0.8), user.ts (0.3)
  REFINE: Add "refresh", "jwt" keywords; exclude user.ts

Cycle 2:
  DISPATCH: Search with refined terms
  EVALUATE: Found session-manager.ts (0.95), jwt-utils.ts (0.85)
  REFINE: Enough context (two high-relevance files)

Result: auth.ts, tokens.ts, session-manager.ts, jwt-utils.ts
```

### Example 2: Feature implementation

```
Task: "Add rate limiting to API endpoints"

Cycle 1:
  DISPATCH: Search routes/** for "rate", "limit", "api"
  EVALUATE: No matches - the codebase uses the term "throttle"
  REFINE: Add "throttle", "middleware" keywords

Cycle 2:
  DISPATCH: Search with refined terms
  EVALUATE: Found throttle.ts (0.9), middleware/index.ts (0.7)
  REFINE: Router pattern is needed

Cycle 3:
  DISPATCH: Search for "router", "express" patterns
  EVALUATE: Found router-setup.ts (0.8)
  REFINE: Enough context

Result: throttle.ts, middleware/index.ts, router-setup.ts
```

## Integrating with Agents

Use this in the agent prompt:

```markdown
When retrieving context for this task:
1. Start with a broad keyword search
2. Evaluate the relevance of each file (0-1 scale)
3. Identify what context is still missing
4. Refine the search criteria and repeat (up to 3 cycles)
5. Return files with relevance >= 0.7
```

## Best Practices

1. **Start broad, narrow gradually** - Don't over-specify the initial query
2. **Learn the codebase's terminology** - The first cycle often reveals naming conventions
3. **Track what's missing** - Explicit gap identification drives refinement
4. **Stop at "good enough"** - Three high-relevance files beat ten mediocre ones
5. **Exclude with confidence** - Low-relevance files won't become relevant

## See Also

- [The Longform Guide](https://x.com/affaanmustafa/status/2014040193557471352) - Subagent orchestration section
- The `continuous-learning` skill - For patterns that improve over time
- Agent definitions in `~/.claude/agents/`
