---
name: octagon-sec-segment-reporting
title: SEC分部业绩报告分析
description: 当需要从美股公司 10-K/10-Q 文件中研究业务分部（segment）的营收、营业利润、利润率、地区拆分与分部重组时使用；通过 Octagon MCP 的 octagon-agent 工具做分部业绩分析并产出结构化对比表与趋势解读；不适用于无 Octagon MCP 环境、非上市公司或整体财报（非分部维度）分析。触发词：分部业绩、segment revenue、10-K分部
domain: 领域/fintech
triggers: [分部业绩, segment reporting, 分部营收, 营业利润率分析, 地区营收拆分, 分部重组, 10-K 分部, 10-Q 分部, sum-of-parts, ASC 280]
tags: [fintech, SEC, 财报分析, 分部报告, Octagon-MCP, 美股, ASC280]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [octagon-agent (Octagon MCP), octagon-sec-agent, octagon-financials-agent]
requires: []
related: [octagon-sec-10k-analysis, octagon-revenue-product-segmentation, octagon-revenue-geographic-segmentation, octagon-sec-mda-analysis]
combines_with: [octagon-sec-filing-analyst, octagon-sec-10k-analysis]
license: MIT
source: OctagonAI/skills
source_license: MIT
---
## 何时使用

当你需要拆解一家**美股上市公司**的业务分部表现时使用，典型问题：

- 各业务分部（segment）的营收、同比增速、营业利润、利润率分别是多少？
- 公司按地区（Americas/EMEA/APAC）的营收如何分布？
- 公司近期是否调整/重组了分部口径，怎么调的？
- 对标两家公司（如 META vs GOOGL）的分部结构与盈利能力。
- 为估值做 sum-of-parts（分部加总）分析。

**不该用的边界：**
- 未在 AI 客户端（Cursor / Claude Desktop / Windsurf 等）配置 **Octagon MCP** 时——本技能依赖该 MCP，先去配置。
- 非上市公司、无 SEC 申报的主体——数据源取不到。
- 只关注公司整体财报（合并口径），不涉及分部维度——直接查财报即可，无需本技能。
- 需要原始 XBRL 逐行核对或非美股市场——超出范围。

## 步骤

1. **确定分析参数**
   - Ticker：股票代码（如 AAPL、MSFT、IBM）。
   - 申报类型（可选）：10-K（年报）或 10-Q（季报）。
   - 关注点（可选）：营收 / 盈利能力 / 地区 / 趋势。

2. **通过 Octagon MCP 发起查询**：调用 `octagon-agent` 工具，传入自然语言 prompt。

3. **读取结构化输出**：分部对比表 + 关键趋势 + 数据源说明。

4. **解读结果**：理解分部构成、评估盈利能力、追踪重组、分析地区分部（详见下方"注意事项"中的框架）。

## 指令

确认 Octagon MCP 已配置后，使用 `octagon-agent` 工具，prompt 模板：

```
Analyze business segment performance and reporting from <TICKER>'s latest quarterly filing.
```

MCP 调用格式：

```json
{
  "server": "octagon-mcp",
  "toolName": "octagon-agent",
  "arguments": {
    "prompt": "Analyze business segment performance and reporting from IBM's latest quarterly filing."
  }
}
```

返回为结构化分部分析，含分部表、关键趋势，数据源标注为 `octagon-financials-agent`、`octagon-sec-agent`。

## 示例

**完整分部分析：**
```
Analyze business segment performance and reporting from IBM's latest quarterly filing.
```

**分部盈利能力对比：**
```
Compare operating margins across MSFT's business segments in the latest 10-K.
```

**地区分部：**
```
Analyze AAPL's revenue breakdown by geographic region from the latest 10-K.
```

**分部增长趋势：**
```
Track revenue growth trends by segment for GOOGL over the last 4 quarters.
```

**分部重组：**
```
Has AMZN restructured its segment reporting in recent filings and how?
```

**跨公司对标：**
```
Compare segment performance between META and GOOGL in their latest annual filings.
```

返回示例（IBM 季报）：

| Segment | Revenue | YoY Growth | Operating Income | Margin |
|---------|---------|------------|------------------|--------|
| Software | $7,209M | 10.5% | $2,374M | 32.9% |
| Consulting | $5,324M | 3.3% | $686M | 12.9% |
| Infrastructure | $3,559M | 17.0% | $644M | 18.1% |
| Financing | $200M | 10.4% | $123M | 61.6% |

## 注意事项

**分部报告框架（ASC 280）**：营业分部披露营收（含分部间内部销售）、营业利润、分部资产、CapEx、折旧摊销；地区分部披露分地区营收、长期资产、重大国别拆分。

**关键指标速算：**
- 营收占比 = 分部营收 / 总营收（看业务构成）。
- 增速 =（本期 − 上期）/ 上期。
- 营业利润率 = 营业利润 / 营收（看效率）。
- ROA = 营业利润 / 分部资产。

**分部健康度矩阵：**

| | 高利润率 | 低利润率 |
|---|---|---|
| **高增长** | 明星分部 | 需投入 |
| **低增长** | 现金牛 | 待转型/退出 |

经验阈值：增速 >20% 高增长投入期、10-20% 稳健、0-5% 成熟、负值警戒；利润率 >30% 高端、20-30% 强、10-20% 中等、<5% 单薄需规模。

**重组红旗（警惕）：**
1. 频繁变更口径——可能掩盖真实表现。
2. 合并衰退分部——藏弱点。
3. 变更时点恰逢经营问题——蹊跷。
4. 披露减少——透明度下降。
5. 更换上报 KPI——口径不可比。

**对标的可比性调整：** 分部定义、成本分摊方法、转移定价、合并抵销口径各家不同，做跨公司对比前需对齐。

**分析技巧：** 细读分部脚注（政策与变更都在此）；自己复算利润率核对官方数字；关注营收构成迁移（反映战略优先级）；季度数据注意季节性；与管理层分部指引对照。

## 互见

- Octagon MCP 配置：参见源仓库 `references/mcp-setup.md`。
- 结果解读细则：参见源仓库 `references/interpreting-results.md`（分部构成、盈利能力评估、重组追踪、地区分部）。
- 同领域可关联：SEC 财报/盈利分析类技能、估值（sum-of-parts）类技能。

---
*采编自 OctagonAI/skills（MIT 许可），适配重写为中文技能大典条目。*
