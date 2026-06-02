---
name: morning-meeting-note
title: 晨会研究纪要起草
description: 当为卖方/买方晨会(早7点morning meeting)起草覆盖股票的隔夜动态、交易想法与当日事件纪要时使用；做出1页内、有观点、可执行的晨会note(头条研判+隔夜/盘前动态+当日事件+交易想法)，含财报速评表与评级/目标价动作；不适用于深度研报、估值建模或无观点的纯新闻摘要；触发词：晨会、morning note、隔夜发生了什么、交易想法、morning call、晨会纪要、盘前
domain: 商业/finance
triggers: [晨会, morning note, morning meeting, 隔夜发生了什么, 交易想法, trade idea, morning call, 晨会纪要, 盘前, daily note]
tags: [finance, equity-research, morning-note, sell-side, trade-idea, earnings]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [markdown, docx]
requires: []
related: [research-catalyst-calendar, equity-earnings-update-report, stock-idea-generation, earnings-preview-model]
combines_with: [company-tear-sheet]
license: Apache-2.0
source: anthropics/financial-services
source_license: Apache-2.0
---
# 晨会研究纪要起草

## 何时使用

- 为研究团队的晨会（morning meeting，通常早 7 点）起草覆盖股票（coverage universe）的隔夜/盘前动态纪要。
- 输出目标：1 页内、2 分钟读完、**带明确观点和可执行动作**——PM 和交易员要的是判断，不是新闻汇编。
- 触发词：晨会、morning note、morning meeting、隔夜发生了什么、交易想法、trade idea、morning call、盘前。

不该用的边界：
- 要写深度研报（initiation/deep dive）、估值建模或行业框架报告 → 那是另一类长文档，晨会 note 只做快、准、有观点的当日简报。
- 只想要不带观点的新闻摘要、纯转录或资讯流 → 没有 view 的晨会 note 没有价值，本技能强制"必须有判断"。
- 要直接下单/执行交易或写入 OMS → 本技能只产出想法与理由，不代为执行。

## 步骤 / 指令

```
1. 扫隔夜（Overnight Developments）——按三类过一遍覆盖范围
   财报与指引：
     - 覆盖公司隔夜或盘前是否出业绩？
     - 超预期/不及预期（营收、EPS、关键指标的 beat/miss）
     - 指引变化（上调 raised / 下调 lowered / 维持 maintained）
   新闻与事件：
     - 并购（M&A）公告或传闻、管理层变动
     - 产品发布、监管决定
     - 竞品被同行上调/下调评级
     - 影响板块的宏观数据或政策
   市场背景：
     - 隔夜期指/盘前波动、板块 ETF 表现
     - 相关大宗商品/汇率异动
     - 当日重要经济数据发布

2. 判定信号 vs 噪音
   - 可执行事件（财报、并购、指引、评级变动）→ 写。
   - 噪音（无关紧要的小分析师评论、非事件）→ 不写或一笔带过。
   - 当真没料时，"无重大消息"也是合格的晨会 note：直接写"隔夜无实质变化，维持现有持仓判断"。

3. 按固定骨架成文（保持紧凑，2 分钟可读完）
   - 头条研判（Top Call）放最前，不要把重点埋在中间。
   - 每条动态用一句话，后面紧跟"我们的看法（our take）"。
   - 给出动作：维持/上调/下调评级？调不调目标价（PT）？

4. 若有覆盖公司出财报 → 附"财报速评"表（见示例）+ 2-3 句研判 + 动作。

5. 输出
   - Markdown 文本，供邮件/Slack 分发。
   - 需正式分发时另存 Word 文档。
   - 1 页封顶——PM 和交易员不会读更多。
```

固定骨架（直接套用）：

```
[日期] 晨会纪要 — [分析师姓名]
[覆盖板块]

头条研判（Top Call）：[一句话——PM 唯一必须听到的事]
- 2-3 句说清关键进展及其重要性
- 股票影响：目标价、评级维持/变动

隔夜/盘前动态
- [公司A]：财报/新闻一句话 + 我们的看法
- [公司B]：一句话 + 我们的看法
- [板块/宏观]：板块级动态

当日重要事件
- [时间]：[公司] 财报电话会
- [时间]：经济数据发布（市场预期 vs 我们的看法）
- [时间]：行业会议/投资者日

交易想法（如有）
- [做多/做空] [公司]：1-2 句论点 + 催化剂
- 风险：什么情况会证明这个判断是错的
```

## 示例

财报速评表（某覆盖公司隔夜出业绩时）：

| 指标 | 一致预期 | 实际 | Beat/Miss |
|---|---|---|---|
| 营收 | 52.0 亿 | 54.0 亿 | Beat +3.8% |
| EPS | 1.20 | 1.31 | Beat +9.2% |
| 关键指标（如净增订阅） | 80 万 | 72 万 | Miss |
| 指引 | 维持 | 上调全年 | Raised |

我们的看法：营收/EPS 双 beat 且上调指引，整体偏正面；但核心订阅净增不及预期，是隐忧——若下季继续放缓，增长叙事承压。短期盘前情绪偏多。
动作：维持「买入」，目标价上调（指引上修支撑）；订阅指标转弱列入下次跟踪重点。

委托提示词（给 Agent 调用时）：
> 扫覆盖范围隔夜/盘前的财报、并购、指引、评级与宏观事件，区分信号与噪音。按"头条研判 / 隔夜动态 / 当日事件 / 交易想法"骨架成文，每条动态附一句话 our take，并给出评级/目标价动作。有公司出业绩就附财报速评表加 2-3 句研判。1 页封顶，必须带明确观点；真没料就写"隔夜无实质变化，维持持仓"。

## 注意事项

- **必须有观点**：只复述新闻、不给 view 的晨会 note 没有价值。
- **头条优先**：把最重要的事放最前面，别埋了头条。
- **"无消息"是合格的 note**：直接写"隔夜无实质变化，维持现有持仓判断"。
- **区分信号与噪音**：财报、并购属可执行事件；小分析师评论、非事件属噪音，别等量齐观。
- **给判断打时间戳**：若在早 6 点撰写，注明"盘前数据可能在开盘前变化"。
- **错了要认**：判断错了就在下一篇晨会 note 里坦诚——长期看可信度比每次都对更重要。
- 本技能只产出想法与理由，不代为下单/执行交易。

## 互见

- related：`variance-flux-commentary`（覆盖公司出财报时，用其差异说明法拆解营收/成本波动的真实动因，喂给速评的 our take）；`cfo-financial-advisor`（解读公司 burn/runway、单位经济与融资动作对股价的含义）；`competitive-intel-tracker`（竞品被上调/下调评级、产品发布等情报的系统化追踪）；`data-storyteller`（把财报数字讲成有结论的一句话洞察）；`board-deck-builder`（同源"先说 so what、坏消息直说"的表达纪律）。
- combines_with：`sales-call-summary`（同样的"要点提炼 + 行动项"提纯法，可复用于把电话会/渠道访谈压成一行 take）；`data-storyteller` —— 组合后晨会 note 既快又有视觉化结论；`variance-flux-commentary` —— 速评表与差异动因互补，组成完整的财报隔夜反应。

---
本条采编自 anthropics/financial-services（Apache-2.0）。
