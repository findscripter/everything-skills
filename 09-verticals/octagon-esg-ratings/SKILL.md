---
name: octagon-esg-ratings
title: ESG评级检索（MSCI / Sustainalytics）
description: 当需要检索某上市公司的 ESG 评级与可持续性评分、做 ESG 筛选、风险评估或组合合规对齐时使用；通过 Octagon MCP 的 octagon-agent 工具按 Ticker 拉取 MSCI 评级、Sustainalytics 风险评分、E/S/G 分项与行业排名，并按分区表解读；不适用于非上市/无评级覆盖标的、需自建 ESG 评分模型，或离线无 MCP 的场景。触发词：ESG评级、MSCI、Sustainalytics、可持续性评分、行业ESG排名、octagon-agent
domain: 领域/fintech
triggers: [ESG评级, MSCI ESG, Sustainalytics, 可持续性评分, 环境社会治理, 行业ESG排名, octagon-agent, ESG筛选]
tags: [fintech, ESG, 可持续投资, 风险评估, 责任投资, MCP, octagon]
level: 进阶
status: stable
agents: [claude-code, cursor, gemini-cli, windsurf]
tools: [Octagon MCP, octagon-agent, npx, Node.js]
requires: []
related: [octagon-financial-health-scores, octagon-equity-research-analyst, alpha-vantage-market-data, portfolio-risk-metrics]
combines_with: [portfolio-rebalancer, octagon-equity-research-analyst, alpha-vantage-market-data]
license: CC-BY-4.0
source: OctagonAI/skills
source_license: MIT
---
## 何时使用

当需要快速取得一家上市公司的 **ESG（环境 / 社会 / 治理）评级与可持续性评分**时使用，典型用途：

- **ESG 筛选**：按最低 ESG 阈值过滤投资标的。
- **风险评估**：识别未管理 ESG 风险高、可能面临监管/声誉问题的公司。
- **组合对齐**：核验持仓是否满足可持续性/责任投资授权。
- **介入靶向**：定位适合股东介入或参与治理改善的公司。

输出涵盖 MSCI ESG 评级（AAA–CCC）、Sustainalytics 风险评分、综合 ESG 分、E/S/G 三项分项分、S&P Global ESG 分及行业排名。

**不该用的边界：**

- **无评级覆盖**：非上市公司、小盘股或新上市标的常无 MSCI/Sustainalytics 覆盖，取不到有效数据。
- 需要**自建 ESG 评分体系**、复算指标权重或做底层 ESG 数据建模——本条只检索第三方现成评级，不替你建模。
- **离线 / 未配置 Octagon MCP** 的环境——依赖 `octagon-agent` 工具，无 MCP 无法取数。
- 不同机构评级口径差异大，结果是**辅助筛选信号**，不能替代完整尽调与人工复核。

## 步骤

1. **确认 MCP 就绪**：环境已配置 Octagon MCP，`octagon-agent` 工具可见（Windows 需先装 Node.js / npx；配置见下「指令」）。
2. **确定标的 Ticker**（如 `MSFT`）与关注维度（综合 ESG / 环境 / 社会 / 治理 / 行业排名，可选）。
3. **发起查询**：调用 `octagon-agent`，prompt 点名要 ESG 评级、风险评级与行业排名。
4. **读取关键指标**：MSCI 评级、Sustainalytics 风险分、综合 ESG 分、E/S/G 分项、S&P Global 分、行业及排名。
5. **按分区表解读**（见下表），并做**模式判断**（领先者 / 改善中 / 分项失衡 / 落后者 / 漂绿嫌疑）。
6. **行业校正**：ESG 评分须在同行业内横比，切勿跨行业直接对比。
7. （可选）追加深挖：历史趋势、同业对比、争议事件、环境/治理专项。

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

API Key 在 https://app.octagonai.co 注册后于 API Keys 菜单生成。可用工具：`octagon-agent`（综合市场情报，本条用它）、`octagon-scraper-agent`、`octagon-deep-research-agent`。

**MCP 调用：**

```json
{
  "server": "octagon-mcp",
  "toolName": "octagon-agent",
  "arguments": {
    "prompt": "Retrieve ESG ratings and scores, including risk rating and industry rank, for MSFT."
  }
}
```

**查询模板：** `Retrieve ESG ratings and scores, including risk rating and industry rank, for <TICKER>.`

**关键指标与量纲：**

| 指标 | 含义 | 量纲 |
|---|---|---|
| MSCI ESG 评级 | MSCI 综合 ESG 评估 | AAA（最佳）– CCC（最差） |
| Sustainalytics 风险评级 | 未管理 ESG 风险水平 | 0–100（**越低越好**） |
| 综合 ESG 分 | 可持续性综合分 | 0–100（越高越好） |
| 环境分 (E) | 气候、污染、资源利用 | 0–100 |
| 社会分 (S) | 劳工、社区、人权 | 0–100 |
| 治理分 (G) | 董事会、商业道德、透明度 | 0–100 |
| 行业排名 | 相对同业的位置 | 百分位 / 排名 |

**MSCI 评级分区：**

| 评级 | 类别 | 含义 |
|---|---|---|
| AAA, AA | 领先者 Leader | 同业最佳 ESG 表现 |
| A, BBB, BB | 平均 Average | 表现中等或参差 |
| B, CCC | 落后者 Laggard | 低于平均，风险偏高 |

**Sustainalytics 风险评分分区（越低越好）：**

| 分值 | 风险级别 |
|---|---|
| 0–10 | 可忽略 Negligible |
| 10–20 | 低 Low |
| 20–30 | 中 Medium |
| 30–40 | 高 High |
| 40+ | 严重 Severe |

**行业排名解读（同业内分位）：** 1–25% 行业领先；26–50% 高于平均；51–75% 低于平均；76–100% 行业落后。

## 示例

查询 `MSFT` 的典型返回：

| 指标 | 数值 |
|---|---|
| MSCI ESG 评级 | AAA |
| 综合 ESG 分 | 65.19 |
| 环境 (E) | 74.57 |
| 社会 (S) | 58.08 |
| 治理 (G) | 62.93 |
| 行业 | Enterprise and Infrastructure Software |

数据源：`octagon-companies-agent`、`octagon-financials-agent`、`octagon-web-search-agent`。

**追问深挖（按需）：**

- 环境专项：`Retrieve ESG ratings with focus on environmental scores and carbon emissions for AAPL.`
- 治理专项：`Retrieve ESG ratings with detailed governance scores and board diversity metrics for JPM.`
- 同业对比：`Retrieve ESG ratings and scores for TSLA and compare to automotive industry peers.`

## 注意事项

- **量纲方向不一致**：Sustainalytics 是**越低越好**（风险分），与 MSCI/综合分相反，解读时勿弄反。
- **分项失衡要拆看**：可能环境高而治理低（如 E=80, S=45, G=50），须逐维评估，别只看综合分。
- **行业内横比**：ESG 评分随行业差异极大，重要性也不同（能源重环境、零售重社会、金融重治理），跨行业对比无意义。
- **多源交叉验证**：MSCI、Sustainalytics、S&P 可能给出不同评级，看共识；分歧大时需排查争议事件。
- **警惕漂绿**：宣传强但第三方评分低，说明叙事与评级脱节；红旗信号包括 CCC/严重风险、近期降级、E/S/G 大幅分化、活跃争议、低治理+高负债。
- **API Key 安全**：Key 通过 `OCTAGON_API_KEY` 环境变量注入，勿硬编码；遇限流降低查询频率。
- **结果定位**：评级是筛选/预警信号，不能替代完整尽调与专家复核。

## 互见

- requires：（无）
- related：`octagon-financial-health-scores`（同源财务健康双评分，与 ESG 互补做基本面+可持续性双筛）、`octagon-equity-research-analyst`（同源个股综合研究）、`alpha-vantage-market-data`（行情/基本面原始数据）、`portfolio-risk-metrics`（组合层风险度量）。
- combines_with：`portfolio-rebalancer`（按 ESG 阈值剔除标的后再平衡组合）、`octagon-equity-research-analyst`（ESG 筛选通过后做深度个股研究）、`alpha-vantage-market-data`（补充市值/财报输入做综合评估）。

---

本条采编自 OctagonAI/skills（MIT 许可），已做中文适配重写。
