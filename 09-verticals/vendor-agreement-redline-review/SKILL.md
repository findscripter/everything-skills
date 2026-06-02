---
name: vendor-agreement-redline-review
title: 供应商协议审查与红线
description: 当收到对方发来的供应商协议（MSA/SaaS订阅/服务协议/采购合同）需在签署前依据团队 playbook 做条款审查时使用；做的是：定位合同类型与本方立场、先查致命条款、逐条比对 playbook 偏离并按双轴严重度分级、给出外科手术式红线语言与升级路由、产出一次可执行的审查备忘录；不适用于起草合同、谈判让步决策、DPA 深审（转 dpa-clause-reviewer）、并购数据室批量尽调；触发词：供应商协议、MSA、服务协议、SaaS、合同审查、红线、vendor agreement、redline、采购合同、责任上限
domain: 领域/legal
triggers: [供应商协议, MSA, 服务协议, SaaS, 合同审查, 红线, vendor agreement, redline, 采购合同, 责任上限]
tags: [legal, contract-review, vendor-agreement, msa, redline, risk-assessment, playbook]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [dpa-clause-reviewer, markdown-to-docx, CLM MCP (Ironclad/Agiloft), DocuSign MCP]
requires: []
related: [contract-playbook-review, saas-subscription-agreement-review, vendor-agreement-status-checker, dpa-playbook-review]
combines_with: [contract-playbook-review, contract-escalation-router]
license: Apache-2.0
source: anthropics/claude-for-legal
source_license: Apache-2.0
---
## 何时使用

- 收到对方（通常是对方范本）发来的供应商协议——主服务协议（MSA）、SaaS 订阅、专业服务协议、许可协议或采购合同——需在送签或拨电话给法务之前，依据团队 playbook 逐条审查，把每处偏离标准立场的条款找出来、定严重度、给可直接粘贴的红线语言并路由到正确审批人。
- 产物是一份律师一遍即可行动的审查备忘录：每个问题都带严重度、业务影响、修改建议、（必要时）升级判断。本条典型用于采购侧（对方供货给你），但仍须先判方向。

**不该用边界（命中即停或转专条）：**
- 不起草合同、不替团队做谈判让步决策——本条只做审查（review），不做 draft / negotiate。
- DPA（数据处理协议）的实质审查不在本条：本条只在闸口标记 DPA 缺失/未读，转 `dpa-clause-reviewer`。
- 并购数据室批量尽调转 `diligence-issue-extractor`；NDA 分流转 `nda-triage-reviewer`。
- 缺少经律师审定的 playbook 立场时，**不得判绿、不得直接送签**——一切严重度都相对 playbook 度量，立场缺失时问用户该条归入哪档并记录。

## 步骤

1. **前置：读 playbook**。审合同前先读团队配置（练习档案 CLAUDE.md）。若缺失或仍是占位符，提示用户跑冷启动访谈，或说「provisional」按通用默认（美国辖区、中风险偏好、律师角色、无 playbook——按第一性原理标注常见供应商侧风险）运行，并给每个产出块打 `[PROVISIONAL]` 标签。
2. **判方向（Which side）**。对方是供货方 → 采购侧（读 `Purchasing-side playbook`）；对方在买你产品 → 销售侧（读 `Sales-side playbook`）。经销/合伙/分成不明确就问。在产出注明所用 playbook 一侧；该侧若 `[Not configured]` 则停，要求先配置。
3. **第 1 步 定位（Orient）**。快读全文一遍，填表：协议类型 / 本方角色 / 对手方（巨头不谈 vs 创业公司可谈）/ 合同金额（年值或总值）/ 期限与续约机制 / 有无 DPA（附带/URL 引用/缺失）/ 有无订单表。
   - **金额缺失**：若 MSA 不载明金额（价格在订单表，常见），**停下来问**——别擅自假设金额再据此驱动路由。给三选项：贴订单表金额（首选）/ 告知高于或低于阈值 / 保守路由到更高审批人。
   - **DPA 以 URL 引用**：DPA 是合同一部分但不在眼前——在定位表与备忘录明确标注，数据保护分析仅为部分；提议把 DPA 转 `dpa-clause-reviewer`。「缺失 DPA」与「未读 DPA」是不同缺口，分别标注。
4. **第 2 步 致命条款检查（Deal-breaker）**。先查 playbook 里「那一条」（the one thing）。若命中，在备忘录顶部用 `## ⛔ DEAL-BREAKER PRESENT` 标注并停止详细审查——没必要在「供应商可拿客户数据训练模型」的协议上花 30 分钟抠责任上限。
5. **第 3 步 逐条比对（Term-by-term）**。对 playbook 每个门类找到对应合同条款比对，每处偏离产出一个发现块（见「指令」）。其中责任上限与管辖差异两项有专门程序，必须展开。
6. **第 4 步 有利条款与缺口**。两张短清单——「优于我方标准」（谈判筹码）与「完全缺失」（如转让限制、审计权、不可抗力、保险要求）。
7. **第 5 步 升级路由**。对照配置的升级矩阵，按合同金额 / 是否有 🔴 / 自动升级触发器（无限责任、IP 转让等）明确「谁需审批」。**非律师角色发红线给对方前**：发红线是法律行为，须确认是否已与律师审过，否则生成一页 brief，未得明确 yes 不得越过此闸。
8. **第 6 步 组装备忘录**。顶部加配置 `## Outputs` 的工作成果抬头（随角色不同；非美辖区调整「work product」措辞，别虚假保证保护）。备忘录与底层协议可能受特权保护，仅在特权圈内分发；外发前剥离抬头。结尾给下一步决策树，由律师选。

## 指令

**每处偏离的发现块（固定格式）：**

```markdown
### [Section X.X]: [问题名]
**Playbook says:** [我方标准立场，引自配置]
**Contract says:**
> "[合同原文精确引用]"
**Gap:** [缺失 | 弱于标准 | 弱于 fallback | 非标结构 | 不可接受]
**Legal risk:** 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low
**Business friction:** 🔴 Blocks deals | 🟠 Slows deals | 🟡 Confuses customers | 🟢 Invisible
**Why it matters:** [一两句平实英文——若保留原样业务会出什么错]
**Proposed redline:**
> "[可直接粘贴进 markup 的具体替换语言]"
**If they won't move:** [配置里的 fallback，或「escalate to [人]」]
```

**严重度校准（始终相对 playbook）：** 🔴 Critical=不修不签（命中「绝不接受」清单或致命条款）；🟠 High=强推、不让则升级（在 fallback 区间之外）；🟡 Medium=首轮推、若为最后开放项则接受（在 fallback 区间内但未达标准）；🟢 Low=记一笔、不耗资本（playbook 明确容忍或纯风格差异）。条款无法干净映射到某立场时，问用户归入哪档并提议记入配置。

**责任上限四维程序（关键约束，不要只写一行「核对上限」）：** ①直接 vs 间接/后果性损害——上限只管直接还是全部？「12 个月上限管直接损害但后果性不封顶」与「12 个月总额上限」是完全不同的立场，两者都要明说。②上限基数逐字引用——「12 个月」可指索赔前 12 个月已付费 / 当期应付费 / 最近 12 个月用量费 / 当前订单表费 / 历史总付费，相差可达一个数量级；含糊就标记「Cap base is ambiguous — `[引用]` — 可能 [X] 或 [Y]，签前确认」。③上限与 carveout 互动——列出哪些在上限之上（carveout：数据泄露/IP/保密），哪些在之下，评估被封住的面是「meaningful」还是「nominal」。④逐维核对 playbook 立场——直接上限 / 间接损害 / carveout 清单 / 基数定义各有一条；若 playbook 只有单一「standard position」字段，提示拆分。

**管辖差异检查（playbook 用一个全局法律选择，可执行性差异巨大）：** 对照合同实际管辖法核查顶级分歧并标 `[jurisdiction — verify]`：禁挖角/竞业（加州 Bus. & Prof. Code §16600 不可执行，欧盟多辖区受限）；自动续约（CA GBL §17600-17606、NY GBL §527-a、IL 815 ILCS 601 有特定通知要求）；责任排除（欧盟/英国 UCTA 1977、Consumer Rights Act 2015 约束消费者排除，部分美国州限制排除重大过失/故意）；赔偿（部分州使「为受补偿方自身过失而赔偿」无效）；保密期限（部分辖区把「永久」限缩为合理期）。playbook 立场与管辖可执行性冲突时明确标出。

**红线粒度（最小改动优先）：** 红线是谈判产物不是重写。改词优先于改短语，改短语优先于改句，重构子句优先于换句，换句优先于整条替换；仅当对方版本离立场太远、外科手术式改动反更难读时才整条替换，并在转交说明里讲明原因。例：`twelve (12)` → `twenty-four (24)`；`paid by the Buyer` → `paid and payable by the Buyer`。

## 示例

升级路由块（第 5 步）：

```markdown
## Approval routing
Based on [金额 / 问题严重度], this agreement requires:
- [ ] **[姓名/角色]** approval — [原因]
- [ ] **Business owner sign-off** on [具体需业务定夺的商业条款]
**Recommended next step:** [Send redlines to counterparty | Escalate to GC before responding | Get business input on commercial term X first]
```

Slack 一行摘要（频道里有人问「这个能签吗」时用）：

```
[对手方] [类型] — NEEDS WORK. 1🔴 (uncapped liability §8.2), 2🟠. Full review: [link]. Needs [GC] approval.
```

备忘录骨架（第 6 步）：抬头 → `# Vendor Agreement Review: [对手方] [类型]` → `## Bottom line`（两句：能否签？先改什么？+ 双轴问题计数 + 审批人）→ `## Deal-breaker check`（✅ Clear / ⛔ Present）→ `## Issues by severity`（第 3 步发现块按 Critical→Low 分组）→ `## Favorable terms` / `## Missing provisions` → `## Approval routing` → `## Redline package`（如需，汇总可直接 markup 的语言）。

## 注意事项

- **去向检查（Destination check）**：产出前确认接收方是否在特权圈内。公开频道、全员列表、对手方/对方律师、供应商、客户会使工作成果保护失效；去向在圈外时提供 (a) 仅法务的特权版 / (b) 脱敏版 / (c) 两者，别默默加特权抬头又帮粘到抬头保护不了的地方。
- **双轴严重度**：法律风险与业务摩擦是两条轴。一条「法律风险🟢、业务摩擦🔴」的条款（如合法但读起来像肯定性授权、阻塞注册的保密条款）在发现登记里按 🔴 浮现——法律列告诉律师不是责任问题，业务列告诉业务为何仍值得改。上游严重度对下游是下限，不得静默降级。
- **质量自检**：playbook 已加载并被引用（非泛泛市场立场）；致命条款最先查；每个问题都有具体替换语言；严重度有校准（不是全 Critical）；审批人是具名的（不是「升级给法务」）；考虑了对手方语境（巨头 vs 创业公司决定哪些值得争）。
- **来源标注**：备忘录引用法条/法规/判例时打来源标签（`[Westlaw]`、`[statute / regulator site]`、研究 MCP 名、`[web search — verify]`、`[model knowledge — verify]`、`[user provided]`）；带 `verify` 的伪造风险更高、应先核。研究工具返回结果稀少时报告所得并停，不要用网搜或模型知识静默补洞。
- **集成**：CLM MCP 接入时，审后可查该对手方既往协议（影响谈判姿态）、拉匹配工作流模板、建附备忘录与预路由审批人的记录；DocuSign 接入且协议就绪（全绿或问题已接受）时可生成签署信封并按矩阵顺序路由——但「就绪」是律师的判断，未经明确指令不得送签，非律师角色越过签署闸前同样需 brief + 明确 yes。
- 最终红线交付件若需转 Word（跟踪修订），用 `markdown-to-docx`，每处改动注释引用对应 playbook 立场。

## 互见

- requires：无（建议先有团队 playbook 配置，否则只能跑 provisional 模式）。
- related：`nda-triage-reviewer`（NDA 分流，本条的轻量同源近亲）、`dpa-clause-reviewer`（DPA 实质审查，本条在闸口移交它）、`general-counsel-advisor`（升级与总法律顾问视角）。
- combines_with：`diligence-issue-extractor`（并购语境下供应商合同审查与数据室尽调互补）、`markdown-to-docx`（把红线备忘录转成 Word 交付件）。

---
本条采编自 anthropics/claude-for-legal（Apache-2.0）。
