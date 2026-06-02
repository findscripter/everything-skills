---
name: snpeff-variant-annotation
title: SnpEff/SnpSift 变异功能注释与过滤
description: 当需要给 VCF 变异预测功能影响（HIGH/MODERATE/LOW/MODIFIER）、基因/转录本/氨基酸改变/HGVS，并用 SnpSift 按影响等级或等位频率过滤、叠加 ClinVar/dbSNP 注释时使用；做基于 Java CLI（可 Python subprocess 编排）的快速注释、过滤、字段抽表与可视化，产出注释 VCF、过滤子集、TSV 表与汇总图；不适用于需 gnomAD/CADD/SpliceAI 多库一次注释（用 ANNOVAR）或 REST API/VEP 插件（用 Ensembl VEP）的场景。触发词：snpEff、SnpSift、变异注释、VCF 注释、ANN 字段、HIGH impact、HGVS、ClinVar、dbSNP、de novo、功能影响
domain: 领域/science
triggers: [snpEff, SnpSift, 变异注释, VCF 注释, ANN 字段, 功能影响, HIGH impact, HGVS, ClinVar, dbSNP, de novo, 致病变异, extractFields, 影响等级, 变异过滤]
tags: [bioinformatics, genomics, variant-annotation, snpeff, snpsift, vcf, clinvar, dbsnp, hgvs, cyvcf2]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [snpEff, SnpSift, Java, cyvcf2, pandas, matplotlib, bgzip, tabix]
requires: []
related: [gatk-variant-calling, clinvar-database, gnomad-population-database, genomic-file-toolkit]
combines_with: [gatk-variant-calling, genomic-file-toolkit, clinvar-database]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

当 Agent 需要把原始变异调用（GATK / DeepVariant / bcftools 等输出的 VCF）转成可解释、可过滤的变异集时使用本条：

- 给 VCF 注释基因级功能影响（影响等级、受累基因/转录本、氨基酸改变、HGVS），供人工审阅或下游过滤。
- 优先筛选临床相关变异：过滤到 HIGH 影响的 stop-gain / frameshift / 剪接位点变异（罕见病、肿瘤基因 panel）。
- 叠加 ClinVar 致病性分类与 dbSNP rsID，用于跨研究比对或临床报告。
- 用 `extractFields` 抽出结构化制表字段（基因、蛋白改变、AF、ClinSig）进 pandas 做统计。
- trio 分析中结合等位频率阈值、影响过滤与父母基因型，识别候选 de novo 变异。

不该用的边界：
- 需 **gnomAD / CADD / SpliceAI 等多库一次注释** → 用 ANNOVAR。
- 需 **REST API 访问或 VEP 专属插件（CADD/LOFTEE/SpliceRegion）** → 用 Ensembl VEP。
- 不负责变异调用本身（call SNP/indel）；本条从已有 VCF 开始。

## 步骤

1. 准备环境：Java 11+（SnpEff 5.x 必需）。注释前先 `command -v snpEff`，已装则跳过安装；在 pixi 工程内用 `pixi run snpEff`。可选 Python：`cyvcf2 pandas matplotlib seaborn`。
2. 下载基因组库（按版本一次性，约 1 GB），如 `hg38`、`GRCh37.75`、`mm10`；库落在 `~/.snpEff/data/`。
3. 注释 VCF：给每条变异加 `ANN` INFO 字段，并产出 QC 报告。
4. 用 SnpSift `filter` 按影响等级 / AF / ClinSig 等布尔表达式过滤子集。
5. 用 SnpSift `annotate` 叠加 ClinVar（CLNSIG/CLNDN）与 dbSNP（RS）；参考 VCF 须先 `tabix` 建索引且染色体命名一致。
6. 用 SnpSift `extractFields` 抽成 TSV，或用 cyvcf2 在 Python 中解析 `ANN`，再做汇总统计与可视化。

## 指令

ANN 字段结构（按转录本一条注释，逗号分隔；管道分隔 16 列，index 0 为最严重后果）：
`Allele|Effect|Impact|Gene|GeneID|Feature|FeatureID|BioType|Rank|HGVS.c|HGVS.p|cDNA_pos|CDS_pos|Protein_pos|Distance|Errors`

影响等级与优先级：
- `HIGH`：stop-gained / frameshift / splice donor-acceptor / start-lost —— 疾病候选，必审。
- `MODERATE`：missense / in-frame indel / splice-region —— 致病性看保守性与结构域。
- `LOW`：synonymous / stop-retained —— 罕为致病，可作对照。
- `MODIFIER`：intronic / intergenic / UTR / downstream —— 背景，多数分析过滤掉。

SnpSift filter 语法：比较 `= != < >`、逻辑 `& | !`、子串 `has`；`ANN[*]` 匹配任一转录本，`ANN[0]` 仅取第一条。复合示例（罕见+损害+非 ClinVar 良性）：
`(AF < 0.001) & (ANN[*].IMPACT = 'HIGH' | ANN[*].IMPACT = 'MODERATE') & !(CLNSIG has 'Benign')`

关键参数：`-Xmx8g`（JVM 堆，WGS 防 OutOfMemory，置于 `-jar` 前）；`-v` 详细进度；`-stats x.html` QC 报告；`-noStats` 关报告（批量更快）；`-canon` 仅注释规范转录本（缩小 ANN）；extractFields 的 `-s ","` 改分隔符、`-e "."` 填空字段。

## 示例

下载库 + 注释 + 过滤 HIGH 影响：
```bash
java -jar snpEff/snpEff.jar download hg38
java -Xmx8g -jar snpEff/snpEff.jar -v -stats snpeff_summary.html hg38 input.vcf.gz > annotated.vcf
bgzip annotated.vcf && tabix -p vcf annotated.vcf.gz
java -jar snpEff/SnpSift.jar filter "ANN[*].IMPACT = 'HIGH'" annotated.vcf.gz > high_impact.vcf
```

叠加 ClinVar / dbSNP（参考 VCF 须先建 tabix 索引）：
```bash
java -jar snpEff/SnpSift.jar annotate -info CLNSIG,CLNDN,CLNREVSTAT clinvar.vcf.gz annotated.vcf.gz > annotated_clinvar.vcf
java -jar snpEff/SnpSift.jar annotate GCF_000001405.40.gz annotated_clinvar.vcf > annotated_full.vcf
```

抽字段成 TSV：
```bash
java -jar snpEff/SnpSift.jar extractFields -s "," -e "." annotated_full.vcf \
    CHROM POS REF ALT "ANN[0].GENE" "ANN[0].EFFECT" "ANN[0].IMPACT" \
    "ANN[0].HGVS_P" "ANN[0].HGVS_C" "ANN[0].FEATUREID" AF CLNSIG CLNDN > variants_table.tsv
```

de novo 候选（trio，需联合分型多样本 VCF）：
```bash
java -jar snpEff/SnpSift.jar filter \
  "(ANN[*].IMPACT = 'HIGH' | ANN[*].IMPACT = 'MODERATE') \
   & (AF < 0.001 | AF = '.') & (GEN[proband].GT != './.') \
   & (GEN[mother].GT = '0/0') & (GEN[father].GT = '0/0')" \
  proband_ann.vcf > denovo_candidates.vcf
```

Python 用 cyvcf2 解析 ANN 进 pandas：
```python
import pandas as pd
from cyvcf2 import VCF
rows = []
for v in VCF("annotated_full.vcf.gz"):
    ann = v.INFO.get("ANN")
    if ann is None:
        continue
    f = ann.split(",")[0].split("|")   # 取最严重转录本；列：effect=1, impact=2, gene=3, hgvs_p=10
    rows.append({"chrom": v.CHROM, "pos": v.POS, "gene": f[3], "effect": f[1],
                 "impact": f[2], "hgvs_p": f[10], "af": v.INFO.get("AF"),
                 "clnsig": v.INFO.get("CLNSIG", ".")})
df = pd.DataFrame(rows)
print(df["impact"].value_counts())   # HIGH/MODERATE/LOW/MODIFIER 计数
```

自定义基因组库（非标准物种，FASTA+GTF）：把 `sequences.fa` / `genes.gtf` 放进 `snpEff/data/<NAME>/`，向 `snpEff.config` 追加 `<NAME>.genome : ...`，再 `java -jar snpEff.jar build -gtf22 -v <NAME>`。

## 注意事项

1. **内存**：WGS VCF 默认堆太小会 `OutOfMemoryError`；在 `-jar` 前加 `-Xmx8g`（或 16g）。
2. **染色体命名不一致**（`chr1` vs `1`）→ 每条变异 `ERROR_CHROMOSOME_NOT_FOUND`；用 `-noCheckChr` 或 `bcftools annotate --rename-chrs` 改名。
3. **版本错配**：所有变异 ANN 为空多因 VCF 参考版本与库不符；Ensembl 构建用 `GRCh38.86` 而非 UCSC `hg38`。
4. **filter 返回零行**：检查表达式语法、`ANN[*]` vs `ANN[0]`、字段名，并把表达式整体加引号。
5. **annotate 后 CLNSIG 缺失**：ClinVar VCF 未 `tabix` 建索引或 contig 不匹配。
6. **ANN 过大**（重叠转录本上千）：加 `-canon` 仅注释规范转录本，下游用 `ANN[0]`。
7. **extractFields 缺 HGVS_P 列**：非编码/UTR/内含子变异本就为空，用 `-e "."` 补位或先过滤到编码变异。
8. 坐标与产物：注释产出 `snpEff_summary.html`（QC）与 `snpEff_genes.txt`（按基因×后果计数），先看它们做质控。

## 互见

- requires：`genomic-file-toolkit` —— 注释前用 pysam/samtools/bcftools 处理 BAM/VCF、建索引、规范 contig 命名。
- related：`single-cell-rnaseq-analysis`、`gene-set-enrichment-analysis` —— 拿到 HIGH/MODERATE 基因列表后做表达/富集下游分析。
- combines_with：`nextflow-pipeline-builder` —— 把「调用→注释→过滤→抽表」编排成可复现流水线。

---
本条采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0）。
