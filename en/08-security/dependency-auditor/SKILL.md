---
name: dependency-auditor
title: Dependency & Supply-Chain Auditor
description: Audit third-party dependencies for known vulnerabilities (CVEs), license risk, deprecated/suspicious packages, and supply-chain threats (typosquatting, malicious install scripts, unpinned versions) across npm/pip/go/cargo/maven.
domain: 安全/audit
triggers: [dependency audit, CVE, vulnerability scan, supply chain, SCA, license compliance, npm audit, osv-scanner, pip-audit, cargo audit, typosquat, deprecated package]
tags: [security, audit, dependencies, sca]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [supply-chain-risk-auditor, agent-skill-security-scanner, sast-configurator, oss-license-compliance]
combines_with: [supply-chain-risk-auditor, container-security-hardening, false-positive-check]
license: CC-BY-SA-4.0
source: 
source_license: 
---
## When to use

Use this skill to run a security/compliance checkup on third-party dependencies: scan for known vulnerabilities (CVEs), verify license compliance, identify deprecated/suspicious/hijacked packages, and assess supply-chain risk (typosquatting, malicious `postinstall` hooks, unpinned versions). Triggers: dependency audit, CVE, vulnerability scan, supply chain, SCA, license compliance.

**When NOT to use:**
- Auditing logic flaws in your own code (injection, broken auth) -> use `code-reviewer`; this skill only inspects dependencies.
- Just upgrading dependencies or resolving version conflicts with no security goal -> use your package manager's native commands.
- Runtime intrusion detection or secret-leak scanning -> out of scope.

## Steps

1. **Identify the ecosystem.** Locate the lockfile to determine the package manager and toolchain:
   - `package-lock.json` / `yarn.lock` / `pnpm-lock.yaml` -> npm
   - `requirements.txt` / `poetry.lock` / `uv.lock` -> pip
   - `go.sum` -> go
   - `Cargo.lock` -> cargo
   - `pom.xml` / `build.gradle` -> maven/gradle
2. **Require a lockfile.** If none exists, stop and prompt the user to generate one (`npm install` / `pip freeze` / `go mod tidy`). Without a lockfile, versions are not reproducible and audit conclusions are invalid.
3. **Run the vulnerability scan.** Use the ecosystem's native command (see Example). Prefer `--json` output for parsing.
4. **Triage by severity.** Sort by severity (critical/high/medium/low). By default only critical/high require remediation; list medium/low as backlog. Distinguish direct vs transitive dependencies.
5. **Filter for reachability.** Drop devDependencies-only findings, alerts with no reachable call path, and issues already covered by a vendored patch, to cut noise.
6. **License compliance.** List each dependency's license. Flag copyleft licenses (GPL/AGPL/LGPL) and unknown/no-license items in red; check them against the project's license policy for conflicts.
7. **Suspicious / deprecated packages.** Check for `deprecated` markers, long-unmaintained packages (>1-2 years with no release), sudden maintainer changes, install scripts (`postinstall` / `preinstall`), and names closely resembling well-known packages (typosquats).
8. **Give fixes.** For each critical/high finding, output the "minimum safe version to upgrade to", a "replacement package", or "remove"; note whether the upgrade is breaking (major).
9. **Output the report.** Structure: summary counts -> critical/high detail (with CVE id, affected versions, fixed version, dependency path) -> license risk -> suspicious packages -> recommended commands. Do not stuff low-severity noise into the summary.

## Example

Scan commands (pick by ecosystem):
```bash
# npm / yarn / pnpm
npm audit --json
pnpm audit --json
# python (pick one)
pip-audit -r requirements.txt -f json
osv-scanner --lockfile=poetry.lock --format=json
# go
govulncheck ./...
osv-scanner --lockfile=go.sum
# rust
cargo audit --json
# cross-ecosystem (recommended single entry point)
osv-scanner scan -r . --format=json
```

License inventory:
```bash
npx license-checker --json --summary      # node
pip-licenses --format=json                # python
go-licenses report ./...                  # go
```

Report snippet (minimum format):
```
Summary: critical 1 | high 2 | medium 4 (only top two tiers listed)
[CRITICAL] CVE-2024-XXXX  lodash@4.17.19  -> upgrade to 4.17.21
  path: app > a-lib > lodash (transitive)
[HIGH] ... fix: npm i pkg@2.3.1 (breaking, needs testing)
License risk: some-pkg@1.2.0 = GPL-3.0 (conflicts with project MIT; suggest replacement)
Suspicious: colour-string@0.0.1 (likely typosquat of color-string; has postinstall)
```

## Notes

- **Offline limitation.** Vulnerability databases need network access for the latest data. Offline, findings may be incomplete (false negatives); declare the database freshness/timestamp in the report.
- **Do not auto-upgrade.** This skill only advises. Breaking fixes like `npm audit fix --force` require human confirmation before running; major upgrades easily introduce regressions.
- **Transitive vulnerabilities.** The fix often lives in an indirect dependency; force the version via `overrides` / `resolutions` / `replace` rather than editing a direct dependency.
- **CVE != exploitable.** Combine reachability and runtime context to reduce noise; avoid over-alerting on unreachable vulnerabilities. But never silently ignore a critical.
- **Never execute suspicious package scripts.** During the audit, never run an unknown package's install scripts; analyze typosquat/malicious packages by static inspection, never `install`.
- **Multiple lockfiles / monorepo.** Scan each workspace, not just the repo root.
- Treat the scanner's live output as the source of truth for vulnerabilities and fix versions; never fill in CVE ids or versions from memory.

## See also

- related: `code-reviewer` — dependency auditing covers third-party package risk; code-reviewer covers flaws in your own code. The two are complementary in coverage.
- related: `supply-chain-risk-auditor`, `agent-skill-security-scanner`, `sast-configurator`, `oss-license-compliance`
- combines_with: `supply-chain-risk-auditor`, `container-security-hardening`, `false-positive-check`
