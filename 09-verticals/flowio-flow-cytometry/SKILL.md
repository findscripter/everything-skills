---
name: flowio-flow-cytometry
title: FlowIO 流式细胞 FCS 解析
description: 当需要用 Python 读写流式细胞 FCS 文件（v2.0–3.1）、把事件数据取成 NumPy 数组、提取通道元数据、转 DataFrame/CSV、生成或批处理 FCS 时使用；产出事件矩阵、通道名/范围、CSV 与新 FCS 文件；不适用于补偿(compensation)、设门(gating)、FlowJo 工作区（改用 FlowKit）或散点/密度可视化（改用 matplotlib）；触发词：FCS、flow cytometry、流式细胞、FlowIO、FlowData、as_array、pnn_labels、create_fcs、多数据集 FCS。
domain: 领域/science
triggers: [FCS, flow cytometry, 流式细胞, FlowIO, FlowData, as_array, pnn_labels, create_fcs, multi-dataset FCS, FCS 转 CSV]
tags: [flowio, flow-cytometry, fcs, numpy, pandas, bioinformatics, cell-biology, science]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, flowio, numpy, pandas]
requires: []
related: [anndata-data-structure, scikit-image-bioimage, celltypist-cell-annotation, single-cell-rnaseq-analysis]
combines_with: [umap-dimensionality-reduction, guided-statistical-analysis, seaborn-statistical-charts]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

当需要在数据流水线中**读写 FCS（Flow Cytometry Standard）文件**做预处理时使用，即使没明说「FlowIO」：

- 解析 FCS 把事件数据取成 NumPy 数组（形状 `(事件数, 通道数)`）。
- 读取通道元数据：短名 PnN、描述名 PnS、量程 PnR、散射/荧光/时间通道索引。
- 把流式数据转成 pandas DataFrame 或导出 CSV。
- 从 NumPy 数组生成新 FCS 文件（默认 FCS 3.1、单精度浮点）。
- 处理含多数据集的 FCS（一个文件塞了多次采集）。
- 批量扫描目录下大量 FCS 做汇总。

**不该用边界**（关键负边界）：
- **补偿 compensation、设门 gating、FlowJo 工作区** → 改用 FlowKit，FlowIO 不做。
- **散点/密度图、设门可视化** → 改用 matplotlib / plotly。
- FlowIO 只管 I/O + 轻量预处理，不是分析框架。

## 步骤

1. **装库**：`pip install flowio numpy pandas`（Python 3.9+，无编译依赖，跨平台）。
2. **判定读取模式**：
   - 只看元数据/批量扫描 → `FlowData(path, only_text=True)`，跳过 DATA 段，提速 10–100×。
   - 取数据做下游分析 → `flow.as_array()`（默认 `preprocess=True`，应用增益/对数缩放）。
   - **要改数据再回写** → `flow.as_array(preprocess=False)` 取原始值（预处理不可逆，先改后写）。
3. **取元数据**：`pnn_labels`/`pns_labels`/`pnr_values` 拿通道名与量程；`scatter_indices`/`fluoro_indices`/`time_index` 按类型切片；`flow.text` 是 TEXT 段全量字典（`$DATE`、`$CYT` 等）。
4. **处理异常文件**：捕获 `MultipleDataSetsError` 改走 `read_multiple_data_sets()`；偏移不一致用 `ignore_offset_discrepancy=True` / `use_header_offsets=True` / `ignore_offset_error=True`。
5. **回写**：`create_fcs(path, events, channels, ...)` 从数组建新文件；或 `flow.write_fcs(path, metadata=...)` 只改元数据不动事件。回写时把 `flow.text` 传进 `metadata` 保留原采集信息。

## 指令

核心 API（`FlowData` 是读取主入口）：

```python
from flowio import FlowData

flow = FlowData("sample.fcs")
print(flow.version, flow.event_count, flow.channel_count)   # '3.1' 等

events = flow.as_array()                 # 预处理后 (n_events, n_channels)
raw    = flow.as_array(preprocess=False) # 原始值（改数据/自定义变换用这个）

# 通道元数据
flow.pnn_labels      # 短名 ['FSC-A','SSC-A','FL1-A',...]
flow.pns_labels      # 描述名 ['Forward Scatter',...]（PnS 可选，可能为空）
flow.pnr_values      # 每通道量程/最大值
flow.scatter_indices # 散射通道索引
flow.fluoro_indices  # 荧光通道索引
flow.time_index      # 时间通道索引（或 None）
flow.text            # TEXT 段全量字典

# 仅元数据（跳过 DATA，批量扫描提速）
FlowData("sample.fcs", only_text=True)
# 排除空/填充通道
FlowData("sample.fcs", null_channel_list=["Time", "Null"])
```

关键参数：

| 参数 | 所属 | 默认 | 作用 |
|---|---|---|---|
| `preprocess` | `as_array()` | `True` | 应用增益/对数缩放；**改数据时设 False** |
| `only_text` | `FlowData()` | `False` | 跳过 DATA 段，仅元数据 |
| `ignore_offset_discrepancy` | `FlowData()` | `False` | 容忍 HEADER/TEXT 偏移不符 |
| `use_header_offsets` | `FlowData()` | `False` | 优先用 HEADER 偏移 |
| `null_channel_list` | `FlowData()` | `None` | 解析时排除指定通道 |
| `nextdata_offset` | `FlowData()` | `None` | 多数据集中按字节偏移读指定集 |
| `opt_channel_names` | `create_fcs()` | `None` | 写入描述名 PnS |
| `metadata` | `create_fcs()` | `None` | 自定义 TEXT 段键值 |

**FCS 四段结构**：HEADER（版本/偏移，`flow.header`）/ TEXT（键值元数据，`flow.text`）/ DATA（事件二进制，`flow.events` 字节、`as_array()` 数组）/ ANALYSIS（可选，`flow.analysis`）。

**预处理含义**（`preprocess=True`）：增益缩放（乘 PnG）→ 对数变换（有 PnE 时 `value = a×10^(b×raw)`）→ 时间通道单位换算。

## 示例

FCS → DataFrame → CSV，并打印每通道统计：

```python
from flowio import FlowData
import pandas as pd

flow = FlowData("sample.fcs")
df = pd.DataFrame(flow.as_array(), columns=flow.pnn_labels)
for col in df.columns:
    print(f"{col}: mean={df[col].mean():.1f} median={df[col].median():.1f} std={df[col].std():.1f}")
df.to_csv("output.csv", index=False)
```

读取-过滤-回写（用原始值，保留原元数据）：

```python
from flowio import FlowData, create_fcs

flow = FlowData("original.fcs")
events = flow.as_array(preprocess=False)   # 改数据必须用原始值
mask = events[:, 0] > 500                   # 例：按 FSC 阈值门控
filtered = events[mask]
create_fcs("filtered.fcs", filtered, flow.pnn_labels,
           opt_channel_names=flow.pns_labels,
           metadata={**flow.text, "$SRC": "Filtered"})
```

多数据集文件：

```python
from flowio import FlowData, read_multiple_data_sets, MultipleDataSetsError
try:
    flow = FlowData("sample.fcs")
except MultipleDataSetsError:
    for i, ds in enumerate(read_multiple_data_sets("sample.fcs")):
        print(i, ds.event_count, ds.channel_count)
        ds.as_array()
```

批量元数据扫描（`only_text` 提速）：

```python
from pathlib import Path
from flowio import FlowData
import pandas as pd

rows = []
for f in Path("data/").glob("*.fcs"):
    try:
        fl = FlowData(str(f), only_text=True)
        rows.append({"file": f.name, "version": fl.version,
                     "events": fl.event_count, "channels": fl.channel_count,
                     "date": fl.text.get("$DATE", "N/A")})
    except Exception as e:
        print(f"Error {f.name}: {e}")
print(pd.DataFrame(rows))
```

只取荧光通道 / 归一化到 [0,1]：

```python
import numpy as np
flow = FlowData("sample.fcs"); events = flow.as_array()
idx = flow.fluoro_indices
fluoro = events[:, idx]
normalized = fluoro / np.array(flow.pnr_values)[idx]   # 按各通道量程归一
```

## 注意事项

- **改数据必用 `preprocess=False`**：预处理（增益/对数）不可逆，过滤/修改一律取原始值，处理完再 `create_fcs()` 回写。
- **不支持原地改 `flow.events`**：必须 `as_array()` 取出 → 修改 → `create_fcs()` 落盘，没有就地写回 API。
- **回写保元数据**：把 `flow.text` 合进 `create_fcs(metadata=...)` 才能留住原采集信息（仪器、日期等）。
- **PnS 可能为空**：部分仪器不写描述名，回退用 `pnn_labels` 短名（PnS 在 FCS 规范里本就可选）。
- **大文件省内存**：百万级事件别一次性全载，`only_text=True` 扫元数据，必要时按通道分块。
- **多数据集易踩坑**：某些仪器把多次采集写进一个文件，务必 `try/except MultipleDataSetsError` 再 `read_multiple_data_sets()`。
- **常见报错对照**：`DataOffsetDiscrepancyError`→`ignore_offset_discrepancy=True`；`FCSParsingError`→`ignore_offset_error=True` 并核验文件有效性；通道数异常→`null_channel_list` 排除填充通道。

## 互见

- related：`anndata-data-structure` —— 把流式事件矩阵纳入注释化数据结构做单细胞式管理。
- related：`single-cell-rnaseq-analysis` —— 流式与单细胞分析在事件×通道矩阵与门控/聚类上思路相通。
- combines_with：`matplotlib-visualization` —— FlowIO 取数后用其画散点/密度/直方图（FlowIO 不做可视化）。
- combines_with：`scikit-learn-ml` —— 对归一化后的事件数据做聚类与降维。
- related：`genomic-file-toolkit` —— 同类「科研专用文件格式解析」技能，可对照 I/O 流水线思路。

---

本条采编自 jaechang-hits/SciAgent-Skills（源许可 BSD-3-Clause；本条目以 CC-BY-4.0 署名再分发）。
