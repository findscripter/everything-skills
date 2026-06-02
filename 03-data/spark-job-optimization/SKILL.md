---
name: spark-job-optimization
title: Apache Spark 作业性能调优
description: 当 Spark 作业慢、出现数据倾斜/shuffle 瓶颈/OOM，或需为大数据量管道做分区、缓存、Join、内存与 AQE 调优时使用；按「诊断→分区→Join→缓存→shuffle→内存→格式→验证」产出可执行 PySpark 代码与生产配置；不适用于非 Spark 引擎（Flink/Trino/单机 pandas/Polars）或与性能无关的纯 ETL 逻辑编写。触发词：Spark 慢、数据倾斜、shuffle 优化、broadcast join、AQE、executor 内存、repartition、Kryo
domain: 数据/pipeline
triggers: [Spark 慢作业, 数据倾斜 data skew, shuffle 优化, broadcast join 广播连接, AQE 自适应执行, executor 内存 OOM, repartition coalesce, Kryo 序列化, 分区调优 partition, explain 执行计划, salting 加盐, bucket join 分桶]
tags: [spark, pyspark, data-pipeline, performance, shuffle, data-skew, partitioning, memory-tuning, aqe, pipeline]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, pyspark, spark-sql, parquet, delta-lake]
requires: []
related: [data-pipeline-engineer, polars-dataframe, airflow-dag-builder, snowflake-development]
combines_with: [data-pipeline-engineer, airflow-dag-builder, data-quality-validator]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
# Apache Spark 作业性能调优

> domain: 数据/pipeline · name: spark-job-optimization

## 何时使用

- Spark 作业运行慢、stage 卡顿、task 耗时长尾，或出现 OOM/磁盘 spill/频繁 GC。
- 大数据量管道需要在分区、Join、缓存、shuffle、内存、文件格式层面系统性调优。
- 排查数据倾斜（少数 task 远慢于其余）、reduce 端 shuffle 过大。

不该用的边界：

- 非 Spark 引擎（Flink、Trino/Presto、Dask、单机 pandas/Polars）—— 调优手段不通用。
- 只是写业务 ETL 逻辑、没有性能诉求，或数据量小（单机即可）。
- 缺少 Spark UI/执行计划等可观测信息且无法获取 —— 先补齐诊断输入再调。

## 步骤（决策流程）

按瓶颈定位，逐项处理，每步用 Spark UI 或 `df.explain` 验证收益：

1. 诊断：开 Spark UI 看 stage/task 时长分布、shuffle read/write、spill、GC。`df.explain(mode="formatted")` 看物理计划；用 `spark_partition_id()` 统计各分区行数判断倾斜（max/avg > 2 即倾斜）。
2. 开 AQE：`spark.sql.adaptive.enabled=true` + `coalescePartitions` + `skewJoin`，多数倾斜与分区数问题自动缓解，应作为第一步。
3. 分区：单分区目标 128MB–256MB。减分区用 `coalesce`（无 shuffle）；需要均匀重分布才用 `repartition(n, key)`。读侧靠分区裁剪 + 谓词下推。
4. Join：小表（< `autoBroadcastJoinThreshold`，约 10–50MB）用 `F.broadcast`；都大走 Sort-Merge；高频 Join 同键用 `bucketBy` 预分桶免 shuffle；严重倾斜用加盐（salting）。
5. 缓存：仅当 DataFrame 被多次复用才 `cache()`/`persist()`，默认 `MEMORY_AND_DISK`；复杂血缘用 `checkpoint()` 截断。用完 `unpersist()`，勿过度缓存。
6. shuffle：预聚合（map 端 combiner）、用 `approx_count_distinct` 代替 `distinct().count()`、开压缩（lz4）。
7. 内存：`spark.executor.memory` + `memoryOverhead`，`memory.fraction`/`storageFraction` 划分执行与缓存区，按 OOM/spill 现象调。
8. 格式：列式 Parquet/Delta + snappy；列裁剪只 `select` 所需列；Delta 用 `OPTIMIZE`/`ZORDER` 小文件合并与多维聚簇。
9. 验证：复跑对比 stage 时长、shuffle 量、spill；倾斜看分区行数 skew ratio。

## 指令

- 永远先开 AQE 再手动调，避免重复劳动。
- 减少分区一律 `coalesce`，别用 `repartition`（后者触发全量 shuffle）。
- 判存在性用 `df.take(1)` 或 `df.isEmpty()`，禁用 `.count()`。
- 优先内置函数，避免无谓 UDF（破坏 codegen/列式优化）。
- 大结果禁止 `collect()` 拉回 driver，保持数据分布式。

## 示例

优化版 SparkSession 与高效读写：

```python
from pyspark.sql import SparkSession, functions as F

spark = (SparkSession.builder.appName("OptimizedJob")
    .config("spark.sql.adaptive.enabled", "true")
    .config("spark.sql.adaptive.coalescePartitions.enabled", "true")
    .config("spark.sql.adaptive.skewJoin.enabled", "true")
    .config("spark.serializer", "org.apache.spark.serializer.KryoSerializer")
    .config("spark.sql.shuffle.partitions", "200")
    .getOrCreate())

df = spark.read.format("parquet").option("mergeSchema", "false").load("s3://bucket/data/")
result = (df.filter(F.col("date") >= "2024-01-01")
            .select("id", "amount", "category")
            .groupBy("category").agg(F.sum("amount").alias("total")))
result.write.mode("overwrite").parquet("s3://bucket/output/")
```

Join 三策 + 倾斜处理：

```python
# 小表广播
result = large_df.join(F.broadcast(small_df), on="key", how="left")

# 分桶免 shuffle（写时分桶，Join 时同桶数即可）
(df.write.bucketBy(200, "customer_id").sortBy("customer_id")
   .mode("overwrite").saveAsTable("bucketed_orders"))

# AQE 自动倾斜 Join
spark.conf.set("spark.sql.adaptive.skewJoin.skewedPartitionFactor", "5")
spark.conf.set("spark.sql.adaptive.skewJoin.skewedPartitionThresholdInBytes", "256MB")

# 严重倾斜手动加盐：倾斜侧加随机盐，另一侧按盐数膨胀，再按 salted_key Join
df_salted = (df_skewed
    .withColumn("salt", (F.rand() * 10).cast("int"))
    .withColumn("salted_key", F.concat(F.col("key"), F.lit("_"), F.col("salt"))))
df_exploded = (df_other.crossJoin(spark.range(10).withColumnRenamed("id", "salt"))
    .withColumn("salted_key", F.concat(F.col("key"), F.lit("_"), F.col("salt"))))
result = df_salted.join(df_exploded, on="salted_key", how="inner")
```

检测分区倾斜：

```python
parts = (df.withColumn("pid", F.spark_partition_id())
           .groupBy("pid").count().orderBy(F.desc("count")))
s = parts.select(F.max("count").alias("mx"), F.avg("count").alias("av")).collect()[0]
print(f"skew ratio: {s['mx']/s['av']:.2f}x  (>2x 即倾斜)")
```

生产配置模板（节选）：

```python
spark_configs = {
    "spark.sql.adaptive.enabled": "true",
    "spark.sql.adaptive.coalescePartitions.enabled": "true",
    "spark.sql.adaptive.skewJoin.enabled": "true",
    "spark.executor.memory": "8g",
    "spark.executor.memoryOverhead": "2g",
    "spark.memory.fraction": "0.6",
    "spark.memory.storageFraction": "0.5",
    "spark.sql.shuffle.partitions": "200",
    "spark.serializer": "org.apache.spark.serializer.KryoSerializer",
    "spark.io.compression.codec": "lz4",
    "spark.sql.autoBroadcastJoinThreshold": "50MB",
    "spark.sql.files.maxPartitionBytes": "128MB",
}
```

Delta 小文件合并与多维聚簇：

```python
spark.sql("OPTIMIZE delta.`s3://bucket/delta_table/` ZORDER BY (customer_id, date)")
```

## 注意事项

- 单分区 128MB–256MB 是经验值：太少欠并行/内存压力大，太多调度开销高。
- `cache` 不是免费的：内存有限，过度缓存挤占执行区导致 spill，反而更慢。
- 广播阈值有上限，盲目调大 `autoBroadcastJoinThreshold` 会撑爆 driver/executor。
- 加盐会放大另一侧数据量，仅对确认的少数倾斜键使用，不要全表加盐。
- 配置依赖集群规模与数据特征，模板需按 Spark UI 实测迭代，勿照搬。
- 内存监控/`statusTracker` 等内部 API 跨 Spark 版本不稳定，仅作辅助诊断。

## 互见

- related：`data-pipeline-engineer` —— Spark 是其批/流管道的核心计算引擎，本条聚焦其性能层
- related：`polars-dataframe` —— 数据量在单机内存可容纳时的更轻量替代
- combines_with：`airflow-dag-patterns` —— 用 Airflow 编排调度调优后的 Spark 作业
- combines_with：`dbt-transformation-patterns` —— Spark/仓库上的分层转换建模与本条的执行优化互补
- combines_with：`data-quality-frameworks` —— 管道在 Spark 计算外接入质量校验
- related：`snowflake-development` —— 云数仓侧等价的管道与性能调优视角

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
