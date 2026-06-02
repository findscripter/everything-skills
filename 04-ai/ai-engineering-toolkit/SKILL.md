---
name: ai-engineering-toolkit
title: AI 工程工作流工具箱
description: 当需要在上线前用结构化方法评估提示词、规划上下文预算、设计 RAG 架构、红队审计 Agent、搭建评测框架或推演产品判断时使用；做六套可复现的 AI 工程工作流（量化打分+清单+决策树），产出评分、优化建议与可写入 CI 的模板；不适用于直接生产代码、替代环境内真实测试，或无授权对线上系统做攻击；触发词：提示词评估、上下文预算、RAG 设计、Agent 安全审计、评测框架、产品判断
domain: 智能/eval
triggers: [提示词评估, 上下文预算, RAG 设计, Agent 安全审计, 评测框架, LLM-as-Judge, 产品判断, prompt evaluation, context budget, red team]
tags: [prompt-engineering, rag, evaluation, ai-engineering, llm, security]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [claude, cursor, gemini, copilot]
requires: []
related: [llm-judge-evaluation, llm-agent-benchmarking, llm-prompt-optimizer, production-llm-app-builder]
combines_with: [langfuse-llm-observability, rag-implementation-workflow, context-window-management]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
---
name: ai-engineering-toolkit
title: AI 工程工作流工具箱
description: 当需要在上线前用结构化方法评估提示词、规划上下文预算、设计 RAG 架构、红队审计 Agent、搭建评测框架或推演产品判断时使用；做六套可复现的 AI 工程工作流（量化打分+清单+决策树），产出评分、优化建议与可写入 CI 的模板；不适用于直接生产代码、替代环境内真实测试，或无授权对线上系统做攻击；触发词：提示词评估、上下文预算、RAG 设计、Agent 安全审计、评测框架、产品判断
domain: 智能/评测
triggers: [提示词评估, 上下文预算, RAG 设计, Agent 安全审计, 评测框架, LLM-as-Judge, 产品判断, prompt evaluation, context budget, red team]
tags: [prompt-engineering, rag, evaluation, ai-engineering, llm, security]
level: 精通
status: stable
version: 0.1.0
agents: [claude-code, codex, cursor, gemini-cli, copilot]
tools: [claude, cursor, gemini, copilot]
requires: []
related: [llm-prompt-optimizer, llm-judge-evaluation, context-window-management, rag-pipeline-builder, ai-system-security-audit]
combines_with: [prompt-template-designer, rag-pipeline-builder, ai-system-security-audit, llm-judge-evaluation]
license: CC-BY-4.0
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

把 AI 助手当成「资深 AI 工程伙伴」，用**可复现的方法论**而非临场发挥处理六类任务。每套工作流都给出量化打分/清单/决策树，**同样的输入，谁跑、何时跑，结论一致**——可作为团队基线写进 CI/CD。六套工作流：

1. **提示词评估器** —— 上线前评估/优化 LLM 系统提示词。
2. **上下文预算规划器** —— 规划上下文窗口各区 token 分配。
3. **RAG 架构师** —— 结构化决策检索管道（非只生成样板代码）。
4. **Agent 安全卫士** —— 上线前对 Agent 做红队审计（⚠️ 仅限授权场景）。
5. **评测框架搭建器** —— 为 LLM 应用设计评测指标体系。
6. **产品判断教练** —— 写代码前推演「该不该做」。

**不该用（边界）：**
- 要直接产出生产代码/具体实现 → 本工具箱只做分析与建议，落地交给对应实现类技能。
- 把输出当最终结论 → 必须再经环境内实测、专家复核；不替代特定环境的验证。
- 任务与上述范围不明确匹配 → 别硬套，先澄清。
- 缺少必要输入、权限、安全边界或成功标准 → **停下来问**，尤其安全审计。
- **无系统所有者书面授权** → 不得运行 Agent 安全卫士（详见注意事项）。

## 步骤 / 指令

按需选一套工作流，组合使用时推荐顺序：**RAG 设计 → 上下文优化 → 提示词打磨 → 安全审计 → 评测搭建**。

**① 提示词评估器**
- 按 8 维度各 1-10 打分：清晰度、具体度、完整度、简洁度、结构、接地（grounding）、安全、鲁棒性；加权汇总成 0-100。
- 找出**最弱 3 维** → 针对性重写 → 重新评估。
- 支持三模式：单条评估 / A·B 对比 / 批量评估。团队基线建议 ≥70/100。

**② 上下文预算规划器**
- 分析 token 在 5 个区的分布：System、Few-shot、用户输入、检索、输出。
- 对每个区给压缩策略决策树，产出优化分配方案。
- 常见坑：**输出区被挤到 <6%**，本工作流在被截断前就能抓出。

**③ RAG 架构师**——走完整决策树：
`文档格式 → 解析策略 → 分块（固定/语义/递归）→ embedding 选型 → 检索方式（向量/关键词/混合）→ 评估指标（Faithfulness、Relevancy、Context Precision）`。
覆盖 Naive / Advanced / Modular RAG 三种模式。

**④ Agent 安全卫士**（⚠️ 仅限授权，见注意事项）
- 5 类攻击共 **65 项**红队审计：直接提示注入、间接提示注入（经 RAG 文档）、信息提取（系统提示/API Key 泄露）、工具滥用（SQL 注入、路径遍历、命令注入）、目标劫持。
- 流程：构造对抗测试提示 → **每个测试阶段前向用户确认** → 判定通过/失败 → 给修复建议。
- 所有测试**封闭在评估上下文内，不与外部系统交互**；建议在沙箱（Docker/VM）运行。

**⑤ 评测框架搭建器**
- 设计 LLM 应用评测指标体系；含 **LLM-as-Judge** 打分框架。
- 内置偏差缓解：位置偏差、冗长偏差、自我增强偏差。
- 产出**可直接接入 CI/CD** 的评测管道模板。

**⑥ 产品判断教练**——5 阶段引导对话：
`挖动机 → 评市场机会 → 找路径 → 设计场景 → 分析竞争`。在写任何代码前回答「该不该做」。

## 示例

**示例 1：提示词评估**
> 请评估这条系统提示：`You are a customer support agent. Help users with their questions. Be nice and helpful.`

结果：总分 **28/100**。最弱维度——安全 1/10（零注入防护）、具体度 2/10（无输出格式）、结构 2/10（无分节）。自动重写后 **82/100**，补齐了范围边界、响应格式、升级规则与安全护栏。

**示例 2：安全审计**
> 请对我的客服 Agent 跑一次安全审计。

结果：执行 65 项测试，发现 3 个严重失败——Base64 编码指令绕过、经工具调用的路径遍历、经角色扮演的系统提示提取。每项均附修复建议。

## 注意事项

- **Agent 安全卫士属攻击性（offensive）能力**：会生成攻击载荷（提示注入、SQL 注入、命令注入），**仅限教学或经授权的安全评估**。使用前须取得系统所有者**明确书面许可**；滥用违法且严禁。每个测试阶段前必须取得用户确认，尽量在沙箱环境运行。
- 不含武器化载荷，所有对抗提示均为教学性质，封闭在评估上下文内，不触达外部系统。
- 六套工作流均为**只读分析与建议**：不改文件、不发网络请求。
- 别只看单一维度分——要看完整画像；别因为「只是内部工具」就跳过安全审计。
- 上下文预算尽早用，别等撞上截断才补救；提示词评估和安全审计当作**上线前的门禁**，而非事故后的补救。
- 输出不替代特定环境的验证、测试与专家复核。

## 互见

- **related**：`llm-prompt-optimizer` —— 提示词评估发现弱项后，交其做系统化优化迭代。
- **related**：`llm-judge-evaluation` —— 评测框架的 LLM-as-Judge 打分与偏差缓解可下钻到它。
- **related**：`context-window-management` —— 上下文预算规划落到具体窗口管理策略。
- **related**：`ai-system-security-audit` —— Agent 安全卫士的注入/越狱审计更专业的实施版。
- **combines_with**：`prompt-template-designer` —— 评估/重写出的提示词用其模板化沉淀。
- **combines_with**：`rag-pipeline-builder` —— RAG 架构师的决策落地为可运行检索管道。

---
采编自 [sickn33/antigravity-awesome-skills](https://github.com/sickn33/antigravity-awesome-skills)（原作者 viliawang-pm，MIT 许可）。
