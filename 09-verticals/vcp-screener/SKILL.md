---
name: vcp-screener
title: VCP 波动收缩形态选股
description: 当需要按 Minervini VCP（波动收缩形态）扫描 S&P 500、找处于 Stage 2 上升趋势且在突破枢轴附近形成紧致缩量基底的标的时使用；做 3 阶段筛选（行情预筛→7 点趋势模板→VCP 检测打分），产出含质量评分、执行状态、枢轴/止损/风险的候选清单与 JSON/MD 报告；不适用于实盘下单、行情采集或投资建议；触发词：VCP、波动收缩、Minervini、紧致基底、Stage 2、突破枢轴、缩量选股
domain: 领域/fintech
triggers: [VCP, 波动收缩, Minervini, 紧致基底, Stage 2, 趋势模板, 突破枢轴, pivot, 缩量, 选股, screener, trend template, 相对强度]
tags: [fintech, 选股, 技术分析, vcp, minervini, 动量, screener, python, fmp]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, FMP API, requests]
requires: []
related: [canslim-growth-screener, breakout-trade-planner, finviz-screener-builder, pead-earnings-drift-screener]
combines_with: [trade-position-sizer, breakout-trade-planner, backtesting-frameworks]
license: MIT
source: tradermonty/claude-trading-skills
source_license: MIT
---
## 何时使用

适用：
- 要按 Mark Minervini 的 VCP（Volatility Contraction Pattern，波动收缩形态）扫描 S&P 500，找处于 Stage 2 上升趋势、在突破枢轴附近形成逐级收紧基底的标的。
- 要找「紧致基底 / 缩量收缩」走势，或做 Stage 2 动量股扫描。
- 要找带明确风险边界（枢轴价、止损、风险百分比）的突破候选。

不该用（负边界）：
- 实盘下单、订单路由、券商/交易所 API 对接 —— 本技能只做选股扫描，不产生买卖指令，不构成投资建议。
- 行情/历史数据的采集与清洗 —— 数据靠 FMP API 拉取，缺 key 或免费额度不足时无法跑全量。
- 非 Stage 2（下跌/筑底/派发期）标的 —— VCP 只在 Stage 2 有效，趋势模板不过直接淘汰。

## 步骤

3 阶段流水线（脚本内置，无需手工拼）：
1. **预筛 Pre-Filter**（约 101 次 API 调用）：仅用报价数据快筛 —— 价 > $10、距 52 周低点 > 20%、距 52 周高点 < 30%、均量 > 20 万股。
2. **趋势模板 Trend Template**（约 100 次 API 调用）：用 260 日历史跑 Minervini 7 点 Stage 2 过滤，原始分 ≥ 85（7 项中过 6 项）才进入下一步。
3. **VCP 检测**（无额外 API 调用）：识别收缩结构、5 维加权打分、判执行状态、生成报告。

跑完后：
4. 读生成的 JSON + Markdown 报告。
5. 对每个头部候选，按「执行状态优先、评级其次」给可执行结论（见下「指令」）。

**Minervini 7 点趋势模板**（Stage 2 确认，过 6 项即 ≥85 分）：
1. 价 > 150 日 SMA 且 价 > 200 日 SMA；2. 150 日 SMA > 200 日 SMA；3. 200 日 SMA 连涨 22+ 交易日；4. 价 > 50 日 SMA；5. 价距 52 周低点 ≥ 25%；6. 价在 52 周高点 25% 以内；7. 相对强度评级 > 70。

**VCP 收缩规则**：T1（首次回调）大盘股 8–35%（小盘可达 50%）；T2 须比 T1 紧 ≥25%（ratio ≤ 0.75）；T3 须比 T2 再紧 ≥25%；最少 2 段收缩，理想 3–4 段逐级收紧；完整形态 15–325 交易日。**枢轴 = 最后一段收缩的高点**，放量上破（量 ≥ 50 日均量 1.5 倍）才买，止损放在最后收缩低点下方 1–2%，单笔风险 5–8%。

**缩量比 dry-up ratio** = 枢轴附近近 10 根均量 / 50 日均量：<0.30 教科书级，0.30–0.50 强，0.50–0.70 合格，>0.70 偏弱。

## 指令

执行入口（默认 S&P 500 取前 100 候选）：

```bash
# 默认扫描，输出到 reports/
python3 skills/vcp-screener/scripts/screen_vcp.py --output-dir reports/

# 自定义标的池
python3 skills/vcp-screener/scripts/screen_vcp.py --universe AAPL NVDA MSFT AMZN META --output-dir reports/

# 全量 S&P 500（需付费 API 档）
python3 skills/vcp-screener/scripts/screen_vcp.py --full-sp500 --output-dir reports/

# 严格模式：仅返回 valid_vcp=True 且 execution_state ∈ (Pre-breakout, Breakout)
python3 skills/vcp-screener/scripts/screen_vcp.py --strict --output-dir reports/
```

**前置**：需 FMP API key（设环境变量 `FMP_API_KEY` 或传 `--api-key`）。免费档 250 次/天足够默认扫描（前 100 候选）；全量 `--full-sp500` 建议付费档。

**回测/研究调参**（默认值见括号）：`--min-contractions`(2)、`--t1-depth-min`(10.0%)、`--breakout-volume-ratio`(1.5x)、`--trend-min-score`(85)、`--atr-multiplier`(1.5，越低对摆动越敏感)、`--contraction-ratio`(0.70，越低要求收缩越紧)、`--lookback-days`(120)、`--max-sma200-extension`(50.0%)、`--wide-and-loose-threshold`(15.0%)。

**结论按「执行状态优先」**（execution_state 7 态）：
- `Pre-breakout` / `Breakout`：处于有效进场窗口 → 按评级定仓位。
- `Early-post-breakout`：突破已起但高于理想买点 → 减仓或等回踩。
- `Extended`(枢轴上方 5–10%) / `Overextended`(>50% 离 SMA200 或 >10% 离枢轴)：已错过 → 入观察列表等下一基底。
- `Damaged` / `Invalid`：形态失效 → 不进场。

**再按评级定仓位**（composite_score，状态确认可进后才用）：
- Textbook VCP (90–100)：枢轴处激进建仓 1.5–2x。
- Strong VCP (80–89)：枢轴处标准建仓 1x。
- Good VCP (70–79)：放量确认后买，0.75x。
- Developing VCP (60–69)：仅观察等更紧收缩。Weak/No VCP (<60)：仅监控或跳过。

**5 维加权评分**：趋势模板 25% + 收缩质量 25% + 量能形态 20% + 枢轴贴近度 15% + 相对强度 15%。注意 `★` 标记表示触发了「状态封顶 State Cap」—— 即原始分被执行状态下调（如 Extended 最高只能 Developing）。

## 示例

呈现一个头部候选时，建议给出：
- **质量**：composite_score / 评级（形态成色）。
- **执行状态**：execution_state（现在能否买，Pre-breakout/Breakout 为可操作），含 `★` 是否被封顶。
- **形态类型**：pattern_type（Textbook VCP / VCP-adjacent / Post-breakout / Extended Leader / Damaged）。
- **收缩细节**：T1/T2/T3 各段深度与收缩比。
- **交易方案**：枢轴价、止损价、风险百分比。
- **量能**：缩量比 dry_up_ratio、突破量分 breakout_volume_score。
- **相对强度排名**。

输出文件：`vcp_screener_YYYY-MM-DD_HHMMSS.json`（结构化）与同名 `.md`（人读报告，分 A 区 Pre-Breakout 观察列表 / B 区 Extended 优质 VCP）。

## 注意事项

- 本技能只做扫描选股，不构成金融/投资建议，不承诺收益；最终下单与风控由使用者自负。
- 常见误区：① 在枢轴前抢买 —— 必须等放量上破；② 忽略量能 —— 无量突破常失败；③ 止损过宽 —— 应紧贴最后收缩低点；④ 用错阶段 —— VCP 只在 Stage 2 有效，先过趋势模板；⑤ T1 过深（大盘股 >35%）形态可靠性下降；⑥ T2 > T1（收缩扩大）就不是 VCP。
- 「追高」铁律（Minervini）：枢轴上方 >5% 不追；距离决定基准分，放量只是 0–5% 窗内的加分项，不能反超。
- API 额度：默认扫描约耗 200 次调用；免费档 250 次/天勉强够一次默认跑，全量需付费档。
- `--strict` 是 Minervini 纯净模式，会大幅收窄结果，适合只看「可立即进场」标的；研究/回测再用宽松参数。

## 互见

- requires：无。
- related：`backtesting-frameworks`、`trading-strategy-backtester`（把 VCP 信号纳入回测验证胜率/期望）、`portfolio-risk-metrics`（候选入场后做组合风险度量）。
- combines_with：`alpha-vantage-market-data`（VCP 命中后拉补充行情/指标做二次确认）、`trading-strategy-backtester`（将筛出的枢轴/止损规则系统化回测）。

---

采编自 tradermonty/claude-trading-skills（MIT 许可）：vcp-screener。本条为适配重写而非逐字翻译，保留源中 7 点趋势模板、VCP 收缩/枢轴/缩量规则、5 维评分权重、执行状态与状态封顶机制，以及 `screen_vcp.py` 关键命令与参数默认值。脚本、references 与 calculators 实现见源仓库。
