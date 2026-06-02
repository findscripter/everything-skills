---
name: ai-customer-support
title: AI 客户支持与情感分析
description: 当需要用 AI 自动化做客户支持时使用；产出对话机器人流程、工单路由/SLA 升级规则、情感分析与 CSAT/NPS 监控、全渠道与知识库自助方案；不适用于无 AI/自动化诉求的纯人工话术或与客服无关的任务；触发词：客户支持、客服机器人、情感分析、工单路由、CSAT、全渠道
domain: 商业/growth
triggers: [客户支持, 客服机器人, 情感分析, 工单路由, SLA 升级, CSAT, NPS, 全渠道客服, 知识库自助, Intercom, Zendesk, 客户流失预警]
tags: [客户支持, 对话式AI, 情感分析, 工单自动化, 全渠道, CSAT, NPS, 知识库, 电商客服, 客户体验]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [对话式AI平台(Intercom Fin/Zendesk AI/Freshdesk Freddy), 工单系统(Zendesk/Freshdesk/Gorgias), CRM(Salesforce/HubSpot), 情感分析/NLP, 分析平台(Mixpanel/Amplitude), 电商平台(Shopify/WooCommerce)]
requires: []
related: [churn-prevention, customer-health-scorer, customer-research-synthesizer, billing-automation-systems]
combines_with: [churn-prevention, customer-research-synthesizer, customer-health-scorer]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

当你要用 AI 与自动化提升客户支持体验时使用，典型场景：

- 设计对话机器人/IVR 流程，处理订单查询、退换货、技术排障等高频问题。
- 搭建智能工单路由、自动分类打标、SLA 监控与自动升级。
- 引入情感分析做实时情绪监控、负面预警与主动外联。
- 建设知识库自助、动态 FAQ、决策树排障，提升自助解决率。
- 打通邮件/在线聊天/社媒/电话的全渠道，保持上下文连续。
- 跟踪 CSAT、NPS、CES，做客户旅程摩擦点分析与流失预警。

不该用（负边界）：

- 任务与客户支持无关（如纯营销文案、后端架构）。
- 仅需一两句人工回复话术、无任何自动化/AI 系统设计诉求。
- 涉及落地环境的真实联调、合规审查或上线验证——本技能产出方案，不替代环境内测试与专家评审。

## 步骤

1. 明确目标、约束与必备输入：渠道范围、现有工具栈（Zendesk/Intercom/Shopify 等）、目标指标（解决时长、CSAT）。
2. 共情理解问题，结合客户历史与交互模式分析上下文。
3. 基于可用工具与知识资源选定方案，给出可执行的分步设计与话术/流程。
4. 设计验证与跟进机制：满意度回访、解决确认、知识沉淀。
5. 配置度量与持续优化：用交互数据迭代流程，必要时按规则升级到专家/技术团队。

## 指令

- 先澄清目标、约束与必备输入，缺少成功标准/权限/安全边界时停下来追问。
- 应用相关最佳实践并验证产出，给出可操作步骤与验证方法。
- 共情优先、数据驱动；语言去术语化，确保客户「被听见」。
- 工单要素：智能路由 + 自动分类打标 + SLA 自动升级与通知 + 与 CRM 打通客户上下文。
- 全渠道核心约束：跨渠道切换时保持上下文不丢失。
- 关键指标体系：CSAT、NPS、CES、单次接触成本、流失预测。
- 升级原则：超出自助/一线能力的问题，按既定 workflow 升级到技术/产品团队。

## 示例

- 「为电商订单状态查询设计一套 AI 机器人对话流。」
- 「为高价值客户问题设计升级（escalation）工作流。」
- 「实现情感分析，用于主动客户外联与负面情绪预警。」
- 「搭建多语言客服策略，支持实时翻译覆盖全球客户。」
- 「设计 CSAT/NPS 满意度度量与改进框架。」
- 「制定知识库文章优化策略，提升帮助中心可发现性。」

## 注意事项

- 共情第一，但所有优化以可衡量的满意度提升为准绳。
- 自动化不等于无人化：保留清晰的人工接管与无缝交接路径。
- 遵守隐私法规与客户数据保护，注意可访问性与包容性设计。
- 产出仅在明确匹配本技能范围时使用；不可替代环境内验证与专家评审；输入/权限/安全边界缺失时先追问再动手。

## 互见

- 知识库内的 NLP/对话式 AI、CRM 集成、客户体验分析类技能。
- 电商订单/退款流程、流失预测与客户成功（retention）相关技能。

---

采编自 sickn33/antigravity-awesome-skills（MIT）。
