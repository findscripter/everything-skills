---
name: html-dashboard-builder
title: 交互式 HTML 仪表盘构建
description: 当需要把查询结果、CSV 或样例数据做成可分享的单文件 HTML 仪表盘（KPI 卡片+图表+筛选+明细表）时使用；产出一个无需服务器、浏览器直接打开的自包含 .html；不适用于实时刷新看板、>10 万行数据或需后端的 BI 系统（改用专业 BI 工具）。触发词：仪表盘、dashboard、KPI、可视化报表
domain: 数据/analysis
triggers: [仪表盘, dashboard, KPI 看板, 可视化报表, 图表报告, Chart.js, 数据可视化, executive overview, 把查询结果做成报表]
tags: [数据可视化, html, chart.js, 仪表盘, 前端, 报表, misc]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Write, Read, Bash]
requires: []
related: [kpi-dashboard-design, plotly-interactive-viz, grafana-dashboards, web-artifacts-builder]
combines_with: [sql-query-builder, kpi-dashboard-design]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
## 何时使用

适用：
- 把查询结果 / 粘贴数据 / CSV / 样例数据，做成**单文件、可分享、离线可用**的交互式 HTML 仪表盘。
- 典型形态：高管概览（KPI 卡片）、运营监控快照、团队周报、带筛选的多图表报表。
- 接收人只需双击 .html 即可在浏览器查看，无需服务器或安装依赖。

不该用（负边界）：
- **实时/自动刷新看板** → 这是时点快照，请连接专业 BI 工具。
- **数据量 >10 万行** → 不适合客户端渲染，应分页或用 BI 工具。
- 需要登录鉴权、写回数据库、复杂后端逻辑的场景。

## 步骤

1. **澄清需求**：用途（高管概览/运营监控/深挖分析/团队报告）、受众、核心指标、可筛选维度、数据来源（实时查询/粘贴/CSV/样例）。
2. **取数与嵌入**：
   - 已连数仓 → 查询后把结果作为 JSON 嵌入 HTML。
   - 粘贴/上传 → 清洗后嵌为 JSON。
   - 仅有描述无数据 → 造贴合 schema 的真实感**样例数据**，在页面注明"样例数据"并给出换真数据的说明。
3. **设计布局**（按内容裁剪）：顶部 2–4 张 KPI 卡片；中部 1–3 个图表（主图占大区，次图旁列）；底部可选明细表；筛选器置于头部或侧栏。
4. **生成单文件 HTML**：语义化 HTML5 + CSS Grid/Flex 响应式 + Chart.js（CDN）+ 内嵌 JSON 数据，全部自包含、离线可用。
5. **实现图表**：折线（时序趋势）、柱状（类别对比）、环形（<6 类的构成）、堆叠柱（构成随时间）、混合柱+线（量+率叠加）。
6. **加交互**：下拉/日期范围筛选联动所有图表与表格、可排序表头、悬停 tooltip、数字格式化（千分位/货币/百分比）。
7. **保存并打开**：用描述性文件名（如 `sales_dashboard.html`）保存，在默认浏览器打开并确认渲染正确，附上更新数据/定制说明。

## 指令

- **CDN 固定版本 + SRI**（保留源约束，确保可复现与安全）：
  ```html
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.5.1" integrity="sha384-jb8JQMbMoBUzgWatfe6COACi2ljcDdZQ2OxczGA3bGNeWe+6DChMTBJemed7ZnvJ" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns@3.0.0" integrity="sha384-cVMg8E3QFwTvGCDuK+ET4PD341jF3W8nO1auiXfuZNQkzbUUiBGLsIQUE+b1mxws" crossorigin="anonymous"></script>
  ```
- **统一用 `Dashboard` 类组织逻辑**：`init()` 调 `setupFilters / renderKPIs / renderCharts / renderTable`；`applyFilters()` 重算 `filteredData` 后刷新 KPI、图表、表格。
- **数字格式化**用统一 `formatValue(value, format)`，支持 `currency`（≥1e6→M、≥1e3→K）、`percent`、`number`。
- **筛选联动**：下拉用 `getFilterValue()`（值为 `all` 返回 `null`）；日期用 `filterByDateRange()`；组合时逐条 `row.region !== region` 短路过滤。
- **可排序表头**：点击列头切换 `sortDir`（asc/desc），`[...data].sort()` 后重渲染并显示 ▲/▼。
- **配色用 CSS 变量**（`--color-1..6`、`--positive/--negative`），卡片式布局 + 轻阴影 + 系统字体，含 `@media print` 打印样式。

## 示例

- "做一个月度销售仪表盘：营收趋势 + Top 产品 + 区域分布，数据在 orders 表。"
- "这是工单 CSV[粘贴]，做一个按优先级看量、响应时长趋势、解决率的仪表盘。"
- "给一家 SaaS 公司做高管仪表盘模板，展示 MRR、流失率、新客、NPS，用样例数据。"

## 注意事项

- **数据量分级**：<1k 行直接内嵌全交互；1k–1万 行内嵌但图表需预聚合；1万–10万 行只内嵌**预聚合**结果（别嵌原始行）；>10万 行不适合本方案。
- **预聚合优于浏览器端聚合**：嵌 `CHART_DATA`（月度营收、Top 产品、KPI 汇总等 12/10 行），而非 5 万原始行。
- **图表性能**：折线每序列 <500 点（必要时降采样）、柱状 <50 类、散点 ≤1000 点；多图表设 `animation: false`；筛选触发更新用 `chart.update('none')` 关动画。
- **DOM 性能**：表格可见行控制在 100–200，更多用分页（`renderTablePage(data, page, 50)`，显示"Showing 1-50 of N"）；筛选时只更新变化元素，勿重建整个 DOM。
- 自包含文件可直接发文件分享；可按需求请求"暗色模式/演示模式"或指定品牌配色。

## 互见

- 同属"数据/misc"域的其他可视化与报表类技能。
- 取数环节若涉及飞书多维表格，可配合 `lark-base`；导出/分享文件可配合 `lark-drive`。

---

采编自 anthropics/knowledge-work-plugins 的 `build-dashboard` 技能（Apache-2.0 许可）。
