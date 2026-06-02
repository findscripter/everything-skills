---
name: ib-deck-quality-check
title: 投行演示稿质量审查
description: 当需对投行 pitch deck / 路演稿 / 客户交付材料做交付前终审、QC、核对、校稿时使用；做四维只读审查（跨页数字一致性、数据与叙事对齐、IB 语言润色、视觉与格式 QC）并按严重度分级出审查报告；不适用于改写正文、生成新 deck、或单纯排版美化；触发词：deck 质量审查、核对数字、跨页对账、是否可交付客户、pitch 终审、发出去前还差什么
domain: 商业/finance
triggers: [deck 质量审查, 投行 deck 终审, 核对数字, 跨页对账, 图表数字对不上, 是否可以交付客户, client-ready, pitch 终审, 发出去前还差什么, 校稿, QC 演示稿, reconcile figures]
tags: [finance, investment-banking, pitch-deck, 质量审查, QC, 数字一致性, 卖方研究, PPT]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, 演示文稿/PPT 工具, markitdown, Markdown 编辑器]
requires: []
related: [ib-pitch-deck-builder, pitch-deck-refresh, board-deck-builder, cim-builder]
combines_with: [ib-pitch-deck-builder, pitch-deck-refresh]
license: Apache-2.0
source: anthropics/financial-services
source_license: Apache-2.0
---
## 何时使用

当一份投行 pitch deck / 路演材料 / 客户交付演示稿即将发出，需要交付前终审（final pass / QC / 校稿）时使用。本技能在四个维度做**只读审查并出分级报告**：

1. 跨页数字一致性
2. 数据与叙事对齐
3. IB 标准语言润色
4. 视觉与格式 QC

典型触发：「帮我核对一下数字」「把各页的数字对一遍账」「这份能交给客户吗」「发出去之前还差什么」。

**不该用的边界：**

- 本技能**只审不改**（read-and-report only）——需要改写正文、重排版、生成新 deck 时用别的技能。
- 不做内容创作或财务建模本身。
- 没有完整 deck（只有零散一两页文字）时价值有限，跨页对账无从谈起。

**运行环境识别**（开始前先确认）：

- **PowerPoint 插件**内——直接读当前打开的实时 deck。
- **聊天/会话**内——读用户上传的 `.pptx` 文件。

两种环境工作流一致（都只读不改）。

## 步骤

### 0. 抽取全文，带页码归属

逐页抽取文本，**记录每一行来自哪一页**——每条问题都要能定位到页（如「\$500M 出现在第 3、8 页，但第 15 页是 \$485M」）。30 页的 deck 靠脑子记不可靠，把抽取文本写入文件再交给脚本处理。

脚本要求 markdown 风格、带页标记的输入格式：

```
## Slide 1
[第 1 页文本内容]

## Slide 2
[第 2 页文本内容]
```

（`.pptx` 可用 markitdown 转换；脚本同时识别 `## Slide N` 与 `<!-- Slide N` 两种页标记。）

### 1. 数字一致性

对抽取文本跑脚本：

```bash
python scripts/extract_numbers.py /tmp/deck_content.md --check
```

脚本会：归一单位（\$500M / \$500MM / \$500,000,000 视为同一数）、按类别归类（revenue、EBITDA、margin、multiple、valuation、growth…）、并在**同一指标类别在不同页出现冲突值**时报警（默认 5% 容差，revenue/ebitda/valuation 类标 high，其余标 medium）。这一步最可能逮到人肉读五遍都漏掉的错。

脚本之外还要人工核：

- 计算正确（合计能加总、百分比加得起来、增长率与首尾端点吻合）
- 单位风格统一（\$M 与 \$MM 二选一，全篇贯彻）
- 时间口径对齐（FY vs LTM vs 季度，须显式标注）

### 2. 数据与叙事对齐

把每个论断映射到支撑它的数据。**deck 最常悄悄出错的地方**：有人改了第 7 页的图，却忘了第 4 页的叙事。

- 趋势论断（「利润率下滑」）→ 图的方向真的对吗？
- 市场地位论断（「行业第一」）→ 营收与份额数据撑得住吗？
- 合理性：「\$100B 市场第一」但营收仅 \$200M = 0.2% 份额，这不是第一。

### 3. 语言润色

IB deck 有特定语体（register）。扫描破坏语体的表达：口语化（"pretty good"、"a lot of"）、缩写式（don't/won't）、感叹号、无数字支撑的模糊量词、同一概念术语不一致。替换范式见 `references/ib-terminology.md`，要点：

- 口语 → 专业：a lot of → significant / X%；cheap → attractive valuation；cut costs → drive operational efficiencies。
- 避免：缩写（Do not / will not）、感叹号、第一人称（"We think" → "Management believes" 或被动语态）、无证据的最高级（best-in-class 需数据支撑）、模糊量词（some/many → 具体数字）。

### 4. 视觉与格式 QC

逐页做视觉核验，找：缺图表来源标注、缺坐标轴标签、字体不一致、数字格式漂移（同一 deck 里 1,000 与 1K 混用）、日期格式漂移、脚注/免责声明缺口。

**视觉核验不可跳过**：重叠、溢出、对比度问题在纯文本抽取里看不出来；一张没标来源的图，在文字 dump 里和标了来源的长得一模一样。

## 指令

**报告结构**（依 `references/report-format.md`），按严重度分级、Critical 打头：

- **Critical（阻断客户交付）**——数字不一致、事实错误、数据与叙事矛盾、计算错误。
- **Important（应修）**——口语化/模糊措辞、术语漂移、缺图表来源。
- **Minor（打磨）**——字号、间距、日期格式、孤行。

**收尾原则**：没有 Critical 就**显式说出来**——「未发现数字不一致」本身是一条结论，不是「没结论」。

## 示例

**脚本报警输出（stderr）：**

```
=== POTENTIAL INCONSISTENCIES DETECTED ===

Category: REVENUE
  Expected: $500M (Slides: [3, 8], Count: 2)
  Found:    $485M (Slides: [15], Count: 1)
  Severity: high
```

**报告条目范式：**

```markdown
## Critical Issues
### Number Consistency
1. **营收口径不一致** (Slides 3, 8, 15)
   - Slide 3 / 8: $500M
   - Slide 15: $485M
   - Action: 与财务底稿核对，全篇统一为同一数

### Data-Narrative Alignment
1. **趋势论断与图相反** (Slides 4, 7)
   - Claim: "利润率持续下滑"
   - Data shows: 第 7 页图实际为逐季上升
   - Action: 修正叙事或更新图
```

**终审清单：** 数字已对账 / 叙事与数据吻合 / 语言达 IB 标准 / 图表有来源 / 格式统一。

## 注意事项

- **只读不改**：本技能不动 deck，只产出问题清单与建议。
- 数字一致性是最高优先级：脚本 5% 容差只是初筛，跨页对账与算式仍需人工复核。
- 年份类数字（1900-2099）若无单位/币种会被脚本自动跳过，避免误报。
- 视觉 QC 必须真看页面，不能只看文字抽取——来源缺失、溢出、对比度只在视觉层暴露。
- 缺 Critical 要显式声明「无」，不要留白让读者误以为没审。

## 互见

- related：`board-deck-builder` —— 同为汇报材料质量把关；先用本技能终审，再用它重构董事会/投资人叙事。
- related：`equity-earnings-update-report` —— 卖方研究报告同样需要跨页数字一致与来源标注，可复用本审查清单。
- related：`data-storyteller` —— 当问题在「数据没讲成故事」时，下钻叙事重构。
- related：`marketing-copy-editor` —— 语言润色维度的近亲（面向营销文案口径，本技能面向 IB 语体）。
- combines_with：`deal-desk-reviewer` —— 交易材料交付前的合规/条款复核，与本技能的演示稿 QC 互补成完整交付前关卡。

---
采编自 anthropics/financial-services（Apache-2.0）。
