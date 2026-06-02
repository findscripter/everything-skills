---
name: clean-craft-code-review
title: 整洁代码工艺评审（Uncle Bob）
description: 当做代码评审、写新代码、重构或讨论架构边界时使用；按 Robert C. Martin（Uncle Bob）的整洁架构/SOLID/坏味道/职业实践给出依赖方向、边界与可落地重构建议，产出"指明文件+原则+1~2 个具体重构"的评审清单；不适用于替代 lint/格式化、自动化测试或语法风格强制；触发词：整洁架构、依赖规则、SOLID、代码评审
domain: 研发/review
triggers: [整洁架构, 依赖规则, Dependency Rule, SOLID, 代码坏味道, 边界划分, code review, 代码评审, 设计模式滥用, 重构方向, Uncle Bob, clean architecture]
tags: [整洁架构, SOLID, code-review, 代码坏味道, 依赖规则, 设计模式, 职业实践, 研发, 评审]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [claude-code, cursor, gemini-cli]
requires: []
related: [clean-code-principles, brooks-design-lint, adversarial-code-reviewer, code-reviewer]
combines_with: [backend-architecture-patterns, code-simplifier, legacy-codebase-modernizer]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

聚合 Uncle Bob 全套著作（《整洁代码》《整洁架构》《匠艺整洁之道 The Clean Coder》《敏捷整洁之道 Clean Agile》及设计模式纪律）的工艺与设计判据，用于**评审**和**写**代码。它**只给工艺/设计判据**，与项目 linter/formatter、自动化测试互补，不取代它们。

- **代码评审**：检查依赖规则、边界、上下文中的 SOLID、坏味道，给出具体重构建议。
- **重构**：决定提炼什么、边界画在哪、某个设计模式是否值得引入。
- **架构讨论**：检查分层边界、依赖方向、关注点分离。
- **设计模式抉择**：判断"正确使用"还是"货物崇拜/过度设计"。
- **估算与职业操守**：引用 Clean Coder（学会说不、可持续节奏、三点估算）。
- **敏捷实践**：引用 Clean Agile（铁十字、TDD、重构、结对）。

**不该用的边界**：

- 不替代项目 **linter / formatter**——花括号风格、行宽、缩进等语法/风格交给工具，本技能不管。
- 不替代**自动化测试**——它可提醒你写测试，但不运行也不生成测试。
- 不做语法/风格强制；专注结构、依赖、坏味道、职业实践。
- 名字与函数级的整洁（命名、注释、函数拆分）属另一技能 `clean-code-principles`，本技能引用它而非重复。

## 步骤

**评审代码时（逐项过）：**

1. **边界与依赖规则**：确认依赖**指向内层**（用例不依赖 UI / DB 细节、业务规则不依赖框架）。
2. **上下文中的 SOLID**：仅就**改动到的代码**检查 SRP、OCP、LSP、ISP、DIP，是否有违反。
3. **坏味道扫描**：按下表逐项扫，**指明文件/区域**地列出。
4. **具体建议**：给 1~2 个可落地重构（如"提炼为函数 X""引入接口让该层不依赖具体 DB 客户端""把这个用例对 web 框架的 import 反转过来"）。
5. **测试与匠艺**：测试是否存在；是否有违反职业操守的"以后再修"式压力 hack。

**写/重构代码时：**

1. 偏好**短小、单一职责**的函数与类（命名/结构细节用 `clean-code-principles`）。
2. 依赖**指向内层**：业务规则在中心，适配器在边缘。
3. 设计模式**仅在重复或变化点出现时**引入，不为"显得企业级"而加。
4. 重构**小步走**，测试全程保持绿色；先改名/改结构再加行为，一次只清一个坏味道。

## 指令

**坏味道与启发式（评审时用它"命名"问题）：**

| 坏味道 | 含义 |
|---|---|
| 僵化 Rigidity | 小改动牵连大量修改 |
| 脆弱 Fragility | 改动击穿不相关区域 |
| 不可移植 Immobility | 难以在别处复用 |
| 黏滞 Viscosity | 走捷径容易、做对的事很难 |
| 无谓复杂 Needless complexity | 投机或未用的抽象 |
| 无谓重复 Needless repetition | 违反 DRY，同一想法散落多处 |
| 晦涩 Opacity | 代码难以理解 |

**设计模式：使用 vs 滥用**

- **该用**：解决真实设计问题（行为变化、生命周期、横切关注点）时引入。
- **避免货物崇拜**：不要因为"应该有"就硬塞 Factory/Strategy/Repository；当重复或僵化逼出抽象时才加。
- **滥用信号**：每个类名都带模式名；只转发无逻辑的"贴膜"层；模式让简单代码更难读。
- **经验法则**：到**第三次重复**或**第二个变化轴**时再引入；在代码或文档里点明模式名以传达意图。

**评审 vs 生产 vs 重构**

| 场景 | 应用 |
|---|---|
| 评审 | 依赖规则与边界；上下文 SOLID；列坏味道；提 1~2 个具体重构；查测试与职业操守 |
| 写新代码 | 小函数+单一职责；依赖向内；做 TDD 时先写测试；重复/变化未出现前不引模式 |
| 重构 | 一次一个坏味道；小步且测试常绿；先改名与结构再加行为 |

## 示例

**评审提示词（可直接复制）：**

```markdown
请用 Uncle Bob 工艺判据评审此改动：
1. 依赖规则与边界 —— 依赖是否都指向内层？
2. 上下文 SOLID —— 改动到的代码有无违反？
3. 坏味道 —— 列出僵化/脆弱/不可移植/黏滞/无谓复杂或重复/晦涩。
4. 给 1~2 个具体重构（如提炼函数、反转依赖）。
不要重复 lint/format，聚焦结构与设计。
```

**前/后：提炼并命名（消除晦涩 + 单一抽象层级）**

改前（一个函数做多件事、意图晦涩）：

```python
def process(d):
    if d.get("t") == 1:
        d["x"] = d["a"] * 1.1
    elif d.get("t") == 2:
        d["x"] = d["a"] * 1.2
    return d
```

改后（意图清晰、单一抽象层级）：

```python
def apply_discount(amount: float, discount_type: int) -> float:
    if discount_type == 1:
        return amount * 1.1
    if discount_type == 2:
        return amount * 1.2
    return amount

def process(order: dict) -> dict:
    order["x"] = apply_discount(order["a"], order.get("t", 0))
    return order
```

## 注意事项

- 评审时**点名原则与位置**，别只说"违反了 SOLID"。反例→正例："SRP：该函数既解析又持久化，拆成 parse 与 persist"；"依赖规则违反：用例 import 了 web 框架"。
- **每次评审至少给一个具体重构**（提炼、改名、反转依赖），否则评审无法落地。
- **始终单独跑项目 linter/formatter 与测试**——不要因为"已经套了 Uncle Bob"就跳过。
- 别把每个类都套 Factory/Strategy；只在真实设计需求（第三次重复、第二个变化轴）时引入模式。
- 这些是**摘要不是原书**。完整的 Clean Code 启发式、组件原则（REP/CCP/CRP、ADP/SDP/SAP）与详细案例见原著。

## 互见

- requires：`clean-code-principles` —— 名字/函数/注释级整洁是本技能的基础，本技能在其上补架构、边界、跨书判据。
- related：`code-reviewer`、`adversarial-code-reviewer`、`api-design-reviewer` —— 把本技能的原则用于差异评审与内联评论。
- related：`ddd-strategic-design`、`backend-architecture-patterns` —— 高层结构与限界上下文，与依赖规则/边界判据互补。
- combines_with：`error-handling-patterns` —— 评审错误处理边界时一起用，落实"用异常而非返回码、不返回/传入 null"。

---

采编自 [sickn33/antigravity-awesome-skills](https://github.com/sickn33/antigravity-awesome-skills)（MIT 许可证），内容基于 Robert C. Martin（Uncle Bob）《Clean Code》《Clean Architecture》《The Clean Coder》《Clean Agile》。
