---
name: docker-container-optimizer
title: Docker 容器构建与加固
description: 当需要优化 Dockerfile、编排 docker-compose、做多阶段构建或容器安全加固时使用；做镜像瘦身、构建缓存提速、多阶段拆分与 root/密钥/能力等安全审计并产出优化后的 Dockerfile、compose 文件与安全报告；不适用于 Kubernetes 编排、CI/CD 流水线搭建与应用层漏洞修复；触发词：Dockerfile 优化、optimize dockerfile、镜像瘦身 reduce image size、多阶段构建 multi-stage、docker-compose、构建慢 build slow、容器安全 container security
domain: 平台/cloud
triggers: [Dockerfile 优化, optimize dockerfile, 镜像瘦身, reduce image size, 多阶段构建, multi-stage build, docker-compose 编排, 构建慢, docker build slow, 容器安全, container security, 容器加固]
tags: [docker, dockerfile, docker-compose, container, multi-stage-build, image-optimization, container-security, buildkit, cloud, platform]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Docker, Dockerfile, docker-compose, BuildKit, distroless, alpine, dockerfile_analyzer.py, compose_validator.py]
requires: []
related: [docker-expert, docker-development-optimizer, container-security-hardening, kubernetes-architect]
combines_with: [kubernetes-architect, github-actions-author, container-security-hardening]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

适用于：优化某个 Dockerfile（瘦身/提速/层缓存）、编写或改进 docker-compose.yml、实现多阶段构建、审计容器安全、降低镜像体积、落地生产级容器约定。识别信号：用户手上有 Dockerfile，或想把某个项目容器化；提到镜像大、构建慢、是否安全、是否以 root 运行等。

不该用：不负责 Kubernetes / Helm 集群编排，不搭建 CI/CD 流水线本身（只产出被流水线消费的镜像），不做应用层代码漏洞修复（那属于代码审计/安全审查范畴）。这些场景应转交对应技能或人工处理。

## 步骤

三条主线，按需求选其一或组合。

1. 优化 Dockerfile：读取现有文件 → 识别基础镜像及体积 → 数层（每个 RUN/COPY/ADD 算 1 层）→ 对照反模式 → 套用「基础镜像 / 层优化 / 构建缓存 / 多阶段」四项清单 → 输出带注释的新 Dockerfile 并估算体积降幅 → 用分析脚本校验。
2. 编排 compose：梳理服务（应用、数据库、缓存、队列、反向代理）→ 套用「服务 / 网络 / 环境 / 开发vs生产」清单 → 产出含 healthcheck、显式网络、命名卷的 compose 文件，并生成 `.env.example`。
3. 安全审计：分别做 Dockerfile 静态审计与运行时审计 → 按严重级（Critical/High/Medium/Low）汇总 → 输出安全报告与修复建议。

## 指令

核心优化决策（保留源约束）：

```
基础镜像
├── 用具体 tag，生产环境绝不用 :latest
├── 优先 slim/alpine（debian-slim > ubuntu > debian）
├── CI 中固定 digest 保证可复现：image@sha256:...
└── 基础镜像匹配运行需求（编译型二进制别用 python:3.12）

层优化 / 构建缓存
├── 相关 RUN 用 && \ 合并；最少变动的层放最前（依赖先于源码）
├── 包管理器缓存在同一 RUN 内清理（apt 用 rm -rf /var/lib/apt/lists/*）
├── 依赖清单（package.json / requirements.txt / go.mod）先于源码 COPY
├── 启用 BuildKit 缓存挂载：--mount=type=cache,target=/root/.cache
└── 避免在装依赖前就 COPY . .；用 .dockerignore 排除无关文件

多阶段构建
├── 阶段1 build：完整 SDK / 构建工具 / dev 依赖
├── 阶段2 runtime：最小基础镜像，仅生产产物
├── COPY --from=builder 只拷必需文件
└── 终镜像不含构建工具、源码、dev 依赖
```

校验脚本（来自源仓库 scripts/）：

```bash
python3 scripts/dockerfile_analyzer.py Dockerfile            # 层数与反模式
python3 scripts/dockerfile_analyzer.py Dockerfile --security # 安全聚焦
python3 scripts/dockerfile_analyzer.py Dockerfile --output json
python3 scripts/compose_validator.py docker-compose.yml --strict
```

安全高频项与修复：以 root 运行 → 建用户后 `USER nonroot`（Critical）；ENV/ARG 藏密钥 → 改 BuildKit `--mount=type=secret`（Critical）；保留全部能力 → `cap_drop: [ALL]` 仅按需加回（High）；可写根文件系统 → compose `read_only: true`（Medium）；缺 HEALTHCHECK → 补上（Medium）。绝不在生产挂载 `/etc`、`/var/run/docker.sock`。

基础镜像选型：编译型二进制 → distroless/static 或 scratch；需调试 shell → alpine；需 glibc → slim；需较多系统包 → debian-slim，否则 alpine + apk add。

## 示例

Go 多阶段（编译型，终镜像 distroless）：

```dockerfile
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -ldflags="-s -w" -o /app/server ./cmd/server

FROM gcr.io/distroless/static-debian12
COPY --from=builder /app/server /server
USER nonroot:nonroot
ENTRYPOINT ["/server"]
```

Python 多阶段（builder 装到 /install，runtime 拷贝并切非 root 用户）：

```dockerfile
FROM python:3.12-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

FROM python:3.12-slim
WORKDIR /app
RUN groupadd -r appgroup && useradd -r -g appgroup appuser
COPY --from=builder /install /usr/local
COPY . .
USER appuser
EXPOSE 8000
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Node.js 模式同理：deps → builder → runtime 三阶段，runtime 仅拷 `dist` 与 `node_modules`，建 1001 uid 的 appuser 并 `USER appuser`。

## 注意事项

主动发现并主动指出（无需用户问）：用了 `:latest` → 建议钉死版本 tag；无 `.dockerignore` → 至少排除 `.git`、`node_modules`、`__pycache__`、`.env`；装依赖前 `COPY . .` → 缓存击穿，重排序让依赖先装；以 root 运行 → 加 `USER`，生产无例外；密钥进 ENV/ARG → 改 BuildKit secret 挂载，绝不烤进层；镜像超 1GB → 必须多阶段；无 healthcheck → 补上，编排器（Compose/K8s）依赖它管理生命周期；`apt-get` 未在同层清理 → 同一 RUN 内 `rm -rf /var/lib/apt/lists/*`。

## 互见

- code-reviewer：审查容器内运行的应用代码本身。
- dependency-auditor：审计镜像中打入的第三方依赖与漏洞。

本条采编自 alirezarezvani/claude-skills（MIT）。
