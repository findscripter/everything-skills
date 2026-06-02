---
name: turborepo-caching
title: Turborepo 单仓构建缓存配置
description: 当在 monorepo 中配置 Turborepo、设计 pipeline 任务依赖、接入本地/远程缓存或在 CI 中按变更过滤构建时使用；产出 turbo.json 任务编排、远程缓存接入（Vercel 或自托管）、--filter 范围控制与缓存命中调试方案；不适用于非 Turborepo 单仓工具（Nx/Bazel/Rush 等）或单工程小项目。触发词：Turborepo、turbo.json、远程缓存、monorepo
domain: 研发/devops
triggers: [Turborepo, turbo.json, turbo build, 远程缓存, remote cache, monorepo, 单仓, pipeline, dependsOn, 缓存命中, cache miss, --filter, TURBO_TOKEN, Vercel 缓存, CI 构建优化]
tags: [turborepo, monorepo, 单仓, 构建缓存, 远程缓存, pipeline, CI, Vercel, 研发效能, DevOps]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [turbo, npm, git, node]
requires: []
related: [monorepo-navigator, bazel-build-optimization, ci-cd-pipeline-builder, git-advanced-workflows]
combines_with: [typescript-advanced-types, deployment-engineer, github-actions-author]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：

- 在 monorepo（`apps/*` + `packages/*`）首次搭建或重构 Turborepo，编写 `turbo.json` 任务流水线。
- 设计任务依赖（`dependsOn`）、显式声明 `outputs`/`inputs`/`env` 以稳定缓存键。
- 接入远程缓存：Vercel 托管或自托管缓存服务器，跨开发者与 CI 共享构建产物。
- 在 CI 中用 `--filter` 仅构建受改动影响的包，压缩流水线耗时。
- 排查 cache miss、缓存频繁失效或构建未命中缓存的问题。
- 从其他单仓工具迁移到 Turborepo。

不该用（负边界）：

- 任务与 Turborepo 缓存无关，或目标工具是 Nx / Bazel / Rush / Lerna 等非 Turborepo。
- 单一小工程、无跨包复用与共享构建诉求——引入 Turborepo 通常不划算。
- 需要环境特定的安全/合规评审：本技能产物须经本地实测验证，不能替代专家审查。

## 步骤

1. 明确目标与约束：包管理器（npm/pnpm/yarn）、workspace 布局、CI 平台、是否已有远程缓存后端、哪些任务可缓存。
2. 根 `package.json` 声明 `workspaces` 与 `turbo` 脚本；安装 `turbo` 为 devDependency。
3. 写根 `turbo.json`：逐任务声明 `dependsOn`、`outputs`、`inputs`、`env`；dev/clean/deploy 等不可缓存任务设 `cache: false`，长驻任务（dev server）设 `persistent: true`。
4. 需要时用包级 `turbo.json`（`"extends": ["//"]`）覆盖单个包的任务配置。
5. 接远程缓存：先 `npx turbo login` + `npx turbo link`（Vercel），或部署自托管缓存服务并用 `--api/--token/--team` 指向。
6. CI 注入 `TURBO_TOKEN`/`TURBO_TEAM`，用 `--filter='...[origin/main]'` 仅构建受影响包。
7. 调试与验证：`--dry-run`/`--summarize`/`--verbosity=2` 看任务与哈希；清缓存冷构建记基线，再增量构建对比命中率，固化进 CI。

## 指令

骨架（关键文件）：

```
workspace/
├── apps/        # web、docs … 每个含 package.json
├── packages/    # ui、config … 可复用库
├── turbo.json   # 任务流水线 + 缓存规则
└── package.json # workspaces + turbo 脚本
```

pipeline 关键概念：`dependsOn`（前置任务，`^build` 指依赖包先构建）/ `cache`（是否缓存）/ `outputs`（要缓存的产物）/ `inputs`（影响缓存键的源文件）/ `env`（纳入哈希的环境变量）/ `persistent`（长驻任务）。

根 `turbo.json`（任务编排 + 缓存）：

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [".env", ".env.local"],
  "globalEnv": ["NODE_ENV", "VERCEL_URL"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"],
      "env": ["API_URL", "NEXT_PUBLIC_*"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"],
      "inputs": ["src/**/*.ts", "src/**/*.tsx", "test/**/*.ts"]
    },
    "lint": { "outputs": [], "cache": true },
    "typecheck": { "dependsOn": ["^build"], "outputs": [] },
    "dev": { "cache": false, "persistent": true },
    "clean": { "cache": false }
  }
}
```

`--filter` 范围控制（CI 增量构建核心）：

```bash
turbo build --filter=@myorg/web          # 仅该包
turbo build --filter=@myorg/web...       # 该包 + 其依赖
turbo build --filter=...@myorg/ui        # 该包 + 依赖它的包（dependents）
turbo build --filter='...[origin/main]'  # 自 main 以来变更的包及其影响面
turbo build --filter='./apps/*'          # 目录下的包
turbo build --filter='!@myorg/docs'      # 排除某包
```

缓存调试：

```bash
turbo build --dry-run        # 看将运行哪些任务，不实际执行
turbo build --summarize      # 输出缓存命中/未命中汇总
turbo build --verbosity=2    # 打印任务哈希，定位缓存失效
turbo build --force          # 强制忽略缓存
turbo build --graph          # 导出任务依赖图
TURBO_LOG_VERBOSITY=debug turbo build --filter=@myorg/web
```

## 示例

为含 web 与 ui 的 monorepo 接入远程缓存并在 CI 只构建受影响包：

1. 根 `package.json` 配 `"workspaces": ["apps/*", "packages/*"]`，脚本 `"build": "turbo build"`；包间依赖用 workspace 协议 `"@myorg/ui": "workspace:*"`。
2. 本地接 Vercel 远程缓存：`npx turbo login` → `npx turbo link`，之后开发与 CI 共享产物。
3. GitHub Actions 中注入凭据并按变更过滤：

```yaml
env:
  TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
  TURBO_TEAM: ${{ vars.TURBO_TEAM }}
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'npm' }
      - run: npm ci
      - run: npx turbo build --filter='...[origin/main]'
      - run: npx turbo test  --filter='...[origin/main]'
```

4. 自托管缓存时，`turbo.json` 加 `{"remoteCache": {"signature": false}}`，构建指向自有服务：`turbo build --api="http://localhost:3000" --token="my-token" --team="my-team"`（服务端按 Turborepo 的 `/v8/artifacts/:hash` GET/PUT/HEAD 协议实现）。
5. 上线前：清缓存冷构建记基线耗时，再改一处做增量构建，用 `--summarize` 确认命中率提升。

## 注意事项

推荐做法：

- 显式声明 `inputs`，避免无关文件变动导致缓存失效。
- 包间依赖用 workspace 协议（`workspace:*`），保证依赖图准确。
- 开启远程缓存，在 CI 与本地之间共享产物；CI 用 `--filter` 只构建受影响包。
- 只缓存构建产物（`outputs`），不要把源文件当产物缓存。

避免：

- 别缓存 dev server——改用 `persistent: true`，并对 dev/clean/deploy 设 `cache: false`。
- 别把密钥写进 `env`（会进缓存键且有泄露风险），密钥走运行时环境变量。
- 别省略 `dependsOn`——会引发任务竞态与产物不一致。
- 别过度 `--filter`——可能漏掉真正依赖的包；产物务必本地实测，缺输入/权限/成功标准时停下来澄清。

## 互见

- related：`bazel-build-optimization` —— 另一类大型单仓构建系统与远程缓存方案，按工具栈二选一。
- related：`monorepo-navigator` —— monorepo 结构梳理与导航。
- combines_with：`ci-cd-pipeline-builder` —— 把 turbo `--filter` 增量构建编进 CI/CD 流水线。
- combines_with：`deployment-engineer` —— 缓存命中后的构建产物对接部署发布。
- Turborepo 文档：https://turbo.build/repo/docs ｜ 缓存：https://turbo.build/repo/docs/core-concepts/caching ｜ 远程缓存：https://turbo.build/repo/docs/core-concepts/remote-caching

---

采编自 sickn33/antigravity-awesome-skills（MIT）。
