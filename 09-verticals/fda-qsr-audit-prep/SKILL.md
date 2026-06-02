---
name: fda-qsr-audit-prep
title: FDA QSR（21 CFR 820）审计准备
description: 当为美国市场医疗器械做内部 QSR 审计、FDA 现场检查准备或 Form 483 整改时使用；用六问逼检法核查投诉/MDR、过程验证、DHR、CAPA、标签、483 闭环，产出检查就绪度判定与 Top3 行动清单；不适用于 ISO 13485 单独审计或非美国市场。触发词：FDA、QSR、21 CFR 820、Form 483、MDR
domain: 领域/medical
triggers: [FDA QSR 审计, 21 CFR 820, Form 483 整改, FDA 现场检查准备, MDR 上报, QMSR 合规, 510(k) PMA 提交前合规, DHR 抽样, CAPA 有效性验证, 医疗器械召回决策]
tags: [医疗器械, FDA, QSR, 21CFR820, QMSR, 合规审计, Form483, MDR, ISO13485, 监管事务]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Bash, Read]
requires: []
related: [iso13485-qms-audit, fda-device-consultant, capa-root-cause-officer, quality-documentation-control]
combines_with: [capa-root-cause-officer, quality-documentation-control, iso13485-qms-audit]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

当面对美国市场医疗器械的 QSR 质量体系合规决策、需要在真实 FDA 检查官视角下「压力测试」证据链时使用。典型触发：

- 年度内部 QSR 审计前
- 任何在美国商业流通器械的 FDA 现场检查就绪评审前
- 收到 Form 483 观察项之后
- 收到 Warning Letter（警告信）之后
- 发生 MDR 可上报事件之后
- 召回决策前（区分自愿召回 vs FDA 发起召回）
- 提交 510(k) / PMA 前（QSR 态势影响审批时间线）

背景：2026 年 2 月起 QSR 已升级为 QMSR，与 ISO 13485 实质性协调（substantially harmonized），但仍保留 FDA 特有叠加要求（标签、投诉处理、MDR、召回）。

**不该用的边界：**
- 仅做 ISO 13485 单独审计（应转 iso13485-audit-prep；本技能侧重 FDA 特有叠加面）。
- 非美国市场器械、无美国商业流通（无 21 CFR 管辖触发）。
- 临床试验设计、器械工程设计本身的技术评审（非质量体系范畴）。
- 需要法律意见的事项（警告信回复、召回决策、510(k)/PMA 策略争议）须转外部法律顾问，本技能只标记而不替代。

## 步骤

围绕「六个逼检问题」逐项取证，每问对应一条 FDA 高频引用条款：

1. **投诉与 MDR**（21 CFR 820.198 + 21 CFR 803，FDA 最高频引用区）：调取上季度投诉档案及对应 MDR 报告。核查投诉日志完整（谁/什么/何时/器械/批号）、调查在合理时限内关闭、MDR 判定树已应用（死亡 或 严重伤害 或 可能致害的故障=须上报）、多数 MDR 30 天时限、特定严重事件 5 天时限、投诉趋势纳入管理评审。
2. **过程验证**（21 CFR 820.75，对应 ISO 13485 7.5.6）：确认 IQ/OQ/PQ 上次再验证时间。核查首次引入即验证、再验证触发条件（工艺/设备/材料变更 或 周期计划）、适用处按 21 CFR 820.250 用统计技术。
3. **DHR 器械历史记录**（21 CFR 820.180）：抽查近 2 年商业流通产品的 DHR。保存期为自商业流通起 2 年；DHR 须含制造日期、制造数量、放行数量、接收记录、主标识标签、器械标识、控制编号；按产品类别分层抽样；核对 DHR 与 DHF 设计历史文档的一致性。
4. **CAPA**（21 CFR 820.100 = ISO 13485 8.5.2）：抽查近 6 个月 CAPA 及有效性验证。核查根因分析深度（至少 5 Why）、有效性验证须为可量化证据（不接受「我们更新了程序」）、围堵/纠正/纠正措施三者区分有记录、由适当权限审批关闭、超 90 天的老化 CAPA 须标记。
5. **标签**（21 CFR 801，FDA 特有、ISO 13485 无）：调取最近一次产品发布的标签评审。核查符合 21 CFR 801；特定器械类型另有 21 CFR 800 系列行业叠加；UDI 唯一器械标识符合 21 CFR 830；宣传材料经准确性与不误导性审查。
6. **Form 483 闭环**：若近 3 年曾收到 483，调取闭环状态。Form 483=FDA 观察项，不等同于 ISO 不符合项；回复须在 15 个工作日内；每条观察项有书面纠正+预防措施及时间线、有有效性验证证据；警告信走独立回复轨道并可能需 FDA 会谈。

7. 完成取证后按下方「输出格式」汇总，给出 检查就绪/发现差距/未就绪 三档判定与 Top3 行动。

## 指令

按需运行配套脚本（路径相对源仓库技能目录，运行前确认输入 JSON 已就绪）：

```bash
# 1. QSR 合规态势检查
python ../../ra-qm-team/skills/fda-consultant-specialist/scripts/qsr_compliance_checker.py compliance_state.json

# 2. FDA 提交跟踪（510(k) / PMA / IDE）
python ../../ra-qm-team/skills/fda-consultant-specialist/scripts/fda_submission_tracker.py submissions.json

# 3. HIPAA 重叠（联网器械处理 PHI 时）
python ../../ra-qm-team/skills/fda-consultant-specialist/scripts/hipaa_risk_assessment.py phi_inventory.json

# 4. 模拟 FDA 检查
python ../../skills/compliance-os/scripts/audit_simulator.py fda_qsr_scope.json
```

## 示例

输出报告骨架（Markdown）：

```markdown
# FDA QSR 审计准备：<范围>
**日期：** YYYY-MM-DD

## 正在做的决策
[体系规划 | 检查就绪 | 483 回复 | MDR 决策 | 召回]

## 投诉 + MDR 态势
- 上季度投诉数：N
- MDR 可上报事件：M
- 时限内提交的 MDR 报告占比：%（目标 100%）
- 管理层做了投诉趋势评审：是/否

## 过程验证状态（21 CFR 820.75）
- 按计划完成的验证：%
- 过期验证：<清单>
- 已应用统计技术：是/否（按工艺）

## DHR 完整性（21 CFR 820.180）
- 抽查 DHR 数：N
- 完整率：%
- 满足 2 年保存：是/否
- 按产品类别分层：是/否

## CAPA 健康度（21 CFR 820.100）
- 抽查 CAPA 数：N
- 根因分析深度：充分/不足
- 有效性验证：完整/不完整
- 超 90 天老化 CAPA：N

## 标签（21 CFR 801）
- 已评审近期产品：<清单>
- 标签准确且不误导：是/否
- UDI 符合 21 CFR 830：是/否

## Form 483 / 警告信历史
- 近 3 年 483 数：N（各：已关闭/进行中）
- 近 5 年警告信数：N（各：已关闭/进行中）
- 观察项主题模式：<主题>

## ISO 13485 交叉映射（2026 年 2 月后协调）
- ISO 13485 审计发现：<链接到 iso13485 输出>
- 剩余 FDA 特有叠加：标签 + 投诉处理 + MDR 上报 + 召回程序
- 跨框架证据复用率：%

## 判定
🟢 检查就绪 | 🟡 发现差距 | 🔴 未就绪

## Top 3 行动
[3 条具体下一步，含负责人 + FDA 引用时限（15 天 / 30 天 等）]

## 需外部法律顾问
[警告信回复、召回决策，或 510(k) / PMA 策略争议时]
```

## 注意事项

- **取证而非陈述**：六问的本质是让对方拿出证据，而不是描述程序。有效性验证尤其只认可量化证据。
- **时限红线易错**：MDR 多数 30 天、特定严重事件 5 天；Form 483 回复 15 个工作日。时限合规率目标 100%。
- **DHR 保存期**：自商业流通起算 2 年，抽样务必按产品类别分层并回溯核对 DHF。
- **483 ≠ 不符合项**：Form 483 是 FDA 观察项，不等同 ISO 13485 不符合项，处理轨道不同；警告信另起独立轨道并可能涉 FDA 会谈。
- **法律边界**：警告信回复、召回决策、510(k)/PMA 策略争议须引入外部法律顾问，本技能只标记触发条件。
- **协调红利与残留**：2026 年 2 月起与 ISO 13485 实质协调，可复用大量证据；但标签（801）、投诉处理、MDR、召回为 FDA 特有叠加，不能靠 ISO 审计覆盖。

## 互见

- iso13485-audit-prep —— ISO 13485 交叉映射配对（实质协调，证据可复用）
- compliance-readiness —— 多框架合规总览视图
- gdpr-audit-prep —— 联网器械处理个人数据时
- 法律顾问评审 —— 警告信回复协调
- 配套专家技能：fda-consultant-specialist（提供上述脚本）

---

采编自 alirezarezvani/claude-skills（MIT 许可证）。
