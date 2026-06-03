---
name: polars-bio-genomic-intervals
title: polars-bio 高性能基因组区间运算
description: 当在 Polars DataFrame 上做基因组区间运算（overlap/nearest/merge/coverage/complement/subtract）或读写 BED/VCF/BAM/GFF 等生信格式、且数据量大需流式/云端处理时使用；做区间算术、生信文件 I/O、DataFusion SQL 查询、BAM 测序深度计算，产出 LazyFrame/DataFrame 结果。不适用于纯序列比对、变异注释或非区间型分析。触发词：基因组区间、overlap、bioframe 替代、BED/VCF/BAM、测序深度 depth
domain: 领域/science
triggers: [基因组区间运算, 区间 overlap/nearest/merge, 读写 BED/VCF/BAM/GFF, bioframe 替代方案, BAM 测序深度 pileup, 基因组数据 SQL 查询, 大基因组流式处理]
tags: [生物信息, 基因组学, polars, 区间运算, 数据io, datafusion, python]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Bash, Read, Write, Edit]
requires: []
related: [genomic-file-toolkit, geniml-genomic-interval-ml, samtools-bam-processing, polars-dataframe]
combines_with: [genomic-file-toolkit, macs3-peak-calling, deeptools-ngs-analysis]
license: MIT
source: K-Dense-AI/scientific-agent-skills
source_license: MIT
---
## 何时使用

适合：
- 做基因组区间算术：overlap、count_overlaps、nearest、merge、cluster、coverage、complement、subtract。
- 读写生信文件：BED、VCF、VCF Zarr、BAM、CRAM、GFF/GTF、FASTA、FASTQ、SAM、Hi-C pairs。
- 处理超内存的大基因组（流式 / out-of-core）。
- 用 DataFusion SQL 查询基因组文件。
- 从 BAM/CRAM 计算逐碱基测序深度（pileup/depth）。
- 从 bioframe 迁移到更快的方案（实测快 6–38 倍）。

不该用：
- 不做序列比对（mapping/alignment 本身）、变异 calling、变异功能注释——它只做区间层面的运算与 I/O。
- 数据不是「染色体 + 起止坐标」的区间型结构时不适用。
- 坐标超过约 21 亿（INT32 上限）的自定义坐标空间不支持。

## 步骤

1. 安装（需 Python 3.11–3.14）：
   `uv pip install "polars-bio==0.31.0"`（需 pandas≥3.0 兼容则装 `"polars-bio[pandas]==0.31.0"`）。
2. 准备输入：DataFrame 默认需 `chrom`、`start`、`end` 三列；列名不同时用 `cols1`/`cols2` 传列名列表。
3. 选 API 风格：单次运算用函数式 `pb.overlap(df1, df2)`；多步流水线用 LazyFrame 方法链 `df1.lazy().pb.overlap(df2)`。
4. 大文件用 `scan_*`（流式 + 谓词下推），小文件用 `read_*`。
5. 默认返回 LazyFrame，记得 `.collect()`；或传 `output_type="polars.DataFrame"` 直接拿 DataFrame。
6. 双输入运算把较大的表放第一个参数（probe），较小的放第二个（build）以提速。

## 指令

- 区间运算（默认返回 LazyFrame）：
  - `pb.overlap(df1, df2, suffixes=("_1","_2"))` —— `overlap_output="left"`（0.30.0 起）只返回 df1 侧命中。
  - `pb.count_overlaps(df1, df2)` / `pb.nearest(df1, df2)`（可配 `k`、`overlap`、`distance`）。
  - `pb.merge(df)` / `pb.cluster(df)` / `pb.coverage(df1, df2)` / `pb.complement(df)` / `pb.subtract(df1, df2)`。
- 文件 I/O：`read_*` / `scan_*`（流式）/ `write_*` / `sink_*`，如 `pb.read_vcf`、`pb.scan_bam`、`pb.read_gff`。CRAM 用独立的 `read_cram`/`scan_cram` 并需 `reference_path`。
- SQL：`pb.register_vcf("f.vcf.gz", name="variants")` 注册为表，`pb.sql("SELECT ... FROM variants").collect()`；`pb.from_polars("t", df)` 把 DataFrame 注册成表。
- 测序深度：`pb.depth("aligned.bam", min_mapping_quality=20).collect()`。
- 全局选项：
  - 并行（默认仅 1 分区）：`pb.set_option("datafusion.execution.target_partitions", os.cpu_count())`。
  - 坐标系（默认 1-based）：`pb.set_option("datafusion.bio.coordinate_system_zero_based", True)` 切 0-based 半开。

## 示例

基础 overlap（函数式 + 方法链两种写法）：

```python
import polars as pl
import polars_bio as pb

df1 = pl.DataFrame({"chrom": ["chr1","chr1","chr1"], "start": [1,5,22], "end": [6,9,30]})
df2 = pl.DataFrame({"chrom": ["chr1","chr1"], "start": [3,25], "end": [8,28]})

# 函数式（默认 LazyFrame）
result_df = pb.overlap(df1, df2).collect()
# 直接拿 DataFrame
result_df = pb.overlap(df1, df2, output_type="polars.DataFrame")
# 方法链（.pb 仅在 LazyFrame 上提供区间运算）
result_df = df1.lazy().pb.overlap(df2).collect()
```

方法链流水线（注意 overlap 输出带后缀列，merge 前需改回 chrom/start/end）：

```python
result = (
    df1.lazy()
    .pb.overlap(df2)
    .filter(pl.col("start_2") > 1000)
    .select(
        pl.col("chrom_1").alias("chrom"),
        pl.col("start_1").alias("start"),
        pl.col("end_1").alias("end"),
    )
    .pb.merge()
    .collect()
)
```

读文件 / 云端 / 流式：

```python
variants = pb.read_vcf("samples.vcf.gz")
alignments = pb.scan_bam("aligned.bam")              # 流式
df = pb.read_bed("s3://bucket/regions.bed", allow_anonymous=True)  # 云路径直读
result = pb.scan_bed("large.bed").collect(engine="streaming")      # 超内存流式
```

## 注意事项

1. `.pb` 访问器：区间运算（overlap/merge 等）只在 `LazyFrame.pb` 上；`DataFrame.pb` 仅有写方法（write_bam/write_vcf 等）。链式前先 `.lazy()`。
2. 返回类型：所有区间运算和 `pb.sql()` 默认返回 LazyFrame，别忘 `.collect()` 或用 `output_type="polars.DataFrame"`。
3. 列名：默认认 `chrom`/`start`/`end`；不同名用 `cols1`/`cols2` 传列表。
4. 坐标系元数据：运算会从 I/O 函数或 `config_meta` 读坐标系。手工构建的 DataFrame 需 `df.config_meta.set(coordinate_system_zero_based=True/False)`；缺失则回退到全局设置（带警告）。设 `pb.set_option("datafusion.bio.coordinate_system_check", True)` 可改为抛 `MissingCoordinateSystemError`；两输入坐标系不一致抛 `CoordinateSystemMismatchError`。BED 文件格式恒为 0-based 半开，读取时自动转换。
5. probe-build 顺序：overlap/nearest/coverage 中第一个表被探查，交换参数会改变 left/right 输出列归属，也影响性能。
6. INT32 上限：坐标用 32 位整数存储，约 21 亿封顶——够覆盖所有已知基因组。
7. BAM 索引：`read_bam`/`scan_bam` 需同目录 `.bai`，缺失用 `samtools index` 生成。
8. 并行默认关闭（1 分区），大数据集务必调高 `target_partitions`。
9. 压缩优先 BGZF（`.bed.gz`/`.vcf.gz`），支持并行分块解压，远快于普通 GZIP。
10. 早选列省内存：`pb.read_vcf("large.vcf.gz").select("chrom","start","end","ref","alt")`。

## 互见

- 源仓库 `references/` 内含更细文档：`interval_operations.md`（8 种运算参数/输出 schema/性能）、`file_io.md`（各格式列 schema、云存储、压缩）、`sql_processing.md`、`pileup_operations.md`、`configuration.md`、`bioframe_migration.md`（运算映射表与迁移示例）。
- 同属「领域/misc」下的数据处理类技能可配合本条做基因组数据流水线。

---
采编自 K-Dense-AI/scientific-agent-skills（原 SKILL 名 polars-bio，许可 Apache-2.0；本仓库依 MIT 收录适配重写）。
