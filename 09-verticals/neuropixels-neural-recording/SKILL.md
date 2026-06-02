---
name: neuropixels-neural-recording
title: Neuropixels 神经电生理记录分析
description: 当分析 Neuropixels 高密度细胞外电生理记录（.ap.bin/.lf.bin/.meta、SpikeGLX/OpenEphys/NWB）需做预处理、漂移校正、spike sorting、质量指标与 unit 筛选时使用；用 SpikeInterface + Kilosort4 跑「原始数据→可发表 curated units」全流程并产出 sorting/质量指标 CSV/Phy/NWB；不适用于钙成像或 LFP/EEG/胞内记录、单细胞 RNA-seq（用 single-cell-rnaseq-analysis）；触发词：Neuropixels、spike sorting、Kilosort4、SpikeGLX、Open Ephys、质量指标、unit curation、细胞外电生理
domain: 领域/science
triggers: [Neuropixels, spike sorting, Kilosort4, SpikeGLX, Open Ephys, 质量指标, unit curation, 细胞外电生理]
tags: [neuropixels, spike-sorting, kilosort, spikeinterface, electrophysiology, neuroscience, quality-metrics, science]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [spikeinterface, kilosort, probeinterface, neo, python, phy, nwb]
requires: []
related: [neurokit2-biosignal-processing, dicom-medical-imaging, scientific-exploratory-data-analysis, guided-statistical-analysis]
combines_with: [matplotlib-visualization, scientific-exploratory-data-analysis]
license: MIT
source: K-Dense-AI/scientific-agent-skills
source_license: MIT
---
## 何时使用

当你需要分析 Neuropixels 高密度细胞外电生理记录、把原始数据走到可发表的 curated 单元（units）时使用本条，典型场景：

- 处理 Neuropixels 1.0 / 2.0（单杆 / 4 杆）记录：`.ap.bin`、`.lf.bin`、`.meta`
- 从 SpikeGLX、Open Ephys 或 NWB 格式载入数据
- 预处理：高通滤波、CAR（共同参考）、坏道检测
- 检测并校正运动 / 漂移（drift）
- spike sorting（Kilosort4 / SpykingCircus2 / Mountainsort5 / Tridesclous2）
- 计算质量指标（SNR、ISI violations、presence ratio、amplitude cutoff）
- 用 Allen / IBL 标准做自动 / AI 辅助 curation
- 导出到 Phy（人工复核）或 NWB

**不该用本条的情况**：钙成像 / 双光子、LFP/EEG/MEG、胞内（patch-clamp）记录均不适用——本条专注高密度细胞外锋电位；测序类数据（单细胞 RNA-seq）请用 `single-cell-rnaseq-analysis`。

## 硬件与格式速查

| 探针 | 电极 | 通道 | 备注 |
|---|---|---|---|
| Neuropixels 1.0 | 960 | 384 | **必须** 做 `phase_shift` 校正 |
| Neuropixels 2.0（单杆） | 1280 | 384 | 几何更密 |
| Neuropixels 2.0（4 杆） | 5120 | 384 | 多脑区记录 |

| 格式 | 扩展名 | Reader |
|---|---|---|
| SpikeGLX | `.ap.bin` `.lf.bin` `.meta` | `si.read_spikeglx()` |
| Open Ephys | `.continuous` `.oebin` | `si.read_openephys()` |
| NWB | `.nwb` | `si.read_nwb()` |

## 步骤

1. **载入数据**，按需先截一小段验证流程。
2. **预处理**：高通 → `phase_shift`（仅 1.0）→ 坏道剔除 → 中值 CAR。
3. **查漂移（务必先做）**：估计 motion，画 drift map；漂移 >10μm 才做校正。
4. **spike sorting**：优先 Kilosort4（需 GPU，比 CPU 快 10–50×），无 GPU 退 CPU sorter。
5. **后处理**：建 `SortingAnalyzer`，算 waveforms/templates/amplitudes/correlograms/unit_locations/quality_metrics。
6. **curation**：用 Allen / IBL 阈值过滤，边界单元（如 3<snr<8）转人工或 AI 辅助。
7. **出报告 + 导出**：HTML 报告、Phy、NWB、质量指标 CSV。

## 指令

```python
import spikeinterface.full as si
job_kwargs = dict(n_jobs=-1, chunk_duration='1s', progress_bar=True)

# 1. 载入（SpikeGLX 最常见）
recording = si.read_spikeglx('/path/to/data', stream_id='imec0.ap')
# 看可用流：streams, ids = si.get_neo_streams('spikeglx', '/path/to/data')  # ['imec0.ap','imec0.lf','nidq']
# 测试截段：recording = recording.frame_slice(0, int(60 * recording.get_sampling_frequency()))

# 2. 预处理链
rec = si.highpass_filter(recording, freq_min=400)
rec = si.phase_shift(rec)                 # Neuropixels 1.0 必需，2.0 不需
bad_ids, _ = si.detect_bad_channels(rec)
rec = rec.remove_channels(bad_ids)
rec = si.common_reference(rec, operator='median')
rec.save(folder='preprocessed/')          # 存盘避免重算

# 3. spike sorting
sorting = si.run_sorter('kilosort4', rec, folder='ks4_output')   # 需 GPU
# CPU 备选：'tridesclous2' / 'spykingcircus2' / 'mountainsort5'
# print(si.installed_sorters())

# 4. 后处理 + 质量指标
analyzer = si.create_sorting_analyzer(sorting, rec, sparse=True)
analyzer.compute('random_spikes', max_spikes_per_unit=500)
analyzer.compute('waveforms', ms_before=1.0, ms_after=2.0)
analyzer.compute('templates', operators=['average', 'std'])
analyzer.compute('spike_amplitudes')
analyzer.compute('correlograms', window_ms=50.0, bin_ms=1.0)
analyzer.compute('unit_locations', method='monopolar_triangulation')
analyzer.compute('quality_metrics')
metrics = analyzer.get_extension('quality_metrics').get_data()

# 5. curation（Allen 保守阈值）
good_units = metrics.query(
    "presence_ratio > 0.9 and isi_violations_ratio < 0.5 and amplitude_cutoff < 0.1"
).index.tolist()

# 6. 导出
si.export_to_phy(analyzer, output_folder='phy_export/',
                 compute_pc_features=True, compute_amplitudes=True)
from spikeinterface.exporters import export_to_nwb
export_to_nwb(rec, sorting, 'output.nwb')
metrics.to_csv('quality_metrics.csv')
```

**漂移检查（sorting 前必做）**：估计 motion 并可视化，仅当最大位移 >10μm 才校正（`preset` 选 `kilosort_like` 快 / `nonrigid_accurate` 适合严重漂移）。

**AI 辅助 curation**：在 Claude Code 内可直接让 Claude 查看 waveform/correlogram 图给出判定，无需 API；编程方式则用 anthropic SDK 对边界单元逐个视觉分析。

安装：`pip install spikeinterface[full] probeinterface neo`；sorter 按需 `pip install kilosort`（GPU）/ `spykingcircus` / `mountainsort5`；可选 `anthropic`、`ibl-neuropixel ibllib`。

## 关键参数

- **预处理**：`freq_min` 高通截止 300–400 Hz；`detect_threshold` 坏道检测灵敏度。
- **运动校正**：`preset` = `kilosort_like`（快）/ `nonrigid_accurate`（严重漂移更准）。
- **Kilosort4**：`batch_size`（默认 30000）；`nblocks`（长录增大）；`Th_learned`（越低锋电位越多）。
- **质量指标**：`snr_threshold` 3–5；`isi_violations_ratio` 0.01–0.5；`presence_ratio` 0.5–0.95。

## 示例

```bash
# 全流程一条命令（截一段 60s 验证）
python - <<'PY'
import spikeinterface.full as si
rec = si.read_spikeglx('raw_data/recording_g0/recording_g0_imec0', stream_id='imec0.ap')
rec = rec.frame_slice(0, int(60*rec.get_sampling_frequency()))
rec = si.common_reference(si.phase_shift(si.highpass_filter(rec, freq_min=400)), operator='median')
sorting = si.run_sorter('kilosort4', rec, folder='ks4_output')
print('units:', len(sorting.unit_ids))
PY
```

典型工程目录：`raw_data/` → `preprocessed/` → `motion/` → `sorting_output/` → `analyzer/` → `phy_export/` → `results/`（`quality_metrics.csv` / `curation_labels.json` / `output.nwb`）。

## 注意事项

1. **永远先查漂移** 再 sorting：drift >10μm 会显著拖累质量。
2. **Neuropixels 1.0 用 `phase_shift`**，2.0 不需要——用错会破坏波形对齐。
3. **存预处理结果**（`rec.save(folder=...)`）避免重算。
4. **Kilosort4 用 GPU**：比 CPU 快 10–50×。
5. **自动 curation 只是起点**，边界单元务必人工 / AI 复核；关键实验导出到 Phy 做人工把关。
6. **记录你的阈值**：不同分析需不同标准，阈值要可追溯。
7. 进一步参考：SpikeInterface 文档（spikeinterface.readthedocs.io）、Kilosort4（github.com/MouseLand/Kilosort）、IBL ibl-neuropixel、Allen ecephys_spike_sorting、Bombcell（自动 QC）。

## 互见

- related：`single-cell-rnaseq-analysis` —— 同为 K-Dense 科学计算系，但面向测序而非电生理
- related：`scientific-database-lookup` —— 查神经科学 / 基因相关数据库
- combines_with：`nextflow-pipeline-builder` / `snakemake-workflow-engine` —— 把 sorting 多步流程封装成可复现 pipeline

---

采编自 K-Dense-AI/scientific-agent-skills（MIT）。

> 适配说明：原任务给定 `domain=领域/misc`，但本仓库 `taxonomy.json` 中 09-verticals（领域）卷无 `misc` 类，`scripts/build-index.mjs`（line 108）会对未受控类报 **error**；同源姊妹条目 `single-cell-rnaseq-analysis` 已采用 `领域/science`。故落盘时 frontmatter 应写 `domain: 领域/science` 以通过校验。建议 frontmatter：`license: MIT`、`source: K-Dense-AI/scientific-agent-skills`、`source_license: MIT`、`status: stable`、`agents: [claude-code, codex, cursor, gemini-cli]`。
