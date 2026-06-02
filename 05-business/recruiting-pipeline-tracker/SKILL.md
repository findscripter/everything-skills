---
name: recruiting-pipeline-tracker
title: 招聘漏斗管理与候选人阶段跟踪
description: 当需要跟踪管理招聘漏斗（从 sourcing 到 offer accepted 的各阶段候选人）并监控招聘转化与效率指标时使用；做漏斗阶段建模、候选人阶段流转跟踪与指标计算，产出阶段看板/各阶段候选人统计/转化与速度指标报告；不适用于面试方案与题库设计（用 interview-plan-builder）、offer 起草与谈薪（用 offer-letter-drafter）、薪酬带宽建模（用 compensation-analysis）。触发词：招聘漏斗、recruiting update、candidate pipeline、how many candidates、hiring status、招聘进展、候选人阶段、漏斗转化、time to fill、offer 接受率
domain: 商业/sales
triggers: [招聘漏斗, recruiting update, candidate pipeline, how many candidates, hiring status, 招聘进展, 候选人阶段, 漏斗转化, time to fill, offer 接受率, 招聘 pipeline, 招聘看板]
tags: [商业, 人力资源, 招聘, 招聘漏斗, pipeline, 候选人跟踪, 转化率, 招聘指标, ATS]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [interview-plan-builder, hr-partner-pro, interview-system-designer, deal-pipeline-tracker]
combines_with: [interview-plan-builder, offer-letter-drafter]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
# 招聘漏斗管理与候选人阶段跟踪

把招聘流程当作一条漏斗来管理：跟踪每位候选人处在 sourcing → offer accepted 的哪个阶段，并基于阶段流转计算转化、速度与渠道效率指标，回答「现在某岗位招到哪一步了 / 各阶段有几人 / 卡在哪 / 多久能填上」这类问题。

## 何时使用

- 招聘经理或 HR 问「这个岗位招聘进展如何 / 各阶段还有几个候选人 / 还要多久能 close」。
- 需要把一批候选人按阶段归位、做成漏斗看板，看清在哪一环掉得最多。
- 要算招聘漏斗指标（阶段转化率、各阶段停留天数、offer 接受率、time to fill、渠道产出）。
- 用户说「recruiting update」「candidate pipeline」「how many candidates」「hiring status」，或在谈 sourcing / screen / interview / offer。

**不该用的边界：**
- 设计面试题库、评分卡、面试官分工 → 用 `interview-plan-builder`（那是 interview 这一**单个阶段内部**的方法）。
- 起草 offer、拼薪酬包、谈薪话术 → 用 `offer-letter-drafter`。
- 设计公司薪酬带宽 / 做薪酬基准 → 用 `compensation-analysis`。
- 写 JD、招聘需求审批、入职手续——超出本条的漏斗跟踪范围。

## 漏斗阶段（固定六阶段）

| 阶段 | 含义 | 关键动作 |
|------|------|----------|
| Sourced（已触达） | 已识别并发出触达 | 个性化 outreach |
| Screen（初筛） | 电话/视频初筛 | 评估基本匹配度 |
| Interview（面试） | 现场或专题/小组面试 | 结构化评估 |
| Debrief（复盘） | 团队做决策 | 校准反馈口径 |
| Offer（发 offer） | 发出录用通知 | 薪酬包、谈薪 |
| Accepted（已接受） | offer 被接受 | 交接到入职 |

每位候选人在任一时刻只处于一个阶段；阶段只向前推进或淘汰（reject），便于统计转化。

## 步骤

1. **确定范围**：先问清是看单个岗位（req）还是多个、时间窗多长。没有岗位/范围就先收敛，别全量铺开。
2. **归位候选人到阶段**：把每位候选人映射到上表六阶段之一；淘汰的标 rejected 并记录所在阶段（用于算各阶段 drop-off）。接入 ATS 时直接拉取候选人与状态，否则按用户提供的名单/表格录入。
3. **出漏斗看板**：按阶段聚合，给每阶段的候选人数（必要时列名单），形成从 Sourced 到 Accepted 的漏斗视图，让掉量环节一眼可见。
4. **算指标**（见下「监控指标」）：转化率、阶段速度、渠道效率、offer 接受率、time to fill。
5. **给结论**：指出瓶颈阶段（转化骤降或停留过久处）、与目标的差距、下一步动作（补 sourcing、催面试、调整 offer 等）。

## 监控指标

- **Pipeline velocity（漏斗速度）**：每个阶段平均停留天数。
- **Conversion rate（转化率）**：相邻阶段的通过/掉量比例（stage-to-stage drop-off）。
- **Source effectiveness（渠道效率）**：哪些来源渠道最终产出 hire。
- **Offer acceptance rate（offer 接受率）**：发出 offer 数 vs. 接受数。
- **Time to fill（填补周期）**：从 req 开启到 offer 被接受的天数。

## 指令

- 若**接入了 ATS（招聘系统）**：自动拉取候选人数据、更新候选人状态、实时跟踪漏斗指标，无需人工录入。
- **无 ATS** 时：以用户提供的候选人名单/表格为准，缺阶段或日期就追问补齐，再做聚合与计算。

漏斗看板建议输出（Markdown）：

```markdown
## 招聘漏斗：[岗位] — [时间窗]
| 阶段 | 在阶段人数 | 本阶段淘汰 | →下一阶段转化率 | 平均停留(天) |
|------|-----------|-----------|----------------|-------------|
| Sourced   | X | X | X% | X |
| Screen    | X | X | X% | X |
| Interview | X | X | X% | X |
| Debrief   | X | X | X% | X |
| Offer     | X | X | X% | X |
| Accepted  | X | — | —  | — |

汇总：time to fill ≈ X 天 · offer 接受率 X% · 最有效渠道：[来源]
瓶颈：[转化骤降/停留过久的阶段] → 建议：[下一步动作]
```

## 示例

用户：「Senior Backend 这个岗现在招到哪一步了？」
1. 范围 = 单岗位 Senior Backend；接入 ATS 则直接拉取，否则要名单。
2. 归位：Sourced 18、Screen 7、Interview 4、Debrief 2、Offer 1、Accepted 0。
3. 算转化：Sourced→Screen 39%、Screen→Interview 57%、Interview→Debrief 50%……发现 Sourced→Screen 掉量最大。
4. 结论：漏斗顶部触达回应率偏低是瓶颈，Offer 阶段尚无产出，time to fill 预计仍需补 sourcing；建议优化 outreach 文案并加大 sourcing 量。

## 注意事项

- **一人一阶段**：同一候选人不要同时计入多个阶段，否则漏斗与转化率失真。
- **淘汰要记阶段**：算 stage-to-stage drop-off 必须知道候选人在哪一阶段被 reject。
- **接受率看的是 total**：offer 接受率分母是「发出的 offer」，不是「面到 Offer 阶段的人」。
- **ATS 数据先核验**：自动拉取的状态可能滞后，关键数字（尤其 offer 状态）发出前对照源系统确认，别用过期导出。
- 涉及候选人个人信息，遵守隐私/合规要求；候选人评估的具体口径属面试方法范畴，转 `interview-plan-builder`。

## 互见

- related：`interview-plan-builder` —— Interview 这一阶段内部的结构化方法（题库、评分卡、复盘）。
- related：`offer-letter-drafter` —— 推进到 Offer 阶段后的 offer 起草与谈薪。
- related：`sales-forecast-builder` —— 同构的「分阶段漏斗 + 转化率 + 速度」建模思路，可类比迁移。
- related：`customer-health-scorer` —— 另一类按阶段/状态跟踪与打分的近亲技能。
- combines_with：`interview-plan-builder`、`offer-letter-drafter` —— 漏斗推进到对应阶段时联用，形成「跟踪→面试→发 offer」闭环。
- combines_with：`hr-partner-pro` —— 接入更宽的招聘与人事流程（JD、入职、headcount）。

---

采编自 anthropics/knowledge-work-plugins（Apache-2.0 许可证）。
