---
name: user-onboarding-optimizer
title: 用户激活与引导优化
description: 当用户注册后激活率低、引导流程或首次体验需优化、需缩短 time-to-value 时使用；产出激活定义、引导流程设计、漏斗诊断与实验清单；不适用于注册/落地页转化或独立的邮件培育序列；触发词：onboarding、用户激活、activation rate、首次体验、first-run、aha moment、引导流程、激活漏斗、time-to-value、空状态、引导清单
domain: 商业/growth
triggers: [onboarding, 用户激活, activation rate, 激活率, 首次体验, first-run, aha moment, 引导流程, 激活漏斗, time-to-value, 空状态, 引导清单, 用户注册了不用, 新用户激活]
tags: [growth, onboarding, activation, retention, conversion, product-marketing, ab-testing, funnel]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [A/B testing, funnel analysis, cohort analysis, Navattic, Storylane]
requires: []
related: [signup-flow-cro, lifecycle-email-sequence, churn-prevention, paywall-upgrade-cro]
combines_with: [lifecycle-email-sequence, signup-flow-cro, churn-prevention]
license: MIT
source: coreyhaines31/marketingskills
source_license: MIT
---
## 何时使用

当用户**注册后留不下来**——签约/注册了却不上手、激活率低、没人完成初始设置、首次体验（first-run）混乱、time-to-value 过长时使用本技能。典型诉求：定义激活事件（aha moment）、设计引导流程、诊断激活漏斗掉点、规划引导邮件与实验。

**不该用的边界：**
- 注册/落地页本身的转化优化 → 见 seo-content-writer 等内容侧，或源技能的 signup（本大典未收录）。
- 独立的长期邮件培育序列 → 属 emails 范畴（本大典未收录）；本技能只覆盖与引导强耦合的触发邮件。
- 付费转化/paywall、纯 A/B 实验执行 → 不在本技能。

## 步骤

1. **先读上下文再提问**：若仓库存在 `.agents/product-marketing.md`（或 `.claude/product-marketing.md`、旧版 `product-marketing-context.md`），先读取，只问其中未覆盖的信息。
2. **澄清三要素**：产品类型（B2B/B2C、核心价值主张）、激活定义（哪个动作代表用户"懂了"）、现状（注册后发生什么、在哪掉点）。
3. **定义 aha moment**：找与留存相关性最强的早期动作——留存用户做了而流失用户没做的事。
4. **设计引导流程**：从三种首屏策略中选型，配引导清单 / 空状态 / 引导浮层。
5. **规划多渠道**：In-App 动作为主，触发邮件做强化而非重复。
6. **做漏斗分析**：逐步标注掉点占比，定位最大掉点优先攻坚。
7. **输出审计与方案**，并按需给出实验清单。

## 指令

**核心原则（贯穿全程）：**
- **Time-to-Value 至上**：砍掉注册与体验核心价值之间的每一步。
- **一次会话一个目标**：首会话只追求一个成功结果，高级功能延后。
- **做，而非看**：交互式 > 教程；做这件事 > 学习这件事。
- **进度产生动力**：展示推进、庆祝完成、让路径可见。

**首屏策略选型：**

| 策略 | 适合 | 风险 |
|------|------|------|
| 产品优先（Product-first） | 简单产品 / B2C / 移动 | 空白页过载 |
| 引导设置（Guided setup） | 需个性化的产品 | 价值前加摩擦 |
| 价值优先（Value-first） | 有 demo 数据的产品 | 可能"不真实" |

无论选哪种：单一明确的下一步、无死胡同、多步则显示进度。

**引导清单（Onboarding Checklist）：** 3-7 项、按价值排序（高影响在前、先给 quick win）、带进度条/完成百分比、完成时庆祝、提供可关闭选项（别困住用户）。适用于多步设置、功能较多、自助型 B2B。

**空状态（Empty States）= 引导机会而非死胡同：** 说明区域用途、展示有数据时的样子、给清晰主操作、可选预填示例数据。

**引导浮层/导览：** 用于复杂 UI、不自明的功能；每段导览 ≤3-5 步、随时可关、老用户不重复。

**触发邮件：** 欢迎（即时）、引导未完成（24h / 72h）、激活达成（庆祝+下一步）、功能发现（第 3/7/14 天）。邮件应强化 In-App 动作、用具体 CTA 拉回产品、基于已发生动作个性化。

**停滞用户（Stalled）召回：** 先定义"停滞"标准（X 天未活跃 / 设置未完成）；再用邮件序列（提醒价值、解除障碍、提供帮助）、In-App 恢复（欢迎回来、断点续作）、高价值账户人工触达。

**关键指标：**

| 指标 | 含义 |
|------|------|
| 激活率 | 到达激活事件的占比 |
| 激活时长 | 到首次价值耗时 |
| 引导完成率 | 完成设置的占比 |
| Day 1/7/30 留存 | 按时间窗口的回访率 |

## 示例

**漏斗分析（标注掉点，定位最大跌幅）：**
```
注册 → 步骤1 → 步骤2 → 激活 → 留存
100%   80%     60%     40%     25%
```
上例最大跌幅在"步骤1→步骤2"（-20pt）与"步骤2→激活"（-20pt），优先攻坚。

**按产品类型的典型路径：**

| 产品类型 | 关键步骤 |
|----------|----------|
| B2B SaaS | 设置向导 → 首个价值动作 → 邀请团队 → 深度配置 |
| 平台/市场 | 完善资料 → 浏览 → 首笔交易 → 复购循环 |
| 移动 App | 权限 → quick win → 推送设置 → 习惯循环 |
| 内容平台 | 关注/定制 → 消费 → 创作 → 互动 |

**aha moment 举例：** 项目管理=建首个项目+加成员；分析工具=装埋点+看到首份报告；设计工具=建首个设计+导出/分享；市场=完成首笔交易。

**输出格式：**
- *引导审计*：每个问题按「发现 → 影响 → 建议 → 优先级」。
- *引导流程方案*：激活目标、分步流程、清单项、空状态文案、邮件触发器、指标计划。

## 注意事项

- **先调研后动手**：缺少激活定义与漏斗数据时，先索要"成功 vs 流失用户的 cohort 分析"，否则建议无据。
- **清单别超 7 项**，导览别超 5 步——过载比缺失更伤激活。
- **空状态不留死胡同**，每屏都要有明确单一下一步。
- **邮件强化、不复制** In-App 动作；老用户不重复导览。
- **实验维度**（按需展开）：流程精简（步数/排序/必填项/跳过）、进度与动机机制（进度条/起点设 20% 而非 0%/庆祝/游戏化）、个性化（按角色/目标/行业分路径）、quick win 与帮助可得性、邮件与多渠道、停滞召回。每个实验都测：激活率、激活时长、各步完成率、掉点、回访率、Day 1/7/30 留存。

## 互见

无（本大典暂无与"用户激活/引导"强相关的已收录技能；源技能关联的 signup、emails、paywalls、ab-testing 尚未收录，故 related 留空）。

---
本条采编自 coreyhaines31/marketingskills（MIT）。
