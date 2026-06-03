---
name: iso42001-aims-specialist
title: ISO 42001 AI 管理体系合规
description: 当为 ISO/IEC 42001:2023 AI 管理体系（AIMS）做内审、认证准备或把 AI 系统纳入既有 27001/13485 体系时使用；做条款 4-10 差距打分、AI 风险登记册+附录A控制映射、条款9.2十二个月内审计划，产出审计就绪证据；不适用于高管 AI 战略或欧盟 AI 法案条款级合规；触发词：ISO42001、AIMS、AI风险登记册
domain: 安全/compliance
triggers: [ISO 42001, ISO/IEC 42001:2023, AI 管理体系, AIMS, AI 风险登记册, 附录 A 控制, AI 内审, 条款 9.2 内审计划, AI 影响评估, ISO 23894, AI 合规认证, AI 治理]
tags: [安全, compliance, iso42001, aims, ai治理, 内审, 风险管理, iso23894]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [aims_gap_analyzer.py, ai_risk_register_builder.py, aims_audit_scheduler.py]
requires: []
related: [iso27001-isms-implementer, compliance-readiness-review, ai-system-security-audit, eu-ai-act-compliance]
combines_with: [ai-system-security-audit, compliance-readiness-review, iso27001-isms-implementer]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

为 ISO/IEC 42001:2023 AI 管理体系（AIMS）做**内审级**运营时使用，聚焦三个决策：

1. **对照条款 4-10 的差距在哪、先补哪个？** —— 逐条款覆盖打分 + 整改优先级。
2. **AI 风险登记册长什么样、每条风险用哪个控制处置？** —— 按 ISO 23894 风险方法做附录 A.2-A.10 控制映射。
3. **条款 9.2 内审计划怎么排？** —— 含范围、频率、审计员独立性核查的 12 个月排期。

典型场景：准备认证、规划内审周期、把新 AI 系统纳入既有 ISMS（27001）/ QMS（13485）体系。

**不该用（负边界）：**
- **不是高管 AI 战略技能**：是否自建/采购模型、可接受多少业务风险，属首席 AI 官顾问（chief-ai-officer-advisor）范畴；本技能只把这些决策固化为审计就绪证据。
- **不是欧盟 AI 法案合规技能**：42001 是自愿性管理体系标准，AI 法案是强制性产品安全法规。两者有重叠（按 Art.6(2) 的高风险 AI 系统通常需要 Art.17 的 QMS，42001 可部分满足），但产物不同，条款级符合性评估请用 compliance-team-eu-ai-act。
- **不替代 ISO 23894 + 38507**：42001 是管理体系，23894 是喂给条款 6.1 的 AI 风险方法学，38507 是治理视角。`ai_risk_register_builder.py` 实现 23894 流程。

## 步骤

**工作流 1：认证前差距闭环（4-8 周）**
```bash
# 1. 盘点现有 AIMS 证据（政策、程序、记录）后跑差距分析
python scripts/aims_gap_analyzer.py aims_evidence.json
# 2. 审阅差距矩阵，按条款分组
# 3. 每个差距指定责任人 + 截止日（目标：第一阶段审核前关闭）
# 4. 对照已有 ISO 27001 / 13485 工件——大量可复用
# 5. 对照欧盟 AI 法案义务（用 compliance-team-eu-ai-act）
# 6. 产出：带责任人 + 日期的优先级整改计划
```

**工作流 2：AI 风险登记册构建（1-2 周）**
```bash
# 1. 按 ISO 23894 跨 AI 生命周期识别风险（数据/模型/部署/退役）
# 2. 每条风险记录：来源、事件、后果、可能性、影响
python scripts/ai_risk_register_builder.py risks.json
# 3. 每条 高/严重 风险确认 ≥1 个附录 A 控制作为处置手段
# 4. 残余风险接受需管理层签字
# 5. 「容忍」类决策与 CAIO 顾问交叉确认高管层风险接受
# 6. 经管理评审（条款 9.3）留档
```

**工作流 3：年度内审计划（1 天）**
```bash
# 1. 拉取上一年审计发现 + 认证周期状态（第 1/2/3 年）
python scripts/aims_audit_scheduler.py audit_scope.json
# 2. 逐项确认审计员独立性
# 3. 确认覆盖滚动 3 年内每个条款 + 每个适用附录 A 控制
# 4. 提交管理评审审批（条款 9.3 输入）
```

**工作流 4：跨框架复用映射（每纳入一个系统）**
逐个比对既有 ISO 27001 附录 A 控制 / 13485 程序是否已满足某 42001 控制（如 27001 A.8.16 监控可扩展到 AI 系统监控），仅对未覆盖处加 AI 专属补丁，并在 AIMS 范围声明（条款 4.3）中留档。

## 指令

**先问这几个关键问题：**
- 范围声明（条款 4.3）是否点名了**每一个** AI 系统，含嵌入式模型和第三方 AI 服务？漏了 SaaS 供应商的 AI 特性即范围不完整。
- AI 政策（条款 5.2）是否同时承诺：合法使用 **且** 有益目的 **且** 人类监督 **且** 持续改进？缺一即认证时不符合项。
- AI 风险评估（条款 6.1.2）自上次重大模型变更后是否重跑过？概念漂移不是一次性事件。
- 高影响系统的 AI 影响评估（附录 A.5.4）谁签字？无签字担责即控制缺失。
- 内审节奏（条款 9.2）？管理体系标准期望每 3 年周期内每条款 ≥1 次，成熟团队做年度。
- 是否有 AI 事件处置书面程序（附录 A.9.3）？部署后监控缺失是早期采用者的头号不符合项。

**附录 A 控制 10 大类（A.2-A.10，共 38 控制）：** A.2 AI 政策 / A.3 内部组织 / A.4 AI 系统资源 / A.5 影响评估 / A.6 AI 系统生命周期 / A.7 AI 数据 / A.8 面向相关方的信息 / A.9 AI 系统使用 / A.10 第三方与客户关系。风险登记册必须显示每条风险关联 ≥1 个处置它的控制。

**条款 4-10 常见差距速查：** 4 范围漏第三方 AI；5 把「AI 伦理」当营销文案而非承诺；6 风险登记册不关联控制；7 未定义 ML 工程师胜任力要求；8 生命周期阶段未映射到附录 A 控制；9 漂移监控只在代码里、未进管理评审输入；10 CAPA 环与既有 13485/9001 重复。

**输出标准（固定结构）：**
```
**结论：** [一句话——差距严重度 + 最先要关闭的那一件]
**决策类型：** [gap-closure | risk-treatment | audit-scope 三选一]
**证据：** [条款号 + 控制 ID，用工具产出，不用形容词]
**如何行动：** [3 个带责任人 + 日期的具体下一步]
**你的决策：** [只有合规官或 CAIO 能拍板的——风险接受、范围扩展、认证就绪]
```

## 示例

三个决策的快速入口（不带参数跑内置样例，带参数跑你的数据）：
```bash
# 决策 A：对照条款 4-10 的 AIMS 差距分析
python scripts/aims_gap_analyzer.py                    # 内置样例（中期 AI SaaS）
python scripts/aims_gap_analyzer.py path/to/aims_evidence.json

# 决策 B：AI 风险登记册 + 附录 A 控制映射
python scripts/ai_risk_register_builder.py             # 内置 7 风险样例
python scripts/ai_risk_register_builder.py path/to/risks.json

# 决策 C：条款 9.2 内审 12 个月计划
python scripts/aims_audit_scheduler.py                 # 内置 4 域样例
python scripts/aims_audit_scheduler.py path/to/scope.json
```

## 注意事项

- 42001 沿用与 9001/27001/13485 共享的 Annex SL 高层结构：条款 4-10 是管理体系要求，附录 A 是 AI 专属运营控制——两者必须配套，缺一不构成可认证体系。
- 风险登记册是 23894 方法学与 42001 控制之间的**桥**：6.1.2 要求风险评估、6.1.3 要求风险处置，每条风险都要落到 ≥1 个附录 A 控制。
- 审计员独立性是硬约束：**没人审自己的活**，A.6 生命周期负责人不能审条款 8 运营。
- 成熟团队默认：滚动 3 年覆盖每条款 + 每适用控制；条款 4/5/9/10（始终相关）做年度全系统审；条款 6/7/8 按 AI 系统或生命周期阶段做季度/半年深审。
- 优先复用既有体系工件：27001 数据控制可喂 AIMS A.7，13485/9001 的 CAPA 与管理评审机制可被 AIMS 直接复用，避免重复建设。
- 残余风险「容忍」必须有管理层签字并经条款 9.3 管理评审留档，否则审计时即视为未处置。

## 互见

- ISO 27001 ISMS（许多控制可复用于 AIMS A.7 数据控制）
- ISO 13485 QMS（提供 AIMS 复用的 CAPA + 管理评审机制）
- GDPR DPIA 流程（个人数据系统的 AIMS A.5 影响评估输入）
- ISO 27001 内审模式（本技能的审计排程器与其同构）
- SOC 2 信任服务（可复用控制用于 AIMS A.10 第三方关系）
- 欧盟 AI 法案条款级合规（compliance-team-eu-ai-act，自愿性 42001 的强制性法规伴侣）
- 首席 AI 官顾问（高管 AI 战略：自建 vs 采购、成本经济学——不同受众）

---
采编自 alirezarezvani/claude-skills（MIT 许可）。
