---
name: varlock-env-secrets-guard
title: Varlock 环境变量防护：会话中密钥零泄露管理
description: 当在 AI Agent/Claude 会话、终端、日志或 git 提交中处理含密钥的环境变量、想让敏感值默认脱敏不外泄时使用；做法是用 varlock 在 .env.schema 中以 @sensitive/@type/@required 声明并校验 env，用 varlock run 注入运行时、用其自动脱敏的 redacted 输出替代明文 echo，产出可校验、可加密提交且日志安全的 env 工作流；不适用于生产级集中密钥库/HA/动态短期凭据基建（见 secrets-management）。触发词：varlock、env 脱敏、密钥不进日志、.env.schema、会话密钥泄露
domain: 安全/appsec
triggers: [varlock, env 脱敏, 密钥不进日志, redacted env, .env.schema, 会话密钥泄露, Claude 会话密钥, 环境变量校验, @dmno/varlock, secrets 零泄露, varlock run, env 加密提交]
tags: [安全, secrets, 环境变量, env, varlock, 脱敏, log-redaction, AI-Agent-安全, dotenv, 凭据管理]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [varlock, Bash, node, @dmno/varlock]
requires: []
related: [env-secrets-hygiene, secrets-management, secrets-manager, insecure-defaults-detector]
combines_with: [agent-skill-security-scanner, security-diff-review]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
# Varlock 环境变量防护：会话中密钥零泄露管理

> 用 [Varlock](https://varlock.dev)（`@dmno/varlock`）给环境变量加一层 schema + 自动脱敏，确保 API key、口令、token 在 AI Agent/Claude 会话、终端回显、日志和 git 提交里**默认不出现明文**。

## 何时使用

适用场景：
- 在 Claude/Agent 会话或自动化脚本中需要读取含密钥的 `.env`，但**绝不能让明文密钥进入对话、终端回显或日志**。
- 想给项目 env 加「合同」：哪些变量必填、类型是什么、哪些算敏感（默认脱敏），并在启动/CI 期校验。
- 团队希望把 env **加密后随仓库提交**（避免「.env 不在版本库、新人永远缺值」），同时保证明文不落库。
- 排查「生产缺变量 / 变量类型错」类故障，需要 fail-fast 的 env 校验。

不该用（负边界）：
- **不替代生产级集中密钥库**（HashiCorp Vault / AWS Secrets Manager / 动态短期凭据 / HA / 灾备）——那是 `secrets-management` / `secrets-manager` 的范围。Varlock 管的是「本地 + 运行时的 env 注入与脱敏」这一段。
- 不是密钥泄露事后扫描器（git 历史扫密钥、轮换应急）——见 `env-secrets-hygiene`。
- 脱敏是**纵深防御的一层，不是绝对保证**：自写代码若直接打印 `process.env.X` 仍可能漏，须配合习惯约束。

## 步骤

1. **安装并初始化 schema**：用 `varlock` 把现有 `.env` 升级为带类型/敏感标注的 `.env.schema`。
2. **声明敏感与必填**：在 schema 顶部用 `@defaultSensitive=true` 让所有值默认脱敏；逐项用 `@type`、`@required`、`@sensitive=false`（明确非敏感项如端口）覆盖。
3. **校验**：`varlock load`（或 CI 里 `varlock load --fail-fast`）确认所有必填项存在、类型合法，缺失即报错退出。
4. **运行时注入**：用 `varlock run -- <你的命令>` 启动应用/脚本，让 Varlock 注入 env 并接管 stdout/stderr 做实时脱敏，而不是 `export` 后裸跑。
5. **会话/日志安全**：调试时**不要** `echo $SECRET` 或 `print(process.env.SECRET)`；要看值用 `varlock load` 的脱敏视图（显示为 `re***ed`）。
6. **加密提交（可选）**：对需要随仓库分发的值用 Varlock 的加密能力，提交密文、`.env.schema` 入库，明文 `.env` 仍 `.gitignore`。

## 指令

安装与初始化：

```bash
# 安装 CLI（也可 npx 直接用）
npm install -g @dmno/varlock
# 或：npx varlock --help

# 把现有 .env 升级成带标注的 .env.schema（交互式扫描你的 .env）
varlock init
```

`.env.schema` 示例（`@decorator` 是 Varlock 的核心约束语法）：

```bash
# @defaultSensitive=true   # 全局：所有值默认脱敏
# @defaultRequired=false
# ---

# @type=number @sensitive=false @required   # 端口非敏感、必填、须为数字
PORT=3000

# @type=url @required
DATABASE_URL=

# @type=string @required @sensitive          # 敏感，默认脱敏（@defaultSensitive 已覆盖，可显式标注）
OPENAI_API_KEY=

# @type=email
ADMIN_EMAIL=
```

校验与运行：

```bash
# 加载并校验（缺必填 / 类型不符 → 非零退出，适合放 CI）
varlock load

# 仅看脱敏后的解析结果（敏感值显示为 re***ed，可安全粘进会话/日志）
varlock load --format pretty

# 用 Varlock 注入 env 并启动应用：stdout/stderr 中泄露的密钥会被实时脱敏
varlock run -- node server.js
varlock run -- npm run dev
```

代码内使用（Node SDK，库会自动避免把敏感值序列化进日志）：

```js
import { load } from 'varlock';
const env = load();           // 经 schema 校验
fetch(api, { headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}` } });
// 不要 console.log(env.OPENAI_API_KEY)；用 varlock run 包裹进程以兜底脱敏
```

## 示例

让 Agent 安全地排查「为什么连不上数据库」而**不泄露口令**：

```bash
# ❌ 危险：明文进终端/会话/日志
echo $DATABASE_URL

# ✅ 安全：脱敏视图，确认变量存在且类型对，值显示为 re***ed
varlock load --format pretty | grep DATABASE_URL

# ✅ 安全：在脱敏包裹下实际启动，连接失败的报错里密钥也不会裸露
varlock run -- node scripts/db-ping.js
```

CI 门禁（缺变量直接红灯）：

```yaml
# .github/workflows/ci.yml 片段
- name: Validate env schema
  run: npx varlock load --fail-fast   # 任一必填缺失/类型错即失败
```

## 注意事项

- **脱敏是兜底不是免责**：自己 `console.log`/`print` 一个敏感值、或把它拼进 URL 后打印，仍会泄露。养成「只用 `varlock load` 脱敏视图看值、用 `varlock run` 包裹进程」的习惯。
- 明文 `.env` 始终 `.gitignore`；入库的应是 `.env.schema`（结构契约，**不含真实值**）与（如使用加密）密文，绝不是明文。
- `.env.schema` 里的占位/示例值不要写真实凭据；`@example` 仅作文档。
- Varlock 管「本地与运行时注入」这一段，**生产真源应是密钥库**（Vault / 云 Secret Manager），由 CI/部署阶段注入，而非把生产密钥放进随仓库分发的文件。
- 类型/必填校验能挡「拼写错变量名、忘填、传错类型」，但不校验值的业务正确性（key 是否真有效需运行时验证）。
- 给 Agent 的硬规则：**任何情况下不得在回复、命令回显或写入文件中输出未脱敏的密钥**；需要值时一律走 Varlock 脱敏通道。

## 互见
- related：`env-secrets-hygiene` —— 互补：本技能做「事前防泄露 + 校验」，它做「事后泄露扫描 + 凭据轮换应急」。
- related：`insecure-defaults-detector` —— 检测含 env/密钥在内的不安全默认配置。
- combines_with：`secrets-management` —— 生产侧把真源放进 Vault / 云 Secret Manager，Varlock 负责本地与运行时注入这一段。
- combines_with：`secrets-manager` —— 集中密钥库的存取/轮换，与 Varlock 的运行时脱敏组合成端到端方案。
- related：`dependency-auditor` —— 配套审计依赖供应链风险。

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可）；原技能源 wrsmith108/varlock-claude-skill，工具 Varlock = `@dmno/varlock`。
