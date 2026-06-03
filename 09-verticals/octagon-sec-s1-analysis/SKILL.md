---
name: octagon-sec-s1-analysis
title: SEC S-1 招股书与 IPO 分析
description: 当需要从拟 IPO 公司 SEC S-1 注册声明（招股书）提取商业模式、风险因素、募资用途、资本结构与主要股东时使用；经 Octagon MCP 的 octagon-agent 提示拉取并产出结构化 S-1 解读与 IPO 评估框架；不适用于无 Octagon MCP、非美股 SEC、需逐字原文/投资建议或实盘下单；触发词：S-1、招股书、IPO 分析、募资用途、资本结构、主要股东
domain: 领域/fintech
triggers: [S-1, S-1 招股书, IPO 分析, 注册声明, 募资用途, use of proceeds, 资本结构 cap table, 主要股东, 锁定期 lock-up, octagon-agent, pre-IPO 研究]
tags: [fintech, sec, s-1, ipo, 招股书, 募资用途, 资本结构, 主要股东, octagon, mcp, pre-ipo, 投资研究]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Octagon MCP, octagon-agent, npx]
requires: []
related: [octagon-sec-filing-analyst, octagon-sec-risk-factors, octagon-sec-mda-analysis, octagon-equity-research-analyst, alpha-vantage-market-data]
combines_with: [diligence-issue-extractor, dcf-valuation-model, three-statement-model]
license: MIT
source: OctagonAI/skills
source_license: MIT
---

# SEC S-1 招股书与 IPO 分析

## 何时使用

当需要研究**拟上市（pre-IPO）公司**并从其 SEC **S-1 注册声明（招股书）**中快速读懂关键信息时使用，典型产出：商业模式与收入结构、风险因素、募资用途（use of proceeds）、资本结构（cap table）与股权稀释、主要股东与锁定期、市场机会与增长策略。适用场景：IPO 打新评估、私募/一级市场研究、新晋竞品情报、行业趋势追踪、投资尽调。

底层依赖 **Octagon MCP** 的 `octagon-agent` 工具（市场情报综合体，覆盖 SEC 文件、财报、财务与行情），数据来源标注为 `octagon-sec-agent`。

**不该用的边界：**
- 未配置 Octagon MCP 或无 `OCTAGON_API_KEY` —— 先按「指令」完成 MCP 安装与鉴权，否则 `octagon-agent` 不可用。
- 非美股 SEC 体系（A 股、港股、私有公司未递交 S-1）—— S-1 是 SEC EDGAR 特有的 IPO 注册文件。
- 已上市公司的年报/季报解读 —— 用 `octagon-sec-mda-analysis`、`octagon-sec-risk-factors`、`octagon-sec-filing-analyst`（针对 10-K/10-Q/8-K）。
- 需要逐字原文 / 法律级精确引用 —— `octagon-agent` 返回结构化解读与摘要，关键结论须回到原始 S-1 复核。
- 需要实盘打新下单、撮合或实时行情 —— 本技能只做文本情报解读，不构成投资建议。

## 步骤 / 指令

1. **确认 MCP 就绪**：在 AI 客户端（Cursor / Claude Desktop / Windsurf）中已配置 `octagon-mcp` 且 `octagon-agent` 工具可见（配置见下）。
2. **确定分析参数**：
   - **公司名 Company Name**（必填）：递交 S-1 的拟上市公司，如 Figma、Stripe、Reddit、Instacart、Arm、Klaviyo。
   - **Focus Area**（可选）：风险 / 机会 / 财务 / 资本结构。
   - **Specific Topics**（可选）：募资用途、主要股东、公司治理。
3. **用自然语言提示调用 `octagon-agent`**，把公司名与关注点写进 prompt（见「示例」）。
4. **接收结构化输出**：典型含 **Key Business Risks**（客户留存/竞争/监管/管控）与 **Key Opportunities**（产品创新/客户扩张/国际化/并购），数据源 `octagon-sec-agent`。
5. **套用 IPO 分析框架**（下方表格）评估业务质量、市场机会、财务健康、治理结构，对照红旗清单与募资用途。

**安装 Octagon MCP（npx，需 Node.js）：**

- API Key：在 Octagon 注册并在 API Keys 页生成，妥善保存。
- Claude Desktop / Windsurf 配置（`claude_desktop_config.json` 或 `model_config.json`）：

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

- Cursor 命令式：`env OCTAGON_API_KEY=<key> npx -y octagon-mcp`；Windows 用 `cmd /c "set OCTAGON_API_KEY=<key> && npx -y octagon-mcp"`。
- 验证：刷新 MCP 列表应出现 `octagon-agent`；用 `Retrieve the current stock price for AAPL` 冒烟测试。

**MCP 调用格式（octagon-agent）：**

```json
{
  "server": "octagon-mcp",
  "toolName": "octagon-agent",
  "arguments": {
    "prompt": "Analyze the S-1 registration statement for Figma and extract key business risks and opportunities."
  }
}
```

**S-1 关键章节速查（用于设计 prompt 的 focus）：**

| 章节 | 内容 |
|------|------|
| 招股书摘要 Prospectus Summary | 业务概述、发行条款（股数/价格区间）、风险摘要、募资用途 |
| 风险因素 Risk Factors | 业务 / 财务 / 运营 / 监管 / 市场 / 发行（稀释、波动）等类别 |
| 业务描述 Business | 公司沿革、产品/技术、市场机会（TAM/SAM/SOM）、增长策略、竞争格局 |
| 管理层讨论 MD&A | 经营成果、关键运营 KPI、流动性与现金消耗、关键会计政策 |
| 财务报表 Financials | 利润表、资产负债表、现金流量表、附注 |
| 资本结构 Capitalization | IPO 前/后 cap table、股权稀释、股份分类与投票权、期权/认股权证 |
| 主要股东 Principal Shareholders | 5%+ 股东、董监高持股、出售股东、锁定期 lock-up |

## 示例

直接给 `octagon-agent` 自然语言提示（把公司名换成目标）：

```text
# 完整 S-1 分析（风险 + 机会）
Analyze the S-1 registration statement for Figma and extract key business risks and opportunities.

# 商业模式与收入结构
Extract the business model and revenue streams from Stripe's S-1 filing.

# 募资用途
What are the planned use of proceeds from the IPO in Reddit's S-1?

# 资本结构与股份结构
Analyze the capitalization table and share structure from Instacart's S-1.

# 主要股东与持股
Who are the principal shareholders and what are their ownership stakes in Arm's S-1?

# 历史财务表现与增长指标
Extract the historical financial performance and growth metrics from Klaviyo's S-1.
```

## 注意事项

**IPO 分析框架（评估阈值）：**

| 维度 | 强 / 健康 | 弱 / 担忧 |
|------|-----------|-----------|
| 营收增长 | >30% YoY | <10% 或下滑 |
| 毛利率 | >60% | <30% |
| 净收入留存 NRR | >120% | <100% |
| 客户集中度 | 低（最大客户 <10%） | 高（>25%） |
| 单位经济 | CAC 回本 <18 个月 | 永不回本 |
| 现金跑道 | >24 个月 | <12 个月 |
| 盈利路径 | 清晰、近期 | 模糊、遥远 |
| 股份结构 | 单一类别 | 多重投票权类别 |

**风险因素红旗（出现需重点警惕）：** 持续经营存疑（going concern）、内控重大缺陷（material weakness）、监管调查、关键客户流失、创始人/核心高管离任、重大诉讼、关联方交易。

**分析要点：**
- **顺序与篇幅即材料性**：风险因素的排序与详略反映管理层感知的重要性，靠前/越详越关键。
- **追踪内部人参与**：区分募资归公司 vs. 归出售股东；内部人卖出比例与锁定期到期是供给压力与信心信号。
- **核验 TAM 主张**：公司常高估市场规模，需独立交叉验证。
- **看客户指标**：留存、集中度、流失率。
- **看股份结构**：多重类别股可能削弱普通股东权利。
- **估值上下文**：用营收/毛利倍数、P/S 与隐含增长，对照近期同业 IPO、公开可比公司与历轮融资估值。

**合规与限制：**
- 输出依赖 `octagon-sec-agent` 数据源，覆盖范围与时效以 Octagon 数据为准；关键结论应回溯原始 S-1 与财务报表核验。
- 结果仅供投资研究与分析参考，**不构成投资建议或法律意见**，不能替代专业尽调、估值、回测与风控复核。
- 缺关键参数（如公司名）时先停下确认，不要臆测公司或代码。

## 互见

- related：`octagon-sec-filing-analyst`、`octagon-sec-risk-factors`、`octagon-sec-mda-analysis` —— 同属 Octagon SEC 文件解读族；S-1 面向 IPO 前，10-K/10-Q/8-K 面向已上市公司。
- related：`alpha-vantage-market-data` —— S-1 是定性招股书解读，配合行情/基本面 API 做定量交叉验证（如同业 IPO 比较）。
- combines_with：`diligence-issue-extractor` —— S-1 中的红旗信号（持续经营、内控缺陷、客户集中、关联交易）汇入尽调问题清单，组成投前风险评估。
- combines_with：`dcf-valuation-model`、`three-statement-model` —— 把 S-1 提炼的营收增长、利润率轨迹、募资与资本结构假设喂进估值与建模，得到 IPO 定价参考区间。

---
采编自 OctagonAI/skills（MIT 许可），已做中文适配重写。
