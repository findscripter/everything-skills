---
name: airflow-dag-builder
title: Airflow 数据管道编排
description: 当用 Apache Airflow 编排数据管道、调度批处理作业、设计 DAG 依赖、写自定义算子/传感器或本地测试与排障 DAG 时使用；做产出可上生产的幂等 DAG（TaskFlow、分支、传感器、重试告警、DagBag 测试）；不适用于实时流处理、毫秒级低延迟调度或非数据工作流；触发词：airflow、DAG、数据管道、工作流编排、ETL 调度、批处理调度、TaskFlow、sensor、operator、cron 调度。
domain: 数据/pipeline
triggers: [airflow, DAG, 数据管道, 工作流编排, ETL 调度, 批处理调度, TaskFlow, sensor, operator, cron 调度]
tags: [airflow, dag, etl, orchestration, data-pipeline, scheduling]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, apache-airflow, pytest]
requires: []
related: [airflow-dag-patterns, data-pipeline-engineer, dbt-transformation-modeler, snowflake-development]
combines_with: [data-quality-frameworks, dbt-transformation-modeler, spark-job-optimization]
license: MIT
source: wshobson/agents
source_license: MIT
---
## 何时使用

- 需要用 Apache Airflow **编排数据管道**：设计 DAG 结构与任务依赖、调度 ETL/批处理作业。
- 实现自定义 operator / sensor，等待外部文件、S3 对象或上游 DAG 完成。
- 本地测试 DAG（DagBag 加载校验、依赖断言）、排查失败的 DAG run。
- 触发词：airflow、DAG、数据管道、工作流编排、ETL 调度、批处理调度、TaskFlow、sensor、operator、cron 调度。

**不该用（边界）：**
- **实时流处理 / 毫秒级低延迟** → 用 Flink/Kafka Streams，Airflow 是批调度器，最小粒度是任务级。
- **非数据类工作流**（如 CI/CD、前端构建）→ 用各自专用工具，别套 DAG。
- **单机一次性脚本**、无依赖无调度需求 → 直接 cron + 脚本即可，别引入 Airflow。
- 任务内的具体 SQL 转换 / CSV 清洗逻辑本身 → 见「互见」，本技能只负责编排与调度。

## 步骤 / 指令

按序执行，每步可独立验证：

1. **确立 DAG 设计原则**（四条硬约束）：
   - **幂等（Idempotent）**：跑两次结果一致 —— 用 `{{ ds }}` 等模板取执行日期，禁止 `datetime.now()` 决定写入位置。
   - **原子（Atomic）**：任务要么全成功要么全失败，便于安全重试。
   - **增量（Incremental）**：只处理新增/变更数据，按 `ds` 分区。
   - **可观测（Observable）**：每步有日志、指标、告警。
2. **建骨架 DAG**：设 `start_date`、`schedule`（cron 或 `@daily`）、`catchup=False`、`max_active_runs=1`、`tags`；在 `default_args` 里配重试（`retries=3`、`retry_delay`、`retry_exponential_backoff=True`、`max_retry_delay`）。
3. **定义依赖**：用位移运算符表达拓扑——
   - 线性 `task1 >> task2 >> task3`；
   - 扇出 `task1 >> [task2, task3, task4]`；
   - 扇入 `[task1, task2, task3] >> task4`。
4. **优先用 TaskFlow API**（Airflow 2.0+）：`@dag` / `@task` 装饰器，函数返回值自动经 XCom 传递，代码更干净。
5. **按需选模式**：分支用 `BranchPythonOperator` + join 任务（`trigger_rule=NONE_FAILED_MIN_ONE_SUCCESS`）；外部依赖用 sensor，**务必 `mode='reschedule'`** 释放 worker 槽位；批量同构管道用工厂函数 + `globals()` 动态生成 DAG。
6. **错误处理与告警**：配 `on_failure_callback`（推 Slack/PagerDuty），清理任务用 `trigger_rule=ALL_DONE`（上游失败也跑），成功通知用 `ALL_SUCCESS`。
7. **测试 DAG**：用 `DagBag` 断言 `import_errors==0`、任务数、调度、依赖关系、无环（`test_cycle()`）；任务内函数另写单元测试。
8. **组织项目结构**：DAG 文件只放编排，重逻辑 import 自 `dags/common/` 等模块；按 `etl/`、`ml/` 分目录。

## 示例

最小可用 DAG（经典写法）：

```python
# dags/example_dag.py
from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.operators.empty import EmptyOperator

default_args = {
    'owner': 'data-team',
    'retries': 3,
    'retry_delay': timedelta(minutes=5),
    'retry_exponential_backoff': True,
    'max_retry_delay': timedelta(hours=1),
}

with DAG(
    dag_id='example_etl',
    default_args=default_args,
    schedule='0 6 * * *',          # 每天 6:00
    start_date=datetime(2024, 1, 1),
    catchup=False,
    tags=['etl', 'example'],
    max_active_runs=1,
) as dag:
    start = EmptyOperator(task_id='start')

    def extract_data(**context):
        execution_date = context['ds']  # 用模板，保证幂等
        return {'records': 1000}

    extract = PythonOperator(task_id='extract', python_callable=extract_data)
    end = EmptyOperator(task_id='end')
    start >> extract >> end
```

TaskFlow API（XCom 自动传值）：

```python
from airflow.decorators import dag, task

@dag(dag_id='taskflow_etl', schedule='@daily',
     start_date=datetime(2024, 1, 1), catchup=False, tags=['etl'])
def taskflow_etl():
    @task()
    def extract(source: str) -> dict: ...
    @task()
    def transform(extracted: dict) -> dict: ...
    @task()
    def load(transformed: dict, target: str): ...

    load(transform(extract('raw_data')), target='processed')

taskflow_etl()
```

Sensor 等外部依赖（`mode='reschedule'` 必加）：

```python
from airflow.providers.amazon.aws.sensors.s3 import S3KeySensor

wait_for_file = S3KeySensor(
    task_id='wait_for_s3_file',
    bucket_name='data-lake',
    bucket_key='raw/{{ ds }}/data.parquet',
    timeout=60 * 60 * 2,    # 2 小时上限
    poke_interval=60 * 5,   # 每 5 分钟探一次
    mode='reschedule',      # 等待时让出 worker
)
```

DAG 测试：

```python
import pytest
from airflow.models import DagBag

@pytest.fixture
def dagbag():
    return DagBag(dag_folder='dags/', include_examples=False)

def test_dag_loaded(dagbag):
    assert len(dagbag.import_errors) == 0, dagbag.import_errors

def test_dag_integrity(dagbag):
    for dag_id, dag in dagbag.dags.items():
        assert dag.test_cycle() is None  # 无环
```

## 注意事项

**应做（Do's）：**
- 优先 **TaskFlow API**，代码更清晰、XCom 自动化。
- 给任务设**超时**（`execution_timeout`），防僵尸任务。
- sensor 一律 `mode='reschedule'`，长等待不占 worker。
- DAG 写**单元测试 + 集成测试**（DagBag 校验）。
- 任务保持**幂等**，可安全重试。

**避免（Don'ts）：**
- 别用 `depends_on_past=True` —— 制造串行瓶颈。
- 别硬编码日期 —— 用 `{{ ds }}` 等宏。
- 别用**全局状态** —— 任务应无状态。
- 别盲目 `catchup=False`/`True` —— 先搞清回填的影响再设。
- 别把**重逻辑写进 DAG 文件** —— DAG 文件会被 scheduler 反复解析，重逻辑要 import 自模块。

## 互见

- **related**：`sql-query-builder` — DAG 任务里执行的 SQL 转换/抽取语句由其生成。
- **related**：`csv-data-cleaner` — extract 后、load 前的表格清洗步骤可由其承担。
- **related**：`rag-pipeline-builder` — 用 Airflow 定时调度 RAG 语料的增量入库/重建管道。

---
本条采编自 wshobson/agents（MIT）。
