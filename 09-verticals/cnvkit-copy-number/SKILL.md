---
name: cnvkit-copy-number
title: CNVkit 体细胞拷贝数变异检测
description: 当需要从 WES/WGS/靶向 panel 的 BAM 检测体细胞拷贝数变异（CNV）时使用；用 CNVkit（v0.9.x，CLI+cnvlib）对 target/antitarget bin 测深、对参照归一、CBS/HMM 分段、call 扩增/缺失、估纯度倍性并产出 cnr/cns/scatter/diagram 及 VCF/SEG/BED；不适用于带大型 PoN 的深度 WGS 队列（用 GATK CNV）或需 B-allele 频率建模（用 Control-FREEC）；触发词：CNVkit、拷贝数变异、CNV、体细胞、扩增缺失、肿瘤纯度、SEG
domain: 领域/science
triggers: [CNVkit, 拷贝数变异, CNV, 体细胞, 扩增缺失, 肿瘤纯度, SEG, cnvlib]
tags: [cnvkit, cnv, copy-number, bioinformatics, somatic, wes, wgs, science]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [cnvkit, cnvlib, python, samtools, R, DNAcopy, matplotlib]
requires: []
related: [gatk-variant-calling, snpeff-variant-annotation, genomic-file-toolkit, star-rnaseq-aligner]
combines_with: [genomic-file-toolkit, snakemake-workflow-engine]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

当你需要从 BAM 文件检测**体细胞拷贝数变异（CNV）**时使用本条，典型场景：

- 从肿瘤-正常配对的 WES / 靶向 panel 测序 call 体细胞 CNV
- 仅有肿瘤样本（tumor-only）时，用 pooled normal 或 flat 参照检测拷贝数改变
- WGS 数据用 `--method wgs` 跑全基因组均匀 bin
- 估计未知样本的肿瘤纯度（purity）与倍性（ploidy），以解读拷贝比
- 为 GISTIC2 / cBioPortal / IGV 生成 SEG 文件
- 识别 focal 扩增（ERBB2、MYC、EGFR…）或纯合缺失（CDKN2A、RB1…）

**不该用本条的边界：**

- 带大型配对正常 panel（PoN）的深度 WGS 队列 → 用 **GATK CNV**（`gatk DenoiseReadCounts` / `ModelSegments`）更合适
- 需要等位基因频率 / B-allele fraction 建模 → 用 **Control-FREEC**
- CNVkit 的优势在靶向/外显子（antitarget off-target bin 价值大），不是深度 WGS

## 步骤

1. 准备：sorted+indexed BAM（肿瘤±配对正常）、capture target BED、参照基因组 FASTA、R+DNAcopy（CBS 需要）
2. 建参照（reference）：配对正常 / flat / pooled 三选一，校正 GC、可比对性，设中性基线
3. 测深：`target`/`antitarget` 切 bin，`coverage` 算 target 与 antitarget 每 bin 深度
4. 归一：`fix` 对参照归一化（GC、文库深度、捕获效率），产出 `.cnr`
5. 分段：`segment` 用 CBS（需 R DNAcopy）或 HMM（无需 R、更快），产出 `.cns`
6. call 状态：`call` 赋整数 CN，分类扩增/缺失，可带 `--purity`/`--ploidy`
7. 可视化：`scatter` / `diagram` / `heatmap`
8. 估纯度倍性：`call --purity auto --method clonal`
9. 导出：`export vcf|seg|bed` 供下游工具

## 指令

安装前先查环境是否已有（pixi/conda 内常见）：`command -v cnvkit.py`，有则跳过；pixi 项目内用 `pixi run cnvkit.py`。

```bash
# 安装（推荐 conda，自动处理 R/DNAcopy 依赖）
conda install -c bioconda cnvkit
cnvkit.py version                     # cnvkit 0.9.10
# CBS 分段需 R DNAcopy：
Rscript -e 'if(!requireNamespace("BiocManager")) install.packages("BiocManager"); BiocManager::install("DNAcopy")'
samtools index tumor.bam; samtools index normal.bam
```

一键配对分析（WES，hybrid 法）：

```bash
cnvkit.py batch tumor.bam --normal normal.bam \
    --targets targets.bed --fasta GRCh38.fa \
    --output-dir cnvkit_results/ --diagram --scatter --method hybrid
# 产出：.targetcoverage.cnn/.antitargetcoverage.cnn/.cnr/.cns/-scatter.png/-diagram.pdf
```

关键参数：

| 参数 | 默认 | 选项 | 作用 |
|---|---|---|---|
| `--method`(batch) | `hybrid` | `hybrid`/`wgs`/`amplicon` | 测序类型，决定 target 切 bin 策略 |
| `--method`(segment) | `cbs` | `cbs`/`hmm`/`haar`/`none` | 分段算法；cbs 需 R DNAcopy |
| `--ploidy`(call) | `2` | `1`–`6` | 绝对 CN 的基线倍性 |
| `--purity`(call) | `1.0` | `0.1`–`1.0`/`auto` | 肿瘤细胞比例，校正正常细胞掺入 |
| `--antitarget-avg-size` | `150000` | `1e4`–`5e5` bp | antitarget bin 越大越少噪声 |
| `--drop-low-coverage`(segment) | off | flag | 分段前丢弃 <5× 的 bin |

## 示例

分步流水线（pooled 参照 → 归一 → 分段 → call）：

```bash
# 建 pooled normal 参照（最稳健）
cnvkit.py batch normal1.bam normal2.bam normal3.bam --normal \
    --targets targets.bed --fasta GRCh38.fa \
    --output-reference pooled_reference.cnn --output-dir normals_cov/

# 切 bin + 测深
cnvkit.py target targets.bed --annotate refFlat.txt --split -o targets.split.bed
cnvkit.py antitarget targets.bed --access access-5k-mappable.hg38.bed -o antitargets.bed
cnvkit.py coverage tumor.bam targets.split.bed -o tumor.targetcoverage.cnn
cnvkit.py coverage tumor.bam antitargets.bed   -o tumor.antitargetcoverage.cnn

# 归一 → 分段 → call
cnvkit.py fix tumor.targetcoverage.cnn tumor.antitargetcoverage.cnn pooled_reference.cnn -o tumor.cnr
cnvkit.py segment tumor.cnr -o tumor.cns --method cbs       # 或 --method hmm（无需 R）
cnvkit.py call tumor.cns --purity 0.7 --ploidy 2 -o tumor.call.cns

# 可视化 + 导出
cnvkit.py scatter tumor.cnr -s tumor.cns -o tumor-scatter.png
cnvkit.py diagram tumor.cnr -s tumor.cns -o tumor-diagram.pdf
cnvkit.py export seg tumor.call.cns -o tumor.seg            # GISTIC2/cBioPortal
cnvkit.py export vcf tumor.call.cns -o tumor.cnv.vcf
```

tumor-only（无配对正常，用 flat 参照）：

```bash
cnvkit.py reference --targets targets.bed --fasta GRCh38.fa --output flat_reference.cnn
cnvkit.py batch tumor.bam --reference flat_reference.cnn --output-dir tumor_only_results/
```

WGS 模式（无需 capture BED，全基因组均匀 bin）：

```bash
cnvkit.py batch tumor_wgs.bam --normal normal_wgs.bam --method wgs \
    --fasta GRCh38.fa --output-dir wgs_results/ --scatter
```

Python API（cnvlib）解析 .cnr/.cns 并按 log2 分类癌基因 CNV：

```python
import cnvlib
cns = cnvlib.read("tumor.call.cns"); df = cns.data
# log2 阈值（二倍体）：>=1.0 AMP / >=0.2 GAIN / <=-1.0 LOSS / <=-3.5 HOMDEL
def classify(x):
    if x >= 1.0: return "AMP"
    if x >= 0.2: return "GAIN"
    if x <= -3.5: return "HOMDEL"
    if x <= -1.0: return "LOSS"
    return "NEUTRAL"
df["cnv_class"] = df["log2"].apply(classify)
onco = ["ERBB2","MYC","EGFR","CCND1","CDK6","MDM2","KRAS"]
amps = df[(df["cnv_class"]=="AMP") &
          df["gene"].str.split(",").apply(lambda g: any(x in onco for x in g))]
print(df["cnv_class"].value_counts(), amps[["chromosome","gene","log2","cn"]])
```

估纯度倍性：`cnvkit.py call tumor.cns --purity auto --ploidy 2 --method clonal --center median -o tumor.call.auto.cns`。

## 注意事项

- **染色体命名一致**：BAM、BED、FASTA 的 `1` vs `chr1` 必须统一，否则结果错乱。
- **antitarget 高噪声**（off-target <0.1× 均深）：加大 `--antitarget-avg-size` 到 500kb，分段前加 `--drop-low-coverage`。
- **CBS 报 `Error in DNAcopy`**：R DNAcopy 未装/不兼容 → `BiocManager::install("DNAcopy")`，或改 `--method hmm`（无需 R）。
- **所有段都接近 0（测不到 CNV）**：可能纯度过低（<20%）或覆盖太浅 → 用 `--purity auto` 验证，查 target 深度。
- **GC 波浪偏差**：用配对正常 BAM 重建参照，并确保 `reference` 带 `--fasta` 做 GC 校正。
- **过度分段（碎段多）**：加 `--threshold 0.2` 或 `--smooth-cbs` 降低假边界。
- **覆盖要求**：WES 建议 target 均深 ≥50×，WGS 20–30× 即可。
- **purity 校正**：`call --purity` 把 log2 比按掺入正常细胞回算到绝对 CN，纯度未知时优先 `auto`。
- **`ImportError: cnvlib`**：激活正确 conda 环境后再跑（`conda activate cnvkit_env`）。

## 互见

- related：`genomic-file-toolkit` —— BAM/BED/VCF/FASTA 等基因组文件的检查与转换
- related：`single-cell-rnaseq-analysis`、`gene-set-enrichment-analysis`、`scientific-database-lookup`
- combines_with：`nextflow-pipeline-builder` —— 把 CNVkit batch 编排进多样本队列流水线
- combines_with：`guided-statistical-analysis` —— 对 SEG/段级 CNV 表做下游统计与可视化

---

本条采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0），适配重写而非逐字翻译。源技能原始许可 Apache-2.0。
