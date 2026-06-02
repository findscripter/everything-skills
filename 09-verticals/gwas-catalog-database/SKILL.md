---
name: gwas-catalog-database
title: GWAS Catalog 关联查询
description: 当需要从 NHGRI-EBI GWAS Catalog REST API 查已发表 GWAS 的 SNP-性状关联、按性状(EFO)/变异(rsID)/基因/区域/PMID 检索、做疾病遗传结构/多效性/曼哈顿图取数时使用；做 HAL+JSON 取数并产出关联表、显著位点清单或汇总统计 FTP 路径；不适用于变异功能注释(用 gget/Ensembl VEP)、人群频率(用 gnomAD)、致病性判定(用 ClinVar)、药靶验证(用 OpenTargets)；触发词：GWAS、GWAS Catalog、SNP 关联、rsID、EFO、性状关联、全基因组显著、5e-8、多效性、汇总统计、PRS、曼哈顿图
domain: 领域/science
triggers: [GWAS, GWAS Catalog, SNP 关联, rsID, EFO, 性状关联, 全基因组显著, 5e-8, 多效性, pleiotropy, 汇总统计, summary statistics, PRS, 曼哈顿图, Manhattan plot, PMID 检索]
tags: [science, bioinformatics, genomics, gwas, gwas-catalog, rest-api, snp, efo, association, variant]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, requests, matplotlib, numpy, REST, HAL+JSON]
requires: []
related: [clinvar-database, dbsnp-database, gnomad-population-database, opentargets-database]
combines_with: [ensembl-database, monarch-disease-phenotype, gene-set-enrichment-analysis]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

需要从 **NHGRI-EBI GWAS Catalog**（已发表全基因组关联研究的人工策展库）经其免费 REST API（`https://www.ebi.ac.uk/gwas/rest/api`，无需鉴权）取 SNP-性状关联证据时使用：

- 查某疾病/性状关联的遗传变异（如「哪些 SNP 与 2 型糖尿病相关？」）。
- 取某变异（rsID）的全基因组显著关联，或评估其**多效性**（一个 SNP 影响多少性状）。
- 描绘复杂性状的遗传结构（位点数、效应量 OR/beta）。
- 按疾病、基因或 PubMed ID 检索已发表 GWAS 研究。
- 交叉 EFO 性状本体与 GWAS 证据；从关联区域构建候选基因清单。
- 定位某研究的汇总统计（summary statistics）FTP 路径，供 meta 分析或 PRS 构建。

**不该用的边界：**
- 变异功能注释（后果预测、调控影响）→ 用 Ensembl VEP（经 `gget-genomic-databases`）。
- 人群等位基因频率 → 用 `gnomad-population-database`；本库不给频率。
- 临床致病性判定 → 用 `clinvar-database`；GWAS Catalog 只给关联统计。
- 从 GWAS hits 做药靶验证 → 用 `opentargets-database`。

## 步骤

1. **统一辅助函数**：用 `gwas_get()` 发 GET 并 `raise_for_status()`，每次后 `time.sleep(0.2)` 礼貌延时（无官方限速）。
2. **认清返回结构（HAL+JSON）**：列表/检索结果数据在 `_embedded`，分页元数据在 `page`（`totalElements`/`totalPages`），导航在 `_links`。**按 ID 直查返回单对象，没有 `_embedded`**。
3. **选入口**：study（GCST）/ association / SNP（rsID）/ efoTrait / 基因 / 区域。
4. **精确性状查询用规范名**：优先 `associations/search/findByEfoTrait?efoTrait=<规范性状名>`；许多旧 EFO ID 已重映射到 MONDO（如 `EFO_0000249` → `MONDO_0004975`），先 `efoTraits/search/findByEfoTrait` 解析当前 `shortForm` 再用。
5. **关联不内嵌性状**：association 记录经 `_links.efoTraits.href` 暴露性状，需跟链解析（按 href 缓存避免重复请求）。
6. **过滤显著性**：标准全基因组显著阈值 **p ≤ 5e-8**；务必按 `pvalue` 过滤，库内含各显著度的关联。
7. **分页**：默认每页 20，`size` 最大 500；按 `page`（0 起）循环到 `totalPages-1`。

## 指令

### 统一辅助函数（所有查询复用）

```python
import requests, time
BASE = "https://www.ebi.ac.uk/gwas/rest/api"

def gwas_get(endpoint, params=None):
    r = requests.get(f"{BASE}/{endpoint}", params=params or {}, timeout=30)
    r.raise_for_status()
    time.sleep(0.2)
    return r.json()
```

### 端点速查（含易踩坑修正）

| 目的 | 端点 | 关键参数 / 注意 |
|---|---|---|
| 按性状检索研究 | `studies/search/findByDiseaseTrait` | `diseaseTrait`（关键词）；研究无顶层 title，标题在 `publicationInfo.title`，性状在 `diseaseTrait.trait` |
| 按 PMID 检索研究 | `studies/search/findByPublicationIdPubmedId` | `pubmedId`；旧 `findByPubmedId` 在 /studies/ 上 404 |
| 按性状取关联 | `associations/search/findByEfoTrait` | `efoTrait`=规范性状名（最稳） |
| 按变异取关联 | `singleNucleotidePolymorphisms/{rs}/associations` | 性状走 `_links.efoTraits.href` |
| 变异详情 | `singleNucleotidePolymorphisms/{rs}` | 位置在 `locations[]`，注意 `merged` 合并 |
| 区域查变异 | `singleNucleotidePolymorphisms/search/findByChromBpLocationRange` | `chrom,bpStart,bpEnd`；`findByCytogeneticBand` 已移除 |
| 按基因查变异 | `singleNucleotidePolymorphisms/search/findByGene` | `geneName` |
| 性状查 EFO | `efoTraits/search/findByEfoTrait` | `trait`=规范标签；`findByDescription` 已移除 |
| 有汇总统计的研究 | `studies/search/findByFullPvalueSet` | `fullPvalueSet=True` |

> 汇总统计**不经 REST 暴露**（`studies/{acc}/summaryStatistics` 返回 404），改走 FTP：`http://ftp.ebi.ac.uk/pub/databases/gwas/summary_statistics/{acc前缀}001-{acc前缀}999/{acc}/`。

## 示例

**按性状取关联并提取 rsID/p 值**：

```python
data = gwas_get("associations/search/findByEfoTrait",
                {"efoTrait": "type 2 diabetes mellitus", "size": 50})
for a in data["_embedded"]["associations"][:5]:
    loci = a.get("loci") or [{}]
    snps = [r.get("snps", [{}])[0].get("rsId", "N/A")
            for r in (loci[0].get("strongestRiskAlleles") or [])]
    print(snps, a.get("pvalue"), a.get("orPerCopyNum"))
```

**疾病遗传结构（解析 shortForm → 全量关联 → 过滤 5e-8）**：

```python
t = gwas_get("efoTraits/search/findByEfoTrait", {"trait": "schizophrenia"})
efo = t["_embedded"]["efoTraits"][0]["shortForm"]   # 可能已是 MONDO_xxx
allA, page = [], 0
while True:
    d = gwas_get(f"efoTraits/{efo}/associations", {"size": 500, "page": page})
    allA += d["_embedded"]["associations"]
    if page >= d["page"]["totalPages"] - 1: break
    page += 1
sig = [a for a in allA if a.get("pvalue") and a["pvalue"] < 5e-8]
print(f"全部 {len(allA)}，全基因组显著 {len(sig)}")
```

**多效性（变异 → 跟 efoTraits 链，按 href 缓存）**：

```python
assocs = gwas_get("singleNucleotidePolymorphisms/rs7903146/associations",
                  {"size": 500})["_embedded"]["associations"]
cache, traits = {}, set()
for a in assocs:
    href = (a.get("_links") or {}).get("efoTraits", {}).get("href")
    if not href: continue
    if href not in cache:
        r = requests.get(href, timeout=15)
        cache[href] = r.json().get("_embedded", {}).get("efoTraits", []) if r.ok else []
    for x in cache[href]:
        traits.add(x.get("shortForm"))
    time.sleep(0.1)
print(f"rs7903146 关联 {len(traits)} 个不同性状")
```

更多配方见源仓：曼哈顿图（`-log10(p)` vs 染色体偏移，画 5e-8/1e-5 阈值线，FTP 下载 `.tsv.gz`）、效应量森林图、交叉 PGS Catalog（同 EFO 查多基因评分 `pgscatalog.org/rest/score/search?trait_id=`）。

## 注意事项

- **`KeyError: '_embedded'`**：按 ID 直查（study/SNP/trait）返回单对象，`_embedded` 只在检索/列表结果里出现。
- **EFO/MONDO 重映射**：直接 `efoTraits/EFO_0000249` 可能 404；务必先经 `findByEfoTrait` 解析当前 `shortForm`。
- **关联不内嵌 `efoTraits`**：经 `_links.efoTraits.href` 跟链解析；批量时按 href 缓存。
- **效应量缺失**：并非所有关联都报 OR/beta，`orPerCopyNum` 与 `betaNum` 都要查，有些研究只报 p 值。
- **务必看祖先**：效应量与等位频率随人群而异，看 `initialSampleSize`/`replicationSampleSize` 了解祖先构成。
- **别只信报告基因**：`authorReportedGenes` 未必是因果基因，需交叉功能注释与 eQTL。
- **分页**：默认每页 20，漏数据多因没设 `size`；先看 `page.totalElements` 知总量再循环。
- **数据季度更新**：看研究的 `lastUpdateDate`；EBI 临时不可用时退避重试，状态见 `ebi.ac.uk/gwas/status`。

## 互见

- related：`scientific-database-lookup` —— 需跨多个公开科研库泛化取数时走它。
- related：`gget-genomic-databases` —— GWAS hit 的变异功能后果用其封装的 Ensembl VEP/BLAST 注释。
- related：`uniprot-protein-database` —— 把关联基因映射到蛋白做下游解读。
- combines_with：`gnomad-population-database` —— GWAS 给关联、gnomAD 给同一变异的人群频率，二者互补判罕见性。
- combines_with：`clinvar-database` —— 关联区域的候选变异交叉临床致病性证据。
- combines_with：`opentargets-database` —— 从 GWAS hits 做药靶验证与证据打分。
- combines_with：`gene-set-enrichment-analysis` —— 用显著位点构建的候选基因集做富集分析。

---
本条采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0）。
