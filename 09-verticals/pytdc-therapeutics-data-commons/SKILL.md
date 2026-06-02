---
name: pytdc-therapeutics-data-commons
title: PyTDC 治疗学数据公地
description: 当需加载 AI-ready 的 ADME/毒性/DTI/DDI 药物发现数据集、用 scaffold/cold 划分跑标准基准、或用 oracle 给生成分子打分时使用；走加载-划分-评估流水线产出标准指标与 5 种子基准；不适用于 ChEMBL 活性检索或纯特征化。触发词：TDC、PyTDC、ADMET、scaffold split、cold split、DTI、oracle
domain: 领域/science
triggers: [TDC, PyTDC, Therapeutics Data Commons, ADMET, ADME, 毒性数据集, DTI, DDI, scaffold split, cold split, oracle, QED, SA, GSK3B, DRD2, admet_group, MolGen, 药物发现数据集, 5 种子基准]
tags: [science, drug-discovery, datasets, benchmark, admet, oracle, dti, machine-learning, cheminformatics]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, PyTDC, numpy, pandas, scikit-learn, rdkit]
requires: []
related: [chembl-bioactivity-database, cheminformatics-toolkit, deepchem-drug-discovery, autodock-vina-docking, protein-language-models]
combines_with: [deepchem-drug-discovery, scikit-learn-ml, cheminformatics-toolkit]
license: MIT
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

需要 **AI-ready 的药物发现数据集与标准化评估协议** 时使用 PyTDC（Therapeutics Data Commons）。它把治疗学数据组织为三类：单实例预测（分子/蛋白性质）、多实例预测（药-靶/药-药相互作用）、生成（分子设计、逆合成），并自带划分、指标与分子 oracle。典型场景：

- 加载策展过的 ADME / 毒性 / 生物活性数据集训练 ML 模型。
- 用标准化的 5 种子协议对药物发现模型做基准对比。
- 用 cold-split 评估药-靶（DTI）/药-药（DDI）相互作用预测。
- 生成新分子并用 oracle（QED、SA、DRD2、GSK3B 等）打分。
- 取 scaffold（Bemis-Murcko）或时间（temporal）划分做制药 ML。
- 分子表示转换：SMILES → PyG 图 / ECFP 指纹 / SELFIES。

**不该用本条的边界：**
- 仅做 ChEMBL 化合物 / 靶点 / 活性检索（非打包数据集）→ 用 `chembl-bioactivity-database`。
- 仅做分子特征化 / 指纹 / 描述符（不取 ML 数据集）→ 用 `cheminformatics-toolkit`。
- 要端到端训练分子模型（GNN、ChemBERTa）→ 用 `deepchem-drug-discovery`（可用 TDC 数据喂它）。
- 蛋白-配体对接 / 虚拟筛选打分用力场 → 用 `autodock-vina-docking`、`diffdock-blind-docking`。

## 步骤

PyTDC 走统一的 **加载 → 划分 → 评估** 流水线：

1. **选类目与数据集**：单实例 `from tdc.single_pred import ADME, Tox, HTS, QM`；多实例 `from tdc.multi_pred import DTI, DDI, PPI`；生成 `from tdc.generation import MolGen, RetroSyn`。首次访问会自动下载（~10–500 MB/集），用 `path='data/'` 指定持久缓存，避免重复下载。免 API key。
2. **取数据**：`data = ADME(name='Caco2_Wang')`；`df = data.get_data(format='df')`。单实例列为 `['Drug_ID','Drug','Y']`（Drug 是 SMILES，Y 是标签）；多实例多出 `Target_ID`/`Target`（蛋白序列）。
3. **划分**（关键决策）：`split = data.get_split(method='scaffold', seed=42, frac=[0.7,0.1,0.2])`。分子性质预测**默认且强烈推荐 `scaffold`**（Bemis-Murcko，保证训练/测试结构多样、不泄漏）；相互作用预测用 `cold_drug`/`cold_target`/`cold_drug_target`（测对未见药/靶的泛化）；`random` 会高估性能、不可发表。可用方法：`random`、`scaffold`、`cold_drug`、`cold_target`、`cold_drug_target`、`temporal`。
4. **评估**：`Evaluator(name='MAE')(y_true, y_pred)`。分类用 `ROC-AUC`/`PR-AUC`/`F1`/`Accuracy`；回归用 `RMSE`/`MAE`/`R2`；排序用 `Spearman`/`Pearson`；多标签用 `Micro-F1`/`Macro-F1`。
5. **生成任务用 oracle**：`Oracle(name='GSK3B')(smiles)` 返回 0–1 活性概率，支持批量 `oracle([smi1, smi2])`。
6. **跑标准基准**：`from tdc.benchmark_group import admet_group`，按 5 种子协议训练-评估，`group.evaluate(predictions)` 返回 `mean ± std`。

## 指令

安装（核心轻量；scaffold 划分需 RDKit，PyG 转换需 torch-geometric）：

```bash
uv pip install PyTDC                # 核心：numpy, pandas, scikit-learn, tqdm, fuzzywuzzy
uv pip install rdkit               # scaffold 划分所需
uv pip install torch-geometric     # SMILES → PyG 图（可选）
```

快速上手（scaffold 划分 + MAE 评估）：

```python
from tdc.single_pred import ADME
from tdc import Evaluator

data = ADME(name='Caco2_Wang')                      # 肠道通透性（回归）
split = data.get_split(method='scaffold', seed=42, frac=[0.7, 0.1, 0.2])
train, valid, test = split['train'], split['valid'], split['test']
print(len(train), len(valid), len(test))            # ~640 91 182
evaluator = Evaluator(name='MAE')
# score = evaluator(test['Y'].values, predictions)
```

数据集速查（用 `name=` 切换）：

```python
from tdc.single_pred import ADME, Tox
ADME(name='BBB_Martins')               # 血脑屏障（二分类）
ADME(name='Lipophilicity_AstraZeneca') # LogD（回归）
ADME(name='Solubility_AqSolDB')        # 水溶性
Tox(name='hERG')                       # 心脏毒性 / Tox(name='AMES') 致突变 / Tox(name='DILI') 肝损伤
# 列出某任务全部数据集，避免拼错 name 报 KeyError：
from tdc.utils import retrieve_dataset_names
print(retrieve_dataset_names('ADME'))
```

多实例 + cold split（验证训练/测试零药物重叠）：

```python
from tdc.multi_pred import DTI
data = DTI(name='BindingDB_Kd')        # 52,284 对，Kd 值；DAVIS / KIBA 为激酶数据
cold = data.get_split(method='cold_drug', seed=1)
overlap = set(cold['train']['Drug_ID']) & set(cold['test']['Drug_ID'])
print(len(overlap))                    # 0 —— cold_drug 保证测试集药物训练未见
```

生成 + oracle 打分：

```python
from tdc.generation import MolGen
from tdc import Oracle
train_smiles = MolGen(name='ChEMBL_V29').get_split()['train']['Drug'].tolist()  # 1.6M 类药 SMILES
oracle = Oracle(name='GSK3B')          # GSK3B 抑制预测，0–1
print(oracle('CC(C)Cc1ccc(cc1)C(C)C(O)=O'))
print(oracle(['CCO', 'c1ccccc1', 'CC(=O)O']))   # 批量
```

## 示例

**5 种子 ADME 模型评估**（scaffold 划分，报 mean ± std）：

```python
from tdc.single_pred import ADME
from tdc import Evaluator
import numpy as np

data = ADME(name='Caco2_Wang'); evaluator = Evaluator(name='MAE'); results = []
for seed in [1, 2, 3, 4, 5]:
    split = data.get_split(method='scaffold', seed=seed)
    train, test = split['train'], split['test']
    # model.fit(train['Drug'], train['Y']); preds = model.predict(test['Drug'])
    preds = test['Y'].values + np.random.normal(0, 0.1, len(test))   # 占位
    results.append(evaluator(test['Y'].values, preds))
print(f"Mean MAE: {np.mean(results):.4f} ± {np.std(results):.4f}")
```

**ADMET 标准基准组**（22 个数据集，5 种子协议）：

```python
from tdc.benchmark_group import admet_group
group = admet_group(path='data/')
benchmark = group.get('Caco2_Wang')
predictions = {}
for seed in [1, 2, 3, 4, 5]:
    train, valid, test = benchmark['train'], benchmark['valid'], benchmark['test']
    # 在 train 上训练、valid 调参，predictions[seed] = model.predict(test['Drug'])
    predictions[seed] = test['Y'].values        # 占位
results = group.evaluate(predictions)
print(f"Mean MAE: {results['Caco2_Wang'][0]:.4f} ± {results['Caco2_Wang'][1]:.4f}")
```

**多目标分子打分**（oracle 加权，注意各 oracle 尺度不同）：

```python
from tdc import Oracle
oracles = {'QED': (Oracle(name='QED'), 0.3),     # 类药性 0–1
           'SA':  (Oracle(name='SA'), 0.3),       # 合成可及性 1–10（越低越好）
           'GSK3B': (Oracle(name='GSK3B'), 0.4)}  # 靶点活性 0–1
smi = 'CC(C)Cc1ccc(cc1)C(C)C(O)=O'
weighted = sum(o(smi) * w for o, w in oracles.values())
print(f"加权得分: {weighted:.4f}")
```

**分子格式转换**（SMILES → ECFP4 / SELFIES）：

```python
from tdc.chem_utils import MolConvert
ecfp = MolConvert(src='SMILES', dst='ECFP4')('CC(C)Cc1ccc(cc1)C(C)C(O)=O')
selfies = MolConvert(src='SMILES', dst='SELFIES')('CC(C)Cc1ccc(cc1)C(C)C(O)=O')
print(ecfp.shape)   # (1024,) 二进制指纹
```

## 注意事项

- **分子性质预测必须 scaffold 划分**：`random` 泄漏结构信息、虚高指标，审稿期望 scaffold 或 temporal 划分。`get_split` 默认即 `scaffold`。
- **相互作用预测用 cold split**：`cold_drug` 测对未见药物泛化、`cold_target` 对未见靶点；`cold_drug_target` 两者皆未见。用上面的 overlap 检查确认零泄漏。
- **永远报 5 种子 mean ± std**：单种子结果不可靠，不能用于方法对比；基准组（`admet_group`）天然按此协议。
- **oracle 尺度各异，组合前先归一**：`QED` 返回 0–1，`SA` 返回 1–10（越低越好），结合分各异；直接加权前先核对各 oracle 文档/范围。
- **oracle 返回 NaN**：多半是非法 SMILES 或 RDKit 解析失败，打分前先用 `Chem.MolFromSmiles(smi) is not None` 预过滤。
- **数据集名写错报 `KeyError`**：用 `retrieve_dataset_names('ADME')` 取合法 name 再传。
- **大数据集缓存**：始终指定持久 `path='data/'`，避免跨会话重复下载（DTI/生成集可达数百 MB）。`benchmark` 评估须传 `dict`，键为种子：`{1: preds1, 2: preds2, ...}`，否则报格式错。
- **依赖缺失**：`ModuleNotFoundError: tdc` → `uv pip install PyTDC`；scaffold 划分失败 → 装 `rdkit`；PyG 转换失败 → 装 `torch-geometric`。
- **数据处理工具**：`MolConvert(src,dst)`（格式转换）、`MolFilter`（PAINS/类药性过滤，训练前剔除问题分子）、`label_transform`（连续→二值、nM→pIC50 单位换算）、`cid2smiles()`/`uniprot2seq()`（ID 解析）。

## 互见

- related：`chembl-bioactivity-database` —— 直接检索 ChEMBL 化合物/靶点/活性（非打包数据集）的来源。
- related：`cheminformatics-toolkit` —— RDKit 解析/清洗 SMILES、算指纹与描述符，喂入 TDC 数据集前的预处理。
- related：`protein-language-models` —— DTI 任务蛋白序列侧的表征建模。
- combines_with：`deepchem-drug-discovery` —— 用 TDC 数据集+划分喂 DeepChem 训练 GNN/语言模型。
- combines_with：`scikit-learn-ml` —— 在 TDC 划分上训经典 ML 基线并用 `Evaluator` 评估。

---
本条采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0）。
