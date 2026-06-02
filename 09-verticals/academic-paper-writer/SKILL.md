---
name: academic-paper-writer
title: 顶会论文写作
description: 当用户撰写、改写或润色学术论文，或要回应审稿意见、冲刺顶会投稿时使用；以严格 reviewer 视角执行「自审→评分预测→要点精炼→LaTeX 生成」四步流程，产出改进清单与可投稿英文段落；不适用于非学术写作（博客/营销/通用文案）、文献检索或代码实现；触发词：写论文、论文写作、改论文、润色、回应审稿、rebuttal、paper writing、improve my paper、review comments、LaTeX、NeurIPS、ICLR、ACL。
domain: 领域/science
triggers: [写论文, 论文写作, 改论文, 润色, 回应审稿, rebuttal, paper writing, improve my paper, review comments, LaTeX, NeurIPS, ICLR, ACL]
tags: [academic-writing, paper, latex, peer-review, rebuttal, science, research]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [LaTeX]
requires: []
related: [academic-peer-reviewer, academic-paper-explainer, scientific-manuscript-writing, math-proof-writer]
combines_with: [academic-peer-reviewer, research-experiment-designer, math-proof-writer]
license: MIT
source: voidful/academic-skills
source_license: MIT
---
## 何时使用

- 撰写顶会/期刊论文：从零搭骨架，或针对单个章节（Introduction、Method、Experiments、Conclusion 等）改写、润色。
- 投稿前以审稿人视角自审、预测评分、定位致命问题。
- 回应 reviewer 意见、撰写 rebuttal。

不该用的边界：
- 非学术写作（博客、营销文案、通用文档）——不套用此处的�"写作铁律"。
- 文献检索 / 选题立意 / 实验设计 / 代码实现——本条只管"把研究成果写成论文"。

## 步骤

每次用户提交草稿或求助，按序执行四步（步骤 1-3 中文输出，步骤 4 英文 LaTeX）：

1. 批判性自审：以最严格 reviewer 角度逐段检查，输出"整体结构评估 + 逐段检查（topic sentence / 优点 / 问题 / 建议）+ 致命/重大/次要问题"三级清单。
2. 分数预测：按 7 维度（新颖性、技术可靠性 Soundness、清晰度、实验完整性、影响力、可重现性、呈现品质）打 1-10 分，给出整体分与 Accept/Borderline/Reject 判定及提升路径。评分锚点：8-10 Strong Accept、6-7 Weak Accept、5 Borderline、3-4 Weak Reject、1-2 Strong Reject。
3. 要点精炼：把问题压成可执行清单，分 🔴 必须改（不改必拒）/ 🟡 强烈建议 / 🟢 锦上添花，🔴 项给出"修改前原文 → 修改后建议"。
4. LaTeX 生成：输出改写后章节的 LaTeX 代码 + Change Log 表（位置 / 原文摘要 / 修改后摘要 / 修改原因）。

四种工作模式：A 全文写作（先 Coarse-to-Fine 搭骨架，逐章展开后跑四步）；B 章节改写（聚焦单章跑完整四步）；C 润色修订（重一致性：符号/用词/时态）；D 回复审稿（逐条分类为事实错误/合理建议/需补实验，写 rebuttal 并改对应段落）。

## 指令

写作铁律（无例外，违反任一条都可能被拒）：

1. **30 秒法则**：reviewer 前 30 秒只看标题、摘要、图一、表一形成第一印象——任一处令人困惑即扣分。
2. **禁用花哨词**：绝对禁止 novel、groundbreaking、revolutionize、dramatically/drastically、clearly/obviously、very/really/extremely。用事实替代，例：`novel approach` → `we propose X, which differs from prior work in...`；`dramatically improves` → `improves by X% (from Y to Z)`。
3. **One Paragraph = One Message**：每段以 topic sentence 开头，全部句子服务唯一信息，结尾 transition；含两个以上信息必须拆段。
4. **Motivation-First**：描述任何技术决策前先答"为什么"，否则被标记 lack of justification。
5. **数字说话**：所有比较带具体数字；表格最佳加粗、次佳加下划线；改进同时给绝对值与相对百分比。不说 better performance，要说 `78.3% mAP, outperforming the previous best (75.1%) by 3.2 points`。
6. **图表自解释**：每图每表 caption 完整（脱离正文可懂），轴标签清晰、配色色盲友好、黑白打印仍可读。

章节结构规范：Abstract = 4 句话（问题/方法/结果/影响）；Introduction = 漏斗（大背景→问题→不足→方法→贡献）；Related Work 按主题分组做差异化比较；Method = Overview → Details → Justification；Experiments = Setup → Main → Ablation → Analysis；Conclusion = Summary → Limitations → Future Work。

会议偏好差异：NeurIPS/ICML 重理论严谨（建议含 theoretical analysis）；ICLR 重清晰度与可重现性（OpenReview 公开，建议附代码）；CVPR/ECCV/ICCV 必须有 qualitative comparison；ACL/EMNLP 严要求 baseline 与 error analysis；AAAI 页数严格（7+1）、偏好 broad impact。

## 示例

Motivation-First 反例与正例：

```
❌ We use a transformer encoder to process the input features.

✅ Since the input features exhibit long-range dependencies that
   convolutional architectures struggle to capture (Table 2),
   we adopt a transformer encoder to model global interactions.
```

步骤 2 评分表骨架（节选）：

```
| 维度              | 分数  | 说明        |
|-------------------|-------|-------------|
| 新颖性 Novelty    | X/10  | [一句话理由] |
| 技术可靠 Soundness| X/10  | [一句话理由] |
| 清晰度 Clarity    | X/10  | [一句话理由] |
整体分数: X/10 | 决定: Accept / Borderline / Reject
```

## 注意事项

- 输出语言：步骤 1-3 与用户讨论用中文，步骤 4 的 LaTeX 正文用英文。
- 8 页正文篇幅参考：Introduction 1.0-1.5 页(~15%)、Related Work 0.5-1.0(~10%)、Method 2.0-2.5(~30%)、Experiments 2.5-3.0(~35%)、Conclusion 0.3-0.5(~5%)、Abstract ~15 行。
- 投稿前最终自查：标题反映贡献 / Abstract 四句结构 / Introduction 列清贡献 / Method 每个选择有动机 / Experiments 含 main+ablation+analysis / Conclusion 含 limitations / 图表 caption 完整 / 符号全文一致 / 无禁用词 / 所有 claim 有实验支持 / 参考文献格式正确 / 页数达标 / 匿名化完整 / 代码可提供。
- 六位大师哲学贯穿全程：Coarse-to-Fine 先骨架后细节（Sida Peng）、简约主义每句问"能删吗"（Kaiming He）、每个 claim 必有实验支持（Hung-yi Lee）、理论优先于方法描述（Yann LeCun）、关注 scalability（Rich Sutton）、完整披露实验设定保证可重现（Orchestra Research）。

## 互见

- fact-checking：核对论文中的事实性 claim 与引用是否准确。
- first-principles-thinking：从第一性原理打磨论文故事线与贡献定位。
- markdown-to-docx：将草稿在 Markdown 与文档格式间转换以便协作评审。

本条采编自 voidful/academic-skills（MIT）。
