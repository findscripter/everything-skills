# 随包资源来源

资源取自 `anthropics/skills` 的固定提交 `da20c92503b2e8ff1cf28ca81a0df4673debdbf7`。这是 2026-10-23 补齐资源时核对的版本，不能据此推定原正文的采编提交。

- 原技能：[固定源文件](https://github.com/anthropics/skills/blob/da20c92503b2e8ff1cf28ca81a0df4673debdbf7/skills/skill-creator/SKILL.md)
- 资源许可证：`Apache-2.0`；全文见 [UPSTREAM-LICENSE.txt](UPSTREAM-LICENSE.txt)。
- 资源字节未改；没有执行上游脚本、安装依赖或调用模型。
- 完整路径、SHA-256 和每文件固定源链接见仓库 `data/skill-resources.json`。

## 文件

- [agents/analyzer.md](https://github.com/anthropics/skills/blob/da20c92503b2e8ff1cf28ca81a0df4673debdbf7/skills/skill-creator/agents/analyzer.md)
- [agents/comparator.md](https://github.com/anthropics/skills/blob/da20c92503b2e8ff1cf28ca81a0df4673debdbf7/skills/skill-creator/agents/comparator.md)
- [agents/grader.md](https://github.com/anthropics/skills/blob/da20c92503b2e8ff1cf28ca81a0df4673debdbf7/skills/skill-creator/agents/grader.md)
- [assets/eval_review.html](https://github.com/anthropics/skills/blob/da20c92503b2e8ff1cf28ca81a0df4673debdbf7/skills/skill-creator/assets/eval_review.html)
- [eval-viewer/generate_review.py](https://github.com/anthropics/skills/blob/da20c92503b2e8ff1cf28ca81a0df4673debdbf7/skills/skill-creator/eval-viewer/generate_review.py)
- [eval-viewer/viewer.html](https://github.com/anthropics/skills/blob/da20c92503b2e8ff1cf28ca81a0df4673debdbf7/skills/skill-creator/eval-viewer/viewer.html)
- [references/schemas.md](https://github.com/anthropics/skills/blob/da20c92503b2e8ff1cf28ca81a0df4673debdbf7/skills/skill-creator/references/schemas.md)
- [scripts/__init__.py](https://github.com/anthropics/skills/blob/da20c92503b2e8ff1cf28ca81a0df4673debdbf7/skills/skill-creator/scripts/__init__.py)
- [scripts/aggregate_benchmark.py](https://github.com/anthropics/skills/blob/da20c92503b2e8ff1cf28ca81a0df4673debdbf7/skills/skill-creator/scripts/aggregate_benchmark.py)
- [scripts/generate_report.py](https://github.com/anthropics/skills/blob/da20c92503b2e8ff1cf28ca81a0df4673debdbf7/skills/skill-creator/scripts/generate_report.py)
- [scripts/improve_description.py](https://github.com/anthropics/skills/blob/da20c92503b2e8ff1cf28ca81a0df4673debdbf7/skills/skill-creator/scripts/improve_description.py)
- [scripts/package_skill.py](https://github.com/anthropics/skills/blob/da20c92503b2e8ff1cf28ca81a0df4673debdbf7/skills/skill-creator/scripts/package_skill.py)
- [scripts/quick_validate.py](https://github.com/anthropics/skills/blob/da20c92503b2e8ff1cf28ca81a0df4673debdbf7/skills/skill-creator/scripts/quick_validate.py)
- [scripts/run_eval.py](https://github.com/anthropics/skills/blob/da20c92503b2e8ff1cf28ca81a0df4673debdbf7/skills/skill-creator/scripts/run_eval.py)
- [scripts/run_loop.py](https://github.com/anthropics/skills/blob/da20c92503b2e8ff1cf28ca81a0df4673debdbf7/skills/skill-creator/scripts/run_loop.py)
- [scripts/utils.py](https://github.com/anthropics/skills/blob/da20c92503b2e8ff1cf28ca81a0df4673debdbf7/skills/skill-creator/scripts/utils.py)
- [UPSTREAM-LICENSE.txt](https://github.com/anthropics/skills/blob/da20c92503b2e8ff1cf28ca81a0df4673debdbf7/skills/skill-creator/LICENSE.txt)

## 环境依赖

- Python 3
- PyYAML for scripts that parse frontmatter
- Claude CLI for scripts/run_eval.py and description optimization; use manual evaluation when unavailable

## 说明

- Resources copied byte-for-byte from tracked Git blobs; not executed during packaging.
- This snapshot restores missing resources and does not establish the revision used for the original SKILL.md adaptation.
