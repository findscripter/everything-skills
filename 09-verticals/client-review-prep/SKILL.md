---
name: client-review-prep
title: 客户复盘会议准备
description: 当顾问要为客户复盘/季度回顾会议做准备时使用；做组合业绩与配置漂移分析、议程话术、主动建议与行动项，产出一页式会议纪要（Word/PDF）、业绩表、配置对比图；不适用于具体选股择时、组合实际下单调仓或撰写已结束会议的纪要；触发词：客户复盘、季度回顾、会议准备、client review、quarterly review、meeting prep、给某客户备会、annual review、年度检视
domain: 领域/fintech
triggers: [客户复盘, 季度回顾, 会议准备, client review, quarterly review, meeting prep, 给客户备会, annual review, 年度检视]
tags: [fintech, wealth-management, client-review, meeting-prep, portfolio-performance, financial-advisor]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [word, excel, pdf]
requires: []
related: [client-performance-report, investment-proposal-builder, portfolio-rebalancer, portfolio-risk-metrics]
combines_with: [client-performance-report, portfolio-rebalancer]
license: Apache-2.0
source: anthropics/financial-services
source_license: Apache-2.0
---
# 客户复盘会议准备

## 何时使用

当理财顾问 / 投顾要为某位客户的复盘会议（季度回顾、年度检视、临时约谈）做准备，需要把分散在多账户的数据汇总成一份会议可用的材料时使用。典型触发：「客户复盘 / client review」「季度回顾 / quarterly review」「会议准备 / meeting prep for [客户]」「给某客户备会」「年度检视 / annual review」。

不该用的边界：
- 不做具体选股、择时或宏观研判——本技能只汇总与解读已有组合，不预测涨跌。
- 不在本技能内执行实际调仓下单；只产出「建议」，调仓交给 `portfolio-rebalancer`。
- 不用于整理已开完会议的会后纪要——本技能是「会前准备」。

## 步骤

1. 客户背景：核对客户姓名与家庭成员、账户类型（应税 / IRA / Roth / 401k / 信托）、各账户与家庭合计 AUM、IPS（投资政策声明）的目标配置/风险承受/限制条款、人生阶段（积累期 / 临退休 / 退休 / 传承）、上次会议日期及遗留行动项。
2. 组合业绩：对每个账户及家庭合计填写业绩表（见「指令」），并做归因——哪些资产类别/持仓驱动了收益，列出前 3 大贡献与前 3 大拖累，标记是否有单一仓位的异常影响。
3. 配置复核：当前 vs 目标配置填表，标出漂移超过 IPS 再平衡阈值（通常 3%~5%）的资产类别。
4. 议程话术：生成会议议程（见「示例」），按时间分块。
5. 主动建议：基于复盘结果，提出再平衡交易（若漂移超阈值）、税损收割（TLH）机会、现金部署或提取规划、Roth 转换机会（如适用）、受益人/遗产规划更新、保险复核（寿险/失能/长护）。
6. 输出：一页式客户复盘纪要（Word 或 PDF）、含基准的业绩表、当前 vs 目标配置饼图、建议行动项清单、会议议程。

## 指令

业绩表（逐账户 + 家庭合计各填一份）：

| 指标 | 季度至今 QTD | 年初至今 YTD | 1 年 | 3 年 | 成立以来 |
|---|---|---|---|---|---|
| 组合收益 | | | | | |
| 基准收益 | | | | | |
| 超额收益 Alpha | | | | | |

配置漂移表（标出超阈值项）：

| 资产类别 | 目标% | 当前% | 漂移 | 建议操作 |
|---|---|---|---|---|
| 美国大盘股 / US Large Cap | | | | |
| 美国中小盘 / US Mid-Small | | | | |
| 国际成熟市场 | | | | |
| 新兴市场 | | | | |
| 固定收益 | | | | |
| 另类资产 | | | | |
| 现金 | | | | |

漂移超过 IPS 再平衡阈值（通常 3%~5%）的项必须标记并触发再平衡建议。

## 示例

5 步议程（按此结构生成，配上具体数字与话术）：

1. **市场概览**（2-3 分钟）：简要宏观背景与展望。
2. **组合业绩**（5 分钟）：表现如何？为什么？
3. **配置复核**（5 分钟）：是否需要再平衡？
4. **规划更新**（5-10 分钟）：人生变化（工作/健康/家庭/购房/教育）？收入需求变化？税务情况更新？遗产规划更新？
5. **行动项**（5 分钟）：下次会议前我们要做什么，谁负责、截止到哪天？

## 注意事项

- 会前先「认识你的客户」——务必复习上次会议笔记与遗留行动项。
- 从客户在意的事切入，而非你想讲的事。
- 业绩不佳要直面，不要回避或粉饰。
- 每次都以明确的行动项 + 带日期的下一步收尾。
- 记录会议纪要及对 IPS 的任何变更。
- 合规：所有材料须符合公司政策与监管要求。

## 互见

- related：`portfolio-risk-metrics` —— 业绩归因与风险口径
- related：`board-minutes-drafter` —— 会后纪要起草
- combines_with：`portfolio-rebalancer` —— 把本技能产出的再平衡建议落地为调仓清单
- combines_with：`tax-loss-harvesting` —— 把税损收割机会展开为可执行交易

本条采编自 anthropics/financial-services（Apache-2.0）。
