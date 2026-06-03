---
name: computer-vision-expert
title: 计算机视觉 YOLO/SAM/VLM 专家
description: 当需要设计/实现/优化前沿计算机视觉流水线时使用；做实时检测（YOLO26）、可提示分割（SAM 3）、视觉语言理解（VLM）、深度/3D 重建与边缘部署的方案与代码产出；不适用于通用图像编辑、纯标注外包或非视觉的 ML 任务。触发词：YOLO、SAM、VLM、目标检测、语义分割、深度估计、ONNX、TensorRT、边缘部署
domain: 智能/model-ops
triggers: [计算机视觉, 目标检测, YOLO, YOLO26, SAM, Segment Anything, 语义分割, 实例分割, 可提示分割, 文本分割, VLM, 视觉语言模型, 视觉问答, VQA, 视觉定位, 深度估计, Depth Anything, 3D 重建, 单目深度, 相机标定, 视觉 SLAM, ONNX, TensorRT, 边缘部署, NPU, 实时检测, 小目标检测]
tags: [智能, misc, 计算机视觉, 目标检测, 图像分割, 视觉语言模型, 深度估计, 3d重建, 边缘部署, 模型优化, yolo, sam, vlm]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [ultralytics(YOLO26), SAM 3 / SAM 3D, Florence-2 / PaliGemma 2 / Qwen2-VL, Depth Anything V2, ONNX Runtime, TensorRT, OpenCV]
requires: []
related: [transformers-js, huggingface-hub-cli, scikit-learn-ml, local-llm-inference]
combines_with: [huggingface-model-trainer, mlops-model-productionizer, computer-use-agents]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
> 角色：前沿视觉系统架构师与空间智能专家（SOTA 2026）。目标：设计、实现并优化端到端计算机视觉流水线——从 YOLO26 实时检测到 SAM 3 基础模型分割，再到 VLM 视觉推理与 3D 重建。

## 何时使用

适用：
- 设计高性能**实时目标检测**系统（YOLO26）。
- 实现**零样本 / 文本引导分割**（SAM 3 文本到掩码）。
- 构建**空间感知、深度估计或 3D 重建**系统。
- 将视觉模型**优化部署到边缘设备**（ONNX、TensorRT、NPU）。
- 需要把**经典几何（标定/SLAM）**与现代深度学习桥接起来。

不该用（负边界）：
- 通用图像后期/美化、纯素材抠图等非工程化需求。
- 仅需人工标注或数据外包，没有建模/部署诉求。
- 与视觉无关的 NLP、表格、推荐等 ML 任务。
- 把本技能输出当作免验证的最终结论——仍需针对具体环境做测试与专家复核。

## 步骤

1. **明确任务与约束**：确定是检测/分割/VQA/深度/3D 中的哪类；记录目标硬件（GPU/NPU/TPU）、延迟与精度预算。缺少输入、权限、安全边界或成功标准时，先停下来澄清。
2. **选型**：
   - 实时检测 → YOLO26（NMS-Free 端到端，小目标用 ProgLoss + STAL）。
   - 文本/零样本分割 → SAM 3（文本到掩码），3D 重建场景/人体 → SAM 3D。
   - 语义理解/VQA → Florence-2、PaliGemma 2、Qwen2-VL 等 VLM。
   - 单目深度 → Depth Anything V2；多相机精密标定 → Chessboard/Charuco 亚像素流水线；实时定位建图 → Visual SLAM。
3. **组合流水线**：必要时级联——YOLO26 快速出候选框 → SAM 3 精修掩码；或深度图 + 单应性几何拼出 2.5D/3D。
4. **训练/微调**：自定义数据集用 MuSGD 优化器加速收敛。
5. **导出与部署**：用 YOLO26 简化的 NMS-Free ONNX/TensorRT 导出；显存紧张时对 SAM 3 用量化/蒸馏版本本地推理。
6. **验证**：在目标硬件上实测延迟与精度，再上线。

## 指令

```python
# 1) YOLO26 实时检测（NMS-Free，端到端）
from ultralytics import YOLO
model = YOLO("yolo26.pt")
results = model.predict("scene.jpg")          # 无需手动 NMS 后处理

# 训练时用 MuSGD 加速收敛
model.train(data="custom.yaml", optimizer="MuSGD", epochs=100)

# 导出为简化 ONNX / TensorRT（NMS-Free）
model.export(format="onnx")                    # 或 format="engine" (TensorRT)
```

```python
# 2) SAM 3 文本到掩码（无需逐点点击）
masks = sam3.segment(image, text="右侧的蓝色集装箱")   # 描述越具体越好

# 3) YOLO26 候选 + SAM 3 精修 的级联范式
boxes = model.predict(image)                   # 快速候选
refined = sam3.refine(image, boxes=boxes)      # 精确掩码
```

```python
# 4) Depth Anything V2 单目深度
depth = depth_anything_v2.infer(image)         # 用于空间感知 / 2.5D 重建
```

## 示例

工业巡检流水线（文本引导，免为每种变体训练专用检测器）：
1. SAM 3 用文本 `"the 5mm bolt"` 直接分割目标零件（避免歧义，提示要描述性）。
2. YOLO26 出快速候选，SAM 3 做掩码精修。
3. Depth Anything V2 + 单应性，把检测结果投影到 2.5D/3D 场景，得到空间位姿。
4. YOLO26 导出 NMS-Free TensorRT engine，部署到产线 NPU。

## 注意事项

设计原则：
- **优先 NMS-Free 架构**（YOLO26 / v10+），降低后处理开销；不要再手写 NMS。
- **文本接地优先**：SAM 3 多数场景已无需手动点提示，别只用点击式分割。
- **部署优先设计**：用 YOLO26 简化模块带来的 ONNX/TensorRT 导出，别用过时的 DFL 导出流水线。

2026 已知坑（Issue | 严重度 | 解法）：
- SAM 3 显存占用 | 中 | 本地 GPU 用量化/蒸馏版本。
- 文本歧义 | 低 | 用描述性提示（`"the 5mm bolt"` 而非 `"bolt"`）。
- 运动模糊 | 中 | 优化快门速度，或用 SAM 3 的时序跟踪一致性。
- 硬件兼容性 | 低 | YOLO26 简化架构对 NPU/TPU 高度兼容。

边界提醒：仅在任务明确落在上述范围时使用；输出不能替代针对具体环境的验证、测试与专家复核。

## 互见

相关技能：`ai-engineer`（AI 工程）、`robotics-expert`（机器人）、`research-engineer`（研究工程）、`embedded-systems`（嵌入式系统）。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
