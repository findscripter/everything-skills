---
name: mlops-model-productionizer
title: MLOps Model Productionizer
description: Productionize trained ML models and run MLOps: containerized deployment, feature stores, drift monitoring, RAG pipelines, and LLM API integration with retries and cost controls. Use for deploying models, building MLOps infrastructure (MLflow/Kubeflow/Kubernetes/Docker), monitorin
domain: 智能/model-ops
triggers: [model deployment, MLOps pipeline, feature store, model monitoring, drift detection, RAG system, LLM integration, model serving, A/B testing ML, automated retraining]
tags: [model-ops, mlops, llm, rag, model-deployment, drift-detection, model-monitoring, ai]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [huggingface-model-trainer, production-llm-app-builder, chief-ai-officer-advisor, scikit-learn-ml]
combines_with: [langfuse-llm-observability, llm-model-router, huggingface-hub-cli]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
Production ML engineering patterns for model deployment, MLOps infrastructure, LLM integration, RAG, and monitoring. Adapted from `alirezarezvani/claude-skills` (MIT). Focused on production and operational concerns rather than model research or initial training.

## When to use

- Deploy a trained model to production with monitoring, canary rollout, and rollback.
- Build an MLOps pipeline: feature store, experiment tracking, model registry, A/B testing, automated retraining.
- Integrate LLM APIs into production with retry logic, fallback, cost controls, and structured output validation.
- Build a retrieval-augmented generation (RAG) pipeline: vector DB selection, chunking, reranking.
- Monitor production models for latency, error rates, data drift, and prediction distribution shifts.

Do not use for: model research / algorithm exploration, first-time training and tuning, or pure offline experiments. This skill covers everything after a model is ready to ship.

## Steps

### Model Deployment Workflow

Validation target: p95 latency < 100ms, error rate < 0.1%.

1. Export model to a standardized format (ONNX, TorchScript, SavedModel).
2. Package model with dependencies in a Docker container.
3. Deploy to a staging environment.
4. Run integration tests against staging.
5. Deploy canary (5% traffic) to production.
6. Monitor latency and error rates for 1 hour.
7. Promote to full production if metrics pass; otherwise roll back.

### MLOps Pipeline Setup

1. Configure a feature store (Feast, Tecton) for training data.
2. Set up experiment tracking (MLflow, Weights & Biases) with hyperparameter logging.
3. Register the model in a model registry with version metadata.
4. Configure staging deployment triggered by registry events; set up A/B testing to compare new vs. old.
5. Enable drift monitoring with alerting; new models are automatically evaluated against the baseline.

### LLM Integration Workflow

1. Create a provider abstraction layer for vendor flexibility.
2. Implement retry with exponential backoff + fallback to a secondary provider.
3. Set up token counting and context truncation; add response caching for repeated queries.
4. Implement cost tracking per request; validate structured output with Pydantic.

### RAG System Implementation

1. Choose a vector database and embedding model based on quality/cost tradeoff.
2. Define a chunking strategy and build an ingestion pipeline with metadata extraction.
3. Embed the query, retrieve, and rerank; format context and send to the LLM.
4. Validation: response references retrieved context, no hallucinations.

### Model Monitoring

1. Track latency (p50, p95, p99) and configure error-rate alerting.
2. Detect input data drift and prediction distribution shifts; log ground truth when available for comparison.
3. Set up automated retraining triggers. Validation: alerts fire before user-visible degradation.

## Example

Scenario: ship a ranking model and monitor it.

1. Export to ONNX, build an image from the container template, deploy to staging, and run integration tests.
2. Canary at 5% traffic in production; watch p95 latency and error rate for 1 hour.
3. Attach KS/PSI drift monitoring: alert when PSI > 0.1, trigger evaluate-then-retrain when PSI > 0.2.
4. Promote to full production once metrics pass.

### Container Template

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

### Feature Store Pattern (Feast)

```python
from feast import Entity, Feature, FeatureView, FileSource

user = Entity(name="user_id", value_type=ValueType.INT64)

user_features = FeatureView(
    name="user_features",
    entities=["user_id"],
    ttl=timedelta(days=1),
    features=[
        Feature(name="purchase_count_30d", dtype=ValueType.INT64),
        Feature(name="avg_order_value", dtype=ValueType.FLOAT),
    ],
    online=True,
    source=FileSource(path="data/user_features.parquet"),
)
```

### LLM Provider Abstraction + Retry

```python
from abc import ABC, abstractmethod
from tenacity import retry, stop_after_attempt, wait_exponential

class LLMProvider(ABC):
    @abstractmethod
    def complete(self, prompt: str, **kwargs) -> str:
        pass

@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=10))
def call_llm_with_retry(provider: LLMProvider, prompt: str) -> str:
    return provider.complete(prompt)
```

### Drift Detection (KS test)

```python
from scipy.stats import ks_2samp

def detect_drift(reference, current, threshold=0.05):
    statistic, p_value = ks_2samp(reference, current)
    return {
        "drift_detected": p_value < threshold,
        "ks_statistic": statistic,
        "p_value": p_value
    }
```

### Companion Scripts (provided by the source repo)

```bash
python scripts/model_deployment_pipeline.py --model model.pkl --target staging
python scripts/rag_system_builder.py --config rag_config.yaml --analyze
python scripts/ml_monitoring_suite.py --config monitoring.yaml --deploy
```

## Notes

### Serving Options

| Option | Latency | Throughput | Use Case |
|--------|---------|------------|----------|
| FastAPI + Uvicorn | Low | Medium | REST APIs, small models |
| Triton Inference Server | Very Low | Very High | GPU inference, batching |
| TensorFlow Serving | Low | High | TensorFlow models |
| TorchServe | Low | High | PyTorch models |
| Ray Serve | Medium | High | Complex pipelines, multi-model |

### Retraining Triggers

| Trigger | Detection | Action |
|---------|-----------|--------|
| Scheduled | Cron (weekly/monthly) | Full retrain |
| Performance drop | Accuracy < threshold | Immediate retrain |
| Data drift | PSI > 0.2 | Evaluate, then retrain |
| New data volume | X new samples | Incremental update |

### Alert Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| p95 latency | > 100ms | > 200ms |
| Error rate | > 0.1% | > 1% |
| PSI (drift) | > 0.1 | > 0.2 |
| Accuracy drop | > 2% | > 5% |

### Vector Database Selection

| Database | Hosting | Scale | Latency | Best For |
|----------|---------|-------|---------|----------|
| Pinecone | Managed | High | Low | Production, managed |
| Qdrant | Both | High | Very Low | Performance-critical |
| Weaviate | Both | High | Low | Hybrid search |
| Chroma | Self-hosted | Medium | Low | Prototyping |
| pgvector | Self-hosted | Medium | Medium | Existing Postgres |

### Chunking Strategies

| Strategy | Chunk Size | Overlap | Best For |
|----------|------------|---------|----------|
| Fixed | 500-1000 tokens | 50-100 | General text |
| Sentence | 3-5 sentences | 1 sentence | Structured text |
| Semantic | Variable | Based on meaning | Research papers |
| Recursive | Hierarchical | Parent-child | Long documents |

- LLM cost varies widely by model (e.g., Haiku-tier is far cheaper than Opus/GPT-4). Track cost per request, set a budget cap, and cache repeated queries.

## See also

- Source reference docs (in the source repo `references/`): `mlops_production_patterns.md` (Kubernetes deployment, Feast, A/B testing, MLflow retraining), `llm_integration_guide.md` (fallback strategies, tiktoken token optimization, cost calculation), `rag_system_architecture.md` (vector DB comparison, chunking, reranking).
- Tech stack: PyTorch / TensorFlow / Scikit-learn / XGBoost; LangChain / LlamaIndex / DSPy; MLflow / Weights & Biases / Kubeflow; Spark / Airflow / dbt / Kafka; Docker / Kubernetes / Triton; PostgreSQL / BigQuery / Pinecone / Redis.
- Related skills: huggingface-model-trainer, production-llm-app-builder, chief-ai-officer-advisor, scikit-learn-ml. Combines with: langfuse-llm-observability, llm-model-router, huggingface-hub-cli.
