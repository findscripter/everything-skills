# upstream-aliases.jsonl

Canonical map of high-confidence local→upstream skill ID aliases (2026-09-16 cleanup).

**144** lines. Assemble from parts (already on this branch):

```bash
cat data/upstream-aliases.part1.jsonl \
    data/upstream-aliases.part2.jsonl \
    data/upstream-aliases.part3.jsonl \
  > data/upstream-aliases.jsonl
```

Each line: `local_name`, `local_path`, `upstream_repo`, `upstream_id`, `upstream_path`, `match_reason`.
