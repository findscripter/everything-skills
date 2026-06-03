---
name: quality-documentation-control
title: 医疗器械质量文件控制管理
description: 当需要为 ISO 13485/21 CFR Part 11 质量体系建立文件编号、版本、变更控制与电子签名审计时使用；做文件全生命周期管控并产出受控文件清单、变更记录与合规校验报告；不适用于非受控内部文档、纸质记录或一般邮件。触发词：文件控制、文件编号、版本控制、变更控制、电子签名、21 CFR Part 11、审计追踪
domain: 领域/medical
triggers: [文件控制, 文件编号, 版本控制, 变更控制, 文件审批, 电子签名, 21 CFR Part 11, 审计追踪, 文件生命周期, 受控文件, 文件主清单, 记录保留]
tags: [医疗器械, 质量管理体系, iso13485, 21cfr11, 文件控制, 变更管理, 电子签名, 合规审计]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Write, Edit, Bash]
requires: []
related: [iso13485-qms-implementer, iso13485-qms-audit, capa-root-cause-officer, fda-qsr-audit-prep]
combines_with: [iso13485-qms-implementer, capa-root-cause-officer]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
为符合 ISO 13485 与 FDA 21 CFR 820/Part 11 的质量管理体系（QMS）设计并运行文件控制系统，覆盖编号规则、审批工作流、变更控制、电子记录与电子签名合规。

## 何时使用

适用：

- 设计或落地受控文件的编号体系、生命周期与主清单（Document Master List）。
- 搭建评审/审批工作流、变更控制流程与变更分类。
- 实施 21 CFR Part 11 的电子记录、审计追踪与电子签名控制。
- 准备 ISO 13485 4.2 / FDA 820.40 内审或法规审查。

不该用（负边界）：

- 非法规要求的内部非受控文档、草稿笔记。
- 纯纸质记录或一般邮件沟通（不在 Part 11 范围内）。
- 产品设计技术细节本身（属设计控制 skill），本 skill 只管文件控制层。

## 步骤

1. 编号：按 `PREFIX-CATEGORY-SEQUENCE[-REVISION]` 申请编号，由文件控制员核验类别、分配下一顺序号并登记主清单，作者用该号建档。校验：格式合规、主清单无重号。
2. 创建：用受控模板起草，标注状态为 Draft（仅作者编辑、不可使用）。
3. 评审：按文件类型路由必需评审人，评审期 5-10 个工作日；作者处置全部意见并记录回应，再重提。
4. 审批：按审批矩阵获取签名（含姓名、签名、日期、角色四要素）。校验：必需评审人全部完成、所有意见有书面处置结论。
5. 生效：分配生效日期、完成培训后发布为 Effective，更新主清单。校验：使用点可获取最新版、作废版已移除。
6. 变更：填变更申请单（含理由）→ 文件控制员分配变更号并登记 → 影响评估 → 按分类审批 → 实施 → 升版并补全变更历史。校验：变更与批准范围一致、变更历史完整。
7. 退役：版本被替代标 Superseded 从在用移除，不再适用标 Obsolete 按保留期归档。

## 指令

编号类别码（CATEGORY）：01 质量管理 / 02 文件控制 / 03 人力资源 / 04 设计开发 / 05 采购 / 06 生产 / 07 质量控制 / 08 CAPA / 09 风险管理（ISO 14971）/ 10 法规事务。

文件前缀（PREFIX）：QM 质量手册 / SOP 标准操作程序 / WI 作业指导书 / TF 模板表单 / SPEC 规范 / PLN 计划。

升版规则：重大修订递增主版本号（Rev 01→02）；轻微修订递增子版本（Rev 01→01.1）；行政性修订加字母后缀或不变（Rev 01→01a）。

变更分类与审批级别：行政性（无内容影响，文件控制员批，如错别字/排版）；轻微（局部内容，过程负责人+QA）；重大（实质内容，完整评审周期）；紧急（安全/合规紧迫，加急+追溯审批）。

文件校验工具：

```bash
# 校验文件元数据
python scripts/document_validator.py --doc document.json

# 交互式校验
python scripts/document_validator.py --interactive

# 输出 JSON 以便集成
python scripts/document_validator.py --doc document.json --output json

# 生成示例文件 JSON
python scripts/document_validator.py --sample > sample_doc.json
```

校验项：编号规则合规、标题与状态、日期（生效/复审到期）、按类型的审批要求、变更历史完整性、Part 11 控制（审计追踪、签名）。

## 示例

变更历史表（每份文件必含）：

```
| 版本 | 日期       | 描述         | 作者     | 审批人   |
|------|------------|--------------|----------|----------|
| 01   | 2023-01-15 | 初始发布     | J. Smith | M. Jones |
| 02   | 2024-03-01 | 更新工作流   | J. Smith | M. Jones |
```

文件校验输入 JSON：

```json
{
  "number": "SOP-02-001",
  "title": "Document Control Procedure",
  "doc_type": "SOP",
  "revision": "03",
  "status": "Effective",
  "effective_date": "2024-01-15",
  "review_date": "2025-01-15",
  "author": "J. Smith",
  "approver": "M. Jones",
  "change_history": [
    {"revision": "01", "date": "2022-01-01", "description": "Initial release"},
    {"revision": "02", "date": "2023-01-15", "description": "Updated workflow"},
    {"revision": "03", "date": "2024-01-15", "description": "Added e-signature requirements"}
  ],
  "has_audit_trail": true,
  "has_electronic_signature": true,
  "signature_components": 2
}
```

编号示例 `SOP-02-001-A`：SOP=类型（标准操作程序），02=类别（文件控制），001=顺序号，A=版本标识。

## 注意事项

- 21 CFR Part 11 范围：仅适用于 FDA 法规要求的记录、提交 FDA 的记录及其电子签名；纸质记录、内部非受控文档、一般邮件不适用。
- 审计追踪须满足：安全（用户不可改）、计算机自动生成、时间戳、保留原始值、记录修改者身份（who/what/when 齐全）。
- 电子签名须满足：个人唯一（不可共享）、至少 2 个组件（用户名+密码起步）、显示签名表现（姓名+日期时间+含义，如「Approved for Release」）、与记录绑定不可剥离复制。
- 系统控制清单：唯一用户 ID、密码复杂度、失败锁定、会话超时；全量创建/修改记录新旧值与身份时间戳；基于角色的访问控制、静态与传输加密、定期备份并验证恢复。
- 周期复审：政策每 3 年、SOP/WI 每 2 年、规范随产品变更、表单/模板每 3 年。
- 常见审计发现及预防：在用作废文件→分发控制；缺审批签名→发布前强制工作流；变更历史不全→每次升版强制更新；无复审计划→建立并执行复审日历；审计追踪不足→对 DMS 做 Part 11 验证。
- 法规锚点：ISO 13485:2016 第 4.2 条（4.2.4 文件控制、4.2.5 记录控制）；FDA 21 CFR 820.40 文件控制、820.180/181/184/186 记录要求。

## 互见

- 设计开发文件控制 / CAPA 管理 / 风险管理（ISO 14971）等同体系其他 skill。
- 原仓库参考：`references/document-control-procedures.md`（完整编号与变更指南）、`references/21cfr11-compliance-guide.md`（Part 11 详细要求与差距评估模板）。

---

采编自 alirezarezvani/claude-skills（MIT 许可），已按中文「技能大典」SCHEMA 适配重写。
