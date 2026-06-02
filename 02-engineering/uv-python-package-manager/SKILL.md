---
name: uv-python-package-manager
title: uv 高速 Python 包管理
description: 当用 Python 建项目、装依赖、管虚拟环境/解释器或需可复现锁文件时使用；用 Rust 编写的 uv 替代 pip/poetry/pip-tools，做项目初始化、依赖增删锁定、Python 版本固定与 CI/Docker 提速，产出 pyproject.toml + uv.lock；不适用于 conda 生态、非 Python 包管理或运行时性能调优；触发词：uv、uv add、uv sync、pyproject、虚拟环境、锁文件
domain: 研发/backend
triggers: [uv, uv add, uv sync, uv venv, uv lock, uv init, pyproject.toml, uv.lock, 虚拟环境, 锁文件, Python 包管理, pip 替代, poetry 迁移, uv python pin]
tags: [python, 包管理, 依赖管理, 虚拟环境, uv, 锁文件, ci, docker]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [uv, python]
requires: []
related: [async-python-patterns, python-performance-optimization, fastapi-async-api, python-testing-pytest]
combines_with: [django-async-pro, docker-development-optimizer, ci-cd-pipeline-builder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
# uv 高速 Python 包管理

uv 是 Astral 用 Rust 写的极速 Python 包管理器（比 pip 快 10-100x），一把刀覆盖：项目初始化、依赖解析/安装、虚拟环境、Python 解释器安装、锁文件。可作为 pip / pip-tools / poetry 的替代。

## 何时使用

- 新建 Python 项目、快速搭脚手架（`uv init`）。
- 增删/升级/锁定依赖，需要可复现构建（`uv.lock`）。
- 创建管理虚拟环境、安装/固定 Python 解释器版本。
- 从 pip / pip-tools / poetry 迁移。
- 给 CI/CD 与 Docker 构建提速（全局缓存 + `--frozen`）。
- monorepo 多包工作区管理。

**不该用**：与 Python 包管理无关；需要 conda 生态/非 Python 系统包；只想做运行时性能调优（看 `python-performance-optimization`）；无网且缓存为空时仍要联网解析。

## 步骤 / 指令

新项目标准流程：
1. `uv init my-project && cd my-project` —— 生成 `pyproject.toml`、`.python-version`、`README.md`、`.gitignore`。
2. `uv python pin 3.12` —— 固定 Python 版本（写入 `.python-version`）。
3. `uv add <pkg>` 加生产依赖；`uv add --dev pytest ruff` 加开发依赖。
4. `uv run <cmd>` 执行命令，自动建/激活 venv，**无需手动 activate**。
5. 提交 `pyproject.toml` 与 `uv.lock` 入版本库。

接手已有项目：`git clone` 后 `uv sync`（按锁文件装齐，自动建 venv）；`uv sync --all-extras` 含可选组；`uv lock --upgrade` 升级。

关键命令速查：
- 依赖：`uv add` / `uv remove` / `uv add --upgrade <pkg>` / `uv sync` / `uv lock`
- 环境：`uv venv [--python 3.12]` / `uv run <cmd>`
- Python：`uv python install 3.12` / `uv python list` / `uv python pin 3.12`
- pip 兼容层：`uv pip install -r requirements.txt` / `uv pip freeze` / `uv pip list`
- 导出/缓存：`uv export --format requirements-txt > requirements.txt` / `uv cache clean` / `uv cache dir`

## 示例

安装与建项目：
```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh
# Windows (PowerShell)
powershell -ExecutionPolicy Bypass -c "irm https://astral.sh/uv/install.ps1 | iex"
uv --version

uv init my-project && cd my-project
uv python pin 3.12
uv add fastapi uvicorn pydantic
uv add --dev pytest ruff mypy
uv run pytest
```

带约束/来源的依赖：
```bash
uv add "django>=4.0,<5.0"
uv add git+https://github.com/user/repo.git@v1.0.0
uv add -e ./local-package        # 可编辑本地包
```

CI（GitHub Actions）——缓存 + 冻结安装：
```yaml
- uses: astral-sh/setup-uv@v2
  with: { enable-cache: true }
- run: uv python install 3.12
- run: uv sync --all-extras --dev
- run: uv run pytest
```

Docker 多阶段构建（只拷 venv，runtime 不带 uv）：
```dockerfile
FROM python:3.12-slim AS builder
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-editable

FROM python:3.12-slim
WORKDIR /app
COPY --from=builder /app/.venv .venv
COPY . .
ENV PATH="/app/.venv/bin:$PATH"
CMD ["python", "app.py"]
```

monorepo 工作区（根 `pyproject.toml`）：
```toml
[tool.uv.workspace]
members = ["packages/*"]
```

## 注意事项

- **CI/Docker 必须用 `uv sync --frozen`**：严格按 `uv.lock` 安装、跳过解析，保证可复现；锁文件缺失会失败。
- **提交 `uv.lock`** 进版本库；用 `uv lock --check` 校验是否与 `pyproject.toml` 同步。
- 优先 `uv run` 而非手动激活 venv，避免环境串味。
- 全局缓存默认位于 Linux `~/.cache/uv`、macOS `~/Library/Caches/uv`、Windows `%LOCALAPPDATA%\uv\cache`；磁盘紧张用 `uv cache clean`。
- 离线场景：`uv sync --frozen --offline` 仅从缓存装，缓存未命中会报错。
- poetry 项目可直接 `uv sync`（uv 读 `[project]`）；纯 `[tool.poetry]` 旧式声明需先迁到标准 `[project]`。
- uv 迭代很快，留意命令/标志随版本演进，遇异常先 `uv --version` 比对官方文档。

## 互见

- related：`async-python-patterns` —— 项目就绪后的异步并发编码模式
- related：`python-testing-pytest` —— 用 `uv run pytest` 跑测试的具体写法
- combines_with：`ci-cd-pipeline-builder` —— 把 `uv sync --frozen` 接入流水线
- combines_with：`docker-development-optimizer` —— uv 多阶段镜像的进一步瘦身加固
- combines_with：`dependency-auditor` —— 对 `uv.lock` 做依赖与供应链审计

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
