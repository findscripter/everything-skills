---
name: math-proof-writer
title: proof-writer：數學證明撰寫技能
description: 數學證明撰寫技能 — 從主張提取到 LaTeX 排版的完整證明工作流。當使用者需要撰寫或驗證數學定理、引理、命題的形式證明，或需要推導公式、整理理論分析時，一定要使用此技能。觸發詞包括：數學證明、prove、theorem、lemma、proposition、推導、理論分析、寫 proof、LaTeX 數學、formal proof。適用於機器學習理論、統計學習理論、最佳化等需要嚴謹數學推導的場景。
domain: 领域/science
triggers: [formal proof, prove, theorem, lemma, proposition]
tags: [math, proof, latex, theorem, academic, formal-methods]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [sympy-symbolic-math, academic-paper-writer, scientific-manuscript-writing]
combines_with: [sympy-symbolic-math, academic-paper-writer]
license: MIT
source: voidful/academic-skills
source_license: MIT
---
# proof-writer: Mathematical Proof Writing Skill

## Overview

This skill focuses on writing the mathematical proofs found in academic papers. It covers the end-to-end workflow from claim extraction and strategy selection through to fully typeset LaTeX. All explanations are written in English, and mathematical expressions and LaTeX code are written in English as well.

---

## Workflow Overview

Proof writing is divided into five stages, executed in order:

```
Claim extraction → Literature scan → Strategy selection → Step-by-step derivation → LaTeX typesetting
```

Each stage has clearly defined inputs, outputs, and quality checkpoints. The following sections describe them one by one.

---

## Stage 1: Claim Extraction

### Purpose

Precisely extract the mathematical claim that needs to be proven from the paper draft or the user's input. A claim must be a formal proposition with clearly stated hypotheses and a conclusion.

### Steps

1. **Identify the claim type**: Determine whether it is a Theorem, Lemma, Corollary, Proposition, or Claim.
2. **Extract the hypotheses**: List all assumptions, constraints, and the scope of applicability.
3. **Extract the conclusion**: Write out explicitly the equality, inequality, or property to be proven.
4. **Confirm notation**: Confirm the definition and scope of every symbol, referring to
   [Notation Conventions](references/notation-conventions.md).
5. **State the claim formally**: Write the claim in standard mathematical statement form.

### Output Format

```
Claim type: [Theorem | Lemma | Corollary | Proposition | Claim]
Hypotheses:
  - Condition 1
  - Condition 2
  - ...
Conclusion: [formal mathematical statement]
Relevant symbols: [list of symbols and their definitions]
```

### Common Issues

- Incomplete hypotheses: go back and check the assumptions section of the paper.
- Undefined symbols: consult the paper's notation section or confirm with the user.
- Overly vague claim: ask the user to provide a more precise formal statement.

### Quality Check

- [ ] Is the claim a decidable mathematical proposition?
- [ ] Are all symbols defined?
- [ ] Are the hypotheses sufficient to derive the conclusion?
- [ ] Is the claim type classified correctly?

---

## Stage 2: Literature Scan

### Purpose

Find known theorems, lemmas, and results related to the claim in order to build a foundation for the proof. This step determines which "giants' shoulders we can stand on."

### Steps

1. **Keyword extraction**: Extract mathematical keywords from the claim (such as convergence, bound,
   concentration inequality, etc.).
2. **Theorem matching**: Search a body of known theorems for related results, referring to
   [Theorem Connection Methods](references/theorem-connection.md).
3. **Relevance assessment**: Assess how relevant each theorem found is to the current claim.
4. **Establish dependencies**: Determine which theorems can be used directly and which need to be adapted.
5. **Gap analysis**: Identify the gaps between the known results and the target claim.

### Common Theorem Sources

- Lemmas already proven earlier in the paper itself
- References cited by the paper
- Classic results in the field (such as Cauchy-Schwarz, Jensen's inequality, etc.)
- Foundational theorems from standard textbooks

### Output Format

```
Related theorems:
  1. [theorem name] — [brief description] — relevance: [high | medium | low]
  2. ...
Directly citable: [list of theorems]
Requires adaptation: [list of theorems and the needed adaptations]
Proof gaps: [the parts that must be derived from scratch]
```

### Quality Check

- [ ] Have any important known results been missed?
- [ ] Are the hypotheses of the cited theorems satisfied?
- [ ] Is the version of each theorem correct (some theorems have multiple variants)?

---

## Stage 3: Strategy Selection

### Purpose

Based on the structure of the claim and the available known results, select the most suitable proof strategy. The choice of strategy directly affects the clarity and length of the proof.

### Available Strategies

This skill supports the following eight proof strategies. A detailed description of each is given in
[Proof Strategies Reference](references/proof-strategies.md).

#### 1. Direct Proof

Start from the hypotheses and reach the conclusion directly through a sequence of logical derivations. Suitable for claims with a clear structure and an explicit derivation path.

**Applicable to**: equality proofs, inequality derivations, set inclusion relations.

#### 2. Proof by Contradiction

Assume the conclusion is false and derive a contradiction. Suitable for claims that are hard to prove directly or whose conclusion is in negated form.

**Applicable to**: negation of existence, uniqueness proofs, impossibility results.

#### 3. Mathematical Induction

Perform induction over the natural numbers or any well-orderable structure. Includes weak induction, strong induction, and structural induction.

**Applicable to**: recursive structures, properties of sequences, propositions in discrete mathematics.

#### 4. Constructive Proof

Explicitly construct an object satisfying the conditions, thereby proving existence. Provides more information than a purely existential proof.

**Applicable to**: existence propositions, algorithm correctness, establishing concrete bounds.

#### 5. Proof by Reduction

Reduce the problem to be proven to a known problem. Commonly used in computational complexity and decision problems.

**Applicable to**: NP-hardness proofs, lower-bound proofs, equivalence proofs.

#### 6. Probabilistic Method

Prove that the probability of a random choice satisfying the conditions is greater than zero, thereby proving that an object satisfying the conditions exists.

**Applicable to**: combinatorics, graph theory, analysis of randomized algorithms.

#### 7. Convexity Arguments

Derive results using properties of convex functions or convex sets. Especially common in optimization and machine learning theory.

**Applicable to**: optimization problems, applications of Jensen's inequality, convex relaxations.

#### 8. Information-theoretic Methods

Derive results using information-theoretic tools such as entropy, mutual information, and KL divergence.

**Applicable to**: communication theory, learning-theory lower bounds, privacy analysis.

### Strategy Selection Decision Tree

```
Analyze the structure of the claim
├─ Equality or inequality?
│  ├─ Yes → consider direct proof, convexity arguments
│  └─ No → continue
├─ Existence proposition?
│  ├─ Yes → consider constructive proof, probabilistic method
│  └─ No → continue
├─ Involves recursion or sequences?
│  ├─ Yes → consider mathematical induction
│  └─ No → continue
├─ Reducible to a known problem?
│  ├─ Yes → consider proof by reduction
│  └─ No → continue
├─ Involves information measures?
│  ├─ Yes → consider information-theoretic methods
│  └─ No → continue
└─ Direct proof difficult?
   ├─ Yes → consider proof by contradiction
   └─ No → use direct proof
```

### Composite Strategies

Many complex proofs require combining several strategies. Common combinations include:

- **Induction + Direct**: use a direct proof within the inductive step
- **Contradiction + Construction**: assume nonexistence, then construct a contradictory object
- **Reduction + Information theory**: reduce to an information-theoretic problem, then apply information-theoretic tools

### Output Format

```
Selected strategy: [name of the primary strategy]
Auxiliary strategy: [if any]
Rationale: [why this strategy is the best fit]
Expected proof structure: [outline]
Expected difficulty: [low | medium | high]
```

---

## Stage 4: Step-by-Step Derivation

### Purpose

Following the selected strategy, write out the complete and rigorous proof. Every step must have an explicit logical justification.

### Principles

1. **Completeness**: Do not skip any step that is not obvious.
2. **Rigor**: Every derivation step must have an explicit mathematical justification.
3. **Readability**: Use clear language to guide the reader.
4. **Modularity**: Complex proofs should be broken down into multiple lemmas.

### Writing Conventions

#### Derivation Step Format

Each derivation step should include:

- **Statement**: the intermediate conclusion this step establishes
- **Derivation**: the concrete mathematical derivation
- **Justification**: the cited theorem, lemma, or previous step

#### Transition Sentences

Use appropriate transition sentences between steps to guide the reader through the logical flow of the proof:

- "By assumption, ..."
- "It follows from Theorem X that ..."
- "Combining (1) and (2), we obtain ..."
- "Without loss of generality, ..."
- "By the definition of ..., we have ..."

#### Common Warnings

- Avoid using "clearly," "obviously," or "trivially" to skip steps.
- If a step requires more than three lines of derivation, consider extracting it as a separate lemma.
- Ensure every variable is defined before it is used.
- Ensure the scope of quantifiers (for all, there exists) is unambiguous.

### Quality Check

- [ ] Does every derivation step have an explicit logical justification?
- [ ] Are there any unstated assumptions?
- [ ] Are the quantifiers used correctly?
- [ ] Is the notation consistent with the rest of the paper?
- [ ] Is the proof complete (ending with QED or $\square$)?

---

## Stage 5: LaTeX Typesetting

### Purpose

Convert the proof into LaTeX code that can be inserted directly into the paper. The typesetting should follow standard academic-paper formatting.

### Typesetting Conventions

Detailed LaTeX typesetting patterns are given in [LaTeX Math Typesetting Reference](references/latex-math-patterns.md).

#### Basic Environments

```latex
\begin{theorem}[Theorem Name]
\label{thm:theorem-label}
  Statement of the theorem.
\end{theorem}

\begin{proof}
  Proof content here. \qed
\end{proof}
```

#### Numbering and Referencing

- Every theorem, lemma, and corollary must have a `\label`.
- Use `\ref` or `\eqref` for cross-references.
- Number equations using the `equation` or `align` environment.

#### Typesetting Style

- Use `$...$` for inline formulas.
- Use `\[...\]` or a numbered environment for displayed formulas.
- Use the `align` environment for multi-line alignment.
- Use the `cases` environment for case-by-case discussions.

### Output Format

The final output should include:

1. A complete LaTeX code snippet (ready to copy and paste)
2. A list of the additional packages required (such as `amsthm`, `amsmath`, etc.)
3. If custom commands are needed, the accompanying `\newcommand` definitions

### Quality Check

- [ ] Does the LaTeX code compile successfully?
- [ ] Are the mathematical symbols rendered correctly?
- [ ] Are the numbering and references correct?
- [ ] Is the typesetting clean (alignment, spacing, etc.)?
- [ ] Does it conform to the target journal's formatting requirements?

---

## Notation and Typesetting References

- [Detailed Proof Strategies](references/proof-strategies.md)
- [Theorem Connection Methods](references/theorem-connection.md)
- [Notation Conventions](references/notation-conventions.md)
- [LaTeX Math Typesetting Patterns](references/latex-math-patterns.md)

---

## Worked Examples

### Example 1: A Simple Inequality Proof

**Input**: Prove that for all $x > 0$, $e^x \geq 1 + x$.

**Stage 1 output**:

```
Claim type: Proposition
Hypotheses:
  - x > 0, x ∈ ℝ
Conclusion: e^x ≥ 1 + x
Relevant symbols: e is the base of the natural logarithm
```

**Stage 3 output**:

```
Selected strategy: Direct proof
Rationale: can be derived directly by analyzing the properties of f(x) = e^x - 1 - x
Expected proof structure:
  1. Define f(x) = e^x - 1 - x
  2. Compute f'(x) = e^x - 1
  3. Analyze the monotonicity of f
  4. Conclude using f(0) = 0
Expected difficulty: low
```

**Stage 5 output**:

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

### Example 2: A Generalization Bound in Machine Learning

**Input**: Prove an upper bound on the sample complexity of a finite hypothesis class under the PAC learning framework.

**Stage 1 output**:

```
Claim type: Theorem
Hypotheses:
  - H is a finite hypothesis class, |H| < ∞
  - The sample S consists of m i.i.d. samples from distribution D
  - ε > 0, δ > 0
Conclusion: If m ≥ (1/ε)(ln|H| + ln(1/δ)), then with probability at least 1-δ,
            |R(h) - R̂(h)| ≤ ε for all h ∈ H
Relevant symbols: R(h) is the true risk, R̂(h) is the empirical risk
```

**Stage 3 output**:

```
Selected strategy: Direct proof + probabilistic method
Auxiliary strategy: reduction to Hoeffding's inequality
Rationale: the classic combination of union bound + concentration inequality
Expected proof structure:
  1. Apply Hoeffding's inequality to a single hypothesis h
  2. Take a union bound over all hypotheses
  3. Solve for the lower bound on m
Expected difficulty: medium
```

---

## Common Working Modes

### Mode 1: Full Proof Writing

The user provides a claim, and the system runs the complete five-stage workflow, outputting ready-to-use LaTeX code.

### Mode 2: Proof Repair

The user provides a flawed proof, and the system diagnoses the issues and fixes them. Common issues include:

- Logical leaps (missing intermediate steps)
- Quantifier errors
- Unhandled edge cases
- Cited theorems whose hypotheses are not satisfied

### Mode 3: Proof Translation

Convert an informal, intuitive argument into a rigorous mathematical proof.

### Mode 4: Strategy Consultation

The user describes the goal they want to prove, and the system suggests possible proof strategies and approaches without writing a complete proof.

---

## Notes

1. **Rigor first**: prefer being verbose over skipping steps. Readers can skip over obvious steps, but they cannot fill in missing ones.
2. **Notation consistency**: all symbols must be consistent with the rest of the paper. If there is a conflict, state it explicitly at the beginning of the proof. Refer to [Notation Conventions](references/notation-conventions.md).
3. **Compilability**: the output LaTeX must compile directly, with no syntax errors.
4. **Academic tone**: write the mathematical parts in formal academic English, avoiding colloquial expressions.
5. **Citation conventions**: every result used that is not proven in this text must be accompanied by a citation.
