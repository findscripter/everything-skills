---
name: social-media-multi-publisher
title: 多平台社媒发布调度
description: 当需要用一个工作区 API Key 把同一内容编排、定时并一键发布到 X/LinkedIn/Instagram/Facebook/TikTok/Discord/Telegram/YouTube/Reddit/WordPress/Pinterest 等十余个社媒平台时使用；产出多平台发布活动（含内容、媒体、排期与平台校验），发布前列出目标并等用户确认；不适用于写文案本身、做数据复盘或无 API Key 的场景。触发词：多平台发文、社媒定时发布、跨平台同步、SocialClaw、社媒排期
domain: 商业/growth
triggers: [把内容同步发到多个社媒平台, 给社媒活动排期定时发布, 用一个API一键群发X/LinkedIn/Instagram, 上传图片视频并跨平台发布, 校验各平台发文时间与限流, 发布后拉取各平台数据指标, SocialClaw工作区怎么用]
tags: [社交媒体, 多平台发布, 内容调度, 定时发布, 营销自动化, 商业增长, SocialClaw]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [claude, socialclaw]
requires: []
related: [social-media-content-creator, social-media-performance-analyzer, content-marketing-strategist]
combines_with: [social-media-content-creator, social-media-performance-analyzer]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用于「同一份内容、跨多个平台、定时/即时发布」的调度编排：

- 用户要把一条活动内容一次性投放到 X、LinkedIn、Instagram、Facebook 主页、TikTok、Discord、Telegram、YouTube、Reddit、WordPress、Pinterest 等多平台。
- 用户持有 SocialClaw 工作区 API Key，想用单一密钥覆盖所有平台（免去逐平台 OAuth 授权）。
- 需要为发布做平台级校验（限流、发文窗口）、挂载媒体、并在发布后拉取数据指标。

不该用的边界：

- 不负责「写什么」——文案/选题/视觉创意请见「互见」的内容创作技能，本技能只管「发到哪、何时发、怎么发」。
- 不做发布后的数据复盘与归因分析（见「互见」的效果分析技能）。
- 没有用户显式提供的 API Key 时，不得尝试发布或调用服务。
- 不替代平台合规、品牌审查或法务批准——这些须在发布前另行完成。

## 步骤

### 0. 前置：装包与配置密钥

```bash
npx skills add ndesv21/socialclaw      # 或 npm install socialclaw@0.1.12
export SOCIALCLAW_API_KEY=your_workspace_api_key
```

API Key 从 getsocialclaw.com 获取。Windows PowerShell 用 `$env:SOCIALCLAW_API_KEY="..."`。

### 1. 建活动（Campaign）

明确三要素：目标平台数组、发布内容、排期时间。一份内容可同时投多个平台。

### 2. 上传媒体（可选）

需要配图/视频时先上传，再挂载到对应平台的帖子。

### 3. 校验排期

发布前确认满足各平台的时序规则（限流、发文窗口），避免被拒或限流。

### 4. 发布或定时

立即发布，或设定未来时间，对所选平台**同时**生效。

### 5. 拉取指标

发布后获取各帖子的表现数据（具体字段依上游服务而定）。

## 指令

- **发布前确认（强约束）**：把 publish / schedule / delete / 改账号 全部视为状态变更操作。先向用户列出「目标平台 + 内容 + 媒体 + 时间」，得到显式确认后再调用服务。
- 缺少 `SOCIALCLAW_API_KEY` 时停下并向用户索取，不要静默失败或编造密钥。
- 多平台同发时，注意各平台字符上限/媒体规格差异，必要时为不同平台准备适配版本。

## 示例

```
/social-publishing

为我们的产品发布创建一个活动：
- 平台：X、LinkedIn、Instagram
- 文案："Excited to announce our new feature! Check it out at example.com #launch #product"
- 排期：明天上午 9 点（PST）
```

Agent 应先回显目标平台、文案、媒体与时间，待用户确认后再执行发布。

## 注意事项

- **凭证安全**：需有效的 SocialClaw 工作区 API Key；不要在无用户授权下发布。
- **状态变更**：每次发布/定时/删除都会真实改动外部账号，务必经确认门控。
- **上游依赖**：平台可用性、限流、分析字段、排期行为均取决于 SocialClaw 上游服务，可能随版本变化。
- **合规边界**：本技能只描述发布流程，不替代平台合规、品牌审查与法务批准。
- 源标记上游 `risk: critical`、插件 target 为 blocked，发布动作请保持谨慎与可审计。

## 互见

- combines_with：`social-media-content-creator` —— 先用它产出各平台文案/创意，再交本技能调度发布。
- related：`social-media-performance-analyzer` —— 发布后做效果复盘与归因。
- related：`xiaohongshu-content-strategy` —— 中文短图文平台的内容策略（小红书不在本技能覆盖的平台列表内）。

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可；原技能 socialclaw，作者 ndesv21）。
