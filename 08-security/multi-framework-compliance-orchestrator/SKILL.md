---
name: multi-framework-compliance-orchestrator
title: 多框架合规编排器（multi-framework-compliance-orchestrator）
description: 当同时搭建多框架合规项目、规划年度审计日历或冲刺认证 stage 1 时使用；做四件事并产出结果——选框架(选择器)、算重叠(跨框架映射+证据复用)、模拟审计(从205场景库抽)、整合统一证据清单；不适用于单框架技术落地/控制项配置或日常证据维护；触发词：多框架合规、跨框架映射、证据复用、模拟审计、认证就绪
domain: 安全/compliance
triggers: [多框架合规, 合规编排, 跨框架映射, 控制项重叠, 证据池, 证据复用, 模拟审计, 内审项目, 认证就绪, 年度审计日历, GRC, ISO 27001 + SOC 2, ISO 27001 + ISO 42001]
tags: [合规, compliance, 安全, grc, 多框架, 跨框架映射, 证据管理, 审计, iso, soc2, 认证]
level: 进阶
status: deprecated
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Bash, Write, python]
requires: []
related: [compliance-readiness-review, soc2-compliance-preparer, iso27001-isms-implementer, security-audit-toolkit]
combines_with: [gdpr-data-handling, iso42001-aims-specialist, dependency-auditor]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
supersedes: []
---
> **Upstream status:** The original upstream skill ID for this encyclopedia entry was not found in the current upstream repository tree after a thorough name/alias search (2026-09-16 cleanup). Entry kept for graph stability; `status: deprecated`.
# 多框架合规编排器

元编排器：让合规团队**配置**适用框架、**计算**跨框架控制项重叠、**模拟**内部审计、**整合**多框架证据。四个决策，不做单框架深潜——单框架操作交给对应专项技能，本技能只做编排。

支持 12 个框架：ISO 27001 / 13485 / 42001 / 14971、欧盟 AI 法案、欧盟 MDR 745、GDPR、SOC 2、FDA QSR、NIST CSF 2.0、NIS2、HIPAA。

## 何时使用

需要**横跨 2-4 个框架同时决策**时使用。典型触发：

- 从零搭建多框架合规项目（项目 bootstrap）
- 规划年度内审日历（监督审核排期 + 审核员独立性）
- 冲刺外部认证 stage 1 之前做就绪
- 想知道新框架能复用多少已认证框架的证据

**不该用边界：**
- 单一框架的技术落地、控制项配置（用对应专项技能：ISO 42001、ISO 27001、SOC 2、GDPR 等）。
- 日常证据更新与台账维护这类例行运营。
- 约束性法律意见——跨框架映射只反映公开指南（ISO 标准、法规、EDPB/委员会指南、IIA/AICPA 专业标准），新颖交叉映射须经法务复核。

## 步骤

四个决策各对应一个脚本，按需运行：

1. **哪些框架适用？** `framework_selector.py` 用公司画像（行业、地域、AI 使用、医疗、金融、人数、客户、PHI、NIS2 实体定级、美政府承包商）对 12 框架打分，返回适用列表 + 依赖图。
2. **重叠多少、能复用多少证据？** `cross_framework_mapper.py` 计算控制项级重叠，输出统一控制矩阵 + 证据复用机会。
3. **模拟审计产出什么？** `audit_simulator.py` 按 ISO 19011 + IIA IPPF 生成 8-15 个发现项场景。
4. **统一证据清单是什么？** `evidence_pool_generator.py` 整合各启用框架的证据需求。

## 指令

```bash
python scripts/framework_selector.py
python scripts/cross_framework_mapper.py
python scripts/audit_simulator.py
python scripts/evidence_pool_generator.py
```

## 示例

```markdown
**结论一句话：** [多框架全景 + 最大复用机会]
**正在做的决策：** [框架集 | 重叠图 | 审计计划 | 证据整合]
**证据：** [框架名 + 来自工具的控制项 ID]
**如何行动：** [3 个具体下一步，含负责人 + 截止日期]
```

## 注意事项

- 本技能不替代单框架深潜，也不替代约束性法律意见。
- 高杠杆证据（≥5 映射）最先建。
- 必须有单一问责的元项目负责人。

## 互见

- related：`compliance-readiness-review`、`iso27001-isms-implementer`、`soc2-compliance-preparer`

---

采编自 alirezarezvani/claude-skills（MIT 许可证）。
