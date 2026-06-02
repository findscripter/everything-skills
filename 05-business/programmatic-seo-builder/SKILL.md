---
name: programmatic-seo-builder
title: 程序化 SEO 批量建页
description: 当需要用模板+数据批量生成大量针对不同关键词/地点/实体的 SEO 落地页时使用；产出建页策略、12 套 Playbook 选型、页面模板（URL/标题/Meta/Schema）、内链与索引方案及质量清单；不适用于已上线页面的技术 SEO 审计或纯内容文案写作。触发词：programmatic SEO、pSEO、程序化SEO、批量建页、模板页、pages at scale、location pages、对比页、集成页、目录页、词条页
domain: 商业/seo
triggers: [programmatic SEO, pSEO, 程序化SEO, 批量建页, 模板页, pages at scale, location pages, 对比页, 集成页, 目录页, 词条页, 生成100个页面, 数据驱动落地页]
tags: [seo, programmatic-seo, content-strategy, templates, landing-pages, internal-linking, marketing]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [sitemap.xml, schema.org, Google Search Console, 模板引擎, CSV/数据库数据源]
requires: []
related: [seo-site-architecture, schema-markup-builder, seo-content-writer, seo-audit]
combines_with: [schema-markup-builder, seo-content-writer, seo-site-architecture]
license: MIT
source: coreyhaines31/marketingskills
source_license: MIT
---
## 何时使用

需要**用模板和数据批量生成成百上千个结构相似、但分别命中不同关键词/地点/实体的 SEO 落地页**时使用。典型形态：模板页（"简历模板"）、对比页（"Webflow vs WordPress"）、集成页（"Slack 集成"）、地点页（"奥斯汀的牙医"）、人群页（"房产 CRM"）、词条页（"什么是 pSEO"）、目录页（"AI 文案工具"）、画像页（"Stripe CEO"）。

**不该用的边界：**
- 已上线页面的技术 SEO 审计（爬取错误、404、收录排查执行层）→ 用 `seo-audit` 类技能，本条只管策略/模板/内容规划。
- 单篇高质量文章的撰写/优化 → 见互见 `seo-content-writer`。
- 没有真实搜索需求、或无独特数据支撑的"为建而建"——会触发薄内容惩罚，不要用。

## 步骤

1. **前置上下文**：若存在 `.agents/product-marketing.md`（或 `.claude/product-marketing.md`、旧版 `product-marketing-context.md`），先读取再提问，只补充未覆盖信息。明确产品/服务、目标人群、这批页面的转化目标。
2. **机会评估**：找出可重复的关键词结构（变量是什么、有多少种唯一组合）；用聚合搜索量、头部 vs 长尾分布、趋势方向验证需求；看清当前谁在排名、能否真实竞争。
3. **选 Playbook（12 套）**：按手里的资产匹配——有专有数据→目录/画像；有集成生态→集成；设计/创意产品→模板/示例；多细分人群→人群；本地化业务→地点；工具型→换算；内容/专业度→词条/精选；竞品多→对比。可叠加（如"圣地亚哥最好的联合办公空间"=精选+地点）。
4. **确定数据源**：每个页面靠什么数据填充？是第一方/抓取/授权/公开？多久更新一次？数据可防御性排序（强→弱）：专有 > 产品衍生 > 用户生成 > 独家授权 > 公开数据。
5. **设计模板**：含目标关键词的标题区 + **独特引言（不是只换变量）** + 数据驱动小节 + 相关页面/内链 + 与意图匹配的 CTA。用条件化内容和每页独有的分析/洞察保证唯一性。
6. **搭内链架构**：Hub-and-Spoke 模型——Hub 为主分类页，Spoke 为各程序化页，相关 Spoke 之间互链；避免孤岛页（每页可从主站到达 + XML sitemap + 带结构化数据的面包屑）。
7. **索引策略**：优先高搜索量模式；极薄变体加 noindex；管理爬取预算；按页面类型拆分多个 sitemap。
8. **上线前自检 + 上线后监测**（见下方清单）。

## 指令

**核心原则（务必遵守）：**
- 每页提供**该页专属的独特价值**，不能只是模板里换变量。
- URL **用子目录不用子域名**——子目录聚合域名权重，子域名会拆分：
  - 好：`yoursite.com/templates/resume/`
  - 差：`templates.yoursite.com/resume/`
- 真实匹配搜索意图；质量优先于数量（100 个好页 > 10000 个薄页）。
- 规避 Google 惩罚：不做门页（doorway pages）、不堆砌关键词、不重复内容、对用户有真实效用。

**常见 Playbook 的 URL 范式：**
- 模板 `/templates/[type]/`；精选 `/best/[category]/`；换算 `/[from]-to-[to]-converter/`；对比 `/compare/[x]-vs-[y]/`；示例 `/examples/[type]/`；地点 `/[service]/[city]/`；人群 `/for/[persona]/`；集成 `/integrations/[product]/`；词条 `/glossary/[term]/`；翻译 `/[lang]/[page]/`（配 hreflang）；目录 `/directory/[category]/`；画像 `/companies/[name]/`。

**上线前清单：**
- [ ] 每页有独特价值、答得上搜索意图、可读有用
- [ ] 唯一的标题与 Meta 描述、规范的标题层级、已上 Schema、页面速度可接受
- [ ] 接入站点架构、相关页互链、无孤岛页
- [ ] 进 XML sitemap、可爬取、无冲突的 noindex

**上线后监测**：收录率、排名、流量、互动、转化；警惕薄内容警告、排名下跌、人工处罚、爬取错误。

## 示例

**场景：CRM 想做"CRM for [行业]"人群页（房产、医疗…）**
1. 先读 product-marketing 上下文 → 识别为**人群（Personas）Playbook**。
2. 为每个行业变体单独做关键词研究，确认搜索量。
3. 数据要求：每个行业需有真实差异化内容——行业专属痛点、相关功能、该细分的客户证言、专属用例，**绝不只是把行业名塞进同一模板**。
4. 模板：行业关键词标题 + 行业专属引言 + 数据小节 + 内链回主站/相关行业页 + 行业化 CTA。
5. URL：`/for/real-estate/`；用 Hub-and-Spoke 把各行业页与主页互链。
6. 上线前过质量清单，警惕薄内容。

**反例（要避免）：** 仅替换城市名生成"[城市]的牙医"却内容雷同（薄内容）；多页争抢同一关键词（关键词自食）；建无搜索需求的页（过度生成）；数据过期错误；页面只为 Google 不为用户。

## 注意事项

- **薄内容是头号杀手**：500 个程序化页只收录 80 个，最可能就是内容太薄——Google 会主动不收录低价值页，无论你怎么提交。先增强唯一性，再强化内链、提交 sitemap、查 robots.txt、用 Search Console 请求收录。
- 数据准确性直接决定可信度：画像/词条/对比类页面不要做成"维基百科洗稿"或字典释义搬运，要有独家洞察或聚合。
- 翻译类页面需真人母语审校 + 正确 hreflang，不要纯机翻。
- 换算/工具类页面要求实时准确数据与可用交互，移动端友好。

## 互见

- `seo-content-writer`：单篇 SEO 文章/落地页文案的撰写与优化（本条侧重批量建页的策略与模板）。
- `csv-data-cleaner`：清洗用于批量填充页面的数据源（地点、实体、对比项等）。
- `frontend-design`：将页面模板落地为前端页面/组件。

---
*本条采编自 coreyhaines31/marketingskills（MIT）。*
