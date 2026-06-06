---
name: prompt-template-designer
title: Prompt Template Designer
description: Use to design a stable, reusable prompt template (role / constraints / examples / output format) for a repeated task and iterate on it measurably; triggers: write a prompt, prompt template, prompt engineering, few-shot, output format.
domain: 智能/prompting
triggers: [write a prompt, prompt template, prompt engineering, few-shot, output format, system prompt design, design a prompt]
tags: [prompting, llm, templates]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: [first-principles-thinking]
related: [llm-prompt-optimizer, llm-prompt-caching, ai-engineering-toolkit]
combines_with: [claude-api, llm-judge-evaluation, vercel-ai-sdk]
license: CC-BY-SA-4.0
source: 
source_license: 
---
## When to use

Use this when you need to turn a prompt that will be run **repeatedly** into a **stable, reusable template** (role, constraints, examples, output format) and iterate on it in a comparable, regression-safe way.

**Use it when**: the same task runs many times / over many inputs, output structure must stay consistent, the prompt will be reused by a team or by multiple agents, you want few-shot examples to stabilize behavior, or you need to improve results without regressions.

**Don't use it when**: it's a one-off ad-hoc question (just write it — don't build a template); the task itself isn't clear yet (decompose the goal with `first-principles-thinking` first); the problem should be solved by retrieval / tools / code rather than prompting (e.g. fetching live data or exact computation); or you only need to tweak 1-2 words.

## Steps

```
1. Define the contract
   - Task goal (one sentence), input variable set {var1, var2...}, output schema (fields + types + constraints)
   - Success criteria: 3-5 verifiable acceptance checks (used later for evaluation)

2. Build the skeleton (fixed section order; omit unused sections rather than leaving them blank)
   [ROLE]     Role + capability boundary — the narrower the better
   [CONTEXT]  Background and known facts; use {var} placeholders at injection points
   [TASK]     Explicit action instruction — make it do ONE thing at a time
   [RULES]    Constraint list: must do / must not do / how to handle edge cases
   [FORMAT]   Output format: JSON schema / template string / field order; add "output X only, no explanation"
   [EXAMPLES] Few-shot: 2-4 input->output pairs covering normal + edge + easy-to-miss cases
   [INPUT]    {input to process} goes last

3. Placeholders and injection defense
   - Wrap every variable in an explicit placeholder {name}; fence user data with delimiters (e.g. <input>...</input>)
   - Separate instructions from data: user input must never rewrite RULES/FORMAT

4. Choose few-shot examples
   - Cover: a typical case + at least 1 edge case + 1 tricky/negative case (annotate the expected handling)
   - Example outputs must strictly conform to [FORMAT]; add examples from few to many — stop once stable

5. Evaluate and iterate (change ONE variable at a time)
   - Prepare 5-10 eval inputs (including known hard cases)
   - Run template -> score against success criteria -> locate failure modes
   - Patch by priority: tighten RULES first, then add/swap EXAMPLES, finally adjust ROLE/FORMAT
   - Record version and the diff for every change; keep a rollback-able version

6. Freeze
   - Once criteria pass, freeze as vN; record: variable list, output schema, known failure modes and how to avoid them
```

**Patch cheatsheet (failure mode -> action)**:
- Format drifts -> strengthen [FORMAT], add "output JSON only, no prefix/suffix", add one format example
- Misses edge cases / wrong on hard cases -> add the matching few-shot counter-example with annotated expected output
- Over-reaches / rambles -> narrow [ROLE]; in [RULES] add "if unknown, output null — do not guess"
- Hijacked by input -> strengthen instruction/data separation and delimiters
- Unstable / random -> lower randomness, add deterministic examples, make implicit rules explicit

## Example

Minimal viable template (sentiment classification, JSON output):

```
[ROLE] You are a short-text sentiment classifier. You only classify — no explanation, no continuation.
[TASK] Judge the sentiment of <input>.
[RULES]
- Allowed values only: positive | negative | neutral
- If sarcastic, judge by the true intent
- If information is insufficient or the text is non-sentiment -> neutral
- Output JSON only, no extra text
[FORMAT] {"label": "<positive|negative|neutral>", "confidence": <0-1, 2 decimals>}
[EXAMPLES]
Input: "Such 'attentive' service — waited two hours." -> {"label":"negative","confidence":0.88}
Input: "Intact packaging, delivered on time." -> {"label":"positive","confidence":0.80}
Input: "It will rain tomorrow." -> {"label":"neutral","confidence":0.90}
[INPUT]
<input>{user_text}</input>
```

To invoke, only substitute `{user_text}`. To evaluate, swap in different `<input>` over 5-10 cases and score on "value is legal / hard case correct / JSON only", then iterate.

## Notes

- **Single responsibility**: one template solves one class of task. For multi-task needs, split into multiple chained templates instead of stacking.
- **Instructions and data must be separated**: always put user content in a placeholder fenced by delimiters; RULES/FORMAT must not be rewritable by input — this prevents prompt injection.
- **Examples are the contract**: few-shot outputs must match [FORMAT] exactly; a wrong example directly pollutes the output.
- **Change one variable at a time**: otherwise you can't attribute the effect change. Keep a version per revision so you can roll back.
- **Don't mindlessly stack examples/constraints**: tokens cost money — stop once stable; redundant rules conflict with each other.
- **Cross-model portability is not guaranteed**: re-run evaluation when switching models; format-adherence varies widely.
- **Always leave an escape hatch**: explicitly define output for "insufficient info / cannot decide" (e.g. null / neutral) to keep the model from fabricating.

## See also

- requires: `first-principles-thinking` — before building a template, use it to clarify the task goal, the input/output contract, and the success criteria; otherwise the template will lock in the wrong problem definition.
- related: `llm-prompt-optimizer`, `llm-prompt-caching`, `ai-engineering-toolkit`
- combines with: `claude-api`, `llm-judge-evaluation`, `vercel-ai-sdk`
