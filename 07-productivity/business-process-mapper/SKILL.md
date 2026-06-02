---
name: business-process-mapper
title: 业务流程绘制与瓶颈分析
description: 当需要把采购/入职/事故交接/客户开通等内部业务流程文档化、按阶段量化周期时间并定位瓶颈时使用；产出泳道流程图、周期分析（P50/P90、增值比、Little 定律吞吐）与按严重度排序的瓶颈清单（含根因假设与单点改进建议）；不适用于销售漏斗、系统 SLO 可靠性或一次性项目管理。触发词：业务流程图、流程梳理、瓶颈分析、周期时间、value stream、BPMN、cycle time、bottleneck
domain: 协作/automation
triggers: [业务流程图, 流程梳理, 瓶颈分析, 周期时间, 增值比, value stream, BPMN, cycle time, bottleneck]
tags: [bizops, process, bpmn, bottleneck, cycle-time, lean, six-sigma, value-stream]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python3, process_documenter.py, bottleneck_detector.py, cycle_time_analyzer.py, json]
requires: []
related: [coo-operations-advisor, ops-capacity-planner, company-operating-system, mermaid-diagram-expert]
combines_with: [coo-operations-advisor, zapier-make-automation, ops-capacity-planner]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

当一名运营负责人（BizOps/COO/流程改进 Owner）需要做以下事情时使用本技能：

- 把一条可重复的内部业务流程（采购申请、供应商/员工入职、事故交接、报销、客户开通、理赔审核等）用 BPMN 风格的泳道图文档化。
- 已知流程"太慢"但说不清瓶颈在哪一阶段。
- 已在测周期时间，却没测增值比（VA%），判断不出流程是健康还是充满浪费。
- 跨职能交接频繁掉单、根因不明。

核心洞察：办公流程的总耗时里，绝大部分是排队/等待/审批时间，而非真正在做事。瓶颈用确定性规则点名，不靠 LLM 直觉。

**不该用的边界（务必先判断再决定是否调用）：**

- 销售漏斗、线索转化、客户成功留存等**对外**增长动作 —— 本技能只管**内部**运营流程。
- 系统可靠性 SLO / 错误预算 / 燃尽告警 —— 那是系统正常运行时间，不是业务流程周期时间。
- 战略层面"该先修哪条流程"的优先级决策 —— 本技能是优先级定下来之后的**战术执行**工具。
- 一次性项目，或 Jira/Confluence 工单跟踪 —— 本技能做流程**设计**，不做工单**追踪**。
- 用户连阶段级周期数据（哪怕是粗略 P50/P90 估值）都给不出 —— 那么第一步应是去埋点测量流程，而不是画图。

## 步骤

确定性五步流，三个脚本仅依赖 Python 标准库：

1. **录入（Intake）。** 把流程写成一个 JSON 文件，每个阶段一条记录，字段：`name`、`owner`、`type`（`value-add` | `wait` | `rework`）、`duration_minutes_p50`、`duration_minutes_p90`。顶层还需 `process_name` 与 `wip`（在制品数量，供 Little 定律用）。
2. **绘制阶段图。** 运行 `process_documenter.py`，产出 ASCII 泳道图 + 规范化 JSON 工件。泳道按 owner 分行，跨职能交接一目了然。
3. **测周期时间。** 运行 `cycle_time_analyzer.py`，计算总 P50、总 P90、增值比 VA%、等待%、返工%，以及 Little 定律吞吐估算（WIP / 周期时间）。判定：**VA% > 25% = 健康（HEALTHY）；10–25% = 典型（TYPICAL，多数非制造流程落在此区间）；< 10% = 浪费严重（WASTE-HEAVY）**。
4. **检测瓶颈。** 运行 `bottleneck_detector.py` 并指定 `--profile`（saas / services / manufacturing / healthcare），产出按严重度（CRITICAL / HIGH / MEDIUM）排序的清单，每条含根因假设 + 一条推荐动作。
5. **给建议。** 把瓶颈清单与周期判定结合，依 Goldratt"一切服从于约束"原则，每次只推荐**一个**聚焦约束点的改进动作。绝不建议优化非约束阶段。

## 指令

模板与三脚本配套使用（先填模板的阶段表，再翻译成 JSON）：

```
python3 scripts/process_documenter.py    --input my-process.json
python3 scripts/bottleneck_detector.py   --input my-process.json --profile saas
python3 scripts/cycle_time_analyzer.py   --input my-process.json --profile saas
```

- `process_documenter.py`：读取并校验流程 JSON，输出 Markdown 泳道图（按 owner 分行，阶段标注 type + 时长）及下游可用的规范化 JSON。`--sample` 可打印一个 6 阶段采购申请示例。
- `bottleneck_detector.py` 的三条确定性规则：
  - **R1：** 某阶段 P50 > 2× 增值阶段均值 → 阶段瓶颈。
  - **R2：** 等待态占总周期 > 40% → 交接瓶颈。
  - **R3：** 返工占总周期 > 15% → 质量瓶颈。
  - 阈值随 `--profile` 调整：manufacturing 容忍的等待最少（wait≤30%、返工≤10%、倍数 1.8），services（≤50%/15%/2.5）与 healthcare（≤55%/12%/2.5）因人工/监管环节容忍更高，saas 为默认基线（≤40%/15%/2.0）。
- **type 三类定义（Lean 正典）：** `value-add` = 从客户视角真正改变工作产物、客户愿意为之付费（多数阶段并非增值）；`wait` = 排队/闲置/等人，是办公流程周期膨胀的最大来源；`rework` = 修复上游缺陷而存在，Six Sigma 视其为上游质量问题。

## 示例

一条采购申请流程的典型阶段（节选 JSON）：

```json
{
  "process_name": "采购申请",
  "wip": 12,
  "stages": [
    {"name": "提交申请", "owner": "申请人", "type": "value-add", "duration_minutes_p50": 15, "duration_minutes_p90": 30},
    {"name": "等待经理审批队列", "owner": "经理", "type": "wait", "duration_minutes_p50": 480, "duration_minutes_p90": 1440},
    {"name": "等待财务复核", "owner": "财务", "type": "wait", "duration_minutes_p50": 720, "duration_minutes_p90": 2880},
    {"name": "返工——缺供应商 W-9", "owner": "申请人", "type": "rework", "duration_minutes_p50": 120, "duration_minutes_p90": 360}
  ]
}
```

跑下来两段 `wait` 合计远超处理时间，VA% 很可能落入 WASTE-HEAVY；R2 触发交接瓶颈，约束点是审批队列，建议是移除交接/取消批处理，而非给等待型流程加人。

## 注意事项

- **一次只映射一条流程。** Goldratt：约束是单点。同时画十条会稀释注意力。
- **不要优化非约束阶段。** 若阶段 4 是瓶颈，加速阶段 2 只会在阶段 4 前堆积在制品。一切服从于约束。
- **别把总周期时间当成处理时间。** 二者几乎从不相等，VA% 揭示这道鸿沟。
- **别给等待型流程加人。** 等待时间不靠堆人头解决，靠移除交接或批处理。
- **别把返工当独立问题。** 返工环路属于流程图的一部分；藏起来会低估真实周期时间。
- **type 标注必须诚实。** 把"等待"错标成"增值"是最常见的数据质量失败。
- **as-is 优先。** 先映射现状流程，识别瓶颈后再画 to-be 目标流程（Rother & Shook《Learning to See》）。
- **能用真实数据就别用估值。** 从工单系统（Jira/ServiceNow/Zendesk）拉阶段时长；估值仅供首轮，做任何变更决策前须替换为实测值。

## 互见

- `first-principles-thinking`：在质疑"流程为何如此"、拆解约束根因时配合使用。

---

本条采编自 alirezarezvani/claude-skills（MIT 许可）。
