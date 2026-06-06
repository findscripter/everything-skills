---
name: click-path-state-audit
title: /click-path-audit — 行動フロー監査
description: ユーザー向けボタン/タッチポイントを完全な状態変更シーケンスを通して追跡し、機能が個別に機能するが互いにキャンセルされたり、間違った最終状態を生成したり、UIを矛盾した状態にしたままにするバグを見つけます。次の場合に使用します：体系的なデバッグがバグを見つけたが、ユーザーは壊れたボタンを報告する場合、または共有状態ストアに触れる主要なリファクター後。
domain: 研发/testing
triggers: [Zustand, Redux]
tags: [click-path-audit, state-management, side-effects, race-condition, ui-bug, testing]
level: advanced
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [systematic-debugger, systematic-debugging-strategies, webapp-testing, react-state-management]
combines_with: [playwright-e2e-testing, bug-hunter, react-state-management]
license: MIT
source: affaan-m/everything-claude-code
source_license: MIT
---
# /click-path-audit — Action Flow Audit

Find bugs that static code reading misses: side effects from state interactions, race conditions between ordered calls, and handlers that silently cancel each other out.

## The Problem This Solves

Traditional debugging checks:
- Does the function exist? (missing wiring)
- Does it crash? (runtime errors)
- Does it return the right type? (data flow)

But it does **not** check:
- **Does the final UI state match what the button label promised?**
- **Does function B silently undo what function A just did?**
- **Does shared state (Zustand/Redux/context) have a side effect that cancels the intended operation?**

Real example: a "New Email" button called `setComposeMode(true)` and then `selectThread(null)`. Both worked individually. But `selectThread` had a side effect that reset `composeMode: false`. The button did nothing. Of 54 bugs found through systematic debugging — this one was missed.

---

## How It Works

For every interactive touchpoint in the target area:

```
1. Identify the handler (onClick, onSubmit, onChange, etc.)
2. Trace every function call in the handler **in order**
3. For **each** function call:
   a. Which state does it read?
   b. Which state does it write?
   c. Does it have side effects on shared state?
   d. Does it reset/clear state as a side effect?
4. Check: does a later call undo a state change from an earlier call?
5. Check: does the final state match what the user expects from the button label?
6. Check: are there race conditions (async calls resolving in the wrong order)?
```

---

## Execution Steps

### Step 1: Map the State Stores

Before auditing any touchpoint, build a side-effect map of every state store action:

```
For each Zustand store / React context in scope:
  For each action/setter:
    - Which fields does it set?
    - Does it reset other fields as a side effect?
    - Document: actionName → {sets: [...], resets: [...]}
```

This is a critical reference. The "New Email" bug was invisible without knowing that `selectThread` resets `composeMode`.

**Output format:**
```
STORE: emailStore
  setComposeMode(bool) → sets: {composeMode}
  selectThread(thread|null) → sets: {selectedThread, selectedThreadId, messages, drafts, selectedDraft, summary} RESETS: {composeMode: false, composeData: null, redraftOpen: false}
  setDraftGenerating(bool) → sets: {draftGenerating}
  ...

DANGEROUS RESETS (actions that clear state they don't own):
  selectThread → resets composeMode (owned by setComposeMode)
  reset → resets everything
```

### Step 2: Audit Each Touchpoint

For each button/toggle/form submit in the target area:

```
TOUCHPOINT: [button label] in [Component:line]
Handler: [the complete sequence of function calls]
Final state: [what this is supposed to achieve]
```

For details, refer to the documentation.
