---
name: unichem-compound-crossref
title: UniChem 化合物 ID 交叉引用
description: 当需要把化合物在 ChEMBL/DrugBank/PubChem/ChEBI/PDB 等 20+ 库间的 ID 做交叉引用、用 InChIKey 解析到各库 source ID、按连接性找结构相关物时使用；用 EMBL-EBI UniChem REST API（除 /sources 外全 POST，无需鉴权）产出各库 ID 映射表与覆盖度。不适用于取 IC50/Ki 等实验活性（用 chembl-bioactivity-database）或本地化学信息学/性质预测（用 cheminformatics-toolkit、pubchem-compound-search）。触发词：UniChem、InChIKey、交叉引用、ID 映射、ChEMBL、DrugBank、connectivity
domain: 领域/science
triggers: [UniChem, InChIKey, 化合物交叉引用, ID 映射, ChEMBL, DrugBank, PubChem CID, ChEBI, connectivity, 结构相关物, source ID, 跨库标识符, EMBL-EBI]
tags: [science, 化学信息学, 药物发现, unichem, rest-api, 标识符映射, inchikey]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Bash, requests, pandas]
requires: []
related: [pubchem-compound-search, chembl-bioactivity-database, rdkit-cheminformatics, drugbank-database-access]
combines_with: [cheminformatics-toolkit, pubchem-compound-search]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

适用：

- 把化合物在 ChEMBL、DrugBank、PubChem、ChEBI、PDB(RCSB/PDBe)、SureChEMBL、HMDB、DrugCentral、BindingDB 等 20+ 公开库间的 ID 互转。
- 用标准 InChIKey 解析到某化合物出现的全部库及其各自 ID。
- 已知某库 source ID（如 `CHEMBL192`）反查其全部交叉引用。
- 按连接性（connectivity）找同骨架但立体/盐/同位素/质子化不同的结构相关物。
- 合并多库数据集前校验化合物身份；为药物发现项目搭交叉引用表（把 ChEMBL 活性数据接到 PDB 结构数据）。
- 按 InChIKey 检查合成物/供应商化合物是否存在于任一公开库。

不该用（负边界）：

- 取完整生物活性（IC50/Ki/Kd）——用 `chembl-bioactivity-database`；UniChem 只给 ID 交叉引用，不含实验数据。
- 性质预测、子结构/相似性搜索、本地指纹描述符——用 `pubchem-compound-search`、`cheminformatics-toolkit`；UniChem 仅做标识符翻译。

## 步骤 / 指令

API 根：`https://www.ebi.ac.uk/unichem/api/v1`，无需 API key，限速约 10 req/s（批量循环加 `time.sleep(0.1)`）。

1. **除 `/sources` 外全部用 POST**：`GET /compounds` 返回 405；`GET /compounds/{src}/{id}`、`GET /connectivity/{key}` 返回 404。唯一 GET 端点是 `/sources`。
2. **三类查询选端点**：
   - InChIKey → 全部库：`POST /compounds`，body `{"type":"inchikey","compound":"<27 字 InChIKey>"}`。
   - 某库 ID → 全部库：`POST /compounds`，body `{"type":"sourceID","compound":"CHEMBL192","sourceID":1}`。
   - 结构相关物：`POST /connectivity`，body 同 InChIKey 形式。
3. **读返回时用对字段名**（最高频错误）：`POST /compounds`、`POST /connectivity` 返回的 `sources` 列表里每条命中的库标识符是 **`id`**（小写），不是 `sourceID`；只有 `GET /sources` 目录里才用 **`sourceID`**（大写 ID）。迭代命中用 `src["id"]`，迭代目录用 `s["sourceID"]`。
4. **必须传完整 27 字标准 InChIKey**：`/connectivity` 拒绝 14 字连接性片段，返回 `{"response":"Not found"}`；UniChem 内部自行剥离立体/电荷层。
5. **无批量端点**：body 传 `{"compounds":[...]}` 或 `{"inchikeys":[...]}` 返回 400 `illegal_argument_exception`。多输入须逐条 POST 循环。
6. **只索引标准 InChIKey**：非标准 InChIKey 查无结果，先用 RDKit `MolToInchiKey(mol)` 规范化。
7. **精确查不到就退连接性**：若你手上是游离酸/碱 InChIKey 而库里收的是盐（如盐酸盐），`/compounds` 会漏，改跑 `/connectivity` 兜底。
8. **缓存 source 表**：启动时调一次 `/sources` 建 `{sourceID: nameLabel}` 字典，别硬编码 ID。
9. `/connectivity` 在常见骨架上较慢，`timeout` 提到 30s。

### 常用 source ID（以 /sources 实时核对为准）

| ID | 库 | ID | 库 |
|---|---|---|---|
| 1 | ChEMBL | 15 | SureChEMBL（专利） |
| 2 | DrugBank | 18 | HMDB |
| 3 | RCSB PDB | 22 | PubChem |
| 5 | PDBe | 31 | BindingDB |
| 7 | ChEBI | 34 | DrugCentral |
| 14 | FDA SRS | 49 | Probes-and-Drugs |

## 示例

通用 POST 助手 + InChIKey 查全部库：

```python
import requests, pandas as pd
UNICHEM = "https://www.ebi.ac.uk/unichem/api/v1"

def lookup_by_inchikey(inchikey: str) -> pd.DataFrame:
    """返回某 InChIKey 在各库的全部交叉引用。"""
    r = requests.post(f"{UNICHEM}/compounds",
                      json={"type": "inchikey", "compound": inchikey}, timeout=20)
    r.raise_for_status()
    compounds = r.json().get("compounds", [])
    if not compounds:
        return pd.DataFrame()
    rows = [{"source_id": s["id"], "short_name": s.get("shortName", ""),
             "compound_id": s["compoundId"]}            # 注意是 s["id"]，不是 s["sourceID"]
            for s in compounds[0].get("sources", [])]
    return pd.DataFrame(rows).sort_values("source_id")

df = lookup_by_inchikey("XEFQLINVKFYRCS-UHFFFAOYSA-N")   # triclosan
# ChEMBL=CHEMBL849, DrugBank=DB08604, RCSB PDB=TCL, ChEBI=CHEBI:164200 ...
```

按某库 ID 反查（type=sourceID）：

```python
body = {"type": "sourceID", "compound": "CHEMBL192", "sourceID": 1}  # sildenafil, from ChEMBL
sources = requests.post(f"{UNICHEM}/compounds", json=body, timeout=20).json()["compounds"][0]["sources"]
```

连接性搜索（同骨架的盐/立体异构/外消旋体）：

```python
def connectivity_search(inchikey: str) -> dict:
    """传完整 27 字 InChIKey；返回 totalCompounds/totalSources 与扁平 sources 列表，每条带 comparison 层匹配信息。"""
    r = requests.post(f"{UNICHEM}/connectivity",
                      json={"type": "inchikey", "compound": inchikey}, timeout=30)
    r.raise_for_status()
    return r.json()

data = connectivity_search("PJVWKTKQMONHTI-UHFFFAOYSA-N")   # warfarin
print(data["totalCompounds"], "unique compounds,", data["totalSources"], "records")
# 每条 src["comparison"] 含 stereoSp3 / protonation / isotope，可筛"骨架同、立体异"的相关物
```

批量翻译（无批量端点，逐条循环 + 限速）：

```python
import time
def batch_translate(inchikeys, target=(1, 2, 7, 22)):  # ChEMBL/DrugBank/ChEBI/PubChem
    rows = []
    for ik in inchikeys:
        row = {"inchikey": ik}
        try:
            c = requests.post(f"{UNICHEM}/compounds",
                              json={"type": "inchikey", "compound": ik}, timeout=20).json().get("compounds", [])
            hits = {s["id"]: s["compoundId"] for s in c[0]["sources"]} if c else {}
            for sid in target:
                row[f"src_{sid}"] = hits.get(sid)
        except requests.RequestException as e:
            row["error"] = str(e)
        rows.append(row); time.sleep(0.1)   # 尊重 ~10 req/s
    return pd.DataFrame(rows)
```

列出全部数据源（唯一 GET 端点，目录里用大写 `sourceID`）：

```python
srcs = requests.get(f"{UNICHEM}/sources", timeout=15).json()["sources"]
src_map = {s["sourceID"]: s.get("nameLabel", str(s["sourceID"])) for s in srcs}
```

## 注意事项

- **`id` vs `sourceID` 是头号坑**：命中记录读 `src["sourceID"]` 会 `KeyError`，只能用 `src["id"]`；`sourceID` 仅存在于 `/sources` 目录。
- **InChIKey 结构**：27 字分三段——前 14 字连接性层（重原子与键），中 8 字立体与电荷，末 1 字版本标志。`/compounds` 要求标准 InChIKey 完全一致（同立体/盐/同位素）；`/connectivity` 只比连接性层。
- **连接性结果可能过多**：同骨架常匹配大量 SureChEMBL 专利 ID——按 `src["id"]==15` 过滤掉，或按 `comparison.stereoSp3==True` 收窄。
- **空结果排查**：非标准 InChIKey、盐型不符或库未收。先 RDKit 校验 InChIKey，再退 `/connectivity` 捕捉盐/立体变体。
- **URL/超时**：`/connectivity` 慢时把 `timeout` 提到 30s，429/503 退避重试一次；部分 source 不提供 url 模板，需用 `/sources` 的 `baseIdUrl` 拼 `compoundId` 手工构链。
- **PubChem CID → InChIKey 起步**：手上只有 CID 时，先经 PubChem PUG-REST `compound/cid/{cid}/property/InChIKey/JSON` 取 InChIKey，再喂给 UniChem。

## 互见

- requires：（无）
- related：`pubchem-compound-search` —— 拿到 PubChem CID 后查性质/同义词；`scientific-database-lookup` —— 更广的多库 REST 取数总入口；`cheminformatics-toolkit` —— 本地 RDKit 规范化 InChIKey/SMILES。
- combines_with：`chembl-bioactivity-database` —— 用 UniChem 解出的 ChEMBL ID 拉 IC50/Ki 活性；`autodock-vina-docking` —— 用解出的 PDB 配体码取共晶结构做对接；`deepchem-drug-discovery` —— 跨库 ID 对齐后喂入建模管线。

---

采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0）。
