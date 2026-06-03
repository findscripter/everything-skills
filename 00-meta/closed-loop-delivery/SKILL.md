---
name: closed-loop-delivery
title: 验收标准闭环交付
description: 当编码/修复任务须对照明确验收标准（DoD）端到端完成、且要少让用户在实现-评审-部署-验证各环节反复插手时使用；做法是把需求转成可测标准，按「实现→本地验证→PR评审回合→dev部署+运行时取证→凭证化判定」闭环推进，产出含通过/未通过清单与运行时凭证的交付报告；不适用于纯问答、未批准的生产部署、缺密钥/权限的被阻塞任务。触发词：闭环交付、对照验收标准、DoD、跑测再部署、复查PR评论
domain: 通用/thinking
triggers: [闭环交付, closed-loop delivery, 验收标准, DoD, Definition of Done, 端到端完成, 跑测再部署, 复查PR评论, PR评审回合, dev部署验证, 运行时取证, 凭证化完成]
tags: [交付流程, 验收标准, 自主执行, PR评审, 部署验证, 运行时验证, 通用]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [structured-decision-framework, pre-deploy-checklist, code-reviewer, deployment-engineer, webapp-testing]
combines_with: [github-pr-comment-resolver, pre-deploy-checklist, ci-cd-pipeline-builder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
# 验收标准闭环交付

## 何时使用

核心原则：**对照 DoD（Definition of Done）交付，而不是对照代码改动量交付。** 一个任务在验收标准被「证据」验证之前，都视为未完成——仅仅改了代码不算完成。

适用：

- 用户给出编码/修复任务，并期望**端到端**完成（不只是改完代码就交差）。
- 任务跨越多个环节：代码 + 测试 + PR 评论 + dev 部署 + 运行时检查。
- 想避免「现在去测一下」「现在去部署」「现在再看下 PR」这类反复的人工催促。

不该用（负边界）：

- 纯问答 / 纯解释类请求——没有要交付的可验证产物。
- 未经**明确人工批准**的生产（prod）/预发（staging）部署请求。
- 被缺失的密钥、账号权限阻塞、且无法合理推断的任务——先升级求助，不要硬闯。

## 步骤

### 0. 执行前先定义一次（Required Inputs）

执行前一次性确定：**任务目标**、**验收标准（DoD）**、**目标环境**（默认 `dev`）、**最大迭代轮数**（默认 `2`）。

- 若缺验收标准：**只追问一次**。用户仍不给，就提出一个具体默认标准并据此推进。
- 优先经过 issue 门禁（参见 `create-issue-gate` 思路）：issue 状态为 `ready`、执行门禁 `allowed` 才继续；状态为 `draft` 时**不要**进入实现/部署/评审循环；开工前要拿到用户提供的、**可测**的验收标准。

### 1. 定义 DoD

把需求转成**可测**标准。示例：结账任务的 DoD =「在 dev 环境，结账接口返回一个有效、可打开的第三方支付 URL」。

### 2. 最小化实现

scope 严格收紧到任务目标，不夹带无关改动。

### 3. 本地验证

先跑**聚焦的测试**（与改动直接相关的用例），需要时再扩大到更广的检查。

### 4. 评审回合（Review loop）

- 拉取 PR 的评论 / review。
- 分类：**有效** vs **无法落地/非问题**。
- 修复有效项，重跑验证。

### 5. dev 部署 + 运行时验证

当运行时行为重要时，部署到 `dev`。通过**真实 API / Lambda / 日志凭证**对照 DoD 验证。

### 6. 凭证化完成判定

只有当**所有** DoD 检查通过时才报告「完成」；否则继续循环，直到通过或触发停止条件。

## 指令

### PR 评论轮询策略（避免噪声短轮询，用批量窗口）

| 回合 | 等待 | 动作 |
|---|---|---|
| 第 1 轮 | `3m` | 收集增量评论 / review |
| 第 2 轮 | `6m` | 再收集增量 |
| 最终轮 | `10m` | 收集此刻所有可见评论 / review |

每一轮内**一次性批处理所有新评论**，不要每来一条就立刻重新轮询。`10m` 轮之后停止等待，按当时可见的全部评论推进。若 CI 仍在跑，把轮询对齐到 check 完成边界，而非固定快轮询。

### 人工门禁（必须征求确认）

以下情形必须先拿到用户**明确确认**：

- 超出约定范围的生产 / 预发部署；
- 破坏性操作（改写历史、force push、毁数据操作）；
- 影响计费 / 安全态势的动作；
- 仓库 / 运行时中不存在的密钥值；
- 会实质改变结果的歧义 DoD。

### 迭代 / 停止条件

出现以下情况，停止并给出简明阻塞报告：

- 达到最大轮数（默认 `2`）后 DoD 仍未通过；
- 外部依赖阻塞（厂商宕机、缺凭证、账号权限不足）；
- 评审意见相互冲突、无法同时满足。

**升级报告须含**：已通过的、未通过的、**证据**（命令/日志/API 结果）、需要用户做出的**最小决策**。

### 输出契约（Output Contract）

声明完成时，**始终**附上：

- 验收标准清单（逐条 pass/fail）；
- 跑过的命令 / 测试；
- 运行时凭证（接口 / Lambda / 日志的关键行）；
- PR 状态（新增的、可落地的评论数）。

**没有证据，不得声称成功。**

## 示例

任务：「修复结账接口，返回可用的第三方支付链接。」

闭环执行（节选）：

```
DoD：dev 环境下 POST /checkout 返回的 payment_url 可被打开且指向第三方网关

1 实现：修正 gateway 回调参数拼接（最小改动，仅 1 文件）
3 本地验证：pytest tests/test_checkout.py::test_payment_url  → PASS
4 评审回合（3m 窗口）：1 条有效评论「URL 未做签名校验」→ 修复并重跑测试 PASS；
                       1 条非问题评论「建议改命名」→ 记录，不阻塞
5 dev 部署 + 运行时取证：
   curl -s $DEV/checkout -d @order.json | jq .payment_url
   → "https://pay.thirdparty.com/session/abc123"（可打开）✔
   Lambda 日志关键行：[checkout] gateway 200 session=abc123

完成判定（输出契约）：
  ✅ DoD：dev 下返回有效可打开的支付 URL —— PASS
  命令/测试：pytest …test_payment_url、curl 运行时验证
  运行时凭证：payment_url=…abc123（200）、Lambda 日志 session=abc123
  PR 状态：新增可落地评论 0 条 → 报告「完成」
```

## 注意事项

- **DoD 优先于 diff**：改了代码 ≠ 完成；唯一的完成标志是验收标准被证据验证。
- **凭证不可省**：声明成功必须带运行时证据（接口返回 / 日志关键行），禁止「看起来应该好了」式无证交付。
- **批量轮询不抖动**：用 3m/6m/10m 窗口批处理 PR 评论，别每条评论立即重新轮询，徒增噪声与等待。
- **守住人工门禁**：prod/staging 部署、破坏性操作、计费/安全变更、缺失密钥——一律先问，不要自作主张。
- **到点就升级**：达最大轮数仍失败、或被外部依赖阻塞时，给出「已过/未过/证据/最小决策」四段式阻塞报告，而非无限循环。
- 本技能只在任务清晰匹配上述范围时使用；其产出不替代针对具体环境的验证、测试或专家评审。缺输入/权限/安全边界/成功标准时，停下来澄清。
- 关于分类坐标：本技能本质是一套**交付流程纪律**（偏 misc/流程），但 `00-meta` 卷受控类集仅含 thinking/research/communication/learning，故 domain 归入 `通用/thinking` 以通过生成器校验；如后续放开 misc 类可改回。

## 互见

- related：`structured-decision-framework`（把完成/终止标准沉淀为可追溯决策记录）、`pre-deploy-checklist`（部署前自检）、`code-reviewer`（评审回合的具体执行）、`deployment-engineer`、`webapp-testing`（运行时验证手段）。
- combines_with：`github-pr-comment-resolver` —— 在「评审回合」批量拉取并分类处理 PR 评论；`pre-deploy-checklist` —— dev 部署前过一遍门禁；`ci-cd-pipeline-builder` —— 把轮询对齐到 CI check 完成边界。

---

采编自 sickn33/antigravity-awesome-skills（MIT 许可证）。
