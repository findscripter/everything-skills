---
name: prompt-governance-policy
title: 提示词治理与合规
description: 当需要在生产环境大规模管理提示词时使用——做提示词注册表、评测流水线、版本化与受治理迭代（A/B、灰度、回滚），产出治理流程与产物；不适用于编写/优化单条提示词（用 prompt-template-designer / llm-prompt-optimizer）或 RAG 检索设计；触发词：提示词版本管理、prompt registry、提示词回归、提示词 A/B、eval 流水线、生产提示词治理
domain: 智能/prompting
triggers: [提示词版本管理, prompt registry, 提示词注册表, 提示词回归, 提示词 A/B 测试, eval 流水线, golden dataset, 提示词回滚, 生产提示词治理, prompt governance]
tags: [prompting, llmops, governance, evaluation, ab-testing]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [prompt-template-designer, llm-prompt-optimizer, llm-judge-evaluation, langfuse-llm-observability]
combines_with: [ai-engineering-toolkit, llm-prompt-caching]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

当提示词已进入**生产环境并需要规模化管理**时使用：把提示词当作一等基础设施——版本化、可评测、可灰度、可回滚，与应用代码同等严谨。核心痛点是「改了一句提示词，线上质量悄悄退化，等用户报障才发现」。

**该用**：提示词散落在代码/配置/数据库需统一收口；要在上线前自动拦截质量回归；要对提示词做真实用户 A/B；要把「分支→评测→评审→晋级→回滚」固化成团队流程。

**不该用**：
- 编写/打磨**单条**提示词（角色/约束/few-shot 设计）→ 用 `prompt-template-designer`，效果调优用 `llm-prompt-optimizer`。
- 设计 RAG 检索管线 → 用 `rag-pipeline-builder`（本技能只治理其系统/检索提示词）。
- 纯粹降低 LLM 调用成本 → 用 `cost-aware-llm-pipeline`（评测可作为换便宜模型的质量护栏）。

先读 `project-context.md`（若存在）：拉取 AI 技术栈、部署方式、现有提示词管理现状，再一次性补问三组上下文：①现状（提示词存哪、有多少条、是否出过未察觉的回归）；②目标（主要痛点、所有权模型、工具约束）；③AI 栈（LLM 供应商、框架、CI 现状）。

## 步骤 / 指令

按当前成熟度选模式，三者可叠加推进：

```
模式1 注册表（无集中管理）→ 建版本化、环境晋级、审计追溯
模式2 评测流水线（有存储无质量门）→ 建 golden dataset + eval，回归在上线前拦截
模式3 受治理迭代（注册表+评测齐备）→ 串成全生命周期带门禁与回滚
```

模式1 · 提示词注册表（小团队用文件版，纳入版本控制）：
```
prompts/
  registry.yaml          # 全量提示词索引
  summarizer/v1.1.0.md   # 提示词正文，按语义化版本命名
  classifier/v1.0.0.md
```
`registry.yaml` 每条记录：`id / description / owner / model / versions[]`，每个版本含 `version / file / status(production|archived) / promoted_at / promoted_by`。大团队改用数据库版（API 可访问，表 `prompts` 与 `prompt_versions` 记录 slug、content、model、environment、eval_score 及晋级元数据）。

模式2 · 评测流水线（核心：每次改动像跑单测一样自动评测）：
- 选评测类型（按任务）：精确匹配（分类/抽取/结构化）｜包含校验（要点/摘要）｜LLM-as-judge 1~5 分（开放生成/语气）｜语义相似度（容忍改写）｜Schema 校验（结构化输出）｜人工 1~5 分（高风险/上线门）。
- 建 golden dataset：≥20 条起步、生产置信 100+；**覆盖边界与失败模式**而非仅 happy path；须领域专家评审通过（不能只由写提示词的人定）；与提示词同版本管理。
- 写 eval runner：遍历 golden set → 用待测版本调 LLM → 逐条对照期望打分 → 汇总 `pass_rate / avg_score / 失败明细`。
- 通过阈值（按用例校准）：分类/抽取 ≥95% 精确匹配；摘要 ≥0.85 LLM-judge；结构化输出 100% schema 校验；开放生成 ≥80% 人工通过。

模式3 · 受治理迭代生命周期（每阶段设门禁）：
```
1 BRANCH   为提示词改动开分支
2 DEVELOP  dev 环境编辑 + 手测
3 EVAL     CI 跑评测 vs golden dataset
4 COMPARE  新版 eval 分 vs 现网生产分
5 REVIEW   PR 评审：eval 结果 + 提示词 diff
6 PROMOTE  staging→prod，带审批门
7 MONITOR  上线后盯 24~48h 生产指标
8 ROLLBACK 一键回滚到上一版
```

## 示例

`registry.yaml` 片段：
```yaml
prompts:
  - id: summarizer
    description: "Summarize support tickets for agent triage"
    owner: platform-team
    model: claude-sonnet-4-5
    versions:
      - version: 1.1.0
        file: summarizer/v1.1.0.md
        status: production
        promoted_at: 2026-03-15
        promoted_by: eng@company.com
      - version: 1.0.0
        file: summarizer/v1.0.0.md
        status: archived
```

A/B 测试提示词（要量真实用户影响而非仅 eval 分）必守的硬规则：
- 稳定分桶：同一 `user_id` 哈希始终落同一变体；每次分配记 `user_id / prompt_slug / variant` 以便复盘。
- **先定成功指标再开测**（事后选指标会引入偏差）。
- 至少跑 1 周或每变体 ≥1000 请求；警惕首日新鲜度效应；`p<0.05` 才宣告赢家；同时盯延迟与成本。

一键回滚：把上一版本在注册表里重置回 `production`，随后对恢复版本重跑 evals 验证。

## 注意事项

主动上报这些隐患（无需等人问）：
- **提示词硬编码在应用代码里** → 改提示词要发版，拖慢迭代且耦合关注点，立即标红。
- **生产提示词无 golden dataset** → 在盲飞，任何改动都可能静默回归。
- **eval 通过率随时间下滑** → 模型更新会悄悄打破提示词，定时评测先于用户发现。
- **无回滚能力** → 坏提示词上线后只能等紧急发版救场，必须永远留一键回滚。
- **提示词知识由一人独占** → 巴士因子=1，注册表+文档让知识沉淀。
- **跳过评测就上线** → 每次未评测发布都是赌注，团队说「就这一次」时也要拦。

输出纪律（所有产出遵循）：结论先行（先给风险/建议再解释）；每条发现含 What+Why+How；动作必须有 owner 和 deadline，杜绝「团队应考虑…」；标注置信度（已验证/中等/假设）。

跨模型不保证可移植：换模型/模型版本须重跑评测；golden dataset 每季度复盘，把生产失败案例补成新边界例，避免 golden set 与真实用法漂移。

## 互见

- requires：`prompt-template-designer` —— 治理的前提是先有可版本化的稳定提示词模板；本技能管「生产化运营」，模板设计在它。
- related：`llm-prompt-optimizer`、`llm-judge-evaluation`、`langfuse-llm-observability` —— 分别负责单条效果调优、LLM-as-judge 评分、线上质量可观测，是评测与监控环节的实现支撑。
- combines_with：`ci-cd-pipeline-builder` —— 把 eval 自动跑进 CI 门禁；`claude-api` —— eval runner 与生产调用的落地；`cost-aware-llm-pipeline` —— 路由到便宜模型时用评测当质量护栏；`rag-pipeline-builder` —— 对 RAG 系统提示词/检索提示词分别治理。

---
采编自 alirezarezvani/claude-skills（MIT；原条目由 chad848 贡献），适配重写为中文。
