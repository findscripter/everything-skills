---
name: octagon-sec-10k-analysis
title: SEC 10-K 年报分析
description: 当需要对单家美股上市公司的 SEC 10-K 年报做整体分析、一次性抽取财务指标/风险因素/业务概览/MD&A 与披露要点时使用；经 Octagon MCP 的 octagon-agent 用自然语言提示拉取并产出带来源页码的结构化年报解读（数据源 octagon-financials-agent、octagon-sec-agent）；不适用于无 Octagon MCP/无 API Key、非美股 SEC 体系、需逐字法律级引用或下单交易；触发词：10-K、年报分析、SEC 年报、财务指标提取、风险因素、octagon-agent
domain: 领域/fintech
triggers: [10-K, 年报分析, SEC 年报, 财务指标提取, 风险因素, octagon-agent, octagon-mcp, 业务概览 MD&A, 同比对比 10-K, 上市公司年报解读]
tags: [fintech, sec, 10-k, 年报分析, 风险因素, md&a, 财务指标, octagon mcp, 投资研究, 尽职调查]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Octagon MCP, octagon-agent, npx]
requires: []
related: [octagon-sec-mda-analysis, octagon-sec-risk-factors, octagon-sec-filing-analyst, octagon-sec-8k-analysis]
combines_with: [octagon-equity-research-analyst]
license: MIT
source: OctagonAI/skills
source_license: MIT
---
# SEC 10-K 年报分析

> 角色定位：年报研究分析师。基于单份 SEC 10-K，一次性抽取并组织财务指标、风险因素、业务概览、MD&A 与合规披露，产出带来源页码的结构化解读。受众=投研/尽调/合规团队。

## 何时使用

当需要对某美股上市公司**单份 10-K 年报**做整体解读时使用，典型产出：核心财务指标、Item 1A 风险因素、Item 1 业务概览、Item 7 MD&A、Item 3 诉讼、审计意见，以及与上年的同比变化。底层依赖 **Octagon MCP** 的 `octagon-agent`（市场情报综合体，覆盖 SEC 文件/财报/财务/行情），数据源标注 `octagon-financials-agent`、`octagon-sec-agent`。

**不该用的边界：**
- 未配置 Octagon MCP 或无 `OCTAGON_API_KEY` —— 先按「指令」完成安装与鉴权，否则工具不可用。
- 非美股 SEC 披露体系（A 股、港股、非上市公司）—— 该工具针对 SEC EDGAR。
- 需逐字原文 / 法律级精确引用 —— `octagon-agent` 返回结构化摘要，关键结论须回原始 filing 复核。
- 需实盘下单、撮合、实时 tick 行情 —— 本条只做文本情报解读，不做交易。
- 多份申报（10-K/10-Q/8-K/proxy）跨文件全套尽调编排 —— 用 `octagon-sec-filing-analyst` 走六阶段；只看 MD&A 用 `octagon-sec-mda-analysis`；只看风险因素用 `octagon-sec-risk-factors`。

## 步骤

1. **确认 MCP 就绪**：AI 客户端（Cursor / Claude Desktop / Windsurf）已配置 `octagon-mcp` 且 `octagon-agent` 可见（配置见「指令」）。
2. **确定分析参数**：
   - Ticker（必填）：股票代码，如 AAPL、MSFT、GOOGL。
   - Filing Year（可选）：指定财年，缺省取最新。
   - Focus Areas（可选）：财务指标 / 风险因素 / 业务分部 / MD&A / 诉讼 等。
3. **用自然语言提示调用 `octagon-agent`**，把参数写进 prompt（见「示例」）。
4. **解读输出三大块**：财务指标、风险因素、来源引用（页码）。
5. **结合 10-K 结构定位**：用下方章节表把抽取项落到具体 Item，便于核验与深挖。
6. **交叉验证与提炼**：对照上年 10-K 做同比、检查审计意见与诉讼、必要时配 10-Q 取期间内更新。

## 指令

**安装 Octagon MCP（npx，需 Node.js）：** 在 Octagon 注册并于 API Keys 页生成 Key 妥善保存。

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

- Cursor 命令式：`env OCTAGON_API_KEY=<key> npx -y octagon-mcp`；Windows：`cmd /c "set OCTAGON_API_KEY=<key> && npx -y octagon-mcp"`。
- 验证：刷新 MCP 列表应出现 `octagon-agent`，用 `Retrieve the current stock price for AAPL` 冒烟测试。

**MCP 调用格式（octagon-agent）：**

```json
{
  "server": "octagon-mcp",
  "toolName": "octagon-agent",
  "arguments": {
    "prompt": "Analyze the latest 10-K filing for AAPL and extract key financial metrics and risk factors."
  }
}
```

**典型输出结构：** Financial Metrics（Total Revenues / Net Income / Total Assets / Total Liabilities / Operating/Investing/Financing Cash Flows）+ Risk Factors（宏观/运营/监管/网络安全/供应链）+ Source Citations（具体页码）；末尾标注 `Data Sources: octagon-financials-agent, octagon-sec-agent`。

**10-K 章节速查（用于定位与设计 focus）：**

| 章节 | 内容 |
|------|------|
| Part I, Item 1 | 业务概览 |
| Part I, Item 1A | 风险因素 |
| Part I, Item 3 | 诉讼 Legal Proceedings |
| Part II, Item 7 | MD&A 管理层讨论与分析 |
| Part II, Item 7A | 定量与定性市场风险披露 |
| Part II, Item 8 | 财务报表（含审计意见） |
| Part II, Item 9A | 内控与披露程序 |

**关键指标速查：** 总营收（收入表，顶线）、净利润（收入表，底线）、总资产/总负债（资产负债表）、经营现金流/自由现金流（现金流量表）、分部收入（附注，业务结构）。

**风险因素分类：** 宏观（衰退/通胀/利率）、运营（供应链/制造/质量）、监管（合规/法律）、竞争（定价压力）、技术（网络安全/IP/淘汰）、财务（汇率/信用/流动性）、战略（并购整合/扩张）。

## 示例

直接给 `octagon-agent` 自然语言提示（把 TICKER 换成目标）：

```
# 标准 10-K 分析
Analyze the latest 10-K filing for AAPL and extract key financial metrics and risk factors.

# 风险因素聚焦
Extract and summarize all risk factors from TSLA's latest 10-K filing.

# 业务分部分析
Analyze the business segment disclosures in MSFT's latest 10-K filing.

# MD&A 提取
Extract the Management Discussion and Analysis (MD&A) section from AMZN's latest 10-K.

# 同比对比
Compare key financial metrics between GOOGL's 2024 and 2023 10-K filings.

# 指定章节提取
Extract the legal proceedings section from META's latest 10-K filing.
```

## 注意事项

- **先验证 MCP 与 Key**：Key 字符串无多余空格；连不上先查网络与 Octagon 可达性；遇限流降低请求频率。
- **结论回原文复核**：输出为解读/摘要，重要数字与表述须对照原始 10-K 与财务报表核验。
- **逐年对比**：新增/删除的风险因素、措辞变化都是信号；变化往往比绝对值更说明问题。
- **细读 MD&A**：管理层叙述常提供数字背后的语境，应与财务数字一致，背离即关注点。
- **查审计意见**：位于 Item 8，揭示对财务报表的保留或持续经营疑虑。
- **看诉讼（Item 3）**：在审诉讼可能影响财务。
- **分部分析**：按分部拆解能看出哪块业务驱动增长或拖累表现。
- **配 10-Q**：季报含期间内更新；关注现金流 < 净利润、债务上升而 EBITDA 持平、持续经营/重大缺陷措辞等红旗。
- 输出仅供投资研究参考，不构成投资建议；不能替代尽调、风控与专家复核。缺关键参数（如 Ticker）时先停下确认。

## 互见

- requires：`无`（仅需前置配置 Octagon MCP 环境）。
- related：`octagon-sec-mda-analysis`（只解读 Item 7 MD&A）、`octagon-sec-risk-factors`（只抽 Item 1A 风险因素）、`octagon-equity-research-analyst`、`alpha-vantage-market-data`（配行情/财务 API 做定量交叉验证）。
- combines_with：`octagon-sec-filing-analyst` —— 把单份 10-K 解读纳入跨文件六阶段尽调编排；`dcf-valuation-model`、`three-statement-model` —— 把年报提炼的营收/利润率/现金流假设喂进估值与建模；`diligence-issue-extractor` —— 把年报红旗汇入尽调问题清单。

---

本条采编自 OctagonAI/skills（MIT 许可），已做中文适配重写。
