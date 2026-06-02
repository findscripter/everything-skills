---
name: sales-forecast-builder
title: 加权销售预测构建器
description: 当需要从管道数据生成季度/期间销售预测、评估缺口或决定承诺/上行单时使用；按阶段概率算加权预测，产出乐观/可能/悲观三档、承诺vs上行拆分、风险标记与缺口分析；不适用于已成交财报口径核算或现金流/营收确认。触发词：销售预测、加权预测、gap-to-quota、pipeline coverage、commit/upside
domain: 商业/copy
triggers: [生成季度销售预测, 评估配额缺口, 决定哪些单 commit 哪些 upside, 检查 pipeline coverage, 从 CRM 导出的 CSV 算加权预测, forecast call 备料, best/likely/worst 三档预测]
tags: [销售, 预测, pipeline, forecast, 商业分析, misc]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Bash]
requires: []
related: [deal-pipeline-tracker, cro-revenue-advisor, deal-desk-reviewer, sales-prospecting]
combines_with: [deal-pipeline-tracker, startup-financial-modeler]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
## 何时使用

- 准备季度/期间 forecast call，需要一份带风险分析与承诺建议的预测。
- 拿到 CRM 导出的管道 CSV（或口述/粘贴的 deal 列表），想算出加权预测和 gap-to-quota。
- 需要决定哪些 deal 进 commit、哪些只算 upside。
- 想核对 pipeline coverage（覆盖倍数）是否健康。

不该用的边界：

- 不做已成交的财报口径核算、营收确认或现金流预测，那是财务侧口径。
- 不替代真实 CRM 单一可信源；本技能是分析与决策辅助，不回写 CRM 数据。
- 缺少金额/阶段/关单日期等最小字段时，先补齐数据再用，不要凭空臆造概率。

## 步骤

**第 1 步 收集管道数据（三选一）**

- 方式 A 上传 CSV：CRM（Salesforce / HubSpot 等）导出。最少需要 4 列：Deal/商机名、金额 Amount、阶段 Stage、关单日期 Close date。有则更好：负责人 Owner（团队预测时）、最近活动日期、创建日期、客户名 Account。
- 方式 B 粘贴 deal 列表，例如：
  ```
  Acme Corp - $50K - Negotiation - closes Jan 31
  TechStart - $25K - Demo scheduled - closes Feb 15
  BigCo - $100K - Discovery - closes Mar 30
  ```
- 方式 C 口述领地：“管道里 8 个单共 $400K，2 个谈判中（$120K），3 个评估中（$180K），3 个 discovery（$100K）。”

**第 2 步 确认目标**

- 配额 Quota：本期数字（如本季 $500K）。
- 时间线 Timeline：期间何时结束（如 Q1 到 3/31）。
- 已成交 Already closed：本期已 booked 多少。

**第 3 步 按阶段套用概率，计算加权值**

未提供自定义概率时，使用以下默认表（阶段命名以客户实际口径为准，先问清再套）：

| 阶段 | 默认概率 |
|------|---------|
| Closed Won 已赢 | 100% |
| Negotiation / Contract 谈判·合同 | 80% |
| Proposal / Quote 方案·报价 | 60% |
| Evaluation / Demo 评估·演示 | 40% |
| Discovery / Qualification 探索·验证 | 20% |
| Prospecting / Lead 触达·线索 | 10% |

每单加权值 = 金额 × 阶段概率。

**第 4 步 算三档场景**

- 乐观 Best Case：所有 deal 如期成交（≈开口管道总额 + 已成交）。
- 可能 Likely Case：按阶段加权概率（加权预测）。
- 悲观 Worst Case：只有 commit 单成交。

**第 5 步 拆 commit vs. upside、标风险、做缺口分析**，再按下方模板输出。

## 指令

- 缺口 Gap to Quota = 配额 − （已成交 + 加权预测）。
- 覆盖倍数 Coverage Ratio = 开口管道总额 ÷ 剩余缺口（或 ÷ 配额）。3x 健康，低于 2x 偏险。
- commit 只放你愿意押注的高确定性单；其余一律归 upside，别灌水。
- 自动标记的风险信号：关单日期已过；14+ 天无活动；关单日就在本周却仍在 discovery。
- 若接入了 CRM：自动拉管道、用真实历史按阶段/分层/单额的赢率、按活动新近度做风险打分、跨期追踪并对比上次预测。

## 示例

输出结构（Markdown）：

```markdown
# 销售预测：[期间]
**生成时间：**[日期]  **数据来源：**[CSV / 手工录入 / CRM]

## 摘要
| 指标 | 值 |
|------|----|
| 配额 | $[X] |
| 已成交 | $[X]（占配额 [X]%）|
| 开口管道 | $[X] |
| 加权预测 | $[X] |
| 缺口 | $[X] |
| 覆盖倍数 | [X]x |

## 预测场景
| 场景 | 金额 | 占配额 | 假设 |
|------|------|--------|------|
| 乐观 | $[X] | [X]% | 所有单如期成交 |
| 可能 | $[X] | [X]% | 按阶段加权概率 |
| 悲观 | $[X] | [X]% | 仅 commit 单成交 |

## 按阶段管道
| 阶段 | 单数 | 总额 | 概率 | 加权值 |
|------|------|------|------|--------|
| 谈判 | [X] | $[X] | 80% | $[X] |
| … | | | | |
| 合计 | [X] | $[X] | — | $[X] |

## Commit vs. Upside
Commit（高确定性，敢押注的单）：含 Deal / 金额 / 阶段 / 关单日 / 入选理由，给出 Commit 总额。
Upside（有风险但可能成）：含 Deal / 金额 / 阶段 / 关单日 / 风险因素，给出 Upside 总额。

## 风险标记
| Deal | 金额 | 风险 | 建议 |
|------|------|------|------|
| [Deal] | $[X] | 关单日已过 | 更新关单日或转 lost |
| [Deal] | $[X] | 14+ 天无活动 | 重新触达或降阶段 |
| [Deal] | $[X] | 本周关单仍在 discovery | 难成交，往后推 |

## 缺口分析
**要达标还差：**$[X]
方案：1) 加速某单；2) 复活某停滞单（最近活动 [日期]，联系 [对接人]）；3) 按 [X]x 覆盖需要新增 $[X] 管道。

## 行动建议
1. [ ] 对最高影响单的具体动作
2. [ ] 对高风险单的动作
3. [ ] 若有缺口，补管道的动作
```

## 注意事项

1. commit 要诚实——只放你敢押注的单，其余进 upside。
2. 及时更新关单日——过期的关单日会严重拉低预测准确度，赶不上的单往后推。
3. 覆盖很关键——3x 健康，低于 2x 偏险。
4. 活动即信号——长期无活动的单，实际风险高于其阶段所暗示的。
5. 阶段命名与概率因团队而异，套默认表前务必先确认客户实际口径。

## 互见

- 同源 sales 插件其他技能（如管道梳理、deal 复盘等）。
- 凡涉及把预测结果落到飞书多维表格/电子表格做跟踪时，配合 lark-base / lark-sheets 使用。

---

采编自 anthropics/knowledge-work-plugins（Apache-2.0），适配重写，非逐字翻译。
