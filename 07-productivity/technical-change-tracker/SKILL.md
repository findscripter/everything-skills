---
name: technical-change-tracker
title: 技术变更记录与会话交接追踪
description: 当需要为代码变更建立结构化审计记录、在 AI 会话过期前后做工作交接、或回顾追踪某变更状态时使用；用 JSON 记录 + 状态机 + 交接块在 docs/TC/ 下追踪每个变更的来龙去脉与下一步；不适用于仅从 git 历史生成 changelog、纯技术债清单、或排版/拼写等不影响行为的琐碎改动；触发词：追踪变更、track change、变更记录、会话交接、handoff、resume 续接、tc init/create/update、状态机、审计追踪
domain: 协作/automation
triggers: [追踪变更, track change, 变更记录, 会话交接, handoff, resume 续接, tc init/create/update, 状态机, 审计追踪]
tags: [change-tracking, session-handoff, audit-trail, state-machine, json, automation, collaboration]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python3, tc_init.py, tc_create.py, tc_update.py, tc_status.py, tc_validator.py, JSON]
requires: []
related: [changelog-generator, oncall-handoff-writer, git-advanced-workflows, adr-writer]
combines_with: [oncall-handoff-writer, changelog-generator, postmortem-writer]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
技术变更（TC）是一条结构化记录，捕获某次代码改动的 what / why / who / when / 如何测试 / 当前进展到哪一步。记录以 JSON 形式存放在目标项目的 `docs/TC/` 下，受严格 schema 与状态机校验。核心价值是：让一个全新的 AI 会话能在读取记录后 5 分钟内无缝续接前一会话的工作。

## 何时使用

适用：
- 用户要求"追踪这次变更"或为代码改动建立审计轨迹。
- 需要把进行中的工作交接给未来的 AI 会话（会话即将过期、跨天续接）。
- 需要比 commit message 更结构化的发布说明。
- 接手已有项目，想补做追溯性的变更文档。
- 出现 `/tc init`、`/tc create`、`/tc update`、`/tc status`、`/tc resume`、`/tc close` 等意图。

不该用（负边界）：
- 只想从 git 历史生成 changelog —— 用 changelog 类工具。
- 只想维护长期技术债清单 —— 用技术债追踪工具。
- 改动琐碎（拼写、格式）且不影响行为 —— 直接改即可，不必建 TC。

## 步骤

1. 初始化：在项目根创建 `docs/TC/` 目录骨架（幂等，重复运行只报告现状）。
2. 创建 TC：生成下一个顺序 ID，写入 status=`planned` 的记录，更新登记表（registry）。
3. 推进：通过状态机迁移 status、登记受影响文件、追加交接信息；每次变更都新增一条 `R<n>` 修订条目并原子落盘。
4. 查看：单条或全量（registry 汇总）查看状态。
5. 续接（resume）：读取交接块展示给用户 → 归档上一会话进 `session_history` → 开新会话 → 追加一条"会话已由 <平台/模型> 续接"的修订 → 按 `next_steps` 顺序推进。
6. 关闭/校验：迁移到 `deployed` 并设置审批；用 validator 校验 schema、状态机合法性、ID 顺序与审批一致性。

### 存储布局与 ID 约定

```
docs/TC/
├── tc_config.json      # 项目设置
├── tc_registry.json    # 主索引 + 统计
├── records/TC-001-04-05-26-user-auth/tc_record.json  # 单一事实来源
└── evidence/TC-001/    # 日志片段、命令输出、截图
```

- 父 TC：`TC-NNN-MM-DD-YY-功能slug`（如 `TC-001-04-05-26-user-authentication`），NNN 顺序递增，日期为创建日，slug 用 kebab-case。
- 子 TC：`TC-NNN.A` 或 `TC-NNN.A.1`（字母=修订，数字=子修订）。

### 状态机（迁移表）

| 从 | 允许迁移到 |
|----|-----------|
| `planned` | `in_progress`、`blocked` |
| `in_progress` | `blocked`、`implemented` |
| `blocked` | `in_progress`、`planned` |
| `implemented` | `tested`、`in_progress` |
| `tested` | `deployed`、`in_progress` |
| `deployed` | `in_progress`（返工 / 热修） |

同状态迁移是 no-op，恒允许；其余一律报错。前进门槛：`blocked` 需 `handoff.blockers` 至少一条；`tested` 需至少一个 `test_case` 为 pass（或显式 skip 并说明理由）；`deployed` 需 `approval.approved=true` 且同时有 `approved_by` 与 `approved_date`。

### 会话交接块（最关键字段）

位于每条 TC 的 `session_context.handoff`，是 AI 续接的核心：
- `progress_summary`：1-3 句、过去时、具体（写清做了什么，而非"在搞 auth"）。
- `next_steps`：有序、祈使句、每步 5-15 分钟可完成、可度量（如"为无效 token 加 401 集成测试"）。
- `blockers`：此刻真正阻塞的事；为空则 status 不应是 `blocked`。
- `key_context`：本会话踩坑/做决策才发现的、下个会话必须知道的约束（如"legacy_auth 正在淘汰，勿扩展，新代码入 src/auth/"）。
- `files_in_progress`：`{path, state, notes}`，state ∈ `editing|needs_review|partially_done|ready`。
- `decisions_made`：`{decision, rationale, timestamp(ISO8601)}`，重大决策应同步到项目级决策日志。

质量标准：一个无其它上下文的全新会话，读完记录后 5 分钟内能接手并取得进展。若它还要问"我刚才在干嘛""这段代码干啥的"，说明上次交接失败。

## 指令

所有脚本仅依赖标准库、可确定性执行，均支持 `--help` 与 `--json`。

```bash
# 1. 初始化追踪
python3 scripts/tc_init.py --project "My Project" --root .

# 2. 创建 TC
python3 scripts/tc_create.py --root . \
  --name "user-authentication" \
  --title "Add JWT-based user authentication" \
  --scope feature --priority high \
  --summary "Adds JWT login + middleware" \
  --motivation "Required for protected endpoints"

# 3a. 状态迁移（按状态机校验）
python3 scripts/tc_update.py --root . --tc-id TC-001-04-05-26-user-auth \
  --set-status in_progress --reason "Starting implementation"
# 3b. 登记文件
python3 scripts/tc_update.py --root . --tc-id TC-001-04-05-26-user-auth \
  --add-file src/auth.py:created
# 3c. 追加交接信息
python3 scripts/tc_update.py --root . --tc-id TC-001-04-05-26-user-auth \
  --handoff-progress "JWT middleware wired up" \
  --handoff-next "Write integration tests" \
  --handoff-next "Update README"

# 4. 查看状态
python3 scripts/tc_status.py --root . --tc-id TC-001-04-05-26-user-auth
python3 scripts/tc_status.py --root . --all --json

# 5. 校验记录 / 登记表
python3 scripts/tc_validator.py --record docs/TC/records/TC-001-.../tc_record.json
python3 scripts/tc_validator.py --registry docs/TC/tc_registry.json
```

`/tc` slash 命令是用户界面，Python 脚本是引擎：`/tc init|create <name>|update <tc-id>|status [tc-id]|resume <tc-id>|close <tc-id>|export|dashboard`。

## 示例

非阻塞记账（推荐工作流）：主流程不得被 TC 记账打断。

> 别为更新 TC 内联停下来 —— 继续写代码。在自然里程碑（功能完成、测试通过、收工前）派生一个后台子代理去更新记录，例如下达："读取 `docs/TC/records/<TC-ID>/tc_record.json`，把 handoff 的 progress_summary 设为 '...'，新增 next_step '...'，新增 blocker '...'；用 `tc_update.py` 以便追加修订历史，然后更新 last_active 并原子落盘。"

续接已存在的工作：
1. 读 `tc_registry.json`，找出 status 为 `in_progress` 或 `blocked` 的 TC。
2. 读对应 `tc_record.json`，把交接块展示给用户，问"续接 <TC-ID>？(y/n)"。
3. 是 → 归档旧 `current_session` 进 `session_history`（带 ended 时间戳和小结）→ 新建 `current_session` → 追加修订 → 按 `next_steps` 顺序推进。

返工 deployed TC 的恢复流：打开该 TC → `deployed -> in_progress` → 加一条概述返工的修订 → 再走 `implemented -> tested -> deployed`。

## 注意事项

恒定校验规则：
1. 状态机：只允许合法迁移。
2. 顺序 ID：`revision_history` 用 R1/R2/R3…，`test_cases` 用 T1/T2/T3…。
3. 追加式历史：修订条目永不修改或删除。
4. 审批一致性：`approved=true` 必须同时有 `approved_by` 和 `approved_date`。
5. ID 格式：父 `TC-NNN-MM-DD-YY-slug`，子 `TC-NNN.A` / `TC-NNN.A.N`。
6. 原子写：先写 `.tmp` 再 rename。
7. 登记表统计每次写入都重算。

反模式（务必避免）：
- 改 `revision_history` 去"修正"拼写 → 应新增一条修订来更正。
- 跳过状态机直接设 `deployed` → 应逐级走 `in_progress -> implemented -> tested -> deployed`。
- 每改一个文件就建一个 TC → 一个逻辑单元（功能/修复/重构）一个 TC。
- 每次编辑都内联更新 TC → 在里程碑派后台子代理更新。
- 用 `cancelled`：没有此状态。放弃的工作 → 加一条"Cancelled — 原因…"修订 → 移到 `blocked` → 打 `[CANCELLED]` 标签 → 保留记录，绝不删除。
- 删除后复用 TG ID → 只能向前递增，绝不回收。
- 让 `next_steps` 过期、把决策/阻塞塞进 `notes` 而非对应字段、用文本编辑器直接覆写 `tc_record.json`、把密钥写进 notes 或 evidence（记录会进仓库，应引用环境变量或外部密钥库）。

本条采编自 alirezarezvani/claude-skills（MIT）。
