---
name: carrier-relationship-management
title: 承运商关系管理
description: 当管理承运商网络、运价谈判、跑货运招标(RFP)、做承运商绩效记分卡与运力分配时使用；产出运价分项谈判方案、KPI记分卡、路由指南、合同vs现货决策与FMCSA合规清单；不适用于个人快递/小件物流、仓储WMS或非货运采购。触发词：承运商关系管理、carrier management、货运招标、freight RFP、运价谈判、燃油附加费FSC、承运商记分卡、scorecard、路由指南、routing guide、tender acceptance、FMCSA合规、现货vs合同运价
domain: 领域/fintech
triggers: [承运商关系管理, carrier management, 货运招标, freight RFP, 运价谈判, 燃油附加费FSC, 承运商记分卡, scorecard, 路由指南, routing guide, tender acceptance, FMCSA合规, 现货vs合同运价]
tags: [fintech, logistics, freight, carrier-management, rfp, procurement, scorecard, negotiation, supply-chain]
level: 精通
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: [TMS运输管理系统, DAT RateView, Greenscreens, FMCSA SAFER, Carrier411, 费率管理平台]
requires: []
related: [customs-trade-compliance, returns-reverse-logistics, inventory-demand-planning]
combines_with: [customs-trade-compliance, inventory-demand-planning]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## 何时使用

当任务是**设计或调优承运商组合、路由指南与货运采购策略**时使用，典型场景：

- 跑货运招标（RFP）、重谈合同运价与燃油附加费表、平衡现货 vs 合同运价敞口。
- 搭建承运商记分卡、退出标准、升级协议，管理绩效与风险。
- 在自有运力承运商（asset carrier）、货代/经纪（broker）、区域专线之间分配车道，兼顾服务与物流成本。

**不该用的边界**：
- 不适用于个人快递、小件电商物流、仓储 WMS、非货运类采购谈判。
- 输出不能替代环境内的实际验证、测试或专家复核；缺少必要输入（数据、权限、安全边界、成功标准）时应停下来追问。

## 步骤

1. **拆解运价分项**：base linehaul、FSC、accessorial、minimum charge、合同/现货分别单独谈，捆绑只会掩盖溢价点。
2. **建记分卡（只盯 5 个核心指标）**：OTD、tender acceptance、claims ratio、invoice accuracy、tender-to-pickup time，各设 target 与 red flag。
3. **设计组合与路由指南**：按车道量定 3 层路由（primary/secondary/tertiary），控制单一承运商在任一车道占比 ≤40%。
4. **跑 RFP（8–12 周）**：pre-RFP 数据分析 → 逐车道竞价设计 → 加权评标（不唯价格）→ 分波次授标 + 30 天并行切换。
5. **市场情报佐证**：DAT 看市场方向、Greenscreens 看承运商专属谈判筹码；盯 load-to-truck ratio、OTRI 判断周期。
6. **合规筛查**：每个承运商首单前 + 每季度复查 FMCSA 运营授权、保险、安全评级、broker bond。
7. **持续治理**：触发升级阈值即按协议行动；纠正措施失败后按退出标准移除承运商。

## 指令

**运价分项关键约束**：
- LTL 折扣通常为公布运价的 70–85% off（中量货主）；逐车道谈，不可一刀切。
- FSC 要谈整张表：base price trigger（0% FSC 对应油价）、increment（如每涨 $0.05 柴油 +$0.01/mile）、index lag（周/月调整）。务必在 $3.50/$4.00/$4.50 多个油价点建模总成本，识破「低 linehaul + 激进 FSC」陷阱。
- Detention 标准为 2 小时免费后 $50–$100/hr；detention 是承运商账单争议第一来源，免费时长要狠谈。
- 健康组合：合同货 75–85% + 现货 15–25%；现货 >30% 说明路由指南失效。

**记分卡阈值（target / red flag）**：
- OTD ≥95% / <90%（pickup 与 delivery 分开测）
- Tender acceptance ≥90% / <80%（合同车道 <75% 说明运价低于市场，重谈或重分配）
- Claims ratio <0.5% of spend / >1.0%（频次与严重度分开看）
- Invoice accuracy ≥97% / <93%（<90% 应进入纠正措施）

**组合策略基准**：asset 60–70% / broker 20–30% / 专线 5–15%；量大车道（>2 loads/week）建 3 层路由，量小用 2 层或区域 broker。

**RFP 评标加权**：cost 40–50% + service history 25–30% + capacity commitment 15–20% + operational fit 10–15%。

**FMCSA 合规底线**：
- 验证 active MC/FF 授权（看「authorized for」字段）。
- 保险一律要求 ≥$1M（FMCSA 最低 $750K 不够；hazmat $1M、HHG $5M）；通过 FMCSA Insurance tab 验真，别只信承运商给的证书。
- 绝不用 Unsatisfactory 评级；unrated 看 CSA BASIC（Unsafe Driving、HOS、Vehicle Maintenance）。
- 用 broker 须核验 $75K surety bond 有效 + contingent cargo insurance。

**退出标准（纠正措施失败后任一触发即移除）**：OTD <85%/60 天；tender acceptance <70%/30 天且无沟通；claims >2%/90 天;FMCSA 授权吊销/保险失效/评级降为 Unsatisfactory；invoice accuracy <88%/90 天；发现 double-brokering；财务困境证据（bond 吊销、Carrier411 投诉激增）。

**自动升级触发（节选）**：tender acceptance <70% 持续 2 周 → 48h 内通知采购并约谈；FMCSA 授权/保险失效 → 1h 内立即暂停派单；确认 double-brokering → 2h 内立即停用 + 合规审查。升级链：分析员 → 运输经理(48h) → 运输总监(1 周) → 供应链 VP（持续问题或敞口 >$100K）。

## 示例

**运价谈判开场（用数据，不下命令）**：
> 「DAT 显示这条车道近 90 天均价 $2.15/mile，我们当前合同是 $2.45，想和您聊聊如何对齐。」
> 切忌说「你的价太高」，改说「市场已变化，我们想确保双方都保持有竞争力」。

**纠正性绩效评审**：先摆记分卡数据而非指责 → 指出低于阈值的具体指标 → 要求 30/60/90 天纠正计划 → 给明确后果：「若该车道 OTD 在第 60 天未达 92%，我们将把 50% 货量转给备用承运商。」

**边界判断 — FSC 操纵**：承运商报「人为压低 base + 激进 FSC 表」，在 $3.50/$4.00/$4.50 三个油价点跑总成本，揭示其实际高于市场。

## 注意事项

- **运力松时怎么对承运商，决定运力紧时它们是否愿意接你的货**——别只盯短期降本。
- 经纪货引入交易对手风险（double-brokering、运力质量波动、付款链复杂），合规与保险链必须验真。
- detention 占某承运商总账单 >5% 时，根因通常是**货主场站作业问题**而非承运商乱收费，先修作业再谈费用，否则会失去承运商。
- 量丢失（如失去大客户、货量骤降 40%）后要**主动重谈**合同，让承运商在结算时才发现缺口会摧毁信任。
- 别在周期波峰/波谷授标，选周期过渡期拿到更真实的运价。

## 互见

- first-principles-thinking：拆解运价分项、识破捆绑报价时的第一性原理分析。
- sql-query-builder：从 12 个月 shipment 数据中按车道做量/花费/服务分析（pre-RFP）时构建查询。
- csv-data-cleaner：清洗承运商账单、记分卡原始数据。

---
本条采编自 sickn33/antigravity-awesome-skills（MIT），适配重写为中文「技能大典」条目。
