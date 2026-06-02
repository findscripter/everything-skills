---
name: investigation-memo-drafter
title: 内部调查备忘录起草
description: 当内部调查（HR/财务/高管/吹哨人）进展到可写首稿、或日志新增数据需回写草稿时使用；从特权调查日志生成/更新「内部调查备忘录」——按争点组织事实认定、可信度评估、依优势证据出 Sustained/Not Sustained/Inconclusive 结论，带工作成果抬头存为 memo.md；不适用于替律师作处分决定、保证特权、或缺关键来源强行定稿。触发词：调查备忘录, 内部调查, investigation memo, 起草备忘录, 可信度评估, 事实认定, draft memo, 调查结论
domain: 领域/legal
triggers: [调查备忘录, 内部调查, investigation memo, 起草备忘录, 更新备忘录, 可信度评估, 事实认定, draft memo, 调查结论, work product]
tags: [legal, employment, investigation, memo, work-product, credibility, hr]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [yaml, markdown, docx]
requires: []
related: [litigation-chronology-builder, deposition-outline-prep, privilege-log-reviewer, general-counsel-advisor, diligence-issue-extractor]
combines_with: [litigation-chronology-builder, general-counsel-advisor]
license: Apache-2.0
source: anthropics/claude-for-legal
source_license: Apache-2.0
---
## 何时使用

- 一项内部调查（HR 骚扰/歧视/报复、财务舞弊、高管不当行为、吹哨人报复）已采集到足够材料，需从特权调查日志写出**第一版备忘录**。
- 调查日志新增了访谈记录/文档/律师批注，既有备忘录草稿**需要回写更新**。
- 用户说「起草调查备忘录」「把日志写成 memo」「更新调查结论」「补一段可信度评估」。

不该用的边界（划清「做」与「不做」）：
- 不替律师/HR 作纪律处分决定——本技能支撑律师的事实认定，不替 HR 拍板处分。
- 不保证特权成立——特权取决于调查是否律师主导、文档制作目的及后续使用，**不取决于备忘录怎么标注**（见「注意事项」）。
- 不在缺关键来源时强行定稿——首稿前必须满足前置条件，否则只警告、不蛮干。
- 不进行访谈、不给 Upjohn 警告——它只把这些记录进日志。

## 步骤

本技能是「内部调查」框架的 **Mode 4（起草/更新备忘录）**。先确认调查为律师主导（否则特权分析改变，先把这问题抛给律师再动手）。读取案件目录下 `log.yaml`、`documents-reviewed.yaml`、`sources-checklist.yaml` 全量，再分两路：

**A. 若无备忘录——写首稿。** 先核前置条件，缺则警告但不阻断起草：
- 每个开放争点（issue）至少有一条日志条目；
- 投诉人（complainant）与被调查人（respondent）的条目均已就位；
- 复核来源清单，**高优先级仍 open 的来源逐一警告**。

按下列固定结构起草（标准内部调查备忘录范式），写入 `memo.md`，状态标 `PRELIMINARY DRAFT`：

1. **Executive Summary**——指控白话、范围与方法概述、各争点结论（Sustained / Not Sustained / Inconclusive）、建议措施。最后写、放最前。
2. **Background and Scope**——触发事件、逐条编号的被调查指控、明确的范围外事项、行为期间与调查期间。
3. **Methodology**——访谈表（证人/角色/日期/备注，取自 source_type=interview 的条目）、文档类别与卷量、其他来源、**Limitations**（请求但未获取的来源、各种约束）。
4. **Factual Findings**——**按争点组织，一争点一节**（不按证人、不纯按时序）。内联方括号引用日志 entry_id。账述冲突处**直接呈现冲突，不抹平**，关键文档配引文。
5. **Credibility Assessment**——独立成节，**仅评估其可信度决定结论走向的证人**。每人四维：内部一致性 / 旁证印证 / 动机 / 庭审观感（仅当面访谈时；否则留空）→ Assessment（采信 / 不采信 / 部分采信，附依据）。
6. **Relevant Policies**——**行为发生时生效的版本**，注明版本号；不引用事后才出台的政策。
7. **Conclusions**——表格：争点 | 认定（Sustained/Not Sustained/Inconclusive）| 一句依据。注明「**依优势证据（preponderance of the evidence）标准**」。
8. **Recommendations**——按动作类型：纪律处分（写依据非仅结论）/ 政策或流程改进 / 培训 / 进一步调查（未结线索）/ 后续监控。
9. **Appendix A: Chronology**——从日志条目按 `date_of_event`（非 date_logged）排序自动生成：日期 | 摘要 | 来源(Entry ID)。
10. **Appendix B: Documents Reviewed**——从 `documents-reviewed.yaml` 汇总表。

**B. 若已有备忘录——更新。** 读备忘录与日志，比对 `date_logged` 与备忘录上次更新日，识别新增条目。**先报告变化，再改写**：

```
自上次草稿（[日期]）以来，日志新增：
[N] 条新条目 / 新争点：[…] / 新冲突：[…] / 已补缺口：[…]

需更新的小节：
  事实认定：[受影响的争点] / 可信度：[新增可信度相关条目]
  结论：[需重审的认定] / 附录A：[N] 条新时序项
```

然后问：「更新整篇，还是只改受影响小节？」按答执行，**保留既有起草**，改动小节标 `[UPDATED: 日期]` 直到律师复核。

## 指令

- **争点优先组织**：事实认定按指控分节，绝不退化成「证人 A 说→证人 B 说」的逐人复述；冲突账述并陈、指向印证或反驳它的文档。
- **可信度仅评关键证人**：不要给每个证人都写一段。只评「认定结论取决于采信谁」的那几位，套四维框架。
- **政策按时点取版本**：只引用行为发生当时生效的版本并注版本号。
- **结论用受控三态**：Sustained / Not Sustained / Inconclusive，优势证据标准，主观/临界判定打 `[review]` 交律师，绝不静默认定阈值已满足。
- **附录自动化**：时序按 `date_of_event` 排序（不是入库时间）；文档附录直接由 `documents-reviewed.yaml` 汇总。
- **来源归属标签**：引用规则/判例时标 `[CourtListener]`/`[statute / regulator site]`/`[user provided]`/`[model knowledge — verify]`，标签描述出处而非把握度，不删改不合并。

## 示例

写入 `memo.md` 的备忘录骨架（保留工作成果抬头）：

```markdown
[工作成果抬头 — 按插件配置，因角色而异：PRIVILEGED & CONFIDENTIAL — ATTORNEY WORK PRODUCT]

**MEMORANDUM**
To/From: [律师填] · Date: [日期] · Re: Internal Investigation — [案件] · Status: PRELIMINARY DRAFT

## Executive Summary
[指控白话｜范围与方法｜各争点 Sustained/Not Sustained/Inconclusive｜建议]

## Factual Findings
### Issue 1: [指控]
[本争点证据叙述，内联引用 [entry 7][entry 12]；账述冲突直接并陈，不抹平]

## Credibility Assessment
### [证人]
内部一致性：[…] · 旁证印证：[…] · 动机：[…] · 庭审观感：[当面访谈才填]
Assessment：[采信 / 不采信 / 部分采信 — 依据]

## Conclusions
| 争点 | 认定 | 依据 |
|---|---|---|
| Issue 1 | Sustained / Not Sustained / Inconclusive | [一句] |
*认定依优势证据（preponderance of the evidence）标准。*
```

更新模式：先输出「自上次草稿以来新增 N 条…需更新 X/Y 小节」的变化报告 → 问「整篇 vs 仅受影响小节」 → 改动小节标 `[UPDATED: 日期]`。

## 注意事项

- **标注不创设特权**：抬头反映意图但本身不成立特权。是否真享特权取决于调查是否律师主导、文档制作目的、后续如何使用/披露。**开案前先确认是否律师主导**——若由 HR 主导、法务仅顾问角色，特权分析实质不同，先把这问题抛给律师，再建任何文件。
- **传播即可能弃权**：备忘录及衍生摘要继承底层调查的特权状态。转发给调查圈外的非律师、未限缩抄送 HR、交给业务侧，都可能对整项调查弃权。按抬头标注，存特权材料处，每次分发都刻意决定。
- **外发响应有门**：若要据此对外回应（EEOC/州机构指控、对方律师索赔函、监管回函），非律师角色须先经律师；此处所采立场可能成为日后程序中的自认，并可能弃失对调查的特权。
- **非律师输出模式**：使用者非律师时，律师摘要置顶、每个法律标记加一句白话注解、每条法条加白话主题行。
- **不静默补漏**：法律检索工具对某规则返回稀少时，报所得并停下列选项交律师，不替其接受低可信来源。
- **结尾给「下一步决策树」**（起草摘要 / 升级 / 补事实 / 观望 / 其他），定制到本次产出，由律师选择。

## 互见

- requires：无强制前置；实务上调查日志、来源清单已由「内部调查」框架的 Mode 1–3 建好。
- related：`litigation-chronology-builder`（时序附录与诉讼时间线相通）、`deposition-outline-prep`（可信度评估与询问提纲互通）、`privilege-log-reviewer`（备忘录及衍生件的特权状态判定）、`general-counsel-advisor`（升级与法律意见）、`diligence-issue-extractor`（按争点抽取与组织证据）。
- combines_with：`litigation-chronology-builder` —— 调查转入诉讼时，把事实认定接成可主张的时间线；`general-counsel-advisor` —— 就结论与敞口给出 GC 级判断与升级路径。

---

本条采编自 anthropics/claude-for-legal（Apache-2.0）。
