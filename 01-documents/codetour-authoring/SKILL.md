---
name: codetour-authoring
title: CodeTour 代码导览编写
description: 当用户要为代码库做入职引导、架构走读、PR/RCA/安全审查导览，或提出结构化「解释 X 如何工作」并想要可复用引导产物时使用；做按角色定深度、锚定真实文件与行号、按叙事弧写步骤，产出 .tours/ 下的 CodeTour .tour（JSON）文件；不适用于一次性口头解释、要散文式文档而非 .tour 产物、实现/重构任务，或无产物的宽泛代码库入职。触发词：代码导览、code tour、onboarding 导览、架构走读、PR 导览、解释这块怎么工作
domain: 文书/writing
triggers: [给代码库做代码导览/code tour, 为新人做 onboarding 引导走读, 做架构走读/架构导览, 为某个 PR 生成审查导览, RCA/故障路径走读, 安全审查（信任边界）导览, 把「解释 X 如何工作」做成可复用引导产物]
tags: [代码导览, CodeTour, onboarding, 架构走读, PR 审查, 技术文档, 代码讲解]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Glob, Grep, Write]
requires: []
related: [codetour-walkthrough-builder, code-tutorial-engineer, codebase-onboarding-doc, docs-architect]
combines_with: [codebase-onboarding-doc, docs-architect]
license: MIT
source: affaan-m/everything-claude-code
source_license: MIT
---
## 何时使用

当一段走读用「带锚点的引导序列」比「平铺摘要」更有价值时使用。产物是 `.tours/` 下的 **CodeTour** `.tour`（JSON）文件——能在 VS Code CodeTour 插件里直接打开到真实文件和行范围，而不是临时的 Markdown 笔记。

一份好导览是为**特定读者**讲的故事：他们在看什么、为什么重要、接下来该走哪条路。

典型场景：

- 新维护者/新工程师入职引导；
- 单个服务或包的架构走读；
- 锚定到变更文件的 PR 审查导览；
- 展示故障路径的 RCA（根因分析）导览；
- 围绕信任边界与关键检查的安全审查导览。

**不该用边界：**

| 与其用代码导览 | 不如 |
| --- | --- |
| 聊天里一次性解释就够 | 直接回答 |
| 用户要散文式文档而非 `.tour` 产物 | 交给 `docs-architect` / 仓库文档编辑 |
| 任务是实现或重构 | 直接做实现工作 |
| 宽泛的代码库入职、不需要 `.tour` 产物 | 交给 `codebase-onboarding-doc` |

**硬约束：只创建 `.tour` JSON 文件，本技能范围内不修改任何源代码。**

## 步骤

### 1. 探索（动笔前必做）

写任何步骤前先摸清代码形状：README 与包/应用入口、目录结构、相关配置文件；若导览聚焦 PR，则先看变更文件。**没理解代码结构前不要开始写步骤。**

### 2. 推断读者（定角色与深度）

由请求形态决定 persona 和步数：

| 请求形态 | 角色 persona | 建议深度 |
| --- | --- | --- |
| 「入职」「新成员」 | `new-joiner` | 9–13 步 |
| 「快速导览」「快速了解」 | `vibecoder` | 5–8 步 |
| 「架构」 | `architect` | 14–18 步 |
| 「导览这个 PR」 | `pr-reviewer` | 7–11 步 |
| 「为什么挂了」 | `rca-investigator` | 7–11 步 |
| 「安全审查」 | `security-reviewer` | 7–11 步 |
| 「解释这个功能怎么工作」 | `feature-explainer` | 7–11 步 |
| 「调试这条路径」 | `bug-fixer` | 7–11 步 |

### 3. 读取并验证锚点

每个文件路径和行锚点都必须真实：确认文件存在、确认行号在范围内、用 selection 时核对确切代码块；文件易变时优先用 `pattern` 锚点。**绝不猜测行号。**

### 4. 写 `.tour`

路径保持确定、可读：

```text
.tours/<persona>-<focus>.tour
```

### 5. 验证（收尾前）

- 每个引用路径都存在；
- 每个行号/选区都有效；
- 第一步锚定到真实文件或目录（**不能是纯内容步骤**）；
- 导览讲的是一条连贯路径，而非文件清单。

## 指令

### 步骤类型（`steps[]`）

- **内容（content）**——谨慎使用，通常只用于收尾步。第一步不可为纯内容。
  ```json
  { "title": "Next Steps", "description": "You can now trace the request path end to end." }
  ```
- **目录（directory）**——给读者定位某个模块：
  ```json
  { "directory": "src/services", "title": "Service Layer", "description": "The core orchestration logic lives here." }
  ```
- **文件 + 行（file + line）**——默认步骤类型：
  ```json
  { "file": "src/auth/middleware.ts", "line": 42, "title": "Auth Gate", "description": "Every protected request passes here first." }
  ```
- **选区（selection）**——当某代码块比整文件更关键：
  ```json
  { "file": "src/core/pipeline.ts", "selection": { "start": { "line": 15, "character": 0 }, "end": { "line": 34, "character": 0 } }, "title": "Request Pipeline" }
  ```
- **模式（pattern）**——当精确行号可能漂移：
  ```json
  { "file": "src/app.ts", "pattern": "export default class App", "title": "Application Entry" }
  ```
- **URI**——指向 PR / issue / 文档：
  ```json
  { "uri": "https://github.com/org/repo/pull/456", "title": "The PR" }
  ```

### 写描述的规则：SMIG

每条 `description` 应回答四点，并保持简洁、具体、贴合真实代码：

- **Situation 情境**：读者在看什么；
- **Mechanism 机制**：它如何工作；
- **Implication 影响**：为什么对这个角色重要；
- **Gotcha 陷阱**：聪明的读者可能会忽略什么。

### 叙事弧（除非任务另有需要）

1. 定位 → 2. 模块地图 → 3. 核心执行路径 → 4. 边缘情况/陷阱 → 5. 收尾/下一步。导览应像一条路径，而非一份清单。

### 反模式与修复

| 反模式 | 修复 |
| --- | --- |
| 平铺的文件列表 | 让步骤间有依赖、讲成故事 |
| 通用空泛描述 | 指明具体代码路径或模式 |
| 猜测的锚点 | 先逐个验证文件与行 |
| 快速导览步骤过多 | 果断精简 |
| 第一步是纯内容 | 第一步锚定到真实文件/目录 |
| 角色错配 | 为真实读者而非「通用工程师」写 |

## 示例

一份最小可用的 `.tour`（payments 服务请求路径走读）：

```json
{
  "$schema": "https://aka.ms/codetour-schema",
  "title": "API Service Tour",
  "description": "Walkthrough of the request path for the payments service.",
  "ref": "main",
  "steps": [
    { "directory": "src", "title": "Source Root", "description": "All runtime code for the service starts here." },
    { "file": "src/server.ts", "line": 12, "title": "Entry Point", "description": "The server boots here and wires middleware before any route is reached." },
    { "file": "src/routes/payments.ts", "line": 8, "title": "Payment Routes", "description": "Every payments request enters through this router before hitting service logic." },
    { "title": "Next Steps", "description": "You can now follow any payment request end to end with the main anchors in place." }
  ]
}
```

## 注意事项

- **只产出 `.tour`，不碰源码**——本技能不实现、不重构、不改业务文件。
- **步数与规模匹配**：步数随仓库大小与角色深度成比例；用 directory 步做定位、file 步做实质内容。
- **PR 导览先覆盖变更文件**；**单体仓库（monorepo）只圈相关包**，不要导览全部。
- **收尾讲「读者现在能做什么」**，而不是复述刚才看了啥。
- 行号易漂移的文件优先用 `pattern`；用 `line`/`selection` 时务必先核对，绝不臆造行号。
- 缺关键输入（导览主题/焦点、目标读者、是否锚定某 PR）时先停下澄清。

## 互见

- related：`docs-architect` —— 需要散文式架构叙事/设计决策（讲「为什么」）而非可点击导览产物时改用它。
- related：`readme-doc-writer` —— 项目级 README/快速上手与导览的「定位」步骤互补。
- related：`code-tutorial-engineer` —— 要「教人动手做」的循序渐进教程，而非「带读已有代码」时改用它。
- combines_with：`codebase-onboarding-doc` —— 宽泛入职文档 + 一份引导式 `.tour`，覆盖「读文档」与「跟着走读」两种上手方式。

---
采编自 affaan-m/everything-claude-code（MIT），适配重写，非逐字翻译。
