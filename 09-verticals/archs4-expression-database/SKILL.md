---
name: archs4-expression-database
title: ARCHS4 RNA-seq 表达数据库
description: 当需要查 ARCHS4 跨 100 万+ 人/鼠 RNA-seq 样本的组织表达 z-score、共表达基因、按元数据搜样本，或取批量 HDF5 表达矩阵时使用；用 requests 直连 REST API（免鉴权）产出组织 z-score 表、共表达基因表、GEO/SRA 样本表与组织柱状/热图。不适用于变异群体频率（用 gnomad-population-database）、基因列表通路富集（用 gget-genomic-databases/gene-set-enrichment-analysis）、原始 series matrix 下载（用 geo-database）。触发词：ARCHS4、z-score、共表达、组织表达、RNA-seq、HDF5
domain: 领域/science
triggers: [ARCHS4, 组织表达 z-score, 共表达基因, correlations 共表达, RNA-seq 样本搜索, HDF5 表达矩阵, guilt-by-association, 组织特异性, maayanlab, GEO 样本元数据, co-expression network, h5py 切片]
tags: [science, 基因组学, rna-seq, archs4, rest-api, 基因表达, 共表达]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Bash, requests, pandas, matplotlib, h5py]
requires: []
related: [geo-database, gget-genomic-databases, encode-database, cellxgene-census]
combines_with: [pydeseq2-differential-expression, gene-set-enrichment-analysis, single-cell-rnaseq-analysis]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

适用：

- 查某个基因跨数百种组织/细胞类型的 **z-score 标准化表达谱**（组织特异性 vs 看家基因判断）。
- 找与查询基因 **共表达** 的基因（共表达网络 / guilt-by-association 推断通路伙伴、调控因子、候选靶点）。
- 按组织、疾病、细胞类型、处理等 **元数据关键词搜 RNA-seq 样本**，拿 GEO/SRA 样本 ID 供重分析选数。
- 跨组织对比多个基因的表达谱，给湿实验候选排序。
- 取 **HDF5 表达矩阵**（gene × sample 计数）做大规模跨研究分析 / 机器学习。
- 用群体级组织表达方向校验差异表达结果。

不该用（负边界）：

- 变异级群体等位基因频率 —— 用 `gnomad-population-database`；ARCHS4 只给表达证据。
- 基因列表的 Enrichr 通路富集 —— 用 `gget-genomic-databases`（`gget enrichr`）或 `gene-set-enrichment-analysis`。
- 下载并解析某个 GSE 的原始 series matrix / phenotype 表 —— 用 `geo-database`。

## 步骤 / 指令

1. 环境：仅需 `requests`、`pandas`（作图加 `matplotlib`/`seaborn`，读 HDF5 加 `h5py`）。**无需 API key**。pixi/conda 内用 `pixi run python ...`。
   ```bash
   pip install requests pandas matplotlib seaborn   # 批量再加 h5py
   ```
2. 固定基址：`ARCHS4_BASE = "https://maayanlab.cloud/archs4/api/v1"`。所有调用 `GET {BASE}/{endpoint}`，`r.raise_for_status()` 后取 `r.json()`。
3. 端点速记：
   - 组织 z-score：`meta/genes/{gene}/zscore` → `{"values": [{"tissue","zscore"}, ...]}`
   - 共表达：`meta/genes/{gene}/correlations`（参数 `limit`）→ `{"values": [{"gene","correlation"}, ...]}`
   - 样本搜索：`samples/search`（参数 `query`、`limit`、`offset`）→ `{"samples": [...]}`
   - 基因元数据：`meta/genes/{gene}` → 含 `ensembl_gene_id`、`description` 等
4. **按物种匹配符号大小写**：人用 HGNC 大写（`TP53`）；鼠用 MGI 首字母大写（`Trp53`）。`species` 取 `"human"`/`"mouse"`。大小写错或用 Ensembl ID **会返回空 `values` 而不报错**。
5. **批量查询要 sleep**：软限速约 10 req/s。顺序循环每次 `time.sleep(0.1)`，更密的批量用 0.5s，避免 `429 Too Many Requests`。
6. **z-score 是逐基因相对全样本算的**：z=0 为该基因群体均值，z>2 约处于该基因前 ~2.5% 样本。跨基因比较时务必标注是哪个基因、哪个组织背景。
7. **50+ 基因或要逐样本值 → 下 HDF5**：REST 只给聚合谱、无逐样本数据。下载一次 `*_gene_v2.6.h5`（人/鼠，约 30–60 GB），用 `h5py` 切片，比逐个 REST 快约 100× 且不撞限速。

## 示例

快速上手（TP53 组织 z-score Top5）：

```python
import requests
BASE = "https://maayanlab.cloud/archs4/api/v1"

def archs4_get(endpoint, params=None):
    r = requests.get(f"{BASE}/{endpoint}", params=params, timeout=30)
    r.raise_for_status()
    return r.json()

vals = archs4_get("meta/genes/TP53/zscore").get("values", [])
for t in sorted(vals, key=lambda x: x.get("zscore", 0), reverse=True)[:5]:
    print(f"  {t['tissue']:<35} z={t['zscore']:.2f}")
# thymus  z=2.81 / testis  z=2.44 ...
```

组织 z-score 转 DataFrame（按物种）：

```python
import pandas as pd
def gene_tissue_zscore(gene, species="human"):
    r = requests.get(f"{BASE}/meta/genes/{gene}/zscore",
                     params={"species": species}, timeout=30)
    r.raise_for_status()
    df = pd.DataFrame(r.json().get("values", []))
    return df.sort_values("zscore", ascending=False).reset_index(drop=True)

df = gene_tissue_zscore("MYC")               # 人
df_m = gene_tissue_zscore("Myc", species="mouse")  # 鼠：MGI 首字母大写
```

共表达基因（Pearson 相关，过滤 >0.7 视为高共表达）：

```python
def coexpressed(gene, top_n=50, species="human"):
    r = requests.get(f"{BASE}/meta/genes/{gene}/correlations",
                     params={"species": species, "limit": top_n}, timeout=30)
    r.raise_for_status()
    df = pd.DataFrame(r.json().get("values", []))
    return df.sort_values("correlation", ascending=False).reset_index(drop=True)

coexp = coexpressed("PCNA", top_n=20)
gene_list = coexp["gene"].tolist()   # 可直接喂 Enrichr / 通路分析
```

按元数据搜样本（取 GEO 系列供重分析）：

```python
def search_samples(keyword, species="human", limit=100):
    r = requests.get(f"{BASE}/samples/search",
                     params={"query": keyword, "species": species, "limit": limit},
                     timeout=30)
    r.raise_for_status()
    return pd.DataFrame(r.json().get("samples", []))

samples = search_samples("pancreatic cancer", limit=50)
series = samples["series_id"].dropna().unique()   # 唯一 GSE，导出供 GEO 下载
```

组织表达柱状图（z>0 红 / z<0 蓝）：

```python
import matplotlib.pyplot as plt
def plot_tissue(gene, top_n=20, species="human", out=None):
    r = requests.get(f"{BASE}/meta/genes/{gene}/zscore",
                     params={"species": species}, timeout=30); r.raise_for_status()
    df = pd.DataFrame(r.json().get("values", [])).sort_values("zscore", ascending=False).head(top_n)
    colors = ["#D73027" if z > 0 else "#4575B4" for z in df["zscore"]]
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.barh(df["tissue"][::-1], df["zscore"][::-1], color=colors[::-1])
    ax.axvline(0, color="black", lw=0.8, ls="--"); ax.set_xlabel("Expression Z-Score")
    plt.tight_layout(); plt.savefig(out or f"{gene}_tissue.png", dpi=150, bbox_inches="tight")

plot_tissue("BRCA1", top_n=15)
```

HDF5 批量读取（下载后用 h5py 切片）：

```python
# 下载 URL：https://maayanlab.cloud/archs4/files/human_gene_v2.6.h5（mouse_/_transcript_ 同理）
import h5py
def extract_gene_h5(path, gene, n=1000):
    with h5py.File(path, "r") as f:
        genes = [g.decode() for g in f["meta"]["genes"]["gene_symbol"][:]]
        if gene not in genes:
            raise ValueError(f"{gene} not in HDF5")
        i = genes.index(gene)
        expr = f["data"]["expression"][i, :n]
        sids = [s.decode() for s in f["meta"]["samples"]["geo_accession"][:n]]
    return {"gene": gene, "expression": expr, "sample_ids": sids}
```

多基因组织热图（panel × tissue，挑 max|z| 最大的组织）：

```python
import seaborn as sns, time
panel, all_data = ["MYC","TP53","BRCA1","EGFR","KRAS"], {}
for g in panel:
    all_data[g] = gene_tissue_zscore(g).set_index("tissue")["zscore"]; time.sleep(0.1)
mat = pd.DataFrame(all_data).T
top = mat.abs().max(axis=0).sort_values(ascending=False).head(25).index
sns.heatmap(mat[top], cmap="RdBu_r", center=0, vmin=-3, vmax=3, cbar_kws={"label":"Z-Score"})
plt.tight_layout(); plt.savefig("archs4_panel_heatmap.png", dpi=150, bbox_inches="tight")
```

## 注意事项

- **关键参数**：`species`（`human`/`mouse`，默认 human）、`limit`（`correlations`/`samples/search`，默认 100，1–500）、`offset`（样本搜索分页）、`gene`（路径参数，大小写敏感，按物种用 HGNC/MGI）、`query`（样本搜索自由文本，匹配 title/tissue/source）。
- **响应字段**：`zscore` 连续浮点（>2 高表达）、`correlation` Pearson（-1~1，>0.7 高共表达）。
- **共表达跨所有组织聚合**：高相关可能由单一组织或单个研究驱动；用组织特异 z-score 或检查贡献最大的 GEO 系列交叉验证。
- **HDF5 vs REST**：REST 适合单基因快查/探索（仅聚合谱）；HDF5 适合批量/自定义共表达/ML（需 30–60 GB 磁盘，下载一次）。
- 常见排错：
  - HTTP 404：符号不在索引 —— 核对 HGNC 拼写，确认 `species` 与符号惯例匹配。
  - HTTP 429：超限速 —— 加 `time.sleep(0.1)`，批量用 0.5s。
  - `values` 为空：基因任何组织都不表达，或物种/大小写错 —— 切 species、确认是蛋白编码且有 GEO 覆盖。
  - `samples` 为空：关键词没命中元数据 —— 换更宽泛词（`liver` 而非 `hepatic`）。
  - HDF5 找不到基因：版本符号不一致 —— 查 `f["meta"]["genes"]["gene_symbol"][:]`，改用 Ensembl ID 或别名。
  - `Timeout`：负载高 —— `timeout=60` 并指数退避重试。
  - z-score 全近 0：该基因极低或不表达 —— 查原始 counts，可能非编码或极低表达。
- 参考：[ARCHS4 网站](https://maayanlab.cloud/archs4/)、[REST API 文档](https://maayanlab.cloud/archs4/api/)、[Lachmann et al., Nat Commun 2018](https://doi.org/10.1038/s41467-018-03751-6)、[ARCHS4 GitHub](https://github.com/MaayanLab/archs4)。

## 互见

- related：`gnomad-population-database` —— 在高表达基因里找群体变异频率，表达证据之后的下游。
- related：`geo-database` —— 由 ARCHS4 样本搜索得到的 GSE，下载并解析原始 series matrix / phenotype。
- combines_with：`gget-genomic-databases` —— 把共表达基因列表喂 `gget enrichr` 做通路富集。
- combines_with：`gene-set-enrichment-analysis` —— 共表达基因集的 GSEA/ORA 富集分析。
- combines_with：`pydeseq2-differential-expression` —— bulk RNA-seq 差异表达；ARCHS4 HDF5 可作参考队列校验方向。

---

采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0）。
