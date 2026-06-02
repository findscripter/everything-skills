---
name: deepchem-drug-discovery
title: DeepChem 药物发现深度学习
description: 当用 DeepChem 从 SMILES 训练分子性质预测模型、跑 MoleculeNet 基准、训练图神经网络或微调化学语言模型时使用；走加载-特征化-划分-训练-评估流水线产出模型与指标；不适用于无需深度学习的指纹化学信息学、仅特征化不训模型、蛋白对接；触发词：deepchem、药物发现、分子性质预测、MoleculeNet、图神经网络、AttentiveFP、ChemBERTa、QSAR
domain: 领域/science
triggers: [deepchem, 药物发现, 分子性质预测, MoleculeNet, 图神经网络, GCN, AttentiveFP, ChemBERTa, QSAR, scaffold split, Tox21, BBBP, ESOL]
tags: [deepchem, drug-discovery, molecular-ml, gnn, moleculenet, qsar, cheminformatics, deep-learning, science]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, deepchem, torch, rdkit, scikit-learn]
requires: []
related: [cheminformatics-toolkit, protein-language-models, single-cell-rnaseq-analysis, scientific-database-lookup, scikit-learn-ml]
combines_with: [cheminformatics-toolkit, scikit-learn-ml]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

需要用 **DeepChem** 做端到端分子机器学习（从 SMILES 到训练好的预测模型）时使用：

- 从 SMILES 预测分子性质：溶解度、毒性、结合亲和力、ADMET 等。
- 在 MoleculeNet 标准基准上跑模型/对比（BBBP、Tox21、ESOL、FreeSolv、HIV、QM7/9 等，自动下载）。
- 训练分子图神经网络：GCN、GAT、AttentiveFP、MPNN、DMPNN。
- 微调预训练化学语言模型（ChemBERTa、GROVER、MolFormer）做低数据迁移学习。
- 分子 ML 超参搜索；虚拟筛选与命中分级；材料/晶体性质预测（CGCNN、MEGNet）。

**不该用本条的情形：**
- 只做指纹/描述符这类不含深度学习的化学信息学细粒度处理 → 用 `cheminformatics-toolkit`（RDKit）。
- 仅需把分子特征化、不训模型 → 用专门的特征化库（molfeat）。
- 蛋白-配体对接、分子动力学、量子化学/DFT → 超出范畴，用 AutoDock/OpenMM/Psi4。
- 经典表格 ML 基线且无分子语义 → 直接用 `scikit-learn-ml`（DeepChem 也可经 `SklearnModel` 包装它）。

## 步骤

DeepChem 所有工作流走同一条 5 步流水线：**加载 → 特征化 → 划分 → 训练 → 评估**。

1. **加载数据**：CSV 用 `dc.data.CSVLoader`（指定 `tasks`、`feature_field="smiles"`、`featurizer`）；SDF（3D）用 `dc.data.SDFLoader`；基准数据用 `dc.molnet.load_*()` 自动下载+特征化+划分。
2. **特征化**：把 featurizer 传给 loader，或直接 `featurizer.featurize(smiles)`。**特征化器必须与模型匹配**——指纹模型用 `CircularFingerprint`，GNN 用 `ConvMolFeaturizer`/`MolGraphConvFeaturizer`，混用会静默出错。
3. **划分**：药物发现**默认且强烈推荐 `ScaffoldSplitter`**（测对新骨架的泛化）；`RandomSplitter` 仅做快速实验（会高估性能、不可发表）；多样性用 `ButinaSplitter`。
4. **归一化目标**（回归）：`dc.trans.NormalizationTransformer(transform_y=True, dataset=...)`；预测后用 `transformer.untransform()` 还原尺度。
5. **训练**：`model.fit(train, nb_epoch=N)`。先跑 `MultitaskRegressor`+ECFP 基线，不够再上 GNN（更费数据和算力）。
6. **评估**：`model.evaluate(test, metrics_list)`，回归看 `pearson_r2_score`/`mean_absolute_error`/`rms_score`，分类看 `roc_auc_score`。

## 指令

安装（核心含 RDKit/sklearn/XGBoost；GNN 需 torch 后端）：

```bash
pip install deepchem          # 核心
pip install deepchem[torch]   # GNN 模型（PyTorch 后端）
pip install deepchem[all]     # 全后端 + extras
```

最小流程（MoleculeNet + 多任务回归）：

```python
import deepchem as dc
tasks, datasets, transformers = dc.molnet.load_delaney(featurizer="ECFP")  # ESOL 溶解度
train, valid, test = datasets
model = dc.models.MultitaskRegressor(n_tasks=1, n_features=1024, dropouts=0.2)
model.fit(train, nb_epoch=50)
metric = dc.metrics.Metric(dc.metrics.pearson_r2_score)
print(model.evaluate(test, [metric]))   # {'pearson_r2_score': ~0.7}
```

从 CSV 加载并特征化：

```python
loader = dc.data.CSVLoader(
    tasks=["pIC50"], feature_field="smiles",
    featurizer=dc.feat.CircularFingerprint(size=2048, radius=3),
)
dataset = loader.create_dataset("bioactivity.csv")
# 注意 n_features 必须等于 dataset.X.shape[1]，否则训练报维度不匹配
```

图神经网络（AttentiveFP，分子性质常达 SOTA）：

```python
tasks, datasets, transformers = dc.molnet.load_delaney(
    featurizer=dc.feat.MolGraphConvFeaturizer(use_edges=True))
train, valid, test = datasets
m = dc.models.AttentiveFPModel(n_tasks=1, mode="regression",
        num_layers=2, graph_feat_size=200, num_timesteps=2,
        dropout=0.2, learning_rate=0.001, batch_size=64)
m.fit(train, nb_epoch=100)
```

迁移学习（ChemBERTa 微调，低数据更划算）：

```python
from deepchem.models.torch_models import ChemBERTaModel
tasks, datasets, _ = dc.molnet.load_bbbp(featurizer=dc.feat.SmilesTokenizer())
train, valid, test = datasets
clf = ChemBERTaModel(task="classification", n_tasks=1, model_dir="chemberta/")
clf.fit(train, nb_epoch=10)   # 微调用更小 lr（1e-5~5e-5），5~15 epoch
```

保存/加载与新分子推理：

```python
model.save_checkpoint(model_dir="saved/")
m2 = dc.models.MultitaskRegressor(n_tasks=1, n_features=2048); m2.restore(model_dir="saved/")
feat = dc.feat.CircularFingerprint(size=1024, radius=2)   # 与训练同特征化器
new = dc.data.NumpyDataset(X=feat.featurize(["c1cc(O)ccc1", "OC(=O)c1ccccc1"]))
print(m2.predict(new))
```

## 示例

完整 QSAR 流水线（CSV → scaffold 划分 → 训练 → 评估）：

```python
import deepchem as dc
loader = dc.data.CSVLoader(tasks=["pIC50"], feature_field="smiles",
    featurizer=dc.feat.CircularFingerprint(size=2048, radius=3))
dataset = loader.create_dataset("bioactivity_data.csv")
dataset = dc.trans.NormalizationTransformer(transform_y=True, dataset=dataset).transform(dataset)
train, valid, test = dc.splits.ScaffoldSplitter().train_valid_test_split(dataset)
model = dc.models.MultitaskRegressor(n_tasks=1, n_features=2048,
    layer_sizes=[1000, 500], dropouts=0.25, learning_rate=0.001, batch_size=64)
model.fit(train, nb_epoch=100)
r = model.evaluate(test, [dc.metrics.Metric(dc.metrics.pearson_r2_score),
                          dc.metrics.Metric(dc.metrics.mean_absolute_error)])
print(f"R2={r['pearson_r2_score']:.3f}  MAE={r['mean_absolute_error']:.3f}")
```

超参网格搜索（在 valid 上择优，再上 test）：

```python
params = {"n_features": [1024], "layer_sizes": [[500], [1000, 500], [1000, 500, 250]],
          "dropouts": [0.1, 0.25, 0.5], "learning_rate": [0.001, 0.0005]}
opt = dc.hyper.GridHyperparamOpt(lambda **p: dc.models.MultitaskRegressor(**p))
metric = dc.metrics.Metric(dc.metrics.pearson_r2_score)
best_model, best_params, _ = opt.hyperparam_search(params, train, valid, metric,
                                                    logdir="hyperparam_logs/")
print(best_params, best_model.evaluate(test, [metric]))
```

GNN vs 随机森林基线对比（BBBP，scaffold 划分）：

```python
metric = dc.metrics.Metric(dc.metrics.roc_auc_score)
_, (tr, _, te), _ = dc.molnet.load_bbbp(featurizer="GraphConv", splitter="scaffold")
gcn = dc.models.GraphConvModel(n_tasks=1, mode="classification", dropout=0.2); gcn.fit(tr, nb_epoch=50)
_, (trf, _, tef), _ = dc.molnet.load_bbbp(featurizer="ECFP", splitter="scaffold")
rf = dc.models.SklearnModel(
    model=dc.models.sklearn_models.RandomForestClassifier(n_estimators=500), model_dir="rf/")
rf.fit(trf)
print("GCN", gcn.evaluate(te, [metric]), "RF", rf.evaluate(tef, [metric]))
```

## 注意事项

- **药物发现必须 scaffold 划分**：随机划分泄漏结构信息、高估性能，分子性质预测结果用 `RandomSplitter` 不可发表，审稿人期望 scaffold 或时间划分。
- **回归先归一化目标**：`NormalizationTransformer(transform_y=True)`，预测后 `untransform()` 还原；否则易 NaN loss 或预测常数。
- **先基线后 GNN**：先 `MultitaskRegressor`+ECFP，基线不足再上 GNN（更吃数据/算力）。
- **特征化器须配模型**：GNN 要图特征化器，指纹模型要 `CircularFingerprint`，混用静默出错。`n_features` 必须等于 `dataset.X.shape[1]`。
- **多任务缺标签**：Tox21 等含 NaN，DeepChem 训练时自动 masked loss 处理，可用 `np.isnan(dataset.y).sum()` 核查。
- **早停**：GNN 尤其要监控 valid loss 防过拟合（dropout 0.3~0.5）。
- **常见报错**：`ModuleNotFoundError: torch` → 装 `deepchem[torch]`；`CUDA out of memory` → 减 `batch_size`（32/16）或转 CPU；个别 SMILES `FeaturizationError` → 先用 RDKit `Chem.MolFromSmiles(smi) is not None` 预过滤；特征化慢 → 优先 `CircularFingerprint` 或并行 `n_jobs`。
- **关键超参参考**：`dropouts` 0.0~0.5、`learning_rate` 1e-5~0.01、`batch_size` 16~256、`nb_epoch` 10~300、`CircularFingerprint` size 512~4096 / radius 2~4。

## 互见

- related：`cheminformatics-toolkit` —— 上游用 RDKit 解析/清洗 SMILES、算指纹与描述符，再喂给 DeepChem 训练。
- related：`protein-language-models` —— 蛋白侧表征建模，与小分子性质预测互补。
- related：`single-cell-rnaseq-analysis`、`scientific-database-lookup` —— 同领域生信/数据检索协作。
- combines_with：`scikit-learn-ml` —— 经典 ML 基线（DeepChem 经 `SklearnModel` 包装），与神经/图模型对照。

---
本条采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0）。
