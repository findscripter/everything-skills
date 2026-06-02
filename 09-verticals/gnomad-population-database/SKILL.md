---
name: gnomad-population-database
title: gnomAD 人群变异频率查询
description: 当需要查 gnomAD v4 人群等位基因频率、按祖先群体(AFR/AMR/EAS/NFE/SAS/FIN/ASJ/MID)分层、基因约束(pLI/LOEUF/missense z)或区域覆盖度，以判断变异稀有/基因 LoF 不耐受时使用；做 GraphQL 取数并产出 AF/FAF95/约束分数表或 CSV/图；不适用于致病性判定(用 ClinVar)、GWAS 关联(用 GWAS Catalog)或本地 VCF 解析；触发词：gnomAD、人群频率、等位基因频率、AF、FAF95、pLI、LOEUF、约束分数、LoF、祖先分层、罕见变异、variant frequency
domain: 领域/science
triggers: [gnomAD, 人群频率, 等位基因频率, allele frequency, FAF95, pLI, LOEUF, 约束分数, LoF, 祖先分层, 罕见变异, variant frequency, GraphQL variant]
tags: [science, bioinformatics, genomics, gnomad, graphql, variant, population-frequency, constraint, clinical]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, requests, pandas, matplotlib, GraphQL, curl]
requires: []
related: [clinvar-database, gget-genomic-databases, snpeff-variant-annotation, uniprot-protein-database]
combines_with: [gatk-variant-calling, snpeff-variant-annotation]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

需要从 **gnomAD**（73 万+ 外显子/基因组聚合数据）经其免费 GraphQL API（`https://gnomad.broadinstitute.org/api`，无需鉴权、无官方 SDK）取人群层面证据时使用：

- 判断候选变异是否足够罕见、值得临床关注（全人群 AF < 0.1%，或更稳健地用 `faf95.popmax`）。
- 取某变异按 9 个祖先群体（afr/amr/eas/fin/nfe/sas/asj/mid/oth）分层的等位基因频率。
- 枚举某基因/区域内的罕见或高置信 LoF 变异，做 burden 检验或候选优选。
- 取基因约束分数（pLI、LOEUF、missense z）评估 LoF 不耐受性。
- 查某区域的测序覆盖度，确认「低频」是真稀有还是覆盖不足（AN 偏低）。

**不该用的边界：**
- 致病性分类 → 用 ClinVar；gnomAD 只给频率证据，不判致病性。
- 研究级 GWAS 关联 → 用 GWAS Catalog；gnomAD 是人群频率查询。
- 本地 VCF/BAM 解析、变异检测算法 → 用 `genomic-file-toolkit`。
- 跨多个公开科研库的泛化取数 → 用 `scientific-database-lookup`。

## 步骤

1. **选数据集与参考基因组**：`gnomad_r4`(GRCh38, 默认) / `gnomad_r3`(GRCh38) / `gnomad_r2_1`(GRCh37)。`reference_genome` 必须与数据集匹配，r4/r3 用 `GRCh38`，r2_1 用 `GRCh37`。
2. **选入口**：按基因 `gene(gene_symbol)` / 按区域 `region(chrom,start,stop)` / 按单变异 `variant(variantId)`（变异 ID 为 `CHROM-POS-REF-ALT`，如 `1-55039974-G-T`）。
3. **发 GraphQL POST**：用统一 `gnomad_query()` 辅助函数发请求并检查 `errors`。
4. **取频率**：优先读 `genome` 对象（外显子-only 变异 `genome` 为 None 时改读 `exome`）。`VariantPopulation` 已不直接暴露 `af`，须由 `ac/an` 计算。
5. **临床过滤用 `faf95.popmax`** 而非全局 AF：它是最常见人群 AF 的 95% 置信下界，更保守。
6. **批量循环加 `time.sleep(0.5)`**：无公开限速，但礼貌延时避免被节流（避免 >10 req/s 爆发）。

## 指令

### 统一辅助函数（所有查询复用）

```python
import requests, time
GNOMAD_API = "https://gnomad.broadinstitute.org/api"

def gnomad_query(query, variables=None):
    r = requests.post(GNOMAD_API, json={"query": query, "variables": variables or {}}, timeout=30)
    r.raise_for_status()
    result = r.json()
    if "errors" in result:
        raise ValueError(f"GraphQL errors: {result['errors']}")
    return result["data"]
```

### Schema 关键约束（v4 易踩坑）

- `GnomadConstraint` 字段是**扁平**的：`pli`(现行字段，`pLI` 为废弃别名)、`mis_z`、`lof_z`、`obs_lof`、`exp_lof`、`oe_lof`、`oe_lof_upper`(=LOEUF)。**无**嵌套 `lof { oe_ci { upper } }`。
- `Gene` 已移除 `gene_name`/`pNull`/`pRec`，改用 `name`/`symbol`。
- `variant()` 入参是 camelCase 的 `variantId`。顶层废弃的 `consequence`/`lof`/`lof_filter`/`lof_flags` 已从单变异查询移除——改从 `transcript_consequences`（复数列表，挑 `is_canonical=True`）读。
- `coverage` 不再是顶层字段，移到 `Region` 下，返回并列的 `exome`/`genome` 数组（每位点一项，无 per-row `pos`，下标即位置）。

### 常用查询片段

```graphql
# 基因变异（带人群 AF）
gene(gene_symbol:$gene_symbol, reference_genome:$rg){
  gene_id symbol
  variants(dataset:$dataset){ variant_id rsids chrom pos ref alt consequence lof
    genome{ an ac af faf95{ popmax popmax_population } } }
}
# 单变异详情：variant(variantId:$variantId, dataset:$dataset){ ... transcript_consequences{...} genome{ ... populations{ id ac an homozygote_count } } }
# 基因约束：gene(...){ gnomad_constraint{ pli mis_z lof_z obs_lof exp_lof oe_lof oe_lof_upper } }
# 区域覆盖：region(...){ coverage(dataset:$dataset){ exome{ mean median over_20 over_30 } genome{...} } }
```

### 阈值速查

| 指标 | 解读 |
|---|---|
| `pLI > 0.9` / `LOEUF < 0.35` | LoF 不耐受（LOEUF 更稳健，为 gnomAD 推荐判据） |
| `mis_z > 3.09` | 显著 missense 约束 |
| `faf95.popmax < 0.001` | 足够罕见、值得临床关注 |
| `lof == "HC"` | LOFTEE 高置信 LoF（burden 分析只取 HC，弃 LC） |

## 示例

**取 BRCA1 约束**（快速校验）：

```python
q = """query($g:String!,$rg:ReferenceGenomeId!){ gene(gene_symbol:$g,reference_genome:$rg){
  gnomad_constraint{ pli oe_lof_upper } } }"""
c = gnomad_query(q, {"g":"BRCA1","rg":"GRCh38"})["gene"]["gnomad_constraint"]
print(c["pli"], c["oe_lof_upper"])   # ~5.5e-38（强 LoF 不耐受）, 0.928
```

**判断变异在任一人群是否常见**（临床前置）：

```python
def is_common_in_any_population(variant_id, threshold=0.01, dataset="gnomad_r4"):
    q = """query($v:String!,$d:DatasetId!){ variant(variantId:$v,dataset:$d){
      genome{ faf95{ popmax popmax_population } af } } }"""
    g = gnomad_query(q, {"v":variant_id,"d":dataset})["variant"]
    if not g or not g["genome"]: return None, "Variant not found in gnomAD"
    pm = g["genome"]["faf95"]["popmax"]
    return (pm or 0) >= threshold, f"AF={g['genome']['af']:.2e}, FAF95={pm:.2e} in {g['genome']['faf95']['popmax_population']}"
# is_common_in_any_population("1-55039974-G-T") -> (False, "AF=3.2e-05, FAF95=6.4e-05 in nfe")
```

**祖先分层频率**（`af` 由 `ac/an` 计算）：

```python
import pandas as pd
pops = gnomad_query(POP_QUERY, {"variantId":"1-55039974-G-T","dataset":"gnomad_r4"})["variant"]["genome"]["populations"]
main = [p for p in pops if p["id"] in {"afr","amr","eas","fin","nfe","sas","asj","mid"} and p["an"]>0]
df = pd.DataFrame(main); df["af"] = df["ac"]/df["an"]
df.sort_values("af", ascending=False)   # 可进一步 matplotlib 画柱状图导出 PNG
```

更多配方见源仓：基因罕见变异导 CSV、约束分批量打分、导 HC LoF 供 CADD/ClinVar 交叉。

## 注意事项

- **先看 AN 再信 AF**：某人群 AN（等位基因数）偏低意味该群体覆盖差，AF≈0 可能是缺数据而非真稀有——配合 coverage 查询交叉确认。
- **GraphQL 报 `{"errors":[...]}`**：多为字段名/数据集 ID 错或 gene 为 null。数据集是 `gnomad_r4` 而非 `gnomad_v4`；字段须对齐 v4 schema。
- **`genome` 为 None**：变异仅在外显子数据中，改读 `exome` 字段。
- **`faf95` 为 null**：变异在所有人群缺失或单态——检查 `ac/an`（可能 AC=0 或被过滤）。
- **大基因（如 TTN）超时**：`timeout=30` 不够时调到 120，或改用 region 查询分段。
- **参考基因组不匹配**：用 GRCh37 坐标查 `gnomad_r4` 会报错——r4/r3 用 `GRCh38`，仅 r2_1 用 `GRCh37`。
- **gnomAD 数据本体使用 ODbL-1.0 许可**，引用其频率结果时注意 ODbL 的署名/相同方式共享要求。

## 互见

- related：`scientific-database-lookup` —— 它已把 gnomAD 列为 POST-only GraphQL 库之一；需跨多个公开科研库泛化取数时走它。
- related：`genomic-file-toolkit` —— 本地 VCF 解析出候选变异后，来 gnomAD 查人群频率；二者互补。
- combines_with：`gene-set-enrichment-analysis` —— 用约束/LoF 证据筛过的基因集再做富集分析。
- combines_with：`single-cell-rnaseq-analysis` —— 把约束分数作为基因优选的先验，叠加表达证据。

---
本条采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0）。
