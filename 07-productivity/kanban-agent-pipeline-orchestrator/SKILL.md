---
name: kanban-agent-pipeline-orchestrator
title: 看板智能体流水线：Asana/Linear 自动开发编排
description: 当想把现有看板（Asana/Linear/GitHub Projects）当成分布式状态机、编排多个 Claude Code worker 跑完「构建→评审→测试→集成」全自动开发流水线时使用；做的事是把 SPEC 拆成带依赖的看板任务、按传递优先级派单、用确定性门禁（tsc/eslint/test）+对抗式评审把关、逐任务记成本、无守护进程崩溃可恢复；不适用于单 worker 小改动、无看板/PM 工具、或不接受 AI 自动改主干的场景；触发词：看板编排、kanban orchestration、自动开发流水线、SDLC orchestrate、多 worker 派单、对抗式评审 adversarial review
domain: 协作/automation
triggers: [看板编排, kanban orchestration, 自动开发流水线, SDLC orchestrate, 多 worker 派单, 对抗式评审, adversarial review, 质量门禁 quality gate, 传递优先级 transitive priority, 成本守护 cost guardrail]
tags: [kanban, orchestration, sdlc, multi-agent, quality-gates, cost-tracking, asana, linear]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [claude-code, git, crontab, tsc, eslint, asana, linear, github-projects]
requires: []
related: [multi-agent-orchestrator, agent-workflow-builder, parallel-agent-hub, dmux-multi-agent-workflows]
combines_with: [quota-aware-subagent-orchestrator, task-decomposition-planner, jira-expert]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
# 看板智能体流水线：Asana/Linear 自动开发编排

## 何时使用

适用场景：

- 想把现有看板（Asana / Linear / GitHub Projects）当成「分布式状态机」，让多个 Claude Code worker 自主跑完构建→评审→测试→集成的完整开发生命周期。
- 需要在 AI 评审之前先过确定性硬门禁（tsc + eslint + 测试），用近乎零成本拦掉大部分问题。
- 需要从手机端就能观测整条流水线，并随时拖动卡片人工接管。
- 单人或小团队项目，需要自主派单 + 逐任务成本核算 + 跨会话崩溃可恢复的编排。

不该用：

- 单个 worker 即可完成的小改动，没有多阶段流转需求。
- 没有看板 / PM 工具，或团队不接受 AI 自动改动主干（本技能会自动合并并在失败时 `git revert`）。
- 缺少清晰 SPEC、CI 命令、权限或验收标准时——先停下来补齐，别贸然开跑。

## 步骤

核心模型：**7 阶段看板流水线**＝Backlog → Research → Build → Review → Test → Integrate → Done。看板本身就是编排层，无需独立数据库 / 消息队列。状态全部活在 PM 工具里，因此崩溃即可恢复。

1. **写 SPEC**：创建 `SPEC.md` 描述要构建什么（用于后续哈希比对防需求漂移）。
2. **拆解上板**：`/spec-to-board` 读 SPEC，拆成原子任务、映射依赖、写到看板。
3. **起 worker**：开 3–4 个终端，每个一个 slot（建议 2 个 builder + 1 reviewer + 1 tester），各自领任务、写代码、开 PR。
4. **起编排器**：把一次性 sweep 加进 crontab，每 15 分钟扫一次——**无守护进程、无会话依赖**，崩了下一轮自动续上。编排器按「传递优先级」派单：谁能解锁最多下游任务就先建，自动算关键路径，并做冲突检测。
5. **监控与干预**：手机打开看板看任务流动；把任意卡片拖到「Needs Human」即可人工接管；`/sdlc-health` 看终端仪表盘。
6. **停机**：`/sdlc-stop` 优雅排空——在跑的 worker 做完手头任务，未开始的任务退回 Backlog。

## 指令

可用命令：

- `/spec-to-board` —— 把 `SPEC.md` 拆成带依赖的原子任务并建到看板。
- `/sdlc-orchestrate` —— 按传递优先级 + 冲突检测派单；以 crontab sweep 形式运行。
- `/sdlc-worker --slot <N>` —— 在某个终端 slot 跑 worker，领任务、写代码、开 PR；并行跑 3–4 个。
- `/sdlc-health` —— 实时仪表盘：每个任务的当前阶段、负责 Agent、重试次数、累计成本。
- `/sdlc-stop` —— 优雅停机。

阶段门禁（晋级前强制）：

```
Build  → Review   : tsc + eslint + npm test 全过（确定性）
Review → Test     : 对抗式评审者必须先列出 3 个问题，再决定是否放行
Test   → Integrate: 新文件覆盖率达 80%
Integrate → Done  : 合并后在 main 跑全量测试；失败自动 git revert
```

起多 worker（每个终端一条）：

```bash
claude -p "/sdlc-worker --slot T2"   # Builder
claude -p "/sdlc-worker --slot T3"   # Builder
claude -p "/sdlc-worker --slot T4"   # Reviewer
claude -p "/sdlc-worker --slot T5"   # Tester
```

起编排器（crontab，每 15 分钟一次 sweep）：

```bash
crontab -e
# 追加：
*/15 * * * * ~/.claude/sdlc/agentflow-cron.sh >> /tmp/agentflow-orchestrate.log 2>&1
```

逐任务成本天花板（Sonnet 默认）：Research ~$0.10 / Build ~$0.40 / Review ~$0.10 / Test ~$0.05 / Integrate ~$0.03。守护：$3/$8 告警，$10/$20 硬停（Sonnet/Opus）并升级人工。

## 示例

最小闭环：

```bash
# 1) 写好 SPEC.md 后，拆解上板
claude -p "/spec-to-board"

# 2) 开 4 个终端起 worker（见上）

# 3) crontab 起编排器，手机看板观察任务流动

# 4) 收工
claude -p "/sdlc-stop"
```

人工接管：任意时刻把卡片拖到「Needs Human」，worker 不再碰它；处理完拖回对应阶段即可。

## 注意事项

- **先确定性后概率性**：硬门禁（tsc/eslint/test）能近零成本拦掉约 60% 问题，绝不要跳过。
- **对抗式评审**防止橡皮图章：评审 Agent 必须先列 3 个问题才能判过。
- **绝不 force-push 主干**：集成失败用 `git revert`（新提交，保 main 稳定）。
- **崩溃可恢复**：状态全在 PM 工具，sweep 一次性运行无守护进程，崩了下一轮续跑。
- **卡死/掉线检测**：心跳每 5 分钟，超 10 分钟无响应自动重派；任务卡 15 分钟以上没动、无新评论时用 `/sdlc-health` 查，必要时手动拖回 Backlog。
- **2 次失败升级人工**；成本触顶任务打 `COST:CRITICAL` 标并转「Needs Human」——决定加预算 / 简化 / 拆分。
- **范围与需求漂移**：PR diff 文件对照预测清单查 scope creep；SPEC 用 SHA-256 哈希比对查中途需求变更。
- worker 数不要超过项目实际可并行度；定期回看 LEARNINGS.md 的失败模式。

## 互见

- requires：`multi-agent-orchestrator` —— 先掌握单编排器的拆解 / 路由 / 质量门禁 / 心跳基本盘，再上看板级全流水线。
- related：`task-decomposition-planner`、`prd-spec-writer`、`jira-expert`、`scrum-master-analytics` —— SPEC 拆解、需求规格、看板/敏捷协作。
- combines_with：`agent-workflow-builder`（编排单个 worker 的内部工作流）、`enterprise-project-manager`（把自动流水线接进项目治理）。

---

本条采编自 sickn33/antigravity-awesome-skills（MIT）。
