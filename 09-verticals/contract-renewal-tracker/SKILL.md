---
name: contract-renewal-tracker
title: 合同续约与取消窗口跟踪
description: 当需要从续约登记册掌握哪些合同临近「取消截止日」并在通知窗口关闭前预警时使用；做读取本地 renewal-register.yaml、按紧急度分档输出未来 90 天续约清单/已错过窗口报告/批量导入建议并给出推荐动作（找谁、谁价格无封顶）；不适用于读合同提取续约日、替你发不续约通知或决定是否续约；触发词：续约、取消窗口、cancel-by、自动续约、通知期、renewal tracker、错过续约、续约登记册
domain: 领域/legal
triggers: [续约, 取消窗口, cancel-by, 自动续约, 通知期, renewal tracker, 错过续约, 续约登记册, notice window]
tags: [legal, contract, renewal, auto-renew, deadline-tracking, saas, register]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [yaml]
requires: []
related: [vendor-agreement-status-checker, entity-compliance-tracker, employee-leave-deadline-tracker, contract-amendment-history-tracer]
combines_with: [vendor-agreement-redline-review, saas-subscription-agreement-review, esignature-routing]
license: Apache-2.0
source: anthropics/claude-for-legal
source_license: Apache-2.0
---
# 合同续约与取消窗口跟踪

## 何时使用

- 需要知道「最近哪些合同要续约 / 取消截止日（cancel-by）何时到 / 是否错过了取消窗口 / 把某合同加进跟踪器」，或按计划（如每周）巡检一次续约状态。
- 续约日在评审（review）时已被提取一次，需要一个会「在取消截止日前 45 天对你喊」而非 45 天后才提醒的登记册。
- 典型上游：SaaS/MSA、供应商协议评审发现续约条款后，把记录交接（handoff）到本条登记。

**不该用边界（命中即转人工/法务）：**
- 不读合同去找续约日——那是评审时的事。登记册里没续约日的条目，是有人手工漏填，需人补全。
- 不替你取消合同、不替你决定是否续约——只暴露截止日与业务负责人，决策由人做。
- 发不续约通知、放任自动续约越过截止日、或回签续约表——属有法律后果的动作，须先过下方「续约决策闸」。

## 步骤

1. **读登记册**：`~/.claude/plugins/config/claude-for-legal/commercial-legal/renewal-register.yaml`（config 目录，插件升级后仍在）。
2. **默认模式（模式 2「最近要续约的」）**：未来 90 天，按紧急度分档。用**半开区间**保证每个截止日只落一档：🔴 0–13 天 / 🟠 14–44 天 / 🟡 45–89 天。第 14、45、90 天是边界，各只属一档——这里 off-by-one 会把最紧急项漏进次紧急桶。
3. **`--days N`**：改变窗口长度。
4. **`--missed`（模式 4）**：列已过且无取消记录的截止日。
5. **登记册为空且接入了 CLM（模式 3）**：提议扫描 CLM 中有续约日的在用协议，批量导入。
6. **输出含推荐动作**：找谁（每条的 business_owner）、哪些价格无封顶（uncapped，窗口关前先拿筹码）。

## 指令

**警报基准——盯 `send_by_effective`，不是 `cancel_by_effective`。** 60 天窗口若要求挂号信送达，实际只有约 55 天。盯「送达日」的跟踪器就是会错过截止日的跟踪器。计算 `send_by_effective = cancel_by_effective − transit_buffer_days`（电子=0、国内挂号≈5、国际挂号≈10，或按合同），紧急度分档以此为准；明细列再展示 `cancel_by_effective` / `notice_method` / `transit_buffer_days` 供人核对差值。

**滚动续约——只对一次就过期。** 存 `initial_term_end` 留档，但 `cancel_by_*` 一律从 `current_term_end` 算。一旦续约触发（窗口已过且未发通知），提示：

> 本合同已于 [日期] 自动续约。更新登记册：新 `current_term_end` = [日期+续约周期]，新 `cancel_by_effective`、`send_by_effective` = [重算]。确认？

满一年后 `initial_term_end` 即失效，只有 `current_term_end` 能算出正确的 cancel-by。

**每个 cancel-by 都做工作日校验。** 落在周末/节假日的日期是续约漏期的头号原因。
1. **算日历日**：`cancel_by_calendar = current_term_end − notice_period_days`（或按条款）。
2. **按准据法回退到工作日**：准据法决定算哪国假日（美国=联邦+州；英格兰=bank holidays；德国=各州 Feiertage，须问；加拿大=联邦+省；新加坡=public holidays）。周六/周日→回退到周五，节假日→回退到前一工作日。**只回退、绝不前移**（前移=通知在窗口关后才到）。非美准据法且查不到假日表时打旗标注「暂用美国联邦假日占位，依赖前请核 [辖区] 假日表」。
3. **查合同自有计日规则**：找 "business day"、"received by"、"deemed received"、"5:00 p.m. [local time]" 或通知方式条款；合同自定义优先，与默认回退冲突即打旗。
4. **两个日期都记**：`cancel_by_calendar`（原始算术）、`cancel_by_effective`（最后有效工作日）、`cancel_by_roll_note`（为何不同）。每个算出的 `cancel_by_effective` 都带 `cancel_by_provenance: "[model calculation — verify against the notice clause]"`，让核验旗标跟着日期走。
5. **警报基于 effective 日，不基于日历日**；模式 2 紧急度列显示 `cancel_by_effective`，明细列展示 `cancel_by_calendar` 与回退说明供挑战。

打印 `cancel_by: 2026-11-01`（周日）却不标星期、不告警，是静默错误的截止日——登记时（一次）就该抓住。

**模式 2 输出量大（窗口内 >~10 条续约，或用户要求）时**：提议仪表盘（按团队配置 `## Outputs → Dashboard offer`）——按紧急档计数、cancel-by 时间线、可排序登记表（对手方/续约日/年额/负责人）。

## 示例

```
# 默认：未来 90 天要续约的
/commercial-legal:renewal-tracker
# 改窗口
/commercial-legal:renewal-tracker --days 180
# 已错过的取消窗口
/commercial-legal:renewal-tracker --missed
```

登记册条目（YAML，关键字段）：

```yaml
- counterparty: "Acme SaaS Inc."
  agreement: "Acme Platform Subscription Agreement"
  current_term_end: 2026-06-15      # 每次续约后向前滚动，cancel_by_* 由此算
  renewal_mechanism: "auto-renew annual"
  notice_period_days: 60
  notice_method: "email"            # email / portal / certified mail / registered post / per contract §X
  transit_buffer_days: 0            # 电子=0，国内挂号≈5，国际挂号≈10，或按合同
  cancel_by_effective: 2026-04-16   # 已回退到最后工作日
  send_by_effective: 2026-04-16     # cancel_by_effective − transit_buffer_days，必须发出通知之日
  cancel_by_provenance: "[model calculation — verify against the notice clause]"
  price_on_renewal: "then-current list (uncapped)"
  annual_value: 48000
  business_owner: "jane@company.com"
  status: "active"                  # active | cancelled | renewed | lapsed
  notes: "Pricing uncapped — revisit before renewal. Alt vendors: X, Y."
```

模式 2 报告骨架：

```markdown
## Renewals — next 90 days

### 🔴 Cancel-by deadline in 0–13 days
| Counterparty | Cancel by | Renewal date | Annual $ | Owner | Notes |
|---|---|---|---|---|---|
| [name] | **[date]** | [date] | $[n] | [email] | [notes] |

### 🟠 14–44 days  ### 🟡 45–89 days  （同表）

**Recommended actions:**
- [ ] [对手方] — ping [负责人]：还要续吗？
- [ ] [对手方] — 价格无封顶，窗口关前先拿替代报价
```

模式 4（坏消息报告）输出已过窗口表，并给三个选项：谈逾期取消（少成但值得问）/ 接受续约并即刻登记下一年 cancel-by / 查合同有无其他终止权（for convenience、for cause）。

## 注意事项

- **续约决策闸（不可越过）**：跟踪续约日只是 research；**发不续约通知、放任自动续约越过 cancel-by、回签续约表**都是有后果的法律步骤。动作前读团队配置 `## Who's using this`；若角色为非律师，先提示「此步有法律后果，是否已与律师审过？」未得明确 yes 不得越闸，并附一页 brief（对手方、当前 term end 与 cancel-by、续约定价机制、什么都不做会怎样、想换供应商时的备选、关窗前要问律师的三件事）。
- **本条不做的事**：不取消合同（只告诉你何时该决定）；不决定是否续约（只暴露截止日与负责人）；不读合同找续约日（评审时做）。
- **模式 1 交接去重**：上游评审交接记录时追加到登记册；若该对手方已有条目，先问这是替换（同协议续签）还是新增协议。
- **巡检集成**：可由 renewal-watcher 一类代理按计划（默认每周）跑模式 2，把「最近要续约」报告贴到团队配置指定的渠道。
- **工作成果抬头与去向检查**：报告顶部按团队配置 `## Outputs` 加 work-product header（随角色不同）；外发前确认接收方是否在特权圈内，圈外则提供特权版/脱敏版而非默默加抬头。

## 互见

- related：`nda-triage-reviewer` —— 同一商业合同评审链路的上游分流。
- related：`general-counsel-advisor` —— 续约取舍涉及法律判断时升级咨询。
- related：`diligence-issue-extractor` —— 尽调中批量提取协议续约/终止条款。
- combines_with：`general-counsel-advisor` —— 过续约决策闸时由其生成给律师的一页 brief。

---
本条采编自 anthropics/claude-for-legal（Apache-2.0）。
