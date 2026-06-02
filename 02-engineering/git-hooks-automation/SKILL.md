---
name: git-hooks-automation
title: Git Hooks 质量门禁
description: 当需要在提交/推送前自动拦截代码质量问题（lint、格式化、类型检查、提交信息规范、密钥/大文件检测）时使用；用 Husky+lint-staged、pre-commit 框架或 core.hooksPath 搭建团队共享 Git 钩子并产出可执行配置；不适用于 CI 流水线编排或替代真实测试评审。触发词：git hooks、pre-commit、husky、lint-staged、commitlint、commit-msg、pre-push
domain: 研发/devops
triggers: [设置 git hooks, 添加 pre-commit 钩子, husky, lint-staged, commitlint, commit-msg 校验, pre-push 钩子, 提交信息规范, Conventional Commits, core.hooksPath, Husky v4 升级 v9, 提交前自动 lint, core.hooksPath 共享钩子]
tags: [git, git-hooks, husky, lint-staged, pre-commit, commitlint, 代码质量, CI, 研发, misc]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Bash, Edit, Write, Read]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

在「问题进 CI 之前」于本地拦截：把 lint、格式化、类型检查、测试、提交信息校验、密钥/大文件扫描挂到 Git 生命周期，秒级反馈而非分钟级。

适用：
- 要求"配置 git hooks / 加 pre-commit 钩子"。
- 搭建 Husky、lint-staged、pre-commit 框架或 commitlint。
- 强制 Conventional Commits 提交规范。
- 提交前 lint/格式化/类型检查，推送前跑测试。
- 从 Husky v4 迁移到 v9+，或从零引入钩子。

不该用（负边界）：
- 设计/编排 CI 流水线本身（钩子只是第一道防线，CI 才是事实来源）——这属于 CI 模板范畴。
- 把钩子当作替代真实测试、环境验证或人工评审的手段。
- 所需输入（技术栈、目标钩子、规范约束）不明时，先澄清再动手。

核心约束：`.git/hooks/` 是本地的、不随仓库共享，所以才需要 Husky 或 `core.hooksPath`。

## 步骤

1. 判断技术栈：Node/TS 选 Husky+lint-staged；Python/多语言选 pre-commit 框架；其他语言用 shell 脚本 + `core.hooksPath`。
2. 安装并初始化钩子目录。
3. 配置「仅对暂存文件」运行的命令（速度关键）。
4. 按需加 commit-msg（提交信息规范）与 pre-push（测试）。
5. 全量跑一次校验存量代码，再纳入团队共享（提交到仓库）。
6. 在 CI 中复跑同一套校验，兜住被 `--no-verify` 绕过的提交。

## 指令

Husky v9+（Node/TS）：

```bash
npm install --save-dev husky lint-staged
npx husky init                       # 生成 .husky/ 目录与 pre-commit
echo "npx lint-staged" > .husky/pre-commit
```

`package.json` 中配置 lint-staged（只跑暂存文件）：

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix --max-warnings=0", "prettier --write"],
    "*.{css,scss}": ["prettier --write", "stylelint --fix"],
    "*.{json,md,yml,yaml}": ["prettier --write"]
  }
}
```

提交信息校验（commitlint）：

```bash
npm install --save-dev @commitlint/cli @commitlint/config-conventional
# commitlint.config.js: extends ['@commitlint/config-conventional']，可加 subject-max-length=72 等规则
echo "npx --no -- commitlint --edit \$1" > .husky/commit-msg
echo "npm test" > .husky/pre-push   # 推送前跑测试
```

pre-commit 框架（Python/多语言）—— `.pre-commit-config.yaml` 用 YAML 声明、隔离环境运行：

```bash
pip install pre-commit
# 配置 repos：pre-commit-hooks(trailing-whitespace/check-yaml/check-added-large-files --maxkb=500/detect-private-key)、black、ruff(--fix)+ruff-format、shellcheck、conventional-pre-commit(stages:[commit-msg])
pre-commit install
pre-commit install --hook-type commit-msg
pre-commit run --all-files          # 首次全量
```

常用命令：`pre-commit autoupdate`（更新版本）、`pre-commit run <hook-id>`、`pre-commit clean`（清缓存）。

任意语言 —— 共享自定义 shell 钩子：

```bash
git config core.hooksPath .githooks   # 指向仓库内目录，随仓库共享
chmod +x .githooks/*
```

绕过钩子（应稀少）：`git commit --no-verify`、`git push --no-verify`、`SKIP=eslint git commit ...`。

## 示例

`.githooks/pre-commit` 便携脚本（任意语言，关键逻辑）：

```bash
#!/bin/sh
set -e
# 1. 禁止直接提交到 main/master
BRANCH=$(git symbolic-ref --short HEAD 2>/dev/null || echo detached)
[ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ] && { echo "禁止直接提交到 $BRANCH，请用特性分支"; exit 1; }
# 2. 调试残留：console.log / debugger / binding.pry / import pdb -> 命中即 exit 1
# 3. 大文件 >1MB -> exit 1
# 4. 密钥模式 AKIA[0-9A-Z]{16} / sk-... / ghp_... / password=... -> 命中即 exit 1
echo "✅ 全部 pre-commit 校验通过"
```

CI 复跑（GitHub Actions，兜底被绕过的钩子）：

```yaml
# pre-commit/action@v3.0.1 或：npm ci && npx eslint . --max-warnings=0 && npx prettier --check .
```

## 注意事项

- 只跑暂存文件：绝不在每次提交时 lint 整个代码库（用 lint-staged，而非 `eslint src/`）。
- 能自动修就自动修：多用 `--fix` 降低开发摩擦。
- 钩子要快：pre-commit 目标 < 5 秒；频繁被 `--no-verify` 绕过说明钩子太慢或太严，应修钩子而非纵容绕过。
- 失败要响亮：错误信息附带可执行的修复指引。
- 团队共享：用 Husky 或 `core.hooksPath` 让钩子纳入版本控制；纯 `.git/hooks/` 改动无法分享。
- CI 是事实来源：钩子是便利，CI 才是强制执行者，两者校验保持一致。
- 渐进引入：先只做格式化（低摩擦），1-2 周后加 lint，再加提交信息校验、pre-push 测试，避免团队抵触。

常见排错：钩子静默跳过→未安装，跑 `npx husky init` / `pre-commit install`；"Permission denied"→`chmod +x`；本地通过 CI 失败→在 CI 固定 Node/Python 版本。Husky v4→v9 迁移：卸载旧版并删 `.husky`、删 `package.json` 里 `husky.hooks` 配置，再 `npx husky init` 重建钩子（新版用 `.husky/` 目录里的纯脚本）。

## 互见

- `codebase-audit-pre-push` —— 推送前的深度审计。
- `bash-pro` —— 自定义钩子的进阶 shell 脚本。
- `github-actions-templates` —— CI/CD 工作流模板。
- `verification-before-completion` —— 声明完成前的验证。

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
