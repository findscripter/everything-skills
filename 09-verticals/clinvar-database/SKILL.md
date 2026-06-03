---
name: clinvar-database
title: ClinVar 变异临床意义查询
description: 当需要查询某变异的临床意义/致病性/疾病关联或筛出基因致病变异时使用；通过 NCBI E-utilities（ESearch/ESummary/EFetch）按基因/rsID/疾病/审阅星级检索 ClinVar，产出 ClinSig、审阅状态、疾病与提交者数据；不适用于 GWAS 群体关联（用 gwas-database）、变异功能后果预测（用 Ensembl VEP）、体细胞肿瘤变异（用 cosmic-database）。触发词：ClinVar、致病性、临床意义、rsID 查询、致病变异
domain: 领域/science
triggers: [ClinVar, 变异临床意义, 致病性查询, pathogenic 变异, rsID 临床意义, 基因致病变异列表, 审阅星级, germline_classification, E-utilities 查 ClinVar, 变异疾病关联]
tags: [science, genomics, bioinformatics, clinvar, ncbi, e-utilities, 变异注释, 临床基因组学, 数据库查询]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [requests, xml.etree.ElementTree, pandas, NCBI E-utilities]
requires: []
related: [gnomad-population-database, opentargets-database, snpeff-variant-annotation, uniprot-protein-database]
combines_with: [gatk-variant-calling, snpeff-variant-annotation, gnomad-population-database]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

适用：
- 判断某变异（rsID / HGVS / 基因组位置）在 ClinVar 是否有临床意义（ClinSig）分类。
- 拉取某基因全部 致病/疑似致病（Pathogenic / Likely Pathogenic）变异。
- 找出提交实验室之间的**冲突解读**（Conflicting interpretations）。
- 提取变异关联的疾病/表型（OMIM/MIM、MeSH、HPO、trait_name）。
- 构建优先筛选「临床可操作」变异的过滤管线。

不该用（负边界）：
- GWAS 群体层面 SNP-性状关联 → 用 `gwas-database`。
- 变异功能后果预测（无需先有临床策展）→ 用 Ensembl VEP / `ensembl-database`。
- 体细胞肿瘤变异 → 用 `cosmic-database`（ClinVar 以胚系为主）。

## 步骤 / 指令

ClinVar 是 NCBI 公共变异解读归档，免认证、免费，经 E-utilities 访问。所有调用须带 `email`（NCBI 政策）。**限速：未认证 3 req/s，带 API key 10 req/s**（key 免费注册 https://www.ncbi.nlm.nih.gov/account/）。

依赖：`pip install requests pandas`（`xml.etree` 属标准库）。

1. **ESearch** 按结构化查询拿 ClinVar Variation ID 列表。查询字段：`基因[gene]`、`rsID[rs]`、`疾病[dis]`、`OMIM[MIM]`、`致病性[clinsig]`、`"审阅状态"[review status]`。
2. **ESummary** 按 ID 拿结构化摘要（JSON）。**注意 2024 schema 改版**：`clinical_significance` 已被 `germline_classification` 取代，`trait_set` 嵌套其下。
3. **EFetch** 拿完整 XML（提交者级断言）。**必须** `rettype="vcv"` + `is_variationid="true"`；旧 `rettype="clinvarset"` 自 2024 起返回空壳。
4. 大批量（>~1000 变异）改用 **FTP 全量** `variant_summary.txt.gz`，避免逐条 EFetch 触发限速。

审阅星级（review status，证据质量）：0=无断言标准；1=单提交者有标准；2=多提交者无冲突；3=专家组（ENIGMA/ClinGen）；4=实践指南。自动化管线建议筛 **≥2 星** 去噪。

## 示例

ESearch + ESummary 查某基因致病变异：

```python
import requests, time
EMAIL = "your@email.com"  # NCBI 政策必填
BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"

def esearch(query, retmax=200):
    r = requests.get(f"{BASE}/esearch.fcgi",
        params={"db": "clinvar", "term": query, "retmax": retmax,
                "retmode": "json", "email": EMAIL})
    r.raise_for_status()
    res = r.json()["esearchresult"]
    return res["idlist"], int(res["count"])

# 致病/疑似致病 BRCA2 变异
ids, total = esearch("BRCA2[gene] AND (pathogenic[clinsig] OR likely pathogenic[clinsig])")
# 按 rsID： esearch("rs80357906[rs]") ；按疾病： esearch("breast cancer[dis] AND pathogenic[clinsig]")

def esummary(ids):
    r = requests.post(f"{BASE}/esummary.fcgi",
        data={"db": "clinvar", "id": ",".join(ids),
              "retmode": "json", "email": EMAIL})
    r.raise_for_status()
    return r.json()["result"]

result = esummary(ids[:50])
for vid in result.get("uids", []):
    rec = result[vid]
    gc = rec.get("germline_classification", {})   # 2024 新字段
    print(vid, rec.get("title"),
          "| ClinSig:", gc.get("description"),
          "| Review:", gc.get("review_status"),
          "| 疾病:", "; ".join(t.get("trait_name","") for t in gc.get("trait_set", [])))
    time.sleep(0.15)
```

EFetch 拿提交者级断言（XML，vcv）：

```python
import xml.etree.ElementTree as ET
def efetch_xml(variation_ids):
    r = requests.post(f"{BASE}/efetch.fcgi",
        data={"db": "clinvar", "id": ",".join(variation_ids),
              "rettype": "vcv", "is_variationid": "true",
              "retmode": "xml", "email": EMAIL}, timeout=30)
    r.raise_for_status()
    return ET.fromstring(r.text)

root = efetch_xml(["17677"])  # BRCA1 c.5266dupC (rs80357906)
for va in root.iter("VariationArchive"):
    gc = va.find("./ClassifiedRecord/Classifications/GermlineClassification")
    desc = gc.find("Description") if gc is not None else None
    print(va.get("VariationName"), "->", desc.text if desc is not None else "n/a")
    for ca in va.iter("ClinicalAssertion"):   # 每个提交者一条
        acc, cls = ca.find("ClinVarAccession"), ca.find("Classification/GermlineClassification")
        if acc is not None and cls is not None:
            print("  ", acc.get("SubmitterName","?"), ":", cls.text)
```

FTP 全量过滤（pandas）：

```python
import pandas as pd
url = "https://ftp.ncbi.nlm.nih.gov/pub/clinvar/tab_delimited/variant_summary.txt.gz"
df = pd.read_csv(url, sep="\t", compression="gzip",
    usecols=["Name","GeneSymbol","ClinicalSignificance","ReviewStatus",
             "PhenotypeList","Assembly","RS# (dbSNP)"])
df = df[(df["Assembly"]=="GRCh38") &
        (df["ClinicalSignificance"].str.contains("Pathogenic", na=False))]
```

## 注意事项

- **email 必填**：所有 E-utility 调用都要带，否则可能被封；生产环境注册 API key 把限速 3→10 req/s。
- **2024 JSON 改版**：`KeyError: clinical_significance` → 改用 `rec["germline_classification"]`（另有 `clinical_impact_classification`、`oncogenicity_classification`，形状相同常为空）；`trait_set` 已移入其内。
- **XML 空壳**：返回 `<ClinVarResult-Set><set/></ClinVarResult-Set>` 说明用了废弃的 `rettype="clinvarset"`，换 `vcv` + `is_variationid="true"`，解析根节点 `<VariationArchive>`。
- **Variation ID ≠ rsID**：ClinVar 给每条解读记录分配稳定整数 Variation ID；一个 rsID 可对应多个 Variation ID（不同等位/解读分别提交）。
- **VUS 与冲突解读分开**：「Conflicting interpretations of pathogenicity」是独立 ClinSig 类别，勿与 VUS 合并筛选，二者临床含义不同。
- **rsID 查空**：rsID 未被 ClinVar 索引时 `idlist` 为空，改用 HGVS 或 基因+位置 查询。
- **限速/超时**：HTTP 429 → 加 `time.sleep(0.35)`；EFetch XML 解析错误多因超时，设 `timeout=30` 并重试一次。同一 rsID 多结果时按 `review_status` 分组，优先高星条目。

## 互见

- `gwas-database` — GWAS Catalog 群体层面 SNP-性状关联（与 ClinVar 临床断言互补）。
- `ensembl-database` — Ensembl VEP 预测变异功能后果，无需先有临床策展。
- `cosmic-database` — 体细胞肿瘤变异库（与 ClinVar 胚系侧重互补）。
- `pubmed-database` — 检索 ClinVar 提交中引用的支持文献。

---
采编自 jaechang-hits/SciAgent-Skills（原 license CC0-1.0），按本仓库规范适配重写；本条目以 CC-BY-4.0 发布。
