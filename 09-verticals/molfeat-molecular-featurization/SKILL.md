---
name: molfeat-molecular-featurization
title: molfeat 分子特征化
description: 当把 SMILES 批量转成数值特征喂给 ML 模型时使用 molfeat；用 Calculator+Transformer 算指纹（ECFP/MACCS/MAP4）、描述符（RDKit2D/Mordred）、预训练嵌入（ChemBERTa/GIN），产出 (N,D) 特征矩阵与可复现配置；不适用于分子清洗标准化（用 datamol）、子结构/反应等底层操作（用 rdkit）、训练模型本身（用 deepchem/sklearn）；触发词：molfeat、分子特征化、指纹、ECFP、ChemBERTa、QSAR、虚拟筛选
domain: 领域/science
triggers: [molfeat, 分子特征化, molecular featurization, 指纹, ECFP, MACCS, MAP4, Mordred, ChemBERTa, 预训练嵌入, QSAR, 虚拟筛选, FPCalculator, MoleculeTransformer]
tags: [molfeat, molecular-featurization, fingerprints, ecfp, descriptors, pretrained-embeddings, chemberta, qsar, virtual-screening, cheminformatics, drug-discovery, science]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, molfeat, molfeat.calc, molfeat.trans, FPCalculator, MoleculeTransformer, rdkit, scikit-learn]
requires: []
related: [rdkit-cheminformatics, datamol-cheminformatics, deepchem-drug-discovery, cheminformatics-toolkit]
combines_with: [scikit-learn-ml, pubchem-compound-search, chembl-bioactivity-database]
license: CC-BY-4.0
source: jaechang-hits/SciAgent-Skills
source_license: CC-BY-4.0
---
## 何时使用

需要把分子（SMILES）统一转成**数值特征向量**供机器学习/深度学习使用时，用 molfeat：它在 scikit-learn 兼容 API 下汇集 100+ 指纹、描述符与预训练嵌入。

- 构建 QSAR/QSPR 模型，需要分子特征作为输入 X。
- 虚拟筛选：批量特征化化合物库，按预测活性排序选 hit。
- 相似度检索、化学空间聚类/可视化/降维。
- 用预训练嵌入（ChemBERTa、GIN）做分子迁移学习/深度学习。
- 把特征化步骤嵌入 scikit-learn Pipeline 或 PyTorch 训练流程。
- 基准对比：同一数据上横评多种分子表征（ECFP vs 描述符 vs 嵌入）。

**不该用本条的情形**：
- 分子清洗、标准化、I/O、构象等常规处理 —— 用 `datamol`。
- 子结构/SMARTS、反应、底层原子操作 —— 用 `rdkit`（见 `cheminformatics-toolkit`）。
- 训练模型本身或跑 MoleculeNet 基准 —— 用 `deepchem` / `scikit-learn`，molfeat 只负责产特征。

## 步骤

molfeat 分三层：**Calculator（单分子→向量）→ Transformer（批量+并行+缓存）→ Store（发现/加载预训练模型）**。

1. **装依赖**：`uv pip install molfeat`；预训练类需额外 extras（`molfeat[transformer]` 装 ChemBERTa/MolT5，`molfeat[dgl]` 装 GIN，`molfeat[map4]` 装 MAP4）。
2. **选特征器**：见下表按任务选型；不确定时**先用 ECFP（radius=3）做基线**。
3. **建 Calculator**：如 `FPCalculator("ecfp", radius=3, fpSize=2048)`，可直接 `calc("CCO")` 返回 numpy 向量。
4. **包成 Transformer**：`MoleculeTransformer(calc, n_jobs=-1)`，`transformer(smiles_list)` 返回 (N, D) 二维数组；大库开 `ignore_errors=True` 容错。
5. **喂给 ML**：把特征矩阵交给 RandomForest / sklearn Pipeline / PyTorch；可用 `FeatConcat` 拼接多种特征。
6. **存配置**：`transformer.to_state_yaml_file("config.yml")` 保存确切配置，`from_state_yaml_file` 还原，保证可复现。

**特征器选型**（任务 → 推荐 / 维度 / 速度）：

| 任务 | 推荐 | 维度 | 速度 |
|------|------|------|------|
| 通用 QSAR | `ecfp`(radius=3) | 2048 | 快 |
| 骨架相似度 | `maccs` | 167 | 极快 |
| 大规模筛选 | `map4` | 1024 | 快 |
| 可解释模型 | `desc2D`(RDKit2D) | 200+ | 快 |
| 全量描述符 | `mordred` | 1800+ | 中 |
| 迁移学习 | `ChemBERTa-77M-MLM` | 768 | 慢* |
| 图深度学习 | `gin-supervised-masking` | 变长 | 慢* |
| 药效团 | `fcfp` / `cats2D` | 2048 / 21 | 快 |
| 3D 形状 | `usr` / `usrcat` | 12 / 60 | 快 |

*首跑慢（下载权重/推理），后续走缓存。

## 指令

指纹（FPCalculator 支持 `ecfp/fcfp/maccs/rdkit/avalon/atompair/map4/secfp/erg/estate` 等，加 `-count` 后缀为计数型）：

```python
from molfeat.calc import FPCalculator
ecfp = FPCalculator("ecfp", radius=3, fpSize=2048)
fp = ecfp("CCO")            # (2048,)
maccs = FPCalculator("maccs")               # (167,) 极快做骨架相似度
map4 = FPCalculator("map4")                 # (1024,) 适合大库
```

描述符与药效团/形状：

```python
from molfeat.calc import RDKitDescriptors2D, MordredDescriptors, CATSCalculator, USRDescriptors
desc2d = RDKitDescriptors2D()               # 200+ 具名属性(MW/logP/TPSA...)
print(desc2d.columns[:5])                   # 特征名，便于可解释
mordred = MordredDescriptors()              # 1800+ 全量描述符
cats = CATSCalculator(mode="2D", scale="raw")   # 药效团点对分布 (21,)
usr  = USRDescriptors()                     # 超快形状识别 (12,)
```

批量并行 + 拼接 + 容错：

```python
from molfeat.trans import MoleculeTransformer, FeatConcat
tr = MoleculeTransformer(FPCalculator("ecfp"), n_jobs=-1)
X = tr(["CCO", "CC(=O)O", "c1ccccc1"])      # (3, 2048)
combo = MoleculeTransformer(FeatConcat([FPCalculator("maccs"), FPCalculator("ecfp")]), n_jobs=-1)
Xc = combo(smiles)                          # (N, 167+2048)=2215，互补信息
safe = MoleculeTransformer(FPCalculator("ecfp"), n_jobs=-1, ignore_errors=True)
Xs = safe(["CCO", "invalid", "c1ccccc1"])   # 非法 SMILES 返回 None，不崩
```

预训练嵌入与 Store 发现：

```python
from molfeat.trans.pretrained import PretrainedMolTransformer
from molfeat.store.modelstore import ModelStore
chemberta = PretrainedMolTransformer("ChemBERTa-77M-MLM", n_jobs=-1)
emb = chemberta(["CCO", "CC(=O)O"])         # (2, 768)，首跑下载权重后缓存
store = ModelStore()
print(len(store.available_models))
for m in store.search(name="ChemBERTa"):
    print(m.name, m.description)
```

## 示例

QSAR 建模（特征化→交叉验证→存配置部署）：

```python
from molfeat.calc import FPCalculator
from molfeat.trans import MoleculeTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import cross_val_score

tr = MoleculeTransformer(FPCalculator("ecfp", radius=3), n_jobs=-1)
X = tr(smiles_train)
scores = cross_val_score(RandomForestRegressor(n_estimators=100), X, y_train, cv=5, scoring="r2")
print(f"R2 = {scores.mean():.3f} ± {scores.std():.3f}")
tr.to_state_yaml_file("production_featurizer.yml")   # 部署时按此还原同一特征器
```

特征器横评（同数据对比 ECFP / MACCS / 描述符的 AUC）：

```python
from molfeat.calc import FPCalculator, RDKitDescriptors2D
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import roc_auc_score

feats = {"ECFP": FPCalculator("ecfp"), "MACCS": FPCalculator("maccs"), "Desc": RDKitDescriptors2D()}
for name, calc in feats.items():
    tr = MoleculeTransformer(calc, n_jobs=-1)
    clf = RandomForestClassifier(n_estimators=100).fit(tr(smiles_train), y_train)
    auc = roc_auc_score(y_test, clf.predict_proba(tr(smiles_test))[:, 1])
    print(f"{name}: AUC = {auc:.3f}")
```

嵌入 sklearn Pipeline（直接以 SMILES 训练/预测）：

```python
from sklearn.pipeline import Pipeline
pipe = Pipeline([("feat", MoleculeTransformer(FPCalculator("ecfp"), n_jobs=-1)),
                 ("clf", RandomForestClassifier(n_estimators=100))])
pipe.fit(smiles_train, y_train)
pred = pipe.predict(smiles_test)
```

大库分块特征化（>100K 防内存爆）：

```python
import numpy as np
def featurize_chunks(smiles, transformer, chunk=10000):
    out = []
    for i in range(0, len(smiles), chunk):
        out.append(transformer(smiles[i:i+chunk]))
    return np.vstack(out)
```

## 注意事项

- **并行加速**：批量特征化一律 `n_jobs=-1` 跑满 CPU 核，提速显著。
- **先 ECFP 基线**：上深度学习前先用 ECFP 建 baseline，最通用且快。
- **容错**：大库设 `ignore_errors=True`，非法 SMILES 返回 `None` 不会中断；下游进 ML 前过滤 `[f for f in X if f is not None]`，否则形状不匹配报错。
- **省内存**：`MoleculeTransformer(calc, dtype=np.float32)`；数据 >100K 用分块（见示例）。
- **可复现**：用 `to_state_yaml_file()` 存配置并 pin 住 molfeat 版本，不同版本可能特征不一致。
- **预训练缓存**：ChemBERTa/GIN 首跑慢（下载权重+推理），属正常，后续走缓存。
- **拼接互补**：`FeatConcat` 组合多种特征（如 MACCS+ECFP）可捕获互补分子信息。
- **常见报错**：`unsupported featurizer` → 方法名拼错或不支持，查 FPCalculator 支持类型或用 `ModelStore.search()`；预训练 `ImportError` → 缺 extras，装 `molfeat[transformer]` / `molfeat[dgl]`；内存溢出 → 分块 10K~50K。

## 互见

- related：`cheminformatics-toolkit` —— 上游用 RDKit 解析/清洗/标准化 SMILES，再交给 molfeat 算特征。
- related：`deepchem-drug-discovery` —— molfeat 产的特征可直接喂 DeepChem 训练分子性质模型，二者同属分子 ML 流水线。
- related：`scientific-database-lookup` —— 从 PubChem/ChEMBL 取来的化合物库，先特征化再筛选。
- combines_with：`scikit-learn-ml` —— molfeat 特征是 sklearn 模型/Pipeline 的标准输入 X，做 QSAR、虚拟筛选、横评。

---
本条采编自 jaechang-hits/SciAgent-Skills（CC-BY-4.0）。
