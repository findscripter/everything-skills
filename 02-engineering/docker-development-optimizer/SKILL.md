---
name: docker-development-optimizer
title: Docker构建与容器加固
description: 当需要优化 Dockerfile、编排 docker-compose、落地多阶段构建或排查容器安全/镜像体积/构建缓存问题时使用；做镜像瘦身、分层缓存提速、多阶段拆分、非 root 加固并产出可直接构建的 Dockerfile/compose 与安全审计清单；不适用于 K8s 编排、CI/CD 流水线与应用层漏洞修复（转研发其他技能）。触发词：Dockerfile优化、多阶段构建、docker-compose、容器安全、镜像瘦身、构建缓存
domain: 研发/devops
triggers: [优化这个Dockerfile, Docker构建太慢, 给项目写docker-compose, 这个Dockerfile安全吗, 减小镜像体积, 配置多阶段构建, 容器以root运行怎么办, 镜像超过1GB, 构建缓存失效, Docker最佳实践]
tags: [docker, 容器, dockerfile, docker-compose, 多阶段构建, 镜像优化, 容器安全, devops, 构建缓存, buildkit]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [dockerfile_analyzer.py, compose_validator.py, docker build, docker-compose, BuildKit]
requires: []
related: []
combines_with: []
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

当用户出现以下意图时使用本技能：

- 优化 Dockerfile（体积大、构建慢、缓存频繁失效）
- 新建或改进 docker-compose 编排
- 落地多阶段构建（multi-stage）
- 审计容器/镜像安全、收敛攻击面
- 任何涉及 Dockerfile、compose、镜像体积、构建缓存、容器安全的请求

只要用户有 Dockerfile 或想把项目容器化，即适用。

不该用的边界：
- Kubernetes / Helm 编排、Pod 调度 → 不在本技能范围。
- CI/CD 流水线搭建与部署 → 转「CI/CD 流水线」类技能；本技能只负责把容器构建好。
- 应用层漏洞（SQL 注入、XSS 等）→ 转应用安全技能；本技能只覆盖容器层安全。
- 不是 Docker 入门教程，而是一套关于「怎么构建不浪费时间、空间、攻击面的容器」的明确决策。

## 步骤

本技能有三条工作线，按用户诉求选用。

### A. Dockerfile 优化

1. 分析现状：读 Dockerfile，识别基础镜像及其体积，统计层数（每个 RUN/COPY/ADD = 1 层），找反模式。
2. 按四类清单优化：
   - 基础镜像：用固定 tag（生产禁用 `:latest`）；优先 slim/alpine；CI 中可钉 digest `image@sha256:...`；按运行时实际需要选底座（编译后二进制别用 `python:3.12`）。
   - 分层：相关 RUN 用 `&& \` 合并；变更频率低的层放前面（依赖在源码之前）；包管理缓存在同一 RUN 内清理；用 `.dockerignore` 排除无关文件；构建依赖与运行依赖分离。
   - 构建缓存：先 COPY 依赖清单（package.json / requirements.txt / go.mod）再 COPY 源码；依赖安装独立成层；用 BuildKit 缓存挂载 `--mount=type=cache`；避免在装依赖前 `COPY . .`。
   - 多阶段：阶段一构建（完整 SDK/构建工具/dev 依赖），阶段二运行（最小底座、仅生产产物），`COPY --from=builder` 只取需要的；最终镜像不含构建工具、源码、dev 依赖。
3. 产出优化后的 Dockerfile，对每个关键决策加行内注释，并给出预估体积下降。
4. 校验：`python3 scripts/dockerfile_analyzer.py Dockerfile`。

### B. docker-compose 编排

1. 识别服务：应用（web/API/worker）、数据库、缓存、队列、反向代理。
2. 套用最佳实践：
   - 服务：`depends_on` 配 `condition: service_healthy`；每个服务加 healthcheck；设资源上限 `mem_limit`/`cpus`；持久数据用命名卷；钉镜像版本。
   - 网络：显式声明网络（别依赖默认）；前后端网络分离；只暴露需外部访问的端口；纯内网用 `internal: true`。
   - 环境变量：机密用 `env_file` 而非内联 `environment`；`.env` 不入库（加 .gitignore）；用 `${VAR:-default}` 变量替换；记录所有必需变量。
   - 开发 vs 生产：用 profiles 或 override 文件区分；开发用 bind mount 热重载、开调试端口；生产用命名卷、关调试端口、`restart: unless-stopped`。
3. 产出 docker-compose.yml（含 healthcheck/网络/卷）+ 文档化的 `.env.example`。
4. 校验：`python3 scripts/compose_validator.py docker-compose.yml`（可加 `--strict` 把告警视为失败）。

### C. 容器安全审计

逐项过 Dockerfile 与运行时清单（见下方注意事项的高危表），按严重级别（Critical/High/Medium/Low）出报告，每条给修复建议，结尾统计各级别数量。

## 指令

```bash
# Dockerfile 静态分析（层数、反模式、安全问题，15+ 规则）
python3 scripts/dockerfile_analyzer.py Dockerfile
python3 scripts/dockerfile_analyzer.py Dockerfile --output json
python3 scripts/dockerfile_analyzer.py Dockerfile --security

# compose 校验（依赖、健康检查、网络、卷、端口冲突、最佳实践评分）
python3 scripts/compose_validator.py docker-compose.yml
python3 scripts/compose_validator.py docker-compose.yml --strict

# 启用 BuildKit（缓存挂载、并行阶段的前提）
export DOCKER_BUILDKIT=1
docker build .

# 用 BuildKit secret 注入机密（不落入镜像层）
docker build --secret id=api_key,src=./api_key.txt .
```

## 示例

多阶段构建模板（保留源中三种关键范式）。

Go / Rust / C++（编译型 → distroless）：
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

Node.js / TypeScript（deps → builder → runtime 三段）：
```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --production=false

FROM deps AS builder
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN addgroup -g 1001 -S appgroup && adduser -S appuser -u 1001
COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
USER appuser
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

Python（slim，需 glibc 的 C 扩展场景）：
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

BuildKit 缓存挂载（跨构建复用下载缓存）：
```dockerfile
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r requirements.txt
```

健康检查（HTTP 服务）：
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1
```

## 注意事项

不待用户开口就主动提示（Proactive Triggers）：
- 用了 `:latest` → 建议钉到具体版本 tag。
- 没有 `.dockerignore` → 创建一个，至少含 `.git`、`node_modules`、`__pycache__`、`.env`。
- 装依赖前就 `COPY . .` → 缓存被打穿，重排为先装依赖。
- 以 root 运行 → 加 `USER` 指令，生产无例外。
- 机密写进 ENV / ARG → 改用 BuildKit secret 挂载，绝不把机密烤进层。
- 镜像超过 1GB → 必须多阶段构建，生产镜像没理由这么大。
- 没有 healthcheck → 加上，编排器（Compose、K8s）靠它管理生命周期。
- `apt-get` 未在同层清理 → 同一个 RUN 内 `rm -rf /var/lib/apt/lists/*`。

高危安全项（审计速查）：
- 容器以 root 运行（Critical）→ 创建用户后 `USER nonroot`，或在 compose 设 user。
- 机密在 ENV/ARG（Critical）→ `--mount=type=secret`。
- 挂载敏感路径（Critical）→ 生产绝不挂载 `/etc`、`/var/run/docker.sock`。
- 保留全部 capabilities（High）→ `cap_drop: [ALL]`，仅按需 `cap_add`（如绑定 <1024 端口才加 `NET_BIND_SERVICE`）。
- host 网络模式 / `--privileged`（High）→ 用 bridge 或自定义网络，避免特权。
- 可写根文件系统（Medium）→ compose 设 `read_only: true` 并用 tmpfs 挂 `/tmp`。

基础镜像决策：编译型二进制 → `distroless/static` 或 `scratch`；需 shell 调试 → alpine；需 glibc（如 numpy/pandas 的 C 扩展）→ slim；需大量系统包 → debian-slim。体积参考：scratch 0MB、distroless/static 2MB、alpine 7MB、debian-slim 80MB、python:3.12-slim 130MB；`python:3.12`（900MB）、`node:20`（1000MB）生产禁用。

## 互见

- 研发/devops 其他容器与流水线技能：CI/CD 流水线负责部署本技能产出的容器；本技能不做部署。
- 应用安全技能：覆盖应用层威胁；本技能覆盖容器层加固，二者互补。

---
采编自 alirezarezvani/claude-skills（MIT 许可）。
