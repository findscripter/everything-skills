---
name: academic-peer-reviewer
title: 学术论文审稿
description: 当需要审阅一篇学术论文、模拟 reviewer 反应、判断能否被接收或找出论文优缺点时使用；以批判审查→分数预测→要点精炼→正式审稿四步流程，产出含评分与建设性意见的正式 review；不适用于论文写作/润色或非学术稿件。触发词：审稿、审阅论文、review 这篇、reviewer 会怎么说、这篇能上吗、给分数、找 weakness、peer review、meta-review。
domain: 领域/science
triggers: [审稿, 审阅论文, review 这篇, reviewer 会怎么说, 这篇能上吗, 给分数, 找 weakness, peer review, meta-review, 评估论文]
tags: [academic, peer-review, paper-review, science, evaluation, scoring, meta-review]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [academic-paper-writer, academic-paper-explainer, scientific-manuscript-writing]
combines_with: [academic-paper-writer, guided-statistical-analysis]
license: MIT
source: voidful/academic-skills
source_license: MIT
---
## 何时使用

- 用户要审阅一篇学术论文、模拟评审反应、判断能否被某会议/期刊接收，或系统化找出论文优缺点。
- 需要按顶会标准（NeurIPS、ICML、ICLR、ACL、CVPR 等）给出评分预测与正式 review。
- 需要综合多位 reviewer 意见撰写 meta-review。

不该用的边界：
- 不用于论文写作、润色、改稿或生成（那是 paper-writing 类任务）。
- 不用于非学术稿件（如商业方案、新闻稿）的评审。
- 不替代真实同行评议的署名责任，仅做模拟与辅助。

## 步骤

四步流程：前三步用中文深度分析，第四步产出英文正式 review。可按需只执行某步或从中途开始。

1. **批判性审查（中文）**：三遍读法——快速浏览（标题/摘要/引言/结论/图表，形成初印象）→ 仔细阅读（逐节读、核对数学推导、验证实验设置、检查 claim 是否被支撑）→ 批判分析（对照五维度、识别五大退稿模式、找 missing baselines/ablations/analysis）。输出基本信息、初印象、优点[S]、缺点[W]、疑问[Q]、初步判断。
2. **分数预测（中文）**：对五维度各打 1-5 分，预测 Overall（1-10）与 Confidence（1-5）。整体分非简单平均——致命缺陷可直接拉低；并与目标会议接受门槛对比（clear accept / borderline / clear reject）。
3. **要点精炼（中文）**：合并去重、按重要性排序、补论文引用、区分 Major / Minor、为每个缺点附改进建议。作为第四步草稿。
4. **正式审稿（英文）**：把要点译写成学术英语，按 Summary / Strengths / Weaknesses / Questions / Suggestions / Minor Issues / Rating / Justification 结构输出。

## 指令

五大审查维度（各 1-5 分）：

| 维度 | 关注 | 权重 |
|------|------|------|
| 贡献新颖性 Novelty & Contribution | 想法是否新？增量够大吗？ | 高 |
| 写作清晰度 Clarity & Writing | 非专家能否懂主贡献？符号一致吗？ | 中 |
| 实验严谨性 Experimental Rigor | 设计能验证 claim？有合适 baselines、误差/显著性吗？ | 高 |
| 评估完整性 Evaluation Completeness | 数据多样？有 ablation、error analysis、局限讨论吗？ | 中高 |
| 方法健全性 Soundness of Method | 推导对吗？假设合理且明示？有无 data leakage？ | 高 |

五大退稿模式（识别即重点关注）：
1. 贡献不足——"This is a straightforward extension of [X]."
2. 不清楚——"The paper is difficult to follow."
3. 效果弱——"The improvements are marginal and may not be statistically significant."
4. 评估不全——"Key baselines such as [X] are missing."
5. 方法有缺——"There appears to be an error in the derivation of Eq. (X)."

Overall Score 速查：10=Strong Accept；8-9=Accept；6-7=Weak Accept/Borderline；5=Borderline；3-4=Reject；1-2=Strong Reject。
Confidence：5=本子领域专家 … 1=非我领域。

语气：评论论文不评论作者。避免"This paper is bad."；改用"The paper would benefit from…""It is unclear how…""A potential concern is…"。

## 示例

输入：`请以 NeurIPS 2026 的标准审查这篇论文：[论文内容/PDF 路径]，特别注意 reproducibility`

执行：依次产出 Step 1-3 中文分析，Step 4 英文 review，例如——

```
## Summary
This paper proposes … (2-4 句准确复述贡献与方法)

## Strengths
1. [S1] Clear motivation and a well-designed ablation in Sec. 4.2 …

## Weaknesses
1. [W1] Key baselines such as [X, Y] are missing, making the marginal gains hard to interpret (Table 2).

## Questions for Authors
1. [Q1] How does the method behave when … ?

## Rating
- Overall: 5/10
- Confidence: 3/5

## Justification
The idea is promising but evaluation completeness is the main blocker; addressable in rebuttal.
```

Meta-review：粘贴三份 review，归纳共识与分歧、评估 rebuttal 是否回应主要问题、给最终建议。

## 注意事项

- 优缺点必须具体到段落/公式/实验，杜绝"写得不错""实验不足"这类空泛评语。
- 评分要与文字一致——不要给高分却写满缺点。
- 不确定的批评写进 Questions for Authors，不作为拒稿主因。
- Confidence 要诚实；不熟悉子领域就给低分。
- Borderline 时：优点重大且缺点可在 camera-ready 修复 → 倾向接受；核心方法有问题 → 倾向拒稿。
- 即使拒稿也要真诚承认优点；批评对事不对人。
- 倫理：保密、回避利益冲突、尊重作者、建设性导向。

## 互见

- fact-checking：核查论文 claim 与引用是否属实。
- first-principles-thinking：从第一性原理判断贡献的真实新颖性与方法健全性。
- code-reviewer：审查论文附带的开源代码与可复现性。

---

本条采编自 voidful/academic-skills（MIT）。
