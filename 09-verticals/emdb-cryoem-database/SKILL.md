---
name: emdb-cryoem-database
title: EMDB 冷冻电镜密度图查询
description: 当需要按关键词检索 EMDB 冷冻电镜/电子断层密度图、取分辨率/方法/物种等元数据、找拟合 PDB 原子模型、推导 .map.gz 下载链接或抽取引用时使用；用 requests 直连 Entry REST API + EBI Search WS，产出元数据、map 下载 URL、拟合 PDB ID 与 DOI/PMID。不适用于实验原子坐标（用 pdb-database 思路或 RCSB）或 AI 预测结构（用 alphafold-database-access）。触发词：EMDB、cryo-EM、密度图、EMD-XXXXX、EBI Search
domain: 领域/science
triggers: [EMDB, cryo-EM, 冷冻电镜, 密度图, EMD-XXXXX, EBI Search, 拟合 PDB, 分辨率, map.gz, 电子断层, structure_determination, supramolecule]
tags: [science, 结构生物学, 冷冻电镜, emdb, rest-api, 数据库查询, 密度图]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Bash, requests, pandas]
requires: []
related: [rcsb-pdb-database, alphafold-database-access, scientific-database-lookup, uniprot-protein-database]
combines_with: [molecular-dynamics-openmm, protein-language-models]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

适用：

- 按关键词检索 EMDB 冷冻电镜/电子断层（cryo-EM/cryo-ET）密度图（如 "spike protein"、"ribosome 70S"）。
- 取某 EMD-XXXXX 的元数据：分辨率、重构方法、物种、样品、释放日期。
- 拿 `.map.gz` 密度文件的下载 URL，供 ChimeraX / PyMOL 加载。
- 找拟合进该 map 的 PDB 原子模型（及反查），含 relationship 标签（如 `FULLOVERLAP`）。
- 抽取主引用：期刊、年份、DOI、PubMed ID。
- 按物种或分辨率阈值筛选一批结构、生成队列元数据表。

不该用（负边界）：

- 需要实验测定的原子坐标——查 RCSB PDB（`/rest/v2/entry/{pdb_id}`），EMDB 只存 EM 密度图。
- 需要 AI 预测结构——用 `alphafold-database-access`，EMDB 仅限实验 EM 图。
- 需要靶点结合活性 IC50/Ki——用 `chembl-bioactivity-database`。

## 步骤 / 指令

1. 环境：仅需 `requests`、`pandas`（作图可加 `matplotlib`），**无需 API key / 认证**。pixi/conda 环境用 `pixi run python ...`。
2. 记住两个服务分工——这是最大坑：
   - **Entry API**：`https://www.ebi.ac.uk/emdb/api/entry/{EMD-XXXXX}` —— 单条 JSON 里**一次性**含元数据、map 头、拟合 PDB 列表、引用。**没有** `/map`、`/fitted`、`/publications` 子端点（全 404）。
   - **EBI Search WS**：`https://www.ebi.ac.uk/ebisearch/ws/rest/emdb` —— **真正的**关键词搜索后端。
3. **关键词搜索一律走 EBI Search WS**。裸 `https://www.ebi.ac.uk/emdb/api/search/` 会**忽略 `q=`** 只返最新条目，依赖它会得到静默错误的队列。
4. **EBI Search 字段值都是列表**：连单值字段 `name` 也返 `{"name": ["..."]}`，永远取 `[0]` 或 join，兜底 `(f.get("name") or [""])[0]`。
5. **分辨率是字符串**（如 `"2.5"`），数值过滤前显式 `float()`，并 `try/except` 兜住缺值条目。
6. **Entry 文档字段多为深层嵌套**，按下方字段路径表精确取值。
7. **map 下载 URL 自己拼**，别硬编码：`https://ftp.ebi.ac.uk/pub/databases/emdb/structures/{EMD-XXXXX}/map/{map.file}`。
8. **逐条遍历 entry 时加 `time.sleep(0.2)`**：无公开限速，但服务共享，礼貌间隔避免偶发 502。分页用 `start += size` 直到累计达 `hitCount`。
9. **`/api/statistics/` 返 HTML 非 JSON**，是给网页 UI 的，别程序化调用。

### Entry 文档字段路径表（`/api/entry/{id}`）

| 取什么 | 路径 |
|---|---|
| 标题 | `admin.title` |
| 释放日期 | `admin.key_dates` |
| EM 方法 | `structure_determination_list.structure_determination[0].method`（如 `singleParticle`、`tomography`） |
| 分辨率 | `…structure_determination[0].image_processing[0].final_reconstruction.resolution.valueOf_`（字符串 Å，转 float） |
| map 文件名 | `map.file` |
| map 格式/维度 | `map.format` / `map.dimensions` |
| 等值面 contour | `map.contour_list` |
| 拟合 PDB | `crossreferences.pdb_list.pdb_reference[*].pdb_id` |
| 引用 | `crossreferences.citation_list.primary_citation.citation_type`（title/journal/year/author/external_references） |
| DOI/PMID | `…citation_type.external_references[]` 中 `type` 为 `DOI`/`PUBMED` |
| 物种 | `sample.supramolecule_list.supramolecule[*].natural_source[*].organism.valueOf_` |

## 示例

关键词搜索（EBI Search WS，取 id/name/分辨率/方法/物种）：

```python
import requests, pandas as pd
EBI_SEARCH = "https://www.ebi.ac.uk/ebisearch/ws/rest/emdb"

def emdb_search(query, size=20, start=0,
                fields="id,name,resolution,em_method,organism"):
    r = requests.get(EBI_SEARCH, timeout=30, params={
        "query": query, "size": size, "start": start,
        "format": "json", "fields": fields})
    r.raise_for_status()
    return r.json()

d = emdb_search("ribosome 70S", size=10)
rows = [{
    "emdb_id": e["id"],
    "name": (e["fields"].get("name") or [""])[0][:60],
    "resolution_A": float((e["fields"].get("resolution") or [0])[0] or 0) or None,
    "organism": (e["fields"].get("organism") or [""])[0],
} for e in d["entries"]]
print(f"hitCount={d['hitCount']}")
print(pd.DataFrame(rows).to_string(index=False))
```

Entry 元数据 + map 头 + 下载 URL（单文档一把取全）：

```python
EMDB_API = "https://www.ebi.ac.uk/emdb/api"
EMDB_FTP = "https://ftp.ebi.ac.uk/pub/databases/emdb/structures"
emid = "EMD-30210"   # nsp12-nsp7-nsp8 + Remdesivir (RdRp)
e = requests.get(f"{EMDB_API}/entry/{emid}", timeout=30).json()

sd = e["structure_determination_list"]["structure_determination"][0]
res = sd["image_processing"][0]["final_reconstruction"]["resolution"]
print(f"Title  : {e['admin']['title']}")
print(f"Method : {sd['method']}")
print(f"Resol. : {float(res['valueOf_'])} {res['units']}")
m = e["map"]
print(f"Map    : {m.get('file')} [{m.get('format')}] contour={m.get('contour_list')}")
print(f"DL URL : {EMDB_FTP}/{emid}/map/{m['file']}")
```

拟合 PDB 原子模型（含 relationship）：

```python
pdblist = (e.get("crossreferences", {}).get("pdb_list") or {})
for ref in pdblist.get("pdb_reference", []):
    rel = (ref.get("relationship") or {}).get("in_frame")
    print(f"  {ref['pdb_id'].upper():6s} relationship={rel}")
# 7BV2  relationship=FULLOVERLAP
```

主引用（DOI/PMID，形状随期刊/预印本变化，做兜底）：

```python
ct = ((e.get("crossreferences", {}).get("citation_list", {})
        .get("primary_citation", {}).get("citation_type")) or {})
xrefs = ct.get("external_references", []) or ct.get("xref", [])
doi  = next((x.get("valueOf_") for x in xrefs if x.get("type") == "DOI"), None)
pmid = next((x.get("valueOf_") for x in xrefs if x.get("type") == "PUBMED"), None)
print(f"{(ct.get('title') or '').strip()[:70]} — {ct.get('journal')} ({ct.get('year')})")
print(f"DOI={doi}  PMID={pmid}")
```

按主题做「分辨率筛选 + 拟合 PDB」队列（搜索→过滤≤3 Å→逐条取拟合 PDB）：

```python
import time
hits = []
for start in (0, 50):
    hits += emdb_search("sars-cov-2 spike", size=50, start=start,
                        fields="id,name,resolution")["entries"]
    time.sleep(0.2)
rows = []
for h in hits:
    try:
        r = float((h["fields"].get("resolution") or [None])[0])
    except (TypeError, ValueError):
        continue
    if r <= 3.0:
        rows.append({"emdb_id": h["id"], "resolution_A": r})
df = pd.DataFrame(rows).sort_values("resolution_A")
for emid in df["emdb_id"].head(5):
    e = requests.get(f"{EMDB_API}/entry/{emid}", timeout=30).json()
    pl = e.get("crossreferences", {}).get("pdb_list") or {}
    pdbs = [p["pdb_id"].upper() for p in pl.get("pdb_reference", [])]
    print(f"  {emid} -> {', '.join(pdbs) or '(none fitted)'}")
    time.sleep(0.2)
```

## 注意事项

- **搜索端点别用错**：`/emdb/api/search/` 忽略 `q=` 返最新条目，会得静默错队列——只用 EBI Search WS（信封为 `{hitCount, entries, facets}`）。
- **没有子端点**：`/api/entry/{id}/map`、`/fitted`、`/publications` 全 404；`map`、`crossreferences.pdb_list`、`crossreferences.citation_list` 都从单 entry 文档读。
- **物种用 supramolecule**：`natural_source` 可能是 dict 或 list，遍历前统一成 list；`organism` 取 `.valueOf_`。
- **`pdb_list` 为 `{}` 是正常的**：很多 tomogram / 子断层平均没有拟合原子模型。
- **空 `entries`**：字段限定词写错或拼写错——去掉字段限定改纯文本搜，或在 https://www.ebi.ac.uk/ebisearch/ 核对。
- 关键参数（EBI Search `/emdb`）：`query`（必填）、`size`（默认 15，1–100）、`start`（分页偏移）、`fields`（逗号分隔，如 `id,name,resolution,em_method,organism`）、`format`（`json`/`xml`）。
- 反查 PDB→EMDB：查 RCSB PDB `/rest/v2/entry/{pdb_id}` 读 `rcsb_external_references.emdb_id`。
- 参考：[EMDB 主页](https://www.ebi.ac.uk/emdb/)、[Entry API 示例](https://www.ebi.ac.uk/emdb/api/entry/EMD-30210)、[EBI Search WS](https://www.ebi.ac.uk/ebisearch/swagger.ebi#/emdb)、[FTP 镜像](https://ftp.ebi.ac.uk/pub/databases/emdb/structures/)；Lawson CL et al. *Nucleic Acids Res* 52(D1):D456–D465 (2024) https://doi.org/10.1093/nar/gkad1019。

## 互见

- `alphafold-database-access` — AI 预测结构，与 EMDB 实验密度图互补。
- `chembl-bioactivity-database` — 配体-靶点结合活性，结构定位后看生物活性。
- `pubchem-compound-search` — 解析 map 中小分子配体的化合物身份。
- `cheminformatics-toolkit` — 拿到结构/配体后做本地化学信息学分析。
- `scientific-database-lookup` — 跨多个公开科研库（含 PDB/AlphaFold/EMDB）统一取数时。

---

采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0）。
