---
name: turborepo-build-caching
title: Turborepo 缓存：Monorepo 本地与远程构建加速
description: 当在 monorepo 中配置 Turborepo、优化构建流水线或排查缓存未命中时使用；做产出 turbo.json 流水线/远程缓存接入/过滤构建命令与 CI 配置；不适用于非 Turborepo 的构建工具或与缓存无关的任务；触发词：turborepo、turbo.json、remote cache
domain: 研发/devops
triggers: [配置 Turborepo, 优化 monorepo 构建, turbo.json 流水线, Turborepo 远程缓存, 排查缓存未命中, CI 只构建变更包, Vercel remote cache, 自建缓存服务器, turbo --filter]
tags: [turborepo, monorepo, 构建缓存, remote-cache, ci/cd, pipeline, 研发, misc]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [turbo, npx turbo, GitHub Actions, Vercel]
requires: []
related: [turborepo-caching, monorepo-navigator, bazel-build-optimization, ci-cd-pipeline-builder]
combines_with: [ci-cd-pipeline-builder, monorepo-navigator, git-worktrees-workflow]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 新建或改造 Turborepo 项目（apps/* + packages/* + 根 turbo.json）。
- 编写/调优构建流水线（dependsOn、outputs、inputs、cache、persistent）。
- 接入远程缓存（Vercel 托管或自建），让 CI 与本地共享产物。
- 用 `--filter` 只构建受影响的包，加速 CI。
- 排查缓存未命中、缓存被错误命中或失效问题。

不该用（负边界）：
- 任务与 Turborepo 缓存无关，或使用 Nx/Bazel/Lerna 等其他工具。
- 仅需通用 CI 配置、与缓存键无关的纯业务改动。
- 缺少必要输入（仓库结构、包名、CI 平台、token）时，先澄清再动手，不要凭空假设。

## 步骤

1. 厘清目标与约束：仓库结构、包管理器、CI 平台、是否需要远程缓存。
2. 配置根 `turbo.json` 流水线：声明任务依赖、缓存产物与输入。
3. 如需跨包覆盖，用包级 `turbo.json` 的 `extends: ["//"]`。
4. 接入远程缓存（Vercel 或自建），在 CI 注入 `TURBO_TOKEN`/`TURBO_TEAM`。
5. 在 CI 用 `--filter` 只构建变更包及其依赖关系。
6. 校验：`--dry-run` 看任务图，`--summarize` 看命中情况，确认缓存按预期命中/失效。

## 指令

流水线核心字段：

| 字段 | 含义 |
|------|------|
| dependsOn | 必须先完成的任务（`^build` 指上游包的 build） |
| outputs | 要缓存的产物文件 |
| inputs | 影响缓存键的输入文件 |
| cache | 是否缓存（dev/部署类设 false） |
| persistent | 长驻任务，如 dev server |

调试缓存：

```bash
turbo build --dry-run          # 预演将要执行的任务
turbo build --summarize        # 输出缓存命中摘要
turbo build --graph            # 任务依赖图
turbo build --force            # 强制忽略缓存
TURBO_LOG_VERBOSITY=debug turbo build --filter=@myorg/web
```

过滤与范围（CI 提速关键）：

```bash
turbo build --filter=@myorg/web          # 单个包
turbo build --filter=@myorg/web...       # 包 + 其依赖
turbo build --filter=...@myorg/ui        # 包 + 依赖它的包
turbo build --filter='...[origin/main]'  # 相对 main 的变更包
turbo build --filter='./apps/*'          # 目录下的包
turbo build --filter='!@myorg/docs'      # 排除某包
```

## 示例

根 turbo.json（保留源关键约束，如排除 `.next/cache`）：

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

包级覆盖（apps/web/turbo.json）：

```json
{
  "$schema": "https://turbo.build/schema.json",
  "extends": ["//"],
  "pipeline": {
    "build": {
      "outputs": [".next/**", "!.next/cache/**"],
      "env": ["NEXT_PUBLIC_API_URL", "NEXT_PUBLIC_ANALYTICS_ID"]
    }
  }
}
```

Vercel 远程缓存接入：

```bash
npx turbo login
npx turbo link
turbo build --remote-only
# CI 注入：TURBO_TOKEN=...  TURBO_TEAM=...
```

GitHub Actions CI（只构建变更包）：

```yaml
name: CI
on:
  push: { branches: [main] }
  pull_request:
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

自建缓存：实现符合协议的 HTTP 端点 `GET/PUT/HEAD /v8/artifacts/:hash`（按 `teamId` 分目录读写产物文件），并在 turbo.json 设 `{"remoteCache": {"signature": false}}`，运行时指定：

```bash
turbo build --api="http://localhost:3000" --token="my-token" --team="my-team"
```

## 注意事项

应做：
- 显式声明 inputs，避免无关文件触发缓存失效。
- 用 workspace 协议引用内部包：`"@myorg/ui": "workspace:*"`。
- 开启远程缓存，让 CI 与本地共享产物。
- CI 中用 `--filter` 只构建受影响的包。
- 只缓存构建产物，不缓存源文件。

不应做：
- 不要缓存 dev server，应设 `persistent: true`、`cache: false`。
- 不要把密钥写进 env 字段，用运行时环境变量。
- 不要漏写 dependsOn，否则任务竞态、缓存键错乱。
- 不要过度过滤，可能漏掉依赖导致构建不完整。
- 输出不能替代环境特定的验证与测试；缺少必要输入、权限或成功标准时先停下来澄清。

## 互见

- Turborepo 官方文档：https://turbo.build/repo/docs
- 缓存指南：https://turbo.build/repo/docs/core-concepts/caching
- 远程缓存：https://turbo.build/repo/docs/core-concepts/remote-caching

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
