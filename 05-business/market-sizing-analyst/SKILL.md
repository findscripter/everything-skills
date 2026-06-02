---
name: market-sizing-analyst
title: 市场规模测算（TAM/SAM/SOM）
description: 当为新业务/创业项目估算市场机会、给投资人或商业计划做市场规模论证时使用；用自顶向下、自底向上、价值理论三法算出 TAM/SAM/SOM 并交叉验证、附来源与假设；不适用于真实数据抓取、竞品财务尽调或最终事实背书；触发词：市场规模、TAM、SAM、SOM、市场容量、可触达市场、market sizing、addressable market。
domain: 商业/growth
triggers: [市场规模, TAM, SAM, SOM, 市场容量, 可触达市场, market sizing, addressable market]
tags: [market-sizing, tam-sam-som, business, growth, startup, fundraising]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [market-sizing-tam-sam-som, competitive-analysis, startup-financial-modeler, international-expansion-strategy]
combines_with: [competitive-analysis, startup-financial-modeler, board-deck-builder]
license: MIT
source: wshobson/agents
source_license: MIT
---
## 何时使用

- 给新业务/创业项目估算市场机会，需要算出 TAM（总可触达市场）/SAM（可服务市场）/SOM（可获得市场）。
- 为融资路演、商业计划书或战略选品准备"投资人级"市场规模论证。
- 需要交叉验证一个已有的市场规模数字是否站得住脚（自顶向下 vs 自底向上）。
- 触发词：市场规模、TAM、SAM、SOM、市场容量、可触达市场、market sizing、addressable market。

不该用的边界：
- 不负责真实抓取行业报告、政府数据或竞品财报——本技能给方法、公式与结构，数据需用户提供或另行检索。
- 不做竞品财务尽调、估值或 M&A 分析。
- 不对引用的市场数字做最终事实背书；所有外部数据/断言交 `fact-checking` 核验。
- 不替代真实客户访谈与定价调研（价值理论法依赖这些一手输入）。

## 步骤 / 指令

输入：`problem`（要解决的问题）、`customers`（目标客户与门槛）、`category`（产品/服务品类）、`geography`（地域）、`horizon`（一般 3-5 年）、可选 `pricing`/`segments[]`。

```
1. 定义市场
   - 回答五问：解决什么问题 / 谁是客户 / 什么品类 / 什么地域 / 什么时间窗。
   - 写成一句可证伪的市场定义，避免"整个行业都是我的市场"。

2. 选方法（可多选，至少 2 法交叉）
   - 自顶向下 Top-Down：成熟市场、有现成研报时。从品类总盘往下切。
   - 自底向上 Bottom-Up：B2B/细分/新市场。从客户数 × 单客年收入往上加。投资人最认这条。
   - 价值理论 Value Theory：全新品类/颠覆式创新、无现成市场时。从"问题成本 × 解决比例 × 付费意愿"推。

3. 算 TAM（按所选方法套公式）
   Top-Down:   TAM = 品类总规模（注明来源与年份）
   Bottom-Up:  TAM = Σ(细分客户数 × 单客年收入/ACV)
   Value:      单客价值 = 问题成本 × 可解决比例
               单客定价 = 单客价值 × 付费意愿%(通常 10-30%)
               TAM = 可触达客户数 × 单客定价

4. 算 SAM = TAM × (同时满足全部过滤条件的比例)
   过滤维度：地域 / 产品能力 / 客户门槛(规模·行业·用例) / 渠道可达 / 合规限制。
   逐个相乘，例：SAM = TAM × 地域% × 品类% × 能力%

5. 算 SOM = SAM × 现实可夺取份额
   新进入者 3-5 年通常 2-5%；保守做法：
   SOM(第3年)=SAM×2%   SOM(第5年)=SAM×5%

6. 验证与三角校准（必做）
   - 自顶向下与自底向上结果应落在 30% 以内。
   - 用赛道内上市公司分部营收对照（10-K / 财报）。
   - 客户数、定价、份额逐项做 sanity check。
   - 红旗：TAM 过小(VC 项目 < $1B) / TAM 过大无数据支撑 / SOM 过激(5 年 > 10%) / 两法差异 > 50%。

7. 标注与交付
   - 每个数字附：来源、年份、地域口径、所做调整。外部数据标 [需核查] 交 fact-checking。
   - 对投资人：先讲自底向上(最可信)，再用自顶向下三角验证，点出保守假设并接到收入预测。
```

行业速查公式：

```
SaaS:      TAM = 目标公司数 × 平均 ACV × (1 + 扩张率)
平台/Marketplace: TAM = 品类 GMV × 预期抽成率(take rate)
消费/C 端:  TAM = 总用户数 × ARPU × 年购买频次
B2B 服务:  TAM = 目标公司数 × 平均单值 × 年成交次数
```

## 示例

B2B SaaS（AI 邮件营销，面向电商）自底向上：

```
分层(北美):
  小型电商  $1M-$5M  : 85,000 家 × $3,600  = $306M
  中型电商  $5M-$50M : 18,000 家 × $9,600  = $173M
  企业电商  $50M+    :  2,500 家 × $24,000 = $60M
  -----------------------------------------------
  TAM(北美) = $539M    全球 = $539M / 0.35 ≈ $1.54B

SAM 过滤:
  $539M × 0.45(AI-ready) × 0.70(可切换存量) = $169M

SOM:
  第3年 = $169M × 2.5% = $4.2M ARR
  第5年 = $169M × 5.0% = $8.5M ARR

三角验证(自顶向下 Gartner 口径): TAM $488M / SAM $171M
  → SAM 差异仅 1%，对照 Klaviyo 营收(~$700M)印证市场真实存在。
```

## 注意事项

- 别把 TAM 当 SAM：必须套上真实的产品/地域/客户过滤，诚实写出可服务部分。
- SOM 别冒进：新进入者 5 年内极少拿到 > 5% 份额，要给出可信的爬坡时间线。
- 别只用自顶向下：投资人偏好自底向上验证，单用 Top-Down 缺可信度，永远多法三角。
- 别挑数据(cherry-pick)：用一致、近 2 年内的口径，混用方法要说明，所有假设写明。
- 别忽略市场动态：纳入增长/衰退、竞争强度、切换成本与壁垒。
- 数据卫生：发布者+报告名+日期+地域口径缺一不可；统计数字、研报引用、"研究表明"一律标 [需核查] 交 fact-checking，本技能不自行担保事实。
- 单一职责：只给方法、公式、结构与校准逻辑，不抓数、不背书、不做估值。

## 互见

- related：`first-principles-thinking` —— 价值理论法与"问题成本→付费意愿"推导本质是第一性原理拆解，无现成市场时配合使用。
- related：`fact-checking` —— 所有外部市场数字、研报引用、竞品营收须经其核验。
- related：`markdown-to-docx` —— 把测算结论与投资人页转为可交付的 Word 文档/路演材料。

---
本条采编自 wshobson/agents（MIT 许可）。
