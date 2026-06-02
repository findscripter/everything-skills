---
name: rcsb-pdb-database
title: RCSB PDB 结构数据库查询
description: 当需要按关键词/属性/序列/3D 形状检索蛋白与核酸的实验结构（X 射线/冷冻电镜/NMR）、批量取元数据（分辨率/方法/物种/配体）或下载 mmCIF/PDB 坐标时使用；用纯 requests 调 RCSB 的 Search（REST）/Data（GraphQL）/Files 三套免鉴权接口完成检索→取元数据→下载并产出 PDB ID 列表、JSON 元数据与坐标文件。不适用于 AlphaFold 预测结构（用 alphafold-database-access）或仅取蛋白序列/注释（用 uniprot-protein-database）。触发词：PDB、RCSB、晶体结构、序列相似搜索、mmCIF 下载
domain: 领域/science
triggers: [PDB, RCSB, 晶体结构检索, 冷冻电镜结构, 序列相似性搜索, 3D结构相似, mmCIF 下载, 下载坐标文件, 按物种查结构, 蛋白配体复合物, GraphQL 取元数据, MMseqs2 序列搜索]
tags: [结构生物学, 药物发现, 数据库, REST-API, GraphQL, 蛋白结构, 序列搜索, Python]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [requests, biopython, RCSB Search API, RCSB Data GraphQL]
requires: []
related: [uniprot-protein-database, alphafold-database-access, emdb-cryoem-database, interpro-domain-database]
combines_with: [molecular-dynamics-openmm, autodock-vina-docking]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

适用：
- 按关键词或属性（物种、方法、分辨率、释放日期等）检索蛋白/核酸的实验结构（X 射线、冷冻电镜、NMR）。
- 找与某查询序列（MMseqs2）或某 3D 几何（BioZernike）相似的结构。
- 批量取元数据：分辨率、实验方法、物种、沉积日期、配体数等。
- 下载坐标文件（mmCIF/PDB/FASTA）供分子动力学、对接、可视化或建数据集。
- 跨某靶点家族比较蛋白-配体复合物。

不该用（负边界）：
- AlphaFold 预测结构 → 用 `alphafold-database-access`。
- 仅取蛋白序列/功能注释、无需结构 → 用 `uniprot-protein-database`。
- 小分子配体活性/生物测定数据 → 用 `chembl-bioactivity-database` / `pubchem-compound-search`。

关键认知：无需 SDK。`rcsb-api` 只是三套免鉴权公开接口的语法糖，纯 `requests` + 小 JSON 即可复刻全部操作。

## 步骤

RCSB 提供三个免费免鉴权端点，标准流程是「搜→取→下」：

| 接口 | URL | 方法 | 用途 |
|---|---|---|---|
| Search | `https://search.rcsb.org/rcsbsearch/v2/query` | `POST` JSON | 按文本/属性/序列/形状找 PDB ID |
| Data | `https://data.rcsb.org/graphql` | `POST` GraphQL | 取结构化元数据 |
| Files | `https://files.rcsb.org/download/{id}.{fmt}` | `GET` | 下载坐标文件 |

1. 装依赖：`pip install requests`（可选 `pip install biopython` 解析坐标）。
2. **搜**：构造 Search payload，选对 `service`（见下表），用 `return_type` 控制返回粒度，`request_options.paginate.rows` 控页大小，从 `result_set` 取 `identifier`，`total_count` 看总数。
3. **取**：拿到 ID 列表后用 GraphQL `entries(entry_ids: [...])` 批量取元数据，**勿逐 ID 发请求**。
4. **下**：从 `files.rcsb.org` 直取 `.cif`（推荐，无原子数上限）。
5. 批量循环间 `time.sleep(0.2~0.5)` 限速；遇 `429` 指数退避。

`service` 速查（决定搜索方式）：

| service | 用途 | 必需参数 |
|---|---|---|
| `full_text` | 全字段关键词 | `value` |
| `text` | 结构化属性过滤 | `attribute`/`operator`/`value` |
| `sequence` | MMseqs2 序列相似 | `target`、`value`、`evalue_cutoff`、`identity_cutoff` |
| `structure` | BioZernike 形状相似 | `value`（`{entry_id, assembly_id}`）、`operator` |
| `seqmotif`/`strucmotif`/`chemical` | 序列基序/3D 基序/配体相似 | 见官方 schema |

`return_type` 决定 `identifier` 形态：`entry`(`4HHB`) / `polymer_entity`(`4HHB_1`) / `non_polymer_entity` / `assembly`(`4HHB-1`) / `polymer_instance`(`4HHB.A`) / `mol_definition`(`HEM`)。

## 指令

文本 / 属性检索：
```python
import requests
SEARCH = "https://search.rcsb.org/rcsbsearch/v2/query"

# 关键词必须用 full_text；结构化过滤用 text，两者不可混用
def text_search(keyword, rows=25):
    payload = {"query": {"type": "terminal", "service": "full_text",
                         "parameters": {"value": keyword}},
               "return_type": "entry",
               "request_options": {"paginate": {"rows": rows}}}
    r = requests.post(SEARCH, json=payload, timeout=30); r.raise_for_status()
    d = r.json()
    return [h["identifier"] for h in d["result_set"]], d["total_count"]
```

属性 `operator` 速查（`service: text`）：`exact_match`(串) / `contains_words`·`contains_phrase` / `equals`·`greater`·`less`·`greater_or_equal`·`less_or_equal`(数) / `range`(`{from,to,include_lower,include_upper}`) / `exists` / `in`(数组)。

布尔组合（`group` + `logical_operator: and|or`，可嵌套）：
```python
# 人类、X 射线、分辨率<2.0 Å 的激酶
payload = {"query": {"type": "group", "logical_operator": "and", "nodes": [
    {"type": "terminal", "service": "full_text", "parameters": {"value": "kinase"}},
    {"type": "terminal", "service": "text", "parameters": {
        "attribute": "rcsb_entity_source_organism.scientific_name",
        "operator": "exact_match", "value": "Homo sapiens"}},
    {"type": "terminal", "service": "text", "parameters": {
        "attribute": "rcsb_entry_info.resolution_combined",
        "operator": "less", "value": 2.0}}]},
    "return_type": "entry", "request_options": {"paginate": {"rows": 10}}}
```

序列相似（MMseqs2）：
```python
payload = {"query": {"type": "terminal", "service": "sequence", "parameters": {
        "target": "pdb_protein_sequence",   # 或 pdb_dna_sequence / pdb_rna_sequence
        "value": kras_seq,
        "evalue_cutoff": 1e-5, "identity_cutoff": 0.5}},
    "return_type": "polymer_entity",
    "request_options": {"paginate": {"rows": 20}}}
# polymer_entity 标识形如 "4OBE_1"，取 entry：id.split("_")[0]
```

3D 形状相似（BioZernike）：
```python
payload = {"query": {"type": "terminal", "service": "structure", "parameters": {
        "value": {"entry_id": "4HHB", "assembly_id": "1"},
        "operator": "strict_shape_match"}},   # 或 relaxed_shape_match
    "return_type": "polymer_entity",
    "request_options": {"paginate": {"rows": 10}}}
```

批量取元数据（GraphQL，一次拉多条，避免逐 ID）：
```python
DATA = "https://data.rcsb.org/graphql"
ids_str = ", ".join(f'"{p}"' for p in pdb_ids[:50])   # 每批 ≤50
gql = f'''{{ entries(entry_ids: [{ids_str}]) {{
    rcsb_id  struct {{ title }}  exptl {{ method }}
    rcsb_entry_info {{ resolution_combined nonpolymer_entity_count }}
}} }}'''
r = requests.post(DATA, json={"query": gql}, timeout=60); r.raise_for_status()
for e in r.json()["data"]["entries"]:
    res = e["rcsb_entry_info"]["resolution_combined"]
    res_v = res[0] if isinstance(res, list) else res
    print(e["rcsb_id"], res_v, e["exptl"][0]["method"], e["struct"]["title"][:40])
```

常用 GraphQL 根：`entry(entry_id)` / `entries(entry_ids)` / `polymer_entity(entry_id, entity_id)` / `polymer_entity_instance(entry_id, asym_id)` / `assembly(entry_id, assembly_id)` / `chem_comp(comp_id)`。

下载坐标：
```python
def download(pdb_id, fmt="cif", out="."):
    url = f"https://files.rcsb.org/download/{pdb_id}.{fmt}"   # cif/pdb；装配体 {id}-assembly{N}.cif
    r = requests.get(url, timeout=60)
    if r.status_code == 200:
        path = f"{out}/{pdb_id}.{fmt}"
        open(path, "w").write(r.text); return path
# FASTA 走另一域名：https://www.rcsb.org/fasta/entry/{id}
```

分页全量遍历：`request_options.paginate.start`/`rows`（实践上限约 1 万/页，100–500 为佳）；循环改 `start += rows` 并 `time.sleep(0.3)`。

## 示例

药靶结构集——取高分辨率人类 EGFR 且带配体的结构：
```python
import requests
SEARCH = "https://search.rcsb.org/rcsbsearch/v2/query"
DATA   = "https://data.rcsb.org/graphql"

payload = {"query": {"type": "group", "logical_operator": "and", "nodes": [
    {"type": "terminal", "service": "full_text",
     "parameters": {"value": "EGFR epidermal growth factor receptor"}},
    {"type": "terminal", "service": "text", "parameters": {
        "attribute": "rcsb_entity_source_organism.scientific_name",
        "operator": "exact_match", "value": "Homo sapiens"}},
    {"type": "terminal", "service": "text", "parameters": {
        "attribute": "rcsb_entry_info.resolution_combined",
        "operator": "less", "value": 2.5}}]},
    "return_type": "entry", "request_options": {"paginate": {"rows": 50}}}
ids = [h["identifier"] for h in requests.post(SEARCH, json=payload, timeout=30).json()["result_set"]]

ids_str = ", ".join(f'"{p}"' for p in ids[:20])
gql = f'''{{ entries(entry_ids: [{ids_str}]) {{ rcsb_id  struct {{ title }}
    rcsb_entry_info {{ resolution_combined nonpolymer_entity_count }} }} }}'''
for e in requests.post(DATA, json={"query": gql}, timeout=60).json()["data"]["entries"]:
    n = e["rcsb_entry_info"]["nonpolymer_entity_count"] or 0
    if n > 0:   # 只留带配体的
        res = e["rcsb_entry_info"]["resolution_combined"]
        print(e["rcsb_id"], (res[0] if isinstance(res, list) else res), "Å  ligands=", n)
```

下载 + BioPython 列链：
```python
import requests
from Bio.PDB import MMCIFParser
open("4HHB.cif", "w").write(requests.get(
    "https://files.rcsb.org/download/4HHB.cif", timeout=60).text)
st = MMCIFParser(QUIET=True).get_structure("4HHB", "4HHB.cif")
for chain in st[0]:
    std = [r for r in chain if r.id[0] == " "]
    print("Chain", chain.id, len(std), "residues")
```

## 注意事项

- `full_text` 与 `text` 不可互换：关键词搜索报 `400 Invalid request to the [text] service` 时，多半是把关键词塞进了 `text`，改用 `full_text`。
- **搜→取**：先 Search 取 ID，再用 `entries(entry_ids: [...])` 批量取元数据；切忌逐 ID 一个 GraphQL 请求。
- **优先 mmCIF**：PDB 格式正被淘汰且有 99,999 原子上限，新代码一律下 `.cif`。
- `entries(entry_ids: [...])` 不逐一校验 ID：若有一个 ID 写错，对应项返回 `null`（不报 404），需逐项查 `data.entries[i]` 是否为 null。
- `resolution_combined` 常为列表，取值前判 `isinstance(x, list)`。
- 限速：无硬上限但基础设施共享，批量循环 `time.sleep(0.2)`，`429` 时指数退避；`500` 等 5–10 s 重试。
- 调试 `400`：`print(json.dumps(payload, indent=2))`；属性名经 `https://search.rcsb.org/rcsbsearch/v2/metadata/schema` 查证。
- `range` 必须给 `{from,to,include_lower,include_upper}` 字典；缺字段即报错。

## 互见

- requires：无
- related：`uniprot-protein-database` —— 由 UniProt accession 或序列定位结构；`alphafold-database-access` —— 无实验结构时取 AI 预测模型。
- combines_with：`autodock-vina-docking` / `diffdock-blind-docking` —— 用 PDB 结构作受体做分子对接；`molecular-dynamics-simulation` —— 用下载的坐标跑 MD；`cheminformatics-toolkit` —— 分析从复合物提取的配体。

参考：RCSB PDB https://www.rcsb.org ；Search API v2 https://search.rcsb.org/ ；Data GraphQL https://data.rcsb.org/index.html#graphql-api ；属性 schema https://search.rcsb.org/rcsbsearch/v2/metadata/schema 。

---
采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0），适配重写自 `structural-biology-drug-discovery/pdb-database/SKILL.md`。
