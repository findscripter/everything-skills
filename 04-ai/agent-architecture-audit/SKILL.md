---
name: agent-architecture-audit
title: Agent 全栈架构诊断（12 层栈审计）
description: 当 Agent/LLM 应用上线前自检，或出现"包装层加上后变差、模型在 playground 正常但在 Agent 里崩、调试超 15 分钟找不到根因"时使用；做按 12 层栈定位包装层回归、记忆污染、工具纪律失效、隐藏修复循环与渲染破坏，产出按严重度排序的发现 + 代码优先修复计划 + 结构化 JSON 报告；不适用于通用代码调试、代码评审、安全扫描或性能基准。触发词：包装层回归、记忆污染、工具纪律、隐藏修复循环、渲染破坏
domain: 智能/eval
triggers: [Agent 架构诊断, 12 层栈审计, 包装层回归 wrapper regression, 记忆污染 memory poisoning, 工具纪律失效, 工具执行幻觉, 隐藏修复/重试循环, 渲染/传输破坏, playground 正常但 Agent 里崩, Agent 上线前审计, 上下文重复, 工具被跳过调用, 代码优先修复计划]
tags: [智能, eval, agent, 架构审计, 12层栈, 包装层回归, 记忆污染, 工具纪律, 隐藏修复循环, 渲染破坏, 诊断]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Write, Edit, Bash, Grep, Glob]
requires: []
related: [ai-engineering-toolkit, agent-tool-design, agent-memory-architecture, skill-optimizer]
combines_with: [langfuse-llm-observability, llm-agent-benchmarking, coding-agent-headtohead-eval]
license: MIT
source: affaan-m/everything-claude-code
source_license: MIT
---
## 何时使用

适用（必须自检的时机）：
- Agent / LLM 驱动的应用**上线前**，尤其是涉及工具调用、记忆、多步工作流的功能发布前。
- 加上包装层（新 Prompt 层、工具定义、记忆系统）后，**既有行为变差**。
- 用户报告"Agent 变笨了""工具不稳"；同一模型在 playground / 直连 API 正常，但**包在 Agent 里就崩**。
- 调试 Agent 行为已超 15 分钟仍找不到根因；不同 Agent 行为不一致；昨天好好的今天开始幻觉；怀疑有**静默改写响应的隐藏修复/重试循环**。

不该用（转其他技能）：
- 通用代码调试（循环、超时、状态错误）→ `agent-introspection-debugging`。
- 代码评审 → 语言专属评审技能；安全扫描 → `ai-system-security-audit` / `ai-ml-security-assessor`。
- Agent 能力跑分 / 回归门禁 → `llm-agent-benchmarking`；输出质量打分 → `llm-judge-evaluation`。
- 新建功能 → 对应工作流技能。

核心判断：失败往往**不在基座模型**，而藏在包装层、过期记忆、重试循环、传输/渲染变异背后。本技能就是把这些藏起来的失败逐层挖出来。

## 步骤

四阶段审计流程：

**阶段 1 · 定范围** —— 先答清：目标系统是哪个 Agent 应用？入口（用户怎么交互）？模型栈（哪些 LLM/供应商）？症状（用户报告什么）？时间窗（何时开始）？要审 12 层中的哪几层。

**阶段 2 · 收证据** —— 从代码库收集：源码（Agent 主循环、工具路由、记忆准入、Prompt 装配）、日志（历史会话 trace、工具调用记录）、配置（Prompt 模板、工具 schema、供应商设置）、记忆文件（SOP、知识库、会话归档）。用 `rg` 扫反模式（见「指令」）。

**阶段 3 · 映射故障** —— 每条发现都记录：症状（用户看到什么）/ 机制（包装层如何引发）/ 来源层（12 层之一）/ 根因（最深层原因）/ 证据（`file:line` 或 `log:line`）/ 置信度（0.0–1.0）。

**阶段 4 · 修复策略（代码优先，绝不 Prompt 优先）** —— 默认修复顺序：
1. 工具要求**代码门禁化**（不止 Prompt 文本，靠代码强制）。
2. 删除或收窄隐藏修复 Agent，把 fallback 写进显式契约。
3. 削减上下文重复（Prompt/历史/记忆/蒸馏间同一信息）。
4. 收紧记忆准入：**用户修正 > Agent 断言**。
5. 收紧蒸馏触发：不该压缩的别压缩。
6. 减少渲染变异：透传，不变换。
7. 内部流转为**带类型的 JSON 信封**，而非自由散文。

## 指令

**12 层栈**（每层都可能毁掉答案）：1 系统 Prompt（指令矛盾/膨胀）；2 会话历史（上一轮陈旧上下文注入）；3 长期记忆（跨会话污染）；4 蒸馏（压缩产物被当伪事实回灌）；5 主动召回（冗余复述层浪费上下文）；6 工具选择（路由错/该用的工具被跳过）；7 工具执行（**幻觉执行**——声称调用了实际没调）；8 工具解释（误读/无视工具输出）；9 答案整形（最终响应格式破损）；10 平台渲染（UI/API/CLI 变异有效答案）；11 **隐藏修复循环**（静默 fallback/重试跑了第二趟 LLM）；12 持久化（过期状态/缓存产物被当实时证据复用）。

**`rg` 反模式扫描**（保留源命令）：
```bash
# 工具要求仅写在 Prompt 文本里（未进代码）
rg "must.*tool|必须.*工具|required.*call" --type md
# 无校验的工具执行
rg "tool_call|toolCall|tool_use" --type py --type ts
# 主循环外的隐藏 LLM 调用
rg "completion|chat\.create|messages\.create|llm\.invoke"
# 无"用户修正优先"的记忆准入
rg "memory.*admit|long.*term.*update|persist.*memory" --type py --type ts
# 跑额外 LLM 调用的 fallback 循环
rg "fallback|retry.*llm|repair.*prompt|re-?prompt" --type py --type ts
# 静默输出变异
rg "mutate|rewrite.*response|transform.*output|shap" --type py --type ts
```

**严重度模型**：`critical`（Agent 会自信地产生错误操作行为）→ 下次发布前必修；`high`（频繁降低准确性/稳定性）→ 本迭代修；`medium`（准确性通常保住但输出脆弱/浪费）→ 下周期规划；`low`（主要是观感/可维护性）→ backlog。

**输出顺序**：① 按严重度排序的发现（最重要在前）；② 架构诊断（哪层破坏了什么、为什么）；③ 优先级修复计划（代码优先）。**禁止以恭维或摘要开头**；系统坏了就直说坏在哪。

## 示例

**快速诊断 7 问**（命中即指向对应故障）：

| # | 问题 | Yes ⇒ |
|---|---|---|
| 1 | 模型能跳过必需工具直接回答吗？ | 工具未代码门禁 |
| 2 | 旧会话内容出现在新一轮里吗？ | 记忆污染 |
| 3 | 同一信息同时在系统 Prompt + 记忆 + 历史里吗？ | 上下文重复 |
| 4 | 平台在投递前跑了第二趟 LLM 吗？ | 隐藏修复循环 |
| 5 | 内部生成与用户投递的输出不一致吗？ | 渲染破坏 |
| 6 | "必须用工具 X"规则只写在 Prompt 文本里吗？ | 工具纪律失效 |
| 7 | Agent 自己的独白会变成持久记忆吗？ | 记忆投毒 |

**结构化报告 JSON**（审计产物固定形状）：
```json
{
  "schema_version": "ecc.agent-architecture-audit.report.v1",
  "executive_verdict": {
    "overall_health": "high_risk",
    "primary_failure_mode": "string",
    "most_urgent_fix": "string"
  },
  "scope": { "target_name": "string", "model_stack": ["string"], "layers_to_audit": ["string"] },
  "findings": [{
    "severity": "critical|high|medium|low",
    "title": "string", "mechanism": "string", "source_layer": "string",
    "root_cause": "string", "evidence_refs": ["file:line"],
    "confidence": 0.0, "recommended_fix": "string"
  }],
  "ordered_fix_plan": [
    { "order": 1, "goal": "string", "why_now": "string", "expected_effect": "string" }
  ]
}
```

## 注意事项

要避免的反模式：
- 在排除包装层回归之前就先怪基座模型。
- 不给出污染路径就怪记忆。
- 允许"当前状态干净"抹掉"过去出过脏输出"这一事实。
- 把 Markdown 散文当成可信的内部协议。
- 代码并未强制，却接受 Prompt 文本里的"必须用工具"承诺。
- 发现要保持直接、基于证据、按严重度排序——不要稀释。

本技能产出的诊断与修复建议**不替代**环境验证、测试与专家复核；修复后须按基线重测（可转 `llm-agent-benchmarking` 做回归门禁）。

## 互见

- requires：无前置硬依赖；但具备基本 Agent 架构与工具调用机制概念后效果更佳。
- related：`agent-introspection-debugging`（运行时故障调试，与本技能互补）、`ai-system-security-audit` / `ai-ml-security-assessor`（安全维度审计）、`langfuse-llm-observability`（用可观测数据喂证据收集阶段）。
- combines_with：`llm-agent-benchmarking`（修复后做统计化回归门禁）、`llm-judge-evaluation`（对修复前后输出质量打分对比）、`multi-agent-system-designer` / `production-llm-app-builder`（在设计/生产阶段把审计结论落回架构）。

---
采编自 affaan-m/everything-claude-code（MIT），原条目 agent-architecture-audit / origin oh-my-agent-check。
