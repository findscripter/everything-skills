# upstream-aliases

Canonical file: `upstream-aliases.jsonl` (concat of part1..part3 in order).

Parts exist only to allow staged git commits when single-file MCP payloads are size-capped; merge with:

```bash
cat data/upstream-aliases.part{1,2,3}.jsonl > data/upstream-aliases.jsonl
```
