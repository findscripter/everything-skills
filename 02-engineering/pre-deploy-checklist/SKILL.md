---
name: pre-deploy-checklist
title: 发布前核查清单
description: 当准备上线发布、变更含数据库迁移或特性开关、需在发版前核验 CI 状态与审批、或想提前约定回滚触发条件时使用；做生成结构化的发布前/中/后核查清单并产出回滚触发阈值文档；不适用于发布流程编排与版本号策略（用 release-manager）、CI/CD 流水线脚本实现或事故复盘。触发词：发布前检查、上线清单、回滚触发、冒烟测试
domain: 研发/devops
triggers: [发布前检查清单, 上线核查清单, deploy checklist 部署核查, 回滚触发条件 rollback trigger, 数据库迁移上线核验, 特性开关 feature flag 发布, 发版前核验 CI 与审批, 冒烟测试与金丝雀发布监控]
tags: [研发, misc, 发布核查, 部署清单, 回滚预案, 上线门禁, 冒烟测试, 金丝雀发布]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [git, CI/CD, monitoring, feature-flags]
requires: []
related: [release-manager, deployment-engineer, ci-cd-pipeline-builder, feature-flags-architect]
combines_with: [release-manager, zero-downtime-migration-architect, operational-runbook-writer]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
## 何时使用

适用场景：

- 即将上线一个版本，需要一份逐项勾选的就绪清单防止「忘了做某事」。
- 本次变更含数据库迁移、特性开关（feature flag）或破坏性 API 改动，需补充专项核验步骤。
- 发版前要核验 CI 是否全绿、PR 是否已审批合并。
- 想在部署「之前」就把回滚触发条件白纸黑字定好，而不是出事时临时拍脑袋。

不该用（负边界）：

- 不负责发布流程编排、语义化版本号、changelog 生成与分支工作流——那是 `release-manager` 的职责，本技能只产出核查清单。
- 不实现具体 CI/CD 流水线 YAML/脚本。
- 不做事后事故复盘（postmortem）。

## 步骤

1. 取参数：服务/版本名（用于填充清单标题）。
2. 套用下方三段式清单（发布前 / 发布中 / 发布后）+ 回滚触发条件，填入日期与发布负责人。
3. 按本次变更特点裁剪清单：
   - 「用了特性开关」→ 增加开关配置与灰度核验项。
   - 「含数据库迁移」→ 增加迁移已在预发演练、可回滚/只进式迁移、已备份等项。
   - 「破坏性 API 变更」→ 增加下游消费方通知项。
4. 若接入了源码管理 / CI/CD / 监控连接器，自动拉取信息预填（见「指令」）。
5. 输出 Markdown 清单，逐项确认后再上线。

## 指令

输出模板（Markdown）：

```markdown
## 发布核查清单：[服务/版本]
**日期：** [日期] | **负责人：** [姓名]

### 发布前
- [ ] CI 全部测试通过
- [ ] 代码已审查并审批合并
- [ ] 本次发布无已知严重缺陷
- [ ] 数据库迁移已在预发演练（如适用）
- [ ] 特性开关已配置（如适用）
- [ ] 回滚预案已记录
- [ ] 已通知 on-call / 值班团队

### 发布中
- [ ] 部署到预发并验证
- [ ] 执行冒烟测试
- [ ] 部署到生产（优先金丝雀/灰度）
- [ ] 监控错误率与延迟 15 分钟
- [ ] 验证核心用户链路

### 发布后
- [ ] 确认各项指标正常
- [ ] 更新发布说明 / changelog
- [ ] 通知干系人
- [ ] 关闭相关工单

### 回滚触发条件
- 错误率超过 [X]%
- P50 延迟超过 [X]ms
- [核心用户链路] 失败
```

接入连接器时自动预填（按可用性）：

- 源码管理可用：拉取本次发布 diff 与变更列表；核验所有 PR 已审批并合并。
- CI/CD 可用：自动检查构建与测试状态；确认流水线为绿再放行。
- 监控可用：用当前基线预填回滚触发阈值；配置发布后指标看护。

## 示例

针对「含数据库迁移 + 特性开关」的裁剪：

```markdown
### 发布前（裁剪后追加）
- [ ] 迁移脚本已在预发执行并验证，且为只进式（加列而非删列）
- [ ] 迁移前已完成数据备份
- [ ] 新逻辑默认走 feature flag 关闭态，可一键关停
- [ ] 灰度名单与放量节奏已确认
```

破坏性 API 变更追加项：

```markdown
- [ ] 已通知所有下游消费方并约定兼容窗口
```

## 注意事项

- 每次发布都跑，即使是例行小改动——清单的价值正在于挡住「我以为我做了」。
- 回滚条件要在「部署前」定好，不要等出事时现想；阈值优先用监控基线推导。
- 回滚优先级：能关特性开关就别做代码回滚；数据库优先只进式迁移，破坏性迁移前必须备份。
- 一次定制、长期复用：把你的技术栈与发布流程固化进清单模板。

## 互见

- related：`release-manager` —— 发布流程编排、版本号与 changelog（本技能只管核查清单）。
- combines_with：`verify` / `run` —— 发布中在真实环境验证核心链路是否生效。
- combines_with：`schedule` / `loop` —— 发布后定期巡检指标与告警。

---

采编自 anthropics/knowledge-work-plugins（Apache-2.0）。
