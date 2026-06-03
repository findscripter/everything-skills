---
name: coding-agent-headtohead-eval
title: 编码 Agent 对比评测（通过率/成本/耗时）
description: 当需要在自己代码库上把 Claude Code、Aider、Codex 等编码 Agent 做可复现的对比评测时使用；做基于 YAML 任务声明 + git worktree 隔离的多次运行，产出含通过率/成本/耗时/一致性的对比报告；不适用于评测纯对话/生成质量、单模型基准或无判据的开放任务。触发词：编码 Agent 对比、agent-eval、通过率、git worktree、选型评测
domain: 智能/eval
triggers: [编码 Agent 对比, agent-eval, Claude Code vs Aider, Codex 对比, 通过率评测, pass rate, 成本对比, 耗时对比, 一致性 consistency, git worktree 隔离, YAML 任务定义, 编码工具选型, 模型更新回归检查, LLM-as-judge 判据, 数据化选 Agent]
tags: [评测, 编码agent, 对比评测, 通过率, 成本, 耗时, 一致性, git-worktree, yaml, 选型, cli]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, aider, gemini-cli]
tools: [Read, Write, Edit, Bash, Grep, Glob, git, agent-eval]
requires: []
related: [llm-judge-evaluation, llm-agent-benchmarking, autonomous-coding-agent-patterns, ai-engineering-toolkit]
combines_with: [llm-judge-evaluation, parallel-agent-hub, llm-model-router]
license: MIT
source: affaan-m/everything-claude-code
source_license: MIT
---
# 编码 Agent 对比评测（通过率/成本/耗时）

用一个轻量 CLI，在可复现的任务上把多个编码 Agent 做「正面对决」（head-to-head）。"哪个编码 Agent 更好"通常靠感觉——本技能把它体系化为可度量、可复现的数据。

## 何时使用

适用：
- 在**自己的代码库**上横评 Claude Code、Aider、Codex 等编码 Agent，用数据而非感觉做选型。
- 采用新工具/模型前，先量化它在真实任务上的表现。
- Agent 更新了模型或工具链后，跑回归检查，看是否退化。
- 给团队提供有数据支撑的 Agent 选择依据。

不该用（负边界）：
- 评测纯对话/文本生成质量、无代码改动的任务——用 `llm-judge-evaluation`。
- 只做单个智能体的能力/可靠性基准、对抗与回归门禁——用 `llm-agent-benchmarking`。
- 任务无客观成功判据（无法用测试/构建/模式匹配判定），且不愿引入 LLM 评审——评测无意义。
- 想修复或改进 Agent 本身的逻辑——转 `autonomous-coding-agent-patterns`。

核心理念：声明式任务 + 隔离运行 + 多次重复 = 可复现的对比，而非一次性的主观印象。

## 步骤

1. **声明任务**：建 `tasks/` 目录，每个任务一个 YAML（指定 repo、要改的文件、prompt、判据 judge、固定 commit）。
2. **跑对决**：对同一任务并列跑多个 Agent，每个至少 3 次（Agent 是非确定性的，需要看方差）。每次运行内部：
   1. 从指定 commit 创建全新 git worktree（隔离，免 Docker，互不干扰、不破坏基础库）；
   2. 把 prompt 交给 Agent 执行；
   3. 运行 judge 判据；
   4. 记录 通过/失败、成本、耗时。
3. **出报告**：生成对比表，按通过率/成本/耗时/一致性横向比较，据此选型。

## 指令

CLI 用法（保留源命令）：

```bash
# 1. 建任务目录
mkdir tasks
# 在 tasks/ 下按模板写每个任务的 YAML

# 2. 同一任务并列评多个 Agent，各跑 3 次
agent-eval run --task tasks/add-retry-logic.yaml \
  --agent claude-code --agent aider --runs 3

# 3. 生成对比报告
agent-eval report --format table
```

收集的指标（四维）：

| 指标 | 测什么 |
|---|---|
| 通过率 Pass Rate | Agent 产出的代码能否通过 judge |
| 成本 Cost | 每任务 API 费用（可得时） |
| 耗时 Time | 完成的墙钟秒数 |
| 一致性 Consistency | 重复运行的通过率（如 3/3 = 100%） |

judge（判据）三类，按确定性优先选：
- **代码库 / 确定性**（首选）：`type: pytest`（跑测试）、`type: command`（如 `npm run build`）。
- **模式匹配**：`type: grep`，用 `pattern` + `files`（如确认引入了 `class.*Retry`）。
- **模型评审 LLM-as-judge**（兜底）：`type: llm` + 评判 `prompt`，用于难以用测试表达的语义判断。LLM judge 会引入噪声，**每个任务至少配 1 个确定性 judge**；LLM judge 细节见 `llm-judge-evaluation`。

最佳实践（保留源约束）：
- **从 3-5 个任务起步**——选能代表真实工作负载的任务，别用玩具例子。
- **每个 Agent 至少跑 3 次**——非确定性，需要看分散度/一致性。
- **在任务 YAML 里固定 commit**——跨天/跨周结果才可复现。
- **每个任务至少 1 个确定性 judge**（测试/构建）——LLM judge 加噪声。
- **成本与通过率一起看**——10 倍成本换 95% 正确未必划算。
- **把任务定义纳入版本控制**——它们是测试夹具（fixture），当代码对待。

## 示例

任务 YAML（声明式，固定 commit 保可复现）：

```yaml
name: add-retry-logic
description: Add exponential backoff retry to the HTTP client
repo: ./my-project
files:
  - src/http_client.py
prompt: |
  Add retry logic with exponential backoff to all HTTP requests.
  Max 3 retries. Initial delay 1s, max delay 30s.
judge:
  - type: pytest
    command: pytest tests/test_http_client.py -v
  - type: grep
    pattern: "exponential_backoff|retry"
    files: src/http_client.py
commit: "abc1234"  # 固定到特定 commit 以保证可复现
```

报告输出示意：

```
Task: add-retry-logic (3 runs each)
┌──────────────┬───────────┬────────┬────────┬─────────────┐
│ Agent        │ Pass Rate │ Cost   │ Time   │ Consistency │
├──────────────┼───────────┼────────┼────────┼─────────────┤
│ claude-code  │ 3/3       │ $0.12  │ 45s    │ 100%        │
│ aider        │ 2/3       │ $0.08  │ 38s    │  67%        │
└──────────────┴───────────┴────────┴────────┴─────────────┘
```

judge 各类型片段：

```yaml
# 确定性
judge:
  - type: pytest
    command: pytest tests/ -v
  - type: command
    command: npm run build
# 模式匹配
  - type: grep
    pattern: "class.*Retry"
    files: src/**/*.py
# LLM 评审
  - type: llm
    prompt: |
      Does this implementation correctly handle exponential backoff?
      Check for: max retries, increasing delays, jitter.
```

## 注意事项

- **安装前先审源**：agent-eval 从仓库安装，安装前确认源码可信再用。
- **git worktree 隔离**：每次运行独立 worktree，免 Docker；但要确保基础 repo 干净、commit 已固定，否则不同 Agent 起点不一致会污染对比。
- **样本量**：runs=3 是底线；通过率接近时需加大 runs 才能区分（一致性低说明 Agent 不稳定，比平均通过率更值得警惕）。
- **成本不可得**：部分 Agent/接口无法回传费用，Cost 列可能为空，别据此误判。
- **judge 决定结论**：弱 judge（只 grep）会高估通过率；尽量用测试/构建这类确定性判据，LLM judge 仅兜底且需缓解其偏差（见 `llm-judge-evaluation`）。
- 评测结果是选型参考，不替代你对中选 Agent 产出的人工复核与环境验证。

## 互见

- related：`llm-judge-evaluation` —— 当 judge 用 `type: llm` 时，靠它做无偏、可校准的 LLM 评审。
- related：`llm-agent-benchmarking` —— 单个智能体的深度基准、对抗测试与回归门禁（本技能聚焦"多 Agent 横向对比"，它聚焦"单 Agent 纵向可靠性"）。
- related：`autonomous-coding-agent-patterns` —— 评测中发现短板后，用其改进 Agent 行为。
- combines_with：`parallel-agent-hub` —— 并行编排多个 Agent 运行，加速对决。
- combines_with：`llm-model-router` —— 用评测数据驱动"按任务选 Agent/模型"的路由策略。

---
采编自 affaan-m/everything-claude-code（MIT 许可）；CLI 源自 github.com/joaquinhuigomez/agent-eval。
