---
name: clean-code-principles
title: 整洁代码原则与重构
description: 当编写新代码、评审 PR 或重构遗留代码时使用；依据 Uncle Bob《整洁代码》原则识别坏味道并把"能跑的代码"重写为"整洁的代码"，产出命名/函数/注释/错误处理等改进与检查清单；不适用于性能调优、架构选型或语言特性教学；触发词：整洁代码、重构、代码坏味道
domain: 研发/review
triggers: [整洁代码, 重构, 代码坏味道, code smell, clean code, 命名规范, 函数拆分, PR 评审, code review]
tags: [整洁代码, 重构, 代码质量, code-review, 命名, TDD, SRP, 研发]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [clean-craft-code-review, code-simplifier, code-reviewer, adversarial-code-reviewer]
combines_with: [legacy-codebase-modernizer, code-reviewer, test-coverage-gap-finder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用于以下场景：

- **编写新代码**：从一开始就保证质量，而非事后补救。
- **评审 Pull Request**：基于原则给出建设性、可落地的反馈，而非主观争论。
- **重构遗留代码**：识别并清除坏味道（code smell）。
- **统一团队规范**：在命名、函数、错误处理等维度对齐行业最佳实践。

> "代码整洁与否，看它能否被原作者之外的开发者读懂并增强。" — Grady Booch

**不该用的边界**：

- 不是性能调优指南——整洁优先于过早优化，性能问题用 profiler 定位后再针对性处理。
- 不是架构/技术选型决策工具（如选框架、定分层）。
- 不替代环境相关的验证、测试与专家评审；输出仅为改进建议。
- 缺少必要输入、权限、安全边界或验收标准时，应停下来澄清而非硬改。

## 步骤

1. **先建测试网**：重构前确保有可运行的测试覆盖待改代码；无测试先补"刻画测试"（characterization test）锁定现有行为。
2. **小步重构**：每次只改一类问题（如先统一命名，再拆函数），每步后跑测试保持绿色。
3. **逐项过检查清单**（见下）：命名 → 函数 → 注释 → 格式 → 对象/数据 → 错误处理 → 测试 → 类 → 坏味道。
4. **提交并复审**：每个可独立验证的改动单独提交，便于回滚和评审。

## 指令

按以下九条原则逐项检查与改写：

**1. 有意义的命名**
- 用揭示意图的名字：`elapsedTimeInDays` 而非 `d`。
- 避免误导：实际是 `Map` 就别叫 `accountList`。
- 做有意义的区分：避免 `ProductData` 与 `ProductInfo` 这类无差别命名。
- 可读可搜索：避免 `genymdhms`、`hp` 这类缩写。
- 类名用名词（`Customer`、`WikiPage`），避免 `Manager`、`Data`；方法名用动词（`postPayment`、`deletePage`）。

**2. 函数**
- **要短**：比你以为的更短。
- **只做一件事**，并做好。
- **单一抽象层级**：别把高层业务逻辑和底层细节（如正则）混在一起。
- 描述性命名：`isPasswordValid` 优于 `check`。
- 参数：0 个最佳，1-2 个可接受，3+ 需强有力理由。
- **无副作用**：函数不应偷偷改全局状态。

**3. 注释**
- **别给烂代码加注释——重写它**。多数注释是"无法用代码表达自己"的失败信号。
- 用代码解释自己（见示例）。
- 好注释：法律声明、信息型（如正则意图）、对外部库的澄清、TODO。
- 坏注释：含糊、冗余、误导、强制、噪声、位置标记。

**4. 格式**
- **报纸隐喻**：高层概念在上，细节在下。
- 垂直密度：相关行靠在一起；变量在靠近使用处声明。
- 缩进对结构可读性至关重要。

**5. 对象与数据结构**
- 数据抽象：把实现藏在接口后面。
- **迪米特法则**：模块不应了解所操作对象的内部细节，避免 `a.getB().getC().doSomething()` 这类链式穿透。
- DTO：仅含公开变量、无函数的数据传输对象。

**6. 错误处理**
- 用**异常**而非返回码，保持主逻辑清晰。
- 先写 try-catch-finally，界定操作范围。
- **不返回 null**：否则逼调用方处处判空。
- **不传入 null**：易导致 `NullPointerException`。

**7. 单元测试**
- **TDD 三定律**：(1) 没有失败的单测前不写产品代码；(2) 单测只写到刚好失败为止；(3) 产品代码只写到刚好让测试通过为止。
- **F.I.R.S.T.**：Fast（快）、Independent（独立）、Repeatable（可重复）、Self-Validating（自验证）、Timely（及时）。

**8. 类**
- **要小**：单一职责（SRP）。
- 降阶规则（Stepdown Rule）：代码读起来像自上而下的叙事。

**9. 坏味道与启发式**
- Rigidity（僵化，难改）、Fragility（脆弱，一改多处坏）、Immobility（不可移植，难复用）、Viscosity（黏滞，做对的事很麻烦）、Needless Complexity/Repetition（无谓复杂/重复）。

## 示例

用代码表达意图，替代注释：

```python
# Check if employee is eligible for full benefits
if employee.flags & HOURLY and employee.age > 65:
    ...
```

重写为：

```python
if employee.isEligibleForFullBenefits():
    ...
```

## 注意事项

落地检查清单（每处改动逐条自问）：

- [ ] 这个函数是否短于 20 行？
- [ ] 这个函数是否只做一件事？
- [ ] 所有名字是否可搜索、揭示意图？
- [ ] 我是否通过让代码更清晰来避免注释？
- [ ] 我是否传了太多参数？
- [ ] 这次改动是否有对应的（曾经失败的）测试？

其他注意：

- 原则是启发式而非铁律——在可读性与现实约束（如性能、既有约定）冲突时权衡，并在 PR 中说明取舍。
- 重构与功能变更分开提交，避免把行为改动藏进"整理"里。

## 互见

- 单元测试 / TDD 实践类技能（F.I.R.S.T. 与三定律落地）。
- code-review：把本技能的原则用于差异评审与内联评论。
- 重构手法目录（提炼函数、内联、引入参数对象等具体操作）。

---

采编自 [sickn33/antigravity-awesome-skills](https://github.com/sickn33/antigravity-awesome-skills)（MIT 许可证），原始来源 ClawForge，内容基于 Robert C. Martin《Clean Code》。
