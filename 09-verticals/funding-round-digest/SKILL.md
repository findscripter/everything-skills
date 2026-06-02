---
name: funding-round-digest
title: 融资轮次要点速递
description: 当用户要做交易流（deal flow）速递、周度融资复盘、交易盘点或资本市场简报时使用；做法是按所盯赛道/公司用 S&P Capital IQ 取近期融资轮次数据，提炼 3–5 条要点并生成一页式 PPTX 简报（含估值、Capital IQ 交易链接与 AI 免责声明）；不适用于深度个股研报、实时盯盘下单或多页报告。触发词：交易流速递、deal flow、周度融资复盘、deal roundup、资本市场简报
domain: 领域/fintech
triggers: [交易流速递, deal flow digest, 周度融资复盘, weekly funding recap, deal roundup, 交易盘点, 资本市场简报, capital markets update, 本周某赛道融资, 融资活动汇总]
tags: [fintech, deal-flow, 融资轮次, 估值, 资本市场, PPTX, Capital IQ, S&P Global, 简报]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [S&P Global Capital IQ MCP, pptxgenjs, simple-icons, sharp, markitdown]
requires: []
related: [ib-deal-tracker, deal-pipeline-tracker, company-tear-sheet, octagon-equity-research-analyst]
combines_with: [company-tear-sheet, ib-deal-tracker]
license: Apache-2.0
source: anthropics/financial-services
source_license: Apache-2.0
---
## 何时使用

- 需要把近期融资轮次与资本市场动态压成**一页式 PPTX 简报**（交易流速递 / 周度融资复盘 / deal roundup）时。
- 用户有持续盯防的赛道或公司清单，要定期产出「本周/近两周发生了什么」的高管级简报时。
- 需要带估值数据、交易对比表、可下钻的 Capital IQ 链接的「执行仪表盘」式幻灯片时。

**不该用的边界：**

- 单家公司的深度首次覆盖 / 投资评级研报——那是 `octagon-equity-research-analyst`，本条只做横向速递。
- 实时盯盘、下单撮合、交易执行。
- 多页长报告或不含 Capital IQ 数据源的纯文案。

**前置**：助手需已配置 **S&P Global Capital IQ MCP**（提供 `get_info_from_identifiers`、`get_rounds_of_funding_from_identifiers` 等工具），并能调用 `pptxgenjs` 出片。

**强制免责声明（不可省略）**：PPTX 页脚必须放醒目黄色横幅——`Analysis is AI-generated — please confirm all outputs`（分析由 AI 生成，请核验所有产出）。缺此则报告视为不完整。

## 步骤

**Step 1 · 锁定覆盖范围与周期**
- 老用户：复用历史 watchlist（查对话历史）。
- 新用户：问清**赛道**（至少一个，如 AI / Fintech / Biotech）、**指定公司**（可选）、**时间窗**（默认近 7 天）。由时间窗算出精确 `start_date` / `end_date`。

**Step 2 · 搭建公司池（先校验后扩展）**
1. 从领域知识取种子公司。
2. **先批量预校验**（关键，避免静默丢数据）：`get_info_from_identifiers(identifiers=[本赛道全部种子])`，按 `status` 分流——`Operating` 进下一步；`Operating Subsidiary`（子公司）记作上下文但**不查融资**；其它状态（关停/失效）只可能有历史数据。
3. 仅用已解析的种子做竞品扩展：`get_competitors_from_identifiers(identifiers=[resolved_seeds], competitor_source="all")`。
4. 对扩展出的公司再跑一次 `get_info_from_identifiers` 同样分流，按 `simple_industry` 过滤到目标赛道。
- 用户直接指定的公司也要走预校验。每赛道控制在 **15–40 家已解析且 Operating** 的公司；多赛道合计 50–100+。

**Step 3 · 拉取融资轮次**

```
get_rounds_of_funding_from_identifiers(
    identifiers=[batch],
    role="company_raising_funds",
    start_date="YYYY-MM-DD",
    end_date="YYYY-MM-DD"
)
```

- 池大时按 **15–20** 家分批；每批后对空结果公司走回退（换法定实体名 / `company_id` 重试），穷尽回退后才记 "no data"。
- 汇总所有 `transaction_id`，**一次性**传入 `get_rounds_of_funding_info_from_transaction_ids(transaction_ids=[全部])` 取明细。
- 每轮提取（出片必需）：`transaction_id`、**公告日**、**关闭日**、募资额、投前/投后估值、领投方、轮次（Series A/B/C…）、证券条款、顾问、定价趋势（up/down/flat）。日期必填，缺一项标 `—`。

**Step 4 · 补公司背景**：对重大交易公司用 `get_company_summary_from_identifiers` 取一句话简介，丰富叙事。

**Step 5 · 提炼要点与趋势**
- 标记「Notable」：单轮 ≥ $100M、down round、新晋独角兽（投后越过 $1B）、估值跳涨（投后 ≥ 上轮 2x）、6 个月内重复融资、超大投资人团。
- 看趋势：本期总投放额、最热子赛道、轮次阶段分布、最活跃投资人、地域集中度、投前估值压缩/扩张。
- **蒸馏 3–5 条 Key Takeaways**——一句话、有冲击力、数据背书，是幻灯片的核心。

**Step 6 · 生成公司 Logo（两级本地管线，禁用 Clearbit）**
- 一级 `npm install simple-icons sharp`：按品牌名（含去 AI/Inc./Corp. 后缀重试）匹配 SVG，用 `icon.hex` 上色后 `sharp` 转 128×128 透明 PNG。覆盖约 43%。
- 二级回退：`sharp` 生成「灰底（`BDBDBD`）+ 白色首字母」圆形 PNG，覆盖 100%。若依赖装不上，用 pptxgenjs 形状（灰椭圆 + 白字）兜底。统一风格，勿混搭。

**Step 7 · 出一页 PPTX**：先读 `pptx` 技能与 `pptxgenjs.md`，再用 `pptxgenjs` 出**单页** `LAYOUT_16x9`，信息密但干净（执行仪表盘风，非文字墙）。

**Step 8 · QA**：① 内容 `python -m markitdown digest.pptx` 核对文本/数字/链接；② 视觉转 PDF→图片查重叠/溢出/对齐/对比度；③ 链接核对 transaction_id；④ 至少一轮改了再验。

**Step 9 · 交付**：导出 PPTX 并用 2–3 句口头小结（覆盖 X 轮共募 $Y、点名最值得注意的交易与估值、提示 down round 等隐忧）。

## 指令

**实体解析 6 条铁律（贯穿全流程，防静默丢数）：**

- **Rule 0**：查融资前所有标识先过 `get_info_from_identifiers`，看是否解析 + 看 `status` 分流。
- **Rule 1**：空结果绝不轻信，先回退——换法定实体名/`company_id`。常见品牌→法定名：Together AI→`Together Computer, Inc.`、Character.ai→`Character Technologies, Inc.`、Runway ML→`Runway AI, Inc.`。
- **Rule 2**：子公司（DeepMind/GitHub/Instagram/BeReal…）零独立融资轮，资本事件记在母公司层；`status="Operating Subsidiary"` 即可识别，跳过其融资查询。
- **Rule 3**：主数据源用 `get_rounds_of_funding_from_identifiers`，**不要**把 `get_funding_summary_from_identifiers` 当唯一来源（summary 快但可能漏/错，只宜做总量速查并回校）。
- **Rule 4**：大池（50+）按 15–20 分批，每批后对空结果走回退再继续。
- **Rule 5**：`role` 参数决定视角——`company_raising_funds`（公司募了哪些轮，速递几乎都用它）vs `company_investing_in_round_of_funding`（某投资人投了什么）。用错静默返空。
- **Rule 6**：解析大小写不敏感但拼写/标点敏感（`Character AI` 可能失败而 `Character.ai` 成功），拿不准就用 `company_id`（如 `C_1829047235`）。

**设计规范（单色高管风，严格执行）：**

- 配色：白底 `FFFFFF` / 近黑头条 `1A1A1A` / 正文近黑 / 次要灰 `6B6B6B` / 分隔线 `D0D0D0` / 卡片底 `F5F5F5` / 链接蓝 `2B5797`。语义色仅极少量用作小圆点或单词高亮：down round/负向 `C0392B` 红，亮眼正向（新独角兽/超大轮）`2E7D32` 绿。无值得标色的数据点就**全单色**。
- Logo 是页面上唯一「全彩」元素；除 Logo 与链接外，幻灯片黑白打印应仍正确。绝不给背景/装饰条/分隔线上色。
- 布局：头条 → 4 张统计卡（Total Raised / # Rounds / 投前均值 / 最大单轮，若投前多未披露则换 Median Round Size 或 # New Unicorns）→ Key Takeaways（每条前缀公司 Logo）→ Top Deals 表 → 页脚（含来源 S&P Global Capital IQ + 上述 AI 免责声明）。
- Top Deals 表列：Company / Type / **Announced** / **Closed** / Amount($M) / Pre-$ / Post-$ / Lead / Deal Link。日期 `MMM DD`，缺则 `—`；表格**水平居中**：`TABLE_X = (SLIDE_W - sum(colW)) / 2`；超过 6 笔取前 6 并加脚注 `+N additional deals not shown`。
- 交易链接（pptxgenjs 在单元格 `options.hyperlink.url`）：
  `https://www.capitaliq.spglobal.com/web/client?#offering/capitalOfferingProfile?id=<transaction_id>`，`<transaction_id>` 来自 `get_rounds_of_funding_from_identifiers`；ID 无效则该行省略链接，不放坏链。

## 示例

**用户输入**：「给我一份 AI 和 fintech 的周度交易流速递。」

**Key Takeaway 范例（一句话、数据背书）：**

- 「AI 赛道本周 8 轮共募 $2.4B，为上周 3 倍，由 [Company] $800M 巨轮领跑，投后估值 $12B。」
- 「[Company] 完成 $200M Series D，投前 $3.5B（上轮 Series C 为 $1.8B）——AI 开发者工具需求强劲。」
- 「下行信号抬头：6 笔后期轮中有 2 笔定价低于上轮估值。」

**其它触发句**：「总结本周 biotech 融资」「cybersecurity / cloud infra / dev tools 近两周 deal roundup」「本月 climate tech 出张速递图」。

## 注意事项

- **零活动也是信息**：某赛道本期无融资，幻灯片上明确写 `No transactions recorded in [Sector] during the period`，不要留白。
- **估值稀疏**：投前/投后多未披露时，表中填 `—`、页脚注明数据局限，并把统计卡换成 Median Round Size 等可得指标。
- **回退优先于报空**：把「no data」前先穷尽法定名/`company_id`/competitor 扩展；竞品扩展太少说明种子太冷门，补 2–3 个知名名再扩。
- **失效公司**：如 Convoy（2023-10 关停）仍能解析但永无新动态，标记为关停/子公司语境，别报成「无活动」。
- **pptxgenjs 用工厂函数**（非共享对象）生成阴影与重复样式，按 pptxgenjs pitfalls 指引避坑。
- **页脚 AI 免责声明绝不可省**，否则报告不完整。

## 互见

- requires：无硬前置；运行依赖已配置的 **S&P Global Capital IQ MCP** 与 `pptxgenjs` 出片能力。
- related：`octagon-equity-research-analyst`（单股深度研报，与本条横向速递互补）、`dcf-valuation-model` / `three-statement-model`（对某笔重大交易做估值/建模下钻）、`alpha-vantage-market-data`（补行情/基本面）。
- combines_with：`octagon-equity-research-analyst`（速递锁定标的后转入深研）、`board-minutes-drafter`（把速递结论转为投委会纪要）、`alpha-vantage-market-data`（Capital IQ 缺项时补数据）。

---

本条采编自 anthropics/financial-services（Apache-2.0）。
