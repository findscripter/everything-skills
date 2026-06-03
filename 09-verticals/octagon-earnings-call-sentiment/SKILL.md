---
name: octagon-earnings-call-sentiment
title: 财报会管理层情绪分析
description: 当需要评估上市公司财报电话会上管理层语气、信心与前瞻措辞时使用；经 Octagon MCP 对最新一期电话会做情绪/语气分析，产出乐观度、信心等级、风险表态、季度环比情绪变化及带页码引用的结构化结论；不适用于无法获取转写文本的非公开会，也不直接给出买卖/下单建议；触发词：财报电话会情绪、管理层语气、前瞻信心
domain: 领域/fintech
triggers: [财报电话会情绪, 管理层语气分析, CEO 信心水平, 前瞻性表态 forward-looking, 风险表态/挑战回应, 季度环比情绪变化, Octagon MCP, earnings call sentiment]
tags: [fintech, 财报电话会, 情绪分析, 管理层语气, 前瞻指引, mcp, 投研]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Octagon MCP, octagon-mcp, Node.js, npx]
requires: []
related: [octagon-earnings-call-analysis, octagon-equity-research-analyst, octagon-sec-mda-analysis, octagon-price-target-consensus]
combines_with: [octagon-equity-research-analyst, octagon-earnings-call-analysis, earnings-trade-analyzer]
license: MIT
source: OctagonAI/skills
source_license: MIT
---
## 何时使用

当需要判断某上市公司**最新一期财报电话会**上管理层的整体情绪与语气，以衡量其信心、乐观度与战略前瞻时使用。典型问题：本季管理层是乐观还是谨慎？CEO 信心如何？前瞻表态偏积极还是回避风险？情绪相比上季是升是降？

**不该用的边界：**
- 未配置 Octagon MCP，或目标公司电话会无可用转写文本（非公开会/未覆盖标的）—— 无数据源可分析。
- 想要直接的买入/卖出/下单决策 —— 本技能只产出情绪与语气解读，不给交易指令；结论须经独立风控与投研复核。
- 需要逐字稿全文、财务数字逐项核对或分析师问答细节 —— 那是 `earnings-call-analysis` / `earnings-qa-analysis` 的职责，本技能聚焦「情绪/语气」一层。
- 不要把单次情绪标签当作行情预测的充分依据；语气与股价反应常背离。

## 步骤

1. **配置 Octagon MCP**（首次）：注册取 `OCTAGON_API_KEY`，把 octagon-mcp 注册为 MCP server（见下「指令」）。
2. **整体情绪分析**：对 `<TICKER>` 最新一期电话会发起总体情绪/语气查询。
3. **定向细分**（按需）：CEO 语气与信心、前瞻情绪、风险/挑战回应方式、信心指标、季度环比情绪变化。
4. **对照框架解读**：用「情绪分级 / 信心指标 / 语气分类 / 措辞模式」四张表把自然语言结论落到可比标签。
5. **留存引用**：记录返回的转写来源与页码（如 `NVDA_Q32026, Pages: 3-9`），便于复核。

## 指令

注册 MCP server（Claude Code，需先装 Node.js / npx）：

```bash
# 通用（mcpServers 配置）
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

```text
# Windows 命令行格式
cmd /c "set OCTAGON_API_KEY=<your-api-key> && npx -y octagon-mcp"
```

向 MCP 发起的查询（自然语言，把 `<TICKER>` 换成代码如 NVDA）：

```text
# 整体情绪与语气
Analyze the overall sentiment and tone of management during <TICKER>'s latest earnings conference call.

# CEO 语气与信心
Analyze the CEO's tone and confidence level in <TICKER>'s latest earnings call.

# 前瞻情绪
What is the forward-looking sentiment in <TICKER>'s earnings call?

# 风险/挑战回应
How did management address challenges and risks in <TICKER>'s earnings call?

# 信心指标
Identify confidence indicators in <TICKER>'s management commentary.

# 季度环比情绪变化
Has management's sentiment changed from the prior quarter in <TICKER>'s call?
```

**返回结构（结构化情绪结论）：** 整体情绪（乐观/中性/谨慎）、信心等级（高/中/低）、关键主题、风险表态方式、前瞻聚焦、来源页码引用。

**情绪分级量表：**

| 情绪 | 典型信号 | 隐含倾向 |
|------|----------|----------|
| 非常乐观 | 最高级措辞、兴奋、上调指引 | 强多 |
| 乐观 | 自信措辞、积极展望 | 偏多 |
| 中性 | 平衡、克制、陈述事实 | 平稳 |
| 谨慎 | 模糊、加保留、给区间 | 存隐忧 |
| 悲观 | 强调挑战、下调指引 | 偏空 |

**信心指标对照（高信心 vs 低信心措辞）：**

| 高信心 | 低信心 |
|--------|--------|
| "We will..." | "We hope to..." |
| "Strong momentum" | "Challenging environment" |
| "Clear visibility" | "Uncertain conditions" |
| "Exceeding expectations" | "Working through issues" |
| 给具体数字 | 给宽区间 |

**语气分类：** 自信（We're well-positioned）/ 热情（Tremendous opportunity）/ 克制（We're monitoring）/ 防御（Let me clarify）/ 谨慎（Subject to）。

**分段对照（同一场会，不同段语气往往不同）：** 准备好的讲稿打磨且积极，CEO 开场看战略信心，CFO 段看指引信心，**Q&A 最易暴露真实情绪**。

## 示例

```text
Analyze the overall sentiment and tone of management during NVDA's latest earnings conference call.
```

返回（节选）：NVDA 管理层在 Q3 2026 电话会上整体「乐观且自信」，聚焦增长与战略执行——强调创纪录环比营收与显著同比增长；对把握新兴市场与技术机会有信心；突出最新架构的成功；扩大合作与生态布局；虽承认投入成本压力，但对靠运营效率维持健康毛利保持乐观；语气整体偏长期增长与行业领先。来源：`NVDA_Q32026, Pages: 3-9`。

## 注意事项

- **依赖 MCP 配置**：先确保 octagon-mcp 已注册且 `OCTAGON_API_KEY` 无多余空格，否则查询报错。
- **结论可比性**：把自然语言结论落到上面四张表的标签，才能做季度环比与同行横比；建议记录每季「整体情绪/信心等级/挑战聚焦度」追踪拐点。
- **关注矛盾与分段差异**：语气与信息不一致、讲稿乐观而 Q&A 闪躲、CEO 与 CFO 信号不同步，都是值得追问的信号。
- **不是交易信号**：情绪解读仅供投研参考，需结合财务、指引、价格反应与风控独立复核；缺数据或边界不清时先停下确认。
- **来源核验**：始终保留返回的 ticker_季度_页码引用，便于回溯原文。

## 互见

- requires：先配置 Octagon MCP（见 `references/mcp-setup.md` 思路），否则无数据源。
- related：`alpha-vantage-market-data`（行情/新闻情绪数据接入）、其他 Octagon 财报系技能（`earnings-financial-guidance` 指引信心、`price-target-consensus` 目标价共识）。
- combines_with：`earnings-call-analysis`（全场分析叠加情绪层）、`earnings-qa-analysis`（分析师关切 vs 管理层语气）、`earnings-financial-guidance`（指引 + 信心等级）—— 组合可从「说了什么 + 怎么说」两面交叉验证一份财报会。

---
采编自 OctagonAI/skills（MIT 许可），已做中文适配重写。
