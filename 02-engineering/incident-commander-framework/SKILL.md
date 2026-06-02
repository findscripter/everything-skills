---
name: incident-commander-framework
title: 事故指挥与响应框架
description: 当声明线上事故、跨团队协调止损或主持复盘（PIR）时使用；做严重级别分级、时间线重建、沟通模板与无责复盘产物；不适用于日常缺陷排期或单点非紧急工单。触发词：事故指挥、严重级别、SEV、复盘、PIR、止损
domain: 研发/observability
triggers: [声明事故, 事故指挥官, 线上故障/宕机, 严重级别分级 SEV1-SEV4, 跨团队协调止损, 主持复盘/PIR/事后分析, 时间线重建, 对外状态页/客户通告, 新服务搭建 on-call 值班]
tags: [研发, observability, SRE, 事故响应, incident-response, 复盘, on-call, 可观测性]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [incident_classifier.py, timeline_reconstructor.py, pir_generator.py, PagerDuty/Opsgenie, Datadog/Grafana, Slack/Teams, Statuspage]
requires: []
related: []
combines_with: []
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

适用于从「检测 → 止损 → 恢复 → 复盘」的完整事故生命周期管理：

- 需要声明一次线上事故，并按影响面与紧急度快速定级（SEV1-SEV4）。
- 多团队同时响应一次宕机/降级，需要一名事故指挥官（IC）统一指挥与对外沟通。
- 事故结束后要主持无责复盘（PIR），用 5 Whys / 鱼骨图 / 时间线等方法做根因分析并产出可跟踪的改进项。
- 为新服务搭建 on-call 值班、Runbook 与升级路径。

**不该用的边界：**

- 日常缺陷修复、需求排期、纯文档/日志改进——走标准工单即可，不必启动事故流程。
- 单点、非紧急、有现成绕行方案的小问题（通常归为 SEV4），不需要 IC 或战时会议。
- 仅做监控告警调参或开发/测试环境问题，无用户影响时不启动本框架。

## 步骤

1. **定级（0-5 分钟）**：依据用户影响范围与业务损失，对照下表确定 SEV，决定升级与通报节奏。
2. **建立指挥**：SEV1/2 立即 page IC；创建事故跟踪单；开启战时会议（war room）。
3. **初步排查**：检查近期发布、错误日志、依赖健康状态。
4. **止损优先**：压力下优先回滚而非高风险热修；每一步动作与产出留痕。
5. **恢复与验证**：等待核心指标回归正常，做端到端验证后再宣告解决。
6. **沟通闭环**：更新状态页、通知干系人、安排 PIR。
7. **复盘**：用 RCA 方法重建时间线、定位根因、产出有 owner 和截止日期的改进项，并向组织广播。

### 严重级别分级

| 级别 | 定义 | 响应要求 | 通报频率 |
|------|------|----------|----------|
| SEV1 关键宕机 | 全量用户/核心业务不可用、数据损坏、客户数据泄露 | 立即升级 on-call；5 分钟内指定 IC；15 分钟内通知高管并更新状态页；建立战时会议 | 每 15 分钟，直到解决 |
| SEV2 重大影响 | 显著降级（>25% 用户受影响）、关键功能不可用 | 15 分钟内 on-call 响应；30 分钟内指定 IC；30 分钟内更新状态页；1 小时内通知干系人 | 每 30 分钟 |
| SEV3 轻微影响 | 单功能/组件受影响、<25% 用户、有绕行方案 | 工作时间 2 小时内响应；非工作时间次日；内部通知；状态页可选 | 仅关键里程碑 |
| SEV4 低影响 | 外观 bug、文档问题、监控缺口、无用户影响 | 1-2 个工作日内；标准工单；无需特殊升级 | 随常规开发周期 |

### 事故指挥官（IC）职责与决策授权

- **指挥控制**：拥有响应流程，做资源分配决策，协调技术团队与干系人，保持全局态势感知。
- **沟通枢纽**：定期向干系人更新；管理对外沟通（状态页、客户通告）；为一线响应者屏蔽外部干扰。
- **流程管理**：保证事故跟踪与文档化；推动解决；协调交接；必要时规划并执行回滚。
- **紧急决策（SEV1/2）**：IC 拥有全权，偏向「行动优于分析」，咨询 SME 但不被阻塞；可调动任意成员、向高层升级、批准应急外部资源支出；在「速度 vs 风险」上做最终裁决（回滚 vs 热修）。

### 干系人通报节奏

| 干系人 | SEV1 | SEV2 | SEV3 | SEV4 |
|--------|------|------|------|------|
| 研发负责人 | 实时 | 30 分钟 | 4 小时 | 每日 |
| 高管团队 | 15 分钟 | 1 小时 | 当日内 | 每周 |
| 客服 | 实时 | 30 分钟 | 2 小时 | 按需 |
| 客户 | 15 分钟 | 1 小时 | 可选 | 无 |
| 合作伙伴 | 30 分钟 | 2 小时 | 可选 | 无 |

## 指令

配套脚本（保留源命令）：

```bash
# 1) 事故分级：从描述/stdin 推断 SEV、推荐团队与初始动作
echo '{"description": "Users reporting 500 errors, database connections timing out", "affected_users": "80%", "business_impact": "high"}' | python scripts/incident_classifier.py

# 文本模式快速分级
echo "API rate limits causing customer API calls to fail" | python scripts/incident_classifier.py --format text

# 2) 时间线重建：从多源日志事件还原时序，做阶段检测与间隙分析
python scripts/timeline_reconstructor.py --input assets/db_incident_events.json --output timeline.md
python scripts/timeline_reconstructor.py --input assets/api_incident_logs.json --detect-phases --gap-analysis

# 3) 复盘（PIR）生成：套用 RCA 方法，产出可跟踪改进项
python scripts/pir_generator.py --incident assets/db_incident_data.json --timeline timeline.md --output pir.md
python scripts/pir_generator.py --incident assets/api_incident_summary.json --rca-method fishbone --action-items
```

## 示例

**示例 1：数据库连接池耗尽（SEV1）**

用户大面积 500、DB 连接超时，影响 80% 用户。先用 `incident_classifier.py` 定级并启动响应；用 `timeline_reconstructor.py` 从日志还原时间线（`timeline.md`）；解决后用 `pir_generator.py` 生成 PIR。

**示例 2：API 限流事故**

客户 API 调用因限流失败。`--format text` 快速分级；`--detect-phases --gap-analysis` 重建时间线；`--rca-method fishbone --action-items` 产出鱼骨图根因与改进项。

**初始通报模板（SEV1/2）骨架：**

```
主题：[SEV{级别}] {服务名} - {简述}
开始时间 / 严重级别 / 影响范围 / 当前状态（调查中 / 止损中 / 已解决）
受影响服务 / 现象 / 初步评估
IC / 技术负责人 / 已介入 SME
下次更新时间 / 状态页链接 / 战时会议链接
```

## 注意事项

- **止损优于排障**：压力下优先回滚，不要在不确定时上高风险热修；宣告「已解决」前必须做验证，并考虑次生故障与级联效应。
- **无责文化**：复盘聚焦系统失效而非个人过错，鼓励如实暴露问题。
- **改进项纪律**：每条改进项必须有明确 owner 与截止日期，公开跟踪进度，按风险与成本排序。
- **持续沟通**：即使没有新信息也按节奏更新，主动管理干系人预期；用清晰、少术语的语言。
- **可观测性集成**：升级走 PagerDuty/Opsgenie；指标看 Datadog/Grafana；日志关联用 ELK/Splunk；战时协同用 Slack/Teams + 视频桥；PIR 存档 Confluence/Notion，改进项进 JIRA/Linear。
- 框架是起点，需按团队文化与技术栈裁剪；目标不是杜绝事故，而是快检测、稳响应、清沟通、续学习。

## 互见

- 可观测性 / 监控告警体系搭建（Datadog、Grafana、ELK）
- on-call 值班与升级路径设计
- Runbook / 应急手册编写（检测、止损、恢复三类 playbook）
- 无责复盘与 RCA 方法（5 Whys、鱼骨图、时间线）

---

采编自 alirezarezvani/claude-skills（MIT 许可）。
