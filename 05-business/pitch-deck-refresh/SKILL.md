---
name: pitch-deck-refresh
title: 投行演示稿数据刷新
description: 当需要把已有演示稿（deck）里的旧数字批量换成新数字——季度刷新、财报更新、可比公司滚动、市场数据再基准——而非重做版式时使用；做的事是定位每处旧值（含不同量级/精度/单位写法及图表底层数据）、出变更清单经审批后做最小化替换并产出回执；不适用于重写叙事/重建幻灯片、未经确认就改派生指标（增长率、份额）、或从零搭建 deck。触发词：用Q4数据更新deck、刷新comps、roll forward、换新财报数字、把485M全改成512M、季度数据刷新。
domain: 商业/finance
triggers: [用Q4数据更新deck, 刷新comps, 可比公司滚动, roll forward, 换新财报数字, 把485M全改成512M, 季度数据刷新, 市场数据再基准, comp roll, earnings update deck]
tags: [商业, finance, 投行, 演示稿, 数据刷新, comps, 财报更新, PowerPoint]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [演示文稿/PPT 工具, 电子表格, ask_user_question]
requires: []
related: [ib-deck-quality-check, ib-pitch-deck-builder, board-deck-builder, financial-model-updater]
combines_with: [company-tear-sheet]
license: Apache-2.0
source: anthropics/financial-services
source_license: Apache-2.0
---
## 何时使用

已有一份成稿 deck，只需把里面的**数字**换成新的：季度刷新、财报更新、可比公司（comps）滚动、市场数据再基准。**deck 是格式的唯一真相来源**——你只改值，不动版式。

**不该用本技能的边界：**
- **不重建幻灯片**：若换数后某页叙事不再成立（写着"利润率收缩"但实际上升），**标记出来**，不要替用户改写叙事。
- **不擅自重算派生指标**：增长率、份额等是否随基数联动重算，是用户的判断（见步骤一的提问），默认不动。
- **不动格式**：deck 用 `$MM` 而用户映射写 `$M`，以 **deck 为准**；值变、风格不变。

这是**四阶段**流程，第三阶段是**审批闸门**——用户看过计划前，一个字都不要改。

## 步骤 / 指令

先判断运行环境（意图相同、改法不同）：
- **Add-in（PPT 加载项）**：deck 实时打开，直接改文本 run、表格单元格、图表数据。
- **Chat（上传文件）**：deck 是上传的文件，靠**重新生成受影响幻灯片**（带入新值、其余元素逐一原样保留）并写回文件来改。
两种环境的统一标准：**改动尽可能小，既有格式完全不动。**

**阶段一 · 拿到数据（用 `ask_user_question` 确认新数怎么来）**
- **粘贴映射**——用户给 `营收 $485M → $512M, EBITDA $120M → $135M`，最清晰。
- **上传 Excel**——含新旧列或一张待取数的输出表；先读，**确认哪列是哪列**再信它。
- **只给新值**——"Q4 营收 $512M，利润率 22%"；你来推断各替换谁，但**动手前先确认映射**——把本属毛利的 `$512M` 误映射到营收，是会闷声出大事的。
- 必问**派生数**：营收一动，增长率、份额要不要联动重算？多数 deck 某处埋着已过期的 `+15% YoY`。改不改是用户的判断，不是你的。

**阶段二 · 通读全篇、找全每一处**
逐页读。每个旧值，找出**全部**出现——包括长得不一样的：

| 变体 | 例 |
|---|---|
| 量级 | `$485M`、`$0.485B`、`$485,000,000` |
| 精度 | `$485M`、`$485.0M`、`~$485M` |
| 单位风格 | `$485M`、`$485MM`、`$485 million`、`485M` |
| 嵌入式 | "revenue grew to $485M"、"a $485M business"、坐标轴标签 |

一份在第 3 页写 `$485M`、第 8 页图表轴写 `485`、第 15 页脚注写 `$485.0 million` 的 deck，是**同一个数的三处**。Find-replace 会漏掉两处，你不能漏。

**数字藏在哪：** 文本框、表格单元格、图表数据标签与轴标签、**图表底层源数据（驱动柱/线的数，不只是上面的标签）**、脚注/来源行/小字、讲者备注（若用户在意）。

为每个旧值列出：每处位置、原文确切样子、将变成什么。**这张清单就是计划。**

**阶段三 · 出示计划、取得审批（destructive 操作）**
这是对别人花了心血的 deck 的破坏性操作。改任何东西前先给出**完整变更清单**，排版成可扫读的样子（格式见下方示例）。**FLAGGED（疑似派生、不在映射中）一节最关键**：你不只是执行 find-replace，而是替用户在深夜会漏掉的二阶效应兜底。映射写 `$485M → $512M`、旁边还有 `+15% YoY`，那增长率多半已错——**标记它，既别默默改、也别默默留。**
用 `ask_user_question` 取审批：按清单执行 / 执行但跳过 flagged 项 / 让用户先改映射。

**阶段四 · 执行、保形、回执**
逐项做**能完成目标的最小编辑**：
- **形状内文本**：只改值，字体/字号/颜色/粗体完全照旧。`$485M` 若是句中 14pt 海军蓝加粗，`$512M` 仍是同句 14pt 海军蓝加粗。
- **表格单元格**：只改该格，别动整张表。
- **图表数据**：更新底层 series 值让柱/线**真的动**。只改标签不改数据，等于留下一张说谎的图。
没碰到的东西一律不重排版——**你是外科医生，不是装修工。** 完事后给回执（格式见示例），并对每张改过的页跑**视觉核查**：变长的数（`$485M`→`$1,205M`）可能撑爆文本框或挤宽表格列，赶在用户之前发现。

## 示例

阶段三 · 变更计划：
```
$485M → $512M (Revenue)
  Slide 3  — Title box: "Revenue grew to $485M"
  Slide 8  — Chart axis label: "485"
  Slide 15 — Footnote: "$485.0 million in FY24 revenue"

$120M → $135M (Adj. EBITDA)
  Slide 3  — Table cell
  Slide 11 — Body text: "$120M of Adj. EBITDA"

FLAGGED — possibly derived, not in your mapping:
  Slide 3  — "+15% YoY" (growth rate — stale if base year didn't change?)
  Slide 7  — "12% market share" (was this computed from $485M / market size?)
```

阶段四 · 回执：
```
Updated 11 values across 8 slides.

Changed:
  [阶段三清单，改为过去式]

Still flagged — did NOT change:
  Slide 3 — "+15% YoY" (derived; confirm separately)
  Slide 7 — "12% market share"
```

## 注意事项

- **审批闸门不可跳过**：阶段三未获批，禁止编辑任何一处。
- **图表数据 vs 标签**：必须改驱动柱/线的**源数据**，否则图与数字脱节。
- **格式以 deck 为准**：单位/精度风格冲突时服从 deck，不服从用户映射的写法。
- **派生指标默认不动**：增长率、份额、利润率等仅在阶段一明确确认后才重算，其余只 flag 不改。
- **叙事不重写**：换数后叙事失真只标记，交回用户。
- **溢出核查**：数字变长可能撑爆文本框/挤宽列，逐页视觉验证。

## 互见
- related：`board-deck-builder` —— 本技能刷新的 deck 往往由它产出
- related：`equity-earnings-update-report` —— 同源财报驱动场景，出报告而非改 deck
- combines_with：`pptx-document-processing` —— Chat 环境下拆解/重生成 .pptx 的执行底座
- combines_with：`python-pptx-deck-generator` —— 用脚本重生成受影响幻灯片时搭配

---
采编自 anthropics/financial-services（Apache-2.0）。
