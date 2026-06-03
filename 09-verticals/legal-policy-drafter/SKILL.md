---
name: legal-policy-drafter
title: 隐私政策与法律条款起草
description: 当需要起草隐私政策、服务条款 ToS、Cookie 政策、数据处理协议 DPA、免责声明或法律告示时使用；做先确定适用法域与法规再套结构化模板，产出含强制披露条款、占位符与合规清单的合规草案并标注需法务定稿处；不适用于代替执业律师出具法律意见、判定条款可执行性或处理具体争议；触发词：隐私政策、privacy policy、服务条款、terms of service、Cookie 政策、数据处理协议 DPA、GDPR、CCPA、免责声明
domain: 领域/legal
triggers: [隐私政策, privacy policy, 服务条款, terms of service, ToS, Cookie 政策, cookie policy, 数据处理协议, DPA, GDPR, CCPA, 免责声明, disclaimer, 用户协议, EULA, 法律条款]
tags: [legal, privacy-policy, terms-of-service, gdpr, ccpa, cookie-policy, dpa, compliance, templates]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [markdown]
requires: []
related: [dpa-clause-reviewer, dpa-playbook-review, privacy-impact-assessor, gdpr-data-handling]
combines_with: [gdpr-data-handler, legal-inquiry-responder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 为网站 / App / SaaS / 电商起草面向用户的法律文本：隐私政策、服务条款（ToS）、用户协议（EULA）、Cookie 政策、免责声明、知识产权告示。
- 生成 GDPR / CCPA 合规文本、Cookie 同意说明、数据处理协议（DPA）。
- 按业务模式（B2C / B2B / SaaS / 电商 / 含未成年人）出可选条款变体，并附每个法规的合规清单。
- 触发词：隐私政策、privacy policy、服务条款、terms of service、ToS、Cookie 政策、cookie policy、数据处理协议、DPA、GDPR、CCPA、免责声明、disclaimer、用户协议、EULA。

不该用的边界：

- 不替代执业律师出具法律意见，不判定条款是否可执行——所有草案须经合格法务 / 律师定稿。
- 不处理具体法律争议、监管调查、个案裁断或诉讼策略。
- 不保证跨法域适用：必须按目标法域（如中国《个人信息保护法》PIPL、欧盟 GDPR、加州 CCPA/CPRA）逐条校准，不可照搬。
- 通用模板禁止直接上线，必须按实际数据处理活动与法域定制。

固定免责声明（须保留在产出中）：本文本为模板，仅供参考；请就你的具体情形咨询合格律师以获取法律意见（"This is a template for informational purposes. Consult with a qualified attorney for legal advice specific to your situation."）。

## 步骤 / 指令

输入：`doc_type`（隐私政策 / ToS / Cookie / DPA / 免责声明）、`jurisdictions`（适用法域，可多选）、`business_model`、`data_collected`（采集的个人数据类型）、`third_parties`（数据共享 / 处理方）、`company`、是否面向 `minors`（未成年人）。

```
1. 识别适用法域与法规（先定范围再起草）
   - 按用户所在地 / 业务覆盖映射：GDPR（欧盟）、CCPA/CPRA（加州）、
     LGPD（巴西）、PIPEDA（加拿大）、UK DPA、PIPL（中国大陆）
   - 专项：COPPA（未成年人）、CAN-SPAM/CASL（邮件营销）、
     ePrivacy 指令（Cookie）

2. 选 doc_type，套对应结构骨架（见「示例」），逐节填 [大写方括号] 占位符

3. 注入强制披露（按法规逐项核对，缺一不可）
   - 隐私政策：采集什么数据、目的、法律依据、保留期、共享对象、
     数据主体权利（访问/更正/删除/可携/反对）、行权与投诉渠道、
     国际传输、安全措施、联系方式 / DPO
   - Cookie 政策：分类（必要/分析/营销）、用途、有效期、第三方、
     同意撤回方式
   - DPA：控制者/处理者角色、处理范围、安全措施、子处理者、
     SCC 跨境条款、协助与审计、终止后数据处置

4. 用清晰可读的语言，同时保持法律精确；逻辑分节 + 标题；
   为不同业务模式提供可选条款变体

5. 标注所有需法务专项审查 / 需核实之处（flag for legal review）

6. 附固定免责声明 + 每个法规的合规清单 + 变更追踪（生效日期 / 版本）

7. 交付：默认 Markdown；需 Word 交付转 markdown-to-docx
```

## 示例

隐私政策骨架——关键小节（占位符按业务填实）：

```markdown
# 隐私政策 / PRIVACY POLICY
生效日期：[EFFECTIVE_DATE]　版本：[VERSION]
1. 我们是谁（控制者 [COMPANY]、联系方式、[DPO 如适用]）
2. 我们采集哪些个人数据（[DATA_TYPES]：账户/设备/使用/支付…）
3. 采集目的与法律依据（GDPR Art.6：同意/合同/合法利益…）
4. Cookie 与同类技术（指向 Cookie 政策）
5. 我们如何共享（[THIRD_PARTIES]：处理方/广告/分析；是否出售—CCPA）
6. 国际数据传输（SCC / 充分性认定）
7. 数据保留期 [RETENTION]
8. 你的权利（访问/更正/删除/限制/可携/反对/撤回同意；
   CCPA：知情/删除/退出出售/不歧视）及行权方式
9. 数据安全措施
10. 未成年人（[若面向 13/16 岁以下：COPPA/GDPR 同意机制]）
11. 政策变更与通知方式
12. 联系与投诉（含向监管机构投诉的权利）
```

服务条款（ToS）核心小节：接受条款 / 账户与资格 / 可接受使用 / 知识产权与许可 / 用户内容 / 付费与退款 / 免责声明（"AS IS"）/ 责任限制 / 赔偿 / 终止 / 适用法律与争议解决 / 变更。

合规清单片段（GDPR，逐项打勾）：

```
[ ] 已列明每项处理的法律依据（Art.6）
[ ] 已说明数据主体全部权利及行权渠道
[ ] 已披露保留期与国际传输保障
[ ] 含撤回同意、向监管机构投诉的指引
[ ] 涉敏感数据时具备 Art.9 依据
```

## 注意事项

- 法律意见红线：产出仅为草案模板，不构成法律意见；上线 / 签署前必须经合格律师 / 法务定稿。这是源技能的硬性免责，须随产出保留。
- 法域优先：源模板以欧美（GDPR / CCPA）为背景；面向中国大陆须按 PIPL / 《数据安全法》改写法律依据、数据主体权利、跨境传输、未成年人同意等条款，不可照搬。
- 强制披露不可省：隐私政策必含数据类型、目的、法律依据、权利、共享、传输、保留、联系方式；漏项即合规缺陷。
- Cookie 同意：分析 / 营销类 Cookie 在 GDPR / ePrivacy 下需事前同意（opt-in），不能默认勾选。
- 未成年人：面向 13 岁（COPPA）/ 16 岁（GDPR）以下须加可核验的家长同意机制，并单列条款。
- 留痕与维护：标注生效日期 / 版本，法规或数据处理活动变更时同步更新文本与清单。
- 所有占位符 [LIKE_THIS] 在交付前须替换或显式标注「待法务确认」。

## 互见

- related：`gdpr-data-handler` —— 落地 GDPR 数据主体请求与处理记录，与隐私政策文本互为表里。
- related：`dpa-clause-reviewer` —— 起草的 DPA 草案可交由其做条款级审查。
- related：`general-counsel-advisor` —— 上线前的整体合规把关与需法务审查项处置。
- related：`privacy-impact-assessor` —— 高风险处理场景先做 DPIA，再据评估调整隐私政策。
- related：`marketing-claims-reviewer` —— 邮件营销 / 广告合规（CAN-SPAM / CASL）配套文本审查。
- combines_with：`markdown-to-docx` —— 把起草好的政策 / 条款 Markdown 转为可交付、可签署的 Word 文档。

---

本条采编自 sickn33/antigravity-awesome-skills（MIT）。
