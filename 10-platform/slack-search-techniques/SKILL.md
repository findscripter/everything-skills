---
name: slack-search-techniques
title: Slack 检索技巧（消息/文件/人）
description: 当需要在 Slack 中查找消息、对话、文件、频道或人，或回答前需先收集 Slack 上下文时使用；做选对搜索工具+组合修饰符+多轮检索的可执行策略与产物；不适用于发送/编排消息（见 slack-messaging）；触发词：Slack 搜索、查消息、找频道/找人
domain: 平台/integration
triggers: [在 Slack 里搜消息/对话, 按关键词或自然语言找内容, 查找频道/文件/人员, 回答前需收集 Slack 上下文, 用 in:/from:/before: 等修饰符精确检索]
tags: [slack, 搜索, integration, 平台, 协作工具]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [slack_search_public, slack_search_public_and_private, slack_search_channels, slack_search_users, slack_read_thread, slack_read_channel, slack_read_user_profile]
requires: []
related: [slack-message-formatter, slack-bolt-bot-builder, exa-semantic-search, slack-gif-creator]
combines_with: [slack-bolt-bot-builder, slack-message-formatter, meeting-transcript-analyzer]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
## 何时使用

- 用户要你在 Slack 中定位消息、对话、文件或人员。
- 回答某个问题前，需要先在 Slack 收集背景信息。
- 不知道确切关键词，想用自然语言模糊查找；或反过来想精确匹配某段内容。

不该用的边界：

- 需要撰写/排版/发送 Slack 消息时，用 slack-messaging，而非本技能。
- 想读取最近几秒的最新消息时，搜索有延迟，改用 `slack_read_channel`。
- 需要把多步查询编排成总结/digest 时，优先走对应的 slash 命令（如 `/slack:summarize-channel`），本技能只负责"查到"。

## 步骤

1. 选对搜索工具（见下表）。默认从 `slack_search_public` 起步；需要私有频道/DM 时才用 `slack_search_public_and_private`（需用户授权）。
2. 先宽后窄：先用简单关键词或自然语言提问 → 结果太多就加修饰符（`in:`/`from:`/日期）→ 结果太少就去掉过滤、换同义词或相关词。
3. 拆分多轮检索，不要指望一次命中：先搜主题 → 再搜特定人的发言 → 再限定到具体频道。
4. 拿到结果后追溯上下文（`slack_read_thread` / `slack_read_channel` / `slack_read_user_profile`）。

## 指令

搜索工具选择：

| 工具 | 何时用 |
|------|--------|
| `slack_search_public` | 只搜公开频道，无需用户授权。 |
| `slack_search_public_and_private` | 搜全部频道，含私有、DM、群 DM；需用户授权。 |
| `slack_search_channels` | 按名称或描述查找频道。 |
| `slack_search_users` | 按姓名、邮箱或角色查找人。 |

搜索修饰符：

- 位置：`in:channel-name`、`in:<#C123456>`（按频道 ID）、`-in:channel-name`（排除）、`in:<@U123456>`（与某人的 DM）。
- 用户：`from:<@U123456>`、`from:username`、`to:me`（直接发给你的）。
- 内容：`is:thread`、`has:pin`、`has:link`、`has:file`、`has::emoji:`（带特定表情回应）。
- 日期：`before:YYYY-MM-DD`、`after:YYYY-MM-DD`、`on:YYYY-MM-DD`、`during:january`（指定月份）。
- 文本匹配：`"exact phrase"`（精确短语）、`-word`（排除含某词）、`wild*`（通配，`*` 前至少 3 字符）。

文件搜索：传 `content_types="files"`，配合类型过滤 `type:images` / `type:documents` / `type:pdfs` / `type:spreadsheets` / `type:canvases`。

## 示例

- 自然语言（模糊/概念性）：`What is the deadline for project X?`
- 关键词（精确）：`project X deadline`
- 加过滤收窄：`project X deadline in:eng-team from:@alice after:2025-01-01`
- 文件检索：`content_types="files" type:pdfs budget after:2025-01-01`

## 注意事项

- 布尔运算符不支持：没有 `AND` / `OR` / `NOT`。用空格表示隐式 AND，用 `-` 表示排除。
- 括号不支持：不要用 `()` 给搜索词分组。
- 搜索非实时：最近几秒的消息可能搜不到，最新消息用 `slack_read_channel`。
- 私有频道访问：需要含私有频道时用 `slack_search_public_and_private`，但要注意它需要用户授权。
- 通配符 `wild*` 的 `*` 前至少要 3 个字符才生效。

## 互见

- slack-messaging：撰写与排版 Slack 消息（mrkdwn）。
- `/slack:summarize-channel`、`/slack:find-discussions`、`/slack:channel-digest`：基于检索的频道总结/话题发现/多频道摘要编排。

---

采编自 anthropics/knowledge-work-plugins（Apache-2.0）。
