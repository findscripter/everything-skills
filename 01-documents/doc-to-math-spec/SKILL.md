---
name: doc-to-math-spec
title: 文档转数学问题规范
description: 当需要把叙述性技术文档、论文片段或问题描述形式化为「有据可循」的数学问题规范（MPS）时使用；做零推断式抽取，产出含变量/算子/约束/目标/不确定性、每项均引证原文且对缺失项显式标注的结构化 JSON 规范；不适用于求解优化模型、写证明，或自行补全文档中未给出的方程与数值。触发词：形式化为数学、抽取数学结构、变量约束目标、转成MPS、找出缺失的形式化要素
domain: 文书/writing
triggers: [把问题陈述形式化为数学, 抽取论文里的数学结构, 这段规范有哪些变量约束和目标, 把应用题转成结构化MPS, 找出问题表述里缺什么, formalize into math, extract mathematical structure, document to math spec, doc2math]
tags: [数学建模, 形式化, 问题规范, MPS, 零推断, 证据引用, JSON输出, 需求抽取, 文书写作]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [first-principles-assumption-auditor, math-proof-writer, guided-statistical-analysis]
combines_with: [sympy-symbolic-math, math-proof-writer]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

当你手上有一段**叙述性的技术文档、论文章节、问题描述或规范文本**，需要把它**形式化**成一份结构化的「数学问题规范」(MPS, Mathematical Problem Specification)，且要求每一个抽取出的要素都能回指到原文证据时使用。典型场景：

- 「把这段问题陈述形式化为数学」「抽取这篇论文某节的数学结构」。
- 「这份规范里有哪些变量、约束、目标？」「把这道应用题转成结构化 MPS」。
- 「这个问题表述里缺了什么？」——盘点形式化所需但文档未给的信息。

**不该用的边界：**

- 要**求解**优化模型、跑数值、写**证明** → 本技能只产出规范，不产出解或证明。
- 想让模型**补全**文档里没有的方程、定义域、数值或假设 → 违反零推断协议，应改用普通建模/推理。
- 原文信息过于稀疏、无法为要素提供引证 → 仍可运行，但结果会是大量 `MISSING` 标记，需先补充原文。

## 步骤

整体遵循「**零推断协议**」：文档没说的，输出里就不存在。

1. **接收文档**：接受文档正文、研究摘录、问题描述或规范作为输入。
2. **分类问题**：判定 `problem_class`，取值 `optimization | classification | simulation | proof | estimation | other`。
3. **抽取 MPS 五类要素**（字段见下方「指令」）：变量 Variables、算子 Operators、约束 Constraints、目标 Objectives、不确定性 Uncertainty。
4. **盘点缺失信息**：识别文档「暗示了但没明说」的内容，写入 `missing_information[]`，含 `element`（缺什么）、`needed_for`（用于什么）、`missing_reason`（为何判为缺失）。
5. **校验并打分**：填写 `validation_flags`（见下方），给出整体可形式化程度 `overall_formalizability`。

## 指令

**零推断协议（6 条强制规则，输出任何要素前逐条检查）：**

1. **闭世界**：文档未陈述 = 输出中不存在。
2. **接地规则**：每个要素必须在 `evidence` 字段引用**原文精确短语**。
3. **不静默填充**：未知值填 `null`；类型含糊填 `"ambiguous"`。
4. **推断标记**：结构性推断须标 `"inferred": true` 并给 `"inference_basis"`。
5. **MISSING 标记**：提及但定义不足的要素标 `"status": "MISSING"` 并给 `"missing_reason"`。
6. **不臆造数学**：绝不引入原文没有的方程或数值。

**五类要素的字段：**

- **变量 Variables**：`id, name, symbol, type, domain, units, role, evidence, inferred, status`
- **算子 Operators**：`id, name, symbol, arity, acts_on, produces, evidence, inferred`
- **约束 Constraints**：`id, type, expression, variables_involved, evidence, hardness, inferred, status`
- **目标 Objectives**：`id, direction(minimize/maximize/satisfy/find/prove), expression, variables_involved, evidence, inferred`
- **不确定性 Uncertainty**：`id, type(stochastic/epistemic/measurement/model/none_stated), affects, characterization, evidence, status`

**`validation_flags` 字段：**

- `has_complete_objectives`: true/false/partial
- `has_bounded_variables`: true/false/partial
- `has_evidence_for_all_elements`: true/false/partial
- `inference_count`: 整数
- `missing_count`: 整数
- `overall_formalizability`: HIGH/MEDIUM/LOW

## 示例

最终产出一个完整的 MPS JSON 对象：

```json
{
  "mps_version": "1.0",
  "source_title": "...",
  "problem_class": "optimization",
  "variables": [...],
  "operators": [...],
  "constraints": [...],
  "objectives": [...],
  "uncertainty": [...],
  "missing_information": [...],
  "validation_flags": {
    "overall_formalizability": "HIGH"
  }
}
```

最小提示词模板：

```
对以下文档做 doc-to-math-spec 形式化，严格执行零推断协议：
1) 判定 problem_class；
2) 抽取 variables/operators/constraints/objectives/uncertainty，每项 evidence 必须引用原文精确短语，未知值用 null，含糊用 "ambiguous"；
3) 凡推断的要素标 inferred=true 并给 inference_basis；定义不足的标 status=MISSING；
4) 汇总 missing_information[] 与 validation_flags；
5) 仅输出 MPS JSON，不要求解、不臆造方程。
<文档正文>
```

## 注意事项

- ✅ 输出任何要素前先过一遍 6 条零推断规则；每个 `evidence` 必须引用原文精确短语。
- ✅ **不完整的形式化是合法输出**：宁可显式标 `MISSING`，也不要静默推断补全。
- ❌ 绝不引入原文未接地的数学关系、方程或数值。
- 本技能产出的是**形式化规范**，不是求解结果或证明，下游求解/证明需另接工具。
- 原文越稀疏，`missing_count` 与 `MISSING` 越多——这是信号而非失败，应反馈给用户补充原文。

## 互见

- related：`first-principles-thinking`（把问题拆到约束本质，与本技能的「显式列出约束/假设」互补）、`fact-checking`（对原文中存疑的硬事实先核验再接地）。
- combines_with：文书类技能（如 `docs-architect`、`technical-reference-builder`）可把产出的 MPS 进一步整理成可读文档或规格说明。
- 源技能附带在线 BYOK 工具与原仓库 `thebrierfox/doc2math-skill`，需要完整工具链时可参阅。

---
*采编自 [sickn33/antigravity-awesome-skills](https://github.com/sickn33/antigravity-awesome-skills) 的 `doc2math` 技能（MIT 许可），原作者 IntuiTek¹（~K¹）。本条目为适配重写，非逐字翻译。*
