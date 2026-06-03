---
name: deal-desk-reviewer
title: 交易台合同与折扣评审
description: 当成交前需评审单笔交易、折扣超出 AE 权限、客户红线修改 MSA、或要把折扣审批路由给具名审批人时使用；做交易毛利与风险打分、折扣审批链路由、条款雷区扫描，产出"评分卡＋具名审批人路由"建议包；不适用于撰写提案、设计折扣矩阵、或对全文合同做深度法务红线（转交对应技能）。触发词：折扣审批、MSA红线、毛利评分
domain: 商业/sales
triggers: [折扣审批, 折扣超AE权限, MSA红线, 交易毛利评分, 交易台评审, 审批链路由, 条款雷区扫描, 无上限赔偿, CFO签字, deal desk, discount approval]
tags: [商业, sales, 交易台, 折扣审批, 毛利评分, 合同红线, msa, 条款风险, 审批路由, revops]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [deal_scorer.py, discount_approval_router.py, terms_redliner.py]
requires: []
related: [contract-proposal-writer, cro-revenue-advisor, pricing-strategy, sales-enablement]
combines_with: [contract-proposal-writer, pricing-strategy, cro-revenue-advisor]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

在「销售已提出折扣」与「CFO/CRO/法务签字」之间的那一刻使用本技能，把诉求量化并路由给具体的人。典型触发：

- 销售提出的折扣超出 AE 审批权限。
- 客户返回了带红线修改的 MSA，需在转法务前做分诊。
- 交易需要 CFO 签字，你要一份可辩护的毛利拆解。
- RFP 需多年期条款，需对交易结构（付款、续约形态）打分。
- 续约扩容捆绑了折扣，需核验是否符合商业政策。
- 在搭建交易台审批队列，需要一致的路由规则。

**不该用于**：撰写提案/SOW/MSA（用合同与提案撰写类技能）；重新设计折扣矩阵与审批阈值（用 commercial-policy 类政策设计技能）；对整篇合同正文做深度法务红线（用 general-counsel-advisor 类技能，本技能只吃结构化条款 JSON）。

**核心红线：本技能从不自动批准。** 每个产出都是「数字评分卡 ＋ 路由给具名人类审批人」的建议，即便结论是 APPROVE，也必须点名谁来签。

## 步骤

1. **录入交易** —— 让销售/AE 填写 `assets/deal_intake_template.md`，含 ARR、期限、折扣、付款条件、客户分层、战略标记，以及客户标注的条款红线（约 20 分钟）。
2. **打分毛利＋风险** —— 跑 `deal_scorer.py`，按 5 个维度（毛利、风险、战略价值、商业契合、结构形态）给 0-100 综合分，输出四档结论之一：**APPROVE / REVIEW / ESCALATE / DECLINE**，每档绑定具名审批链。
3. **路由折扣** —— 跑 `discount_approval_router.py`，把「折扣百分比＋交易规模＋分层」映射到具名审批链（AE → 经理 → 总监 → VP → CFO/CRO）并给出预估周期天数。企业地板价、SMB 快车道等修正项会显式标出。
4. **扫描红线** —— 跑 `terms_redliner.py`，得到按 CRITICAL/HIGH/MEDIUM/LOW 排序的发现，每条附标准反提条款（counter）和必须签字的法务/商务审批人。
5. **组装评审包** —— 把三项产出合成一份交易台评审包，务必包含具名审批链。该包是**建议**，不是批准。

## 指令

三个确定性脚本，均为纯标准库实现，统一支持 `--help`、`--sample`、`--input <json>`、`--output {human,json}`：

```bash
# 1. 交易打分（profile: saas | enterprise-software | services | marketplace）
python3 scripts/deal_scorer.py --sample
python3 scripts/deal_scorer.py --input my_deal.json --profile enterprise-software

# 2. 折扣审批路由
python3 scripts/discount_approval_router.py --sample
python3 scripts/discount_approval_router.py --input my_deal.json --profile saas

# 3. 条款红线扫描（侦测 10 类雷区：无上限赔偿、MFN、永久回授许可、缺 DPA、NET-60+、宽泛禁挖角等）
python3 scripts/terms_redliner.py --sample
python3 scripts/terms_redliner.py --input my_deal_terms.json --output json
```

打分权重（毛利 30%、风险 20%、战略 15%、商业 20%、结构 15%）偏 CFO 视角，是 `score_deal()` 顶部常量，可按需调权。若公司已有成文折扣矩阵，通过输入 JSON 的 `policy_thresholds` 字段覆盖默认行业阈值。

**逼问清单（成交前必须先答完再跑脚本）**，深度优先、逐题问、不打包：

1. 满折扣下的毛利是多少？同等条件下下季 pipeline 长什么样？（一个 40% 先例会重塑 3 个季度的 pipeline）
2. 此折扣在标准折扣矩阵内还是外？若在外，显式标出政策例外并路由给具名例外审批人。
3. 除 ARR 外的战略价值（logo、参考客户、扩容路径）？须有书面、可核验的承诺。
4. 客户是否签了赔偿上限、责任上限、DPA（涉欧盟数据）？**无上限赔偿是关键信号否决项，无论毛利多高都阻断 APPROVE。**
5. 付款条件 NET-30/45/60+？优先 NET-30；每多 15 天约损失 2% 有效交易价值。
6. 多年期年度预付，还是年度自动续约？多年预付 > 年度预付 > 年度自动续约；无 60 天通知的自动续约是红线。
7. 折扣链每一跳的具名审批人是谁？「VP Sales」不是审批人，「Maria Singh，VP Sales」才是。

锁定第 1-4 题后再开 5-7 题；7 题答完后按 `deal_scorer.py` → `discount_approval_router.py` → `terms_redliner.py` 顺序执行。

## 示例

样例交易（28% 折扣的企业级 SaaS，带无上限赔偿＋MFN）：综合分 **55.4 / 100，正确判为 DECLINE**，并路由到 **AE → Deal Desk → VP Sales → CFO → CRO → General Counsel**。这印证了关键信号（无上限赔偿）覆盖综合分的设计——高分不等于可批。

## 注意事项

- **绝不自动批准。** 任何结论（含 APPROVE）都点名必须签字的人，产出始终是建议。
- **不要因分数高就跳过红线扫描。** 高综合分＋`UNCAPPED_INDEMNITY` 仍是 DECLINE，关键信号覆盖综合分。
- **别拿它做任意合同正文的法务审查。** 本技能只吃结构化条款 JSON；散文红线请用 general-counsel-advisor 的合同风险扫描脚本。
- **别把折扣路由器当折扣计算器。** 它路由的是 AE/客户已提出的折扣，不计算"正确"折扣；定价逻辑在 pricing-strategist。
- **别把每笔交易都路由到 CFO。** 路由器停在能签该交易的最低权限层；过度升级拖慢漏斗、纵容 AE 过度打折。
- **别手改审批链以跳过某一跳。** 修正项（企业地板价、SMB 快车道）是显式的；隐藏跳跃会破坏审计轨迹。
- 本技能假设**商业政策已存在**（折扣区间、付款条件规范、赔偿上限），它只应用政策、不设计政策；政策设计见 commercial-policy。红线器只覆盖 10 类最常见雷区，**不替代**对完整合同的法务总顾问审查。

## 互见

- **pricing-strategist**：设定定价模型（按席位/用量/分层、标价、打包），在策略层而非单笔交易。
- **contract-and-proposal-writer**：撰写提案/SOW/MSA，产出是文档；交易台是签字**前**的闸门。
- **commercial-policy**：设计折扣矩阵与审批阈值；交易台逐笔**应用**该政策。
- **general-counsel-advisor**：对完整合同正文做深度法务红线与条款书分析；交易台用结构化条款 JSON。
- **cfo-advisor**：烧钱率、单位经济、融资模型等战略财务；交易台是单笔交易粒度。

---

采编自 alirezarezvani/claude-skills（MIT 许可）。
