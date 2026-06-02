---
name: self-improving-memory-agent
title: 自改进记忆沉淀智能体
description: 当 Claude Code 自动记忆 MEMORY.md 攒满零散学习、想把复现模式固化成规则或技能时使用；做记忆审计、把模式从 MEMORY.md 毕业到 CLAUDE.md/.claude/rules、抽调试解法成技能、管理 200 行容量；不适用于一次性笔记或无 auto-memory 环境。触发词：自动记忆、MEMORY.md、记忆审计、CLAUDE.md、规则沉淀、提炼技能、记忆容量
domain: 智能/agents
triggers: [自动记忆, auto-memory, MEMORY.md, 记忆审计, memory review, 记忆沉淀, 规则提升, promote rule, CLAUDE.md, .claude/rules, 提炼技能, extract skill, 记忆容量, 记忆健康, self-improving, 自改进]
tags: [智能体, agents, 自动记忆, CLAUDE.md, 规则治理, 技能提炼, 上下文工程, Claude Code]
level: 进阶
status: stable
agents: [claude-code]
tools: [Read, Write, Edit, Bash]
requires: []
related: [agent-memory-systems, llm-conversation-memory, agent-memory-architecture, skill-creator]
combines_with: [skill-optimizer, autonomous-coding-agent-patterns, autoresearch-optimization-agent]
license: CC-BY-4.0
source: alirezarezvani/claude-skills
source_license: MIT
---

# 自改进记忆沉淀智能体

> 自动记忆负责「捕获」，本技能负责「策展」。

Claude Code 的 auto-memory（v2.1.32+）会自动把项目模式、调试洞见、你的偏好记进 `MEMORY.md`。但它只记不判：分不清临时与永久、不知哪条该升级成强制规则、不会清理过期项腾容量。本技能补上这层判断力。

## 何时使用

适用：

- 想回顾 Claude 到底学到了关于本项目的什么（审计 MEMORY.md）。
- 某个模式反复出现 2–3 次，想从「笔记」升格为「强制规则」（CLAUDE.md / `.claude/rules/`）。
- 一段调试解法值得复用，想抽成独立技能。
- MEMORY.md 逼近 200 行上限，需要清理过期项腾出空间。

不该用：

- 仅记录一次性、本会话用完即弃的临时上下文 → 让 auto-memory 自己捕获即可。
- 运行环境没有 auto-memory（如纯手工环境）→ 直接手写 CLAUDE.md / rules。
- 想设计跨会话向量记忆 / RAG 检索层 → 转 `agent-memory-systems`。

核心心智：**提升 = 毕业**。学习从 Claude 的草稿纸（MEMORY.md，会被截到 200 行）搬进项目规则系统（CLAUDE.md / rules，全量加载、优先级更高），才算真正生效。

## 记忆架构

| 文件 | 谁写 | 作用域 | 加载方式 |
|------|------|--------|----------|
| `./CLAUDE.md` | 你（+ 提升） | 项目规则 | 全文，每会话 |
| `~/.claude/CLAUDE.md` | 你 | 全局偏好 | 全文，每会话 |
| `~/.claude/projects/<path>/memory/MEMORY.md` | Claude（自动） | 项目学习 | 前 200 行 |
| `~/.claude/projects/<path>/memory/*.md` | Claude（溢出） | 主题笔记 | 按需 |
| `.claude/rules/*.md` | 你（+ 提升） | 局部规则 | 匹配文件打开时 |

提升生命周期：

```
1. Claude 发现模式 → 写入 auto-memory（MEMORY.md）
2. 模式复现 2-3 次 → 审计时标记为「提升候选」
3. 你批准 → 毕业到 CLAUDE.md 或 .claude/rules/
4. 从「笔记」变成「强制规则」
5. 删除 MEMORY.md 中的原项 → 腾出容量给新学习
```

## 步骤 / 指令

参考的几个工作流（对应原插件命令）：

| 动作 | 做什么 |
|------|--------|
| 审计（review） | 读 MEMORY.md 与主题文件，挑出提升候选、过期项、可合并项 |
| 提升（promote） | 把一条模式从 MEMORY.md 毕业到 CLAUDE.md 或 `.claude/rules/` |
| 提炼（extract） | 把验证过的模式做成独立技能（转 `skill-creator`） |
| 体检（status） | 行数、主题文件、容量与建议 |
| 显式记忆（remember） | 主动把重要知识写进 auto-memory |

**审计 MEMORY.md：**

1. 读 `MEMORY.md` 及同目录 `*.md` 主题文件。
2. 标出三类条目：
   - 提升候选：跨会话复现、已被多次印证的模式。
   - 过期项：引用了已删文件 / 旧约定的条目。
   - 可合并项：彼此相关、应整合成一条的散项。
3. 找差距：MEMORY.md 已知但 CLAUDE.md 尚未强制的规则。

**提升一条模式：**

1. 判断归宿——通用规则进 `CLAUDE.md`；只对特定文件类型生效的进 `.claude/rules/`（带 `paths` frontmatter，零开销）。
2. 把「背景陈述」改写成「强制指令」：
   - MEMORY.md：「我注意到本项目用 pnpm」（背景）
   - CLAUDE.md：「用 pnpm，不要用 npm」（强制）
3. 写入目标文件后，**删掉 MEMORY.md 里的原项**，腾容量。

**提炼成技能：** 把可复用的解法交给 `skill-creator`，产出带 frontmatter 的 SKILL.md + 示例 + 边界，可直接 `/plugin install` 或发布。

## 示例

局部规则——只在打开 API 测试文件时加载（`.claude/rules/api-testing.md`）：

```yaml
---
paths:
  - "src/api/**/*.test.ts"
  - "tests/api/**/*"
---
- Use supertest for API endpoint testing
- Mock external services with msw
- Always test error responses, not just happy paths
```

提升前后对比（同一条知识，作用力天差地别）：

```
# 提升前 · MEMORY.md（前 200 行内，可能被截断）
- 观察到项目用 pnpm 管理依赖

# 提升后 · CLAUDE.md（全文加载，强制优先）
- 包管理统一用 pnpm，禁止 npm/yarn
```

错误捕获钩子思路（PostToolUse → Bash）：监控命令输出，检测到错误时向 auto-memory 追加结构化条目（失败命令、截断的错误输出、时间戳、建议分类）。成功时零 token 开销，仅在出错时约 30 token。

## 注意事项

- MEMORY.md 只加载**前 200 行**：过期项不清理会挤掉新学习，审计时优先剪枝。
- 提升后**务必删除 MEMORY.md 原项**，否则两处重复、容量浪费。
- 别把所有东西都塞进 CLAUDE.md：只对特定文件生效的规则放 `.claude/rules/` 并配 `paths`，避免每会话全量加载的无谓开销。
- 本技能强依赖 Claude Code 的 auto-memory（v2.1.32+）。其他平台为降级支持：OpenClaw 读 `workspace/MEMORY.md`，Codex CLI 读 `AGENTS.md`，GitHub Copilot（`.github/copilot-instructions.md`）仅支持手动提升。
- auto-memory 只捕获不判断——临时 vs 永久、是否该升级成规则、是否值得抽成技能，都需要人/本技能来定夺。

## 互见

- related：`agent-memory-systems` —— 那条解决「智能体跨会话向量/RAG 记忆」的工程化；本条解决「Claude Code 文件态记忆的治理与沉淀」，互补不重叠。
- combines_with：`skill-creator` —— 审计出值得复用的模式后，交给它落地成标准技能。

---

采编自 alirezarezvani/claude-skills（MIT）。
