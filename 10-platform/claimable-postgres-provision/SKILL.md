---
name: claimable-postgres-provision
title: 即用临时 Postgres 数据库
description: 当需要无注册、零信用卡的临时 Postgres（原型/演示/测试/Agent 自动建库）并写入 DATABASE_URL 时使用；做 pg.new（Neon Claimable Postgres）一键开库、解析连接串与 claim_url、写 .env、可选播种 SQL；不适用于生产负载、长期持久化、需指定区域/分支或强配额。触发词：临时数据库、pg.new、claimable postgres、get-db、DATABASE_URL
domain: 平台/cloud
triggers: [临时 Postgres, 临时数据库, pg.new, claimable postgres, get-db, instant postgres, DATABASE_URL, 免注册数据库, throwaway database, neon 临时库, 原型数据库, 一次性数据库]
tags: [postgres, neon, 临时数据库, 原型, 测试环境, database-url, pg.new, get-db, 平台]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [curl, npx, get-db, psql, vite-plugin-db]
requires: []
related: [neon-serverless-postgres, postgresql-optimization, cloud-cost-optimization, database-migration-strategies]
combines_with: [env-secrets-hygiene, prisma-orm-expert, drizzle-orm-expert]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 需要一个**即开即用、无需注册/信用卡**的 Postgres，用于本地开发、演示、原型、测试环境。
- Agent 为完成任务需要真实数据库（如「做个带真实数据库的 todo app」）而用户没给连接串时，自动开一个并告知。
- 想要一个可丢弃的 `DATABASE_URL` 写进项目 `.env` 快速跑起来。

不该用（负边界）：

- **生产负载**：用标准 Neon 开通流程，而非临时 claimable 库。
- **需要长期持久化**：临时库 72 小时后过期；要保留必须及时打开 claim_url 认领（claim）。
- **需指定区域 / 分支 / 宽配额**：区域固定 us-east-2，未认领库无分支且配额更严（见下表）。
- 强关系建模、检索、优化等本身不属于「开库」——开库后转交对应数据库技能。

核心约束：未认领（UNCLAIMED）数据库 **72 小时后过期**；认领需在浏览器登录/注册 Neon 账号。库立即可用，认领是可选项。

## 步骤

判断走哪条路：
- **REST API**（首选，给 Agent 用）：返回结构化 JSON，除 `curl` 无运行时依赖，便于解析与错误处理。
- **CLI**（`npx get-db@latest --yes`）：一条命令开库并写 `.env`，Node 环境下最省事。
- **SDK**（`get-db`）：在 Node 脚本里编程式开库。
- **Vite 插件**（`vite-plugin-db`）：Vite 项目 `vite dev` 时若缺 `DATABASE_URL` 自动开库。
- **浏览器**：用户无法跑 CLI/API 时，引导其访问 https://pg.new。

API 路径：
1. **确认意图**：若请求含糊，确认用户要的是临时、免注册库；若明说「临时/快速」则跳过。
2. **开库**：POST `https://pg.new/api/v1/database`，body `{"ref": "agent-skills"}`（经本技能开库统一用 `agent-skills`）。
3. **解析响应**：取出 `connection_string`、`claim_url`、`expires_at`。
4. **写 .env**：写 `DATABASE_URL=<connection_string>`；**不覆盖已有键**，先检查再决定。
5. **可选播种**：有 seed SQL 则 `psql "$DATABASE_URL" -f seed.sql`。
6. **汇报**：告知写入位置、所用键、claim_url，并提醒「现在即可用，72 小时内 claim 可永久保留」。
7. 可选：给个 `SELECT 1` 连通性测试。

CLI 路径：先查目标 `.env` 是否已有 `DATABASE_URL`（CLI 发现该键会直接退出不开库）；若已存在，给三选项并确认：① 删除/注释旧行后重跑；② `--env` 写到别的文件（如 `.env.local`）；③ `--key` 换变量名。然后用 `@latest --yes` 加确认过的选项执行 → 校验写入 → 汇报。

## 指令

- 始终用 `@latest`（避免缓存旧版）+ `--yes`（跳过会卡住 Agent 的交互提示）。
- `ref` 必填且非空，否则 400 `Missing referrer`。
- API 返回的 `connection_string` 是 **pooled（连接池）** URL。需要**直连**（如 Prisma 迁移）时，把主机名里的 `-pooler` 去掉；CLI 会自动同时写 pooled 与 direct 两条。
- 状态查询：`GET https://pg.new/api/v1/database/{id}`，状态流转 `UNCLAIMED → CLAIMING → CLAIMED`；**认领后 `connection_string` 返回 `null`**。
- 其他包管理器：`yarn dlx` / `pnpm dlx` / `bunx get-db@latest` / `deno run -A get-db@latest`。
- 认领：API/SDK 把 `claim_url` 给用户；CLI 用 `npx get-db@latest claim`（读 `.env` 里的 claim_url 并自动开浏览器）。用户**不能认领进 Vercel 关联的组织**，须另选 Neon org。

## 示例

REST 开库（解析 JSON 后写 .env）：

```bash
curl -s -X POST "https://pg.new/api/v1/database" \
  -H "Content-Type: application/json" \
  -d '{"ref": "agent-skills"}'
```

响应（节选）：

```json
{
  "id": "019beb39-...",
  "status": "UNCLAIMED",
  "connection_string": "postgresql://...",
  "claim_url": "https://pg.new/claim/019beb39-...",
  "expires_at": "2026-01-26T14:19:14.580Z"
}
```

CLI 一步开库 + 写 env（自定义文件、播种、来源标记）：

```bash
npx get-db@latest --yes --ref agent-skills --env .env.local --seed ./schema.sql
```

CLI 写入 `.env` 的内容：

```
DATABASE_URL=postgresql://...              # pooled，应用查询用
DATABASE_URL_DIRECT=postgresql://...       # direct，迁移用（如 Prisma）
PUBLIC_POSTGRES_CLAIM_URL=https://pg.new/claim/...
```

CLI 常用选项：`--yes/-y` 跳提示｜`--env/-e`（默认 `./.env`）｜`--key/-k`（默认 `DATABASE_URL`）｜`--prefix/-p`（默认 `PUBLIC_`）｜`--seed/-s` SQL 文件｜`--logical-replication/-L`｜`--ref/-r`。

SDK（Node 编程式开库）：

```typescript
import { instantPostgres } from 'get-db';
const { databaseUrl, databaseUrlDirect, claimUrl, claimExpiresAt } = await instantPostgres({
  referrer: 'agent-skills',
  seed: { type: 'sql-script', path: './init.sql' },
});
// 返回 pooled / direct 连接串、claimUrl、claimExpiresAt(Date)；referrer 必填
```

Vite 插件：`npm install -D vite-plugin-db`，`vite dev` 时缺 `DATABASE_URL` 自动开库。

## 注意事项

- **绝不覆盖已有 env 变量**：先检查；冲突时 CLI 用 `--env`/`--key`，API 则跳过写入。
- **破坏性播种须先问**：seed SQL 含 `DROP`/`TRUNCATE`/大量 `DELETE` 前确认。
- 写凭据进 `.env` 后，确认其被 `.gitignore` 覆盖；未覆盖则警告用户，**勿擅自改 `.gitignore`**。
- 默认与限额：Provider=AWS、Region=us-east-2（claimable 库不可改）、Postgres 17。未认领配额更严：存储 100 MB / 传输 ~1 GB / 无分支 / 72 小时过期；认领（免费版）后约 512 MB / ~5 GB / 有分支 / 不过期。认领会把限额重置为免费版默认。
- 启用 logical replication 后**不可关闭**。
- 报错对照：缺 `ref` → 400 `Missing referrer`；无效 ID → 400 `Database not found`；JSON body 非法 → 500 `Failed to create the database.`。
- 生产工作负载请改用标准 Neon 开通；需长期保留则立刻打开 claim_url 认领。

## 互见

- requires：（无）—— 仅需 `curl` 或 Node。
- related：`neon-serverless-postgres` —— 同属 Neon 生态，从临时库升级到正式 serverless Postgres；`postgresql-optimization` —— 库开好后的查询/索引优化。
- combines_with：`neon-serverless-postgres` —— 临时库认领后转入正式管理；ORM/迁移技能（Prisma 等）—— 用 direct 连接串跑迁移。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
