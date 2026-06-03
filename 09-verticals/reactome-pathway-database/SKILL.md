---
name: reactome-pathway-database
title: Reactome 通路数据库查询
description: 当需查 Reactome 生物通路/反应/实体、按关键词或稳定 ID 检索、跑基因列表通路富集（ORA）、取通路层级或跨库 ID 映射时使用；requests 直连 Content/Analysis 两套免鉴权 REST 接口产出通路 JSON、富集结果表与 token。不适用于 KEGG 代谢通路（用 kegg-database）、PPI 网络或纯富集统计选型。触发词：Reactome、通路富集、ORA、R-HSA、Analysis token、通路层级
domain: 领域/science
triggers: [Reactome, 通路富集, pathway enrichment, ORA, 过表征, R-HSA, 稳定 ID, Analysis token, 通路层级, Content Service, Analysis Service, reactome2py, 通路查询, 基因列表富集]
tags: [science, 生物信息学, 通路分析, reactome, rest-api, 富集分析, ora, 通路层级, id 映射]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Bash, requests]
requires: []
related: [kegg-database, gene-set-enrichment-analysis, quickgo-go-database, string-ppi-database]
combines_with: [gene-set-enrichment-analysis, gget-genomic-databases]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

适用：

- 按稳定 ID 取通路/反应/实体详情（如 `R-HSA-69620` 细胞周期），或取通路里的参与分子与参考实体（UniProt/ChEBI 等）。
- 按关键词跨 Reactome 检索通路/蛋白/复合物，带物种与类型分面过滤。
- 拿一组基因/蛋白跑通路**过表征富集（ORA）**，得带 FDR 的富集通路表与可复用 token。
- 遍历通路层级（顶层通路 → 子通路 → 反应）与祖先链。
- 跨库映射标识符（UniProt/Ensembl/NCBI Gene/ChEBI/miRBase/KEGG…）或取物种专属/直系同源通路。
- 凭 token 复取/再过滤既往富集结果，或与协作者共享同一结果集。

不该用（负边界）：

- **KEGG 代谢通路与 KEGG↔外部库 ID 转换** —— 用 `kegg-database`。
- **蛋白-蛋白互作网络** —— 本库暂无 STRING 条目，需另寻 PPI 工具。
- **富集方法选型/GSEA/去冗余/可视化等完整富集工作流** —— 交 `gene-set-enrichment-analysis`；本技能只提供 Reactome 一侧的 ORA 接口与结果。
- **多库 Python 聚合**（一脚本同查 Ensembl/NCBI/UniProt）—— 用 `gget-genomic-databases`。
- 需带缓存的 Python 封装时，可考虑官方 `reactome2py`（`pip install reactome2py`）。

## 步骤 / 指令

1. 环境：仅需 `requests`，**两套接口全部免鉴权**；pixi/conda 内用 `pixi run python ...`。
   ```bash
   pip install requests
   ```
2. 两个 base URL 各司其职：
   - Content Service `https://reactome.org/ContentService` —— 查通路/实体/层级/物种/xref（GET，参数走 query）。
   - Analysis Service `https://reactome.org/AnalysisService` —— 富集分析与 token 结果（提交用 POST + `text/plain` 文本体）。
3. **先搜后取**：不知道 ID 就先 `/search/query` 枚举，拿到 `stId`（形如 `R-HSA-#####`）再 `/data/query/{stId}` 取详情；优先用稳定 ID，内部 dbId 跨版本会变。
4. **富集提交**：POST `/identifiers/`，body 为**换行分隔**的标识符（或制表符分隔带表达值做叠加），返回 `summary.token` + `pathways`。富集排序用 `sortBy=ENTITIES_FDR`（FDR 比原始 p 值更可靠）。
5. **善用 token**：token 有效数小时，存下后可 `GET /token/{token}` 复取并按 `species`/`resource`（TOTAL/UNIPROT/ENSEMBL/CHEBI…）再过滤，无需重跑；也可拼成 PathwayBrowser 链接共享。
6. **物种用 NCBI taxId 或物种名**：9606=人、10090=鼠、10116=鼠（大鼠）；搜索/富集加 `species=Homo sapiens` 防跨物种串味。
7. **批量加延时**：无硬性限流，但顺序请求间加 `time.sleep(0.5)` 防节流；大基因列表（>2000）分批，遇 500 退避重试。
8. **核对未命中**：富集结果看 `identifiersNotFound`，偏高多半是 ID 类型不对（UniProt vs HGNC 符号）或 ID 过时。

## 示例

通用 GET 封装 + 查版本/通路/搜索：

```python
import requests, time
CONTENT  = "https://reactome.org/ContentService"
ANALYSIS = "https://reactome.org/AnalysisService"

def rx_get(base, path, params=None):
    r = requests.get(f"{base}{path}", params=params)
    r.raise_for_status()
    try: return r.json()
    except ValueError: return r.text

print(rx_get(CONTENT, "/data/database/version"))          # 库版本
p = rx_get(CONTENT, "/data/query/R-HSA-69620")            # 按稳定 ID 取通路
print(p["displayName"], p["speciesName"], p["schemaClass"])
res = rx_get(CONTENT, "/search/query", params={"query": "apoptosis", "types": "Pathway"})
print("found:", res["found"])
```

通路参与分子与参考实体（取通路里的基因/蛋白）：

```python
ents = rx_get(CONTENT, "/data/participants/R-HSA-69620")
refs = rx_get(CONTENT, "/data/participants/R-HSA-69620/referenceEntities")
for r in refs[:3]:
    print(r.get("databaseName"), r.get("identifier"), "—", r["displayName"])
# 取通路全部 UniProt 蛋白：筛 databaseName == "UniProt"
genes = {r["displayName"] for r in refs if r.get("databaseName") == "UniProt"}
```

基因列表富集（ORA）→ 取 token 与 top 通路：

```python
genes = "TP53\nBRCA1\nBRCA2\nATM\nCHEK2\nCDK2\nRB1\nMDM2\nCDKN1A\nBAX"
resp = requests.post(
    f"{ANALYSIS}/identifiers/",
    headers={"Content-Type": "text/plain"},
    data=genes,
    params={"pageSize": 5, "sortBy": "ENTITIES_FDR", "order": "ASC"},
)
resp.raise_for_status()
r = resp.json()
token = r["summary"]["token"]
print("token:", token, "| pathways:", r["pathwaysFound"], "| 未命中:", r["identifiersNotFound"])
for p in r["pathways"][:5]:
    e = p["entities"]
    print(f"  {p['stId']} {p['name']}  FDR={e['fdr']:.2e}  {e['found']}/{e['total']}")
```

凭 token 复取/再过滤 + 看某通路命中的标识符：

```python
data = requests.get(f"{ANALYSIS}/token/{token}", params={
    "pageSize": 20, "sortBy": "ENTITIES_FDR",
    "species": "Homo sapiens", "resource": "TOTAL"}).json()
top = data["pathways"][0]["stId"]
found = requests.get(f"{ANALYSIS}/token/{token}/found/all/{top}").json()
for ent in found.get("entities", [])[:5]:
    print(ent["id"], "->", [m["identifier"] for m in ent.get("mapsTo", [])])
```

通路层级与跨库映射：

```python
top = rx_get(CONTENT, "/data/pathways/top/9606")                       # 人顶层通路
sub = rx_get(CONTENT, "/data/pathway/R-HSA-69620/containedEvents")     # 子通路+反应
anc = rx_get(CONTENT, "/data/event/R-HSA-69620/ancestors")            # 祖先链
species = rx_get(CONTENT, "/data/species/all")                        # 全物种(含 taxId)
ortho = rx_get(CONTENT, "/data/orthology/R-HSA-69620/species/10090")  # 人→鼠直系同源
```

表达值叠加（制表符分隔，首行可作表头自动识别）：

```python
expr = "#id\tcontrol\ttreated\nTP53\t1.2\t3.5\nBRCA1\t2.1\t1.8\nCDK2\t0.9\t4.2"
r = requests.post(f"{ANALYSIS}/identifiers/",
    headers={"Content-Type": "text/plain"}, data=expr,
    params={"pageSize": 10, "sortBy": "ENTITIES_FDR"}).json()
for p in r["pathways"][:3]:
    print(p["name"], "expr=", p["entities"].get("exp", []))
```

通路图 / 富集叠加链接：

```python
pid, token = "R-HSA-69620", "YOUR_TOKEN"
print(f"https://reactome.org/PathwayBrowser/#/{pid}")                         # 通路图
print(f"https://reactome.org/PathwayBrowser/#/{pid}&DTAB=AN&ANALYSIS={token}")# 带富集叠加
```

## 注意事项

通路层级与可搜类型：

| 层级 | schemaClass | 例 |
|---|---|---|
| 顶层通路 | `TopLevelPathway` | 细胞周期、免疫系统、代谢 |
| 通路 | `Pathway` | 细胞周期检查点 |
| 反应 | `Reaction` | TP53 binds RB1 |
| 物理实体 | `EntityWithAccessionedSequence` | TP53 [cytosol] |

可搜 `types`：`Pathway`/`Reaction`/`Protein`/`Complex`/`SmallMolecule`/`Gene`/`DNA`/`RNA`/`Drug`/`ReferenceEntity`。富集接受的 ID：UniProt（P04637）、HGNC 符号（TP53）、Ensembl（ENSG…/ENSP…）、NCBI Gene（7157）、ChEBI（CHEBI:15377）、miRBase、KEGG（hsa:7157）等。

关键参数：`sortBy`（`ENTITIES_FDR`/`ENTITIES_PVALUE`/`ENTITIES_FOUND`/`NAME`，默认 PVALUE）、`pageSize`（默认 20，1–250）、`resource`（默认 TOTAL，可 UNIPROT/ENSEMBL/CHEBI…）、搜索 `cluster`（默认 true，按类型分组）。

常见排错：

- **404**：稳定 ID 或物种前缀错——人类用 `R-HSA-{数字}`，先 `/search/query` 找有效 ID。
- **400**：POST body 或 Content-Type 错——富集须 `Content-Type: text/plain` + 换行分隔标识符。
- **富集空结果 / 未命中高**：ID 不被识别——查 `identifiersNotFound`，换 ID 类型（UniProt↔HGNC 符号）。
- **500**：输入过大或服务端波动——退避重试，大列表（>2000）分批。
- **token 失效**：结果只存数小时——重新提交基因列表。
- **跨物种串味**：搜索/富集加 `species=Homo sapiens`。
- **xref 返回空**：并非所有实体都有外部库映射，属正常，看实体 schemaClass。
- **响应慢**：大通路实体多——用 `pageSize` 分页并本地缓存。

参考：[Content Service API](https://reactome.org/ContentService/)（Swagger）、[Analysis Service API](https://reactome.org/AnalysisService/)、[Reactome 主站](https://reactome.org/)、[reactome2py](https://github.com/reactome/reactome2py)；Gillespie M. et al. (2022) *Nucleic Acids Research* 50:D364–D370。

## 互见

- requires：无。
- related：`kegg-database` —— KEGG 代谢通路与 ID 转换，关注代谢侧时用它；`uniprot-protein-database`、`pubchem-compound-search`、`opentargets-database` —— 富集前后的跨库 ID 衔接与靶点/化合物下钻；`gget-genomic-databases`、`scientific-database-lookup` —— 多库 Python 聚合 / 通用数据库查询。
- combines_with：`gene-set-enrichment-analysis` —— 本技能提供 Reactome 一侧的 ORA 接口与结果，完整富集选型（ORA vs GSEA）、去冗余与可视化交由它编排；`kegg-database` —— 同时取 KEGG 与 Reactome 富集做交叉验证。

---

采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0）。
