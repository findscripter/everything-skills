---
name: pytdc-therapeutics-datasets
title: Therapeutics Data Commons 药物数据集
description: 当需要用 PyTDC 获取药物发现/治疗学的 AI-ready 标准数据集与基准（ADME/毒性/DTI/DDI/分子生成）并做规范划分与评测时使用；按「加载-划分-评测」取数据集、scaffold/cold 划分、调 Oracle 与标准 metrics 产出可复现实验；不适用于自行清洗原始化合物库、训练具体模型架构、化学信息学指纹计算、分子对接；触发词：PyTDC、TDC、Therapeutics Data Commons、药物数据集、ADME、DTI、分子生成、Oracle、scaffold split、基准评测
domain: 领域/medical
triggers: [PyTDC, TDC, Therapeutics Data Commons, 药物数据集, ADME, 毒性预测, DTI, 药物靶点相互作用, DDI, 分子生成, MolGen, Oracle, scaffold split, cold split, benchmark group, ADMET benchmark, BindingDB, retrosynthesis]
tags: [pytdc, tdc, drug-discovery, therapeutic-ml, admet, dti, molecular-generation, benchmark, oracle, science]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, PyTDC, numpy, pandas, scikit-learn, rdkit]
requires: []
related: [pytdc-therapeutics-data-commons, deepchem-drug-discovery, molfeat-molecular-featurization, medchem-compound-triage]
combines_with: [deepchem-drug-discovery, molfeat-molecular-featurization, datamol-cheminformatics]
license: MIT
source: K-Dense-AI/scientific-agent-skills
source_license: MIT
---
## 何时使用

需要取**药物发现 / 治疗学**领域开箱即用、已标准化的数据集与基准（TDC，Therapeutics Data Commons），并做规范划分与评测时使用：

- 取分子/蛋白性质预测数据：ADME（吸收分布代谢排泄）、毒性（hERG/AMES/DILI/ClinTox）、HTS、QM。
- 取相互作用数据：药物-靶点 DTI（BindingDB/DAVIS/KIBA）、药物-药物 DDI、PPI、药物协同/耐药、肽-MHC、临床试验结局。
- 取分子生成 / 逆合成数据（MolGen、RetroSyn、PairMolGen），并用 Oracle 给分子打分做目标导向优化。
- 需要**可发表/可复现**的标准划分（scaffold、cold-drug/cold-target、temporal）与统一 metrics（ROC-AUC、RMSE、Spearman…）。
- 跑官方 benchmark group（如 ADMET 22 个数据集，强制 5 seed 评测协议）做系统对比。

**不该用本条的情形：**
- 自己从 ChEMBL/PubChem 拉原始数据并清洗去重 → 用 `scientific-database-lookup` / `pubchem-compound-search`。
- 训练某个具体模型架构（GNN、化学语言模型、QSAR 端到端） → 用 `deepchem-drug-discovery`（TDC 只提供数据/划分/评测，不含模型）。
- 仅做 RDKit 指纹、描述符、分子清洗等化学信息学处理 → 用 `cheminformatics-toolkit`。
- 蛋白-配体对接 / 分子动力学 → 用 `autodock-vina-docking` / `molecular-dynamics-simulation`。

## 步骤

TDC 三大类、统一访问范式：**选问题域 → 选任务 → 选数据集 → 划分 → 取数据 / 评测**。

1. **定位问题域**：`single_pred`（单实体性质）/ `multi_pred`（实体间相互作用）/ `generation`（生成）。
2. **选任务类**：single_pred 下 `ADME/Tox/HTS/QM/Yields/Epitope/Develop/CRISPROutcome`；multi_pred 下 `DTI/DDI/PPI/GDA/DrugRes/DrugSyn/PeptideMHC/AntibodyAff/MTI/Catalyst/TrialOutcome`；generation 下 `MolGen/RetroSyn/PairMolGen`。
3. **加载数据集**：`data = <Task>(name='<Dataset>')`；`data.get_data(format='df')` 取 DataFrame。不确定有哪些数据集用 `retrieve_dataset_names('ADME')` 列举。
4. **划分**：`data.get_split(method=..., seed=..., frac=[0.7,0.1,0.2])`，返回含 `train/valid/test` 的 dict。**分子任务默认且推荐 `scaffold`**（测对新骨架泛化）；DTI/DDI 用 `cold_drug/cold_target/cold_drug_target` 测对未见实体的泛化；时间序列用 `temporal`；`random` 仅快速实验。
5. **评测**：`Evaluator(name='ROC-AUC')(y_true, y_pred)`，分类用 ROC-AUC/PR-AUC/F1，回归用 RMSE/MAE/Spearman/Pearson。
6. **生成任务额外步骤**：用 `Oracle(name='GSK3B')('SMILES')` 对生成分子打分做目标导向优化。
7. **跑官方基准**：用 `benchmark_group`（如 `admet_group`），按其**强制 5 seed**协议训练并 `group.evaluate(predictions)`。

数据列约定：single_pred 多为 `Drug_ID / Drug(SMILES) / Y`；DTI 为 `Drug_ID / Target_ID / Drug(SMILES) / Target(序列) / Y`。

## 指令

安装：

```bash
uv pip install PyTDC            # 安装
uv pip install PyTDC --upgrade # 升级（核心依赖 numpy/pandas/tqdm/seaborn/scikit_learn/fuzzywuzzy 自动装）
```

通用访问范式：

```python
from tdc.<problem> import <Task>
data = <Task>(name='<Dataset>')
split = data.get_split(method='scaffold', seed=1, frac=[0.7, 0.1, 0.2])
df = data.get_data(format='df')
```

划分策略：

```python
data.get_split(method='scaffold', seed=1, frac=[0.7,0.1,0.2])  # 分子任务默认
data.get_split(method='random',   seed=42, frac=[0.8,0.1,0.1])
data.get_split(method='cold_drug',   seed=1)   # DTI：测试集出现未见过的药物
data.get_split(method='cold_target', seed=1)   # DTI：测试集出现未见过的靶点
```

评测器与 Oracle：

```python
from tdc import Evaluator, Oracle
roc = Evaluator(name='ROC-AUC'); print(roc(y_true, y_pred))   # 分类
rmse = Evaluator(name='RMSE');   print(rmse(y_true, y_pred))  # 回归
oracle = Oracle(name='DRD2'); print(oracle('CC(C)Cc1ccc(cc1)C(C)C(O)=O'))  # 单/批量 SMILES 打分
```

实用工具（数据集列举、格式转换、ID 互转、单位变换）：

```python
from tdc.utils import retrieve_dataset_names, cid2smiles, uniprot2seq
adme_list = retrieve_dataset_names('ADME')
smiles = cid2smiles(2244)          # PubChem CID → SMILES
seq    = uniprot2seq('P12345')     # UniProt → 氨基酸序列
from tdc.chem_utils import MolConvert
pyg = MolConvert(src='SMILES', dst='PyG')('CC(C)Cc1ccc(cc1)C(C)C(O)=O')
```

## 示例

ADME 单性质预测（加载 + scaffold 划分 + 评测骨架）：

```python
from tdc.single_pred import ADME
from tdc import Evaluator
data  = ADME(name='Caco2_Wang')                         # 肠道通透性
split = data.get_split(method='scaffold', seed=42)
train, valid, test = split['train'], split['valid'], split['test']
# model.fit(train['Drug'], train['Y']); preds = model.predict(test['Drug'])
mae = Evaluator(name='MAE')
# print(mae(test['Y'], preds))
```

DTI（cold split 测未见靶点泛化）：

```python
from tdc.multi_pred import DTI
data = DTI(name='BindingDB_Kd')          # 52,284 对；列：Drug/Target/Y
split = data.get_split(method='cold_target', seed=1)
```

ADMET 官方基准（强制 5 seed，否则结果不可比/不可发表）：

```python
from tdc.benchmark_group import admet_group
group = admet_group(path='data/')
benchmark = group.get('Caco2_Wang')      # ADMET Group 含 22 个数据集
predictions = {}
for seed in [1, 2, 3, 4, 5]:
    train, valid = benchmark['train'], benchmark['valid']
    # 在此训练模型
    predictions[seed] = model.predict(benchmark['test'])
results = group.evaluate(predictions)    # 官方协议聚合多 seed
```

分子生成 + Oracle 目标导向优化：

```python
from tdc.generation import MolGen
from tdc import Oracle
data = MolGen(name='ChEMBL_V29'); split = data.get_split()
oracle = Oracle(name='JNK3')
scores = oracle(['CCO', 'c1ccccc1', 'CC(C)Cc1ccc(cc1)C(C)C(O)=O'])  # 批量打分
```

## 注意事项

- **TDC 只给数据/划分/评测，不含模型**：模型训练自备（可配 `deepchem-drug-discovery` 或自写 sklearn/torch）；本条负责把数据喂对、把评测做对。
- **分子任务必须 scaffold 划分**：随机划分泄漏骨架信息、高估泛化，结果不可发表；审稿默认期望 scaffold 或 temporal。DTI/DDI 用 cold split 才能真实反映对未见药物/靶点的泛化。
- **官方基准强制 5 seed**：benchmark group（如 ADMET）必须按 `[1,2,3,4,5]` 多 seed 跑并交给 `group.evaluate`，单 seed 结果与排行榜不可比。
- **数据规模差异大**：如 BindingDB_IC50 约 991,486 对、Ki 约 375,032、USPTO 逆合成约 1,939,253 反应，DDI（DrugBank）191,808 对/1,706 药物——首次加载会自动下载，注意磁盘与内存。
- **特征/单位先确认**：标签可能为不同单位（nM 等），需要时用 `label_transform(y, from_unit='nM', to_unit='p')` 统一；分类任务先核对 `Y` 是连续值还是二值。
- **格式转换需对应后端依赖**：`MolConvert` 转 `PyG/DGL` 需另装相应图库；按需触发安装。
- 更多数据集目录、全部 Oracle、数据处理工具见官方文档：tdcommons.ai、tdc.readthedocs.io、GitHub mims-harvard/TDC（NeurIPS 2021 论文）。

## 互见

- related：`deepchem-drug-discovery` —— 用 TDC 取数据/划分后，交 DeepChem 做端到端建模；二者职责互补（数据 vs 模型）。
- related：`cheminformatics-toolkit` —— 取到 SMILES 后用 RDKit 做指纹/描述符/清洗，再进入建模。
- related：`protein-language-models` —— DTI 任务的蛋白侧表征建模。
- related：`scientific-database-lookup`、`pubchem-compound-search` —— 需要超出 TDC 收录范围的原始化合物/靶点数据时检索补充。
- combines_with：`deepchem-drug-discovery` —— TDC 供标准数据与评测协议，DeepChem 供模型，组合成完整可复现的药物 ML 实验。
- combines_with：`cheminformatics-toolkit` —— 在 TDC 数据上做特征工程与分子过滤。

---
本条采编自 K-Dense-AI/scientific-agent-skills（MIT）。
