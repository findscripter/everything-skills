---
name: seo-entity-optimizer
title: 实体优化与知识图谱信号构建
description: 当品牌/人物/产品在 Google 知识面板、Wikidata 或 AI 系统中无法被识别、被混淆或信息错误时使用；做实体现状审计（知识图谱/Wikidata/AI 引擎）+ 6 类 47 项信号缺口分析，产出规范实体画像、消歧策略与建设路线图；不适用于通用 SEO 审计（用 seo-audit）或结构化数据打标实现（用 schema-markup-builder）。触发词：实体优化、知识图谱、品牌实体、知识面板、Wikidata、品牌搜不到、Google不认识我的品牌、实体消歧
domain: 商业/seo
triggers: [实体优化, 知识图谱, 品牌实体, 知识面板, 品牌词优化, Wikidata, 实体消歧, 品牌搜不到, 没有知识面板, Google不认识我的品牌, entity audit, knowledge panel, build knowledge graph, sameAs]
tags: [seo, geo, entity-optimization, knowledge-graph, knowledge-panel, brand-entity, wikidata, entity-disambiguation, ai-search, marketing]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Write, Knowledge Graph API, Wikidata, ChatGPT, Perplexity, Google AI Overviews]
requires: []
related: [ai-answer-engine-seo, ai-search-seo, schema-markup-builder, seo-audit]
combines_with: [schema-markup-builder, ai-search-seo, seo-content-writer]
license: Apache-2.0
source: aaron-he-zhu/seo-geo-claude-skills
source_license: Apache-2.0
---
# 实体优化与知识图谱信号构建

跨搜索引擎与 AI 系统审计、构建并维护「实体」身份。实体——搜索引擎和 AI 系统识别为独立事物的人、组织、产品、概念——是 Google 与 LLM 判定「这个品牌是什么」「是否值得引用」的根基。

为什么实体对 SEO + GEO 都关键：
- **SEO**：Google 知识图谱驱动知识面板、富媒体结果与基于实体的排名信号；定义清晰的实体能赢得 SERP 版面。
- **GEO**：AI 系统在生成答案前先把查询解析为实体；若 AI 识别不出某实体，无论内容多好都无法引用它。

## 何时使用

- 品牌/人物/组织在 Google 知识面板缺失、信息错误，或 AI 系统答非所问、把你和同名竞品混淆。
- 新品牌想从零建立实体存在感，或让某人成为某主题下被公认的专家。
- 想知道「搜索引擎和 AI 到底如何识别我的实体」，需要一份现状审计 + 缺口清单 + 建设优先级。

不该用的边界：
- 通用技术/内容 SEO 审计（收录、Core Web Vitals、排名下滑）→ 用 `seo-audit`，本条只管「实体身份」。
- 把 Organization/Person schema 写成可粘贴的 JSON-LD → 用 `schema-markup-builder`，本条只产出「需要哪些信号」，实现交给它。
- 让内容被 AI 引用的可提取性改写 → 用 `ai-answer-engine-seo` / `ai-search-seo`。
- 撰写 About 页 / 创始人简介正文 → 用 `seo-content-writer`。

## 步骤

三种工作模式，可从任一处切入：**审计现状 → 建设实体 → 修复/消歧**。

### 第 1 步：实体发现（摸清现状）

建立实体在各系统的当前状态。无工具时请用户代查并回报结果。

```markdown
### 实体画像
**实体名称**：[name]
**实体类型**：[人物 / 组织 / 品牌 / 产品 / 创作 / 活动]
**主域名**：[URL]
**目标主题**：[主题1, 主题2, 主题3]

#### 当前实体存在感
| 平台 | 状态 | 详情 |
|------|------|------|
| Google 知识面板 | 有 / 无 / 错误 | … |
| Wikidata | 已收录 / 未收录 | [QID（若有）] |
| Wikipedia | 有条目 / 仅被提及 / 无 | [可收录性评估] |
| Knowledge Graph API | 找到实体 / 未找到 | [entity ID、types、score] |
| 站内 Schema.org | 完整 / 部分 / 缺失 | [Organization/Person/Product] |
```

#### AI 实体解析测试
对各 AI 系统跑这些查询，记录识别准确度与是否引用：
- "什么是 [实体名]？"
- "[实体名] 是谁创办的？"（组织）
- "[实体名] 是做什么的？"
- "[实体名] vs [竞品]"

| AI 系统 | 识别实体？ | 描述准确度 | 引用其内容？ |
|---------|-----------|-----------|-------------|
| ChatGPT / Claude / Perplexity / Google AI Overview | 是/部分/否 | … | 是/否/部分 |

### 第 2 步：实体信号审计（6 类，逐项 通过/未通过/部分 + 行动）

1. **结构化数据信号** —— Organization/Person schema、`sameAs` 链接、`@id` 一致性、author schema。
2. **知识库信号** —— Wikidata、Wikipedia、CrunchBase、行业目录。
3. **一致的 NAP+E 信号** —— 跨平台的名称/描述/Logo/社交资料一致（Name/Address/Phone/Entity）。
4. **基于内容的实体信号** —— About 页、作者页、主题权威度、品牌词外链。
5. **第三方实体信号** —— 权威提及、共现引用、评测、媒体报道。
6. **AI 专属实体信号** —— 清晰定义、消歧、可验证主张、可抓取性。

完整的 47 项信号清单与各项核验方法见源仓库 `references/entity-signal-checklist.md`。

### 第 3 步：报告与行动计划

产出《实体优化报告》：总览（实体/类型/日期）→ 6 类信号汇总表（通过/警告/失败 + 发现）→ 关键问题 → Top 5 优先行动（影响 × 工作量排序）→ 建设路线图（第 1–2 周 → 第 1 月 → 第 2–3 月 → 持续）→ CORE-EEAT / CITE 交叉引用。

### 保存结果

若用户同意保存，将规范实体画像写入 `memory/entities/<entity-slug>.md`（项目级关键实体再向 `memory/hot-cache.md` 加 1–3 行指针）。本技能是规范实体画像的唯一写入者，其它技能只能往 `candidates.md` 写候选。

## 指令

**合规硬约束（GDPR Art 6，写入前必做）**：当被规范化的实体是「个人」（创始人、作者、公众人物）且可能是 EU/EEA/UK 居民时，写入 `memory/entities/` 前**必须**提示用户确认合法性依据：

> "你即将为一个『人物』创建规范画像。若此人是或可能是 EU/EEA/UK 居民，GDPR Art 6 要求合法性依据：(1) 同意 (2) 正当利益 (3) 合同 (4) 其他。非 EU 主体请核对当地法规（CCPA/CPRA、PIPEDA、LGPD 等）。不确定就跳过并返回 NEEDS_INPUT。"

仅在用户确认依据后才继续；此为提示性建议，非法律意见。写入任何规范画像前，还需检查 `memory/privacy/tombstones.md`：若命中匹配指纹且 `reingest_blocked: true`，不得重建画像，返回 `NEEDS_INPUT`。

**消歧优先**：同名/近名实体共存时，先建立唯一区分点（领域、创始人、地域、`@id`/Wikidata QID），再谈其它信号——AI 解析错实体，下游所有引用都白费。

**信号是复利的，一致性 > 完整性**：先把名称/描述/Logo 在各平台对齐，再追求覆盖更多平台。

## 示例

**用户**："审计 Acme Analytics（B2B SaaS 分析平台，acme-analytics.example）的实体存在感。"

**产出（节选）**：AI 解析测试显示部分识别——ChatGPT 把它描述成泛化的「分析工具」，缺 B2B 定位；未被列入企业级分析厂商；创始人对 AI 系统是未知的。健康汇总标出：缺 Wikidata 条目、无知识面板。Top 3 优先行动：① 提交 Wikidata 条目（拿到 QID）；② 全平台补 `sameAs` 链接；③ 上线创始人简介页。完整报告模板见源仓库 `references/example-audit-report.md`。

## 注意事项

- **从 Wikidata 起步**：它是最易主动建立的知识图谱信号，且喂给 Google KG 与多数 AI 系统；拿到 QID 是后续一切的锚点。
- **善用 `sameAs`**：在站内 Organization/Person schema 里用 `sameAs` 把官网、各社交资料、Wikidata、LinkedIn、Google Scholar 串成一个实体——这是跨网消歧的核心信号。
- **优化前后都测 AI 识别**：用第 1 步的查询基线化，改完再测，用「识别准确度提升」证明效果。
- **下游依赖必填字段**：规范画像 frontmatter 须遵循源仓库 `entity-geo-handoff-schema.md`；`geo-content-optimizer`、`schema-markup-generator`、`meta-tags-optimizer`、`ai-overview-recovery` 等消费方依赖这些字段，缺字段会降级为 `DONE_WITH_CONCERNS` 并回指本技能。
- 无工具时 Claude 无法直接查其它 AI 系统或实时联网，必须请用户代跑测试查询并回报。

## 互见

- requires：（无）
- related：`seo-audit` —— 通用排名/技术 SEO 诊断，与实体身份互补。
- related：`ai-search-seo`、`ai-answer-engine-seo` —— 实体识别清楚后，让内容真正被 AI「引用」。
- related：`content-strategy-planner` —— 先定哪些主题/实体值得建设。
- combines_with：`schema-markup-builder` —— 主搭档：本技能定「需要哪些实体信号」，它把 Organization/Person + `sameAs` 落成可粘贴 JSON-LD。
- combines_with：`seo-content-writer` —— 当缺口是缺 About/创始人页时，由它产出权威正文。

---

采编自 aaron-he-zhu/seo-geo-claude-skills（Apache-2.0），原作者 aaron-he-zhu。
