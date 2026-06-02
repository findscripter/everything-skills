---
name: swap-curve-strategy
title: 利率互换曲线策略
description: 当需要分析利率互换（IRS）曲线形态、计算互换利差、分解实际利率或挖掘曲线交易机会时使用；做按多期限定价互换、叠加国债与通胀曲线、产出曲线表/指标/DV01 中性交易建议；不适用于单笔互换估值、信用衍生品或股票/商品策略；触发词：互换曲线、swap spread、陡峭/平坦化、蝶式、实际利率分解。
domain: 商业/finance
triggers: [互换曲线, swap spread, 互换利差, 陡峭化, 平坦化, 蝶式交易, 实际利率分解, 2s10s, 5s30s, DV01中性, 曲线交易]
tags: [利率策略, 固定收益, 互换, 收益率曲线, 宏观, MCP]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [ir_swap, interest_rate_curve, inflation_curve, tscc_historical_pricing_summaries, qa_macroeconomic]
requires: []
related: [bond-relative-value-analysis, macro-rates-dashboard, fixed-income-portfolio-review, bond-futures-basis-analysis]
combines_with: [fx-carry-trade-eval]
license: Apache-2.0
source: anthropics/financial-services
source_license: Apache-2.0
---
## 何时使用

需要把利率互换（IRS）曲线作为整体来分析时使用：判断曲线形态（陡峭/平坦/倒挂/驼峰）、计算互换利差（swap spread）、用通胀盈亏平衡分解实际利率，或挖掘陡峭化/平坦化/蝶式等曲线交易机会并给出 DV01 中性头寸。

**不该用的边界**：
- 只为单笔互换报价/估值 —— 直接用 `ir_swap` 定价即可，不必走完整曲线分析。
- 信用违约互换（CDS）、利率期权波动率、股票/商品/外汇策略 —— 本技能只覆盖利率互换曲线与其相对国债、通胀的相对价值。
- 没有 MCP 定价工具可用时 —— 本技能依赖工具定价，自身不内置数字，缺工具则无法产出。

定位：**让工具定价，你只负责分析形态、计算指标并给建议**（route tool outputs into curve metrics and trade recommendations）。

## 核心原则

互换曲线定价了市场对未来短端利率、信用状况与融资成本的预期。先建完整互换曲线 → 叠加国债曲线算 swap spread → 再加通胀盈亏平衡做实际利率分解。曲线指标（2s10s、5s30s 斜率，蝶式）及其历史分位驱动交易思路；任何交易建议**必须**含 DV01 中性头寸 + carry/roll-down 估算。

## 可用 MCP 工具

- `ir_swap` —— 互换定价。两阶段：先按币种/指数列模板，再在指定期限定价。返回平价互换利率、DV01、NPV。
- `interest_rate_curve` —— 国债收益率曲线。两阶段：list → calculate。用于算 swap spread 与曲线形态参照。
- `inflation_curve` —— 通胀盈亏平衡曲线。两阶段：search → calculate。用于实际利率分解。
- `tscc_historical_pricing_summaries` —— 历史定价数据。用于斜率的历史分位与趋势。
- `qa_macroeconomic` —— 宏观数据。建立经济背景，校验曲线信号与宏观是否一致。

## 步骤 / 指令

1. **发现互换模板**：`ir_swap` list 模式，传目标币种，识别可用指数与期限。
2. **建互换曲线**：`ir_swap` price 模式，跑标准期限 2Y / 5Y / 7Y / 10Y / 20Y / 30Y，逐点取平价互换利率与 DV01。
3. **叠加国债曲线**：`interest_rate_curve`（list → calculate）取同币种，逐期限算 `swap spread = 互换利率 − 国债收益率`。
4. **通胀分解**：`inflation_curve`（search → calculate），逐期限算 `实际利率 = 名义互换利率 − 通胀盈亏平衡`。
5. **计算曲线指标**：从互换曲线算 2s10s 斜率、5s30s 斜率、2s5s10s 蝶式；用 `tscc_historical_pricing_summaries` 标注历史分位；给出形态分类（正常/平坦/倒挂/驼峰）。
6. **综合输出**：互换曲线表 + swap spread + 实际利率分解 + 曲线指标 + 带 DV01 中性头寸的交易建议。必要时用 `qa_macroeconomic` 校验与宏观一致性。

## 示例

输出按以下表格组织。

互换曲线表：

| 期限 | 互换利率(%) | 国债收益率(%) | Swap Spread(bp) | DV01 | 通胀BE(%) | 实际利率(%) |
|------|------|------|------|------|------|------|
| 2Y | … | … | … | … | … | … |
| 5Y | … | … | … | … | … | … |
| 10Y | … | … | … | … | … | … |
| 30Y | … | … | … | … | … | … |

曲线指标：

| 指标 | 当前值 |
|------|------|
| 2s10s 斜率(bp) | … |
| 5s30s 斜率(bp) | … |
| 2s5s10s 蝶式(bp) | … |
| 曲线形态 | 正常 / 平坦 / 倒挂 / 驼峰 |

实际利率分解：

| 期限 | 名义互换 | 通胀BE | 实际利率 | 信号 |
|------|------|------|------|------|
| 2Y | …% | …% | …% | 宽松 / 紧缩 |
| 5Y | …% | …% | …% | 宽松 / 紧缩 |
| 10Y | …% | …% | …% | 宽松 / 紧缩 |

曲线交易建议（每笔均须含）：结构（如 2s10s 陡峭化）、各腿（legs）、DV01 中性名义本金、预估 3M carry、预估 3M roll-down、盈亏平衡曲线移动、目标位、止损位、1–2 句论点（thesis）。

## 注意事项

- **DV01 中性是硬约束**：曲线交易（陡峭/平坦/蝶式）的两腿/三腿名义本金须按 DV01 配平，否则交易会暴露在方向性利率风险而非曲线形态上。
- **carry 与 roll-down 必报**：3 个月持有期的 carry 和 roll-down 决定交易的时间盈亏，缺失则建议不完整。
- **swap spread 与实际利率须同币种同期限对齐**：国债曲线、通胀曲线必须取与互换相同的币种和期限点，错配会污染利差与实际利率。
- **数字一律来自工具**：不要凭记忆编造互换利率/收益率/通胀，所有数值经 `ir_swap` / `interest_rate_curve` / `inflation_curve` 实时定价后填入。
- **历史分位是判据**：斜率「陡」或「平」要相对历史区间判断，靠 `tscc_historical_pricing_summaries` 给出当前在分布中的位置，避免静态读数误导。
- **跨币种比较**需各币种独立建表后再对齐期限，注意各市场指数（如 SOFR / ESTR）与基准差异。

## 互见

- related：`yield-curve-analysis`（国债收益率曲线分析）、`inflation-breakeven`（通胀盈亏平衡分解）—— 本技能复用其曲线作为利差与实际利率的参照。
- combines_with：`macro-context-brief`（宏观背景）—— 用宏观数据校验曲线信号、解释 carry 与形态成因。

---

采编自 [anthropics/financial-services](https://github.com/anthropics/financial-services)（partner-built / LSEG），原始许可 Apache-2.0。
