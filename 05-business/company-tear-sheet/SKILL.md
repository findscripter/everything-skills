---
name: company-tear-sheet
title: 公司速览资料卡生成
description: 当用户要为某家公司（给出公司名/股票代码）生成一页式速览资料卡、公司画像/概况/fact sheet、并购标的画像或销售拜访前情报时使用；通过 S&P Global / Kensho MCP 拉取 Capital IQ 实时数据、按受众组装成专业排版 DOCX；不适用于无 S&P Global MCP 工具可用、用训练记忆编造财务数据、或需要深度 initiation 报告/季度财报点评的场景；触发词：tear sheet、公司速览、company one-pager、公司画像、并购标的画像、销售拜访前情报
domain: 商业/finance
triggers: [tear sheet, 公司速览, company one-pager, 公司画像, company profile, fact sheet, company snapshot, 并购标的画像, M&A 标的画像, 销售拜访前情报, 公司概况资料卡, equity research summary]
tags: [finance, tear-sheet, s&p-capital-iq, kensho, mcp, docx, equity-research, m&a, corp-dev, sales]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [nodejs, docx, mcp-sp-global]
requires: []
related: [octagon-company-market-cap, initiating-coverage-report, sector-landscape-report, octagon-equity-research-analyst]
combines_with: [ma-buyer-list, ic-investment-memo, ib-pitch-deck-builder]
license: Apache-2.0
source: anthropics/financial-services
source_license: Apache-2.0
---
## 何时使用

为**单家公司**生成一页/两页式速览资料卡（tear sheet），数据来自 **S&P Global / Kensho MCP**（Capital IQ 实时数据），排版为专业 DOCX。

支持四类受众，开工前必须确定（用户没说就**先问**）：

- **股票研究 Equity Research**——买方/卖方分析师评估投资，默认 1 页，密度高是惯例。
- **投行 / 并购 IB·M&A**——交易语境下的公司画像，默认 1-2 页。
- **企业战略 Corp Dev**——内部团队评估收购标的，默认 1-2 页。
- **销售 / BD Sales·BD**——客户会议前准备，默认 1-2 页。

公私两类公司均可，私有公司预期数据更稀疏。

**不该用的边界：**

- 会话中**没有 S&P Global MCP 工具**可用 → 本技能无数据源，不要用训练知识硬凑（违反数据完整性规则 1）。
- 需要 30-50 页深度首次覆盖报告（initiation）或多页季度财报点评 → 用 `equity-earnings-update-report` 等专门技能。
- 只想要纯文本要点、不需要正式 DOCX → 杀鸡用牛刀。

## 步骤

### 1. 确定输入

收集四项：① **公司**（名或 ticker；只给 ticker 先查全名）；② **受众**（四选一，缺省必问）；③ **可比公司**（可选，ER/IB/CD 需要，未给则用工具识别同业）；④ **页数偏好**（可选，缺省按上表）。顺手接住用户自然给出的语境（谁是收购方、卖什么、潜在买家），并入 Strategic Fit / Conversation Starters 等综合小节，不要主动追问。

### 2. 读受众参考

按受众读源技能目录下对应参考：`references/equity-research.md` / `ib-ma.md` / `corp-dev.md` / `sales-bd.md`。每份定义小节、查询计划、排版细则与页数缺省。

### 3. 拉数据（写盘即事实源）

先建工作目录：

```bash
mkdir -p /tmp/tear-sheet/
```

按参考文件查询计划（每受众 4-6 步），用会话中可用的 S&P Global / Kensho 工具拉取：公司信息、财务、市场数据、一致预期、电话会、并购交易、业务关系。

- **每查完一步立即写盘**到对应中间文件，**不要攒到最后**——落盘的数据可抵御长会话的上下文衰减。
- **财务数据始终拉 4 个财年**（虽只展示 3 年），最早一年用来算首个展示年的 YoY 增长，否则会显示 N/A 像缺数据。
- 用真实财年标号（FY2022/FY2023/FY2024），绝不用相对标签（FY-1）。
- 工具没返回的数字 → 标 "N/A" / "Not disclosed"，**绝不编造**，不用训练知识填补。
- **私有公司**：跳过股价/52 周区间/beta/一致预期/交易倍数，主攻业务概览、关系、股权结构；表头醒目标注 "Private Company"。

中间文件 schema（按需创建，存**原始值**，不在此预算派生指标）：

| 文件 | 格式 | 用于 |
|---|---|---|
| `company-profile.txt` | 键值 | 全部 |
| `financials.csv` | `period,line_item,value,source` | 全部 |
| `segments.csv` | `period,segment_name,revenue,source` | ER/IB/CD |
| `valuation.csv` | `metric,trailing,forward,source` | ER/IB/CD |
| `consensus.csv` | `metric,fy_year,value,source` | ER |
| `earnings.txt` | 结构化文本 | ER/IB/Sales |
| `relationships.txt` | 结构化文本 | IB/CD/Sales |
| `peer-comps.csv` | `ticker,metric,value,source` | ER/IB/CD |
| `ma-activity.csv` | `date,target,deal_value,type,rationale,source` | IB/CD |
| `calculations.csv` | `metric,value,formula,components` | 全部（步骤 4 写） |

### 4. 算派生指标 + 校验（仅计算，不再查 MCP）

读回全部中间文件，单次集中计算：毛利率/EBITDA 率/FCF 率/经营利润率、各项 YoY 增长、FCF 转化率、R&D 与 Capex 占营收比、净负债（总负债−现金）与净负债/EBITDA、各分部占**合并总营收**比（规则 8：用合并营收做分母，不用分部加总，因有抵消项）。

**算式即校验**：利润率=分子/分母、增长=(本期−上期)/上期、分部应加总到合并营收（否则去掉合计行）、"% of Total" 列应≈100%、EV/Revenue≈所示倍数。任一校验失败先用原始值重算，仍不一致就标 N/A——速览卡里的静默算错会毁掉可信度。结果写入 `calculations.csv`。

### 5. 核验文件

逐个读中间文件并打印核验摘要（✓ / ⚠ MISSING + 行数/字段数）。**软门禁**：缺文件只告警不阻断（缺数据由 N/A 与跳节优雅降级）。**硬规则：文件——而非你对会话的记忆——是文档中每个数字的唯一事实源。**

### 6. 排版 DOCX

读 `/mnt/skills/public/docx/SKILL.md` 取 docx-js 机制，套用下方组件函数。文件名 `[Company]_TearSheet_[Audience]_[YYYYMMDD].docx`（例 `Nvidia_TearSheet_CorpDev_20260220.docx`），存到 `/mnt/user-data/outputs/` 后呈给用户。超页时按参考文件的**编号删减顺序**逐节砍，**不得**把字号/页边距压到模板下限以下。

## 指令

**必须调用以下组件函数建文档元素，不要手写 docx 样式代码。** 把函数原样拷进生成的 Node 脚本：

- `createHeaderBanner(companyName, leftFields, rightFields)`——海军蓝(#1F3864)满宽横幅 + 白字公司名；其下**键值对必须用无边框两栏表**铺满页宽：左栏公司标识（ticker/总部/成立年/员工/行业），右栏财务标识（市值/EV/股价/流通股）。所有 cell `borders: none`、`shading: none`、列宽各 50%。**两栏铺开是区分专业 tear sheet 与默认文档最重要的视觉信号**，禁止全部左挤一列，禁止给表头键值块加边框表。
- `createSectionHeader(text)`——小节标题（11pt 粗、Primary 色），分隔线做成**标题段自身的下边框**（`border.bottom`，#CCCCCC 0.5pt），段后间距 0pt，绝不另起段落画 rule，不用 `thematicBreak`。
- `createTable(headers, rows, options)`——**所有表格数据**都走它（财务摘要、交易可比、并购活动、关系表、融资史）；表头填充 #D6E4F0、数据行白/#F2F2F2 交替、边框 #CCCCCC、数值列右对齐；**永远 `ShadingType.CLEAR`**（用 SOLID 会变黑底）。并购活动表传 `{ accentHeader: true }`。**带边框的表仅用于财务数据。**
- `createBulletList(items, style)`——统一用 `•`；综合/分析类要点（Earnings Highlights、Strategic Fit、Integration Considerations、Conversation Starters）用 `"synthesis"`（左缩进 360 DXA + 悬挂），关系类信息用 `"informational"`（180 DXA）。不给任何要点加左边框装饰。
- `createFooter(date)`——传给 `Document` 的 `footers.default`，**每页必有**，两行居中 7pt 斜体 #666666：

```
Data: S&P Capital IQ via Kensho | Analysis: AI-generated | [Month Day, Year]
For informational purposes only. Not investment advice.
```

**数字格式：** 表内为纯数字带千分位、**无美元符**（"4,916" 不是 "$4,916"，单位放列头如 "Revenue ($M)"）；营收 >$50B 用十亿一位小数，否则用百万；负数加括号 "(2.3%)"；百分比一位小数。

## 示例

`createHeaderBanner` 的核心结构（无边框两栏键值表）：

```javascript
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };
const noShading = { type: ShadingType.CLEAR, color: "auto", fill: "FFFFFF" };
// 左栏 buildCellParagraphs(leftFields) / 右栏 rightFields，各 width:50%
new TableCell({ children: buildCellParagraphs(leftFields), borders: noBorders, shading: noShading,
  width: { size: 50, type: WidthType.PERCENTAGE } });
```

小节标题下边框（不另起段落画线）：

```javascript
new Paragraph({
  children: [ new TextRun({ text, bold: true, size: 22, color: "1F3864", font: "Arial" }) ],
  spacing: { before: 240, after: 0 },               // 12pt before / 0pt after
  border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" } },
});
```

`calculations.csv` 示例行：

```
metric,value,formula,components
gross_margin_fy2024,72.4%,gross_profit/revenue,"9524/13159"
revenue_growth_fy2024,12.3%,(current-prior)/prior,"13159/11716"
net_debt_fy2024,2150,total_debt-cash,"4200-2050"
```

## 注意事项

- **数据完整性规则（压倒一切）**：S&P Global 工具是财务数据**唯一**来源；找不到就标注不省略；标清财年口径与市场数据 "as of" 日期；不混报告期（FY2023 营收 vs LTM EBITDA 要分别标）；优先用工具返回的预算字段（净负债/EBITDA/FCF）而非手算。
- **同一公司多份 tear sheet 数值必须一致**：净负债、营收、EBITDA、利润率、增长率跨受众逐字相同，**复用同一批取数**，不要各报告独立重查重算。
- **每份叙事按受众重写**：CIQ 公司摘要是输入不是输出，**绝不原样粘贴**——ER 简洁立论、IB 推介散文、CD 产品导向、Sales 大白话。综合小节（Strategic Fit、Integration Considerations、Conversation Starters）是 tear sheet 的价值所在，要把数据点连成叙事，光列公司名不算综合。
- **管理层数据**：无任何 S&P Global 工具返回高管/管理层信息，模板里有该节就**整节删掉**，绝不用训练数据填（违反规则 1 且陈旧）。股权结构仅在工具返回时纳入。
- 始终纳入**前瞻(NTM)倍数**（工具同时返回 trailing 与 forward 时两者都要）；并购已知交易额不得降级为 "Undisclosed"；分部有待剥离的标脚注并给 pro-forma 口径。

## 互见

- related：`equity-earnings-update-report` —— 同源卖方研究产物，季度财报点评与一页速览卡互补。
- related：`competitive-analysis` / `competitive-intel-tracker` —— 校准同业可比与 peer comps。
- related：`market-sizing-analyst` —— 为 Corp Dev/IB 受众补市场与增长背景。
- combines_with：`ma-playbook` —— 把并购标的速览卡接入完整并购流程剧本。
- combines_with：`board-deck-builder` —— 把速览卡结论压缩成投委会/董事会决策页。
- combines_with：`data-storyteller` —— 把综合小节讲成更有说服力的图文叙事。

---
采编自 anthropics/financial-services（Apache-2.0）。
