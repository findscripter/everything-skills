---
name: wiki-yylo
title: YYLO Ledger 项目知识库（wiki Record）
description: 当编码智能体需要沉淀或检索可长期复用的项目知识时使用；驱动 yy ledger 完成先搜索后创建、按 Wiki/Task/Workflow/Artifact 分类判别与带版本校验的安全更新，产出不可变 Record ID 与回执；不适用于任务状态、生成物证据或机密存储；触发词：wiki、知识库、项目知识、Record、yy ledger
domain: 协作/knowledge
triggers: [项目知识库检索, 先搜索后创建, wiki Record 创建与更新, 分类判别 Wiki Task Workflow Artifact, 带版本校验的安全更新, 不可变 Record ID, revision 与回执, yy ledger wiki 命令, 知识沉淀不进机密]
tags: [知识管理, wiki, 文档, Record, 版本控制, 编码智能体, yylo, cli]
level: 进阶
status: stable
agents: [claude-code, codex]
tools: [yy]
requires: []
related: [ledger-tasks-yylo, adr-writer, decision-log-recorder]
combines_with: [agent-memory-systems, codebase-onboarding-doc]
license: MIT
source: yylo-dev/yylo-skills
source_license: MIT
---

# YYLO Ledger 项目知识库（wiki Record）

采编自 yylo-dev/yylo-skills（MIT），由 YYLO 团队自荐并适配为本库格式。

## 何时使用

当智能体要把项目知识放进比对话上下文更可靠、可被后续工作发现的载体时使用：

- 沉淀或检索可长期复用的项目/领域知识（wiki Record）。
- 写入前先判别信息归属：Wiki（持久知识）/ Task（范围化工作）/ Workflow（已验证步骤）/ Artifact（生成证据）/ 源码文档。
- **不该用**：任务状态与验收记录、 bulky 生成物证据、机密、缓存、会话转录、临时状态。

## 步骤 / 指令

1. **预检**：`yy ledger wiki --help`（命令 help 为当前运行时的权威说明）；无原生 wiki 命令时禁止绕过直改存储，应要求 Ledger 升级。
2. **先搜索后创建**：无 ID 时先用有界 summary 检索，避免重复沉淀：
   `yy ledger wiki search --text "deployment policy" --projection summary --limit 20 -f json`
3. **精确读取**：`yy ledger get RECORD_ID -f json`（跨类型通用 get，含热/冷 Record）；`yy ledger wiki get RECORD_ID --raw`。漏字段时读 omission 原因，不要当作空页；需要字节时 `--content --max-content-bytes N`。
4. **创建**：大段或含 shell 敏感内容走文件/stdin：
   `yy ledger wiki create --title "Service ownership" --file ownership.md`
   `yy ledger wiki create --title "Incident notes" --file - < incident-notes.md`
5. **安全更新（compare-and-replace）**：先读当前 Record 与 revision → 带期望 revision 与要求的 preimage/digest 证据执行 `wiki update` → 回读结果 revision 与回执。revision/preimage 不匹配说明源已变更：重读并对账，绝不强行覆盖并发编辑。
6. **历史与生命周期**：`yy ledger wiki history RECORD_ID` 理解修订链；归档是生命周期迁移而非删除。
7. **结果上报**：上报 Record kind/profile、真实不可变 ID 与真实 slug（来自返回 Record 或原生 get 回读），绝不凭标题编造 slug。

## 示例

```
yy ledger wiki search --text "deployment policy" --projection summary --limit 20 -f json
yy ledger get doc_ab12cd34 -f json
yy ledger wiki create --title "Service ownership" --file ownership.md
yy ledger wiki update --help   # 按安装版本的 compare-and-replace 控件回读后执行
yy ledger wiki history doc_ab12cd34
```

## 注意事项

- Ledger 是唯一事实源：绝不手改 Ledger 存储文件或绕过控制器路由。
- 一个 Record 一个主题；关联用不可变 Record ID 互相链接，不复制事实。
- slug/alias 只是发现便利，不是身份；ID 才是关系与生命周期操作的权威。
- 机密、运维属主回执、bulky 生成物不进 wiki（走 Artifact/Task 各自通道）。

## 互见

- requires：无硬前置。
- related：`ledger-tasks-yylo`（同一 yy ledger 家族的任务看板技能，任务状态走它而非 wiki）、`adr-writer`（架构决策记录是 wiki 知识的典型条目形态）、`decision-log-recorder`（决策日志的两层记忆结构）。
- combines_with：`agent-memory-systems`（智能体记忆体系设计，wiki Record 充当持久层）、`codebase-onboarding-doc`（代码库上手文档可沉淀为 wiki Record 供后续发现）。
