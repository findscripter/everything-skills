---
name: octagon-sector-performance-snapshot
title: 板块表现快照
description: 当需要按交易所+板块（行业）拉取整个板块的聚合基本面画像——营收、EBITDA、净利润、市值、企业价值、员工数及增速与资本结构——用于板块体检、跨板块横比或给单一公司找板块基准时使用；通过 Octagon MCP 的 octagon-agent 工具一次取数并据板块基准区间解读，区分聚合/均值/中位/加权口径；不适用于单家公司逐项建模估值、自算指标或离线无 MCP 取数。触发词：板块表现、sector performance、板块快照、行业聚合指标、板块对比、按交易所板块、octagon-agent
domain: 领域/fintech
triggers: [板块表现, sector performance, 板块快照, 行业聚合指标, 板块对比, 按交易所板块, 板块体检, 板块基准, octagon-agent, 板块营收增速]
tags: [fintech, 板块分析, 行业聚合, 基本面分析, 板块对比, 估值基准, mcp, octagon]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Octagon MCP, octagon-agent, npx, Node.js]
requires: []
related: [octagon-industry-performance-snapshot, octagon-sector-pe-ratios, octagon-industry-pe-ratios, octagon-ratings-snapshot]
combines_with: [octagon-sector-pe-ratios, octagon-equity-research-analyst]
license: MIT
source: OctagonAI/skills
source_license: MIT
---
## 何时使用

当需要对**某交易所内某个板块（行业）整体**做一次聚合基本面体检时使用：一次调用即返回该板块的营收、EBITDA、净利润、市值、企业价值、员工数，以及增速（如 YoY 营收增长）、代表公司、竞争对手与近期资本结构变化。典型用途：

- **板块体检**：判断一个板块是健康（增长、利润稳定、现金充裕、负债可控）还是承压。
- **跨板块横比**：Technology vs Healthcare 等做相对强弱、估值对比。
- **给单一公司找基准**：把某只票（如 AAPL）放进所在板块均值/基准里看相对位置。
- **板块初筛**：找增速最快、利润率最高或估值最便宜的板块/板块内公司。

**不该用的边界：**

- 想对**单家公司逐项建模、自算或复算每个指标**——那是建模任务，转 `three-statement-model` / `dcf-valuation-model`。
- 要对**单一标的做评级打分或深度估值**——用 `octagon-ratings-snapshot` / `dcf-valuation-model`，本条是板块层聚合画像而非个股结论。
- 需要个股完整三表原始数据——用 `octagon-income-statement-data` / `octagon-balance-sheet-data`。
- **离线 / 未配置 Octagon MCP** 的环境——本条依赖 `octagon-agent` 工具取数。
- 板块聚合受大市值公司主导，会掩盖板块内分化，不能据此对个股直接下注。

## 步骤

1. **确认 MCP 就绪**：环境已配置 Octagon MCP，`octagon-agent` 工具可见（Windows 需先装 Node.js / npx，配置见「指令」）。
2. **确定三要素**：**日期**（快照时点）、**交易所**（NYSE / NASDAQ…）、**板块**（Technology / Healthcare / Financials…）。
3. **发起查询**：调用 `octagon-agent`，prompt 自然语言点名要 sector performance snapshot 及关心的指标。
4. **读取核心指标**：营收、EBITDA、净利润、市值、企业价值、员工数、近期举债；附带代表公司、竞争对手、增速。
5. **按口径解读**：先分清是聚合（求和）/均值/中位/加权口径——聚合会被大市值公司拉偏。
6. **对标基准区间**：用对应板块的典型区间（见下表）判断高低，**务必同板块归一化，勿跨板块直接比绝对值**。
7. **多维度交叉**：营收+利润率+估值+负债一起看，结合宏观；标记异常值（机会或风险）。
8. （可选）追问深挖：板块内增速最快公司、某只票相对板块均值、板块利润率历史趋势、主要竞争对手。

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
    "prompt": "Retrieve a snapshot of market sector performance for 2025-02-03, filtered by exchange NASDAQ and sector Technology."
  }
}
```

**查询模板：** `Retrieve a snapshot of market sector performance for <DATE>, filtered by exchange <EXCHANGE> and sector <SECTOR>.`

数据源：`octagon-companies-agent`。

**核心指标含义：**

| 指标 | 衡量什么 |
|---|---|
| 营收 Revenue | 板块总销售 / 收入；增速看 YoY |
| EBITDA | 经营盈利能力（EBITDA / 营收 = EBITDA 利润率） |
| 净利润 Net Income | 底线利润（净利润 / 营收 = 净利率） |
| 市值 Market Cap | 股权价值 |
| 企业价值 EV | 公司整体价值；EV/营收、EV/EBITDA 为估值倍数 |
| 员工数 Employees | 规模；营收/员工 = 人效 |
| 近期举债 Recent Debt | 资本需求 / 杠杆变化信号 |

**口径区分（解读前先确认）：**

| 口径 | 含义 |
|---|---|
| 聚合 Aggregate | 板块内所有公司求和（受大市值主导） |
| 均值 Average | 每家平均 |
| 中位 Median | 居中公司 |
| 加权 Weighted | 按市值加权 |

**板块基准典型区间（同板块归一化用）：**

| 板块 | 营收增速 | EBITDA 利润率 | 净利率 | 估值倍数 |
|---|---|---|---|---|
| Technology | 10–30% | 20–40% | 10–25% | EV/营收 3–10x |
| Healthcare | 5–15% | 15–30% | 5–15% | EV/营收 2–6x |
| Financials | 3–10% | — | 15–30% | P/E 10–18x（ROE 10–15%） |
| Industrials | 3–8% | 12–22% | 5–12% | EV/EBITDA 8–14x |

## 示例

NASDAQ · Technology · 2025-02-03 的典型返回：

| 指标 | 数值 |
|---|---|
| 营收 Revenue | $29,094.00M |
| EBITDA | $12,486.00M |
| 净利润 Net Income | $3,882.00M |
| 市值 Market Cap | $113,333.57M |
| 企业价值 EV | $115,021.51M |
| 员工数 Employees | 48,000 |
| 近期举债 | 募集 $2.68B |

附带：代表公司、竞争对手、增速（如营收 YoY +71.05%）、资本结构变化。解读：高增速 + 高 EBITDA 利润率（约 43%）符合 Technology 板块特征；近期大额举债提示资本需求 / 扩张信号，需结合负债/EBITDA 看杠杆。

**追问深挖（按需）：**

- "Get performance metrics for all Healthcare companies on NYSE."
- "What are the fastest growing companies in the Technology sector?"
- "How does AAPL compare to the Technology sector average?"
- "Compare performance metrics of Technology vs. Healthcare sectors."
- "Who are the main competitors to company X in this sector?"

## 注意事项

- **同板块归一化必做**：不同板块基准天差地别（金融看 ROE/P-E，科技看营收增速/EV倍数），跨板块直接比绝对值会严重误判。
- **聚合被大市值主导**：聚合口径下少数巨头会掩盖板块内分化；下个股判断前看中位/加权与板块内分布。
- **快照非趋势**：单期是时点画像，结合历史趋势与「vs 上期 / vs 其他板块 / vs 大盘 / vs 预期」四类对比再下结论。
- **多指标并用**：营收、利润率、估值、负债、人效综合看，勿单点定论；标记异常值（潜在机会或风险）。
- **结合宏观与周期**：板块表现映射经济周期，强周期板块对时点敏感。
- **API Key 安全**：经 `OCTAGON_API_KEY` 环境变量注入，勿硬编码；遇限流降低查询频率。
- **结果定位**：板块快照是宏观/中观筛选与基准信号，不替代个股尽调与建模。

## 互见

- requires：（无）
- related：`octagon-financial-growth-metrics`（板块/个股增速指标，与板块增速互补）、`octagon-equity-research-analyst`（个股层深度研究，承接板块初筛）、`octagon-income-statement-data`、`octagon-balance-sheet-data`（个股原始三表，为板块聚合提供底层）、`portfolio-risk-metrics`（组合层风险度量）。
- combines_with：`octagon-ratings-snapshot`（板块定位后，对板块内候选个股做评级打分排序）、`dcf-valuation-model`（对板块内优质标的做内在价值估值深挖）、`octagon-stock-quote`（叠加个股实时行情/价格表现做交叉验证）。

---

本条采编自 OctagonAI/skills（MIT 许可），已做中文适配重写。
