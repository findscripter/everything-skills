---
name: agent-skill-security-scanner-v2
title: Skill Security Scanner v2: Detect Prompt Injection & Malicious Code Before Adoption
description: Use before trusting/installing a third-party agent skill: run a static scan plus manual review to detect prompt injection, malicious code, over-broad permissions, secret exposure, and supply-chain risk, producing a report with findings, confidence, risk level, and an adoption rec
domain: 安全/audit
triggers: [scan skill security, detect prompt injection before adoption, review third-party skill, skill malicious code detection, audit over-broad skill permissions, supply chain risk assessment]
tags: [security, prompt-injection, supply-chain, code-audit, agent-skills, static-scan, misc]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [agent-skill-security-scanner, agent-plugin-audit, skill-ecosystem-auditor, ai-system-security-audit]
combines_with: [dependency-auditor, supply-chain-risk-auditor]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## When to use

- **Before trusting and installing a third-party agent skill**, when you need to evaluate whether it contains prompt injection, malicious code, over-broad permissions, secret exposure, or supply-chain risk.
- When you want a combined "static scan plus manual review" workflow for a skill directory to decide whether it is safe enough to trust in an agent environment.
- When you need to batch-scan every skill in a repository (all `*/SKILL.md` files).

**Out of scope:**

- Not a general vulnerability audit of your own application code (that is a standard SAST / code-review task).
- Not runtime protection or sandboxing — this skill only performs offline, pre-adoption evaluation; it does not intercept attacks at runtime.
- If a scan target, permission boundary, or success criteria is missing, stop and confirm with the user rather than scanning blindly.

**Important:** Run all scripts from the repository root using the full path via `${CLAUDE_SKILL_ROOT}`.

## Steps

**Phase 1 — Input & Discovery.** Determine the scan target:

- If the user provides a skill directory path, use it directly.
- If the user names a skill, look for it under `plugins/*/skills/<name>/` or `.claude/skills/<name>/`.
- If the user says "scan all skills", discover all `*/SKILL.md` files and scan each.

Validate the target contains a `SKILL.md` and list its structure:

```bash
ls -la <skill-directory>/
ls <skill-directory>/references/ 2>/dev/null
ls <skill-directory>/scripts/ 2>/dev/null
```

**Phase 2 — Automated Static Scan.** Run the bundled scanner and parse its JSON output (findings, URLs, structure info, severity counts) as leads for deeper analysis. The script catches patterns mechanically — evaluating intent and filtering false positives is your job.

```bash
uv run ${CLAUDE_SKILL_ROOT}/scripts/scan_skill.py <skill-directory>
```

> **Fallback:** If the script fails, proceed with manual analysis using the Grep patterns from the reference files.

**Phase 3 — Frontmatter Validation.** Read the SKILL.md and check: `name` and `description` are present; `name` matches the directory name; review `allowed-tools` (is Bash justified? are tools unrestricted via `*`?); is a specific model forced, and why; does the description accurately represent what the skill does.

**Phase 4 — Prompt Injection Analysis.** Load `references/prompt-injection-patterns.md`. For each scanner finding in the "Prompt Injection" category: read the surrounding context, then determine whether the pattern is **performing** injection (malicious) or **discussing/detecting** injection (legitimate). **Critical distinction:** a security, testing, or educational skill that lists injection patterns in its references is documenting threats, not attacking — only flag patterns that would execute against the agent running the skill.

**Phase 5 — Behavioral Analysis** (agent-only, no pattern matching). Read the full instructions and evaluate:

- **Description vs. instructions alignment:** a skill described as "code formatter" that instructs the agent to read `~/.ssh` is misaligned.
- **Config/memory poisoning:** instructions to modify `CLAUDE.md`, `MEMORY.md`, `settings.json`, `.mcp.json`, or hook configs; adding itself to allowlists or auto-approving permissions; writing to `~/.claude/`.
- **Scope creep:** instructions exceeding the stated purpose, unnecessary data gathering, or installing other skills/plugins/dependencies not mentioned.
- **Information gathering:** reading environment variables beyond what is needed, listing directories outside scope, accessing git history/credentials/user data unnecessarily.

**Phase 6 — Script Analysis** (if a `scripts/` directory exists). Load `references/dangerous-code-patterns.md` and **read each script fully (do not skip any)**. Check "Malicious Code" findings for: data exfiltration (what data is sent to external URLs), reverse shells (sockets with redirected I/O), credential theft (reading SSH keys / .env / env tokens), dangerous execution (eval/exec with dynamic input, `shell=True` with interpolation), and config modification. Verify PEP 723 `dependencies` are legitimate, well-known packages, and that script behavior matches the SKILL.md description. **Legitimate patterns:** `gh`/`git` calls, reading project files, JSON output to stdout.

**Phase 7 — Supply Chain Assessment.** Review all URLs. Trusted: GitHub, PyPI, official docs. Untrusted: unknown domains, personal sites, URL shorteners (flag for review). **High risk:** any URL fetching content to be executed or interpreted as instructions; runtime download-and-execute of binaries/code; references to packages not on standard registries.

**Phase 8 — Permission Analysis.** Load `references/permission-analysis.md` for the tool risk matrix. Evaluate least privilege — are all granted tools actually used by the instructions? Example tiers: `Read Grep Glob` → Low (read-only analysis); `Read Grep Glob Bash` → Medium (Bash needs justification, e.g. running bundled scripts); `Read Grep Glob Bash Write Edit WebFetch Task` → High (near-full access).

### Confidence levels (report only what qualifies)

| Level | Criteria | Action |
|-------|----------|--------|
| **HIGH** | Pattern confirmed + malicious intent evident | Report with severity |
| **MEDIUM** | Suspicious pattern, intent unclear | Note as "Needs verification" |
| **LOW** | Theoretical, best practice only | Do not report |

**False positive awareness is critical.** The biggest risk is flagging a legitimate security skill as malicious because it references attack patterns — always evaluate intent before reporting.

**Risk level determination:**
- **Critical** — any high-confidence critical finding (prompt injection, credential theft, data exfiltration).
- **High** — high-confidence high-severity findings, or multiple medium findings.
- **Medium** — medium-confidence findings or minor permission concerns.
- **Low** — only best-practice suggestions.
- **Clean** — no findings after thorough analysis.

## Example

After scanning a skill directory, produce the report using this template:

```markdown
## Skill Security Scan: [Skill Name]

### Summary
- **Findings**: X (Y Critical, Z High, ...)
- **Risk Level**: Critical / High / Medium / Low / Clean
- **Skill Structure**: SKILL.md only / +references / +scripts / full

### Findings

#### [SKILL-SEC-001] [Finding Type] (Severity)
- **Location**: `SKILL.md:42` or `scripts/tool.py:15`
- **Confidence**: High
- **Category**: Prompt Injection / Malicious Code / Excessive Permissions / Secret Exposure / Supply Chain / Validation
- **Issue**: [What was found]
- **Evidence**: [code snippet]
- **Risk**: [What could happen]
- **Remediation**: [How to fix]

### Needs Verification
[Medium-confidence items needing human review]

### Assessment
[Safe to install / Install with caution / Do not install]
[Brief justification for the assessment]
```

## Notes

- The script performs deterministic pattern matching only — **evaluating intent and filtering false positives must be done by you.**
- Phase 5 (Behavioral Analysis) has no script to lean on and is the key step for catching description-vs-instructions misalignment, config poisoning, and scope creep. Do not skip it.
- Do not treat this skill's output as a substitute for environment-specific validation, testing, or expert review.
- Use this skill only when the task clearly matches the scope above; if required inputs, permissions, safety boundaries, or success criteria are missing, stop and ask for clarification first.

## See also

- `references/prompt-injection-patterns.md` — injection patterns, jailbreaks, obfuscation techniques, and the false-positive guide.
- `references/dangerous-code-patterns.md` — script security patterns: exfiltration, reverse shells, credential theft, eval/exec.
- `references/permission-analysis.md` — tool risk tiers, least-privilege methodology, and common skill permission profiles.

---

Adapted from sickn33/antigravity-awesome-skills (MIT).
