---
name: codetour-walkthrough-builder
title: CodeTour 代码导览生成
description: 当需要为代码库生成面向特定读者、可点击跳转到真实文件与行号的分步导览（CodeTour .tour）时使用；做仓库探查→意图推断→逐文件核验→输出 .tours/<persona>-<focus>.tour（含 PR 评审/新人上手/架构/RCA/安全等画像与叙事步骤）并通过校验清单；不适用于纯散文讲解、需改源码或无法逐行核验路径的场景；触发词：CodeTour、代码导览、代码漫游、tour、onboarding tour、架构导览、PR 评审导览、RCA 导览、讲清 X 怎么跑、vibe check
domain: 研发/architecture
triggers: [CodeTour, 代码导览, 代码漫游, tour, onboarding tour, 架构导览, PR 评审导览, RCA 导览, 讲清 X 怎么跑, vibe check, .tour 文件]
tags: [codetour, walkthrough, onboarding, architecture, pr-review, rca, vscode, documentation]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [VS Code CodeTour extension, Git]
requires: []
related: []
combines_with: []
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

适用：
- 用户要为代码库生成「代码导览 / onboarding tour / 架构走查 / PR 评审导览 / RCA 导览」。
- 用户说「讲清 X 怎么跑」「快速 vibe check」「贡献者指南」「安全评审走查」。
- 任何需要带文件/行号锚点的结构化分步讲解。

不该用（负边界）：
- 只需一段散文/口头解释，不需要可点击跳转的锚点。
- 需要修改源码 ——本技能只产出 `.tour` JSON，**永不改源码**。
- 文件路径或行号无法逐一核验（指向错误行的导览比没有更糟）。

产物：`.tours/<persona>-<focus>.tour`，配合 [VS Code CodeTour 扩展](https://github.com/microsoft/codetour) 使用。一份好导览是**叙事**——讲给特定读者听：什么重要、为什么重要、接下来做什么。

## 步骤

1. **探查仓库**：并行执行——列根目录、读 README、看配置文件；识别语言/框架/项目用途，向下映射 1-2 层目录结构，找入口点。**导览里每条路径都必须真实存在**。源文件不足 5 个时，无论画像一律生成 quick 深度（不值得做深的）。
2. **推断意图**：一条消息即应足够，静默推断画像/深度/焦点（见下表）。意图含糊时默认 **new-joiner / standard**——最通用。
3. **读真实文件**：**每个文件路径和行号都要核验**。绝不写没读过就臆测的行号。
4. **写导览**：保存到 `.tours/<persona>-<focus>.tour`，骨架见「指令」。用 **SMIG** 公式写每步描述。
5. **校验**：逐项过校验清单（见下）。

意图 → 画像/深度映射：

| 用户说 | 画像 | 深度 |
|---|---|---|
| 「这个 PR 的导览」 | pr-reviewer | standard |
| 「为什么 X 坏了」/「RCA」 | rca-investigator | standard |
| 「新人上手」/「new joiner」 | new-joiner | standard |
| 「快速看看」/「vibe check」 | vibecoder | quick |
| 「架构」 | architect | deep |
| 「安全」/「鉴权评审」 | security-reviewer | standard |
| （无限定词） | new-joiner | standard |

步数按深度：**Quick 5-8**（vibecoder、快速探索）、**Standard 9-13**（多数画像）、**Deep 14-18**（architect、RCA）。

## 指令

`.tour` 文件骨架：

```json
{
  "$schema": "https://aka.ms/codetour-schema",
  "title": "描述性标题 — 画像 / 目标",
  "description": "写给谁、读完能理解什么。",
  "ref": "<当前分支或 commit>",
  "steps": []
}
```

步骤类型（step types）：

| 类型 | 何时用 | 示例 |
|---|---|---|
| **Content** | 仅开场/收尾（最多 2 个） | `{ "title": "欢迎", "description": "..." }` |
| **Directory** | 定位到某模块 | `{ "directory": "src/services", "title": "..." }` |
| **File + line** | 主力步骤 | `{ "file": "src/auth.ts", "line": 42, "title": "..." }` |
| **Selection** | 高亮代码块 | `{ "file": "...", "selection": {...}, "title": "..." }` |
| **Pattern** | 正则匹配（易变文件） | `{ "file": "...", "pattern": "class App", "title": "..." }` |
| **URI** | 链到 PR/issue/文档 | `{ "uri": "https://...", "title": "..." }` |

描述写法 —— **SMIG 公式**：
- **S 情境(Situation)**：读者正在看什么？
- **M 机制(Mechanism)**：这段代码怎么工作？
- **I 意义(Implication)**：对这个画像为什么重要？
- **G 陷阱(Gotcha)**：聪明人会在哪里搞错？

**叙事弧**：① 定向（首步必须锚到 file 或 directory，绝不用 content-only——在 VS Code 里会空白）→ ② 高层地图（1-3 个 directory 步展示主模块）→ ③ 核心路径（file/line 步，导览的心脏）→ ④ 收尾（读者现在**能做什么**、建议的后续）。

校验清单：
- [ ] 每个 `file` 路径相对仓库根（无前导 `/` 或 `./`）
- [ ] 每个 `file` 确认存在
- [ ] 每个 `line` 已读文件核验
- [ ] 首步有 `file` 或 `directory` 锚点
- [ ] content-only 步最多 2 个
- [ ] 若设了 `nextTour`，须与另一导览的 `title` 完全一致

## 示例

按画像确定必覆盖内容（节选）：

| 画像 | 目标 | 必覆盖 |
|---|---|---|
| **Vibecoder** | 快速找感觉 | 入口点、主模块（≤8 步） |
| **New joiner** | 结构化上手 | 目录、环境搭建、业务背景 |
| **Bug fixer** | 快速定位根因 | 触发点 → 故障点 → 测试 |
| **RCA investigator** | 为何失败 | 因果链、可观测性锚点 |
| **Feature explainer** | 端到端 | UI → API → 后端 → 存储 |
| **PR reviewer** | 正确评审 | 改动故事、不变量、风险区 |
| **Architect** | 形态与取舍 | 边界、tradeoff、扩展点 |
| **Security reviewer** | 信任边界 | 鉴权流、校验、密钥处理 |
| **Refactorer** | 安全重构 | 接缝、隐藏依赖、抽取顺序 |
| **External contributor** | 安全贡献 | 安全区、约定、雷区 |

真实参考：[coder/code-server 的 contributing.tour](https://github.com/coder/code-server/blob/main/.tours/contributing.tour)。

## 注意事项

反模式 → 修法：
- **罗列文件**（「这个文件放模型」）→ 讲故事，每步依赖上一步。
- **泛泛描述** → 点名本代码库独有的具体模式。
- **臆测行号** → 绝不写没读过核验的行。
- **quick 深度步数超标** → 真的删步，别凑。
- **臆造文件** → 不存在就跳过该步。
- **复述式收尾**（「我们讲了 X、Y、Z」）→ 告诉读者现在**能做**什么。
- **content-only 首步** → 首步必须锚到文件或目录。

硬约束：只产出 `.tour` JSON，永不改源码；路径与行号 100% 可核验。

## 互见

- related：`code-reviewer` —— 自动化 PR 评审工作流，可与 pr-reviewer 画像的导览互补。
- related：`monorepo-navigator` —— 大型仓库定向探查、依赖图分析，为导览的「探查仓库」步提供结构地图。

---
本条采编自 alirezarezvani/claude-skills（MIT）。
