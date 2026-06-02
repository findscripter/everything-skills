---
name: smb-cash-flow-forecast
title: 小微企业现金流预测（30/60/90 天）
description: 当小微企业主问"能否发出工资/还剩多少跑道/会不会现金断流"、要做 30/60/90 天现金流预测时使用；从 QuickBooks/PayPal/Stripe/Square 或 CSV 读取 AR/AP 与固定成本，按各客户历史回款时滞与方差算预期流入流出、带置信区间，输出聊天摘要+可下载 XLSX 并点名风险；不适用于正式做账报税、财报审计或上市公司估值建模。触发词：现金流预测、能不能发工资、现金跑道、现金断流、cash crunch、runway
domain: 商业/finance
triggers: [现金流预测, 30/60/90 天, 能不能发工资, 现金跑道 runway, 现金断流 cash crunch, 回款时滞, AR AP 应收应付, 小微企业现金, 置信区间, 工资能不能发出]
tags: [商业, finance, 现金流, 现金跑道, 小微企业, 应收应付, 预测, XLSX]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [QuickBooks MCP, PayPal MCP, Stripe MCP, Square MCP, xlsx]
requires: []
related: [smb-payroll-cash-planner, smb-business-pulse, smb-quarterly-business-review, startup-financial-modeler]
combines_with: [cfo-financial-advisor, billing-automation-systems, financial-statements-generator]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
# 小微企业现金流预测（30/60/90 天）

为小微企业生成 30/60/90 天现金流预测：基于各客户**历史回款方差**给出置信区间，并点名具体风险。双产出——简明聊天摘要 + 可下载 XLSX 工作簿。

## 何时使用

用户问这类问题时触发：

- "下个月工资发得出来吗？""还剩多少跑道（runway）？"
- "帮我预测一下现金流""会不会现金断流（cash crunch）？"

**不该用边界**：本技能**只读、不改账**，是预测而非记账。不做正式做账/对账/报税、不出审计级财报、不做上市公司估值建模。交付后须提醒：这只是预测，做融资/借贷决策前请与簿记/会计核实。

## 步骤

### 步骤 1 — 确认可用数据源

按以下顺序探测哪些连接器在线，记录实际用到的源（**影响置信区间宽度**）：

1. **QuickBooks** — AR 账龄、AP、固定成本的主源。
2. **PayPal** — 交易历史与结算时点。
3. **Stripe** — 扣款与打款历史。
4. **Square** — 销售与打款历史。
5. **CSV 上传** — 无任何连接器时的兜底。

都没有且无附件 → 请用户连接数据源或上传 CSV（收入/支出表格，格式宽松）。

### 步骤 2 — 拉取数据

- **QuickBooks**：AR 账龄（客户、发票额、开票日、到期日、逾期天数）；AP（供应商、应付额、到期日）；经常性固定成本（房租、工资、订阅）。
- **PayPal/Stripe/Square**：结算历史（交易日、金额、结算日）；用结算时滞（交易日→打款日）算各源平均与方差。
- **CSV**：按收入/支出表解析，必需列（命名灵活）：date、amount、type(income/expense)、description；列含义不清时**先展示表头让用户确认映射**。

### 步骤 3 — 计算历史回款时滞

对每个 AR 客户（或 CSV 收入源）计算：

- **平均时滞** mean lag — 开票/交易日到实收的平均天数。
- **回款方差** — 最近 6–12 笔回款时滞的标准差，用于定区间宽度。

回款记录 **< 3 笔**：用总体均值作点估计，默认套 **±30%** 区间。CSV 数据若该源历史 **≥ 3 笔**，则**用实际方差算区间，不要默认 ±30%**。

### 步骤 4 — 构建 30/60/90 预测

分三窗口：0–30 天、31–60 天、61–90 天。每窗口算：

| 行 | 方法 |
|---|---|
| 预期流入 | 落在窗口内的 AR，按平均时滞调整后的实收日 |
| 预期流出 | 落在窗口内的 AP + 固定成本 |
| 净现金头寸 | 流入 − 流出 |
| 置信区间 | ± 加权平均回款方差占预期流入的百分比 |

置信区间公式：

```
band_pct = weighted_avg_stddev_days / avg_payment_lag_days
low  = net_cash × (1 − band_pct)
high = net_cash × (1 + band_pct)
```

band_pct 四舍五入到一位小数；**上限 ±50%**，更高说明数据太薄、模型不可信 → 改为打风险标记（步骤 5）。

> 边界保护：若 mean lag ≤ 1 天（如 Square POS 即时到账），**不要做除法**，直接把 band_pct 设为 5%，否则会除零/区间爆炸。

### 步骤 5 — 点名风险

扫描会把低区间估计压成负、或造成流动性紧张的情形，每条产出一行风险（按美元影响从大到小，**最多 5 条**）：

- **逾期付款风险**：客户 X 历史晚付 18 天，其 \$8,400 发票从 30 天窗口推到第 48 天。
- **工资紧张**：工资（\$22,000）4/15 到期；4/14 低区间现金 \$19,200，缺口风险 \$2,800。
- **数据过薄告警**：客户 Y 仅 2 笔回款记录，区间设为默认 ±30%。
- **无连接器告警**：仅用 CSV，无实时 AP / 经常性成本，置信区间比正常更宽。

### 步骤 6 — 交付产出

**聊天摘要（必出）**：

```
现金流预测 — [日期区间]
数据源：[用到的连接器]

            预期       低区间    高区间
30 天净额： $X,XXX    $X,XXX    $X,XXX
60 天净额： $X,XXX    $X,XXX    $X,XXX
90 天净额： $X,XXX    $X,XXX    $X,XXX

⚠ 风险标记：[数量]
  • [风险 1]
  • [风险 2]
```

**XLSX 工作簿（必出）**：生成前先读 `xlsx` 技能/SKILL.md。三个 sheet：

1. **Summary** — 30/60/90 预测表带置信区间；每个窗口行下展开内联子行，列出构成流入（绿）/流出（红）的逐笔交易，使估值在本表内可审计。
2. **Detail** — 全部交易按窗口分组、组内按日期排序，含累计净额列与每组小计（总流入/总流出/净）；过去交易置灰单列于底部；三个窗口即使为空也要有行，空窗口放"本窗口无交易"占位行。
3. **Risks** — 标记的风险及其美元影响与所属窗口。

文件名：`cash-flow-snapshot-[YYYY-MM-DD].xlsx`。

## 指令

无破坏性操作，**无需审批门**。交付后固定提醒：

> "本预测基于 [所列数据源]，不能替代会计意见——做融资决策前请先与你的簿记/会计核实。"

## 示例

services 业务，QuickBooks + PayPal 已连。AR：Acme \$8,400（到期 4/10，历史均滞 18 天）、BlueSky \$14,200（4/22，滞 7 天）；固定成本：工资 \$22,000（4/15）。

调整后实收日：Acme 4/28、BlueSky 4/29 → 均落在工资日之后。

```
加权平均 stddev 3.6 天 / 加权平均时滞 12.7 天 → band_pct = 28.3%

窗口     预期流入   预期流出   净额      低(−28%)   高(+28%)
0–30d   $22,600    $22,000   +$600    −$5,928    +$7,128
31–60d  $6,000     $3,680    +$2,320  +$1,670    +$2,970
```

风险：① 工资紧张——\$22K 工资 4/15 到期，但 AR 4/28–29 才到账，低区间缺口风险高达 \$22,000；② 逾期付款——Acme 均滞 18 天，\$8,400 推到工资日之后。

## 注意事项

源 gotchas（采编保留的关键约束）：

- **AR 账龄含已收发票**：QuickBooks 账龄导出可能含 \$0 余额发票，会虚高流入 → 先按 `balance_due > 0` 过滤；连接器不暴露 balance_due 时，先减去已知 PayPal/Stripe 结算额。
- **PayPal 结算时滞因交易类型而异**：别假设全部 1–2 个工作日到账（争议/新卖家/大额会被冻结）→ 用实际 `transaction_date → completed_date` 对算每类的均值与标准差。
- **CSV 列名各家不一**：QuickBooks 用 "Transaction Date/Amount/Transaction Type"，Wave 用 "Date/Amount/Account Type" → 模糊匹配表头（date→transaction date→txn date；amount→debit/credit；type→category→account type），并**先确认映射再算**，一个问题胜过一份悄无声息的错预测。
- **固定成本藏在一次性 AP 里**：很多小微不规范打 "recurring" 标签，房租可能每月以一次性账单出现 → 找连续 ≥3 个月、同供应商、金额相近（±10%）的 AP 当作固定成本，并向用户确认。
- **band 公式在 mean lag = 0 时崩**：见步骤 4 边界保护（≤1 天直接设 5%，不做除法）。

参考源含 `reference/gotchas.md`（连接器异常/极端方差）与 `reference/examples/worked-example.md`（为新数据形态建模输出格式时）。

## 互见

- related：`cfo-financial-advisor` —— 战略层现金跑道/burn 管理，本技能是其战术级 30/60/90 落地。
- related：`startup-financial-modeler` —— 中长期（3–5 年）现金流/跑道建模。
- related：`budget-variance-analysis` —— 预实差异归因，可解释流出偏差来源。
- combines_with：`financial-statements-generator` —— 三表（含现金流量表）正式输出。
- combines_with：`sales-forecast-builder` —— 用销售预测填充未来流入假设。

---
本条采编自 anthropics/knowledge-work-plugins（Apache-2.0）。
