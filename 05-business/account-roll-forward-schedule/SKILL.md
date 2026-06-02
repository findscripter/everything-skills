---
name: account-roll-forward-schedule
title: 科目滚动结转表
description: 当月结/期末或审计支持需为资产负债表某科目编制"期初余额+本期活动-冲回=期末余额"的滚动结转表，且每行都要勾稽到 GL 时使用；做分项结转表+逐行"勾稽来源"取证+合计校验（footing），产出可追溯的关账底稿；不适用于损益波动解释、两方对账、出审计/财务意见；触发词：滚动结转、roll-forward、期初到期末、关账底稿、勾稽、footing
domain: 商业/finance
triggers: [滚动结转, roll-forward, rollforward, 期初到期末, 关账底稿, 勾稽, footing, 科目结转表, 余额连续性, tie out]
tags: [finance, accounting, month-end-close, roll-forward, audit-support, gl-tie-out]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [sql, excel, internal-gl-mcp]
requires: []
related: [gl-subledger-reconciler, account-reconciliation, accrual-schedule-builder, month-end-close-manager]
combines_with: [variance-flux-commentary, journal-entry-preparer]
license: Apache-2.0
source: anthropics/financial-services
source_license: Apache-2.0
---
# 科目滚动结转表

> 重要：本技能仅辅助编制结转底稿，不提供财务/审计意见。底稿在签字定稿前须经合格财务人员复核。

## 何时使用

- 月结/期末关账或审计支持，需为某资产负债表科目（或科目组）证明"期初余额经本期活动后等于期末余额"，且每一行都能勾稽回 GL。
- 输入三要素：科目（或科目组）、主体（entity）、期间（period）。
- 典型科目：计提（accruals）、预付、应收/应付、固定资产、租赁负债、准备金等需要展示余额连续性的科目。
- 触发词：滚动结转、roll-forward、期初到期末、关账底稿、勾稽、footing。

不该用的边界：

- 解释损益科目"为什么波动" → 用 `variance-flux-commentary`，不是结转表。
- 把 GL 余额与外部口径（银行单/子账/往来）核对到一致 → 那是对账，用 `account-reconciliation` / `gl-subledger-reconciler`。
- 出审计意见、财务建议、税务/合规结论 → 超出本技能。
- 合计校验不平（unexplained delta）→ 不要"插值凑平"（plug），如实暴露该差额。

## 步骤 / 指令

```
1. 取期初余额（Beginning）
   - 取上期关账底稿的期末余额，或上期期末日的 GL 余额。

2. 逐项拉本期活动，每行各一条 GL 查询
   - 每个活动行 = 一条 GL 查询（科目 + 日期区间 + 凭证来源/journal-source 过滤），
     经 internal-gl MCP 执行。
   - 必须在该行的"勾稽来源"列写明所用查询（可复跑、可追溯）。

3. 取期末余额（Ending）
   - 取期末日的 GL 余额。

4. 合计校验（footing），必须满足：
   X + A + B − C − D + E + F = Y
   - 不等时，差额即"未解释项"——暴露它，不要凑平（do not plug）。
     去查根因、留痕，未解决则升级，不得据此关账。

5. 定稿
   - 输出结转表 + 每行"勾稽来源"列（GL 查询或支持文档）
     + footing 校验结果（pass/fail，及差额，若有）。
```

标准结转表结构（X 期初 → Y 期末）：

```
Beginning balance (per prior-period close)      X
  + Additions / new activity                    A   # 新增/本期新活动
  + Accruals booked this period                 B   # 本期计提
  − Reversals of prior accruals                (C)  # 冲回前期计提
  − Payments / settlements                     (D)  # 付款/结算
  ± Reclasses / adjustments                     E   # 重分类/调整
  ± FX translation                              F   # 外币折算
Ending balance (per GL at period end)           Y
```

逐行勾稽口径：

| 行 | 勾稽来源（ties to） |
|---|---|
| 期初 Beginning | 上期关账底稿，或上期期末日 GL 余额 |
| 各活动行 A/B/C/D/E/F | 一条 GL 查询（科目+日期区间+凭证来源过滤），经 internal-gl MCP，**在表中引用该查询** |
| 期末 Ending | 期末日 GL 余额 |

核心约束：表必须勾平（must foot）`X + A + B − C − D + E + F = Y`。不平的差额是未解释项——**暴露它，不要凑平**。

## 示例

某计提科目，主体 ENT-01，期间 2026-05（单位：元）：

```
期初余额（上期关账底稿）              120,000   # 勾稽：2026-04 关账底稿 p.5
+ 本期计提                            45,000   # 勾稽：GL 查询 acct=2105, 5/1–5/31, src=ACCRUAL
− 冲回前期计提                       (38,000)  # 勾稽：GL 查询 acct=2105, 5/1–5/31, src=REVERSAL
− 付款/结算                          (12,000)  # 勾稽：GL 查询 acct=2105, 5/1–5/31, src=AP-PMT
± 重分类                               1,000   # 勾稽：JE-2026-0512
期末余额（期末日 GL）                 116,000   # 勾稽：GL 余额 acct=2105 @ 5/31

footing：120,000 + 45,000 − 38,000 − 12,000 + 1,000 = 116,000 ✓ pass
```

委托提示词（给 Agent 调用时）：
> 给定科目（或科目组）、主体、期间，编制滚动结转表证明期初勾到期末。期初取上期关账底稿或上期期末 GL 余额；每个活动行各跑一条 internal-gl MCP 的 GL 查询（科目+日期区间+凭证来源过滤）并在"勾稽来源"列引用该查询；期末取期末日 GL 余额。最后做 footing 校验 X+A+B−C−D+E+F=Y，输出 pass/fail 与差额。差额不平禁止 plug，如实标为未解释项并升级。

## 注意事项

- 不凑平（do not plug）：合计不平就如实留差、查根因、升级，绝不臆造调节项把表做平；未解释差额存在时不得关账。
- 逐行可追溯：每个活动行都要引用具体 GL 查询（科目+日期区间+凭证来源过滤），底稿要能被独立复跑验证。
- 期初口径一致：期初余额须与上期关账底稿的期末余额接续，断点本身就是问题信号。
- 凭证来源过滤是关键：用 journal-source 把计提/冲回/付款/重分类分开拉，避免把不同性质的活动混进同一行。
- 留痕完备：结转表含编制人、复核人、日期、每行勾稽说明，并按留存政策保管底稿。
- 本技能不提供财务/审计意见，定稿前须经合格财务人员复核。

## 互见

- requires：`month-end-close-manager`（结转表是月结关账流程的标准底稿之一，先有关账编排再产出本表）。
- related：`account-reconciliation`（对账把 GL 核到外部口径，结转表证明 GL 自身余额连续，两者互补不重叠）；`gl-subledger-reconciler`（GL 与子账明细的取数/核对上游）；`variance-flux-commentary`（结转后若需解释余额波动的"为什么"交给它）；`journal-entry-preparer`（结转中发现需调整时产出调整分录）。
- combines_with：`financial-statements-generator`（勾平后的科目余额汇入财报）；`sox-control-testing`（结转底稿与 footing 证据作为关账控制的测试样本）。

---
本条采编自 anthropics/financial-services（Apache-2.0）。
