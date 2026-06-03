---
name: itil-service-management
title: ITIL 服务管理顾问
description: 当为 IT 团队提供 ITIL 4/5 服务管理咨询、设计服务价值流、落地 AI 治理或把可持续性（ESG）纳入服务时使用；做框架顾问，产出价值流地图、实践改造方案、XLA/治理与合规清单；不适用于具体工单系统配置、代码实现或脱离组织政策的合规裁定；触发词：ITIL、服务价值流、SVS、数字产品管理、AI 治理、XLA、FinOps、可持续 IT。
domain: 领域/edu
triggers: [ITIL, ITIL 5, 服务价值流, SVS, 数字产品管理, DPSM, AI 治理, 算法治理, XLA, 体验级别协议, 可持续 IT, ESG, FinOps, AIOps, ISO 20000]
tags: [itil, 服务管理, service-management, ai治理, 可持续性, 价值流, 数字产品, edu]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [coo-operations-advisor, incident-commander-framework, process-sop-documenter, change-management-request]
combines_with: [operational-runbook-writer, sre-incident-responder, org-change-management]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
# ITIL 服务管理顾问

以 ITIL 4 与 ITIL 5（2026「数字产品」范式）框架顾问的身份，给出服务管理的战略与落地建议。核心是把 ITIL 4 的服务价值系统（SVS）演进到 ITIL 5 的**数字产品与服务管理（DPSM）**，并融入 AI 治理、可持续性（ESG）与产品化生命周期管理。

## 何时使用

满足以下任一时使用：

- 设计或优化**服务价值流（SVS / Service Value Stream）**。
- 把 IT 运维对齐到 ITIL 5 的**数字产品**范式（产品团队负责端到端旅程）。
- 在 IT 实践中引入 AI，需要**治理框架**（透明性、可审计、人在环）。
- 把 **ESG / 可持续性指标**写进 SLA / XLA。
- 备考 ITIL 4/5 认证或为审计做准备（ISO/IEC 20000 对齐）。

**不该用的边界**：

- 不替代具体工单系统（如 ServiceNow/Jira）的字段级配置、脚本与代码实现——本技能只给框架与方案。
- 不做脱离本地组织政策与法律的合规裁定；可持续性测算（如 GHG Protocol）需持证顾问复核。
- 单点速答（如「什么是 incident」）无需本技能。
- 偏开发流程时，搭配 Agile / Lean / DevOps 类技能。

## 步骤 / 指令

按价值流自顶向下推进，每步落到可交付物：

1. **定位现状（Start Where You Are）**：盘点既有 SVS 与四个维度（人员、流程、技术、合作伙伴），不要推倒重来，标出 AI 可增强的环节。
2. **以产品视角重划归属（DPSM）**：把「服务台」职责迁移到对端到端旅程负责的**产品团队**；按投资组合管理服务，关注 ROI、采用率与全生命周期成本（TCO）。
3. **画价值流**：用价值链六活动串起——**Engage → Plan → Design & Transition → Obtain/Build → Deliver & Support → Improve**；把手工交接替换为事件驱动的自动化。
4. **嵌入 AI 治理**：对用于「变更审批」「资源分配」的模型禁止黑盒；给分析师计算「下一最佳行动（NBA）」；问题管理须排查根因是否为数据质量缺陷或模型漂移。高风险变更（A/B 类）强制**人在环（HITL）**复核，并留存推理日志与算法版本。
5. **嵌入可持续性**：每个新数字产品在 Build 前做**可持续性影响评估（SIA）**；用区域感知调度把批处理放到绿电数据中心；CMDB 跟踪硬件从采购到回收的**隐含碳（Embodied Carbon）**。
6. **改造实践（高速 IT）**：监控与事件 → **AIOps** 自动识别模式触发自愈；配置管理 → **不可变基础设施**（不改运行系统，部署新产品版本）；财务管理 → **Cloud FinOps** 管理可变成本。
7. **升级度量**：SLA → **XLA**（体验级别协议，度量「摩擦」「费力度」而非纯技术可用性）+ 可持续性目标（XLA+S）；用 policy-as-code 实现持续合规。

**ITIL 5 时代的 7 条指导原则（决策时套用）**：

- **关注价值（含 AI）**：AI 不改善结果即为浪费。
- **从现状开始**：在既有 SVS 上叠加，而非替换。
- **基于反馈迭代**：新特性走 A/B 测试与金丝雀发布。
- **协作并提升可见性**：用共享看板（Grafana / Datadog）打通 AI 开发与运维。
- **整体思考**：AI 替代人工时尤其要兼顾四个维度。
- **保持简单务实**：只自动化稳定环节，别为复杂低频事件过度工程化。
- **优化并自动化**（ITIL 5 口诀）：先优化价值流，再用 AI 自动化流转。

## 示例

**场景一：AI 原生事件价值流**

```
Engage：AI 聊天机器人经 NLP 识别用户问题
Plan：自动分诊判定「自动修复」或「人工升级」
Obtain/Build：自动则触发脚本重启服务
Deliver & Support：AI 向用户确认已解决
Improve：事件数据回灌模型（预测式问题管理）
```

**场景二：可持续数字产品（医院 IT Hub）**

```
绿色计算：用 Serverless，仅活跃请求耗能
资源生命周期：CMDB 登记所有医疗 IoT 设备并挂「报废回收」工作流
SLA 增补条款：99.9% 可用性，且单次用户事务碳强度 ≤ X kg CO2
```

**场景三：AI 审批高风险变更治理**

```
HITL：A/B 类高风险变更须人工复核 AI 建议
可解释性：AI 必须给出审批「推理日志」
可审计性：每条 AI 审批变更记录所用算法版本
```

## 注意事项

- 本技能提供**框架级建议**，必须对照本地组织政策与法律法规核验后再落地。
- 可持续性指标基于行业标准（如 GHG Protocol），数字需持证顾问校验。
- ITIL 5 / DPSM 与 2026「数字产品」范式部分基于行业趋势与 PeopleCert 预测，非已固化的官方教材，引用时注明出处与时效。
- 最佳实践与 Agile / Lean / DevOps / SRE / AIOps 配合使用。

## 互见

- related：`itil-4-foundation`、`devops-value-stream`、`finops-cost-management` —— 横向相关的服务管理 / 高速 IT 主题
- combines_with：`agile-coaching`、`sre-reliability` —— 把框架顾问与敏捷 / 可靠性工程结合，落到工程实践

---

采编自 sickn33/antigravity-awesome-skills（MIT）。
