---
name: contract-escalation-router
title: 合同问题审批升级路由
description: 当合同评审发现某条款超出评审者审批权限、需按升级矩阵定位审批人并起草「请批」消息时使用；产出含审批人、渠道、合同原文/playbook 立场/选项与建议/决策截止日的可直接发送草稿；不适用于做出审批决定、替审批人选项、直接发送消息、逐条合同评审（用 contract-playbook-review）；触发词：谁审批、谁能批、升级、escalate、需要 GC 签字、走审批、approval、路由审批、who approves
domain: 领域/legal
triggers: [谁审批, 谁能批, 升级, escalate, 需要GC签字, 走审批, approval, who approves, 审批升级]
tags: [legal, escalation, approval, routing, contract, deal-desk]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [contract-playbook-review, nda-triage-reviewer, legal-risk-classifier, general-counsel-advisor, dpa-clause-reviewer]
combines_with: [contract-playbook-review, esignature-routing, diligence-issue-extractor]
license: Apache-2.0
source: anthropics/claude-for-legal
source_license: Apache-2.0
---
## 何时使用

- 用户问「这个谁审批 / 谁能批 / 需要 GC 签字吗 / 帮我走审批」，或上游评审技能发现某条款超出评审者审批权限，需要按团队升级矩阵定位审批人并起草「请批」消息。
- 目标是让审批人**只看这一条消息就能拍板**，不必再去翻合同；不让律师在下午五点临时写「在吗，问个事」。

**不该用边界（命中即停）：**
- 本条只**路由 + 起草**，不做审批决定、不替审批人选项、**不发送**消息——草稿给律师看过再由其本人发送。
- 完整逐条合同评审 → `contract-playbook-review`；NDA 速审 → `nda-triage-reviewer`；整体法务判断 → `general-counsel-advisor`。
- 在 fallback 区间内、本无需上交的条款，不要升级。

## 步骤

1. **加载升级矩阵**：读取团队配置 `~/.claude/plugins/config/claude-for-legal/commercial-legal/CLAUDE.md` → `## Escalation` 段。缺失或语焉不详时直接说明——该信息应在 cold-start 访谈中采集，没采到则需补全 practice profile，不要自行猜阈值。
2. **判定本方立场**：先确定升级的合同里公司是卖方（供应商，通常用我方范本）还是买方（客户，通常用对方范本）。不明显就问。读对应 playbook 段（`### Sales-side playbook` / `### Purchasing-side playbook`）判断该条款是落在 fallback 内还是触发自动升级——同一条款在不同立场可能一边可接受、一边是硬红线。在草稿里注明所用立场。
3. **刻画问题类型**：金额阈值 / 条款偏离 / 自动触发 / 业务决策（见「指令」）。
4. **对照矩阵、点名审批人**：要具体到人或角色（如「GC 张某」），不要写「法务领导层」。矩阵未覆盖该情形时如实说明，并建议问谁。
5. **按模板起草「请批」**：合同怎么写、playbook 怎么说、选项+建议、决策截止日（见「示例」）。
6. **记录升级**：有工单/CLM 审批流就登记；没有就在评审备忘里注明已升级、给谁、何时，让下一个读备忘的人看到状态。
7. **不发送**：起草、展示，交给律师本人发送。

## 指令

**问题刻画（决定升给谁）：**
- **金额阈值**：合同金额超出某人的审批权限 → 升给该金额档位有权者。
- **条款偏离**：条款落在 playbook fallback 之外，需更资深者裁断是否接受 → 升给能批非标条款者。
- **自动触发**：命中「无论金额一律升级」清单（典型：无上限责任、IP 转让给对方、任何 Never 清单项）→ 升给该触发项指定的人。
- **业务决策**：不是法律问题，需业务负责人（owner）而非法务领导拍板。

**矩阵匹配决策流（按序短路）：**
```
是否命中自动触发项？
  → 是：升给该触发项指定的审批人
  → 否：继续
合同金额是否超出评审者阈值？
  → 是：升给该金额档位有权审批者
  → 否：继续
条款偏离是否落在所有书面 fallback 之外？
  → 是：升给能批非标条款者
  → 否：评审者自己即可批准，无需升级
```

**升级矩阵预期结构**（来自 practice profile）：

| Can approve | Threshold | Escalates to | Via |
|---|---|---|---|
| Paralegal | Standard terms, <$50K | Counsel | Slack |
| Counsel | Non-standard but within fallbacks, <$500K | GC | Slack or email |
| GC | Everything else | CFO/Board | Meeting |

外加**自动升级触发项**（无论金额一律升）：典型为无上限责任、IP 转让、任何「Never accept」清单项。

**校准原则——拿不准就升级、并注明。** 不必要升级的成本约为审批人 30 秒（看一眼说「行，继续」，且留痕证明其看过）；漏掉一次升级则可能签下未经批准的条款，是不可逆的单向门。两者成本不对称——**拿不准就升级**。
- 明显在 fallback 内：不升。
- 明显在区间外或命中自动升级清单：升。
- 不确定（条款含糊、新颖、勉强算在区间内但论证牵强）：照升，并显式注明不确定点，让草稿标出审批人需裁断的具体问题。**审批人收窄，本技能不替它决定。**
- playbook 未覆盖的新类问题：不要猜阈值，问审定律师该类问题是否应升级，并主动提议把答案记回 practice profile 以保后续一致。

## 示例

调用：
```
The Acme MSA has uncapped liability — who approves and what do I say?
```
```
Reference: acme-review-memo.md
Issue: §8.2 indemnity carveouts
```

「请批」草稿模板（审批人看这一条即可决策）：
```markdown
**Escalating to:** [审批人姓名/角色]
**Via:** [Slack #channel / 邮件 / 会议 —— 按 practice profile]
**Urgency:** [若有截止日]

---

Hey [name] —

Need your call on the [对方] [协议类型]。[一句交易背景。] (Side: sales / purchasing)

**The issue:** [一段大白话：对方要什么、为何超出我方标准、实际风险是什么。]

**What the contract says:**
> "[合同原文精确引用]"

**What our playbook says:** [引自 practice profile 的对应立场]

**Options:**
1. **Accept** —— [一句话：为何可能可以接受]
2. **Push back with:** "[拟提的反提案语言]" —— [一句话：对方可能反应]
3. **Walk** —— [一句话：结合业务背景这是否现实]

**My recommendation:** [选哪个、为何，简短]

**Need a decision by:** [若有截止日]

[完整评审备忘链接]
```

## 注意事项

- **三不**：不审批（只路由）、不替审批人选项（草稿带建议但由其拍板）、不发送（律师读后自行发）。
- **矩阵缺失/模糊**时直接说明，不要自行猜阈值；建议补全 practice profile。
- **不要因为「过度升级会让审批人养成略读习惯」而压下一次升级**——那是律师调整 playbook 阈值要解决的审批体验问题，不是本技能靠对一个自己都不确定的条款做主观判断来解决的。
- **目的地检查**：`PRIVILEGED & CONFIDENTIAL` 只是标签不是控制；若草稿要发往公开频道/全员列表/对方律师等会破坏特免（privilege）的目的地，先提示并给「仅法务版 / 脱敏版」选项。
- **非 US 辖区**：升级矩阵与 work-product 标记多为 US 导向，命中非 US 事实时识别并提示，勿照搬。
- 所有结论须经合格法律专业人士复核后方可依据。

## 互见

- related：`contract-playbook-review` —— 逐条评审发现超权问题后，由本条路由升级
- related：`general-counsel-advisor` —— 整体法务判断与 GC 级裁断
- related：`nda-triage-reviewer`、`legal-risk-classifier` —— 上游分流/定级，其严重度作为升级 floor
- combines_with：`esignature-routing` —— 审批通过后衔接签署路由
- combines_with：`diligence-issue-extractor` —— 把升级状态汇回尽调问题清单

---
本条采编自 anthropics/claude-for-legal（Apache-2.0）。
