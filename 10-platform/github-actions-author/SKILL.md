---
name: github-actions-author
title: GitHub Actions工作流编写
description: 当需要为仓库搭建 GitHub Actions 持续集成/部署（CI/CD）流水线时使用；产出可直接落地的 .github/workflows/*.yml（测试、构建推送镜像、K8s 部署、矩阵构建、安全扫描、可复用工作流、审批门禁）；不适用于 GitLab CI、Jenkins 等非 GitHub 平台或运行时业务代码；触发词：github actions、workflow、工作流、ci/cd、流水线、自动化测试部署、matrix matrix构建、可复用工作流
domain: 平台/integration
triggers: [github actions, workflow, 工作流, ci/cd, 流水线, 自动化测试部署, matrix, 矩阵构建, 可复用工作流, github-actions-author]
tags: [github-actions, ci-cd, devops, workflow, docker, kubernetes, security-scan, yaml, integration]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [GitHub Actions, actions/checkout, actions/setup-node, actions/setup-python, docker/build-push-action, docker/metadata-action, kubectl, aws-eks, aquasecurity/trivy-action, github/codeql-action, snyk, slackapi/slack-github-action]
requires: []
related: [ci-cd-pipeline-builder, deployment-engineer, gitops-argocd-flux, git-hooks-automation]
combines_with: [docker-container-optimizer, terraform-specialist, release-manager]
license: MIT
source: wshobson/agents
source_license: MIT
---
## 何时使用

适用于为 GitHub 托管仓库编写 `.github/workflows/*.yml`，实现自动化测试、构建并推送容器镜像、部署到 Kubernetes、跑安全扫描、矩阵多环境构建、抽取可复用工作流、生产审批门禁等场景。

不该用：目标平台是 GitLab CI、Jenkins、CircleCI、Azure Pipelines 等非 GitHub Actions（改用对应平台技能）；只是编写应用业务代码或本地脚本而不涉及 CI/CD 编排；需要的是流水线整体架构设计而非具体工作流文件落地。

## 步骤

1. 明确触发条件：`push`/`pull_request` 的分支、`tags`、`workflow_call`（可复用）或 `workflow_dispatch`（手动）。
2. 选 runner：`ubuntu-latest` 为默认；跨平台需求用 matrix 列 `os`。
3. 编排 jobs 与 steps：第一步固定 `actions/checkout@v4`，再按需 setup 语言、装依赖、跑测试/构建/部署。
4. 按最小权限声明 `permissions`，敏感值一律走 `secrets`。
5. 配缓存（`cache: "npm"` 或 `cache-from/cache-to: type=gha`）加速。
6. 生产部署绑定 `environment` 触发审批门禁，并加失败/成功通知。

## 指令

- 锁定具体 action 版本（`@v4`），禁止 `@latest`，保证可复现。
- 缓存依赖；多版本验证用 matrix；PR 上启用状态检查（status checks）。
- 用 `permissions:` 显式声明最小权限（如 `contents: read`、`packages: write`）。
- 复用逻辑抽成 `workflow_call` 可复用工作流；生产环境加审批门禁与失败通知。
- 敏感工作负载可考虑 self-hosted runners。

## 示例

测试工作流（含 Node 矩阵 + 覆盖率上传）：

```yaml
name: Test
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: "npm"
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
```

构建并推送镜像到 GHCR（带 GHA 缓存、自动打 tag）：

```yaml
name: Build and Push
on:
  push:
    branches: [main]
    tags: ["v*"]
env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}
jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=semver,pattern={{version}}
      - uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

可复用工作流（`workflow_call` 定义 + 调用）：

```yaml
# .github/workflows/reusable-test.yml
on:
  workflow_call:
    inputs:
      node-version: { required: true, type: string }
    secrets:
      NPM_TOKEN: { required: true }
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: ${{ inputs.node-version }} }
      - run: npm ci
      - run: npm test
```

```yaml
# 调用方
jobs:
  call-test:
    uses: ./.github/workflows/reusable-test.yml
    with: { node-version: "20.x" }
    secrets: { NPM_TOKEN: ${{ secrets.NPM_TOKEN }} }
```

安全扫描（Trivy + SARIF 上传到 GitHub Security）：

```yaml
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: aquasecurity/trivy-action@0.28.0
        with:
          scan-type: "fs"
          scan-ref: "."
          format: "sarif"
          output: "trivy-results.sarif"
      - uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: "trivy-results.sarif"
```

带审批门禁的生产部署（`environment` + 失败/成功通知）：

```yaml
on:
  push:
    tags: ["v*"]
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://app.example.com
    steps:
      - uses: actions/checkout@v4
      - run: echo "Deploying to production..."
      - if: success()
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK }}
          payload: |
            {"text": "Deployment to production completed successfully!"}
```

部署到 Kubernetes（EKS 场景关键命令）：

```yaml
- uses: aws-actions/configure-aws-credentials@v4
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: us-west-2
- run: aws eks update-kubeconfig --name production-cluster --region us-west-2
- run: |
    kubectl apply -f k8s/
    kubectl rollout status deployment/my-app -n production
```

## 注意事项

- action 版本必须钉死到具体 tag/commit，`@latest` 在复现和供应链安全上都不可取。
- `secrets.GITHUB_TOKEN` 默认权限受 `permissions:` 约束，跨仓库或推镜像时按需显式放权。
- `cache: type=gha` 与 npm/pip 缓存能显著缩短 CI 时间，但注意缓存键命中与失效。
- 矩阵会成倍放大 job 数量，注意并发额度与计费；必要时用 `fail-fast`/`include`/`exclude` 收敛。
- 生产部署务必经 `environment` 审批门禁，避免误推；失败时加通知（Slack/邮件）便于及时介入。
- 跨平台矩阵中 Windows 的 shell 与路径差异需单独验证（脚本可能在 `ubuntu` 通过却在 `windows` 失败）。

## 互见

- `dependency-auditor`：把依赖漏洞审计接入 CI 安全扫描步骤。
- `code-reviewer`：在 PR 工作流中触发自动化代码审查与状态检查。

---

本条采编自 wshobson/agents（MIT 许可证）。
