---
name: clinicaltrials-database-search
title: ClinicalTrials.gov 临床试验检索
description: 当需要按疾病、药物/干预、地点、申办方或试验阶段检索全球临床试验，或按 NCT 编号取详情、按状态过滤、翻页、导出 CSV 时使用；用纯 requests 调 ClinicalTrials.gov API v2（公开免鉴权）检索研究并产出结构化结果/CSV。不适用于化合物生物活性（用 chembl-bioactivity-database）或综合科研多库查询（用 scientific-database-lookup）。触发词：临床试验、ClinicalTrials.gov、NCT、招募状态、试验阶段、患者匹配、试验申办方
domain: 领域/science
triggers: [临床试验, ClinicalTrials.gov, NCT, clinical trials, 招募, RECRUITING, 试验阶段, PHASE, 入排标准, eligibility, 患者匹配, 申办方, sponsor, 干预, intervention, 试验导出 CSV]
tags: [science, clinical-trials, drug-discovery, database, rest-api, clinicaltrials-gov]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [requests, pandas, ClinicalTrials.gov API v2]
requires: []
related: [pytdc-therapeutics-datasets, drugbank-database-access, scientific-database-lookup, fda-device-consultant]
combines_with: [drugbank-database-access, scientific-database-lookup, pytdc-therapeutics-datasets]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

当你需要在 ClinicalTrials.gov（全球临床试验注册库）中检索、获取或导出试验数据时使用本技能。典型场景：

- 查找某疾病/适应症正在招募（RECRUITING）的临床试验
- 查找测试某药物 / 器械 / 干预手段的试验
- 按地理区域定位试验（患者转诊 / 就近入组）
- 跟踪某申办方或机构的临床试验组合（portfolio）
- 按 NCT 编号取单条试验的入排标准、结局指标、联系人详情
- 跨治疗领域分析试验趋势（阶段、入组人数、时间线）
- 为系统综述 / meta 分析批量导出试验数据，或监测状态变更与结果发布

**不该用本技能的边界：**
- 化合物生物活性 / IC50/Ki 等 SAR 数据 → 用 `chembl-bioactivity-database`
- 一站式跨多个科研/生物医学库的统一 REST 查询 → 用 `scientific-database-lookup`
- 发表文献检索（本库只覆盖试验注册，不含论文）→ 转科研文献检索类技能

## 步骤 / 指令

1. **准备环境**：`pip install requests`（唯一必需，无需 API key）；表格分析另装 `pandas`。

2. **设定基址**：`CT_API = "https://clinicaltrials.gov/api/v2"`。约束：公开免鉴权；速率约 50 请求/分钟/IP；单页最大 `pageSize=1000`；日期为 ISO 8601，文本字段为 CommonMark Markdown；响应格式 `json`（默认）或 `csv`。

3. **选端点**：
   - `GET /studies?<query 参数>` —— 检索（返回 `totalCount`、`studies[]`、`nextPageToken`）
   - `GET /studies/{NCT_ID}` —— 取单条试验详情（如 `NCT04852770`）

4. **拼查询参数**（`requests.get(..., params={...})` 自动 URL 编码）：

   | 参数 | 含义 | 示例 |
   |---|---|---|
   | `query.cond` | 疾病/适应症 | `lung cancer` |
   | `query.intr` | 干预/药物 | `Pembrolizumab` |
   | `query.locn` | 地理位置 | `New York` |
   | `query.spons` | 申办方 | `National Cancer Institute` |
   | `query.term` | 全文检索 | `immunotherapy` |
   | `filter.overallStatus` | 状态（逗号分隔多值） | `RECRUITING,COMPLETED` |
   | `filter.phase` | 阶段（逗号分隔） | `PHASE2,PHASE3` |
   | `filter.ids` | NCT 编号过滤 | `NCT04852770` |
   | `sort` | 排序 | `LastUpdatePostDate:desc` |
   | `pageSize` | 每页条数（≤1000，默认 10） | `100` |
   | `pageToken` | 翻页游标 | 上次响应的 `nextPageToken` |
   | `format` | 响应格式 | `json` / `csv` |

   排序字段：`LastUpdatePostDate` / `EnrollmentCount` / `StartDate` / `StudyFirstPostDate`，各带 `:asc` 或 `:desc`。

5. **状态枚举**（大小写敏感，须精确匹配）：`RECRUITING`（招募中）、`NOT_YET_RECRUITING`（获批未开）、`ENROLLING_BY_INVITATION`（邀请入组）、`ACTIVE_NOT_RECRUITING`（在研已截止入组）、`SUSPENDED`（暂停）、`TERMINATED`（提前终止）、`COMPLETED`（已完成）、`WITHDRAWN`（入组前撤回）。

6. **阶段枚举**：`EARLY_PHASE1`、`PHASE1`（安全/剂量）、`PHASE2`（有效性/副作用）、`PHASE3`（大规模有效性）、`PHASE4`（上市后监测）、`NA`（非药物研究不适用）。

7. **取嵌套字段**（响应为深层嵌套 JSON，统一从 `study['protocolSection']` 进入；缺模块用 `.get()` 或 `safe_get` 兜底）：

   | 数据 | 路径 |
   |---|---|
   | NCT ID | `protocolSection.identificationModule.nctId` |
   | 标题 | `…identificationModule.briefTitle` |
   | 状态 | `…statusModule.overallStatus` |
   | 阶段 | `…designModule.phases` |
   | 入组数 | `…designModule.enrollmentInfo.count` |
   | 入排标准 | `…eligibilityModule` |
   | 地点 | `…contactsLocationsModule.locations` |
   | 干预 | `…armsInterventionsModule.interventions` |
   | 结果 | `study.get('resultsSection')`（无结果为 None） |

8. **翻页**：沿响应里的 `nextPageToken` 走，把它回填进下次请求的 `pageToken`，直到为空；批量循环加 `time.sleep(1.5)` 守速率。

## 示例

**通用助手 + 按疾病检索招募试验：**

```python
import requests, time
CT_API = "https://clinicaltrials.gov/api/v2"

def ct_search(params):
    r = requests.get(f"{CT_API}/studies", params=params, timeout=30)
    r.raise_for_status()
    return r.json()

results = ct_search({
    "query.cond": "breast cancer",
    "filter.overallStatus": "RECRUITING",
    "pageSize": 10,
    "sort": "LastUpdatePostDate:desc",
})
print(f"共 {results['totalCount']} 项试验")
for s in results["studies"][:3]:
    ident = s["protocolSection"]["identificationModule"]
    print(f'  {ident["nctId"]}: {ident["briefTitle"]}')
```

**按药物 + 阶段过滤（多状态逗号分隔，一次请求覆盖）：**

```python
results = ct_search({
    "query.intr": "Pembrolizumab",
    "filter.overallStatus": "RECRUITING,ACTIVE_NOT_RECRUITING",
    "filter.phase": "PHASE3",
    "pageSize": 50,
})
print(f'Phase 3 Pembrolizumab 试验：{results["totalCount"]}')
```

**按 NCT 编号取详情（入排标准 / 年龄 / 性别）：**

```python
nct = "NCT04852770"
study = requests.get(f"{CT_API}/studies/{nct}", timeout=30).json()
proto = study["protocolSection"]
elig = proto.get("eligibilityModule", {})
print(proto["identificationModule"]["briefTitle"], proto["statusModule"]["overallStatus"])
print(f'年龄 {elig.get("minimumAge")}–{elig.get("maximumAge")}，性别 {elig.get("sex")}')
print((elig.get("eligibilityCriteria", "N/A"))[:300])
```

**大结果集翻页（最大页 + 守速率）：**

```python
all_studies, token = [], None
for page in range(10):  # 上限 10 页
    params = {"query.cond": "cancer", "filter.overallStatus": "RECRUITING", "pageSize": 1000}
    if token:
        params["pageToken"] = token
    data = ct_search(params)
    all_studies.extend(data["studies"])
    token = data.get("nextPageToken")
    if not token:
        break
    time.sleep(1.5)
print(f"共取 {len(all_studies)} 项")
```

**导出 CSV：**

```python
r = requests.get(f"{CT_API}/studies", params={
    "query.cond": "heart disease", "filter.overallStatus": "RECRUITING",
    "format": "csv", "pageSize": 1000}, timeout=60)
open("heart_disease_trials.csv", "w", encoding="utf-8").write(r.text)
```

**安全取字段 + 提取摘要（应对缺模块）：**

```python
def safe_get(study, *keys, default="N/A"):
    cur = study
    for k in keys:
        cur = cur.get(k) if isinstance(cur, dict) else None
        if cur is None:
            return default
    return cur

def extract_summary(study):
    p = study.get("protocolSection", {})
    d = p.get("designModule", {})
    return {
        "nct_id": safe_get(p, "identificationModule", "nctId"),
        "title": p.get("identificationModule", {}).get("briefTitle"),
        "status": safe_get(p, "statusModule", "overallStatus"),
        "phases": d.get("phases", []),
        "enrollment": d.get("enrollmentInfo", {}).get("count"),
    }
```

**带退避的健壮检索（批量必备，命中 429 时退避）：**

```python
def ct_search_with_retry(params, max_retries=3):
    for attempt in range(max_retries):
        try:
            r = requests.get(f"{CT_API}/studies", params=params, timeout=30)
            r.raise_for_status()
            return r.json()
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 429:
                time.sleep(60)            # 限流，等满 1 分钟
            else:
                raise
        except requests.exceptions.RequestException:
            if attempt == max_retries - 1:
                raise
            time.sleep(2 ** attempt)
    raise RuntimeError("超过最大重试次数")
```

## 注意事项

- **状态/阶段值大小写敏感**：用 `RECRUITING` 而非 `recruiting`，否则 400 Bad Request。
- **多状态用逗号一次查完**：`RECRUITING,NOT_YET_RECRUITING`，别每个状态发一次请求。
- **访结果前先查 `hasResults`**：多数试验无已发布结果，`resultsSection` 缺失；直接访问会 KeyError。
- **嵌套字段一律 `.get()` 兜底**：`contactsLocationsModule` / `armsInterventionsModule` 等并非每条试验都填充。
- **守速率（约 50/分钟）**：批量用 `pageSize=1000` 减少请求数；命中 429 等 60s 后重试或指数退避。
- **翻页早停**属正常：`nextPageToken` 缺失即已取完，用 `totalCount` 与已收集数核对。
- **默认排序建议** `LastUpdatePostDate:desc`，最新更新的试验优先；日期字段 `lastUpdatePostDateStruct.date` 为 ISO 8601 字符串，`type` 标 `ACTUAL`/`ESTIMATED`。
- **CSV 与 JSON 结构不同**：CSV 把嵌套结构扁平化；需要程序化访问字段时用 JSON。大批量 CSV 导出易超时，提高 timeout 或改用分页。
- **空 `studies` 数组**：多为过滤过严或拼写错误，放宽状态/阶段过滤或核对拼写。

## 互见

- related：`scientific-database-lookup` —— 跨多个科研/生物医学库的统一 REST 查询入口
- related：`chembl-bioactivity-database` —— 在研药物的化合物生物活性数据
- related：`opentargets-database` —— 将药物-靶点证据关联到疾病
- combines_with：`research-experiment-designer` —— 据试验注册信息设计/对标研究方案
- combines_with：`nih-grant-finder` —— 试验组合分析与科研资助检索互补

参考：API 文档 https://clinicaltrials.gov/data-api/api ｜ v1→v2 迁移 https://clinicaltrials.gov/data-api/about-api/api-migration ｜ OpenAPI 规范 https://clinicaltrials.gov/data-api/about-api/api-spec ｜ 主站 https://clinicaltrials.gov/

---

采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0）。
