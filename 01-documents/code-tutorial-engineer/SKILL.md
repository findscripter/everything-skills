---
name: code-tutorial-engineer
title: 代码教程与教学内容编写
description: 当需要把代码、特性或库改写成循序渐进、动手实操的教程或教学内容时使用；做学习目标拆解、概念分层、带预期输出的练习与排错，产出 Markdown 教程（含 Try It Yourself、可折叠答案、Troubleshooting）；不适用于纯 API 参考、长篇架构叙事或营销文案。触发词：写教程、上手指南、onboarding 教学、动手实验、循序渐进、教学内容
domain: 文书/writing
triggers: [把代码或特性写成教程, 编写循序渐进的上手指南, 做新人 onboarding 教学材料, 设计带练习和答案的动手实验, 为博客/课程/工作坊写教学内容, 把复杂概念拆成可学的步骤]
tags: [技术教程, 教学设计, onboarding, 动手实验, 技术写作, 文档工程]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Glob, Grep, Write]
requires: []
related: [docs-architect, technical-reference-builder, readme-doc-writer, codebase-onboarding-doc]
combines_with: [docs-architect, openapi-doc-generator]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
---
name: code-tutorial-engineer
title: 代码教程与教学内容编写
description: 当需要把代码、特性或库改写成循序渐进、动手实操的教程或教学内容时使用；做学习目标拆解、概念分层、带预期输出的练习与排错，产出 Markdown 教程（含 Try It Yourself、可折叠答案、Troubleshooting）；不适用于纯 API 参考、长篇架构叙事或营销文案。触发词：写教程、上手指南、onboarding 教学、动手实验、循序渐进、教学内容
domain: 文书/misc
triggers: [把代码或特性写成教程, 编写循序渐进的上手指南, 做新人 onboarding 教学材料, 设计带练习和答案的动手实验, 为博客/课程/工作坊写教学内容, 把复杂概念拆成可学的步骤]
tags: [技术教程, 教学设计, onboarding, 动手实验, 技术写作, 文档工程]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Glob, Grep, Write]
requires: []
related: [docs-architect, technical-reference-builder, readme-doc-writer]
combines_with: []
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

当需要把一段代码、一个特性或一个库，转化成**循序渐进、可动手跑通**的学习材料时使用。产物是教学型 Markdown：读者跟着做能从零到「会用」，而不仅是「看懂」。典型场景：

- 把复杂概念拆成可消化的顺序步骤，让初学者不卡壳。
- 为新人 onboarding、博客、课程、工作坊产出教学内容。
- 写「教人」而非「查阅」的文档：每个概念配即时练习与预期输出。

**不该用边界：**

- 任务与教程/教学无关，或属其他领域/工具范畴。
- 需要 API 参考手册（字段级速查）—— 改用 `technical-reference-builder`。
- 需要长篇架构叙事 / 设计决策记录 —— 改用 `docs-architect`。
- 写营销或推广文案。
- 缺必需输入（主题/代码、目标受众、格式、约束、发布渠道）时先停下澄清，不要臆造。

## 步骤

教程开发三步法：

1. **定学习目标**：补全「学完后你将能够 ____」。用 Bloom 动词（build / debug / optimize，不用「understand」），写可衡量的成果，明确前置知识。
2. **拆概念**：把复杂主题切成原子概念，按「简单→复杂、具体→抽象」排序，标出依赖。**铁律：任何概念都不得依赖后文才介绍的知识（No Forward References）。**
3. **设练习**：动手编码练习按脚手架（scaffolding）由易到难，每个练习都要有明确成功判据，并埋入自检 checkpoint。节奏遵循 **I do（示范）→ We do（带做）→ You do（挑战）**。

**渐进章节节奏**（每节固定韵律）：概念引入（配类比）→ 最小可跑示例 → 带预期输出的逐步带做 → 可选变体 → 难度递增的挑战 → Troubleshooting（错误信息 → 修复）。

## 指令

- **Show, Don't Tell**：先给可跑代码，再解释参数。每个概念紧跟一次即时练习。
- **认知负荷管理**：每节新概念 ≤ 3 个；代码示例尽量一屏放下；每 5 行代码配 1–3 句解释；删掉装饰性代码，每行都要「教点东西」。
- **频繁验证**：每隔几步让读者跑一次，并写明「Expected output: …」。
- **解释「为什么」**：不只讲 what/how，用类比连接到熟悉概念（如「中间件像安检口」），关联真实生产场景。
- **变量名有意义**：用 `user_name` 而非 `x`；非显然逻辑加内联注释（不是每行都注）。
- **不跳「显而易见」的步骤**（专家盲区）；所有代码先跑通再放进去，否则标注 `pseudocode`。
- **按受众校准**：初学者 → 更多类比、更小步子、更多练习；进阶 → 假定基础、聚焦模式与最佳实践；高级 → 跳过铺垫、直入边界与优化。
- 练习类型按难度选用：Fill-in-the-Blank（建立信心）/ Debug 挑战（先给错误信息）/ Extension 任务（给需求不给答案）/ From Scratch（给测试用例自检）/ Refactoring（前后对比）。

**输出格式（Markdown，保留源约束）：** 章节清晰编号；代码块带语言标签 + 文件名注释 + 预期输出（`# Output: ...`）；提示/警告用 `> **Tip:**` / `> **Warning:**`；checkpoint 用 `## Checkpoint: 你应该能……`；答案放可折叠块 `<details><summary>Solution</summary>…</details>`；尽量给可运行仓库链接（GitHub / CodeSandbox / Replit）。

## 示例

教程骨架模板（复制即用）：

```markdown
# [教程标题]

> 你将学会: [2–4 条目标]
> 前置: [所需知识 + 安装链接]
> 时长: [X–Y 分钟] | 难度: [入门/进阶/精通]

## 环境准备
[精确、无歧义的命令，复制即跑]

## 第 1 节: [概念名]
[解释 → 示例 → 练习]

### Try It Yourself
[带明确成功判据的练习：「输入 Y 时你的代码应输出 X」]

<details><summary>Solution</summary>

[可折叠答案]

</details>

## Troubleshooting
| 错误信息 | 原因 | 修复 |
|---|---|---|
| [报错] | [为何发生] | [确切修法] |

## 小结
- [要点 1，呼应开头目标]

## 下一步
1. [带链接的具体行动]
```

> 发布前自检：初学者能否不卡壳跟完？概念是否都先讲后用？每段代码是否都跑通且给了预期输出？常见错误是否已在 Troubleshooting 里提前处理？

## 注意事项

- 仅在任务明确落入教程/教学范围时使用；偏 API 速查或架构叙事时移交对应技能。
- 每条解释都要落到真实可运行代码上，不空谈理论；外部资源只能作补充，不能替代对核心概念的讲解。
- 产出不替代环境相关的验证、测试或专家评审；所有代码示例发布前实测（或显式标注为伪代码）。
- 缺必需输入（主题/代码、目标受众、格式偏好、约束、发布渠道）或成功标准不明时，先停下询问澄清。
- 默认假设（缺省时）：受众=进阶开发者；格式=Deep Dive；渠道=技术博客/文档；工具=所述框架的最新稳定版。

## 互见

- related：`technical-reference-builder` —— 需要字段级 API/配置速查（答「是什么/怎么调」）时改用它，本技能专攻「怎么学/动手做」。
- related：`docs-architect` —— 需要长篇架构叙事 / 设计决策（讲「为什么」）时改用它。
- related：`readme-doc-writer` —— 项目级 README / 快速上手速写可与本技能的入门章节互补。
- combines_with：飞书在线协作（`lark-doc`、`lark-wiki`）—— 将本地 Markdown 教程导入为云文档 / 知识库供团队学习。

---
采编自 sickn33/antigravity-awesome-skills（MIT）。
