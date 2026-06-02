---
name: google-workspace-cli-admin
title: Google Workspace CLI 管理自动化
description: 当用 gws CLI 管理 Google Workspace（Gmail/Drive/Sheets/Calendar 等）并做批量自动化、安全审计或角色化配方时使用；做安装鉴权、服务命令编排、JSON 输出过滤与审计修复产物；不适用于飞书/Lark 或非 Google 套件、无 GCP 项目环境。触发词：gws、Google Workspace、Gmail 自动化
domain: 平台/cli
triggers: [gws CLI, Google Workspace 管理, Gmail 自动化, Drive/Sheets 批量操作, Calendar 排期与空闲时段, Workspace 安全审计, OAuth/服务账号鉴权, standup-report 配方, persona 角色包]
tags: [google-workspace, gws-cli, gmail, drive, sheets, calendar, 安全审计, 自动化, oauth, service-account, 平台/cli]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [gws, python3, scripts/gws_doctor.py, scripts/auth_setup_guide.py, scripts/workspace_audit.py, scripts/output_analyzer.py, scripts/gws_recipe_runner.py]
requires: []
related: [ms365-tenant-admin, ai-native-cli-design, atlassian-admin]
combines_with: [ms365-tenant-admin, ai-native-cli-design]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

- 需要通过开源 `gws` CLI 管理 Google Workspace：Gmail、Drive、Sheets、Calendar、Docs、Chat、Tasks 等 18+ 服务 API。
- 要做批量/可脚本化操作（搜索归档邮件、批量分享文件、批量改权限），并用 JSON 管道做过滤聚合。
- 要跑安全审计（外部分享、自动转发、DMARC/SPF/DKIM、超管数量、两步验证）并生成修复命令。
- 要用内置 43 个 recipe 或 10 个 persona 角色包按岗位编排多步流程（如 standup-report、meeting-prep）。

不该用：

- 目标是飞书/Lark 或微软 365、非 Google 套件 —— 改用对应 lark-* skill 或其它工具。
- 没有 Google Cloud 项目 / 无法完成 OAuth 或服务账号配置的环境（必须先建 GCP 项目）。
- 需要 Workspace 管理员权限才能跑的审计项，而当前账号无 Admin 角色时（仅能跑只读子集）。

## 步骤

1. 预检：`python3 scripts/gws_doctor.py` 检查 PATH、版本、鉴权状态与服务连通性。
2. 安装（任选）：`npm install -g @anthropic/gws`、`cargo install gws-cli`，或下载预编译二进制。
3. 鉴权：交互式 OAuth 走 `gws auth setup` 后 `gws auth status --json`；无头/CI 场景用服务账号（见指令）。
4. 执行服务命令：所有命令形如 `gws <service> <resource>.<action> ...`，加 `--json` 输出。
5. 处理输出：把 `--json` 管道给 `output_analyzer.py` 做 `--count`/`--select`/`--filter`/`--format table`。
6. 大流程优先用 recipe / persona，而非手工链接原子命令；破坏性批量操作前先 `--dry-run`。

## 指令

鉴权与环境（服务账号/CI）：

```bash
python3 scripts/auth_setup_guide.py --guide service-account
export GWS_SERVICE_ACCOUNT_KEY=/path/to/key.json
export GWS_DELEGATED_USER=admin@company.com
gws auth status
```

关键环境变量：`GWS_CLIENT_ID` / `GWS_CLIENT_SECRET` / `GWS_TOKEN_PATH` / `GWS_SERVICE_ACCOUNT_KEY` / `GWS_DELEGATED_USER` / `GWS_DEFAULT_FORMAT`（json|ndjson|table）。生成 .env 模板：`python3 scripts/auth_setup_guide.py --generate-env`；查询服务所需 scope：`python3 scripts/auth_setup_guide.py --scopes gmail,drive,calendar,sheets`。

Python 工具一览（均仅依赖标准库、支持 `--json` 与 demo 模式）：

| 脚本 | 用途 |
|------|------|
| `gws_doctor.py` | 预检诊断 |
| `auth_setup_guide.py` | 引导式鉴权配置 |
| `gws_recipe_runner.py` | recipe 目录与执行（`--list [--persona pm]`） |
| `workspace_audit.py` | 安全/配置审计 |
| `output_analyzer.py` | JSON/NDJSON 过滤聚合 |

## 示例

Gmail 发件与批量归档：

```bash
gws gmail users.messages send me --to "team@company.com" \
  --subject "Weekly Update" --body "本周小结..."

# 归档 30 天前已读邮件
gws gmail users.messages list me --query "is:read older_than:30d" --json \
  | python3 scripts/output_analyzer.py --select "id" --format json \
  | xargs -I {} gws gmail users.messages modify me {} --removeLabelIds INBOX
```

Drive 分享与 Sheets 写入：

```bash
gws drive permissions create <FILE_ID> \
  --type user --role writer --emailAddress "colleague@company.com"

gws sheets spreadsheets.values update <SHEET_ID> --range "Sheet1!A1" \
  --values '[["Name","Score"],["Alice",95],["Bob",87]]'
```

Calendar 排期 / 查空闲 / 日报：

```bash
gws calendar events insert primary --summary "Sprint Planning" \
  --start "2026-03-15T10:00:00" --end "2026-03-15T11:00:00" \
  --attendees "team@company.com"

gws helpers find-time --attendees "alice@co.com,bob@co.com" \
  --duration 60 --within "2026-03-15,2026-03-19" --json

gws recipes standup-report --json | python3 scripts/output_analyzer.py --format table
```

安全审计与修复：

```bash
python3 scripts/workspace_audit.py --json \
  | python3 scripts/output_analyzer.py --filter "status=FAIL" \
    --select "area,check,remediation"
# 无 gws 环境可演示：python3 scripts/workspace_audit.py --demo
```

## 注意事项

- OAuth token 1 小时过期，长任务需重新鉴权；token 存系统 keyring，勿明文落盘。
- 各服务 scope 不同，鉴权时按需申请最小 scope（如 Gmail 用 `gmail.modify`/`gmail.send`/`gmail.labels`，Drive 用 `drive.file`）。
- 批量操作可能触发 per-user/per-service 速率限制（429）；用 `--fields`/`--limit` 减载，`--page-all` 仅在需全量时用。
- CLI 处于 pre-v1.0，版本间可能有破坏性变更；服务账号密钥建议每 90 天轮换，季度审计第三方 OAuth 授权。
- 部分审计项需 Workspace Admin 角色；破坏性批量操作前务必 `--dry-run`。

## 互见

- lark-* 系列（飞书对应能力，套件不同请勿混用）。
- 本套件内可与角色化 recipe / persona 配合，替代手工命令链。

---

采编自 alirezarezvani/claude-skills（MIT 许可）。
