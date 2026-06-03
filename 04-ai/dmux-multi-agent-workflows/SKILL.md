---
name: dmux-multi-agent-workflows
title: dmux 多 Agent 并行编排（tmux 面板）
description: 当需要在 tmux 面板里并行跑多个 AI Agent 会话、跨 Claude Code/Codex/OpenCode 等 harness 分而治之时使用；用 dmux 按 n 开面板派任务、按 m 合并产出，配 git worktree 隔离冲突文件、面板数控制在 5-6 以内；不适用于任务彼此依赖输出、需 Agent 间实时通信、或单会话内编程式并行（改用 Task 工具）的场景；触发词：dmux、并行跑 Agent、多 Agent、split this work、tmux 面板编排
domain: 智能/agents
triggers: [用 dmux 编排, 并行跑多个 Agent, split this work / 拆分并行, 多 Agent 工作流, tmux 面板管理 Agent, 跨 Claude Code 和 Codex 协作, research 和 implement 分两条轨, test 与 fix 双面板循环, 并行代码评审多视角, git worktree 隔离每个面板]
tags: [多智能体, 并行编排, dmux, tmux, git-worktree, 跨harness, claude-code, codex, divide-and-conquer]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [dmux, tmux, git, claude-code, codex]
requires: []
related: [parallel-agent-hub, multi-agent-orchestrator, multi-agent-system-designer, autonomous-coding-agent-patterns]
combines_with: [git-worktrees-workflow, tmux-session-management, coding-agent-headtohead-eval]
license: MIT
source: affaan-m/everything-claude-code
source_license: MIT
---
## 何时使用

当一个任务可以拆成**互相独立、可分而治之**的子任务，且并行推进比单线迭代更划算时，用 dmux 在 tmux 面板里同时跑多个 Agent 会话。典型场景：

- 同时跑多个 Agent 会话（每个面板一个独立 harness 实例）。
- 跨 Claude Code、Codex、OpenCode 等不同 harness 协调同一项目的工作。
- 复杂任务的分而治之并行（多文件功能、并行评审、测试+修复双轨）。
- 用户说「并行跑」「split this work」「用 dmux」「多 Agent」。

**不该用的边界：**
- 子任务**彼此依赖对方输出**——别把有先后依赖的步骤并行（会拿到半成品）。
- 需要 Agent 之间**实时通信/协作**——dmux 面板各自独立，靠人工 `m` 合并单向汇总。
- 改动会**相互冲突的全局重构**——除非每个面板用独立 git worktree 隔离。
- **单会话内的编程式并行**——那是 Claude Code Task 工具的活，不必起 dmux。

## 步骤

dmux 是基于 tmux 的 Agent 面板编排器。安装：`npm install -g dmux`（详见 github.com/standardagents/dmux）。支持 Claude Code、Codex、OpenCode、Cline、Gemini、Qwen。

1. **启动**：终端跑 `dmux` 进入会话。
2. **开面板派任务**：按 `n` 新建面板并输入该面板的 prompt（一个面板 = 一个独立 Agent 会话，负责一块**边界清晰**的工作）。
3. **监控**：各面板各自跑自己的 Agent；面板无响应时按 `m` 读其输出，确认是否在等待输入。
4. **合并产出**：按 `m` 把某面板结果合并回主会话上下文。**合并前先 review** 输出，避免引入冲突。
5. **（冲突高发时）worktree 隔离**：对会触碰重叠文件的任务，先建 git worktree，每个面板在各自 worktree 里 `claude`，完成后回主分支 `git merge`。

## 指令

核心快捷键（在 dmux 会话内）：

- `n` —— 新建面板并附带 prompt，启动一个新 Agent 会话。
- `m` —— 把面板输出合并回主会话（也用于读取面板当前输出）。

git worktree 隔离（重叠文件并行的标准做法）：

```bash
# 为每条特性建独立 worktree
git worktree add ../feature-auth    feat/auth
git worktree add ../feature-billing feat/billing

# 不同面板进各自 worktree 跑 Agent
# Pane 1: cd ../feature-auth    && claude
# Pane 2: cd ../feature-billing && claude

# 完成后回主分支合并
git merge feat/auth
git merge feat/billing
```

最佳实践（硬约束）：

1. **只并行独立任务**——有依赖关系的不要并行。
2. **边界清晰**——每个面板只动各自的文件/关注点。
3. **合并要克制**——合并前 review 面板输出防冲突。
4. **冲突用 worktree**——文件易冲突的工作每面板一个 worktree。
5. **资源意识**——每个面板都是一个完整 Agent 会话、消耗 API token，**总面板数控制在 5-6 以内**。

互补工具选型：

| 工具 | 作用 | 何时用 |
|---|---|---|
| dmux | tmux 面板管理 Agent | 并行 Agent 会话 |
| Superset | 终端 IDE，10+ 并行 Agent | 大规模编排 |
| Claude Code Task 工具 | 进程内派生子 Agent | 单会话内编程式并行 |
| Codex 多 Agent | 内建 Agent 角色 | Codex 专属并行 |

## 示例

常用编排模式（每行一个面板的 prompt）：

**模式 1 · 研究 + 实现（research/implement 双轨）**
```
Pane 1 (Research):  "调研 Node.js 限流最佳实践，对比现有库与方案，把结论写到 /tmp/rate-limit-research.md"
Pane 2 (Implement): "为 Express API 实现限流中间件，先做基础 token bucket，待研究完成再精修"
# Pane 1 完成后，把结论合并进 Pane 2 的上下文
```

**模式 2 · 多文件功能（独立文件并行）**
```
Pane 1: "为计费功能创建数据库 schema 与迁移"
Pane 2: "在 src/api/billing/ 实现计费 API 端点"
Pane 3: "创建计费仪表盘 UI 组件"
# 全部合并后，在主面板做集成
```

**模式 3 · 测试 + 修复循环**
```
Pane 1 (Watcher): "watch 模式跑测试套件，失败时汇总失败项"
Pane 2 (Fixer):   "根据 Pane 1 的错误输出修复失败测试"
```

**模式 4 · 跨 harness**
```
Pane 1 (Claude Code): "评审 auth 模块的安全性"
Pane 2 (Codex):       "为性能重构工具函数"
Pane 3 (Claude Code): "为结算流程写 E2E 测试"
```

**模式 5 · 并行评审流水线（多视角）**
```
Pane 1: "评审 src/api/ 的安全漏洞"
Pane 2: "评审 src/api/ 的性能问题"
Pane 3: "评审 src/api/ 的测试覆盖缺口"
# 三份评审合并为一份报告
```

## 注意事项

- **面板无响应**：多半是 Agent 会话在等待输入，按 `m` 读输出确认。
- **合并冲突**：用 git worktree 把各面板的文件改动隔离开。
- **token 高耗**：减少并行面板数——每个面板都是一个完整 Agent 会话。
- **tmux 未安装**：macOS `brew install tmux`，Linux `apt install tmux`。
- dmux 是 tmux 之上的编排层，强依赖本机 tmux 环境，不适用于纯 Windows 原生终端（用 WSL/Linux/macOS）。

## 互见

- related：`parallel-agent-hub` —— 同一任务上多 Agent 竞赛择优（worktree 隔离 + 指标/LLM 评审），比 dmux 的人工合并更自动化。
- related：`multi-agent-workflow-designer` —— 先用它选编排模式（顺序/并行/路由/编排器/评估器）画蓝图，再用 dmux 落到面板执行。
- related：`multi-agent-system-designer`、`autonomous-coding-agent-patterns`、`agent-workflow-pattern-designer`
- combines_with：`git-worktrees-workflow` —— 为高冲突并行任务提供分支/工作树隔离，是模式 2/全局重构的前提。
- combines_with：`crewai-multi-agent` —— 需要进程内、有结构化角色与通信的多 Agent 系统时改用它（dmux 是面板级、无 Agent 间通信）。

---
采编自 affaan-m/everything-claude-code（MIT 许可），适配重写为中文版，非逐字翻译。
