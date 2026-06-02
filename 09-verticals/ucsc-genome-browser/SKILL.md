---
name: ucsc-genome-browser
title: UCSC 基因组浏览器 API
description: 当需要从 UCSC REST API 在线检索参考序列、注释轨道、基因模型或保守性分数时使用；用 requests 调 api.genome.ucsc.edu 取序列/refGene/rmsk/phyloP 等并产出 FASTA、BED 或 CSV；不适用于 Ensembl 稳定 ID/VEP 注释（用 ensembl）及百万级本地批量（用 bedtools）。触发词：UCSC、基因组浏览器、phyloP
domain: 领域/science
triggers: [UCSC, 基因组浏览器, Genome Browser, getData/sequence, refGene, phyloP, PhastCons, 保守性分数, hg38, 染色体大小, track 轨道, CpG 岛, RepeatMasker]
tags: [databases, genomics-bioinformatics, science, rest-api, bioinformatics]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [requests, python, matplotlib, pandas]
requires: []
related: [ensembl-database, encode-database, gget-genomic-databases, geo-database]
combines_with: [genomic-file-toolkit, jaspar-tfbs-database, deeptools-ngs-analysis]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

适用于通过 UCSC Genome Browser REST API（`https://api.genome.ucsc.edu/`，免费、免认证、返回 JSON）在线检索 100+ 装配体（hg38、mm39、dm6 等）的：

- 取任意基因组区间的参考 DNA 序列（启动子、外显子、CRISPR 靶点等）
- 取 RefSeq / GENCODE 基因结构（外显子坐标、CDS 边界、链向）
- 查 PhyloP / PhastCons 逐碱基保守性分数，评估变异位点的进化约束
- 列出/查询某装配体的 1000+ 注释轨道（重复序列、CpG 岛、调控元件、保守性）
- 取某装配体的染色体大小，为 bedtools / pysam / 覆盖度流程做坐标准备
- 访问公共 track hub（ENCODE、Roadmap Epigenomics）而无需本地下载

**不该用的边界：**
- 需要 Ensembl 稳定 ID、VEP 变异效应注释或跨物种同源比对时，改用 `ensembl` 技能
- 需要在百万级区间上做本地批量计算时，先用预下载的 UCSC 注释文件配合 `bedtools` 技能

## 步骤

**前置：** `pip install requests matplotlib`（批量可视化时需要）。坐标使用 **0-based 半开区间（BED 格式）**：start 含、end 不含。所有调用统一以下基址：

```python
import requests
BASE = "https://api.genome.ucsc.edu"
```

**1. 取序列** — `getData/sequence`：

```python
def get_sequence(genome, chrom, start, end):
    r = requests.get(f"{BASE}/getData/sequence",
                     params={"genome": genome, "chrom": chrom,
                             "start": start, "end": end})
    r.raise_for_status()
    return r.json()["dna"]

seq = get_sequence("hg38", "chr17", 43044294, 43045294)  # BRCA1 TSS 周边 1kb
print(f"Length: {len(seq)} bp; {seq[:60]}...")
```

负链基因需取反向互补：

```python
def revcomp(seq):
    comp = str.maketrans("ACGTacgt", "TGCAtgca")
    return seq.translate(comp)[::-1]
```

**2. 查轨道数据** — `getData/track`，响应 JSON 以轨道名为键（务必用 `.get(track, [])` 防 KeyError）：

```python
def get_track_data(genome, track, chrom, start, end):
    r = requests.get(f"{BASE}/getData/track",
                     params={"genome": genome, "track": track,
                             "chrom": chrom, "start": start, "end": end})
    r.raise_for_status()
    data = r.json()
    return data.get(track, data.get("data", []))

repeats = get_track_data("hg38", "rmsk", "chr8", 127_735_434, 127_742_951)  # MYC 区重复序列
```

BED 型轨道返回含 `chrom/chromStart/chromEnd/name/score/strand` 的字典列表；bigWig 型轨道（保守性、信号）返回 `{start, end, value}` 区间列表。

**3. 列轨道 / 染色体大小** — 先发现可用数据：

```python
tracks = requests.get(f"{BASE}/list/tracks", params={"genome": "hg38"}).json().get("tracks", {})
sizes  = requests.get(f"{BASE}/list/chromosomes", params={"genome": "hg38"}).json().get("chromosomeSizes", {})
```

**4. 取基因模型** — `refGene` 轨道，并解析外显子区间：

```python
def get_refgene(genome, chrom, start, end):
    r = requests.get(f"{BASE}/getData/track",
                     params={"genome": genome, "track": "refGene",
                             "chrom": chrom, "start": start, "end": end})
    r.raise_for_status()
    return r.json().get("refGene", [])

def parse_exons(rec):
    starts = [int(s) for s in rec["exonStarts"].strip(",").split(",") if s]
    ends   = [int(e) for e in rec["exonEnds"].strip(",").split(",") if e]
    return list(zip(starts, ends))

genes = get_refgene("hg38", "chr7", 55_019_017, 55_211_628)  # EGFR
```

**5. 取保守性分数** — bigWig 轨道（如 `phyloP100way`，正分=保守、负分=快速进化）：

```python
def get_conservation(genome, track, chrom, start, end):
    r = requests.get(f"{BASE}/getData/track",
                     params={"genome": genome, "track": track,
                             "chrom": chrom, "start": start, "end": end})
    r.raise_for_status()
    return r.json().get(track, [])

scores = get_conservation("hg38", "phyloP100way", "chr17", 7_676_580, 7_676_610)  # TP53 248 密码子热点
```

**6. 列装配体 / 访问 hub** — `list/ucscGenomes` 返回全部 UCSC 托管装配体；hub 端点用 `hubUrl` 参数指向 hub.txt。

## 指令

- **坐标统一 0-based**：浏览器界面显示 1-based 闭区间，转 API 时 `start = browser_start - 1`，`end` 不变。混用会导致沉默的 off-by-one 错误。
- **先发现再查询**：轨道内部名（如 `refGene`、`cpgIslandExt`、`rmsk`）不总是直观，先 `list/tracks` 找到正确名再查。
- **批量加延时**：无强制限速，但服务器是共享资源，处理 >50 个区间时每次请求间插 `time.sleep(0.5)`。
- **缓存染色体大小**：跨多区间的流程只调一次 `list/chromosomes`，结果存字典复用。
- **多转录本去歧义**：同一位点有多个转录本时，按 `name2`（基因符号）过滤并选最长转录本（`max(records, key=lambda x: x["txEnd"]-x["txStart"])`）。

## 示例

**提取基因列表的启动子序列（写 FASTA）：**

```python
import time
GENOME, PROMOTER_UP = "hg38", 2000
gene_loci = {"BRCA1": ("chr17", 43_044_294, 43_125_482),
             "TP53":  ("chr17",  7_661_779,  7_687_538)}
results = {}
for gene, (chrom, s, e) in gene_loci.items():
    recs = [r for r in get_refgene(GENOME, chrom, s, e) if r.get("name2") == gene]
    if not recs:
        continue
    g = max(recs, key=lambda x: x["txEnd"] - x["txStart"])
    if g["strand"] == "+":
        ps, pe = max(0, g["txStart"] - PROMOTER_UP), g["txStart"]
    else:
        ps, pe = g["txEnd"], g["txEnd"] + PROMOTER_UP
    seq = get_sequence(GENOME, chrom, ps, pe)
    if g["strand"] == "-":
        seq = revcomp(seq)
    results[gene] = (chrom, ps, pe, g["strand"], seq)
    time.sleep(0.5)
with open("promoters.fa", "w") as fh:
    for gene, (chrom, ps, pe, strand, seq) in results.items():
        fh.write(f">{gene} {chrom}:{ps}-{pe}({strand})\n{seq}\n")
```

**批量变异保守性查询（写 CSV）：**

```python
import time, pandas as pd
variants = [{"id": "rs28897672", "chrom": "chr17", "pos": 7_676_594},   # TP53 R248
            {"id": "rs1042522",  "chrom": "chr17", "pos": 7_676_147}]   # TP53 R72P
rows = []
for v in variants:
    sc = get_conservation("hg38", "phyloP100way", v["chrom"], v["pos"]-6, v["pos"]+5)
    vals = [s["value"] for s in sc]
    rows.append({**v, "phyloP_mean": round(sum(vals)/len(vals), 3) if vals else float("nan")})
    time.sleep(0.5)
pd.DataFrame(rows).to_csv("variant_conservation.csv", index=False)
```

**其他快捷配方：** 取序列后算 GC 含量 `(seq.count("G")+seq.count("C"))/len(seq)*100`；用 refGene 记录的 `txStart/txEnd` + `name2/strand` 写 BED 文件供 IGV/bedtools；提交批量前用 `list/chromosomes` 校验坐标是否越界（`start>=0 and end<=sizes[chrom] and start<end`）。

## 注意事项

| 问题 | 原因 | 解决 |
|------|------|------|
| 序列端点 HTTP 400 | 坐标越界或 `start >= end` | 用 `list/chromosomes` 查染色体大小；start/end 反了就互换 |
| 轨道查询返回空列表 | 该区间无此轨道特征 | 用 `list/tracks` 确认轨道存在；放宽查询窗口 |
| 轨道响应 KeyError | 响应键名与 track 参数不同 | 用 `.get(track, data.get("data", []))` 兜底 |
| ConnectionError / 超时 | 网络或服务器负载 | 用 `requests.Session()` 并设 `timeout=30`；重试前 `time.sleep(1)` |
| 序列全小写 | 软屏蔽区（RepeatMasker） | 大小写无关时对结果调 `.upper()` |
| 保守性轨道无数据 | 该装配体无此轨道 | `phyloP100way` 仅 hg38；mm10 用 `phyloP60way`，先查 `list/tracks` |

## 互见

- `ensembl` — Ensembl REST API，Ensembl 稳定 ID、VEP 变异效应、跨物种同源；Ensembl 中心工作流首选
- `encode` — ENCODE 门户调控元件数据集（ChIP-seq/ATAC-seq 峰），喂入 UCSC track hub
- `bedtools` — 对从 UCSC 下载的 BED 文件做交集、覆盖度与坐标运算
- `regulomedb` — 调控变异打分，与 UCSC 调控轨道有重叠

**参考：** [UCSC REST API 文档](https://genome.ucsc.edu/goldenPath/help/api.html)、[API 基址](https://api.genome.ucsc.edu/)、[Table Browser](https://genome.ucsc.edu/cgi-bin/hgTables)、Kent WJ et al. (2002) Genome Res 12:996–1006。

---

*采编自 [jaechang-hits/SciAgent-Skills](https://github.com/jaechang-hits/SciAgent-Skills)（CC-BY-4.0），适配重写为中文「技能大典」条目。*
