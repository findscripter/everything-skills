---
name: multi-framework-compliance-orchestrator
title: 多框架合规编排器（multi-framework-compliance-orchestrator）
description: 当同时搭建多框架合规项目、规划年度审计日历或冲刺认证 stage 1 时使用；做四件事并产出结果——选框架(选择器)、算重叠(跨框架映射+证据复用)、模拟审计(从205场景库抽)、整合统一证据清单；不适用于单框架技术落地/控制项配置或日常证据维护；触发词：多框架合规、跨框架映射、证据复用、模拟审计、认证就绪
domain: 安全/compliance
triggers: [多框架合规, 合规编排, 跨框架映射, 控制项重叠, 证据池, 证据复用, 模拟审计, 内审项目, 认证就绪, 年度审计日历, GRC, ISO 27001 + SOC 2, ISO 27001 + ISO 42001]
tags: [合规, compliance, 安全, GRC, 多框架, 跨框架映射, 证据管理, 审计, ISO, SOC2, 认证]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Bash, Write, python]
requires: []
related: [compliance-readiness-review, soc2-compliance-preparer, iso27001-isms-implementer, security-audit-toolkit]
combines_with: [gdpr-data-handling, iso42001-aims-specialist, dependency-auditor]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
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
   - 确定性规则：医疗器械→ISO 13485 + ISO 14971 +（欧盟市场则 MDR 745）+（美国市场则 FDA QSR）；面向客户的 AI→ISO 42001 + 欧盟 AI 法案（欧盟用户）+ GDPR（个人数据）；面向企业客户的 B2B SaaS→SOC 2 + ISO 27001；欧盟客户 + 个人数据→GDPR 强制；强监管行业→叠加行业专项。
2. **重叠多少、能复用多少证据？** `cross_framework_mapper.py` 计算控制项级重叠，输出统一控制矩阵 + 证据复用机会。每条合并控制项给出：映射置信度（HIGH/MEDIUM/LOW）、复用机会（一份证据满足 N 个控制项）、各框架引用、可跨框架复用的落地指引。
   - 最密重叠：ISO 27001 Annex A ↔ SOC 2 信任服务准则，历史 ~75% 控制项共享；加 ISO 42001 引入 AI 专属控制项，加 GDPR 引入隐私专属。
3. **模拟审计产出什么？** `audit_simulator.py` 按 ISO 19011 + IIA IPPF 生成 8-15 个发现项场景。严重度分布：观察项/OFI ≥40%，严重/重大 ≤15%（IIA 对健康项目的期望）；每个范围内控制项配 3-5 个访谈问题 + 文档调阅清单 + 走查请求。可用 205 场景库（见注意事项）增强。
4. **统一证据清单是什么？** `evidence_pool_generator.py` 整合各启用框架的证据需求，输出每份证据满足哪些 (框架, 控制项) 组合、复用杠杆分（一份证据覆盖 N 控制项 × M 框架）、获取成本估计。

四条生命周期工作流（按场景挑选）：
- **项目 bootstrap（4-8 周）**：selector→各框架差距分析→mapper→evidence pool→输出带负责人/日期的优先级 backlog。
- **年度审计日历**：刷新 selector→各框架排期工具→协调跨框架日历（独立性+容量）→逐框架 simulator 给审核员预热。
- **认证就绪（每新框架 6-12 周）**：新框架差距分析→对已认证框架跑 mapper→HIGH 置信复用证据/MEDIUM-LOW 新建→simulator 干跑认证审计→stage 1 前关缺口。
- **证据池整合（季度）**：刷新 evidence pool→锁定高杠杆证据（1 证据→5+ 控制项）→核证据新鲜度→审计证据池本身（无孤儿控制项、无陈旧证据）。

## 指令

```bash
# 决策 A：哪些框架适用（不带参数=内置中期 AI SaaS 样例）
python scripts/framework_selector.py
python scripts/framework_selector.py path/to/profile.json

# 决策 B：跨框架重叠（内置 ISO 27001 + SOC 2 样例）
python scripts/cross_framework_mapper.py
python scripts/cross_framework_mapper.py path/to/control_libs.json

# 决策 C：模拟审计（内置 ISO 27001 样例）
python scripts/audit_simulator.py
python scripts/audit_simulator.py path/to/audit_scope.json

# 决策 D：整合证据清单（内置 3 框架样例）
python scripts/evidence_pool_generator.py
python scripts/evidence_pool_generator.py path/to/program.json
```

脚本路径相对于原 compliance-os 项目，迁移到本仓库后请校正为实际位置；若脚本缺失，可把四个决策当作人工核对框架使用。

## 示例

固定输出模板：

```markdown
**结论一句话：** [多框架全景 + 最大复用机会]
**正在做的决策：** [框架集 | 重叠图 | 审计计划 | 证据整合]
**证据：** [框架名 + 来自工具的控制项 ID，给数据不给形容词]
**如何行动：** [3 个具体下一步，含负责人 + 截止日期]
**你的决策：** [只有合规负责人能拍的板——追哪些框架、审计周期优先级、证据复用策略]
```

## 注意事项

- **本技能不替代单框架深潜**，也不替代约束性法律意见；它只做编排，操作工作交给专项技能。
- 严重度分布既看上限也看下限：全是严重项可能是审核破坏性或项目真在失败，全是观察项说明审核太浅。
- 高杠杆证据（≥5 映射）最先建，避免把同一份访问复核记录收集多遍。
- 各框架各要管理评审，但按 ISO Annex SL 做**一次整合评审**通常即可满足全部（一个日历位）。
- 必须有**单一问责的元项目负责人**，否则项目会碎片化。
- **205 场景库**：`assets/mock_audit_library.json` 含跨 12 框架、26 主题、4 严重度的预置发现项场景（34 严重 / 88 重大 / 54 次要 / 29 观察）。每个场景标注适用框架，交叉引用 mapper 的合并控制项目录解析框架专属控制项 ID；可作为 simulator 输入、新内审员培训资源，或多框架发现模式检测的种子。

## 互见

- related：`compliance-readiness-review` —— 同源「六问质询」就绪压测视角，本技能侧重四决策编排流水线
- related：`iso27001-isms-implementer`、`iso42001-aims-specialist`、`soc2-compliance-preparer`、`gdpr-data-handling` —— 各框架专项深潜
- combines_with：`compliance-readiness-review` —— 编排选完框架后，用六问质询做就绪签署
- combines_with：`security-audit-toolkit`、`soc2-compliance-preparer` —— 模拟审计与证据整合落地
- 相邻专项（源项目）：iso42001-specialist、eu-ai-act-specialist、information-security-manager-iso27001、quality-manager-qms-iso13485、gdpr-dsgvo-expert、fda-consultant-specialist、mdr-745-specialist、risk-management-specialist

---

采编自 alirezarezvani/claude-skills（MIT 许可证）。
