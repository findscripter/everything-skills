---
name: nda-triage-reviewer
title: 保密协议分级速审
description: 当收到对方发来的商业保密协议（NDA/MNDA）需在签署前快速分流时使用；依据团队 playbook 把 NDA 判为 绿/黄/红 三级并产出含执行摘要、逐条标记、外科手术式红线建议的分流报告；不适用于起草 NDA、谈判让步、并购/雇佣/投资类保密条款；触发词：NDA、保密协议、MNDA、保密合同、nda triage、分级速审、保密协议审查、confidentiality agreement
domain: 领域/legal
triggers: [NDA, 保密协议, MNDA, 保密合同, nda triage, 分级速审, 保密协议审查, confidentiality agreement]
tags: [legal, nda, contract-review, triage, redline, risk-assessment]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [pdf-form-filler, markdown-to-docx]
requires: []
related: [general-counsel-advisor, dpa-clause-reviewer, employment-contract-drafter, oss-license-compliance]
combines_with: [general-counsel-advisor, diligence-issue-extractor]
license: Apache-2.0
source: anthropics/claude-for-legal
source_license: Apache-2.0
---
## 何时使用

- 收到对方发来的商业保密协议（NDA / 单向 NDA / 互相保密 MNDA），需要在送签或拨电话给法务之前，先用不到一分钟做一次分流，判断「能直接签 / 需法务看一两处 / 必须先找法务」。
- 适合销售、BD 等非法务人员自助预审，把法务时间只花在真正需要的协议上。

**不该用边界（命中即停，转人工/法务）：**
- 不起草 NDA，不做条款谈判或让步决策——本条只做分流（triage），不做 negotiate / draft。
- 不处理并购（M&A）、雇佣、投资场景下的保密条款；这类一律转法务。
- 文档名为「NDA」但实质是服务协议、term sheet 或一揽子限制性约定（standstill、排他、竞业、IP 转让等）——一律转法务。
- 缺少经律师审定的团队立场（playbook positions）时，**不得判绿、不得直接送签**，应判黄并上交人工。

## 步骤

1. **判方向（Which side）**：先确定本方立场。对方是评估你产品的供应商/伙伴 → 销售侧；你在评估对方 → 采购侧。互相 NDA 也分方向（谁的范本、评估往哪个方向）。不明确就问。在产出中注明所用 playbook 一侧。
2. **读 playbook（立场来源）**：本条不内置任何条款的判定阈值——法律、市场、各团队风险偏好差异太大，硬编码默认值不安全。所有「绿/黄/红」标准来自团队配置中的 `NDA triage positions`（按所判一侧）。若 playbook 未覆盖某条款（如 residuals、survival period、单向 NDA 作为接收方），**先问用户该条款默认应判绿/黄/红，记录后再继续**，保证下次一致。
3. **范围检查（Scope check）**：审 NDA 专有条款前，先确认文档是否「名不副实」。互相商业 NDA 可能暗藏：standstill、授权许可、排他、禁止挖角（non-solicit）、竞业（non-compete）、IP 转让、优先购买权（ROFR）、最惠条款（MFN）、宽泛仲裁/管辖条款。**一旦含保密之外的义务：无论条款分析如何，自动判黄并标出非 NDA 条款，转律师审查。**
4. **逐项分流**：对照 playbook 检查各类条款（见下「指令」清单），归入三档。
5. **产出报告**：按对应档位模板输出（见「示例」）。报告顶部需加团队配置 `## Outputs` 里的工作成果抬头（work-product header，随角色不同）。
6. **收尾动作**：按配置 `closing_action` 逐字附在每份产出末尾；未配置则附「按你方标准审批流程走完最终 NDA」。结尾给出下一步决策树（draft / escalate / 补事实 / 观望 / 其他），由律师选。

## 指令

**三档定义（稳定，填充标准来自 playbook）：**
- **GREEN 绿 — 直接送签**：满足 playbook 每条立场，无任一红旗。绿是唯一无需律师即可送签的路径；**不得对缺失或默认立场判绿**——立场缺失时正确做法是判黄、上交人工。非律师角色送签前须确认「是否已与律师审过」，否则生成一页 brief（对方、单向/互相、已跑的检查、playbook 未覆盖项、照签风险、要问律师的三件事），未得到明确 yes 不得越过此闸。
- **YELLOW 黄 — 需法务看具体几处**：有条款偏离 playbook 但非硬性致命，或出现 playbook 未涵盖的条款。逐条单独列出供审批人定夺。
- **RED 红 — 先别提交，先找法务**：命中 playbook「绝不接受」清单，或结构与团队标准立场冲突（如要求互相却来单向、要求有限期却来永久、管辖法在「never」清单）。

**逐类检查清单（阈值全部查 playbook，本条只列类别）：**
- 互相性（mutual vs 单向）。单向时先跑「单向 NDA 问卷」：①是否只有你方披露；②是否限定特定披露（如把技术给供应商但不收对方的）；③是否涉及 M&A/雇佣/投资（是则停，转法务，本条只管商业 MNDA）。
- 保密信息定义（仅标记 vs 全部披露、标记要求、口头披露确认窗口）。
- 五项 carveout：①已/将公开（非因违约）；②接收方已掌握；③独立开发且未参照 CI；④第三方无限制提供；⑤法律/法院要求披露（在法律允许时通知披露方）。
- residuals（脑中残留信息使用，窄口径「unaided memory」vs 含笔记副本的宽口径）。
- 期限与存续（初始期限、保密义务存续期、商业秘密是否单列更长保护）。
- 限制性约定（禁挖角、竞业、排他）——管辖敏感，playbook 沉默必问。
- 律师费转移（fee-shifting，是否互相/单边/胜诉方）。
- 备份与归档 carveout（销毁/返还条款是否豁免标准备份归档系统）。
- 管辖法（按配置 `Governing law and venue`）。

**红线粒度（关键约束）**：以能达成 playbook 立场的最小改动为默认——改词优先于改短语，改短语优先于改句，重构子句优先于换句，换句优先于整条替换。仅当对方版本离立场太远、外科手术式改动反而更难读时才整条替换，并在转交说明里讲明原因。例：`twelve (12)` → `twenty-four (24)`；`paid by the Buyer` → `paid and payable by the Buyer`。

**复杂度过滤**：若解决某问题需起草新语言、重构条款或插入实质性新条款——不要尝试，改写「Section [X] — route to Legal for review.」。执行摘要只放机械动作（删/改一个词或短语）。

**洁净 NDA 规则**：全部通过无标记时，执行摘要只写「No red flags identified. Route for signature per standard process.」，不要为洁净 NDA 出长报告。

**对手方校准**：Fortune 500 通常不谈 NDA，红旗要分清「真致命」还是「只是跟我们范本不同」，接不接对方范本是上交的升级决策，别自己拍板；创业公司通常会接你方范本，有问题时「用我们的」往往比红线他们的更快。

## 示例

YELLOW 报告骨架（RED 类似，另加「> 原文精确引用」与 Recommended response）：

```markdown
[WORK-PRODUCT HEADER — per plugin config ## Outputs]

## NDA Triage: [对手方]

YELLOW — flag for [审批人]

### Executive Summary
- [一行可执行编辑，如「删除禁止挖角条款（第 6 条）」]

### Flagged items
**1. [问题]** — Section [X]
   What: [一行]
   Why flagged: [命中哪条 playbook 立场，或「playbook 未涉及」]
   **Legal risk:** [🔴/🟠/🟡/🟢] | **Business friction:** [🔴 阻塞成交 / 🟠 拖慢 / 🟡 困惑客户 / 🟢 无感]
   Likely resolution: [接受 / 就 X 反推 / 视交易语境]

### Everything else
| Check | Status | Playbook reference |
|---|---|---|
| [已通过的检查] | pass | [配置对应小节] |

**Next step:** 就标记项问 [审批人]，认可后送签。
```

GREEN 时执行摘要仅一句：「No red flags identified under the playbook. Route for signature per standard process.」并附 Check/Status/Playbook reference 表。

## 注意事项

- **去向检查（Destination check）**：产出前确认接收方是否在特权圈（privilege circle）内。公开频道、全员列表、对手方/对方律师、供应商、客户会使保护失效；去向在圈外时，提供 (a) 仅法务的特权版 / (b) 脱敏版 / (c) 两者，别默默加特权抬头又帮粘到抬头保护不了的地方。
- **管辖假设**：竞业、禁挖角、费用转移、法律选择的可执行性按辖区差异极大。NDA 涉及配置立场外的辖区时，在产出中标出并注明「分流结论可能不照搬适用」。
- **本条不做的事**：不谈判、不起草 NDA（答案是「用我们范本」时由用户从 CLM/文档系统取范本）、不替黄档拍板、不对任何 NDA 条款表态（立场只存在于团队配置）。
- CLM 集成（若接入）：绿→可建标准 NDA 工作流记录；黄→建记录并附标记项备注；红→不建记录，由律师决定后续。
- 若对方 NDA 以 PDF/扫描件形式发来，可先借 pdf-form-filler 处理表单/提取；最终分流报告若需转 Word 交付，用 markdown-to-docx。

## 互见

- pdf-form-filler：处理 PDF 形态的 NDA 文件与表单字段。
- markdown-to-docx：把 Markdown 分流报告转成 Word 交付件。

---
本条采编自 anthropics/claude-for-legal（Apache-2.0）。
