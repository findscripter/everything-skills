---
name: soc2-compliance-preparer
title: SOC 2 审计准备与控制矩阵
description: 当为 SaaS/云服务准备 SOC 2 Type I/II 审计时使用；做信任服务准则（TSC）映射、控制矩阵生成、差距分析、证据收集与审计就绪评估，产出控制矩阵/差距清单/证据台账/就绪评分；不适用于 ISO 27001、GDPR 等其他合规框架的主审。触发词：SOC 2、信任服务准则、控制矩阵、审计证据、差距分析
domain: 安全/compliance
triggers: [SOC 2, SOC2 审计, 信任服务准则, Trust Service Criteria, TSC 映射, 控制矩阵, control matrix, 审计证据收集, 差距分析, gap analysis, Type I, Type II, 审计就绪, 供应商风险评估, 子服务组织, CUEC]
tags: [安全, compliance, soc2, 审计, 控制矩阵, 风险管理, 证据收集, saas]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [control_matrix_builder.py, evidence_tracker.py, gap_analyzer.py]
requires: []
related: [iso27001-isms-implementer, compliance-readiness-review, gdpr-data-handling, iso42001-aims-specialist]
combines_with: [compliance-readiness-review, iso27001-isms-implementer, security-audit-toolkit]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

当 SaaS、云基础设施或托管服务商需要向企业客户证明数据管理能力，准备 SOC 2 审计时使用。典型场景：

- 选择并映射五大信任服务准则（TSC），判定哪些类别在审计范围内。
- 生成控制矩阵，把每条准则落到具体控制、责任人、证据与测试程序。
- 做差距分析（Type I 看设计、Type II 加运行有效性）并制定整改计划。
- 收集/追踪审计证据，做审计就绪评分。
- 评估供应商/子服务组织风险，建立持续合规机制。

**不该用的边界：**
- 主审 ISO 27001、GDPR、HIPAA、PCI-DSS 等其他框架——这些另有专门技能（见互见），本技能仅在与 SOC 2 共享证据时配合。
- 替代持证审计师出具正式 SOC 2 报告——本技能服务于「被审方准备」，不是审计意见。
- 仅需要一次性安全加固、渗透测试或漏洞修复，与合规审计无关时。

**Type I vs Type II 速判：**

| 维度 | Type I | Type II |
|------|--------|---------|
| 范围 | 某时点的控制设计 | 设计 + 一段时间的运行有效性 |
| 周期 | 单一日期快照 | 观察窗口 3–12 个月（典型 6） |
| 证据 | 控制描述、策略 | 控制描述 + 运行证据（日志、工单、截图） |
| 适合 | 首次合规、急于进入市场 | 成熟组织、企业客户要求 |

典型路径：差距评估(4–8 周) → 整改(8–16 周) → Type I 审计(4–6 周) → 观察期(6–12 月) → Type II 审计(4–6 周) → 年度续审。

## 步骤

1. **确定范围**：Security（通用准则 CC1–CC9）对每份 SOC 2 报告都**必选**；Availability(A1)、Confidentiality(C1)、Processing Integrity(PI1)、Privacy(P1–P8) 四类按业务需要可选。切忌「过度纳入」——只选客户/业务真正要求的类别。
   - 有 SLA、停机直接影响业务 → 选 Availability。
   - 处理商业秘密/合同保密信息 → 选 Confidentiality。
   - 数据准确性关键（金融、医疗、分析）→ 选 Processing Integrity。
   - 处理 PII 且客户要隐私保证 → 选 Privacy（与 GDPR 互补）。

2. **生成控制矩阵**：用 `control_matrix_builder.py` 生成基线矩阵，再按真实环境定制。控制命名约定：`SEC-`(Security)、`AVL-`(Availability)、`CON-`(Confidentiality)、`PRI-`(Processing Integrity)、`PRV-`(Privacy)。每条控制至少含：Control ID、TSC 映射、描述、类型（预防/检测/纠正）、责任人、频率、证据类型、测试程序。校验覆盖——每条所选准则至少对应一条控制。

3. **差距分析**（用 `gap_analyzer.py`）：
   - 现状梳理：盘点现有策略/流程/技术控制，映射到 TSC，采样证据，访谈控制责任人。
   - 识别四类差距：缺失控制 / 部分实现（缺证据或不一致）/ 设计差距 / 运行差距（仅 Type II）。
   - 整改计划：为每个差距记录 Gap ID、受影响准则、描述、整改动作、责任人、优先级、目标日期、依赖项。

4. **按优先级排期整改**：Critical 2–4 周、High 4–8 周、Medium 8–12 周、Low 12–16 周。

5. **收集与追踪证据**（用 `evidence_tracker.py`），尽量自动化（见指令），逐步从「时点取证」转向「持续合规」。

6. **审计就绪评分**：对照清单打分，90–100% 可直接审计；75–89% 先补小差距；50–74% 需整改；<50% 需重建合规体系。

## 指令

工具脚本（保留源命令）：

```bash
# 生成控制矩阵（markdown / json / csv）
python scripts/control_matrix_builder.py --categories security --format md
python scripts/control_matrix_builder.py --categories security,availability,confidentiality --format json
python scripts/control_matrix_builder.py --categories security,availability,confidentiality,processing-integrity,privacy --format csv

# 追踪每条控制的证据状态
python scripts/evidence_tracker.py --matrix controls.json --status
python scripts/evidence_tracker.py --matrix controls.json --status --json

# 差距分析（Type I 仅设计；Type II 含运行有效性）
python scripts/gap_analyzer.py --controls current_controls.json --type type1
python scripts/gap_analyzer.py --controls current_controls.json --type type2 --json
```

证据自动化方向（从手工取证转向持续合规）：
- 访问复核：IAM 与工单系统集成，季度复核自动触发。
- 配置证据：IaC 快照、compliance-as-code 工具。
- 漏洞扫描：定时扫描 + 自动生成报告。
- 变更管理：基于 Git 的审计轨迹（commit、PR、审批）。
- 备份验证：自动恢复测试并记录成功/失败。

持续合规四件套：自动取证脚本 → 控制状态看板 → 漂移告警 → 集中、带时间戳、审计师可访问的证据库。

## 示例

为一家向企业销售、有 SLA、处理客户 PII 的 SaaS 准备首次 SOC 2：

1. 范围：选 Security(必选) + Availability(有 SLA) + Privacy(处理 PII)，暂不纳入 Confidentiality/Processing Integrity，避免过度扩范围。先做 **Type I** 验证控制设计。
2. 生成矩阵：`python scripts/control_matrix_builder.py --categories security,availability,privacy --format json` 得到 controls.json，再补真实责任人与证据要求。
3. 差距分析：`python scripts/gap_analyzer.py --controls controls.json --type type1`，发现「访问复核无提醒、变更缺审批记录」两项关键差距，列入整改（Critical/High）。
4. 证据追踪：`python scripts/evidence_tracker.py --matrix controls.json --status` 找出尚缺证据的控制，对访问复核接入工单自动触发。
5. 审计前 4–6 周对照清单评分，达 90%+ 后约审，并对 AWS 等子服务组织采用 carve-out 法、补充 CUEC。

## 注意事项

- **Security 必选**，其余四类按需选择；范围越窄越易通过，切勿默认全选五类。
- **先 Type I 再 Type II**：跳过 Type I 直接做 Type II，常因控制设计未验证而失败。
- **避免「安全剧场」**：控制不能只停在纸面。Type II 审的是运行有效性，需把控制嵌进日常工作流并留痕。
- **不要复制粘贴通用策略**：策略须贴合真实环境与技术栈，否则审计会标记不符。
- **供应商/子服务组织风险必查**：维护供应商台账并分级（Critical 年审+持续监控且要 SOC 2 Type II/渗透测试；High 年审;Medium 年度问卷;Low 两年问卷）。依赖 AWS/GCP/Azure 时多用 carve-out 法并补充用户实体补充控制（CUEC）。
- **合规不是一次性项目**：报告签发后控制会退化。把持续监控、漂移告警、年度再评估（Q1 风险评估/策略刷新、Q2 内部测试整改、Q3 就绪复核、Q4 外审）固化为流程。
- **常见审计发现与预防**：访问复核不全→自动化季度触发；变更缺审批→定义紧急变更的事后审批程序；漏洞扫描过期→每周自动扫描+告警；策略未签收→年度电子签流程；缺供应商评估→维护供应商台账与复核排期。

## 互见

- **gdpr-dsgvo-expert**：SOC 2 Privacy 准则与 GDPR 高度重叠，处理欧盟个人数据时配合使用。
- **information-security-manager-iso27001**：ISO 27001 附录 A 控制与 SOC 2 Security 准则密切对应，双框架可共享证据。
- **isms-audit-expert**：审计方法论与发现项管理可直接迁移到 SOC 2 审计准备。

---
*采编自 alirezarezvani/claude-skills（MIT License）。*
