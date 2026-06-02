---
name: saas-marketing-ideas
title: SaaS 营销策略评分
description: 当为 SaaS / 软件产品挑选营销与增长策略，需要在众多想法中决定先做什么时使用；做基于「营销可行性评分（MFS）」的策略筛选、打分与优先级排序，输出 Top 3-5 可执行建议；不适用于品牌创意撰写、广告投放执行或数据分析本身；触发词：营销想法、增长策略、SaaS marketing、growth ideas、营销优先级、可行性评分、MFS、获客策略
domain: 商业/growth
triggers: [营销想法, 增长策略, SaaS marketing, growth ideas, 营销优先级, 可行性评分, MFS, 获客策略]
tags: [marketing, growth, saas, prioritization, scoring, strategy]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [free-tool-marketing-strategy, cmo-marketing-advisor, content-marketing-strategist, referral-program-designer]
combines_with: [content-strategy-planner, paid-ads-strategist, product-launch-strategy]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

当用户为 SaaS 或软件产品寻求营销/增长想法，且真正的痛点是「想法太多、不知道先做哪个」时使用本技能。核心价值不是头脑风暴堆想法，而是充当决策过滤器：从约束出发，对候选想法打分、排序，明确「现在做 / 推迟 / 直接放弃」。

不该用的边界：
- 需要具体撰写品牌文案、Slogan、广告创意 → 不适用（本技能只做策略选型，不产出成品文案）。
- 需要执行投放、埋点、A/B 实验或解读真实数据 → 不适用，本技能只给方向和成功指标，不替代环境内的验证与测试。
- 缺少产品类型、阶段、预算等关键输入时，先停下来问清楚，不要凭空打分。

## 步骤

1. 先建立上下文（缺失就主动询问）：产品类型与 ICP（理想客户画像）、阶段（pre-launch / early / growth / scale）、预算与团队约束、首要目标（流量 / 线索 / 收入 / 留存）。
2. 收窄候选：列出 6-10 个潜在相关想法，剔除明显不匹配约束的。
3. 用 MFS 打分：对每个候选套用「营销可行性评分」，只保留得分最高的 3-5 个。
4. 落地化：给出首步动作、成功指标、执行风险。

铁律：不要倾倒长清单（No idea dumping），不给未打分的建议（No unscored recommendations），单次推荐不超过 5 个，优先「高信号、低投入」的快速验证。

## 指令

营销可行性评分 MFS：从 5 个维度各打 1-5 分。

| 维度 | 评判问题 | 方向 |
| --- | --- | --- |
| Impact 影响 | 若成功，收益有多大 | 越高越好 |
| Fit 契合 | 与产品/ICP/阶段匹配度 | 越高越好 |
| Speed 见效速度 | 多快能知道是否有效 | 越快越好 |
| Effort 投入 | 执行的时间/复杂度 | 越低越好（反向） |
| Cost 成本 | 有意义地测试需多少现金 | 越低越好（反向） |

计算公式（取值范围 -7 → +13）：

```
MFS = (Impact + Fit + Speed) − (Effort + Cost)
```

结果解读与动作：

| MFS | 含义 | 动作 |
| --- | --- | --- |
| 10–13 | 极高杠杆 | 立即做 |
| 7–9 | 强机会 | 优先做 |
| 4–6 | 可行但看情况 | 选择性测试 |
| 1–3 | 边际收益 | 推迟 |
| ≤ 0 | 不契合 | 不推荐 |

按阶段调整打分偏好：pre-launch 偏 Speed > Impact、Fit > Scale（候补名单、抢先体验、内容、社群）；early 偏 Speed + 成本敏感（SEO、创始人亲自分发、竞品对比）；growth 偏 Impact > Speed（付费获客、合作、PLG 闭环）；scale 偏 Impact + 防御性（品牌、国际化、收购）。

输出每个想法时固定结构：标题 / MFS 分数与档位 / 为什么契合 / 如何起步（编号步骤）/ 预期产出 / 所需资源 / 主要风险。

## 示例

候选：Programmatic SEO（早期 SaaS）。打分 Impact=5、Fit=4、Speed=2、Effort=4、Cost=3。

```
MFS = (5 + 4 + 2) − (4 + 3) = 4
```

落入 4-6 档：可行但非短期赢点，建议在拿下快速赢点后再优先推进。输出示意：

- 想法：Programmatic SEO，MFS `+4`（可行，快速赢点之后再优先）
- 为什么契合：关键词面广、结构可复用、流量长期复利
- 如何起步：1) 锁定一个可规模化的关键词模式；2) 手工搭 5-10 个模板页；3) 先验证曝光量再放大
- 预期产出：3-6 个月内获得稳定的非品牌流量
- 所需资源：SEO 能力、内容模板、工程支持
- 主要风险：反馈周期慢、前期内容投入大

## 注意事项

- 永远给出 MFS 分数；MFS ≤ 0 的想法绝不推荐。
- 单次最多推荐 5 个；优先排「高信号、低投入」的测试。
- 不为新奇而新奇（No novelty for novelty's sake），偏向有复利效应的渠道，优化「决策清晰度」而非创意数量。
- 产出是方向性建议，不能替代真实数据验证与专家评审。

## 互见

- seo-content-writer：当某个想法落到 Programmatic SEO / 内容规模化时，用它产出可落地的 SEO 内容。

本条采编自 sickn33/antigravity-awesome-skills（MIT）。
