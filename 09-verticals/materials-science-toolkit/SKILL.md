---
name: materials-science-toolkit
title: 材料科学工具箱（Pymatgen）
description: 当处理晶体结构/分子体系、转换结构文件格式、做对称性与相图/能带等计算材料学分析、或访问 Materials Project 数据库时使用；用 pymatgen + mp-api 读写结构、做格式转换/对称性/相图稳定性/能带 DOS/表面 slab 分析并生成 VASP 等计算输入；不适用于实验数据统计、纯机器学习势训练或非材料领域。触发词：pymatgen、晶体结构、crystal structure、CIF、POSCAR、相图、phase diagram、能带、band structure、DOS、Materials Project、mp-api、空间群、space group、VASP 输入、slab 表面。
domain: 领域/science
triggers: [pymatgen, 晶体结构, crystal structure, CIF, POSCAR, 相图, phase diagram, 能带, band structure, DOS, Materials Project, mp-api, 空间群, space group, VASP 输入, slab 表面]
tags: [pymatgen, materials-science, crystal-structure, phase-diagram, band-structure, materials-project, vasp, symmetry, science]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [pymatgen, mp-api, MPRester, VASP, Gaussian, Quantum ESPRESSO, uv, python]
requires: []
related: [cheminformatics-toolkit, molecular-dynamics-simulation, astronomy-data-toolkit, scientific-database-lookup]
combines_with: [scientific-database-lookup, matplotlib-visualization]
license: MIT
source: K-Dense-AI/scientific-agent-skills
source_license: MIT
---
## 何时使用

适用于计算材料学的结构与电子结构分析任务：

- 读写/创建晶体结构与分子，在 CIF、POSCAR、XYZ 等 100+ 格式间转换。
- 分析对称性、空间群、晶系、配位环境。
- 构建相图、评估热力学稳定性（energy above hull、分解产物）。
- 分析能带、带隙、态密度（DOS），生成表面 slab、界面、吸附位点、Wulff 形状。
- 程序化访问 Materials Project 数据库（按化学式/体系/性质检索）。
- 生成 VASP / Gaussian / Quantum ESPRESSO 计算输入，搭建高通量工作流。
- 分析衍射（XRD）、弹性张量、磁序。

不该用的边界：
- 不做实验测量数据的统计建模或可视化报表（用通用数据工具）。
- 不训练机器学习势/力场，不跑第一性原理 SCF 本身（pymatgen 只负责前后处理与输入输出，DFT 求解由 VASP 等外部代码完成）。
- 非材料/化学领域的几何或图形计算不适用。

## 步骤

1. 安装：`uv pip install pymatgen`；需要数据库时加 `mp-api`；扩展功能用 `pymatgen[analysis]`、`pymatgen[vis]`。要求 Python ≥ 3.10、pymatgen ≥ 2023.x。
2. 载入结构：优先 `Structure.from_file()` 自动识别格式；自动识别失败时显式指定 `fmt=`。
3. 选择分析模块：对称性用 `SpacegroupAnalyzer`，相图用 `PhaseDiagram`，电子结构用 `Vasprun` + `BSPlotter`/`DosPlotter`，表面用 `SlabGenerator`。
4. 需数据库时：先 `export MP_API_KEY=...`（密钥取自 next-gen.materialsproject.org），再用 `with MPRester() as mpr:` 上下文检索。
5. 生成计算输入用输入集（`MPRelaxSet` 等）而非手写 INCAR，`write_input()` 落盘后交由外部 DFT 代码运行。

## 指令

```bash
# 安装（核心 + Materials Project 接入）
uv pip install pymatgen mp-api

# 配置 Materials Project API Key
export MP_API_KEY="your_api_key_here"
```

```python
from pymatgen.core import Structure, Lattice, Composition

# 读取（自动识别格式）/ 从空间群构建 / 写出
struct = Structure.from_file("POSCAR")
struct = Structure.from_spacegroup("Fm-3m", Lattice.cubic(3.5), ["Si"], [[0, 0, 0]])
struct.to(filename="structure.cif")
print(struct.composition.reduced_formula, struct.get_space_group_info(), f"{struct.density:.2f} g/cm³")
```

## 示例

对称性分析与稳定性判断：

```python
from pymatgen.symmetry.analyzer import SpacegroupAnalyzer
sga = SpacegroupAnalyzer(struct)
print(sga.get_space_group_symbol(), sga.get_space_group_number(), sga.get_crystal_system())
primitive = sga.get_primitive_standard_structure()  # 约化到原胞
```

```python
from mp_api.client import MPRester
from pymatgen.analysis.phase_diagram import PhaseDiagram

with MPRester() as mpr:
    entries = mpr.get_entries_in_chemsys("Li-Fe-O")  # 取相图条目
pd = PhaseDiagram(entries)
for e in entries:
    if e.composition.reduced_formula == "LiFeO2":
        ehull = pd.get_e_above_hull(e)
        print(f"Energy above hull: {ehull:.4f} eV/atom")
        if ehull > 0.001:
            print("分解为:", pd.get_decomposition(e.composition))
```

能带/带隙读取（VASP 结果后处理）：

```python
from pymatgen.io.vasp import Vasprun
vasprun = Vasprun("vasprun.xml")
bs = vasprun.get_band_structure()
gap = bs.get_band_gap()
print(f"带隙 {gap['energy']:.3f} eV, 直接带隙={gap['direct']}, 金属={bs.is_metal()}")
```

表面 slab 生成：

```python
from pymatgen.core.surface import SlabGenerator
slabgen = SlabGenerator(struct, miller_index=(1, 1, 1),
                        min_slab_size=10.0, min_vacuum_size=10.0, center_slab=True)
for i, slab in enumerate(slabgen.get_slabs()):
    slab.to(filename=f"slab_{i}.cif")
```

## 注意事项

- 单位约定：长度 Å、能量 eV、角度 °、磁矩 μB、时间 fs；需要换算用 `pymatgen.core.units`。
- 表面能换算：`E_surf *= 16.021766` 把 eV/Ų 转为 J/m²。
- Materials Project 必须用上下文管理器 `with MPRester() as mpr:`，并尽量批量查询、用性质过滤（如 `energy_above_hull=(0, 0.05)`、`band_gap=(1.0, 3.0)`）减少传输。
- 对称性分析失败多为数值精度问题，可放宽容差：`SpacegroupAnalyzer(struct, symprec=0.1)`。
- 结构读取失败时显式指定格式 `Structure.from_file("file.txt", fmt="cif")`；I/O 建议包 try-except，长期存储用 `as_dict()`/`from_dict()` 以兼容版本。
- 用输入集（`MPRelaxSet`/`MPStaticSet`/`MPNonSCFSet`）而非手写 INCAR；计算后务必检查收敛。
- 新接口用 `mp-api` 包，不要用已弃用的 `pymatgen.ext.matproj`。
- pymatgen 只做前后处理与输入生成；真正的 DFT 计算需由 VASP/QE/Gaussian 等外部代码运行后再回读 `vasprun.xml` 等结果。

## 互见

- first-principles-thinking：在设计材料筛选目标或拆解物理问题时，可配合第一性原理思维明确约束与判据。

---

本条采编自 K-Dense-AI/scientific-agent-skills（MIT 许可），在原 pymatgen 技能基础上适配重写为中文可执行版。
