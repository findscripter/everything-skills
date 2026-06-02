---
name: gdpr-data-handler
title: GDPR合规数据处理
description: 当为处理欧盟个人数据的系统实现GDPR合规、同意管理或数据主体权利时使用；产出同意记录模型、DSAR处理、数据保留与脱敏、隐私设计及数据泄露通知方案；不适用于纯CCPA/中国个保法等非欧盟法规或法律意见出具；触发词：GDPR、欧盟隐私合规、consent同意管理、DSAR数据主体请求、被遗忘权erasure、数据可携、72小时泄露通知
domain: 领域/legal
triggers: [GDPR, 欧盟隐私合规, consent同意管理, DSAR数据主体请求, 被遗忘权erasure, 数据可携, 72小时泄露通知]
tags: [gdpr, privacy, compliance, consent, dsar, data-retention, breach-notification, legal]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [javascript, python, mongodb, geoip2, json]
requires: []
related: [gdpr-data-handling, dpa-clause-reviewer, dsar-response-builder, privacy-impact-assessor]
combines_with: [dsar-response-builder, privacy-impact-assessor, dpa-clause-reviewer]
license: MIT
source: wshobson/agents
source_license: MIT
---
## 何时使用

适用场景：

- 为处理欧盟个人数据（EU personal data）的系统落地 GDPR 合规。
- 实现同意管理（consent）、处理数据主体请求（DSAR：访问/更正/删除/可携）。
- 做 GDPR 合规评审、设计隐私优先架构、起草数据处理协议。
- 落地数据保留策略与泄露通知流程。

不该用边界：

- 仅涉及非欧盟法规（如美国 CCPA、中国个保法）时，本条规则与时限并不直接适用，需另查对应法规。
- 需要正式法律意见或合同条款审定时，本条只提供工程实现，不替代律师/DPO 审核。
- 不涉及个人数据处理的纯技术任务无需引入本条。

## 步骤

1. 数据盘点与合法性基础：对每类处理活动确定 Art.6 合法性基础（同意/合同/法律义务/重大利益/公共利益/正当利益），敏感数据（Art.9 健康、宗教、种族）须显式同意，刑事数据（Art.10）、儿童（<16）数据另行处理。
2. 同意管理：用带审计日志的数据模型记录每次同意（purpose、granted、timestamp、source、policy version、ip、userAgent），同意须 opt-in、按目的分离、可撤回。
3. 数据主体请求（DSAR）：建立提交-核验-处理流程，访问/删除/更正/可携各自处理，**1 个月内响应**（复杂请求最多延至 60 天）。
4. 数据保留：按数据类型定义保留期与触发点，到期归档后删除或脱敏/匿名化。
5. 隐私设计（Privacy by Design）：PII 与行为数据分离、静态加密、最小化收集、假名化。
6. 泄露通知：高/敏感级别 **72 小时内通知监管机构**，高风险需通知受影响个人。

## 指令

- 同意 UI：必要类 cookie 默认勾选且禁用（无需同意）；分析、营销类必须默认未勾选，由用户主动 opt-in；提供「全部接受/全部拒绝/保存偏好」与隐私政策链接。
- 同意服务核心方法：`recordConsent(userId, purpose, granted, metadata)` 写入 consents 与 auditLog 并 `eventBus.emit('consent.changed', …)`；`hasConsent(userId, purpose)` 取该 purpose 最新一条判断 granted；`getConsentHistory(userId)` 返回 auditLog。
- DSAR 关键常量：`RESPONSE_DEADLINE_DAYS = 30`、`EXTENSION_ALLOWED_DAYS = 60`；提交时 `deadline = now + 30 天` 并通知 DPO。
- 删除请求须先 `source.can_delete(user_id)` 检查法律例外（如税务留存），不可删则记录 `retained: reason`。
- 可携导出转为机读 JSON：`{export_date, format_version, data}`。
- 保留策略：每类配 `retention_period_days / basis / trigger / archive_before_delete`，分析类可设 `anonymize_instead=True` 改为匿名化（清空 user_id、ip_address、device_id）。
- 泄露：`AUTHORITY_NOTIFICATION_HOURS = 72`；敏感类型（health/financial/credentials/biometric）或 MEDIUM+ 必须通知监管机构；HIGH/CRITICAL 须通知受影响个人。

## 示例

同意服务（JavaScript，节选）：

```javascript
class ConsentManager {
  async recordConsent(userId, purpose, granted, metadata) {
    const consent = {
      purpose, granted, timestamp: new Date(),
      source: metadata.source,
      version: await this.getCurrentPolicyVersion(),
      ipAddress: metadata.ipAddress, userAgent: metadata.userAgent,
    };
    await this.db.consents.updateOne({ userId }, {
      $push: {
        consents: consent,
        auditLog: { action: granted ? "granted" : "withdrawn", purpose,
                    timestamp: consent.timestamp, source: metadata.source },
      },
    }, { upsert: true });
    await this.eventBus.emit("consent.changed", { userId, purpose, granted });
  }

  async hasConsent(userId, purpose) {
    const record = await this.db.consents.findOne({ userId });
    if (!record) return false;
    const latest = record.consents
      .filter((c) => c.purpose === purpose)
      .sort((a, b) => b.timestamp - a.timestamp)[0];
    return latest?.granted === true;
  }
}
```

删除请求处理（Python，节选，含法律例外检查）：

```python
async def process_erasure_request(self, request_id):
    request = await self.get_request(request_id)
    results, exceptions = {}, []
    for source in self.data_sources:
        can_delete, reason = await source.can_delete(request['user_id'])
        if can_delete:
            await source.delete_user_data(request['user_id'])
            results[source.name] = 'deleted'
        else:
            exceptions.append({'source': source.name, 'reason': reason})
            results[source.name] = f'retained: {reason}'
    return {'request_id': request_id, 'results': results, 'exceptions': exceptions}
```

最小化收集（按目的过滤表单字段）：

```python
REQUIRED_FIELDS = {
    'account_creation': ['email', 'password'],
    'newsletter': ['email'],
    'purchase': ['email', 'name', 'address', 'payment'],
    'support': ['email', 'message'],
}
allowed = REQUIRED_FIELDS.get(purpose, [])
return {k: v for k, v in form_data.items() if k in allowed}
```

## 注意事项

应做：

- 最小化收集，只采所需；记录所有处理活动与合法性基础（Art.30）。
- PII 静态与传输中均加密；按需知（need-to-know）做访问控制；持续审计。

禁忌：

- 不要预勾选同意框（必须 opt-in）；不要捆绑同意（按目的分离）。
- 不要无限期留存；定义并强制执行保留期。
- 不要忽视 DSAR（30 天响应）；跨境传输无 SCC 或充分性认定保障时不得传输。

合规清单要点：合法性基础已记录 / 同意机制合规 / 访问·删除·可携·更正流程到位且 30 天内响应 / 静态与传输加密 + 访问控制 + 审计日志 / 泄露检测与 72 小时通知流程 / 处理活动记录（Art.30）、DPIA、供应商数据处理协议齐备。

## 互见

- fact-checking：核验声明与证据，可用于 DSAR 中数据准确性与更正请求处理。
- csv-data-cleaner：对导出/留存数据做清洗与脱敏字段处理。

本条采编自 wshobson/agents（MIT）。
