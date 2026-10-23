# 随包资源来源

资源取自 `K-Dense-AI/scientific-agent-skills` 的固定提交 `93124850ef08487e423165554c54f0b333d5631d`。这是 2026-10-23 补齐资源时核对的版本，不能据此推定原正文的采编提交。

- 原技能：[固定源文件](https://github.com/K-Dense-AI/scientific-agent-skills/blob/93124850ef08487e423165554c54f0b333d5631d/skills/bulk-rnaseq/SKILL.md)
- 资源许可证：`MIT`；全文见 [UPSTREAM-LICENSE.txt](UPSTREAM-LICENSE.txt)。
- 资源字节未改；没有执行上游脚本、安装依赖或调用模型。
- 完整路径、SHA-256 和每文件固定源链接见仓库 `data/skill-resources.json`。

## 文件

- [references/counts-and-handoff.md](https://github.com/K-Dense-AI/scientific-agent-skills/blob/93124850ef08487e423165554c54f0b333d5631d/skills/bulk-rnaseq/references/counts-and-handoff.md)
- [references/design-and-qc.md](https://github.com/K-Dense-AI/scientific-agent-skills/blob/93124850ef08487e423165554c54f0b333d5631d/skills/bulk-rnaseq/references/design-and-qc.md)
- [references/upstream-manual.md](https://github.com/K-Dense-AI/scientific-agent-skills/blob/93124850ef08487e423165554c54f0b333d5631d/skills/bulk-rnaseq/references/upstream-manual.md)
- [references/upstream-nfcore.md](https://github.com/K-Dense-AI/scientific-agent-skills/blob/93124850ef08487e423165554c54f0b333d5631d/skills/bulk-rnaseq/references/upstream-nfcore.md)
- [scripts/build_counts_matrix.py](https://github.com/K-Dense-AI/scientific-agent-skills/blob/93124850ef08487e423165554c54f0b333d5631d/skills/bulk-rnaseq/scripts/build_counts_matrix.py)
- [scripts/validate_samplesheet.py](https://github.com/K-Dense-AI/scientific-agent-skills/blob/93124850ef08487e423165554c54f0b333d5631d/skills/bulk-rnaseq/scripts/validate_samplesheet.py)
- [UPSTREAM-LICENSE.txt](https://github.com/K-Dense-AI/scientific-agent-skills/blob/93124850ef08487e423165554c54f0b333d5631d/LICENSE.md)

## 环境依赖

- Python 3
- pandas
- pytximport only for the tximport branch; nf-core / Nextflow / Salmon / STAR remain explicit environment dependencies

## 说明

- Resources copied byte-for-byte from tracked Git blobs; not executed during packaging.
- This snapshot restores missing resources and does not establish the revision used for the original SKILL.md adaptation.
