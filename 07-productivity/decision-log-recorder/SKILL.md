---
name: decision-log-recorder
title: 决策日志记录（两层记忆）
description: 当需要把团队/董事会会议中已批准的决策、负责人、行动项与被否方案沉淀为可追溯的「记忆」时使用；产出仅存已批准结论的 Layer 2 决策库（append-only）+ 完整原始记录的 Layer 1，并做冲突检测与逾期行动项跟踪；不适用于个体架构决策留痕（用 adr-writer）或会议纪要转写；触发词：决策日志、approved decisions、行动项、被否方案、DO_NOT_RESURFACE、决策冲突检测
domain: 协作/knowledge
triggers: [决策日志, approved decisions, 行动项, action items, 被否方案, DO_NOT_RESURFACE, 决策冲突检测, 逾期跟踪, 两层记忆]
tags: [decision-log, memory, action-items, conflict-detection, knowledge, governance]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, markdown]
requires: []
related: [adr-writer, adr-management-patterns, meeting-transcript-analyzer, stakeholder-update-writer]
combines_with: [boardroom-deliberation, meeting-transcript-analyzer, status-report-generator]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

把多人决策会（董事会 / 战略评审 / 跨团队拍板）的产出固化成**可被未来会议安全复用的记忆**，避免「过去争论里被否的方案」或「未达成的共识」在新讨论里被当成既定事实复活。

核心机制是**两层记忆**：
- **Layer 1 原始记录** —— 存全部内容（各方发言、批判、综合、被否论点）。仅供人查证，**永不自动加载**。
- **Layer 2 已批准决策** —— 只存最终拍板者批准的决策、行动项与人工更正。**每次新会议开场自动加载这一层**；append-only，决策从不删除，只能被新决策 supersede。

为什么分两层：未经批准的辩论内容若混入下一轮，会制造「幻觉式共识」。把「记的」和「准的」物理隔离即可根治。

不该用：
- 单个技术/架构决策留痕（Context→Decision→Consequences 单文档）—— 用 `adr-writer`。
- 纯会议纪要转写、待办清单导出 —— 那是记录不是「带冲突治理的决策记忆」。
- 个人笔记 / 临时 todo。

## 步骤

落盘工作流（在拍板者批准综合结论之后执行）：

1. 拍板者批准本轮综合结论。
2. 写 Layer 1 原始记录 → `memory/meetings/YYYY-MM-DD-raw.md`。
3. 对照 `decisions.md` 做冲突检测（见下三类）。
4. 有冲突 → 浮出给拍板者裁决，**不要自行合并**。
5. 把已批准条目 append 到 `decisions.md`（绝不改写历史条目）。
6. 确认：决策已记、行动项已跟踪、被否方案已打 `DO_NOT_RESURFACE` 标记。

冲突检测三类（落盘前必查）：
1. **DO_NOT_RESURFACE 违规** —— 新决策命中了某条已被否的方案。
2. **主题矛盾** —— 同一主题存在两条结论相反的有效决策。
3. **负责人冲突** —— 同一行动在不同决策里指派给了不同人。

行动项标记完成（**不删除，历史即记录**）：

```markdown
- [x] [行动] — Owner: [姓名] — Completed: [YYYY-MM-DD] — Result: [一句话结果]
```

归档：Layer 1 满 90 天后移入 `memory/meetings/archive/YYYY/`。

## 指令

CLI 跟踪器（解析 `decisions.md`、查逾期、检冲突）：

```bash
python scripts/decision_tracker.py --demo              # 示例输出
python scripts/decision_tracker.py --summary           # 概览 + 逾期
python scripts/decision_tracker.py --overdue           # 已过截止日的行动项
python scripts/decision_tracker.py --conflicts         # 矛盾检测
python scripts/decision_tracker.py --owner "CTO"       # 按负责人过滤
python scripts/decision_tracker.py --search "pricing"  # 按关键词检索
```

文件结构约定：

```
memory/meetings/
├── decisions.md          # Layer 2：append-only，仅已批准
├── YYYY-MM-DD-raw.md     # Layer 1：每会一份完整记录
└── archive/YYYY/         # 90 天后的原始记录归档
```

## 示例

单条决策的标准格式（写入 `decisions.md`）：

```markdown
## [2026-06-02] — 定价模型切换为按席位计费

**Decision:** 自下季度起从用量计费切换为按席位订阅。
**Owner:** CRO
**Deadline:** 2026-09-01
**Review:** 2026-10-01
**Rationale:** 用量计费导致收入波动大、可预测性差；按席位更利于现金流与续约。

**User Override:** 拍板者将试点范围从全量改为 Top-20 客户先行——降低迁移风险。

**Rejected:**
- 混合计费（席位+用量叠加） — 计费系统改造成本过高，本期不做 [DO_NOT_RESURFACE]

**Action Items:**
- [ ] 改造计费系统 — Owner: CTO — Due: 2026-08-15 — Review: 2026-08-20

**Supersedes:** 2025-11-10（同主题旧决策）
**Superseded by:** [若日后被推翻，回填]
**Raw transcript:** memory/meetings/2026-06-02-raw.md
```

冲突浮出与 DO_NOT_RESURFACE 拦截（给拍板者看的提示）：

```
⚠️ 决策冲突
新：[文本]
冲突于：[日期] — [既有文本]
选项：(1) 取代旧决策  (2) 合并  (3) 交拍板者裁决
```

```
🚫 已拦截："[方案]" 已于 [日期] 被否，原因：[reason]。
重开方式：拍板者须明确说出「重开 [主题] from [日期]」。
```

## 注意事项

- **Layer 2 严格 append-only**：决策永不删除，只能被新决策 supersede；行动项完成也只勾选不删，历史即记录。
- **Layer 1 绝不自动加载**：只在拍板者明确要求查证时才读，否则未批准的辩论会污染新讨论。
- 落盘动作由「记录人 / Chief of Staff」角色完成，**不要让参与讨论的 agent 直接写 Layer 2**，否则记录与拍板的隔离失效。
- 冲突一律浮出交人裁决，工具不自动合并或自动取代。
- `DO_NOT_RESURFACE` 是硬闸：未经拍板者显式「重开」指令，被否方案不得再次进入决策。

## 互见

- related：`adr-writer` —— 单个架构决策的单文档留痕；本技能管的是「多人会议批准决策的跨会记忆与冲突治理」。
- related：`meeting-transcript-analyzer` —— 从会议转写中抽取决策点，可作为本技能 Layer 1 的上游。
- combines_with：`chief-of-staff-orchestrator` —— 由编排/路由角色在会议结束后调用本技能完成落盘与冲突检测。

本条采编自 alirezarezvani/claude-skills（MIT）。
