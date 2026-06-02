---
name: data-storyteller
title: 数据叙事与可视化表达
description: 当要把分析结果讲给高管/客户/非技术听众、或写数据报告与汇报材料时使用；做数据叙事的结构编排+图表标注+一句话洞察的可交付产物（叙事框架、汇报骨架、matplotlib 标注代码、标题公式）；不适用于数据清洗、统计建模、纯探索分析或事实核查；触发词：数据叙事、data storytelling、数据可视化、汇报/演示、季度复盘、QBR、executive presentation、把数据讲成故事
domain: 商业/marketing
triggers: [数据叙事, data storytelling, 数据可视化, 汇报/演示, 季度复盘, QBR, executive presentation, 把数据讲成故事]
tags: [data-storytelling, visualization, presentation, marketing, analytics, communication]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [matplotlib, pandas, markdown]
requires: []
related: [board-deck-builder, campaign-attribution-analytics, marketing-analytics-tracker, social-media-performance-analyzer]
combines_with: [board-deck-builder, campaign-attribution-analytics, marketing-analytics-tracker]
license: MIT
source: wshobson/agents
source_license: MIT
---
## 何时使用

- 把分析结果讲给高管、投资人、客户或非技术听众，需要"结论先行、有故事线、能驱动决策"时。
- 写数据驱动的报告、季度业务复盘（QBR）、月度经营回顾、投资人材料。
- 已有一堆图表/数字，但读者抓不住重点，需要重新编排成有洞察的叙事。
- 触发词：数据叙事、data storytelling、数据可视化、汇报/演示、季度复盘、QBR、executive presentation、把数据讲成故事。

不该用的边界：
- 不做数据清洗、口径对齐、缺失值处理——交给 `csv-data-cleaner` / `sql-query-builder`。
- 不做统计建模、显著性检验、探索性分析本身——本技能只负责"已有结论后怎么讲"。
- 不替代事实核查；所有数字、"研究表明"类断言须经 `fact-checking`，本技能不担保数据真实性。
- 不是纯品牌文案或视觉设计工具——版式/配色细节见 `canvas-design`。

## 步骤 / 指令

输入：`audience`（听众与其目标）、`key_insight`（一句话核心洞察）、`data[]`（支撑数据）、`decision`（你想要的决策/行动）。

```
1. 先定"so what"——一句话洞察
   - 用公式写标题：[具体数字] + [业务影响] + [可行动语境]。
     反例「Q4 销售分析」→ 正例「Q4 销售超目标 23%——原因在此」。
   - 这句话决定整篇骨架；写不出来就别开工。

2. 选叙事框架（三选一）
   - 问题-解决：Hook 痛点($)→现状基线→根因→洞察(配图)→方案→预期收益→Call to Action。
   - 趋势变化：起点→做了什么(时间线)→前后对比表→关键洞察→下一步目标。
   - 对比抉择：抛出问题→A/B 并列→加权打分矩阵→推荐+理由→风险缓解。

3. 按叙事弧排序（不是按数据顺序）
   Hook(意外洞察) → Context(基线) → Rising(逐步铺数据)
   → Climax(关键洞察) → Resolution(建议) → Call to Action(下一步)。
   前置结论，方法论靠后（"context, then method"）。

4. 三支柱校验每一页
   - 数据(证据)：数字/趋势/对比；
   - 叙事(意义)：语境/因果/影响；
   - 视觉(清晰)：图表/高亮/标注。三者缺一不可。

5. 可视化做减法+加标注（见示例代码）
   - 渐进披露：一次只加一层信息，每页一个论点。
   - 对比并列：Before/After、This/That 直接放一起放大差异。
   - 图上标注关键事件、阈值线、高亮区间——让读者一眼看到"看哪里"。

6. 量化收益 + 明确 the ask
   - 给 ROI、回收周期、影响区间（用范围如 $400K-$600K，别给假精度）。
   - 不确定性诚实表达：「95% 置信下…」「相关性强，但因果需…」。
   - 结尾一个具体请求：要什么决策/预算/资源。
```

## 示例

标题公式与过渡语：

```
标题 = [具体数字] + [业务影响] + [可行动语境]
  「我们正因可预防的流失损失 $2.4M」
推进叙事：「深挖下去会发现…」「与此形成对比的是…」
引出洞察：「数据揭示了…」「让我们意外的是…」「拐点出现在…」
转向行动：「这一洞察意味着…」「基于此分析，我们建议…」
```

matplotlib 标注（把折线图变成有故事的图）：

```python
import matplotlib.pyplot as plt
fig, ax = plt.subplots(figsize=(12, 6))
ax.plot(dates, revenue, linewidth=2, color='#2E86AB')
# 标注关键事件
ax.annotate('Product Launch\n+32% spike',
    xy=(launch_date, launch_revenue),
    xytext=(launch_date, launch_revenue * 1.2), fontsize=10,
    arrowprops=dict(arrowstyle='->', color='#E63946'), color='#E63946')
# 高亮增长区间 + 目标线
ax.axvspan(growth_start, growth_end, alpha=0.2, color='green', label='Growth Period')
ax.axhline(y=target, color='gray', linestyle='--', label=f'Target: ${target:,.0f}')
ax.set_title('Revenue Growth Story', fontsize=14, fontweight='bold'); ax.legend()
```

高管摘要页骨架（一页讲清）：

```
KEY INSIGHT: "第一周完成 onboarding 的客户 LTV 高 3 倍"
左栏 THE DATA          | 右栏 THE IMPLICATION
 LTV $4,500 / 留存 85% |  ✓ 优先 onboarding 体验
 对照组 LTV $1,500     |  投资 $75K，预期 ROI 8x
```

## 注意事项

- 结论先行（front-load）：每页/每节开头先给可独立摘录的结论，别把洞察埋在最后。
- 狠心做减法（don't data dump）：只留支撑主线的数据，删掉"虽然有但不相关"的图。
- 别先讲方法论：先给语境和结论，方法/口径放附录或靠后。
- 匹配听众词汇，去术语（don't use jargon）；让数据自己说话（show, don't tell）。
- 数字必须有意义：任何统计值、价格、排名、"研究表明"一律标 [需核查] 交 `fact-checking`，本技能不自证事实。
- 不臆造精度：影响估计用区间，注明置信度，相关≠因果要讲清。
- 三的法则：三个论点、三组对比，超过就拆分。
- 每篇必有 Call to Action：没有明确"要什么决策"的数据故事是失败的。

## 互见

- related：`seo-content-writer` —— 同源的"结论先行/answer-first"写作原则，做对外内容时复用。
- related：`markdown-to-docx` —— 把产出的报告 Markdown 转成可交付 Word 文档。
- related：`fact-checking` —— 文中所有数据与事实性断言须经其核验。
- related：`canvas-design` —— 需要把叙事落成正式视觉版式/配色时下钻。

---
本条采编自 wshobson/agents（MIT 许可）。
