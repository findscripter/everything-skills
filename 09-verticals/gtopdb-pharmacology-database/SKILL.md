---
name: gtopdb-pharmacology-database
title: GtoPdb 药理学指南数据库查询
description: 当需要查 IUPHAR/BPS 药理学指南（GtoPdb）的受体-配体亲和力（pKi/pIC50/pKd）、靶点/配体元数据、IUPHAR 家族层级或获批药物时使用；用纯 requests 调免鉴权 REST/JSON API，靶点经 geneSymbol/accession 精确解析、关键字段从子资源（/databaseLinks、/structure、/synonyms、/interactions）取，产出结构化亲和力/交叉引用/结构表。不适用于海量生物活性数据（用 chembl）或 FDA 标签文本。触发词：GtoPdb、Guide to Pharmacology、IUPHAR、受体配体、pKi、激动剂拮抗剂、靶点家族
domain: 领域/science
triggers: [GtoPdb, Guide to Pharmacology, IUPHAR, BPS, 药理学指南, 受体配体, 受体-配体相互作用, pKi, pIC50, pKd, pEC50, 亲和力, 激动剂, 拮抗剂, Agonist, Antagonist, 靶点家族, IUPHAR家族, 获批药物, approved, geneSymbol, UniProt accession, SMILES, InChIKey]
tags: [science, drug-discovery, pharmacology, receptor-ligand, database, rest-api, gtopdb, iuphar]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [requests, pandas, GtoPdb Web Services API]
requires: []
related: [chembl-bioactivity-database, drugbank-database-access, pubchem-compound-search, ddinter-drug-interactions]
combines_with: [uniprot-protein-database, scientific-database-lookup]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

当你需要在 IUPHAR/BPS 药理学指南（GtoPdb，人工策展的受体药理学库：靶点、配体、定量相互作用、867 个 IUPHAR 家族）检索数据时使用。基址 `https://www.guidetopharmacology.org/services`，返回 JSON，**免鉴权**。典型场景：

- 查某配体在某靶点上的亲和力（pKi / pIC50 / pKd）
- 列出某受体（如 μ-阿片受体 / OPRM1）的全部已标注配体
- 查配体获批状态（`approved=true`）及其交叉引用（PubChem CID、ChEMBL ID、DrugBank ID）
- 取 IUPHAR 家族层级做受体分类
- 拉结构描述符（SMILES、InChI、InChIKey）供化学信息学使用
- 映射 HGNC 符号 → UniProt → GtoPdb 靶点 ID 做跨库整合

**不该用本技能的边界：**
- 需要更大规模生物活性数据集（240 万+ 化合物）→ 用 `chembl-bioactivity-database`（GtoPdb 策展、量小但标注更深）
- 需要 FDA 获批药物标签 / 监管文本 → GtoPdb 只做药理学，不含监管文本
- 仅做 SMILES 操作 / 指纹 / 描述符 → 用 `cheminformatics-toolkit`

**核心心智模型**：GtoPdb 的基础记录刻意精简——基础 `/targets/{id}` 与 `/ligands/{id}` 只含 ID 和家族指针，**没有**基因符号、UniProt、SMILES、ChEMBL。要拿这些数据必须读**子资源**。

## 步骤 / 指令

1. **准备环境**：`pip install requests pandas`。无 API key。无公布速率限制，但批量循环加 `time.sleep(0.2)`。

2. **解析靶点（务必精确匹配）**：用 `geneSymbol=<HGNC>` 或 `accession=<UniProt>` 查 `/targets`，二者皆为**精确匹配**。**绝不用 `name=`**——它跨所有字段模糊匹配，会静默返回错误靶点（如 `name=beta-2` 同时命中 PLC β2、GABA_A β2、β2-肾上腺素受体）。

3. **基础记录 vs 子资源**（拿到 `targetId`/`ligandId` 后按需取）：

   | 想要 | 端点 |
   |---|---|
   | 基因符号 / UniProt / HGNC / ChEMBL Target | `/targets/{id}/databaseLinks` |
   | 靶点同义词 | `/targets/{id}/synonyms` |
   | 物种标注 | `/targets/{id}/databaseLinks`（每行带 `species`） |
   | 靶点的相互作用 / 亲和力 | `/targets/{id}/interactions` |
   | SMILES / InChI / InChIKey | `/ligands/{id}/structure` |
   | PubChem CID / ChEMBL / DrugBank / CAS / ChEBI | `/ligands/{id}/databaseLinks` |
   | 配体药理学摘要（长文本） | `/ligands/{id}/pharmacology` |

4. **过滤相互作用只走子资源端点**：`/targets/{id}/interactions` 或 `/ligands/{id}/interactions`。`/interactions?targetId=…` 的 `targetId`/`ligandId`/`targetType`/`ligandType` 参数**被静默忽略**——任何过滤都返回约 28 万行。

5. **取获批药物用服务端别名 `type=Approved`**：查 `/ligands?type=Approved` 返回全部 `approved=true` 配体（约 2197 个）。`approved=true` 查询参数**被静默忽略**。

6. **家族端点是 `/targets/families`**（不是 `/families`，后者 404），返回约 867 个 IUPHAR 家族，每个含 `targetIds`。

7. **亲和力字段是字符串**：`affinityParameter` ∈ {`pKi`,`pKd`,`pIC50`,`pEC50`,`pA2`,`pKB`}；`affinity` 可为数值（`"9.4"`）、区间（`"8.5-9.0"`）或带限定符（`"~7.5"`,`">8"`）。**务必 `pd.to_numeric(..., errors="coerce")` 转换**。

## 示例

**快速上手 — 解析靶点 + 读基础记录：**

```python
import requests
BASE = "https://www.guidetopharmacology.org/services"

# geneSymbol / accession 精确匹配（绝不用 name=）
t = requests.get(f"{BASE}/targets", params={"geneSymbol": "OPRM1"}, timeout=30).json()
print(len(t), t[0]["targetId"], t[0]["name"], t[0]["type"])  # 1 319 'μ receptor' GPCR
# UniProt 等价查法：params={"accession": "P35372"} 同样命中 319

# 基础记录只有 ID 与家族指针——没有基因符号/UniProt/SMILES
print(requests.get(f"{BASE}/targets/319", timeout=30).json().keys())
# dict_keys(['targetId','name','type','familyIds','subunitIds','complexIds'])
```

**靶点交叉引用 + 同义词（子资源）：**

```python
import requests, pandas as pd
BASE = "https://www.guidetopharmacology.org/services"

df = pd.DataFrame(requests.get(f"{BASE}/targets/319/databaseLinks", timeout=30).json())
print(df[["database", "accession", "species"]].head(8).to_string(index=False))
# ChEMBL Target / CHEMBL233, UniProtKB / P35372, HGNC / 8156 ...
syn = [s.get("name") for s in requests.get(f"{BASE}/targets/319/synonyms", timeout=30).json()]
```

**靶点相互作用与亲和力（注意字符串转数值）：**

```python
import requests, pandas as pd
BASE = "https://www.guidetopharmacology.org/services"

ints = requests.get(f"{BASE}/targets/319/interactions", timeout=60).json()  # μ receptor
df = pd.DataFrame([{
    "ligandId": i.get("ligandId"), "ligandName": i.get("ligandName"),
    "type": i.get("type"),                          # Agonist/Antagonist/Allosteric modulator/...
    "affinity": i.get("affinity"),                  # 字符串，可能是区间或带 ~/>
    "param": i.get("affinityParameter"),            # pKi/pIC50/pKd/pEC50/pA2/pKB
    "species": i.get("targetSpecies"), "primary": i.get("primaryTarget"),
} for i in ints])
df["pki"] = pd.to_numeric(df["affinity"], errors="coerce")   # 必须 coerce
print(df[df["param"] == "pKi"].sort_values("pki", ascending=False).head(8)
      [["ligandName", "type", "pki"]].to_string(index=False))
```

**配体记录 + 结构 + 交叉引用：**

```python
import requests
BASE = "https://www.guidetopharmacology.org/services"

l = requests.get(f"{BASE}/ligands/1627", timeout=30).json()           # 吗啡
s = requests.get(f"{BASE}/ligands/1627/structure", timeout=30).json() # smiles/inchi/inchiKey
print(l["name"], "approved=", l["approved"], "inn=", l.get("inn"))
print("SMILES:", s["smiles"], "| InChIKey:", s["inchiKey"])
for x in requests.get(f"{BASE}/ligands/1627/databaseLinks", timeout=30).json()[:10]:
    print(x["database"], x["accession"])     # PubChem CID / ChEMBL / DrugBank / CAS ...
```

**家族层级 + 获批药物（服务端别名）：**

```python
import requests, pandas as pd
BASE = "https://www.guidetopharmacology.org/services"

fams = pd.DataFrame(requests.get(f"{BASE}/targets/families", timeout=30).json())  # ~867
print(fams[fams["name"].str.contains("opioid", case=False, na=False)]
      [["familyId", "name"]].to_string(index=False))

# 获批药物：必须用 type=Approved 别名（approved=true 被忽略）
appr = pd.DataFrame(requests.get(f"{BASE}/ligands",
       params={"type": "Approved"}, timeout=60).json())
print("Approved:", len(appr))  # ~2197
```

**工作流 — 靶点配体画像（HGNC → 全部获批药物，pKi ≥ 阈值）：**

```python
import requests, pandas as pd
BASE = "https://www.guidetopharmacology.org/services"

def target_profile(gene, min_pki=8.0):
    t = requests.get(f"{BASE}/targets", params={"geneSymbol": gene}, timeout=30).json()
    if not t: return None
    tid = t[0]["targetId"]
    rows = []
    for i in requests.get(f"{BASE}/targets/{tid}/interactions", timeout=60).json():
        if i.get("affinityParameter") != "pKi":
            continue
        try: pki = float(i.get("affinity"))      # 跳过区间/限定符行
        except (TypeError, ValueError): continue
        if pki < min_pki: continue
        lig = requests.get(f"{BASE}/ligands/{i['ligandId']}", timeout=30).json()
        rows.append({"ligand": i["ligandName"], "type": i.get("type"), "pki": pki,
                     "approved": lig.get("approved"), "withdrawn": lig.get("withdrawn")})
    return pd.DataFrame(rows).sort_values("pki", ascending=False)

print(target_profile("OPRM1", 8.0).head(10).to_string(index=False))
```

**配方 — 经 GtoPdb 解析基因符号 → UniProt：**

```python
def gene_to_uniprot(symbol):
    t = requests.get(f"{BASE}/targets", params={"geneSymbol": symbol}, timeout=30).json()
    if not t: return None
    for x in requests.get(f"{BASE}/targets/{t[0]['targetId']}/databaseLinks", timeout=30).json():
        if x.get("database") == "UniProtKB" and x.get("species") == "Human":
            return x["accession"]
print(gene_to_uniprot("OPRM1"), gene_to_uniprot("ADRB2"))  # P35372 P07550
```

## 注意事项

- **解析靶点只用 `geneSymbol=`/`accession=`，绝不用 `name=`**：`name=` 跨字段模糊匹配，静默返回错误靶点。
- **基础记录无业务字段**：`target["hgncSymbol"]`/`target["uniprotId"]`、`ligand["smiles"]`/`pubchemCid` 全部 `KeyError`——去 `/databaseLinks`、`/structure`、`/synonyms` 取。
- **相互作用过滤只走 `/targets/{id}/interactions` 或 `/ligands/{id}/interactions`**：`/interactions?targetId=…` 静默忽略过滤，返回约 28 万行。
- **获批药物用 `type=Approved` 服务端别名**：`approved=true` 查询参数被忽略。
- **`affinity` 是字符串**：可为区间（`"8.5-9.0"`）或带限定符（`"~7.5"`,`">8"`），直接 `float()` 会 `ValueError`；统一 `pd.to_numeric(s, errors="coerce")`，需要时手工解析区间。
- **家族端点是 `/targets/families`**，`/families` 返回 404。
- **相互作用上没有 `ligandType` 字段**：想按获批过滤交互记录，要回查配体记录的 `approved` 标志，不能在交互端点上传 `ligandType="Approved"`（返回空）。
- **跨研究比较亲和力**：优先用归一化的 `affinityParameter`（p 值即 -log10 标度），同参数才可直接比。

## 互见

- related：`chembl-bioactivity-database` —— 同类靶点的大规模生物活性（240 万+ 化合物），覆盖更广、标注更浅
- related：`pubchem-compound-search` —— 以化合物为中心的化学信息学，可经 `/ligands/{id}/databaseLinks` 的 PubChem CID 交叉引用
- related：`uniprot-protein-database` —— 解析 GtoPdb 交叉引用出的 UniProt accession 的蛋白详情
- related：`opentargets-database` —— 将药物-靶点证据关联到疾病
- combines_with：`cheminformatics-toolkit` —— 取到 SMILES 后做指纹/描述符/分子操作
- combines_with：`autodock-vina-docking` —— 用 GtoPdb 配体与靶点做分子对接
- combines_with：`deepchem-drug-discovery` —— 将亲和力数据喂入药物发现建模

参考：GtoPdb 官网 https://www.guidetopharmacology.org/ ｜ Web Services API https://www.guidetopharmacology.org/webServices.jsp ｜ 命名与策展 https://www.guidetopharmacology.org/helpPage.jsp ｜ Harding SD et al. "The IUPHAR/BPS Guide to PHARMACOLOGY in 2024." Nucleic Acids Research 52(D1): D1438–D1449 (2024). https://doi.org/10.1093/nar/gkad944

---

采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0）。
