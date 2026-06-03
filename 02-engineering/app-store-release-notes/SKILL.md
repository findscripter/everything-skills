---
name: app-store-release-notes
title: 应用商店发版说明生成（基于 Git）
description: 当需要把上次发布以来的 git 提交历史转写为面向用户的应用商店「What's New / 发版说明」时使用；做提交收集→用户影响筛选→按 新增/改进/修复 分组并产出 5-10 条短句要点；不适用于面向开发者的技术变更日志（CHANGELOG）、版本号判定或发布流程编排（用 release-manager）。触发词：发版说明、What's New、release notes
domain: 研发/devops
triggers: [生成应用商店发版说明, What's New 文案, App Store release notes, 把提交转成用户可见要点, 上线更新说明, 应用更新点提炼]
tags: [研发, 发布, 发版说明, app store, release-notes, git, 文案]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [git, bash]
requires: [git-advanced-workflows]
related: [release-manager, ios-swiftui-developer]
combines_with: [conversion-copywriter]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---

# 应用商店发版说明生成（基于 Git）

## 何时使用

适用场景：

- 用户要为某个版本写应用商店「What's New」/ 更新说明 / release notes，且变更来源是 git 历史。
- 需要把一堆原始 commit 转成简短、面向用户、讲收益的要点列表。

不该用（负边界）：

- 面向开发者的技术变更日志（Conventional Commits 分组的 CHANGELOG）、语义化版本判定、发布分支/回滚/部署编排 → 用 `release-manager`。
- 没有 git 历史、纯靠口述需求写更新点（本技能以提交范围为事实锚点）。

## 步骤

1. **收集变更**：在仓库根目录跑脚本，拿到提交与改动文件清单。默认对比「上一个 tag → HEAD」；无 tag 时回退到全量历史。需要指定范围时传 `<since-ref> <until-ref>`。
2. **按用户影响筛选**：扫提交与文件，挑出用户可见的变化；按主题归为 **新增 / 改进 / 修复** 三组并去重；丢弃内部工作（构建脚本、重构、依赖升级、CI、日志、analytics——除非影响用户隐私或行为）。
3. **起草商店要点**：每条用户可见变化写成一句话、讲收益的要点；用清晰动词和大白话，避开内部黑话；通常 5-10 条（用户另有要求则从之）。
4. **校验**：每条要点都能映射回范围内的真实变更；查重、查过度技术化措辞；遇到含糊或疑似内部变更，停下来向用户确认。

## 指令

收集变更（`scripts/collect_release_changes.sh` 的核心逻辑，可直接在仓库根目录复现）：

```bash
since_ref="${1:-}"        # 缺省时自动取上一个 tag
until_ref="${2:-HEAD}"
# 无入参时：git describe --tags --abbrev=0 取最近 tag；取不到则回退全量历史
range="${since_ref:+$since_ref..}$until_ref"

git rev-parse --show-toplevel                                   # 仓库根
git log --reverse --date=short --pretty=format:'%h|%ad|%s' $range   # 提交
git log --reverse --name-only --pretty=format:'--- %h %s' $range    # 改动文件
```

指定范围示例：`scripts/collect_release_changes.sh v1.2.3 HEAD`。

筛选与措辞规则（来自 references/release-notes-guidelines.md）：

```
保留：新功能、UI 变化、行为变化、用户能感知的 bug 修复、有可见影响的性能优化
排除：重构、依赖升级、CI、开发工具、内部日志；analytics 除非影响隐私/行为
措辞：翻译技术术语为用户视角；忌用 "API/refactor/nil/crash log/dependency"、内部代号、工单号、文件路径
动词：Added / Improved / Fixed / Updated 或 Search / Upload / Sync；时态用现在或过去式
形态：每条一句、以动词开头；整版 5-10 条；提供了商店字数上限就遵守
```

## 示例

提交 → 商店要点（翻译方向示意）：

| 原始 commit | 商店要点 |
|---|---|
| `fix(auth): resolve token refresh race condition on iOS 17` | 修复了一个可能导致部分用户被意外退出登录的问题。 |
| `feat(search): add voice input to search bar` | 新增语音输入，解放双手搜索你的资料库。 |
| `perf(timeline): lazy-load images to reduce scroll jank` | 时间线滑动更顺滑、更快了。 |

**直接丢弃**（无用户影响）：`chore: upgrade fastlane to 2.219`、`refactor(network): extract URLSession wrapper`、`ci: add nightly build job`。

输出形态：

```
What's New in Version 3.4

• 新增语音输入，解放双手搜索你的资料库。
• 时间线滑动更顺滑、更快了。
• 修复了一个可能导致部分用户被意外退出登录的问题。
• 设置页新增深色模式支持。
• 打开大型相册时的加载更快了。
```

输出格式：标题可选（"What's New" 或 产品名+版本）；正文仅要点列表、每条一句；若用户给了商店字数上限则严格遵守。

## 注意事项

- 范围决定一切：每条要点必须能回溯到 `since..HEAD` 内的真实提交，否则删。无 tag 时脚本会用全量历史，结果可能过长，需主动收敛或与用户确认起始点。
- 含糊变更别硬写：拿不准是否用户可见时，宁可询问，或仅在确属用户可见时弱化为「一处小改进」。
- 守住边界：不要把它当作环境相关验证、测试或专家评审的替代品；缺少必要输入/权限/安全边界/成功标准时，停下来澄清。
- 与技术 CHANGELOG 区分：本技能产出的是营销/用户语气文案，不是给开发者的结构化变更日志。

## 互见

- requires：`git-advanced-workflows` —— 需会用 `git log` / `git describe` 取提交范围与最近 tag。
- related：`release-manager`（技术变更日志、版本判定、发布编排）、`ios-swiftui-developer`（iOS/App Store 上下文）。
- combines_with：`conversion-copywriter` —— 把「讲收益、动词开头」的要点打磨得更有转化力。

---

采编自 sickn33/antigravity-awesome-skills（MIT）。
