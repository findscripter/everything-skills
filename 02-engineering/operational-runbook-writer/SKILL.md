---
name: operational-runbook-writer
title: 运维操作手册编写
description: 当需要把重复性运维/值班任务的"部落知识"沉淀为可重复执行的操作手册（runbook），或给现有流程补充排错、回滚、升级路径时使用；做产出含目的、前置条件、逐步精确命令、验证、排错表、回滚与升级表的 Markdown runbook；不适用于一次性事故的实时止损指挥（用事故指挥框架）或事后无指责复盘（用复盘报告撰写）。触发词：runbook、操作手册、运维手册、值班手册、SOP、排错、回滚、升级路径、on-call、playbook
domain: 研发/devops
triggers: [runbook, 操作手册, 运维手册, 值班手册, SOP, 排错手册, 回滚步骤, 升级路径, on-call, playbook, 重复性运维任务]
tags: [研发, operations, runbook, SOP, on-call, ops, 排错, 回滚]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [postmortem-writer, oncall-handoff-writer, pre-deploy-checklist, sre-incident-responder]
combines_with: [devops-troubleshooter, incident-commander-framework, observability-strategy-designer]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
## 何时使用

把"只有某个人会做"的重复性运维任务（部署、数据同步、证书轮换、备份恢复、值班巡检等）写成任何人都能照做的精确手册时使用。典型场景：

- 将口口相传的部落知识固化为可重复执行的逐步命令；
- 给已有流程补充失败处理、排错、回滚步骤；
- 编写"出事时找谁、怎么找"的升级（escalation）路径。

不该用的边界：

- 一次性线上事故的**实时止损与指挥** —— 用「事故指挥与响应框架」，本手册是出事前就备好的剧本，不做现场调度。
- 事故结束后的**无指责复盘** —— 用「无指责复盘报告撰写」，那是回顾根因，不是操作步骤。
- 只跑一次、不会重复的临时操作 —— 不值得写 runbook。

## 步骤 / 指令

1. 确定任务边界与元信息：负责人（Owner）、执行频率（每日/每周/每月/按需）、上次更新与上次执行日期。
2. 写**目的**：这份手册完成什么、何时该用它。
3. 列**前置条件**，做成勾选清单：需要的访问权限、依赖的工具/系统、所需的输入数据。
4. 拆**步骤**，每步必须三件套：① 用代码块给出**可直接复制的精确命令/动作**；② "预期结果"；③ "失败时怎么办"。
5. 写**验证**清单：怎么确认任务真的成功了、要检查哪些信号。
6. 做**排错表**（症状 | 可能原因 | 修复）覆盖各步骤的常见失败模式。
7. 写**回滚**：出问题时如何撤销，恢复到操作前状态。
8. 写**升级路径**表（何时升级 | 找谁 | 联系方式）。
9. 留**变更历史**表（日期 | 执行人 | 备注/异常）。
10. **实测手册**：找一个不熟悉该流程的人照着走一遍，在他卡住的地方补全。

若接入知识库：先搜是否已有同名 runbook，优先更新而非新建；定稿后发布到 ops wiki。若接入 ITSM：把 runbook 关联到相关事件类型/变更单，从值班排班自动填充升级联系人。

## 示例

完整 runbook 骨架（Markdown）：

```markdown
## Runbook: [任务名]
**Owner:** [团队/人] | **Frequency:** [每日/每周/每月/按需]
**Last Updated:** [日期] | **Last Run:** [日期]

### 目的
[这份手册完成什么、何时使用]

### 前置条件
- [ ] [所需访问/权限]
- [ ] [依赖的工具/系统]
- [ ] [所需输入数据]

### 操作步骤
#### Step 1: [名称]
\`\`\`
[精确命令或动作]
\`\`\`
**预期结果：** [应当发生什么]
**失败时：** [怎么处理]

### 验证
- [ ] [如何确认任务成功完成]
- [ ] [需检查什么]

### 排错
| 症状 | 可能原因 | 修复 |
|------|---------|------|
| [你看到的现象] | [为什么] | [怎么做] |

### 回滚
[出问题时如何撤销]

### 升级路径
| 情况 | 联系人 | 方式 |
|------|--------|------|
| [何时升级] | [谁] | [如何联系] |

### 历史
| 日期 | 执行人 | 备注 |
|------|--------|------|
| [日期] | [人] | [任何问题或观察] |
```

"精确到能照抄"的反例与正例：

```text
反例：运行那个脚本。
正例：在 ops 服务器上执行 `python sync.py --prod --dry-run`，确认无误后去掉 --dry-run 再跑一次。
```

## 注意事项

- **痛苦地具体**："运行脚本"不是一个步骤，要给出确切命令、在哪台机器、带什么参数。
- **写清失败模式**：每一步都要交代会出什么错、出错怎么办，否则手册在真出事时没用。
- **务必实测**：让没做过的人照走，卡住即补；未经实走的 runbook 不算完成。
- 保持元信息（Last Updated / Last Run / Owner）随每次执行更新，过期手册比没有更危险。
- 危险操作（删除、回滚、prod 写入）默认先 dry-run，并在步骤里显式标注。

## 互见

- requires：无。
- related：`postmortem-writer` —— 复盘里发现的改进项常落成新的 runbook 步骤。
- combines_with：`incident-commander-framework` —— 事故指挥时调用现成 runbook 执行检测/止损/恢复；`sre-incident-responder`、`devops-troubleshooter` —— 排错与值班响应中直接套用本手册。

---

本条采编自 anthropics/knowledge-work-plugins（Apache-2.0）。
