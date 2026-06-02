---
name: seo-meta-tags-optimizer
title: Meta 标签与 Open Graph 社媒卡片优化
description: 当需要为某个网页打造或重写 title/meta description 以及 OG、Twitter 社媒卡片等元标签、提升搜索点击率与分享预览质量时使用；产出可直接粘贴的完整 meta 代码块（含三套标题/描述备选、社媒卡片、CTR 优化与 A/B 测试建议）；不适用于正文内容写作、结构化数据 schema、技术 SEO 部署与外链/关键词难度抓取；触发词：meta 标签、标题优化、元描述、TDK、Open Graph、OG 标签、社交预览、点击率、CTR。
domain: 商业/seo
triggers: [meta 标签优化, 标题标签优化, 元描述优化, TDK 优化, Open Graph 标签, OG 标签不显示, 社交分享预览不对, 点击率太低, 提升 CTR, Twitter Card, title tag]
tags: [seo, meta-tags, title-tag, meta-description, open-graph, twitter-card, ctr, social-sharing]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [schema-markup-builder, seo-content-writer, technical-seo-checker, seo-entity-optimizer]
combines_with: [seo-content-writer, schema-markup-builder, seo-audit]
license: Apache-2.0
source: aaron-he-zhu/seo-geo-claude-skills
source_license: Apache-2.0
---
## 何时使用

- 需要为某个网页**新建或重写元标签**：title tag、meta description，以及 Open Graph / Twitter Card 等社媒分享卡片。
- 现有标题/描述点击率（CTR）偏低、社媒分享预览（缩略图/标题/摘要）显示异常或不吸引人，需要诊断并改写。
- 想为标题/描述设计 A/B 测试变体来提升 SERP 点击率。
- 触发词：meta 标签、标题优化、元描述、TDK、Open Graph、OG 标签、社交预览、点击率、CTR。

不该用的边界：
- 不写正文内容（关键词布局、E-E-A-T、内链）——交给 `seo-content-writer`。
- 不产出结构化数据（JSON-LD / Schema.org）——交给 `schema-markup-builder`。
- 不做技术 SEO 部署（sitemap、robots、canonical 服务端逻辑、Core Web Vitals）。
- 不抓取关键词搜索量/难度、不做外链建设；没有搜索控制台数据时直接向用户索取现有标签、目标关键词与竞品。

## 步骤 / 指令

输入：`page_url`、`page_type`（博客/产品/落地页/服务/首页）、`primary_keyword`、可选 `secondary_keywords[]`、`audience`、主 CTA、独特价值主张。缺失时先问，不臆造。

```
1. 收集页面信息
   - URL / 页面类型 / 主关键词 / 次关键词 / 受众 / 主 CTA / 独特价值主张。

2. 写标题 title tag —— 给 3 套备选
   - 目标 50-60 字符（英文）；超 65 必被截断。主关键词前置（front-load）。
   - 品牌名仅在加分时才放，且放末尾。意图必须与页面内容一致。
   - 按意图选公式：
       信息型  How to [动作] in [年份] / [主题]: The Complete Guide ([年份]) / What Is [主题]?
       清单型  [N] [主题] Tips That [结果] / [N] Best [项目] in [年份]
       对比型  [A] vs [B]: [差异点]
       商业型  [产品] - [收益] | [品牌] / [产品] Review ([年份]): [结论]
       本地型  Best [服务] in [城市] ([年份])
   - 每套标注：字符数、所用 power word、关键词位置。

3. 写 meta description —— 给 3 套备选
   - 目标 150-160 字符；自然含主关键词；具体收益 + CTA；真实预览页面内容。
   - 公式：[页面提供什么] + [收益] + [CTA]；或框架 AIDA / PAS / Benefit-Proof-CTA。
   - 每套标注：字符数、CTA、情绪触发点。

4. 生成社媒与辅助标签（HTML，见示例代码块）
   - Open Graph：og:type / og:url / og:title / og:description / og:image / og:site_name / og:locale。
   - Twitter Card：twitter:card（文章用 summary_large_image）/ title / description / image / image:alt。
   - 辅助：canonical、robots、viewport、author；文章类补 article:published_time / modified_time / author / section / tag。
   - og:title / og:description 可与 HTML title/description 不同，专为分享优化。

5. CORE-EEAT 对齐自检
   - C01 意图对齐：标题承诺是否匹配页面内容？不过则重写标题。
   - C02 直答：描述是否反映页面顶部即可获得的答案？不过则重构内容或重写描述。

6. CTR 优化 + A/B 建议
   - 标注命中的 CTR 增益元素（见下表），给 Version A / Version B + 假设。
```

CTR 增益参考（用于解释取舍，非绝对值）：

| 元素 | 典型 CTR 增益 |
|---|---|
| 标题加括号/方括号 | +10~38% |
| 标题含数字 | +20~30% |
| 匹配搜索意图 | +15~25% |
| 当前年份 | +10~15% |
| 问句格式 | +10~15% |
| 描述含 CTA | +5~10% |

A/B 测试方法：记录 30 天基线 CTR（≥1000 次展示）→ 写单一假设 → **每次只改一个元素** → 留 3~7 天重抓 → 监测 30+ 天（剔除前 7 天）→ 在相近平均排名下对比，决定保留/回滚/迭代。

修饰词库（按目的）：新鲜=年份/Updated/Latest；全面=Complete/Ultimate/In-Depth；易用=Easy/Simple/No-Code；权威=Expert/Pro/Data-Driven；价值=Free/Budget/Open-Source；格式=Guide/Checklist/Template；社会证明=Trusted/[N]+ Users/#1 Rated。

## 示例

输入：「为一篇『如何在 2026 年开始做播客』的博文做 meta 标签」。产出可直接粘贴的完整代码块：

```html
<!-- Primary -->
<title>How to Start a Podcast in 2026: Complete Beginner's Guide</title>
<meta name="description" content="Learn how to start a podcast in 2026 with our step-by-step guide. Covers equipment, hosting, recording, and launching your first episode.">
<link rel="canonical" href="https://example.com/start-a-podcast">

<!-- Open Graph -->
<meta property="og:type" content="article">
<meta property="og:url" content="https://example.com/start-a-podcast">
<meta property="og:title" content="How to Start a Podcast in 2026 (Beginner's Guide)">
<meta property="og:description" content="Equipment, hosting, recording, and launch — everything you need to publish your first episode.">
<meta property="og:image" content="https://example.com/img/podcast-1200x630.jpg">
<meta property="og:site_name" content="Example">
<meta property="og:locale" content="en_US">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="How to Start a Podcast in 2026 (Beginner's Guide)">
<meta name="twitter:description" content="Equipment, hosting, recording, and launch — your first episode, step by step.">
<meta name="twitter:image" content="https://example.com/img/podcast-1200x630.jpg">
<meta name="twitter:image:alt" content="Podcast setup with microphone and laptop">

<!-- Additional -->
<meta name="robots" content="index, follow">
<meta name="author" content="Jane Doe">
```

og:image 推荐 1200x630px（最小 600x315，JPG/PNG，图内文字 <20%）；Twitter summary_large_image 最小 300x157。

## 注意事项

- **字符上限随语言变化**：英文标题 50-60、德语 50-55、日韩 30-35、中文 28-32（CJK 字宽更大，括号常用）；CJK 描述目标约 70-80 字而非 150-160。不要按字数硬套，超出可见区会被截断。
- **不要逐字翻译**做本地化：跑本地化关键词研究，CTA 按文化调整，发布前预览实际显示。
- 年份/“最新/Best”类修饰词只在内容确实当期、当月真审过时才用，否则属误导。
- 禁忌：关键词堆砌、标题重复、全大写、夸大标题党、非品牌页面却把品牌放最前。
- og:image 用**绝对 URL**；分享预览不更新时检查 canonical 与缓存（各平台有抓取缓存）。
- 经用户确认后，可把成稿与关键结论存档（如 `memory/content/YYYY-MM-DD-<topic>.md`）。

## 互见

- related：`seo-content-writer` —— 元标签三件套常作为内容写作的一环，二者覆盖范围互补。
- related：`seo-audit` —— 审计发现 title/description 问题后用本技能批量改写。
- related：`conversion-copywriter` —— 描述与 CTA 的文案可借其转化写作方法打磨。
- combines_with：`schema-markup-builder` —— 元标签就绪后补结构化数据，凑齐完整 SERP/富结果展示。
- combines_with：`social-media-content-creator` —— OG/Twitter 卡片就绪后联动社媒分发内容。

---

采编自 aaron-he-zhu/seo-geo-claude-skills（Apache-2.0），按本仓库 SCHEMA 适配重写，非逐字翻译。
