---
name: autodock-vina-docking
title: AutoDock Vina 分子对接
description: 当已知结合口袋、需预测小分子与蛋白靶点的结合构象/亲和力或做虚拟筛选打分排序时使用；用 Vina Python API + Meeko/RDKit 完成受体与配体备制、定义搜索盒、对接打分、构象与结合能分析及批量筛选，产出 PDBQT 构象与能量排名 CSV；不适用于结合位点未知的盲对接（用 DiffDock）、需要 CNN 打分（用 GNINA）或自由能微扰类高精度计算。触发词：分子对接、docking、AutoDock Vina、PDBQT、虚拟筛选、virtual screening、结合能、binding affinity、Meeko、对接盒。
domain: 领域/science
triggers: [分子对接, docking, AutoDock Vina, PDBQT, 虚拟筛选, virtual screening, 结合能, binding affinity, kcal/mol, Meeko, 对接盒, re-docking, 受体备制, 配体备制, exhaustiveness]
tags: [molecular-docking, autodock-vina, drug-discovery, virtual-screening, structural-biology, meeko, rdkit, pdbqt, science]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [vina, meeko, rdkit, prody, py3Dmol, ADFR Suite, python]
requires: []
related: [diffdock-blind-docking, cheminformatics-toolkit, deepchem-drug-discovery, molecular-dynamics-simulation]
combines_with: [pubchem-compound-search, molecular-dynamics-simulation]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

适用于已明确结合口袋、需要基于结构预测蛋白-配体相互作用的任务：

- 预测小分子在靶蛋白上的结合构象（pose）。
- 估算相对结合亲和力（kcal/mol）用于配体排序。
- 对化合物库做虚拟筛选、挑选苗头分子（hit）。
- 把共晶配体回对接（re-docking）验证对接协议（RMSD < 2.0 Å 为通过）。
- 直接由 SMILES 生成对接输入，省去中间文件。
- 为后续分子动力学模拟生成起始构象。

不该用的边界：
- 结合位点未知的盲对接 → 用 **DiffDock**。
- 需要 CNN 打分提升精度 → 用 **GNINA**。
- 需要严格自由能（FEP/TI）等高精度结合自由能 → Vina 打分只是经验评分，仅适合排序而非绝对值。

## 步骤

1. 装环境：`pip install vina meeko rdkit-pypi prody py3Dmol`；受体转 PDBQT 需另装 ADFR Suite（提供 `prepare_receptor`，scripps 下载）。要求 Python 3.8+，建议 Linux/macOS。
2. 备受体：下载 PDB → 用 ProDy 去水去配体留蛋白链 → `prepare_receptor` 转 PDBQT 并加氢。
3. 定盒子：以共晶配体坐标的几何中心为 center，盒尺寸 = 配体外接尺寸 + 10 Å padding；无共晶配体则按文献/可视化手填 center 与 box_size。
4. 备配体：RDKit 由 SMILES 建 3D（务必先 `AddHs`，再 Embed+MMFF 优化）→ Meeko 转 PDBQT 字符串/文件。
5. 对接：`Vina` 加载受体配体 → `compute_vina_maps(center, box_size)` → `dock(exhaustiveness, n_poses)` → `write_poses` 落盘。
6. 分析：`v.energies()` 取每个 pose 的总能/inter/intra（首行即最优）；需要 RDKit 对象用 Meeko 的 `PDBQTMolecule`/`RDKitMolCreate` 反解。
7. 批量筛选：循环库内 SMILES，逐一备制+对接（用 `set_ligand_from_string`），取 `energies()[0][0]` 汇总成 DataFrame 按能量升序排名导出 CSV。

## 指令

```bash
pip install vina meeko rdkit-pypi prody py3Dmol
# ADFR Suite 需单独安装以提供 prepare_receptor
```

```python
# 受体备制：PDB → 去水留蛋白 → PDBQT
import prody, subprocess
pdb_id = "1HPV"
prody.fetchPDB(pdb_id, compressed=False)
protein = prody.parsePDB(f"{pdb_id}.pdb").select("protein")
prody.writePDB(f"{pdb_id}_protein.pdb", protein)
subprocess.run(["prepare_receptor", "-r", f"{pdb_id}_protein.pdb",
                "-o", f"{pdb_id}_receptor.pdbqt", "-A", "hydrogens"], check=True)
```

```python
# 配体备制：SMILES → 3D → PDBQT（先 AddHs！）
from rdkit import Chem
from rdkit.Chem import AllChem
from meeko import MoleculePreparation, PDBQTWriterLegacy
mol = Chem.AddHs(Chem.MolFromSmiles("CC(C)(C)NC(=O)[C@@H]1CN(CCc2ccccc2)C[C@H]1O"))
AllChem.EmbedMolecule(mol, randomSeed=42); AllChem.MMFFOptimizeMolecule(mol)
setups = MoleculePreparation().prepare(mol)
pdbqt_string = PDBQTWriterLegacy.write_string(setups[0])[0]
```

```python
# 对接 + 取能量
from vina import Vina
v = Vina(sf_name="vina", cpu=4)
v.set_receptor(f"{pdb_id}_receptor.pdbqt")
v.set_ligand_from_string(pdbqt_string)
v.compute_vina_maps(center=center.tolist(), box_size=box_size.tolist())
v.dock(exhaustiveness=32, n_poses=10, seed=42)  # seed 保证可复现
v.write_poses("docked.pdbqt", n_poses=10, overwrite=True)
print(v.energies(n_poses=10)[0][0], "kcal/mol")  # 最优 pose 总能
```

关键参数：`exhaustiveness` 默认 8，发表用 32+；`n_poses` 1-20；`energy_range` 默认 3.0；`sf_name` 可选 `vina`/`vinardo`/`ad4`；盒子每边 15-30 Å 需完整包住口袋 + 5-10 Å 余量。

## 示例

回对接验证（cognate docking，检查 RMSD < 2 Å）：

```python
from rdkit.Chem import AllChem
ref = Chem.MolFromPDBFile(f"{pdb_id}_ligand.pdb", removeHs=False)
# 用上面步骤对接同一配体得到 best_pose_rdkit
rmsd = AllChem.GetBestRMS(ref, best_pose_rdkit)
print(f"RMSD {rmsd:.2f} Å -> {'PASS' if rmsd < 2.0 else 'FAIL'}")
```

仅打分/局部优化（不跑搜索，评估已摆好的构象）：

```python
v = Vina(sf_name="vina"); v.set_receptor(receptor_pdbqt)
v.set_ligand_from_file("pre_positioned.pdbqt")
v.compute_vina_maps(center=center.tolist(), box_size=box_size.tolist())
print(v.score()[0])       # 当前构象打分
print(v.optimize()[0])    # 局部最小化后
```

共识打分（多评分函数交叉验证）：循环 `["vina", "vinardo", "ad4"]` 各对接一次比较能量。柔性受体对接用 `prepare_flexreceptor` 生成 flex.pdbqt，`set_receptor("rigid.pdbqt", "flex.pdbqt")`。

## 注意事项

- Meeko 报错多因输入分子缺氢：Meeko 前**务必** `Chem.AddHs(mol)`。
- 对接分数为正（>0）通常是配体出盒或几何坏：核对 center/box 覆盖口袋、检查 3D 坐标。
- 所有 pose 相同 → `exhaustiveness` 太低，提到 32-64。
- 跨次能量不一致 → 搜索非确定性，`v.dock(seed=42)` 固定随机种子。
- `EmbedMolecule` 返回 -1（建 3D 失败）→ `EmbedMolecule(mol, maxAttempts=1000)` 或 `useRandomCoords=True`。
- 筛选慢（>1 min/化合物）→ 降 `exhaustiveness` 到 8-16、缩小盒子。
- `prepare_receptor` 未找到 → ADFR Suite 未入 PATH。
- `PDBQTWriterLegacy` 不存在 → Meeko 版本过旧，`pip install meeko>=0.5`（旧版 API 为 `write_pdbqt_string`）。
- Vina 打分是经验函数，只反映相对优劣，不能当绝对结合自由能；阈值化命中要结合其他证据。

## 互见

- related：`cheminformatics-toolkit` —— 配体库的 SMILES 清洗、性质过滤、相似性筛选作为对接前处理。
- related：`molecular-dynamics-simulation` —— 把对接得到的起始构象交给 MD 做结合稳定性与构象细化。
- related：`protein-language-models`、`scientific-database-lookup` —— 靶点结构/序列与文献数据获取。
- combines_with：`cheminformatics-toolkit` —— 先用化学信息学构建/缩减化合物库，再批量对接排序，构成完整虚拟筛选流水线。

---

本条采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0），在原 autodock-vina-docking 技能基础上适配重写为中文可执行版。
