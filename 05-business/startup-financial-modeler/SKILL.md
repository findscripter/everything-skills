---
name: startup-financial-modeler
title: 创业财务模型构建
description: 当为种子轮/A 轮早期创业公司构建 3-5 年财务模型、做融资测算或准备投资人级财务时使用；做基于队列的收入预测、成本结构、现金流/烧钱跑道、三情景分析与单位经济测算，产出可交付的财务模型与假设；不适用于上市公司估值建模、做账报税或自动抓取行业基准数据；触发词：财务模型、收入预测、烧钱率、现金跑道、融资测算、financial model、burn rate、runway、ARR、CAC LTV
domain: 商业/finance
triggers: [财务模型, 收入预测, 烧钱率, 现金跑道, 融资测算, financial model, burn rate, runway, ARR, CAC LTV]
tags: [finance, startup, fundraising, saas, business]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [cfo-financial-advisor, board-deck-builder, market-sizing-analyst, board-meeting-prep]
combines_with: [cfo-financial-advisor, board-deck-builder, market-sizing-analyst]
license: MIT
source: wshobson/agents
source_license: MIT
---
## 何时使用

- 为种子轮 / Series A 早期创业公司构建 3-5 年财务模型：收入预测、成本结构、现金流、情景规划。
- 计算烧钱率（burn rate）与现金跑道（runway），或为董事会 / 投资人准备可交付财务。
- 对融资轮做测算：投前估值、稀释、资金用途（use of funds）、里程碑规划。
- 触发词：财务模型、收入预测、烧钱率、现金跑道、融资测算、financial model、burn rate、runway、ARR、CAC LTV。

不该用的边界：

- 不做上市公司 / 成熟企业的 DCF 估值建模、二级市场分析。
- 不替代会计做账、报税与合规审计。
- 不自动抓取真实行业基准或可比公司数据——基准只给经验区间，具体数字需人工核实。
- 没有明确商业模式（SaaS / 市场 / 电商 / 服务）与定价前，先补齐输入再建模。

## 步骤 / 指令

输入：`business_model`（saas / marketplace / ecommerce / services）、`pricing`、`starting_cash`、`current_headcount`、可选 `fundraise`（金额、投前估值）。

```
1. 定义商业模式与收入驱动
   - SaaS：订阅档位、年/月合同、免费试用/freemium、扩张收入策略。
   - 市场(Marketplace)：GMV、take rate(%)、买卖双方经济性、交易频次。
   - 交易型：交易量 × 单笔收入 × 频次/季节性。

2. 构建队列(cohort)收入预测（精度核心）
   - 逐月定义新增客户；为每个队列建留存曲线。
   - 典型 SaaS 留存：M1=100% / M3=90% / M6=85% / M12=75% / M24=70%。
   - 每队列每月 = 留存客户数 × ARPU。
   - 公式：MRR = Σ(队列规模 × 留存率 × ARPU)；ARR = MRR × 12。

3. 建模成本结构（按类别 + 行为拆分）
   - 四类：COGS（托管/支付手续费/可变支持/按客户的三方服务）、
     S&M（CAC/广告/销售薪酬/工具）、R&D（工程/产品/设计/工具）、
     G&A（高管/财法人/办公/保险合规）。
   - 固定(薪资/软件/租金) vs 可变(托管/支付/支持)分开。
   - 缩放假设：COGS/S&M 占收入 %、R&D 增速、G&A 占总费用 %。

4. 制定招聘计划（按角色/部门）
   - 输入：起始人数、各角色招聘节奏、全负荷薪酬、税费福利(通常 1.3-1.4×薪资)。
   - 例：工程师 $150K×1.35=$202K；销售 $100K OTE×1.30=$130K。
   - 早期 SaaS 部门占比参考：工程 40-50% / S&M 25-35% / G&A 10-15% / CS 5-10%。

5. 投影现金流与跑道
   - 期初现金 + 收款(考虑账期) - 运营支出 - CapEx = 期末现金。
   - Runway = 当前现金 / 月净烧钱；月净烧钱 = 月收入 - 月支出。
   - 若期末现金<0：资金缺口=负余额，Runway=0。

6. 计算关键指标
   - 收入：MRR/ARR、MoM/YoY 增速。
   - 单位经济：CAC、LTV、CAC 回收期、LTV/CAC。
   - 效率：烧钱倍数(Net Burn/Net New ARR)、Magic Number、Rule of 40。

7. 三情景分析（保守 P10 / 基准 P50 / 乐观 P90）
   - 可变假设：获客 ±30%、流失 ±20%、合同额 ±15%、CAC ±25%。
   - 固定假设：定价结构、核心运营支出、招聘计划(只调时点不调角色)。
   - 保守=现金管理，基准=董事会汇报，乐观=上行规划。

8. 验证假设（见"注意事项"清单）并整合融资。
   - 时间跨度：Y1/Y2 逐月、Y3 逐季，Y4-5 仅年度关键指标。
```

## 示例

SaaS 收入轨迹（基准情景）：

```
Year 1: $500K ARR, 50 客户, 12月 MRR $100K
Year 2: $2.5M ARR, 200 客户, 12月 MRR $208K
Year 3: $8M ARR, 600 客户, 12月 MRR $667K
```

融资与资金用途测算：

```
募资：$5M @ 投前估值 $20M
Post-Money = Pre-Money + Investment = $25M
Dilution = Investment / Post-Money = 20%

资金用途：
- 产品研发      $2M (40%)
- 销售与市场    $2M (40%)
- G&A 与运营    $0.5M (10%)
- 营运资金      $0.5M (10%)

定融资金额原则：覆盖到达下一个里程碑(如首个 $1M ARR / Series A)
所需跑道 + 6 个月缓冲。
```

## 注意事项

- 收入别太乐观：早期创业极少达成激进目标，用保守获客假设、建模真实流失。
- 别低估成本：费用估算加 20% 缓冲，薪酬按全负荷计，软件/工具别漏。
- 现金 ≠ 收入：账期使收款滞后、支出先于收款，需单独建模现金转换。
- 招聘不是瞬时：补位 3-6 个月、产能爬坡 3-6 个月，年流失按 10-15% 计。
- 永远做情景：单一情景必不准；务必有保守案，并预案"基准失败怎么办"。
- 模型校验清单（逐项打勾）：
  - 收入增速可达（Y2 约 3×、Y3 约 2×）
  - 单位经济合理（LTV/CAC > 3，回收 < 18 月）
  - 烧钱倍数合理（Y2-3 < 2.0）
  - 人效随收入提升（revenue/employee 增长）
  - 毛利匹配商业模式（SaaS 75-85% / 市场 60-70% 贡献毛利 / 电商 40-60%）
  - S&M 投入与 CAC、增长目标对齐
- 基准区间只是经验值，对外披露的具体数字与可比公司须人工核实，并请顾问/投资人对假设给反馈。

## 互见

- requires：无。
- related：无（本库暂无直接相关技能）。
- combines_with：无。

---
本条采编自 wshobson/agents（MIT）。
