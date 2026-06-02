---
name: scientific-database-lookup
title: 科研数据库 API 查询
description: 当需要从公开科研/生物医学/材料/经济等数据库通过 REST API 查询化合物、基因、蛋白、通路、变异、临床试验、专利或经济指标时使用；做选库、查 API 并返回原始 JSON 与所用数据库清单；不适用于私有/付费授权库或本地数据集分析；触发词：科研数据库、database lookup、PubChem、UniProt、ChEMBL、基因蛋白查询、REST API 查询、clinical trials
domain: 领域/science
triggers: [科研数据库, database lookup, PubChem, UniProt, ChEMBL, 基因蛋白查询, REST API 查询, clinical trials, 化合物基因查询, 经济指标查询]
tags: [science, rest-api, bioinformatics, database, chemistry, genomics, clinical, economics]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [curl, WebFetch, REST API]
requires: []
related: [cheminformatics-toolkit, materials-science-toolkit, genomic-file-toolkit, gene-set-enrichment-analysis]
combines_with: [cheminformatics-toolkit, gene-set-enrichment-analysis, alpha-vantage-market-data]
license: MIT
source: K-Dense-AI/scientific-agent-skills
source_license: MIT
---
## 何时使用

需要从约 78 个**公开科研数据库**经其 REST API 取数时使用，覆盖：

- 物理/天文（NASA、NIST、SDSS、SIMBAD、NASA Exoplanet）
- 地球/环境（USGS、NOAA、EPA、OpenWeatherMap）
- 化学/药物（PubChem、ChEMBL、FDA/OpenFDA、KEGG、ChEBI、ZINC、BindingDB、DailyMed）
- 材料（Materials Project、COD）
- 生物/基因组（Reactome、UniProt、STRING、Ensembl、NCBI Gene/Protein/Taxonomy、GEO、GTEx、PDB、AlphaFold、InterPro、BioGRID、QuickGO/Gene Ontology、dbSNP、gnomAD、ENCODE、JASPAR、HPA、HCA、PRIDE、ENA、SRA 等）
- 疾病/临床（Open Targets、cBioPortal、GDC/TCGA、ClinVar、OMIM、DisGeNET、GWAS Catalog、Monarch、HPO、ClinicalTrials.gov）
- 专利/监管（USPTO、SEC EDGAR）
- 经济/金融（FRED、BEA、BLS、World Bank、Federal Reserve、ECB、US Treasury、Alpha Vantage、Data Commons）
- 人口/社科（US Census、Eurostat、WHO GHO）

任务本质：**判断该查哪些库 → 调 API → 返回原始 JSON + 所用数据库与端点清单**。

**不该用的边界：**
- DrugBank（付费授权）、COSMIC（学术注册 + JWT）、BRENDA（注册 + SOAP 非 REST）等付费/受限库——改用免费替代（见「注意事项」）。
- 不是公开 API 取数的需求，例如本地 CSV/表格清洗（用 csv-data-cleaner）、私有数据库 SQL（用 sql-query-builder）、事实核查/文献溯源（用 fact-checking）。
- 不负责对结果做深度统计建模，只负责取回原始数据并标注来源。

## 步骤

1. **理解意图**：用户要的是化合物？基因？通路？专利？表达数据？经济指标？由此决定查哪个库。
2. **选库**：用下方「指令」中的选库对照；拿不准时**多库并查**，宁可撒大网也别漏。跨域问题（如「关于阿司匹林的一切」「BRCA1 的一切」）并行查所有相关库。
3. **校正标识符**：库不认标识符是失败首因，先按标识符表换算（见「指令」）。
4. **发请求**：Claude Code 用 `WebFetch`（仅 GET）；POST-only 库与需自定义 header 的库用 `curl`。
5. **返回结果**：始终给出①每个库的**原始 JSON**；②**已查数据库 + 具体端点**清单；③无结果的库要**显式说明**，不可省略。

## 指令

### 选库速查（节选高频项）

| 用户问… | 首选库 | 备选 |
|---|---|---|
| 化合物、分子性质、SMILES | PubChem | ChEMBL |
| 生物活性 IC50/Ki/Kd、药物-靶点 | ChEMBL、BindingDB | PubChem、Open Targets |
| 药品标签/不良事件/召回 | FDA(OpenFDA) | DailyMed |
| 可购买化合物、虚拟筛选 | ZINC | PubChem |
| 材料（化学式/能带/晶体结构） | Materials Project | COD |
| 通路 | Reactome、KEGG | — |
| 蛋白序列/功能/注释 | UniProt | Ensembl |
| 蛋白互作 | STRING | BioGRID |
| 基因信息/基因组定位 | NCBI Gene | Ensembl |
| 跨组织表达 | GTEx | Human Protein Atlas |
| 3D 结构（实验/预测） | PDB / AlphaFold | EMDB |
| SNP/变异、人群频率 | dbSNP / gnomAD | ClinVar |
| 靶点-疾病关联 | Open Targets | ChEMBL |
| 癌症体细胞突变/基因组 | cBioPortal、GDC(TCGA) | Open Targets |
| 临床试验 | ClinicalTrials.gov | FDA |
| 专利（关键词/发明人/受让人） | USPTO(PatentsView) | — |
| 美国经济时序（GDP/CPI/利率） | FRED | BEA |
| 国际发展指标 | World Bank | FRED |

**物种很关键**：多数生物库覆盖多物种，别默认人类。Ensembl 用 URL 路径 `{species}`（如 `homo_sapiens`）；STRING/BioGRID/QuickGO 用 NCBI taxon ID（人 `9606`、鼠 `10090`）；UniProt 用 `organism_id:9606`；KEGG 用物种码（`hsa`/`mmu`）。GTEx 与 HPA 仅限人类。

### 常见标识符格式

| 标识符 | 格式 | 示例 | 用于 |
|---|---|---|---|
| UniProt accession | `P#####`/`Q#####` | `P04637`(TP53) | UniProt、STRING、AlphaFold、Reactome |
| Ensembl 基因 ID | `ENSG###########` | `ENSG00000141510` | Ensembl、Open Targets、GTEx |
| NCBI Gene ID | 整数 | `7157`(TP53) | NCBI Gene、GEO、DisGeNET、HPO |
| PubChem CID | 整数 | `2244`(阿司匹林) | PubChem |
| ChEMBL ID | `CHEMBL####` | `CHEMBL25` | ChEMBL |
| Reactome stable ID | `R-HSA-######` | `R-HSA-109581` | Reactome |
| dbSNP rsID | `rs########` | `rs334` | dbSNP、gnomAD、GWAS Catalog |
| GO term | `GO:#######` | `GO:0008150` | QuickGO |
| HP term | `HP:#######` | `HP:0001250` | HPO（冒号 URL 编码为 `%3A`） |
| GENCODE ID | `ENSG###.##`（带版本号） | `ENSG00000139618.17` | GTEx（必须带版本后缀） |

**标识符解析工作流**：
- 基因：符号 → NCBI Gene（esearch）取 Gene ID → 经 Ensembl `/xrefs/symbol/homo_sapiens/{symbol}` 换 Ensembl ID，或 UniProt 搜 `gene_exact:{symbol} AND organism_id:9606`。
- 化合物：名称 → PubChem `/compound/name/{name}/cids/JSON` 取 CID →（UniChem/ChEMBL）换 ChEMBL ID；名称失败改用 SMILES/InChIKey/CAS。
- 变异：rsID 在 dbSNP/ClinVar/GWAS/gnomAD 直接可用；坐标用 Ensembl VEP 取注释与 rsID。
- 疾病：名称 → Open Targets / Monarch 搜，取 EFO 或 MONDO ID 供下游。

### POST-only 库（WebFetch 不可用，必须 curl）

| 库 | 原因 | 示例 |
|---|---|---|
| Open Targets | GraphQL | `curl -X POST -H "Content-Type: application/json" -d '{"query":"..."}' https://api.platform.opentargets.org/api/v4/graphql` |
| gnomAD | GraphQL | `curl -X POST -H "Content-Type: application/json" -d '{"query":"..."}' https://gnomad.broadinstitute.org/api` |
| RummaGEO | POST 富集 | `curl -X POST -H "Content-Type: application/json" -d '{"genes":["..."]}' https://rummageo.com/api/enrich` |
| GDC/TCGA | 复杂过滤 | `curl -X POST -H "Content-Type: application/json" -d '{"filters":...}' https://api.gdc.cancer.gov/ssms` |
| SEC EDGAR | 需 User-Agent | `curl -H "User-Agent: YourApp you@email.com" https://efts.sec.gov/LATEST/search-index?q=...` |

### API Key 加载（三级回退）

1. **先查环境变量**（如 `echo $FRED_API_KEY`），已设且非空就用。
2. **回退 `.env`**：读当前工作目录 `.env`，格式 `FRED_API_KEY=your_key`。
3. **都没有则无 key 继续**：多数 API 仍可用（速率更低），并告知用户缺哪个 key、去哪申请。

需 key 的免费库（env 变量）：FRED `FRED_API_KEY`、BEA `BEA_API_KEY`、BLS `BLS_API_KEY`、NCBI `NCBI_API_KEY`、OpenFDA `OPENFDA_API_KEY`、USPTO `PATENTSVIEW_API_KEY`、Materials Project `MP_API_KEY`、NASA `NASA_API_KEY`（有 `DEMO_KEY`）、NOAA `NOAA_API_KEY`、OMIM `OMIM_API_KEY`、BioGRID `BIOGRID_API_KEY`、Alpha Vantage `ALPHAVANTAGE_API_KEY`、US Census `CENSUS_API_KEY`、DisGeNET `DISGENET_API_KEY` 等，均免费注册。

## 示例

请求「关于阿司匹林我们知道什么」→ 跨域并行查 PubChem + ChEMBL + Reactome：

```bash
# PubChem 名称取 CID 与基本性质（GET）
curl -s -H "Accept: application/json" \
  "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/aspirin/property/MolecularFormula,MolecularWeight,CanonicalSMILES/JSON"
# Reactome 搜索（GET）
curl -s "https://reactome.org/ContentService/search/query?query=aspirin"
```

输出结构：

```
## 已查数据库
- **PubChem** — /compound/name/aspirin/property/...
- **Reactome** — /search/query?query=aspirin

## 结果
### PubChem
[原始 JSON]
### Reactome
[原始 JSON]
```

结果很大时给出最相关部分并说明还有更多；但默认展示完整原始 JSON（用户要的就是它）。

## 注意事项

- **URL 编码**：失败高发于特殊字符——SMILES（`/ # = @`）、含括号的化合物名、含冒号的本体词（`HP:0001250`→`HP%3A0001250`）。curl 用 `--data-urlencode` 更稳。
- **并行 vs 串行**：查**不同库**可并行（限速宽松）；对限速 API 须串行——NCBI 无 key 3 req/s、有 key 10；Ensembl 15 req/s；BLS v1 无 key 25 次/天；SEC EDGAR 10 req/s；NOAA 5 req/s。遇 429/503 略等后重试一次。
- **分页**：别只读首页。Offset/Limit（ChEMBL、FRED、NCBI、ENA、GDC、FDA）；游标 `nextPageToken`/`cursor`（ClinicalTrials.gov、UniProt）；页码 `page`/`per_page`（World Bank、cBioPortal、ZINC）。单点查询首页通常够；「全部试验/全部变异」类需翻页。
- **错误恢复**：①查标识符格式；②换备用标识符；③换库（选库表「备选」列）；④如实报告失败库、错误与替代方案。
- **付费/受限库替代**：DrugBank→ChEMBL+PubChem+OpenFDA；COSMIC→Open Targets；BRENDA→KEGG。用了替代要告知用户原因与替代项。
- 始终返回原始 JSON，不要编造或省略未命中的库。

## 互见

- fact-checking：取回数据后若需对结论做事实核查/多源交叉验证。
- csv-data-cleaner：把抓取的 JSON 落地为表格并清洗时。
- sql-query-builder：面向私有/本地关系库（非公开 REST API）取数时。
- rag-pipeline-builder：把数据库结果纳入检索增强管线时。

---
本条采编自 K-Dense-AI/scientific-agent-skills（MIT）。
