---
name: sql-query-builder
title: SQL 查询构建
description: 当需要把自然语言需求转成正确高效的 SQL、做联表/聚合/窗口查询或排错时使用；触发词：写 SQL、查询、联表、聚合、窗口函数、慢查询。
domain: 数据/sql
tags: [sql, database, query]
level: 进阶
status: stable
version: 0.1.0
agents: [claude-code, codex, cursor, gemini-cli]
tools: [sql]
requires: []
related: [erd-schema-designer, postgresql-optimization, dbt-transformation-modeler, snowflake-development]
combines_with: [postgresql-optimization, kpi-dashboard-design, dbt-transformation-modeler]
license: CC-BY-SA-4.0
---
## 何时使用

- 把自然语言需求翻译成可执行 SQL：筛选、联表、聚合、分组、排序、分页。
- 编写多表 JOIN、窗口函数（排名/累计/同环比/去重取最新）、子查询/CTE。
- 排查错误 SQL 或慢查询：定位结果不对、性能瓶颈、索引未命中。

不该用的边界：
- 数据已在本地 CSV/脏数据、需清洗去重而非查库 → 用 csv-data-cleaner。
- 表结构未知且无法查到 schema → 先要 DDL 或 `information_schema`，不要凭空猜列名。
- 涉及写操作（INSERT/UPDATE/DELETE/DDL）批量改库 → 本技能只产出，执行前须用户确认，不自动跑。

## 步骤 / 指令

```
1. 确认方言与 schema
   - 方言：postgres | mysql | sqlite | sqlserver | bigquery（默认 postgres）
   - 表/列：要到 DDL 或读 information_schema.columns；缺失则停下追问，不臆造列名
2. 拆解需求 → 映射子句
   - 输出哪些列/指标         → SELECT
   - 涉及哪些表、连接键、连接类型 → FROM / JOIN（默认 INNER；要保留左表全集用 LEFT）
   - 过滤条件（行级，聚合前）  → WHERE
   - 分组维度               → GROUP BY
   - 过滤条件（聚合后）      → HAVING
   - 排序、Top-N / 分页      → ORDER BY / LIMIT OFFSET
3. 需要"组内排名/累计/取最新一条"→ 用窗口函数，不要相关子查询
   - ROW_NUMBER()/RANK()/SUM() OVER (PARTITION BY ... ORDER BY ...)
   - 去重取最新：子查询里打 ROW_NUMBER 后外层 WHERE rn=1
4. 嵌套逻辑 → 用 CTE（WITH）拆分，每个 CTE 单一职责，自顶向下可读
5. 自检（产出前逐条过）
   - JOIN 是否漏写 ON / 笛卡尔积？多对多是否导致计数翻倍？
   - SELECT 非聚合列是否都在 GROUP BY？
   - NULL：外连接后的 NULL、NOT IN 含 NULL 陷阱、COUNT(col) 忽略 NULL
   - 聚合条件错放 WHERE（应 HAVING）或反之？
   - 分页有 ORDER BY 保证稳定顺序？
6. 慢查询排查
   - 跑 EXPLAIN / EXPLAIN ANALYZE，看是否 Seq Scan / 全表扫描、行数估算偏差
   - 检查 WHERE/JOIN 列是否有索引；避免在索引列上套函数（如 DATE(col)）导致失效
   - SELECT * → 改为只取所需列；用 EXISTS 替代低效 IN 子查询
```

## 示例

需求："按部门统计 2024 年在职员工平均薪资，只看人数≥5 的部门，从高到低排。"

```sql
-- postgres
SELECT d.name AS dept,
       COUNT(*)            AS headcount,
       ROUND(AVG(e.salary)) AS avg_salary
FROM employees e
JOIN departments d ON d.id = e.dept_id
WHERE e.status = 'active'
  AND e.hire_date < DATE '2025-01-01'
GROUP BY d.name
HAVING COUNT(*) >= 5
ORDER BY avg_salary DESC;
```

窗口函数 —— 每个客户的最近一笔订单：

```sql
WITH ranked AS (
  SELECT o.*,
         ROW_NUMBER() OVER (PARTITION BY customer_id
                            ORDER BY created_at DESC) AS rn
  FROM orders o
)
SELECT customer_id, id AS order_id, amount, created_at
FROM ranked
WHERE rn = 1;
```

给 Agent 的提示词模板：

```
方言=postgres。表 orders(id,customer_id,amount,created_at,status)。
需求：<自然语言>。
要求：用 CTE 拆分；只取必要列；产出后附 EXPLAIN 关注点。
```

## 注意事项

- 先确认方言：LIMIT/OFFSET vs TOP、字符串拼接、日期函数、布尔类型各方言不同。
- 列名/表名不确定就追问，绝不编造；带保留字或大小写敏感时加引号。
- 多对多 JOIN 会放大聚合值，必要时先在子查询里去重再聚合。
- `NOT IN (子查询)` 当子查询含 NULL 时整体返回空集，改用 `NOT EXISTS`。
- 浮点除法注意整数除零与精度，按需 CAST；金额避免用 FLOAT。
- 大表分页用 keyset 分页（WHERE id > last_id）替代大 OFFSET。
- 仅产出 SELECT 查询；写操作必须用户显式确认且给出影响行数估计后才执行。

## 互见

- requires：无。
- related：无。
- combines_with：csv-data-cleaner —— 查询结果导出后或需先清洗本地数据时衔接。
