---
name: research-idea-generator
title: Academic Research Skills Suite
description: Complete academic research skill suite covering the full pipeline: paper reading (read/explain papers with storytelling), idea generation (brainstorm research directions), experiment design (plan experiments, ablation, baselines), proof writing (mathematical proofs, LaTeX theorems), paper writing (draft to camera-ready for top venues like NeurIPS/ICLR/ACL), paper review (structured 4-step review with scoring), and professor fit analysis (evaluate advisors, cold emails, interview strategy). Trigger keywords: read paper, brainstorm, experiment design, prove, write paper, review, professor fit, advisor, cold email, LaTeX, research, NeurIPS, ICLR, ACL, arXiv, 讀論文, 寫論文, 審稿, 實驗設計, 數學證明, 研究方向, 教授分析, 選指導教授.
domain: 通用/research
triggers: [brainstorm, research proposal, novelty]
tags: [research, ideation, brainstorm, literature-review, academic, proposal]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [design-brainstorming, academic-paper-writer, scientific-database-lookup]
combines_with: [academic-paper-writer, nih-grant-finder, fact-checking]
license: MIT
source: voidful/academic-skills
source_license: MIT
---
# Academic Research Skills Suite

A complete suite of academic research Skills covering the full research workflow, from reading papers to writing them and reviewing submissions. Supports Claude Code, ChatGPT/Codex CLI, and Gemini CLI.

---

## Skill Routing Table

Based on the user's intent, load the corresponding sub-skill:

| Trigger condition | Sub-skill | Path | Description |
|----------|---------|------|------|
| Read a paper, explain a paper, paper reading, "I can't understand this paper" | Paper Reading | [paper-reading/SKILL.md](paper-reading/SKILL.md) | Guided paper walkthrough in a storytelling "grandma" persona (Traditional Chinese) |
| Come up with an idea, brainstorm, research direction, what to do next | Idea Generation | [idea-generation/SKILL.md](idea-generation/SKILL.md) | Three-stage ideation: diverge → search → converge |
| Experiment design, ablation, baseline, which experiments to run | Experiment Design | [experiment-design/SKILL.md](experiment-design/SKILL.md) | Experiment design and planning |
| Mathematical proof, prove, theorem, derivation | Proof Writer | [proof-writer/SKILL.md](proof-writer/SKILL.md) | Theoretical derivation and mathematical proofs |
| Write a paper, paper writing, improve my paper, LaTeX | Paper Writing | [paper-writing/SKILL.md](paper-writing/SKILL.md) | Paper writing (top-venue standards) |
| Review, refereeing, "what would a reviewer say", "can this paper get in" | Paper Review | [paper-review/SKILL.md](paper-review/SKILL.md) | 4-step academic review |
| Professor analysis, professor fit, choosing an advisor, cold email, application strategy | Professor Fit Analyser | [professor-fit-analyser/SKILL.md](professor-fit-analyser/SKILL.md) | Advisor fit analysis and application strategy |

**Guidance**: When the user's request matches one of the trigger conditions above, read the `SKILL.md` at the corresponding path and follow its instructions. If the user's needs span multiple skills, handle them in the order of the Pipeline below.

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

- **Default language**: Traditional Chinese (analysis, explanation, discussion)
- **English contexts**: LaTeX generation, formal review output, mathematical notation, and theorem names
- **Academic terminology**: Refer to [shared/chinese-academic-glossary.md](shared/chinese-academic-glossary.md) to ensure consistency

---

## Shared Resources

- [shared/chinese-academic-glossary.md](shared/chinese-academic-glossary.md) — Chinese–English academic terminology mapping
- [shared/conference-standards.md](shared/conference-standards.md) — Format standards for the major venues
- [shared/researcher-philosophies.md](shared/researcher-philosophies.md) — Researcher philosophies and writing styles

---

## Cross-Platform Installation

This suite conforms to the [Agent Skills open standard](https://agentskills.io/specification) and can be used on the following platforms:

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

### Generic approach
Simply copy this repository's directory into your AI agent's skills directory. The root `SKILL.md` serves as the entry point, and the agent will automatically discover all sub-skills via the `*/SKILL.md` pattern.
