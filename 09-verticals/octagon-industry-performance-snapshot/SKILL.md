---
name: octagon-industry-performance-snapshot
title: 行业表现每日快照
description: 当需要按交易所+行业看某一交易日的行业整体表现（平均涨跌幅）、判断板块强弱或捕捉轮动信号时使用；通过 Octagon MCP 的 octagon-agent 工具用自然语言按日期/交易所/行业拉取行业每日平均变动，并据分区表解读量级、算超额 Alpha、识别催化与动量；不适用于个股逐笔/分钟级行情、自建因子重算或离线无 MCP 取数。触发词：行业快照、industry performance、板块涨跌、平均变动、行业轮动、octagon-agent
domain: 领域/fintech
triggers: [行业快照, industry performance, 板块涨跌, 平均变动, 行业轮动, sector rotation, 行业表现, 板块强弱, 动量追踪, octagon-agent]
tags: [fintech, 行业表现, 板块分析, 行业轮动, 动量分析, mcp, octagon]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Octagon MCP, octagon-agent, npx, Node.js]
requires: []
related: [octagon-sector-performance-snapshot, octagon-industry-pe-ratios, octagon-sector-pe-ratios, octagon-stock-price-change]
combines_with: [octagon-equity-research-analyst, octagon-batch-market-cap]
license: MIT
source: OctagonAI/skills
source_license: MIT
---
## 何时使用

当需要**按交易所+行业**了解**某个交易日的行业整体表现**（核心指标=行业平均涨跌幅 Average Change）时使用，典型场景：

- **每日盯盘**：今天某行业（如生物科技、半导体）在 NASDAQ/NYSE 涨跌如何。
- **催化研究**：FDA 批文、财报季、利率决议等事件后，某行业的反应幅度。
- **板块轮动**：哪些行业在领涨/领跌，判断 risk-on 还是 risk-off。
- **动量追踪**：连续几日观察某行业是否形成趋势（单日是噪声，多日才是信号）。

**不该用的边界：**

- 需要**个股逐笔 / 分钟级行情或盘口**——本条只给行业级日度聚合，转个股行情类技能（如 `octagon-stock-quote`）。
- 想**自建因子、复算成分股加权或做归因模型**——本条只返回平均变动，不暴露成分明细。
- 需要**估值/基本面快照**（P/E、评级等）——用 `octagon-ratings-snapshot`、`octagon-financial-health-scores`。
- **离线 / 未配置 Octagon MCP** 的环境——本条依赖 `octagon-agent` 工具，无 MCP 无法取数。
- 平均变动是方向性聚合信号，不替代对成分广度（breadth）与成交量的核验。

## 步骤

1. **确认 MCP 就绪**：环境已配置 Octagon MCP，`octagon-agent` 工具可见（Windows 需先装 Node.js / npx，配置见「指令」）。
2. **确定三要素**：日期（Date，交易日）、交易所（Exchange，如 NASDAQ/NYSE）、行业（Industry，如 Biotechnology/Semiconductors/Software）。
3. **发起查询**：调用 `octagon-agent`，用自然语言点名要某日某交易所某行业的 daily performance overview。
4. **读取平均变动**（Average Change）并按分区表判断量级。
5. **算超额（Alpha）**：`Alpha = 行业收益 − 市场收益`，判断跑赢/跑平/跑输大盘。
6. **结合上下文**：核对是否有催化事件、行业常态波动率、成交量与广度，再做多日趋势判断。

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

API Key 在 https://app.octagonai.co （或 https://octagonagents.com）注册后于 API Keys 菜单生成。Windows 命令行临时启动：`cmd /c "set OCTAGON_API_KEY=<key> && npx -y octagon-mcp"`。

**MCP 调用：**

```json
{
  "server": "octagon-mcp",
  "toolName": "octagon-agent",
  "arguments": {
    "prompt": "Retrieve a daily overview of industry performance for 2025-01-09, filtered by exchange NASDAQ and industry Biotechnology."
  }
}
```

**查询模板：** `Retrieve a daily overview of industry performance for <DATE>, filtered by exchange <EXCHANGE> and industry <INDUSTRY>.`

数据源：`octagon-stock-data-agent`。

**平均变动（Average Change）量级分区：**

| 变动 | 解读 |
|---|---|
| >5% | 异常（重大催化） |
| 2–5% | 强势 |
| 0.5–2% | 温和上行 |
| −0.5%~+0.5% | 走平 |
| −2%~−0.5% | 温和下行 |
| <−5% | 显著下跌 |

**超额收益（Alpha）：** `Alpha = 行业收益 − 市场收益`。例：行业 +7.89%、市场 +0.5% → Alpha +7.39%（显著跑赢）。

**常见催化与预期影响：**

| 催化 | 影响 |
|---|---|
| FDA 批准 | 生物科技 +3~10% |
| 财报季 | 不定 |
| 利率决议 | 金融 ±2~5% |
| 产品发布 | 科技 +1~3% |

生物科技专项：Phase 3 成功 +5~20%；FDA 批准 +5~15%；临床受挫 −5~30%；并购公告 +10~50%。

## 示例

查询「2025-01-09 NASDAQ 生物科技」的典型返回：

| 指标 | 值 |
|---|---|
| 行业 | Biotechnology |
| 交易所 | NASDAQ |
| 日期 | 2025-01-09 |
| 平均变动 | +7.89% |

解读：+7.89% 落入 >5% 区间，属重大催化驱动的异常强势；相对大盘 +0.5% 的 Alpha 约 +7.39%，显著跑赢，多半由 FDA 批文或临床利好驱动。

**其他自然语言查询：**

- 半导体（今日）：`Get today's performance for the Semiconductor industry on NASDAQ.`
- 多行业对比：`Compare daily performance of Software, Hardware, and Semiconductors on NASDAQ.`
- 历史事件日：`What was the Biotechnology industry performance on the last FDA approval day?`
- 趋势分析（一周）：`Show industry performance for Healthcare on NYSE over the past week.`

## 注意事项

- **比大盘才有意义**：行业涨跌须对照 S&P 500 / NASDAQ，算出 Alpha 才能判断真实强弱。
- **波动率因行业而异**：生物科技 ±5% 是常态，公用事业 ±5% 则是异常；别用统一阈值套所有行业。
- **单日是噪声，多日才是信号**：连续上涨/下跌才构成动量，单日大涨需找催化解释。
- **成交量与广度**：高量确认走势、低量打折扣；同时看有多少成分股参与（breadth），避免被个别权重股带偏。
- **交易所特征**：NASDAQ 偏科技/成长、波动更大、FDA 敏感；NYSE 更分散、大盘股为主、走势更稳。
- **API Key 安全**：Key 经 `OCTAGON_API_KEY` 环境变量注入，勿硬编码；遇限流降低查询频率。

## 互见

- requires：（无）
- related：`octagon-ratings-snapshot`（行业内个股的评级与基本面初筛）、`octagon-price-target-consensus`（分析师目标价共识，补充自上而下视角）、`octagon-stock-quote`（钻取行业内个股当前价）、`octagon-equity-research-analyst`（对领涨/领跌标的做深度研究）。
- combines_with：`octagon-financial-health-scores`（识别出强势行业后，对成分股做财务强度筛选）、`octagon-earnings-call-sentiment`（用财报电话情绪解释行业当日的催化来源）。

---

本条采编自 OctagonAI/skills（MIT 许可），已做中文适配重写。
