---
name: campaign-attribution-analytics
title: 营销活动归因分析
description: 当需要评估营销活动表现、判定渠道贡献或核算投放回报时使用；用三个零依赖 Python CLI 对 JSON 数据做多触点归因、漏斗转化与 ROI/ROAS/CPA 核算并产出可读或 JSON 报告；不适用于实时数据接入、统计显著性检验或跨设备身份打通。触发词：归因模型、营销 ROI、漏斗转化
domain: 商业/marketing
triggers: [营销活动分析, 多触点归因, 归因模型, 时间衰减归因, 漏斗转化分析, 转化率漏斗, ROI 计算, ROAS, CPA / CAC, 渠道贡献评估, 广告投放回报, campaign analytics, attribution model]
tags: [商业, marketing, 营销分析, 归因建模, 漏斗分析, ROI, 数据分析, python-cli]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [attribution_analyzer.py, funnel_analyzer.py, campaign_roi_calculator.py, python -m json.tool]
requires: []
related: [analytics-tracking-setup, marketing-analytics-tracker, social-media-performance-analyzer, paid-ads-strategist]
combines_with: [analytics-tracking-setup, paid-ads-strategist, data-storyteller]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

当你需要回答下面这类营销分析问题时使用本技能：

- 哪些渠道真正驱动了转化？（多触点归因，对比 5 种模型）
- 用户在转化路径的哪一步流失最多？（漏斗瓶颈定位）
- 这笔投放赚钱吗？该把预算挪到哪？（ROI / ROAS / CPA / CAC 核算并对标行业基准）

工具是三个仅依赖标准库的 Python CLI，输入静态 JSON 快照，输出确定、可复现的结果——不调用外部 API、不跑 ML 模型。

**不该用的边界（直接换工具或上游处理）：**

- 需要统计显著性 / p 值检验——脚本只给描述性指标，请用专门统计工具。
- 需要实时数据流、API 直连——脚本只分析离线 JSON 快照。
- 跨设备 / 跨身份归一——须在上游打通后再喂数据。
- 多币种——所有金额假定同一币种，无汇率换算。
- 超大规模（journeys > 10 万）——标准库实现未做大数据优化。
- 时间衰减不考虑工作日/周末或季节性，半衰期为简化指数衰减。

## 步骤

1. 准备并校验 JSON。三类输入分别对应三个脚本（schema 见下「指令」）。运行前先校验语法：

   ```bash
   python -m json.tool your_file.json
   ```

   常见报错：缺 `journeys`/`funnel.stages`/`campaigns` 等必填键→`KeyError`；漏斗 `stages` 与 `counts` 数组长度不一致→`ValueError`；ROI 金额非数值→`TypeError`。

2. 归因：先看哪些渠道驱动转化。建议跑至少 3 个模型做三角验证。
3. 漏斗：聚焦上一步的高价值渠道分段，定位掉量最大的环节。
4. ROI：核算盈利能力并对标行业基准，决定预算再分配。

## 指令

**完整工作流（按序运行三脚本）：**

```bash
# 1. 归因——理解哪些渠道驱动转化
python scripts/attribution_analyzer.py campaign_data.json --model time-decay

# 2. 漏斗——找出转化路径上的流失点
python scripts/funnel_analyzer.py funnel_data.json

# 3. ROI——核算盈利能力并对标行业标准
python scripts/campaign_roi_calculator.py campaign_data.json
```

**归因分析器**（5 种模型，credit 分配如下）：

| 模型 | 规则 | 适用 |
|------|------|------|
| First-Touch 首触 | 100% 给首个触点 | 品牌认知 |
| Last-Touch 末触 | 100% 给末个触点 | 直效响应 |
| Linear 线性 | 各触点均分 | 均衡多渠道 |
| Time-Decay 时间衰减 | 越近权重越高，`权重=e^(-λ·距转化天数)`，`λ=ln2/半衰期` | 短销售周期 |
| Position-Based 位置 | 40/20/40（首/中/末）；1 触点=100%，2 触点=各 50% | 全漏斗 |

```bash
python scripts/attribution_analyzer.py campaign_data.json                 # 跑全部 5 个模型
python scripts/attribution_analyzer.py campaign_data.json --model time-decay --half-life 14  # 自定义半衰期(默认7天)
python scripts/attribution_analyzer.py campaign_data.json --format json    # 管道集成
```

半衰期参考：冲动型 1–3 天选 1–2 天；考量型 1–2 周选 5–7 天；B2B 1–3 月选 14–21 天；企业级 3–6 月选 30–45 天。

**漏斗分析器**：输出逐级转化率与掉量百分比、自动标出绝对/相对最大掉量瓶颈、整体转化率，多分段时支持对比。

```bash
python scripts/funnel_analyzer.py funnel_data.json [--format json]
```

**ROI 计算器**：输出 ROI、ROAS、CPA、CPL、CAC、CTR、CVR，并对标行业基准（按渠道分 low/target/high），自动标记低于基准的活动。

```bash
python scripts/campaign_roi_calculator.py campaign_data.json [--format json]
```

输出格式统一用 `--format text`（默认，人读表格）或 `--format json`（机读，供集成/流水线）。

## 示例

三类输入的最小 JSON 形态：

```json
// 归因输入
{"journeys":[{"journey_id":"j1","touchpoints":[
  {"channel":"organic_search","timestamp":"2025-10-01T10:00:00","interaction":"click"},
  {"channel":"email","timestamp":"2025-10-05T14:30:00","interaction":"open"}],
  "converted":true,"revenue":500.00}]}

// 漏斗输入（stages 与 counts 等长）
{"funnel":{"stages":["Awareness","Interest","Consideration","Intent","Purchase"],
  "counts":[10000,5200,2800,1400,420]}}

// ROI 输入
{"campaigns":[{"name":"Spring Email","channel":"email","spend":5000.00,
  "revenue":25000.00,"impressions":50000,"clicks":2500,"leads":300,"customers":45}]}
```

解读发散结果：某渠道「首触高、末触低」=擅长拉新但不促成，应配强转化渠道；「线性高、首末都低」=关键培育角色，砍掉会断链。

## 注意事项

- **跑多个模型再下结论**——没有单一模型是「对」的；取在多个模型中都排名靠前的渠道作为可靠贡献者。
- **半衰期匹配销售周期**——时间衰减的回溯窗口要贴合平均成交周期。
- **先和自己的历史比**——行业基准给上下文，但历史数据才是最相关的对标。
- **算全成本**——ROI 要把创意、工具、人力成本一并计入，而非只算媒体投放。
- **数据量要够**——少于 100 条 journey 结果不可靠；归因只统计已转化路径，未转化路径的渠道价值会被忽略。
- **相关≠因果**——归因展示触点与转化的相关性，不等于因果。

## 互见

- **analytics-tracking**：负责埋点与采集，不做分析（分析归本技能）。
- **ab-test-setup**：把本技能发现的问题设计成实验验证。
- **paid-ads**：依据分析结论优化广告投放。
- **marketing-ops**：把洞察路由到正确的执行技能。

---

采编自 alirezarezvani/claude-skills（MIT）。
