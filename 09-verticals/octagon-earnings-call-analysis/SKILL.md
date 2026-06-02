---
name: octagon-earnings-call-analysis
title: 财报电话会纪要分析
description: 当需要从财报电话会（earnings call）逐字稿中提取前瞻指引、战略重点、运营挑战与供应链信号并自动生成深挖追问时使用；借助 Octagon MCP 分析指定股票代码的最新电话会纪要，产出含营收/毛利/费用/税率指引、风险因素、AI 追问与逐字稿页码引用的结构化分析；不适用于实盘交易、行情数据拉取或无 Octagon MCP/API Key 的环境；触发词：财报电话会、earnings call、前瞻指引
domain: 领域/fintech
triggers: [财报电话会分析, earnings call transcript, 前瞻指引 guidance, 管理层战略重点, 运营挑战 headwinds, 供应链风险, AI 生成追问, Octagon MCP]
tags: [fintech, 财报, 电话会议, 前瞻指引, 投研, Octagon MCP, 尽调]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Octagon MCP, npx, Node.js]
requires: []
related: [octagon-earnings-call-sentiment, octagon-sec-mda-analysis, octagon-equity-research-analyst, octagon-sec-filing-analyst]
combines_with: [octagon-equity-research-analyst, earnings-trade-analyzer]
license: MIT
source: OctagonAI/skills
source_license: MIT
---
# 财报电话会纪要分析

## 何时使用

当需要把一份**财报电话会逐字稿**（earnings call transcript）快速拆成可投研消费的结构化结论时使用，覆盖：

- 提取**前瞻指引**（营收增速、分部展望、毛利/营业利润率、OpEx、税率、EPS、CapEx、FCF）。
- 识别**战略重点 / 投资优先级**（新市场、产品、合作、研发与地域扩张）。
- 归纳**运营挑战与风险因素**（供应约束、宏观逆风、竞争压力）。
- 自动**生成深挖追问**，并给出逐字稿**页码引用**便于回溯。

典型场景：财报季批量覆盖、投资尽调、同业指引对比、把指引喂入财务模型、撰写研报、风险扫描。

**不该用的边界：**
- 需要实盘下单 / 券商撮合 —— 本技能只做文本分析，不做交易。
- 需要拉取行情或基本面数字 —— 那是行情 API 的活，配合 `alpha-vantage-market-data`。
- **未配置 Octagon MCP 或没有 `OCTAGON_API_KEY`** —— 数据源不可用，无法运行。
- 把输出当作可直接交易的权威结论 —— 指引含管理层主观口径，须自行核验、与 10-Q/10-K 交叉验证后再决策。

## 步骤

1. **确认前置**：Octagon MCP 已配置且 `OCTAGON_API_KEY` 可用（见下「指令」）。
2. **总体分析**：对目标股票代码 `<TICKER>` 发起一次整体电话会分析，先拿到指引全貌。
3. **定向深挖**：按需对单一维度（指引 / 战略 / 挑战 / 投资优先级 / 竞争表态）分别追问。
4. **结构化归档**：把结果按「定量指引 + 定性洞察」两类整理成表，保留页码引用。
5. **交叉验证**：将指引与上一季度对比、与 10-Q 核对、与同业对照，标注口径变化与对冲式措辞。
6. **跟进追问**：拿 AI 生成的 follow-up 问题继续下钻或人工核实。

## 指令

**配置 Octagon MCP**（前置，一次性）。需 Node.js（含 `npx`），到 Octagon 控制台申请 API Key，然后在 MCP 客户端注册：

```
# 通用命令（Mac/Linux）
env OCTAGON_API_KEY=<your-api-key> npx -y octagon-mcp
```

Windows 用户在 MCP 配置中改用等价写法（`command: npx`，`args: ["-y","octagon-mcp"]`，并把 `OCTAGON_API_KEY` 放入 env）。验证 `node -v && npm -v && npx -v` 均有版本号。

**总体分析**（先跑这一句拿全貌）：

```
分析 <TICKER> 最新一期财报电话会逐字稿，提取关于未来指引的关键洞察。
```

**定向追问**（按维度逐条发起）：

```
# 完整前瞻指引
分析 <TICKER> 最新电话会，提取全部前瞻性指引。

# 战略举措
管理层在 <TICKER> 电话会中强调了哪些战略举措？

# 运营挑战
总结 <TICKER> 电话会中提到的运营挑战与逆风因素。

# 投资优先级
基于最新电话会，<TICKER> 的投资优先级是什么？

# 竞争表态
提取 <TICKER> 电话会中关于竞争定位的评论。
```

**应提取的关键指标：**

| 类别 | 字段 |
|------|------|
| 定量指引 | 营收增速（YoY/QoQ）、毛利率区间、OpEx 及驱动、EPS、有效税率、CapEx、自由现金流 |
| 定性洞察 | 战略优先级、投资领域（研发/地域/并购）、竞争定位、风险因素、区域趋势 |

**分析框架（解读指引）：**

| 维度 | 怎么看 |
|------|--------|
| 区间宽窄 | 窄=高信心，宽=不确定性大 |
| 同比对比 | 加速还是减速 |
| 超预期/不及背景 | 驱动业绩的因素 |
| 分部结构 | 哪些业务单元在拉动增长 |

**AI 追问的五类方向**：澄清（未披露的具体数字）、深挖（战略举措细节）、风险探查（逆风与缓解）、竞争（对标同业）、历史（对比此前指引/表现）。

## 示例

最小查询：

```
分析 AAPL 最新一期财报电话会逐字稿，提取关于未来指引的关键洞察。
```

返回（结构化，节选）：

```
Apple Inc. (AAPL) Q1 2026 电话会前瞻指引：

财务指引
- 营收增速：下季同比 +13%~16%（尽管 iPhone 供应受限）
- 服务收入：增速预计与上一季度（Q4 2025）相近
- 毛利率：48.00%~49.00%
- 营业费用：184~187 亿美元，主因研发投入加大
- 税率：约 17.50%

战略重点
- 看好印度增长机会；强调与 Google 在 AI 上的合作

风险因素
- 供应约束：对先进制程产能受限保持谨慎，可能影响需求满足

追问
- Q4 2025 服务收入的确切增速是多少？
- 研发投入中有多少投向 AI？
- 逐字稿中具体指出了哪些供应链瓶颈？

来源：AAPL_Q12026，页码 1、4、6
```

引用格式：`TICKER_Q#YEAR`（逐字稿标识）+ `Page: #`（页码），多源时交叉引用。

## 注意事项

- **强依赖 Octagon MCP**：没有该 MCP 与有效 `OCTAGON_API_KEY` 则无法运行；Key 通过环境变量注入，**勿硬编码**进配置或代码。
- **指引是主观口径**：管理层措辞可能偏乐观或留有余地，留意「对冲式语言」与过宽区间，评估管理层历史命中率。
- **必须交叉验证**：把指引与上一季对比、与官方 10-Q/10-K 核对，确认口径一致后再用于建模或决策。
- **页码引用要保留**：结论须可回溯到逐字稿页码，便于复核与研报署名。
- 输出仅供投研参考，不构成投资建议，不能替代独立尽调、回测与专家复核；输入缺失或边界不清时先停下确认。

## 互见

- related：`alpha-vantage-market-data` —— 需要行情/基本面数字佐证指引时拉取数据（其 `EARNINGS_CALL_TRANSCRIPT` 接口可作纯 API 替代）。
- related：`portfolio-risk-metrics` —— 把识别出的风险因素并入组合风险评估。
- combines_with：`three-statement-model`、`dcf-valuation-model` —— 把提取的指引（营收/毛利/费用/CapEx）喂入三表与 DCF 模型更新估值。
- 源仓库另有 `analyst-estimates`（指引 vs 一致预期）、`income-statement`、`sec-10q-analysis`、`price-target-consensus`、`stock-price-change` 等配套技能，本库暂未收录，可按需扩展。

---
采编自 OctagonAI/skills（MIT 许可），版权归 OctagonAI，已做中文适配重写。
