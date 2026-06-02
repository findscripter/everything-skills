---
name: guided-statistical-analysis
title: 统计分析与检验选择
description: 当为研究/实验数据选择统计检验、核查假设前提、计算效应量与功效、并按 APA 规范报告结果时使用；做检验选型、前提诊断、t检验/方差分析/卡方/回归/相关/贝叶斯分析及成稿报告；不适用于纯描述性可视化、机器学习建模或具体模型 API 编程（改用 statsmodels/pymc）。触发词：统计检验、假设检验、选择检验、t检验、方差分析、ANOVA、卡方检验、回归分析、相关分析、效应量、功效分析、power analysis、p值、APA报告、贝叶斯检验、前提假设检查、正态性检验、hypothesis test、effect size。
domain: 领域/science
triggers: [统计检验, 假设检验, 选择检验, t检验, 方差分析, ANOVA, 卡方检验, 回归分析, 相关分析, 效应量, 功效分析, power analysis, p值, APA报告, 贝叶斯检验, 前提假设检查, 正态性检验, hypothesis test, effect size]
tags: [statistics, hypothesis-testing, anova, regression, effect-size, power-analysis, bayesian, apa-reporting, science]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [pingouin, scipy.stats, statsmodels, pymc, arviz, pandas, matplotlib, seaborn]
requires: []
related: [statsmodels-statistical-modeling, scientific-manuscript-writing, research-experiment-designer]
combines_with: [research-experiment-designer, statsmodels-statistical-modeling, scientific-manuscript-writing]
license: MIT
source: K-Dense-AI/scientific-agent-skills
source_license: MIT
---
## 何时使用

适用于面向科研/实验或观测数据的统计推断全流程：

- 需要根据研究问题和数据特征**选对检验**（两组/多组比较、相关、回归、贝叶斯替代）。
- 运行检验前需**系统核查前提假设**（正态性、方差齐性、线性、离群点）并在被违背时给出补救方案。
- 需要计算并解释**效应量与置信区间**、做先验功效分析确定样本量。
- 需要把结果整理成 **APA 规范报告**（含描述统计、检验量、df、精确 p 值、效应量）。

不该用的边界：

- 只需画图做探索性可视化、或做机器学习/预测建模——本条专注推断而非预测。
- 已经确定模型、只想调用具体 API（OLS、GLM、ARIMA 的参数化建模）——改用 statsmodels；复杂贝叶斯层级模型工作流——改用 pymc。
- 事后功效分析（post-hoc power）——不推荐，改用敏感性分析。

## 步骤

1. 明确研究问题与假设，据数据特征用「检验选型速查」选定检验。
2. 做先验功效分析估算所需样本量。
3. 载入数据，核查缺失值与离群点。
4. **运行检验前**用 `assumption_checks` 核查前提假设；被违背则切换稳健/非参方法。
5. 运行主分析，计算效应量及其置信区间；显著时做带校正的事后比较。
6. 出图（Q-Q、残差图、箱线图），按 APA 模板撰写报告，含所有计划内分析（包括不显著结果）。

## 指令

**安装（uv，Python 3.10+，贝叶斯部分建议 3.12+）：**

```bash
uv pip install "pingouin>=0.6" "scipy>=1.11" "statsmodels>=0.14.6" pandas matplotlib seaborn
uv pip install "pymc>=5.0" "arviz>=0.17"   # 贝叶斯
```

**检验选型速查：**

- 两组·连续·正态：独立样本 t 检验；非正态：Mann-Whitney U。
- 两组·配对·正态：配对 t 检验；非正态：Wilcoxon 符号秩。
- 二分类结局：卡方检验或 Fisher 精确检验。
- 3+ 组·独立·正态：单因素 ANOVA；非正态：Kruskal-Wallis。
- 3+ 组·配对·正态：重复测量 ANOVA；非正态：Friedman。
- 关系：两连续变量 → Pearson（正态）/ Spearman（非正态）；连续结局+预测变量 → 线性回归；二分类结局 → 逻辑回归。
- 以上均有贝叶斯版本，可给出假设的直接概率、Bayes Factor、并能支持原假设。

**前提假设核查（始终在解释结果前执行）：** 在 skill 的 `scripts/` 目录运行 Python 或将其加入 `sys.path`。

```python
from assumption_checks import comprehensive_assumption_check
results = comprehensive_assumption_check(data=df, value_col='score', group_col='group', alpha=0.05)
```

执行：离群点检测（IQR + z 分数）、正态性（Shapiro-Wilk + Q-Q）、方差齐性（Levene + 箱线图）、解释与建议。

**违背时的处理：**

- 正态性：轻度违背且每组 n>30 → 仍可用参数检验；中度 → 改非参；重度 → 变换或非参。
- 方差齐性：t 检验 → Welch t；ANOVA → Welch/Brown-Forsythe；回归 → 稳健标准误或加权最小二乘。
- 线性（回归）：加多项式项、变换变量，或用非线性模型/GAM。

**效应量基准（仅参考，需结合情境）：** Cohen's d（0.2/0.5/0.8）、η²_p（0.01/0.06/0.14）、r（0.1/0.3/0.5）、R²（0.02/0.13/0.26）、Cramér's V（0.07/0.21/0.35）。

## 示例

**独立样本 t 检验（含报告）：**

```python
import pingouin as pg
result = pg.ttest(group_a, group_b, correction='auto')  # Pingouin 0.5+ 列名
t_stat = result['T'].values[0]; df = result['dof'].values[0]
p_value = result['p_val'].values[0]; cohens_d = result['cohen_d'].values[0]
ci_lower, ci_upper = result['CI95'].values[0]
print(f"t({df:.0f}) = {t_stat:.2f}, p = {p_value:.3f}")
print(f"Cohen's d = {cohens_d:.2f}, 95% CI [{ci_lower:.2f}, {ci_upper:.2f}]")
```

**单因素 ANOVA + 事后检验：**

```python
aov = pg.anova(dv='score', between='group', data=df, detailed=True)
if aov['p_unc'].values[0] < 0.05:
    posthoc = pg.pairwise_tukey(dv='score', between='group', data=df)
eta_squared = aov['np2'].values[0]   # 偏 eta 平方
```

**线性回归诊断（多重共线性 VIF + 残差图）：**

```python
import statsmodels.api as sm
from statsmodels.stats.outliers_influence import variance_inflation_factor
X = sm.add_constant(X_predictors)
model = sm.OLS(y, X).fit()
print(model.summary())
vif = [variance_inflation_factor(X.values, i) for i in range(X.shape[1])]
# 残差: model.resid 对 model.fittedvalues 作散点 + Q-Q + Scale-Location + 直方图
```

**先验功效分析（定样本量）：**

```python
from statsmodels.stats.power import tt_ind_solve_power, FTestAnovaPower
n = tt_ind_solve_power(effect_size=0.5, alpha=0.05, power=0.80, ratio=1.0, alternative='two-sided')
# 敏感性分析: effect_size=None, nobs1=50 反解可检测的最小 d
```

**贝叶斯 t 检验（PyMC）：** 设 `mu1, mu2 ~ Normal(0,10)`、`sigma ~ HalfNormal(10)`，似然为正态，`pm.sample(2000, tune=1000)`；用 `np.mean(diff>0)` 给出 P(μ₁>μ₂|data)，并查 R̂<1.01、ESS>1000。

**APA 报告片段（独立 t 检验）：**

```
A 组 (n=48, M=75.2, SD=8.5) 显著高于 B 组 (n=52, M=68.3, SD=9.2),
t(98)=3.82, p<.001, d=0.77, 95% CI [0.36, 1.18], 双侧。正态性
(Shapiro-Wilk) 与方差齐性 (Levene F(1,98)=1.23, p=.27) 均满足。
```

## 注意事项

- **始终先查前提假设再解释结果**；报告效应量与置信区间，并区分统计显著与实际意义。
- 报告**所有计划内分析**（含不显著结果），多重比较时做族系误差校正。
- 避免 p-hacking 与 HARKing；p<.05 不等于效应有意义；p 值不是「假设为真的概率」。
- Pingouin 0.5+ 改了输出列名（`p_val`、`cohen_d`、`CI95`、`p_unc`），示例已用新名。
- `statsmodels>=0.14.6` 搭 `scipy>=1.11`，避免 SciPy 1.16+ 的 `_lazywhere` 导入错误。
- Pingouin 0.5+ 移除了 t 检验单侧 BF；贝叶斯假设检验改用 PyMC 或 JASP/R 的 BayesFactor。
- 缺失值需先判明机制（MCAR/MAR/MNAR）；不要过度解读不显著结果（无证据 ≠ 反证）。

## 互见

- `first-principles-thinking`：在选检验前从研究问题与数据生成机制出发界定假设。
- `fact-checking`：核验统计结论与数值报告的可信度。
- `csv-data-cleaner`：分析前清洗数据、处理缺失值与离群点。

---

本条采编自 K-Dense-AI/scientific-agent-skills（MIT）。
