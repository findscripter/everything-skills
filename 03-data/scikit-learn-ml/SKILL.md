---
name: scikit-learn-ml
title: scikit-learn 机器学习
description: 当用 Python 做经典机器学习（分类/回归/聚类/降维/特征预处理/模型评估/超参调优）时使用；用 scikit-learn 搭建可复现的 Pipeline 并产出训练好的模型与评估报告；不适用于深度学习/大模型、GPU 训练、超内存的大规模分布式训练。触发词：scikit-learn、sklearn、机器学习、分类、回归、聚类、Pipeline、交叉验证、超参调优
domain: 数据/analysis
triggers: [scikit-learn, sklearn, 机器学习, 分类, 回归, 聚类, 降维, Pipeline, 交叉验证, GridSearchCV, 超参调优, 特征预处理, 模型评估]
tags: [scikit-learn, sklearn, machine-learning, classification, regression, clustering, pipeline, python, 数据/misc]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, scikit-learn, pandas, numpy, matplotlib]
requires: []
related: [statsmodels-statistical-modeling, polars-dataframe, matplotlib-visualization, mlops-model-productionizer]
combines_with: [polars-dataframe, matplotlib-visualization, mlops-model-productionizer]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
---
name: scikit-learn-ml
title: scikit-learn 机器学习
description: 当用 Python 做经典机器学习（分类/回归/聚类/降维/特征预处理/模型评估/超参调优）时使用；用 scikit-learn 搭建可复现的 Pipeline 并产出训练好的模型与评估报告；不适用于深度学习/大模型、GPU 训练、超内存的大规模分布式训练。触发词：scikit-learn、sklearn、机器学习、分类、回归、聚类、Pipeline、交叉验证、超参调优
domain: 数据/misc
triggers: [scikit-learn, sklearn, 机器学习, 分类, 回归, 聚类, 降维, Pipeline, 交叉验证, GridSearchCV, 超参调优, 特征预处理, 模型评估]
tags: [scikit-learn, sklearn, machine-learning, classification, regression, clustering, pipeline, python, 数据/misc]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, scikit-learn, pandas, numpy, matplotlib]
requires: []
related: [csv-data-cleaner]
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用场景：

- 用表格（结构化）或文本数据做**经典机器学习**：分类、回归、聚类、降维、特征预处理。
- 需要**交叉验证**评估模型、用网格/随机搜索**调超参**、横向**对比多个算法**。
- 搭建可复现、防数据泄漏的**生产级 Pipeline**（含混合数值/类别特征）。
- 想要可解释的传统模型，而非黑盒深度网络。

不该用的边界：

- 深度学习、大语言模型、计算机视觉/NLP 端到端建模 → 用 PyTorch / TensorFlow / HuggingFace。
- 需要 GPU 训练、或数据远超单机内存的分布式训练 → 用 Spark MLlib / Dask-ML / XGBoost-GPU 等。
- 仅做数据清洗（去重/缺失值/类型规整）→ 用 `csv-data-cleaner`，清洗后再进本技能建模。
- 不能替代环境相关的验证、测试或专家复核；缺少标注、目标列或成功标准时先澄清。

## 步骤 / 指令

按序执行，每步先观察再动手：

1. **探查数据**：`pd.read_csv` 读入，确认特征列、目标列、dtypes、缺失率，区分数值列与类别列。
2. **划分数据**：`train_test_split`，分类任务必须 `stratify=y` 保持类别分布，固定 `random_state`。
3. **构造预处理**：数值列 `SimpleImputer` + `StandardScaler`，类别列 `SimpleImputer` + `OneHotEncoder(handle_unknown='ignore')`，用 `ColumnTransformer` 按列组合。
4. **组装 Pipeline**：`Pipeline([('preprocessor', ...), ('model', ...)])`，把预处理和估计器串成一个对象——这是防数据泄漏的关键。
5. **选算法**：分类/回归先试 `RandomForest` / `GradientBoosting`（无需缩放、稳健）做基线；需缩放的（SVM/KNN/线性带正则/KMeans）务必放进 Pipeline。
6. **交叉验证对比**：`cross_val_score(pipeline, X, y, cv=5, scoring=...)` 横向比多个候选模型。
7. **调超参**：`GridSearchCV` / `RandomizedSearchCV`，参数名用 `步骤名__参数` 双下划线寻址（如 `classifier__n_estimators`）。
8. **测试集评估**：用 `best_estimator_` 在保留测试集上预测，输出 `classification_report` / 回归指标 / 聚类轮廓系数。

**算法是否需要特征缩放**：
- 需要：SVM、KNN、神经网络（MLP）、PCA、带正则的线性/逻辑回归、K-Means。
- 不需要：树模型（决策树、随机森林、梯度提升）、朴素贝叶斯。

**安装**：`uv pip install scikit-learn`（可选 `matplotlib seaborn pandas numpy`）。

## 示例

最小分类 Pipeline（混合特征 + 调参 + 评估）：
```python
import pandas as pd
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report

df = pd.read_csv("data.csv")
X, y = df.drop("target", axis=1), df["target"]
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42)

numeric = ["age", "income"]
categorical = ["gender", "occupation"]
preprocessor = ColumnTransformer([
    ("num", Pipeline([("imp", SimpleImputer(strategy="median")),
                      ("sc", StandardScaler())]), numeric),
    ("cat", Pipeline([("imp", SimpleImputer(strategy="most_frequent")),
                      ("oh", OneHotEncoder(handle_unknown="ignore"))]), categorical),
])
pipe = Pipeline([("preprocessor", preprocessor),
                 ("classifier", RandomForestClassifier(random_state=42))])

grid = GridSearchCV(pipe, {
    "classifier__n_estimators": [100, 200],
    "classifier__max_depth": [10, 20, None],
}, cv=5)
grid.fit(X_train, y_train)

y_pred = grid.best_estimator_.predict(X_test)
print(classification_report(y_test, y_pred))
```

聚类：找最优簇数并降维可视化：
```python
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn.decomposition import PCA

X_scaled = StandardScaler().fit_transform(X)
scores = [silhouette_score(X_scaled, KMeans(k, random_state=42).fit_predict(X_scaled))
          for k in range(2, 11)]
optimal_k = range(2, 11)[int(np.argmax(scores))]
labels = KMeans(optimal_k, random_state=42).fit_predict(X_scaled)
X_2d = PCA(n_components=2).fit_transform(X_scaled)  # 仅供画散点图
```

委托提示词（给 Agent 调用时）：
> 用 scikit-learn 对 `data.csv` 建分类模型：先探查并划分（stratify），用 ColumnTransformer 分别处理数值/类别列并封进 Pipeline，用 5 折交叉验证对比 RandomForest 与 GradientBoosting，对优者跑 GridSearchCV 调参，最后在测试集输出 classification_report。

## 注意事项

- **只在训练集 fit**：`scaler.fit_transform(X_train)` 后对测试集只 `transform`；用 Pipeline 即自动避免泄漏，切勿对全量数据先做缩放再划分。
- **始终用 Pipeline**：把预处理纳入 Pipeline，交叉验证/调参时每折独立拟合预处理，否则评估偏乐观。
- **分类用分层划分** `stratify=y`，保持类别分布。
- **固定 `random_state`** 保证可复现。
- **选对指标**：均衡数据用 accuracy/F1；不均衡用 precision/recall/ROC-AUC/balanced accuracy。
- 常见报错处理：
  - `ConvergenceWarning`（未收敛）→ 增大 `max_iter`（如 `LogisticRegression(max_iter=1000)`）或先缩放特征。
  - 测试集表现差（过拟合）→ 加正则（`Ridge(alpha=1.0)`）、用交叉验证、或换更简单模型。
  - 大数据内存溢出 → 用增量算法 `SGDClassifier`，聚类用 `MiniBatchKMeans(batch_size=...)`。
- 不能替代环境相关的验证与专家复核；输出仅供参考。

## 互见

- requires：无。
- related：`csv-data-cleaner`（建模前的脏数据清洗，清洗完再进本技能）。
- combines_with：无。

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
