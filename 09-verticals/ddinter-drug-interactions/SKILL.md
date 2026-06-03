---
name: ddinter-drug-interactions
title: DDInter 药物相互作用查询
description: 当需要查两药能否合用、相互作用严重度（major/moderate/minor）、机制与临床建议，或对多药清单做联合用药风险筛查时使用；经 DDInter REST API（免认证）按药名→DDInter ID 检索互作并产出分级报告/CSV/网络图；不适用于 FDA 药品标签文本、药物-基因（药物基因组）关联或不良事件上报。触发词：DDInter、药物相互作用、联合用药、配伍禁忌、严重度分级、polypharmacy
domain: 领域/science
triggers: [DDInter, 药物相互作用, 药物互作, 联合用药风险, 配伍禁忌, DDI 查询, 相互作用严重度, major moderate minor, polypharmacy 筛查, 两药能否合用]
tags: [science, drug-discovery, pharmacology, ddinter, drug-drug-interaction, polypharmacy, rest-api, 数据库查询, 临床药学]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [requests, pandas, networkx, matplotlib, DDInter REST API]
requires: []
related: [clinpgx-pharmacogenomics-database, drugbank-database-access, gtopdb-pharmacology-database, pubchem-compound-search]
combines_with: [clinpgx-pharmacogenomics-database, drugbank-database-access]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

适用：
- 判断两种同服药物在 DDInter 是否有已知相互作用及其严重度（major / moderate / minor）。
- 拉取某药全部已知互作，做联合用药（polypharmacy）风险评估。
- 识别互作的机制类别：药代动力学 PK（影响 ADME，如 CYP 抑制）vs 药效动力学 PD（靶点叠加/协同/拮抗）。
- 对一份用药清单做两两组合筛查，预先标出 major / moderate 互作。
- 为某药类（如 CYP3A4 底物）构建 DDI 网络/严重度矩阵供处方审核。

不该用（负边界）：
- 需要 FDA 批准的药品标签文本（适应证/剂量/禁忌）→ 用 FDA 标签类数据库（DailyMed），本库只给结构化互作分级。
- 药物-基因（药物基因组学，如 CYP 基因型-药物关联）→ 用 PharmGKB 类资源；DDInter 只覆盖药-药对，不含基因-药对。
- 药物不良事件上报（FAERS/openFDA）→ 用不良事件数据库。

## 步骤 / 指令

DDInter 是开放、人工策展的药-药相互作用库（2400+ 药、170 万+ 互作对），经 JSON REST API 访问，**免认证、免注册**。

- 基址：`BASE = "https://ddinter.scbdd.com/api"`，所有请求带 `params={"format":"json"}`。
- 依赖：`pip install requests pandas matplotlib networkx`（仅查询用 requests+pandas 即可）。
- **限速**：无官方公布限速，批量循环里加 `time.sleep(0.3)` 礼貌访问，防服务端节流。

核心约束（务必遵守）：
1. **先把药名解析成 DDInter ID**：互作接口不接受自由文本药名。先 `GET /drug/?drug_name=` 拿 `ddinter_id`（如 `DDInter_D00001`），再传给 `/interaction/` 或 `/between/`。
2. **处理分页**：`/interaction/` 默认每页仅 10 条；warfarin/amiodarone 有数百条互作。循环跟 `next` URL 直到为 `null`（拿到 `next` 后清空 `params`，因 next 已含参数），并设 `page_size=200` 减少轮次。
3. **严重度只能客户端过滤**：API 不支持服务端按 `level` 过滤，取回后用 pandas 筛 `df["level"].str.lower()=="major"`。
4. **单对查询用 `/between/`**（`drug1`+`drug2` 两个 ID 都必填，更快）；**全量画像用 `/interaction/`**。

端点速查：
| 端点 | 关键参数 | 用途 |
|---|---|---|
| `/drug/` | `drug_name`（任意药名串）、`page_size` | 药名→DDInter ID |
| `/interaction/` | `drug_id`、`page_size`(默认10,批量用200) | 某药全部互作（分页） |
| `/interaction/{id}/` | — | 单条互作详情（机制+建议） |
| `/between/` | `drug1`、`drug2`（均为 DDInter ID） | 检查指定两药是否互作 |

响应字段：`level`（major/moderate/minor）、`drug_a`/`drug_b`、`mechanism`、`recommendation`、`pharmacokinetic_type`/`pharmacodynamic_type`（PK/PD/mixed）。

严重度分级与临床动作：
| 级别 | 含义 | 动作 |
|---|---|---|
| major | 可能危及生命或致永久损害 | 避免合用，换替代药 |
| moderate | 可能致病情恶化，需加强监测 | 谨慎合用，密切监测 |
| minor | 临床影响有限，少有意义 | 一般安全，有症状时监测 |

## 示例

药名解析 + 取全部互作并按严重度汇总：

```python
import requests, time
import pandas as pd
BASE = "https://ddinter.scbdd.com/api"

def find_drug_id(name):
    r = requests.get(f"{BASE}/drug/", params={"drug_name": name, "format": "json"}, timeout=15)
    r.raise_for_status()
    res = r.json()["results"]
    return (res[0]["ddinter_id"], res[0]["drug_name"]) if res else (None, None)

def get_all_interactions(drug_id, page_size=200):
    out, url = [], f"{BASE}/interaction/"
    params = {"drug_id": drug_id, "format": "json", "page_size": page_size}
    while url:
        r = requests.get(url, params=params, timeout=30); r.raise_for_status()
        data = r.json()
        out.extend(data.get("results", []))
        url, params = data.get("next"), {}   # next 已含参数，清空 params
    return out

drug_id, name = find_drug_id("warfarin")        # -> DDInter_D00001, Warfarin
ixs = get_all_interactions(drug_id)
df = pd.DataFrame(ixs)
print(name, "总互作:", len(df))
if "level" in df.columns:
    print(df["level"].value_counts())          # Major / Moderate / Minor 计数
    major = df[df["level"].str.lower() == "major"]
    df.to_csv(f"{name}_ddi_profile.csv", index=False)
```

单对快速安全检查（合用前一查）：

```python
def quick_check(d1, d2):
    id1, rn1 = find_drug_id(d1); id2, rn2 = find_drug_id(d2)
    if not id1 or not id2:
        return f"未找到药物: {d1 if not id1 else d2}"
    r = requests.get(f"{BASE}/between/",
                     params={"drug1": id1, "drug2": id2, "format": "json"}, timeout=15)
    r.raise_for_status()
    ixs = r.json().get("results", [])
    if not ixs:
        return f"{rn1} + {rn2}: DDInter 无收录互作（缺失不等于无相互作用）"
    rank = {"major": 3, "moderate": 2, "minor": 1}
    worst = max(ixs, key=lambda x: rank.get(x.get("level", "minor").lower(), 0))
    return f"{rn1} + {rn2}: {worst['level'].upper()} — {worst.get('mechanism','N/A')[:120]}"

print(quick_check("warfarin", "aspirin"))
print(quick_check("warfarin", "fluconazole"))
```

用药清单两两 polypharmacy 筛查（标 major/moderate）：

```python
import itertools
def check_pair(id1, id2):
    r = requests.get(f"{BASE}/between/",
                     params={"drug1": id1, "drug2": id2, "format": "json"}, timeout=15)
    r.raise_for_status()
    return r.json().get("results", [])

meds = ["warfarin", "aspirin", "atorvastatin", "metformin", "amiodarone"]
id_map = {}
for n in meds:
    ddid, rn = find_drug_id(n)
    if ddid: id_map[n] = (ddid, rn)
    time.sleep(0.3)

flagged = []
for (n1, (i1, r1)), (n2, (i2, r2)) in itertools.combinations(id_map.items(), 2):
    for ix in check_pair(i1, i2):
        if ix.get("level", "").lower() in ("major", "moderate"):
            flagged.append({"drug_1": r1, "drug_2": r2,
                            "severity": ix["level"], "mechanism": ix.get("mechanism", "")[:100]})
    time.sleep(0.3)
pd.DataFrame(flagged).to_csv("polypharmacy_screening.csv", index=False)
```

可选：用 `networkx` 把两两互作画成网络，边按严重度上色（major `#D32F2F` / moderate `#F57C00` / minor `#388E3C`），`nx.spring_layout` 布局后 `plt.savefig("ddi_network.png")`。

## 注意事项

- **缺失 ≠ 安全**：`/between/` 返回空只代表 DDInter 未收录该对，不等于无相互作用；临床决策须再核对处方信息（DailyMed 等）与机构互作工具。
- **药名匹配**：`/drug/` 搜出 `count: 0` 时多因药名不符其命名法，改用 INN 通用名（如 `"acetylsalicylic acid"` 而非 `"aspirin"`）或部分名再试。
- **分页截断**：互作列表不全，多因默认 `page_size=10`；设 200 并循环 `next` 至 `null`。
- **404 on /interaction/**：DDInter ID 无效/拼错，重查 `/drug/` 拿正确 `DDInter_DXXXXX`。
- **去重**：批量导出时同一互作会从 drug_a/drug_b 两侧各出现一次；按排序后的药 ID 对去重（`drop_duplicates`）。
- **超时/连接错误**：`timeout=30` 并对批量请求做指数退避重试；`raise_for_status()` 后再 `r.json()` 防服务端返回非 JSON 错误页触发 `JSONDecodeError`。
- **ID 无跨库映射**：DDInter 用自有顺序号，不直接对应 ChEMBL/PubChem CID/RxCUI，必须先名称查询拿 ID。

## 互见

- related：`pubchem-compound-search` — 由药名/化合物查 PubChem，补充化学结构与标识符。
- related：`chembl-bioactivity-database` — 生物活性/靶点数据，互作机制溯源到靶点层面。
- related：`opentargets-database` — 靶点-疾病关联，理解 PD 互作的共同靶点。
- combines_with：`deepchem-drug-discovery` — 把 DDInter 互作标签作为 DDI 预测模型的监督数据。

---
采编自 jaechang-hits/SciAgent-Skills（原 license CC-BY-4.0），按本仓库规范适配重写；本条目以 CC-BY-4.0 发布。
