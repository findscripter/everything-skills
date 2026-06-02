---
name: financial-analysis-toolkit
title: 财务比率与 DCF 估值分析
description: 当需要从财务报表做比率分析、DCF 估值、预算差异或滚动预测时使用；用四个仅依赖 Python 标准库的脚本（ratio_calculator/dcf_valuation/budget_variance_analyzer/forecast_builder）算出比率、企业/股权价值、差异与情景预测并生成报告；不适用于实时行情抓取、会计记账、税务申报或证券投资建议；触发词：财务分析、财务比率、ratio、DCF、估值 valuation、WACC、预算差异 budget variance、滚动预测 forecast、现金流 cash flow
domain: 数据/analysis
triggers: [财务分析, 财务比率, ratio, DCF, 估值 valuation, WACC, 预算差异 budget variance, 滚动预测 forecast, 现金流 cash flow]
tags: [finance, financial-analysis, dcf, valuation, budgeting, forecast]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, ratio_calculator.py, dcf_valuation.py, budget_variance_analyzer.py, forecast_builder.py]
requires: []
related: [dcf-valuation-model, three-statement-model, spreadsheet-formula-auditor, startup-financial-modeler]
combines_with: [spreadsheet-formula-auditor, kpi-dashboard-design, matplotlib-visualization]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

当用户提供财务报表（利润表、资产负债表、现金流量表）或财务假设，需要做以下任一分析时使用：

- 计算并解读财务比率（盈利、流动、杠杆、效率、估值五大类）。
- 用 DCF（贴现现金流）做企业价值与股权价值估值，含 WACC 与终值。
- 做预算差异分析（实际 vs 预算 vs 上年），按重要性筛选并判别有利/不利。
- 用驱动因素法做收入预测、13 周滚动现金流与基准/乐观/悲观情景。

不该用：实时行情/财报抓取（无联网，需用户提供数据）；记账、税务申报、合规审计；个性化证券投资建议或荐股；非结构化数据的纯文字解读（先转成下方 JSON 结构）。

## 步骤

1. 定边界：明确分析目标、数据来源、时间区间、重要性阈值与精度目标，选定分析框架。
2. 备数据：把财务数据整理为 JSON 输入文件（四个工具共用一套 schema，参见 `assets/sample_financial_data.json`）。**运行前先校验输入完整性**：检查缺失字段、空值、明显不合理的数值。
3. 跑工具：按需求调用对应脚本（均为 Python 标准库，零第三方依赖）。
4. 校验输出：比率对照行业基准；**DCF 结果对照合理边界**（如隐含倍数 vs 可比公司），异常即回查假设。
5. 出报告：用 `assets/` 下模板生成高管摘要、差异报告、DCF 报告（含敏感性表）、预测报告。
6. 跟踪复盘：用实际值更新模型，跟踪预测精度（收入 ±5%、费用 ±3%），据差异迭代假设。

## 指令

四个脚本都接受一个 JSON 输入文件，并支持 `--format text|json`（默认 text）：

```bash
# 1. 比率计算：--category 可限定 profitability/liquidity/leverage/efficiency/valuation
python scripts/ratio_calculator.py financial_data.json
python scripts/ratio_calculator.py financial_data.json --category profitability --format json

# 2. DCF 估值：WACC(CAPM)、5 年默认预测、双终值法、贴现率×增长率两维敏感性
python scripts/dcf_valuation.py valuation_data.json
python scripts/dcf_valuation.py valuation_data.json --projection-years 7

# 3. 预算差异：默认重要性阈值 10% 或 5 万，可覆盖
python scripts/budget_variance_analyzer.py budget_data.json --threshold-pct 5 --threshold-amt 25000

# 4. 滚动预测：驱动法收入 + 13 周现金流 + 情景；线性回归用标准库
python scripts/forecast_builder.py forecast_data.json --scenarios base,bull,bear
```

关键比率：盈利（ROE/ROA/毛利率/营业利润率/净利率）、流动（流动比率/速动比率/现金比率）、杠杆（资产负债率/利息保障倍数/DSCR）、效率（总资产周转/存货周转/应收周转/DSO）、估值（P/E、P/B、P/S、EV/EBITDA、PEG）。

DCF 终值用两种方法并行：永续增长法与退出倍数法（默认 EV/EBITDA=12，终值 EBITDA 利润率 0.20，终值增长 0.025）。

## 示例

任务：给定某公司财报 JSON，先看盈利能力，再做 7 年 DCF。

```bash
python scripts/ratio_calculator.py acme.json --category profitability
python scripts/dcf_valuation.py acme_dcf.json --projection-years 7 --format json
```

读出净利率与 ROE 判断盈利质量，DCF 输出对比永续增长法与退出倍数法的每股价值区间，并用敏感性表说明对贴现率/增长率的弹性。

## 注意事项

- **约束：WACC 必须大于终值增长率**，否则永续增长终值会被置为 0（公式分母为 `WACC − g`）。
- 重要性阈值默认 10% 或 5 万美元，低于阈值的差异会被过滤；按场景调 `--threshold-pct/--threshold-amt`。
- 收入/费用变量的有利-不利判别方向相反，看报告时注意符号语义。
- 输出务必回校源数据；模型所有假设需完整留痕，100% 解释重大差异。
- 依赖：仅 Python 标准库（`math`/`statistics`/`json`/`argparse`/`datetime`），无需 numpy/pandas/scipy。

## 互见

- csv-data-cleaner：财务原始数据落地为 CSV 时，先清洗再转 JSON 输入。
- sql-query-builder：从数据库取数构造分析输入时配合使用。
- markdown-to-docx：把生成的 Markdown 报告转成 Word 交付。

本条采编自 alirezarezvani/claude-skills（MIT）。
