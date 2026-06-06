---
name: fda-qsr-audit-prep
title: FDA QSR (21 CFR 820) Audit Prep
description: Use to pressure-test US medical-device QSR/QMSR evidence before an internal audit, FDA inspection readiness review, or Form 483 response, via a six-question forcing interrogation covering complaints/MDR, process validation, DHR, CAPA, labeling, and 483 closure; not for standalone
domain: 领域/medical
triggers: [FDA QSR audit, 21 CFR 820, Form 483 response, FDA inspection readiness, MDR reporting, QMSR compliance, 510(k) PMA pre-submission compliance, DHR sampling, CAPA effectiveness verification, medical device recall decision]
tags: [medical-device, fda, qsr, 21cfr820, qmsr, compliance-audit, form483, mdr, iso13485, regulatory-affairs]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [iso13485-qms-audit, fda-device-consultant, capa-root-cause-officer, quality-documentation-control]
combines_with: [capa-root-cause-officer, quality-documentation-control, iso13485-qms-audit]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
An FDA QSR auditor pressure-tests any US medical-device QSR/QMSR work. Run these six forcing questions before any internal audit, FDA inspection, Form 483 response, or recall decision. Since Feb 2026, QSR has become QMSR, substantially harmonized with ISO 13485 — but FDA-specific overlays (labeling, complaint handling, MDR, recall) remain.

## When to use

Use when making US-market medical-device QSR/QMSR compliance decisions and you need to stress-test the evidence chain from a real FDA investigator's point of view. Typical triggers:

- Before an annual internal QSR audit
- Before a pre-FDA-inspection readiness review (any device commercially distributed in the US)
- After receiving Form 483 observations
- After a Warning Letter receipt
- After an MDR-reportable event
- Before a recall decision (voluntary vs FDA-initiated)
- Before submitting a 510(k) / PMA (where QSR posture affects the approval timeline)

**Out of scope:**
- Standalone ISO 13485 audits (route to `iso13485-audit-prep`; this skill focuses on the FDA-specific overlay).
- Non-US-market devices with no US commercial distribution (no 21 CFR jurisdictional trigger).
- Clinical trial design or device engineering design technical reviews (not quality-system scope).
- Matters requiring legal opinion (Warning Letter responses, recall decisions, 510(k)/PMA strategy disputes) must route to outside counsel — this skill flags but does not replace it.

## Steps

Gather evidence for each of the six forcing questions; each maps to a high-frequency FDA citation clause:

1. **Complaints + MDR** (21 CFR 820.198 + 21 CFR 803 — most-cited FDA inspection area): pull complaint files from the last quarter and the corresponding MDR reports. Verify: complaint log complete (who / what / when / device / batch); investigation closed within a reasonable timeline; MDR-reporting decision tree applied (death OR serious injury OR malfunction-that-could-cause = MDR); 30-day timeline for most MDR reports, 5 days for certain serious events; complaint trending fed into management review.
2. **Process validation** (21 CFR 820.75, cross-walks ISO 13485 Clause 7.5.6): confirm when IQ/OQ/PQ was last revalidated. Verify: initial validation at process introduction; revalidation triggers (process / equipment / material change OR periodic schedule); statistical techniques per 21 CFR 820.250 where applicable.
3. **DHR (Device History Record)** (21 CFR 820.180): sample DHRs for products commercially distributed in the last 2 years. Retention is 2 years from commercial distribution. DHR must include: dates of manufacture, quantity manufactured, quantity released, acceptance records, primary identification label, device identification, control number. Stratify the sample by product class; verify DHR closeness to the DHF (design history file).
4. **CAPA** (21 CFR 820.100 = ISO 13485 8.5.2): sample CAPAs from the last 6 months with effectiveness verification. Verify: root cause analysis depth (5 Why minimum); effectiveness verification is measurable evidence, not "we updated the procedure"; containment / correction / corrective action distinction documented; closure approval by appropriate authority; aging CAPAs > 90 days flagged.
5. **Labeling** (21 CFR 801 — FDA-specific overlay not in ISO 13485): pull the labeling review for the most recent product launch. Verify: labeling per 21 CFR 801; for specific device types also 21 CFR 800-series sectoral overlays; UDI (Unique Device Identification) per 21 CFR 830; promotional materials reviewed for accuracy and non-misleading claims.
6. **Form 483 closure**: if a Form 483 was issued in the last 3 years, pull the closure status. A Form 483 is an FDA observation, not equivalent to an ISO nonconformity. Verify: response within 15 working days; each observation has documented corrective + preventive action with timeline; effectiveness verification evidence. Warning Letters run a separate response track and may require an FDA meeting.
7. After gathering evidence, summarize using the Output Format below, giving an INSPECTION-READY / GAPS-IDENTIFIED / NOT-READY verdict plus the Top 3 actions.

Run the companion scripts as needed (paths are relative to the source repo skill directory; confirm the input JSON is ready before running):

```bash
# 1. QSR compliance posture
python ../../ra-qm-team/skills/fda-consultant-specialist/scripts/qsr_compliance_checker.py compliance_state.json

# 2. FDA submission tracking (510(k) / PMA / IDE)
python ../../ra-qm-team/skills/fda-consultant-specialist/scripts/fda_submission_tracker.py submissions.json

# 3. HIPAA overlap (if connected device handles PHI)
python ../../ra-qm-team/skills/fda-consultant-specialist/scripts/hipaa_risk_assessment.py phi_inventory.json

# 4. Mock FDA inspection
python ../../skills/compliance-os/scripts/audit_simulator.py fda_qsr_scope.json
```

## Example

Output report skeleton (Markdown):

```markdown
# FDA QSR Audit Prep: <scope>
**Date:** YYYY-MM-DD

## The Decision Being Made
[programme-plan | inspection-readiness | 483-response | MDR-decision | recall]

## Complaint + MDR Posture
- Complaints last quarter: N
- MDR-reportable events: M
- MDR reports filed within timeline: % (target 100%)
- Complaint trending review at management level: yes/no

## Process Validation Status (21 CFR 820.75)
- Validations on schedule: %
- Stale validations: <list>
- Statistical techniques applied: yes/no per process

## DHR Completeness (21 CFR 820.180)
- DHRs sampled: N
- Completeness rate: %
- 2-year retention compliant: yes/no
- Stratified by product class: yes/no

## CAPA Health (21 CFR 820.100)
- CAPAs sampled: N
- Root cause analysis depth: adequate/inadequate
- Effectiveness verification: complete/incomplete
- Aging CAPAs > 90 days: N

## Labeling (21 CFR 801)
- Recent products reviewed: <list>
- Labeling accurate + non-misleading: yes/no
- UDI compliance per 21 CFR 830: yes/no

## Form 483 / Warning Letter History
- Form 483s last 3 years: N (each: closed/in-progress)
- Warning Letters last 5 years: N (each: closed/in-progress)
- Pattern across observations: <thematic>

## ISO 13485 Cross-Walk (post-Feb 2026 harmonization)
- ISO 13485 audit findings: <link to iso13485 output>
- FDA-specific overlays remaining: labeling + complaint handling + MDR reporting + recall procedures
- Cross-framework reuse: % of evidence shared

## Verdict
🟢 INSPECTION-READY | 🟡 GAPS-IDENTIFIED | 🔴 NOT-READY

## Top 3 Actions
[3 concrete next steps with owner + FDA-cited timeline (15 days / 30 days / etc.)]

## Outside Counsel Required
[For Warning Letter response, recall decisions, or 510(k) / PMA strategy disputes]
```

## Notes

- **Demand evidence, not narration:** the six questions force the other party to produce evidence, not describe procedures. Effectiveness verification in particular accepts only measurable evidence.
- **Timeline red lines are error-prone:** most MDR reports are 30 days, certain serious events 5 days; Form 483 response is 15 working days. Target 100% timeline compliance.
- **DHR retention:** 2 years from commercial distribution; always stratify the sample by product class and cross-check back to the DHF.
- **483 ≠ nonconformity:** a Form 483 is an FDA observation, not an ISO 13485 nonconformity, and runs a different track; Warning Letters run a separate track and may involve an FDA meeting.
- **Legal boundary:** Warning Letter responses, recall decisions, and 510(k)/PMA strategy disputes require outside counsel — this skill only flags the trigger conditions.
- **Harmonization dividend and residue:** since Feb 2026, substantially harmonized with ISO 13485, so much evidence is reusable; but labeling (801), complaint handling, MDR, and recall are FDA-specific overlays not covered by an ISO audit.

## See also

- iso13485-audit-prep — ISO 13485 cross-walk pair (substantially harmonized; evidence reusable)
- compliance-readiness — multi-framework compliance overview
- gdpr-audit-prep — when a connected device handles personal data
- Outside-counsel review — Warning Letter response coordination
- Companion expert skill: fda-consultant-specialist (provides the scripts above)

---

Adapted from alirezarezvani/claude-skills (MIT License).
