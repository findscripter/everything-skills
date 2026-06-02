---
name: git-worktrees-workflow
title: Git Worktrees 并行工作区
description: 当需要在同一仓库内并行处理多个分支、又不想用 git stash/切换分支打断当前工作区时使用；按「既有目录＞CLAUDE.md＞询问」优先级选定位置，校验目录已被 gitignore，创建隔离 worktree 并跑安装与基线测试，产出一个干净可立即开发的并行工作区；不适用于单分支顺序开发、仅需临时暂存改动，或克隆全新独立仓库的场景；触发词：git worktree、并行分支、隔离工作区、worktree
domain: 研发/devops
triggers: [git worktree add, 并行处理多个分支, 隔离工作区, 不想切换分支, worktree 放哪个目录, 校验 worktree 已被忽略, git check-ignore, 为新分支建独立工作目录, 并行开发多个 feature]
tags: [devops, git, worktree, 并行开发, 分支管理, 工作区隔离, 研发效能]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Bash, git, Read, Grep]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用场景：

- 需要**同时**在多个分支上工作（如一边修复线上 bug，一边推进 feature），不愿用 `git stash` 或来回切分支打断当前状态。
- 想为某个新分支开一个**物理隔离的工作目录**，与主工作区共享同一份 `.git`（省去重复克隆的体积与拉取成本）。
- 让长跑任务（构建、测试、AI 代码生成）在独立目录里进行，不污染主工作区。

不该用的边界：

- 单分支、顺序开发，切分支无成本时——直接 `git switch` 即可，无需 worktree。
- 只需临时暂存几行改动——用 `git stash` 更轻。
- 需要的是**完全独立**的另一份仓库副本（独立 `.git`、独立 remote）——那是 `git clone`，不是 worktree。

核心原则：**系统化选定目录 + 安全校验（确保被 gitignore）= 可靠隔离**。开工前先声明：「我在用 Git Worktrees 并行工作区技能建立一个隔离工作区。」

## 步骤 / 指令

**1. 选定 worktree 目录（按优先级，命中即停）**

```bash
# 1) 既有目录优先；两者都在则 .worktrees 胜出
ls -d .worktrees 2>/dev/null     # 首选（隐藏目录）
ls -d worktrees 2>/dev/null      # 备选

# 2) 无既有目录 → 查 CLAUDE.md 偏好，命中则直接用、不再问
grep -i "worktree.*director" CLAUDE.md 2>/dev/null
```

3) 仍无定论 → 询问用户：项目内 `.worktrees/`（隐藏、本地）还是全局位置（如 `~/.config/<tool>/worktrees/<project>/`）。
决策表：

| 情况 | 处理 |
|---|---|
| `.worktrees/` 存在 | 用它（须校验已忽略） |
| `worktrees/` 存在 | 用它（须校验已忽略） |
| 两者都存在 | 用 `.worktrees/` |
| 都不存在 | 查 CLAUDE.md → 询问用户 |

**2. 安全校验（仅项目内目录需要）**

创建前**必须**确认该目录已被忽略，否则 worktree 内容会被误纳入版本库：

```bash
git check-ignore -q .worktrees 2>/dev/null || git check-ignore -q worktrees 2>/dev/null
```

若**未被忽略**：立即修复——向 `.gitignore` 追加对应行并提交，再继续创建。
全局目录（在项目之外）无需此校验。

**3. 创建 worktree 并进入**

```bash
project=$(basename "$(git rev-parse --show-toplevel)")   # 探测项目名
git worktree add "<目录>/<分支名>" -b "<分支名>"          # 新建分支并挂上工作区
cd "<目录>/<分支名>"
```

**4. 自动探测并运行项目初始化**（按存在的清单文件选命令）

```bash
[ -f package.json ]     && npm install
[ -f Cargo.toml ]       && cargo build
[ -f requirements.txt ] && pip install -r requirements.txt
[ -f pyproject.toml ]   && poetry install
[ -f go.mod ]           && go mod download
```

**5. 校验干净基线**：跑项目对应测试（`npm test` / `cargo test` / `pytest` / `go test ./...`）。
- 全绿 → 报告就绪。
- 有红 → **不要擅自继续**，报告失败项并询问是先排查还是继续。

**6. 报告**：输出 worktree 完整路径、测试通过数、可开始实现的功能名。

## 示例

```text
我在用 Git Worktrees 并行工作区技能建立一个隔离工作区。

[检查 .worktrees/ —— 存在]
[git check-ignore 确认 .worktrees/ 已被忽略]
[git worktree add .worktrees/auth -b feature/auth]
[npm install]
[npm test —— 47 passing]

Worktree 就绪：/Users/me/myproject/.worktrees/auth
测试通过（47 个，0 失败）
可以开始实现 auth 功能
```

清理（工作完成后）：`git worktree remove <路径>`，再按需删除分支；用 `git worktree list` 查看当前所有工作区，`git worktree prune` 清理失效记录。

## 注意事项

- **绝不**跳过「是否被忽略」校验就在项目内建 worktree——这是最常见也最危险的错误，会把 worktree 内容污染进 `git status`。
- **绝不**跳过基线测试；基线不绿就无法区分「新引入的 bug」与「既有问题」，必须先报告并取得继续许可。
- 目录位置有歧义时**不要擅自假设**，严格遵循「既有 ＞ CLAUDE.md ＞ 询问」的优先级，避免破坏项目约定。
- 初始化命令**按文件信号探测**，不要硬编码——不同项目工具链不同。
- 同一分支不能被两个 worktree 同时检出；worktree 之间共享同一份对象库与 remote 配置。

## 互见

- related：`git-advanced-workflows` —— rebase/合并等高级 Git 流程，常与并行工作区配合
- related：`git-hooks-automation` —— 在工作区中落地提交/推送钩子
- combines_with：`ci-cd-pipeline-builder` —— 隔离工作区内验证流水线基线，互不干扰

---

采编自 sickn33/antigravity-awesome-skills（MIT）。
