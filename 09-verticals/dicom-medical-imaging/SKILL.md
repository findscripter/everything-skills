---
name: dicom-medical-imaging
title: DICOM 医学影像处理
description: 当读写/匿名化 DICOM 医学影像（CT、MRI、X 光、超声、PET）或提取像素与元数据时使用；用 pydicom 完成读写、像素数组提取与窗宽窗位、PHI 匿名化、格式转换、压缩解压与序列三维重建；不适用于通用图像处理或非 DICOM 格式（PNG/JPEG/NIfTI 直接处理）。触发词：DICOM、pydicom、医学影像、dcm、PACS、像素数据、影像匿名化、医学图像
domain: 领域/science
triggers: [DICOM, pydicom, 医学影像, dcm, PACS, 像素数据, 影像匿名化, 医学图像]
tags: [dicom, pydicom, medical-imaging, radiology, pixel-data, anonymization, science]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [pydicom, numpy, pillow, matplotlib, pylibjpeg, python-gdcm]
requires: []
related: []
combines_with: []
license: MIT
source: K-Dense-AI/scientific-agent-skills
source_license: MIT
---
## 何时使用

适用：
- 读写或修改 DICOM（.dcm）医学影像与元数据标签
- 从 CT/MRI/X 光/超声/PET 提取像素数组并做窗宽窗位显示
- 为科研或数据共享匿名化（去除 PHI 受保护健康信息）
- DICOM 转 PNG/JPEG/TIFF，或压缩/解压切换传输语法
- 处理 DICOM 序列、结构化报告与多切片三维体重建
- 对接 PACS 影像归档系统的影像数据

不该用：
- 处理普通图片（PNG/JPEG）或非 DICOM 格式（如 NIfTI、NRRD）——直接用 Pillow / nibabel
- 仅做通用数组运算而无需 DICOM 解析时
- 高级影像分割/配准/AI 推理（用 SimpleITK、MONAI 等专业库）

## 步骤

1. 安装 `pydicom` 及按需依赖（numpy/pillow/matplotlib；压缩文件另装解码器）。
2. 用 `pydicom.dcmread()` 读入得到 `Dataset`，先查 `ds.file_meta.TransferSyntaxUID` 判断是否压缩。
3. 访问元数据用属性名（`ds.PatientName`）或标签（`ds[0x0010,0x0010]`）；缺失字段务必先 `hasattr` 或 `ds.get(name, default)`。
4. 取像素用 `ds.pixel_array`；CT/MRI 显示前套 VOI LUT 窗宽窗位。
5. 修改后用 `ds.save_as()` 保存；匿名化后务必逐项核验再外发。

## 指令

```bash
uv pip install pydicom numpy pillow matplotlib
# 压缩 DICOM（JPEG / JPEG2000）需额外解码器：
uv pip install pylibjpeg pylibjpeg-libjpeg pylibjpeg-openjpeg python-gdcm
```

## 示例

读取与元数据：
```python
import pydicom
ds = pydicom.dcmread('file.dcm')
print(ds.PatientName, ds.StudyDate, ds.Modality)
print(ds.file_meta.TransferSyntaxUID.name)  # 判断压缩
```

像素 + 窗宽窗位显示：
```python
import matplotlib.pyplot as plt
from pydicom.pixel_data_handlers.util import apply_voi_lut
arr = ds.pixel_array  # 多帧为 (frames, rows, cols)；RGB 为 (rows, cols, 3)
img = apply_voi_lut(arr, ds) if hasattr(ds, 'WindowCenter') else arr
plt.imshow(img, cmap='gray'); plt.axis('off'); plt.show()
```

匿名化（去 PHI，保留像素）：
```python
phi = ['PatientName','PatientID','PatientBirthDate','PatientSex','PatientAge',
       'PatientAddress','InstitutionName','ReferringPhysicianName',
       'OperatorsName','StudyDescription','SeriesDescription']
for tag in phi:
    if hasattr(ds, tag):
        if tag in ('PatientName','PatientID'):
            setattr(ds, tag, 'ANONYMOUS')
        elif tag == 'PatientBirthDate':
            ds.PatientBirthDate = '19000101'
        else:
            delattr(ds, tag)
if hasattr(ds, 'StudyDate'): ds.StudyDate = '20000101'  # 统一偏移保留时序
ds.save_as('anonymized.dcm')
```

压缩/解压切换传输语法：
```python
ds.decompress(); ds.save_as('uncompressed.dcm', write_like_original=False)
ds2 = pydicom.dcmread('uncompressed.dcm')
ds2.compress(pydicom.uid.JPEGBaseline8Bit); ds2.save_as('compressed.dcm')
```

序列三维重建：
```python
import numpy as np
from pathlib import Path
slices = [pydicom.dcmread(p) for p in Path('series/').glob('*.dcm')]
slices.sort(key=lambda x: float(x.ImagePositionPatient[2]))  # 或 InstanceNumber
volume = np.stack([s.pixel_array for s in slices])  # (slices, rows, cols)
spacing = slices[0].PixelSpacing; thickness = slices[0].SliceThickness  # 体素尺寸 mm
```

转 PNG（先归一化到 0-255）：
```python
from PIL import Image
a = ds.pixel_array
if a.dtype != np.uint8:
    a = ((a - a.min()) / (a.max() - a.min()) * 255).astype(np.uint8)
Image.fromarray(a).save('out.png')
```

DICOM 转 RGB（彩色）：`YBR_FULL` 需用 `convert_color_space(ds.pixel_array,'YBR_FULL','RGB')`。

## 注意事项

- 报「Unable to decode pixel data」：装压缩解码器 `pylibjpeg-libjpeg python-gdcm`。
- 访问标签前用 `hasattr()` 或 `ds.get()` 防 `AttributeError`。
- 图像过暗/过亮：套 VOI LUT 窗宽窗位，或手动用 `WindowCenter`/`WindowWidth`。
- 大序列内存不足：迭代处理、内存映射或降采样。
- 新建实例要 `generate_uid()` 生成新 UID；修改时保留原 UID。
- 三维处理保留 `PixelSpacing` 与 `SliceThickness` 等空间信息。
- 匿名化外发前务必逐项核验，确保无残留 PHI。

## 互见

无（暂无强相关的已有技能）。

---
本条采编自 K-Dense-AI/scientific-agent-skills（MIT）。
