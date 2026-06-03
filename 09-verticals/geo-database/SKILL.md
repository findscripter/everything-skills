---
name: geo-database
title: NCBI GEO 表达数据访问
description: 当需按物种/平台检索 GEO 表达数据集、下载解析 GSE 系列矩阵、抽样本元数据或加载表达矩阵到 pandas 时使用；用 GEOparse+E-utilities 产出 GSE/GPL/GSM 记录与基因注释表达矩阵；不适用于大规模单细胞（用 cellxgene-census）、原始 reads（去 ENA/SRA）。触发词：GEO、GSE、GEOparse、表达矩阵、series matrix
domain: 领域/science
triggers: [GEO, GSE 下载, GEOparse, series matrix, GPL 平台注释, GSM 样本元数据, 表达矩阵 pandas, E-utilities gds, GEO 数据集检索, SuperSeries SubSeries]
tags: [science, genomics, bioinformatics, geo, ncbi, e-utilities, geoparse, 表达数据, 微阵列, rna-seq, 数据库查询]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [GEOparse, requests, pandas, NCBI E-utilities]
requires: []
related: [cellxgene-census, gget-genomic-databases, clinvar-database, gnomad-population-database]
combines_with: [pydeseq2-differential-expression, gene-set-enrichment-analysis, cellxgene-census]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

适用：
- 按物种/组织/疾病/实验条件检索公开基因表达数据集（GSE）。
- 下载并解析某个具体 GSE 系列：表达矩阵 + 样本元数据。
- 抽取样本注释表（处理分组、临床协变量）做 meta 分析。
- 把微阵列探针表达（GPL 平台注释）加载成整洁的 DataFrame。
- 写自动化管线批量下载、处理 GEO 数据集供下游分析。

不该用（负边界）：
- 大规模单细胞 RNA-seq → 用 `cellxgene-census`（GEO 逐条解析 scRNA 慢且零散）。
- 需要原始比对 reads / FASTQ → 去 ENA/SRA 下载（GEO 存的是处理后矩阵）。
- 跨多个基因组数据库的一次性联合查询 → 用 `gget-genomic-databases`。

## 步骤 / 指令

GEO 是 NCBI 高通量功能基因组数据公共库（20 万+ 系列：微阵列、RNA-seq、ChIP-seq、甲基化、蛋白组）。两条访问通道：**GEOparse**（下载/解析 SOFT 记录）+ **E-utilities `gds` 库**（检索元数据）。

依赖：`pip install GEOparse requests pandas`。所有 E-utilities 调用须带 `email`（NCBI 政策）。**限速**：E-utilities 未认证 3 req/s，带 API key 10 req/s；GEO FTP 无限速。

记录类型：**GSE**=完整实验系列 / **GPL**=平台（探针↔基因映射）/ **GSM**=单样本 / **GDS**=策展归一子集。

1. **检索**：`esearch.fcgi` 查 `db=gds`，term 用字段标签组合，如 `breast cancer[title] AND Homo sapiens[organism] AND gse[entry type]`；`entry type` 取 `gse`/`gds`/`gpl`/`gsm` 过滤记录类型。
2. **摘要**：`esummary.fcgi` 按 UID 拿 accession、title、taxon、n_samples、gdstype。
3. **下载解析**：`GEOparse.get_GEO("GSE2553", destdir, silent=True)` 取 GSE，`.metadata` 拿系列信息，`.phenotype_data` 拿样本元数据，`.gsms`/`.gpls` 拿样本与平台。
4. **表达矩阵**：`gse.pivot_samples("VALUE", gpl_id)` 得探针×样本矩阵；用 `gpl.table` 的基因符号列做注释 join，多探针映同基因用 `groupby(gene).mean()` 取均值。
5. **大系列**（100+ 样本）：别逐条解析 GSM，直接从 FTP 拉 `_series_matrix.txt.gz`，快若干个数量级。
6. **SuperSeries**：多组学/多批次投稿是 SuperSeries 引用若干 SubSeries，**SuperSeries 自身无样本**。下载前先查 `gse.metadata.get("relation", [])` 里的 `SuperSeries of: ...`，对每个 SubSeries 逐一下载，否则静默丢数据。

## 示例

E-utilities 检索 + 摘要：

```python
import requests, time
EMAIL = "your@email.com"  # NCBI 政策必填
BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"

def geo_search(query, retmax=20):
    r = requests.get(f"{BASE}/esearch.fcgi",
        params={"db": "gds", "term": query, "retmax": retmax,
                "retmode": "json", "email": EMAIL})
    r.raise_for_status()
    return r.json()["esearchresult"]

res = geo_search("breast cancer[title] AND Homo sapiens[organism] AND gse[entry type]", retmax=10)
print("命中", res["count"], "个；UID:", res["idlist"])
# 指定平台： "Illumina HumanHT-12[platform] AND Homo sapiens[organism] AND gse[entry type]"

def geo_summary(uids):
    r = requests.post(f"{BASE}/esummary.fcgi",
        data={"db": "gds", "id": ",".join(uids), "retmode": "json", "email": EMAIL})
    r.raise_for_status()
    return r.json()["result"]

summ = geo_summary(res["idlist"][:3])
for uid in summ.get("uids", []):
    s = summ[uid]
    print(s.get("accession"), "|", s.get("title"), "|", s.get("taxon"),
          "| n=", s.get("n_samples"), "|", s.get("gdstype"))
    time.sleep(0.4)
```

下载 GSE，抽表达矩阵 + 基因注释（DE 分析就绪）：

```python
import GEOparse, pandas as pd

gse = GEOparse.get_GEO("GSE2553", destdir="./geo_data/", silent=True)  # 自动缓存，已存则跳过下载
print("标题:", gse.metadata["title"][0], "| 样本:", len(gse.gsms),
      "| 平台:", list(gse.gpls.keys()))

# 1. 表达矩阵（探针×样本）
gpl_id = list(gse.gpls.keys())[0]
expr = gse.pivot_samples("VALUE", gpl_id)

# 2. 样本元数据
meta = gse.phenotype_data
print("元数据列:", list(meta.columns))

# 3. 探针→基因符号注释（列名随平台而异，先看 gpl.table.columns）
gpl = gse.gpls[gpl_id]
gene_col = "Gene Symbol" if "Gene Symbol" in gpl.table.columns else gpl.table.columns[1]
annot = gpl.table[["ID", gene_col]].dropna()
annot.columns = ["probe_id", "gene_symbol"]
annot = annot[annot["gene_symbol"].str.strip() != ""]

expr_genes = expr.join(annot.set_index("probe_id")[["gene_symbol"]], how="inner")
expr_genes = expr_genes.groupby("gene_symbol").mean()  # 多探针映同基因取均值
print("基因×样本:", expr_genes.shape)
expr_genes.to_csv("expression_matrix.csv"); meta.to_csv("sample_metadata.csv")
```

大系列：直接从 FTP 拉 series matrix（比 GEOparse 快若干数量级）：

```python
import urllib.request, gzip, io, pandas as pd

acc = "GSE2553"; n = acc[3:]
folder = f"GSE{n[:-3]}nnn" if len(n) > 3 else f"GSE{n[:-2]}nn"
url = f"https://ftp.ncbi.nlm.nih.gov/geo/series/{folder}/{acc}/matrix/{acc}_series_matrix.txt.gz"

with urllib.request.urlopen(url) as resp, gzip.open(resp, "rt", encoding="utf-8") as f:
    lines = f.readlines()
data_start = next(i for i, l in enumerate(lines) if l.startswith('"ID_REF"'))  # ! 开头为元数据
df = pd.read_csv(io.StringIO("".join(lines[data_start:])), sep="\t", index_col=0)
print("矩阵形状:", df.shape)
```

解析 SuperSeries 下的 SubSeries：

```python
gse = GEOparse.get_GEO("GSE47966", destdir="./geo_data/", silent=True)  # 某 SuperSeries
subs = [r.split(": ")[1] for r in gse.metadata.get("relation", []) if r.startswith("SuperSeries of")]
print("需下载的 SubSeries:", subs)
for acc in subs:
    sub = GEOparse.get_GEO(acc, destdir="./geo_data/", silent=True)
    print(f"  {acc}: {len(sub.gsms)} 样本, 平台={list(sub.gpls.keys())}")
```

## 注意事项

- **email 必填**：所有 E-utility 调用都带 `email`，否则可能被封；生产环境注册免费 API key 把限速 3→10 req/s（https://www.ncbi.nlm.nih.gov/account/）。
- **SuperSeries 无样本**：`gse.gsms` 为空多半是 SuperSeries → 解析 `gse.metadata["relation"]` 的 `SuperSeries of:` 逐个下 SubSeries，跳过此步会静默丢掉真实数据。
- **平台列名不固定**：GPL 注释表的基因列因平台而异（`Gene Symbol` / `GENE_SYMBOL` / `gene_id`），动手前先 `print(gpl.table.columns)`，别硬编码。
- **多探针/多基因映射**：Affymetrix 一个探针常映多基因（`gene_symbol.str.split(" /// ")`）；分析前决定丢/拆/留，多探针同基因建议 `groupby().mean()` 去重。
- **缓存复用**：GEOparse 在 `destdir` 有 `.soft.gz` 则跳过重下；跨会话共用同一 `destdir` 避免重复下载。`silent=True` 关进度噪声，自己补 print 确认。
- **大系列别用 GEOparse 逐条解析**：100+ 样本的 SOFT 文件可达 GB 级会卡住，改 FTP 拉 series matrix。
- **检索 0 结果**：多半是 `entry type` 或字段标签写错；`gse[entry type]` 换 `gds[entry type]`，核对 term 语法。
- **缺失表达值**：样本列出现 `null` → `df.fillna(0)` 或丢高缺失列再分析。
- **格式**：GEOparse 下 SOFT（纯文本）；series matrix（制表符）是表达数据最紧凑格式；需 XML 走 MiniML（经 E-utilities）。

## 互见

- `cellxgene-census` — 大规模单细胞 RNA-seq 的替代入口（6000 万+ 细胞），scRNA 别走 GEO。
- `gget-genomic-databases` — 跨多基因组数据库的一次性联合查询。
- `pydeseq2-differential-expression` — 拿到 GEO count 矩阵后做差异表达分析。
- `gene-set-enrichment-analysis` — 对 GEO 表达数据下游做基因集富集。
- `clinvar-database` / `gnomad-population-database` — 同为 NCBI/群体数据库，变异侧互补。

---
采编自 jaechang-hits/SciAgent-Skills（原 license CC-BY-4.0），按本仓库规范适配重写；本条目以 CC-BY-4.0 发布。
