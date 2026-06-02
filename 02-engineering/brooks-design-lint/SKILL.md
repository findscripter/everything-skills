---
name: brooks-design-lint
title: 经典软工书籍驱动的设计审查（brooks-design-lint）
description: 当需要超越 linter 的架构与设计层审查（重构前、新模块设计评审、接手陌生代码、"能跑但感觉不对"的代码）时使用；以 12 本经典软工书籍为视角，产出按书籍/严重度分级的设计坏味、耦合、稳定性与数据一致性问题清单及改进建议；不适用于语法/风格 lint、纯逻辑 bug 排查、安全专项扫描，也不替代人工设计评审；触发词：设计审查、架构评审、重构前体检、代码坏味、耦合分析、Brooks Lint
domain: 研发/review
triggers: [设计审查, 架构评审, 重构前体检, 代码坏味/code smell, 耦合分析, 能跑但感觉不对的代码, 接手陌生代码, Brooks Lint / brooks-design-lint]
tags: [代码审查, 软件架构, 软件设计, 重构, 设计坏味, 研发]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Grep, Glob]
requires: []
related: [clean-craft-code-review, clean-code-principles, adversarial-code-reviewer, code-reviewer]
combines_with: [backend-architecture-patterns, legacy-codebase-modernizer, systematic-debugger]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
以 Fred Brooks 命名（《人月神话》作者）——因为最难的 bug 是概念性的，而非语法性的。本技能不查风格规则，而是以 12 本经典软工书籍为审查视角，回答："《程序员修炼之道》《代码整洁之道》《数据密集型应用系统设计》的作者们会怎么评价这段代码？"——捕捉 linter 与常规 AI 工具容易漏掉的设计坏味、紧耦合、缺失抽象与架构风险。

## 何时使用

适用：
- 想要超出 linter 范围的架构/设计层反馈。
- 大型重构前，定位结构性技术债。
- 审查"能跑但感觉不对"的代码。
- 接手陌生代码库，快速绘制风险地图。
- 启动新模块/服务前的设计评审。

不该用（负边界）：
- 语法/风格 lint（交给 ESLint、Prettier 等）。
- 纯逻辑 bug 排查（属于功能正确性，另用逻辑审查工具）。
- 安全专项深扫（用安全审计技能）。
- 生产关键决策：本技能是 AI 辅助，应补充而非替代人工设计评审；结论受 12 本源书视角约束，未必适配所有架构风格或领域。

## 步骤

1. 划定范围：单文件 / 单模块 / 整体架构，明确审查目标（如"重构前找最大设计坏味"）。
2. 用 Read / Grep / Glob 读取目标代码与其依赖边界。
3. 以下面 6 个视角逐项扫描，对每条发现标注【书名】+ 严重度（CRITICAL / HIGH / MEDIUM / LOW）。
4. 优先输出 CRITICAL 与 HIGH；LOW 仅作风格建议。
5. 每条发现给出"问题定位 + 违背的原则 + 可执行的改进方向"。

### 6 个审查视角
1. 坏味检测：违反 DRY、SRP、迪米特法则（Law of Demeter）等。
2. 耦合分析：紧依赖、缺失抽象层/接口。
3. 命名批判：用《代码整洁之道》命名规则审视变量/方法/类，并对照 DDD 领域语言。
4. 架构审查：DDIA 视角的数据一致性、幂等性、容错缺口。
5. 稳定性模式：缺失超时、重试、熔断器、舱壁（《Release It!》）。
6. 复杂度评分：用《软件设计的哲学》(APOSD) 复杂度度量识别过度设计/不必要抽象。

### 12 本书与对应原则
| 书 | 应用的关键原则 |
|----|----------------|
| 程序员修炼之道 (PP) | DRY、正交性、曳光弹 |
| 代码整洁之道 (Clean Code) | 命名、函数大小、注释清晰度 |
| 人月神话 (MMM) | 概念完整性、第二系统效应 |
| 数据密集型应用系统设计 (DDIA) | 数据一致性、容错、可扩展性 |
| 软件设计的哲学 (APOSD) | 深模块、信息隐藏、复杂度 |
| 重构 (Refactoring) | 代码坏味、提炼函数、封装 |
| 修改代码的艺术 (WELC) | 接缝、特征测试、打破依赖 |
| 领域驱动设计 (DDD) | 统一语言、限界上下文、聚合 |
| Release It! | 稳定性模式：超时、舱壁、熔断器 |
| 计算机程序的构造和解释 (SICP) | 抽象、递归、元语言抽象 |
| UNIX 编程艺术 | 模块化、可组合、最小惊讶原则 |
| 解析极限编程 (XP) | YAGNI、简单设计、集体所有权 |

### 审查类目速查
| 类目 | 涉及书 | 捕捉什么 |
|------|--------|----------|
| DRY/重复 | PP、Refactoring | 复制粘贴、未提炼的共享逻辑 |
| 命名 | Clean Code、DDD | 含混命名、违反领域语言 |
| 耦合 | APOSD、PP | 紧依赖、缺失接口 |
| 稳定性 | Release It! | 缺超时/重试/熔断 |
| 数据完整性 | DDIA | 竞态、非幂等操作 |
| 复杂度 | APOSD、SICP | 过度工程、不必要抽象 |
| 遗留债 | WELC | 难测代码、缺失接缝 |
| 领域清晰度 | DDD、XP | 贫血模型、缺失限界上下文 |

## 指令

- 审查单个服务类：`review src/services/PaymentService.ts`
- 整体架构审查：`analyze the overall architecture of this codebase`
- 重构前体检：`what are the biggest design smells in this module before I refactor it?`

## 示例

输入：`review src/services/PaymentService.ts`

输出（每条标注书籍来源）：
```
[程序员修炼之道] DRY 违规：支付校验逻辑在 3 处重复
[代码整洁之道] processPayment() 做了 4 件事——违反单一职责
[Release It!] 调用外部支付网关无超时——级联失败风险
[DDIA] 缺幂等键——网络错误重试会重复扣款
[APOSD] PaymentService 对 UserRepository 知道太多——高耦合
```

## 注意事项

- 优先处理 CRITICAL / HIGH 发现，LOW 属风格建议。
- 在新增服务层或数据管道后即跑一次设计审查；成长中的代码库可每周做一次整体架构审查。
- 与逻辑审查互补使用：逻辑审查抓功能 bug，本技能抓设计问题，两者覆盖更全。
- 本技能是 AI 辅助分析，结论受 12 本源书原则约束，未必适配所有架构风格/领域，生产关键决策仍需人工评审把关。

## 互见

- 逻辑/功能正确性审查技能：抓逻辑 bug，与本技能形成"逻辑 bug + 设计坏味"双覆盖。
- 安全审计技能：安全专项深扫。
- 风格/语法 lint：与设计审查并行运行。
- code-review / review：可在 PR 流程中配合本技能的设计视角。

---
采编自 sickn33/antigravity-awesome-skills（原 skill: brooks-lint，作者 hyhmrright，许可证 MIT）。
