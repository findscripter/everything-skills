---
name: enterprise-project-manager
title: 企业级项目组合管理
description: 当需要做企业软件/SaaS/数字化转型的多项目组合管理、量化风险评估、资源产能规划或高管级汇报时使用；做组合健康打分、EMV/蒙特卡洛风险量化、WSJF/RICE/ICE 优先级排序与董事会级 RAG 报告（产出健康仪表盘、风险矩阵、产能方案、高管报告）；不适用于单 sprint 敏捷执行、产品需求设计或个人待办管理；触发词：项目组合管理、portfolio、风险评估、EMV、蒙特卡洛、WSJF、RICE、ICE、资源产能、RAG 状态、高管汇报、项目健康
domain: 协作/pm
triggers: [项目组合管理, portfolio, 风险评估, EMV, 蒙特卡洛, WSJF, RICE, ICE, 资源产能, RAG 状态, 高管汇报, 项目健康]
tags: [project-management, portfolio, risk-analysis, prioritization, resource-planning, executive-reporting, wsjf, emv]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python3, EMV, Monte Carlo, WSJF, RICE, ICE, RACI, Jira, Confluence]
requires: []
related: [agile-product-owner, jira-expert, task-decomposition-planner, deal-pipeline-tracker]
combines_with: [jira-expert, product-manager-toolkit, board-deck-builder]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

适用于企业软件、SaaS、数字化转型等**多工作流、复杂依赖、千万级预算**的项目组合（portfolio）。典型场景：组合健康复盘、量化风险评估、资源产能优化、跨项目优先级排序、董事会/高管级 RAG 汇报、风险调整后的预算与 ROI 测算。

**不该用边界**：单个 Sprint 的敏捷执行交给 Scrum Master；产品需求/路线图细节交给 Product Owner；个人任务/待办管理无需本技能。本技能聚焦组合层的策略、量化与治理，不替代具体研发执行。

## 步骤

采用**三层分析法**，每层对应一个脚本（输入为组合数据 JSON）。

**第一层 · 组合健康评分** — `project_health_dashboard.py`
```bash
python3 scripts/project_health_dashboard.py current_portfolio.json
```
加权维度：进度 25% / 预算 25% / 范围 20% / 质量 20% / 风险敞口 10%。
RAG 判定：🟢 综合分 >80 且各维度 >60；🟡 综合分 60-80 或任一维度 40-60；🔴 综合分 <60 或任一维度 <40。

**第二层 · 风险矩阵与应对** — `risk_matrix_analyzer.py`
```bash
python3 scripts/risk_matrix_analyzer.py current_portfolio.json
```
流程：概率(1-5) × 影响(1-5) × 类别权重（技术 1.2 / 资源 1.1 / 财务 1.4 / 进度 1.0），再算 EMV。
应对策略按风险分阈值：规避 >18 / 缓解 12-18 / 转移 8-12 / 接受 <8。

**第三层 · 资源产能优化** — `resource_capacity_planner.py`
```bash
python3 scripts/resource_capacity_planner.py current_portfolio.json
```
目标利用率 70-85%（可持续）；识别关键路径瓶颈；做 what-if 重分配场景。

**周度健康复盘的硬性闸门（务必遵守）**：
- 任一项目综合分 <60 或关键字段缺失 → **停**，先修复数据完整性。
- 任一风险分 >18（规避阈值）→ **停**，升级至项目发起人。
- 任一团队利用率 >90% 或 <60% → 标记，进入重分配讨论后再出报告。

## 指令

**EMV 与风险调整预算**
```python
def calculate_emv(risks):
    category_weights = {"Technical": 1.2, "Resource": 1.1, "Financial": 1.4, "Schedule": 1.0}
    total_emv = 0
    for risk in risks:
        risk["score"] = risk["probability"] * risk["impact"] * category_weights[risk["category"]]
        total_emv += risk["probability"] * risk["financial_impact"]
    return total_emv

def risk_adjusted_budget(base_budget, portfolio_risk_score, risk_tolerance_factor):
    return base_budget * (1 + portfolio_risk_score * risk_tolerance_factor)
```

**优先级模型（按场景选用，勿混用）**
```python
def wsjf(user_value, time_criticality, risk_reduction, job_size):
    return (user_value + time_criticality + risk_reduction) / job_size   # 资源受限敏捷组合、可量化延迟成本

def rice(reach, impact, confidence_pct, effort_pm):
    return (reach * impact * (confidence_pct / 100)) / effort_pm          # 面向客户、reach 可量化

def ice(impact, confidence, ease):
    return (impact + confidence + ease) / 3                               # 头脑风暴/快速排序
```
选型决策：资源受限+敏捷+延迟成本可量化→WSJF；面向客户+有 reach 指标→RICE；需快速排序/构思阶段→ICE；多方诉求冲突→MoSCoW；跨不可通约维度的复杂权衡→MCDA。

**蒙特卡洛三点估算 + 组合风险相关性**
```python
def three_point_estimate(o, m, p):
    return (o + 4*m + p) / 6, (p - o) / 6          # 期望, 标准差

import math
def portfolio_risk(individual_risks, correlations):
    sum_sq = sum(r**2 for r in individual_risks)
    sum_corr = sum(2*c*individual_risks[i]*individual_risks[j] for i, j, c in correlations)
    return math.sqrt(sum_sq + sum_corr)
```
风险偏好与应急储备：保守(分 0-8) 25-30% / 适中(分 8-15) 15-20% / 激进(分 15+) 10-15%。

## 示例

周度组合健康复盘：
1. 跑 `project_health_dashboard.py` → 项目 A 综合分 58（🔴）且预算维度缺失 → 触发闸门，停，补数据后重跑。
2. 跑 `risk_matrix_analyzer.py` → 某集成风险分 20 >18 → 停，升级发起人，定规避方案。
3. 跑 `resource_capacity_planner.py` → 后端团队利用率 94% → 标记重分配。
4. 汇总为高管报告：RAG 仪表盘 + 财务表现 vs 战略目标 + 风险热力图 + 含 ROI 的前瞻建议。

## 注意事项

- **三脚本输出互补**，需综合而非孤立解读；高管报告要落到「关键问题 + 可执行建议」。
- 类别权重、RAG 阈值、应对阈值是源约束，**勿随意改动**，否则失去可比性。
- 组合 KPI 参考线：准时交付 >80%、预算偏差 <5%、质量分 >85、风险覆盖 >90%、利用率 75-85%；高风险问题解决 <7 天、中风险 <30 天。
- 交接：向 Scrum Master 传战略优先级/资源/需关注风险；向 Product Owner 传 ROI/市场优先级；接收高管团队的目标变更与风险偏好调整。
- 可借 MCP 接入 Jira（组合看板、跨项目指标）/ Confluence（战略文档、高管报告）自动取数与生成报告。

## 互见

- `assets/project_charter_template.md`（12 段项目章程）、`executive_report_template.md`（董事会级报告）、`raci_matrix_template.md`（RACI + 升级路径）、`sample_project_data.json`（示例组合数据）。
- `references/portfolio-prioritization-models.md`、`risk-management-framework.md`、`portfolio-kpis.md`。

---
本条采编自 alirezarezvani/claude-skills（MIT 许可证）。
