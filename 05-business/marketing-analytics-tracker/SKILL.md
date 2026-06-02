---
name: marketing-analytics-tracker
title: 营销分析追踪方案
description: 当需要搭建、改进或审计营销与产品的数据追踪（GA4、GTM、事件埋点、转化追踪、UTM、归因）时使用；产出追踪计划、事件命名规范、GA4/GTM 埋点代码、UTM 规范与校验清单；不适用于 A/B 实验本身的统计显著性判定与实验设计、也不做后端数据仓库建模。触发词：analytics、tracking、埋点、GA4、Google Analytics、GTM、tag manager、conversion tracking、转化追踪、event tracking、事件追踪、UTM、attribution、归因、Mixpanel、Segment、tracking plan、追踪计划、埋点没生效
domain: 商业/growth
triggers: [analytics, tracking, 埋点, GA4, Google Analytics, GTM, tag manager, conversion tracking, 转化追踪, event tracking, 事件追踪, UTM, attribution, 归因, Mixpanel, Segment, tracking plan, 追踪计划, 埋点没生效]
tags: [analytics, tracking, ga4, gtm, utm, conversion, attribution, marketing, growth, event-tracking]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [GA4, Google Tag Manager, gtag.js, Mixpanel, Segment, Amplitude, PostHog, GA4 DebugView, GTM Preview Mode]
requires: []
related: [analytics-tracking-setup, campaign-attribution-analytics, ab-test-designer, social-media-performance-analyzer]
combines_with: [campaign-attribution-analytics, ab-test-designer, data-storyteller]
license: MIT
source: coreyhaines31/marketingskills
source_license: MIT
---
## 何时使用

- 需要从零搭建、改进或审计营销/产品的数据追踪：GA4、GTM、事件埋点、转化追踪、UTM、归因。
- 有人问「这东西到底有没有生效 / 怎么衡量这个结果」时，先用本方案把问题倒推成可追踪的事件。
- 工具排查：「事件为什么没上报」「数值对不上」「转化没记录」。

不该用的边界：
- A/B 实验的设计与统计显著性判定，属于实验类技能，不在本条范围。
- 后端数据仓库建模、用户级 ETL/明细查询，本条只覆盖埋点采集与基础校验。
- 涉及 PII 合规细则的法律判断，本条只给工程实现层面的隐私约束。

开工前先确认三件事，缺什么问什么，不要全套追问：
1. 业务上下文：这份数据要支撑什么决策？关键转化是什么？
2. 现状：已有哪些埋点、在用哪些工具？
3. 技术上下文：技术栈是什么？有无隐私/合规要求（EU/UK/CA 同意）？

## 步骤

1. 先列问题再列事件：写下要回答的业务问题和将据此采取的行动，反推需要追踪什么。只追踪能驱动决策的事件，拒绝虚荣指标，质量优先于数量。
2. 制定追踪计划（Tracking Plan）：用 `事件名 | 分类 | 属性 | 触发时机 | 备注` 的表结构，覆盖四类事件——页面浏览、用户行为（点击/表单/功能使用）、系统事件（注册/购买/订阅变更）、自定义转化（目标完成/漏斗阶段）。
3. 统一命名：事件名采用「对象_动作」格式，小写加下划线，具体到位（用 `cta_hero_clicked` 而非 `button_clicked`），上下文放属性而非事件名里，避免空格和特殊字符。
4. 设计属性：标准属性分页面（page_title/page_location/page_referrer）、用户（user_id/user_type/account_id/plan_type）、活动（source/medium/campaign/content/term）、产品（product_id/price 等）；属性名保持一致，不重复自动采集项，不放 PII。
5. 落地 GA4：建 property 与数据流 → 安装 gtag.js 或 GTM → 开启增强衡量 → 配置自定义事件 → 在 Admin 标记转化。
6. 用 GTM 解耦：容器由 Tags（执行代码）、Triggers（触发时机）、Variables（动态值）组成，通过 dataLayer 推送事件，便于非开发改动。
7. 规范 UTM：source/medium/campaign/content/term 全小写、分隔符统一、具体但简洁（`blog_footer_cta` 而非 `cta1`），所有 UTM 登记到同一张表。
8. 校验：用 GA4 DebugView、GTM Preview、Tag Assistant 跑校验清单，确认事件触发、属性取值、无重复、跨端可用、转化记录、无 PII 泄漏。
9. 处理隐私：EU/UK/CA 需 Cookie 同意，使用 consent mode 等同意后再采集，开启 IP 匿名化，最小化采集，接入同意管理平台。

## 指令

- 事件命名固定「对象_动作」，小写下划线，禁止空格/特殊字符；上下文进属性。
- 任何属性禁止包含 PII；不重复 GA4/GTM 自动属性。
- 每个事件必须能映射到一个决策，否则不追踪。
- UTM 全小写、分隔符全程统一、集中登记。
- 上线前必须过校验清单，至少确认：触发正确、属性正确、无重复、转化记录、无 PII。

## 示例

GA4 自定义事件（gtag.js）：

```javascript
gtag('event', 'signup_completed', {
  'method': 'email',
  'plan': 'free'
});
```

GTM dataLayer 推送：

```javascript
dataLayer.push({
  'event': 'form_submitted',
  'form_name': 'contact',
  'form_location': 'footer'
});
```

追踪计划文档骨架（输出物）：

```markdown
# [站点/产品] 追踪计划
## 概览
- 工具：GA4、GTM
- 最近更新：[日期]
## 事件
| 事件名 | 说明 | 属性 | 触发时机 |
|--------|------|------|----------|
| signup_completed | 用户完成注册 | method, plan | 成功页 |
## 自定义维度
| 名称 | 作用域 | 参数 |
|------|--------|------|
| user_type | User | user_type |
## 转化
| 转化 | 事件 | 计数方式 |
|------|------|----------|
| 注册 | signup_completed | 每会话一次 |
```

## 注意事项

- 常见排查对照：事件不上报→检查 Trigger 配置与 GTM 是否加载；数值错误→检查 Variable 路径与 dataLayer 结构；事件重复→检查是否多容器或触发器触发两次。
- 别落入虚荣指标，追踪服务于决策而非堆数据。
- 命名规范先定后埋，约定一旦混乱后期清洗成本极高。
- 隐私默认从严：未同意不采集，属性里宁缺勿放 PII。
- 工具选型参考：GA4（Web 分析/Google 生态）、Mixpanel/Amplitude（产品分析与留存/同期群）、PostHog（开源+会话回放）、Segment（CDP 数据分发）。

## 互见

- seo-content-writer：自然流量内容产出与衡量，配合本条做来源分析。
- sql-query-builder：当采集后的事件数据落入仓库，需要进一步查询分析时使用。

本条采编自 coreyhaines31/marketingskills（MIT）。
