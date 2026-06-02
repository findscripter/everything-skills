---
name: matchms-spectral-matching
title: matchms 质谱谱图匹配
description: 当需要把 MS/MS 谱图与参考谱库比对做代谢物鉴定、计算谱图相似度或构建可复现的谱图处理流水线时使用；用 matchms 完成多格式谱图导入(mzML/MGF/MSP/JSON)、峰过滤归一化、余弦/修正余弦/指纹打分、批量库搜索与质控清洗，产出相似度分数(score+matches)与鉴定结果 CSV；不适用于完整 LC-MS/MS 蛋白组特征检测(用 pyopenms)或无谱图的纯化学结构相似度(用 rdkit 指纹)。触发词：谱图匹配、spectral matching、matchms、代谢物鉴定、余弦相似度、modified cosine、谱库搜索、mzML、MGF、neutral loss。
domain: 领域/science
triggers: [谱图匹配, spectral matching, matchms, 代谢物鉴定, metabolite identification, 余弦相似度, cosine, modified cosine, 谱库搜索, library matching, mzML, MGF, MSP, neutral loss, precursor_mz, 指纹相似度, fingerprint similarity]
tags: [spectral-matching, matchms, metabolomics, mass-spectrometry, metabolite-id, cosine-similarity, library-search, science]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [matchms, numpy, pandas, rdkit, python]
requires: []
related: [pyopenms-mass-spectrometry, maxquant-proteomics, metabolomics-workbench-database, hmdb-metabolome-database]
combines_with: [pyopenms-mass-spectrometry, hmdb-metabolome-database, metabolomics-workbench-database]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

适用于基于 MS/MS 谱图相似度做化合物鉴定与谱库处理的任务：

- 把未知谱图与参考谱库比对，鉴定未知代谢物。
- 计算谱图相似度分数（余弦、修正余弦、指纹）。
- 统一多来源谱图格式（mzML、MGF、MSP、JSON、mzXML、pickle）。
- 构建可复现的谱图处理流水线做质控清洗。
- 跨谱库统一元数据（化合物名、SMILES、InChI、加合物）。
- 大规模谱库比对与重复谱检测。

不该用的边界：
- 完整 LC-MS/MS 蛋白组学（特征检测、蛋白鉴定）→ 用 **pyopenms**。
- 无谱图、只比化学结构相似度 → 用 **rdkit** 指纹比对。

## 步骤

1. 装环境：`uv pip install matchms numpy pandas`；要用 SMILES/InChI/指纹再装 `uv pip install matchms[chemistry]`（依赖 RDKit）。要求 Python 3.8+。
2. 导入谱图：`load_from_mgf/mzml/msp/json` 等返回生成器，`list()` 取全量；中间结果存 pickle（`save_as_pickle`/`load_from_pickle`）I/O 最快。
3. 处理谱图（**query 与 reference 必须用同一套过滤**）：`default_filters`（元数据清洗+电荷校正+加合物解析）→ `normalize_intensities`（最大强度归一到 1.0）→ `select_by_relative_intensity` 去噪 → `require_minimum_number_of_peaks` 质控。
4. 过滤后**必查 None**：失败的谱图返回 `None`，用 `[s for s in xs if s is not None]` 剔除。
5. 打分：`calculate_scores(references=refs, queries=qs, similarity_function=...)`，按需选评分函数（见下表）。
6. 取最佳匹配：`scores.scores_by_query(query, sort=True)[:5]`，解包 `(ref, score_tuple)`，读 `score_tuple['score']` 与 `['matches']`。
7. 大库提速：先 `PrecursorMzMatch` 按母离子质量粗筛缩小比对空间，再对命中对做 `CosineGreedy` 精打分。
8. 流水线复用：`SpectrumProcessor([filter1, filter2, ...])` 封装多步处理，对 query/reference 一致施加。

评分函数选型：

| 函数 | 速度 | 精度 | 适用 |
|---|---|---|---|
| `CosineGreedy` | 快 | 良 | 通用谱库匹配 |
| `CosineHungarian` | 慢 | 最高 | 小规模比对/验证 |
| `ModifiedCosine` | 快 | 良 | 类似物搜索（母离子不同） |
| `NeutralLossesCosine` | 中 | 良 | 结构类别鉴定（需先 `add_losses`） |
| `FingerprintSimilarity` | 快 | 中 | 结构相似度预筛（需先 `add_fingerprint`） |
| `PrecursorMzMatch` | 最快 | — | 质量粗筛 |

`score_tuple` = `(score, matches)`：`score` 为 0.0–1.0 余弦值，`matches` 为匹配峰数。可信鉴定常用阈值 `score > 0.7` 且 `matches > 6`。

## 指令

```bash
uv pip install matchms numpy pandas
uv pip install matchms[chemistry]   # 需要 SMILES/InChI/指纹时
```

```python
# 快速上手：库搜索取 Top5
from matchms.importing import load_from_mgf
from matchms.filtering import default_filters, normalize_intensities, require_minimum_number_of_peaks
from matchms import calculate_scores
from matchms.similarity import CosineGreedy

def process(spectra):
    out = []
    for s in spectra:
        s = default_filters(s)
        if s is None: continue
        s = normalize_intensities(s)
        s = require_minimum_number_of_peaks(s, n_required=5)
        if s is not None: out.append(s)
    return out

queries = process(load_from_mgf("queries.mgf"))
refs    = process(load_from_mgf("library.mgf"))
scores  = calculate_scores(references=refs, queries=queries,
                           similarity_function=CosineGreedy(tolerance=0.1))
for ref, st in scores.scores_by_query(queries[0], sort=True)[:5]:
    print(f"{ref.get('compound_name','Unknown')}: score={st['score']:.3f} matches={st['matches']}")
```

关键参数：`tolerance`（CosineGreedy/ModifiedCosine，默认 0.1，范围 0.005–0.5 Da，峰匹配 m/z 容差）；`intensity_from`（`select_by_relative_intensity` 最低相对强度）；`n_required`（`require_minimum_number_of_peaks` 默认 10）；`n_max`（`reduce_to_number_of_peaks` 默认 100）；`mz_tolerance`（`remove_peaks_around_precursor_mz` 默认 17.0 Da）；`add_fingerprint` 的 `fingerprint_type`（daylight/morgan/maccs）与 `nbits`（默认 2048）。

## 示例

代谢物库搜索 → 导出鉴定结果（用 ModifiedCosine 兼容母离子差异）：

```python
from matchms.similarity import ModifiedCosine
import pandas as pd

scores = calculate_scores(references=library, queries=queries,
                          similarity_function=ModifiedCosine(tolerance=0.1))
rows = []
for q in queries:
    best = scores.scores_by_query(q, sort=True)[:1]
    if best:
        ref, st = best[0]
        rows.append({"query_precursor_mz": q.get("precursor_mz"),
                     "match_name": ref.get("compound_name", "Unknown"),
                     "match_smiles": ref.get("smiles", ""),
                     "score": st["score"], "matched_peaks": st["matches"]})
df = pd.DataFrame(rows)
print(f"可信匹配(score>0.7): {(df.score>0.7).sum()}/{len(df)}")
df.to_csv("identification_results.csv", index=False)
```

母离子粗筛 + 精打分（大库提速）：

```python
from matchms.similarity import PrecursorMzMatch, CosineGreedy
mass = calculate_scores(references=library, queries=unknowns,
                        similarity_function=PrecursorMzMatch(tolerance=0.5))
cosine = CosineGreedy(tolerance=0.1)
for q in unknowns:
    cands = [r for r, sc in mass.scores_by_query(q, sort=True) if sc["score"] > 0]
    if cands:
        detail = calculate_scores(references=cands, queries=[q], similarity_function=cosine)
        for r, s in detail.scores_by_query(q, sort=True)[:3]:
            print(f"{r.get('compound_name')}: {s['score']:.3f}")
```

质控流水线清洗谱库（`SpectrumProcessor` 复用）：

```python
from matchms import SpectrumProcessor
from matchms.exporting import save_as_mgf
from matchms.filtering import (default_filters, require_precursor_mz, add_parent_mass,
                               normalize_intensities, select_by_relative_intensity,
                               require_minimum_number_of_peaks)
qc = SpectrumProcessor([
    default_filters, require_precursor_mz, add_parent_mass, normalize_intensities,
    lambda s: select_by_relative_intensity(s, intensity_from=0.001),
    lambda s: require_minimum_number_of_peaks(s, n_required=3)])
cleaned = [s for s in (qc(s) for s in raw) if s is not None]
save_as_mgf(cleaned, "cleaned_library.mgf")
```

## 注意事项

- query 与 reference 必须用**完全相同**的过滤流水线，否则相似度系统性偏差；用 `SpectrumProcessor` 保证一致。
- 所有分数为 0.0 → 容差内无匹配峰：调大 `tolerance`（试 0.2–0.5 Da），确认两谱都有峰。
- 同一化合物分数偏低 → 碎裂条件不同：改用 `ModifiedCosine`，并核对 ion mode 一致。
- 大量谱图被过滤成 None → 质控过严：调低 `n_required`、放宽强度阈值。
- 元数据 `KeyError` → 字段未统一：先跑 `default_filters` 统一元数据键名。
- 大库 all-vs-all 内存溢出 → 先 `PrecursorMzMatch` 粗筛再精打分。
- `add_fingerprint` 失败 → 未装 RDKit：`pip install matchms[chemistry]`。
- 导入返回空列表 → 格式/路径错：loader 要对上扩展名（`.mgf`→MGF、`.msp`→MSP），确认文件非空。
- 过滤器返回 None 即移除该谱图，链式调用每步都要判空，否则后续 `s.get()` 报错。

## 互见

- related：`pyopenms-mass-spectrometry` —— 完整 LC-MS/MS 蛋白组/代谢组特征检测与蛋白鉴定，是上游谱图来源。
- related：`cheminformatics-toolkit` —— 由匹配命中的 SMILES 做结构相似度、性质过滤与化学注释。
- combines_with：`pyopenms-mass-spectrometry` —— 先用 pyopenms 做特征检测导出谱图，再用 matchms 比对谱库完成鉴定，构成代谢组学鉴定流水线。

---

本条采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0），在原 matchms-spectral-matching 技能基础上适配重写为中文可执行版。
