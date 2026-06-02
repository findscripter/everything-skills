---
name: autoresearch-optimization-agent
title: 自主实验优化智能体循环
description: 当你有一个目标文件、一条会输出可量化指标的评估命令、且代码在 git 仓库中，想让智能体长时间自动优化（更快/更小/质量更高）时使用；做的事：单变量改文件→提交→跑固定评估→改进则保留、变差则 git reset 回退→循环累积并记录到 results.tsv；不适用于无法量化、缺评估命令或不在 git 下的任务，也不要边改评估器边比对。触发词：优化、实验循环、autoresearch
domain: 智能/agents
triggers: [把这个文件优化得更快/更小/更好, 用可量化指标跑一个改进实验循环, 通宵/定时自动跑实验并保留更优结果, 优化提示词/标题/文案的 CTR 或质量分, 我要把某指标从 X 提升到 Y, autoresearch 自主实验优化]
tags: [智能体, 实验优化, 自动化循环, git, 评估指标, 性能优化, 提示词优化, autoresearch]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Bash, Read, Edit, Write]
requires: []
related: [autonomous-coding-agent-patterns, parallel-agent-hub, self-improving-memory-agent, llm-model-router]
combines_with: [llm-agent-benchmarking, git-worktrees-workflow, skill-optimizer]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

灵感来自 Karpathy 的 autoresearch：智能体反复「改一个文件 → 跑固定评估 → 改进则保留、变差则回退」，让微小提升不断复利累积。不是一次猜测，而是几十次有度量的尝试。

适用场景（用户往往这样表述）：
- 「把这个更快/更小/更好」「优化 [文件] 的 [指标]」
- 「优化我的标题/文案/提示词」「通宵跑实验」「把 [指标] 从 X 提升到 Y」
- 任何含 optimize / benchmark / improve / 实验循环 / autoresearch 的请求

判定标准：用户能给出**一个目标文件 + 一种衡量成败的方式** → 适用。

**不该用的边界：**
- 成败无法量化（无法用一个数值衡量好坏）。
- 没有可复现的评估命令，或评估命令跑不通。
- 目标文件不在 git 仓库里（无法 commit / reset，循环失去回退基础）。
- 需要同时改动多处、目标含糊的「大重构」——本循环要求每次只动一个变量。
- 仅做架构/设计决策（属设计阶段，先定方案再用本循环优化）。

## 步骤

**前置检查（开跑前必做，发现问题主动报警）：**
1. 评估命令先单跑一次，确认能输出 `指标名: 数值`。
2. 目标文件不在 git 中 → 先 `git init && git add . && git commit -m 'initial'`。
3. 指标方向不明 → 先问清「越低越好还是越高越好」。
4. 评估耗时是否超过时间预算——超了则每轮都会超时崩溃。

**首次建实验（setup 脚本，scope 决定 `.autoresearch/` 落在哪）：**
- `project`（默认）→ 仓库根目录，实验定义入 git、结果 gitignore。
- `user` → `~/.autoresearch/`，全部私有。

```bash
# 工程类·优化 API 速度（越低越好）
python scripts/setup_experiment.py \
  --domain engineering --name api-speed \
  --target src/api/search.py \
  --eval "pytest bench.py --tb=no -q" \
  --metric p50_ms --direction lower --scope project

# 内容类·优化 CTR（越高越好，用 LLM 评判）
python scripts/setup_experiment.py \
  --domain marketing --name medium-ctr \
  --target content/titles.md \
  --eval "python evaluate.py" \
  --metric ctr_score --direction higher \
  --evaluator llm_judge_content --scope user
```

setup 产物：`config.yaml`、`.gitignore`，以及 `{domain}/{name}/` 下的 `program.md`（目标/约束/策略）、`config.cfg`（目标·评估命令·指标·方向）、`results.tsv`（实验日志，gitignore）、`evaluate.py`（用 `--evaluator` 时）。若 `program.md` 已存在则以它为准，只补缺失项。

**开始前读 4 样东西：** `config.cfg`（target / evaluate_cmd / metric / metric_direction / time_budget_minutes）、`program.md`（策略与可改/不可改约束）、`results.tsv`（历史，列：commit · metric · status · description）；然后 `git checkout autoresearch/{domain}/{name}`。

**每一轮迭代（你就是这个循环）：**
1. 复盘 results.tsv：什么有效？什么失败？还有什么没试过？
2. 决定对目标文件做**唯一一处**改动（每次只动一个变量）。
3. 编辑目标文件。
4. 提交：`git add {target} && git commit -m "experiment: {描述}"`
5. 评估：`python scripts/run_experiment.py --experiment {domain}/{name} --single`
6. 读输出——脚本会打印 KEEP / DISCARD / CRASH 及指标值。
7. 回到第 1 步。

**脚本负责（你不用管）：** 带超时跑评估命令、解析指标、与历史最优比较、失败时回退（`git reset --hard HEAD~1`）、写入 results.tsv。

**看结果：**
```bash
python scripts/log_results.py --experiment engineering/api-speed   # 单实验
python scripts/log_results.py --domain engineering                 # 整个 domain
python scripts/log_results.py --dashboard                          # 跨实验仪表盘
python scripts/log_results.py --dashboard --format markdown --output dashboard.md
```

## 指令

- **策略升级**：第 1-5 轮摘低垂果实；6-15 轮系统性逐一调参；16-30 轮做结构性改动（换算法/换架构）；30+ 轮尝试根本不同的激进方案；连续 20+ 轮无改进就更新 `program.md` 的 Strategy 段。
- **自我改进**：每 10 轮回看 results.tsv 找规律，把结论写进 `program.md`（如「加缓存稳定提升 5-10%」「纯重构从不动指标」），让后续迭代复用。
- **停止条件**：跑到用户中断 / 上下文耗尽 / 达成 program.md 目标；停前确保 results.tsv 已更新。上下文耗尽也能续跑——results.tsv 与 git log 都持久化。

## 示例

自定义评估器：只要求向 stdout 打印 `指标名: 数值`。**实验开始后绝不可改它**（评估器是唯一基准，改了所有历史对比全作废）。

```python
#!/usr/bin/env python3
# 自定义评估器 —— 实验开始后请勿修改
import subprocess
result = subprocess.run(["my-benchmark", "--json"], capture_output=True, text=True)
print(f"my_metric: {parse_score(result.stdout)}")
```

内置评估器：免费类 `benchmark_speed`(p50_ms↓)、`benchmark_size`(size_bytes↓)、`test_pass_rate`(pass_rate↑)、`build_speed`(build_seconds↓)、`memory_usage`(peak_mb↓)；LLM 评判类 `llm_judge_content`(ctr_score 0-10↑)、`llm_judge_prompt`(quality_score 0-100↑)、`llm_judge_copy`(engagement_score 0-10↑)。LLM 评判走你已订阅的 CLI（Claude/Codex/Gemini），评估提示锁死在 evaluate.py 内，智能体无法改，防止「自己给自己刷分」。

仪表盘示意：
```
DOMAIN       EXPERIMENT     RUNS  KEPT  BEST     Δ FROM START  STATUS
engineering  api-speed       47    14   185ms    -76.9%        active
marketing    medium-ctr      31    11   8.4/10   +68.0%        active
```

## 注意事项

- **每次只改一处**：一次改 5 样东西，你将无从知道是哪样起了作用。
- **简洁优先**：靠丑陋复杂换来的小提升不值；同样性能下更简单的代码才是赢，能删代码且结果不变是最佳结局。
- **绝不修改评估器**：`evaluate.py` 是地面真值，改它即作废所有对比——发现自己在改就立即硬停。
- **超时即崩溃**：单轮超过时间预算的 2.5 倍就杀掉，按 crash 处理。
- **崩溃处理**：拼写错/缺 import 就修好重跑；想法根本走不通则回退、记 crash、换下一个；**连续 5 次崩溃 → 暂停并提醒用户**，别再空耗。
- **不引入新依赖**：只用项目里已有的东西。
- **主动报警还包括**：连续 20+ 轮无改进 → 建议改 program.md 策略或换思路。

## 互见

- **self-improving-agent**：优化智能体自身记忆/规则；不用于结构化实验循环。
- **senior-ml-engineer**：ML 架构决策，互补——先定设计，再用本循环优化。
- **tdd-guide**：测试驱动开发，互补——测试本身可作为评估函数。

---
采编自 [alirezarezvani/claude-skills](https://github.com/alirezarezvani/claude-skills)（MIT 许可）。
