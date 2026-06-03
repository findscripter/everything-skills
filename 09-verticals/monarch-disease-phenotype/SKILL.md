---
name: monarch-disease-phenotype
title: Monarch 疾病表型知识图谱
description: 当需要把疾病/基因/表型在 Monarch 知识图谱里互查（MONDO 疾病→致病基因/HPO 表型、按患者 HPO 排候选基因、跨物种基因-表型）时使用；做：免认证调用 Monarch v3 REST API（/association/all、/entity、/search、/histopheno），产出基因-疾病-表型关联表与表型谱；不适用于药物-靶点证据评分（用 opentargets-database）、单变异临床致病性（用 clinvar-database）、群体 SNP-性状关联（GWAS Catalog）。触发词：Monarch、MONDO、HPO、表型、罕见病基因优先级、疾病基因关联、跨物种表型
domain: 领域/science
triggers: [Monarch, MONDO 疾病, HPO 表型, 罕见病基因优先级, 疾病-基因关联, 疾病表型谱, 表型相似度, 跨物种基因表型, MONDO 转基因, Monarch API, histopheno, 表型匹配候选基因]
tags: [science, genomics, bioinformatics, monarch, mondo, hpo, 罕见病, 知识图谱, 表型, 数据库查询, biolink]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [requests, pandas, matplotlib, Monarch v3 REST API]
requires: []
related: [opentargets-database, clinvar-database, gnomad-population-database, gget-genomic-databases]
combines_with: [gene-set-enrichment-analysis, clinvar-database]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

适用：
- 把疾病（MONDO ID）映射到全部关联致病基因及证据来源。
- 拉取疾病的 HPO 表型谱（HP 词条），用于构建表型相似度模型。
- 给定患者 HPO 症状清单，按表型重叠对候选基因排序（罕见病诊断候选生成）。
- 查询跨物种（小鼠 MGI、斑马鱼 ZFIN、果蝇）基因-表型关联做模式生物比对。
- 由 MONDO/HP/HGNC ID 反查实体元数据（基因符号、疾病名、表型标签）。
- 用 `/histopheno` 拿疾病表型按解剖系统的分布概览。

不该用（负边界）：
- 需药物-靶点证据评分 / 成药性数据 → 用 `opentargets-database`。
- 单变异临床致病性分类（含提交者审阅星级）→ 用 `clinvar-database`。
- 群体层面 SNP-性状关联 → 用 GWAS Catalog。

## 步骤 / 指令

Monarch Initiative 把 30+ 生物医学库（OMIM、Orphanet、ClinVar、MGI、ZFIN、Reactome）整合成统一知识图谱。**免认证、学术免费**，REST v3 端点 `https://api.monarchinitiative.org/v3/api`。标识用 CURIE：MONDO（疾病）、HP（表型）、HGNC/NCBIGene（基因）、MGI/ZFIN（模式生物基因）。

依赖：`pip install requests pandas matplotlib`。

核心调用模式（封装一个 `monarch_get`）：
```python
import requests
MONARCH_API = "https://api.monarchinitiative.org/v3/api"
def monarch_get(endpoint, params=None):
    r = requests.get(f"{MONARCH_API}{endpoint}", params=params, timeout=30)
    r.raise_for_status()
    return r.json()
```

四个关键端点：
1. **`/association/all`**：万能关联查询，靠 `category` + `subject`/`object` 选方向。`subject=疾病 → object=基因/表型`；`object=表型 → subject=疾病/基因`。
2. **`/entity/{id}`**：按 CURIE 取实体元数据（name、description、synonyms、xrefs）。
3. **`/search?q=...`**：自由文本→CURIE。**所有关联查询前先用它把疾病名解析成 MONDO ID**。
4. **`/histopheno/{mondo_id}`**：疾病表型按解剖系统的汇总计数。

关键 `category`（biolink 模型）：
- `biolink:CausalGeneToDiseaseAssociation` —— 致病基因（**做基因清单用这个**，证据更强）。
- `biolink:GeneToDiseaseAssociation` —— 任意基因-疾病链（更宽，含易感位点）。
- `biolink:DiseaseToPhenotypicFeatureAssociation` —— 疾病→HPO 表型。
- `biolink:GeneToPhenotypicFeatureAssociation` —— 基因→表型（含跨物种）。

通用参数：`limit` 默认 20、最大 500；`offset` 翻页；先用 `limit=1` 读 `result["total"]` 再按 `offset` 步进。

## 示例

疾病→致病基因 / 疾病→表型谱：
```python
import pandas as pd
def get_disease_genes(mondo_id, limit=200):
    res = monarch_get("/association/all", params={
        "subject": mondo_id,
        "category": "biolink:CausalGeneToDiseaseAssociation", "limit": limit})
    return pd.DataFrame([{
        "gene_id": i.get("object",{}).get("id"),
        "gene_symbol": i.get("object",{}).get("label"),
        "relation": i.get("predicate"),
    } for i in res.get("items", [])])

def get_disease_phenotypes(mondo_id, limit=200):
    res = monarch_get("/association/all", params={
        "subject": mondo_id,
        "category": "biolink:DiseaseToPhenotypicFeatureAssociation", "limit": limit})
    return pd.DataFrame([{
        "hp_id": i.get("object",{}).get("id"),
        "phenotype": i.get("object",{}).get("label"),
        "frequency": (i.get("frequency") or {}).get("label"),
    } for i in res.get("items", [])])

print(get_disease_genes("MONDO:0009861"))          # 囊性纤维化 → CFTR
print(get_disease_phenotypes("MONDO:0007374"))     # 马凡综合征 → 26 个 HPO 表型
```

名称解析（查关联前必做）+ 实体元数据：
```python
def resolve_disease(name, top_n=5):
    res = monarch_get("/search", params={
        "q": name, "category": "biolink:Disease", "limit": top_n})
    return [(h.get("id"), h.get("name")) for h in res.get("items", [])]

resolve_disease("Huntington disease")    # → [('MONDO:0007739','Huntington disease'), ...]
monarch_get("/entity/HP:0001250")        # 反查 HP:0001250 = Seizure 元数据
```

工作流——患者 HPO → 候选基因优先级排序（表型→疾病→致病基因，按重叠计数排序）：
```python
import time
patient_hp = ["HP:0001250", "HP:0000252", "HP:0001263"]  # 癫痫、小头畸形、发育迟缓
scores = {}
for hp in patient_hp:
    dz = monarch_get("/association/all", params={
        "object": hp, "category": "biolink:DiseaseToPhenotypicFeatureAssociation",
        "limit": 50})
    for d in [x.get("subject",{}).get("id") for x in dz.get("items", [])][:5]:
        g = monarch_get("/association/all", params={
            "subject": d, "category": "biolink:CausalGeneToDiseaseAssociation",
            "limit": 20})
        for item in g.get("items", []):
            sym = item.get("object",{}).get("label","")
            if sym: scores[sym] = scores.get(sym, 0) + 1
        time.sleep(0.3)
df = (pd.DataFrame(scores.items(), columns=["gene_symbol","overlap"])
        .sort_values("overlap", ascending=False))
df.to_csv("candidate_genes_phenotype_ranked.csv", index=False)
```

表型谱可视化（`/histopheno` 出系统级条形图）；HPO 种子导出（喂 Phenomizer/LIRICAL 等相似度工具）：
```python
hist = monarch_get("/histopheno/MONDO:0007374")   # 马凡综合征
for it in sorted(hist.get("items", []), key=lambda x: x.get("count",0), reverse=True)[:8]:
    print(f"{it.get('label'):<28} n={it.get('count')}")   # 结缔组织 n=12, 心血管 n=8 ...

hp_terms = [i.get("object",{}).get("id")
    for i in monarch_get("/association/all", params={"subject":"MONDO:0007374",
        "category":"biolink:DiseaseToPhenotypicFeatureAssociation","limit":500}).get("items",[])]
# json.dump({"disease":"MONDO:0007374","hpo_terms":hp_terms}, open("hp_profile.json","w"))
```

## 注意事项

- **先解析名称再查关联**：所有 `/association/all` 只吃 CURIE（如 `MONDO:0007374`），不吃自由文本；用 `/search` 先转 ID。
- **基因清单用 Causal**：`CausalGeneToDiseaseAssociation` 证据强；`GeneToDiseaseAssociation` 更宽但混入易感位点和模糊链接。
- **方向别搞反**：基因→疾病用 `subject=gene_id`；疾病→表型用 `subject=disease_id`。`total=0` 但实体存在，多半是 subject/object 写反了。
- **CURIE 格式**：用冒号 `MONDO:0007374`，不是 `MONDO_0007374`；写错触发 `/entity/{id}` 的 404。
- **基因 ID 命名空间不定**：可能返回 `HGNC:XXXX` 或 `NCBIGene:XXXX`；下游需 HGNC 时用 `/entity/{id}` 取 `xrefs` 拿替代 ID。
- **翻页**：默认 `limit=20`、最大 500；先读 `result["total"]`，再按 `offset` 步进 200 取全量。
- **礼貌限速**：无公开限速文档，批量循环加 `time.sleep(0.3)`，避免 >10 req/s 突发；超时设 `timeout=60` 并指数退避重试。
- **空 `items`**：多为 `category` 字符串写错；先用更宽的 `GeneToDiseaseAssociation` 兜底排查。
- **可复现性**：知识图谱定期更新，同一实体不同时间结果可能变；方法学里固定数据采集日期与 API 版本（v3）。

## 互见
- related：`clinvar-database` —— 单变异临床致病性分类（与本图谱的基因-疾病关联互补）。
- related：`opentargets-database` —— 药物-靶点证据/成药性评分，需药物维度时改用。
- related：`gnomad-population-database` —— 候选基因/变异的群体频率过滤。
- related：`uniprot-protein-database` —— 由基因取蛋白功能/结构注释。
- combines_with：`gene-set-enrichment-analysis` —— 对 Monarch 导出的基因清单做富集分析。

---
采编自 jaechang-hits/SciAgent-Skills（源 license CC-BY-4.0），按本仓库规范适配重写；本条目以 CC-BY-4.0 发布。
