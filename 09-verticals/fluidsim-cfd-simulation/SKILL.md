---
name: fluidsim-cfd-simulation
title: FluidSim 计算流体力学仿真
description: 当需要用 Python 在周期域上跑计算流体力学（CFD）仿真——二维/三维 Navier-Stokes、浅水方程、分层流——并分析湍流、涡动力学或地球物理流时使用；用 FluidSim 伪谱（FFT）求解器配参→建模→start()跑仿真→出涡量/能谱/空间均值图；不适用于有边界/复杂几何的有限元/有限体积流（FluidSim 只做周期域谱方法）、多相流、燃烧或结构静力学；触发词：FluidSim、CFD、流体仿真、Navier-Stokes、湍流、涡动力学、伪谱、浅水方程、分层流、能谱、ns2d、ns3d
domain: 领域/science
triggers: [FluidSim, CFD, 流体仿真, Navier-Stokes, 湍流, 涡动力学, 伪谱方法, 浅水方程, 分层流, 能谱, ns2d, ns3d, computational fluid dynamics, pseudospectral, turbulence]
tags: [fluidsim, cfd, navier-stokes, turbulence, pseudospectral, fft, simulation, geophysical-flow, python, hpc, science]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [FluidSim, FluidFFT, Pythran/Transonic, mpi4py, NumPy, Matplotlib, HDF5/h5py, uv/pip]
requires: []
related: [pymoo-multiobjective-optimization, materials-science-toolkit, sympy-symbolic-math, astropy-astronomy-toolkit]
combines_with: [matplotlib-visualization, scientific-exploratory-data-analysis]
license: MIT
source: K-Dense-AI/scientific-agent-skills
source_license: MIT
---
## 何时使用

当任务需要在**周期域**上对不可压缩流体做数值仿真，并对结果做湍流/涡/谱分析时使用。FluidSim 是面向对象的 Python CFD 框架，用伪谱方法（FFT）求解，配 Pythran/Transonic 编译与 MPI 并行，性能接近 Fortran/C++。典型场景：

- 二维/三维湍流研究：能量与拟涡能级联、涡量动力学、高分辨率 DNS。
- 地球物理流：浅水方程（旋转系、地转平衡）、海洋/大气分层流（Boussinesq、浮力）。
- 经典验证算例：Taylor-Green 涡、双极涡（dipole）能量衰减对比解析解。
- 参数扫描：批量改黏性/分辨率跑系列仿真，分析依赖关系。

**不该用的边界：**
- 需要复杂几何 / 物理边界（机翼、管道、绕流障碍物）——FluidSim 只做**周期边界 + 谱方法**，没有贴体网格，这类问题用有限元/有限体积（OpenFOAM、SU2、FEniCS）。
- 多相流、自由表面、燃烧、可压缩激波——超出本框架求解器范围。
- 结构静力学 / 应力分析（FvK 弹性板求解器是耦合动力学，不是静力 FEA）。
- 体系很大（如 512³ 三维 DNS）却无多核/集群与 FFT 支持时，单机算力不可接受，应先评估 HPC 资源。

## 步骤

1. **装环境**：`uv pip install "fluidsim[fft]"`（多数求解器需 FFT 支持）；并行再加 `[fft,mpi]`。无需 API key。
2. **导入求解器**：按物理问题选 `Simul` 类（见下表）。
3. **建默认参数**：`params = Simul.create_default_params()`，再用点号逐项配置（拼错属性会抛 `AttributeError`，防静默错配）。
4. **配域与分辨率**：`params.oper.nx = params.oper.ny = 256`、`params.oper.Lx = params.oper.Ly = 2*pi`。
5. **配物理与时间步**：黏性 `params.nu_2`、超黏 `params.nu_4`（可选）；`params.time_stepping.t_end`、`USE_CFL=True` 配 `CFL=0.5` 用自适应步长。
6. **配初值与输出**：`params.init_fields.type`（noise/dipole/vortex/from_file/in_script）；`params.output.periods_save.*` 设各类输出的保存周期。
7. **实例化并跑**：`sim = Simul(params); sim.time_stepping.start()`。
8. **分析**：物理场/能谱/空间均值出图，或 `load_sim_for_plot` 载入历史仿真复盘。

## 指令

**求解器选择（关键约束，按物理问题选）：**

| 问题类型 | 求解器 key | 导入 | 特征参数 |
|---|---|---|---|
| 二维湍流、涡动力学、快速测试 | `ns2d` | `from fluidsim.solvers.ns2d.solver import Simul` | — |
| 三维湍流、真实流、高分辨 DNS | `ns3d` | `...ns3d.solver import Simul` | 需 MPI |
| 分层流（海洋/大气） | `ns2d.strat` / `ns3d.strat` | `...ns2d.strat.solver import Simul` | `params.N`（Brunt-Väisälä 频率） |
| 浅水 / 地球物理 / 旋转系 | `sw1l` | `...sw1l.solver import Simul` | `params.f`（科氏参数） |
| 弹性板（Föppl-von Kármán） | `fvk` | `...fvk.solver import Simul` | 流固耦合 |

**最佳实践（务必遵守）：**
- 谱方法只适用周期域；域尺寸 `Lx/Ly` 一般取 `2*pi` 配对应分辨率。
- 长程/高分辨仿真开 `USE_CFL=True` 让步长随流场自适应，比固定步长稳。
- 三维或大算例用 MPI 并行：`mpirun -np 8 python script.py`，进程数与 FFT 分解相匹配。
- 自定义初值用 `init_fields.type = "in_script"`，实例化后取物理场数组写入，再调 `statephys_from_statespect()` 同步谱空间。
- 分析能谱级联时限定准稳态时间窗（`tmin/tmax`），别把初始暂态算进去。
- 输出为 HDF5（`.h5`），三维可视化交给 ParaView / VisIt。

**环境变量（可选）：** `FLUIDSIM_PATH`（输出目录）、`FLUIDDYN_PATH_SCRATCH`（工作目录）。

## 示例

**最小工作流（二维 Navier-Stokes）：**
```python
from fluidsim.solvers.ns2d.solver import Simul
from math import pi

params = Simul.create_default_params()
params.oper.nx = params.oper.ny = 256
params.oper.Lx = params.oper.Ly = 2 * pi
params.nu_2 = 1e-3
params.time_stepping.t_end = 10.0
params.time_stepping.USE_CFL = True
params.init_fields.type = "noise"
params.output.periods_save.phys_fields = 1.0
params.output.periods_save.spectra = 0.5
params.output.periods_save.spatial_means = 0.1

sim = Simul(params)
sim.time_stepping.start()

sim.output.phys_fields.plot("vorticity")   # 涡量场
sim.output.spectra.plot1d(tmin=30.0, tmax=50.0)  # 能量级联
sim.output.spatial_means.plot()             # 体积均值时间序列
```

**自定义初值 · Taylor-Green 涡验证：**
```python
import numpy as np
sim = Simul(params)                          # params.init_fields.type = "in_script"
X, Y = sim.oper.get_XY_loc()
vx = sim.state.state_phys.get_var("vx")
vy = sim.state.state_phys.get_var("vy")
vx[:] =  np.sin(X) * np.cos(Y)
vy[:] = -np.cos(X) * np.sin(Y)
sim.state.statephys_from_statespect()        # 谱空间同步，关键
sim.time_stepping.start()
df = sim.output.spatial_means.load()         # 与解析能量衰减对比
```

**分层流：** `from fluidsim.solvers.ns2d.strat.solver import Simul`，设 `params.N = 2.0`，初值里写浮力场 `b = sim.state.state_phys.get_var("b")`。

**带强迫维持湍流：**
```python
params.forcing.enable = True
params.forcing.type = "tcrandom"   # 时间相关随机强迫
params.forcing.forcing_rate = 1.0
```

**三维 + MPI：** `params.oper.nx = ny = nz = 512` 后 `mpirun -np 64 python script.py`。

**参数扫描：**
```python
for nu in [1e-3, 5e-4, 1e-4]:
    params = Simul.create_default_params()
    params.nu_2 = nu
    params.output.sub_directory = f"nu{nu}"
    Simul(params).time_stepping.start()
```

**复盘历史仿真：**
```python
from fluidsim import load_sim_for_plot
sim = load_sim_for_plot("simulation_dir")
sim.output.phys_fields.plot()
```

## 注意事项

- **许可双层**：本采编源（K-Dense scientific-agent-skills 仓库）为 MIT，可再分发；但 FluidSim **库本身**遵循 CeCILL（GPL 兼容的法国自由软件许可），使用/再分发该库代码时受 CeCILL 约束，与本条目文本许可无关。
- **拼错即报错**：`Parameters` 对未知属性抛 `AttributeError`，是特性不是 bug——靠它发现参数名笔误。
- **域必须周期**：非周期/有边界几何会得到无意义结果，谱方法的硬约束。
- **统计窗口**：能谱、级联、均值分析要丢弃初始暂态，只取准稳态段（`tmin/tmax`）。
- **断点重启**：长仿真可中断重启；先看 `references/simulation_workflow.md` 的 restart 与集群提交流程。
- **性能依赖编译与 FFT**：装 `[fft]` 才有 FluidFFT 后端；Pythran/Transonic 编译热点函数；并行靠 mpi4py，进程数需与 FFT 分解协调。
- **替代/参考**：复杂几何转 OpenFOAM/SU2/FEniCS；谱方法同类有 Dedalus、SpectralDNS。官方文档 https://fluidsim.readthedocs.io/ ；源技能含 `references/` 六个细化文档（installation/solvers/simulation_workflow/parameters/output_analysis/advanced_features）。

## 互见

- related：`molecular-dynamics-simulation` —— 同为原子/连续介质数值模拟，方法论（建模→平衡→产能→分析）相通。
- related：`materials-science-toolkit`、`guided-statistical-analysis` —— 仿真结果的物性提取与统计分析。
- combines_with：`matplotlib-visualization` —— 涡量场、能谱、时间序列出版级出图。

---
本条采编自 K-Dense-AI/scientific-agent-skills（MIT 许可证）。FluidSim 库本身遵循 CeCILL 许可证。
