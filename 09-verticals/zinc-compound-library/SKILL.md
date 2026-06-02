---
name: zinc-compound-library
title: ZINC 虚拟化合物库检索
description: 当需要从 ZINC15/ZINC22 检索可购买的类药/先导/片段化合物、按 MW/logP/HBD/HBA 等性质过滤建库、做 SMILES 相似性搜索或下载 SDF/SMILES 用于对接虚拟筛选时使用；用 requests 直连 ZINC15 REST API 与 tranche/subset 批量下载，产出去重的 SMILES/SDF 库与供应商信息。不适用于本地化学信息学（用 cheminformatics-toolkit）、靶点结合活性 IC50/Ki（用 chembl-bioactivity-database）或已上市药物结构（用 pubchem-compound-search）。触发词：ZINC、虚拟筛选、可购买化合物、tranche、相似性搜索、片段库
domain: 领域/science
triggers: [ZINC, ZINC15, ZINC22, 虚拟筛选, virtual screening, 可购买化合物, for-sale, tranche, 类药, 先导化合物, lead-like, 片段库, fragment-based, 三规则, Rule of Three, SMILES 相似性, Tanimoto, 对接库, docking library, MW logP 过滤]
tags: [science, 化学信息学, 药物发现, ZINC, 虚拟筛选, REST-API, 化合物库, 分子对接]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Bash, requests, pandas]
requires: []
related: [pubchem-compound-search, chembl-bioactivity-database, cheminformatics-toolkit, autodock-vina-docking, scientific-database-lookup]
combines_with: [cheminformatics-toolkit, autodock-vina-docking]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

适用：

- 为虚拟筛选/分子对接拉取一个**可购买**的类药或先导化合物库。
- 按 Lipinski/先导/片段判据（MW、logP、HBD、HBA、可旋转键）过滤建库，建专注筛选集。
- 用 SMILES 相似性（Tanimoto）找某查询分子的**可购买类似物**。
- 取片段化合物（三规则：MW ≤ 300、logP ≤ 3）做基于片段的药物发现（FBDD）。
- 为高通量筛选（HTS）建多样性化合物库。

不该用（负边界）：

- 本地化学信息学（指纹、描述符、3D 构象、PAINS/Brenk 过滤）——用 `cheminformatics-toolkit`。
- 靶点结合活性（IC50/Ki/Kd against targets）——用 `chembl-bioactivity-database`。
- 已上市/通用化合物的权威理化属性与标识符——用 `pubchem-compound-search`。

## 步骤 / 指令

1. 环境：仅需 `requests`、`pandas`，**无需 API key**（ZINC15 公开）。pixi/conda 内用 `pixi run python ...`。
   ```bash
   pip install requests pandas
   ```
2. 固定端点（ZINC15 REST）：`BASE = "https://zinc15.docking.org"`。
   - 性质搜索：`GET {BASE}/substances.json?<过滤参数>`
   - 单体检索：`GET {BASE}/substances/{ZINC_ID}.json`（ZINC_ID 须 12 位，如 `ZINC000000029632`）
   - 供应商：`GET {BASE}/substances/{ZINC_ID}/suppliers.json`
   - 3D SDF：`GET {BASE}/substances/{ZINC_ID}.sdf`
3. **性质过滤用 `__gte`/`__lte` 后缀**：`mwt__gte/mwt__lte`、`logp__gte/logp__lte`、`hbd__lte`、`hba__lte`、`rotatable_bonds__lte`。务必保证 `mwt__gte < mwt__lte`，否则空集。
4. **加 `availability=for-sale`** 只取可购买；`count`（默认 10，最多约 1000）控每次返回上限。
5. **大规模筛选优先 tranche/subset 批量下载**，别用 API 翻页爬。tranche 按 MW（行 A–K）× logP（列 A–J）二维分块，每块可下 SMILES/SDF；预建子集如 `lead-like`、`drug-like` 可整包下载。
6. **去重**：API 跨供应商目录会有重复，建库前按 canonical SMILES 去重（`Chem.MolToSmiles(Chem.MolFromSmiles(smi))`，见 `cheminformatics-toolkit`）。
7. **接力下游**：导出 `.smi`（`smiles zinc_id` 两列、空格分隔、无表头）供对接软件；对接前再用 RDKit 做 PAINS/Brenk 过滤，省算力。

## 示例

快速上手（性质过滤搜索）：

```python
import requests
BASE = "https://zinc15.docking.org"

r = requests.get(f"{BASE}/substances.json",
                 params={"mwt__gte": 250, "mwt__lte": 350,
                         "logp__gte": 0, "logp__lte": 3,
                         "availability": "for-sale", "count": 5})
r.raise_for_status()
for c in r.json()[:3]:
    print(f"{c['zinc_id']:18s} MW={c['mwt']:.1f} logP={c['logp']:.2f} {c['smiles'][:40]}")
```

可复用搜索助手（→ DataFrame）：

```python
import requests, pandas as pd
BASE = "https://zinc15.docking.org"

def zinc_search(params, max_results=500):
    params = dict(params); params["count"] = min(100, max_results)
    r = requests.get(f"{BASE}/substances.json", params=params); r.raise_for_status()
    return pd.DataFrame(r.json())

# 先导集：MW 250-350, logP 1-3, HBD ≤ 3, HBA ≤ 7
df = zinc_search({"mwt__gte": 250, "mwt__lte": 350, "logp__gte": 1, "logp__lte": 3,
                  "hbd__lte": 3, "hba__lte": 7, "availability": "for-sale"})
print(df[["zinc_id", "mwt", "logp", "smiles"]].head())
```

按 ZINC ID 取单体 + 供应商：

```python
zid = "ZINC000000029632"
c = requests.get(f"{BASE}/substances/{zid}.json").json()
print(f"{c['zinc_id']} SMILES={c['smiles']} MW={c['mwt']:.2f} logP={c['logp']:.2f}")
sup = requests.get(f"{BASE}/substances/{zid}/suppliers.json").json()
print(f"供应商数: {len(sup)}")
```

SMILES 相似性搜索（Tanimoto 阈值）：

```python
r = requests.get(f"{BASE}/substances.json",
                 params={"smiles": "c1ccc(NC(=O)c2ccccc2)cc1",  # benzanilide 类似物
                         "similarity": 0.6, "count": 20, "availability": "for-sale"})
df = pd.DataFrame(r.json())[["zinc_id", "smiles", "mwt", "logp"]]
print(df.head())
```

下载 tranche（SMILES）/ 单体 SDF：

```python
def download_tranche(name, dest, fmt="smi"):
    r = requests.get(f"{BASE}/tranches/{name}.{fmt}", stream=True); r.raise_for_status()
    with open(dest, "wb") as f:
        for chunk in r.iter_content(8192): f.write(chunk)

download_tranche("AABA", "zinc_AABA.smi")           # tranche 命名见 /tranches/home

for zid in ["ZINC000000029632", "ZINC000001532592"]:  # 取 3D SDF 给对接
    r = requests.get(f"{BASE}/substances/{zid}.sdf")
    if r.ok: open(f"{zid}.sdf", "w").write(r.text)
```

建对接库（过滤 → 去重 → 导出 .smi）：

```python
params = {"mwt__gte": 200, "mwt__lte": 500, "logp__gte": -1, "logp__lte": 5,
          "hbd__lte": 5, "hba__lte": 10, "rotatable_bonds__lte": 10,
          "availability": "for-sale", "count": 200}
df = pd.DataFrame(requests.get(f"{BASE}/substances.json", params=params).json())
df = df[["zinc_id", "smiles", "mwt", "logp", "hbd", "hba"]].drop_duplicates(subset=["smiles"])
df[["smiles", "zinc_id"]].to_csv("docking_library.smi", sep=" ", index=False, header=False)
print(f"独立化合物: {len(df)}")
```

片段库（三规则，FBDD）：

```python
params = {"mwt__lte": 300, "logp__lte": 3, "hbd__lte": 3, "hba__lte": 3,
          "rotatable_bonds__lte": 3, "availability": "for-sale", "count": 200}
df = pd.DataFrame(requests.get(f"{BASE}/substances.json", params=params).json())
df[["smiles", "zinc_id"]].to_csv("fragment_library.smi", sep=" ", index=False, header=False)
```

## 注意事项

关键参数：`mwt__gte`/`mwt__lte`（分子量 Da）、`logp__gte`/`logp__lte`（脂溶性）、`hbd__lte`（氢键供体上限）、`hba__lte`（受体上限）、`rotatable_bonds__lte`（可旋转键上限）、`availability`（`for-sale`/`in-stock`/`on-demand`，缺省取全部）、`count`（1–1000，缺省 10）、`similarity`（0.0–1.0，Tanimoto 阈值）。

可购买等级：`for-sale`=≥1 家供应商可售；`in-stock`=现货可即购；`wait-ok`=可接受较长交期；`on-demand`=需定制合成。

tranche 机制：化合物按 MW（行 A–K，<200 到 >600 Da）× logP（列 A–J，<-1 到 >5）二维网格分块，每块可下 SMILES/SDF——大规模对接定向下整块比 API 翻页快。tranche 命名见 `https://zinc15.docking.org/tranches/home`。

最佳实践：① 排除反应性基团（`reactivity` 标记，细胞实验前用 `clean` 过滤）；② 数据周期性更新，下载文件加日期戳缓存，避免项目内重复下载；③ 对接前再叠加 RDKit PAINS/Brenk 过滤。

常见排错：

- HTTP 404（化合物 ID）：ZINC ID 格式不对——用完整 12 位（如 `ZINC000000029632`）。
- 性质搜索空集：过滤太严——放宽范围；检查 `mwt__gte < mwt__lte` 没写反。
- 相似性搜索无结果：SMILES 非法或骨架罕见——先用 RDKit 校验/规范化，或降 `similarity` 阈值。
- tranche 下载失败：tranche 代码错——在 `/tranches/home` 核对命名。
- API 返回 HTML 错误页：服务维护——几分钟后重试，查 ZINC 状态。
- 大下载缓慢：化合物集太大——改用 tranche/subset 批量下载，别 API 翻页。

参考：[ZINC15 官网](https://zinc15.docking.org/)、[ZINC15 REST API](https://zinc15.docking.org/api/)、[tranche 下载页](https://zinc15.docking.org/tranches/home)、[ZINC22 论文 Irwin et al. JCIM 2022](https://doi.org/10.1021/acs.jcim.2c00852)。

## 互见

- `cheminformatics-toolkit` — 下载后算属性、canonical SMILES 去重、PAINS/Brenk 过滤。
- `autodock-vina-docking` — 用导出的 SMILES/SDF 做分子对接虚拟筛选。
- `pubchem-compound-search` — 按名称/标识符查权威理化属性与已上市化合物。
- `chembl-bioactivity-database` — ZINC 命中物的靶点生物活性数据。

---

采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0）。
