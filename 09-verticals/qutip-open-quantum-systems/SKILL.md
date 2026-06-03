---
name: qutip-open-quantum-systems
title: QuTiP 开放量子系统仿真
description: 当研究开放量子系统动力学（主方程、Lindblad、退相干、量子光学、腔 QED）时使用；用 QuTiP 搭建态/算符/哈密顿量并选 sesolve/mesolve/mcsolve 等求解器做时间演化与可视化产物；不适用于电路型量子计算与硬件执行（改用 qiskit/cirq/pennylane）。触发词：QuTiP、主方程、mesolve
domain: 领域/science
triggers: [QuTiP, 开放量子系统, 主方程, Lindblad, 退相干, mesolve, mcsolve, 量子光学, 腔 QED, Jaynes-Cummings, Bloch 球, Wigner 函数, Floquet, HEOM, 稳态求解, 量子轨迹]
tags: [量子物理, 开放量子系统, 主方程, 量子光学, 数值仿真, python, 科学计算]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Python, QuTiP, NumPy, Matplotlib]
requires: []
related: [quantum-circuit-builder, cirq-quantum-circuits, pennylane-quantum-ml, sympy-symbolic-math]
combines_with: [matplotlib-visualization]
license: MIT
source: K-Dense-AI/scientific-agent-skills
source_license: MIT
---
## 何时使用

当任务涉及**开放（耗散）量子系统**或闭合系统的数值仿真时使用本技能，典型场景：

- 主方程 / Lindblad 动力学、退相干、弛豫
- 量子光学、腔 QED（如 Jaynes-Cummings 模型）
- 阻尼谐振子、纠缠演化、稳态、关联函数与谱
- Bloch 球、Wigner 函数等量子态可视化
- 高级方法：Floquet（周期驱动）、HEOM（非马尔可夫/强耦合）、置换不变性（全同粒子）

**不该用边界**：电路型量子计算、量子算法与真机执行不属于本技能——改用 qiskit / cirq / pennylane。门电路相关功能需额外的 `qutip-qip` 包。

## 步骤 / 指令

1. **安装**：`uv pip install qutip`（门电路另装 `qutip-qip`，控制脉冲另装 `qutip-qtrl`）。
2. **建态与算符**：用 `basis/coherent/thermal_dm` 建态，`destroy/num/sigmax/sigmay/sigmaz` 建算符，多体系统用 `tensor` 张量积。
3. **写哈密顿量与坍缩算符**：耗散通过坍缩算符 `c_ops`（如 `np.sqrt(kappa)*destroy(N)`）引入。
4. **选求解器**（关键决策）：
   - `sesolve`：纯态、幺正（闭合）演化，最快
   - `mesolve`：混合态、耗散、一般开放系统（默认首选）
   - `mcsolve`：量子跳跃、光子计数、单条轨迹；自动多核并行，调 `ntraj` 收敛
   - `brmesolve`：弱系统-浴耦合（Bloch-Redfield）
   - `fmmesolve`：时间周期哈密顿量（Floquet）
5. **演化并取观测量**：传 `e_ops=[...]` 只存期望值（省内存），`tlist` 用 `np.linspace` 定义。
6. **分析**：`expect`、`entropy_vn`、`concurrence`、`fidelity`、`tracedist`、`steadystate`、`correlation_2op_1t` + `spectrum_correlation_fft`。
7. **可视化**：`Bloch()`、`wigner`、`plot_fock_distribution`、`hinton`、`matrix_histogram`。

## 示例

最小闭合系统（自旋进动）：

```python
from qutip import *
import numpy as np, matplotlib.pyplot as plt

psi = basis(2, 0)          # |0⟩
H = sigmaz()               # 哈密顿量
tlist = np.linspace(0, 10, 100)
result = sesolve(H, psi, tlist, e_ops=[sigmaz()])
plt.plot(tlist, result.expect[0]); plt.xlabel('Time'); plt.ylabel('⟨σz⟩'); plt.show()
```

阻尼谐振子（开放系统，光子数衰减）：

```python
N, omega, kappa = 20, 1.0, 0.1
H = omega * num(N)
c_ops = [np.sqrt(kappa) * destroy(N)]      # 坍缩算符
psi0 = coherent(N, 3.0)
tlist = np.linspace(0, 50, 200)
result = mesolve(H, psi0, tlist, c_ops, e_ops=[num(N)])
plt.plot(tlist, result.expect[0]); plt.ylabel('⟨n⟩'); plt.show()
```

Jaynes-Cummings 模型（腔 QED，RWA + 双通道耗散）：

```python
N, wc, wa, g = 10, 1.0, 1.0, 0.05
a  = tensor(destroy(N), qeye(2))           # 腔模
sm = tensor(qeye(N), sigmam())             # 原子
H = wc*a.dag()*a + wa*sm.dag()*sm + g*(a.dag()*sm + a*sm.dag())
psi0 = tensor(coherent(N, 2), basis(2, 0)) # 腔相干态 + 原子基态
kappa, gamma = 0.1, 0.05
c_ops = [np.sqrt(kappa)*a, np.sqrt(gamma)*sm]
tlist = np.linspace(0, 50, 200)
result = mesolve(H, psi0, tlist, c_ops, e_ops=[a.dag()*a, sm.dag()*sm])
```

纠缠衰减（用 `result.states` 逐帧算 concurrence）：

```python
psi0 = bell_state('00')
gamma = 0.1
c_ops = [np.sqrt(gamma)*tensor(sigmaz(), qeye(2)),
         np.sqrt(gamma)*tensor(qeye(2), sigmaz())]
result = mesolve(qeye([2, 2]), psi0, np.linspace(0,10,100), c_ops)
C_t = [concurrence(s.proj()) for s in result.states]
```

高级方法骨架（Floquet / HEOM / Dicke）：

```python
# Floquet 周期驱动
T = 2*np.pi / w_drive
f_modes, f_energies = floquet_modes(H, T, args)

# HEOM 非马尔可夫 / 强耦合
from qutip.nonmarkov.heom import HEOMSolver, BosonicBath
bath = BosonicBath(Q, ck_real, vk_real)
hsolver = HEOMSolver(H_sys, [bath], max_depth=5)
result = hsolver.run(rho0, tlist)

# 置换不变性（全同粒子）
psi = dicke(N, j, m); Jz = jspin(N, 'z')
```

## 注意事项

- **截断希尔伯特空间**：取能捕捉动力学的最小维度 `N`；维度过大导致内存爆炸与变慢。
- **求解器选择影响性能**：纯态优先 `sesolve`（比 `mesolve` 快）；只在需要耗散时用 `mesolve`。
- **时变项用字符串格式**（如 `'cos(w*t)'`）最快。
- **只存所需数据**：用 `e_ops` 而非保存全部 `states`。
- **收敛检查**：对 `mcsolve` 改变 `ntraj`、希尔伯特维度与容差验证收敛。
- **故障排查**：
  - 内存问题 → 降维、用 `store_final_state` 选项或 Krylov 方法。
  - 仿真慢 → 字符串时变、略放宽容差、刚性问题试 `method='bdf'`。
  - 数值不稳 → 减小步长（`nsteps`）、放宽容差、检查算符定义。
  - 导入错误 → 确认 QuTiP 安装正确；量子门需 `qutip-qip`。

## 互见

- 官方文档：https://qutip.readthedocs.io/
- 教程：https://qutip.org/qutip-tutorials/
- API：https://qutip.readthedocs.io/en/stable/apidoc/apidoc.html
- 源仓库各 `references/` 模块（core_concepts / time_evolution / visualization / analysis / advanced）含更详尽的对应主题说明。

---

采编自 K-Dense-AI/scientific-agent-skills 的 `qutip` 技能（原协议 BSD-3-Clause；仓库整体 MIT）。
