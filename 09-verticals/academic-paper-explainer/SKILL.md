---
name: academic-paper-explainer
title: 学术论文导读讲解
description: 当用户提供论文 PDF、arXiv 链接或粘贴论文正文并希望快速读懂时使用；做按五步流程（一句话定位、逐章导读、故事化串讲、公式图表拆解、专家点评）输出结构化中文导读；不适用于撰写原创论文、做系统综述/meta 分析或对未提供全文的论文凭空臆测；触发词：读论文、解释论文、看不懂这篇、帮我理解这篇、这篇在讲什么、论文导读、拆解公式、paper reading、explain this paper、summarize paper、arxiv
domain: 领域/science
triggers: [读论文, 解释论文, 看不懂这篇, 帮我理解这篇, 这篇在讲什么, 论文导读, 拆解公式, paper reading, explain this paper, summarize paper, arxiv]
tags: [paper, academic, research, explainer, arxiv, science, summary]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [pdf-reader, web-fetch, latex]
requires: []
related: [academic-paper-writer, academic-peer-reviewer, scientific-manuscript-writing, math-proof-writer]
combines_with: [notebooklm-source-grounded-qa, scientific-database-lookup]
license: MIT
source: voidful/academic-skills
source_license: MIT
---
## 何时使用

- 用户给出论文 PDF 路径、arXiv 链接，或直接粘贴论文正文，并希望被讲懂、抓重点、拆公式时。
- 适合对论文做直观导读：一句话定位贡献、逐章梳理、串成故事、拆解关键公式与图表、给出专家级点评。

不该用的边界：
- 不要据此撰写原创论文、做大规模文献综述或 meta 分析（那是另一类任务）。
- 未拿到正文/摘要时不要凭标题臆测内容；先索取 PDF、链接或文字。
- 纯营销稿、博客、新闻不属于"学术论文"，触发后应说明并降级为普通摘要。

## 步骤

按以下五步顺序产出，章节缺失时灵活映射，不跳过重要内容：

1. 这在讲什么：一句话（≤50 字）概括目标与核心贡献，先给一个直观类比、再给精确学术摘要，二者缺一不可。
2. 逐章导读：依标准结构逐章抓重点——Abstract（问题/方法/结果/意义四要素）、Introduction（研究缺口 gap 与动机 motivation）、Method（拆成模块理解整体架构）、Experiments（baseline 对比、消融 ablation、主结论）、Conclusion（limitation 与 future work）。每章 2-4 段。
3. 故事化串讲：从「全新方法→英雄旅程」「分析/理论→推理探案」「大量对比实验→料理比赛」三种叙事结构中选最贴合的一种，把核心方法讲成 300-500 字连贯故事；类比须忠于技术内容，不得为好听而扭曲事实。
4. 公式与图表：挑最核心的 2-3 个公式，每个按「先讲直觉（一句白话）→再拆符号（逐符号列表/表格，不漏符号）→后说意义（少了它会怎样）」三步解释；公式用 LaTeX。重要图表解读趋势、找异常、并核对图文是否一致。纯系统类论文无关键公式时，改为解读系统架构图。
5. 专家点评：切换为严谨可读的语气，覆盖六个面向——主要贡献（1-2 点）、技术优点、潜在不足（含作者轻描淡写的 limitation）、与相关工作的定位、启发与延伸方向、适合谁读。

## 指令

- 输入三种形式：本地 PDF 路径（读取文件）、arXiv URL（抓取正文）、直接粘贴的文字。
- 全程简体中文；专有名词可保留英文（如 attention、loss function、baseline、ablation）。
- 章节标题用中文，括号内附英文原文，如「方法（Method）」。
- 公式用 LaTeX 呈现；公式拆解时逐一列出每个符号及其含义。
- 论文过长：先完成五步精简版，再询问用户要深入展开哪一节。
- 看不懂时如实说明，不假装理解；用户追问越细，解释越深（可展开到数学推导）。

## 示例

输入：用户粘贴一篇对比学习 + 少样本学习论文。

输出骨架：

```
# 论文导读：《论文标题》
## 一、这在讲什么
（类比一句 + 学术一句，≤50 字）
## 二、逐章导读
### 摘要 / 引言 / 方法 / 实验 / 结论
## 三、故事串讲
（选定叙事结构，300-500 字）
## 四、公式与图表
### 核心公式（直觉→拆符号→意义）
### 重要图表（趋势/异常/图文一致性）
## 五、专家点评
### 主要贡献 / 技术优点 / 潜在不足 / 领域定位 / 启发延伸 / 适合谁读
```

公式拆解示例（信息对比损失）：

```
公式：L = -log( exp(sim(z_i, z_j)/τ) / Σ_k exp(sim(z_i, z_k)/τ) )
直觉：让"真正成对的样本"靠得更近，让其他样本推得更远。
拆符号：
- z_i, z_j：同一样本的两个视图（正样本对）
- z_k：其他样本（负样本）
- sim(·,·)：余弦相似度
- τ：温度参数，控制区分的"挑剔"程度
- L：损失，越小学得越好
意义：没有它，模型无从知道该拉近谁、推远谁。
```

## 注意事项

- 类比和故事必须准确反映技术内容，不能为了通俗而失真。
- 不是每个公式都要讲，只挑最核心的；选中的公式符号必须拆全。
- 图表解读要把图中结论和正文描述对照，发现不一致要点明。
- 实验部分务必看清 baseline 是否公平、有无消融、主张是否被证据支撑。
- 点评的"潜在不足"应主动挖掘作者未明说或轻描淡写的局限。

## 互见

- fact-checking：核验论文结论或引用数据时配合使用。
- first-principles-thinking：拆解方法背后的基本假设与推理链时配合使用。

---
本条采编自 voidful/academic-skills（MIT）。
