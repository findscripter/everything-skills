---
name: pyhealth-clinical-dl
title: PyHealth 临床健康深度学习流水线
description: 当用 PyHealth 在 EHR/生理信号/医学影像上做临床预测（死亡率、再入院、住院时长、用药推荐、睡眠分期、ICD 编码）时使用；按数据集→任务→模型→Trainer→指标五段式搭建可训练流水线并产出模型与临床指标，含医疗编码 ICD/ATC/NDC/RxNorm 查询互映；不适用于纯表格数据的通用 PyTorch 建模；触发词：PyHealth、MIMIC、eICU、OMOP、EHR、用药推荐、ICD 编码
domain: 领域/medical
triggers: [PyHealth, MIMIC, eICU, OMOP, EHR 建模, 临床预测, 用药推荐, 睡眠分期, ICD 编码, 医疗编码映射]
tags: [pyhealth, healthcare, clinical, ehr, mimic, deep-learning, medcode, science]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [pyhealth, python, pytorch, uv]
requires: []
related: [neurokit2-biosignal-processing, dicom-medical-imaging, pytdc-therapeutics-datasets, scikit-learn-ml]
combines_with: [mlops-model-productionizer, shap-model-explainability, guided-statistical-analysis]
license: MIT
source: K-Dense-AI/scientific-agent-skills
source_license: MIT
---
## 何时使用

当临床/健康 ML 任务符合 PyHealth 的**五段式流水线**（`Dataset → Task → Model → Trainer → Metrics`）时使用本条，典型场景：

- 提到 PyHealth、MIMIC-III/IV、eICU、OMOP-CDM、EHRShot、SleepEDF、SHHS、ISRUC、ChestX-ray14、TUEV/TUAB 等临床数据集。
- 要预测死亡率、再入院、住院时长（LOS）、用药推荐、睡眠分期、ICD 编码、EEG 事件、去标识化。
- 要查询或跨映射医疗编码（ICD-9-CM、ICD-10-CM、ATC、NDC、RxNorm、CCS）。
- 手上有 EHR 形态数据，想直接训练临床模型而不手写数据管道。

**不该用本条的边界：**

- 只是想在通用表格数据上跑原生 PyTorch → 不需要 PyHealth。
- 工作流不符合「数据集→任务→模型→Trainer」五段式，硬套通常是在和库对着干。

## 步骤

1. 装环境：PyHealth 2.0 需 Python ≥3.12 且 <3.14，用 `uv` 管理。
2. **Dataset**：实例化数据集类（如 `MIMIC3Dataset`），得到可查询的患者注册表 `BaseDataset`。
3. **Task**：`base.set_task(task)` 把患者转成有监督样本，得到 `SampleDataset`（模型/切分/DataLoader 都吃这个）。
4. **切分 + DataLoader**：`split_by_patient`（默认）按患者切分防泄漏，`get_dataloader` 构建 loader。
5. **Model**：把 `SampleDataset` 传给模型（Transformer/RETAIN/GAMENet/SafeDrug/MICRON/StageNet/AdaCare/CNN/RNN/MLP）。
6. **Trainer + Metrics**：用 `Trainer.train(...)` 训练并按 `monitor` 选最佳 checkpoint，`inference` 后用对应指标函数评估。

## 指令

安装（uv）：

```bash
uv init my-pyhealth-project && cd my-pyhealth-project
uv python pin 3.12
uv add pyhealth            # 会一并拉入 PyTorch
uv run python train.py
# 一次性脚本：uv run --with pyhealth python script.py
# 旧 1.x 线（Python 3.9+）：uv add pyhealth==1.16
```

选型决策：

- **任务要匹配数据集**：任务类与数据集绑定。`MortalityPredictionMIMIC3` 不能用于 MIMIC-IV，后者用 `MortalityPredictionMIMIC4` / `InHospitalMortalityMIMIC4`。
- **`monitor` 要匹配任务类型**：二分类用 `"pr_auc"`/`"roc_auc"`；多标签（用药推荐）用 `"pr_auc_samples"`/`"jaccard_samples"`；多分类用 `"accuracy"`/`"f1_macro"`。选错会保存错误 epoch 的 checkpoint。
- 写最小、地道的 PyHealth，别在原生 PyTorch 里重造训练循环——`Trainer` 自带 checkpoint、日志、最佳模型选择。

## 示例

完整流水线通常 <20 行，这是规范形态，从此出发改造：

```python
from pyhealth.datasets import MIMIC3Dataset, split_by_patient, get_dataloader
from pyhealth.tasks import MortalityPredictionMIMIC3
from pyhealth.models import Transformer
from pyhealth.trainer import Trainer
from pyhealth.metrics.binary import binary_metrics_fn

# 1. Dataset —— 原始患者注册表（BaseDataset）
base = MIMIC3Dataset(
    root="https://storage.googleapis.com/pyhealth/Synthetic_MIMIC-III/",
    tables=["DIAGNOSES_ICD", "PROCEDURES_ICD", "PRESCRIPTIONS"],
    # cache_dir="./cache",   # 可复现：缓存解析结果，避免每次重解析
)

# 2. Task —— 把患者转成有监督样本（SampleDataset）
samples = base.set_task(MortalityPredictionMIMIC3())

# 3. 切分 + DataLoader（按患者切分防泄漏）
train_ds, val_ds, test_ds = split_by_patient(samples, [0.8, 0.1, 0.1])
train_loader = get_dataloader(train_ds, batch_size=32, shuffle=True)
val_loader   = get_dataloader(val_ds,   batch_size=32, shuffle=False)
test_loader  = get_dataloader(test_ds,  batch_size=32, shuffle=False)

# 4. Model —— 必须传 SampleDataset（samples），不是 BaseDataset（base）
model = Transformer(dataset=samples)

# 5. 训练 + 评估
trainer = Trainer(model=model)
trainer.train(train_dataloader=train_loader, val_dataloader=val_loader,
              epochs=50, monitor="pr_auc")

y_true, y_prob, _ = trainer.inference(test_loader)
print(binary_metrics_fn(y_true, y_prob, metrics=["pr_auc", "roc_auc"]))
```

演示/学习无需凭证，可直接用合成 MIMIC-III 桶 `https://storage.googleapis.com/pyhealth/Synthetic_MIMIC-III/`；有私有 MIMIC 访问权时把 `root` 指向本地 CSV 目录。

## 注意事项

1. **模型吃 `SampleDataset`，不是 `BaseDataset`**：`MIMIC3Dataset(...)` 返回的是可查询注册表，只有 `.set_task(task)` 之后才得到模型/切分/DataLoader 所需的 `SampleDataset`。误传 `base` 会报错或行为异常。
2. **始终按患者（或就诊）切分，别按样本**：随机样本级切分会让同一患者跨训练/测试，造成信息泄漏。患者级用 `split_by_patient`；仅当各次就诊独立时才用 `split_by_visit`。
3. **任务要匹配数据集**：任务类是数据集专属的（见上文 MIMIC-III vs MIMIC-IV）。
4. **`monitor` 要匹配任务类型**：见「指令」，选错保存错误 epoch。
5. **MIMIC-IV 用 `ehr_root=` 而非 `root=`**：这是数据集构造器里唯一的不一致点。
6. **要可复现就设 `cache_dir=` 到持久目录**：PyHealth 会缓存解析后的数据集，不设则每次重新解析。

## 互见

- related：`dicom-medical-imaging` —— PyHealth 也覆盖影像数据集（ChestX-ray14），影像 I/O 与预处理可参此
- related：`guided-statistical-analysis` —— 临床指标解读与统计检验
- combines_with：`scientific-database-lookup` —— 查询医疗编码/本体（ICD/ATC/RxNorm）背景信息时

---

本条采编自 K-Dense-AI/scientific-agent-skills（MIT），适配重写而非逐字翻译。
