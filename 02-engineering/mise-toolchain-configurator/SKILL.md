---
name: mise-toolchain-configurator
title: mise 工具链配置
description: 当需要为本地开发、CI/CD 或多语言团队统一运行时版本时使用；做的事：探测仓库已固定版本并生成可直接复制的 mise.toml 与引导/CI 命令（产物=mise.toml + bootstrap 脚本）；不适用于：环境特定的测试验证、替代专家评审，或在未授权仓库执行。触发词：mise、mise.toml、工具链版本统一、从 asdf/nvm/pyenv 迁移
domain: 研发/devops
triggers: [mise, mise.toml, 工具链版本统一, 运行时版本固定, 从 asdf/nvm/pyenv 迁移, .tool-versions 迁移, CI/CD 运行时安装, monorepo 版本对齐]
tags: [mise, devops, ci-cd, toolchain, runtime, 版本管理]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Glob, Write, Edit]
requires: []
related: [uv-python-package-manager, devcontainer-claude-setup, turborepo-caching, bash-defensive-patterns]
combines_with: [ci-cd-pipeline-builder, git-hooks-automation]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：

- 需要新建或更新 `mise.toml`，统一团队/monorepo 的运行时版本。
- 处理 Node.js、Python、Go、Rust、Java、Bun、Terraform 或混合技术栈。
- 用户询问基于 mise 的 CI/CD 运行时安装。
- 从 `.tool-versions`、`asdf`、`nvm`、`pyenv` 迁移到 mise。

不该用（负边界）：

- 不替代环境特定的验证、测试或专家评审——生成的配置仍需在目标环境实测。
- 缺少必需输入、权限或安全边界时，应停下来问清楚，不要擅自固定版本。
- 仅在已授权的仓库与环境中使用；运行时可用性随 OS / shell / CI 平台而异。

## 步骤

### 1. 探测项目上下文

读取仓库中的以下文件，推断语言、包管理器与已固定版本：

`package.json` / `pnpm-lock.yaml` / `pyproject.toml` / `requirements.txt` / `go.mod` / `Cargo.toml` / `.tool-versions` / `Dockerfile` / GitHub Actions 等 CI 文件。

### 2. 生成 `mise.toml`

产出最小、合法、可直接复制的配置，遵循优先级：

- 优先沿用仓库中已固定的版本。
- 仓库未声明时，使用用户明确给定的目标版本（先问再固定）。
- 兼顾开发效率的实用默认值。
- 共享/生产配置一律使用具体固定版本。

### 3. 补充引导命令

```bash
mise trust
mise install
```

### 4. 按需生成 CI/CD 集成

如用户要求，生成带缓存与运行时安装的流水线示例。

## 指令

- 读文件：用 Read / Glob 扫描上述探测清单，提取已固定版本。
- 写配置：用 Write 新建 `mise.toml`，或用 Edit 增量更新已有文件，保持最小可读。
- 引导：交付后提示用户执行 `mise trust && mise install`。

## 示例

### 示例 1：Node.js + pnpm

```toml
[tools]
node = "22.11.0"
pnpm = "9.15.0"
```

### 示例 2：Python + GitHub Actions

```toml
[tools]
python = "3.12.7"
poetry = "1.8.4"
```

```yaml
steps:
  - uses: actions/checkout@v4
  - uses: jdx/mise-action@v2
  - run: poetry install
  - run: pytest
```

## 注意事项

- 尊重仓库已固定的版本，不要忽略已有 lockfile / 版本文件。
- 共享/生产配置中不要用浮动的 `latest`、`lts` 别名（除非用户明确要求）。
- 不要过度堆砌不必要的工具条目；偏好稳定的运行时版本。
- 执行前先审查生成的 shell 命令；修改流水线前确认 CI/CD 权限。
- 常见坑：选错运行时版本→先查 lockfile 与已固定版本；CI 安装慢→启用缓存层、复用 mise 缓存目录；工具不在 registry→确认插件支持或手动安装。

## 互见

- docker-expert：构建容器化开发环境时。
- github-actions-templates：进阶工作流自动化时。
- monorepo-architect：大型多包仓库时。

---

采编自 sickn33/antigravity-awesome-skills（MIT）。
