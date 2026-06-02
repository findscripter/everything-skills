---
name: kpi-dashboard-design
title: KPI 仪表盘设计
description: 当需要设计 KPI 仪表盘、为高管/部门挑选关键指标、规划布局或编写指标计算时使用；产出指标分层框架、布局模式与可执行的 SQL/Streamlit 代码；不适用于与指标无关的通用 BI 或纯报表导出。触发词：KPI、仪表盘、dashboard、关键指标、北极星指标、指标体系、MRR、留存、cohort、metrics、KPI dashboard、executive dashboard
domain: 数据/analysis
triggers: [KPI, 仪表盘, dashboard, 关键指标, 北极星指标, 指标体系, MRR, 留存, cohort, metrics, KPI dashboard, executive dashboard]
tags: [kpi, dashboard, analytics, metrics, data-viz, sql, streamlit]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [SQL, Python, Streamlit, pandas, Plotly]
requires: []
related: [data-storyteller, plotly-interactive-viz, matplotlib-visualization, sql-query-builder]
combines_with: [sql-query-builder, plotly-interactive-viz, data-storyteller]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：

- 设计高管/部门级仪表盘，需要挑选少量真正驱动决策的 KPI。
- 搭建实时监控或运营大屏。
- 编写指标计算逻辑（MRR、CAC、留存/cohort 等）。
- 优化已有仪表盘的布局与信息层级、建立指标治理规范。

不该用（负边界）：

- 任务与 KPI/指标无关（纯文档、通用前端、ETL 清洗等，按需转交对应技能）。
- 只是导出明细报表或做一次性取数，无需指标体系设计。

## 步骤

1. 明确目标与受众，按三层框架定位指标层级（决定更新频率和颗粒度）：

   | 层级 | 关注点 | 更新频率 | 受众 |
   | --- | --- | --- | --- |
   | 战略 Strategic | 长期目标 | 月/季 | 高管 |
   | 战术 Tactical | 部门目标 | 周/月 | 经理 |
   | 运营 Operational | 日常执行 | 实时/日 | 团队 |

2. 用 SMART 校验每个 KPI：Specific 定义清晰、Measurable 可量化、Achievable 目标现实、Relevant 对齐目标、Time-bound 有明确周期。剔除虚荣指标。
3. 按部门选取指标（销售：MRR/ARR/ARPU、Win Rate、销售周期；市场：CAC/CPA、转化率、ROI/回本期；产品：DAU/MAU、留存/流失、NPS/CSAT；财务：毛利/净利、流动比率、人均营收）。
4. 设计层级结构：高管摘要 1 页（4-6 个头条 KPI + 趋势 + 告警）→ 部门视图 → 明细下钻/根因分析。
5. 选布局模式落地（见示例）：高管摘要 / SaaS 指标 / 实时运营三类。
6. 实现指标计算（SQL）与展示（Streamlit + Plotly），按指标频率设置刷新。

## 指令

- 单屏聚焦 5-7 个 KPI，超出则拆分到下钻页。
- 每个指标都要给上下文：对比、趋势、目标值。
- 颜色一致：红=差、绿=好；告警分级用 🔴/🟡/🟢。
- 从摘要到明细支持下钻；刷新频率匹配指标层级。
- 文档化口径与算法，保证可复现；保证移动端响应式。
- 避免：3D 图（扭曲感知）、过度堆砌（留白助理解）、隐藏方法论、虚荣指标。

## 示例

高管摘要布局（核心思想：顶部一排头条卡片带趋势箭头，中部趋势/构成图，底部告警条）：

```
┌──────────────────────────────────────────────┐
│ EXECUTIVE DASHBOARD              [Date Range ▼]│
├──────────┬──────────┬──────────┬──────────────┤
│ REVENUE  │ PROFIT   │ CUSTOMERS│ NPS          │
│ $2.4M ▲12%│ $450K ▲8%│ 12,450 ▲15%│ 72 ▲5pts  │
├──────────┴──────────┴──────────┴──────────────┤
│ Revenue Trend (line)   │ Revenue by Product(pie)│
├──────────────────────────────────────────────┤
│ 🔴 Churn 超阈值(>5%)   🟡 工单量高于均值20%      │
└──────────────────────────────────────────────┘
```

指标计算（SQL，MRR 及环比增长，按订阅周期折算到月）：

```sql
WITH mrr_calculation AS (
  SELECT DATE_TRUNC('month', billing_date) AS month,
    SUM(CASE subscription_interval
          WHEN 'monthly'   THEN amount
          WHEN 'yearly'    THEN amount / 12
          WHEN 'quarterly' THEN amount / 3
        END) AS mrr
  FROM subscriptions WHERE status = 'active'
  GROUP BY DATE_TRUNC('month', billing_date)
)
SELECT month, mrr,
  LAG(mrr) OVER (ORDER BY month) AS prev_mrr,
  (mrr - LAG(mrr) OVER (ORDER BY month))
    / LAG(mrr) OVER (ORDER BY month) * 100 AS growth_pct
FROM mrr_calculation;
```

CAC（营销支出 / 当月新增付费客户）：`SUM(marketing_spend) / NULLIF(COUNT(new_customers), 0)`，按月聚合；cohort 留存用 `EXTRACT(MONTH FROM age(activity_month, cohort_month))` 计算注册后第 N 月活跃占比。

展示（Streamlit + Plotly，KPI 卡片 + 趋势/构成图 + cohort 热力图 + 告警）：

```python
import streamlit as st, pandas as pd
import plotly.express as px, plotly.graph_objects as go
st.set_page_config(page_title="KPI Dashboard", layout="wide")

def metric_card(label, value, delta, prefix="", suffix=""):
    arrow = "▲" if delta >= 0 else "▼"
    st.metric(label, f"{prefix}{value:,.0f}{suffix}",
              f"{arrow} {abs(delta):.1f}%")

c1, c2, c3, c4 = st.columns(4)
with c1: metric_card("Revenue", 2400000, 12.5, prefix="$")
with c2: metric_card("Customers", 12450, 15.2)
with c3: metric_card("NPS", 72, 5.0)
with c4: metric_card("Churn", 4.2, -0.8, suffix="%")

# 趋势用 px.line(line_shape='spline', markers=True)
# 构成用 px.pie(hole=0.4)
# cohort 用 go.Heatmap(colorscale='Blues', texttemplate='%{text}%')
for a in [("error","Churn 超阈值(>5%)"), ("warning","工单量高于均值20%")]:
    (st.error if a[0]=="error" else st.warning)(a[1])
```

## 注意事项

- SMART 与「5-7 个 KPI」是硬约束，宁缺毋滥；指标过多等于没有重点。
- SQL 中环比/留存依赖窗口函数与 `NULLIF` 防除零，跨库语法（如 `DATE_TRUNC`、`age()`）需按目标数据库适配（PostgreSQL 写法为例）。
- Streamlit 示例为静态演示数据，接入真实数据源时务必核对口径与时区，并对缺失值（cohort 中的 `None`）做处理。
- 输出不能替代环境内的验证与专家评审；输入口径、权限或成功标准缺失时先停下来澄清。

## 互见

- sql-query-builder：编写与优化 KPI 计算 SQL。
- csv-data-cleaner：仪表盘上游数据清洗与口径校准。
- frontend-design：仪表盘前端布局与可视化呈现。

---

本条采编自 sickn33/antigravity-awesome-skills（MIT）。
