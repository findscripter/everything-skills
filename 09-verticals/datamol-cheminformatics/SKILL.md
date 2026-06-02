---
name: datamol-cheminformatics
title: Datamol 分子处理工具箱
description: 当需要用 datamol（RDKit 的 Pythonic 封装、合理默认+内置并行）跑标准药物发现化学信息学流程时使用；做 SMILES/SDF/CSV/Excel 解析与标准化、描述符与指纹、相似度/聚类/多样性选择、Murcko 骨架与 BRICS/RECAP 切片、3D 构象、分子网格绘图，产出原生 rdkit.Chem.Mol、属性表与图片；不适用于自定义指纹/底层原子键操作/子结构查询优化（用 rdkit）、蛋白对接与分子动力学、深度学习建模（用 deepchem）；触发词：datamol、dm.to_mol、分子标准化、ECFP 指纹、Butina 聚类、pick_diverse、Murcko 骨架、构象生成、scaffold split
domain: 领域/science
triggers: [datamol, dm.to_mol, 分子标准化, ECFP 指纹, Tanimoto, Butina 聚类, pick_diverse, Murcko 骨架, BRICS, RECAP, 构象生成, scaffold split, 类药性筛选, 分子网格绘图]
tags: [datamol, cheminformatics, drug-discovery, rdkit, smiles, fingerprints, descriptors, clustering, scaffold, conformers, science]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, datamol, rdkit, numpy, pandas]
requires: []
related: [rdkit-cheminformatics, cheminformatics-toolkit, molfeat-molecular-featurization, deepchem-drug-discovery]
combines_with: [rdkit-cheminformatics, molfeat-molecular-featurization, deepchem-drug-discovery]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

需要用 **datamol**（RDKit 的轻量 Pythonic 封装，带合理默认、内置并行与 fsspec 云存储）跑**标准**药物发现化学信息学流程时使用。所有分子对象都是原生 `rdkit.Chem.Mol`，与 RDKit 完全互通。典型场景：

- 从 SMILES / SDF / CSV / Excel 解析、校验并**标准化**分子结构。
- 计算描述符与指纹，做 ML 特征化或类药性（Lipinski）筛选。
- 化合物库相似性检索、多样性/中心点选择。
- 按结构相似度做 Butina 聚类。
- Murcko 骨架分析与**基于骨架的 train/test 划分**（避免数据泄漏）。
- BRICS / RECAP / MMPA 分子切片，做片段化设计。
- 3D 构象生成、构象聚类与 SASA。
- 分子网格绘图（对齐、高亮、图例）。

**不该用本条的情形**：
- 自定义指纹定义、底层原子/键操作、子结构查询优化、反应大规模枚举、高级立体化学 —— 直接用 `cheminformatics-toolkit`（RDKit）。
- 蛋白-配体对接、分子动力学 —— 用 AutoDock Vina、OpenMM 等。
- 训练分子性质预测/图神经网络等深度学习模型 —— 用 `deepchem-drug-discovery`。
- 快速基因查询 —— 用 gget 类工具。

## 步骤

1. **装环境**：`uv pip install datamol`；按需 `openpyxl`（Excel 渲染）、`Pillow cairosvg`（绘图）、`s3fs`/`gcsfs`/`adlfs`（云 I/O）。
2. **解析并判 None**：`dm.to_mol(smiles)` 无效返回 `None`，批处理前**必须过滤**，否则崩溃。
3. **标准化（外部数据必做）**：`dm.standardize_mol(m, disconnect_metals=True, normalize=True, reionize=True)`；同一分子的不同 SMILES 写法会产生不同指纹，务必先归一。
4. **选能力分支**：描述符 / 指纹相似度 / 聚类多样性 / 骨架切片 / 构象 / 绘图。
5. **批量用并行**：批操作传 `n_jobs=-1, progress=True`（支持 `read_sdf`、`batch_compute_many_descriptors`、`cluster_mols`、`pdist`、`cdist`、`conformers.sasa`）。
6. **注意规模**：`dm.cluster_mols`（Butina）建全距离矩阵，仅适合 ≤~1000 个分子；更大库用 `dm.pick_diverse()`。
7. **输出**：写 SDF/SMI/XLSX 或用 `dm.viz.to_image` 出图。

## 示例

```python
import datamol as dm
import numpy as np

# 解析 + 标准化 + 转换
mol = dm.to_mol("CC(=O)Oc1ccccc1C(=O)O")          # 阿司匹林
mol = dm.standardize_mol(mol, disconnect_metals=True, normalize=True, reionize=True)
print(dm.to_smiles(mol), dm.to_inchikey(mol))      # 规范 SMILES / InChIKey

# 描述符（单分子 dict） + 批量（并行 DataFrame）
desc = dm.descriptors.compute_many_descriptors(mol)   # {'mw':..,'logp':..,'tpsa':..,'hbd':..,'hba':..}
desc_df = dm.descriptors.batch_compute_many_descriptors(mols, n_jobs=-1, progress=True)

# 类药性过滤（Lipinski Rule of Five）
druglike = (desc_df['mw']<=500)&(desc_df['logp']<=5)&(desc_df['hbd']<=5)&(desc_df['hba']<=10)

# 指纹 + 距离（Tanimoto 距离 = 1 - 相似度）
fp = dm.to_fp(mol, fp_type='ecfp', radius=2, n_bits=2048)   # radius=2 ≈ ECFP4
dist = dm.cdist(actives, library, n_jobs=-1)                # 两集合间距离矩阵
sims = 1 - dist.min(axis=0)                                  # 与任一 active 的最佳相似度

# 聚类（≤~1000）与多样性选择（大库）
clusters = dm.cluster_mols(mols, cutoff=0.2, n_jobs=-1)      # Butina
diverse  = dm.pick_diverse(mols, npick=100)

# Murcko 骨架 + 基于骨架的 train/test 划分（防泄漏）
scaf_smi = [dm.to_smiles(dm.to_scaffold_murcko(m)) for m in mols]
groups = {}
for m, s in zip(mols, scaf_smi): groups.setdefault(s, []).append(m)
keys = list(groups); cut = int(0.8*len(keys))
train = [m for s in keys[:cut] for m in groups[s]]
test  = [m for s in keys[cut:] for m in groups[s]]

# 切片：BRICS / RECAP
brics = dm.fragment.brics(mol)                              # 带 [1*] 连接点的片段 SMILES 集合

# 3D 构象
mol3d = dm.conformers.generate(mol, n_confs=50, rms_cutoff=0.5,
                               minimize_energy=True, method='ETKDGv3')
sasa = dm.conformers.sasa(mol3d, n_jobs=-1)

# 网格绘图（对齐 + 图例）
dm.viz.to_image(diverse[:20], align=True,
                legends=[dm.to_smiles(m) for m in diverse[:20]],
                n_cols=5, mol_size=(300,300), outfile="hits.png")
```

**虚拟筛选骨架**：`dm.cdist(actives, library)` → `1 - dist.min(axis=0)` 得相似度 → `np.argsort(...)[::-1][:100]` 取 top hits → `dm.viz.to_image` 出图。

## 注意事项

- **外部分子先标准化**：不同 SMILES 写法 → 不同指纹，必须先 `standardize_mol`，否则相似度/聚类全错。
- **解析后判 None**：`dm.to_mol` 无效返 `None`，先过滤再批处理。
- **聚类规模上限**：`cluster_mols` 建全距离矩阵，>1000 会 MemoryError，改用 `pick_diverse()`。
- **ML 用骨架划分**：随机划分会把相似结构泄漏进训练/测试集，分子性质预测务必用 scaffold split。
- **指纹按场景选**：ECFP（Morgan，通用结构相似，默认 radius=2/n_bits=2048）；MACCS（167 位，快、空间小）；atompair（距离敏感）。
- **3D 描述符需先有构象**：报「无构象」时先 `dm.conformers.generate`。
- **常见报错**：Murcko 骨架对无环分子返回其自身（需至少一个环系）；`to_xlsx` 缺图装 `openpyxl`；`dm.viz` 导入失败装 `Pillow cairosvg`；远程文件失败装对应 fsspec 后端。
- **关键参数**：`cluster_mols.cutoff`=0.2（Tanimoto 距离，0 同 1 异）；`conformers.generate.method` 取 `ETKDGv3`/`ETKDGv2`/`ETKDG`；`viz.to_image.align`=False（按 MCS 对齐）、`use_svg`=False（输出 SVG/PNG）。

## 互见

- related：`cheminformatics-toolkit` —— datamol 是 RDKit 的封装；需自定义指纹、底层原子键操作、子结构查询优化时下沉到 RDKit。
- related：`deepchem-drug-discovery` —— datamol 出特征/做 scaffold split，DeepChem 接力训练分子 ML 模型。
- related：`chembl-bioactivity-database`、`scientific-database-lookup` —— 取活性/化合物数据后用 datamol 处理。
- combines_with：`pubchem-compound-search` —— PubChem 检索取 SMILES/SDF → datamol 标准化与分析。
- combines_with：`autodock-vina-docking` —— datamol 生成 3D 构象/筛选配体 → Vina 对接。
- combines_with：`cheminformatics-toolkit` —— 标准流程用 datamol，高级控制无缝切回 RDKit（同为原生 Mol）。

---
*采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0），适配重写为中文技能大典条目。*
