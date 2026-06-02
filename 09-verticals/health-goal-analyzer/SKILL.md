---
name: health-goal-analyzer
title: 健康目标分析器
description: 当需要为个人健康管理评估目标质量、追踪进度并给出优化建议时使用；做 SMART 目标验证、进度/习惯/动机追踪、健康数据关联分析与 ECharts 可视化报告产出；不适用于医疗诊断、开处方或处理进食障碍/强迫行为。触发词：健康目标分析、SMART目标、health goal、目标进度追踪、habit streak、习惯养成、动机评估、数据关联分析、减重运动睡眠关联
domain: 领域/medical
triggers: [健康目标分析, SMART目标, health goal, 目标进度追踪, habit streak, 习惯养成, 动机评估, 数据关联分析, 减重运动睡眠关联]
tags: [health, medical, goal-tracking, smart-goal, habit, motivation, data-analysis, echarts, visualization]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Grep, Glob, Write, ECharts 5.x, Python, JSON]
requires: []
related: [fact-checking, csv-data-cleaner]
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 评估某个健康目标是否符合 SMART 原则，找出目标设定的薄弱点并给改进方案。
- 追踪目标完成进度（百分比、时间进度、速度、趋势），预测完成时间。
- 分析习惯连续天数与完成率、评估动机水平、识别达成障碍。
- 将减重/运动/饮食/睡眠目标与营养、运动、睡眠等数据做关联分析，并生成 ECharts 交互式 HTML 报告。

不该用（负边界，安全第一）：
- 不做医疗诊断、不开治疗处方、不替代专业医疗建议。
- 不处理进食障碍或强迫性行为；遇到此类信号应转介专业人士。
- 出现危险信号（见下）时停止给激进建议，改为提示就医。

## 步骤

1. 读取数据：主文件 `data-example/health-goals-tracker.json`；日志 `data-example/health-goals-logs/YYYY-MM/YYYY-MM-DD.json`；关联数据 `nutrition-tracker.json`、`fitness-tracker.json` 等。
2. SMART 验证：对目标的 specific/measurable/achievable/relevant/time_bound 各打 1-5 分，汇总为总评分与等级（S/A/B/C），输出改进建议。
3. 进度追踪：计算完成百分比、时间进度、平均速度、预计完成时间，套用进度评级（优秀/正常/落后/严重落后）。
4. 习惯与动机：统计连续天数、完成率、习惯强度（1-10），判断养成阶段；评估动机水平并预警动机低谷。
5. 障碍与关联：识别时间/动机/环境/能力/身体五类障碍并给方案；对关联因素做相关性分析（Pearson）。
6. 触发危险信号检查（极端目标、长期低完成率/低动机、身体不适）；命中则插入转介建议。
7. 生成报告：输出 Markdown 分析报告，或带 ECharts 图表的本地 HTML 报告。

## 指令

计算公式：
- 完成百分比：`(current_value / target_value) * 100`
- 时间进度：`(days_elapsed / total_days) * 100`
- 完成率：`(completed_days / total_days) * 100`
- 连续天数：遍历日志统计连续完成天数；习惯强度为完成率与连续天数的复合评分。

合理性基准（用于 achievable 评分与危险信号）：
- 减重每周 0.5-1 公斤；运动每周 3-5 次、每次 30-60 分钟。

SMART 验证算法（Python）：
```python
def validate_smart_goal(goal):
    scores = {
        'specific': check_specificity(goal),
        'measurable': check_measurability(goal),
        'achievable': check_achievability(goal),
        'relevant': check_relevance(goal),
        'time_bound': check_time_bound(goal)
    }
    overall = sum(scores.values()) / len(scores)
    grade = get_grade(overall)
    return scores, overall, grade
```

习惯养成阶段：第1-7天启动期 / 8-21天形成期 / 22-30天巩固期 / 31-66天习惯期 / 67天+自动化期。

动机激励策略：动机<5 回顾初心、降低短期目标；5-7 强调进步、设小奖励；>7 设挑战、追求卓越。

可视化用 ECharts 5.x（CDN），响应式 CSS，支持深色/浅色主题与本地离线运行；进度趋势用 line（带 markLine 里程碑），习惯用 heatmap，多目标达成率用 pie 环形图。

## 示例

SMART 评估输出：
```json
{
  "goal": "6个月内减重5公斤",
  "smart_scores": {"specific": 5, "measurable": 5, "achievable": 4, "relevant": 5, "time_bound": 5},
  "overall_score": 4.8,
  "grade": "A",
  "assessment": "优秀的SMART目标",
  "suggestions": ["设定阶段性里程碑(每2个月减重1.5-2公斤)", "配合运动计划和饮食调整"]
}
```

数据关联分析输出：
```json
{
  "goal": "weight-loss",
  "correlations": [
    {"factor": "daily_calories", "correlation": -0.75, "strength": "强负相关", "insight": "降低每日卡路里摄入加速减重"},
    {"factor": "exercise_frequency", "correlation": 0.68, "strength": "强正相关", "insight": "建议每周4次以上运动"},
    {"factor": "sleep_duration", "correlation": 0.45, "strength": "中等正相关", "insight": "保证7-8小时睡眠"}
  ],
  "recommendations": ["重点控制卡路里摄入，保持当前运动频率", "优化睡眠时长以提升减重效果"]
}
```

进度评级图标：🟢优秀(超前) / 🟡正常 / 🟠落后(需加快) / 🔴严重落后(建议调整目标)。

## 注意事项

危险信号（命中即提示就医/转介，勿继续推进激进目标）：
- 极端目标：减重>1公斤/周、增重>0.5公斤/周、卡路里<1200/天、运动>2小时/天且7天/周。
- 不健康迹象：完成率<30%持续3周、动机评分<3持续2周、身体不适报告、强迫性行为模式。

转介：有危险信号建议咨询医生；慢性病转专科；饮食目标转营养师；运动目标转健身教练。

能力边界：仅辅助设定/追踪目标、识别行为模式、给一般性健康改善建议与可视化报告；不替代环境特定的验证与专家审阅。若缺少必要输入、权限、安全边界或成功标准，先停下澄清。使用本技能始终把用户健康与安全放在首位。

本条采编自 sickn33/antigravity-awesome-skills（MIT）。

## 互见

- fact-checking：核验健康建议与数据来源的可靠性。
- csv-data-cleaner：清洗营养/运动/睡眠等原始追踪数据后再做关联分析。
