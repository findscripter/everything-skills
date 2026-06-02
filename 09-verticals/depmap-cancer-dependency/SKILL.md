---
name: depmap-cancer-dependency
title: DepMap 癌症基因依赖图谱查询
description: 当需要判定某基因在特定癌种/突变背景细胞系中是否为生存依赖、寻找合成致死或药敏生物标志物时使用；做 DepMap CRISPR(Chronos) 依赖打分、选择性依赖筛选、共必需与生物标志物分析并产出排序结果；不适用于活体动物实验、临床患者数据或非肿瘤细胞系。触发词：DepMap、基因依赖、Chronos、合成致死、CRISPR筛选、靶点验证
domain: 领域/science
triggers: [DepMap, 癌症基因依赖, Chronos 依赖打分, 合成致死, 共必需基因, 靶点验证, 细胞系药敏, 选择性依赖, CRISPR 敲除筛选, gene effect]
tags: [生物信息, 癌症基因组学, DepMap, CRISPR, 靶点发现, 合成致死, Python, 数据分析]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Python, pandas, scipy, requests, DepMap API]
requires: []
related: [depmap-crispr-essentiality, gene-set-enrichment-analysis, opentargets-database, chembl-bioactivity-database]
combines_with: [single-cell-rnaseq-analysis]
license: MIT
source: K-Dense-AI/scientific-agent-skills
source_license: MIT
---
## 何时使用

需要从 Broad Institute 的癌症依赖图谱（DepMap）回答"某基因在哪些癌症细胞系中是生存所必需"的问题时使用。典型场景：

- **靶点验证**：某基因在特定突变背景（如 KRAS 突变）细胞系中是否必需？
- **选择性依赖**：基因是泛必需（所有细胞系都死，坏靶点）还是癌种选择性必需（好靶点）？
- **合成致死**：当 A 基因突变/缺失时，哪些基因变得选择性必需？
- **生物标志物发现**：哪些基因组特征（突变/表达/拷贝数）能预测对某基因敲除或某化合物的敏感性？
- **共必需分析**：哪些基因与目标基因的依赖谱高度相关（常同属一个复合物或通路）？

**不该用边界**：DepMap 仅覆盖体外癌症细胞系的 CRISPR/RNAi/化合物筛选数据，不适用于活体动物实验、临床患者样本、正常（非肿瘤）组织依赖性，以及单细胞或空间组学问题。需要患者层面预后/突变频率时改用 TCGA/cBioPortal 类资源。

## 步骤

1. **确定数据获取方式**：小批量查询走 API；大规模/全基因组分析推荐下载文件本地分析（更快更稳）。
2. **下载核心文件**（从 https://depmap.org/portal/download/all/ ，版本随期更新，如 24Q4）：至少 `CRISPRGeneEffect.csv` + `sample_info.csv`，按需加 mutation/expression/CN 文件。
3. **加载与对齐**：把 gene effect 矩阵（行=细胞系 DepMap_ID，列=基因）列名清洗为纯基因符号；与细胞系元数据按 DepMap_ID 合并。
4. **选定分析类型**：选择性依赖 / 生物标志物（突变×依赖） / 共必需相关性 / 合成致死。
5. **设阈值判读**：Chronos ≤ −0.5 视为可能依赖，≤ −1 为强依赖（泛必需区间）。
6. **校正与排雷**：全基因组关联做 FDR 多重检验校正；用表达数据排除"不表达即假阴性"，用拷贝数排除扩增假阳性。

## 指令

**核心概念 — 依赖打分**

| 打分 | 范围 | 含义 |
|------|------|------|
| Chronos (CRISPR) | ~ −3 至 0+ | 越负越必需；泛必需基因约 −1 至 −2 |
| RNAi DEMETER2 | ~ −3 至 0+ | 量纲同 Chronos |
| Gene Effect | 归一化 | 归一化 Chronos，−1 = 泛必需基因中位效应 |

阈值：Chronos ≤ −0.5 可能依赖；≤ −1 强依赖。细胞系标注关键字段：`DepMap_ID`（唯一 ID，如 `ACH-000001`）、`primary_disease`（癌种）、`lineage`（组织谱系）。

**API 基座与依赖查询**

```python
import requests, pandas as pd
BASE_URL = "https://depmap.org/portal/api"

def get_dependencies_slice(gene_symbol, dataset_name="CRISPRGeneEffect"):
    url = f"{BASE_URL}/data/gene_dependency"
    params = {"gene_name": gene_symbol, "dataset_name": dataset_name}
    return requests.get(url, params=params).json()
```

**下载式加载（推荐）**

```python
def load_depmap_gene_effect(filepath="CRISPRGeneEffect.csv"):
    df = pd.read_csv(filepath, index_col=0)
    df.columns = [col.split(" ")[0] for col in df.columns]  # 列名 "Symbol (EntrezID)" -> Symbol
    return df

def load_cell_line_info(filepath="sample_info.csv"):
    return pd.read_csv(filepath)
```

**选择性依赖筛选**

```python
def find_selective_dependencies(gene_effect_df, cell_line_info, target_gene,
                                cancer_type=None, threshold=-0.5):
    if target_gene not in gene_effect_df.columns:
        return None
    scores = gene_effect_df[target_gene].dropna()
    dependent = scores[scores <= threshold]
    result = pd.DataFrame({
        "DepMap_ID": dependent.index, "gene_effect": dependent.values
    }).merge(cell_line_info[["DepMap_ID","cell_line_name","primary_disease","lineage"]])
    if cancer_type:
        result = result[result["primary_disease"].str.contains(cancer_type, case=False, na=False)]
    return result.sort_values("gene_effect")
```

**生物标志物分析（突变 × 依赖，Mann–Whitney）**

```python
from scipy import stats
def biomarker_analysis(gene_effect_df, mutation_df, target_gene, biomarker_gene):
    if target_gene not in gene_effect_df.columns or biomarker_gene not in mutation_df.columns:
        return None
    common = gene_effect_df.index.intersection(mutation_df.index)
    scores = gene_effect_df.loc[common, target_gene].dropna()
    muts = mutation_df.loc[scores.index, biomarker_gene]
    mutated, wt = scores[muts == 1], scores[muts == 0]
    stat, pval = stats.mannwhitneyu(mutated, wt, alternative='less')  # 假设突变更依赖
    return {"n_mutated": len(mutated), "n_wt": len(wt),
            "mean_effect_mutated": mutated.mean(), "mean_effect_wt": wt.mean(),
            "pval": pval, "significant": pval < 0.05}
```

**共必需相关性**（要求两基因共有 ≥50 细胞系，取相关系数 top_n）：遍历各基因与目标基因 dropna 后取交集 `corr`，`pd.Series(...).sort_values(ascending=False).head(top_n)`。

## 示例

**KRAS 在肺癌中的选择性依赖**

```python
df_effect = load_depmap_gene_effect("CRISPRGeneEffect.csv")
cell_info = load_cell_line_info("sample_info.csv")
deps = find_selective_dependencies(df_effect, cell_info, "KRAS", cancer_type="Lung")
# 返回按 gene_effect 升序排列的肺癌细胞系，最负者依赖最强
```

**三类典型工作流**

- *靶点验证*：下载 effect+sample_info → 按癌种过滤 → 比较该癌种 vs 其余的平均 gene effect → 计算选择性 → 与突变/表达/拷贝数交叉验证。
- *合成致死筛选*：定位某基因突变/缺失的细胞系（如 BRCA1-mut）→ 对全基因组比较 mut vs WT 的 gene effect → 取在突变系中显著更必需者 → 按选择性与效应量过滤。
- *化合物药敏*：下载 PRISM 药敏数据 → 将化合物 AUC/log2FC 与基因组特征相关 → 找预测敏感性的标志物。

## 注意事项

- **优先用 Chronos** 而非 DEMETER2：对切割效率控制更好。
- **区分泛必需与癌种选择性**：低方差（所有系都必需）的基因是差靶点。
- **务必用表达数据验证**：不表达的基因无论真实功能如何都会评为非必需（假阴性）。
- **细胞系标识用 DepMap_ID**，不要用易歧义的 cell_line_name。
- **考虑拷贝数效应**：扩增基因可能因拷贝数效应假性显示为必需（junk DNA 假说）。
- **多重检验校正**：全基因组算生物标志物关联时务必做 FDR 校正。
- 数据版本会随季度更新（如 24Q4），下载链接与列名以当期 Portal/Figshare 为准。

## 互见

- DepMap Portal: https://depmap.org/portal/ ；数据下载: https://depmap.org/portal/download/all/
- 关键文献：Behan FM et al. 2019 Nature (PMID 30971826)；Chronos 方法 Dempster JM et al. 2021 Nat Methods (PMID 34349281)
- 仓库：https://github.com/broadinstitute/depmap-portal ；Figshare 24Q4: https://figshare.com/articles/dataset/DepMap_24Q4_Public/27993966
- 关键数据文件：`CRISPRGeneEffect.csv`（主依赖数据）、`RNAi_merged.csv`、`sample_info.csv`、`OmicsExpressionProteinCodingGenesTPMLogp1.csv`、`OmicsSomaticMutationsMatrixDamaging.csv`、`OmicsCNGene.csv`、`PRISM_Repurposing_Primary_Screens_Data.csv`
- 患者层面突变/预后分析请配合 TCGA / cBioPortal 类技能。

---
采编自 K-Dense-AI/scientific-agent-skills（原条目 license CC-BY-4.0；仓库整体 MIT）。
