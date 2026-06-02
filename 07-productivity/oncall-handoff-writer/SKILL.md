---
name: oncall-handoff-writer
title: 值班交接记录撰写
description: 当 On-Call/值班轮换交接、需让接班工程师获得完整态势感知时使用；做按固定模板产出含活跃事故/在查问题/近期变更/已知问题/升级路径的值班交接文档（含事中交接 IC 移交与异步快速交接）；不适用于事后复盘报告、对外状态页公告、事故根因分析本身；触发词：值班交接、On-Call 交接、轮班交接、shift handoff、on-call handoff、交接文档、值班轮换、事中交接、incident handoff、watch list、升级路径、escalation
domain: 协作/pm
triggers: [值班交接, On-Call 交接, 轮班交接, shift handoff, on-call handoff, 交接文档, 值班轮换, 事中交接, incident handoff, watch list, 升级路径, escalation]
tags: [on-call, handoff, incident-response, sre, shift-handoff, escalation]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [pagerduty, slack, grafana, kubectl]
requires: []
related: [technical-change-tracker, incident-commander-framework, postmortem-writer, devops-troubleshooter]
combines_with: [incident-commander-framework, postmortem-writer, sre-incident-responder]
license: MIT
source: wshobson/agents
source_license: MIT
---
## 何时使用

当进行 **On-Call / 值班轮换交接**，需要让接班人获得完整态势感知时使用。三种典型场景对应三种模板：

- **标准轮班交接**：班次结束写交接文档（模板 1，信息最全）。
- **异步快速交接**：跨时区无法同步通话时，写精简版 + 一段 Loom/语音备忘（模板 2）。
- **事中交接**：事故进行中移交 Incident Commander 角色，让新人不丢上下文接手（模板 3）。

也用于：制定值班交接规范、新人首次进入轮值、审计并改进既有交接质量。

**不该用的边界**：事后复盘/Postmortem 报告（交接只引用其链接，不在此处写根因分析）、对外状态页公告与客户沟通、事故本身的排障操作。这些是交接文档的「输入/下游」，不是交接文档本身。

## 步骤

1. **判定模板**：日常轮班→模板 1；跨时区/无同步窗口→模板 2；事故进行中→模板 3。
2. **逐节填写五要素**，每节至少一条目，无内容显式写「无 / none」（这是完整性闸门）：

   | 要素 | 内容 |
   |---|---|
   | 活跃事故 Active Incidents | 当前正在故障的 |
   | 在查问题 Ongoing Investigations | 正在排查中的 |
   | 近期变更 Recent Changes | 部署、配置、基建 |
   | 已知问题 Known Issues | 已有临时绕过方案的 |
   | 即将发生 Upcoming Events | 维护、发布、流量活动 |

3. **补升级路径表**（按问题类型列一/二级升级联系人）与 Quick Reference（常用排障命令、关键看板/Runbook 链接）。
4. **执行交接窗口（建议 30 分钟重叠）**：

   ```
   交班人：15 分钟写文档 + 15 分钟同步通话
   接班人：15 分钟读文档 + 15 分钟同步通话 + 5 分钟校验告警
   ```

5. **校验告警闭环**：交班人发一条测试告警，确认接班人在 PagerDuty 与 Slack 均收到，再结束重叠窗口。
6. **存档可检索**：交接文档统一存共享位置（Wiki/Notion/Confluence），并从 PagerDuty 排班条目反向链接。

## 指令

完整性闸门：每个小节必须有至少一条目或显式「无」，否则不得标记「交接完成」。交班人交接后**即使已下班，也在 Slack 保持 15 分钟可达**回答澄清问题。事中交接尤其要点名当前 IC、Comms Lead、接手人。

## 示例

**模板 1 · 标准轮班交接（节选）**：

```markdown
# On-Call Handoff: Platform Team
**Outgoing**: @alice (01-15→01-22)  **Incoming**: @bob  **Handoff**: 2024-01-22 09:00 UTC

## 🔴 Active Incidents
None currently active.

## 🟡 Ongoing Investigations
### 1. Intermittent API Timeouts (ENG-1234)
Status: Investigating | Impact: ~0.1% 请求超时
- 超时与数据库备份窗口(02:00-03:00 UTC)相关，疑似锁争用；PR #567 已加日志
- Next: [ ] 看今晚备份后的新日志  [ ] 确认后考虑移动备份窗口
- Dashboard: grafana/d/api-latency | Thread: #platform-eng

## 📋 Recent Changes
| Service | Version | Time | Notes |
| api-gateway | v3.2.1 | 01/21 14:00 | header 解析修复 |
- Config: 限流 1000→1500 RPS；连接池 50→75

## 📞 Escalation
| 类型 | 一级 | 二级 |
| Payment | @payments-oncall | @payments-manager |
| Unknown/severe | @engineering-manager | @vp-engineering |
```

排障 Quick Reference（嵌入文档便于接班人直接用）：

```bash
kubectl get pods -A | grep -v Running                 # 服务健康
kubectl get events --sort-by='.lastTimestamp' | tail  # 近期部署/事件
psql -c "SELECT count(*) FROM pg_stat_activity;"      # 数据库连接数
redis-cli FLUSHDB                                      # 清缓存（仅限紧急）
```

**模板 2 · 异步快速交接**：`TL;DR`（无活跃事故 / 1 个在查 / 明日 v5.0 发布）+ `Watch List`（02:00-03:00 备份窗口看 API 延迟；Auth 内存 >80% 重启）+ `Recent` + `Coming Up` + `我 Slack 在线到 17:00`。

**模板 3 · 事中交接**：固定写 `Current State`（错误率 15%↓，扩容中，ETA 30min）/ `What We Know` / `What We've Done` / `What Needs to Happen`（错误率应 15 分钟内 <1%，否则升级 @payments-manager）/ `Key People`（IC 交班/接手/Comms）/ `Communication`（状态页、客服、Exec 知会状态）。

## 注意事项

- **完整性优先**：交接漏掉关键问题往往是「某节为空又没写无」导致；把不完整交接列为无责复盘改进项。
- **格式统一**：全组织采用同一模板并集中存档，避免各队格式不一。
- **事中交接最易过载**：用模板 3，交班人交接后保持 15 分钟在线兜底。
- **告警必须实测**：不要假设 PagerDuty/Slack 路由已切到接班人，发测试告警确认收到。
- **跨时区降级**：无同步通话时用模板 2 + 录屏/语音，并给接班人留直接联系方式。
- 引用的事实/指标（如错误率、版本号、影响面）应来自看板与工单，不确定要标注（配合 fact-checking）。
- 本条采编自 wshobson/agents（MIT），保留其五要素、30 分钟重叠窗口、完整性闸门、三类模板与排障命令等关键约束。

## 互见

- internal-comms：交接中的事故汇报/状态更新可复用其 incident report 与 status update 写法。
- fact-checking：发布交接前核对其中引用的指标、版本与影响面。
