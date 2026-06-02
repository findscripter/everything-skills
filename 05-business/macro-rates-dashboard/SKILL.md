---
name: macro-rates-dashboard
title: 宏观利率监测看板
description: 当需要把宏观指标、国债/掉期收益率曲线、通胀盈亏平衡与实际利率拼成一张宏观利率看板，研判周期位置、政策路径与金融条件松紧时使用；做先广后深的工具链取数+合成，产出含宏观摘要表/曲线斜率/实际利率分解/掉期利差的结构化 dashboard；不适用于个券估值、交易信号或无 MCP 数据源的离线推演；触发词：宏观利率、收益率曲线、2s10s、实际利率、通胀盈亏平衡、掉期利差、金融条件
domain: 商业/finance
triggers: [宏观利率, 收益率曲线, yield curve, 2s10s, 实际利率, real rate, 通胀盈亏平衡, breakeven, 掉期利差, swap spread, 金融条件, 曲线倒挂, 政策利率预期]
tags: [finance, macro, rates, yield-curve, inflation, swap-spread, dashboard, MCP, 宏观策略]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [MCP, qa_macroeconomic, interest_rate_curve, inflation_curve, ir_swap, tscc_historical_pricing_summaries]
requires: []
related: [swap-curve-strategy, bond-relative-value-analysis, macro-regime-detector, fixed-income-portfolio-review]
combines_with: [fixed-income-portfolio-review, bond-futures-basis-analysis]
license: Apache-2.0
source: anthropics/financial-services
source_license: Apache-2.0
---
## 何时使用

你是宏观策略与利率分析师。把 MCP 工具返回的宏观数据、国债/掉期曲线、通胀盈亏平衡与实际利率，**合成**成一张连贯的宏观利率看板——工具负责给数据，你负责讲清周期位置、政策路径与金融条件。

合成主线（先广后深，逐层下钻）：

1. **周期位置**：GDP、就业、PMI——经济在扩张还是收缩。
2. **央行动作**：政策利率、曲线形态——货币立场。
3. **债市信号**：曲线斜率、实际利率——市场对增长/通胀的定价。
4. **金融条件**：掉期利差、实际利率——在收紧还是放松。

**不该用的边界：**

- 个券/单一债券的相对价值或估值定价 → 非本技能范围。
- 给具体交易信号、择时或下单建议 → 本技能只做条件研判，不出交易指令。
- 没有可用的 MCP 数据源（qa_macroeconomic / interest_rate_curve 等）时凭训练记忆离线编数 → 禁止，数据必须来自工具实时返回。

## 步骤

可用 MCP 工具（全部为**两段式**：先 list/search 再 calculate/price，不可跳过第一段）：

- `qa_macroeconomic` —— 宏观序列：GDP、CPI、PCE、失业率、非农、PMI、零售。多国家多频率，按助记符模式或描述检索。
- `interest_rate_curve` —— 国债与掉期收益率曲线。先 list 再 calculate，用于曲线形态与斜率。
- `inflation_curve` —— 通胀盈亏平衡曲线与实际收益率。先 search 再 calculate，用于实际利率分解。
- `ir_swap` —— 按期限与币种的掉期利率。先 list 模板再 price，用于算掉期利差。
- `tscc_historical_pricing_summaries` —— 历史定价数据，给基准收益率提供历史分位与趋势背景。

工具链流程：

1. **拉宏观指标**：`qa_macroeconomic` 取目标国家的 GDP、CPI/PCE、失业率、PMI，取最新值与近端序列。
2. **曲线快照**：`interest_rate_curve`（list→calculate）取国债曲线，抽标准期限收益率，算 **2s10s** 与 **3M-10Y** 斜率，分类曲线形态。
3. **实际利率分解**：`inflation_curve`（search→calculate），逐期限算 **实际利率 = 名义 − 盈亏平衡**，判断宽松还是限制性。
4. **掉期利差**：`ir_swap`（list→price）取 2Y/5Y/10Y，逐期限算 **掉期利差 = 掉期利率 − 国债收益率**，评估金融条件。
5. **历史背景**：`tscc_historical_pricing_summaries` 取基准收益率（如 10Y），看当前水平相对近史的位置。
6. **合成看板**：周期位置 + 曲线信号 + 实际利率体制 + 金融条件 + 整体研判，按下方输出格式组装。

## 指令

**宏观检索模式**——调 `qa_macroeconomic` 时用通配符发现助记符（mnemonic）：

- 美国：`US*GDP*`、`US*CPI*`、`US*PCE*`、`US*UNEMP*`
- 欧元区：`EZ*GDP*`、`EZ*HICP*`
- 英国：`UK*GDP*`、`UK*CPI*`
- 优先季调（seasonally adjusted）序列；多数指标取月频，GDP 取季频。

**输出格式（看板四块 + 研判）：**

宏观摘要表

| 指标 | 当前 | 前值 | 方向 | 信号 |
|---|---|---|---|---|
| GDP 增速 | …% | …% | … | 扩张/收缩 |
| 核心通胀(YoY) | …% | …% | … | 高于/接近/低于目标 |
| 失业率 | …% | …% | … | 偏紧/均衡/宽松 |
| 制造业 PMI | … | … | … | 扩张/收缩 |

收益率曲线快照：列 3M/2Y/5Y/10Y/30Y 收益率，突出 **2s10s** 与 **3M-10Y** 斜率，标注形态（正常/平坦/倒挂/驼峰）。

实际利率分解

| 期限 | 名义 | 盈亏平衡 | 实际利率 | 信号 |
|---|---|---|---|---|
| 5Y | …% | …% | …% | 宽松/限制性 |
| 10Y | …% | …% | …% | 宽松/限制性 |

掉期利差表

| 期限 | 掉期利率 | 国债收益率 | 掉期利差(bp) | 信号 |
|---|---|---|---|---|
| 2Y | … | … | … | 正常/抬升/承压 |
| 5Y | … | … | … | 正常/抬升/承压 |
| 10Y | … | … | … | 正常/抬升/承压 |

整体研判：2-3 句概括宏观利率体制——周期位置、政策展望、金融条件、关键风险。

## 示例

最小合成提示（替换国家与期限即可复用）：

```
目标：美国宏观利率看板
1. qa_macroeconomic 检索 US*GDP* / US*CPI* / US*UNEMP* / US*PMI*（季调，取最新+前值）
2. interest_rate_curve: list 美国国债曲线 → calculate 3M/2Y/5Y/10Y/30Y
   → 2s10s = y10 - y2；3M-10Y = y10 - y3m；形态分类
3. inflation_curve: search → calculate 5Y/10Y 盈亏平衡
   → 实际利率 = 名义 - 盈亏平衡（判断宽松/限制性）
4. ir_swap: list → price 2Y/5Y/10Y
   → 掉期利差 = 掉期 - 国债（判断金融条件）
5. tscc_historical_pricing_summaries: 10Y 历史分位
6. 组装四块表 + 2-3 句整体研判
```

判读速记：**2s10s 转负=倒挂**（衰退/降息预期信号）；**实际利率为正且走高=限制性**；**掉期利差抬升=金融条件趋紧/避险**。

## 注意事项

- **两段式不可跳**：`interest_rate_curve`/`inflation_curve`/`ir_swap` 必须先 list/search 再 calculate/price，直接定价会缺模板或参数而失败。
- **数据来自工具，不可臆造**：所有数字须是 MCP 实时返回；模型训练数据必然过时，不要凭记忆填收益率或宏观读数。
- **口径一致**：核对币种、期限、频率（月/季）与季调与否；盈亏平衡与名义须同币种同期限才能相减出实际利率。
- **合成而非罗列**：看板价值在把四块信号串成一条宏观叙事（周期→政策→债市→金融条件），单纯堆表不算完成。
- 助记符靠通配符发现，命中多条时优先季调主口径序列。

## 互见

- related：`cfo-financial-advisor` —— 宏观利率体制可作为企业财务/再融资决策的外部环境输入。
- related：`startup-financial-modeler` —— 把曲线与实际利率作为折现率/融资成本假设喂入模型。
- related：`equity-earnings-update-report` —— 利率与金融条件影响估值折现，可为财报点评提供宏观背景。
- combines_with：`data-storyteller` —— 把四块表与斜率信号讲成有说服力的宏观图文叙事。
- combines_with：`board-deck-builder` —— 把整体研判压缩成董事会/投委会的宏观环境页。

---
采编自 anthropics/financial-services（Apache-2.0）。
