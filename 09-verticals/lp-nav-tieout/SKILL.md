---
name: lp-nav-tieout
title: LP 对账单与基金 NAV 勾稽
description: 当 LP 资本账户对账单分发前、需以期末 NAV 包为准独立复核时使用；做逐行重算 LP 资本账户、按 0.01 容差比对并产出每行通过/失败标记与差异归因清单；不适用于直接改写对账单、生成 NAV 包本身或撰写 LP 报告。触发词：NAV勾稽、对账单复核、资本账户、LP对账、tie-out
domain: 领域/fintech
triggers: [NAV勾稽, 对账单复核, 资本账户重算, LP对账, tie-out, 瀑布分配核对, 基金NAV核对]
tags: [fintech, 私募基金, 对账, 审计, NAV, LP]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [nav-mcp]
requires: []
related: [account-reconciliation, gl-subledger-reconciler, recon-break-root-cause, pe-returns-sensitivity]
combines_with: [recon-break-root-cause, gl-subledger-reconciler]
license: Apache-2.0
source: anthropics/financial-services
source_license: Apache-2.0
---
# LP 对账单与基金 NAV 勾稽

将一份已生成的 LP（有限合伙人）对账单与本期基金 NAV 包（通过 nav MCP 获取）逐行勾稽：独立重算该 LP 的资本账户，标记任何不一致的行。

> **被测对象是「生成的对账单」，NAV 包是事实来源（source of truth）。** 切勿用对账单去校验自己。

## 何时使用

- 在 LP 对账单分发给投资人**之前**做最后独立复核。
- 已拿到「生成的对账单」+ 同期「NAV 包」（可经 nav MCP 拉取分项数据）。

**不该用的边界：**
- 不负责生成对账单或 NAV 包本身——本技能只比对、不创作。
- 不直接改写对账单：只产出 flags，由发布方（publisher）复核后行动。
- 缺少 NAV 包或承诺出资登记册（commitment register）等事实来源时，不要凭对账单自洽推断。

## 步骤 / 指令

### 1. 重算 LP 资本账户

按下式独立重算，每个输入项均从 NAV 包提取（LP 承诺出资占比、基金层 P&L 分项、费用与开支合计、瀑布分配产出）：

```
期初资本 (Beginning capital，取上期对账单期末)
  + 实缴出资 (Contributions，本期已缴 capital call)
  − 分配 (Distributions，现金 + 实物 in-kind)
  + 已分摊净收益/(损失) (Allocated net income / (loss))
      = LP% × (已实现 + 未实现 P&L − 管理费 − 基金开支)
  − 附带权益分配 (Carried interest，若本期 crystallized)
期末资本 (Ending capital)
```

### 2. 逐行比对

- 对账单每一行 vs. 你重算值；**容差 `0.01`**。
- 每处不符，标明是哪个输入项驱动的差异。例：「allocated P&L 不符——对账单用 12.40% 占比，NAV 包经 Q1 转让后为 12.38%」。

### 3. 附加交叉校验

- 本期对账单**期末资本** = 下期草稿**期初资本**（若有下期草稿）。
- 所有 LP 期末资本之和 = 基金 NAV（含舍入误差内）。
- 承诺出资（commitment）、未出资（unfunded）、可回拨（recallable）三项 = 承诺出资登记册。

### 4. 产出

每行 pass/fail；重算值与对账单值并列；以及 flags 清单。**不要编辑对账单**——复核后由发布方依 flags 处理。

## 示例

差异 flag 的最小表述：

```
LINE: 已分摊净收益
  statement = 248,300.00
  recomputed = 247,900.40
  delta = 399.60  (> 容差 0.01) → FAIL
  driver: 占比口径不一致——对账单 12.40%，NAV 包 Q1 转让后 12.38%
```

期末资本交叉校验：

```
Σ(各 LP 期末资本) = 412,805,118.07
fund NAV (NAV 包)  = 412,805,118.10
delta = 0.03  → PASS（舍入范围内）
```

## 注意事项

- **方向不可反**：永远以 NAV 包为基准核对账单，不能反过来。
- 容差严格按 `0.01`；勿因「接近」放过——明确区分舍入误差与口径错误。
- 占比/瀑布类差异常源于期内 LP 份额转让（transfer）或 crystallization 时点，归因时优先排查这两类。
- 只读不写：任何修改由发布方在复核 flags 后执行，本流程产出仅为审计证据。
- 涉及投资人资金与合规分发，重算口径需与基金 LPA / 会计政策一致。

## 互见

- related：`fintech` 域内 NAV 包生成、瀑布分配（waterfall）计算类技能
- combines_with：承诺出资登记册核对、对账单生成流程——前者提供 commitment/unfunded/recallable 事实源，后者提供被测对账单

---

采编自 [anthropics/financial-services](https://github.com/anthropics/financial-services)（statement-auditor / nav-tieout，Apache-2.0），适配重写为中文可执行条目。
