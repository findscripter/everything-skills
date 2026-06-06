---
name: iso13485-qms-implementer
title: ISO 13485 QMS Implementation
description: Use to implement or maintain an ISO 13485:2016 quality management system for medical device organizations: gap analysis, quality manual and mandatory procedures, document/record control, internal audit, process validation (IQ/OQ/PQ), supplier qualification, CAPA, and certificatio
domain: 领域/medical
triggers: [ISO 13485, QMS implementation, quality management system, document control, internal audit, management review, quality manual, CAPA process, process validation, design control, supplier qualification, quality records]
tags: [medical-device, quality-management, iso13485, compliance, audit, capa, process-validation, supplier-management]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [iso13485-qms-audit, iso14971-risk-management, quality-documentation-control, fda-device-consultant]
combines_with: [iso14971-risk-management, quality-documentation-control, capa-root-cause-officer]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## When to use

Use this skill to implement, maintain, and prepare for certification of an ISO 13485:2016 Quality Management System (QMS) in a medical device organization:

- Build or continuously maintain an ISO 13485:2016 QMS from scratch (gap analysis through certification).
- Prepare for ISO 13485 certification audits, internal audits, or external/regulatory audits.
- Establish core processes: document control, record control, internal audit, CAPA, process validation, supplier qualification.
- Author the Quality Manual (scope with justified exclusions), mandatory documented procedures, and work instructions.

**Out of scope:**
- Generic (non-medical-device) quality systems — use ISO 9001 or another general framework, not the device-specific clauses here.
- Clinical evaluation or device registration submissions themselves (e.g., NMPA / FDA 510(k) / CE technical documentation) — this skill covers only the QMS that supports those activities.
- One-off document polishing or translation with no bearing on clause conformity.

**QMS document hierarchy (4 levels):**

| Level | Document Type | Example |
|-------|---------------|---------|
| 1 | Quality Manual | QM-001 |
| 2 | Procedures | SOP-02-001 |
| 3 | Work Instructions | WI-06-012 |
| 4 | Records | Training records |

## Steps

### 1. QMS Implementation Workflow (gap analysis → certification)

1. Conduct gap analysis against ISO 13485:2016 requirements; document current state vs. required state for each clause.
2. Prioritize gaps by: regulatory criticality, risk to product safety, resource requirements.
3. Develop an implementation roadmap with milestones.
4. Establish the Quality Manual per Clause 4.2.2: QMS scope with justified exclusions, process interactions, procedure references.
5. Create the required documented procedures (see the Mandatory Documented Procedures table in the Example section).
6. Deploy processes with training.
7. **Validation:** Gap analysis complete; Quality Manual approved; all required procedures documented and trained.

### 2. Document Control Workflow (Clause 4.2.3)

1. Identify need for a new document or revision.
2. Assign a document number per the numbering convention: `[TYPE]-[AREA]-[SEQUENCE]-[REV]`, e.g., `SOP-02-001-01`.
3. Draft the document using the approved template.
4. Route for review to subject matter experts (SMEs); collect and address review comments.
5. Obtain required approvals based on document type.
6. Update the Document Master List.
7. **Validation:** Document numbered correctly; all reviewers signed; Master List updated.

**Numbering prefix and approval authority:**

| Prefix | Document Type | Approval Authority |
|--------|---------------|-------------------|
| QM | Quality Manual | Management Rep + CEO |
| POL | Policy | Department Head + QA |
| SOP | Procedure | Process Owner + QA |
| WI | Work Instruction | Supervisor + QA |
| TF | Template/Form | Process Owner |
| SPEC | Specification | Engineering + QA |

**Area codes:** 01 Quality Management / 02 Document Control / 03 Training / 04 Design / 05 Purchasing / 06 Production / 07 Quality Control / 08 CAPA.

**Change control levels:** Administrative (typos/formatting → Document Control); Minor (clarifications → Process Owner + QA); Major (process changes → full review cycle); Emergency (safety issues → expedited + retrospective approval).

### 3. Internal Audit Workflow (Clause 8.2.4)

**Annual audit program:** cover all processes → set frequency by risk (previous findings, regulatory/process changes, complaint trends) → assign qualified, independent auditors → develop annual schedule → obtain management approval → communicate to process owners → track completion.

**Individual audit execution:**
1. Prepare an audit plan with scope, criteria, and schedule.
2. Notify the auditee a minimum of 1 week prior.
3. Review procedures and previous audit results; prepare an audit checklist.
4. Conduct the opening meeting.
5. Collect evidence through document review, record sampling, process observation, and personnel interviews.
6. Classify findings: Major NC (absence/breakdown of system), Minor NC (single lapse/deviation), Observation (risk of future NC).
7. Conduct the closing meeting; issue the audit report within 5 business days.

**Finding classification and response time:** Major NC (system absence, total breakdown, regulatory violation) → CAPA within 30 days; Minor NC (single instance, partial compliance) → CAPA within 60 days; Observation → track in next audit.

### 4. Process Validation Workflow (Clause 7.5.6)

For special processes whose output cannot be verified by inspection and whose deficiencies appear only in use (sterilization, welding, sealing, software): form a validation team → write a validation protocol (process description and parameters, equipment and materials, acceptance criteria, statistical approach) → execute **IQ** (Installation Qualification) → **OQ** (Operational Qualification, verify parameter ranges and process control) → **PQ** (Performance Qualification, verify output under production conditions) → write the validation report. **Validation:** IQ/OQ/PQ complete; acceptance criteria met; report approved.

**Revalidation triggers:** Equipment change → assess impact, revalidate affected phases; Parameter change → OQ and PQ minimum; Material change → PQ minimum; Process failure → full revalidation; Periodic → typically every 3 years.

**Special process standards (examples):** EO sterilization ISO 11135; steam sterilization ISO 17665; radiation sterilization ISO 11137; sealing/packaging ISO 11607.

### 5. Supplier Qualification Workflow (Clause 7.4)

Categorize (A Critical / affects safety-performance, B Major / affects quality, C Minor / indirect impact) → request quality certifications and quality history → evaluate by quality system / technical capability / quality history / financial stability → for Category A, conduct an on-site audit + quality agreement → calculate qualification score → decide (>80 Approved; 60-80 Conditional; <60 Not approved) → add to the Approved Supplier List (ASL).

**Scoring weights:** Quality System 30% (ISO 13485=30 / ISO 9001=20 / Documented=10 / None=0); Quality History 25% (reject rate <1%=25 / 1-3%=15 / >3%=0); Delivery 20%; Technical Capability 15%; Financial Stability 10%.

## Example

**Scenario: a medical device startup pursuing first-time ISO 13485 certification.**

1. Use a Gap Analysis Matrix to record, clause by clause, current state / gap / priority / action.
2. Justify exclusions in the Quality Manual (Clause 4.2.2), e.g., does not design products → exclude 7.3; no sterile products → exclude 7.5.5; no installation activities → exclude 7.5.4.
3. Establish the 6 mandatory procedures (below) plus Quality Manual QM-001.
4. Run IQ/OQ/PQ validation for special processes such as EO sterilization.
5. Qualify critical suppliers (on-site audit for Category A) and add to the ASL.
6. Run the annual internal audit; open a CAPA within 30 days for any Major NC; close the loop, then apply for the certification audit.

**Mandatory documented procedures (6):**

| Procedure | Clause | Key Elements |
|-----------|--------|--------------|
| Document Control | 4.2.3 | Approval, distribution, obsolete control |
| Record Control | 4.2.4 | Identification, retention, disposal |
| Internal Audit | 8.2.4 | Program, auditor qualification, reporting |
| NC Product Control | 8.3 | Identification, segregation, disposition |
| Corrective Action | 8.5.2 | Root cause, implementation, verification |
| Preventive Action | 8.5.3 | Risk identification, implementation |

**Audit checklist generator** (bundled script) — generate checklists by clause or process:

```bash
python qms_audit_checklist.py --help
# Clause-specific checklist
python qms_audit_checklist.py --clause 7.3
# Process-based checklist
python qms_audit_checklist.py --process design-control
# Full system audit checklist
python qms_audit_checklist.py --audit-type system
```

Supports text/JSON output formats and an interactive guided-selection mode.

## Notes

- **Auditor independence is a hard constraint:** auditors must not audit their own work area; they require ISO 13485 awareness + auditor training, at least 1 audit as an observer, and an understanding of the audited process.
- **CAPA initiation criteria:** safety-related complaint / external- or internal-audit Major NC / field failure / process deviation with safety impact → automatic CAPA; all others (Minor NC, repeat minor deviations, trend exceeding threshold) → evaluate, then decide.
- **Management review inputs (Clause 5.6.2) must be complete:** audit results, customer feedback, process performance, product conformity, CAPA status, follow-up on previous actions, changes affecting the QMS, recommendations for improvement.
- **Record retention** (some per 21 CFR 820): Device Master Record / Device History Record / Design History File / Complaint Records = life of device + 2 years; Training Records = employment + 3 years; Audit and CAPA records = 7 years; Calibration records = equipment life + 2 years.
- **Nonconforming product disposition decision tree:** can be reworked → rework per SOP (or create rework procedure); cannot be reworked but usable as is → concession approval (customer approval + MRB where required); otherwise scrap or return to supplier.

## See also

- `quality-manager-qmr` — management review and quality policy (Management Representative duties).
- `capa-officer` — CAPA system management.
- `qms-audit-expert` — advanced audit techniques.
- `quality-documentation-manager` — DHF / DMR / DHR documentation management.
- `risk-management-specialist` — ISO 14971 risk management integration.

---

*Adapted from [alirezarezvani/claude-skills](https://github.com/alirezarezvani/claude-skills) (MIT License).*
