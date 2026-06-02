---
name: release-manager
title: 发布管理与部署协调
description: 当需要规划版本发布、生成变更日志、协调部署、创建发布分支或自动化版本号时使用；做发布全流程编排（语义化版本、变更日志、就绪检查、灰度/回滚/热修复）并产出发布计划与文档；不适用于纯需求评审、CI/CD 流水线脚本细节实现或代码审查本身。触发词：发布、changelog、回滚
domain: 研发/devops
triggers: [规划版本发布, 生成变更日志 changelog, 协调上线部署, 创建发布分支 release branch, 自动化版本号 SemVer, 热修复 hotfix 上线, 灰度发布与回滚预案, conventional commits 解析]
tags: [研发, devops, 发布管理, 语义化版本, changelog, 部署协调, 回滚, 热修复]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [git, conventional-commits, SemVer, CI/CD]
requires: []
related: []
combines_with: []
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

适用场景：

- 需要从 git 历史自动生成结构化变更日志（基于 Conventional Commits）。
- 需要根据提交分析判定语义化版本号的升级（MAJOR/MINOR/PATCH 或预发布）。
- 规划发布、做发布就绪评估、协调多方干系人沟通与排期。
- 准备灰度/蓝绿发布、回滚预案、热修复（hotfix）应急流程。
- monorepo 多包独立版本与协调发布。

不该用（负边界）：

- 纯产品需求评审、设计讨论，与发布编排无关时。
- 具体 CI/CD 流水线 YAML/脚本的逐行实现（本技能给策略与门禁，不替代平台配置）。
- 代码审查本身（应走 code review 流程）。

## 步骤

1. 收集提交：取上次发布 tag 以来的 git log，按 Conventional Commits 解析 `<type>[scope]: <desc>`。
2. 判定版本升级（自动规则）：
   - MAJOR：任意提交含 `BREAKING CHANGE` 或 type 后带 `!`。
   - MINOR：存在 `feat` 且无破坏性变更。
   - PATCH：仅 `fix`/`perf`/`security`。
   - 不升级：仅 `docs`/`style`/`test`/`chore`/`ci`/`build`。
   - 预发布递进：`alpha → beta → rc → 正式`（如 `1.0.0-rc.2 → 1.0.0`）。
3. 生成变更日志：按 Added/Changed/Deprecated/Removed/Fixed/Security 分组，突出破坏性变更，链接 PR/Issue `(#123)`，保留 scope 分组与 `Co-authored-by`。
4. 选择分支工作流：Git Flow / Trunk-based / GitHub Flow（见下）。
5. 过发布就绪检查清单（功能、质量门禁、文档、干系人签批）。
6. 编排部署时序与监控，准备回滚触发条件与预案。
7. 发布后监控关键指标，在回滚窗口内做去留决策。

## 指令

判定版本升级（参考规则）：

```
MAJOR: 任意提交含 BREAKING CHANGE 或 type 后带 "!"
MINOR: 任意 feat（无破坏性变更）
PATCH: fix / perf / security
NO BUMP: 仅 docs/style/test/chore/ci/build
```

预发布递进：

```
# Alpha:  1.0.0-alpha.1 → 1.0.0-alpha.2
# Beta:   1.0.0-alpha.5 → 1.0.0-beta.1
# RC:     1.0.0-beta.3  → 1.0.0-rc.1
# 正式:    1.0.0-rc.2    → 1.0.0
```

Git Flow 发布流程（关键命令）：

```bash
git checkout -b release/1.2.0 develop   # 从 develop 切发布分支
# 完成版本号升级与 changelog 定稿
# 合并回 main 和 develop
git tag v1.2.0                            # 打标签
# 从 main 部署
```

monorepo 多包：独立分析各包受影响提交，支持 scoped 版本 `@scope/package@1.2.3`，生成跨包协调发布计划。

## 示例

Conventional Commits 与对应升级：

```
feat(user-auth): add OAuth2 integration        # → MINOR
fix(api): resolve race condition in user creation  # → PATCH
docs(readme): update installation instructions     # → 不升级

feat!: remove deprecated payment API           # → MAJOR
BREAKING CHANGE: The legacy payment API has been removed
```

变更日志结构：

```markdown
## [1.2.0] - 2024-01-15
### Added
- OAuth2 authentication support (#123)
### Fixed
- Race condition in user creation (#134)
### Breaking Changes
- Removed legacy payment API
```

部署时序（蓝绿）：

```
T-24h  代码冻结、最终验证
T-2h   执行并校验数据库迁移
T-0    蓝绿切流，逐步导入流量
T+1h   监控指标与日志
T+4h   回滚决策点
```

## 注意事项

- 回滚优先级：能用「关闭 feature flag」就不要做代码回滚；数据库优先「只进式迁移」（加列而非删列），破坏性迁移前必须备份。
- 回滚触发线（参考）：错误率 >2x 基线（30 分钟内）、延迟上升 >50%、核心功能损坏、安全事件、数据损坏。
- 热修复分级：P0 完全中断/数据丢失/安全漏洞，2 小时内修复，需工程负责人 + on-call 经理批准；P1 主功能损坏，24 小时内；P2 进入下个发布周期。hotfix 从最近稳定版切分支，只改根因，加速测试后紧急部署，事后做复盘。
- 质量门禁建议：单测覆盖率 ≥ 85%，集成/E2E 通过，静态分析与安全扫描、依赖审计干净。
- 发布前 48 小时功能冻结；建立可预期的发布节奏；用金丝雀/灰度逐步放量并监控。
- 反模式：手工部署、临门改动、跳过测试、巨型低频发布、无回滚预案、环境漂移（生产与预发不一致）。
- 关注指标：前置时间、部署频率、MTTR、变更失败率、回滚率、热修复率。

## 互见

- code-review：发布前的代码审查。
- verify / run：发布前在真实环境验证变更是否生效。
- schedule / loop：发布后定期监控或巡检。

---

采编自 alirezarezvani/claude-skills（MIT）。
