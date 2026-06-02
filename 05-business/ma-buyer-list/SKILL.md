---
name: ma-buyer-list
title: 并购潜在买家清单构建
description: 当承接卖方并购（sell-side）委托、需要为标的搭建潜在买家全集并排序触达时使用；做战略买家与财务买家识别、契合度评估、分层（Tier1-3）与 Tier1 联系人映射，产出含战略买家页、财务买家页、联系人映射与统计的 Excel 工作簿及一页买家全景摘要；不适用于买方视角的尽调/估值/整合（见 ma-playbook）或撰写外联文案（见 cold-email-writer）。触发词：buyer list、买家清单、buyer universe、潜在买家、谁会买、战略买家、财务买家、PE sponsor、卖方并购
domain: 商业/finance
triggers: [buyer list, 买家清单, buyer universe, 买家全集, 潜在买家, 谁会买, who would buy this, strategic buyers, 战略买家, financial sponsors, 财务买家, PE sponsor, 卖方并购, sell-side, 买家分层, Tier 1 买家]
tags: [ma, sell-side, buyer-list, buyer-universe, strategic-buyer, financial-sponsor, private-equity, deal-sourcing, investment-banking, finance]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Excel, Buyer Universe Workbook, Strategic Buyer Tiering, Contact Mapping]
requires: []
related: [ma-deal-teaser, ma-process-letter, ma-playbook, company-tear-sheet]
combines_with: [cim-builder, pe-dd-checklist, ib-deal-tracker]
license: Apache-2.0
source: anthropics/financial-services
source_license: Apache-2.0
---
## 何时使用

当你站在**卖方（sell-side）**一侧，需要把「谁可能买下这家公司」拆成一份可执行、可分层、可触达的买家全集时使用，典型场景：

- 承接卖方并购委托、准备 pitch 或 engagement letter，需要论证「确实有买家」。
- 为标的搭建买家全集（buyer universe），覆盖战略买家与财务买家（PE）。
- 评估某类合作方/潜在收购方的契合度，并排出触达优先级与第一波名单。

不该用的边界：

- **不替代买方视角**的尽调、估值、交易结构与整合规划 —— 那是 `ma-playbook` 的职责，本条只产出买家清单与触达排序。
- **不撰写**外联邮件/序列 —— 名单建好后写外联交给 `cold-email-writer`。
- 不替代正式法律/反垄断意见 —— 本条只对直接竞争对手做反垄断**风险标记**，不出具合规结论。

判据一句话：**质量优先 —— 30-40 个研究透彻的买家，胜过 200 个堆出来的名字。**

## 步骤

固定六步，从理解标的到产出工作簿：

1. **理解标的（Target）**：业务描述/赛道/商业模式；营收、EBITDA、增长画像；核心资产与能力（IP、客户关系、地域布局、团队）；预期估值区间；卖方偏好（战略 vs 财务、管理层去留、时间表）。
2. **识别战略买家**：按四类穷举（直接竞争对手 / 邻近赛道玩家 / 上下游纵向整合方 / 平台型并购方），逐个填战略买家评估表。
3. **识别财务买家（PE/sponsor）**：分平台型投资（找新平台）、加购型（bolt-on，须点名具体被投公司与协同逻辑）、成长股权（早期/高增长，区分控股 vs 少数股权），逐个填财务买家表。
4. **分层（Prioritization）**：Tier 1（5-10 家，契合度最高、明确并购记录、理由清晰 —— 第一波触达）；Tier 2（10-15 家，契合但不显然 —— 第二波）；Tier 3（10-20 家，可能但概率低 —— 需扩面时再触达）。
5. **联系人映射（仅 Tier 1）**：关键决策人（CEO / Corp Dev 负责人 / Partner）、关系状态（已有关系 / 冷触达 / 需引荐）、已知偏好或约束（规模、地域、结构）、最佳触达渠道。
6. **产出**：Excel 工作簿 + 一页买家全景摘要（见「指令」）。

## 指令

**战略买家评估表**（每个战略买家逐行评估，附触达理由）：

```
| Buyer | Sector | Revenue | Strategic Fit | Financial Capacity | M&A Track Record | Likelihood | Priority |
|-------|--------|---------|---------------|--------------------|------------------|------------|----------|
|       |        |         | High/Med/Low   |                    | Active/Moderate/None |        | A/B/C    |
```

四类战略买家与逻辑：直接竞争对手（抢份额、消灭对手、规模化）；邻近赛道（产品延展、交叉销售、进入新市场）；纵向整合方（供应链掌控、利润截留、战略锁定）；平台型（tuck-in 补能力缺口）。

**财务买家（sponsor）表**：

```
| Sponsor | Fund Size | Sector Focus | Portfolio Overlap | Recent Activity | Priority |
|---------|-----------|--------------|-------------------|-----------------|----------|
|         |           |              |                   |                 | A/B/C    |
```

**最终产出 — Excel 工作簿**，固定含：

- 战略买家页（按 Tier 排序）
- 财务买家页（按 Tier 排序）
- Tier 1 联系人映射
- 汇总统计（按 Tier、按类型的买家数）
- 一页买家全景摘要（buyer universe summary），供 engagement letter 或 pitch 使用

## 示例

某 SaaS 标的（ARR $4M、卖方倾向战略买家、要求管理层留任）的买家全集：

1. 理解标的：核心资产 = 客户关系 + 垂直数据；卖方排除两家直接竞品（创始人不愿被其收购）。
2. 战略买家：直接竞争对手 2 家（Fit High，但其一与标的市场高度重叠 → 标记反垄断风险）；邻近 SaaS 平台 3 家（产品延展，Fit Med）；某上游数据供应商（纵向整合，Fit Med）。
3. 财务买家：2 家以该垂直为 focus 的 PE 列为平台型；1 家 sponsor 的被投公司可做 bolt-on（点名该被投 + 交叉销售逻辑）。
4. 分层：Tier 1 = 2 家邻近平台 + 1 家 bolt-on sponsor（契合 + 有近期并购动作）；竞品因卖方排除/反垄断降到 Tier 3。
5. Tier 1 联系人映射：邻近平台 A 的 Corp Dev 负责人有旧关系（暖触达），平台 B 需引荐。
6. 产出工作簿 + 一页摘要：「共 28 家，Tier1 3 家 / Tier2 9 家 / Tier3 16 家；战略 19 家、财务 9 家。」

## 注意事项

- **质量胜过数量**：聚焦 30-40 家研究透彻的买家，别堆 200 个名字。
- **研究近期并购动作**：刚在本赛道成交过的买家，要么还想要更多，要么已经吃饱 —— 据此调整 likelihood。
- **反垄断标记**：对直接竞争对手核查反垄断风险，把可能触发监管的逐一标记（本条只标记、不出合规意见）。
- **财务买家看基金年限与投放节奏**：临近投资期结束（fund vintage / deployment pace）的基金往往更有动力。
- **务必问卖方**：是否有想纳入或排除的买家 —— 卖方排除项直接影响分层。
- **动态维护**：流程推进中按反馈在 Tier 之间移动买家，名单随进程更新。

## 互见

- related：`ma-playbook` —— 买方视角的尽调/估值/整合，与本条（卖方建买家清单）互为镜像
- related：`competitive-analysis` —— 识别直接竞争对手与邻近玩家时复用竞品图谱
- related：`cfo-financial-advisor` —— 估值区间与财务买家财力评估
- combines_with：`cold-email-writer` —— Tier 1 联系人映射完成后撰写外联文案
- combines_with：`board-deck-builder` —— 把买家全景摘要并入 pitch / 董事会材料

本条采编自 anthropics/financial-services（Apache-2.0）。
