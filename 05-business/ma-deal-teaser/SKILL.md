---
name: ma-deal-teaser
title: 并购匿名项目简介（Teaser）
description: 当卖方主导的并购流程需在签 NDA 前用一页材料试探买家兴趣时使用；产出不暴露标的身份的匿名 Teaser（项目代号、行业定位、投资亮点、财务摘要表、交易概览）并做去标识化核查；不适用于签约后的 CIM/管理层演示、为某一家买家定制的尽调材料，或可披露真实公司名的公开募资材料。触发词：teaser、blind teaser、匿名项目简介、一页纸、sell-side
domain: 商业/finance
triggers: [teaser, blind teaser, 匿名项目简介, 一页纸 teaser, sell-side teaser, 盲推材料, 买方试探, NDA 前, 项目代号, 投行 one-pager, anonymous profile]
tags: [商业, finance, 投行, 并购, 卖方流程, teaser, 去标识化, buy-side outreach]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Word/.docx, PDF, PowerPoint（可选单页）]
requires: []
related: [cim-builder, ma-buyer-list, ma-process-letter, ma-playbook]
combines_with: [ma-buyer-list, cim-builder]
license: Apache-2.0
source: anthropics/financial-services
source_license: Apache-2.0
---
## 何时使用

当你在**卖方主导（sell-side）的并购流程**中，需要在买家签署 NDA 之前用**一页匿名材料**勾起兴趣、筛出真正的潜在买家时使用。Teaser 的唯一职责是「让买家想签 NDA 了解更多」，不是成交。

典型触发：

- 要给一批潜在买家（战略型 / 财务型 / 两者）做盲推（blind outreach）。
- 标的身份此刻不宜暴露，但又要传递足够卖点与财务亮点来吸引、并筛掉看热闹的人。
- 需要一页纸的项目代号简介（Project [Name]）作为 outreach 起点与追踪起点。

**不该用的边界：**

- 不用于**签约后**才发的详细材料：CIM / 管理层演示（management presentation）/ 数据室文件——那是 NDA 之后的事，信息量与口径完全不同。
- 不用于**为某一家买家定制**的尽调材料；Teaser 是同一份对外群发的匿名版本。
- 不用于**可公开披露真实公司名**的募资/路演材料——那种应直接署名，无需匿名化。
- 不替代律师/客户的合规审阅；定稿前必须经客户与法务复核。

## 步骤

1. **收集输入**：① 公司业务描述（做什么、怎么赚钱）② 行业 / 细分赛道 ③ 关键财务指标：收入、EBITDA、增长率、利润率 ④ 地域覆盖 ⑤ 3-5 个核心卖点 ⑥ 哪些要匿名 / 哪些可披露 ⑦ 目标买家类型（战略 / 财务 / 两者）。
2. **按标准结构搭一页纸**（见「指令」的六块结构）。
3. **过去标识化核查**（见「指令」清单），确认材料无法被反推出标的身份。
4. **出稿**：一页 Word（.docx，干净排版）+ 用于分发的 PDF；可选 PowerPoint 单页版。
5. **建立分发台账**：记录谁收到了 Teaser——它就是整个流程的 outreach log。

## 指令

**一页纸标准结构（专业排版，控制在一页内）：**

1. **页眉（Header）**
   - 项目代号：例如 "Project [Name]"。
   - 行业定位描述句：例如 "Leading Specialty Industrial Services Platform"。
   - 保密标注：`Confidential — For Discussion Purposes Only`。
2. **公司描述（2-3 句，不点名）**
   - 做什么——不出现公司名。
   - 市场地位——"a leading provider of..."、"a top-3 player in..."。
   - 地域——只到区域级（"Southeast US"、"Midwest"），不到城市。
3. **投资亮点（4-6 条要点）**：市场领导地位 / 收入质量（经常性收入占比、留存、客户分散度）/ 增长曲线 / 利润率及扩张空间 / 管理团队实力 / 战略价值或协同潜力。
4. **财务摘要（指标表）**：

   | Metric | Value |
   |--------|-------|
   | Revenue | $XXM |
   | Revenue Growth | XX% CAGR |
   | EBITDA | $XXM |
   | EBITDA Margin | XX% |
   | Employees | XXX |

5. **交易概览（2-3 句）**：在卖什么（100% 出售 / 控股权 / 成长股权）、indicative timeline、表达兴趣的联系方式。

**去标识化核查清单（确保不会反推出标的）：**

- 无公司名、品牌名、产品名。
- 无具体城市——用区域代替。
- 无点名的客户或合作伙伴。
- 员工数若过于特征化（distinctive）则省略。
- 赛道很小时，用**收入区间**代替精确数字。
- 无 logo、截图或任何可识别的图像。

## 示例

一页 Teaser 的页眉与开头骨架：

```
Project Atlas
Leading Specialty Industrial Services Platform
Confidential — For Discussion Purposes Only

Company Description
A leading provider of mission-critical maintenance services to industrial
clients across the Southeast US, holding a top-3 position in its niche with
a highly recurring, contract-based revenue base.

Investment Highlights
• ~85% recurring revenue under multi-year contracts; >95% logo retention
• 18% revenue CAGR over the last 3 years with margin expansion runway
• Fragmented market with clear roll-up / consolidation potential
• Experienced management team willing to roll over and stay on

Financial Summary
Revenue $80M | Revenue Growth 18% CAGR | EBITDA $18M | EBITDA Margin 22% | Employees 450

Transaction Overview
The shareholders are exploring a sale of 100% of the business. Indicative
process timeline targets first-round bids in [Q_]. Parties with interest
should contact [Advisor] at [email] to receive an NDA and the CIM.
```

## 注意事项

- **少即是多**：Teaser 的活儿是激发兴趣不是成交，越紧凑越有力——好的 Teaser 让买家想签 NDA 才能知道更多。
- 用**有抱负但真实**的措辞——"leading"、"differentiated"、"high-growth" 只要属实就用。
- 财务给到**足以筛出严肃买家**即可，给太多反而让看热闹的浪费你时间。
- **务必先经客户与法务审阅**再分发。
- **追踪谁收到了 Teaser**——它就是这个流程的 outreach log。
- 去标识化是硬约束：宁可信息少一点，也不要因为一个特征化细节（独特员工数、唯一大客户、罕见地名）被反推出身份。

## 互见

- related：`ma-playbook` —— 卖方就绪评估、数据室与谈判要点的完整并购手册
- combines_with：`board-deck-builder` —— 流程推进中向董事会汇报交易进展与买家反馈
- related：`cfo-financial-advisor` —— 整理 Teaser 所需的收入质量、EBITDA 与利润率口径

本条采编自 anthropics/financial-services（Apache-2.0）。
