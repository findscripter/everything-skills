---
name: sales-prospecting
title: 销售线索挖掘与筛选
description: 当需要把 ICP 画像转成已验证、已打分的可触达线索清单（覆盖 B2B SaaS／通用 B2B／本地小微商家）时使用；做线索发现、资格审查、打分排序并产出含来源与置信度的线索表（Markdown 或 CSV）；不适用于撰写外呼文案（见 cold-email）或单账户深度竞品研究。触发词：prospecting、线索挖掘、build prospect list、找客户、lead gen、找 SaaS 公司、找 B2B 企业、找本地商家、ICP 匹配、target account list、qualified leads、外呼名单。
domain: 商业/sales
triggers: [prospecting, 线索挖掘, build prospect list, 找客户, lead gen, 找 SaaS 公司, 找 B2B 企业, 找本地商家, ICP 匹配, target account list, qualified leads, 外呼名单]
tags: [sales, prospecting, lead-generation, b2b, saas, icp, outbound, compliance]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Apollo, Clay, Clearbit, ZoomInfo, Hunter, Snov, Truelist, LinkedIn Sales Navigator, BuiltWith, Crunchbase, Google Maps, Yelp, Firecrawl, Browserbase, GitHub]
requires: []
related: [cold-email-writer, cro-revenue-advisor, sales-enablement, deal-desk-reviewer]
combines_with: [cold-email-writer, sales-enablement, email-drip-sequence]
license: MIT
source: coreyhaines31/marketingskills
source_license: MIT
---
## 何时使用

当用户要把一个 ICP（理想客户画像）转化为一份**已验证、已打分、可直接外呼**的线索清单时使用。覆盖三条业务线（motion）：

- **SaaS**：卖给其他 SaaS／数字化企业，看 ICP 匹配 + 技术栈匹配 + 增长信号（融资、招聘、产品迭代）。
- **B2B**：卖给非 SaaS 的 B2B（服务、制造、企业、中端市场），看行业 + 规模 + 地域 + 购买信号（触发事件、换供应商）。
- **本地小微（Local SMB）**：卖给本地店铺、健身房、餐厅、诊所、美容院等，看在营状态 + 官网状态 + 距离 + 决策人可触达性。

**不该用的边界**：
- 清单建好后**写外呼文案／序列** → 改用 cold-email。
- 对单个具体账户做**深度竞品研究** → 改用 competitor-profiling（这是研究，不是建表筛选）。
- 需要**线索路由、生命周期、CRM 交接** → 属于 RevOps 范畴，不在本条。

本条只负责「建表 + 资格审查」阶段。

## 步骤

固定五个阶段，工具与信号随业务线变，阶段不变：

1. **定义 ICP**：若存在 `.agents/product-marketing.md`（或 `.claude/product-marketing.md`、旧命名 `product-marketing-context.md`）先读取，只补问未覆盖的信息。整理出：① 企业属性匹配（行业、规模、营收带、地域、商业模式）；② 技术栈匹配（仅 SaaS）；③ 购买信号（为什么是现在）；④ 决策人画像；⑤ 排除条件（什么样直接 skip）。**输出**：一段 ICP 陈述 + 一份通过／淘汰勾选清单。没有它不要进入下一步。
2. **构建候选池（发现）**：候选数量取最终目标的 **2–3 倍**，因为筛选会大幅淘汰。SaaS／B2B 组合 2–3 个数据源交叉验证（Apollo/ZoomInfo 查企业属性，Clearbit/Clay 做富化，LinkedIn Sales Nav 做决策人映射）；本地小微以浏览器辅助为主，从 Google Maps 起步，再用 Yelp、官网、社媒、公开目录交叉核对。质量优先：25 条已验证胜过 250 条垃圾。
3. **逐条资格审查**：每条候选对照 ICP 清单打分，每条结论都要附**证据**（一两个来源 URL），不允许无依据断言。置信度三档：**High** = 至少两个独立来源或官方页面确认；**Medium** = 一个可信来源 + 一致的搜索证据；**Low** = 证据残缺或含糊，标注不确定项。B2B／SaaS 的邮箱联系人，**入最终表前必须验证可达性**（用 Truelist 等），无效／高风险邮箱不入表。
4. **打分与优先级**：Hot = 强 ICP 匹配 + 明确购买信号 + 决策人可触达 + 联系方式已验证；Warm = ICP 匹配 + 信号较弱或较旧 + 联系方式可验证；Cold = ICP 匹配松散 或 无明确信号 或 联系方式未验证；Skip = 命中排除条件（出 ICP、已关停、重复、无关、低置信）。默认目标配比约 20% Hot、30% Warm，其余 Cold/Skip。
5. **输出线索表**：默认聊天内 Markdown 表；超过 25 行或用户要文件时改 CSV。表后**必加「优先外呼目标（Top outreach targets）」**：挑 3–5 条 Hot，每条一句话说明为什么先打它。

## 指令

**SaaS／B2B 聊天表（≤25 行）列头：**
```
| Score | Company | Industry | Size | Signal | Contact | Email status | Source | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
```

**本地小微聊天表（≤15 行）列头：**
```
| Score | Business | Category | Area | Website status | Website/Social | Phone | Why it's a prospect | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
```

**SaaS／B2B CSV 列：**
```csv
score,company,domain,industry,size_band,country,signal,contact_name,contact_title,contact_email,email_status,linkedin,source_urls,why_prospect,confidence,verified_date,notes
```

**本地小微 CSV 列：**
```csv
score,business,category,area,distance_km,website_status,website_url,social_urls,phone,email,source_urls,why_prospect,confidence,verified_date,notes
```

表后固定附：优先外呼目标、搜索参数（业务线、ICP、地点/半径、目标数、生成日期）、未决问题（无法验证、需用户复核的项）。

**定稿前质量检查清单：**
- [ ] 去重（SaaS/B2B 按域名，本地按 商家名+地址）。
- [ ] 每条 Hot 都有已验证联系方式 + 至少一个来源 URL。
- [ ] 没有邮箱验证失败的线索混入；失败的单独放「invalid」桶并标记。
- [ ] 没有「Hot」却缺购买信号的线索。
- [ ] 置信度诚实——「High」需两个独立来源，不能是自己两次搜索。
- [ ] 无来自禁止抓取的线索（LinkedIn 批量、Google Maps 批量导出等）。
- [ ] 每条联系方式都留存来源 URL + 日期（GDPR / CAN-SPAM 溯源）。
- [ ] 最终数量符合用户要求，或已说明为何更少（质量门槛）。

## 示例

用户：「帮我在杭州找 20 家没有官网或官网很差的健身房，要能联系到老板。」
1. 判定业务线 = 本地小微；ICP = 杭州在营健身房，官网缺失/低质，能触达决策人；目标 20，取候选 ~50。
2. 浏览器从 Google Maps 搜「杭州 健身房」，逐家核对 Yelp/点评、是否有官网、社媒、电话；记录官网状态。
3. 逐家打分：在营 + 无官网 + 有公开老板/前台电话 → Hot；有官网但很旧 → Warm；信息残缺 → Low/Skip。每条留来源 URL + 验证日期。
4. 输出本地小微表（≤15 行优先，溢出转 CSV），表后给 3–5 个优先外呼目标，例如「XX 健身工作室：无官网、点评近 30 天仍活跃、前台电话公开，最易切入」。

## 注意事项

合规护栏（每次都先读）：
1. **禁止批量抓取** LinkedIn、Google Maps、付费墙站点、限流 API。浏览器是辅助研究工具，不是爬虫。
2. **不绕过** CAPTCHA、登录墙、机器人防护；要登录的就只用公开可见内容。
3. **只用公开商务联系渠道**：info@／hello@／contact@ 及商家自有官网上公布的具名角色邮箱（创始人、店主）。私人邮箱需合法依据（已有关系、opt-in 等）。
4. **GDPR / CAN-SPAM / CASL 意识**：每条联系方式都留存来源 URL 与日期，供下游外呼合规与审计。
5. **不得转售**从 Google Maps、LinkedIn 等条款禁止平台提取的数据。为用户自己外呼建表可以，包装成产品出售不行。
6. **自我限速**：即便是公开源也要拉开请求间隔，别表现得像机器人。

常见错误：没有 ICP 就开始发现；把数据源当权威不交叉核对（Apollo/ZoomInfo 常过期）；加联系人不验证邮箱（退信会快速毁掉冷邮信誉）；批量抓 LinkedIn/Google Maps（封号 + 违反 ToS）；混用业务线评分（别拿「官网状态」去评 SaaS）；ICP 匹配但无购买信号还打「Hot」；缺来源 URL（每条都应可溯源）；忘记保留授权/溯源记录。

## 互见

- **first-principles-thinking**：拆解「为什么是现在」的购买信号、从根因推导 ICP 假设时可借用。
- **csv-data-cleaner**：导出 CSV 线索表后做去重、字段规整、清洗时使用。
- **fact-checking**：核验线索证据、把置信度从 Low 提升到 High 的交叉验证方法可参考。

---
本条采编自 coreyhaines31/marketingskills（MIT）。
