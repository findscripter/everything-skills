---
name: apollo-lead-enrichment
title: Apollo 线索富化（联系卡补全）
description: 当只有姓名、公司、LinkedIn 链接或邮箱等零散标识、需要补全为完整联系卡（邮箱、电话、职位、公司情报与下一步动作）时使用；做 Apollo MCP 人物匹配+公司富化并产出标准联系卡表格；不适用于从 0 批量建线索清单（见 sales-prospecting）或撰写外呼文案（见 cold-email-writer）。触发词：enrich lead、线索富化、补全联系方式、查邮箱电话、Apollo、查这个人、联系卡、contact card、人物匹配、公司情报。
domain: 商业/sales
triggers: [enrich lead, 线索富化, 补全联系方式, 查邮箱电话, Apollo, 查这个人, 联系卡, contact card, 人物匹配, 公司情报]
tags: [sales, lead-enrichment, apollo, mcp, contact-data, b2b, outbound]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Apollo MCP, apollo_people_match, apollo_mixed_people_api_search, apollo_organizations_enrich, apollo_contacts_create]
requires: []
related: [sales-prospecting, apollo-sequence-loader, signal-based-call-prep, cold-email-writer]
combines_with: [apollo-sequence-loader, cold-email-writer]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
## 何时使用

当用户只给出一个零散标识（姓名、公司、LinkedIn URL、邮箱，或像「Figma 的 CEO」这类模糊描述），想立刻拿到一张完整联系卡时使用：补全工作/个人邮箱、直线/手机/总机电话、职位、所在地、LinkedIn，以及所属公司的行业、人数、营收、融资、总部等情报，并给出可执行的下一步动作。

依赖前提：环境已接入 **Apollo MCP**（工具前缀 `mcp__claude_ai_Apollo_MCP__…`）。

不该用的边界：
- 从 ICP 画像**从 0 批量建线索清单** → 用 sales-prospecting（那是发现+筛选+建表，本条只补全单个已知对象）。
- 建好卡后**写外呼文案/序列** → 用 cold-email-writer。
- 没有任何 Apollo MCP 接入时不要硬用，改走通用调研。

## 步骤

1. **解析输入**：从用户输入中抽取所有可用标识——名、姓、公司名或域名、LinkedIn URL、邮箱、职位（职位仅作匹配提示）。若输入模糊（如「Figma 的 CEO」），先用 `apollo_mixed_people_api_search` 配合职位+域名过滤定位到具体人，再进入富化。

2. **富化人物**（消耗信用，先告知）：用 `apollo_people_match` 传入全部已知标识：`first_name`/`last_name`、`domain` 或 `organization_name`、`linkedin_url`、`email`，并设 `reveal_personal_emails: true`。若匹配失败，用 `apollo_mixed_people_api_search` 放宽过滤，列出 Top 3 候选请用户选一个，再重新富化。

3. **富化公司**：用 `apollo_organizations_enrich` 传入该人物的公司域名，拉取行业、人数、营收、融资、总部等 firmographic 情报。

4. **输出联系卡**：按下方固定格式呈现。

5. **给出下一步动作**：问用户选哪一个——① 存入 Apollo（建联系人）；② 加入某个 sequence；③ 找同公司同事；④ 找其他公司的相似职位人。

## 指令

**信用警示（硬约束）**：调用 `apollo_people_match` 前，必须明确告知用户「本次富化将消耗 1 个 Apollo 信用」。

**联系卡输出格式（严格照此排版）：**

```markdown
**[全名]** | [职位]
[公司名] · [行业] · [人数] employees

| 字段 | 内容 |
|---|---|
| 邮箱（工作） | ... |
| 邮箱（个人） | ...（已揭示时） |
| 电话（直线） | ... |
| 电话（手机） | ... |
| 电话（总机） | ... |
| 所在地 | 城市, 州/省, 国家 |
| LinkedIn | URL |
| 公司域名 | ... |
| 公司营收 | 区间 |
| 公司融资 | 累计募集 |
| 公司总部 | 地点 |
```

**下一步动作对应工具：**
- 存入 Apollo：`apollo_contacts_create`，置 `run_dedupe: true`（自动去重）。
- 找同事：`apollo_mixed_people_api_search`，把 `q_organization_domains_list` 设为该公司域名。
- 找相似人：`apollo_mixed_people_api_search`，按相同职位/职级在其他公司搜。

## 示例

- `Tim Zheng at Apollo` —— 姓名+公司，直接 `apollo_people_match`。
- `https://www.linkedin.com/in/timzheng` —— 仅传 `linkedin_url`。
- `sarah@stripe.com` —— 仅传 `email`，并设 `reveal_personal_emails: true`。
- `Jane Smith, VP Engineering, Notion` —— 名/姓 + 职位提示 + 公司。
- `CEO of Figma` —— 模糊，先 `apollo_mixed_people_api_search`（title=CEO, domain=figma.com）定位再富化。

## 注意事项

- **先告知信用消耗再调用**，不要静默扣信用。
- 个人邮箱涉及隐私，`reveal_personal_emails` 默认开但需有正当外呼用途；下游外呼遵守 GDPR/CAN-SPAM。
- 匹配失败别硬编一张卡，宁可走 search 列候选让用户确认，避免补全到错的人。
- 富化数据可能过期，关键字段（邮箱可达性、职位）建议下游再验证。
- 工具名以环境实际注册前缀为准（源为 `mcp__claude_ai_Apollo_MCP__apollo_*`）。

## 互见

- related：`sales-prospecting` —— 它从 0 建线索清单，本条把清单里的单个对象补全成完整联系卡。
- combines_with：`cold-email-writer` —— 联系卡补全后，拿邮箱/职位/公司情报去写个性化外呼。
- combines_with：`email-drip-sequence` —— 对应「加入 sequence」动作，把富化对象纳入培育序列。

---
本条采编自 anthropics/knowledge-work-plugins（Apache-2.0）。
