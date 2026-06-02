---
name: maxquant-proteomics
title: MaxQuant 蛋白质组学定量流程
description: 当用 MaxQuant 做 LFQ/SILAC/TMT 蛋白质组学定量、并在 Python 中分析 proteinGroups.txt（过滤污染/decoy、log2 中位归一、MNAR 补值、t 检验+FDR、火山图、GO/通路富集）时使用；产出差异丰度表与发表级图表；不适用于 Thermo 原生处理（用 Proteome Discoverer）、GPU 加速搜库或 DIA（用 FragPipe/MSFragger）；触发词：MaxQuant、proteinGroups、LFQ、SILAC、Perseus、火山图、蛋白质组学
domain: 领域/science
triggers: [MaxQuant, proteinGroups, LFQ, SILAC, Perseus, 火山图, 蛋白质组学, 差异丰度]
tags: [proteomics, maxquant, perseus, lfq, silac, mass-spectrometry, differential-abundance, science]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [maxquant, python, pandas, numpy, scipy, statsmodels, matplotlib, seaborn, gseapy]
requires: []
related: [pyopenms-mass-spectrometry, pydeseq2-differential-expression, gene-set-enrichment-analysis, guided-statistical-analysis]
combines_with: [gene-set-enrichment-analysis, pyopenms-mass-spectrometry]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

当你需要从 LC-MS/MS 原始数据做蛋白定量并下游统计分析时使用本条，典型场景：

- 跨多个生物学条件做无标记定量（LFQ，MaxLFQ 是社区基准算法）
- SILAC（轻/重或三标）、iTRAQ/TMT 同位素标记定量
- 需要广泛引用的 MaxQuant 输出格式（`proteinGroups.txt`）以便与已发表数据集对齐
- 不装 Perseus（仅 Windows GUI）也要在可复现的 Python 脚本里完成过滤/归一化/补值/差异检验/可视化/富集

**不该用本条的边界：**

- 处理 Thermo `.raw` 需要仪器原生流程或 Sequest HT → 用 Proteome Discoverer
- 需要 GPU 加速搜库（快 3–10×）或处理 DIA（数据非依赖采集）数据 → 用 FragPipe/MSFragger

## 步骤

1. 配置 `mqpar.xml`（酶、修饰、LFQ、FDR 阈值），可用 Python `xml.etree` 程序化改写文件路径/实验名/FASTA
2. 命令行跑 MaxQuant（Windows `MaxQuantCmd.exe`，Linux/macOS 可 Wine）
3. 载入 `combined/txt/proteinGroups.txt`，过滤 reverse decoy、potential contaminant、only-by-site
4. 取 `LFQ intensity *` 列，0→NaN，log2 变换，按样本中位数中心化
5. MNAR 补值（从下移高斯分布抽样，对应 Perseus 标准做法）
6. 两样本 t 检验 + Benjamini-Hochberg FDR 校正
7. 火山图（log2FC vs -log10 padj）+ GO/KEGG 富集（gseapy Enrichr 或 STRING API）

## 指令

环境：

```bash
pip install pandas numpy scipy matplotlib seaborn statsmodels gseapy
# 可选：程序化配置 mqpar.xml
pip install pymaxquant
```

MaxQuant：Windows 软件（v2.4+，需 .NET 6），https://maxquant.org/

```bat
REM Windows 命令行，用配好的 mqpar.xml 跑
set MQ_PATH=C:\Program Files\MaxQuant\bin\MaxQuantCmd.exe
"%MQ_PATH%" C:\Projects\proteomics\mqpar.xml
REM 只重跑部分步骤（step ID：0=写表 1=特征检测 7=肽段鉴定）
"%MQ_PATH%" mqpar.xml --steps 1,7,11
```

```bash
# 跨平台：Linux/macOS 服务器/CI 用 Wine
wine MaxQuantCmd.exe mqpar.xml
tail -f combined/proc/#runningTimes.txt   # 监控进度
```

`mqpar.xml` 关键参数：

```xml
<enzymes><string>Trypsin/P</string></enzymes>
<maxMissedCleavages>2</maxMissedCleavages>
<fixedModifications><string>Carbamidomethyl (C)</string></fixedModifications>
<variableModifications>
  <string>Oxidation (M)</string>
  <string>Acetyl (Protein N-term)</string>
</variableModifications>
<lfqMode>1</lfqMode>                     <!-- 1=启用 LFQ -->
<lfqMinRatioCount>2</lfqMinRatioCount>
<matchBetweenRuns>True</matchBetweenRuns> <!-- 提升定量蛋白数 10–30% -->
<peptideFdr>0.01</peptideFdr>
<proteinFdr>0.01</proteinFdr>
```

## 示例

```python
import pandas as pd, numpy as np
from scipy import stats
from statsmodels.stats.multitest import multipletests

# 1) 载入并质控过滤
df = pd.read_csv("combined/txt/proteinGroups.txt", sep="\t", low_memory=False)
df = df[
    (df.get("Reverse", "") != "+") &
    (df.get("Potential contaminant", "") != "+") &
    (df.get("Only identified by site", "") != "+")
].copy()
df["Gene names"] = df["Gene names"].fillna("Unknown").str.split(";").str[0]
df = df.set_index("Majority protein IDs")

# 2) LFQ 矩阵：0→NaN、log2、按样本中位数中心化
lfq_cols = [c for c in df.columns if c.startswith("LFQ intensity ")]
lfq = df[lfq_cols].replace(0, np.nan)
lfq.columns = [c.replace("LFQ intensity ", "") for c in lfq_cols]
lfq = np.log2(lfq)
med = lfq.median(axis=0)
lfq = lfq.subtract(med, axis=1).add(med.median())   # 中位归一

# 3) MNAR 补值（下移高斯，对应 Perseus 默认 downshift=1.8 width=0.3）
def impute_mnar(m, width=0.3, downshift=1.8, seed=42):
    rng = np.random.default_rng(seed); out = m.copy()
    for c in out.columns:
        d = out[c].dropna(); n = out[c].isna().sum()
        if n: out.loc[out[c].isna(), c] = rng.normal(
            d.mean() - downshift*d.std(), width*d.std(), n)
    return out
lfq = impute_mnar(lfq)

# 4) 两样本 t 检验 + BH FDR
ctrl, treat = ["ctrl_1","ctrl_2","ctrl_3"], ["treat_1","treat_2","treat_3"]
rows = []
for pid, r in lfq.iterrows():
    a, b = r[ctrl].dropna().values, r[treat].dropna().values
    if len(a) >= 2 and len(b) >= 2:
        t, p = stats.ttest_ind(a, b, equal_var=False)
        rows.append({"protein_id": pid, "log2FC": b.mean()-a.mean(), "pvalue": p})
res = pd.DataFrame(rows).set_index("protein_id")
res["padj"] = multipletests(res["pvalue"], method="fdr_bh")[1]
res["significant"] = res["padj"] < 0.05
print("显著蛋白(FDR<0.05):", res["significant"].sum())
```

火山图：按 `log2FC`/`padj` 给 up/down/ns 着色，画阈值线，标注 -log10p 最高的前 N 个基因，`plt.savefig("volcano_plot.pdf", dpi=300)`。

GO/通路富集（gseapy）：对显著上/下调基因分别跑 ORA：

```python
import gseapy as gp
up_genes = df.loc[res[res.significant & (res.log2FC>0)].index, "Gene names"].tolist()
gp.enrichr(gene_list=up_genes, organism="Human",
           gene_sets=["GO_Biological_Process_2023", "KEGG_2021_Human"],
           outdir="enrichment_up", cutoff=0.05)
```

SILAC 变体：不取 `LFQ intensity`，改取 `Ratio H/L normalized *` 列，0→NaN 后 log2。
热图：`seaborn.clustermap` 对显著蛋白做行 Z-score（`cmap="RdBu_r", center=0`）。
免下载本地基因集时可改用 STRING `/enrichment` 端点（POST，物种 9606）。

## 注意事项

- **MaxQuant 缺失值编码为 0**：log2 前务必 `replace(0, np.nan)`，否则 `log2(0)=-inf` 污染统计。
- **富集用 HGNC 基因符号**，不是 UniProt ID；Enrichr 空结果多因符号不识别或网络超时（`timeout=60`）。
- **补值别太激进**：`downshift` 偏小会膨胀假阳性，保守用 2.0–2.5；或先要求每组 ≥2/≥3 有效值再检验。
- **内存**：`proteinGroups.txt` 可达数百 MB，用 `usecols=[...]` 或 `chunksize` 按需读列。
- **关键参数**：`matchBetweenRuns=True` 提升定量数但引入按保留时间转移的鉴定；`lfqMinRatioCount` 调低增覆盖但降准确；`fc_threshold` 火山图默认 log2FC=1.0。
- **0 鉴定排查**：核对 `.raw` 路径为绝对 Windows 路径、酶设置匹配实验、看 `summary.txt` 鉴定率；"Feature detection" 卡住通常是内存不足（每 3–4 个 raw 约需 4–8 GB）。
- **量化口径**：跨样本比较用 `LFQ intensity`（折叠变化）；样本内蛋白绝对丰度/拷贝数用 `iBAQ`；小幅变化 SILAC H/L 比值更准。

## 互见

- related：`gene-set-enrichment-analysis` —— 富集分析的通用方法与可视化
- related：`scientific-database-lookup` —— 蛋白/基因 ID 映射与 UniProt 查询
- related：`guided-statistical-analysis` —— t 检验/多重校正等统计选型把关
- combines_with：`nextflow-pipeline-builder` —— 把 MaxQuant+下游分析封装成可复现流水线
- combines_with：`scientific-manuscript-writing` —— 将差异丰度结果与图表写入论文

---

本条采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0），适配重写而非逐字翻译。
