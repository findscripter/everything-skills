---
name: chembl-bioactivity-database
title: ChEMBL 生物活性数据库查询
description: 当需要查询化合物、靶点或 IC50/Ki/EC50 等生物活性数据、做相似性/子结构检索或 SAR 分析时使用；用纯 requests 调 ChEMBL 公共 REST/JSON API（免 SDK、免鉴权）检索化合物/靶点/活性/药物机制与适应症并产出结构化结果。不适用于 SMILES 操作/指纹/描述符（用 rdkit）或更广覆盖的 PubChem 化合物检索。触发词：ChEMBL、生物活性、IC50/Ki/EC50、靶点抑制剂、SAR、相似性检索、药物机制
domain: 领域/science
triggers: [ChEMBL, 生物活性, bioactivity, IC50, Ki, EC50, Kd, pChEMBL, 靶点抑制剂, SAR, 构效关系, 相似性检索, 子结构检索, Tanimoto, 药物机制, 适应症, 类药性, Lipinski, Rule of 5]
tags: [science, drug-discovery, cheminformatics, bioactivity, database, rest-api, chembl]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [requests, pandas, ChEMBL REST API]
requires: []
related: [pubchem-compound-search, cheminformatics-toolkit, opentargets-database, deepchem-drug-discovery]
combines_with: [autodock-vina-docking, cheminformatics-toolkit]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

当你需要在 ChEMBL（EMBL-EBI 的生物活性分子库：200 万+ 化合物、1900 万+ 活性测量、1.3 万+ 靶点）中检索数据时使用本技能。典型场景：

- 按名称 / ChEMBL ID / 理化性质查找化合物
- 查询某靶点的 IC50 / Ki / EC50 / Kd 等生物活性数据
- 用 SMILES 做相似性（Tanimoto）或子结构检索
- 检索药物作用机制（mechanism）与临床适应症（indication）
- 识别靶点的抑制剂 / 激动剂 / 活性分子
- 跨化合物系列做构效关系（SAR）分析
- 按 Lipinski 五规则等类药性标准筛选分子

**不该用本技能的边界：**
- 仅做通用化学信息学（SMILES 操作、指纹、描述符计算）→ 用 `rdkit-cheminformatics`
- 需要更广覆盖、NIH 来源的化合物检索（活性深度较弱）→ 用 `pubchem-compound-search`

**为什么不用 SDK？** `chembl_webresource_client` 只是对公共、免鉴权 REST/JSON API（`https://www.ebi.ac.uk/chembl/api/data/`）的封装糖。任何装了 `requests` 的环境都能用纯 URL 参数复现全部操作。Django 风格过滤语法（`field__icontains=…`、`field__lte=…`、`field__range=a,b`）可直接作为 URL 查询参数使用。

## 步骤 / 指令

1. **准备环境**：`pip install requests`（唯一必需）；表格分析另装 `pandas`。无需 API key。无硬性速率限制，但基础设施共享——批量循环中加 `time.sleep(0.2~0.5)`，遇 HTTP 429 退避。

2. **设定基址**：`BASE = "https://www.ebi.ac.uk/chembl/api/data"`。所有端点支持 `.json` / `.xml` / `.yaml` 后缀。

3. **选端点 + 拼过滤器**（用 `requests.get(..., params={...})`，库会自动 URL 编码，含 `__range` / `__in` 中的逗号）。核心端点：

   | 端点 | 返回 | 关键字段 |
   |---|---|---|
   | `/molecule/{id}.json` | 单个化合物 | `pref_name`、`molecule_properties`、`molecule_structures` |
   | `/molecule.json?<过滤>` | 化合物检索 | 分页 `molecules[]` |
   | `/target/{id}.json` / `/target.json` | 靶点 | `pref_name`、`target_type`、`organism`、`target_components` |
   | `/activity.json?<过滤>` | 生物活性记录 | 分页 `activities[]` |
   | `/assay.json` / `/drug.json` / `/mechanism.json` / `/drug_indication.json` | 测定 / 药物 / 机制 / 适应症 | 各自分页数组 |
   | `/similarity/{smiles}/{tanimoto}.json` | Tanimoto 相似（0–100） | `molecules[]` 含 `similarity` |
   | `/substructure/{smiles}.json` | 子结构检索 | `molecules[]` |
   | `/image/{id}.svg` | SVG 结构图 | 二进制 SVG（**非 JSON**） |

4. **过滤算子**（Django 风格，作 URL 参数，`&` 组合）：`__iexact` / `__icontains` / `__startswith` / `__endswith` / `__gt|gte|lt|lte` / `__range=lo,hi` / `__in=a,b,c` / `__isnull=False`（用 Python 字符串 `"True"`/`"False"`）/ `__regex` / `__search`。

5. **分页**：响应带 `page_meta`（`limit`/`offset`/`total_count`/`next`/`previous`）。沿 `page_meta.next` 走直到为 `null`——它是相对 URL，需前缀 `https://www.ebi.ac.uk`。

6. **关键字段速查**：
   - 活性：`standard_type`(IC50/Ki/Kd/EC50)、`standard_value`、`standard_units`(nM/uM)、`pchembl_value`(归一化 -log10，>6 为强效)、`data_validity_comment`(质量标记，分析前必查)、`potential_duplicate`。
   - 分子性质（`molecule_properties` 下）：`mw_freebase`、`full_mwt`、`alogp`、`hba`、`hbd`、`psa`、`rtb`、`num_ro5_violations`、`ro3_pass`。
   - 靶点：`target_chembl_id`、`pref_name`(全称，缩写不匹配)、`target_type`、`organism`、`tax_id`、`target_components[]`。

## 示例

**快速上手 — 取分子 / 搜靶点 / 查强效活性：**

```python
import requests
BASE = "https://www.ebi.ac.uk/chembl/api/data"

# 按 ChEMBL ID 取分子
aspirin = requests.get(f"{BASE}/molecule/CHEMBL25.json", timeout=15).json()
print(aspirin["pref_name"], aspirin["molecule_properties"]["mw_freebase"])  # ASPIRIN 180.16

# 按全称搜靶点（缩写 'EGFR' 不匹配 pref_name，须用全称）
r = requests.get(f"{BASE}/target.json",
    params={"pref_name__icontains": "epidermal growth factor receptor",
            "target_type": "SINGLE PROTEIN", "limit": 5}, timeout=15)
print(r.json()["targets"][0]["target_chembl_id"])

# EGFR(CHEMBL203) IC50 ≤ 100 nM 的强效活性
r = requests.get(f"{BASE}/activity.json",
    params={"target_chembl_id": "CHEMBL203", "standard_type": "IC50",
            "standard_value__lte": 100, "standard_units": "nM", "limit": 5}, timeout=30)
print(r.json()["page_meta"]["total_count"])
```

**工作流 1 — 找某靶点的抑制剂（先解析靶点，再分页拉强效 IC50）：**

```python
import requests, pandas as pd, time
BASE = "https://www.ebi.ac.uk/chembl/api/data"

# 注意：缩写不匹配，BRAF 须用 "B-raf"（带连字符）
r = requests.get(f"{BASE}/target.json",
    params={"pref_name__icontains": "B-raf", "target_type": "SINGLE PROTEIN", "limit": 5}, timeout=15)
human = next(t for t in r.json()["targets"] if t["organism"] == "Homo sapiens")
tid = human["target_chembl_id"]

url = (f"{BASE}/activity.json?target_chembl_id={tid}&standard_type=IC50"
       f"&standard_value__lte=100&standard_units=nM&pchembl_value__isnull=False&limit=200")
records = []
while url and len(records) < 500:
    data = requests.get(url, timeout=30).json()
    records.extend(data["activities"])
    nxt = data["page_meta"].get("next")
    url = f"https://www.ebi.ac.uk{nxt}" if nxt else None
    time.sleep(0.2)
df = pd.DataFrame(records)
df["standard_value"] = pd.to_numeric(df["standard_value"])
```

**结构检索 — 相似性 / 子结构（SMILES 必须 URL 编码）：**

```python
from urllib.parse import quote
smi = quote("CC(=O)Oc1ccccc1C(=O)O", safe="")     # 阿司匹林
r = requests.get(f"{BASE}/similarity/{smi}/85.json", params={"limit": 5}, timeout=30)  # Tanimoto ≥85%
sub = quote("c1ccc2[nH]cnc2c1", safe="")          # 苯并咪唑
r2 = requests.get(f"{BASE}/substructure/{sub}.json", params={"limit": 3}, timeout=30)
```

**药物机制与适应症：**

```python
cid = "CHEMBL535"  # 舒尼替尼（有机制+适应症；伊马替尼 CHEMBL941 某些版本机制为空）
mechs = requests.get(f"{BASE}/mechanism.json", params={"molecule_chembl_id": cid}, timeout=15).json()["mechanisms"]
inds  = requests.get(f"{BASE}/drug_indication.json", params={"molecule_chembl_id": cid, "limit": 5}, timeout=15).json()["drug_indications"]
```

**带重试的健壮 Session（批量必备）：**

```python
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

def chembl_session(retries=3, backoff=1.0):
    s = requests.Session()
    s.headers.update({"Accept": "application/json"})
    s.mount("https://", HTTPAdapter(max_retries=Retry(
        total=retries, backoff_factor=backoff,
        status_forcelist=[429, 500, 502, 503, 504], allowed_methods=["GET"])))
    return s
```

## 注意事项

- **缩写不匹配 `pref_name__icontains`**：`EGFR`/`BRAF`/`HER2` 均返回 0。用全称（`epidermal growth factor receptor`），BRAF 用 `B-raf`（带连字符），或改用 `target_components__accession=<UniProt>` 过滤。
- **跨研究比较用 `pchembl_value`**：它把 IC50/Ki/EC50 归一到可比的 -log10 标度。
- **聚合前必查 `data_validity_comment`**：非空表示策展标记（如"Potential transcription error""Outside typical range"），SAR/回归前应剔除这些行。
- **活性查询锁定 `standard_units="nM"`**：避免 nM 与 µM 混用；不同测定可能报 nM/µM/% 抑制。
- **去重**：同一测量可能被多源收录，检查 `potential_duplicate=True` 去重。
- **分页跟 `next` 而非手动加 `offset`**：游标已带在 URL 里。`offset` 分页通常有 10000 条内部上限；超限时收紧过滤再分页，或改用 ChEMBL FTP 批量下载。
- **SMILES 必须编码**：路径式端点（`/similarity/{smiles}/...`、`/substructure/{smiles}`）须 `urllib.parse.quote(smi, safe="")`，否则 `/` 撞 URL 路径报 400。
- **图片端点是二进制**：用 `/image/{id}.svg` 或 `.png`；调 `/image/{id}.json` 会 `JSONDecodeError`。
- **ID 须带前缀**：`CHEMBL25`，不是 `25`，否则 404。
- **>10 万条记录**：优先用 [ChEMBL FTP 批量下载](https://chembl.gitbook.io/chembl-interface-documentation/downloads) 而非分页 API。
- `limit` 默认 20、最大 1000；常用靶点 ID：`CHEMBL203`(EGFR)、`CHEMBL240`(D2 多巴胺受体)；常用分子 ID：`CHEMBL25`(阿司匹林)、`CHEMBL941`(伊马替尼)。

## 互见

- `rdkit-cheminformatics` — SMILES 操作、指纹、描述符
- `datamol-cheminformatics` — 分子预处理与特征化
- `pubchem-compound-search` — 替代化合物库（NIH，覆盖更广但活性深度弱）
- `pdb-database` — 经 RCSB PDB REST API 获取 ChEMBL 靶点的三维结构
- `opentargets-database` — 将 ChEMBL 药物-靶点证据关联到疾病

参考：ChEMBL 官网 https://www.ebi.ac.uk/chembl/ ｜ REST API 根 https://www.ebi.ac.uk/chembl/api/data/ ｜ API 文档 .../docs ｜ Django 过滤语法 https://chembl.gitbook.io/chembl-interface-documentation/web-services

---

采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0）。
