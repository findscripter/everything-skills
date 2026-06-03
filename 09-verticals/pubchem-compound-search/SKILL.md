---
name: pubchem-compound-search
title: PubChem 化合物检索
description: 当需要按名称/CID/SMILES/InChIKey/分子式检索 PubChem 化合物、取理化属性或做相似性/子结构搜索时使用；用 requests 直连 PUG-REST/JSON API，产出 CID、属性表、同义词、生物活性与 SDF/PNG。不适用于本地化学信息学（用 rdkit）或靶点结合活性 IC50/Ki（用 chembl-database-bioactivity）。触发词：PubChem、CID、SMILES、PUG-REST
domain: 领域/science
triggers: [PubChem, PUG-REST, CID, SMILES, InChIKey, 分子式检索, 理化属性, 相似性搜索, 子结构搜索, Tanimoto, 化合物检索, 同义词, SDF 下载, Lipinski, 类药五规则]
tags: [science, 化学信息学, 药物发现, pubchem, rest-api, 化合物检索, 理化属性]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Bash, requests, pandas]
requires: []
related: [chembl-bioactivity-database, cheminformatics-toolkit, scientific-database-lookup, autodock-vina-docking]
combines_with: [cheminformatics-toolkit, autodock-vina-docking]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

适用：

- 按名称、SMILES、InChIKey 或分子式查 PubChem CID。
- 批量拉取理化属性（分子量、XLogP、TPSA、氢键供受体数、可旋转键、IUPAC 名、分子式）——一次请求多 CID 多属性。
- 用 Tanimoto 相似性找结构类似物，或按子结构/药效团 motif 搜索（异步 ListKey）。
- 取某 CID 的全部同义词/商品名/CAS、策展描述、生物活性 assay 汇总。
- 标识符互转（name ↔ CID ↔ SMILES ↔ InChI ↔ InChIKey）。
- 下载 2D SDF 或 PNG 结构图，供 RDKit/作图下游使用。

不该用（负边界）：

- 本地化学信息学（指纹、描述符、3D 构象、骨架提取）——用 `rdkit-cheminformatics`。
- 深度靶点结合活性（IC50/Ki/Kd against specific targets）——用 `chembl-database-bioactivity`，其比 PubChem assay 汇总更细。
- 蛋白结构/共晶——用 `pdb-database`。

## 步骤 / 指令

1. 准备环境：仅需 `requests`、`pandas`，标准环境已带；**无需 API key**。若在 pixi/conda 环境用 `pixi run python ...`。
   ```bash
   pip install requests pandas
   ```
2. 记住固定 URL 语法（PUG-REST）：
   ```
   https://pubchem.ncbi.nlm.nih.gov/rest/pug/<input>/<operation>/<output>
   ```
   - `<input>` = `compound/{name,cid,smiles,inchikey,inchi,formula}/<value>`
   - `<operation>` = `cids`、`property/<csv>`、`synonyms`、`description`、`assaysummary`、`JSON`、`SDF`、`PNG`
   - `<output>` = `JSON`、`CSV`、`TXT`、`SDF`、`PNG`
3. **先解析 CID 再查属性**：从名称/外部标识符起步时，先 `cids/JSON` 拿到 CID 列表，再用 CID 查属性，下游查询需要这份规范 CID。
4. **批量而非循环**：CID 与属性名都可 CSV 拼接，单次请求最多约 200 个 CID + 任意属性，一个往返。循环逐个查是最常见的限流陷阱。
5. **每个 SMILES 都要 URL 编码**：`urllib.parse.quote(smi, safe="")`，否则 `#`、`+`、`/`、`\` 等会破坏路径解析（HTTP 400）。
6. **相似性/子结构/分子式搜索按异步处理**：判断 `"Waiting" in resp`，命中则轮询 `compound/listkey/{key}/cids/JSON` 直到返回 `IdentifierList`，不要重发搜索（重发会另起 ListKey 浪费任务槽）。少数快搜首调即直接返回 `IdentifierList`，要兼容两种。
7. **限流 ≤ 5 req/s、≤ 400 req/min**：紧循环里 `time.sleep(0.25)`；HTTP 503 = `PUGREST.ServerBusy`，等 10s 并降并发。
8. **`MolecularWeight` 是字符串**（如 `"180.16"`），算术比较前 `float()`。
9. **100+ CID 用 POST**：GET URL 超约 2000 字符可能被代理截断；改 `requests.post(f"{BASE}/compound/cid/property/MolecularWeight/JSON", data={"cid": cid_csv})`。
10. **SMILES 属性名**：2025 PUG-REST 把 `CanonicalSMILES` 改名为 `SMILES`，新代码用 `SMILES`，响应字段也键为 `SMILES`。

## 示例

快速上手（name → CID → 属性）：

```python
import requests
BASE = "https://pubchem.ncbi.nlm.nih.gov/rest/pug"

cid = requests.get(f"{BASE}/compound/name/aspirin/cids/JSON").json()["IdentifierList"]["CID"][0]
r = requests.get(
    f"{BASE}/compound/cid/{cid}/property/"
    "MolecularWeight,XLogP,TPSA,HBondDonorCount,HBondAcceptorCount,SMILES,IUPACName/JSON")
p = r.json()["PropertyTable"]["Properties"][0]
print(f"CID {cid} — {p['IUPACName']}  MW={p['MolecularWeight']} XLogP={p['XLogP']}")
```

标识符解析（按 SMILES / InChIKey，注意编码）：

```python
from urllib.parse import quote
smi = quote("CC(=O)OC1=CC=CC=C1C(=O)O", safe="")
cid = requests.get(f"{BASE}/compound/smiles/{smi}/cids/JSON").json()["IdentifierList"]["CID"][0]
ikey = "BSYNRYMUTXBXSQ-UHFFFAOYSA-N"
cid = requests.get(f"{BASE}/compound/inchikey/{ikey}/cids/JSON").json()["IdentifierList"]["CID"][0]
```

批量属性（4 个 CID，3 个属性，一个往返）：

```python
import pandas as pd
cids = "2244,3672,2157,2662"   # aspirin, ibuprofen, naproxen, celecoxib
r = requests.get(f"{BASE}/compound/cid/{cids}/property/MolecularWeight,XLogP,TPSA/JSON")
df = pd.DataFrame(r.json()["PropertyTable"]["Properties"])
```

异步相似性/子结构搜索（核心 ListKey 轮询助手，到处复用）：

```python
import time
from urllib.parse import quote

def poll_listkey(listkey, max_polls=10, interval=2.0):
    """阻塞直到 PubChem 完成异步搜索；返回 CID 列表。"""
    for _ in range(max_polls):
        time.sleep(interval)
        j = requests.get(f"{BASE}/compound/listkey/{listkey}/cids/JSON", timeout=20).json()
        if "IdentifierList" in j:
            return j["IdentifierList"]["CID"]
    raise TimeoutError(f"ListKey {listkey} did not complete")

# Tanimoto 相似性（90% 阈值，最多 20 条）
smi = quote("CC(=O)OC1=CC=CC=C1C(=O)O", safe="")
init = requests.get(f"{BASE}/compound/similarity/smiles/{smi}/JSON?Threshold=90&MaxRecords=20").json()
cids = poll_listkey(init["Waiting"]["ListKey"]) if "Waiting" in init else init["IdentifierList"]["CID"]

# 子结构（含磺酰胺 motif 的化合物）
smi = quote("S(=O)(=O)N", safe="")
init = requests.get(f"{BASE}/compound/substructure/smiles/{smi}/JSON?MaxRecords=20").json()
cids = poll_listkey(init["Waiting"]["ListKey"]) if "Waiting" in init else init["IdentifierList"]["CID"]
```

下载 SDF / PNG：

```python
cid = 2519  # caffeine
sdf = requests.get(f"{BASE}/compound/cid/{cid}/SDF", timeout=15).text          # 2D SDF；?record_type=3d 取 3D
png = requests.get(f"{BASE}/compound/cid/{cid}/PNG?image_size=large", timeout=15).content
```

Lipinski 类药五规则速查：

```python
def check_lipinski(name):
    cid = requests.get(f"{BASE}/compound/name/{quote(name)}/cids/JSON").json()["IdentifierList"]["CID"][0]
    p = requests.get(f"{BASE}/compound/cid/{cid}/property/"
        "MolecularWeight,XLogP,HBondDonorCount,HBondAcceptorCount/JSON"
        ).json()["PropertyTable"]["Properties"][0]
    mw, xlogp = float(p["MolecularWeight"]), p.get("XLogP", 0) or 0   # MW 是字符串；XLogP 可能为 None
    rules = {"MW ≤ 500": mw <= 500, "XLogP ≤ 5": xlogp <= 5,
             "HBD ≤ 5": p["HBondDonorCount"] <= 5, "HBA ≤ 10": p["HBondAcceptorCount"] <= 10}
    return rules, sum(1 for ok in rules.values() if not ok)
```

健壮 Session（自动重试 / 429 / 503 退避）：

```python
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
s = requests.Session()
s.headers.update({"Accept": "application/json"})
s.mount("https://", HTTPAdapter(max_retries=Retry(
    total=4, backoff_factor=1.0, status_forcelist=[429, 500, 502, 503, 504],
    allowed_methods=["GET", "POST"])))
```

## 注意事项

常用属性名（CSV 任意拼接进 `/property/<csv>/JSON`）：`MolecularWeight`（字符串，g/mol）、`MolecularFormula`、`SMILES`、`IUPACName`、`InChI`/`InChIKey`、`XLogP`、`TPSA`(Å²)、`HBondDonorCount`、`HBondAcceptorCount`、`RotatableBondCount`、`HeavyAtomCount`、`Charge`。

响应信封形状：

- `cids/JSON` → `{"IdentifierList": {"CID": [int, ...]}}`
- `property/.../JSON` → `{"PropertyTable": {"Properties": [{...}, ...]}}`（一行一 CID，按输入序）
- `synonyms/JSON` → `{"InformationList": {"Information": [{"CID": int, "Synonym": [...]}]}}`
- `assaysummary/JSON` → `{"Table": {"Columns": {"Column": [...]}, "Row": [{"Cell": [...]}, ...]}}`
- 异步初始化（similarity/substructure/formula）→ HTTP 202 + `{"Waiting": {"ListKey": "..."}}`

关键参数：`Threshold`（相似性，默认 90，0–100）、`MaxRecords`（异步结果上限，1–10000）、`image_size`（PNG，small/large/WxH）、`record_type`（SDF，2d/3d）、`MaxAssayResults`（限制 assay 行数）。

常见排错：

- HTTP 404 `PUGREST.NotFound`：名称/SMILES/分子式无匹配——换 CAS 或 InChIKey；用 RDKit 规范化的 canonical SMILES 常能命中原始 SMILES 解析不到的记录。
- HTTP 202 卡在 `Waiting`：异步任务仍在跑——每 2s 轮询 listkey 至约 30s；不完成就调小 `MaxRecords`。
- HTTP 503 `PUGREST.ServerBusy`：触发限流——加 `time.sleep(0.25)`、用重试 Session、降并发。
- HTTP 400（SMILES URL）：未 URL 编码——`quote(smi, safe="")`。
- `KeyError: 'SMILES'`：用了旧名 `CanonicalSMILES`——改用 `SMILES`。
- `TypeError '>' str vs int`：`MolecularWeight` 是字符串——先 `float()`。
- 批量只返回部分行：URL 超限——改 POST，body 带 `{"cid": "..."}`。
- `assaysummary` Table 为空：该 CID 无生物活性记录，属正常。
- `XLogP` 为 `None`：该化合物未计算——用 `p.get("XLogP", 0) or 0` 兜底。

参考：[PUG-REST 文档](https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest)、[PUG-REST 教程](https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest-tutorial)、[属性表](https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest#section=Compound-Property-Tables)。

## 互见

- `chembl-database-bioactivity` — IC50/Ki/Kd 靶点结合数据，比 PubChem assay 汇总更深。
- `rdkit-cheminformatics` — 本地 SMILES/MOL 操作、指纹、描述符、骨架提取。
- `pdb-database` — 与 PubChem CID 小分子共晶的蛋白结构。

---

采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0）。
