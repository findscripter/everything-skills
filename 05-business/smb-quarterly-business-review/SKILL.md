---
name: smb-quarterly-business-review
title: 小微企业季度经营回顾（QBR）
description: 当小微企业主/财务需要做季度经营回顾、把财务+销售+客户数据汇成一份可宣讲叙事时使用；拉取 QuickBooks 损益、PayPal 结算、HubSpot 成交数据，产出 500-800 字 QBR 叙事+3 机会+3 风险+可导出 PDF/deck；不适用于实时仪表盘、自动发布/群发或编造无数据指标。触发词：QBR、季度经营回顾、季度复盘、quarterly review、收入毛利趋势、季度财报会
domain: 商业/growth
triggers: [QBR, 季度经营回顾, 季度复盘, quarterly business review, quarterly review, 收入趋势, 毛利趋势, 客户健康, 季度机会与风险, 季度财报会, 小微企业季度回顾]
tags: [商业, growth, 小微企业, QBR, 季度回顾, 财务叙事, QuickBooks, HubSpot, 客户健康, 经营复盘]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [Read, WebFetch, Bash, QuickBooks 连接器, PayPal 连接器, HubSpot 连接器, PDF/演示导出工具]
requires: []
related: [smb-business-pulse, smb-cash-flow-forecast, smb-payroll-cash-planner, board-deck-builder]
combines_with: [smb-business-pulse, smb-cash-flow-forecast, board-deck-builder]
license: Apache-2.0
source: anthropics/knowledge-work-plugins
source_license: Apache-2.0
---
## 何时使用

当小微企业主或财务/运营负责人需要把**一个季度**的经营情况收成一份可对内/对外宣讲的「季度经营回顾（QBR）」时使用——拉取财务、销售、客户三路数据，合成一段叙事，再导出为演示就绪的 PDF 或 deck。

适用场景：季度财报会前的复盘材料、给合伙人/顾问/早期投资人的季度更新、自我经营盘点。

**不该用的边界：**
- 不用于实时经营仪表盘或日/周高频监控——QBR 是季度级别的回顾叙事。
- 不自动发布或群发——产物**必须先给主理人审阅**（见审批门）。
- 不用于编造指标：缺数据时显式标注缺口（如 `[PayPal 未连接]`），绝不臆造数字。
- 若 QuickBooks（或等价记账源）拿不到财务数据，**直接停止**——财务数据是 QBR 的地基。

## 步骤

解析调用参数：

- `--quarter`（默认上一个自然季度）——格式 `YYYY-QN`，如 `2026-Q1`。
- `--save-to`（默认 `files`）——`files`（云盘 Google Drive / OneDrive）、`desktop`（桌面）或 `both`。

按 6 步推进：

1. **财务表现（用 `business-pulse` 深度模式）**：拉本季 QuickBooks 损益（收入、COGS、毛利、运营费用、净利率）；与上一季、去年同季对比；拉同期 PayPal 结算交叉校验 QB 收入；算出收入增长 %、毛利变动点数、Top3 收入品类。
2. **客户健康**：拉 HubSpot 成交数据（新签客户、流失客户、平均客单、进入下季的管线）；可得则算 CAC 与单客户收入；标记任何占收入 >20% 的客户（**集中度风险**）。
3. **三大机会**（基于数据，须具体）：收入侧（加码哪个品类/客群/渠道）、毛利侧（砍哪项成本或涨哪个价）、客户侧（攻哪个客群或降哪类流失）。
4. **三大风险**：收入风险（集中度/趋势/季节性）、毛利风险（成本上升/定价压力）、运营风险（管线缺口/供应商依赖）。
5. **QBR 叙事**：写 500-800 字、平实商业英文（或中文）的叙事（结构见下）。
6. **导出**：生成 `qbr-{YYYY-QN}.pdf`（叙事+关键图表，无图表工具则用 ASCII 表格），按 `--save-to` 保存。

## 指令

**第 5 步 QBR 叙事固定结构（7 段）：**

1. 季度标题（一句话）
2. 收入故事（趋势 + 为什么）
3. 毛利故事（趋势 + 为什么）
4. 客户故事（健康度 + 管线）
5. 三大机会
6. 三大风险
7. 一段「下季应聚焦什么」的行动号召

**连接器失败处理（容错降级）：**

- **QuickBooks 不可达 → 停止**：QBR 以 QB 财务数据为地基，无之不做。
- **PayPal 缺失 → 跳过交叉校验**，在叙事注明「PayPal 未连接——收入仅以 QB 验证」。
- **HubSpot 缺失 → 跳过客户健康（第 2 步）**，注明「HubSpot 未连接——客户健康章节已跳过」。

**审批门（硬约束）：**

- **绝不自动发布或邮件群发 QBR**，永远先展示给主理人审阅。
- **任一数据源返回不完整数据时显式标记**，在叙事中注明缺口。

## 示例

调用：

```
/quarterly-review --quarter 2026-Q1 --save-to both
```

无图表工具时，财务摘要以 ASCII 表格呈现：

```
品类         | 本季收入 | 上季   | 同比     | 占比
-------------|---------|--------|---------|-----
咨询服务      | $86K    | $71K   | +21%    | 48%
零售          | $54K    | $58K   | -7%     | 30%
订阅          | $40K    | $33K   | +21%    | 22%
-------------|---------|--------|---------|-----
合计          | $180K   | $162K  | +11%    | 100%
```

机会/风险须落到具体抓手，例如：「机会-毛利：零售品类毛利仅 28%，将主力 SKU 提价 5% 预计回收 4 个毛利点」「风险-集中度：A 客户占收入 23%，续约期在下季，需提前锁定」。

## 注意事项

- **先地基后叙事**：财务（QB）→ 客户（HubSpot）→ 机会/风险 → 叙事 → 导出，顺序不可颠倒。
- 每条相对趋势/目标的差异都要**一句话给原因**，只摆数字不解释最无效。
- 机会和风险都要 **3 条且具体**（指明品类/客群/渠道/客户名），泛泛而谈等于没说。
- 缺数据用显式占位符，**永不臆造**；交叉校验（PayPal vs QB）有助于发现记账口径偏差。
- 输出时**先内联展示叙事**，再确认导出，最后以一段「下季聚焦」收尾。

## 互见

- related：`board-deck-builder` —— QBR 章节可直接喂入董事会/投资人 deck 的叙事。
- related：`variance-flux-commentary` —— 为损益差异生成逐条原因说明，补强「收入/毛利故事」。
- related：`cfo-financial-advisor` —— 把 QBR 结论延伸到单位经济、跑道与融资规划。
- combines_with：`customer-health-scorer` —— 量化第 2 步客户健康分与扩展机会，替代手工判断。
- combines_with：`churn-prevention` —— 把「客户侧风险/降流失」机会落成可执行动作。
- 源技能依赖：`business-pulse`（深度模式，负责拉取并核对 QB/PayPal 财务脉络），本仓库暂未收录，需时另行采编。

---

采编自 anthropics/knowledge-work-plugins（Apache-2.0）。
