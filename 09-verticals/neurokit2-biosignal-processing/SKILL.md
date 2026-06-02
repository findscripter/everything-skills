---
name: neurokit2-biosignal-processing
title: NeuroKit2 生理信号处理（ECG/EEG/EDA）
description: 当需要用 Python 处理与分析生理/生物信号（ECG、PPG、EEG、EDA/GSR、RSP、EMG、EOG）做清洗、峰检测、HRV、SCR、频带功率、复杂度/熵、事件相关分析或多模态联合处理时使用；用 NeuroKit2 跑标准管线并产出处理后信号 DataFrame、特征指标与图；不适用于原始采集/设备驱动、MNE 级 EEG 源重建精算、深度学习端到端建模；触发词：生理信号、生物信号、neurokit2、ECG、心率变异、HRV、EDA、皮电、EEG、呼吸、EMG、肌电、PPG、脉搏波
domain: 领域/medical
triggers: [生理信号, 生物信号, neurokit2, ECG, 心率变异, HRV, EDA, 皮电, EEG, 呼吸, EMG, 肌电, PPG, 脉搏波, 事件相关]
tags: [biosignal, physiology, neurokit2, ecg, hrv, eeg, eda, rsp, emg, ppg, psychophysiology, science]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [neurokit2, python, numpy, pandas, scipy, matplotlib]
requires: []
related: [neuropixels-neural-recording, pyhealth-clinical-dl, dicom-medical-imaging, statsmodels-statistical-modeling]
combines_with: [pyhealth-clinical-dl, matplotlib-visualization, guided-statistical-analysis]
license: MIT
source: K-Dense-AI/scientific-agent-skills
source_license: MIT
---
> domain: 领域/misc（按任务指定，已定勿改）；source: K-Dense-AI/scientific-agent-skills；source_license: MIT

## 何时使用

当你需要用 Python（NeuroKit2 / `import neurokit2 as nk`）对**生理信号**做标准处理与分析时使用本条，典型场景：

- 心血管：ECG、PPG/脉搏波，心率变异（HRV）、脉搏分析、ECG 衍生呼吸（EDR）
- 脑电：EEG 频带功率（Delta/Theta/Alpha/Beta/Gamma）、微状态（microstates）、复杂度
- 自主神经：皮电活动 EDA/GSR、皮肤电反应（SCR）、交感指数
- 呼吸：呼吸率、呼吸变异（RRV）、单位时间呼吸量（RVT，fMRI 用）
- 肌电 EMG（激活检测）、眼电 EOG（眨眼检测）
- 复杂度/熵、分形维数、非线性动力学
- 多模态联合处理（ECG+RSP+EDA…一次跑完）与事件相关（ERP/ERPP）分析

**不该用本条的边界：**

- 原始信号**采集**、设备驱动、实时流采样 → 用厂商 SDK / LSL，本条只处理已采到的信号
- EEG 严肃**源重建/逆问题**、伪迹 ICA 精细流程 → 用 MNE-Python（NeuroKit 仅做轻量 EEG）
- 端到端**深度学习建模/分类** → 用 PyTorch/sklearn，本条产出的是特征而非模型
- 仅做通用数值滤波/FFT 而无生理语义 → 直接用 SciPy 即可

## 步骤

1. 安装环境，确认采样率 `sampling_rate`（最关键参数，全程一致，单位 Hz）
2. 选信号模态，调对应 `nk.<模态>_process(signal, sampling_rate=...)` 得到 `(signals, info)`
3. `signals` 是逐采样点的 DataFrame（含清洗后信号、峰位、相位等列）；`info` 是字典（含峰索引等）
4. 看图核验：`nk.<模态>_plot(signals, info)`
5. 出指标：调 `nk.<模态>_analyze(signals, sampling_rate=...)`，函数按时长**自动选模式**
6. 专项深挖：HRV 用 `nk.hrv*`，EDA 交感用 `nk.eda_sympathetic`，复杂度用 `nk.complexity*` 等
7. 多模态：`nk.bio_process(...)` 一次处理 + `nk.bio_analyze(...)` 汇总

**分析模式（自动按时长二选一，影响 `*_analyze` 行为）：**
- **事件相关**（< 10 秒/逐 epoch）：刺激锁定响应，适合离散试次范式
- **区间相关**（≥ 10 秒）：刻画长时段模式，适合静息态/连续监测

## 指令

安装（NeuroKit2 纯 Python，依赖 numpy/scipy/pandas/matplotlib）：

```bash
uv pip install neurokit2
# 开发版：uv pip install https://github.com/neuropsychology/NeuroKit/zipball/dev
```

各模态核心函数（统一传 `sampling_rate`）：

```python
import neurokit2 as nk

# ECG/PPG —— 清洗→R 峰→分段→质量
signals, info = nk.ecg_process(ecg_signal, sampling_rate=1000)
analysis = nk.ecg_analyze(signals, sampling_rate=1000)        # 自动选模式

# HRV —— 时域/频域/非线性
hrv          = nk.hrv(peaks, sampling_rate=1000)              # 全指标
hrv_time     = nk.hrv_time(peaks)                             # SDNN/RMSSD/pNN50...
hrv_freq     = nk.hrv_frequency(peaks, sampling_rate=1000)    # ULF/VLF/LF/HF...
hrv_nonlin   = nk.hrv_nonlinear(peaks, sampling_rate=1000)    # SD1/SD2/熵/分形
hrv_rsa      = nk.hrv_rsa(peaks, rsp_signal, sampling_rate=1000)  # 呼吸性窦性心律不齐

# EEG —— 频带功率 + 微状态
power      = nk.eeg_power(eeg_data, sampling_rate=250, channels=['Fz','Cz','Pz'])
microstates = nk.microstates_segment(eeg_data, n_microstates=4, method='kmod')

# EDA —— 分解为 tonic/phasic + SCR + 交感
signals, info = nk.eda_process(eda_signal, sampling_rate=100)
sympathetic   = nk.eda_sympathetic(signals, sampling_rate=100)

# RSP —— 呼吸率/变异/RVT
signals, info = nk.rsp_process(rsp_signal, sampling_rate=100)
rrv = nk.rsp_rrv(signals, sampling_rate=100)
rvt = nk.rsp_rvt(signals, sampling_rate=100)

# EMG（激活检测）/ EOG（眨眼）
signals, info = nk.emg_process(emg_signal, sampling_rate=1000)
activation    = nk.emg_activation(signals, sampling_rate=1000, method='threshold')
signals, info = nk.eog_process(eog_signal, sampling_rate=500)

# 通用信号处理（任意信号）
filtered = nk.signal_filter(signal, sampling_rate=1000, lowcut=0.5, highcut=40)
peaks    = nk.signal_findpeaks(signal)
psd      = nk.signal_psd(signal, sampling_rate=1000)

# 复杂度/熵/分形
complexity_indices = nk.complexity(signal, sampling_rate=1000)
apen = nk.entropy_approximate(signal); dfa = nk.fractal_dfa(signal)
```

## 示例

ECG 快速上手（用内置仿真造数据 → 处理 → HRV → 出图）：

```python
import neurokit2 as nk

ecg = nk.ecg_simulate(duration=60, sampling_rate=1000)        # 仿真，便于无数据时演练
signals, info = nk.ecg_process(ecg, sampling_rate=1000)
hrv = nk.hrv(info['ECG_R_Peaks'], sampling_rate=1000)         # R 峰索引在 info 里
nk.ecg_plot(signals, info)
```

多模态联合：

```python
bio_signals, bio_info = nk.bio_process(
    ecg=ecg_signal, rsp=rsp_signal, eda=eda_signal, sampling_rate=1000)
results = nk.bio_analyze(bio_signals, sampling_rate=1000)
```

事件相关电位（找事件 → 切 epoch → 各模态分别做事件相关分析）：

```python
events = nk.events_find(trigger_channel, threshold=0.5)
epochs = nk.epochs_create(processed_signals, events, sampling_rate=1000,
                          epochs_start=-0.5, epochs_end=2.0)
ecg_epochs = nk.ecg_eventrelated(epochs)
eda_epochs = nk.eda_eventrelated(epochs)
grand_avg  = nk.epochs_average(epochs)   # 跨试次平均（含置信区间）
```

## 注意事项

- **采样率是命脉**：`sampling_rate` 必须等于真实采样频率且全流程一致，错了会让 HRV/频域结果全错；不知道就先确认，别猜。
- **先看图再信指标**：每条管线都有 `nk.<模态>_plot`，先肉眼核验清洗与峰检测是否合理，再读 `*_analyze` 数字。
- **峰在 `info`、波形在 `signals`**：如 R 峰索引取自 `info['ECG_R_Peaks']`；HRV 系列函数吃的是峰位（peaks）不是原始波形。
- **< 10 秒 ≈ 事件相关，≥ 10 秒 ≈ 区间相关**：`*_analyze` 自动切换；做 ERP 必须先 `epochs_create` 切片，否则按区间模式跑出的不是你要的东西。
- **EDA 的 tonic/phasic 分解**对预处理与采样率敏感；SCR 检测阈值、EMG `emg_activation` 的 `method` 需按数据调参。
- **EEG 是轻量功能**：频带功率/微状态够用，源定位/伪迹处理请转 MNE。
- 频域 HRV 需足够长且平稳的记录；非线性/复杂度指标对数据长度与噪声敏感，短段慎用。

## 互见

- single-cell-rnaseq-analysis：related —— 同属科研数据分析 Python 工具链，可参照其环境/出图约定
- scientific-database-lookup：related —— 查 NeuroKit2 函数/指标定义与文献时
- guided-statistical-analysis：combines_with —— 对提取出的 HRV/SCR 等特征做组间统计检验与建模

---

本条采编自 K-Dense-AI/scientific-agent-skills（MIT），适配重写而非逐字翻译。
