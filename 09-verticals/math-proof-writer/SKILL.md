---
name: math-proof-writer
title: 数学证明撰写
description: 当需要为定理/引理/命题撰写、修复或形式化严谨的数学证明并产出可编译 LaTeX 时使用；做主张提取→文献定理匹配→策略选择→逐步推导→LaTeX 排版的端到端证明，产出可直接插入论文的证明代码；不适用于纯数值计算、绘图或非形式化的直觉说明。触发词：数学证明、formal proof、prove、theorem、lemma、proposition、推导、理论分析、LaTeX 数学、证明策略
domain: 领域/science
triggers: [数学证明, formal proof, prove, theorem, lemma, proposition, 推导, 理论分析, LaTeX 数学, 证明策略]
tags: [math, proof, latex, theorem, academic, formal-methods]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [LaTeX, amsthm, amsmath]
requires: []
related: [sympy-symbolic-math, academic-paper-writer, scientific-manuscript-writing]
combines_with: [sympy-symbolic-math, academic-paper-writer]
license: MIT
source: voidful/academic-skills
source_license: MIT
---
## 何时使用

- 需要为定理(Theorem)、引理(Lemma)、推论(Corollary)、命题(Proposition)撰写严谨形式证明，或把非形式化的直觉论证转换为可发表的证明。
- 需要诊断并修复已有证明的逻辑跳步、量词错误、边界未处理、引用定理前提不满足等问题。
- 需要为机器学习理论、统计学习理论、最优化等场景做严谨推导，并产出可直接编译插入论文的 LaTeX。
- 仅需策略咨询（给出证明思路而不写完整证明）时也适用。

不该用的边界：纯数值计算/仿真、画图绘表、不要求严谨性的科普或直觉性说明、以及无明确前提与结论的开放性问题，均不适用本条。

约定：解释用中文，数学表达式与 LaTeX 代码用英文。

## 步骤

按五个阶段顺序执行，每阶段都有输入、输出与质检点：

1. 主张提取：判定主张类型；列全前提条件与适用范围；写出形式化结论；确认所有符号定义。质检——主张是否可判定、符号是否全部已定义、前提是否足以推出结论。
2. 文献/定理扫描：提取数学关键词（convergence、bound、concentration inequality 等），匹配可复用的已知结果（前文引理、参考文献、经典不等式如 Cauchy-Schwarz、Jensen、Hoeffding），区分「可直接引用 / 需修改后用 / 证明缺口」。质检——引用定理的前提是否满足、版本是否正确。
3. 策略选择：基于结构选定主策略（可复合）。质检——策略是否匹配主张结构、是否给出选择理由。
4. 逐步推导：每步含「陈述+推导+依据」，不跳过非显然步骤，量词作用域明确，复杂部分拆为独立引理。质检——每步是否有明确依据、是否有未声明假设、证明是否以 QED/$\square$ 收尾。
5. LaTeX 排版：用 amsthm/amsmath 环境输出可编译代码，所有定理加 `\label` 并用 `\ref`/`\eqref` 交叉引用。质检——能否编译、符号呈现、编号引用是否正确。

## 指令

- 八种证明策略及典型场景：直接证明（等式/不等式/集合包含）、反证法（唯一性/不可能性）、数学归纳法（递归/序列，含强归纳与结构归纳）、构造性证明（存在性/算法正确性）、归约法（NP-hardness/下界/等价性）、概率法（组合/图论/随机化算法）、凸性论证（最优化/Jensen 应用）、信息论方法（学习理论下界/隐私分析）。复杂证明常需复合，如「归纳+直接」「反证+构造」「归约+信息论」。
- 过渡语句规范使用学术英文：`By assumption, ...`、`It follows from Theorem X that ...`、`Combining (1) and (2), we obtain ...`、`Without loss of generality, ...`。
- 禁止用 clearly / obviously / trivially 掩盖跳步；单步推导超过三行就提取为独立引理；所有变量先定义后使用。
- 所有非本文证明的结果必须给出引用；符号须与论文其余部分一致，有冲突在证明开头声明。

## 示例

证明：对所有 $x > 0$，$e^x \geq 1 + x$。

主张类型 Proposition；策略选直接证明（分析 $f(x)=e^x-1-x$）。LaTeX 输出：

```latex
\begin{proposition}
\label{prop:exp-lower-bound}
  For all $x > 0$, we have $e^x \geq 1 + x$.
\end{proposition}

\begin{proof}
  Define $f(x) = e^x - 1 - x$. We have $f(0) = 0$ and
  $f'(x) = e^x - 1 > 0$ for all $x > 0$. Therefore, $f$ is
  strictly increasing on $(0, \infty)$, which implies
  $f(x) > f(0) = 0$ for all $x > 0$. That is, $e^x > 1 + x$.
  \qed
\end{proof}
```

进阶示例（PAC 学习有限假设类样本复杂度上界）：主张类型 Theorem，前提 $|H|<\infty$、$m$ 个 i.i.d. 样本、$\varepsilon,\delta>0$；策略为「直接证明 + 概率法」，归约到 Hoeffding's inequality；结构为：对单个 $h$ 用 Hoeffding，对全体 $h$ 取 union bound，解出 $m \geq (1/\varepsilon)(\ln|H| + \ln(1/\delta))$。

## 注意事项

- 严谨性优先：宁可冗长也不跳步——读者可略过显然步骤，但无法填补缺失步骤。
- 可编译性：输出 LaTeX 必须无语法错误、可直接编译；列出所需宏包（amsthm、amsmath 等）及自定义 `\newcommand`。
- 学术语调：数学部分用正式学术英文，避免口语化。
- 一致性：符号、定理版本、量词作用域三者全程一致。

## 互见

- first-principles-thinking：从公理与定义出发拆解问题，辅助策略选择与逐步推导。
- fact-checking：核验所引用定理的前提是否满足、版本是否正确、引用是否到位。

---

本条采编自 voidful/academic-skills（MIT）。
