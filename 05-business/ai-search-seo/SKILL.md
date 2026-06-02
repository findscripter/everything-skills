---
name: ai-search-seo
title: 面向 AI 搜索与 LLM 引用的 SEO 优化
description: 当需要让内容被 AI 搜索与大模型引用（AI Overviews、ChatGPT、Perplexity、Claude、Gemini、Copilot）时使用；做 AI 可见性审计、按结构/权威/存在三支柱重写内容并产出可抽取的答案块、Schema 与 robots.txt 放行清单；不适用于纯传统排名 SEO 或不在乎 AI 引用的场景；触发词：AI SEO、AEO、GEO、AI 引用、LLM 可见性、AI Overviews
domain: 商业/seo
triggers: [AI SEO, AEO, GEO, AI 引用, LLM 可见性, AI Overviews, 答案引擎优化, 生成式引擎优化, 被 ChatGPT 引用, Perplexity 引用, AI 搜索可见性, schema 结构化数据]
tags: [商业, seo, ai-search, aeo, geo, content-optimization, llm-citation, schema, marketing]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [semrush, ahrefs, gsc, ga4, schema-markup]
requires: []
related: [ai-answer-engine-seo, schema-markup-builder, seo-content-writer, seo-audit]
combines_with: [seo-content-writer, schema-markup-builder, content-engine-strategist]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 想让内容被 AI 搜索系统与大模型**引用为来源**（Google AI Overviews、ChatGPT、Perplexity、Claude、Gemini、Copilot），而不只是被传统搜索排名。
- 用户提到 AI SEO、AEO（答案引擎优化）、GEO（生成式引擎优化）、LLM 可见性、AI 引用。
- 传统 SEO 已不足以回答问题，需要专门解决 AI 可发现性。

**不该用的边界：**
- 纯传统排名/技术 SEO 审计 → 用 `seo-audit`。
- 只做结构化数据落地 → 用 `schema-markup`。
- 内容规划、对比页生成、规模化建站分别走 `content-strategy` / `competitor-alternatives` / `programmatic-seo`。
- 缺少目标查询、权限或成功标准时，先停下来问清楚，不要凭空优化。

核心区别：传统 SEO 让你**被排名**，AI SEO 让你**被引用**。结构良好的页面即使排在第 2、3 页也可能被引用——AI 按内容质量、结构与相关性选源，而非单纯排位。

## 步骤

**0. 先读上下文**：若存在 `.agents/product-marketing-context.md`（旧版 `.claude/product-marketing-context.md`），先读它，只补问未覆盖的信息。需收集：当前 AI 可见性、内容类型与域名权重、目标（被引用/进 AI Overviews/对标竞品）、竞争格局。

**1. AI 可见性审计**
- 选 10–20 个最重要查询，在 Google AI Overview / ChatGPT / Perplexity 逐一测试，记录「是否引用你 / 引用了谁」。查询类型覆盖：「什么是〈品类〉」「最佳〈品类〉用于〈场景〉」「〈你〉vs〈竞品〉」「如何〈解决某问题〉」「〈品类〉价格」。
- 分析竞品被引你未被引的原因：内容结构、权威信号、新鲜度、Schema、第三方露出。
- 逐页做**可抽取性检查**（见下「指令」清单）。

**2. AI 爬虫放行检查**：核对 robots.txt 是否放行各平台爬虫（被 `Disallow` 即无法被该平台引用）：
- `GPTBot`、`ChatGPT-User` → OpenAI
- `PerplexityBot` → Perplexity
- `ClaudeBot`、`anthropic-ai` → Anthropic
- `Google-Extended` → Gemini 与 AI Overviews
- `Bingbot` → Copilot
折中策略：屏蔽**纯训练**爬虫（如 Common Crawl 的 `CCBot`），放行上述搜索爬虫。

**3. 按三支柱优化**
- 支柱一 · 结构（让内容可抽取）
- 支柱二 · 权威（让内容可引用）
- 支柱三 · 存在（出现在 AI 取材的地方）

**4. 部署 Schema 结构化数据**（落地交给 `schema-markup` skill）。

**5. 持续监测**：每月手动跑 top 20 查询，或用工具跟踪「AI 语音份额」。

## 指令

**可抽取性检查清单（逐优先页过一遍）：**
- 首段是否有清晰定义？
- 是否有**自包含答案块**（脱离上下文也成立）？
- 统计数据是否标注来源？
- 「X vs Y」类查询是否有对比表？
- 是否有自然语言提问的 FAQ？
- 是否有 Schema（FAQ/HowTo/Article/Product）？
- 是否有作者署名与资历？
- 是否近 6 个月内更新？
- 标题结构是否匹配查询表述？
- robots.txt 是否放行 AI 爬虫？

**支柱一 · 结构规则**（AI 抽取的是段落而非整页）：
- 每节开头直接给答案，别埋。
- 关键答案段控制在 **40–60 词**（最利于摘要抽取）。
- H2/H3 用用户真实提问的措辞。
- 对比内容用表格胜过散文；流程内容用编号列表胜过段落。
- 每段只表达一个明确观点。
- 内容块模式：定义块（什么是 X）/ 步骤块（如何 X）/ 对比表（X vs Y）/ 利弊块 / FAQ 块 / 带来源的统计块。

**支柱二 · 权威**（Princeton GEO 研究，KDD 2024，基于 Perplexity，9 种方法的可见性提升）：

| 方法 | 提升 | 应用 |
|---|---|---|
| 引用来源 | +40% | 加带链接的权威参考 |
| 加统计数据 | +37% | 具体数字 + 来源 |
| 加引述 | +30% | 专家姓名 + 头衔 |
| 权威语气 | +25% | 体现专业度 |
| 提升清晰度 | +20% | 简化复杂概念 |
| 专业术语 | +18% | 领域术语 |
| 独特词汇 | +15% | 提高用词多样性 |
| 流畅度优化 | +15–30% | 改善可读性与行文 |
| ~~关键词堆砌~~ | **−10%** | **反而损害 AI 可见性** |

最佳组合：流畅度 + 统计数据。低排名站点收益更大，配合引用最高可达 **+115%**。另需：原始研究优先于二手汇总、所有统计标日期、署名作者与资历、「据〈来源〉」表述、显著展示「最后更新：〈日期〉」、E-E-A-T（第一手经验、透明出处与方法）。

**支柱三 · 存在**（第三方露出常比自有站更重要）：维基百科（占 ChatGPT 引用 7.8%）、Reddit（1.8%）、行业刊物/客座文、评测站（G2、Capterra、TrustRadius）、YouTube（AI Overviews 常引）、Quora。行动：维护准确的维基百科页、真诚参与 Reddit、进入行业横评、更新评测站资料、为高频 how-to 做 YouTube 内容。

**最易被引用的内容类型**（按引用份额）：对比文 ~33% > 权威指南 ~15% > 原创研究/数据 ~12% > 榜单/listicle ~10% ≈ 产品页 ~10% ≈ 观点分析 ~10% > how-to ~8%。表现差的：无结构博文、营销注水的薄产品页、门控内容（AI 读不到）、无日期/作者的内容、纯 PDF。

**Schema 速查**：Article/BlogPosting（文章）、HowTo（教程步骤抽取）、FAQPage（问答抽取）、Product（价格/功能/评价）、ItemList（对比）、Review/AggregateRating（信任信号）、Organization（实体识别）。规范 Schema 可带来 30–40% 更高 AI 可见性。

**监测工具**：Otterly AI、Peec AI、ZipTie、LLMrefs（覆盖 ChatGPT/Perplexity/AI Overviews/Gemini 等，跟踪引用率与语音份额）。环境内可用：`semrush`（AI Overview 追踪、关键词、内容缺口）、`ahrefs`（外链、内容探索、AI Overview 数据）、`gsc`（搜索表现）、`ga4`（来自 AI 源的引荐流量）。

## 示例

**场景：SaaS 产品页想被「什么是〈品类〉」「最佳〈品类〉」引用**
优化要点：首段清晰描述产品（做什么、给谁）；功能对比表（你 vs 整个品类）；具体指标（写「每秒处理 1 万笔交易」而非「极快」）；带数字的社会证明；透明定价（AI 偏好可见价格的页面）；覆盖购买疑问的 FAQ。

**场景：博客想成为领域权威源**
一篇一个目标查询（标题对齐查询）；「什么是」类首段给定义；放原创数据/研究/专家引述；显著标注「最后更新」；作者资历 bio；内链到相关产品/功能页。

**场景：对比/替代页想被「X vs Y」「最佳 X 替代品」引用**
用结构化对比表而非散文；保持公正（AI 惩罚明显偏颇的对比）；带评分的具体维度；更新价格与功能；建页可结合 `competitor-alternatives`。

**DIY 月度监测（零工具）**：① 选 top 20 查询；② 逐个在 ChatGPT、Perplexity、Google 跑；③ 记录「是否被引、引了谁、引了哪页」；④ 表格化逐月对比。

## 注意事项

关键数据（用于说服与基线）：AI Overviews 出现在约 **45%** 的 Google 搜索中、最多减少 **58%** 的网站点击；品牌经第三方来源被引的概率是自有域名的 **6.5 倍**；优化内容被引频率约为未优化的 **3 倍**；统计与引用可跨查询提升 **40%+** 可见性。

常见错误：
- 完全无视 AI 搜索；把 AI SEO 与 SEO 割裂（好的传统 SEO 是地基，AI SEO 在其上叠加结构与权威）。
- **为 AI 而非人写作**：读起来像在钻算法空子的内容既不会被引也不会转化。
- 无新鲜度信号（无日期内容输给有日期内容）；门控全部内容；忽视第三方露出。
- 无结构化数据；**关键词堆砌**（不同于传统 SEO 只是低效，这里直接 −10% 可见性）；屏蔽 AI 爬虫；通篇「我们最好」却无数据；忘记监测（每月至少查一次）。

通用约束：仅在任务明确匹配本技能范围时使用；输出不能替代针对具体环境的验证、测试或专家评审；缺少必要输入、权限、安全边界或成功标准时，先停下询问。

## 互见

- `seo-audit`：传统技术与页面 SEO 审计。
- `schema-markup`：落地结构化数据，帮助 AI 理解内容。
- `content-strategy`：规划要创作什么内容。
- `competitor-alternatives`：构建易被引用的对比页。
- `programmatic-seo`：规模化批量建 SEO 页。
- `copywriting`：写出既适合人阅读又便于 AI 抽取的内容。

---
采编自 sickn33/antigravity-awesome-skills（MIT，原始来源 coreyhaines31/marketingskills）。
