---
name: autoresearch-optimization-agent
title: Autoresearch Optimization Agent Loop
description: Run an autonomous experiment loop that optimizes a single target file against a measurable metric — edit one variable, commit, run a fixed evaluation, keep improvements / git reset failures, and loop indefinitely. Triggers: optimize, benchmark, experiment loop, autoresearch.
domain: 智能/agents
triggers: [make this file faster/smaller/better, run an improvement loop with a measurable metric, run experiments overnight / on a schedule and keep the best, optimize prompts/headlines/copy for CTR or quality, get a metric from X to Y, autoresearch autonomous experiment optimization]
tags: [agent, experiment-optimization, automation-loop, git, eval-metrics, performance, prompt-optimization, autoresearch]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [autonomous-coding-agent-patterns, parallel-agent-hub, self-improving-memory-agent, llm-model-router]
combines_with: [llm-agent-benchmarking, git-worktrees-workflow, skill-optimizer]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## When to use

> You sleep. The agent experiments. You wake up to results.

Autonomous experiment loop inspired by [Karpathy's autoresearch](https://github.com/karpathy/autoresearch): the agent edits **one** file, runs a fixed evaluation, keeps improvements, discards failures, and loops indefinitely — so tiny gains compound. Not one guess, but fifty measured attempts.

Recognize these patterns from the user:
- "Make this faster / smaller / better" · "Optimize [file] for [metric]"
- "Improve my [headlines / copy / prompts]" · "Run experiments overnight" · "Get [metric] from X to Y"
- Any request involving: optimize, benchmark, improve, experiment loop, autoresearch

Decision rule: if the user can give you **a target file + a way to measure success** → this skill applies.

**Do NOT use when:**
- Success cannot be quantified (no single numeric metric tells good from bad).
- There is no reproducible evaluation command, or the eval command does not run.
- The target file is not in a git repo (no commit / reset → the loop loses its rollback floor).
- The task is a vague "big refactor" touching many places at once — the loop requires exactly one variable per iteration.
- It is purely an architecture/design decision — decide the design first, then optimize with this loop.

## Steps

**Proactive pre-flight checks (do before looping; flag problems unasked):**
1. Run the eval command once standalone — confirm it prints `metric_name: value`.
2. Target file not in git → `git init && git add . && git commit -m 'initial'` first.
3. Metric direction unclear → ask: is **lower** or **higher** better? Must know before starting.
4. Time budget too short → if the eval takes longer than the budget, every run crashes.

**First time — create the experiment** (the `--scope` flag decides where `.autoresearch/` lives):
- `project` (default) → `.autoresearch/` in repo root; definitions are git-tracked, results gitignored.
- `user` → `~/.autoresearch/` in the home directory; everything is personal.

```bash
# Engineering · optimize API speed (lower is better)
python scripts/setup_experiment.py \
  --domain engineering --name api-speed \
  --target src/api/search.py \
  --eval "pytest bench.py --tb=no -q" \
  --metric p50_ms --direction lower --scope project

# Content · optimize CTR (higher is better, LLM-judged)
python scripts/setup_experiment.py \
  --domain marketing --name medium-ctr \
  --target content/titles.md \
  --eval "python evaluate.py" \
  --metric ctr_score --direction higher \
  --evaluator llm_judge_content --scope user
```

Setup creates: `config.yaml`, `.gitignore`, and under `{domain}/{name}/` → `program.md` (objectives/constraints/strategy), `config.cfg` (target · eval cmd · metric · direction), `results.tsv` (experiment log, gitignored), and `evaluate.py` (when `--evaluator` is used). If `program.md` already exists, it overrides the template — only ask for what's missing.

**Before starting, read four things**, then checkout the branch:
1. `config.cfg` → `target`, `evaluate_cmd`, `metric`, `metric_direction`, `time_budget_minutes`
2. `program.md` → strategy, constraints, what you can / cannot change
3. `results.tsv` → history (columns: `commit | metric | status | description`)
4. `git checkout autoresearch/{domain}/{name}`

**Each iteration (you are the loop):**
1. Review `results.tsv` — what worked? what failed? what hasn't been tried?
2. Decide **ONE** change to the target file. One variable per experiment.
3. Edit the target file.
4. Commit: `git add {target} && git commit -m "experiment: {description}"`
5. Evaluate: `python scripts/run_experiment.py --experiment {domain}/{name} --single`
6. Read the output — it prints KEEP, DISCARD, or CRASH with the metric value.
7. Go to step 1.

**What the script handles (you don't):** running the eval command with a timeout, parsing the metric, comparing to the previous best, reverting the commit on failure (`git reset --hard HEAD~1`), and logging the result to `results.tsv`.

**Viewing results:**
```bash
python scripts/log_results.py --experiment engineering/api-speed   # single experiment
python scripts/log_results.py --domain engineering                 # whole domain
python scripts/log_results.py --dashboard                          # cross-experiment dashboard
python scripts/log_results.py --dashboard --format markdown --output dashboard.md
```

**Strategy escalation:** runs 1-5 = low-hanging fruit; 6-15 = systematic exploration (vary one parameter at a time); 16-30 = structural changes (algorithm/architecture swaps); 30+ = radical, completely different approaches; if no improvement in 20+ runs, update the Strategy section of `program.md`.

**Self-improvement:** every 10 experiments, review `results.tsv` for patterns and write them into `program.md` (e.g. "caching changes consistently improve by 5-10%", "pure refactors never move the metric") so future iterations reuse the knowledge.

**Stopping:** run until interrupted by the user, context limit reached, or the goal in `program.md` is met; ensure `results.tsv` is up to date before stopping. On context limit the next session can resume — `results.tsv` and the git log persist.

## Example

Custom evaluator — the only requirement is that it prints `metric_name: value` to stdout. **Never modify it after the experiment starts** (it is the single ground truth; changing it invalidates every historical comparison).

```python
#!/usr/bin/env python3
# My custom evaluator — DO NOT MODIFY after experiment starts
import subprocess
result = subprocess.run(["my-benchmark", "--json"], capture_output=True, text=True)
# Parse and output
print(f"my_metric: {parse_score(result.stdout)}")
```

Built-in evaluators — **Free** (no API cost): `benchmark_speed` (`p50_ms` ↓), `benchmark_size` (`size_bytes` ↓), `test_pass_rate` (`pass_rate` ↑), `build_speed` (`build_seconds` ↓), `memory_usage` (`peak_mb` ↓). **LLM-judge** (uses your subscription): `llm_judge_content` (`ctr_score` 0-10 ↑), `llm_judge_prompt` (`quality_score` 0-100 ↑), `llm_judge_copy` (`engagement_score` 0-10 ↑). LLM judges call the CLI you already run (Claude / Codex / Gemini); the evaluation prompt is locked inside `evaluate.py` so the agent cannot game its own evaluator.

Dashboard output:
```
DOMAIN       EXPERIMENT     RUNS  KEPT  BEST     Δ FROM START  STATUS
engineering  api-speed       47    14   185ms    -76.9%        active
marketing    medium-ctr      31    11   8.4/10   +68.0%        active
```

## Notes

- **One change per experiment.** Change 5 things and you won't know what worked.
- **Simplicity criterion.** A small improvement that adds ugly complexity is not worth it. Equal performance with simpler code is a win; removing code while keeping the same result is the best outcome.
- **Never modify the evaluator.** `evaluate.py` is the ground truth — modifying it invalidates all comparisons. Hard-stop if you catch yourself doing this.
- **Timeout = crash.** If a run exceeds 2.5× the time budget, kill it and treat it as a crash.
- **Crash handling.** Typo or missing import → fix and re-run. Fundamentally broken idea → revert, log "crash", move on. **5 consecutive crashes → pause and alert the user**; don't keep burning cycles.
- **No new dependencies.** Only use what's already in the project.
- **Also flag proactively:** no improvement in 20+ runs → suggest changing the `program.md` strategy or trying a different approach.

## See also

- **self-improving-agent** — improves an agent's own memory/rules over time. NOT for structured experiment loops.
- **senior-ml-engineer** — ML architecture decisions. Complementary: use for initial design, then this loop to optimize.
- **tdd-guide** — test-driven development. Complementary: the tests themselves can serve as the evaluation function.

---
Adapted from [alirezarezvani/claude-skills](https://github.com/alirezarezvani/claude-skills) (MIT license).
