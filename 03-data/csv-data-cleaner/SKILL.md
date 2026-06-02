---
name: csv-data-cleaner
title: CSV 数据清洗
description: 当需要清洗 CSV/表格数据——去重、缺失值处理、类型规整、异常值、列标准化时使用；触发词：数据清洗、去重、缺失值、脏数据、规整。
domain: 数据/wrangling
tags: [data, cleaning, csv, pandas]
level: 入门
status: stable
version: 0.1.0
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, pandas]
requires: []
related: [dataset-quality-auditor, data-quality-validator, polars-dataframe, data-quality-frameworks]
combines_with: [polars-dataframe, dataset-quality-auditor, matplotlib-visualization]
license: CC-BY-SA-4.0
---
## 何时使用

- 拿到 CSV/TSV/Excel 导出表，需要在分析或入库前做清洗：去重、缺失值处理、类型规整、异常值识别、列名/取值标准化。
- 触发词：数据清洗、去重、缺失值、脏数据、规整、列标准化、异常值。
- 单文件或一批同构文件的离线/批处理清洗。

不该用：
- 已在数据库内的数据做查询/连接/聚合 → 用 `sql-query-builder`。
- 流式/实时数据管道、增量 ETL 调度。
- 文件超内存（数 GB+）需分块/分布式时，本技能仅给单机思路，按需改用分块读取。
- 业务规则校验、跨表外键一致性等强语义校验（本技能只做结构与基础质量清洗）。

## 步骤 / 指令

按序执行，每步先观察再动手，避免盲目改写：

1. 探查（只读）：读取前若干行 + dtypes + 行列数 + 缺失率，确认分隔符、编码、表头位置。
2. 列标准化：列名去空格、统一小写下划线（snake_case）、去重命名。
3. 去重：先定位重复（全行或指定键列），确认后再删；记录删除条数。
4. 类型规整：数值/日期/布尔列显式转换；转换失败的值标记而非静默丢弃。
5. 缺失值：按列决定策略——删行、填充（均值/中位数/众数/常量/前后向）、或保留为显式空值；统一空表示（"", "NA", "null", "-" → NaN）。
6. 文本规整：去首尾空白、统一大小写/全半角、归并同义取值（如 "男/M/1"）。
7. 异常值：数值列用 IQR 或 z-score 标记离群；默认仅标记，不静默删除，交由人确认。
8. 校验与输出：复查缺失率/重复数/dtypes；写出清洗后文件 + 一份变更摘要（每步影响行数）。

伪代码：
```
df = read(path, encoding=detect, sep=detect)
report.before = profile(df)            # shape, null_rate, dtypes
df.columns = snake_case(strip(cols)); dedup_col_names()
df = df.drop_duplicates(subset=keys)   # keys 默认全列
for col in typed_cols: df[col] = safe_cast(col, target_type)  # 失败→NaN+flag
df = unify_missing_tokens(df)          # "","NA","null","-" → NaN
df = fill_or_drop_missing(df, strategy_per_col)
df = strip_and_normalize_text(df)
outliers = flag_outliers(df, method="iqr")   # 仅标记
report.after = profile(df)
write(df, out_path); write(report, summary_path)
```

## 示例

最小可用（pandas）：
```python
import pandas as pd, numpy as np, re

df = pd.read_csv("raw.csv", encoding="utf-8", na_values=["", "NA", "null", "-", "N/A"])

# 列标准化
df.columns = [re.sub(r"\W+", "_", c.strip().lower()).strip("_") for c in df.columns]

# 去重（按全行）
before = len(df); df = df.drop_duplicates(); print("去重:", before - len(df))

# 类型规整：转换失败置 NaN
df["amount"] = pd.to_numeric(df["amount"], errors="coerce")
df["created_at"] = pd.to_datetime(df["created_at"], errors="coerce")

# 文本规整 + 取值归并
df["gender"] = (df["gender"].astype("string").str.strip().str.upper()
                .replace({"M": "男", "1": "男", "F": "女", "0": "女"}))

# 缺失值：数值列填中位数，类别列填众数
df["amount"] = df["amount"].fillna(df["amount"].median())

# 异常值：IQR 仅标记
q1, q3 = df["amount"].quantile([.25, .75]); iqr = q3 - q1
df["amount_outlier"] = ~df["amount"].between(q1 - 1.5*iqr, q3 + 1.5*iqr)

df.to_csv("clean.csv", index=False, encoding="utf-8-sig")
print(df.isna().mean().round(3))  # 复查缺失率
```

委托提示词（给 Agent 调用时）：
> 清洗 `raw.csv`：先输出探查报告（行列数/各列缺失率/dtypes），再按 列标准化→去重→类型规整→缺失值→文本规整→异常值标记 顺序处理，异常值只标记不删除，最后输出 `clean.csv` 和每步影响行数的摘要。

## 注意事项

- 不就地覆盖源文件；输出到新文件，保留原始数据可回溯。
- 删除/填充前先打印将受影响的行数并确认；破坏性操作要可解释。
- 类型转换用 `errors="coerce"`，转换失败的值显式置空并可标记，禁止静默丢弃整行。
- 异常值默认只标记不删除——离群不等于错误。
- 中文/Excel 导出常见编码坑：读用 `utf-8` 失败则试 `gbk`/`utf-8-sig`，输出用 `utf-8-sig` 避免 Excel 乱码。
- 统一空值表示（"", "NA", "null", "-" 等）后再判断缺失，否则缺失率失真。
- 浮点列去重前注意精度；日期列注意时区与多格式混排。
- 大文件用 `chunksize` 分块或先抽样验证策略，再全量跑。

## 互见

- requires：无。
- related：`sql-query-builder`（数据已入库或清洗后需查询/连接/聚合时改用它）。
- combines_with：无。
