---
name: schema-markup-builder
title: 结构化数据 Schema 标记
description: 当需要为网站实现、审计或校验结构化数据（Schema 标记）以争取富媒体结果或提升 AI 搜索可见性时使用；做选型、生成可直接粘贴的 JSON-LD 并校验修复，产出审计报告与修正后的标记；不适用于通用 SEO 审计或站点架构/抓取问题。触发词：结构化数据、JSON-LD、富媒体结果、FAQPage、Product schema、schema.org
domain: 商业/seo
triggers: [结构化数据, schema 标记, schema.org, JSON-LD, 富媒体结果, rich results, rich snippets, FAQ schema, FAQPage, Product schema, HowTo schema, Article schema, Organization schema, Search Console 结构化数据错误, AI 搜索可见性, 富媒体片段]
tags: [seo, schema, structured-data, json-ld, rich-results, marketing, ai-search, google-search-console]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Write, Edit, Bash]
requires: []
related: [seo-audit, seo-site-architecture, ai-search-seo, ai-answer-engine-seo]
combines_with: [seo-audit, programmatic-seo-builder, ai-search-seo]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

当用户希望为网站**实现、审计或校验**结构化数据（Schema 标记），以争取 Google 富媒体结果、提升点击率，或让内容更易被 AI 搜索系统解析时使用。典型信号：提到「结构化数据」「schema.org」「JSON-LD」「富媒体结果/片段」「FAQ schema」「Product schema」「HowTo schema」，或问「为什么我的内容没有富媒体结果」「如何提升 AI 搜索可见性」「Search Console 报结构化数据错误」。

**不该用的边界：**
- 通用的技术与内容 SEO 审计 → 用 `seo-audit`（问题范围超出结构化数据时）。
- URL 结构、内链、导航等站点架构/抓取问题 → 用 `site-architecture`。
- 决定「写什么内容」 → 用 `content-strategy`（在实现 Article schema 之前确定优先页面）。
- 数千页规模化批量打标 → 用 `programmatic-seo`（本技能的 schema 模式作为其模板输入）。

## 步骤

开始前先收集上下文（若存在 `marketing-context.md`，先读它，只追问缺失项）：现状（是否已有 schema、是否已出富媒体结果、GSC 是否报错）、站点细节（CMS 平台、需打标的页面类型、能否直接编辑 `<head>` 还是需插件/GTM）、目标（目标富媒体类型、AI 搜索可见性、是修旧错还是新增）。

本技能有三种工作模式：

**模式 1 — 审计现有标记**（已有站点，想知道有什么、坏在哪）
1. 对页面 HTML 运行 `scripts/schema_validator.py`（或粘贴 URL 手动检查）。
2. 查 Google Search Console → 增强功能（Enhancements），核对所有 schema 错误报告。
3. 对照 `references/schema-types-guide.md` 的必填字段交叉检查。
4. 交付审计报告：已有什么、坏了什么、缺了什么、修复优先级。

**模式 2 — 新增 schema**（从零或为新页面类型打标）
1. 识别页面类型，按下方选型表选对 schema 类型。
2. 从 `references/implementation-patterns.md` 取对应 JSON-LD 模式。
3. 用真实页面内容填充（占位值明确标注）。
4. 给出放置建议（`<head>` 内联 `<script>`、CMS 插件、GTM 注入）。
5. 交付每个页面类型完整、可直接粘贴的 JSON-LD。

**模式 3 — 校验与修复**（schema 已存在但不出富媒体结果，或 GSC 报错）
1. 在 rich-results.google.com 和 validator.schema.org 测试。
2. 把错误映射到具体的缺失或格式错误字段。
3. 交付修正后的 JSON-LD，并附变更日志解释每处修复。
4. 解释「为什么这样修能成」，避免重蹈覆辙。

## 指令

**选型（Schema Type Selection）** — 选对页面类型的 schema；兼容类型可叠加，但不要给不匹配页面内容的 schema 打标。

| 页面类型 | 主 Schema | 辅助 Schema |
|----------|-----------|-------------|
| 首页 | Organization | WebSite（含 SearchAction） |
| 博客/文章 | Article | BreadcrumbList、Person（作者） |
| 操作指南 | HowTo | Article、BreadcrumbList |
| FAQ 页 | FAQPage | — |
| 产品页 | Product | Offer、AggregateRating、BreadcrumbList |
| 本地商家 | LocalBusiness | OpeningHoursSpecification、GeoCoordinates |
| 视频页 | VideoObject | Article（视频嵌入文章时） |
| 分类/聚合页 | CollectionPage | BreadcrumbList |
| 活动 | Event | Organization、Place |

**叠加规则：** 非首页只要页面上有面包屑，就加 `BreadcrumbList`；`Article` + `BreadcrumbList` + `Person` 是博客内容的常见三件套；绝不给不卖商品的页面加 `Product`（Google 会判定滥用）。

**实现方式：** 一律用 **JSON-LD**，不用 Microdata/RDFa（后者已是遗留方案）。Google 推荐、最易维护、且无需改动 HTML。同页可有多个 schema 块——用多个 `<script>` 标签，或在数组里嵌套。放置示例：

```html
<head>
  <!-- 其它 meta 标签 -->
  <script type="application/ld+json">
  { ... 你的 schema ... }
  </script>
</head>
```

**站点级 vs 页面级：** Organization 放站点模板头部（公司标识、logo、社交资料）；WebSite + SearchAction 放首页（站内链接搜索框）；内容相关 schema 按页放（博客用 Article、产品页用 Product）；BreadcrumbList 每个非首页都加且须与可见面包屑一致。

**CMS 实现捷径：**
- WordPress：Yoast SEO 或 Rank Math 自动处理 Article/Organization；HowTo/FAQ 用其区块加自定义 schema。
- Webflow：按页加自定义 `<head>` 代码，或用 CMS 生成动态 JSON-LD。
- Shopify：Product schema 自动生成；Organization 和 Article 手动加。
- 自建 CMS：用拉取真实字段值的模板在服务端生成 JSON-LD。

**校验（发布前务必做，三者全用）：**
1. **Google Rich Results Test** — `https://search.google.com/test/rich-results`：判断 Google 能否解析、哪些富媒体类型合格、区分 warning 与 error（error = 无富媒体结果，warning = 可能仍生效）。
2. **Schema.org Validator** — `https://validator.schema.org`：对照完整 schema.org 规范的更广校验，能抓到 Google 漏掉、或影响非 Google 解析器的错误。
3. **本地脚本** — `python3 scripts/schema_validator.py page.html`：提取页面所有 JSON-LD 块、按类型校验必填字段、对完整度打 0-100 分。
4. **Google Search Console**（部署后）：增强功能区显示规模化的真实错误，部署后 1-2 周更新，是唯一能看富媒体结果表现数据（曝光、点击）的地方。

**沟通标准：** 结论先行（先给答案再解释）；每条结论都含 What + Why + How；行动有负责人和截止时间（不说「我们应该考虑」）；置信标注 🟢 已验证（测试通过）/ 🟡 中等（合规但未测）/ 🔴 假设（待核实）。

## 示例

**主动触发（无需用户开口就要点出）：**
- FAQ 内容页缺 FAQPage schema → 任何含问答格式却无 FAQPage 的页面都在白白丢富媒体结果，点出并主动生成。
- Article schema 缺 `image` 字段 → 这是 Article 富媒体结果的必填字段，没有它 Google 不展示文章卡片。
- schema 经 GTM 注入 → GTM 客户端渲染的 schema 常不被 Google 索引，建议改服务端注入。
- `dateModified` 早于 `datePublished` → 逻辑上不可能、必然校验失败，点出并修复。
- 同一实体出现多个冲突 `@type`（如同一公司分别定义 `LocalBusiness` 与 `Organization`）→ 应合并或让其一扩展另一个。
- Product schema 缺 `offers` → 没有 Offer（价格、可购状态、货币）的 Product 不会出产品富媒体结果，点出缺失的 Offer 块。

**产出物对照：**
- 要「schema 审计」→ 得审计报告：各页找到的 schema、必填字段在缺情况、错误、完整度分、优先修复项。
- 要「某页面类型的 schema」→ 得完整 JSON-LD 块，可直接粘贴，占位值明确标注。
- 要「修我的 schema 错误」→ 得修正后 JSON-LD + 逐条解释的变更日志。
- 要「AI 搜索可见性评审」→ 得实体标记缺口分析 + FAQPage + Organization `sameAs` 建议。
- 要「实现计划」→ 得逐页 schema 实施矩阵 + 各 CMS 专属说明。

## 注意事项

**真正决定富媒体结果合格与否的常见错误：**

| 错误 | 为何坏事 | 修法 |
|------|----------|------|
| 缺 `@context` | schema 无法解析 | 始终包含 `"@context": "https://schema.org"` |
| 缺必填字段 | Google 不出富媒体结果 | 对照 `references/schema-types-guide.md` 区分必填与推荐 |
| `name` 为空或泛化 | 校验失败 | 用真实、具体的值，不要 `""` 或 "N/A" |
| `image` 用相对路径 | 无效，必须绝对路径 | 用 `https://example.com/image.jpg`，不用 `/image.jpg` |
| 标记与可见页面内容不符 | 违反政策 | 绝不为页面上没有的内容打标 |
| 把 `Product` 嵌进 `Article` | 无效类型组合 | 保持 schema 类型扁平，或按正确嵌套规则 |
| 使用已废弃属性 | 被校验器忽略 | 对照当前 schema.org 复核——类型会演进 |
| 日期格式错误 | ISO 8601 校验失败 | 用 `"2024-01-15"` 或 `"2024-01-15T10:30:00Z"` |

**Schema 与 AI 搜索**（如今越来越重要，不只为 Google 富媒体结果）：AI 搜索系统（Google AI Overviews、Perplexity、ChatGPT Search、Bing Copilot）靠结构化数据更快更可靠地理解内容。干净的 schema 能让它们识别内容类型（HowTo vs 观点 vs 产品）；FAQPage schema 提升被引用概率（AI 偏爱可直接抽取的结构化问答）；带 `author` 和 `datePublished` 的 Article 帮 AI 判断时效与权威；带 `sameAs` 的 Organization 跨网连接实体、增强实体识别。可执行动作：① 给任何含问答的页面加 FAQPage（哪怕只有 3 问）；② 给 `author` 加指向真实作者资料的 `sameAs`（LinkedIn、Wikipedia、Google Scholar）；③ 给 `Organization` 加链接社交资料与 Wikidata 的 `sameAs`；④ 保持 `datePublished` 与 `dateModified` 准确（AI 按时效过滤）。

## 互见

- `seo-audit`：完整的技术与内容 SEO 审计。问题范围超出结构化数据时用它；纯 schema 工作仍用本技能。
- `site-architecture`：URL 结构、内链、导航。当根因是架构而非 schema 时用它。
- `content-strategy`：决定创建什么内容。在实现 Article schema 前用它确定优先页面；schema 本身不归它管。
- `programmatic-seo`：数千页规模化打标。本技能的 schema 模式作为其模板方法的输入。

---

采编自 alirezarezvani/claude-skills（MIT License），原作者 Alireza Rezvani。
