---
name: helm-chart-scaffolding
title: Helm Chart 打包部署
description: 当需要为 Kubernetes 应用做 Helm Chart 打包、模板化与多环境部署时使用；产出标准目录结构、Chart.yaml/values.yaml、模板与校验打包流程；不适用于裸 K8s manifest 编写或 GitOps 自动发布编排。触发词：Helm、Chart、values.yaml、helm create、多环境部署。
domain: 研发/devops
triggers: [Helm, Chart, helm create, values.yaml, Chart.yaml, 打包 Kubernetes 应用, 多环境部署, helm lint, helm template, Chart 依赖]
tags: [helm, kubernetes, 打包部署, 模板化, devops, 多环境, 研发/misc]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [helm, kubectl]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

当你需要把 Kubernetes 应用打包成可复用、可分发的 Helm Chart 时使用，典型场景：

- 从零创建新 Chart，或把现有 K8s manifest 模板化
- 用 values 管理 dev/staging/prod 多环境差异
- 声明并锁定子 Chart 依赖（如 postgresql、redis）
- 搭建 Chart 仓库并对外分发
- 落地命名、标签、版本等 Helm 约定与最佳实践

不该用的边界：

- 任务与 Helm Chart 打包无关
- 只是编写一份裸 Kubernetes manifest（用 k8s-manifest-generator）
- 需要 GitOps/CI 自动化发布编排（用 gitops-workflow）
- 不能替代针对具体环境的实测、校验与专家评审；缺少必要输入、权限或成功标准时先停下来澄清

## 步骤

1. 初始化结构：`helm create my-app` 生成标准骨架（Chart.yaml、values.yaml、charts/、templates/、.helmignore）。
2. 配置 `Chart.yaml`（apiVersion: v2）：填 name、version（Chart 版本，SemVer）、appVersion（应用版本）、description、type（application/library），按需加 keywords、maintainers、sources、`kubeVersion: ">=1.24.0"`。
3. 设计 `values.yaml`：分层组织 image、replicaCount、service、ingress、resources、autoscaling、env，并对每个值写注释；可加 `values.schema.json` 做 JSON Schema 校验。
4. 编写模板：在 `templates/` 用 Go 模板 + Helm 函数，名字、标签统一走 `_helpers.tpl`（`*.fullname`、`*.labels`、`*.selectorLabels`）。
5. 管理依赖：在 Chart.yaml 的 `dependencies` 里固定版本并加 `condition`，执行 `helm dependency update` / `build` 拉取并生成 Chart.lock。
6. 校验：`helm lint`、`helm template`、`helm install --dry-run --debug` 逐项验证。
7. 多环境：用 `values-dev/staging/prod.yaml` 覆盖差异，部署时 `-f` 指定。
8. 打包分发：`helm package` 生成 tgz，`helm repo index` 建索引并上传仓库。
9. 钩子与测试：用 `helm.sh/hook` 注解实现 pre-install 迁移等，在 `templates/tests/` 放测试 Pod，`helm test` 运行。

## 指令

```bash
# 1. 初始化
helm create my-app

# 2. 依赖
helm dependency update      # 拉取并生成 Chart.lock
helm dependency build
helm dependency list

# 3. 校验（打包前必做）
helm lint my-app/
helm template my-app ./my-app                 # 渲染查看
helm template my-app ./my-app -f values-prod.yaml
helm install my-app ./my-app --dry-run --debug
helm show values ./my-app

# 4. 打包与仓库
helm package my-app/                           # 生成 my-app-1.0.0.tgz
helm repo index . --url https://charts.example.com

# 5. 安装与测试
helm install my-app ./my-app -f values-prod.yaml --namespace production
helm test my-app
```

约定（务必遵守）：

- Chart 与依赖版本用 SemVer，依赖版本精确锁定（pin）。
- 模板文件小写加连字符（`service-account.yaml`），partial 以下划线开头（`_helpers.tpl`）。
- CRD 放 `crds/` 目录，不参与模板渲染、不随 Chart 升级或删除。
- Hook weight 控制顺序（-5 到 5，越小越先），常用删除策略 `before-hook-creation,hook-succeeded`。

## 示例

`templates/deployment.yaml` 的核心模板片段（命名与标签全部走 helper，镜像 tag 缺省回落到 AppVersion）：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "my-app.fullname" . }}
  labels:
    {{- include "my-app.labels" . | nindent 4 }}
spec:
  {{- if not .Values.autoscaling.enabled }}
  replicas: {{ .Values.replicaCount }}
  {{- end }}
  selector:
    matchLabels:
      {{- include "my-app.selectorLabels" . | nindent 6 }}
  template:
    spec:
      containers:
      - name: {{ .Chart.Name }}
        image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
        imagePullPolicy: {{ .Values.image.pullPolicy }}
        resources:
          {{- toYaml .Values.resources | nindent 12 }}
```

常用模式：

```yaml
# 条件资源
{{- if .Values.ingress.enabled }} ... {{- end }}

# 遍历列表
{{- range .Values.env }}
- name: {{ .name }}
  value: {{ .value | quote }}
{{- end }}

# 全局值（与子 Chart 共享）
global:
  imageRegistry: docker.io
```

生产环境 `values-prod.yaml` 覆盖示例：

```yaml
replicaCount: 5
image:
  tag: "2.1.0"
autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 20
ingress:
  enabled: true
```

## 注意事项

- 字符串在模板里加 `| quote`，避免 YAML 解析歧义。
- 每个 value 写注释，重复逻辑抽进 helper，保持「一个应用一个 Chart」聚焦原则。
- 打包前务必跑 `helm lint` + `helm template`，渲染报错用 `--debug` 定位。
- 安装失败时组合 `helm install --dry-run --debug` 与 `kubectl get events --sort-by='.lastTimestamp'` 排查。
- 数据库初始化等用 `pre-install` Hook，别塞进普通模板。
- 渲染结果不能替代真实集群的 dry-run 与实测验证。

## 互见

- k8s-manifest-generator：生成基础 Kubernetes manifest
- gitops-workflow：Helm Chart 的自动化发布编排

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
