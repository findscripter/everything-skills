---
name: cirq-quantum-circuits
title: Cirq 量子电路设计与仿真
description: 当用 Python 和 Cirq（Google Quantum AI 框架）设计、仿真或运行量子电路时使用；做电路构建、Simulator 仿真、参数扫描、噪声建模与硬件提交的可执行流程并产出测量直方图/态向量结果；不适用于 Qiskit/PennyLane 等其他框架或非量子计算任务；触发词：cirq、量子电路、量子仿真
domain: 领域/science
triggers: [cirq, 量子电路, 量子仿真, qubit, cirq.Simulator, cirq-google, cirq-ionq, 参数扫描 run_sweep, 量子门 Hadamard CNOT, 变分量子算法 VQE QAOA]
tags: [量子计算, cirq, 量子电路, 仿真, 噪声建模, Google-Quantum-AI, Python, misc]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Bash, Read, Write, Edit]
requires: []
related: [quantum-circuit-builder]
combines_with: [sympy-symbolic-math, matplotlib-visualization]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 需要用 Cirq（Google Quantum AI 的开源框架）在 Python 中设计、仿真或在真机上运行量子电路。
- 需要参数化电路、参数扫描，或对接 `cirq-google`、`cirq-ionq` 等硬件后端。
- 做量子工作流原型或教学，需要可运行的电路示例（Bell 态、GHZ、QFT、VQE/QAOA）。

不该用的边界：
- 任务用的是 Qiskit、PennyLane、Q# 等其他框架——本技能只覆盖 Cirq。
- 与量子计算无关的普通 Python/数值任务。
- 不要把本技能输出当作真机运行前的最终验证；硬件提交前必须先在仿真器上验证，并按目标设备约束校验。
- 缺少必要输入（如硬件凭证、目标设备、成功判据）时，先停下来澄清。

## 步骤

1. 安装：核心库 `uv pip install cirq`；按需装硬件后端 `cirq-google` / `cirq-ionq` / `cirq-aqt` / `cirq-pasqal` 或 `azure-quantum cirq`。
2. 建电路：选 qubit 类型（`LineQubit` / `GridQubit` / `NamedQubit`），用门和 `cirq.measure(..., key=...)` 组装 `cirq.Circuit`，给测量起描述性 key。
3. 仿真：纯态用 `cirq.Simulator()`（态向量，更高效）；含噪声/混合态才用 `cirq.DensityMatrixSimulator()`（代价 O(2^2n)）。用 `run(repetitions=...)` 采样，`simulate()` 取态向量。
4. 扫描参数：用 `sympy.Symbol` 定义符号参数，`cirq.Linspace` 生成 sweep，`run_sweep(params=sweep)` 批量跑，避免逐个 run。
5. 加噪声：`circuit.with_noise(cirq.depolarize(p=...))` 等，配密度矩阵仿真器分析。
6. 上真机前：用 transformer 优化深度，按设备 gateset 分解门，用校准数据选最优 qubit，再提交并立即保存昂贵的硬件结果。

## 指令

- 安装核心：`uv pip install cirq`
- 安装后端（示例）：`uv pip install cirq-google` / `uv pip install cirq-ionq`
- 查看设备连通性：`device.metadata.nx_graph`

## 示例

基础电路（Bell 态 + 采样）：

```python
import cirq
import numpy as np

q0, q1 = cirq.LineQubit.range(2)
circuit = cirq.Circuit(
    cirq.H(q0),
    cirq.CNOT(q0, q1),
    cirq.measure(q0, q1, key='result'),
)
print(circuit)

simulator = cirq.Simulator()
result = simulator.run(circuit, repetitions=1000)
print(result.histogram(key='result'))
```

参数化电路 + 参数扫描：

```python
import sympy
theta = sympy.Symbol('theta')
circuit = cirq.Circuit(cirq.ry(theta)(q0), cirq.measure(q0, key='m'))

sweep = cirq.Linspace('theta', start=0, stop=2*np.pi, length=20)
results = simulator.run_sweep(circuit, params=sweep, repetitions=1000)
for params, result in zip(sweep, results):
    print(f"θ={params['theta']:.2f}: {result.histogram(key='m')}")
```

变分算法模板（VQE 类）：

```python
import scipy.optimize

def variational_algorithm(ansatz, cost_function, initial_params):
    def objective(params):
        result = cirq.Simulator().simulate(ansatz(params))
        return cost_function(result)
    return scipy.optimize.minimize(objective, initial_params, method='COBYLA')
```

硬件提交（按 provider 分支）：

```python
def run_on_hardware(circuit, provider='google', device_name='weber', repetitions=1000):
    if provider == 'google':
        import cirq_google
        engine = cirq_google.get_engine()
        job = engine.get_processor(device_name).run(circuit, repetitions=repetitions)
        return job.results()[0]
    elif provider == 'ionq':
        import cirq_ionq
        return cirq_ionq.Service().run(circuit, repetitions=repetitions, target='qpu')
    raise ValueError(f"Unknown provider: {provider}")
```

噪声对比研究：

```python
def noise_comparison_study(circuit, noise_levels):
    out = {}
    for p in noise_levels:
        noisy = circuit.with_noise(cirq.depolarize(p=p))
        result = cirq.DensityMatrixSimulator().run(noisy, repetitions=1000)
        out[p] = result.histogram(key='result')
    return out

noise_comparison_study(circuit, [0.0, 0.001, 0.01, 0.05, 0.1])
```

## 注意事项

- 内存：态向量随 2^n、密度矩阵随 2^(2n) 增长；大系统先评估内存。内存吃紧时从密度矩阵切回态向量，或对 Clifford 电路用 stabilizer 仿真器。
- 电路过深无法上真机：用优化 transformer 降深度，并把门分解到设备原生 gateset。
- 设备校验报错：检查 `device.metadata.nx_graph` 连通性，按设备做门分解与编译。
- 噪声仿真太慢：密度矩阵 O(2^2n)，考虑减 qubit 或只对关键操作选择性加噪声。
- 实践原则：测量 key 用描述性命名；用参数扫描替代单次 run；真机前先在仿真器验证、用校准数据选 qubit、实现误差缓解；变换后务必校验正确性；昂贵硬件结果立即落盘。
- 官方资料：https://quantumai.google/cirq ；API 参考：https://quantumai.google/reference/python/cirq ；示例：https://github.com/quantumlib/Cirq/tree/master/examples ；ReCirq：https://github.com/quantumlib/ReCirq

## 互见

- 领域内其他量子计算/科学计算类技能。
- Cirq 官方 references（building / simulation / transformation / hardware / noise / experiments）覆盖电路构建、仿真、变换、硬件、噪声与实验的完整细节。

---

采编自 sickn33/antigravity-awesome-skills（注：源条目原始许可标注为 Apache-2.0；本次按任务要求记为 MIT，如有冲突以上游 LICENSE 为准）。
