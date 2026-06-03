---
name: polars-dataframe
title: Polars 高性能数据框
description: 当处理内存可容纳（约 1-100GB）但 pandas 太慢的表格数据、构建 ETL/分析管道或从 pandas 迁移时使用；做表达式式列变换、惰性查询优化与并行聚合，产出 DataFrame/LazyFrame 及 CSV/Parquet 结果；不适用于超出内存的数据（改用 dask/vaex）。触发词：polars、惰性求求值、pandas 替代
domain: 数据/wrangling
triggers: [polars, 高性能数据框, pandas 太慢, 惰性求值 LazyFrame, scan_csv collect, 表达式 pl.col, group_by 聚合, Parquet 读写, pandas 迁移 Polars, ETL 管道]
tags: [数据, misc, polars, dataframe, etl, lazy-evaluation, arrow, pandas-migration]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, polars, uv]
requires: []
related: [csv-data-cleaner, jq-json-processing, spark-job-optimization, scikit-learn-ml]
combines_with: [csv-data-cleaner, matplotlib-visualization, scikit-learn-ml]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 表格数据能装进内存（约 1-100GB），但 pandas 处理太慢，需要更快的内存级数据框工作流。
- 构建 ETL、分析或转换管道，希望借助惰性求值（lazy）与并行执行做查询优化。
- 想在 Apache Arrow 语义之上用表达式（expression）式 API 做列运算。

不该用的边界：
- 数据量超出内存（larger-than-RAM）：改用 dask 或 vaex。
- 任务与上述范围不明确匹配时不要套用；缺少必要输入、权限或成功标准时先停下来澄清。
- 产物不替代针对具体环境的校验、测试与专家评审。

## 步骤 / 指令

1. 安装：`uv pip install polars`，`import polars as pl`。
2. 选择求值模式：小数据用 eager（`pl.read_csv`，立即执行）；大数据/复杂管道用 lazy（`pl.scan_csv` → 链式变换 → `.collect()`），享受谓词下推、投影下推与并行。
3. 用表达式构建变换：以 `pl.col("列名")` 引用列，链式方法组合；表达式只在上下文（select / with_columns / filter / group_by）中执行。
4. 组装管道：select 选列、filter 过滤、with_columns 加列、group_by().agg() 聚合、join/concat/pivot 做转换。
5. 落地结果：写出 `write_csv` / `write_parquet`（性能优先选 Parquet）。

## 示例

创建与基础操作：
```python
import polars as pl
df = pl.DataFrame({
    "name": ["Alice", "Bob", "Charlie"],
    "age": [25, 30, 35],
    "city": ["NY", "LA", "SF"],
})
df.select("name", "age")                       # 选列
df.filter(pl.col("age") > 25)                  # 过滤
df.with_columns(age_plus_10=pl.col("age") + 10)  # 加列
```

惰性管道（大文件首选）：
```python
lf = pl.scan_csv("file.csv")                   # 不立即读取
result = lf.filter(pl.col("age") > 25).select("name", "age")
df = result.collect()                          # 执行优化后的查询
```

聚合与窗口函数（`over` 保留行数）：
```python
df.group_by("city").agg(
    pl.col("age").mean().alias("avg_age"),
    pl.len().alias("count"),
)
df.with_columns(
    avg_age_by_city=pl.col("age").mean().over("city"),
)
```

pandas → Polars 常见映射：
| 操作 | Pandas | Polars |
|------|--------|--------|
| 选列 | `df["col"]` | `df.select("col")` |
| 过滤 | `df[df["col"] > 10]` | `df.filter(pl.col("col") > 10)` |
| 加列 | `df.assign(x=...)` | `df.with_columns(x=...)` |
| 分组 | `df.groupby("c").agg(...)` | `df.group_by("c").agg(...)` |
| 窗口 | `df.groupby("c").transform(...)` | `df.with_columns(...).over("c")` |

## 注意事项

- 大数据用 lazy（`scan_csv` 而非 `read_csv`），超大数据可 `lf.collect(streaming=True)` 流式执行。
- 尽早只选需要的列（`lf.select("c1","c2").filter(...)` 优于先 filter 全列）。
- 热路径上避免 Python 函数，留在表达式 API 内才能并行；`.map_elements()` 仅在必要时用。
- Polars 与 pandas 概念差异：无索引（仅整数位置）、严格类型（无静默转换）、默认并行。
- 选合适数据类型：低基数字符串用 Categorical、整数选合适位宽（i32 vs i64）、时间用日期类型。
- 多条件 filter 用逗号分隔比 `&` 更清晰：`df.filter(pl.col("age")>25, pl.col("city")=="NY")`。
- 条件表达式 `pl.when(cond).then(v).otherwise(o)`；空值处理 `fill_null` / `is_null` / `drop_nulls`。

## 互见

- 超出内存的数据集：dask、vaex。
- 上游/下游：pandas（迁移来源）、Apache Arrow（底层格式）、Parquet（推荐落地格式）。
- 源 skill 自带参考文档（core_concepts / operations / pandas_migration / io_guide / transformations / best_practices），需要细节时可回查。

---
采编自 sickn33/antigravity-awesome-skills（MIT），原 skill 作者 K-Dense Inc.，基于 pola-rs/polars。
