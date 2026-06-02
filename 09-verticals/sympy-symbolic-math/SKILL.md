---
name: sympy-symbolic-math
title: SymPy 符号数学计算
description: 当需要用 Python 进行精确符号运算（求解方程、微积分、线性代数、物理公式推导）而非浮点近似时使用；用 SymPy 完成符号代数/微积分/矩阵/方程求解并生成 LaTeX、C/Fortran 或可向量化的 numpy 函数；不适用于纯数值计算、大规模数值优化或机器学习（应改用 numpy/scipy）。触发词：sympy、符号计算、symbolic math、求导、积分、解方程、solve、化简、simplify、矩阵特征值、eigenvalues、LaTeX 公式、lambdify、精确计算
domain: 领域/science
triggers: [sympy, 符号计算, symbolic math, 求导, 积分, 解方程, solve, 化简, simplify, 矩阵特征值, eigenvalues, LaTeX 公式, lambdify, 精确计算]
tags: [sympy, symbolic-math, calculus, linear-algebra, equation-solving, python, science, code-generation]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [sympy, python, numpy, scipy, matplotlib]
requires: []
related: [math-proof-writer, guided-statistical-analysis, matplotlib-visualization]
combines_with: [math-proof-writer, matplotlib-visualization]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：需要精确（而非浮点近似）的数学结果，例如保留 `sqrt(2)` 而非 `1.414...`。典型任务：

- 符号求解方程：代数方程、方程组、微分方程。
- 微积分：求导、积分、极限、级数展开。
- 代数表达式化简、展开、因式分解。
- 矩阵与线性代数（行列式、逆、特征值/特征向量、解线性系统）。
- 物理推导（经典力学/拉格朗日法、向量分析、量子力学）。
- 数论、几何、组合、逻辑与集合、概率统计、特殊函数。
- 把数学表达式转成可执行代码（Python/numpy、C、Fortran）或生成 LaTeX。

不该用：纯数值/大批量数值计算（用 numpy）、数值优化求根（用 `scipy.optimize`）、机器学习；以及结果必须经过环境内实测、专家复核的场景——本技能不替代验证。若输入、精度要求或成功标准不明确，先停下确认。

## 步骤

1. 先 `from sympy import symbols` 定义所有符号，再写表达式（直接用未定义的 `x` 会报 `NameError`）。
2. 给符号加假设以获得更好的化简：`x = symbols('x', positive=True, real=True)`，则 `sqrt(x**2)` 返回 `x` 而非 `Abs(x)`。常用假设：`real`、`positive`、`negative`、`integer`、`rational`、`complex`、`even`、`odd`。
3. 坚持精确算术：用 `Rational(1, 2)` 或 `S(1)/2`，不要写 `0.5`（会引入浮点近似）。
4. 选对求解器（见下）。
5. 需要数值结果时再 `.evalf()`；需要批量数值计算时用 `lambdify` 转成 numpy 函数。

## 指令

按需选择求解器：

- `solveset`：代数方程（首选）。
- `linsolve`：线性方程组。
- `nonlinsolve`：非线性方程组。
- `dsolve`：微分方程。
- `solve`：通用（遗留接口，灵活但语义较松）。
- `nsolve`：数值求根（无闭式解时）。

核心导入速查：

```python
from sympy import symbols, simplify, expand, factor, cancel
from sympy import diff, integrate, limit, series, oo
from sympy import solve, solveset, linsolve, nonlinsolve, dsolve, Eq
from sympy import Matrix, eye, zeros
from sympy import Rational, S, pi, sqrt, latex, lambdify
```

## 示例

微积分：

```python
diff(x**2*y**3, x, y)          # 6*x*y**2（偏导）
integrate(x**2, (x, 0, 1))     # 1/3（定积分）
integrate(exp(-x), (x, 0, oo)) # 1（反常积分）
limit(sin(x)/x, x, 0)          # 1
series(exp(x), x, 0, 6)        # 1 + x + x**2/2 + ... + O(x**6)
```

解方程与微分方程：

```python
solveset(x**2 - 4, x)          # {-2, 2}
linsolve([x + y - 2, x - y], x, y)  # {(1, 1)}

from sympy import Function, Derivative
f = symbols('f', cls=Function)
dsolve(Derivative(f(x), x) - f(x), f(x))  # Eq(f(x), C1*exp(x))
```

矩阵：

```python
M = Matrix([[1, 2], [3, 4]])
M**-1; M.det(); M.T
M.eigenvals()        # {特征值: 重数}
P, D = M.diagonalize()  # M = P*D*P^-1
```

符号到数值流水线（性能关键）：

```python
import numpy as np
f = lambdify(x, x**2 + 2*x + 1, 'numpy')  # 比循环 subs().evalf() 快得多
f(np.arange(1000))
```

输出与代码生成：

```python
latex(expr)                                  # 转 LaTeX
from sympy.utilities.codegen import codegen
codegen(('my_func', expr), 'C')              # 生成 C 代码
```

## 注意事项

- 慢循环：不要反复 `subs()` + `evalf()`，改用 `lambdify` 生成 numpy 函数。
- 浮点污染：`0.5*x` 是近似值；用 `Rational(1,2)*x` 保持精确。
- 解不出来：换求解器（`solve`/`solveset`/`nsolve`），或确认是否存在闭式解，否则转数值法。
- 化简不理想：试 `factor`、`expand`、`trigsimp`，给符号加假设，或 `simplify(expr, force=True)` 做激进化简。
- 高精度：`result.evalf(50)` 可取 50 位精度。
- 与 scipy 协作：用 `lambdify` 把符号方程转成函数后交给 `fsolve` 数值求根。
- 官方文档：https://docs.sympy.org/

## 互见

本条采编自 sickn33/antigravity-awesome-skills（MIT）。
