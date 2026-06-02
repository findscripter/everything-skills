---
name: dbsnp-database
title: dbSNP SNP 数据库查询
description: 当按 rsID/基因/区间查 dbSNP 的等位基因/MAF/变异类型/坐标或批量解析 rsID 时使用；经 NCBI E-utilities 与 Variation Services API 产出 snp_class、global_mafs、chrpos 及 ClinVar/gnomAD 交叉引用；不适用于临床致病性策展（用 clinvar-database）或按祖源分层频率（用 gnomad-population-database）。触发词：dbSNP、rsID、SNP 频率、MAF、变异坐标、批量注释 rsID
domain: 领域/science
triggers: [dbSNP, rsID 查询, SNP 频率, MAF, 变异类型 snv indel, 变异坐标 GRCh38, 批量注释 rsID, Variation Services API, esearch snp, global_mafs]
tags: [science, genomics, bioinformatics, dbSNP, NCBI, E-utilities, SNP, 变异注释, 数据库查询]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [requests, xml.etree.ElementTree, pandas, NCBI E-utilities, Variation Services API]
requires: []
related: [clinvar-database, gnomad-population-database, snpeff-variant-annotation, opentargets-database]
combines_with: [gatk-variant-calling, snpeff-variant-annotation, clinvar-database]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC0-1.0
---
## 何时使用

适用：
- 已知 rsID，查等位基因频率（MAF）、变异类型（snv/indel/mnv/ins/del）。
- 按基因名或染色体坐标，搜某基因/区间内全部 dbSNP 变异，列出 rsID。
- 把 rsID 解析为基因组坐标（GRCh38/GRCh37）与 HGVS 表示。
- 检查变异是否有指向 ClinVar 的临床意义链接（dbSNP 只给链接，不给策展结论）。
- 用 EPost+EFetch 历史服务器**批量**取数百条 rsID（避免逐条限速）。
- 把一批变异位置反查为 rsID，供下游注释。

不该用（负边界）：
- 临床致病性分类（Pathogenic/VUS/Benign 的策展记录）→ 用 `clinvar-database`；dbSNP 只提供 ID 与频率。
- 按祖源分层的群体频率 → 用 `gnomad-population-database`；dbSNP 的 MAF 是单一聚合值。

## 步骤 / 指令

dbSNP 是 NCBI 的短变异公共库（SNP/indel/MNV，>10 亿条），免费、免认证。两条访问路径：① 旧版 **E-utilities**（XML/JSON）；② 新版 **Variation Services REST API**（结构化 JSON，含 SPDI/placements/频率表，编程首选）。

约束：
- **E-utilities 须带 `email`**（NCBI 政策）。**限速：未认证 3 req/s，带 API key 10 req/s**（key 免费注册 https://www.ncbi.nlm.nih.gov/account/，给所有请求加 `&api_key=YOUR_KEY`）。
- 依赖：`pip install requests pandas matplotlib`（`xml.etree` 属标准库）。
- 数据库选择子 `db="snp"`；`id` 用去掉 `rs` 前缀的数字。

主路径：
1. **单条**：Variation Services `GET /variation/v0/refsnp/{rs_num}` 拿结构化 JSON；或 E-utilities `efetch.fcgi`（`rettype="docsum"`，无命名空间，比 `rettype="xml"` 的命名空间 ExchangeSet 好解析）。
2. **搜索**：`esearch.fcgi` 按 `term` 查 rsID 列表。字段标签：`基因[gene]`、`染色体[CHR]`、`位置[CHRPOS]`（GRCh37 用 `[CHRPOS37]`）、`rsID[rs]`、`clinsig[filter]`（只要有临床链接的）。搜基因务必加 `AND human[orgn]`。
3. **摘要**：`esummary.fcgi`（`retmode="json"`）拿 snp_class、global_mafs、chrpos、clinical_significance、fxn_class。
4. **批量（>10 条）**：先 `epost.fcgi` 把全部 rsID 一次上传历史服务器拿 `WebEnv`+`query_key`，再分批 `esummary` 取回（每批可达 500）。

**2024 schema 改版**：ESummary 已删除 `maf`/`mafallele`，改用 `global_mafs`（`[{study, freq}]` 列表）。挑一个 study（如 `GnomAD_genomes`/`TOPMED`/`ALFA`）解析其 `freq` 字符串（形如 `G=0.42/1000`）。

## 示例

单条查询（两种路径）：

```python
import requests
EMAIL = "your@email.com"  # NCBI 政策必填
BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"
VAR = "https://api.ncbi.nlm.nih.gov/variation/v0"

# 路径 A：Variation Services（结构化 JSON，首选）
def fetch_refsnp(rsid):
    rs = str(rsid).lstrip("rs")
    r = requests.get(f"{VAR}/refsnp/{rs}", timeout=15); r.raise_for_status()
    return r.json()

rec = fetch_refsnp("rs1800497")  # DRD2 Taq1A
print("rs" + str(rec["refsnp_id"]),
      rec["primary_snapshot_data"].get("variant_type"))  # -> snv
# 顶层键：refsnp_id, primary_snapshot_data, citations, dbsnp1_merges ...（无 organism）

# 路径 B：ESummary（2024 schema，用 global_mafs）
def esummary_snp(rsid):
    rs = str(rsid).lstrip("rs")
    r = requests.get(f"{BASE}/esummary.fcgi",
        params={"db": "snp", "id": rs, "retmode": "json", "email": EMAIL})
    r.raise_for_status()
    return r.json()["result"].get(rs, {})

s = esummary_snp("rs80357906")
print(s.get("snp_class"), s.get("chrpos"), s.get("clinical_significance"))
# delins  17:43057062  pathogenic,risk-factor,uncertain-significance
for m in s.get("global_mafs", [])[:3]:
    print(m["study"], m["freq"])   # 删除的 maf/mafallele 改这里取
```

按基因/区间搜，并解析等位基因频率：

```python
def esearch_snp(term, retmax=100):
    r = requests.get(f"{BASE}/esearch.fcgi",
        params={"db": "snp", "term": term, "retmax": retmax,
                "retmode": "json", "email": EMAIL})
    r.raise_for_status()
    res = r.json()["esearchresult"]
    return res["idlist"], int(res["count"])

ids, total = esearch_snp("BRCA1[gene] AND human[orgn]", retmax=20)          # 基因
# 只要有临床链接： esearch_snp("BRCA1[gene] AND human[orgn] AND clinsig[filter]")
# 染色体区间(GRCh38)： esearch_snp("1[CHR] AND 55039700:55040200[CHRPOS]")

# Variation Services 的频率表：observation.inserted_sequence 才是等位基因
def parse_freqs(record):
    out = []
    snap = record.get("primary_snapshot_data", {})
    for ann in snap.get("allele_annotations", []):
        for f in ann.get("frequency", []):
            obs = f.get("observation", {})
            tot = f.get("total_count")
            out.append({"allele": obs.get("inserted_sequence"),
                        "study": f.get("study_name"),
                        "freq": f["allele_count"]/tot if tot else None})
    return out
```

批量注释（EPost+ESummary 历史服务器）：

```python
import xml.etree.ElementTree as ET, time, pandas as pd

def epost_snp(rsids):
    ids = ",".join(str(r).lstrip("rs") for r in rsids)
    r = requests.post(f"{BASE}/epost.fcgi",
        data={"db": "snp", "id": ids, "email": EMAIL}, timeout=30)
    r.raise_for_status()
    root = ET.fromstring(r.text)
    return root.findtext("WebEnv"), root.findtext("QueryKey")

def esummary_hist(webenv, qk, start, retmax=100):
    r = requests.get(f"{BASE}/esummary.fcgi",
        params={"db": "snp", "WebEnv": webenv, "query_key": qk,
                "retstart": start, "retmax": retmax,
                "retmode": "json", "email": EMAIL}, timeout=30)
    r.raise_for_status()
    return r.json()["result"]

rsids = ["rs80357906", "rs429358", "rs7412", "rs1800497", "rs1801133"]
webenv, qk = epost_snp(rsids)
rows = []
for start in range(0, len(rsids), 100):
    res = esummary_hist(webenv, qk, start)
    for uid in res.get("uids", []):
        rec = res[uid]
        g = rec.get("global_mafs", [])
        rows.append({"rsid": f"rs{uid}", "snp_class": rec.get("snp_class"),
                     "maf": g[0]["freq"] if g else None,
                     "chrpos": rec.get("chrpos"),
                     "clinsig": rec.get("clinical_significance")})
    time.sleep(0.5)
pd.DataFrame(rows).to_csv("variant_annotations.csv", index=False)
```

## 注意事项

- **email 必填**：所有 E-utility 调用都要带，否则可能被封；生产注册 API key 把限速 3→10 req/s。
- **2024 schema 改版**：`KeyError: 'maf'`/`'mafallele'` → 改用 `rec["global_mafs"]`（`[{study, freq}]`），挑 study 解析 `freq` 串；`global_mafs` 为空说明 dbSNP 无聚合频率，改用 `gnomad-population-database`。
- **MAF ≠ 致病性**：`clinical_significance` 只是指向 ClinVar 的字符串链接，不含提交者/审阅状态/HGVS 细节；临床解读用 `clinvar-database`。MAF 是跨研究聚合的单一群体统计，低 MAF 未必致病、中等 MAF 也可能在特定背景（创始者变异）致病。
- **解析等位基因频率**：Variation Services 中断言等位基因在 `freq.observation.inserted_sequence`，**不在** `ann.allele`。
- **XML 命名空间**：`root.iter("DocumentSummary")` 返回 0 多因用了 `rettype="xml"`（根是带命名空间的 `ExchangeSet`）；改 `rettype="docsum"` 或传全命名空间标签。
- **rs ID vs ss ID**：查询一律用稳定的 rs ID（聚类后公共 ID）；ss ID 是提交内部 ID，一个 rs 可聚多个 ss。先看 `snp_class` 再解读 MAF——indel/MNV 与 SNV 计数约定不同，多等位位点的 MAF 可能只指其中一个等位。
- **限速/不存在/合并**：HTTP 429 → 加 `time.sleep(0.35)`；`{"error":"Invalid uid"}` 说明 rsID 不存在或为未入库的新位点；批量取回数少于上传数多因 rsID 被合并/退役（退役 rs 会重定向到当前活跃 rs）；Variation Services 404 → 确认 `/refsnp/{rs_num}` 用纯数字（无 `rs` 前缀）。

## 互见

- `clinvar-database` — ClinVar 临床致病性策展（dbSNP 给 rsID/频率，临床结论来这里）。
- `gnomad-population-database` — 按祖源分层的群体频率（比 dbSNP 单一 MAF 更细）。
- `snpeff-variant-annotation` — 用 SnpEff/SnpSift 注释 VCF，可回填 dbSNP rsID 与功能预测。
- `gatk-variant-calling` — VCF 变异检出后，用本技能批量回填 rsID/MAF/坐标。
- `opentargets-database` — SNP-性状关联与靶点-疾病证据整合。

---
采编自 jaechang-hits/SciAgent-Skills（原 license CC0-1.0），按本仓库规范适配重写；本条目以 CC-BY-4.0 发布。
