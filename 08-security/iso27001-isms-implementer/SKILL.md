---
name: iso27001-isms-implementer
title: ISO 27001 信息安全体系实施
description: 当需要落地或认证 ISO 27001:2022 ISMS、做安全风险评估、控制项落地、SoA、内审与事件响应（侧重 HealthTech/MedTech）时使用；产出风险登记册、SoA、差距分析与事件响应记录；不适用于纯渗透测试/代码安全审计或非信息安全的质量管理。触发词：ISO 27001、ISMS、安全风险评估、SoA、事件响应
domain: 安全/compliance
triggers: [实施 ISO 27001, ISMS 体系建设, 安全风险评估, 信息安全策略, ISO 27001 认证, 安全控制项落地, 事件响应计划, 医疗数据安全, 医疗器械网络安全, 合规差距分析 / SoA]
tags: [安全, compliance, iso27001, isms, 风险评估, 事件响应, healthtech, medtech]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [risk_assessment.py, compliance_checker.py]
requires: []
related: [iso42001-aims-specialist, soc2-compliance-preparer, compliance-readiness-review, iso13485-qms-implementer]
combines_with: [compliance-readiness-review, soc2-compliance-preparer, security-incident-response]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

当你需要按 ISO 27001:2022 / ISO 27002 建立并运行信息安全管理体系（ISMS），尤其面向 HealthTech / MedTech 的患者数据、EHR、医疗器械场景时使用。典型场景：

- 定义 ISMS 范围与适用性声明（SoA），做风险评估并生成风险登记册。
- 选择并落地控制项、做合规差距分析、准备内审与一/二阶段认证审核。
- 建立安全事件响应流程（检测、分级、遏制、复盘）。

不该用的边界：
- 纯技术渗透测试、漏洞利用、代码级安全审计 —— 本技能只做风险映射，不替代专门的扫描/红队工具。
- 非信息安全的质量管理体系（如 ISO 9001、ISO 13485 流程）。
- HIPAA/GDPR 等具体法律条文逐条解读 —— 仅作为映射参考，需结合法务。

## 步骤

### A. ISMS 落地（主流程）

1. 定义范围与背景：识别相关方与要求、划定 ISMS 边界、记录内外部议题。验收点：范围声明经管理层评审签署。
2. 风险评估（ISO 27001 6.1.2 方法）：识别信息资产 → 评估威胁与脆弱性 → 计算风险等级 → 确定处置方案。验收点：风险登记册覆盖全部关键资产且各自有责任人。
3. 选择并实施控制：把风险映射到 ISO 27002 控制项（组织 / 人员 / 物理 / 技术四类），输出差距清单并整改。验收点：SoA 记录所有控制项及取舍理由。
4. 建立监控：定义安全度量（事件数与严重度趋势、控制有效性、培训完成率、审计发现关闭率）。验收点：仪表盘呈现实时合规状态。

### B. 风险评估（细化）

1. 资产识别：建立资产清单并分级（信息 / 软件 / 硬件 / 服务 / 人员）。验收点：每项资产有责任人与分级。
2. 威胁分析：逐资产类别列威胁与可能性，覆盖行业 Top-10 威胁。
3. 脆弱性评估：区分技术（未打补丁、弱配置）、流程（缺失程序）、人员（缺培训、内部威胁），扫描结果映射到风险登记册。
4. 风险评价与处置：按下表分级，所有高/严重风险须有经批准的处置计划。

风险计算：`Risk = Likelihood × Impact`

| 等级 | 分值 | 处置 |
|------|------|------|
| 严重 Critical | 20-25 | 立即行动 |
| 高 High | 15-19 | 30 天内出处置计划 |
| 中 Medium | 10-14 | 90 天内出处置计划 |
| 低 Low | 5-9 | 接受或监控 |
| 极低 Minimal | 1-4 | 接受 |

### C. 事件响应

1. 检测与上报：分类（安全入侵 / 恶意软件 / 数据泄露 / 系统失陷 / 违规）。验收点：检测后 15 分钟内登记。
2. 分诊与定级：严重→立即，高→1 小时，中→4 小时，低→24 小时；按需触发升级。
3. 遏制与根除：隔离受影响系统 → 保全证据 → 阻断威胁路径 → 清除恶意构件。验收点：确认遏制、无持续失陷。
4. 恢复与复盘：从干净备份恢复 → 重连前校验完整性 → 记录时间线 → 事后评审 → 更新控制与程序。验收点：5 个工作日内完成事后报告。

## 指令

风险评估（遵循 ISO 27001 6.1.2）：
```bash
# 全量评估
python scripts/risk_assessment.py --scope "cloud-infrastructure" --output risks.json
# 医疗专用模板
python scripts/risk_assessment.py --scope "ehr-system" --template healthcare --output risks.json
# 基于资产清单的快速评估
python scripts/risk_assessment.py --assets assets.csv --output risks.json
```
参数：`--scope`（必填，评估范围）、`--template`（general/healthcare/cloud）、`--assets`（资产 CSV）、`--output`、`--format`（json/csv/markdown）。输出含资产分级、威胁/脆弱性映射、风险分（可能性×影响）、处置建议、残余风险。

合规检查与差距分析：
```bash
# 检查全部 ISO 27001 控制项
python scripts/compliance_checker.py --standard iso27001
# 差距分析含整改建议
python scripts/compliance_checker.py --standard iso27001 --gap-analysis --output gaps.md
# 检查指定控制域
python scripts/compliance_checker.py --standard iso27001 --domains "access-control,cryptography"
```
参数：`--standard`（必填，iso27001/iso27002/hipaa）、`--controls-file`（现状 CSV）、`--gap-analysis`、`--domains`、`--output`。

周期性巡检：
```bash
# 月度合规检查
python scripts/compliance_checker.py --standard iso27001 --output monthly_$(date +%Y%m).md
# 季度差距分析
python scripts/compliance_checker.py --standard iso27001 --gap-analysis --output quarterly_gaps.md
```

参考文档（references/）：`iso27001-controls.md`（SoA 控制项选择、实施指引、证据要求、审核准备）、`risk-assessment-guide.md`（方法选择、资产分级、威胁建模、风险计算）、`incident-response.md`（响应程序、升级矩阵、沟通模板、恢复清单）。

## 示例

患者数据管理系统安全风险评估：

第一步，定义资产：
```bash
python scripts/risk_assessment.py --scope "patient-data-system" --template healthcare
```
资产清单（节选）：A001 患者数据库（信息/机密）、A002 EHR 应用（软件/关键）、A003 数据库服务器（硬件/高）、A004 管理员凭据（访问/关键）。

第二步，识别风险（风险登记册节选，L=可能性 I=影响）：

| Risk ID | 资产 | 威胁 | 脆弱性 | L | I | Score |
|---------|------|------|--------|---|---|-------|
| R001 | A001 | 数据泄露 | 加密弱 | 3 | 5 | 15 |
| R002 | A002 | SQL 注入 | 输入校验缺失 | 4 | 4 | 16 |
| R003 | A004 | 凭据窃取 | 无 MFA | 4 | 5 | 20 |

第三步，确定处置：R001 启用 AES-256 加密（30 天）；R002 加输入校验 + WAF（14 天）；R003 全部管理员强制 MFA（7 天）。

第四步，验证落地：
```bash
python scripts/compliance_checker.py --controls-file implemented_controls.csv
```
预期输出：加密 A.8.24 已实施（静态 AES-256 / 传输 TLS 1.3）；访问控制 A.8.5 已实施（MFA 启用、管理员 100% 覆盖）；应用安全 A.8.26 部分实施（输入校验已做、WAF 待部署）；整体合规度 87%。

## 注意事项

- 认证就绪检查清单（一阶段审核前）：ISMS 范围已批准、信息安全策略已发布、风险评估已完成、SoA 已定稿、内审已完成、管理评审已完成、不符合项已处理。
- 二阶段审核前：控制项已实施且运行、有效性证据可取、员工已培训并知晓、事件已登记并管理、度量数据已累计 3 个月以上。
- SoA 必须为每个控制项写明纳入/排除理由，这是审核的核心证据。
- 风险登记册的每条风险都要有责任人和时间线，高/严重风险无处置计划即视为不达标。
- 医疗场景须把患者数据按机密级处理，并将 ISO 控制项与 HIPAA/医疗器械网络安全要求交叉映射，必要时引入法务。
- 度量需持续采集（事件趋势、控制有效性、培训完成率、审计发现关闭率），仅一次性快照无法满足认证对"持续运行"的要求。

## 互见

- 各 lark-* 技能：可用 lark-doc / lark-base 沉淀风险登记册与 SoA，用 lark-task 跟踪整改时间线，用 lark-im / lark-mail 做事件升级通知。
- security-review：针对代码变更做安全审查，可作为技术层脆弱性输入，补充本体系流程的代码维度。

---
采编自 alirezarezvani/claude-skills（MIT 许可）。
