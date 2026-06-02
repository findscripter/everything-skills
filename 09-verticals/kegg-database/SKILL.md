---
name: kegg-database
title: KEGG 通路与化合物数据库
description: 当需查 KEGG 通路/基因/化合物/药物、在 KEGG↔NCBI/UniProt/PubChem 转 ID、查药物相互作用或取通路富集背景时使用；requests 直连 REST API（七操作）产出基因集与 FASTA/MOL/PNG。不适用于多库 Python 聚合（用 gget-genomic-databases）。触发词：KEGG、通路、pathway、ID 转换、富集
domain: 领域/science
triggers: [KEGG, pathway, 通路, 代谢通路, hsa, KO orthology, ID 转换, conv, link, ddi, 药物相互作用, 富集背景, gene-set, 化合物, reaction, enzyme, KGML]
tags: [science, 生物信息学, 通路分析, KEGG, REST-API, 基因, 化合物, ID 转换]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Bash, requests]
requires: []
related: [gget-genomic-databases, uniprot-protein-database, pubchem-compound-search, gene-set-enrichment-analysis, scientific-database-lookup, opentargets-database]
combines_with: [gene-set-enrichment-analysis, gget-genomic-databases, pubchem-compound-search]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

适用：

- 把基因映射到生物通路（如「TP53 参与哪些通路？」），或反查通路里的基因/化合物/酶。
- 取代谢通路详情、基因清单、化合物结构、KGML/通路图。
- 在 KEGG、NCBI Gene、UniProt、PubChem、ChEBI 之间转标识符。
- 查 KEGG 药理库里的药物-药物相互作用（DDI）。
- 构建通路富集背景（一物种全部通路 → 各通路基因集），供下游富集工具。
- 跨表交叉引用化合物、反应、酶、通路、KO 直系同源组。

不该用（负边界）：

- **纯 Python 多库聚合**（一脚本同时查 KEGG + UniProt + Ensembl）——用 `gget-genomic-databases` 或 `bioservices`。
- **本地化学信息学**（指纹、描述符、子结构）——用 `cheminformatics-toolkit`。
- **通路可视化/上色**——直接用 KEGG Mapper（https://www.kegg.jp/kegg/mapper/）。
- **跑富集统计本身**（超几何/GSEA 打分）——本技能只供基因集背景，统计交 `gene-set-enrichment-analysis`。

## 步骤 / 指令

1. 环境：仅需 `requests`，**无需鉴权**；pixi/conda 内用 `pixi run python ...`。
   ```bash
   pip install requests
   ```
2. 固定 URL 语法（所有响应都是制表符分隔文本，无 query 参数）：
   ```
   https://rest.kegg.jp/<operation>/<arg1>/<arg2>...
   ```
   七个 operation：`info`（库元信息）、`list`（列条目）、`find`（关键词/属性搜）、`get`（取完整条目）、`conv`（ID 转换）、`link`（交叉引用）、`ddi`（药物相互作用）。
3. **先 list/find 再 get**：用 `list`/`find` 枚举 ID，再 `get` 取具体条目；不要整库下载。
4. **批量用 `+` 拼接**：`get`/`list`/`conv`/`link`/`ddi` 单次最多 **10 个**条目（`hsa:10458+hsa:10459`）；`image`/`kgml`/`json` 格式**只接受 1 个**。
5. **优先物种专属通路 ID**：分析已知物种时用 `hsa00010`（人糖酵解，含物种基因映射），别用 `map00010`（参考通路，泛化无基因）。
6. **批量请求间加延时**：无硬性限流，但 `time.sleep(0.5)` 防服务端节流；遇 403 加到 1s 并降并发。
7. **统一解析制表符**：响应一律 `\t` 分字段、`\n` 分记录；split 前先 `.strip()`。
8. **学术用途专属**：商业使用需另购 KEGG 许可。

## 示例

快速上手（基因 → 通路 → 详情）：

```python
import requests
BASE = "https://rest.kegg.jp"

def kegg(op, *args):
    r = requests.get(f"{BASE}/{op}/{'/'.join(args)}")
    r.raise_for_status()
    return r.text

# TP53(hsa:7157) 所在通路
print(kegg("link", "pathway", "hsa:7157")[:200])
# hsa:7157	path:hsa04010 ...
# 取某通路完整条目
print(kegg("get", "hsa04110")[:300])
```

列出与搜索（`list` / `find`）：

```python
# 人类全部通路（path:hsaXXXXX \t 名称）
for line in kegg("list", "pathway", "hsa").strip().split("\n")[:3]:
    pid, name = line.split("\t"); print(pid, name)

# 关键词搜基因 / 分子式精确匹配 / 精确质量区间
kegg("find", "genes", "p53")
kegg("find", "compound", "C7H10N4O2", "formula")   # /formula 精确
kegg("find", "drug", "300-310", "exact_mass")      # /exact_mass 区间；另有 /mol_weight
```

取条目的多种格式（`get`）：

```python
seq = kegg("get", "hsa:10458", "aaseq")            # 蛋白 FASTA；ntseq=核酸
mol = kegg("get", "cpd:C00002", "mol")             # ATP 的 MOL 结构
# 通路图 PNG（单条目，二进制）
img = requests.get(f"{BASE}/get/hsa05130/image").content
open("pathway.png", "wb").write(img)
# 其余格式：kcf / kgml(XML) / json，均仅限 1 条目
```

ID 转换（`conv`，支持 ncbi-geneid / ncbi-proteinid / uniprot / pubchem / chebi）：

```python
print(kegg("conv", "uniprot", "hsa:10458").strip())          # KEGG → UniProt
print(kegg("conv", "hsa", "ncbi-geneid:7157").strip())       # 反向：NCBI → KEGG(TP53)
all_map = kegg("conv", "ncbi-geneid", "hsa")                 # 全物种批量（结果大，建议本地缓存）
```

交叉引用（`link`）+ 药物相互作用（`ddi`）：

```python
# 糖酵解通路里的基因 / 某基因映射到 KO
genes = kegg("link", "genes", "hsa00010")
ko    = kegg("link", "ko", "hsa:10458").strip()
# 药物-药物相互作用：单药全部 / 两两组合（≤10，+ 拼接）
ddi = kegg("ddi", "D00001+D00002+D00003")
```

富集背景（一物种全通路 → 基因集字典）：

```python
import time
pathways = {l.split("\t")[0].replace("path:", ""): l.split("\t",1)[1]
            for l in kegg("list", "pathway", "hsa").strip().split("\n")}
gene_sets = {}
for pid in list(pathways)[:3]:        # 演示前 3 个；全量记得加缓存
    txt = kegg("link", "genes", pid)
    gene_sets[pid] = [x.split("\t")[1] for x in txt.strip().split("\n") if x]
    time.sleep(0.5)
```

解析 KEGG 平文件条目（NAME/DESCRIPTION 等字段在前 12 列）：

```python
def parse_entry(text):
    entry, key = {}, None
    for line in text.split("\n"):
        if line.startswith("///"): break
        if line[:12].strip():            # 新字段
            key = line[:12].strip(); entry[key] = line[12:].strip()
        elif key:                         # 续行
            entry[key] += "\n" + line[12:].strip()
    return entry
p = parse_entry(kegg("get", "hsa00010"))
print(p.get("NAME"))
```

## 注意事项

标识符格式：

| 类型 | 格式 | 例 |
|---|---|---|
| 参考通路（泛化） | `map#####` | `map00010` 糖酵解 |
| 物种通路 | `{org}#####` | `hsa00010` 人糖酵解 |
| 基因 | `{org}:{number}` | `hsa:7157` TP53 |
| 化合物 | `cpd:C#####` | `cpd:C00002` ATP |
| 药物 | `dr:D#####` | `dr:D00001` |
| 酶 | `ec:{EC}` | `ec:1.1.1.1` |
| KO 直系同源 | `ko:K#####` | `ko:K00001` |

常用物种代码：`hsa`（人）、`mmu`（鼠）、`dme`（果蝇）、`sce`（酵母）、`eco`（大肠杆菌）。常用库：`pathway`/`module`/`brite`/`genes`/`compound`/`glycan`/`reaction`/`enzyme`/`disease`/`drug`/`ko`。`link` 常用方向：基因↔pathway、pathway↔compound、pathway↔enzyme、基因↔ko。

常见排错：

- HTTP 404：ID 格式或物种代码错——先 `list` 核对有效 ID。
- HTTP 400：URL 拼错——路径形如 `/{op}/{arg1}/{arg2}`，**不要带 query 参数**。
- 空响应：搜索词过窄或物种代码不符——放宽关键词、试部分匹配。
- image/kgml/json 报错：这些格式**只接受 1 条目**——去掉 `+` 拼接。
- HTTP 403：服务端节流——`time.sleep(1)`、降批量频率。
- 返回的基因 ID 不对：误用了参考通路 `map00010`——基因映射须用物种前缀 `hsa00010`。
- conv 返回空：并非所有条目都有 UniProt/NCBI 映射，属正常；先 `list` 确认覆盖。
- 中文/非 ASCII 乱码：用 `resp.text`（requests 自动判码）或显式 `resp.encoding='utf-8'`。

参考：[KEGG REST API 文档](https://www.kegg.jp/kegg/rest/keggapi.html)、[KEGG 主站](https://www.kegg.jp/)、[物种代码表](https://www.kegg.jp/kegg/catalog/org_list.html)；Kanehisa M. et al. (2023) *Nucleic Acids Research* 51:D483-D489。

## 互见

- requires：无。
- related：`gget-genomic-databases` —— Python 统一接口聚合 Ensembl/NCBI/UniProt，基因级查询无需 KEGG 通路背景时用它；`uniprot-protein-database`、`pubchem-compound-search`、`opentargets-database` —— 跨库 ID 衔接（`conv` 取 UniProt/PubChem CID 后下钻）。
- combines_with：`gene-set-enrichment-analysis` —— 本技能供通路基因集背景，由它跑超几何/GSEA 统计；`pubchem-compound-search` —— 用 `conv pubchem cpd:Cxxxx` 把 KEGG 化合物桥接到 PubChem 取理化属性。

---

采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0）。
