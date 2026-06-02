---
name: operator-audit-review
title: Kubernetes Operator 审计复盘
description: 当需要审计 Kubernetes Operator 仓库（CRD 设计、Go reconcile 循环、OperatorHub 能力等级）或上线前做合规复盘时使用；做 CRD 校验、reconcile 反模式 lint、能力等级评分，产出按检查项分级（FAIL/WARN/PASS）的 Markdown 报告与进阶步骤；不适用于纯 Helm 打包、普通 kubectl 运维、通用 k8s 安全或非 Operator 工作负载；触发词：operator 审计、CRD 校验、reconcile lint、能力等级、operator-audit、kubebuilder
domain: 商业/finance
triggers: [operator 审计, CRD 校验, reconcile lint, 能力等级, operator-audit, kubebuilder, controller-runtime, OperatorHub]
tags: [kubernetes, operator, crd, reconcile, controller-runtime, kubebuilder, audit, devops]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, crd_validator.py, reconcile_lint.py, operator_capability_audit.py, kubebuilder, operator-sdk]
requires: []
related: [kubernetes-architect, golang-pro, k8s-security-policies, helm-chart-scaffolding]
combines_with: [kubernetes-architect, golang-pro]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

- 对一个 Kubernetes Operator 仓库做整体审计：一次性跑 CRD 校验 + reconcile lint + 能力等级评分，产出 Markdown 报告。
- 上线/发布前的合规复盘：确认每个 CRD、每个 controller 的 reconcile 函数无阻断级问题，并明确当前 OperatorHub 能力等级。
- 评审存量 Operator 的能力等级缺口，规划「每季度晋升一个等级」的路线。

不该用（负边界）：
- 纯 Helm chart 打包 -> 用 helm-chart-builder。
- 普通 kubectl 运维、蓝绿/滚动发布 -> 用 senior-devops。
- 通用 k8s 安全态势评估 -> 用 cloud-security。
- 只是想跑个工作负载（那是 Deployment/Job，不是 Operator）。

> 命名说明：此处的 operator 指 Kubernetes Operator（自定义控制器），不是「经营者/运营」。本条采编自源技能 operator-audit（即 /operator-audit 命令），其实质是 Kubernetes Operator 的三合一审计。

## 步骤

1. 定位目录：默认从仓库根目录运行；Go controller 期望在 `controllers/` 或 `internal/controller/`，CRD 期望在 `config/crd/`（kubebuilder 布局）。
2. CRD 校验：对每个 CRD YAML 跑 `crd_validator.py`，核对 status 子资源、scope、版本 served/storage、conditions、printer columns 等。
3. Reconcile lint：对每个 controller 跑 `reconcile_lint.py`，定位行级反模式（阻塞调用、改 spec、缺 requeue 等）。
4. 能力等级评分：跑 `operator_capability_audit.py --operator-dir .`，得出当前 L1-L5 等级与晋升下一级的具体动作。
5. 分级处置：FAIL 阻断发布、必须修复；WARN 建一个 issue、30 天内修复；汇总成 Markdown 报告，全 PASS 则退出码 0，任一 FAIL 退出码 1。

## 指令

一键全量审计（源 /operator-audit 命令实现，保留原始约束）：
```bash
SKILL=engineering/kubernetes-operator/skills/kubernetes-operator
DIR="${OPERATOR_DIR:-.}"

echo "## CRD validation"
python "$SKILL/scripts/crd_validator.py" --crd "$DIR/config/crd" || true

echo ""
echo "## Reconcile lint"
python "$SKILL/scripts/reconcile_lint.py" --controller "$DIR/controllers" \
  || python "$SKILL/scripts/reconcile_lint.py" --controller "$DIR/internal/controller" || true

echo ""
echo "## Capability audit"
python "$SKILL/scripts/operator_capability_audit.py" --operator-dir "$DIR"
```

单项运行：
```bash
python scripts/crd_validator.py --crd config/crd/myapp.yaml      # 可加 --format json
python scripts/reconcile_lint.py --controller controllers/myapp_controller.go
python scripts/operator_capability_audit.py --operator-dir .
```

三项检查的硬约束（逐条核对）：

CRD 校验关键项：必须开启 status 子资源（否则 status 更新会回触发 spec reconcile，死循环）；scope 默认 `Namespaced`；至少一个版本 `served: true` 且 `storage: true`；schema 含 conditions 数组；printer columns 含 Age 与 Status/Phase；禁止在 spec 根用 `x-kubernetes-preserve-unknown-fields: true`。

Reconcile lint 关键项：返回须为 `(ctrl.Result, error)`；错误要触发 requeue（`ctrl.Result{Requeue: true}` 或 `RequeueAfter`）；只更新 status，不要 `client.Update()` 改 spec；禁止 reconcile 内 `time.Sleep`；HTTP 调用须带 context；finalizer 添加后须 defer；CRD 有 conditions 却无 `SetCondition` 调用要标记；reconcile 超 80 行应拆子函数。

OperatorHub 能力等级：L1 基础安装 / L2 无缝升级（PDB、转换 webhook、版本偏斜策略）/ L3 全生命周期（备份、恢复、故障自愈）/ L4 深度洞察（metrics、Prometheus rules、告警）/ L5 自动驾驶（自动扩缩、自动调优、异常检测）。公开发布前建议达到 L3。

## 示例

审计存量 Operator 的标准流程：
```
1. operator_capability_audit.py --operator-dir <path>   # 先看当前等级
2. crd_validator.py --crd config/crd/
3. reconcile_lint.py --controller controllers/
4. 分级：FAIL 阻断发布并立即修；WARN 建 issue，30 天内修
5. 在 README 写明当前能力等级并提交
6. 规划：每季度晋升一个能力等级
```

报告产出包含：每个 CRD 文件按检查项给 FAIL/WARN/PASS；reconcile 反模式带行号；当前能力等级 + 晋升下一级的具体动作。

## 注意事项

- 核心范式：Operator 是「reconcile 循环」而非脚本 —— `observe(actual) -> desired=read(spec) -> diff -> act -> update(status) -> requeue/done`，幂等且声明式（让 actual=desired），别写成「创建做 A、更新做 B、删除做 C」的命令式分支。
- 高频致命反模式：reconcile 内 `time.Sleep`（改用 `RequeueAfter`）；用 `r.Client.Update` 设 status（应 `r.Status().Update`）；多副本无 leader election（脑裂）；无 finalizer（外部资源在删除时成孤儿）；CRD 无 status 子资源（死循环）。
- 工具均为 stdlib-only Python，可直接接入 CI/预提交；新 CRD 合入前应全部 PASS，reconcile 函数应通过 strict 模式。
- 框架选型速记：Go 团队新建 -> kubebuilder；Python 团队 -> KOPF；选不定语言 -> metacontroller；OpenShift 目标 -> operator-sdk。提交前先做 1 周 PoC。
- 重要偏差提示：本条所属 domain 被预设为「商业/finance」，但源技能实质是 Kubernetes Operator 审计（研发/DevOps 域）。建议人工将 domain 改为「研发/devops」或「研发/review」，否则会与实际内容错配。

## 互见

- senior-devops：普通 k8s 运维与发布，本条聚焦 Operator 模式审计。
- cloud-security：集群安全态势，可与 Operator 的 RBAC/webhook 加固配合。
- dependency-auditor / api-design-reviewer：同源审计类技能，方法论可借鉴。

---
本条采编自 alirezarezvani/claude-skills（MIT）。
