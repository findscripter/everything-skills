---
name: octagon-earnings-analyst-questions
title: 财报电话会分析师提问主题提取
description: 当需要从财报电话会 Q&A 中提取分析师关切主题、按提问人归因并做主题分类时使用；经 Octagon MCP 分析指定股票代码最新一期电话会，产出关键主题、分析师归因、关切分级、管理层回应质量、未答问题、热度/季度趋势与带页码引用的结构化结论并生成深挖追问；不适用于无 Octagon MCP/API Key 的环境，也不直接给买卖/下单指令；触发词：分析师提问、earnings call Q&A、提问主题归因
domain: 领域/fintech
triggers: [分析师提问主题, earnings call Q&A 分析, 分析师关切归因, 管理层回应质量, 未答/回避问题 unanswered, 提问热度 heat map, 季度环比提问趋势, Octagon MCP]
tags: [fintech, 财报电话会, 分析师问答, Q&A, 提问归因, 投研, Octagon MCP, 尽调]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Octagon MCP, octagon-mcp, Node.js, npx]
requires: []
related: [octagon-earnings-call-analysis, octagon-earnings-qa-analysis, octagon-earnings-call-sentiment, octagon-earnings-financial-guidance]
combines_with: [octagon-equity-research-analyst]
license: MIT
source: OctagonAI/skills
source_license: MIT
---
# 财报电话会分析师提问主题提取

## 何时使用

当需要把**财报电话会 Q&A 环节**中分析师的提问拆成可投研消费的结构化结论时使用，覆盖：

- 提取分析师抛出的**关键主题与关切**（财务 / 战略 / 运营 / 风险四大类）。
- 做**提问人归因**（哪位分析师、哪家机构问了什么）。
- 评估**管理层回应质量**与**问题解决状态**（已答 / 部分答 / 回避 / 未答）。
- 量化**提问热度**（同一主题问几次、追问几次 = 优先级），并做**季度环比趋势**与**同业横比**。
- 自动**生成深挖追问**，保留逐字稿**页码引用**便于回溯。

典型场景：财报季批量覆盖、投资尽调、衡量 Street 关切焦点、风险扫描、同业关切对比、财报前预判可能被问到的主题、评估管理层应答水平。

**不该用的边界：**
- 想要直接买入/卖出/下单指令 —— 本技能只做 Q&A 文本分析，不给交易决策。
- 需要拉取行情或基本面数字 —— 那是行情 API 的活，配合 `alpha-vantage-market-data`。
- **未配置 Octagon MCP 或没有 `OCTAGON_API_KEY`** —— 数据源不可用，无法运行；目标公司电话会无可用转写（非公开会/未覆盖标的）同理。
- 只想看管理层准备好的讲稿基调或全场指引 —— 那是 `octagon-earnings-call-sentiment` / `octagon-earnings-call-analysis` 的职责，本技能聚焦「分析师怎么问」这一层。
- 单次提问热度不能当作行情预测的充分依据；提问强度与股价反应常背离。

## 步骤

1. **确认前置**：Octagon MCP 已配置且 `OCTAGON_API_KEY` 可用（见下「指令」）。
2. **整体提取**：对目标股票代码 `<TICKER>` 发起一次整体「分析师关切主题」查询，拿全貌。
3. **定向深挖**（按需）：全部关切 / 单一主题（如 AI、毛利、China）/ 参会分析师名单 / 最高频主题 / 被回避或未充分回答的问题，逐条追问。
4. **结构化归档**：按「主题 → 提问人/机构 → 关切分级 → 回应质量 → 解决状态」整理成表，保留页码引用。
5. **量化热度**：用提问数 + 追问数 + 分析师资历 + 管理层用时构建热度表（High/Medium/Low）。
6. **趋势与横比**：与上一季度的提问分布对比（上升/下降/稳定/新增），并与同业同主题横比。
7. **跟进追问**：拿 AI 生成的 follow-up 问题继续下钻或人工核实，必要时与 10-Q/10-K 交叉验证。

## 指令

**配置 Octagon MCP**（前置，一次性）。需 Node.js（含 `npx`），到 Octagon 控制台申请 API Key，在 MCP 客户端注册 server：

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

```text
# Windows 命令行格式
cmd /c "set OCTAGON_API_KEY=<your-api-key> && npx -y octagon-mcp"
```

验证 `node -v && npm -v && npx -v` 均有版本号；Key 含义敏感，**勿硬编码**进代码，经环境变量注入。

**整体提取**（先跑这一句拿全貌，把 `<TICKER>` 换成代码如 TSLA）：

```text
Identify key themes and concerns raised by analysts during <TICKER>'s latest earnings call.
```

**定向追问**（按维度逐条发起）：

```text
# 全部关切
What concerns did analysts raise in <TICKER>'s latest earnings call?

# 单一主题（示例 AI，可替换）
What questions did analysts ask about AI in <TICKER>'s earnings call?

# 参会分析师名单（归因用）
Which analysts participated in <TICKER>'s earnings call Q&A?

# 最高频主题
What were the most frequently asked topics in <TICKER>'s earnings call?

# 被回避/未充分回答的问题
Were there questions that management avoided or didn't fully answer in <TICKER>'s call?
```

**提问主题四大类（归类提取结果）：**

| 大类 | 典型子项 |
|------|----------|
| 财务 | 营收（分部增长/定价/需求）、毛利（成本结构/定价权）、指引、资本配置 |
| 战略 | 增长举措（新品/新市场）、竞争（份额/差异化）、并购、技术路线 |
| 运营 | 执行（产能/效率）、供应链（采购/成本/风险）、用工、地域表现 |
| 风险 | 监管/政策、宏观周期、竞争威胁/颠覆、交付与时间线 |

**提问意图与「弦外之音」对照（判断分析师真实立场）：**

| 提问措辞 | 真实含义 |
|----------|----------|
| "Help us understand..." | 我对此存疑 |
| "I just want to clarify..." | 这看起来不对 |
| "Some investors are asking..." | 我担心这件事 |
| "Looking out longer term..." | 短期看着偏弱 |

**关切分级 + 解决状态（评估应答）：**

| 分级 | 信号 |  | 状态 | 含义 |
|------|------|--|------|------|
| Critical | 多名分析师、有 pushback、未解决 |  | Resolved | 给了清晰具体答复 |
| High | 多次提问、细致追问 |  | Partially | 有细节但仍有缺口 |
| Medium | 标准提问、应答尚可 |  | Deflected | 被转移、未正面回答 |
| Low | 单次提及、简短带过 |  | Unresolved | 回避、承诺后续更新 |

**热度表（量化主题优先级）：** 提问数 + 追问数 + 分析师资历 + 管理层用时 → 标注 High/Medium/Low。追问越多往往说明前一轮答复不充分。

**归因要点：** 同一分析师反复同一主题 = 持续关切；多名分析师同一主题 = 普遍关切；首次出现的新主题 = 新风险/机会浮现；细致追问 = 对回应不满意。

## 示例

最小查询：

```text
Identify key themes and concerns raised by analysts during TSLA's latest earnings call.
```

返回（结构化，节选，来源 `TSLA_Q22025`）：

```text
关键分析师提问
- Robotaxi 业务融资 —— 分析师追问扩张 Robotaxi 的资金从何而来：靠汽车业务现金流还是另寻融资 [Dan Meir Levy]
- FSD 营收潜力 —— 关注 FSD 订阅的趋势与变现策略 [Mark Trevor Delaney]
- Megapack 销售影响 —— 太阳能项目税收抵免取消，是否冲击 Megapack 销售管线
- 激励退坡与自动驾驶挑战 —— 警示美国补贴流失叠加自动驾驶早期风险，或致几个艰难季度 [Elon Musk]
- 低价车型细节 —— 索要量产时间线与降本路径的更多信息 [Lars Moravy]

追问（AI 生成）
- Tesla 为 Robotaxi 业务给出了哪些具体融资机制？
- 如何对冲美国税收激励流失的风险？
- 低价车型量产投产的预计时间线？

来源：TSLA_Q22025，页码 5
```

返回结构含：关键主题、分析师归因、关切分类、管理层回应、AI 追问、逐字稿页码引用。引用格式 `TICKER_Q#YEAR` + `Page: #`，多源时交叉引用。

**季度环比趋势示例：** FSD 1→2→3→4（上升=关切升温）、Margins 3→2→2→1（下降=问题缓解）、China 2→3→2→2（稳定=持续监控）。

## 注意事项

- **强依赖 Octagon MCP**：没有该 MCP 与有效 `OCTAGON_API_KEY` 则无法运行；Key 经环境变量注入，确保无多余空格，**勿硬编码**。
- **重点抓未答与 pushback**：管理层回避/转移的问题、分析师反复追问的主题，往往是最该深挖的风险；用解决状态表（Resolved/Partially/Deflected/Unresolved）落标签。
- **归因要可比**：记录分析师姓名与机构，跨季度跟踪「谁反复问什么」；同主题多人问 = 普遍关切，需提到组合风险评估里。
- **量化优先级**：用提问数 + 追问数 + 分析师资历构建热度表，别被单条高声量误导；追问数高=前序答复不足。
- **页码引用要保留**：结论须可回溯到逐字稿页码（如 `TSLA_Q22025, Page: 5`），便于复核与研报署名。
- **不是交易信号**：仅供投研参考，不构成投资建议；须结合财务、指引、价格反应与风控独立复核，与 10-Q/10-K 交叉验证；输入缺失或边界不清时先停下确认。

## 互见

- related：`octagon-earnings-call-analysis` —— 全场指引/战略分析，叠加「分析师怎么问」这一层。
- related：`octagon-earnings-call-sentiment` —— 管理层语气情绪，与分析师关切交叉验证「说了什么 + 怎么说 + 被追问什么」。
- related：`octagon-price-target-consensus`、`octagon-sec-risk-factors`、`octagon-sec-mda-analysis` —— 把分析师关切对照目标价共识、10-K 风险因素与 MD&A。
- related：`alpha-vantage-market-data` —— 需要行情/基本面数字佐证关切时拉取数据（其 `EARNINGS_CALL_TRANSCRIPT` 接口可作纯 API 替代）。
- combines_with：`octagon-equity-research-analyst`、`earnings-trade-analyzer`、`octagon-analyst-estimates` —— 把提问关切并入卖方式研报、财报交易研判与「指引 vs 一致预期」对比。
- 源仓库另有 `earnings-qa-analysis`（关切 + 管理层应答）、`stock-grades`、`stock-price-change` 等配套技能，本库暂未单列，可按需扩展。

---
采编自 OctagonAI/skills（MIT 许可），版权归 OctagonAI，已做中文适配重写。
