---
name: freedom-to-operate-triage
title: 专利自由实施(FTO)初评
description: 当对某产品/工艺/功能评估是否存在阻断性专利、或被问「这能不能上线」时使用；做围绕 2-5 件最相关专利逐要素的权利要求图(claim chart)首轮比对并产出标注「绿/黄/红」的 FTO 初评备忘（永不下「可自由实施」结论）；不适用于出具正式 FTO 意见、外观/植物专利、权利要求构造、有效性裁断、损害评估；触发词：FTO、自由实施、专利侵权初评、claim chart、阻断性专利、专利风险排查
domain: 领域/legal
triggers: [FTO, 自由实施, freedom to operate, 专利侵权初评, claim chart, 阻断性专利, 专利风险排查, blocking patent, 权利要求图]
tags: [legal, patent, fto, claim-chart, triage, risk-assessment]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [markdown-to-docx]
requires: []
related: [claim-element-chart-builder, ip-infringement-triage, invention-disclosure-screen, ip-portfolio-register]
combines_with: [claim-element-chart-builder, ip-infringement-triage, product-launch-legal-review]
license: Apache-2.0
source: anthropics/claude-for-legal
source_license: Apache-2.0
---
## 何时使用

- 某产品 / 工艺 / 功能在评估是否存在「阻断性专利」，或有人问「这东西能不能上线/发布」。
- 想在请专利律师正式审查前，先就最可能相关的几件专利做一次结构化的逐要素权利要求图（claim chart）首轮比对，给后续 FTO 研究打底。
- 适合在临近发布时「兜下行风险」，或在距离发布尚远时「评估改设计（design-around）空间」。

**不该用边界（命中即转专利律师，本条不越界）：**
- **永不出具正式 FTO 意见，永不下「可自由实施 / 不侵权」结论。** 正式 FTO 意见须由注册专利律师做全面检索、完整权利要求构造、逐要素侵权分析。本条只是「先看看可能有什么」；「未发现明显阻断专利」只代表初评没找到，**不代表产品 clear**。
- 仅分析**实用专利（utility patent）**。号段为 `D`（外观）/`PP`（植物）的一律标记并转出，不做 claim chart；`RE`（再颁）按实用专利处理但加 §252 中间权利与 recapture 标记。外观风险可能同时构成 §43(a) trade dress，另立并行轨。
- 不做权利要求构造（construction 有歧义时标出两种解释，不替律师选）、不裁断有效性（§101/§102/§103/§112）、不起草权利要求、不评估损害敞口。商标 / 商业秘密分析转对应技能。

## 步骤

1. **意图采集（一次问全）**：① 产品/工艺/功能——做了什么、怎么做、你认为新颖处在哪（说技术本质，不是营销话术，含糊就追问一次）；② 技术细节（架构图、权利要求相关规格、公开产品页、规格文档）；③ **辖区**——在哪里 make/use/sell/offer/import（35 U.S.C. §271 下各为独立侵权行为，缺省按美国）；④ 已知专利（竞品组合、SEP 池、NPE 来信、工程师提过的）；⑤ 时机（距发布多远，决定是「改设计」还是「兜下行」）。
2. **检索**：有专利检索连接器（如 Google Patents / Espacenet / PatSnap / 商用专利库）就跑，并记录检索日期、查询式、覆盖辖区、时间窗。**无库则照下「指令」原文写明「未跑专利库检索」，且严禁把模型知识冒充检索结果。** 仅就用户点名或对话中出现的专利展开。
3. **选标的**：挑技术映射最贴近的 2-5 件专利做首轮 claim chart。
4. **逐要素 claim chart**：对每件标的的每条**独立权利要求**逐要素走一遍（见「指令」表）。先字面（literal）侵权，再把「否」的要素单独走等同原则（DOE）旁注，间接/分立侵权仅标记。
5. **开放问题**：列出真正 FTO 研究才能解决的问题（可执行性、审查历史 estoppel、IPR/再审结果、许可可得性、权利人执法历史、维持费/在效状态）。
6. **产出备忘**：按「示例」骨架成文，顶部加团队配置 `## Outputs` 的工作成果抬头（律师角色标特权；非律师走下「注意事项」的非律师闸）。结尾给威尔福尔（willfulness）提示与下一步决策树。

## 指令

**三色初评结论（决策姿态：永不下「不侵权」）：**
- 🔴 **RED**：某独立权利要求**每个要素**都映射到产品（字面读通）→ 停，找专利律师。
- 🟡 **YELLOW**：要素两可，或权利要求构造对结论起决定作用 → 需注册专利律师做完整 FTO 研究，**不得据此初评发布**。
- 🟢 **GREEN**：未发现明显阻断专利——但**这不是 clear**，仍须律师确认在效状态与检索充分性。

**claim chart（每条独立权利要求一张表）：**

| 权利要求要素 | 产品是否实施？ | 依据 |
|---|---|---|
| "A [前序短语]" | 是/否/可能/取决于构造 | 一句话：产品哪处映射、哪处缺、哪处歧义 |
| "comprising [要素1]" | 是/否/可能 | 映射或差距 |
| "wherein [要素2]" | 是/否/可能 | 映射或差距 |

**硬约束：**
- **全要素规则（all-elements rule）**：只有产品实施某条权利要求的**每个**要素才构成侵权；缺一个要素即该条无字面侵权。**不得跳过任何要素。**
- **DOE 单独一遍**：先字面，再对「否」的要素旁注 DOE（insubstantial differences / function-way-result）是否可能；并标明 DOE 须律师判断——审查历史 estoppel 与 claim vitiation 是常见障碍，本条不裁断。
- **构造是律师的活**：某术语窄/宽解释会改变结论时，标出该术语并列两种构造，不默默选一个。
- **间接（诱导/帮助）与分立侵权**仅标记，不做完整分析。
- **非美辖区不照搬美国框架**：德/中/日的实用新型、各自 DOE（如德国 Schneidmesser）、CNIPA/JPO/UPC 程序均不同。非美辖区在范围内时写明：「本分析用美国 claim-charting 框架，[辖区] 的侵权与有效性结论须当地审查」。

**逐件专利须采集（不得静默补全）**：专利号(+申请号)与辖区、名称、权利人与发明人、优先权日/授权日、**到期日**（查 term adjustment / extension / terminal disclaimer）、**维持费/在效状态**（美专利若 3.5/7.5/11.5 年维持费失缴即过期、非障碍）、独立/从属权利要求数、**授权时的独立权利要求原文**、相关程序（IPR/PGR/再审/诉讼/PTAB 结论）、卷宗要点（审查放弃、缩窄修改）。**绝不编造专利号、到期日，绝不「脑补」卷宗不支持的要素；维持费状态查不到就写「未从检索结果核实——依赖在效状态前先查 PAIR/PatentCenter」。**

**无库检索时原文写入产出：** 「**未运行专利库检索。** 本初评未命中 USPTO Full-Text、EPO Espacenet、Google Patents、PatSnap 或任何专利库。在依赖本初评做任何发布决策前，须就范围内各辖区做结构化检索。以下分析仅限用户点名或对话中出现的专利。」

## 示例

YELLOW/RED 备忘骨架（GREEN 时检索范围段照写「未跑检索」声明，claim chart 段从略）：

```markdown
[WORK-PRODUCT HEADER — 按配置 ## Outputs]

# FTO Triage — First Pass (NOT AN OPINION)

**This is not a freedom-to-operate opinion.** 「未发现明显阻断专利」只代表初评没找到，
不代表产品 clear。专利侵权为严格责任；故意侵权（明知专利仍推进）按 35 U.S.C. §284
可三倍赔偿。须注册专利律师评估后方可据此做产品决策。

**Triage result:** [GREEN / YELLOW / RED — 一句话理由]

## Subject
- 产品/工艺/功能：[技术本质] ｜ 依据的技术细节：[规格/图/公开页/代码/工程师描述]
- 范围辖区：[make/use/sell/offer/import — 按 §271] ｜ 时机：[pre/near/shipping]

## Search scope
- 检索库：[Espacenet/Google Patents/… 或「未跑检索」] ｜ 查询/技术分类 ｜ 检索日期/时间窗 ｜ 覆盖辖区 ｜ 未检索项

## Patents identified
| Patent | 辖区 | 权利人 | 优先/授权 | 到期 | 在效? | 来源 |
|---|---|---|---|---|---|---|

## Claim charts — first pass
### [专利号] — independent Claim [N]
> "[Claim N 原文]"
| Element | 产品是否实施 | 依据 |
|---|---|---|
**Literal read:** [全要素映射 / 某要素不明确 / 构造对要素[Y]起决定作用]
**DOE（仅标记）:** [对要素[Y] DOE 可能——须律师构造 / 不可能 / 审查史疑似 estoppel]
**间接/分立（仅标记）:** [是否依赖诱导/帮助/分立理论——须律师]

## Open questions / ## Signals (not confirmed patents) / ## Recommended next steps

## Willfulness note
本初评点出了具体专利。获此「知悉」后未经进一步律师审查仍推进，可支撑故意侵权认定与
§284 加重赔偿；后续路径应由专利律师记录在案，发布/改设计/许可的商业决策须由正式 FTO
意见与律师判断支撑，而非本初评。

## Citation verification
每个专利号、权利要求引文、日期、卷宗事实须对权威库（PatentCenter/PAIR、EPO register、
本国对应库）核实后方可依赖；权利要求引文是最常见错误点——一字之差即改变分析。
```

## 注意事项

- **威尔福尔风险（贯穿）**：阅读本初评即「读了与专利有关的东西」，可能进入日后的故意侵权分析。这也是律师使用时产出标特权、非律师产出框定为「拿去找律师的研究」的原因。**不要在特权渠道外讨论本初评点出的具体专利。**
- **去向检查（Destination check）**：本备忘是特权研究文件，不得转发给非律师第三方或对手方/对方律师，否则可能弃权。去向在特权圈外时提供特权版/脱敏版/两者。
- **非律师闸**：产出前读配置 `## Who's using this`。角色为非律师时，先声明「这是研究初评、非法律意见；仅凭此发布/继续销售/投资有严格责任与加重赔偿后果」，再附一页 brief（产品、范围辖区、跑了/没跑的检索、点出的专利与 claim chart 读法、开放问题、要问律师的三件事），并指引找**注册专利律师/代理人**（美国须 USPTO OED 名录在册者，非每位律师都注册；他辖区查 EPO/UKIPO 等名册）。**brief 之外仍交付完整分析，不得扣留。**
- **本条不做的**：不出 FTO 意见、不做权利要求构造、不裁有效性、不起草权利要求、不评损害、不报「不侵权」。宁可**多标（over-flag，两扇门，律师 30 秒收窄）也不漏标（under-flag，单向门：产品已发、一年后取证、三倍赔偿在桌上）**。
- 最终备忘若需转 Word 交付，用 markdown-to-docx。

## 互见

- general-counsel-advisor：上游把「是否需要 FTO/专利律师」当作总法律顾问分流问题先过一遍。
- legal-risk-classifier：把本初评的三色结论并入团队统一的法律风险分级。
- diligence-issue-extractor：尽调中发现的专利风险项，回流到本条做逐要素初评。
- litigation-chronology-builder：若进入诉讼或 NPE 来信阶段，构建专利时间线。
- marketing-claims-reviewer：产品外观/功能宣称同时触及 trade dress 风险时的并行轨。

---
本条采编自 anthropics/claude-for-legal（Apache-2.0）。
