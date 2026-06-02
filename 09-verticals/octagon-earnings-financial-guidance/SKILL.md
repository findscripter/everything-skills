---
name: octagon-earnings-financial-guidance
title: 财报前瞻业绩指引提取
description: 当需要从财报电话会逐字稿中提取并分析前瞻业绩指引（营收/分部/毛利/EPS/CapEx）、风险因素与指引 vs 实际对比时使用；借助 Octagon MCP 分析指定股票代码最新一期电话会，产出含定量指引区间、分部展望、风险口径、Beat/Miss 跟踪表、AI 追问与逐字稿页码引用的结构化分析；不适用于实盘交易、纯行情拉取或无 Octagon MCP/API Key 的环境；触发词：前瞻指引、guidance、指引 vs 实际
domain: 领域/fintech
triggers: [前瞻业绩指引, forward-looking guidance, 分部指引 segment guidance, 毛利率指引 margin, EPS 指引, 指引 vs 实际 guidance vs actuals, Beat/Miss 跟踪, 风险因素 risk factors, Octagon MCP]
tags: [fintech, 财报, 业绩指引, 前瞻陈述, 分部分析, 投研, Octagon MCP, 尽调]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Octagon MCP, npx, Node.js]
requires: []
related: [octagon-earnings-call-analysis, octagon-earnings-qa-analysis, octagon-earnings-call-sentiment, octagon-analyst-estimates]
combines_with: [octagon-price-target-consensus, octagon-equity-research-analyst, equity-earnings-update-report]
license: MIT
source: OctagonAI/skills
source_license: MIT
---
# 财报前瞻业绩指引提取

## 何时使用

当需要把财报电话会逐字稿中的**前瞻性业绩指引与前瞻陈述**抽成可投研消费的结构化结论时使用，重点覆盖：

- 提取**定量指引**：总营收/分部营收/地域营收、营收增速（YoY/QoQ）、毛利率、营业利润率、净利率、EPS、OpEx、CapEx、税率、稀释股本。
- 做**分部级（segment）拆解**：各业务单元的营收区间、利润率展望、关键驱动与专属逆风。
- 识别**风险因素与对冲式措辞**：宏观、竞争、运营、监管、汇率五类，以及「视市场情况」「剔除一次性」等常见 caveat。
- 做**指引 vs 实际（guidance vs actuals）对比**与 Beat/Miss 跟踪，并生成 AI 深挖追问 + 逐字稿页码引用。

典型场景：财报季批量覆盖、把指引喂入财务模型、指引 vs 一致预期对照、Beat/Miss 预判、多季度指引趋势跟踪、研报撰写。

**不该用的边界：**
- 需要实盘下单 / 券商撮合 —— 本技能只做文本指引分析，不做交易（交易交给 `earnings-trade-analyzer`）。
- 需要拉取行情或基本面**数字源** —— 那是行情 API 的活，配合 `alpha-vantage-market-data`。
- **未配置 Octagon MCP 或没有 `OCTAGON_API_KEY`** —— 数据源不可用，无法运行。
- 把指引当作可直接交易的权威结论 —— 指引含管理层主观口径与对冲措辞，须与 10-Q/10-K 交叉验证后再决策。

## 步骤

1. **确认前置**：Octagon MCP 已配置且 `OCTAGON_API_KEY` 可用（见「指令」）。
2. **整体提取**：对目标股票代码 `<TICKER>` 跑一次整体指引提取，先拿到指引全貌（营收、分部、毛利、EPS、风险）。
3. **定向深挖**：按维度分别追问营收 / 分部 / 毛利与营业利润率 / EPS / 风险因素 / 指引 vs 实际。
4. **结构化归档**：按「定量指引 + 分部明细 + 风险口径」整理成表，保留页码引用。
5. **质量与区间判读**：评估指引质量（高/中/低）与区间宽窄（窄=高信心，宽=可见度低）。
6. **对标与跟踪**：与一致预期对比、与上季指引对照、构建 Beat/Miss 跟踪表，标注口径变化。
7. **跟进追问**：用 AI 生成的 follow-up 问题继续下钻或人工核实。

## 指令

**配置 Octagon MCP**（前置，一次性）。需 Node.js（含 `npx`），到 Octagon 控制台申请 API Key，再在 MCP 客户端注册：

```
# 通用命令（Mac/Linux）
env OCTAGON_API_KEY=<your-api-key> npx -y octagon-mcp
```

Windows 用户在 MCP 配置中改用等价写法（`command: npx`，`args: ["-y","octagon-mcp"]`，`OCTAGON_API_KEY` 放入 env）。验证 `node -v && npm -v && npx -v` 均有版本号。

**整体提取**（先跑这一句拿全貌）：

```
提取并分析 <TICKER> 最新一期财报电话会逐字稿中的前瞻业绩指引与前瞻陈述。
```

**定向追问**（按维度逐条发起）：

```
# 营收指引
提取 <TICKER> 最新电话会中的营收指引。

# 分部指引
提取 <TICKER> 电话会中分部级（segment）营收指引。

# 利润率指引
提取 <TICKER> 电话会中的毛利率与营业利润率指引。

# EPS 指引
提取 <TICKER> 最新逐字稿中的每股收益（EPS）指引。

# 风险因素
提取 <TICKER> 电话会中的风险因素与前瞻陈述 caveat。

# 指引 vs 实际
对比 <TICKER> 最新电话会中的此前指引与实际结果。
```

**应提取的结构化字段：**

| 类别 | 字段 |
|------|------|
| 营收指引 | 总营收、分部营收、地域营收、增速（YoY/QoQ） |
| 盈利指引 | 毛利率、营业利润率、净利率、EPS |
| 运营指引 | OpEx 及驱动、CapEx、有效税率、稀释股本 |
| 分部明细 | 营收区间、利润率展望、关键驱动、专属风险 |
| 风险因素 | 宏观 / 竞争 / 运营 / 监管 / 汇率 |

**指引质量与区间判读：**

| 维度 | 怎么看 |
|------|--------|
| 质量 | 高=明确区间+清晰假设；中=方向性/定性；低=措辞含糊、caveat 多 |
| 区间宽窄 | 窄（如 \$12.5B-\$12.7B）=高信心；宽（如 \$12.0B-\$13.5B）=可见度低、多情景 |
| vs 一致预期 | 指引>预期=管理层更乐观；=预期=一致；<预期=卖方或需下修 |

**Beat/Miss 跟踪表（指引 vs 实际）：**

| 指标 | 指引 | 实际 | 偏差 | Beat/Miss |
|------|------|------|------|-----------|
| 营收 | \$12.5-12.9B | \$13.7B | +\$0.8B | Beat |
| EPS | \$2.50-2.60 | \$2.69 | +\$0.09 | Beat |
| 毛利率 | 68-69% | 69.8% | +80bps | Beat |

## 示例

最小查询：

```
提取并分析 MSFT 最新一期财报电话会逐字稿中的前瞻业绩指引与前瞻陈述。
```

返回（结构化，节选）：

```
MSFT Q4 2023 前瞻业绩指引与前瞻陈述：

指引摘要
- 需求展望：商业、LinkedIn、游戏与搜索广告需求信号稳定；宏观变化可能扰动
- Windows OEM 库存：上季偏高库存预计回落，导致 More Personal Computing 分部指引区间放宽
- More Personal Computing 指引：营收 \$12.5B~\$12.9B；实际 Q4 营收达 \$13.7B（同比 +3%）

风险因素
- 业务环境变化（尤其 Windows OEM 分部）可能影响结果

Web 检索补充
- Refinitiv 此前预估该分部同比 -5.7%，与实际 +3% 反向
- 分部营收成本同比 +\$3.2B（+5%），由云与 AI 投入驱动

追问
- \$12.5-12.9B 指引与 \$13.7B 实际的差异由哪些具体因素造成？
- \$3.2B 成本增量中多少投向 AI/云？

来源：MSFT_Q42023 [Page 1]，Web Search Results
```

引用格式：`TICKER_Q#YEAR`（逐字稿标识）+ `Page: #`（页码），多源时交叉引用。

## 注意事项

- **强依赖 Octagon MCP**：没有该 MCP 与有效 `OCTAGON_API_KEY` 则无法运行；Key 经环境变量注入，**勿硬编码**进配置或代码。
- **指引是主观口径**：留意「对冲式措辞」与过宽区间——「视市场情况」=宏观依赖、「剔除一次性」=调整口径、「若需求延续」=假设稳态、「除非意外」=仅基准情景；评估管理层历史命中率。
- **务必交叉验证**：把指引与上一季对比、与一致预期对照、与官方 10-Q/10-K 核对后再用于建模或决策；分部口径尤需对齐。
- **页码引用要保留**：每条结论须可回溯到逐字稿页码，便于复核与研报署名。
- 输出仅供投研参考，不构成投资建议，不能替代独立尽调、回测与专家复核；输入缺失或边界不清时先停下确认。

## 互见

- related：`octagon-earnings-call-analysis` —— 同源姊妹技能，提供电话会整体分析（战略/挑战）作上层语境，本技能聚焦指引提取与 Beat/Miss 跟踪。
- related：`octagon-analyst-estimates` —— 把指引与一致预期对照，判断指引偏乐观还是卖方需下修。
- related：`octagon-sec-risk-factors`、`octagon-income-statement-data` —— 风险因素与历史损益交叉验证指引可信度。
- combines_with：`three-statement-model`、`dcf-valuation-model` —— 把提取的营收/毛利/费用/CapEx 指引喂入三表与 DCF 更新估值。
- combines_with：`earnings-trade-analyzer` —— 由指引 Beat/Miss 信号驱动财报事件交易决策（本技能只分析、不下单）。
- 源仓库另有 `income-statement`、`sec-10q-analysis`、`stock-price-change` 等配套技能，可按需扩展。

---
采编自 OctagonAI/skills（MIT 许可），版权归 OctagonAI，已做中文适配重写。
