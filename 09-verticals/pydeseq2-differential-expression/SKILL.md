---
name: pydeseq2-differential-expression
title: PyDESeq2 批量 RNA-seq 差异表达分析
description: 当你有批量 RNA-seq 原始整数计数矩阵 + 样本元数据，要做两组或多因子差异表达（DE）检验时使用；用纯 Python 的 PyDESeq2 拟合负二项 GLM、跑 Wald 检验（BH-FDR）、apeGLM LFC 收缩，产出 DE 结果表与火山图/MA 图；不适用于上游比对定量、单细胞每细胞 DE（先 pseudobulk）、通路富集（下游交富集技能）；触发词：差异表达、DESeq2、pydeseq2、RNA-seq、火山图、负二项、批次校正、Wald 检验、padj、log2FoldChange
domain: 领域/science
triggers: [差异表达, DESeq2, pydeseq2, RNA-seq, 火山图, 负二项, 批次校正, Wald 检验, padj, log2FoldChange]
tags: [rnaseq, differential-expression, pydeseq2, deseq2, bioinformatics, negative-binomial, wald-test, volcano-plot, science]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [pydeseq2, python, pandas, numpy, scipy, scikit-learn, anndata, matplotlib, seaborn]
requires: []
related: [star-rnaseq-aligner, gene-set-enrichment-analysis, single-cell-rnaseq-analysis, snakemake-workflow-engine]
combines_with: [star-rnaseq-aligner, gene-set-enrichment-analysis, matplotlib-visualization]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

当你有**批量 RNA-seq 的原始（未归一化）整数计数矩阵**和对应样本元数据，想找出条件间差异表达基因时使用本条。典型场景：

- 两组比较（如 treated vs control），需要正经的统计检验而非简单 fold change。
- 多因子设计、校正批次/协变量（如 `~batch + condition`）。
- 对一个模型跑多个 contrast（多个处理组 vs 共享对照）。
- 应用 apeGLM log2 fold change 收缩，用于排序与可视化。
- 产出火山图、MA 图、p 值分布/离散度 QC 图。
- 把 R 版 DESeq2 流程迁到纯 Python，或嵌入 scanpy/pandas 的 Python 生信管线。

**不该用的边界：**

- 上游比对/定量（FASTQ→counts）—— 用比对定量管线（如 nextflow-pipeline-builder）。
- 单细胞「每细胞」DE：细胞非独立观测会膨胀 p 值，**先 pseudobulk 聚合**（scanpy `sc.get.aggregate`）再喂本条。
- 通路/基因集富集 —— 属下游，交 gene-set-enrichment-analysis（用本条输出的 `stat` 列做预排序 GSEA）。
- 需要最广方法覆盖与社区验证的参考实现 —— 用 R/Bioconductor 的 **DESeq2** 或 **edgeR**。

## 步骤

PyDESeq2 期望 counts 为 **samples × genes** 的非负整数 DataFrame，metadata 为 **samples × variables** 且索引对齐。

1. **载入与校验**：读 counts/metadata；CSV 常为 genes × samples，需转置；按索引交集对齐两表。
2. **基因过滤**：去掉低表达基因（提统计功效、减多重检验负担）。
3. **建 `DeseqDataSet` 并拟合**：指定 Wilkinson 设计公式，`dds.deseq2()` 一次跑完 size factor → 离散度 → 趋势 → MAP 收缩 → LFC 拟合。
4. **Wald 检验**：`DeseqStats` 指定 `contrast=[变量, 检验水平, 参考水平]`，`ds.summary()` 出结果。
5. **（可选）LFC 收缩**：`ds.summary()` 之后再 `ds.lfc_shrink()`；收缩值用于可视化/排序，**不用于显著性判定**。
6. **过滤与导出**：按 `padj` + `|log2FoldChange|` 筛选，拆上调/下调，导 CSV。
7. **可视化 + QC**：火山图、MA 图、p 值分布 + 离散度图。

## 指令

```bash
pip install pydeseq2 matplotlib seaborn
# 依赖：pydeseq2>=0.4, pandas>=1.4, numpy>=1.23, scipy>=1.11, scikit-learn>=1.1, anndata>=0.8；Python 3.10+
```

关键参数（建模时把协变量放在关注变量**之前**）：

| 参数 | 默认 | 作用 |
|---|---|---|
| `design` | 必填 | Wilkinson 公式，如 `~batch + condition` |
| `contrast` | `None` | `[var, test, ref]`；`None` 用最后一个系数 |
| `alpha` | `0.05` | 显著性 FDR 阈值 |
| `refit_cooks` | `True` | 去 Cook's 距离离群后重拟合 |
| `cooks_filter` / `independent_filter` | `True` | 检验时 Cook's 过滤 / 独立过滤提功效 |
| `n_cpus` | `1` | 离散度拟合并行线程 |
| `lfc_shrink()` | 关 | `summary()` 后调用；apeGLM 收缩噪声 LFC |

## 示例

载入、对齐与过滤：

```python
import pandas as pd
counts_raw = pd.read_csv("counts.csv", index_col=0)
metadata = pd.read_csv("metadata.csv", index_col=0)
counts_df = counts_raw.T if counts_raw.shape[0] > counts_raw.shape[1] else counts_raw  # → samples×genes
common = counts_df.index.intersection(metadata.index)        # 对齐索引，避免 Index mismatch
counts_df, metadata = counts_df.loc[common], metadata.loc[common]
counts_df = counts_df.loc[:, counts_df.sum(axis=0) >= 10]    # 过滤总计数<10 的基因
```

拟合 → 检验 →（可选）收缩 → 导出：

```python
from pydeseq2.dds import DeseqDataSet
from pydeseq2.ds import DeseqStats

dds = DeseqDataSet(counts=counts_df, metadata=metadata,
                   design="~condition", refit_cooks=True, n_cpus=4)
dds.deseq2()   # size factors → dispersions → trend → MAP → LFC

ds = DeseqStats(dds, contrast=["condition", "treated", "control"],
                alpha=0.05, cooks_filter=True, independent_filter=True)
ds.summary()
results = ds.results_df
ds.lfc_shrink()   # 必须在 summary() 之后；只改 log2FoldChange，供可视化/排序

sig = results[(results.padj < 0.05) & (results.log2FoldChange.abs() > 1.0)].copy()
sig[sig.log2FoldChange > 0].sort_values("padj").to_csv("deseq2_upregulated.csv")
sig[sig.log2FoldChange < 0].sort_values("padj").to_csv("deseq2_downregulated.csv")
results.to_csv("deseq2_all_results.csv")
```

火山图（MA 图把横轴换成 `log10(baseMean+1)`、纵轴 `log2FoldChange`）：

```python
import matplotlib.pyplot as plt, numpy as np
res = results.dropna(subset=["padj"]).copy()
res["-log10_padj"] = -np.log10(res.padj)
is_sig = (res.padj < 0.05) & (res.log2FoldChange.abs() > 1.0)
fig, ax = plt.subplots(figsize=(10, 7))
ax.scatter(res.loc[~is_sig,"log2FoldChange"], res.loc[~is_sig,"-log10_padj"], c="grey", s=8, alpha=.3)
ax.scatter(res.loc[is_sig & (res.log2FoldChange>0),"log2FoldChange"],
           res.loc[is_sig & (res.log2FoldChange>0),"-log10_padj"], c="firebrick", s=12, alpha=.6)
ax.scatter(res.loc[is_sig & (res.log2FoldChange<0),"log2FoldChange"],
           res.loc[is_sig & (res.log2FoldChange<0),"-log10_padj"], c="steelblue", s=12, alpha=.6)
ax.axhline(-np.log10(0.05), ls="--", c="k", alpha=.4); ax.axvline(-1, ls="--", c="k", alpha=.4); ax.axvline(1, ls="--", c="k", alpha=.4)
plt.tight_layout(); plt.savefig("volcano_plot.png", dpi=300)
```

多 contrast / 批次校正：

```python
dds = DeseqDataSet(counts=counts_df, metadata=metadata, design="~condition"); dds.deseq2()
for name, c in {"A_vs_ctrl":["condition","treatment_A","control"],
                "B_vs_ctrl":["condition","treatment_B","control"]}.items():
    s = DeseqStats(dds, contrast=c, alpha=0.05); s.summary()
    s.results_df.to_csv(f"results_{name}.csv")

# 批次校正：协变量放公式最前；先查是否与条件混杂
print(pd.crosstab(metadata["batch"], metadata["condition"]))
dds = DeseqDataSet(counts=counts_df, metadata=metadata, design="~batch + condition"); dds.deseq2()
```

## 注意事项

- **counts 必须是原始未归一化整数**；size factor >5 多半是误传了已归一化数据或文库异常。
- **样本名要对齐**：`Index mismatch` 用 `counts_df.index.intersection(metadata.index)` 解决。
- **设计矩阵满秩**：`Design matrix is not full rank` 说明变量混杂（如某批次全是 treated），用 `pd.crosstab()` 查，简化设计或剔除混杂变量。
- **`padj` 全 NaN**：基因零方差/全零计数 —— 加严过滤（提高 `min_total_counts`）。
- **没有显著基因**：先看 p 值分布（健康分布应近似平坦 + 0 附近有峰）；可放宽 `alpha` 或 `|LFC|` 阈值。
- **收缩顺序**：永远先 `ds.summary()` 再 `ds.lfc_shrink()`；收缩值仅供排序/作图，显著性看未收缩的 `padj`。
- **下游富集**：用 `results["stat"]`（带方向与证据强度）构造预排序 GSEA，比按 `log2FoldChange` 更稳。
- **内存不足**：先更激进地预过滤基因、减小 `n_cpus`。
- 断点续跑：`pickle.dump(dds.to_picklable_anndata(), f)` 存拟合结果，免重跑昂贵步骤。

## 互见

- combines_with：`gene-set-enrichment-analysis` —— 把 DE 基因 / `stat` 排序表交给富集分析做通路解读（标准下游）。
- combines_with：`single-cell-rnaseq-analysis` —— 单细胞跨条件严谨 DE 需先 pseudobulk 聚合再用本条。
- related：`genomic-file-toolkit` —— 处理上游基因组文件与计数表 I/O。
- related：`nextflow-pipeline-builder` —— 用管线产出 counts 矩阵作为本条输入。

---

本条采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0），适配重写而非逐字翻译。
