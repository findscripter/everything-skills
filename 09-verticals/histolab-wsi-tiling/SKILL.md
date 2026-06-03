---
name: histolab-wsi-tiling
title: histolab 全视野病理切片分块
description: 当需要从 WSI 全视野数字病理切片（SVS/TIFF/NDPI 等）中检测组织、批量提取 tile 并做染色归一化、准备深度学习数据集时使用；用 histolab 完成切片加载、组织掩膜、三种分块策略提取与 H&E 染色标准化，产出 tile 图与 CSV 报告；不适用于空间蛋白组、多重免疫成像或深度学习训练流水线（改用 pathml），且 0.7.0 不支持 Windows。触发词：WSI、tile 提取、组织检测
domain: 领域/medical
triggers: [WSI 全视野切片处理, 病理切片分块/tile 提取, 组织检测与掩膜, H&E 染色归一化, 数字病理数据集准备, histolab]
tags: [数字病理, wsi, histolab, tile-extraction, stain-normalization, openslide, misc]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Python, histolab, OpenSlide, matplotlib, pandas]
requires: []
related: [dicom-medical-imaging, cellpose-cell-segmentation, scikit-image-bioimage, imaging-data-commons-query]
combines_with: [computer-vision-expert, pyhealth-clinical-dl]
license: MIT
source: K-Dense-AI/scientific-agent-skills
source_license: MIT
---
## 何时使用

适用于轻量级的全视野病理切片（WSI）处理：从 gigapixel 切片中自动检测组织、提取 tile、做 H&E 染色归一化，准备深度学习数据集或做快速的 tile 级分析。典型诉求：简单流水线、数据集制备、探索性采样。

不该用的边界：
- 需要空间蛋白组学、多重免疫成像（multiplexed imaging）或端到端深度学习训练流水线时，改用 pathml，而非本技能。
- 运行环境为 Windows：histolab 0.7.0 不支持 Windows，需在 Linux/macOS（或 WSL/容器）中运行。
- 仅做单张图像滤镜处理而无 WSI 金字塔/组织检测需求时，本技能偏重。

## 步骤

1. 装系统依赖与库：先装 OpenSlide 系统库，再装 histolab；需要内置 TCGA 样例切片时另装 pooch。
2. 加载切片：用 `Slide(path, processed_path=...)`，先 `print(slide.dimensions / slide.levels)` 并保存 `slide.thumbnail` 做目视检查。
3. 组织检测：选 `TissueMask`（多块组织，全面）或 `BiggestTissueBoxMask`（单块主组织，默认，排除伪影）；提取前务必 `slide.locate_mask(mask)` 预览。
4. 选分块策略：RandomTiler（随机采样/探索/训练数据，设 `seed` 复现）、GridTiler（网格全覆盖/空间分析，`pixel_overlap` 控滑窗）、ScoreTiler（按 scorer 选最有信息量 tile，如 `NucleiScorer`）。
5. 提取前预览：**始终先 `tiler.locate_tiles(slide, n_tiles=...)`** 再 `extract`。
6. 提取：`tiler.extract(slide)`；ScoreTiler 可加 `report_path="tiles_report.csv"` 产出元数据报告；大批量时 `logging.basicConfig(level=logging.INFO)`。
7. 可选染色归一化：用 `MacenkoStainNormalizer` 或 `ReinhardStainNormalizer`，先 `fit(target)` 再 `transform(source)`，跨切片统一染色风格。

## 指令

安装（Linux/macOS）：

```bash
uv pip install histolab
uv pip install pooch   # 仅当用 histolab.data 内置样例切片
```

环境约束：Python 3.8–3.11，histolab 0.7.0，OpenSlide 系统库，Linux 或 macOS；样例数据经 histolab.data（依赖 pooch）。

## 示例

最小工作流（加载 → 预览 → 提取）：

```python
from histolab.slide import Slide
from histolab.tiler import RandomTiler

slide = Slide("slide.svs", processed_path="output/")
tiler = RandomTiler(tile_size=(512, 512), n_tiles=100, level=0, seed=42,
                    check_tissue=True, tissue_percent=80.0)
tiler.locate_tiles(slide, n_tiles=20)   # 提取前必须预览
tiler.extract(slide)
```

三种分块策略：

```python
from histolab.tiler import RandomTiler, GridTiler, ScoreTiler
from histolab.scorer import NucleiScorer

# 随机采样：快、多样
RandomTiler(tile_size=(512,512), n_tiles=100, level=0, seed=42,
            check_tissue=True, tissue_percent=80.0).extract(slide)

# 网格全覆盖
GridTiler(tile_size=(512,512), level=0, pixel_overlap=0,
          check_tissue=True).extract(slide)

# 评分选优：产出 CSV 报告
ScoreTiler(tile_size=(512,512), n_tiles=50, scorer=NucleiScorer(),
           level=0).extract(slide, report_path="tiles_report.csv")
```

自定义组织掩膜（去伪影/标注）：

```python
from histolab.masks import TissueMask
from histolab.filters.compositions import Compose
from histolab.filters.image_filters import RgbToGrayscale, OtsuThreshold
from histolab.filters.morphological_filters import (
    BinaryDilation, RemoveSmallObjects, RemoveSmallHoles)

pipeline = Compose([
    RgbToGrayscale(), OtsuThreshold(), BinaryDilation(disk_size=10),
    RemoveSmallHoles(area_threshold=5000), RemoveSmallObjects(area_threshold=3000)])
custom_mask = TissueMask(filters=pipeline)
slide.locate_mask(custom_mask)
RandomTiler(tile_size=(512,512), n_tiles=100).extract(slide, extraction_mask=custom_mask)
```

染色归一化（Macenko）：

```python
from histolab.stain_normalizer import MacenkoStainNormalizer
from PIL import Image

normalizer = MacenkoStainNormalizer()
normalizer.fit(Image.open("reference_stain.png"))      # 风格参考图
normalizer.transform(Image.open("slide.png")).save("normalized.png")
```

## 注意事项

- 提取前必预览：任何 tiler 都先 `locate_tiles()`，掩膜先 `locate_mask()`。
- `tissue_percent` 经验值 70–90%；提取不到 tile 时调低，背景 tile 太多时调高并开 `check_tissue=True`。
- 提取太慢：用更低金字塔层（level=1 或 2）、减小 `n_tiles`、用 RandomTiler 代替 GridTiler、用 `BiggestTissueBoxMask` 代替 `TissueMask`。
- 复现性：RandomTiler 固定 `seed`。
- 跨切片结果不一致：统一 `seed`、用 Macenko/Reinhard 归一化、按染色质量逐片调 `tissue_percent` 或定制掩膜。
- tile 带伪影：定制标注排除掩膜、调大小目标去除阈值、提取后再做质量过滤。
- 掩膜选型：多块组织全面分析用 `TissueMask`；单块主组织排除伪影用 `BiggestTissueBoxMask`（默认）；特定 ROI/排除标注用自定义 `BinaryMask`。

## 互见

- pathml：进阶空间蛋白组、多重成像、深度学习流水线（本技能的上位替代）。
- 源仓库附带 references/ 深度文档：slide_management、tissue_masks、tile_extraction、filters_preprocessing、visualization，按需查阅实现细节与排错。

---
采编自 K-Dense-AI/scientific-agent-skills（MIT）。
