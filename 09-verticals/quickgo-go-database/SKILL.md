---
name: quickgo-go-database
title: QuickGO GO 术语与注释
description: 当需经 EBI QuickGO REST API 解析 GO 术语、搜词、遍历祖先/后代或按物种/证据码取蛋白 GO 注释时使用；做免认证 GET 返回 JSON 与表/图；不适用于富集统计（用 gene-set-enrichment-analysis）或取蛋白序列特征（用 uniprot-protein-database）；触发词：QuickGO、Gene Ontology、GO 注释、证据码、annotation/search
domain: 领域/science
triggers: [QuickGO, Gene Ontology, GO term, GO 注释, 证据码, evidence code, ancestors, descendants, taxonId, annotation search, GO 富集前数据]
tags: [quickgo, gene-ontology, go-annotation, ebi, rest-api, bioinformatics, science, genomics, ontology]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, requests, pandas, matplotlib]
requires: []
related: [uniprot-protein-database, scientific-database-lookup, gene-set-enrichment-analysis]
combines_with: [gene-set-enrichment-analysis, uniprot-protein-database]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

经 EBI QuickGO REST API 程序化访问 Gene Ontology（术语 + 层级）与跨物种蛋白 GO 注释时使用。免认证、返回 JSON，所有端点位于 `https://www.ebi.ac.uk/QuickGO/services/`。典型场景：

- 把 GO ID（如 `GO:0006915`）解析为 name / definition / aspect（BP/MF/CC）。
- 按关键词搜 GO 术语（如 "apoptosis"）拿到候选 GO ID。
- 沿 GO DAG 向上取**祖先**或向下取**后代**。
- 按 UniProt 蛋白、物种 taxon、证据码、aspect 抓 GO 注释，或统计注释计数分布。
- 一次批量解析多个 GO ID（≤200/请求），免逐条循环。

**不该用的边界：**
- 不做富集分析本身（ORA/GSEA）——QuickGO 只提供原始注释数据，富集用 `gene-set-enrichment-analysis`。
- 不取蛋白序列 / 结构 / 特征注释——用 `uniprot-protein-database`。
- 需要跨多库（化合物/通路/变异等）泛查时改用 `scientific-database-lookup`。

## 步骤

1. **装依赖**（已在 pixi/conda 环境则跳过）：`pip install requests pandas matplotlib`。
2. **选端点**：术语元数据 → `ontology/go/terms/{ids}`；搜词 → `ontology/go/search`；层级 → `terms/{id}/ancestors|descendants`；注释 → `annotation/search`。
3. **构造参数**：注释查询按需带 `goId` / `geneProductId`（`UniProtKB:ACCESSION`）/ `taxonId` / `evidenceCode` / `goAspect`。
4. **发 GET**：统一带 `headers={"Accept": "application/json"}`、`timeout=30`，并 `raise_for_status()`。
5. **翻页**：读响应 `numberOfHits`，当其 > `limit`（默认 25，设 `limit=200`）时用 `page` 逐页取，循环间 `time.sleep(1.0)`。
6. **落地**：解析 `results`，按需转 `pandas.DataFrame` 出表/出图。

## 指令

统一 GET 封装与基址：

```python
import requests, time
QUICKGO_BASE = "https://www.ebi.ac.uk/QuickGO/services"

def quickgo_get(endpoint: str, params: dict = None) -> dict:
    r = requests.get(f"{QUICKGO_BASE}/{endpoint}", params=params,
                     headers={"Accept": "application/json"}, timeout=30)
    r.raise_for_status()
    return r.json()
```

**核心端点速查：**

| 任务 | 端点 | 关键参数 |
|---|---|---|
| 术语元数据（单/批） | `ontology/go/terms/{id1,id2,...}` | 逗号分隔，≤200 IDs |
| 关键词搜词 | `ontology/go/search` | `query`, `limit`, `page` |
| 祖先 | `ontology/go/terms/{id}/ancestors` | `relations`（默认 `is_a`） |
| 后代 | `ontology/go/terms/{id}/descendants` | `relations` |
| 注释检索 | `annotation/search` | `goId`/`geneProductId`/`taxonId`/`evidenceCode`/`goAspect`/`limit`/`page` |

**GO 三大 aspect 根：** `biological_process`(GO:0008150)、`molecular_function`(GO:0003674)、`cellular_component`(GO:0005575)；主要关系 `is_a`(子类)、`part_of`(部分)。

**证据码分级（按可信度筛选）：**

| 类别 | 代码 | 含义 |
|---|---|---|
| 实验 | EXP, IDA, IPI, IMP, IGI, IEP | 直接生化/遗传实验，高可信 |
| 计算/相似 | ISS, ISO, ISA, IBA, RCA | 序列或系统发育推断 |
| 作者陈述 | TAS, IC | 注释者/作者断言，无实验 |
| 电子 | IEA | 自动推断、无人审，最低可信 |
| 高通量 | HTP, HDA, HMP, HGI, HEP | 高通量实验方法 |

机制性/临床结论应排除 `IEA`，仅取 `EXP,IDA,IPI,IMP,IGI,IEP[,TAS]`。

## 示例

**1) 批量解析 GO ID → name/aspect（一次请求）：**

```python
go_ids = ["GO:0006915", "GO:0005515", "GO:0016020"]
data = quickgo_get(f"ontology/go/terms/{','.join(go_ids)}")
for t in data.get("results", []):
    print(f"{t['id']}  {t['aspect']:<20}  {t['name']}")
# GO:0006915  biological_process    apoptotic process
# GO:0005515  molecular_function    protein binding
# GO:0016020  cellular_component    membrane
```

**2) 关键词搜词：**

```python
hits = quickgo_get("ontology/go/search",
                   {"query": "autophagy", "limit": 20, "page": 1})["results"]
for h in hits[:3]:
    print(h["id"], h["aspect"], h["name"])
```

**3) 沿 DAG 取祖先/后代：**

```python
def get_relatives(go_id, kind, relations="is_a,part_of"):
    r = quickgo_get(f"ontology/go/terms/{go_id}/{kind}",
                    {"relations": relations})["results"]
    return r[0].get(kind, []) if r else []

anc = get_relatives("GO:0006915", "ancestors")
desc = get_relatives("GO:0006915", "descendants")
print(len(anc), "ancestors,", len(desc), "descendants")
```

**4) 抓蛋白实验注释并翻页（TP53 = P04637）：**

```python
EXP = "EXP,IDA,IPI,IMP,IGI,IEP"

def get_exp_annotations(uniprot_id, page_size=200):
    out, page = [], 1
    while True:
        data = quickgo_get("annotation/search", {
            "geneProductId": f"UniProtKB:{uniprot_id}",
            "evidenceCode": EXP, "limit": page_size, "page": page})
        batch = data.get("results", [])
        out.extend(batch)
        if not batch or len(out) >= data.get("numberOfHits", 0):
            break
        page += 1
        time.sleep(1.0)   # 礼貌限速
    return out

anns = get_exp_annotations("P04637")
print(f"TP53 experimental GO annotations: {len(anns)}")
```

**5) 本体感知抓取**：先取某术语全部后代，再合并查注释，覆盖更具体子术语（仅查精确 `goId` 会漏标到子术语的蛋白）。

## 注意事项

- **GO ID 格式**：`GO:` + 7 位数字、大写、无空格，否则 HTTP 400。
- **UniProt 加前缀**：`geneProductId` 须为 `UniProtKB:P04637`（大小写敏感），否则 0 命中。
- **必检 `numberOfHits`**：默认 `limit=25` 常只返回一小部分；务必设 `limit=200` 并按 `page` 翻页直到取全。
- **批量优先**：terms 端点接受逗号分隔 ID 列表，一次解析 ≤200 个，比逐条快约百倍；超 200 分块、块间 `sleep(1.0)`。
- **礼貌限速**：QuickGO 无硬性限额但属共享 EBI 设施；批量循环每请求间隔 `time.sleep(1.0)`，遇 `5xx`/`503` 退避后重试。
- **obsolete 术语**：已知 GO ID 却返回 `results: []` 时检查 `isObsolete`，在 `replacedBy`/`consider` 里找替代。
- **后代过大（1000+）**：选了过宽的根术语；改用更具体子术语或按 100 分块处理。
- **避免混淆 aspect**：筛注释/富集时核对 `aspect` 字段，勿混 BP/MF/CC。

## 互见

- requires：（无）——免认证、零前置，直接可调。
- related：`uniprot-protein-database` —— 取蛋白序列/结构/特征注释的互补库；`scientific-database-lookup` —— 跨多库泛查的总入口。
- combines_with：`gene-set-enrichment-analysis` —— 用 QuickGO 抓原始 GO 注释/解析术语 ID，再交给它做 ORA/GSEA 富集。

---
本条采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0）。
