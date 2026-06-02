---
name: octagon-financial-health-scores
title: 财务健康评分（Z-Score / Piotroski）
description: 当评估上市公司破产风险、财务强度、价值股质量或信用质量时使用；通过 Octagon MCP 的 octagon-agent 按 Ticker 拉取 Altman Z-Score 与 Piotroski F-Score 及支撑指标并据分区解读；不适用于金融/早期/轻资产公司打分或离线无 MCP。触发词：Altman Z-Score、Piotroski、破产风险、财务健康评分、价值股筛选
domain: 领域/fintech
triggers: [Altman Z-Score, Piotroski Score, 财务健康评分, 破产风险, 信用质量分析, 价值股筛选, octagon-agent, F-Score]
tags: [fintech, 财务分析, 破产预测, 信用分析, 价值投资, MCP, octagon]
level: 进阶
status: stable
agents: [claude-code, cursor, gemini-cli, windsurf]
tools: [Octagon MCP, octagon-agent, npx, Node.js]
requires: []
related: [alpha-vantage-market-data, dcf-valuation-model, portfolio-risk-metrics, three-statement-model]
combines_with: [dcf-valuation-model, alpha-vantage-market-data, lbo-model-builder]
license: CC-BY-4.0
source: OctagonAI/skills
source_license: MIT
---
## 何时使用

当需要对一家上市公司做**快速财务体检**，得到两个标准化评分时使用：

- **Altman Z-Score**：综合营运资本、总资产、留存收益、EBIT、市值，预测**破产概率**——做信用/债券/交易对手风险评估时尤为有用。
- **Piotroski F-Score（0–9）**：从盈利能力、杠杆/流动性、运营效率三维度衡量**财务强度**——价值投资中用于在高账面市值比股票里筛优质、避开「价值陷阱」。

**不该用的边界：**

- **行业不适用**：Z-Score 源自制造业，对**金融机构、早期/初创、轻资产**公司可靠性差，勿据此下结论。
- 需要逐项自建模型、复算每个 Piotroski 准则或做敏感性分析——那是建模任务，应转 `dcf-valuation-model` / `three-statement-model`。
- **离线 / 未配置 Octagon MCP** 的环境——本条依赖 `octagon-agent` 工具，无 MCP 无法取数。
- 结果是辅助筛选信号，不能替代完整尽调与人工复核。

## 步骤

1. **确认 MCP 就绪**：环境已配置 Octagon MCP，`octagon-agent` 工具可见（Windows 需先装 Node.js / npx；配置见下「指令」）。
2. **确定标的 Ticker**（如 `TSLA`）。
3. **发起查询**：调用 `octagon-agent`，prompt 明确点名要 Altman Z-Score 与 Piotroski Score。
4. **读取双评分 + 支撑指标**（营运资本、总资产、留存收益、EBIT、市值、总负债、营收）。
5. **按分区表解读**（见下表），并做**组合判断**（Z 高/低 × Piotroski 高/低）。
6. **行业校正**：若标的是金融/早期/轻资产，明确标注评分参考价值有限。
7. （可选）追加深挖查询：拆解 Piotroski 各项、对比历史均值或同业。

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
    "prompt": "Retrieve financial health scores for TSLA, including the Altman Z-Score and Piotroski Score"
  }
}
```

**查询模板：** `Retrieve financial health scores for <TICKER>, including the Altman Z-Score and Piotroski Score.`

**Altman Z-Score 公式与分区：**

```
Z = 1.2(WC/TA) + 1.4(RE/TA) + 3.3(EBIT/TA) + 0.6(MC/TL) + 1.0(Rev/TA)
WC=营运资本 TA=总资产 RE=留存收益 EBIT=息税前利润 MC=市值 TL=总负债 Rev=营收
```

| Z-Score | 解读 |
|---|---|
| > 3.0 | 安全区 —— 破产风险低 |
| 1.8 – 3.0 | 灰色区 —— 风险中等，需监控 |
| < 1.8 | 困境区 —— 破产风险高 |

**Piotroski F-Score（9 项，每满足 1 项得 1 分）与分区：**

- 盈利能力（4 分）：① 净利润为正 ② 经营现金流为正 ③ ROA 同比改善 ④ 经营现金流 > 净利润（应计质量）。
- 杠杆/流动性（3 分）：⑤ 长期负债率下降 ⑥ 流动比率上升 ⑦ 未增发新股。
- 运营效率（2 分）：⑧ 毛利率上升 ⑨ 资产周转率上升。

| F-Score | 解读 |
|---|---|
| 8 – 9 | 强 —— 高质量价值股 |
| 5 – 7 | 中等 —— 财务健康一般 |
| 0 – 4 | 弱 —— 财务质量差 |

**双评分组合判断：**

| 组合 | 含义 |
|---|---|
| Z 高 + Piotroski 高 | 财务健康 |
| Z 高 + Piotroski 低 | 关注运营趋势恶化 |
| Z 低 + Piotroski 高 | 杠杆隐忧 |
| Z 低 + Piotroski 低 | 回避，或谨慎当深度价值 |

## 示例

查询 `TSLA` 的典型返回：

- **Altman Z-Score：16.84** —— 远高于 3.0，落在安全区，破产风险低。
- **Piotroski Score：6 / 9** —— 中等，财务健康一般。

支撑指标（USD）：营运资本 36.9B、总资产 137.8B、留存收益 39.0B、EBIT 5.6B、市值 1.40T、总负债 54.9B、营收 94.8B。数据源：`octagon-financials-agent`。

**追问深挖（按需）：**

- "Break down the individual components of TSLA's Piotroski Score"
- "How does TSLA's Altman Z-Score compare to its historical averages?"
- "Compare TSLA's financial health scores to <PEER1> and <PEER2>"

## 注意事项

- **行业偏差**：Z-Score 为制造业/成熟稳定业务设计，金融、早期、轻资产公司的评分易失真，务必在结论里标注适用性。
- **单点 vs 趋势**：单期评分只是快照，信用/价值判断应结合历史均值与同业对比，避免据一期定论。
- **组合优先**：Z 与 Piotroski 各管一面（破产风险 vs 财务强度），单看任一会误判，按上表组合解读。
- **API Key 安全**：Key 通过 `OCTAGON_API_KEY` 环境变量注入，勿硬编码；遇限流降低查询频率。
- **结果定位**：评分是筛选/预警信号，不能替代完整尽调、建模与专家复核。

## 互见

- requires：（无）
- related：`alpha-vantage-market-data`（拉取行情/基本面原始数据）、`portfolio-risk-metrics`（组合层风险度量）、`three-statement-model`（三表建模为评分提供底层财务数据）。
- combines_with：`dcf-valuation-model`（评分做健康度初筛后，对优质标的做内在价值估值）、`alpha-vantage-market-data`（补充市值/财报输入）、`lbo-model-builder`（信用质量评估配合杠杆收购可行性分析）。

---

本条采编自 OctagonAI/skills（MIT 许可），已做中文适配重写。
