---
name: seo-audit
title: SEO 技术审计
description: 当需要诊断站点为何排名/流量下滑、做技术与页面 SEO 健康检查时使用；按"可抓取/可索引→技术→页面→内容→权威"优先级排查并产出含问题·影响·证据·修复·优先级的审计报告与行动清单；不适用于内容创作、规模化建站、结构化数据/Schema 实现或转化优化；触发词：SEO 审计、technical SEO、SEO health check、排名下降、流量掉了、收录索引问题、core web vitals、crawl errors、meta tags review、on-page SEO
domain: 商业/seo
triggers: [SEO 审计, technical SEO, SEO health check, 排名下降, 流量掉了, 收录索引问题, core web vitals, crawl errors, meta tags review, on-page SEO]
tags: [seo, technical-seo, on-page-seo, indexing, core-web-vitals, hreflang, audit]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Google Search Console, PageSpeed Insights, Rich Results Test, Screaming Frog, Chrome DevTools, Ahrefs/Semrush]
requires: []
related: [seo-site-architecture, schema-markup-builder, seo-traffic-drop-forensics, seo-content-writer]
combines_with: [seo-site-architecture, seo-content-writer, schema-markup-builder]
license: MIT
source: coreyhaines31/marketingskills
source_license: MIT
---
## 何时使用

- 站点排名/自然流量下滑、"上不了 Google"、疑似算法更新影响，需定位原因时。
- 需要做技术 + 页面（on-page）SEO 健康检查、上线/迁移前后体检时。
- 用户只给出模糊诉求（如"我的 SEO 很差""帮我看看 SEO"）时，也先从审计入手。

不该用的边界：
- 写文章/落地页文案 → seo-content-writer。
- 规模化批量建页面（programmatic SEO）、结构化数据/Schema 实现、AI 搜索优化（AEO/GEO）→ 各自专门技能，本技能只"诊断"不"实现"。
- 以转化率为目标的页面优化（CRO）不在此范围。

## 步骤

1. 先读上下文：若存在 `.agents/product-marketing.md`（或 `.claude/product-marketing.md`、旧版 `product-marketing-context.md`），先读它，只追问未覆盖的信息。
2. 明确范围三问：站点类型（SaaS/电商/博客等）与业务目标、已知问题与近期改动/迁移、是否有 Search Console / 分析权限、全站还是指定页面。
3. 按优先级排查（高 → 低）：① 可抓取与可索引（Google 能否找到并收录）→ ② 技术基础（快不快、是否正常）→ ③ 页面优化 → ④ 内容质量 → ⑤ 权威与外链。
4. 多语言/多地区站点：额外检查 hreflang、跨语言 canonical、本地化内容质量。
5. 每条发现统一记录：问题 / 影响（高中低）/ 证据（怎么发现的）/ 修复建议 / 优先级，最后汇总成分层行动计划。

## 指令

可抓取 & 可索引（最高优先级）：
- robots.txt：是否误屏蔽重要页、是否含 sitemap 引用。
- XML sitemap：可访问、已提交 GSC、仅含 canonical 且可索引的 URL、定期更新。
- 索引状态：`site:domain.com` + GSC 覆盖率报告，对比"已索引 vs 预期"。
- 常见索引杀手：重要页误加 noindex、canonical 指向错误、重定向链/环、软 404、无 canonical 的重复内容。
- canonical：每页有 canonical；唯一页自引用；HTTP→HTTPS、www 与非 www、尾斜杠保持一致。

技术基础：
- Core Web Vitals 阈值：LCP < 2.5s、INP < 200ms、CLS < 0.1。
- 速度因素：TTFB、图片优化、JS 执行、CSS 交付、缓存头、CDN、字体加载。
- 移动友好：响应式（非独立 m. 站）、viewport 配置、无横向滚动、与桌面同内容。
- 安全：全站 HTTPS、有效 SSL、无混合内容、HTTP→HTTPS 跳转。
- URL：可读、小写、连字符分隔、无多余参数。

页面 SEO：
- Title：每页唯一、主关键词靠前、50-60 字符、品牌名通常置尾；查重复/过长截断/堆砌。
- Meta description：每页唯一、150-160 字符、含主关键词与 CTA。
- 标题层级：每页一个 H1、H1 含主关键词、H1→H2→H3 不跳级、不只为样式而用。
- 内容：主关键词在前 100 词内、满足搜索意图、深度优于竞品；排查薄内容/重复内容/关键词自相残杀（cannibalization）。
- 图片：描述性文件名、所有图有 alt、压缩、WebP、懒加载。
- 内链：重要页被充分链接、锚文本描述性、无死链、无孤岛页。

多语言/多地区（serves 多语言或地区时）：
- hreflang：每页含自引用条目；A↔B 互相引用（否则该对被丢弃）；用合法代码 ISO 639-1 语言 + 可选 ISO 3166-1 Alpha-2 地区（用 `en-GB` 而非 `en-UK`）；包含 `x-default`；目标 URL 均 200、可索引且与其 canonical 一致。
- canonical：每个 locale 页自引用 canonical，绝不跨语言 canonical（如法语 canonical 到英语会彻底压制该语言收录）；canonical URL 必须出现在 hreflang 集合内，否则 hreflang 全部失效。
- URL 结构：推荐子目录 `/en/` `/ar/`；不推荐 `?lang=en`；所有 locale 都加前缀；不要基于 IP/Accept-Language 做内容协商（Googlebot 用美国 IP、不带 Accept-Language）。
- 内容质量：翻译全部正文（标题/描述/标题/正文），仅翻模板会造成重复；只为有真实内容与搜索需求的 locale 配 hreflang。

## 示例

检测 Schema 标记（关键约束）：`web_fetch` 与 `curl` 无法可靠检测结构化数据——AIOSEO/Yoast/RankMath 等插件用客户端 JS 注入 JSON-LD，不会出现在静态 HTML 中（转换时会剥离 `<script>`）。仅凭此即报"未发现 schema"会得到错误结论。正确做法任选其一：
1. 浏览器工具渲染后执行：`document.querySelectorAll('script[type="application/ld+json"]')`
2. Google Rich Results Test：https://search.google.com/test/rich-results
3. 客户提供的 Screaming Frog 导出（SF 会渲染 JS）。

审计报告结构：
- 执行摘要：整体健康度、Top 3-5 优先问题、快速见效项。
- 技术/页面/内容三类发现：每条用「问题·影响·证据·修复·优先级」格式。
- 分层行动计划：① 阻断收录/排名的关键修复 → ② 高影响改进 → ③ 快速见效项 → ④ 长期建议。

按站点类型的高频问题：SaaS（产品页内容薄、缺对比/替代页）；电商（薄分类页、重复产品描述、缺产品 schema、faceted 导航制造重复）；博客（旧内容不更新、关键词自相残杀、缺主题聚类）；本地商家（NAP 不一致、缺本地 schema 与 GBP 优化）。

## 注意事项

- Schema 检测铁律：永远不要仅基于 `web_fetch`/`curl` 判断"无 schema"，必用渲染 JS 的工具核实。
- 优先级原则：先解决可抓取/可索引问题（不收录则一切优化归零），再谈页面与内容。
- 薄 locale 页危害全站：Helpful content 是站点级信号，大量薄页会拖累强页排名；正确做法是"不创建无法做到真正有用的 locale 页"，而非用 noindex 或跨语言 canonical 掩盖。
- Next.js 注意：`alternates.languages` 不会自动为 `<loc>` 加自引用 `<xhtml:link>`，需显式补当前 locale。
- GSC 的 International Targeting 报告已弃用；地理定向依赖 hreflang、内容信号与链接模式。
- 免费必备工具：Google Search Console（核心）、PageSpeed Insights、Bing Webmaster Tools、Rich Results Test、Mobile-Friendly Test。

## 互见

- seo-content-writer：审计发现内容薄/未命中意图后，用于改写或新建针对关键词的内容。

本条采编自 coreyhaines31/marketingskills（MIT）。
