---
name: gdpr-data-handling
title: GDPR 数据合规处理
description: 当处理欧盟个人数据、做同意管理、响应数据主体请求（DSAR）或排查 GDPR 合规缺口时使用；产出合法依据梳理、同意/留存/脱敏代码骨架、DSAR 与数据泄露通报流程及合规清单；不适用于非个人数据处理或代替法务/DPO 终审；触发词：GDPR、数据合规、个人数据、同意管理、consent、数据主体请求、DSAR、被遗忘权、数据留存、隐私设计、数据泄露通报、breach notification
domain: 安全/compliance
triggers: [GDPR, 数据合规, 个人数据, 同意管理, consent, 数据主体请求, DSAR, 被遗忘权, 数据留存, 隐私设计, 数据泄露通报, breach notification]
tags: [gdpr, compliance, privacy, consent, dsar, data-retention, breach-notification, security]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [JavaScript/Node.js, Python, MongoDB, geoip2]
requires: []
related: [gdpr-data-handler, compliance-readiness-review, iso27001-isms-implementer, soc2-compliance-preparer]
combines_with: [dsar-response-builder, privacy-impact-assessor, compliance-readiness-review]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 构建处理欧盟个人数据的系统，需要确定合法依据并落地控制措施。
- 实现同意（consent）采集、撤回与审计，含 Cookie/营销/分析等分目的同意。
- 响应数据主体请求 DSAR：访问、更正、删除（被遗忘权）、可携带、限制处理、反对。
- 做隐私设计（Privacy by Design）、数据最小化、留存与脱敏策略。
- 设计数据泄露 72 小时上报流程、做合规自查清单或数据处理协议（DPA）。

不该用：
- 任务与个人数据处理无关（如纯技术性能、非 EU 数据且无合规诉求）。
- 不能代替针对具体环境的法律审查；产出仅为工程骨架，正式上线前须经 DPO/法务核验。

## 步骤

1. 数据盘点与分类：基础数据 / 敏感数据（第 9 条，需明示同意）/ 刑事数据（第 10 条）/ 儿童数据（16 岁以下需父母同意），按类别定保护级别。
2. 确定合法依据（第 6 条）：同意、合同、法律义务、重大利益、公共利益、正当利益（需做利益平衡评估）。每个处理活动均须记录依据。
3. 落地同意管理：分目的记录 granted/timestamp/version/IP/UA 作为证据，并维护 auditLog；提供撤回入口，撤回与授予同样便捷。
4. 建 DSAR 流程：统一受理、身份核验，1 个月（30 天）内响应，复杂请求可延至 60 天；访问请求聚合多数据源、删除请求检查法定留存例外。
5. 留存与脱敏：按数据类型设留存周期与触发点，到期归档/删除，分析类数据可匿名化替代删除。
6. 隐私设计：PII 与行为数据分库、PII 静态加密、行为数据假名化、按目的最小化采集、IP 仅泛化到国家级。
7. 泄露响应：高危/敏感数据 72 小时内通报监管机构，高/严重等级须通知受影响个人，全程留痕。

## 指令

- 先澄清目标、约束与必要输入；缺少输入、权限、安全边界或验收标准时停下来询问。
- 应用上述模式并验证结果，给出可执行步骤与核验方式。
- 同意 UI 禁止预勾选、禁止捆绑同意；必要 Cookie 始终开启且无需同意。
- 跨境传输须有 SCC 或充分性认定等保障措施。
- 需要完整代码模式时，参考源 `resources/implementation-playbook.md`。

## 示例

同意判定（最新一条为准）：

```javascript
async hasConsent(userId, purpose) {
  const record = await this.db.consents.findOne({ userId });
  if (!record) return false;
  const latest = record.consents
    .filter(c => c.purpose === purpose)
    .sort((a, b) => b.timestamp - a.timestamp)[0];
  return latest?.granted === true;
}
```

删除请求需检查法定留存例外，不能无条件删除：

```python
can_delete, reason = await source.can_delete(user_id)
if can_delete:
    await source.delete_user_data(user_id)
    results[source.name] = 'deleted'
else:  # 例如税务法规要求保留
    results[source.name] = f'retained: {reason}'
```

留存策略（节选）：交易记录因税务须保留 7 年（法律义务），分析数据保留 1 年且到期匿名化而非删除（`anonymize_instead: True`）。

## 注意事项

- DSAR 响应硬性 30 天（复杂可至 60 天），不可忽视或拖延。
- 泄露上报监管机构上限 72 小时；敏感数据（健康、金融、凭证、生物识别）一律须上报。
- 做到：最小化采集、记录一切（处理活动、合法依据）、PII 加密、按需访问、持续审计。
- 不要：预勾选/捆绑同意、无限期留存、无保障跨境传输。
- 须维护第 30 条处理活动记录、DPIA 与供应商 DPA。

## 互见

- dependency-auditor：审计第三方依赖与数据处理方的安全与合规风险。
- code-reviewer：审查同意/DSAR/加密等合规相关代码实现。

---
本条采编自 sickn33/antigravity-awesome-skills（MIT）。参考：GDPR 全文 https://gdpr-info.eu/ ，ICO 与 EDPB 指南。
