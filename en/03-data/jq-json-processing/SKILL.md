---
name: jq-json-processing
title: jq JSON Querying and Transformation
description: Use jq to query, filter, transform, and aggregate JSON from APIs/CLIs/logs and pipe structured results (CSV/TSV/raw) into shell workflows; not for writing files or non-JSON data. Triggers: jq, JSON parsing, JSON transformation.
domain: 数据/wrangling
triggers: [jq, JSON parsing, JSON filtering, JSON transformation, extract JSON fields, JSON to CSV, parse API JSON response, kubectl/aws/gh JSON output]
tags: [jq, json, shell, cli, data-transformation, bash]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [polars-dataframe, csv-data-cleaner, sql-query-builder]
combines_with: [csv-data-cleaner, polars-dataframe, matplotlib-visualization]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## When to use

`jq` is the standard CLI tool for querying and reshaping JSON. It takes a filter expression and applies it to JSON input; filters compose with pipes (`|`), and `jq` handles arrays, objects, strings, numbers, booleans, and `null` natively. Use this skill when:

- Parsing JSON output from APIs, CLI tools (AWS, GitHub, kubectl, docker), or log files.
- Transforming JSON structure: renaming keys, flattening arrays, grouping records, or building new objects.
- Embedding `jq` inside a bash script or one-liner.
- Explaining what a complex `jq` expression does.

Boundaries — do not use when:

- You need to write files or run commands — `jq` is read-only by design.
- The input is not JSON (plain text, CSV, YAML) — convert first, or use `awk`/`yq` instead.
- It is a substitute for environment-specific validation, testing, or expert review. Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.

## Steps

1. Probe the actual structure and field names first with `jq 'keys'` or `jq '.'` (JSON is case-sensitive).
2. Locate data with `.field`, `.[]`, `.[i]`, and compose filters stage by stage with the pipe `|`.
3. Filter with `select(...)`, transform with `map(...)` / `{...}`, aggregate with `add` / `group_by`.
4. Add `-r` to strip quotes when feeding shell variables or downstream commands; use `-c` for NDJSON pipelines.
5. Inject external variables only with `--arg` (strings) / `--argjson` (numbers, booleans, JSON) — never splice shell variables directly into the filter string.

### Filter reference

- **Selection / nesting:** `jq '.name'`, `jq '.user.email'`
- **Arrays:** index `jq '.[1]'`, slice `jq '.[2:4]'`, iterate `jq '.[]'`
- **Filtering:** `jq '[.[] | select(.role == "admin")]'`; multi-condition `select(.active == true and .score >= 80)`; non-null `select(.email != null)`
- **Mapping / transform:** `jq 'map(.name)'`, build object `jq '[.[] | {user: .name, years: .age}]'`, add field `jq '[.[] | . + {senior: (.age > 28)}]'`, rename keys `jq '[.[] | {username: .name, email_address: .email}]'`
- **Aggregation:** `jq 'add'`, `jq '[.[].price] | add'`, `jq 'length'`, `jq 'max_by(.score)'`, `jq 'min_by(.created_at)'`, `jq 'group_by(.status) | map({status: .[0].status, count: length})'`
- **reduce:** `jq 'reduce .[] as $x (0; . + $x)'`
- **Formatting (with `-r`):** interpolation `"\(.name) is \(.age)"`, `@csv`, `@tsv`, `@uri`, `@base64`
- **Keys & paths:** `jq 'keys'`, `jq 'has("email")'`, `jq 'del(.password)'`, recursive `jq '.. | .id? // empty'`, leaf paths `jq '[paths(scalars)]'`
- **Conditionals & error handling:** `if .score >= 90 then "A" elif .score >= 80 then "B" else "C" end`, fallback `.nickname // .name`, tolerant `try .nested.value catch null`
- **Multi-file / multi-line:** `jq -s '.' records.ndjson`, `jq -s 'add' file1.json file2.json`
- **Advanced:** `unique_by(.email)`, `flatten(1)`, `transpose`, `walk(if type == "string" then ascii_downcase else . end)`, `jq -n 'env.API_KEY'`

## Example

```bash
# Extract a field
echo '{"name":"alice","age":30}' | jq '.name'        # "alice"

# Nested access
echo '{"user":{"email":"a@b.com"}}' | jq '.user.email'

# Keep only matching elements
echo '[{"role":"admin"},{"role":"user"},{"role":"admin"}]' \
  | jq '[.[] | select(.role == "admin")]'

# Build a new object per element / add a computed field
jq '[.[] | {user: .name, years: .age}]'
jq '[.[] | . + {senior: (.age > 28)}]'

# Sum a field across objects
jq '[.[].price] | add'

# reduce: custom accumulator
echo '[1,2,3,4,5]' | jq 'reduce .[] as $x (0; . + $x)'   # 15

# Count per group
jq 'group_by(.status) | map({status: .[0].status, count: length})'

# Inject shell variables safely (string with --arg, number with --argjson)
STATUS="active"
jq --arg s "$STATUS" '[.[] | select(.status == $s)]'
jq --argjson threshold 42 '[.[] | select(.value > $threshold)]'

# Format as CSV (strip quotes with -r)
jq -r '.[] | [.name, .age, .email] | @csv'

# Compact output for NDJSON pipelines
jq -c '.[]' records.json | while IFS= read -r record; do
  echo "Processing: $record"
done

# Object of arrays -> array of objects
# Input: {"names":["a","b"],"scores":[10,20]}
jq '[.names, .scores] | transpose | map({name: .[0], score: .[1]})'

# Chaining with external CLIs
kubectl get pods -o json | jq '.items[] | {name: .metadata.name, status: .status.phase}'
gh pr list --json number,title | jq -r '.[] | "\(.number)\t\(.title)"'
aws ec2 describe-instances \
  | jq -r '.Reservations[].Instances[] | select(.State.Name=="running") | .InstanceId'
docker inspect $(docker ps -q) | jq -r '.[] | "\(.Name)\t\(.Config.Image)"'
```

## Notes

Best practices:

- Always use `-r` (raw output) when passing `jq` results to shell variables or other commands, to strip JSON string quotes.
- Use `--arg` / `--argjson` to inject shell variables safely — never interpolate shell variables directly into the filter string (prevents both injection and quoting bugs).
- Quote filters with single quotes in scripts (`jq '.field'`, not `jq ".field"`) so the shell does not expand them early.
- Prefer `map(f)` over `[.[] | f]` for readability; use `empty` to drop unwanted elements rather than filtering to `null`.
- Test filters interactively with `jq -n` and literal input before embedding in scripts.

Common pitfalls:

- Outputs `null` instead of the expected value: usually a typo in a key name — run `jq 'keys'` to inspect actual field names (JSON is case-sensitive).
- Numbers quoted as strings: use `--argjson` instead of `--arg` for numeric values.
- `add` returns `null` on an empty array: use `add // 0` or `add // ""` as a fallback.
- Streaming large files is slow: try `jq --stream`, or switch to `jstream` / `gron`.

Security & safety:

- `jq` is read-only by design — it cannot write files or execute commands.
- Avoid embedding untrusted JSON field values directly into shell commands; always quote or use `--arg`.

## See also

- `bash-pro` / `bash-linux` — wrapping jq calls in robust shell scripts and pipelines.
- `github-automation` — using jq with GitHub CLI JSON output.
