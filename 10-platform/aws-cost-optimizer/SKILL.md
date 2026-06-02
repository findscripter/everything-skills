---
name: aws-cost-optimizer
title: AWS 成本分析与优化建议
description: 当需要分析 AWS 账单、定位云上浪费或给出降本方案时使用；用 AWS CLI 与 Cost Explorer 拉取成本数据、识别闲置资源（空闲 EC2、未挂载 EBS、闲置 EIP、过期快照）并产出可执行的节省清单与预估金额；不适用于非 AWS 云、未授权 CLI 环境或要求直接执行删除/生产变更。触发词：AWS 成本、降本、Cost Explorer
domain: 平台/cloud
triggers: [AWS 成本分析, 云费用优化, Cost Explorer 账单, 闲置资源清理, EC2 rightsizing, 预留实例/Savings Plans, 未挂载 EBS 卷, 成本异常排查]
tags: [aws, cloud, cost-optimization, finops, ec2, cost-explorer]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [aws-cli, Bash]
requires: []
related: [cloud-cost-optimization, multi-cloud-architecture, aws-serverless-architect, terraform-specialist]
combines_with: [aws-serverless-architect, terraform-specialist, cloud-cost-optimization]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 需要分析 AWS 支出趋势、按服务/区域/标签拆解账单、定位环比上涨。
- 需要发现云上浪费：空闲 EC2、未挂载 EBS 卷、闲置 Elastic IP、过期快照、低利用率 RDS、可上生命周期策略的旧 S3 对象。
- 需要给出降本方案：预留实例/Savings Plans、按 CloudWatch 指标做 rightsizing、规避高价区域，并预估节省金额。

不该用的边界：

- 非 AWS 云（GCP/Azure/阿里云等）不适用。
- 当前环境未配置或未授权 `aws` CLI、Cost Explorer 未启用时，先补齐凭证与权限再用。
- 本技能产出分析与建议，不代替环境特定验证；缺少输入、权限、安全边界或成功标准时应停下来澄清，不要直接执行删除或生产变更。

## 步骤

1. 基线评估：拉取 3-6 个月成本数据，找出 Top 5 支出服务，计算增长率。
2. 速赢清理（删除前务必确认资源确实闲置）：删除未挂载 EBS 卷、释放闲置 EIP、停止/终止空闲 EC2、删除过期快照。
3. 战略优化：分析预留实例覆盖率、对照工作负载复核实例规格、配置 S3 生命周期策略、非关键负载考虑 Spot。
4. 持续监控：配置 AWS Budgets 告警、开启 Cost Anomaly Detection、给资源打成本分摊标签、月度成本复盘。

降本检查清单：

- [ ] 启用 Cost Explorer 与成本分摊标签
- [ ] 创建带告警的 AWS Budget
- [ ] 复核并清理未用资源
- [ ] 评估预留实例机会，启用 S3 Intelligent-Tiering
- [ ] 复核数据传输费用、优化 Lambda 内存、设置 CloudWatch Logs 保留策略
- [ ] 比较多区域价差，参考 Trusted Advisor

## 指令

成本与用量（按服务拆解 / 当月每日）：

```bash
# 近 30 天按服务的成本
aws ce get-cost-and-usage \
  --time-period Start=$(date -d '30 days ago' +%Y-%m-%d),End=$(date +%Y-%m-%d) \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=DIMENSION,Key=SERVICE

# 当月每日成本
aws ce get-cost-and-usage \
  --time-period Start=$(date +%Y-%m-01),End=$(date +%Y-%m-%d) \
  --granularity DAILY \
  --metrics UnblendedCost
```

查找未用资源：

```bash
# 未挂载 EBS 卷
aws ec2 describe-volumes \
  --filters Name=status,Values=available \
  --query 'Volumes[*].[VolumeId,Size,VolumeType,CreateTime]' --output table

# 闲置 Elastic IP
aws ec2 describe-addresses \
  --query 'Addresses[?AssociationId==null].[PublicIp,AllocationId]' --output table

# 空闲 EC2（需 CloudWatch，替换 i-xxxxx）
aws cloudwatch get-metric-statistics \
  --namespace AWS/EC2 --metric-name CPUUtilization \
  --dimensions Name=InstanceId,Value=i-xxxxx \
  --start-time $(date -u -d '7 days ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 86400 --statistics Average

# 90 天以上的旧快照
aws ec2 describe-snapshots --owner-ids self \
  --query 'Snapshots[?StartTime<=`'$(date -d '90 days ago' --iso-8601)'`].[SnapshotId,StartTime,VolumeSize]' --output table
```

Rightsizing 分析：

```bash
# 列出 EC2 实例及类型
aws ec2 describe-instances \
  --query 'Reservations[*].Instances[*].[InstanceId,InstanceType,State.Name,Tags[?Key==`Name`].Value|[0]]' --output table

# RDS 实例利用率（替换 mydb）
aws cloudwatch get-metric-statistics \
  --namespace AWS/RDS --metric-name CPUUtilization \
  --dimensions Name=DBInstanceIdentifier,Value=mydb \
  --start-time $(date -u -d '30 days ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 86400 --statistics Average,Maximum
```

## 示例

- 分析类：「展示近 3 个月 AWS 成本，按服务拆解」「对比本月与上月支出」「列出 Top 10 最贵资源」。
- 优化类：「找出所有未挂载 EBS 卷并估算节省」「识别 CPU 利用率 <5% 的 EC2」「按用量推荐预留实例」「估算删除 90 天以上快照能省多少」。
- 落地类：「生成删除未挂载卷的脚本」「设置 $1000/月 的预算告警」「为管理层生成成本优化报告」。

## 注意事项

- 风险分级：只读分析为低风险；删除资源为中风险，需逐项确认；生产变更为高风险，rightsizing 先在 dev/staging 验证。
- 删除前确认资源确实未用并保留备份；可用时加 `--dry-run`。
- 记录所有降本动作并计算 ROI，把重复性优化自动化。
- 本技能仅在任务明确匹配上述范围时使用，输出不替代环境特定验证、测试或专家复核。

## 互见

- 官方参考：AWS 成本优化最佳实践、Well-Architected 成本优化支柱、Cost Explorer API。
- 可结合预算告警与 Cost Anomaly Detection 形成持续监控闭环。

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
