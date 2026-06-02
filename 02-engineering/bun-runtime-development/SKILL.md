---
name: bun-runtime-development
title: Bun 运行时现代 JS/TS 开发
description: 当用 Bun 启动新 JS/TS 项目、从 Node.js 迁移、或用其内置打包/测试/SQLite/HTTP 等能力提速开发时使用；产出可运行的 Bun 项目脚手架、依赖与脚本配置、Bun 原生 API 代码及打包/编译产物；不适用于必须依赖 Node 专有 API（如 setImmediate、process.hrtime）或纯前端框架内部细节的场景。触发词：bun、bun.serve、bun:sqlite、bunx、bun test、bun build、@types/bun、从 Node 迁移
domain: 研发/backend
triggers: [bun, bunx, bun init, bun install, bun add, bun run, bun test, bun build, bun.serve, bun:sqlite, bun:test, Bun.file, Bun.password, @types/bun, 从 Node 迁移到 Bun, Elysia, bun --watch, bun --hot, bun --compile]
tags: [bun, javascript, typescript, 运行时, 包管理, 测试, 打包, sqlite, http-server, node-migration, 研发, misc]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [bun, bunx, Bash, PowerShell]
requires: []
related: [javascript-modern-pro, typescript-advanced-types, hono-edge-api, uv-python-package-manager]
combines_with: [trpc-typesafe-api, turborepo-caching, javascript-testing-patterns]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 用 Bun 起新 JS/TS 项目，或把现有 Node.js 项目迁移到 Bun。
- 想用 Bun 内置工具链（包管理、测试 `bun:test`、打包 `bun build`、单文件编译）替代 Node + npm + Jest + Webpack 组合。
- 直接用 Bun 原生 API：`Bun.serve`（HTTP/WebSocket）、`Bun.file`、`bun:sqlite`、`Bun.password`。
- 排查 Bun 特有问题。

不该用（负边界）：
- 任务依赖 Node 专有且 Bun 不兼容的 API（如 `setImmediate`、`process.hrtime`、`__non_webpack_require__`）——需改写为 Bun 等价物，不能照搬。
- 纯属某前端框架（React/Next）内部实现问题，Bun 只是运行环境，应转对应框架技能。
- 需要环境专属的安全/性能验证时，本技能不替代实测与专家评审。

为什么用 Bun：启动约 25ms（Node 100ms+）、装包快 10–100 倍、原生支持 TS/JSX、内置测试与打包。

## 步骤

1. 安装/升级 Bun（见下方指令）。
2. `bun init` 起项目，或 `bun create <模板> <名字>` 用模板（react/next/vite/elysia）。
3. 配置 `package.json` 脚本与 `@types/bun`，按需写 Bun 优化版 `tsconfig.json`。
4. `bun install` 装依赖；`bun add` / `bun remove` / `bun update` 增删更。
5. 直接 `bun run xxx.ts` 跑 TS（无需编译）；开发用 `--watch`，需保留状态用 `--hot`。
6. 写测试用 `bun:test`，`bun test` 运行（支持 `--coverage`、`--watch`）。
7. 生产用 `bun build` 打包/压缩，或 `--compile` 编译成单文件可执行程序。

## 指令

```bash
# 安装（macOS/Linux）
curl -fsSL https://bun.sh/install | bash
# Windows
powershell -c "irm bun.sh/install.ps1 | iex"
bun upgrade                       # 升级

# 项目
bun init                          # 生成 package.json/tsconfig.json/index.ts
bun create react my-app           # 用模板

# 依赖
bun install                       # 按 package.json 安装（别名 bun i）
bun add express                   # 生产依赖
bun add -d @types/bun             # 开发依赖
bun add react@18.2.0              # 指定版本；也支持 github:user/repo
bun remove lodash
bun update --latest               # 忽略 range 升到最新
bun outdated
bun install --frozen-lockfile     # CI 锁定 lockfile（bun.lockb 为二进制）

# 运行
bun run index.ts                  # 直接跑 TS，无 build 步骤
bun --watch run index.ts          # 改动自动重启
bun --hot run server.ts           # 热重载（保留状态）
bun --env-file=.env.production run index.ts

# bunx（npx 等价）
bunx prettier --write .
bunx -p typescript@4.9 tsc --version

# 测试
bun test
bun test math.test.ts
bun test --coverage --watch

# 打包 / 编译
bun build ./src/index.ts --outdir ./dist --target browser --minify --sourcemap
bun build ./src/cli.ts --compile --outfile myapp                  # 单文件可执行
bun build ./src/cli.ts --compile --target=bun-linux-x64 --outfile myapp-linux
```

`package.json` 脚本约定：

```json
{
  "type": "module",
  "scripts": {
    "dev": "bun run --watch index.ts",
    "start": "bun run index.ts",
    "test": "bun test",
    "build": "bun build ./index.ts --outdir ./dist"
  },
  "devDependencies": { "@types/bun": "latest" }
}
```

## 示例

HTTP 服务（`Bun.serve`，比 Express 快 4–10 倍）：

```typescript
const server = Bun.serve({
  port: 3000,
  fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/") return new Response("Hello World!");
    if (url.pathname === "/api/users")
      return Response.json([{ id: 1, name: "Alice" }]);
    return new Response("Not Found", { status: 404 });
  },
  error(e) { return new Response(`Error: ${e.message}`, { status: 500 }); },
});
console.log(`http://localhost:${server.port}`);
```

文件读写（`Bun.file`，比 `fs/promises` 快）：

```typescript
const file = Bun.file("./data.json");
const json = await file.json();              // 也有 .text() / .arrayBuffer()
await Bun.write("./output.txt", "Hello, Bun!");
```

内置 SQLite（`bun:sqlite`）：

```typescript
import { Database } from "bun:sqlite";
const db = new Database("mydb.sqlite");
db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT)`);
db.prepare("INSERT INTO users (name) VALUES (?)").run("Alice");
const user = db.prepare("SELECT * FROM users WHERE name = ?").get("Alice");
```

密码哈希（`Bun.password`）：

```typescript
const hash = await Bun.password.hash("super-secret");      // 默认 argon2
const ok = await Bun.password.verify("super-secret", hash); // true
```

测试（`bun:test`，API 兼容 Jest）：

```typescript
import { describe, it, expect, mock, spyOn } from "bun:test";
describe("math", () => {
  it("adds", () => expect(1 + 1).toBe(2));
});
const fn = mock((x: number) => x * 2);
fn(5);
expect(fn).toHaveBeenCalledWith(5);
```

## 注意事项

- 多数 Node API 开箱可用：`fs`/`path`/`crypto`、全局 `process`/`Buffer`、`__dirname`/`__filename` 均正常。
- 不兼容项需替换：`require()`→`import`；`require.resolve`→`import.meta.resolve`；`process.hrtime()`→`Bun.nanoseconds()`；`setImmediate()`→`queueMicrotask()`；`__non_webpack_require__` 不支持。
- 迁移步骤：删 `node_modules` 与 `package-lock.json` → `bun install` → 把脚本里的 `node`/`jest` 换成 `bun run`/`bun test` → `bun add -d @types/bun`。
- 性能优先用 Bun 原生 API：能用 `Bun.file`/`Bun.serve` 就别用 `fs/promises`/Express；Bun 优化框架可选 Elysia。
- 生产务必打包压缩后再跑（`bun build ... --minify --target node` → `bun run ./dist/index.js`）。
- 缺少必要输入、权限或成功标准时应先澄清，不要将输出当作免测结论。

## 互见

- 官方文档：https://bun.sh/docs ｜ GitHub：https://github.com/oven-sh/bun
- Elysia 框架：https://elysiajs.com/
- 同类研发技能：Node.js / TypeScript 工程化、前端打包工具链相关条目。

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可），灵感源自 oven-sh/bun。
