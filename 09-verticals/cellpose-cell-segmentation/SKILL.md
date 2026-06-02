---
name: cellpose-cell-segmentation
title: Cellpose 细胞分割
description: 当需要在荧光/明场显微图像中分割单个细胞或细胞核、且阈值法因强度不均或细胞贴边而失效时使用；用 Cellpose 预训练流场模型（cyto3/nuclei/tissuenet）免调参产出整数标签掩膜（每细胞唯一 ID），可批处理、3D、并接 regionprops 量形态学；不适用于细胞分得开且阈值/分水岭已够（用 scikit-image watershed）、星凸核优化（用 StarDist）或临床 CT/MRI 体素分割（用 nnU-Net）；触发词：Cellpose、细胞分割、细胞核分割、cyto3、nuclei、label mask、do_3D、显微图像
domain: 领域/science
triggers: [Cellpose, 细胞分割, 细胞核分割, cyto3, nuclei, label mask, do_3D, 显微图像, regionprops, diameter]
tags: [cellpose, cell-segmentation, microscopy, deep-learning, fluorescence, label-mask, regionprops, scikit-image, science, bioimage]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [cellpose, numpy, scikit-image, matplotlib, pandas, python]
requires: []
related: [scikit-image-bioimage, histolab-wsi-tiling, trackpy-particle-tracking, dicom-medical-imaging]
combines_with: [single-cell-rnaseq-analysis]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
# Cellpose 细胞分割

## 何时使用

当你要在荧光或明场显微图像中**分割出单个细胞 / 细胞核**，而规则法（阈值 + 分水岭）因强度不均、细胞贴边、形态多样而失效时，用本条。Cellpose 用流场（flow-based）神经网络，靠预训练模型（`cyto3`/`nuclei`/`tissuenet`）跨细胞类型、放大倍数、染色条件泛化，**免手工调阈值**，直接产出整数标签掩膜（0=背景，1..N=每个细胞唯一 ID），可直接喂 scikit-image `regionprops` 量形态/强度。典型场景：

- 荧光图中分割贴边、强度不均的细胞或核（阈值法分不开）
- 大批显微数据集批处理，逐图免调参
- 单一模型分割多种细胞（贴壁细胞、血细胞、细菌、类器官）
- 产出标签掩膜供下游测面积/强度/形状
- z-stack 三维体素分割（`do_3D=True`）

**不该用本条的边界：**

- 细胞分得很开、规则阈值已经够 → 用 **scikit-image watershed**，无需深度学习
- 目标是星凸形核（神经元、密集核） → **StarDist** 往往更准
- 临床/放射 CT、MRI 体素分割 → 用 **nnU-Net** 一类医学分割，非本条
- 它做的是**实例分割掩膜**，不做分类/计数解释，也不替代下游统计

## 步骤

1. 装环境：`pip install cellpose`（要 GUI 加 `[gui]`，有 CUDA 则装 GPU 版 torch 提速 10–50×）。
2. 读图 + 看通道布局：确认是单通道 `(H,W)` 还是多通道 `(H,W,C)`。
3. 选模型：细胞质/整细胞用 `cyto3`（最通用），DAPI 核用 `nuclei`，组织切片用 `tissuenet`。
4. 设 `channels=[细胞质通道, 核通道]`：灰度图用 `[0,0]`；多通道按 1-indexed（1=R,2=G,3=B），如绿质蓝核 `[2,3]`。
5. `model.eval(diameter=0,...)` 跑分割：`diameter=0` 自动估直径；给近似像素值更准。
6. 调阈值：误检多 → 调高 `flow_threshold`（0.6–0.9）；漏检多 → 调低 `cellprob_threshold`（如 -2）。
7. 存掩膜 + 质检：`np.save` 存 `.npy`，或存 `uint16` TIFF 供 FIJI/ImageJ；叠原图画边界目检。
8. 量化：`regionprops_table` 出每细胞面积/质心/偏心率/强度 → DataFrame → CSV。

## 指令

安装与自检：

```bash
pip install cellpose                 # 基础
pip install cellpose[gui]            # 含 GUI
# GPU（CUDA 11.8 示例）
pip install cellpose torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
python -c "from cellpose import models; print('Cellpose ready')"
```

关键参数（`models.Cellpose(...)` 与 `model.eval(...)`）：

| 参数 | 默认 | 范围/取值 | 作用 |
|---|---|---|---|
| `model_type` | `"cyto3"` | `cyto3`/`cyto2`/`nuclei`/`tissuenet`/`CP`/自定义路径 | 预训练模型；`cyto3` 最通用，`nuclei` 专做 DAPI 核 |
| `diameter` | `30` | 0–500 px | 近似细胞直径；`0`=自动估 |
| `channels` | `[0,0]` | `[质, 核]`（0=灰,1=R,2=G,3=B） | 细胞质与核染色的通道索引 |
| `flow_threshold` | `0.4` | 0.1–1.0 | 流场一致性阈值；调高更严（减误检） |
| `cellprob_threshold` | `0.0` | −6–6 | 细胞概率切点；调低检出更多细胞 |
| `gpu` | `False` | `True`/`False` | 启用 GPU 推理（需 CUDA torch） |
| `do_3D` | `False` | `True`/`False` | z-stack 三维分割 |
| `min_size` | `15` | 整数 px² | 小于此面积的对象丢弃 |

返回 `masks, flows, styles, diams`：`masks` 为 int 标签图，`diams` 为估计平均直径（px）。

CLI 批处理（目录内所有 TIFF）：

```bash
cellpose --image_path images/ --pretrained_model cyto3 \
         --diameter 0 --chan 0 --save_tif --no_npy
# 加 --use_gpu 启用 GPU；结果存为 images/*_cp_masks.tif（FIJI 兼容）
```

## 示例

整细胞分割 + 形态量化（cyto3）：

```python
from cellpose import models
from skimage import io
from skimage.measure import regionprops_table
import numpy as np, pandas as pd

img = io.imread("cells.tif")                 # (H,W) 或 (H,W,C)
model = models.Cellpose(model_type="cyto3", gpu=False)

masks, flows, styles, diams = model.eval(
    img, diameter=0, channels=[0, 0],        # 灰度图
    flow_threshold=0.4, cellprob_threshold=0.0,
)
print(f"检出细胞 {masks.max()} 个，估计直径 {diams:.1f}px")
np.save("masks.npy", masks)

# 每细胞形态 + 强度
props = regionprops_table(
    masks, intensity_image=img,
    properties=["label", "area", "centroid", "eccentricity",
                "mean_intensity", "equivalent_diameter_area"],
)
df = pd.DataFrame(props)
df.to_csv("cell_measurements.csv", index=False)
print(f"测量 {len(df)} 细胞，面积中位 {df['area'].median():.0f}px²")
```

DAPI 核分割（nuclei 模型，存 uint16 TIFF 供 ImageJ）：

```python
from cellpose import models
from skimage import io
import numpy as np

model = models.Cellpose(model_type="nuclei", gpu=False)
dapi = io.imread("dapi.tif")
masks, *_ = model.eval(dapi, diameter=30, channels=[0, 0], flow_threshold=0.4)
io.imsave("nuclei_masks.tif", masks.astype(np.uint16))   # uint16 防 >255 细胞溢出
print(f"分割核 {masks.max()} 个")
```

质检叠图（标签掩膜 + 红色边界叠原图）：

```python
import matplotlib.pyplot as plt
from skimage.segmentation import find_boundaries

overlay = np.stack([img / img.max()] * 3, axis=-1)
overlay[find_boundaries(masks, mode="inner")] = [1, 0, 0]
fig, ax = plt.subplots(1, 2, figsize=(10, 5))
ax[0].imshow(masks, cmap="tab20"); ax[0].set_title(f"{masks.max()} cells")
ax[1].imshow(overlay);             ax[1].set_title("outlines overlay")
plt.savefig("segmentation_result.png", dpi=150)
```

## 注意事项

- **直径设错最常翻车**：全并成一团 → 直径设大了或细胞太密，调小 `diameter`、调高 `flow_threshold` 到 0.6–0.8；检出过少 → 直径设小了或 `cellprob_threshold` 太高，先用 `diameter=0` 自动估、把 `cellprob_threshold` 调到 −2。
- **通道索引是 1-indexed**：多通道图 `channels` 用 1=R/2=G/3=B，灰度才用 `[0,0]`；填错会分割空通道。
- **uint8 会溢出**：单图 >255 细胞时存掩膜必须 `np.uint16` 或 `np.int32`，否则 ID 截断。
- **GPU 显存不足**：大图分块处理、降 `batch_size`、或裁剪；3D 在 CPU 上极慢，尽量开 GPU 并用 `anisotropy` 校正层间距。
- **跨细胞类型泛化差**：换 cell type 注释质量掉时，挨个试各预训练模型；仍不行就用 10–20 张标注图 `train.train_seg` 从 `cyto3` 微调。
- **首次联网下载权重**：`from cellpose import models` 触发模型下载，离线环境需预缓存。
- 误检背景被标 → 调高 `flow_threshold`（0.6–0.9）并加大 `min_size`。

## 互见

- combines_with：`guided-statistical-analysis` —— 把每细胞 regionprops 量值（面积/强度）接入分组统计检验
- related：`single-cell-rnaseq-analysis` —— 同属单细胞分析栈，前者从图像、后者从表达谱刻画细胞
- related：`celltypist-cell-annotation` —— 形态分割得掩膜，表达谱注释得类型，互补
- related：`gene-set-enrichment-analysis`、`scientific-database-lookup`

---

本条采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0），适配重写而非逐字翻译。
