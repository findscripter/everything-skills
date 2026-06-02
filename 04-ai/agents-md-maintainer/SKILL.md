---
name: agents-md-maintainer
title: AGENTS.md 代理文档创建与维护
description: 当需要为项目创建/更新/审计 AGENTS.md 或 CLAUDE.md、把冗长的 Agent 文档精简为高信号指令时使用；先分析仓库工具链与布局，再产出 <60 行（绝不超 100）的最小化 Agent 文档（含包管理、文件级命令、提交署名等必备小节）；不适用于面向人类的教程式 README/CONTRIBUTING、或把 linter 规则搬进文档；触发词：AGENTS.md、CLAUDE.md、agent docs、代理文档、精简指令、create AGENTS.md、maintain agent docs。
domain: 智能/agents
triggers: [AGENTS.md, CLAUDE.md, agent docs, 代理文档, 精简 Agent 指令, create AGENTS.md, update AGENTS.md, maintain agent docs, set up CLAUDE.md, 文件级命令]
tags: [agents-md, claude-md, agent-docs, documentation, conventions, monorepo]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [skill-creator, skill-optimizer, agent-tool-design, codebase-onboarding-doc]
combines_with: [skill-creator, codebase-onboarding-doc]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

为项目编写**面向 Agent**的规范文档 `AGENTS.md`（及其同义副本 `CLAUDE.md`）时使用。这类文档是 Agent 读取的权威指令源，核心原则是**最小化**：Agent 有能力，不需要手把手教。目标 **< 60 行，绝不超 100 行**——文档越长，指令遵循质量越差。

**该用**：
- 用户要**创建 / 更新 / 审计** `AGENTS.md` 或 `CLAUDE.md`。
- 需要从真实工具链与仓库布局中提炼出高信号、简洁的 Agent 指令。
- 现有 Agent 文档**太长、重复、或已与项目实际约定脱节**，要瘦身校正。

**不该用（边界）**：
- 写**给人类看**的教程式文档（README 的上手指南、贡献流程叙事）——读者不同，不该塞进 AGENTS.md。
- 把 **linter / formatter 规则**搬进文档（`.eslintrc`、`biome.json`、`ruff.toml` 已经是权威源，重复即漂移）。
- 罗列已安装的 skills / 插件（Agent 会自动发现）。

## 步骤 / 指令

```
A. 落地文件
  1. 在项目根创建 AGENTS.md
  2. 建符号链接让 CLAUDE.md 指向它（单一真相源，改一处即可）：
       ln -s AGENTS.md CLAUDE.md
     Windows 无符号链接权限时，退而求其次：保留一份副本并在更新时同步两边。

B. 写之前先勘察仓库（决定哪些内容值得入档）
  3. 包管理器 —— 看 lock 文件判断：pnpm-lock.yaml / yarn.lock /
     package-lock.json / uv.lock / poetry.lock
  4. linter/formatter 配置 —— .eslintrc / biome.json / ruff.toml / .prettierrc
     （识别它们的存在，但【不要】把其中规则抄进 AGENTS.md）
  5. CI/构建命令 —— Makefile、package.json scripts、CI 配置里的权威命令
  6. monorepo 信号 —— pnpm-workspace.yaml / nx.json / Cargo workspace /
     子目录各自的 package.json
  7. 既有约定 —— CONTRIBUTING.md、docs/、README 里已沉淀的模式（引用而非复制）

C. 按写作规则成文
  - 标题 + 要点列表，不写段落散文
  - 命令与模板用代码块
  - 引用而非内嵌：「见 CONTRIBUTING.md」「按 src/api/routes/ 的模式」
  - 无废话：不写开场白、结语、客套
  - 信任 Agent 能力：省略显而易见的上下文
  - 优先文件级命令：单文件 test/lint/typecheck 比全仓构建更快更省
  - 不复制 linter：代码风格活在配置文件里，不在 AGENTS.md
```

**必备小节（始终包含）**：

```markdown
## Package Manager      —— 只写工具名 + 关键命令
Use **pnpm**: `pnpm install`, `pnpm dev`, `pnpm test`

## File-Scoped Commands —— 单文件命令比全仓构建快且省，有就必列
| Task | Command |
|------|---------|
| Typecheck | `pnpm tsc --noEmit path/to/file.ts` |
| Lint | `pnpm eslint path/to/file.ts` |
| Test | `pnpm jest path/to/file.test.ts` |

## Commit Attribution   —— Agent 用自己的身份署名
AI commits MUST include:
Co-Authored-By: (the agent model's name and attribution byline)
例: Co-Authored-By: Claude Sonnet 4 <noreply@example.com>

## Key Conventions      —— 项目特有、Agent 必须遵守的模式，保持简短
```

**可选小节（确有需要才加）**：API 路由模式（给模板不给解释）、CLI 命令（表格）、文件命名约定、项目结构提示（指出关键文件、标出要避开的遗留代码）、monorepo 覆盖（子目录的 `AGENTS.md` 覆盖根目录）。

## 示例

最小化 AGENTS.md 骨架：

```markdown
# Agent Instructions

## Package Manager
Use **pnpm**: `pnpm install`, `pnpm dev`

## Commit Attribution
AI commits MUST include:
Co-Authored-By: (the agent model's name and attribution byline)

## File-Scoped Commands
| Task | Command |
|------|---------|
| Typecheck | `pnpm tsc --noEmit path/to/file.ts` |
| Lint | `pnpm eslint path/to/file.ts` |
| Test | `pnpm jest path/to/file.test.ts` |

## API Routes
[模板代码块，不写解释]

## CLI
| Command | Description |
|---------|-------------|
| `pnpm cli sync` | Sync data |
```

## 注意事项

- **长度即质量**：盯住 < 60 行、绝不超 100 行。审计旧文档时，删比加更重要。
- **反模式清单（看到就删）**：
  - 「Welcome to...」「This document explains...」之类开场白。
  - 「You should...」「Remember to...」之类说教。
  - 已在配置文件里的 linter/formatter 规则。
  - 罗列已装 skills/插件（Agent 自动发现）。
  - 有文件级命令时还写全仓构建命令。
  - 显而易见的指令（「run tests」「write clean code」）。
  - 解释「为什么」（只说做什么）。
  - 大段散文。
- **引用 > 内嵌**：能指向现有文档就别复制，复制即制造未来的漂移源。
- **monorepo**：子目录的 `AGENTS.md` 覆盖根目录同名文件；按需在子包放局部覆盖，根文件保持通用。
- 本条非环境特定校验的替代品；输入、权限、安全边界或成功判据缺失时，先停下问清再写。

## 互见

- related：`skill-creator` —— 同属「为 Agent 沉淀可发现文档」家族；写 SKILL.md 与写 AGENTS.md 共享「最小化、高信号、信任模型能力」的同一套心法。
- related：`agent-tool-design` —— 工具描述与 AGENTS.md 都是被载入上下文、共同引导 Agent 行为的「契约文本」，精简与无歧义原则相通。
- combines_with：`skill-optimizer` —— 写完 AGENTS.md 后，可借其评测/迭代思路验证指令是否真的改变了 Agent 行为，而非自我感觉良好。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
