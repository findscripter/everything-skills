---
name: cloud-misconfig-auditor
title: cloud-misconfig-auditor
description: Use when assessing cloud infrastructure for security misconfigurations pre- or post-deployment: IAM privilege-escalation paths, S3 public exposure, open security-group rules, and IaC security gaps. Cloud security posture assessment (CSPM) across AWS/Azure/GCP with severity-ranked
domain: 安全/ops
triggers: [cloud security audit, cloud misconfiguration, CSPM posture assessment, IAM privilege escalation, iam:PassRole escalation, S3 public exposure, public S3 bucket check, security group open ports, 0.0.0.0/0 inbound, SSH/RDP exposed, IaC security scan, Terraform security check, CloudFormation security, least-privilege audit, AWS/Azure/GCP security baseline]
tags: [security, ops, cloud-security, cspm, iam, s3, security-group, iac, terraform, aws, azure, gcp, mitre-attack, compliance]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [aws-penetration-testing, cloud-penetration-testing, k8s-security-policies, container-security-hardening]
combines_with: [aws-penetration-testing, k8s-security-policies, terraform-specialist]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
Cloud security posture assessment (CSPM) skill for detecting IAM privilege escalation, public storage exposure, network configuration risks, and infrastructure-as-code misconfigurations. The core tool is `cloud_posture_check.py`, which runs `iam` / `s3` / `sg` checks and emits, for each finding, a severity level, a MITRE ATT&CK mapping, and a least-privilege remediation suggestion. This is NOT incident response for active cloud compromise (see incident-response) or application vulnerability scanning (see security-pen-testing) — it is systematic cloud configuration analysis to prevent exploitation.

## When to use

Use it for:
- Pre-deployment security review of newly provisioned resources before they go live.
- Periodic posture checks of production IAM policies, S3 buckets, and security groups.
- A deployment gate in CI/CD that blocks misconfigurations from reaching production.
- Multi-cloud baseline checks (AWS full; Azure / GCP partial).

Do NOT use it (negative boundaries):
- Cloud environment is confirmed compromised and needs containment/forensics — use incident-response.
- Hunting attacker behavior or anomaly detection in logs — use threat-detection.
- Actively exploiting discovered weaknesses — use security-pen-testing / red-team.

How this skill differs from other security skills:

| Skill | Focus | Approach |
|-------|-------|----------|
| cloud-misconfig-auditor (this) | Cloud configuration risk | Preventive — assess before exploitation |
| incident-response | Active cloud incidents | Reactive — triage confirmed compromise |
| threat-detection | Behavioral anomalies | Proactive — hunt attacker activity in logs |
| security-pen-testing | Application vulnerabilities | Offensive — actively exploit found weaknesses |

Prerequisites: read access to IAM policy documents, S3 bucket configurations, and security-group rules in JSON. For continuous monitoring, integrate with cloud provider APIs (AWS Config, Azure Policy, GCP Security Command Center).

## Steps

1. **Collect configs.** Export the resources under review with the cloud CLI (IAM policy documents, S3 ACL + public access block, security-group rules) as JSON.
2. **Run checks.** Run `cloud_posture_check.py` against each config with the matching `--check`, emitting `--json`. The tool auto-detects check type from the config structure or accepts explicit `--check` flags.
3. **Decide by exit code.** 0 = no high/critical (no action); 1 = high (remediate within 24h); 2 = critical (remediate immediately, escalate to incident-response if actively exploited).
4. **Apply severity modifiers.** Add `--severity-modifier internet-facing` for directly internet-accessible resources; add `--severity-modifier regulated-data` for workloads carrying PCI/HIPAA/GDPR data. Both bump each finding's severity by one level.
5. **Remediate.** For each high/critical finding, tighten permissions per the tool's `least_privilege_suggestion`; record the business justification before removing a permission so it is not silently re-added.
6. **Gate deploys.** Wire the check into CI/CD; block deployment on exit code 2.

Exit codes:

| Code | Meaning | Required Action |
|------|---------|-----------------|
| 0 | No high/critical findings | No action required |
| 1 | High-severity findings | Remediate within 24 hours |
| 2 | Critical findings | Remediate immediately — escalate to incident-response if active |

**IAM privilege-escalation patterns** (a single action is not dangerous; the combination is the escalation, so analyze the full Statement, not individual actions):

| Pattern | Severity | Key Action Combination | MITRE |
|---------|----------|------------------------|-------|
| Lambda PassRole escalation | Critical | iam:PassRole + lambda:CreateFunction | T1078.004 |
| EC2 instance profile abuse | Critical | iam:PassRole + ec2:RunInstances | T1078.004 |
| CloudFormation PassRole | Critical | iam:PassRole + cloudformation:CreateStack | T1078.004 |
| Self-attach policy escalation | Critical | iam:AttachUserPolicy + sts:GetCallerIdentity | T1484.001 |
| Inline policy self-escalation | Critical | iam:PutUserPolicy + sts:GetCallerIdentity | T1484.001 |
| Policy version backdoor | Critical | iam:CreatePolicyVersion + iam:ListPolicies | T1484.001 |
| Credential harvesting | High | iam:CreateAccessKey + iam:ListUsers | T1098.001 |
| Group membership escalation | High | iam:AddUserToGroup + iam:ListGroups | T1098 |
| Password reset attack | High | iam:UpdateLoginProfile + iam:ListUsers | T1098 |
| Service-level wildcard | High | iam:* or s3:* or ec2:* | T1078.004 |

IAM severity essentials: `Action=* and Resource=*` full-admin wildcard = Critical; `Principal: '*'` public principal = Critical; any two-action escalation combo = Critical; data-exfiltration actions (`s3:GetObject`, `secretsmanager:GetSecretValue` on `*`) = High; `service:*` wildcard = High.

**S3 check matrix:** `public-read-write` ACL or bucket policy `"Principal":"*"` + Allow = Critical; `public-read`/`authenticated-read`, any of the four public-access-block flags missing/false, or no default encryption = High; non-standard SSEAlgorithm = Medium.

**Security groups:** inbound open to internet CIDRs (`0.0.0.0/0`, `::/0`) — 22 (SSH) / 3389 (RDP) / all ports (0–65535) = Critical (restrict to VPN CIDR or use Session Manager / Fleet Manager; remove all-traffic rules); database ports 1433/3306/5432/27017/6379/9200 = High (allow only from the application-tier SG and move to a private subnet).

**Cloud provider coverage:** AWS = Full for IAM escalation, storage public access, network exposure, and IaC (Terraform/CloudFormation). Azure = Partial (RBAC/service principals, Blob SAS/container access, NSG rules, ARM/Bicep). GCP = Partial (IAM bindings/workload identity, GCS bucket IAM/uniform access, VPC firewall, Deployment Manager).

## Example

Run the tool (auto-detects check type or set `--check` explicitly):

```bash
# Analyze an IAM policy for privilege escalation paths
python3 scripts/cloud_posture_check.py policy.json --check iam --json

# Assess S3 bucket configuration for public access
python3 scripts/cloud_posture_check.py bucket_config.json --check s3 --json

# Check security group rules for open admin ports
python3 scripts/cloud_posture_check.py sg.json --check sg --json

# Run all checks with internet-facing severity bump
python3 scripts/cloud_posture_check.py config.json --check all \
  --provider aws --severity-modifier internet-facing --json

# Regulated data context (bumps severity by one level for all findings)
python3 scripts/cloud_posture_check.py config.json --check all \
  --severity-modifier regulated-data --json

# Pipe IAM policy from AWS CLI
aws iam get-policy-version --policy-arn arn:aws:iam::123456789012:policy/MyPolicy \
  --version-id v1 | jq '.PolicyVersion.Document' | \
  python3 scripts/cloud_posture_check.py - --check iam --json
```

Recommended S3 baseline (all four public-access-block flags must be enabled at BOTH bucket level and account level, or bucket-level settings can override account-level):

```json
{
  "PublicAccessBlockConfiguration": {
    "BlockPublicAcls": true,
    "BlockPublicPolicy": true,
    "IgnorePublicAcls": true,
    "RestrictPublicBuckets": true
  },
  "ServerSideEncryptionConfiguration": {
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "aws:kms",
        "KMSMasterKeyID": "arn:aws:kms:region:account:key/key-id"
      },
      "BucketKeyEnabled": true
    }]
  },
  "ACL": "private"
}
```

Terraform IAM policy — critical finding vs. clean:

```hcl
# BAD: Will generate critical findings
resource "aws_iam_policy" "bad_policy" {
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = "*"
      Resource = "*"
    }]
  })
}

# GOOD: Least privilege
resource "aws_iam_policy" "good_policy" {
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["s3:GetObject", "s3:PutObject"]
      Resource = "arn:aws:s3:::my-specific-bucket/*"
    }]
  })
}
```

CI/CD deployment gate (validate IaC before `terraform apply`; critical findings block):

```bash
terraform show -json plan.json | \
  jq '[.resource_changes[].change.after | select(. != null)]' > resources.json
python3 scripts/cloud_posture_check.py resources.json --check all --json
if [ $? -eq 2 ]; then
  echo "Critical cloud security findings — blocking deployment"
  exit 1
fi
```

## Notes

- Analyze the full Statement, not individual actions: `iam:PassRole` alone is not critical, but with `lambda:CreateFunction` it is a confirmed escalation path.
- Enforce public access block at both account level AND bucket level: a bucket-level setting can override an account-level one, so account-level alone is insufficient.
- Always apply `--severity-modifier internet-facing` for public/internet-facing resources (DMZ, load balancers, API gateways) — high findings there should be treated as critical, never optional.
- Do not check only administrator policies: escalation chains often originate from non-admin policies that combine innocuous-looking permissions. Check every policy attached to production identities.
- Do root-cause analysis before remediating: removing a permission without understanding why it was granted leads to re-addition. Record the business justification first.
- Service accounts are frequently over-provisioned during development and never trimmed for production — audit them against AWS Access Analyzer or equivalent to find and remove unused permissions.
- Always use `--severity-modifier regulated-data` for workloads with PHI or cardholder data.
- Full CSPM check reference: `references/cspm-checks.md`; detection script: `scripts/cloud_posture_check.py`.

## See also

- incident-response — critical findings (public S3, confirmed-active escalation) may trigger incident classification.
- threat-detection — posture findings create hunting targets; over-permissioned roles are likely lateral-movement destinations.
- red-team — red team exercises specifically test exploitability of the cloud misconfigurations found in posture assessment.
- security-pen-testing — posture findings feed into the infrastructure security section of pen test assessments.
