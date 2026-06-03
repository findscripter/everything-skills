---
name: canslim-growth-screener
title: CANSLIM 成长股筛选
description: 当需要按 William O'Neil 的 CANSLIM 方法对美股做成长股筛选、寻找盈利加速+价格动量+创新高的标的时使用；用 FMP API（Finviz 兜底机构持股）计算 C/A/N/S/L/I/M 七因子并加权打分（0-100），产出排名榜单与 JSON+Markdown 报告；不适用于价值/股息选股、实盘下单，熊市（M=0）应转持币；触发词：CANSLIM、成长股筛选、相对强弱RS、创52周新高
domain: 领域/fintech
triggers: [CANSLIM 筛选, O'Neil 成长股方法, 盈利加速+价格动量选股, 创52周新高 加 盈利加速, 相对强弱 RS Rating, FMP_API_KEY 美股筛选, 机构持股 Finviz 兜底]
tags: [fintech, 选股, 成长股, canslim, 美股, 相对强弱, 动量, python]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Python, requests, beautifulsoup4, lxml, FMP API, Finviz]
requires: []
related: [value-dividend-screener, vcp-screener, finviz-screener-builder, breakout-trade-planner]
combines_with: [institutional-flow-tracker, trade-position-sizer]
license: MIT
source: tradermonty/claude-trading-skills
source_license: MIT
---
# CANSLIM 成长股筛选

按 William O'Neil 的 CANSLIM 方法系统化筛选美股成长股：对股票池逐只计算 7 个因子，加权合成 0-100 分并排名，输出可执行的买入候选报告。七因子为 **C**urrent 当季盈利、**A**nnual 年度增长、**N**ewness 创新高、**S**upply/Demand 量能供需、**L**eadership 相对强弱、**I**nstitutional 机构持股、**M**arket 大盘方向。

## 何时使用

适用：
- 用户要求「跑一个 CANSLIM 筛选」「按 O'Neil 方法找成长股」。
- 寻找盈利加速、价格动量强、临近/突破 52 周新高的标的。
- 需要一份按综合分排名、附因子拆解的成长股候选清单（潜在多倍股）。

**不该用的边界：**
- 价值/低估值选股 → 用价值股筛选类技能，CANSLIM 是动量成长逻辑。
- 收益/股息导向 → 用股息成长类技能。
- **熊市**：M 因子检测到大盘走弱（M=0）会触发警示。此时 3/4 个股随大盘下跌，**不应买入**，应提高现金仓位等待大盘转强——这是硬约束，其余分数再高也不买。
- 仅做行情数据拉取、回测或风险度量 → 见「互见」。

## 步骤

两阶段：阶段一（FMP API + Finviz）逐只算七因子；阶段二排名并生成报告。

1. **校验前置**：确认 `FMP_API_KEY` 已配置，Python 3.7+ 及依赖已装。
2. **确定股票池**：默认 S&P 500 市值前 40，或用户自定义 symbols/行业。
3. **API 预算**：40 只 ≈ 283 次 FMP 调用，**超免费档 250 次/天**。免费档用 `--max-candidates 35`（35×7+3≈248 次），或升级 FMP Starter（750 次/天）。
4. **跑主脚本** `screen_canslim.py`，按需传 `--rs-benchmark`、`--top`、`--output-dir`。
5. **读报告**：取最新 `.md`，按综合分与评级带（卓越+/卓越/强/中上）分析头部候选。
6. **产出面向用户的总结**：含大盘判断、Top 5 因子拆解、仓位建议、风险点；熊市则明确建议持币。

**脚本内部流程：** 先算 M（S&P 500 对 50 日 EMA，用真实历史数据）→ 取 S&P 500 52 周历史供 M/L 用 → 逐只算 C/A/N/S/L/I → 加权合成 → 排名 → 出 JSON+Markdown。40 只约 2 分钟（Finviz 兜底每只 +2 秒限速）。

## 指令

**前置依赖：**
```bash
pip install requests beautifulsoup4 lxml
export FMP_API_KEY=your_key_here   # 免费档 250 次/天，注册：site.financialmodelingprep.com/developer/docs
```

**运行：**
```bash
# 默认股票池（S&P 500 前 40）
python3 screen_canslim.py --api-key $FMP_API_KEY

# 自定义股票池
python3 screen_canslim.py --universe AAPL MSFT GOOGL NVDA META TSLA

# 免费档安全档位 + 报告取前 20
python3 screen_canslim.py --api-key $FMP_API_KEY --max-candidates 35 --top 20

# 切换 RS 基准（默认 ^GSPC）
python3 screen_canslim.py --rs-benchmark SPY     # 或 QQQ / IWM

# 关闭 L 因子（省去逐只 365 天拉取，L 固定中性 50）
python3 screen_canslim.py --disable-rs
```

**因子权重（O'Neil 原始权重）与打分阈值要点：**

| 因子 | 权重 | 含义与高分阈值 |
|---|---|---|
| C 当季盈利 | 15% | 季度 EPS/营收同比；增 50%+ = 100 分，30-49% = 80，18-29% = 60 |
| A 年度增长 | 20% | 3 年 EPS CAGR + 稳定性；40%+ = 90，30-39% = 70，25-29% = 50 |
| N 创新高 | 15% | 距 52 周高点 + 放量突破；距高 5% 且突破 = 100，10% 且突破 = 80 |
| S 量能供需 | 15% | 60 日上涨日/下跌日成交量比；比值 ≥2.0 = 100，1.5-2.0 = 80，1.0-1.5 = 60 |
| L 相对强弱 | 20% | 多周期加权 RS vs 基准；RS 90+ 且跑赢 = 100，80-89 = 80 |
| I 机构持股 | 10% | 机构家数 + 持股比；50-100 家 + 30-60% 持股 = 100 |
| M 大盘方向 | 5% | S&P 500 对 50 日 EMA（VIX 调整）；强上行 = 100，上行 = 80，**熊市 = 0** |

**多周期加权 RS 公式（Phase 3.1）：**
```
Weighted RS = 0.40 × rel_3m + 0.30 × rel_6m + 0.30 × rel_12m
```
缺周期时对可用周期重新归一。兜底链：无基准 → 加权绝对收益 + 20% 罚分；多周期全缺但 ≥50 根 bar → 退回 365 天全窗绝对收益；<50 根 bar → 分数 0 并置 `error`。

**评级带（综合分）：** 卓越+ (90-100) 激进买入 / 卓越 (80-89) 强买 / 强 (70-79) 标准买 / 中上 (60-69) 回调买入。

## 示例

报告中因子明细的读法：
- **S**：`Up/Down Volume Ratio: 1.06 ✓ Accumulation`（资金净流入）
- **L**：`3m/6m/12m: +12.4%/+18.7%/+44.1% (rel +5.2%/+8.3%/+22.0%) | RS: 88 (Strong)`
- **I**：`6199 holders, 68.3% ownership ⭐ Superinvestor`

整体示例：「NVDA 综合 97.2——季度盈利爆发(100)、3 年增长强(95)、创新高(98)、量能吸筹(85)、RS 领先(92)、机构强支撑(90)、大盘上行(100)」。

**Finviz 兜底**（无需 API key）：当 FMP 缺 `sharesOutstanding` 时自动抓取 Finviz 机构持股 %，将 I 因子从 35/100（残缺）提升到 60-100/100，日志显示 `✅ Using Finviz institutional ownership for NVDA: 68.3%`。抓取失败（403/限速）也不会让脚本崩溃，优雅降级到仅 FMP 家数（I 封顶约 70）并在报告中标注。

## 注意事项

- **熊市禁买**：M=0 时无论其余分数多高都不买，建议 80-100% 现金。CANSLIM 在牛市才有效。
- **API 预算**：40 只超免费档；用 `--max-candidates 35` 或升级。遇 `429 Too Many Requests` 脚本自动 60 秒后重试，免费档每日 UTC 午夜重置。
- **数据质量旗标不是错误**：如「营收下滑但 EPS 增长（疑回购粉饰）」「机构数据来自 Finviz」——是因子给出的提示，需结合基本面与仓位风险判断。
- **Finviz 限速** 2.0 秒/次，调低有 IP 封禁风险；全池触发兜底时整体耗时升至 2-3 分钟属正常。
- **免责**：仅供教育/研究，非投资建议；历史赢家（AAPL 2009、NFLX 2013）不代表未来，务必自行尽调并咨询专业人士。打分系统改编自 IBD MarketSmith，方法源自 O'Neil《笑傲股市》(4th ed.)。

## 互见

- related：`alpha-vantage-market-data` —— 拉取行情/基本面原始数据作为输入源。
- related：`portfolio-risk-metrics` —— 选出候选后做组合风险度量。
- combines_with：`trading-strategy-backtester`、`backtesting-frameworks` —— 把筛选规则做成策略回测验证有效性。
- combines_with：`dcf-valuation-model` —— 对头部候选叠加估值视角，平衡动量与价值。

---
采编自 tradermonty/claude-trading-skills（MIT 许可），已做中文适配重写。
