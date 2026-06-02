---
name: developer-experience-optimizer
title: 开发者体验优化
description: 当搭建新项目、收到团队反馈或察觉到开发摩擦时使用；做开发者体验诊断与优化，产出 .claude/commands 命令、package.json 脚本、Git 钩子、IDE 配置、Makefile/任务运行器与 README，把克隆到运行压缩到 5 分钟内；不适用于业务功能开发、纯算法实现或与开发流程无关的任务；触发词：开发者体验、onboarding、自动化脚本
domain: 协作/automation
triggers: [开发者体验, DX 优化, onboarding 提速, 搭建新项目, 开发摩擦, 自动化脚本, Git 钩子, 构建提速]
tags: [开发者体验, 工程效率, 自动化, 工具链, onboarding, 协作]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Bash, Read, Edit, Write, Glob, Grep]
requires: []
related: [codebase-onboarding-doc, git-hooks-automation, ci-cd-pipeline-builder, monorepo-navigator]
combines_with: [codebase-onboarding-doc, git-hooks-automation, ci-cd-pipeline-builder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 搭建/初始化新项目，需要可复制的快速上手流程。
- 团队反馈"环境难配""脚本太多记不住""构建太慢"等摩擦点。
- 你在日常开发中察觉到重复手动操作、反馈回路过长。
- 目标是把"克隆到能跑起来"压缩到 5 分钟内。

不该用（负边界）：
- 任务是业务功能、算法实现或与开发流程无关。
- 需要其他领域专长（如安全审计、性能压测）且与 DX 无交集。
- 缺少必要输入、权限或成功标准时——先停下来澄清，不要臆断。

核心理念：好的开发者体验在顺畅时是隐形的，出问题时才显眼。目标是把它做到"隐形"。

## 步骤

1. 画像：剖析当前开发者工作流，记录从克隆到运行的每一步。
2. 定位：找出痛点与耗时点（手动步骤、慢构建、易出错环节）。
3. 调研：针对痛点检索最佳实践与工具。
4. 增量改进：小步实施，每次改一处并验证，避免一次性大改。
5. 度量与迭代：测量影响，对比改进前后指标，持续迭代。

## 指令

- 先澄清目标、约束与必需输入，再动手。
- 应用相关最佳实践，并对结果做验证。
- 给出可执行的步骤和对应的验证方法。
- 需要详细示例时，打开 `resources/implementation-playbook.md`。

四大优化方向：

- 环境搭建：把 onboarding 压到 5 分钟内；提供智能默认值；自动化依赖安装；为失败给出有帮助的错误信息。
- 开发工作流：识别可自动化的重复任务；建立有用的别名与快捷方式；优化构建与测试耗时；改善热重载与反馈回路。
- 工具链增强：配置 IDE 设置与扩展；为常见检查设置 Git 钩子；创建项目专属 CLI 命令；集成有用的开发工具。
- 文档：生成"真的能跑通"的上手指南；提供可交互示例；为自定义命令加内联帮助；维护最新的排错指南。

交付物清单：
- `.claude/commands/` 中针对常见任务的命令补充。
- 改进后的 `package.json` scripts。
- Git 钩子配置。
- IDE 配置文件。
- Makefile 或任务运行器配置。
- README 改进。

成功指标：
- 从克隆到应用运行的时间。
- 被消除的手动步骤数量。
- 构建/测试执行时间。
- 开发者满意度反馈。

## 示例

场景：新人反馈"配环境花了一下午"。
- 画像后发现：手动装 3 个依赖、手填 .env、手起 2 个服务。
- 改进：写一条 `make setup` 一键安装并生成默认 .env；用 `make dev` 并行起服务；在 README 顶部放"克隆 -> setup -> dev"三步。
- 验证：在干净机器上从克隆到首页可访问 < 5 分钟，手动步骤从 7 步降到 2 步。

场景：每次提交都因格式/lint 被 CI 打回。
- 改进：加 pre-commit Git 钩子在本地跑 format + lint，失败即拦截并打印修复命令。
- 验证：CI 因格式问题失败的比例显著下降，反馈回路从分钟级（CI）变为秒级（本地）。

## 注意事项

- 本技能产物不能替代环境相关的实测、测试或专家评审。
- 增量推进，每次只改一处并验证，避免大爆炸式重构。
- 缺少必需输入、权限、安全边界或成功标准时，先停下来澄清再继续。
- 优先解决高频、高耗时的痛点，先量化再优化，用指标证明价值。

## 互见

- 项目初始化与代码库文档：可配合 init 流程沉淀 onboarding 文档。
- 配置 Claude Code 钩子与权限：通过 update-config 把"提交前自动检查"等自动化行为落到 settings.json。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
