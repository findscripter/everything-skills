---
name: activity-digest-generator
title: 活动动态摘要生成
description: 当离岗回归补进度、开工想看待办与提及、或回顾一周决策与文档变更时使用；做扫描各连接源近期活动、按主题/项目聚合并按「行动项→决策→主题→提及→文档变更」结构产出日报/周报式摘要；不适用于实时事件流监听、单源深度检索或正式复盘报告；触发词：日报、周报、动态摘要、digest、catch up、离岗回归、待办汇总
domain: 协作/knowledge
triggers: [日报, 周报, 动态摘要, 活动摘要, digest, catch up, 离岗回归, 待办汇总, 提及汇总, 本周决策, daily digest, weekly digest]
tags: [digest, activity-summary, action-items, cross-source, mcp, catch-up]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [chat, email, cloud-storage, project-tracker, crm, knowledge-base]
requires: []
related: [status-report-generator, stakeholder-update-writer, multi-source-knowledge-synthesis, meeting-transcript-analyzer]
combines_with: [status-report-generator, stakeholder-update-writer]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
## 何时使用

当需要在**多个连接源之间扫描近期活动并产出一份结构化摘要**时使用。三种典型触发：

- **离岗回归补进度**：休假/出差后想快速知道错过了什么。
- **每日开工**：想看一眼今天的提及、待办和需要回应的问题。
- **每周回顾**：回看一周内的决策、文档更新，按项目归类。

源中通过 `~~category` 占位符表示「用户在该类目下接入的任意工具」（如 `~~chat` 可能是 Slack/Teams/Discord，`~~email` 可能是 M365）——工具无关，按类目而非具体产品组织工作流。常见类目：`~~chat`（聊天/提及）、`~~email`（邮件）、`~~cloud storage`（云盘文档）、`~~project tracker`（任务）、`~~CRM`、`~~knowledge base`（知识库）。

**不该用的边界**：
- **实时事件流监听**（如等待新消息推送、长驻订阅）——那是事件消费，不是周期性摘要。
- **单一来源的深度检索**（精确搜某条消息/某份文档）——用搜索类技能，本技能强调跨源聚合与去重。
- **正式复盘/汇报文档**——本技能产出的是「速读型动态摘要」，不是带根因分析或对外口径的报告。

## 步骤

1. **解析时间窗（解析旗标）**：
   - `--daily` —— 近 24 小时（**无旗标时的默认值**）。
   - `--weekly` —— 近 7 天。
   - 自定义：`--since yesterday` / `--since Monday` / `--since 2025-01-20`。
2. **盘点可用源**：识别已连接的 MCP 源。若**一个都没连**，引导用户：
   ```
   生成摘要至少需要连接一个源。
   请到 MCP 设置中添加 ~~chat、~~email、~~cloud storage 或其他工具。
   ```
3. **逐源采集活动**：
   - `~~chat`：搜提及自己的消息（`to:me`）、参与过的话题串、关键频道新动态。
   - `~~email`：近期收件、有新回复的会话串、点名要自己处理/回答的邮件。
   - `~~cloud storage`：近期被修改/共享给自己的文档、自己拥有或协作文档的新评论。
   - `~~project tracker`：分配给自己的任务（新建/变更）、关注事项的完成情况、相关任务评论。
   - `~~CRM`：商机阶段变化、自己负责账户的新活动、联系人/账户更新。
   - `~~knowledge base`：相关合集中近期更新或新建的文档。
4. **抽取并归类关键项**——四类：**行动项**（点名请求「Can you…/Please…/@你」、临期任务、待回答问题、评审请求）、**决策**（话题串/邮件中的结论、批准/驳回、方向变更）、**提及**（被点名、关于自己项目的讨论）、**更新**（关注项目的状态变化、领域内文档更新、等待已久的完成项）。
5. **按主题/项目聚合**（不按来源分组）：把跨源的相关活动合并到同一主题下，用户关心「发生了什么」而非「在哪发生」。
6. **格式化输出**（结构见下方示例）。
7. **处理不可达源**：某源失败时显式标注，**不要因一个源失败而中止整份摘要**——用可用源产出尽量完整的结果：
   ```
   注意：本次摘要未能访问 [源名称]。
   已包含的源：[成功源列表]。
   ```
8. **结尾汇总统计**：行动项/决策/提及/文档更新各计数、覆盖源数与时间范围。

## 指令

- 默认走 `--daily`。
- **行动项永远排在最前**——这是摘要里最可执行的部分。
- **按主题/项目分组，而非按来源**。
- **跨源去重**：同一决策在 `~~chat` 与 `~~email` 都出现时只记一条。
- **周报重要性优先于完整性**：突出要紧的，跳过噪声。
- 若用户有记忆系统（CLAUDE.md），用它解码人名与项目代号。
- 每条目自带足够上下文，让用户无需点进去就能判断是否深挖。

## 示例

按主题合并跨源活动：

```
## Project Aurora
- ~~chat: 设计评审话题串已结论 —— 团队选定 Option B（#design，周二）
- ~~email: Sarah 发来纳入反馈后的更新版规格（周三）
- ~~cloud storage: "Aurora API Spec v3" 由 Sarah 更新（周三）
- ~~project tracker: 3 个任务进入进行中，2 个已完成
```

完整摘要骨架：

```
# [日报/周报] 摘要 —— [日期 或 日期区间]

已扫描源：~~chat、~~email、~~cloud storage、[其他]

## 行动项（X 项）
- [ ] [行动项 1] —— 来自 [人]，[来源]（[日期]）
- [ ] [行动项 2] —— 来自 [人]，[来源]（[日期]）

## 已做出的决策
- [决策 1] —— [背景]（[来源]，[日期]）

## [主题/项目分组 1]
[带来源标注的活动摘要]

## 提及
- [提及背景] —— [来源]（[日期]）

## 文档更新
- [文档名] —— [谁改了、改了什么]（[日期]）

---
[X] 行动项 · [Y] 决策 · [Z] 提及 · [W] 文档更新
跨 [N] 个源 · 覆盖 [时间范围]
```

## 注意事项

- **行动项置顶**是硬约束，决定摘要的实用性。
- **去重**是质量关键：同一事件多源出现只保留信息最全的一条。
- **容错而非中断**：单源故障要降级标注，不能让整份摘要失败。
- **周报抓重点**：宁可漏掉无关琐事，也不要淹没在噪声里。
- 时间窗解析要稳健：`--since` 接受相对（yesterday/Monday）与绝对（ISO 日期）两种写法。
- 占位符 `~~category` 在输出中可保留为动态来源标记，也可替换为实际接入的工具名（如 Slack/M365）。
- 本条采编自 anthropics/knowledge-work-plugins（Apache-2.0），保留其旗标语义、六类源采集清单、四类关键项归类、按主题聚合、容错降级与汇总统计等关键约束。

## 互见

- **requires**：至少接入一个 MCP 源（`~~chat`/`~~email`/`~~cloud storage` 等）——无源则只能引导配置。
- **related**：跨源搜索类技能（单点深检索的互补面）、meeting-transcript-analyzer（会议侧动态可作为摘要输入）。
- **combines_with**：lark-workflow-standup-report —— 把本摘要的行动项与日程待办拼成站会汇报；fact-checking —— 发布前核对摘要中引用的决策、指标与影响面。
