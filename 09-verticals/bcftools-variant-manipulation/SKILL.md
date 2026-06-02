---
name: bcftools-variant-manipulation
title: bcftools VCF/BCF 变异处理
description: 当变异检测后需要对 VCF/BCF 做质控过滤、多样本合并、规范化、rsID/基因注释、基因型提取与统计时使用；用 bcftools 流式管线跑 norm→filter→annotate→query/stats/merge/concat，产出过滤注释后的 VCF.gz、基因型矩阵或 QC 报告；不适用于变异检测本身（种系用 gatk-variant-calling、bcftools call 仅做轻量调用）、群体遗传统计（Fst/LD/HWE 用 VCFtools）、效应注释（用 snpeff-variant-annotation）。触发词：bcftools、VCF、BCF、filter、merge、norm、query、annotate、stats、基因型、变异过滤、多样本合并、规范化
domain: 领域/science
triggers: [bcftools, VCF, BCF, filter, merge, concat, norm, query, annotate, stats, 基因型, GT, 变异过滤, 多样本合并, 规范化, rsID, Ts/Tv, isec]
tags: [bcftools, vcf, bcf, htslib, variant-manipulation, genomics, bioinformatics, filtering, annotation, genotype, science]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [bcftools, samtools, tabix, htslib, bgzip]
requires: []
related: [vcf-variant-filtering, gatk-variant-calling, snpeff-variant-annotation, samtools-bam-processing]
combines_with: [gatk-variant-calling, vcf-variant-filtering, snpeff-variant-annotation]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

变异检测（calling）之后，对 VCF/BCF 做后处理与质控时用本条，典型场景：

- 按质量阈值过滤变异（QUAL、DP、AF、MQ）保留高置信位点。
- 把多个样本的 VCF 合并（merge）成联合调用集，或把按染色体/批次拆的 VCF 拼接（concat）。
- 给变异加 rsID（dbSNP）或基因名（BED）等外部注释。
- 把 VCF 字段抽成制表符文本（基因型、等位深度、基因型矩阵）供下游 plink/R/Python。
- 规范化 indel 表示（左对齐）、拆分多等位位点、去重。
- 跑 QC：变异计数、Ts/Tv 比、每样本统计；轻量调用 `mpileup | bcftools call`。

不该用本条的边界：

- 正经种系变异检测（需局部重组装/BQSR）→ 用 `gatk-variant-calling` 或 DeepVariant；`bcftools call` 只做轻量调用。
- 群体遗传统计（Fst、连锁不平衡 LD、Hardy-Weinberg）→ 用 VCFtools。
- 变异功能/效应注释（基因影响、氨基酸变化）→ 用 `snpeff-variant-annotation`，本条只做 ID/区间级标签注释。
- 去重标记、文库指标 → 用 picard。

前置条件：bcftools 1.17+（HTSlib 套件，随 samtools）；区域查询需 bgzip 压缩 + tabix 索引（`.vcf.gz + .tbi`）。安装前先 `command -v bcftools`，pixi 环境内用 `pixi run bcftools`。索引：`bcftools index -t x.vcf.gz`（建 `.tbi`），染色体 >512Mb 用 `-c`（建 `.csi`）。

## 步骤

1. **规范化**：`norm -m -any` 拆多等位 →`norm -d any -f ref.fa` 左对齐 indel + 去重。合并/注释前必做，避免重复记录。
2. **过滤**：`filter -i '表达式'` 留（include）或 `-e` 去（exclude）；软过滤 `-s 标签 -e ...` 只打 FILTER 标签不删；`view -f PASS` 留 PASS；`--type snps/indels` 按类型；`--SnpGap 3` 去 indel 旁 3bp 内的 SNP。
3. **注释**：`annotate -a 源 -c 列` 加 ID/INFO；`-x INFO/字段` 删字段；染色体名不一致用 `--rename-chrs`。
4. **合并/拼接**：不同样本集同位点 → `merge`；同样本集不同染色体/批次 → `concat`（重叠区加 `-a`）。
5. **提取/统计**：`query -f '格式串'` 转 TSV（`-H` 加表头，`[...]` 迭代每样本 FORMAT 字段）；`stats` 出 QC（`-s -` 加每样本）。

输出格式 `-O`：`v` 文本 VCF / `z` bgzip VCF（归档、可 tabix）/ `b` 压缩 BCF（管道最快）/ `u` 非压缩 BCF（中间步最快，省压缩开销）。规则：管道中间步用 `-u`，落盘/索引用 `-z`。`view -W` 写完自动建索引。

过滤表达式：INFO 字段每变异一值（`QUAL>20`、`DP>10`、`AF<0.05`、`MQ>40`）；FORMAT 字段每样本（`GT=="1/1"`、`AD[1]>5`、`GQ>20`）；可组合 `QUAL>20 && DP>10 && AF>0.01`。

## 示例

典型后处理管线（规范化→过滤→注释→落盘，全程流式无中间文件）：

```bash
bcftools norm -m -any variants.vcf.gz \
  | bcftools norm -d any -f reference.fa \
  | bcftools filter -i 'QUAL>20 && DP>10' \
  | bcftools annotate -a dbSNP.vcf.gz -c ID \
  | bcftools view -O z -o final.vcf.gz
bcftools index -t final.vcf.gz
bcftools stats final.vcf.gz | grep "^SN"      # 各阶段变异计数
```

抽样本 / 按区域（区域需索引）：

```bash
bcftools view -s sample1,sample2 -O z -o subset.vcf.gz variants.vcf.gz
bcftools view -s ^outlier -O z -o cleaned.vcf.gz variants.vcf.gz   # ^ 排除
bcftools view -r chr1:1000000-2000000 variants.vcf.gz -O v -o region.vcf
```

提取基因型 / 基因型矩阵：

```bash
# 每样本基因型与等位深度（输出 sample  0/1  25,18）
bcftools query -f '[%SAMPLE\t%GT\t%AD\n]' variants.vcf.gz > genotypes.txt
# 跨样本基因型矩阵（带表头，供 plink/R/Python）
bcftools query -H -f '%CHROM\t%POS\t%REF\t%ALT\t[%GT\t]\n' cohort.vcf.gz > gt_matrix.tsv
# 罕见变异（AF<1%）
bcftools query -i 'AF<0.01' -f '%CHROM\t%POS\t%REF\t%ALT\t%AF\n' variants.vcf.gz > rare.txt
```

多样本合并 → 过滤 → 抽矩阵（合并前各 VCF 须已索引）：

```bash
for s in sample1 sample2 sample3; do bcftools index -t ${s}.vcf.gz; done
bcftools merge sample1.vcf.gz sample2.vcf.gz sample3.vcf.gz -O z --threads 8 -o cohort.vcf.gz
bcftools index -t cohort.vcf.gz
bcftools view -f PASS --type snps cohort.vcf.gz \
  | bcftools filter -i 'AF>0.01 && AF<0.99' -O z -o cohort_snps.vcf.gz
```

QC（Ts/Tv 比、每样本计数）：

```bash
bcftools stats variants.vcf.gz | grep "Ts/Tv"   # 人 WGS 约 2.0~2.1，外显子 2.5~3.0
bcftools stats -s - variants.vcf.gz | grep "^PSC" > per_sample.txt   # 每样本 hom/het/ts/tv...
```

两文件一致性比对（isec 产私有/共享四份）：

```bash
bcftools isec -p isec_dir file1.vcf.gz file2.vcf.gz
# 0000=file1 私有  0001=file2 私有  0002/0003=共享
```

## 注意事项

- **缺索引**：`view -r 区域` 需 `.tbi`/`.csi`，落盘 bgzip VCF 后务必 `bcftools index -t out.vcf.gz`。
- **合并/注释前先规范化**：不同调用器对同一 indel 表示不同，先 `norm -m -any | norm -d any -f ref.fa` 防重复记录。
- **染色体命名要一致**：`chr1` 与 `1` 混用会静默失败/注释错位，`bcftools view -h x.vcf.gz | grep "^##contig"` 核对，必要时 `annotate --rename-chrs`。
- **样本重名**：合并时输入 VCF 样本名重复会报错，先 `bcftools reheader -s new_names.txt x.vcf.gz` 改名。
- **过滤输出为空**：表达式过严或字段缺失，先 `view -h x.vcf.gz | grep INFO` 确认字段存在。
- **管道用 `-O u`**：多步管道中间产物用非压缩 BCF，比 `-O z` 通常快 2~3×；落盘才用 `-z`。
- **Ts/Tv 异常**（<1.8 或 >2.2）提示质控问题，收紧过滤（`QUAL>30 && DP>15`）并查比对质量。
- **concat 报重叠**：输入区域重叠时加 `-a`：`bcftools concat -a file1.vcf.gz file2.vcf.gz`。
- 大队列**先过滤再合并**：对每样本 VCF 先做位点级 QC（`QUAL>20 && DP>5`）再 merge，省内存与 I/O。

## 互见

- requires：`genomic-file-toolkit` —— VCF/BAM 的读写、bgzip 索引、区域抓取与覆盖度统计是本条的输入/输出基础。
- related：`cnvkit-copy-number` —— 同属变异后处理家族（拷贝数）；`gene-set-enrichment-analysis` —— 变异/基因列表的下游富集解读；`single-cell-rnaseq-analysis` —— 同属基因组学分析。
- combines_with：`gatk-variant-calling` —— 上游产出 VCF，本条接力做规范化/过滤/合并/注释；`snpeff-variant-annotation` —— 在本条 ID/区间注释之上叠加功能效应注释；`snakemake-workflow-engine`、`nextflow-pipeline-builder` —— 把 norm→filter→annotate 各步包成可复现、可并行的工作流。

---

本条采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0），适配重写而非逐字翻译。
