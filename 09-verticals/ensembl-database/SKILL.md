---
name: ensembl-database
title: Ensembl 基因注释数据库
description: 当需要通过 Ensembl REST API 在线获取基因/转录本/变异注释、做 ID 映射（HGNC↔Ensembl↔RefSeq↔UniProt）、取序列、VEP 变异效应、调控特征或跨物种同源时使用；做基因注释检索与产出（坐标/序列/xref/CSV 注释表）；不适用于本地批量离线注释（用 pyensembl）、通路/代谢注释（用 kegg/reactome）；触发词：Ensembl、ENSG、VEP、ortholog
domain: 领域/science
triggers: [Ensembl 基因注释, ENSG/ENST/ENSP 稳定 ID 查询, 基因符号转 Ensembl ID, VEP 变异效应预测, rsID 注释, HGVS 变异注释, 跨物种同源 ortholog/paralog, 调控特征查询, 基因/转录本/蛋白序列获取, GRCh38/GRCh37 区间基因重叠]
tags: [databases, genomics-bioinformatics, variant-annotation, rest-api, comparative-genomics]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [requests, pandas, joblib]
requires: []
related: [gget-genomic-databases, ucsc-genome-browser, uniprot-protein-database, gnomad-population-database]
combines_with: [gget-genomic-databases, clinvar-database]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

适用：
- 按基因符号或 Ensembl 稳定 ID 取官方基因/转录本注释（稳定 ID、biotype、基因组坐标）。
- 在标识符命名空间间转换：HGNC 符号 ↔ Ensembl ID ↔ RefSeq ↔ UniProt。
- 取基因或转录本的基因组 / cDNA / CDS / 蛋白序列。
- 用 VEP 预测一批 SNP（HGVS 或 rsID）的功能后果与影响等级。
- 查询某基因组区间的调控特征（启动子、增强子、CTCF）。
- 跨物种比较基因组：同源（ortholog/paralog）、基因树。

不该用（负边界）：
- 大规模本地离线注释 → 用 `pyensembl`，避免高频打 REST。
- 通路/代谢注释 → 用 `kegg-database` 或 `reactome-database`。
- NCBI RefSeq/GenBank 主导的检索 → 用 Biopython 的 `Entrez`。

## 步骤

1. 装依赖：`pip install requests`（联网即可，无需 API Key）。
2. 选端点：单条用 GET `/lookup/...`，多条务必用 POST 批量端点。
3. 区间查询固定 assembly（`coord_system_version=GRCh38`；GRCh37 用 `grch37.rest.ensembl.org`）。
4. 控速 ≤ ~15 req/s；循环里加 `time.sleep(0.1)`，优先批量。
5. 落地为 DataFrame/CSV，必要时用 `joblib.Memory` 缓存。

## 指令

通用封装与基址：

```python
import requests, json
BASE = "https://rest.ensembl.org"
HEADERS = {"Content-Type": "application/json"}

def ensembl_get(endpoint, params=None):
    r = requests.get(f"{BASE}{endpoint}", headers=HEADERS, params=params)
    r.raise_for_status()
    return r.json()
```

按符号查基因（`expand=1` 展开转录本）：

```python
gene = ensembl_get("/lookup/symbol/homo_sapiens/TP53", params={"expand": 1})
print(gene["id"], f'{gene["seq_region_name"]}:{gene["start"]}-{gene["end"]}',
      gene["biotype"], len(gene.get("Transcript", [])))
```

按稳定 ID 查（基因/转录本/蛋白通用）：`GET /lookup/id/ENSG00000141510`。

批量符号查询（POST，最多约 1000 条）：

```python
r = requests.post(f"{BASE}/lookup/symbol/homo_sapiens",
                  headers=HEADERS,
                  data=json.dumps({"symbols": ["BRCA1","BRCA2","TP53","EGFR","MYC"]}))
```

取序列（蛋白需 `Content-Type: text/plain`）：

```python
r = requests.get(f"{BASE}/sequence/id/ENST00000269305",
                 headers={"Content-Type": "text/plain"},
                 params={"type": "protein"})  # type: genomic|cDNA|CDS|protein
seq = r.text
```

区间基因组序列：`GET /sequence/region/human/17:43044295..43125364?coord_system_version=GRCh38`。

交叉引用（ID 映射）：`GET /xrefs/id/ENSG00000141510`，按 `dbname` 分组取 HGNC、RefSeq_gene_name、Uniprot_gn、MIM_gene。

VEP 变异注释（HGVS 批量，POST）：

```python
r = requests.post(f"{BASE}/vep/human/hgvs", headers=HEADERS,
                  data=json.dumps({"hgvs_notations": ["17:g.43094692C>T","13:g.32929387C>T"]}))
for v in r.json():
    for tc in v.get("transcript_consequences", []):
        if tc.get("canonical") == 1:  # 取规范转录本，最具生物学意义
            print(v["input"], tc.get("gene_symbol"), tc.get("impact"),
                  tc.get("consequence_terms"))
```

按 rsID 注释：`GET /vep/human/id/rs699`。

调控特征：`GET /overlap/region/human/17:43044000-43126000?feature=regulatory`（`feature` 也可为 gene/transcript/variation）。

跨物种同源：`GET /homology/symbol/human/TP53?target_species=mus_musculus&type=orthologues`。

## 示例

符号 → Ensembl ID 映射表：

```python
import pandas as pd
symbols = ["EGFR","KRAS","BRAF","PIK3CA","PTEN","AKT1","MYC","RB1"]
r = requests.post(f"{BASE}/lookup/symbol/homo_sapiens", headers=HEADERS,
                  data=json.dumps({"symbols": symbols}))
data = r.json()
df = pd.DataFrame([{"symbol": s,
                    "ensembl_id": d["id"] if d else None,
                    "chrom": d["seq_region_name"] if d else None}
                   for s, d in data.items()])
df.to_csv("symbol_to_ensembl.csv", index=False)
```

变异注释流水线（输出规范转录本后果到 CSV）：

```python
def vep_batch(hgvs):
    r = requests.post(f"{BASE}/vep/human/hgvs", headers=HEADERS,
                      data=json.dumps({"hgvs_notations": hgvs}))
    r.raise_for_status(); return r.json()

records = []
for ann in vep_batch(["17:g.43094692C>T","17:g.43063873A>G","13:g.32929387C>T"]):
    for tc in ann.get("transcript_consequences", []):
        if tc.get("canonical") == 1:
            records.append({"variant": ann["input"], "gene": tc.get("gene_symbol"),
                            "consequence": ",".join(tc.get("consequence_terms", [])),
                            "impact": tc.get("impact"), "biotype": tc.get("biotype")})
pd.DataFrame(records).to_csv("vep_results.csv", index=False)
```

区间基因重叠（如 GWAS 位点）：`GET /overlap/region/human/17:43044295-43125364?feature=gene&biotype=protein_coding`。

## 注意事项

关键概念：
- 稳定 ID 带可选版本后缀（`ENSG00000141510.17`）；前缀区分 ENSG/ENST/ENSP/ENSE，跨版本尽量保留。
- 人类装配：当前 GRCh38，旧版 GRCh37 走 `grch37.rest.ensembl.org`；区间查询务必指明 assembly。

最佳实践：
- 多条一律走批量 POST，循环单查极易触发限速。
- 仅需坐标/biotype 时用 `expand=0`，载荷更小更快。
- 开发期用 `joblib.Memory("cache/")` 缓存查询结果。

常见报错排查：
- `429 Too Many Requests`：超 ~15 req/s → 加 `time.sleep(0.1)`、改批量。
- VEP `400 Bad Request`：HGVS 格式错 → 校验 `chr:g.posREF>ALT`（如 `17:g.43094692C>T`）。
- `Gene not found`：符号不在库或物种名错 → 符号查询用 `homo_sapiens` 而非 `human`。
- 区间返回错基因：assembly 不匹配 → 固定 `coord_system_version=GRCh38` 或换 GRCh37 域名。
- 旧 ID 无法解析：已退役 → `GET /archive/id/{id}` 取当前映射。
- `503 Service Unavailable`：维护中 → 稍后重试，查 status.ensembl.org。

## 互见

- `pyensembl`：本地离线大规模基因组注释（替代高频 REST）。
- `kegg-database` / `reactome-database`：通路与代谢/富集注释。
- `gget`：封装 Ensembl 及 20+ 数据库的 CLI/Python 速查。
- Biopython `Entrez`：NCBI RefSeq/GenBank 替代检索。

参考：Ensembl REST API（rest.ensembl.org）、稳定 ID 指南、VEP 文档。

---
采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0）。
