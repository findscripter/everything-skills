---
name: apollo-sequence-loader
title: Apollo 外联序列批量加载
description: 当需要按目标画像（职位/行业/规模/地区）批量寻找潜客并加入指定 Apollo 外联序列（sequence/campaign）时使用；做检索匹配人选→富集创建联系人→入列序列并回执的端到端动作，产出入列清单与额度消耗汇总；不适用于序列内容编排、邮件正文撰写或非 Apollo 平台。触发词：apollo 序列、外联序列、批量加潜客
domain: 商业/sales
triggers: [Apollo 序列批量加载, 把潜客加入外联序列, sequence load 外联, 批量加联系人到 campaign, VP Sales 加进序列, list sequences 列序列]
tags: [商业, sales, apollo, 外联序列, 潜客获取, mcp]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [mcp__claude_ai_Apollo_MCP__apollo_emailer_campaigns_search, mcp__claude_ai_Apollo_MCP__apollo_email_accounts_index, mcp__claude_ai_Apollo_MCP__apollo_mixed_people_api_search, mcp__claude_ai_Apollo_MCP__apollo_people_bulk_match, mcp__claude_ai_Apollo_MCP__apollo_contacts_create, mcp__claude_ai_Apollo_MCP__apollo_emailer_campaigns_add_contact_ids, mcp__claude_ai_Apollo_MCP__apollo_emailer_campaigns_remove_or_stop_contact_ids]
requires: []
related: [apollo-lead-enrichment, sales-prospecting, cold-email-writer, email-sequence-designer]
combines_with: [apollo-lead-enrichment, cold-email-writer, sales-prospecting]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
## 何时使用

- 已有明确目标画像（职位、级别、行业、公司规模、地区），需要一次性把一批潜客找到并加入某个已存在的 Apollo 外联序列时。
- 想往现有序列「再补一批」联系人（reload），或先 `list sequences` 查看有哪些序列时。
- 端到端覆盖：检索人选 → 富集 → 创建联系人（去重） → 入列序列 → 回执汇总。

**不该用边界：**
- 序列本身的编排（步骤、节奏、A/B、邮件正文撰写）不在此范围——本技能只负责「把人装进序列」，不负责「序列内容」。
- 没有现成序列、需要先新建序列时，先在 Apollo 内建好再用本技能加载。
- 非 Apollo 平台（如 Outreach、Salesloft、HubSpot Sequences）不适用。
- 富集会消耗 Apollo 额度（credits），未经用户确认不要批量执行第 5 步。

## 步骤

入参来自用户一句话需求（targeting criteria + sequence name），按序执行：

1. **解析输入** —— 拆出「目标画像」与「序列信息」（见下方指令）。若只说 "list sequences"，跳到第 2 步仅列出序列。
2. **定位序列** —— `apollo_emailer_campaigns_search`，`q_name` 设为序列名。无匹配或多匹配则以表格 `| Name | ID | Status |` 列出请用户选择。
3. **取发信邮箱** —— `apollo_email_accounts_index` 列出已绑定邮箱。唯一则自动用；多个则展示并询问从哪个发。
4. **检索人选** —— `apollo_mixed_people_api_search` 套用画像，`per_page` = 请求数量（默认 10）。以预览表展示并请求确认（关键：会消耗额度）。
5. **富集并创建联系人** —— 确认后：先 `apollo_people_bulk_match` 批量富集（每次最多 10 人，`reveal_personal_emails: true`）；再对每人 `apollo_contacts_create`（`run_dedupe: true`）。收集所有 contact_ids。
6. **入列序列** —— `apollo_emailer_campaigns_add_contact_ids` 把联系人写入序列。
7. **回执汇总** —— 输出序列、入列人数、发信邮箱、额度消耗及入列名单表。
8. **下一步动作** —— 提供：再加一批 / 查看序列 / 移除联系人 / 暂停联系人。

## 指令

**第 1 步字段映射（画像 → API 参数）：**
- 职位（Job titles）→ `person_titles`
- 级别（Seniority）→ `person_seniorities`
- 行业关键词（Industry）→ `q_organization_keyword_tags`
- 公司规模（Company size）→ `organization_num_employees_ranges`
- 地区（Locations）→ `person_locations` 或 `organization_locations`
- 序列名：取 "to" / "into" / "→" 之后的文本；数量缺省为 10。

**第 4 步确认话术（必须等待确认再继续）：**
> 「将这 [N] 个联系人加入 [序列名]？此操作会消耗 [N] 个 Apollo 富集额度。」

**第 5 步入参要点：**
- `apollo_people_bulk_match`：每人传 `first_name`、`last_name`、`domain`；`reveal_personal_emails: true`。
- `apollo_contacts_create`：`first_name`、`last_name`、`email`、`title`、`organization_name`；若有则带 `direct_phone` 或 `mobile_phone`；`run_dedupe: true`。

**第 6 步 `apollo_emailer_campaigns_add_contact_ids` 参数：**
- `id`：序列 ID
- `emailer_campaign_id`：同一序列 ID
- `contact_ids`：已创建联系人 ID 数组
- `send_email_from_email_account_id`：第 3 步选定的邮箱 ID
- `sequence_active_in_other_campaigns`：`false`（安全默认）

## 示例

- `add 20 VP Sales at SaaS companies to my "Q1 Outbound" sequence`
- `SDR managers at fintech startups → Cold Outreach v2`
- `list sequences`（仅列出所有可用序列）
- `directors of engineering, 500+ employees, US → Demo Follow-up`
- `reload 15 more leads into "Enterprise Pipeline"`（向现有序列再补一批）

**第 4 步预览表：**

| # | 姓名 | 职位 | 公司 | 地区 |
|---|---|---|---|---|

**第 7 步回执：**

| 字段 | 值 |
|---|---|
| 序列 | [名称] |
| 已加入联系人 | [数量] |
| 发信邮箱 | [地址] |
| 消耗额度 | [数量] |

## 注意事项

- **额度消耗**：富集（第 5 步）按人消耗 Apollo credits，务必在第 4 步拿到用户明确确认后再执行，预览表里就把消耗量说清。
- **去重**：创建联系人统一带 `run_dedupe: true`，避免重复联系人污染库。
- **批量上限**：`apollo_people_bulk_match` 每次最多 10 人，人数多时分批调用。
- **跨序列保护**：入列默认 `sequence_active_in_other_campaigns: false`，避免误把已在其他序列中的联系人重复激活；确需跨序列再显式改。
- **暂停联系人**：第 8 步「暂停」= 用 `status: "paused"` 重新加入并带 `auto_unpause_at` 日期；「移除」用 `apollo_emailer_campaigns_remove_or_stop_contact_ids`。
- 多匹配/多邮箱场景一律先让用户选择，不要替用户默认挑第一个。

## 互见

- 商业/sales 域其它 Apollo 潜客检索与富集类技能（人选搜索、联系人富集）。
- 序列内容编排、邮件正文撰写类技能（本技能只负责装人，不负责写内容）。

---

采编自 anthropics/knowledge-work-plugins（Apache-2.0），源技能 partner-built/apollo/skills/sequence-load。
