---
name: deal-pipeline-tracker
title: 交易管线与里程碑追踪
description: 当需要同时管理多个进行中的交易/项目，追踪阶段、里程碑、截止日与行动项，并准备周度评审时使用；产出含管线总览、逐笔里程碑表、行动项清单与周度评审摘要的结构化追踪表（Excel/Markdown），自动暴露临近截止与逾期事项；不适用于单笔一次性任务或无需阶段化推进的简单待办。触发词：交易追踪、deal tracker、交易管线、deal pipeline、deal status、进展更新、process update、周度评审、weekly deal review、里程碑追踪
domain: 协作/pm
triggers: [交易追踪, deal tracker, 交易管线, deal pipeline, deal status, 进展更新, process update, 周度评审, weekly deal review, 里程碑追踪]
tags: [pipeline-tracking, milestone, project-management, deal-tracker, weekly-review, action-items]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [excel, markdown]
requires: []
related: [enterprise-project-manager, salesforce-automation, sales-prospecting, deal-desk-reviewer]
combines_with: [salesforce-automation, enterprise-project-manager, cro-revenue-advisor]
license: Apache-2.0
source: anthropics/financial-services
source_license: Apache-2.0
---
## 何时使用

- 同时管理一批进行中的交易/项目（一个 book of business），需要统一掌握各自阶段、里程碑、截止日与负责人。
- 周期性（建议至少每周）做交易/项目评审，需要快速产出"现在到哪了""哪些临近截止""哪些逾期/有风险"的摘要。
- 需要把管线视图用于收入预测或资源排布（按阶段、规模、成单概率聚合）。

不该用边界：
- 单笔、一次性、无阶段推进的任务，用普通待办清单即可，不必引入管线/里程碑结构。
- 需要复杂依赖关系、甘特图与关键路径计算的重型项目管理，应转向专门 PM 工具，本技能只做轻量结构化追踪。

## 步骤

1. 交易建档：为每笔交易记录核心字段——名称/代号、客户/对手方、类型（如卖方/买方/融资/重组）、角色、规模、当前阶段、团队成员、关键日期。阶段建议用统一枚举推进：`Pre-mandate → Engaged → Marketing → IOI → Diligence → Final bids → Signing → Close`（可按业务改写枚举，但全局保持一致）。
2. 里程碑追踪：每笔交易维护一张里程碑表，含「里程碑 / 目标日期 / 实际日期 / 状态 / 备注」，状态用 `On Track / At Risk / Delayed / Complete`。
3. 行动项汇总：跨所有交易维护一张总清单，含「事项 / 所属交易 / 负责人 / 截止日 / 优先级(P0/P1/P2) / 状态(Open/Done/Blocked)」。无负责人、无截止日的行动项视为无效。
4. 周度评审：逐笔生成一句话状态、本周关键进展、未来两周里程碑、阻塞/风险、下周行动项；并给出管线汇总（各阶段交易数、风险交易、新进管线、本季预计完成）。
5. 产出：导出 Excel 工作簿（管线总览一行一笔 + 逐笔里程碑分页 + 行动项主清单 + 周度评审摘要），可选附 Markdown 摘要用于邮件/IM 分发。

## 指令

- 阶段枚举与状态枚举必须全局统一，便于跨交易聚合与筛选；新增交易沿用同一套值。
- 每次评审先扫描两类红旗：里程碑实际日期晚于目标日期（slipping）、行动项已过截止日仍为 Open。优先暴露这两类。
- 行动项一律带「负责人 + 截止日 + 优先级」三要素，缺一不录入。
- 管线视图至少包含 阶段、规模、成单概率 三列，以支撑收入预测。

## 示例

里程碑表（节选）：

| 里程碑 | 目标日期 | 实际日期 | 状态 | 备注 |
|--------|---------|---------|------|------|
| 委托书签署 | 2026-03-01 | 2026-03-03 | Complete | |
| 标的材料分发 | 2026-04-10 | | At Risk | 客户审阅延迟 |
| IOI 截止 | 2026-05-15 | | On Track | |

行动项清单（节选）：

| 事项 | 所属交易 | 负责人 | 截止日 | 优先级 | 状态 |
|------|---------|--------|--------|--------|------|
| 整理买方名单 | Project Atlas | 张三 | 2026-06-05 | P0 | Open |
| 更新估值模型 | Project Atlas | 李四 | 2026-06-08 | P1 | Blocked |

周度评审（单笔）：
1. 一句话状态：Project Atlas 已进入 IOI 阶段，按计划推进。
2. 本周关键进展、未来两周里程碑、阻塞/风险、下周行动项各列要点。

## 注意事项

- 至少每周更新一次；过期失真的追踪表比没有更糟。
- 里程碑出现 slipping 立即标红——早预警胜于到期惊吓。
- 保留对手方/投资人反馈记录，反馈中的规律可反哺策略调整。
- 已完成/已死交易单独归档，保持活跃视图干净。

## 互见

无。

---
本条采编自 anthropics/financial-services（Apache-2.0）。
