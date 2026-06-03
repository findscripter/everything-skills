---
name: pride-proteomics-database
title: PRIDE 蛋白质组数据集检索
description: 当需要在 PRIDE Archive 检索蛋白质组学公开数据集、按关键词+分面筛选、取项目元数据、列举/下载 RAW/PEAK/RESULT/FASTA 文件或查某 UniProt 蛋白被哪些项目报告时使用；用 requests 直连 PRIDE v3 REST API（免鉴权），产出项目列表、分面计数、文件清单与 FTP/Aspera 下载链接、SDRF 样本映射。不适用于肽段/PSM 级鉴定（v3 已无此端点，须下载 RESULT 文件本地解析）或蛋白序列注释（用 uniprot-protein-database）。触发词：PRIDE、PXD、ProteomeXchange、质谱数据集、proteomics、SDRF、RESULT 文件
domain: 领域/science
triggers: [PRIDE, PXD, ProteomeXchange, 质谱数据集, proteomics, 蛋白质组, SDRF, RESULT 文件, RAW 文件, 分面检索, 项目元数据, EBI, mzIdentML, 数据集下载]
tags: [science, 蛋白质组学, 质谱, pride, rest-api, 数据集检索, proteomexchange]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Bash, requests, pandas]
requires: []
related: [maxquant-proteomics, pyopenms-mass-spectrometry, uniprot-protein-database, metabolomics-workbench-database]
combines_with: [gene-set-enrichment-analysis]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

适用：

- 按自由文本关键词 + 分面（物种 / 仪器 / 疾病 / 软件 / PTM）检索已发表的蛋白质组数据集，做 meta 分析或基准。
- 从某 PRIDE 项目（`PXD######`）下载原始质谱数据（RAW、mzML、MGF）或预处理鉴定结果（RESULT 文件），取 FTP/Aspera 下载链接。
- 查某 UniProt 蛋白被哪些 PRIDE 项目报告（仅项目级出现映射，无 PSM/覆盖度计数）。
- 找与目标项目相似的项目，做再分析或跨研究比较。
- 拉取 SDRF（样本-数据关系格式）以编程方式建模「样本 ↔ MS run」映射。
- 构造结构化查询前，先用分面端点发现合法的筛选取值。

不该用（负边界）：

- **肽段 / PSM 级鉴定**：PRIDE v3 已移除 `/peptides`、`/psms`、`/proteins?proteinAccession=` 端点——需下载项目 RESULT 文件，用 `pyopenms-mass-spectrometry` 或 pyteomics 本地解析。
- 蛋白序列、Swiss-Prot 注释、ID 映射——用 `uniprot-protein-database`。
- 本地解析 mzML/mzIdentML 与定量分析——用 `pyopenms-mass-spectrometry` / `maxquant-proteomics`。

## 步骤 / 指令

1. 环境：仅需 `requests`、`pandas`（作图加 `matplotlib`），**免鉴权、无 API key**。pixi/conda 下用 `pixi run python ...`。
   ```bash
   pip install requests pandas matplotlib
   ```
2. 固定根地址：`PRIDE = "https://www.ebi.ac.uk/pride/ws/archive/v3"`。OpenAPI 规范在 `…/v3/v3/api-docs`。
3. **检索用 `/search/projects`，不要用 `/projects`**：`/projects` 是分页列举端点，会**静默忽略** keyword/organism/disease 等筛选；只有 `/search/projects?keyword=…&filter=field==value` 才真正过滤。
4. **先 `/facet/projects` 发现合法筛选值再过滤**：分面值必须**精确匹配**（如 `organisms_facet==Homo sapiens (human)`，括号都不能少）。该端点返回 `{facet组: {值: 计数}}`。
5. **筛选语法**：`filter` 为逗号分隔的 `字段_facet==值` 列表，如 `organisms_facet==Homo sapiens (human),instruments_facet==Q Exactive`。
6. **分页无元数据，走到空为止**：v3 返回**纯 JSON 数组**（无 HAL `_embedded`/`page` 信封、无 totalElements）。从 `page=0,1,2,…` 迭代，直到返回空数组或长度 < `pageSize` 停止。
7. **下载前按 `fileCategory.value` 过滤**：取值为 `RAW`/`PEAK`/`RESULT`/`FASTA`/`OTHER`；文件大小字段是 **`fileSizeBytes`**（不是 `fileSize`），除 `1e6` 得 MB。每个文件含 `FTP Protocol` 与 `Aspera Protocol` 两个链接，批量下载优先 FTP 配 `aria2c -x 8 -j 4`。
8. **限流**：未正式公布，紧循环里加 `time.sleep(0.3)`、突发 < ~5 req/s；遇 429/5xx 指数退避重试。

## 示例

快速上手（检索 → 详情 → 文件清单）：

```python
import requests
PRIDE = "https://www.ebi.ac.uk/pride/ws/archive/v3"

# 1) 自由文本检索（返回纯 list[dict]，无 _embedded 信封）
projects = requests.get(f"{PRIDE}/search/projects",
                        params={"keyword": "prostate cancer", "pageSize": 5}, timeout=30).json()
acc = projects[0]["accession"]

# 2) 项目详情
p = requests.get(f"{PRIDE}/projects/{acc}", timeout=30).json()
print(p["accession"], (p["title"] or "")[:70], p.get("doi"))
print("物种:", [o["name"] for o in p.get("organisms", [])])

# 3) 文件总量
files = requests.get(f"{PRIDE}/projects/{acc}/files/all", timeout=60).json()
print(f"{len(files)} 文件, {sum(f.get('fileSizeBytes',0) for f in files)/1e6:.0f} MB")
```

分面发现 + 过滤检索：

```python
# 先看 cancer 相关数据集里哪些仪器/疾病常见
facets = requests.get(f"{PRIDE}/facet/projects",
                      params={"keyword": "cancer", "facetPageSize": 10}, timeout=30).json()
print("分面组:", list(facets.keys()))   # instruments, organisms, diseases, softwares, ...
for instr, n in sorted(facets.get("instruments", {}).items(), key=lambda kv: -kv[1])[:5]:
    print(f"  {instr:<35} {n}")

# 用 top 仪器 + 物种做过滤检索（facet 值须精确匹配）
hits = requests.get(f"{PRIDE}/search/projects",
        params={"keyword": "cancer",
                "filter": "organisms_facet==Homo sapiens (human),instruments_facet==Q Exactive",
                "pageSize": 50, "sortFields": "submission_date", "sortDirection": "DESC"},
        timeout=30).json()
```

分页拉全（无总数，走到空为止）：

```python
def search_all(keyword, page_size=100, max_pages=10):
    out, page = [], 0
    while page < max_pages:
        batch = requests.get(f"{PRIDE}/search/projects",
                  params={"keyword": keyword, "pageSize": page_size, "page": page},
                  timeout=30).json()
        if not batch: break
        out += batch
        if len(batch) < page_size: break   # 末页
        page += 1
    return out
```

文件下载清单（过滤类别 → 生成 aria2c URL 列表）：

```python
import pandas as pd
files = requests.get(f"{PRIDE}/projects/PXD004131/files/all", timeout=120).json()
keep = {"RAW", "RESULT"}
rows = []
for f in files:
    cat = (f.get("fileCategory") or {}).get("value")
    if cat not in keep: continue
    ftp = next((l["value"] for l in f.get("publicFileLocations", [])
                if l.get("name") == "FTP Protocol"), None)
    if ftp:
        rows.append({"name": f["fileName"], "cat": cat,
                     "mb": round((f.get("fileSizeBytes") or 0)/1e6, 2), "ftp": ftp})
mdf = pd.DataFrame(rows)
print(f"保留 {len(mdf)}/{len(files)} 文件, {mdf['mb'].sum():.0f} MB")
open("pride_dl.list", "w").write("\n".join(mdf["ftp"]))   # aria2c -i pride_dl.list -x 8 -j 4
```

蛋白 → 项目出现映射（仅项目列表，无 PSM/覆盖度）：

```python
def protein_projects(uniprot_acc):
    r = requests.get(f"{PRIDE}/proteins/{uniprot_acc}", timeout=30)
    return r.json().get("projects", []) if r.status_code == 200 else []

tp53 = protein_projects("P04637")
print(f"TP53 (P04637) 被 {len(tp53)} 个 PRIDE 项目报告: {tp53[:8]}")
```

SDRF 样本-run 映射 / 相似项目 / 仓库总量：

```python
import io
# SDRF（404 表示该项目未提供）
r = requests.get(f"{PRIDE}/files/sdrf/PXD000001", timeout=30)
sdrf = pd.read_csv(io.StringIO(r.text), sep="\t") if r.status_code == 200 else None

# 相似项目 / 自动补全
similar = requests.get(f"{PRIDE}/projects/PXD004131/similarProjects",
                       params={"pageSize": 5}, timeout=30).json()
sugg = requests.get(f"{PRIDE}/search/autocomplete", params={"keyword": "tp53"}, timeout=30).json()

# 仓库级总数（返回纯整数文本，非 JSON 对象）
n_proj = int(requests.get(f"{PRIDE}/projects/count", timeout=30).text)
n_file = int(requests.get(f"{PRIDE}/files/count", timeout=30).text)
```

## 注意事项

文件类别速查（`fileCategory.value`）：`RAW`（仪器原始：.raw/.d/.wiff）、`PEAK`（质心谱：.mzML/.mzXML/.mgf）、`RESULT`（鉴定结果：.mzid/.mzTab/MaxQuant txt）、`FASTA`（搜库序列库）、`OTHER`（脚本/表格）。再分析优先 `RESULT`（最省，无需重搜谱）；换引擎重搜用 `PEAK`；仅全流程重处理才需 `RAW`（GB 级）。

v3 已移除（与 v2 内部互为别名，`/v2/peptides` 报错路径仍指 v3）：

| 旧端点 | v3 状态 | 替代 |
|---|---|---|
| `GET /peptides?projectAccessions=X` | 404 | 下载项目 RESULT 文件本地解析 |
| `GET /psms?projectAccessions=X` | 404 | 同上 |
| `GET /proteins?proteinAccession=X`（query 式） | 404 | `GET /proteins/{accession}`（path 式） |
| HAL+JSON `_embedded`/`page` 信封 | 移除 | 纯 JSON 数组 |
| `/projects?keyword=…&organisms=…` 过滤 | 静默忽略 | `/search/projects?keyword=…&filter=…` |

常见排错：

- 解析得空列表但 `r.json()` 有数据：代码在取 `data["_embedded"]["compactprojects"]`（v2 旧信封）——直接 `r.json()` 当 list 用。
- `/peptides`、`/psms`、query 式 `/proteins` 报 404：v3 已删——肽/PSM 走 RESULT 文件；蛋白查询改 path 式 `/proteins/{accession}`。
- `/projects?keyword=cancer` 返回与无 keyword 相同的 100 条：`/projects` 仅认 `pageSize`/`page`——改用 `/search/projects`。
- 文件大小为 0：读了 `fileSize`——v3 字段是 `fileSizeBytes`（字节），除 `1e6` 得 MB。
- filter 无效：facet 值未精确匹配——先 `/facet/projects?keyword=…` 枚举合法值（是 `Homo sapiens (human)`，不是 `Homo sapiens`）。
- 超结果集的 `pageSize` 返回空数组：正常分页行为——长度 < `pageSize` 或为空即停。
- `findAllOrganismsCount` 报 406：该端点需非 JSON Accept 头——跳过，用 `/facet/projects` 代替。
- 429 / ConnectionError：EBI 共享基础设施限流——循环加 `time.sleep(0.3)`，5xx 指数退避重试。

关键参数：`keyword`（全文检索 title/desc/tags）、`filter`（`字段_facet==值` 逗号分隔）、`pageSize`（默认 100）、`page`（0 起，无元数据走到空）、`sortFields`（默认 `submission_date`）、`sortDirection`（`ASC`/`DESC`）、`facetPageSize`（每分面组返回值数，默认 20）。

PXD 编号跨 PRIDE/MassIVE/jPOST/iProX 稳定；项目内文件 accession 是 SHA-256 式不透明哈希，人读用 `fileName`。

参考：[PRIDE v3 API 根](https://www.ebi.ac.uk/pride/ws/archive/v3/)、[OpenAPI 规范](https://www.ebi.ac.uk/pride/ws/archive/v3/v3/api-docs)、[PRIDE 门户](https://www.ebi.ac.uk/pride/)、[Perez-Riverol et al., NAR 2022](https://doi.org/10.1093/nar/gkab1038)、[SDRF-Proteomics 规范](https://github.com/bigbio/proteomics-sample-metadata)。

## 互见

- requires：`uniprot-protein-database` —— 蛋白查询前先有 UniProt accession；查到项目后再回填序列与功能注释。
- related：`scientific-database-lookup`、`protein-language-models`
- combines_with：`pyopenms-mass-spectrometry` —— 下载 RESULT/PEAK 文件后本地解析谱图与 PSM；`maxquant-proteomics` —— 对 RAW/PEAK 文件做定量再分析。

---

采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0）。
