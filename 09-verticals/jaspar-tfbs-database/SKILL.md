---
name: jaspar-tfbs-database
title: JASPAR 转录因子结合谱
description: 当需按 TF 名/JASPAR ID/物种/结构类查询转录因子结合谱（PFM/PWM）或扫描 DNA 寻找潜在 TFBS 时使用；用 REST API 或 pyJASPAR 检索矩阵、算 PWM/信息量、滑窗打分、导出 MEME/JASPAR 格式，产出 motif 库与结合位点列表。不适用于从 ChIP-seq peak 做 de novo motif 发现（用 homer-motif-analysis）或调控变异打分（用 regulomedb-database）。触发词：JASPAR、转录因子结合位点、TFBS、PFM、PWM、motif、位置权重矩阵、CTCF、MEME 导出
domain: 领域/science
triggers: [JASPAR, 转录因子结合位点, TFBS, PFM, PWM, 位置频率矩阵, 位置权重矩阵, motif 库, DNA motif 扫描, MA0139.1, CTCF 结合, pyJASPAR, MEME 格式导出, 信息量 IC, TF 家族 motif, 启动子 TF 扫描]
tags: [science, 生物信息学, 基因组学, 转录调控, 转录因子, motif, jaspar, tfbs]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Bash, Python, requests, numpy, pandas, matplotlib, pyJASPAR]
requires: []
related: [encode-database, ensembl-database, macs3-peak-calling, deeptools-ngs-analysis]
combines_with: [ucsc-genome-browser, geniml-genomic-interval-ml, gene-set-enrichment-analysis]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

适用：
- 按 TF 名（如 CTCF、SP1、GATA1）或 JASPAR ID（如 `MA0139.1`）取该转录因子的 PFM/PWM，作为扫描工具的 motif 输入。
- 拉取某物种（人 9606、小鼠 10090）全部 CORE 谱，构建富集分析用 motif 库。
- 在启动子/调控序列上滑窗扫描，预测潜在 TF 结合位点（TFBS）。
- 按结构类（bHLH、锌指、同源域）或家族（C2H2 ZF、bZIP）汇集一类 TF 的结合谱。
- 取矩阵元数据：结合位点数、信息量、实验类型；或批量导出 CORE/CNE 集为 JASPAR / MEME 格式。

不该用（负边界）：
- 要从 ChIP-seq/ATAC-seq peak 做 **de novo motif 发现** → 用 `homer-motif-analysis`；JASPAR 只提供已知矩阵。
- 要对调控变异打分或取调控元件注释 → 用 `regulomedb-database` / `encode-database`。
- 生产级批量扫描别用本文手写滑窗（仅教学用），改导出 MEME 格式后跑 FIMO。

## 步骤 / 指令

1. 装依赖：`pip install requests pandas matplotlib numpy`；可选 `pip install pyJASPAR`（自带 biopython 的 motif 对象封装）。
2. API 基址 `https://jaspar.elixir.no/api/v1`，无需鉴权；批量请求间隔 `time.sleep(0.3~0.5)`。
3. 检索矩阵：`GET /matrix/`，参数 `search`/`collection`/`tax_id`/`tax_group`/`tf_class`/`tf_family`/`page_size`(≤100)/`format=json`。**务必沿响应 `next` 字段翻页**，否则只拿到一页。
4. 取单矩阵：`GET /matrix/{id}/`；`pfm` 是 `{位置str → {A,C,G,T:计数}}`。
5. PFM→PWM：加伪计数后取 log2 odds（见示例）。扫描时阈值按最大得分的百分比（`threshold_pct` 默认 0.80）。
6. 大批量导出 MEME 格式 → 交 FIMO/AME/TOMTOM。

关键约束：
- 矩阵 ID 格式 `MA{4 位数}.{版本}`（如 `MA0139.1`）；脚本/论文中**固定带版本号**保证可复现，按名搜索返回全部版本，取版本号最高者最新。
- 标准分析用 `CORE` 集；`UNVALIDATED` 未人工校正，仅探索性使用。
- **必加伪计数**：原始 PFM 含 0 计数，log 空间会出 -inf；用 `pseudocount=0.8`（JASPAR 推荐）或 `sqrt(sites)/4`。
- JASPAR 恒返回 `{A,C,G,T}` 键，勿假设行序；部分谱位置键是整型，需 `{str(k):v}` 规整。

### JASPAR 集合速查

| 集合 | 说明 | 谱数(2024) |
|------|------|-----------|
| `CORE` | 人工校正、非冗余、高质量（默认） | ~1200 |
| `CNE` | 源自保守非编码元件 | ~100 |
| `UNVALIDATED` | 未人工校正 | ~1000 |
| `PHYLOFACTS` | 系统发育约束位点 | ~100 |
| `POLII` | RNA 聚合酶 II 结合谱 | ~10 |

## 示例

检索 CTCF 谱（CORE 脊椎动物）：

```python
import requests
JASPAR_API = "https://jaspar.elixir.no/api/v1"
r = requests.get(f"{JASPAR_API}/matrix/", params={
    "search": "CTCF", "collection": "CORE",
    "tax_group": "vertebrates", "format": "json"}, timeout=15)
r.raise_for_status()
for m in r.json()["results"][:3]:
    print(m["matrix_id"], m["name"], "sites=", m["sites"], m["type"])
# MA0139.1 CTCF sites=190 type=ChIP-seq
```

带翻页的通用检索（批量必用）：

```python
import requests, time
def jaspar_search(**params):
    params.setdefault("format", "json"); params.setdefault("page_size", 100)
    out, url = [], f"{JASPAR_API}/matrix/"
    while url:
        r = requests.get(url, params=params if url.endswith("/matrix/") else None, timeout=15)
        r.raise_for_status(); data = r.json()
        out.extend(data["results"]); url = data.get("next"); time.sleep(0.3)
    return out
human = jaspar_search(tax_id=9606, collection="CORE")   # 人 CORE 全谱
```

PFM→PWM + 序列扫描：

```python
import requests, numpy as np
BASE_IDX = {"A":0,"C":1,"G":2,"T":3}
def pfm_to_pwm(pfm, pseudocount=0.8, bg=0.25):
    bases = ["A","C","G","T"]; L = len(pfm)
    counts = np.array([[pfm[str(i)][b] for i in range(L)] for b in bases], float)
    counts += pseudocount
    freqs = counts / counts.sum(axis=0, keepdims=True)
    return np.log2(freqs / bg)                # shape (4, L)

def scan(seq, pwm, pct=0.80):
    seq = seq.upper(); L = pwm.shape[1]
    mx, mn = pwm.clip(min=0).sum(), pwm.clip(max=0).sum()
    thr = mn + pct*(mx-mn); hits = []
    for i in range(len(seq)-L+1):
        w = seq[i:i+L]
        if "N" in w: continue
        s = sum(pwm[BASE_IDX[w[j]], j] for j in range(L))
        if s >= thr: hits.append((i, round(s,3), "+"))
    return hits, mx, thr

pfm = requests.get(f"{JASPAR_API}/matrix/MA0139.1/",
                   params={"format":"json"}, timeout=15).json()["pfm"]
pwm = pfm_to_pwm(pfm)
hits, mx, thr = scan("...你的 DNA 序列...", pwm, 0.80)
```

信息量 IC（位点特异性）：

```python
def information_content(pfm, pseudocount=0.8):
    bases=["A","C","G","T"]; L=len(pfm)
    c=np.array([[pfm[str(i)][b] for i in range(L)] for b in bases],float)+pseudocount
    f=c/c.sum(axis=0,keepdims=True)
    ic=2-(-np.sum(f*np.log2(f+1e-12),axis=0))
    return ic, ic.sum()      # 总 IC 越高=结合越特异
```

导出 MEME 最简格式（交 FIMO）：表头 `MEME version 4` / `ALPHABET= ACGT` / `Background letter frequencies` + 每个 motif 一行 `MOTIF {id} {name}` + `letter-probability matrix: alength= 4 w= {L} nsites= {sites}` + L 行频率。生产扫描用 `fimo --thresh 1e-4 motifs.meme seq.fa`。

pyJASPAR 快取（需要 BioPython motif 对象时）：

```python
import pyJASPAR
db = pyJASPAR.JASPAR2024(auto_reverse_complement=True)
m = db.fetch_motif_by_id("MA0139.1")
print(m.name, m.matrix_id, len(m), m.consensus)
motifs = db.fetch_motifs(collection="CORE", tax_id=9606, tf_family="bHLH")
```

JASPAR 平面文件格式：`GET /matrix/{id}/?format=jaspar` 取 `r.text`。

## 注意事项

- 翻页：JASPAR 每页 ≤100，务必沿 `next` 取完；用首响应 `count` 校验 `len(results)` 是否抓全。
- 伪计数不可省，否则 PWM 出 -inf 抹掉含该碱基的所有序列。
- 扫描无命中多因阈值过严或序列过短：降 `threshold_pct` 到 0.70，并核对序列长度 ≥ motif 长度。
- 矩阵 ID 固定版本号保可复现；按名搜返回多版本，取版本号最大者。
- 常见错误：`search` 空结果=TF 不在库/集合或 `tax_group` 选错（试 `collection=None` 全集搜，或换别名如 NF-κB→RELA）；`404`=ID 拼写或格式错；`pfm['0']` KeyError=位置键为整型，需 `{str(k):v}` 规整；pyJASPAR 装不上（需 Py≥3.8 + C 扩展）就直接用 REST API。

## 互见

- requires：`无` —— 仅需基础 Python/HTTP 能力。
- related：`homer-motif-analysis`（de novo motif 发现，补已知库）、`regulomedb-database`（调控变异打分）、`encode-database` / `remap-database`（TF ChIP-seq peak，可与 JASPAR 谱交叉验证）。
- combines_with：`macs3-peak-calling` —— 先 call peak 产出 BED，再用 JASPAR 谱做 motif 富集；`homer-motif-analysis` —— 已知库扫描 + de novo 发现互补。
- 参考：JASPAR REST API v1 https://jaspar.elixir.no/api/v1/ ；Castro-Mondragon et al. (2022) NAR；pyJASPAR https://github.com/asntech/pyjaspar 。

---
采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0）。
