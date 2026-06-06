---
name: shellcheck-linting
title: ShellCheck Configuration and Static Analysis
description: Configure and run ShellCheck static analysis for shell scripts: install, write .shellcheckrc, fix SC-code warnings, suppress false positives, and wire into pre-commit and CI/CD. Use when linting shell scripts or fixing SC2086/SC2181/SC2015 and similar warnings; not for non-shell 
domain: 研发/devops
triggers: [shellcheck, .shellcheckrc, shell script lint / static analysis, SC2086 / SC2181 / SC2015 error codes, how to fix shell script warnings, integrate shellcheck into CI/CD, pre-commit hook to check scripts, suppress shellcheck false positives, shellcheck disable comment, POSIX portability check]
tags: [shellcheck, shell, bash, static-analysis, lint, code-quality, ci/cd, pre-commit, posix, devops]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [bash-defensive-patterns, posix-shell-scripting, powershell-windows, git-hooks-automation]
combines_with: [bash-defensive-patterns, git-hooks-automation, ci-cd-pipeline-builder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## When to use

Use this skill when:

- Setting up linting for shell scripts in CI/CD pipelines
- Analyzing existing shell scripts for issues
- Understanding ShellCheck error codes and warnings, and fixing them
- Configuring ShellCheck for specific project requirements (enabling/disabling checks)
- Integrating ShellCheck into development workflows (pre-commit, editors)
- Suppressing false positives and configuring rule sets
- Enforcing consistent code quality standards and migrating scripts to meet quality gates
- Ensuring cross-shell portability

Do NOT use this skill when:

- The task is unrelated to shell-script static analysis (e.g., runtime unit tests, performance/load testing)
- You need a linter for a different language/tool (Python `ruff`, JS `eslint`, etc.)
- You would treat ShellCheck output as a substitute for environment-specific validation — it is static analysis, not a replacement for real test runs and expert review

## Steps

1. Install ShellCheck and verify the version: `shellcheck --version`.
2. Drop a `.shellcheckrc` in the project root to pin the target shell dialect (`shell=bash` or `sh`) and centralize enable/disable flags.
3. Scan scripts locally, one at a time or in parallel, locating problems by their SC code.
4. Prefer fixing the code over blanket `disable`; when suppression is truly needed, add an inline comment that states the reason.
5. Wire it into a pre-commit hook (block before commit) and CI (gate before merge), using `--format=gcc`/`json` for machine parsing.

Decision rule: fix what can be fixed (quoting, checking exit codes directly with `if`, etc.); only disable rule-level false positives wholesale (e.g., SC1091 not following sourced files), and document the reason in the config.

## Example

### Installation

```bash
# macOS with Homebrew
brew install shellcheck

# Ubuntu/Debian
apt-get install shellcheck

# From source
git clone https://github.com/koalaman/shellcheck.git
cd shellcheck && make build && make install

# Verify installation
shellcheck --version
```

### .shellcheckrc (project root)

```
# Shell dialect to analyze against
shell=bash

# Enable optional checks
enable=avoid-nullary-conditions,require-variable-braces,check-unassigned-uppercase

# SC1091: Not following sourced files (many false positives)
disable=SC1091
# SC2119: Use function_name instead of function_name -- (arguments)
disable=SC2119

# External files to source for context
external-sources=true
```

Environment variables:

```bash
export SHELLCHECK_SHELL=bash         # default shell target
export SHELLCHECK_CONFIG=~/.shellcheckrc
```

### Command profiles

```bash
# Strict / portable (analyze as sh, follow sourced files)
shellcheck --shell=sh --external-sources --check-sourced script.sh

# Bash development (all checks + curated exclusions)
shellcheck --shell=bash --enable=all --exclude=SC1091,SC2119 script.sh

# CI gate: scan every .sh, fail on any issue
find . -type f -name "*.sh" -print0 | xargs -0 -P4 -n1 shellcheck --format=gcc
```

### Suppressing false positives (always state the reason; fix, don't disable, when possible)

```bash
# shellcheck disable=SC2086   # applies to the next line only
# shellcheck source=./helper.sh
source helper.sh
```

Output formats: `--format=gcc` (CI-friendly), `--format=json` (programmatic parsing), `--format=quiet` (exit code only).

### Pre-commit hook (`.git/hooks/pre-commit`, only changed scripts)

```bash
#!/bin/bash
set -e
git diff --cached --name-only | grep '\.sh$' | while read -r script; do
    if ! shellcheck "$script"; then
        echo "ShellCheck failed on $script"; exit 1
    fi
done
```

### GitHub Actions

```yaml
name: ShellCheck
on: [push, pull_request]
jobs:
  shellcheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run ShellCheck
        run: |
          sudo apt-get install shellcheck
          find . -type f -name "*.sh" -exec shellcheck {} \;
```

### GitLab CI

```yaml
shellcheck:
  stage: lint
  image: koalaman/shellcheck-alpine
  script:
    - find . -type f -name "*.sh" -exec shellcheck {} \;
  allow_failure: false
```

### Common violations and fixes

```bash
# SC2086  Double quote to prevent word splitting/globbing
for i in "${list[@]}"; do echo "$i"; done

# SC2181  Check the exit code directly with if
if some_command; then echo "success"; fi

# SC2015  Use if-then-else instead of && ||
if [ -f "$file" ]; then echo "exists"; else echo "not found"; fi

# SC2016  Expressions don't expand in single quotes
echo "Variable value: $VAR"

# SC2009  Use pgrep instead of grepping ps output
pgrep -f myprocess
```

### Parallel checking and result caching

```bash
# Parallel (faster than a sequential loop)
find . -name "*.sh" -print0 | xargs -0 -P4 -n1 shellcheck

# Hash-based cache: skip files whose content is unchanged
CACHE_DIR=".shellcheck_cache"; mkdir -p "$CACHE_DIR"
check_script() {
    local script="$1" hash cache_file
    hash=$(sha256sum "$script" | cut -d' ' -f1)
    cache_file="$CACHE_DIR/$hash"
    if [[ ! -f "$cache_file.ok" ]]; then
        shellcheck "$script" > "$cache_file" 2>&1 && touch "$cache_file.ok" || return 1
    fi
}
```

## Notes

- Always analyze against the target shell (don't analyze bash as sh), or you get false positives/negatives.
- Document every exclusion in the config with the reason; fix the code rather than silencing the warning whenever practical.
- `--enable=all` with careful exclusions gives the strictest checking; update ShellCheck regularly to pick up new checks.
- For large script sets, use `xargs -P` for parallelism or hash-cache results to speed up.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing — do not treat static results as a substitute for real test runs.
- Reference: ShellCheck repo https://github.com/koalaman/shellcheck ; Wiki (look up explanations by SC code) https://www.shellcheck.net/wiki/ .

## See also

- related: `bash-defensive-patterns` — defensive Bash coding; ShellCheck is the enforcing checker for it
- combines_with: `ci-cd-pipeline-builder` — wire script linting into pipeline gates
- combines_with: `git-hooks-automation` / pre-commit skills — block issues locally before push
- related: `posix-shell-scripting`, `powershell-windows`

---

Adapted from sickn33/antigravity-awesome-skills (MIT).
