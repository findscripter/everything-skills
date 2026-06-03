---
name: general-counsel-advisor
title: 总法律顾问（合同/IP/条款）
description: 当审查合同/条款清单、判断何时请外部律师、制定 IP 策略或评估合规暴露（HIPAA/GDPR/FDA/金融）时使用；做合同风险扫描、条款清单创始人友好度评分与监管触发映射，产出「结论+风险+反提案+待律师确认项」。不适用于替代持牌律师出具正式法律意见。触发词：合同审查、条款清单（term sheet）、IP 归属、监管暴露
domain: 领域/legal
triggers: [审查这份合同/MSA/SaaS/NDA/DPA/雇佣协议, 收到一份 term sheet 条款清单想评估, 判断什么时候该请外部律师, 制定 IP/发明归属/开源合规策略, 评估 HIPAA/GDPR/CCPA/FDA/金融监管暴露, 清算优先权/反稀释/期权池怎么看]
tags: [legal, general-counsel, 合同审查, term-sheet, ip策略, 监管合规, startup, c-level]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [contract_risk_scanner.py, term_sheet_analyzer.py]
requires: []
related: [nda-triage-reviewer, employment-contract-drafter, oss-license-compliance, board-minutes-drafter]
combines_with: [nda-triage-reviewer, diligence-issue-extractor]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

- 要审查任意合同（供应商 MSA、客户 SaaS、NDA、DPA、雇佣/承包商协议、股权授予）并在签字前抓出明显陷阱时。
- 收到融资条款清单（term sheet），想评估它对创始人是否友好、该谈判哪几条时。
- 制定 IP 策略：发明归属、开源（OSS）许可合规、商标/专利/商业秘密布局。
- 评估某合同或产品上线是否触发新的监管体系（HIPAA、GDPR/CCPA、FDA/MDR、BSA/AML 等），判断是否需要、何时请专业外部律师。

**不该用 / 边界**：本技能**不是法律意见**，不能替代持牌律师。它只负责「提出该带去问律师的问题」并捕捉签字前的明显陷阱。任何有约束力的决定、正式法律意见、诉讼策略，必须交给合格的外部律师。涉及具体辖区法条适用、跨境执行性判断时同样不要单独依赖本技能输出。

## 先问这几个关键问题

1. **正在创造/共享的 IP 归谁所有？**（承包商若无书面归属条款，IP 不会自动转让给公司。）
2. **责任上限（liability cap）是多少、哪些被排除？**（标准：12 个月费用；IP 侵权、数据泄露、故意不当行为通常另行排除（carve-out）。）
3. **只要有个人数据流动，是否已签 DPA？**（涉及 EU/加州数据时不可谈判。）
4. **终止权、通知期、自动续约陷阱是什么？**（「5 年自动续约 + 提前 60 天通知」是常见创始人踩坑点。）
5. **该合同或产品上线是否触发新监管体系？**（医疗→HIPAA；金融→BSA/AML；医疗器械→FDA/MDR。）
6. **条款清单三处最易吞掉创始人 5% 经济利益**：清算优先权、投前期权池、反稀释类型。

## 步骤

### 合同审查
1. 把合同存为纯文本（plain text）。
2. 运行 `python scripts/contract_risk_scanner.py path/to/contract.txt`（不给路径则用内置样例），它会标记 12 个最常见的「创始人杀手条款」。
3. 对每个 HIGH 风险项，起草一个反提案（counter-proposal）。
4. 把 redline + 反提案带给外部律师确认。
5. 记录决策（原技能用 `/cs:decide`）。

### 条款清单（term sheet）响应
1. 按 `term_sheet_analyzer.py --help` 中的 schema 把条款清单存为 JSON。
2. 运行 `python scripts/term_sheet_analyzer.py path/to/term_sheet.json`，得到 0–100 的创始人友好度评分与逐条标记。
3. 只挑最差的 3 条谈（不要试图赢下全部 20 条）。
4. 签字前务必让证券/创投律师过一遍。
5. 记录决策，并可设冷静期（原技能 `/cs:freeze 30`）防止反悔式重启谈判。

### IP 卫生审计
1. 确认过去 12 个月每位员工与承包商都签了发明归属（invention assignment），无例外。
2. 跑 OSS 许可清单（`pip-licenses`、npm 用 `license-checker`）。
3. 映射 AGPL/GPL 依赖并确认合规（否则移除，这类 copyleft 会传染）。
4. 对新颖发明在披露后 12 个月内提交临时专利（provisional）。
5. 为产品名注册文字商标（先 word mark，后 design mark），上线前做检索。

### 监管触发评估
1. 列出未来 12 个月的产品功能。
2. 用下方触发表把每个功能映射到对应监管体系。
3. 任何 HIPAA / FDA / 金融触发，在动手开发**之前**先请专业律师。
4. 把监管路线图与预算和产品路线图并列管理。

## 指令

**监管触发对照表（命中即在投入前请对应专业律师）：**

| 触发 | 监管体系 | 第一步 |
|---|---|---|
| 医疗数据 | HIPAA、HITECH、州泄露法 | 健康科技专业律师 |
| 持卡人数据 | PCI DSS（行业标准，合同强制） | QSA + 律师 |
| 资金流转 | BSA/AML、州货币转移牌照（50 州拼图） | 金融科技专业律师 |
| 医疗器械主张 | FDA 510(k)/De Novo/PMA、欧盟 MDR、ISO 13485 | 医疗器械专业律师 |
| 欧盟居民个人数据 | GDPR + 部署 AI 则叠加 EU AI Act | 欧盟隐私律师 |
| 加州居民 | CCPA / CPRA | 隐私通才律师 |
| 证券（代币、股权众筹） | SEC 规则（Reg D / Reg A+ / Reg CF） | 证券律师 |
| 国防/航天客户 | ITAR、EAR、DFARS、CMMC | 出口管制律师 |
| 欧盟内 AI | EU AI Act（按风险分级） | 欧盟隐私 + 产品律师 |
| 招聘用 AI（NYC、CO、IL） | 地方偏见审计法 | 劳动律师 |

**条款清单三大要害（标准 vs 敌意）：**
- 清算优先权：1x 非参与（non-participating）为标准；1x 参与或 2x 为敌意。
- 期权池：投前（pre-money）池只稀释创始人；投后（post-money）池按比例稀释所有人。
- 反稀释：宽基加权平均（broad-based weighted average）为标准；完全棘轮（full ratchet）为敌意。

## 示例

通过 `/cs:gc-review` 调用时的标准输出格式：

```
**结论（Bottom Line）：** [签 / 谈判 / 不要签]
**风险（The Risks）：** [3 个最高严重度问题]
**反提案（Counter-Proposals）：** [具体条款语言]
**待外部律师处理项：** [需要带给律师的内容]
**你的决定：** [只有创始人能拍板的那一项]
```

## 注意事项

- **永远不是法律意见**：所有输出都是「带去和持牌律师对话的起点」，不是替代品。
- 承包商/1099 的 IP 归属是关键，且存在用工误分类（misclassification）风险——发明归属条款必签。
- 责任上限标准为 12 个月费用，务必确认 IP 侵权、数据泄露、故意不当行为已被 carve-out。
- 自动续约 + 长通知期是高频陷阱，逐条核对终止权与通知期。
- 著作权创作即生效，但要登记才有资格主张法定赔偿。
- 谈判聚焦最差的 3 条，避免在 20 条上全面开战导致交易破裂。

## 互见

- CISO 顾问 — 合规重叠（SOC 2、ISO 27001、HIPAA 技术保障）。
- CFO 顾问 — 条款清单到稀释计算。
- M&A Playbook — 收购协议、整合手册。
- RA/QM 团队 — ISO 13485、MDR、FDA 510(k)、GDPR 执行落地。

---

采编自 alirezarezvani/claude-skills（MIT 许可）。本技能不构成法律意见，有约束力的决定请始终咨询合格律师。
