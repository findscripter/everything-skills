---
name: pyopenms-mass-spectrometry
title: PyOpenMS 质谱数据处理
description: 当需要用 PyOpenMS（OpenMS 的 Python 绑定）处理 LC-MS/MS 蛋白质组学或代谢组学原始质谱数据时使用；做 mzML/mzXML 等格式读写、信号处理（平滑/峰检测/质心化）、特征检测与跨样本连接、肽段/蛋白鉴定及 FDR 控制、非靶向代谢组学流程，产出特征表/鉴定表（pandas/CSV）；不适用于简单谱库匹配与代谢物注释（用 matchms）、纯蛋白序列分析（用 biopython）、不读质谱数据的任务；触发词：PyOpenMS、OpenMS、质谱、mass spectrometry、mzML、LC-MS/MS、蛋白质组学、proteomics、代谢组学、metabolomics、峰检测、peak picking、特征检测、FDR。
domain: 领域/science
triggers: [PyOpenMS, OpenMS, 质谱, mass spectrometry, mzML, LC-MS/MS, 蛋白质组学, proteomics, 代谢组学, metabolomics, 峰检测, peak picking, 特征检测, FDR, 质心化, centroiding]
tags: [mass-spectrometry, proteomics, metabolomics, pyopenms, bioinformatics]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, pyopenms, numpy, pandas, matplotlib]
requires: []
related: [maxquant-proteomics, cheminformatics-toolkit, gene-set-enrichment-analysis, guided-statistical-analysis]
combines_with: [maxquant-proteomics, gene-set-enrichment-analysis]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

需要用 PyOpenMS（OpenMS C++ 库的 Python 绑定）处理计算质谱数据时使用，覆盖蛋白质组学与代谢组学：

- 读写 10+ 种质谱格式（mzML/mzXML/featureXML/idXML 等），含大文件的索引按需加载。
- 信号处理：高斯/SG 平滑、质心化（峰检测）、归一化、去噪、基线扣除。
- 特征检测（`FeatureFinder`）与跨样本的 RT 对齐 + 特征连接（共识图）。
- 肽段/蛋白鉴定：解析搜索引擎结果，做 target-decoy FDR 控制与蛋白推断。
- 非靶向代谢组学全流程：质心化 → 特征检测 → 加合物去电荷 → 对齐 → 连接 → 导出特征表。

触发词：PyOpenMS、OpenMS、质谱、mass spectrometry、mzML、LC-MS/MS、蛋白质组学、proteomics、代谢组学、metabolomics、峰检测、peak picking、特征检测、FDR、质心化、centroiding。

**不该用（边界）：**
- 简单谱库匹配 / 代谢物谱图比对 → 用 **matchms**，更轻。
- 纯蛋白序列分析（FASTA 解析、BLAST，不涉质谱）→ 用 **biopython**。
- 不读质谱原始数据、只做统计/可视化的任务 → 直接用 pandas/numpy 即可。

## 步骤 / 指令

通用：**所有算法都是 4 步范式** —— 实例化 → `getParameters()` → `setValue(...)` → `setParameters()`，再执行。发现参数：`for k in params.keys(): print(k, params.getValue(k))`。

1. **装环境**：`uv pip install pyopenms numpy pandas matplotlib`（Python 3.8+）。
2. **读数据**：`MzMLFile().load(path, exp)`；大文件（>1 GB）用 `OnDiscMSExperiment` 按需取谱避免爆内存。
3. **预处理**：平滑（`GaussFilter` 或 `SavitzkyGolayFilter`，二选一）→ **质心化 `PeakPickerHiRes`（特征检测前必做）** → 按需归一化/去噪/扣基线。
4. **特征检测**：`FeatureFinder.run("centroided", exp, features, params, seeds)`；代谢组学设 `isotopic_pattern:charge_low/high`。
5. **跨样本**：`MapAlignmentAlgorithmPoseClustering` 对齐 RT → `FeatureGroupingAlgorithmQT` 连接成 `ConsensusMap`。
6. **鉴定**：`IdXMLFile().load(...)` → `FalseDiscoveryRate().apply(peptide_ids)` → 过滤 ≤1% FDR → `BasicProteinInferenceAlgorithm` 蛋白推断。
7. **导出**：`features.get_df()` / `consensus.get_df()` 转 pandas 早做统计；`to_csv` 落盘。

## 示例

快速加载 + 平滑 + 质心化：
```python
import pyopenms as ms

exp = ms.MSExperiment()
ms.MzMLFile().load("sample.mzML", exp)
print(f"谱图: {exp.getNrSpectra()}, 色谱: {exp.getNrChromatograms()}")

gauss = ms.GaussFilter()
p = gauss.getParameters(); p.setValue("gaussian_width", 0.1); gauss.setParameters(p)
gauss.filterExperiment(exp)

picker = ms.PeakPickerHiRes()
centroided = ms.MSExperiment()
picker.pickExperiment(exp, centroided)
```

蛋白质组学：检测特征并导出：
```python
ff = ms.FeatureFinder()
features = ms.FeatureMap()
params = ff.getParameters("centroided")
ff.run("centroided", centroided, features, params, ms.FeatureMap())
features.get_df().to_csv("proteomics_features.csv", index=False)
```

鉴定结果 1% FDR 过滤：
```python
prot_ids, pep_ids = [], []
ms.IdXMLFile().load("search.idXML", prot_ids, pep_ids)
ms.FalseDiscoveryRate().apply(pep_ids)
for pid in pep_ids:
    pid.setHits([h for h in pid.getHits() if h.getScore() <= 0.01])
```

肽段质量 / 酶切：
```python
seq = ms.AASequence.fromString("PEPTIDER")
print(seq.getMonoWeight(), seq.getFormula())

dig = ms.ProteaseDigestion(); dig.setEnzyme("Trypsin")
peps = []
dig.digest(ms.AASequence.fromString("MKWVTFISLLLLFSSAYSRGVFRR"), peps)
```

## 注意事项

- **质心化是硬前置**：`FeatureFinder` 只吃质心化数据；若特征图为空，多半是把 profile 数据直接喂了进去 —— 先跑 `PeakPickerHiRes`。
- **处理是破坏性的**：改动前先存原始 `orig = ms.MSExperiment(exp)`。
- **profile vs centroid**：`spec.getType()` 返回 1（profile）/ 2（centroid），部分算法挑类型。
- **大文件用 `OnDiscMSExperiment`** 索引按需加载，否则易 OOM。
- **FDR 全为 1.0**：搜索库没有 decoy 命中 —— 确认用了 target-decoy 库并核对打分方向。
- **特征数过少**：调低 `signal_to_noise`（0.5–1.0），并放宽 `isotopic_pattern` 电荷范围。
- **连接过激**：调小 `distance_RT:max_difference`（秒）与 `distance_MZ:max_difference`（ppm）。
- **`setValue` 类型错**：数值用 float、枚举用 string，查 `params.getDescription(key)`。
- **提速**：先按 MS level 过滤再处理，如 `[s for s in exp if s.getMSLevel() == 1]`。

## 互见

- related：`cheminformatics-toolkit` —— 代谢组学小分子的结构/性质处理与注释配套
- related：`genomic-file-toolkit` —— 同属生信文件 I/O 与组学数据处理思路
- related：`single-cell-rnaseq-analysis` —— 另一类高维组学定量分析参照
- combines_with：`scientific-database-lookup` —— 对检出的代谢物/蛋白做数据库注释
- combines_with：`gene-set-enrichment-analysis` —— 蛋白鉴定结果接功能富集下游分析

---
本条采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0）。
