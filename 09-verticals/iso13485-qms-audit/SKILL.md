---
name: iso13485-qms-audit
title: ISO 13485 质量体系内审
description: 当需要为医疗器械质量管理体系（QMS）规划/执行 ISO 13485 内部审核、判定不符合项严重度、跟踪 CAPA 闭环或准备认证机构外审时使用；做基于风险的年度审核排程、按条款逐项取证、Major/Minor/Observation 分级与发现报告产出；不适用于通用质量管理、非医疗器械合规或具体 CAPA 根因技术分析。触发词：ISO 13485 audit、内部审核、internal audit、QMS 内审、审核计划、不符合项分级、nonconformity、CAPA 验证、审核检查表、external audit prep、外审准备
domain: 领域/medical
triggers: [ISO 13485 audit, 内部审核, internal audit, QMS 内审, 审核计划, audit planning, 不符合项分级, nonconformity classification, CAPA 验证, 审核检查表, audit checklist, 审核发现, external audit prep, 外审准备, 审核排程]
tags: [iso13485, qms, internal-audit, medical-device, nonconformity, capa, compliance]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, audit_schedule_optimizer.py, JSON]
requires: []
related: [iso13485-qms-implementer, fda-qsr-audit-prep, capa-root-cause-officer, iso14971-risk-management]
combines_with: [capa-root-cause-officer, quality-documentation-control, iso13485-qms-implementer]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
医疗器械质量管理体系（QMS）的 ISO 13485:2016 内部审核方法论：覆盖基于风险的审核排程、按条款取证执行、不符合项分级与 CAPA 闭环、认证/法规外审准备。

## 何时使用

- 需要制定年度风险化内审计划，确保一个审核周期内覆盖全部 ISO 13485 条款。
- 现场执行内审，需要按条款取证、撰写发现并分级（Major/Minor/Observation）。
- 判定不符合项严重度、触发并跟踪 CAPA 至有效闭环。
- 准备认证机构（CB）或监管方外审，需要做就绪性核查与模拟审核。

**不该用边界：** 不覆盖通用 ISO 9001/非医疗器械质量管理；不替代具体 CAPA 的根因技术分析（5-Why/鱼骨图的实操在 CAPA 流程中展开）；不涉及法规注册申报本身。

## 步骤

**A. 审核计划（基于风险）**
1. 列出所有需审核的 QMS 过程，逐一赋风险等级（高/中/低）。
2. 回顾历史发现与趋势，按风险定频次（高=季度、中=半年、低=年度）。
3. 指派合格审核员并核验独立性，生成年度排程并通报过程负责人。
4. 验收：周期内 ISO 13485 全部条款被覆盖。

**B. 审核执行**
1. 编制审核方案（范围/准则/日程），审前预审文件，召开首次会议。
2. 通过文件审阅、访谈、现场观察、记录追溯四类方法取证。
3. 分级发现，召开末次会议通报初步结论，5 个工作日内出报告。
4. 验收：范围项全覆盖，每条发现均有客观证据支撑。

**C. 不符合项管理**
1. 对照分级准则评定严重度，用客观证据记录发现。
2. 对 Major/Minor 启动 CAPA，跟踪至闭环并在跟进时验证有效性。
3. 验收：仅当 CAPA 有效后方可关闭发现。

**D. 外审准备**
1. 完成全部内审、确认发现已用有效 CAPA 闭环。
2. 以审核作为输入开管理评审，组织全范围模拟审核。
3. 验收：模拟审核发现在外审前已整改。

## 指令

按风险定审核频次：

| 风险 | 频次 | 典型过程 |
|------|------|---------|
| 高 | 季度 | 设计控制、CAPA、生产验证 |
| 中 | 半年 | 采购、培训、文件控制 |
| 低 | 年度 | 基础设施、管理评审（稳定时） |

关键条款审核重点：4.2 文件控制 / 5.6 管理评审 / 6.2 培训 / 7.3 设计控制 / 7.4 采购 / 7.5 生产 / 7.6 校准 / 8.2.2 内审 / 8.3 不合格品 / 8.5 CAPA。

审核员独立性核验（指派前逐项确认）：
- 审核员不负责被审区域；
- 与受审方无直接汇报关系；
- 未参与受审范围内的近期活动；
- 具备该范围的书面资质。

不符合项分级准则：

| 类别 | 定义 | CAPA | 时限 |
|------|------|------|------|
| Major | 体系性失效或要素缺失 | 必须 | 30 天 |
| Minor | 孤立疏漏或部分实施 | 建议 | 60 天 |
| Observation | 改进机会 | 可选 | 适时 |

分级决策树：
```
要求的要素是否缺失/失效？
├─ 是 → 是否体系性（多实例）？ → MAJOR
│        └─ 否 → 是否影响产品安全？ → MAJOR
│                 └─ 否 → MINOR
└─ 否 → 是否偏离程序？
         ├─ 是 → 是否再发？ → MAJOR
         │        └─ 否 → MINOR
         └─ 否 → 是否为改进机会？ → OBSERVATION
```

审核排程优化脚本：
```bash
# 生成优化排程
python scripts/audit_schedule_optimizer.py --processes processes.json
# 交互模式
python scripts/audit_schedule_optimizer.py --interactive
# JSON 输出供集成
python scripts/audit_schedule_optimizer.py --processes processes.json --output json
```
脚本依据过程风险、历史发现数、距上次审核天数、关键度评分，输出优先级排程、季度分布与逾期告警。

输入样例：
```json
{
  "processes": [
    {"name": "Design Control", "iso_clause": "7.3", "risk_level": "HIGH", "last_audit_date": "2024-06-15", "previous_findings": 2},
    {"name": "Document Control", "iso_clause": "4.2", "risk_level": "MEDIUM", "last_audit_date": "2024-09-01", "previous_findings": 0}
  ]
}
```

## 示例

每条发现按「要求—证据—差距」三段式记录：
```
要求：ISO 13485:2016 第 7.6 条要求按规定间隔进行校准。
证据：pH 计（EQ-042）校准记录显示上次校准为 2024-01-15，
      校准间隔 12 个月，当前日期 2025-03-20。
差距：设备校准已逾期 2 个月，反映校准计划执行存在缺口。
```

按条款提问示例：
- 文件控制（4.2）：出示文件总清单；如何控制作废文件；出示文件变更批准证据。
- 设计控制（7.3）：出示该产品的设计历史文档（DHF）；谁参加设计评审；出示设计输入到输出的可追溯性。
- CAPA（8.5）：出示含未关闭项的 CAPA 台账；如何确定根因；出示有效性验证记录。

## 注意事项

- 审核员独立性是硬性前提，未通过独立性核验不得指派。
- 发现必须有客观证据，分级依据「体系性 + 安全影响」两条主线，避免主观降级。
- CAPA 深度随严重度变化：Major 需完整根因分析（5-Why/鱼骨图）并在下次审核或 6 个月内验证；Minor 识别即时原因、下次例审验证；Observation 无需 CAPA、下次审核记录即可。
- 发现仅在 CAPA 经验证有效后关闭，禁止以"已采取措施"代替"已验证有效"。
- 报告须在末次会议后 5 个工作日内完成。
- 程序中文件 7.6 校准日期为源文示例，实际审核以现场记录为准。

## 互见

- fact-checking：对照法规条款与现场证据核验发现陈述的准确性。
- first-principles-thinking：在 CAPA 根因分析中拆解体系性失效的本质原因。
- csv-data-cleaner：清洗历史审核发现/CAPA 台账数据以供趋势分析。

---
本条采编自 alirezarezvani/claude-skills（MIT）。
