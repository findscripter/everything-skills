---
name: shap-model-explainability
title: SHAP 模型可解释性分析
description: 当需要解释机器学习模型的预测、量化特征重要性、生成可解释性图表、排查模型偏差/数据泄漏或做公平性分析时使用；产出按模型类型选定的 explainer、SHAP 值计算、全局(beeswarm/bar)与局部(waterfall/force/scatter)可视化及偏差/泄漏诊断结论；不适用于模型训练调参、纯精度评估与因果推断（SHAP 只显关联非因果）；触发词：SHAP、特征重要性、模型可解释性、为什么这样预测、Shapley、模型偏差、特征贡献
domain: 智能/model-ops
triggers: [SHAP, 特征重要性, 模型可解释性, 为什么这样预测, Shapley 值, 模型偏差分析, 特征贡献, 可解释 AI, 瀑布图, beeswarm 蜂群图]
tags: [智能, misc, shap, 可解释性, 特征重要性, 模型调试, 公平性, xai]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, shap, matplotlib, numpy, pandas, scikit-learn, xgboost/lightgbm(可选), tensorflow/torch(可选)]
requires: []
related: [scikit-learn-ml, mlops-model-productionizer, statsmodels-statistical-modeling, computer-vision-expert]
combines_with: [matplotlib-visualization, huggingface-model-trainer]
license: MIT
source: K-Dense-AI/scientific-agent-skills
source_license: MIT
---
采编自 K-Dense-AI/scientific-agent-skills（MIT）。基于 Shapley 值统一解释任意模型的预测，覆盖选 explainer、算 SHAP 值、可视化与偏差/泄漏诊断；只解释「模型怎么想」，不负责训练调参与因果判断。

## 何时使用

- 要解释模型预测：哪些特征最重要、为什么对某条样本给出这个结果。
- 要生成 SHAP 图表：beeswarm、bar、waterfall、force、scatter、heatmap、decision。
- 要排查模型：定位误判样本、发现异常高重要性（数据泄漏信号）、校验特征关系是否合理。
- 要做公平性/偏差分析：跨人群比较特征重要性，查受保护属性及其代理特征。
- 要对比多个模型的特征重要性一致性，或把解释接入生产 API。

不该用：模型训练、超参调优、纯精度/AUC 评估（属建模本身）；因果推断——SHAP 只揭示关联与模型行为，因果须靠领域知识。

## 步骤

第一步 选对 explainer（决策树）
1. 树模型（XGBoost/LightGBM/CatBoost/RandomForest/GBDT）→ `shap.TreeExplainer`（快且精确）。
2. 深度网络（TF/PyTorch/Keras/CNN/RNN/Transformer）→ `shap.DeepExplainer` 或 `shap.GradientExplainer`。
3. 线性模型（线性/逻辑回归、GLM）→ `shap.LinearExplainer`（极快）。
4. 任意黑盒（SVM、自定义函数）→ `shap.KernelExplainer`（模型无关但慢）。
5. 不确定 → `shap.Explainer`（自动选最佳算法）。
速度由快到慢：Linear > Tree > Deep ≈ Gradient > Kernel > Permutation。

第二步 算 SHAP 值
- `explainer = shap.TreeExplainer(model)`；`shap_values = explainer(X_test)`。
- 返回对象含 `.values`（特征归因）、`.base_values`（基线=期望输出）、`.data`（原始特征值）。
- 黑盒/深度模型需提供背景数据（baseline）：训练集随机抽 50-1000 条，或 kmeans 选代表样本；样本量影响幅值不影响相对重要性。

第三步 由全局到局部可视化
- 全局：`beeswarm`（重要性+取值分布）、`bar`（重要性汇总）。
- 局部：`waterfall(shap_values[0])`（单样本拆解）、`force`（叠加力图）。
- 关系：`scatter(shap_values[:, "特征名"])`，加 `color=` 看交互。

## 指令

完整分析（先全局后局部）
```python
import shap, numpy as np
explainer = shap.TreeExplainer(model)
shap_values = explainer(X_test)
shap.plots.beeswarm(shap_values, max_display=15)
shap.plots.bar(shap_values)
# 取 mean(|SHAP|) 最高的 5 个特征看关系
top = X_test.columns[np.abs(shap_values.values).mean(0).argsort()[-5:]]
for f in top:
    shap.plots.scatter(shap_values[:, f])
shap.plots.waterfall(shap_values[0])
```

模型调试 / 查数据泄漏
```python
errors = model.predict(X_test) != y_test
for idx in np.where(errors)[0][:5]:
    shap.plots.waterfall(shap_values[idx])   # 看误判靠什么特征
# 某特征重要性异常高 → 疑似泄漏，回查该列是否含标签信息
shap.plots.scatter(shap_values[:, "Suspicious_Feature"])
```

公平性 / 群组对比
```python
mask_a = X_test["Group"] == "A"; mask_b = X_test["Group"] == "B"
shap.plots.bar({"Group A": shap_values[mask_a], "Group B": shap_values[mask_b]})
# 关注受保护属性的 SHAP 重要性，及与之高相关的「代理特征」
```

大数据/生产优化
```python
shap_values = explainer(X_test[:1000])          # 采样子集
shap.plots.beeswarm(shap_values[:1000])
shap.plots.scatter(shap_values[:, "F"], alpha=0.3)  # 稠密点加透明
import joblib; joblib.dump(explainer, "explainer.pkl")  # 缓存 explainer
```

安装：`uv pip install -U shap matplotlib`（依赖 numpy/pandas/scikit-learn/scipy；按模型再装 xgboost/lightgbm/tensorflow/torch）。

## 示例

场景：XGBoost 风控模型解释一条被拒样本。
1. `explainer = shap.TreeExplainer(model)`；注意分类器默认解释 margin（log-odds），要解释概率传 `model_output="probability"`。
2. `sv = explainer(X_test)`；`shap.plots.waterfall(sv[i])` 看该样本从基线 0.30 经各特征加减到最终 0.50 的路径（加性：基线 + ΣSHAP = 预测）。
3. `shap.plots.beeswarm(sv)` 确认全局主因；对 Top 特征 `scatter` 校验关系方向是否符合业务常识。

## 注意事项

- 单位陷阱：树分类器默认输出 log-odds 而非概率，别把 log-odds 当概率读；明确模型输出是 raw / probability / log-odds。
- 别用错 explainer：树模型用 KernelExplainer 会又慢又没必要；KernelExplainer 仅在无专用 explainer 时用。
- 背景数据不足会让 Deep/Kernel 结果不稳，用 100-1000 条代表样本。
- 图太挤调 `max_display` 或做特征聚类；图不显示则检查 matplotlib 后端，必要时 `plt.show()`。
- 相关特征会分摊归因，用 TreeExplainer 的相关感知选项或特征聚类处理冗余。
- SHAP 揭示关联非因果；异常高重要性优先怀疑数据泄漏；结论须结合领域知识验证。

## 互见

- related：`scikit-learn-ml` —— 训练出待解释的模型；`computer-vision-expert`、`huggingface-model-trainer` —— 深度/视觉模型的解释对象；`llm-judge-evaluation` —— 模型质量评估的另一视角。
- combines_with：`mlops-model-productionizer` —— 把解释接入生产 API、随漂移监控一并上线；`langfuse-llm-observability` —— 可观测体系中沉淀解释产物。
- 源参考文档（源仓库 references/）：explainers.md（各 explainer 参数与适用）、plots.md（全部图型与选择指南）、workflows.md（调试/特征工程/对比/公平性/部署/时序）、theory.md（Shapley 值数学基础与算法）。
