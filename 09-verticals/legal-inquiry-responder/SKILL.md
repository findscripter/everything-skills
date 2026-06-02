---
name: legal-inquiry-responder
title: 法律咨询应答（模板+升级判定）
description: 当需要用既有模板回复常见法律咨询（数据主体请求 DSR、诉讼保全通知、供应商法律问题、业务团队 NDA 请求、隐私问询、传票/法律程序、保险报案）时使用；先跑升级触发器自检，无触发则套模板填具体事实/管辖/期限生成「待审阅草稿」+ 跟进事项，命中触发则停手、说明触发原因、给升级路径与「DRAFT-FOR COUNSEL REVIEW ONLY」草稿；不适用于提供法律意见、直接外发定稿、传票/监管/诉讼等必须律师定夺的场景。触发词：法律咨询回复、模板回复、DSR应答、保全通知、NDA请求、传票应答、升级判定
domain: 领域/legal
triggers: [法律咨询回复, 模板回复, DSR应答, 数据主体请求, 诉讼保全通知, 供应商法律问题, NDA请求, 隐私问询, 传票应答, 保险报案, 升级判定, legal response, data subject request, litigation hold notice]
tags: [法律, 合规, 模板, 数据主体请求, 诉讼保全, NDA, 隐私, 传票, 升级判定]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [docx, markdown]
requires: []
related: [quick-legal-problem-triage, legal-client-intake, nda-triage-reviewer, dsar-response-builder]
combines_with: [legal-risk-classifier]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
# 法律咨询应答（模板+升级判定）

> 本技能辅助法律工作流，**不提供法律意见**。生成内容均为草稿，外发前须经合格律师审阅，受监管的沟通（DSR、传票等）尤其如此。

## 何时使用

需要对**常见、可模板化**的法律咨询起草回复，且本质上重复出现、有标准框架时：

- `dsr` 数据主体请求（访问/删除/更正/可携/退出）
- `hold` 诉讼/证据保全通知（discovery / litigation hold）
- `vendor` 供应商法律问题（合同状态、修订、合规证明、审计、保险证书）
- `nda` 业务团队 NDA 请求（发标准件 / 接收对方件加批注 / 婉拒 / 续期）
- `privacy` 隐私问询（Cookie/追踪、隐私政策、数据共享、儿童数据、跨境传输）
- `subpoena` 传票或法律程序应答
- `insurance` 保险报案/补充材料/权利保留回复
- `custom` 自定义模板

未给类型则先列出上述类目并询问。

**不该用（应停手转人工）**：① 需要出具法律意见或个案诉讼策略；② 命中下文「升级触发器」的任何场景；③ 传票/法律程序——**几乎总需律师个案审查**，模板仅为起点；④ 直接外发定稿——本技能只产「待审阅草稿」。

## 步骤

**S1 识别类型**：接收类型，模糊则列类目澄清。

**S2 加载模板**：在本地设置查模板（如 `legal.local.md` 或 templates 目录）。有则载入并识别必填变量；无则告知未找到、按类型给一个合理默认结构、并可走「模板创建」帮其建模板存档复用。

**S3 升级触发器自检（生成任何回复前必跑）**：评估本情形是否**不该**用模板回复。

通用触发器（所有类目）：涉潜在诉讼/监管调查；来自监管/政府/执法机关；回复可能构成有约束力的承诺或弃权；涉潜在刑事责任；已有或可能有媒体关注；前所未有（团队无先例）；多法域且要求冲突；涉高管或董事会成员。

分类触发器：
- **DSR**：涉未成年人数据 / 由未成年人或其代表提出；来自监管机构（非个人）；数据正处于保全（litigation hold）下；请求人为有活跃争议/HR 事项的现/前员工；范围异常宽泛或疑似「钓鱼式」；涉有特殊要求法域的数据；涉特殊类别数据（健康/生物识别/基因）。
- **保全 Hold**：涉潜在刑事责任；保全范围不清/有争议/可能过宽；某些数据是否在范围内存疑；同一或关联事项已有在先保全；保全可能显著影响在营业务；与监管删除要求冲突；保管人对范围有异议。
- **供应商**：涉争议或潜在违约；供应商威胁诉讼或终止；涉监管合规（非仅合同条款）；回复可能构成约束性承诺/弃权；可能影响在谈判判。
- **NDA**：对方是竞争对手；涉政府涉密信息；业务背景指向潜在并购（M&A）；涉异常主题（AI 训练数据、生物识别数据等）。
- **传票/法律程序**：**永远需律师审查**（模板仅起点）；存在特权问题；涉第三方数据；涉跨境提交；时限不合理。

**命中触发器时**：① **停**——不出模板回复；② **告警**——告知用户已检出触发器；③ **说明**——指出命中哪条、为何重要；④ **建议**——给升级路径（资深律师/外部律师/特定成员）；⑤ **提供**——给一份明确标注 `DRAFT — FOR COUNSEL REVIEW ONLY` 的草稿，而非定稿。

**S4 采集具体事实**（按类型）：
- DSR：请求人姓名/联系方式、请求类型、涉及数据、适用法规（GDPR/CCPA/CPRA/其他）、回复期限。
- 保全：事项名/编号、保管人、保全范围（日期段/数据类型/系统）、外部律师联系人、生效日。
- 供应商：供应商名、参照协议、具体问题、相关合同条款。
- NDA：发起业务团队/联系人、对方名、用途、单/双向、特殊要求。

**S5 生成回复**：用事实填充模板，确保——语气得当（专业、清晰，对业务读者不过度法言法语）；含该类型全部法定要素；引用具体日期/期限/义务；给收件人明确下一步；含适当免责/警示。把草稿呈给用户审阅后再发。

**强制定制**：每份模板回复必须替换——正确姓名/日期/编号、个案具体事实、适用法域与法规、按收悉日推算的正确期限、恰当签名块与联系人。**按受众/关系/敏感度/紧迫性调语气**。**按法域校准**：核验所引法规对请求人法域正确、期限匹配适用法、含法域特定权利信息与术语。

**S6 无模板则建模板**：走模板创建指引并呈成品，建议用户存入本地设置复用。

## 指令

升级判定决策伪代码：

```
for trigger in (通用触发器 + 该类目触发器):
    if 命中(trigger):
        停止生成模板回复
        告警并说明命中的 trigger 与理由
        给出升级路径（资深/外部律师 或 具体成员）
        产出草稿，抬头标注 "DRAFT — FOR COUNSEL REVIEW ONLY"
        return
# 传票/法律程序：无条件进入上述分支
生成模板回复（含强制定制项）→ 呈用户审阅 → 跟进事项清单
```

## 示例

**DSR 模板结构**：

```
Subject: Your Data [Access/Deletion/Correction] Request - Reference {{request_id}}

Dear {{requester_name}},

We have received your request dated {{request_date}} to [access/delete/correct]
your personal data under [applicable regulation].

[Acknowledgment / verification request / fulfillment details / denial basis]

We will respond substantively by {{response_deadline}}.

[Contact information]
[Rights information，含向监管机构投诉的权利]
```

**保全通知模板结构**（律师-当事人沟通，密级抬头）：

```
Subject: LEGAL HOLD NOTICE - {{matter_name}} - Action Required

PRIVILEGED AND CONFIDENTIAL
ATTORNEY-CLIENT COMMUNICATION

Dear {{custodian_name}},

PRESERVATION OBLIGATION:
Effective immediately, you must preserve all documents and electronically
stored information (ESI) related to:
- Subject matter: {{hold_scope}}
- Date range: {{start_date}} to present
- Document types: {{document_types}}

DO NOT delete, destroy, modify, or discard any potentially relevant materials.

Please acknowledge receipt by {{acknowledgment_deadline}}.
Contact {{legal_contact}} with any questions.
```

**输出格式**：

```
## Generated Response: [Inquiry Type]
**To**: [recipient]   **Subject**: [subject line]
---
[Response body]
---
### Escalation Check
[确认未检出触发器，或标注命中的触发器及建议]
### Follow-Up Actions
1. [发后动作]  2. [日历提醒]  3. [跟踪/留痕要求]
```

## 注意事项

- **永远先呈草稿供审阅再外发**；若经 MCP 连接邮箱，可代建草稿邮件（不直接发送）。
- **跟踪回复期限**并可代设日历提醒；受监管回复（DSR、传票）务必标注适用期限与法规要求。
- 模板是「活文档」：用户改动模板回复时，建议据此回写改进模板。
- 传票/法律程序：**模板仅为框架，非定稿**，几乎总须律师个案审查。
- 所有产出均为草稿、非法律意见；最终责任在执业律师。

## 互见

- related：`dsar-response-builder` —— DSR 端到端核验+应答构建，本技能 DSR 类目的深化
- related：`legal-hold-manager` —— 保全通知的签发/刷新/解除全生命周期管理
- related：`nda-triage-reviewer` —— NDA 请求分流与条款审查
- related：`legal-risk-classifier` —— 升级/风险定级的量化框架
- related：`general-counsel-advisor` —— 命中升级触发器后的律师升级路径
- combines_with：`esignature-routing` —— 回复定稿后走签署路由
- combines_with：`legal-hold-manager` —— DSR 数据撞上在保全时联动判定

---

本条采编自 anthropics/knowledge-work-plugins（Apache-2.0）。
