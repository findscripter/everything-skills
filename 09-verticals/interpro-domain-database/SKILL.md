---
name: interpro-domain-database
title: InterPro 蛋白结构域数据库
description: 当需要查蛋白结构域架构、家族归类、跨成员库整合或结构域物种分布时使用；用 requests 直连 EBI InterPro REST API，产出某 UniProt 蛋白的全部 InterPro 条目、家族成员蛋白列表、物种分布与关联 PDB 结构。不适用于取蛋白序列/功能注释（用 uniprot-protein-database）或下载实验三维结构（用结构数据库技能）。触发词：InterPro、IPR、Pfam、结构域架构、蛋白家族
domain: 领域/science
triggers: [InterPro, IPR, Pfam, PANTHER, 结构域架构, 蛋白家族, domain architecture, 成员数据库, GO 注释, 物种分布, 结构域, SMART, PROSITE, EBI, UniProt 结构域]
tags: [science, 蛋白质组学, 结构域, interpro, rest-api, 蛋白家族, 结构生物学]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Bash, requests, pandas, matplotlib]
requires: []
related: [uniprot-protein-database, rcsb-pdb-database, string-ppi-database, quickgo-go-database]
combines_with: [gget-genomic-databases, scientific-database-lookup]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

适用：

- 按 UniProt accession（如 `P04637`）列出某蛋白的全部 InterPro 条目，得到结构域架构（domain/family/site 及位置）。
- 反查含某结构域/家族的蛋白列表（如 IPR000719 蛋白激酶域），可限 Swiss-Prot reviewed。
- 查某 InterPro 条目的物种分布（taxonomy），看哪些类群编码该结构域。
- 把结构域关联到 PDB 实验三维结构（cross-link）。
- 看某条目由哪些成员库覆盖（Pfam、PANTHER、SMART、CDD、PROSITE…）及其 GO 注释。
- 不知 accession 时按关键词（如 "serine kinase"）发现 InterPro 条目。

不该用（负边界）：

- 取蛋白序列、Swiss-Prot 功能注释（活性位点、PTM、疾病关联）、ID 映射——用 `uniprot-protein-database`。
- 下载实验三维结构文件——InterPro 只给关联的 PDB ID，下结构走结构数据库技能。
- 生成蛋白语言模型嵌入——用 `protein-language-models`。
- 下载结构域比对序列 / 建 HMM——直接用 Pfam；InterPro 是元层（meta-layer）。

InterPro 是 EBI 的整合库，把 13 个成员库（Pfam、PANTHER、PIRSF、PRINTS、PROSITE、SMART、CDD、NCBIfam…）的签名归并为统一 InterPro 条目。REST API：`https://www.ebi.ac.uk/interpro/api/`，**免费、无需鉴权**。

## 步骤 / 指令

1. 环境：仅需 `requests`、`pandas`、`matplotlib`。在 pixi/conda 环境用 `pixi run python ...`。
   ```bash
   pip install requests pandas matplotlib
   ```
2. 统一用 `Accept: application/json` 头与一个薄封装函数（见示例 `interpro_get`），base = `https://www.ebi.ac.uk/interpro/api`。
3. **取蛋白结构域用专门端点**：`protein/uniprot/{acc}/` 只返回 `{metadata}`（蛋白本身）；条目匹配在 `entry/interpro/protein/uniprot/{acc}/`，键为 `results`，每项含 `metadata` + 嵌套 `proteins[0].entry_protein_locations`（按蛋白的匹配位置）。
4. **路径反转避免 408**：凡是「条目→蛋白/物种/结构」的列表查询，把 `entry/...` 放后面，否则慢 join 会超时（HTTP 408）：
   - 条目的蛋白列表：`protein/{db}/entry/interpro/{IPR}/`（**不要** `entry/interpro/{IPR}/protein/{db}/`）
   - 条目的物种分布：`taxonomy/uniprot/entry/interpro/{IPR}/`
   - 条目的 PDB 结构：`structure/pdb/entry/interpro/{IPR}/`（**不要** `structure/pdb/?entry_interpro=...`）
5. **reviewed vs uniprot**：`db` 取 `reviewed`（仅 Swiss-Prot，做家族分析/训练集首选，去噪）或 `uniprot`（全 UniProtKB，含 TrEMBL，量大 5–10×）。
6. **分页**：列表响应含 `count` 与 `next`（耗尽为 `null`）。大家族（激酶 10000+ 蛋白）必须循环跟 `next` 游标，`page_size` 设 200，落盘中间结果。
7. **限流自律**：EBI 共享基建无硬限流，批量翻页每页间 `time.sleep(1.0)`。
8. **优先用 InterPro accession 而非成员库号**：PF00069（Pfam）与 PTHR24340（PANTHER）都建模激酶域但覆盖不同；用父级 `IPR000719` 一次拿到各成员库匹配的并集。
9. **判读位置看 type**：只有 `domain`/`repeat`/`site` 的 `entry_protein_locations` 有意义；`family`/`homologous_superfamily` 通常跨全长，坐标信息有限。

## 示例

薄封装 + 取 TP53 结构域架构（核心范式）：

```python
import requests
INTERPRO_BASE = "https://www.ebi.ac.uk/interpro/api"

def interpro_get(path, params=None):
    r = requests.get(f"{INTERPRO_BASE}/{path}", params=params,
                     headers={"Accept": "application/json"}, timeout=60)
    r.raise_for_status()
    return r.json()

# entry/interpro/protein/uniprot/{acc}/ 返回 {count,next,previous,results}
data = interpro_get("entry/interpro/protein/uniprot/P04637/")   # TP53
print(f"InterPro 条目数: {data.get('count')}")
for e in data["results"][:6]:
    m = e["metadata"]
    locs = e["proteins"][0].get("entry_protein_locations", []) if e.get("proteins") else []
    loc = ", ".join(f"{f['start']}-{f['end']}" for L in locs for f in L.get("fragments", []))
    print(f"  {m['accession']}  {m['type']:<22}  {m['name'][:32]:<32}  [{loc}]")
```

关键词搜索条目 + 按 accession 取详情（成员库、GO）：

```python
hits = interpro_get("entry/interpro/",
                    {"search": "serine kinase", "type": "domain", "page_size": 20})["results"]
meta = interpro_get("entry/interpro/IPR000719/")["metadata"]
print(meta["accession"], meta["name"], meta["type"])
print("成员库:", list(meta.get("member_databases", {}).keys()))   # ['pfam','smart','cdd','ncbifam','panther']
print("GO:", [g["identifier"] for g in meta.get("go_terms", [])[:3]])
```

反查家族成员蛋白（路径反转 + 游标分页）：

```python
import time
def get_all_entry_proteins(ipr, reviewed=True):
    db = "reviewed" if reviewed else "uniprot"
    url = f"{INTERPRO_BASE}/protein/{db}/entry/interpro/{ipr}/"
    out, params = [], {"page_size": 200}
    while url:
        d = requests.get(url, params=params, headers={"Accept": "application/json"},
                         timeout=60); d.raise_for_status(); d = d.json()
        out.extend(d.get("results", []))
        url, params = d.get("next"), None      # next 已编码好参数
        if url: time.sleep(1.0)
    return out

proteins = get_all_entry_proteins("IPR000719")   # 蛋白激酶域，reviewed
```

物种分布（小条目；激酶 IPR000719 太大会 408，回退到子家族）：

```python
taxa = interpro_get("taxonomy/uniprot/entry/interpro/IPR011615/",   # p53 DNA 结合域
                    {"page_size": 50})["results"]
for t in taxa[:8]:
    m = t["metadata"]   # accession=taxId, name, rank
    print(f"  taxId={m['accession']:>8}  {m.get('name',''):<28}  rank={m.get('rank') or 'n/a'}")
```

关联 PDB 结构（按分辨率排序）：

```python
import pandas as pd
structs = interpro_get("structure/pdb/entry/interpro/IPR011009/",   # 激酶样超家族
                       {"page_size": 200})["results"]
df = pd.DataFrame({"pdb": s["metadata"]["accession"].upper(),
                   "resolution": s["metadata"].get("resolution"),
                   "exp": s["metadata"].get("experiment_type","")} for s in structs)
df = df.dropna(subset=["resolution"]).sort_values("resolution")
print(df.head(10).to_string(index=False))
```

工作流：多蛋白结构域矩阵：

```python
rows = []
for acc in ["P04637", "P38398", "Q00987", "P10415"]:   # TP53,BRCA1,MDM2,BCL2
    d = interpro_get(f"entry/interpro/protein/uniprot/{acc}/")
    for e in d.get("results", []):
        m = e["metadata"]
        rows.append({"protein": acc, "accession": m["accession"], "type": m["type"]})
    time.sleep(1.0)
df = pd.DataFrame(rows)
pivot = df[df.type=="domain"].pivot_table(index="protein", columns="accession",
                                          aggfunc="size", fill_value=0)
pivot.to_csv("domain_architecture_matrix.csv")
```

## 注意事项

InterPro 五种条目类型（type 决定匹配的生物学含义）：`family`（共同祖先+功能的同源蛋白组，如 IPR000719 蛋白激酶）、`domain`（可在多蛋白语境出现的结构功能单元，如 IPR011009 激酶样超家族）、`homologous_superfamily`（结构相似但序列已分化）、`repeat`（蛋白内多次重复的短单元，如 IPR001440 TPR）、`site`（活性/结合/PTM 短保守 motif，如 IPR008271）。

成员库前缀：Pfam=PF（profile HMM）、PANTHER=PTHR、PIRSF=PIRSF、PRINTS=PR、PROSITE=PS（pattern/profile）、SMART=SM、CDD=cd（PSSM）、NCBIfam=NF。InterPro 号（IPR…）是统一元条目。

关键参数：`search`（关键词，仅 `entry/interpro/`）、`type`（`family`/`domain`/`homologous_superfamily`/`repeat`/`site`）、`page_size`（1–200，默认 20）、`source_database`（`reviewed`/`uniprot`/`trembl`）、`next`（游标，用响应里的完整 URL）、`relations`（`contains`/`contained_by`/`child_of`/`parent_of`，遍历层级）。

常见排错：

- 蛋白查询 HTTP 404：accession 在 InterPro 不存在；isoform（P12345-2）可能未单独索引。
- 蛋白条目列表为空：该蛋白无 InterPro 匹配（如内在无序蛋白），属正常，去 UniProt 核对。
- `protein/uniprot/{acc}/` 只返回 `metadata` 没条目：用错端点——改 `entry/interpro/protein/uniprot/{acc}/` 读 `results`。
- `entry/interpro/{IPR}/protein/...` 或 `structure/pdb/?entry_interpro=...` 408/卡死：join 顺序问题——反转为 `protein/{db}/entry/interpro/{IPR}/`、`structure/pdb/entry/interpro/{IPR}/`。
- 物种端点对超大家族（IPR000719 激酶 ~270k taxa）仍 408：回退到更具体的子家族条目（如 IPR011615）。
- 条目搜索 HTTP 400：`type` 值非法——只能用上述五种。
- 分页提前停（`next` 早于预期为 `null`）：正常，结果已取完。
- `ConnectionError`/`Timeout`：EBI 偶有短暂宕机——指数退避重试。

参考：[InterPro REST API 文档](https://interpro-documentation.readthedocs.io/en/latest/api.html)、[InterPro 门户](https://www.ebi.ac.uk/interpro/)、[Blum et al., NAR 2021](https://doi.org/10.1093/nar/gkaa977)、[Paysan-Lafosse et al., NAR 2023](https://doi.org/10.1093/nar/gkac993)。

## 互见

- `uniprot-protein-database` — 蛋白序列、Swiss-Prot 功能注释、ID 映射；与本技能互为输入输出。
- `protein-language-models` — 用 InterPro 锁定蛋白家族后，生成序列嵌入做下游分析。
- `alphafold-database-access` — InterPro 给的 UniProt accession 可直接拉 AlphaFold 预测结构。
- `scientific-database-lookup` — 通用科学数据库检索入口，不确定查哪个库时先走它。

---

采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0）。
