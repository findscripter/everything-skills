---
name: objective-to-build-blueprint
title: 目标转施工蓝图：一句话转可执行分步计划
description: 当一个跨多 PR/多会话/多 Agent 的工程目标需要拆成可独立冷启动执行的施工计划时使用；做研究→设计→起草→对抗评审→登记五步，把一句话目标拆成单 PR 粒度、每步带自包含上下文简报（含分支流程/CI 策略/回滚）的分步蓝图并存档；不适用于单 PR 可完成、用户说「直接做」、纯问答或探索性需求。触发词：施工蓝图、blueprint、目标拆计划、分步执行计划、多 PR 规划
domain: 通用/thinking
triggers: [施工蓝图, blueprint, 目标转计划, 分步执行计划, 多 PR 规划, 多会话工程计划, 单 PR 粒度拆分, 自包含步骤简报, 对抗式计划评审, 冷启动执行, 依赖图与并行步骤, construction plan]
tags: [规划, 施工计划, 任务拆解, 多agent协作, 对抗评审, 分支工作流, 通用]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [plan-execution-checkpoints, task-decomposition-planner, spec-driven-workflow, closed-loop-delivery]
combines_with: [parallel-agent-dispatch, quota-aware-subagent-orchestrator, hierarchical-agent-memory]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

把**一句话目标**变成任何编码 Agent 都能**冷启动执行**的分步施工计划——每一步都带「自包含上下文简报」，一个全新会话里、没读过历史的 Agent 也能直接捡起任意一步开干。

**该用：**

- 目标跨越多个 PR 或多个会话才能完成。
- 多个 Agent / 团队成员需要分工共享执行。
- 希望在执行**前**先对计划做一次对抗式评审。
- 步骤间的并行性识别与依赖图很重要。

**不该用（负边界）：**

- 单个 PR 就能完成的任务——别上蓝图，直接做。
- 用户明确说「直接做 / just do it」——尊重指令，不要插入规划环节。
- 纯问答 / 纯解释，或还在探索、连目标都没定清的需求。

判据：**3+ 个 PR 或多会话 → 用蓝图；否则不用。**

## 步骤

调用形态（源作约定）：`/blueprint <project> <objective>`。内部走五步流水线：

1. **Research（研究）** —— 扫描代码库、读取项目记忆、跑预检（pre-flight checks），摸清现状与约束。
2. **Design（设计）** —— 把目标拆成**单 PR 粒度**的步骤；识别可并行的步骤、画依赖图；为每步分配合适的模型档位（model tier）。
3. **Draft（起草）** —— 用结构化模板生成计划，把**分支工作流规则、CI 策略、回滚策略**内联写进每一步。
4. **Review（对抗评审）** —— 把计划交给「最强模型」子 Agent 做对抗式评审作为执行前的门禁（该模型不可用时优雅降级到默认模型）。
5. **Register（登记）** —— 保存计划并更新项目记忆，供后续会话/Agent 调取。

## 指令

每个步骤必须满足「冷启动可执行」——独立写出，无需读前面的步骤：

- **自包含上下文简报**：该步要改什么、为何改、前置状态、涉及文件、约束，全部就地写清。
- **单 PR 粒度**：一步 = 一个可独立合并的 PR；太大就拆，太碎就并。
- **内联工程纪律**：分支命名/创建流程、CI 必过项、失败回滚策略，写进步骤本身而非散落别处。
- **并行与依赖**：标注哪些步骤可并发、哪些被谁阻塞（依赖图）。
- **计划变更协议（Plan mutation protocol）**：步骤可被**拆分 / 插入 / 跳过**，但须留**审计痕迹**（audit trail），保证计划可追溯演进。

关键差异点（保留源约束）：

- **零运行时风险**：纯 Markdown 产物——无 hook、无脚本、无可执行代码。
- **对抗评审门禁**：执行前必须过一次最强模型评审。
- **优雅降级**：自动探测 `git` / `gh` 可用性，缺失时降级而非报错。

## 示例

```bash
# 示例 1：数据库迁移
/blueprint myapp "migrate database to PostgreSQL"

# 示例 2：插件抽取
/blueprint antbot "extract providers into plugins"
```

单步简报（冷启动）的最小骨架：

```markdown
## Step 3 — 抽取 provider 接口到独立插件（可并行：是；依赖：Step 1）
上下文：providers 现位于 src/core/providers/*，已在 Step 1 完成接口定义。
目标：把 X provider 迁到 plugins/x，对外行为不变。
分支：feat/extract-x-provider（从 main 切出）
CI 必过：unit + 集成测试；lint
回滚：revert 该 PR 即可，无数据迁移。
验收：plugins/x 加载后既有用例全绿。
```

## 注意事项

- **守住边界**：单 PR 能搞定就别上蓝图；用户说「直接做」时不要强行规划。
- **每步真·自包含**：检验标准是「另起一个空会话，只贴这一步，Agent 能不能开工」——不能就补简报。
- **评审是门禁不是摆设**：跳过对抗评审等于放弃执行前纠错的最大价值。
- **变更留痕**：拆/插/跳步骤务必记审计痕迹，否则多 Agent 协作会丢失计划一致性。
- 安装（源作方式，供参考）：`git clone https://github.com/antbotlab/blueprint.git ~/.claude/skills/blueprint`。
- 本技能只在任务清晰匹配上述范围时使用；产出**不替代**针对具体环境的验证、测试与专家评审。缺必需输入 / 权限 / 安全边界 / 成功标准时，停下来澄清。
- 关于分类坐标：本技能本质是「规划流程」（偏 misc），如所在卷受控类集未含 misc，可按生成器校验调整为 `通用/thinking`。

## 互见

- related：`premortem-plan-challenger`（计划落地前的事前验尸式挑战，与第 4 步对抗评审互补）、`structured-decision-framework`（把拆步/取舍沉淀为可追溯决策记录）。
- combines_with：`task-decomposition-planner` —— 提供任务依赖图（blockedBy/blocks）与关键路径，喂给第 2 步的步骤拆分与并行识别；`plan-execution-checkpoints` —— 拿到本蓝图后按批执行、批次间留审阅检查点，承接「计划 → 执行」的下一棒。

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可证）。
