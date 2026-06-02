---
name: tiledbvcf-variant-store
title: TileDB-VCF 大规模变异存储
description: 当需要把多份单样本 VCF/BCF 增量入库、按基因组区间/样本高速查询变异数据时使用；用 TileDB 稀疏数组建库、入库、查询、导出 VCF/TSV 并算等位基因频率；不适用于多样本合并 VCF、>1000 样本生产规模（转 TileDB-Cloud）或一般 VCF 文本处理。触发词：TileDB-VCF、变异存储、群体基因组学
domain: 领域/science
triggers: [TileDB-VCF, tiledbvcf, 变异存储, VCF 入库, 群体基因组学, 变异数据库, 队列研究 VCF, 等位基因频率, GWAS 数据准备, 稀疏数组变异]
tags: [生物信息, 基因组学, 变异数据, TileDB, VCF, 群体遗传, 数据存储, misc]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [tiledbvcf (Python), tiledbvcf (CLI), conda/mamba, bcftools/tabix, Docker]
requires: []
related: [bcftools-variant-manipulation, vcf-variant-filtering, gatk-variant-calling, genomic-file-toolkit]
combines_with: [gatk-variant-calling, bcftools-variant-manipulation]
license: MIT
source: K-Dense-AI/scientific-agent-skills
source_license: MIT
---
## 何时使用

适用于将变异数据高效存储与检索的场景：

- 用多份单样本 VCF/BCF 构建群体基因组/队列变异数据库
- 需要增量添加新样本，且不想做昂贵的多样本合并
- 跨大量样本对特定基因组区间做高性能查询
- 处理云端（S3/Azure/GCS）变异数据，或导出大库的子集
- GWAS 数据准备、罕见变异负荷检验、等位基因频率统计、群体质控
- 原型验证、教学与方法开发，对变异操作性能有要求

**不该用（负边界）：**

- 多样本（合并）VCF —— 仅支持单样本 VCF，先用 `bcftools` 拆分
- 输入未建索引 —— 必须有 `.csi`（bcftools）或 `.tbi`（tabix）索引
- 生产级超大规模（>1000 样本 / >100GB / 需分布式 / 多人协作 / 合规）—— 应迁移到 TileDB-Cloud
- 仅做轻量 VCF 文本过滤/格式转换 —— 直接用 `bcftools` 更简单
- 多写入者并发写同一数据集 —— 易损坏，需加锁

## 步骤 / 指令

1. **安装**（推荐 conda/mamba）：

   ```bash
   conda create -n tiledb-vcf "python<3.10"
   conda activate tiledb-vcf
   conda install -c conda-forge mamba
   mamba install -y -c conda-forge -c bioconda -c tiledb \
     tiledb-py tiledbvcf-py pandas pyarrow numpy
   # M1 Mac 先设 CONDA_SUBDIR=osx-64 并 conda config --env --set subdir osx-64
   # 或直接用镜像：docker pull tiledb/tiledbvcf-py / tiledbvcf-cli
   ```

2. **建库 + 入库**：确保 VCF 为单样本且已建索引，再 `ingest_samples`。

3. **查询**：以 `mode="r"` 打开，指定 `attrs / regions / samples` 读取为 DataFrame。

4. **导出**：用 `export` 输出 VCF/BCF 子集，或导出 TSV。

5. **进阶**：算等位基因频率、样本质控、调内存预算与 tile 缓存。

**坐标约定（关键）：** TileDB-VCF 沿用 VCF 的 **1-based、双端闭区间**坐标。`chr1:1000-2000` 含位置 1000–2000，共 1001 个碱基。

## 示例

**建库并入库（单样本 + 索引）：**

```python
import tiledbvcf

ds = tiledbvcf.Dataset(uri="my_dataset", mode="w",
                       cfg=tiledbvcf.ReadConfig(memory_budget=1024))
# 要求：单样本 VCF，且含 .csi 或 .tbi 索引
ds.ingest_samples(["sample1.vcf.gz", "sample2.vcf.gz"])
```

**按区间/样本查询：**

```python
ds = tiledbvcf.Dataset(uri="my_dataset", mode="r")
df = ds.read(
    attrs=["sample_name", "pos_start", "pos_end", "alleles", "fmt_GT"],
    regions=["chr1:1000000-2000000", "chr2:500000-1500000"],
    samples=["sample1", "sample2", "sample3"],
)
print(df.head())
```

**导出 VCF 子集：**

```python
import os
ds.export(
    regions=["chr21:8220186-8405573"],
    samples=["HG00101", "HG00097"],
    output_format="v",
    output_dir=os.path.expanduser("~"),
)
```

**等位基因频率：**

```python
af_df = tiledbvcf.read_allele_frequency(
    uri="my_dataset",
    regions=["chr1:1000000-2000000"],
    samples=["sample1", "sample2", "sample3"],
)
```

**CLI（子命令 create/store/export/list/stat/utils/version）：**

```bash
tiledbvcf create --uri my_dataset
tiledbvcf store  --uri my_dataset --samples sample1.vcf.gz,sample2.vcf.gz
tiledbvcf export --uri my_dataset \
  --regions "chr1:1000000-2000000" --sample-names "sample1,sample2"
tiledbvcf list --uri my_dataset
tiledbvcf stat --uri my_dataset
```

**云端数据集 URI：** `s3://bucket/dataset`、`azure://container/dataset`、`gcs://bucket/dataset`。

## 注意事项

- **入库内存溢出**：设合理 `memory_budget`，大文件分批入库；可用 `ReadConfig` 的 `region_partition / sample_partition` 分区。
- **查询低效**：合并相邻区间，避免大量零散小查询；为重复访问配置 tile 缓存（`sm.tile_cache_size`）。
- **样本名不匹配**：VCF header 中的样本名要与查询 `samples` 一致。
- **超大结果集**：返回数百万变异时用流式/分页，勿一次性载入。
- **云端权限**：确保 S3/Azure/GCS 认证正确（如 `vfs.s3.region`）。
- **并发**：多写入者写同库会损坏，务必加锁；增量加样本无需重处理已有数据。
- **迁移信号**：>1000 样本、需分布式/多人协作/合规时迁移 TileDB-Cloud（`tiledb.cloud.vcf`、`TILEDB_REST_TOKEN`）。

## 互见

- TileDB-VCF GitHub：https://github.com/TileDB-Inc/TileDB-VCF
- TileDB Academy（群体基因组学指南）：https://cloud.tiledb.com/academy/structure/life-sciences/population-genomics/
- 同领域可参考变异处理类技能（bcftools/VCF 预处理：拆分单样本、建索引）。

---

采编自 K-Dense-AI/scientific-agent-skills（MIT 许可）。
