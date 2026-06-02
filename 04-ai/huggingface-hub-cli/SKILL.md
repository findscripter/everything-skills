---
name: huggingface-hub-cli
title: Hugging Face Hub CLI（hf 命令行）
description: 当需要用 hf 命令行操作 Hugging Face Hub（认证、下载/上传、仓库与缓存、数据集查询、Jobs/Endpoints/Spaces）时使用；做模型/数据集/Space 的拉取上传、repo 管理与计算运维；不适用于 transformers 训练推理代码或非 HF 平台。触发词：hf、huggingface、模型下载/上传、Hub。
domain: 智能/model-ops
triggers: [hf CLI, huggingface, hf download, hf upload, Hugging Face Hub, 模型下载, 数据集下载, 上传模型到 Hub, hf auth login, huggingface-cli]
tags: [huggingface, cli, 模型仓库, 数据集, MLOps, AI/misc]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [hf, hf-mount, curl]
requires: []
related: [huggingface-model-trainer, transformers-js, local-llm-inference, mlops-model-productionizer]
combines_with: [computer-vision-expert, embedding-model-strategies, scikit-learn-ml]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

当你需要通过 `hf` 命令行工具与 Hugging Face Hub 交互时使用，典型场景：

- 登录认证、查看当前账号（`hf auth`）。
- 下载/上传模型、数据集、Space 文件，或管理 repo（创建、删除、分支、标签、PR/讨论）。
- 查询模型/数据集/论文元数据，用 DuckDB 对数据集 parquet 跑 SQL。
- 管理本地缓存、运行 Hub 上的 Jobs、部署 Inference Endpoints、调试 Spaces。

不该用的边界：
- 不用于编写 `transformers`/`datasets` 等 Python 库的训练、微调、推理代码——本技能只覆盖 `hf` CLI 的平台运维操作。
- 不用于非 Hugging Face 平台（如裸 Git LFS 仓库、其他模型市场）。
- 注意 `hf` 已取代废弃的 `huggingface-cli`；旧命令应迁移到 `hf`，且 auth 子命令统一收敛到 `hf auth`（例如 `hf auth whoami`）。

## 步骤

1. 安装：先下载安装脚本、人工审阅、再本地执行，不要直接管道执行。
2. 认证：设置 `HF_TOKEN` 环境变量（推荐）或 `hf auth login`，用 `hf auth whoami` 确认身份。
3. 执行目标操作（下载/上传/管理），需要时加 `--type dataset|space` 指定仓库类型。
4. 用 `hf <command> --help` 查完整选项与示例；批量/脚本场景加 `--format json` 便于解析。

## 指令

安装（下载后审阅再运行）：

```bash
curl -LsSf https://hf.co/cli/install.sh -o /tmp/hf-install.sh && less /tmp/hf-install.sh && bash /tmp/hf-install.sh
```

核心命令（方括号内为常用可选项）：

- `hf auth login` / `hf auth whoami` / `hf auth list` / `hf auth switch` — 认证管理。
- `hf download REPO_ID` — 下载文件 `[--type --revision --include --exclude --local-dir --cache-dir --force-download --dry-run --max-workers]`
- `hf upload REPO_ID` — 单次提交上传文件/文件夹 `[--type --private --include --exclude --commit-message --create-pr]`
- `hf upload-large-folder REPO_ID LOCAL_PATH` — 大文件夹可断点续传上传 `[--type --num-workers]`
- `hf repos create|delete|duplicate|move|settings REPO_ID` / `hf repos branch|tag` — 仓库与分支标签管理。
- `hf models list|info`、`hf datasets list|info|parquet|sql`、`hf spaces list|info` — 查询与检索。
- `hf cache list|prune|rm|verify` — 本地缓存管理。
- `hf jobs run|ps|logs|cancel`、`hf endpoints deploy|list|pause`、`hf discussions`、`hf collections` — 计算与协作运维。
- `hf env` / `hf version` — 环境与版本信息。

通用选项：`--format json|table`（或 `--json`）、`-q/--quiet`、`--revision`（分支/标签/commit）、`--token`（优先用 `HF_TOKEN` 环境变量）、`--type model|dataset|space`。

## 示例

下载某模型到本地目录：

```bash
hf download openai-community/gpt2 --local-dir ./gpt2
```

只下载数据集中的部分文件：

```bash
hf download my-org/my-dataset --type dataset --include "data/*.parquet" --local-dir ./data
```

上传文件夹并自定义提交信息：

```bash
HF_TOKEN=hf_xxx hf upload my-user/my-model ./out --commit-message "add weights"
```

对数据集 parquet 直接跑 SQL（DuckDB）：

```bash
hf datasets sql "SELECT count(*) FROM 'hf://datasets/my-org/my-dataset/**/*.parquet'"
```

把仓库挂载为本地文件系统（按需拉取，无需整体下载），使用 `hf-mount`：

```bash
curl -fsSL https://raw.githubusercontent.com/huggingface/hf-mount/main/install.sh -o /tmp/hf-mount-install.sh && less /tmp/hf-mount-install.sh && sh /tmp/hf-mount-install.sh
hf-mount start repo openai-community/gpt2 /tmp/gpt2        # 只读挂载 repo
hf-mount start --hf-token $HF_TOKEN bucket myuser/my-bucket /tmp/data   # 读写挂载 bucket
hf-mount status        # 查看挂载
hf-mount stop /tmp/data  # 卸载
```

## 注意事项

- 安装脚本务必「先下载、再审阅、后执行」，不要 `curl | bash` 直接执行远程脚本。
- 认证优先使用 `HF_TOKEN` 环境变量，避免在命令行明文传 `--token`（会落入 shell 历史）。
- `hf repos delete` 不可逆；删除前确认 `REPO_ID` 与 `--type`。
- 大目录上传用 `hf upload-large-folder`（可续传），单次提交场景才用 `hf upload`。
- 操作非模型仓库时别忘了 `--type dataset` 或 `--type space`，否则默认按 model 处理。
- 本技能仅在任务明确落在上述范围时使用；其输出不能替代环境内的实际验证、测试与专家评审。若缺少必要的输入、权限、安全边界或成功标准，应先停下来澄清。

## 互见

- transformers / datasets 等 Python 库的训练推理代码：使用对应的建模技能，而非本 CLI 技能。
- Inference Endpoints / Jobs 的深入运维：可结合 `hf endpoints --help`、`hf jobs --help` 的实时帮助。

---

采编自 sickn33/antigravity-awesome-skills（MIT），上游源自 huggingface/skills 的 hf-cli（基于 huggingface_hub v1.8.0 生成）。
