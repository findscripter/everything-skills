---
name: bond-futures-basis-analysis
title: 国债期货基差分析
description: 当分析国债期货基差、定位最廉可交割券(CTD)、计算隐含回购利率(IRR)或评估基差交易机会时使用；做对期货定价取 CTD 与可交割篮子→单独给 CTD 现券定价→算总基差/持有收益/净基差(BNOC)/隐含回购并对比市场回购→叠收益率曲线与历史分位，产出富/平/贱判断与多空基差建议表；不适用于纯期货方向择时、股指/商品期货或不依赖交割机制的策略；触发词：国债期货、基差、CTD、隐含回购、IRR、净基差、basis trade
domain: 商业/finance
triggers: [国债期货, 基差, CTD 最廉可交割, 隐含回购 IRR, 净基差 BNOC, 持有收益 carry, 基差交易 basis trade, 转换因子, 可交割篮子, bond futures basis, implied repo rate, delivery option]
tags: [finance, fixed-income, bond-futures, basis-trading, CTD, implied-repo, yield-curve, MCP, 卖方研究, 利率衍生品]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [MCP, bond_future_price, bond_price, interest_rate_curve, tscc_historical_pricing_summaries, credit_curve]
requires: []
related: [bond-relative-value-analysis, swap-curve-strategy, fixed-income-portfolio-review, macro-rates-dashboard]
combines_with: [fixed-income-portfolio-review, macro-rates-dashboard]
license: Apache-2.0
source: anthropics/financial-services
source_license: Apache-2.0
---
# 国债期货基差分析

## 何时使用

对国债期货做**基差分析与交易评估**：把期货定价、现券解析、收益率曲线与历史数据穿成一条链，判断期货相对现券是富(rich)、平(fair)还是贱(cheap)，并据此给出多空基差建议。典型场景：

- 给某国债期货合约定价，定位**最廉可交割券 CTD** 与可交割篮子。
- 计算**总基差(gross)、持有收益(carry)、净基差(BNOC)、隐含回购利率(IRR)**，并与市场回购对比。
- 评估**交割期权价值**与基差交易（long/short basis）机会。

**核心定位**：让 MCP 工具去算，你负责把多个工具的输出路由成一份连贯分析并做解读与呈现——你是分析师，不是计算器。

**不该用的边界：**

- 纯期货**方向性择时**（看多/看空价格本身）→ 与基差/交割机制无关，不用本技能。
- 股指、商品等**不含实物可交割篮子**的期货 → 无 CTD/转换因子概念，框架不适用。
- 不需要现券-回购-交割三者联动的简单报价查询。

## 步骤

基差分析的本质是「先给期货定价定出 CTD，再单独给 CTD 现券定价，由两份输出算基差，最后叠上曲线与历史」。固定六步工具链（步骤 6 可选）：

1. **给期货定价** — 用合约 RIC 调 `bond_future_price`。提取 CTD 券标识、各券转换因子、可交割篮子、合约 DV01、交割日。
2. **给 CTD 现券定价** — 对步骤 1 得到的 CTD 调 `bond_price`。提取净价/全价、到期收益率、久期、DV01。
3. **算基差指标** — 由前两步输出计算总基差、carry、净基差(BNOC)、隐含回购利率(IRR)；把 IRR 与市场短端利率对比。
4. **收益率曲线背景** — 对期货币种调 `interest_rate_curve`（两阶段：先列可用曲线，再 calculate）；用**短端利率作为回购利率代理**，喂给步骤 3 的 IRR 对比。
5. **历史背景** — 对期货与 CTD 现券各调 `tscc_historical_pricing_summaries`（3 个月日频 OHLC）。评估基差的趋势、波动与当前所处分位。
6. **主权信用（可选）** — 对相关主权调 `credit_curve`，排查信用驱动的基差扭曲。

## 指令

**MCP 工具清单：**

- `bond_future_price` — 国债期货定价。返回公允价、CTD 识别、含转换因子的可交割篮子、合约 DV01。
- `bond_price` — 单只现券定价。返回净价/全价、收益率、久期、DV01、凸性。
- `interest_rate_curve` — 政府收益率曲线。两阶段：先 list 后 calculate；短端作回购利率代理。
- `tscc_historical_pricing_summaries` — 期货与现券历史 OHLC，用于跟踪基差演化。
- `credit_curve` — 信用利差曲线，必要时提供主权信用背景。

**关键约束：**

- **富/贱判断由 IRR vs 市场回购定**：IRR 明显高于市场回购 → 期货偏贱（倾向 long basis / 卖期货买现券方向逻辑）；IRR 低于市场回购 → 期货偏富（short basis）。
- 净基差(BNOC) = 总基差 − carry，代表内嵌的**交割期权价值**，恒为非负方向的解读。
- 回购利率没有直读源时，**统一用收益率曲线短端做代理**并在输出中标注「approx」。

## 示例

**输出格式**（先给结论，再上明细表）：开篇直接给**基差交易评估（多/空/中性）与 IRR vs 市场回购对比**，随后附四张表。

期货摘要：

| 字段 | 值 |
|------|----|
| 合约 | … |
| 公允价 | … |
| CTD 券 | … |
| 转换因子 | … |
| 合约 DV01 | … |

CTD 现券解析：

| 字段 | 值 |
|------|----|
| 净价 | … |
| 到期收益率 YTM | … |
| 久期 | … |
| DV01 | … |

基差计算：

| 指标 | 值 |
|------|----|
| 总基差 Gross | … ticks |
| 持有收益 Carry | … ticks |
| 净基差 Net (BNOC) | … ticks |
| 隐含回购 IRR | …% |
| 市场回购(约) | …% |
| 评估 | 富 / 平 / 贱 |

历史基差背景：

| 指标 | 当前 | 3M 均 | 6M 均 | 分位 |
|------|------|-------|-------|------|
| 净基差 | … | … | … | …th |
| 隐含回购 | … | … | … | …th |

## 注意事项

- **顺序不能乱**：必须先 `bond_future_price` 定出 CTD，再对该 CTD 调 `bond_price`；颠倒会算错基差。
- ticks 与百分比单位易混：基差用 ticks，IRR/回购用 %，制表时显式标单位。
- 历史分位仅作背景参考，不能单独作为入场依据；要结合 carry 与交割期权价值。
- 回购利率用曲线短端**仅是代理**，对 IRR-回购利差敏感时需提示这一近似的局限。
- 工具负责计算，**不要凭记忆杜撰价格/转换因子/曲线值**；缺数据宁可标注缺口。

## 互见

- related：`equity-earnings-update-report` —— 同属卖方风格定量分析的结论先行、表格化呈现写法可复用。
- related：`macro-regime-detector` —— 提供收益率曲线/利率体制背景，辅助判断基差所处的宏观环境。
- related：`portfolio-risk-metrics` —— DV01/久期口径一致，可把基差头寸并入组合风险度量。
- combines_with：`data-storyteller` —— 把富/贱判断与历史分位讲成有说服力的图文叙事。

---
采编自 anthropics/financial-services（Apache-2.0）。
