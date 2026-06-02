---
name: docker-expert
title: Docker 容器优化专家
description: 当排查 Docker 构建/镜像/编排/安全问题时使用；做镜像瘦身、多阶段构建、安全加固、Compose 编排与生产部署的诊断与重写，产出优化后的 Dockerfile/Compose 与评审清单；不适用于 K8s 编排、CI/CD 流水线、云厂商容器服务（ECS/Fargate）等深度场景；触发词：Dockerfile、镜像瘦身、多阶段构建、Compose、容器安全、distroless
domain: 研发/devops
triggers: [Dockerfile 优化, 镜像太大/瘦身, 多阶段构建, Docker 构建慢/缓存失效, 容器安全加固, 非 root 用户运行, Docker Compose 编排, 健康检查 healthcheck, distroless / Alpine 选型, 多架构构建 buildx, 构建期密钥 BuildKit secret, 容器资源限制]
tags: [docker, 容器, dockerfile, compose, 镜像优化, 安全加固, 多阶段构建, devops, 研发]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Grep, Glob, Bash]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用于围绕 Docker 容器的优化、加固与编排问题：

- 镜像体积过大（如超过 1GB）、部署缓慢，需要瘦身。
- 构建慢（10 分钟以上）、缓存频繁失效，需要优化分层与缓存。
- 需要把单阶段 Dockerfile 改写为多阶段构建，分离构建期与运行期。
- 容器以 root 运行、密钥泄漏、镜像存在漏洞，需要安全加固。
- 编写或修复 Docker Compose 编排（依赖顺序、网络隔离、卷持久化、资源限制）。
- 配置开发态热重载、调试端口与多环境（dev/staging/prod）差异。
- 评审他人的 Dockerfile / Compose 配置。

**不该用（应转交他人）：**
- Kubernetes 编排、Pod / Service / Ingress → 交给 Kubernetes 专家。
- 容器化的 CI/CD（GitHub Actions 等）流水线 → 交给 CI/CD 专家。
- AWS ECS/Fargate 等云厂商容器服务、Terraform 基础设施 → 交给 DevOps 专家。
- 数据库容器化中复杂的持久化与备份策略 → 交给数据库专家。
- 应用代码级（语言层）性能问题 → 交给对应语言专家。

遇到上述场景应明确建议切换并停止，例如：「这属于 Kubernetes 编排范畴，建议改用 kubernetes 专家。这里先停。」

## 步骤

1. **优先用内置工具勘察（Read / Grep / Glob 性能更好，shell 命令仅作兜底）。** 检测 Docker 环境与项目结构：

```bash
# 环境检测
docker --version 2>/dev/null || echo "未安装 Docker"
docker info | grep -E "Server Version|Storage Driver|Container Runtime" 2>/dev/null

# 项目结构
find . -name "Dockerfile*" -type f | head -10
find . -name "*compose*.yml" -o -name "*compose*.yaml" -type f | head -5
find . -name ".dockerignore" -type f | head -3

# 运行中状态
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}" 2>/dev/null | head -10
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" 2>/dev/null | head -10
```

2. **顺应现有约定**：匹配已有 Dockerfile 模式与基础镜像、尊重已有多阶段约定、区分开发与生产环境、考虑已有编排（Compose/Swarm）。

3. **定位问题类别与复杂度**，从下方核心领域选取对应策略。

4. **彻底验证**（改完必做）：

```bash
# 构建与安全
docker build --no-cache -t test-build . 2>/dev/null && echo "构建成功"
docker history test-build --no-trunc 2>/dev/null | head -5
docker scout quickview test-build 2>/dev/null || echo "无 Docker Scout"

# 运行期
docker run --rm -d --name validation-test test-build 2>/dev/null
docker exec validation-test ps aux 2>/dev/null | head -3
docker stop validation-test 2>/dev/null

# Compose 校验
docker-compose config 2>/dev/null && echo "Compose 配置有效"
```

## 指令

按问题类别套用对应策略：

- **分层缓存**：依赖安装与源码拷贝分离，依赖（package*.json 等）先拷贝、先安装，再拷贝源码，最大化缓存命中。
- **多阶段构建**：拆 deps / build / runtime 三段，运行阶段只拷贝必要产物，缩小生产镜像同时保留构建灵活性。
- **基础镜像选型**：按需在 Alpine / distroless / scratch 间权衡；运行期优先 distroless 或 slim。
- **安全加固**：创建带固定 UID/GID 的非 root 用户并 `USER` 切换；密钥用 Docker secrets 或 BuildKit 构建期 secret，**绝不**写入 ENV 或镜像层；只装必要包以缩小攻击面。
- **镜像瘦身**：合并 RUN、同层清理包管理器缓存、选择性拷贝产物、用 distroless。
- **编排**：用 healthcheck + `depends_on: condition: service_healthy` 控制启动顺序；自定义网络做隔离（后端网络 `internal: true`）；命名卷做持久化；`deploy.resources` 设资源上下限与重启策略。
- **开发态**：用 compose override 挂载源码卷、暴露调试端口、设 `NODE_ENV=development`。
- **跨平台/缓存/密钥**：分别用 buildx 多架构、`--mount=type=cache`、`--mount=type=secret`。

## 示例

**优化的多阶段构建（含非 root、健康检查）：**

```dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --production

FROM node:18-alpine AS runtime
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
WORKDIR /app
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nextjs:nodejs /app/dist ./dist
COPY --from=build --chown=nextjs:nodejs /app/package*.json ./
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
CMD ["node", "dist/index.js"]
```

**最小化生产镜像（distroless）：**

```dockerfile
FROM gcr.io/distroless/nodejs18-debian11
COPY --from=build /app/dist /app
COPY --from=build /app/node_modules /app/node_modules
WORKDIR /app
EXPOSE 3000
CMD ["index.js"]
```

**生产级 Compose（健康检查 + 网络隔离 + 资源限制 + 外部密钥）：**

```yaml
version: '3.8'
services:
  app:
    build:
      context: .
      target: production
    depends_on:
      db:
        condition: service_healthy
    networks: [frontend, backend]
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    deploy:
      resources:
        limits:   { cpus: '0.5', memory: 512M }
        reservations: { cpus: '0.25', memory: 256M }
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB_FILE: /run/secrets/db_name
      POSTGRES_USER_FILE: /run/secrets/db_user
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets: [db_name, db_user, db_password]
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks: [backend]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
networks:
  frontend: { driver: bridge }
  backend:  { driver: bridge, internal: true }
volumes:
  postgres_data:
secrets:
  db_name:     { external: true }
  db_user:     { external: true }
  db_password: { external: true }
```

**进阶片段：**

```bash
# 多架构构建
docker buildx create --name multiarch-builder --use
docker buildx build --platform linux/amd64,linux/arm64 -t myapp:latest --push .
```

```dockerfile
# 包管理器缓存挂载（BuildKit）
RUN --mount=type=cache,target=/root/.npm npm ci --only=production
# 构建期密钥（BuildKit），绝不落层
RUN --mount=type=secret,id=api_key \
    API_KEY=$(cat /run/secrets/api_key) && echo use-it
```

## 注意事项

**评审清单（核心约束）：**
- 依赖先于源码拷贝以优化分层缓存；多阶段分离构建与运行；生产阶段只含必要产物。
- 基础镜像选型合理；同层清理包管理器缓存；按需合并 RUN。
- 创建固定 UID/GID 的非 root 用户并用 `USER` 运行；密钥不入 ENV 与镜像层；基础镜像保持更新并扫描漏洞；最小攻击面。
- 服务依赖配 healthcheck；后端用 `internal: true` 内部网络隔离；卷策略匹配持久化需求；设资源上下限与重启策略。
- 暴露端口仅限必要服务；多环境（dev/prod）配置分离。

**常见问题速诊：**
- 构建慢 / 缓存频繁失效 → 分层顺序差、构建上下文大、无缓存策略 → 多阶段 + `.dockerignore` + 依赖缓存。
- 安全扫描失败 / 密钥暴露 / root 运行 → 基础镜像过旧、硬编码密钥、默认用户 → 定期更新 + 密钥管理 + 非 root。
- 镜像超 1GB → 多余文件、生产含构建工具、基础镜像选错 → distroless + 多阶段 + 选择性拷贝。
- 服务通信失败 / DNS 解析错 → 缺网络、端口冲突、命名问题 → 自定义网络 + 健康检查 + 规范服务命名。
- 热重载失败 / 调试困难 → 卷挂载问题、端口配置、环境不一致 → 独立开发 target + 正确卷策略 + 调试配置。

**通用底线：** 输出不能替代针对具体环境的验证、测试与专家评审；缺少必要输入、权限、安全边界或成功标准时，停下来澄清。

## 互见

- Kubernetes 专家：Pod / Service / Ingress 编排。
- CI/CD（GitHub Actions）专家：容器构建自动化与部署流水线。
- DevOps 专家：Terraform、云厂商容器服务（ECS/Fargate）。
- 数据库专家：复杂持久化与备份策略。
- 各语言专家：代码级性能问题；可由本技能产出的优化基础镜像作为协作基线。

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
