---
name: adr-writer
title: 架构决策记录（ADR）撰写
description: 当需要记录重大技术/架构决策（框架选型、数据库选型、API 模式、安全架构）并沉淀其上下文与权衡时使用；产出符合 MADR/轻量/Y-Statement 等模板的 ADR 文档与索引；不适用于 bug 修复、小版本升级、配置变更等琐碎改动；触发词：ADR、架构决策记录、architecture decision record、决策文档、技术选型记录、MADR
domain: 协作/knowledge
triggers: [ADR, 架构决策记录, architecture decision record, 决策文档, 技术选型记录, MADR]
tags: [adr, architecture, documentation, decision-record, madr, knowledge]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [adr-tools, markdown]
requires: []
related: [adr-management-patterns, codebase-onboarding-doc, tech-stack-evaluator, database-design-advisor]
combines_with: [tech-stack-evaluator, backend-architecture-patterns, codebase-onboarding-doc]
license: MIT
source: wshobson/agents
source_license: MIT
---
## 何时使用

为重大且不易逆转的技术决策留痕，让未来的人（含新成员）能读懂「当时为什么这么定」。

适用：框架/库选型、数据库选型、API 设计模式、安全架构、集成模式、决策流程建立、回顾历史决策。

不该用（写了反而是噪音）：bug 修复、小版本升级、纯实现细节、日常维护、配置变更。判断口径：决策是否影响系统结构、是否难以回退、是否需要团队达成共识——三者有其一才值得写 ADR。

一条 ADR 的核心永远是三段：**Context（为何要决策）→ Decision（决定了什么）→ Consequences（带来什么后果，含负面）**。

## 步骤

1. 确认该决策达到「值得记录」门槛（见上）。
2. 选模板：正式选型用 MADR；小决策用轻量版；一句话权衡用 Y-Statement；废弃/替换旧决策用 Deprecation 模板（标注 Supersedes）；提案讨论用 RFC 风格。
3. 在 `docs/adr/` 下按 `NNNN-title-with-dashes.md` 命名（四位递增编号）。
4. 填写：Context 讲清问题与约束 → Decision Drivers 列决策驱动力 → Considered Options 给每个候选写真实的 Pros/Cons → Decision + Rationale → Consequences（正面/负面/风险与缓解）→ Implementation Notes → Related Decisions → References。
5. 设置 Status（生命周期：Proposed → Accepted → Deprecated → Superseded，分支可 Rejected）。
6. 走评审：至少 2 名资深工程师 + 受影响团队，覆盖安全、成本、可逆性。
7. 接受后更新 `docs/adr/README.md` 索引表、通知团队、创建实施工单。
8. 决策改变时**不要改旧 ADR**，新写一条并标注 Supersedes ADR-XXXX。

## 指令

可选用 `adr-tools` 自动化编号、索引与关联：

```bash
brew install adr-tools
adr init docs/adr                                  # 初始化目录
adr new "Use PostgreSQL as Primary Database"       # 新建 ADR（自动编号）
adr new -s 3 "Deprecate MongoDB in Favor of PostgreSQL"  # 新建并废弃 ADR-0003
adr generate toc > docs/adr/README.md              # 生成目录索引
adr link 2 "Complements" 1 "Is complemented by"    # 关联两条 ADR
```

目录结构约定：

```
docs/adr/
├── README.md                 # 索引 + 规范
├── template.md               # 团队模板
├── 0001-use-postgresql.md
├── 0003-mongodb-user-profiles.md   # [DEPRECATED]
└── 0020-deprecate-mongodb.md       # Supersedes 0003
```

## 示例

MADR 正式模板（节选骨架）：

```markdown
# ADR-0001: Use PostgreSQL as Primary Database

## Status
Accepted

## Context
为新电商平台选主库：约 1 万并发、复杂分类目录、订单支付事务、
商品全文检索、门店地理位置查询；支付需 ACID。

## Decision Drivers
- 必须 ACID（支付）  - 必须支持复杂查询（报表）
- 应支持全文检索与 JSON  - 团队熟悉度

## Considered Options
### Option 1: PostgreSQL — Pros: ACID、JSONB、内置全文检索、PostGIS；Cons: 复制配置略复杂
### Option 2: MySQL — Pros: 团队熟、复制简单；Cons: JSON 弱、需外接 Elasticsearch
### Option 3: MongoDB — Pros: 灵活 schema；Cons: 多文档事务弱、团队经验少

## Decision
采用 **PostgreSQL 15** 作为主库。

## Consequences
### Positive: 单库覆盖事务/检索/地理查询，运维更简单
### Negative: 需学 JSONB/全文检索语法；纵向扩展受限需尽早上读副本
### Risks: 全文检索扩展性不如专用引擎 → 缓解：预留接入 Elasticsearch 的设计
```

Y-Statement 一句话格式（适合小决策）：

```markdown
In the context of 构建微服务架构,
facing 需要集中式 API 管理、鉴权与限流,
we decided for Kong Gateway
and against AWS API Gateway 与自建 Nginx 方案,
to achieve 厂商无关、插件可扩展、团队熟悉 Lua,
accepting that 需自行运维 Kong 基础设施。
```

## 注意事项

- 尽早写——在动手实现前，而非事后补。
- 写短——1~2 页足够，超长没人读。
- 诚实列权衡——写真实的 Cons 和被否决方案，Rejected 决策本身有价值。
- 已 Accepted 的 ADR 不改动，用新 ADR 替换（Supersedes）。
- 别省 Context，别含糊（具体的决策对应具体的后果），别漏 Implementation——只有结论没有行动的 ADR 是浪费。
- 评审清单可固化为 README：提交前查 Context/选项/利弊/后果/关联；评审中查双人评审/受影响团队/安全/成本/可逆性；接受后查索引/通知/工单。

## 互见

- first-principles-thinking：在 ADR 的 Decision Drivers 与候选评估阶段，用第一性原理拆解约束、识别真正的取舍。

本条采编自 wshobson/agents（MIT）。
