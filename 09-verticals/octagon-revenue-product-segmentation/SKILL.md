---
name: octagon-revenue-product-segmentation
title: 营收产品分部拆解
description: 当需要分析上市公司按产品分部（产品线/业务线）的营收构成、营收集中度、分部贡献占比时使用；通过 Octagon MCP 的 octagon-agent 按 ticker 拉取产品分部营收表并输出集中度、核心驱动、增长分部、多元化诊断；不适用于私有公司、按地区/客户的拆分、利润表绝对值或估值建模（用对应技能）。触发词：产品分部、营收拆解、业务线、product segment、revenue mix、Octagon
domain: 领域/fintech
triggers: [产品分部, 营收拆解, 业务线营收, 营收构成, 营收集中度, product segment, revenue mix, segment revenue, Octagon, 产品组合]
tags: [fintech, 财务分析, 营收拆解, 产品分部, 营收集中度, Octagon-MCP, 基本面分析]
level: 入门
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Octagon MCP, octagon-agent, npx]
requires: []
related: [octagon-revenue-geographic-segmentation, octagon-sec-segment-reporting, octagon-income-statement-data, octagon-financial-metrics-analysis]
combines_with: [octagon-revenue-geographic-segmentation, octagon-equity-research-analyst]
license: MIT
source: OctagonAI/skills
source_license: MIT
---
## 何时使用

当用户想看清一家上市公司的**营收按产品分部（产品线/业务线）如何构成**、哪条业务线是核心驱动、营收是否过度集中或足够多元时使用——一次拿到各产品分部营收表，再据此生成集中度、核心业务、增长分部与多元化诊断。

**不该用的边界：**
- 私有/未上市公司或 Octagon（多为美股）无覆盖标的 → 无数据，先确认 ticker 有效。
- 要利润表绝对值（营收/净利润总额、EPS）→ 用 `octagon-income-statement-data`。
- 要按**地区**或**客户**的拆分 → 本技能只给产品分部口径，需在跟进查询中另问。
- 要分部毛利率/利润口径 → Octagon 此接口返回的是分部营收，利润需另行检索或推断。
- 要估值/DCF/三表建模 → 用 `dcf-valuation-model`、`three-statement-model`。
- 输出是 Agent 生成的分析参考，不能替代独立尽调与专业复核。

## 步骤

1. **配置 Octagon MCP**：确保 AI 客户端（Claude Desktop / Cursor / Windsurf）已注册 `octagon-mcp`，`octagon-agent` 工具可见。需要 `OCTAGON_API_KEY`（在 app.octagonai.co 申请）；本机需装 Node.js（自带 npx）。
2. **构造查询**：填 ticker，指定年度周期与扁平（flat）响应结构（见下方指令）。
3. **调用 octagon-agent**：传入自然语言 prompt。
4. **读表**：得到各产品分部营收（含合计 Total）。
5. **生成洞察**：套用下方集中度判据与诊断模式。
6. **追问下钻**：按结果给出深挖问题。

## 指令

**查询模板**（英文 prompt 直接传给 agent，识别率最佳）：

```
Retrieve detailed revenue by product segment for <TICKER>, for the annual period with a flat response structure.
```

**MCP 调用：**

```json
{
  "server": "octagon-mcp",
  "toolName": "octagon-agent",
  "arguments": {
    "prompt": "Retrieve detailed revenue by product segment for AAPL, for the annual period with a flat response structure"
  }
}
```

数据来源 agent：`octagon-financials-agent`。

**派生计算：**

```
分部占比 = 分部营收 / 总营收 × 100
```

**集中度判据（保留源约束）：**

| 形态 | 判据 | 解读 |
|------|------|------|
| 高集中 | 单一分部 > 50% | 单点依赖，命运系于一条业务线，关注其周期与竞争 |
| 中度集中 | 前 2 分部 > 80% | 主力清晰但回旋空间有限 |
| 良好多元 | 无分部 > 30% | 分散均衡，抗单点风险强 |

**5 类洞察模式：**

| 模式 | 关注点 |
|------|------|
| 集中度 | 各分部占总营收百分比，识别依赖结构 |
| 核心业务 | 营收最大的驱动分部 |
| 增长分部 | 高增长或新兴的分部（需结合历史对比） |
| 多元化评估 | 营收在各分部间的均衡程度 |
| 战略定位 | 产品组合反映的商业模式与转型信号 |

## 示例

典型返回（单位 USD Billion）：

| 产品分部 | 营收 (USD Billion) |
|-----------------|----------------------|
| iPhone | $209.59 |
| Services | $109.16 |
| Wearables, Home and Accessories | $35.69 |
| Mac | $33.71 |
| iPad | $28.02 |
| **Total** | **$416.17** |

**读法**：iPhone $209.59B / $416.17B ≈ 50.36% → 单一分部刚过 50%，属高集中，营收命运高度系于 iPhone 周期；Services 约 26%，作为高毛利、可复现的经常性收入，占比上升即为商业模式向服务转型的信号；硬件（一次性、重资本）与服务（经常性、可扩展、高毛利）的此消彼长是观察重点。

**追问下钻**（可追加给 agent）：
- "What are the year-over-year growth rates for each product segment?"
- "How do these revenue figures compare to [COMPANY]'s guidance?"
- "What are the regional breakdowns for [SEGMENT1] and [SEGMENT2] revenue?"
- "Compare [COMPANY]'s product segment mix to [PEER1] and [PEER2]"

## 注意事项

- **观察模式**：拿到数据后建议固定输出五项——①集中度（各分部占比）；②核心业务（最大驱动分部）；③增长分部（高增长/新兴，需历史对比）；④多元化评估；⑤战略定位（组合反映的转型信号）。
- **毛利差异**：不同分部毛利往往不同——服务通常高于硬件、高端高于大众、经常性收入优于一次性；分部营收口径不含利润，解读时勿把营收占比等同于利润贡献。
- **分部动态**：与历史期对比才有意义——哪些分部份额在升、哪些在降、有无新分部涌现；本接口为年度（FY）口径。
- **覆盖范围**：主要为美股上市公司；非美股/私有公司多无数据，ticker 必须有效。
- **API Key 安全**：`OCTAGON_API_KEY` 经环境变量/配置注入，勿硬编码或外泄；超频时降低请求频率。
- 结论仅供分析参考，投资决策前需独立校验与风控复核。

## 互见

- related：`octagon-income-statement-data` —— 要营收/净利润绝对值与 EPS 时用它的利润表口径。
- related：`octagon-financial-growth-metrics` —— 要各分部/整体的同比增长趋势时。
- related：`octagon-equity-research-analyst` —— 综合基本面研究与多接口编排。
- combines_with：`dcf-valuation-model`、`three-statement-model` —— 把分部营收结构作为增长假设输入，串成「分部拆解 → 建模 → 估值」链路。
- Octagon MCP 配置详情：源仓库 `references/mcp-setup.md`（含各客户端配置）；结果解读与估值输入：源仓库 `references/interpreting-results.md`。

---
采编自 OctagonAI/skills（MIT 许可），已做中文适配重写。
