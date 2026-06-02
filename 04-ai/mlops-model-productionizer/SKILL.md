---
name: mlops-model-productionizer
title: 机器学习模型生产化与 MLOps
description: 当需把训练好的模型部署上线、搭建 MLOps 流水线、接入 LLM/RAG 或监控线上模型漂移时使用；产出容器化部署方案、特征库/实验跟踪/再训练触发、provider 抽象与重试、向量库选型及漂移告警阈值；不适用于模型研究、初始训练与算法调参；触发词：模型部署、MLOps、特征库、漂移检测、RAG、LLM 接入、模型监控、A/B 测试、自动再训练
domain: 智能/model-ops
triggers: [模型部署, MLOps 流水线, 特征库, 模型监控, 漂移检测, RAG 系统, LLM 接入, 模型服务化, ML A/B 测试, 自动再训练]
tags: [智能, model-ops, mlops, 模型部署, llm, rag, 模型监控, 漂移检测]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Docker, Kubernetes, MLflow, Feast, FastAPI/Uvicorn, Triton, 向量数据库(Pinecone/Qdrant/Weaviate), tenacity, scipy]
requires: []
related: [huggingface-model-trainer, production-llm-app-builder, chief-ai-officer-advisor, scikit-learn-ml]
combines_with: [langfuse-llm-observability, llm-model-router, huggingface-hub-cli]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
采编自 alirezarezvani/claude-skills（MIT）。聚焦生产与运维侧，不覆盖模型研究与初始训练。

## 何时使用

- 要把已训练模型部署到生产，并带监控、灰度与回滚。
- 要搭建 MLOps 流水线：特征库、实验跟踪、模型注册、A/B、自动再训练。
- 要把 LLM API 接入生产，需要重试、降级、成本与结构化输出校验。
- 要构建 RAG 检索增强流水线（向量库选型、分块、重排）。
- 要监控线上模型的延迟、错误率、数据漂移与预测分布偏移。

不该用：模型研究/算法探索、首次训练与调参、纯离线实验。这些属于建模研究范畴，本技能只管「上线之后」的工程与运维。

## 步骤

部署上线（核心校验：p95 延迟 < 100ms，错误率 < 0.1%）
1. 导出为标准格式（ONNX / TorchScript / SavedModel）。
2. 用 Docker 连同依赖打包。
3. 部署到 staging，跑集成测试。
4. 生产灰度（5% 流量），监控延迟与错误率 1 小时。
5. 指标达标后全量；否则回滚。

MLOps 流水线
1. 配置特征库（Feast / Tecton）供训练取数。
2. 接实验跟踪（MLflow / W&B），记录超参。
3. 训练产物注册到模型注册表并打版本元数据。
4. 注册表事件触发 staging 部署；建 A/B 对比新旧模型。
5. 开漂移监控与告警；新模型自动对基线评估。

LLM 接入
1. 建 provider 抽象层屏蔽厂商差异。
2. 指数退避重试 + 二级 provider 降级。
3. token 计数与上下文截断；重复查询加缓存。
4. 逐请求成本追踪；用 Pydantic 校验结构化输出。

RAG
1. 选向量库与 embedding 模型（权衡质量/成本）。
2. 定分块策略，建带元数据的入库流水线。
3. query 向量检索 + 重排，拼接上下文交给 LLM。
4. 校验：回答引用了检索内容、无幻觉。

监控
1. 延迟 p50/p95/p99、错误率告警。
2. 输入数据漂移、预测分布偏移检测；有真值则回记对比。
3. 触发自动再训练。

## 指令

容器模板（注意健康检查与端口 8080）
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

特征库（Feast）
```python
from feast import Entity, Feature, FeatureView, FileSource
user = Entity(name="user_id", value_type=ValueType.INT64)
user_features = FeatureView(
    name="user_features", entities=["user_id"], ttl=timedelta(days=1),
    features=[
        Feature(name="purchase_count_30d", dtype=ValueType.INT64),
        Feature(name="avg_order_value", dtype=ValueType.FLOAT),
    ],
    online=True, source=FileSource(path="data/user_features.parquet"),
)
```

LLM provider 抽象 + 重试
```python
from abc import ABC, abstractmethod
from tenacity import retry, stop_after_attempt, wait_exponential

class LLMProvider(ABC):
    @abstractmethod
    def complete(self, prompt: str, **kwargs) -> str: ...

@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=10))
def call_llm_with_retry(provider: LLMProvider, prompt: str) -> str:
    return provider.complete(prompt)
```

漂移检测（KS 检验）
```python
from scipy.stats import ks_2samp
def detect_drift(reference, current, threshold=0.05):
    statistic, p_value = ks_2samp(reference, current)
    return {"drift_detected": p_value < threshold,
            "ks_statistic": statistic, "p_value": p_value}
```

配套脚本（源仓库提供）
```bash
python scripts/model_deployment_pipeline.py --model model.pkl --target staging
python scripts/rag_system_builder.py --config rag_config.yaml --analyze
python scripts/ml_monitoring_suite.py --config monitoring.yaml --deploy
```

## 示例

场景：把一个排序模型上线并监控。
1. 导出 ONNX，按容器模板打镜像，部署 staging 跑集成测试。
2. 生产 5% 灰度，盯 p95 与错误率 1 小时。
3. 同时挂 KS/PSI 漂移监控：PSI > 0.1 告警、> 0.2 触发评估再训练。
4. 指标达标后全量。

## 注意事项

- 服务化选型按场景：FastAPI+Uvicorn（REST、小模型）、Triton（GPU 推理与批处理、超低延迟高吞吐）、TF Serving / TorchServe（对应框架）、Ray Serve（复杂多模型流水线）。
- 再训练触发：定时（cron）全量；性能跌破阈值即时重训；数据漂移 PSI > 0.2 先评估再重训；新数据量达阈值做增量更新。
- 告警阈值（warning / critical）：p95 延迟 >100ms / >200ms；错误率 >0.1% / >1%；PSI >0.1 / >0.2；准确率下降 >2% / >5%。
- 向量库选型：Pinecone（托管、生产）、Qdrant（性能敏感、超低延迟）、Weaviate（混合检索）、Chroma（原型）、pgvector（已有 Postgres）。
- 分块策略：固定 500-1000 token（重叠 50-100，通用文本）、按句 3-5 句、语义可变长、递归层级（长文档父子块）。
- LLM 成本随模型差异大（如 Haiku 级远低于 Opus/GPT-4），务必逐请求记成本并设预算上限；重复查询走缓存。

## 互见

- 源参考文档（源仓库 references/）：mlops_production_patterns.md（K8s 部署、Feast、A/B、MLflow 再训练）、llm_integration_guide.md（降级、tiktoken token 优化、成本核算）、rag_system_architecture.md（向量库对比、分块、重排）。
- 技术栈：PyTorch/TensorFlow/Scikit-learn/XGBoost；LangChain/LlamaIndex/DSPy；MLflow/W&B/Kubeflow；Spark/Airflow/dbt/Kafka；Docker/Kubernetes/Triton；PostgreSQL/BigQuery/Pinecone/Redis。
