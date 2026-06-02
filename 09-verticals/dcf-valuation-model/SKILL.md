---
name: dcf-valuation-model
title: DCF 现金流折现估值模型
description: 当需要用 DCF 方法为某家公司做股权内在价值评估时使用；做的是从财报/市场数据取数、构建多情景自由现金流预测与 WACC、计算终值并产出含敏感性分析的专业 Excel 模型；不适用于相对估值（可比公司/交易倍数）、信用/债券定价或纯财报数据抓取。触发词：DCF、现金流折现、discounted cash flow、内在价值估值、intrinsic value、WACC、终值、terminal value、自由现金流预测、敏感性分析
domain: 领域/fintech
triggers: [DCF, 现金流折现, discounted cash flow, 内在价值估值, intrinsic value, WACC, 终值, terminal value, 自由现金流预测, 敏感性分析]
tags: [dcf, valuation, fintech, excel, wacc, financial-modeling, equity-research]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [openpyxl, Office.js, recalc.py, LibreOffice, MCP servers, Web Search/Fetch]
requires: []
related: [merger-accretion-dilution-model, lbo-model-builder, three-statement-model, financial-analysis-toolkit]
combines_with: [three-statement-model, alpha-vantage-market-data, merger-accretion-dilution-model]
license: Apache-2.0
source: anthropics/financial-services
source_license: Apache-2.0
---
## 何时使用

- 需要用 DCF（现金流折现）方法为一家上市公司估算股权内在价值、判断隐含上涨/下跌空间时。
- 需要构建含 Bear/Base/Bull 多情景、WACC 计算、终值与敏感性分析的机构级 Excel 估值模型时。

**不该用的边界：**

- 相对估值（可比公司倍数、可比交易倍数）——本条只做绝对估值（终值的 Exit Multiple 法仅作 DCF 内部备选）。
- 信用分析、债券/期权定价、宏观研究。
- 纯财报数据抓取或一般财务报表整理（那是取数环节，不是建模）。

## 步骤

DCF 主流程按 10 步推进，**严禁一口气端到端建完**——每个阶段产出后必须向用户确认再进入下一步（取数→收入预测→FCF→WACC→终值与现值→敏感性），早发现假设错误可避免下游全部返工。

1. **取数与校验**：数据源优先级 MCP 服务器（如 Daloopa）> 用户提供 > Web 搜索/抓取（现价、Beta、债务现金）。校验：净债 vs 净现金、摊薄股本（关注回购/增发）、历史利润率合理性、收入增速对标行业、税率落在 21–28%。
2. **历史分析（3–5 年）**：收入 CAGR 与驱动、毛利/EBIT/FCF 利润率走势、D&A 与 CapEx 占收入比、净营运资本（NWC）变动占收入增量比、ROIC/ROE。
3. **收入预测**：以最近实际收入为基，逐年套增速；近端高、中段向行业均值回落、末端逼近终值增速。`收入(N)=收入(N-1)×(1+增速)`，`增速(N)=收入(N)/收入(N-1)-1`。
4. **运营费用建模**：S&M、R&D、G&A 全部**以收入为基数**（不是毛利！），随规模体现运营杠杆（占比逐年下降）。`EBIT = 毛利 - 总OpEx`。
5. **自由现金流（UFCF）**：`EBIT → -税(EBIT×税率) = NOPAT → +D&A → -CapEx → -ΔNWC = 无杠杆FCF`。NWC 按收入增量的百分比计（典型 -2%~+2%，负数=释放现金）。
6. **WACC**：CAPM 求股权成本 `Ke = 无风险利率 + Beta×股权风险溢价(5–6%)`，无风险利率用当前 10 年期国债收益率；债务成本 `Kd_税后 = Kd_税前×(1-税率)`；权重用市值口径 `股权权重=市值/EV`、`债务权重=净债/EV`；`WACC = Ke×We + Kd_税后×Wd`。净现金时净债为负、无债时 WACC=Ke。
7. **折现**：用期中折现惯例，期数取 0.5/1.5/2.5…，`折现因子=1/(1+WACC)^期数`，`PV=UFCF×折现因子`。
8. **终值（首选永续增长法）**：`终值=末年FCF×(1+g)/(WACC-g)`，硬约束 **g < WACC**；g 取 GDP 量级（2–3% 保守，市场领导者可至 3.5–5%），不超过无风险利率或长期 GDP。终值 PV 用末期折现期。**合理性检查：终值应占 EV 的 50–70%，>75% 说明过度依赖终值假设。**
9. **EV→股权价值桥**：`Σ PV(FCF) + PV(终值) = EV`；`EV - 净债(净现金则加) = 股权价值`；`÷摊薄股本 = 隐含每股价`；`隐含回报 = 隐含价/现价 - 1`。
10. **敏感性分析**：DCF 表底部纵向堆叠**三张表**——①WACC×终值增速 ②收入增速×EBIT利润率 ③Beta×无风险利率。

## 指令

**环境二选一（核心约束）：**

- **在 Excel 内（Office 加载项 / Office.js）**：直接用 Office.js，**不要**用 Python/openpyxl。写公式 `range.formulas = [["=D19*(1+$B$8)"]]`，Excel 原生重算，无需单独 recalc。
- **生成独立 .xlsx 文件**：用 Python/openpyxl 写公式，交付前必须跑 `python recalc.py model.xlsx 30`，修到 `status:"success"`、零公式错误（#REF!/#DIV/0!/#VALUE! 等）。

**Office.js 合并单元格陷阱**：先给左上单格写值，再 `.merge()` + 格式化整段；切勿先 merge 整段再给 1×1 数组赋 `.values`，会抛 `InvalidArgument`。

**公式优先、严禁硬编码（不可妥协）**：每个预测、利润率、折现因子、PV、敏感性单元格都必须是活公式。openpyxl 里 `ws["D20"]="=D19*(1+$B$8)"` 对，`ws["D20"]=算好的数` 错。唯一允许硬编码的是：①原始历史输入 ②假设驱动（增速、WACC 输入、终值 g）③当前市场数据（股价、债务余额）。

**情景结构用合并列（INDEX），不要散落 IF**：Bear/Base/Bull 各建一个假设块，假设横向铺在预测年上，每块必须含①合并标题行②显示预测年的列头行（FY2025E…，**必填**）③数据行。用情景选择器单元格（如 B6=1/2/3）+ 合并列 `=INDEX(B10:D10,1,$B$6)` 汇总，预测公式只引用合并列。**反例**：在每个预测公式里嵌 `=IF($B$6=1,…,IF($B$6=2,…,…))`。

**布局先行**：先锁定所有小节行号→写全部表头与标签→写分隔/空行→**最后**写公式并即时测试。顺序颠倒会导致插行后引用全部错位 → #REF!。

**敏感性表用奇数维度（5×5/7×7）保证有真正的中心格**：轴值取 `[base-2步, base-步, base, base+步, base+2步]`，**中心格=基准情形**，其输出必须等于估值汇总的实际隐含每股价（这是建表正确性的自检）。中心格用中蓝 `#BDD7EE` 填充+加粗标注。**每张表 25 格全部用完整 DCF 重算公式填满（3 表×25=75 格），用 openpyxl 循环写**；禁止线性近似（如 `=B88*(1+(0.096-0.116))`）、禁止占位文字、禁止留空、禁止用 Excel 的 Data Table 功能。

**单元格批注**：每创建一个硬编码值就立刻加批注，格式 `Source: [系统/文档], [日期], [引用], [URL]`，不得拖到最后或写 "TODO"。

**配色（字体层 + 填充层）**：字体——蓝色=所有硬编码输入、黑色=所有公式、绿色=跨表引用（WACC 表）。填充——区块标题深蓝 `#1F4E79`+白字、列头浅蓝 `#D9E1F2`、输入格浅灰 `#F2F2F2`、计算格白底、输出/汇总行中蓝 `#BDD7EE`+黑粗。**只用 3 种蓝+1 灰+白**，勿加绿/黄/橙。主要区块加粗边框（1.5pt）。

**数字格式**：百分比 `0.0%`；金额（百万）`$#,##0`、每股 `$#,##0.00`，表头注明单位（"Revenue ($mm)"）；负数用括号 `(#,##0)` 不用减号；年份当文本（"2024" 不是 "2,024"）。

**文件结构**：建两张表——`DCF`（主模型，敏感性表在**底部**，不另开表）+ `WACC`（资本成本计算）。命名 `[Ticker]_DCF_Model_[Date].xlsx`。

## 示例

无杠杆 FCF 构建公式（情景合并列在第 21–23 行，收入在 29 行，NOPAT 在 57 行）：

```
NOPAT      =E45
(+) D&A    =E29*$E$21
(-) CapEx  =E29*$E$22
(-) ΔNWC   =(E29-D29)*$E$23
无杠杆FCF   =E57+E58-E60-E62
```

期中折现示例：FCF=$1000、WACC=10%、期数=0.5 → 折现因子 `=1/(1.10)^0.5=0.9535` → PV=$954。

敏感性表 openpyxl 循环填充（伪代码）：

```python
for r, wacc in enumerate(wacc_range):
    for c, g in enumerate(term_growth_range):
        formula = f"=<用 {wacc} 折现、{g} 算终值的完整DCF重算>/Shares"
        ws.cell(row=start_row+r, column=start_col+c).value = formula
```

交付前重算并检查输出：

```bash
python recalc.py AAPL_DCF_Model_2025-10-12.xlsx 30
# 期望: {"status":"success","total_errors":0,...}
```

## 注意事项

- **取数即确认**：取数后先把原始输入块（收入、利润率、股本、净债）给用户确认，再开始预测——逐阶段确认是本技能的核心纪律。
- **最高频 5 类错误**：①公式行引用错位（→先锁行号再写公式）②漏批注（→边建边加）③敏感性表用近似/占位（→全格完整重算）④情景块引用错块 ⑤无边框不专业。
- **WACC 常见坑**：账面值与市值混用；税率错误地作用于债务成本；无风险利率没用当前 10Y 国债；净债/净现金未正确处理。
- **终值常见坑**：g≥WACC（产生无限大值）；终值占 EV >80%（过度依赖）；末期折现期数取错。
- **现金流常见坑**：OpEx 误以毛利为基数；D&A/CapEx 占比与商业模式不符；NWC 变动算错；跨年税率不一致。
- **交付前清单**：两张表齐全、字体三色到位、所有输入有批注、敏感性表 75 格填满、主要区块有边框、`recalc.py` 跑到 success、OpEx 基于收入、终值占 EV 50–70%、g<WACC、税率 21–28%。

## 互见

- `fact-checking`：校验取数环节的财报数字与市场数据来源。
- `csv-data-cleaner`：清洗用户提供的历史财务流水/CSV 作为建模输入。
- `markdown-to-docx`：将估值结论与方法说明整理成可交付文档。

---

本条采编自 anthropics/financial-services（Apache-2.0）。
