---
name: octagon-sec-8k-analysis
title: SEC 8-K 重大事项分析
description: 当需要实时追踪美股上市公司 8-K 临时公告中的重大事项与公司治理变动（并购、高管变动、业绩发布、网络安全事件、退市等）时使用；经 Octagon MCP 的 octagon-agent 抽取，产出含 8-K Item 编号、事件分类、材料性分级与发生时间的结构化摘要；不适用于无 Octagon MCP、非美股 SEC 体系、需投资或法律建议、或要逐字全文照录的场景；触发词：8-K、临时公告、重大事项、material event、Item 5.02
domain: 领域/fintech
triggers: [8-K 申报, 临时公告, 重大事项, material event, octagon-agent, 并购公告, 高管变动, Item 5.02, 业绩发布 8-K, 网络安全事件披露, 8-K/A 更正]
tags: [fintech, sec, 8-k, 重大事项, 并购监控, 公司治理, octagon mcp, 事件驱动投资]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Octagon MCP, octagon-agent]
requires: []
related: [octagon-sec-10k-analysis, octagon-sec-filing-analyst, octagon-sec-mda-analysis, octagon-sec-risk-factors]
combines_with: [octagon-earnings-call-analysis, octagon-equity-research-analyst]
license: MIT
source: OctagonAI/skills
source_license: MIT
---
# SEC 8-K 重大事项分析

## 何时使用

需要**实时追踪美股上市公司 8-K 临时公告（Current Report）中的重大事项与公司治理变动**时使用。8-K 是公司在重大事件发生后须及时（一般 4 个工作日内）提交的披露文件，相比 10-K/10-Q 时效最强。典型场景：事件驱动投资、并购监控、高管/董事变动追踪、业绩发布捕捉、网络安全事件预警、退市/重述/破产等关键风险监控、披露合规巡检。

**不该用的边界：**
- **未配置 Octagon MCP** 的环境 —— 本技能依赖 `octagon-agent` 工具与 `octagon-sec-agent` 数据源，无 MCP 无法工作。
- **非美股 SEC 体系**（A 股、港股、欧股等）—— 无 8-K 制度与 Item 编号体系，不通用。
- 需要**投资买卖建议或法律意见** —— 本技能只抽取并归纳已公开披露内容，不替代分析师/律师判断。
- 想做**风险因素（Item 1A）、MD&A 或完整财报分析** —— 那是其他技能（见互见），8-K 只覆盖临时重大事项。
- 需要逐字全文 —— 输出是**事件摘要 + 分类 + 材料性分级**，不是原文照录。

## 步骤 / 指令

1. **确认前置**：Octagon MCP 已在 Agent（Cursor / Claude Desktop / Windsurf 等）中配置完成。
2. **确定参数**：
   - **Ticker**（必填）：股票代码，如 `AAPL`、`MSFT`、`GOOGL`。缺失先停下确认，不要臆测代码。
   - **时间范围**（可选）：最近若干份、指定日期区间或「过去 6 个月」等。
   - **事件类型**（可选）：限定关心的 8-K Item，如高管变动（5.02）、并购（2.01）、业绩（2.02）。
3. **下发自然语言指令**，调用 `octagon-agent` 工具。
4. **接收结构化输出**：申报摘要 + 重大事项 + 公司治理变动（数据源 `octagon-sec-agent`）。
5. **解读**：用下方「Item 速查」核对覆盖面，按「材料性分级」判断优先级。

**MCP 调用格式：**

```json
{
  "server": "octagon-mcp",
  "toolName": "octagon-agent",
  "arguments": {
    "prompt": "Analyze recent 8-K filings for AAPL and extract material events and corporate changes."
  }
}
```

**预期输出（示意）：**

- **申报摘要**：申报日期 2026-01-29；事件类别 Item 2.02（经营成果与财务状况）。
- **重大事项**：本次申报无重大公司变动；财务焦点为 Q1 2026 业绩披露。
- **公司治理变动**：无收购、处置或管理层变动。
- **数据源**：octagon-sec-agent。

**8-K Item 速查（用于核对覆盖面，附材料性）：**

| Item | 含义 | 材料性 |
|---|---|---|
| 1.01 / 1.02 | 重大确定性协议的签订 / 终止 | 高 |
| 1.03 | 破产或接管 | 极高 |
| 1.05 | 重大网络安全事件 | 高 |
| 2.01 | 收购或处置完成 | 高 |
| 2.02 | 经营成果与财务状况（业绩） | 中 |
| 2.03 / 2.04 | 新增直接债务 / 触发加速条款 | 高 |
| 2.06 | 重大资产减值 | 高 |
| 3.01 | 退市或转板通知 | 极高 |
| 4.01 / 4.02 | 更换会计师 / 不再依赖历史财报（重述） | 高 / 极高 |
| 5.01 | 控制权变更 | 极高 |
| 5.02 | 董事/高管离任或任命 | 高 |
| 5.03 / 5.07 | 章程修订 / 股东投票结果 | 中 |
| 7.01 | Regulation FD 披露 | 视情况 |
| 8.01 | 其他事件（自愿披露） | 视情况 |
| 9.01 | 财务报表与附件 | 支撑性 |

**材料性分级（用于排优先级）：**
- **极高（立即处置）**：破产（Ch.11/接管）、财报重述（不再依赖）、退市通知、控制权变更（收购/要约）、重大网络安全事件。
- **高优先级**：并购完成/分拆、CEO/CFO 离任与董事会变动、重大合同/合作、减值/债务、会计师变更或分歧。
- **中优先级**：季度业绩（Item 2.02）、成本削减重组、章程修订/投票结果、股票发行与权利修改。

## 示例

```text
# 标准 8-K 重大事项提取
Analyze recent 8-K filings for AAPL and extract material events and corporate changes.

# 高管变动（Item 5.02）
Find any 8-K filings for TSLA in 2025 that disclose executive departures or appointments.

# 并购活动
Extract 8-K filings related to acquisitions or mergers for MSFT in the past 6 months.

# 业绩发布
Summarize the most recent 8-K earnings release filing for GOOGL.

# 重大确定性协议
Find 8-K filings disclosing material definitive agreements for AMZN.

# 会计师变更
Has NVDA filed any 8-K filings regarding auditor changes in the past year?
```

## 注意事项

**分析要点：**
- **逐项查全**：一份 8-K 常含多个 Item，别只看标题；不显眼的 Item 里可能藏关键信息。
- **读附件（Exhibit）**：新闻稿、协议正本等关键细节多在 Item 9.01 的 Exhibit 里。
- **留意申报时机**：周五下午或假期前申报，可能意在淡化关注度。
- **追踪频率模式**：8-K 高频→活跃并购/重组/波动；聚集出现→重大事件正在展开；规律出现→例行季度披露。
- **交叉对照**：把 8-K 披露与随后的 10-Q/10-K 比对，看是否一致、是否补充。
- **监控 8-K/A**：8-K/A 修订件会更新或更正先前披露，勿漏。

**合规与限制：**
- 输出依赖 `octagon-sec-agent` 数据源，覆盖范围与时效以 Octagon 数据为准；关键结论应回溯 SEC EDGAR 原始申报文件核验。
- 结果仅供分析参考，**不构成投资建议或法律意见**，不能替代专业尽调与风控复核。

## 互见

- related：`octagon-sec-risk-factors` / `octagon-sec-mda-analysis` / `octagon-sec-filing-analyst` —— 8-K 临时事项之外，深挖风险因素、MD&A 与完整财报披露。
- related：`octagon-earnings-call-analysis` —— 8-K 业绩发布（Item 2.02）常与同期电话会互补印证。
- combines_with：`diligence-issue-extractor` —— 重大事项时间线 + 尽调问题清单，组成事件驱动的投前风险评估。
- combines_with：`octagon-equity-research-analyst` —— 把捕捉到的重大事项纳入完整股票研究与投资评级。

---
本条采编自 OctagonAI/skills（MIT）。
