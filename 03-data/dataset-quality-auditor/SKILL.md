---
name: dataset-quality-auditor
title: 数据集质量审计
description: 当需要评估数据集健康度、在建模或上线前查出隐藏质量问题时使用；做完整性/一致性/有效性/唯一性/时效性五维审计，产出数据质量分(DQS 0-100)与按影响排序的修复方案；不适用于设计数据库 schema、搭建 ETL 管道、或校验财务模型输出。触发词：数据质量、数据审计、缺失值、异常值离群点、DQS、数据画像
domain: 数据/wrangling
triggers: [数据质量, 数据审计, 数据集质量, 缺失值分析, 异常值检测, 离群点, 数据画像 profiling, 数据质量分 DQS, 数据是否能建模, 清洗这份数据, MCAR MAR MNAR, 重复键 主键唯一性, 分布漂移, 数据监控阈值]
tags: [数据, wrangling, 数据质量, 数据审计, 缺失值, 异常值, 数据画像, 数据治理]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [data_profiler.py, missing_value_analyzer.py, outlier_detector.py, python3]
requires: []
related: [data-quality-validator, data-quality-frameworks, csv-data-cleaner, spreadsheet-formula-auditor]
combines_with: [csv-data-cleaner, scikit-learn-ml, polars-dataframe]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

适用于：在数据进入模型、报表或决策前，系统性评估其健康度，挖出那些"不报错却悄悄污染下游"的质量问题，并给出按影响排序的修复方案。典型请求：

- "帮我画像/审计这份数据集" → 输出完整 DQS 报告 + 各列问题清单。
- "X 列出了什么问题？" → 定向审计该列的缺失、异常、类型、值域违规。
- "这份数据能用来建模吗？" → 输出建模就绪检查清单（逐项 pass/fail）。
- "帮我清洗这份数据" → 输出按优先级排序的修复方案，每个问题配具体变换。
- "给关键列配监控" → 输出阈值配置 + 告警检查清单。
- "和上个月比有没有变化？" → 输出分布对比报告，标记漂移。

不该用（负边界）：
- 要设计或优化数据库 **schema/范式** → 用数据库设计类技能。
- 要搭建 **ETL 管道本身** → 用工程类技能。
- 数据是**财务模型的输出**、需校验模型逻辑 → 用财务分析类技能。

## 步骤

按场景选其一切入。

**模式 1 — 完整审计（全新数据集）**
1. 画像：跑 `data_profiler.py`，拿到形状、类型、完整性、分布与 DQS。
2. 缺失值：跑 `missing_value_analyzer.py`，把缺失机制分类为 MCAR/MAR/MNAR。
3. 异常值：跑 `outlier_detector.py`，用 IQR / Z-score / 修正 Z-score 标记离群点。
4. 跨列检查：核对引用完整性、重复行、逻辑约束（如 `start <= end`）。
5. 打分与报告：给出 DQS 并产出修复方案，问题按 严重度 × 波及面 排序。

**模式 2 — 定向排查（怀疑具体列/指标/管道环节）**
1. 先问三连：*什么坏了、什么时候开始、上游改了什么？*
2. 只对可疑列跑相应脚本。
3. 有已知良好基线时，对比分布。
4. 追到根因（源系统 / ETL 变换 / 摄入延迟）。

**模式 3 — 持续监控搭建（活管道）**
1. 圈定驱动核心指标的 5–8 个关键列。
2. 定阈值：可接受空值率、离群率、值域。
3. 用 `data_profiler.py --monitor` 生成监控清单与告警逻辑。
4. 按摄入节奏排程检查。

## 指令

脚本默认读 CSV，统一用 `--format json` 可输出供下游使用。

```bash
# 画像：形状/类型/空值率/基数/分布 + DQS
python3 scripts/data_profiler.py --file data.csv
python3 scripts/data_profiler.py --file data.csv --columns col1,col2,col3
python3 scripts/data_profiler.py --file data.csv --format json
python3 scripts/data_profiler.py --file data.csv --monitor   # 生成监控阈值

# 缺失值：体量/模式/机制(MCAR/MAR/MNAR) + 逐列填补建议
python3 scripts/missing_value_analyzer.py --file data.csv
python3 scripts/missing_value_analyzer.py --file data.csv --threshold 0.05
python3 scripts/missing_value_analyzer.py --file data.csv --format json

# 异常值：多方法 + 业务影响判断
python3 scripts/outlier_detector.py --file data.csv
python3 scripts/outlier_detector.py --file data.csv --method iqr
python3 scripts/outlier_detector.py --file data.csv --method zscore --threshold 2.5
python3 scripts/outlier_detector.py --file data.csv --format json
```

**DQS（0–100，五维加权，报告必须置顶呈现）**

| 维度 | 权重 | 衡量什么 |
|---|---|---|
| 完整性 Completeness | 30% | 关键列的空值/缺失率 |
| 一致性 Consistency | 25% | 类型符合、格式统一、无混合类型 |
| 有效性 Validity | 20% | 值落在预期域内（范围、类别、正则） |
| 唯一性 Uniqueness | 15% | 重复行、重复键、冗余列 |
| 时效性 Timeliness | 10% | 时间戳新鲜度、相对源系统的延迟 |

评分阈值：🟢 85–100 可上生产；🟡 65–84 带书面注意事项可用（限探索分析）；🔴 0–64 使用前必须修复。

**异常检测公式（按分布选方法）**
- IQR（默认，非参数稳健）：`x < Q1 − 1.5×IQR` 或 `x > Q3 + 1.5×IQR`。
- Z-score：`|x − μ| / σ > 阈值`（常用 3.0）。仅当近似正态且污染 <5% 时用——均值/标准差本身受离群点拖累。
- 修正 Z-score（Iglewicz-Hoaglin，偏态首选）：`M = 0.6745 × |x − median| / MAD`，`M > 3.5` 即离群。注意离散且单值主导列 MAD 可能为 0。

## 示例

报告统一用四段式结构：

> **结论 Bottom Line** — DQS: 61/100 — 上生产前必须修复。
> **发现 What** — 按 严重度×波及面 排序的具体问题。
> **影响 Why It Matters** — 每个问题的业务/分析后果。
> **行动 How to Act** — 具体、有序的修复步骤。

缺失值修复速查（务必在 null% >1% 时加 `col_was_null` 指示列，保留"曾为空"这一可能有预测价值的信息）：

| 空值率 | 建议动作 |
|---|---|
| <1% | 数据集大可删行，或用中位数/众数填补 |
| 1–10% | 填补 + 加二值指示列 `col_was_null` |
| 10–30% | 谨慎填补，查根因，书面记录假设 |
| >30% | 交业务评审，勿盲目填补，考虑删列 |

去重：先与数据 owner 确认唯一键；事件数据用 `keep='last'`（最新状态胜出），缓变维表用 `keep='first'`。

## 注意事项

主动风险触发器——一旦发现信号，不必等用户问，直接抛出：
- **隐形空值**：空值被编码成 `0`、`""`、`"N/A"`、`"null"` 字符串；不抓出来，完整性指标全是假的。
- **泄漏时间戳**：未来日期、早于系统上线的日期、时区错配——会污染时序 join。
- **基数爆炸**：上千唯一值的自由文本伪装成类别字段，会悄悄撑爆 one-hot 编码。
- **重复主键**：PK 不唯一会让下游 join 和聚合全部失效。
- **分布漂移**：当前分布相对基线偏离 >2σ（均值/标准差），预示上游管道变更。
- **相关性缺失**：空值扎堆在某时间段/用户段/地区——是 MNAR 证据，不是随机丢失。

填补安全红线（按机制决定能否填）：MCAR 可放心填（均值/中位数）；MAR 须用纳入相关观测变量的模型条件填补；**MNAR 不可填**，填补必引入系统性偏差，须上报业务 owner。

证据分级 + 人审：每条发现打置信标签——🟢 已核实 / 🟡 很可能 / 🔴 推测（待业务确认）。**绝不在未经人工确认下自动修复 🔴 级发现。**

其他静默杀手：去尾空格（`"active "` ≠ `"active"`）、时区裸时间戳、UTF-8/Latin-1 编码错乱、数值被存成科学计数法字符串、上游 lookup 字段悄悄新增类别导致旧代码丢行。

## 互见

- 问题根因在 **schema 设计/范式** → 数据库设计类技能。
- 数据是 **订阅/事件数据喂 SaaS KPI** → SaaS 指标类技能。
- 数据涉及 **财务报表/会计数字** → 财务分析类技能。
- 审计 **产品事件数据**（漏斗、会话、留存）→ 产品分析类技能。
- 质量问题是**系统性的、需当技术债跟踪** → 技术债跟踪类技能。

---
采编自 alirezarezvani/claude-skills（MIT 许可证）。理论依据：Rubin (1976) 缺失机制、Iglewicz-Hoaglin (1993) 异常检测、DAMA-DMBOK 与 ISO 8000 数据质量维度。
