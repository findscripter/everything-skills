---
name: deposition-outline-prep
title: 证人质询提纲准备
description: 当为某位证人准备出庭质询/取证（deposition）提纲时使用；按案件理论从 eDiscovery 平台调取其文件、围绕证人立场组织主题并整理弹劾材料，产出可朗读的结构化质询提纲；不适用于代证人撰写证词陈述、替律师临场决定问什么或预测证人回答；触发词：证人质询提纲、取证提纲、depo prep、deposition outline、弹劾材料、cross-examination
domain: 领域/legal
triggers: [证人质询提纲, 取证提纲, depo prep, deposition outline, 弹劾材料, cross-examination]
tags: [legal, litigation, deposition, witness, ediscovery, cross-examination]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [eDiscovery 平台 (Everlaw/Relativity/DISCO), 法律检索工具 (Westlaw/CourtListener/Trellis/Descrybe), markdown]
requires: []
related: [litigation-chronology-builder, diligence-issue-extractor, privilege-log-reviewer, legal-hold-manager]
combines_with: [litigation-chronology-builder, legal-hold-manager]
license: Apache-2.0
source: anthropics/claude-for-legal
source_license: Apache-2.0
---
## 何时使用

为某位证人准备 deposition（出庭质询/取证）提纲时使用：从案件理论出发，调取该证人相关文件，围绕其立场组织主题，整理可在现场朗读的弹劾与确权问题序列。

**不该用（负边界）：**
- **不替证人撰写证词陈述。** 英格兰及威尔士 PD 57AC（及美国 declaration/affidavit）禁止由他人以证人口吻凭时间线或文件「代写」证词；法院正在制裁 AI 辅助代写证词。本技能只做：拟问题提示以唤起证人本人回忆、记录并整理证人原话、生成其查阅过的文件清单、对证人已起草的陈述跑 PD 57AC 合规清单、起草律师合规证明。证据由证人给出，不由模型杜撰。
- 不代替律师出庭、不预测证人会怎么答、不在现场临时决定追问什么——这些是律师的庭上判断。

## 步骤

1. **载入案件上下文**：从案件配置读取案件理论、关键支点事实（pivot fact）、对我方有利/不利事实、eDiscovery 平台。
2. **利益冲突闸门（不可绕过）**：先在事项日志（`matters/_log.yaml`）核对该 matter slug。若该事项未登记，拒绝并引导用户先跑 matter intake 流程跑冲突检查，再回来建提纲。
3. **明确证人**：姓名、角色、与案件关系；以及「为什么取证这名证人」——这个「为什么」要接回案件理论；若该证人能确立支点事实，那就是提纲的核心。
4. **判定证人立场（写第一个问题前先分支）**：
   - 敌对/对方证人 → 交叉询问式：封闭、诱导、一次一个事实，「搭笼子」。
   - 友好/我方证人 → 直接询问式：开放式问题让证人讲故事；对自家证人用封闭诱导问题通常不当且损害可信度。
   - 中立第三方 → 混合：先开放取故事，再封闭钉细节。
   - 公司代表（30(b)(6) 或州对应程序）→ 研究指定主题、约束实体的规则、以及证人个人认知 vs 公司认知之区分。
5. **研究适用规则并标注来源**：检索该法域与证人类型的取证规则（FRCP 30 / 州对应规则 / 地方规则 / 法官常规命令），引用一手来源。
6. **调取证人文件**（从 Everlaw/Relativity/DISCO）：证人撰写的、收发的、被点名提及的文件，以及其在场的日历/会议记录；按日期组织，标出对案件理论最关键的「热文件」。
7. **构建主题并写提纲**（见下方模板）。

## 指令

- **口头校准——别贪全。** 提纲是现场朗读的口头辩护。只挑真正重要的 3-4 个主题；4 小时取证配 200 问会逼律师跳读，而跳读正是问询线索中途丢失之处。最强的弹劾放最前（证人开场最清醒，开庭笔录开头几页最可能被法官/陪审团看到）。提纲若因记录深厚而长，要明说并标出哪里该收拢。
- **逐字引用必须逐字。** 凡给对方律师、证人、其他被取证人、法庭或任何记录文件加引号的话，必须手上有确切原文并能定位引用，否则：用不加引号的转述并清楚归属（如「证人此前作证称 X `[verify against record — Tr. p. __]`」）；标占位符 `[verify exact quote — record cite pending]`；**绝不填空**——编造的先前陈述会在证人否认、笔录又不支持的瞬间毁掉整个弹劾。
- **精确引证必须支撑整个命题。** 若弹劾点是「证人在某日说了 X、Y、Z」，须核实该引证同时支撑 X 且 Y 且 Z；只支撑 Z 就拆开引证（X 见 Tr. p.10、Y 见 p.12、Z 见 p.15）或收窄命题。
- **不擅自补料。** 若法律检索工具返回结果稀少，报告所得并停下；不要私自用网络搜索或模型知识填空，而是给出选项（拓宽检索 / 换工具 / 网搜并打 `[web search — verify]` 标 / 留 `[UNCERTAIN]` 标记并停）交律师决定。
- **来源标注，永不剥除。** 每条规则/判例/权威引证标注出处：`[Westlaw]`、`[CourtListener]`、`[Trellis]`、`[Descrybe]` 或 MCP 工具名；网搜来源标 `[web search — verify]`；凭训练记忆标 `[model knowledge — verify]`；用户提供标 `[user provided]`。文件引证（Bates/制作号）保留原生出处。带 `verify` 的引证编造风险更高，取证前须先核。
- **目的地核查与特权。** 提纲为工作成果，继承其特权保护。输出前确认去向是否在特权圈内（公开频道、全员列表、对方律师、供应商、客户都可能弃权）；放在特权材料文件夹、适当标注、分发须审慎决定。
- **主题构建顺序**：背景（始终最前，证人防御前先锁定无争议事实）→ 有利事实（确权后再对质）→ 不利事实（用文件对质，先拿到我方版本）→ 弹劾材料（敌对或矛盾时用：先前不一致陈述、矛盾文件）→ 支点事实序列（最精心构造的一段，问题形式随第 4 步立场而定）。

## 示例

提纲骨架（开头加角色相应的工作成果标头）：

```markdown
# Deposition Outline: [证人姓名]

**Date:** [取证日期]
**Witness role:** [职务、与案件关系]
**Witness posture:** [adverse / friendly / neutral / 30(b)(6)] — 决定问题形式
**Applicable deposition rules:** [FRCP 30 / 州规则 / 地方规则，附精确引证] `[UNCERTAIN — verify currency]`
**Why we're taking this depo:** [一句话目标]
**Theory connection:** [本证人如何契合案件理论]

## I. Background
[封闭问题，一问一事实，锁定无争议内容]

## II. [有利事实主题]
**Goal:** 为简易判决/庭审确立 [事实]。
**Documents:** [Bates] — [描述] — [为何重要]
**Questions:** [序列；每问封闭，层层逼出承认]

## III. [不利事实主题]
**Goal:** 在证人被庭审前辅导之前，按我方条件拿到其对 [不利事实] 的解释。

## IV. Impeachment material（按需使用）
[证人矛盾时用以对质的先前陈述/文件]

## V. [支点事实序列]
**Goal:** [案件成败所系之事实]
[最紧的一段：每问是非题、每问立一事实、搭笼子]

## Exhibit list
| # | Bates | Description | Used in section |
|---|---|---|---|
```

标记纪律（构建/审阅时内联使用）：`[VERIFY: 事实主张]`（未对记录核实的事实）、`[UNCERTAIN: 法律命题]`（未对现行权威核实的法律点）、`[CITE NEEDED: 具体引证]`（记录或权威引证待补）。

## 注意事项

- 取证由律师驱动，提纲只是地图；不预测证人答话，只为可能答案做准备；现场追问交律师当庭判断。
- 「太周全」对口头辩护就是「不聚焦」——宁可少而锐。
- 凡引入提纲的规则/判例均由 AI 生成，取证前须逐条对 Westlaw/CourtListener/检索平台核验时效与范围；先核带 `verify` 标的引证。

## 互见

- fact-checking：本技能对记录逐字引用、精确引证与来源标注的核验纪律，可配合事实核查方法使用。

---

本条采编自 anthropics/claude-for-legal（Apache-2.0）。
