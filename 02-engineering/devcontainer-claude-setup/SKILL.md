---
name: devcontainer-claude-setup
title: Devcontainer 隔离开发环境搭建
description: 当需要为项目新增 Devcontainer 支持、搭建隔离/沙箱化的 Claude Code 开发环境时使用；做语言探测并在 .devcontainer/ 生成 Dockerfile、devcontainer.json、post_install.py、.zshrc、install.sh 等配置产物；不适用于已有 devcontainer 仅做微调、通用 Docker 问题或生产容器部署。触发词：devcontainer、隔离开发环境、沙箱 Claude Code
domain: 研发/devops
triggers: [set up a devcontainer, 添加 devcontainer 支持, 搭建隔离开发环境, 沙箱化 Claude Code 工作区, Reopen in Container, devcontainer up]
tags: [devcontainer, Docker, Claude Code, 开发环境, 沙箱隔离, VS Code, uv, 多语言]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Write, Edit, Bash]
requires: []
related: [docker-development-optimizer, docker-expert, docker-container-optimizer, deployment-engineer]
combines_with: [ci-cd-pipeline-builder, fullstack-project-scaffolder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 用户要求「搭建 devcontainer」「添加 devcontainer 支持」。
- 需要一个沙箱化、可复现的 Claude Code 开发环境。
- 需要带持久化配置的隔离开发环境（多项目互不污染）。

不该用（负边界）：
- 项目已有 devcontainer 配置，只需局部修改 —— 直接改现有文件即可。
- 用户问的是通用 Docker / 容器知识，与本流程无关。
- 用户要部署生产容器 —— 本技能只面向开发环境。

## 步骤

整体流程：项目侦察 → 语言探测 → 生成配置 → 写入 `.devcontainer/` → 提示用户启动。

### 1. 项目侦察

推断项目名（按序取首个命中）：
1. `package.json` → `name`
2. `pyproject.toml` → `project.name`
3. `Cargo.toml` → `package.name`
4. `go.mod` → 模块路径最后一段（`/` 之后）
5. 兜底用目录名

转为 slug：全小写，空格/下划线替换为连字符。得到两个占位值：`{{PROJECT_NAME}}`（人类可读名）、`{{PROJECT_SLUG}}`（卷命名用）。

### 2. 语言探测

| 语言 | 探测文件 |
|------|----------|
| Python | `pyproject.toml`、`*.py` |
| Node/TS | `package.json`、`tsconfig.json` |
| Rust | `Cargo.toml` |
| Go | `go.mod`、`go.sum` |

多语言项目按优先级全部配置：Python（用 Dockerfile 装 uv + Python）> Node/TS（devcontainer feature）> Rust（feature）> Go（feature）。各语言的扩展与 settings 合并写入；`postCreateCommand` 用 `&&` 串联，如：
```
uv run /opt/post_install.py && uv sync && npm ci
```

### 3. 生成配置

从 `resources/` 基础模板起步，替换 `{{PROJECT_NAME}}` / `{{PROJECT_SLUG}}`，再叠加语言专属修改。

基础模板已含：Claude Code（marketplace 插件 anthropics/skills、trailofbits/skills、trailofbits/skills-curated）、uv 装 Python 3.13、fnm 装 Node 22、ast-grep、网络隔离工具（iptables/ipset，需 NET_ADMIN 能力）、现代 CLI（ripgrep、fd、fzf、tmux、git-delta）。

### 4. 写入这些文件到 `.devcontainer/`

1. `Dockerfile` — 镜像构建指令
2. `devcontainer.json` — VS Code/devcontainer 配置
3. `post_install.py` — 创建后初始化脚本
4. `.zshrc` — Shell 配置
5. `install.sh` — 管理 devcontainer 的 CLI（提供 `devc` 命令）

### 5. 校验清单（呈给用户前逐项核对）

1. 所有 `{{PROJECT_NAME}}` 已替换为人类可读名。
2. 所有 `{{PROJECT_SLUG}}` 已替换为 slug。
3. `devcontainer.json` JSON 合法（无尾随逗号、嵌套正确）。
4. 已为所有探测到的语言加上对应扩展。
5. `postCreateCommand` 含全部所需命令（`&&` 串联）。

## 指令

各语言专属修改（按探测结果叠加）：

Python（含自定义版本时改 Dockerfile）：
```dockerfile
RUN uv python install <version> --default
```
扩展：`ms-python.python`、`ms-python.vscode-pylance`、`charliermarsh.ruff`；settings 设 `python.defaultInterpreterPath` 为 `.venv/bin/python`，`[python]` 用 ruff 格式化并 `source.organizeImports: explicit`。
postCreate（有 `pyproject.toml`）：`rm -rf .venv && uv sync && uv run /opt/post_install.py`

Node/TS（基础模板已含 Node 22，无需改 Dockerfile）：
扩展 `dbaeumer.vscode-eslint`、`esbenp.prettier-vscode`；settings 用 prettier 格式化 + `source.fixAll.eslint: explicit`。按 lockfile 选包管理器：
- `pnpm-lock.yaml` → `uv run /opt/post_install.py && pnpm install --frozen-lockfile`
- `yarn.lock` → `... && yarn install --frozen-lockfile`
- `package-lock.json` → `... && npm ci`
- 无 lockfile → `... && npm install`

Rust：feature `"ghcr.io/devcontainers/features/rust:1": {}`；扩展 `rust-lang.rust-analyzer`、`tamasfe.even-better-toml`。postCreate：有 `Cargo.lock` 用 `... && cargo build --locked`，否则 `... && cargo build`。

Go：feature `"ghcr.io/devcontainers/features/go:1": {"version": "latest"}`；扩展 `golang.go`，settings 开 `go.useLanguageServer`。postCreate：`uv run /opt/post_install.py && go mod download`。

持久化卷（`devcontainer.json` 的 `mounts`）：
```json
"mounts": [
  "source={{PROJECT_SLUG}}-<purpose>-${devcontainerId},target=<container-path>,type=volume"
]
```
常见追加：Rust `target=/home/vscode/.cargo`、Go `target=/home/vscode/go`。

## 示例

为一个 Python + Node 双语言项目生成配置：
1. 侦察：`pyproject.toml` 中 `name = "my-project"` → PROJECT_NAME=「My Project」，PROJECT_SLUG=「my-project」。
2. 探测：命中 Python + Node/TS。
3. 合并扩展（python/pylance/ruff + eslint/prettier），合并 settings。
4. `postCreateCommand`（lockfile 为 `package-lock.json`）：
```
rm -rf .venv && uv sync && uv run /opt/post_install.py && npm ci
```
5. 写入 `.devcontainer/` 下 5 个文件，校验 JSON 合法后呈给用户。

## 注意事项

- 启动方式告知用户：VS Code 中「Reopen in Container」；或命令行 `devcontainer up --workspace-folder .`。
- CLI 助手：`.devcontainer/install.sh self-install` 把 `devc` 命令加入 PATH。
- 仅在任务明确落在上述范围内时使用；产物不能替代环境相关的实测、验证与专家评审。
- 缺少必要输入、权限、安全边界或成功标准时，停下来向用户澄清。
- 网络隔离依赖 NET_ADMIN 能力，宿主/平台不支持时需相应降级。

## 互见

- 进阶参考（源仓库 references/）：`dockerfile-best-practices.md`（分层优化、多阶段构建、架构支持）、`features-vs-dockerfile.md`（何时用 devcontainer feature vs 自定义 Dockerfile）。
- 同域「研发/misc」下其他环境搭建类技能。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。原 skill 标注上游来源为 vibeship-spawner-skills（Apache 2.0）。
