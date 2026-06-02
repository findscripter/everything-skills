---
name: adr-auto-capture
title: 架构决策实时捕获为 ADR
description: 当编码/规划会话中出现架构决策瞬间（选型、取舍拍板、"我们选了 X 而非 Y"）时使用；自动识别决策信号、提议并在用户确认后落盘结构化 ADR（含 Context/Decision/Alternatives/Consequences），维护编号与索引；不适用于命名/格式等琐碎决策，也不擅自创建文件；触发词：记录这个决策、创建 ADR、为什么选 X、决策捕获
domain: 研发/architecture
triggers: [记录这个决策, 把这个记成 ADR, 创建一个 ADR, 为什么选了 X 而不是 Y, 我们决定用 X, 架构决策捕获, 决策瞬间检测, 读已有 ADR]
tags: [architecture, adr, decision-record, auto-capture, 决策捕获, 技术选型]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Markdown, Git/PR]
requires: []
related: [adr-management-patterns, adr-writer, technical-change-tracker, codetour-walkthrough-builder]
combines_with: [spec-driven-workflow, brooks-design-lint]
license: MIT
source: affaan-m/everything-claude-code
source_license: MIT
---
# 架构决策实时捕获为 ADR

在编码/规划会话过程中，实时识别"架构决策瞬间"，并把它就地沉淀为结构化 ADR 文档——让决策不再只活在 Slack 串、PR 评论或某个人的记忆里，而是与代码并存、可追溯。

## 何时使用

出现以下任一情形时，提议或捕获 ADR：

- 用户明说"记录这个决策""把它记成 ADR"。
- 在重要候选项之间拍板：框架、库、模式、数据库、API 设计。
- 用户说"我们决定用 X""选 X 而不是 Y 是因为……"。
- 用户追问"为什么选了 X"——此时是**读**已有 ADR，而非新建。
- 规划阶段权衡架构取舍。

**不该用（负边界）**：

- 琐碎决策：变量命名、代码格式、小补丁、配置项调整——不值得 ADR。
- 不擅自建文件：暗含信号只能**提议**记录，未经用户明确同意不创建任何文件。
- 不写长篇大论：ADR 应能 2 分钟读完，Context 超过 10 行就过长。
- 不替代评审：ADR 不是测试、环境验证或专家评审的替身。

## 步骤

### A. 捕获新 ADR（检测到决策瞬间时）

1. **初始化（仅首次）**——若 `docs/adr/` 不存在，征得用户同意后创建：目录、带索引表头的 `README.md`、供手动使用的空白 `template.md`。无明确同意不建文件。
2. **提炼决策**——抽出正在做的核心架构选择。
3. **收集上下文**——是什么问题/约束催生了它？
4. **记录备选方案**——还考虑过哪些？为何被否（写明 Why not）？
5. **陈述后果**——取舍是什么？什么变简单、什么变难？
6. **分配编号**——扫描 `docs/adr/` 已有 ADR 递增。
7. **确认后写入**——先把草稿 ADR 呈给用户评审；仅在**明确批准**后写入 `docs/adr/NNNN-decision-title.md`；用户拒绝则丢弃草稿、不落盘。
8. **更新索引**——追加到 `docs/adr/README.md`。

### B. 读已有 ADR（用户问"为什么选了 X"时）

1. 检查 `docs/adr/` 是否存在——不存在则回应"本项目暂无 ADR，要现在开始记录架构决策吗？"
2. 存在则扫描 `docs/adr/README.md` 索引找相关条目。
3. 读匹配的 ADR 文件，展示 Context 与 Decision 段。
4. 没找到匹配则回应"没找到该决策的 ADR，现在记录一条吗？"

## 指令

**决策检测信号**——在对话中留意：

- 显式信号：「就用 X 吧」「应该用 X 而不是 Y」「取舍值得，因为……」「把这个记成 ADR」。
- 隐式信号（**提议**记录，不自动建）：对比两个框架/库并得出结论、带理由地敲定库表 schema、在架构模式间选择（单体 vs 微服务、REST vs GraphQL）、确定认证/授权策略、评估后选定部署基础设施。

**好 ADR 的准则**：

- 该做：写具体（"用 Prisma ORM"而非"用 ORM"）；记录理由（理由最重要）；保留被否方案；诚实写后果；保持简短（2 分钟可读）；用现在时（"我们使用 X"）。
- 别做：记琐碎决策；写成长文（Context >10 行即过长）；省略备选方案（"就这么选了"不是理由）；无标注地补录（补录旧决策须注明原始日期）；让 ADR 过期（被取代的决策要链接到取代它的 ADR）。

**生命周期**：`proposed → accepted → [deprecated | superseded by ADR-NNNN]`

- proposed：考虑中、尚未提交；accepted：生效且被遵循；deprecated：不再相关（如功能被删）；superseded：被新 ADR 取代（务必链接取代关系）。

**值得记录的决策类别**：技术选型（框架/语言/数据库/云）、架构模式（单体 vs 微服务、事件驱动、CQRS）、API 设计（REST vs GraphQL、版本化、auth 机制）、数据建模（schema 设计、范式取舍、缓存策略）、基础设施（部署模型、CI/CD、监控栈）、安全（auth 策略、加密、密钥管理）、测试（框架、覆盖目标、E2E vs 集成的平衡）、流程（分支策略、评审流程、发布节奏）。

## 示例

ADR 文档格式（基于 Michael Nygard 格式，为 AI 辅助开发调整）：

```markdown
# ADR-NNNN: [决策标题]

**Date**: YYYY-MM-DD
**Status**: proposed | accepted | deprecated | superseded by ADR-NNNN
**Deciders**: [相关人]

## Context
是什么问题或处境促成了这次决策/变更？
[2~5 句说明现状、约束与作用力]

## Decision
我们要做/已做的变更是什么？
[1~3 句清晰陈述决策]

## Alternatives Considered（考虑过的备选）
### Alternative 1: [名称]
- **Pros**: [优点]
- **Cons**: [缺点]
- **Why not**: [被否的具体原因]

## Consequences（后果）
### Positive
- [收益]
### Negative
- [取舍]
### Risks
- [风险与缓解]
```

目录结构：

```
docs/
└── adr/
    ├── README.md              ← 所有 ADR 的索引
    ├── 0001-use-nextjs.md
    ├── 0002-postgres-over-mongo.md
    ├── 0003-rest-over-graphql.md
    └── template.md            ← 手动使用的空白模板
```

索引表（README.md）：

```markdown
# Architecture Decision Records

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [0001](0001-use-nextjs.md) | Use Next.js as frontend framework | accepted | 2026-01-15 |
| [0002](0002-postgres-over-mongo.md) | PostgreSQL over MongoDB for primary datastore | accepted | 2026-01-20 |
| [0003](0003-rest-over-graphql.md) | REST API over GraphQL | accepted | 2026-02-01 |
```

## 注意事项

- **同意门槛**：写盘是不可逆动作。检测到决策只是触发"提议"，必须先展示草稿、获得明确批准再写文件；用户拒绝即丢弃。
- **隐式信号只提议不自动建**：避免在用户没拍板时污染 `docs/adr/`。
- **编号防冲突**：写入前重新扫描目录取最大编号 +1，避免并发会话撞号。
- **状态保鲜**：被取代的 ADR 必须 `superseded by ADR-NNNN` 并双向链接，不要原地改已 accepted 的内容。
- **与其它技能协同**：规划类 Agent 提出架构变更时，建议同步建 ADR；代码评审类 Agent 应对"引入架构变更却无对应 ADR"的 PR 打标。

## 互见

- related：`adr-management-patterns` —— ADR 文档模板/格式与编号、索引维护的体系化模式（本技能侧重"实时捕获"，那条侧重"写法与治理"）
- combines_with：`code-reviewer` —— 评审 PR 时对缺失 ADR 的架构变更打标
- combines_with：`tech-stack-evaluator` —— 选型评估的结论直接沉淀为一条 ADR

---
采编自 affaan-m/everything-claude-code（MIT 许可证）。
