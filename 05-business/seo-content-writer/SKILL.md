---
name: seo-content-writer
title: SEO 内容写作
description: 当需要围绕关键词写既能被搜索引擎/生成式引擎收录、又对人有价值的内容（标题、结构、E-E-A-T、内链）时使用；触发词：SEO 文章、关键词、搜索排名、GEO、内容优化。
domain: 商业/seo
tags: [seo, content, marketing, writing]
level: 进阶
status: stable
version: 0.1.0
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: [fact-checking]
related: [content-strategy-planner, ai-search-seo, content-engine-strategist, seo-audit]
combines_with: [content-strategy-planner, schema-markup-builder, ai-search-seo]
license: CC-BY-SA-4.0
---
## 何时使用

- 需要围绕一个或一组关键词产出可被搜索引擎收录、被生成式引擎（AI Overview / ChatGPT 等）引用、同时对真人有阅读价值的内容时。
- 已有内容需要做 SEO/GEO 优化：重写标题、调整结构、补 E-E-A-T 信号、布内链。
- 触发词：SEO 文章、关键词、搜索排名、GEO、内容优化。

不该用的边界：
- 不做关键词难度/搜索量抓取与外链建设（off-page）——本技能只覆盖 on-page 内容写作。
- 不做技术 SEO（sitemap、robots、Core Web Vitals、结构化 schema 部署）。
- 不替代事实核查；涉及数据/断言交给 `fact-checking`。
- 纯品牌文案、广告语、不以自然搜索为目标的内容不适用。

## 步骤 / 指令

输入：`primary_keyword`、可选 `secondary_keywords[]`、`search_intent`（信息型/导航型/交易型/商业调查）、`audience`、`existing_url`（优化场景）。

```
1. 确认意图与角度
   - 判定 search_intent；若用户未给，按关键词语义推断并在产出顶部标注。
   - 定义独特角度（解决一个具体问题），避免泛泛综述。

2. 关键词布局
   - primary_keyword 必须出现在：H1、首段前100字、至少1个H2、URL slug、meta description。
   - secondary_keywords 自然分布到 H2/H3 与正文；禁止堆砌（单关键词密度 ≤ 2-3%）。
   - 收集相关长尾问题（People Also Ask 类）作为 H2/FAQ。

3. 构建结构（GEO 友好）
   - H1：含主关键词，≤60字符；前置最重要信息（倒金字塔）。
   - 首段 40-60 字直接回答核心问题（供 AI 摘录的 "answer-first" 段）。
   - H2/H3 用问句或任务式短语；每个小节聚焦单一子主题。
   - 加入可被引用的原子单元：定义句、要点列表、对比表、分步清单、FAQ。
   - 复杂主题给 TL;DR 或要点摘要框。

4. 注入 E-E-A-T 信号
   - Experience：具体案例、第一手数据、截图/示例。
   - Expertise：精确术语、可验证的数字与方法。
   - Authoritativeness：标注作者/来源；为关键断言预留引用位 [需核查]。
   - Trust：注明更新日期、披露利益相关、给出反例或局限。

5. 内链
   - 为每个支柱/集群关系插入 3-8 条站内链接；锚文本用描述性短语，非"点此"。
   - 不重复用同一锚文本指向不同页面（避免内部 cannibalization）。

6. 元数据
   - 输出 title tag（≤60字符）、meta description（≤155字符，含主关键词+行动召唤）、URL slug（小写连字符、含主关键词、去停用词）。

7. 自检（输出前逐项核对，见"注意事项"清单）。
   - 把所有标注 [需核查] 的断言移交 `fact-checking`。
```

## 示例

最小可用提示词（喂给生成模型）：

```
角色：SEO 内容写手。
任务：围绕主关键词「{primary_keyword}」写一篇{search_intent}意图的文章，面向{audience}。
约束：
- H1 含主关键词，≤60字符；首段40-60字先给答案。
- H2/H3 用问句/任务式；至少包含 1 个对比表、1 个分步清单、1 个 FAQ（3问）。
- 次关键词 {secondary_keywords} 自然融入，密度≤3%，禁堆砌。
- 标注 E-E-A-T：给具体案例与数字；不确定的事实数据后加 [需核查]。
- 插入 3-5 处内链占位 [internal-link: 主题]。
输出末尾附：title tag、meta description、URL slug。
```

产出元数据示例：

```
Title: 远程团队协作工具怎么选？2026 实测对比
Meta: 对比 8 款远程协作工具的价格、集成与上手成本，含选型清单，帮你 10 分钟定型。
Slug: remote-team-collaboration-tools
```

## 注意事项

- answer-first：首段/每个 H2 开头先给可独立摘录的结论，这是被 AI 引擎引用的关键。
- 反关键词堆砌：以读者可读性为先，密度只是上限不是目标。
- 任何统计数字、价格、排名、"研究表明"类断言一律标 [需核查] 并交 `fact-checking`，本技能不自行担保事实。
- meta/title 超长会被截断；slug 全小写、连字符、不含中文与停用词。
- 不臆造作者资历或第一手经验来伪造 E-E-A-T——可留占位让用户填真实信息。
- 单一职责：只产 on-page 内容与元数据，不输出 schema 标记、不做技术 SEO 配置。
- 输出前自检清单：意图标注 / H1 含主词 / 首段答案 / 关键词布局 / ≥3内链 / E-E-A-T信号 / 元数据三件套 / [需核查] 已标全。

## 互见

- requires：`fact-checking` —— 文中所有事实性断言、数据、引用须经其核验。
- related：`markdown-to-docx` —— 将产出的 Markdown 文章转为可交付的 Word 文档。
- combines_with：无。
