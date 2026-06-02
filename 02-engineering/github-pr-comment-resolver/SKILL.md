---
name: github-pr-comment-resolver
title: 处理 GitHub PR 评审评论
description: 当需要系统化回应一个 GitHub PR 上的评审/Issue 评论并落地修改时使用；用 gh CLI 拉取评论、归类规划、改代码并回复 resolved，产出已处理完的评论线程与提交；不适用于创建新 PR、纯本地无 PR 的改动或 GitLab/Bitbucket；触发词：PR 评论、code review、gh pr
domain: 研发/review
triggers: [处理 PR 评论, 回应评审意见, address github comments, gh pr review, resolve PR 评论, review 意见落地]
tags: [github, pull-request, code-review, gh-cli, 研发, review]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [gh, git]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 当前分支已开了 GitHub PR，且有评审评论或 Issue 反馈需要逐条回应、改代码、回复。
- 需要把零散评论系统化归类、规划修复顺序，避免漏处理。

不该用的边界：
- 仅需创建/合并 PR，或还没有 PR 的纯本地改动 —— 不在本技能范围。
- 仓库不在 GitHub（如 GitLab、Bitbucket）—— gh CLI 不适用。
- 评论指向的上下文你尚未读懂时，先读代码再改，不要盲改。

## 步骤

### 0. 确认 gh 已认证

```bash
gh auth status
```

未登录则先 `gh auth login`。

### 1. 拉取评论

获取当前分支 PR 的评论与评审线程：

```bash
gh pr view --comments
```

如仓库提供了列出线程的自定义脚本，可优先使用以获得更结构化的线程列表。

### 2. 归类与规划

- 列出全部评论与 review 线程。
- 对每条提出对应的修复方案。
- 评论较多时，**先等用户确认**优先处理哪些，再动手，不要一次性全改。

### 3. 应用修复

针对选定的评论改代码。改前务必读懂评论所在位置的上下文代码。

### 4. 回复并标记已处理

修复后在对应线程回复，告知已解决：

```bash
gh pr comment <PR_NUMBER> --body "Addressed in latest commit."
```

## 指令

- 始终先 `gh auth status` 验证认证，再开始。
- 用 `gh pr view --comments` 作为评论来源。
- 评论多时停下来等用户确认处理范围与顺序。
- 每改完一条，回到对应线程回复 resolved，保证可追溯。

## 示例

```bash
# 1. 验证认证
gh auth status

# 2. 查看本分支 PR 的评论
gh pr view --comments

# 3. （改完代码后）回复某条评论已处理
gh pr comment 1287 --body "Addressed in latest commit."
```

## 注意事项

- **盲改不读上下文**：改前必读评论周边代码，理解意图。
- **跳过认证检查**：开始前确认 `gh auth status`，否则命令会失败。
- 回复不能替代环境内的验证、测试或专家复核；改动仍需自测。
- 若缺少必要输入、权限、安全边界或验收标准，停下来向用户澄清。

## 互见

- gh CLI 认证与基础用法（`gh auth`）。
- 仓库内列出 review 线程的自定义脚本（若有）。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
