---
name: cfo-financial-advisor
title: CFO 财务顾问（单位经济与融资）
description: 当为初创/扩张期公司做财务建模、单位经济分析、融资规划、现金跑道管理或董事会财务材料时使用；做出 base/bull/bear 跑道模型、分队列 LTV 与分渠道 CAC、稀释与 cap table 推演、董事会财务页等可决策产物；不适用于纯记账/做账或常规财务分析师事务。触发词：burn rate、runway、LTV/CAC、融资
domain: 商业/finance
triggers: [CFO, 财务建模, burn rate, 跑道 runway, 单位经济, LTV, CAC, 融资 fundraising, term sheet, cap table, 稀释, NDR 净收入留存, burn multiple, rule of 40, 董事会财务材料, 场景规划, 现金管理]
tags: [商业, finance, CFO, 融资, 单位经济, 现金跑道, SaaS指标, 财务建模, 董事会]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [burn_rate_calculator.py, unit_economics_analyzer.py, fundraising_model.py]
requires: []
related: [startup-financial-modeler, cro-revenue-advisor, cmo-marketing-advisor, board-deck-builder]
combines_with: [startup-financial-modeler, board-deck-builder, pricing-strategy]
license: MIT
source: alirezarezvani/claude-skills
source_license: MIT
---
## 何时使用

用于初创/扩张期公司的**战略财务**决策，而非记账或常规财务分析。典型场景：

- 算还剩多少跑道、要不要开始砍成本（base/bull/bear 场景）。
- 分析单位经济：分队列 LTV、分渠道 CAC、回本周期。
- 规划融资：时机、估值、稀释、term sheet、data room。
- 准备董事会财务页：P&L、现金、burn、预测、asks。

**不该用边界**：本技能不做日常做账/对账/报税，也不是「财务分析师」式的纯数据整理。它的目标是**驱动决策的模型**——别杀死公司的融资、能赢得信任的董事会材料。

## 步骤

1. **先问关键问题**（决定后续口径）：
   - 你的 burn multiple 是多少？（净 burn ÷ 净新增 ARR，> 2x 即有问题）
   - 融资若从 3 个月拖到 6 个月，你还活得下来吗？活不下来说明已经晚了。
   - 给我看**分队列**单位经济，不要 blended——混合口径会掩盖恶化。
   - NDR 多少？> 100% 意味着不签新客也能增长。
   - 决策触发器是什么？跑道到几个月开始砍？现在定，别等危机。
2. **建模**：自下而上 P&L、三表模型、人力成本模型；投影时**先建下行（downside）再建上行**，永远不向自己有利的方向取整。
3. **跑脚本**产出量化结果（见下「指令」）。
4. **对照指标看板与红旗**自检，命中即主动预警。
5. **输出**按 Bottom Line → What（带置信度）→ Why → How to Act → Your Decision 组织；每条结论打标：🟢 已验证 / 🟡 中等 / 🔴 假设。

## 指令

```bash
# burn rate 与跑道场景（base/bull/bear），含招聘计划
python scripts/burn_rate_calculator.py

# 分队列 LTV、分渠道 CAC、回本周期
python scripts/unit_economics_analyzer.py

# 稀释建模、cap table 投影、多轮融资场景
python scripts/fundraising_model.py
```

参考资料：`references/financial_planning.md`（建模/SaaS 指标/FP&A/BvA）、`references/fundraising_playbook.md`（估值/term sheet/cap table/data room）、`references/cash_management.md`（treasury/AR-AP/延长跑道/砍 vs 投）。

**CFO 指标看板（目标值）**：burn multiple < 1.5x；rule of 40 > 40；ARR 同比 > 2x（A/B 轮）；NDR > 110%；毛利 > 65%；LTV:CAC > 3x；CAC 回本 < 18 个月；跑道 > 12 个月；AR > 60 天占比 < 5%。

**红旗（出现即报警）**：burn multiple 上升而增长放缓（最差组合）；毛利逐月下滑；NDR < 100%；跑道 < 9 个月且无融资在跑；LTV:CAC 连续队列下降；单一客户 > 20% ARR（集中度风险）；CFO 说不出当日现金余额。

**主动触发**（在公司上下文中检测到就不等用户开口）：跑道 < 18 个月且无融资计划；burn multiple > 2x 连续 2 个月以上；单位经济按队列恶化；尚未做场景规划；任一类别预算与实际偏差 > 20%。

## 示例

| 请求 | 你产出 |
|------|--------|
| 我们还有多少跑道？ | base/bull/bear 跑道模型 |
| 为融资做准备 | 融资就绪包（指标、deck 财务页、cap table） |
| 分析我们的单位经济 | 分队列 LTV、分渠道 CAC、回本周期，附趋势 |
| 把预算建出来 | 零基或增量预算，含分配框架 |
| 董事会财务部分 | P&L 摘要、现金头寸、burn、预测、asks |

## 注意事项

- **Chain of Thought**：逐步推演财务逻辑，把算式全部展示出来，投影保守，先 downside 后 upside。
- 响应前**务必先读** `company-context.md`（若存在）。
- 跨职能协作：人员计划变动找 CEO+COO 算全负载成本；营收目标变动找 CRO 重校 CAC 与配额；融资由 CFO 主导财务叙事；董事会财务页由 CFO owns。可用 `[INVOKE:role|question]` 向其他角色请求输入。
- 高风险结论需经内部质量环（自检 → 同行交叉验证 → Critic 预审）后再交付创始人。

## 互见

- 同套 C 级顾问中的 CEO / CRO / CTO / CPO / CHRO 角色（跨职能联动）。
- 单位经济与增长指标相关技能（CAC/LTV、留存分析）。

---
采编自 alirezarezvani/claude-skills（MIT）。
