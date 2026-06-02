---
name: investment-proposal-builder
title: 投资建议书撰写
description: 当向潜在客户推介财富管理服务、或为新客户呈现一套投资策略而需要撰写专业投资建议书时使用；做客户发现信息梳理、六段式建议书结构（公司介绍/需求理解/投资策略/预期结果/费用结构/落地步骤）、配置表与情景测算并产出 PPT 提案、PDF 留存版与一页式跟进摘要；不适用于已签约客户的常态化组合调仓、个税申报代理或具体选股/择时建议；触发词：投资建议书、投资提案、investment proposal、prospect presentation、新客户提案、pitch new client、客户推介、proposal for client、新客户演示、提案 PPT
domain: 领域/fintech
triggers: [投资建议书, 投资提案, investment proposal, prospect presentation, 新客户提案, pitch new client, 客户推介, proposal for client, 新客户演示, 提案 PPT]
tags: [fintech, investment-proposal, wealth-management, client-pitch, asset-allocation, advisory]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [PowerPoint, PDF]
requires: []
related: [client-review-prep, client-performance-report, portfolio-rebalancer, portfolio-risk-metrics]
combines_with: [client-performance-report, portfolio-rebalancer]
license: Apache-2.0
source: anthropics/financial-services
source_license: Apache-2.0
---
＜FRONTMATTER 参考（写入 SKILL.md 时使用）＞
name: investment-proposal-builder
domain: 领域/fintech
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
requires: []
related: [portfolio-risk-metrics, tax-loss-harvesting]
combines_with: [portfolio-rebalancer, portfolio-risk-metrics]
license: Apache-2.0
source: anthropics/financial-services
source_license: Apache-2.0

---

# 投资建议书撰写

## 何时使用

- 向**潜在客户（prospect）**推介财富管理/投资顾问服务，需要一份个性化、可演示的投资建议书。
- 为既有或新客户呈现一套全新的投资策略并争取签约。
- 触发场景：客户问"能不能给我出一份方案/提案""你们打算怎么管我的钱""跟现在的顾问比有什么不同"。

**不该用的边界：**
- 已签约客户的常态化组合调仓——用 `portfolio-rebalancer`。
- 个税申报代理、具体选股或择时建议——本技能只产出策略框架与配置思路，不替代正式投资决策或税务申报。
- 没有任何客户发现信息（资产、目标、风险偏好）时，先补做发现访谈，勿凭空套模板。

## 步骤

1. **采集客户背景（Prospect Context）**：客户姓名与家庭情况；当前状况（现有顾问？自主管理？为何约谈）；资产（估算 AUM、账户类型、现有持仓）；目标（退休、保值、增长、收入、教育、传承）；风险偏好（保守/稳健/进取，或问卷评分）；约束（ESG 偏好、集中持股、流动性需求）；费用敏感度（现在付多少）；竞争对手（还在考虑谁）。
2. **搭建六段式结构**（见下「指令」），每段控制在建议页数内。
3. **个性化定制**：按客户画像调整语气，针对集中持股、robo-advisor 比价、价格敏感等情形分别应对。
4. **产出三件套**：12-15 页带公司品牌的 PPT 提案、PDF 留存版（leave-behind）、一页式跟进邮件摘要。

## 指令

**六段式建议书结构（括号为建议页数）：**

**I. 公司介绍（About Our Firm，1 页）**：公司概况/历史/AUM；投资理念（用大白话）；与本客户相关的团队简介；客户服务模式（多久见一次、找谁）。

**II. 理解您的需求（Understanding Your Needs，1 页）**：复述客户目标与顾虑——证明你听进去了；发现访谈中识别的关键规划要点；对客户而言"成功"是什么样。

**III. 拟议投资策略（Proposed Strategy，2-3 页）**：推荐资产配置及理由；配置如何映射到目标与风险偏好；投资工具（ETF、共同基金、个券、另类）；税务感知策略（资产摆位 asset location、税务亏损收割）。

配置表：

| 资产类别 | 配置比例 | 投资工具 | 配置理由 |
|---|---|---|---|
|  |  |  |  |

**IV. 预期结果（Expected Outcomes，1-2 页）**：增长情景预测（保守/稳健/乐观）；蒙特卡洛达成目标的概率；收入预测（若以退休/收入为目标）；风险指标（最大回撤、波动率）；与当前组合对比（若已知）。

**V. 费用结构（Fee Structure，1 页）**：顾问费率表（分层则注明）；底层基金费用；总费率（all-in cost）估算；与行业平均对比；价值主张——这笔费用换来什么。

**VI. 落地步骤（Getting Started，1 页）**：开户流程；资产转入时间线；转移计划（若从其他顾问处迁入）；前 90 天预期；所需文件与下一步。

**定制策略：**
- 语气匹配客户类型（企业高管 vs 小企业主 vs 退休人士）。
- 有集中持股头寸 → 正面处理，别回避。
- 客户在拿你和 robo-advisor 比 → 强调规划与关系价值。
- 客户价格敏感 → 先讲总价值与结果，不要一上来谈费用。

## 示例

**配置表填写示例：**

| 资产类别 | 配置比例 | 投资工具 | 配置理由 |
|---|---|---|---|
| 美股大盘 | 35% | 低费率指数 ETF | 长期增长核心 |
| 国际股票 | 15% | 全球除美 ETF | 分散地域风险 |
| 投资级债券 | 30% | 债券基金阶梯 | 稳定与收入 |
| 现金/短债 | 10% | 货币基金 | 流动性缓冲 |
| 另类 | 10% | REITs/私募 | 低相关性 |

**产物：** 12-15 页 PPT 提案（含品牌）、PDF 留存版、一页式跟进邮件摘要。

## 注意事项

- 建议书要**显得个性化、而非模板化**——务必引用客户的具体处境。
- **别过度承诺业绩**——设定现实预期，强调流程而非收益数字。
- **务必附免责声明**（预测为假设性、过往业绩不代表未来等）。
- **转移计划很关键**——客户最怕换顾问带来的中断，把过渡安排讲清楚。
- 提案演示后 **48 小时内**跟进，附建议书与明确的下一步。
- **合规必须在向潜在客户展示前完成审阅**（compliance review）。

## 互见

- related：`portfolio-risk-metrics` —— 「预期结果」段的回撤/波动率/VaR 等风险指标由它计算
- related：`tax-loss-harvesting` —— 「投资策略」段的税务感知策略可引用其收割思路
- combines_with：`portfolio-rebalancer` —— 提案落地后，由它生成首次建仓与后续调仓的交易清单
- combines_with：`portfolio-risk-metrics` —— 组合「策略+风险量化」给出有数据支撑的预期结果

---
本条采编自 anthropics/financial-services（Apache-2.0）。
