---
name: contract-playbook-review
title: 合同对照评审红线
description: 当需对照团队谈判 playbook 评审供应商/客户合同、做逐条偏离标记并准备谈判红线时使用；产出含执行摘要、绿/黄/红逐条标记、可直接插入的红线建议、业务影响与谈判优先级的评审报告；不适用于起草合同、出具正式法律意见、单纯 NDA 速审（用 nda-triage-reviewer）；触发词：合同评审、红线、playbook、条款评审、redline、谈判策略、limitation of liability、indemnification、review contract
domain: 领域/legal
triggers: [合同评审, 红线, playbook, 条款评审, redline, 谈判策略, review contract, limitation of liability, indemnification]
tags: [legal, contract-review, redline, playbook, negotiation, risk-assessment]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [pdf-form-filler, markdown-to-docx]
requires: []
related: [nda-triage-reviewer, legal-risk-classifier, dpa-clause-reviewer, general-counsel-advisor]
combines_with: [legal-risk-classifier, esignature-routing, deal-desk-reviewer]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
## 何时使用

- 收到供应商或客户范本合同（SaaS、专业服务、许可、采购、合作等），需在送签或谈判前，对照团队谈判 playbook 做逐条偏离标记、产出红线建议与业务影响分析。
- 准备谈判策略：把问题按优先级排序，给出主张语言、退让底线（fallback）与升级路径。

**不该用边界（命中即停，转人工/法务）：**
- 不起草合同，不出具正式法律意见。本条只做对照评审与红线建议；所有结论须经合格法律专业人士复核后方可依据。
- 单纯 NDA/保密协议送签前速审 → 用 `nda-triage-reviewer`（更轻的三级分流）。
- 雇佣合同起草 → `employment-contract-drafter`；DPA 专项 → `dpa-clause-reviewer`；尽调批量抽取问题 → `diligence-issue-extractor`。
- 缺少经律师审定的 playbook 立场时，**不得判绿、不得直接送签**，应判黄并上交人工，或明确声明本次仅按通用商业标准评审。

## 步骤

1. **接收合同**：支持文件（PDF/DOCX）、CLM/云存储 URL、或直接粘贴文本。无合同则要求提供。
2. **收集上下文**（先问再审，部分信息也可开工并注明假设）：①本方立场（供应商/买方/许可方/被许可方/合作方）；②截止时间（影响优先级）；③重点关切（如「数据保护是关键」「IP 归属是核心」）；④交易背景（金额、战略重要性、既有关系）。
3. **加载 playbook**：在团队本地配置（如 `legal.local.md`）查找标准立场、可接受区间、升级触发条件。**未找到 playbook 时**：告知用户，给两个选项——(a) 协助搭建 playbook；(b) 按通用商业标准做通用评审，并明确标注「非团队特定立场」。
4. **逐条分析**：先识别合同类型与本方立场（决定哪些条款最关键）；**通读全文再标记**（条款相互作用，如未设上限的赔偿可被宽泛责任上限部分对冲）；对照 playbook 逐条评估；最后整体看风险分配是否平衡。
5. **三级标记**：每处偏离判为 GREEN/YELLOW/RED（见「指令」）。
6. **生成红线**：对每个 YELLOW/RED 产出红线建议（格式见「示例」）。
7. **业务影响小结**：整体风险画像、Top 3 问题、谈判策略、时间因素。
8. **CLM 路由（若接入）**：按合同类型与风险等级推荐审批工作流与路由路径；未接入则跳过。

## 指令

**至少覆盖的条款类别与审查要点：**

| 条款类别 | 关键审查点 |
|---|---|
| 责任限制 LoL | 上限金额、carveout、互相 vs 单边、是否排除间接/后果性损害、上限按单次/按年/累计 |
| 赔偿 Indemnification | 范围、互相性、是否设上限、IP 侵权与数据泄露、防御控制权与和解权 |
| IP 归属 | 既有 IP / 新生 IP、work-for-hire 范围、许可授予、反馈条款 |
| 数据保护 | 是否需 DPA、控制者/处理者、子处理者、泄露通知时限（GDPR 72 小时）、跨境传输机制（SCC/充分性）、删除/返还 |
| 保密 | 范围、期限、carveout、返还/销毁义务 |
| 陈述与保证 | 范围、免责、存续期 |
| 期限与终止 | 初始期限、自动续约与通知窗口、便利终止/有因终止与补救期、过渡协助、存续条款 |
| 管辖与争议 | 法律选择、诉讼/仲裁、地点、陪审团/集体诉讼豁免、胜诉方律师费 |
| 保险/转让/不可抗力/付款 | 最低保额；同意/控制权变更；范围与通知；账期、滞纳金、税、涨价 |

**三档定义（稳定；判定阈值来自 playbook 或通用标准）：**
- **GREEN — 可接受**：对齐或优于标准立场，仅商业上合理的小幅变动。动作：备注知会，无需谈判。**立场缺失时不得判绿。**
- **YELLOW — 谈判**：偏离标准但在可谈区间（市场常见但非首选）。动作：给出①把条款拉回标准的具体红线语言；②退让底线 fallback；③接受 vs 谈判的业务影响。
- **RED — 升级**：超出可接受范围、触发升级条件或构成实质风险（如未设责任上限、宽泛单边无上限赔偿、转让既有 IP、处理个人数据却无 DPA、不合理排他/竞业、问题辖区＋强制仲裁）。动作：①为何是红旗（具体风险）；②市场标准立场长啥样；③业务影响与潜在敞口；④建议升级路径（资深/外部律师/业务决策人）。

**红线最佳实践**：语言具体可直接插入；firm 于关键点但商业上合理（过激红线拖慢谈判）；附可外发给对方律师的简短 rationale；YELLOW 必带 fallback；标注 must-have / nice-to-have；按关系（新供应商/战略伙伴/大宗供应商）调整口吻。

**谈判优先级框架**：Tier 1 必得（deal-breaker，如未设/严重不足的责任保护、受监管数据缺数据保护、危及核心 IP、与监管义务冲突）；Tier 2 强偏好（上限调整、赔偿范围与互相性、终止灵活性、审计权）；Tier 3 可让（首选管辖法、通知期、定义微调、保险证明）。策略：以 Tier 1 开场，用 Tier 3 让步换取 Tier 2，Tier 1 未升级不得让步。

## 示例

单条红线格式：

```
**Clause**: [Section 引用与条款名]
**Current language**: "[合同原文精确引用]"
**Proposed redline**: "[具体替换语言；新增加粗，删除概念性划除]"
**Rationale**: [1-2 句，可外发给对方律师]
**Priority**: [Must-have / Should-have / Nice-to-have]
**Fallback**: [主张被拒时的替代立场]
```

报告骨架：

```markdown
## 合同评审摘要
**Document**: [合同名] | **Parties**: [各方与角色] | **Your Side**: [供应商/买方/…]
**Deadline**: [若有] | **Review Basis**: [Playbook / 通用标准]

## 关键发现
[Top 3-5 问题，带严重度旗标]

## 逐条分析
### [条款类别] — [GREEN/YELLOW/RED]
**Contract says**: … | **Playbook position**: … | **Deviation**: …
**Business impact**: … | **Redline**: [YELLOW/RED 时给具体语言]

## 谈判策略
[开场顺序、优先级、可让候选]

## 下一步
[具体动作]
```

## 注意事项

- **不提供法律意见**：始终提醒用户，本分析须经合格法律顾问复核后方可作为法律决策依据。
- **非英文合同**：标注语言，询问是否需翻译或按原文评审。
- **超长合同（50+ 页）**：先聚焦最关键章节，再做完整评审。
- **playbook 缺失**：明确声明评审基于通用商业标准而非团队特定立场；对缺失或默认立场不得判绿。
- **条款交互**：未设上限的赔偿/「any breach」措辞会把责任上限实质架空；宽泛 carveout 可能让上限名存实亡——务必整体评估而非孤立看条款。
- 合同以 PDF/扫描件发来时，可先用 `pdf-form-filler` 处理表单/提取；最终报告需转 Word 交付时用 `markdown-to-docx`。

## 互见

- related：`general-counsel-advisor` —— 升级与整体法务判断
- related：`nda-triage-reviewer` —— 更轻量的 NDA 三级速审
- related：`dpa-clause-reviewer`、`employment-contract-drafter` —— 数据保护 / 雇佣专项
- combines_with：`deal-desk-reviewer` —— 交易台审批与商务条款联审
- combines_with：`diligence-issue-extractor` —— 把评审标记汇入尽调问题清单

---
本条采编自 anthropics/knowledge-work-plugins（Apache-2.0）。
