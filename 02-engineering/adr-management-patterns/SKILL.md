---
name: adr-management-patterns
title: 架构决策记录（ADR）管理模式
description: 当需要为重大技术/架构选型留痕时使用；产出一篇含上下文、备选方案、决策与后果的 ADR 文档，并维护编号、状态与索引；不适用于小补丁、配置改动或无架构决策的常规维护；触发词：ADR、架构决策、技术选型留痕
domain: 研发/architecture
triggers: [写一份 ADR, 记录架构决策, 技术选型留痕, 数据库/框架选型对比, 废弃并取代旧决策, ADR 模板, adr-tools, 决策评审清单, MADR]
tags: [architecture, adr, decision-record, research, 技术文档, 技术选型]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [adr-tools, Markdown, Git/PR]
requires: []
related: []
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用于「重大且不易回退」的架构决策需要留痕、可追溯时，例如：

- 新框架/语言/运行时的采纳
- 数据库、缓存、消息中间件等基础设施选型
- API 设计模式、集成模式、安全架构的确立
- 记录设计权衡，或为新成员/审计回溯历史决策
- 建立团队级决策流程

**不该用（负边界）**：

- 仅记录细小实现细节、命名、配置项调整
- 小版本升级、Bug 修复、例行维护
- 根本不存在需要拍板的架构决策
- 不要把 ADR 当作环境特定验证、测试或专家评审的替代品；缺少必要输入、权限或成功标准时先停下来确认

判断口诀（写 vs 跳过）：

| 写 ADR | 跳过 ADR |
|--------|----------|
| 采纳新框架 | 次要版本升级 |
| 数据库技术选型 | Bug 修复 |
| API 设计模式 | 实现细节 |
| 安全架构 | 例行维护 |
| 集成模式 | 配置变更 |

## 步骤

1. **捕获上下文**：写清为什么现在要做这个决策——业务约束、技术约束、决策驱动因素（Decision Drivers）。
2. **列出备选方案**：每个方案给出诚实的优点/缺点，不藏短板。
3. **记录决策与理由**：明确「选了什么、为什么、放弃了什么」，并写出正面/负面/风险三类后果及缓解措施。
4. **关联与维护状态**：链接相关 ADR，随时间更新状态（Proposed → Accepted → Deprecated → Superseded，或 Rejected），新决策取代旧决策时写新 ADR 而非改旧的。

ADR 生命周期：

```
Proposed → Accepted → Deprecated → Superseded
              ↓
           Rejected
```

## 指令

- 一条 ADR 一个决策；编号用四位数 `NNNN`，文件名 `NNNN-title-with-dashes.md`。
- 控制在 1–2 页，可执行、可落地；ADR 没有后续行动等于浪费。
- 已 Accepted 的 ADR 不要原地修改，用新 ADR Supersede。
- 在 `docs/adr/` 集中存放，并维护 `README.md` 索引表与 `template.md` 模板。

推荐目录结构：

```
docs/
└── adr/
    ├── README.md           # 索引与规范
    ├── template.md         # 团队 ADR 模板
    ├── 0001-use-postgresql.md
    ├── 0002-caching-strategy.md
    ├── 0003-mongodb-user-profiles.md  # [DEPRECATED]
    └── 0020-deprecate-mongodb.md      # 取代 0003
```

用 `adr-tools` 自动化：

```bash
# 安装
brew install adr-tools

# 初始化 ADR 目录
adr init docs/adr

# 新建 ADR
adr new "Use PostgreSQL as Primary Database"

# 以取代关系新建（取代 ADR-0003）
adr new -s 3 "Deprecate MongoDB in Favor of PostgreSQL"

# 生成目录索引
adr generate toc > docs/adr/README.md

# 关联相关 ADR
adr link 2 "Complements" 1 "Is complemented by"
```

## 示例

**标准模板（MADR 格式）**，包含 Status / Context / Decision Drivers / Considered Options / Decision / Rationale / Consequences（Positive、Negative、Risks）/ Implementation Notes / Related Decisions / References：

```markdown
# ADR-0001: Use PostgreSQL as Primary Database

## Status
Accepted

## Context
为新电商平台选主数据库，需支撑约 1 万并发、层级化商品目录、
订单/支付事务、全文检索、门店地理位置查询；支付环节需 ACID。

## Decision Drivers
* 必须 ACID（支付）
* 必须支持复杂查询（报表）
* 最好内置全文检索，减少额外组件
* 最好有良好 JSON 支持（灵活商品属性）
* 团队熟悉度

## Considered Options
### Option 1: PostgreSQL
- 优点：ACID、JSONB、内置全文检索、PostGIS、团队有经验
- 缺点：复制配置略复杂
### Option 2: MySQL
- 优点：团队最熟、复制简单、社区大
- 缺点：JSON 弱、需外挂 Elasticsearch、地理查询需扩展
### Option 3: MongoDB
- 优点：灵活 schema、原生 JSON、水平扩展
- 缺点：多文档事务弱、团队经验少

## Decision
采用 **PostgreSQL 15** 作为主数据库。

## Consequences
### Positive：单库覆盖事务/检索/地理；运维更简单；强一致
### Negative：需学 JSONB / 全文检索语法；纵向扩展早晚要读副本
### Risks：全文检索扩展性不如专用引擎；缓解——预留接入 Elasticsearch 的设计
```

**轻量模板**（适合小决策，含 Status/Date/Deciders 头部）、**Y-Statement 一句式**、**废弃/取代型**（带分阶段迁移计划与经验教训）、**RFC 风格**（Summary/Motivation/Detailed Design/Drawbacks/Alternatives/Unresolved Questions/Implementation Plan）按需选用。

Y-Statement 一句式示例：

```markdown
# ADR-0015: API Gateway Selection
In the context of **building a microservices architecture**,
facing **the need for centralized API management, auth, and rate limiting**,
we decided for **Kong Gateway**
and against **AWS API Gateway and custom Nginx**,
to achieve **vendor independence, plugin extensibility, Lua familiarity**,
accepting that **we manage Kong infrastructure ourselves**.
```

索引表（README.md）样式：

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| 0001 | Use PostgreSQL as Primary Database | Accepted | 2024-01-10 |
| 0003 | MongoDB for User Profiles | Deprecated | 2023-06-15 |
| 0020 | Deprecate MongoDB | Accepted | 2024-01-15 |

## 注意事项

**评审清单**（贯穿提交前/评审中/通过后）：

- 提交前：上下文讲清问题、覆盖所有可行方案、优缺点诚实平衡、正负后果齐全、已链接相关 ADR。
- 评审中：≥2 名资深工程师评审、咨询受影响团队、评估安全/成本/可逆性。
- 通过后：更新索引、通知团队、创建实施工单、同步相关文档。

**该做**：尽早写（实现开始前）；保持简短（1–2 页）；诚实写权衡（写真实缺点）；链接相关决策形成决策图；状态随取代而更新。

**别做**：别改已 Accepted 的 ADR（写新的去 Supersede）；别省略上下文；别隐藏失败（被否决的方案也有价值）；别含糊（具体决策、具体后果）；别忘实现落地。

## 互见

- MADR 模板：https://adr.github.io/madr/
- Documenting Architecture Decisions（Michael Nygard）：https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions
- ADR GitHub 组织：https://adr.github.io/ ；adr-tools：https://github.com/npryce/adr-tools

---
采编自 sickn33/antigravity-awesome-skills（MIT 许可证）。
