---
name: uniprot-protein-database
title: UniProt 蛋白序列与注释数据库
description: 当需要按基因/蛋白名/物种检索蛋白、取 FASTA 序列、跨库映射 ID（Ensembl/PDB/RefSeq/KEGG）或读取 Swiss-Prot 功能注释（GO/结构域/PTM）时使用；通过 UniProt REST API 完成检索、取序、批量/流式下载与 ID 映射并产出 TSV/JSON/FASTA。不适用于取 3D 结构（用 AlphaFold/PDB）或一站式多库访问（用 bioservices）。触发词：UniProt、蛋白序列、ID映射
domain: 领域/science
triggers: [UniProt, 蛋白序列检索, FASTA 下载, ID 映射, Swiss-Prot 注释, GO 注释提取, 按基因名查蛋白, 蛋白 accession, REST API 查蛋白, 跨库 ID 转换]
tags: [生物信息, 蛋白质组, 数据库, REST-API, 序列检索, ID映射, 注释, Python]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [requests, pandas, UniProt REST API]
requires: []
related: [gget-genomic-databases, alphafold-database-access, scientific-database-lookup, protein-language-models]
combines_with: [gget-genomic-databases, alphafold-database-access, protein-language-models]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

适用：
- 按基因名、accession、物种或功能关键词检索蛋白。
- 以 FASTA 取序，供下游比对/嵌入/建模。
- 在 UniProt 与 Ensembl / PDB / RefSeq / KEGG 之间互转 ID。
- 读取注释：GO 条目、结构域、翻译后修饰（PTM）、亚细胞定位、功能描述。
- 批量取多条目做比较分析，或下载某物种全部「已审阅（Swiss-Prot）」数据集。

不该用（负边界）：
- 取蛋白 3D 结构 → 用 `alphafold-database-access` 或 `pdb-database`。
- 一站式访问 40+ 数据库 → 用 `bioservices`。
- 仅做快速跨库基因/蛋白查找 → 可用 `gget-genomic-databases`。

关键概念：Swiss-Prot 条目为人工审编（高置信），TrEMBL 为算法预测；要高质量注释务必加 `reviewed:true`。

## 步骤

1. 装依赖：`pip install requests pandas`。
2. 选端点：单查/小结果用 `/uniprotkb/search`（带 `size` 与 `Link` 头分页）；大结果（>1万）用 `/uniprotkb/stream`（无需翻页）。
3. 写查询：用 UniProt 查询语法组合布尔与字段过滤，**总是加 `organism_id` 与 `reviewed:true` 收窄范围**。
4. 选输出：表格分析用 `format=tsv` + `fields=...`（比全量 JSON 更快更易解析）。
5. 取序/取条目：按 accession 命中 `/uniprotkb/{acc}` 或 `/uniprotkb/{acc}.fasta`。
6. ID 映射：`/idmapping/run` 提交异步任务 → 轮询 `/status/{jobId}` → 取 `/results/{jobId}`。
7. 批量请求间加 `time.sleep(0.5)` 限速；单 ID 映射任务上限 10 万 ID。

## 指令

检索（TSV + 指定字段）：
```python
import requests
BASE = "https://rest.uniprot.org/uniprotkb/search"

def search_uniprot(query, fields=None, fmt="json", size=25):
    params = {"query": query, "format": fmt, "size": size}
    if fields:
        params["fields"] = ",".join(fields)
    r = requests.get(BASE, params=params); r.raise_for_status()
    return r.json() if fmt == "json" else r.text
```

查询语法要点：
```
kinase AND organism_id:9606            # 人类激酶
(diabetes OR insulin) AND reviewed:true
cancer NOT lung
gene:BRCA1   accession:P12345   go:0005515
length:[100 TO 500]   mass:[50000 TO 100000]
gene:BRCA*                             # 通配
```

取单条目 / FASTA：
```python
def get_protein(acc, fmt="json"):
    url = f"https://rest.uniprot.org/uniprotkb/{acc}"
    r = requests.get(url, headers={"Accept": f"application/{fmt}"}); r.raise_for_status()
    return r.json() if fmt == "json" else r.text

fasta = requests.get("https://rest.uniprot.org/uniprotkb/P01308.fasta").text
```

ID 映射（异步任务）：
```python
import requests, time
def map_ids(ids, from_db, to_db):
    r = requests.post("https://rest.uniprot.org/idmapping/run",
                      data={"from": from_db, "to": to_db, "ids": ",".join(ids)})
    r.raise_for_status(); job = r.json()["jobId"]
    while True:
        s = requests.get(f"https://rest.uniprot.org/idmapping/status/{job}").json()
        if "results" in s or "failedIds" in s: break
        time.sleep(1)
    return requests.get(f"https://rest.uniprot.org/idmapping/results/{job}").json()
# 常用库代码：UniProtKB_AC-ID, Ensembl, RefSeq_Protein, PDB, Gene_Name, GeneID, KEGG
```

游标分页（跟 `Link` 头取下一页）：
```python
url = "https://rest.uniprot.org/uniprotkb/search"
while url:
    resp = requests.get(url, params=params); resp.raise_for_status()
    params = {}  # 游标已嵌入下一页 URL
    link = resp.headers.get("Link", "")
    url = link.split("<")[1].split(">")[0] if "<" in link else None
```

常用字段组：序列 `accession,sequence,length,mass`；命名 `gene_names,protein_name,organism_name`；GO `go_p`(过程)/`go_f`(功能)/`go_c`(组分)；特征 `ft_domain,ft_binding,ft_act_site,ft_mod_res`；注释 `cc_function,cc_interaction,cc_subcellular_location`。

关键参数：`query`/`format`(json|tsv|fasta|xml|gff)/`fields`/`size`(1–500，默认25)/`from`,`to`(映射库代码)/`reviewed:true`/`organism_id`(NCBI 物种 ID，人=9606)。

## 示例

下载人类激酶为 DataFrame（流式）：
```python
import requests, pandas as pd
from io import StringIO
params = {"query": "ec:2.7.* AND organism_id:9606 AND reviewed:true",
          "format": "tsv", "fields": "accession,gene_names,protein_name,length,go_f"}
resp = requests.get("https://rest.uniprot.org/uniprotkb/stream", params=params)
df = pd.read_csv(StringIO(resp.text), sep="\t")
print(f"人类激酶(Swiss-Prot): {len(df)}")
```

为一组基因提取 GO 注释：
```python
genes = ["BRCA1", "BRCA2", "TP53", "ATM", "CHEK2"]
query = " OR ".join(f"gene:{g}" for g in genes) + " AND organism_id:9606 AND reviewed:true"
params = {"query": query, "format": "tsv", "fields": "accession,gene_names,go_p,go_f,go_c"}
resp = requests.get("https://rest.uniprot.org/uniprotkb/search", params=params)
df = pd.read_csv(StringIO(resp.text), sep="\t")
```

快速校验（人类胰岛素，Swiss-Prot）：
```python
params = {"query": "insulin AND organism_id:9606 AND reviewed:true", "format": "tsv",
          "fields": "accession,gene_names,protein_name,length"}
print(requests.get("https://rest.uniprot.org/uniprotkb/search", params=params).text[:500])
# accession  gene_names  protein_name  length
# P01308     INS         Insulin       110
```

## 注意事项

- 优先 `reviewed:true`：拿人工审编的高置信注释；TrEMBL 条目常缺基因名等注释。
- 表格分析用 TSV + `fields`，避免拉全量 JSON。
- 大批量下载用 `/stream`，免去多页迭代与漏条目。
- 批量请求间 `time.sleep(0.5)`，避免 `429 Too Many Requests`。
- 本地缓存：UniProt 每月更新，按需重取即可。
- 反模式：不加 `organism_id` 的宽查询（如 `gene:INS`）会跨物种返回上千条——务必按物种过滤。
- 排错速查：`400` 多为查询语法/括号/字段名错；ID 映射返空多为库代码写错（用 `UniProtKB_AC-ID` 而非裸 `UniProtKB`）；分页漏条目改用 `/stream`。

## 互见

- `biopython-molecular-biology` — 解析 UniProt 返回的 FASTA、用取得序列跑 BLAST。
- `alphafold-database-access` — 用 UniProt accession 取预测 3D 结构。
- `pdb-database` — 实验结构。
- `esm-protein-language-model` — 由序列生成蛋白嵌入。
- `bioservices` — 一站式访问 40+ 数据库。
- `gget-genomic-databases` — 跨库快速基因/蛋白查找。

参考：UniProt REST API 文档 https://www.uniprot.org/help/api ；查询语法 https://www.uniprot.org/help/query-fields ；UniProt Consortium (2023), NAR, doi:10.1093/nar/gkac1052。

---
采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0），适配重写自 `proteomics-protein-engineering/uniprot-protein-database/SKILL.md`。
