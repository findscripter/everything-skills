---
name: content-strategy-planner
title: 内容策略规划
description: 当需要规划内容选题、主题集群与编辑路线图（以获取自然流量、建立权威、获取线索）时使用；做：盘点业务/客户/竞品上下文，识别 3-5 个内容支柱与集群，按买家旅程做关键词分级，按四维权重打分排优先级，产出支柱方案+优先选题清单+集群地图；不适用于单篇文案写作或纯技术 SEO 审计；触发词：内容策略、content strategy、主题集群、topic cluster、内容支柱、content pillar、编辑路线图、editorial roadmap、选题规划、内容矩阵
domain: 商业/marketing
triggers: [内容策略, content strategy, 主题集群, topic cluster, 内容支柱, content pillar, 编辑路线图, editorial roadmap, 选题规划, 内容矩阵]
tags: [marketing, content-strategy, seo, topic-cluster, editorial, lead-generation]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [web-search]
requires: []
related: [content-engine-strategist, content-marketing-strategist, seo-content-writer, ai-search-seo]
combines_with: [seo-content-writer, content-engine-strategist, customer-research-synthesizer]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 需要决定「发什么内容、按什么顺序发、给谁看」，而非只写单篇文案时使用。
- 需要搭建主题集群（topic cluster）、内容支柱（content pillar）或编辑路线图时使用。
- 用户要的是策略与优先级排序，而不是逐字代笔。

不该用的边界：
- 单篇文案撰写 → 用 seo-content-writer。
- 纯技术/页面级 SEO 审计、URL 结构与导航设计 → 属另类技能，本条不覆盖。
- 规模化批量生成内容（programmatic SEO）不在本条范围。
- 若业务定位、目标客户（ICP）、内容目标等关键输入缺失，先停下来发问，不要凭空假设。

## 步骤

1. 收集上下文（缺失即追问）。优先检查 `.agents/product-marketing-context.md`（旧版为 `.claude/product-marketing-context.md`），存在则先读，只补问其中未覆盖的信息。四类上下文：
   - 业务：公司做什么、理想客户是谁、内容首要目标（流量/线索/品牌/思想领导力）、产品解决什么问题。
   - 客户研究：购买前常问的问题、销售通话中的异议、工单里反复出现的话题、客户描述问题时用的原话。
   - 现状：已有内容及其表现、可投入资源（写手/预算/时间）、可产出的格式（图文/视频/音频）。
   - 竞争：主要竞品、市场内容缺口。
2. 给每篇内容定位「可搜索 / 可传播 / 兼有」，按此顺序优先——搜索流量是地基。
   - 可搜索：承接已有需求，面向正在找答案的人。
   - 可传播：创造需求，传播观点、引发讨论。
3. 选内容类型（见下「指令」）。
4. 识别 3-5 个内容支柱并展开集群（见下「指令」）。
5. 按买家旅程做关键词分级（意识/考虑/决策/落地），用对应修饰词扩词。
6. 用多源选题法挖掘想法（关键词导出、通话/工单转写、问卷、论坛、竞品分析、销售支持反馈）。
7. 四维加权打分排优先级，输出最终方案。

## 指令

内容类型：
- 可搜索类：
  - 用例型：公式 `[人群] + [用例]`，打长尾词，如「面向设计师的项目管理」。
  - 中心-辐射（Hub & Spoke）：Hub 为全面总览，Spoke 为子主题。先建 Hub 再建 Spoke，并策略性内链。
    ```
    /topic (hub)
    ├── /topic/subtopic-1 (spoke)
    ├── /topic/subtopic-2 (spoke)
    └── /topic/subtopic-3 (spoke)
    ```
    注意：多数内容放 `/blog/post-title` 即可；只有「多层深度的重大主题」才用专属 hub/spoke URL 结构。
  - 模板库：高意图词 + 带动产品采用，提供独立即用价值并展示产品如何增强模板。
- 可传播类：思想领导力、数据驱动（产品数据/公开数据/原创实验）、专家圆桌（15-30 位专家答同一问题，自带分发）、案例研究（挑战→方案→结果→关键收获）、幕后元内容（如「我们如何拿到第一笔 5k MRR」）。

识别支柱的四个视角：产品导向（产品解决什么问题）、受众导向（ICP 需要学什么）、搜索导向（领域内有量的主题）、竞品导向（竞品在排什么词）。好支柱标准：契合产品/服务、贴合受众关切、有搜索量或社交热度、足够宽可衍生多个子主题。多数情况下所有内容可同居 `/blog` 配合良好内链；仅当构建多层深度资源时才用 `/guides/topic` 这类专属支柱页 URL。

按买家旅程的关键词修饰词：
- 意识期：what is、how to、guide to、introduction to。
- 考虑期：best、top、vs、alternatives、comparison。
- 决策期：pricing、reviews、demo、trial、buy。
- 落地期：templates、examples、tutorial、how to use、setup。

论坛/竞品检索式（配合 web search）：`site:reddit.com [话题]`、`site:quora.com [话题]`、`site:competitor.com/blog`；另查 Indie Hackers、Hacker News、Product Hunt、行业 Slack/Discord。

四维优先级评分（权重）：客户影响 40%、内容-市场契合 30%、搜索潜力 20%、资源需求 10%。

## 示例

关键词数据分析输出为优先级表：

| Keyword | Volume | Difficulty | Buyer Stage | Content Type | Priority |
|---------|--------|------------|-------------|--------------|----------|

优先级打分表：

| Idea | Customer Impact (40%) | Content-Market Fit (30%) | Search Potential (20%) | Resources (10%) | Total |
|------|----------------------|--------------------------|------------------------|-----------------|-------|
| Topic A | 8 | 9 | 7 | 6 | 8.0 |
| Topic B | 6 | 7 | 9 | 8 | 7.1 |

最终交付物固定三块：
1. 内容支柱：3-5 个支柱 + 理由 + 各自子主题集群 + 与产品的关联。
2. 优先选题：逐篇给出 标题 / 可搜索·可传播·兼有 / 内容类型 / 目标词与买家阶段 / 为何选它（客户研究佐证）。
3. 主题集群地图：以可视或结构化方式呈现内容如何互联，例如：
   ```
   支柱主题 (Hub)
   ├── 子主题集群 1
   │   ├── 文章 A
   │   └── 文章 B
   └── 子主题集群 2
       ├── 文章 C
       └── 文章 D
   ```

## 注意事项

- 严格按「可搜索 > 可传播」排序，搜索流量是地基；不要先追热点而忽视承接需求的基础内容。
- 共识 30%+ 提及的话题才算高优先；问卷与转写里的客户原话要原样沿用（voice of customer）。
- 写可搜索内容：精准匹配搜索意图、标题对齐查询、关键词进标题/小标题/首段/URL、覆盖全面并引权威数据；同时为 AI/LLM 发现优化（清晰定位、结构化、全网品牌一致）。
- 写可传播内容：以新颖洞见/原创数据/反直觉观点开场，挑战常识、讲能共情的故事、给出别人能学到的真实经验。
- 内容须确保可搜索、可传播或兼有；缺定位的选题应剔除。
- 产出不能替代针对具体环境的验证、测试或专家评审。

## 互见

- seo-content-writer：撰写具体的单篇 SEO 内容。

（本条采编自 sickn33/antigravity-awesome-skills，MIT）
