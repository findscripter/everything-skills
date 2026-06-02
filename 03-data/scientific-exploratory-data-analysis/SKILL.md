---
name: scientific-exploratory-data-analysis
title: 科学数据探索性分析（200+ 格式）
description: 当拿到科学数据文件（化学/生信/显微/光谱/蛋白代谢/通用）、动手分析前要先识别格式并摸清结构质量时使用；做扩展名自动识别→载入格式专属库→格式专属 EDA（维度/统计/质量/元数据），产出含发现与下游分析建议的 Markdown 报告；不适用于通用表/CSV 的纯画像（用 dataset-profiler）、深度质量修复（用 dataset-quality-auditor）、统计建模或可视化本身。触发词：FASTQ、PDB、mzML、显微图像、HDF5、科学数据格式、EDA 报告
domain: 数据/analysis
triggers: [科学数据探索性分析, EDA 报告 scientific data, FASTQ, PDB, mzML, ND2 显微图像, HDF5 NPY 数组, 200+ 文件格式识别, 生信 基因组 格式, 光谱 质谱 蛋白组 格式, 这个科学文件是什么 怎么读, 格式专属分析建议]
tags: [数据, EDA, 探索性分析, 科学数据, 生物信息, 化学, 显微成像, 光谱, 蛋白组学, 代谢组学, 文件格式识别]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python3, pandas, numpy, biopython, pysam, rdkit, mdanalysis, tifffile, nd2reader, pydicom, pymzml, pyteomics, nmrglue, h5py, scipy]
requires: []
related: [dataset-profiler, data-question-analyzer, guided-statistical-analysis, scientific-database-lookup]
combines_with: [matplotlib-visualization, guided-statistical-analysis]
license: MIT
source: K-Dense-AI/scientific-agent-skills
source_license: MIT
---
# 科学数据探索性分析（200+ 格式）

## 何时使用

适用于：拿到一个**科学领域专用格式**的数据文件，在正式分析前先识别它是什么、能不能读、结构与质量如何、下游该怎么分析。覆盖六大类 200+ 扩展名：

- **化学/分子（60+）**：`.pdb` `.cif` `.mol` `.mol2` `.sdf` `.xyz` `.smi` `.gro` `.fchk` `.cube` `.dcd` `.xtc` `.trr` `.prmtop` `.psf`（结构、计算化学输出、MD 轨迹）。
- **生信/基因组（50+）**：`.fasta` `.fastq` `.sam` `.bam` `.vcf` `.bed` `.gff` `.gtf` `.bigwig` `.h5ad` `.loom` `.mtx`（序列、比对、注释、变异、表达）。
- **显微/成像（45+）**：`.tif` `.ome.tiff` `.nd2` `.lif` `.czi` `.ims` `.dcm` `.nii` `.mrc` `.dm3` `.svs`（光镜、医学影像、全片扫描、电镜）。
- **光谱/分析化学（35+）**：`.fid` `.mzML` `.mzXML` `.raw` `.mgf` `.spc` `.jdx` `.xy` `.wdf`（NMR、质谱、IR/拉曼、UV-Vis、X 射线、色谱）。
- **蛋白/代谢组（30+）**：`.mzML` `.pepXML` `.protXML` `.mzid` `.mzTab` `.sky` `.msp`（质谱蛋白组、代谢/脂质组、多组学）。
- **通用科学（30+）**：`.npy` `.npz` `.hdf5` `.zarr` `.parquet` `.mat` `.fits` `.nc`（数组、层级数据、表）。

典型请求："分析/探索/总结一下 reads.fastq / cells.nd2 / sample.mzML"、"这个科学文件是什么、用什么库读、适合做什么分析"、"出一份数据集 EDA 报告再决定下游"。

不该用（负边界）：
- 只是**通用表/CSV/Excel/Parquet 的逐列画像**（空值率、基数、维度指标推荐）→ 用 `dataset-profiler`，更轻量贴合通用表。
- 要**深度质量打分与清洗修复方案**（DQS、缺失机制）→ 用 `dataset-quality-auditor`。
- 要做**统计建模/推断** → 用 `statsmodels-statistical-modeling`；只**画图** → 用 `matplotlib-visualization` / `seaborn-statistical-charts`。

定位：本技能是"科学格式专属的先看一眼"，价值在**识别冷门格式 + 调对专用库 + 给领域化 EDA 与下游建议**，不替代后续的清洗、建模、可视化。

## 步骤

**1. 识别文件类型**
- 取扩展名（注意复合后缀如 `.ome.tiff`），映射到上面六大类之一。
- 确定格式描述、典型内容、读取库、适配的 EDA 手段。冷门或厂商变体看不准时，先按文本/二进制做通用探查，并向用户确认。

**2. 调对专用库做格式专属 EDA**（核心，按类分流）

- **表格（CSV/TSV/Excel/Parquet）**：`pd.read_csv` → 维度、dtypes、空值、`describe()`、离群、重复。（若纯通用表建议转 `dataset-profiler`。）
- **序列（FASTA/FASTQ）**：序列数、长度分布、GC 含量；FASTQ 另看质量值（Phred）分布。
- **图像（TIFF/ND2/CZI/DICOM）**：维度（X/Y/Z/C/T）、位深与值域、通道/时间戳/空间标定等元数据、强度统计。
- **数组（NPY/HDF5/Zarr）**：shape、dtype、统计摘要、NaN/Inf 检查；大文件用内存映射。
- **质谱/光谱（mzML/mgf/fid）**：谱图数、m/z 与保留时间范围、强度分布、扫描级别（MS1/MS2）。
- **结构（PDB/CIF/mol）**：原子/残基数、链、B 因子分布、缺失残基。

**3. 评估质量**：格式合规性、元数据自洽（声明维度 vs 实际数据）、完整性、离群与异常、与预期范围/分布对比。

**4. 生成 Markdown 报告**，含固定小节：① 标题与元数据（文件名/时间/大小/位置）② 基本信息与格式识别 ③ 格式详情（描述/典型内容/读取库）④ 数据分析（结构/统计/质量）⑤ 关键发现（模式/隐患/质量指标）⑥ 建议（预处理/适配分析/工具/可视化）。

**5. 保存报告**：命名 `{原文件名}_eda_report.md`（如 `reads.fastq` → `reads_eda_report.md`）。

## 指令

**高效查阅格式信息**：参考资料按扩展名小节组织（如 `### .pdb`），按需正则抽取对应段落，不要整文件灌入上下文；同类多文件复用一次查到的格式信息。

**按类装库**（缺库时给清晰安装指引，统一用 `uv pip install <pkg>`）：

| 类别 | 常用库 |
|---|---|
| 生信 | `biopython` `pysam` `pyBigWig` |
| 化学 | `rdkit` `mdanalysis` `cclib` |
| 显微/影像 | `tifffile` `nd2reader` `aicsimageio` `pydicom` |
| 光谱/质谱 | `nmrglue` `pymzml` `pyteomics` |
| 通用 | `pandas` `numpy` `h5py` `scipy` |

导入要容错并给出安装命令：
```python
try:
    from Bio import SeqIO
except ImportError:
    print("Install Biopython: uv pip install biopython")
```

**大文件策略**：抽样（前 N 条）、内存映射（HDF5/NPY）、分块处理（CSV/FASTQ），并基于样本给出估计；声明这是抽样结果。

**多文件/QC/预处理**：多个相关文件先各自 EDA 再做对比汇总与整合建议；QC 关注合规、元数据一致、完整性、离群；按数据特征推荐归一化、缺失插补、离群处理、批次校正、格式转换。

## 示例

FASTQ 序列文件：
```python
from Bio import SeqIO
seqs = list(SeqIO.parse('reads.fastq', 'fastq'))
# 计算：read 数、长度分布、Phred 质量值分布、GC 含量 → 出 QC 建议
# 保存：reads_eda_report.md
```

ND2 显微图像（Nikon，多维 XYZCT）：
```python
from nd2reader import ND2Reader
with ND2Reader('cells.nd2') as images:
    # 提取：维度(XY/Z 栈/时间/通道)、通道波长、像素尺寸标定、强度统计
    # 报告含：图像维度、通道波长、空间标定、图像分析建议
```

CSV 数据集（属通用表，若仅做画像优先转 `dataset-profiler`）：
```python
import pandas as pd
df = pd.read_csv('experiment_results.csv')
# 维度、dtypes、空值模式、统计摘要、相关矩阵、离群检测
```

## 注意事项

- **科学格式高度依赖专用库**：import 失败先给安装命令，别硬读二进制。
- **校验元数据自洽**：交叉核对声明维度与实际数据（如 ND2 标称通道数 vs 实读）。
- **大文件务必抽样/分块/内存映射**，并显式声明结果基于样本。
- **复合扩展名与厂商变体**（`.ome.tiff`、各家 `.raw`）易误判；不确定就问用户或按文本/二进制兜底通用探查。
- **关注数据来源**：记录仪器、软件版本、处理步骤，利于下游复现。
- 本技能侧重"识别 + 格式专属探查 + 出报告"，发现脏数据/需建模/需作图请转交对应技能，不在此阶段越界处理。
- 报告要可执行：给出具体下游分析、工具与代码示例，而非泛泛而谈。

## 互见

- related：`dataset-profiler` —— 通用表/CSV 的轻量逐列画像与维度指标推荐；本技能则专攻科学专用格式。
- related：`dataset-quality-auditor` —— EDA 发现质量隐患后转它做五维审计、DQS 评分与修复方案。
- related：`statsmodels-statistical-modeling` —— 探查后需要严谨统计推断/建模时转它。
- combines_with：`matplotlib-visualization` / `seaborn-statistical-charts` —— 把分布、强度、质量值等画成图。
- combines_with：`csv-data-cleaner` —— 报告暴露脏数据后用它清洗整形。

---

采编自 K-Dense-AI/scientific-agent-skills（MIT 许可）。
