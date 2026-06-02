---
name: four-voice-decision-council
title: 四声决策议会（结构化异议与权衡）
description: 当一个决策存在多条可信路径、没有明显赢家、需要在拍板前主动暴露权衡与异议时使用；做法是先独立形成架构师立场，再以「问题+精简上下文」并行起三个隔离子智能体（怀疑者/现实派/批评者），最后带偏置护栏综合出可手机阅读的判决；不适用于代码审查、实现拆解、架构设计或有标准答案的事实问题。触发词：换个意见、要不要上、多方权衡
domain: 通用/thinking
triggers: [换个意见/反对意见, 要不要现在上线, 多条路都说得通, 帮我权衡一下利弊, go/no-go 判断, 怕被对话锚定, 想听几种视角, second opinion, devil's advocate, anti-anchoring]
tags: [决策, 思维, 对抗式评审, 权衡, 异议, 防锚定, 通用]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [隔离子智能体（并行起 3 个新上下文角色）, 文件读写（决策落库，可选）]
requires: []
related: [boardroom-deliberation, executive-adversarial-mentor, premortem-plan-challenger, decision-navigator, first-principles-thinking]
combines_with: [premortem-plan-challenger, business-assumption-stress-test, entity-research-dossier]
license: MIT
source: affaan-m/everything-claude-code
source_license: MIT
---
## 何时使用

为**模糊决策**召集四位顾问，专治「多条路都说得通、没有明显赢家」：
- 当前上下文里 Claude 的声音（架构师）
- 怀疑者子智能体
- 现实派子智能体
- 批评者子智能体

适用：
- 决策有多条可信路径、没有显然的赢家。
- 需要把隐性的**权衡显式摆上台面**。
- 用户明确想要别的意见、反对意见或多视角。
- **对话锚定**是真实风险（前面的讨论会把你带偏）。
- go/no-go 判断能从对抗式挑战中获益。

例：单仓 vs 多仓；现在发 vs 打磨再发；功能开关灰度 vs 全量铺开；收窄范围 vs 保留战略广度。

不该用（负边界）——这是**模糊性下的决策**工具，不是代码评审、实现计划或架构设计：

| 你真正想做的 | 改用 |
| --- | --- |
| 验证产出是否正确 | 对抗式验证 / `santa-method` |
| 把功能拆成实现步骤 | `planner` 类规划技能 |
| 设计系统架构 | `architect` 类架构技能 |
| 查 bug / 安全的代码评审 | `code-reviewer` 类技能 |
| 直接的事实问题 | 直接回答 |
| 明摆着的执行任务 | 直接干 |

四个角色各自的镜头：架构师=正确性、可维护性、长期影响；怀疑者=挑战前提、寻找最简方案、打破假设；现实派=发布速度、用户影响、运维现实；批评者=边界情形、下行风险、失败模式。

## 步骤

1. **抽取真正的问题**：把决策压缩成一句明确的提示——在决定什么？哪些约束重要？什么算成功？问题若仍模糊，先问**一个**澄清问题再召集议会。
2. **只收集必要上下文**：与代码库强相关时，收集相关文件/片段/issue 文本/指标，保持精简，只放做决策所需的部分；纯战略/通用决策则跳过仓库片段（除非它实质改变答案）。
3. **先独立形成架构师立场**：在读到任何外部声音之前，写下你的初始立场、支持它的 3 条最强理由、首选路径的主要风险。**先写下来**，综合阶段才不会沦为外部声音的回声。
4. **并行起三个独立的声音**：每个子智能体只收到「决策问题 + 必要时的精简上下文 + 严格的角色设定」，**不带多余对话历史**——这正是防锚定机制。
5. **带偏置护栏综合**：你既是参与者又是综合者，遵守护栏（见下「指令」）。
6. **给出精简判决**：用下方判决模板，确保能在手机屏上一眼扫完。

## 指令

第 4 步给三个子智能体的提示模板（保留英文原文，便于直接复用）：

```text
You are the [ROLE] on a four-voice decision council.

Question:
[decision question]

Context:
[only the relevant snippets or constraints]

Respond with:
1. Position — 1-2 sentences
2. Reasoning — 3 concise bullets
3. Risk — biggest risk in your recommendation
4. Surprise — one thing the other voices may miss

Be direct. No hedging. Keep it under 300 words.
```

角色侧重：
- **怀疑者**：挑战提问的框架本身，质疑假设，提出最简的可信替代方案。
- **现实派**：为速度、简单、真实世界的可执行性做优化。
- **批评者**：暴露下行风险、边界情形、以及计划可能失败的原因。

第 5 步综合偏置护栏（防止「你既当裁判又当选手」的偏置）：
- 不得在不给理由的情况下否决某个外部观点。
- 若外部声音改变了你的推荐，**明确说出**「我因此改了」。
- 即便最终拒绝，也始终把**最强反对意见**写进判决。
- 若有两个声音反对你的初始立场，把它当成**真实信号**对待，而非噪声。
- 在给出判决前，保留各角色的**原始立场**可见，不要提前抹平。

第 6 步判决输出模板（保留英文骨架，扫读优先）：

```markdown
## Council: [short decision title]

**Architect:** [1-2 sentence position]
[1 line on why]

**Skeptic:** [1-2 sentence position]
[1 line on why]

**Pragmatist:** [1-2 sentence position]
[1 line on why]

**Critic:** [1-2 sentence position]
[1 line on why]

### Verdict
- **Consensus:** [where they align]
- **Strongest dissent:** [most important disagreement]
- **Premise check:** [did the Skeptic challenge the question itself?]
- **Recommendation:** [the synthesized path]
```

落库规则（重要约束）：**不要**从本技能随手往 `~/.claude/notes` 或其它影子路径写临时笔记。仅当议会**实质改变了推荐**时才落库——用 `knowledge-ops` 类技能把教训存到恰当的持久位置，或用 `/save-session` 写入会话记忆，或直接更新对应的 GitHub / Linear issue。只有当决策真的改变了某个东西，才持久化。

多轮跟进：**默认一轮**。用户要再来一轮时，把新问题收得更聚焦；上一轮判决仅在必要时带入；尽量让怀疑者保持「干净」，以保留防锚定的价值。

## 示例

问题：

```text
Should we ship ECC 2.0 as alpha now, or hold until the control-plane UI is more complete?
```

议会可能的形态：
- **架构师**主张结构完整性、避免暴露一个混乱的产品表面。
- **怀疑者**质疑 UI 是否真的是卡发布的因素。
- **现实派**问：在不损伤信任的前提下，现在到底能发出什么。
- **批评者**聚焦支持负担、期望债务、灰度推广的混乱。

价值不在「达成一致」，而在**拍板前把分歧讲清楚**。

## 注意事项

- **隔离起子智能体不可省**：三个外部声音必须以「新上下文 + 仅问题与必要约束」启动，绝不喂入整段对话历史，否则防锚定失效、议会退化成回声室。
- **架构师先写、外部声音后读**：顺序反了，综合就会只是复述外部观点。
- **最终判决不许藏分歧**：哪怕采纳多数路径，最强反对意见也要单列。
- **别把所有决策都落库**：无论重要与否一律记笔记，是反模式；只在决策真改变了实际之物时才持久化。
- 反模式清单：拿议会做代码评审；任务只是纯实现工作却召集议会；把整段对话脚本塞给子智能体；在最终判决里抹平不一致。

## 互见

- 同域近邻：`boardroom-deliberation`（C 级多角色六阶段审议，角色更多、流程更重）、`decision-navigator`（用户卡壳时的分支提问导航）、`first-principles-thinking`（怀疑者「打破假设」的底层方法）。
- 上游可配：`search-first` / `entity-research-dossier`（议会前按需补外部参照资料）。
- 下游可配：对抗式验证 / `santa-method`（验证产出正确性）、`premortem-plan-challenger`（对选定路径再做事前验尸）、`knowledge-ops` / `architecture-decision-records`（决策升级为长期系统策略时正式归档）。

---

采编自 affaan-m/everything-claude-code（MIT）。
