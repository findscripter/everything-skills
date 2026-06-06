---
name: security-diff-review
title: Differential Security Review
description: Security-focused review of a PR, commit range, or diff (not general code review) when changes touch auth, crypto, value transfer, external calls, or permissions — risk-classify, git-trace removed code, quantify blast radius, model attackers, and produce an evidence-backed markdow
domain: 安全/appsec
triggers: [diff security review, PR security review, commit range review, attack surface analysis, blast radius analysis, removed validation or permission code, auth and crypto change audit, git blame security regression]
tags: [security, code-review, diff, pr, threat-modeling, git, misc]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [code-reviewer, adversarial-code-reviewer, security-audit-toolkit, sast-configurator]
combines_with: [github-pr-comment-resolver, dependency-auditor]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## When to use

Use when:
- You need a **security-focused** review of a PR, commit range, or diff rather than a general code review.
- The changes touch **auth, crypto, external calls, value transfer, permissions, or other high-risk logic**.
- You need findings backed by **code evidence, attack scenarios, and an explicit report artifact**.

Do NOT use this skill (use standard code review instead) for:
- **Greenfield code** (no baseline to compare).
- **Documentation-only changes** (no security impact).
- **Formatting / linting** (cosmetic changes).
- **User explicitly requests a quick summary only** (they accept the risk).

## Steps

Core principles:
1. **Risk-First** — focus on auth, crypto, value transfer, external calls.
2. **Evidence-Based** — every finding backed by git history, line numbers, attack scenarios.
3. **Adaptive** — scale to codebase size (SMALL/MEDIUM/LARGE).
4. **Honest** — explicitly state coverage limits and confidence level.
5. **Output-Driven** — always generate a comprehensive markdown report file.

Workflow:
```
Pre-Analysis → Phase 0: Triage → Phase 1: Code Analysis → Phase 2: Test Coverage
    ↓              ↓                    ↓                        ↓
Phase 3: Blast Radius → Phase 4: Deep Context → Phase 5: Adversarial → Phase 6: Report
```

Scale effort by codebase size:

| Codebase Size | Strategy | Approach |
|---------------|----------|----------|
| SMALL (<20 files) | DEEP | Read all deps, full git blame |
| MEDIUM (20-200) | FOCUSED | 1-hop deps, priority files |
| LARGE (200+) | SURGICAL | Critical paths only |

Classify by risk, not size (Heartbleed was 2 lines):

| Risk Level | Triggers |
|------------|----------|
| HIGH | Auth, crypto, external calls, value transfer, validation removal |
| MEDIUM | Business logic, state changes, new public APIs |
| LOW | Comments, tests, UI, logging |

Decision tree — when starting a review:
- Need detailed phase-by-phase methodology? Read `methodology.md` (Pre-Analysis + Phases 0-4: triage, code analysis, test coverage, blast radius).
- Analyzing a HIGH RISK change? Read `adversarial.md` (Phase 5: attacker modeling, exploit scenarios, exploitability rating).
- Writing the final report? Read `reporting.md` (Phase 6: report structure, templates, formatting).
- Looking for specific vulnerability patterns? Read `patterns.md` (regressions, reentrancy, access control, overflow, etc.).
- Quick triage only? Use the Quick Reference above and skip the detailed docs.

Red flags — immediate escalation triggers (require adversarial analysis even in quick triage):
- Removed code from "security", "CVE", or "fix" commits.
- Access control modifiers removed (`onlyOwner`, `internal → external`).
- Validation removed without replacement.
- External calls added without checks.
- High blast radius (50+ callers) + HIGH risk change.

Rationalizations — do not skip:

| Rationalization | Why It's Wrong | Required Action |
|-----------------|----------------|-----------------|
| "Small PR, quick review" | Heartbleed was 2 lines | Classify by RISK, not size |
| "I know this codebase" | Familiarity breeds blind spots | Build explicit baseline context |
| "Git history takes too long" | History reveals regressions | Never skip Phase 1 |
| "Blast radius is obvious" | You'll miss transitive callers | Calculate quantitatively |
| "No tests = not my problem" | Missing tests = elevated risk rating | Flag in report, elevate severity |
| "Just a refactor, no security impact" | Refactors break invariants | Analyze as HIGH until proven LOW |
| "I'll explain verbally" | No artifact = findings lost | Always write report |

Quality checklist before delivering:
- [ ] All changed files analyzed
- [ ] Git blame on removed security code
- [ ] Blast radius calculated for HIGH risk
- [ ] Attack scenarios are concrete (not generic)
- [ ] Findings reference specific line numbers + commits
- [ ] Report file generated
- [ ] User notified with summary

## Example

Quick Triage (Small PR):
```
Input: 5 file PR, 2 HIGH RISK files
Strategy: Use Quick Reference
1. Classify risk level per file (2 HIGH, 3 LOW)
2. Focus on 2 HIGH files only
3. Git blame removed code
4. Generate minimal report
Time: ~30 minutes
```

Standard Review (Medium Codebase):
```
Input: 80 files, 12 HIGH RISK changes
Strategy: FOCUSED (see methodology.md)
1. Full workflow on HIGH RISK files
2. Surface scan on MEDIUM
3. Skip LOW risk files
4. Complete report with all sections
Time: ~3-4 hours
```

Deep Audit (Large, Critical Change):
```
Input: 450 files, auth system rewrite
Strategy: SURGICAL + audit-context-building
1. Baseline context with audit-context-building
2. Deep analysis on auth changes only
3. Blast radius analysis
4. Adversarial modeling
5. Comprehensive report
Time: ~6-8 hours
```

## Notes

Do:
- Start with git blame for removed code.
- Calculate blast radius early to prioritize.
- Generate concrete attack scenarios.
- Reference specific line numbers and commits.
- Be honest about coverage limitations.
- Always generate the output file.

Don't:
- Skip git history analysis.
- Make generic findings without evidence.
- Claim full analysis when time-limited.
- Forget to check test coverage.
- Miss high blast radius changes.
- Output the report only to chat (a file is required).

Limitations:
- Use this skill only when the task clearly matches the scope above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.

Supporting documentation (when available alongside the skill): `methodology.md` (Phases 0-4), `adversarial.md` (Phase 5), `reporting.md` (Phase 6), `patterns.md` (common vulnerability patterns). First-time users start with `methodology.md`; experienced users use the Quick Reference and Decision Tree.

## See also

- **audit-context-building skill** — Pre-Analysis: build baseline context; Phase 4: deep context on HIGH RISK changes.
- **issue-writer skill** — transform findings into formal audit reports: `issue-writer --input DIFFERENTIAL_REVIEW_REPORT.md --format audit-report`.
- General code review (`/code-review`, `/review`) — for non-security reviews.
- `/security-review` — security check of pending changes on the current branch.
