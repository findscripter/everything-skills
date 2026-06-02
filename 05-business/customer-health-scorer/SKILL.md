---
name: customer-health-scorer
title: 客户健康度评分与扩展机会
description: 当分析 SaaS 客户账号的健康度、流失风险或扩展机会时使用；用三个 Python CLI 工具读取客户 JSON，输出确定性健康分、流失风险分层与按优先级排序的扩展建议；不适用于实时数据流、CRM 直连或需要预测式 ML 的场景。触发词：客户健康度、health score、流失风险、churn、续约、扩展机会、upsell、NRR、客户成功
domain: 商业/growth
triggers: [客户健康度, health score, 流失风险, churn, 续约, 扩展机会, upsell, NRR, 客户成功]
tags: [customer-success, saas-metrics, health-scoring, churn, expansion, growth, python, cli]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python3, argparse, json, health_score_calculator.py, churn_risk_analyzer.py, expansion_opportunity_scorer.py]
requires: []
related: [churn-prevention, customer-research-synthesizer, cro-revenue-advisor, ai-customer-support]
combines_with: [churn-prevention, lifecycle-email-sequence, cro-revenue-advisor]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

当你需要对一批 SaaS 客户做**确定性、可复现**的客户成功分析时使用，典型场景：

- 给账号组合打**健康分**（绿/黄/红）并看趋势是否下滑。
- 识别**流失风险**账号并分层（Critical/High/Medium/Low），决定干预优先级。
- 在健康账号里挖**扩展机会**（升级、加模块、加席位/部门），并估算增量收入与排优先级。
- 为 QBR、续约会、高管复盘准备数据底稿。

**不该用的边界：**

- 需要**实时数据**或**CRM 直连**：本技能只吃静态 JSON 快照，数据需手动从 CRM/CS 平台导出。
- 期望**预测式 ML / 概率模型**：这里是基于加权信号的算法打分，结果确定但非预测。
- 单客户主观判断、定性访谈分析：工具只消费结构化字段。

## 步骤

1. **准备输入 JSON**：顶层 `{"customers": [...]}`，每个客户对象含 `customer_id / name / segment（enterprise|mid_market|smb）/ arr`，以及各脚本要求的嵌套对象（见下「指令」中字段清单）。可参考源仓库 `assets/sample_customer_data.json`。
2. **跑健康分** → 输出 JSON 落盘，确认记录数对得上。
3. **跑流失风险** → 确认每个客户都有风险分层。
4. **跑扩展机会** → 确认按优先级排序的机会列表非空。
5. **组合解读**：三份结果一起看；下滑中的绿账号比稳定的黄账号更紧急。

## 指令

环境：Python 3.7+，仅标准库，无外部依赖、无网络调用。所有脚本第一个位置参数为输入 JSON，`--format` 取 `text`（默认，人读）或 `json`（机读，便于管道）。

```bash
# 1. 健康度评分（维度权重：usage 30% / engagement 25% / support 20% / relationship 25%）
#    分类：green 75-100 / yellow 50-74 / red 0-49
python scripts/health_score_calculator.py portfolio.json --format json > health.json

# 2. 流失风险（信号权重：usage_decline 30% / engagement_drop 25% / support_issues 20% /
#    relationship_signals 15% / commercial_factors 10%）
#    分层：Critical 80-100 / High 60-79 / Medium 40-59 / Low 0-39
python scripts/churn_risk_analyzer.py portfolio.json --format json > risk.json

# 3. 扩展机会（Upsell 升级 / Cross-sell 加模块 / Expansion 加席位或部门），含收入估算与优先级
python scripts/expansion_opportunity_scorer.py portfolio.json --format json > expansion.json
```

各脚本必需字段（缺字段或类型错会报错）：

- **健康分**：嵌套 `usage`(login_frequency, feature_adoption, dau_mau_ratio)、`engagement`(support_ticket_volume, meeting_attendance, nps_score, csat_score)、`support`(open_tickets, escalation_rate, avg_resolution_hours)、`relationship`(executive_sponsor_engagement, multi_threading_depth, renewal_sentiment)、以及 `previous_period`（用于趋势）。
- **流失风险**：`contract_end_date` 加嵌套 `usage_decline / engagement_drop / support_issues / relationship_signals / commercial_factors`。
- **扩展机会**：嵌套 `contract`(licensed_seats, active_seats, plan_tier, available_tiers)、`product_usage`(各模块采用标志与使用率)、`departments`(current 与 potential)。

排错检查：输入 JSON 是否匹配该脚本 schema；必需字段是否齐全且类型正确；`python --version` 是否 ≥3.7；管道前确认上一步输出文件非空。

## 示例

```bash
python scripts/health_score_calculator.py assets/sample_customer_data.json --format json
```

输出（节选）：4 个客户，平均分 78.8，绿 3 / 黄 1 / 红 0；`CUST-001 Acme Corp` 总分 86.2（green），其中 usage 91.6、relationship 90.1。据此 Acme 进入扩展评估；任何分类掉到 yellow 且趋势下滑的账号优先做主动触达。

## 注意事项

- **看趋势不看快照**：下滑的绿账号优先级高于稳定的黄账号。
- **阈值需校准**：默认阈值是行业通用值，应按你的产品与行业调整 segment 基准。
- **三脚本合用**才有完整画像；QBR/高管会前固定跑一遍。
- **收入估算是近似值**，基于使用模式推算，不可当作承诺数字。
- 确定性算法：相同输入恒定输出，适合纳入流水线与回归对比。

## 互见

- prompt-template-designer：将这三份 JSON 结果喂给 LLM 生成 QBR/续约话术时，用其设计稳定提示词。
- csv-data-cleaner：从 CRM 导出的原始表先清洗规整，再转成本技能要求的 JSON。

---

本条采编自 alirezarezvani/claude-skills（MIT）。
