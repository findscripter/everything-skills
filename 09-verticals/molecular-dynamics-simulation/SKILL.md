---
name: molecular-dynamics-simulation
title: 分子动力学模拟（OpenMM/MDAnalysis）
description: 当需要对蛋白质/小分子体系做分子动力学（MD）模拟与轨迹分析时使用；用 OpenMM 搭建体系并跑能量最小化、NVT/NPT 平衡与产能模拟，再用 MDAnalysis 算 RMSD/RMSF/接触/自由能并出图；不适用于量子化学/电子结构计算、对接打分（docking）或纯实验数据统计；触发词：分子动力学、MD模拟、OpenMM、MDAnalysis、RMSD、RMSF、力场、蛋白质动力学、molecular dynamics、trajectory analysis、PDBFixer
domain: 领域/science
triggers: [分子动力学, MD模拟, OpenMM, MDAnalysis, RMSD, RMSF, 力场, 蛋白质动力学, molecular dynamics, trajectory analysis, PDBFixer]
tags: [molecular-dynamics, openmm, mdanalysis, simulation, structural-biology, biophysics, python, science]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [OpenMM, MDAnalysis, PDBFixer, OpenFF Toolkit, NumPy, Matplotlib, conda/pip]
requires: []
related: [cheminformatics-toolkit, protein-language-models, materials-science-toolkit]
combines_with: [protein-language-models, matplotlib-visualization]
license: MIT
source: K-Dense-AI/scientific-agent-skills
source_license: MIT
---
## 何时使用

当任务需要在原子尺度上模拟分子体系随时间的演化（积分牛顿运动方程）并分析其动力学时使用。典型场景：

- 蛋白质稳定性 / 突变效应、构象采样与柔性分析
- 药物结合模式、停留时间（residence time）、蛋白-配体接触
- 蛋白-蛋白界面动力学、膜蛋白、内在无序蛋白（IDP/IDR）系综
- 从参考结构量化结构涨落（RMSD / RMSF）、估计结合或构象自由能

**不该用的边界：**
- 需要电子结构 / 量子化学（DFT、能级、反应过渡态）——MD 用经典力场，不算电子。
- 仅做分子对接打分（docking / virtual screening）选苗头化合物——那是另一类工具。
- 只有实验数据要做统计/制图，没有要跑模拟轨迹。
- 没有可用 GPU 且体系很大（数十万原子、ns 级）时，CPU 上耗时不可接受，应先评估算力。

## 步骤

1. **装环境**：`conda install -c conda-forge openmm mdanalysis nglview` 或 `pip install openmm mdanalysis`。
2. **修结构**：原始 PDB 用 PDBFixer 补缺失残基/原子、去杂原子、按 pH 加氢。
3. **建体系**：加载力场 → Modeller 加氢 → addSolvent 加水盒（10 Å padding、0.15 M NaCl）→ createSystem（PME + HBonds 约束）。
4. **能量最小化**：消除空间冲突，输出 minimized.pdb。
5. **平衡**：NVT（50–100 ps，设速度到目标温度）→ NPT（加 MonteCarloBarostat 控压，100–500 ps）。
6. **产能模拟**：NPT 长程跑（如 1 ns+），用 DCDReporter 存轨迹、StateDataReporter 记日志、CheckpointReporter 存断点。
7. **分析**：MDAnalysis 加载拓扑+轨迹，对齐后算 RMSD/RMSF/接触，出图，并丢弃前 20–50% 平衡段。

## 指令

**力场选择（关键约束）：**

| 体系 | 推荐力场 | 水模型 |
|------|---------|-------|
| 标准蛋白 | AMBER14 (`amber14-all.xml`) | TIP3P-FB |
| 蛋白+小分子 | AMBER14 + GAFF2/OpenFF | TIP3P-FB |
| 膜蛋白 | CHARMM36m | TIP3P |
| 核酸 | AMBER99-bsc1 或 AMBER14 | TIP3P |
| 无序蛋白 | ff19SB 或 CHARMM36m | TIP3P |

**最佳实践（务必遵守）：**
- 跑 MD 前必先最小化——原始 PDB 有空间冲突。
- 顺序：最小化 → NVT → NPT → 产能；只分析平衡后轨迹。
- 优先 GPU（CUDA/OpenCL），比 CPU 快 10–100×；代码里 try CUDA → OpenCL → CPU 逐级回退。
- 2 fs 步长配 `constraints=HBonds`；用氢质量重分配（HMR）可放到 4 fs。
- 溶剂化体系必须用周期性边界（PBC）；长程静电用 PME 而非简单截断。
- 存断点，MD 易中断、便于重启。

## 示例

**体系准备（OpenMM）：**
```python
from openmm.app import *
from openmm import *
from openmm.unit import *

pdb = PDBFile("fixed.pdb")
forcefield = ForceField("amber14-all.xml", "amber14/tip3pfb.xml")
modeller = Modeller(pdb.topology, pdb.positions)
modeller.addHydrogens(forcefield)
modeller.addSolvent(forcefield, model='tip3p',
                    padding=10*angstroms, ionicStrength=0.15*molar)
system = forcefield.createSystem(
    modeller.topology,
    nonbondedMethod=PME, nonbondedCutoff=1.0*nanometer,
    constraints=HBonds, rigidWater=True, ewaldErrorTolerance=0.0005)
```

**最小化 + 平台回退：**
```python
integrator = LangevinMiddleIntegrator(300*kelvin, 1/picosecond, 0.004*picoseconds)
try:
    platform = Platform.getPlatformByName('CUDA'); props = {'DeviceIndex': '0', 'Precision': 'mixed'}
except Exception:
    try: platform = Platform.getPlatformByName('OpenCL'); props = {}
    except Exception: platform = Platform.getPlatformByName('CPU'); props = {}
sim = Simulation(modeller.topology, system, integrator, platform, props)
sim.context.setPositions(modeller.positions)
sim.minimizeEnergy(tolerance=10*kilojoules_per_mole/nanometer, maxIterations=1000)
```

**NPT 产能（加恒压器 + 报告器）：**
```python
system.addForce(MonteCarloBarostat(1.0*bar, 300*kelvin, 25))
sim.context.reinitialize(preserveState=True)
sim.reporters = [
    StateDataReporter("npt_log.txt", 5000, step=True, potentialEnergy=True,
                      temperature=True, density=True, speed=True),
    DCDReporter("npt_traj.dcd", 5000),
    CheckpointReporter("npt.chk", 50000)]
sim.step(500000)   # 500000 × 2 fs = 1 ns
```

**RMSD 分析（MDAnalysis）：**
```python
import MDAnalysis as mda
from MDAnalysis.analysis import rms, align

u = mda.Universe("npt.pdb", "npt_traj.dcd")
align.AlignTraj(u, u, select="backbone", in_memory=True).run()
R = rms.RMSD(u, select="backbone", ref_frame=0); R.run()
rmsd = R.results.rmsd            # 列：frame, time(ps), RMSD(Å)
```

**RMSF（逐残基柔性）** 用 `rms.RMSF(u.select_atoms("backbone"))` 后按残基取均值；**蛋白-配体接触** 用 `contacts.contact_matrix(protein.positions, ligand.positions, radius=4.5)` 逐帧统计接触残基。

**小分子参数化（OpenFF/GAFF2）：**
```python
from openff.toolkit import Molecule, ForceField as OFFForceField
mol = Molecule.from_smiles(smiles); mol.generate_conformers(n_conformers=1)
ic = OFFForceField("openff-2.0.0.offxml").create_interchange(mol.to_topology())
```

## 注意事项

- **修结构别遗漏**：PDBFixer 的 `removeHeterogens(True)` 会删掉水和配体；若要保留配体，需单独参数化（OpenFF/GAFF2 或 ACPYPE）再合并。
- **时间单位换算**：步数 × 步长才是物理时间；DCD 里时间多为 ps，画图常换算成 ns（`time/1000`）。
- **分析窗口**：前 20–50% 视为平衡段应丢弃，否则 RMSD/自由能被未收敛部分污染。
- **平台精度**：GPU 上用 mixed 精度兼顾速度与稳定性；结果跨平台可能有微小数值差异。
- **替代引擎**：GROMACS、NAMD 是常见替代 MD 引擎；CHARMM-GUI、AmberTools 可做体系搭建/参数化。
- 关键文献：OpenMM (Eastman et al. 2017, PMID 28278240)；MDAnalysis (Michaud-Agrawal et al. 2011, PMID 21500218)。

## 互见

无（本「技能大典」暂无强相关条目）。

---
本条采编自 K-Dense-AI/scientific-agent-skills（MIT 许可证）。
