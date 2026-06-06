---
name: varlock-env-secrets-guard
title: Varlock Env Secrets Guard: Secure-by-Default Env Vars in Agent Sessions
description: Use Varlock (@dmno/varlock) to keep API keys, passwords, and tokens out of AI agent/Claude sessions, terminals, logs, and git diffs by declaring @sensitive/@type/@required in .env.schema, validating with varlock load, and injecting+redacting runtime values via varlock run. Trigge
domain: 安全/appsec
triggers: [varlock, redacted env, secrets not in logs, .env.schema, @dmno/varlock, varlock run, varlock load, env schema validation, session secret leak, secure-by-default env]
tags: [security, secrets, env, varlock, log-redaction, dotenv, ai-agent-security, credentials, appsec]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [env-secrets-hygiene, secrets-management, secrets-manager, insecure-defaults-detector]
combines_with: [agent-skill-security-scanner, security-diff-review]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
> Secure-by-default environment variable management for Claude Code / AI agent sessions, built on [Varlock](https://varlock.dev) (`@dmno/varlock`). Add a schema + automatic redaction layer over your `.env` so API keys, passwords, and tokens NEVER appear in terminal output, assistant context, log files, git diffs, or error messages.
>
> Repository: https://github.com/dmno-dev/varlock — Docs: https://varlock.dev

## When to use

- You need to work with environment variables or secrets in a Claude/agent session **without exposing their values**.
- The task involves validating, loading, or auditing secrets while keeping them out of logs, diffs, and assistant context.
- You want a secure-by-default workflow built around Varlock instead of direct `.env` inspection.
- You want an env "contract": which variables are required, what type, which are sensitive (redacted by default), validated at startup / in CI.

**Out of scope (negative boundaries):**
- Not a replacement for production-grade centralized secret stores (HashiCorp Vault / AWS Secrets Manager / dynamic short-lived credentials / HA / DR) — that is `secrets-management` / `secrets-manager`. Varlock covers local + runtime env injection and redaction.
- Not a post-hoc leak scanner (scanning git history, rotation emergency response) — see `env-secrets-hygiene`.
- Redaction is **one layer of defense-in-depth, not an absolute guarantee**: code that directly prints `process.env.X` can still leak. Pair it with discipline.

## Core principle: secrets never exposed

When working with an agent, secrets must NEVER appear in: terminal output, the assistant's input/output context, log files or traces, git commits or diffs, or error messages. This skill ensures sensitive data is properly protected.

### Security rules for the agent

```bash
# Rule 1 — Never echo secrets
# ❌ NEVER (exposes secret to the agent's context)
echo $CLERK_SECRET_KEY
cat .env | grep SECRET
printenv | grep API
# ✅ Validate without exposing
varlock load --quiet && echo "✓ Secrets validated"

# Rule 2 — Never read .env directly
# ❌ NEVER (exposes all secrets)
cat .env
less .env
# (Read tool on .env file)
# ✅ Read schema (safe), not values
cat .env.schema
varlock load          # shows masked values

# Rule 3 — Use Varlock for validation (masks in errors)
varlock load          # Output: API_KEY 🔐sensitive └ ▒▒▒▒▒

# Rule 4 — Never include secrets in commands (they land in shell history)
# ❌ curl -H "Authorization: Bearer sk_live_xxx" https://api.example.com
# ✅ Use an env var, or better, wrap with varlock run:
curl -H "Authorization: Bearer $API_KEY" https://api.example.com
varlock run -- curl -H "Authorization: Bearer $API_KEY" https://api.example.com
```

## Steps

1. **Install & initialize.** Install the Varlock CLI, then `varlock init` to create a `.env.schema` from an existing `.env`.
2. **Declare sensitivity & required.** In the schema header use `@defaultSensitive=true` so all values redact by default; override per-variable with `@type`, `@required`, and `@sensitive=false` for explicitly non-secret items (e.g. ports, public keys).
3. **Validate.** Run `varlock load` (or `varlock load --quiet` in CI) to confirm all required vars exist and types are valid; missing/invalid → non-zero exit.
4. **Inject at runtime.** Launch apps/scripts with `varlock run -- <cmd>` so Varlock injects validated env and redacts leaked secrets in stdout/stderr — instead of `export`ing and running bare.
5. **Session/log safety.** When debugging, do **not** `echo $SECRET` or `print(process.env.SECRET)`; inspect values via the masked `varlock load` view.
6. **Encrypt & commit (optional).** Commit `.env.schema` (and encrypted ciphertext if used) to version control; keep plaintext `.env` in `.gitignore`.

### Installation

```bash
# Install Varlock CLI
tmpdir="$(mktemp -d)"
trap 'rm -rf "$tmpdir"' EXIT
curl -sSfL https://varlock.dev/install.sh -o "$tmpdir/varlock-install.sh"
sed -n '1,160p' "$tmpdir/varlock-install.sh"   # review the installer before running
sh "$tmpdir/varlock-install.sh" --force-no-brew

# Add to PATH (~/.zshrc or ~/.bashrc)
export PATH="$HOME/.varlock/bin:$PATH"
varlock --version

# Or via npm
npm install -g @dmno/varlock   # or: npx varlock --help

# Initialize project: create .env.schema from existing .env
varlock init
```

### Schema file: `.env.schema`

Defines types, validation, and sensitivity per variable. `@decorator` is Varlock's core constraint syntax.

```bash
# Global defaults
# @defaultSensitive=true @defaultRequired=infer

# @type=enum(development,staging,production) @sensitive=false
NODE_ENV=development

# @type=port @sensitive=false
PORT=3000

# Database — SENSITIVE
# @type=url @required
DATABASE_URL=

# @type=string @required @sensitive
DATABASE_PASSWORD=

# API keys — SENSITIVE
# @type=string(startsWith=sk_) @required @sensitive
STRIPE_SECRET_KEY=

# @type=string(startsWith=pk_) @sensitive=false
STRIPE_PUBLISHABLE_KEY=
```

**Security annotations**

| Annotation | Effect | Use for |
|------------|--------|---------|
| `@sensitive` | Redacted in all output | API keys, passwords, tokens |
| `@sensitive=false` | Shown in logs | Public keys, non-secret config |
| `@defaultSensitive=true` | All vars sensitive by default | High-security projects |

**Type annotations**

| Type | Validates | Example |
|------|-----------|---------|
| `string` | Any string | `@type=string` |
| `string(startsWith=X)` | Prefix validation | `@type=string(startsWith=sk_)` |
| `string(contains=X)` | Substring validation | `@type=string(contains=+clerk_test)` |
| `url` | Valid URL | `@type=url` |
| `port` | 1–65535 | `@type=port` |
| `boolean` | true/false | `@type=boolean` |
| `enum(a,b,c)` | One of values | `@type=enum(dev,prod)` |

### Safe commands

```bash
# Validate (masks sensitive values)
varlock load
varlock load --quiet           # no output on success — good for CI
varlock load --env=production  # specific environment

# Run a command with injected, validated env (secrets available, never printed)
varlock run -- npm start
varlock run -- node script.js
varlock run -- pytest

# Schema is safe to read (no values)
cat .env.schema
grep "^[A-Z]" .env.schema       # list expected variables
```

### Code usage (Node SDK)

```js
import { load } from 'varlock';
const env = load();   // schema-validated; library avoids serializing sensitive values into logs
fetch(api, { headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}` } });
// Do NOT console.log(env.OPENAI_API_KEY); wrap the process with `varlock run` as a backstop.
```

## Example

Let the agent safely debug "why can't I connect to the database" **without leaking the password**:

```bash
# ❌ Dangerous: plaintext into terminal/session/logs
echo $DATABASE_URL

# ✅ Safe: masked view confirms the var exists and the type is right (value shows as ▒▒▒▒▒)
varlock load 2>&1 | grep DATABASE_URL

# ✅ Safe: actually start under redaction — connection errors won't expose the secret
varlock run -- node scripts/db-ping.js
```

**CI gate (fail red on missing/invalid vars)**

```yaml
# GitHub Actions — secrets sourced from GitHub Secrets
- name: Validate environment
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
    API_KEY: ${{ secrets.API_KEY }}
  run: varlock load --quiet
```

**Validate-before-operate pattern**

```bash
varlock load --quiet || { echo "❌ Environment validation failed"; exit 1; }
npm run build
```

**Handling secret-related requests**
- "Check if the API key is set" → `varlock load 2>&1 | grep API_KEY` (shows `✅ API_KEY 🔐sensitive └ ▒▒▒▒▒`), never `echo $API_KEY`.
- "Update a secret" → refuse to modify directly; ask the user to update `.env` or their secrets manager, then `varlock load` to validate. The agent may edit `.env.schema` to add new variables.
- "Show me the .env file" → refuse to read `.env`; offer `varlock load` (masked) or `cat .env.schema` instead.

**External secret sources (in `.env.schema`)**

```bash
# 1Password
# @type=string @sensitive
API_KEY=exec('op read "op://vault/item/field"')

# AWS Secrets Manager
# @type=string @sensitive
DB_PASSWORD=exec('aws secretsmanager get-secret-value --secret-id prod/db')

# Environment-specific value with fallback
# @type=url
API_URL=env('API_URL_${NODE_ENV}', 'http://localhost:3000')
```

## Notes

- **Redaction is a backstop, not absolution.** If you `console.log`/`print` a sensitive value yourself, or splice it into a URL and print that, it still leaks. Build the habit: inspect values only through the masked `varlock load` view; wrap processes with `varlock run`.
- Always `.gitignore` the plaintext `.env`. What goes into version control is `.env.schema` (structure contract, **no real values**) and — if encryption is used — ciphertext. Never plaintext.
- Don't put real credentials in placeholder/example values in `.env.schema`; `@example` is documentation only.
- Varlock owns local + runtime injection; the **production source of truth should be a secret store** (Vault / cloud Secret Manager), injected at CI/deploy time — not production secrets in a repo-distributed file.
- Type/required validation catches misspelled var names, missing values, and wrong types, but does NOT validate business correctness (whether a key is actually valid must be verified at runtime).
- **Hard rule for the agent:** under no circumstances output an unredacted secret in a reply, command echo, or written file; route every value through Varlock's masked channel.

**Troubleshooting**
- `varlock: command not found` → check `ls ~/.varlock/bin/varlock`; add to PATH or use the full path.
- `Schema validation failed` → run `varlock load` for detailed errors; add missing required vars, fix type mismatches, check string prefixes.
- "Sensitive value exposed in logs" → rotate the exposed secret immediately; ensure the schema has `@sensitive`; ensure you used `varlock` commands, not `echo`/`cat`.

**Security checklist for new projects:** install Varlock CLI · create `.env.schema` with all variables · mark all secrets `@sensitive` · add `@defaultSensitive=true` header · `.env` in `.gitignore` · commit `.env.schema` · add validation to CI/CD · document rotation · never `cat .env` or `echo $SECRET` in agent sessions.

## See also
- related `env-secrets-hygiene` — complementary: this skill does pre-leak prevention + validation; that one does post-hoc leak scanning + credential rotation response.
- related `insecure-defaults-detector` — detects insecure default configs including env/secrets.
- related `secrets-management` — production source of truth in Vault / cloud Secret Manager; Varlock handles local + runtime injection.
- combines_with `secrets-manager` — centralized store access/rotation, paired with Varlock's runtime redaction for an end-to-end solution.
- combines_with `agent-skill-security-scanner`, `security-diff-review` — scan agent skills and review security-relevant diffs.
- related `dependency-auditor` — audit dependency supply-chain risk alongside.

---

Adapted from sickn33/antigravity-awesome-skills (MIT). Original skill source dmno-dev/varlock and wrsmith108/varlock-claude-skill; tool Varlock = `@dmno/varlock`.
