---
name: workplace-internal-investigation
title: 职场内部调查框架
description: 当要从立案到结案管理内部调查（HR/财务/高管/吹哨人）时使用；建特权调查日志 log.yaml、按类型生成来源清单、对文档批量「捞针」抽取并全量留痕、按日志做覆盖/冲突 Q&A、出 HR/董事会/外部律师分众摘要；不适用于替律师作处分决定、保证特权、做访谈或给 Upjohn 警告。触发词：内部调查, 开案调查, 调查日志, 捞针, 证据缺口, Upjohn, investigation log
domain: 领域/legal
triggers: [内部调查, 开案调查, 启动调查, 调查日志, 捞针, 证据缺口, 来源清单, 分众摘要, Upjohn, Weingarten, Garrity, internal investigation, investigation log, sources checklist, needle-finding]
tags: [legal, employment, investigation, work-product, privilege, hr, whistleblower, intake]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [yaml, markdown]
requires: []
related: [investigation-memo-drafter, legal-hold-manager, litigation-chronology-builder, privilege-log-reviewer, general-counsel-advisor, deposition-outline-prep]
combines_with: [investigation-memo-drafter, legal-hold-manager, general-counsel-advisor]
license: Apache-2.0
source: anthropics/claude-for-legal
source_license: Apache-2.0
---

# 职场内部调查框架

## 何时使用

- 需要从**立案到结案**端到端管理一项内部调查：HR（骚扰/歧视/报复）、财务舞弊、高管不当行为、吹哨人报复。
- 要建立并维护一份**特权调查日志**（log.yaml），对文档转储做「捞针」式抽取、跟踪来源覆盖、随时能回答「我们还缺什么 / 哪里账述冲突」。
- 用户说「开一个调查」「启动对……的调查」「把这批文档/访谈记录加进调查」「给我出个 HR 摘要」。

内部调查有两种失败：**覆盖缺口**（该采的来源没采）与**综合缺口**（采了的证据没被串起来）。本框架两头都管。

不该用的边界：
- **不替律师/HR 作纪律处分决定**——它支撑律师的事实认定，不替 HR 拍板处分。
- **不保证特权**——特权取决于调查是否律师主导、文档制作目的及后续使用/披露，**不取决于文件怎么标注**。
- **不进行访谈、不给 Upjohn 警告**——它只把访谈记录与「是否给过 Upjohn」记进日志。
- **不处理无法解析的文件**——读不了的格式标记为「人工复核」。
- **写/更新备忘录走 `investigation-memo-drafter`**（本框架的 Mode 4 已拆为独立技能）。

## 步骤

⚠️ **开案前先确认：调查是否律师主导？** 若由 HR 主导、法务仅顾问角色，或非为获取法律意见而由律师发起——特权分析实质不同，默认标注可能误导。先把这个问题抛给律师，再建任何日志或文件。**标注不创设特权。**

本框架四种工作模式（Mode 1–3、5；Mode 4=写备忘录见互见）：

### Mode 1 — 开案（"开一个调查"）

**Step 1 立案问询**，一次性问全：指控白话、投诉人/触发源（投诉/举报/审计/经理观察）、被调查人、行为大致时间、**是否律师主导**；调查类型（HR/财务/高管/吹哨人/其他，决定来源清单模板）；以及两道并行法框旗标——
- 被调查人/投诉人/证人是否有工会代表或受集体谈判协议覆盖？→ **Weingarten 旗标**（调查性访谈中的代表权可能改变访谈流程）。
- 公司是否为公共雇主（政府机构、公立大学、州/市机构）或以州权力行事？→ **Garrity 旗标**（公共部门被迫陈述有特殊的免用特权后果，改变访谈如何进行与记录）。

任一旗标触发：先研判适用规则（Weingarten 查 NLRA/各州公共部门劳动法；Garrity 查第五修正案及 Garrity 系列判例与州类比），引一手法源、验时效，**调整流程前不得访谈**。

**Step 2 建案件目录与文件**：在案件目录下创建——
- `log.yaml`：含工作成果抬头、案件元数据、`attorney_directed: true/false`、`issues:`（从指控派生）、`entries: []`、`evidentiary_gaps: []`。
- `documents-reviewed.yaml`：`total_reviewed: 0` / `total_surfaced: 0` / `documents: []`。
- `sources-checklist.yaml`：由调查类型生成（见「指令」四套模板）。

**Step 3 来源清单**：按类型生成清单，呈给律师问「是否贴合？哪些标 N/A？还有无本案特有来源？」，确认后写入 `sources-checklist.yaml`。

### Mode 2 — 加数据（"把这批文档/访谈加进调查"）

1. **认案件**：多个调查目录则问归属，单个则继续。
2. **认数据类型**：访谈记录（谁的）/ 文档批 / 律师批注 / Upjohn 确认。
3. **文档捞针**（见「指令」7 条 pull 标准，**宁可误报勿漏**），每份文档定性：`surfaced`（命中→写日志条目）或 `reviewed-nothing-significant`（仅一行描述入 `documents-reviewed.yaml`）。**批后报告**捞针统计（这就是对「漏没漏针」的回答——标准已记录、捞出比例可见、全量可查）。
4. **写日志条目**：每条 surfaced 项 append 到 `log.yaml`（字段见示例），含 `contradicts_entry`/`corroborates_entry` 关联、`significance`、`pull_criterion`、`privilege`。证据缺口写入 `evidentiary_gaps`。
5. **更新来源清单**：对应清单项问律师标 complete/in-progress，**不自动标完成**——由律师判断来源是否已充分覆盖。

### Mode 3 — 查日志（任何对调查的提问）

**答前先读全量日志。** 五类查询：
- **事实查询**（"X 关于 Y 说了什么"）：据日志条目作答并引 entry_id；若日志无此项→「我在本调查日志（N 条）中未见关于〔主题〕的任何信息，可能值得标为缺口。」
- **冲突查询**：列出全部 `contradicts_entry` 关联，逐条说明冲突是什么、哪些条目相抵、有无文档证据涉及。
- **覆盖查询**（"还缺什么"）：读 `sources-checklist.yaml` + `evidentiary_gaps`，报开放清单项、已记缺口、账述提到但尚未采集的来源。
- **强度查询**（"各争点最强证据"）：逐争点列最高 significance 条目、文档印证、未决冲突。
- **Upjohn 查询**：核清单项与标为 Upjohn 的日志条目，未完成则旗标。

### Mode 5 — 分众摘要（"给〔受众〕出个摘要"）

先问受众与所支撑的决策。三套（密级/内容/抬头各异）：
- **HR 摘要**（处分决策）：发生了什么（事实，无法律分析）+ 各指控认定 + 建议措施；**不含**特权分析/可信度方法/敞口评估/律师心证；**不含 entry_id 与文档引用**；抬头 `Confidential — HR Use Only — Do Not Distribute`。
- **领导/董事会摘要**（治理决策）：一段指控与范围 + 关键认定 + 高层次业务敞口（无具体法律分析）+ 公司应对；带工作成果抬头。
- **外部律师交接**（转诉讼/深审）：含敞口分析、未决证据线索、仍争议的可信度问题、诉讼中最关键文档；带工作成果抬头。

⚠️ **对外响应闸门**：若摘要/内容意在**对外回应**（EEOC/州机构指控回函、对方律师索赔函回应、监管回函），且角色为非律师——先经律师；此处立场可能成日后程序中的自认、可能无意弃失抗辩、可能丧失对调查的特权。给一页交律师的简报（指控/法域/期限 → 调查所得 → 未决线索 → 拟议响应隐含让步 → 可能出错点 → 要问律师什么），**未得明确「是」不得越过此闸门出对外稿**。

## 指令

**捞针 pull 标准（命中任一即 surface，刻意略偏激进）：**
1. 含调查任一当事人姓名（投诉人、被调查人、日志已记证人）。
2. 由当事人在关键行为期间撰写或收受。
3. 含指控类型相关关键词（立案与既有日志识别，**随账述涌现的新词持续更新关键词表**）。
4. 含显式/隐式自认（"I shouldn't have," "I know how this looks," "don't put this in writing," "delete this"）。
5. 含与日志中既有账述矛盾的语言——**标出具体矛盾及所抵触的日志条目**。
6. 含诉讼中敏感语言：歧视性措辞、威胁、对受保护特征/活动的讨论、匹配指控模式的财务异常。
7. 是先前账述提到、但文档集尚未出现的文档类型（如访谈提及某会议但未见日历邀请）→ **记为证据缺口，不算 surfaced 文档**。

**四套来源清单模板**（按调查类型生成，每项 `id/source/status: open/notes`），共性首项与末项要点：
- **HR**：投诉人/被调查人/证人访谈、邮件消息复核、HR 记录（被调查人绩效史/历史投诉/历史处分）、历史投诉、对照组数据、相关政策（**行为发生时生效版本**）、组织架构、日历记录、**Upjohn 警告文档**。
- **财务舞弊**：费用报告、审批记录、供应商/承包商记录、财务系统记录(AP/GL)、邮件消息、对象/审批人/对手方访谈、审计日志（系统访问）、既往审计、**Upjohn 文档**。
- **高管不当**：对象访谈、董事会/薪酬委员会记录、雇佣协议及修订、股权记录、费用与审批、邮件消息、利益冲突披露（或缺失）、外部业务活动、证人访谈（直属/同级/董事）、既往投诉、**Upjohn 文档**。
- **吹哨人**：投诉人访谈、原始投诉/举报、底层指控相关记录、受保护活动后对投诉人不利行动的记录、决策者访谈、对照组数据（未从事受保护活动的可比员工待遇）、邮件消息、**时序分析（受保护活动与不利行动的时间接近度）**、被调查人/决策者访谈、**Upjohn 文档**。

**工作成果抬头与传播纪律**：本框架所有产物继承底层调查的特权与密级状态。抬头按角色取自插件配置（律师：`PRIVILEGED & CONFIDENTIAL — ATTORNEY WORK PRODUCT — PREPARED AT THE DIRECTION OF COUNSEL`；非律师：`RESEARCH NOTES — NOT LEGAL ADVICE`）。向特权圈外分发（转给调查组外非律师、未限缩抄送 HR、交业务侧）可能对整项调查弃权。

**来源归属标签**：引用规则/判例标 `[CourtListener]`/`[statute / regulator site]`/`[user provided]`/`[model knowledge — verify]`，标签描述出处而非把握度。涉及时效的法源（Weingarten/Garrity）须验当前有效性。

## 示例

`log.yaml` 中一条 surfaced 文档条目：

```yaml
- entry_id: 12
  entry_type: document        # interview / document / attorney-note / gap
  date_of_event: "2025-03-14" # 事件发生日，非入库日
  date_logged: "2026-06-02T10:30:00"
  source: "email_thread_subject-reimbursement.eml"
  source_type: document       # complainant / respondent / witness / document / attorney-note
  issues: ["alleged expense fraud"]
  significance: high          # high / medium / background
  summary: "被调查人对审批人写道 'don't put the dinner on the report'，2-5 句。"
  quote: "don't put the dinner on the report"
  contradicts_entry: 7        # 与 entry 7 的账述矛盾；否则 null
  corroborates_entry: null
  credibility_note: ""
  pull_criterion: "4 (隐式自认) + 5 (与 entry 7 矛盾)"
  privilege: attorney-work-product
```

证据缺口：

```yaml
- gap_id: 3
  description: "投诉人提到 3/14 的会议，但未见任何日历邀请被复核"
  identified_from: "entry 9（投诉人访谈）"
  source_to_obtain: "Outlook 日历导出，被调查人 2025-03"
  priority: high
  status: open
```

文档批处理后的报告：

```
Document review complete.
Reviewed: 142 documents
Surfaced: 9 as potentially significant
Logged as reviewed / nothing significant: 133
New evidentiary gaps identified: 2

Surfaced items:
[逐条：一行描述 + 触发的 pull 标准号]
```

> 「我在已复核的 142 份文档中未见关于〔某主题〕的任何文档」——只有当**每份复核过的文档都已留痕**时，这句话才是有意义的陈述。

## 注意事项

- **标注不创设特权**：抬头反映意图但本身不成立特权。**开案前先确认是否律师主导**，否则默认标注可能误导，先把问题抛给律师。
- **宁可误报勿漏**：捞针标准刻意偏激进——surface 一个假阳性，好过漏掉一个重要项。
- **不自动标来源完成**：是否充分覆盖由律师判断。
- **关键词表是活的**：随访谈与文档涌现的新术语持续更新 pull 标准 3 的关键词。
- **不静默补漏**：法律检索工具返回稀少时，报所得并停下选项交律师，不替其接受低可信来源；涉及效力/时效的旗标即使不用来改分析，也作 `[model knowledge — verify]` 旁注让律师知晓。
- **结尾给「下一步决策树」**：定制到本次产出（如开案后→加首批数据/排来源/写备忘录；选项由律师选，非替其定）。

## 互见

- requires：无强制前置。
- related：`investigation-memo-drafter`（**本框架 Mode 4**：从此日志生成/更新调查备忘录）、`legal-hold-manager`（调查并行常需签发证据保全）、`litigation-chronology-builder`（日志时序接诉讼时间线）、`privilege-log-reviewer`（产物特权状态判定）、`general-counsel-advisor`（升级与法律意见）、`deposition-outline-prep`（可信度与询问提纲互通）。
- combines_with：`investigation-memo-drafter` —— 日志攒够后写出按争点组织的备忘录；`legal-hold-manager` —— 同步保全相关保管人的证据；`general-counsel-advisor` —— 就结论与敞口给 GC 级判断与升级。

---

本条采编自 anthropics/claude-for-legal（Apache-2.0）。
