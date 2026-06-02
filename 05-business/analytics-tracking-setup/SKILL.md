---
name: analytics-tracking-setup
title: 分析埋点与转化追踪
description: 当需要从零搭建/审计/调试 GA4、GTM 埋点与转化追踪时使用；做事件分类法设计、GA4+GTM 实现、转化与跨域/UTM 配置及数据质量校验，产出追踪计划、容器结构与修复清单；不适用于营销活动数据分析（用 campaign-analytics）或产品内 BI 看板（用 product-analytics）。触发词：GA4 搭建、Google Tag Manager/GTM、埋点、转化追踪、事件分类法、UTM、埋点审计
domain: 商业/marketing
triggers: [GA4 搭建, Google Tag Manager, GTM 配置, 埋点, 事件追踪, 转化追踪, 追踪计划, 事件分类法, 自定义维度, UTM 追踪, 埋点审计, 事件丢失, 跨域追踪, 同意模式]
tags: [marketing, analytics, GA4, GTM, conversion-tracking, event-taxonomy, data-quality, 商业]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [GA4, Google Tag Manager, gtag.js, dataLayer, Google Ads, Meta Pixel / CAPI, Consent Mode v2, GTM Preview, GA4 DebugView]
requires: []
related: [marketing-analytics-tracker, campaign-attribution-analytics, ab-test-designer, conversion-rate-optimizer]
combines_with: [campaign-attribution-analytics, ab-test-designer, conversion-rate-optimizer]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

适用于以下场景：
- **从零搭建**：还没有分析体系，需要建立追踪计划、实现 GA4 与 GTM、定义事件分类法、配置转化。
- **审计存量埋点**：埋点已存在但数据不可信、覆盖不全，或要新增目标。审查现状、补缺、清理重复。
- **调试埋点问题**：特定事件丢失、转化数对不上，或 GTM Preview 显示事件已触发但 GA4 未记录。

**不该用边界**：
- 分析营销活动表现、渠道 ROI → 用 `campaign-analytics`（本技能只管「埋点搭建」，不做报表）。
- 产品内事件分析、BI 看板 → 用 `product-analytics`。
- GDPR 完整合规框架 → 用 `gdpr-dsgvo-expert`（本技能只覆盖同意模式的实现）。

核心原则：**坏埋点比没埋点更糟**。重复事件、缺失参数、未授权数据、断裂的转化，会让决策建立在错误数据上。要么第一次就做对，要么找出问题并修复。

## 步骤

### 1. 开工前先收集上下文
若存在 `marketing-context.md`，先读它，只补问缺失项。需明确：
- **现状**：是否已有 GA4/GTM？哪里坏了或缺了？技术栈（React SPA / Next.js / WordPress / 自研）？是否有 CMP（同意管理平台），用的哪个？当前已追踪哪些事件？
- **业务**：主转化动作（注册、购买、留资、试用开通）？关键微转化（定价页浏览、功能发现、Demo 申请）？是否投放付费广告（Google Ads / Meta / LinkedIn，影响转化追踪需求）？
- **目标**：从零建 / 审计 / 调试某个具体问题？是否需要跨域追踪、多 property/子域？是否需要服务端打标（GDPR 敏感市场、性能）？

### 2. 先定事件分类法（动 GA4/GTM 之前）
分类法返工极其痛苦，必须先定好。
- **命名规范**：`object_action`（snake_case，动词在后）。正例 `form_submit`、`plan_selected`、`video_started`、`checkout_completed`；反例 `submitForm`、`FormSubmitted`、`form-submit`、`PlanClick`。
- **规则**：始终 `名词_动词` 而非动词在前；全小写 + 下划线，禁 camelCase、禁连字符；具体到无歧义但不啰嗦；时态一致（统一 `_started` / `_completed` / `_failed`）。
- **标准参数**（适用即带）：`page_location`、`page_title`（GA4 自动采集）、`user_id`（关联 CRM/DB）、`plan_name`、`value`（收入/订单额）、`currency`（与 value 必须配对）、`content_group`、`method`。
- **SaaS 核心漏斗事件**：`signup_started` / `signup_completed` / `trial_started` / `onboarding_step_completed`(step_name, step_number) / `feature_activated`(feature_name) / `plan_selected`(plan_name, billing_period) / `checkout_started`(value, currency, plan_name) / `checkout_completed`(value, currency, transaction_id) / `subscription_cancelled`(cancel_reason, plan_name)。
- **微转化事件**：`pricing_viewed`、`demo_requested`(source)、`form_submitted`(form_name, form_location)、`content_downloaded`、`video_started` / `video_completed`、`chat_opened`、`help_article_viewed`。

### 3. 配置 GA4
- **数据流**：GA4 → 管理 → 创建 property → 添加网站数据流（填域名）。
- **增强衡量**：先全开再复核。保留页面浏览、滚动、出站点击、站内搜索；若打算手动追踪视频，**关闭视频互动**避免重复；若用 GTM 追踪下载以获取更好参数，**关闭文件下载**。
- **域名**：把漏斗涉及的所有子域加入配置。
- **转化标记**：GA4 → 管理 → 转化，标记 `signup_completed`、`checkout_completed`、`demo_requested`、`trial_started`。规则：每 property **最多 30 个转化事件**，要精选；转化是**追溯生效**的（开启即应用近 6 个月历史）；除非要为微转化优化广告，否则别把微转化标为转化。

### 4. 配置 GTM
容器结构：Tags（GA4 Configuration 全页触发 / 每事件一个 GA4 Event 标签 / Google Ads 转化 / Meta Pixel）、Triggers（All Pages / DOM Ready / Data Layer Event / Custom Element Click）、Variables（dlv 数据层变量 / Measurement ID 常量 / JS 变量）。
- **模式 1（最可靠）：dataLayer Push**。应用推送到 dataLayer → GTM 拾取 → 发往 GA4。
- **模式 2：CSS 选择器点击**。用于无应用层钩子的 UI 元素，触发器用 `Click - All Elements` + 匹配 CSS 选择器（如 `[data-track="demo-cta"]`）。

### 5. 平台转化追踪
- **Google Ads**：建转化动作 → **导入 GA4 转化**（推荐，单一数据源）；归因模型 月转化 >50 用「数据驱动」，否则「最终点击」；转化窗口 留资 30 天、高决策成本购买 90 天。
- **Meta Pixel**：经 GTM 装基础码；标准事件 `PageView` / `Lead` / `CompleteRegistration` / `Purchase`；**强烈建议上 Conversions API（CAPI）**，纯客户端 pixel 因广告拦截和 iOS 会丢约 30% 转化；CAPI 需服务端实现。

### 6. 跨平台与跨域
- **UTM 规范**：`utm_source` 平台名小写、`utm_medium` 流量类型（cpc/email/social/organic）、`utm_campaign` 活动 ID、`utm_content` 创意变体、`utm_term` 付费关键词。**绝不给自然/直接流量打 UTM**，UTM 会覆盖 GA4 自动来源归因。
- **归因窗口**：GA4 30 天（按销售周期可 30–90）；Google Ads 试用 30 / 企业 90；Meta 仅 7 天点击；LinkedIn 30 天。
- **跨域**（如 `acme.com` → `app.acme.com`）：① GA4 数据流 → 配置标签 → 排除自我推荐里加两个域；② GTM 的 GA4 Configuration 标签 → 跨域衡量加两个域；③ 测试：访问 A 域点链接到 B 域，看 GA4 DebugView，**会话不应重启**。

### 7. 数据质量校验
- **去重**：事件触发两次的常见原因——GTM 标签与硬编码 gtag 同时触发；增强衡量与自定义 GTM 标签追同一事件；SPA 路由每次切换发 pageview 又叠 GTM 页面浏览标签。用 GTM Preview 查双触发，DevTools Network 查重复命中。
- **机器人过滤**：GA4 自动过滤已知 bot；内部流量在 GA4 → 管理 → 数据过滤器 → 内部流量，加办公室/开发者 IP，从测试模式**激活**。
- **同意管理**：GDPR/ePrivacy 下分析可能需授权。**高级同意模式（Advanced Consent Mode）** 对拒绝 cookie 的访客提供建模数据（推荐，经 GTM + CMP 如 Cookiebot/OneTrust/Usercentrics 集成）；无同意模式或基础同意模式则拒绝者零数据。预期同意率：EU 60–75%，US 85–95%。

## 指令

主动巡检，不等用户问就上报以下信号：
- **事件每次页面加载都触发** → 触发器配错，标记数据膨胀风险。
- **未传 user_id** → 无法关联 CRM、无法做队列分析，标记修复。
- **GA4 与 Ads 转化对不上** → 归因窗口不一致或 pixel 重复，标记审计。
- **EU 市场未配同意模式** → 法律风险 + 数据低报，立即标记。
- **页面全显示 `/(not set)` 或通用路径** → SPA 路由未处理，GA4 记错页面。
- **付费活动来源显示为 direct** → UTM 缺失或被剥离，归因已断。

沟通遵循：**结论先行**（先说坏在哪/要建什么，再讲方法）；每条发现含 What + Why + How；行动有责任人和截止时间；置信度标记 🟢 已验证 / 🟡 估算 / 🔴 假设。

## 示例

**输入**：「帮我搭建追踪计划。」
**产出**：事件分类法表（事件 + 参数 + 触发条件）、GA4 配置清单、GTM 容器结构。

**经 gtag 上报自定义事件：**
```javascript
gtag('event', 'signup_completed', {
  method: 'email',
  user_id: 'usr_abc123',
  plan_name: 'trial'
});
```

**经 GTM dataLayer 上报（首选）：**
```javascript
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  event: 'signup_completed',
  signup_method: 'email',
  user_id: userId,
  plan_name: 'trial'
});
```
对应 GTM：GA4 Event 标签，Event Name 取 `{{DLV - event}}`，参数映射 `signup_method`/`user_id`/`plan_name` 到对应 dlv，触发器为 Custom Event `signup_completed`。

**其他请求 → 产出对应物**：审计埋点 → 对标 SaaS 标准漏斗的缺口分析 + 数据质量评分（0–100）+ 优先级修复清单；调试丢失事件 → 用 GTM Preview + GA4 DebugView + Network 的结构化排查步骤；配置转化 → GA4 + Google Ads + Meta 三端转化动作配置。

## 注意事项

- 分类法是地基，**动 GA4/GTM 前必须先定好**，返工成本极高。
- 转化标记在 GA4 中**追溯生效**且上限 30 个，谨慎精选。
- `value` 与 `currency` 必须成对出现，否则收入无法计算。
- 自然/直接流量**禁打 UTM**，否则覆盖自动归因、污染渠道数据。
- 客户端 Meta pixel 会丢约 30% 转化，跑 Meta 广告务必上 CAPI。
- 增强衡量与手动/GTM 追踪同事件时二选一，避免重复计数。
- SPA 必须手动处理路由级 pageview，否则页面归集错误。

## 互见

- `campaign-analytics`：营销表现与渠道 ROI 分析（本技能只管搭建，不做报表/看板）。
- `product-analytics`：产品内事件分析与 BI 看板。
- `ab-test-setup`：实验设计（本技能产出的事件可喂给 A/B 测试）。
- `gdpr-dsgvo-expert`：完整 GDPR 合规框架（本技能只覆盖同意模式实现）。
- 源技能附带的参考资料可下钻：`references/event-taxonomy-guide.md`（完整分类法目录与自定义维度建议）、`references/gtm-patterns.md`（GTM 配置模板）、`references/debugging-playbook.md`（调试手册）、`scripts/tracking_plan_generator.py`（追踪计划生成脚本）。

---
采编自 alirezarezvani/claude-skills（MIT）。
