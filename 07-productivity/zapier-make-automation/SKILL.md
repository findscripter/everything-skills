---
name: zapier-make-automation
title: Zapier 与 Make 无代码自动化
description: 当需要在 Zapier 或 Make（原 Integromat）上搭建无代码业务自动化、连接多个 SaaS 应用、设计触发-动作流并规避平台坑点时使用；产出选型判断、可落地的 Zap/Scenario 设计与排错清单；不适用于需自定义代码的工作流（Inngest/Temporal）、浏览器自动化或自建 n8n 部署。触发词：zapier、make、integromat、zap、scenario、无代码自动化、连接应用、自动化流程
domain: 协作/automation
triggers: [zapier, make, integromat, zap, scenario, 无代码自动化, no-code automation, 触发动作, 连接应用, 自动化流程, workflow automation, automate]
tags: [协作, 自动化, no-code, zapier, make, integromat, saas-integration, 业务流程自动化]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Zapier, Make, n8n, Zapier Agents, Zapier Copilot, Zapier MCP]
requires: []
related: [salesforce-automation, business-process-mapper, agentmail-email-infra, stripe-integration]
combines_with: [salesforce-automation, business-process-mapper, email-drip-sequence]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
# Zapier 与 Make 无代码自动化

无代码自动化让非开发者也能搭建业务流程，但「无代码」不等于「无复杂度」——这些平台有自己的模式、陷阱和能力边界。核心判断：**Zapier 主打简单与集成广度（7000+ 应用、线性流、按任务计费）；Make 主打能力与成本（可视化分支、按操作数计费、强数据处理）。无代码够用到不够用之间，要知道临界点。**

## 何时使用

适用：
- 简单通知、数据同步、跨应用的多步流程（如新邮件 → 建任务、新线索 → CRM → Slack → 邮件）。
- 需要在 7000+ SaaS 之间连接，且团队偏非技术、追求快速上线。
- 定时报表、周期同步、按条件分流、数据格式转换等典型业务编排。

不该用（应转交其他能力）：
- 自动化需要自定义代码逻辑 → 转 code-based 工作流（Inngest / Temporal）。
- 流程中需要浏览器自动化 → 转 Playwright / Puppeteer。
- 要建自定义 API 集成 → 转 API 设计；高吞吐数据处理 → 转后端。
- 需自托管、无限操作数 → 转 n8n / DevOps 自建部署。

平台选型速查：
- **Zapier**：简单自动化、最大应用覆盖、新手友好；线性流、按任务计费。
- **Make**：复杂流程、可视化分支、预算敏感；可视化 Scenario、按操作数计费。
- **n8n**：自托管、可写代码、操作数无限；开源、技术型用户。
- AI 能力：Zapier Agents（自然语言驱动的自治自动化）、Zapier Copilot（AI 帮你搭 Zap）、Zapier MCP（让 LLM 调用 30,000+ Zapier 动作）。

## 步骤

1. **选平台**：先按上表判断 Zapier / Make / n8n。高频循环、强分支、预算敏感优先 Make；要应用覆盖和上手快优先 Zapier。
2. **设计触发-动作骨架**：从最简单的 `[Trigger] → [Action]` 起步，仅在需要时加分支、循环、转换。
3. **命名与过滤**：用描述性名称（含时区，如「每日报表 9AM EST」）；加 Filter 拦截无效数据，避免空跑和错误率累积。
4. **数据映射用 ID 不用文本**：下拉字段必须从下拉选，动态值要先 Search/Find 拿到 ID 再引用。
5. **加错误处理**：任何对外部 API 的生产流程都要有错误分支（告警 + 记录日志）。
6. **真数据测试**：用真实样本逐条/逐路径测试，包括失败场景，再上线。
7. **上线后监控**：盯任务/操作数消耗与错误率，定期查 Task History / Operations 面板。

## 指令

常用模式骨架：

```
基础触发-动作:   [Trigger] → [Action]            # 新邮件 → 建任务
多步顺序:        [Trigger] → [A1] → [A2] → [A3]  # 每步输出可被后续引用 {{N.field}}
条件分支:        Zapier Paths（Pro+）/ Make Router，必须带 fallback 兜底路径
批量处理:        Zapier Looping（每次迭代算一个 task！）/ Make Iterator + Aggregator
定时自动化:      Schedule by Zapier / Make Cron（0 8 * * *）
```

Make 内置数据函数（在映射框里直接用）：

```
{{lower(1.email)}}              # 转小写
{{substring(1.name; 0; 10)}}    # 取前 10 字符
{{replace(1.text; "-"; "")}}    # 去掉短横
{{first(1.items)}} {{length(1.items)}} {{map(1.items; "id")}}  # 数组
{{formatDate(1.date; "YYYY-MM-DD")}}  {{addDays(now; 7)}}      # 日期
{{round(1.price * 0.8; 2)}}     # 8 折，保留 2 位小数
```

Make 错误处理器四种类型：`Break`（停止+通知）、`Rollback`（回滚已完成操作）、`Commit`（保存部分结果继续）、`Ignore`（跳过错误继续下一条）。

## 示例

**Zapier 多步 Zap（新线索全链路）：**

```
Zap: "New Lead → CRM → Slack → Email"
1. 触发  Typeform - New Entry（Lead Capture Form）
2. 动作  HubSpot - Create Contact（Email/First Name/Lead Source="Website Form"）
3. 动作  Slack - 发到 #sales-leads（"New lead: {{Name}} from {{Company}}"）
4. 动作  Gmail - 发欢迎邮件（带个性化模板）
```

**Make Router 工单分流（必带 fallback）：**

```
[Zendesk: Watch Tickets] → [Router]
   ├ Route 1 priority=urgent  → [Slack] → [PagerDuty]
   ├ Route 2 priority=normal  → [Slack] → [Asana]
   └ Fallback                 → [Slack: overflow]
```

**Webhook 去重（幂等处理）：**

```
[Webhook] → [Airtable: Find by event_id] → [Filter: 未找到才继续]
          → [处理事件] → [Airtable: 写入 event_id]
```

## 注意事项

按严重度排序的「锋利边缘」：

- **CRITICAL — 下拉字段填文本而非 ID**：下拉显示可读文本但传给 API 的是 ID，手打「Marketing Team」会报 Bad Request / Invalid value。务必从下拉选；要动态值就先加 Search/Find 动作拿 ID（`{{2.id}}`）再引用。常见坑：Slack/Teams 用户 ID、CRM 联系人/公司 ID、项目/文件夹 ID。
- **CRITICAL — Zap 在 95% 错误率被自动禁用**：Zapier 对 7 天内错误率 ≥95% 的 Zap 自动关停。预防：加错误处理路径 + 用 Filter 拦坏数据 + 定期查 Task History。恢复：定位根因（多为 token 过期、限流、字段改名）→ 测试 → 手动重启 → 24h 密切观察。
- **HIGH — 循环消耗超预期任务数**：Zapier 中循环每次迭代单独计 task。1 触发 + 10 条 × 5 动作 = 51 tasks。优化：用「Create Many Rows」等批量端点、先聚合再发一条汇总、循环前先 Filter；高量场景改用 Make（按操作数计费更划算）。
- **HIGH — 应用更新打断现有 Zap**：连接的应用改 API/字段名会让昨天还正常的 Zap 失败（Field not found）。修复：查 Task History → 在编辑器重新选触发/动作刷新 schema → 重新映射 unknown 字段 → 新样本测试。预防：订阅关键应用 changelog、文档化字段映射、用副本 Zap 做实验。
- **HIGH — OAuth token 过期**：部分应用 60–90 天需重新授权；连接人离职后连接可能失效。修复：Settings → Apps → 重连。预防：用服务账号/共享邮箱而非个人账号、可用 API key 时优先于 OAuth、记录「谁连了什么」。
- **MEDIUM — Webhook 丢事件或重复**：webhook 是 fire-and-forget，慢/不可用会丢，重试会重。处理重复用幂等去重（存已处理 ID + Filter）；处理丢失用轮询触发器 + 定时对账。
- **MEDIUM — Make 操作数被错误重试吃光**：Make 按模块执行计操作数，失败重试 3 次 = 3 操作，错误处理器额外耗操作。优化：错误处理器尽早 `Break`、可预期失败用 `Ignore` 不重试、昂贵操作前先校验快速失败、别每分钟跑能每小时跑的场景。
- **MEDIUM — 定时触发器时区错配**：Zapier 展示本地时区但可能按 UTC 存储，换时区或 DST 会偏移。显式设业务时区、名称里标时区（「9AM EST」）、DST 切换前后验证、别卡整点和午夜。Make 用账号时区，`formatDate()` / `parseDate()` 需显式带时区。

通用原则：从简单起步、按需加复杂度；上线前用真数据测试；每条自动化清晰命名并文档化；监控错误与配额；知道何时该「毕业」到代码方案。

## 互见

- code-based 工作流（Inngest / Temporal）：需要自定义代码逻辑时。
- 浏览器自动化（Playwright / Puppeteer）：流程中需驱动浏览器时。
- API 设计：构建自定义 API 集成时。
- AI 智能体工具（Zapier MCP）：自动化需要 AI 能力时。
- 后端 / DevOps：高吞吐数据处理或自托管（n8n）部署时。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
