---
name: scikit-image-bioimage
title: scikit-image 生物图像处理
description: 当用 Python 处理显微/荧光生物图像（TIFF/PNG，NumPy 数组）需做读写、滤波去噪、阈值/分水岭分割、形态学、区域属性测量、斑点/特征检测时使用；用 scikit-image+SciPy 跑分割-测量流程并产出标注掩膜、regionprops 表格(CSV)与叠加图；不适用于实时视频(用 OpenCV)、深度学习触碰细胞分割(用 CellPose)、交互式多维可视化(用 napari)；触发词：scikit-image、skimage、显微图像、细胞核分割、watershed、regionprops、阈值、形态学、blob 检测
domain: 领域/science
triggers: [scikit-image, skimage, 显微图像, 细胞核分割, watershed, regionprops, 阈值分割, 形态学, blob 检测, 荧光图像]
tags: [scikit-image, skimage, bioimage, microscopy, segmentation, image-processing, regionprops, watershed, science]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, scikit-image, numpy, scipy, tifffile, pandas, matplotlib]
requires: []
related: [cellpose-cell-segmentation, histolab-wsi-tiling, dicom-medical-imaging, computer-vision-expert]
combines_with: [single-cell-rnaseq-analysis, matplotlib-visualization]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
# scikit-image 生物图像处理

## 何时使用

当你用 Python 对显微/荧光生物图像做处理与定量分析时使用本条，典型场景：

- 预处理荧光显微图像：去背景、去噪、光照不均校正、对比度增强（CLAHE）
- 用阈值或分水岭分割细胞、细胞核、细胞器
- 测量对象属性：面积、周长、强度统计、形状描述子（偏心率等）
- 形态学操作：腐蚀、膨胀、开/闭运算、填孔、骨架化
- 斑点/特征检测（LoG/DoG 检测细胞核、puncta），图像配准
- 批量对一整个文件夹的图像跑同一套流程并导出 CSV

**不该用本条的边界：**

- 实时视频处理 / GPU 加速 → 用 OpenCV
- 深度学习细胞分割（密集贴合细胞精度更好）→ 用 CellPose
- 交互式多维图像可视化与标注 → 用 napari
- 全玻片（WSI）切片处理 → 用 PathML / histolab

## 步骤

1. 装环境并确认 dtype：图像即 NumPy 数组，处理前先 `img_as_float` 转 float64[0,1]
2. 读图：`io.imread` / `tifffile.imread`（多通道 CZYX/ZCYX）/ `ImageCollection`（批量）
3. 预处理：高斯/中值去噪 → top-hat 去背景 → 可选 CLAHE 增强
4. 阈值：`threshold_otsu/li/triangle`，得二值掩膜
5. 清理掩膜：`remove_small_objects` + `remove_small_holes`
6. 分割贴合对象：距离变换 → `peak_local_max` 找种子 → `watershed`
7. 测量：`label` → `regionprops(_table)`（带 `intensity_image`）→ 转 DataFrame
8. 导出/可视化：CSV + `label2rgb` 叠加图，发表图 `dpi=300`

## 指令

```bash
pip install scikit-image numpy scipy matplotlib
pip install tifffile aicsimageio   # 读专有显微格式
python -c "import skimage; print(skimage.__version__)"
```

关键约束：**dtype 决定一切**。多数算法期望 float64∈[0,1]；处理前 `img_as_float(img)`，存盘前 `img_as_uint`。在 uint8/uint16 上做减法会静默截断到 0。

形状约定：灰度 `(H,W)`；RGB `(H,W,3)`；多通道 `(H,W,C)`；Z 栈 `(Z,H,W)`。

## 示例

最小流程（读图 → 去噪 → 阈值 → 测量）：

```python
from skimage import io, filters, measure, img_as_float
import numpy as np

img = img_as_float(io.imread("cells.tif"))
smooth = filters.gaussian(img, sigma=1.5)
binary = smooth > filters.threshold_otsu(smooth)

regions = measure.regionprops(measure.label(binary))
print(f"对象数 {len(regions)}, 平均面积 {np.mean([r.area for r in regions]):.1f} px²")
```

分水岭分离贴合细胞核 + 按核测 GFP 强度（双通道 DAPI=ch0/GFP=ch1）：

```python
from skimage import filters, morphology, measure, img_as_float
from skimage.segmentation import watershed
from skimage.feature import peak_local_max
from scipy import ndimage as ndi
import tifffile, pandas as pd, numpy as np

img = tifffile.imread("cells.tif")
dapi, gfp = img_as_float(img[0]), img_as_float(img[1])

# DAPI 分割 + 清理
binary = filters.gaussian(dapi, sigma=2) > filters.threshold_otsu(dapi)
binary = morphology.remove_small_objects(binary, min_size=200)
binary = morphology.remove_small_holes(binary, area_threshold=500)

# 距离变换 → 种子 → 分水岭
distance = ndi.distance_transform_edt(binary)
coords = peak_local_max(distance, min_distance=30, labels=binary)
mask = np.zeros_like(distance, dtype=bool); mask[tuple(coords.T)] = True
markers = ndi.label(mask)[0]
labels = watershed(-distance, markers, mask=binary)

# 按核测 GFP → DataFrame → CSV
props = measure.regionprops(labels, intensity_image=gfp)
df = pd.DataFrame([{"id": p.label, "area_px2": p.area,
                    "gfp_mean": p.mean_intensity, "ecc": p.eccentricity}
                   for p in props])
df.to_csv("nucleus_measurements.csv", index=False)
print(f"核数 {len(df)}, 平均 GFP {df['gfp_mean'].mean():.3f}")
```

常用算子速查：去背景 `morphology.white_tophat(img, disk(50))`；斑点检测 `feature.blob_log(img, min_sigma=5, max_sigma=20, threshold=0.05)`（列为 `[y,x,sigma]`，半径=√2·sigma）；形态学 `opening/closing(binary, disk(3))`；配准 `registration.phase_cross_correlation(ref, moving)`。

按属性筛选有效细胞：`df[(df.area>100)&(df.area<5000)&(df.ecc<0.9)]`。

## 注意事项

- **先转 float**：`img = img_as_float(img)` 作为第一步，否则整数运算溢出/截断（`OverflowError` 或静默归 0）。
- **务必可视化中间结果**：分割前把二值掩膜叠原图（`label2rgb`）核对——静默分割错误是最常见失败模式。
- **贴合对象必用 watershed**：单纯阈值分不开相邻核；过分割时调大 `peak_local_max` 的 `min_distance` 并平滑距离图。
- **阈值在代表性样本上调**：Otsu 适合双峰直方图，困难图用 `filters.try_all_threshold(img)` 对比 Otsu/Li/Triangle。
- **`regionprops` 缺强度统计**：忘了传 `intensity_image=img`。
- **物理单位换算**：`area_um2 = area_px * pixel_size_um**2`，像素尺寸取自显微镜元数据。
- **批量前先验证**：在 3-5 张人工计数过的图上核对对象数，再跑全量。
- **3D 别当 2D**：先看 `img.shape` 判断是否 Z 栈，逐切片或用 3D 函数处理。

## 互见

- related：`dicom-medical-imaging` —— 临床/放射影像（DICOM）处理，与生物显微成像同属影像分析
- related：`single-cell-rnaseq-analysis` —— 影像定量与单细胞转录组互为单细胞表型的两条证据链
- combines_with：`scientific-database-lookup` —— 把测量结果关联到基因/蛋白数据库做下游解读
- combines_with：`scientific-manuscript-writing` —— 把分割叠加图与定量表格写入论文图表

---

本条采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0），适配重写而非逐字翻译。
