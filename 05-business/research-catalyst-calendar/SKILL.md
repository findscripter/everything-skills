---
name: research-catalyst-calendar
title: 覆盖标的催化剂日历
description: 当需要为一篮子覆盖标的维护未来催化剂日历（财报日、行业会议、产品发布、监管裁决、宏观事件）以排期关注与提前布仓时使用；产出可排序的日历表（Excel）+ 每周前瞻纪要（Markdown），按影响级别红黄绿分色；不适用于单只股票一次性事件查询、已发生事件的事后归因、或脱离覆盖范围的全市场扫描；触发词：催化剂日历、catalyst calendar、财报日历、event calendar、upcoming events、催化剂追踪
domain: 商业/finance
triggers: [催化剂日历, catalyst calendar, 财报日历, earnings calendar, event calendar, upcoming events, 催化剂追踪, catalyst tracker, 事件日历, 每周前瞻, what's coming up, 近期事件]
tags: [finance, equity-research, catalyst, earnings-calendar, event-driven, weekly-preview, 卖方研究, positioning]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [excel, markdown, google-calendar]
requires: []
related: [earnings-preview-model, investment-thesis-tracker, morning-meeting-note, initiating-coverage-report]
combines_with: [earnings-preview-model, equity-earnings-update-report, investment-thesis-tracker]
license: Apache-2.0
source: anthropics/financial-services
source_license: Apache-2.0
---
# 覆盖标的催化剂日历

## 何时使用

为**一篮子覆盖标的**建立并维护「未来会发生什么」的事件日历，把分散在 IR、行业会议、监管、宏观日历里的催化剂归集成一张可排序、可分色的表，用于排期关注与在二元事件前提前布仓/对冲。核心特征：

- **范围**：一组标的（覆盖宇宙），按行业/板块聚焦，可选纳入宏观事件。
- **时间轴**：未来 2 周 / 1 个月 / 1 季度的前瞻视角。
- **产物**：Excel 日历主表 + 每周前瞻纪要（Markdown），按影响级别分色。

**不该用的边界：**

- 只查单只股票的某一个一次性事件（如「某公司下次财报哪天」）→ 直接查 IR 即可，不必建库。
- 对**已发生**事件做事后业绩归因/点评 → 用 `equity-earnings-update-report` 等点评类技能。
- 脱离覆盖范围的全市场无差别事件扫描 → 本技能服务于既定覆盖宇宙，先定宇宙再建日历。

## 步骤

五步流水线：定宇宙 → 采催化剂 → 建主表 → 周前瞻 → 出件。

**Step 1 定义覆盖宇宙**

- 列出追踪的公司（ticker 或名称）与行业/板块聚焦。
- 决定是否纳入宏观事件（FOMC、经济数据、监管截止日）。
- 设定时间轴（未来 2 周 / 1 月 / 1 季）。

**Step 2 逐标的采集催化剂**（联网取最新，训练记忆里的日期必然过时）

按四类穷举，每条记下确切日期/时段与来源：

- **财报与资本事件**：季度财报日及时段（盘前/盘后）、年度股东大会、投资者日/分析师日、资本市场日、债务到期/再融资日。
- **公司事件**：产品发布与公告、FDA 批准/监管裁决、合同续约/到期、并购里程碑（交割日、监管审批）、管理层更替、锁定期解禁（内部人交易窗口）。
- **行业事件**：重要会议（日期、哪些公司参会演讲）、展会、监管征求意见期/裁决、行业数据发布（月度销量、客流等）。
- **宏观事件**：FOMC 日、非农/CPI/GDP 发布、各国央行决议（ECB/BOJ 等）、有市场影响的地缘事件。

**Step 3 建立日历主表**（Excel，列可排序）

| Date | Event | Company/Sector | Type | Impact (H/M/L) | Our Positioning | Notes |
|------|-------|----------------|------|----------------|-----------------|-------|
| | | | Earnings/Corp/Industry/Macro | | Long/Short/Neutral | |

- `Type` 取 Earnings / Corp / Industry / Macro 四类之一。
- `Impact` 红黄绿分色：红=高影响、黄=中等、绿=常规。
- `Our Positioning` 记当前仓位方向（Long/Short/Neutral），便于一眼定位风险敞口。

**Step 4 每周前瞻**（Markdown 纪要）

每周生成一份前瞻，三段式：

1. **本周关键事件**：逐条「[周几]：[公司] Q[X] 财报 —— 一致预期 [$X EPS]、我们 [$X]、关注 [指标]」「[周几]：[事件] —— 为何影响 [标的]」「[周几]：[宏观数据] —— 预期与布仓」。
2. **下周预告**：对重要事件提前打招呼。
3. **仓位含义**：哪些事件可能撼动具体头寸、是否建议提前布仓、二元事件前的风控动作。

**Step 5 出件**

- Excel 工作簿：日历主表 + 可排序列。
- 每周前瞻邮件/纪要（Markdown）。
- 可选：同步到 Google Calendar。

## 指令

- **分色规则（强制）**：按 `Impact` 列对行分色——红=高影响（财报、FDA 裁决、二元监管）、黄=中等、绿=常规（例行月度数据）。
- **复发事件做模板**：月度行业数据等周期性催化剂，建模板自动填充，不要每月手敲。
- **归档已发生催化剂并记实际结果**：建一张历史归档表，记「预期 vs 实际 + 股价反应」，长期沉淀模式识别（哪些事件历史上真正驱动股价）。
- **会议参会名单是金矿**：记录哪些公司参会演讲、哪些反常缺席。

## 示例

每周前瞻纪要骨架（Step 4 输出）：

```markdown
## 本周关键事件
1. 周二：NKE Q2 财报（盘后）—— 一致预期 $0.78 EPS，我们 $0.82，关注 DTC 占比与中国区
2. 周三：FOMC 决议 —— 市场预期不变，关注点阵图，影响利率敏感持仓
3. 周四：行业月度销量数据 —— 预期 +3% YoY，利好 [标的]

## 下周预告
- 周一：XYZ 锁定期解禁，潜在供给压力

## 仓位含义
- NKE 二元财报前，将对冲仓位下调至 Neutral
- 利率敏感的 Long 头寸在 FOMC 前减半
```

日历主表填充示例：

```
Date        Event                     Company   Type      Impact  Positioning  Notes
2026-06-09  Q2 Earnings (post-mkt)    NKE       Earnings  H       Long         关注 DTC、中国
2026-06-10  FOMC 决议                  -         Macro     H       Neutral      点阵图
2026-06-12  月度行业销量               Sector    Industry  M       Long         模板自动填充
```

## 注意事项

- **财报日会变**：临近时务必对照公司 IR 页与 Bloomberg/FactSet 复核，不要用早期估计日。
- **预披露风险**：单列标记有预披露历史（无论利好利空）的公司，避免被未排期的预告打乱布仓。
- **凭记忆是大忌**：训练数据里的事件日期几乎都过时，所有日期须以最新联网来源/IR 为准。
- **会议缺席信号**：参会名单里反常缺席的公司值得关注，可能暗含信息。
- **归档驱动复盘**：坚持记录「预期 vs 实际结果」，否则日历只是排期工具，无法沉淀对哪些催化剂真正有效的判断。

## 互见

- related：`equity-earnings-update-report` —— 日历到点后，对触发的财报催化剂下钻出点评报告。
- related：`competitive-intel-tracker` —— 竞品/同业的产品发布与监管事件可直接喂入本日历。
- related：`variance-flux-commentary` / `market-sizing-analyst` —— 校准事件的影响级别与分部增长假设。
- combines_with：`equity-earnings-update-report` —— 日历排期 + 财报点评构成「事前布仓→事后归因」闭环。
- combines_with：`data-storyteller` —— 把每周前瞻讲成有说服力的图文叙事。
- combines_with：`board-deck-builder` —— 把催化剂前瞻压缩成投委会/董事会决策页。

---
采编自 anthropics/financial-services（Apache-2.0）。
