---
name: chief-ai-officer-advisor
title: 首席 AI 官顾问（自研对外采决策）
description: 当创业团队需做 AI 战略决策时使用；做模型自研/微调/调 API 选型、监管风险分级、自托管成本拐点测算与 AI 团队招聘排序，产出含三年 TCO 与所需管控清单的可执行建议；不适用于 RAG、Agent、提示工程、评测设施等战术工程实现。触发词：CAIO、模型选型、EU AI Act、微调、自托管拐点
domain: 智能/model-ops
triggers: [要不要调 API 还是自己微调模型, 这个 AI 用例属于高风险吗, 什么时候自托管比调 API 划算, 下一个该招什么 AI 岗位, CAIO/首席 AI 官, EU AI Act 风险分级, 微调还是买现成模型 build vs buy, AI 治理与模型风险, API 转自托管的成本拐点, NIST AI RMF / 模型卡 / 评测集]
tags: [智能, model-ops, ai战略, build-vs-buy, eu-ai-act, ai治理, 成本经济学, 团队组织, caio, c-level]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [model_buildvsbuy_calculator.py, ai_risk_classifier.py, ai_cost_economics.py]
requires: []
related: [mlops-model-productionizer, llm-model-router, claude-api, chief-data-officer-advisor]
combines_with: [production-llm-app-builder, ai-engineering-toolkit, local-llm-inference]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
采编自 alirezarezvani/claude-skills（MIT）。本条聚焦战略层四决策，不堆 AI 噱头。

## 何时使用

面向创业公司的 CAIO，或没有 CAIO、需亲自拍板 AI 方向的创始人。当你要回答以下任一问题时使用：

1. 某用例该用 API、微调小模型，还是自研预训练？（带三年 TCO 的 build-vs-buy）
2. 这个 AI 用例在 EU AI Act / 美国州法下是否触发高风险义务，如何治理？
3. 何时从 API 切换到自托管推理，代价多少？（按 token 算盈亏平衡）
4. 下一个该招哪个 AI 岗位？（AI 工程师 ≠ ML 工程师 ≠ 研究科学家）

不该用的边界：本条只管战略选择，不覆盖战术工程实现。RAG 落地、Agent 设计、提示工程、评测设施、模型部署、推理成本调优，请转对应工程类技能（rag-architect / agent-designer / prompt-governance / self-eval / llm-cost-optimizer），不要在此重复。

## 步骤

四类决策各有脚本与编排，按需选用。

决策 A 模型自研对外采（约 1 小时）：定义 use_case.json（量级、延迟、准确率、团队规模、预算）→ 跑 calculator → 复核三年 TCO 与盈亏平衡 → 与 CFO 顾问对预算承诺、与 CTO 顾问对工程产能（微调尤甚）→ 用 /cs:decide 记录，多年厂商承诺考虑 /cs:freeze 60。

决策 B 监管风险分级（约 2–4 小时）：定义 use_case.json（影响的决策、用户、地域、行业）→ 跑 classifier → 高风险则预算合规评估与登记，有限风险则落地透明度义务 → 与法务顾问对合同影响、与 CISO 顾问对技术防护 → /cs:decide 记录。

决策 C API 转自托管拐点（约 1 天）：构建 workload.json（每日 token、模型规模、延迟、质量容忍度）→ 跑 economics → 跑低/中/高 GPU 单价敏感性 → 估迁移成本（工程工时＋风险）→ 与 CFO 对资本开支、与 CTO 对平台就绪度 → /cs:decide，签 GPU 承诺时配 /cs:freeze。

决策 D AI 团队路线图（约 1 周）：列出 12 个月内产品需要的前 5 项 AI 能力 → 每项映射到能交付它的岗位 → 一次招一个角色、磨合到位再招下一个 → 与 CHRO 对薪酬与职级 → 找出「集中 vs 嵌入」的切换触发点。

## 指令

```bash
# 决策 A：API vs 微调 vs 自研
python scripts/model_buildvsbuy_calculator.py                 # 内置客服样例
python scripts/model_buildvsbuy_calculator.py path/to/use_case.json

# 决策 B：EU AI Act ＋ 美国州法风险分级
python scripts/ai_risk_classifier.py                          # 内置招聘 AI 样例
python scripts/ai_risk_classifier.py path/to/use_case.json

# 决策 C：API vs 自托管经济性
python scripts/ai_cost_economics.py                           # 内置 5M tokens/天样例
python scripts/ai_cost_economics.py path/to/workload.json
```

先问这几个关键问题（缺答案别动手）：这个 AI 要擅长什么、怎么度量？（没有评测集就别上线。）幻觉/错误率的 SLO 是多少？（没有 SLO，「AI 质量」只是感觉。）模型出错会怎样？（兜底行为、人工介入、爆炸半径。）EU AI Act 下属哪一档、是否需合规评估？（决定上市时间线。）月 token 量到多少自托管才赢 API？（前沿质量下，几乎不可能低于 1 亿 token/月。）招的是 AI 工程师还是 ML 研究科学家？（两码事，创始人常混。）

四档要点。
- 模型选型：默认走前沿模型 API（前沿被良好覆盖、QPS<100、延迟预算>1s、成本<5 万美元/月）；当 API 提示不进去的领域行为、高量降本、延迟<500ms、严格风格一致时微调小模型（LoRA/QLoRA 常用，对齐重要用 RLHF/DPO）；自研预训练几乎用不上（除非你是基础模型公司，或有独特语料、5000 万美元以上资金与 18 个月以上耐心）。微调模型通常 6–12 个月内落后前沿，且持续重训成本。
- 风险分级（EU AI Act，2026 年生效）：禁止类（社会评分、实时生物识别监控、操纵性 AI）不得在欧盟部署；高风险类（就业筛选、信用评分、教育准入、关键基础设施、执法、生物识别 ID）需合规评估、登记、上市后监测、透明度、人工监督；有限风险类（聊天机器人、深度伪造、情绪识别）需告知用户在与 AI 交互；最小风险类（推荐系统、垃圾过滤、多数 B2B SaaS 内部）无特定义务。美国州法拼图：NYC LL 144（AEDT 年度偏见审计＋告知）、Colorado SB 21-169、Illinois HB 53、California SB 1001、Texas TCPA、联邦 NIST AI RMF（自愿，合同中渐被引用）。行业叠加：医疗（FDA AI/ML 指南、MDR、510(k)）、金融（NYDFS Reg 23、FTC Section 5、ECOA）、保险（NAIC、各州保险委规则）。
- 成本经济学：API 成本按 token 变动（2026 前沿：Claude Sonnet 4.6 约 \$3/\$15、GPT-4o 约 \$2.5/\$10、Gemini 2.5 约 \$1.25/\$5 每百万 token 输入/输出）；自托管为固定 GPU 承诺＋电费（H100 现货约 \$2–5/小时、A100 约 \$1–3/小时；Llama 3.1 70B / Qwen 2.5 72B 在 70% 利用率下约 \$0.5–2.0 每百万输出 token）。隐性成本：自托管有 on-call、监控、模型更新、扩缩容、空转损耗；API 有限流、厂商锁定、版本能力漂移、数据驻留。典型盈亏平衡（前沿质量）：1 亿–5 亿 token/月，以下 API 赢，以上跑计算器。
- 团队演进（按阶段）：Pre-PMF 创始人＋1 名玩提示的 ML 好奇工程师；A 轮先招 AI 工程师（应用全栈，管提示/评测/部署）再招第二位做评测质量；B 轮招 AI/ML 平台工程师，第三位 AI 工程师做生产可靠性，模型是核心 IP 才招数据科学家；C 轮设 AI 经理，模型即产品才招 ML 研究科学家，面向客户的 AI 配安全/红队；后期 Head of AI → CAIO。关键区分：AI 工程师（全栈＋提示＋评测＋部署，多数创业公司只需这个）≠ ML 工程师（生产部署、监控、重训设施，在数据工程师之后招）≠ 研究科学家（模型发明、新架构，C 轮以上且模型是核心 IP 才招）。AI 默认集中（一支团队），比数据团队集中更久，仅当部署到 4 个以上产品面才嵌入。

## 示例

输出统一格式：

```
结论一句话：[决策与理由]
本次决策：[模型选型 | 风险分级 | 经济性 | 下一个招聘]
依据：[来自工具的数字，而非形容词]
如何行动：[3 个具体下一步]
你来拍板：[只有创始人能下的判断]
```

例：客服用例月 8000 万 token、延迟预算 1.2s、无领域特殊行为。跑 model_buildvsbuy_calculator.py 得三年 TCO 显示 API 仍最优 → 结论「继续用前沿 API，量级未到微调盈亏平衡」；依据「8000 万 < 1 亿 token/月拐点，微调三年 TCO 高 40%」；如何行动「锁定主用前沿 API＋多厂商兜底、建评测集与幻觉 SLO、季度复跑拐点」；你来拍板「是否接受版本能力漂移换取免运维」。

## 注意事项

- 没有评测集和幻觉/错误率 SLO 之前，不要上线，也无法谈「AI 质量」。
- build-vs-buy 不是「用不用 AI」，而是逐用例的「API vs 微调 vs 自研」，三条路 TCO 曲线、延迟画像、能力上限各异。
- 自托管盈亏平衡几乎不会低于 1 亿 token/月（前沿质量下）；低于此 API 几乎总赢，别被「自托管更便宜」直觉误导。
- EU AI Act 风险档位直接决定上市时间线，高风险用例须把合规评估与登记排进预算与日程。
- AI 监管 2026 年仍在快速演变；本条呈现的是当下的决策与权衡，不能替代合格的 AI 法律顾问做有约束力的合规判断（尤其 EU AI Act 合规评估）。

## 互见

- 首席数据官顾问 — 训练数据权利、数据产品策略，直接衔接模型决策
- CTO 顾问 — 架构产能、扩容悬崖（自托管推理尤甚）
- CISO 顾问 — AI 威胁建模（提示注入、越狱、训练数据投毒）
- 法务总顾问 — AI 合同（厂商责任、输出归属、训练数据授权）
- CFO 顾问 — build-vs-buy 的 TCO 数学、多年厂商承诺
- CHRO 顾问 — AI 团队招聘与薪酬
- 工程类（战术，本条不覆盖）：rag-architect、agent-designer、prompt-governance、self-eval、llm-cost-optimizer

参考文档（源技能 references/）：model_buildvsbuy_strategy.md（完整决策树＋三年 TCO 构成＋各路径失败条件）、ai_risk_governance.md（EU AI Act＋NIST AI RMF＋美国州法＋行业叠加＋治理方案清单）、ai_cost_economics.md（2026 API 定价＋GPU 租用经济学＋利用率现实＋迁移成本）、ai_team_org_evolution.md（阶段-岗位映射＋角色定义＋反模式）。

采编自 alirezarezvani/claude-skills（MIT 许可）。
