---
name: recsys-pipeline-architect
title: 推荐排序管线架构师（六阶段 For You 模式）
description: 当要为「给定(用户,上下文)挑出 Top K 条目」的系统（信息流/推荐/RAG 重排/任务优先级/通知分诊/搜索与广告排序）设计或重构管线时使用；做六阶段编排（Source 取源→Hydrator 富化→Filter 过滤→Scorer 打分→Selector 选取→SideEffect 副作用），权衡单分值vs多动作、隔离vs联合、在线vs离线，产出可直接运行的脚手架（TS/Go/Python）；不适用于模型本身（双塔检索、Embedding 训练、Transformer 设计）与纯训练管线；触发词：推荐系统、排序管线、for you 信息流
domain: 智能/agents
triggers: [推荐系统, 信息流算法, 排序管线, for you 信息流, 候选管线, 内容推荐, RAG 重排, recommendation system, ranking pipeline, feed algorithm, candidate pipeline, 六阶段管线]
tags: [推荐系统, 排序管线, 信息流, 六阶段, 多动作打分, 重排, agents, 架构脚手架]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Write, Bash]
requires: []
related: [hybrid-search-retrieval, production-llm-app-builder, rag-pipeline-builder, vector-index-tuning]
combines_with: [embedding-model-strategies, ab-test-designer, agent-workflow-pattern-designer]
license: MIT
source: affaan-m/everything-claude-code
source_license: MIT
---
采编自 affaan-m/everything-claude-code（MIT），适配重写为中文版本。原始模式由 xAI 开源的 For You 算法（github.com/xai-org/x-algorithm，Apache-2.0）推广，本条目为该模式的独立中文实现（不复制原算法代码）。

## 何时使用

当系统的核心是「为某个 (用户, 上下文) 挑出 Top K 个条目」时使用本技能——它是模型「外围」的管线骨架，不是模型本身：

- 要构建任何「挑 Top K」的系统：社交信息流、内容 CMS、RAG 重排器、任务优先级、通知分诊、搜索重排、广告排序。
- 用户问「X 该怎么排序」，或描述一个信息流/个性化问题。
- 已有打分函数，缺的是它周围的管线管道（取源、过滤、副作用）。
- 想从「单一相关性分值」迁移到「多动作预测 + 可调权重」。
- 要把一个 LLM/ML 打分器包进过滤器、富化器、副作用与可运行脚手架里（TS / Go / Python）。

不该用（负边界）：

- 模型架构本身：Transformer 设计、双塔检索、Embedding 训练——本技能是模型「周围的管道」，不碰模型。
- 纯 ML 训练管线——打分函数由用户负责。
- 运维已部署管线（监控、自动扩缩容）——超出范围。

## 步骤 / 指令

六阶段框架（顺序不可乱，理由见下）：

| # | 阶段 | 职责 | 并行 |
|---|---|---|---|
| 1 | Source 取源 | 从一个或多个来源拉候选 | 是——多源并行 |
| 2 | Hydrator 富化 | 给每个候选补齐过滤/打分所需元数据 | 是——独立富化器并行 |
| 3 | Filter 过滤 | 丢掉绝不该展示的候选（屏蔽、过期、重复、不合格） | 否——串行，越往后条目越少 |
| 4 | Scorer 打分 | 给每个存活候选打一个或多个分 | 否——串行，后置打分器可见前面的分 |
| 5 | Selector 选取 | 按最终分降序排序，取 Top K | 单步 |
| 6 | SideEffect 副作用 | 缓存已服务 ID、记曝光、发事件、更新计数 | 异步——绝不能阻塞响应 |

为何是这个顺序：取源先于富化（先知道有哪些候选再花钱富化）；富化先于过滤（很多过滤器需要源未提供的元数据）；过滤先于打分（打分最贵，先丢不合格的）；打分用链而非单器（真实系统要组合 ML 打分 + 多样性重排 + 业务规则）；选取在打分之后（保证打分确定、可缓存）；副作用最后且异步（绝不阻塞用户响应）。

被调用时，分八步走查用户：

1. 厘清用例（一轮三问）：排的是什么条目？输入上下文是什么？语言/运行时？
2. 确定候选来源：通常是网内（关注/自有/订阅）+ 网外（ML 检索 / 热门 / 相似喜欢）。
3. 列出所需富化：对每个过滤器和打分器，列出源未提供、它却需要的数据。
4. 列出过滤器：重复、自己、时效、屏蔽/静音、已服务过、合格性。顺序要紧——便宜先于昂贵，通用先于用户特定。
5. 设计打分链：主打分（ML）→ 合并器（带权多动作）→ 多样性 → 业务规则。
6. 选取器：按最终分降序取 Top K（或网内/网外做分层混排）。
7. 副作用：缓存已服务 ID、发曝光事件、更新计数、记分析——全部 fire-and-forget。
8. 在用户技术栈里生成脚手架。

必须摆上台面的三个权衡（别默默选默认）：

1. 单分值 vs 多动作。单分值：训一个模型预测相关性，改行为要重训。多动作：预测多个动作的 P(action)（读/赞/转/划走/举报），服务期按权重组合，改行为只改权重、不重训。X For You 用多动作，含正负权重。用户若需频繁调优，推荐多动作。
2. 打分中的候选隔离。隔离：每个候选独立打分，确定、可缓存（默认）。联合：候选间相互注意（如对一批跑 Transformer），更强表达但跨批不确定。仅当有明确理由（如显式 batch 级多样性）才用联合。
3. 在线 vs 离线。请求时（在线）：每次请求跑管线，延迟预算 100–300ms（默认）。预计算（离线批）：周期性跑、结果缓存，延迟低、新鲜度低。混合：候选检索离线、排序在线。

## 示例

最小六阶段编排（伪代码，落地时按栈生成可运行脚手架）：

```text
candidates = parallel(sources)            // 1 多源并行取候选
candidates = parallel(hydrators(candidates)) // 2 并行富化
for f in filters:  candidates = f(candidates) // 3 串行过滤，便宜在前
for s in scorers:  candidates = s(candidates) // 4 串行打分，后者见前分
top = sort_desc(candidates, key=final_score)[:K] // 5 选取 Top K
fire_and_forget(side_effects(top))        // 6 异步，不 await
return top
```

副作用 fire-and-forget 形态（绝不阻塞响应）：Go 用 `go sideEffect(...)`；TS 用不带 `await` 的 Promise；Python 用 `asyncio.create_task(...)`。

合并器（带权多动作打分）示意：`final = Σ wᵢ · P(actionᵢ)`，其中权重可含负值（如举报/划走为负），服务期可调而无需重训。

## 注意事项

硬规则：

1. 不要编造基准数字。被问「快多少」→「取决于负载，自己跑测」。
2. 署名纪律。引用该模式时统一署名「由 xAI 开源的 For You 算法推广」/ `github.com/xai-org/x-algorithm`（Apache-2.0）。
3. 不用商标。不要把用户产物命名为「X-like」或套用「For You」品牌——模式免费，品牌不是。建议命名：候选管线 / 信息流管线 / 排序管线 / recsys 管线。
4. 摆出权衡。多动作 vs 单分值、隔离 vs 联合、在线 vs 离线——绝不默默选默认。
5. 生成的脚手架必须能跑，不要拿伪代码冒充代码。
6. 过滤顺序要紧。便宜先于昂贵，通用先于用户特定。
7. 副作用绝不阻塞，一律 fire-and-forget。

反模式：先打分后过滤（在注定被丢的候选上浪费算力）；同步副作用（缓存写/曝光发阻塞响应）；产品要兼顾多目标（互动 vs 安全 vs 多样性 vs 广告）却只用单一「相关性」分；默认用联合打分（不确定、难缓存、不与重排阶段组合）；为「示意」而生成伪代码（脚手架必须真能运行）。

## 互见

- related：`rag-pipeline-builder`、`rag-implementation-workflow`、`hybrid-search-retrieval`——RAG 重排是本六阶段模式的典型应用场景。
- related：`llm-model-router`——路由/分派与本管线的 Filter/Selector 思路相通。
- combines_with：`multi-agent-workflow-designer`、`agent-workflow-pattern-designer`——把打分/重排阶段编排进更大的智能体工作流。
- combines_with：`data-pipeline-engineer`——离线候选预计算与特征富化落到数据管线侧。
