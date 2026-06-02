---
name: adversarial-code-reviewer
title: 对抗式代码评审
description: 当合并 PR 前、长时间编码后或怀疑「LGTM」过于宽松时使用；用三类敌对角色（破坏者/新人/安全审计员）对改动做强制挑刺评审，产出按严重级分类、含 BLOCK/CONCERNS/CLEAN 裁决的结构化报告；不适用于无 diff 可评审或仅需正向确认/纯风格格式化的场景。触发词：对抗式评审、adversarial review、合并前评审、敌对角色挑刺
domain: 研发/review
triggers: [对抗式代码评审, adversarial review, /adversarial-review, 合并前严格评审, 怀疑LGTM太宽松, 敌对角色挑刺, PR merge 前评审, 破坏者/新人/安全审计员, self-review trap]
tags: [研发, code-review, 代码质量, PR, 安全审计, OWASP, 对抗评审]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [git, Read, Grep, Glob]
requires: []
related: [code-reviewer, clean-craft-code-review, brooks-design-lint, llm-coding-mistake-guardrails]
combines_with: [github-pr-comment-resolver, bug-hunter, security-audit-toolkit]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

打破「自评审同质化」——当评审者与作者共享同一套心智模型时，容易给出「看起来没问题」的虚假通过。本技能通过强制切换为三类敌对角色，逼出盲点。

适用：
- 合并任意 PR 前，尤其是无人评审的自写 PR
- 长时间编码后（疲劳产生盲点）
- 当 Claude/评审给出轻易的「looks good / LGTM」，需要第二意见
- 安全敏感代码：鉴权、支付、数据访问、API 端点
- 「直觉觉得哪里不对」时

不该用（负边界）：
- 没有任何 diff / 文件可评审（直接报「无可评审内容」）
- 只想要正向确认或鼓励，而非挑错
- 仅需纯格式化 / 风格 lint（本技能要求「实质优先于风格」）
- 需要深度专项安全分析时，应转 `senior-security`

## 步骤

### 第 1 步 收集改动
按调用方式确定评审范围：
- 无参数：`git diff`（未暂存）+ `git diff --cached`（已暂存）；若都为空则 `git diff HEAD~1`（最近一次提交）。
- `--diff <ref>`：执行 `git diff <ref>`（如 `--diff HEAD~3`、`--diff main...HEAD`）。
- `--file <path>`：读取整个文件，针对全文评审而非仅改动行。

若找不到任何改动，停止并报告「无可评审内容」。

### 第 2 步 读全上下文
对 diff 中每个文件：
1. 读**整个文件**，而非仅改动行——bug 藏在新代码与既有代码的交互处。
2. 判断改动**目的**：缺陷修复 / 新特性 / 重构 / 配置变更 / 测试。
3. 记录**项目约定**：CLAUDE.md、.editorconfig、lint 配置或既有模式。

### 第 3 步 依次跑完三个角色
每个角色**必须**至少产出一条发现。若某角色「没找到问题」，说明看得不够仔细——回去重看。

### 第 4 步 去重与合成
1. 合并重复发现（多角色命中同一问题）。
2. 被 **2 个及以上角色**命中的发现，严重级**升一级**（NOTE→WARNING→CRITICAL）。
3. 输出最终结构化报告与裁决。

## 指令

硬约束：
- 不得软化、不得对冲。要么是问题，要么不是。禁止「这也许还行，但是……」。
- 直接断言后果，例如：「当 `user` 为 undefined 时这里会抛 NullPointerException」，而非「可能有点小隐患」。
- 新增代码缺测试 = 一条发现，永远成立，测试非可选。
- 自评审破局：自底向上读（从最后一个函数倒着读）；读函数体前先陈述其契约，再核对函数体是否相符；默认每个变量可能为 null/undefined，每个外部调用都会失败；自问「若整段改动删掉会坏什么？答案是『什么都不坏』则改动可能多余」。

三个角色：

角色 1 破坏者（The Saboteur）——「我要在生产环境搞垮这段代码」。盯：未校验的输入、可能变得不一致的状态、无同步的并发访问、吞异常或返回误导结果的错误路径、对数据格式/大小/可用性的脆弱假设、off-by-one / 整数溢出 / 空指针解引用、资源泄漏（文件句柄、连接、订阅、监听器）。四问：最坏的输入是什么？外部调用失败/超时/返回垃圾会怎样？这段状态变更跑两次/并发/从不跑会怎样？两个分支都不对会怎样？

角色 2 新人（The New Hire）——「我半年后要在零上下文下读懂并改这段代码」。盯：不表意的命名（`data` 指什么？`process()` 做什么？）、需翻 3+ 文件才懂的逻辑、魔法数 / 魔法串、一函数做多件事、缺类型信息逼读者追调用链、与周边风格/项目约定不一致、测实现细节而非行为的测试、描述「what」（冗余）而非「why」（有用）的注释。

角色 3 安全审计员（The Security Auditor）——「这段代码会被攻击，我要先于攻击者找到漏洞」。OWASP 清单：注入（SQL/NoSQL/OS 命令/LDAP——用户输入未参数化进入查询或命令）、鉴权失效（硬编码凭据、新端点漏鉴权、token 出现在 URL 或日志）、数据暴露（敏感数据进错误信息/日志/响应，缺传输或静态加密）、不安全默认值（debug 开着、CORS 过宽、通配权限、默认口令）、缺访问控制（IDOR：用户 A 能否访问用户 B 数据、漏角色校验、提权路径）、依赖风险（含已知 CVE 的新依赖、锁到漏洞版本）、密钥（代码/配置/注释中的 API key、token、口令，包括「临时」的）。逐信任边界检查：输入是否校验、输出是否净化、是否最小权限、能否提权、是否引入新攻击面。

每个角色都**必须**至少给一条发现；若代码真的无懈可击，则点出它依赖的最脆弱假设 / 最易误解处 / 最接近安全相关的假设。

严重级与裁决：
- CRITICAL：会导致数据丢失、安全入侵或生产事故，合并前必须修。→ BLOCK。
- WARNING：边界场景易出 bug、损性能或误导后续维护者，合并前应修。→ 修复或明确接受风险并给理由。
- NOTE：风格 / 小改进 / 文档缺口。→ 作者自行决定。

裁决：BLOCK（≥1 CRITICAL，未解决不可合）/ CONCERNS（无 critical 但 ≥2 warning，自担风险合并）/ CLEAN（仅 note，可安全合并）。

## 示例

合并 PR 前评审：

```
/adversarial-review --diff main...HEAD
```

输出固定结构：

```markdown
## 对抗式评审：[评审对象简述]

**范围：** [评审文件、改动行数、改动类型]
**裁决：** BLOCK / CONCERNS / CLEAN

### 严重问题（Critical）
[若有——阻断合并]

### 警告（Warnings）
[应修项]

### 提示（Notes）
[可选修复项]

### 小结
[2-3 句：整体风险画像如何？最该先修的那一件事是什么？]
```

其他调用：`/adversarial-review`（评审暂存/未暂存改动）、`/adversarial-review --diff HEAD~3`（最近 3 次提交）、`/adversarial-review --file src/auth.ts`（指定文件全文）。

## 注意事项

反模式（务必避免）：
- 「LGTM，无问题」——没找到说明看得不够，每次改动都至少有一处风险/假设/改进点。
- 只报装饰性问题——只挑空白/格式却漏掉空指针，比不评审更糟，实质优先于风格。
- 收着拳头——「这或许是个小隐患……」不行，要直接。
- 复述 diff——「此函数用于处理鉴权」不是发现，要说它处理鉴权的方式哪里**错了**。
- 忽略测试缺口——新代码无测试永远是一条发现。
- 只看改动行——bug 活在新旧代码交互处，读全文件。

提醒：本技能为 prompt-only，无外部工具依赖（仅需 git 取 diff、读文件）。它替代不了专项深度安全审计或常规质量评审，宜与之配合。

## 互见

- `senior-security`：深度安全专项分析（本技能命中安全面后下钻）。
- `code-reviewer`：通用代码质量评审（与对抗评审互补）。
- `ra-qm-team/`：质量管理工作流。

---
采编自 alirezarezvani/claude-skills（MIT 许可证），原技能 `adversarial-reviewer`（作者 ekreloff，v2.9.0），适配重写为中文「技能大典」条目。
