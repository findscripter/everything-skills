---
name: clinpgx-pharmacogenomics-database
title: ClinPGx 药物基因组数据库
description: 当查询药物基因组临床注释、CPIC/DPWG 用药指南、基因-药物对、FDA/EMA 药物标签或基因型→用药建议时使用；做 ClinPGx REST API（api.clinpgx.org，注释）+ CPIC PostgREST API（api.cpicpgx.org，处方建议）双主机查询，产出证据分级注释表与基因型特异性用药建议；不适用于胚系致病性（用 clinvar）、体细胞肿瘤 PGx（用 cosmic/opentargets）、药物活性数据（用 chembl）。触发词：ClinPGx、PharmGKB、CPIC、药物基因组、CYP2C19、用药指南
domain: 领域/science
triggers: [ClinPGx, PharmGKB, CPIC, 药物基因组, pharmacogenomics, CYP2C19, clopidogrel 用药建议, 基因型 用药指南, DPWG, FDA 药物标签 PGx, rsID 临床注释, clinicalAnnotation, guidelineAnnotation]
tags: [databases, genomics-bioinformatics, pharmacogenomics, rest-api, clinical]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [requests, pandas, ClinPGx REST API, CPIC PostgREST API]
requires: []
related: [ddinter-drug-interactions, drugbank-database-access, clinvar-database, gtopdb-pharmacology-database]
combines_with: [ddinter-drug-interactions, clinvar-database]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

ClinPGx（原 PharmGKB，2024 年更名）是药物基因组学（PGx）权威库，配合 CPIC 处方规则库使用。核心心法：**ClinPGx 查「已知什么」（注释/证据），CPIC 查「如何开方」（基因型→建议）**。

适用场景：
- 查某基因-药物对的 CPIC 基因型特异性用药建议（如 CYP2C19 + 氯吡格雷）→ 用 CPIC。
- 查某药物或某证据等级的全部临床注释 → 用 ClinPGx `data/clinicalAnnotation`。
- 查某药物基因的 CPIC/DPWG 指南注释 → 用 ClinPGx `data/guidelineAnnotation`（基因驱动入口）。
- 把基因符号 / 药名 / rsID 解析为 ClinPGx PA 标识符 → 用 `data/{gene,drug,variant}`。
- 跨记录类型自由文本检索 → 用 `POST /site/search`。
- 查 FDA/EMA 药物标签的 PGx 注释 → 用 ClinPGx `data/label`。

不该用（负边界）：
- 胚系疾病致病性 / 临床意义（非 PGx）→ 用 clinvar-database。
- 体细胞肿瘤药物基因组 → 用 cosmic-database 或 opentargets-database。
- 药物生物活性 / 结合数据 → 用 chembl-database-bioactivity。

## 步骤

两主机架构，无需鉴权：
- **ClinPGx Data API** `https://api.clinpgx.org/v1` — 记录式访问。响应包 `{"data":[...], "status":"success"}`，过滤用点号属性路径（如 `relatedChemicals.name=clopidogrel`、`levelOfEvidence.term=1A`）。`view=base` 为摘要，`view=max` 为完整嵌套。
- **CPIC PostgREST API** `https://api.cpicpgx.org/v1` — 关系型查询。过滤语法 `column=eq.value`，JSONB 包含用 `cs.{...}`，返回扁平 JSON 数组。

依赖：`requests`、`pandas`（标准环境通常已有；pixi/conda 环境内用 `pixi run python ...`，已装则跳过安装）。

```bash
pip install requests pandas
```

注意 ClinPGx 偶发 HTTP 429，循环中插入 `time.sleep(0.3~0.5)`；CPIC 较宽松。

## 指令

### 模块 1：自由文本检索（不知道 PA ID 时的入口）

`POST /site/search`，body 为 `{"query":"<term>"}`，一次跨药物/基因/变异/注释/指南/标签检索。

```python
import requests
CLINPGX = "https://api.clinpgx.org/v1"
r = requests.post(f"{CLINPGX}/site/search", json={"query": "rs4149056"}, timeout=15)
r.raise_for_status()
data = r.json()["data"]
print(f"总命中: {data['total']}")
for h in data["hits"][:5]:
    print(f"  id={h.get('id')}  name={h.get('name','')[:80]}")
```

### 模块 2：基因 / 药物 / 变异记录查询

`/data/{type}` 接受简单属性过滤，均返回 `{"data":[...], "status":"success"}`。

```python
gene = requests.get(f"{CLINPGX}/data/gene",
    params={"symbol": "CYP2D6", "view": "base"}).json()["data"][0]
drug = requests.get(f"{CLINPGX}/data/drug",
    params={"name": "warfarin", "view": "base"}).json()["data"][0]   # 用小写通用名
var = requests.get(f"{CLINPGX}/data/variant",
    params={"name": "rs4149056", "view": "base"}).json()["data"][0]
# 已知 PA ID 时直接取：
rec = requests.get(f"{CLINPGX}/data/drug/PA449088", params={"view": "max"}).json()["data"]
```

### 模块 3：临床注释 `data/clinicalAnnotation`

关联变异（`location`）+ 药物（`relatedChemicals`）+ 证据等级（`levelOfEvidence.term`）。**仅支持两个过滤器**：`relatedChemicals.name=` 和 `levelOfEvidence.term=`。**此端点无可用的 `gene=` 过滤**（基因驱动见模块 4）。

```python
import pandas as pd
data = requests.get(f"{CLINPGX}/data/clinicalAnnotation",
    params={"levelOfEvidence.term": "1A", "view": "base"}).json()["data"]  # 最高证据
print(f"Level 1A 注释: {len(data)}")
counts = {}
for ann in data:
    for c in ann.get("relatedChemicals") or []:
        counts[c["name"]] = counts.get(c["name"], 0) + 1
print(pd.DataFrame(sorted(counts.items(), key=lambda x:-x[1])[:10],
                   columns=["drug","n_1A"]).to_string(index=False))
```

### 模块 4：指南注释 `data/guidelineAnnotation`（基因驱动入口）

同时支持 `relatedGenes.symbol=` 和 `relatedChemicals.name=`，加 `source=`（`CPIC`/`DPWG`/`CPNDS`/`RNPGx`）。这是获取「基因→指南覆盖」的规范方式。

```python
data = requests.get(f"{CLINPGX}/data/guidelineAnnotation",
    params={"relatedGenes.symbol": "CYP2C19", "source": "CPIC", "view": "base"}
    ).json()["data"]
print(f"CYP2C19 CPIC 指南: {len(data)}")
```

### 模块 5：监管药物标签 `data/label`（FDA/EMA）

PharmGKB 策展的 FDA/EMA PGx 标签注释。过滤 `relatedChemicals.name=` 与 `source=`（`FDA`/`EMA`/`HCSC`/`PMDA`/`Swissmedic`）。

```python
data = requests.get(f"{CLINPGX}/data/label",
    params={"relatedChemicals.name": "warfarin", "source": "FDA", "view": "base"}
    ).json()["data"]
for d in data:
    print(d["name"][:60], d.get("biomarkerStatus"), d.get("testingRequired"))
```

### 模块 6：CPIC 基因型→用药建议链

PostgREST：等值 `column=eq.value`，JSONB 包含 `column=cs.{...}`。标准链 `drug → drugid → recommendation`，可按表型过滤。

```python
import json
CPIC = "https://api.cpicpgx.org/v1"
drug = requests.get(f"{CPIC}/drug", params={"name": "eq.clopidogrel"}).json()[0]
genotype = {"CYP2C19": "Poor Metabolizer"}
recs = requests.get(f"{CPIC}/recommendation",
    params={"drugid": f"eq.{drug['drugid']}",
            "phenotypes": f"cs.{json.dumps(genotype)}"}).json()  # requests 自动 URL 编码
for rec in recs:
    print(f"[{rec['classification']}] {rec['drugrecommendation'][:90]}")
# 基因驱动：列出 CYP2C19 的全部 CPIC 配对
pairs = requests.get(f"{CPIC}/pair", params={"genesymbol": "eq.CYP2C19"}).json()
```

## 示例

### 工作流 A：药物基因 panel 的 CPIC 覆盖统计

```python
import requests, pandas as pd, time
CLINPGX = "https://api.clinpgx.org/v1"
genes = ["CYP2D6", "CYP2C19", "CYP2C9", "DPYD", "TPMT", "SLCO1B1"]
rows = []
for g in genes:
    data = requests.get(f"{CLINPGX}/data/guidelineAnnotation",
        params={"relatedGenes.symbol": g, "source": "CPIC", "view": "base"},
        timeout=20).json()["data"]
    drugs = sorted({c["name"] for gl in data for c in (gl.get("relatedChemicals") or [])})
    rows.append({"gene": g, "cpic_guidelines": len(data), "n_drugs": len(drugs)})
    time.sleep(0.3)
print(pd.DataFrame(rows).sort_values("cpic_guidelines", ascending=False).to_string(index=False))
```

### 工作流 B：rsID → 临床注释（变异驱动）

Data API **不接受 rsID 作为过滤属性**。先用 `site/search` 发现注释 ID，再逐个按 ID 取详情。

```python
rsid = "rs4149056"
hits = requests.post(f"{CLINPGX}/site/search", json={"query": rsid}, timeout=15
    ).json()["data"]["hits"]
ann_hits = [h for h in hits if h.get("name","").lower().startswith("clinical annotation")]
if ann_hits:
    ann = requests.get(f"{CLINPGX}/data/clinicalAnnotation/{ann_hits[0]['id']}",
        params={"view": "max"}, timeout=15).json()["data"]
    print(", ".join(c["name"] for c in (ann.get("relatedChemicals") or [])))
    print((ann.get("levelOfEvidence") or {}).get("term"))
```

### 健壮会话（长循环用重试）

```python
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
s = requests.Session()
s.mount("https://", HTTPAdapter(max_retries=Retry(total=4, backoff_factor=1.0,
    status_forcelist=[429,500,502,503,504], allowed_methods=["GET","POST"])))
```

## 注意事项

- **PA 标识符解析一次即缓存**：勿手工拼造 PA ID。调用 `data/{type}?{symbol|name}=...` 或 `site/search` 取回 `id` 复用（CYP2D6=`gene/PA128`，氯吡格雷=`drug/PA449088`，rs4149056=`variant/PA166154579`）。
- **选对主机**：注释问题用 ClinPGx，处方问题用 CPIC。单靠 ClinPGx 无法得到结构化的 `recommendation.phenotypes` 行。
- **证据等级**：1A→4 递减。`levelOfEvidence.term` 是**字符串**（`"1A"` 非 `1A`）。1A=指南/FDA标签级（最强），3/4 为探索性、不应驱动处方。临床工作流应前置 `levelOfEvidence.term=1A`。
- **别对 `clinicalAnnotation` 按基因过滤**：该端点无 `gene=`/`relatedGenes.symbol=`，任何尝试返回 HTTP 400（`No such property: 'gene'`）。基因驱动改用 `guidelineAnnotation`。
- **`view` 取舍**：批量过滤用 `base`，单记录下钻用 `max`（payload 约大 5~10 倍，列表查询配 `max` 易超时/429）。
- **响应信封**：每个 `/data/...` 返回 `{"data":..., "status":"success|fail"}`；失败时 body 为 `{"status":"fail","data":{"errors":[{"message":"..."}]}}`，两个键都要读。
- **`site/search` 仅接受 POST**：`GET /site/search?query=...` 返回 405。
- **`cs.{...}` 含空格/特殊字符需 URL 编码**：经 `requests` 的 `params=` 传入会自动编码；手拼 URL 用 `urllib.parse.quote`。
- **旧主机已死**：`api.pharmgkb.org` 返回 404/405，全部迁移到 `api.clinpgx.org`。
- **空结果排查**：药名不匹配（品牌名 vs 通用名 / 大小写）时，改用小写通用名，或退回 `site/search` 找规范 PA ID。

## 互见

- `clinvar-database` — 变异的胚系致病性 / 临床意义（疾病导向，与本库药物反应导向互补）。
- `opentargets-database` — 药物-靶点关联与安全信号，与 ClinPGx 药物基因靶点重叠。
- `chembl-database-bioactivity` — ClinPGx 所注释药物的生物活性 / 结合数据。
- `cosmic-database` — 体细胞肿瘤突变与肿瘤特异 PGx（与本库胚系 PGx 正交）。

参考：[ClinPGx 官网](https://www.clinpgx.org/) · [ClinPGx REST API 文档](https://www.clinpgx.org/page/webResources) · [CPIC API（Swagger）](https://api.cpicpgx.org/) · [CPIC 指南](https://cpicpgx.org/guidelines/) · Relling & Klein 2011 (doi:10.1038/nrd3499) · Whirl-Carrillo et al. 2021 (doi:10.1002/cpt.2350)

---
采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0）。
