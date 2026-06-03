---
name: security-diff-review
title: 安全导向的差异代码审查
description: 当需要对 PR、提交范围或 diff 做安全向（而非通用）代码审查、且变更触及认证/加密/资金转移/外部调用/权限时使用；做按风险分级、git 溯源、影响面量化、攻击者建模并产出带证据的 markdown 审查报告；不适用于全新无基线代码、纯文档/格式变更或用户只要快速摘要的场景。触发词：差异审查、安全审查、PR 审查、diff review、攻击面
domain: 安全/appsec
triggers: [差异审查, 安全代码审查, PR 安全审查, diff security review, commit 范围审查, 攻击面分析, 影响面/blast radius, 删除的校验/权限代码, 认证加密改动审查, git blame 溯源安全回归]
tags: [安全, 代码审查, diff, PR, 威胁建模, git, misc]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Grep, Glob, Bash]
requires: []
related: [code-reviewer, adversarial-code-reviewer, security-audit-toolkit, sast-configurator]
combines_with: [github-pr-comment-resolver, dependency-auditor]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

适用：
- 要对 **PR / 提交范围 / diff** 做**安全向**审查，而非通用代码评审。
- 变更触及**认证、加密、外部调用、资金/价值转移、权限、输入校验**等高风险逻辑。
- 需要带**代码证据、攻击场景**且落地为**报告文件**的结论。

不该用（改用通用 code review）：
- **全新代码**（无基线可对比）。
- **纯文档** / 注释变更（无安全影响）。
- **格式化 / lint** 等纯外观改动。
- 用户**明确只要快速摘要**并接受风险。

## 步骤

按 `Pre-Analysis → P0 分诊 → P1 代码分析 → P2 测试覆盖 → P3 影响面 → P4 深度上下文 → P5 对抗建模 → P6 报告` 推进，并按代码库规模缩放：

- **SMALL（<20 文件）→ DEEP**：读全部依赖，完整 git blame。
- **MEDIUM（20–200）→ FOCUSED**：1 跳依赖，优先高风险文件。
- **LARGE（200+）→ SURGICAL**：只看关键路径。

风险分级（按风险而非体量，Heartbleed 仅 2 行）：
- **HIGH**：认证、加密、外部调用、价值转移、**移除校验**。
- **MEDIUM**：业务逻辑、状态变更、新公开 API。
- **LOW**：注释、测试、UI、日志。

## 指令

核心原则：
1. **风险优先**：先盯认证/加密/转移/外部调用。
2. **证据驱动**：每条结论附 git 历史、行号、攻击场景。
3. **诚实**：显式说明覆盖范围与置信度，未覆盖处直说。
4. **必产物**：始终生成完整 markdown 报告文件，**不要只发到聊天**。

红线（命中即升级，需对抗分析，即便快速分诊也不可跳过）：
- 从 "security" / "CVE" / "fix" 提交中**移除**的代码。
- 访问控制收紧符被移除（如 `onlyOwner`、`internal → external`）。
- **删除校验且无替代**。
- 新增外部调用且无检查。
- 高影响面（50+ 调用方）+ HIGH 改动。

反话术（别给自己找借口跳步）：
- "小 PR 随便看看" → 按风险分级，不按体量。
- "我熟这库" → 熟悉滋生盲区，建显式基线。
- "git 历史太慢" → 历史揭示回归，**永不跳过 P1**。
- "只是重构无安全影响" → 重构会破坏不变量，先按 HIGH 处理直到证伪。
- "口头说一下就行" → 无产物 = 结论丢失，必写报告。

交付前清单：
- [ ] 所有变更文件已分析
- [ ] 对删除的安全代码做了 git blame
- [ ] HIGH 改动算了影响面（量化，别凭感觉）
- [ ] 攻击场景具体（非套话），引用了行号 + 提交
- [ ] 报告文件已生成，并向用户给出摘要

## 示例

快速分诊（小 PR）：
```
输入：5 文件 PR，2 个 HIGH 文件
策略：仅用风险分级速查
1. 逐文件定级（2 HIGH / 3 LOW）
2. 只深挖 2 个 HIGH
3. git blame 被删代码
4. 出精简报告
约 30 分钟
```

标准审查（中型库）：
```
输入：80 文件，12 处 HIGH
策略：FOCUSED
1. HIGH 文件走完整流程
2. MEDIUM 表面扫描
3. 跳过 LOW
4. 全节报告
约 3–4 小时
```

深度审计（大型关键改动）：
```
输入：450 文件，认证系统重写
策略：SURGICAL
1. 先建基线上下文
2. 仅对认证改动深析
3. 影响面分析 → 对抗建模
4. 完整报告
约 6–8 小时
```

## 注意事项

- 先对**被删除代码** git blame，再算影响面以排优先级。
- 攻击场景要**具体可复现**，落到行号与提交哈希。
- 时间不足时**别声称做了全量分析**；缺测试视为风险升级项，写进报告并提级严重度。
- 本技能不替代环境内的实测、验证或专家复核；输入/权限/边界/成功标准缺失时**先停下来澄清**。
- 可衔接「问题书写」类技能把结论转为正式审计报告，例如 `issue-writer --input REPORT.md --format audit-report`（命令名以你环境的实际工具为准）。

## 互见

- 通用代码评审 / `/code-review`、`/review`：非安全向场景的替代。
- `/security-review`：对当前分支待提交改动做安全复核。
- 审计上下文构建类技能：用于 Pre-Analysis 基线与 P4 深度上下文。

---

采编自 sickn33/antigravity-awesome-skills（MIT）。
