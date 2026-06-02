---
name: ib-pitch-deck-builder
title: 投行路演演示稿构建
description: 当拿到投行路演 PPT 模板和源数据（Excel/CSV/PDF/研报）需把数据灌入既有版式时使用；按"抽数校验→内容映射→灌入排版→验证修复循环→终检"流程产出格式合规的 pitch deck（真表对象、对比度达标、删占位框、跨页数字一致、附 LibreOffice 渲染免责声明）；不适用于从零设计演示文稿或编造无源数据。触发词：pitch deck、路演演示稿、投行模板填充、灌数据进幻灯片
domain: 商业/finance
triggers: [pitch deck, 路演演示稿, 投行路演, PPT模板填充, 灌数据进幻灯片, pitch deck template, populate slides, 把数据填进PPT模板]
tags: [商业, finance, 投行, 演示文稿, pptx, pitch-deck, 数据灌入, 财务校验]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [PowerPoint/pptx 工具, LibreOffice (soffice), pdftoppm, 电子表格]
requires: []
related: [ib-deck-quality-check, pitch-deck-refresh, board-deck-builder, cim-builder]
combines_with: [ib-deck-quality-check, pitch-deck-refresh, company-tear-sheet]
license: Apache-2.0
source: anthropics/financial-services
source_license: Apache-2.0
---
## 何时使用

当你拿到一份**已有版式的投行路演 PPT 模板**，需要把源数据灌进去时使用：

- 用户提供 PowerPoint 模板要求填充内容。
- 有源数据（Excel/CSV/PDF 研报/Word/数据库/网页）需要落到幻灯片版式里。
- 用户提到"填模板""灌数据进 pitch deck""把数据放进现有版式"。

任务类型决策：① 空模板灌源数据 → 走下方完整流程；② 编辑已填好的页 → 抽取现有内容、修改、重新验证；③ 修既有页的格式问题 → 直接查"常见错误"对照表做定点修复。

**不该用的边界：**
- 不用于**从零设计**演示文稿（无模板、无版式）——本技能只负责往既有版式里灌数。
- 不编造数据：源数据缺口用显式占位符标注（如 `[待补充]`），绝不臆造数字。
- 不对引用的市场/财务数字做事实背书；外部数据需另行核验。

## 步骤

进度追踪（复制并逐项打勾）：

```
Pitch Deck 进度:
- [ ] 阶段1: 抽取并校验源数据
- [ ] 阶段2: 内容映射到模板各区
- [ ] 阶段3: 灌入并按模板风格排版
- [ ] 阶段4: 验证 → 修复 → 重复直到干净
- [ ] 阶段5: 终检交付
```

1. **阶段1 抽数校验**：先把原模板**备份**为 `[文件名]_backup.pptx`（直接改 XML 或意外报错会损坏文件）。识别所有源材料 → 抽取数据点 → 逐个数字对源校验 → 统一单位与币种（全部换成模板主口径）→ 标记需复算的计算项（见"指令-财务复算公式"）。
2. **阶段2 内容映射**：先**打开并目视通读模板**，理解结构/风格/已有内容 → 找出全部占位区与内容框 → 把源数据映射到对应区 → 识别"彩色指示框"（任务方留的说明框）→ 记录数据缺口与不匹配。
3. **阶段3 灌入排版**："先内容、后格式"。**删掉彩色指示框**再造正式内容（见反模式1）；表格必须建成**真正的表对象**（禁止用 `|`/制表符/空格拼假表）；箭头/形状用 PPT 形状对象（不用 →、⟹ 文本符号）；有 logo 就放，没有就标 `[LOGO NOT PROVIDED - please supply company logo]`。
4. **阶段4 验证→修复循环**：用 LibreOffice 转图逐页核对（见下命令与清单），按"3 轮上限"修复，仍不过则升级给用户。
5. **阶段5 终检**：过完整自查清单后交付，并**必带 LibreOffice 渲染免责声明**。

## 指令

**验证转图命令（每轮验证都跑）：**

```bash
# 转 PDF 再转图做目视验证
soffice --headless --convert-to pdf presentation.pptx
pdftoppm -jpeg -r 150 presentation.pdf slide
```

转换失败时：先 `which soffice` 确认安装；改试 `libreoffice --headless --convert-to pdf presentation.pptx`；仍失败则手动用 PowerPoint/LibreOffice 导出。

**逐页验证清单：** 文字与背景对比度够吗 / 表格是真对象（列对齐、非 `|` 拼接）吗 / 图表表格填满指定区吗 / 同节内项目符号一致吗 / 同层级框字号一致吗 / 无内容超出页边吗 / 无保留占位框格式（彩色大框塞数据）吗 / 无文本假表吗 / **跨页同一指标/数字完全一致**吗。

**修复循环 3 轮上限：** 第1轮修全部已发现问题并复验；第2轮修剩余问题并复验；第3轮仍有问题则**停止循环**，逐条列出（页号+描述）+ 说明已尝试动作 + 带显式免责声明交付（"以下问题无法自动解决：[列表]，需人工复核"）。字体渲染、复杂形状对齐等问题往往需在 PowerPoint 手动处理，**切勿无限循环**。

**三大反模式（必须规避）：**
1. **往占位框里灌数据**：彩色指示框（亮黄/橙、含"在此插入…"指引文字）**本身就是占位符**，应整体删除后另建正式内容；只有版式占位符（slide master 自带、中性色、"单击此处添加文本"）才保留形状只换文字。识别测试：若成品页出现塞满数据文字的大彩色矩形，就是抄了占位格式。
2. **文本假表**：用 `|`、制表符、空格拼列 ≠ 表格，永远对不齐、不专业。建表后**必须核验是真表对象**。
3. **继承占位对比度**：占位框常是彩底浅字（如黄底白字），正式正文应用**深字浅底**（正文 `#000000`/`#333333` on 白/浅底；表头与强调区可用品牌色）。

**财务复算公式（校验源数据预算值，源数据应已含算好的数）：**

```
CAGR 投影:   未来值 = 现值 × (1 + CAGR)^n      # n=基准年到目标年的年数, 2024→2030=6
             例: 22.1 × (1.164)^6 = 55.0 ✓
EV/Revenue:  倍数 = 企业价值 ÷ 营收;  隐含EV = 营收 × 倍数   # 例 436÷45=9.69≈9.7x
EV/EBITDA:   倍数 = 企业价值 ÷ EBITDA
市场份额:    份额% = 细分规模 ÷ 总市场 × 100        # 例 18÷65=27.7%≈28%
YoY 增长:    (本期 - 上期) ÷ 上期 × 100
端点反推CAGR: (期末值 ÷ 期初值)^(1/n) - 1
```

共识方法：规模共识取各源全距（min–max，如 $14.9–22.1bn → $15–22bn）；CAGR 共识剔除最高最低离群、取中心簇；投影共识对规模区间中点套共识 CAGR。复算结果与源值偏差 > 5% 须排查（基准年/CAGR/口径/LTM vs NTM 差异），存疑则脚注说明并展示算法。

**呈现约束：** 同层级框字号必须一致；每框 ≤6-7 条项目、每条 ≤2 行、无孤字；脚注框宽约 32.5cm(16:9)/24cm(4:3)；正文上标 ¹²³ 必须有对应 Notes 条目。

**交付必带声明（LibreOffice 仅做结构验证，不能准确渲染字体/渐变/位置/换行）：**
> "This file was validated using LibreOffice. Please review in Microsoft PowerPoint before distribution, as rendering differences may exist."（本文件经 LibreOffice 验证，分发前请在 Microsoft PowerPoint 中复核，渲染可能存在差异。）

## 示例

**项目符号约定：** ✓ 含/正向 · × 排除/负向 · • 中性枚举 · 1./2./3. 有序步骤 · – 子项。

**取整惯例（不应实质改变数值，小值用更细精度）：** 大市场($10bn+)→近 $1bn（18.5→$19bn）；小市场(<$10bn)→近 $0.5bn；区间匹配源精度（14.9-22.1→$15-22bn）；CAGR→整数%或0.5%（16.4%→16%）；市场份额→近5%；倍数→1位小数（9.69→9.7x）。

**脚注格式：**

```
Sources: Grand View Research (2024), Mordor Intelligence (2024), Markets and Markets (2023).
Notes: (1) Excludes hardware revenue; (2) Includes both B2B and B2C segments.
```

**常见错误对照（定点修复用）：** 无结构文本块 → 拆成项目符号；`|`/制表符假表 → 建真表对象；对比度差 → 逐元素审计；图表缩成缩略图 → 放大填满、只粘图表对象；数据塞进彩框 → 删框另建正式内容；项目符号/字号不一致 → 定义一次统一套用；内容溢出 → 显式设框宽；残留 `[方括号]` → 全局查替；文本箭头 → 换形状对象。

## 注意事项

- **必须先备份再改**：直接编辑 XML 易损坏 pptx。
- **LibreOffice 渲染不可信**：它会错排字体/渐变/位置/换行/部分表格。验证循环只能抓结构性问题（缺内容、坏表、残留占位格式），**抓不到**字体替换、细微对齐偏移、渐变问题——故交付必带上面的免责声明，且字体/复杂形状问题留待 PowerPoint 手动修。
- **跨页一致性**：同一数字/指标在多页出现时口径、格式、措辞完全一致；改一处必改全部。
- **源数据冲突优先级**：优先用任务文件内显式提供的数据；用到外部源（网搜、外部文档）须向用户标记；差异显式记录并加脚注说明取舍。
- **数据卫生**：缺口用显式占位符不臆造；外部市场/财务数字与"研究表明"类断言需另行核验，本技能不自行背书。
- **logo**：用任务材料里的 logo，无则标 `[LOGO NOT PROVIDED]`；通常右上、跨页同尺寸、不压内容。

## 互见

- related：`board-deck-builder` —— 董事会/投资人汇报材料，叙事框架与本技能的"灌模板"互补。
- related：`market-sizing-tam-sam-som`、`market-sizing-analyst` —— pitch deck 中市场规模页的测算来源。
- combines_with：`pptx`/演示文稿编辑类技能 —— 提供 PowerPoint XML（表格、形状、箭头）的底层实现细节。
- 源技能 references：`reference/formatting-standards.md`（文本/项目符号/表/图/对齐）、`reference/slide-templates.md`（各类幻灯片内容映射）、`reference/xml-reference.md`（表格/形状/箭头的 PPT XML 模式）、`reference/calculation-standards.md`（CAGR/共识等校验公式）。

---

采编自 anthropics/financial-services（Apache-2.0 License）。
