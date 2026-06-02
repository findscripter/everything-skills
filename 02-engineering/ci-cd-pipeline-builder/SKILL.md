---
name: ci-cd-pipeline-builder
title: CI/CD流水线生成
description: 当为新仓库搭建CI、重构脆弱流水线或跨仓库统一部署流程时使用；基于检测到的技术栈信号生成GitHub Actions/GitLab CI起步流水线（含缓存、矩阵、环境感知部署阶段）；不适用于已有成熟流水线的细粒度调优或非CI/CD的通用脚本编写；触发词：ci/cd、流水线、github actions、gitlab ci、自动化部署、构建发布
domain: 研发/devops
triggers: [CI/CD, 流水线, pipeline, GitHub Actions, GitLab CI, 自动化部署, 构建发布, lint/test/build, 部署门禁, 技术栈检测]
tags: [devops, ci-cd, github-actions, gitlab-ci, 自动化, 部署, 研发效能]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Bash, Read, Write, Glob]
requires: []
related: []
combines_with: []
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

适用场景：

- 为新仓库从零搭建 CI（lint/test/build 基线）。
- 替换从其它项目复制来的脆弱、不匹配的流水线文件。
- 在 GitHub Actions 与 GitLab CI 之间迁移。
- 审计现有流水线步骤是否与真实技术栈一致。
- 在做自定义加固前，先生成一个可复现的基线。

不该用的边界：

- 已有成熟、稳定流水线，只需做细粒度性能调优或某一步排障时（应直接改对应步骤，而非重新生成）。
- 与 CI/CD 无关的通用 Shell/构建脚本编写。
- 需要平台特有高级特性（复杂 OIDC 联邦、自托管 Runner 编排等）的深度定制——本技能产出基线，进阶能力需逐项叠加。

核心原则：**先检测技术栈，再生成流水线**，用确定性的文件信号代替猜测。

## 步骤

1. **检测技术栈**：从仓库文件（锁文件、语言清单、脚本命令）识别语言/运行时/工具链，输出机器可读结果供后续自动化使用。
2. **生成流水线**：将检测结果喂给生成器，产出 GitHub Actions 或 GitLab CI 的起步 YAML，并写入对应路径（`.github/workflows/ci.yml` 或 `.gitlab-ci.yml`）。
3. **合并前校验**：确认 `lint`/`test`/`build` 命令在项目中真实存在，本地尽量跑通生成的流水线，文档化所需 secrets/env，部署任务用受保护分支/环境门禁。
4. **安全地叠加部署阶段**：从仅 CI（lint/test/build）起步 → 加 staging 部署（显式环境上下文）→ 加 production 部署（人工审批门禁），rollout/rollback 命令保持显式可审计。

## 指令

检测技术栈（文本或 JSON 输出，JSON 可落盘供生成器复用）：

```bash
python3 scripts/stack_detector.py --repo . --format text
python3 scripts/stack_detector.py --repo . --format json > detected-stack.json
```

支持通过 stdin 或 `--input` 文件传入离线分析载荷。

从检测结果生成流水线：

```bash
python3 scripts/pipeline_generator.py \
  --input detected-stack.json \
  --platform github \
  --output .github/workflows/ci.yml \
  --format text
```

直接端到端从仓库生成（GitLab 示例）：

```bash
python3 scripts/pipeline_generator.py --repo . --platform gitlab --output .gitlab-ci.yml
```

查看脚本接口：`python3 scripts/stack_detector.py --help` / `python3 scripts/pipeline_generator.py --help`。

检测启发式（优先确定性文件信号）：锁文件决定包管理器偏好；语言清单决定运行时家族；脚本命令（若存在）驱动 lint/test/build 命令；缺失脚本时回退为保守的占位命令。

## 示例

GitHub Actions Node.js 基线（含 npm 缓存）：

```yaml
name: Node CI
on: [push, pull_request]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
```

Python 基线（setup-python + pytest）：

```yaml
name: Python CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - run: python3 -m pip install -U pip
      - run: python3 -m pip install -r requirements.txt
      - run: python3 -m pytest
```

部署门禁策略（最小约束）：`lint` 先于 `test`，`test` 先于 `build`，部署任务必须依赖 `build` 产物，生产部署需人工审批 + 受保护分支。环境模式：`develop` → 自动部署 staging；`main` → 人工晋升 production。每个部署任务都应定义 rollback 命令或回滚流程引用。

## 注意事项

常见坑：

1. 把 Node 流水线直接套进 Python/Go 仓库。
2. 测试尚不稳定就启用部署任务。
3. 忘记设置依赖缓存 key。
4. 对每个琐碎分支都跑昂贵的矩阵构建。
5. 生产部署任务缺少分支保护。
6. 把 secrets 硬编码进 YAML，而非用 CI secret 仓库。

最佳实践：

- 先检测后生成；生成的基线纳入版本控制。
- 一次只加一项优化（缓存 / 矩阵 / 拆分任务）。
- 部署前要求 CI 全绿；生产凭据放受保护环境。
- 技术栈发生显著变化时重新生成流水线。
- 单任务运行超过 10 分钟时按阶段拆分；确有兼容性需求才引入测试矩阵；部署任务与 CI 任务分离以保持反馈快速；把流水线时长与不稳定率当作一等指标跟踪。

校验清单：YAML 能成功解析 / 所有引用命令在仓库中存在 / 缓存策略匹配包管理器 / 所需 secrets 已文档化而非内嵌 / 分支与受保护环境规则符合组织策略。

平台选型：GitHub Actions 适合紧密集成 GitHub 生态；GitLab CI 适合自托管环境下 SCM+CI 一体化；每仓库保持一份权威流水线源以减少漂移。

## 互见

- references/github-actions-templates.md：GitHub Actions 模板
- references/gitlab-ci-templates.md：GitLab CI 模板
- references/deployment-gates.md：部署门禁与回滚约束

---

采编自 alirezarezvani/claude-skills（MIT 许可证）。
