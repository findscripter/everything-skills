# Read a paper and check citations

[中文](README.zh.md) · [All examples](../README.md)

**Input:** the real *Attention Is All You Need*, [arXiv 1706.03762v7](https://arxiv.org/abs/1706.03762v7), an [original task](input/task.md), and an [intentionally flawed two-record citation draft](input/draft-citations.json). **Output:** an [original Chinese five-step reading guide](output/reading-guide.zh.md), [four sourced claim checks](output/claim-check.json), a [citation report](output/citation-check.json), and one [generated BibTeX record](output/references.bib).

## Skill order and copyable prompt

Read [academic-paper-explainer](../../09-verticals/academic-paper-explainer/SKILL.md), then [citation-management](../../01-documents/citation-management/SKILL.md). The full-text methods, results and limitations were actually read; DataCite metadata was retrieved and cross-checked against the arXiv record and NeurIPS proceedings page. See the exact [sources](output/sources.json).

```text
Read academic-paper-explainer, then citation-management as methodology
references for this teaching example. Limit inputs to the specified public
paper and original fixtures in examples/paper-reading/input; use only
examples/paper-reading/reproduce.mjs for reproducible checks. Do not execute
the absent Python helpers. This bounded substitution is not a complete run
of these skills on a real research project.
Read https://arxiv.org/html/1706.03762v7 and produce a concise Chinese guide:
one-sentence contribution, section walkthrough, faithful story, two formulas
with all symbols, and a critical appraisal. Distinguish training parallelism
from autoregressive inference. Check the reported table values against prose.
Validate examples/paper-reading/input/draft-citations.json against authoritative
metadata; correct fields, deduplicate by identity, generate BibTeX, cite sources,
and preserve unresolved differences. Do not reproduce the paper text or figures.
```

From the library root, offline:

```text
node examples/paper-reading/reproduce.mjs
```

Optional live metadata and accessibility check:

```text
node examples/paper-reading/reproduce.mjs --online
```

The online command needs network access and fails if a source is unavailable. It checks DataCite title/year/authors/DOI and the versioned arXiv record's HTTP status; it does not rerun full-text interpretation. `--write` regenerates the citation report/BibTeX; together with `--online` it records the online check. [Stored metadata](input/metadata.json) is a selected factual snapshot, not the full API response or paper.

The reading found source differences: NeurIPS abstract 27.5/41.1 BLEU, v7 abstract/Table 2 28.4/41.8, v7 section 6.1 EN-FR prose 41.0. The example records them instead of inventing a reconciliation. The reading guide is agent-authored; offline tests validate selected stored facts and citation normalization, not every scientific claim. There was no training, BLEU recomputation, systematic review, verification of every cited reference, or client installation test. Missing Python helper filenames in the citation skill were not executed; the example's own Node code generates BibTeX from verified metadata.
