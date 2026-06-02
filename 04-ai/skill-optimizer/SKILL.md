---
name: skill-optimizer
title: Agent 技能诊断与优化（Skill Optimizer）
description: 当某条 Agent 技能（SKILL.md）不触发、误触发、烧 token 或想审计整个技能库质量时使用；做基于真实会话记录 + 静态质检的 8 维诊断，按 5 分制打分并输出 P0/P1/P2 修复清单（只读、不改源文件）；不适用于从零创建技能、改写技能内容或微调单句提示词；触发词：技能不触发、优化 skill、审计技能库、误触发、欠触发、description 触发率、token 浪费
domain: 智能/agents
triggers: [技能不触发, 优化 skill, skill optimizer, 审计技能库, 误触发, 欠触发, undertrigger, overtrigger, description 触发率, token 浪费, 技能评分, 诊断技能]
tags: [skill, audit, diagnostics, cso, description, agents, meta, token优化, 智能]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, ripgrep]
requires: []
related: [skill-creator, llm-prompt-optimizer, agent-tool-design, llm-agent-benchmarking]
combines_with: [llm-judge-evaluation, self-improving-memory-agent, langfuse-llm-observability]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
# Agent 技能诊断与优化（Skill Optimizer）

## 何时使用

适用：
- 某条技能「该触发却没触发」或像是坏了，需要定位原因。
- 想审计、体检整个技能库的质量，找出哪些技能表现差、在白白吃 token。
- 想用**真实会话记录 + 静态质检**给技能量化打分，拿到带优先级的修复清单。

不该用（负边界）：
- 想**从零创建**新技能、改写技能正文内容 —— 用 `skill-creator`。
- 只想微调单句提示词 —— 用 `llm-prompt-optimizer`。
- 缺少会话记录（全新环境、刚装的技能）：触发/反应/完成率类维度无数据可分析，此时只能跑静态质检（4.4）和环境一致性（4.7），其余维度如实标 `N/A — 会话数据不足`，不要硬编故事。

**硬规则**：
- **只读**：绝不修改任何技能文件，只输出诊断报告。
- **8 维全做**：不得跳过任一维度；数据不足就写 `N/A`，不要省略。下文 4.2/4.3/4.5b/4.8 是最易被偷懒跳过、却最有价值的四维。
- **量化优于形容**：「上周有 12 次研究任务但该技能 0 触发」远胜「你经常做研究」。
- **建议而非命令**：给具体的 description 改写措辞，但措辞框成「建议」。
- **亮证据**：声称「欠触发」时，**原文引用**那条本该触发技能的用户消息。
- **改写要援引依据**：建议改 description 时，点明背后的研究结论（如「触发关键词前置 —— MCP 研究显示选择率提升 3.6 倍」）。

## 步骤

```
锁定目标技能 → 采集会话数据(python 扫 JSONL) → 跑 8 维分析 → 算综合分 → 输出 P0/P1/P2 报告
```

### 步骤 1 · 锁定目标技能
按序扫描技能目录：`~/.claude/skills/`、`~/.codex/skills/`、`~/.agents/skills/`，按技能名去重（多处同名 = 同一技能）。逐个读 `SKILL.md`，抽取：name、description（取自 YAML frontmatter）、触发关键词（取自 description）、定义的工作流步骤（Step 1/2/3… 或 Workflow 下的 ### 小节）、字数。用户若指定了技能名，只留这些。

### 步骤 2 · 采集会话数据
用 python 脚本经 Bash 扫会话 JSONL。**自动探测平台**：检查哪些目录存在，全部可用源都扫（用户可能同时装了 Claude Code 和 Codex）。

| 来源 | Claude Code | Codex |
|---|---|---|
| 会话记录 | `~/.claude/projects/**/*.jsonl` | `~/.codex/sessions/**/*.jsonl` |
| 技能文件 | `~/.claude/skills/*/SKILL.md` | `~/.codex/skills/*/SKILL.md`（共享：`~/.agents/skills/*/SKILL.md`） |

- Claude Code：数 `Skill` 工具调用、用户消息全文、技能调用后的助手消息（追工作流）与用户消息（追反应）。
- Codex：技能靠**上下文注入**而非显式 `Skill` 调用。`base_instructions` 里出现 ≠ 真正被用。真用的判据是：在该会话的 `response_item` 里检索到技能特有的工作流标记（步骤标题、输出格式）—— 只有产出遵循了技能定义的工作流，才算「调用」。

### 步骤 3 · 跑 8 维分析（必须全做）

- **4.1 触发率**：实际调用次数 vs 触发词在用户消息中出现的次数。0 触发 → 可能没用或触发词写错；关键词远多于调用 → 欠触发，description 要改；高频 → 核心技能，值得优化。
- **4.2 调用后用户反应**（易跳，别跳）：读调用后用户的接下来 3 条消息，分类为 负面 / 纠正 / 正面 / 静默转移（换话题 = 很可能误触发），算每技能满意率。
- **4.3 工作流完成率**（易跳，别跳）：从 SKILL.md 抽步骤，在该会话助手消息里找步骤标记，算执行走到第几步。报 `{技能} (N 步)：平均走到 Step X/N (Y%)`，并标出常卡住的那一步。
- **4.4 静态质检**：逐条 SKILL.md 过 14 条规则（见下表）。
- **4.5a 误触发（Overtrigger）**：被调用了但用户立刻拒绝/无视。报计数 + 例子。
- **4.5b 欠触发（Undertrigger，最高价值维度）**：抽技能的**能力关键词**（不只触发词，而是它**能做什么**），扫用户消息里匹配该能力却**没**调用技能的任务，原文引用并给改写建议。**复利风险**：若某技能在 5+ 个相关任务出现的会话里**长期 0 触发**，标为「复利风险」—— 欠触发的技能拿不到使用反馈、无法自我改进，缺口会越拉越大，建议立刻改写 description 列为 P0。
- **4.6 跨技能冲突**：两两比对，找触发词重叠 / 工作流重叠 / 指引矛盾。报冲突对。
- **4.7 环境一致性**：抽技能引用的文件路径（`test -e`）、CLI 工具（`which`）、目录是否存在，标出失效引用。报每条引用 通过/失败。
- **4.8 Token 经济性**（易跳，别跳）：性价比 = 触发次数 / 字数；标出「体量大 + 从未触发」的技能为删除/压缩候选。**渐进式加载三层体检**：第 1 层 frontmatter（description ≤ 1024 字符？）/ 第 2 层 SKILL.md 正文（< 500 行？）/ 第 3 层 references（细节是否拆进按需加载的引用文件，还是全塞进 SKILL.md）。500+ 字塞进 SKILL.md 且不用 references 的，标「渐进式加载差」。

### 步骤 4 · 综合分（5 分制）
5 健康 / 4 良好（1-2 维小问题）/ 3 需关注（1 维明显缺陷或 3+ 维小缺陷）/ 2 有问题（从未触发 / 负面反应 / 重大静态问题）/ 1 损坏（不工作 / 引用缺失 / 根本性错位）。

加权计分维度：触发率 25% · 用户反应 20% · 工作流完成 15% · 静态质量 15% · 欠触发 15% · token 经济 10%。
仅报告不计分：4.5a 误触发（计数+例子）· 4.6 冲突（冲突对）· 4.7 环境（逐条通过/失败）。

## 指令

**4.4 静态质检 14 规则（通过判据）**：

| 检查项 | 通过判据 |
|---|---|
| frontmatter 格式 | 仅 `name`+`description`，合计 < 1024 字符 |
| name 格式 | 仅字母、数字、连字符 |
| description 触发条件 | 以「Use when…」开头或写明显式触发条件 |
| description 工作流泄漏 | description **不**复述工作流步骤（CSO 违规） |
| description 强势度 | 主动声明「该在何时用」，而非被动描述 |
| Overview 小节 | 存在 |
| Rules 小节 | 存在 |
| MUST/NEVER 密度 | 数全大写指令词，每 100 词 > 5 个 → 标记 |
| 字数 | < 500 词（超则标记） |
| 叙事反模式 | 无「In session X, we found…」式讲故事 |
| YAML 引号安全 | description 含 `: ` 必须用双引号包裹 |
| 关键信息位置 | 核心触发条件与主要动作须在 SKILL.md 前 20% |
| description 250 字符 | 主触发关键词须出现在 description 前 250 字符内 |
| 触发条件数 | description 内 ≤ 2 个触发条件为佳 |

**报告格式骨架**：

```markdown
# 技能优化报告
**日期**: {date}  **范围**: {全部/指定技能}  **会话数据**: {N} 会话, {时间范围}

## 总览
| 技能 | 触发 | 反应 | 完成 | 静态 | 欠触发 | Token | 评分 |
|------|------|------|------|------|--------|-------|------|
| example-skill | 2 | 100% | 86% | B+ | 1 漏 | 486w | 4/5 |

## P0 修复（阻断使用） … ## P1 改进（体验） … ## P2 可选优化 …

## 逐技能诊断
### {技能名}
#### 4.1 触发率 … (全 8 维)
```

## 示例

`/optimize-skill` 扫全部技能；`/optimize-skill my-skill` 单条；`/optimize-skill skill-a skill-b` 指定多条。

欠触发证据写法（援引研究 + 原文引用）：

```
技能 deep-research：能力关键词 = 多源调研/事实核查/引用报告
  本周相关任务 12 次，触发 0 次 → 复利风险，建议 P0 改写 description
  证据（应触发却没触发的原话）：
    用户: "帮我把这三家供应商的 SOC2 合规情况都查一遍并给出处"
  建议：description 前置触发关键词「多源调研/带引用」
    —— 依据 MCP 描述质量研究：好描述选择率 72% vs 随机 20%（3.6 倍）
```

## 注意事项

- **CSO（Claude/Agent Search Optimization）= 把 description 写到让 Agent 在对的时机选对技能**。本技能本质就是查 CSO 违规并量化其代价。
- **Codex 的「加载」不等于「调用」**：`base_instructions` 里有技能 ≠ 被用，务必靠工作流标记二次确认，否则触发率会虚高。
- **静态质检的「关键信息位置」源自 Lost in the Middle**（LLM 注意力呈 U 形）：触发条件埋在 SKILL.md 中段会显著掉召回，故要求前置。
- **格式本身就影响表现**：He et al. 显示仅格式变化即可造成 9–40% 性能波动 —— 改 description 时连同结构、措辞一起评估，别只换词。
- **欠触发技能无法自愈**：它拿不到使用反馈，问题会随时间复利放大，遇到才优先级降级是错的，应升 P0。
- **本工具不替代人工**：报告是诊断，不替代针对你环境的验证、测试与专家评审；缺输入/权限/安全边界/成功判据时先停下澄清。
- 上游原作 hqhq1025/skill-optimizer（MIT）；本条经 sickn33/antigravity-awesome-skills 收录，已按本仓库 SCHEMA 适配重写而非逐字翻译。

## 互见
- related：`skill-creator` —— 它负责**创建/改写**技能，本条负责**诊断**已有技能；诊断出问题后交给它落地修复。
- related：`llm-prompt-optimizer` —— 同源 MIT 条目；当问题落到「单条提示词措辞」而非「技能触发与库治理」层面时用它。

---
采编自 sickn33/antigravity-awesome-skills（MIT），上游原作 hqhq1025/skill-optimizer（MIT）。
