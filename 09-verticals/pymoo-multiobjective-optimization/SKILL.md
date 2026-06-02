---
name: pymoo-multiobjective-optimization
title: pymoo 多目标优化框架
description: 当用 Python 求解单/多/超多目标优化、需要权衡 Pareto 前沿或处理约束/混合变量优化时使用；用 pymoo 的统一 minimize() 配 NSGA-II/III、MOEA/D、GA/DE/PSO 求解并产出 Pareto 解集、可视化与 MCDM 决策；不适用于纯凸/线性规划（用 scipy/cvxpy）、深度学习超参搜索（用 Optuna/Ray Tune）或单纯符号求解。触发词：pymoo、多目标优化、Pareto 前沿、NSGA-II、NSGA-III、MOEA/D、遗传算法、进化算法、约束优化、ZDT、DTLZ、帕累托
domain: 领域/science
triggers: [pymoo, 多目标优化, Pareto 前沿, NSGA-II, NSGA-III, MOEA/D, 遗传算法, 进化算法, 约束优化, ZDT, DTLZ, 帕累托, multi-objective optimization]
tags: [pymoo, multi-objective-optimization, evolutionary-algorithm, nsga2, nsga3, pareto-front, genetic-algorithm, constrained-optimization, python]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [pymoo, python, numpy, scipy, matplotlib]
requires: []
related: [sympy-symbolic-math, scikit-learn-ml, statsmodels-statistical-modeling, fluidsim-cfd-simulation]
combines_with: [fluidsim-cfd-simulation, matplotlib-visualization]
license: MIT
source: K-Dense-AI/scientific-agent-skills
source_license: MIT
---
## 何时使用

适用：工程/设计/调度等存在**多个相互冲突目标**或需进化算法的优化问题。典型任务：

- 单目标优化：用 GA、DE、PSO、CMA-ES 寻全局最优。
- 多目标（2-3 目标）：求 Pareto 前沿、分析权衡 → NSGA-II。
- 超多目标（4+ 目标）：高维 Pareto → NSGA-III（需参考方向）、RVEA、AGE-MOEA。
- 约束优化：不等式 `g(x)<=0`、等式 `h(x)=0`。
- 混合变量：连续/整数/二进制/类别变量同存。
- 基准测试（ZDT/DTLZ/WFG）、自定义遗传算子、从前沿做多准则决策（MCDM）。

不该用：纯凸/线性规划（用 scipy.optimize、cvxpy 更高效）、深度学习超参搜索（用 Optuna/Ray Tune）、单纯符号方程求解（用 sympy）；以及结果须经实测/专家复核的场景——本技能不替代验证。目标、约束或成功标准不明确时先停下确认。

## 步骤

1. 安装：`uv pip install pymoo`（复现环境可固定 `pymoo==0.6.1.6`）。依赖 NumPy（2.x 起兼容）、SciPy；matplotlib 用于可视化，autograd/joblib 可选。
2. 定义问题：内置用 `get_problem(...)`；自定义优先继承 `ElementwiseProblem`（逐解评估，便于并行）。
3. 选算法（见下表）。多/超多目标按目标数选 NSGA-II / NSGA-III。
4. 设终止条件：`('n_gen', N)`、`('n_evals', N)` 或 `get_termination("f_tol", tol=0.001)`。
5. `minimize(problem, algorithm, termination, seed=1, verbose=True)` 求解。
6. 取结果：`result.X`（决策变量）、`result.F`（目标值）、`result.G`/`result.CV`（约束违反）；可视化并按需做 MCDM 决策。

## 指令

统一入口：所有任务都走 `from pymoo.optimize import minimize`。

算法选择：

| 场景 | 推荐算法 |
|---|---|
| 单目标通用 / 连续 / 平滑 / 噪声大 | GA / DE / PSO / CMA-ES |
| 多目标 2-3（标准） | NSGA-II（其次 SPEA2、MOEA/D、R-NSGA-II） |
| 超多目标 4+ | NSGA-III、RVEA、AGE-MOEA |
| 重约束 | SRES / ISRES（内置约束处理） |

约束写法（强约束）：不等式一律化为 `g(x) <= 0`（<=0 即可行）；等式化为 `h(x) = 0`；遇 `g(x) >= b` 转成 `-(g(x)-b) <= 0`。`n_ieq_constr` / `n_eq_constr` 在 `__init__` 声明，`_evaluate` 里写入 `out["G"]` / `out["H"]`。

约束处理四选一：① 默认可行性优先（多数算法自动支持，`result.CV[:,0]==0` 判可行）；② 罚函数 `ConstraintsAsPenalty(problem, penalty=1e6)`；③ 违反量当目标 `ConstraintsAsObjective(problem)`；④ 专用算法 SRES/ISRES。

可视化按目标数：2 目标 `Scatter`；3 目标 `Scatter`（自动 3D）；4+ 目标 `PCP`（平行坐标）；多方案对比 `Petal`。

## 示例

多目标（NSGA-II + 前沿可视化）：

```python
from pymoo.algorithms.moo.nsga2 import NSGA2
from pymoo.problems import get_problem
from pymoo.optimize import minimize
from pymoo.visualization.scatter import Scatter

problem = get_problem("zdt1")          # 双目标基准
algorithm = NSGA2(pop_size=100)
result = minimize(problem, algorithm, ('n_gen', 200), seed=1)

plot = Scatter()
plot.add(result.F, label="求得前沿")
plot.add(problem.pareto_front(), label="真实前沿", alpha=0.3)
plot.show()
```

超多目标（NSGA-III 必须给参考方向）：

```python
from pymoo.algorithms.moo.nsga3 import NSGA3
from pymoo.util.ref_dirs import get_reference_directions

problem = get_problem("dtlz2", n_obj=5)
ref_dirs = get_reference_directions("das-dennis", n_obj=5, n_partitions=12)
algorithm = NSGA3(ref_dirs=ref_dirs)
result = minimize(problem, algorithm, ('n_gen', 300), seed=1)
```

自定义带约束问题：

```python
from pymoo.core.problem import ElementwiseProblem
import numpy as np

class MyProblem(ElementwiseProblem):
    def __init__(self):
        super().__init__(n_var=2, n_obj=2, n_ieq_constr=2,
                         xl=np.array([0, 0]), xu=np.array([5, 5]))

    def _evaluate(self, x, out, *args, **kwargs):
        out["F"] = [x[0]**2 + x[1]**2, (x[0]-1)**2 + (x[1]-1)**2]
        out["G"] = [g1, g2]   # 每项需 <= 0
```

从前沿做决策（伪权重 MCDM，先归一化）：

```python
from pymoo.mcdm.pseudo_weights import PseudoWeights
import numpy as np

F_norm = (result.F - result.F.min(0)) / (result.F.max(0) - result.F.min(0))
weights = np.array([0.3, 0.7])        # 权重和为 1
idx = PseudoWeights(weights).do(F_norm)
best_X, best_F = result.X[idx], result.F[idx]
```

并行评估（每次评估昂贵时）：

```python
from multiprocessing.pool import ThreadPool
from pymoo.parallelization.starmap import StarmapParallelization

pool = ThreadPool(4)
runner = StarmapParallelization(pool.starmap)
problem = MyProblem(elementwise_runner=runner)  # __init__ 透传 elementwise_runner
# ... minimize(...) 后 pool.close()
```

混合变量：在 `__init__` 用 `vars` 字典声明 `Real/Integer/Binary/Choice`，单目标用 `MixedVariableGA(pop_size=20)`，多目标加 `survival=RankAndCrowdingSurvival()`。

## 注意事项

- NSGA-III/RVEA 必须提供 `ref_dirs`（`get_reference_directions`），否则无法引导种群。
- 约束方向：全部表述为 `g(x) <= 0`、`h(x) = 0`；可行性优先要求约束公式正确，否则会出现「几乎无可行解」。
- 不收敛：增大 `pop_size`、增加代数、换算法（多模态问题）、复核约束公式。
- 前沿分布差：调参考方向、增种群、开启 `eliminate_duplicates=True`、检查目标量纲。
- 量纲差异大先归一化；做 MCDM 前必须归一化到 [0,1]。
- 复现：固定 `seed`；分析收敛用 `save_history=True`。
- 计算太贵：减种群/代数、用更简算子，或经 `elementwise_runner` 并行评估。
- 连续变量算子常用 SBX 交叉 + PM 变异；二进制用 Bitflip；排列（TSP/调度）用 OrderCrossover + InversionMutation。
- 当前稳定版 pymoo 0.6.1.6（2025-11）。文档 https://pymoo.org/ ，LLM 友好索引 https://pymoo.org/llms.txt 。

## 互见

- related：`sympy-symbolic-math` —— 目标/约束的符号推导与解析梯度
- related：`guided-statistical-analysis` —— 优化结果的统计分析与显著性检验
- combines_with：`matplotlib-visualization` —— 自定义绘制 Pareto 前沿、收敛曲线
- combines_with：`research-experiment-designer` —— 把优化纳入实验设计与方案对比

本条采编自 K-Dense-AI/scientific-agent-skills（MIT）。
