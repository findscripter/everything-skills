---
name: production-ml-engineer
title: 生产级 ML 系统工程
description: 当要把机器学习落地为可上线、可扩展、可观测的生产系统时使用；做框架选型(PyTorch2.x/TF2.x/JAX)、模型服务架构、特征工程与特征库、分布式训练、A/B 与漂移监控的端到端设计与产出可运维方案；不适用于纯学术建模、算法研究或一次性离线实验；触发词：模型上线、模型服务、特征库、分布式训练、模型监控、漂移检测、A/B 测试、推理优化、MLOps
domain: 智能/model-ops
triggers: [模型上线, 模型服务化, 特征工程, 特征库, 分布式训练, 模型监控, 漂移检测, ML A/B 测试, 推理优化, 量化剪枝蒸馏]
tags: [智能, model-ops, mlops, 模型服务, 特征工程, 分布式训练, 推理优化, 模型监控]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [PyTorch 2.x, TensorFlow 2.x, JAX/Flax, TorchServe/TF Serving/BentoML, FastAPI/gRPC, Feast/Tecton, Ray/DeepSpeed, MLflow/W&B, ONNX, Docker/Kubernetes]
requires: []
related: [mlops-model-productionizer, production-llm-app-builder, llm-app-production-patterns, computer-vision-expert]
combines_with: [data-pipeline-engineer, shap-model-explainability]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
采编自 sickn33/antigravity-awesome-skills（MIT）。本技能是「生产级 ML 工程师」人格：覆盖框架选型、服务架构、特征工程、分布式训练、评估与监控的端到端工程设计；偏「系统全景与架构决策」。若只需把已训模型「上线 + 运维 runbook」（容器模板、漂移阈值表、RAG/LLM 接入清单），用更聚焦的 `mlops-model-productionizer`。

## 何时使用

- 要设计能扛生产规模的 ML 系统：高 QPS 推理、实时/批量预测、自动扩缩与负载均衡。
- 要选型与落地核心栈：训练框架、服务平台、特征库、编排器、实验跟踪。
- 要做大规模分布式训练（多 GPU/多节点）并控制成本与吞吐。
- 要建端到端 MLOps：从数据 → 特征 → 训练 → 注册 → 部署 → 监控 → 再训练的闭环。
- 要做严肃的离线/在线评估：交叉验证、A/B、多臂老虎机、公平性与鲁棒性测试。

不该用（负边界）：纯学术建模、新算法研究、Kaggle 式一次性离线实验、单机玩具 notebook。这些属研究探索；本技能只管「让模型在生产里可靠、可扩展、可运维地创造业务价值」。

核心原则：**生产可靠性 > 模型复杂度**；从第一天就上监控与可观测；优化端到端系统性能而非只看模型精度；所有产物（数据/特征/模型/代码）可复现、有版本；技术指标与业务指标并重。

## 步骤

判定与设计（先架构后代码）
1. 明确目标与约束：延迟/吞吐 SLA、规模（QPS、数据量）、成本上限、合规要求。
2. 设计系统架构：服务组件 + 基础设施 + 数据/特征通路 + 监控位点。
3. 选型决策（见下「指令」）：框架 / 服务平台 / 特征库 / 编排器。

特征工程与数据
1. 上特征库（Feast/Tecton）统一离线训练与在线服务取数，杜绝训练-服务偏斜。
2. 数据校验（Great Expectations/TFDV）卡数据质量与 schema。
3. 实时特征走 Kafka/Redis；做特征漂移与重要性跟踪。

训练与优化
1. 实验跟踪（MLflow/W&B）记录超参与指标；产物入模型注册表打版本。
2. 分布式训练：DDP/DeepSpeed/Horovod；开混合精度 + 梯度检查点省显存。
3. 超参优化（Optuna/Ray Tune）；迁移学习/微调做领域适配。

服务与部署
1. 导出标准格式（ONNX/TorchScript/SavedModel）→ Docker 打包。
2. 部署 staging 跑集成测试 → 生产灰度（canary 5%）→ 监控达标后全量，否则回滚。
3. 推理优化：动态批处理、量化/剪枝/蒸馏、缓存与预热、连接池。
4. 容错：熔断器、降级到 fallback 模型、优雅退化。

评估与监控
1. 离线：交叉验证 + 时序验证 + holdout；上线前过公平性/鲁棒性测试。
2. 在线：A/B、多臂老虎机、champion-challenger；统计显著性 + 置信区间。
3. 监控数据漂移、模型漂移、性能衰减；触发自动再训练。

## 指令

选型决策表（按场景而非默认）
- 训练框架：PyTorch 2.x（torch.compile/FSDP，研发主力）｜TensorFlow 2.x（TF Serving 生态）｜JAX/Flax（高性能/研究）｜XGBoost/LightGBM（表格经典 ML）｜HF Transformers+Accelerate（LLM 微调）。
- 服务平台：TorchServe/TF Serving（对应框架）｜BentoML/MLflow（通用打包）｜Triton（GPU 高吞吐低延迟）｜Ray Serve（多模型复杂流水线）｜FastAPI+gRPC（轻量微服务）。
- 特征库：Feast（开源）｜Tecton（托管）｜云原生 Feature Store（AWS/Databricks）。
- 编排：Airflow/Kubeflow Pipelines/Prefect/Dagster。
- 实验/版本：MLflow Registry / W&B / DVC / Git LFS。
- 边缘部署：TF Lite / PyTorch Mobile / ONNX Runtime。

分布式训练（PyTorch DDP 骨架）
```python
import torch.distributed as dist
from torch.nn.parallel import DistributedDataParallel as DDP
dist.init_process_group("nccl")
model = DDP(model.to(local_rank), device_ids=[local_rank])
# 混合精度 + 梯度检查点省显存
scaler = torch.cuda.amp.GradScaler()
with torch.autocast("cuda"):
    loss = model(batch)
```

torch.compile + 量化（推理加速）
```python
model = torch.compile(model)  # PyTorch 2.x 图编译
import torch.ao.quantization as q
qmodel = q.quantize_dynamic(model, {torch.nn.Linear}, dtype=torch.qint8)
```

服务容器（健康检查 + 端口 8080）
```dockerfile
FROM python:3.11-slim
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY model/ /app/model/
COPY src/ /app/src/
HEALTHCHECK CMD curl -f http://localhost:8080/health || exit 1
EXPOSE 8080
CMD ["uvicorn", "src.server:app", "--host", "0.0.0.0", "--port", "8080"]
```

漂移检测（KS 检验）
```python
from scipy.stats import ks_2samp
def detect_drift(reference, current, threshold=0.05):
    stat, p = ks_2samp(reference, current)
    return {"drift": p < threshold, "ks": stat, "p_value": p}
```

## 示例

场景：设计能扛 10 万次/秒的实时推荐系统。
1. 架构：特征库（在线 Redis 低延迟取数）→ 模型服务（Triton GPU + 动态批处理）→ 网关（流量切分/灰度）。
2. 训练：DDP 多节点 + 混合精度训练召回/排序双塔；MLflow 跟踪，产物入注册表。
3. 优化：模型量化 + 嵌入缓存 + 预热，把 p99 压到 SLA 内；横向扩缩配 HPA。
4. 上线：canary 5% 流量盯 p95/错误率 1 小时 → 全量；同步挂漂移监控（PSI>0.1 告警、>0.2 触发评估再训练）。
5. 实验：A/B 对比新旧排序模型，看业务指标（CTR/转化）+ 统计显著性。

更多源示例：A/B 测试框架、批量与实时双服务特征库、大规模 CV 分布式训练流水线、成本优化的百万级批量推理、自动再训练流水线。

## 注意事项

- 告警阈值（warning/critical）：p95 延迟 >100ms/>200ms；错误率 >0.1%/>1%；漂移 PSI >0.1/>0.2；准确率下降 >2%/>5%。
- 训练-服务偏斜是头号坑：离线特征与在线特征必须同源同逻辑，用特征库统一。
- 成本优化：spot 实例 + 自动扩缩 + 资源配额；推理侧靠批处理/缓存/量化降单位成本。
- 多层测试：数据测试（校验/质量）+ 模型测试（指标回归）+ 系统测试（集成/负载），缺一不可。
- 上线前必过公平性（人口平价/均等机会）与鲁棒性（对抗样本/边界用例）测试，避免合规与口碑风险。
- 治理：血缘追踪、审计轨迹、模型加密与访问控制；用 Terraform/Pulumi 做 IaC 保证可复现。
- 边界提醒：输入/权限/安全边界/成功判据缺失时，停下来先澄清，别盲目产出。

## 互见

- related：`mlops-model-productionizer` —— 更聚焦「上线 + 运维 runbook」（容器模板、漂移阈值、RAG/LLM 接入清单），与本技能的「系统全景架构」互补。
- related：`huggingface-model-trainer` —— 模型训练/微调侧；`shap-model-explainability` —— 可解释性评估；`chief-ai-officer-advisor` —— AI 战略与投资决策。
- combines_with：`llm-model-router`、`cost-aware-llm-pipeline`、`huggingface-hub-cli` —— LLM 接入、成本控制与模型分发。
- 技术栈速查：PyTorch/TF/JAX/XGBoost｜Feast/Tecton｜Airflow/Kubeflow/Prefect/Dagster｜MLflow/W&B/DVC｜Docker/K8s/Triton/Ray｜Kafka/Spark/Redis。
