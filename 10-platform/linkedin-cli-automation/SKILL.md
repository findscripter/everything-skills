---
name: linkedin-cli-automation
title: LinkedIn CLI 自动化
description: 当需要用命令行脚本或 AI Agent 批量自动化 LinkedIn（抓取人/公司资料、搜索、发消息、管理人脉、发帖、Sales Navigator）时使用；做：用 linkedin CLI 调用 Linked API 云端浏览器执行操作并返回结构化 JSON；不适用于：网页手动操作、实时即时返回（操作需 30 秒到数分钟）。触发词：LinkedIn、领英、Sales Navigator
domain: 平台/integration
triggers: [LinkedIn 自动化, 领英抓取资料, linkedin CLI, Sales Navigator, 批量发 LinkedIn 消息, 管理 LinkedIn 人脉, LinkedIn 发帖, Linked API]
tags: [平台, integration, linkedin, automation, cli, social, outreach, sales-navigator]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [linkedin]
requires: []
related: [apollo-lead-enrichment, x-twitter-automation, sales-prospecting, linkedin-profile-optimizer]
combines_with: [apollo-sequence-loader, cold-email-writer, social-connections-optimizer]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

当你要**从脚本或 AI Agent 编排 LinkedIn 操作**（而非手点网页 UI）时使用本技能：

- 搭建外联、调研、招聘等依赖 LinkedIn 数据与私信的工作流。
- 批量抓取人/公司资料，做线索或客户富集。
- 编排多步 Sales Navigator 或自定义 workflow，需要 JSON 输出和退出码可判读。

**不该用的边界：**

- 需要即时返回结果时不要用——每次命令都驱动真实云端浏览器，耗时 **30 秒到数分钟**。
- 一次性手动浏览、不需要程序化输出时，直接用网页更合适。
- 缺少必要输入、权限、安全边界或成功标准时，先停下来向用户澄清，不要硬跑。
- 使用真实账号自动化时，**必须遵守 LinkedIn 服务条款、当地法规及所在组织的合规政策**。

## 步骤

1. **确认工具**：若 `linkedin` 不可用，安装：`npm install -g @linkedapi/linkedin-cli`
2. **鉴权**（命令返回退出码 2 时）：让用户到 [app.linkedapi.io](https://app.linkedapi.io) 注册/登录、连接 LinkedIn 账号，复制 **Linked API Token** 与 **Identification Token**，然后运行 `linkedin setup --linked-api-token=TOKEN --identification-token=TOKEN`。
3. **执行命令**：所有命令统一加 `--json -q`，便于机器解析。
4. **判读结果**：退出码 0 仅代表 API 调用成功，**必须再看 `success` 字段**判断动作是否真的成功；非 0 退出码代表基础设施错误。

## 指令

**全局标志**（建议每条命令都带）：

| 标志 | 说明 |
| --- | --- |
| `--json` | 结构化 JSON 输出 |
| `--quiet` / `-q` | 抑制 stderr 进度信息 |
| `--fields name,url,...` | 仅输出指定字段 |
| `--account "Name"` | 指定账号执行本命令 |

**输出格式**：成功 `{ "success": true, "data": {...} }`；失败 `{ "success": false, "error": { "type": "personNotFound", "message": "..." } }`。

**退出码**：0 成功（仍需查 `success`）；1 一般错误；2 token 缺失/无效；3 需订阅/套餐；4 LinkedIn 账号问题；5 参数无效；6 限流；7 网络错误；8 workflow 超时（返回 workflowId 供恢复）。

**核心命令一览**：

- 抓取个人：`linkedin person fetch <url> [--experience --education --skills --languages --posts --posts-limit N --comments --reactions] --json -q`（按需加标志，每个标志都增加耗时）
- 搜索个人：`linkedin person search --term ... [--locations --industries --current-companies --previous-companies --schools --position --limit] --json -q`
- 抓取公司：`linkedin company fetch <url> [--employees --dms --posts]`，员工过滤需配合 `--employees`（如 `--employees-position`、`--employees-locations`）
- 搜索公司：`linkedin company search --term ... [--sizes "11-50,51-200" --locations --industries] --json -q`
- 发消息：`linkedin message send <person-url> '<text>' --json -q`（文本 ≤1900 字符，单引号包裹）
- 取会话：`linkedin message get <person-url> [--since TIMESTAMP] --json -q`（首次会触发后台同步、较慢）
- 人脉：`connection status|send|list|pending|withdraw|remove`，如 `connection send <url> [--note '...'] [--email ...]`；`withdraw` 默认会同时取关，加 `--no-unfollow` 保留关注
- 帖子：`post fetch <url> [--comments --comments-sort mostRecent --comments-replies --reactions]`；`post create '<text>' [--company-url --attachments "url:type:name"]`；`post react <url> --type like|love|support|celebrate|insightful|funny`；`post comment <url> '<text>'`（评论 ≤1000 字符）
- 统计：`stats ssi` / `stats performance` / `stats usage --start ... --end ...`
- Sales Navigator（需订阅，使用哈希 URL）：`navigator person fetch|search`、`navigator company fetch|search`、`navigator message send <url> '<text>' --subject '<subject>'`（InMail，正文 ≤1900、主题 ≤80）、`navigator message get`
- 自定义工作流：`linkedin workflow run --file workflow.json --json -q`（或 stdin/inline）；`workflow status <id> [--wait]`
- 账号管理：`account list` / `account switch "Name"` / `account rename "Name" --name "New"` / `reset [--all]`

## 示例

```bash
# 抓取个人资料 + 工作与教育经历
linkedin person fetch https://www.linkedin.com/in/username --experience --education --json -q

# 按公司与职位搜索人
linkedin person search --current-companies "Google" --position "Engineer" --limit 20 --json -q

# 抓公司的决策者和最近 10 条动态
linkedin company fetch https://www.linkedin.com/company/name --dms --posts --posts-limit 10 --json -q

# 发消息（单引号包裹文本）
linkedin message send https://www.linkedin.com/in/username 'Hey, loved your latest post!' --json -q

# 带文档附件发帖
linkedin post create 'Our Q4 report' \
  --attachments "https://example.com/report.pdf:document:Q4 Report" --json -q

# Sales Navigator 发 InMail
linkedin navigator message send https://www.linkedin.com/in/username \
  'Would love to chat about API integrations' --subject 'Partnership Opportunity' --json -q
```

## 注意事项

- **串行执行**：同一账号的所有操作逐个排队执行，多请求会排队。
- **非即时**：真实浏览器在导航 LinkedIn，单次操作 30 秒到数分钟。
- **时间均为 UTC**：所有日期时间按 UTC 处理。
- **文本参数用单引号**：消息、帖子、评论的文本用单引号包裹，避免 shell 解析特殊字符。
- **动作上限**：每账号限额在平台侧可配；`limitExceeded` 错误代表已达上限。
- **URL 归一化**：响应中所有 LinkedIn URL 归一为 `https://www.linkedin.com/...` 且无尾部斜杠。
- **空字段**：不可用字段返回 `null` 或 `[]`，不会被省略。
- **附件限制**：最多 9 张图，或 1 个视频，或 1 个文档；类型不可混用。
- 不要把输出当作环境特定校验/测试/专家评审的替代品。

## 互见

- 飞书侧的人脉/消息/外联场景可参考 `lark-im`、`lark-contact` 等 lark-* 技能（不同平台，能力不互通）。
- 自定义 workflow JSON schema 见官方文档 https://linkedapi.io/docs/building-workflows/

---

采编自 sickn33/antigravity-awesome-skills（MIT）。
