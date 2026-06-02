---
name: quantum-circuit-builder
title: 量子计算电路构建（Qiskit）
description: 当需要用 Qiskit 构建量子电路、在本地模拟器或 IBM Quantum 真机上执行并分析结果时使用；做从搭电路、转译优化到 Sampler/Estimator 取测量值与期望值的端到端产物；不适用于 Google Cirq 硬件、PennyLane 梯度量子机器学习或 QuTiP 开放量子系统模拟；触发词：qiskit、量子电路、quantum circuit、量子计算、IBM Quantum、贝尔态、Bell state、转译 transpile、VQE、QAOA、Sampler、Estimator、量子比特 qubit
domain: 领域/science
triggers: [qiskit, 量子电路, quantum circuit, 量子计算, IBM Quantum, 贝尔态, Bell state, 转译 transpile, VQE, QAOA, Sampler, Estimator, 量子比特 qubit]
tags: [qiskit, quantum-computing, quantum-circuit, ibm-quantum, vqe, qaoa, transpilation, science, python]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [qiskit, qiskit-ibm-runtime, qiskit-aer, matplotlib, scipy, uv]
requires: []
related: [cirq-quantum-circuits, sympy-symbolic-math]
combines_with: [sympy-symbolic-math, matplotlib-visualization]
license: MIT
source: K-Dense-AI/scientific-agent-skills
source_license: MIT
---
## 何时使用

当任务需要构建量子电路、在模拟器或 IBM Quantum 真机上执行，并分析比特串/期望值结果时使用本条。典型场景：搭建贝尔态/纠缠电路、为硬件做转译优化、用 Sampler 取测量分布、用 Estimator 算可观测量期望、实现 VQE/QAOA/Grover 等变分或搜索算法、量子化学基态求解。

不该用的边界（务必先确认目标硬件/框架，避免选错栈）：
- 目标是 Google 量子硬件 → 改用 Cirq。
- 需要基于梯度的量子机器学习（自动微分）→ 改用 PennyLane。
- 做开放量子系统/含噪主方程演化模拟 → 改用 QuTiP。
- 纯经典数值或一般编程任务，无量子比特概念 → 本条不适用。

## 步骤

1. 安装环境：用 uv 装 Qiskit，含可视化依赖。
2. 构建电路：用 `QuantumCircuit` 加单比特门（H、X、Y、Z、旋转/相位门）、多比特门（CX、SWAP、Toffoli），按需 `measure_all()`。
3. 本地验证：先用 `StatevectorSampler`（取比特串）或 `StatevectorEstimator`（取期望值）在模拟器跑通，再上硬件。
4. 转译优化：上真机前必须 `transpile(qc, backend=backend, optimization_level=3)`，让电路适配后端门集与拓扑。
5. 选 primitive 与执行模式：Sampler 取测量分布（优化类算法）；Estimator 算可观测量期望（化学/物理）。模式：Session（VQE/QAOA 等迭代算法）、Batch（独立并行作业）、单作业（一次性实验）。
6. 真机执行：通过 `QiskitRuntimeService` 选后端（可用 `least_busy()`），提交前查后端状态，保存 job id，按需设 `resilience_level` 做误差缓解。
7. 后处理与可视化：`get_counts()` 取结果，`qc.draw('mpl')` 画电路，`plot_histogram(counts)` 画直方图。

## 指令

安装：

```bash
uv pip install qiskit
uv pip install "qiskit[visualization]" matplotlib
```

Qiskit Patterns 四步工作流：Map（问题映射成电路）→ Optimize（转译适配硬件）→ Execute（用 primitive 运行）→ Post-process（提取分析结果）。

关键约束：
- production 用 `optimization_level=3`。
- 尽量减少双比特门（主要误差来源）。
- 上真机前先用带噪模拟器测试。
- 保存并复用已转译电路；变分算法监控收敛。
- shots 先少后多，定稿时再加大。

## 示例

贝尔态（本地 Sampler）：

```python
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler

qc = QuantumCircuit(2)
qc.h(0)           # 对 qubit 0 施加 Hadamard
qc.cx(0, 1)       # qubit 0 控制 qubit 1 的 CNOT
qc.measure_all()

sampler = StatevectorSampler()
result = sampler.run([qc], shots=1024).result()
counts = result[0].data.meas.get_counts()
print(counts)  # 约 {'00': 512, '11': 512}
```

真机执行（带转译）：

```python
from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2 as Sampler
from qiskit import transpile

service = QiskitRuntimeService()
backend = service.backend("ibm_brisbane")
qc_optimized = transpile(qc, backend=backend, optimization_level=3)

sampler = Sampler(backend)
job = sampler.run([qc_optimized], shots=1024)
result = job.result()
```

变分算法 VQE（Session + Estimator + SciPy）：

```python
from qiskit_ibm_runtime import Session, EstimatorV2 as Estimator
from scipy.optimize import minimize

with Session(backend=backend) as session:
    estimator = Estimator(session=session)

    def cost_function(params):
        bound_qc = ansatz.assign_parameters(params)
        qc_isa = transpile(bound_qc, backend=backend)
        result = estimator.run([(qc_isa, hamiltonian)]).result()
        return result[0].data.evs

    result = minimize(cost_function, initial_params, method='COBYLA')
```

## 注意事项

- V2 primitive 接口：`run` 入参是电路列表 `[qc]`，结果按 `result[0].data.<reg>.get_counts()` 取，测量寄存器默认名 `meas`（来自 `measure_all()`）。
- Estimator 入参是 `(circuit, observable)` 元组；期望值在 `result[0].data.evs`。
- 真机需配置 IBM Quantum 账号与 API token（`QiskitRuntimeService` 持久化）；提交前查后端队列与状态。
- 转译会改变比特映射与门序列，结果解读需对应转译后的测量寄存器。
- 参数化电路用 `assign_parameters` 绑定，适配变分算法。

## 互见

- first-principles-thinking：拆解量子算法/问题映射的底层原理。
- 官方文档：https://quantum.ibm.com/docs ；API：https://docs.quantum.ibm.com/api/qiskit ；Patterns：https://quantum.cloud.ibm.com/docs/en/guides/intro-to-patterns

---
本条采编自 K-Dense-AI/scientific-agent-skills（MIT）。
