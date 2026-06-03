---
name: pennylane-quantum-ml
title: PennyLane 量子机器学习
description: 当用 PennyLane 训练含参量子电路、搭建混合量子-经典模型，或需要跨 IBM/Google/Rigetti/IonQ 硬件可移植时使用；做电路构建、自动微分梯度训练、VQE/QAOA 变分算法与 PyTorch/JAX/TF 集成的可执行流程并产出优化后参数/期望值/基态能量；不适用于 Qiskit/Cirq 等其他框架或开放量子系统建模（用 qutip）；触发词：pennylane、qml、量子机器学习、变分量子算法、VQE
domain: 领域/science
triggers: [pennylane, qml, 量子机器学习, QNode qnode, 变分量子算法 VQE QAOA, 量子神经网络, parameter-shift 参数移位, qml.device default.qubit, AngleEmbedding 数据编码, qchem 分子哈密顿量, 混合量子经典模型]
tags: [量子计算, 量子机器学习, pennylane, 自动微分, vqe, 变分量子算法, python, pytorch-jax-tensorflow, misc]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Bash, Read, Write, Edit]
requires: []
related: [quantum-circuit-builder, cirq-quantum-circuits, qutip-open-quantum-systems]
combines_with: [pymoo-multiobjective-optimization, scikit-learn-ml]
license: MIT
source: K-Dense-AI/scientific-agent-skills
source_license: MIT
---
# PennyLane 量子机器学习

## 何时使用

- 需要把量子电路当神经网络训练：用自动微分对含参电路求梯度并优化参数。
- 搭建混合量子-经典模型（量子神经网络、变分分类器），与 PyTorch / JAX / TensorFlow 反向传播集成。
- 跑变分算法（VQE 求分子基态、QAOA 组合优化），或需要跨 IBM/Google/Rigetti/IonQ 硬件后端可移植的统一电路代码。

不该用的边界：
- 任务用的是 Qiskit、Cirq、Q# 等其他框架——本技能只覆盖 PennyLane。硬件专属深度优化用 qiskit（IBM）或 cirq（Google）。
- 开放量子系统 / 主方程演化建模——用 qutip，不在本技能范围。
- 与量子计算无关的普通数值/ML 任务。
- 缺少硬件凭证、目标设备、成功判据等关键输入时，先停下来澄清，不要直接提交真机。

## 步骤

1. 安装核心：`uv pip install pennylane`；按需装硬件插件（IBM `pennylane-qiskit`、Braket `amazon-braket-pennylane-plugin`、Cirq `pennylane-cirq`、Rigetti `pennylane-rigetti`、IonQ `pennylane-ionq`）。
2. 建设备：`qml.device('default.qubit', wires=n)`。先用模拟器（`default.qubit`，`lightning.qubit` 更快）验证，再切硬件。设备对象复用，减少初始化开销。
3. 定义 QNode：用 `@qml.qnode(dev)` 装饰电路函数，函数体放门（`qml.RX`/`qml.CNOT`…）+ 返回测量（`qml.expval` / `qml.probs` / `qml.sample`）。
4. 选数据编码：按问题结构选 `AngleEmbedding` / `AmplitudeEmbedding` / `BasisEmbedding` / IQP 等。
5. 选优化器与梯度：模拟器上可用 backprop；**真机必须用 parameter-shift**（或 adjoint）。优化器选 `qml.AdamOptimizer` / `qml.GradientDescentOptimizer` 等。
6. 训练循环：`params = opt.step(cost, params)` 或 `opt.step_and_cost(cost, params)`（同时拿到 loss）。参数用 `requires_grad=True` 的 `pennylane.numpy` 数组。
7. 切硬件：同一电路换 `qml.device('qiskit.ibmq', wires=..., backend=...)` 即可移植，提交前在模拟器验证、用 `qml.specs()` 分析电路复杂度。

## 指令

- 安装核心：`uv pip install pennylane`
- 安装硬件插件（示例）：`uv pip install pennylane-qiskit` / `uv pip install pennylane-ionq`
- 分析电路规格：`qml.specs(circuit)(params)`

## 示例

最小训练循环（构电路 + 梯度下降）：

```python
import pennylane as qml
from pennylane import numpy as np

dev = qml.device('default.qubit', wires=2)

@qml.qnode(dev)
def circuit(params):
    qml.RX(params[0], wires=0)
    qml.RY(params[1], wires=1)
    qml.CNOT(wires=[0, 1])
    return qml.expval(qml.PauliZ(0))

opt = qml.GradientDescentOptimizer(stepsize=0.1)
params = np.array([0.1, 0.2], requires_grad=True)
for i in range(100):
    params = opt.step(circuit, params)
```

变分分类器（数据编码 + 纠缠层）：

```python
@qml.qnode(dev)
def classifier(x, weights):
    qml.AngleEmbedding(x, wires=range(4))
    qml.StronglyEntanglingLayers(weights, wires=range(4))
    return qml.expval(qml.PauliZ(0))

opt = qml.AdamOptimizer(stepsize=0.01)
weights = np.random.random((3, 4, 3))  # 3 层, 4 wires
for epoch in range(100):
    for x, y in zip(X_train, y_train):
        weights = opt.step(lambda w: (classifier(x, w) - y) ** 2, weights)
```

VQE 求 H2 基态能量：

```python
from pennylane import qchem

symbols = ['H', 'H']
coords = np.array([0.0, 0.0, 0.0, 0.0, 0.0, 0.74])
H, n_qubits = qchem.molecular_hamiltonian(symbols, coords)

@qml.qnode(dev)
def vqe_circuit(params):
    qml.BasisState(qchem.hf_state(2, n_qubits), wires=range(n_qubits))
    qml.UCCSD(params, wires=range(n_qubits))
    return qml.expval(H)

opt = qml.AdamOptimizer(stepsize=0.1)
params = np.zeros(10, requires_grad=True)
for i in range(100):
    params, energy = opt.step_and_cost(vqe_circuit, params)
    print(f"Step {i}: Energy = {energy:.6f} Ha")
```

同电路切换后端（模拟器 → 真机）：

```python
dev_sim = qml.device('default.qubit', wires=4)        # 先验证
dev_hw = qml.device('qiskit.ibmq', wires=4, backend='ibmq_manila')  # 再上真机
```

## 注意事项

- **梯度方法看后端**：backprop 只在模拟器可用；真机用 parameter-shift（或 adjoint），否则会报错或回退。
- **避免贫瘠高原（barren plateaus）**：用小随机值初始化参数；深电路监控梯度是否消失。
- **数据编码匹配问题结构**：编码方式直接影响表达力与可训练性。
- **先模拟后硬件**：始终在 `default.qubit` 上验证电路与训练流程，再提交真机；昂贵的硬件结果立即落盘。
- **性能**：复用设备对象；性能关键路径考虑 Catalyst JIT 编译；大系统注意态向量随 2^n 增长的内存开销。
- **电路体检**：用 `qml.specs()` 分析门数/深度/可训练参数，提前发现过深电路。
- 官方资料：文档 https://docs.pennylane.ai ；Codebook 教程 https://pennylane.ai/codebook ；QML 演示 https://pennylane.ai/qml/demonstrations ；GitHub https://github.com/PennyLaneAI/pennylane

## 互见

- related：`cirq-quantum-circuits` —— Google Cirq 量子电路框架，横向对照另一套量子编程栈。
- related：`quantum-circuit-builder` —— 通用量子电路构建，框架无关的电路设计思路。
- combines_with：`sympy-symbolic-math` —— 符号参数定义与解析推导，配合参数化电路与梯度公式分析。

---

采编自 K-Dense-AI/scientific-agent-skills（MIT）。注：上游源条目 SKILL.md 原始许可标注为 Apache-2.0；本次按任务要求记为 MIT，如有冲突以上游 LICENSE 为准。
