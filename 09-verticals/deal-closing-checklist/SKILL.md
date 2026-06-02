---
name: deal-closing-checklist
title: 交易交割清单管理
description: 当并购/投融资交易要维护交割清单、跟踪先决条件与交付物状态、回答「还差什么才能交割」并识别关键路径与天数时使用；做的是从购买协议初始化、自动吸纳尽调的交割前动作、更新单项状态、产出「阻断项+关键路径+距交割天数」报告；不适用于实际取同意/递申报/起草文件，也不替律师判定阻断项或签发「可交割」证明。触发词：交割清单、closing checklist、还差什么交割、先决条件、关键路径。
domain: 领域/legal
triggers: [交割清单, closing checklist, 还差什么交割, 清单状态, 加进清单, 先决条件, condition precedent, closing deliverable, 关键路径, 距交割天数]
tags: [legal, m-and-a, closing-checklist, deal-closing, condition-precedent, corporate, tracker]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [VDR MCP (Box/Intralinks/Datasite), Slack, Westlaw, CourtListener]
requires: []
related: [diligence-issue-extractor, general-counsel-advisor, litigation-chronology-builder]
combines_with: [diligence-issue-extractor, general-counsel-advisor]
license: Apache-2.0
source: anthropics/claude-for-legal
source_license: Apache-2.0
---
# 交易交割清单管理

## 何时使用

- 用户说「交割清单」「还差什么才能交割」「清单状态」「把某项加进清单」，或按排期做状态拉取时。
- 需要把购买协议里的先决条件（CP）、交割交付物、交割前到期的承诺，集中成一张带状态的清单，并随时回答：什么在阻断交割、关键路径是哪几项、距目标交割还有几天。

**不该用的边界（本技能不做）：**
- 不取得同意、不递交申报表、不起草文件——只跟踪「这些事需要发生」。
- 不判定哪些属阻断项——由购买协议决定，本技能读协议而非替协议下结论。
- 不交割交易，只告诉你何时可以交割。
- **不签发**「可交割 / 全部 CP 已满足」证明或交割备忘——这有法律后果，须过下方「重大行动闸门」并取得明确同意。状态跟踪与「阻断项」报告不需闸门。

## 步骤

清单以 YAML 存于交易文件夹（如 `deals/[交易代号]/closing-checklist.yaml`）。先读取它，再按下方模式执行：**有状态更新走模式 3；否则默认模式 4（阻断项+关键路径+天数）。**

清单结构：

```yaml
deal_code: "Project Falcon"
target_close: [DATE]
signing_date: [DATE]
last_updated: [DATE]

conditions_precedent:
  - id: CP-001
    item: "HSR 等待期届满"
    category: "Regulatory"
    responsible: "Buyer counsel"
    due: 2026-04-15
    status: "Filed 2026-03-01, waiting period runs"
    blocking: true
    source: "Purchase Agreement §7.1(a)"

closing_deliverables:
  - id: CD-001
    item: "目标公司良好存续证明（DE）"
    category: "Corporate"
    responsible: "Target counsel"
    due: 2026-04-28
    status: "Not started"
    blocking: true
    source: "Purchase Agreement §2.3(b)(iv)"
```

### 模式 1：从购买协议初始化

读已签或近终稿的购买协议，逐条抽取（章节位置因协议而异，按实际标题读）：每一项先决条件、每一项交割交付物（交付物清单或对应章节）、每一项有交割前期限的承诺。每项成为一行清单条目，附上协议章节出处。

**填监管/审批类条目前先做调研，不要凭记忆填时间假设。** 反垄断、外资审查、行业审批（HSR、CFIUS、行业监管申报等）的机制、门槛、时窗各管辖区不同且会变。从协议抽出每项监管条件的名称后，调研其当前生效机制（谁申报、何时、什么触发二次问询、等待期多长），引用一手来源并核验时效。

**MAC/MAE（重大不利影响/变化）类条件**是谈判出来的、非标准条款：从协议提取定义术语，按所用具体措辞调研适用法（特拉华、纽约等对例外项与定量测试处理不同），再判断某事件是否构成潜在 MAC 触发。**重大合同的同意要求抽取**取决于适用法默认规则与各合同的反转让条款——逐合同调研，勿套默认。

### 模式 2：从尽调自动吸纳（「自更新」部分）

当上游技能产出含交割前动作的发现时触发。吸纳来源：尽调问题提取（`diligence-issue-extractor`）中任何被标为交割动作的发现（同意、股东表决、董事决议、监管申报、解除、托管机制、清偿函等，不止「同意」）；重大合同清单的控制权变更/转让条款；交易团队简报汇总出的、单看各备忘会遗漏的复合动作（如跨多份雇佣协议汇总的 §280G 净化表决、组合式同意包）。

按交接 schema 吸纳，**保留上游填的每一个字段**，勿坍缩。如「需 Dunmore 同意，附替代担保条件、提前 30 天通知」三要素须全部上清单，不可缩成「Dunmore 同意控制权变更」：

```yaml
handoff:
  item: "[对手方或动作，一行]"
  category: "[第三方同意 | 股东/董事会行动 | 监管申报 | 解除/终止 | 托管/预留 | 交割交付物]"
  source: "[合同名 / 法条 / VDR 路径+Bates]"
  blocking: true            # 除非协议含重要性限定
  severity: "[🔴/🟠/🟡/🟢 —— 从上游承继，见严重度下限规则]"
  counterparty: "[如 Dunmore Holdings LLC]"
  guarantor: "[如 需买方母公司担保，或 N/A]"
  conditions: "[对手方附加的实质条件，如 同意生效前需买方母公司出具替代担保]"
  notice_deadline: "[如 交割前 30 天，或具体日期]"
  approval_body: "[股东 | 董事会 | 委员会 | 监管机构]"
  approval_threshold: "[如 §280G 净化需 75% 无利害关系股东表决]"
  estimated_time_to_complete: "[如 30 天]"
  must_occur_before: "[如 交割 | 签约 | 间歇期结束]"
```

追加入清单。**去重按（对手方 + 动作类型）**，不按自由文本的 item 名——Dunmore 的「同意」与「解除」是两项。去重时**合并字段而非覆盖**：若一条交接填了 `guarantor`、后一条填了 `notice_deadline`，该行两者都留。上游给了严重度就承继（严重度下限规则：下游不得静默降级，要降须写明「上游评为 X，我降为 Y 因为……」）。

### 模式 3：状态更新

用户（或数据室监视代理）给出更新，找到该项，更新 status 与 last-updated。例：

```
CP-002：Acme 已回复，同意函已附，待反签
```

### 模式 4：什么在阻断（默认输出）

```markdown
[工作成果抬头 —— 按配置「输出」一节，随角色不同]

> 本状态报告derived自购买协议、尽调发现与内部交易记录，继承其特权与保密状态；超出特权圈（对手方、更广业务团队）分发可能导致特权丧失。发送前确认分发清单。

## 交割清单状态 —— [交易代号] —— [日期]

**目标交割：** [日期]（还剩 [N] 天）
**条目：** 共 [N] —— [N] 完成 / [N] 进行中 / [N] 未开始

### 🔴 阻断且有风险
| ID | 条目 | 到期 | 状态 | 距到期天数 |
|---|---|---|---|---|
| CP-XXX | … | … | … | **N** |

### 🟡 阻断、在轨
[同上表]

### ✅ 已完成
[N] 项 —— [折叠列表]

### 不阻断（交割后/参考）
[N] 项

---
**关键路径：** [一旦滑期就会推迟交割日的那一项/几项]
```

**关键路径分析（决定排序）：** 阻断项不等权。耗时 30 天的同意是关键路径，2 天能拿到的良好存续证明不是，即便两者都阻断。为每个阻断项估算完成耗时，凡 `(到期日 − 今天) < 估算耗时` 的即「有风险」，置于每份报告最顶部。

清单超过约 10 项或用户要求时，提供仪表盘：按状态计数（完成/进行中/未开始/有风险）、按工作流分组的关键路径视图、含条目/负责人/到期/距到期天数的可排序网格。

## 指令

**重大行动闸门（签发交割证明前）：** 在产出「可交割 / 全部 CP 已满足」证明或交割备忘前，读配置「谁在使用本技能」。若角色为**非律师**，先提示：「证明交割条件已满足会有法律后果——它是驱动资金流转与交割后义务的信号。是否已与律师审阅？是则继续；否则带以下简报去找律师：完整 CP 清单及状态 / 完成证据薄弱或缺失之处 / 来不及完成项所需的弃权或补充协议 / 未决问题（对手方同意仍pending、MAC/bring-down 风险）/ 该问律师什么。」**未获明确「是」之前，不得越过此闸门产出最终「可交割」证明。**

来源与时效（强约束）：监管时机、MAC 解释、同意默认规则一律调研一手来源并标时效，不凭记忆填；带 `[…— verify]` 标签的优先核查；检索返回过薄时只报所得并停止、不静默补充。

## 示例

输入：「Project Falcon 的交割清单，还差什么？」（无状态更新 → 模式 4）

代理动作：读 `closing-checklist.yaml` → 为每个 `blocking: true` 项估完成耗时并算「距到期天数」→ 凡 `(到期−今天)<耗时` 标为 🔴 有风险置顶 → 按 🔴有风险 / 🟡在轨 / ✅完成 / 不阻断 分组出表 → 标出关键路径（最长耗时且无缓冲的阻断项）→ 加工作成果抬头与特权提示。

输入：「CP-002：Acme 已回复，同意函已附，待反签」（含状态更新 → 模式 3）

代理动作：定位 CP-002 → 更新 `status` 与 `last_updated` → 简短回执，不narrate。

## 注意事项

- 数据室监视代理每日核清单、从邮件/Slack（若已连）拉状态更新、向交易团队频道发「阻断项」报告——模式 4 即其输出。
- 去重按（对手方+动作类型），合并字段不覆盖；上游严重度作为下限承继，不静默降级。
- 监管/MAC/同意规则随管辖区与措辞变化，凭记忆填时机假设是高发错误；一律调研一手来源并标时效。
- 状态报告继承底层材料的特权/保密状态，分发前做目的地检查（公开频道、对手方、更广业务团队会令特权丧失）。
- 非律师角色未获明确同意，不得签发「可交割」证明或交割备忘；状态跟踪报告不受此限。

## 互见

- requires：（无）
- related：`diligence-issue-extractor` —— 尽调发现的交割前动作是本清单的上游来源；`general-counsel-advisor` —— 阻断项判断与法律边界把关；`litigation-chronology-builder` —— 同源交易/诉讼时间线方法。
- combines_with：`diligence-issue-extractor` —— 自动吸纳其交割动作发现汇入清单；`general-counsel-advisor` —— 配合做「可交割」决策与升级。

---

本条采编自 anthropics/claude-for-legal（Apache-2.0）。
