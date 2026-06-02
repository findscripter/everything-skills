---
name: encode-database
title: ENCODE 调控基因组数据库
description: 当需要从 ENCODE Portal/SCREEN 取调控基因组数据——按 assay(TF ChIP-seq/ATAC-seq/DNase-seq/组蛋白 ChIP/RNA-seq)+靶点+细胞系检索实验、下载 BED/bigWig 峰文件、按区域或基因查 cCRE 候选顺式调控元件——以注释变异、定位开放染色质或建参考峰集时使用；做 REST/SCREEN 取数并产出实验表/峰文件/cCRE 分类表(PLS/pELS/dELS/CTCF-only);不适用于变异调控打分(用 RegulomeDB)、GWAS 关联(用 GWAS Catalog)或自有 BAM 出 bigWig/call peak(用 deeptools/macs3);触发词：ENCODE、cCRE、SCREEN、ChIP-seq 峰、ATAC-seq、DNase-seq、开放染色质、调控元件、bigWig、IDR peaks
domain: 领域/science
triggers: [ENCODE, cCRE, SCREEN, ChIP-seq 峰, ATAC-seq, DNase-seq, 开放染色质, 调控元件, bigWig, IDR peaks, 组蛋白修饰, 增强子启动子, 转录因子结合]
tags: [science, bioinformatics, genomics, encode, rest-api, regulatory-genomics, chip-seq, atac-seq, ccre, epigenomics]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, requests, pandas, matplotlib, REST API, urllib]
requires: []
related: [geo-database, macs3-peak-calling, deeptools-ngs-analysis, ucsc-genome-browser]
combines_with: [macs3-peak-calling, deeptools-ngs-analysis, bwa-mem2-dna-aligner]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

需要从 **ENCODE**（DNA 元件百科全书；上千种人/鼠细胞系与组织的 TF ChIP-seq、ATAC-seq、DNase-seq、组蛋白 ChIP-seq、RNA-seq）经其免费 REST API 与 SCREEN API 取调控基因组数据时使用。多数端点无需鉴权（提交者数据加 `Authorization: Bearer {api_key}` 头）。两个入口：

- **Portal**：`https://www.encodeproject.org` —— 实验/文件/基因/生物样本的结构化检索与下载 URL。
- **SCREEN**：`https://api.encodeproject.org/screen` —— 按区域/基因取候选顺式调控元件（cCRE）及其信号 z-score（POST-only）。

典型场景：

- 下载某 TF 在某细胞系的 ChIP-seq 峰 BED，注释调控区。
- 在某细胞系找 ATAC-seq/DNase-seq 峰，定位基因附近开放染色质。
- 取某区域/基因的 cCRE（增强子/启动子/绝缘子分类），为变异注释建参考调控轨。
- 规划湿实验前，查某生物样本（细胞系/组织/发育阶段）已有哪些实验。
- 跨多细胞系汇总某 TF 的全部 ChIP-seq，做比较调控分析（峰图谱）。

**不该用的边界：**
- 针对具体 SNP 的预计算调控打分 → 用 `regulomedb-database`（RegulomeDB 把 ENCODE + eQTL + motif 证据整合为单一分数）。
- 已发表的 SNP-性状关联 → 用 `gwas-database`（NHGRI-EBI GWAS Catalog）。
- 你有自己的 BAM、想生成 bigWig 覆盖轨或 call peak → 用 `deeptools-ngs-analysis` / `macs3-peak-calling`；ENCODE 是取已沉积数据，不做你自己的处理。

## 步骤

1. **选入口与 `type`**：检索用 `https://www.encodeproject.org/search/`，`type` 取 `Experiment`/`File`/`Gene`/`Biosample`；cCRE 用 SCREEN 的 `POST /screen/search/`。
2. **检索实验**：按 `assay_title`(如 `TF ChIP-seq`/`ATAC-seq`/`DNase-seq`/`Histone ChIP-seq`/`RNA-seq`)、`target.label`(如 `CTCF`)、`biosample_ontology.term_name`(如 `K562`，**不是** freetext 的 `biosample_summary`)、`status=released` 过滤；结果在 JSON 的 `@graph`，总数在 `total`。
3. **取文件下载 URL**：用 `type=File` + `dataset=/experiments/{accession}/` + `file_format` + `output_type` + `assembly`；下载地址为 `BASE + f["href"]`。
4. **优选峰集**：分析用 IDR 阈值峰，不用原始 replicate 峰（详见「注意事项」）。
5. **查 cCRE**：SCREEN POST 体传 `assembly`/`coord_chrom`/`coord_start`/`coord_end`，读 `results`（兼容 `cCREs`）及各信号 z-score。
6. **批量循环加 `time.sleep(0.3~0.5)`**：无公开硬限速，但密集串行请求会触发连接重置。

## 指令

### 统一约束

- **始终带 `status=released` 并指定 `assembly`**（`GRCh38`/`GRCh37`/`mm10`），否则会混入归档实验、混淆坐标系。
- `target.label` **大小写敏感且需精确**（`eGFP-TP53` ≠ `TP53`）；查不到先去 ENCODE 网站确认确切字符串。
- cCRE 只用规范染色体（chr1–22、chrX、chrY）。
- 大文件下载用 `stream=True`，`timeout` 提到 120~300。

### 实验检索（Portal）

```python
import requests, pandas as pd
BASE = "https://www.encodeproject.org"

def search_experiments(assay_title=None, target=None, biosample=None,
                       organism="Homo sapiens", status="released", limit=50):
    params = {"type": "Experiment", "status": status,
              "replicates.library.biosample.donor.organism.scientific_name": organism,
              "format": "json", "limit": limit}
    if assay_title: params["assay_title"] = assay_title
    if target:      params["target.label"] = target
    if biosample:   params["biosample_ontology.term_name"] = biosample  # 用 ontology term，非 freetext biosample_summary
    r = requests.get(f"{BASE}/search/", params=params, timeout=30); r.raise_for_status()
    data = r.json()
    print(f"Total: {data.get('total', 0)}")
    return pd.DataFrame([{
        "accession": e.get("accession"), "assay": e.get("assay_title"),
        "biosample": e.get("biosample_summary"),
        "target": e.get("target", {}).get("label", ""),
        "date": e.get("date_released", "")} for e in data.get("@graph", [])])

df = search_experiments("TF ChIP-seq", target="CTCF", biosample="HCT116")
```

### 优选峰文件（IDR 优先）

```python
def get_optimal_peaks(accession, assembly="GRCh38"):
    r = requests.get(f"{BASE}/experiments/{accession}/?format=json", timeout=30); r.raise_for_status()
    exp = r.json()
    preferred = ["optimal IDR thresholded peaks", "IDR thresholded peaks",
                 "replicated peaks", "peaks"]   # 偏好顺序，IDR 优先
    cand = [{"acc": f["accession"], "output_type": f["output_type"],
             "url": BASE + f.get("href", ""),
             "size_mb": round(f.get("file_size", 0)/1e6, 2)}
            for f in exp.get("files", [])
            if f.get("file_format")=="bed" and f.get("assembly")==assembly
            and f.get("status")=="released" and f.get("output_type") in preferred]
    if not cand: return None
    for p in preferred:
        for f in cand:
            if f["output_type"] == p: return f
    return cand[0]
```

### cCRE 区域查询（SCREEN，POST-only）

```python
SCREEN = "https://api.encodeproject.org/screen"

def search_ccres_by_region(chrom, start, end, assembly="GRCh38", limit=500):
    payload = {"assembly": assembly, "coord_chrom": chrom,
               "coord_start": start, "coord_end": end, "limit": limit}
    r = requests.post(f"{SCREEN}/search/", json=payload, timeout=30); r.raise_for_status()
    ccres = r.json().get("results", r.json().get("cCREs", []))
    return pd.DataFrame([{
        "accession": c.get("accession"), "group": c.get("group"),
        "start": c.get("start"), "end": c.get("end"),
        "dnase_z": round(c.get("dnase_zscore", 0), 2),
        "h3k4me3_z": round(c.get("h3k4me3_zscore", 0), 2),
        "h3k27ac_z": round(c.get("h3k27ac_zscore", 0), 2),
        "ctcf_z": round(c.get("ctcf_zscore", 0), 2)} for c in ccres])

# TP53 locus（GRCh38）
df_ccres = search_ccres_by_region("chr17", 7_661_779, 7_887_538)
```

### cCRE 五类速查

ENCODE SCREEN 按表观信号 z-score 把 cCRE 分五类（z>1.64 即 p<0.05 显著）：

| 组别 | 全称 | 信号特征 | 解读 |
|---|---|---|---|
| PLS | Promoter-Like | 高 DNase + 高 H3K4me3 + 高 H3K27ac | 活跃启动子 |
| pELS | Proximal Enhancer-Like | 高 DNase + 高 H3K27ac，≤2kb 距 TSS | 近端增强子 |
| dELS | Distal Enhancer-Like | 高 DNase + 高 H3K27ac，>2kb 距 TSS | 远端增强子 |
| DNase-H3K4me3 | — | 高 DNase + 高 H3K4me3，低 H3K27ac | 非典型启动子 |
| CTCF-only | — | 高 CTCF，低 H3K27ac | 绝缘子/边界元件 |

## 示例

**下载某 TF 在某细胞系的峰并解析为 DataFrame**（变异注释前置）：

```python
import gzip
def download_tf_peaks(tf, biosample, assembly="GRCh38"):
    exps = search_experiments("TF ChIP-seq", target=tf, biosample=biosample)
    if exps.empty: return None
    peak = get_optimal_peaks(exps.iloc[0]["accession"], assembly)
    if not peak: return None
    raw = requests.get(peak["url"], timeout=120, stream=True).content
    if peak["url"].endswith(".gz"): raw = gzip.decompress(raw)
    rows = [l.split("\t") for l in raw.decode().strip().split("\n") if l and not l.startswith("#")]
    cols = ["chrom","start","end","name","score","strand","signalValue","pValue","qValue","peak"]
    df = pd.DataFrame(rows, columns=cols[:len(rows[0])])
    df["start"], df["end"] = pd.to_numeric(df["start"]), pd.to_numeric(df["end"])
    print(f"{len(df):,} peaks, 覆盖 {(df['end']-df['start']).sum()/1e6:.1f} Mb")
    return df

df_peaks = download_tf_peaks("CTCF", "K562")
```

**基因附近 cCRE**：先用 `type=Gene` + `symbol` 取坐标，再 `search_ccres_by_region(chrom, start-window, end+window)` 扩窗查，按到基因距离排序。

**列出某生物样本/细胞系**：`type=Biosample` + `donor.organism.scientific_name` + `biosample_ontology.classification`（`cell line`/`primary cell`/`tissue`）。

更多配方见源仓：跨细胞系建 TF 峰图谱（`build_tf_peak_atlas`，循环加 `time.sleep(0.3)` 并导 CSV）、cCRE 类别柱状图 + H3K27ac z-score 箱线图、bigWig 信号轨（`output_type="fold change over control"`）供 IGV/UCSC、用 facets（`limit=0` + `field=assay_title`）枚举全部 assay 类型。

## 注意事项

- **优选 IDR 阈值峰**：原始 replicate 峰假阳性多；变异注释/motif 分析一律用 `optimal IDR thresholded peaks` 或 `IDR thresholded peaks`。
- **`@graph` 为空**：过滤过严或确无数据——逐条放宽，先看 `total` 确认是否存在再翻页。
- **`HTTP 503`/连接超时**：密集串行触发——加 `time.sleep(0.5)` 并指数退避重试。
- **cCRE 返回 `[]`**：SCREEN 端点路径变更或落在非规范染色体——核对 URL，只用 chr1–22/chrX/chrY。
- **找不到 bigWig/BED**：多为 assembly 不匹配（GRCh37 vs GRCh38）——查询务必带 `files.assembly`，并确认该实验在目标版本下有文件。
- **`target.label` 无结果**：标签精确不符（大小写敏感）——去 ENCODE 网站找确切字符串。
- **cCRE 查询用 SCREEN，别用 Portal search**：专用 SCREEN API 才是为区域 cCRE 查询而建，返回结构化 z-score。
- `biosample_summary`（freetext）有时与官方 ontology term name 不一致；检索零结果时改用 ontology term，或浏览 ENCODE 找确切 summary 串。

## 互见

- related：`regulomedb-database` —— 要针对具体变异的预计算调控分数（整合 ENCODE + eQTL + motif）时走它；本条只给原始峰/cCRE。
- related：`gwas-database` —— GWAS Catalog 的 SNP-性状关联；与 ENCODE 峰叠加可对 GWAS 命中做功能注释。
- related：`scientific-database-lookup` —— 它已把 ENCODE 列为可查公开库之一；需跨多库泛化取数时走它。
- combines_with：`macs3-peak-calling` —— 用自有 ChIP/ATAC 的 BAM call peak，以 ENCODE 峰作参考对照。
- combines_with：`deeptools-ngs-analysis` —— 从自有 BAM 生成 bigWig 覆盖轨/相关性热图/profile，与 ENCODE 信号对比。
- combines_with：`snpeff-variant-annotation` / `gnomad-population-database` —— 变异先经 ENCODE 调控轨注释，再叠加功能/频率证据。

---
本条采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0）。
