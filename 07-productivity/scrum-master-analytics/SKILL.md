---
name: scrum-master-analytics
title: Scrum 敏捷教练与冲刺数据分析
description: 当需要做冲刺规划、复盘、团队健康度评估或基于 Jira 导出的 sprint JSON 做速度预测时使用；用三个 Python 脚本产出蒙特卡洛速度预测、6 维健康度评分与复盘行动项追踪报告；不适用于具体 Jira 配置/JQL/工作流搭建（交 jira-expert），也不写用户故事/待办（交 agile-product-owner）。触发词：Scrum、冲刺、速度、燃尽图、复盘、健康度
domain: 协作/knowledge
triggers: [Scrum, 敏捷教练, 冲刺规划, Sprint, 速度预测, 蒙特卡洛, 燃尽图, 复盘, Retrospective, 团队健康度, 故事点, 阻塞, Standup 站会, 待办梳理, Velocity]
tags: [协作, 项目管理, 敏捷, Scrum, 冲刺, 数据分析, 蒙特卡洛, 复盘, 团队健康度, 速度预测]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, Jira (JSON 导出)]
requires: []
related: [agile-product-owner, jira-expert, enterprise-project-manager, resource-capacity-planner]
combines_with: [task-decomposition-planner, status-report-generator]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
> 注意：`name` 应为 `scrum-master-analytics`，`status: stable`，`agents: [claude-code, codex, cursor, gemini-cli]`，`license: MIT`，`source: alirezarezvani/claude-skills`，`source_license: MIT`，`related: [jira-expert, agile-product-owner, enterprise-project-manager, meeting-transcript-analyzer]`，`combines_with: [jira-expert, agile-product-owner, resource-capacity-planner]`。
> `domain`：任务给定 `协作/misc`，但仓库 `taxonomy.json` 受控词表中 07-productivity（协作卷）无 `misc` 类，`build-index.mjs` 会校验报错（项目已归零 misc）。本技能本质属项目管理，应填 **`协作/pm`**（与兄弟条目 `jira-expert` 一致）。请确认后再落盘。

# Scrum 敏捷教练与冲刺数据分析

数据驱动的 Scrum Master 技能：把冲刺历史（Jira 等导出的 JSON）喂给三个纯 Python 脚本，产出概率化速度预测、团队健康度评分与复盘行动项追踪，再叠加教练判断。核心价值在三个脚本及其工作流。

## 何时使用

当你以「敏捷教练 / Scrum Master」身份做下列任一类**分析与决策支持**时使用：

- 冲刺规划：用历史速度的置信区间定本次承诺上限。
- 团队健康度体检：从承诺可靠性、范围稳定性等 6 个维度打分定级。
- 复盘：追踪行动项完成率、复发主题、团队成熟度演进。
- 站会 / 评审：记录阻塞解决时长、范围变更事件，回灌数据。

**不该用本技能的边界：**
- 具体 Jira 配置（建项目、写 JQL、搭工作流/仪表盘/自动化）→ 交 `jira-expert`，本技能只消费其导出的 JSON。
- 写用户故事、拆 Epic、排待办优先级 → 交 `agile-product-owner`。
- 组合 / 多项目层面的资源与组合健康 → 交 `enterprise-project-manager` / `resource-capacity-planner`。
- 团队规模 5–9 人之外、跨团队强依赖场景：脚本指标需人工调整解读，勿直接照搬。

## 步骤 / 指令

所有脚本读同一份 JSON（schema 见「示例」），输出 `--format text`（人读）或 `--format json`（下游处理）。

**三个脚本及校验门：**

1. **速度分析 `velocity_analyzer.py`** —— 滚动均值 + 线性回归趋势 + 蒙特卡洛模拟。
   ```bash
   python velocity_analyzer.py sprint_data.json --format text
   python velocity_analyzer.py sprint_data.json --format json > analysis.json
   ```
   产出：速度趋势（上升/稳定/下降）、变异系数 CV、未来 6 冲刺在 50/70/85/95% 置信度下的预测、异常标记+根因建议。
   **门槛：少于 3 个冲刺则停下并提示「速度分析至少需要 3 个冲刺，请补充数据」；统计显著建议 ≥6 个冲刺。**

2. **健康度评分 `sprint_health_scorer.py`** —— 6 个加权维度 → 0–100 总分+等级。
   ```bash
   python sprint_health_scorer.py sprint_data.json --format text
   ```
   产出：总分+等级、各维度分+建议、环比趋势、干预优先级矩阵。
   **门槛：需 ≥2 个冲刺且含仪式参与与故事完成数据；数据缺失时显式报告哪些维度无法评分并向用户索要。**

3. **复盘分析 `retrospective_analyzer.py`** —— 行动项完成率、复发主题、情绪趋势、成熟度。
   ```bash
   python retrospective_analyzer.py sprint_data.json --format text
   ```
   产出：按优先级/负责人的行动项完成率、主题复发持续度、团队成熟度（forming/storming/norming/performing）、改进速度趋势。
   **门槛：需 ≥3 次带行动项追踪的复盘；不足时注明限制，仅做部分主题分析。**

**6 维健康度权重与目标（评分依据，务必保留）：**

| 维度 | 权重 | 目标 |
|---|---|---|
| 承诺可靠性 Commitment Reliability | 25% | >85% 冲刺目标达成 |
| 范围稳定性 Scope Stability | 20% | <15% 冲刺中变更 |
| 阻塞解决 Blocker Resolution | 15% | 平均 <3 天 |
| 仪式参与 Ceremony Engagement | 15% | >90% 参与率 |
| 故事完成分布 | 15% | 高比例完全完成 |
| 速度可预测性 | 10% | CV <20% |

**冲刺规划工作流：**
1. 跑 `velocity_analyzer.py`。
2. 用 **70% 置信区间**作为待办承诺上限。
3. 看健康度的「承诺可靠性 / 范围稳定性」两项校准与 PO 的谈判。
4. 若 CV >20%（高波动），对外只给区间估计，不给单点数。
5. 记录容量假设（休假、依赖）供下次复盘对照。

**复盘工作流：**
1. 会前先跑全部脚本：
   ```bash
   python sprint_health_scorer.py sprint_data.json --format text > health.txt
   python retrospective_analyzer.py sprint_data.json --format text > retro.txt
   ```
2. 用健康总分+被标记的维度开场聚焦讨论。
3. 用行动项完成率定本轮可吸纳的新行动项数（**完成率 <60% 时 ≤3 个**）。
4. 每个行动项指定负责人 + 可量化成功标准再散会。
5. 把新行动项写回 `sprint_data.json` 供下轮追踪。

**站会数据回灌：** 记录每个阻塞的开启日期（喂阻塞解决维度）；阻塞超 2 天未解决主动升级并写入数据。

## 示例

**输入 JSON schema（节选，完整见源 `assets/sample_sprint_data.json`）：**
```json
{
  "team_info": { "name": "string", "size": 7, "scrum_master": "string" },
  "sprints": [
    {
      "sprint_number": 1,
      "planned_points": 20,
      "completed_points": 18,
      "stories": [],
      "blockers": [],
      "ceremonies": {}
    }
  ],
  "retrospectives": [
    {
      "sprint_number": 1,
      "went_well": ["string"],
      "to_improve": ["string"],
      "action_items": []
    }
  ]
}
```
Jira 等导出的字段需先映射到此 schema 再跑脚本。源附 6 冲刺样例期望输出可对照：速度均值 20.2 点、CV 12.7%、健康分 78.3/100、行动项完成率 46.7%。

**关键目标基线（Key Metrics）：** 健康总分 >80/100、速度 CV <20%、承诺可靠性 >85%、范围稳定性 <15%、阻塞解决 <3 天、仪式参与 >90%、复盘行动项完成率 >70%、心理安全指数 >4.0/5.0。

## 注意事项

- **样本量**：少于 6 个冲刺会削弱蒙特卡洛置信度，永远报置信区间而非单点估计。
- **数据完整性**：缺仪式 / 故事完成字段会让对应维度无法评分，必须显式报告缺口，不要静默跳过。
- **量化偏差**：脚本分数不替代定性观察，需结合一对一、心理安全脉搏调查（Edmondson 7 点量表，目标 >4.0/5.0）综合判断。
- **上下文敏感**：建议须结合 JSON 未捕获的组织/团队背景解读。
- **脚本纯标准库、无 LLM 调用**，可离线快速跑。
- **成熟度干预对齐**：成熟度为 forming/storming 时，先做安全与冲突引导，再谈流程优化；分数连续 2 个冲刺停滞或倒退则升级干预策略。

## 互见

- related：`jira-expert` —— 本技能消费其导出的 sprint JSON；Jira 侧的工作流/燃尽图配置由它负责。
- related：`agile-product-owner` —— 用户故事与待办是冲刺规划的输入。
- related：`enterprise-project-manager` —— 组合 / 多团队层面的健康与组合视图。
- related：`meeting-transcript-analyzer` —— 站会/复盘会议记录可作为定性输入补充脚本指标。
- combines_with：`jira-expert` —— Jira 取数 + 本技能分析，闭环冲刺度量。
- combines_with：`agile-product-owner` —— 承诺上限（本技能）回灌待办优先级（PO）。
- combines_with：`resource-capacity-planner` —— 速度预测 + 容量规划共同定承诺范围。

---
*采编自 [alirezarezvani/claude-skills](https://github.com/alirezarezvani/claude-skills)（MIT 许可）。*
