---
name: diffdock-blind-docking
title: DiffDock 扩散模型盲对接
description: 当不知道配体在蛋白何处结合、需要盲对接或传统对接失败、想探索多种结合模式时使用；用 DiffDock 扩散生成模型从蛋白 PDB 与配体 SMILES/SDF 直接采样并按置信度排序的结合构象，提取口袋残基、可视化、可转 PDBQT 交 Vina 重打分；不适用于口袋已知且要高通量（用 Vina/GNINA）、>1万化合物大规模筛选（用 DiffDock-L/GNINA）、量子化学或纯实验统计；触发词：盲对接、DiffDock、蛋白配体对接、结合位点预测、扩散对接、blind docking、docking pose、置信度排序
domain: 领域/science
triggers: [盲对接, DiffDock, 蛋白配体对接, 结合位点预测, 扩散对接, blind docking, docking pose, 置信度排序, binding site]
tags: [diffdock, docking, blind-docking, diffusion-model, drug-discovery, structural-biology, rdkit, science]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [DiffDock, PyTorch, RDKit, Biopython, NGLview, OpenBabel, AutoDock Vina, conda/pip]
requires: []
related: [autodock-vina-docking, deepchem-drug-discovery, cheminformatics-toolkit, molecular-dynamics-simulation]
combines_with: [cheminformatics-toolkit, molecular-dynamics-simulation, alphafold-database-access]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

DiffDock 把对接当作**生成问题**而非搜索问题：用扩散模型从蛋白结构 + 配体 SMILES 直接采样结合构象，**无需预先指定结合位点**，在整个蛋白表面采样，输出按置信度排序的多个构象。适用场景：

- **盲对接（结合位点未知）**：不知道配体在蛋白上结合在哪，想发现候选结合位点。
- **传统对接失败的难题靶标**：变构位点、柔性区域、目标口袋无共晶结构的蛋白。
- **探索多种结合模式**：生成多样化构象系综，理解结合事件的构象柔性。
- **SAR / 片段筛选假设生成**：快速对一系列类似物对接、比较预测结合模式，或为片段分子找可能的结合位点。

**不该用的边界：**
- **口袋已定、要高通量**：结合位点清晰时，AutoDock Vina / GNINA 更快、精度相当——优先用它们。
- **大规模虚拟筛选（>1 万化合物）**：用 GNINA 或 DiffDock-L（大规模版），别用标准 DiffDock。
- 需要电子结构/量子化学、或只有实验数据要统计制图——不在本技能范围。

## 步骤

1. **装环境**：克隆 DiffDock，建 conda 环境，装 CUDA 版 PyTorch 与依赖，下载预训练权重（见示例）。强烈建议 GPU；CPU 推理约 5–10 min/化合物。
2. **清蛋白**：Biopython 去 HETATM（配体、水），只保留蛋白 ATOM，确保已加氢/完整，输出 `protein_clean.pdb`。
3. **备配体**：RDKit 把 SMILES 加氢 → ETKDGv3 生成 3D 构象 → MMFF 优化 → 写 SDF（或直接把 SMILES 串传给 inference）。
4. **跑推理**：在 DiffDock 目录运行 `inference.py`，设 `--inference_steps`、`--samples_per_complex`、`--batch_size`、`--no_final_step_noise`。
5. **解析排序**：扫 `results/` 下 `rank{N}_confidence{score}.sdf`，正则抽 rank 与 confidence，按 rank 排序成表。
6. **分析口袋**：对 rank1 构象，算蛋白原子与配体原子距离 ≤ cutoff（默认 4.0 Å）的残基，得结合位点残基列表。
7. **可视化 / 重打分（可选）**：NGLview 看构象；或 OpenBabel 转 PDBQT 交 Vina `--score_only` 重打分。

## 指令

**推理命令（在 DiffDock 目录运行）：**
```bash
python inference.py \
    --protein_path protein_clean.pdb \
    --ligand "CC(C)Cc1ccc(cc1)C(C)C(=O)O" \
    --out_dir results/ \
    --inference_steps 20 \
    --samples_per_complex 40 \
    --batch_size 10 \
    --no_final_step_noise
```

**关键参数：**

| 参数 | 默认 | 范围 | 作用 |
|------|------|------|------|
| `--inference_steps` | 20 | 10–40 | 扩散反向步数；越多越慢但越准 |
| `--samples_per_complex` | 40 | 10–100 | 采样构象数；越多结合模式覆盖越好（构象都挤一处时调大到 40–100） |
| `--batch_size` | 10 | 1–32 | GPU 批大小；OOM 就调到 4 或 2 |
| `--no_final_step_noise` | 关 | flag | 去最后一步噪声，提升构象质量（建议开） |
| `--save_visualisation` | 关 | flag | 额外存 PDB 可视化文件 |
| `cutoff_angstrom` | 4.0 Å | 3.0–6.0 | 判定结合位点残基的距离阈值 |

**置信度解读（务必记牢）：** confidence **越高越可信**；`> 0` 一般为合理构象；`~0` 边缘；`< -1` 较差；**全部 < -2** 多半是配体/蛋白格式问题（用 RDKit 校验 SMILES、确保蛋白已加氢且完整）。

## 示例

**安装 + 下载权重：**
```bash
git clone https://github.com/gcorso/DiffDock.git && cd DiffDock
conda create -n diffdock python=3.9 && conda activate diffdock
pip install torch torchvision --extra-index-url https://download.pytorch.org/whl/cu118
pip install -r requirements.txt
python -c "from utils.download import download_pretrained; download_pretrained()"
```

**清蛋白（Biopython，去 HETATM）：**
```python
from Bio.PDB import PDBParser, PDBIO, Select
class NonHetSelect(Select):
    def accept_residue(self, residue):
        return residue.id[0] == " "   # 只保留蛋白 ATOM
def clean_pdb(inp, out):
    s = PDBParser(QUIET=True).get_structure("p", inp)
    io = PDBIO(); io.set_structure(s); io.save(out, NonHetSelect())
clean_pdb("raw_protein.pdb", "protein_clean.pdb")
```

**SMILES → 3D SDF（RDKit）：**
```python
from rdkit import Chem
from rdkit.Chem import AllChem, SDWriter
mol = Chem.AddHs(Chem.MolFromSmiles("CC(C)Cc1ccc(cc1)C(C)C(=O)O"))  # 布洛芬
AllChem.EmbedMolecule(mol, AllChem.ETKDGv3()); AllChem.MMFFOptimizeMolecule(mol)
w = SDWriter("ligand.sdf"); w.write(mol); w.close()
```

**解析排序构象：**
```python
import re, pandas as pd
from pathlib import Path
def parse_results(out_dir):
    recs = []
    for f in sorted(Path(out_dir).glob("rank*_confidence*.sdf")):
        r = re.search(r"rank(\d+)", f.stem); c = re.search(r"confidence(-?[\d.]+)", f.stem)
        if r and c:
            recs.append({"rank": int(r.group(1)), "confidence": float(c.group(1)), "sdf": str(f)})
    return pd.DataFrame(recs).sort_values("rank")
df = parse_results("results/")
high_conf = df[df.confidence > 0.0]   # 只留合理构象
```

**提取结合位点残基（rank1 构象，≤4 Å）：**
```python
import numpy as np
from rdkit import Chem
from Bio.PDB import PDBParser
def binding_residues(pdb, sdf, cutoff=4.0):
    s = PDBParser(QUIET=True).get_structure("p", pdb)
    atoms = [(a.get_coord(), r.resname, r.id[1]) for ch in s for r in ch for a in r.get_atoms()]
    lig = Chem.SDMolSupplier(sdf, removeHs=False)[0].GetConformer().GetPositions()
    hits = {(rn, name) for c, name, rn in atoms
            if np.linalg.norm(lig - c, axis=1).min() <= cutoff}
    return sorted(hits)
```

**转 PDBQT 交 Vina 重打分（可选）：**
```bash
obabel rank1_confidence0.75.sdf -O rank1.pdbqt
obabel protein_clean.pdb -O protein.pdbqt -xr
vina --receptor protein.pdbqt --ligand rank1.pdbqt --score_only --out rank1_rescored.pdbqt
```

## 注意事项

- **必须先清蛋白**：结果目录为空多因 PDB 解析失败——确保只含 ATOM，先 `clean_pdb()` 去 HETATM。
- **CUDA OOM**：`--batch_size` 调到 4 或 2。
- **`ModuleNotFoundError: e3nn`**：在 diffdock 环境 `pip install e3nn`。
- **推理极慢（>30 min）**：多半在 CPU 上跑——务必配好 CUDA 用 GPU。
- **构象都挤一个位点**：`--samples_per_complex` 调大到 40–100 改善位点覆盖。
- **蛋白缺残基**：晶体结构不完整时，先用 MODELLER / SWISS-MODEL 补缺再对接。
- **DiffDock 给的是构象假设，不是结合亲和力**：置信度是构象可信度排序，不等于 ΔG；要能量评估请交 Vina/GNINA 重打分。
- 无本地环境时可用 [DiffDock Web 服务](https://huggingface.co/spaces/reginabarzilaygroup/DiffDock-Web) 在浏览器推理。
- 关键文献：Corso et al. 2023, ICLR（arXiv:2210.01776）；源码与权重见 [gcorso/DiffDock](https://github.com/gcorso/DiffDock)。

## 互见

- related：`molecular-dynamics-simulation` —— 对接得到结合构象后，可做 MD 验证稳定性与结合模式
- related：`protein-language-models` —— 蛋白结构/序列建模的上游
- combines_with：`cheminformatics-toolkit` —— 配体的 SMILES 处理、构象生成与库管理

---
本条采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0 许可证）。
