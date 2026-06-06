---
name: academic-peer-reviewer
title: Academic Research Skills Suite
description: Complete academic research skill suite covering the full pipeline: paper reading (read/explain papers with storytelling), idea generation (brainstorm research directions), experiment design (plan experiments, ablation, baselines), proof writing (mathematical proofs, LaTeX theorems), paper writing (draft to camera-ready for top venues like NeurIPS/ICLR/ACL), paper review (structured 4-step review with scoring), and professor fit analysis (evaluate advisors, cold emails, interview strategy). Trigger keywords: read paper, brainstorm, experiment design, prove, write paper, review, professor fit, advisor, cold email, LaTeX, research, NeurIPS, ICLR, ACL, arXiv, 讀論文, 寫論文, 審稿, 實驗設計, 數學證明, 研究方向, 教授分析, 選指導教授.
domain: 领域/science
triggers: [peer review, meta-review]
tags: [academic, peer-review, paper-review, science, evaluation, scoring, meta-review]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [academic-paper-writer, academic-paper-explainer, scientific-manuscript-writing]
combines_with: [academic-paper-writer, guided-statistical-analysis]
license: MIT
source: voidful/academic-skills
source_license: MIT
---
# Academic Research Skills Suite

A complete suite of academic research Skills covering the entire research workflow, from reading papers to writing and peer review. Supports Claude Code, ChatGPT/Codex CLI, and Gemini CLI.

---

## Skill Routing Table

Based on the user's intent, load the corresponding sub-Skill:

| Trigger condition | Sub-Skill | Path | Description |
|----------|---------|------|------|
| read paper, explain paper, paper reading, I can't understand this paper | Paper Reading | [paper-reading/SKILL.md](paper-reading/SKILL.md) | Storytelling paper walkthrough |
| brainstorm an idea, brainstorm, research direction, what to do next | Idea Generation | [idea-generation/SKILL.md](idea-generation/SKILL.md) | Three-stage ideation: diverge → search → converge |
| experiment design, ablation, baseline, what experiments to run | Experiment Design | [experiment-design/SKILL.md](experiment-design/SKILL.md) | Experiment design and planning |
| mathematical proof, prove, theorem, derivation | Proof Writer | [proof-writer/SKILL.md](proof-writer/SKILL.md) | Theoretical derivation and mathematical proofs |
| write paper, paper writing, improve my paper, LaTeX | Paper Writing | [paper-writing/SKILL.md](paper-writing/SKILL.md) | Paper writing (top-venue standards) |
| review, peer review, what would a reviewer say, can this get in | Paper Review | [paper-review/SKILL.md](paper-review/SKILL.md) | 4-step academic peer review |
| professor analysis, professor fit, choosing an advisor, cold email, application strategy | Professor Fit Analyser | [professor-fit-analyser/SKILL.md](professor-fit-analyser/SKILL.md) | Advisor-fit analysis and application strategy |

**Guidance**: When the user's request matches one of the trigger conditions above, read the `SKILL.md` at the corresponding path and follow its instructions. If the user's needs span multiple Skills, process them in order according to the Pipeline below.

---

## Skill Pipeline

```
professor-fit-analyser ─┐
                        ↓
paper-reading ──→ idea-generation ──→ experiment-design
      │                                       │
      ↓                                       ↓
paper-review ←── paper-writing ←──── proof-writer
      │                 ↑
      └─────────────────┘  (revision cycle)
```

---

## Language Conventions

- **Default language**: English (for analysis, explanation, and discussion)
- **English-specific contexts**: LaTeX generation, formal review output, mathematical notation, and theorem names
- **Academic terminology**: Refer to [shared/chinese-academic-glossary.md](shared/chinese-academic-glossary.md) to ensure consistency

---

## Shared Resources

- [shared/chinese-academic-glossary.md](shared/chinese-academic-glossary.md) — Chinese–English academic terminology mapping
- [shared/conference-standards.md](shared/conference-standards.md) — Formatting standards for major top venues
- [shared/researcher-philosophies.md](shared/researcher-philosophies.md) — Researcher philosophies and writing styles

---

## Cross-Platform Installation

This suite complies with the [Agent Skills open standard](https://agentskills.io/specification) and can be used on the following platforms:

### Claude Code
```bash
# Option 1: Clone into the skills directory
git clone <repo-url> ~/.claude/skills/academic-research

# Option 2: Use within a project
git clone <repo-url> .claude/skills/academic-research
```

### ChatGPT / Codex CLI
```bash
git clone <repo-url> ~/.codex/skills/academic-research
# Or within a project
git clone <repo-url> .codex/skills/academic-research
```

### Gemini CLI
```bash
git clone <repo-url> ~/.gemini/skills/academic-research
# Or within a project
git clone <repo-url> .gemini/skills/academic-research
```

### Generic Method
Simply copy this repository's directory into your AI agent's skills directory. The root-level `SKILL.md` acts as the entry point, and the agent will automatically discover all sub-skills via the `*/SKILL.md` pattern.
