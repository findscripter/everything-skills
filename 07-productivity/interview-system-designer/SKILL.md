---
name: interview-system-designer
title: 招聘面试体系与流程设计
description: 当需要为某岗位/职级设计结构化面试流程、统一评分口径、生成胜任力题库、或事后校准面试官打分偏差时使用；做按职级编排面试轮次与时长、产出胜任力题库与 1-4 评分量规、设计评分卡与去偏检查清单、并用历史打分数据做偏差/校准分析（产出面试 loop 计划、题库、评分卡模板、校准报告）；不适用于具体招聘渠道运营、ATS 系统对接执行、薪酬谈判或属地劳动法合规裁决；触发词：面试流程、面试 loop、面试轮次、胜任力矩阵、评分量规、评分卡、题库、面试官校准、招聘偏差、去偏、structured interview、scorecard、debrief
domain: 协作/pm
triggers: [面试流程, 面试loop, 面试轮次, 胜任力矩阵, 评分量规, 评分卡, 面试题库, 面试官校准, 招聘偏差, 去偏检查, structured interview, scorecard, debrief, 招聘bar, calibration]
tags: [interview, hiring, interview-loop, competency-matrix, scoring-rubric, calibration, bias-mitigation, debrief, recruiting]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python]
requires: []
related: [hr-partner-pro, interview-job-coach, agile-product-owner, company-culture-builder]
combines_with: [hr-partner-pro, company-culture-builder, interview-job-coach]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
＃ 招聘面试体系与流程设计

> 核心原则：**面试信号 = 结构化（每轮目标互不重叠）+ 证据化（每个分数附可观察行为）+ 校准化（同岗同量规、定期对齐）**。把面试从「凭感觉」变成可复用、可度量、可审计的系统：轮次按职级编排，胜任力按岗位映射，打分用统一 1-4 量规并要求书面理由，再用历史数据回测偏差与一致性。无结构 + 无统一评分 = 噪声，不是信号。

## 何时使用

适用于：为某岗位+职级从零编排面试 loop（轮次、时长、形式、面试官要求）；把岗位关键胜任力映射到每轮考察点；生成按胜任力组织、含 1-4 评分量规与追问的题库；撰写标准化评分卡与去偏检查清单；用一批面试打分数据做偏差检测、面试官一致性校准与季度审计。

**不该用边界**：不负责招聘渠道获取/sourcing 运营、简历筛选执行、ATS/日历系统的实际对接落地（只产出可导出的结构化数据）；不做薪酬谈判与 offer 审批；不替代属地劳动法/合规的法律裁决——去偏与合规结论须经法务复核。本技能聚焦面试体系的**设计、标准化与校准**，不替代日常招聘运营。

## 步骤

建议顺序：定 loop → 映胜任力 → 出题库与量规 → 配评分卡与去偏清单 → 收集数据后做校准审计。三个 Python 脚本仅用标准库，无第三方依赖。

**1 · 设计面试 loop（按职级编排轮次）**
- 用 `loop_designer.py` 生成基线 loop（角色、职级、可选团队/自定义胜任力）。职级→轮次基线：
  - junior/mid：精简，侧重基础、调试、成长潜力（Screen + Coding + 可选 System Design + Behavioral）。
  - senior：加 System Design 与 Leadership 轮，评估权衡质量、带教与跨团队协作。
  - staff+/principal：聚焦架构方向与组织影响（Architecture + Technical Strategy + Influence + Behavioral）。
- 原则：每轮目标**显式且不重叠**；平衡考察深度与候选人体验；为每轮指定所需面试官能力与校准等级（High/Standard）。

**2 · 映射岗位胜任力**
四大胜任力域：技术深度（实现/设计/质量）、问题解决（处理模糊性、优先级）、协作（沟通、干系人对齐）、领导力（owner 意识、带教、影响力）。把岗位关键胜任力分配到具体轮次，确保每个核心胜任力**至少被一轮独立考察**，避免单轮过载或重复。

**3 · 生成题库与评分量规**
- 用 `question_bank_generator.py` 按胜任力生成题库，题型含 technical（编码/系统设计/领域题）、behavioral（STAR 法，问过往真实经历）、situational（假设场景考决策）。
- 每题配 1-4 评分量规与不同质量回答的校准示例、追问探针。**统一 1-4 量规**（见下「指令」），跨可比岗位复用同一基线量规。

**4 · 评分卡 + 去偏检查清单**
评分卡要求：用统一量规、面试结束**立即**打分、每个分数附具体证据、**独立打分后再讨论**、不做候选人之间的横向比较、极端分（1 和 4）必须书面说明理由。去偏关键动作：题目标准化、按写好的题面提问不即兴发挥、盲筛简历（初筛去掉姓名/院校/照片）、多元面试小组、对强 yes/no 要求书面理由。

**5 · 数据校准与审计（季度）**
- 用 `hiring_calibrator.py` 分析一批面试打分，做偏差检测、面试官一致性、分数分布与趋势分析，输出针对性的辅导建议。
- **硬约束：统计分析至少需 5 场面试**，且数据须含 candidate_id、interviewer_id、scores、date 等必填字段；不足会报「数据不足」。
- 季度跑偏差审计：识别打分离群的面试官、按人群看通过率、对比面试分与新人实际绩效，据此更新题库与培训。

## 指令

**统一 1-4 评分量规（跨岗位基线，不要随岗位漂移）**
```
4：超出该职级预期，证据强
3：稳定达到预期
2：部分达标，存在明显缺口
1：未达基线要求
```

**生成命令（脚本仅依赖 Python3 标准库）**
```bash
# 1. 设计面试 loop（角色 + 职级；level: junior|mid|senior|staff|principal）
python3 loop_designer.py --role "Senior Software Engineer" --level senior
python3 loop_designer.py --role "Product Manager" --level mid --team growth \
  --competencies leadership,strategy,analytics
python3 loop_designer.py --input assets/sample_role_definitions.json --output loops/ --format json

# 2. 按胜任力生成题库（含量规 + 追问；题型 technical/behavioral/situational）
python3 question_bank_generator.py --role "Frontend Engineer" \
  --competencies react,typescript,system-design
python3 question_bank_generator.py --role "Product Manager" \
  --question-types behavioral,leadership --num-questions 15

# 3. 打分数据校准/偏差分析（analysis-type: comprehensive|bias|calibration|interviewer|scoring）
python3 hiring_calibrator.py --input assets/sample_interview_results.json \
  --analysis-type comprehensive
python3 hiring_calibrator.py --input historical_data.json --trend-analysis --period quarterly
```

**打分数据 JSON 结构（喂给 hiring_calibrator）**
```json
[{
  "candidate_id": "candidate_001", "role": "Senior Software Engineer",
  "interviewer_id": "interviewer_alice", "date": "2024-01-15T09:00:00Z",
  "scores": {"coding_fundamentals": 3.5, "system_design": 4.0, "communication": 3.5},
  "overall_recommendation": "Hire"
}]
```

**校准与去偏 baseline**
- 定期跑面试官校准会；对比各面试官的打分方差；用「先独立打分再讨论」的结构化 debrief。
- 每个胜任力**独立打分**，防 halo/horn 效应（一项强/弱带偏整体）；不做候选人横向比较，只对照岗位标准。
- 关注偏差类型并各自缓解：亲和偏差（偏好与己相似者→聚焦岗位胜任力、多元小组）、确认偏差（追问诱导预期答案→用标准化题）、归因/文化/学历/经验偏差（→看候选人在成果中的实际作用、重技能展示而非背景）。

## 示例

**为资深 SWE 出一套 loop（senior，5 轮约 300 分钟）**：Technical Phone Screen(45min, 虚拟) → Coding Deep Dive(75min) → System Design(75min, 协作白板) → Behavioral(45min) → Technical Leadership(60min, 讨论式)。每轮标 Objectives + Focus Areas + 所需面试官能力 + 校准等级；System Design / Coding / Leadership 标 High calibration。评分卡含加权评估维度（System Architecture/Technical Leadership/Mentoring 高权重，Communication 高权重，Cultural Fit/Learning Agility 中权重）。

**季度校准审计**：① 收集 ≥5 场打分 → `hiring_calibrator.py --analysis-type comprehensive`。② 发现某面试官系统性高 0.6 分 → 标为离群，安排校准辅导。③ 按人群看通过率与分数分布找偏差信号 → 触发去偏清单复查。④ 把面试分与到岗 6 个月绩效做相关性回测，据此修订题库与 bar。

## 注意事项

- **数据下限**：统计分析最少 5 场面试，字段不全（缺 candidate_id/interviewer_id/scores/date）会报「数据不足」；角色名会做常见映射（engineer→software_engineer），自定义岗位选最接近标准岗位 + 指定自定义胜任力。
- **去偏是描述性纪律不是口号**：按题面提问、给所有候选人同等澄清与思考时间、笔记记行为与原话而非印象、避免「seems like / appears to be」之类主观措辞。
- **法律合规红线**（结论须经法务复核）：受保护特征——年龄、种族、宗教、性别、国籍、残疾、退伍军人身份、孕育、性取向、性别认同等。**禁止提问**：家庭计划/婚育、年龄（除非 BFOQ）、宗教/政治、残疾状况（无障碍自愿披露除外）、无定罪关联的逮捕记录、与岗位无关的财务/信用。文档只记岗位相关观察，勿记录受保护特征。
- **常见反模式**：单轮过载而忽视其他胜任力信号；用无结构面试 + 无统一评分；跳过面试官校准会；不记录理由就改 bar；让明星候选人豁免文化/能力标准。
- **debrief 纪律**：先各自独立分享分数再讨论；分歧大时回到证据；挑战讨论中的偏见性措辞；最终决定基于岗位要求而非团队偏好，并书面记录依据与异议。
- 持续改进：按「到岗质量/留存/绩效」回测面试设计的预测效度，定期更新题库；评分卡可导出为结构化数据对接 ATS / 日历，但本技能不负责该对接的实现。

## 互见

- `loop_designer.py` / `question_bank_generator.py` / `hiring_calibrator.py` —— 三个零依赖脚本：loop 编排、题库生成、打分校准；另有 `scripts/interview_planner.py` 为精简版 loop 生成器。
- `references/competency_matrix_templates.md` —— 各工程岗位胜任力矩阵与分职级期望；`references/bias_mitigation_checklist.md` —— 全流程去偏清单与法律合规提醒；`references/debrief_facilitation_guide.md` —— 结构化 debrief 框架；`references/interview-frameworks.md` —— 职级→轮次、1-4 量规与校准基线。
- related：`company-culture-architect`（文化准则为「谁适合/不适合」提供面试可观察判据，但 culture fit 须证据化、非刻板印象）；与一线招聘运营、绩效流程组合落地。

---
本条采编自 alirezarezvani/claude-skills（MIT 许可证）。
