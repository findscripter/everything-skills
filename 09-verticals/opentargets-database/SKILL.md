---
name: opentargets-database
title: Open Targets 靶点-疾病关联查询
description: 当需要用 Open Targets GraphQL API 查询靶点-疾病关联评分、证据、已知药物、可成药性或安全性时使用；做按基因/EFO 调 GraphQL 取关联打分、药物-靶点-疾病三角、证据明细并落表；不适用于生物活性 IC50/Ki 取数（用 chembl）、临床试验细节（用 clinicaltrials）；触发词：Open Targets、靶点疾病关联、association score、EFO、靶点优先级、tractability、known drugs、GraphQL
domain: 领域/science
triggers: [Open Targets, 靶点疾病关联, association score, EFO ID, 靶点优先级, tractability, 可成药性, known drugs, drug-target-disease, GraphQL API]
tags: [science, bioinformatics, drug-discovery, target-disease, graphql, open-targets, genomics]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, requests, pandas, GraphQL, curl]
requires: []
related: [uniprot-protein-database, clinvar-database, chembl-bioactivity-database, gnomad-population-database]
combines_with: [chembl-bioactivity-database, uniprot-protein-database, gene-set-enrichment-analysis]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

需要从 **Open Targets Platform** 的公开 GraphQL API（免鉴权）系统化获取靶点-疾病关联与药物发现证据时使用。典型任务：

- 给定疾病，按总关联分对所有靶点排序，做**靶点优先级**并导出证据分解。
- 给定基因，找其全部关联疾病及置信分。
- 取靶点的**已知药物**（获批/在研）、作用机制（MoA）与临床阶段。
- 评估靶点**可成药性 / tractability**（小分子、抗体、PROTAC 倾向）。
- 拉某靶点-疾病对的**证据明细**（GWAS、ClinVar、文献等）。
- 查靶点的**安全性 / 不良事件**（safetyLiabilities）。

数据覆盖 60000+ 靶点、20000+ 疾病/表型，关联分由 20+ 数据源（遗传、体细胞突变、已知药物、通路、文献、表达、动物模型等）经**调和求和（harmonic sum）**聚合为 0–1 分。

**不该用的边界：**
- 化合物生物活性 IC50/Ki/Kd 等定量数据 → 用 `chembl-database-bioactivity`。
- 临床试验细节（入组、研究设计、地点） → 用 `clinicaltrials-database-search`。
- 不负责对结果做深度统计建模，只取回原始数据并标注来源。
- 仅泛查多个科研库、不确定该查哪个库时 → 先用 `scientific-database-lookup` 选库。

## 步骤

1. **解析标识符**：疾病用 EFO ID（如 `EFO_0000305`=乳腺癌），靶点用 Ensembl 基因 ID（如 `ENSG00000141510`=TP53）。名称不可直接用——先调 `search` 查规范 ID。
2. **选查询**：按意图挑下方「指令」中的查询（靶点查疾病 / 疾病查靶点 / 已知药物 / 证据 / 安全性 / 可成药性）。
3. **发请求**：统一 POST 到 `https://api.platform.opentargets.org/api/v4/graphql`，body 为 `{"query": gql, "variables": {...}}`。Python 用 `requests`，命令行用 `curl -X POST`（GraphQL 为 POST，GET 不可用）。
4. **分页**：`page: {index, size}`，默认 size=10；大结果集翻页，单次别超 ~500 行。
5. **返回**：给出每个查询的原始结果 + 关键字段表（关联分、子分、药物、证据来源），并落 CSV。

## 指令

### 端点与通用函数

```python
import requests
OT_URL = "https://api.platform.opentargets.org/api/v4/graphql"

def ot_query(gql, variables=None):
    r = requests.post(OT_URL, json={"query": gql, "variables": variables or {}})
    r.raise_for_status()
    return r.json()["data"]
```

### 查询速查

| 意图 | 入口字段 | 关键返回 |
|---|---|---|
| 名称/符号 → ID | `search(queryString, entityNames:["target"|"disease"])` | `hits{id name}` |
| 靶点 → 关联疾病 | `target(ensemblId).associatedDiseases(page, orderByScore:"score")` | `score`、`datatypeScores{id score}` |
| 疾病 → 关联靶点 | `disease(efoId).associatedTargets(page, orderByScore:"score")` | `target{approvedSymbol}`、`score` |
| 靶点 → 已知药物 | `target(ensemblId).drugAndClinicalCandidates` | `drug{name drugType mechanismsOfAction}`、`maxClinicalStage` |
| 靶点-疾病 → 证据 | `disease(efoId).evidences(ensemblIds, datasourceIds, enableIndirect)` | `datasourceId score variantRsId` |
| 靶点 → 安全性 | `target(ensemblId).safetyLiabilities` | `event effects datasource` |
| 靶点 → 可成药性 | `target(ensemblId).tractability` | `label modality value` |

### 关键参数

| 参数 | 模块 | 默认 | 范围/选项 | 作用 |
|---|---|---|---|---|
| `page.size` | 关联 | 10 | 1–10000 | 每页行数 |
| `page.index` | 关联 | 0 | 0–N | 翻页索引 |
| `orderByScore` | 关联 | `"score"` | `"score"`/子分 ID | 排序依据 |
| `datasourceIds` | 证据 | 全部 | 数据源 ID 列表 | 按源过滤证据 |
| `enableIndirect` | 证据 | false | true/false | 含疾病子型（EFO 子节点）证据 |

### 子分（datatypeScores）常用 ID

`genetic_association`、`somatic_mutation`、`known_drug`、`affected_pathway`、`literature`、`rna_expression`、`animal_model`。遗传验证可筛 `genetic_association > 0.1`；药物重定位优先 `known_drug`。

## 示例

### 疾病名 → EFO ID（关联查询前必做）

```python
q = 'query S($q:String!){search(queryString:$q,entityNames:["disease"]){hits{id name score}}}'
for h in ot_query(q, {"q": "breast cancer"})["search"]["hits"][:5]:
    print(h["id"], h["name"])   # EFO_0000305: breast carcinoma ...
```

### 工作流：疾病的靶点优先级（落 CSV）

```python
import pandas as pd
q = """
query($efoId:String!,$size:Int!){
  disease(efoId:$efoId){ name
    associatedTargets(page:{index:0,size:$size},orderByScore:"score"){
      count rows{ target{id approvedSymbol biotype} score datatypeScores{id score} } } } }"""
data = ot_query(q, {"efoId": "EFO_0003060", "size": 50})  # NSCLC
rows = []
for r in data["disease"]["associatedTargets"]["rows"]:
    t = r["target"]; sc = {d["id"]: round(d["score"],3) for d in r.get("datatypeScores",[])}
    rows.append({"target": t["approvedSymbol"], "ensembl_id": t["id"],
                 "overall_score": round(r["score"],4), **sc})
pd.DataFrame(rows).to_csv("target_prioritization.csv", index=False)
```

### 靶点的已知药物（药物-靶点-疾病三角）

```python
q = """
query($ensgId:String!){
  target(ensemblId:$ensgId){ approvedSymbol
    drugAndClinicalCandidates{ count rows{
      maxClinicalStage
      drug{id name drugType maximumClinicalStage mechanismsOfAction{rows{mechanismOfAction}}}
      diseases{disease{id name}} } } } }"""
data = ot_query(q, {"ensgId": "ENSG00000146648"})  # EGFR
for r in data["target"]["drugAndClinicalCandidates"]["rows"]:
    d = r["drug"]
    moa = ((d.get("mechanismsOfAction") or {}).get("rows") or [{}])[0].get("mechanismOfAction")
    approved = d["maximumClinicalStage"] == "PHASE_4"   # 获批判据
    print(d["name"], d["drugType"], "approved" if approved else r["maxClinicalStage"], moa)
```

### 证据明细（按数据源过滤）

```python
q = """
query($ensgId:String!,$efoId:String!){
  disease(efoId:$efoId){
    evidences(ensemblIds:[$ensgId], enableIndirect:true, size:10,
              datasourceIds:["gwas_catalog","clinvar","chembl"]){
      count rows{ datasourceId score variantRsId studyId publicationYear clinicalSignificances } } } }"""
ev = ot_query(q, {"ensgId":"ENSG00000012048","efoId":"EFO_0000305"})["disease"]["evidences"]
```

### curl 等价（GraphQL 为 POST）

```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"query":"{target(ensemblId:\"ENSG00000141510\"){approvedSymbol tractability{label modality value}}}"}' \
  https://api.platform.opentargets.org/api/v4/graphql
```

## 注意事项

- **疾病必须用 EFO ID**：名称易歧义，关联查询前先 `search` 取规范 EFO ID，否则 `rows` 为空。
- **靶点用 Ensembl ID**：基因符号 ≠ Ensembl ID，符号先经 `search` 解析；否则 target not found。
- **获批判据**：药物是否获批看 `drug.maximumClinicalStage == "PHASE_4"`，不是看 `maxClinicalStage`（后者是该靶点-适应症对的最高阶段）。
- **2025 schema 变化**：`safetyLiabilities` 的 `datasource` 是标量文献引用字符串，不再是旧版 `datasources[{name,pmid}]` 对象列表。
- **分页**：默认仅 10 行；要全集用大 size 但注意 payload，建议封顶 500 行并多次翻页。`enableIndirect:true` 纳入 EFO 子型证据。
- **缓存**：Open Targets 数据按季度更新；分析期内缓存响应避免重复请求。
- **报错排查**：HTTP 400 多为字段名/查询不合 schema，对照 https://api.platform.opentargets.org/api/v4/graphql 的 playground；`rows` 空查 EFO/Ensembl ID 是否正确；`drugAndClinicalCandidates` 空表示 ChEMBL 无药物证据，改查临床前活性请用 `chembl-database-bioactivity`；并非所有靶点都有 tractability（字段可能为空）。

## 互见

- requires：`scientific-database-lookup` —— 选库、标识符（EFO/Ensembl）解析与 GraphQL/POST 取数的通用底座。
- related：`gene-set-enrichment-analysis`、`protein-language-models`、`molecular-dynamics-simulation`
- combines_with：`scientific-database-lookup` —— 先解析疾病→EFO、基因→Ensembl，再调本技能的 GraphQL 取关联与药物证据。

---
本条采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0）。
