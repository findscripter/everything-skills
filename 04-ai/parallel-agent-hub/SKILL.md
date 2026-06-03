---
name: parallel-agent-hub
title: 并行多智能体竞赛协作中枢
description: 当需要让多个智能体在同一任务上并行尝试不同方案并择优时使用；用 git worktree 隔离派生 N 个子智能体竞赛、按指标或 LLM 评审排名并合并最优分支；不适用于非 git 仓库、单方案确定性任务或需智能体间通信协作的场景；触发词：并行竞赛、多方案对比、spawn N 智能体
domain: 智能/agents
triggers: [尝试多种方案, 让多个智能体竞赛, 并行优化, spawn N 个智能体, 对比不同解法, fan-out/锦标赛, 生成内容变体, 对比不同草稿, A/B 测试文案, 探索多种策略]
tags: [多智能体, 并行竞赛, git-worktree, 子智能体编排, 方案择优, dag, llm评审, 智能体协作]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Bash, EnterWorktree, ExitWorktree, Task/Agent, Read, Edit, Write]
requires: []
related: [autoresearch-optimization-agent, multi-agent-system-designer, autonomous-coding-agent-patterns, crewai-multi-agent]
combines_with: [git-worktrees-workflow, llm-judge-evaluation, langgraph-agent-framework]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

当一个任务存在多条可行路径、且并行尝试比单线迭代更划算时使用本技能。典型场景：

- 性能/延迟/体积优化，想让多个智能体各自探索不同优化路线后取最优。
- 代码重构、补测试、修 Bug 的多方案对比。
- 内容创作：生成多个文案/草稿变体，A/B 对比择优。
- 研究探索：并行尝试多种策略或假设。

核心模型：主 Claude Code 会话作为**协调者（coordinator）**，派生 N 个子智能体，每个在独立的 git worktree 中**互不可见、互不通信**地完成同一任务，协调者按指标或 LLM 评审排名并合并赢家分支。

**不该用的边界：**
- 非 git 仓库（本技能强依赖 git worktree 与分支隔离）。
- 单一确定性方案、无需对比的任务（直接做即可，并行只增成本）。
- 需要智能体之间实时协作/通信的任务——本技能刻意让智能体彼此隔离，只通过留言板与协调者单向沟通。
- 改动会相互冲突、难以在独立分支并行的全局重构。

## 步骤

协调者遵循生命周期：`INIT → DISPATCH → MONITOR → EVALUATE → MERGE`。

1. **Init（初始化）** `/hub:init`：创建会话，生成
   - `.agenthub/sessions/{session-id}/config.yaml`（任务配置）
   - `.agenthub/sessions/{session-id}/state.json`（状态机）
   - `.agenthub/board/`（留言板通道）
   - session-id 用时间戳 `YYYYMMDD-HHMMSS`。
2. **Dispatch（派发）** `/hub:spawn`：对 agent 1..N，把任务书写入 `.agenthub/board/dispatch/`，用 Agent 工具以 `isolation: "worktree"` 派生，**所有智能体在同一条消息里一次性并行启动**。
3. **Monitor（监控）** `/hub:status`：查看 DAG/分支状态与进度。
4. **Evaluate（评估）** `/hub:eval`：按指标或评审排名（见下方三种模式）。
5. **Merge（合并）** `/hub:merge`：`git merge --no-ff` 赢家入基线分支，落败者打 tag 归档，清理 worktree，并把合并摘要写回留言板。

一键全流程：`/hub:run`（init → baseline → spawn → eval → merge）。

## 指令

**斜杠命令一览：**
| 命令 | 作用 |
|------|------|
| `/hub:init` | 新建协作会话（任务、智能体数、评估标准） |
| `/hub:spawn` | 在隔离 worktree 中并行启动 N 个子智能体 |
| `/hub:status` | 显示 DAG 状态、智能体进度、分支状态 |
| `/hub:eval` | 按指标或 LLM 评审排名 |
| `/hub:merge` | 合并赢家分支、归档落败者 |
| `/hub:board` | 读写智能体留言板 |
| `/hub:run` | 一键全生命周期 |

**智能体模板**（`--template`，定义于 `references/agent-templates.md`）：
| 模板 | 迭代模式 | 适用 |
|------|---------|------|
| `optimizer` | 改→评→留/弃→重复 x10 | 性能、延迟、体积 |
| `refactorer` | 重构→测试→迭代至通过 | 代码质量、技术债 |
| `test-writer` | 写测试→测覆盖率→重复 | 测试覆盖缺口 |
| `bug-fixer` | 复现→诊断→修→验证 | Bug 修复 |

**分支命名（DAG，append-only 不可变）：** `hub/{session-id}/agent-{N}/attempt-{M}`。永不 rebase / force-push 智能体分支，永不删 commit（归档后只删分支 ref），每种方案都用 git tag 保留。

**前沿（frontier）检测**——无子分支的分支尖端：
```bash
python scripts/dag_analyzer.py --frontier --session {id}
```

**留言板** `.agenthub/board/` 三通道：`dispatch/`（协调者→智能体，派任务）、`progress/`（智能体→协调者，进度）、`results/`（智能体+协调者→全体，结果+合并摘要）。规则：append-only 永不改删；文件名唯一 `{seq:03d}-{author}-{timestamp}.md`；所有帖子必须带 YAML frontmatter。

**子智能体 prompt 模板：**
```
You are agent-{i} in hub session {session-id}.
Your task: {task description}

Instructions:
1. Read your assignment at .agenthub/board/dispatch/{seq}-agent-{i}.md
2. Work in your worktree — make changes, run tests, iterate
3. Commit all changes with descriptive messages
4. Write your result summary to .agenthub/board/results/agent-{i}-result.md
5. Exit when done
```

**三种评估模式：**
- 指标模式（benchmark、测试通过率、文件大小、响应时间）——在每个 worktree 跑 eval 命令解析数值：
  ```bash
  python scripts/result_ranker.py --session {id} \
    --eval-cmd "pytest bench.py --json" \
    --metric p50_ms --direction lower
  ```
- LLM 评审模式（代码质量、可读性、架构）——协调者读各方案 diff（`git diff base...agent-branch`），按 正确性 → 简洁性（改动越少越好）→ 质量 排序。
- 混合模式——先跑指标，前列智能体差距在 10% 以内时，用 LLM 评审打破平局。

**会话状态机**（`session_manager.py`）：`init → running → evaluating → merged`（或无赢家时 `→ archived`）。

**核心脚本：** `hub_init.py`（初始化结构与会话）、`dag_analyzer.py`（前沿/DAG/分支状态）、`board_manager.py`（留言板增删改查）、`result_ranker.py`（按指标或 diff 质量排名）、`session_manager.py`（状态机与清理）。

## 示例

**场景：把一段 O(n²) 排序优化到更快。**
1. `/hub:init`：任务=“优化 sort 性能”，agent-count=3，eval 指标=p50_ms（方向 lower）。
2. `/hub:spawn --template optimizer`：3 个智能体在独立 worktree 各自尝试（哈希表 / 改算法 / SIMD 等）。
3. 每个智能体把结果写回留言板，格式示例：
```markdown
---
author: agent-1
timestamp: 2026-03-17T14:30:22Z
channel: results
parent: null
---

## Result Summary

- **Approach**: Replaced O(n²) sort with hash map
- **Files changed**: 3
- **Metric**: 142ms (baseline: 180ms, delta: -38ms)
- **Confidence**: High — all tests pass
```
4. `/hub:eval`：result_ranker 在各 worktree 跑基准，排名取最优（142ms）。
5. `/hub:merge`：`git merge --no-ff` 赢家入基线，落败者 `git tag hub/archive/{session}/agent-{i}` 归档，清理 worktree。

## 注意事项

- **强依赖 git 仓库**；非 git 环境无法使用。
- **智能体彼此隔离**：不看彼此的工作、不互相通信，只通过留言板单向写给协调者。
- DAG **append-only 不可变**：不要 rebase / force-push 智能体分支，不要删 commit。
- 派生时务必**一条消息一次性并行启动**全部智能体，否则退化为串行。
- 协调者应对异常的主动触发：
  | 信号 | 动作 |
  |------|------|
  | 全部智能体崩溃 | 发失败摘要，建议换约束重试 |
  | 相对基线无改进 | 归档会话，建议换思路 |
  | 检测到孤儿 worktree | `session_manager.py --cleanup {id}` |
  | 会话卡在 `running` | 查留言板进度，考虑超时 |
- 留言板帖子必须带 YAML frontmatter、文件名唯一、永不编辑或删除。

## 互见

- **autoresearch-agent**——单智能体优化循环（要 N 个智能体竞赛时改用本技能）。
- **self-improving-agent**——自我改写智能体（要外部竞赛时改用本技能）。
- **git-worktree-manager**——git worktree 工具（本技能内部即用 worktree 隔离）。

---
采编自 alirezarezvani/claude-skills（MIT 许可）。
