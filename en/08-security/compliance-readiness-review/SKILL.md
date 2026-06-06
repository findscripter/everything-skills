---
name: compliance-readiness-review
title: Multi-Framework Compliance Readiness Review
description: Pressure-test any compliance program with six forcing questions before adopting a new framework, finalizing the annual audit calendar, or signing off certification readiness; produces a READY/STAGE-2/NOT-READY verdict plus Top-3 actions. Not for single-framework technical config 
domain: 安全/compliance
triggers: [compliance readiness, multi-framework audit, certification readiness sign-off, certification stage 1, annual audit calendar, mock audit, cross-framework evidence reuse, management review 9.3]
tags: [compliance, iso, security, audit, certification, evidence-management, risk-governance]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [soc2-compliance-preparer, iso27001-isms-implementer, iso42001-aims-specialist, gdpr-data-handling]
combines_with: [soc2-compliance-preparer, iso27001-isms-implementer, security-audit-toolkit]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## When to use

The multi-framework compliance officer pressure-tests any compliance program with six forcing questions before any **irreversible commitment or readiness sign-off**. Use it:

- Before adopting a new compliance framework
- Before finalizing the **annual audit calendar**
- Before certification stage 1 / stage 2 readiness sign-off
- Before management review (Clause 9.3 across frameworks)
- When evidence-collection effort has grown **50%+ year-over-year** (a smell)
- When an audit produced **> 15% critical findings**

**Do not use for:**

- Single-framework technical implementation or control configuration (use the dedicated skill, e.g. ISO 42001, ISO 27001, SOC 2).
- Routine evidence updates and inventory upkeep — no full interrogation needed.
- Non-readiness decisions such as novel-case legal review or cybersecurity strategy (see ## See also for routing).

## Steps

Answer the six questions in order. Each maps to one output action; a missing answer is a readiness gap.

1. **Have you named every applicable framework?** No framework selector run means no defensible scope. Run `framework_selector.py` with the company profile. Forgetting a framework means rebuilding the audit program later. Pay attention to industry-specific overlays (financial: NYDFS, FINMA; healthcare: HIPAA, ISO 13485; AI: ISO 42001 + EU AI Act).
2. **Where do the frameworks overlap, and what's the reuse leverage?** Single evidence -> N controls is the cornerstone of multi-framework efficiency. Run `cross_framework_mapper.py` with the enabled frameworks. Mapping confidence: HIGH = same evidence; MEDIUM = existing + overlay; LOW = new artefact. Without overlap analysis you'll collect the same access-review records 3 times.
3. **Who owns each artefact, and what's the reuse-leverage score?** Joint ownership without accountability is the most common cause of stale evidence. Run `evidence_pool_generator.py` for the artefact inventory. HIGH-leverage artefacts (≥ 5 mappings) get built first; each artefact needs **one** accountable owner. Stale evidence is an effective gap — even if the artefact existed historically.
4. **What's the audit calendar, and is auditor independence respected?** Surveillance audits stacking in the same week is a smell. Use the per-framework audit-plan tools (`aims_audit_scheduler`, `isms_audit_scheduler`, `audit_schedule_optimizer`). An auditor cannot audit their own work (Clause 9.2 across all ISO standards). For small teams: rotate auditors + use an occasional external auditor.
5. **What does a mock audit produce, and is the severity distribution healthy?** No mock audit, no readiness signal. Run `audit_simulator.py` with framework + scope. Healthy distribution: ≥ 40% observation, ≤ 15% critical. All-critical = destructive audit OR a genuinely failing program; all-observation = audit too superficial.
6. **What's the management review cadence across frameworks?** Each framework wants its own management review; an integrated review (per Annex SL) saves 5x exec time. Schedule **one quarterly cross-framework review** covering all enabled frameworks' Clause 9.3 inputs. Inputs: risk register changes, open nonconformities, audit findings, incidents, drift, KPIs. Outputs: action items, resource decisions, scope adjustments.

Run the scripts as needed (paths are relative to the original compliance-os project; adjust to your actual layout):

```bash
# 1. Framework selection
python ../../skills/compliance-os/scripts/framework_selector.py profile.json

# 2. Cross-framework overlap
python ../../skills/compliance-os/scripts/cross_framework_mapper.py program.json

# 3. Evidence pool consolidation
python ../../skills/compliance-os/scripts/evidence_pool_generator.py program.json

# 4. Mock audit (per framework)
python ../../skills/compliance-os/scripts/audit_simulator.py scope.json
```

Then emit the verdict report (see ## Example). Three verdicts: 🟢 READY | 🟡 STAGE-2-CANDIDATE | 🔴 NOT-READY.

## Example

```markdown
# Compliance Readiness: <program>
**Date:** YYYY-MM-DD

## The Decision Being Made
[framework-set | audit-calendar | certification-readiness | evidence-consolidation]

## Framework Set
- Applicable: <list>
- Binding (regulations): <count>
- Certifiable: <count>
- Missing dependencies: <list>

## Cross-Framework Overlap
- Total merged controls in scope: N
- High-leverage artefacts (≥ 5 mappings): M
- Top reuse opportunities: <top 5 artefacts>

## Evidence Pool
- Artefacts in catalog: N
- High-leverage count: M
- Stale evidence rate: X%
- Unowned artefacts: K

## Audit Calendar
- Frameworks scheduled this year: <list>
- Auditor independence respected: Y/N
- Conflicts: <list>

## Mock Audit Results (per framework)
- <framework>: total findings N, critical X%, observation Y%, healthy distribution: Y/N

## Verdict
🟢 READY | 🟡 STAGE-2-CANDIDATE | 🔴 NOT-READY

## Top 3 Actions
[3 concrete next steps with owners + dates]
```

## Notes

- **All six questions are mandatory:** if any one cannot be answered, treat it as a readiness gap and do not sign off readiness.
- Read the severity distribution at both ends: all-critical and all-observation are both bad signals — the former may mean the program is genuinely failing, the latter that the audit was too shallow.
- Build high-leverage evidence first (≥ 5 mappings) to avoid collecting the same kind of record repeatedly.
- For certification commitments with multi-year financial impact, "freeze" a cooling-off period before deciding (the original `/cs:freeze 30`).
- Script paths come from the source project; correct them to your actual script locations after migration. If the scripts are missing, use the six questions as a manual checklist.

## See also

- ISO 42001 (AIMS) specific forcing questions: `aims-audit`
- EU AI Act readiness: `ai-act-readiness`
- Cybersecurity strategy review: `ciso-review`
- Executive AI strategy review: `caio-review`
- Novel-case legal review: `gc-review`
- Decision logging / cooling-off freeze: `decide` / `freeze`
- Adjacent specialist skills: iso42001-specialist, eu-ai-act-specialist, information-security-manager-iso27001, soc2-compliance, gdpr-dsgvo-expert

---

Adapted from alirezarezvani/claude-skills (MIT License).
