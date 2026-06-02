---
name: ai-native-cli-design
title: 面向 AI 智能体的 CLI 设计规范
description: 当设计/改造供 AI 智能体调用的命令行工具时使用；按 core/recommended/ecosystem 三层产出 JSON 优先、可校验的 CLI 契约（默认 JSON、结构化错误、退出码、护栏、agent/ 目录与自描述）；不适用于纯人类交互 CLI、GUI 或库 API 设计；触发词：agent CLI、AI 友好命令行、CLI JSON 输出、退出码规范、agent/ 目录
domain: 平台/cli
triggers: [设计给 AI 智能体用的 CLI, 把现有命令行改造成 agent 友好, CLI 默认输出 JSON, 命令行结构化错误和退出码, agent/ 目录与自描述规范, CLI 安全护栏 reject secrets path traversal, 自动化流水线的命令行接口, 审计 CLI 是否符合 agent 安全标准]
tags: [cli, ai-agent, json-output, exit-code, guardrails, self-description, platform]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [jq, bash]
requires: []
related: [agent-tool-builder, agent-tool-design, mcp-builder, skill-creator]
combines_with: [mcp-builder, agent-tool-builder, google-workspace-cli-admin]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
采编自 sickn33/antigravity-awesome-skills（MIT）的 Agent-Friendly CLI Spec v0.1，适配重写。

## 何时使用

- 新建一个将被 AI 智能体调用的 CLI 工具时。
- 把已有 CLI 改造成 agent 友好（默认 JSON、结构化错误、退出码契约）时。
- 为自动化/流水线设计命令行接口时。
- 审计某个 CLI 是否符合 agent 安全标准时。

不该用：

- 纯人类交互的 CLI（带向导、彩色 TUI 为主），其默认人类友好输出与本规范"默认 JSON"相悖。
- GUI / Web 接口、纯库 API（非命令行进程契约）的设计。
- 仅需"加个 --json 参数"的临时需求——本规范要求 JSON 为默认而非可选。

## 核心理念

1. Agent 优先：默认输出 JSON，人类友好格式靠 `--human` 显式开启。
2. Agent 不可信：所有输入按公开 API 级别校验。
3. 失败即关闭（Fail-Closed）：校验逻辑自身出错时，默认拒绝。
4. 可验证：每条规则都写成可被自动检查的形式。

## 步骤

规范用两条正交轴：层（落地范围 core/recommended/ecosystem）× 优先级（严重度 P0/P1/P2）。按层增量落地，每个阶段对应一个认证等级：

- core 全过 → Agent-Friendly（CLI 是稳定可调用的 API）
- core + recommended 全过 → Agent-Ready（CLI 自描述、可被发现、可串联）
- 全部层过 → Agent-Native（CLI 有身份、行为契约、技能系统、反馈闭环）

P0=不满足则 agent 直接崩；P1=能用但很差；P2=锦上添花。

### 阶段 1：Agent-Friendly（core，~20 条）

1. 默认输出 JSON，无需 `--json` 参数（O1）；JSON 必须能过 `jq .`（O2）；同版本内 schema 不变（O3）。
2. 错误对象写到 stderr：`{"error":true,"code":"...","message":"...","suggestion":"..."}`（E1）。`code` 机器可读（如 `MISSING_REQUIRED`）（E4），`message` 人类可读（E5），错误码是 API 契约、跨版本不得改名（E8）。
3. 出错时绝不进入交互模式，立即退出（E7）。
4. 退出码：参数/用法错误必须 exit 2（X3）；任何失败必须非零退出，绝不 exit 0 再在 stdout 报错（X9）。
5. stdout 只放数据（C1）；日志、进度、警告只走 stderr（C2）。
6. 缺必填参数 → 结构化错误，绝不交互提示（I4）；类型不符 → exit 2 + 结构化错误（I5）。
7. 破坏性操作需 `--yes` 确认（S1）；拒绝 `../../` 路径穿越与控制字符（S4）。
8. 护栏：未知参数拒绝并 exit 2（G1）；检测到 API key/token 模式则拒绝执行（G2）；拒绝敏感文件路径 `*.env *.key *.pem`（G3）；拒绝参数中的 shell 元字符 `; | && $()`（G8）。

### 阶段 2：Agent-Ready（+recommended）

9. `--help` 输出结构化 JSON，含 `commands[]`、`rules`、`skills`、`issue`（D1/D11），每个命令有描述（D9），参数有类型声明（D4）与必填/可选标注（D7）。
10. `--brief` 输出 `agent/brief.md` 内容（D15）；`--human` 切人类友好格式（D16）。
11. 所有 flag 用 `--long-name`（I1），无位置参数歧义（I2）；错误带 `suggestion` 字段（E6）。
12. 退出码扩展：0 成功（X1），1 通用错误，2 参数错误，10 认证失败，11 权限拒绝，20 资源不存在，30 冲突/前置条件失败。
13. 管道模式下无交互提示（C6）；保留参数见下表（N4）。

保留参数：

| 参数 | 语义 |
|------|------|
| `--agent` | JSON 输出（默认，显式覆盖） |
| `--human` | 人类友好输出（彩色/表格） |
| `--brief` | 一段式身份，供注入 agent 配置 |
| `--help` | 完整自描述 JSON |
| `--version` | semver 版本串 |
| `--yes` | 确认破坏性操作 |
| `--dry-run` | 预演不执行 |
| `--quiet` | 抑制 stderr 输出 |
| `--fields` | 过滤输出字段，省 token |

### 阶段 3：Agent-Native（+ecosystem）

14. 在项目根建 `agent/` 目录（工具对 agent 的身份与行为契约）：

```
agent/
  brief.md          # 一段话：我是谁、能做什么
  rules/            # 行为约束（自动注册）
    trigger.md      # 何时该用本工具
    workflow.md     # 逐步使用流程
    writeback.md    # 如何回写反馈
  skills/           # 扩展能力（自动注册）
    getting-started.md
```

`agent/rules/*.md` 与 `agent/skills/*.md` 需带 YAML frontmatter（name、description）（D17/D18）。
15. 每次命令响应内联追加上下文：`rules[]`（来自 agent/rules 的完整内容）+ `skills[]`（name+description+command）+ `issue`（反馈指引）（R1/R2/R3）。
16. `skills` 子命令：列出全部 / 展示单个完整内容（D14）。
17. `issue` 子命令做反馈闭环（create/list/show/close/状态流转），本地存储不依赖外部服务（F1-F8）；项目根放 `AGENTS.md`（M1），`CHANGELOG.md` 标注破坏性变更（M3）。

## 指令

四级自描述：`--brief`（名片，注入 agent 配置）→ 每次命令响应（常驻上下文：数据+rules+skills+issue）→ `--help`（完整自描述）→ `skills <name>`（按需深入某技能）。

```bash
mycli list              # 默认 = JSON 输出（agent 模式）
mycli list --human      # 人类友好：彩色、表格、格式化
mycli list --agent      # 显式 agent 模式（当 env/config 覆盖了默认时）
mycli list | jq .       # JSON 必须能通过 jq 校验
```

## 示例

JSON 输出（agent 模式）——响应内联 rules/skills/issue：

```bash
$ mycli list
{"result": [{"id": 1, "title": "Buy milk", "status": "todo"}], "rules": [...], "skills": [...], "issue": "..."}
```

结构化错误（写 stderr，附 suggestion）：

```json
{
  "error": true,
  "code": "AUTH_EXPIRED",
  "message": "Access token expired 2 hours ago",
  "suggestion": "Run 'mycli auth refresh' to get a new token"
}
```

退出码表：

```
0   成功            10  认证失败          20  资源不存在
1   通用错误        11  权限拒绝          30  冲突/前置条件失败
2   参数/用法错误
```

## 注意事项

- 要做：默认 JSON 输出，让 agent 永远不必加参数；每个错误都带 `suggestion` 字段；用三级认证模型做增量落地；`agent/brief.md` 保持一段话以省 token。
- 不要做：出错时进入交互模式（必须立即退出）；同版本内改 JSON schema 或错误码；把日志/进度放进 stdout（只能走 stderr）；静默接受未知参数（须 exit 2 拒绝）。
- 常见坑：默认输出人类可读文本会破坏 agent 解析 → 默认 JSON、`--human` 切人类模式；exit 0 却在 stdout 报错 → 失败一律非零退出且结构化错误写 stderr；缺参数时交互提示 → 返回带 suggestion 的结构化错误并立即退出。

## 互见

- 通用 CLI 设计模式（cli-best-practices）：本规范专注 AI 智能体兼容性，可与其互补。
- 上游规范仓库：github.com/ChaosRealmsAI/agent-cli-spec。
- 本条目采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
