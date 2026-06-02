---
name: container-security-hardening
title: 容器镜像与运行时安全加固
description: 当审查 Dockerfile 安全、修复容器 CVE、扫描镜像或为生产做容器加固时使用；做从镜像构建、扫描、运行时强制到供应链与 K8s Pod 安全的五层加固，产出加固 Dockerfile/Compose/K8s 清单与扫描签名流程；不适用于通用 Docker 用法、CI/CD 流水线本身或应用层安全（SQL 注入/XSS）；触发词：Dockerfile 安全、distroless、Trivy、seccomp、Cosign、Pod Security
domain: 安全/ops
triggers: [Docker 安全, 容器加固, Dockerfile 安全审查, distroless, 非 root 容器, 只读文件系统, Trivy 扫描, Grype, 镜像 CVE, 修复容器 CVE, SBOM, Cosign 签名, seccomp, AppArmor, Linux capabilities, Kubernetes Pod 安全, NetworkPolicy, RBAC 加固, Kyverno, 减少镜像攻击面]
tags: [安全, 容器, Docker, Kubernetes, 供应链安全, 镜像扫描, 运行时安全, DevSecOps]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Trivy, Grype, Syft, Hadolint, Cosign, Docker, Docker Compose, Kubernetes, Kyverno, TruffleHog]
requires: []
related: [k8s-security-policies, cloud-misconfig-auditor, dependency-auditor, docker-development-optimizer]
combines_with: [k8s-security-policies, dependency-auditor, docker-development-optimizer]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用场景：
- 审查 Dockerfile 安全性（"我的 Dockerfile 安全吗？""如何减小攻击面？"）。
- 想用 distroless、非 root、只读文件系统加固镜像。
- 用 Trivy / Grype / Snyk 扫描镜像 CVE，或修复容器 CVE。
- 涉及 seccomp、AppArmor、Linux capabilities 等运行时安全。
- 用 Cosign 签名/验签、生成 SBOM。
- Kubernetes Pod 安全、NetworkPolicy、RBAC 加固。

不该用（负边界）：
- 只是通用 Docker 用法（非安全）→ 用 `docker-expert`。
- 主要问 CI/CD 流水线（GitHub Actions 等）→ 用 `github-actions-advanced`。
- K8s 编排架构（超出安全范畴）→ 用 `kubernetes-architect`。
- 应用层安全（SQL 注入、XSS、认证）→ 用 `api-security-best-practices`。

注意：seccomp / AppArmor 仅 Linux 可用；本技能不替代渗透测试或正式安全审计。

## 步骤

按五层顺序推进，先加固镜像收益最大：

1. **镜像构建**：最小基础镜像、无密钥、非 root、可只读 FS。
2. **镜像扫描**：CVE 扫描、SBOM、密钥检测、Dockerfile lint。
3. **运行时安全**：capabilities、seccomp、AppArmor、资源限制。
4. **供应链**：镜像签名、digest 钉死、可信镜像仓库。
5. **Kubernetes 层**：Pod Security Admission、NetworkPolicy、RBAC、Kyverno。

先探测现状再给建议：识别技术栈（Node/Python/Go/Java，决定基础镜像）、是 Docker-only 还是 K8s 部署、CI 平台、现有基础镜像离最佳实践有多远。

```bash
# 找 Dockerfile
find . -name "Dockerfile*" -not -path "*/node_modules/*" | head -10
# 检查已有安全工具配置
ls .trivyignore .hadolint.yaml .snyk docker-compose*.yml 2>/dev/null
# 查看当前基础镜像
grep -r "^FROM" $(find . -name "Dockerfile*") 2>/dev/null
```

## 指令

### Layer 1：Dockerfile 加固

- **最小基础镜像**：避免 `ubuntu:latest` / `node:20`（~100–200 CVE）；优先 `*-slim`，最佳用 distroless（无 shell/包管理器、内置 nonroot），全静态二进制用 `scratch`。
  ```dockerfile
  # 最佳
  FROM gcr.io/distroless/nodejs20-debian12
  FROM gcr.io/distroless/static-debian12   # Go/Rust 全静态
  ```
- **多阶段构建**：构建工具/编译器/devDeps 绝不进生产镜像。
- **非 root 运行**：`CMD/ENTRYPOINT` 前切换 `USER`；distroless 内置 `nonroot`（UID 65532）。
  ```dockerfile
  RUN groupadd -r appgroup --gid 10001 && \
      useradd -r -g appgroup --uid 10001 --no-log-init appuser
  USER appuser
  ```
- **基础镜像钉死 digest**：tag 可变易被供应链攻击覆盖，用 `@sha256:` 不可变摘要；用 Renovate/Dependabot 自动钉死（`.renovaterc.json` 设 `"pinDigests": true`）。
  ```bash
  docker inspect node:20-slim --format='{{index .RepoDigests 0}}'
  ```
- **绝不把密钥烤进镜像**：`ENV`/`ARG`/`RUN` 中的密钥会泄露在 `docker history` 与层缓存里；用 BuildKit 密钥挂载：
  ```dockerfile
  # syntax=docker/dockerfile:1
  RUN --mount=type=secret,id=api_token \
      curl -H "Authorization: Bearer $(cat /run/secrets/api_token)" https://api.example.com/config > config.json
  ```
  构建：`docker build --secret id=api_token,src=./token.txt .`
- **exec 形式 + HEALTHCHECK**：`ENTRYPOINT ["node","server.js"]`（非 shell 形式）。
- **.dockerignore** 排除 `.git`、`.env`、`*.pem`、`*.key`、`node_modules`、`tests/` 等。

### Layer 2：镜像扫描

```bash
# Trivy（推荐）：CI 上对 HIGH/CRITICAL 失败
trivy image --exit-code 1 --severity HIGH,CRITICAL myapp:latest
trivy config ./Dockerfile                      # 扫 Dockerfile 配置
trivy fs --scanners vuln,secret,misconfig .    # 全仓库
trivy image --format cyclonedx --output sbom.json myapp:latest   # SBOM
trivy image --scanners secret myapp:latest     # 密钥扫描
# Grype 备选
grype myapp:latest --fail-on critical
grype myapp:latest -o sarif > results.sarif
# Hadolint lint Dockerfile
docker run --rm -i hadolint/hadolint < Dockerfile
```
对无法修复的 CVE 用 `.trivyignore` 并写明豁免理由。

### Layer 3：运行时安全

```bash
docker run \
  --read-only --tmpfs /tmp:noexec,nosuid,size=100m \
  --user 10001:10001 \
  --cap-drop ALL --cap-add NET_BIND_SERVICE \
  --security-opt no-new-privileges:true \
  --security-opt seccomp=seccomp.json \
  --pids-limit 100 --memory 512m --memory-swap 512m --cpus 1.0 \
  myapp:latest
```
- **Capabilities**：先 `--cap-drop ALL`，仅按需加回。多数 Web 应用零 capability 即可；`SYS_ADMIN` 最危险，几乎总能避免。
- Docker default seccomp 已拦截 ~44 个危险 syscall；更严格时用 `strace -c` 或 `sysdig` 审计应用真正调用的 syscall 再裁剪自定义 profile。

### Layer 4：供应链安全

```bash
# Cosign 无密钥签名（OIDC，无长期密钥）
cosign sign ghcr.io/org/myapp:latest
cosign verify ghcr.io/org/myapp:latest \
  --certificate-identity-regexp="https://github.com/org/repo" \
  --certificate-oidc-issuer="https://token.actions.githubusercontent.com"
# SBOM + 证明
syft myapp:latest -o cyclonedx-json > sbom.json
cosign attest --predicate sbom.json --type cyclonedx ghcr.io/org/myapp:latest
```
用可信仓库并开启仓库扫描（ECR 增强扫描 / GCP Container Analysis 等）；用 Kyverno `verifyImages` 做准入控制，阻止未签名镜像。

### Layer 5：Kubernetes Pod 安全

securityContext 关键字段：`runAsNonRoot: true` + 显式 UID、`readOnlyRootFilesystem: true`、`allowPrivilegeEscalation: false`、`capabilities.drop: ["ALL"]`、`seccompProfile.type: RuntimeDefault`、`automountServiceAccountToken: false`，并设置 resources requests/limits，可写路径用 `emptyDir`（medium: Memory）。
```bash
# PSA：先审计再强制
kubectl label namespace production pod-security.kubernetes.io/audit=restricted
kubectl label namespace production pod-security.kubernetes.io/enforce=restricted
```
- **NetworkPolicy** 先默认拒绝（podSelector: {} + Ingress/Egress），再按需放行；Egress 仅放行 kube-dns 53/UDP+TCP。
- **RBAC** 最小权限：锁定 `resourceNames`，verbs 用 `["get"]` 而非 `["*"]`；`kubectl auth can-i --list --as=system:serviceaccount:...` 审计。
- **Kyverno** 常用策略：require-non-root、require-image-digest（`image: "*@sha256:*"`）、disallow-privileged。

## 示例

完整加固 Dockerfile（Node 多阶段 + distroless + 钉死 digest）：

```dockerfile
# syntax=docker/dockerfile:1
FROM node:20-slim AS builder
WORKDIR /build
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .
RUN npm run build && npm prune --production

FROM gcr.io/distroless/nodejs20-debian12@sha256:<pin-digest-here>
LABEL org.opencontainers.image.source="https://github.com/org/repo"
LABEL org.opencontainers.image.licenses="MIT"
WORKDIR /app
COPY --from=builder --chown=nonroot:nonroot /build/dist        ./dist
COPY --from=builder --chown=nonroot:nonroot /build/node_modules ./node_modules
USER nonroot:nonroot
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["node","-e","require('http').get('http://localhost:3000/health',r=>process.exit(r.statusCode===200?0:1))"]
CMD ["dist/server.js"]
```

Go/Rust 全静态二进制用 `FROM scratch` + 拷贝 `ca-certificates.crt` + `USER 65532:65532`，零攻击面。

## 注意事项

常见坑与修复：
- 镜像以 root 运行 → 缺 `USER`，加 `useradd` + `USER appuser`。
- 密钥出现在 `docker history` → 改用 `RUN --mount=type=secret`。
- 镜像大、CVE 多 → 换 `*-slim` 或 distroless。
- `--read-only` 后应用崩溃 → 写 `/tmp`，加 `--tmpfs /tmp`（K8s 用 `emptyDir`）。
- Trivy 因不可修复 CVE 卡 CI → 加带理由的 `.trivyignore`。
- tag 镜像随时间漂移 → 钉 `@sha256:`，用 Renovate 更新。
- K8s Pod 被 PSA 拒绝 → 补 `runAsNonRoot`、`readOnlyRootFilesystem`、`allowPrivilegeEscalation: false`。

边界提醒：seccomp/AppArmor 仅 Linux；macOS/Windows Docker Desktop 机制不同。本技能输出不替代环境相关的渗透测试或正式安全审计。缺少必要输入、权限、安全边界或成功标准时应停下来澄清。

## 互见

- `docker-expert` — 通用 Docker 用法、Compose 编排、镜像优化。
- `github-actions-advanced` / `gha-security-review` — CI 流水线与 Actions 安全审计。
- `kubernetes-architect` — 完整 K8s 架构（非仅安全）。
- `api-security-best-practices` — 应用层安全（注入、认证、OWASP）。
- `k8s-security-policies` — 扩展的 K8s 安全策略。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
