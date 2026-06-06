---
name: research-experiment-designer
title: 實驗設計技能
description: 學術研究實驗設計技能——從研究假設到可重現實驗計畫的完整流程。當使用者需要規劃實驗、設計 ablation study、選擇 baseline、確定評估指標，或問「我應該跑哪些實驗」時，一定要使用此技能。觸發詞包括：實驗設計、experiment design、ablation、baseline、跑什麼實驗、evaluation metric、如何驗證方法。適用於機器學習、NLP、CV 等領域的實驗規劃。
domain: 领域/science
triggers: [experiment design, ablation, baseline, evaluation metric]
tags: [experiment-design, ablation, baseline, evaluation-metrics, reproducibility, machine-learning, research, science]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [guided-statistical-analysis, nih-grant-finder, scientific-manuscript-writing, academic-paper-writer]
combines_with: [guided-statistical-analysis, nih-grant-finder, scientific-manuscript-writing]
license: MIT
source: voidful/academic-skills
source_license: MIT
---
# Experiment Design Skill

## Overview

This skill provides a structured experiment design process suitable for academic research in machine learning, natural language processing, computer vision, and related fields. The goal is to help researchers move from a vague research idea to a rigorous, reproducible, and convincing experiment plan.

## Core Design Principles

A good experiment design should have the following characteristics:

- **Falsifiability**: Experimental results must be able to support or refute the research hypothesis
- **Fairness**: All compared subjects are evaluated under the same conditions
- **Reproducibility**: Others can fully reproduce the experiment from the description
- **Sufficiency**: The experiments cover enough aspects to support the paper's conclusions

---

## Experiment Design Pipeline

A complete experiment design follows this six-step process:

```
Hypothesis → Variables → Metrics → Baseline → Ablation → Compute Budget
```

The output of each step is the input to the next, forming a rigorous chain of reasoning.

---

## Step 1: Clarify the Research Hypothesis

### Purpose

Turn a vague research motivation into a verifiable, concrete hypothesis.

### Method

1. **Identify the research question**: What question do you want to answer?
2. **Propose a core hypothesis**: What is the expected answer to the question?
3. **Make the hypothesis precise**: The hypothesis must be measurable and falsifiable
4. **Decompose into sub-hypotheses**: Break a complex hypothesis into sub-hypotheses that can be verified one by one

### Quality Criteria for a Hypothesis

| Criterion | Description |
|------|------|
| Specificity | Clearly states the expected direction and magnitude of the effect |
| Measurability | Can be verified with quantitative metrics |
| Falsifiability | There exist possible experimental results that would refute the hypothesis |
| Relevance | Directly related to the research question |

### Example

- Poor: "Our method is better"
- Good: "On the SQuAD 2.0 dataset, adding a cross-attention mechanism improves the F1 score by at least 2 percentage points compared to a pure self-attention baseline"

See also: [Experiment Planning Reference](references/experiment-planning.md)

---

## Step 2: Define Variables

### Independent Variables

The variables actively manipulated by the researcher, i.e., "what changes" in the experiment.

- Variants of the model architecture
- Differences in training strategy
- Differences in data processing methods

### Dependent Variables

The variables used to measure the experimental results, i.e., "what is measured."

- Model performance metrics (accuracy, F1, BLEU, etc.)
- Efficiency metrics (inference time, memory usage)
- Quality metrics (human evaluation scores)

### Control Variables

The variables held constant throughout the experiment to ensure fair comparison.

- Random seed
- Training dataset and split
- Hyperparameters (the parts not under study)
- Hardware environment
- Pretrained model version

### Variable Control Principles

1. **Single-variable principle**: Change only one independent variable per experiment
2. **Complete-recording principle**: The values of all variables must be recorded
3. **Reasonable-range principle**: The value range of the independent variable should have a theoretical justification

See also: [Experiment Planning Reference](references/experiment-planning.md)

---

## Step 3: Choose Evaluation Metrics

### Selection Principles

1. **Field conventions**: Prefer standard metrics recognized in the field
2. **Multi-aspect coverage**: Report performance, efficiency, and robustness metrics together
3. **Statistical significance**: Report the mean and standard deviation across multiple runs
4. **Validity**: The metric truly reflects the aspect the research hypothesis focuses on

### Common Metric Categories

| Category | Example Metrics |
|------|----------|
| Classification tasks | Accuracy, Precision, Recall, F1-score, AUC-ROC |
| Generation tasks | BLEU, ROUGE, METEOR, BERTScore, human evaluation |
| Information retrieval | MAP, MRR, NDCG, Recall@K |
| Efficiency metrics | FLOPs, parameter count, inference latency, memory footprint |
| Robustness | Cross-dataset performance, adversarial-example accuracy |

### Statistical Testing

- Report the mean and standard deviation across runs with multiple random seeds
- Perform statistical significance tests when necessary (e.g., paired t-test, bootstrap test)
- Annotate the statistical significance level (p < 0.05, p < 0.01)

---

## Step 4: Baseline Selection and Setup

### Required Baseline Types

1. **Classic methods**: Historically important methods in the field
2. **Current SOTA**: The latest best-performing methods
3. **Simple baselines**: Simple but reasonable baseline methods (e.g., random, majority class, TF-IDF)

### Fair Comparison Principles

- Use the same data splits
- Use the same evaluation protocol
- Use the original authors' code and hyperparameters whenever possible
- If reimplementation is required, verify that the reproduced results match the original paper

### Common Mistakes

- Comparing only against weak baselines
- Not using the latest SOTA as a baseline
- Leaving the baseline's hyperparameters untuned
- Inconsistent comparison conditions (e.g., different pretrained models)

See also: [Baseline Selection Guide](references/baseline-selection.md)

---

## Step 5: Ablation Study Design

The ablation study is the key experiment for verifying the contribution of each component of a method. This skill defines four ablation modes:

### Mode 1: Component Ablation

Remove or replace each component of the method one at a time and observe the change in performance.

- Remove only one component at a time
- Record the performance change after removal
- Use this to assess the contribution of each component

### Mode 2: Hyperparameter Sensitivity

Investigate the impact of key hyperparameters on performance.

- Select the 2-4 most important hyperparameters
- Vary the hyperparameter values within a reasonable range
- Plot hyperparameter-vs-performance curves

### Mode 3: Cross-Dataset Transfer

Verify the generalization ability of the method.

- Test on multiple different datasets
- Include datasets of different scales and from different domains
- Analyze under what conditions the method performs best or worst

### Mode 4: Qualitative Analysis

Gain a deeper understanding of model behavior through visualization and case analysis.

- Attention-weight visualization
- Analysis of success and failure cases
- Feature-space visualization (e.g., t-SNE)
- Classification and statistics of error types

See also: [Ablation Design Guide](references/ablation-design.md)

---

## Step 6: Estimate Computational Resources

### Items to Estimate

1. **Cost of a single experiment**
   - GPU hours
   - Memory requirements
   - Storage requirements

2. **Total experiment volume**

   ```
   Total GPU hours = single-run hours × number of model variants × number of datasets × number of random seeds × number of hyperparameter combinations
   ```

3. **Safety factor**
   - It is recommended to reserve 1.5-2x the estimated resources
   - Account for debugging, pilot experiments, and additional follow-up experiments

### Resource Optimization Strategies

- Run pilot experiments on a small-scale dataset first
- Use early stopping to save training time
- Make good use of mixed-precision training
- Plan the experiment priority order reasonably

---

## Reproducibility Requirements

The experiment plan must include complete reproducibility information to ensure that others can reproduce the results precisely.

### Required Disclosure Items

1. **Hardware environment**
   - GPU model and count
   - CPU specifications
   - Memory size

2. **Software environment**
   - Programming language version
   - Deep learning framework version
   - Versions of key packages

3. **Randomness control**
   - Random seed settings
   - Deterministic algorithm settings
   - The list of seeds used across runs

4. **Training protocol**
   - The complete list of hyperparameters
   - Optimizer settings
   - Learning rate schedule
   - Data augmentation strategy
   - Early stopping criteria

5. **Data processing**
   - Dataset version and source
   - Preprocessing steps
   - Data split method

6. **Evaluation protocol**
   - Precise definition of the evaluation metrics
   - Evaluation frequency
   - Model selection criteria

See also: [Reproducibility Checklist](references/reproducibility-checklist.md)

---

## Output: Structured Experiment Plan Document

The final output of this skill is a structured experiment plan document that contains the following sections:

1. Research hypothesis and sub-hypotheses
2. Variable definition table
3. Evaluation metrics and statistical methods
4. Baseline list and settings
5. Ablation study design matrix
6. Computational resource estimate and schedule plan
7. Reproducibility information

Template to use: [Experiment Plan Template](templates/experiment-plan.md)

---

## Usage Flow

### Input

- Research topic or paper draft
- Description of the proposed method
- Available computational resources

### Processing

1. Guide the user to clarify the research hypothesis
2. Help define independent, dependent, and control variables
3. Recommend evaluation metrics based on the task type
4. Recommend baselines based on the research field
5. Design the ablation study plan
6. Estimate computational resource needs

### Output

- A complete experiment plan document (following the template format)
- Recommendations for experiment priority order
- Potential risks and mitigation plans

---

## Quality Checklist

After completing the experiment plan, please confirm the following items:

- [ ] Every research hypothesis has a corresponding experiment to verify it
- [ ] The value ranges of all independent variables are clearly defined
- [ ] All control variables are fully listed
- [ ] The evaluation metrics cover multiple aspects
- [ ] The baselines include classic methods, SOTA, and a simple baseline
- [ ] The ablation study covers all proposed components
- [ ] The computational resource estimate is reasonable and includes a safety factor
- [ ] The reproducibility information is complete
- [ ] The statistical testing method has been determined

---

## Reference Resources

- [Experiment Planning Methods](references/experiment-planning.md)
- [Baseline Selection Guide](references/baseline-selection.md)
- [Ablation Design Guide](references/ablation-design.md)
- [Reproducibility Checklist](references/reproducibility-checklist.md)
- [Experiment Plan Template](templates/experiment-plan.md)
