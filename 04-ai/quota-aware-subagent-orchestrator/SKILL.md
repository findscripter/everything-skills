---
name: quota-aware-subagent-orchestrator
title: 配额感知子智能体编排：大型多文件任务并行
description: 当一个任务横跨 3 个以上文件/组件、想多智能体并行推进、且曾在任务中途撞上配额耗尽时使用；做任务分解为隔离子智能体使命、按规模与复杂度路由模型（默认便宜快模型，贵模型限 1 个）、上下文隔离派发、依赖分轮并行执行并做轮间抽检与集成校验，产出一份 Mission Brief 编排蓝图与可交付集成结果；不适用于单文件改动、修单个 Bug、写 50 行内小脚本或只生成计划/回答问题。触发词：配额感知编排、多智能体并行、大型多文件任务
domain: 智能/agents
triggers: [配额感知子智能体编排, 多智能体并行推进任务, 任务横跨3个以上文件或组件, 中途撞上配额耗尽, 把大任务拆成隔离使命, 按规模和复杂度路由模型, 上下文隔离派发子智能体, 依赖分轮并行执行, 轮间抽检与集成校验, Mission Brief 编排蓝图]
tags: [子智能体编排, 配额感知, 并行多智能体, 任务分解, 模型路由, 上下文隔离, 成本控制, 多文件任务]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Task/Agent, Bash, Read, Edit, Write]
requires: []
related: [parallel-agent-hub, multi-agent-orchestrator, dmux-multi-agent-workflows, cost-aware-llm-pipeline]
combines_with: [parallel-agent-dispatch, llm-model-router, task-decomposition-planner]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

当一个任务大到值得拆成多个隔离子智能体并行推进、且你关心配额/成本不被烧穿时使用本技能。典型场景：

- 任务横跨 3 个以上文件或组件。
- 想让多个智能体同时干活以提吞吐。
- 以前在任务中途撞上过配额耗尽。
- 任务既要规划又要构建。
- 需要浏览器智能体 + 代码智能体 + 终端智能体协同。

**不该用的边界**：

- 只改一个文件、修一个 Bug。
- 写 50 行以内的快脚本。
- 只是问个问题或只要一份计划——不要为它套多智能体编排，纯增成本与故障面。

## 步骤

编排者全程遵循六阶段：`分解 → 配额路由 → 上下文隔离 → 分轮并行 → 错误恢复 → 集成校验`。

1. **分解（DECOMPOSE）**：派生任何子智能体前，先产出一份 Mission Brief（见「指令」格式），声明目标、智能体数、配额策略与每个智能体的角色/范围/模型/输入/输出/依赖。**必须等用户确认 Brief 后再继续；用户改了就更新并复核，绝不跳过此步。**
2. **配额路由（QUOTA ROUTING）**：按决策树给每个智能体定模型（见「指令」），严守模型成本铁律。
3. **上下文隔离（CONTEXT ISOLATION）**：给每个智能体一份「上下文包」，只投喂它需要读/写的文件，显式排除无关文件，绝不把整个代码库丢给所有人。
4. **分轮并行（PARALLEL EXECUTION）**：按依赖关系分轮——同轮内无依赖者一条消息一次性并行派发；下一轮等上一轮全部产物到齐再开。每轮之间做三点抽检（见「指令」），任一不过就只重跑该智能体，**绝不把坏产物级联给下游**。
5. **错误恢复（ERROR RECOVERY）**：某子智能体失败时，不重跑整个使命；定位失败点，只派一个修复智能体，范围限于坏文件 + 报错信息为上下文，用最便宜模型修，验证通过再继续。
6. **集成校验（INTEGRATION CHECK）**：全部完成后跑一遍集成清扫（见「指令」清单），有问题就再派一个范围精确的修复智能体。

## 指令

**Mission Brief 格式**（分解阶段产出，待用户确认）：

```
MISSION BRIEF
─────────────────────────────────────────
Goal: [一句话：完成长什么样]
Total Agents: [N]
Quota Strategy: [便宜快模型 / 强模型 / 混合]
Expected Token Cost: [LOW / MEDIUM / HIGH]

AGENTS:
[1] ID: agent-001
    Role: [规划 / 构建 / 测试 / 浏览器]
    Scope: [该智能体触碰的确切文件或 URL]
    Model: [便宜快模型 / 强模型]
    Input:  [它收到什么]
    Output: [它产出什么]
    Depends on: [none / agent-00X]
[2] ...
─────────────────────────────────────────
```

**配额路由决策树**：

```
任务 > 20 文件 或 > 500 行新代码？
  YES → 全员用便宜快模型，强模型只留给最终评审。
  NO  → 是创意 UI / 复杂逻辑 / API 设计？
          YES → 构建智能体用强模型，其余全用便宜快模型。
          NO  → 全员便宜快模型。
```

**模型成本铁律（永不违反）**：

- 最贵的旗舰模型 → 子智能体里**绝不使用**，太贵。
- 强模型 → 每个使命**最多 1 个**子智能体。
- 便宜快模型 → 所有子智能体的默认，快、省、独立配额池。
- 浏览器子智能体 → 独立配额池，**每使命最多 1 个**，慎用。

**上下文包格式**（每个智能体一份）：

```
AGENT CONTEXT PACKET — agent-[ID]
Files to read:  [只列它需要的]
Files to write: [只列它会创建/编辑的]
Do NOT read:    [显式排除无关文件]
Knowledge:      [只贴相关那一段项目说明]
```

约束：智能体若不需要 `node_modules`、`package-lock.json`、`.next/`、`dist/`，在它运行前就把这些加进忽略清单（如 `.antigravityignore` 或等价机制）。

**轮间三点抽检**：① 智能体有没有越出分配的范围？② 与其他智能体产物有无 import/export 冲突？③ 有没有留占位符（`TODO`、`implement later`）？任一为「是」→ 用纠正后的上下文重跑该智能体，不放行。

**集成校验清单**：

- [ ] 所有 import 都能解析
- [ ] 跨文件无重名函数/变量
- [ ] 无应改为环境变量的硬编码值
- [ ] 生产文件无残留 `console.log` 等调试输出
- [ ] 跨组件类型一致（TypeScript）
- [ ] 心算 `npm run build` 应能通过

**配额监控**：全程估算用量。

| 事件 | 配额影响 |
|------|---------|
| 派生智能体 | LOW |
| 索引文件（每个） | LOW |
| 工具调用（读写文件） | MEDIUM |
| 终端命令 | MEDIUM |
| 激活浏览器子智能体 | HIGH |
| 开启思考模式 | VERY HIGH |

估算用量越过 **60% 冲刺配额**时：暂停并报告「配额检查点：约 60% 已用，继续还是推迟剩余智能体？」，把剩余智能体切到便宜快模型，未启动则禁用浏览器子智能体。

**沟通规则**：始终播报当前在跑哪个智能体；轮间给紧凑进度条；不要连续超过一个智能体回合静默；被卡就明说原因，绝不无声中止。

```
Mission Progress: ████████░░ 4/5 agents complete
Quota Status:     ▓▓▓▓░░░░░░ ~40% sprint used
```

## 示例

**场景：实现一个完整功能（后端 API + 前端 UI），3 个智能体并行。**

1. 分解：产出 Mission Brief —— Goal=「上线 X 功能」，Total Agents=3，Quota Strategy=混合。
   - `agent-001` 规划者（便宜快模型，划分契约与文件边界，无依赖）。
   - `agent-002` 后端构建（便宜快模型，范围 `api/`，依赖 agent-001）。
   - `agent-003` 前端构建（强模型，范围 `ui/`，依赖 agent-001）。
   等用户确认。
2. 配额路由：< 20 文件且涉及创意 UI → 仅前端构建用强模型，其余便宜快模型。
3. 上下文隔离：后端智能体只读 `api/` 与接口契约、显式排除 `ui/`；前端反之。把 `node_modules/`、`dist/` 加入忽略。
4. 分轮并行：Round 1 跑 agent-001；Round 2 一条消息并行派发 agent-002 + agent-003；Round 3 集成 + 验证。
5. 轮间抽检：发现前端 import 了后端尚未导出的类型 → 只重跑 agent-003（喂入正确契约），不级联。
6. 集成校验：跑清单，残留一处硬编码 URL → 派一个范围精确到该文件的修复智能体改为环境变量。

## 注意事项

- 本技能编排的是**智能体的规划与协作**，不提供运行时调度器，也不自动强制配额上限——配额估算与暂停决策需编排者主动执行。
- 并行智能体仍需父智能体显式划界、抽检与集成，工具不替你保证正确性。
- **绝不把坏产物级联给下游**：永远先修好再前进。
- 派发同轮智能体务必**一条消息一次性并行启动**，否则退化为串行，白费并行收益。
- 分解阶段的「待用户确认」是硬关卡，不可省略。
- 文中模型档位（便宜快模型 / 强模型 / 旗舰模型）为相对成本概念，落到你的实际平台时映射到对应价位的模型即可。

## 互见

- related：`multi-agent-workflow-designer` —— 先选定编排模式（顺序/并行/路由/编排器/评估器）再用本技能落地分工。
- related：`parallel-agent-hub` —— 同任务多方案竞赛择优（本技能是分工协作而非竞赛）。
- related：`multi-agent-system-designer`、`agent-workflow-pattern-designer` —— 多智能体系统/模式设计。
- combines_with：`cost-aware-llm-pipeline` —— 配额路由与成本控制的更细粒度策略。
- combines_with：`context-window-management`、`context-compression` —— 上下文隔离阶段控制每个智能体的上下文预算。

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可），适配重写为中文版，非逐字翻译。原技能针对 Antigravity 2.0 平台，本版抽象为平台无关的配额感知编排范式。
