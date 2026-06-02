---
name: cheminformatics-toolkit
title: 化学信息学工具箱（RDKit）
description: 当需要用 RDKit 对分子做细粒度处理时使用；解析 SMILES/SDF/InChI、计算描述符（MW/LogP/TPSA）、生成指纹与相似度、子结构/SMARTS 检索、反应、2D/3D 构象与绘图，产出分子对象、属性表与图片；不适用于标准简化流程（用 datamol 包装）、蛋白对接/分子动力学、量子化学计算；触发词：rdkit、化学信息学、cheminformatics、SMILES、分子描述符、指纹、Tanimoto、子结构、SMARTS、构象生成
domain: 领域/science
triggers: [rdkit, 化学信息学, cheminformatics, SMILES, 分子描述符, 指纹, Tanimoto, 子结构, SMARTS, 构象生成]
tags: [rdkit, cheminformatics, molecules, smiles, fingerprints, descriptors, substructure, smarts, drug-discovery, science]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [RDKit, Python, rdkit.Chem, Descriptors, rdFingerprintGenerator, DataStructs, AllChem, Draw]
requires: []
related: [materials-science-toolkit, molecular-dynamics-simulation, scientific-database-lookup, astronomy-data-toolkit]
combines_with: [scientific-database-lookup, molecular-dynamics-simulation]
license: MIT
source: K-Dense-AI/scientific-agent-skills
source_license: MIT
---
## 何时使用

需要对分子做**细粒度、可定制**的化学信息学处理时使用 RDKit：

- 读写分子（SMILES / SDF / MOL / InChI），批量供给与写出。
- 计算描述符（分子量、LogP、TPSA、氢键供受体、可旋转键等），做 Lipinski 类药性筛查。
- 生成分子指纹（Morgan/ECFP、MACCS、原子对等）并算相似度、做聚类。
- 子结构 / SMARTS 检索与过滤；化学反应（反应 SMARTS）。
- 生成 2D 描绘坐标或 3D 构象（ETKDG + 力场优化），分子绘图与高亮。
- 自定义 sanitize、标准化、电荷中和、分子哈希/骨架等高级控制。

**不该用本条的情形**：
- 只做常规标准流程、追求更简接口 —— 用 `datamol`（RDKit 的封装）即可。
- 蛋白-配体对接、分子动力学、量子化学/DFT 计算 —— 超出 RDKit 范畴，需 AutoDock、OpenMM、Psi4 等。
- 纯文本检索化合物数据库、绘制统计图表 —— 用通用数据/检索工具。

## 步骤

1. **解析并校验**：`MolFromSmiles/MolFromMolFile/MolFromInchi` 返回 `Mol` 或 `None`；处理前必须判 `None`。导入时默认自动 sanitize（校验价键、感知芳香性、指定手性）。
2. **（可选）控制 sanitize**：需要时 `sanitize=False` 跳过自动净化，再 `Chem.SanitizeMol`；用 `Chem.DetectChemistryProblems(mol)` 定位问题。
3. **选目标能力**：按需走 描述符 / 指纹相似度 / 子结构检索 / 反应 / 坐标生成 / 绘图 分支。
4. **批量与性能**：大数据用 `ForwardSDMolSupplier`（流式）或 `MultithreadedSDMolSupplier`（并行）；用 `Bulk*Similarity` 批量算相似度；用 `pickle` 缓存已解析分子以加速复用。
5. **输出**：导出 canonical SMILES / MOL block / InChI，或写 SDF，或保存 PNG 图片。

## 指令

读写分子：

```python
from rdkit import Chem
mol = Chem.MolFromSmiles('Cc1ccccc1')      # 失败返回 None，必须检查
if mol is None:
    raise ValueError('解析失败')
smi = Chem.MolToSmiles(mol)                 # 规范 SMILES
# 批量：SDMolSupplier / ForwardSDMolSupplier / SDWriter
suppl = Chem.SDMolSupplier('molecules.sdf')
for m in suppl:
    if m is not None:
        ...
```

描述符与类药性（Lipinski 五规则）：

```python
from rdkit.Chem import Descriptors
mw   = Descriptors.MolWt(mol)               # 分子量
logp = Descriptors.MolLogP(mol)             # 脂水分配
tpsa = Descriptors.TPSA(mol)
hbd, hba = Descriptors.NumHDonors(mol), Descriptors.NumHAcceptors(mol)
all_desc = Descriptors.CalcMolDescriptors(mol)   # 一次性算全部，返回 dict
is_drug_like = mw <= 500 and logp <= 5 and hbd <= 5 and hba <= 10
```

指纹与相似度（用现代 `rdFingerprintGenerator` API）：

```python
from rdkit.Chem import rdFingerprintGenerator
from rdkit import DataStructs
gen = rdFingerprintGenerator.GetMorganGenerator(radius=2, fpSize=2048)
fp1, fp2 = gen.GetFingerprint(mol1), gen.GetFingerprint(mol2)
sim = DataStructs.TanimotoSimilarity(fp1, fp2)
sims = DataStructs.BulkTanimotoSimilarity(fp1, [gen.GetFingerprint(m) for m in mols])
```

子结构 / SMARTS：

```python
q = Chem.MolFromSmarts('C(=O)[OH]')         # 羧酸
mol.HasSubstructMatch(q)                    # 是否含
mol.GetSubstructMatches(q)                  # 全部匹配（原子下标元组）
```

反应（反应 SMARTS：reactants >> products）：

```python
from rdkit.Chem import AllChem
rxn = AllChem.ReactionFromSmarts('[C:1]=[O:2]>>[C:1][O:2]')
for pset in rxn.RunReactants((mol,)):
    for p in pset:
        Chem.SanitizeMol(p)                 # 产物需手动 sanitize
```

3D 构象与绘图：

```python
molH = Chem.AddHs(mol)                       # 3D 前先加氢
AllChem.EmbedMolecule(molH, randomSeed=42)   # ETKDG
AllChem.MMFFOptimizeMolecule(molH)           # 或 UFFOptimizeMolecule
from rdkit.Chem import Draw
Draw.MolToFile(mol, 'molecule.png', size=(300, 300))
```

## 示例

类药性分析函数（封装 Lipinski 描述符）：

```python
from rdkit import Chem
from rdkit.Chem import Descriptors

def analyze_druglikeness(smiles):
    mol = Chem.MolFromSmiles(smiles)
    if mol is None:
        return None
    r = {
        'MW': Descriptors.MolWt(mol),
        'LogP': Descriptors.MolLogP(mol),
        'HBD': Descriptors.NumHDonors(mol),
        'HBA': Descriptors.NumHAcceptors(mol),
        'TPSA': Descriptors.TPSA(mol),
        'RotBonds': Descriptors.NumRotatableBonds(mol),
    }
    r['Lipinski'] = (r['MW'] <= 500 and r['LogP'] <= 5
                     and r['HBD'] <= 5 and r['HBA'] <= 10)
    return r
```

相似度筛选（对查询分子在库中找 Tanimoto ≥ 阈值的命中并降序返回）：

```python
from rdkit import Chem, DataStructs
from rdkit.Chem import rdFingerprintGenerator

def similarity_screen(query_smiles, db_smiles, threshold=0.7):
    gen = rdFingerprintGenerator.GetMorganGenerator(radius=2, fpSize=2048)
    qmol = Chem.MolFromSmiles(query_smiles)
    qfp = gen.GetFingerprint(qmol)
    hits = []
    for i, s in enumerate(db_smiles):
        m = Chem.MolFromSmiles(s)
        if m:
            sim = DataStructs.TanimotoSimilarity(qfp, gen.GetFingerprint(m))
            if sim >= threshold:
                hits.append((i, s, sim))
    return sorted(hits, key=lambda x: x[2], reverse=True)
```

## 注意事项

- **永远判 None**：所有 `MolFrom*` 失败返回 `None`，不检查会在后续崩溃。
- **sanitize 失败**：用 `DetectChemistryProblems()` 调试；常见原因为显式价键超限、芳香环 kekulize 失败、自由基电子未显式指定。
- **加氢**：依赖氢的属性/3D 计算前先 `AddHs()`，算完可 `RemoveHs()`。
- **2D vs 3D**：可视化或 3D 分析前要先生成对应坐标（`Compute2DCoords` / `EmbedMolecule`）。
- **SMARTS 匹配规则**：查询中未指定的属性匹配任意值；氢默认忽略除非显式写出；带电查询原子不匹配中性目标，芳香查询原子不匹配脂肪目标。
- **反应产物**：`RunReactants` 返回元组的元组（每组一份产物集），产物需手动 `SanitizeMol`。
- **线程安全**：I/O、坐标生成、指纹/描述符、子结构检索、反应、绘图通常线程安全；**MolSupplier 不可跨线程共享**。
- **性能**：用 `pickle` 缓存分子比重新解析快；优先 `Bulk*Similarity` 批量计算；大文件用 `ForwardSDMolSupplier` 流式读取避免整文件载入。
- 旧式 `AllChem.GetMorganFingerprintAsBitVect` 仍可用，但新代码建议统一用 `rdFingerprintGenerator`。

## 互见

- `first-principles-thinking`：面对非常规分子建模/算法选型问题时，先做第一性拆解再选 RDKit 能力分支。

---
本条采编自 K-Dense-AI/scientific-agent-skills（MIT）。
