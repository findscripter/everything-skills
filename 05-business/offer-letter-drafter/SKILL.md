---
name: offer-letter-drafter
title: 录用通知书起草
description: 当候选人确定要发 offer、需要拼装总薪酬包（base/股权/签字费）、撰写录用通知书正文或为招聘经理准备谈薪话术时使用；做录用通知书起草，产出薪酬包表格+条款+福利摘要+offer letter 正文+谈薪指引；不适用于候选人筛选评估、JD 撰写、入职手续办理、薪酬带宽体系设计；触发词：offer、录用通知书、录用意向书、谈薪、总薪酬包
domain: 商业/copy
triggers: [offer, 录用通知书, 录用意向书, offer letter, 谈薪, 总薪酬包, 签字费, 股权 vesting, 招聘经理谈薪话术]
tags: [商业, 人力资源, 招聘, 薪酬, offer, 录用通知, 谈薪, 股权]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [compensation-analysis, interview-plan-builder, performance-review-builder, hr-partner-pro]
combines_with: [compensation-analysis, new-hire-onboarding-plan, hr-partner-pro]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
# 录用通知书起草

## 何时使用

候选人面试通过、**已决定要发 offer**，需要把口头共识落成一份完整、可发出的录用通知书时使用。典型动作：拼装总薪酬包（base、股权、签字费、目标奖金）、写 offer letter 正文、为招聘经理准备谈薪/反报价的指引。

**不该用边界：**
- 候选人筛选、面试评估、是否录用的决策——那是 offer 之前的事，本技能假定「发不发」已拍板。
- JD / 招聘需求撰写、headcount 审批本身。
- 入职手续（onboarding、背调、合同签署流程）——offer 之后的事。
- 公司级薪酬带宽（comp band）体系的设计——本技能是**消费**带宽给单个候选人定价，不是建带宽。

## 步骤

按顺序补齐六要素，缺哪项先回填，别留空白发出去：

1. **职位与 title**——具体岗位名。
2. **级别**——Junior / Mid / Senior / Staff 等（决定薪酬带宽落点）。
3. **工作地点**——Office / Remote / Hybrid（影响薪酬与福利）。
4. **薪酬**——base、股权（股数 + 估值口径 + vesting）、签字费（如有）、目标奖金（如有）。
5. **入职日期**。
6. **汇报对象**（hiring manager）。

信息不全时，主动逐项追问、帮对方想清楚，而不是直接套模板出残缺 offer。

填齐后按下方「示例」的固定结构产出，五个区块齐全：薪酬包表格 → 条款 → 福利摘要 → offer letter 正文 → 给招聘经理的备注。

## 指令

源命令：`/draft-offer <role and level>`（传入岗位与级别）。

**若接入了 HRIS（人力系统）：** 拉取该级别/岗位的薪酬带宽、核对 headcount 审批、自动带出福利明细。

**若接入了 ATS（招聘系统）：** 从候选人申请中拉取个人信息、在 pipeline 中更新 offer 状态。

无连接器时，以上数据靠人工提供或追问补齐。

## 示例

输出固定结构（Markdown）：

```markdown
## 录用通知书草稿：[岗位] — [级别]

### 薪酬包
| 组成 | 明细 |
|------|------|
| **基本年薪** | ¥[X]/年 |
| **股权** | [X 股/单位]，[vesting 计划] |
| **签字费** | ¥[X]（如适用）|
| **目标奖金** | base 的 [X]%（如适用）|
| **首年总薪酬** | ¥[X] |

### 条款
- **入职日期**：[日期]
- **汇报对象**：[经理]
- **工作地点**：[Office / Remote / Hybrid]
- **雇佣类型**：[全职 / 非全职]

### 福利摘要
[与该候选人相关的关键福利亮点]

### 录用通知书正文

尊敬的 [候选人姓名]：

我们很高兴向您发出 [公司] [岗位] 一职的录用邀请……

[完整 offer letter 正文]

### 给招聘经理的备注
- [谈薪 / 反报价指引（如需要）]
- [薪酬带宽背景]
- [需要标注的风险或考量]
```

## 注意事项

- **报总薪酬，不只报 base**——候选人横向对比的是 total comp，孤立的 base 容易被低估。
- **股权写具体**——股数、当前估值口径、vesting 计划三者齐全；含糊的「有期权」毫无说服力。
- **个性化**——在正文里引用面试过程中的一个细节，让通知书有温度，而非冷冰冰的模板。
- 数字发出前对照源系统核验（薪酬带宽、审批状态），别用过期导出。
- 「给招聘经理的备注」与 offer letter 正文分离：前者是内部谈薪弹药，不可随正文发给候选人。

## 互见

- related：人力资源域内的 JD 撰写、薪酬带宽设计、入职流程相关条目。
- combines_with：薪酬建模 / 谈薪话术类技能，可在定价与反报价环节联用。

---

采编自 anthropics/knowledge-work-plugins（Apache-2.0 许可证）。
