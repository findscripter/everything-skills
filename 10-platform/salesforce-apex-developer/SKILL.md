---
name: salesforce-apex-developer
title: Salesforce Apex 与 LWC 开发
description: 当在 Salesforce 平台上写/调 Apex、建 Lightning Web Components、优化 SOQL/SOSL、实现触发器/批处理/平台事件或做集成与 SFDX/CI-CD 时使用；做一套已批量化、守治理限额、测试覆盖≥90% 且经 scratch org 源驱动部署的 Apex+LWC 实现；不适用于纯声明式配置（Flow/Process Builder）、非 Salesforce CRM 或前端通用框架；触发词：Salesforce、Apex、LWC、SOQL、SOSL、触发器、批处理、平台事件、治理限额、Salesforce DX。
domain: 平台/integration
triggers: [Salesforce, Apex, LWC, Lightning Web Components, SOQL, SOSL, 触发器, trigger, 批处理, batch, 平台事件, platform events, 治理限额, governor limits, Salesforce DX, sfdx, scratch org]
tags: [salesforce, apex, lwc, soql, trigger, governor-limits, batch-apex, sfdx, ci-cd, integration]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Salesforce CLI (sf/sfdx), Apex, Lightning Web Components, SOQL/SOSL, scratch org]
requires: []
related: [salesforce-automation, web-component-design, typescript-advanced-types, api-design-principles]
combines_with: [salesforce-automation, ci-cd-pipeline-builder, api-design-principles]
license: MIT
source: jeffallan/claude-skills
source_license: MIT
---
# Salesforce Apex 与 LWC 开发

## 何时使用

适用：
- 在 Salesforce 平台上写 Apex 类/触发器，或调试既有 Apex 报错、命中治理限额。
- 构建 Lightning Web Components（LWC），用 `@wire`、事件、`@api`/`@track` 组合页面。
- 优化 SOQL/SOSL：选择性查询、关系查询、跨对象聚合，规避全表扫描。
- 实现异步处理（Batch/Queueable/Future）、平台事件、REST/SOAP 集成与外部服务对接。
- 用 Salesforce DX + scratch org 做源驱动开发与 CI/CD 元数据部署。

不该用（负边界）：
- 纯声明式配置能解决的需求（Flow、Process Builder、校验规则、公式字段）——优先声明式，不要为它写 Apex。
- 非 Salesforce 的 CRM/平台（HubSpot、Dynamics 等），命令与对象模型不通用。
- 通用前端框架（React/Vue）问题——LWC 有自己的模块/响应式约束，不要套用通用方案。

核心判据：先问「能否声明式实现」；要写代码就必须**批量化（bulkify）+ 守治理限额 + 测试覆盖 ≥90%（含 200 条批量场景）**，三者缺一不可。

## 步骤

1. 分析需求：明确数据模型、对象关系、预估记录量级与会触及的治理限额（SOQL/DML 条数、堆大小、CPU 时间）。
2. 设计方案：判定声明式 vs 编程式；规划批量化路径；设计集成方式（同步回调 vs 平台事件 vs 异步）。
3. 实现：触发器只做分发，逻辑落在 Handler 类；LWC 拆分展示/容器组件；SOQL 用索引字段做选择性查询。
4. 校验限额：动手前核对单事务内 SOQL/DML 不超限、堆与 CPU 在预算内；长任务改异步。
5. 测试：写 `@IsTest` 测试类，覆盖率 ≥90%，必须含 200 条批量插入/更新场景，并用 `Test.startTest()/stopTest()` 隔离限额。
6. 部署：用 Salesforce DX、scratch org 与 CI/CD 做元数据部署，源驱动而非点鼠标改生产。

## 指令

硬约束（MUST）：
- **批量化**：先在循环外收集 ID/记录，再在循环外做一次 SOQL/DML；绝不在循环内查询或写库。
- 测试类覆盖率 ≥90%，含批量场景。
- SOQL 用索引字段做 `WHERE`，善用关系子查询减少往返。
- 长任务用恰当的异步模型（Batch/Queueable/Future）。
- 错误处理与日志到位；需要部分成功时用 `Database.update(scope, false)`。
- 用 Salesforce DX 做源驱动开发与部署。

禁止（MUST NOT）：
- 循环内执行 SOQL/DML（治理限额违例）。
- 硬编码记录 ID 或凭证。
- 写无防护的递归触发器（缺静态标志位/已处理集合）。
- 跳过字段级安全（FLS）与共享规则校验。
- 使用已弃用的 Salesforce API/组件。

## 示例

批量化触发器（正确：循环外查询一次）：

```apex
trigger AccountTrigger on Account (before insert, before update) {
    AccountTriggerHandler.handleBeforeInsert(Trigger.new);
}

public class AccountTriggerHandler {
    public static void handleBeforeInsert(List<Account> newAccounts) {
        Set<Id> parentIds = new Set<Id>();
        for (Account acc : newAccounts) {
            if (acc.ParentId != null) parentIds.add(acc.ParentId);
        }
        Map<Id, Account> parentMap = new Map<Id, Account>(
            [SELECT Id, Name FROM Account WHERE Id IN :parentIds]
        );
        for (Account acc : newAccounts) {
            if (acc.ParentId != null && parentMap.containsKey(acc.ParentId)) {
                acc.Description = 'Child of: ' + parentMap.get(acc.ParentId).Name;
            }
        }
    }
}
```

反例（错误：循环内 SOQL，必然触限）：

```apex
trigger AccountTrigger on Account (before insert) {
    for (Account acc : Trigger.new) {
        Account parent = [SELECT Id, Name FROM Account WHERE Id = :acc.ParentId]; // BAD
        acc.Description = 'Child of: ' + parent.Name;
    }
}
```

Batch Apex（允许部分成功）：

```apex
public class ContactBatchUpdate implements Database.Batchable<SObject> {
    public Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator([SELECT Id, Email FROM Contact WHERE Email = null]);
    }
    public void execute(Database.BatchableContext bc, List<Contact> scope) {
        for (Contact c : scope) { c.Email = 'unknown@example.com'; }
        Database.update(scope, false); // 部分成功，不让单条失败回滚整批
    }
    public void finish(Database.BatchableContext bc) { /* 通知或链式启动下一批 */ }
}
// 执行：Database.executeBatch(new ContactBatchUpdate(), 200);
```

测试类（覆盖 200 条批量场景）：

```apex
@IsTest
private class AccountTriggerHandlerTest {
    @TestSetup
    static void makeData() {
        Account parent = new Account(Name = 'Parent Co');
        insert parent;
    }
    @IsTest
    static void testBulkInsert() {
        Account parent = [SELECT Id FROM Account WHERE Name = 'Parent Co' LIMIT 1];
        List<Account> children = new List<Account>();
        for (Integer i = 0; i < 200; i++) {
            children.add(new Account(Name = 'Child ' + i, ParentId = parent.Id));
        }
        Test.startTest();
        insert children;
        Test.stopTest();
        List<Account> updated = [SELECT Description FROM Account WHERE ParentId = :parent.Id];
        System.assert(!updated.isEmpty(), 'Children should have descriptions set');
        System.assert(updated[0].Description.startsWith('Child of:'), 'Description format mismatch');
    }
}
```

选择性 SOQL + 关系查询（用索引字段，子查询减往返）：

```apex
List<Opportunity> opps = [
    SELECT Id, Name, Amount, StageName
    FROM Opportunity
    WHERE AccountId IN :accountIds       // 索引字段
      AND CloseDate >= :Date.today()     // 索引字段
    ORDER BY CloseDate ASC LIMIT 200
];
List<Account> accounts = [
    SELECT Id, Name,
           (SELECT Id, LastName, Email FROM Contacts WHERE Email != null)
    FROM Account WHERE Id IN :accountIds
];
```

最小 LWC（计数器，含三件套）：

```javascript
// counterComponent.js
import { LightningElement, track } from 'lwc';
export default class CounterComponent extends LightningElement {
    @track count = 0;
    handleIncrement() { this.count += 1; }
}
```

```html
<!-- counterComponent.html -->
<template>
    <lightning-card title="Counter">
        <div class="slds-p-around_medium">
            <p>Count: {count}</p>
            <lightning-button label="Increment" onclick={handleIncrement}></lightning-button>
        </div>
    </lightning-card>
</template>
```

```xml
<!-- counterComponent.js-meta.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>59.0</apiVersion>
    <isExposed>true</isExposed>
    <targets>
        <target>lightning__AppPage</target>
        <target>lightning__RecordPage</target>
    </targets>
</LightningComponentBundle>
```

## 注意事项

- **治理限额是第一约束**：单事务默认 100 条 SOQL / 150 条 DML / 6MB（同步）堆。任何循环内查询/写库都要先重构成批量化。
- **递归触发器**：用静态布尔标志位或「已处理 ID 集合」防二次进入，否则更新会反复触发自身直至触限。
- **测试不是补覆盖率**：必须断言业务结果，并显式构造 200 条场景；`Test.startTest()/stopTest()` 之间限额重置，把被测异步逻辑放进去。
- **部分成功**：批量 DML 用 `Database.update(scope, false)`，再读 `SaveResult` 处理失败行，别让一条坏数据回滚整批。
- **FLS 与共享**：以 `with sharing` 运行，查询/写入前校验字段级安全，尤其面向 community/guest 用户。
- **绝不硬编码 ID/凭证**：环境间 ID 不同；凭证走 Named Credentials / Custom Metadata。
- 详细分主题可按需展开：Apex 异步模式、LWC wire 服务、SOQL 优化、集成模式（REST/SOAP/平台事件）、SFDX/CI-CD。

## 互见

- requires：`rest-api-endpoint-builder` —— 做 Salesforce 外部集成/回调前，先掌握 REST 端点设计。
- related：`api-design-reviewer`、`web-component-design`、`shopify-app-development`、`code-reviewer`
- combines_with：`ci-cd-pipeline-builder` —— 把 SFDX 元数据部署接入流水线，实现 scratch org 自动化交付。

—— 本条采编自 jeffallan/claude-skills（MIT 许可）。
