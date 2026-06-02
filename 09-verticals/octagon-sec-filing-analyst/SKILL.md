---
name: octagon-sec-filing-analyst
title: SEC 文件分析编排
description: 当对上市公司做尽职调查、合规审查、并购评估或全面公司画像、需基于 SEC 披露文件产出机构级研究报告时使用；做的是经 Octagon MCP（octagon-agent）按六阶段编排清点 10-K/10-Q/8-K/DEF 14A/S-1 等申报、抽取业务/风险/财务/治理披露并合成带逐条引用的尽调备忘录；不适用于无 Octagon MCP 的环境、单份申报的孤立抽取（用对应子技能）、或基于市场行情/财务建模本身的估值。触发词：SEC 文件分析、尽职调查、due diligence、10-K、10-Q、8-K、风险因素、MD&A、proxy、并购尽调
domain: 领域/fintech
triggers: [SEC 文件分析, 尽职调查, due diligence, 10-K, 10-Q, 8-K, 风险因素, MD&A, proxy, 并购尽调]
tags: [sec, fintech, due-diligence, edgar, 10-k, compliance, m-and-a, equity-research, octagon-mcp]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Octagon MCP, octagon-agent]
requires: []
related: [octagon-sec-mda-analysis, octagon-sec-risk-factors, octagon-equity-research-analyst, octagon-earnings-call-analysis]
combines_with: [octagon-sec-mda-analysis, octagon-sec-risk-factors, diligence-issue-extractor]
license: MIT
source: OctagonAI/skills
source_license: MIT
---
# SEC 文件分析编排

> 角色定位：资深尽职调查分析师，基于全套 SEC 披露文件撰写机构级研究报告。受众=投委会/法务/并购团队，文风对标律所尽调备忘录与投行公允意见，精确、引用密集、聚焦重大发现。

## 何时使用

- 需要对一家上市公司做全面尽调、合规审查、并购评估或建立完整公司画像，且依据来源是 SEC 披露文件时。
- 需要把分散在 10-K/10-Q/8-K/DEF 14A/S-1 中的业务、风险、财务、治理披露**编排成一份**带逐条引用的尽调报告时。

**不该用的边界：**

- 未配置 Octagon MCP 的环境——本条依赖 `octagon-agent` 工具，前置环境缺失则不适用。
- 单份申报的孤立抽取（如只看一份 10-K 的风险因素）——直接用对应子技能，不必走六阶段编排。
- 基于市场行情/财务建模的估值（DCF、三表、可比公司）——那是建模，移交 `dcf-valuation-model`、`three-statement-model`、`financial-analysis-toolkit`。
- 灰区重要性判断、谈判陈述与保证——只产出支撑发现，临界由律师/交易团队拍板。

## 步骤

前置：确保 AI 助手（Cursor / Claude Desktop / Windsurf 等）已配置 Octagon MCP。所有查询通过 `octagon-agent` 工具的自然语言 prompt 发起。

按六阶段顺序编排，把 `<TICKER>` 替换为目标股票代码：

**阶段 1 · 申报清点**——盘清所有相关申报：
```
1. 分析 <TICKER> 最新的 10-K 申报
2. 分析 <TICKER> 最新的 10-Q 申报
3. 分析 <TICKER> 近期的 8-K 申报（识别重大事件）
4. 复核 <TICKER> 的 SEC 申报修订（amendments）
```

**阶段 2 · 核心业务分析**——从披露读懂业务：
```
1. 从 <TICKER> 最新 10-K 提取业务描述与竞争格局
2. 分析 <TICKER> 最新申报的 MD&A 章节
3. 分析 <TICKER> 的业务分部（segment）表现
```

**阶段 3 · 风险评估**——风险因素全量分析：
```
1. 提取并摘要 <TICKER> 最新 10-K 的风险因素
2. 对比 <TICKER> 当年与上年 10-K 的风险因素
3. 识别新增或升级的风险
```

**阶段 4 · 财务深挖**：
```
1. 分析 <TICKER> 最新 10-K 的附注与会计政策
2. 分析 <TICKER> 的债务契约（covenants）与授信条款
3. 提取 <TICKER> 的现金流趋势与营运资本变动
```

**阶段 5 · 治理审查**：
```
1. 从 <TICKER> 最新 proxy（DEF 14A）提取高管薪酬
2. 复核 <TICKER> 的公司治理实践与董事会构成
```

**阶段 6 · 报告合成**——把各阶段发现汇成尽调报告，按下列结构组织。

## 指令

**MCP 调用格式**（每一步都是一次 `octagon-agent` 调用）：
```json
{
  "server": "octagon-mcp",
  "toolName": "octagon-agent",
  "arguments": {
    "prompt": "Analyze the latest 10-K filing for AAPL and extract key financial metrics and risk factors."
  }
}
```
数据源：`octagon-financials-agent`、`octagon-sec-agent`。

**报告结构**（每章注明所用子技能）：
- 执行摘要 — 公司概览、申报与合规状态、关键发现、重大关切。
- 业务概览 — 业务描述与分部、竞争格局、MD&A 战略重点、地域/产品结构。
- 风险因素分析 — 分类、新增 vs 既有、严重度评级、同业对比。
- 财务报表分析 — 会计政策、关键估计与判断、附注披露、表外项目。
- 流动性与资本资源 — 现金流、债务结构与契约、契约合规状态、再融资风险。
- 治理评估 — 董事会构成与独立性、高管薪酬、关联交易、股东权利。
- 重大事件 — 近期 8-K、并购、管理层变动、诉讼进展。
- 同比对比 — 关键指标变化、披露演进、风险因素变化、战略转向。
- IPO/注册分析（若适用 S-1）— 关键发现、募资用途、资本结构、锁定条款。
- 附录 — 申报清单、修订历史、扩展披露摘录、方法论说明。

**输出规格（硬约束）：**
- 篇幅 8,000–15,000 字；每个主章 800–1,500 字。
- 引用密集、附页码；对比分析用表格；重大披露用直接引文；风险给 高/中/低 评级；脚注带申报引用。
- **来源层级**：① SEC EDGAR 申报（10-K/10-Q/8-K/DEF 14A/S-1）> ② 公司新闻稿 > ③ 财报电话会纪要 > ④ SEC 数据不足时的第三方分析。**所有发现必须注明具体申报、日期、页码。**
- 报告结尾附标准尽调免责声明。

## 示例

完整分析查询序列（以 TSLA 为例，含同业对标 RIVN）：
```
# 阶段 1：申报清点
Analyze the latest 10-K filing for TSLA and extract key financial metrics and risk factors
Analyze the latest 10-Q filing for TSLA
Analyze recent 8-K filings for TSLA and identify material events
Review recent amendments to SEC filings for TSLA

# 阶段 2：业务分析
Extract business description and competitive landscape from TSLA's latest 10-K
Analyze the MD&A section from TSLA's latest quarterly report
Analyze business segment performance from TSLA's latest filing

# 阶段 3：风险评估
Extract and summarize risk factors from TSLA's latest 10-K
Compare key metrics and risk factors between TSLA's current and prior year 10-K

# 阶段 4：财务深挖
Analyze footnotes and accounting policies from TSLA's latest filing
Analyze debt covenants and credit agreement terms for TSLA
Extract cash flow trends and working capital changes from TSLA's latest 10-Q

# 阶段 5：治理
Extract executive compensation from TSLA's latest proxy statement
Review corporate governance practices and board composition for TSLA

# 阶段 6：同业对标
Analyze the latest 10-K filing for RIVN
Extract and summarize risk factors from RIVN's latest 10-K
Compare risk factor disclosures between TSLA and RIVN
```

## 注意事项

- **先读风险因素**：风险因素揭示管理层关切，据此设定分析优先级。
- **逐年追踪变化**：新增风险、措辞修改、删除的披露都是信号——务必做当年与上年 10-K 的逐条对比。
- **MD&A 与财务交叉验证**：管理层叙述应与数字一致，背离即为关注点。
- **附注藏风险**：表外项目、或有事项、关联方常埋在附注里。
- **8-K 全看**：定期申报之间的重大事件可能是关键。
- **治理质量**：董事会构成与薪酬激励对齐情况重要。
- **合规纪律**：所有依据须可溯源到具体申报+日期+页码；SEC 数据不足才退而用第三方，并显式标注；报告必附尽调免责声明。

## 互见

- requires：`无`（仅需前置配置 Octagon MCP 环境）。
- related：`diligence-issue-extractor`（并购数据室/VDR 侧的尽调问题提取，与本条的披露侧分析互补）、`financial-analysis-toolkit`（财报指标与比率分析）。
- combines_with：`dcf-valuation-model`、`three-statement-model` —— 用本条产出的披露事实驱动估值与三表建模，把「读懂披露」接到「量化估值」。

---

本条采编自 OctagonAI/skills（MIT）。
