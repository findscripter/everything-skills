---
name: legal-briefing-generator
title: 法务情报简报（日报/专题/应急）
description: 当法务人员需要跨邮件/日历/IM/合同库(CLM)/CRM 抓取法律相关动态、就某法律议题做内部检索、或对突发事件(数据泄露/诉讼威胁/监管问询)快速汇总背景时使用；按 daily/topic/incident 三模式生成结构化简报 .md（紧急项、合同管线、时间线、即时法律考量、建议下一步）；不适用于出具法律意见、正式判例法检索或替代执业律师审阅。触发词：法务日报、晨报、法律简报、专题检索、事件应急、数据泄露、监管问询
domain: 领域/legal
triggers: [法务日报, 法律晨报, 法务简报, 法律简报, 专题简报, 议题检索, 事件应急简报, 突发事件, 数据泄露, 诉讼威胁, 监管问询, daily brief, topic brief, incident brief, legal briefing]
tags: [legal, briefing, daily-brief, topic-research, incident-response, data-breach, compliance, markdown]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [markdown]
requires: []
related: [legal-meeting-briefing, legal-risk-classifier, regulatory-policy-diff, legal-inquiry-responder]
combines_with: [legal-meeting-briefing, legal-risk-classifier, contract-renewal-tracker]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
# 法务情报简报（日报/专题/应急）

> 重要：本技能辅助法务工作流，**不提供法律意见**。简报须由合格法律专业人士审阅后方可据以行动。

## 何时使用

三种模式，无模式时先问用户要哪种：

- **daily（日报）**：开工时需横扫邮件 / 日历 / IM / 合同库(CLM) / CRM 中的法律相关动态，形成一份「今天该知道什么」的晨报。
- **topic（专题）**：就某个具体法律议题（如「员工竞业条款现行做法」）在**内部可用来源**中检索、综合成结构化背景简报。
- **incident（应急）**：突发事件（数据泄露、诉讼威胁、监管问询、IP 争议等）需在最短时间内汇总背景与即时法律考量。

不该用：
- **不出具法律意见 / 不做正式判例法检索**——需要现行法律权威或判例时，引导用户用 Westlaw / Lexis 等法律检索平台或外部律师。
- **不替代律师审阅**——简报是给法务人员的工作底稿，不是定稿结论。
- 源不可用时**不臆造**——明确标注「未检查 / 不可用」的缺口。

## 步骤

按模式路由（`daily | topic <query> | incident`）。每种来源「若已连接」才扫，未连接则计入缺口区。

**daily**：逐一扫描各来源的法律相关项——
- 邮件：新合同/审查请求、合规问题、对手方就在谈交易的回复、法务收件箱紧急项、外部律师沟通、监管/法律更新简讯。
- 日历：今日需法务准备的会议（董事会、交易评审、供应商电话）、本周临近 deadline（合同到期、申报截止、答复期限）、法务团队例会。
- IM：法务频道隔夜消息、@法务的求助、合规/隐私/NDA/条款等关键词提及、升级或紧急请求。
- CLM：待审/待签合同、未来 30 天临近到期、新签生效协议。
- CRM：进入需法务介入阶段的交易、标记需法务审查的新机会。

**topic**：① 接收议题 query；② 跨来源检索——文档（内部备忘、既往分析、playbook、先例）、邮件（既往沟通）、IM（团队讨论）、CLM（相关合同/条款）；③ 综合成结构化简报。

**incident**：① 接收事件描述；② 快速扫全部已连接来源——邮件（事件沟通）、IM（实时讨论与升级）、文档（应急预案、保险条款）、日历（已排应急会）、CLM（受影响合同、赔偿/保险条款）；③ 汇成可执行简报。**速度优先**：用现有信息快速出稿，不等齐全。

## 指令

**输出三种格式（按模式套用）**，统一为 Markdown：

日报 —
```
## 每日法务简报 — [日期]
### 紧急 / 需行动        （按紧迫度排序）
### 合同管线            待你审查 / 待对手方回复 / 临近 deadline（本周）
### 新请求              自上次简报以来收到的审查/NDA/合规请求
### 今日日历            有法务相关性的会议 + 需做什么准备
### 团队动态            法务频道关键消息/更新
### 本周 deadline
### 不可用来源          未连接或报错的来源
```

专题 —
```
## 专题简报：[议题]
### 摘要（2-3 句执行级结论）
### 背景（内部来源中的脉络与历史）
### 现状（基于现有文档的组织立场/做法）
### 关键考量（要素、风险、未决问题）
### 内部先例（既往决策、备忘、立场）
### 缺口（缺失信息 / 未可用来源）
### 建议下一步
```

应急 —
```
## 应急简报：[议题]
**编制时间**：[timestamp]   **定级**：[可判定时的严重度]
### 态势摘要 / ### 时间线（按现有来源时序）
### 即时法律考量（监管通报义务、证据保全义务、特免权顾虑）
### 相关协议（合同、保单、赔偿/保险条款）
### 内部已采取响应 / ### 关键联系人
### 建议立即行动（1. 最紧急 2. … 3. …）
### 信息缺口 / ### 已检查来源
```

**应急专项约束（务必遵守）**：
- 立即标记任何**诉讼证据保全 / litigation hold** 义务（详见 `legal-hold-manager`）。
- 关注**特免权**：如涉律师参与，简报恰当标注「律师-当事人特免 / 工作成果」（`[PRIVILEGED & CONFIDENTIAL — ATTORNEY-CLIENT]`）。
- 涉数据泄露时，**标出适用通报时限**（如 GDPR 72 小时）。
- 事关重大时，建议引入外部律师。

## 示例

```
/brief daily
/brief topic 员工竞业条款现行做法
/brief incident 第三方供应商疑似数据泄露
```

应急简报开头（含定级与特免标注）：
```
## 应急简报：供应商数据泄露
**编制时间**：2026-06-02 09:30   **定级**：高（疑涉个人数据）
[PRIVILEGED & CONFIDENTIAL — ATTORNEY-CLIENT WORK PRODUCT]
### 即时法律考量
- GDPR 第 33 条：自察觉起 72 小时内向监管机构通报（倒计时已起算）。
- 已触发证据保全义务 → 见 legal-hold-manager。
```

## 注意事项

- 来源不可用时**显著标注缺口**，让用户清楚哪些没查。
- 日报应**随用户偏好迭代**（记住其觉得有用 / 想过滤的内容）。
- 简报须**可执行**：每一项都给出明确下一步或入选理由。
- **保持精简**：链接到原始材料，而非整段复述。
- 全程不构成法律意见；最终判断与据以行动前，须经执业律师审阅。

## 互见

- related：`legal-risk-classifier` —— 对简报中识别出的事项做法律风险定级。
- related：`litigation-chronology-builder` —— 应急/诉讼简报的时间线可下钻为正式案件时序。
- related：`diligence-issue-extractor`、`privilege-log-reviewer` —— 专题检索与特免标注的配套。
- combines_with：`legal-hold-manager` —— 应急简报标记保全义务后，由其签发/管理证据保全通知。

---

本条采编自 anthropics/knowledge-work-plugins（Apache-2.0）。
