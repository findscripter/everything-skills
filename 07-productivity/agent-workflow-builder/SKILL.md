---
name: agent-workflow-builder
title: 多智能体工作流编排脚本构建
description: 当需要为 Claude Code 的 Workflow 工具编写确定性、可恢复的多智能体编排脚本（.claude/workflows/ 下的 .js 文件），把任务扇出给全新上下文子智能体时使用；做需求 intake、拓扑选型并产出可运行的工作流脚本（扇出/流水线/循环/评审团）；不适用于单智能体单任务（用 Agent）或需模型动态决定步骤的可复用流程（用 Skill）。触发词：工作流编排、workflow、多智能体、子智能体编排、fan-out、pipeline、judge-panel、agent fan-out、orchestrate sub-agents
domain: 协作/automation
triggers: [工作流编排, workflow, 多智能体, 子智能体编排, fan-out, pipeline, judge-panel, agent fan-out, orchestrate sub-agents, 扇出, 流水线, 评审团]
tags: [workflow, multi-agent, orchestration, automation, claude-code, fan-out, pipeline, sub-agent]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Claude Code Workflow 工具, /workflows, CLAUDE_CODE_WORKFLOWS, JavaScript, Python, JSON Schema, scaffold_workflow.py, validate_workflow.py, workflow_intake.py]
requires: []
related: [multi-agent-orchestrator, task-decomposition-planner, multi-agent-workflow-designer, agent-workflow-pattern-designer]
combines_with: [task-decomposition-planner, multi-agent-orchestrator, multi-agent-system-designer]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
为 Claude Code 的 Workflow 工具编写可运行的编排脚本：用纯 JavaScript 控制流，把工作确定性地扇出给一批「全新上下文」子智能体。只有叶子 `agent()` 调用消耗 token，主会话保持干净，整个运行可中断、可恢复。

## 何时使用

满足以下任一条件，工作流才值得它的成本：工作可并行或多阶段、必须可复现、链路足够长以致可能中途失败（恢复很关键）、或每步都需隔离在各自的上下文窗口里。

选型对照：

| 场景 | 用什么 |
|------|--------|
| 单个子智能体、一个任务 | 普通 Agent 工具 |
| 可复用流程、由 Claude 动态决定步骤 | 一个 Skill |
| 多个子智能体、固定拓扑、确定且可恢复 | Workflow（本技能）|

不该用的边界：一次性任务直接让 Claude 做；若 intake 后发现只是单智能体单任务，明确建议改用 Agent；若是需要模型自行挑选步骤而非固定拓扑的流程，建议改用 Skill。

## 步骤

每次会话必须先做 intake，不要跳过直接写代码。

1. 问清要建什么。核心问句：要自动化的可重复多步任务是什么？单个子智能体一次做的「一个工作单元」是什么？单元数量是已知清单还是靠循环发现？后续步骤是否需要一次性拿到全部前序结果，还是每条数据可独立流转？是否有步骤需要返回结构化数据（判定/列表/分数）？大概要消耗多少 token、走多深（定预算护栏）？
2. 用户含糊时不要追问到底，跑推荐引擎把已知信息转成 1-2 个具体方案，并连同理由一起给出（「这是我会建的方案和原因」）。
3. 与用户确认形态（拓扑 + 阶段 + 并行还是流水线）后再落盘——这是唯一的审批门。

答案映射拓扑：独立单元+已知清单+末尾汇总 → 扇出后汇总；有序阶段+各条独立推进 → 流水线（默认首选）；某阶段需要全部前序集合做去重/合并/计数提前退出 → 屏障；数量未知、按目标/预算/枯竭停止 → 受护栏约束的循环；解空间宽、要 best-of-N → 评审团；错误代价高 → 在该结论上加怀疑投票验证。

## 指令

构建 → 校验 → 运行循环：

1. 从确认的拓扑生成脚手架：
```bash
python scripts/scaffold_workflow.py --topology pipeline --name pr-triage \
  --description "Triage open PRs" > .claude/workflows/pr-triage.js
```
2. 编辑文件：先写 `meta` 块（纯字面量、首条语句），再写 async 主体，使用注入的全局：`agent()`、`pipeline()`、`parallel()`、`phase()`、`log()`、`budget`、`args`、`workflow()`。
3. 运行前先校验，拦住会让解析器致命失败的错误：
```bash
python scripts/validate_workflow.py .claude/workflows/pr-triage.js
```
4. 运行：`export CLAUDE_CODE_WORKFLOWS=1` 开启特性，把文件存到 `.claude/workflows/`，用 `/workflows` 启动并实时观察。按 P 暂停/恢复，按 X 跳过某个子智能体；失败的智能体会自动重试。

关键 API：`agent(prompt, opts?)` 返回文本或（设了 `schema` 时）校验过的对象；`opts` 含 `label`、`phase`、`schema`、`model`（`haiku`/`sonnet`/`opus`/`inherit`/完整模型 ID）、`isolation: 'worktree'`。`pipeline(items, ...stages)` 各条数据独立穿过所有阶段、阶段间无屏障；`parallel(thunks)` 并发跑一组 `() => Promise` 缩略函数并等全部完成（屏障）。`budget` 有 `total`/`spent()`/`remaining()`，超额抛 `WorkflowBudgetExceededError`。模型选择：分类/抽取用轻模型（Haiku），综合/硬推理用重模型（Opus）。

## 示例

扇出后汇总——已知清单、各自一遍、末尾合一：
```js
const findings = await parallel(
  questions.map((q, i) => () =>
    agent(`Research and report verified facts:\n\n${q}`,
          { label: `q${i + 1}`, schema: RESEARCH_SCHEMA }))
)
const report = await agent(
  `Synthesize these findings into one report:\n${JSON.stringify(findings.filter(Boolean))}`,
  { model: 'opus' }
)
```

流水线——各条数据就绪即推进，不等同伴：
```js
const results = await pipeline(
  DIMENSIONS,
  d => agent(d.prompt, { label: `review:${d.key}`, phase: 'Review', schema: FINDINGS_SCHEMA }),
  review => parallel((review?.findings ?? []).map(f => () =>
    agent(`Adversarially verify: ${f.title}`, { schema: VERDICT_SCHEMA })))
)
```

受预算约束的循环——深度随 token 目标伸缩，护栏必备：
```js
const issues = []
while (budget.total && budget.remaining() > 50_000) {
  const r = await agent('Find one more issue not yet reported...', { schema: ISSUE_SCHEMA })
  if (!r?.issues?.length) break
  issues.push(...r.issues)
}
```

`meta` 块写法（首条语句、纯字面量）：
```js
export const meta = {
  name: 'pr-triage',
  description: 'One-line summary',
  whenToUse: 'When to run this',
  phases: [{ title: 'Review', detail: 'One reviewer per PR', model: 'haiku' }]
}
```

## 注意事项

校验器强制的硬规则：
- `meta` 必须是纯字面量且为首条语句——内部不得有变量、展开、模板字符串或函数调用；保留键（`__proto__`、`constructor`、`prototype`）会被拒。
- 禁止非确定性：`Date.now()`、`Math.random()`、无参 `new Date()` 都会破坏恢复——时间戳通过 `args` 传入，需要随机性时改用索引来变化提示词。
- 编排器内禁用文件系统/Node API（`require`、`fs`、`process`、网络）——这些工作要放进 `agent()` 提示词里（子智能体有完整工具权限）。
- `parallel()` 接收缩略函数（`() => agent(...)`），不是裸 Promise。多阶段工作默认用 `pipeline()`，除非某阶段确实需要整批前序结果。
- 每个开放式循环都要用计数器或 `budget.remaining()` 护栏约束，否则会撞上 1000 个智能体的上限（`WorkflowAgentCapError`）。
- 过滤被跳过/失败的智能体：`results.filter(Boolean)`。

其他上限：并发智能体数 `min(16, max(2, 核数 − 2))`；脚本体积上限 524288 字节；每个智能体卡死超时 180000 ms（3 分钟），最多重试 5 次；同步超时 30000 ms 用于捕获无限同步循环。恢复缓存键包含 `schema`/`model`/`isolation`/`agentType`，改动其一会在恢复时重跑该智能体；`label` 与 `phase` 不影响缓存。恢复仅限同一会话：编辑保存的文件后用 `scriptPath` 重新调用。阶段间用 `JSON.stringify(...)` 把结构化数据塞进下一个提示词；`schema` 只约束单次 `agent()` 调用返回的形状。

## 互见

- skill-creator：当 intake 结论是「应做成 Skill 而非工作流」时改用它。
- mcp-builder：子智能体需要自定义工具/资源时，先用它把能力封装成 MCP。
- claude-api：把同类编排思路落到 Anthropic SDK / Managed Agents 代码里时参考。
- code-reviewer：PR 评审、对抗式验证等是本技能扇出/怀疑投票模式的典型应用场景。
- first-principles-thinking：intake 阶段拆解「一个工作单元」与拓扑选型时的思维框架。

---
本条采编自 alirezarezvani/claude-skills（MIT 许可证）。
