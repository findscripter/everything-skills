---
name: octagon-price-target-summary
title: 分析师目标价汇总解读
description: 当需要看某只股票分析师目标价在近一月/季/年/全期的均价与覆盖分析师数、判断目标价上升或下降趋势、衡量分析师情绪演变与上调下调动向时使用；通过 Octagon MCP 的 octagon-agent 按 Ticker 拉取多时段目标价汇总并解读趋势、覆盖度、共识强度与上行/下行空间；不适用于只要当前共识/中位/最高最低单快照（转 octagon-price-target-consensus）、自建估值模型重算内在价值、或离线无 MCP 取数。触发词：目标价趋势、price target summary、目标价历史、分析师情绪、上调下调、覆盖分析师数、octagon-agent
domain: 领域/fintech
triggers: [目标价趋势, 目标价汇总, price target summary, 目标价历史, 分析师情绪, 上调下调, 覆盖分析师数, 共识演变, octagon-agent, Octagon MCP]
tags: [fintech, 目标价, 分析师情绪, 趋势分析, 卖方研究, 覆盖度, mcp, octagon]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Octagon MCP, octagon-agent, npx, Node.js]
requires: []
related: [octagon-price-target-consensus, octagon-analyst-estimates, octagon-stock-quote, octagon-ratings-snapshot, octagon-equity-research-analyst]
combines_with: [octagon-price-target-consensus, octagon-stock-quote, octagon-analyst-estimates, octagon-income-statement-data]
license: CC-BY-4.0
source: OctagonAI/skills
source_license: MIT
---
## 何时使用

当需要看某只股票分析师目标价**随时间的演变**，回答「目标价在涨还是在跌、最近情绪怎么变、有多少分析师在跟、共识可不可靠」时使用。一次查询拿到跨四个时段的汇总：近一月 / 近一季 / 近一年 / 全期，每段含**覆盖分析师数**与**平均目标价**，据此做趋势、覆盖度、共识强度与上行空间解读。数据由 `octagon-stock-data-agent` 聚合 StreetInsider、TheFly、Benzinga 等卖方来源。

**不该用的边界：**

- 只要**当前的共识/中位/最高/最低目标价单快照**（不关心时段趋势）——转 `octagon-price-target-consensus`，那条更轻量直达四指标。本条强项是**时段对比 / 趋势 / 覆盖演变**。
- 需要**自建估值模型**、逐项重算内在价值或敏感性分析——目标价只是分析师观点，不是估值依据，转 `dcf-valuation-model` / `three-statement-model`。
- 需要**未来营收/EPS 预测**而非价格目标——转 `octagon-analyst-estimates`。
- **离线 / 未配置 Octagon MCP** 的环境——依赖 `octagon-agent` 工具，无 MCP 无法取数。
- 目标价是分析师**意见**，会滞后、会从众，单期快照不代表趋势；务必与基本面交叉验证，不能替代人工判断。

## 步骤

1. **确认 MCP 就绪**：环境已配置 Octagon MCP，`octagon-agent` 工具可见（Windows 需先装 Node.js / npx；配置见「指令」）。
2. **确定标的 Ticker**（如 `AAPL`、`TSLA`、`NVDA`）。
3. **发起查询**：调用 `octagon-agent`，prompt 点名要 price-target summary。
4. **读取多时段表**：近一月 / 近一季 / 近一年 / 全期，每段读「分析师数」与「平均目标价」。
5. **趋势判断**：对比短时段（近月/季）均价与长时段（近年/全期），识别目标价上升 / 下降 / 持平（见趋势表）。
6. **覆盖度评估**：看分析师数落在哪个区间，覆盖越多共识越可靠（见覆盖表）。
7. **结合现价算上行空间**（用近期均价更相关，公式见下）。需现价时用 `octagon-stock-quote` / `alpha-vantage-market-data` 补齐。
8. （可选）深挖：上调下调动向、最高最低区间、多标的横向对比。

## 指令

**Octagon MCP 配置（Claude Desktop / Windsurf，`claude_desktop_config.json`）：**

```json
{
  "mcpServers": {
    "octagon-mcp-server": {
      "command": "npx",
      "args": ["-y", "octagon-mcp@latest"],
      "env": { "OCTAGON_API_KEY": "YOUR_API_KEY_HERE" }
    }
  }
}
```

API Key 在 https://app.octagonai.co 注册后于 API Keys 菜单生成。**Windows** 需先装 Node.js（含 npx）。

**MCP 调用：**

```json
{
  "server": "octagon-mcp",
  "toolName": "octagon-agent",
  "arguments": {
    "prompt": "Retrieve the analysts' price-target summary for the stock symbol AAPL."
  }
}
```

**查询模板：** `Retrieve the analysts' price-target summary for the stock symbol <TICKER>.`

**上行空间公式（需现价；趋势判断优先用近期均价）：**

```
上涨空间 = (目标均价 - 现价) / 现价 × 100%
```

| 上涨空间 | 解读 |
|---|---|
| > 20% | 显著上行预期 |
| 10% – 20% | 中度上行 |
| 0% – 10% | 接近合理估值 |
| < 0% | 下行风险 |

**时段趋势判断（短时段 vs 长时段均价）：**

| 形态 | 解读 |
|---|---|
| 近月/季均价 > 近年/全期 | 目标价上升 —— 乐观情绪升温 |
| 近月/季均价 < 近年/全期 | 目标价下降 —— 担忧增加 |
| 各时段均价大致持平 | 共识维持稳定 |
| 短时段离散、与长期背离 | 不确定 / 多空分歧 |

**覆盖度区间（看分析师数）：**

| 分析师数 | 覆盖级别 / 共识可靠性 |
|---|---|
| 30+ | 重度覆盖，共识更可靠 |
| 15 – 30 | 良好覆盖，视角多元 |
| 5 – 15 | 中度覆盖 |
| < 5 | 覆盖有限，共识参考性弱 |

**上调下调动向（触发与信号）：** 强劲财报 / 上调指引 → 目标价多上调（前景改善）；疲软财报 / 下调指引 → 多下调（前景恶化）；混合修订 → 不确定；行业利好/利空 → 同向联动。

## 示例

查询 `AAPL` 的典型返回：

| 时段 | 分析师数 | 平均目标价 |
|---|---|---|
| 近一月 | 9 | $305.72 |
| 近一季 | 16 | $312.80 |
| 近一年 | 48 | $282.91 |
| 全期 | 229 | $219.71 |

数据源：`octagon-stock-data-agent`（聚合 StreetInsider、TheFly、Benzinga 等）。

**解读（设现价 $270.01）：**

- **趋势**：近月 $305.72、近季 $312.80 均显著高于近年 $282.91 与全期 $219.71 → 目标价持续**上升**，分析师情绪升温。
- **覆盖度**：近一年 48 位、全期 229 位 → 重度覆盖，共识可靠性高。
- **上行空间**：以近季均价 $312.80 算 →（312.80 − 270.01）/ 270.01 ≈ **+15.8%**，落在「中度上行」区。

**追问深挖（按需）：**

```
# 现价对比
What are the analyst price targets for TSLA compared to its current price?

# 趋势聚焦
How have analyst price targets for NVDA changed over the past year?

# 覆盖分析
How many analysts cover Microsoft and what are their price targets?

# 区间
What are the highest and lowest analyst price targets for AMZN?
```

## 注意事项

- **时段权重**：近期目标价更相关；算上行空间与判情绪优先用近月/季均价，全期均价含大量陈旧数据会被拉低（如上例 $219.71）。
- **目标价 ≠ 估值**：这是分析师意见汇总，会滞后、会从众，务必与基本面（财报、现金流、护城河）交叉验证，勿单凭目标价决策。
- **覆盖越薄越不可靠**：分析师数 < 5 时共识参考性弱；重度覆盖才更接近市场真实预期。
- **趋势看方向，快照看水平**：单期不代表趋势，多时段对比才能看出情绪升降；要当前精确共识/中位用 `octagon-price-target-consensus`。
- **价差即不确定性**：需要最高/最低区间宽窄判断分歧度时，追加区间查询或转共识技能。
- **API Key 安全**：Key 通过 `OCTAGON_API_KEY` 环境变量注入，勿硬编码；遇限流降低查询频率。
- **结果定位**：用于情绪追踪与估值体检，不能替代完整尽调与专家复核。

## 互见

- requires：（无）
- related：`octagon-price-target-consensus`（同源目标价，取当前共识/中位/最高最低单快照，本条取多时段趋势，互补）、`octagon-analyst-estimates`（同源未来营收/EPS 预测，理解目标价背后的盈利预期）、`octagon-stock-quote`（拉现价以算上行空间）、`octagon-ratings-snapshot`（综合评级与基本面初筛）、`octagon-equity-research-analyst`（同源股票研究编排）。
- combines_with：`octagon-price-target-consensus`（趋势 + 当前快照配合，先看走向再看现值）、`octagon-stock-quote`（补现价完成上涨空间计算）、`octagon-analyst-estimates`（目标价趋势 × 盈利预期，交叉验证情绪）、`octagon-income-statement-data`（看财报基本面是否支撑目标价的上调下调）。

---

本条采编自 OctagonAI/skills（MIT 许可），已做中文适配重写。
