---
name: statsmodels-statistical-modeling
title: Statsmodels 统计建模
description: 当用 Python 做严谨统计建模与推断（线性/广义线性回归、离散选择、时间序列预测、假设检验与诊断）时使用；用 statsmodels 拟合模型并产出含系数/置信区间/p 值的可发表结果与残差诊断；不适用于纯预测机器学习（用 scikit-learn）、深度学习/GPU 训练、仅做数据清洗或画图。触发词：statsmodels、OLS、回归、logistic、GLM、ARIMA、时间序列、假设检验、置信区间、p值
domain: 数据/analysis
triggers: [statsmodels, OLS, 线性回归, logistic回归, GLM, 泊松回归, ARIMA, SARIMAX, 时间序列, 假设检验, 异方差, 置信区间, p值, AIC, BIC]
tags: [statsmodels, statistics, regression, econometrics, time-series, hypothesis-testing, python, 数据/分析]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, statsmodels, pandas, numpy, scipy, matplotlib]
requires: []
related: [scikit-learn-ml, seaborn-statistical-charts, guided-statistical-analysis]
combines_with: [polars-dataframe, seaborn-statistical-charts, matplotlib-visualization]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用场景：

- 需要**推断**而非纯预测：要看系数、标准误、置信区间、p 值，并出可发表的统计结果表（`results.summary()`）。
- 线性回归（OLS/WLS/GLS/分位数回归）、广义线性模型（logistic/Poisson/Gamma 等）、离散/计数结果（二元/多元/有序/计数）。
- 时间序列建模与预测（AR/ARIMA/SARIMAX/VAR/指数平滑）。
- 假设检验与模型诊断：异方差、自相关、正态性、共线性、异常值/强影响点，模型比较（AIC/BIC、似然比检验）。

不该用的边界：

- 只追求预测精度、不需要统计推断 → 用 `scikit-learn-ml`（交叉验证 + Pipeline + 调参）。
- 深度学习、大模型、GPU 训练 → 用 PyTorch / TensorFlow。
- 仅做数据清洗（缺失/去重/类型）→ 先用 `csv-data-cleaner`，清洗后再建模。
- 仅做统计图表 → 用 `seaborn-statistical-charts` / `matplotlib-visualization`。
- 不能替代环境相关的验证、测试或专家复核；缺目标列、样本太小或成功标准不明时先澄清。

## 步骤 / 指令

**先按结果类型选模型**（最常见的错是用错模型）：

| 结果变量 | 模型 |
|---|---|
| 连续 | OLS（异方差→WLS 或稳健 SE） |
| 二元 0/1 | `Logit` / `Probit` |
| 计数 | `GLM(family=Poisson)`；过离散→`NegativeBinomial` |
| 正偏态连续 | `GLM(family=Gamma)` |
| 多分类/有序 | `MNLogit` / `OrderedModel` |
| 时间序列 | `ARIMA` / `SARIMAX` / `VAR` |

**通用流程**：

1. **探查数据**：缺失值先处理；区分数值/类别列。
2. **加常数项**：`X = sm.add_constant(X_data)`——除非刻意去截距，否则**必须加**（用 formula API 自动含截距）。
3. **拟合**：`model.fit()`，注意优化是否收敛（看 warning）。
4. **读结果**：`print(results.summary())`，关注系数、p 值、置信区间、R²/伪 R²、AIC/BIC。
5. **诊断**：残差 vs 拟合值散点、Q-Q 图；按需做异方差/自相关/正态性检验。
6. **稳健推断**：有异方差或聚类时用稳健标准误（`cov_type='HC3'` 或 `HAC`/`cluster`）。
7. **比较模型**：嵌套用似然比检验（LR），非嵌套用 AIC/BIC（越小越好）。
8. **预测**：`results.get_prediction(X_new).summary_frame()`，含均值、置信区间与预测区间。

**Formula API（R 风格，推荐用 DataFrame 时）**：`smf.ols('y ~ x1 + x2 + x1:x2', data=df).fit()`；类别列 `C(group)`；交互 `x1*x2`；多项式 `I(x**2)`；对应有 `smf.logit` / `smf.poisson`。

**安装**：`uv pip install statsmodels`（可选 `pandas numpy scipy matplotlib`）。

## 示例

OLS 线性回归 + 异方差诊断：
```python
import statsmodels.api as sm
from statsmodels.stats.diagnostic import het_breuschpagan

X = sm.add_constant(X_data)            # 务必加截距
results = sm.OLS(y, X).fit()
print(results.summary())               # 系数/p值/置信区间/R²
print(f"R-squared: {results.rsquared:.4f}")

# Breusch-Pagan 异方差检验；p<0.05 提示异方差
bp = het_breuschpagan(results.resid, X)
print(f"Breusch-Pagan p: {bp[1]:.4f}")
if bp[1] < 0.05:                       # 有异方差→改用稳健标准误
    results = sm.OLS(y, X).fit(cov_type="HC3")
```

Logistic 回归（二元结果）+ 优势比 + 边际效应：
```python
from statsmodels.discrete.discrete_model import Logit
res = Logit(y_binary, sm.add_constant(X_data)).fit()
print(res.summary())
print("Odds ratios:\n", np.exp(res.params))   # log-odds→优势比
print(res.get_margeff().summary())            # 平均边际效应
probs = res.predict()                          # 预测概率
```

ARIMA 时间序列预测（先验平稳，再定阶）：
```python
from statsmodels.tsa.stattools import adfuller
from statsmodels.tsa.arima.model import ARIMA

if adfuller(y_series)[1] > 0.05:        # ADF p>0.05→非平稳，需差分
    pass                                 # 由 ARIMA 的 d 阶处理，或 .diff().dropna()
res = ARIMA(y_series, order=(1, 1, 1)).fit()
print(res.summary())
fc = res.get_forecast(steps=10).summary_frame()  # 含均值与置信区间
res.plot_diagnostics(figsize=(12, 8))            # 残差诊断（Ljung-Box 等）
```

Poisson GLM + 过离散检查（过离散则换负二项）：
```python
res = sm.GLM(y_counts, sm.add_constant(X_data),
             family=sm.families.Poisson()).fit()
od = res.pearson_chi2 / res.df_resid    # >1.5 视为过离散
if od > 1.5:
    from statsmodels.discrete.count_model import NegativeBinomial
    res = NegativeBinomial(y_counts, sm.add_constant(X_data)).fit()
```

模型比较：
```python
# 非嵌套：比 AIC/BIC（越小越好）
# 嵌套：似然比检验
from scipy import stats
lr = 2 * (full.llf - reduced.llf)
p = 1 - stats.chi2.cdf(lr, full.df_model - reduced.df_model)
```

## 注意事项

- **忘加常数项**：`sm.OLS` 等不会自动加截距，须 `sm.add_constant()`；formula API 才自动含截距。
- **用错模型**：二元→Logit/Probit，计数→Poisson/NB，别一律 OLS。
- **解释系数要还原链接函数**：log 链接看 `exp(β)`（率比/优势比），不要直接读 logit/log 尺度系数。
- **Poisson 过离散**：先查 `pearson_chi2/df_resid`，>1.5 改负二项；零过多考虑 ZIP/ZINB/Hurdle。
- **时间序列须先平稳**：ADF/KPSS 检验，非平稳先差分，否则 ARIMA 结果失真。
- **检查收敛**：留意优化 warning；离散/计数模型不收敛常因完全分离或共线。
- **预测区间 ≠ 置信区间**：预测区间更宽（含个体噪声），别混用。
- **多重检验要校正**（Bonferroni/FDR）；有异方差/聚类用稳健 SE（HC0–HC3、Newey-West、cluster）。
- 报告时同时给效应量与置信区间，而非只给 p 值；标注变换与剔除的观测。
- 不能替代环境相关验证与专家复核；输出仅供参考。

## 互见

- requires：无。
- related：`scikit-learn-ml`（侧重预测的机器学习，与本技能侧重推断互补）；`seaborn-statistical-charts`、`matplotlib-visualization`（残差/诊断图与结果可视化）。
- combines_with：`csv-data-cleaner`（建模前清洗脏数据，清洗完再进本技能）。

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可）；该技能内容原署 K-Dense Inc.，原始声明为 BSD-3-Clause，均可再分发。
