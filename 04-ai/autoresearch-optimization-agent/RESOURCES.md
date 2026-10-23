# 随包资源来源

资源取自 `alirezarezvani/claude-skills` 的固定提交 `56d41613d1ca1e2b0614a19c3816ec97a6159ec2`。这是 2026-10-23 补齐资源时核对的版本，不能据此推定原正文的采编提交。

- 原技能：[固定源文件](https://github.com/alirezarezvani/claude-skills/blob/56d41613d1ca1e2b0614a19c3816ec97a6159ec2/engineering/autoresearch-agent/skills/autoresearch-agent/SKILL.md)
- 资源许可证：`MIT`；全文见 [UPSTREAM-LICENSE.txt](UPSTREAM-LICENSE.txt)。
- 资源字节未改；没有执行上游脚本、安装依赖或调用模型。
- 完整路径、SHA-256 和每文件固定源链接见仓库 `data/skill-resources.json`。

## 文件

- [references/experiment-domains.md](https://github.com/alirezarezvani/claude-skills/blob/56d41613d1ca1e2b0614a19c3816ec97a6159ec2/engineering/autoresearch-agent/skills/autoresearch-agent/references/experiment-domains.md)
- [references/program-template.md](https://github.com/alirezarezvani/claude-skills/blob/56d41613d1ca1e2b0614a19c3816ec97a6159ec2/engineering/autoresearch-agent/skills/autoresearch-agent/references/program-template.md)
- [scripts/log_results.py](https://github.com/alirezarezvani/claude-skills/blob/56d41613d1ca1e2b0614a19c3816ec97a6159ec2/engineering/autoresearch-agent/skills/autoresearch-agent/scripts/log_results.py)
- [scripts/run_experiment.py](https://github.com/alirezarezvani/claude-skills/blob/56d41613d1ca1e2b0614a19c3816ec97a6159ec2/engineering/autoresearch-agent/skills/autoresearch-agent/scripts/run_experiment.py)
- [scripts/setup_experiment.py](https://github.com/alirezarezvani/claude-skills/blob/56d41613d1ca1e2b0614a19c3816ec97a6159ec2/engineering/autoresearch-agent/skills/autoresearch-agent/scripts/setup_experiment.py)
- [UPSTREAM-LICENSE.txt](https://github.com/alirezarezvani/claude-skills/blob/56d41613d1ca1e2b0614a19c3816ec97a6159ec2/LICENSE)
- [evaluators/benchmark_size.py](https://github.com/alirezarezvani/claude-skills/blob/56d41613d1ca1e2b0614a19c3816ec97a6159ec2/engineering/autoresearch-agent/evaluators/benchmark_size.py)
- [evaluators/benchmark_speed.py](https://github.com/alirezarezvani/claude-skills/blob/56d41613d1ca1e2b0614a19c3816ec97a6159ec2/engineering/autoresearch-agent/evaluators/benchmark_speed.py)
- [evaluators/build_speed.py](https://github.com/alirezarezvani/claude-skills/blob/56d41613d1ca1e2b0614a19c3816ec97a6159ec2/engineering/autoresearch-agent/evaluators/build_speed.py)
- [evaluators/llm_judge_content.py](https://github.com/alirezarezvani/claude-skills/blob/56d41613d1ca1e2b0614a19c3816ec97a6159ec2/engineering/autoresearch-agent/evaluators/llm_judge_content.py)
- [evaluators/llm_judge_copy.py](https://github.com/alirezarezvani/claude-skills/blob/56d41613d1ca1e2b0614a19c3816ec97a6159ec2/engineering/autoresearch-agent/evaluators/llm_judge_copy.py)
- [evaluators/llm_judge_prompt.py](https://github.com/alirezarezvani/claude-skills/blob/56d41613d1ca1e2b0614a19c3816ec97a6159ec2/engineering/autoresearch-agent/evaluators/llm_judge_prompt.py)
- [evaluators/memory_usage.py](https://github.com/alirezarezvani/claude-skills/blob/56d41613d1ca1e2b0614a19c3816ec97a6159ec2/engineering/autoresearch-agent/evaluators/memory_usage.py)
- [evaluators/test_pass_rate.py](https://github.com/alirezarezvani/claude-skills/blob/56d41613d1ca1e2b0614a19c3816ec97a6159ec2/engineering/autoresearch-agent/evaluators/test_pass_rate.py)

## 环境依赖

- Python 3
- Git
- The fixed evaluator command and its dependencies must already exist; LLM evaluators require a separately authorized Claude/Codex/Gemini CLI session

## 说明

- Resources copied byte-for-byte from tracked Git blobs; not executed during packaging.
- This snapshot restores missing resources and does not establish the revision used for the original SKILL.md adaptation.
- Upstream evaluators live outside the source skill directory; copied into the location resolved by setup_experiment.py.
