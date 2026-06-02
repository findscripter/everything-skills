---
name: octagon-historical-financial-ratings
title: 历史财务评级与指标趋势
description: 当需要观察一家上市公司的评级与关键指标随时间的变化轨迹、识别升降级拐点或做长期财务健康趋势分析时使用；通过 Octagon MCP 的 octagon-agent 工具按 Ticker 拉取 N 条历史记录，含综合评分(1–5)、字母评级(A+–F)及 ROA/ROE/DCF/D-E 四项 1–5 分指标的时间序列并据趋势解读；不适用于单期快照初筛(用 ratings-snapshot)、自建模型重算或离线无 MCP。触发词：历史评级、评级趋势、ratings history、升降级、ROA/ROE 趋势、财务健康轨迹、octagon-agent
domain: 领域/fintech
triggers: [历史评级, 评级趋势, ratings history, 升级降级, ROA趋势, ROE趋势, 财务健康轨迹, 时间序列评分, octagon-agent, 评级变化监控]
tags: [fintech, 历史评级, 趋势分析, 时间序列, 基本面分析, 风险监控, MCP, octagon]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Octagon MCP, octagon-agent, npx, Node.js]
requires: []
related: [octagon-ratings-snapshot, octagon-financial-health-scores, octagon-stock-grades, octagon-historical-market-cap]
combines_with: [octagon-equity-research-analyst]
license: MIT
source: OctagonAI/skills
source_license: MIT
---
## 何时使用

当需要把一家上市公司的**评级与关键指标拉成时间序列**、看其**随时间的变化轨迹**时使用：一次调用按 Ticker 返回最多 `N` 条历史记录，每条含综合评分（1–5）、字母评级（A+ 至 F）以及 ROA/ROE/DCF/D-E 四项 1–5 分指标，适合：

- **趋势分析**：判断财务健康是在改善还是恶化，识别长期保持高分的稳健标的。
- **升降级监控**：跟踪持仓的评级变化，捕捉 A+→B 这类突变拐点作为预警。
- **拐点与背离定位**：发现单项指标（ROA/ROE）的拐头，或 ROE 高而 ROA 低这类杠杆驱动的背离。
- **同业轨迹对比**：横向比较竞品的评级走势，看谁在变好。

**不该用的边界：**

- 只要**当期快照 / 单点初筛 / 多标的横向打分排序** —— 那是另一条，用 `octagon-ratings-snapshot`（含 P/E、P/B 六项指标）。
- 需破产风险 / 财务强度评分（Z-Score、Piotroski）—— 用 `octagon-financial-health-scores`。
- 要逐项**自建模型、复算每个评分或做敏感性分析** —— 转 `dcf-valuation-model` / `three-statement-model`。
- **离线 / 未配置 Octagon MCP** 的环境 —— 本条依赖 `octagon-agent` 工具，无 MCP 无法取数。
- 评级是辅助信号，不替代完整尽调与人工复核。

## 步骤

1. **确认 MCP 就绪**：环境已配置 Octagon MCP，`octagon-agent` 工具可见（Windows 需先装 Node.js / npx；配置见下「指令」）。
2. **确定分析参数**：标的 **Ticker**（如 `NVDA`）+ 历史记录条数上限 **N**（如 100 / 500 / 2000 / 5000，越大覆盖区间越长）。
3. **发起查询**：调用 `octagon-agent`，prompt 点名要 historical financial ratings 与 key metric scores，并用 `limited to <N> records` 控量。
4. **读取时间序列**：按日期排列的综合评分 / 字母评级 + ROA/ROE/DCF/D-E 四项分。
5. **做趋势解读**（不是看单期）：连续高分=稳定优秀；单项上行=运营效率改善；评级突降=触发深挖；ROE 高 + ROA 低=可能靠杠杆撑回报；D/E 分稳定或上行=杠杆管理稳健。
6. （可选）追加深挖：评级方法论、与历史均值对比、同业轨迹对比。

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

API Key 在 https://app.octagonai.co 注册后于 API Keys 菜单生成。Windows 命令行临时启动可用 `cmd /c "set OCTAGON_API_KEY=<key> && npx -y octagon-mcp"`。

**MCP 调用：**

```json
{
  "server": "octagon-mcp",
  "toolName": "octagon-agent",
  "arguments": {
    "prompt": "Retrieve historical financial ratings and key metric scores over time for NVDA, limited to 2000 records."
  }
}
```

**查询模板：** `Retrieve historical financial ratings and key metric scores over time for <TICKER>, limited to <N> records.`

数据源：`octagon-financials-agent`。

**关键指标含义（分值越高越优）：**

| 指标 | 衡量什么 | 分区 |
|---|---|---|
| 综合评分 Overall Score | 综合财务健康 | 1–5（5 最佳） |
| 字母评级 Overall Rating | 财务健康字母等级 | A+ 至 F |
| ROA 分 | 总资产收益率（资产效率） | 1–5（5 最佳） |
| ROE 分 | 净资产收益率（盈利能力） | 1–5（5 最佳） |
| DCF 分 | 折现现金流估值 | 1–5（5 最佳） |
| D/E 分 | 负债权益比（杠杆健康度） | 1–5（5 = 杠杆最低/最稳健） |

## 示例

查询 `NVDA`（limited to 2000 records）的典型返回（按日期倒序的时间序列）：

| 日期 | 综合评分 | 字母评级 | ROA | ROE | DCF | D/E |
|---|---|---|---|---|---|---|
| 2024-01-15 | 5 | A+ | 4 | 4 | 3 | 3 |
| 2024-01-08 | 5 | A+ | 4 | 4 | 3 | 3 |
| 2023-12-29 | 5 | A | 4 | 3 | 3 | 3 |
| … | … | … | … | … | … | … |

解读：综合评分长期维持 5 分、评级在 A/A+ 间小幅波动 → 稳定的财务优秀者；2023-12-29 → 2024-01-08 ROE 由 3 升 4，提示盈利能力改善。

**变体查询：**

- 近期聚焦：`...for AAPL, limited to 100 records.`
- 超长历史：`...for MSFT, limited to 5000 records.`

**追问深挖（按需）：**

- "What ratings criteria drive these historical scores?"
- "How do NVDA's recent ratings compare to its historical averages?"
- "Compare the rating trajectories of <TICKER1> and <TICKER2> over time."

## 注意事项

- **看趋势而非单点**：本条的价值在时间序列，下结论要看走势与拐点，单条记录意义有限。
- **方向需对齐**：D/E「高分 = 低杠杆 = 更好」，别把原始负债数值当评分；所有评分已统一为越高越优。
- **同业归一化**：跨行业（银行 vs 软件）评级不可直比；轨迹对比应在同业内做。
- **records 控量**：`limited to <N>` 决定覆盖时间跨度与返回体量；N 过大易冗长或超时，按需取 100/500/2000。
- **降级即信号**：综合评级突降（如 A+→B）应触发对财报的深入调查，而非直接淘汰。
- **API Key 安全**：Key 经 `OCTAGON_API_KEY` 环境变量注入，勿硬编码；遇限流降低查询频率。
- **结果定位**：评级是监控 / 预警信号，不替代完整尽调、建模与专家复核。

## 互见

- requires：（无）
- related：`octagon-ratings-snapshot`（当期评级快照与多标的初筛，本条是其历史时序版）、`octagon-financial-health-scores`（破产风险 / 财务强度评分，互补维度）、`octagon-price-target-consensus`（分析师目标价共识）、`alpha-vantage-market-data`（拉取行情与基本面原始数据）。
- combines_with：`octagon-financial-growth-metrics`（增长指标历史趋势，与评级轨迹联读看「质量+成长」）、`portfolio-risk-metrics`（对持仓评级走势配合组合层风险监控）、`octagon-equity-research-analyst`（评级拐点触发后做深度股票研究）。

---

本条采编自 OctagonAI/skills（MIT 许可），已做中文适配重写。
