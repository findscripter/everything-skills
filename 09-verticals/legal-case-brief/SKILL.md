---
name: legal-case-brief
title: 判例摘要(case brief)
description: 当法学生用自己的格式做判例摘要、或被「逼问」复述判决要旨以备进大纲/考试时使用；提供其格式的空白模板并就薄弱小节追问，把判例提炼成 事实/争点/判决/说理/规则 的可复用要点，粘贴原文时摘录法院原话；不适用于仅凭案名替学生写整篇摘要、做「帮我总结这个判例」、判断考点；触发词：判例摘要、case brief、brief 这个案子、判决要旨、holding、案例 brief
domain: 领域/legal
triggers: [判例摘要, case brief, brief 这个案子, 判决要旨, holding, 案例 brief]
tags: [legal, law-student, case-brief, holding, irac, study]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [法律检索工具 (Westlaw/Fastcase/CourtListener), markdown]
requires: []
related: [deposition-outline-prep, general-counsel-advisor, litigation-chronology-builder]
combines_with: [deposition-outline-prep]
license: Apache-2.0
source: anthropics/claude-for-legal
source_license: Apache-2.0
---
## 何时使用

法学生要把一个判例做成**自己格式**的 case brief（判例摘要），以便写进课程大纲、背诵、备考时使用。判例摘要是「记住这个案子干了什么」的记忆工具——格式必须是学生真正会用进大纲的那一种。

**不该用（负边界）：**
- **不凭案名替学生写整篇摘要。** 「帮我总结这个判例」一律拒绝——摘要的价值在于「为了记住而亲手写」，代写正是学生要学着不再依赖的那件事。本技能默认是**搭脚手架**：给空白模板、就薄弱小节追问、纠正理解偏差，让学生自己填。
- **唯一例外**：学生显式声明已反复读过、卡在措辞上（如「我读了三遍，就是说不清 holding，给我一句起手句让我改写」），此时只给最小起手句并打 `[VERIFY]` 标，要求其用自己的话重写后才进大纲。
- 不判断考点（「全都 brief，考试会给你惊喜」）。

## 步骤

1. **载入学生格式偏好**：从练习档案（学生年级、大纲格式/深度、drill-me 或 explain-to-me 学习风格）读取其偏好格式；缺省则用下方默认模板。
2. **判定置信度（核心纪律，决定怎么填）**：
   - **学生粘贴了判例原文** → 从眼前文本提取 holding/规则/说理，摘录法院**原话**。置信度高。
   - **学生只给案名** → 凭模型知识 brief，价值低得多。逐行给不确定的标 `[UNCERTAIN: 具体原因]`，强烈建议进大纲前对一手判例核验；若对该案了解不足，直说。
   - **该案有著名但有争议的解读** → 给多数派读法并打 `[VERIFY: 查教材与教授的框定]`。
3. **模式分支**：
   - **drill-me 模式（逼问式）**：先逼学生一句话复述 holding——「你读过这个案子了。holding 是什么？一句话。」说不出 → 让其重读（摘要是记忆辅助，不是读判例的替身）。然后依次逼问 事实、争点、说理、规则；对单薄或错误的复述要顶回去。
   - **explain-to-me 模式（讲解式）**：同样的脚手架流程，语气更软，先讲「好的 holding 长什么样（一句话、是/否 + 规则）」再引导学生自己写内容。**「讲解式」不等于「替我写摘要」**。
4. **产出模板 + 追问，而非填好的摘要**：给空白模板，让学生逐节填；技能负责审阅、顶回、提示缺什么。对薄弱小节定点追问：「法院真正依赖的关键事实是哪些？」「窄争点 vs 更宽的问题分别是什么？」「法院为什么否定异议意见的框定？」
5. **纠正错误理解**：「你说 holding 是 X，但法院原话更接近 Y。哪个才是你要带进大纲的规则？」
6. **深度校准**：1L 还在学读判例 → 更完整的摘要；3L 备考律考 → 只要规则 + 引证。匹配学生格式。

## 指令

- **「别替我 brief」硬规则**：每种模式都默认搭脚手架，不替学生写。学生粘贴原文时摘录法院原话进 事实/holding/说理 槽位——这不是代写，是指向判例本身。
- **置信度纪律不可省**：摘要陈述 holding、规则、说理；写错会把大纲变成错误地图。凡凭记忆得出而非来自眼前原文的行，逐行打 `[UNCERTAIN]` 或 `[VERIFY]`。「建立在我猜测 + 你善意之上的摘要，比没有摘要更糟」——宁可标「我不确定，自己读」也不要编。
- **引证核查标头不可剥除**：模板末尾保留引证核查声明（AI 生成的案名、引语、权威引证未经核实，进大纲/备忘/考试答卷前须在 Westlaw/Fastcase/CourtListener 或学校检索工具核验；AI 引证有时是杜撰或误引）。
- 输出按学生练习档案标「STUDY NOTES — NOT LEGAL ADVICE」（学习材料，非法律意见，未经核对学校荣誉准则与教授 AI 政策不得当作评分作业）。

## 示例

默认模板（学生格式缺省时用）：

```markdown
## [案名], [引证]

**Court:** [法院, 年份]

**Facts:** [对 holding 有意义的事实——不是每个事实，而是法院依赖的那些。两到四句。]

**Procedural posture:** [怎么走到这一步的？一审判了 X，本案是对此的上诉。一句话。]

**Issue:** [法院回答的问题。措辞为是/否问句。]

**Holding:** [答案。一句话。是/否 + 规则。]

**Reasoning:** [为什么。法院的逻辑。法律在这里。三到五句。]

**Rule:** [你要写进大纲的规则。可移植的核心要点。]

**Notes:** [值得记的异议意见？按这些事实可区分？教授如何强调？]

---

**Citation check.** 上面的案名引证、引语和任何支撑权威均由 AI 模型生成、未经核实。在你依赖它们之前——无论是写进摘要、备忘、大纲条目还是考试答卷——务必在 Westlaw、Fastcase、CourtListener 或学校检索工具上查证。AI 生成的引证有时是杜撰或误引。
```

标记纪律（构建/审阅时内联使用）：`[UNCERTAIN: 法律命题]`（未对现行权威核实）、`[VERIFY: 具体核查动作]`（如查教材与教授框定）。

## 注意事项

- **drill-me 模式的 holding 检查就是「没读过不准 brief」的闸门**：复述不出 holding 就回去读判例。
- 凭记忆 brief 必须打标——只给案名时，每行不确定的都要 `[UNCERTAIN]` 或 `[VERIFY]`；未对一手判例核实前别进大纲。
- 一句话 holding 的判据：是/否 + 规则；窄争点要和宽问题分开。
- 学习材料不是法律意见；荣誉准则与教授 AI 政策优先，输出不得直接当评分作业。

## 互见

- related：`deposition-outline-prep`、`general-counsel-advisor`、`litigation-chronology-builder` —— 同属法律领域，前者复用「逐字引用须有原文、引证须核验、来源标注」的同款纪律。
- combines_with：`deposition-outline-prep` —— 案件理论与判例规则可彼此印证，摘要里的规则进而支撑质询提纲的命题构建。

---

本条采编自 anthropics/claude-for-legal（Apache-2.0）。
