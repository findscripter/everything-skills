---
name: headcount-org-planner
title: 编制规划与组织架构设计
description: 当规划编制（headcount）、设计组织架构与汇报线、排定关键岗位招聘优先级、或为人力成本建模做权衡时使用；做编制/组织诊断，产出文本版组织架构图、含成本测算的编制计划、按优先级排序的招聘路线图，并标注单点失败/管理层级过厚等结构性风险；不适用于个人薪酬数值核算（用 compensation-analysis）、招聘执行（用 interview-plan-builder）、HRIS 真实写操作；触发词：编制规划、headcount、组织架构、reorg、组织设计、谁该先招、管理幅度
domain: 商业/finance
triggers: [编制规划, headcount, headcount plan, 组织架构, 组织设计, reorg, team structure, 谁该先招, 招聘优先级, 管理幅度, span of control, 汇报线, 组织诊断]
tags: [商业, finance, 组织设计, 编制规划, 人力成本, 招聘路线图, 管理幅度, 组织架构图]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [people-analytics-report, compensation-analysis, ops-capacity-planner, startup-financial-modeler]
combines_with: [cfo-financial-advisor, resource-capacity-planner]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
## 何时使用

需要回答「我们要招多少人、什么岗位、什么时间」「汇报线和团队边界怎么划」「哪些招聘最关键、按什么顺序」「这套编制要花多少钱、如何取舍」时使用。判据：诉求落在编制规模 / 组织结构 / 招聘排序 / 人力成本建模四个维度之一。

不该用的边界：
- 个人薪酬定级与数值核算 → 用 `compensation-analysis`。
- 具体岗位的面试题库与评分卡 → 用 `interview-plan-builder`。
- 绩效季的自评/校准 → 用 `performance-review-builder`。
- HRIS/发薪系统的真实写操作、社保税务核算 —— 本技能只产出规划文档，不落库。

## 步骤 / 指令

1. 明确四个规划维度，逐一收集输入：
   - 编制（Headcount）：业务目标、当前人数与岗位分布、缺口。
   - 结构（Structure）：现有汇报线、管理幅度、团队边界。
   - 排序（Sequencing）：各岗位对目标的杠杆、依赖关系、招聘周期。
   - 预算（Budget）：各岗位全薪成本（base + 股权/奖金 + 雇主成本），现金跑道约束。
2. 对照「健康组织基准」做诊断，标注偏离项（见下表）。
3. 产出三份交付物：① 文本版组织架构图；② 含成本测算的编制计划；③ 按优先级排序的招聘路线图（带时间线）。
4. 显式 flag 结构性风险：单点失败（关键职能仅 1 人）、管理层级过厚、top-heavy（管理者占比过高）等。

健康组织基准（用于诊断，超出区间即预警）：

| 指标 | 健康区间 | 预警信号 |
|---|---|---|
| 管理幅度 span of control | 5-8 名直接下属 | < 3 或 > 12 |
| 管理层级 | 500 人约 4-6 层 | 层级过多 = 决策变慢 |
| IC:管理者 比 | 6:1 到 10:1 | < 4:1 = top-heavy 头重脚轻 |
| 团队规模 | 5-9 人 | < 4 孤立、> 12 难管 |

## 示例

输入：D 轮 SaaS，工程 40 人，目标年内交付 3 条新产品线，现金跑道 18 个月。

编制计划（节选）：

```
岗位            数量  季度   全薪成本/人   小计
平台工程 EM       1    Q1     ¥X         ¥X
高级后端 SWE      4    Q1-Q2  ¥Y         ¥4Y
ML 工程师        2    Q2     ¥Z         ¥2Z
合计季度新增成本 ...                      Σ → 校验对跑道的影响
```

组织架构（文本版）：

```
VP Eng
├── 平台 EM (span 6)
│   └── SWE ×6
├── 产品 EM (span 5)
│   └── SWE ×5
└── ML Lead (span 2)  ⚠ 团队<4，考虑并入平台组或加速补员
```

招聘路线图：按「对目标杠杆 × 招聘周期」排序，先招解锁后续招聘的 EM，再批量补 IC。

## 注意事项

- 基准是经验区间不是硬规则；初创早期 span 偏大、平台团队偏小都可能合理，关键是解释偏离原因。
- 成本建模务必含雇主侧成本与股权摊销，别只算 base，否则低估预算。
- 单点失败要优先于「补满编制」处理——关键职能 0→1 的风险高于 5→6。
- 架构图与招聘排序需对齐：不要规划出无人可汇报或汇报线断裂的岗位。
- 输出是决策草案，落地需与财务（跑道）、业务负责人（优先级）二次确认。

## 互见

- related：`compensation-analysis` —— 编制定下后逐岗定薪。
- related：`cfo-financial-advisor` —— 人力成本并入整体财务模型与跑道。
- related：`startup-financial-modeler` —— 编制成本喂入财务模型做情景测算。
- related：`hr-partner-pro` —— 落地为招聘与组织执行。
- combines_with：`board-deck-builder` —— 把编制计划与组织设计装进董事会材料。
- combines_with：`interview-plan-builder` —— 路线图确定后，逐岗设计面试方案启动招聘。

---
采编自 anthropics/knowledge-work-plugins（Apache-2.0）。
