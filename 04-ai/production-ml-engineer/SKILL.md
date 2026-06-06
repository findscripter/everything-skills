---
name: production-ml-engineer
title: Production ML Engineering
description: Use to take ML from model to a deployable, scalable, observable production system: framework selection (PyTorch 2.x/TF2.x/JAX), serving architecture, feature stores, distributed training, A/B testing and drift monitoring; not for pure research or one-off offline experiments. Trig
domain: 智能/model-ops
triggers: [model deployment, model serving, feature engineering, feature store, distributed training, model monitoring, drift detection, ML A/B testing, inference optimization, quantization pruning distillation]
tags: [ai, model-ops, mlops, model-serving, feature-engineering, distributed-training, inference-optimization, model-monitoring]
level: advanced
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [mlops-model-productionizer, production-llm-app-builder, llm-app-production-patterns, computer-vision-expert]
combines_with: [data-pipeline-engineer, shap-model-explainability]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
Adapted from sickn33/antigravity-awesome-skills (`ml-engineer`, MIT). This is the "production ML engineer" persona: end-to-end engineering design across framework selection, serving architecture, feature engineering, distributed training, evaluation, and monitoring. It leans toward system-wide panorama and architectural decisions. If you only need to "deploy + operate" an already-trained model (container templates, drift threshold tables, RAG/LLM integration checklists), use the more focused `mlops-model-productionizer`.

Core principle: **production reliability > model complexity**. Bring up monitoring and observability from day one; optimize end-to-end system performance, not just model accuracy; keep all artifacts (data/features/model/code) reproducible and versioned; weigh business metrics alongside technical metrics.

## When to use

- Designing ML systems that withstand production scale: high-QPS inference, real-time/batch prediction, auto-scaling, and load balancing.
- Selecting and landing the core stack: training framework, serving platform, feature store, orchestrator, experiment tracking.
- Running large-scale distributed training (multi-GPU / multi-node) while controlling cost and throughput.
- Building end-to-end MLOps: the closed loop from data → features → training → registry → deployment → monitoring → retraining.
- Doing serious offline/online evaluation: cross-validation, A/B tests, multi-armed bandits, fairness and robustness testing.

Do not use (negative boundary): pure academic modeling, novel algorithm research, Kaggle-style one-off offline experiments, single-machine toy notebooks. Those are research/exploration; this skill is only about making models reliably, scalably, and operably deliver business value in production.

## Steps

Decision and design (architecture before code)
1. Pin down goals and constraints: latency/throughput SLA, scale (QPS, data volume), cost ceiling, compliance requirements.
2. Design the system architecture: serving components + infrastructure + data/feature path + monitoring points.
3. Selection decisions (see decision table below): framework / serving platform / feature store / orchestrator.

Feature engineering and data
1. Stand up a feature store (Feast/Tecton) to unify offline-training and online-serving feature fetches, eliminating training–serving skew.
2. Data validation (Great Expectations / TFDV) gates data quality and schema.
3. Real-time features go through Kafka/Redis; track feature drift and importance.

Training and optimization
1. Experiment tracking (MLflow/W&B) records hyperparameters and metrics; artifacts go into the model registry with versions.
2. Distributed training: DDP/DeepSpeed/Horovod; enable mixed precision + gradient checkpointing to save memory.
3. Hyperparameter optimization (Optuna/Ray Tune); transfer learning / fine-tuning for domain adaptation.

Serving and deployment
1. Export a standard format (ONNX/TorchScript/SavedModel) → package into Docker.
2. Deploy to staging and run integration tests → canary in production (5%) → ramp to full traffic once metrics hold, otherwise roll back.
3. Inference optimization: dynamic batching, quantization/pruning/distillation, caching and warm-up, connection pooling.
4. Fault tolerance: circuit breakers, fallback to a degraded model, graceful degradation.

Evaluation and monitoring
1. Offline: cross-validation + temporal validation + holdout; pass fairness/robustness tests before launch.
2. Online: A/B tests, multi-armed bandits, champion-challenger; statistical significance + confidence intervals.
3. Monitor data drift, model drift, and performance decay; trigger automated retraining.

### Selection decision table (by scenario, not by default)
- Training framework: PyTorch 2.x (torch.compile/FSDP, primary R&D) | TensorFlow 2.x (TF Serving ecosystem) | JAX/Flax (high-performance/research) | XGBoost/LightGBM (classical tabular ML) | HF Transformers+Accelerate (LLM fine-tuning).
- Serving platform: TorchServe/TF Serving (matching framework) | BentoML/MLflow (general packaging) | Triton (GPU high-throughput, low-latency) | Ray Serve (multi-model complex pipelines) | FastAPI+gRPC (lightweight microservices).
- Feature store: Feast (open source) | Tecton (managed) | cloud-native Feature Store (AWS/Databricks).
- Orchestration: Airflow / Kubeflow Pipelines / Prefect / Dagster.
- Experiment/versioning: MLflow Registry / W&B / DVC / Git LFS.
- Edge deployment: TF Lite / PyTorch Mobile / ONNX Runtime.

## Example

Scenario: design a real-time recommendation system that handles 100K predictions/sec.
1. Architecture: feature store (online Redis low-latency fetch) → model serving (Triton GPU + dynamic batching) → gateway (traffic splitting / canary).
2. Training: multi-node DDP + mixed precision to train recall/ranking two-tower models; track with MLflow, push artifacts to the registry.
3. Optimization: model quantization + embedding cache + warm-up to push p99 within SLA; horizontal scaling via HPA.
4. Launch: canary 5% traffic watching p95/error rate for 1 hour → full rollout; attach drift monitoring (alert at PSI>0.1, trigger evaluation/retraining at >0.2).
5. Experiment: A/B test new vs. old ranking model on business metrics (CTR/conversion) + statistical significance.

Distributed training (PyTorch DDP skeleton)
```python
import torch.distributed as dist
from torch.nn.parallel import DistributedDataParallel as DDP
dist.init_process_group("nccl")
model = DDP(model.to(local_rank), device_ids=[local_rank])
# mixed precision + gradient checkpointing to save memory
scaler = torch.cuda.amp.GradScaler()
with torch.autocast("cuda"):
    loss = model(batch)
```

torch.compile + quantization (inference speedup)
```python
model = torch.compile(model)  # PyTorch 2.x graph compilation
import torch.ao.quantization as q
qmodel = q.quantize_dynamic(model, {torch.nn.Linear}, dtype=torch.qint8)
```

Serving container (health check + port 8080)
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

Drift detection (KS test)
```python
from scipy.stats import ks_2samp
def detect_drift(reference, current, threshold=0.05):
    stat, p = ks_2samp(reference, current)
    return {"drift": p < threshold, "ks": stat, "p_value": p}
```

More source examples: A/B testing framework; feature store serving both batch and real-time predictions; large-scale CV distributed training pipeline; cost-optimized batch inference over millions of records; automated retraining pipeline.

## Notes

- Alert thresholds (warning/critical): p95 latency >100ms/>200ms; error rate >0.1%/>1%; drift PSI >0.1/>0.2; accuracy drop >2%/>5%.
- Training–serving skew is the #1 pitfall: offline and online features must share the same source and logic — unify them through a feature store.
- Cost optimization: spot instances + auto-scaling + resource quotas; on the inference side, drive down unit cost via batching/caching/quantization.
- Multi-layer testing: data tests (validation/quality) + model tests (metric regression) + system tests (integration/load) — none can be skipped.
- Before launch, always pass fairness (demographic parity / equalized odds) and robustness (adversarial examples / edge cases) tests to avoid compliance and reputation risk.
- Governance: lineage tracking, audit trails, model encryption and access control; use Terraform/Pulumi for IaC to guarantee reproducibility.
- Boundary reminder: when inputs, permissions, safety boundaries, or success criteria are missing, stop and clarify first — do not produce output blindly.

## See also

- related: `mlops-model-productionizer` — more focused on "deploy + operate runbook" (container templates, drift thresholds, RAG/LLM integration checklists); complements this skill's "system-wide architecture" view.
- related: `huggingface-model-trainer` — model training/fine-tuning side; `shap-model-explainability` — interpretability evaluation; `chief-ai-officer-advisor` — AI strategy and investment decisions.
- combines_with: `data-pipeline-engineer`, `shap-model-explainability` — ML-ready data pipelines and explainability.
- Stack cheat sheet: PyTorch/TF/JAX/XGBoost | Feast/Tecton | Airflow/Kubeflow/Prefect/Dagster | MLflow/W&B/DVC | Docker/K8s/Triton/Ray | Kafka/Spark/Redis.
