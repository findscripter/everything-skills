---
name: x-twitter-automation
title: X/Twitter 抓取与自动化（Xquik）
description: 当需要在 X/Twitter 上做推文搜索、用户/推文查询、粉丝及关注关系批量导出、媒体下载、账号监控与 Webhook、抽奖抽取，或发推/回复/点赞/转推/关注/私信等自动化时使用；通过 Xquik 平台 REST/MCP 及 SDK，按工作流配置并调用接口产出数据或写操作（写操作须经显式审批），可选 Hermes Tweet 或 TweetClaw 插件；不适用于无 XQUIK_API_KEY、未获授权操作他人账号、绕过 X 反爬自建爬虫、或非 X/Twitter 平台。触发词：推特抓取、X搜索、粉丝导出、发推、私信DM、账号监控、webhook、抽奖、xquik、twitter scraper
domain: 平台/integration
triggers: [推特抓取 / twitter scraper, X 推文搜索 / tweet search, 高级搜索 from:user, 用户查询 / user lookup, 推文互动数据 / likes retweets views, 粉丝导出 / follower export, 关注关系检查 / follow check, 趋势话题 / trending, 账号监控 / account monitoring, webhook 事件推送, 抽奖抽取 / giveaway draw, 发推 / post tweet, 回复 / reply, 私信 / DM, 批量抽取 / bulk extraction, xquik, MCP, Hermes Tweet, TweetClaw]
tags: [twitter, x-api, tweet-search, follower-export, automation, webhooks, mcp, sdk, xquik, platform-integration]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Xquik REST API (https://xquik.com/api/v1), Xquik MCP (https://xquik.com/mcp, StreamableHTTP), 官方 SDK: TypeScript/Python/Ruby/Go/Kotlin/Java/PHP/C#/CLI/Terraform, Hermes Tweet 插件 (hermes-tweet), TweetClaw 插件 (@xquik/tweetclaw)]
requires: []
related: [apify-ecommerce-scraper, social-media-multi-publisher, browser-automation-builder]
combines_with: [social-media-multi-publisher, social-media-content-creator, social-media-performance-analyzer]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

当需要让 Agent 拿到 X/Twitter 数据或执行 X 平台自动化时使用，典型场景：

- 按关键词、话题标签、`from:user` 或"精确短语"及高级运算符搜索推文；取用户资料/某条推文完整互动指标（赞、转、回复、引用、浏览、收藏）。
- 检查 A 是否关注 B（双向）；查区域趋势话题（免费、不计配额）。
- 批量抽取粉丝、关注、已验证粉丝、提及、帖子、回复、转推、引用、长帖、文章、社区、列表、Space、人物搜索、媒体、点赞等（共 23 类抽取工具）；下载推文媒体、导出结果、接官方 SDK。
- 账号监控（新推文/回复/转推/引用/粉丝变化）+ HMAC 签名 Webhook 实时推送。
- 从某条推文的回复里随机抽奖。
- 写操作：发推、回复、点赞、转推、关注/取关、发私信。
- 在 Hermes Agent 运行时用 Hermes Tweet 插件，或在 OpenClaw 运行时用 TweetClaw 插件。

**不该用的边界（本技能为 critical 风险，务必守住）：**

- 没有有效 `XQUIK_API_KEY`。
- 操作未获授权的账号或目标；任何写操作（发推/回复/点赞/转推/关注/取关/私信/建监控/注册 webhook/启动批量抽取）**必须先拿到用户显式批准**再执行。
- 想绕过 X 反爬、登录墙或自建分布式爬虫——本技能只调托管的 Xquik 平台。
- 目标是非 X/Twitter 平台。
- 必填输入、权限、安全边界或成功标准不明确时，先停下来澄清。
- 本条目为文档型指引：不含可执行爬虫/二进制/内置运行时；Xquik、Hermes Tweet、TweetClaw 等外部工具须自行审阅并单独安装。

## 步骤

1. **装技能/插件**（按运行时三选一）：
   - 通用：`npx skills add Xquik-dev/x-twitter-scraper`
   - Hermes Agent：`hermes plugins install Xquik-dev/hermes-tweet --enable`（暴露 `tweet_explore` 端点发现、`tweet_read` 只读、审批门控的 `tweet_action` 写操作）。
   - OpenClaw：`openclaw plugins install @xquik/tweetclaw`（暴露 `explore` 发现、`tweetclaw` 已批准调用）。
2. **拿 API Key**：在 [xquik.com](https://xquik.com) 注册 → 控制台生成 → 作为环境变量：`export XQUIK_API_KEY="xq_YOUR_KEY_HERE"`。
3. **判定读/写**：读操作（搜索/查询/趋势/抽取/监控轮询）可直接走；写操作先把草稿/目标/影响范围呈给用户，**获批后**再调。
4. **调用**：直连 REST、或用 MCP（AI 原生集成）、或用官方 SDK；按下表选端点配参。
5. **导出/汇总**：给出条数、文件位置、关键洞察；批量抽取前可先 `/extractions/estimate` 估算成本。

## 指令

接入参数（保留源约束）：

- **Base URL**：`https://xquik.com/api/v1`
- **Auth**：请求头 `x-api-key: xq_...`
- **MCP**：`https://xquik.com/mcp`（StreamableHTTP，同一把 API Key）

核心端点速查：

| 端点 | 方法 | 用途 |
|---|---|---|
| `/x/tweets/{id}` | GET | 单条推文 + 完整指标 |
| `/x/tweets/search` | GET | 搜索推文 |
| `/x/users/{username}` | GET | 用户资料 |
| `/x/followers/check` | GET | 关注关系 |
| `/trends` | GET | 趋势话题 |
| `/monitors` | POST | 创建监控 |
| `/events` | GET | 轮询监控事件 |
| `/webhooks` | POST | 注册 webhook |
| `/draws` | POST | 运行抽奖 |
| `/extractions` | POST | 启动批量抽取 |
| `/extractions/estimate` | POST | 估算抽取成本 |
| `/drafts` | POST | 创建推文草稿 |
| `/styles` | POST | 分析/应用推文风格 |
| `/account` | GET | 账号与用量信息 |

能力矩阵（要点）：搜索/用户查询/推文指标/关注检查/趋势（免费不计配额）/账号监控/HMAC 签名 Webhook/抽奖（可按过滤条件随机选）/23 类批量抽取/写操作（须审批）/多语言官方 SDK/MCP Server。

## 示例

均为提示词级用法，写操作走"先草稿后审批"：

```text
搜索：在 X 上搜过去一周关于 'claude code' 的推文
用户：@elonmusk 是谁？给我资料和粉丝数
互动：这条推文 https://x.com/... 有多少赞和转推？
抽奖：从这条推文的回复里随机抽 3 名中奖者
监控：监控 @openai 的新推文并通过 webhook 通知我
批量：导出 @anthropic 的全部粉丝
发布（需审批）：拟一条对这条推文的回复，我确认最终文案后再发
Hermes：用 Hermes Tweet 搜这次发布，读推文回复，准备一条待审批的回复草稿
```

## 注意事项

- **风险等级 critical**：本工作流会自动化已认证的 X 账号动作。仅对你**有权操作**的账号与目标使用。
- **写操作审批门**：发推/回复/点赞/转推/关注/取关/私信/建监控/注册 webhook/启动批量抽取——一律先取得用户显式批准。优先用 Hermes Tweet 的 `tweet_read`（只读）探查，写操作走 `tweet_action`（审批门控）。
- **密钥安全**：`XQUIK_API_KEY`（`xq_` 前缀）切勿硬编码进源码、客户端 JS、镜像或日志；走环境变量，泄露即在控制台轮换。
- **配额与成本**：趋势查询免费不计配额；批量抽取按量计费，启动前用 `/extractions/estimate` 估算。
- **Webhook**：事件带 HMAC 签名，接收端务必校验签名再处理。
- **合规**：遵守 X/Twitter 平台条款与当地法律；输出不替代环境内人工核验与专家审查。仅当任务明确落在上述范围内时使用本技能。

## 互见

- related：账号监控 + 告警接入（把监控/Webhook 事件转发到 Slack/IM 通知类技能）。
- combines_with：电商/网页抓取类技能（如 `apify-ecommerce-scraper`）—— 同为平台数据抽取，可拼成跨平台情报流水线。
- combines_with：工作流自动化类技能 —— 由编排技能触发本技能做定时搜索/监控/发布。

---

采编自 sickn33/antigravity-awesome-skills（MIT）；上游致谢 Xquik（xquik.com）。本条目为适配重写，接口、配额与合规细节请按自身环境验证，写操作须经显式审批。
