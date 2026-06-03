---
name: smb-payroll-cash-planner
title: 小微企业发薪现金筹划
description: 当小微企业主在发薪日前要确认现金是否够发工资、需先做现金预测再决定要不要催收逾期账款时使用；做"先预测现金缺口、再排序逾期发票并草拟催款"的两段式流水线，产出 30/60/90 天现金预测+缺口判定、按金额×逾期天数×付款历史排序的催款草稿、发薪前后现金头寸预估；不适用于正式记账做账、出审计/税务结论、未经业主逐条批准就发催款或对外承诺预测；触发词：发薪、现金预测、逾期发票催收、payroll、cash flow、invoice chase
domain: 商业/finance
triggers: [发薪, 现金预测, 逾期发票催收, 现金缺口, payroll, cash flow forecast, invoice chase, 发薪日现金, AR催收, 付款提醒]
tags: [商业, finance, 小微企业, 现金流, 应收账款, 发薪, 催收, quickbooks, paypal]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [QuickBooks, PayPal, Stripe, Square, CSV, XLSX]
requires: []
related: [smb-cash-flow-forecast, smb-business-pulse, account-reconciliation, cfo-financial-advisor]
combines_with: [smb-cash-flow-forecast, smb-quarterly-business-review]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
# 小微企业发薪现金筹划

> 采编自 anthropics/knowledge-work-plugins（small-business/plan-payroll，Apache-2.0），适配重写。

## 何时使用

小微企业主临近发薪日，想先确认账上现金够不够发工资；若有缺口，再有节奏地催收逾期账款来补上。本技能把两个子流程串成一条"发薪信心"流水线：先**现金预测**，再**逾期催收**，每一步交接都由业主拍板。

**不该用**的边界：
- 不做正式记账/做账，不出审计、税务或合规结论（那些走 `month-end-close-manager` / `account-reconciliation`）。
- 不做战略融资建模、跑道/单位经济（走 `cfo-financial-advisor`）。
- 未经业主明确批准，**绝不**对外发送任何催款、**绝不**把预测当作权威定论对外承诺。
- 没有连接器也没有 CSV 数据时，不要凭空编造应收/应付数字。

## 步骤 / 指令

解析参数：
- `--horizon`（默认 `30`）——预测窗口天数，取 `30` / `60` / `90`。
- `--payroll-date`（可选）——发薪日；缺省取**下一个周五**。

核心约束：**每个交接点都要业主显式确认**，没拿到批准就停在草稿态。

### 第 1 步 · 现金预测（对应上游 cash-flow-snapshot）

1. 从已连接的 QuickBooks / PayPal / Stripe / Square 拉取**应收 AR、应付 AP、历史现金到账时点**；无可用连接器则回退到 **CSV 上传**。
2. 叠加已知固定支出（房租、工资、周期性供应商账单）。
3. 按 `--horizon` 产出 **30/60/90 天现金预测**，附**百分比方差置信带**。
4. 标注具名风险，例如："5 月 15 日发薪在中位预测下比固定成本底线低 4,200 美元"。
5. 交付：对话摘要 + 可下载 **XLSX**。
6. 呈交业主，等待显式"好，看看能收回多少"再进第 2 步。
7. 若预测显示发薪现金充裕，主动问业主：是否仍要追逾期发票，还是就此打住。

### 第 2 步 · 逾期催收（对应上游 invoice-chase）

> 仅在第 1 步获批后触发。

1. 从 QuickBooks 与 PayPal 拉取逾期发票。
2. 按 **金额 × 逾期天数 × 客户付款历史** 排序。
3. 逐条草拟催款，语气匹配客户画像：优质客户用**温和**款，惯性拖欠用**坚决**款。
4. 草稿去向分流：PayPal 开具的发票 → **PayPal 发送草稿**；非 PayPal 发票 → **邮件草稿**。
5. 呈交排序清单 + 催款草稿，并展示"若前 N 笔在窗口内回款"的现金影响——能否补上第 1 步算出的发薪缺口？
6. 等待业主逐条"发这条"（或批量批准）后才推送。

### 审批闸门（硬性）

- 未获业主批准，绝不发催款——只停留在草稿。
- 未经业主签字，绝不把预测当作权威定论。
- 任一连接器不可达（QuickBooks / PayPal / 邮件）：**停**，报告是哪个连接器失败，询问业主：重试、回退到 CSV、还是中止。

### 收尾输出

以一段话复盘：预测判定（**覆盖 / 缺口 / 风险**）、已发出哪些催款及对象、若催款转化后的**新现金头寸预估**。

## 示例

```text
# 默认：30 天窗口、下周五发薪
plan-payroll

# 60 天窗口、指定发薪日
plan-payroll --horizon 60 --payroll-date 2026-06-15
```

第 1 步典型风险标注：
```text
预测判定：缺口
- 6/15 发薪（中位预测）比固定成本底线低 $4,200
- 置信带：±18%（基于近 90 天到账时点方差）
建议：进入第 2 步，目标在窗口内回款 ≥ $4,200
```

第 2 步排序清单（节选）：
```text
排名  客户        金额     逾期   历史      草稿去向     语气
1     Acme Co.   $3,100   42天   常拖欠    PayPal草稿   坚决
2     Beta LLC   $1,800   12天   一向准时  邮件草稿     温和
> 若前 2 笔在 30 天内回款：+$4,900 → 覆盖发薪缺口
```

## 注意事项

- **人在回路是第一原则**：预测不签字不算数、催款不批准不外发；遇连接器失败先停下报告再问处置，不要自作主张回退或重试。
- 预测必须带方差置信带和具名风险，别只给一个点估值，避免业主误以为是确定值。
- 催款语气要按客户付款历史区分，对优质客户用错语气会伤客情。
- CSV 回退路径要保证：无连接器也能跑完第 1 步，但要明确告知数据来源与口径。
- 货币、税费、地区差异以源数据为准，本技能不替业主做记账或税务判断。

## 互见
- related：`cfo-financial-advisor` —— 需要战略级现金跑道/融资建模时升级到它
- related：`financial-statements-generator` —— 需要规范财报而非现金快照时
- related：`budget-variance-analysis` —— 想把预测 vs 实际拆成量价动因时
- related：`customer-response-drafter`、`cold-email-writer` —— 催款文案需要更精细打磨时
- combines_with：`month-end-close-manager` —— 月结期把现金筹划纳入期末闭环
- 上游子流程：`cash-flow-snapshot`（现金预测）、`invoice-chase`（逾期催收）尚未单独适配；如后续落地，应改挂为 requires。
