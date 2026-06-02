---
name: llm-judge-evaluation
title: LLM-as-Judge 高级评测
description: 当需要用 LLM 自动评测模型输出（评分、择优、建评分量规、做 A/B）时使用；做出含偏差缓解、置信度校准、量规生成的可落地评测流程与结构化打分产物；不适用于纯人工评测或无判别标准的开放生成。触发词：LLM-as-judge、成对比较、位置偏差、评分量规、评测流水线
domain: 智能/eval
triggers: [实现 LLM-as-judge, 比较模型输出/择优, 创建评分量规 rubric, 缓解评测偏差, 直接评分 direct scoring, 成对比较 pairwise, 位置偏差 position bias, 搭建评测流水线, 自动质量评估, 评测结果不一致排查, Prompt/模型 A/B 测试]
tags: [评测, LLM-as-judge, 成对比较, 评分量规, 偏差缓解, 置信度校准, Eval, 智能体]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Write, Edit, Bash]
requires: []
related: [llm-agent-benchmarking, ai-engineering-toolkit, langfuse-llm-observability, llm-prompt-optimizer]
combines_with: [production-llm-app-builder, rag-implementation-workflow, llm-conversation-memory]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 搭建对 LLM 输出的自动化评测流水线。
- 比较多个模型/Prompt 的响应并择优；做 Prompt 或模型变更的 A/B 测试。
- 统一评测团队的质量标准、生成评分量规（rubric）。
- 排查"评测结果忽高忽低/不一致"的问题，分析自动评测与人工评判的相关性。

不该用（负边界）：
- 任务有确定唯一答案、可用精确匹配/单元测试直接判定时——别用 LLM judge。
- 纯主观且无任何可判别标准的开放创作，评测无意义。
- 高风险终判完全替代人工：LLM judge 是辅助，不替代环境验证、测试与专家复核。
- 缺少必要输入（评测标准、量纲、成功判据）时，先停下来澄清。

核心判断：LLM-as-Judge 不是单一技法，而是一族方法。选对方法 + 主动缓解已知偏差，是这里的核心能力。

## 步骤

1. 选评测范式（决策树）：
   - 是否存在客观 ground truth？→ 是：用**直接评分**（事实准确性、指令遵循、格式合规）。
   - 否，是偏好/质量判断？→ 是：用**成对比较**（语气、风格、说服力、创意）。
   - 否，有参考答案？→ 用**基于参考**的评测（摘要对照原文、翻译对照参考）。
2. 定义标准：一个标准只测一个可观测维度（name / description / weight 0-1）。客观与主观标准分开。
3. 选量纲并配量规：1-3（最低认知负荷）/ 1-5（标准 Likert，推荐）/ 1-10（仅在有详细分级描述时用）。
4. 写评测 Prompt：**强制先给证据/理由，再给分**（CoT，可提升可靠性 15-25%）；输出结构化 JSON。
5. 缓解偏差：成对比较必须**交换位置二次评测**并做一致性检查。
6. 校准置信度：与位置一致性、证据强度挂钩。
7. 验证与监控：对照人工判断算相关性；按标准/响应类型/模型追踪系统性分歧。

## 指令

- 永远要求"先证据后分数"，禁止无理由打分。
- 成对比较永远交换位置，禁止单遍比较（会被位置偏差污染）。
- 量纲粒度匹配量规细度：没有详细分级描述就别上 1-10。
- 客观标准用直接评分，主观标准用成对比较，二者分开。
- 必须输出置信度，并按位置一致性/证据强度校准。
- 显式定义边界情形（edge cases）——歧义场景是评测方差的最大来源。
- 用领域专属术语写量规（代码可读性谈变量/函数/注释；医疗准确性谈临床术语/证据标准）。
- 一个标准 = 一个可测维度，禁止"超载标准"。

要主动缓解的系统性偏差：
- **位置偏差**：成对比较中前置响应受偏爱 → 换位二评 + 多数票/一致性检查。
- **长度偏差**：长答被高估 → 显式提示忽略长度、长度归一化。
- **自我增强偏差**：模型偏爱自身输出 → 生成与评测用不同模型。
- **冗长偏差**：无谓细节被高估 → 量规惩罚无关细节。
- **权威偏差**：自信口吻被高估 → 要求引用证据 + 事实核查层。

指标选择：二分类用 Recall/Precision/F1（辅 Cohen's κ）；序数量表用 Spearman's ρ/Kendall's τ（辅加权 κ）；成对偏好用一致率/位置一致性（辅置信度校准）；多标签用 Macro/Micro-F1。关键：系统性分歧比绝对一致率更值得关注——对特定标准持续与人工相左的 judge，比随机噪声更危险。

## 示例

直接评分 Prompt（骨架）：
```
你是评估响应质量的专家评测者。
## 原始 Prompt
{prompt}
## 待评响应
{response}
## 评测标准
{逐条：name, description, weight}
## 指令
对每条标准：1) 在响应中找具体证据；2) 按量规打分（1-{max}）；
3) 用证据论证分数；4) 给出一条具体改进建议。
## 输出格式
结构化 JSON：scores、justifications、summary。
```

成对比较的**位置偏差缓解协议**：
1. 第一遍：A 在前、B 在后。
2. 第二遍：B 在前、A 在后。
3. 一致性检查：两遍结论不一致 → 返回 TIE 并降低置信度。
4. 终判：一致的胜者 + 取平均的置信度。置信度规则：两遍一致 → 取个体置信度均值；不一致 → confidence=0.5，verdict=TIE。

成对比较示例（含换位映射）：
```
第一遍(A在前): {"winner":"B","confidence":0.8}
第二遍(B在前): {"winner":"A","confidence":0.6}  // A 因为 B 在首位而"赢"
映射回第二遍: {"winner":"B","confidence":0.6}
终判: {"winner":"B","confidence":0.7,
       "positionConsistency":{"consistent":true,
       "firstPassWinner":"B","secondPassWinner":"B"}}
```

量规生成：良好量规相比开放式打分可降低评测方差 40-60%。组件 = 分级描述 + 可观测特征 + 示例(可选) + 边界情形 + 打分准则。严格度三档：宽松（鼓励迭代）/ 平衡（生产默认）/ 严格（安全关键、高风险）。

规模化：① 多模型评审团（PoLL）聚合投票降单模偏差；② 分层评测（廉价模型筛选 + 昂贵模型处理边界）；③ 人在环（低置信度转人工，形成反馈闭环）。

## 注意事项

反模式速查：
- 无理由打分 → 分数无依据、难调试。改为先证据后分。
- 单遍成对比较 → 位置偏差污染。改为换位 + 一致性检查。
- 超载标准 → 不可靠。一标准一维度。
- 缺边界情形指引 → 歧义处理不一致。量规内显式写明。
- 忽视置信度校准 → 高置信度的错判最危险。按位置一致性/证据强度校准。

其他：自动评测只有在与人工评判相关时才有价值；为迭代而设计，靠反馈闭环改进。本技能输出不替代环境验证、测试与专家复核。

## 互见

- context-fundamentals：评测 Prompt 需良好的上下文结构。
- tool-design：评测工具需规范 schema 与错误处理。
- context-optimization：评测 Prompt 可按 token 效率优化。
- evaluation（基础）：本技能扩展其基础评测概念。

外部研究：MT-Bench / Judging LLM-as-a-Judge (Zheng et al., 2023, arXiv:2306.05685)；G-Eval (Liu et al., 2023, arXiv:2303.16634)；Large Language Models are not Fair Evaluators (Wang et al., 2023, arXiv:2305.17926)；Eugene Yan: Evaluating the Effectiveness of LLM-Evaluators。

---
采编自 sickn33/antigravity-awesome-skills（原作者 Muratcan Koylan，MIT 许可）。
