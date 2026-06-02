---
name: metabolomics-workbench-database
title: Metabolomics Workbench 代谢组库
description: 当需要从 Metabolomics Workbench（NIH 4200+ 代谢组学研究）按 ID 查代谢物、按物种/疾病发现研究、做 RefMet 名称归一、用 m/z 前体匹配候选化合物时使用；做 REST API 查询并产出化合物记录/研究列表/m/z 候选表（DataFrame/CSV）；不适用于本地 HMDB XML 解析（用 hmdb-database）或通用化合物属性查询（用 pubchem-compound-search）。触发词：Metabolomics Workbench、RefMet、moverz、代谢组学研究、m/z 匹配、mwTab
domain: 领域/science
triggers: [Metabolomics Workbench, RefMet, moverz, 代谢组学研究, m/z 匹配, mwTab, 代谢物 ID 转换, ST000001]
tags: [databases, metabolomics, proteomics, rest-api]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, requests, pandas]
requires: []
related: [hmdb-metabolome-database, matchms-spectral-matching, pyopenms-mass-spectrometry, maxquant-proteomics]
combines_with: [pubchem-compound-search]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
# Metabolomics Workbench 代谢组库

## 何时使用

需要查询 UCSD 托管、NIH Common Fund 资助的 Metabolomics Workbench（MW）4200+ 代谢组学研究时使用。典型场景：

- 按 PubChem CID / KEGG ID / InChIKey / HMDB ID / 分子式 / SMILES 查代谢物记录。
- 按物种、疾病、作者(last_name)、机构、分析类型发现研究。
- 把任意写法的代谢物名归一到 RefMet 标准命名，用于跨研究整合。
- 从 MS 实测 m/z 值做加合物感知的候选化合物匹配（moverz）。
- 拉取某研究的代谢物表 / 丰度表，或下载 mwTab 原始文件。
- 查询与代谢通路关联的基因/蛋白注释。

**不该用**：

- 本地解析 22 万条 HMDB XML（含 NMR/MS 谱图）→ 用 `hmdb-database`。
- 1.1 亿化合物的在线属性查询 → 用 `pubchem-compound-search`。

无需鉴权；公开访问。Base URL：`https://www.metabolomicsworkbench.org/rest`。URL 模式：`/{context}/{input_item}/{input_value}/{output_item}/{format}`。

## 步骤 / 指令

依赖：`pip install requests pandas`。批量循环里加 `time.sleep(0.3)`（服务器共享，无公开限频）。

牢记 4 条核心约束（实测踩坑，决定调用对错）：

1. **`compound/name/{x}` 被服务端拒绝**——`name` 不是合法 input_item。自由文本先走 `refmet/match/{x}` 归一，再用返回的 `refmet_name` 或 `pubchem_cid` 取记录。合法 input_item：`regno`/`formula`/`inchi_key`/`lm_id`/`pubchem_cid`/`hmdb_id`/`kegg_id`/`smiles`/`abbrev`。
2. **`refmet/name/{x}/all` 要求规范 RefMet 名**（区分大小写，如 `Glucose` 而非 `D-glucose`）；非规范名返回空列表。先用 `refmet/match` 模糊归一。
3. **`moverz/{REFMET|LIPIDS|MB}/{mz}/{ion}/{tol}/txt` 只返回 TSV 文本**，无 JSON 变体。用 `pd.read_csv(io.StringIO(r.text), sep="\t")` 解析，**切勿** `.json()`。第一段是数据库选择器，不是 `mz`。
4. **`study/.../summary` 默认就是 JSON**——**不要**追加 `/json`，否则翻转成 TSV。旧的 `metstat/filter/...` 返回 `[]` 已失效，改用 `study/{...}/{value}/summary` + 客户端过滤。

输出类型约定：`output=summary` 当标识唯一（如 `study_id`）返回 dict，否则（如 `last_name`/`institute`）返回 list；按 `formula` 查化合物返回分页 dict（键 `'1','2',...`），用 `dict.values()` 或 `pd.DataFrame.from_dict(d, orient="index")` 迭代。

各 context 合法 input_item：

| context | 合法 input_item | 备注 |
|---|---|---|
| `compound` | `regno`,`formula`,`inchi_key`,`lm_id`,`pubchem_cid`,`hmdb_id`,`kegg_id`,`smiles`,`abbrev` | `name` 被拒，先走 `refmet/match` |
| `refmet` | `match`,`name`,`formula`,`exactmass`,`inchi_key`,`pubchem_cid`,`regno` | `match` 模糊；`name` 要规范名 |
| `study` | `study_id`,`study_title`,`last_name`,`institute`,`analysis_id`,`metabolite_id`,`kegg_id`,`refmet_name` | summary 类型随标识唯一性 dict/list |
| `moverz` | 路径段 `REFMET`/`LIPIDS`/`MB` | 首段是 DB 不是 mz |
| `gene` | `gene_id`,`gene_symbol`,`gene_name`,`mgp_id` | 返回 dict |
| `protein` | `mgp_id`,`gene_id`,`uniprot_id`,`gene_symbol` | 返回 dict |

## 示例

```python
import requests, io, pandas as pd, time
BASE = "https://www.metabolomicsworkbench.org/rest"

# 1) 按 ID 直查化合物（PubChem CID / KEGG / InChIKey 同理）
r = requests.get(f"{BASE}/compound/pubchem_cid/5793/all/json", timeout=30)
g = r.json()
print(g["name"], g["formula"], g.get("hmdb_id"), g.get("kegg_id"))

# 2) 自由文本 → RefMet 归一 → 全记录（两步，因 compound/name 被拒）
def resolve(text):
    m = requests.get(f"{BASE}/refmet/match/{text}", timeout=30).json()
    if not m.get("refmet_name"):
        return None
    name = m["refmet_name"]                       # 如 'alpha-D-glucose' -> 'Glucose'
    full = requests.get(f"{BASE}/refmet/name/{name}/all", timeout=30).json()
    return full if isinstance(full, dict) and full else None  # 含 pubchem_cid/inchi_key

rec = resolve("alpha-D-glucose")
print(rec["refmet_name"], rec["pubchem_cid"], rec["inchi_key"])

# 3) m/z 前体匹配（moverz 只出 TSV）
def moverz(db, mz, ion, tol=0.005):
    assert db in {"REFMET", "LIPIDS", "MB"}
    r = requests.get(f"{BASE}/moverz/{db}/{mz}/{ion}/{tol}/txt", timeout=30)
    r.raise_for_status()
    return pd.read_csv(io.StringIO(r.text), sep="\t")   # 切勿 .json()

df = moverz("REFMET", 180.063, "M+H", 0.005)
print(len(df), df.head().to_string(index=False))

# 4) 找检出某代谢物的研究，再用 study_id 富集标题/物种
def studies_with(refmet_name, n=20):
    r = requests.get(f"{BASE}/study/refmet_name/{refmet_name}/summary", timeout=60)
    r.raise_for_status()
    d = r.json()
    rows = list(d.values()) if isinstance(d, dict) else d
    ids = sorted({x["study_id"] for x in rows if x.get("study_id")})
    enriched = [requests.get(f"{BASE}/study/study_id/{s}/summary", timeout=30).json()
                for s in ids[:n]]
    return pd.DataFrame(enriched)

print(studies_with("Glucose").groupby("species").size().sort_values(ascending=False).head())

# 5) 拉某研究的代谢物表 / 基因注释
mt = requests.get(f"{BASE}/study/study_id/ST000001/metabolites", timeout=60).json()
print(len(mt))
gene = requests.get(f"{BASE}/gene/gene_symbol/HMGCR/all", timeout=30).json()
print(gene.get("gene_symbol"), gene.get("mgp_id"))
```

MS 峰列表批量注释（加 `time.sleep(0.3)`）：

```python
def annotate_peaks(mz_values, ion="M+H", tol=0.005):
    out = []
    for mz in mz_values:
        r = requests.get(f"{BASE}/moverz/REFMET/{mz}/{ion}/{tol}/txt", timeout=30)
        if r.status_code != 200 or not r.text.strip():
            time.sleep(0.3); continue
        for _, row in pd.read_csv(io.StringIO(r.text), sep="\t").iterrows():
            out.append({"query_mz": mz, "name": row["Name"],
                        "formula": row["Formula"], "ion": row["Ion"]})
        time.sleep(0.3)
    return pd.DataFrame(out)

annotate_peaks([180.063, 166.086, 90.055]).to_csv("ms_annotations.csv", index=False)
```

## 注意事项

- `refmet/match` 返回的是轻量记录，**不含** `pubchem_cid`/`inchi_key`；要全 ID 必须再调 `refmet/name/{refmet_name}/all`。
- `moverz` 报 `JSONDecodeError` = 你误用了 `.json()`，改 `pd.read_csv(..., sep="\t")`。
- 报错 `This input item (name) is not allowed...` = 你用了 `compound/name/...`，改走 `refmet/match` 或换合法 input_item。
- `study/.../summary` 返回 TSV 而非 JSON = 你多加了 `/json` 后缀，去掉它。
- ion 取值：`M+H`、`M-H`、`M+Na`、`M+K` 等；tolerance 单位 Da。
- 批量请求务必 `time.sleep(0.3)`，服务器共享。

## 互见

- related：`hmdb-database` —— 本地 HMDB XML（含谱图、疾病关联）的离线查询替代。
- related：`pubchem-compound-search` —— 1.1 亿化合物的通用属性查询。
- combines_with：`kegg-database` —— 通路/直系同源数据补充 MW 的研究/代谢物命中。
- combines_with：`chembl-database-bioactivity` —— 同一批化合物的生物活性数据。

---
采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0）。
