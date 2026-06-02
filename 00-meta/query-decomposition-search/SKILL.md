---
name: query-decomposition-search
title: 查询分解多源检索
description: 当一句自然语言问题要并行查多个数据源（聊天/知识库/任务/邮件/云盘）并合成一个连贯答案时使用；做的是按查询类型分解出每源子查询、翻译成各源专用语法、并行执行后去重排序，产出排好序的合并结果；不适用于单一已知源的直接检索、或向量+关键词的算法级混排（用 hybrid-search-retrieval）。触发词：多源检索、查询分解、企业搜索、跨源搜索、search orchestration
domain: 通用/communication
triggers: [多源检索, 查询分解, 企业搜索, 跨源搜索, search orchestration, query decomposition, 并行搜索, 搜索策略]
tags: [检索, 查询分解, 多源编排, 企业搜索, 排序, 去重, research]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [hybrid-search-retrieval, multi-source-knowledge-synthesis, rag-implementation-workflow, exa-semantic-search]
combines_with: [multi-source-knowledge-synthesis, rag-pipeline-builder, entity-research-dossier]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
---
name: query-decomposition-search
title: 查询分解多源检索
description: 当一句自然语言问题要并行查多个数据源（聊天/知识库/任务/邮件/云盘）并合成一个连贯答案时使用；做的是按查询类型分解出每源子查询、翻译成各源专用语法、并行执行后去重排序，产出排好序的合并结果；不适用于单一已知源的直接检索、或向量+关键词的算法级混排（用 hybrid-search-retrieval）。触发词：多源检索、查询分解、企业搜索、跨源搜索、search orchestration
domain: 通用/misc
triggers: [多源检索, 查询分解, 企业搜索, 跨源搜索, search orchestration, query decomposition, 并行搜索, 搜索策略]
tags: [检索, 查询分解, 多源编排, 企业搜索, 排序, 去重, research]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [hybrid-search-retrieval, fact-checking, entity-research-dossier, rag-pipeline-builder]
combines_with: [entity-research-dossier, fact-checking]
license: CC-BY-4.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
## 何时使用

当一句自然语言问题需要在**多个互不相通的数据源**（团队聊天、知识库/Wiki、任务/项目跟踪、邮件、云盘文档）里同时找答案，再把分散结果合成一个连贯回复时使用。典型触发：

- 「我们当时关于 X 是怎么决定的？」「项目 Y 现在什么状态？」「Z 的设计文档在哪？」这类跨工具的内部知识查询。
- 已接入多个连接器，需要把一个问题拆成每源的针对性查询并并行下发。

不该用：

- **只查一个已知源**（如就在某个 Wiki 里搜）——直接调该源的搜索，不必走分解编排。
- **算法级混排**（同一语料里做向量召回 + 关键词召回 + RRF/重排）——用 `hybrid-search-retrieval`，本技能管的是「跨源编排」而非「单源召回融合」。
- **开放网络检索 / 实时事实查证**——本技能面向内部已接入源；查证真伪用 `fact-checking`。
- 用户问题已足够明确指向单条结果，分解反而增加噪声。

## 步骤 / 指令

```
1. 判定查询类型（决定优先源与排序权重）
   决策类「我们决定了什么」 → 优先 聊天/邮件，找结论性信号（meeting notes、thread 结论）
   状态类「X 进展如何」     → 优先 近期活动、任务跟踪、状态更新
   文档类「X 的文档在哪」   → 优先 云盘、Wiki、共享文档
   人员类「谁在做 X」       → 搜任务负责人、消息作者、文档协作者
   事实/政策类「我们的 X 政策」→ 优先 Wiki/官方文档，再用对话确认
   时间类「X 何时发生」     → 放宽日期范围，找时间戳
   探索类「关于 X 我们都知道什么」→ 全源广撒网，再综合

2. 抽取检索要素
   - 关键词：结果中必须出现的核心词
   - 实体：人/项目/团队/工具（有记忆系统就用）
   - 意图信号：决策词、状态词、时间标记
   - 约束：时间范围、源提示、作者过滤
   - 排除项：要剔除的内容

3. 为每个源生成子查询
   - 概念性/关键词未知/探索类 → 优先语义搜索
   - 已知术语/项目名/缩写/用户引用的精确短语/重过滤(from:/in:/after:) → 优先关键词搜索
   - 同一主题可能有多种叫法时，生成多个变体：
     "Kubernetes" / "k8s" / "cluster" / "container orchestration"

4. 翻译成各源专用语法（见下方映射表）

5. 并行执行所有源的查询（关键：绝不串行）
   总耗时 ≈ 最慢的单源，而非各源之和。

6. 合并 → 按查询类型加权排序 → 去重 → 综合成单一答案
```

**各源语法翻译（要点）**

聊天（chat）——语义直接传自然语言问句；关键词支持过滤语法：

| 通用过滤 | 聊天语法 |
|---|---|
| `from:sarah` | `from:sarah` 或 `from:<@USERID>` |
| `in:engineering` | `in:engineering` |
| `after:2025-01-01` / `before:2025-02-01` | 同名 |
| `type:thread` | `is:thread` |
| `type:file` | `has:file` |

知识库（Wiki）——概念查询用 `descriptive_query`；精确词用 `query`，加引号即精确短语 `"API migration timeline"`。

任务/项目跟踪——

```
text: "API migration"
workspace: [workspace_id]
completed: false        # 状态类查询
assignee_any: "me"      # 「我的任务」
```

| 通用过滤 | 任务跟踪参数 |
|---|---|
| `from:sarah` | `assignee_any` 或 `created_by_any` |
| `after:2025-01-01` | `modified_on_after: "2025-01-01"` |
| `type:milestone` | `resource_subtype: "milestone"` |

**排序：按查询类型加权打分**

| 因子 | 决策 | 状态 | 文档 | 事实 |
|---|---|---|---|---|
| 关键词匹配 | 0.3 | 0.2 | 0.4 | 0.3 |
| 新鲜度 | 0.3 | 0.4 | 0.2 | 0.1 |
| 权威度 | 0.2 | 0.1 | 0.3 | 0.4 |
| 完整度 | 0.2 | 0.3 | 0.1 | 0.2 |

权威层级随查询类型变化：
- 事实/政策：Wiki/官方文档 > 共享文档 > 邮件公告 > 聊天消息
- 「发生了什么」/决策：会议纪要 > thread 结论 > 邮件确认 > 聊天消息
- 状态：任务跟踪 > 近期聊天 > 状态文档 > 邮件更新

## 示例

把一个问题分解为多源并行查询：

```
用户：「我们当时关于 API 迁移时间线是怎么决定的？」  →  判定为【决策类】

聊天：语义 "API migration timeline decision"
      + 关键词 "API migration" in:#engineering after:2025-01-01
知识库：语义 "API migration timeline and decision rationale"
任务跟踪：text "API migration"，相关 workspace
（全部并行下发）
     ↓
合并 + 按决策权重排序（重 thread 结论/会议纪要）+ 去重
     ↓
综合成一段带出处的答案
```

歧义处理——确有分歧且会显著改变检索方向时，问一个聚焦的澄清问题，而非瞎猜：

```
模糊：「搜一下那个迁移」
→ 「我找到几个迁移，你指的是：
   1. 数据库迁移（Phoenix 项目）
   2. 云迁移（AWS → GCP）
   3. 邮箱迁移（Exchange → O365）」
```

查询过窄、结果太少时逐步放宽：

```
原始：  "PostgreSQL migration Q2 timeline decision"
放宽：  "PostgreSQL migration"
更宽：  "database migration"
最宽：  "migration"
```

放宽时按此顺序去约束：① 日期过滤（搜全时段）② 源/位置过滤 ③ 次要关键词 ④ 只保留核心实体/主题词。

## 注意事项

- **并行是硬要求**：所有源同时下发，绝不串行；否则延迟累加，体验崩坏。
- **先判类型再分解**：查询类型决定优先源、各源该用语义还是关键词、以及排序权重——跳过这步排序会失准。
- **语义 vs 关键词不是二选一**：同一源可并发两种查询（自然语言语义 + 带过滤的关键词），取并集再去重。
- **澄清要克制**：只在「确有多种迥异解读且会显著改变搜哪些源」时问；轻微歧义直接多解返回，别打断用户。
- **降级与兜底**：源不可用→跳过并标注缺口；某源零结果→放宽词、去日期过滤、换近义词；全源皆空→建议用户改写查询；被限流→标注、返回其他源结果、提示稍后重试。
- **去重**：同一结论可能被多源/转发命中，合并阶段按内容（非链接）去重，避免同一事实重复计权。
- 占位符 `~~chat`/`~~project tracker` 等代表「已接入的某类连接器」，落地时替换为实际工具名。

## 互见

- related：`hybrid-search-retrieval` —— 本技能管「跨源编排」，单源内部的向量+关键词召回融合（RRF/重排）下钻到它。
- related：`fact-checking` —— 检索合成出结论后，对关键断言做二次查证、辨真伪。
- combines_with：`entity-research-dossier` —— 把多源检索作为调研档案的取证引擎，按实体并行拉取一手内部资料。
- related：`rag-pipeline-builder` —— 当检索结果要喂给生成式回答时，衔接到 RAG 管道的召回阶段。

---

采编自 anthropics/knowledge-work-plugins（Apache-2.0 许可证），原技能 `search-strategy`（enterprise-search 插件）。本条为适配中文「技能大典」的重写版，保留其查询类型→策略映射、检索要素抽取、各源语法/过滤翻译表、按类型加权的排序与权威层级、歧义澄清判据、降级/查询放宽顺序与并行执行约束等关键内容。
