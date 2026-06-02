---
name: market-sizing-tam-sam-som
title: 市场规模 TAM/SAM/SOM 测算
description: 当为创业/新业务做市场规模论证、给投资人或商业计划估算 TAM/SAM/SOM、或交叉验证一个已有市场规模数字时使用；按自顶向下/自底向上/价值理论三法套公式算出三层市场、配数据源清单与三角校准、按受众组织呈现；不适用于真实抓数、竞品财务尽调、估值或事实背书；触发词：市场规模、TAM、SAM、SOM、可触达市场、market sizing、addressable market
domain: 商业/finance
triggers: [市场规模, TAM, SAM, SOM, 市场容量, 可触达市场, market sizing, addressable market, 可服务市场]
tags: [market-sizing, tam-sam-som, business, growth, startup, fundraising, methodology]
level: 进阶
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [market-sizing-analyst, competitive-analysis, startup-financial-modeler, international-expansion-strategy]
combines_with: [competitive-analysis, startup-financial-modeler, board-deck-builder]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

- 为创业/新业务估算市场机会，需要算出 TAM（总可触达市场）/SAM（可服务市场）/SOM（可获得市场）三层。
- 为融资路演、商业计划书或战略选品准备"投资人级"市场规模论证，需要方法、公式、数据源与呈现结构。
- 交叉验证一个已有市场规模数字是否站得住脚（自顶向下 vs 自底向上三角校准）。
- 触发词：市场规模、TAM、SAM、SOM、市场容量、可触达市场、market sizing、addressable market。

不该用的边界：
- 不负责真实抓取行业研报、政府数据、竞品财报——本技能给方法/公式/结构与数据源**线索**，数据需用户提供或另行检索。
- 不做竞品财务尽调、公司估值或 M&A 分析。
- 不对引用的市场数字做最终事实背书；外部数据与"研究表明"类断言一律标 [需核查] 交 `fact-checking`。
- 不替代真实客户访谈与定价调研（价值理论法依赖这些一手输入）。

## 步骤 / 指令

输入：`problem`（要解决的问题）、`customers`（目标客户与门槛）、`category`（产品/服务品类）、`geography`（地域）、`horizon`（一般 3-5 年）、可选 `pricing`/`segments[]`。

```
1. 定义市场（五问）
   解决什么问题 / 谁是客户 / 什么品类 / 什么地域 / 什么时间窗。
   写成一句可证伪的市场定义，避免"整个行业都是我的市场"。

2. 选方法（至少 2 法交叉）
   Top-Down 自顶向下 : 成熟市场、有现成研报。从品类总盘往下切。快、可信、验证市场存在；新品类易高估。
   Bottom-Up 自底向上: B2B/细分/新市场。从客户数 × 单客年收入往上加。投资人最认；需详尽客户调研、耗时。
   Value 价值理论    : 全新品类/颠覆式创新、无现成市场。从问题成本×解决比例×付费意愿推；展示价值创造但假设多、难验证。

3. 算 TAM
   Top-Down:   TAM = 品类总规模（注明来源与年份，必要时套增长率，多源校验）
   Bottom-Up:  TAM = Σ(细分客户数 × 单客年收入/ACV)
   Value:      单客价值 = 问题成本 × 可解决比例
               单客定价 = 单客价值 × 付费意愿%(通常 10-30%)
               TAM      = 可触达客户数 × 单客定价

4. 算 SAM = TAM × (同时满足全部过滤条件的比例)
   过滤维度：地域 / 产品能力 / 客户门槛(规模·行业·用例) / 渠道可达 / 合规限制。
   逐个相乘，例：SAM = TAM × 地域% × 品类% × 能力%

5. 算 SOM = SAM × 现实可夺取份额
   新进入者 3-5 年通常 2-5%；保守做法：
   SOM(第3年)=SAM×2%   SOM(第5年)=SAM×5%

6. 验证与三角校准（必做）
   - 自顶向下与自底向上结果应落在 30% 以内。
   - 用赛道内上市公司分部营收对照(10-K/财报)，sanity-check 客户数、定价、份额假设。
   - 红旗：TAM 过小(VC 项目 < $1B) / TAM 过大无数据支撑 / SOM 过激(5 年 > 10%) / 两法差异 > 50%。

7. 标注与交付
   每个数字附：发布者+报告名+年份+地域口径+所做调整。外部数据标 [需核查]。
```

数据源速查：
```
Top-Down  : Gartner / Forrester / IDC、政府统计(Census/BLS/行业协会)、上市公司财报、Statista / CB Insights / PitchBook
Bottom-Up : 客户访谈与问卷、销售/CRM 数据、LinkedIn / ZoomInfo / Crunchbase、竞品情报、学术研究
Value     : 客户问题量化、时间/成本研究、ROI 案例、定价与付费意愿(WTP)调研
```

行业速查公式：
```
SaaS:             TAM = 目标公司数 × 平均 ACV × (1 + 扩张率)
平台/Marketplace: TAM = 品类 GMV × 预期抽成率(take rate)
消费/C 端:        TAM = 总用户数 × ARPU × 年购买频次
B2B 服务:         TAM = 目标公司数 × 平均单值 × 年成交次数
```

呈现结构（按受众组织）：
```
对投资人: 市场定义+问题域 → TAM/SAM/SOM 及方法 → 数据源与假设 → 增长预测与驱动 → 竞争格局
          要点：先讲自底向上(最可信)，再用自顶向下三角验证，点出保守假设并接到收入预测。
对战略:   可触达分层 → 按机会量排序 → 分层进入策略 → 渗透时间线 → 资源需求
          要点：聚焦 SAM/SOM，下钻分层细节，接到 GTM 计划。
```

## 示例

B2B SaaS（AI 邮件营销，面向北美电商）自顶向下 SAM 拆解：
```
TAM        : $10B 全球邮件营销
× 0.40 地域 : 北美
× 0.30 品类 : 电商聚焦
× 0.60 能力 : 需 AI 功能
SAM = $10B × 0.40 × 0.30 × 0.60 = $720M

SOM:
  第3年 = $720M × 2% = $14.4M
  第5年 = $720M × 5% = $36M

三角验证: 与自底向上结果应落在 30% 以内；对照赛道上市公司营收印证市场真实存在。
```

## 注意事项

- 别把 TAM 当 SAM：必须套上真实的产品/地域/客户过滤，诚实写出可服务部分。
- SOM 别冒进：新进入者 5 年内极少拿到 > 5% 份额，要给可信的爬坡时间线。
- 别只用自顶向下：单用缺可信度，投资人偏好自底向上验证，永远多法三角。
- 别挑数据(cherry-pick)：用一致、近 2 年内的口径，混用方法须说明，所有假设写明。
- 别忽略市场动态：纳入增长/衰退、竞争强度、切换成本与壁垒。
- 数据卫生：统计数字、研报引用、"研究表明"一律标 [需核查] 交 `fact-checking`，本技能不自行担保事实。
- 单一职责：只给方法、公式、数据源线索、校准与呈现逻辑，不抓数、不背书、不估值。

## 互见

- related：`market-sizing-analyst` —— 同主题的另一版测算指南，可对照其示例与算法细节互补。
- related：`first-principles-thinking` —— 价值理论法的"问题成本→付费意愿"推导本质是第一性原理拆解，无现成市场时配合。
- related：`fact-checking` —— 所有外部市场数字、研报引用、竞品营收须经其核验。
- related：`competitive-analysis` —— SOM 的现实份额与竞争格局判断依赖竞品分析输入。
- combines_with：`startup-financial-modeler` —— 把 TAM/SAM/SOM 接入收入预测与财务模型。
- combines_with：`board-deck-builder` —— 把测算结论转为投资人/董事会路演页。

---
本条采编自 sickn33/antigravity-awesome-skills（MIT 许可）。
