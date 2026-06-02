---
name: iso14971-risk-management
title: ISO 14971 医疗器械风险管理
description: 当为医疗器械建立或更新覆盖全生命周期的风险管理体系时使用；按 ISO 14971:2019 完成风险计划/分析/评价/控制与生产后监测，产出风险矩阵、危害分析、控制记录与风险管理报告；不适用于非医疗领域通用安全评估或仅做信息安全/隐私风险；触发词：ISO 14971、风险管理、risk management、危害分析、FMEA、FTA、风险矩阵、可接受性、ALARP、剩余风险、受益风险、上市后风险
domain: 领域/medical
triggers: [ISO 14971, 风险管理, risk management, 危害分析, hazard identification, FMEA, FTA fault tree, 风险矩阵, risk matrix, 风险可接受性, ALARP, 剩余风险, residual risk, 受益风险分析, benefit-risk, 上市后风险, post-market risk]
tags: [iso14971, medical-device, risk-management, fmea, fta, regulatory, quality, alarp, risk-matrix, post-market]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, risk_matrix_calculator.py, fmea_analyzer.py]
requires: []
related: [iso13485-qms-implementer, capa-root-cause-officer, eu-mdr-745-specialist, fda-device-consultant]
combines_with: [iso13485-qms-implementer, capa-root-cause-officer, fda-device-consultant]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

为医疗器械（含 IVD、软件 SaMD）建立、执行或更新符合 ISO 14971:2019 的风险管理体系时使用。典型触发：要做危害识别/风险分析、用 FMEA/FTA 估计风险、构建或套用 5×5 风险矩阵判定可接受性、设计与验证风险控制措施、评估剩余风险与受益风险、组织上市后（生产后）风险监测与风险管理文档更新。

不该用的边界：
- 非医疗领域的通用安全/职业健康风险评估，或纯信息安全、隐私、项目管理风险——本条的概率/严重度刻度与 ALARP 判则面向「对患者/使用者/第三方的伤害」，套用到其他域会失真。
- 不替代法规注册主体的审批职责，也不替代 ISO 13485 质量体系本身（风险管理是其输入，二者需对接）。
- 概率数字（10⁻³~10⁻⁶ 等）为常见实践示例，实际项目须以经审批的风险管理计划中定义的刻度为准。

## 步骤

ISO 14971 全生命周期主线：计划 → 分析 → 评价 → 控制 → 剩余风险/受益风险 → 生产与生产后。

1. 风险管理计划（Planning）：界定范围（器械标识、覆盖的生命周期阶段、适用标准法规）；定义可接受性准则（概率 P1–P5、严重度 S1–S5、风险矩阵与阈值）；分配职责（负责人、SME、审批权）；定义验证方法与验收准则；规划生产/生产后活动（信息来源、复评触发、更新流程）；计划获批并建立风险管理文档（RM File）。
2. 风险分析（Analysis）：明确预期用途与合理可预见的误用（适应证、患者/用户人群、使用环境）；选择方法（FMEA 看部件/功能、FTA 看系统级、HAZOP 看过程偏差、Use Error Analysis 看人机交互、PHA 用于早期设计）；按类别识别危害（电气/机械/热/辐射/生物/化学/软件/使用错误/环境）；推导危害处境（事件序列、误用场景、单一故障）；估计伤害概率（P）与严重度（S），记入危害分析工作表。
3. 风险评价（Evaluation）：由 P×S 套矩阵得初始风险等级，对照可接受性准则分流——Low 记录接受 / Medium、High 进入控制并论证 ALARP / Unacceptable 强制设计变更；记录评价理由；识别需做受益风险分析的项并完成。
4. 风险控制（Control）：按控制优先级层级选措施——①设计本质安全（最高，消除危害/失效安全）②防护措施（防护罩、报警、自动停机）③安全信息（警告、培训、IFU，效果最低）；分析控制是否引入新危害；写入设计需求并实现；编制并执行验证方案；评估带控制后的剩余风险。
5. 剩余风险与受益风险：逐条与总体评估剩余风险可接受性；高剩余风险、无可行降险、新型器械等情形须做受益风险分析（受益是否压倒风险）；汇总为风险管理报告。
6. 生产与生产后（Post-Production）：建立信息来源（投诉、维修/现场失效、警戒/不良事件、文献、临床/PMCF）与采集流程；定义复评触发（新危害、已知危害频次上升、严重事件、法规反馈）；分析输入相关性并更新 RM File；按周期复评。

## 指令

随技能附带 `risk_matrix_calculator.py`（5×5 风险等级 + FMEA RPN）：

```bash
# ISO 14971 风险等级：概率(1-5) × 严重度(1-5)
python risk_matrix_calculator.py --probability 3 --severity 4

# FMEA RPN = 严重度 × 发生度 × 探测度（各 1-10）
python risk_matrix_calculator.py --fmea --severity 8 --occurrence 5 --detection 6

# 交互式引导评估
python risk_matrix_calculator.py --interactive

# 打印 5×5 风险矩阵 / 准则定义
python risk_matrix_calculator.py --show-matrix
python risk_matrix_calculator.py --list-criteria

# JSON 输出，便于集成
python risk_matrix_calculator.py -p 4 -s 3 --output json
```

FMEA RPN 优先级判则：RPN>200 紧急（立即处置）；>100 高（需行动计划）；>50 中（考虑降险）；否则低（监控）。另有 `fmea_analyzer.py` 可用于 FMEA 表格批量分析。

## 示例

5×5 风险矩阵（行=概率，列=严重度）摘要：

| 概率＼严重度 | S1 可忽略 | S2 轻微 | S3 严重 | S4 危重 | S5 灾难 |
|---|---|---|---|---|---|
| P5 频繁 | Medium | High | High | Unacceptable | Unacceptable |
| P4 很可能 | Medium | Medium | High | High | Unacceptable |
| P3 偶尔 | Low | Medium | Medium | High | High |
| P2 很少 | Low | Low | Medium | Medium | High |
| P1 不大可能 | Low | Low | Low | Medium | Medium |

等级处置：Low=记录并接受；Medium=ALARP，可行则降险否则记录理由；High=ALARP，必须降险并证明已达 ALARP；Unacceptable=强制设计变更，不得放行。

风险控制选项分析模板（节选）：

```
危害 ID：H-XXX  危害：[描述]  初始风险：P[x]×S[x]=[等级]
| 选项 | 控制类型 | 引入新危害 | 可行性 | 是否选用 |
|----|------|--------|-----|------|
| 1  | 本质安全 | 否 | 高 | 是 |
选定控制：选项 X  理由：…
实现：需求 REQ-XXX / 设计文档引用
验证：方法(测试/检验/分析/评审) + 方案引用 + 验收准则
```

## 注意事项

- 控制优先级不可颠倒：先「本质安全设计」，其次「防护措施」，最后才「安全信息」；不能以警告/培训替代本应通过设计消除的风险。
- 每加一个控制都要做「新危害分析」：若新风险高于原风险则否决该方案；新危害须可被控制，否则换方案。
- ALARP 论证需留证据：技术可行性、进一步降险的成本/收益相称性、与同类器械的现有水平对比、临床/用户意见。
- 概率刻度（>10⁻³ 至 <10⁻⁶）与严重度（可忽略→灾难/死亡）为通用示例，须以计划中经审批的定义为准。
- 生产后是闭环的一部分：严重事件须立即触发完整风险复评，趋势上升、设计变更、标准换版均有对应响应时限，RM File 必须保持现行有效。
- FMEA 的 RPN 仅作排序优先级参考，不替代 ISO 14971 的可接受性判定；高严重度项即使 RPN 不高也应单独关注。

## 互见

- ISO 13485 质量管理体系：风险管理是其设计开发与采购等过程的输入，需双向对接。
- CAPA（纠正预防措施）：上市后发现的新/升级风险应驱动基于风险的 CAPA。
- 法规注册：风险管理报告与剩余风险结论是注册申报的核心证据。

---

本条采编自 alirezarezvani/claude-skills（MIT 许可），适配重写为面向 AI Agent 消费的中文条目。
