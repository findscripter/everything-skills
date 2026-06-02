---
name: pricing-strategy
title: 定价与套餐策略
description: 当需要为 SaaS/订阅/平台产品设计定价、套餐分层与变现策略，或评估涨价时机时使用；做出价值度量选择、Good-Better-Best 分层、价格点测算与定价页方案等可执行产物；不适用于应用内升级弹窗/付费墙文案、单纯的转化率优化或会员留存挽回。触发词：定价、价格、套餐分层、定价分层、免费增值、freemium、免费试用、价值度量、value metric、支付意愿、willingness to pay、Van Westendorp、变现、monetization、涨价、price increase、按席位定价、per seat、定价页、pricing page、年付vs月付。
domain: 商业/growth
triggers: [定价, 价格, 套餐分层, 定价分层, 免费增值, freemium, 免费试用, 价值度量, value metric, 支付意愿, willingness to pay, Van Westendorp, 变现, monetization, 涨价, price increase, 按席位定价, per seat, 定价页, pricing page, 年付vs月付]
tags: [pricing, saas, monetization, packaging, freemium, growth, value-metric]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Van Westendorp, MaxDiff, Good-Better-Best]
requires: []
related: [paywall-upgrade-cro, cro-revenue-advisor, marketing-psychology, cfo-financial-advisor]
combines_with: [paywall-upgrade-cro, competitive-analysis, cfo-financial-advisor]
license: MIT
source: coreyhaines31/marketingskills
source_license: MIT
---
## 何时使用

当用户要确定「该收多少钱」或「套餐怎么搭」时使用，典型场景：

- 为新产品/现有产品制定或重构定价、套餐分层、变现模式
- 选择价值度量（按席位/用量/事务等），设计 Good-Better-Best 分层
- 评估涨价时机与落地策略，或设计/优化定价页结构
- 做支付意愿研究（Van Westendorp、MaxDiff）

不该用的边界：

- 应用内升级弹窗 / 付费墙（paywall）文案与触发逻辑 —— 属另一技能
- 纯转化率优化、A/B 测试执行、定价页文案撰写 —— 见互见
- 取消挽留、续费挽回等收入留存问题 —— 属 churn-prevention

## 步骤

1. 先读上下文：若存在 `.agents/product-marketing.md`（或 `.claude/product-marketing.md`，旧版 `product-marketing-context.md`），先读它，只补问未覆盖的信息。
2. 收集四类背景，缺则发问：
   - 业务：产品类型（SaaS/平台/电商/服务）、现有定价、目标市场（SMB/中端/企业）、GTM 形态（自助/销售驱动/混合）。
   - 价值与竞争：核心价值、客户的替代方案、竞品定价。
   - 现状：转化率、ARPU、流失率、客户对价格的反馈。
   - 目标：优化增长 / 收入 / 利润；上探高端还是下沉。
3. 定三个定价轴：套餐（每档含什么）、价值度量（按什么收费）、价格点（具体金额）。
4. 选价值度量：用判断句「客户用得越多，得到的价值是否越多？」是→好度量，否→价格与价值脱节。
5. 设计 Good-Better-Best 三档并明确差异化维度。
6. 必要时做支付意愿研究确定价格区间，再产出定价页结构。
7. 按检查清单逐项核对后交付。

## 指令

价值定价原则（核心约束）——价格基于交付价值而非服务成本，落在「次优替代方案」与「客户感知价值」之间：

- 客户感知价值 = 天花板
- 次优替代方案 = 差异化地板
- 服务成本 = 仅作下限基线，不是定价依据

常见价值度量对照：

| 度量 | 适用 | 示例 |
|------|------|------|
| 按用户/席位 | 协作工具 | Slack、Notion |
| 按用量 | 消耗波动大 | AWS、Twilio |
| 按功能模块 | 模块化产品 | HubSpot 插件 |
| 按联系人/记录 | CRM、邮件 | Mailchimp |
| 按事务 | 支付、平台 | Stripe |
| 固定费用 | 简单产品 | Basecamp |

三档分层（Good-Better-Best）：

- Good（入门）：核心功能、用量受限、低价
- Better（推荐）：全功能、合理上限、作为锚点价
- Best（高端）：全部+高级功能，约为 Better 的 2-3 倍

差异化维度：功能门控 / 用量上限 / 支持级别（邮件→优先→专属）/ 访问权限（API、SSO、自定义品牌）。

涨价信号——市场：竞品已涨价、客户对价格无反应、「太便宜了」反馈；业务：转化率很高（>40%）、月流失很低（<3%）、单位经济模型强；产品：上次定价后价值显著增加、产品更成熟。

涨价策略：① 老用户保价（新价仅对新客户）② 延迟生效（提前 3-6 个月公告）③ 绑定价值（涨价同时加功能）④ 整体重构套餐。

支付意愿研究——Van Westendorp 四问：太贵（不考虑）/ 太便宜（怀疑质量）/ 偏贵但可考虑 / 划算；分析交点得最优价格区间。MaxDiff：给功能集，问最重要/最不重要，结果指导套餐打包。

定价页要点——首屏：清晰对比表、高亮推荐档、月/年切换、各档主 CTA；常见元素：功能对比、各档适用人群、FAQ、年付折扣提示（17-20%）、退款保证、客户 logo；心理学：锚定（先展示高价）、诱饵效应（中间档最划算）、魅力定价（$49，价值型）vs 整数定价（$50，高端型）。

## 示例

某自助 SaaS：现状转化率 45%、月流失 2%、客户反馈「太便宜」——同时命中三类涨价信号，建议「绑定价值+老用户保价」策略。价值度量选「按席位」（协作型，用得越多价值越高）。三档：Good $19（核心+5 席位上限）/ Better $49 锚点（全功能+SSO，标为推荐）/ Best $129（约 Better 2.6 倍，含专属支持+API）。年付按月价打 8 折（约 17-20% 折扣）展示。

## 注意事项

- 决策前先跑检查清单。设价前：定义目标人群、调研竞品价格、确定价值度量、做支付意愿研究、功能映射到各档。结构上：确定档位数量、清晰差异化、基于研究定价格点、设计年付折扣、规划企业/定制档。
- 切勿用「成本加成」定价，成本只是地板。
- 价值度量必须「难以被钻空子」且易懂，否则会错配收入。
- 涨价务必配合沟通策略，避免老客户流失。

## 互见

- seo-content-writer：定价页/落地页内容与 SEO 协同
- first-principles-thinking：拆解价值与支付意愿的第一性推理

本条采编自 coreyhaines31/marketingskills（MIT）。
