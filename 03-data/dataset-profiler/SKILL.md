---
name: dataset-profiler
title: 数据集探查画像
description: 当拿到陌生表/文件、动手分析前要先摸清其形状、质量与规律时使用；做全表+逐列画像（行列/粒度/主键、空值率、基数、分布、Top/Bottom 值），分类列角色、标记质量隐患，产出画像摘要表+问题清单+可跟进分析建议；不适用于深度修复清洗、设计 schema、搭 ETL 管道。触发词：数据画像、探查数据、profiling、空值率、基数分布、新表先看什么、该用哪些维度指标
domain: 数据/wrangling
triggers: [数据画像, 探查数据集 explore data, profiling, 新表先看什么, 摸清数据形状, 空值率 null rate, 基数 cardinality, 列分布 distribution, 重复值 占位值检测, 该选哪些维度和指标, 建议跟进分析, 数据集概览 overview]
tags: [数据, analysis, 数据画像, profiling, 探索性分析, 数据质量, 维度指标]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [sql, python3, pandas, polars]
requires: []
related: [dataset-quality-auditor, data-quality-validator, analysis-qa-validator, csv-data-cleaner]
combines_with: [csv-data-cleaner, statsmodels-statistical-modeling, matplotlib-visualization]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
## 何时使用

适用于：第一次接触一张表或一个上传文件，在写具体查询/做正式分析**之前**，快速建立"这数据长什么样、能不能信、值得从哪切入"的全局认知。典型请求：

- "帮我探查/画像一下这张表（或这个 CSV/Parquet/Excel/JSON）" → 输出概览 + 逐列画像 + 质量隐患 + 跟进建议。
- "这份数据该用哪些维度和指标来分析？" → 输出推荐维度列、关键指标列、可做趋势的时间列。
- "这表能直接用吗 / 有没有坑？" → 输出按严重度标记的质量问题清单。

不该用（负边界）：
- 要**深度清洗/修复**并打数据质量分（DQS）、判缺失机制 → 用 `dataset-quality-auditor`。
- 要**设计或优化 schema / 范式 / ER 图** → 用 `erd-schema-designer`。
- 要**搭建 ETL 管道本身** → 用数据管道类技能。

定位：本技能是"先看一眼"的探查层，输出是地图而非治理方案；发现需要动手修的问题就转交质量审计。

## 步骤

**1. 接入数据**
- 接了数仓 MCP：解析表名（处理 schema 前缀，歧义则列候选）→ 取元数据（列名/类型/注释）→ 对活数据跑画像查询。
- 给了文件（CSV/Excel/Parquet/JSON）：读入工作数据集，从数据推断列类型。
- 都没有：请用户给表名或上传文件；若只描述了 schema，则给出"该跑哪些画像查询"的指引。

**2. 摸清结构（分析前必答）**
- 表级：多少行/列？粒度=一行代表什么？主键是哪列、唯一吗？最近更新时间？数据回溯到多早？
- 列角色分类，每列归一类：**标识符**（主键/外键/实体 ID）·**维度**（status/type/region 等类别属性）·**指标**（金额/计数/时长/分数）·**时间**（created_at 等）·**文本**（自由文本）·**布尔**·**结构化**（JSON/数组/嵌套）。

**3. 生成画像（按列类型跑对应检查）**
- 全部列：空值数与空值率、distinct 数与基数比（distinct/total）、Top 5–10 高频值、Bottom 5 低频值（抓异常）。
- 数值列：min/max/mean/median、标准差、分位数 p1/p5/p25/p75/p95/p99、零值数、（异常时）负值数。
- 字符串列：min/max/avg 长度、空串数、格式/正则规律、大小写一致性、首尾空格数。
- 日期列：min/max 日期、空日期、（异常时）未来日期、按月/周分布、时间序列缺口。
- 布尔列：true/false/null 计数、true 率。
- **按列类型分组（维度/指标/日期/ID），用整洁摘要表呈现。**

**4. 标记质量隐患（启发式，每条值得快速一看）**
- 高空值率：>5% 警告、>20% 告警。
- 基数反常：本该高基数的 `user_id` 只有 50 个值（或本该类别的列基数爆炸）。
- 可疑值：本应为正却现负数、历史数据里出现未来日期、占位值（`N/A`/`TBD`/`test`/`999999`）。
- 重复：是否存在自然键，该键是否有重复。
- 分布偏斜：极偏分布会扭曲均值。
- 编码问题：类别字段大小写混用、首尾空格、格式不统一。

**5. 发现关系与规律** → 外键候选、层级（country>state>city）、数值列相关、派生列、冗余列。

**6. 推荐维度与指标** → 适合切片的维度列（基数 3–50）、有意义分布的指标列、可做趋势的时间列、潜在 join 键。

**7. 给出 3–5 条可跟进分析**，例如："按 [time] 对 [metric] 做趋势、再按 [dimension] 拆分"、"对 [偏斜列] 做分布深挖找离群"、"[metric_a] 与 [metric_b] 相关性分析"。

## 指令

数仓接入时用以下 SQL 探查 schema（PostgreSQL 示例，其它库语法相近）：

```sql
-- 列出某 schema 下所有表
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 列详情（类型 / 是否可空 / 默认值）
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'my_table'
ORDER BY ordinal_position;

-- 表大小
SELECT relname, pg_size_pretty(pg_total_relation_size(relid))
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;

-- 行数：逐表 SELECT COUNT(*) FROM <table>
```

文件用 pandas/polars：`df.shape`、`df.dtypes`、`df.describe()`、`df.isna().mean()`（空值率）、`df.nunique()`（基数）、`df[col].value_counts().head(10)`（Top 值）。

**完整性分级**（每列打色）：🟢 Complete >99% 非空 · 🟡 Mostly 95–99%（查空值来源）· 🟠 Incomplete 80–95%（搞清是否要紧）· 🔴 Sparse <80%（不填补恐不可用）。

**分布形态识别**（数值列）：正态（均值≈中位、钟形）· 右偏（高值长尾，营收/会话时长常见）· 左偏 · 双峰（两个总体）· 幂律（少量极大、大量极小，用户活跃度常见）· 均匀（常为合成/随机）。

## 示例

输出统一用此结构：

```
## Data Profile: [table_name]

### Overview
- Rows: 2,340,891
- Columns: 23 (8 dimensions, 6 metrics, 4 dates, 5 IDs)
- Date range: 2021-03-15 to 2024-01-22

### Column Details
[按列类型分组的摘要表]

### Data Quality Issues
[带严重度标记的问题清单]

### Recommended Explorations
[编号的跟进分析建议]
```

需要沉淀给团队复用时，补一份 schema 文档：表描述、粒度、主键、行数(含日期)、更新频率、负责人，再用「列 | 类型 | 描述 | 示例值 | 备注」表格列出关键列，并记下 join 关系与已知坑。

## 注意事项

- **超大表（100M+ 行）默认抽样画像**，需要精确计数时务必显式说明。
- **质量标记是启发式**——不是每个旗标都是真问题，但每个都值得快速一看。
- 一致性深查：同概念多种写法（`USA`/`US`/`United States`/`us`）、数字存成字符串、跨列矛盾（`status=completed` 但 `completed_at` 为空）、外键对不上父记录。
- 准确性红旗：占位值（`0`/`-1`/`999999`/`N/A`/`test`）、某单值频率异常高（默认值）、不可能值（年龄>150、负时长、远期日期）、整数尾全是 0/5（暗示估算非测量）。
- 相关 ≠ 因果：报告强相关（|r|>0.7）时必须显式声明这点。
- 本技能只"看"不"改"——发现需要动手修的问题，转交 `dataset-quality-auditor`，不要在探查阶段擅自清洗。

## 互见

- related：`dataset-quality-auditor` —— 探查发现问题后，转它做五维审计 + DQS 评分 + 修复方案。
- related：`csv-data-cleaner` —— 画像暴露脏数据后用它清洗整形。
- related：`erd-schema-designer` —— 问题根因在 schema/关系设计时转它。
- combines_with：`sql-query-builder` —— 探查结论落成具体取数查询。
- combines_with：`kpi-dashboard-design` —— 用推荐出的维度/指标搭看板。
- combines_with：`matplotlib-visualization` / `polars-dataframe` —— 画分布图、跑高效逐列画像。

---
采编自 anthropics/knowledge-work-plugins（Apache-2.0 许可证）。
