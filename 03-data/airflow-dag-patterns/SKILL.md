---
name: airflow-dag-patterns
title: Airflow DAG 生产实践模式
description: 当用 Apache Airflow 编排数据管道、设计 DAG 依赖、实现算子/传感器或排查失败任务时使用；产出幂等、可观测、可测试的生产级 DAG 代码与运维约束；不适用于简单 cron/shell 或非 Airflow 技术栈。触发词：Airflow、DAG、数据管道、调度、TaskFlow、传感器、回填。
domain: 数据/pipeline
triggers: [Airflow, DAG, 数据管道, 工作流编排, 调度批处理, TaskFlow, 传感器 sensor, 回填 backfill, DAG 排错]
tags: [airflow, data-pipeline, orchestration, etl, scheduling]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, airflow]
requires: []
related: [airflow-dag-builder, data-pipeline-engineer, dbt-transformation-patterns, snowflake-development]
combines_with: [data-quality-validator, dbt-transformation-patterns, spark-job-optimization]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 用 Airflow 编排数据管道：设计 DAG 结构、任务依赖、调度周期。
- 实现自定义算子（Operator）与传感器（Sensor），或处理外部依赖等待。
- 本地测试 DAG、部署到生产、排查失败的 DAG run。
- 需要动态批量生成同构管道、分支条件逻辑、失败告警回调。

不该用的边界：

- 只需一个简单 cron 定时任务或 shell 脚本 → 直接写 crontab，别上 Airflow。
- 技术栈里根本没有 Airflow，或任务与工作流编排无关 → 不适用。
- 改动生产 DAG 调度/回填属高风险操作 → 本技能只产出代码与方案，上线前须人工评审和审批，不自动执行。

## 步骤 / 指令

```
1. 梳理输入：数据源、调度周期（cron/@daily）、上下游依赖、SLA。
2. 设计任务：保证四性 —— 幂等(重跑同果)、原子(全成或全败)、增量(只处理新数据)、可观测(每步有日志/指标/告警)。
   - 用 {{ ds }} 等宏取执行日期，绝不硬编码日期。
   - 配 retries / retry_delay / 指数退避；为 sensor 和长任务设 timeout 防僵尸。
3. 选实现范式：
   - 优先 TaskFlow API（@dag/@task），XCom 自动传参，代码更干净。
   - 多个同构管道 → 用工厂函数 + globals() 动态生成 DAG。
   - 条件分流 → BranchPythonOperator；汇合点用 TriggerRule.NONE_FAILED_MIN_ONE_SUCCESS。
   - 等外部文件/上游 DAG/API → S3KeySensor / ExternalTaskSensor / @task.sensor，统一 mode='reschedule' 释放 worker 槽位。
4. 加错误处理：on_failure_callback 推 Slack/PagerDuty；清理任务用 trigger_rule=ALL_DONE，成功通知用 ALL_SUCCESS。
5. 写测试：DagBag 加载无 import 错误、结构/依赖断言、test_cycle() 检测环、纯函数单测。
6. staging 验证后再上生产，并补运维 runbook（回填、重跑、告警处置）。
```

关键约束（务必遵守）：

- 重型逻辑不要写在 DAG 文件顶层（解析时会反复执行），抽到模块里 import。
- 任务保持无状态，禁用全局可变状态。
- 慎用 `depends_on_past=True`（制造瓶颈）；`catchup` 默认设 False，开启前先想清回填影响。
- 回填和重试要防数据重复 —— 写入端按执行日期分区/覆盖，确保幂等。

## 示例

TaskFlow API 范式（Airflow 2.0+，XCom 自动传递）：

```python
# dags/taskflow_etl.py
from datetime import datetime
from airflow.decorators import dag, task

@dag(dag_id='taskflow_etl', schedule='@daily',
     start_date=datetime(2024, 1, 1), catchup=False, tags=['etl', 'taskflow'])
def taskflow_etl():
    @task()
    def extract(source: str) -> dict:
        import pandas as pd
        df = pd.read_csv(f's3://bucket/{source}/{{ ds }}.csv')
        return {'data': df.to_dict(), 'rows': len(df)}

    @task()
    def transform(extracted: dict) -> dict:
        import pandas as pd
        df = pd.DataFrame(extracted['data']).dropna()
        df['processed_at'] = datetime.now()
        return {'data': df.to_dict(), 'rows': len(df)}

    @task()
    def load(transformed: dict, target: str):
        import pandas as pd
        pd.DataFrame(transformed['data']).to_parquet(f's3://bucket/{target}/{{ ds }}.parquet')
        return transformed['rows']

    load(transform(extract(source='raw_data')), target='processed_data')

taskflow_etl()
```

依赖编排速记：

```python
task1 >> task2 >> task3            # 串行
task1 >> [task2, task3, task4]     # 扇出 fan-out
[task1, task2, task3] >> task4     # 扇入 fan-in
```

传感器（reschedule 模式，等 S3 文件就绪）：

```python
from airflow.providers.amazon.aws.sensors.s3 import S3KeySensor
wait = S3KeySensor(
    task_id='wait_for_s3_file', bucket_name='data-lake',
    bucket_key='raw/{{ ds }}/data.parquet', aws_conn_id='aws_default',
    timeout=60*60*2, poke_interval=60*5,
    mode='reschedule',   # 等待时让出 worker 槽位
)
```

DAG 测试（CI 必备的最小集）：

```python
# tests/test_dags.py
import pytest
from airflow.models import DagBag

@pytest.fixture
def dagbag():
    return DagBag(dag_folder='dags/', include_examples=False)

def test_dag_loaded(dagbag):
    assert len(dagbag.import_errors) == 0, dagbag.import_errors

def test_dag_integrity(dagbag):
    for dag_id, dag in dagbag.dags.items():
        assert dag.test_cycle() is None, f'Cycle detected in {dag_id}'
```

推荐工程结构：`dags/`（按 etl/ml 分目录，公共算子/传感器/回调放 `dags/common/`）、`plugins/`、`tests/`、`docker-compose.yml`、`requirements.txt`。

## 注意事项

- 该做：用 TaskFlow API；给任务/传感器设 timeout；sensor 用 `mode='reschedule'`；任务幂等可安全重试；写单测和集成测试。
- 不该做：滥用 `depends_on_past=True`；硬编码日期（用 `{{ ds }}`）；依赖全局状态；盲目关 catchup；在 DAG 顶层放重逻辑。
- 失败回调里带上 dag_id / task_id / 执行日期 / log_url，便于排障；按需接 Slack/PagerDuty。
- 分支汇合点用 `TriggerRule.NONE_FAILED_MIN_ONE_SUCCESS`，否则未走的分支会让 join 被跳过。
- 改生产调度/跑回填前确认幂等与去重策略，避免数据重复；高风险操作走审批。
- 本技能产出的代码不替代环境内的验证、测试与专家评审；缺输入/权限/成功标准时先追问。

## 互见

- requires：无。
- related：无。
- combines_with：csv-data-cleaner —— 管道抽取/落地的本地数据清洗去重时衔接；sql-query-builder —— 编排查询型 ETL 任务时复用其 SQL 产出。

---

采编自 sickn33/antigravity-awesome-skills（airflow-dag-patterns，MIT 许可）。
