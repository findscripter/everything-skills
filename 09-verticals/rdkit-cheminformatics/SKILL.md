---
name: rdkit-cheminformatics
title: RDKit 化学信息学工具箱
description: 当需要用 RDKit 跑「化合物库画像 + 虚拟筛选」端到端流程时使用；批量解析 SMILES/SDF、标准化去重、算描述符、Lipinski/Veber 类药性过滤、Morgan 指纹 Tanimoto 相似度筛选、SMARTS 子结构过滤、Butina 聚类、反应枚举、2D/3D 构象与绘图，产出描述符表、命中 SDF/CSV 与分子图；不适用于追求更简接口（用 datamol）、蛋白对接/分子动力学/量子化学、纯数据库检索；触发词：rdkit、虚拟筛选、化合物库、描述符、Lipinski、Tanimoto、Morgan 指纹、SMARTS、Butina 聚类、构象生成
domain: 领域/science
triggers: [rdkit, 虚拟筛选, 化合物库, 分子描述符, Lipinski, Veber, Tanimoto, Morgan 指纹, SMARTS, Butina 聚类, 构象生成, 类药性]
tags: [rdkit, cheminformatics, virtual-screening, smiles, fingerprints, descriptors, lipinski, smarts, clustering, drug-discovery, science]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [RDKit, Python, pandas, rdkit.Chem, Descriptors, AllChem, DataStructs, MolStandardize, Butina, Draw]
requires: []
related: [datamol-cheminformatics, cheminformatics-toolkit, molfeat-molecular-featurization, deepchem-drug-discovery]
combines_with: [pubchem-compound-search, chembl-bioactivity-database, autodock-vina-docking]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

需要用 RDKit 把一批化合物从**导入到筛选出命中**走完整条流程时使用本条 —— 它是「化合物库画像 + 虚拟筛选」的端到端工作流，串起描述符、类药性、指纹相似度、子结构、聚类、构象与绘图。

典型场景：

- 对一组化合物批量算物化属性（MW/LogP/TPSA/HBD/HBA/可旋转键），做库画像。
- 用 Lipinski 五规则 + Veber 标准筛出类药分子。
- 以参考活性分子为锚，用 Morgan 指纹 Tanimoto 相似度对库做排序筛选。
- 用 SMARTS 按官能团过滤、统计、定位匹配原子。
- 用 Butina 聚类做多样性子集挑选。
- 反应 SMARTS 组合枚举建库；生成 2D/3D 构象并绘图/导出 SDF/CSV。

**不该用本条的情形**：

- 只做零散的单分子 API 调用、要更简洁的封装接口 —— 用 `datamol`（RDKit 高层包装，自带批处理与容错），或本库的 `cheminformatics-toolkit`（按能力分模块的工具箱视角）。
- 蛋白-配体对接、分子动力学、量子化学/DFT —— 超出 RDKit，需 AutoDock Vina、OpenMM、Psi4 等。
- 多格式互转（MOL2/XYZ/PDB） —— 用 OpenBabel。
- 纯检索化合物数据库 —— 用 PubChem/ChEMBL 检索工具。

## 步骤

1. **载入并校验**：`Chem.MolFromSmiles` / `Chem.SDMolSupplier` 读入，逐个判 `None` 收集失败项。
2. **标准化去重**：`LargestFragmentChooser` 取最大片段去盐、`Uncharger` 中和电荷，按 canonical SMILES 去重。
3. **算描述符**：`rdkit.Chem.Descriptors` 批量算属性，汇成 pandas 表。
4. **类药性过滤**：Lipinski（MW≤500、LogP≤5、HBD≤5、HBA≤10）+ Veber（可旋转键≤10、TPSA≤140）。
5. **相似度筛选**：对类药子集与参考分子算 Morgan 指纹 Tanimoto，按阈值排序取命中。
6. **子结构过滤**（按需）：`MolFromSmarts` + `HasSubstructMatch`/`GetSubstructMatches` 统计与定位官能团。
7. **绘图与导出**：`Draw.MolsToGridImage` 出网格图，`SDWriter`/`to_csv` 导出描述符表、命中 SDF。
8. **进阶分支**（按需）：Butina 聚类挑多样性、反应枚举建库、ETKDG+MMFF 生成 3D 构象。

## 指令

载入 + 标准化去重（去盐/中和/规范化）：

```python
from rdkit import Chem
from rdkit.Chem.MolStandardize import rdMolStandardize

mols = []
for smi in smiles_list:
    m = Chem.MolFromSmiles(smi)      # 失败返回 None，必须判
    if m is not None:
        m.SetProp("_SMILES", smi); mols.append(m)

chooser, uncharger = rdMolStandardize.LargestFragmentChooser(), rdMolStandardize.Uncharger()
seen, std = set(), []
for m in mols:
    m = uncharger.uncharge(chooser.choose(m))   # 取最大片段 + 中和电荷
    canon = Chem.MolToSmiles(m)                  # canonical SMILES 去重键
    if canon not in seen:
        seen.add(canon); std.append(m)
```

描述符表 + 类药性过滤（Lipinski + Veber）：

```python
import pandas as pd
from rdkit.Chem import Descriptors

df = pd.DataFrame([{
    "SMILES": Chem.MolToSmiles(m), "MW": Descriptors.MolWt(m),
    "LogP": Descriptors.MolLogP(m), "TPSA": Descriptors.TPSA(m),
    "HBD": Descriptors.NumHDonors(m), "HBA": Descriptors.NumHAcceptors(m),
    "RotBonds": Descriptors.NumRotatableBonds(m),
} for m in std])

df["Lipinski"] = (df.MW <= 500) & (df.LogP <= 5) & (df.HBD <= 5) & (df.HBA <= 10)
df["Veber"]    = (df.RotBonds <= 10) & (df.TPSA <= 140)
df["DrugLike"] = df.Lipinski & df.Veber
drug_like = [std[i] for i in df[df.DrugLike].index]
```

Morgan 指纹 + Tanimoto 相似度筛选：

```python
from rdkit.Chem import AllChem
from rdkit import DataStructs

ref_fp = AllChem.GetMorganFingerprintAsBitVect(
    Chem.MolFromSmiles("CC(=O)Oc1ccccc1C(=O)O"), radius=2, nBits=2048)  # 阿司匹林为参考
rows = [(Chem.MolToSmiles(m),
         DataStructs.TanimotoSimilarity(
             ref_fp, AllChem.GetMorganFingerprintAsBitVect(m, 2, nBits=2048)))
        for m in drug_like]
sim_df = pd.DataFrame(rows, columns=["SMILES", "Tanimoto"]).sort_values("Tanimoto", ascending=False)
hits = sim_df[sim_df.Tanimoto >= 0.3]            # 阈值越低越宽松（0.3~0.9）
```

SMARTS 子结构过滤 + 绘图导出：

```python
from rdkit.Chem import Draw
q = Chem.MolFromSmarts("[CX3](=O)[OX2H1]")       # 羧酸
n = sum(m.HasSubstructMatch(q) for m in drug_like)
img = Draw.MolsToGridImage(
    [Chem.MolFromSmiles(s) for s in sim_df.head(4).SMILES],
    molsPerRow=2, subImgSize=(300, 300),
    legends=[f"Tan={t}" for t in sim_df.head(4).Tanimoto])
img.save("top_hits_grid.png")
sim_df.to_csv("results/similarity_results.csv", index=False)
```

## 示例

Butina 聚类挑多样性代表（大库去冗余）：

```python
from rdkit.ML.Cluster import Butina
fps = [AllChem.GetMorganFingerprintAsBitVect(m, 2, nBits=2048) for m in std]
dists = []
for i in range(1, len(fps)):
    sims = DataStructs.BulkTanimotoSimilarity(fps[i], fps[:i])
    dists.extend(1 - s for s in sims)            # 距离 = 1 - Tanimoto
clusters = Butina.ClusterData(dists, len(fps), distThresh=0.3, isDistData=True)
diverse = [std[c[0]] for c in clusters]          # 每簇首元素为质心
```

反应枚举（酰胺偶联，组合建库）：

```python
rxn = AllChem.ReactionFromSmarts(
    "[C:1](=[O:2])[OH].[N:3]([H])([H])[C:4]>>[C:1](=[O:2])[N:3][C:4]")
acids  = [Chem.MolFromSmiles(s) for s in ["OC(=O)c1ccccc1", "OC(=O)CC"]]
amines = [Chem.MolFromSmiles(s) for s in ["NCC", "NC1CCCCC1"]]
prods = []
for a in acids:
    for n in amines:
        for pset in rxn.RunReactants((a, n)):
            for p in pset:
                Chem.SanitizeMol(p)              # 产物需手动 sanitize
                prods.append(Chem.MolToSmiles(p))
```

3D 构象 + MMFF 优化（供对接预备）：

```python
m = Chem.AddHs(Chem.MolFromSmiles("CC(=O)Oc1ccccc1C(=O)O"))  # 3D 前先加氢
params = AllChem.ETKDGv3(); params.randomSeed = 42; params.numThreads = 0
cids = AllChem.EmbedMultipleConfs(m, numConfs=10, params=params)
energies = []
for c in cids:
    AllChem.MMFFOptimizeMolecule(m, confId=c)    # 失败可改 UFFOptimizeMolecule
    ff = AllChem.MMFFGetMoleculeForceField(m, AllChem.MMFFGetMoleculeProperties(m), confId=c)
    energies.append((c, ff.CalcEnergy()))
best = min(energies, key=lambda x: x[1])[0]      # 最低能构象
```

## 注意事项

- **永远判 None**：所有 `MolFrom*` 失败返回 `None`，不检查会在后续崩溃。
- **sanitize 调试**：`MolFromSmiles(smi, sanitize=False)` + `DetectChemistryProblems()` 定位价键/芳香性问题；kekulize 失败可 `SanitizeMol(mol, sanitizeOps=Chem.SANITIZE_ALL ^ Chem.SANITIZE_KEKULIZE)`。
- **先标准化再去重**：不去盐/不中和会把同一母核的盐当成不同分子，污染计数与相似度。
- **加氢时机**：依赖氢的描述符与 3D 嵌入前先 `AddHs()`；3D 失败（`EmbedMolecule` 返回 -1）改 `maxAttempts=50, useRandomCoords=True`；MMFF 报空力场时退回 `UFFOptimizeMolecule`。
- **指纹参数**：Morgan radius=2≈ECFP4、3≈ECFP6；nBits 越大碰撞越少（1024~4096）。Tanimoto 阈值默认 0.7，筛选放宽到 0.3 更敏感。
- **SMARTS 匹配规则**：查询未指定的属性匹配任意值；用 `[#6]` 表「任意碳」避免芳香/脂肪不匹配；先用简单 SMILES 验证 pattern。
- **反应产物**：`RunReactants` 返回元组的元组，每份产物须手动 `SanitizeMol`。
- **大库性能**：用 `ForwardSDMolSupplier` 流式读避免 `MemoryError`；用 `Bulk*Similarity` 批量算相似度；`MultithreadedSDMolSupplier` 并行解析。
- **canonical 一致性**：跨 RDKit 版本 canonical SMILES 可能不一致，去重/缓存场景需锁版本。

## 互见

- requires：`cheminformatics-toolkit` —— 先掌握 RDKit 按能力分模块的基础用法，再用本条的端到端筛选流程。
- related：`pubchem-compound-search`、`scientific-database-lookup` —— 上游取化合物结构与活性数据。
- combines_with：`autodock-vina-docking` —— 本条产出的类药命中与 3D 构象作为对接输入；`molecular-dynamics-simulation`、`deepchem-drug-discovery` —— 下游做动力学验证或 ML 打分。

---
本条采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0）。
