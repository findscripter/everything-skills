---
name: git-advanced-workflows
title: Git 高级工作流
description: 当需要重写提交历史、跨分支搬运提交、定位引入 Bug 的提交或从 Git 误操作中恢复时使用；产出整洁的提交历史、可安全推送的分支与恢复方案；不适用于已推送共享分支的历史改写或普通 add/commit/push 基础操作；触发词：交互式 rebase、cherry-pick、bisect、worktree、reflog、squash、force-with-lease
domain: 研发/devops
triggers: [合并前清理提交历史, 把某个提交搬到其他分支, 定位引入 Bug 的提交, 同时在多个分支上开发, 误删提交或分支后恢复, 准备干净的 PR, 同步已分叉的分支, 把 fixup 提交自动压缩]
tags: [git, 版本控制, rebase, cherry-pick, bisect, worktree, reflog, 研发]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [git rebase, git cherry-pick, git bisect, git worktree, git reflog]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：合并前清理/重排/压缩提交、跨分支搬运补丁、二分定位引入 Bug 的提交、多分支并行开发、误操作后恢复丢失的提交或分支、同步已分叉的分支、准备干净可评审的 PR。

不该用（边界）：
- 与 Git 高级历史操作无关的任务。
- 普通 `git add/commit/push` 等基础操作，无需高级技巧。
- 改写已推送且被他人共享的公共分支历史（会给协作者制造冲突）——除非确认无人依赖。

## 步骤

1. 明确目标、约束与输入（要清理哪些提交？目标分支是什么？是否已推送？）。
2. 风险操作前先建备份分支：`git branch backup-branch`。
3. 选择匹配的技术（rebase / cherry-pick / bisect / worktree / reflog）执行。
4. 校验结果（跑测试、`git log`/`git status` 检查），确认无破坏后再推送。
5. 仅在历史改写后用 `git push --force-with-lease`，绝不裸用 `--force`。

## 指令

### 1. 交互式 rebase（编辑历史的瑞士军刀）
操作动词：`pick` 保留 / `reword` 改信息 / `edit` 改内容 / `squash` 合并(保留信息) / `fixup` 合并(丢弃信息) / `drop` 删除。
```bash
git rebase -i HEAD~5                          # 最近 5 个提交
git rebase -i $(git merge-base HEAD main)     # 本分支相对 main 的全部提交
git rebase -i abc123                          # rebase 到指定提交
```

### 2. Cherry-Pick（跨分支搬运指定提交）
```bash
git cherry-pick abc123            # 单个提交
git cherry-pick abc123..def456    # 区间（不含起点）
git cherry-pick -n abc123         # 只暂存改动，不自动提交
git cherry-pick -e abc123         # 搬运并编辑提交信息
```

### 3. Bisect（二分查找引入 Bug 的提交）
```bash
git bisect start
git bisect bad                    # 标记当前为坏
git bisect good v1.0.0            # 标记已知好点
# git 检出中间提交 → 测试后标记 git bisect good / bad，重复直到定位
git bisect reset                  # 结束
# 自动化：脚本 exit 0=good，1-127(125 除外)=bad
git bisect start HEAD v1.0.0
git bisect run ./test.sh
```

### 4. Worktree（多分支并行，免 stash/切换）
```bash
git worktree list
git worktree add ../project-feature feature/new-feature
git worktree add -b bugfix/urgent ../project-hotfix main
git worktree remove ../project-feature
git worktree prune
```

### 5. Reflog（安全网，记录所有 ref 移动，含已删提交，保留约 90 天）
```bash
git reflog                        # 查看历史
git reflog show feature/branch
git branch recovered-branch abc123   # 从丢失的提交恢复分支
```

### 自动 squash（autosquash）
```bash
git commit --fixup HEAD           # 或指定 hash
git rebase -i --autosquash main   # 自动标记 fixup 提交
```

### 拆分提交
```bash
git rebase -i HEAD~3              # 把目标提交标 edit，git 停在该处
git reset HEAD^                   # 撤销提交但保留改动
git add file1.py && git commit -m "feat: add validation"
git add file2.py && git commit -m "feat: add error handling"
git rebase --continue
```

### 部分 cherry-pick（只取某提交的指定文件）
```bash
git show --name-only abc123
git checkout abc123 -- path/to/file1.py path/to/file2.py
git commit -m "cherry-pick: apply specific changes from abc123"
```

### 恢复命令
```bash
git rebase --abort / git merge --abort / git cherry-pick --abort / git bisect reset
git restore --source=abc123 path/to/file   # 恢复单文件到某版本
git reset --soft HEAD^                       # 撤销上次提交，保留改动
git reset --hard HEAD^                        # 撤销上次提交，丢弃改动
```

## 示例

合并前清理 feature 分支并安全推送：
```bash
git checkout feature/user-auth
git branch backup-user-auth          # 先备份
git rebase -i main                   # squash 修字 / reword / 重排 / drop
git push --force-with-lease origin feature/user-auth
```

把热修复应用到多个 release 分支：
```bash
git checkout main && git commit -m "fix: critical security patch"
git checkout release/2.0 && git cherry-pick abc123
git checkout release/1.9 && git cherry-pick abc123
# 冲突时：git cherry-pick --continue / --abort
```

从误 reset 中恢复：
```bash
git reset --hard HEAD~5      # 误操作！
git reflog                   # 找到 def456 HEAD@{1}: commit: my important changes
git reset --hard def456      # 或 git branch recovery def456
```

## 注意事项

- rebase vs merge：清理本地提交、让分支跟进 main、追求线性历史 → rebase；把完成的功能并入 main、保留协作真实历史、公共分支 → merge。
- 始终用 `--force-with-lease` 而非 `--force`，避免覆盖他人工作。
- 只 rebase 尚未推送共享的本地提交；公共分支 rebase 会给协作者制造冲突。
- 复杂 rebase 前先建备份分支；出错可 `git reset --hard backup-branch`。
- 原子提交 + 描述清晰的提交信息；改写后务必测试。
- bisect 前先 commit 或 stash，工作区要干净。
- 记得清理废弃 worktree（`git worktree prune`），否则占用磁盘。
- reflog 是 90 天内的最后救命稻草，养成意识。

## 互见

源技能还附带以下参考（如需深挖可查源仓库）：交互式 rebase 详解、冲突解决进阶策略、安全改写历史、PR 前清理清单、常用 Git 别名、清理已合并/陈旧分支脚本。

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
