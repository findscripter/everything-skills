---
name: equity-earnings-update-report
title: 股票财报点评报告撰写
description: 当对已覆盖公司季度财报做快速点评、24-48 小时内出 8-12 页卖方风格报告（beat/miss、关键指标、上调/下调预测、逻辑修正）时使用；产出含摘要表、图与可点击来源链接的 DOCX；不适用于首次覆盖深报告 initiation、flash 快评、或无覆盖与预测基准的公司；触发词：财报点评、earnings update、季度点评、beat miss、post-earnings
domain: 商业/finance
triggers: [财报点评, earnings update, 季度点评, beat miss, 业绩点评, post-earnings, 季报点评, quarterly update, 上调预测, 下调预测, EPS 超预期]
tags: [finance, equity-research, earnings, beat-miss, valuation, docx, 卖方研究]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [python, matplotlib, pandas, seaborn, docx]
requires: []
related: [variance-flux-commentary, data-storyteller, board-deck-builder, market-sizing-analyst, competitive-analysis]
combines_with: [data-storyteller, board-deck-builder, pricing-strategy]
license: Apache-2.0
source: anthropics/financial-services
source_license: Apache-2.0
---
## 何时使用

为**已在覆盖范围内**的公司写季度业绩点评，遵循卖方机构（JPM/GS/MS）格式。核心特征：

- **篇幅**：8-12 页、3000-5000 字；表 1-3 张（仅摘要，非全量三表）；图 8-12 张。
- **时效**：财报发布后 24-48 小时内出稿。
- **读者**：已熟悉公司，只想知道「有什么新变化」——beat/miss、预测调整、逻辑影响。
- **字体**：默认全文 Times New Roman（除非用户另行指定）。

**不该用的边界：**

- 首次覆盖深度报告（initiation，30-50 页）→ 用别的技能。
- flash note / quick take 快评 → 格式不同。
- 公司**尚未覆盖**、没有既有预测/价格目标基准 → 须先做 initiation，否则无 old vs new 可比。

## 步骤

五阶段流水线（约 6-9 小时）：

**Phase 1 数据采集（30-60 分钟）—— 训练数据必然过时，必须联网取最新**

1. 写下今天日期，作为「3 个月内」校验锚点。
2. 联网搜「[公司] latest earnings results」「[ticker] most recent quarterly earnings」，或进 IR 站按日期倒序找最新发布。
3. **校验发布日在今天 3 个月内**；否则是错季度，重搜。
4. **校验电话会 transcript 日期 = 财报发布日（±1 天）**；常见错误是抓到旧 transcript。
5. 采全：财报新闻稿、10-Q/10-K（SEC EDGAR，按 ticker 搜，链接形如 `https://www.sec.gov/cgi-bin/viewer?accession=...`）、电话会 transcript、投资者 PPT、**发布前**的一致预期（Bloomberg/FactSet，标注「as of [财报前日期]」）、上季/去年同期/此前自有预测。
6. 弄清公司财年口径（日历年 vs Nike/Apple/Walmart 等非标准财年）再解读季度。
7. 红旗任一命中即停下重采：发布日 >90 天、说不出确切发布日、transcript 与发布日不符、各材料季度口径不一致、凭记忆而非实际文档。

**Phase 2 分析（2-3 小时）**

- 逐项 beat/miss 并量化（「营收超 $400M / 3%」），解释**为什么**与预期不同、是一次性还是可持续。
- 分部 / 地区 / 产品 / 渠道拆解；毛利率与经营利润率驱动；指引分析（新 vs 旧 vs Street，评估可信度/历史是否压低）。
- 更新模型：当年剩余季度 + 下一年（+ 后年），**old vs new 并列+变动原因**；投影先建下行（downside）。
- 重估值与价格目标：估值变动 >5% 通常调价；逻辑增强/减弱也可不动预测而调。
- 评估评级：显著超预期+上调指引→考虑上调；显著不及+下调指引→考虑下调；持平/喜忧参半→维持。

**Phase 3 出图（1-2 小时）** — 8-12 张，聚焦季度趋势与「新变化」：季度营收/EPS 进度（柱，叠 beat/miss）、季度利润率（线）、分部/地区营收、关键运营指标、beat/miss 拆解（瀑布）、预测修正前后对比、估值倍数带。Python（matplotlib/pandas/seaborn）出图。

**Phase 4 出报告（2-3 小时）** — DOCX，页页结构见下「指令」，嵌入全部图、1-3 摘要表、完整来源段。

**Phase 5 质检交付（30 分钟）** — 走清单：beat/miss 已量化、old vs new 预测已展示、价格目标已更新或显式维持、评级有理由、每图每表有来源行、所有 URL 为可点击超链接、数字与公司披露逐字一致、数据全来自最新季度、一致预期为财报前。

## 指令

**页页结构（8-12 页）：**

- **P1 业绩摘要**：抬头（公司/ticker/季度/日期/评级/现价/价格目标 old→new）+ 速览框（Reported vs Est vs Variance）+ 3-4 条 `■ 粗体标题 + 段落` 投资影响 + 更新预测表（old/new/Change/次年）。
- **P2-3 结果详析**：营收（分部拆解、YoY/QoQ）+ 盈利（毛利/经营利润率驱动、Adj vs GAAP EPS 调节），嵌 2-3 图。
- **P4-5 关键指标与指引**：运营指标表（含 our est / var）+ 指引（新 vs 旧 vs Street + 我们的判断），嵌 2-3 图。
- **P6-7 投资逻辑更新**：逐条 thesis pillar 标 `STRENGTHENED/UNCHANGED/WEAKENED` + 150-200 字论证；风险更新。
- **P8-10 估值与预测**：DCF 输入更新、可比公司倍数、价格目标方法（DCF/PE/EV-EBITDA 加权）、明细预测表（FY24E/FY25E）。
- **P11-12 附录（可选）**：季度模型、电话会 Q&A 摘录、同业对比。

**来源与超链接（强制）：** 每图每表底部「Source: …」带文档名+日期；正文关键数据加脚注；报告末尾「SOURCES & REFERENCES」段。所有 SEC 文件超链到 EDGAR viewer，财报稿/transcript/PPT 均为**蓝色下划线可点击**超链接（非纯文本 URL）。电话会引用须注明发言人与大致时间点。

**写作风格：** 数字打头（「营收增 15% 至 $1.2B」而非「营收强劲」）；用「vs.」不用「versus」；实际值标 A（Q3'24A）、预测值标 E（Q4'24E）；只讲「新变化」，勿大段重述公司背景。

**输出文件名：** `[Company]_Q[Quarter]_[Year]_Earnings_Update.docx`，例 `Nike_Q2_FY24_Earnings_Update.docx`。XLS 模型更新为**可选**（不像 initiation 那样必需）。

## 示例

关键指标提取模板（Phase 1 Step 3）：

```
REPORTED RESULTS vs. ESTIMATES:
                  Reported   Our Est   Consensus   Beat/(Miss)
Revenue           $X,XXX     $X,XXX    $X,XXX      $XX (X%)
Gross Margin      XX.X%      XX.X%     XX.X%       XXbps
EPS (Adjusted)    $X.XX      $X.XX     $X.XX       $X.XX
```

beat/miss 论述（先结论后归因）：

> ■ **营收超预期 3%，DTC 渠道驱动**
> Q3 营收 $13.5B，超我们 $13.1B 估计 $400M（3%）、超一致预期 $13.2B（2%）。超预期主要来自 DTC（同比 +18%，我们估 +12%），抵消了弱于预期的批发（-5% vs. 持平估计）。管理层归因于数字需求强劲与新品（Pegasus 40、Jordan 新配色）。DTC 占比由去年 38% 升至 42%，验证渠道转移战略。

预测更新（old vs new 并列）：

```
                   Old Est   New Est   Change   Reason
FY2024E Revenue    $XX.XB    $XX.XB    +X.X%    [简述]
FY2024E EPS        $X.XX     $X.XX     +X.X%    [简述]
```

## 注意事项

- **时效高于一切**：超过 90 天的「最新财报」几乎一定是错季度；凭训练记忆而非实际文档是本类报告的第一大错误。
- **一致预期必须是财报前快照**，否则 beat/miss 失真。
- 全文数字须与公司披露**逐字一致**，自检算式（预测、估值）；ticker / 公司名 / 数字零拼写错误。
- 来源**无法核实就不要编造动因**；找不到数据宁可标注缺口，不要硬凑。
- 与 initiation 的区别：篇幅 8-12 vs 30-50 页、表 1-3 vs 12-20、图 8-12 vs 25-35、范围「季度新变化」vs「公司全貌」、XLS 可选 vs 必需。

## 互见

- related：`variance-flux-commentary` —— 同为财务波动归因，月结口径可复用「为什么变」的写法。
- related：`data-storyteller` —— 把 beat/miss 与预测修正讲成有说服力的图文叙事。
- related：`market-sizing-analyst` / `competitive-analysis` —— 校准分部增长假设与同业对比。
- combines_with：`board-deck-builder` —— 把点评结论压缩成董事会/投委会决策页。
- combines_with：`pricing-strategy` —— 当 beat/miss 由定价/产品组合驱动时，下钻定价逻辑。

---
采编自 anthropics/financial-services（Apache-2.0）。
