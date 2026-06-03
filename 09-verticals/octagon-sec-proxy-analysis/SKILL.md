---
name: octagon-sec-proxy-analysis
title: 委托书 DEF 14A 高管薪酬与治理分析
description: 当需要从美股委托书（DEF 14A）中提取高管薪酬、董事会治理与股东投票事项时使用；经 Octagon MCP 的 octagon-agent 用自然语言提示拉取并产出结构化解读（薪酬结构/CEO 薪酬比/治理质量/say-on-pay 投票/股东提案，含数据源标注）；不适用于无 Octagon MCP、非美股 SEC 体系、或需逐字原文与投资/法律建议的场景；触发词：DEF 14A、委托书、高管薪酬、say-on-pay、公司治理、octagon-agent
domain: 领域/fintech
triggers: [DEF 14A, 委托书分析, 高管薪酬, CEO 薪酬, say-on-pay, 公司治理, 董事会构成, 股东提案, octagon-agent, octagon-mcp]
tags: [fintech, sec, def 14a, 委托书, 高管薪酬, 公司治理, say-on-pay, 股东提案, octagon, mcp, 投资研究, esg]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Octagon MCP, octagon-agent, npx]
requires: []
related: [octagon-sec-filing-analyst, octagon-sec-mda-analysis, octagon-sec-risk-factors, octagon-equity-research-analyst, octagon-esg-ratings, board-minutes-drafter]
combines_with: [diligence-issue-extractor, portfolio-risk-metrics, dcf-valuation-model]
license: MIT
source: OctagonAI/skills
source_license: MIT
---

# 委托书 DEF 14A 高管薪酬与治理分析

## 何时使用

当需要从美股上市公司的**委托书（Proxy Statement，DEF 14A）**中读取与评估高管薪酬、董事会治理与股东投票事项时使用。典型产出：高管薪酬结构（薪酬汇总表/CEO 薪酬比/CD&A）、董事会构成与独立性、薪酬-业绩对齐、say-on-pay 与董事改选投票结果、股东提案及其表决。典型场景：投资中的管理层激励对齐评估、治理筛查、维权研究、薪酬对标、ESG 中的 G 维度分析。

底层依赖 **Octagon MCP** 的 `octagon-agent` 工具（市场情报综合体），数据来源标注为 `octagon-companies-agent / octagon-sec-agent / octagon-web-search-agent`。

**不该用的边界：**
- **未配置 Octagon MCP** 或无 `OCTAGON_API_KEY` —— 先按「指令」完成 MCP 安装与鉴权，否则 `octagon-agent` 不可用。
- **非美股 SEC 体系**（如 A 股、港股、私有公司）—— DEF 14A 与 Item 402 概念不通用。
- 需要**逐字原文 / 法律级精确引用** —— 输出是结构化解读与摘要，关键数字（薪酬金额、得票率）须回原始委托书复核。
- 需要**投资买卖建议或法律意见** —— 本技能只抽取归纳已公开披露内容，不替代分析师/律师判断。
- 想要程序化拉取行情/财务数值 —— 用 `alpha-vantage-market-data` 之类数据 API 更合适。

## 步骤 / 指令

1. **确认前置**：在 AI 客户端（Cursor / Claude Desktop / Windsurf）中已配置 `octagon-mcp` 且 `octagon-agent` 工具可见（配置见下）。
2. **确定分析参数**：
   - **Ticker**（必填）：股票代码，如 `AAPL`、`MSFT`、`TSLA`。
   - **Focus Area**（可选）：薪酬 / 治理 / 提案。
   - **Comparison**（可选）：同业公司、往年对比。
3. **下发自然语言指令**调用 `octagon-agent`，把参数写进 prompt（见「示例」）。
4. **接收结构化输出**：董事/高管薪酬、治理框架、投票事项，附数据源标注。
5. **解读与提炼**：按下方分析要点评估薪酬-业绩对齐、治理质量、投票信号，必要时做 3-5 年趋势与同业对比。

**MCP 调用格式（octagon-agent）：**

```json
{
  "server": "octagon-mcp",
  "toolName": "octagon-agent",
  "arguments": {
    "prompt": "Extract executive compensation details and governance information from TSLA's latest proxy statement."
  }
}
```

**安装 Octagon MCP（npx，需 Node.js）：** 在 Octagon 注册并生成 API Key。Claude Desktop / Windsurf 配置：

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

Cursor 命令式：`env OCTAGON_API_KEY=<key> npx -y octagon-mcp`；Windows 用 `cmd /c "set OCTAGON_API_KEY=<key> && npx -y octagon-mcp"`。验证：刷新 MCP 列表应出现 `octagon-agent`。

**输出结构（典型）：** 董事/高管薪酬（股票授予、同业对标）、治理框架（董事会标准、治理政策与监督）、投票事项（say-on-pay 频率与结果、董事薪酬披露）；末尾标注 `Data Sources: octagon-companies-agent, octagon-sec-agent, octagon-web-search-agent`。

**委托书组成速查（用于设计 prompt 的 focus）：**

| 模块 | 关注点 |
|---|---|
| 高管薪酬（Item 402） | 薪酬汇总表、薪资/奖金/股票授予/期权/非权益激励/养老金/其他 |
| CEO 薪酬比 | CEO 总薪酬 ÷ 员工薪酬中位数 |
| CD&A 薪酬讨论 | 薪酬理念、固定 vs 浮动结构、业绩指标、对标同业组、决策依据 |
| 公司治理 | 董事会构成与独立性/多元化、委员会（审计/薪酬/提名）、领导结构、风险监督、股东权利 |
| 股东提案 | 治理、环境、社会、薪酬四类常见议题 |

## 示例

直接给 `octagon-agent` 自然语言提示（把 TICKER 换成目标）：

```text
# 完整委托书分析
Extract executive compensation details and governance information from TSLA's latest proxy statement.

# CEO 薪酬聚焦
What is the total compensation for AAPL's CEO in the latest proxy statement?

# 董事会构成与独立性
Analyze the board of directors composition and independence from MSFT's latest DEF 14A.

# say-on-pay 投票结果
What were the say-on-pay voting results for AMZN in their latest proxy?

# 同业薪酬对比
Compare executive compensation between GOOGL and META based on their latest proxy statements.

# 股东提案及表决
What shareholder proposals were included in JPM's latest proxy statement and how did they fare?
```

## 注意事项

**薪酬分析要点：**
- **薪酬构成参照**（占比/重点）：基础薪资 10-20%（看稳定性与变动）、现金奖金 15-25%（看指标与达成）、股票授予 40-60%（看归属与业绩条件）、期权 5-15%（看行权价与期限）、其他 1-5%（看津贴福利）。
- **薪酬-业绩对齐**：强对齐 = 薪酬随股东总回报（TSR）变动、目标具挑战性、归属与业绩挂钩、同业排名居中；弱对齐 = 薪酬与回报脱钩、门槛宽松、纯时间归属、显著高于同业。
- **薪酬红旗**：过度津贴（私人飞机/安保/住房）、保底奖金（无业绩挂钩）、期权重定价（水下期权重置）、养老金虚增、过度金降落伞、税款代付（gross-up）。

**治理评估要点：**
- **董事会质量**：独立性（强 >75% / 弱 <50%）、多元化、任期均衡、避免过度兼职（overboarding）、出席率（强 >90%）。
- **委员会**：审计/薪酬/提名委员会应全部独立，薪酬委员会无利益交叉，审计委员会含财务专家。
- **股东权利**：多数票 vs 仅相对多数、是否有代理权征集（proxy access）、特别会议门槛高低、是否允许书面同意、单一 vs 多重投票权股。

**投票解读阈值：**
- say-on-pay 支持率：>90% 强力通过 / 70-90% 可接受 / 50-70% 现担忧 / <50% 否决（需采取行动）。
- 董事改选：>95% 强支持 / 80-95% 正常 / <80% 显著反对 / <50% 落选（若为多数票制）。
- 股东提案：>50% 通过（预期跟进）/ 30-50% 显著支持 / 20-30% 中等关注 / <20% 支持有限。

**通用分析技巧：** 追踪 3-5 年趋势而非单年；通读 CD&A 理解数字背后的理由；核查对标同业是否真正可比；留意新增的薪酬要素或治理条款；支持率下滑是关切信号；复核关联交易披露的利益冲突。

**合规与限制：**
- 输出依赖 Octagon 数据源，覆盖范围与时效以 Octagon 为准；关键结论（薪酬金额、得票率）应回溯原始 DEF 14A 核验。
- 结果仅供投资研究与治理分析参考，**不构成投资建议或法律意见**，不能替代专业尽调与风控复核。
- 缺少 Ticker 时先停下确认，不要臆测代码。

## 互见

- related：`octagon-sec-mda-analysis` / `octagon-sec-risk-factors` / `octagon-sec-filing-analyst` —— 委托书治理/薪酬解读与 10-K/10-Q 文本情报互补，组成完整 SEC 文件画像。
- related：`octagon-esg-ratings` —— 委托书治理评估为 ESG 中的「G（治理）」维度提供一手依据。
- related：`board-minutes-drafter` —— 治理实践复盘可对照董事会会议纪要。
- combines_with：`diligence-issue-extractor` —— 薪酬红旗与治理弱点汇入尽调问题清单，形成投资前风险评估。
- combines_with：`portfolio-risk-metrics` —— 定性治理风险 + 定量组合风险指标，形成持仓治理风险全景。
- combines_with：`dcf-valuation-model` —— 管理层激励对齐是估值情景与折现假设的定性输入。

---
采编自 OctagonAI/skills（MIT 许可），已做中文适配重写。
