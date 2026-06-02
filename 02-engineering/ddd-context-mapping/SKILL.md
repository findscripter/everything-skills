---
name: ddd-context-mapping
title: DDD 限界上下文映射与集成契约
description: 当需要梳理多个限界上下文的依赖关系与集成方式时使用；用 DDD 上下文映射模式产出关系图、契约归属矩阵与防腐层（ACL）决策；不适用于单上下文无集成、仅做内部类设计或选型基础设施。触发词：限界上下文、上下文映射、防腐层、集成契约
domain: 研发/architecture
triggers: [限界上下文, 上下文映射, context map, bounded context, 防腐层, ACL, 集成契约, 上下游归属, Customer-Supplier, Published Language]
tags: [ddd, context-map, anti-corruption-layer, integration, 架构, 领域驱动设计]
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
- 需要定义多个限界上下文（bounded context）之间的集成模式与依赖方向。
- 想防止领域模型跨服务边界泄漏（domain leakage）。
- 在系统迁移/拆分中规划防腐层（Anti-Corruption Layer, ACL）。
- 需要明确契约的上下游归属（谁拥有契约、谁适配）。

不该用（负边界）：
- 单一上下文、无任何外部集成的系统。
- 只需做单个上下文内部的类/对象设计。
- 只是在选型云基础设施或中间件工具。
- 注意：本技能不替代 API 层 schema 设计，也不能单凭自身保证组织/团队对齐。

## 步骤

1. 列出所有上下文配对（context pairs）及依赖方向，标注谁是上游（upstream）谁是下游（downstream）。
2. 为每对关系选择映射模式（见下方七种常见模式）。
3. 定义翻译规则（translation）与归属边界：契约由谁拥有、是否需要术语转换。
4. 补充失效模式（failure modes）、降级/回退行为（fallback）与版本化策略（versioning）。

## 指令

七种常见关系模式（按耦合从强到弱大致排序，按场景选用）：
- Partnership（合作关系）：双方共同演进、互相成功或失败。
- Shared Kernel（共享内核）：共享一小块模型/代码，改动需双方协商。
- Customer-Supplier（客户-供应商）：上游照顾下游需求排期。
- Conformist（遵奉者）：下游被动接受上游模型，不做转换。
- Anti-Corruption Layer（防腐层 ACL）：下游在边界做转换，隔离外部模型。
- Open Host Service（开放主机服务）：上游提供稳定公开协议供多方接入。
- Published Language（发布语言）：用公认的标准格式/语言交换。

映射模板（每对上下文一行）：

| 上游上下文 | 下游上下文 | 模式 | 契约归属 | 是否需翻译 |
| --- | --- | --- | --- | --- |
| Billing | Checkout | Customer-Supplier | Billing | 是 |
| Identity | Checkout | Conformist | Identity | 否 |

ACL 检查清单：
- 为接收方上下文定义规范化领域模型（canonical domain model）。
- 把外部术语翻译为本地通用语言（ubiquitous language）。
- ACL 代码留在边界处，不要渗入领域核心。
- 为映射行为补充契约测试（contract tests）。

产出要求：
- 覆盖全部上下文配对的关系映射图。
- 契约归属矩阵（contract ownership matrix）。
- 翻译与防腐层决策记录。
- 已知耦合风险（coupling risks）及缓解计划。

## 示例

```text
使用 @ddd-context-mapping 定义 Checkout 如何与 Billing、
Inventory、Fraud 三个上下文集成，含 ACL 与契约归属。
```

预期产出：一张关系映射表（标明各对的模式/上下游/翻译需求）、契约归属矩阵，以及针对 Checkout 的 ACL 决策与耦合风险清单。

## 注意事项

- 本技能不替代 API 层 schema 设计，二者互补：先定关系与归属，再做接口细节。
- 不能单凭映射就保证组织层面的对齐，需配合团队沟通落地。
- 当团队归属（team ownership）发生变化时，应重新审视映射结果。
- Conformist 与 ACL 是常见取舍：能否承受被动遵奉上游模型，决定是否值得投入防腐层成本。

## 互见

- DDD 战略设计 / 事件风暴（用于先识别上下文边界，再做本技能的映射）。
- API/契约 schema 设计技能（在确定关系与归属后下钻具体接口）。
- 契约测试 / 消费者驱动契约（落地 ACL 检查清单中的 contract tests）。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
