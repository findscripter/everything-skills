---
name: macro-regime-detector
title: 宏观周期切换检测
description: 当判断当前宏观市场处于何种结构性体制、是否正在发生1-2年级别的体制切换、或需要据此做战略性资产配置时使用；做用月频跨资产比价(RSP/SPY、10Y-2Y、HYG/LQD、IWM/SPY、SPY/TLT、XLY/XLP)的三层信号检测，加权打分并按决策树分类为集中/扩散/收缩/通胀/过渡五种体制，产出切换概率与配置建议的JSON+Markdown报告；不适用于2-8周战术择时、日内信号、个股选股或实盘下单；触发词：宏观体制、市场体制切换、结构性轮动、长期配置、RSP SPY、收益率曲线、信用利差、macro regime
domain: 领域/fintech
triggers: [宏观体制, 市场体制切换, 结构性轮动, 长期配置, RSP/SPY, 收益率曲线, 信用利差, macro regime, regime change, 跨资产比价]
tags: [fintech, macro, regime-detection, cross-asset, asset-allocation, yield-curve, python, fmp]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, uv, fmp-api, yfinance]
requires: []
related: [market-breadth-analyzer, market-top-detector, portfolio-risk-metrics, portfolio-rebalancer]
combines_with: [portfolio-rebalancer, tax-loss-harvesting]
license: MIT
source: tradermonty/claude-trading-skills
source_license: MIT
---
## 何时使用

适用：
- 判断当前美股/宏观市场处于哪种结构性体制，以及是否正在发生 1-2 年级别的体制切换。
- 理解结构性轮动方向（市场集中 vs 扩散、大盘 vs 小盘、风险偏好 vs 防御）。
- 基于收益率曲线、信用利差、跨资产比价做战略性（而非战术性）组合定位。
- 用户提到 RSP/SPY、IWM/SPY、HYG/LQD、SPY/TLT、XLY/XLP 等跨资产比率并想据此判断大势。

不该用（负边界）：
- 2-8 周的战术择时、回调预警、市场顶部检测（那是日频任务，本技能为月频、刻意滞后）。
- 日内/短线信号、个股选股、行情快照。
- 实盘下单、订单路由、券商 API 对接。
- 需要「提前」捕捉拐点：本技能按设计滞后，重在结构性「确认」而非领先。

## 步骤

1. 加载方法论参考（如随源附带）：`regime_detection_methodology.md`、`indicator_interpretation_guide.md`，必要时查 `historical_regimes.md` 找历史对照。
2. 准备 `FMP_API_KEY`（必需，免费档 250 次/日即够，脚本仅约 10 次调用）。个别 ETF 的 FMP 历史价为空时客户端自动回退 yfinance（无需额外 key，但不免除 FMP key 要求）。
3. 运行主分析脚本，拉取约 600 天（≈2.4 年）数据，覆盖 9 只 ETF + 美债利率。
4. 读取生成的 Markdown 报告，向用户呈现：当前体制评估、切换信号面板、各分量明细、分类证据、组合姿态建议。
5. 用户问历史平行时，结合 `historical_regimes.md` 补充对照。

## 指令

数据管道（固定）：日频 OHLCV(600d) → 月度降采样（取每月最后交易日，≈24 点，滤日噪）→ 计算比价 → 6M/12M SMA → 三层信号检测 → 分量打分(0-100) → 加权合成 → 决策树分类 → 切换概率评估。

6 个分量与权重（合成用固定权重）：
| 分量 | 比价/数据 | 权重 | 检测什么 |
|---|---|---|---|
| 市场集中度 | RSP/SPY | 25% | 巨头集中 vs 市场扩散 |
| 收益率曲线 | 10Y-2Y 利差 | 20% | 利率周期转换（最可靠宏观周期指标）|
| 信用状况 | HYG/LQD | 15% | 信用周期风险偏好（金融压力前瞻）|
| 规模因子 | IWM/SPY | 15% | 小盘 vs 大盘轮动（经济情绪温度计）|
| 股债关系 | SPY/TLT + 相关性 | 15% | 股债关系体制 |
| 行业轮动 | XLY/XLP | 10% | 周期 vs 防御偏好 |

三层信号检测（每分量 0-100，代表「切换信号强度」，非好坏）：
- 第 1 层 MA 交叉（0-40）：6M SMA 上穿 12M = 金叉，下穿 = 死叉；近期交叉(1-2 月内)=40 分，较旧=20 分；两线 1% 内收敛=0-25 分；远离稳定趋势=0。近因很重要。
- 第 2 层 动量切换（0-30）：3M ROC 与 12M ROC 比较。长短反向 = 反转预警；同向且强 = 加速确认。按短期 ROC 幅度线性给分（上限 5%）。
- 第 3 层 交叉确认（0-30）：①存在交叉 +10；②短期 ROC 确认交叉方向 +10；③SMA 间距扩大（动量积累）+10。三者齐备 → 强信号(80-100)。

分量分区间解读：0-20 稳定无切换；20-40 微波动可能是噪声；40-60 切换区(MA 收敛，3-6 月内可能交叉)；60-80 明确切换信号；80-100 强确认切换(交叉+动量+加速对齐)。

5 种体制（决策树按分量方向打分）：
- 集中 Concentration：巨头领涨、市场狭窄。RSP/SPY=concentrating(+2)、IWM/SPY=large_cap_leading(+2)、信用稳定/宽松(+1)。
- 扩散 Broadening：参与面扩张、小盘/价值轮动。RSP/SPY=broadening(+2)、IWM/SPY=small_cap_leading(+2)、信用稳定/宽松(+1)、XLY/XLP=risk_on(+1)。
- 收缩 Contraction：信用收紧、防御轮动、risk-off。信用=tightening(+2)、XLY/XLP=risk_off(+2)、SPY/TLT=risk_off(+1)。
- 通胀 Inflationary：股债正相关、传统对冲失效。股债相关=positive(+3)、SPY/TLT=risk_off(+1)。
- 过渡 Transitional：3+ 分量在发信号(分≥40)但无体制得分≥3 时归入。

置信度：最佳体制分 ≥4 高 / ≥3 中 / ≥2 低 / <2 极低。
切换概率：发信号分量数 4+ 且均分≥50→高(70-90%)；3+ 且≥40→中(40-60%)；2+ 且≥30→低(20-40%)；否则极小(<20%)。

## 示例

运行主脚本（FMP key 必需）：

```bash
export FMP_API_KEY=your_key
uv run python3 skills/macro-regime-detector/scripts/macro_regime_detector.py --output-dir reports/
```

脚本参数：

```bash
python3 macro_regime_detector.py [options]
  --api-key KEY       FMP API key（默认取 $FMP_API_KEY）
  --output-dir DIR    输出目录（默认当前目录）
  --days N            拉取历史天数（默认 600）
```

输出两份文件：
- `macro_regime_YYYY-MM-DD_HHMMSS.json` —— 供程序化消费的结构化数据。
- `macro_regime_YYYY-MM-DD_HHMMSS.md` —— 人读报告：①当前体制评估 ②切换信号面板 ③分量明细 ④分类证据 ⑤组合姿态建议。

## 注意事项

- 本技能定位为 1-2 年结构性视角，与战术工具区分：体制检测=月频/结构、顶部检测=日频/2-8 周战术、广度分析=当下快照。问短期回调请改用对应技能。
- 刻意滞后：月频意味着信号比日频指标晚数周到数月，目标是结构性「确认」而非领先，别拿它做提前预警。
- 假阳性：收敛的 MA 可能给出未完成即反转的切换信号，务必看跨分量确认（第 3 层）。
- 体制重叠：真实市场常同时具备多体制特征，故有显式「过渡」分类兜底。
- 历史偏差：分类规则源自 2000 年后市场形态，新型体制可能不落入既有类别。
- API：免费档 250 次/日足够（脚本约 10 次）；FMP key 缺失客户端会报错；部分 ETF 历史价为空时回退 yfinance。

## 互见

- related：`alpha-vantage-market-data` —— 替代/补充的跨资产行情数据源。
- related：`octagon-equity-research-analyst`、`octagon-stock-quote` —— 自上而下确定体制后，下钻基本面与个股研究。
- combines_with：`portfolio-rebalancer` —— 据体制结论调整大类资产权重。
- combines_with：`portfolio-risk-metrics` —— 在不同体制下评估组合 VaR/回撤等风险敞口。
- combines_with：`trading-strategy-backtester` —— 用历史体制划分做分体制回测与策略稳健性验证。

---
本条采编自 tradermonty/claude-trading-skills（MIT 许可）。
