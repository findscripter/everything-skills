---
name: pe-returns-sensitivity
title: PE 投资回报 IRR/MOIC 敏感性分析
description: 当评估私募股权（PE/Buyout）交易、压力测试假设或准备投委会（IC）回报材料时使用；据交易/融资/经营/退出假设快速搭建 IRR/MOIC 基准回报、二维敏感性表、三档情景与回报归因，产出 Excel 与一页 IC 摘要；不适用于公开股权估值、DCF 企业估值或非杠杆收购建模；触发词：returns analysis、IRR sensitivity、MOIC table、回报分析、敏感性表、估算回报、back of the envelope
domain: 领域/fintech
triggers: [returns analysis, IRR sensitivity, MOIC table, 回报分析, IRR 敏感性, MOIC 表, 敏感性表, 估算回报, model the returns, back of the envelope, what's the return at, 投委会回报材料]
tags: [finance, private-equity, lbo, irr, moic, sensitivity-analysis, valuation, fintech, excel]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Excel, Python, numpy-financial]
requires: []
related: [lbo-model-builder, merger-accretion-dilution-model, dcf-valuation-model, unit-economics-analyzer]
combines_with: [lbo-model-builder, unit-economics-analyzer, ma-playbook]
license: Apache-2.0
source: anthropics/financial-services
source_license: Apache-2.0
---
## 何时使用

适用于私募股权（PE/杠杆收购 LBO）单笔交易的快速回报评估：

- 给交易“估个数”（sizing up a deal），判断当前价格/杠杆下能否达到目标回报；
- 压力测试入场倍数、杠杆、退出倍数、增长、持有期等关键假设；
- 为投资委员会（IC）准备回报展板（returns exhibits）。

不该用于：

- 公开市场股权估值或 DCF 企业内在价值测算（本条只算股权侧 IRR/MOIC，不做 WACC/永续增长）；
- 非杠杆收购的成长股权/风险投资建模（无债务结构时归因与杠杆项不成立）；
- 需要逐期完整三表（利润表/资产负债表/现金流）联动的精细 LBO 模型——本条是“信封背面”的快速版。

## 步骤

### 第 1 步：收集交易输入

向用户索取或从既有分析中提取：

- 入场（Entry）：入场 EBITDA（LTM 或 NTM）、入场倍数（EV/EBITDA）、企业价值 EV、交割时净负债、股权出资额、交易费用与开支。
- 融资（Financing）：优先级债务（×EBITDA、利率、摊还）、次级/夹层债（如有）、入场总杠杆（×EBITDA）、股权出资。
- 经营假设（Operating）：收入年增速、EBITDA 利润率轨迹、资本开支占收入比、营运资金变动、还债计划。
- 退出（Exit）：持有期（年）、退出倍数（EV/EBITDA）、退出 EBITDA（由增长假设推算）。

### 第 2 步：基准情景回报

计算并以表格列出：入场 EV、投入股权、退出 EBITDA、退出 EV、退出时净负债、退出股权价值、MOIC、IRR、现金回报倍数（cash-on-cash）。

随后展示回报瀑布（returns waterfall）：EBITDA 增长贡献、倍数扩张/收缩贡献、还债贡献、费用/开支拖累。

### 第 3 步：二维敏感性表

构建 2-way 敏感性矩阵，每个单元格同时显示 IRR 与 MOIC（格式 `IRR / MOIC`）：

- 入场倍数 × 退出倍数（如入场 7x/8x/9x/10x 对退出 6x–10x）；
- EBITDA 增长 × 退出倍数（固定入场）；
- 杠杆 × 退出倍数（固定入场与增长）；
- 持有期 × 退出倍数。

### 第 4 步：情景分析

搭建牛市 / 基准 / 熊市（Bull/Base/Bear）三档，各列出收入 CAGR、退出 EBITDA 利润率、退出倍数、退出 EBITDA、MOIC、IRR。

### 第 5 步：产出

- Excel 工作簿：假设页、回报计算、敏感性表（带条件着色）、情景汇总；
- 一页式回报摘要，可直接放入 IC 展板。

## 指令

- 单元格统一用 `IRR / MOIC` 双指标，便于横向比较风险与回报。
- 凡涉及费用/carry，回报必须同时给出税前（gross）与净额（net）两个口径。
- 计算前先确认是否存在管理层 rollover、共同投资（co-invest）、分红资本重组（dividend recap）或期间分配——它们会改变股权出资额并显著影响 IRR。
- 默认交易成本按 EV 的 2–4% 计提，并从第 1 天股权价值中扣减。

## 示例

关键公式：

- MOIC = 退出股权价值 / 投入股权
- IRR：求解 r 使 `投入股权 × (1 + r)^n = 退出股权价值`，并对期间现金流（分配/recap）做调整
- 回报归因：
  - 增长项 = (退出 EBITDA − 入场 EBITDA) × 退出倍数 / 股权
  - 倍数项 = (退出倍数 − 入场倍数) × 入场 EBITDA / 股权
  - 杠杆项 = 持有期内还债额 / 股权

Python 快速核验单点回报：

```python
import numpy_financial as npf

equity_in = 100.0          # 投入股权（含交易费用扣减后）
exit_equity = 230.0        # 退出股权价值
hold_years = 5

moic = exit_equity / equity_in
irr = npf.irr([-equity_in] + [0]*(hold_years-1) + [exit_equity])
print(f"MOIC={moic:.2f}x  IRR={irr:.1%}")  # MOIC=2.30x  IRR=18.1%
```

## 注意事项

- 始终区分税前/税后与净 carry 口径，避免高估回报。
- 不要漏记交易成本（通常 EV 的 2–4%），它直接压低 Day 1 股权价值。
- 税务结构会实质影响税后回报：资产交易 vs 股权交易、美国 338(h)(10) 选择等需单独评估。
- 期间分配/分红 recap 对 IRR 影响极大，计划内即应纳入现金流时序。
- 本条为快速估算，最终投决仍需完整三表联动 LBO 模型复核。

## 互见

无（暂无强相关的已有技能可关联）。

---

本条采编自 anthropics/financial-services（Apache-2.0）。
