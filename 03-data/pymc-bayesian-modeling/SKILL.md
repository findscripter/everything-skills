---
name: pymc-bayesian-modeling
title: PyMC 贝叶斯建模与 MCMC
description: 当用 Python 做贝叶斯建模、需要带不确定性的后验推断（分层/多层模型、回归、时间序列、缺失数据）并按完整贝叶斯工作流拟合验证时使用；用 PyMC 5.x 建模、跑 MCMC(NUTS)/变分推断、做先验/后验预测检查与收敛诊断、用 LOO/WAIC 比较模型；不适用于纯频率派推断(用 statsmodels)、只求预测精度的机器学习(用 scikit-learn)、深度学习 GPU 训练或仅做清洗画图；触发词：PyMC、贝叶斯、MCMC、NUTS、后验、先验、分层模型、LOO、WAIC、ArviZ
domain: 数据/analysis
triggers: [PyMC, 贝叶斯, Bayesian, MCMC, NUTS, 后验 posterior, 先验 prior, 分层模型 hierarchical, 变分推断 ADVI, LOO, WAIC, ArviZ, 概率编程, 不确定性量化, R-hat, 散度 divergence]
tags: [pymc, bayesian, mcmc, nuts, probabilistic-programming, arviz, hierarchical-model, model-comparison, python, 数据/分析]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, pymc, arviz, numpy]
requires: []
related: [statsmodels-statistical-modeling, scikit-learn-ml, guided-statistical-analysis, scientific-exploratory-data-analysis]
combines_with: [data-question-analyzer, seaborn-statistical-charts, matplotlib-visualization]
license: MIT
source: K-Dense-AI/scientific-agent-skills
source_license: MIT
---
## 何时使用

适用场景：

- 要做**贝叶斯推断**：拿到的是参数的完整后验分布与不确定性（HDI 区间），而非单点估计或 p 值。
- 建分层/多层模型处理分组数据，或要在模型里显式处理缺失数据、测量误差。
- 各类似然模型：线性/logistic/Poisson 回归、时间序列（AR）、自定义概率模型。
- 需要先验/后验预测检查、收敛诊断（R-hat、ESS、散度），或用 LOO/WAIC 比较多个模型。

不该用的边界：

- 只要频率派结果（系数、标准误、p 值、可发表结果表）→ 用 `statsmodels-statistical-modeling`，更快更直接。
- 只追求预测精度、不需要后验分布 → 用 `scikit-learn-ml`。
- 深度学习、大模型、GPU 训练 → 用 PyTorch/TensorFlow。
- 仅做数据清洗 → 先 `csv-data-cleaner`；仅做图表 → 用 `seaborn-statistical-charts`/`matplotlib-visualization`。
- 不能替代专家复核；样本太小、目标不明、先验无依据时先澄清再建模。

## 步骤 / 指令

固定按这条**贝叶斯工作流**推进，逐步加复杂度，每步都验证：

1. **备数据**：标准化连续预测变量 `X_scaled = (X - X.mean(0)) / X.std(0)`（显著改善采样）；缺失数据当参数显式处理；用 `coords` 命名维度。
2. **建模**：在 `with pm.Model(coords=...) as model:` 内写先验 + 似然。用**弱信息先验**（别用 flat 先验）；尺度参数用 `HalfNormal`/`Exponential`；优先用 `dims` 而非 `shape`；要更新做预测的值用 `pm.Data()` 包住。
3. **先验预测检查**（拟合前必做）：`pm.sample_prior_predictive(...)` + `az.plot_ppc(..., group='prior')`，看先验生成的数据是否落在合理范围，不合理就改先验重查。
4. **拟合**：`pm.sample(draws=2000, tune=1000, chains=4, target_accept=0.9, random_seed=42, idata_kwargs={'log_likelihood': True})`。要做模型比较必须带 `log_likelihood=True`。
5. **诊断**（解读前必做）：看 **R-hat < 1.01**（收敛）、**ESS > 400**（有效样本足）、**散度=0**、trace 图混合良好（毛毛虫状）。
6. **后验预测检查**：`pm.sample_posterior_predictive(idata, extend_inferencedata=True)` + `az.plot_ppc(idata)`，看是否复现观测数据的模式，系统性偏差提示模型设定有误。
7. **看结果**：`az.summary()` 看后验摘要；`az.plot_posterior` / `az.plot_forest` 看分布与系数。
8. **做预测**：`pm.set_data({...})` 换入新数据 → `pm.sample_posterior_predictive(idata.posterior, var_names=['y_obs'])`，用 `az.hdi()` 取预测区间。

**诊断出问题的对策**：散度 → 提高 `target_accept=0.95/0.99`、分层模型改**非中心化参数化**、加强先验；低 ESS → 加 `draws`、重参数化降相关、回归用 QR 分解；高 R-hat → 跑更长、查多峰、用 ADVI 初始化；采样慢 → ADVI 初始化、降复杂度、`cores=8, chains=8`。

**安装**：`uv pip install pymc arviz`（PyMC 与 ArviZ 配套做可视化与诊断）。

## 示例

按结果类型选似然，最常见的模型骨架：

```python
import pymc as pm, arviz as az, numpy as np

coords = {'predictors': ['v1','v2','v3'], 'obs_id': np.arange(len(y))}
with pm.Model(coords=coords) as model:
    alpha = pm.Normal('alpha', mu=0, sigma=1)
    beta  = pm.Normal('beta',  mu=0, sigma=1, dims='predictors')
    sigma = pm.HalfNormal('sigma', sigma=1)
    mu = alpha + pm.math.dot(X_scaled, beta)
    y_obs = pm.Normal('y_obs', mu=mu, sigma=sigma, observed=y, dims='obs_id')

with model:
    idata = pm.sample(draws=2000, tune=1000, chains=4, target_accept=0.9,
                      random_seed=42, idata_kwargs={'log_likelihood': True})
print(az.summary(idata, var_names=['alpha','beta','sigma']))
```

按结果类型替换似然：二元 `pm.Bernoulli('y', logit_p=alpha + pm.math.dot(X,beta))`；计数 `pm.Poisson('y', mu=pm.math.exp(log_lambda))`（过离散改 `NegativeBinomial`）；时间序列 `pm.AR('y', rho=rho, sigma=sigma, init_dist=...)`。

**分层模型（务必非中心化，否则散度爆炸）**：

```python
with pm.Model(coords={'groups': group_names}) as hm:
    mu_a = pm.Normal('mu_a', 0, 10); sd_a = pm.HalfNormal('sd_a', 1)
    a_off = pm.Normal('a_off', 0, 1, dims='groups')          # 标准正态偏移
    alpha = pm.Deterministic('alpha', mu_a + sd_a * a_off, dims='groups')  # 非中心化
    sigma = pm.HalfNormal('sigma', 1)
    y = pm.Normal('y', mu=alpha[group_idx], sigma=sigma, observed=y_obs)
```

**模型比较（LOO/WAIC）**：

```python
cmp = az.compare({'m1': idata1, 'm2': idata2}, ic='loo')  # 各模型需带 log_likelihood
# Δloo<2 选更简单；2~4 弱证据；4~10 中等；>10 强证据。
# 看 Pareto-k：k<0.7 LOO 可靠，k>0.7 改用 WAIC 或 k 折 CV。
```

## 注意事项

- **分层模型必须非中心化参数化**（`参数 = 超均值 + 超标准差 × 标准正态偏移`），中心化几乎必然产生散度。
- **散度不可忽视**：`idata.sample_stats.diverging.sum() > 0` 即后验有偏，先提 `target_accept` 再重参数化，别直接解读。
- **先验预测检查不能省**：先验若生成离谱数据，后验再漂亮也不可信。
- **模型比较前置条件**：拟合时必须 `log_likelihood=True`，否则 `az.compare` 无法计算。
- **选对似然**：连续→Normal/StudentT(抗离群)，二元→Bernoulli，计数→Poisson/NegativeBinomial，别一律高斯。
- 用弱信息先验，慎用 flat/Uniform 先验；尺度参数用 `HalfNormal`/`Exponential`。
- 报告用 HDI 区间表达不确定性，而非只给后验均值。
- 实用工具：`pm.model_to_graphviz(model)` 可视化结构；`idata.to_netcdf('r.nc')` 存、`az.from_netcdf` 读；超大模型用 minibatch ADVI 或数据子采样。
- 不能替代环境相关验证与专家复核；输出仅供参考。

## 互见

- requires：无。
- related：`statsmodels-statistical-modeling`（频率派统计推断，与本技能的贝叶斯推断互补）；`scikit-learn-ml`（侧重预测的机器学习）；`seaborn-statistical-charts`、`matplotlib-visualization`（诊断图与后验可视化，ArviZ 之外的补充画图）。
- combines_with：`csv-data-cleaner`（建模前清洗脏数据，清洗完再进本技能）；`matplotlib-visualization`（定制后验/预测区间图）。

---

采编自 K-Dense-AI/scientific-agent-skills 的 `pymc` 技能（原署 K-Dense Inc.）。注：源 SKILL.md 实际声明为 Apache License 2.0（非 MIT），二者均允许再分发；本条按 Apache-2.0 署源。
