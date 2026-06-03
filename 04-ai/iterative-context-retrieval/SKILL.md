---
name: iterative-context-retrieval
title: 迭代式上下文检索精炼模式
description: 当多 Agent 工作流中子 Agent 不知道该用哪些上下文（盲发文件易超限或遗漏）时使用；以「派发-评估-精炼-循环」四阶段最多 3 轮地逐步收敛出高相关文件集；不适用于上下文已明确或单文件小任务。触发词：上下文检索、子Agent上下文、迭代检索、相关性评分、检索精炼
domain: 智能/rag
triggers: [子 Agent 不知道需要哪些文件, 盲发全部上下文导致超限或遗漏, 需要为检索 Agent 设计上下文收集策略, 代码库术语与查询关键词不匹配（如 rate 与 throttle）, 要在多智能体编排中精准喂给子 Agent 相关代码]
tags: [rag, 上下文工程, 多智能体编排, 检索精炼, 相关性评分, 子agent]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Grep, Glob, Read, Task]
requires: []
related: [hybrid-search-retrieval, rag-implementation-workflow, query-decomposition-search, context-compression]
combines_with: [multi-agent-workflow-designer, context-window-management]
license: MIT
source: affaan-m/everything-claude-code
source_license: MIT
---
## 何时使用

在多 Agent 工作流中，子 Agent 启动时上下文有限，它在真正开工前并不知道：哪些文件含相关代码、代码库存在哪些模式、项目用什么术语。三种朴素做法都会失败：

- 全部塞入：超出上下文窗口；
- 什么都不给：缺关键信息无法工作；
- 拍脑袋猜：经常猜错。

本模式用「逐步精炼」替代「一次性决定」，适合需要为子 Agent 精准准备上下文、或查询关键词与代码库实际术语不匹配的场景。

不该用的边界：
- 上下文已经明确（用户已点名具体文件）——直接读取，别空转检索循环；
- 单文件 / 小范围改动——朴素读取更快；
- 检索代价高于收益的一次性查询——别为它套四阶段框架。

## 步骤

四阶段闭环，最多 3 轮，到点即止（不要无限循环）：

1. **DISPATCH 派发**：从高层意图出发，发起一次「宽」查询收集候选文件。初始查询给出 patterns（如 `src/**/*.ts`）、keywords（如 authentication、user、session）、excludes（如 `*.test.ts`），故意不要过度限定。
2. **EVALUATE 评估**：对取回内容逐个打相关性分（0-1），并记录「为什么相关」和「还缺什么上下文（gaps）」。
3. **REFINE 精炼**：依据评估更新查询——把高相关文件里发现的新模式/术语加进 patterns 与 keywords，把确认无关（<0.2）的路径加入 excludes，并把缺口列为下一轮的 focusAreas。
4. **LOOP 循环**：用精炼后的标准重跑，最多 3 轮。一旦「足够好」立即停止，把相关性 ≥0.7 的文件作为结果返回。

相关性评分基准：
- 高 (0.8-1.0)：直接实现目标功能；
- 中 (0.5-0.7)：含相关模式或类型；
- 低 (0.2-0.4)：间接相关；
- 无 (0-0.2)：无关，排除。

停止条件（满足即提前退出，不必跑满 3 轮）：高相关文件 ≥3 个且无关键缺口。

## 指令

把以下提示嵌入子 Agent 的 prompt，让它自带迭代检索行为：

```markdown
为本任务检索上下文时：
1. 从宽泛的关键词检索开始
2. 给每个文件的相关性打分（0-1）
3. 识别仍然缺失的上下文
4. 精炼检索标准并重复（最多 3 轮）
5. 返回相关性 ≥0.7 的文件
```

核心循环的参考实现（逻辑骨架，可用 Grep/Glob/Read/Task 等工具落地）：

```javascript
async function iterativeRetrieve(task, maxCycles = 3) {
  let query = createInitialQuery(task);
  let bestContext = [];

  for (let cycle = 0; cycle < maxCycles; cycle++) {
    const candidates = await retrieveFiles(query);
    const evaluation = evaluateRelevance(candidates, task);

    // 是否已有足够上下文
    const highRelevance = evaluation.filter(e => e.relevance >= 0.7);
    if (highRelevance.length >= 3 && !hasCriticalGaps(evaluation)) {
      return highRelevance;
    }

    // 精炼后继续
    query = refineQuery(evaluation, query);
    bestContext = mergeContext(bestContext, highRelevance);
  }

  return bestContext;
}
```

REFINE 阶段的更新规则（要点）：新模式追加进 patterns，代码库术语追加进 keywords，相关性 <0.2 的路径并入 excludes，缺口去重后写入 focusAreas。

## 示例

例 1：Bug 修复上下文 —— 任务「修复认证 token 过期 bug」

```
轮1 DISPATCH: 在 src/** 搜 "token"、"auth"、"expiry"
    EVALUATE: auth.ts(0.9)、tokens.ts(0.8)、user.ts(0.3)
    REFINE:   加入 "refresh"、"jwt"；排除 user.ts
轮2 DISPATCH: 用精炼术语重搜
    EVALUATE: session-manager.ts(0.95)、jwt-utils.ts(0.85)
    REFINE:   上下文已足够（2 个高相关文件）
结果: auth.ts、tokens.ts、session-manager.ts、jwt-utils.ts
```

例 2：术语不匹配的功能实现 —— 任务「给 API 端点加限流」

```
轮1 DISPATCH: 在 routes/** 搜 "rate"、"limit"、"api"
    EVALUATE: 无命中——代码库实际用的是 "throttle"
    REFINE:   加入 "throttle"、"middleware"
轮2 DISPATCH: 用精炼术语重搜
    EVALUATE: throttle.ts(0.9)、middleware/index.ts(0.7)
    REFINE:   还需要路由器模式
轮3 DISPATCH: 搜 "router"、"express"
    EVALUATE: router-setup.ts(0.8)；上下文已足够
结果: throttle.ts、middleware/index.ts、router-setup.ts
```

例 2 体现本模式的核心价值：第一轮往往会暴露代码库的真实命名规则（rate→throttle），第二轮起检索才精准。

## 注意事项

1. **先宽后窄**：初始查询不要过度限定，否则一开始就漏掉候选。
2. **学习代码库术语**：首轮常会揭示命名规则，据此修正关键词。
3. **显式追踪缺口**：把「还缺什么」写出来（missingContext / focusAreas），它是驱动精炼的关键，而非靠感觉。
4. **「足够好」就停**：3 个高相关文件优于 10 个平庸文件；命中停止条件即退出，别跑满。
5. **果断排除**：低相关文件不会在后续轮次中突然变相关，确认无关就并入 excludes。

## 互见

- `continuous-learning` 技能 —— 随时间改进的检索/命名模式沉淀。
- 多智能体编排相关技能 —— 子 Agent 的派发与上下文准备。
- 子 Agent 定义通常位于 `~/.claude/agents/`。

---

采编自 affaan-m/everything-claude-code（MIT 许可）。
