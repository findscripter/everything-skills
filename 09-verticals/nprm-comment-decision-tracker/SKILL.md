---
name: nprm-comment-decision-tracker
title: 立法征求意见期决策跟踪
description: 当某项拟议规则（NPRM/征求意见稿）的公众意见期开放、需要浮现临近截止日并记录「是否提交意见」的决策时使用；做的是汇总开放中的意见期、按截止日分桶、登记 提交/不提交/弃权 决策并写回跟踪器；不适用于起草意见函正文、也不替律师做最终是否提交的决断；触发词：意见期跟踪、NPRM、征求意见、comment deadline、是否提交意见、意见决策、立法意见截止日、rulemaking comment
domain: 领域/legal
triggers: [意见期跟踪, NPRM, 征求意见, comment deadline, 是否提交意见, 意见决策, 立法意见截止日, rulemaking comment]
tags: [legal, regulatory, nprm, comment-period, deadline-tracking, compliance, decision-log]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [yaml, research-mcp, slack-mcp]
requires: []
related: [regulatory-policy-diff, legal-briefing-generator, compliance-policy-redraft, entity-compliance-tracker]
combines_with: [legal-meeting-briefing]
license: Apache-2.0
source: anthropics/claude-for-legal
source_license: Apache-2.0
---
## 何时使用

当某项拟议规则（NPRM / 征求意见稿）的公众意见期处于开放状态，需要回答「哪些意见期快到截止日、要不要提交意见、并把这个决策留痕」时使用。典型触发：用户说「看看哪些征求意见期快截止了」「登记一下这条 NPRM 我们不提交」「意见期跟踪」，或上游法规监测环节首次抓到一条新 NPRM。

核心价值：是否提交意见是律师的判断，但「截止日悄无声息地过去、却没有任何留痕的决策」才是真正的风险点。本技能浮现开放中的意见期并记录决策，确保每个截止日都有一个明确的 提交/不提交/弃权 结论。

不该用的边界：
- 不起草意见函正文——那是独立的律师任务（撰写交给意见函起草环节或人工）。
- 不替律师做「是否提交」的决断——本技能只跟踪和登记决策，决策由律师拍板。
- 不监控意见提交之后的进展——一旦决策登记为「提交」，本跟踪器的使命即告结束，后续 rulemaking 的推进交回法规监测环节跟进。

## 步骤

1. **载入上下文**：读取跟踪器与默认决策责任人配置（见「指令 · 上下文路径」）。
2. **默认视图**：渲染开放中的意见期，按截止日分桶（<14 天紧急 / >14 天开放 / 近期已决）。
3. **登记决策**（用户带 `--decide CMT-ID` 时）：写回 提交/不提交/弃权 + 理由；若为「提交」，先过「consequential-action 决策门」，再追加内部复核提醒。
4. **提醒与通知**：首次发现 NPRM 时 DM 责任人（若配置）；截止日前 14 天 / 3 天对仍「未决」者升级提醒。

## 指令

### 上下文路径（先载入再动手）

- `~/.claude/plugins/config/claude-for-legal/regulatory-legal/comment-tracker.yaml` → 所有被跟踪的 NPRM 及其状态。
- `~/.claude/plugins/config/claude-for-legal/regulatory-legal/CLAUDE.md` → 默认意见决策责任人（`owner` / `owner_slack`）。

> `comment-decision` 的 `gap_type` 语义、逐条发送前的 Slack 确认规则、以及 `comment-tracker.yaml` 的 schema，归属于上游的 gap-surfacer 参考技能——做实质工作前先载入它。

### 默认视图——开放中的意见期

```markdown
## 意见期跟踪 — [日期]

### ⏰ 截止日 <14 天
| ID | 法规 | 截止日 | 剩余天数 | 决策 | 责任人 |
|---|---|---|---|---|---|
| CMT-001 | [名称] | [日期] | [N] | 未决 | [责任人] |

### 🟡 开放中（>14 天）
[同上表]

### 近期已决
| ID | 法规 | 决策 | 理由 |
|---|---|---|---|
| CMT-002 | [名称] | 不提交 | [原因] |

---
**开放总数：** [N]　**截止日 <30 天且未决：** [N]
```

### 登记决策

```
/regulatory-legal:comments --decide CMT-001
决策：[提交 / 不提交 / 弃权]
理由："[简述——如『该规则不适用于我们的产品』或『将就第 3 节提交意见』]"
```

写回跟踪器。若决策为「提交」：追加一条提交截止提醒——**取意见截止日往前推 5 个工作日**作为内部复核的内部截止日。

### 提醒节奏（务必保留）

- 首次发现某 NPRM（由 reg-feed-watcher 填入）：若已配置 Slack MCP 且设了 `owner_slack`，DM 意见决策责任人。
- 截止日前 **14 天**：若决策仍为「未决」，发提醒。
- 截止日前 **3 天**：若仍未决，发提醒并提升紧急级别。

### consequential-action 决策门（提交监管意见 / 回应监管机构）

**在把决策登记为「提交」之前——以及任何时候要产出拟提交的意见函或监管回应草稿之前：** 读取 `~/.claude/plugins/config/claude-for-legal/regulatory-legal/CLAUDE.md` 的 `## Who's using this`。若角色为 **Non-lawyer（非律师）**，先抛出以下提示，未获明确「是」之前不得登记「提交」决策、也不得产出可直接提交的草稿：

> 向监管机构提交意见或回应具有法律后果：它是公司立场的公开声明、会进入该 rulemaking 或执法事项的正式记录，且在此处所持立场会约束公司、并可能在后续程序中被用来反制公司。你是否已与律师复核过？如已复核，继续；如未复核，带以下要点去找律师：
> - 该 rulemaking 或问询（监管机构、案卷号 docket、截止日）
> - 拟提交的意见/回应说了什么、针对哪些条款
> - 尚未解决的开放问题
> - 可能出错之处（不利自认、与过往立场不一致、与行业协会的意见协调问题）
> - 该问律师什么（是否应提交、是否应通过行业协会联合提交、有哪些立场不应采取）
> 若需找律师：你所在地的律师协会转介服务是最快的起点（美国各州律协；英格兰与威尔士 SRA / BSB；苏格兰/北爱/爱尔兰/加拿大/澳洲的 Law Society；或你辖区的对应机构）。

**仅** 跟踪视图、截止日提醒、以及「不提交 / 弃权」决策**不需要**过此门。

## 示例

最小决策登记 + 后续动作：

```
/regulatory-legal:comments --decide CMT-007
决策：提交
理由："就第 3 节数据留存义务提交意见"
→ [若非律师] 触发 consequential-action 决策门，等待明确「是」
→ 写回 comment-tracker.yaml：status=filing
→ 追加内部复核提醒：意见截止日 2026-07-15 − 5 个工作日 = 2026-07-08
```

不提交（无需过门，直接写回）：

```
/regulatory-legal:comments --decide CMT-003
决策：不提交
理由："该规则不适用于我们的业务模型"
→ 写回 status=not-filing，移入「近期已决」
```

## 注意事项

- **决策门是硬约束**：非律师角色下，未获明确「是」不得登记「提交」、不得产出可提交草稿；仅跟踪/提醒/不提交/弃权 例外。
- **内部截止日 = 意见截止日 − 5 个工作日**：是工作日不是自然日，跨周末/节假日要顺延，别把内部复核压到最后一刻。
- **不静默补全**：NPRM 文本或截止日缺失/含糊时停下发问，不要用网络检索或模型记忆悄悄补齐；补来的信息打 `[网络检索—待核实]` / `[模型知识—待核实]`，由律师决定是否采信。
- **跟踪器为空 / 责任人缺失**：决策门读不到角色时，按非律师从严处理（先过门）；摘要中 Owner 留空并提示补齐，以便提醒能正确 DM。
- **去叙事化**：直接写回跟踪器，不要在输出里旁白「已添加到跟踪器…」——做了就做了，别复述状态变更。
- 结尾给出「下一步决策树」（起草意见函 / 升级上报 / 补充事实 / 观望 / 其他），由律师选择，而非替其锁定。

## 互见

- related：`general-counsel-advisor` —— 是否值得提交、立场如何把握，需要法务总监级别的判断。
- combines_with：`regulatory-policy-diff` —— 制度差距分析的「预规则分支」会点名「是否值得提交意见、意见截止日与决策责任人」，正好交本技能登记与跟踪。
- related：`fact-checking` —— 核验意见函中引用的法规引文是否被臆造、误引或过时。

---
本条采编自 anthropics/claude-for-legal（Apache-2.0）。
