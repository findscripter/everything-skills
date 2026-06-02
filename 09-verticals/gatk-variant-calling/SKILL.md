---
name: gatk-variant-calling
title: GATK 种系变异检测最佳实践（HaplotypeCaller 联合分型）
description: 当需要从 WGS/WES 的 BWA-MEM2 比对、去重、BQSR 后 BAM 检测种系 SNP/indel 并对多样本队列联合分型时使用；用 GATK4 最佳实践流程跑 BQSR→HaplotypeCaller(GVCF)→GenomicsDBImport→GenotypeGVCFs→VQSR/硬过滤，产出每样本 GVCF 与过滤后的多样本 VCF；不适用于体细胞/肿瘤变异（用 Mutect2）、追求更快可改用 DeepVariant、单纯文件解析用 genomic-file-toolkit。触发词：GATK、HaplotypeCaller、GVCF、GenotypeGVCFs、BQSR、VQSR、种系变异、SNP、indel、联合分型、变异检测、joint genotyping
domain: 领域/science
triggers: [GATK, HaplotypeCaller, GVCF, GenotypeGVCFs, GenomicsDBImport, BQSR, VQSR, 种系变异, SNP, indel, 联合分型, 变异检测, joint genotyping, VCF, DeepVariant]
tags: [gatk, bioinformatics, genomics, variant-calling, germline, wgs, wes, vcf, gvcf, bqsr, science]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [gatk4, Java, samtools, bcftools, BWA-MEM2, Python, Snakemake]
requires: []
related: [cnvkit-copy-number, snpeff-variant-annotation, genomic-file-toolkit, star-rnaseq-aligner]
combines_with: [snpeff-variant-annotation, snakemake-workflow-engine]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

当需要按 GATK 最佳实践从 Illumina WGS/WES 数据检测种系（germline）SNP 与 indel 时使用本条，典型场景：

- 从已 BWA-MEM2 比对、标记重复（markdup）、BQSR 校正的 BAM 检测种系变异。
- 对多样本队列（家系、病例-对照）做联合分型（joint genotyping），可增量扩样本而不重算旧样本。
- 在 HaplotypeCaller 前做碱基质量分数重校正（BQSR）提升检出准确度。
- 产出 GVCF，供后续 VEP/ANNOVAR/SnpEff 注释。

不该用本条的边界：

- 体细胞/肿瘤变异检测 → 用 Mutect2（GATK 的体细胞工具），本条只管种系。
- 追求更快且精度相当 → 用 DeepVariant（Google，深度学习）；无需局部重组装的快速检测 → 用 bcftools call。
- 仅做 BAM/VCF 读写、区域抓取、覆盖度统计等文件级操作 → 用 `genomic-file-toolkit`，不必上完整流水线。
- 大规模分布式编排 → 用 `nextflow-pipeline-builder` 或 Snakemake 包裹本条命令。

前置条件：GATK4、Java 17+、samtools、BWA-MEM2；参考基因组 FASTA + 已知位点 VCF（dbSNP、1000G、Mills indels）；输入 BAM 必须带 `@RG` 读组头。安装前先 `command -v gatk`，pixi 环境内用 `pixi run gatk`。

## 步骤

1. **BQSR**：`BaseRecalibrator` 建重校正表 → `ApplyBQSR` 输出校正后 BAM。
2. **HaplotypeCaller（GVCF 模式）**：每样本独立调用，`-ERC GVCF` 产出每样本 GVCF。WES 加 `-L 靶区间 --interval-padding 100`。
3. **GenomicsDBImport**：用 `--sample-name-map`（样本名\t路径 的 TSV）按染色体合并 GVCF 进 GenomicsDB。
4. **GenotypeGVCFs**：在 GenomicsDB 上联合分型，按染色体输出，再 `MergeVcfs` 合并为队列 VCF。
5. **过滤**：小队列/外显子用硬过滤（`SelectVariants` 拆 SNP/indel → `VariantFiltration` 加阈值 → `MergeVcfs` 合回）；变异数 >10k 的大队列可用 VQSR。
6. **解析**：`bcftools query` 提取 PASS 位点字段，转 pandas DataFrame 做下游分析。

关键参数：`-ERC GVCF`（队列工作流必选）；`--native-pair-hmm-threads 4~8`（HaplotypeCaller 最耗 CPU 步，配区间列表按染色体并行）；`--dbsnp` 注 rsID；`--stand-call-conf 30`（最低发射质量）；大基因组加 `--java-options "-Xmx16g"`。

## 示例

BQSR（已知位点拼成多个 `--known-sites`）：

```bash
GENOME="GRCh38.fa"
gatk BaseRecalibrator -R $GENOME -I sample1.markdup.bam \
    --known-sites dbsnp_146.hg38.vcf.gz \
    --known-sites Mills_and_1000G_gold_standard.indels.hg38.vcf.gz \
    -O sample1.recal.table
gatk ApplyBQSR -R $GENOME -I sample1.markdup.bam \
    --bqsr-recal-file sample1.recal.table -O sample1.bqsr.bam
```

HaplotypeCaller（GVCF 模式，队列推荐）：

```bash
gatk HaplotypeCaller -R GRCh38.fa -I sample1.bqsr.bam \
    -O gvcfs/sample1.g.vcf.gz -ERC GVCF \
    --dbsnp dbsnp_146.hg38.vcf.gz --native-pair-hmm-threads 4
# WES 加：-L exome_targets.interval_list --interval-padding 100
```

合并 GVCF → 联合分型（按染色体，可并行）：

```bash
# sample_map.txt 每行：样本名<TAB>GVCF路径
for CHR in chr1 chr2 chr3; do
  gatk GenomicsDBImport --sample-name-map sample_map.txt \
      --genomicsdb-workspace-path genomicsdb/${CHR} -L $CHR --reader-threads 4
  gatk GenotypeGVCFs -R GRCh38.fa -V gendb://genomicsdb/${CHR} \
      --dbsnp dbsnp_146.hg38.vcf.gz -O vcfs/cohort_${CHR}.vcf.gz
done
gatk MergeVcfs $(ls vcfs/cohort_chr*.vcf.gz | sed 's/^/-I /') -O vcfs/cohort_all.vcf.gz
```

硬过滤（小队列/外显子，分 SNP 与 indel 用不同阈值）：

```bash
gatk SelectVariants -V vcfs/cohort_all.vcf.gz --select-type-to-include SNP   -O vcfs/snps.vcf.gz
gatk SelectVariants -V vcfs/cohort_all.vcf.gz --select-type-to-include INDEL -O vcfs/indels.vcf.gz

gatk VariantFiltration -V vcfs/snps.vcf.gz \
  --filter-expression "QD < 2.0"          --filter-name "QD2" \
  --filter-expression "FS > 60.0"         --filter-name "FS60" \
  --filter-expression "MQ < 40.0"         --filter-name "MQ40" \
  --filter-expression "MQRankSum < -12.5" --filter-name "MQRankSum-12.5" \
  -O vcfs/snps_filtered.vcf.gz

gatk VariantFiltration -V vcfs/indels.vcf.gz \
  --filter-expression "QD < 2.0"             --filter-name "QD2" \
  --filter-expression "FS > 200.0"           --filter-name "FS200" \
  --filter-expression "ReadPosRankSum < -20.0" --filter-name "ReadPosRankSum-20" \
  -O vcfs/indels_filtered.vcf.gz

gatk MergeVcfs -I vcfs/snps_filtered.vcf.gz -I vcfs/indels_filtered.vcf.gz \
  -O vcfs/cohort_filtered.vcf.gz
```

提取 PASS 位点到 DataFrame：

```python
import subprocess, io, pandas as pd
r = subprocess.run(
    ["bcftools", "query",
     "-f", "%CHROM\t%POS\t%ID\t%REF\t%ALT\t%QUAL\t%FILTER\t%INFO/QD\t%INFO/FS\n",
     "-i", "FILTER='PASS'", "vcfs/cohort_filtered.vcf.gz"],
    capture_output=True, text=True)
cols = ["CHR","POS","ID","REF","ALT","QUAL","FILTER","QD","FS"]
df = pd.read_csv(io.StringIO(r.stdout), sep="\t", names=cols)
print(f"PASS variants: {len(df)}")
df.to_csv("pass_variants.tsv", sep="\t", index=False)
```

单样本（无队列）：跳过 GenomicsDBImport，HaplotypeCaller 不加 `-ERC GVCF` 直出 VCF，再硬过滤。

## 注意事项

- **缺 @RG 头**：`SAM/BAM file has no @RG header` → 重新比对时带 `-R "@RG\tID:...\tSM:...\tPL:ILLUMINA"`。
- **Java OOM**：加 `--java-options "-Xmx16g"`（大基因组更高）。
- **HaplotypeCaller 慢**：单线程 HMM 是瓶颈，加 `--native-pair-hmm-threads 8`，并用区间列表按染色体并行。
- **染色体命名要一致**：BAM 与参考 FASTA 必须同用 `chr1` 或 `1`，否则 `IndexOutOfBoundsException`；GVCF 为空多因区间错或该区域无 reads（`samtools view -c sample.bam chrN` 核对）。
- **VQSR 需足量变异**：变异 <10k（小队列/外显子）时 VQSR 训练不足，改用硬过滤。
- **GenomicsDB 不能复用已存在路径**：重跑前 `rm -rf genomicsdb/chrN`。
- **索引缺失**：`gatk IndexFeatureFile -I file.vcf.gz` 或 `tabix -p vcf file.vcf.gz` 补 `.tbi`。
- 硬过滤阈值是经验值（SNP 与 indel 不同），按数据质量调整；务必先看变异质控指标分布。

## 互见

- requires：`genomic-file-toolkit` —— BAM/VCF 的读写、索引、区域抓取与覆盖度统计是本流程的输入/输出处理基础。
- related：`gene-set-enrichment-analysis` —— 变异/基因列表的下游富集解读；`single-cell-rnaseq-analysis` —— 同属基因组学分析家族。
- combines_with：`nextflow-pipeline-builder` —— 把 BQSR→HaplotypeCaller→联合分型各步包成可复现、可并行的工作流（Snakemake 同理，源中已给 Snakefile 示例）。

---

本条采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0），适配重写而非逐字翻译。
