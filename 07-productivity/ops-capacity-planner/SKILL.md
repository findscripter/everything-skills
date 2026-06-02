---
name: ops-capacity-planner
title: 运营产能与人力规划
description: 当运营负责人（客服/CX/客户成功/BizOps/IT/财务运营）需要按排队工作量给团队定编、做人力预算、评估利用率风险或排布季度招聘时使用；用 Erlang-C 排队论、P90 需求、缩水率调整的 FTE 与管理跨度触发，产出产能定编、利用率体检与12个月季度招聘计划；不适用于工程产能（看 DORA/周期时间）或3-5年战略人力规划。触发词：产能规划、定编、利用率、招聘排期
domain: 协作/pm
triggers: [运营产能规划, 团队定编/headcount 预算, 利用率超过80%或团队12个月内增长超50%, 客服/CX/客户成功/BizOps/IT/财务运营人力测算, 排队工作SLA未达标排查（定编/流程/瓶颈）, 季度招聘排期与管理岗触发, Erlang-C/P90 需求/缩水率 FTE 测算, M&A 或新业务线团队定编]
tags: [bizops, 产能规划, headcount, 利用率, 排队论, Erlang-C, Little定律, 招聘排期]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Bash, Read, Write]
requires: []
related: [coo-operations-advisor, business-process-mapper, company-operating-system, enterprise-project-manager]
combines_with: [coo-operations-advisor, business-process-mapper, startup-financial-modeler]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

面向**处理排队工作**（工单、案例、工作项）的运营团队定编：客服、CX、客户成功、BizOps、IT 运营、财务运营。基于 Erlang-C 排队论、Little 定律与运营管理经典（Fournier、Larson、Cleveland、Reinertsen）。纯确定性计算，仅用 Python 标准库，无 LLM 调用。

典型触发：
- **年度运营产能规划**（次财年的 10-11 月）。
- **季度再定编**：需求变化超 15% 或流失率骤升。
- **预算答辩**：用算术而非"感觉"向 CFO 论证 headcount。
- **诊断**：团队持续未达 SLA，需判断是定编、流程还是瓶颈问题。
- **M&A / 新业务线**：为新团队或合并组织定编。
- 适用门槛：团队**持续利用率高于 80%**，或**12 个月内增长超 50%**。在确定 headcount 预算前运行。

**不该用边界**：
- 工作不是排队制（项目型工作）→ 用错了技能。
- **工程产能** → 用 DORA 四项指标 / 周期时间 / WIP 那套（不同工作单元、不同数学）。
- **3-5 年战略人力规划**（能力组合、人才供给、继任）→ 属战略 HR，本技能只做 0-12 个月的运营定编。
- 项目交付吞吐（Jira 速度、冲刺容量）→ 用项目管理工具。
- 先**找瓶颈**再定编：若不知道瓶颈在哪，先做流程映射（process-mapper），再用本技能围绕已知瓶颈定编——绕着错误约束招人等于浪费。

## 步骤

1. **取需求分布**。从工单系统（Zendesk、Intercom、JSM、ServiceNow、Salesforce）拉取每日工单/案例量的 P50/P90/P99。**只有均值时立刻停下去拉分布**——单点需求估计是运营中最昂贵的反模式。
2. **建模吞吐**。用你的需求、AHT（平均处理时长）、SLA 目标、当前 FTE、缩水率运行 `capacity_modeler.py`，按职能加 `--profile`。**读 80% 利用率那一行——那是你的定编点**。
3. **标利用率风险**。对团队真实利用率数据运行 `utilization_analyzer.py`。任何人**持续 >85%** 即吞吐崩溃风险（Reinertsen）；团队内差距 >30 个百分点为 UNBALANCED（失衡）——招人前先修。
4. **排招聘**。用当前 FTE、年末目标、爬坡时长、流失率、增长率运行 `hiring_sequencer.py`。它会前置招聘（Q1 35%、Q4 15%）、套用爬坡曲线，并在管理跨度越过 **7 IC/经理**时触发管理岗招聘。
5. **过逼问清单**（见下）。一次一题，不许跳。提交计划前答案必须写下来。

## 指令

三个脚本均支持 `--input <path>`（JSON）、`--output {markdown,json}`、`--sample`（内置示例）、`--help`，纯标准库。

- `scripts/capacity_modeler.py` —— Erlang-C 定编，含缩水率调整与 P50/P90/P99 违约概率；`--profile` 取行业默认值。产出 70/80/90% 利用率下所需 FTE、各点 P(SLA 违约) 与 SAFE/WATCH/AT_RISK/CRITICAL 风险带。`--profile` 可选 `support / cx / bizops / finance-ops / it-ops`。
- `scripts/utilization_analyzer.py` —— 逐人红绿灯 + 团队级健康判定（HEALTHY/SQUEEZED/OVERLOADED/UNBALANCED），含方差检测。
- `scripts/hiring_sequencer.py` —— 12 个月季度计划，含爬坡、流失、增长、每季度最大招聘数约束与管理岗触发逻辑。

运行示例：

```bash
python scripts/capacity_modeler.py --profile support --sample
python scripts/capacity_modeler.py --input demand.json --profile cx --output json
python scripts/utilization_analyzer.py --input team_util.json
python scripts/hiring_sequencer.py --input hiring.json --output markdown
```

**关键约束（建模假设）**：
- 工作必须**排队**（工单/案例/工作项），非项目型。
- 一个季度内需求分布**足够平稳**；阶跃变化（新品发布、M&A、监管变动）需季中重跑。
- 至少 **90 天历史需求数据**才能算 P50/P90/P99；不足则先从销售/用户量预测生成分布。
- 队列内为**单一服务等级**；若有硬优先级分层（P1/P2/P3 各有 SLA），每层建一个独立队列再求和。
- **多渠道需连贯建模**：用对应 `--profile`，内置缩水率溢价。

## 示例

`capacity_modeler.py` 的输入 JSON 骨架：

```json
{
  "team_name": "Tier-1 Support",
  "demand": {
    "tickets_per_day_p50": 320,
    "tickets_per_day_p90": 480,
    "tickets_per_day_p99": 720
  },
  "sla_target_minutes": 60,
  "current_fte": 12,
  "avg_handle_time_minutes": 18,
  "shrinkage_pct": 30,
  "working_hours_per_day": 8
}
```

行业 `--profile` 默认（缩水率% / SLA 目标分钟）：support 30/60、cx 32/30、bizops 25/240、finance-ops 22/480、it-ops 28/120。缩水率 = 不可用于产出工单的带薪时间占比（培训、休息、同步、PTO、临时打断）。

读结果时：先看 80% 利用率行定编；P(P90 违约)>10% 说明定编点欠员；P(P99 违约)>50% 说明没有峰值预案。

## 注意事项

**反模式（Top 8，详见来源清单）**：
1. 按 100% 利用率规划（Reinertsen 原则 12）。
2. 把爬坡当瞬时（Larson）。
3. 12 个月计划忽略流失（Bersin）——30% 年流失下，20 人团队一年走约 6 人，"净增 5"实为"招 11"。
4. 永远只招 IC、无管理岗触发（Fournier）——越过 7 IC/经理后 1:1 退化，越过 10 即覆盖危机，**在跨 10 之前**招经理。
5. 只按 P50 需求定编（Cleveland）——会有一半时间错过 SLA；按 P99 又超配 30-50%，**P90 才是正确运营定编点**。
6. 不做缩水率调整（Cleveland、SRE Workbook）。
7. 多渠道工作用单渠道模型（Gartner、Kingman）。
8. P99 事件无峰值预案（Hopp & Spearman、Reinertsen）——没有溢出层/外包/降级契约，P99 当天就是董事会可见的火情。

**逼问清单（一次一题、按序、写下答案）**：
1. 你的瓶颈是什么，是否经验证实？（不是"感觉"，要带排队等待数据的具体阶段；Goldratt：系统同时只有一个绑定约束。）
2. 你在接受何种服务权衡？（快 vs 共情 / 广 vs 深 / 低成本 vs 高质量——Frei：四者不可兼得。AHT/SLA/缩水率必须与该权衡一致。）
3. 你的需求 P90 是多少，到 P99 差多大？（两个来自近 90 天的具体数字 + 日历背景。）
4. 在计划利用率下，P90 与 P99 的 P(SLA 违约) 各是多少？（用 Erlang-C 算，不是猜。）
5. 你为今年的流失预算了替补招聘吗？（具体数字。）
6. 管理跨度何时触发管理岗招聘，候选人是谁？（来自 `hiring_sequencer.py` 的具体季度 + 至少一名候选人。）
7. P99 当天的峰值预案是什么？（溢出层 / 外包合约 / on-call / 升级树，或书面降级契约。）

提交的计划，其可辩护程度只等于你对这七问的回答质量。

## 互见

- **工程产能**：用 DORA 四项指标、周期时间、WIP 衡量工程吞吐——不同工作单元与数学，不在本技能范围。
- **战略人力规划**：1-5 年能力组合、人才供给、继任——本技能只做运营 0-12 月定编（Lawler：混淆二者会被招进错的岗位）。
- **流程映射（process-mapper）**：先**找**瓶颈，本技能再**围绕**已知瓶颈定编。顺序：process-mapper → capacity-planner。
- **CS 覆盖（cs-coverage）**：按 ARR/CSM 比与分层定编客户成功；本技能按排队工作量（工单、案例、升级）定编。同时承担关系工作与工单队列的 CS 团队，两者都跑。

---

采编自 alirezarezvani/claude-skills（MIT 许可）。
