---
name: string-ppi-database
title: STRING 蛋白互作网络查询
description: 当需要检索蛋白-蛋白互作（PPI）网络、做 GO/KEGG/Pfam 功能富集、发现互作伙伴、检验一组蛋白是否构成显著功能模块或导出网络图时使用；用纯 requests 调 STRING REST API（5000+ 物种）产出网络边表、富集结果与 PNG/SVG 图。不适用于化合物-蛋白互作（用 chembl-bioactivity-database）或通路中心查询（用 kegg-database）。触发词：STRING、PPI、蛋白互作、互作网络、互作伙伴、功能富集、ppi_enrichment、hub 蛋白
domain: 领域/science
triggers: [STRING, PPI, 蛋白互作, 蛋白质相互作用, 互作网络, 互作伙伴, interaction partners, 功能富集, GO 富集, KEGG 富集, ppi_enrichment, 网络富集, hub 蛋白, 网络可视化, get_string_ids, 同源性]
tags: [science, systems-biology, network-biology, ppi, protein-interaction, enrichment, database, rest-api, string]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [requests, pandas, STRING REST API]
requires: []
related: [reactome-pathway-database, uniprot-protein-database, quickgo-go-database, kegg-database]
combines_with: [gene-set-enrichment-analysis, networkx-graph-analysis]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

当你需要从 STRING（5900 万+ 蛋白、200 亿+ 互作、5000+ 物种）检索蛋白-蛋白互作（PPI）数据时使用本技能。典型场景：

- 检索单个或多个蛋白的互作网络（功能型 functional / 物理型 physical）
- 对蛋白列表做功能富集（GO、KEGG、Pfam、InterPro、UniProt Keywords）
- 从种子蛋白发现互作伙伴、扩展网络
- 检验一组蛋白是否构成**显著富集的功能模块**（PPI enrichment）
- 生成按证据着色的网络图（PNG/SVG）
- 分析跨物种同源/蛋白家族关系、识别 hub 蛋白与连通模式

**不该用本技能的边界：**
- 化合物-蛋白生物活性互作（IC50/Ki，化学小分子）→ 用 `chembl-bioactivity-database`
- 以通路为中心的查询（通路成员、通路图、ID 转换）→ 用 `kegg-database`
- 拿到网络后做图论分析/中心性/社区发现/可视化布局 → 用 `networkx-graph-analysis`

## 步骤 / 指令

1. **准备环境**：`pip install requests`（唯一必需），表格分析另装 `pandas`。无需 API key。无硬性速率限制，但每次调用间 `time.sleep(1)`；蛋白组规模分析改用 STRING 批量下载（https://string-db.org/cgi/download），勿用 API 循环。

2. **统一调用器**（所有端点共用，`fmt` 切换输出格式）：
   ```python
   import requests, time
   STRING_API = "https://string-db.org/api"
   def string_query(endpoint, params, fmt="tsv"):
       url = f"{STRING_API}/{fmt}/{endpoint}"
       params.setdefault("caller_identity", "everything_skills")
       r = requests.get(url, params=params); r.raise_for_status()
       time.sleep(1)            # 限速
       return r.text
   ```

3. **先映射标识符**（强烈建议第一步）：用 `get_string_ids` 把基因名映射成 STRING ID。STRING ID 格式 `{taxonId}.{ensemblProteinId}`（如人类 TP53 = `9606.ENSP00000269305`），后续查询用 ID 更快、更准。

4. **选端点 + 拼参数**。核心端点（`endpoint` 取值）：

   | 端点 | 作用 | 关键参数 |
   |---|---|---|
   | `get_string_ids` | 基因名→STRING ID | `limit`(每项匹配数)、`echo_query` |
   | `network` | 取互作网络（边表） | `required_score`、`network_type`、`add_nodes` |
   | `interaction_partners` | 某蛋白的 top 互作伙伴 | `limit`、`required_score` |
   | `enrichment` | GO/KEGG/Pfam 富集（Fisher + BH-FDR） | — |
   | `ppi_enrichment` | 检验是否构成显著网络 | `required_score`（取 `fmt="json"`） |
   | `homology` | 蛋白间同源性打分 | — |
   | `version` | STRING 版本（写方法学用） | — |
   | `image/network` | 网络图（二进制 PNG/SVG，**非文本**） | `network_flavor`、`required_score` |

5. **必带 `species`**（NCBI taxon ID）：9606 人、10090 小鼠、10116 大鼠、7227 果蝇、6239 线虫、4932 酵母、3702 拟南芥、7955 斑马鱼、511145 大肠杆菌。**>10 个蛋白的网络查询缺 species 会报错**，建议任何查询都显式带上。

6. **选置信度阈值 `required_score`（0-1000，综合 7 个证据通道）**：150 探索性、**400 标准（默认）**、700 高置信（发表常用）、900 极严。

7. **选网络类型 `network_type`**：`functional`（默认，所有证据，适合通路/富集/系统生物学）或 `physical`（仅直接结合证据，适合结构/复合物分析）。

8. **解析输出**：TSV 用 `pd.read_csv(io.StringIO(text), sep='\t')`；JSON 用 `json.loads`；图像端点返回二进制，用 `requests.get(...).content` 写文件。`identifiers` 多蛋白用 `%0d` 连接（URL）或 `\n`（POST body）。

## 示例

**快速上手 — 映射 ID + 取网络：**

```python
import requests, time, io, json, pandas as pd
STRING_API = "https://string-db.org/api"
def string_query(endpoint, params, fmt="tsv"):
    r = requests.get(f"{STRING_API}/{fmt}/{endpoint}",
        params={**params, "caller_identity": "everything_skills"})
    r.raise_for_status(); time.sleep(1); return r.text

# 1) 基因名 → STRING ID（务必先做）
ids = string_query("get_string_ids",
    {"identifiers": "TP53\nBRCA1\nEGFR", "species": 9606, "echo_query": 1})
df = pd.read_csv(io.StringIO(ids), sep='\t')
print(dict(zip(df['queryItem'], df['stringId'])))  # {'TP53':'9606.ENSP00000269305', ...}

# 2) 取互作网络（required_score=400 标准阈值）
net = string_query("network", {
    "identifiers": "TP53%0dBRCA1%0dMDM2%0dATM%0dCHEK2",
    "species": 9606, "required_score": 400, "network_type": "functional"})
ndf = pd.read_csv(io.StringIO(net), sep='\t')
print(f"{len(ndf)} 条互作")
print(ndf[['preferredName_A', 'preferredName_B', 'score']].head())
```

**互作伙伴 + 网络扩展：**

```python
# 某蛋白 top-20 互作伙伴（高置信）
p = string_query("interaction_partners",
    {"identifiers": "TP53", "species": 9606, "limit": 20, "required_score": 700})
# 从种子蛋白扩展：add_nodes 拉入 10 个最相连的蛋白
exp = string_query("network",
    {"identifiers": "TP53", "species": 9606, "add_nodes": 10, "required_score": 700})
```

**功能富集（GO/KEGG/Pfam，Fisher + BH-FDR）：**

```python
en = string_query("enrichment", {
    "identifiers": "TP53%0dMDM2%0dATM%0dCHEK2%0dBRCA1%0dATR%0dTP73", "species": 9606})
edf = pd.read_csv(io.StringIO(en), sep='\t')          # 列：category, term, description, p_value, fdr ...
sig = edf[edf['fdr'] < 0.05]
for cat, g in sig.groupby('category'):                # 按 GO/KEGG/Pfam 分组
    print(cat, len(g), g.iloc[0]['description'])
```

**PPI 富集检验（是否构成显著功能模块）：**

```python
d = json.loads(string_query("ppi_enrichment",
    {"identifiers": "TP53%0dMDM2%0dATM%0dCHEK2%0dBRCA1", "species": 9606,
     "required_score": 400}, fmt="json"))
print(d['number_of_edges'], d['expected_number_of_edges'], d['p_value'])
# p < 0.05 → 这组蛋白的互作显著多于随机，构成富集网络
```

**导出网络图（二进制 PNG）：**

```python
img = requests.get(f"{STRING_API}/image/network", params={
    "identifiers": "TP53%0dMDM2%0dATM%0dCHEK2%0dBRCA1", "species": 9606,
    "required_score": 700, "network_flavor": "evidence",   # evidence|confidence|actions
    "caller_identity": "everything_skills"}).content
open("network.png", "wb").write(img)
```

**跨物种比较（注意同源基因符号不同）：**

```python
for sp, name, gene in [(9606, "Human", "TP53"), (10090, "Mouse", "Trp53")]:
    n = string_query("network",
        {"identifiers": gene, "species": sp, "required_score": 700, "add_nodes": 5})
    print(name, gene, len(pd.read_csv(io.StringIO(n), sep='\t')), "条互作")
```

## 注意事项

- **先映射 ID**：任何操作前用 `get_string_ids`，STRING ID（`9606.ENSP...`）比基因名更快更准，也能提前发现拼写/物种错误。
- **每次调用限速 1 秒**：`time.sleep(1)`，避免被限流；批量请求按 50-100 蛋白分批，蛋白组规模改用批量下载。
- **必带 `species`**：>10 蛋白网络缺 species 直接报 "Species required"；任何查询都建议显式带上。
- **空网络 / 查不到蛋白**：多半是阈值太严或物种/拼写错——先降 `required_score`、用 `get_string_ids` 核对映射、确认物种 taxon ID。
- **富集需要 ≥5 个蛋白**才有意义，蛋白太少返回空结果。
- **图像端点是二进制**：`/image/network` 用 `.content` 写文件；当作文本解析会乱码。
- **400 Bad Request**：多蛋白须用 `%0d`（URL）或 `\n`（POST）分隔并 URL 编码特殊字符。
- **network_type 选错会得到不同结果**：通路/富集用 `functional`，结构/复合物用 `physical`。
- **可复现性**：方法学里写明 STRING 版本——`string_query("version", {})`，记成 "STRING vX, accessed <date>"。
- **跨物种同源基因符号不同**：人 `TP53` ↔ 鼠 `Trp53`，比较前先各自映射。

## 互见

- `uniprot-protein-database` — 取蛋白序列/功能注释，补全 STRING 节点的蛋白信息
- `kegg-database` — 以通路为中心的查询，与 STRING 富集互补
- `gene-set-enrichment-analysis` — 更通用的 ORA/GSEA 富集（自定义基因集、排序表）
- `networkx-graph-analysis` — 对 STRING 网络做中心性、社区发现、布局与可视化
- `opentargets-database` — 把蛋白互作模块关联到疾病-靶点证据
- `chembl-bioactivity-database` — 化合物-靶点生物活性（化学互作，本技能不覆盖）
- `alphafold-database-access` — 对互作蛋白取三维结构

参考：STRING 官网 https://string-db.org ｜ API 文档 https://string-db.org/help/api/ ｜ 批量下载 https://string-db.org/cgi/download ｜ 物种全表 https://string-db.org/cgi/input?input_page_active_form=organisms

---

采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0）。
