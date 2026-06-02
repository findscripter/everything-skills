---
name: contract-proposal-writer
title: 合同与商业提案撰写
description: 当需要快速起草自由职业/开发合同、客户提案、SOW、NDA、MSA 等专业商务法律文档时使用；按司法辖区（美国-特拉华/EU-GDPR/英国/DACH-德国法）选模板、填占位符并用 pandoc 转 DOCX；不适用于替代律师审核高额或复杂交易、也不处理诉讼/出庭。触发词：合同, 提案, proposal, SOW, 工作说明书, NDA, 保密协议, MSA, 主服务协议, contract, GDPR/DPA, 自由职业合同
domain: 商业/sales
triggers: [合同, 提案, proposal, SOW, 工作说明书, NDA, 保密协议, MSA, 主服务协议, contract, GDPR, DPA, 自由职业合同]
tags: [business, sales, legal, contract, proposal, nda, msa, sow, gdpr, pandoc, docx]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [pandoc, git, markdown]
requires: []
related: [sales-enablement, deal-desk-reviewer, cro-revenue-advisor, cold-email-writer]
combines_with: [sales-enablement, deal-desk-reviewer, pricing-strategy]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

当用户要快速产出专业商务法律文档时使用，覆盖以下类型：
- 自由职业/开发合同（固定价、计时、月度顾问）
- 含时间线与预算拆分的客户提案
- 工作说明书 SOW（交付物矩阵）
- 保密协议 NDA（双向 / 单向）
- 主服务协议 MSA、SaaS 合作协议
- 按辖区定制条款（美国/EU/英国/DACH）及 GDPR 数据处理附录（DPA）

不该用的边界：
- 不替代律师。高额或复杂交易、上市公司、并购、强监管行业必须由执业律师复核，本技能只产出强力起点稿。
- 不处理诉讼、出庭、出具法律意见书。
- 不涉及税务/合规审计。

## 步骤

1. 收集要素（逐项追问，缺项标 `REQUIRED`）：
   - 文档类型？contract / proposal / SOW / NDA / MSA
   - 辖区？US-Delaware / EU / UK / DACH
   - 计费类型？固定价 / 计时 / 月度顾问
   - 当事方（名称、角色、营业地址）
   - 范围摘要（1-3 句）
   - 总金额或时薪
   - 起止日期或周期
   - 特殊要求（IP 转让、白标、分包）
2. 选模板：固定价开发→模板 A；月度顾问→模板 B；SaaS 合作→模板 C；NDA 双向/单向→NDA-M / NDA-OW；通用 SOW→SOW base。
3. 生成并填充：替换所有 `[方括号]` 占位符，缺数据标 `REQUIRED`。
4. 转 DOCX（见下方指令）。
5. EU/DACH 项目：只要处理个人数据，必须附 GDPR DPA 条款块（Art. 28）。

## 指令

关键条款选项速查：

| 条款 | 可选项 |
|------|--------|
| 付款 | Net-30 / 里程碑分期 / 月度预付 |
| IP 归属 | 雇佣作品 work-for-hire（US）/ 转让 assignment（EU/UK）/ 反向授权 license-back |
| 责任上限 | 1x 合同额（标准）/ 3x（高风险） |
| 终止 | 违约（14 天补救期）/ 任意终止（30/60/90 天通知） |
| 保密 | 2-5 年 / 商业秘密永久 |
| 质保 | "As-is" 免责 / 30/90 天限期修复 |
| 争议解决 | 仲裁（AAA/ICC）/ 法院（按辖区） |

辖区要点：
- US（特拉华）：适用特拉华州法；work-for-hire 原则（版权法 §101）；仲裁 AAA Commercial Rules；竞业限制在合理范围内可执行。
- EU（GDPR）：处理个人数据须附 DPA；部分成员国 IP 转让需单独书面契据；仲裁 ICC 或当地商会。
- UK（脱欧后）：英格兰法；IP 依 Patents Act 1977 / CDPA 1988；仲裁 LCIA；数据用 UK GDPR。
- DACH（德/奥/瑞）：BGB 管辖；某些条款须书面形式（§126 BGB）；作者保留人身权，须显式转让 Nutzungsrechte；竞业最长 2 年且需补偿（§74 HGB）；管辖 Landgericht 或 DIS 仲裁；个人数据强制适用 DSGVO；遵守法定通知期 Kuendigungsfristen。

转 DOCX（pandoc）：

```bash
# 安装 pandoc
brew install pandoc        # macOS
apt install pandoc         # Ubuntu

# 基础转换
pandoc contract.md -o contract.docx \
  --reference-doc=reference.docx \
  -V geometry:margin=1in

# 法律风格自动编号
pandoc contract.md -o contract.docx \
  --number-sections \
  -V documentclass=article \
  -V fontsize=11pt

# 套用公司模板
pandoc contract.md -o contract.docx \
  --reference-doc=company-template.docx
```

## 示例

模板 A（固定价开发合同）核心结构与关键条款：

```markdown
# SOFTWARE DEVELOPMENT AGREEMENT
**Effective Date:** [DATE]
**Client:** [CLIENT LEGAL NAME], [ADDRESS] ("Client")
**Developer:** [YOUR LEGAL NAME / COMPANY], [ADDRESS] ("Developer")

## 1. SERVICES — 项目/描述/交付物（逐条带 due [DATE]）
## 2. PAYMENT — 里程碑分期 50%/25%/25%；逾期按 1.5%/月计息；
     客户有 [10] 个工作日书面验收或拒收
## 3. INTELLECTUAL PROPERTY — 全款到账后转让；US 按 work made for hire，
     EU/UK 按 assignment of future copyright；预存 IP 仍归 Developer，
     授予 Client 永久免版税许可
## 4. CONFIDENTIALITY — 终止后存续 [3] 年
## 5. WARRANTIES — 交付后 [90] 天实质符合规格，期内免费修缺陷；
     否则 "AS IS"
## 6. LIABILITY — 总责任不超过本协议已付费用；排除间接/附带/后果损失
## 7. TERMINATION — 违约 [14] 天补救期；任意终止 [30] 天通知，
     付已完成工作 + 剩余合同额 [10%]
## 8. DISPUTE RESOLUTION — US:AAA/Delaware；EU/DACH:ICC/DIS；UK:LCIA/London
```

月度顾问（模板 B）关键差异：月度小时上限与是否滚存、超额时薪 overflow rate、初始期 [3] 个月后按月自动续约（[30] 天通知退出）、责任上限按索赔前 3 个月费用的 [3x]。

GDPR DPA 条款块（EU/DACH 必备）应包含：主题事项、数据主体类别、个人数据类别、处理时长（终止后 [30] 天内删除）、处理者义务（仅按书面指示处理 / 保密承诺 / Art. 32 技术与组织措施 / 协助数据主体权利请求 / 未经书面同意不得使用次级处理者）、次级处理者清单、跨境传输依据（SCCs / 充分性决定 / BCRs）。

## 注意事项

常见陷阱：
1. 缺 IP 转让措辞——EU 仅写 "work for hire" 不足，DACH 须显式转让 Nutzungsrechte。
2. 验收标准含糊——必须定义"已验收"（书面签收、X 天内拒收）。
3. 无变更单流程——范围蔓延会拖垮固定价项目，加超范围条款。
4. 辖区错配——德国独占项目却选特拉华州法会造成执行困难。
5. 缺责任上限——无上限时一个 bug 可能等于无限赔偿。
6. 口头修改——务必要求书面修订（amendments in writing）。

最佳实践：
- >$10K 项目用里程碑付款而非 Net-30，降现金流风险。
- EU/DACH：只要有个人数据就需 DPA。
- DACH：显式加书面形式条款 Schriftformklausel。
- 超 3 个月的合同加不可抗力 force majeure 条款。
- 顾问合同定义响应 SLA（如紧急 4h / 普通 24h）。
- 模板纳入版本控制，用 `git diff` 跟踪改动；每年复审（法律尤其 GDPR 解释会变）。
- NDA：务必约定终止时返还/销毁保密材料。

## 互见

- markdown-to-docx：将本技能生成的 Markdown 合同正式转为 DOCX 交付件。
- pdf-form-filler：当客户提供需逐字段填写的 PDF 合同/表单时配合使用。

本条采编自 alirezarezvani/claude-skills（MIT）。
