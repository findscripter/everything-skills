---
name: scientific-manuscript-writing
title: 科研论文写作（IMRAD）
description: 当撰写或修订科研论文章节、按 IMRAD 组织稿件、规范引文格式或套用研究报告规范时使用；做出以 IMRAD 结构、连贯段落（非要点列表）、规范引文（APA/AMA/Vancouver）与图表呈现的可投稿手稿，并按研究类型套用 CONSORT/STROBE/PRISMA 等报告规范；不适用于非学术写作、营销/SEO 文案或纯数据清洗。触发词：科研论文、学术写作、manuscript、IMRAD、摘要、引言、方法、结果、讨论、引文格式、citation、APA、PRISMA、投稿
domain: 领域/science
triggers: [科研论文, 学术写作, manuscript, IMRAD, 摘要, 引言, 方法, 结果, 讨论, 引文格式, citation, APA, PRISMA, 投稿]
tags: [scientific-writing, imrad, manuscript, citation, academic, research-paper, reporting-guidelines]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Write, Edit, Zotero/Mendeley/EndNote, LaTeX]
requires: []
related: [academic-paper-writer, academic-peer-reviewer, guided-statistical-analysis, research-experiment-designer]
combines_with: [guided-statistical-analysis, research-experiment-designer, academic-peer-reviewer]
license: MIT
source: K-Dense-AI/scientific-agent-skills
source_license: MIT
---
## 何时使用

满足以下任一情形时使用本技能：
- 撰写或修订科研论文的任一章节（摘要、引言、方法、结果、讨论）。
- 按 IMRAD 或其他标准结构组织研究稿件。
- 按指定风格（APA、AMA、Vancouver、Chicago、IEEE）规范引文与参考文献。
- 设计、规范或改进图、表与数据可视化。
- 按研究类型套用报告规范（随机对照试验 CONSORT、观察性研究 STROBE、系统综述/荟萃分析 PRISMA 等）。
- 准备针对特定期刊的投稿稿件，或回应审稿意见、修订手稿。

**不该用边界**：非学术体裁的写作（营销/SEO 文案见 seo-content-writer）、内部沟通稿（见 internal-comms）、纯数据清洗（见 csv-data-cleaner）不属于本技能范围。核心事实核查需求请配合 fact-checking。

## 步骤

**阶段一·规划**
1. 确定目标期刊，通读其作者须知（结构、字数、格式、必备声明）。
2. 判定适用的报告规范（CONSORT/STROBE/PRISMA 等），据其清单逐项落实。
3. 以 IMRAD 搭出全文骨架。
4. 先规划图与表——它们是论文的数据主线。

**阶段二·起草（每个章节都走两阶段写作法）**
1. 先做图表（核心数据故事），再围绕其客观描述。
2. 通常按 方法 → 结果 → 讨论 → 引言 → 摘要 → 标题 的顺序起草（方法最易先写，标题/摘要最后凝练）。
3. 每节先列要点提纲（仅供规划），再扩写成连贯段落。

**阶段三·修订**
检查全文逻辑「红线」是否贯通；术语与符号是否一致；图表是否自解释；是否符合报告规范；引文是否准确且格式统一；各节字数是否达标；语法、拼写与表达。

**阶段四·定稿**
按期刊要求排版；准备补充材料；撰写凸显研究意义的投稿信；完成投稿清单与各类声明（基金、利益冲突、数据可得性、伦理批准）。

## 指令

**核心铁律：最终手稿必须用完整、连贯的段落（flowing prose），绝不可留要点列表（bullet points）。** 用两阶段写作法实现：

**阶段一·列要点提纲**（仅为脚手架，非最终稿）。开新章节时：
1. 检索相关文献与数据（可配合 rag-pipeline-builder 做文献检索）。
2. 用要点标记：要呈现的主要论点/发现、要引用的关键研究、要纳入的数据与统计量、逻辑顺序。

提纲示例（引言）：
```
- 背景：AI 在药物发现中日益重要
  * 引用近期综述（Smith 2023, Jones 2024）；传统方法慢且昂贵
- 空白：在罕见病上的应用有限
  * 仅 2 项前期研究（Lee 2022, Chen 2023）；小数据集仍是挑战
- 我们的方法：从常见病迁移学习
- 研究目标：在 3 个罕见病数据集上验证
```

**阶段二·将要点扩写为段落**：把要点改写为含主谓宾的完整句；加过渡词（however、moreover、in contrast、subsequently）；将引文自然嵌入句中而非堆成清单；补足要点省略的语境与解释；保证句间逻辑顺畅；变换句式以保持可读性。

**列表仅在以下有限场景可用**：方法（纳入/排除标准、材料与试剂、参与者特征）、补充材料（扩展协议、设备清单、详细参数）。**摘要、引言、结果、讨论、结论中绝不用列表。**

**摘要格式规则**：默认写成有自然过渡的连贯段落，**不要**用带标签的小节（Background:、Methods:…）；仅当期刊明确要求结构化摘要时才用。摘要长度通常 100–250 字（词）。

## 示例

要点扩写为段落（引言）：
```
Artificial intelligence approaches have gained significant traction in drug
discovery pipelines over the past decade (Smith, 2023; Jones, 2024). While these
computational methods show promise for accelerating the identification of
therapeutic candidates, traditional experimental approaches remain slow and
resource-intensive, often requiring years of laboratory work. However, the
application of AI to rare diseases has been limited, with only two prior studies
demonstrating proof-of-concept results (Lee, 2022; Chen, 2023). The primary
obstacle has been the scarcity of training data for small patient populations.

To address this challenge, we developed a transfer learning approach that
leverages knowledge from well-characterized common diseases to predict
therapeutic targets for rare conditions. The objective of this study was to
validate our approach across three independent rare disease datasets.
```
要点（电报式、引文成清单、供自己看）→ 终稿（完整句、引文嵌入、含过渡、可供同行评议）。

## 注意事项

**主要拒稿原因**：统计方法不当/描述不全；过度解读结果或结论缺乏支撑；方法描述不清影响可重复性；样本小/有偏/不当；写作质量差、文意难懂；文献综述不足；图表不清晰；未遵循报告规范。

**写作质量**：时态要稳（方法/结果用过去时，公认事实用现在时）；定义首次出现的缩写（如 messenger RNA (mRNA)）；同一概念全程用同一术语，勿在「药物/medication/drug」间游移；段落切分不要打断逻辑；节间留过渡。

**引文最佳实践**：优先引一手文献；纳入近 5–10 年文献（活跃领域）；引文在引言与讨论间分布均衡；逐条比对原文核验；用 Zotero/Mendeley/EndNote 管理。主要风格：AMA（上标编号，医学）、Vancouver（方括号编号，生物医学）、APA（作者–年份，社科）、Chicago（人文/科学）、IEEE（方括号编号，工程/CS）。

**图表**：表用于需精确数值的复杂数据，图用于趋势/关系/对比；每个图表需配完整图注、自成一体；标注坐标轴与单位、样本量 n 与统计标记；遵循「每 1000 字一图/表」的参考密度；避免文、表、图重复同一信息。

**领域术语**：基因符号用斜体（*TP53*）、蛋白用正体（p53）；物种用拉丁双名法斜体并首次给全称（*Escherichia coli* → *E. coli*）；化学遵 IUPAC；临床用「patients」、社区研究用「participants」；面向广义读者（Nature/Science）多定义术语，面向专科期刊则少定义。

> 本条采编自 K-Dense-AI/scientific-agent-skills（MIT 许可证）。源技能中依赖该工具集专有脚本的部分（如 scientific-schematics、generate-image 图像生成脚本、scientific_report.sty 报告样式包、venue-templates 期刊模板）已按通用化处理，未逐字保留。

## 互见

- fact-checking：核验论文中的事实陈述与引用。
- rag-pipeline-builder：搭建文献检索/问答以支撑阶段一的提纲。
- markdown-to-docx：将 Markdown 草稿转为投稿用 Word 文档。
- first-principles-thinking：厘清研究问题与论证结构。
