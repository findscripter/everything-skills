---
name: trackpy-particle-tracking
title: trackpy 单粒子追踪
description: 当需对显微视频做单粒子追踪（SPT）与扩散分析时使用；用 trackpy 的 Crocker-Grier 算法逐帧亚像素定位亮点→连成轨迹→滤短轨→算 MSD 并拟合扩散系数 D（支持 2D/3D、drift 校正、运动模式分类），产出轨迹表/MSD 曲线/D 值/分类；不适用于需图形界面手动校轨（用 TrackMate）、交互可视化编辑（用 napari）或非粒子的图像分割；触发词：trackpy、单粒子追踪、SPT、particle tracking、MSD、扩散系数、轨迹连接、Crocker-Grier、pims
domain: 领域/science
triggers: [trackpy, 单粒子追踪, SPT, particle tracking, MSD, 扩散系数, 轨迹连接, Crocker-Grier, pims, drift 校正, 颗粒检测, 亚像素定位]
tags: [particle-tracking, trackpy, spt, msd, diffusion, microscopy, pims, cell-biology, python, science]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [trackpy, pims, pandas, numpy, scipy, matplotlib, python]
requires: []
related: [scikit-image-bioimage, cellpose-cell-segmentation, dicom-medical-imaging, neuropixels-neural-recording]
combines_with: [matplotlib-visualization]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

当有一段荧光/明场显微视频（标记的颗粒：量子点、荧光珠、囊泡、受体、胶体、病毒等），需要把每个颗粒的运动提取成**单条轨迹**并量化其扩散行为时使用本条。trackpy 用 Crocker-Grier 算法逐帧亚像素定位亮点，连成轨迹，再算均方位移（MSD）/扩散系数/运动模式。典型场景：

- 荧光视频提取个体轨迹与扩散系数 D
- 算 MSD 曲线、区分布朗扩散 / 受限 / 定向运动（anomalous exponent α）
- 胶体动力学、脂膜扩散、胞内货物运输、病毒-细胞相互作用的逐粒子数据
- 共聚焦 z-stack 时间序列做 3D 追踪（捕捉离面运动）
- 去除载物台漂移（drift）后再算本征运动统计
- 跨数百条轨迹做系综 MSD（emsd）以获得有统计功效的群体扩散参数

**不该用本条的边界：**

- 需要图形界面、手动校验/编辑轨迹、或与细胞分割器（Cellpose/StarDist）集成 → 用 **TrackMate**（Fiji/ImageJ 插件）
- 想边看图像边交互可视化与手动编辑轨迹 → 用 **napari** + `napari-trackpy`
- 任务是图像/细胞分割本身，而非点状颗粒的检测与连接 → 用分割工具

## 步骤

标准 2D 流水线（每步可独立调参）：

1. **装环境**：`pip install trackpy pims pandas numpy matplotlib scipy`；读 ND2/CZI/LIF 需另装 `pims-nd2` 或 `aicsimageio`。
2. **读图**：`frames = pims.open("particles.tif")`（惰性读取，省内存，shape 为 (T, Y, X)）。
3. **单帧调参（必做）**：先 `tp.locate(frames[0], diameter=11, minmass=300)` + `tp.annotate()` 目视核对，再批处理。`diameter` 取奇数、≈ 亮点像素直径。
4. **批量检测**：`f = tp.batch(frames, diameter=11, minmass=300)`，画 mass 直方图选 `minmass` 切点（噪声峰与信号峰之间的谷）。
5. **连轨迹**：`t = tp.link(f, search_range=5, memory=3)`（`search_range` 像素=帧间最大位移，取 ≈1.5× 预期；`memory` 容许颗粒短暂消失 N 帧）。
6. **滤短轨**：`t = tp.filter_stubs(t, threshold=10)`，去掉 <10 帧的轨（短轨 MSD 方差大、污染拟合）。
7. **去漂移**：`drift = tp.compute_drift(t); t = tp.subtract_drift(t.copy(), drift)`，**算 MSD 前必做**，否则高估 D。
8. **算 MSD + 拟合 D**：`emsd = tp.emsd(t, mpp=0.16, fps=10, max_lagtime=50)`，对**前 10–20% lag 的线性段**用 `linregress` 拟合，2D 取 `D = slope/4`（3D 取 `slope/6`）。

## 指令

关键参数（来源约束，照搬即可）：

| 参数 | 函数 | 默认 | 范围 | 作用 |
|---|---|---|---|---|
| `diameter` | locate/batch | 必填 | 奇数 ≥3（3D 给元组） | 颗粒像素直径，**必须奇数**；太小裂检、太大并检 |
| `minmass` | locate/batch | 100 | 0~∞ | 最小积分亮度，主噪声过滤；从 0 起、看直方图定切点 |
| `search_range` | link | 必填 | 1~50 px | 帧间最大位移；设 ≈1.5–2× 最大每帧位移 |
| `memory` | link | 0 | 0~10 帧 | 颗粒可缺席帧数；荧光闪烁设 2~3 |
| `threshold` | filter_stubs | 1 | 整数 ≥1 | 最短轨长（帧）；短轨 MSD 不可靠 |
| `max_lagtime` | imsd/emsd | 100 | 整数 | MSD 最大滞后；取总帧数 10–20% 为宜 |
| `mpp` | imsd/emsd | 1 | >0 | 微米/像素（显微标定），换算物理单位 |
| `fps` | imsd/emsd | 1 | >0 | 帧率，换算秒 |
| `separation` | locate/batch | diameter+1 | 整数 | 中心间最小距，防密集区重复计数 |
| `invert` | locate/batch | False | True/False | 明场暗点设 True |

运动分类：对每条 imsd 曲线在 log-log 下拟合 α（anomalous exponent）。`α≈1` 布朗；`α<0.7` 受限/亚扩散；`α>1.3` 定向/超扩散。`D_app = exp(intercept)/4`。

## 示例

完整 2D 流水线（含拟合 D 与导出）：

```python
import trackpy as tp, pims, numpy as np
from scipy.stats import linregress

frames = pims.open("fluorescence_video.tif")          # (T, Y, X)
f = tp.batch(frames, diameter=11, minmass=400, processes=1)
t = tp.link(f, search_range=6, memory=3)
t = tp.filter_stubs(t, threshold=15)                  # 去短轨
drift = tp.compute_drift(t)
t = tp.subtract_drift(t.copy(), drift)                # 去漂移（关键）

mpp, fps = 0.16, 10.0                                  # µm/px, 帧/秒
emsd = tp.emsd(t, mpp=mpp, fps=fps, max_lagtime=50)
lag, msd = emsd.index.values[:10], emsd.values[:10]   # 仅线性段
slope, intercept, r, _, _ = linregress(lag, msd)
D = slope / 4                                          # 2D: MSD=4Dt
print(f"D = {D:.4f} µm²/s  (R²={r**2:.3f})")
t.to_csv("trajectories.csv", index=False)
```

3D 追踪（共聚焦 z-stack，T×Z×Y×X）：`diameter`/`search_range` 用 `(z,y,x)` 元组；z 步通常比 xy 粗 2–5×，对应放大 z 分量。

```python
f0 = tp.locate(frames_4d[0], diameter=(7, 11, 11), minmass=2000)   # 传 3D 体积
t3d = tp.link(f3d, search_range=(3, 6, 6), memory=2)               # 各向异性体素
# z 坐标先按 mpp_z 缩放到 µm，emsd 传 mpp=1；3D 取 D = slope/6
```

去漂移对比：`tp.emsd` 分别在去漂移前后调用，`ax.loglog` 叠图即可看漂移对 MSD 的贡献。剔除聚集体：`f = f[f['ecc'] < 0.3]`（ecc=0 圆、=1 线）。

## 注意事项

- **`diameter` 必须奇数**且 ≈ 实际亮点像素宽；用 `tp.annotate()` 在单帧上目视核对后再 `tp.batch()`，省时间。
- **算 MSD 前先去漂移**：载物台漂移会抬高 MSD、高估 D；`compute_drift` 应只在已知不动的颗粒（fiducial beads）上估计，否则会把真实运动当成漂移减掉。
- **不要手动把位置乘 mpp 再连轨**：`tp.locate` 返回像素坐标，`mpp` 只在 `imsd`/`emsd` 应用；提前缩放会破坏以像素为单位的 `search_range`。
- **只拟合线性段**：MSD 在长 lag 处样本少、噪声大；只取前 10–20% lag，且建议 ≥50 条轨迹做系综 MSD。
- **几乎全是短轨被滤光**：多半 `search_range` 太小或 `memory=0` 遇闪烁——调大 `search_range` 到 1.5–2× 最大每帧位移、`memory` 设 2~3。
- **检测过多/过少**：过多→抬高 `minmass`（取直方图谷值）；过少→降 `minmass`、查对比度、可先做背景扣除。
- **`MemoryError`**：用 pims 惰性读取（默认）、`processes=1`、或对 `tp.locate` 逐帧循环分块。
- **3D 只返回 2D 位置**：说明传进去的是 2D 帧，确认 `frame.ndim == 3`（Z,Y,X）。
- 检测密集时调 `separation` 防重复计数；明场暗点设 `invert=True`。

## 互见

- related：`dicom-medical-imaging` —— 另一类显微/医学影像的读写与处理
- related：`single-cell-rnaseq-analysis` —— 同属细胞生物学定量分析，下游可对接群体统计
- related：`molecular-dynamics-simulation` —— 同样产出轨迹并算 MSD/扩散系数，方法学可互参
- combines_with：`guided-statistical-analysis` —— 对多条轨迹的 D 值/α 做分组统计检验与显著性分析

---

本条采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0），适配重写而非逐字翻译。源技能原始 license 为 BSD-3-Clause（trackpy 代码许可），文档内容按 CC-BY-4.0 署名采编。
