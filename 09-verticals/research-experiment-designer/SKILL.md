---
name: research-experiment-designer
title: 科研实验设计
description: 当需要把模糊研究想法转成严谨可复现实验计划（设计 ablation、选 baseline、定评估指标）时使用；做的事是按「假设→变量→指标→Baseline→Ablation→算力预算」六步产出结构化实验计划文档；不适用于已有计划只需跑代码、统计分析或论文写作。触发词：实验设计、experiment design、ablation、消融、baseline、基线、跑什么实验、evaluation metric、评估指标、如何验证方法、可复现
domain: 领域/science
triggers: [实验设计, experiment design, ablation, 消融, baseline, 基线, 跑什么实验, evaluation metric, 评估指标, 如何验证方法, 可复现]
tags: [experiment-design, ablation, baseline, evaluation-metrics, reproducibility, machine-learning, research, science]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [t-test, bootstrap, t-SNE, mixed-precision, early-stopping]
requires: []
related: [guided-statistical-analysis, nih-grant-finder, scientific-manuscript-writing, academic-paper-writer]
combines_with: [guided-statistical-analysis, nih-grant-finder, scientific-manuscript-writing]
license: MIT
source: voidful/academic-skills
source_license: MIT
---
## 何时使用

- 在 ML / NLP / CV 等领域，需要把一个模糊的研究想法变成**严谨、公平、可复现**的实验计划时。
- 用户问「我应该跑哪些实验」「怎么设计 ablation」「该选哪些 baseline」「用什么评估指标」「怎么验证我的方法有效」。
- 撰写论文/技术报告前的实验规划阶段，或审视已有实验是否覆盖充分。

**不该用边界**：实验计划已定、只需写训练代码或跑实验；纯数据统计分析；论文写作/润色；非实证类研究（理论证明、综述）。这些场景请转用专门技能或直接执行。

好实验设计的四条底线：**可证伪**（结果能支持或否定假设）、**公平**（同条件比较）、**可复现**（他人能完整重现）、**充分**（覆盖足够面向支撑结论）。

## 步骤

严格遵循六步推导链，每步产出是下一步输入：

```
假设 → 变量 → 指标 → Baseline → Ablation → 算力预算
```

### 1. 假设明确化
将研究动机转成可测量、可证伪的具体假设，并拆解子假设。
- 反例：「我们的方法更好」
- 正例：「在 SQuAD 2.0 上，加入跨注意力后 F1 相较纯自注意力基线提升至少 2 个百分点」
- 质量标准：具体性、可测量性、可证伪性、相关性。

### 2. 变量定义
- **自变量**（主动操控）：模型架构变体、训练策略、数据处理方式。
- **因变量**（被测量）：性能（Accuracy/F1/BLEU）、效率（推理时延/显存）、质量（人工评分）。
- **控制变量**（保持不变）：随机种子、数据集与切分、非研究对象的超参、硬件、预训练模型版本。
- 三原则：**单一变量**（每次只改一个自变量）、**完整记录**、**取值范围有理论依据**。

### 3. 评估指标选择
- 优先领域公认标准指标；同时报性能、效率、稳健性多面向。
- 报多种子的均值±标准差；必要时做显著性检验并标注 p 水平。
- 常见指标：分类 Accuracy/Precision/Recall/F1/AUC-ROC；生成 BLEU/ROUGE/METEOR/BERTScore/人工评估；检索 MAP/MRR/NDCG/Recall@K；效率 FLOPs/参数量/时延/显存；稳健性 跨数据集表现/对抗准确率。

### 4. Baseline 选择
必须覆盖三类：**经典方法** + **当前 SOTA** + **简单基线**（随机/多数类/TF-IDF）。
- 公平比较：同切分、同评估协议、尽量用原作者代码与超参；复现时须验证与原论文一致。
- 常见错误：只比弱基线、不用最新 SOTA、基线超参未调、比较条件不一致。

### 5. Ablation Study（四模式）
- **组件消融**：每次只移除/替换一个组件，量化各组件贡献。
- **超参敏感度**：选 2-4 个关键超参，合理范围内扫描，绘超参-性能曲线。
- **跨数据集迁移**：在不同规模/领域数据集上测泛化，分析最佳/最差条件。
- **定性分析**：注意力可视化、成功/失败案例、t-SNE 特征空间、错误类型统计。

### 6. 算力预算
估单次成本（GPU 时数/显存/存储），再算总量：

```
总 GPU 时数 = 单次时数 × 模型变体数 × 数据集数 × 随机种子数 × 超参组合数
```

预留 **1.5-2 倍**安全系数（含调试/预实验/追加）。优化：小数据集预实验、early stopping、混合精度、合理排优先级。

## 指令

- 引导用户依次完成六步，**每步产出作为下一步输入**，禁止跳步。
- 强制可复现信息齐全：硬件（GPU 型号/数量）、软件（语言/框架/关键包版本）、随机性（种子列表/确定性算法）、训练协议（完整超参/优化器/学习率调度/数据增强/早停准则）、数据（版本/来源/预处理/切分）、评估协议（指标精确定义/评估频率/选模准则）。
- 最终交付一份**结构化实验计划文档**，含 7 章：① 假设与子假设 ② 变量定义表 ③ 评估指标与统计方法 ④ Baseline 列表与设定 ⑤ Ablation 设计矩阵 ⑥ 算力预估与时程 ⑦ 可复现性信息。
- 交付前过一遍质量检查清单（见下）。

## 示例

**输入**：研究主题/论文草稿 + 方法描述 + 可用算力。

**输出片段（节选实验计划）**：
- 假设 H1：在 SQuAD 2.0 上跨注意力使 F1 ≥ +2pt（5 种子均值，paired t-test，p<0.05）。
- 自变量：注意力机制 ∈ {纯自注意力, 自+跨注意力}；控制变量：种子 {1,2,3,4,5}、bert-base-uncased、相同切分与超参。
- 指标：EM、F1（主）；推理时延、显存（次）。
- Baseline：BiDAF（经典）、当前榜首模型（SOTA）、多数类（简单）。
- Ablation：移除跨注意力（组件）；扫描注意力头数 {4,8,12}（超参）；NewsQA 上测迁移（跨集）；注意力热图（定性）。
- 算力：单次 6 GPU·h × 2 变体 × 1 集 × 5 种子 = 60 GPU·h，×1.5 = 90 GPU·h。

**质量检查清单**：
- [ ] 每个假设都有对应实验验证
- [ ] 自变量取值范围已明确
- [ ] 控制变量完整列出
- [ ] 指标覆盖多面向
- [ ] Baseline 含经典/SOTA/简单基线
- [ ] Ablation 覆盖所有提出的组件
- [ ] 算力预估含安全系数
- [ ] 可复现信息完整
- [ ] 统计检验方法已确定

## 注意事项

- **单一变量是底线**：一次改多个自变量会让结论无法归因。
- 只与弱基线比较是最常见的致命错误，务必纳入最新 SOTA 并调好其超参。
- 报均值不报方差等于没报；多种子 + 标准差 + 显著性检验缺一不可。
- 算力预算务必乘安全系数，预实验几乎总会发现需要追加的实验。
- 可复现性是审稿硬指标，硬件/软件/种子/协议任一缺失都会被质疑。

## 互见

- `first-principles-thinking`：在假设明确化阶段，用第一性原理拆解研究问题与核心假设。
- `fact-checking`：核对 baseline 数值、SOTA 声明与引用是否与原论文一致。

---
本条采编自 voidful/academic-skills（MIT）。
