---
name: octagon-revenue-geographic-segmentation
title: 营收地理区域分部拆解
description: 当需要把上市公司营收按地理区域分部（美洲/欧洲/大中华/日本/亚太其他）拆解，以分析区域集中度、国际化扩张、汇率与地缘风险敞口时使用；通过 Octagon MCP 的 octagon-agent 工具按 ticker 拉取多年各区域营收表（flat 结构）并算区域占比/增速、生成集中度与汇率洞察；不适用于业务线/产品分部拆解、绝对值三表建模、估值或实时行情；触发词：地理分部、区域营收、geographic segment、区域集中度
domain: 领域/fintech
triggers: [地理分部营收, 区域营收拆解, geographic segment revenue, 区域集中度, 国际化扩张/海外占比, 汇率/地缘风险敞口, Octagon MCP, octagon-agent]
tags: [fintech, 财务分析, 营收分部, 地理区域, 区域集中度, 汇率风险, octagon, mcp]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Octagon MCP, octagon-agent, npx]
requires: []
related: [octagon-revenue-product-segmentation, octagon-sec-segment-reporting, octagon-income-statement-data, octagon-financial-metrics-analysis]
combines_with: [octagon-revenue-product-segmentation, octagon-income-statement-data, octagon-equity-research-analyst]
license: MIT
source: OctagonAI/skills
source_license: MIT
---
＃ 营收地理区域分部拆解

通过 Octagon MCP 拉取上市公司营收**按地理区域分部**的多年明细（典型区域：Americas 美洲、Europe 欧洲、Greater China 大中华、Japan 日本、Rest of Asia Pacific 亚太其他），用于分析区域集中度、国际化进程、汇率与地缘风险敞口。

## 何时使用

当用户想看清一家上市公司**营收在地理上如何分布、海外占比是否在涨、对哪个区域/货币最敏感**时使用——一次拿到各区域逐年营收表，再据此算占比/增速并生成集中度、汇率、地缘风险洞察。

**不该用的边界：**
- 要的是**业务线/产品分部**而非地理分部 → 这是另一种 segmentation，本技能只覆盖按地区拆分。
- 要绝对值三表建模 → 用 `three-statement-model`；要估值/贴现 → 用 `dcf-valuation-model`。
- 要实时股价、单季 tick、技术指标 → 用 `alpha-vantage-market-data`。
- 运行环境未配置 Octagon MCP（需装好 `octagon-mcp` 并设 `OCTAGON_API_KEY`），否则 `octagon-agent` 不可用。
- 标的非 Octagon 覆盖范围（多为美股上市公司）或为私有公司 → 无数据，先确认 ticker 有效。
- 输出是 Agent 生成的分析参考，区域口径各公司不一，结论需自行复核。

## 步骤

1. **确认前置**：AI 客户端（Claude Desktop / Cursor / Windsurf）已注册 `octagon-mcp`，`octagon-agent` 工具可见；已配置 `OCTAGON_API_KEY`（app.octagonai.co 申请）。
2. **构造查询**：填 ticker、周期（annual 年度 / quarterly 季度），并要求 **flat response structure**（扁平结构便于直接读表）。
3. **调用 octagon-agent**：传入自然语言 prompt，由 octagon-financials-agent 返回逐年各区域营收表。
4. **算占比与增速**：对每个区域算区域占比与 YoY 增速（公式见下）。
5. **生成洞察**：套用区域集中度、增长趋势、汇率敞口、新兴市场、历史演变五个角度。
6. **追问下钻**：基于结果给深挖问题。

## 指令

**MCP 配置（Claude Desktop 的 `claude_desktop_config.json`）：**

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
Windows 用 `cmd /c "set OCTAGON_API_KEY=<key> && npx -y octagon-mcp"`。

**查询模板（保留源中关键 prompt，注意 flat 结构）：**

```
Retrieve detailed revenue by geographic segment for <TICKER>, for the <annual|quarterly> period with a flat response structure.
```

**MCP 调用：**

```json
{
  "server": "octagon-mcp",
  "toolName": "octagon-agent",
  "arguments": {
    "prompt": "Retrieve detailed revenue by geographic segment for AAPL, for the annual period with a flat response structure"
  }
}
```

**核心计算公式：**

```
区域占比 Region Share = Region Revenue / Total Revenue × 100
区域增速 Region Growth = (本年 − 上年) / 上年 × 100
多年复合 CAGR        = (期末值 / 期初值)^(1/年数) − 1
```

**集中度判据 + 汇率敞口速查：**

| 维度 | 判据 / 对应货币 |
|------|------|
| 美洲 Americas > 50% | 以美国为核心（US-centric），USD 计价为主 |
| 单一区域 > 60% | 高度集中，核心市场依赖、汇率/监管风险集中 |
| 无区域 > 40% | 均衡组合，天然汇率对冲、经济周期分散 |
| Europe 欧洲 | EUR、GBP 敞口（约 15–25%），监管偏严（GDPR 等）|
| Greater China 大中华 | CNY 敞口（约 10–20%），地缘敏感、本土竞争 |
| Japan 日本 | JPY 敞口（约 5–10%），成熟市场、老龄化 |
| Rest of Asia Pacific 亚太其他 | 含印度/东南亚/澳新，混合货币、高增长潜力 |

## 示例

输出形如（绝对值，单位百万美元）：

| Fiscal Year | Americas | Europe | Greater China | Japan | Rest of Asia Pacific |
|------|------|------|------|------|------|
| 2025 | 178,353 | 111,032 | 64,377 | 28,703 | 33,696 |
| 2024 | 167,045 | 101,328 | 66,952 | 25,052 | 30,658 |
| 2023 | 162,560 | 94,294 | 72,559 | 24,257 | 29,615 |

数据来源：octagon-financials-agent。

**读法（以 2025 为例）**：总营收约 416.2B，美洲 178.4B → 占比 42.9%（最大但 <50%，相对均衡）；美洲 2024→2025 增速 = (178.4−167.0)/167.0 = 6.8%；大中华连续两年下滑（72.6B→67.0B→64.4B）提示需求/地缘逆风；亚太其他与欧洲在升 = 国际化分散在推进。关注拐点：新市场进入、贸易政策、疫情、货币贬值。

**追问示例（基于结果下钻）：**
- "What factors drove the Americas segment's revenue growth from <YEAR1> to <YEAR2>?"
- "What percentage of total revenue does each geographic segment represent in <YEAR>?"
- "How has <COMPANY>'s product mix evolved across geographic segments?"
- "Compare <COMPANY>'s geographic revenue mix to <PEER1> and <PEER2>."

## 注意事项

- **区域口径不统一**：不同公司的地理分部划分各异（有的把中东非并入欧洲、把拉美并入美洲），跨公司对比前先核对各家分部定义。
- **覆盖范围**：主要为美股上市公司；非美股/私有公司多无数据，ticker 必须有效。
- **flat 结构**：prompt 中务必带 "flat response structure"，否则可能返回嵌套结构不便直接读表。
- **单位与周期**：默认百万美元；annual（FY）与 quarterly（Q）口径不可混用对比，季度还需注意季节性。
- **API Key 安全**：`OCTAGON_API_KEY` 经环境变量/配置注入，勿硬编码或外泄；超频时降低请求频率。
- 结论仅供分析参考，不能替代独立尽调、回测与专业风控复核；缺 ticker / 周期等必要输入时先停下确认。

## 互见

- related：`octagon-income-statement-data` —— 区域分部是利润表营收的下钻视角，二者互补看「总量 + 区域结构」。
- related：`octagon-financial-growth-metrics` —— 在区域营收基础上看整体 YoY 增长趋势。
- related：`octagon-sec-risk-factors`、`octagon-sec-mda-analysis` —— 招股/年报中的风险因素与 MD&A 常解释区域营收波动的成因（贸易政策、汇率、地缘）。
- combines_with：`octagon-equity-research-analyst` —— 区域拆解作为股票研究的输入，串成「分部结构 → 投资观点」。
- combines_with：`dcf-valuation-model`、`three-statement-model` —— 区域增长假设可驱动估值与三表建模。
- related：`alpha-vantage-market-data` —— 另一条 fintech 财务/行情数据获取通道（REST API）。

---
采编自 OctagonAI/skills（MIT 许可），已做中文适配重写。
