---
name: account-reconciliation
title: 账户对账核对
description: 当做月结/期末对账，需把总账（GL）余额与子分类账、银行对账单或往来方数据核对一致时使用；做银行对账、GL-子账核对、关联方往来对账，产出调节表+调节项分类+账龄/升级清单；不适用于出具审计意见/财务建议，及只算单期账不做两方比对；触发词：对账、银行对账、调节表、GL对子账、往来对账、reconciliation
domain: 商业/copy
triggers: [对账, 银行对账, 调节表, GL对子账, 往来对账, reconciliation, bank reconciliation, 调节项, intercompany]
tags: [finance, accounting, reconciliation, month-end-close, bank-reconciliation, intercompany]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [sql, python, pandas, excel]
requires: []
related: [gl-subledger-reconciler, month-end-close-manager, journal-entry-preparer, variance-flux-commentary]
combines_with: [month-end-close-manager, financial-statements-generator, sox-control-testing]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
＜frontmatter 建议＞name: account-reconciliation｜title: 账户对账核对｜domain: 商业/misc（已定）｜status: stable｜agents: [claude-code, codex, cursor, gemini-cli]｜license: Apache-2.0｜source: anthropics/knowledge-work-plugins｜source_license: Apache-2.0｜related: [variance-flux-commentary, cfo-financial-advisor, startup-financial-modeler, billing-automation-systems]｜combines_with: [variance-flux-commentary, board-deck-builder]

# 账户对账核对

> 重要：本技能仅辅助对账流程，不提供财务/审计意见。所有对账在签字定稿前须经合格财务人员复核。

## 何时使用

- 月结/期末，需把总账（GL）某科目余额与外部口径核对到一致：银行对账单、子分类账、或关联方往来余额。
- 三类典型对账：
  - GL ↔ 子分类账（应收/应付/固定资产/存货/预付/计提）
  - 银行对账（GL 现金 ↔ 银行对账单）
  - 关联方往来对账（A 对 B 的应收 ↔ B 对 A 的应付，合并应抵销为零）
- 触发词：对账、银行对账、调节表、GL对子账、往来对账、reconciliation。

不该用的边界：

- 只算单期账、不做两方（GL vs 外部口径）比对 → 那是出报表，不是对账。
- 需要出审计意见、财务建议或税务/合规结论 → 超出本技能。
- 拿不到外部口径数据（银行单/子账明细/对方往来余额）→ 不要硬凑平，先标"待取数"。
- 解释损益科目"为什么波动" → 用 `variance-flux-commentary`，不是对账。

## 步骤 / 指令

```
1. 锁定口径
   - 两方余额取同一截止日、同一币种/汇率口径、同一 scope。
   - GL 侧拉控制科目余额；外部侧拉对应明细（子账试算表/银行单/对方往来）。

2. 按对账类型比对
   A) GL ↔ 子分类账
      - 比总额；实时过账时应相等。
      - 不等则查：手工凭证只入 GL 未入子账 / 子账未接口到 GL /
        批量过账时间差 / GL 重分类未同步子账 / 接口或过账失败。
   B) 银行对账：两侧各自调到"调整后余额"，差额须为 0
   C) 关联方：逐对实体比对，差异多源于一方已记一方未记、汇率不同、
      分类错（往来 vs 第三方）、争议/未核销款、截止日口径不同。

3. 把调节项分类（决定要不要做账）
   - 类1 时间差：本身会自然清掉，不做调整分录
     （未达账款/在途存款/系统在途/待审批）。预计 1-5 个工作日清。
   - 类2 需调整：做调整分录纠正 GL 或子账
     （未记银行费用/利息、记账错误金额或科目、漏记、分类错）。
   - 类3 需调查：无法立即解释（不明差异/争议项/超期未清/反复出现的
     同类差异）→ 查根因、留痕、未解决则升级。

4. 账龄 + 升级
   - 给每个未清调节项打账龄并按阈值升级（见下表）。
   - 趋势：对比上期总额、是否超重要性阈值、笔数是否逐期增长、有无每期复现项。

5. 定稿
   - 调节表须含：编制人、复核人、日期、每个调节项的清晰说明。
   - 任何无法解释的差额 → 不得关账，必须解决或书面留痕。
```

银行对账标准格式（差额须为 $0.00）：

```
Balance per bank statement:         $XX,XXX
Add: Deposits in transit            $X,XXX     # 在途存款（已记GL，银行未贷记）
Less: Outstanding checks           ($X,XXX)    # 未达支票（已开已记GL，银行未兑付）
Add/Less: Bank errors               $X,XXX
Adjusted bank balance:              $XX,XXX

Balance per general ledger:         $XX,XXX
Add: Interest/credits not recorded  $X,XXX     # 未记利息/贷项
Less: Bank fees not recorded       ($X,XXX)    # 未记银行费用
Add/Less: GL errors                 $X,XXX
Adjusted GL balance:                $XX,XXX

Difference:                         $0.00
```

账龄分桶与升级动作：

| 账龄 | 状态 | 动作 |
|---|---|---|
| 0-30 天 | 当前 | 监控——在正常处理周期内 |
| 31-60 天 | 老化 | 调查——跟进为何未清 |
| 61-90 天 | 逾期 | 升级——通知主管，记录调查 |
| 90+ 天 | 呆滞 | 升级管理层——可能需核销或调整 |

升级阈值（示例，须按本机构重要性水平与风险偏好设定）：

| 触发条件 | 示例阈值 | 升级到 |
|---|---|---|
| 单笔金额 | > $10,000 | 主管复核 |
| 单笔金额 | > $50,000 | 控制人（Controller）复核 |
| 调节项总额 | > $100,000 | 控制人复核 |
| 项目账龄 | > 60 天 | 主管跟进 |
| 项目账龄 | > 90 天 | 控制人/管理层复核 |
| 未平差额 | 任意金额 | 不得关账，必须解决或留痕 |
| 增长趋势 | 连续 3+ 期 | 启动流程改进调查 |

## 示例

银行对账（单位：元）：

```
银行对账单余额:            128,400
加：在途存款                 9,200    # 6/30 入账，银行 7/1 才贷记
减：未达支票               (6,750)   # 已开两张支票，银行未兑付
调整后银行余额:            130,850

GL 现金余额:              131,400
加：未记利息                   60
减：未记银行月费              (610)   # 类2，需做调整分录
调整后 GL 余额:            130,850

差额:                          0.00
```

调节项处置：在途存款/未达支票=类1（时间差，自然清，不做账）；利息+60、月费-610=类2，做调整分录入 GL。

委托提示词（给 Agent 调用时）：
> 给两方余额（GL 侧 + 外部口径，同一截止日/币种/scope）。判定对账类型，逐项算差异，把每个调节项归为：类1时间差（不做账）/类2需调整（出调整分录）/类3需调查（查根因+升级）。出一张两侧调到"调整后余额"的调节表（差额须为 0），并对未清项打账龄、按阈值标升级。取不到外部口径就标"待取数"，禁止硬凑平。

## 注意事项

- 不凑平：差额平不了就如实留差并查因，绝不臆造调节项把账做平。
- 两方务必同口径（截止日/币种汇率/scope），不一致先对齐再比，否则差异失真。
- 职责分离：对账人不应是该科目交易的处理人。
- 跟踪到底：未清项要追到结清，不要无限期结转。
- 反复出现的同类差异是流程问题信号——查根因并修底层流程，别每期手工调。
- 时效：在关账日历内完成（通常期末后 T+3 至 T+5 工作日）；完整性：所有资产负债表科目按既定频率（重要科目月对、次要科目季对）覆盖。
- 留痕完备：每份对账含编制人、复核人、日期、所有调节项说明，并按留存政策保管底稿。
- 本技能不提供财务/审计意见，定稿前须经合格财务人员复核。

## 互见

- related：`variance-flux-commentary`（对账定平后，损益/资产负债科目的波动解释交给它）；`cfo-financial-advisor`（对账暴露的重大异常或呆滞项上升为管理决策时）；`startup-financial-modeler`（核对后的余额作为建模/预测的干净基线）；`billing-automation-systems`（应收对账上游的开票/账单数据来源）。
- combines_with：`variance-flux-commentary`（先对账保证科目余额可信，再做差异说明，构成月结闭环）；`board-deck-builder`（对账结论与升级项汇入董事会/管理层材料）。

---
本条采编自 anthropics/knowledge-work-plugins（Apache-2.0）。
