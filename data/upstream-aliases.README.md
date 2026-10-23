# upstream-aliases.jsonl

Canonical map of high-confidence local→upstream skill ID aliases (2026-09-16 cleanup + ambiguous-12 resolution).

**160** alias mapping lines (144 original + 16 in part4: 8 singles + 5 makepad multi + 3 smb multi). Published files: [part1](upstream-aliases.part1.jsonl), [part2](upstream-aliases.part2.jsonl), [part3](upstream-aliases.part3.jsonl), [part4](upstream-aliases.part4.jsonl). Read those files directly, or assemble an optional local output (the combined file is not tracked or published):

```bash
cat data/upstream-aliases.part1.jsonl \
    data/upstream-aliases.part2.jsonl \
    data/upstream-aliases.part3.jsonl \
    data/upstream-aliases.part4.jsonl \
  > data/upstream-aliases.jsonl
```

Each line: `local_name`, `local_path`, `upstream_repo`, `upstream_id`, `upstream_path`, `match_reason`.

`multi_alias` locals (`makepad-rust-ui`, `smb-quarterly-business-review`) appear as **multiple lines** (same `local_name`/`local_path`, different `upstream_id`/`upstream_path`).
