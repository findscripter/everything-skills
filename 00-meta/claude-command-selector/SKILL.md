---
name: claude-command-selector
title: Claude命令与技能选择指南
description: 当不确定该用哪个 Claude Code 命令/Agent/Skill，或想查 /plan、/compact、/loop 等用法与触发时机时使用；做命令选择决策、产出推荐组合与决策路径；不适用于需要这些命令实际执行任务（本条只做选择与推荐，不替代具体执行）。触发词：用哪个命令、哪个 agent、命令速查表
domain: 通用/learning
triggers: [不知道用哪个命令, 该用哪个 agent, 命令选择, /plan 怎么用, 什么时候 /compact, agent 选择指南, 命令速查表, 技能推荐, which command to use, which agent, command cheat sheet]
tags: [claude-code, 命令选择, agent, skill, 工作流, 决策矩阵, 通用, 学习]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [/plan, /tdd, /e2e, /code-review, /build-fix, /compact, /clear, /loop, planner, code-reviewer, build-error-resolver, security-reviewer, tdd-guide]
requires: []
related: [skill-optimizer, skill-creator]
combines_with: []
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

- 面对一项任务，不确定该选哪个斜杠命令、Agent 还是 Skill 时。
- 想快速查 `/plan`、`/tdd`、`/compact`、`/loop` 等命令的适用场景与触发时机时。
- 需要按「任务阶段 / 问题类型 / 开发类型」给出推荐工具组合时。
- 想要一份命令速查表或决策路径图时。

不该用的边界：
- 本条只负责「选哪个」与「何时触发」，不替代被选中命令/Agent 的实际执行。真正干活时切到对应工具。
- 不同环境装的命令/Agent 可能不同，先用 `/help` 核实本机实际可用项，本表为通用参考。

## 步骤

1. 判断请求类型：新功能 / Bug 修复 / 代码审查 / 测试 / 上下文过长 / 文档 / 循环任务 / 安全审查。
2. 按下方决策路径定位首选命令或 Agent。
3. 若任务跨多个阶段，参考「场景决策矩阵」组合工具（计划在前、测试在中、审查在后）。
4. 判断可否并行：独立任务并行，有依赖则串行。
5. 执行后按「上下文管理时机」决定是否 `/compact`。

## 指令

决策路径（核心分支）：

```
用户请求
├─ 新功能        → /plan（进入 Plan 模式）→ planner
├─ Bug 修复      → /tdd（先写测试）或 build-error-resolver
├─ 代码审查      → /code-review 或 code-reviewer
├─ 测试          → /e2e 或 tdd-guide
├─ 上下文过长    → /compact
├─ 文档          → /docs 或 docs-lookup
├─ 循环任务      → /loop
└─ 安全审查      → security-reviewer
```

命令速查表：

```
开发工作流：
/plan        进入计划模式（复杂任务）
/tdd         TDD 工作流
/e2e         端到端测试
/code-review 代码审查
/build-fix   修复构建

会话管理：
/compact     压缩上下文
/clear       清空会话
/loop        循环任务，如：/loop 5m check build status
/fast        快速模式（仅 Opus 4.6）
/model       切换模型，如：/model sonnet

文档与记忆：
/docs        更新文档
/remember    保存记忆
/tasks       查看任务

帮助：
/help        查看全部命令
```

自动触发规则（无需用户明示即可主动调用）：

| 情况 | 自动动作 |
|------|----------|
| 写完/改完代码 | 立即调用 `code-reviewer` |
| 构建失败 | 立即调用 `build-error-resolver`（最小改动、快速修复） |
| 复杂功能请求 | 立即调用 `planner` |
| 处理鉴权/敏感数据 | 立即调用 `security-reviewer`（OWASP 检测） |
| 新功能/Bug 修复 | 立即调用 `tdd-guide`（先写测试） |
| 架构决策 | 立即调用 `architect` |

上下文管理时机（触发 `/compact`）：

- Token > 150K：立即压缩。
- 响应变慢：建议压缩。
- 任务阶段切换 / 里程碑完成：在边界处压缩后继续。
- 调试结束转新任务：用 `/clear` 清掉调试痕迹。
- 最佳实践：调研后、实现前压缩（保留计划）；里程碑完成后压缩（清中间态）；切勿在实现中途压缩（会丢变量与路径）。

## 示例

场景决策矩阵（按任务阶段）：

| 阶段 | 推荐组合 |
|------|----------|
| 需求分析 | `planner` + `Explore`（先计划后探索） |
| 架构设计 | `architect` + `api-design` skill |
| 开发前 | `tdd-guide` + `tdd-workflow` skill（测试先行） |
| 开发中 | 直接编辑 + 快速迭代（保持心流） |
| 开发后 | `code-reviewer` + `verification-loop`（质量门） |
| 测试阶段 | `e2e-runner` + `e2e-testing` skill |
| PR 前 | `security-reviewer` + `verification-loop`（最终验证） |

按开发类型选 Skill：

- 前端功能：`frontend-patterns` + `tdd-workflow`
- 后端 API：`backend-patterns` + `api-design` + `tdd-workflow`
- MCP 服务：`mcp-server-patterns` + `tdd-workflow`
- 安全功能：`security-reviewer` + `security-review` skill

并行 vs 串行：

- 可并行（彼此独立）——PR 前：`code-reviewer`（质量）∥ `security-reviewer`（安全）∥ `e2e-runner`（端到端）。
- 必串行（存在依赖）——新功能：`planner` → `tdd-guide` 写测试 → 实现 → `code-reviewer`；构建错误：`build-error-resolver` → 测试验证 → `code-reviewer`。

完整示例（新增用户鉴权功能）：

1. `/plan` → planner 出计划
2. tdd-guide → 写测试
3. 实现 → 编辑代码
4. code-reviewer → 代码审查
5. security-reviewer → 安全审查（鉴权敏感）
6. e2e-runner → 端到端测试
7. `/compact` → 里程碑完成后压缩

## 注意事项

- 核心原则：计划先行（复杂任务用 `/plan`）；测试先行（新功能用 `tdd-guide`）；写完即审（`code-reviewer`）；构建一挂即修（`build-error-resolver`）；敏感代码必审（`security-reviewer`）；PR 前全面验证（`verification-loop`）。
- 本表中的具体命令名/Agent 名随版本与配置而异，落地前先 `/help` 确认；不可用时选用功能等价项。
- `/fast` 仅在 Opus 4.6 下可用；`/compact` 在实现中途调用有丢上下文风险，谨慎使用。

## 互见

- TDD 工作流、端到端测试、安全审查（OWASP）等具体执行类技能。
- 会话与上下文压缩策略（strategic-compact / verification-loop）。

---

采编自 alirezarezvani/claude-skills（MIT 许可证）。
