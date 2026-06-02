---
name: dask-distributed-dataframes
title: Dask 超内存分布式计算
description: 当 pandas/NumPy 工作流超出内存或需跨核/跨机并行（约 100GiB 单机到 100TiB 集群）时使用；用 Dask 的 DataFrame/Array/Bag/Futures 构建惰性任务图并行执行，产出聚合结果或 Parquet/Zarr 落地；不适用于内存可容纳追求极速（用 polars）或单机核外分析（用 vaex）。触发词：dask、超内存、larger-than-RAM、并行、分布式、map_partitions
domain: 数据/pipeline
triggers: [dask, 超内存 larger-than-RAM, 并行处理, 分布式计算, pandas 扩展, NumPy 扩展, dask.dataframe, dask.array, dask.bag, Futures 任务图, map_partitions, compute 惰性求值, 集群 cluster, Parquet/Zarr 大数据]
tags: [数据, misc, dask, distributed, larger-than-RAM, parallel, dataframe, array, futures, etl]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, dask, distributed, pyarrow, uv]
requires: []
related: [polars-dataframe, spark-job-optimization, zarr-chunked-arrays, snowflake-development]
combines_with: [matplotlib-visualization, scikit-learn-ml]
license: MIT
source: K-Dense-AI/scientific-agent-skills
source_license: MIT
---
# Dask 超内存分布式计算

## 何时使用

适用场景：

- 数据超出可用内存（larger-than-RAM），需在单机做核外（out-of-core）计算（单机约可处理 ~100GiB，集群可达 ~100TiB）。
- 想把已有 pandas / NumPy 代码扩展到更大数据或跨多核/多机并行，沿用熟悉的 Python API。
- 批量处理多文件（CSV/Parquet/JSON/日志），或构建带任务依赖的自定义并行工作流。

不该用的边界：

- 数据能装进内存、只追求单机极速 → 用 `polars-dataframe`（表达式 + 并行更快）。
- 单机核外分析、不需要集群 → 可考虑 vaex。
- 先想更简单方案：换更好算法、用 Parquet 代替 CSV、Numba/Cython 编译、或数据采样，往往比上 Dask 划算。
- 不替代针对具体环境的校验、测试与专家评审；缺输入/权限/成功标准时先停下澄清。

## 步骤 / 指令

1. 安装：`uv pip install "dask[complete]"`（含分布式调度器与 dashboard）；远程对象存储另装 `s3fs`（s3://）或 `gcsfs`（gs://）。要求 Python 3.10+，DataFrame I/O 需 PyArrow 16+。
2. 自 2025.1.0 起，表达式式 DataFrame API（带查询规划）是唯一实现——**不要**再单独装 `dask-expr` 或设 `dataframe.query-planning: False`。
3. 按数据类型选组件：表格→DataFrame；数值数组→Array；文本/JSON/日志→Bag（清洗后转 DataFrame）；自定义动态任务→Futures。
4. 让 Dask 自己读数据（如 `dd.read_csv('data/2024-*.csv')`），**不要**先 pandas 读全量再 `from_pandas`。
5. 操作是惰性的，构建任务图直到 `.compute()` 才执行；多个结果用 `dask.compute(*xs)` 一次算完，别在循环里反复 `.compute()`。
6. 选合适分块/分区：目标 ~100MB/块（约每核 10 块）；过大爆内存、过小调度开销大；任务数百万时增大块或用 `map_partitions`/`map_blocks` 融合操作。
7. 选调度器：数值/释放 GIL 的库用 threads（默认，~10µs/task）；纯 Python 用 processes（~10ms/task）；调试用 synchronous（可用 pdb）；要监控/集群用 distributed（`Client()`，~1ms/task）。
8. 开 dashboard 定位瓶颈：`client = Client(); print(client.dashboard_link)`。
9. 落地用列式格式：`to_parquet` / `to_zarr`（比 CSV 高效）。

迭代开发：先 `dask.config.set(scheduler='synchronous')` 小数据 + pdb 调试 → `ddf.head(1000)` 抽样验证逻辑 → 上 distributed 全量并监控。

## 示例

DataFrame（多文件 + 惰性聚合）：
```python
import dask.dataframe as dd
ddf = dd.read_csv('data/2024-*.csv')        # 多文件读成一个 DataFrame
filtered = ddf[ddf['value'] > 100]          # 惰性
result = filtered.groupby('category').mean().compute()
```

ETL 管道并写 Parquet：
```python
ddf = dd.read_csv('raw_data/*.csv')
ddf = ddf[ddf['status'] == 'valid']
ddf = ddf.dropna(subset=['important_col'])
summary = ddf.groupby('category').agg({'amount': ['sum', 'mean']})
summary.to_parquet('output/summary.parquet')
```

Array（分块 NumPy）：
```python
import dask.array as da
x = da.random.random((100000, 100000), chunks=(10000, 10000))
z = (x + 100).mean(axis=0)
result = z.compute()                         # 块上并行；用 map_blocks 做缺失操作
```

Bag → DataFrame（非结构化清洗后转结构化）：
```python
import dask.bag as db, json
bag = db.read_text('logs/*.json').map(json.loads)
bag = bag.filter(lambda x: x['status'] == 'valid')
ddf = bag.to_dataframe()                     # 聚合用 foldby 优于 groupby
result = ddf.groupby('category').mean().compute()
```

Futures（自定义并行 + 预分发大数据）：
```python
from dask.distributed import Client
client = Client()
data = client.scatter(large_dataset)         # 大数据只 scatter 一次
futures = [client.submit(process, data, p) for p in parameters]
results = client.gather(futures)             # 提交即执行，非惰性
```

## 注意事项

- 别先本地 pandas 读全量再交给 Dask——会先把全部数据塞内存，失去意义；让 Dask 直接 `read_*`。
- 别在循环里反复 `.compute()`；合并成 `dask.compute(*computations)` 一次算。
- 别建超大任务图：`len(ddf.__dask_graph__())` 查任务数，百万级就增大块或 `map_partitions`/`map_blocks` 融合。
- 分块大小是性能关键：~100MB/块；内存错误先减小块、酌情 `persist()` 用完即删、排查自定义函数内存泄漏。
- 慢启动多因任务图太大；并行差常因块太大、threads 跑纯 Python（改 processes）或数据依赖阻塞并行。
- Futures 单任务约 1ms 开销，不适合百万级极小任务；有状态工作流用 actors，纯 Python 选 processes。
- 文件格式：Parquet/HDF5/Zarr（列式、压缩、并行友好）优先；CSV 仅用于初始摄入。
- 集合互转：`bag.to_dataframe()`、`ddf.to_dask_array(lengths=True)`、`dd.from_dask_array(arr, columns=[...])`。

## 互见

- requires：无。
- related：`polars-dataframe`（内存内极速，数据装得下时优先）；`spark-job-optimization`（更大规模/JVM 生态的分布式批处理）；`scikit-learn-ml`（配 Dask-ML 做分布式训练）。
- combines_with：`csv-data-cleaner`（清洗后再上 Dask 扩展规模）；`matplotlib-visualization` / `seaborn-statistical-charts`（对 `.compute()` 结果或抽样做可视化）。

---
采编自 K-Dense-AI/scientific-agent-skills（MIT 许可）；该技能内容原署 K-Dense Inc.，原始声明为 BSD-3-Clause，基于 dask/dask，均可再分发。
