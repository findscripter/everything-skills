---
name: octagon-stock-grades
title: 顶级分析师股票评级查询
description: 当需要追踪某只上市股票的分析师/机构评级与评级变动（升级、降级、维持、首次覆盖）及机构情绪走向时使用；通过 Octagon MCP 的 octagon-agent 工具按 Ticker 拉取评级历史并解读升降级趋势、评级等级映射与机构权重；不适用于实盘下单、需要价格目标数值或离线无 MCP 取数。触发词：分析师评级、评级变动、升级降级、stock grades、机构情绪、analyst rating、octagon-agent
domain: 领域/fintech
triggers: [分析师评级, 评级变动, 升级降级, stock grades, 机构情绪, analyst rating, 评级历史, octagon-agent]
tags: [fintech, 分析师评级, 评级变动, 机构情绪, 升级降级, mcp, octagon]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Octagon MCP, octagon-agent, npx, Node.js]
requires: []
related: [octagon-ratings-snapshot, octagon-price-target-consensus, octagon-historical-financial-ratings, octagon-financial-health-scores]
combines_with: [octagon-equity-research-analyst]
license: MIT
source: OctagonAI/skills
source_license: MIT
---
## 何时使用

当需要某只上市股票的**分析师评级历史与机构情绪走向**时使用：一次返回各家机构的评级动作（升级/降级/维持/首次覆盖等）、评级来源机构、前评级、新评级与发布日期，适合：

- **情绪监控**：跟踪某标的近期是否被升级/降级，判断机构情绪转暖或转冷。
- **催化事件研究**：财报/指引后查评级集中变动，定位催化剂。
- **共识与历史追踪**：看一段时间内评级分布与趋势演变（买入/持有/卖出占比）。
- **指定机构观点**：查某家大行（如高盛）对某标的的当前评级。

**不该用的边界：**

- 需要**价格目标数值**（目标价、上涨空间）——那是另一条，用 `octagon-price-target-consensus`；评级只给等级与动作。
- 需要**盈利预测/一致预期**（EPS、营收估计）——用 `octagon-analyst-estimates`。
- 需要对标的做**横向基本面打分排序**（A–F 综合评级 + 财务指标）——那是 `octagon-ratings-snapshot`。
- 实盘下单、券商撮合——本条只读评级数据，不做交易。
- **离线 / 未配置 Octagon MCP** 的环境——依赖 `octagon-agent` 工具，无 MCP 无法取数。
- 评级是辅助情绪信号，不替代完整尽调与人工复核；陈旧评级（>6 个月）可信度低。

## 步骤

1. **确认 MCP 就绪**：环境已配置 Octagon MCP，`octagon-agent` 工具可见（Windows 需先装 Node.js / npx；配置见下「指令」）。
2. **确定标的 Ticker**（如 `AAPL`、`MSFT`、`GOOGL`）。
3. **发起查询**：调用 `octagon-agent`，用自然语言点名要最新股票评级。
4. **读取评级历史字段**：评级动作、来源机构/分析师、前评级、新评级、发布日期。
5. **解读升降级趋势**：用等级映射表把不同机构口径归一（如 Overweight≈Buy≈Outperform），再看动作方向与机构权重。
6. **判断情绪与时效**：识别升降级集群、共识分布与评级新鲜度。
7. （可选）追加查询：近期变动、指定机构观点、历史一年趋势。

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
    "prompt": "Get the latest stock grades for the symbol AAPL from top analysts and financial institutions."
  }
}
```

**查询模板：** `Get the latest stock grades for the symbol <TICKER> from top analysts and financial institutions.`（数据源：`octagon-stock-data-agent`）

**返回字段：** 评级动作（Rating Action）、来源机构/分析师、前评级（Previous）、新评级（New）、发布日期（Date）。

**评级等级映射（跨机构归一化）：**

| 等级 | 常见叫法 |
|---|---|
| 强烈买入 Strong Buy | Buy、Overweight、Outperform |
| 买入 Buy | Accumulate、Add、Positive |
| 持有 Hold | Neutral、Market Perform、Equal-Weight |
| 卖出 Sell | Underweight、Underperform、Reduce |
| 强烈卖出 Strong Sell | Sell、Avoid |

| Overweight ≈ Buy ≈ Outperform | 看多 |
| Equal-Weight ≈ Hold ≈ Market Perform | 中性 |
| Underweight ≈ Sell ≈ Underperform | 看空 |

**评级动作类型与影响：**

| 动作 | 含义 | 信号强度 |
|---|---|---|
| Upgrade 升级 | 评级上调（如 Hold→Buy） | 从 Sell 升级=最强正面；从 Hold 升级=显著正面 |
| Downgrade 降级 | 评级下调（如 Buy→Hold） | 降到 Sell=最强负面 |
| Maintain 维持 | 评级不变（重申） | 维持 Buy=稳定正面 |
| Initiate 首次覆盖 | 新建覆盖 | 以 Buy 首次覆盖=正面 |
| Reiterate 重申 / Resume 恢复 / Suspend 暂停 | 重复强调 / 重启 / 暂停覆盖 | 视方向而定 |

**机构权重（分级，权重越高越该重视）：**

| 层级 | 代表 |
|---|---|
| 顶级投行 Bulge Bracket | 高盛、摩根士丹利、摩根大通 |
| 主要银行 Major Banks | 美银、花旗、UBS |
| 精品投行 Boutiques | Wedbush、Piper Sandler、Needham |
| 独立机构 Independent | Morningstar、CFRA |

## 示例

查询 `AAPL` 的典型返回（评级历史，每行一条动作）：

| 日期 | 机构 | 动作 | 前评级 | 新评级 |
|---|---|---|---|---|
| 2026-01-30 | Maxim Group | Upgrade 升级 | Hold | Buy |

解读：Maxim Group 由 Hold 升级至 Buy 属显著正面信号；若同期多家集中升级（升级集群），常意味催化剂或突破，应结合财报/指引核实。

**更多查询写法：**

```
# 近期变动
What are the most recent analyst rating changes for TSLA?

# 升级聚焦
Show me recent upgrades for NVDA from major investment banks.

# 历史一年
What is the history of analyst ratings for MSFT over the past year?

# 指定机构
What is Goldman Sachs' current rating on AMZN?

# 共识分布
What percentage of analysts rate MSFT as a buy?
```

## 注意事项

- **跟变动重于看评级**：升级/降级反映情绪转向，比静态评级更有信息量；多家集中变动（集群）才算显著。
- **按机构加权**：顶级投行评级权重更高；精品/独立机构作参考，勿等量齐观。
- **时效优先**：财报后评级最新鲜；评级越旧越不可靠（<1 月=当前观点，1–3 月尚可，3–6 月可能过时，>6 月多已陈旧）。
- **跨机构先归一**：用等级映射表把 Overweight/Buy/Outperform 等口径对齐，再比较，否则误判方向。
- **评级配目标价更完整**：评级（方向）+ 价格目标（幅度）才是完整观点，目标价转 `octagon-price-target-consensus`。
- **API Key 安全**：Key 经 `OCTAGON_API_KEY` 环境变量注入，勿硬编码；遇限流降低查询频率。
- **结果定位**：评级是情绪/筛选信号，不替代完整尽调、建模与专家复核。

## 互见

- requires：（无）
- related：`octagon-price-target-consensus`（同源价格目标共识，评级+目标价构成完整观点）、`octagon-analyst-estimates`（同源盈利一致预期）、`octagon-ratings-snapshot`（同源 A–F 综合评级与财务打分，与分析师评级互补）、`octagon-equity-research-analyst`（同源股票研究编排）、`octagon-stock-quote`（评级变动 vs 价格反应）。
- combines_with：`octagon-price-target-consensus`（评级看方向 + 目标价看幅度）、`octagon-analyst-estimates`（评级 + 盈利预期一起看预期变化）、`octagon-stock-quote`（评级变动叠加实时价格反应）。

---

本条采编自 OctagonAI/skills（MIT 许可），已做中文适配重写。
