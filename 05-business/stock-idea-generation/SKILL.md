---
name: stock-idea-generation
title: 选股投资思路生成
description: 当需要系统性找新的多空选股思路、跑量化筛选或做主题扫描时使用；先定方向/市值/行业/风格/主题，再跑价值·成长·质量·做空·特殊情形筛选并做主题价值链映射，产出 5-10 个带一页论点+对比表+优先级的候选清单；不适用于个股深度建模、合规投顾建议或实盘下单执行。触发词：选股思路、stock screen、量化筛选、主题扫描、给我推个标的
domain: 商业/finance
triggers: [选股思路生成, stock screen 量化筛选, 找新思路 find ideas, 什么标的有看点, screen for 按条件筛股, 主题扫描 thematic sweep, 给我推个标的 pitch me, 多空 long/short 候选]
tags: [商业, finance, 选股, 量化筛选, 主题投资, 多空, 投研, screening]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read]
requires: []
related: [canslim-growth-screener, value-dividend-screener, finviz-screener-builder, investment-thesis-tracker]
combines_with: [investment-thesis-tracker, initiating-coverage-report]
license: Apache-2.0
source: anthropics/financial-services
source_license: Apache-2.0
---
## 何时使用

用于**系统化产出新的多空选股候选**，把量化筛选、主题研究、模式识别结合起来 surface 新 long/short 思路。典型场景：

- 想从零找一批新思路（"有什么看着有意思的""给我推个标的"）。
- 按某种风格/市值/行业跑筛选（"screen for FCF yield > 5% 的中盘价值股"）。
- 围绕某主题做扫描，找受益标的（AI 基建、制造业回流、老龄化等）。

**不该用的边界**：

- 筛选只产出**候选而非结论**，不替代单个标的的深度建模与基本面尽调。
- 不出具合规投顾建议、目标价或买卖评级；这是投研辅助，不是 financial advice。
- 不做实盘下单、组合再平衡或交易执行。
- 缺少基础财务数据时先取数，不要凭空臆造指标值。

## 步骤

**第 1 步 明确搜索口径**（先问清，决定后续筛选）：方向（long / short / 双向）、市值（大/中/小/微）、行业（指定或跨行业）、风格（价值 / 成长 / 质量 / 特殊情形 / 事件驱动）、地域（美股 / 海外 / 全球）、主题（AI、回流、老龄化等具体角度）。

**第 2 步 按风格跑量化筛选**（见「指令」中各筛选模板）。

**第 3 步 主题扫描**（若走主题路线）：
1. 立论点（如"AI 基建支出加速至 2026"）。
2. 映射价值链——谁直接受益、谁间接受益。
3. 区分纯标的（pure-play）与多元化敞口。
4. 评估哪些已被 price in、哪些被低估。
5. 找市场尚未与主题挂钩的**二阶受益者**。

**第 4 步 逐个呈现通过筛选的思路**（见「示例」模板）。

**第 5 步 输出**：5-10 个思路的一页摘要 + 筛选方法学文档 + 全部思路的对比表 + 优先级清单（先研究哪个）。

## 指令

按选定风格套用对应筛选条件：

**价值（Value）**：P/E 低于行业中位；EV/EBITDA 低于历史均值；自由现金流收益率 > 5%；P/B < 1.5x；近 90 天有内部人买入；股息率高于市场均值。

**成长（Growth）**：营收同比 > 15%；盈利同比 > 20%；营收增速在加速；毛利率扩张；ROIC > 15%；净留存强（SaaS > 110%）。

**质量（Quality）**：营收连续增长 5 年以上；毛利率稳定或扩张；ROE > 15%；低 debt/equity；高 FCF 转化率；内部人持股 > 5%。

**做空（Short）**：营收下滑或增速放缓；毛利压缩；应收/存货相对销售上升；内部人卖出；相对同业有溢价但无理由；高 short interest 且基本面恶化；会计红旗（更换审计、财务重述）。

**特殊情形（Special Situation）**：近期 IPO/SPAC 临近解禁；过去 12 个月内的分拆；重整脱困中的公司；激进投资者介入；表现不佳公司的管理层变动。

## 示例

每个通过筛选的思路按此呈现：

```markdown
**[公司名] — [Long/Short] — [一句话论点]**

| 指标 | 数值 | vs. 同业 |
|------|------|---------|
| 市值 | | |
| EV/EBITDA (NTM) | | |
| P/E (NTM) | | |
| 营收增速 | | |
| EBITDA 利润率 | | |
| FCF 收益率 | | |

**论点（3-5 条）：**
- 为何被错误定价
- 市场漏看了什么
- 兑现价值的催化剂

**关键风险：** 什么情况会证伪

**建议下一步：** 建完整模型？深度尽调？专家访谈？
```

## 注意事项

- **筛选只 surface 候选，不是结论**——每个筛选输出都需要后续基本面工作。
- 最好的思路常出在**交集**（如优质公司因短期逆风落到价值估值）。
- **避开拥挤交易**——查持仓、short interest、覆盖该标的的分析师数量。
- **逆向思路要有催化剂**——没有催化剂的"提前"等同于"做错"。
- **长期跟踪命中率**——哪些筛选/方法产出最好的思路。
- **做空需要更高确信度**——择时更难、风险不对称。

## 互见

- related：`cfo-financial-advisor`、`startup-financial-modeler` —— 候选进入深度建模阶段时衔接。
- related：`competitive-analysis`、`market-sizing-analyst` —— 主题扫描与价值链映射时互补。
- combines_with：`sales-forecast-builder` —— 同属财务/投研侧量化分析。
- 把候选清单与对比表落地为可跟踪表格时，配合 lark-base / lark-sheets 使用。

---

采编自 anthropics/financial-services（Apache-2.0），适配重写，非逐字翻译。
