---
name: fda-device-consultant
title: FDA 医疗器械注册路径顾问
description: 当为医疗器械产品规划美国 FDA 上市路径、准备 510(k)/PMA/De Novo 申报、做 QSR(21 CFR 820) 质量体系、HIPAA 合规或器械网络安全评估时使用；产出路径决策建议、申报章节清单、设计控制/CAPA 与合规检查方案；不适用于非美国（如 NMPA/CE/MDR）法规、临床方案设计或具体法律意见。触发词：FDA、510(k)、PMA、De Novo、premarket、predicate device、substantial equivalence、QSR、21 CFR 820、设计控制、CAPA、HIPAA、医疗器械网络安全、SBOM、上市前申报、谓词器械、实质等同
domain: 领域/medical
triggers: [FDA, 510(k), PMA, De Novo, premarket, predicate device, substantial equivalence, QSR, 21 CFR 820, 设计控制, CAPA, HIPAA, 医疗器械网络安全, SBOM, 上市前申报, 谓词器械, 实质等同]
tags: [fda, medical-device, regulatory, 510k, pma, de-novo, qsr, 21-cfr-820, hipaa, cybersecurity, compliance, capa, sbom]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Python, eSTAR, FDA 510(k) Database, CycloneDX/SPDX (SBOM), STRIDE]
requires: []
related: [eu-mdr-745-specialist, fda-qsr-audit-prep, iso13485-qms-implementer, iso14971-risk-management]
combines_with: [iso14971-risk-management, fda-qsr-audit-prep, iso13485-qms-implementer]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
面向 AI Agent 的 FDA 医疗器械法规顾问，覆盖上市路径选择、510(k) 申报流程、QSR（21 CFR 820）质量体系、HIPAA 合规与器械网络安全。

## 何时使用

适用场景：

- 为某器械判断走哪条 FDA 路径（510(k) / De Novo / PMA），评估实质等同（SE）可行性。
- 准备 510(k) 申报包，梳理 21 CFR 807.87 要求章节，规避 RTA（拒绝受理）问题。
- 搭建或自查 QSR 设计控制（820.30）、CAPA（820.100）等子系统。
- 评估联网器械的 HIPAA 适用性与安全保障措施，或编制器械网络安全（威胁建模、SBOM、漏洞披露）材料。

不该用边界：

- 非美国法规（中国 NMPA、欧盟 CE/MDR、IVDR）——本条只覆盖 FDA。
- 临床试验方案设计、生物统计、动物实验细节。
- 正式法律意见或合同条款——输出为合规工程建议，需由 RA/QA 与法务复核。

## 步骤

1. 路径选择：先定产品代码与分类，再按下方决策框架判断。有谓词器械且实质等同走 510(k)；新颖低-中风险走 De Novo；III 类高风险无谓词走 PMA。
2. 谓词检索：在 FDA 510(k) 数据库按产品代码检索谓词，确认 K 号，逐项比对预期用途（intended use）与技术特征。
3. 申报准备：完成性能测试（台架、生物相容性、电气安全）、器械描述、SE 比对、标签，按 807.87 章节装配。
4. 提交与审评：经 eSTAR 提交，跟踪受理确认，及时回应 AI（Additional Information）问询，直至取得 SE 决定函。
5. QSR 落地：按 820.30 走"输入→输出→评审→验证→确认→转移"，每步留可追溯的签字记录；不符合项进入 CAPA 闭环。
6. HIPAA / 网络安全：若器械创建/存储/传输 PHI，做 ePHI 资产盘点与风险评估并落实管理/物理/技术保障；联网器械按 Tier 分级，准备威胁模型、SBOM 与漏洞披露流程。

## 指令

路径决策框架（核心约束，勿改判定逻辑）：

```
存在谓词器械？
├── 是 → 实质等同？
│   ├── 是 → 510(k)
│   │   ├── 无设计变更 → Abbreviated 510(k)
│   │   ├── 仅制造变更 → Special 510(k)
│   │   └── 设计/性能变更 → Traditional 510(k)
│   └── 否 → PMA 或 De Novo
└── 否 → 新颖器械？
    ├── 低-中风险 → De Novo
    └── 高风险（III 类） → PMA
```

路径对比（时限/官费，作参考，以当年 FDA 收费表为准）：

| 路径 | 适用 | 时限 | 官费 |
|------|------|------|------|
| 510(k) Traditional | 有谓词、设计变更 | 90 天 | ~$21,760 |
| 510(k) Special | 仅制造变更 | 30 天 | ~$21,760 |
| 510(k) Abbreviated | 符合指南/标准 | 30 天 | ~$21,760 |
| De Novo | 新颖、低-中风险 | 150 天 | ~$134,676 |
| PMA | III 类、无谓词 | 180+ 天 | ~$425,000+ |

510(k) 必备章节（21 CFR 807.87）：Cover Letter、Form 3514（CDRH 上市前审查封面）、器械描述、Indications for Use（Form 3881）、SE 并排比对、性能测试、软件文档（IEC 62304 关注度与危害分析）、标签、510(k) Summary。

CAPA 流程（820.100）：识别 → 调查（5 Whys / 鱼骨图根因分析）→ 计划 → 实施 → 验证 → 有效性确认（监测复发 30-90 天）→ 管理评审关闭。

器械网络安全分级：Tier 1（高风险）= 联网且安全事件可致患者伤害；Tier 2 = 其他联网器械。上市前需威胁模型（STRIDE/攻击树/信任边界）、安全控制、SBOM（CycloneDX 或 SPDX）、安全测试、漏洞管理计划。

辅助脚本（位于源技能 scripts/，按需调用）：

```bash
# 跟踪 FDA 申报里程碑
python scripts/fda_submission_tracker.py /path/to/project --type 510k
# 评估 QSR 合规（指定子系统）
python scripts/qsr_compliance_checker.py /path/to/project --section 820.30
# HIPAA 风险评估
python scripts/hipaa_risk_assessment.py /path/to/project --category technical
```

## 示例

输入：一款联网血糖监测仪，市面已有同类产品，仅做了软件算法改进。

输出建议：

1. 存在谓词且预期用途一致 → 走 510(k)；因含设计/性能变更，选 Traditional 510(k)（约 90 天）。
2. 在 510(k) 数据库锁定谓词 K 号，做 SE 并排比对，重点覆盖软件算法这一技术特征差异。
3. 软件按 IEC 62304 出关注度与危害分析；联网传输 PHI → HIPAA 适用，技术保障落实唯一 ID、审计日志、TLS 1.2+ 传输加密。
4. 网络安全归 Tier 1，准备 STRIDE 威胁模型与 SBOM（CycloneDX），附漏洞披露流程。
5. 经 eSTAR 提交前核对官费已缴、Form 3514 字段与签名完整，避免常见 RTA 问题。

## 注意事项

- 官费与审评时限会逐年调整，引用前务必核对当年 FDA 用户费用表，不要把表中数字当作承诺。
- 提交前先排查常见 RTA 问题：漏缴用户费、Form 3514 不全、谓词 K 号未确认、SE 比对未覆盖全部技术特征。
- QSR 强调"可追溯 + 签字记录"：设计输出须可追溯到输入，评审/验证/确认均留签字记录，否则审计易出不符合项。
- HIPAA 适用性取决于是否处理 PHI：独立诊断且不传数据通常不适用；联网传患者数据、EHR 集成、存 PHI 的 SaMD 则适用。
- 所有输出为合规工程建议，最终需 RA/QA 与法务复核，不构成法律意见。

## 互见

- fact-checking：核实谓词器械 K 号、官费时限、法规条款引用的准确性。
- pdf-form-filler：填写 FDA 表单（Form 3514 / 3881 等）。
- first-principles-thinking：CAPA 根因分析与威胁建模时的结构化推演。

---

本条采编自 alirezarezvani/claude-skills（MIT）。
