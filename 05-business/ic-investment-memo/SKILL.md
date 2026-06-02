---
name: ic-investment-memo
title: 投委会投资备忘录（IC Memo）
description: 当为私募股权/并购交易准备投委会（IC）过会、需把尽调发现、财务分析与交易条款汇编成专业 IC 备忘录并给出明确建议时使用；产出含执行摘要、投资逻辑、回报分析与风险评级的标准 IC Memo（默认 .docx，备选 Markdown），含明确的过会/否决/有条件通过建议；不适用于法律文书起草、详细财务建模本身或合规披露。触发词：IC 备忘录、投委会、过会材料、交易立项、投资建议书
domain: 商业/finance
triggers: [IC 备忘录, IC memo, 投委会, 投资委员会, 过会材料, 交易立项, 投资建议书, deal write-up, 交易备忘录, 推荐备忘录, 投资建议, 尽调汇编]
tags: [ic-memo, private-equity, investment-committee, due-diligence, valuation, returns, finance, deal-approval]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Word (.docx), Markdown, Financial Tables, Returns Analysis (IRR/MOIC), Sources & Uses, EBITDA Bridge]
requires: []
related: [ma-playbook, pe-dd-checklist, cim-builder, ib-pitch-deck-builder]
combines_with: [pe-dd-checklist, ma-playbook]
license: Apache-2.0
source: anthropics/financial-services
source_license: Apache-2.0
---
# 投委会投资备忘录（IC Memo）

## 何时使用

当一笔私募股权/并购交易已完成尽调与初步建模，需要把分散的材料（公司画像、尽调发现、财务分析、交易条款、回报测算）汇编成一份可直接上投委会（Investment Committee）的专业备忘录，并给出明确投资建议时使用。典型触发：「写 IC 备忘录」「准备过会材料」「把这单交易写成投资建议书」「做一份推荐备忘录」。

**不该用它的边界：**

- 不替代律师起草 SPA/LOI/term sheet 等法律文书——备忘录只陈述交易关键条款，正式文本交外部法务。
- 不替代详细财务建模本身——若回报模型尚未建好，先用财务建模/估值类技能产出 IRR/MOIC 数据，本技能负责把结果汇编成 IC 文档。
- 不做上市公司信息披露、反垄断申报等合规文书。
- 输入缺失（交易价格、回报假设等）时**不要靠假设硬凑**——先回去要数据。

判据一句话：**手里已有尽调和财务结论、只差「写成一份能过会的文档」时，用它。**

## 步骤

1. 收集输入（向用户索取，或复用本会话已有的分析）：
   - 公司概况与业务描述、行业/市场背景
   - 历史财务（3-5 年）、管理层评估
   - 交易条款（价格、结构、融资）
   - 尽调发现（商业、财务、法务、运营）
   - 价值创造计划 / 100 天计划
   - 回报分析（基准、上行、下行三情景）
   - 缺哪项就问，**别假设**交易条款或回报数字。

2. 按标准 IC Memo 九段结构起草（见「指令」九段模板与页数预算）。

3. 选输出格式：默认 Word（.docx）专业排版；快速评审可用 Markdown。财务与回报**必须用表格**呈现，不只是散文。

4. 自检勾稽与平衡性（见「注意事项」），确认数字闭合、多空两面都讲，再交付。

## 指令

标准 IC Memo 九段模板（括号内为页数预算，控制篇幅）：

| 段 | 标题 | 核心内容 |
|----|------|----------|
| I | 执行摘要（1 页） | 公司描述、交易理由、关键条款；**投资建议与头条回报**；Top 3 风险及缓释 |
| II | 公司概况（1-2 页） | 业务/产品、客户与 GTM、竞争定位、管理团队 |
| III | 行业与市场（1 页） | 市场规模与增速、竞争格局、长期趋势/顺风、监管环境 |
| IV | 财务分析（2-3 页） | 历史表现（收入/EBITDA/利润率/现金流）、盈利质量调整（QoE）、营运资本、资本开支 |
| V | 投资逻辑（1 页） | 为何有吸引力（3-5 根支柱）、价值创造杠杆（有机增长/利润率提升/并购/倍数扩张）、100 天优先级 |
| VI | 交易条款与结构（1 页） | 企业价值与隐含倍数、Sources & Uses、资本结构/杠杆、关键法律条款 |
| VII | 回报分析（1 页） | 基准/上行/下行三情景、各情景 IRR 与 MOIC、驱动回报的关键假设、敏感性分析 |
| VIII | 风险因素（1 页） | 按严重度与概率排序的关键风险、逐项缓释措施、deal-breaker 风险（若有） |
| IX | 投资建议 | 明确结论：**过会 / 否决 / 有条件过会**；关键条件或下一步 |

数字勾稽自检（交付前必过）：

- **EBITDA bridge** 调整后能对上（报表 EBITDA → 调整后 EBITDA 每一步可追溯）。
- **Sources & Uses 平衡**（来源合计 = 用途合计）。
- **回报数学一致**（隐含倍数、杠杆、退出假设与 IRR/MOIC 互洽）。
- 三情景假设清晰列出，上行不靠魔法、下行不回避。

平衡性原则：

- 事实、平衡，**多空两面都诚实呈现**——投委会成员终会发现问题，可信度比好看更重要。
- **不要淡化风险**；deal-breaker 该写就写。
- 若用户提供了机构标准模板，优先套用其格式。

## 示例

某 PE 机构评估收购一家 SaaS 标的，准备上投委会：

```
输入清单（缺则向用户索取，不臆造）：
- 标的 ARR $40M，近 4 年财务；管理层评估
- 交易：EV $200M，5x ARR，55% 股权 + 45% 杠杆
- 尽调：商业/财务/法务/运营四类发现，含 QoE 调整
- 回报：基准 IRR 22% / MOIC 2.6x；上行 30% / 3.4x；下行 12% / 1.6x

起草 → 套用九段模板，执行摘要先给建议+头条回报+Top3 风险
自检 → EBITDA bridge 对上、S&U 平衡、IRR 与杠杆/退出倍数一致
输出 → 默认导出 .docx，财务与回报用表格而非散文
建议 → IX 段写「有条件过会：以 QoE 调整后 EBITDA 复核通过、
        核心 IP 交割前完成转让为前置条件」
```

## 注意事项

- 输入缺失时**先问再写**，绝不对交易价格、回报假设、条款做假设性填充。
- 财务表格必须勾稽：EBITDA bridge 对上、Sources & Uses 平衡、回报数学一致——任一不闭合都说明数据或逻辑有问题。
- 多空两面诚实呈现，不淡化风险；投委会成员会自行挖出问题，藏风险只会损害可信度。
- 默认输出 .docx 专业排版；财务与回报用表格，不要只写散文。
- 用户给了机构标准模板时优先套用，不要自创格式。
- 本技能负责「汇编成文档」，详细估值/回报模型本身交财务建模类技能产出。

## 互见

- requires：`startup-financial-modeler` / 财务建模类 —— 提供 IRR/MOIC 与三情景数据，本技能负责汇编成文
- related：`ma-playbook` —— 并购全流程框架，IC Memo 是其「过会」环节的产物
- related：`deal-desk-reviewer` —— 交易条款评审，可为 VI 段提供输入
- related：`cfo-financial-advisor` —— 估值方法与交易结构判断
- combines_with：`markdown-to-docx` —— 把 Markdown 草稿转成投委会可用的 .docx
- combines_with：`board-deck-builder` —— 把 IC Memo 提炼成董事会/投委会演示稿

本条采编自 anthropics/financial-services（Apache-2.0）。
