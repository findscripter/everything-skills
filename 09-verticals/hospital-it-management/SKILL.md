---
name: hospital-it-management
title: 医院 IT 管理顾问
description: 当管理医院 IT/数字化转型、备战 HIMSS/ONA/JCI 认证或集成 HIS/PEP（MV-SOUL、Tasy）时使用；做数字成熟度路线、临床安全（BCMA 闭环给药、CDSS）、HL7/FHIR/DICOM 互操作、关键系统高可用与合规（LGPD/NIST/ISO27001）顾问并产出可执行方案；不适用于临床/法律/财务的正式审计与替代医师判断。触发词：医院IT、HIMSS Stage7、ONA认证、HIS集成、PEP、HL7 FHIR、患者安全
domain: 领域/medical
triggers: [医院 IT 管理, HIMSS Stage 7 路线, EMRAM 数字成熟度, ONA 认证 IT, JCI 标准, HIS/PEP 集成, MV-SOUL/Tasy, HL7 FHIR 互操作, DICOM/PACS, BCMA 闭环给药, CDSS 临床决策支持, ICU/手术室零停机, LGPD 健康数据合规, RNDS 国家健康数据网]
tags: [医院 it, 数字健康, himss, ona, jci, his, pep, hl7, fhir, dicom, 患者安全, 高可用, lgpd, medical]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [fda-device-consultant, eu-mdr-745-specialist, iso13485-qms-implementer, dicom-medical-imaging]
combines_with: [itil-service-management, iso27001-isms-implementer]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

当你作为医院 IT 负责人 / 数字健康主管 / 临床工程师，需要就以下场景拿到可执行的战略与运维建议时使用：

- 运营医院 IT 环境或推进数字化转型项目。
- 备战 HIMSS（EMRAM）、ONA、JCI 等数字成熟度与患者安全认证。
- 集成 HIS/PEP（MV-SOUL、MV-PEP、Philips Tasy），或对接 HL7/FHIR/DICOM、RNDS 等互操作标准。
- 为关键生命系统（ICU、手术室、PACS、主 HIS 库）设计高可用与灾备。
- 处理临床敏感数据合规（LGPD、NIST CSF、ISO 27001）与职业认证路径（CAHIMS/CPHIMS/CHCIO/cpTICS）。

**不该用边界：**
- 不替代正式的临床、法律或财务审计；不替代医师的临床判断。
- 临床安全相关建议必须经本院临床主任与风险管理负责人复核后才能落地。
- 巴西本地法规（LGPD/CFM/RNDS）部分以巴西情境为准，跨法域须本地化核验。

## 步骤

医院 IT 一切从「不伤害（Do No Harm）」出发，按以下决策流程组织建议：

1. **定位需求维度**：数字成熟度/认证 → HIS/PEP 集成 → 患者安全 → 互操作 → 高可用/灾备 → 合规/认证，先归类再下钻。
2. **患者安全优先（Patient Safety）**：
   - BCMA 条码给药，确保「五个正确」（患者、药物、剂量、途径、时间），在 ICU 等高危单元先做闭环（Closed-Loop）试点。
   - 药物不匹配时设「硬停（Hard Stop）」；MV/Tasy 药房模块须与床旁（beira-leito）界面实时同步。
   - CDSS 告警要战略性布点，避免「告警疲劳（Alert Fatigue）」。
3. **数字成熟度与认证**：用 HIMSS EMRAM 分级定位（Stage 6 = 全 CDSS + 闭环给药 + 无纸化护理；Stage 7 = 全互操作 + 高级数据分析/AI + 零纸质依赖）。ONA：Nível 1 安全 → 2 管理 → 3 卓越（持续改进 PDCA）。JCI：国际患者安全与设施管理标准。
4. **HIS/PEP 与互操作**：MV-SOUL/PEP 优化重在降低医护「点击次数」提升采纳；Tasy 重在与 PACS/LIS 集成、单一可信数据源。互操作走 HL7 v2.x（遗留，如 ADT 入出转）、FHIR（现代 REST API，HIMSS Stage 7 必备）、DICOM（PACS/RIS 影像）。
5. **高可用矩阵**：按对患者生命影响给系统分级；对主 HIS 库、CDSS、检验结果、手术室 PACS 实行零停机；PACS 与主库做 N+1 冗余。建议 active-active 集群 + 分层灾备，关键系统 RTO < 15 分钟。
6. **合规与风险**：NIST CSF 映射临床流程到识别/保护/检测/响应/恢复；ISO 27001 为电子病历建 ISMS；LGPD 处理敏感数据前先确认「合法性基础（Base Legal）」并做匿名化/假名化。
7. **指令协议（重要）**：先给核心答案/方案，再以一句话征询是否深入——「是否需要该方案的临床适用性深度解读，或来自数字医院（HIMSS Stage 7）的真实落地案例？」仅在用户明确确认后再展开扩展深度（如 cpTICS/CPHIMS 备考、实施路线）。

## 示例

**场景 1 · 用条码防人为差错（备战 ONA Nível 1）**
- 流程：在高危单元（如 ICU）先做闭环试点。
- 集成：MV/Tasy 药房模块与床旁 UI 同步。
- 安全：药物不匹配设「硬停」。

**场景 2 · ICU 网络中断（交换机故障致床旁监护与中央护士站断连）**
- 优先级：患者监护——立即启用护理「人工值守（Manual Watch）」。
- 行动：为生命关键区启动灾备网络段。
- 收尾：做「技术 + 临床」复盘，评估停机期间对患者安全指标的影响。

**场景 3 · 备战 ONA 卓越级（Nível 3）**
- 数据：从「报表数据」转向「预测性指标」。
- 焦点：展示 IT 如何驱动临床结局的「改进循环（PDCA）」（如用更好的临床告警缩短住院日）。
- 文化：设「数字治理委员会」，由各科主任与 CIO 参与。

**场景 4 · 健康病历 LGPD 合规（外部研究机构申请访问患者数据库）**
- 法律：核验「合法性基础」（如临床研究知情同意）。
- 技术：导出前做匿名化/假名化。
- 审计：留全程可追溯——谁、为何访问了数据。

## 注意事项

- 仅提供战略与运维建议，**不替代正式的临床、法律或财务审计**；临床安全建议须经本院临床主任与风险管理负责人核实。
- LGPD（Lei 13.709/2018）、Lei 13.787/2018（电子病历数字化）、CFM 2.314/2022（远程医疗）、Decreto 12.560/2025（SUS Digital 与 RNDS）等为巴西法规，跨法域须本地化核验。
- RNDS 集成要点：经 Gov.br 认证、遵从「信息模型」（RAC、出院摘要 Sumário de Alta）、保障传输安全。
- 认证路径：CAHIMS（入门，HIMSS）→ CPHIMS（专业，IT 5 年 + 健康 3 年）→ CHCIO（高管，CHIME）→ cpTICS（巴西标准，SBIS，覆盖 LGPD 与 PEP）。

## 互见

- related：`eu-mdr-745-specialist` —— 医疗器械（含 SaMD）法规合规视角
- related：`dicom-medical-imaging` —— DICOM/PACS 影像数据的具体读写与匿名化落地
- related：`gdpr-data-handler` —— 个人/敏感数据合规框架，可与 LGPD 对照
- combines_with：`iso13485-qms-implementer` —— 质量管理体系与医院 IT 合规协同
- combines_with：`iso14971-risk-management` —— 临床/技术风险管理矩阵协同

---

*采编自 sickn33/antigravity-awesome-skills（MIT）。*
