---
name: slack-message-formatter
title: Slack 消息撰写与 mrkdwn 排版
description: 当撰写、起草或代写一条 Slack 消息/公告/Canvas 时使用；做一份合规 mrkdwn 排版的消息（首句点题、要点列表、关键信息加粗、thread/频道分流）；不适用于标准 Markdown 文档、邮件/飞书等非 Slack 渠道、或用 Bolt 编写机器人代码；触发词：slack 消息、mrkdwn、slack 排版、slack 公告、slack 加粗、thread 回复、slack canvas
domain: 平台/integration
triggers: [slack 消息, mrkdwn, slack 排版, slack 公告, slack 加粗, thread 回复, slack canvas, slack 格式, slack draft, @提及, 频道发言]
tags: [slack, mrkdwn, messaging, formatting, announcement, thread, canvas, integration]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [slack_send_message, slack_send_message_draft, slack_create_canvas]
requires: []
related: [slack-bolt-bot-builder, slack-search-techniques, slack-gif-creator, caveman-compressed-mode]
combines_with: [internal-comms, activity-digest-generator]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
## 何时使用

适用：撰写、起草或代用户写任何 Slack 消息时——包括调用 `slack_send_message`、`slack_send_message_draft`、`slack_create_canvas`。核心是排版必须用 Slack 专有的 **mrkdwn** 语法（≠ 标准 Markdown），并遵循「首句点题、短、分流」的发言习惯。

不该用：
- 写标准 Markdown 文档/README——那里用 `**bold**`、`## 标题`、`[文字](url)`，与 mrkdwn 相反。
- 邮件、飞书、企业微信等非 Slack 渠道——语法与回复礼仪不通用。
- 用 Bolt 框架写 Slack 机器人代码、Block Kit 交互、OAuth——那是另一回事，见互见 `slack-bolt-bot-builder`。

## 步骤

1. 选语法：一律 mrkdwn，对照下表，杜绝「常见错误」里的 Markdown 写法。
2. 排结构：第一行放最重要的信息（手机/通知里常只显示首行）；控制在 1-3 段；用空行隔开不同意思；3 项以上改用列表；姓名/日期/截止/行动项用 `*加粗*` 突出。
3. 选落点：是回复某条消息还是开新话题？按「Thread vs 频道」规则决定 thread 回复 / `reply_broadcast` / 频道直发。
4. 配语气：按频道调性（`#general` 比 `#random` 正式）；简单确认建议用 emoji reaction 而非回一句话。
5. 公告类按「背景 → 关键信息 → 行动号召」组织。

## 指令

mrkdwn 语法速查：

| 格式 | 语法 | 注意 |
|---|---|---|
| 加粗 | `*text*` | 单星号，**不是**双星号 |
| 斜体 | `_text_` | 下划线 |
| 删除线 | `~text~` | 波浪号 |
| 行内代码 | `` `code` `` | 反引号 |
| 代码块 | ` ```code``` ` | 三反引号 |
| 引用 | `> text` | 尖括号 |
| 链接 | `<url\|显示文字>` | 尖括号内竖线分隔 |
| @用户 | `<@U123456>` | 用户 ID |
| #频道 | `<#C123456>` | 频道 ID |
| 无序列表 | `- item` 或 `• item` | 短横或圆点 |
| 有序列表 | `1. item` | 数字加点 |

常见错误（务必避开）：
- 不要用 `**加粗**`（双星号）——Slack 用 `*加粗*`（单星号）。
- 不要用 `## 标题`——Slack 不支持 Markdown 标题；改用独占一行的 `*加粗文字*`。
- 不要用 `[文字](url)`——Slack 用 `<url|文字>`。
- 不要用 `---` 画分隔线——Slack 不渲染。

Thread vs 频道：
- 针对某条具体消息回复 → **在 thread 里回**，保持主频道干净。
- 仅当 thread 内信息所有人都需看到时 → 才用 `reply_broadcast`（同步发回频道）。
- 开新话题、做公告、向全员提问 → **直接发频道**，别开 thread。
- 别为延续已有对话另起新 thread——找到原消息回复它。

## 示例

公告（背景 → 关键信息 → 行动号召）：

```
*周五 18:00 起 API 网关将停机维护约 2 小时。*

受影响：所有走 `api.example.com` 的外部调用，内网服务不受影响。
预计 *20:00* 前恢复。

需要长时间任务的同学请在 *本周四下班前* 跑完，<@U123456> 负责值守，问题在本帖 thread 反馈。
```

要点列表 + 链接 + 加粗：

```
*本周发布要点：*
- 新增批量导出，详见 <https://docs.example.com/export|导出文档>
- 修复登录偶发 5xx，影响 *约 0.3%* 请求
- 弃用 `/v1/legacy`，*2026-07-01* 下线
```

## 注意事项

- 单星号加粗、不是双星号——这是最高频错误。
- 无标题语法：需要小标题就用独占一行的 `*加粗*` 代替 `##`。
- 链接是 `<url|文字>` 不是 `[文字](url)`；@用户/#频道必须用 ID 形式 `<@Uxxx>` / `<#Cxxx>`，写纯文本不会高亮也不触达。
- 首行即摘要：通知预览常只显示第一行，把结论放最前。
- 消息过长（多段大段文字）应改用 Canvas（`slack_create_canvas`），而非堆成一条长消息。
- MCP 工具不能加 emoji reaction，若想用 reaction 确认，提示用户手动加。
- 代码块/引用内的 mrkdwn 不会再被解析，适合放原文 / 命令。

## 互见

- related：`slack-bolt-bot-builder` —— 当目标从「写消息」升级为「用 Bolt 写 Slack 机器人 / Block Kit 交互 / OAuth」时切换。
- combines_with：`slack-search`（若已收录）—— 先搜上下文再撰写回复或公告。

—— 本条采编自 anthropics/knowledge-work-plugins（Apache-2.0）。
