---
name: recon-break-root-cause
title: 对账差异溯源根因分析
description: 当对账已识别出差异行（break）、需顺审计轨迹追到双方源头交易/分录并给出根因结论时使用；做 GL 侧与子账侧逐属性比对，产出一句话根因陈述+归属方+预计清账日+处置动作（JSON）；不适用于做账过调整分录、首次发现并分类差异、或拿不到双方源数据；触发词：对账差异溯源、break 根因、调节项追根、GL 子账差异、timing/FX/mapping/duplicate
domain: 商业/finance
triggers: [对账差异溯源, break 根因, 调节项追根, GL 子账差异, 差异归因, root cause break, timing break, FX break, mapping break, duplicate post]
tags: [finance, reconciliation, break-analysis, root-cause, general-ledger, subledger, month-end-close]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [sql, python, mcp]
requires: []
related: [gl-subledger-reconciler, account-reconciliation, variance-flux-commentary, month-end-close-manager]
combines_with: [journal-entry-preparer, accrual-schedule-builder, financial-statements-generator]
license: Apache-2.0
source: anthropics/financial-services
source_license: Apache-2.0
---
# 对账差异溯源根因分析

> 重要：本技能只做诊断，不做账。任何调整分录由「过账/解决」环节负责，本技能产出的根因与处置建议须经合格财务人员复核后再据以做账。

## 何时使用

- 对账已跑出一行差异（break），且这行已带有：key、GL 侧值、子账侧值、差异桶（bucket）、初判原因；现在需要把它追到双方的源头交易/分录，给出一句话根因。
- 典型四类根因桶：时间差（timing）、汇率差（FX）、科目映射差（mapping）、重复过账（duplicate）。
- 触发词：对账差异溯源、break 根因、调节项追根、GL 子账差异、root cause break。

不该用的边界：

- 还没跑对账、未识别出差异行 → 先用 `account-reconciliation` 做两方比对并归出 break，再来溯源。
- 只想出调整分录 / 把账做平 → 那是「过账/解决」环节，本技能只诊断不过账。
- 拿不到双方源数据（GL 分录 / 子账交易明细）→ 不要臆断根因，先标「待取数」。
- 想解释损益科目「为什么波动」→ 用 `variance-flux-commentary`，那不是 break 溯源。

## 步骤 / 指令

```
输入：单行 break（key, GL 值, 子账值, bucket, 初判原因）

1. 拉 GL 侧（经 internal-gl MCP）
   取产生该 GL 行的日记账分录/过账：
   entry id、过账日(posting date)、来源系统、batch id、编制人。

2. 拉子账侧（经 subledger MCP）
   取匹配的那笔交易：
   trade id、成交日/交收日(trade/settle date)、对手方(counterparty)、
   来源 feed、所用汇率(FX rate)。

3. 逐属性比对（diff）
   对齐：过账日 · 汇率/汇率日 · 科目映射 · 数量符号 · 金额符号。
   出现差异的那个属性，通常就是根因。

4. 写一句话根因
   句式固定：「⟨哪一方⟩ ⟨做了什么⟩ 因为 ⟨原因⟩」。
   据根因落定 bucket、归属方、预计清账日、处置动作。

5. 输出 JSON（每行 break 一条，见下）。
```

根因桶 → 归属方 / 处置 映射（参考）：

| bucket | 典型根因 | owner | action | 预计清账日 |
|---|---|---|---|---|
| timing | 一方按交收日、另一方按成交日入账 | ops | monitor | T+n 自然清，填日期 |
| FX | 双方取价口径不同（WM/R 4pm vs 收盘价） | accounting | adjust | null（须做账纠正） |
| mapping | 同一证券映射到不同 GL 科目 | reference-data | raise-ticket | null |
| duplicate | 子账把同一笔过账两次 | upstream-system | suppress | null |

## 示例

根因陈述（一句话，照搬句式）：

- "GL 按交收日 T+2 过账，子账按成交日过账——时间差，将于 2026-05-07 自然清账。"
- "子账用 WM/R 下午 4 点价，GL 用 Bloomberg 收盘价——汇率差，基准金额上偏离 12 bps。"
- "证券 ABC123 映射表里对应 GL 科目 11420，子账却喂了 11410——映射差，转参考数据组处理。"
- "子账把同一笔交易过了两次（trade id 88412 与 88419 互为重复）——重复过账，压制 88419。"

每行 break 的输出（JSON）：

```json
{
  "key": "...",
  "root_cause": "上述句式的一句话",
  "owner": "ops | reference-data | accounting | upstream-system",
  "expected_clear_date": "YYYY-MM-DD or null",
  "action": "monitor | adjust | raise-ticket | suppress"
}
```

委托提示词（给 Agent 调用时）：
> 给你一行 break（含 key/GL 值/子账值/bucket/初判）。经 internal-gl MCP 拉 GL 侧分录、经 subledger MCP 拉匹配交易，逐属性比对（过账日/汇率与汇率日/科目映射/数量符号/金额符号），定位差异属性。用「⟨方⟩⟨做了什么⟩因为⟨原因⟩」写一句话根因，并据此填 owner/expected_clear_date/action，按上面的 JSON 结构输出。只诊断，不出调整分录；拿不到任一侧源数据就标待取数，不要臆断。

## 注意事项

- 只诊断不过账：本技能不写调整分录；调整与压制由「过账/解决」环节执行，这是职责分离的硬边界。
- 根因唯一化：一行 break 先归到一个主因桶；多属性同时不一致时，取最能解释金额差的那个，其余作备注。
- 同口径再比：拉双方源数据时确认同一截止日/币种/scope，口径不一致会把差异放大成假根因。
- timing 必须给清账日：判为时间差就要给出预计自然清账日；给不出，说明它其实不是纯时间差，重判。
- 留痕：记录 GL entry id、子账 trade id、batch id、编制人/来源系统，便于复核与审计回溯。
- 复发同类 break 是流程信号：同一 mapping/FX 反复出差异，应回推上游修映射表或取价口径，而非每期手工溯源。

## 互见

- requires：`account-reconciliation`（须先完成两方比对并产出已分类的 break 行，本技能才有溯源对象）。
- related：`journal-entry-preparer`（溯源定为「需调整」后，由它据根因落实调整分录）；`variance-flux-commentary`（损益科目的波动解释另走它，与 break 溯源区分）。
- combines_with：`account-reconciliation`（对账识别+本技能逐行溯源，构成「比对→归因」闭环）；`month-end-close-manager`（把未清 break 的根因与归属并入月结看板，驱动升级与关账判断）。

---
本条采编自 anthropics/financial-services（Apache-2.0）。
