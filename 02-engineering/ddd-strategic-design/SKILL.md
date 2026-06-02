---
name: ddd-strategic-design
title: DDD 战略设计与限界上下文
description: 当为复杂业务域划分边界、拆分单体或对齐团队归属时使用；做子域分类、限界上下文目录、统一语言词汇表与边界决策（ADR）等战略设计产物；不适用于已稳定且边界清晰的模型、纯战术编码、或纯基础设施/UI 任务；触发词：限界上下文、子域划分、统一语言
domain: 研发/architecture
triggers: [限界上下文, 子域划分, 统一语言, 战略设计, 领域边界拆分, 团队归属对齐, bounded context, ubiquitous language]
tags: [ddd, 战略设计, 限界上下文, 统一语言, 领域建模, 架构]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：

- 划分核心域、支撑域、通用域（core / supporting / generic subdomain）。
- 按领域边界拆分单体或服务版图。
- 让团队与所有权对齐到限界上下文（bounded context）。
- 与领域专家共建统一语言（ubiquitous language）。

不该用（负边界）：

- 领域模型已稳定且边界清晰，无需重新划分。
- 只需要战术层代码模式（实体/值对象/聚合等编码实现）。
- 任务纯属基础设施或 UI，不涉及领域边界。

注意：本技能产出的是设计制品而非可执行代码，应在它之后再做战术设计与落地。

## 步骤

1. 提取领域能力（domain capabilities），并对子域分类（核心/支撑/通用）。
2. 围绕一致性边界与所有权定义限界上下文。
3. 建立统一语言词汇表，并列出禁用的歧义词（anti-terms）。
4. 在实现前用 ADR 固化上下文边界与决策理由。

如需详细模板，参考源仓库的 `references/strategic-design-template.md`（结构见下方示例）。

## 指令

必须产出的四类制品（Required artifacts）：

- 子域分类表（Subdomain classification table）。
- 限界上下文目录（Bounded context catalog）。
- 含规范术语的词汇表（Glossary with canonical terms）。
- 带理由的边界决策（Boundary decisions with rationale，以 ADR 形式记录）。

一句话调用示例：用本技能把电商域映射为若干限界上下文，对子域分类，并提出团队归属方案。

## 示例

子域分类（Subdomain classification）：

| 能力 Capability | 子域类型 | 理由 Why | 归属团队 Owner |
| --- | --- | --- | --- |
| 定价 Pricing | 核心 Core | 形成业务差异化价值 | Commerce |
| 身份 Identity | 支撑 Supporting | 必需但不构成差异化 | Platform |

限界上下文目录（Bounded context catalog）：

| 上下文 Context | 职责 Responsibility | 上游依赖 Upstream | 下游消费者 Downstream |
| --- | --- | --- | --- |
| Catalog | 商品数据生命周期 | 供应商数据 | Checkout、Search |
| Checkout | 下单与支付授权 | Catalog、Pricing | Fulfillment、Billing |

统一语言（Ubiquitous language）：

| 术语 Term | 定义 Definition | 所属上下文 Context |
| --- | --- | --- |
| Order | 已确认的购买请求 | Checkout |
| Reservation | 临时库存占用 | Fulfillment |

## 注意事项

- 本技能不产出可执行代码，只产出设计制品。
- 没有干系人输入时无法臆断业务真相，统一语言必须与领域专家共建。
- 完成后应衔接战术设计再进入实现阶段。
- 同一术语在不同上下文可有不同含义，词汇表须标注所属上下文，避免跨上下文复用歧义词。

## 互见

- 战术设计（实体/值对象/聚合/领域事件）：作为本技能的后续落地步骤。
- ADR（架构决策记录）：用于固化限界上下文边界与拆分理由。

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
