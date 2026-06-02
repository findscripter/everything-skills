---
name: changelog-generator
title: 变更日志自动生成
description: 当需要从 commit/PR/tag 自动产出 CHANGELOG 与 release notes、统一提交规范或配置发布流水线时使用；做基于 Conventional Commits + Keep a Changelog + SemVer，用 standard-version、semantic-release、git-cliff、commitizen 生成变更日志并联动版本号与 GitHub Release；不适用于人工手写/逐条编辑变更日志，也不覆盖无版本概念的产品文档撰写；触发词：changelog、变更日志、release notes、发布说明、conventional commits、约定式提交、语义化版本、semver、standard-version、semantic-release、git-cliff、commitizen
domain: 协作/automation
triggers: [changelog, 变更日志, release notes, 发布说明, conventional commits, 约定式提交, 语义化版本, semver, standard-version, semantic-release, git-cliff, commitizen]
tags: [changelog, release, conventional-commits, semver, automation, ci-cd, git]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [standard-version, semantic-release, git-cliff, commitizen, commitlint, husky, github-actions, git]
requires: []
related: [release-manager, git-advanced-workflows, technical-change-tracker, github-issue-writer]
combines_with: [release-manager, ci-cd-pipeline-builder, git-advanced-workflows]
license: MIT
source: wshobson/agents
source_license: MIT
---
## 何时使用

- 需要从 git 提交、PR、tag 自动生成 `CHANGELOG.md` 或 GitHub/GitLab release notes。
- 团队要统一提交规范（约定式提交 Conventional Commits），并据此自动推断版本号。
- 配置发布流水线：版本递增 + 打 tag + 生成日志 + 发布，一条龙自动化。

不该用的边界：

- 纯手工维护、逐条人肉编辑的变更日志（本技能强调「只用工具生成、不手改」）。
- 没有版本/发布概念的普通产品说明、用户手册撰写。
- 提交历史完全不遵循任何约定、且不打算改造规范时，自动化收益很低，应先治理提交规范。

## 步骤

1. **定规范**：采用 Conventional Commits 提交格式 `<type>[scope]: <description>`，并用 `commitlint` + `husky` 在 commit 时校验。
2. **定映射**：明确 type 到 changelog 分区与版本位的映射（见下「指令」表）。
3. **选工具**：Node 项目用 `standard-version`（半自动）或 `semantic-release`（全自动）；跨语言/要速度用 `git-cliff`（Rust）；Python 用 `commitizen`。
4. **接 CI**：在 GitHub Actions 中跑发布任务，自动 bump 版本、生成日志、推 tag、建 Release。
5. **遵循 Keep a Changelog 1.1.0 结构** 输出 `Added/Changed/Deprecated/Removed/Fixed/Security` 分区。

## 指令

约定式提交 type 与 changelog 分区 / SemVer 位的映射（关键约束，务必一致）：

| type | changelog 分区 | 版本影响 |
| --- | --- | --- |
| `feat` | Added | MINOR |
| `fix` | Fixed | PATCH |
| `perf` / `refactor` | Changed | PATCH |
| `revert` | Removed | — |
| `docs`/`style`/`test`/`chore`/`ci`/`build` | 通常排除 | — |
| `feat!` 或带 `BREAKING CHANGE:` footer | Breaking | MAJOR |

SemVer 规则：`MAJOR.MINOR.PATCH` — 破坏性变更进 MAJOR，新功能进 MINOR，修复进 PATCH。

提交规范要点：一次提交只做一件事；用 `Closes #123` / `Fixes #456` 关联 issue；破坏性变更必须用 `!` 或 `BREAKING CHANGE:` footer 标注。

## 示例

提交信息（约定式）：

```bash
feat(auth): add OAuth2 support for Google login

fix(checkout): resolve race condition in payment processing

Closes #123

feat(api)!: change user endpoint response format

BREAKING CHANGE: The user endpoint now returns `userId` instead of `id`.
```

方案 A — standard-version（半自动，Node）：

```bash
npm i -D @commitlint/cli @commitlint/config-conventional husky standard-version
npx husky init
echo "npx --no -- commitlint --edit \$1" > .husky/commit-msg
# package.json scripts
#   "release": "standard-version"
#   "release:minor": "standard-version --release-as minor"
#   "release:dry": "standard-version --dry-run"
```

方案 B — git-cliff（Rust，快，跨语言）：

```bash
git cliff -o CHANGELOG.md                  # 全量生成
git cliff v1.0.0..v2.0.0 -o RELEASE_NOTES.md  # 指定区间
git cliff --unreleased --dry-run           # 预览不写盘
```
`cliff.toml` 关键：`conventional_commits = true`、`commit_parsers` 把 `^feat`→Features、`^fix`→Bug Fixes，并 `^chore\(release\) skip = true`。

方案 C — commitizen（Python）：

```bash
pip install commitizen
cz commit                  # 交互式生成规范提交
cz bump --changelog        # 递增版本并更新 CHANGELOG
```

方案 D — CI（GitHub Actions 核心）：`actions/checkout@v4` 需 `fetch-depth: 0`，配 `permissions: contents: write`，跑 `npx semantic-release`；或手动 `npx standard-version --release-as ${{ inputs.release_type }}` 后 `git push --follow-tags`。

## 注意事项

- **只生成、不手改**：日志由工具产出，避免人工编辑造成漂移。
- 提交务必过 `commitlint` 校验，并在 CI 流水线中校验，防止不规范提交进入历史。
- `subject` 控制在 72 字符内；禁止 start-case/pascal-case/upper-case 主题。
- semantic-release 需在 CI 配好 `GITHUB_TOKEN` / `NPM_TOKEN`；checkout 必须 `fetch-depth: 0` 才能读到完整 tag 历史。
- 破坏性变更不可遗漏标注，否则版本号会被错误推断为 MINOR/PATCH。

## 互见

- code-reviewer：评审提交与 PR 质量，与提交规范治理互补。
- dependency-auditor：发布说明中的「Dependencies Updated」可结合依赖审计结果填充。

---

本条采编自 wshobson/agents（MIT 许可）。
