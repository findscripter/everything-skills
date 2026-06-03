---
name: finviz-screener-builder
title: FinViz 选股器 URL 构建
description: 当用户用自然语言描述选股条件（基本面/技术面/主题）并想在 FinViz 筛选时使用；做将口语需求映射为 FinViz 过滤代码、拼装并打开筛选器 URL；不适用于单只个股深度分析、持仓组合复盘、图表形态识别或财报事件选股；触发词：FinViz、选股、筛选股票、高配当成长股、超卖大盘股
domain: 领域/fintech
triggers: [FinViz, 选股, 筛选股票, stock screener, 高配当成长小型股, 超卖大盘高ROE, 科技板块割安股, AI主题选股, 突破候选, 插内幕买入筛选]
tags: [fintech, 选股, finviz, url构建, 量化筛选, 技术面, 基本面]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, Bash]
requires: []
related: [canslim-growth-screener, vcp-screener, value-dividend-screener, pair-trade-screener]
combines_with: [breakout-trade-planner, trade-position-sizer, backtesting-frameworks]
license: MIT
source: tradermonty/claude-trading-skills
source_license: MIT
---
## 何时使用

当用户用自然语言描述选股条件、希望在 FinViz 上筛选时使用。把口语需求（如「高配当成长小型股」「超卖大盘高 ROE」「AI 云主题中盘以上」）翻译成 FinViz 过滤代码，拼出筛选器 URL 并在浏览器打开。公开版无需 API Key；若环境变量 `$FINVIZ_API_KEY` 存在则自动启用 FINVIZ Elite。

不该用的边界：
- 单只个股的深度基本面分析 → 用对应个股分析技能。
- 含持仓的组合复盘 → 用组合管理技能。
- 对图表/截图做形态识别 → 用技术分析技能。
- 围绕财报事件选股 → 用财报交易/PEAD 类技能。

## 步骤

### 1. 加载过滤代码参考

```bash
cat references/finviz_screener_filters.md
```

### 2. 解读需求 → 过滤代码

用下方「概念映射表」快速翻译，精确代码再查完整过滤清单。

区间条件（如「配当 3-8%」「PER 10-20」）务必用 `{from}to{to}` 单 token 写法（`fa_div_3to8`、`fa_pe_10to20`），不要拆成 `_o` + `_u` 两个过滤。

概念映射表（高频）：

| 概念 | 过滤代码 |
|---|---|
| 高配当 | `fa_div_o3` / `fa_div_o5` |
| 小/中/大/超大型股 | `cap_small` / `cap_mid` / `cap_large` / `cap_mega` |
| 割安 | `fa_pe_u20,fa_pb_u2` |
| 成长股 | `fa_epsqoq_o25,fa_salesqoq_o15` |
| 超卖 / 超买 | `ta_rsi_os30` / `ta_rsi_ob70` |
| 52 周高值/安值附近 | `ta_highlow52w_b0to5h` / `ta_highlow52w_a0to5l` |
| 突破 | `ta_highlow52w_b0to5h,sh_relvol_o1.5` |
| 板块 | `sec_technology` / `sec_healthcare` / `sec_energy` / `sec_financial` |
| 行业 | `ind_semiconductors` / `ind_biotechnology` |
| 米国株 / 黑字 | `geo_usa` / `fa_pe_profitable` |
| 高 ROE / 低负债 | `fa_roe_o15`(或 o20) / `fa_debteq_u0.5` |
| 内幕买入 | `sh_insidertrans_verypos` |
| 增配 / 深度价值 | `fa_divgrowth_3yo10` / `fa_pb_u1,fa_pe_u10` |
| 动量 | `ta_perf_13wup,ta_sma50_pa,ta_sma200_pa` |
| 防御 | `ta_beta_u0.5` 或 `sec_utilities,sec_consumerdefensive` |
| 配当 3-8%（剔陷阱）| `fa_div_3to8` |
| EV 割安 | `fa_evebitda_u10` |
| 高机构持有 / 低浮动股 | `sh_instown_o60` / `sh_float_u20` |
| AI / 网络安全主题 | `--themes "artificialintelligence"` / `--themes "cybersecurity"` |
| AI 子主题（云/算力）| `--subthemes "aicloud"` / `--subthemes "aicompute"` |

完整映射（来周决算、直近 IPO、目标株价、史上最高值附近等）见源参考表。

### 3. 执行前确认

执行前用表格列出已选过滤项、视图（如 Overview `v=111`）和模式（Public/Elite 自动判定），让用户确认或调整。

### 4. 执行脚本

```bash
python3 scripts/open_finviz_screener.py \
  --filters "cap_small,fa_div_o3,fa_pe_u20,geo_usa" \
  --view overview
```

主要参数：
- `--filters`（可选）：逗号分隔过滤代码。注意 `theme_*` / `subtheme_*` token 不能放这里，改用 `--themes` / `--subthemes`。
- `--themes` / `--subthemes`（可选）：逗号分隔主题/子主题 slug，接受裸 slug 或带前缀值。
- `--elite`：强制 Elite 模式（未指定时由 `$FINVIZ_API_KEY` 自动判定）。
- `--view`：overview / valuation / financial / technical / ownership / performance / custom。
- `--order`：排序（如 `-marketcap`、`dividendyield`、`-change`）。
- `--url-only`：只打印 URL 不开浏览器。

约束：`--filters`、`--themes`、`--subthemes` 至少提供其一。脚本对过滤代码做严格校验以防 URL 注入。

### 5. 汇报结果

输出：构造的 URL、所用模式（Elite/Public）、已应用过滤摘要，以及下一步建议（如「按配当利回り排序」「切到 Financial 视图看详细比率」）。

## 示例

主题 + 子主题 + 过滤组合（AI 云/算力，中盘以上）：

```bash
python3 scripts/open_finviz_screener.py \
  --themes "artificialintelligence" \
  --subthemes "aicloud,aicompute" \
  --filters "cap_midover" \
  --url-only
```

高配当成长股配方（剔除配当陷阱）：

```bash
--filters "fa_div_3to8,fa_sales5years_pos,fa_eps5years_pos,fa_divgrowth_5ypos,fa_payoutratio_u60,geo_usa"
--view financial
```

Minervini 趋势模板 + VCP：

```bash
--filters "ta_sma50_pa,ta_sma200_pa,ta_sma200_sb50,ta_highlow52w_0to25-bhx,ta_perf_26wup,sh_avgvol_o300,cap_midover"
--view technical
```

VCP 收敛收紧可加：`ta_volatility_wo3,ta_highlow20d_b0to5h,sh_relvol_u1`。

## 注意事项

- 选股是对话式迭代而非一次性查询：先用 3-4 个核心过滤起步，结果 >100 加收紧条件、<5 放宽条件。
- 视图分层：先 `overview` 快扫，再切 `financial` / `valuation` 深看；确认基本面后再叠加 `ta_` 技术过滤择时入场。
- 多主题用 OR 逻辑（`|` 分组）：`--themes "artificialintelligence,cybersecurity"` 命中任一主题即入选。
- 区间务必用单 token `{from}to{to}`，勿拆成两个过滤。
- 书签保存 URL，每次只调一个过滤以理解其影响。

## 互见

- `references/finviz_screener_filters.md` — 完整过滤代码参考（含行业代码示例，全 142 代码清单在 Industry Codes 章节）。
- `scripts/open_finviz_screener.py` — URL 构建与 Chrome 打开脚本。
- 个股深度分析 / 组合管理 / 技术形态分析 / 财报选股 等技能（负边界场景的替代去处）。

---

采编自 tradermonty/claude-trading-skills（MIT），适配重写为中文「技能大典」条目。
