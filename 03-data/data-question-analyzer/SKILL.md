---
name: data-question-analyzer
title: 数据问题分析（从速查到正式报告）
description: 当回答数据类问题时使用——从查单个指标、归因某趋势/下跌、跨细分跨时间对比，到给干系人写正式数据报告；做按复杂度三档（速查/全量分析/正式报告）取数→分析→交付前校验→分层呈现→按需可视化，产出含口径与注意事项的结论；不适用于纯写 SQL（用 sql-query-builder）、陌生表先画像（用 dataset-profiler）、只搭可视化（用 html-dashboard-builder/matplotlib）。触发词：分析、数据问题、是什么在驱动、为什么下跌、对比、季度复盘、出个报告
domain: 数据/analysis
triggers: [分析数据, 数据问题, 是什么在驱动, 为什么下跌 增长, 查个指标, 跨细分对比, 趋势分析, 季度业务复盘, 出个数据报告, 归因分析, 找出原因, 拆解一下]
tags: [数据, analysis, 数据分析, 归因, 趋势分析, 数据报告, 干系人汇报, 取数]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [sql, python]
requires: []
related: [analysis-qa-validator, data-quality-validator, kpi-dashboard-design, sql-query-builder]
combines_with: [html-dashboard-builder, matplotlib-visualization]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
## 何时使用

回答任意「数据问题」的统一入口，先判复杂度再选深度：

- 速查：单指标、简单筛选、事实查找。例「上周新增用户多少？」
- 全量分析：多维探索、趋势归因、跨细分对比。例「转化率下跌是什么在驱动？按渠道、设备拆。」
- 正式报告：含方法论、口径、注意事项与建议的完整调研。例「准备订阅指标的季度业务复盘。」

不该用的边界：
- 只需把自然语言转成 SQL / 排错慢查询 → 用 sql-query-builder。
- 拿到陌生表、动手前要先摸清形状与质量 → 用 dataset-profiler（探查画像）。
- 只是要把现成结果做成图/仪表盘 → 用 matplotlib-visualization 或 html-dashboard-builder。
- 已有分析成稿、只想交付前质检挑错 → 用 analysis-qa-validator。
- 训练模型 / 统计建模与显著性检验为主 → 用 statsmodels-statistical-modeling、scikit-learn-ml。

## 步骤 / 指令

```
1. 读懂问题
   - 定复杂度：速查 | 全量分析 | 正式报告（决定后续投入与产出形态）
   - 定数据需求：哪些表/指标/维度/时间范围
   - 定输出形态：数字 | 表格 | 图 | 叙述 | 组合
2. 取数
   - 接了数仓 MCP：探 schema 找表列 → 写 SQL → 执行取数 →
     失败就调试重试（核对列名、表引用、方言语法）→ 结果异常先做合理性检查
   - 没接数仓：请用户①直接粘结果 ②传 CSV/Excel ③描述 schema 由你写查询给他跑；
     需手动执行的查询交给 sql-query-builder 出方言最佳实践
3. 分析
   - 算指标、聚合、对比；找模式、趋势、离群、异常
   - 跨维度对比（时间段 / 细分 / 类别）
   - 复杂问题拆成子问题，逐个回答
4. 交付前校验（每条过一遍，存疑就深挖并标注注意事项）
   - 行数合理性：记录条数说得通吗？
   - 空值检查：有无意外 NULL 会扭曲结果？
   - 量级检查：数字落在合理区间吗？
   - 趋势连续性：时间序列有无异常断档？
   - 聚合逻辑：小计能正确汇总成总计吗？
5. 分层呈现（按复杂度选模板，见下）
6. 按需可视化：图比表更能说明问题时，选对图型再画/搭仪表盘
```

呈现模板：

```
速查    → 直接给答案 + 必要上下文；附所用查询（代码块/折叠）便于复现
全量分析 → 先抛核心结论 → 数据表/图佐证 → 注明方法论与注意事项 → 给后续追问建议
正式报告 → 执行摘要(关键结论) / 方法论(思路+数据源) / 详细发现(证据) /
          注意事项·局限·数据质量 / 建议与下一步
```

## 示例

速查：

```
上周（按自然周）有多少新用户注册？给出数字，并附所用 SQL。
```

全量分析：

```
近 3 个月工单量为什么上升？按 类别 与 优先级 两个维度拆开，
先给核心结论，再用表/图佐证，最后列 2-3 个值得追问的方向。
```

正式报告：

```
对客户表做一次数据质量评估：完整性、一致性，以及应处理的问题。
按 执行摘要 / 方法论 / 详细发现 / 注意事项 / 建议 五段输出。
```

给 Agent 的取数追问模板（无数仓时）：

```
我没接数仓。请用以下任一方式给我数据：① 直接粘查询结果；
② 传 CSV/Excel；③ 描述表结构(列名+类型)，我写 SQL 你来跑。
```

## 注意事项

- 尽量把时间范围、细分、指标说清楚；知道表名就报出来，能显著加速取数。
- 结果先验证再呈现：任何一项校验存疑都要回头查清，并在交付物里明写口径与注意事项，别带病结论上会。
- 常见口径坑：同比/环比基准对齐、不完整周期对比、JOIN 膨胀致计数翻倍、`均值的均值`、幸存者偏差、`NOT IN` 含 NULL 返回空集。
- 复杂问题拆成多条查询/子问题逐个攻克，别用一条巨型 SQL 兜全部。
- 写操作（INSERT/UPDATE/DELETE/DDL）只在用户显式确认、并给出影响行数估计后才执行；本技能默认只产出 SELECT 与分析结论。

## 互见

- requires：无。
- related：`sql-query-builder` —— 取数环节的 SQL 编写与排错；`dataset-profiler` —— 动手分析前先做探查画像。
- combines_with：`analysis-qa-validator` —— 交付前对方法论/计算/结论做质检评级；`html-dashboard-builder`、`matplotlib-visualization` —— 把结论做成仪表盘或出版级图表。

---

采编自 anthropics/knowledge-work-plugins（Apache-2.0）。
