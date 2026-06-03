---
name: full-output-enforcement
title: 完整无省略代码输出约束
description: 当用户要求完整文件/完整实现/穷尽清单等不可省略的交付时使用；做强制输出全量内容并消除占位符与跳段，产出可直接运行的完整交付物；不适用于突破 token 上限、安全限制或编造不存在的代码/凭据/私有 API；触发词：完整文件、不要省略、全量输出
domain: 研发/review
triggers: [完整文件, 不要省略, 全量输出, 完整实现, 穷尽清单, 禁止占位符, full output, no placeholder]
tags: [输出约束, 代码生成, 质量, misc]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [claude, cursor, codex, antigravity]
requires: []
related: [llm-coding-mistake-guardrails, code-reviewer, adversarial-code-reviewer, llm-prompt-optimizer]
combines_with: [code-simplifier, code-reviewer]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 用户明确要求**完整文件 / 完整实现 / 穷尽清单 / 不可删减的交付物**时。
- 一旦出现占位符、跳段、`TODO` 桩、以"描述代替实现"就会破坏需求时。
- 长答案需要拆成**干净的续写分块**，且不能丢失完整性与结构连贯时。

**不该用（负边界）**：本约束只保证"完整度"，不能突破 token 上限、安全限制、缺失的源上下文，也不能覆盖用户自定的范围边界；更不得为了凑齐"完整输出"而**编造**不存在的代码、凭据、私有 API 或项目文件。

## 步骤

1. **锁定范围（Scope）**：通读完整需求，数清预期交付物的**数量**（文件 / 函数 / 小节 / 答案），把这个数字锁死。
2. **全量构建（Build）**：逐一完整生成每个交付物。不留半成品，不写"你后续可以自行扩展"。
3. **交叉核对（Cross-check）**：输出前重读原始需求，把实际交付数量与锁定数量比对；缺什么先补齐再回复。

## 指令

把每个任务都当作**生产级关键任务**：部分输出 = 损坏输出。不为简洁妥协，只为完整优化。要全文件就给全文件，要 5 个组件就给 5 个组件，无例外。

**禁止输出模式（出现即视为硬失败）：**

- 代码块内：`// ...`、`// rest of code`、`// implement here`、`// TODO`、`/* ... */`、`// similar to above`、`// continue pattern`、`// add more as needed`，以及裸 `...` 顶替被省略的代码。
- 散文内："需要的话告诉我继续""如需更多细节可补充""为简洁起见""其余同理""剩下的照此类推""以此类推"（用于顶替真实内容）、"留作练习"。
- 结构性偷工：需求要完整实现却只给骨架；只展示首尾、跳过中间；用一个示例 + 描述替代重复逻辑；用"描述代码该做什么"代替"写出代码"。

## 示例

**触顶 token 时的正确收尾**：不压缩、不跳到结论，在干净断点（函数末 / 文件末 / 小节末）按全质量停下，并以固定标记结束：

```
[PAUSED — X of Y complete. Send "continue" to resume from: next section name]
```

收到 `continue` 后，从断点处**精确续写**：不复述、不重复。

## 注意事项

- 长输出确需分块时，每块都贴清晰标号，并核对与上一块**无缝衔接**。
- 收尾前过一遍快速检查清单：
  - 全文无任何上述禁止模式；
  - 用户要的每一项都在且已完成；
  - 代码块是真正可运行的代码，而非对代码的描述；
  - 没有任何内容为省空间而被缩水。

## 互见

- 适用于各类代码生成 / 长文档交付场景，可与研发域的"代码审查""逐文件实现"类技能配合，作为输出阶段的兜底约束。

---

采编自 sickn33/antigravity-awesome-skills（MIT，原作者 Leonxlnx，源 repo Leonxlnx/taste-skill）。
